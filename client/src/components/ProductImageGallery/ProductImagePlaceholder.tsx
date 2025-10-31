import './ProductImagePlaceholder.scss';

type ProductImagePlaceholderProps = {
  title: string;
};

export const ProductImagePlaceholder = ({ title }: ProductImagePlaceholderProps) => {
  // Get initials from title
  const getInitials = (text: string) => {
    const words = text.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(title);
  const colors = [
    { bg: '#667eea', accent: '#764ba2' },
    { bg: '#f093fb', accent: '#f5576c' },
    { bg: '#4facfe', accent: '#00f2fe' },
    { bg: '#43e97b', accent: '#38f9d7' },
    { bg: '#fa709a', accent: '#fee140' },
    { bg: '#30cfd0', accent: '#330867' },
    { bg: '#a8edea', accent: '#fed6e3' },
    { bg: '#ff9a9e', accent: '#fecfef' },
  ];

  // Generate color based on title
  const colorIndex = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const selectedColors = colors[colorIndex];

  return (
    <div className="product-image-placeholder" style={{ background: `linear-gradient(135deg, ${selectedColors.bg} 0%, ${selectedColors.accent} 100%)` }}>
      <svg
        viewBox="0 0 400 400"
        className="placeholder-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Decorative circles */}
        <circle cx="50" cy="50" r="30" fill="rgba(255,255,255,0.2)" />
        <circle cx="350" cy="80" r="40" fill="rgba(255,255,255,0.15)" />
        <circle cx="80" cy="350" r="35" fill="rgba(255,255,255,0.1)" />
        <circle cx="320" cy="320" r="25" fill="rgba(255,255,255,0.2)" />
        
        {/* Decorative rectangles */}
        <rect x="100" y="60" width="60" height="60" fill="rgba(255,255,255,0.1)" transform="rotate(45 130 90)" />
        <rect x="280" y="280" width="50" height="50" fill="rgba(255,255,255,0.15)" transform="rotate(-45 305 305)" />
        
        {/* Main content area */}
        <rect x="80" y="140" width="240" height="120" rx="10" fill="rgba(255,255,255,0.2)" />
        
        {/* Product initials/icon */}
        <circle cx="200" cy="170" r="35" fill="rgba(255,255,255,0.3)" />
        <text
          x="200"
          y="180"
          textAnchor="middle"
          className="initials-text"
          fontSize="32"
          fontWeight="700"
          fill="white"
        >
          {initials}
        </text>
        
        {/* Product title text */}
        <text
          x="200"
          y="280"
          textAnchor="middle"
          className="title-text"
          fontSize="18"
          fontWeight="600"
          fill="white"
        >
          {title.length > 30 ? title.substring(0, 27) + '...' : title}
        </text>
      </svg>
      
      {/* Overlay gradient */}
      <div className="placeholder-overlay" />
    </div>
  );
};
