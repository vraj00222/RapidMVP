"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  Code2,
  Rocket,
  Palette,
  Database,
  Shield,
  Sparkles,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Generate complete MVPs in minutes, not days. Our AI understands your requirements and builds accordingly.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Code2,
    title: "Production-Ready Code",
    description:
      "Clean, maintainable code following best practices. TypeScript, React, Next.js - modern stack by default.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Palette,
    title: "Beautiful Design",
    description:
      "Stunning UI out of the box with Tailwind CSS. Responsive, accessible, and ready for customization.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Database,
    title: "Full-Stack Support",
    description:
      "Not just UI - generate APIs, database schemas, and authentication. Complete apps, not just mockups.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Rocket,
    title: "One-Click Deploy",
    description:
      "Deploy to Vercel, Netlify, or your own infrastructure instantly. Go live in seconds.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Built-in auth, RBAC, and security best practices. Your data and your users' data stays safe.",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: Sparkles,
    title: "AI Iterations",
    description:
      "Refine with natural language. Just describe the changes you want, and watch them happen.",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: Globe,
    title: "Global CDN",
    description:
      "Lightning-fast delivery worldwide. Your MVP loads instantly for users anywhere on the planet.",
    color: "from-cyan-500 to-blue-500",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl"
          >
            Everything you need to build{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              faster
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400"
          >
            From prompt to production in minutes. RapidMVP handles the complexity
            so you can focus on your idea.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item}>
              <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:hover:shadow-violet-500/5">
                <CardContent className="p-6">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} shadow-lg`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
