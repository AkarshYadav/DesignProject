import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connect from '@/lib/mongodb/mongoose';
import AttendanceSession from "@/lib/models/attendance.model";
import Class from "@/lib/models/class.model";

export async function GET(request, context) {
  await connect();

  // Get session and check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { classId } = await context.params;
  const userId = session.user.id;

  try {
    // Fetch attendance sessions for the class
    const sessions = await AttendanceSession.find({ class: classId }).sort({ startTime: 1 });
    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ error: 'No attendance sessions found' }, { status: 404 });
    }

    // Calculate student-specific analytics
    const totalSessions = sessions.length;
    let attendedSessions = 0;

    const attendanceHistory = sessions.map(session => {
      const attended = session.attendees.some(attendee => attendee.student.toString() === userId);
      if (attended) attendedSessions++;
      return {
        date: session.startTime,
        attended,
      };
    });

    const personalAttendancePercentage = totalSessions > 0
      ? (attendedSessions / totalSessions) * 100
      : 0;

    return NextResponse.json({
      attendanceHistory,
      totalSessions,
      attendedSessions,
      personalAttendancePercentage: Math.round(personalAttendancePercentage),
    });
  } catch (error) {
    console.error('Personal analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal analytics' },
      { status: 500 }
    );
  }
}
