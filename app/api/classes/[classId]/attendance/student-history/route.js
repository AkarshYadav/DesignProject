import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connect from '@/lib/mongodb/mongoose';
import AttendanceSession from "@/lib/models/attendance.model";
import Enrollment from "@/lib/models/enrollment.model";

export async function GET(request, context) {
  await connect();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { classId } = await context.params;
  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const userId = session.user.id;

  try {
    const dateFilter = {};
    if (fromParam) dateFilter.$gte = new Date(fromParam);
    if (toParam) dateFilter.$lte = new Date(toParam);

    const query = { 
      class: classId, 
      ...(Object.keys(dateFilter).length && { startTime: dateFilter })
    };

    const sessions = await AttendanceSession.find(query)
      .sort({ startTime: -1 })
      .populate('attendees.student', 'name collegeId email');

    // Filter for specific student's attendance
    const studentAttendance = sessions.map(session => {
      const attendee = session.attendees.find(a => a.student._id.toString() === userId);

      return {
        _id: session._id,
        startTime: session.startTime,
        endTime: session.endTime,
        attended: !!attendee,
        markedAt: attendee?.markedAt || null,
        duration: session.endTime 
          ? Math.round((session.endTime - session.startTime) / (1000 * 60)) 
          : 0,
      };
    });

    return NextResponse.json({
      sessions: studentAttendance,
      totalSessions: studentAttendance.length
    });
  } catch (error) {
    console.error('Student attendance fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student attendance history' },
      { status: 500 }
    );
  }
}
