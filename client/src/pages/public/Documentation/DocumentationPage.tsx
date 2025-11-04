import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Layout,
  Input,
  Card,
  Spin,
  Empty,
  message,
  Typography,
  Space,
  List,
  Tag,
  Anchor,
  Affix,
  Tree,
} from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  HomeOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getDocsListApi,
  getDocApi,
  searchDocsApi,
  IDocFile,
  IDocContent,
  ISearchResult,
  IDocsListResponse,
} from 'services/endPoints/docs/docsEndpoints';
import { useTheme } from 'hooks/useTheme';
import mermaid from 'mermaid';
import 'highlight.js/styles/github.css';
import './DocumentationPage.scss';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { Search } = Input;

const DocumentationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { colorScheme } = useTheme();
  const [docs, setDocs] = useState<IDocFile[]>([]);
  const [hierarchy, setHierarchy] = useState<IDocFile[]>([]);
  const [currentDoc, setCurrentDoc] = useState<IDocContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ISearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string>('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const mermaidRef = useRef<HTMLDivElement>(null);

  // Get selected doc from URL
  const docSlug = searchParams.get('doc') || '';

  // Convert hierarchy to Ant Design Tree structure
  const buildTreeData = (items: IDocFile[], parentPath: string = ''): any[] => {
    return items.map((item, index) => {
      // Ensure we have a valid filename or slug
      const itemFilename =
        item.filename || item.slug || item.name || `item-${index}`;
      const itemSlug = item.slug || itemFilename;

      // Create unique key using parent path + filename to avoid duplicates
      const uniqueKey = parentPath
        ? `${parentPath}/${itemFilename}`
        : `${itemSlug}-${index}`;

      if (item.isFolder && item.children) {
        const folderPath = parentPath
          ? `${parentPath}/${item.name}`
          : item.name;
        return {
          title: item.name,
          key: uniqueKey,
          icon: <FolderOutlined />,
          children: buildTreeData(item.children, folderPath),
        };
      } else {
        return {
          title: item.name,
          key: uniqueKey,
          icon: <FileTextOutlined />,
          isLeaf: true,
          filename: item.filename || item.path || itemSlug, // Store actual filename/path for selection
        };
      }
    });
  };

  const treeData = useMemo(() => {
    if (hierarchy.length > 0) {
      return buildTreeData(hierarchy);
    }
    // Fallback to flat list
    return docs.map((doc) => ({
      title: doc.name,
      key: doc.filename,
      icon: <FileTextOutlined />,
      isLeaf: true,
      filename: doc.filename,
    }));
  }, [hierarchy, docs]);

  useEffect(() => {
    loadDocsList();
  }, []);

  useEffect(() => {
    if (docs.length > 0 && treeData.length > 0) {
      if (docSlug) {
        // Normalize the slug for comparison (lowercase)
        const normalizedSlug = docSlug.toLowerCase().trim();
        
        // Find the doc by slug - prioritize exact matches
        let doc = docs.find((d) => {
          if (d.isFolder) return false;
          // Try exact slug match first
          if (d.slug?.toLowerCase() === normalizedSlug) return true;
          // Try exact filename match (converted to slug format)
          const filenameSlug = (d.filename || '')
            .toLowerCase()
            .replace(/\.md$/, '')
            .replace(/\//g, '-');
          if (filenameSlug === normalizedSlug) return true;
          // Try exact path match (converted to slug format)
          const pathSlug = (d.path || d.filename || '')
            .toLowerCase()
            .replace(/\.md$/, '')
            .replace(/\//g, '-');
          if (pathSlug === normalizedSlug) return true;
          return false;
        });
        
        // If no exact match found and slug is just "readme", try to find by path context
        if (!doc && normalizedSlug === 'readme') {
          // Try to find README files and prioritize root-level README
          const readmeFiles = docs.filter(
            (d) =>
              !d.isFolder &&
              (d.filename.endsWith('README.md') ||
                d.filename.endsWith('readme.md'))
          );
          // Prioritize root-level README (no slashes in path)
          doc = readmeFiles.find((d) => !d.filename.includes('/')) || readmeFiles[0];
        }
        
        // Only use partial matches as last resort and only if slug has more context
        if (!doc && normalizedSlug.includes('-')) {
          // Try finding by slug that ends with the docSlug (for nested paths)
          doc = docs.find((d) => {
            if (d.isFolder) return false;
            const slug = d.slug?.toLowerCase() || '';
            // Check if slug ends with the requested slug (for nested paths like "diagrams-readme")
            return slug.endsWith(`-${normalizedSlug}`) || slug === normalizedSlug;
          });
        }
        
        if (doc && !doc.isFolder) {
          loadDoc(doc.filename);
        } else {
          // If still not found, show error message
          console.warn(`Document not found for slug: ${docSlug}`);
        }
      } else {
        // Load first doc or README if available
        const readme = docs.find(
          (d) =>
            !d.isFolder &&
            (d.filename.includes('README.md') ||
              d.filename.includes('index.md')) &&
            !d.filename.includes('/') // Prioritize root README
        );
        const firstDoc = readme || docs.find((d) => !d.isFolder) || docs[0];
        if (firstDoc && !firstDoc.isFolder) {
          loadDoc(firstDoc.filename);
        }
      }
    }
  }, [docs, docSlug, treeData]);

  // Initialize Mermaid and render diagrams
  useEffect(() => {
    if (currentDoc && mermaidRef.current) {
      // Get actual color values from theme (not CSS variables)
      const primaryColor = colorScheme.primary || '#0071e3';
      const textColor = colorScheme.textInverse || '#ffffff';
      const borderColor = colorScheme.border || '#d1d1d1';
      const secondaryBg = colorScheme.backgroundSecondary || '#fafafa';
      const tertiaryBg = colorScheme.backgroundTertiary || '#f5f5f5';

      // Initialize Mermaid
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
        },
        themeVariables: {
          primaryColor: primaryColor,
          primaryTextColor: textColor,
          primaryBorderColor: primaryColor,
          lineColor: borderColor,
          secondaryColor: secondaryBg,
          tertiaryColor: tertiaryBg,
        },
      });

      // Wait for React to finish rendering, then render Mermaid diagrams
      // Use requestAnimationFrame to ensure DOM is ready, then setTimeout for ReactMarkdown
      const renderDiagrams = async () => {
        // Wait for next frame to ensure DOM is updated
        await new Promise((resolve) => requestAnimationFrame(resolve));
        
        // Additional delay to ensure ReactMarkdown has rendered
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        if (mermaidRef.current) {
          // Find all mermaid divs that haven't been rendered yet (no SVG inside)
          const mermaidDivs = mermaidRef.current.querySelectorAll('.mermaid');
          
          if (mermaidDivs.length === 0) {
            console.warn('No Mermaid diagrams found in the document');
            return;
          }

          console.log(`Found ${mermaidDivs.length} Mermaid diagram(s) to render`);

          const renderPromises = Array.from(mermaidDivs)
            .filter((div): div is HTMLElement => {
              // Type guard: ensure div is HTMLElement
              if (!(div instanceof HTMLElement)) return false;
              
              // Only render if div doesn't already have SVG content
              const hasSvg = !!div.querySelector('svg');
              const hasContent = !!div.textContent?.trim();
              const shouldRender = !hasSvg && hasContent;
              
              if (!shouldRender) {
                console.debug('Skipping Mermaid div:', {
                  hasSvg,
                  hasContent,
                  id: div.id,
                  textContent: div.textContent?.substring(0, 50)
                });
              }
              
              return shouldRender;
            })
            .map(async (div, index) => {
              // Generate unique ID for each diagram
              const id = div.id || `mermaid-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
              let content = div.textContent?.trim() || div.innerHTML?.trim() || '';
              
              // Remove any code tags that might be present
              content = content.replace(/<code[^>]*>|<\/code>/gi, '').trim();

              if (!content) {
                console.warn(`No content found for Mermaid diagram with id: ${id}`);
                return;
              }

              if (!div.id) {
                // Set ID if not already set
                div.id = id;
              }

              try {
                console.log(`Rendering Mermaid diagram ${index + 1}/${mermaidDivs.length} with id: ${id}`);
                // Render the Mermaid diagram using async API
                const result = await mermaid.render(id, content);
                
                // Clear any existing content and insert SVG
                div.innerHTML = result.svg;
                
                // Verify SVG was inserted and is visible
                const svgElement = div.querySelector('svg') as SVGElement | null;
                if (svgElement) {
                  // Force visibility with inline styles (use !important via setProperty)
                  svgElement.style.setProperty('display', 'block', 'important');
                  svgElement.style.setProperty('visibility', 'visible', 'important');
                  svgElement.style.setProperty('opacity', '1', 'important');
                  svgElement.style.setProperty('width', 'auto', 'important');
                  svgElement.style.setProperty('height', 'auto', 'important');
                  
                  // Ensure parent div and all ancestors are visible
                  let currentElement: HTMLElement | null = div;
                  while (currentElement && currentElement !== mermaidRef.current) {
                    currentElement.style.setProperty('display', 'block', 'important');
                    currentElement.style.setProperty('visibility', 'visible', 'important');
                    currentElement.style.setProperty('opacity', '1', 'important');
                    currentElement = currentElement.parentElement;
                  }
                  
                  // Also ensure mermaidRef is visible
                  if (mermaidRef.current) {
                    mermaidRef.current.style.setProperty('display', 'block', 'important');
                    mermaidRef.current.style.setProperty('visibility', 'visible', 'important');
                  }
                  
                  const computedStyles = window.getComputedStyle(svgElement);
                  const parentStyles = window.getComputedStyle(div);
                  const svgRect = svgElement.getBoundingClientRect();
                  
                  // Check if SVG has zero dimensions and fix if needed
                  if (svgRect.width === 0 || svgRect.height === 0) {
                    console.warn(`SVG has zero dimensions for diagram: ${id}, attempting to fix...`);
                    // Try to get dimensions from viewBox or attributes
                    const viewBox = svgElement.getAttribute('viewBox');
                    if (viewBox) {
                      const [, , width, height] = viewBox.split(' ').map(Number);
                      if (width && height) {
                        svgElement.setAttribute('width', width.toString());
                        svgElement.setAttribute('height', height.toString());
                        svgElement.style.setProperty('width', `${width}px`, 'important');
                        svgElement.style.setProperty('height', `${height}px`, 'important');
                      }
                    }
                  }
                  
                  // Ensure container has proper dimensions
                  if (div.getBoundingClientRect().width === 0) {
                    div.style.setProperty('min-width', '300px', 'important');
                    div.style.setProperty('width', '100%', 'important');
                  }
                  
                  console.log(`Successfully rendered Mermaid diagram: ${id}`, {
                    svgWidth: svgElement.getAttribute('width'),
                    svgHeight: svgElement.getAttribute('height'),
                    svgViewBox: svgElement.getAttribute('viewBox'),
                    svgDisplay: computedStyles.display,
                    svgVisibility: computedStyles.visibility,
                    svgOpacity: computedStyles.opacity,
                    svgWidthComputed: computedStyles.width,
                    svgHeightComputed: computedStyles.height,
                    svgRectWidth: svgRect.width,
                    svgRectHeight: svgRect.height,
                    svgRectTop: svgRect.top,
                    svgRectLeft: svgRect.left,
                    parentDisplay: parentStyles.display,
                    parentVisibility: parentStyles.visibility,
                    parentWidth: parentStyles.width,
                    parentHeight: parentStyles.height,
                    parentRect: div.getBoundingClientRect(),
                    svgParent: svgElement.parentElement?.tagName,
                    svgParentClass: svgElement.parentElement?.className
                  });
                } else {
                  console.error(`SVG not found after rendering for diagram: ${id}`);
                  console.error('Rendered SVG content:', result.svg.substring(0, 200));
                }
              } catch (error: any) {
                console.error(`Error rendering Mermaid diagram ${id}:`, error);
                console.error('Diagram content:', content.substring(0, 200));
                div.innerHTML = `<pre style="color: var(--theme-error, #ff3b30); padding: 16px; background: var(--theme-background-secondary, #f6f8fa); border-radius: 4px; white-space: pre-wrap;">Error rendering diagram: ${
                  error?.message || error
                }\n\nContent preview:\n${content.substring(0, 200)}...</pre>`;
              }
            });

          // Wait for all diagrams to render
          if (renderPromises.length > 0) {
            await Promise.all(renderPromises);
            console.log(`Finished rendering ${renderPromises.length} Mermaid diagram(s)`);
          } else {
            console.warn('No Mermaid diagrams were queued for rendering');
          }
        }
      };

      renderDiagrams();
    }
  }, [currentDoc, colorScheme]);

  const loadDocsList = async () => {
    try {
      setLoading(true);
      const response: IDocsListResponse = await getDocsListApi();
      setDocs(response.docs || []);
      setHierarchy(response.hierarchy || []);

      // Auto-expand all folders initially
      if (response.hierarchy) {
        const allKeys = getAllKeys(response.hierarchy);
        setExpandedKeys(allKeys);
      }
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || 'Failed to load documentation list'
      );
    } finally {
      setLoading(false);
    }
  };

  const getAllKeys = (items: IDocFile[]): React.Key[] => {
    let keys: React.Key[] = [];
    items.forEach((item) => {
      if (item.isFolder) {
        keys.push(item.filename || item.slug);
        if (item.children) {
          keys = keys.concat(getAllKeys(item.children));
        }
      }
    });
    return keys;
  };

  const loadDoc = async (filename: string) => {
    try {
      setLoadingDoc(true);
      const doc = await getDocApi(filename);
      setCurrentDoc(doc);

      // Find the correct key in tree for selection
      const findKeyInTree = (items: any[], filepath: string): string | null => {
        // Normalize path for comparison
        const normalizePath = (p: string) =>
          p.replace(/^\/+|\/+$/g, '').replace(/\\/g, '/').toLowerCase();
        const normalizedFilePath = normalizePath(filepath);

        for (const item of items) {
          // Check both filename and path properties
          const itemFilename = item.filename || '';
          const itemPath = item.path || item.filename || '';
          const normalizedItemFilename = normalizePath(itemFilename);
          const normalizedItemPath = normalizePath(itemPath);

          if (
            normalizedItemFilename === normalizedFilePath ||
            normalizedItemPath === normalizedFilePath ||
            itemFilename === filepath ||
            itemPath === filepath
          ) {
            return item.key;
          }
          if (item.children) {
            const found = findKeyInTree(item.children, filepath);
            if (found) return found;
          }
        }
        return null;
      };

      const treeKey =
        treeData.length > 0 ? findKeyInTree(treeData, filename) : null;
      setSelectedDoc(treeKey || filename);

      // Update URL without reload - use the actual slug from the doc
      // This ensures nested README files use their full path slug (e.g., "diagrams-readme" not just "readme")
      const slug = doc.slug || doc.filename.replace(/\.md$/, '').replace(/\//g, '-').toLowerCase();
      setSearchParams({ doc: slug });
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || 'Failed to load documentation'
      );
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleSearch = async (value: string) => {
    if (!value || value.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const { results } = await searchDocsApi(value);
      setSearchResults(results);
      setSearchQuery(value);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || 'Failed to search documentation'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleDocSelect = (filename: string) => {
    loadDoc(filename);
  };

  const handleSearchResultClick = (result: ISearchResult) => {
    const filename = result.filename;
    loadDoc(filename);
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
  };

  // Helper to find doc by key in hierarchy
  const findDocByKey = (items: IDocFile[], key: string): IDocFile | null => {
    for (const item of items) {
      if (item.isFolder && item.children) {
        const found = findDocByKey(item.children, key);
        if (found) return found;
      } else if (item.filename === key || item.slug === key) {
        return item;
      }
    }
    return null;
  };

  const onTreeSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      const key = selectedKeys[0] as string;

      // Find the item in tree data by key
      const findInTree = (items: any[]): any => {
        for (const item of items) {
          if (item.key === key) {
            return item;
          }
          if (item.children) {
            const found = findInTree(item.children);
            if (found) return found;
          }
        }
        return null;
      };

      const treeItem = treeData.length > 0 ? findInTree(treeData) : null;

      // Only process if it's a file (has filename and isLeaf)
      if (treeItem && treeItem.isLeaf && treeItem.filename) {
        // Use filename from tree item (which includes full path for nested files)
        const filePath = treeItem.filename || treeItem.path || key;
        handleDocSelect(filePath);
        return;
      }

      // If not found in tree, try to find by key in flat list
      // Try exact match first, then normalized match
      const normalizePath = (p: string) =>
        p.replace(/^\/+|\/+$/g, '').replace(/\\/g, '/').toLowerCase();
      const normalizedKey = normalizePath(key);

      const doc = docs.find((d) => {
        if (d.isFolder) return false;
        const docFilename = d.filename || '';
        const docPath = d.path || d.filename || '';
        const normalizedDocFilename = normalizePath(docFilename);
        const normalizedDocPath = normalizePath(docPath);

        return (
          d.filename === key ||
          d.slug === key ||
          docFilename === key ||
          docPath === key ||
          normalizedDocFilename === normalizedKey ||
          normalizedDocPath === normalizedKey
        );
      });

      if (doc && !doc.isFolder) {
        // Use path if available, otherwise filename
        const filePath = doc.path || doc.filename;
        handleDocSelect(filePath);
        return;
      }

      // If still not found, search in hierarchy
      if (hierarchy.length > 0) {
        const doc = findDocByKey(hierarchy, key);
        if (doc && !doc.isFolder) {
          // Use path if available, otherwise filename
          const filePath = doc.path || doc.filename;
          handleDocSelect(filePath);
        }
      }
    }
  };

  // Extract headings from markdown for table of contents
  const headings = useMemo(() => {
    if (!currentDoc) return [];

    const lines = currentDoc.content.split('\n');
    const headingLines: Array<{ level: number; text: string; id: string }> = [];

    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        headingLines.push({ level, text, id });
      }
    });

    return headingLines;
  }, [currentDoc]);

  return (
    <Layout className="documentation-page" style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: 'var(--theme-background, #fff)',
          padding: '0 24px',
          borderBottom: '1px solid var(--theme-border-light, #f0f0f0)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Documentation
          </Title>
          <Space>
            <Search
              placeholder="Search documentation..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              style={{ width: 400 }}
              onSearch={handleSearch}
              onChange={(e) => {
                if (e.target.value === '') {
                  setSearchResults([]);
                  setSearchQuery('');
                }
              }}
            />
          </Space>
        </div>
      </Header>

      <Layout>
        <Sider
          width={300}
          style={{
            background: 'var(--theme-background, #fff)',
            borderRight: '1px solid var(--theme-border-light, #f0f0f0)',
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            position: 'fixed',
            left: 0,
            top: 64,
          }}
        >
          <div style={{ padding: '16px' }}>
            <Space style={{ marginBottom: '16px', width: '100%' }}>
              <HomeOutlined />
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                }}
                style={{
                  cursor: 'pointer',
                  color: 'var(--theme-primary, #1890ff)',
                }}
              >
                Home
              </a>
            </Space>

            {loading ? (
              <Spin />
            ) : (
              <Tree
                showIcon
                defaultExpandAll
                expandedKeys={expandedKeys}
                onExpand={setExpandedKeys}
                selectedKeys={[selectedDoc]}
                onSelect={onTreeSelect}
                treeData={treeData}
                style={{ background: 'transparent' }}
              />
            )}
          </div>
        </Sider>

        <Layout style={{ marginLeft: 300 }}>
          <Content
            style={{
              padding: '24px',
              background: 'var(--theme-background, #fff)',
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            {isSearching ? (
              <Spin />
            ) : searchResults.length > 0 ? (
              <div>
                <Title level={2}>Search Results for "{searchQuery}"</Title>
                <List
                  dataSource={searchResults}
                  renderItem={(result) => (
                    <List.Item
                      style={{
                        cursor: 'pointer',
                        padding: '16px',
                        border: '1px solid var(--theme-border-light, #f0f0f0)',
                        marginBottom: '8px',
                        borderRadius: '4px',
                      }}
                      onClick={() => handleSearchResultClick(result)}
                      className="search-result-item"
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <FileTextOutlined />
                            <Text strong>{result.name}</Text>
                            {result.category && (
                              <Tag color="blue">{result.category}</Tag>
                            )}
                            <Tag color="green">{result.matchCount} matches</Tag>
                          </Space>
                        }
                        description={
                          <Space
                            direction="vertical"
                            size="small"
                            style={{ width: '100%' }}
                          >
                            {result.matches.slice(0, 3).map((match, index) => (
                              <div
                                key={index}
                                style={{
                                  fontSize: '12px',
                                  color: 'var(--theme-text-secondary, #666)',
                                }}
                              >
                                <Text code>Line {match.line}</Text>:{' '}
                                {match.text.substring(0, 150)}...
                              </div>
                            ))}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            ) : loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : loadingDoc ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : currentDoc ? (
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: 1, maxWidth: '900px' }}>
                  <Card>
                    <div className="markdown-content" ref={mermaidRef}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                        components={{
                          h1: ({ node, ...props }) => (
                            <Title
                              level={1}
                              {...props}
                              id={props.children
                                ?.toString()
                                .toLowerCase()
                                .replace(/\s+/g, '-')}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <Title
                              level={2}
                              {...props}
                              id={props.children
                                ?.toString()
                                .toLowerCase()
                                .replace(/\s+/g, '-')}
                              style={{ marginTop: '32px' }}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <Title
                              level={3}
                              {...props}
                              id={props.children
                                ?.toString()
                                .toLowerCase()
                                .replace(/\s+/g, '-')}
                              style={{ marginTop: '24px' }}
                            />
                          ),
                          h4: ({ node, ...props }) => (
                            <Title
                              level={4}
                              {...props}
                              id={props.children
                                ?.toString()
                                .toLowerCase()
                                .replace(/\s+/g, '-')}
                              style={{ marginTop: '16px' }}
                            />
                          ),
                          h5: ({ node, ...props }) => (
                            <Title
                              level={5}
                              {...props}
                              id={props.children
                                ?.toString()
                                .toLowerCase()
                                .replace(/\s+/g, '-')}
                            />
                          ),
                          h6: ({ node, ...props }) => (
                            <Title
                              level={6}
                              {...props}
                              id={props.children
                                ?.toString()
                                .toLowerCase()
                                .replace(/\s+/g, '-')}
                            />
                          ),
                          a: ({ node, href, children, ...props }: any) => {
                            if (!href) {
                              return <a {...props}>{children}</a>;
                            }

                            // Handle anchor links (same page)
                            if (href.startsWith('#')) {
                              return (
                                <a
                                  {...props}
                                  href={href}
                                  style={{
                                    color: 'var(--theme-primary, #1890ff)',
                                  }}
                                >
                                  {children}
                                </a>
                              );
                            }

                            // Handle internal markdown file links
                            // Check for .md or .markdown extension, or paths that look like doc files
                            const isMarkdownLink =
                              href.endsWith('.md') ||
                              href.endsWith('.markdown') ||
                              /\.(md|markdown)$/i.test(href) ||
                              // Also handle paths that start with /docs/ (common pattern)
                              href.startsWith('/docs/');

                            if (isMarkdownLink) {
                              // Get current doc path to resolve relative paths
                              const currentPath = currentDoc?.filename || '';
                              const currentDir = currentPath.includes('/')
                                ? currentPath.substring(
                                    0,
                                    currentPath.lastIndexOf('/')
                                  )
                                : '';

                              // Resolve relative paths
                              let linkPath = href;

                              // Remove /docs/ prefix if present (common in markdown links)
                              if (linkPath.startsWith('/docs/')) {
                                linkPath = linkPath.substring(6); // Remove '/docs/'
                              } else if (linkPath.startsWith('docs/')) {
                                linkPath = linkPath.substring(5); // Remove 'docs/'
                              } else if (linkPath.startsWith('./')) {
                                // Same directory
                                linkPath = currentDir
                                  ? `${currentDir}/${linkPath.substring(2)}`
                                  : linkPath.substring(2);
                              } else if (linkPath.startsWith('../')) {
                                // Parent directory
                                let path = currentDir;
                                let relative = linkPath;
                                while (relative.startsWith('../')) {
                                  if (path) {
                                    const lastSlash = path.lastIndexOf('/');
                                    path =
                                      lastSlash >= 0
                                        ? path.substring(0, lastSlash)
                                        : '';
                                  }
                                  relative = relative.substring(3);
                                }
                                linkPath = path
                                  ? `${path}/${relative}`
                                  : relative;
                              } else if (linkPath.startsWith('/')) {
                                // Absolute path from root (remove leading slash)
                                linkPath = linkPath.substring(1);
                              } else if (!linkPath.includes('/')) {
                                // Just filename - same directory
                                linkPath = currentDir
                                  ? `${currentDir}/${linkPath}`
                                  : linkPath;
                              }

                              // Ensure .md extension if not present
                              if (
                                !linkPath.endsWith('.md') &&
                                !linkPath.endsWith('.markdown')
                              ) {
                                linkPath = `${linkPath}.md`;
                              }

                              // Find the file in docs - try multiple matching strategies
                              const linkedDoc = docs.find((d) => {
                                if (!d.filename || d.isFolder) return false;

                                // Get both filename and path for matching
                                const docFilename = d.filename.toLowerCase();
                                const docPath = (d.path || d.filename).toLowerCase();
                                const searchPath = linkPath.toLowerCase();

                                // Normalize paths (remove leading/trailing slashes, normalize separators)
                                const normalizePath = (p: string) =>
                                  p
                                    .replace(/^\/+|\/+$/g, '')
                                    .replace(/\\/g, '/')
                                    .toLowerCase();

                                const normalizedDocPath = normalizePath(docPath);
                                const normalizedDocFilename = normalizePath(docFilename);
                                const normalizedSearchPath = normalizePath(searchPath);

                                // 1. Exact match (with or without extension)
                                if (normalizedDocPath === normalizedSearchPath)
                                  return true;
                                if (normalizedDocFilename === normalizedSearchPath)
                                  return true;

                                // 2. Match without extension
                                const docPathNoExt = normalizedDocPath.replace(
                                  /\.md$/,
                                  ''
                                );
                                const docFilenameNoExt = normalizedDocFilename.replace(
                                  /\.md$/,
                                  ''
                                );
                                const searchPathNoExt = normalizedSearchPath.replace(
                                  /\.md$/,
                                  ''
                                );

                                if (docPathNoExt === searchPathNoExt) return true;
                                if (docFilenameNoExt === searchPathNoExt) return true;

                                // 3. Ends with match (for nested paths)
                                if (normalizedDocPath.endsWith(normalizedSearchPath))
                                  return true;
                                if (
                                  normalizedSearchPath.endsWith(normalizedDocPath)
                                )
                                  return true;
                                if (normalizedDocPath.endsWith(searchPathNoExt))
                                  return true;
                                if (searchPathNoExt.endsWith(docPathNoExt))
                                  return true;

                                // 4. Match filename only (last segment)
                                const docFileSegment =
                                  normalizedDocPath.split('/').pop() || '';
                                const searchFileSegment =
                                  normalizedSearchPath.split('/').pop() || '';
                                if (docFileSegment === searchFileSegment)
                                  return true;
                                if (
                                  docFileSegment.replace(/\.md$/, '') ===
                                  searchFileSegment.replace(/\.md$/, '')
                                )
                                  return true;

                                // 5. Match by basename (filename without path)
                                const docBasename = normalizedDocPath.replace(
                                  /^.*\//,
                                  ''
                                );
                                const linkBasename = normalizedSearchPath.replace(
                                  /^.*\//,
                                  ''
                                );
                                if (docBasename === linkBasename) return true;
                                if (
                                  docBasename.replace(/\.md$/, '') ===
                                  linkBasename.replace(/\.md$/, '')
                                )
                                  return true;

                                // 6. Partial path match (e.g., "flows/process-flows.md" matches "diagrams/flows/process-flows.md")
                                const docPathParts = normalizedDocPath.split('/');
                                const searchPathParts = normalizedSearchPath.split('/');

                                // Check if search path is a suffix of doc path
                                if (
                                  docPathParts.length >= searchPathParts.length
                                ) {
                                  const docSuffix = docPathParts
                                    .slice(-searchPathParts.length)
                                    .join('/');
                                  if (docSuffix === normalizedSearchPath)
                                    return true;
                                  if (
                                    docSuffix.replace(/\.md$/, '') ===
                                    searchPathNoExt
                                  )
                                    return true;
                                }

                                // Check if doc path is a suffix of search path
                                if (
                                  searchPathParts.length >= docPathParts.length
                                ) {
                                  const searchSuffix = searchPathParts
                                    .slice(-docPathParts.length)
                                    .join('/');
                                  if (searchSuffix === normalizedDocPath)
                                    return true;
                                  if (
                                    searchSuffix.replace(/\.md$/, '') ===
                                    docPathNoExt
                                  )
                                    return true;
                                }

                                return false;
                              });

                              if (linkedDoc && !linkedDoc.isFolder) {
                                const docSlug =
                                  linkedDoc.slug ||
                                  linkedDoc.filename
                                    .replace(/\.md$/, '')
                                    .replace(/\//g, '-')
                                    .toLowerCase();
                                return (
                                  <a
                                    {...props}
                                    href={`/documentation?doc=${docSlug}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDocSelect(linkedDoc.filename);
                                    }}
                                    style={{
                                      color: 'var(--theme-primary, #1890ff)',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {children}
                                  </a>
                                );
                              } else {
                                // If file not found, still convert to documentation route to prevent 404
                                // Extract slug from path
                                const fallbackSlug = linkPath
                                  .replace(/\.md$/, '')
                                  .replace(/\//g, '-')
                                  .toLowerCase();
                                return (
                                  <a
                                    {...props}
                                    href={`/documentation?doc=${fallbackSlug}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      // Try to find and load the doc by slug
                                      const doc = docs.find(
                                        (d) =>
                                          d.slug === fallbackSlug ||
                                          d.filename
                                            .toLowerCase()
                                            .replace(/\.md$/, '')
                                            .replace(/\//g, '-') ===
                                            fallbackSlug
                                      );
                                      if (doc && !doc.isFolder) {
                                        handleDocSelect(doc.filename);
                                      }
                                    }}
                                    style={{
                                      color: 'var(--theme-primary, #1890ff)',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {children}
                                  </a>
                                );
                              }
                            }

                            // External links
                            return (
                              <a
                                {...props}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: 'var(--theme-primary, #1890ff)',
                                }}
                              >
                                {children}
                              </a>
                            );
                          },
                          code: ({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }: any) => {
                            const match = /language-(\w+)/.exec(
                              className || ''
                            );
                            const language = match ? match[1] : '';

                            // Handle Mermaid diagrams specially
                            if (language === 'mermaid' && !inline) {
                              // Generate unique ID for this diagram
                              const id = `mermaid-${Date.now()}-${Math.random()
                                .toString(36)
                                .substr(2, 9)}`;
                              const content = String(children).replace(/\n$/, '').trim();
                              
                              return (
                                <div className="mermaid-container" key={id}>
                                  <div className="mermaid" id={id}>
                                    {content}
                                  </div>
                                </div>
                              );
                            }

                            return !inline && match ? (
                              <pre className={className} {...props}>
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {currentDoc.content}
                      </ReactMarkdown>
                    </div>
                  </Card>
                </div>

                {headings.length > 0 && (
                  <Affix offsetTop={80}>
                    <div style={{ width: '200px' }}>
                      <Card size="small" title="Table of Contents">
                        <Anchor
                          items={headings.map((heading) => ({
                            key: heading.id,
                            href: `#${heading.id}`,
                            title: heading.text,
                          }))}
                          showInkInFixed
                        />
                      </Card>
                    </div>
                  </Affix>
                )}
              </div>
            ) : (
              <Empty description="Select a documentation file from the sidebar" />
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DocumentationPage;
