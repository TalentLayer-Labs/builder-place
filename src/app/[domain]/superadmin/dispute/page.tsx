import { useContext, useEffect, useState } from 'react';
import { formatEther } from 'viem';
import * as Yup from 'yup';
import SingleValueForm from '../../../../components/Form/SingleValueForm';
import UserNeedsMoreRights from '../../../../components/UserNeedsMoreRights';
import TalentLayerArbitrator from '../../../../contracts/ABI/TalentLayerArbitrator.json';
import TalentLayerPlatformID from '../../../../contracts/ABI/TalentLayerPlatformID.json';
import { useConfig } from '../../../../hooks/useConfig';
import usePlatform from '../../../../hooks/usePlatform';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import BuilderPlaceContext from '../../../../modules/BuilderPlace/context/BuilderPlaceContext';
import { ZERO_ADDRESS } from '../../../../utils/constant';

function AdminDispute() {
  const { builderPlace, isBuilderPlaceOwner } = useContext(BuilderPlaceContext);
  const config = useConfig();
  const platform = usePlatform(builderPlace?.talentLayerPlatformId);
  const [arbitratorPrice, setArbitratorPrice] = useState<number>(0);
  let availableArbitrators: { value: string; label: string }[] = [];
  const talentLayerClient = useTalentLayerClient();

  const fetchArbitrationPrice = async () => {
    if (talentLayerClient) {
      try {
        const _price = await talentLayerClient.disputes.getArbitrationCost();
        setArbitratorPrice(_price);
      } catch (e) {
        console.error(e);
        setArbitratorPrice(0);
      }
    }
  };

  useEffect(() => {
    fetchArbitrationPrice();
  }, [platform?.id, talentLayerClient, platform, config]);

  if (!isBuilderPlaceOwner) {
    return <UserNeedsMoreRights />;
  }

  if (config) {
    availableArbitrators = [
      {
        value: config.contracts.talentLayerArbitrator,
        label: 'TalentLayer Arbitrator',
      },
      { value: ZERO_ADDRESS, label: 'None' },
    ];
  }

  return (
    <div className='max-w-7xl mx-auto text-base-content'>
      <div className=' -mx-6 -mt-6 '>
        <div className='flex py-2 px-6 items-center border-b w-full border-info mb-8'>
          <p className='text-2xl font-bold flex-1 mt-6'>Dispute strategy</p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 border border-info rounded-xl p-6 bg-base-100'>
        <SingleValueForm
          validationData={{
            valueType: 'select',
            initialValue: platform?.arbitrator || ZERO_ADDRESS,
            selectOptions: availableArbitrators,
          }}
          contractParams={{
            contractFunctionName: 'updateArbitrator',
            contractAddress: config.contracts.talentLayerPlatformId,
            contractAbi: TalentLayerPlatformID.abi,
            contractEntity: 'platform',
            contractInputs: builderPlace?.talentLayerPlatformId,
          }}
          valueName={'Choose your dispute strategy'}
          callback={fetchArbitrationPrice}
        />

        <SingleValueForm
          validationData={{
            validationSchema: Yup.object({
              'Arbitration fee timeout (in seconds)': Yup.number().required('value is required'),
            }),
            valueType: 'number',
            initialValue: platform?.arbitrationFeeTimeout || 0,
          }}
          contractParams={{
            contractFunctionName: 'setFeeTimeout',
            contractAddress: config.contracts.talentLayerPlatformId,
            contractAbi: TalentLayerPlatformID.abi,
            contractEntity: 'platform',
            contractInputs: process.env.NEXT_PUBLIC_PLATFORM_ID,
          }}
          valueName={'Arbitration fee timeout (in seconds)'}
        />

        <SingleValueForm
          validationData={{
            validationSchema: Yup.object({
              'Arbitration price (in Matic)': Yup.number().required('value is required'),
            }),
            valueType: 'number',
            initialValue: arbitratorPrice ? formatEther(BigInt(arbitratorPrice)) : 0,
          }}
          contractParams={{
            contractFunctionName: 'setPrice',
            contractAddress: config.contracts.talentLayerArbitrator,
            contractAbi: TalentLayerArbitrator.abi,
            contractEntity: 'disputes',
            contractInputs: builderPlace?.talentLayerPlatformId,
          }}
          valueName={'Arbitration price (in Matic)'}
        />
      </div>
    </div>
  );
}

export default AdminDispute;
