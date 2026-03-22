import React from 'react';
import CustomAccordion from '../CustomAccordion';
import { Text, Heading } from '@deriv-com/quill-ui';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Translate from '@docusaurus/Translate';
import styles from './Footer.module.scss';

import GrayLogo from '../../assets/gray-logo.svg';

const Footer = () => {
  const {
    i18n: { currentLocale },
  } = useDocusaurusContext();

  const footer_links = React.useMemo(() => {
    const is_en = currentLocale === 'en';
    const get_url = (path: string, isExternal = true) => {
      const pathInfo = `${!is_en ? `/${currentLocale}` : ''}/${path}`;
      return isExternal ? `https://deriv.com${pathInfo}` : pathInfo;
    };
    return {
      dashboard: get_url('dashboard', false),
    };
  }, [currentLocale]);

  const accordionItems = [
    {
      header: 'API',
      content: (
        <ul className={styles.List}>
          <li>
            <a href={footer_links.dashboard} className={styles.Link}>
              <Translate>Dashboard</Translate>
            </a>
          </li>
        </ul>
      ),
    },
  ];

  return (
    <div className='container'>
      <section className={styles.FooterContainer} data-testid='footer-text'>
        <div className={styles.FooterBody}>
          <div className={styles.LogoWrapper}>
            <div className={styles.FooterLogo}>
              <GrayLogo />
            </div>
          </div>
          <div className={styles.FooterSection}>
            <section className={styles.Section1} data-testid='API-section'>
              <Heading.H6 data-testid='API-section'>
                <Translate>API</Translate>
              </Heading.H6>
              <ul className={styles.List}>
                <li>
                  <a href={footer_links.dashboard} className={styles.Link}>
                    <Text size='sm' className={styles.labelcolor}>
                      <Translate>Dashboard</Translate>
                    </Text>
                  </a>
                </li>
              </ul>
            </section>
            <div className={styles.MobileAccordion}>
              <CustomAccordion items={accordionItems} />
            </div>
            <div className={styles.Box}>
              <Heading.H5 className={styles.SectionTitle}>
                <Translate>Support</Translate>
              </Heading.H5>
              <p className={styles.SectionContent}>
                <Text size='sm' style={{ display: 'inline' }}>
                  <Translate>Email:</Translate>{' '}
                </Text>
                <a href='mailto:api-support@deriv.com' style={{ display: 'inline' }}>
                  <Text size='sm' style={{ display: 'inline' }}>
                    <Translate>api-support@deriv.com</Translate>
                  </Text>
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Footer;
