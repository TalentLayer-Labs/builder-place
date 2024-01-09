import { $Enums, EntityStatus, PrismaClient, User } from '@prisma/client';
const prisma = new PrismaClient();
import {
  addDomainToVercel,
  getApexDomain,
  removeDomainFromVercelProject,
  removeDomainFromVercelTeam,
  validDomainRegex,
} from './domains';
import {
  CreateBuilderPlaceAction,
  CreateWorkerProfileAction,
  UpdateBuilderPlace,
  UpdateBuilderPlaceDomain,
  AddBuilderPlaceCollaborator,
  RemoveBuilderPlaceCollaborator,
} from './types';
import { NextApiResponse } from 'next';
import { MAX_TRANSACTION_AMOUNT } from '../../config';
import UserType = $Enums.UserType;

export const deleteBuilderPlace = async (id: string) => {
  try {
    const builderPlace = await prisma.builderPlace.delete({
      where: {
        id: Number(id),
      },
    });
    console.log(builderPlace, 'builderPlace deleted');
    return {
      message: 'BuilderPlace deleted successfully',
    };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const updateBuilderPlace = async (builderPlace: UpdateBuilderPlace) => {
  try {
    const updatedBuilderPlace = await prisma.builderPlace.update({
      where: {
        ownerId: Number(builderPlace.ownerTalentLayerId),
      },
      data: {
        ...builderPlace,
        palette: { ...builderPlace.palette },
        status: (builderPlace.status as EntityStatus) || EntityStatus.VALIDATED,
      },
    });
    return {
      message: 'BuilderPlace updated successfully',
      id: updatedBuilderPlace.id,
    };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const addBuilderPlaceCollaborator = async (body: AddBuilderPlaceCollaborator) => {
  try {
    const newCollaborator = await prisma.user.findUnique({
      where: {
        address: body.newCollaboratorAddress,
      },
    });

    if (!newCollaborator) {
      throw new Error('Collaborator not found');
    }

    await prisma.builderPlace.update({
      where: {
        id: Number(body.builderPlaceId),
      },
      data: {
        collaborators: {
          connect: [{ id: newCollaborator.id }],
        },
      },
    });

    console.log('Collaborator added successfully', body.newCollaboratorAddress);
    return {
      message: 'Collaborator added successfully',
      address: newCollaborator.address,
      id: newCollaborator.id,
    };
  } catch (error: any) {
    console.log('Error adding collaborator:', error);
    throw new Error(error.message);
  }
};

export const removeBuilderPlaceCollaborator = async (body: RemoveBuilderPlaceCollaborator) => {
  try {
    const collaborator = await prisma.user.findUnique({
      where: {
        address: body.newCollaboratorAddress,
      },
    });

    if (!collaborator) {
      throw new Error('Collaborator not found');
    }

    await prisma.builderPlace.update({
      where: {
        id: Number(body.builderPlaceId),
      },
      data: {
        collaborators: {
          disconnect: [{ id: collaborator.id }],
        },
      },
    });
    console.log('Collaborator removed successfully', body.newCollaboratorAddress);
    return {
      message: 'Collaborator removed successfully',
      address: collaborator.address,
      id: collaborator.id,
    };
  } catch (error: any) {
    console.log('Error adding collaborator:', error);
    throw new Error(error.message);
  }
};

export const createBuilderPlace = async (data: CreateBuilderPlaceAction) => {
  try {
    const newBuilderPlace = await prisma.builderPlace.create({
      data: {
        name: data.name,
        about: data.about,
        preferredWorkTypes: data.preferredWorkTypes,
        palette: { ...data.palette },
        profilePicture: data.profilePicture,
        status: EntityStatus.PENDING,
      },
    });

    const { id } = newBuilderPlace;
    return {
      message: 'BuilderPlace created successfully',
      id: id,
    };
  } catch (error: any) {
    console.log('Error creating new builderPlace:', error);
    return {
      error: error.message,
    };
  }
};

export const getBuilderPlaceByDomain = async (domain: string) => {
  try {
    console.log('getting builderPlace ', domain);
    if (domain.includes(process.env.NEXT_PUBLIC_ROOT_DOMAIN as string)) {
      const builderPlace = await prisma.builderPlace.findFirst({
        where: {
          OR: [{ subdomain: domain }, { customDomain: domain }],
        },
      });
      console.log('fetched builderPlaces, ', builderPlace);

      return builderPlace;
    }
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const getBuilderPlaceById = async (id: string) => {
  try {
    console.log('getting builderPlace with id:', id);
    const builderPlaceSubdomain = await prisma.builderPlace.findUnique({
      where: {
        id: Number(id),
      },
    });
    console.log('fetched builderPlace, ', builderPlaceSubdomain);
    if (builderPlaceSubdomain) {
      return builderPlaceSubdomain;
    }

    return null;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const getBuilderPlaceByOwnerId = async (id: string) => {
  try {
    console.log("getting builderPlace with owner's id:", id);
    const builderPlaceSubdomain = await prisma.builderPlace.findFirst({
      where: {
        owner: {
          id: Number(id),
        },
      },
    });
    console.log('fetched builderPlace, ', builderPlaceSubdomain);
    if (builderPlaceSubdomain) {
      return builderPlaceSubdomain;
    }

    return null;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const getBuilderPlaceByOwnerAddressAndId = async (
  address: string,
  builderPlaceId: string,
) => {
  try {
    console.log('getting builderPlace with admin address & id:', address, builderPlaceId);
    const builderPlaceSubdomain = await prisma.builderPlace.findFirst({
      where: {
        id: Number(builderPlaceId),
        collaborators: {
          some: {
            address: address,
          },
        },
      },
      // select: {
      //   subdomain: true, // assuming you only want the subdomain field
      // },
    });

    console.log('fetched builderPlace, ', builderPlaceSubdomain);
    if (builderPlaceSubdomain) {
      return builderPlaceSubdomain;
    }

    return null;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const getBuilderPlaceByOwnerTlIdAndId = async (ownerId: string, id: string) => {
  try {
    console.log("getting builderPlace with owner's TlId & mongo _id:", ownerId, id);
    const builderPlaceSubdomain = await prisma.builderPlace.findFirst({
      where: {
        AND: [{ ownerId: Number(ownerId) }, { id: Number(id) }],
      },
      include: {
        owner: true,
        collaborators: true,
      },
    });
    console.log('fetched builderPlace, ', builderPlaceSubdomain);
    if (builderPlaceSubdomain) {
      return builderPlaceSubdomain;
    }

    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// TODO! createBuilderPlace, can be used for the onboarding workflow maybe for the creating the subdomain & deleteBuilderPlace
export const updateDomain = async (builderPlace: UpdateBuilderPlaceDomain) => {
  try {
    console.log('Update Domain invoke, ', builderPlace);
    let response;

    if (builderPlace.customDomain.includes('builder.place')) {
      console.log('Domain contains builder.place');
      return {
        error: 'Cannot use builder.place subdomain as your custom domain',
      };

      // if the custom domain is valid, we need to store it and add it to Vercel
    } else if (validDomainRegex.test(builderPlace.customDomain!)) {
      console.log('Custom Domain is valid');
      // Update the MongoDB document with the new custom domain
      // await BuilderPlace.updateOne({ _id: new mongoose.Types.ObjectId(builderPlace.id) }, { customDomain: builderPlace.customDomain }).exec();
      console.log('Searching subdomain, ', builderPlace.subdomain);
      const updatedEntity = await prisma.builderPlace.update({
        where: {
          subdomain: builderPlace.subdomain,
        },
        data: {
          customDomain: builderPlace.customDomain,
        },
      });
      console.log('Updated entity with custom domain: ', updatedEntity.customDomain);

      // Add the custom domain to Vercel
      console.log('Adding domain to vercel');

      await addDomainToVercel(builderPlace.customDomain!);

      // null means remove the custom domain
    } else if (builderPlace.customDomain! === '') {
      // Remove the custom domain from the MongoDB document
      console.log('Removing custom domain from MongoDB document');
      // await BuilderPlace.updateOne({ _id: new mongoose.Types.ObjectId(builderPlace.id) }, { customDomain: "asd.de" }).exec();

      await prisma.builderPlace.updateMany({
        where: {
          subdomain: builderPlace.subdomain,
        },
        data: {
          customDomain: '',
        },
      });
    }

    // Get the current custom domain from the MongoDB document
    // const currentBuilderPlace = await BuilderPlace.findById(new mongoose.Types.ObjectId(builderPlace.id)).exec();
    const currentBuilderPlace = await prisma.builderPlace.findFirst({
      where: {
        subdomain: builderPlace.subdomain,
      },
    });

    const currentDomain = currentBuilderPlace?.customDomain || '';

    // If the site had a different customDomain before, we need to remove it from Vercel
    if (builderPlace.customDomain !== currentDomain) {
      response = await removeDomainFromVercelProject(builderPlace.customDomain!);

      //TODO check if this works => No Regex in Prisma
      // Check if the apex domain is being used by other sites
      const apexDomain = getApexDomain(`https://${builderPlace.customDomain}`);
      const domainsWithApexDomain = await prisma.builderPlace.findMany({
        where: {
          customDomain: {
            endsWith: `.${apexDomain}`,
          },
        },
      });

      const domainCount = domainsWithApexDomain.length;

      // we should only remove it from our Vercel project
      if (domainCount >= 1) {
        await removeDomainFromVercelProject(builderPlace.customDomain!);
      } else {
        // this is the only site using this apex domain
        // so we can remove it entirely from our Vercel team
        await removeDomainFromVercelTeam(builderPlace.customDomain!);
      }
    }

    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const createWorkerProfile = async (data: CreateWorkerProfileAction) => {
  try {
    // Step 1: Create the User
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        picture: data.picture,
        about: data.about,
        type: UserType.WORKER,
      },
    });

    //TODO add here the creation of the hirer profile if any
    // Step 2: Create the WorkerProfile with the same ID as the User
    await prisma.workerProfile.create({
      data: {
        id: user.id,
        skills: data?.skills?.split(','),
      },
    });

    return {
      message: 'Worker Profile created successfully',
      id: user.id,
    };
  } catch (error: any) {
    console.log('Error creating new Worker Profile:', error);
    return {
      error: error.message!,
    };
  }
};

export const getUserProfileById = async (id: string) => {
  try {
    console.log('Getting Worker Profile with id:', id);
    const userProfile = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        workerProfile: true,
        hirerProfile: true,
        ownedBuilderPlace: true,
        managingPlaces: true,
      },
    });
    console.log('Fetched Worker Profile, ', userProfile);
    if (userProfile) {
      return userProfile;
    }

    return null;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const getWorkerProfileByTalentLayerId = async (
  talentLayerId: string,
  res?: NextApiResponse,
): Promise<User | null> => {
  try {
    console.log('Getting Worker Profile with TalentLayer id:', talentLayerId);
    const userProfile = await prisma.user.findUnique({
      where: {
        talentLayerId: Number(talentLayerId),
      },
      include: {
        workerProfile: true,
        hirerProfile: true,
        ownedBuilderPlace: true,
        managingPlaces: true,
      },
    });
    console.log(userProfile);
    if (!userProfile) {
      return null;
    }

    return userProfile;
  } catch (error: any) {
    if (res) {
      res.status(500).json({ error: error.message });
    } else {
      console.log(error.message);
    }
    return null;
  }
};

export async function checkUserEmailVerificationStatus(
  user: User,
  res: NextApiResponse,
): Promise<void> {
  if (!user.isEmailVerified) {
    console.log('Email not verified');
    res.status(401).json({ error: 'Email not verified' });
  }
}

export async function checkOrResetTransactionCounter(
  user: User,
  res: NextApiResponse,
): Promise<void> {
  try {
    const nowMilliseconds = new Date().getTime();
    const oneWeekAgoMilliseconds = new Date(nowMilliseconds - 7 * 24 * 60 * 60 * 1000).getTime(); // 7 days ago

    if (user.counterStartDate > oneWeekAgoMilliseconds) {
      // Less than one week since counterStartDate
      if (user.weeklyTransactionCounter >= MAX_TRANSACTION_AMOUNT) {
        // If the counter is already 50, stop the function
        console.log('Transaction limit reached for the week');
        throw new Error('Transaction limit reached for the week');
      }
    } else {
      console.log('More than a week since the start date, reset counter');
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          counterStartDate: nowMilliseconds,
          weeklyTransactionCounter: 0,
        },
      });
    }
    console.log('Delegating transaction');
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function incrementWeeklyTransactionCounter(
  user: User,
  res: NextApiResponse,
): Promise<void> {
  try {
    // Increment the counter
    const newWeeklyTransactionCounter = (user.weeklyTransactionCounter || 0) + 1;
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        weeklyTransactionCounter: newWeeklyTransactionCounter,
      },
    });
    console.log('Transaction counter incremented', newWeeklyTransactionCounter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export const validateUserEmail = async (userId: string, email: string) => {
  try {
    const resp = await prisma.user.update({
      where: {
        email: email,
        talentLayerId: Number(userId),
      },
      data: {
        isEmailVerified: true,
      },
    });
    console.log('Updated worker profile email', resp.id, resp.name, resp.email);
    return {
      message: 'Email verified successfully',
    };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};
