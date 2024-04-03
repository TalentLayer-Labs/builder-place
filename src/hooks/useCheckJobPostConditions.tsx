import { useContext, useEffect, useMemo, useState } from 'react';
import { PostingCondition } from '../modules/BuilderPlace/types';
import { erc20ABI, erc721ABI, useAccount } from 'wagmi';
import TalentLayerContext from '../context/talentLayer';
import { generateClients } from '../utils/jobPostConditions';

export interface IReturnPostingCondition {
  condition: PostingCondition;
  validated: boolean;
}

const useCheckJobPostConditions = (
  isPostingAllowed: boolean = false,
  jobPostConditions?: PostingCondition[],
): {
  isLoading: boolean;
  returnedPostingConditions: IReturnPostingCondition[];
  canPost: boolean;
} => {
  const account = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [canPost, setCanPost] = useState<boolean>(false);
  const [returnedPostingConditions, setReturnedPostingConditions] = useState<
    IReturnPostingCondition[]
  >([]);

  const chainIdSet = useMemo(() => {
    const set = new Set<number>();
    jobPostConditions?.forEach(condition => set.add(Number(condition.chainId)));
    return set;
  }, [jobPostConditions]);

  const clients = useMemo(() => generateClients(chainIdSet), [chainIdSet]);

  useEffect(() => {
    const checkCondition = async (condition: PostingCondition) => {
      const client = clients.get(Number(condition.chainId));
      if (!client || !account?.address) {
        return { condition, validated: false };
      }

      try {
        let data: bigint = 0n;
        let validated = false;

        if (condition.type === 'NFT') {
          data = await client.readContract({
            address: condition.address as `0x${string}`,
            abi: erc721ABI,
            functionName: 'balanceOf',
            args: [account.address],
          });
          validated = data > 0n;
        } else if (condition.type === 'Token') {
          data = await client.readContract({
            address: condition.address as `0x${string}`,
            abi: erc20ABI,
            functionName: 'balanceOf',
            args: [account.address],
          });
          validated = data > BigInt(condition.parsedMinimumAmount);
        }

        return { condition, validated };
      } catch (error) {
        console.error('Error checking posting condition', error);
        return { condition, validated: false };
      }
    };

    const checkConditions = async () => {
      setIsLoading(true);

      if (isPostingAllowed && jobPostConditions?.length === 0) {
        setCanPost(true);
        setIsLoading(false);
        return;
      }

      if (!isPostingAllowed || !jobPostConditions || jobPostConditions.length === 0) {
        setCanPost(false);
        setIsLoading(false);
        return;
      }

      try {
        const results = await Promise.all(jobPostConditions.map(checkCondition));
        const allConditionsMet = results.every(result => result.validated);

        setCanPost(allConditionsMet);
        setReturnedPostingConditions(results);
      } catch (error) {
        console.error('Error checking posting conditions', error);
        setCanPost(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConditions();
  }, [isPostingAllowed, jobPostConditions, account?.address, clients]);

  return {
    isLoading,
    returnedPostingConditions,
    canPost,
  };
};

export default useCheckJobPostConditions;
