import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const StudentAnalytics = ({ classId, userRole }) => {
  const [analytics, setAnalytics] = useState({
    attendanceHistory: [],
    averageAttendance: 0,
    totalSessions: 0,
    totalEnrolledStudents: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [classId]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/classes/${classId}/attendance/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-7">
        <Card>
          <CardHeader>
            <CardTitle>Average Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageAttendance}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Enrolled Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEnrolledStudents}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.attendanceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={(entry) => new Date(entry.date).toLocaleDateString()}
                label={{ value: 'Date', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Students', angle: -90, position: 'insideLeft' }}
                domain={[0, analytics.totalEnrolledStudents]}
              />
            {/* <Tooltip 
  formatter={(value, name) => {
    const label = name == 'present' ? 'Present' : 'Absent';
    return [value, label];
  }}
/> */}
              <Legend />
              <Bar dataKey="present" fill="#8884d7" name="Present" />
              <Bar dataKey="absent" fill="#82ca9d" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {userRole === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle>Your Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              Personal Attendance: {analytics.personalAttendance ? analytics.personalAttendance.toFixed(2) : 0}%
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentAnalytics;