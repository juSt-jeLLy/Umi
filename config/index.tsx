import { cookieStorage, createStorage } from '@wagmi/core'
import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { type Chain } from 'viem'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Define Umi Devnet
export const umiDevnet = {
  id: 42069,
  name: 'Umi Devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { 
      http: ['https://devnet.moved.network']
    },
    public: { 
      http: ['https://devnet.moved.network']
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://devnet.explorer.moved.network',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1,
    },
  }
} as const satisfies Chain

// Create wagmi config
export const config = createConfig({
  chains: [umiDevnet, mainnet],
  transports: {
    [umiDevnet.id]: http(),
    [mainnet.id]: http(),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
}) 