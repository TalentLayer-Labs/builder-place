import { JobConditionsChainIdEnum } from '../modules/BuilderPlace/types';
import { createPublicClient, http } from 'viem';
import { erc20ABI, erc721ABI } from 'wagmi';
import { useState } from 'react';
import { getViemFormattedChainForJobConditions } from '../utils/jobPostConditions';

const useGetContractData = () => {
  const [nftSubmitting, setNftSubmitting] = useState<boolean>(false);
  const [tokenSubmitting, setTokenSubmitting] = useState<boolean>(false);
  const getContractData = async (
    chainId: JobConditionsChainIdEnum,
    type: 'NFT' | 'Token',
    address: string,
  ): Promise<{
    contractName: string;
    tokenSign: string;
    decimals: number;
    error: boolean;
    errorMessage?: string;
  }> => {
    let contractName = '';
    let tokenSign = '';
    let decimals = 0;
    let error = false;
    let errorMessage = '';
    try {
      type === 'NFT' ? setNftSubmitting(true) : setTokenSubmitting(true);

      const publicClient = createPublicClient({
        chain: getViemFormattedChainForJobConditions(chainId),
        transport: http(),
      });

      if (type === 'NFT') {
        contractName = await publicClient.readContract({
          address: address as `0x${string}`,
          abi: erc721ABI,
          functionName: 'name',
        });
        let shouldNotExistDecimals;
        try {
          shouldNotExistDecimals = await publicClient.readContract({
            address: address as `0x${string}`,
            abi: erc20ABI,
            functionName: 'decimals',
          });
        } catch (e) {
          console.log('ERC-721 contract');
        }
        if (shouldNotExistDecimals) {
          errorMessage = 'Not ERC-721 contract';
          throw new Error('Not ERC-721 contract');
        }
      } else if (type === 'Token') {
        contractName = await publicClient.readContract({
          address: address as `0x${string}`,
          abi: erc20ABI,
          functionName: 'name',
        });
        tokenSign = await publicClient.readContract({
          address: address as `0x${string}`,
          abi: erc20ABI,
          functionName: 'symbol',
        });
        try {
          decimals = await publicClient.readContract({
            address: address as `0x${string}`,
            abi: erc20ABI,
            functionName: 'decimals',
          });
        } catch (e) {
          errorMessage = 'Not ERC-20 contract';
          throw new Error('Not ERC-20 contract');
        }
      }
    } catch (e) {
      console.log('Error checking contract name', e);
      error = true;
    } finally {
      type === 'NFT' ? setNftSubmitting(false) : setTokenSubmitting(false);
    }
    return { contractName, tokenSign, decimals, error, errorMessage };
  };

  return {
    getContractData,
    nftSubmitting,
    tokenSubmitting,
  };
};

export default useGetContractData;
