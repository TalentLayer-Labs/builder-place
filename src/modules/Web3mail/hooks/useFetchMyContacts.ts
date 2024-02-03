import { useEffect, useState } from 'react';
import { Contact } from '@iexec/web3mail';
import { getUsersWeb3MailPreference } from '../../../queries/users';
import { IUserDetails, NotificationType } from '../../../types';
import { useChainId } from '../../../hooks/useChainId';
import { fetchMyContacts } from '../../../components/request';
import { getUsersAddresses } from '../../BuilderPlace/request';
import { Chain, WalletClient } from 'wagmi';
import { Account, Transport } from 'viem';

const useFetchMyContacts = (
  notificationType: NotificationType,
  userId: string | undefined,
  builderPlaceId: string | undefined,
  address: `0x${string}` | undefined,
  walletClient: WalletClient<Transport, Chain, Account> | null | undefined,
): {
  fetchData: () => Promise<void>;
  contactsLoaded: boolean;
  fetchFunctionCalled: boolean;
  contacts: IUserDetails[];
} => {
  const [contacts, setContacts] = useState<IUserDetails[]>([]);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [fetchFunctionCalled, setFetchFunctionCalled] = useState(false);
  const chainId = useChainId();

  const fetchData = async () => {
    setContactsLoaded(false);
    setFetchFunctionCalled(true);
    let contactAddresses: string[] = [];

    try {
      if (notificationType === NotificationType.WEB2 && walletClient && userId && builderPlaceId) {
        /**
         * @dev Sign message to prove ownership of the address
         */
        const signature = await walletClient.signMessage({
          message: userId,
          account: address,
        });

        const response = await getUsersAddresses(builderPlaceId, userId, signature);
        contactAddresses = response?.addresses;
      }

      if (notificationType === NotificationType.WEB3 && chainId) {
        const response = await fetchMyContacts();
        const contactList: Contact[] = response?.data?.data;

        if (contactList && contactList.length > 0) {
          // This array has all the addresses of the users that have granted access to their email to this platform
          contactAddresses = contactList.map(contact => contact.owner);
        }
      }

      const response = await getUsersWeb3MailPreference(
        Number(chainId),
        contactAddresses,
        'activeOnPlatformMarketing',
      );

      // This array has all the users that have granted access to their email to this platform and opted for the platform marketing feature
      let validUsers: IUserDetails[] = [];

      if (
        response?.data?.data?.userDescriptions &&
        response.data.data.userDescriptions.length > 0
      ) {
        validUsers = response.data.data.userDescriptions;
        // Only select the latest version of each user metaData
        validUsers = validUsers.filter(
          userDetails => userDetails.user?.description?.id === userDetails.id,
        );
        setContacts(validUsers);
      }
      setContactsLoaded(true);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(error);
      setContactsLoaded(false);
      setFetchFunctionCalled(false);
    }
  };

  useEffect(() => {
    if (notificationType === NotificationType.WEB3) {
      fetchData();
    }
  }, [chainId]);

  return { contacts, contactsLoaded, fetchFunctionCalled, fetchData };
};

export default useFetchMyContacts;
