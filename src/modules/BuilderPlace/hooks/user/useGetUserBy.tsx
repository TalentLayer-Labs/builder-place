import { useQuery } from 'react-query';
import axios from 'axios';
import { User } from '.prisma/client';
import { UsersFilters } from '../../../../app/api/users/route';

interface IReturn {
  user?: User;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const useGetUserBy = (filters: UsersFilters): IReturn => {
  const queryKey = ['user', filters];

  const fetchUserBy = async (): Promise<User> => {
    console.log(`*DEBUG* getUserBy fetch!`, filters);

    const response = await axios.get('/api/users', {
      params: filters,
    });

    const users: User[] = response.data.users;

    console.log(`*DEBUG* getUsersBy results!`, users);

    return users[0];
  };

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<User, Error>(queryKey, fetchUserBy, {
    enabled: !!filters,
  });

  return { user, isLoading, isError, error };
};

export default useGetUserBy;
