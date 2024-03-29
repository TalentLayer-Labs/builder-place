import Link from 'next/link';
import { useContext } from 'react';
import useServiceById from '../hooks/useServiceById';
import UserContext from '../modules/BuilderPlace/context/UserContext';
import { IProposal, ProposalStatusEnum } from '../types';
import { renderTokenAmount } from '../utils/conversion';
import { formatDate } from '../utils/dates';
import ProfileImage from './ProfileImage';

function UserProposalItem({ proposal }: { proposal: IProposal }) {
  const { user } = useContext(UserContext);
  const { service } = useServiceById(proposal.service.id);

  if (!service) {
    return null;
  }

  const isBuyer = user?.talentLayerId === proposal.service.buyer.id;

  return (
    <div className='flex flex-row gap-2 rounded-xl p-4 border border-info text-base-content bg-base-100'>
      <div className='flex flex-col items-top justify-between gap-4 w-full'>
        <div className='flex flex-col justify-start items-start gap-4'>
          <div className='flex items-center justify-start w-full  relative'>
            <ProfileImage size={50} url={proposal.service.buyer.description?.image_url} />
            <div className='flex flex-col'>
              <p className='text-base-content font-medium break-all'>
                {service.description?.title}
              </p>
              <p className='text-xs text-base-content opacity-50'>
                Work created by {proposal.service.buyer.handle} the{' '}
                {formatDate(Number(proposal.service.createdAt) * 1000)}
              </p>
            </div>

            <span className='absolute right-[-25px] top-[-25px] inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-800'>
              {proposal.status}
            </span>
          </div>

          <div className=' border-t border-info pt-4'>
            <p className='text-sm text-base-content mt-4'>
              <strong>Proposal:</strong> created by {proposal.seller.handle} the{' '}
              {formatDate(Number(proposal.createdAt) * 1000)}
            </p>
            <p className='text-sm text-base-content mt-4'>
              <strong>Message:</strong> {proposal.description?.title}
            </p>
            <p className='text-sm text-base-content mt-4'>
              <strong>Expiration Date:</strong> {formatDate(Number(proposal.expirationDate) * 1000)}
            </p>
          </div>
        </div>
        <div className='flex flex-row gap-4 justify-between items-center border-t border-info pt-4'>
          <p className='text-base-content font-bold line-clamp-1 flex-1'>
            {renderTokenAmount(proposal.rateToken, proposal.rateAmount)}
          </p>
          <Link
            className='text-primary bg-primary hover:opacity-70 px-5 py-2.5 rounded-xl text-md relative'
            href={`/work/${proposal.service.id}`}>
            Show Post
          </Link>
          {isBuyer && proposal.status === ProposalStatusEnum.Pending && (
            <button className='text-success bg-success hover:bg-info hover:text-base-content px-5 py-2 rounded'>
              Validate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProposalItem;
