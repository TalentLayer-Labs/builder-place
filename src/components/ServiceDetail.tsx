import Link from 'next/link';
import { useContext, useState } from 'react';
import TalentLayerContext from '../context/talentLayer';
import usePaymentsByService from '../hooks/usePaymentsByService';
import useProposalsByService from '../hooks/useProposalsByService';
import useReviewsByService from '../hooks/useReviewsByService';
import ContactButton from '../modules/Messaging/components/ContactButton';
import { IService, ProposalStatusEnum, ServiceStatusEnum } from '../types';
import { formatDate } from '../utils/dates';
import CustomMarkdown from './CustomMarkdown';
import PaymentModal from './Modal/PaymentModal';
import ReviewModal from './Modal/ReviewModal';
import ProfileImage from './ProfileImage';
import ProposalItem from './ProposalItem';
import ReviewItem from './ReviewItem';
import ServiceStatus from './ServiceStatus';
import TokenAmount from './TokenAmount';
import ServiceForm from './Form/ServiceForm';
import useUserById from '../hooks/useUserById';
import { XMarkIcon } from '@heroicons/react/24/outline';

function ServiceDetail({ service }: { service: IService }) {
  const { account, user } = useContext(TalentLayerContext);
  const { reviews } = useReviewsByService(service.id);
  const proposals = useProposalsByService(service.id);
  const payments = usePaymentsByService(service.id);
  const serviceOwner = useUserById(service.buyer.id);
  const [editMode, setEditMode] = useState(false);

  const isBuyer = user?.id === service.buyer.id;
  const isSeller = user?.id === service.seller?.id;
  const isDelegate = !!user?.address && !!serviceOwner?.delegates?.includes(user.address);
  const isBuyerOrDelegate = isBuyer || isDelegate;
  const hasReviewed = !!reviews.find(review => {
    return review.to.id !== user?.id;
  });
  const userProposal = proposals.find(proposal => {
    return proposal.seller.id === user?.id;
  });

  const validatedProposal = proposals.find(proposal => {
    return proposal.status === ProposalStatusEnum.Validated;
  });

  const closeEditMode = () => {
    setEditMode(false);
  };

  return (
    <>
      {!editMode ? (
        <div className='flex flex-row gap-2 rounded-xl p-4 border border-info text-base-content bg-base-100'>
          <div className='flex flex-col items-top justify-between gap-4 w-full'>
            <div className={`flex flex-col ${!editMode && 'justify-start items-start'} gap-4`}>
              <div className='flex items-center justify-between w-full relative'>
                <>
                  <div className='flex items-center'>
                    <ProfileImage size={50} url={service?.buyer?.description?.image_url} />
                    <div className='flex flex-col'>
                      <p className='text-base-content font-medium break-all'>
                        {service.description?.title}
                      </p>
                      <p className='text-xs text-base-content opacity-50'>
                        created by {isBuyerOrDelegate ? 'You' : service.buyer.handle} the{' '}
                        {formatDate(Number(service.createdAt) * 1000)}
                      </p>
                    </div>
                  </div>
                  {service.status === ServiceStatusEnum.Opened && isBuyerOrDelegate && !editMode && (
                    <button
                      type='submit'
                      className='px-5 py-2 rounded-xl bg-primary text-primary-content'
                      onClick={() => setEditMode(true)}>
                      Edit
                    </button>
                  )}
                </>

                <span className='absolute right-[-25px] top-[-25px] inline-flex items-center'>
                  <ServiceStatus status={service.status} />
                </span>
              </div>

              <div className=' border-y border-info pt-4 w-full'>
                {service.seller && (
                  <Link
                    className='text-sm text-base-content mt-4'
                    href={`/profiles/${service.seller.id}`}>
                    Work handled by{' '}
                    <span className='text-base-content'>{service.seller.handle}</span>
                  </Link>
                )}
                <div className='markdown-body text-sm text-base-content mt-4'>
                  <CustomMarkdown content={service.description?.about} />
                </div>
                {service.description?.rateToken && service.description?.rateAmount && (
                  <p className='text-sm text-base-content mt-4'>
                    <strong>Budget:</strong>{' '}
                    <TokenAmount
                      amount={service.description.rateAmount}
                      address={service.description.rateToken}
                    />
                  </p>
                )}
                <p className='text-sm text-base-content mt-4'>
                  <strong>Keywords:</strong>{' '}
                  {service.description?.keywords_raw?.split(',').map((keyword, i) => (
                    <span
                      key={i}
                      className='inline-block bg-info rounded-full px-2 py-1 text-xs font-semibold text-info mr-2 mb-2'>
                      {keyword}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            <div className='flex flex-row gap-4 items-center pt-4'>
              {!isBuyerOrDelegate && service.status == ServiceStatusEnum.Opened && (
                <>
                  {!userProposal && (
                    <Link
                      className='text-primary bg-primary hover:opacity-70 px-5 py-2.5 rounded-xl text-md relative'
                      href={
                        account?.isConnected
                          ? `/work/${service.id}/proposal`
                          : `/worker-onboarding?serviceId=${service.id}`
                      }>
                      Create proposal
                    </Link>
                  )}
                  {user && (
                    <ContactButton
                      userAddress={service.buyer?.address}
                      userHandle={service.buyer.handle}
                    />
                  )}
                </>
              )}
              {(isBuyerOrDelegate || isSeller) &&
                service.status === ServiceStatusEnum.Finished &&
                !hasReviewed && (
                  <ReviewModal
                    service={service}
                    userToReview={isBuyerOrDelegate ? service.seller : service.buyer}
                  />
                )}
              {account &&
                (isBuyerOrDelegate || isSeller) &&
                service.status !== ServiceStatusEnum.Opened && (
                  <PaymentModal service={service} payments={payments} isBuyer={isBuyer} />
                )}
            </div>
          </div>
        </div>
      ) : (
        <div className='relative'>
          <ServiceForm existingService={service} callback={closeEditMode} />
          <button
            onClick={() => setEditMode(false)}
            className='absolute top-[-10px] right-[-10px] z-10 rounded-full p-1 text-lg text-primary-content shadow-lg ml-2 cursor-pointer bg-info text-center'>
            <XMarkIcon width={18} />
          </button>
        </div>
      )}
      {(isBuyerOrDelegate || isSeller) && reviews.length > 0 && (
        <div className='flex flex-col gap-4 mt-4'>
          <p className='text-base-content font-bold'>Reviews:</p>
          {reviews.map((review, index) => (
            <ReviewItem review={review} key={index} />
          ))}
        </div>
      )}

      {userProposal && (
        <div className='flex flex-col gap-4 mt-4'>
          <p className='text-base-content font-bold'>Your proposal:</p>
          <ProposalItem proposal={userProposal} />
        </div>
      )}

      {isBuyerOrDelegate && (
        <>
          {proposals.length > 0 ? (
            <>
              <p className='text-base-content font-bold mt-12 mb-4'>
                {service.status === ServiceStatusEnum.Opened
                  ? 'Review proposals'
                  : 'Validated proposal'}
                :
              </p>
              <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                {validatedProposal ? (
                  <ProposalItem proposal={validatedProposal} />
                ) : (
                  proposals.map((proposal, i) => {
                    return (
                      <div key={i}>
                        {(service.status === ServiceStatusEnum.Opened ||
                          proposal.status === ProposalStatusEnum.Validated) && (
                          <ProposalItem proposal={proposal} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className='flex p-4 text-sm text-info bg-info rounded-xl mt-4' role='alert'>
              <svg
                className='flex-shrink-0 inline w-5 h-5 mr-3'
                fill='currentColor'
                viewBox='0 0 20 20'
                xmlns='http://www.w3.org/2000/svg'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'></path>
              </svg>
              <span className='sr-only'>Info</span>
              <div>
                <span className='font-medium'>no proposal has been submitted yet</span>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default ServiceDetail;
