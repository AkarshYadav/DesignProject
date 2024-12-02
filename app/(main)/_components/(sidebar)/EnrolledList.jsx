'use client'

import { SidebarItem } from "./SidebarItem"
import {  Users } from 'lucide-react';
import { usePathname } from "next/navigation"
import axios from 'axios'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
const fetcher = async (url) => {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    throw error
  }
}

export const EnrolledList = () => {
  const { data: session } = useSession();
  const username = session?.user?.email?.split('@')[0];

  const pathname = usePathname()
  const { data, error, isLoading } = useSWR('/api/classes/dashboard', fetcher)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error fetching enrolled classes</div>
  }

  return (
    <div className="space-y-2 px-2">
      {data?.enrolledClasses?.map((enrolledClass) => (
        <SidebarItem
          key={enrolledClass._id}
          href={`/u/${username}/${enrolledClass._id}`}
          icon={<Users />}
          label={enrolledClass.className}
          isActive={pathname === `/classes/${enrolledClass._id}`}
        />
      ))}
    </div>
  )
}