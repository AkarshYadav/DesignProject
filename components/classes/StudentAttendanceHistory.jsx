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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

const StudentAttendanceHistory = ({ classId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    fetchSessions();
  }, [dateRange]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/classes/${classId}/attendance/student-history`, {
        params: {
          from: dateRange.from?.toISOString(),
          to: dateRange.to?.toISOString(),
        },
      });
      setSessions(response.data.sessions);
      setTotalSessions(response.data.totalSessions);
    } catch (error) {
      console.error('Failed to fetch student sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : 'N/A');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Date Range Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {`From: ${formatDate(dateRange.from)} | To: ${formatDate(dateRange.to)}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-4">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => range && setDateRange(range)}
                className="rounded-md border"
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Marked At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No attendance sessions found
              </TableCell>
            </TableRow>
          ) : (
            sessions.map((session) => (
              <TableRow key={session._id}>
                <TableCell>{new Date(session.startTime).toLocaleDateString()}</TableCell>
                <TableCell>{session.duration} minutes</TableCell>
                <TableCell>{session.attended ? 'Present' : 'Absent'}</TableCell>
                <TableCell>
                  {session.attended && session.markedAt
                    ? new Date(session.markedAt).toLocaleTimeString()
                    : '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentAttendanceHistory;
