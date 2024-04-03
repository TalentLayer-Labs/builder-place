import { GetServerSidePropsContext } from 'next';
import { sharedGetServerSideProps } from '../../../utils/sharedGetServerSideProps';
import VerifyEmail from '../../../components/email/VerifyEmail';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

const verifyEmail = () => {
  return <VerifyEmail />;
};

export default verifyEmail;
