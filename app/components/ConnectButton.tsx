'use client'

import { useWallet } from '@/context';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

export default function ConnectButton() {
  const { isConnected, isConnecting, address, balance, connect, disconnect, error } = useWallet();
  const [showError, setShowError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show error message for 5 seconds when error changes
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {!isConnected ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={connect}
          disabled={isConnecting}
          className={`px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ${
            isConnecting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isConnecting ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Connecting...</span>
            </div>
          ) : (
            'Connect Wallet'
          )}
        </motion.button>
      ) : (
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
          >
            <div className="flex flex-col items-end">
              <span className="text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <span className="text-xs opacity-80">
                {parseFloat(balance || '0').toFixed(4)} ETH
              </span>
            </div>
            <ChevronDownIcon 
              className={`h-4 w-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
            />
          </motion.button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100"
              >
                <div className="py-1">
                  <button
                    onClick={handleDisconnect}
                    className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full mt-2 p-2 bg-red-500 text-white text-sm rounded-md shadow-lg whitespace-nowrap right-0"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
} 