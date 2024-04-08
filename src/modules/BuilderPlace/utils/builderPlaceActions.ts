import { PlatformsFilters } from '../../../app/api/platforms/route';
import { PlatformFilters } from '../actions/builderPlace';

/**
 * Generate where clause for prisma findMany query - collaboratorAddress, owner.address,
 * owner.talentLayerId are not considered unique fields
 * @param filters
 */
export const generateWhereClauseFindMany = (filters: PlatformsFilters) => {
  const whereClause: any = generateWhereClauseFindUnique(filters);
  if (filters.ownerAddress) {
    whereClause?.owner
      ? (whereClause.owner.address = filters.ownerAddress)
      : (whereClause.owner = { address: filters.ownerAddress });
  } else if (filters.ownerTalentLayerId) {
    whereClause?.owner
      ? (whereClause.owner.talentLayerId = filters.ownerTalentLayerId)
      : (whereClause.owner = { talentLayerId: filters.ownerTalentLayerId });
  }
  if (filters.ownerTalentLayerId) {
    whereClause?.owner
      ? (whereClause.owner.talentLayerId = filters.ownerTalentLayerId)
      : (whereClause.owner = { talentLayerId: filters.ownerTalentLayerId });
  } else if (filters.collaboratorAddress) {
    whereClause.collaborators = {
      some: {
        address: filters.collaboratorAddress,
      },
    };
  }
  return whereClause;
};
export const generateWhereClauseFindUnique = (filters: PlatformFilters) => {
  const whereClause: any = {};
  if (filters.id) {
    whereClause.id = Number(filters.id);
  } else if (filters.ownerId) {
    whereClause.ownerId = filters.ownerId;
  } else if (filters.talentLayerPlatformId) {
    whereClause.talentLayerPlatformId = filters.talentLayerPlatformId;
  } else if (filters.talentLayerPlatformName) {
    whereClause.talentLayerPlatformName = filters.talentLayerPlatformName;
  } else if (filters.subdomain) {
    whereClause.subdomain = filters.subdomain;
  }
  return whereClause;
};
