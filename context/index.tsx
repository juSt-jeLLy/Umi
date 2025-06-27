'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'

// Ethereum window type
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeAllListeners: () => void;
      [key: string]: any;
    };
  }
}

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balance: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  isConnecting: false,
  address: null,
  balance: null,
  connect: async () => {},
  disconnect: () => {},
  error: null,
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to update balance
  const updateBalance = async (addr: string) => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(addr);
      setBalance(ethers.formatEther(balance));
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  // Function to check if we're on Umi Devnet
  const checkAndSwitchNetwork = async () => {
    try {
      const chainId = await window.ethereum?.request({ method: 'eth_chainId' });
      if (chainId !== '0xA455') { // 42069 in hex
        await window.ethereum?.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xA455' }],
        });
      }
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to Rabby
      if (switchError?.code === 4902) {
        try {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xA455',
              chainName: 'Umi Devnet',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://devnet.moved.network'],
              blockExplorerUrls: ['https://devnet.explorer.moved.network']
            }]
          });
          return true;
        } catch (addError) {
          setError('Failed to add Umi network to wallet');
          return false;
        }
      } else {
        setError('Failed to switch to Umi network');
        return false;
      }
    }
  };

  // Initialize connection state from localStorage
  const initializeConnection = async () => {
    try {
      if (!window.ethereum) return;

      const savedAddress = localStorage.getItem('walletAddress');
      if (!savedAddress) return;

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
        const currentAddress = accounts[0];
        const networkSwitched = await checkAndSwitchNetwork();
        if (networkSwitched) {
          setAddress(currentAddress);
          await updateBalance(currentAddress);
          setIsConnected(true);
        }
      }
    } catch (err) {
      console.error('Error initializing connection:', err);
    }
  };

  const connect = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Check if Rabby is installed
      if (!window.ethereum) {
        window.open('https://rabby.io/', '_blank');
        throw new Error('Please install Rabby Wallet');
      }

      // Force wallet connection request
      const accounts = await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      }).then(() => window.ethereum?.request({ 
        method: 'eth_requestAccounts'
      }));
      
      if (accounts && accounts.length > 0) {
        const currentAddress = accounts[0];
        
        // Ensure we're on the right network
        const networkSwitched = await checkAndSwitchNetwork();
        if (!networkSwitched) {
          throw new Error('Failed to switch to Umi network');
        }

        await updateBalance(currentAddress);
        setAddress(currentAddress);
        setIsConnected(true);
        
        // Save the connection state
        localStorage.setItem('walletAddress', currentAddress);
      }
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      setIsConnected(false);
      setAddress(null);
      setBalance(null);
      localStorage.removeItem('walletAddress');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance(null);
    setError(null);
    localStorage.removeItem('walletAddress');
  };

  // Initialize connection and set up event listeners
  useEffect(() => {
    initializeConnection();

    if (window.ethereum) {
      // Handle account changes
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          const newAddress = accounts[0];
          setAddress(newAddress);
          localStorage.setItem('walletAddress', newAddress);
          await updateBalance(newAddress);
        }
      });

      // Handle chain changes
      window.ethereum.on('chainChanged', async () => {
        if (address) {
          const networkSwitched = await checkAndSwitchNetwork();
          if (networkSwitched) {
            await updateBalance(address);
          }
        }
      });

      // Handle disconnect
      window.ethereum.on('disconnect', () => {
        disconnect();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [address]);

  return (
    <WalletContext.Provider 
      value={{ 
        isConnected, 
        isConnecting,
        address, 
        balance, 
        connect, 
        disconnect,
        error
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export default WalletProvider 