import axios from 'axios';
import { IToken, ServiceStatusEnum } from '../../../types';

export const getFilteredServicesByKeywords = async (
  serviceStatus?: ServiceStatusEnum,
  allowedTokens?: IToken[],
  buyerId?: string,
  sellerId?: string,
  numberPerPage?: number,
  offset?: number,
  searchQuery?: string,
  platformId?: string,
  chainId?: number,
  filters?: {
    selectedToken?: string;
    minRate?: string;
    maxRate?: string;
    selectedRatings?: string[];
    platformId?: string;
  }
): Promise<any> => {
  try {
    console.log(allowedTokens, 'allowedTokens');
    return await axios.get('/api/services/filtered', {
      params: {
        serviceStatus,
        allowedTokens: JSON.stringify(allowedTokens),
        buyerId,
        sellerId,
        numberPerPage,
        offset,
        searchQuery,
        platformId,
        chainId,
        ...filters,
        selectedRatings: JSON.stringify(filters?.selectedRatings),
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};
