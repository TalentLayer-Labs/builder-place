import {
  DOMAIN_CONTAINS_BUILDER_PLACE,
  ERROR_UPDATING_DOMAIN,
  INVALID_CUSTOM_DOMAIN,
} from '../apiResponses';
import { UpdateBuilderPlaceDomain } from '../types';
import {
  addDomainToVercel,
  getApexDomain,
  removeDomainFromVercelProject,
  removeDomainFromVercelTeam,
  validDomainRegex,
} from '../domains';
import prisma from '../../../postgre/postgreClient';
import { handleApiError } from '../utils/error';
import { PlatformsFilters } from '../../../app/api/platforms/route';
import { generateWhereClause } from '../utils/builderPlaceActions';

export const getPlatformsBy = async (filters: PlatformsFilters) => {
  console.log('*DEBUG* Getting Platforms with filters:', filters);

  const whereClause = generateWhereClause(filters);

  const platform = await prisma.builderPlace.findMany({
    where: whereClause,
    include: {
      owner: true,
      collaborators: true,
    },
  });
  console.log('Fetched Platforms: ', platform?.length);
  return platform;
};

export const getPlatformBy = async (filters: PlatformsFilters) => {
  console.log('*DEBUG* Getting Platform with filters:', filters);

  const whereClause = generateWhereClause(filters);

  const platform = await prisma.builderPlace.findUnique({
    where: whereClause,
    include: {
      owner: true,
      collaborators: true,
    },
  });
  console.log('Fetched Platform: ', platform?.name);
  return platform;
};

// TODO! createBuilderPlace, can be used for the onboarding workflow maybe for the creating the subdomain & deleteBuilderPlace
export const updateDomain = async (builderPlace: UpdateBuilderPlaceDomain) => {
  let errorMessage = '';
  try {
    console.log('Update Domain invoke, ', builderPlace);
    let response;

    if (builderPlace.customDomain.includes('builder.place')) {
      console.log(DOMAIN_CONTAINS_BUILDER_PLACE);
      throw new Error(DOMAIN_CONTAINS_BUILDER_PLACE);

      // if the custom domain is valid, we need to store it and add it to Vercel
    } else if (validDomainRegex.test(builderPlace.customDomain!)) {
      console.log(INVALID_CUSTOM_DOMAIN);
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
      // Remove the custom domain from the entity
      console.log('Removing custom domain');
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
    const currentBuilderPlace = await prisma.builderPlace.findFirst({
      where: {
        subdomain: builderPlace.subdomain,
      },
    });

    const currentDomain = currentBuilderPlace?.customDomain || '';

    // If the site had a different customDomain before, we need to remove it from Vercel
    if (builderPlace.customDomain !== currentDomain) {
      response = await removeDomainFromVercelProject(builderPlace.customDomain!);

      //TODO Prisma: check if this works => No Regex in Prisma
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
    handleApiError(error, errorMessage, ERROR_UPDATING_DOMAIN);
  }
};
