"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    async function createAndRedirect() {
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "New Project" }),
        });

        if (res.ok) {
          const data = await res.json();
          router.replace(`/chat/${data.project._id}`);
        } else {
          setError("Failed to create project. Please try again.");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }
    }

    createAndRedirect();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        {error ? (
          <>
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-violet-600 underline"
            >
              Back to Dashboard
            </button>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <p className="text-sm text-zinc-500">
              Setting up your new project...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
