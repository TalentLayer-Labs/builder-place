import { useAccount, useConfig } from 'wagmi';

export const useChainId = (): number => {
  const { chains } = useConfig();
  const { chain } = useAccount();
  const chainId =
    chain?.id || chains[0]?.id || (process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as unknown as number);
  return chainId;
};
