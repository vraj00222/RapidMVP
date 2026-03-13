/**
 * Generates a full Vite + React project structure from generated component files.
 * The exported zip can be run with: npm install && npm run dev
 */

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

interface ScaffoldFile {
  path: string;
  content: string;
}

/** Check if file content contains JSX syntax */
function containsJSX(content: string): boolean {
  // Look for JSX tags: <Component, <div, </div>, self-closing <X />
  return /<[A-Za-z][A-Za-z0-9]*[\s/>]/.test(content) || /<\/[A-Za-z]/.test(content);
}

/** Ensure file has a .jsx/.tsx extension if it contains JSX */
function ensureJSXExtension(filePath: string, content: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  if (ext === "js" && containsJSX(content)) return filePath.replace(/\.js$/, ".jsx");
  if (ext === "ts" && containsJSX(content)) return filePath.replace(/\.ts$/, ".tsx");
  return filePath;
}

/** Extract all top-level component function names from code */
function extractComponentNames(content: string): string[] {
  const names: string[] = [];
  const regex = /^(?:export\s+default\s+)?function\s+([A-Z]\w*)/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    names.push(match[1]);
  }
  return names;
}

export function scaffoldProject(
  projectName: string,
  files: GeneratedFile[]
): ScaffoldFile[] {
  const safeName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "my-project";

  const output: ScaffoldFile[] = [];

  // package.json
  output.push({
    path: "package.json",
    content: JSON.stringify(
      {
        name: safeName,
        private: true,
        version: "0.0.1",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview",
        },
        dependencies: {
          react: "^18.3.1",
          "react-dom": "^18.3.1",
        },
        devDependencies: {
          "@vitejs/plugin-react": "^4.3.4",
          vite: "^6.0.0",
          tailwindcss: "^3.4.17",
          postcss: "^8.4.49",
          autoprefixer: "^10.4.20",
        },
      },
      null,
      2
    ),
  });

  // vite.config.js
  output.push({
    path: "vite.config.js",
    content: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
`,
  });

  // tailwind.config.js
  output.push({
    path: "tailwind.config.js",
    content: `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
`,
  });

  // postcss.config.js
  output.push({
    path: "postcss.config.js",
    content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,
  });

  // index.html
  output.push({
    path: "index.html",
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
  });

  // src/index.css
  output.push({
    path: "src/index.css",
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}
`,
  });

  // --- Pre-process: build a map of component name → corrected file path ---
  const mainFile = findMainFile(files);
  const mainComponentName = extractComponentName(mainFile);

  // Map each file to its corrected src path (with .jsx/.tsx extension)
  const filePathMap = new Map<GeneratedFile, string>();
  // Map component names to their import path (relative from src/)
  const componentImportMap = new Map<string, string>();

  for (const file of files) {
    const srcPath = toSrcPath(file.path);
    const correctedPath = ensureJSXExtension(srcPath, file.content);
    filePathMap.set(file, correctedPath);

    // Register all component names from this file
    const names = extractComponentNames(file.content);
    for (const name of names) {
      componentImportMap.set(name, correctedPath);
    }
  }

  const mainSrcPath = filePathMap.get(mainFile)!;

  // src/main.jsx — entry point
  output.push({
    path: "src/main.jsx",
    content: `import React from "react";
import ReactDOM from "react-dom/client";
import ${mainComponentName} from "./${stripExtension(mainSrcPath)}";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <${mainComponentName} />
  </React.StrictMode>
);
`,
  });

  // Add all generated files under src/
  for (const file of files) {
    const correctedPath = filePathMap.get(file)!;
    let content = file.content;

    // --- Build import statements for components used in this file ---
    // Find component references: <ComponentName or ComponentName(
    const usedComponents = new Set<string>();
    const componentRefRegex = /\b([A-Z][A-Za-z0-9]*)\b/g;
    let refMatch;
    while ((refMatch = componentRefRegex.exec(content)) !== null) {
      const name = refMatch[1];
      // Skip: React built-ins, the component's own name, HTML-like names
      if (
        ["React", "Fragment", "StrictMode", "Suspense", "Component", "Promise", "Error", "Array", "Object", "String", "Number", "Boolean", "Map", "Set", "Date", "JSON", "Math", "RegExp", "URL", "FormData", "Response", "Request"].includes(name)
      ) continue;
      // Skip if it's defined in this file
      const ownNames = extractComponentNames(content);
      if (ownNames.includes(name)) continue;
      // Only add if we know which file it comes from
      if (componentImportMap.has(name)) {
        usedComponents.add(name);
      }
    }

    // Remove existing import/export statements (AI generates these for browser preview)
    content = content
      .replace(/^import\s[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, "")
      .replace(/^import\s+['"][^'"]+['"];?\s*$/gm, "");

    // Add React import
    const hooks = [
      "useState", "useEffect", "useRef", "useCallback",
      "useMemo", "useReducer", "useContext", "createContext", "Fragment",
    ].filter((h) => content.includes(h));

    const reactImport = hooks.length > 0
      ? `import React, { ${hooks.join(", ")} } from "react";`
      : `import React from "react";`;

    // Build import lines for other components
    const importLines: string[] = [reactImport];
    for (const compName of usedComponents) {
      const compPath = componentImportMap.get(compName)!;
      // Compute relative path from this file's directory
      const fromDir = correctedPath.includes("/")
        ? correctedPath.substring(0, correctedPath.lastIndexOf("/"))
        : "";
      const toPath = stripExtension(compPath);
      const relativePath = fromDir === ""
        ? `./${toPath}`
        : computeRelativePath(fromDir, toPath);
      importLines.push(`import ${compName} from "${relativePath}";`);
    }

    // Ensure main component has export default
    if (file === mainFile) {
      if (!content.includes("export default")) {
        content = content.replace(
          new RegExp(`^(function\\s+${mainComponentName})`, "m"),
          `export default $1`
        );
      }
    } else {
      // Non-main files: ensure export default on the first component
      if (!content.includes("export default")) {
        const funcMatch = content.match(/^function\s+([A-Z]\w*)/m);
        if (funcMatch) {
          content = content.replace(
            new RegExp(`^(function\\s+${funcMatch[1]})`, "m"),
            `export default $1`
          );
        }
      }
    }

    // Remove any "export" that isn't "export default" (cleanup)
    content = content.replace(/^export\s+(?!default\b)/gm, "");

    // Combine: imports + cleaned content
    const finalContent = importLines.join("\n") + "\n\n" + content.trim() + "\n";

    output.push({
      path: `src/${correctedPath}`,
      content: finalContent,
    });
  }

  // .gitignore
  output.push({
    path: ".gitignore",
    content: `node_modules
dist
.env
.env.local
`,
  });

  // README.md
  output.push({
    path: "README.md",
    content: `# ${projectName}

Generated with [RapidMVP](https://rapidmvp.dev)

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173) in your browser.
`,
  });

  return output;
}

