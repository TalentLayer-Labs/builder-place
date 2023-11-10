import Layout from '../../../../components/EditProfile/Layout';
import { getBuilderPlace } from '../../../../modules/BuilderPlace/queries';
import Web3mailPreferencesForm from '../../../../modules/Web3mail/components/Web3mailPreferencesForm';
import { useContext } from 'react';
import BuilderPlaceContext from '../../../../modules/BuilderPlace/context/BuilderPlaceContext';
import AccessDenied from '../../../../components/AccessDenied';

export async function getServerSideProps({ params }: any) {
  return await getBuilderPlace(params.domain);
}

function EditPrivacy() {
  const { isBuilderPlaceOwner } = useContext(BuilderPlaceContext);

  if (!isBuilderPlaceOwner) {
    return <AccessDenied />;
  }

  return (
    <Layout>
      <Web3mailPreferencesForm />
    </Layout>
  );
}

export default EditPrivacy;
