import { useContext } from 'react';
import TalentLayerContext from '../context/talentLayer';
import UserContext from '../modules/BuilderPlace/context/UserContext';
import Loading from './Loading';
import ProfileImage from './ProfileImage';
import Stars from './Stars';

function UserDetail() {
  const { user } = useContext(UserContext);
  const { user: talentLayerUser } = useContext(TalentLayerContext);

  if (!user?.id) {
    return <Loading />;
  }

  return (
    <div className='rounded-xl p-4 border border-info text-base-content bg-base-100'>
      <div className='w-full'>
        <div className='flex flex-col justify-start items-start gap-4'>
          <div className='flex items-center justify-start mb-4'>
            <ProfileImage size={50} url={user.picture} />
            <div className='flex flex-col'>
              <p className='text-base-content font-medium break-all'>{user.name}</p>
            </div>
          </div>
        </div>
        {talentLayerUser && (
          <Stars
            rating={Number(talentLayerUser.rating)}
            numReviews={talentLayerUser.userStats.numReceivedReviews}
          />
        )}
      </div>
    </div>
  );
}

export default UserDetail;
