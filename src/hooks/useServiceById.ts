import { useQuery } from 'react-query';
import { IService } from '../types';
import { useChainId } from './useChainId';
import useTalentLayerClient from './useTalentLayerClient';
import { getServiceById } from '../queries/services';

interface IReturn {
  service?: IService;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const useServiceById = (serviceId: string): IReturn => {
  const chainId = useChainId();
  const talentLayerClient = useTalentLayerClient();

  const queryKey = ['service', serviceId, chainId];

  const fetchService = async (): Promise<IService> => {
    if (!talentLayerClient) {
      throw new Error('TalentLayer client is not available');
    }
    //TODO add "platform" in SDK query
    // const response = await talentLayerClient.service.getOne(serviceId);
    const response = await getServiceById(chainId, serviceId);
    return response?.data?.data?.service;
  };

  const {
    data: service,
    isLoading,
    isError,
    error,
  } = useQuery<IService, Error>(queryKey, fetchService, {
    enabled: !!serviceId && !!talentLayerClient,
  });

  return { service, isLoading, isError, error: error || null };
};

export default useServiceById;
