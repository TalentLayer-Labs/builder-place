import { useContext } from 'react';
import { useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { delegatePayment, delegateReleaseOrReimburse } from '../../../../components/request';
import TalentLayerContext from '../../../../context/talentLayer';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import UserContext from '../../context/UserContext';
import { showErrorTransactionToast, wait } from '../../../../utils/toast';
import BuilderPlaceContext from '../../context/BuilderPlaceContext';
import { Address } from 'viem';
import { toast } from 'react-toastify';
import TransactionToast from '../../../../components/TransactionToast';

const useExecutePayment = () => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { address } = useContext(UserContext);
  const { canUseBackendDelegate, user } = useContext(TalentLayerContext);
  const { builderPlace, isBuilderPlaceCollaborator } = useContext(BuilderPlaceContext);
  const talentLayerClient = useTalentLayerClient();
  const executePayment = async (
    chainId: number,
    userAddress: string,
    userId: string,
    transactionId: string,
    amount: bigint,
    isBuyer: boolean,
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
      const usedId = isBuilderPlaceCollaborator ? builderPlace.owner.talentLayerId : user.id;
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
      // finally {
      //   if (canUseBackendDelegate) await refreshWorkerProfile();
      // }
    }
  };
  return { executePayment };
};

export default useExecutePayment;
