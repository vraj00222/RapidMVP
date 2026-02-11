"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const templates = [
  {
    title: "SaaS Landing Page",
    description: "Beautiful landing page with pricing, features, and testimonials",
    category: "Marketing",
    image: "/templates/saas.png",
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Dashboard",
    description: "Admin dashboard with charts, tables, and analytics widgets",
    category: "Application",
    image: "/templates/dashboard.png",
    color: "from-blue-500 to-cyan-600",
  },
  {
    title: "E-Commerce Store",
    description: "Full store with product listings, cart, and checkout flow",
    category: "E-Commerce",
    image: "/templates/ecommerce.png",
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "Blog Platform",
    description: "Modern blog with markdown support and dark mode",
    category: "Content",
    image: "/templates/blog.png",
    color: "from-orange-500 to-red-600",
  },
  {
    title: "Portfolio",
    description: "Personal portfolio with projects showcase and contact form",
    category: "Personal",
    image: "/templates/portfolio.png",
    color: "from-pink-500 to-rose-600",
  },
  {
    title: "AI Chat Interface",
    description: "ChatGPT-style interface with streaming and code highlighting",
    category: "AI/ML",
    image: "/templates/chat.png",
    color: "from-indigo-500 to-violet-600",
  },
];

export function Templates() {
  return (
    <section id="templates" className="bg-zinc-50 py-20 dark:bg-zinc-900/50 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl"
            >
              Start with a template
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-lg text-zinc-600 dark:text-zinc-400"
            >
              Kickstart your project with our curated templates
            </motion.p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/templates">
              Browse all templates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Template Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, index) => (
            <motion.div
              key={template.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {/* Template Preview */}
                <div className={`relative aspect-[16/10] bg-gradient-to-br ${template.color}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-3/4 w-3/4 rounded-lg bg-white/10 backdrop-blur-sm" />
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                    <Button size="sm" variant="secondary">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-white">
                    {template.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {template.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
