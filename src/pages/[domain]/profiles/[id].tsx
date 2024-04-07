import { User } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { GetServerSidePropsContext } from 'next';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import Loading from '../../../components/Loading';
import NotFound from '../../../components/NotFound';
import UserServices from '../../../components/UserServices';
import WorkerPublicDetail from '../../../components/WorkerPublicDetail';
import { getUserBy } from '../../../modules/BuilderPlace/request';
import LensModule from '../../../modules/Lens/LensModule';
import { ServiceStatusEnum } from '../../../types';
import { sharedGetServerSideProps } from '../../../utils/sharedGetServerSideProps';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

function Profile() {
  const router = useRouter();
  const { id } = router.query;
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery<User, Error>({
    queryKey: ['user', id],
    queryFn: () => getUserBy({ talentLayerId: id as string }),
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !user) {
    return <NotFound />;
  }

  return (
    <div className='mx-auto text-base-content'>
      <NextSeo
        title={`Profile | ${user.name}`}
        description={`onChain work profile on BuilderPlace`}></NextSeo>
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
