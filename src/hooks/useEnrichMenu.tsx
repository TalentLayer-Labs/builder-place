import { useEffect, useState } from 'react';
import { MenuItem, workerNavigation } from '../components/Layout/navigation';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

const useEnrichMenu = (isPostingAllowed: boolean = false) => {
  const [enrichedWorkerNavigation, setEnrichedWorkerNavigation] =
    useState<MenuItem[]>(workerNavigation);

  useEffect(() => {
    if (isPostingAllowed) {
      const newMissionItem = {
        name: 'new mission',
        href: '/work/create',
        icon: PlusCircleIcon,
        current: false,
      };

      // Check if 'new mission' item already exists to prevent duplicates
      if (!enrichedWorkerNavigation.some(item => item.name === newMissionItem.name)) {
        setEnrichedWorkerNavigation([...workerNavigation, newMissionItem]);
      }
    } else {
      setEnrichedWorkerNavigation(workerNavigation);
    }
  }, [isPostingAllowed]);

  return {
    enrichedWorkerNavigation,
  };
};

export default useEnrichMenu;
