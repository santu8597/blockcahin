// pages/nfts.tsx
'use client';

import NFTViewer from '@/components/utils/nft-viewer';
import { useState } from 'react';

export default function NFTPage() {
  const [address, setAddress] = useState('');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <input
        type="text"
        placeholder="Enter wallet address"
        className="border p-2 w-full mb-4 rounded"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      {address && <NFTViewer owner={address} />}
    </div>
  );
}
