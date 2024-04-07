import { Contact } from '@iexec/web3mail';
import { useEffect, useState } from 'react';
import { Account, Chain, Transport, WalletClient } from 'viem';
import { fetchMyContacts } from '../../../components/request';
import { useChainId } from '../../../hooks/useChainId';
import { getUsersWeb3MailPreference } from '../../../queries/users';
import { EmailNotificationType, IUserDetails } from '../../../types';
import { getUsersNotificationData } from '../../BuilderPlace/request';

export interface IContact {
  id: string;
  name: string;
  address: string;
}
const useFetchMyContacts = (
  emailNotificationType: EmailNotificationType,
  userId: string | undefined,
  builderPlaceId: string | undefined,
  address: `0x${string}` | undefined,
  walletClient: WalletClient<Transport, Chain, Account> | null | undefined,
): {
  fetchData: () => Promise<void>;
  contactsLoaded: boolean;
  fetchFunctionCalled: boolean;
  contacts: IContact[];
} => {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [fetchFunctionCalled, setFetchFunctionCalled] = useState(false);
  const chainId = useChainId();

  const fetchData = async () => {
    setContactsLoaded(false);
    setFetchFunctionCalled(true);

    try {
      // This array has all the users that have granted access to their email to this platform and opted for the platform marketing feature
      let validUsers: IContact[] = [];

      if (
        emailNotificationType === EmailNotificationType.WEB2 &&
        walletClient &&
        userId &&
        builderPlaceId &&
        address
      ) {
        /**
         * @dev Sign message to prove ownership of the address
         */
        const signature = await walletClient.signMessage({
          account: address,
          message: `connect with ${address}`,
        });

        const response = await getUsersNotificationData(
          builderPlaceId,
          userId.toString(),
          'activeOnPlatformMarketing',
          address,
          signature,
        );
        const contactList: { address: string; id: string; name: string }[] = response?.data;

        // Format contacts
        contactList.forEach(contact => {
          validUsers.push({
            id: contact.id,
            name: contact.name,
            address: contact.address,
          });
        });
      }

      if (emailNotificationType === EmailNotificationType.WEB3 && chainId) {
        const response = await fetchMyContacts();
        const contactList: Contact[] = response?.data?.data;

        if (contactList && contactList.length > 0) {
          // This array has all the addresses of the users that have granted access to their email to this platform
          const contactAddresses = contactList.map(contact => contact.owner);

          const userPreferencesResponse = await getUsersWeb3MailPreference(
            Number(chainId),
            contactAddresses,
            'activeOnPlatformMarketing',
          );

          if (
            userPreferencesResponse?.data?.data?.userDescriptions &&
            userPreferencesResponse.data.data.userDescriptions.length > 0
          ) {
            let userDescriptions: IUserDetails[] =
              userPreferencesResponse.data.data.userDescriptions;
            // Only select the latest version of each user metaData
            userDescriptions = userDescriptions.filter(
              userDetails => userDetails.user?.description?.id === userDetails.id,
            );

            // Format contacts
            userDescriptions.forEach(userDescription => {
              validUsers.push({
                id: userDescription.id,
                name: userDescription.user.handle,
                address: userDescription.user.address,
              });
            });
          }
        }
      }

      setContacts(validUsers);
      setContactsLoaded(true);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(error);
      setContactsLoaded(false);
      setFetchFunctionCalled(false);
    }
  };

  useEffect(() => {
    if (emailNotificationType === EmailNotificationType.WEB3) {
      fetchData();
    }
  }, [chainId]);

  return { contacts, contactsLoaded, fetchFunctionCalled, fetchData };
};

export default useFetchMyContacts;
