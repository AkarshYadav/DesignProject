
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAttendance } from '@/store/useAttendance';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Copy, Check, MapPin, Clock, Users, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import AttendanceHistory from '@/components/classes/AttendanceHistory';
import StudentAnalytics from '@/components/classes/StudentAnalytics';
import LiveAttendanceList from '@/components/classes/LiveAttendanceList';
import StudentAttendanceHistory from '@/components/classes/StudentAttendanceHistory';
import StudentPersonalAnalytics from '@/components/classes/StudentPersonalAnalytics';
const ClassPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [copied, setCopied] = useState(false);
  const [totalDuration, setTotalDuration] = useState(null);
  const [selectedTab, setSelectedTab] = useState('attendance');

  const {
    isActive,
    sessionId,
    hasMarked,
    endTime,
    loading: attendanceLoading,
    error: attendanceError,
    startAttendance,
    markAttendance,
    endAttendance,
    refreshStatus
  } = useAttendance(params?.classId);

  const [timeLeft, setTimeLeft] = useState(null);
  const [progressValue, setProgressValue] = useState(100);

  // Fetch class data
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        if (!params?.classId) throw new Error('Class ID is missing');
        const response = await axios.get(`/api/classes/${params.classId}`);
        setClassData(response.data.classData);
        setUserRole(response.data.userRole);
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to fetch class data');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') fetchClassData();
  }, [params?.classId, status]);

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signin');
  }, [status, router]);

  // Timer logic with dynamic duration
  useEffect(() => {
    let intervalId;

    if (isActive && endTime) {
      const end = new Date(endTime).getTime();

      // Calculate total duration when session starts
      if (!totalDuration) {
        const start = Date.now();
        setTotalDuration(end - start);
      }

      intervalId = setInterval(() => {
        const now = Date.now();
        const remaining = end - now;

        if (remaining <= 0) {
          setTimeLeft(null);
          setProgressValue(0);
          clearInterval(intervalId);
          refreshStatus();
        } else {
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);

          // Calculate progress based on remaining time and total duration
          const progress = (remaining / totalDuration) * 100;
          setProgressValue(Math.max(0, progress));
        }
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isActive, endTime, refreshStatus, totalDuration]);

  // Location handling
  const handleLocationAction = async (action, options = null) => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      if (action === 'end') {
        await endAttendance();
        return;
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      if (action === 'start') {
        const { duration, radius } = options || {};

        // Validate the presence of both duration and radius
        if (!duration || !radius) {
          throw new Error('Both duration and radius must be provided for starting attendance');
        }

        await startAttendance({
          location,
          duration, // Pass duration in seconds
          radius,   // Pass radius in meters
        });

        setTotalDuration(duration * 1000); // Convert seconds to milliseconds
      } else if (action === 'mark') {
        await markAttendance(location);
      }
    } catch (err) {
      if (err.name === 'GeolocationPositionError') {
        setError('Please enable location access to use attendance features');
      } else {
        setError(err.message || 'Failed to process attendance action');
      }
    }
  };


  const handleCopyClassCode = () => {
    navigator.clipboard.writeText(classData?.classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (loading || attendanceLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || attendanceError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || attendanceError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {classData?.className}
            </CardTitle>
            {isActive && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Live Session
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {classData?.subject} {classData?.section && `- ${classData.section}`}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <Button
              variant={selectedTab === 'attendance' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('attendance')}
            >
              Attendance
            </Button>
            <Button
              variant={selectedTab === 'history' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('history')}
            >
              History
            </Button>
            <Button
              variant={selectedTab === 'analytics' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('analytics')}
            >
              Analytics
            </Button>

          </div>

          {selectedTab === 'attendance' && (
            userRole === 'teacher' ? (
              <TeacherView
                classId={params.classId}
                classData={classData}
                isActive={isActive}
                sessionId={sessionId}
                timeLeft={timeLeft}
                progressValue={progressValue}
                copied={copied}
                onCopyCode={handleCopyClassCode}
                onStartAttendance={(options) => handleLocationAction('start', options)}
                onEndAttendance={() => handleLocationAction('end')}
              />
            ) : (
              <StudentView
                classData={classData}
                isActive={isActive}
                hasMarked={hasMarked}
                timeLeft={timeLeft}
                progressValue={progressValue}
                onMarkAttendance={() => handleLocationAction('mark')}
              />
            )
          )}

          {selectedTab === 'history' && (
            userRole === 'teacher' ? (
              <AttendanceHistory classId={params.classId} userRole={userRole} />
            ) : (
              <StudentAttendanceHistory classId={params.classId} />
            )
          )}


          {selectedTab === 'analytics' && (
            userRole === 'teacher' ? (
              <StudentAnalytics classId={params.classId} userRole={userRole} />
            ) : (
              <StudentPersonalAnalytics classId={params.classId} />
            )
          )}



        </CardContent>
      </Card>
    </div>
  );
};

// TeacherView and StudentView components remain the same...



// Teacher view component
const TeacherView = ({
  classId,
  classData,
  isActive,
  timeLeft,
  progressValue,
  copied,
  onCopyCode,
  onStartAttendance,
  onEndAttendance
}) => {
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [duration, setDuration] = useState(5); // Default 5 minutes
  const [radius, setRadius] = useState(100);
  const handleStartAttendance = () => {
    setShowDurationModal(true);
  };

  const handleConfirmStart = () => {
    onStartAttendance({
      duration: duration * 60, // Convert minutes to seconds
      radius // Pass radius in meters
    });
    setShowDurationModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <p className="text-sm font-medium">Class Code: {classData?.classCode}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={onCopyCode}
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {!isActive ? (
            <Button
              onClick={handleStartAttendance}
              className="w-full sm:w-auto"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Start Attendance
            </Button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                className="flex-1"
                disabled={true}
              >
                <Clock className="h-4 w-4 mr-2" />
                Session Active
              </Button>
              <Button
                variant="destructive"
                onClick={onEndAttendance}
                className="flex-1"
              >
                End Session
              </Button>
            </div>
          )}
          {timeLeft && (
            <span className="text-sm font-medium">
              Time Remaining: {timeLeft}
            </span>
          )}

        </div>
        {
          isActive ? (
            <LiveAttendanceList classId={classId} />
          ) : ("")
        }
        {isActive && (
          <div className="space-y-2">
            <Progress value={progressValue} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Session Progress</span>
              <span>{Math.round(progressValue)}% remaining</span>
            </div>
          </div>
        )}
      </div>

      {showDurationModal && (
        <Dialog open={showDurationModal} onOpenChange={setShowDurationModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Attendance Duration</DialogTitle>
              <DialogDescription>
                Choose how long the attendance session should last
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min={1}
                  max={60}
                />
              </div>
              <div className="flex items-center gap-4">
                <Label htmlFor="radius">Attendance Radius (meters)</Label>
                <Input
                  id="radius"
                  type="number"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  min={10}
                  max={500}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDurationModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmStart}>Start Session</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {classData?.description && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">About this class</h3>
          <p className="text-muted-foreground">{classData.description}</p>
        </div>
      )}
    </div>
  );
};

// Student view component
const StudentView = ({
  classData,
  isActive,
  hasMarked,
  timeLeft,
  progressValue,
  onMarkAttendance
}) => (
  <div className="space-y-4">
    {classData?.description && (
      <div>
        <h3 className="text-lg font-semibold mb-2">About this class</h3>
        <p className="text-muted-foreground">{classData.description}</p>
      </div>
    )}

    {isActive && (
      <Card className="bg-secondary">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  Attendance Session Active
                </span>
              </div>
              <span className="text-sm font-medium">
                {timeLeft} remaining
              </span>
            </div>

            <Progress value={progressValue} className="w-full" />

            {!hasMarked ? (
              <Button
                onClick={onMarkAttendance}
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">Attendance Marked</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

export default ClassPage;