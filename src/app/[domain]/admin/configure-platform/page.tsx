import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useContext } from 'react';
import 'react-color-palette/css';
import AccessDenied from '../../../../components/AccessDenied';
import AdminSettingsLayout from '../../../../components/AdminSettingsLayout';
import ConfigurePlatformForm from '../../../../components/ConfigurePlatform/ConfigurePlatformForm';
import Loading from '../../../../components/Loading';
import BuilderPlaceContext from '../../../../modules/BuilderPlace/context/BuilderPlaceContext';
import UserContext from '../../../../modules/BuilderPlace/context/UserContext';
import { sharedGetServerSideProps } from '../../../../utils/sharedGetServerSideProps';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

function ConfigurePlatform(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { loading } = useContext(UserContext);
  const { isBuilderPlaceCollaborator, builderPlace } = useContext(BuilderPlaceContext);

  //TODO a delete ?
  if (loading) {
    console.log('no data');
    return (
      <div className='flex flex-col mt-5 pb-8'>
        <Loading />
      </div>
    );
  }

  if (!isBuilderPlaceCollaborator) {
    return <AccessDenied />;
  }

  return (
    <>
      <AdminSettingsLayout title={'configure your place'} route={'/admin'}>
        <ConfigurePlatformForm />
      </AdminSettingsLayout>
    </>
  );
}

export default ConfigurePlatform;
