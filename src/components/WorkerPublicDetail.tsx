import { User } from '@prisma/client';
import useUserById from '../hooks/useUserById';
import Loading from './Loading';
import Stars from './Stars';

function WorkerPublicDetail({ user }: { user: User }) {
  const talentLayerUser = useUserById(user.talentLayerId);

  if (!talentLayerUser?.id) {
    return null;
  }

  return (
    <div className='max-w-5xl'>
      <div className='w-full'>
        <div className='flex max-w-5xl flex-col justify-center items-center gap-4'>
          <div className='flex  mb-4'>
            <div className='flex flex-col items-center justify-center gap-8'>
              <div className='w-48 h-48 rounded-full overflow-hidden border'>
                <img
                  src={user.picture || talentLayerUser?.description?.image_url}
                  className='object-cover w-full h-full'
                />
              </div>
              <p className='mt-5 text-4xl font-bold '>{user.name || talentLayerUser?.handle}</p>
              <p className='text-2xl text-gray-500 font-bold '>
                {talentLayerUser?.description?.title}
              </p>
            </div>
          </div>
          <div className='mt-5 flex w-full flex-col gap-4 justify-start items-start'>
            <p className='text-xl text-black font-bold'>about</p>
            <p className='text-xl text-gray-500 font-medium '>
              {user.about || talentLayerUser?.description?.about}
            </p>
          </div>
          <div className='mt-5 flex w-full flex-col gap-4 justify-start items-start'>
            <p className='text-xl text-black font-bold'>skills</p>
            <div className='mt-2 flex w-full flex-col lg:flex-row sm:felx-col gap-4 justify-start items-start -ml-1'>
              {talentLayerUser.description?.skills_raw?.split(',').map((skill, index) => (
                <span
                  key={index}
                  className={`${
                    index % 2 === 0 ? 'bg-green-200' : 'bg-pink-200'
                  } text-s rounded-full px-4 py-1 ml-1`}>
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
          <div className='mt-5 flex w-full flex-col gap-4 justify-start items-start'>
            <p className='text-xl text-black font-bold'>reviews</p>
            <Stars
              rating={Number(talentLayerUser.rating)}
              numReviews={talentLayerUser.userStats.numReceivedReviews}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerPublicDetail;
