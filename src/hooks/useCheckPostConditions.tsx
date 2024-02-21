import { useContext, useEffect, useMemo, useState } from 'react';
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
  canPost: boolean;
} => {
  const { account } = useContext(TalentLayerContext);
  const [isLoading, setIsLoading] = useState(true);
  const [canPost, setCanPost] = useState<boolean>(false);
  useState<MenuItem[]>(workerNavigation);
  const [returnedPostingConditions, setReturnedPostingConditions] = useState<
    IReturnPostingCondition[]
  >([]);

  const chainIdSet = useMemo(() => {
    const set = new Set<number>();
    jobPostConditions?.forEach(condition => set.add(Number(condition.chainId)));
    return set;
  }, [jobPostConditions]);

  const clients = generateClients(chainIdSet);

  useEffect(() => {
    const checkConditions = async () => {
      try {
        setIsLoading(true);
        if (
          !isPostingAllowed ||
          !jobPostConditions ||
          jobPostConditions.length === 0 ||
          !account?.address
        ) {
          setCanPost(false);
          setIsLoading(false);
          return;
        }

        let allConditionsMet = true;
        const allConditions: IReturnPostingCondition[] = [];

        for (const condition of jobPostConditions) {
          const abi = condition.type === 'NFT' ? erc721ABI : erc20ABI;
          const client = clients.get(Number(condition.chainId));
          let data: bigint = 0n;

          if (!client) {
            console.log('Client not found');
            allConditionsMet = false;
            continue;
            // break;
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

          const validated = data > 0n;
          allConditions.push({ condition, validated });
          if (!validated) allConditionsMet = false;
        }

        setCanPost(allConditionsMet);
        setReturnedPostingConditions(allConditions);
      } catch (error) {
        console.error('Error checking posting conditions', error);
        setCanPost(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkConditions();
  }, [isPostingAllowed, jobPostConditions]);

  return {
    isLoading,
    returnedPostingConditions,
    canPost,
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
