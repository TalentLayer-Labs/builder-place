import React, { useContext, useEffect, useState } from 'react';
import BuilderPlaceContext from '../modules/BuilderPlace/context/BuilderPlaceContext';
import { useRouter } from 'next/router';
import useFilteredServices from '../hooks/useFilteredServices';
import { IService, IToken, ServiceStatusEnum } from '../types';
import Loading from './Loading';
import ServiceItem from './ServiceItem';
import SearchServiceButton from './Form/SearchServiceButton';
import useAllowedTokens from '../hooks/useAllowedTokens';
import { calculateTokenAmount } from '../utils/conversion';
import ServiceFilterPopup from './ServiceFilterPopup'; // Import the new component

function ServiceList() {
  const { builderPlace } = useContext(BuilderPlaceContext);
  const PAGE_SIZE = 30;
  const router = useRouter();
  const allowedTokens = useAllowedTokens();
  const query = router.query;
  const searchQuery = query.search as string;
  const [view, setView] = useState(1);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [minRate, setMinRate] = useState<string>('');
  const [maxRate, setMaxRate] = useState<string>('');
  const [selectedTokens, setSelectedTokens] = useState<string[]>(['0x2d7882bedcbfddce29ba99965dd3cdf7fcb10a1e']);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [filteredServices, setFilteredServices] = useState<IService[]>([]);
  const array: string[] = ["0x2d7882bedcbfddce29ba99965dd3cdf7fcb10a1e","0xe9dce89b076ba6107bb64ef30678efec11939234"];
  const { hasMoreData, services, loading, loadMore } = useFilteredServices(
    ServiceStatusEnum.Opened,
    builderPlace?.owner?.talentLayerId?.toString(),
    undefined,
    searchQuery?.toLocaleLowerCase(),
    PAGE_SIZE,
    selectedTokens,
  );

  useEffect(() => {
    setFilteredServices(() => {
      return services.filter(service => {
        console.log('service', service);  
        if (minRate || maxRate || selectedTokens.length > 0 || selectedRatings.length > 0) {
          // const tokenSelected =
          //   selectedTokens.length === 0 ||
          //   selectedTokens.includes(service.description?.rateToken || '');
          if (service.description?.rateAmount) {
            const rate = parseFloat(service.description.rateAmount);
            const token = allowedTokens.find(
              token => token.address === service.description?.rateToken,
            );
            if (token) {
              const convertedRate = parseFloat(
                calculateTokenAmount(token, service.description?.rateAmount),
              );
              const minRateParsed = parseFloat(minRate || '0');
              const maxRateParsed = parseFloat(maxRate || 'Infinity');
              const ratingSelected =
                selectedRatings.length === 0 ||
                selectedRatings.includes(service.buyer?.rating || '');
              return (
                convertedRate >= minRateParsed &&
                convertedRate <= maxRateParsed &&
                // tokenSelected &&
                ratingSelected
              );
            } else {
              return false;
            }
          }
        } else {
          return true;
        }
      });
    });
  }, [services, minRate, maxRate, allowedTokens, selectedTokens, selectedRatings]);
  
  const handleResetFilter = () => {
    setMinRate('');
    setMaxRate('');
    setSelectedTokens([]);
    setSelectedRatings([]);
    setPopupVisible(false);
  };

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

      <div className='flex flex-col md:flex-row mb-5'>
        <div className='flex mb-2 md:mb-0'>
          <button
            onClick={() => setView(1)}
            className={`px-4 py-2 rounded-full ${
              view === 1 ? 'bg-primary text-primary' : 'bg-transparent text-base-content'
            }`}>
            List View
          </button>
          <button
            onClick={() => setView(2)}
            className={`px-4 py-2 rounded-full ml-2 ${
              view === 2 ? 'bg-primary text-white' : 'bg-transparent text-base-content'
            }`}>
            Table View
          </button>

          <button
            className='px-4 py-2 rounded-full ml-auto md:hidden text-base-content border mr-2'
            onClick={() => setPopupVisible(!isPopupVisible)}
          >
            Filter
          </button>
        </div>

        {/* Filter */}
        <div className='relative ml-auto'>
          <button
            className='hidden md:block px-4 py-2 rounded-full ml-auto text-base-content border mr-2'
            onClick={() => setPopupVisible(!isPopupVisible)}
          >
            Filter
          </button>
          {isPopupVisible && (
            <ServiceFilterPopup
              minRate={minRate}
              maxRate={maxRate}
              selectedTokens={selectedTokens}
              selectedRatings={selectedRatings}
              setMinRate={setMinRate}
              setMaxRate={setMaxRate}
              setSelectedTokens={setSelectedTokens}
              setSelectedRatings={setSelectedRatings}
              handleResetFilter={handleResetFilter}
            />
          )}
        </div>

        <div className='mt-2 md:mt-0 md:mr-2'>
          <SearchServiceButton value={searchQuery} />
        </div>
      </div>

      {view === 1 && (
        <>
          {filteredServices.length > 0 ? (
            filteredServices.map((service: IService, i: number) => (
              <ServiceItem
                service={service}
                embedded={router.asPath.includes('embed/')}
                key={i}
                view={view}
              />
            ))
          ) : (
            <p className='text-xl text-base-content font-medium tracking-wider flex justify-center items-center'>
              No services found
            </p>
          )}
        </>
      )}

      {view === 2 && (
        <table className='min-w-full text-center'>
          <thead>
            <tr className='bg-primary text-primary'>
              <th className='border border-gray-300 p-2'>Title</th>
              <th className='border border-gray-300 p-2'>Date</th>
              <th className='border border-gray-300 p-2'>Rate</th>
              <th className='border border-gray-300 p-2'>Work</th>
              <th className='border border-gray-300 p-2'>View</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.length > 0 ? (
              filteredServices.map((service: IService, i: number) => (
                <ServiceItem
                  service={service}
                  embedded={router.asPath.includes('embed/')}
                  key={i}
                  view={view}
                />
              ))
            ) : (
              <span className='text-xl text-base-content font-medium tracking-wider flex justify-center items-center'>
                No services found
              </span>
            )}
          </tbody>
        </table>
      )}

      {filteredServices.length > 0 && hasMoreData && !loading && (
        <div className='flex justify-center items-center gap-10 flex-col pb-5'>
          <button
            type='submit'
            className={`px-5 py-2 mt-5 content-center border-2 text-base-content border-black rounded-xl font-medium text-content 
                  `}
            disabled={!hasMoreData}
            onClick={() => loadMore()}
          >
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

