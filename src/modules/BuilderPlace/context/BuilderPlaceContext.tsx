import { createContext, ReactNode, useEffect, useState } from 'react';
import { IBuilderPlace } from '../types';
import { useAccount } from 'wagmi';
import useUserById from '../../../hooks/useUserById';

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
  const account = useAccount();
  const [builderPlace, setBuilderPlace] = useState<IBuilderPlace | undefined>();
  const [isBuilderPlaceCollaborator, setIsBuilderPlaceCollaborator] = useState<boolean>(false);
  const [isBuilderPlaceOwner, setIsBuilderPlaceOwner] = useState(false);

  useEffect(() => {
    if (!data || !data.ownerTalentLayerId) return;

    const isBuilderPlaceCollaborator = data?.owners?.some(
      owner => owner.toLocaleLowerCase() === account?.address?.toLocaleLowerCase(),
    );

    const builderPlaceOwner = useUserById(data.ownerTalentLayerId);

    const isBuilderPlaceOwner =
      account.address?.toLocaleLowerCase() === builderPlaceOwner?.address?.toLocaleLowerCase();

    setIsBuilderPlaceCollaborator(isBuilderPlaceCollaborator || false);
    setIsBuilderPlaceOwner(isBuilderPlaceOwner || false);
    setBuilderPlace(data);
  }, [data, account]);

  const value = {
    builderPlace,
    isBuilderPlaceOwner,
    isBuilderPlaceCollaborator,
  };

  return <BuilderPlaceContext.Provider value={value}>{children}</BuilderPlaceContext.Provider>;
};

export { BuilderPlaceProvider };

export default BuilderPlaceContext;
