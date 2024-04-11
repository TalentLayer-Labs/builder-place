'use client';

import { useContext } from 'react';
import BuilderPlaceContext from '../../../../modules/BuilderPlace/context/BuilderPlaceContext';
import CustomMarkdown from '../../../../components/CustomMarkdown';

export default function AboutContent() {
  const { builderPlace } = useContext(BuilderPlaceContext);

  return (
    <div className='markdown-body text-sm text-base-content mt-4'>
      <CustomMarkdown content={builderPlace?.about || ''} />
    </div>
  );
}
