import Link from 'next/link';
import { useContext } from 'react';
import TalentLayerContext from '../context/talentLayer';
import useUserById from '../hooks/useUserById';
import { IUser } from '../types';
import Loading from './Loading';
import Stars from './Stars';
import ProfileImage from './ProfileImage';
import UserContext from '../modules/BuilderPlace/context/UserContext';

function UserItem({ talentLayerUser }: { talentLayerUser: IUser }) {
  const { user } = useContext(UserContext);
  const userDescription = talentLayerUser?.id
    ? useUserById(talentLayerUser?.id)?.description
    : null;

  if (!talentLayerUser?.id) {
    return <Loading />;
  }

  return (
    <div className='flex flex-row gap-2 rounded-xl p-4 border border-info text-base-content bg-base-100'>
      <div className='flex flex-col items-top justify-between w-full'>
        <div className='flex flex-col justify-start items-start gap-4'>
          <div className='flex items-center justify-start mb-4'>
            <ProfileImage size={50} url={talentLayerUser?.description?.image_url} />
            <div className='flex flex-col'>
              <p className='text-base-content font-medium break-all'>{talentLayerUser.handle}</p>
              <p className='text-xs text-base-content opacity-50'>
                {userDescription?.title || '-'}
              </p>
            </div>
          </div>
        </div>
        <Stars
          rating={Number(talentLayerUser.rating)}
          numReviews={talentLayerUser.userStats.numReceivedReviews}
        />

        <div className='flex flex-row gap-4 justify-end items-center'>
          <Link
            className='text-primary bg-primary hover:opacity-70 px-5 py-2.5 rounded-xl text-md relative'
            href={`/profiles/${talentLayerUser.id}`}>
            View profile
          </Link>
          {user?.talentLayerId === talentLayerUser.id && (
            <Link
              className='text-success bg-success hover:bg-info hover:text-base-content px-5 py-2 rounded'
              href={`/profiles/edit`}>
              Edit profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserItem;
