import { useRouter } from 'next/router';
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { useGetSpace } from '../hooks/UseGetSpace';
import { Space } from '../types';

const SpaceContext = createContext<{
  space?: Space;
  loading: boolean;
  spaceNotFound: boolean;
}>({
  space: undefined,
  loading: true,
  spaceNotFound: false,
});

const SpaceProvider = ({ children }: { children: ReactNode }) => {
  const [spaceNotFound, setSpaceNotFound] = useState(false);
  const { query } = useRouter();
  const domain = query.domain;

  const { space, loading } = useGetSpace({ domain: domain as string });

  const fetchData = async () => {
    if (space === undefined) {
      setSpaceNotFound(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, [space, spaceNotFound, query, domain]);

  const value = useMemo(() => {
    return {
      space,
      loading,
      spaceNotFound,
    };
  }, [space, loading, spaceNotFound]);

  useEffect(() => {
    const root = document.documentElement;

    if (!space || 'error' in space) return undefined;

    root.style.setProperty('--primary', space.pallete.primary);
    root.style.setProperty('--primary-focus', space.pallete['primary-focus']);
    root.style.setProperty('--primary-content', space.pallete['primary-content']);
    root.style.setProperty('--base-100', space.pallete['base-100']);
    root.style.setProperty('--base-200', space.pallete['base-200']);
    root.style.setProperty('--base-300', space.pallete['base-300']);
    root.style.setProperty('--base-content', space.pallete['base-content']);
    root.style.setProperty('--info', space.pallete.info);
    root.style.setProperty('--info-content', space.pallete['info-content']);
    root.style.setProperty('--success', space.pallete.success);
    root.style.setProperty('--success-content', space.pallete['success-content']);
    root.style.setProperty('--warning', space.pallete.warning);
    root.style.setProperty('--warning-content', space.pallete['warning-content']);
    root.style.setProperty('--error', space.pallete.error);
    root.style.setProperty('--error-content', space.pallete['error-content']);
  }, [space]);

  return <SpaceContext.Provider value={value}>{children}</SpaceContext.Provider>;
};

export { SpaceProvider };

export default SpaceContext;
