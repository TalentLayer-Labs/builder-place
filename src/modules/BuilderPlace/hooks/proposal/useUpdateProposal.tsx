import { useContext } from 'react';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { IProposalFormValues } from '../../../../components/Form/ProposalForm';
import { delegateUpdateProposal } from '../../../../components/request';
import TalentLayerContext from '../../../../context/talentLayer';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import { IToken } from '../../../../types';
import { parseRateAmount } from '../../../../utils/currency';
import { createMultiStepsTransactionToast } from '../../../../utils/toast';
import BuilderPlaceContext from '../../context/BuilderPlaceContext';

const useUpdateProposal = () => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { address } = useAccount();
  const { canUseBackendDelegate, user: talentLayerUser } = useContext(TalentLayerContext);
  const { builderPlace } = useContext(BuilderPlaceContext);
  const talentLayerClient = useTalentLayerClient();

  const updateProposal = async (values: IProposalFormValues, token: IToken, serviceId: string) => {
    if (!walletClient || !talentLayerClient || !address) {
      throw new Error('Please connect your wallet');
    }

    console.log('updateProposal', { canUseBackendDelegate });

    if (
      talentLayerUser?.id &&
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
          /**
           * @dev Sign message to prove ownership of the address
           */
          const signature = await walletClient.signMessage({
            message: `connect with ${address}`,
            account: address,
          });

          console.log('signature', signature);
          console.log('address', address);

          proposalResponse = await delegateUpdateProposal(
            {
              chainId,
              userId: talentLayerUser.id,
              userAddress: address,
              rateToken: values.rateToken,
              rateAmount: parsedRateAmountString,
              expirationDate: convertExpirationDateString,
              cid,
              signature,
            },
            serviceId,
          );
          tx = proposalResponse.data.transaction;
        } else {
          proposalResponse = await talentLayerClient?.proposal.update(
            proposal,
            talentLayerUser.id,
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
            success: 'Congrats! Your proposal has been updated',
            error: 'An error occurred while updating your proposal',
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
  return { updateProposal };
};

export default useUpdateProposal;
