import { EntityStatus } from '.prisma/client';
import { NextApiResponse } from 'next';
import {
  ERROR_CREATING_HIRER_PROFILE,
  ERROR_CREATING_WORKER_PROFILE,
  ERROR_FETCHING_EMAILS,
  ERROR_FETCHING_USER,
  ERROR_FETCHING_USERS,
  ERROR_REMOVING_USER_OWNER,
  ERROR_SETTING_USER_OWNER,
  ERROR_UPDATING_HIRER_PROFILE,
  ERROR_UPDATING_USER,
  ERROR_UPDATING_USER_EMAIL,
  ERROR_UPDATING_WORKER_PROFILE,
  ERROR_VALIDATING_USER,
} from '../apiResponses';
import {
  CreateHirerProfileAction,
  CreateWorkerProfileAction,
  SetUserProfileOwner,
  UpdateHirerProfileAction,
  UpdateUserEmailAction,
  UpdateUserEmailPreferencesAction,
  UpdateWorkerProfileAction,
} from '../types';
import prisma from '../../../postgre/postgreClient';
import { handleApiError } from '../utils/error';
import { IQueryData } from '../../../pages/api/domain/get-verified-users-email-notification-data';
import { UsersFilters } from '../../../app/api/users/route';
import { User } from '@prisma/client';

export const getUserByAddress = async (userAddress: string, res?: NextApiResponse) => {
  let errorMessage = '';
  try {
    console.log('Getting User Profile with address:', userAddress);
    const userProfile = await prisma.user.findUnique({
      where: {
        address: userAddress,
      },
      include: {
        workerProfile: true,
        hirerProfile: true,
        ownedBuilderPlace: true,
        managedPlaces: true,
      },
    });

    if (!userProfile) {
      return null;
    }

    console.log('Fetched user profile with id: ', userProfile?.id);
    return userProfile;
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_FETCHING_USER, res);
  }
};
export const getUserEmailsByAddresses = async (userAddresses: string[], res?: NextApiResponse) => {
  let errorMessage = '';
  try {
    console.log('Getting User Email with address:', userAddresses);
    const userEmails = await prisma.user.findMany({
      where: {
        address: {
          in: userAddresses.map(address => address.toLocaleLowerCase()),
        },
      },
      select: {
        email: true,
      },
    });

    if (!userEmails) {
      return null;
    }

    console.log(`Fetched ${userEmails.length} user emails`);
    return userEmails.map(data => data.email).filter(email => !!email);
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_FETCHING_EMAILS, res);
  }
};
export const getVerifiedEmailCount = async (res?: NextApiResponse) => {
  let errorMessage = '';
  try {
    console.log('Getting Verified User Emails count');
    const verifiedEmailCount = await prisma.user.count({
      where: {
        isEmailVerified: true,
      },
    });

    console.log(`Count of users with verified email: ${verifiedEmailCount}`);

    if (!verifiedEmailCount) {
      return 0;
    }

    return verifiedEmailCount;
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_FETCHING_USERS, res);
  }
};

export const getUserByTalentLayerId = async (talentLayerId: string, res?: NextApiResponse) => {
  let errorMessage = '';
  try {
    console.log('Getting Worker Profile with TalentLayer id:', talentLayerId);
    const userProfile = await prisma.user.findUnique({
      where: {
        talentLayerId: talentLayerId,
      },
      include: {
        workerProfile: true,
        hirerProfile: true,
        ownedBuilderPlace: true,
        managedPlaces: true,
      },
    });
    console.log('Fetched user name', userProfile?.name);
    if (!userProfile) {
      return null;
    }

    return userProfile;
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_FETCHING_USER, res);
  }
};

export const getUserByTalentLayerHandle = async (
  talentLayerHandle: string,
  res?: NextApiResponse,
) => {
  let errorMessage = '';
  try {
    console.log('Getting Worker Profile with TalentLayer handle:', talentLayerHandle);
    const userProfile = await prisma.user.findUnique({
      where: {
        talentLayerHandle: talentLayerHandle,
      },
      include: {
        workerProfile: true,
        hirerProfile: true,
        ownedBuilderPlace: true,
        managedPlaces: true,
      },
    });
    console.log(userProfile);
    if (!userProfile) {
      return null;
    }

    return userProfile;
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_FETCHING_USER, res);
  }
};

export const getUsersBy = async (filters: UsersFilters) => {
  console.log('*DEBUG* Getting User Profile with filters:', filters);

  const whereClause: any = {};
  if (filters.id) {
    whereClause.id = Number(filters.id);
  } else if (filters.address) {
    whereClause.address = filters.address;
  } else if (filters.email) {
    whereClause.email = filters.email;
  }

  const userProfile = await prisma.user.findMany({
    where: whereClause,
    include: {
      workerProfile: true,
      hirerProfile: true,
      ownedBuilderPlace: true,
      managedPlaces: true,
    },
  });
  console.log('Fetched User Profile: ', userProfile[0]?.name);
  return userProfile;
};

export const getUserById = async (id: string) => {
  let errorMessage = '';
  try {
    console.log('Getting User Profile with id:', id);
    const userProfile: User = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        workerProfile: true,
        hirerProfile: true,
        ownedBuilderPlace: true,
        managedPlaces: true,
      },
    });
    console.log('Fetched Worker Profile: ', userProfile);
    if (userProfile) {
      return userProfile;
    }

    return null;
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_FETCHING_USER);
  }
};

