import { useMutation } from 'react-query';
import { ValidateBuilderPlaceAndOwner } from '../types';
import { showMongoErrorTransactionToast } from '../../../utils/toast';

export function useValidateBuilderPlaceAndOwner() {
  return useMutation<{ message: string; error?: string }, Error, ValidateBuilderPlaceAndOwner>(
    (validateBuilderPlaceAndOwnerData: ValidateBuilderPlaceAndOwner) =>
      fetch('/api/domain/validate-builder-place', {
        method: 'PUT',
        body: JSON.stringify(validateBuilderPlaceAndOwnerData),
        headers: {
          'Content-type': 'application/json',
        },
      }).then(res => {
        // if (res.status === 200) {
        return res.json();
        // } else {
        //   res
        //     .json()
        //     .then((data: any) => {
        //       showMongoErrorTransactionToast(data.error);
        //       return data;
        //     })
        //     .catch(err => {
        //       throw new Error('Failed to validate builderPlace', err.fileName);
        //     });
        // }
      }),
    {
      // onSuccess: (e) => {
      //   queryClient.invalidateQueries([`builder-place-${data.subdomain}`]);
      // },
    },
  );
}
