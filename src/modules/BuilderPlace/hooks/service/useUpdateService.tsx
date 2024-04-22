import { useContext } from 'react';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { ICreateServiceFormValues } from '../../../../components/Form/ServiceForm';
import { delegateUpdateService } from '../../../../components/request';
import TalentLayerContext from '../../../../context/talentLayer';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import { IService, IToken } from '../../../../types';
import { parseRateAmount } from '../../../../utils/currency';
import { createMultiStepsTransactionToast } from '../../../../utils/toast';
import BuilderPlaceContext from '../../context/BuilderPlaceContext';
import UserContext from '../../context/UserContext';

const useUpdateService = () => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { user } = useContext(UserContext);
  const { address } = useAccount();
  const { canUseBackendDelegate } = useContext(TalentLayerContext);
  const { builderPlace, isBuilderPlaceCollaborator } = useContext(BuilderPlaceContext);
  const talentLayerClient = useTalentLayerClient();
  console.log('canUseDelegation', canUseBackendDelegate);
  const updateService = async (
    values: ICreateServiceFormValues,
    token: IToken,
    existingService: IService,
  ) => {
    if (!walletClient || !talentLayerClient || !address) {
      throw new Error('Please connect your wallet');
    }

    if (
      // account?.isConnected === true &&
      user?.talentLayerId &&
      publicClient &&
      talentLayerClient &&
      builderPlace?.owner?.talentLayerId &&
      builderPlace?.talentLayerPlatformId
    ) {
      const usedId = isBuilderPlaceCollaborator
        ? builderPlace.owner.talentLayerId
        : user.talentLayerId;
      let tx, cid;

      try {
        const parsedRateAmount = await parseRateAmount(
          values.rateAmount.toString(),
          values.rateToken,
          token.decimals,
        );

        const parsedRateAmountString = parsedRateAmount.toString();

        if (canUseBackendDelegate) {
          console.log('DELEGATION');
          /**
           * @dev Sign message to prove ownership of the address
           */
          const signature = await walletClient.signMessage({
            account: address,
            message: `connect with ${address}`,
          });

          const serviceDetails = {
            title: values.title,
            about: values.about,
            keywords: values.keywords,
            rateToken: values.rateToken,
            rateAmount: parsedRateAmountString,
          };

          let response;

          response = await delegateUpdateService(
            {
              chainId,
              userId: usedId,
              userAddress: address,
              serviceDetails,
              signature,
            },
            existingService.id,
          );

          tx = response.data.transaction;
        } else {
          /**
           * @dev: Update a service on behalf of Platform owner
           */
          const serviceDetails = {
            title: values.title,
            about: values.about,
            keywords: values.keywords,
            rateToken: values.rateToken,
            rateAmount: parsedRateAmountString,
          };

          tx = await talentLayerClient.service.update(
            serviceDetails,
            existingService?.buyer.id,
            parseInt(existingService?.id)
          );
          cid = tx.cid;
        }
        return await createMultiStepsTransactionToast(
          chainId,
          {
            pending: 'Transaction processing...',
            success: 'Congrats! Your open-source post has been updated',
            error: 'An error occurred while updating your post',
          },
          publicClient,
          tx,
          'service',
          cid,
        );
      } catch (error: any) {
        console.log('CATCH error', error);

        throw error;
      }
    }
  };
  return { updateService };
};

export default useUpdateService;
