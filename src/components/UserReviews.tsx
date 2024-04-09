'use client';

import useUserById from '../hooks/useUserById';
import Stars from './Stars';

export default function UserReviews({ talentLayerId }: { talentLayerId: string }) {
  const talentLayerUser = useUserById(talentLayerId);

  if (!talentLayerUser?.id) {
    return null;
  }

  return (
    <div className='mt-5 flex w-full flex-col gap-4 justify-start items-start'>
      <p className='text-xl text-black font-bold'>reviews</p>
      <Stars
        rating={Number(talentLayerUser.rating)}
        numReviews={talentLayerUser.userStats.numReceivedReviews}
      />
    </div>
  );
}
