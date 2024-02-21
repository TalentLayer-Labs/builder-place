import { useContext, useEffect, useState } from 'react';
import { MenuItem, workerNavigation } from '../components/Layout/navigation';
import { PostingCondition } from '../modules/BuilderPlace/types';
import { createPublicClient, http } from 'viem';
import { getViemFormattedChain } from '../chains';
import { NetworkEnum } from '../types';
import { PublicClient } from 'viem/clients/createPublicClient';
import { erc20ABI, erc721ABI } from 'wagmi';
import TalentLayerContext from '../context/talentLayer';

export interface IReturnPostingCondition {
  condition: PostingCondition;
  validated: boolean;
}

const useCheckPostConditions = (
  isPostingAllowed: boolean = false,
  jobPostConditions?: PostingCondition[],
): {
  isLoading: boolean;
  returnedPostingConditions: IReturnPostingCondition[];
} => {
  const { account } = useContext(TalentLayerContext);
  const [isLoading, setIsLoading] = useState(true);
  useState<MenuItem[]>(workerNavigation);
  const [returnedPostingConditions, setReturnedPostingConditions] = useState<
    IReturnPostingCondition[]
  >([]);

  useEffect(() => {
    const checkConditions = async () => {
      try {
        if (!isPostingAllowed) {
          console.log('not allowed');
        } else if (jobPostConditions && jobPostConditions.length > 0) {
          const chainIdSet = new Set<number>();
          jobPostConditions.forEach((condition: PostingCondition) => {
            chainIdSet.add(Number(condition.chainId));
          });
          console.log('jobPostConditions', jobPostConditions);
          console.log('chainIdSet', chainIdSet);
          const clients = generateClients(chainIdSet);
          // console.log('clients', clients);

          let validatesAllConditions = true;
          const returnedPostingCondition: IReturnPostingCondition[] = [];

          for (const condition of jobPostConditions) {
            const abi = condition.type === 'NFT' ? erc721ABI : erc20ABI;
            console.log('clients', clients);
            const client = clients.get(Number(condition.chainId));
            let data: bigint = 0n;

            if (!client) {
              throw new Error('Client not found');
            }
            if (!account?.address) {
              throw new Error('Account not found');
            }

            if (condition.type === 'NFT') {
              data = await client.readContract({
                address: condition.address as `0x${string}`,
                abi: erc721ABI,
                functionName: 'balanceOf',
                // args: ['0x4B3380d3A8C1AF85e47dBC1Fc6C3f4e0c8F78fEa'],
                args: [account.address],
              });
            } else if (condition.type === 'Token') {
              data = await client.readContract({
                address: condition.address as `0x${string}`,
                abi: erc20ABI,
                functionName: 'balanceOf',
                args: [account.address],
              });
            }

            console.log('data', data > 0);

            console.log('to be pushed', {
              condition,
              validated: data > 0,
            });

            if (data < 0) validatesAllConditions = false;
            returnedPostingCondition.push({
              condition,
              validated: data > 0,
            });
          }
          console.log('validatesAllConditions', returnedPostingCondition);
          setReturnedPostingConditions(returnedPostingConditions);
        }
      } catch (error) {
        console.error('Error enriching worker sidebar', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkConditions();
  }, [isPostingAllowed, jobPostConditions]);

  return {
    isLoading,
    returnedPostingConditions,
  };
};

const generateClients = (chainIdSet: Set<number>): Map<number, PublicClient> => {
  const clients = new Map<number, PublicClient>();
  chainIdSet.forEach(chainId => {
    const publicClient = createPublicClient({
      chain: getViemFormattedChain(chainId as NetworkEnum),
      // chain: mainnet,
      transport: http(),
    });
    clients.set(chainId, publicClient);
  });
  return clients;
};

export default useCheckPostConditions;
