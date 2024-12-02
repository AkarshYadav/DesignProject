'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import { Pencil, X, Check, Loader2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { toast } from '../../hooks/use-toast';

import { useSidebar } from "@/store/use-sidebar";
const AttendanceHistory = ({ classId, userRole }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [totalSessions, setTotalSessions] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const { collapsed } = useSidebar((state) => state);

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
      toast({
        title: "Error",
        description: "Failed to fetch attendance sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = async (sessionId, studentId, newStatus) => {
    try {
      setUpdateLoading(true);
      await axios.put(`/api/classes/${classId}/attendance/history`, {
        sessionId,
        studentId,
        attended: newStatus
      });

      // Update local state
      const updatedSessions = sessions.map(session => {
        if (session._id === selectedSession._id) {
          const updatedStudents = session.enrolledStudents.map(student => {
            if (student._id === studentId) {
              return {
                ...student,
                attended: newStatus,
                markedAt: newStatus ? new Date().toISOString() : null
              };
            }
            return student;
          });

          const attendeeCount = updatedStudents.filter(s => s.attended).length;
          
          return {
            ...session,
            enrolledStudents: updatedStudents,
            attendees: newStatus 
              ? [...session.attendees, { student: { _id: studentId } }]
              : session.attendees.filter(a => a.student._id !== studentId),
            attendancePercentage: Math.round((attendeeCount / session.totalStudents) * 100)
          };
        }
        return session;
      });

      setSessions(updatedSessions);
      setSelectedSession(updatedSessions.find(s => s._id === selectedSession._id));
      toast({
        title: "Success",
        description: "Attendance updated successfully",
      });
    } catch (error) {
      console.error('Failed to update attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive",
      });
    } finally {
      setUpdateLoading(false);
      setEditingStudent(null);
    }
  };

  const exportAttendanceToSheet = async () => {
    try {
      setExportLoading(true);
      // Fetch full attendance history without date range limitations
      const response = await axios.get(`/api/classes/${classId}/attendance/history`);
      const { sessions } = response.data;

      // Prepare data for export
      const exportData = prepareExportData(sessions);

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData.rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

      // Generate and download the file
      XLSX.writeFile(workbook, `${classId}_attendance_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Export Successful",
        description: "Attendance data exported successfully",
      });
    } catch (error) {
      console.error('Failed to export attendance:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export attendance data",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const prepareExportData = (sessions) => {
    // Sort sessions from oldest to newest (ascending)
    const sortedSessions = sessions.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const sessionDates = sortedSessions.map(session => 
      new Date(session.startTime).toLocaleDateString('en-GB')
    );

    // Collect unique students and split into numeric and alphanumeric college IDs
    const numericStudents = [];
    const alphaStudents = [];
    const studentMap = new Map();
    
    sessions.forEach(session => {
      session.enrolledStudents.forEach(student => {
        if (!studentMap.has(student._id)) {
          const student_copy = {
            'CollegeID': student.collegeId,
          };

          // Separate numeric and alphanumeric IDs
          if (/^\d+$/.test(student.collegeId)) {
            numericStudents.push(student_copy);
          } else {
            alphaStudents.push(student_copy);
          }
          
          studentMap.set(student._id, student_copy);
        }
      });
    });

    // Sort numeric IDs first, then alphanumeric
    const sortedStudents = [
      ...numericStudents.sort((a, b) => 
        a['CollegeID'].localeCompare(b['CollegeID'], undefined, { numeric: true })
      ),
      ...alphaStudents.sort((a, b) => 
        a['CollegeID'].localeCompare(b['CollegeID'])
      )
    ];

    // Create rows with attendance data
    const rows = sortedStudents.map(student => {
      const studentAttendance = { 'CollegeID': student.CollegeID };
      
      // Add attendance for each session in order
      sortedSessions.forEach(session => {
        const sessionDate = new Date(session.startTime).toLocaleDateString('en-GB');
        const studentInSession = session.enrolledStudents.find(
          s => s.collegeId === student.CollegeID
        );
        
        studentAttendance[sessionDate] = studentInSession && studentInSession.attended ? 1 : 0;
      });

      return studentAttendance;
    });

    return { rows };
  };

  const viewSessionDetails = (session) => {
    setSelectedSession(session);
    setEditingStudent(null);
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
                  <TableHead>Status</TableHead>
                  <TableHead>Marked At</TableHead>
                  <TableHead>Actions</TableHead>
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
                    <TableCell>
                      {editingStudent === student._id ? (
                        <div className="flex items-center gap-2">
                          {updateLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateAttendance(selectedSession._id, student._id, !student.attended)}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingStudent(null)}
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingStudent(student._id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
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
      <div className="flex  flex-col justify-between items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
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
                onSelect={(range) => range && setDateRange(range)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
        <Button 
          onClick={exportAttendanceToSheet}
          disabled={exportLoading || sessions.length === 0}
          className="ml-4 mt-4"
        >
          {exportLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export
        </Button>
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
                  <Button 
                    variant="ghost"
                    onClick={() => viewSessionDetails(session)}
                  >
                    View Details
                  </Button>
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