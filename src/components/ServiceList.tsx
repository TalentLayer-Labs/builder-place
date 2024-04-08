import React, { useContext, useState } from 'react';
import BuilderPlaceContext from '../modules/BuilderPlace/context/BuilderPlaceContext';
import { useRouter } from 'next/navigation';
import useFilteredServices from '../hooks/useFilteredServices';
import { IService, ServiceStatusEnum } from '../types';
import Loading from './Loading';
import ServiceItem from './ServiceItem';
import SearchServiceButton from './Form/SearchServiceButton';

function ServiceList() {
  const { builderPlace } = useContext(BuilderPlaceContext);
  const PAGE_SIZE = 30;
  const router = useRouter();
  const query = router.query;
  const searchQuery = query.search as string;
  const [view, setView] = useState(1);

  const { hasMoreData, services, loading, loadMore } = useFilteredServices(
    ServiceStatusEnum.Opened,
    undefined,
    undefined,
    searchQuery?.toLocaleLowerCase(),
    PAGE_SIZE,
    builderPlace?.talentLayerPlatformId,
  );

  return (
    <>
      {searchQuery && services.length > 0 && (
        <p className='text-xl font-medium tracking-wider mb-8'>
          Search results for <span className='text-base-content'>{searchQuery}</span>
        </p>
      )}
      {searchQuery && services.length === 0 && (
        <p className='text-xl font-medium tracking-wider mb-8'>
          No search results for <span className='text-base-content'>{searchQuery}</span>
        </p>
      )}

      <div className='flex flex-col md:flex-row mb-5 flex-wrap items-center '>
        <div className='mb-2 md:mb-0 flex-1'>
          <button
            onClick={() => setView(1)}
            className={`px-2 py-1.5 text-xs rounded-full ${
              view === 1 ? 'bg-primary text-primary' : 'bg-transparent text-base-content'
            }`}>
            List View
          </button>
          <button
            onClick={() => setView(2)}
            className={`px-2 py-1.5 text-xs rounded-full ml-2 ${
              view === 2 ? 'bg-primary text-primary' : 'bg-transparent text-base-content'
            }`}>
            Table View
          </button>

          <button className='px-4 py-2 rounded-full ml-auto hidden text-base-content border mr-2'>
            Filter
          </button>
        </div>

        <button className='hidden px-4 py-2 rounded-full ml-auto text-base-content border mr-2'>
          Filter
        </button>

        <div className='mt-2 md:mt-0 flex justify-end'>
          <SearchServiceButton value={searchQuery} />
        </div>
      </div>

      {view === 1 &&
        services.map((service: IService, i: number) => (
          <ServiceItem
            service={service}
            embedded={router.asPath.includes('embed/')}
            key={i}
            view={view}
          />
        ))}

      {view === 2 && (
        <table className='min-w-full text-center'>
          <thead>
            <tr className='bg-primary text-primary'>
              <th className='border border-info p-2'>Title</th>
              <th className='border border-info p-2'>Date</th>
              <th className='border border-info p-2'>Rate</th>
              <th className='border border-info p-2'>View</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service: IService, i: number) => (
              <ServiceItem
                service={service}
                embedded={router.asPath.includes('embed/')}
                key={i}
                view={view}
              />
            ))}
          </tbody>
        </table>
      )}

      {services.length > 0 && hasMoreData && !loading && (
        <div className='flex justify-center items-center gap-10 flex-col pb-5'>
          <button
            type='submit'
            className={`px-5 py-2 mt-5 content-center border-2 text-base-content border-black rounded-xl font-medium text-content 
                `}
            disabled={!hasMoreData}
            onClick={() => loadMore()}>
            Load More Posts
          </button>
        </div>
      )}
      {loading && (
        <div className='flex justify-center items-center gap-10 flex-col pb-5 mt-5'>
          <Loading />
        </div>
      )}
    </>
  );
}

export default ServiceList;
