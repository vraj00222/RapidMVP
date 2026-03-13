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

function buildPreviewHtml(files: GeneratedFile[]): string {
  if (files.length === 0) return "";

  // Find the main component file (prefer index/App/page, then first tsx/jsx)
  const findMain = () => {
    const priority = ["index.tsx", "index.jsx", "App.tsx", "App.jsx", "page.tsx"];
    for (const name of priority) {
      const f = files.find((f) => f.path.endsWith(name));
      if (f) return f;
    }
    return files.find((f) => f.language === "typescript" || f.language === "javascript") || files[0];
  };

  const mainFile = findMain();
  if (!mainFile) return "";

  // Strip TypeScript type annotations, imports, and exports for browser execution
  function stripForBrowser(code: string): string {
    return code
      // Remove import statements
      .replace(/^import\s+.*$/gm, "")
      // Remove interface/type declarations (multiline)
      .replace(/^(export\s+)?(interface|type)\s+\w+[\s\S]*?^\}/gm, "")
      // Remove single-line type exports
      .replace(/^export\s+type\s+.*$/gm, "")
      // Convert "export default function" to just "function"
      .replace(/^export\s+default\s+function\s+/gm, "function ")
      // Remove remaining "export" keywords
      .replace(/^export\s+/gm, "")
      // Strip TS generic type params from function calls like useState<number>
      .replace(/(useState|useRef|useCallback|useMemo|useReducer|createContext)<[^>]+>/g, "$1")
      // Strip TS type annotations from params: (x: string) → (x)
      .replace(/:\s*(string|number|boolean|any|void|never|null|undefined|React\.\w+|\w+\[\]|Record<[^>]+>|\{[^}]*\})\s*([,)=])/g, " $2")
      // Strip return type annotations
      .replace(/\)\s*:\s*\w+(\[\])?\s*(\{|=>)/g, ") $2")
      // Strip "as Type" casts
      .replace(/\s+as\s+\w+/g, "");
  }

  // Collect all component code — put helper files first, main file last
  const otherFiles = files.filter(
    (f) => f !== mainFile && (f.language === "typescript" || f.language === "javascript")
  );
  const orderedFiles = [...otherFiles, mainFile];

  const allCode = orderedFiles
    .map((f) => stripForBrowser(f.content))
    .join("\n\n");

  // Get the main component name from the default export
  const exportMatch = mainFile.content.match(
    /export\s+default\s+function\s+(\w+)/
  );
  const componentName = exportMatch?.[1] || "App";

  const cssFiles = files.filter((f) => f.language === "css");
  const cssContent = cssFiles.map((f) => f.content).join("\n");

  // Escape closing script tags and backticks in generated code
  const safeCode = allCode.replace(/<\/script>/gi, "<\\/script>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    #root { min-height: 100vh; }
    ${cssContent}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
    const { useState, useEffect, useRef, useCallback, useMemo, useReducer, createContext, useContext, Fragment } = React;

    ${safeCode}

    try {
      const root = ReactDOM.createRoot(document.getElementById("root"));
      root.render(React.createElement(${componentName}));
    } catch (err) {
      document.getElementById("root").innerHTML =
        '<div style="padding:32px;color:#ef4444;font-family:monospace;font-size:14px;white-space:pre-wrap">' +
        '<strong>Render Error:</strong>\\n\\n' + err.message + '</div>';
    }
  <\/script>
  <script>
    window.onerror = function(msg, url, line) {
      var root = document.getElementById("root");
      if (root && !root.querySelector("[data-error]")) {
        var el = document.createElement("div");
        el.setAttribute("data-error", "1");
        el.style.cssText = "padding:32px;color:#ef4444;font-family:monospace;font-size:14px;white-space:pre-wrap";
        el.textContent = "Preview Error:\\n\\n" + msg + (line ? "\\nLine " + line : "");
        root.innerHTML = "";
        root.appendChild(el);
      }
    };
  <\/script>
</body>
</html>`;
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
  const [availableModels, setAvailableModels] = useState<AIModelOption[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    const html = buildPreviewHtml(generatedFiles);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // Clean up the blob URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 5000);
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
        <div className="flex flex-1 overflow-hidden">
          {/* Chat Area */}
          <div className="flex w-1/2 flex-col border-r border-zinc-200 dark:border-zinc-800">
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

          {/* Preview Area */}
          <div className="flex w-1/2 flex-col bg-zinc-100 dark:bg-zinc-900">
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
                      {/* Live iframe preview */}
                      <iframe
                        key={generatedFiles.map((f) => f.path).join(",")}
                        srcDoc={buildPreviewHtml(generatedFiles)}
                        className="flex-1 w-full bg-white"
                        sandbox="allow-scripts allow-same-origin"
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
                    <>
                      {/* File tabs */}
                      <div className="flex items-center gap-0 overflow-x-auto border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                        {generatedFiles.map((file, i) => (
                          <button
                            key={file.path}
                            onClick={() => setActiveFileIndex(i)}
                            className={cn(
                              "shrink-0 border-r border-zinc-200 px-4 py-2 text-xs font-medium transition-colors dark:border-zinc-700",
                              i === activeFileIndex
                                ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white"
                                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700"
                            )}
                          >
                            {file.path.split("/").pop()}
                          </button>
                        ))}
                      </div>
                      {/* File path */}
                      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-1 dark:border-zinc-700 dark:bg-zinc-800">
                        <span className="text-xs text-zinc-400">
                          {generatedFiles[activeFileIndex]?.path}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs"
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
                      {/* Code content */}
                      <pre className="flex-1 overflow-auto p-4 text-sm">
                        <code className="text-zinc-800 dark:text-zinc-200">
                          {generatedFiles[activeFileIndex]?.content}
                        </code>
                      </pre>
                    </>
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
