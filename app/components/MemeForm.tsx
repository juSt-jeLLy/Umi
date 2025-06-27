'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useWallet } from '@/context';
import { toast, Toaster } from 'react-hot-toast';

interface MemeFormData {
  image: File | null;
  caption: string;
  hashtags: string[];
}

export default function MemeForm() {
  const { isConnected } = useWallet();
  const [formData, setFormData] = useState<MemeFormData>({
    image: null,
    caption: '',
    hashtags: [],
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hashtagInput, setHashtagInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cidHash, setCidHash] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (file: File | null) => {
    if (file) {
      if (file.type.startsWith('image/')) {
        setFormData({ ...formData, image: file });
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageChange(file);
  };

  const handleHashtagSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && hashtagInput.trim()) {
      e.preventDefault();
      const newHashtag = hashtagInput.trim().startsWith('#') 
        ? hashtagInput.trim() 
        : `#${hashtagInput.trim()}`;
      
      if (!formData.hashtags.includes(newHashtag)) {
        setFormData({
          ...formData,
          hashtags: [...formData.hashtags, newHashtag],
        });
      }
      setHashtagInput('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      hashtags: formData.hashtags.filter(tag => tag !== tagToRemove),
    });
  };

  const uploadToIPFS = async (file: File, caption: string, hashtags: string[]) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const pinataMetadata = {
        name: 'Umi Meme',
        keyvalues: {
          description: caption,
          hashtags: hashtags.join(','),
          timestamp: new Date().toISOString()
        }
      };

      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to upload to IPFS: ${error}`);
      }

      const data = await response.json();
      return data.IpfsHash;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!formData.image) {
      toast.error('Please upload an image');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Upload to IPFS
      const hash = await uploadToIPFS(formData.image, formData.caption, formData.hashtags);
      setCidHash(hash);
      
      toast.success('Meme uploaded successfully!');
      console.log('IPFS Hash:', hash);
      
      // Reset form after successful submission
      setFormData({ image: null, caption: '', hashtags: [] });
      setPreviewUrl(null);
      
    } catch (error) {
      console.error('Error submitting meme:', error);
      toast.error('Failed to submit meme. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Image Upload Section */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-600 hover:border-purple-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
        />
        {previewUrl ? (
          <div className="relative w-full aspect-video">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewUrl(null);
                setFormData({ ...formData, image: null });
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="text-gray-400">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg">Drag and drop an image, or click to browse</p>
            <p className="text-sm mt-2">Supports: JPG, PNG, GIF</p>
          </div>
        )}
      </div>

      {/* Caption Input */}
      <div>
        <label htmlFor="caption" className="block text-sm font-medium text-gray-300 mb-2">
          Caption
        </label>
        <textarea
          id="caption"
          rows={3}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white"
          placeholder="Add a caption to your meme..."
          value={formData.caption}
          onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
        />
      </div>

      {/* Hashtags Input */}
      <div>
        <label htmlFor="hashtags" className="block text-sm font-medium text-gray-300 mb-2">
          Hashtags
        </label>
        <input
          id="hashtags"
          type="text"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white"
          placeholder="Type a hashtag and press Enter..."
          value={hashtagInput}
          onChange={(e) => setHashtagInput(e.target.value)}
          onKeyDown={handleHashtagSubmit}
        />
        {formData.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.hashtags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-300"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeHashtag(tag)}
                  className="ml-2 text-purple-300 hover:text-white transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          isConnected
            ? isSubmitting
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
        disabled={!isConnected || isSubmitting}
      >
        {isConnected 
          ? isSubmitting 
            ? 'Uploading to IPFS...' 
            : 'Submit Meme'
          : 'Connect Wallet to Submit'}
      </motion.button>
    </form>
  );
} 