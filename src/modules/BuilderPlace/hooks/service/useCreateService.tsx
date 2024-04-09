import { useContext } from 'react';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { ICreateServiceFormValues } from '../../../../components/Form/ServiceForm';
import { delegateCreateService } from '../../../../components/request';
import TalentLayerContext from '../../../../context/talentLayer';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import { IToken } from '../../../../types';
import { parseRateAmount } from '../../../../utils/currency';
import { createMultiStepsTransactionToast } from '../../../../utils/toast';
import BuilderPlaceContext from '../../context/BuilderPlaceContext';
import UserContext from '../../context/UserContext';

const useCreateService = () => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { user } = useContext(UserContext);
  const { address } = useAccount();
  const { canUseBackendDelegate } = useContext(TalentLayerContext);
  const { builderPlace, isBuilderPlaceCollaborator } = useContext(BuilderPlaceContext);
  const talentLayerClient = useTalentLayerClient();
  const createNewService = async (values: ICreateServiceFormValues, token: IToken) => {
    if (!walletClient || !talentLayerClient || !address) {
      throw new Error('Please connect your wallet');
    }

    console.log('canUseBackendDelegate', canUseBackendDelegate);

    if (
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
          cid = await talentLayerClient.service.updloadServiceDataToIpfs(serviceDetails);

          let response;

          response = await delegateCreateService({
            serviceDetails,
            chainId,
            userId: usedId,
            userAddress: address,
            cid,
            platformId: builderPlace.talentLayerPlatformId,
            signature,
          });

          tx = response.data.transaction;
        } else {
          let serviceResponse;
          /**
           * @dev: Create a service on behalf of Platform owner
           */
          serviceResponse = await talentLayerClient.service.create(
            {
              title: values.title,
              about: values.about,
              keywords: values.keywords,
              rateToken: values.rateToken,
              rateAmount: parsedRateAmountString,
            },
            usedId,
            parseInt(builderPlace.talentLayerPlatformId, 10),
          );
          cid = serviceResponse.cid;
          tx = serviceResponse.tx;
        }

        return await createMultiStepsTransactionToast(
          chainId,
          {
            pending: 'Transaction processing...',
            success: 'Congrats! Your open-source post has been created',
            error: 'An error occurred while creating your post',
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
  return { createNewService };
};

export default useCreateService;
