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

  const { classId } = context.params;
  const userId = session.user.id;

  try {
    // Find the class to get total enrolled students
    const classData = await Class.findById(classId).populate('enrollments');
    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }
    const totalEnrolledStudents = classData.enrollments.length;

    // Fetch all attendance sessions for this class
    const sessions = await AttendanceSession.find({ class: classId }).sort({ startTime: 1 });

    // Calculate detailed attendance history
    const attendanceHistory = await Promise.all(
      sessions.map((session) => {
        const presentCount = session.attendees.length; // Count of students who attended
        const absentCount = totalEnrolledStudents - presentCount;

        return {
          date: session.startTime,
          present: presentCount,
          absent: absentCount,
          totalStudents: totalEnrolledStudents,
        };
      })
    );

    // Calculate overall class analytics
    const totalSessions = sessions.length;
    const averageAttendance = totalSessions > 0
      ? (attendanceHistory.reduce((sum, record) => sum + record.present, 0) /
        (totalSessions * totalEnrolledStudents)) * 100
      : 0;

    // Fetch student-specific data if user is a student
    let studentSpecificData = {};
    if (session.user.role === 'student') {
      const studentAttendanceRecords = sessions.filter((session) =>
        session.attendees.some((attendee) => attendee.student.toString() === userId)
      );

      studentSpecificData = {
        personalAttendance: totalSessions > 0
          ? (studentAttendanceRecords.length / totalSessions) * 100
          : 0,
      };
    }

    return NextResponse.json({
      attendanceHistory,
      averageAttendance: Math.round(averageAttendance),
      totalSessions,
      totalEnrolledStudents,
      ...studentSpecificData,
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
      },
      { status: 500 }
    );
  }
}
