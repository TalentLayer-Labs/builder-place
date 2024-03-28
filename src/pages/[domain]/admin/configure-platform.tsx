import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useContext } from 'react';
import 'react-color-palette/css';
import AccessDenied from '../../../components/AccessDenied';
import AdminSettingsLayout from '../../../components/AdminSettingsLayout';
import ConfigurePlatformForm from '../../../components/ConfigurePlatform/ConfigurePlatformForm';
import Loading from '../../../components/Loading';
import TalentLayerContext from '../../../context/talentLayer';
import BuilderPlaceContext from '../../../modules/BuilderPlace/context/BuilderPlaceContext';
import { sharedGetServerSideProps } from '../../../utils/sharedGetServerSideProps';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

function ConfigurePlatform(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { loading } = useContext(TalentLayerContext);
  const { isBuilderPlaceCollaborator, builderPlace } = useContext(BuilderPlaceContext);

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
