import { getBuilderPlace } from '../../../modules/BuilderPlace/queries';
import ProfileForm from '../../../components/Form/ProfileForm';
import BuilderPlaceContext from '../../../modules/BuilderPlace/context/BuilderPlaceContext';
import { useContext } from 'react';

export async function getServerSideProps({ params }: any) {
  return await getBuilderPlace(params.domain);
}

export default function HirerProfile() {
  const context = useContext(BuilderPlaceContext);
  return (
    <>
      <h1>Edit your profile</h1>
      <ProfileForm context={context} isBuilderPlaceOwner={context.isBuilderPlaceOwner} />
    </>
  );
}
