import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the docs directory path
 */
const getDocsPath = () => {
  // Try path from controller location first
  const controllerPath = path.join(__dirname, "..", "..", "docs");

  // Verify the docs directory exists
  if (fs.existsSync(controllerPath)) {
    return controllerPath;
  }

  // Fallback to process.cwd()/docs
  const fallbackPath = path.join(process.cwd(), "docs");
  if (fs.existsSync(fallbackPath)) {
    return fallbackPath;
  }

  // Last fallback: project root (for backward compatibility)
  return process.cwd();
};

/**
 * Recursively get all .md files from a directory
 */
const getAllMdFiles = (dir, basePath = "") => {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = basePath ? `${basePath}/${item.name}` : item.name;

    if (item.isDirectory()) {
      // Recursively scan subdirectories
      const subFiles = getAllMdFiles(fullPath, relativePath);
      files.push(...subFiles);
    } else if (item.isFile() && item.name.endsWith(".md")) {
      // Add markdown file (include README files)
      files.push({
        filename: item.name,
        path: relativePath,
        fullPath: fullPath,
        name: item.name
          .replace(".md", "")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        slug: relativePath
          .replace(/\.md$/, "")
          .replace(/\//g, "-")
          .toLowerCase(),
        category: basePath || "root",
      });
    }
  }

  return files;
};

/**
 * Build hierarchical structure from files
 */
const buildHierarchy = (files) => {
  const tree = {};

  files.forEach((file) => {
    const parts = file.path.split("/");
    let current = tree;

    // Build tree structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = { type: "folder", name: part, children: {}, files: [] };
      }
      current = current[part].children;
    }

    // Add file to appropriate level
    const folderPath = parts.slice(0, -1).join("/");
    if (folderPath) {
      const folderParts = folderPath.split("/");
      let folder = tree;
      folderParts.forEach((part) => {
        folder = folder[part].children;
      });
      if (!folder._files) folder._files = [];
      folder._files.push(file);
    } else {
      if (!tree._files) tree._files = [];
      tree._files.push(file);
    }
  });

  // Convert to array structure
  const convertToArray = (obj, category = "") => {
    const result = [];

    // Add files first
    if (obj._files) {
      result.push(
        ...obj._files.map((file) => ({
          ...file,
          category,
          isFolder: false,
        }))
      );
    }

    // Then add folders
    Object.keys(obj).forEach((key) => {
      if (key !== "_files" && obj[key].type === "folder") {
        const folder = obj[key];
        const folderCategory = category ? `${category}/${key}` : key;
        result.push({
          type: "folder",
          name: folder.name,
          category: folderCategory,
          isFolder: true,
          filename: folderCategory, // Use category as identifier for folders
          path: folderCategory, // Use category as path for folders
          children: convertToArray(folder.children, folderCategory),
        });
      }
    });

    return result.sort((a, b) => {
      // Sort folders first, then files
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      // Then alphabetically
      return a.name.localeCompare(b.name);
    });
  };

  return convertToArray(tree);
};

/**
 * Get list of all documentation files (hierarchical structure)
 */
