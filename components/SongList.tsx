'use client'

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Queue from './Queue';

const SongList = ({ spaceId }: { spaceId: string }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const res = await fetch(`/api/space/streams/create?spaceId=${spaceId}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch streams');
        }

        setData(data); 
        console.log(data); 
      } catch (error: any) {
        toast.error(error.message || 'Error fetching streams');
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
  }, [spaceId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Stream Queue</h1>
      {/* <Queue 
        queue={data}
        isCreator={true}
        creatorId={data}
        userId={}
        spaceId={spaceId}
      /> */}
    </div>
  );
};

export default SongList;
