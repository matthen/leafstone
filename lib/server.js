const { createServer } = require("vite");
const react = require("@vitejs/plugin-react-swc");
const { jsxDevServerPlugin } = require("./plugin");
const path = require("path");
const fs = require("fs");

async function startServer(componentsDir, port = 3000) {
  // Create temporary templates for this session
  const tempDir = path.join(process.cwd(), ".leafstone-temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Copy templates and config
  const templatesDir = path.join(__dirname, "../templates");

  const indexHtml = fs.readFileSync(
    path.join(templatesDir, "index.html"),
    "utf-8"
  );
  const mainJsx = fs.readFileSync(path.join(templatesDir, "main.jsx"), "utf-8");
  const stylesCss = fs.readFileSync(
    path.join(templatesDir, "styles.css"),
    "utf-8"
  );
  // Create dynamic PostCSS config with proper paths
  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: { config: './tailwind.config.js' },
    autoprefixer: {},
  },
}`;
  // Create dynamic tailwind config that includes the components directory
  // Use absolute paths to ensure Tailwind finds all files
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    ${JSON.stringify(path.join(tempDir, "**/*.{html,jsx}"))},
    ${JSON.stringify(path.join(componentsDir, "**/*.jsx"))}
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("tailwind-dracula")(),
  ],
}`;

  // Create all the files first
  fs.writeFileSync(path.join(tempDir, "index.html"), indexHtml);
  fs.writeFileSync(path.join(tempDir, "styles.css"), stylesCss);
  fs.writeFileSync(path.join(tempDir, "tailwind.config.js"), tailwindConfig);
  fs.writeFileSync(path.join(tempDir, "postcss.config.js"), postcssConfig);
  fs.mkdirSync(path.join(tempDir, "src"), { recursive: true });
  fs.writeFileSync(path.join(tempDir, "src/main.jsx"), mainJsx);

  // Create a package.json in temp dir that points to the correct node_modules
  const tempPackageJson = {
    name: "leafstone-temp",
    private: true,
    dependencies: {
      react: "^19.1.1",
      "react-dom": "^19.1.1",
      "lucide-react": "^0.539.0",
    },
  };
  fs.writeFileSync(
    path.join(tempDir, "package.json"),
    JSON.stringify(tempPackageJson, null, 2)
  );

  // Create a symlink to node_modules or copy the necessary modules
  const tempNodeModules = path.join(tempDir, "node_modules");
  const sourceNodeModules = path.join(__dirname, "../node_modules");

  if (!fs.existsSync(tempNodeModules)) {
    try {
      // Try to create a symlink first (this should work and include all dependencies)
      fs.symlinkSync(sourceNodeModules, tempNodeModules, "dir");
    } catch (err) {
      console.log(
        "⚠️  Symlink failed, copying essential modules...",
        err.message
      );
      // If symlink fails, we need to copy more comprehensively
      fs.mkdirSync(tempNodeModules, { recursive: true });

      // Copy the entire node_modules (this is slower but more reliable)
      try {
        fs.cpSync(sourceNodeModules, tempNodeModules, {
          recursive: true,
          // Only copy essential modules to speed it up
          filter: (src) => {
            const essentialModules = [
              "react",
              "react-dom",
              "lucide-react",
              "@types",
              "scheduler",
            ];
            const relativePath = path.relative(sourceNodeModules, src);
            const topLevelModule = relativePath.split(path.sep)[0];

            // Always include root and essential modules
            return (
              src === sourceNodeModules ||
              essentialModules.some((mod) => topLevelModule.startsWith(mod))
            );
          },
        });
      } catch (copyErr) {
        console.error("❌ Failed to copy node_modules:", copyErr.message);
      }
    }
  }

  // Create Vite server with inline Tailwind config
  const server = await createServer({
    root: tempDir,
    plugins: [react(), jsxDevServerPlugin(componentsDir)],
    css: {
      postcss: {
        plugins: [
          require("tailwindcss")({
            content: [
              path.join(tempDir, "**/*.{html,jsx}"),
              path.join(componentsDir, "**/*.jsx"),
            ],
            theme: {
              extend: {},
            },
            plugins: [require("tailwind-dracula")()],
          }),
          require("autoprefixer"),
        ],
      },
    },
    server: {
      port: parseInt(port),
      open: true,
      watch: {
        include: [
          path.join(componentsDir, "**/*.jsx"),
          path.join(tempDir, "**/*.{html,jsx}"),
        ],
      },
    },
    resolve: {
      alias: {
        "@components": componentsDir,
        "lucide-react": path.join(__dirname, "../node_modules/lucide-react"),
      },
      // Add the package's node_modules to the resolve paths
      modules: [
        path.join(__dirname, "../node_modules"),
        path.join(tempDir, "node_modules"),
        "node_modules",
      ],
    },
    // Force rebuild when files change
    optimizeDeps: {
      force: true,
    },
  });

  await server.listen();

  console.log(`✅ Server running at http://localhost:${port}`);
  console.log(`📦 Watching for changes in: ${componentsDir}`);

  // Cleanup on exit
  process.on("SIGTERM", () => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    server.close();
  });

  process.on("SIGINT", () => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    server.close();
    process.exit(0);
  });
}

module.exports = { startServer };
