import { useSearchParams } from 'next/navigation';
import ServiceList from '../../../../components/ServiceList';

const EmbedWork = () => {
  const searchParams = useSearchParams();
  const boardTitle = searchParams?.get('title') || '';

  return (
    <div className={'text-base-content bg-base-200'}>
      <h1 className='text-title text-4xl mb-4 text-center'>{boardTitle}</h1>
      <ServiceList />
    </div>
  );
};

export default EmbedWork;
