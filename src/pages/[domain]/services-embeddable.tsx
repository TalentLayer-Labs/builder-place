import { useRouter } from 'next/router';
import React from 'react';
import { ServiceStatusEnum } from '../../types';
import ServicesEmbed from './ServicesEmbed';

const ServicesEmbeddable = () => {
  const router = useRouter();

  const boardTitle = (router.query?.title as string) || 'My Gig board';
  const buyerId = (router.query?.buyerId as string) || '0';
  const boardSkill = router.query?.status || 'Opened';
  const boardStatusEnum = ServiceStatusEnum[boardSkill as keyof typeof ServiceStatusEnum];

  return <ServicesEmbed title={boardTitle} buyerId={buyerId} status={boardStatusEnum} />;
};

export default ServicesEmbeddable;
