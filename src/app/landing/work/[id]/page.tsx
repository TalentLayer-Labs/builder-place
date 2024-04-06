'use client';

import { useRouter } from 'next/router';
import Loading from '../../../../components/Loading';
import ServiceDetail from '../../../../components/ServiceDetail';
import useServiceById from '../../../../hooks/useServiceById';

export default function WorkPage() {
  const router = useRouter();
  const { id } = router.query;
  const { service, isLoading } = useServiceById(id as string);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className='max-w-7xl mx-auto text-base-content mt-10 p-4'>
      <div className='-mx-6 -mt-6 sm:mx-0 sm:mt-0'>
        <p className='flex py-2 items-center text-2xl font-bold tracking-wider mb-6 w-full px-6 sm:px-0 mt-6 '>
          mission
        </p>
      </div>
      {service ? <ServiceDetail service={service} /> : <Loading />}
    </div>
  );
}
