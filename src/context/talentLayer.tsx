import { User } from '.prisma/client';
import { TalentLayerClient } from '@talentlayer/client';
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useSwitchNetwork, useWalletClient } from 'wagmi';
import { MAX_TRANSACTION_AMOUNT } from '../config';
import { useChainId } from '../hooks/useChainId';
import { getUserBy } from '../modules/BuilderPlace/request';
import { getUserByAddress } from '../queries/users';
import { IAccount, IUser } from '../types';
import { getCompletionScores, ICompletionScores } from '../utils/profile';

export type iTalentLayerContext = {
  loading: boolean;
  canUseDelegation: boolean;
  refreshData: () => Promise<boolean>;
  refreshWorkerProfile: () => Promise<boolean>;
  user?: IUser;
  account?: IAccount;
  workerProfile?: User;
  completionScores?: ICompletionScores;
  talentLayerClient?: TalentLayerClient;
};

// export enum PreferredWorkTypes {
//   jobs = 'jobs',
//   bounties = 'bounties',
//   grants = 'grants',
//   gigs = 'gigs',
// }

const TalentLayerContext = createContext<iTalentLayerContext>({
  loading: true,
  canUseDelegation: false,
  refreshData: async () => {
    return false;
  },
  refreshWorkerProfile: async () => {
    return false;
  },
});

const TalentLayerProvider = ({ children }: { children: ReactNode }) => {
  const chainId = useChainId();
  const { switchNetwork } = useSwitchNetwork();
  const { data: walletClient } = useWalletClient();
  const [user, setUser] = useState<IUser | undefined>();
  const [workerProfile, setWorkerProfile] = useState<User>();
  const account = useAccount();
  const [canUseDelegation, setCanUseDelegation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completionScores, setCompletionScores] = useState<ICompletionScores | undefined>();
  const [talentLayerClient, setTalentLayerClient] = useState<TalentLayerClient>();

  // automatically switch to the default chain is the current one is not part of the config
  useEffect(() => {
    if (
      switchNetwork &&
      chainId !== (process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as unknown as number)
    ) {
      switchNetwork(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as unknown as number);
    }

    const talentLayerClient = new TalentLayerClient({
      chainId: process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as unknown as number,
      ipfsConfig: {
        clientId: process.env.NEXT_PUBLIC_INFURA_ID as string,
        clientSecret: process.env.NEXT_PUBLIC_INFURA_SECRET as string,
        baseUrl: process.env.NEXT_PUBLIC_IPFS_WRITE_URL as string,
      },
      platformId: parseInt(process.env.NEXT_PUBLIC_PLATFORM_ID as string),
      signatureApiUrl: process.env.NEXT_PUBLIC_SIGNATURE_API_URL as string,
      walletConfig: walletClient
        ? {
            walletClient,
          }
        : undefined,
    });
    setTalentLayerClient(talentLayerClient);
  }, [account.address, walletClient]);

  const fetchData = async () => {
    if (!account.address || !account.isConnected || !talentLayerClient) {
      setLoading(false);
      return false;
    }

    try {
      console.log('fetching data', account.address);
      const userResponse = await getUserByAddress(
        process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as unknown as number,
        account.address,
      );

      if (userResponse?.data?.data?.users?.length == 0) {
        setLoading(false);
        return false;
      }

      const currentUser = userResponse.data.data.users[0];

      const platform = await talentLayerClient.platform.getOne(
        process.env.NEXT_PUBLIC_PLATFORM_ID as string,
      );
      currentUser.isAdmin = platform?.address === currentUser?.address;

      const userHasDelegatedToPlatform =
        process.env.NEXT_PUBLIC_DELEGATE_ADDRESS &&
        userResponse.data.data.users[0].delegates &&
        userResponse.data.data.users[0].delegates.indexOf(
          process.env.NEXT_PUBLIC_DELEGATE_ADDRESS.toLowerCase(),
        ) !== -1;

      const userHasReachedDelegationLimit =
        (workerProfile?.weeklyTransactionCounter || 0) > MAX_TRANSACTION_AMOUNT;

      setCanUseDelegation(
        process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE === 'true' &&
          userHasDelegatedToPlatform &&
          !userHasReachedDelegationLimit,
      );

      setUser(currentUser);

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

  const getWorkerProfile = async () => {
    try {
      setLoading(true);

      const response = await getUserBy({ address: account.address });
      if (!response) {
        console.error('Error while fetching user profile');
        return;
      }
      setWorkerProfile(response);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkerProfile = async () => {
    try {
      setLoading(true);
      console.log('refreshing worker data');
      await getWorkerProfile();
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
    getWorkerProfile();
  }, [user]);

  const value = useMemo(() => {
    return {
      user,
      account: account ? account : undefined,
      workerProfile,
      canUseDelegation,
      refreshData: fetchData,
      refreshWorkerProfile: refreshWorkerProfile,
      loading,
      completionScores,
      talentLayerClient,
    };
  }, [
    account.address,
    user?.id,
    canUseDelegation,
    workerProfile,
    loading,
    completionScores,
    talentLayerClient,
  ]);

  return <TalentLayerContext.Provider value={value}>{children}</TalentLayerContext.Provider>;
};

export { TalentLayerProvider };

export default TalentLayerContext;
