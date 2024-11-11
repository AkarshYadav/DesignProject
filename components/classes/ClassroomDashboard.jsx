"use client"

import React from 'react';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';
import ClassCard from './ClassCard';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
const ClassroomDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState({ createdClasses: [], enrolledClasses: [] });
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const username = session?.user?.email?.split('@')[0];
  const router = useRouter();

  const handleClassClick = (classId) => {
    // Navigate to the class page
    router.push(`/u/${username}/${classId}`);
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await axios.get('/api/classes/dashboard');
        setClasses(data);
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to fetch classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const EmptyMessage = ({ type }) => (
    <p className="col-span-full text-center text-muted-foreground py-8">
      {type === 'enrolled' 
        ? "You haven't enrolled in any classes yet."
        : "You haven't created any classes yet."}
    </p>
  );

  const ClassGrid = ({ items, isTeaching }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.length > 0 ? (
        items.map((classItem) => (
          <ClassCard 
            key={classItem._id} 
            classData={classItem} 
            isTeaching={isTeaching}
            onClassClick={handleClassClick}
          />
        ))
      ) : (
        <EmptyMessage type={isTeaching ? 'teaching' : 'enrolled'} />
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading classes: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="enrolled" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="enrolled">
            Enrolled Classes ({classes.enrolledClasses.length})
          </TabsTrigger>
          <TabsTrigger value="teaching">
            Teaching ({classes.createdClasses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled">
        <ClassGrid
        items={classes.enrolledClasses}
        isTeaching={false}
        onClassClick={handleClassClick}
      />
        </TabsContent>

        <TabsContent value="teaching">
        <ClassGrid
        items={classes.createdClasses}
        isTeaching={true}
        onClassClick={handleClassClick}
      />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassroomDashboard;