import { PlatformsFilters } from '../../../../app/api/platforms/route';
import { useQuery } from 'react-query';
import { IBuilderPlace } from '../../types';
import axios from 'axios';

interface IReturn {
  platform?: IBuilderPlace;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const useGetPlatformBy = (filters: PlatformsFilters): IReturn => {
  const queryKey = ['platform', filters];

  const fetchPlatformBy = async (): Promise<IBuilderPlace> => {
    console.log(`*DEBUG* getPlatformsBy fetch!`, filters);

    const response = await axios.get('/api/platforms', {
      params: filters,
    });

    const platforms: IBuilderPlace[] = response.data.platforms;

    console.log(`*DEBUG* getPlatformBy results!`, platforms);
    return platforms[0];
  };

  const {
    data: platform,
    isLoading,
    isError,
    error,
  } = useQuery<IBuilderPlace, Error>(queryKey, fetchPlatformBy, {
    enabled: !!filters,
  });

  return { platform, isLoading, isError, error };
};

export default useGetPlatformBy;
