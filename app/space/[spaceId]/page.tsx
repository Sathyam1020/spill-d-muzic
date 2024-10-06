'use client'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const page = ({params:{spaceId}}:{params:{spaceId:string}}) => {

    const [loading, setLoading] = useState(false); 

    useEffect(() => {
        async function fetchSpaceDetails(spaceId: string) {
            try {
              const response = await fetch(`/api/space/${spaceId}`, {
                method: "GET",
              });
          
              const data = await response.json();
              console.log("Space, spaceId: ", data); 
          
              if (response.ok && data.success) {
                console.log("Space details:", data.hostId);
                return data.hostId;  // Do something with the hostId
              } else {
                console.error("Failed to retrieve space:", data.message);
              }
            } catch (error) {
              console.error("Error fetching space details:", error);
            }
          }          
        fetchSpaceDetails(spaceId)
      }, []);

  return (
    <div>page</div>
  )
}

export default page