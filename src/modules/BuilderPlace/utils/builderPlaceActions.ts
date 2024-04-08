import { PlatformsFilters } from '../../../app/api/platforms/route';

export const generateWhereClause = (filters: PlatformsFilters) => {
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
  } else if (filters.collaboratorAddress) {
    whereClause.collaborators = {
      some: {
        address: filters.collaboratorAddress,
      },
    };
  }
  return whereClause;
};
