"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Zap,
  Plus,
  Search,
  Settings,
  LayoutGrid,
  List,
  Clock,
  Star,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Copy,
  FolderOpen,
  TrendingUp,
  Code2,
  Rocket,
  CreditCard,
  LogOut,
  ChevronDown,
  Home,
  MessageSquare,
  Layers,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const projects = [
  {
    id: 1,
    name: "E-commerce Landing",
    description: "Modern e-commerce landing page with product grid",
    lastEdited: "2 hours ago",
    status: "published",
    thumbnail: "from-violet-500 to-purple-600",
  },
  {
    id: 2,
    name: "Analytics Dashboard",
    description: "Admin dashboard with charts and data tables",
    lastEdited: "Yesterday",
    status: "draft",
    thumbnail: "from-blue-500 to-cyan-600",
  },
  {
    id: 3,
    name: "Blog Platform",
    description: "Personal blog with markdown support",
    lastEdited: "3 days ago",
    status: "published",
    thumbnail: "from-emerald-500 to-teal-600",
  },
  {
    id: 4,
    name: "Portfolio Site",
    description: "Developer portfolio with project showcase",
    lastEdited: "1 week ago",
    status: "draft",
    thumbnail: "from-orange-500 to-red-600",
  },
  {
    id: 5,
    name: "SaaS Pricing Page",
    description: "Pricing page with comparison table",
    lastEdited: "2 weeks ago",
    status: "published",
    thumbnail: "from-pink-500 to-rose-600",
  },
  {
    id: 6,
    name: "AI Chat Interface",
    description: "ChatGPT-style chat UI with streaming",
    lastEdited: "1 month ago",
    status: "draft",
    thumbnail: "from-indigo-500 to-violet-600",
  },
];

const stats = [
  { label: "Total Projects", value: "12", icon: FolderOpen, change: "+2" },
  { label: "Generations", value: "847", icon: Code2, change: "+124" },
  { label: "Deployments", value: "8", icon: Rocket, change: "+3" },
  { label: "Credits Left", value: "1,250", icon: CreditCard, change: "-" },
];

const sidebarLinks = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
  { icon: MessageSquare, label: "Chat", href: "/chat" },
  { icon: Layers, label: "Templates", href: "/templates" },
  { icon: BookOpen, label: "Docs", href: "/docs" },
  { icon: HelpCircle, label: "Support", href: "/support" },
];

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-zinc-200 px-6 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-zinc-900 dark:text-white">
              RapidMVP
            </span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 p-4">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                link.active
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Upgrade Card */}
        <div className="p-4">
          <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
            <CardContent className="p-4">
              <h3 className="font-semibold">Upgrade to Pro</h3>
              <p className="mt-1 text-sm text-white/80">
                Unlock unlimited generations and premium features
              </p>
              <Button
                size="sm"
                className="mt-4 w-full bg-white text-violet-600 hover:bg-zinc-100"
              >
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User */}
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-xs">
                VP
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                Vraj Patel
              </p>
              <p className="text-xs text-zinc-500">Free Plan</p>
            </div>
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-8 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm text-zinc-500">
              Welcome back! Here&apos;s what you&apos;ve been building.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button className="gap-2" asChild>
              <Link href="/chat">
                <Plus className="h-4 w-4" />
                New Project
              </Link>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Stats */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                      <stat.icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                          {stat.value}
                        </p>
                        {stat.change !== "-" && (
                          <span className="flex items-center text-xs font-medium text-emerald-600">
                            <TrendingUp className="mr-0.5 h-3 w-3" />
                            {stat.change}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Projects Section */}
          <div className="mt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Your Projects
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-9"
                  />
                </div>
                <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "rounded-l-lg p-2 transition-colors",
                      viewMode === "grid"
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "rounded-r-lg p-2 transition-colors",
                      viewMode === "list"
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Projects Grid/List */}
            {viewMode === "grid" ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      {/* Thumbnail */}
                      <div
                        className={`relative aspect-[16/10] bg-gradient-to-br ${project.thumbnail}`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-3/4 w-3/4 rounded-lg bg-white/10 backdrop-blur-sm" />
                        </div>
                        {/* Actions overlay */}
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                          <Button size="sm" variant="secondary">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open
                          </Button>
                        </div>
                        {/* Status badge */}
                        <div className="absolute right-3 top-3">
                          <Badge
                            variant={
                              project.status === "published"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-white">
                              {project.name}
                            </h3>
                            <p className="mt-1 text-sm text-zinc-500 line-clamp-1">
                              {project.description}
                            </p>
                          </div>
                          <button className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                          <Clock className="h-3 w-3" />
                          {project.lastEdited}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {/* New Project Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: filteredProjects.length * 0.05 }}
                >
                  <Link href="/chat">
                    <Card className="flex h-full min-h-[280px] cursor-pointer flex-col items-center justify-center border-2 border-dashed border-zinc-300 bg-transparent transition-all hover:border-violet-400 hover:bg-violet-50/50 dark:border-zinc-700 dark:hover:border-violet-600 dark:hover:bg-violet-950/20">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                        <Plus className="h-6 w-6 text-zinc-400" />
                      </div>
                      <p className="mt-4 font-medium text-zinc-600 dark:text-zinc-400">
                        Create New Project
                      </p>
                    </Card>
                  </Link>
                </motion.div>
              </div>
            ) : (
              <div className="mt-6 space-y-2">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="transition-all hover:shadow-md">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${project.thumbnail}`}
                        >
                          <div className="h-6 w-6 rounded bg-white/20" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-zinc-900 dark:text-white">
                              {project.name}
                            </h3>
                            <Badge
                              variant={
                                project.status === "published"
                                  ? "success"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-zinc-500">
                            {project.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1 text-sm text-zinc-500">
                            <Clock className="h-4 w-4" />
                            {project.lastEdited}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon">
                              <Star className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
