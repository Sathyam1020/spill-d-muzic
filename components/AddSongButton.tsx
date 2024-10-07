'use client'

import React, { useState } from 'react'
import { Button } from './ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from 'sonner';
import { YT_REGEX } from '@/lib/utils';
  
interface AddSongButtonProps {
    creatorId: string; 
    spaceId: string; 
}

interface Video {
    id: string;
    type: string;
    url: string;
    extractedId: string;
    title: string;
    smallImg: string;
    bigImg: string;
    active: boolean;
    userId: string;
    upvotes: number;
    haveUpvoted: boolean;
    spaceId:string
}

const AddSongButton = ({
    creatorId, 
    spaceId,
}: AddSongButtonProps) => {

    const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
    const [inputLink, setInputLink] = useState("");
    const [loading, setLoading] = useState(false); 
    const [queue, setQueue] = useState<Video[]>([]);
    console.log(inputLink); 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputLink.trim()) {
          toast.error("YouTube link cannot be empty");
          return;
        }
        if (!inputLink.match(YT_REGEX)) {
          toast.error("Invalid YouTube URL format");
          return;
        }
        setLoading(true);
        try {
          const res = await fetch("/api/space/streams/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              creatorId,
              url: inputLink,
              spaceId:spaceId
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || "An error occurred");
          }
          setQueue([...queue, data]);
          setInputLink("");
          toast.success("Song added to queue successfully");
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error("An unexpected error occurred");
          }
        } finally {
          setLoading(false);
        }
      };

  return (
    <div className='mt-3 py-2'>
            <div className='flex flex-grow flex-col items-center px-4'>
                <Button
                    onClick={() => setIsCreateSpaceOpen(true)}
                    className=" rounded-lg bg-purple-600 px-4 text-white hover:bg-purple-700"
                >
                   Add new song
                </Button>
                <div className='flex-col'>
                    {/* {renderSpaces} */}
                </div>
            </div>
            <Dialog open={isCreateSpaceOpen} onOpenChange={setIsCreateSpaceOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="mb-10 text-center">
                        Add Song
                    </DialogTitle>
                    <fieldset className="Fieldset">
                        <label
                            className="text-violet11 w-[90px] text-right text-xl font-bold"
                            htmlFor="name"
                        >
                            Name of the Space
                        </label>
                        <input
                            className="text-violet11 shadow-violet7 focus:shadow-violet8 mt-5 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
                            id="name"
                            // defaultValue="Pedro Duarte"
                            placeholder='https://www.youtube.com'
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setInputLink(e.target.value);
                            }}
                        />
                    </fieldset>
                    {/* <div className='text-sm font-light text-gray-500'>{isPublic ? <div>Space is public, anybody can join</div> : <div>Space is private, only users with password can join</div>}</div> */}
                </DialogHeader>
                <DialogFooter>
                    <Button
                    variant="outline"
                    onClick={() => setIsCreateSpaceOpen(false)}
                    >
                    Cancel
                    </Button>
                    <Button
                    disabled={loading}
                    onClick={handleSubmit}
                    className="bg-purple-600 text-white hover:bg-purple-700"
                    >
                    {loading ? "Adding" : "Add"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}

export default AddSongButton; 