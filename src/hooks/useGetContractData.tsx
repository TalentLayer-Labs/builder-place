import { JobConditionsChainIdEnum } from '../modules/BuilderPlace/types';
import { createPublicClient, http } from 'viem';
import { erc20ABI, erc721ABI } from 'wagmi';
import { useState } from 'react';
import { getViemFormattedChainForJobConditions } from '../utils/jobPostConditions';
import { toast } from 'react-toastify';

const useGetContractData = () => {
  const [nftSubmitting, setNftSubmitting] = useState<boolean>(false);
  const [tokenSubmitting, setTokenSubmitting] = useState<boolean>(false);
  const getContractData = async (
    chainId: JobConditionsChainIdEnum,
    type: 'NFT' | 'Token',
    address: string,
  ): Promise<{ contractName: string; tokenSign: string; decimals: number; error: boolean }> => {
    let contractName = '';
    let tokenSign = '';
    let decimals = 0;
    let error = false;
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
          toast.error('No ERC-721 contract detected');
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
          toast.error('No ERC-20 contract detected');
        }
      }
    } catch (e) {
      console.log('Error checking contract name', e);
      error = true;
    } finally {
      type === 'NFT' ? setNftSubmitting(false) : setTokenSubmitting(false);
    }
    return { contractName, tokenSign, decimals, error };
  };

  return {
    getContractData,
    nftSubmitting,
    tokenSubmitting,
  };
};

export default useGetContractData;
