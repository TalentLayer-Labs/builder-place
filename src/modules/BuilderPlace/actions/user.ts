import { NextApiResponse } from 'next';
import { ERROR_FETCHING_EMAILS, ERROR_FETCHING_USER, ERROR_FETCHING_USERS } from '../apiResponses';
import prisma from '../../../postgre/postgreClient';
import { handleApiError } from '../utils/error';
import { IQueryData } from '../../../pages/api/domain/get-verified-users-email-notification-data';
import { UsersFilters } from '../../../app/api/users/route';

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
          in: userAddresses.map(address => address),
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

export const getUsersBy = async (filters: UsersFilters) => {
  console.log('*DEBUG* Getting User Profile with filters:', filters);

  const whereClause: any = {};
  if (filters.id) {
    whereClause.id = Number(filters.id);
  } else if (filters.address) {
    whereClause.address = filters.address;
  } else if (filters.email) {
    whereClause.email = filters.email;
  } else if (filters.talentLayerId) {
    whereClause.talentLayerId = filters.talentLayerId;
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
