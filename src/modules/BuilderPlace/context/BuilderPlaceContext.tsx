import { createContext, ReactNode, useEffect, useState } from 'react';
import { IBuilderPlace } from '../types';
import { useAccount } from 'wagmi';
import { useChainId } from '../../../hooks/useChainId';

const BuilderPlaceContext = createContext<{
  builderPlace?: IBuilderPlace;
  isBuilderPlaceCollaborator: boolean;
  isBuilderPlaceOwner: boolean;
}>({
  builderPlace: undefined,
  isBuilderPlaceCollaborator: false,
  isBuilderPlaceOwner: false,
});

const BuilderPlaceProvider = ({ data, children }: { data: IBuilderPlace; children: ReactNode }) => {
  const { address } = useAccount();
  const isBuilderPlaceOwner = address === data?.owner?.address;
  const isBuilderPlaceCollaborator = data?.collaborators
    ? data?.collaborators?.some(
        collaborator => collaborator?.address?.toLocaleLowerCase() === address?.toLocaleLowerCase(),
      )
    : false;
  const builderPlace = data;

  const value = {
    builderPlace,
    isBuilderPlaceOwner,
    isBuilderPlaceCollaborator,
  };

  return <BuilderPlaceContext.Provider value={value}>{children}</BuilderPlaceContext.Provider>;
};

export { BuilderPlaceProvider };

export default BuilderPlaceContext;
