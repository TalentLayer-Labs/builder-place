import { useEffect, useState } from 'react';
import { Filters, IService, ServiceStatusEnum } from '../types';
import { getFilteredServicesByKeywords } from '../pages/api/services/request';
import { useChainId } from 'wagmi';
import useAllowedTokens from './useAllowedTokens';

const useFilteredServices = (
  serviceStatus?: ServiceStatusEnum,
  buyerId?: string,
  sellerId?: string,
  searchQuery?: string,
  numberPerPage?: number,
  filters?: Filters,
  platformId?: string,
): {
  hasMoreData: boolean;
  loading: boolean;
  services: IService[];
  loadMore: () => void;
} => {
  const [services, setServices] = useState<IService[]>([]);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const chainId = useChainId();
  const allowedTokens = useAllowedTokens();

  useEffect(() => {
    setServices([]);
    setOffset(0);
  }, [searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        let newServices: IService[] = [];

        response = await getFilteredServicesByKeywords(
          serviceStatus,
          allowedTokens,
          buyerId,
          sellerId,
          numberPerPage,
          offset,
          searchQuery,
          platformId,
          chainId,
          filters
        );

        newServices = response?.data?.services;

        if (offset === 0) {
          setServices(newServices || []);
        } else {
          setServices([...services, ...newServices]);
        }
        if (newServices && numberPerPage && newServices.length < numberPerPage) {
          setHasMoreData(false);
        } else {
          setHasMoreData(true);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [numberPerPage, offset, searchQuery, filters]);

  const loadMore = () => {
    numberPerPage ? setOffset(offset + numberPerPage) : '';
  };

  return { hasMoreData, services, loading, loadMore };
};

export default useFilteredServices;
