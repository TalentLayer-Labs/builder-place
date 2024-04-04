import { useEffect, useState } from 'react';
import { fetchEmailAmount } from '../components/request';
import { EmailStats } from '../../../types';

const useEmailStats = (): { emailStats: EmailStats; loading: boolean } => {
  const [emailStats, setEmailStats] = useState<EmailStats>({
    totalSent: 0,
    totalSentByMonth: [],
    totalSentThisMonth: 0,
    totalContact: 0,
    totalCronRunning: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (loading) return;
        setLoading(true);
        const response = await fetchEmailAmount();
        const emailStats: EmailStats = response?.data?.data;
        setEmailStats(emailStats);
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { emailStats, loading };
};

export default useEmailStats;
