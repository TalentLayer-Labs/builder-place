import type { NextApiRequest, NextApiResponse } from 'next';
import { getServices } from '../../../queries/services';
import keywordFilter from './filter.json';
import { IToken, ServiceStatusEnum } from '../../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query;
  let keywordList = keywordFilter.keywords;

  const serviceStatus = query.serviceStatus as ServiceStatusEnum;
  const buyerId = query.buyerId as string;
  const sellerId = query.sellerId as string;
  const numberPerPage = Number(query.numberPerPage);
  const offset = Number(query.offset);
  const searchQuery = query.searchQuery as string;
  const platformId = query.platformId as string;
  const chainId = Number(query.chainId);
  const allowedTokens = JSON.parse(query.allowedTokens as string);
  const selectedToken = query.selectedToken as string;
  const minRate = query.minRate as string;
  const maxRate = query.maxRate as string;
  const selectedRatings = JSON.parse(query.selectedRatings as string);
  try {
    let response = await getServices(chainId, {
      serviceStatus,
      allowedTokens,
      buyerId,
      sellerId,
      numberPerPage,
      offset,
      keywordList,
      searchQuery,
      platformId,
      selectedToken,
      minRate,
      maxRate,
      selectedRatings,
    });

    const filteredServices = response?.data?.data?.services;

    res.status(200).json({ services: filteredServices });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}
