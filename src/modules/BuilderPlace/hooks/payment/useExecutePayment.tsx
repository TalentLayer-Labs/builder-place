import { useContext } from 'react';
import { toast } from 'react-toastify';
import { Address } from 'viem';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import TransactionToast from '../../../../components/TransactionToast';
import { delegatePayment } from '../../../../components/request';
import TalentLayerContext from '../../../../context/talentLayer';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import { showErrorTransactionToast } from '../../../../utils/toast';
import BuilderPlaceContext from '../../context/BuilderPlaceContext';

const useExecutePayment = () => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { address } = useAccount();
  const { canUseBackendDelegate, user: talentLayerUser } = useContext(TalentLayerContext);
  const { builderPlace, isBuilderPlaceCollaborator } = useContext(BuilderPlaceContext);
  const talentLayerClient = useTalentLayerClient();
  const executePayment = async (
    chainId: number,
    userId: string,
    transactionId: string,
    amount: bigint,
    isBuyer: boolean,
    serviceId: string,
  ) => {
    if (!walletClient || !talentLayerClient || !address) {
      throw new Error('Please connect your wallet');
    }

    if (
      // account?.isConnected === true &&
      talentLayerUser?.id &&
      publicClient &&
      talentLayerClient &&
      builderPlace?.owner?.talentLayerId &&
      builderPlace?.talentLayerPlatformId
    ) {
      const usedId = isBuilderPlaceCollaborator
        ? builderPlace.owner.talentLayerId
        : talentLayerUser.id;
      let tx: Address;

      try {
        if (canUseBackendDelegate) {
          /**
           * @dev Sign message to prove ownership of the address
           */
          const signature = await walletClient.signMessage({
            account: address,
            message: `connect with ${address}`,
          });

          const response = await delegatePayment({
            chainId,
            userAddress: address,
            userId: usedId,
            transactionId: parseInt(transactionId, 10),
            amount: amount.toString(),
            isBuyer,
            signature,
          });
          tx = response.data.transaction;
        } else {
          if (isBuyer) {
            tx = await talentLayerClient.escrow.release(serviceId, amount, parseInt(userId));
          } else {
            tx = await talentLayerClient.escrow.reimburse(serviceId, amount, parseInt(userId));
          }
        }

        const message = isBuyer
          ? 'Your payment release is in progress'
          : 'Your payment reimbursement is in progress';

        const receipt = await toast.promise(publicClient.waitForTransactionReceipt({ hash: tx }), {
          pending: {
            render() {
              return <TransactionToast message={message} transactionHash={tx} />;
            },
          },
          success: isBuyer ? 'Payment release validated' : 'Payment reimbursement validated',
          error: 'An error occurred while validating your transaction',
        });
        if (receipt.status !== 'success') {
          throw new Error('Approve Transaction failed');
        }
      } catch (error: any) {
        showErrorTransactionToast(error);
      }
    }
  };
  return { executePayment };
};

export default useExecutePayment;
