import React from 'react'
import { Wrapper } from './wrapper'
import { Toggle } from './toggle'
import { UserItem } from './user-item'
import { EnrolledList } from './EnrolledList'
import { TeachingList } from './TeachingList'


export const Sidebar = () => {
    return (
        <Wrapper>
            <Toggle></Toggle>
            <div className="pt-4 space-y-4 lg:pt-0 h-full ">
                <ul className="space-y-2 px-2">
                    <UserItem></UserItem>
                </ul>
                <ul>
                <EnrolledList />
                </ul>
                <ul>
                <TeachingList />
                </ul>
            </div>
           
        </Wrapper>
    )
}


