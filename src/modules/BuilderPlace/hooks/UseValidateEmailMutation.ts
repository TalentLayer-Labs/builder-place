import { useMutation, useQueryClient } from 'react-query';
import { showMongoErrorTransactionToast } from '../../../utils/toast';
import { ValidateEmailProps } from '../types';

export function useValidateEmailMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; id: string; error?: string }, Error, ValidateEmailProps>(
    validateEmail =>
      fetch('/api/domain/validate-email', {
        method: 'PUT',
        body: JSON.stringify(validateEmail),
        headers: {
          'Content-type': 'application/json',
        },
      }).then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          res
            .json()
            .then((data: any) => {
              showMongoErrorTransactionToast(data.error);
            })
            .catch(err => {
              throw new Error('Failed to verify email', err);
            });
        }
      }),

    {
      onError: error => {
        throw new Error('Failed to verify builderPlace', error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries('verifyEmail');
      },
    },
  );
}
