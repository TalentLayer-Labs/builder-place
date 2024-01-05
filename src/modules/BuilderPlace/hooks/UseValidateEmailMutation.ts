import { useMutation, useQueryClient } from 'react-query';
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
        return res.json();
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
