import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { IBuilderPlace } from '../types';
import { iBuilderPlaceContext, IUser } from '../../../types';
import { useChainId } from '../../../hooks/useChainId';
import { useAccount } from 'wagmi';
import { getCompletionScores, ICompletionScores } from '../../../utils/profile';
import { toast } from 'react-toastify';
import useTalentLayerClient from '../../../hooks/useTalentLayerClient';

const BuilderPlaceContext = createContext<iBuilderPlaceContext>({
  loading: true,
  isActiveDelegate: false,
  refreshData: async () => {
    return false;
  },
  builderPlace: undefined,
  isBuilderPlaceOwner: false,
});

const BuilderPlaceProvider = ({
  data,
  children,
}: {
  data: { builderPlace: IBuilderPlace; connectedUser: IUser };
  children: ReactNode;
}) => {
  const chainId = useChainId();
  const [user, setUser] = useState<IUser | undefined>();
  const account = useAccount();
  const [isActiveDelegate, setIsActiveDelegate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completionScores, setCompletionScores] = useState<ICompletionScores | undefined>();
  const talentLayerClient = useTalentLayerClient();
  const [builderPlace, setBuilderPlace] = useState<IBuilderPlace | undefined>();
  const [isBuilderPlaceOwner, setIsBuilderPlaceOwner] = useState<boolean>(false);

  const fetchData = async () => {
    if (
      !data.builderPlace ||
      !data.builderPlace.ownerTalentLayerId ||
      !data.connectedUser ||
      !account.isConnected ||
      !talentLayerClient
    ) {
      setLoading(false);
      return false;
    }

    try {
      const platform = await talentLayerClient.platform.getOne(
        process.env.NEXT_PUBLIC_PLATFORM_ID as string,
      );

      data.connectedUser.isAdmin = platform?.address === data.connectedUser?.address;

      setUser(data.connectedUser);
      setIsActiveDelegate(
        process.env.NEXT_PUBLIC_ACTIVE_DELEGATE === 'true' &&
          !!data.connectedUser.delegates &&
          data.connectedUser.delegates.indexOf(
            (process.env.NEXT_PUBLIC_DELEGATE_ADDRESS as string).toLowerCase(),
          ) !== -1,
      );

      const isBuilderPlaceOwner = data?.builderPlace.owners?.some(
        owner => owner.toLocaleLowerCase() === account?.address?.toLocaleLowerCase(),
      );

      setIsBuilderPlaceOwner(isBuilderPlaceOwner || false);
      setBuilderPlace(data.builderPlace);

      setLoading(false);
      return true;
    } catch (err: any) {
      setLoading(false);
      // eslint-disable-next-line no-console
      console.error(err);
      toast.error(`An error happened while loading you account: ${err.message}.`, {
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
    fetchData();
  }, [chainId, data, account.address, talentLayerClient]);

  useEffect(() => {
    if (!user) return;
    const completionScores = getCompletionScores(user);
    setCompletionScores(completionScores);
  }, [user]);

  const value = useMemo(() => {
    return {
      user,
      account: account ? account : undefined,
      isActiveDelegate,
      refreshData: fetchData,
      loading,
      completionScores,
      talentLayerClient,
      builderPlace,
      isBuilderPlaceOwner,
    };
  }, [
    account.address,
    user?.id,
    isActiveDelegate,
    loading,
    completionScores,
    talentLayerClient,
    builderPlace,
    isBuilderPlaceOwner,
  ]);

  return <BuilderPlaceContext.Provider value={value}>{children}</BuilderPlaceContext.Provider>;
};

export { BuilderPlaceProvider };

export default BuilderPlaceContext;
