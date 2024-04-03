import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import Loading from '../../../components/Loading';
import UserServices from '../../../components/UserServices';
import WorkerPublicDetail from '../../../components/WorkerPublicDetail';
import useUserById from '../../../hooks/useUserById';
import LensModule from '../../../modules/Lens/LensModule';
import { sharedGetServerSideProps } from '../../../utils/sharedGetServerSideProps';
import NotFound from '../../../components/NotFound';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

function Profile() {
  const router = useRouter();
  const { id } = router.query;
  const { user: talentLayerUser, loading } = useUserById(id as string);

  if (loading) {
    return <Loading />;
  }

  if (!talentLayerUser) {
    return <NotFound />;
  }

  return (
    <div className='mx-auto text-base-content'>
      {talentLayerUser && (
        <>
          <div className='mb-6'>
            <WorkerPublicDetail talentLayerUser={talentLayerUser} />
          </div>
          <div className='mb-6'>
            <UserServices userId={talentLayerUser.id} type='seller' />
          </div>
          <div className='mb-6'>
            <LensModule address={talentLayerUser.address} />
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
