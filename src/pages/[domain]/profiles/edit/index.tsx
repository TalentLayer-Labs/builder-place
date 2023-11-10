import ProfileForm from '../../../../components/Form/ProfileForm';
import Layout from '../../../../components/EditProfile/Layout';
import { getBuilderPlace } from '../../../../modules/BuilderPlace/queries';
import { useContext } from 'react';
import TalentLayerContext from '../../../../context/talentLayer';
import BuilderPlaceContext from '../../../../modules/BuilderPlace/context/BuilderPlaceContext';
import AccessDenied from '../../../../components/AccessDenied';

export async function getServerSideProps({ params }: any) {
  return await getBuilderPlace(params.domain);
}

function EditProfile() {
  const talentLayerContext = useContext(TalentLayerContext);
  const { isBuilderPlaceOwner } = useContext(BuilderPlaceContext);

  if (!isBuilderPlaceOwner) {
    return <AccessDenied />;
  }

  return (
    <Layout>
      <ProfileForm context={talentLayerContext} />
    </Layout>
  );
}

export default EditProfile;
