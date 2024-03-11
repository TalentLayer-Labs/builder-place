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
  selectedToken?: string,
  minRate?: string,
  maxRate?: string,
  selectedRatings?: string[],
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
        selectedToken,
        minRate,
        maxRate,
        selectedRatings: JSON.stringify(selectedRatings),
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};
