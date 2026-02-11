"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Founder, TechStart",
    avatar: "/avatars/sarah.jpg",
    content:
      "RapidMVP saved us 3 months of development time. We went from idea to funded startup in just 6 weeks. The code quality is incredible.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "CTO, DevScale",
    avatar: "/avatars/marcus.jpg",
    content:
      "I was skeptical about AI-generated code, but RapidMVP produces cleaner code than half my team. It's now our secret weapon for rapid prototyping.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Product Manager, Acme",
    avatar: "/avatars/emily.jpg",
    content:
      "Finally, a tool that lets me validate ideas without waiting for the dev queue. I've launched 4 internal tools in the past month alone.",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Indie Hacker",
    avatar: "/avatars/david.jpg",
    content:
      "Built my entire SaaS in a weekend. The one-click deploy to Vercel is *chef's kiss*. Already at $2k MRR.",
    rating: 5,
  },
  {
    name: "Lisa Thompson",
    role: "Designer, Creative Co",
    avatar: "/avatars/lisa.jpg",
    content:
      "As a designer, I love that I can now bring my Figma designs to life without writing a single line of code. The output is pixel-perfect.",
    rating: 5,
  },
  {
    name: "Alex Patel",
    role: "Engineering Lead, Startup",
    avatar: "/avatars/alex.jpg",
    content:
      "We use RapidMVP for all our client demos now. What used to take a week takes an hour. Our close rate has doubled.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl"
          >
            Loved by builders worldwide
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400"
          >
            Join thousands of founders, developers, and designers shipping faster
            with RapidMVP
          </motion.p>
        </div>

        {/* Testimonial Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  {/* Content */}
                  <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="mt-6 flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-sm">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
