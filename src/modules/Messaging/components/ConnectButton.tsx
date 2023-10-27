import { useContext } from 'react';
import MessagingContext from '../context/messging';

function ConnectButton() {
  const { handleRegisterToMessaging } = useContext(MessagingContext);

  return (
    <button
      className='text-primary bg-primary hover:bg-primary-focus px-5 py-2.5 rounded-xl text-md relative'
      onClick={() => handleRegisterToMessaging()}>
      Connect to XMTP
    </button>
  );
}

export default ConnectButton;
