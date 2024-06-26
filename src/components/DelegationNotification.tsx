import Notification from './Notification';
import { createMultiStepsTransactionToast, showErrorTransactionToast } from '../utils/toast';
import { useContext, useState } from 'react';
import TalentLayerContext from '../context/talentLayer';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useChainId } from '../hooks/useChainId';
import UserContext from '../modules/BuilderPlace/context/UserContext';

type DelegationNotificationProps = {
  callback?: () => void | Promise<void>;
};

const DelegationNotification = ({ callback }: DelegationNotificationProps) => {
  const account = useAccount();
  const { user: talentLayerUser, refreshData, talentLayerClient } = useContext(TalentLayerContext);
  const { user } = useContext(UserContext);
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const talentLayerClientConfig = talentLayerClient?.getChainConfig(chainId);
  const delegateAddress = process.env.NEXT_PUBLIC_DELEGATE_ADDRESS;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(true);

  const onActivateDelegation = async () => {
    try {
      if (talentLayerClient && walletClient && talentLayerClientConfig) {
        setSubmitting(true);
        const { request } = await publicClient.simulateContract({
          address: talentLayerClientConfig.contracts.talentLayerId.address,
          abi: talentLayerClientConfig.contracts.talentLayerId.abi,
          functionName: 'addDelegate',
          args: [talentLayerUser?.id, delegateAddress],
          account: account?.address,
        });
        const tx = await walletClient.writeContract(request);
        const toastMessages = {
          pending: 'Submitting the delegation...',
          success: 'Congrats! the delegation is active',
          error: 'An error occurred while delegation process',
        };
        await createMultiStepsTransactionToast(
          chainId,
          toastMessages,
          publicClient,
          tx,
          'Delegation',
        );

        setShowNotification(false);

        if (callback) {
          await callback();
        }
      }
    } catch (error) {
      showErrorTransactionToast(error);
    } finally {
      setSubmitting(false);
      await refreshData();
    }
  };

  if (
    !user?.isEmailVerified ||
    !delegateAddress ||
    talentLayerUser?.delegates?.includes(delegateAddress.toLowerCase()) ||
    !showNotification
  ) {
    return null;
  }

  return (
    <div>
      {user?.isEmailVerified &&
        delegateAddress &&
        !talentLayerUser?.delegates?.includes(delegateAddress.toLowerCase()) && (
          <Notification
            title='Activate Gasless Transactions'
            text='You can now activate gassless transactions'
            link=''
            linkText='Activate Gassless'
            color='success'
            imageUrl={user.picture}
            submitting={submitting}
            callback={onActivateDelegation}
          />
        )}
    </div>
  );
};

export default DelegationNotification;
