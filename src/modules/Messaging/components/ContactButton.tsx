import { useContext } from 'react';
import MessagingContext from '../context/messging';

function ContactButton({ userAddress, userHandle }: { userAddress: string; userHandle: string }) {
  const { handleMessageUser } = useContext(MessagingContext);

  return (
    <button
      className='text-primary bg-primary hover:bg-primary-focus px-5 py-2.5 rounded-xl text-md relative'
      onClick={() => {
        handleMessageUser(userAddress);
      }}>
      Contact
    </button>
  );
}

export default ContactButton;
