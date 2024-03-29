import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import Loading from '../../../components/Loading';
import UserServices from '../../../components/UserServices';
import WorkerPublicDetail from '../../../components/WorkerPublicDetail';
import useUserById from '../../../hooks/useUserById';
import LensModule from '../../../modules/Lens/LensModule';
import { sharedGetServerSideProps } from '../../../utils/sharedGetServerSideProps';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

function Profile() {
  const router = useRouter();
  const { id } = router.query;
  const talentLayerUser = useUserById(id as string);

  if (!talentLayerUser) {
    return <Loading />;
  }

  return (
    <div className='mx-auto text-base-content'>
      {talentLayerUser && (
        <>
          <div className='mb-6'>
            <WorkerPublicDetail talentLayerUser={talentLayerUser} />
          </div>
          <div className='mb-6'>
            <UserServices user={talentLayerUser} type='seller' />
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
