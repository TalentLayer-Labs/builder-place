import { createContext, ReactNode, useEffect, useState } from 'react';
import { IBuilderPlace } from '../types';
import { useAccount, useChainId } from 'wagmi';

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
  const chainId = useChainId();
  const { address } = useAccount();
  const [builderPlace, setBuilderPlace] = useState<IBuilderPlace | undefined>();
  const [isBuilderPlaceCollaborator, setIsBuilderPlaceCollaborator] = useState<boolean>(false);
  const [isBuilderPlaceOwner, setIsBuilderPlaceOwner] = useState(false);
  const ownerTalentLayerHandle = data?.owner?.talentLayerHandle;

  const fetchBuilderPlaceOwner = async () => {
    if (!ownerTalentLayerHandle) {
      return;
    }
    const isUserBuilderPlaceOwner = address === data.owner.address;
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
