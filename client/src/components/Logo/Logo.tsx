'use client';

import { pageRoutes } from '@/data/static/pageRoutes';
import Link from 'next/link';
import { ShoppingOutlined } from '@ant-design/icons';
import styles from './Logo.module.scss';
import { siteData } from '@/data/static/siteData';
import { useTheme } from '@/hooks/useTheme';

/**
 * Component - Logo
 * Supports custom logo image from admin theme settings
 * Falls back to default icon + text if no custom logo
 * @component
 * @props none
 * @returns {JSX.Element}   Logo
 */

const Logo = (): JSX.Element => {
  const { colorScheme } = useTheme();
  const hasCustomLogo = colorScheme.logo?.imageUrl;
  const logoText = colorScheme.logo?.text || siteData.site.title;

  return (
    <div className={styles.logo}>
      <Link href={pageRoutes.home} className={styles.logoLink}>
        {hasCustomLogo && colorScheme.logo.imageUrl ? (
          <img 
            src={colorScheme.logo.imageUrl} 
            alt={logoText} 
            className="logoImage"
            style={{ height: '48px', width: 'auto', maxWidth: '200px', objectFit: 'contain' }}
            onError={(e) => {
              // Fallback to icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={styles.logoIcon} style={{ display: hasCustomLogo ? 'none' : 'flex' }}>
          <ShoppingOutlined />
        </div>
        <span className={styles.logoText}>{logoText}</span>
      </Link>
    </div>
  );
};

export { Logo };
