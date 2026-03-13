"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Send,
  Plus,
  History,
  Code2,
  Eye,
  Copy,
  Check,
  Download,
  Rocket,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileCode,
  FolderTree,
  FolderOpen,
  Folder,
  File,
  FileJson,
  FileType,
  RefreshCw,
  Maximize2,
  MessageSquare,
  User,
  Bot,
  Loader2,
  ArrowLeft,
  ChevronDown,
  Cpu,
  ExternalLink,
} from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import { cn } from "@/lib/utils";
import { SidebarProfile } from "@/components/ui/profile-dropdown";

interface Message {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

interface AIModelOption {
  id: string;
  name: string;
  provider: string;
  tier: "fast" | "standard" | "premium";
  description: string;
  inputPrice: string;
  outputPrice: string;
}

// --- File Tree Types & Helpers ---

interface TreeNode {
  name: string;
  path: string; // full path for files, folder path for dirs
  type: "file" | "folder";
  children?: TreeNode[];
  fileIndex?: number; // index into generatedFiles array
}

function buildFileTree(files: GeneratedFile[]): TreeNode[] {
  const root: TreeNode[] = [];

  files.forEach((file, index) => {
    const parts = file.path.split("/");
    let current = root;

    parts.forEach((part, i) => {
      const isFile = i === parts.length - 1;
      const existing = current.find((n) => n.name === part && n.type === (isFile ? "file" : "folder"));

      if (existing && !isFile) {
        current = existing.children!;
      } else if (isFile) {
        current.push({
          name: part,
          path: file.path,
          type: "file",
          fileIndex: index,
        });
      } else {
        const folder: TreeNode = {
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          type: "folder",
          children: [],
        };
        current.push(folder);
        current = folder.children!;
      }
    });
  });

  // Sort: folders first, then files, alphabetically within each group
  function sortTree(nodes: TreeNode[]): TreeNode[] {
    return nodes
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map((n) => (n.children ? { ...n, children: sortTree(n.children) } : n));
  }

  return sortTree(root);
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "tsx":
    case "jsx":
      return <FileCode className="h-4 w-4 text-blue-400" />;
    case "ts":
    case "js":
      return <FileType className="h-4 w-4 text-yellow-400" />;
    case "css":
      return <FileType className="h-4 w-4 text-purple-400" />;
    case "json":
      return <FileJson className="h-4 w-4 text-green-400" />;
    case "html":
      return <FileCode className="h-4 w-4 text-orange-400" />;
    default:
      return <File className="h-4 w-4 text-zinc-400" />;
  }
}

function FileTreeNode({
  node,
  activeFileIndex,
  onSelectFile,
  depth = 0,
}: {
  node: TreeNode;
  activeFileIndex: number;
  onSelectFile: (index: number) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <ChevronRight
            className={cn("h-3 w-3 shrink-0 transition-transform", expanded && "rotate-90")}
          />
          {expanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-amber-400" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-amber-400" />
          )}
          <span className="truncate font-medium">{node.name}</span>
        </button>
        {expanded && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                activeFileIndex={activeFileIndex}
                onSelectFile={onSelectFile}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = node.fileIndex === activeFileIndex;

  return (
    <button
      onClick={() => node.fileIndex !== undefined && onSelectFile(node.fileIndex)}
      className={cn(
        "flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors",
        isActive
          ? "bg-violet-600/20 text-violet-300"
          : "text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200"
      )}
      style={{ paddingLeft: `${depth * 12 + 20}px` }}
    >
      {getFileIcon(node.name)}
      <span className="truncate">{node.name}</span>
    </button>
  );
}

interface SidebarProject {
  _id: string;
  name: string;
  updatedAt: string;
}

function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>\s*/g, "").trim();
}

function extractExplanation(content: string): string {
  const cleaned = stripThinkTags(content);
  const idx = cleaned.indexOf("---FILE:");
  if (idx === -1) return cleaned;
  return cleaned.substring(0, idx).trim();
}

const LOADING_WORDS = [
  "Thinking",
  "Crafting",
  "Designing",
  "Architecting",
  "Building",
  "Assembling",
  "Composing",
  "Sculpting",
  "Weaving",
  "Conjuring",
  "Tinkering",
  "Forging",
  "Dreaming up",
  "Cooking up",
  "Spinning up",
  "Orchestrating",
];

