'use client';

import { createContext, ReactNode, useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { BuilderPlaceWithOwnerAndCollaborators } from '../actions/builderPlace';

const BuilderPlaceContext = createContext<{
  builderPlace?: BuilderPlaceWithOwnerAndCollaborators;
  isBuilderPlaceCollaborator: boolean;
  isBuilderPlaceOwner: boolean;
}>({
  builderPlace: undefined,
  isBuilderPlaceCollaborator: false,
  isBuilderPlaceOwner: false,
});

const BuilderPlaceProvider = ({
  data,
  children,
}: {
  data: BuilderPlaceWithOwnerAndCollaborators;
  children: ReactNode;
}) => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [builderPlace, setBuilderPlace] = useState<
    BuilderPlaceWithOwnerAndCollaborators | undefined
  >();
  const [isBuilderPlaceCollaborator, setIsBuilderPlaceCollaborator] = useState<boolean>(false);
  const [isBuilderPlaceOwner, setIsBuilderPlaceOwner] = useState(false);
  const ownerTalentLayerHandle = data?.owner?.talentLayerHandle;

  console.log('BuilderPlaceProvider', { data: data.collaborators });

  const fetchBuilderPlaceOwner = async () => {
    if (!ownerTalentLayerHandle) {
      return;
    }
    const isUserBuilderPlaceOwner = address === data.owner?.address;
    setIsBuilderPlaceOwner(isUserBuilderPlaceOwner || false);
  };

  useEffect(() => {
    fetchBuilderPlaceOwner();
  }, [chainId, data?.ownerId, address]);

  useEffect(() => {
    if (!ownerTalentLayerHandle) return;

    const isBuilderPlaceCollaborator = data?.collaborators?.some(
      collaborator => collaborator?.address?.toLocaleLowerCase() === address?.toLocaleLowerCase(),
    );

    setIsBuilderPlaceCollaborator(isBuilderPlaceCollaborator || false);
    setBuilderPlace(data);
  }, [data, address]);

  const value = {
    builderPlace,
    isBuilderPlaceOwner,
    isBuilderPlaceCollaborator,
  };

  return <BuilderPlaceContext.Provider value={value}>{children}</BuilderPlaceContext.Provider>;
};

export { BuilderPlaceProvider };

export default BuilderPlaceContext;
