'use client'

import { signOut } from 'next-auth/react';
import React, { useEffect, useMemo, useState } from 'react'
import Appbar from './Appbar';
import { Button } from './ui/button';
import { toast } from "sonner";
import CardSkeleton from './ui/cardSkeleton';
import SpacesCard from './SpacesCard';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from './ui/switch';

interface Space {
    endTime?: Date | null;
    hostId: string;
    id: string;
    isActive: boolean;
    name: string;
    startTime: Date | null;
    isPublic: boolean; 
}

const HomeView = () => {

    const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
    const [spaceName, setSpaceName] = useState(""); 
    const [spaces, setSpaces] = useState<Space[] | null>(null); 
    const [loading, setLoading] = useState(false); 
    const [isPublic, setIsPublic] = useState(true);
    const [password, setPassword] = useState("");
    const [isActive, setIsActive] = useState(true); 
    console.log(password, isPublic, isActive);

    useEffect(() => {
        const fetchSpaces = async () => {
          setLoading(true);
          try {
            const response = await fetch("/api/space", {
              method: "GET",
            });
    
            const data = await response.json();
            console.log(data); 
    
            if (!response.ok || !data.success) {
              throw new Error(data.message || "Failed to fetch spaces");
            }
    
            const fetchedSpaces: Space[] = data.spaces 
            setSpaces(fetchedSpaces);
          } catch (error) {
            toast.error("Error fetching spaces");
          } finally {
            setLoading(false);
          }
        };
        fetchSpaces();
      }, []);

      const handleCreateSpace = async () => {
        setIsCreateSpaceOpen(false);
        try {
          const response = await fetch(`/api/space`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              spaceName: spaceName,
              password,
              isPublic,
              isActive
            }),
          });
          const data = await response.json();
    
          if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to create space");
          }
    
          const newSpace = data.space;
          setSpaces((prev) => {
            const updatedSpaces: Space[] = prev ? [...prev, newSpace] : [newSpace];
            return updatedSpaces;
          });
          toast.success(data.message); 
        } catch (error: any) {
          toast.error(error.message || "Error Creating Space"); 
        }
      };

      const handleDeleteSpace = async (spaceId: string) => {
        try {
          const response = await fetch(`/api/space/?spaceId=${spaceId}`, {
            method: "DELETE",
          });
          const data = await response.json();
    
          if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to delete space");
          }
          setSpaces((prev) => {
            const updatedSpaces: Space[] = prev
              ? prev.filter((space) => space.id !== spaceId)
              : [];
            return updatedSpaces;
          });
          toast.success(data.message);
        } catch (error: any) {
          toast.error(error.message || "Error Deleting Space"); 
        }
      };

      const renderSpaces = useMemo(() => {
        if (loading) {
          return (
            <>
              <div className="dark mx-auto h-[500px] w-full py-4 sm:w-[450px] lg:w-[500px]">
                <CardSkeleton />
              </div>
              <div className="dark mx-auto h-[500px] w-full py-4 sm:w-[450px] lg:w-[500px]">
                <CardSkeleton />
              </div>
            </>
          );
        }
    
        if (spaces && spaces.length > 0) {
          return spaces.map((space) => (
            <SpacesCard
              key={space.id}
              space={space}
              handleDeleteSpace={handleDeleteSpace}
            />
          ));
        }
      }, [loading, spaces]);

  return (
    <div className='flex items-center min-h-screen flex-col bg-gradient-to-b from gray-900 to-black text-gray-200'>
        <Appbar />
        <div className='flex flex-grow flex-col items-center px-4 py-8 mt-20'>
            <div className='h-20 lg:h-36 md:h-28 rounded-xl bg-gradient-to-r from-indigo-600 to violet-900 bg-clip-text text-6xl lg:text-9xl md:text-8xl font-bold text-transparent '>
                Spaces
            </div>
            <Button
                onClick={() => setIsCreateSpaceOpen(true)}
                className="mt-2 md:mt-6 lg:mt-10 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
                Create a new Space
            </Button>
            <div className='flex-col'>
                {renderSpaces}
            </div>
        </div>
        <Dialog open={isCreateSpaceOpen} onOpenChange={setIsCreateSpaceOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="mb-10 text-center">
                        Create new space
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
                            placeholder='DJ Night'
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setSpaceName(e.target.value);
                            }}
                        />
                    </fieldset>
                    <div className="flex items-center justify-between">
                        <label className="text-lg font-bold my-3">Public or Private?</label>
                        <Switch
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                        className="ml-2"
                        />
                        <span>{isPublic ? "Public" : "Private"}</span>
                    </div>
                    <div className='text-sm font-light text-gray-500'>{isPublic ? <div>Space is public, anybody can join</div> : <div>Space is private, only users with password can join</div>}</div>
                    {
                        isPublic === false && 
                        <fieldset className="Fieldset">
                            <label
                                className="text-violet11 w-[90px] text-right text-xl font-bold"
                                htmlFor="password"
                            >
                                Enter space password
                            </label>
                            <input
                                className="text-violet11 shadow-violet7 focus:shadow-violet8 mt-5 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
                                id="password"
                                // defaultValue="12345678"
                                placeholder='12345678'
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setPassword(e.target.value);
                                }}
                            />
                        </fieldset>
                    }
                    <div className="flex items-center justify-between">
                        <label className="text-lg font-bold my-3">Is the room active?</label>
                        <Switch
                        checked={isActive}
                        onCheckedChange={setIsActive}
                        className="ml-2"
                        />
                        <span>{isActive ? "Active" : "Not active"}</span>
                    </div>
                </DialogHeader>
                <DialogFooter>
                    <Button
                    variant="outline"
                    onClick={() => setIsCreateSpaceOpen(false)}
                    >
                    Cancel
                    </Button>
                    <Button
                    onClick={handleCreateSpace}
                    className="bg-purple-600 text-white hover:bg-purple-700"
                    >
                    Create Space
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  )
}

export default HomeView; 