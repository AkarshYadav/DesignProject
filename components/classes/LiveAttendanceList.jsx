'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function LiveAttendanceList({ classId }) {
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    // Create EventSource for live updates
    const eventSource = new EventSource(`/api/classes/${classId}/attendance/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'attendance-update') {
          setAttendees(data.attendees);
        }
      } catch (error) {
        console.error('Error parsing event:', error);
      }
    };

    // Cleanup on component unmount
    return () => {
      eventSource.close();
    };
  }, [classId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
                <TableHead>S.No</TableHead>
              <TableHead>College ID</TableHead>
              <TableHead>Marked At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendees.map((attendee, index) => (
              <TableRow key={index}>
                <TableCell>{index+1}</TableCell>
                <TableCell>{attendee.collegeId}</TableCell>
                <TableCell>
                  {new Date(attendee.markedAt).toLocaleTimeString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
