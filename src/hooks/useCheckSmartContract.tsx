import { ChainIdEnum } from '../modules/BuilderPlace/types';
import { createPublicClient, http } from 'viem';
import { getViemFormattedChain } from '../chains';
import { NetworkEnum } from '../types';
import { erc20ABI, erc721ABI } from 'wagmi';

const useCheckSmartContract = () => {
  const checkSmartContractName = async (
    chainId: ChainIdEnum,
    type: 'NFT' | 'Token',
    address: string,
  ): Promise<{ contractName: string; error: boolean }> => {
    let contractName = '';
    let error = false;
    try {
      const publicClient = createPublicClient({
        //TODO: Uniformiser les chainId
        chain: getViemFormattedChain(chainId as NetworkEnum),
        transport: http(),
      });

      if (type === 'NFT') {
        contractName = await publicClient.readContract({
          address: address as `0x${string}`,
          abi: erc721ABI,
          functionName: 'name',
        });
      } else if (type === 'Token') {
        contractName = await publicClient.readContract({
          address: address as `0x${string}`,
          abi: erc20ABI,
          functionName: 'name',
        });
      }
    } catch (e) {
      // console.log('Error checking contract name', e);
      error = true;
    }
    return { contractName, error };
  };

  return {
    checkSmartContractName,
  };
};

export default useCheckSmartContract;
