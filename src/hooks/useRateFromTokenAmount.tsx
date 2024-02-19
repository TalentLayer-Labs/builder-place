import React, { useState, useEffect } from 'react';
import useTalentLayerClient from '../hooks/useTalentLayerClient';
import { IToken } from '../types';
import { formatUnits } from 'viem';


const useRateFromTokenAmount = ( amount: string, address: string ) => {
  const [token, setToken] = useState<IToken>();
  const [loading, setLoading] = useState<boolean>(true);
  const talentLayerClient = useTalentLayerClient();

  const tokenRate = (token: IToken, value: string): string => {
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      return 'invalid format';
    }
    

    const formattedValue = formatUnits(BigInt(parsedValue), token.decimals);
    return formattedValue;
  };

  useEffect(() => {
    // Fetch the number of token by token address
    const fetchDecimals = async () => {
      try {
        // Make an API call to get the number of token
        const data = await talentLayerClient?.graphQlClient.get(`
        {
           tokens(where: {address: "${address}"}) {
            address
            symbol
            name
            decimals
            minimumTransactionAmount
          }
        }
        `);
        setToken(data?.data?.tokens[0]);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch token:', error);
      }
    };

    fetchDecimals();
  }, [address]);

  if (!token || loading) {
    return null; // Return null while loading
  }

  return tokenRate(token, amount);
};

export default useRateFromTokenAmount;
