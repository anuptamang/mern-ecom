import { useEffect, useState } from 'react';
import { Col, Row } from 'antd';
import { Logo, Nav } from '@/components';
import { Container, HeaderLayout } from '@/components/UI';
import { UserPanel } from '@/features/UserPanel/UserPanel';
import styles from './Header.module.scss';

/**
 * Component - Header
 * @component
 * @props none
 * @returns {JSX.Element}   Header
 */

export const Header = (): JSX.Element => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsSticky(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <HeaderLayout 
        className={`${styles.header} ${isSticky ? styles.sticky : ''}`}
        style={{ 
          paddingInline: 0,
          position: 'fixed',
          top: 0,
          zIndex: 1000,
        }}
      >
        <Container>
          <Row align="middle">
            <Col xs={10} md={6}>
              <Logo />
            </Col>
            <Col xs={14} md={18}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Nav />
                <UserPanel />
              </div>
            </Col>
          </Row>
        </Container>
      </HeaderLayout>
    </>
  );
};
