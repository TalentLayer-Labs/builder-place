import Link from 'next/link';
import { useChainId } from '../hooks/useChainId';
import { IService } from '../types';
import { renderTokenAmountFromConfig } from '../utils/conversion';
import { formatDate } from '../utils/dates';

function ServiceItem({ service }: { service: IService }) {
  const chainId = useChainId();

  return (
    <div className='flex flex-row gap-2 rounded-xl p-4 border border-info text-base-content bg-base-100'>
      <div className='flex flex-col items-top justify-between gap-4 w-full'>
        <div className='flex flex-col justify-start items-start gap-4'>
          <div className='flex items-center justify-start'>
            <div className='flex flex-col'>
              <p className='font-medium break-all'>{service.description?.title}</p>
            </div>
          </div>
        </div>
        <div className='flex flex-col justify-start items-start gap-4'>
          <div className='flex items-center justify-start'>
            <div className='flex flex-col'>
              <p className='font-medium break-all'>{service.description?.about}</p>
            </div>
          </div>
        </div>

        <div className='flex flex-row justify-between items-center pt-4'>
          <p className='text-xs text-base-content'>
            Created on {formatDate(Number(service.createdAt) * 1000)}
          </p>
          {service.description?.rateToken && service.description?.rateAmount && (
            <p className='text-base-content text-xs max-w-[100px]'>
              {renderTokenAmountFromConfig(
                chainId,
                service.description.rateToken,
                service.description.rateAmount,
              )}
            </p>
          )}
          <span className='flex justify-center items-center'>
            <img
              src={
                service?.buyer?.description?.image_url ||
                `/images/default-avatar-${Number(service.buyer.id) % 9}.jpeg`
              }
              className='w-10 mr-4 rounded-full'
              width={50}
              height={50}
              alt='default avatar'
            />
            <p className='text-xs text-base-content'>{service.buyer.handle}</p>
          </span>

          <Link
            className='text-primary bg-primary hover:opacity-70 px-5 py-2.5 rounded-xl text-md relative'
            href={`/work/${service.id}`}>
            Show details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ServiceItem;
