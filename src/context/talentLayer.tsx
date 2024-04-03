import { User } from '.prisma/client';
import { TalentLayerClient } from '@talentlayer/client';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useSwitchNetwork, useWalletClient } from 'wagmi';
import { MAX_TRANSACTION_AMOUNT } from '../config';
import { useChainId } from '../hooks/useChainId';
import { getUserBy } from '../modules/BuilderPlace/request';
import { getUserByAddress } from '../queries/users';
import { IAccount, IUser } from '../types';
import { getCompletionScores, ICompletionScores } from '../utils/profile';
import BuilderPlaceContext from '../modules/BuilderPlace/context/BuilderPlaceContext';

export type iTalentLayerContext = {
  loading: boolean;
  canUseBackendDelegate: boolean;
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
  canUseBackendDelegate: false,
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
  const { builderPlace } = useContext(BuilderPlaceContext);
  const [user, setUser] = useState<IUser | undefined>();
  const [workerProfile, setWorkerProfile] = useState<User>();
  const account = useAccount();
  const [canUseBackendDelegate, setCanUseBackendDelegate] = useState(false);
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

    const platformId = parseInt(
      builderPlace?.talentLayerPlatformId || (process.env.NEXT_PUBLIC_PLATFORM_ID as string),
    );

    const talentLayerClient = new TalentLayerClient({
      chainId: process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as unknown as number,
      ipfsConfig: {
        clientSecret: process.env.NEXT_PUBLIC_IPFS_SECRET as string,
        baseUrl: process.env.NEXT_PUBLIC_IPFS_WRITE_URL as string,
      },
      platformId: platformId,
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
        setUser(undefined);
        setLoading(false);
        return false;
      }

      const currentUser = userResponse.data.data.users[0];

      if (builderPlace?.talentLayerPlatformId) {
        const platform = await talentLayerClient.platform.getOne(
          // process.env.NEXT_PUBLIC_PLATFORM_ID as string,
          builderPlace?.talentLayerPlatformId,
        );
        currentUser.isAdmin = platform?.address === currentUser?.address;
      }

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

  // Check whether all conditions are met to use the backend delegate
  useEffect(() => {
    if (user && workerProfile) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const oneWeekAgoSeconds = nowSeconds - 7 * 24 * 60 * 60; // 7 days ago in seconds
      const counterWillReset = workerProfile.counterStartDate < oneWeekAgoSeconds;

      const userHasDelegatedToPlatform =
        process.env.NEXT_PUBLIC_DELEGATE_ADDRESS &&
        user.delegates &&
        user.delegates.indexOf(process.env.NEXT_PUBLIC_DELEGATE_ADDRESS.toLowerCase()) !== -1;

      const userHasReachedDelegationLimit =
        (workerProfile?.weeklyTransactionCounter || 0) >= MAX_TRANSACTION_AMOUNT;

      console.log(
        'userHasDelegatedToPlatform',
        process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE === 'true',
        !!userHasDelegatedToPlatform,
        !userHasReachedDelegationLimit || (userHasReachedDelegationLimit && counterWillReset),
        !!workerProfile?.isEmailVerified,
      );
      setCanUseBackendDelegate(
        process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE === 'true' &&
          !!userHasDelegatedToPlatform &&
          (!userHasReachedDelegationLimit || (userHasReachedDelegationLimit && counterWillReset)) &&
          !!workerProfile?.isEmailVerified,
      );
    }
  }, [user, workerProfile]);

  useEffect(() => {
    fetchData();
  }, [chainId, account.address, talentLayerClient]);

  const getWorkerProfile = async () => {
    try {
      setLoading(true);

      const response = await getUserBy({ address: account.address });
      console.log('response.talentLayerId', response.talentLayerId);
      console.log('response.id', response.id);
      console.log('response.isEmailVerified', response.isEmailVerified);
      console.log('response.address', response.address);
      if (!response) {
        setWorkerProfile(undefined);
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
      canUseBackendDelegate,
      refreshData: fetchData,
      refreshWorkerProfile: refreshWorkerProfile,
      loading,
      completionScores,
      talentLayerClient,
    };
  }, [
    account.address,
    user?.id,
    canUseBackendDelegate,
    workerProfile,
    loading,
    completionScores,
    talentLayerClient,
  ]);

  return <TalentLayerContext.Provider value={value}>{children}</TalentLayerContext.Provider>;
};

export { TalentLayerProvider };

export default TalentLayerContext;
