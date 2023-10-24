import { useQuery } from 'react-query';
import { DomainResponse, DomainVerificationStatusProps } from '../types';

export function useDomainStatus({ domain }: { domain: string }) {
  const { data, isLoading } = useQuery<{
    status: DomainVerificationStatusProps;
    domainJson: DomainResponse & { error: { code: string; message: string } };
  }>('DomainStatus', () => fetch(`/api/domain/${domain}/verify`).then(res => res.json()), {
    refetchInterval: 5000,
    keepPreviousData: true,
  });
  return {
    status: data?.status,
    domainJson: data?.domainJson,
    loading: isLoading,
  };
}