export const getUserByEmail = async (email: string) => {
  let errorMessage = '';
  try {
    console.log('Getting User Profile with email:', email);
    const userProfile = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        // workerProfile: true,
        // hirerProfile: true,
        ownedBuilderPlace: true,
        // managedPlaces: true,
      },
    });
    console.log('Fetched Worker Profile: ', userProfile);
    if (userProfile) {
      return userProfile;
    }

    return null;
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_FETCHING_USER);
  }
};

export const getVerifiedUsersEmailData = async (includeSkills: boolean = false) => {
  let errorMessage = '';
  try {
    console.log('Getting Users email notification preferences data');
    let data = await prisma.user.findMany({
      where: {
        isEmailVerified: true,
      },
      select: {
        address: true,
        email: true,
        name: true,
        id: true,
        emailPreferences: true,
        workerProfile: includeSkills
          ? {
              select: {
                skills: true,
              },
            }
          : false,
      },
    });
    console.log(`Fetched ${data.length} users`);
    const result = data.filter(item => !!item.email);
    return result as IQueryData[];
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_FETCHING_EMAILS);
  }
};

export const updateWorkerProfile = async (data: UpdateWorkerProfileAction) => {
  let errorMessage = '';
  /**
   * @dev: No Prisma nested update yet, so we need to update the User and WorkerProfile separately
   */
  try {
    // Step 1: Update the User
    const user = await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        email: data.email,
        picture: data.picture,
        about: data.about,
      },
    });

    // Step 2: Update the WorkerProfile with the same ID as the User
    await prisma.workerProfile.update({
      where: {
        id: data.id,
      },
      data: {
        id: user.id,
        skills: data?.skills?.split(',').map(skill => skill.trim()),
      },
    });

    return {
      message: 'Worker Profile updated successfully',
      id: user.id,
    };
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_UPDATING_WORKER_PROFILE);
  }
};

export const updateHirerProfile = async (data: UpdateHirerProfileAction) => {
  let errorMessage = '';
  /**
   * @dev: No Prisma nested update yet, so we need to update the User and WorkerProfile separately
   */
  try {
    // Step 1: Update the User
    const user = await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        email: data.email,
        picture: data.picture,
        about: data.about,
      },
    });

    /**
     * @dev: update here hirerProfile entity when needed
     */

    return {
      message: 'Hirer Profile updated successfully',
      id: user.id,
    };
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_UPDATING_HIRER_PROFILE);
  }
};

export const updateUserEmail = async (data: UpdateUserEmailAction) => {
  let errorMessage = '';
  try {
    const user = await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        email: data.email,
        isEmailVerified: false,
      },
    });

    return {
      message: 'Email updated successfully',
      id: user.id,
    };
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_UPDATING_USER_EMAIL);
  }
};

export const createHirerProfile = async (data: CreateHirerProfileAction) => {
  let errorMessage = '';
  try {
    const user = await prisma.user.create({
      // @ts-ignore
      data: {
        email: data.email,
        name: data.name,
        picture: data.picture,
        about: data.about,
        address: '0x0', // @dev: TEMPS - this function will be removed
        hirerProfile: {
          create: {},
        },
      },
    });

    return {
      message: 'Hirer Profile created successfully',
      id: user.id,
    };
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_CREATING_HIRER_PROFILE);
  }
};

export const createWorkerProfile = async (data: CreateWorkerProfileAction) => {
  let errorMessage = '';
  try {
    const user = await prisma.user.create({
      // @ts-ignore
      data: {
        email: data.email,
        name: data.name,
        picture: data.picture,
        about: data.about,
        address: '0x0', // @dev: TEMPS - this function will be removed
        workerProfile: {
          create: {
            skills: data?.skills?.split(','),
          },
        },
      },
    });

    return {
      message: 'Worker Profile created successfully',
      id: user.id,
    };
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_CREATING_WORKER_PROFILE);
  }
};

export const updateUserNotificationsPreferences = async (
  data: UpdateUserEmailPreferencesAction,
) => {
  let errorMessage = '';
  try {
    await prisma.user.update({
      where: {
        address: data.address.toLocaleLowerCase(),
      },
      data: {
        emailPreferences: { ...data.preferences },
      },
    });

    return {
      message: 'Preferences updated successfully',
    };
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_UPDATING_USER);
  }
};

export const setUserOwner = async (data: SetUserProfileOwner) => {
  let errorMessage = '';
  try {
    await prisma.user.update({
      where: {
        id: Number(data.id),
      },
      data: {
        talentLayerId: data.talentLayerId,
        address: data.userAddress.toLocaleLowerCase(),
      },
    });
    return {
      message: 'User owner set successfully',
      id: data.talentLayerId,
    };
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_SETTING_USER_OWNER);
  }
};

/**
 * @dev: Only this function can set the User status to VALIDATED
 * @param userId
 */
export const validateUser = async (userId: string) => {
  let errorMessage = '';
  try {
    await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        status: EntityStatus.VALIDATED,
      },
    });
    return {
      message: 'User validated successfully',
      id: userId,
    };
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_VALIDATING_USER);
  }
};

export const removeOwnerFromUser = async (userId: string) => {
  let errorMessage = '';
  try {
    console.log('Removing address from pending User:', userId);
    await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        talentLayerId: undefined,
      },
    });
    return {
      message: 'User address removed successfully',
      id: userId,
    };
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_REMOVING_USER_OWNER);
  }
};
