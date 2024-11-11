'use client'

import { SidebarItem } from "./SidebarItem"
import { Chalkboard } from "lucide-react"
import { usePathname } from "next/navigation"
import useSWR from 'swr'

const fetcher = async (url) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

export const TeachingList = () => {
  const pathname = usePathname()
  const { data, error, isLoading } = useSWR('/api/classes/teaching', fetcher)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error fetching teaching classes</div>
  }

  return (
    <div className="space-y-2 px-2">
      {data.teachingClasses.map((teachingClass) => (
        <SidebarItem
          key={teachingClass._id}
          href={`/classes/${teachingClass._id}`}
          icon={<Chalkboard />}
          label={teachingClass.className}
          isActive={pathname === `/classes/${teachingClass._id}`}
        />
      ))}
    </div>
  )
}