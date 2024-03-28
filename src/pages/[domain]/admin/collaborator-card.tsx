import ProfileImage from '../../../components/ProfileImage';
import { truncateAddress } from '../../../utils';
import { toggleDelegation } from '../../../contracts/toggleDelegation';
import { User } from '.prisma/client';
import { usePublicClient, useWalletClient } from 'wagmi';
import useRemoveCollaborator from '../../../modules/BuilderPlace/hooks/collaborator/useRemoveCollaborator';
import { showErrorTransactionToast } from '../../../utils/toast';
import { useContext, useState } from 'react';
import TalentLayerContext from '../../../context/talentLayer';
import { useChainId } from '../../../hooks/useChainId';
import { IMutation } from '../../../types';
import AsyncButton from '../../../components/AsyncButton';
import { toast } from 'react-toastify';
import userContext from '../../../modules/BuilderPlace/context/UserContext';

interface ICollaboratorCardProps {
  collaborator: User;
  userId: string;
  config: any;
  delegates?: string[];
}

export interface IRemoveBuilderPlaceCollaborator
  extends IMutation<{
    ownerTalentLayerId: string;
    builderPlaceId: string;
    collaboratorAddress: string;
  }> {}

const CollaboratorCard = ({ collaborator, userId, config, delegates }: ICollaboratorCardProps) => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { refreshData } = useContext(TalentLayerContext);
  const { getUser } = useContext(userContext);
  const [removeCollaboratorSubmitting, setRemoveCollaboratorSubmitting] = useState(false);
  const [addCollaboratorSubmitting, setAddCollaboratorSubmitting] = useState(false);

  const { removeCollaborator } = useRemoveCollaborator();
  const onRemoveCollaborator = async (address: `0x${string}`): Promise<void> => {
    try {
      setRemoveCollaboratorSubmitting(!!address);

      console.log('delegates', delegates);
      console.log('address', address);
      console.log('userId', userId);

      await removeCollaborator(address, delegates, collaborator.id.toString(), userId);
      toast.success('Collaborator removed');
    } catch (error) {
      console.log(error);
      showErrorTransactionToast(error);
    } finally {
      await refreshData();
      await getUser();
      setRemoveCollaboratorSubmitting(false);
    }
  };

  const onAddBackendDelegate = async () => {
    try {
      setAddCollaboratorSubmitting(true);
      if (collaborator.address && walletClient && publicClient) {
        await toggleDelegation(
          chainId,
          userId,
          config,
          collaborator.address,
          publicClient,
          walletClient,
          true,
        );
      }
    } catch (error) {
      console.log(error);
      showErrorTransactionToast(error);
    } finally {
      await refreshData();
      await getUser();
      setAddCollaboratorSubmitting(false);
    }
  };

  return (
    <div className='mt-5 flex flex-col lg:flex-row justify-between border border-base-300 rounded-lg p-5 lg:p-10'>
      <div className='flex items-center lg:items-start'>
        <ProfileImage size={50} url={collaborator.picture || undefined} />
        <div className='flex flex-col lg:ml-5 ml-3'>
          <span className='text-base-content font-bold'>{collaborator.name}</span>
          <span className='text-base-content text-sm mr-4'>
            {collaborator.address && truncateAddress(collaborator.address)}
          </span>
        </div>
      </div>
      <div className='mt-3 lg:mt-0 flex flex-col lg:flex-row'>
        <AsyncButton
          label={'Delete'}
          validateButtonCss={
            'mb-2 lg:mb-0 lg:mr-2 px-5 py-2 rounded-xl bg-red-500 font-bold text-sm text-white'
          }
          loadingButtonCss={
            'mb-2 lg:mb-0 lg:mr-2 px-5 py-2 rounded-xl bg-red-500 opacity-50 font-bold text-sm text-white'
          }
          isSubmitting={removeCollaboratorSubmitting}
          onClick={() => onRemoveCollaborator(collaborator.address as `0x${string}`)}
        />
        {collaborator?.address && !delegates?.includes(collaborator.address.toLowerCase()) && (
          <AsyncButton
            label={'Grant Access'}
            validateButtonCss={'px-5 py-2 rounded-xl bg-green-500 font-bold text-sm text-white'}
            loadingButtonCss={
              'px-5 py-2 rounded-xl bg-green-500 opacity-50 font-bold text-sm text-white'
            }
            isSubmitting={addCollaboratorSubmitting}
            onClick={() => onAddBackendDelegate()}
          />
        )}
      </div>
    </div>
  );
};

export default CollaboratorCard;
