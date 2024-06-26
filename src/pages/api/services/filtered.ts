import type { NextApiRequest, NextApiResponse } from 'next';
import { getServices } from '../../../queries/services';
import keywordFilter from './filter.json';
import { ServiceStatusEnum } from '../../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query;
  // @dev : here you can add the filter logic
  let keywordList = keywordFilter.keywords;

  const serviceStatus = query.serviceStatus as ServiceStatusEnum;
  const buyerId = query.buyerId as string;
  const sellerId = query.sellerId as string;
  const numberPerPage = Number(query.numberPerPage);
  const offset = Number(query.offset);
  const searchQuery = query.searchQuery as string;
  const platformId = query.platformId as string;
  const chainId = Number(query.chainId);

  try {
    let response = await getServices(chainId, {
      serviceStatus,
      buyerId,
      sellerId,
      numberPerPage,
      offset,
      keywordList,
      searchQuery,
      platformId,
    });

    const filteredServices = response?.data?.data?.services;

    res.status(200).json({ services: filteredServices });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}
