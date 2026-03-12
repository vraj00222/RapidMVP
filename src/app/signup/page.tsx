"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, Github, Mail, ArrowLeft, Eye, EyeOff, Check } from "lucide-react";

const features = [
  "10 free generations per day",
  "Access to all templates",
  "One-click deploy to Vercel",
  "Export to GitHub",
];

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setIsLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      setError("Account created but sign-in failed. Please log in manually.");
      setIsLoading(false);
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-violet-600 to-indigo-700 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">RapidMVP</span>
          </Link>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Start building your MVP today
            </h2>
            <p className="mt-2 text-lg text-white/80">
              Join thousands of founders shipping faster with AI
            </p>
          </div>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <Check className="h-4 w-4" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm text-white/50">
          © 2026 RapidMVP. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link
            href="/"
            className="mb-8 inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>

          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">RapidMVP</span>
            </Link>
          </div>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="space-y-1 px-0 lg:px-6">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>
                Get started with your free account today
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 lg:px-6">
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* OAuth Buttons */}
              <div className="grid gap-3">
                <Button variant="outline" className="w-full" disabled={isLoading}>
                  <Github className="mr-2 h-4 w-4" />
                  Continue with GitHub
                </Button>
                <Button variant="outline" className="w-full" disabled={isLoading}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-950">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="firstName">
                      First name
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="lastName">
                      Last name
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Must be at least 6 characters
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-zinc-500">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-zinc-700">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-zinc-700">
                  Privacy Policy
                </Link>
              </p>

              <p className="mt-4 text-center text-sm text-zinc-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-violet-600 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
