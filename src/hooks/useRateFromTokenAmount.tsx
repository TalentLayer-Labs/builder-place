import React, { useState, useEffect } from 'react';
import useTalentLayerClient from '../hooks/useTalentLayerClient';
import { IToken } from '../types';
import { formatUnits } from 'viem';

const useRateFromTokenAmount = async (amount: string, address: string) => {
  // const [token, setToken] = useState<IToken>();
  const talentLayerClient = useTalentLayerClient();

  // useEffect(() => {
  // Fetch the number of token by token address
  // const fetchDecimals = async () => {
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
      const parsedValue = parseFloat(amount);
      if (isNaN(parsedValue)) {
        return 'invalid format';
      }
      const formattedValue = formatUnits(BigInt(parsedValue), data?.data?.tokens[0].decimals);
      return formattedValue;
      // setToken(data?.data?.tokens[0]);
    } catch (error) {
      console.error('Failed to fetch token:', error);
    }
  };

  //   fetchDecimals();
  // }, [address]);

  // if (!token) {
  //   return null;
  // }
// };

export default useRateFromTokenAmount;
