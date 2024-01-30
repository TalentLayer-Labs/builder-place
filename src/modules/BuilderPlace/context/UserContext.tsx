import { User } from '@prisma/client';
import { createContext, ReactNode, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount } from 'wagmi';
import { getUserBy } from '../request';

const UserContext = createContext<{
  user?: User;
  loading: boolean;
  getUser: () => Promise<void>;
}>({
  user: undefined,
  loading: false,
  getUser: async () => {
    return;
  },
});

/**
 * @SPECS
 * Wallet address is our way to identify a user and connect the linked DB profile
 *    - we don't use TalentLayerId because it requires one more step (graph query)
 */
const UserProvider = ({ children }: { children: ReactNode }) => {
  const { address } = useAccount();
  const [user, setUser] = useState<User | undefined>();
  const [loading, setLoading] = useState(true);

  console.log('*DEBUG* UserProvider', { address, user, loading });

  const getUser = async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      console.log('*DEBUG* getUserBy', { address: address });
      const data = await getUserBy({ address: address });
      setUser(data);
    } catch (err: any) {
      toast.error(`An error happened while loading your account: ${err.message}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, [address]);

  const value = {
    user,
    loading,
    getUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export { UserProvider };

export default UserContext;
