import ServiceList from '../../components/ServiceList';
import OrganizationHeader from '../../components/OrganizationHeader';

export default function BuilderPlaceHome() {
  return (
    <div className='max-w-7xl mx-auto text-base-content'>
      <OrganizationHeader />

      <div className='-mx-6 -mt-6 sm:mx-0 sm:mt-0'>
        <div className='flex py-2 px-6 sm:px-0 justify-center items-center text-center w-full mb-3'>
          <p className='text-2xl sm:text-4xl font-bold mt-12'>missions</p>
        </div>
      </div>
      <ServiceList />
    </div>
  );
}
