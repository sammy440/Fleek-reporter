"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthForm({ isSignUp, onSwitchMode, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear errors when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Registration logic
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }

        setSuccess("Registration successful! Signing you in...");

        // Auto sign in after successful registration
        setTimeout(async () => {
          try {
            const signInResult = await signIn("credentials", {
              email: formData.email,
              password: formData.password,
              redirect: false,
            });

            if (!signInResult?.error) {
              setSuccess("Successfully signed in! Redirecting...");
              setTimeout(() => {
                onClose();
                // Use replace instead of push to prevent back navigation issues
                router.replace("/account");
                router.refresh();
              }, 1000);
            } else {
              setError(
                "Registration successful, but auto sign-in failed. Please sign in manually."
              );
              onSwitchMode();
              setFormData((prev) => ({ ...prev, password: "" }));
            }
          } catch (autoSignInError) {
            console.error("Auto sign-in error:", autoSignInError);
            setError(
              "Registration successful, but auto sign-in failed. Please sign in manually."
            );
            onSwitchMode();
            setFormData((prev) => ({ ...prev, password: "" }));
          }
        }, 1500);
      } else {
        // Sign-in logic
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid email or password");
        } else if (result?.ok) {
          setSuccess("Signed in successfully! Redirecting...");
          setTimeout(() => {
            onClose();
            // Use replace instead of push to prevent back navigation issues
            router.replace("/account");
            router.refresh();
          }, 1000);
        } else {
          setError("Sign in failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError(
        err.message || `${isSignUp ? "Registration" : "Sign in"} failed`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("🚀 Starting Google OAuth flow");

      // Clear any existing errors before starting
      window.history.replaceState(null, "", window.location.pathname);

      const result = await signIn("google", {
        callbackUrl: `${window.location.origin}/account`,
        redirect: true,
      });

      // This code won't execute if redirect is successful
      if (result?.error) {
        console.error("Google OAuth error:", result.error);
        setError("Google sign in failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(
        "Google sign in failed. Please check your internet connection and try again."
      );
      setLoading(false);
    }
  };

  return (
    <motion.div
      key={isSignUp ? "signup" : "signin"}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-xl sm:text-2xl lg:text-[20px] lg:mt-[70px] font-bold text-gray-900 mb-2">
        {isSignUp ? "Create an account" : "Welcome back"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-6 mt-6 sm:mt-8"
      >
        {isSignUp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
              placeholder="Enter your name"
              required={isSignUp}
              disabled={loading}
            />
          </motion.div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
              placeholder="Enter your password"
              required
              minLength={6}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff size={18} className="sm:w-5 sm:h-5" />
              ) : (
                <Eye size={18} className="sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>

        {isSignUp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start"
          >
            <input
              type="checkbox"
              id="terms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1 flex-shrink-0"
              required={isSignUp}
              disabled={loading}
            />
            <label
              htmlFor="terms"
              className="ml-3 text-xs sm:text-sm text-gray-600"
            >
              I agree to all the Terms & Conditions
            </label>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="text-red-500 text-xs sm:text-sm bg-red-50 border border-red-200 rounded-lg p-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            className="text-green-600 text-xs sm:text-sm bg-green-50 border border-green-200 rounded-lg p-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {success}
          </motion.div>
        )}

        <motion.button
          type="submit"
          className="w-full bg-gray-700 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          disabled={loading}
        >
          {loading
            ? isSignUp
              ? "Creating account..."
              : "Signing in..."
            : isSignUp
            ? "Create account"
            : "Sign in"}
        </motion.button>
      </form>

      {/* Social Login - Google only, centered */}
      <div className="mt-4 sm:mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <button
            className="w-full flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-xs sm:text-sm font-medium">
              Continue with Google
            </span>
          </button>
        </div>
      </div>

      {/* Switch Mode */}
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-gray-600 text-xs sm:text-sm">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={onSwitchMode}
            className="text-blue-600 hover:underline font-medium"
            disabled={loading}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </motion.div>
  );
}
