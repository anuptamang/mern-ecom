import React, { useEffect, useState, useMemo } from 'react';
import { Layout, Menu, Input, Card, Spin, Empty, message, Typography, Space, List, Tag, Anchor, Affix } from 'antd';
import { SearchOutlined, FileTextOutlined, HomeOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getDocsListApi, getDocApi, searchDocsApi, IDocFile, IDocContent, ISearchResult } from 'services/endPoints/docs/docsEndpoints';
import 'highlight.js/styles/github.css';
import './DocumentationPage.scss';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { Search } = Input;

const DocumentationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [docs, setDocs] = useState<IDocFile[]>([]);
  const [currentDoc, setCurrentDoc] = useState<IDocContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ISearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string>('');

  // Get selected doc from URL or default to DOCUMENTATION.md
  const docSlug = searchParams.get('doc') || 'documentation';

  useEffect(() => {
    loadDocsList();
  }, []);

  useEffect(() => {
    if (docs.length > 0) {
      // Find the doc by slug
      const doc = docs.find(d => d.slug === docSlug);
      if (doc) {
        loadDoc(doc.filename);
        setSelectedDoc(doc.filename);
      } else if (docSlug === 'documentation') {
        // Default to DOCUMENTATION.md
        const defaultDoc = docs.find(d => d.filename === 'DOCUMENTATION.md');
        if (defaultDoc) {
          loadDoc(defaultDoc.filename);
          setSelectedDoc(defaultDoc.filename);
        }
      }
    }
  }, [docs, docSlug]);

  const loadDocsList = async () => {
    try {
      setLoading(true);
      const { docs: docsList } = await getDocsListApi();
      setDocs(docsList);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to load documentation list');
    } finally {
      setLoading(false);
    }
  };

  const loadDoc = async (filename: string) => {
    try {
      setLoadingDoc(true);
      const doc = await getDocApi(filename);
      setCurrentDoc(doc);
      setSelectedDoc(filename);
      // Update URL without reload
      const slug = filename.replace('.md', '').toLowerCase();
      setSearchParams({ doc: slug });
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to load documentation');
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
      message.error(error?.response?.data?.message || 'Failed to search documentation');
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
        const id = text.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        headingLines.push({ level, text, id });
      }
    });
    
    return headingLines;
  }, [currentDoc]);

  const menuItems = docs.map(doc => ({
    key: doc.filename,
    label: doc.name,
    icon: <FileTextOutlined />,
    onClick: () => handleDocSelect(doc.filename),
  }));

  return (
    <Layout className="documentation-page" style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
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
          width={250}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            position: 'fixed',
            left: 0,
            top: 64,
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedDoc]}
            items={[
              {
                key: 'home',
                label: 'Home',
                icon: <HomeOutlined />,
                onClick: () => navigate('/'),
              },
              { type: 'divider' },
              ...menuItems,
            ]}
          />
        </Sider>

        <Layout style={{ marginLeft: 250 }}>
          <Content style={{ padding: '24px', background: '#fff', minHeight: 'calc(100vh - 64px)' }}>
            {isSearching ? (
              <Spin />
            ) : searchResults.length > 0 ? (
              <div>
                <Title level={2}>Search Results for "{searchQuery}"</Title>
                <List
                  dataSource={searchResults}
                  renderItem={(result) => (
                    <List.Item
                      style={{ cursor: 'pointer', padding: '16px', border: '1px solid #f0f0f0', marginBottom: '8px', borderRadius: '4px' }}
                      onClick={() => handleSearchResultClick(result)}
                      className="search-result-item"
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <FileTextOutlined />
                            <Text strong>{result.name}</Text>
                            <Tag color="blue">{result.matchCount} matches</Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            {result.matches.slice(0, 3).map((match, index) => (
                              <div key={index} style={{ fontSize: '12px', color: '#666' }}>
                                <Text code>Line {match.line}</Text>: {match.text.substring(0, 150)}...
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
                <div style={{ flex: 1, maxWidth: '800px' }}>
                  <Card>
                    <div className="markdown-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                        components={{
                          h1: ({ node, ...props }) => <Title level={1} {...props} id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} />,
                          h2: ({ node, ...props }) => <Title level={2} {...props} id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} style={{ marginTop: '32px' }} />,
                          h3: ({ node, ...props }) => <Title level={3} {...props} id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} style={{ marginTop: '24px' }} />,
                          h4: ({ node, ...props }) => <Title level={4} {...props} id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} style={{ marginTop: '16px' }} />,
                          h5: ({ node, ...props }) => <Title level={5} {...props} id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} />,
                          h6: ({ node, ...props }) => <Title level={6} {...props} id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} />,
                          code: ({ node, inline, className, children, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || '');
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