export const getDocsList = async (req, res) => {
  try {
    const docsPath = getDocsPath();

    // Verify directory exists
    if (!fs.existsSync(docsPath)) {
      console.error("Docs path does not exist:", docsPath);
      return res.status(500).json({
        message: "Documentation directory not found",
        error: `Path: ${docsPath}`,
      });
    }

    // Recursively get all .md files
    const allFiles = getAllMdFiles(docsPath);

    // Build hierarchical structure
    const hierarchy = buildHierarchy(allFiles);

    // Also return flat list for backward compatibility
    // Use 'path' as filename for nested paths, 'filename' for root files
    const flatList = allFiles.map((file) => ({
      filename: file.path, // Use full path for nested files
      name: file.name,
      slug: file.slug,
      category: file.category,
      path: file.path, // Include path for reference
    }));

    return res.json({
      docs: flatList,
      hierarchy: hierarchy,
    });
  } catch (error) {
    console.error("Error getting docs list:", error);
    return res.status(500).json({
      message: "Failed to get documentation list",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Recursively search for a file by name
 */
const findFileByName = (dir, filename, basePath = "") => {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = basePath ? `${basePath}/${item.name}` : item.name;

    if (item.isDirectory()) {
      // Recursively search subdirectories
      const found = findFileByName(fullPath, filename, relativePath);
      if (found) return found;
    } else if (item.isFile() && item.name === filename) {
      // Found the file
      return {
        fullPath,
        relativePath,
      };
    }
  }

  return null;
};

export const getDoc = async (req, res) => {
  try {
    // Handle wildcard route - get the full path from req.params[0]
    let docName = req.params[0] || req.params.docName || "";

    // Remove leading slash if present
    if (docName.startsWith("/")) {
      docName = docName.substring(1);
    }

    // Security: Only allow .md files, prevent directory traversal
    if (!docName || !docName.endsWith(".md") || docName.includes("..")) {
      return res
        .status(400)
        .json({ message: "Invalid documentation file name" });
    }

    const docsPath = getDocsPath();
    let filePath = path.join(docsPath, docName);

    // Normalize path to prevent directory traversal
    let normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(path.normalize(docsPath))) {
      return res
        .status(400)
        .json({ message: "Invalid documentation file path" });
    }

    // Check if file exists at the exact path first
    let actualFilePath = normalizedPath;
    let actualDocName = docName;

    if (!fs.existsSync(normalizedPath)) {
      // File not found at exact path, try to find it by filename
      // Extract just the filename from the path
      const pathParts = docName.split("/");
      const filename = pathParts[pathParts.length - 1];

      // Search recursively for the file
      const found = findFileByName(docsPath, filename);

      if (found) {
        // Found the file in a subdirectory
        actualFilePath = found.fullPath;
        actualDocName = found.relativePath;
      } else {
        // File not found anywhere
        return res.status(404).json({
          message: "Documentation file not found",
          requested: docName,
          suggestion:
            "The file might be in a subdirectory. Please check the file path.",
        });
      }
    }

    // Read file content
    const content = fs.readFileSync(actualFilePath, "utf-8");

    // Extract readable name from path
    const pathParts = actualDocName.split("/");
    const filename = pathParts[pathParts.length - 1];
    const name = filename
      .replace(".md", "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return res.json({
      filename: actualDocName, // Return the actual path where file was found
      name: name,
      slug: actualDocName
        .replace(/\.md$/, "")
        .replace(/\//g, "-")
        .toLowerCase(),
      content,
      // Include original request if different from actual path
      ...(actualDocName !== docName && { requested: docName }),
    });
  } catch (error) {
    console.error("Error getting doc:", error);
    return res.status(500).json({ message: "Failed to get documentation" });
  }
};

/**
 * Search documentation files (recursively)
 */
export const searchDocs = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.json({ results: [] });
    }

    const docsPath = getDocsPath();
    const allFiles = getAllMdFiles(docsPath);

    const searchQuery = query.toLowerCase();
    const results = [];

    for (const file of allFiles) {
      // Include all markdown files (including README files)

      const content = fs.readFileSync(file.fullPath, "utf-8");

      // Simple search: check if query appears in content or filename
      const contentLower = content.toLowerCase();
      const filenameLower = file.filename.toLowerCase();
      const pathLower = file.path.toLowerCase();

      if (
        contentLower.includes(searchQuery) ||
        filenameLower.includes(searchQuery) ||
        pathLower.includes(searchQuery)
      ) {
        // Find matching lines/paragraphs
        const lines = content.split("\n");
        const matches = [];

        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(searchQuery)) {
            // Get context (previous and next lines)
            const contextStart = Math.max(0, index - 1);
            const contextEnd = Math.min(lines.length - 1, index + 1);
            const context = lines
              .slice(contextStart, contextEnd + 1)
              .join("\n");

            matches.push({
              line: index + 1,
              text: line.trim(),
              context: context.trim(),
            });
          }
        });

        results.push({
          filename: file.path,
          name: file.name,
          slug: file.slug,
          category: file.category,
          matches: matches.slice(0, 5), // Limit to 5 matches per file
          matchCount: matches.length,
        });
      }
    }

    // Sort by relevance (more matches = more relevant)
    results.sort((a, b) => b.matchCount - a.matchCount);

    return res.json({ results });
  } catch (error) {
    console.error("Error searching docs:", error);
    return res.status(500).json({ message: "Failed to search documentation" });
  }
};
