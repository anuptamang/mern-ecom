import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the project root directory where .md files are located
 */
const getDocsPath = () => {
  // Try path from controller location first
  const controllerPath = path.join(__dirname, '..', '..');
  
  // Verify the path exists and contains .md files
  if (fs.existsSync(controllerPath)) {
    try {
      const files = fs.readdirSync(controllerPath);
      const hasMdFiles = files.some(file => file.endsWith('.md'));
      if (hasMdFiles) {
        return controllerPath;
      }
    } catch (error) {
      // Fall through to process.cwd()
    }
  }
  
  // Fallback to process.cwd() (project root)
  return process.cwd();
};

/**
 * Get list of all documentation files
 */
export const getDocsList = async (req, res) => {
  try {
    const docsPath = getDocsPath();
    
    // Verify directory exists
    if (!fs.existsSync(docsPath)) {
      console.error('Docs path does not exist:', docsPath);
      return res.status(500).json({ 
        message: 'Documentation directory not found',
        error: `Path: ${docsPath}`
      });
    }
    
    const files = fs.readdirSync(docsPath);
    
    const docsFiles = files
      .filter(file => file.endsWith('.md') && file !== 'README.md')
      .map(file => ({
        filename: file,
        name: file.replace('.md', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        slug: file.replace('.md', '').toLowerCase(),
      }))
      .sort((a, b) => {
        // Sort DOCUMENTATION.md first, then others alphabetically
        if (a.filename === 'DOCUMENTATION.md') return -1;
        if (b.filename === 'DOCUMENTATION.md') return 1;
        return a.name.localeCompare(b.name);
      });

    return res.json({ docs: docsFiles });
  } catch (error) {
    console.error('Error getting docs list:', error);
    return res.status(500).json({ 
      message: 'Failed to get documentation list',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get a specific documentation file
 */
export const getDoc = async (req, res) => {
  try {
    const { docName } = req.params;
    
    // Security: Only allow .md files, prevent directory traversal
    if (!docName.endsWith('.md') || docName.includes('..') || docName.includes('/')) {
      return res.status(400).json({ message: 'Invalid documentation file name' });
    }

    const docsPath = path.join(getDocsPath(), docName);
    
    // Check if file exists
    if (!fs.existsSync(docsPath)) {
      return res.status(404).json({ message: 'Documentation file not found' });
    }

    // Read file content
    const content = fs.readFileSync(docsPath, 'utf-8');

    return res.json({ 
      filename: docName,
      name: docName.replace('.md', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      slug: docName.replace('.md', '').toLowerCase(),
      content 
    });
  } catch (error) {
    console.error('Error getting doc:', error);
    return res.status(500).json({ message: 'Failed to get documentation' });
  }
};

/**
 * Search documentation files
 */
export const searchDocs = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.json({ results: [] });
    }

    const docsPath = getDocsPath();
    const files = fs.readdirSync(docsPath);
    
    const searchQuery = query.toLowerCase();
    const results = [];

    for (const file of files) {
      if (!file.endsWith('.md') || file === 'README.md') continue;

      const filePath = path.join(docsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Simple search: check if query appears in content or filename
      const contentLower = content.toLowerCase();
      const filenameLower = file.toLowerCase();
      
      if (contentLower.includes(searchQuery) || filenameLower.includes(searchQuery)) {
        // Find matching lines/paragraphs
        const lines = content.split('\n');
        const matches = [];
        
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(searchQuery)) {
            // Get context (previous and next lines)
            const contextStart = Math.max(0, index - 1);
            const contextEnd = Math.min(lines.length - 1, index + 1);
            const context = lines.slice(contextStart, contextEnd + 1).join('\n');
            
            matches.push({
              line: index + 1,
              text: line.trim(),
              context: context.trim(),
            });
          }
        });

        results.push({
          filename: file,
          name: file.replace('.md', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          slug: file.replace('.md', '').toLowerCase(),
          matches: matches.slice(0, 5), // Limit to 5 matches per file
          matchCount: matches.length,
        });
      }
    }

    // Sort by relevance (more matches = more relevant)
    results.sort((a, b) => b.matchCount - a.matchCount);

    return res.json({ results });
  } catch (error) {
    console.error('Error searching docs:', error);
    return res.status(500).json({ message: 'Failed to search documentation' });
  }
};
