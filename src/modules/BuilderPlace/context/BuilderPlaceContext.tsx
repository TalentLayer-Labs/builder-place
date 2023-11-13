import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { IBuilderPlace } from '../types';
import { iBuilderPlaceContext, IUser } from '../../../types';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';

const BuilderPlaceContext = createContext<iBuilderPlaceContext>({
  loading: true,
  refreshData: async () => {
    return false;
  },
  builderPlace: undefined,
  builderPlaceOwner: undefined,
  isBuilderPlaceOwner: false,
});

const BuilderPlaceProvider = ({
  data,
  children,
}: {
  data: { builderPlace: IBuilderPlace; builderPlaceOwner: IUser };
  children: ReactNode;
}) => {
  const account = useAccount();
  const [builderPlaceOwner, setBuilderPlaceOwner] = useState<IUser | undefined>();
  const [loading, setLoading] = useState(true);
  const [builderPlace, setBuilderPlace] = useState<IBuilderPlace | undefined>();
  const [isBuilderPlaceOwner, setIsBuilderPlaceOwner] = useState<boolean>(false);

  const fetchData = async () => {
    if (
      !data.builderPlace ||
      !data.builderPlace.ownerTalentLayerId ||
      !data.builderPlaceOwner ||
      !account.isConnected
    ) {
      setLoading(false);
      return false;
    }

    try {
      const isBuilderPlaceOwner = data?.builderPlace?.owners?.some(
        owner => owner.toLocaleLowerCase() === account?.address?.toLocaleLowerCase(),
      );

      setIsBuilderPlaceOwner(isBuilderPlaceOwner || false);
      setBuilderPlace(data.builderPlace);
      setBuilderPlaceOwner(data.builderPlaceOwner);

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
  }, [data, account.address]);

  const value = useMemo(() => {
    return {
      loading,
      refreshData: fetchData,
      builderPlaceOwner: builderPlaceOwner,
      builderPlace,
      isBuilderPlaceOwner,
    };
  }, [account.address, builderPlaceOwner?.id, loading, builderPlace, isBuilderPlaceOwner]);

  return <BuilderPlaceContext.Provider value={value}>{children}</BuilderPlaceContext.Provider>;
};

export { BuilderPlaceProvider };

export default BuilderPlaceContext;
