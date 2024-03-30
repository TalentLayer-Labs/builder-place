import { useContext } from 'react';
import { useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { delegateReview } from '../../../../components/request';
import TalentLayerContext from '../../../../context/talentLayer';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import UserContext from '../../context/UserContext';
import {
  createMultiStepsTransactionToast,
  showErrorTransactionToast,
  wait,
} from '../../../../utils/toast';
import BuilderPlaceContext from '../../context/BuilderPlaceContext';
import { postToIPFSwithQuickNode } from '../../../../utils/ipfs';
import { IFormValues } from '../../../../components/Form/ReviewForm';

const useRecordReview = () => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { address } = useContext(UserContext);
  const { canUseBackendDelegate, user: talentLayerUser } = useContext(TalentLayerContext);
  const { builderPlace, isBuilderPlaceCollaborator } = useContext(BuilderPlaceContext);
  const talentLayerClient = useTalentLayerClient();
  console.log('canUseBackendDelegate', canUseBackendDelegate);
  const recordReview = async (values: IFormValues, serviceId: string) => {
    if (!walletClient || !talentLayerClient || !address) {
      throw new Error('Please connect your wallet');
    }

    await wait(2);

    if (
      talentLayerUser?.id &&
      publicClient &&
      talentLayerClient &&
      builderPlace?.owner?.talentLayerId &&
      builderPlace?.talentLayerPlatformId
    ) {
      const usedId = isBuilderPlaceCollaborator
        ? builderPlace.owner.talentLayerId
        : talentLayerUser.id;
      console.log('usedId', usedId);

      try {
        if (talentLayerUser && publicClient && walletClient && builderPlace?.owner?.talentLayerId) {
          const cid = await postToIPFSwithQuickNode(
            JSON.stringify({
              content: values.content,
              rating: values.rating,
            }),
          );

          let tx;
          if (canUseBackendDelegate) {
            /**
             * @dev Sign message to prove ownership of the address
             */
            const signature = await walletClient.signMessage({
              message: `connect with ${address}`,
              account: address,
            });

            const response = await delegateReview({
              chainId,
              userId: usedId,
              userAddress: address,
              serviceId,
              cid,
              rating: values.rating,
              signature,
            });
            console.log('response', response);
            tx = response.data.transaction;
          } else {
            if (talentLayerClient) {
              const res = await talentLayerClient.review.create(
                {
                  rating: values.rating,
                  content: values.content,
                },
                serviceId,
                isBuilderPlaceCollaborator ? builderPlace.owner?.talentLayerId : talentLayerUser.id,
              );
              tx = res.tx;
            }
          }

          await createMultiStepsTransactionToast(
            chainId,
            {
              pending: 'Creating your review...',
              success: 'Congrats! Your review has been posted',
              error: 'An error occurred while creating your review',
            },
            publicClient,
            tx,
            'review',
            cid,
          );
        }
      } catch (error: any) {
        showErrorTransactionToast(error);
      }
      // finally {
      //     if (canUseBackendDelegate) await refreshWorkerProfile();
      //   }
    }
  };
  return { recordReview };
};

export default useRecordReview;
