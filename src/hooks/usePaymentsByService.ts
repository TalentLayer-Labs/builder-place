import { useEffect, useState } from 'react';
import { getPaymentsByService } from '../queries/payments';
import { IPayment, PaymentTypeEnum } from '../types';
import { useChainId } from './useChainId';

const usePaymentsByService = (
  id: string,
  paymentType?: PaymentTypeEnum,
): { payments: IPayment[]; refreshPayments: () => Promise<void> } => {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const chainId = useChainId();

  const fetchData = async () => {
    try {
      const response = await getPaymentsByService(chainId, id, paymentType);

      if (response?.data?.data?.payments) {
        setPayments(response.data.data.payments);
      }
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [id]);

  return { payments, refreshPayments: fetchData };
};

export default usePaymentsByService;
