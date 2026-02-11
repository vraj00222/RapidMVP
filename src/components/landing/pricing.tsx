"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out RapidMVP",
    price: { monthly: 0, yearly: 0 },
    features: [
      "10 generations per day",
      "Basic templates",
      "Community support",
      "Export to GitHub",
      "Standard AI model",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    description: "For serious builders and indie hackers",
    price: { monthly: 20, yearly: 16 },
    features: [
      "Unlimited generations",
      "All premium templates",
      "Priority support",
      "One-click deploy",
      "Advanced AI model",
      "Custom domains",
      "Remove branding",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Team",
    description: "For teams building together",
    price: { monthly: 50, yearly: 40 },
    features: [
      "Everything in Pro",
      "5 team members",
      "Shared workspace",
      "Team collaboration",
      "Version history",
      "Custom instructions",
      "SSO coming soon",
      "Priority queue",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: { monthly: null, yearly: null },
    features: [
      "Everything in Team",
      "Unlimited members",
      "Custom AI training",
      "Dedicated support",
      "SLA guarantee",
      "On-premise option",
      "Security review",
      "Custom contracts",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="bg-zinc-50 py-20 dark:bg-zinc-900/50 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400"
          >
            Start free, upgrade when you&apos;re ready. No hidden fees.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                !isYearly
                  ? "text-zinc-900 dark:text-white"
                  : "text-zinc-500 dark:text-zinc-400"
              )}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                isYearly
                  ? "bg-violet-600"
                  : "bg-zinc-300 dark:bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  isYearly && "translate-x-5"
                )}
              />
            </button>
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                isYearly
                  ? "text-zinc-900 dark:text-white"
                  : "text-zinc-500 dark:text-zinc-400"
              )}
            >
              Yearly
            </span>
            <Badge variant="success" className="ml-2">
              Save 20%
            </Badge>
          </motion.div>
        </div>

        {/* Pricing Grid */}
        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "relative h-full transition-all duration-300",
                  plan.popular
                    ? "border-violet-500 shadow-xl shadow-violet-500/10 dark:border-violet-400"
                    : "hover:shadow-lg"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Price */}
                  <div className="mb-6">
                    {plan.price.monthly !== null ? (
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-zinc-900 dark:text-white">
                          ${isYearly ? plan.price.yearly : plan.price.monthly}
                        </span>
                        <span className="ml-1 text-zinc-500 dark:text-zinc-400">
                          /month
                        </span>
                      </div>
                    ) : (
                      <div className="text-4xl font-bold text-zinc-900 dark:text-white">
                        Custom
                      </div>
                    )}
                    {isYearly && plan.price.yearly !== null && plan.price.yearly > 0 && (
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Billed ${plan.price.yearly * 12}/year
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>

                  {/* Features */}
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
