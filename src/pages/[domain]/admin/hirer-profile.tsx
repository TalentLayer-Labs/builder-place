import { getBuilderPlace } from '../../../modules/BuilderPlace/queries';
import ProfileForm from '../../../components/Form/ProfileForm';

export async function getServerSideProps({ params }: any) {
  return await getBuilderPlace(params.domain);
}

export default function HirerProfile() {
  return (
    <>
      <h1>Edit your profile</h1>
      <ProfileForm />
    </>
  );
}
