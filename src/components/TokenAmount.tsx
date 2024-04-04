import React, { useState, useEffect } from 'react';
import useTalentLayerClient from '../hooks/useTalentLayerClient';
import { renderTokenAmount } from '../utils/conversion';
import { IToken } from '../types';
import useAllowedTokens from '../hooks/useAllowedTokens';

interface TokenAmountProps {
  amount: string;
  address: string;
}

const TokenAmount: React.FC<TokenAmountProps> = ({ amount, address }) => {
  const [token, setToken] = useState<IToken>();
  const allowedTokenList = useAllowedTokens();

  useEffect(() => {
    if (!allowedTokenList.length) return;

    const token = allowedTokenList.find(token => token.address === address);
    setToken(token);
  }, [allowedTokenList]);

  if (!token) {
    return null; // Return null while loading
  }

  return <span>{renderTokenAmount(token, amount)}</span>;
};

export default TokenAmount;
