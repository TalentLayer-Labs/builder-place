import { GetServerSidePropsContext } from 'next';
import Layout from '../../../../components/EditProfile/Layout';
import EmailPreferencesForm from '../../../../components/Form/EmailPreferencesForm';
import { sharedGetServerSideProps } from '../../../../utils/sharedGetServerSideProps';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

function EditPrivacy() {
  return (
    <Layout>
      <EmailPreferencesForm />
    </Layout>
  );
}

export default EditPrivacy;
