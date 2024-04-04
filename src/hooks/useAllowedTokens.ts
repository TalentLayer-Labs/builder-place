import { useEffect, useState } from 'react';
import { IToken } from '../types';
import { getAllowedTokenList } from '../queries/global';
import { useChainId } from './useChainId';

const tokensCache: { [key: string]: IToken[] } = {};

const useAllowedTokens = (): IToken[] => {
  const chainId = useChainId();
  const [allowedTokens, setAllowedTokens] = useState<IToken[]>(tokensCache[chainId] || []);

  useEffect(() => {
    const fetchData = async () => {
      if (!tokensCache[chainId]) {
        try {
          const response = await getAllowedTokenList(chainId);
          if (response?.data?.data?.tokens) {
            tokensCache[chainId] = response.data.data.tokens;
            setAllowedTokens(response.data.data.tokens);
          }
        } catch (error: any) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      } else {
        console.log('tokensCache', tokensCache[chainId]);
      }
    };
    fetchData();
  }, [chainId]);

  return allowedTokens;
};

export default useAllowedTokens;
