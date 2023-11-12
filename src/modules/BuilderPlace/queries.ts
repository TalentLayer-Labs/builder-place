import { getBuilderPlaceByDomain } from './actions';
import { getUserById } from '../../queries/users';

// Used inside getServerSideProps
export const getBuilderPlace = async (domain: string) => {
  console.log('serverProps', domain);
  const builderPlace = await getBuilderPlaceByDomain(domain);

  if (!builderPlace) {
    throw new Error(`Builder Place not found for domain ${domain}`);
  }
  const userResponse = await getUserById(
    Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID),
    builderPlace.ownerTalentLayerId,
  );

  if (!userResponse?.data?.data?.user) {
    throw new Error(`Current user not found for id ${builderPlace.ownerTalentLayerId}`);
  }

  const serializedBuilderPlace = JSON.parse(JSON.stringify(builderPlace));
  const serializedConnectedUser = JSON.parse(JSON.stringify(userResponse.data.data.user));

  console.log({
    serializedBuilderPlace,
    serializedConnectedUser,
  });
  return {
    props: {
      builderPlace: serializedBuilderPlace,
      connectedUser: serializedConnectedUser,
    },
  };
};
