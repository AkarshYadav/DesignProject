"use client";
import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import Image from "next/image";
const SignUp = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const handleUserRegister = async () => {
    setLoading(true);
    if (!email || !password) {
      toast.error("Please provide complete details");
      setLoading(false);
      return;
    }

    // Validate email format for college domain
    // if (!email.endsWith('@iiitvadodara.ac.in')) {
    //   toast.error("Please use your college email address (@iiitvadodara.ac.in)");
    //   setLoading(false);
    //   return;
    // }

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const response = await axios.post("/api/auth/register", formData);
      
      if (response.data.user) {
        toast.success("Registration successful!");
        setEmail("");
        setPassword("");
        setLoading(false);
        router.push("/signin");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed, please try again.";
      toast.error(errorMessage);
      setLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 fixed top-0 left-0 w-full">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
      <div className="flex justify-center mb-4">
            <Image
              src="/pinsearch.svg"
              alt="Pinsearch Svg"
              height={100}
              width={100}
              priority
              className="w-13 h-13"
            />
          </div>
        <h2 className="text-center text-2xl font-semibold mb-1">
         AttendEase 
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Register with your college email
        </p>

        <input
          type="email"
          placeholder="College Email Address"
          className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

       

        <button
          onClick={handleUserRegister}
          className="w-full p-3 bg-blue-500 text-white rounded-lg mb-4 hover:bg-blue-600 transition-all duration-300"
        >
          {loading ? <ClipLoader color={"#fff"} size={20} /> : "Register"}
        </button>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="h-px bg-gray-300 w-full"></div>
          <p className="text-gray-500">OR</p>
          <div className="h-px bg-gray-300 w-full"></div>
        </div>
        <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full p-3 bg-black text-white rounded-lg flex justify-center items-center space-x-2 mb-3 hover:bg-[#111]"
          >
            <Image
              src="/github2.svg"
              alt="Github"
              width={150}
              height={150}
              priority
              className="w-6 h-6"
            />
            <span className="font-semibold">Continue with Github</span>
          </button>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full p-3 bg-white text-black rounded-lg flex justify-center items-center space-x-2 mb-3 hover:bg-gray-100"
          >
            <Image
              src="/google.svg"
              alt="Github"
              width={150}
              height={150}
              priority
              className="w-6 h-6"
            />
            <span className="font-semibold">Continue with Google</span>
          </button>
      

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;