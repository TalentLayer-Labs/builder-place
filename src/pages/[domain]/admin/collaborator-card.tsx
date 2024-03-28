import ProfileImage from '../../../components/ProfileImage';
import { truncateAddress } from '../../../utils';
import { toggleDelegation } from '../../../contracts/toggleDelegation';
import { User } from '.prisma/client';
import { PublicClient } from 'wagmi';
import { GetWalletClientResult } from '@wagmi/core';

interface ICollaboratorCardProps {
  collaborator: User;
  chainId: number;
  userId: string;
  config: any;
  publicClient: PublicClient;
  walletClient: GetWalletClientResult | undefined;
  delegates?: string[];
  onRemove: (address: string) => void;
}

const CollaboratorCard = ({
  collaborator,
  userId,
  config,
  delegates,
  publicClient,
  walletClient,
  onRemove,
  chainId,
}: ICollaboratorCardProps) => {
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
        <button
          type='button'
          className='mb-2 lg:mb-0 lg:mr-2 px-5 py-2 rounded-xl bg-red-500 font-bold text-sm text-white'
          onClick={() => collaborator.address && onRemove(collaborator.address)}>
          Delete
        </button>
        {collaborator?.address && !delegates?.includes(collaborator.address.toLowerCase()) && (
          <button
            type='button'
            className='px-5 py-2 rounded-xl bg-green-500 font-bold text-sm text-white'
            onClick={async () => {
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
            }}>
            Grant Access
          </button>
        )}
      </div>
    </div>
  );
};

export default CollaboratorCard;
