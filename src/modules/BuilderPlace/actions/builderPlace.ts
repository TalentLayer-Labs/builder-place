import { EntityStatus, Prisma } from '.prisma/client';
import { PlatformsFilters } from '../../../app/api/platforms/route';
import prisma from '../../../postgre/postgreClient';
import {
  DOMAIN_CONTAINS_BUILDER_PLACE,
  ERROR_FETCHING_BUILDERPLACE,
  ERROR_UPDATING_BUILDERPLACE,
  ERROR_UPDATING_DOMAIN,
  ERROR_VALIDATING_BUILDERPLACE,
  INVALID_CUSTOM_DOMAIN,
} from '../apiResponses';
import {
  addDomainToVercel,
  getApexDomain,
  removeDomainFromVercelProject,
  removeDomainFromVercelTeam,
  validDomainRegex,
} from '../domains';
import { UpdateBuilderPlace, UpdateBuilderPlaceDomain } from '../types';
import { handleApiError } from '../utils/error';

/**
 * @dev: Only this function can set the BuilderPlace status to VALIDATED
 * @param builderPlaceId
 */
export const validateBuilderPlace = async (builderPlaceId: string) => {
  let errorMessage = '';
  try {
    await prisma.builderPlace.update({
      where: {
        id: Number(builderPlaceId),
      },
      data: {
        status: EntityStatus.VALIDATED,
      },
    });
    return {
      message: 'BuilderPlace validated successfully',
      id: builderPlaceId,
    };
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_VALIDATING_BUILDERPLACE);
  }
};

export const getPlatformBy = async (filters: PlatformsFilters) => {
  console.log('*DEBUG* Getting Platforms with filters:', filters);

  const whereClause: any = {};
  if (filters.id) {
    whereClause.id = Number(filters.id);
  } else if (filters.ownerId) {
    whereClause.ownerId = filters.ownerId;
  } else if (filters.ownerAddress) {
    whereClause.owner.address = filters.ownerAddress;
  } else if (filters.ownerTalentLayerId) {
    whereClause.owner.talentLayerId = filters.ownerTalentLayerId;
  } else if (filters.talentLayerPlatformId) {
    whereClause.talentLayerPlatformId = filters.talentLayerPlatformId;
  } else if (filters.talentLayerPlatformName) {
    whereClause.talentLayerPlatformName = filters.talentLayerPlatformName;
  } else if (filters.subdomain) {
    whereClause.subdomain = filters.subdomain;
  }

  const platform = await prisma.builderPlace.findMany({
    where: whereClause,
    include: {
      owner: true,
      collaborators: true,
    },
  });
  console.log('Fetched Platform: ', platform[0]?.name);
  return platform;
};

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

export const getBuilderPlaceByOwnerTlIdAndId = async (
  ownerTalentLayerId: string,
  builderPlaceId: string,
) => {
  let errorMessage = '';
  try {
    console.log(
      "getting builderPlace with owner's TlId & postgres id:",
      ownerTalentLayerId,
      builderPlaceId,
    );
    const builderPlaceSubdomain = await prisma.builderPlace.findFirst({
      where: {
        AND: [{ owner: { talentLayerId: ownerTalentLayerId } }, { id: Number(builderPlaceId) }],
      },
      include: {
        owner: true,
        collaborators: true,
      },
    });
    console.log('fetched builderPlace, ', builderPlaceSubdomain?.subdomain);
    if (builderPlaceSubdomain) {
      return builderPlaceSubdomain;
    }

    return null;
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_FETCHING_BUILDERPLACE);
  }
};

export const getBuilderPlaceByCollaboratorAddressAndId = async (
  address: string,
  builderPlaceId: string,
) => {
  let errorMessage = '';
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
    });

    console.log('fetched builderPlace, ', builderPlaceSubdomain?.subdomain);
    if (builderPlaceSubdomain) {
      return builderPlaceSubdomain;
    }

    return null;
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_FETCHING_BUILDERPLACE);
  }
};

export type BuilderPlaceWithOwnerAndCollaborators = Prisma.BuilderPlaceGetPayload<{
  include: { owner: true; collaborators: true };
}>;

export const getBuilderPlaceByDomain = async (
  domain: string,
): Promise<BuilderPlaceWithOwnerAndCollaborators> => {
  console.log('getting builderPlace ', domain);
  const builderPlace = await prisma.builderPlace.findFirst({
    where: {
      OR: [{ subdomain: domain }, { customDomain: domain }],
    },
    include: {
      owner: true,
      collaborators: true,
    },
  });
  console.log('fetched builderPlaces, ', builderPlace?.subdomain);

  if (!builderPlace) {
    throw new Error(`BuilderPlace not found`);
  }

  return builderPlace;
};

export const getBuilderPlaceByOwnerId = async (id: string) => {
  let errorMessage = '';
  try {
    console.log("getting builderPlace with owner's id:", id);
    const builderPlaceSubdomain = await prisma.builderPlace.findFirst({
      where: {
        owner: {
          id: Number(id),
        },
      },
      include: {
        owner: true,
        collaborators: true,
      },
    });
    console.log('fetched builderPlace, ', builderPlaceSubdomain?.subdomain);
    if (builderPlaceSubdomain) {
      return builderPlaceSubdomain;
    }

    return null;
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_FETCHING_BUILDERPLACE);
  }
};

export const updateBuilderPlace = async (builderPlace: UpdateBuilderPlace) => {
  let errorMessage = '';
  try {
    const updatedBuilderPlace = await prisma.builderPlace.update({
      where: {
        id: Number(builderPlace.builderPlaceId),
      },
      data: {
        about: builderPlace.about,
        aboutTech: builderPlace.aboutTech,
        baseline: builderPlace.baseline,
        cover: builderPlace.cover,
        subdomain: builderPlace.subdomain,
        icon: builderPlace.icon,
        logo: builderPlace.logo,
        name: builderPlace.name,
        palette: builderPlace.palette,
        preferredWorkTypes: builderPlace.preferredWorkTypes,
        presentation: builderPlace.presentation,
      },
    });
    return {
      message: 'BuilderPlace updated successfully',
      id: updatedBuilderPlace.id,
    };
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_UPDATING_BUILDERPLACE);
  }
};
