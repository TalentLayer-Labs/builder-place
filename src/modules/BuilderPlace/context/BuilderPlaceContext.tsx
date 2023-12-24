import { createContext, ReactNode, useEffect, useState } from 'react';
import { IBuilderPlace } from '../types';
import { useAccount } from 'wagmi';
import { getUserById } from '../../../queries/users';
import { toast } from 'react-toastify';
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
  const account = useAccount();
  const chainId = useChainId();
  const [builderPlace, setBuilderPlace] = useState<IBuilderPlace | undefined>();
  const [isBuilderPlaceCollaborator, setIsBuilderPlaceCollaborator] = useState<boolean>(false);
  const [isBuilderPlaceOwner, setIsBuilderPlaceOwner] = useState(false);

  const fetchBuilderPlaceOwner = async () => {
    if (!data?.ownerTalentLayerId) {
      return;
    }

    try {
      const response = await getUserById(chainId, data.ownerTalentLayerId);
      if (!response?.data?.data?.user) {
        return;
      }

      const builderPlaceOwner = response.data.data.user;

      const isUserBuilderPlaceOwner =
        account.address?.toLocaleLowerCase() === builderPlaceOwner?.address?.toLocaleLowerCase();
      setIsBuilderPlaceOwner(isUserBuilderPlaceOwner || false);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err);
      toast.error(`An error happened while loading your account: ${err.message}.`, {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchBuilderPlaceOwner();
  }, [chainId, data?.ownerTalentLayerId]);

  useEffect(() => {
    if (!data || !data.ownerTalentLayerId) return;

    const isBuilderPlaceCollaborator = data?.owners?.some(
      owner => owner.toLocaleLowerCase() === account?.address?.toLocaleLowerCase(),
    );

    setIsBuilderPlaceCollaborator(isBuilderPlaceCollaborator || false);
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
