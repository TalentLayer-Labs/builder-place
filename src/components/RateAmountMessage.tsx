import { formatUnits } from 'viem';
import { IToken } from '../types';

interface iProps {
  allowedTokenList: IToken[];
  selectTokenAddress: string;
}

function RateAmountMessage({ allowedTokenList, selectTokenAddress }: iProps) {
  const selectToken = allowedTokenList.find(token => token.address === selectTokenAddress);

  if (!selectToken || !selectToken.minimumTransactionAmount) return null;

  const calculatedAmount = formatUnits(
    BigInt(selectToken.minimumTransactionAmount),
    selectToken.decimals,
  );

  return (
    <div>
      <p>
        Minimum Amount: {calculatedAmount.toString()}
        {selectToken.symbol}
      </p>
    </div>
  );
}

export default RateAmountMessage;
