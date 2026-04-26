// Shared preview HTML builder. Used by:
// - /api/preview/[id]      — embedded iframe in the chat page
// - /api/projects/[id]/deploy — file payload sent to Vercel for ephemeral demos
//
// The output is a self-contained HTML document: Tailwind via CDN, React +
// ReactDOM via CDN, Babel Standalone for in-browser JSX/TS compilation, and
// a framer-motion shim so AI output that reaches for motion.* still renders.

export interface PreviewFile {
  path: string;
  content: string;
  language: string;
}

const LANG_MAP: Record<string, string> = {
  tsx: "typescript",
  ts: "typescript",
  jsx: "javascript",
  js: "javascript",
  css: "css",
  html: "html",
  json: "json",
};

export function parseFilesFromMessage(content: string): PreviewFile[] {
  const files: PreviewFile[] = [];
  const fileRegex = /---FILE:\s*(.+?)---\n([\s\S]*?)---END FILE---/g;
  let match;
  while ((match = fileRegex.exec(content)) !== null) {
    const filePath = match[1].trim();
    const ext = filePath.split(".").pop()?.toLowerCase() || "";
    files.push({
      path: filePath,
      content: match[2].trim(),
      language: LANG_MAP[ext] || "text",
    });
  }
  return files;
}

function stripImportsExports(code: string): string {
  return code
    .replace(/^import\s[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, "")
    .replace(/^import\s+['"][^'"]+['"];?\s*$/gm, "")
    .replace(/^export\s+default\s+function\s+/gm, "function ")
    .replace(/^export\s+default\s+/gm, "const __default__ = ")
    .replace(/^export\s+(?!{)/gm, "")
    .replace(/^export\s*\{[^}]*\};?\s*$/gm, "");
}

export function buildPreviewHtml(files: PreviewFile[]): string {
  if (files.length === 0) return "<html><body><p>No files to preview</p></body></html>";

  const findMain = () => {
    const priority = ["index.tsx", "index.jsx", "index.js", "App.tsx", "App.jsx", "App.js", "page.tsx", "page.jsx", "page.js"];
    for (const name of priority) {
      const f = files.find((f) => f.path.endsWith(name));
      if (f) return f;
    }
    const withExport = files.find((f) => /export\s+default\s+function\s+\w+/.test(f.content));
    if (withExport) return withExport;
    return files.filter((f) => f.language === "typescript" || f.language === "javascript").pop() || files[0];
  };

  const mainFile = findMain();
  if (!mainFile) return "<html><body><p>No component found</p></body></html>";

  const otherFiles = files.filter(
    (f) => f !== mainFile && (f.language === "typescript" || f.language === "javascript")
  );
  const orderedFiles = [...otherFiles, mainFile];

  const allCode = orderedFiles.map((f) => stripImportsExports(f.content)).join("\n\n");

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
    window.__rapidmvpReportError = function (title, msg) {
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: "rapidmvp-preview-error",
            title: String(title || "Error"),
            message: String(msg || ""),
          }, "*");
        }
      } catch (_) { /* postMessage failures are non-fatal */ }
    };
    var reportError = window.__rapidmvpReportError;

    function showError(title, msg) {
      var root = document.getElementById("root");
      root.innerHTML = '<div style="padding:24px;font-family:monospace;font-size:13px;white-space:pre-wrap">' +
        '<div style="color:#ef4444;font-weight:bold;margin-bottom:8px">' + title + '</div>' +
        '<div style="color:#a1a1aa">' + msg + '</div></div>';
      reportError(title, msg);
    }

    window.addEventListener("error", function(e) {
      var root = document.getElementById("root");
      var msg = (e.error && e.error.stack) || e.message || String(e);
      if (root && root.innerHTML.trim() === "") {
        showError("Runtime Error:", msg);
      } else {
        reportError("Runtime Error:", msg);
      }
    });
    window.addEventListener("unhandledrejection", function(e) {
      var msg = (e.reason && (e.reason.stack || e.reason.message)) || String(e.reason);
      reportError("Unhandled Promise Rejection:", msg);
    });

    function boot() {
      if (typeof Babel === "undefined") {
        showError("Loading Error", "Babel failed to load.");
        return;
      }

      var jsxCode = ${JSON.stringify(
    `const { useState, useEffect, useRef, useCallback, useMemo, useReducer, createContext, useContext, Fragment } = React;\n\n` +
    `const __MOTION_PROPS__ = new Set(['initial','animate','exit','whileHover','whileTap','whileFocus','whileInView','whileDrag','transition','variants','viewport','layout','layoutId','drag','dragConstraints','dragElastic','dragMomentum','onAnimationStart','onAnimationComplete','onHoverStart','onHoverEnd','custom']);\n` +
    `function __stripMotionProps__(props) { const out = {}; for (const k in props) { if (!__MOTION_PROPS__.has(k)) out[k] = props[k]; } return out; }\n` +
    `const motion = new Proxy({}, { get: (_, tag) => { if (typeof tag !== 'string') return undefined; return React.forwardRef((props, ref) => React.createElement(tag, Object.assign({ ref }, __stripMotionProps__(props)))); } });\n` +
    `function AnimatePresence(props) { return React.createElement(React.Fragment, null, props.children); }\n\n` +
    safeCode +
    `\n\ntry {\n  const root = ReactDOM.createRoot(document.getElementById("root"));\n  root.render(React.createElement(${componentName}));\n} catch (err) {\n  document.getElementById("root").innerHTML = '<div style="padding:32px;color:#ef4444;font-family:monospace">' + err.message + '</div>';\n  if (typeof window.__rapidmvpReportError === 'function') window.__rapidmvpReportError('Render Error:', err.stack || err.message);\n}`
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
