// components/NFTViewer.tsx
'use client';

import { useEffect, useState } from 'react';

interface NFT {
  tokenUri: {gateway:string};
  contract: { address: string };
  id: { tokenId: string };
  title: string;
  media: { gateway: string }[];
}

export default function NFTViewer({ owner }: { owner: string }) {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!owner) return;

    const fetchNFTs = async () => {
      setLoading(true);
      const baseURL = process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL;
      const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
      const url = `${baseURL}/${apiKey}/getNFTs?owner=${owner}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        console.log('NFTs:', data);
        setNFTs(data.ownedNfts || []);
      } catch (err) {
        console.error('Failed to fetch NFTs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [owner]);
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">NFTs Owned by {owner.slice(0, 6)}...</h2>
      {loading ? (
        <p>Loading NFTs...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {nfts.map((nft, idx) => (
            <div key={idx} className="border p-4 rounded-lg shadow">
              <img
                src={nft?.tokenUri?.gateway || '/placeholder.png'}
                alt={nft.title || `Token ${nft.id.tokenId}`}
                className="w-full h-60 object-cover rounded"
              />
              <h3 className="mt-2 font-semibold">{nft.title || `Token ${nft.id.tokenId.slice(0, 6)}...${nft.id.tokenId.slice(-3)}`}</h3>
              <p className="text-sm text-gray-500 break-all">
                Contract: {nft.contract.address.slice(0, 6)}...{nft.contract.address.slice(-4)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
