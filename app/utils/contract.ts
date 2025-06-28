import { BCS, getRustConfig } from '@benfen/bcs';
import { ethers } from 'ethers';
import { createPublicClient, createWalletClient, custom } from 'viem';
import { publicActionsL2, walletActionsL2 } from 'viem/op-stack';
import { abi } from '../../contracts/UmiMeme.json';
import { umiDevnet } from '@/config';

const MEME_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

if (!MEME_CONTRACT_ADDRESS) {
  throw new Error('Contract address is not defined');
}

const bcs = new BCS(getRustConfig());
bcs.registerEnumType('SerializableTransactionData', {
  EoaBaseTokenTransfer: '',
  ScriptOrDeployment: '',
  EntryFunction: '',
  L2Contract: '',
  EvmContract: 'Vec<u8>',
});

const serializeFunction = (data: string): `0x${string}` => {
  const code = Uint8Array.from(Buffer.from(data.replace('0x', ''), 'hex'));
  const evmContract = bcs.ser('SerializableTransactionData', { EvmContract: code });
  return `0x${evmContract.toString('hex')}`;
};

export const getAccount = async () => {
  const [account] = await window.ethereum!.request({
    method: 'eth_requestAccounts',
  });
  return account;
};

export const publicClient = () =>
  createPublicClient({
    chain: umiDevnet,
    transport: custom(window.ethereum!),
  }).extend(publicActionsL2());

export const walletClient = () =>
  createWalletClient({
    chain: umiDevnet,
    transport: custom(window.ethereum!),
  }).extend(walletActionsL2());

export const getFunction = async (name: string, args: any[] = []) => {
  const contract = new ethers.Contract(MEME_CONTRACT_ADDRESS, abi);
  const tx = await contract.getFunction(name).populateTransaction(...args);
  return { to: tx.to as `0x${string}`, data: serializeFunction(tx.data) };
};

export const submitMeme = async (ipfsCid: string) => {
  try {
    const { to, data } = await getFunction('submitMeme', [ipfsCid]);
    const hash = await walletClient().sendTransaction({ 
      account: await getAccount(), 
      to, 
      data,
      value: ethers.parseEther('0.00001') // SUBMISSION_FEE from contract
    });
    const receipt = await publicClient().waitForTransactionReceipt({ hash });
    return receipt;
  } catch (error) {
    console.error('Error submitting meme:', error);
    throw error;
  }
};

export interface Meme {
  tokenId: bigint;
  creator: string;
  ipfsCid: string;
  contestId: bigint;
  totalStake: bigint;
  isWinner: boolean;
  timestamp: bigint;
}

export const getCurrentContest = async () => {
  try {
    const { to, data } = await getFunction('getCurrentContest');
    const response = await publicClient().call({ to, data });
    if (!response.data) throw Error('No data found');
    console.log('Current contest:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting current contest:', error);
    throw error;
  }
};

export const getMemesByContest = async (contestId: bigint) => {
  try {
    const { to, data } = await getFunction('getMemesByContest', [contestId]);
    const response = await publicClient().call({ to, data });
    if (!response.data) throw Error('No data found');
    console.log('Memes for contest', contestId.toString(), ':', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting memes by contest:', error);
    throw error;
  }
};

export const getMemeDetails = async (tokenId: bigint): Promise<Meme | null> => {
  try {
    const { to, data } = await getFunction('memes', [tokenId]);
    const response = await publicClient().call({ to, data });
    
    if (!response.data) {
      console.log('No data returned for token:', tokenId.toString());
      return null;
    }

    // Convert the response data to a hex string if it's not already
    const hexData = Array.isArray(response.data) 
      ? '0x' + Array.from(response.data).map(b => b.toString(16).padStart(2, '0')).join('')
      : response.data;
    
    console.log('Processing data for token:', {
      tokenId: tokenId.toString(),
      rawData: response.data,
      hexData
    });
    
    // Use ethers Contract to decode the response
    const contract = new ethers.Contract(MEME_CONTRACT_ADDRESS, abi);
    const iface = contract.interface;
    
    try {
      const decoded = iface.decodeFunctionResult('memes', hexData);
      const memeData = {
        tokenId: decoded[0]?.toString(),
        creator: decoded[1],
        ipfsCid: decoded[2],
        contestId: decoded[3]?.toString(),
        totalStake: decoded[4]?.toString(),
        isWinner: decoded[5],
        timestamp: decoded[6]?.toString()
      };
      
      console.log('Decoded meme data:', memeData);
      
      // Check if the token exists (non-zero values)
      if (memeData.creator === '0x0000000000000000000000000000000000000000') {
        console.log('Token does not exist:', tokenId.toString());
        return null;
      }
      
      const meme = {
        tokenId,
        creator: memeData.creator as string,
        ipfsCid: memeData.ipfsCid as string,
        contestId: BigInt(memeData.contestId || '0'),
        totalStake: BigInt(memeData.totalStake || '0'),
        isWinner: Boolean(memeData.isWinner),
        timestamp: BigInt(memeData.timestamp || '0')
      };
      
      // Validate the meme data
      if (!meme.ipfsCid || meme.ipfsCid.trim() === '') {
        console.log('Invalid meme data - empty IPFS CID:', {
          tokenId: tokenId.toString(),
          memeData,
          meme
        });
        return null;
      }
      
      return meme;
    } catch (decodeError: unknown) {
      console.log('Error decoding meme data:', {
        error: decodeError,
        tokenId: tokenId.toString(),
        hexData,
        rawResponse: response.data
      });
      return null;
    }
  } catch (error) {
    console.log('Error getting meme details:', {
      error,
      tokenId: tokenId.toString()
    });
    return null;
  }
};