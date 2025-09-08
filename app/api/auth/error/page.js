"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const errorType = searchParams.get("error");

    switch (errorType) {
      case "Configuration":
        setError("There is a problem with the server configuration.");
        break;
      case "AccessDenied":
        setError("You cancelled the sign-in process.");
        break;
      case "Verification":
        setError("The verification link has expired or has already been used.");
        break;
      case "OAuthSignin":
        setError("Error in constructing an authorization URL.");
        break;
      case "OAuthCallback":
        setError("Error in handling the response from an OAuth provider.");
        break;
      case "OAuthAccountNotLinked":
        setError("The account is already linked to another user.");
        break;
      case "EmailCreateAccount":
        setError("Could not create email account.");
        break;
      case "Callback":
        setError("Error in the OAuth callback handler route.");
        break;
      case "OAuthCreateAccount":
        setError("Could not create OAuth account.");
        break;
      case "EmailSignin":
        setError("Sending the verification email failed.");
        break;
      case "CredentialsSignin":
        setError("Invalid credentials provided.");
        break;
      case "SessionRequired":
        setError("You must be signed in to access this page.");
        break;
      default:
        setError("An unknown authentication error occurred.");
    }
  }, [searchParams]);

  const handleRetrySignIn = () => {
    router.push("/");
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/account" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-600">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            There was a problem signing you in
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Sign-in failed
                  </h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleRetrySignIn}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Sign In
            </button>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Google Sign-in Again
            </button>
          </div>

          <div className="mt-6">
            <div className="text-center text-sm text-gray-600">
              <p>Need help?</p>
              <a
                href="mailto:support@fleekreporter.com"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
