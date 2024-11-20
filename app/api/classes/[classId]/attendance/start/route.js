import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connect from '@/lib/mongodb/mongoose';
import AttendanceSession from "@/lib/models/attendance.model";
import Class from "@/lib/models/class.model";

export async function POST(request, context) {
  await connect();

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { classId } = context.params;
  const { location, duration, radius } = await request.json();

  try {
    const classData = await Class.findById(classId);
    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const endTime = new Date(Date.now() + duration * 1000);

    const attendanceSession = new AttendanceSession({
      class: classId,
      creator: session.user.id,
      startTime: new Date(),
      endTime: endTime,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      },
      radius: radius,
      status: 'active',
      totalStudents: classData.students.length
    });

    await attendanceSession.save();

    return NextResponse.json({
      message: 'Attendance session started',
      sessionId: attendanceSession._id,
      endTime: endTime
    });
  } catch (error) {
    console.error('Start attendance error:', error);
    return NextResponse.json({ error: 'Failed to start attendance' }, { status: 500 });
  }
}