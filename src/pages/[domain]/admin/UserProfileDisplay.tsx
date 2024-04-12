import ProfileImage from '../../../components/ProfileImage';
import { User } from '@prisma/client';
import { truncateAddress } from '../../../utils';
import SubmitButton from '../../../components/Form/SubmitButton';

function UserProfileDisplay({ user, isSubmitting }: { user: User; isSubmitting: boolean }) {
  return (
    <div className='mt-5 flex flex-col lg:flex-row justify-between border border-base-300 rounded-lg p-5 lg:p-10'>
      <div className='flex items-center lg:items-start'>
        <ProfileImage size={50} url={user.picture || undefined} />
        <div className='flex flex-col lg:ml-5 ml-3'>
          <span className='text-base-content font-bold'>{user.name}</span>
          <span className='text-base-content text-sm mr-4'>
            {user.address && truncateAddress(user.address)}
          </span>
        </div>
      </div>
      <div className='mt-3 lg:mt-0 flex flex-col lg:flex-row'>
        <SubmitButton isSubmitting={isSubmitting} label='Transfer' />
      </div>
    </div>
  );
}

export default UserProfileDisplay;
