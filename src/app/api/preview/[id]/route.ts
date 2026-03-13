import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongoose";
import Project from "@/models/Project";

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

// Only strip imports/exports — let Babel's TypeScript preset handle all TS syntax
function stripImportsExports(code: string): string {
  return code
    // Remove all import statements (single and multi-line)
    .replace(/^import\s[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, "")
    .replace(/^import\s+['"][^'"]+['"];?\s*$/gm, "")
    // Convert "export default function X" → "function X"
    .replace(/^export\s+default\s+function\s+/gm, "function ")
    // Convert "export default" (variable) — keep the value
    .replace(/^export\s+default\s+/gm, "const __default__ = ")
    // Remove "export" keyword from other declarations
    .replace(/^export\s+(?!{)/gm, "")
    // Remove "export { ... }" blocks
    .replace(/^export\s*\{[^}]*\};?\s*$/gm, "");
}

function buildPreviewHtml(files: GeneratedFile[]): string {
  if (files.length === 0) return "<html><body><p>No files to preview</p></body></html>";

  const findMain = () => {
    const priority = ["index.tsx", "index.jsx", "App.tsx", "App.jsx", "page.tsx"];
    for (const name of priority) {
      const f = files.find((f) => f.path.endsWith(name));
      if (f) return f;
    }
    return files.find((f) => f.language === "typescript" || f.language === "javascript") || files[0];
  };

  const mainFile = findMain();
  if (!mainFile) return "<html><body><p>No component found</p></body></html>";

  const otherFiles = files.filter(
    (f) => f !== mainFile && (f.language === "typescript" || f.language === "javascript")
  );
  const orderedFiles = [...otherFiles, mainFile];

  const allCode = orderedFiles
    .map((f) => stripImportsExports(f.content))
    .join("\n\n");

  const exportMatch = mainFile.content.match(/export\s+default\s+function\s+(\w+)/);
  const componentName = exportMatch?.[1] || "App";

  const cssFiles = files.filter((f) => f.language === "css");
  const cssContent = cssFiles.map((f) => f.content).join("\n");

  const safeCode = allCode.replace(/<\/script>/gi, "<\\/script>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    #root { min-height: 100vh; }
    ${cssContent}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    function showError(title, msg) {
      var root = document.getElementById("root");
      root.innerHTML = '<div style="padding:24px;font-family:monospace;font-size:13px;white-space:pre-wrap">' +
        '<div style="color:#ef4444;font-weight:bold;margin-bottom:8px">' + title + '</div>' +
        '<div style="color:#a1a1aa">' + msg + '</div></div>';
    }

    function boot() {
      if (typeof Babel === "undefined") {
        showError("Loading Error", "Babel failed to load.");
        return;
      }

      var jsxCode = ${JSON.stringify(
    `const { useState, useEffect, useRef, useCallback, useMemo, useReducer, createContext, useContext, Fragment } = React;\n\n` +
    safeCode +
    `\n\ntry {\n  const root = ReactDOM.createRoot(document.getElementById("root"));\n  root.render(React.createElement(${componentName}));\n} catch (err) {\n  document.getElementById("root").innerHTML = '<div style="padding:32px;color:#ef4444;font-family:monospace">' + err.message + '</div>';\n}`
  )};

      try {
        var output = Babel.transform(jsxCode, { presets: ["react", "typescript"], filename: "preview.tsx" });
        var fn = new Function(output.code);
        fn();
      } catch (err) {
        showError("Compile/Render Error:", err.message);
      }
    }

    var attempts = 0;
    var timer = setInterval(function() {
      attempts++;
      if (typeof Babel !== "undefined") {
        clearInterval(timer);
        boot();
      } else if (attempts > 50) {
        clearInterval(timer);
        showError("Timeout", "Babel did not load after 5 seconds.");
      }
    }, 100);
  </script>
</body>
</html>`;
}

// GET /api/preview/[id] — serve preview HTML for a project (same-origin, no CORS issues)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("<html><body><p>Unauthorized</p></body></html>", {
      status: 401,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return new Response("<html><body><p>Invalid project ID</p></body></html>", {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  await dbConnect();

  const project = await Project.findOne({
    _id: id,
    owner: session.user.id,
  }).lean();

  if (!project) {
    return new Response("<html><body><p>Project not found</p></body></html>", {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  const files: GeneratedFile[] = (project.files || []).map((f: any) => ({
    path: f.path,
    content: f.content,
    language: f.language,
  }));

  const html = buildPreviewHtml(files);

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
