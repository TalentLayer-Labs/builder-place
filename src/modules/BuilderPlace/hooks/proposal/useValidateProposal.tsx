import { useChainId, usePublicClient } from 'wagmi';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import { Address } from 'viem';
import { ZERO_ADDRESS } from '../../../../utils/constant';
import { toast } from 'react-toastify';
import TransactionToast from '../../../../components/TransactionToast';

const useValidateProposal = () => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const talentLayerClient = useTalentLayerClient();

  const metaEvidenceCid = 'QmQ2hcACF6r2Gf8PDxG4NcBdurzRUopwcaYQHNhSah6a8v';

  const validateProposal = async (
    serviceId: string,
    proposalId: string,
    rateToken: Address,
  ): Promise<void> => {
    if (publicClient && talentLayerClient) {
      if (rateToken === ZERO_ADDRESS) {
        const { tx } = await talentLayerClient.escrow.approve(
          serviceId,
          proposalId,
          metaEvidenceCid,
        );
        const receipt1 = await toast.promise(publicClient.waitForTransactionReceipt({ hash: tx }), {
          pending: {
            render() {
              return (
                <TransactionToast message='Your validation is in progress' transactionHash={tx} />
              );
            },
          },
          success: 'Transaction validated',
          error: 'An error occurred while validating your transaction',
        });
        if (receipt1.status !== 'success') {
          throw new Error('Approve Transaction failed');
        }
      } else {
        const { tx: tx2 } = await talentLayerClient.escrow.approve(
          serviceId,
          proposalId,
          metaEvidenceCid,
        );
        const receipt2 = await toast.promise(
          publicClient.waitForTransactionReceipt({ hash: tx2 }),
          {
            pending: {
              render() {
                return (
                  <TransactionToast
                    message='Your validation is in progress'
                    transactionHash={tx2}
                  />
                );
              },
            },
            success: 'Transaction validated',
            error: 'An error occurred while updating your profile',
          },
        );
        if (receipt2.status !== 'success') {
          throw new Error('Transaction failed');
        }
      }
    }
  };
  return { validateProposal };
};

export default useValidateProposal;
