import { PlatformsFilters } from '../../../../app/api/platforms/route';
import { useQuery } from 'react-query';
import axios from 'axios';
import { BuilderPlace } from '@prisma/client';

interface IReturn {
  platform?: BuilderPlace;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const useGetPlatformBy = (filters: PlatformsFilters): IReturn => {
  const queryKey = ['platform', filters];

  const fetchPlatformBy = async (): Promise<BuilderPlace> => {
    console.log(`*DEBUG* getPlatformsBy fetch!`, filters);

    const response = await axios.get('/api/platforms', {
      params: filters,
    });

    const platforms: BuilderPlace[] = response.data.platforms;

    console.log(`*DEBUG* getPlatformBy results!`, platforms);

    return platforms[0];
  };

  const {
    data: platform,
    isLoading,
    isError,
    error,
  } = useQuery<BuilderPlace, Error>(queryKey, fetchPlatformBy, {
    enabled: !!filters,
  });

  return { platform, isLoading, isError, error };
};

export default useGetPlatformBy;
