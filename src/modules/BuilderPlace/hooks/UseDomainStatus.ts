import { useQuery } from '@tanstack/react-query';
import { DomainVerificationStatusProps, DomainResponse } from '../types';

export function useDomainStatus({ domain }: { domain: string }) {
  const { data, isLoading } = useQuery<{
    status: DomainVerificationStatusProps;
    domainJson: DomainResponse & { error: { code: string; message: string } };
  }>({
    queryKey: ['DomainStatus'],
    queryFn: () => fetch(`/api/domain/${domain}/verify`).then(res => res.json()),
    refetchInterval: 5000,
  });
  return {
    status: data?.status,
    domainJson: data?.domainJson,
    loading: isLoading,
  };
}
