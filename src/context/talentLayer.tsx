import { TalentLayerClient } from '@talentlayer/client';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useSwitchNetwork, useWalletClient } from 'wagmi';
import { useChainId } from '../hooks/useChainId';
import BuilderPlaceContext from '../modules/BuilderPlace/context/BuilderPlaceContext';
import UserContext from '../modules/BuilderPlace/context/UserContext';
import { getUserByAddress } from '../queries/users';
import { IUser } from '../types';

export type iTalentLayerContext = {
  loading: boolean;
  canUseBackendDelegate: boolean;
  refreshData: () => Promise<boolean>;
  user?: IUser;
  talentLayerClient?: TalentLayerClient;
};

const TalentLayerContext = createContext<iTalentLayerContext>({
  loading: true,
  canUseBackendDelegate: false,
  refreshData: async () => {
    return false;
  },
});

const TalentLayerProvider = ({ children }: { children: ReactNode }) => {
  const chainId = useChainId();
  const { switchNetwork } = useSwitchNetwork();
  const { data: walletClient } = useWalletClient();
  const { builderPlace } = useContext(BuilderPlaceContext);
  const { user: workerProfile } = useContext(UserContext);
  const [user, setUser] = useState<IUser | undefined>();

  const account = useAccount();
  const [canUseBackendDelegate, setCanUseBackendDelegate] = useState(false);
  const [loading, setLoading] = useState(true);
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
  }, [account.address, walletClient, chainId]);

  const fetchData = async () => {
    if (!account.address || !account.isConnected) {
      setLoading(false);
      return false;
    }

    try {
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
      if (builderPlace) {
        currentUser.isAdmin = builderPlace?.owner.address === currentUser?.address;
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
      const maxFreeTransactions = Number(
        process.env.NEXT_PUBLIC_MAX_FREE_WEEKLY_GASSLESS_TRANSACTIONS,
      );
      const nowSeconds = Math.floor(Date.now() / 1000);
      const oneWeekAgoSeconds = nowSeconds - 7 * 24 * 60 * 60; // 7 days ago in seconds
      const counterWillReset = workerProfile.counterStartDate < oneWeekAgoSeconds;

      console.log('user.delegates', user.delegates);
      console.log(
        'process.env.NEXT_PUBLIC_DELEGATE_ADDRESS',
        process.env.NEXT_PUBLIC_DELEGATE_ADDRESS,
      );

      const userHasDelegatedToPlatform =
        process.env.NEXT_PUBLIC_DELEGATE_ADDRESS &&
        user.delegates &&
        user.delegates.indexOf(process.env.NEXT_PUBLIC_DELEGATE_ADDRESS.toLowerCase()) !== -1;

      const userHasReachedDelegationLimit =
        (workerProfile?.weeklyTransactionCounter || 0) >= maxFreeTransactions;

      console.log(
        'userHasDelegatedToPlatform',
        process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE === 'true',
        !!userHasDelegatedToPlatform,
        !userHasReachedDelegationLimit || (userHasReachedDelegationLimit && counterWillReset),
        !!workerProfile?.isEmailVerified,
        user.delegates,
        process.env.NEXT_PUBLIC_DELEGATE_ADDRESS,
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
  }, [account.address]);

  const value = useMemo(() => {
    return {
      user,
      canUseBackendDelegate,
      refreshData: fetchData,
      loading,
      talentLayerClient,
    };
  }, [account.address, user?.id, canUseBackendDelegate, loading, talentLayerClient]);

  return <TalentLayerContext.Provider value={value}>{children}</TalentLayerContext.Provider>;
};

export { TalentLayerProvider };

export default TalentLayerContext;
