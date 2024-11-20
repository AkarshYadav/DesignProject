import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connect from '@/lib/mongodb/mongoose';
import AttendanceSession from "@/lib/models/attendance.model";
import Class from "@/lib/models/class.model";
import Enrollment from "@/lib/models/enrollment.model"; // Assuming you have an enrollment model

export async function GET(request, context) {
  await connect();

  // Get session and check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { classId } = await context.params;
  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  try {
    // Find the class and populate enrollments with student details
    const classData = await Class.findById(classId)
      .populate({
        path: 'enrollments',
        populate: {
          path: 'student',
          select: 'name collegeId email' // Adjust fields as needed
        }
      });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Prepare date filter
    const dateFilter = {};
    if (fromParam) dateFilter.$gte = new Date(fromParam);
    if (toParam) dateFilter.$lte = new Date(toParam);

    // Query attendance sessions with optional date filtering
    const query = { 
      class: classId, 
      ...(Object.keys(dateFilter).length && { startTime: dateFilter })
    };

    // Fetch sessions with detailed information
    const sessions = await AttendanceSession.find(query)
      .sort({ startTime: -1 })
      .populate('attendees.student', 'name collegeId email');

    // Transform sessions with additional details
    const processedSessions = sessions.map(session => {
      const duration = session.endTime 
        ? Math.round((session.endTime - session.startTime) / (1000 * 60)) 
        : 0;

      // Map all enrolled students with their attendance status
      const enrolledStudents = classData.enrollments.map(enrollment => {
        const attendedStudent = session.attendees.find(
          attendee => attendee.student?._id.toString() === enrollment.student._id.toString()
        );

        return {
          ...enrollment.student.toObject(),
          attended: !!attendedStudent,
          markedAt: attendedStudent ? attendedStudent.markedAt : null
        };
      });

      return {
        _id: session._id,
        startTime: session.startTime,
        endTime: session.endTime,
        duration,
        totalStudents: classData.enrollments.length,
        attendees: session.attendees,
        enrolledStudents,
        attendancePercentage: Math.round((session.attendees.length / classData.enrollments.length) * 100)
      };
    });

    return NextResponse.json({ 
      sessions: processedSessions,
      totalSessions: processedSessions.length
    });
  } catch (error) {
    console.error('Attendance history fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance history' },
      { status: 500 }
    );
  }
}