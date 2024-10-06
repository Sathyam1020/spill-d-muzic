'use client'

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react'
import { Button } from './ui/button';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

const Appbar = () => {
    const session = useSession();
    const router = useRouter();
  return (
    <div className="flex justify-between px-5 py-4 fixed top-0 w-[90%] md:px-10 xl:px-20 rounded-lg bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 z-10 mt-6 border-md shadow-md">
      <div
        onClick={() => {
          router.push("/");
        }}
        className={`flex flex-col justify-center text-3xl font-bold hover:cursor-pointer text-purple-500`}
      >
        SpillDMuzic
      </div>
      <div className="flex items-center gap-x-2">
      {session.data?.user && (
        //   <Button
        //     className="bg-purple-600 text-white hover:bg-purple-700"
        //     onClick={() =>
        //       signOut({
        //         callbackUrl: "/",
        //       })
        //     }
        //   >
        //     Logout
        //   </Button>
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Avatar>
                        <AvatarImage src={session?.data?.user?.image ?? undefined} alt='User'/>
                        <AvatarFallback className=''>U</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='flex flex-col justify-center align-center w-56'>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Button className='text-center' onClick={() => signOut()}>Logout</Button>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        )}
        {!session.data?.user && (
          <div className="space-x-3">
            <Button
              className="bg-purple-600 text-white hover:bg-purple-700"
              onClick={() => router.push("/auth")}
            >
              Signin
            </Button>
            <Link
              href={{
                pathname: "/auth",
                query: {
                  authType: "signUp",
                },
              }}
            >
              <Button
                variant={"ghost"}
                className="text-white hover:bg-white/10"
              >
                Signup
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Appbar; 