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

  // Find the main entry component
  const mainFile = findMainFile(files);
  const mainComponentName = extractComponentName(mainFile);

  // Determine the main file's src path
  const mainSrcPath = toSrcPath(mainFile.path);

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
    const srcPath = toSrcPath(file.path);
    let content = file.content;

    // Add React import if the file uses JSX and doesn't already import React
    if (
      (file.language === "javascript" || file.language === "typescript") &&
      !content.includes("import React")
    ) {
      const needsReact = content.includes("<") && content.includes("/>");
      const needsHooks = /\b(useState|useEffect|useRef|useCallback|useMemo|useReducer|useContext|createContext|Fragment)\b/.test(content);

      if (needsReact || needsHooks) {
        const hooks = [
          "useState",
          "useEffect",
          "useRef",
          "useCallback",
          "useMemo",
          "useReducer",
          "useContext",
          "createContext",
          "Fragment",
        ].filter((h) => content.includes(h));

        const hookImport =
          hooks.length > 0
            ? `import React, { ${hooks.join(", ")} } from "react";\n`
            : `import React from "react";\n`;

        content = hookImport + content;
      }
    }

    // Ensure the main component has export default
    if (file === mainFile && !content.includes("export default")) {
      content = content.replace(
        new RegExp(`^(function\\s+${mainComponentName})`, "m"),
        `export default $1`
      );
    }

    // For non-main files, ensure they have export default if they define a component
    if (file !== mainFile && !content.includes("export")) {
      const funcMatch = content.match(/^function\s+([A-Z]\w*)/m);
      if (funcMatch) {
        content = content.replace(
          new RegExp(`^(function\\s+${funcMatch[1]})`, "m"),
          `export default $1`
        );
      }
    }

    output.push({
      path: `src/${srcPath}`,
      content,
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
  const priority = ["index.tsx", "index.jsx", "App.tsx", "App.jsx", "page.tsx"];
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
  // Remove leading src/ if already present
  return filePath.replace(/^src\//, "");
}

function stripExtension(path: string): string {
  return path.replace(/\.(tsx?|jsx?)$/, "");
}

/**
 * Builds the StackBlitz project payload from generated files.
 * Used with the StackBlitz SDK's `openProject` method.
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
