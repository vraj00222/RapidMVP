"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Zap, Play } from "lucide-react";
import Link from "next/link";

const examplePrompts = [
  "Build a SaaS landing page with pricing",
  "Create a dashboard with charts and analytics",
  "Design an e-commerce store with cart",
  "Make a blog with markdown support",
];

export function Hero() {
  const [inputValue, setInputValue] = useState("");

  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/50 via-white to-white dark:from-violet-950/20 dark:via-zinc-950 dark:to-zinc-950" />
        <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-400/30 to-indigo-400/30 blur-3xl dark:from-violet-600/20 dark:to-indigo-600/20" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-6 gap-1.5 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" />
              <span>Powered by AI</span>
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl"
          >
            Build your MVP in{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              minutes
            </span>
            , not months
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400"
          >
            Describe what you want to build, and watch RapidMVP generate 
            production-ready code. From landing pages to full-stack apps, 
            deploy in one click.
          </motion.p>

          {/* Main Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mt-10 max-w-2xl"
          >
            <div className="group relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-20 blur transition-all group-hover:opacity-30 group-focus-within:opacity-40" />
              <div className="relative flex items-center rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                <Zap className="ml-4 h-5 w-5 text-violet-600" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Describe what you want to build..."
                  className="flex-1 bg-transparent px-4 py-4 text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-white dark:placeholder:text-zinc-400"
                />
                <Button className="m-2" size="lg" asChild>
                  <Link href="/chat">
                    Generate
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Example prompts */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Try:</span>
              {examplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInputValue(prompt)}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-violet-700 dark:hover:bg-violet-950 dark:hover:text-violet-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Demo Video Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mx-auto mt-16 max-w-5xl"
          >
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                <button className="group flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl transition-transform hover:scale-110 dark:bg-zinc-800">
                  <Play className="h-8 w-8 text-violet-600 transition-transform group-hover:scale-110" />
                </button>
              </div>
              {/* Browser chrome */}
              <div className="absolute inset-x-0 top-0 flex items-center gap-2 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/90">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="ml-4 flex-1 rounded-md bg-zinc-100 px-3 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  rapidmvp.dev/chat
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-violet-400 to-indigo-500 dark:border-zinc-900"
                />
              ))}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-zinc-900 dark:text-white">2,500+</span>{" "}
              MVPs built this month
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
