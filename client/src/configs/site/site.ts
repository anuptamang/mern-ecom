// Re-export from siteData for backward compatibility
// This allows existing code using siteInfo to continue working
// while all data comes from the central siteData.json source
import { siteData } from '@/data/static/siteData';

// Legacy interface for backward compatibility
export type TSiteInfo = {
  title: string;
  description: string;
};

// Export siteInfo for backward compatibility with existing code
export const siteInfo: TSiteInfo = {
  title: siteData.site.title,
  description: siteData.site.description,
};

// Export siteData for new code to use comprehensive data
export { siteData };
