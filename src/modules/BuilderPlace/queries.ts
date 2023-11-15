import { getBuilderPlaceByDomain } from './actions';
import { getUserById } from '../../queries/users';
import { IBuilderPlace } from './types';

// Used inside getServerSideProps
export const getBuilderPlace = async (domain: string) => {
  console.log('serverProps', domain);
  let builderPlace = await getBuilderPlaceByDomain(domain);

  if (!builderPlace) {
    throw new Error(`Builder Place not found for domain ${domain}`);
  }
  if (builderPlace.status === 'Pending') {
    throw new Error(`Builder Place not finalized yet for domain ${domain}`);
  }

  const userResponse = await getUserById(
    Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID),
    builderPlace.ownerTalentLayerId as string,
  );

  if (!userResponse?.data?.data?.user) {
    throw new Error(`Current user not found for id ${builderPlace.ownerTalentLayerId}`);
  }

  // The "_doc" property is a Mongoose thing ===> Need to check to get the right type
  const completeBuilderPlace: IBuilderPlace = {
    ...builderPlace._doc,
    ownerTalentLayerUser: userResponse.data.data.user,
  };

  const serializedBuilderPlace = JSON.parse(JSON.stringify(completeBuilderPlace));

  console.log({
    builderPlace: serializedBuilderPlace,
  });
  return {
    props: {
      builderPlace: serializedBuilderPlace,
    },
  };
};
