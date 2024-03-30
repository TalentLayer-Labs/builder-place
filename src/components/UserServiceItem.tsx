import Link from 'next/link';
import { useChainId } from '../hooks/useChainId';
import { IService, IUser, ServiceStatusEnum } from '../types';
import { formatDate } from '../utils/dates';
import ProfileImage from './ProfileImage';
import ServiceStatus from './ServiceStatus';
import TokenAmount from './TokenAmount';

function UserServiceItem({
  talentLayerUser,
  service,
}: {
  talentLayerUser: IUser;
  service: IService;
}) {
  const isBuyer = talentLayerUser?.id === service.buyer.id;

  return (
    <div className='flex flex-row gap-2 rounded-xl p-4 border border-info text-base-content bg-base-100'>
      <div className='flex flex-col items-top justify-between gap-4 w-full'>
        <div className='flex flex-col justify-start items-start gap-4 relative'>
          <div className='flex items-center justify-start'>
            <ProfileImage size={50} url={service?.buyer?.description?.image_url} />
            <div className='flex flex-col'>
              <p className='text-base-content font-medium break-all'>
                {service.description?.title}
              </p>
              <p className='text-xs text-base-content opacity-50'>
                created by {service.buyer.handle} the {formatDate(Number(service.createdAt) * 1000)}
              </p>
            </div>
            <span className='absolute right-0 inline-flex items-center'>
              <ServiceStatus status={service.status} />
            </span>
          </div>

          <div className=' border-t border-info pt-4'>
            <div>
              {service.description?.keywords_raw?.split(',').map((keyword, i) => (
                <span
                  key={i}
                  className='inline-block bg-info rounded-full px-2 py-1 text-xs font-semibold text-base-content mr-2 mb-2'>
                  {keyword}
                </span>
              ))}
            </div>
            <p className='text-sm text-base-content  line-clamp-1 mt-4'>
              <strong>About:</strong> {service.description?.about}
            </p>
          </div>
        </div>

        <div className='flex flex-row gap-4 justify-between items-center border-t border-info pt-4'>
          {service.description?.rateToken && service.description?.rateAmount && (
            <p className='text-base-content font-bold line-clamp-1 max-w-[100px]'>
              <TokenAmount
                amount={service.description.rateAmount}
                address={service.description.rateToken}
              />
            </p>
          )}
          <Link
            className='text-primary bg-primary hover:opacity-70 px-5 py-2.5 rounded-xl text-md relative'
            href={`/work/${service.id}`}>
            show details
            {isBuyer && service.status == ServiceStatusEnum.Opened && (
              <div className='inline-flex absolute -top-2 -right-2 justify-center items-center w-6 h-6 text-xs font-bold text-base-content bg-base-200 rounded-full border-2 border-white'>
                {service.proposals.length}
              </div>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserServiceItem;
