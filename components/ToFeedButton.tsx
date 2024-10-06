'use client'

import React from 'react'
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

interface ToFeedButtonProps {
    text: string; 
}

const ToFeedButton = ({
    text,
}: ToFeedButtonProps) => {

    const router = useRouter(); 
  return (
    <div>
        <Button 
            className='bg-purple-600 text-white hover:bg-purple-700'
            onClick={() => router.push('/home')}
        >
            {text}
        </Button>
    </div>
  )
}

export default ToFeedButton; 