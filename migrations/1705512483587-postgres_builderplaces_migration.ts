import builderPlaces from '../prisma/mongo-dump/real.builderplaces.json';
import { EntityStatus, PrismaClient } from '.prisma/client';
import {
  getUserByAddress as getTalentLayerUserByAddress,
  getUserById as getTalentLayerUserById,
} from '../src/queries/users';

/**
 * Call to TalentLayer graph to get user data
 */
const getUserTalentLayerDataById = async (userId: string) => {
  const response = await getTalentLayerUserById(
    Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID),
    userId,
  );
  console.log('userId', userId);
  if (response?.data?.data?.user) {
    return response?.data?.data?.user;
  }
};

const getUserTalentLayerDataByAddress = async (userAddress: string) => {
  const response = await getTalentLayerUserByAddress(
    Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID),
    userAddress,
  );
  console.log('userAddress', userAddress);
  if (response?.data?.data?.users.length > 0) {
    return response?.data?.data?.users[0];
  }
};

/* List of actions:
1 - Create BuilderPlace
2 - Graph Call to get TalentLayer Owner, create a User with the TalentLayer infos | Set email to this user
3 - Graph Call to get TalentLayer collaborators, create a User with the TalentLayer infos | do not set any email
* */
export async function up(): Promise<void> {
  const prisma = new PrismaClient();
  // Migrate BuilderPlaces
  for (const item of builderPlaces) {
    if (item.name === 'Developer DAO') continue;
    if (item.status !== 'validated') continue;
    console.log('item', item.name);

    const {
      name,
      baseline,
      subdomain,
      logo,
      cover,
      profilePicture,
      palette,
      about,
      aboutTech,
      ownerTalentLayerId,
      ownerAddress,
      owners,
      preferredWorkTypes,
    } = item;

    let builderPlaceOwner;
    const collaboratorIds = [];

    if (ownerTalentLayerId) {
      console.log('ownerTalentLayerId', ownerTalentLayerId);
      const talentLayerUser = await getUserTalentLayerDataById(ownerTalentLayerId);

      const existingUser = await prisma.user.findFirst({
        where: {
          talentLayerId: ownerTalentLayerId,
        },
      });
      if (existingUser) {
        builderPlaceOwner = existingUser;
        console.log('Existing BuilderPlace owner:', builderPlaceOwner.id);
      } else {
        // Create the owner's profile with the TalentLayer data
        builderPlaceOwner = await prisma.user.create({
          data: {
            status: EntityStatus.VALIDATED,
            talentLayerId: talentLayerUser.id,
            address: talentLayerUser.address.toLocaleLowerCase(),
            name: talentLayerUser.handle,
            picture: talentLayerUser.description?.image_url,
            about: talentLayerUser.description?.about,
            weeklyTransactionCounter: 0,
            counterStartDate: 0,
            hirerProfile: {
              create: {},
            },
          },
        });
        console.log('Inserted BuilderPlace owner:', builderPlaceOwner.id);
      }

      collaboratorIds.push(builderPlaceOwner.id);
    }

    if (owners.length > 0) {
      // Create the collaborators' profiles with the TalentLayer data
      for (const address of owners) {
        let collaborator;
        if (address.toLocaleLowerCase() === builderPlaceOwner?.address?.toLocaleLowerCase())
          continue;
        const talentLayerCollaborator = await getUserTalentLayerDataByAddress(address);
        if (talentLayerCollaborator) {
          const existingUser = await prisma.user.findFirst({
            where: {
              talentLayerId: ownerTalentLayerId,
            },
          });
          if (existingUser) {
            collaborator = existingUser;
            console.log('Existing collaborator:', collaborator.id);
          } else {
            collaborator = await prisma.user.create({
              data: {
                status: EntityStatus.VALIDATED,
                talentLayerId: talentLayerCollaborator.id,
                name: talentLayerCollaborator.handle,
                picture: talentLayerCollaborator.description?.image_url,
                about: talentLayerCollaborator.description?.about,
                weeklyTransactionCounter: 0,
                counterStartDate: 0,
                hirerProfile: {
                  create: {},
                },
              },
            });
            console.log('Inserted collaborator:', collaborator.id);
          }
          collaboratorIds.push(collaborator.id);
        }
      }
    }

    // Create the BuilderPlace with the mongo data + add owners & collaborators
    const builderPlace = await prisma.builderPlace.create({
      data: {
        name,
        baseline,
        subdomain,
        logo,
        cover,
        profilePicture,
        palette: JSON.stringify(palette),
        about,
        aboutTech,
        ownerId: builderPlaceOwner?.id,
        status: EntityStatus.VALIDATED,
        preferredWorkTypes,
        collaborators: {
          connect: collaboratorIds.map(id => ({ id })),
        },
      },
    });

    console.log('Inserted BuilderPlace:', builderPlace);
  }
}

export async function down(): Promise<void> {
  // Write migration here
}