function LoadingIndicator() {
  const [wordIndex, setWordIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % LOADING_WORDS.length);
    }, 2400);
    return () => clearInterval(wordInterval);
  }, []);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div className="flex gap-4">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-zinc-800">
        <div className="flex items-center gap-3">
          <div className="relative h-5 w-5">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium text-zinc-600 dark:text-zinc-300"
            >
              {LOADING_WORDS[wordIndex]}
              <span className="inline-block w-5 text-left">{dots}</span>
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function ProjectChatPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [projectName, setProjectName] = useState("");
  const [sidebarProjects, setSidebarProjects] = useState<SidebarProject[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  const [availableModels, setAvailableModels] = useState<AIModelOption[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Resizable panel drag handler
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setChatWidth(Math.min(80, Math.max(20, pct)));
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    // Prevent text selection while dragging
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging]);

  // Refresh preview whenever files change
  useEffect(() => {
    if (generatedFiles.length > 0) {
      setPreviewKey((k) => k + 1);
    }
  }, [generatedFiles]);

  // Load chat history and files for this project
  const loadMessages = useCallback(async () => {
    try {
      // Load messages
      const msgRes = await fetch(`/api/projects/${projectId}/messages`);
      if (msgRes.ok) {
        const data = await msgRes.json();
        setMessages(data.messages || []);
        setProjectName(data.projectName || "");
      } else if (msgRes.status === 404) {
        router.push("/chat");
        return;
      }

      // Load project files
      const projRes = await fetch(`/api/projects/${projectId}`);
      if (projRes.ok) {
        const projData = await projRes.json();
        if (projData.project.files?.length > 0) {
          setGeneratedFiles(projData.project.files);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoadingMessages(false);
    }
  }, [projectId, router]);

  // Load sidebar projects
  const loadSidebarProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setSidebarProjects(data.projects || []);
      }
    } catch {
      // silently fail
    }
  }, []);

  // Load available AI models
  useEffect(() => {
    async function loadModels() {
      try {
        const res = await fetch("/api/models");
        if (res.ok) {
          const data = await res.json();
          setAvailableModels(data.models || []);
          if (data.models?.length > 0 && !selectedModelId) {
            setSelectedModelId(data.models[0].id);
          }
        }
      } catch {
        // silently fail
      }
    }
    loadModels();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close model picker on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) {
        setModelPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadMessages();
    loadSidebarProjects();
  }, [loadMessages, loadSidebarProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    setInput("");
    setIsLoading(true);

    setGenerationError("");

    // Optimistically add user message to UI
    const optimisticUserMsg: Message = {
      role: "user",
      content: userContent,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);

    try {
      // Call the generate API (saves messages + files to DB)
      const res = await fetch(`/api/projects/${projectId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userContent, modelId: selectedModelId || undefined }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setGenerationError(errData.error || "Generation failed");
        setIsLoading(false);
        return;
      }

      const data = await res.json();

      // Show explanation in chat (not raw file content)
      const assistantMsg: Message = {
        role: "assistant",
        content: data.explanation || data.fullResponse,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Update generated files and switch to code tab
      if (data.files && data.files.length > 0) {
        setGeneratedFiles(data.files);
        setActiveFileIndex(0);
        setActiveTab("code");
      }

      // Refresh sidebar (project name may have changed)
      loadSidebarProjects();
    } catch {
      setGenerationError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    const content =
      generatedFiles.length > 0
        ? generatedFiles[activeFileIndex]?.content || ""
        : "";
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPreviewTab = () => {
    if (generatedFiles.length === 0) return;
    window.open(`/api/preview/${projectId}`, "_blank");
  };

  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Project" }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/chat/${data.project._id}`);
      }
    } catch {
      // silently fail
    }
  };

  if (loadingMessages) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          <p className="text-sm text-zinc-500">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex h-full flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* Sidebar Header */}
            <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-zinc-900 dark:text-white">
                  RapidMVP
                </span>
              </Link>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
              <Button className="w-full gap-2" onClick={handleNewChat}>
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>

            {/* Chat History — Real Projects */}
            <div className="flex-1 overflow-y-auto px-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
                <History className="h-3 w-3" />
                Recent Chats
              </div>
              <div className="space-y-1">
                {sidebarProjects.map((project) => (
                  <Link
                    key={project._id}
                    href={`/chat/${project._id}`}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      project._id === projectId
                        ? "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    )}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="truncate">{project.name}</span>
                  </Link>
                ))}
                {sidebarProjects.length === 0 && (
                  <p className="px-3 py-2 text-xs text-zinc-400">
                    No projects yet
                  </p>
                )}
              </div>
            </div>

            {/* User Section */}
            <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
              <SidebarProfile />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {projectName && (
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                {projectName}
              </span>
            )}
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="gap-2">
              <Rocket className="h-4 w-4" />
              Deploy
            </Button>
          </div>
        </header>

        {/* Chat + Preview */}
        <div ref={containerRef} className="flex flex-1 overflow-hidden">
          {/* Chat Area */}
          <div className="flex flex-col" style={{ width: `${chatWidth}%` }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
                    What would you like to build?
                  </h2>
                  <p className="mt-2 text-center text-zinc-600 dark:text-zinc-400">
                    Describe your idea and I&apos;ll generate the code for you
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={message._id || index}
                      className={cn(
                        "flex gap-4",
                        message.role === "user" && "flex-row-reverse"
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback
                          className={cn(
                            message.role === "assistant"
                              ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white"
                              : "bg-zinc-200 dark:bg-zinc-700"
                          )}
                        >
                          {message.role === "assistant" ? (
                            <Bot className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-3",
                          message.role === "assistant"
                            ? "bg-white shadow-sm dark:bg-zinc-800"
                            : "bg-violet-600 text-white"
                        )}
                      >
                        <p className="whitespace-pre-wrap text-sm">
                          {message.role === "assistant"
                            ? extractExplanation(message.content)
                            : message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && <LoadingIndicator />}
                  {generationError && (
                    <div className="mx-auto max-w-[80%] rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                      {generationError}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              {/* Model Selector */}
              {availableModels.length > 0 && (
                <div className="mb-3 relative" ref={modelPickerRef}>
                  <button
                    type="button"
                    onClick={() => setModelPickerOpen(!modelPickerOpen)}
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    <Cpu className="h-3.5 w-3.5" />
                    {availableModels.find((m) => m.id === selectedModelId)?.name || "Select Model"}
                    {(() => {
                      const model = availableModels.find((m) => m.id === selectedModelId);
                      if (!model) return null;
                      const tierColors = {
                        fast: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                        standard: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                        premium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                      };
                      return (
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", tierColors[model.tier])}>
                          {model.tier}
                        </span>
                      );
                    })()}
                    <ChevronDown className={cn("h-3 w-3 transition-transform", modelPickerOpen && "rotate-180")} />
                  </button>

                  {modelPickerOpen && (
                    <div className="absolute bottom-full left-0 z-50 mb-1 w-[400px] rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                      <div className="border-b border-zinc-200 px-4 py-2 dark:border-zinc-700">
                        <p className="text-xs font-semibold text-zinc-500">Select AI Model</p>
                      </div>
                      <div className="max-h-[320px] overflow-y-auto p-2">
                        {availableModels.map((model) => {
                          const tierColors = {
                            fast: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                            standard: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                            premium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                          };
                          return (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => {
                                setSelectedModelId(model.id);
                                setModelPickerOpen(false);
                              }}
                              className={cn(
                                "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors",
                                model.id === selectedModelId
                                  ? "bg-violet-50 dark:bg-violet-950/30"
                                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                              )}
                            >
                              <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                    {model.name}
                                  </span>
                                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", tierColors[model.tier])}>
                                    {model.tier}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                                  {model.description}
                                </p>
                                <p className="mt-1 text-[10px] text-zinc-400">
                                  {model.inputPrice}/Mt in · {model.outputPrice}/Mt out · via {model.provider}
                                </p>
                              </div>
                              {model.id === selectedModelId && (
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe what you want to build..."
                  className="min-h-[80px] resize-none pr-12"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute bottom-3 right-3"
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="mt-2 text-center text-xs text-zinc-500">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>

          {/* Drag handle */}
          <div
            className="group relative w-1 shrink-0 cursor-col-resize bg-zinc-200 transition-colors hover:bg-violet-400 dark:bg-zinc-700 dark:hover:bg-violet-500"
            onMouseDown={() => setIsDragging(true)}
          >
            <div className="absolute inset-y-0 -left-1 -right-1 z-10" />
            <div className="absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-500" />
          </div>

          {/* Preview Area */}
          <div className="flex flex-1 flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-900">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("preview")}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    activeTab === "preview"
                      ? "border-violet-600 text-violet-600"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    activeTab === "code"
                      ? "border-violet-600 text-violet-600"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  <Code2 className="h-4 w-4" />
                  Code
                </button>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenPreviewTab}
                  disabled={generatedFiles.length === 0}
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "preview" ? (
                <div className="flex h-full flex-col">
                  {generatedFiles.length === 0 ? (
                    <div className="flex h-full items-center justify-center p-8">
                      <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800">
                          <FolderTree className="h-8 w-8 text-zinc-400" />
                        </div>
                        <p className="mt-4 text-sm text-zinc-500">
                          Your preview will appear here
                        </p>
                        <p className="mt-1 text-xs text-zinc-400">
                          Describe what you want to build and see it rendered live
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col">
                      {/* Browser chrome */}
                      <div className="flex h-10 items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 dark:border-zinc-700 dark:bg-zinc-800">
                        <div className="flex gap-1.5">
                          <div className="h-3 w-3 rounded-full bg-red-400" />
                          <div className="h-3 w-3 rounded-full bg-yellow-400" />
                          <div className="h-3 w-3 rounded-full bg-green-400" />
                        </div>
                        <div className="ml-4 flex-1 rounded-md bg-white px-3 py-1 text-xs text-zinc-500 dark:bg-zinc-900">
                          preview://localhost
                        </div>
                      </div>
                      {/* Live iframe preview — served from same-origin API route */}
                      <iframe
                        key={previewKey}
                        src={`/api/preview/${projectId}`}
                        className="flex-1 w-full bg-white"
                        title="Live Preview"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full flex-col overflow-hidden">
                  {generatedFiles.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800">
                          <FileCode className="h-8 w-8 text-zinc-400" />
                        </div>
                        <p className="mt-4 text-sm text-zinc-500">
                          Generated code will appear here
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-1 overflow-hidden">
                      {/* File Explorer Sidebar */}
                      <div className="flex w-56 shrink-0 flex-col border-r border-zinc-700 bg-[#1e1e2e]">
                        <div className="flex items-center gap-2 border-b border-zinc-700 px-3 py-2">
                          <FolderTree className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Explorer
                          </span>
                          <span className="ml-auto text-[10px] text-zinc-600">
                            {generatedFiles.length} file{generatedFiles.length !== 1 && "s"}
                          </span>
                        </div>
                        <div className="flex-1 overflow-y-auto py-1">
                          {buildFileTree(generatedFiles).map((node) => (
                            <FileTreeNode
                              key={node.path}
                              node={node}
                              activeFileIndex={activeFileIndex}
                              onSelectFile={setActiveFileIndex}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Code Editor */}
                      <div className="flex flex-1 flex-col overflow-hidden">
                        {/* File path bar */}
                        <div className="flex items-center justify-between border-b border-zinc-700 bg-[#252536] px-4 py-1.5">
                          <div className="flex items-center gap-2">
                            {getFileIcon(generatedFiles[activeFileIndex]?.path.split("/").pop() || "")}
                            <span className="text-xs text-zinc-300">
                              {generatedFiles[activeFileIndex]?.path}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs text-zinc-400 hover:text-zinc-200"
                            onClick={handleCopy}
                          >
                            {copied ? (
                              <>
                                <Check className="h-3 w-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                        {/* Code with syntax highlighting */}
                        <div className="flex-1 overflow-auto">
                          <Highlight
                            theme={themes.vsDark}
                            code={generatedFiles[activeFileIndex]?.content || ""}
                            language={generatedFiles[activeFileIndex]?.language === "typescript" ? "tsx" : generatedFiles[activeFileIndex]?.language || "text"}
                          >
                            {({ style, tokens, getLineProps, getTokenProps }) => (
                              <pre
                                className="min-h-full p-4 text-sm leading-relaxed"
                                style={{ ...style, margin: 0, background: "#1e1e2e" }}
                              >
                                {tokens.map((line, i) => (
                                  <div key={i} {...getLineProps({ line })} className="table-row">
                                    <span className="table-cell select-none pr-4 text-right text-xs text-zinc-600">
                                      {i + 1}
                                    </span>
                                    <span className="table-cell whitespace-pre-wrap break-all">
                                      {line.map((token, key) => (
                                        <span key={key} {...getTokenProps({ token })} />
                                      ))}
                                    </span>
                                  </div>
                                ))}
                              </pre>
                            )}
                          </Highlight>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
