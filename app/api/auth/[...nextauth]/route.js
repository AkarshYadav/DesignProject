import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import connect from "../../../../libs/mongodb/mongoose";
import User from "../../../../libs/models/user.model"
import bcrypt from "bcrypt";

const authOptions = {
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
        connect();

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
          name: user.username,
          email: user.email
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };