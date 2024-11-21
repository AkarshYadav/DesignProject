'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const StudentPersonalAnalytics = ({ classId }) => {
  const [analytics, setAnalytics] = useState({
    attendanceHistory: [],
    totalSessions: 0,
    attendedSessions: 0,
    personalAttendancePercentage: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [classId]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/classes/${classId}/attendance/personal-analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch personal analytics:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-7">
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
            <CardTitle>Sessions Attended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.attendedSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.personalAttendancePercentage}%
              {analytics.personalAttendancePercentage < 75 && (
                <Badge variant="destructive" className="ml-2">
                  Low Attendance
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.attendanceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={(entry) => new Date(entry.date).toLocaleDateString()}
                label={{ value: 'Date', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                label={{ value: 'Attendance', angle: -90, position: 'insideLeft' }}
                domain={[0, 1]} // Binary range: 0 for Absent, 1 for Attended
                tickFormatter={(value) => (value === 1 ? 'Present' : 'Absent')}
                ticks={[0, 1]} // Explicitly mark 0 and 1
              />
              <Tooltip
                formatter={(value) => (value === 1 ? 'Present' : 'Absent')}
                labelFormatter={(label) =>
                  `Date: ${new Date(label).toLocaleDateString()}`
                }
              />
              <Line
                type="monotone"
                dataKey="attended"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ stroke: '#82ca9d', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                name="Attendance"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPersonalAnalytics;
