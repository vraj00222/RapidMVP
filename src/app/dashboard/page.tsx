"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Zap,
  Plus,
  Search,
  Settings,
  LayoutGrid,
  List,
  Clock,
  ExternalLink,
  Trash2,
  FolderOpen,
  Code2,
  Rocket,
  CreditCard,
  Home,
  MessageSquare,
  Layers,
  BookOpen,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarProfile } from "@/components/ui/profile-dropdown";

interface Project {
  _id: string;
  name: string;
  description: string;
  status: "draft" | "generating" | "ready" | "deployed";
  thumbnail: string;
  generationCount: number;
  createdAt: string;
  updatedAt: string;
}

const GRADIENT_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-pink-500 to-rose-600",
  "from-indigo-500 to-violet-600",
];

function getGradient(index: number): string {
  return GRADIENT_COLORS[index % GRADIENT_COLORS.length];
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const sidebarLinks = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
  { icon: MessageSquare, label: "Chat", href: "/chat" },
  { icon: Layers, label: "Templates", href: "/templates" },
  { icon: BookOpen, label: "Docs", href: "/docs" },
  { icon: HelpCircle, label: "Support", href: "/support" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      }
    } catch {
      // silently fail — user will see empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(null);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Total Projects", value: projects.length.toString(), icon: FolderOpen },
    {
      label: "Generations",
      value: projects.reduce((sum, p) => sum + (p.generationCount || 0), 0).toString(),
      icon: Code2,
    },
    {
      label: "Deployed",
      value: projects.filter((p) => p.status === "deployed").length.toString(),
      icon: Rocket,
    },
    {
      label: "In Progress",
      value: projects
        .filter((p) => p.status === "generating" || p.status === "draft")
        .length.toString(),
      icon: CreditCard,
    },
  ];

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
          <SidebarProfile />
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
              Welcome back
              {session?.user?.name
                ? `, ${session.user.name.split(" ")[0]}`
                : ""}
              ! Here&apos;s what you&apos;ve been building.
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
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {loading ? "—" : stat.value}
                      </p>
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

            {/* Loading State */}
            {loading ? (
              <div className="mt-12 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                <p className="mt-4 text-sm text-zinc-500">
                  Loading your projects...
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      {/* Thumbnail */}
                      <div
                        className={`relative aspect-[16/10] bg-gradient-to-br ${project.thumbnail || getGradient(index)}`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-3/4 w-3/4 rounded-lg bg-white/10 backdrop-blur-sm" />
                        </div>
                        {/* Actions overlay */}
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                          <Button size="sm" variant="secondary" asChild>
                            <Link href={`/chat/${project._id}`}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open
                            </Link>
                          </Button>
                        </div>
                        {/* Status badge */}
                        <div className="absolute right-3 top-3">
                          <Badge
                            variant={
                              project.status === "ready" ||
                              project.status === "deployed"
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
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                              {project.name}
                            </h3>
                            <p className="mt-1 text-sm text-zinc-500 line-clamp-1">
                              {project.description || "No description"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(project._id)}
                            disabled={deleting === project._id}
                            className="ml-2 rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
                          >
                            {deleting === project._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                          <Clock className="h-3 w-3" />
                          {timeAgo(project.updatedAt)}
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
                    key={project._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="transition-all hover:shadow-md">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${project.thumbnail || getGradient(index)}`}
                        >
                          <div className="h-6 w-6 rounded bg-white/20" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                              {project.name}
                            </h3>
                            <Badge
                              variant={
                                project.status === "ready" ||
                                project.status === "deployed"
                                  ? "success"
                                  : "secondary"
                              }
                              className="text-xs shrink-0"
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-zinc-500 truncate">
                            {project.description || "No description"}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 shrink-0">
                          <div className="flex items-center gap-1 text-sm text-zinc-500">
                            <Clock className="h-4 w-4" />
                            {timeAgo(project.updatedAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/chat/${project._id}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(project._id)}
                              disabled={deleting === project._id}
                            >
                              {deleting === project._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {filteredProjects.length === 0 && !loading && (
                  <div className="mt-12 flex flex-col items-center justify-center py-12">
                    <FolderOpen className="h-12 w-12 text-zinc-300" />
                    <p className="mt-4 text-sm text-zinc-500">
                      {searchQuery
                        ? "No projects match your search"
                        : "No projects yet. Create your first one!"}
                    </p>
                    {!searchQuery && (
                      <Button className="mt-4 gap-2" asChild>
                        <Link href="/chat">
                          <Plus className="h-4 w-4" />
                          New Project
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Empty state for grid view */}
            {!loading &&
              viewMode === "grid" &&
              filteredProjects.length === 0 &&
              searchQuery && (
                <div className="mt-12 flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-zinc-300" />
                  <p className="mt-4 text-sm text-zinc-500">
                    No projects match &quot;{searchQuery}&quot;
                  </p>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}
