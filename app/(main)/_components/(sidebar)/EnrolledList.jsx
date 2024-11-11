'use client'

import { SidebarItem } from "./SidebarItem"
import { GraduationCap } from "lucide-react"
import { usePathname } from "next/navigation"
import useSWR from 'swr'

const fetcher = async (url) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

export const EnrolledList = () => {
  const pathname = usePathname()
  const { data, error, isLoading } = useSWR('/api/classes/enrolled', fetcher)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error fetching enrolled classes</div>
  }

  return (
    <div className="space-y-2 px-2">
      {data.enrolledClasses.map((enrolledClass) => (
        <SidebarItem
          key={enrolledClass._id}
          href={`/classes/${enrolledClass._id}`}
          icon={<GraduationCap />}
          label={enrolledClass.className}
          isActive={pathname === `/classes/${enrolledClass._id}`}
        />
      ))}
    </div>
  )
}