import { useContext } from 'react';
import { useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { delegateCreateProposal } from '../../../../components/request';
import TalentLayerContext from '../../../../context/talentLayer';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import UserContext from '../../context/UserContext';
import { createMultiStepsTransactionToast, wait } from '../../../../utils/toast';
import { parseRateAmount } from '../../../../utils/currency';
import { IToken } from '../../../../types';
import BuilderPlaceContext from '../../context/BuilderPlaceContext';
import { ICreateProposalFormValues } from '../../../../components/Form/ProposalForm';

const useCreateProposal = () => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { address } = useContext(UserContext);
  const { canUseBackendDelegate, user } = useContext(TalentLayerContext);
  const { builderPlace } = useContext(BuilderPlaceContext);
  const talentLayerClient = useTalentLayerClient();
  console.log('canUseBackendDelegate', canUseBackendDelegate);
  const createNewProposal = async (
    values: ICreateProposalFormValues,
    token: IToken,
    serviceId: string,
  ) => {
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
      let tx, cid, proposalResponse;

      try {
        const parsedRateAmount = await parseRateAmount(
          values.rateAmount.toString(),
          values.rateToken,
          token.decimals,
        );
        const now = Math.floor(Date.now() / 1000);
        const convertExpirationDate = now + 60 * 60 * 24 * values.expirationDate;
        const convertExpirationDateString = convertExpirationDate.toString();

        const parsedRateAmountString = parsedRateAmount.toString();

        const proposal = {
          about: values.about,
          video_url: values.video_url,
        };

        cid = await talentLayerClient?.proposal?.upload(proposal);

        if (canUseBackendDelegate) {
          console.log('DELEGATION');
          await wait(2);

          /**
           * @dev Sign message to prove ownership of the address
           */
          const signature = await walletClient.signMessage({
            message: `connect with ${address}`,
            account: address,
          });

          console.log('signature', signature);
          console.log('address', address);

          proposalResponse = await delegateCreateProposal({
            chainId,
            userId: user.id,
            userAddress: address,
            serviceId,
            rateToken: values.rateToken,
            rateAmount: parsedRateAmountString,
            expirationDate: convertExpirationDateString,
            cid,
            platformId: builderPlace.talentLayerPlatformId,
            signature,
          });
          tx = proposalResponse.data.transaction;
        } else {
          proposalResponse = await talentLayerClient?.proposal.create(
            proposal,
            user.id,
            serviceId,
            values.rateToken,
            parsedRateAmountString,
            convertExpirationDateString,
          );

          cid = proposalResponse.cid;
          tx = proposalResponse.tx;
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
          'proposal',
          cid,
        );
      } catch (error: any) {
        console.log('CATCH error', error);
        throw error;
      }
    }
  };
  return { createNewProposal };
};

export default useCreateProposal;
