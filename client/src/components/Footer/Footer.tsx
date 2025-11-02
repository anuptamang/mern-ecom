import React from 'react';
import { Col, Row, Divider } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  YoutubeOutlined,
  AppleOutlined,
  AndroidOutlined,
  CreditCardOutlined,
  SafetyOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { FooterLayout } from 'components/UI/Layout/Layout';
import { siteData } from 'data/static/siteData';
import styles from './Footer.module.scss';

/**
 * Component - Footer
 * @component
 * @props none
 * @returns {JSX.Element}   Footer
 */

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<any>> = {
  QuestionCircleOutlined,
  MessageOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  SafetyOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  YoutubeOutlined,
};

const getIcon = (iconName: string | null) => {
  if (!iconName) return null;
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent /> : null;
};

export const Footer = (): JSX.Element => {
  const currentYear = new Date().getFullYear();
  const data = siteData;

  return (
    <FooterLayout className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Main Footer Content */}
        <Row gutter={[32, 32]} className={styles.footerMain}>
          {/* Customer Care Column */}
          <Col xs={24} sm={12} md={6}>
            <h3 className={styles.footerTitle}>Customer Care</h3>
            <ul className={styles.footerList}>
              {data.footerLinks.customerCare.map((item, index) => (
                <li key={index}>
                  <Link to={item.link}>
                    {getIcon(item.icon)} {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={`tel:${data.contact.phone}`}>
                  <PhoneOutlined /> {data.contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${data.contact.email}`}>
                  <MailOutlined /> {data.contact.email}
                </a>
              </li>
            </ul>
          </Col>

          {/* Website Details Column */}
          <Col xs={24} sm={12} md={6}>
            <h3 className={styles.footerTitle}>Information</h3>
            <ul className={styles.footerList}>
              {data.footerLinks.information.map((item, index) => (
                <li key={index}>
                  <Link to={item.link}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Mobile App Download Column */}
          <Col xs={24} sm={12} md={6}>
            <h3 className={styles.footerTitle}>Mobile App</h3>
            <div className={styles.mobileApps}>
              <p>Download our app for the best shopping experience</p>
              {data.mobileApp.available && (
                <div className={styles.appButtons}>
                  <a
                    href={data.mobileApp.appStore}
                    className={styles.appButton}
                    onClick={(e) => {
                      if (data.mobileApp.appStore === '#') {
                        e.preventDefault();
                      }
                    }}
                  >
                    <AppleOutlined /> App Store
                  </a>
                  <a
                    href={data.mobileApp.googlePlay}
                    className={styles.appButton}
                    onClick={(e) => {
                      if (data.mobileApp.googlePlay === '#') {
                        e.preventDefault();
                      }
                    }}
                  >
                    <AndroidOutlined /> Google Play
                  </a>
                </div>
              )}
            </div>
          </Col>

          {/* Follow Us Column */}
          <Col xs={24} sm={12} md={6}>
            <h3 className={styles.footerTitle}>Follow Us</h3>
            <div className={styles.socialLinks}>
              <p>Connect with us on social media</p>
              <div className={styles.socialIcons}>
                <a
                  href={data.social.facebook}
                  className={styles.socialIcon}
                  aria-label="Facebook"
                  onClick={(e) => {
                    if (data.social.facebook === '#') {
                      e.preventDefault();
                    }
                  }}
                >
                  <FacebookOutlined />
                </a>
                <a
                  href={data.social.twitter}
                  className={styles.socialIcon}
                  aria-label="Twitter"
                  onClick={(e) => {
                    if (data.social.twitter === '#') {
                      e.preventDefault();
                    }
                  }}
                >
                  <TwitterOutlined />
                </a>
                <a
                  href={data.social.instagram}
                  className={styles.socialIcon}
                  aria-label="Instagram"
                  onClick={(e) => {
                    if (data.social.instagram === '#') {
                      e.preventDefault();
                    }
                  }}
                >
                  <InstagramOutlined />
                </a>
                <a
                  href={data.social.linkedin}
                  className={styles.socialIcon}
                  aria-label="LinkedIn"
                  onClick={(e) => {
                    if (data.social.linkedin === '#') {
                      e.preventDefault();
                    }
                  }}
                >
                  <LinkedinOutlined />
                </a>
                <a
                  href={data.social.youtube}
                  className={styles.socialIcon}
                  aria-label="YouTube"
                  onClick={(e) => {
                    if (data.social.youtube === '#') {
                      e.preventDefault();
                    }
                  }}
                >
                  <YoutubeOutlined />
                </a>
              </div>
            </div>
          </Col>
        </Row>

        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Payment Methods & Verified By */}
        <Row gutter={[16, 16]} align="middle" className={styles.paymentRow}>
          <Col xs={24} md={12}>
            <div className={styles.paymentSection}>
              <h4 className={styles.paymentTitle}>
                <CreditCardOutlined /> We Accept
              </h4>
              <div className={styles.paymentMethods}>
                {data.paymentMethods.map((method, index) => (
                  <span key={index} className={styles.paymentMethod}>
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className={styles.verifiedSection}>
              <h4 className={styles.verifiedTitle}>
                <SafetyOutlined /> Verified By
              </h4>
              <div className={styles.verifiedBadges}>
                {data.verifiedBadges.map((badge, index) => (
                  <span key={index} className={styles.verifiedBadge}>
                    {getIcon(badge.icon)} {badge.text}
                  </span>
                ))}
              </div>
            </div>
          </Col>
        </Row>

        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Copyright & Social Row */}
        <Row gutter={[16, 16]} align="middle" className={styles.copyrightRow}>
          <Col xs={24} md={12}>
            <div className={styles.copyright}>
              <p>
                &copy; {currentYear} <strong>{data.site.title}</strong>. All rights reserved.
              </p>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className={styles.copyrightLinks}>
              {data.footerLinks.copyright.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className={styles.separator}>|</span>}
                  <Link to={item.link}>{item.label}</Link>
                </React.Fragment>
              ))}
            </div>
          </Col>
        </Row>
      </div>
    </FooterLayout>
  );
};
