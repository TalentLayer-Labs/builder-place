import { useMutation, useQueryClient } from 'react-query';
import { SetWorkerProfileOwner } from '../types';
import { showMongoErrorTransactionToast } from '../../../utils/toast';

export function useSetWorkerProfileOwner() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; id: string; error?: string }, Error, SetWorkerProfileOwner>(
    (updateWorkerProfileData: SetWorkerProfileOwner) =>
      fetch('/api/domain/set-worker-profile-owner', {
        method: 'PUT',
        body: JSON.stringify(updateWorkerProfileData),
        headers: {
          'Content-type': 'application/json',
        },
      }).then(res => {
        // if (res.status === 200 || res.status === 401) {
        return res.json();
        // } else {
        //   res
        //     .json()
        //     .then((data: any) => {
        //       console.log('data', data);
        //       showMongoErrorTransactionToast(data.error);
        //       return data.error;
        //     })
        //     .catch(err => {
        //       throw new Error('Failed to update Worker Profile', err.fileName);
        //     });
        // }
      }),
  );
}
