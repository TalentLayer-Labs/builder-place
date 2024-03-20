import { useContext } from 'react';
import { useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { delegateCreateService } from '../../../../components/request';
import TalentLayerContext from '../../../../context/talentLayer';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import UserContext from '../../context/UserContext';
import { createMultiStepsTransactionToast, wait } from '../../../../utils/toast';
import { parseRateAmount } from '../../../../utils/currency';
import { IToken } from '../../../../types';
import BuilderPlaceContext from '../../context/BuilderPlaceContext';
import { ICreateServiceFormValues } from '../../../../components/Form/ServiceForm';

const useCreateService = () => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { address } = useContext(UserContext);
  const { canUseBackendDelegate, user } = useContext(TalentLayerContext);
  const { builderPlace, isBuilderPlaceCollaborator } = useContext(BuilderPlaceContext);
  const talentLayerClient = useTalentLayerClient();
  console.log('canUseBackendDelegate', canUseBackendDelegate);
  const createNewService = async (values: ICreateServiceFormValues, token: IToken) => {
    if (!walletClient || !talentLayerClient || !address) {
      throw new Error('Please connect your wallet');
    }

    await wait(2);

    if (
      // account?.isConnected === true &&
      user?.id &&
      publicClient &&
      talentLayerClient &&
      builderPlace?.owner?.talentLayerId &&
      builderPlace?.talentLayerPlatformId
    ) {
      const usedId = isBuilderPlaceCollaborator ? builderPlace.owner.talentLayerId : user.id;
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
          await wait(2);

          /**
           * @dev Sign message to prove ownership of the address
           */
          const signature = await walletClient.signMessage({
            account: address,
            message: `connect with ${address}`,
          });

          cid = await talentLayerClient.service.updloadServiceDataToIpfs({
            title: values.title,
            about: values.about,
            keywords: values.keywords,
            rateToken: values.rateToken,
            rateAmount: parsedRateAmountString,
          });

          let response;

          response = await delegateCreateService({
            chainId,
            userId: usedId,
            userAddress: address,
            cid,
            platformId: builderPlace.talentLayerPlatformId,
            signature,
          });

          tx = response.data.transaction;
        } else {
          //TODO Good
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
            parseInt(process.env.NEXT_PUBLIC_PLATFORM_ID as string),
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