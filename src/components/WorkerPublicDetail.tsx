import { useContext } from 'react';
import TalentLayerContext from '../context/talentLayer';
import useUserById from '../hooks/useUserById';
import PohModule from '../modules/Poh/PohModule';
import { IUser } from '../types';
import Loading from './Loading';
import Stars from './Stars';
import DelegateModal from './Modal/DelegateModal';
import Link from 'next/link';

function WorkerPublicDetail({ user }: { user: IUser }) {
  const { user: currentUser } = useContext(TalentLayerContext);
  const userDescription = user?.id ? useUserById(user?.id)?.description : null;

  if (!user?.id) {
    return <Loading />;
  }

  return (
    <div className='max-w-5xl'>
      <div className='w-full'>
        <div className='flex max-w-5xl flex-col justify-center items-center gap-4'>
          <div className='flex  mb-4'>
            <div className='flex flex-col items-center justify-center items-center gap-8'>
              <div className='w-48 h-48 rounded-full overflow-hidden border'>
                <img src={user?.description?.image_url} className='object-cover w-full h-full' />
              </div>
              <p className='mt-5 text-4xl font-bold '>{user?.handle}</p>
              <p className='text-2xl text-gray-500 font-bold '>{user?.description?.title}</p>
            </div>
          </div>
          <div className='flex w-full flex-col gap-4 justify-start items-start'>
            <p className='text-xl text-black font-bold'>About</p>
            <p className='text-xl text-gray-500 font-medium '>{user?.description?.about}</p>
          </div>
        </div>

        {/* <Stars rating={Number(user.rating)} numReviews={user.userStats.numReceivedReviews} /> */}
      </div>
      {/* <div className=' border-t border-info pt-2 w-full'>
        <p className='text-sm text-base-content mt-4'>
          <strong>Skills:</strong>

          {userDescription?.skills_raw?.split(',').map((skill, index) => (
            <span key={index} className='text-xs border border-base-300 rounded-md px-2 py-1 ml-2'>
              {skill.trim()}
            </span>
          ))}
        </p>
      </div> */}

      {currentUser?.id === user.id && process.env.NEXT_PUBLIC_ACTIVE_DELEGATE === 'true' && (
        <div className=' border-t border-info pt-4 w-full mt-4'>
          <div className='flex flex-row gap-4 justify-end items-center'>
            <DelegateModal />
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkerPublicDetail;
