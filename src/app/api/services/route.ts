import { ServiceStatusEnum } from '../../../types';
import { getServices } from '../../../queries/services';

export interface ServicesFilters {
  serviceStatus?: ServiceStatusEnum;
  buyerId?: string | null;
  sellerId?: string | null;
  numberPerPage?: number | null;
  offset?: number | null;
  searchQuery?: string | null;
  platformId?: string | null;
  keywordList?: string[];
}

export async function GET(request: Request) {
  console.log('GET');
  const { searchParams } = new URL(request.url);
  const chainId = Number(searchParams.get('chainId'));
  const filters: ServicesFilters = {
    serviceStatus: searchParams.get('serviceStatus') as ServiceStatusEnum,
    buyerId: searchParams.get('buyerId'),
    sellerId: searchParams.get('sellerId'),
    numberPerPage: Number(searchParams.get('numberPerPage')),
    offset: Number(searchParams.get('offset')),
    searchQuery: searchParams.get('searchQuery'),
    platformId: searchParams.get('platformId'),
    keywordList: searchParams.get('keywordList')?.split(','),
  };
  const response = await getServices(chainId, filters);

  const services = response?.data?.data?.services;

  return Response.json({ services });
}

export async function POST(request: Request) {
  //TODO: Implement
}
