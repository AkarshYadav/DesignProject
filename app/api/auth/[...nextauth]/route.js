import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import connect from "../../../../lib/mongodb/mongoose";
import User from "../../../../lib/models/user.model"
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Username",
          type: "email_address",
          placeholder: "Enter your username",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connect();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          console.log("User not found");
          return null;
        }

        const isPasswordMatched = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordMatched) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.collegeId,
          email: user.email
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connect();

        // Check if user exists
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser && account.provider !== 'credentials') {
          // Create new user for OAuth providers
          // Generate collegeId from email
          const collegeId = user.email.split('@')[0];
          
          await User.create({
            email: user.email,
            password: await bcrypt.hash(Math.random().toString(36), 10),
            collegeId: collegeId,
            createdClasses: [],
            enrolledIn: []
          });
        }
        
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session?.user) {
        const user = await User.findOne({ email: session.user.email });
        if (user) {
          session.user.id = user._id.toString();
          session.user.collegeId = user.collegeId;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };