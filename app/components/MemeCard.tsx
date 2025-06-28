'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatEther } from 'viem';
import type { Meme } from '../utils/contract';

interface MemeCardProps {
  meme: Meme;
  onStake?: () => void;
}

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

export default function MemeCard({ meme, onStake }: MemeCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const imageUrl = `${IPFS_GATEWAY}/${meme.ipfsCid}`;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      {/* Image */}
      <div className="relative aspect-video bg-gray-900">
        {!imageError ? (
          <Image
            src={imageUrl}
            alt="Meme"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            className="object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            Failed to load image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Stats */}
        <div className="flex justify-between items-center text-sm text-gray-400">
          <div>
            Stake: {formatEther(meme.totalStake)} ETH
          </div>
          <div>
            {formatDate(meme.timestamp)}
          </div>
        </div>

        {/* Creator */}
        <div className="mt-2 text-sm text-gray-500 truncate">
          Creator: {meme.creator}
        </div>

        {/* Stake Button */}
        {onStake && (
          <button
            onClick={onStake}
            className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Stake on this Meme
          </button>
        )}
      </div>
    </div>
  );
} 