'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ClassPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [copied, setCopied] = useState(false);
  const [attendanceStarted, setAttendanceStarted] = useState(false);

  useEffect(() => {
    // Redirect to signin if the user is not authenticated and authentication status is resolved
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch class data if authenticated
    const fetchClassData = async () => {
      try {
        if (!params?.classId) {
          throw new Error('Class ID is missing');
        }

        const response = await axios.get(`/api/classes/${params.classId}`);
        setClassData(response.data.classData);
        setUserRole(response.data.userRole);
      } catch (err) {
        console.error('Error fetching class data:', err);
        setError(err?.response?.data?.error || 'Failed to fetch class data');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchClassData();
    }
  }, [params?.classId, status]);

  const handleCopyClassCode = () => {
    if (classData?.classCode) {
      navigator.clipboard.writeText(classData.classCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartAttendance = async () => {
    try {
      await axios.post(`/api/classes/${params.classId}/attendance/start`);
      setAttendanceStarted(true);
    } catch (err) {
      setError('Failed to start attendance');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {classData?.className}
          </CardTitle>
          <p className="text-muted-foreground">
            {classData?.subject} {classData?.section && `- ${classData.section}`}
          </p>
        </CardHeader>
        <CardContent>
          {userRole === 'teacher' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <p className="text-sm font-medium">Class Code: {classData?.classCode}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyClassCode}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
              
              <div>
                <Button
                  onClick={handleStartAttendance}
                  disabled={attendanceStarted}
                  className="w-full sm:w-auto"
                >
                  {attendanceStarted ? 'Attendance Started' : 'Start Attendance'}
                </Button>
              </div>

              {classData?.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">About this class</h3>
                  <p className="text-muted-foreground">{classData.description}</p>
                </div>
              )}
            </div>
          )}

          {userRole === 'student' && (
            <div className="space-y-4">
              {classData?.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">About this class</h3>
                  <p className="text-muted-foreground">{classData.description}</p>
                </div>
              )}
              {attendanceStarted && (
                <Alert>
                  <AlertDescription>
                    Attendance is currently active. Please mark your attendance.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassPage;
