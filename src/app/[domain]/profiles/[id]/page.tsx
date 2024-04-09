import { Metadata } from 'next';
import NotFound from '../../../../components/NotFound';
import UserServices from '../../../../components/UserServices';
import WorkerPublicDetail from '../../../../components/WorkerPublicDetail';
import { getUserByTalentLayerId } from '../../../../modules/BuilderPlace/actions/user';
import LensModule from '../../../../modules/Lens/LensModule';
import { ServiceStatusEnum } from '../../../../types';

async function getProfile(id: string) {
  return await getUserByTalentLayerId(id);
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata | null> {
  const user = await getProfile(params.id);

  if (!user) {
    return null;
  }

  return {
    title: `Profile | ${user.name}`,
    description: `onChain work profile on BuilderPlace`,
  };
}

async function Profile({ params }: { params: { id: string } }) {
  const user = await getProfile(params.id);

  if (!user) {
    return <NotFound />;
  }

  return (
    <div className='mx-auto text-base-content'>
      <div className='mb-6'>
        <WorkerPublicDetail user={user} />
      </div>
      <div className='mb-6'>
        <UserServices
          userId={user.talentLayerId}
          type='seller'
          status={ServiceStatusEnum.Finished}
        />
      </div>
      <div className='mb-6'>
        <LensModule address={user.address} />
      </div>
    </div>
  );
}

export default Profile;
