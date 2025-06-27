import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from '@reown/appkit/networks'
import { createPublicClient, http, type Chain } from 'viem'
import { type AppKitNetwork } from '@reown/appkit'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Define Umi Devnet
export const umiDevnet = {
  id: 42069,
  name: 'Umi Devnet',
  network: 'umi-devnet',
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

// Create public client for Umi Devnet
export const publicClient = createPublicClient({
  chain: umiDevnet,
  transport: http()
})

// Set up networks array with Umi Devnet as primary
export const networks = [umiDevnet, mainnet] as [AppKitNetwork, ...AppKitNetwork[]]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig 