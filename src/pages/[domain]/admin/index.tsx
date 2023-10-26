import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Link from 'next/link';

import { getBuilderPlace } from '../../../modules/BuilderPlace/queries';

export async function getServerSideProps({ params }: any) {
  return await getBuilderPlace(params.domain);
}

export default function AdminDashboard(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { space, setSpaceContext } = useContext(SpaceContext);

  useEffect(() => setSpaceContext(props.space), []);

  return (
    <div>
      <h1 style={{ backgroundColor: `${space?.pallete.primary}` }}>Admin</h1>
      <Link href='/admin/custom-domain'>Go to domain settings</Link>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const domain = params?.domain as string;
  let found = false;
  let space = null;

  try {
    space = await getSpaceByDomain(domain);
    found = !space?.error;
  } catch (error) {
    console.error('An error occurred:', error);
  }

  const serializedSpace = JSON.parse(JSON.stringify(space));

  return {
    props: {
      space: serializedSpace,
      found,
    },
  };
};
