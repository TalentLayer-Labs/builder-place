import { createContext, ReactNode, useEffect, useState } from 'react';
import { IBuilderPlace } from '../types';
import { iBuilderPlaceContext, IUser } from '../../../types';
import { useChainId } from '../../../hooks/useChainId';
import { useAccount } from 'wagmi';
import { getCompletionScores, ICompletionScores } from '../../../utils/profile';
import { TalentLayerClient } from '@talentlayer/client';
import { getUserById } from '../../../queries/users';
import { toast } from 'react-toastify';

const BuilderPlaceContext = createContext<iBuilderPlaceContext>({
  loading: true,
  isActiveDelegate: false,
  refreshData: async () => {
    return false;
  },
  builderPlace: undefined,
  isBuilderPlaceOwner: false,
});

const BuilderPlaceProvider = ({ data, children }: { data: IBuilderPlace; children: ReactNode }) => {
  const chainId = useChainId();
  const [user, setUser] = useState<IUser | undefined>();
  const account = useAccount();
  const [isActiveDelegate, setIsActiveDelegate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completionScores, setCompletionScores] = useState<ICompletionScores | undefined>();
  const [talentLayerClient, setTalentLayerClient] = useState<TalentLayerClient>();
  const [builderPlace, setBuilderPlace] = useState<IBuilderPlace | undefined>();
  const [isBuilderPlaceOwner, setIsBuilderPlaceOwner] = useState<boolean>(false);

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
    if (!data || !data.ownerTalentLayerId || !account.isConnected || !talentLayerClient) {
      setLoading(false);
      return false;
    }

    try {
      const userResponse = await getUserById(chainId, data.ownerTalentLayerId);

      if (!userResponse?.data?.data?.user) {
        setLoading(false);
        return false;
      }
      const currentUser = userResponse.data.data.user;

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

      // const isBuilderPlaceOwner = data?.owners?.some(
      //   owner => owner.toLocaleLowerCase() === currentUser?.address.toLocaleLowerCase(),
      // );
      //
      // setIsBuilderPlaceOwner(isBuilderPlaceOwner || false);
      // setBuilderPlace(data);

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
  }, [chainId, data, talentLayerClient]);

  useEffect(() => {
    if (!user) return;
    const completionScores = getCompletionScores(user);
    setCompletionScores(completionScores);
  }, [user]);

  useEffect(() => {
    if (!data) return;

    const isBuilderPlaceOwner = data?.owners?.some(
      owner => owner.toLocaleLowerCase() === user?.address.toLocaleLowerCase(),
    );

    setIsBuilderPlaceOwner(isBuilderPlaceOwner || false);
    setBuilderPlace(data);
  }, [data, user]);

  const value = {
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

  return <BuilderPlaceContext.Provider value={value}>{children}</BuilderPlaceContext.Provider>;
};

export { BuilderPlaceProvider };

export default BuilderPlaceContext;