function findMainFile(files: GeneratedFile[]): GeneratedFile {
  const priority = ["index.tsx", "index.jsx", "App.tsx", "App.jsx", "page.tsx", "index.js", "App.js"];
  for (const name of priority) {
    const f = files.find((f) => f.path.endsWith(name));
    if (f) return f;
  }
  // Fallback: last file (AI usually puts main entry last)
  return files[files.length - 1] || files[0];
}

function extractComponentName(file: GeneratedFile): string {
  const match = file.content.match(
    /(?:export\s+default\s+)?function\s+([A-Z]\w*)/
  );
  return match?.[1] || "App";
}

function toSrcPath(filePath: string): string {
  return filePath.replace(/^src\//, "");
}

function stripExtension(path: string): string {
  return path.replace(/\.(tsx?|jsx?)$/, "");
}

function computeRelativePath(fromDir: string, toPath: string): string {
  const fromParts = fromDir.split("/").filter(Boolean);
  const toParts = toPath.split("/").filter(Boolean);

  // Find common prefix
  let common = 0;
  while (common < fromParts.length && common < toParts.length && fromParts[common] === toParts[common]) {
    common++;
  }

  const ups = fromParts.length - common;
  const remainder = toParts.slice(common);

  if (ups === 0) return `./${remainder.join("/")}`;
  return "../".repeat(ups) + remainder.join("/");
}

/**
 * Builds the StackBlitz project payload from generated files.
 */
export function buildStackBlitzProject(
  projectName: string,
  files: GeneratedFile[]
): { title: string; template: "node"; files: Record<string, string> } {
  const scaffolded = scaffoldProject(projectName, files);
  const fileMap: Record<string, string> = {};

  for (const f of scaffolded) {
    fileMap[f.path] = f.content;
  }

  return {
    title: projectName,
    template: "node" as const,
    files: fileMap,
  };
}
