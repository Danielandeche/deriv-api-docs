import React, { useEffect } from 'react';
import Layout from '@theme/Layout';
import CustomLayout from '../components/Layout/CustomLayout';
import useAuthParams from '../hooks/useAuthParams';
import { useLocation } from '@docusaurus/router';
import useAuthContext from '../hooks/useAuthContext';

export default function Home(): JSX.Element {
  const { search } = useLocation();
  const { checkUrlParams } = useAuthParams();
  const { is_logged_in } = useAuthContext();

  useEffect(() => {
    checkUrlParams(search);
  }, [checkUrlParams, search]);

  useEffect(() => {
    if (is_logged_in && search) {
      const params = new URLSearchParams(search);
      const redirect_route = params.get('route')?.replace(/%2F/g, '/') || '/';
      if (redirect_route && redirect_route !== '/') {
        window.location.href = redirect_route;
      }
    }
  }, [is_logged_in, search]);

  return (
    <>
      <Layout
        title={'Home'}
        description='Deriv API documentation'
        wrapperClassName={`home_page_wrapper`}
      >
        <CustomLayout />
      </Layout>
    </>
  );
}
