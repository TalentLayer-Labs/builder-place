import { TalentLayerClient } from '@talentlayer/client';
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount } from 'wagmi';
import { useChainId } from '../hooks/useChainId';
import { getUserByAddress } from '../queries/users';
import { iTalentLayerContext, IUser } from '../types';
import { getCompletionScores, ICompletionScores } from '../utils/profile';
import { getWorkerProfileByOwnerId } from '../modules/BuilderPlace/request';
import { IWorkerProfile } from '../modules/BuilderPlace/types';

const TalentLayerContext = createContext<iTalentLayerContext>({
  loading: true,
  isActiveDelegate: false,
  refreshData: async () => {
    return false;
  },
  refreshWorkerData: async () => {
    return false;
  },
});

const TalentLayerProvider = ({ children }: { children: ReactNode }) => {
  const chainId = useChainId();
  const [user, setUser] = useState<IUser | undefined>();
  const [workerData, setWorkerData] = useState<IWorkerProfile | undefined>();
  const account = useAccount();
  const [isActiveDelegate, setIsActiveDelegate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completionScores, setCompletionScores] = useState<ICompletionScores | undefined>();
  const [talentLayerClient, setTalentLayerClient] = useState<TalentLayerClient>();

  // automatically switch to the default chain is the current one is not part of the config
  useEffect(() => {
    const talentLayerClient = new TalentLayerClient({
      chainId: process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as unknown as number,
      ipfsConfig: {
        clientId: process.env.NEXT_PUBLIC_INFURA_ID as string,
        clientSecret: process.env.NEXT_PUBLIC_INFURA_SECRET as string,
        baseUrl: process.env.NEXT_PUBLIC_IPFS_WRITE_URL as string,
      },
      platformId: parseInt(process.env.NEXT_PUBLIC_PLATFORM_ID as string),
      signatureApiUrl: process.env.NEXT_PUBLIC_SIGNATURE_API_URL as string,
    });
    setTalentLayerClient(talentLayerClient);
  }, [account.address]);

  const fetchData = async () => {
    if (!account.address || !account.isConnected || !talentLayerClient) {
      setLoading(false);
      return false;
    }

    try {
      const userResponse = await getUserByAddress(chainId, account.address);

      if (userResponse?.data?.data?.users?.length == 0) {
        setLoading(false);
        return false;
      }

      const currentUser = userResponse.data.data.users[0];

      const platform = await talentLayerClient.platform.getOne(
        process.env.NEXT_PUBLIC_PLATFORM_ID as string,
      );
      currentUser.isAdmin = platform?.address === currentUser?.address;

      setUser(currentUser);

      setIsActiveDelegate(
        process.env.NEXT_PUBLIC_ACTIVE_DELEGATE === 'true' &&
          userResponse.data.data.users[0].delegates &&
          userResponse.data.data.users[0].delegates.indexOf(
            (process.env.NEXT_PUBLIC_DELEGATE_ADDRESS as string).toLowerCase(),
          ) !== -1,
      );
      setLoading(false);
      return true;
    } catch (err: any) {
      setLoading(false);
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
    fetchData();
  }, [chainId, account.address, talentLayerClient]);

  const getWorkerData = async (userId: string) => {
    const response = await getWorkerProfileByOwnerId(userId);
    const data = await response.json();
    if (data) {
      setWorkerData({
        ...data,
      });
    }
  };

  const refreshWorkerData = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        console.log('refreshing worker data');
        await getWorkerData(user.id);
      }
      return true;
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const completionScores = getCompletionScores(user);
    setCompletionScores(completionScores);

    if (user?.id) {
      getWorkerData(user.id);
    }
  }, [user]);

  const value = useMemo(() => {
    return {
      user,
      account: account ? account : undefined,
      workerData,
      isActiveDelegate,
      refreshData: fetchData,
      refreshWorkerData: refreshWorkerData,
      loading,
      completionScores,
      talentLayerClient,
    };
  }, [
    account.address,
    user?.id,
    isActiveDelegate,
    workerData,
    loading,
    completionScores,
    talentLayerClient,
  ]);

  return <TalentLayerContext.Provider value={value}>{children}</TalentLayerContext.Provider>;
};

export { TalentLayerProvider };

export default TalentLayerContext;
