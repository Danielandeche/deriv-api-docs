import React, { useEffect } from 'react';
import { Redirect } from '@docusaurus/router';
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

  // Redirect to dashboard after processing OAuth params
  if (is_logged_in && search) {
    const params = new URLSearchParams(search);
    const redirect_route = params.get('route')?.replace(/%2F/g, '/');
    if (redirect_route && redirect_route !== '/') {
      return <Redirect to={redirect_route} />;
    }
  }

  // Redirect to dashboard by default
  return <Redirect to='/dashboard' />;
}
