/* eslint-disable no-console */
import axios from 'axios';
import { ICreateService } from '../app/api/delegate/service/route';
import { IUpdateService } from '../app/api/delegate/service/[id]/route';
import { ICreateProposal } from '../app/api/delegate/proposal/route';
import { IUpdateProposal } from '../app/api/delegate/proposal/[id]/route';
import { IExecutePayment } from '../app/api/delegate/payment/route';
import { IReview } from '../app/api/delegate/review/route';

export const delegateCreateService = async (body: ICreateService): Promise<any> => {
  try {
    return await axios.post('/api/delegate/service', {
      chainId: body.chainId,
      userId: body.userId,
      userAddress: body.userAddress,
      cid: body.cid,
      platformId: body.platformId,
      signature: body.signature,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const delegateUpdateService = async (
  body: IUpdateService,
  serviceId: string,
): Promise<any> => {
  try {
    return await axios.put(`/api/delegate/service/${serviceId}`, {
      chainId: body.chainId,
      userId: body.userId,
      userAddress: body.userAddress,
      cid: body.cid,
      signature: body.signature,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const delegateUpdateProfileData = async (
  chainId: number,
  userId: string,
  userAddress: string,
  cid: string,
): Promise<any> => {
  try {
    return await axios.post('/api/delegate/update-profile-data', {
      chainId,
      userId,
      userAddress,
      cid,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const delegateCreateProposal = async (body: ICreateProposal): Promise<any> => {
  try {
    return await axios.post('/api/delegate/proposal', {
      chainId: body.chainId,
      userId: body.userId,
      userAddress: body.userAddress,
      serviceId: body.serviceId,
      rateToken: body.rateToken,
      rateAmount: body.rateAmount,
      expirationDate: body.expirationDate,
      cid: body.cid,
      platformId: body.platformId,
      signature: body.signature,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const delegateUpdateProposal = async (
  body: IUpdateProposal,
  proposalId: string,
): Promise<any> => {
  try {
    return await axios.put(`/api/delegate/proposal/${proposalId}`, {
      chainId: body.chainId,
      userId: body.userId,
      userAddress: body.userAddress,
      rateToken: body.rateToken,
      rateAmount: body.rateAmount,
      expirationDate: body.expirationDate,
      cid: body.cid,
      signature: body.signature,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const delegateCreateOrUpdateProposal = async (
  chainId: number,
  userId: string,
  userAddress: string,
  serviceId: string,
  valuesRateToken: string,
  parsedRateAmountString: string,
  cid: string,
  convertExpirationDateString: string,
  existingProposalStatus?: string,
): Promise<any> => {
  try {
    return await axios.post('/api/delegate/create-update-proposal', {
      chainId,
      userId,
      userAddress,
      serviceId,
      valuesRateToken,
      parsedRateAmountString,
      cid,
      convertExpirationDateString,
      existingProposalStatus,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const delegateReleaseOrReimburse = async (
  chainId: number,
  userAddress: string,
  userId: string,
  transactionId: number,
  amount: string,
  isBuyer: boolean,
): Promise<any> => {
  try {
    return await axios.post('/api/delegate/release-reimburse', {
      chainId,
      userAddress,
      userId,
      transactionId,
      amount,
      isBuyer,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const delegatePayment = async (body: IExecutePayment): Promise<any> => {
  try {
    return await axios.post('/api/delegate/payment', {
      chainId: body.chainId,
      userAddress: body.userAddress,
      userId: body.userId,
      transactionId: body.transactionId,
      amount: body.amount,
      isBuyer: body.isBuyer,
      signature: body.signature,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const delegateMintReview = async (
  chainId: number,
  userId: string,
  userAddress: string,
  serviceId: string,
  uri: string,
  valuesRating: number,
): Promise<any> => {
  try {
    return await axios.post('/api/delegate/mint-review', {
      chainId,
      userId,
      userAddress,
      serviceId,
      uri,
      valuesRating,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};
export const delegateReview = async (body: IReview): Promise<any> => {
  try {
    return await axios.post('/api/delegate/review', {
      chainId: body.chainId,
      userId: body.userId,
      userAddress: body.userAddress,
      serviceId: body.serviceId,
      uri: body.cid,
      rating: body.rating,
      signature: body.signature,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const delegateMintID = async (
  chainId: number,
  handle: string,
  handlePrice: string,
  userAddress: string,
  platformId: string,
  signature: string,
  addDelegateAndTransferId = false,
): Promise<any> => {
  try {
    return await axios.post('/api/delegate/user', {
      chainId,
      handle,
      handlePrice,
      userAddress,
      platformId,
      signature,
      addDelegateAndTransferId,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const delegatePlatformMint = async (
  platformName: string,
  address: string,
  userTalentLayerId: string,
  chainId: number,
  signature: `0x${string}` | Uint8Array,
): Promise<any> => {
  try {
    return await axios.post('/api/delegate/platform', {
      platformName,
      address,
      userTalentLayerId,
      chainId,
      signature,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const sendPlatformMarketingWeb3mail = async (
  emailSubject: string,
  emailContent: string,
  usersAddresses: string[],
  builderPlaceId: string,
  address: `0x${string}`,
  signature: string,
): Promise<any> => {
  try {
    return await axios.post('/api/email/platform-marketing', {
      emailSubject: emailSubject,
      emailContent: emailContent,
      usersAddresses: usersAddresses,
      builderPlaceId: builderPlaceId,
      address: address,
      signature: signature,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchMyContacts = async (): Promise<any> => {
  try {
    return await axios.post('/api/email/fetch-my-contacts');
  } catch (err) {
    console.error(err);
    throw err;
  }
};
