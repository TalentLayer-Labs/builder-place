import { createContext, ReactNode, useMemo, useState } from 'react';
import { iSpaceContext, Space } from '../types';

interface Props {
  children: ReactNode;
}

const SpaceContext = createContext<iSpaceContext>({
  setSpaceContext: _space => {},
});

const SpaceProvider = ({ children }: Props) => {
  const [space, setSpace] = useState<Space>();

  const setSpaceContext = (_space: Space) => {
    setSpace(_space);
  };

  const value = useMemo(() => {
    return {
      space,
      setSpaceContext,
    };
  }, [space, setSpaceContext]);

  return <SpaceContext.Provider value={value}>{children}</SpaceContext.Provider>;
};

export { SpaceProvider };

export default SpaceContext;
