'use client';

import { useContext } from 'react';
import useServices from '../hooks/useServices';
import { IUser, ServiceStatusEnum } from '../types';
import BuilderPlaceContext from '../modules/BuilderPlace/context/BuilderPlaceContext';
import Notification from './Notification';
import Loading from './Loading';
import ServiceItem from './ServiceItem';
import UserContext from '../modules/BuilderPlace/context/UserContext';

interface IProps {
  userId: string;
  type: 'buyer' | 'seller';
  status?: ServiceStatusEnum;
}

function UserServices({ userId, type, status }: IProps) {
  const { user } = useContext(UserContext);
  const { builderPlace } = useContext(BuilderPlaceContext);

  const { services, loading } = useServices(
    status,
    type == 'buyer' ? userId : undefined,
    type == 'seller' ? userId : undefined,
    undefined,
    undefined,
    builderPlace?.talentLayerPlatformId,
  );

  if (loading) {
    return <Loading />;
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className='pb-4 text-base font-bold break-all'>
        {type == 'buyer' ? 'missions posted' : 'posts applied to'}
      </h2>
      <div className='grid grid-cols-1 gap-4'>
        {services.map((service, i) => {
          return <ServiceItem service={service} key={i} />;
        })}
      </div>

      {services.length === 20 && (
        <a
          href='#'
          className='px-5 py-2  border border-zinc-600 rounded-full text-content hover:text-base hover:bg-base-200'>
          Load More
        </a>
      )}
    </>
  );
}

export default UserServices;
