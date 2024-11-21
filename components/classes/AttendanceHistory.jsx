'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const AttendanceHistory = ({ classId, userRole }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [totalSessions, setTotalSessions] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [dateRange]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/classes/${classId}/attendance/history`, {
        params: {
          from: dateRange.from?.toISOString(),
          to: dateRange.to?.toISOString()
        }
      });
      setSessions(response.data.sessions);
      setTotalSessions(response.data.totalSessions);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewSessionDetails = (session) => {
    setSelectedSession(session);
  };

  const renderSessionDetailsDialog = () => {
    if (!selectedSession) return null;

    return (
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Session Attendance Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <strong>Date:</strong> {new Date(selectedSession.startTime).toLocaleString()}
              </div>
              <div>
                <strong>Duration:</strong> {selectedSession.duration} minutes
              </div>
              <div>
                <strong>Attendance:</strong> {selectedSession.attendees.length} / {selectedSession.totalStudents} 
                ({selectedSession.attendancePercentage}%)
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No</TableHead>
                  <TableHead>College ID</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Marked At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedSession.enrolledStudents.map((student, index) => (
                  <TableRow key={student._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{student.collegeId}</TableCell>
                    <TableCell>
                      <Badge variant={student.attended ? 'default' : 'destructive'}>
                        {student.attended ? 'Present' : 'Absent'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {student.attended && student.markedAt 
                        ? new Date(student.markedAt).toLocaleTimeString() 
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Date Range Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) =>(range && setDateRange(range))}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Attendees</TableHead>
            <TableHead>Percentage</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">Loading...</TableCell>
            </TableRow>
          ) : sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">No attendance sessions found</TableCell>
            </TableRow>
          ) : (
            sessions.map((session) => (
              <TableRow key={session._id}>
                <TableCell>{new Date(session.startTime).toLocaleDateString()}</TableCell>
                <TableCell>{session.duration} minutes</TableCell>
                <TableCell>{session.attendees.length} / {session.totalStudents}</TableCell>
                <TableCell>{session.attendancePercentage}%</TableCell>
                <TableCell>
                  <button 
                    className="text-blue-600 hover:underline"
                    onClick={() => viewSessionDetails(session)}
                  >
                    View Details
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {renderSessionDetailsDialog()}
    </div>
  );
};

export default AttendanceHistory;