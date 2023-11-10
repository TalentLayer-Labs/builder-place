import ProfileForm from '../../../../components/Form/ProfileForm';
import Layout from '../../../../components/EditProfile/Layout';
import { getBuilderPlace } from '../../../../modules/BuilderPlace/queries';
import BuilderPlaceContext from '../../../../modules/BuilderPlace/context/BuilderPlaceContext';
import React, { useContext } from 'react';
import AccessDenied from '../../../../components/AccessDenied';

export async function getServerSideProps({ params }: any) {
  return await getBuilderPlace(params.domain);
}

function EditProfile() {
  const { isBuilderPlaceOwner } = useContext(BuilderPlaceContext);

  if (!isBuilderPlaceOwner) {
    return <AccessDenied />;
  }

  return (
    <Layout>
      <ProfileForm />
    </Layout>
  );
}

export default EditProfile;
