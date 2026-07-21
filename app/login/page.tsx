"use client";
import { Button } from "@/components/ui/button";
import { useAuthControllerSignInMutation } from "@/Redux/Services/authApiService";
import { AtSignIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { setAccessTokenCookie } from "@/state/accessCookies";
import { setTokens } from "@/state/slices/tokenSlice";

import { useDispatch } from "react-redux";

export default function LoginPage() {
  const dispatch = useDispatch();
  const id = useId();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const [signIn] = useAuthControllerSignInMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const credentials = await signIn({
        signInDto: {
          username: username,
          password: password,
        },
      }).unwrap();

      if (credentials.response.code !== 200) {
        throw new Error(credentials.response.message);
      }

      if (
        credentials.response.body.userType === 3 ||
        credentials.response.body.userType === undefined
      ) {
        throw new Error("You are not authorized to access this application.");
      }

      const accessToken = credentials.response.body.accessToken;

      setAccessTokenCookie(accessToken);
      dispatch(
        setTokens({
          accessToken: accessToken,
        })
      );
      router.push("/dashboard");
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden">
      {/* Left side - Image */}
      <div className="relative w-full md:w-1/2 h-[40vh] md:h-full">
        <Image
          src="/imagelogin.png"
          alt="warehouse"
          fill
          className="object-cover"
        />
      </div>

      {/* Right side - Login form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 mb-20">
        {/* Logo */}
        <div className="mb-4">
          <Image
            src="/logo-black.png"
            alt="logo"
            width={250}
            height={100}
            className="mx-auto"
            priority
            onError={() => console.error("Image failed to load")}
          />
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-6">
          <p className="text-2xl md:text-3xl font-bold">Welcome Back!</p>
          <p className="text-sm text-[#495057] mt-1">
            Please enter your account details
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full max-w-[400px]">
          {/* Error Message */}
          {errorMessage && (
            <div className="text-red-500 text-sm mb-4 text-center">
              {errorMessage}
            </div>
          )}

          {/* Username Input */}
          <div className="w-full mb-4">
            <p className="mb-1 text-left text-[15px]">Username</p>
            <div className="relative">
              <input
                id={`username-${id}`}
                className="bg-[#EFEFEF] border border-white shadow w-full py-3 px-9 rounded-md text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                aria-label="Username"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/80 pointer-events-none">
                <AtSignIcon size={16} aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div className="w-full mb-4">
            <p className="mb-1 text-left text-[15px]">Password</p>
            <div className="relative">
              <input
                id={`password-${id}`}
                className="bg-[#EFEFEF] border border-white shadow w-full py-3 px-4 rounded-md text-sm"
                placeholder="Password"
                type={isVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Password"
              />
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                type="button"
                onClick={toggleVisibility}
                aria-label={isVisible ? "Hide password" : "Show password"}
                aria-pressed={isVisible}
              >
                {isVisible ? (
                  <EyeOffIcon size={16} aria-hidden="true" />
                ) : (
                  <EyeIcon size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <div className="w-full mt-4">
            <Button
              type="submit"
              className="w-full h-[50px] bg-[#DF5C5D] hover:bg-[#DF5C5D]/90 text-white cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
