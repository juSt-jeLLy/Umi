"use client";

import { useState, useEffect } from 'react';
import { getCurrentContest, getMemesByContest, getMemeDetails, type Meme } from '../utils/contract';
import MemeCard from '../components/MemeCard';
import { toast, Toaster } from 'react-hot-toast';

export default function MemePool() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        // Get current contest
        const contest = await getCurrentContest();
        console.log('Current contest data:', contest);
        const contestId = BigInt(contest[0]); // contestId is the first field
        console.log('Current contest ID:', contestId.toString());

        // Get memes for current contest
        const memeIds = await getMemesByContest(contestId);
        console.log('Meme IDs:', memeIds);
        
        // Ensure memeIds is an array and contains valid IDs
        if (!Array.isArray(memeIds) || memeIds.length === 0) {
          console.log('No meme IDs found for contest:', contestId.toString());
          setMemes([]);
          return;
        }

        // Create a Set to track processed IDs
        const processedIds = new Set<string>();
        const validMemes: Meme[] = [];
        const errors: Array<{ id: string; error: string }> = [];

        // Fetch details for each meme
        for (const id of memeIds) {
          try {
            const idStr = id.toString();
            // Skip if we've already processed this ID
            if (processedIds.has(idStr)) {
              console.log('Skipping duplicate meme ID:', idStr);
              continue;
            }
            processedIds.add(idStr);

            console.log('Fetching meme details for ID:', idStr);
            const meme = await getMemeDetails(BigInt(id));
            
            // Only add valid memes
            if (meme) {
              validMemes.push(meme);
              console.log('Added valid meme:', meme);
            } else {
              console.log('Skipped invalid or non-existent meme:', idStr);
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Error fetching meme ${id}:`, error);
            errors.push({ id: id.toString(), error: errorMessage });
          }
        }
        
        console.log('Valid memes found:', validMemes.length);
        if (errors.length > 0) {
          console.warn('Errors encountered:', errors);
          toast.error(`Some memes failed to load (${errors.length} errors)`);
        }
        
        // Sort memes by total stake (highest first) and timestamp (newest first)
        const sortedMemes = validMemes.sort((a, b) => {
          const stakeDiff = Number(b.totalStake - a.totalStake);
          if (stakeDiff !== 0) return stakeDiff;
          return Number(b.timestamp - a.timestamp);
        });
        
        setMemes(sortedMemes);
      } catch (error) {
        console.error('Error fetching memes:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load memes';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMemes();
  }, []);

  const handleStake = async (meme: Meme) => {
    // TODO: Implement staking functionality
    toast.error('Staking functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error loading memes:</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" reverseOrder={false} />
      
      <h1 className="text-3xl font-bold mb-8 text-center">Meme Pool</h1>
      
      {memes.length === 0 ? (
        <div className="text-center text-gray-400">
          <p>No memes found in the current contest.</p>
          <p className="mt-2">Be the first to submit a meme!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memes.map((meme) => (
            <MemeCard
              key={`${meme.tokenId.toString()}-${meme.timestamp.toString()}`}
              meme={meme}
              onStake={() => handleStake(meme)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 