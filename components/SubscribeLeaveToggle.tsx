'use client'

import React, { useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'

interface SubscribeLeaveToggleProps {
    isSubscribed: boolean
    spaceId: string
    spaceName: string
    isPublic: boolean
    password?: string
}

const SubscribeLeaveToggle = ({
    isSubscribed,
    spaceId,
    spaceName,
    isPublic,
    password
}: SubscribeLeaveToggleProps) => {

    const subscribe = async () => {
        // setIsCreateSpaceOpen(false);
        try {
          const response = await fetch(`/api/space/subscribe`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              spaceId
            }),
          });
          const data = await response.json();
    
          if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to subscribe space");
          }
          toast.success(`You are now member of ${spaceName}`); 
        } catch (error: any) {
          toast.error(error.message || "Error subscribing Space"); 
        }
      };

      const unsubscribe = async () => {
        // setIsCreateSpaceOpen(false);
        try {
          const response = await fetch(`/api/space/unsubscribe`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
                spaceId
            }),
          });
          
          const data = await response.json();
      
          if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to unsubscribe space");
          }
          
          toast.success(`You've unsubscribed from ${spaceName}`); 
        } catch (error: any) {
          toast.error(error.message || "Error unsubscribing from space"); 
        }
      };
      
    //   return isSubscribed ? (
    //     <Button
    //         className='bg-purple-600 text-white hover:bg-purple-700 w-full'
    //         onClick={unsubscribe}
    //     >
    //         Leave Space 
    //     </Button>
    //   ) : (
    //     <Button
    //       className='bg-purple-600 text-white hover:bg-purple-700 w-full'
    //     //   isLoading={isSubLoading}
    //       onClick={subscribe}>
    //       Join Space
    //     </Button>
    //   )

    return (
        <div>{
                isSubscribed ? (
                    <Button
                        className='bg-purple-600 text-white hover:bg-purple-700 w-full'
                        onClick={unsubscribe}
                    >
                        Leave Space
                    </Button>
                    ) : (
                        <Button
                            className='bg-purple-600 text-white hover:bg-purple-700 w-full'
                            onClick={subscribe}
                        >
                            Join Space
                        </Button>
                    )
            }
        </div>
    )
}

export default SubscribeLeaveToggle;