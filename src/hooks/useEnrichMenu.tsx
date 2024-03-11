import { useEffect, useState } from 'react';
import { MenuItem, workerNavigation } from '../components/Layout/navigation';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

const useEnrichMenu = (isPostingAllowed: boolean = false, isWorker: boolean) => {
  const [enrichedWorkerNavigation, setEnrichedWorkerNavigation] =
    useState<MenuItem[]>(workerNavigation);

  useEffect(() => {
    const enrichMenu = async () => {
      if (isWorker && isPostingAllowed) {
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
    };

    enrichMenu();
  }, [isPostingAllowed, isWorker]);

  return {
    enrichedWorkerNavigation,
  };
};

export default useEnrichMenu;
