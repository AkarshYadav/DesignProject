// app/api/classes/[classId]/attendance/stream/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connect from "@/lib/mongodb/mongoose";
import AttendanceSession from "@/lib/models/attendance.model";

export async function GET(request, context) {
  await connect();

  // Get session and check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { classId } = context.params;

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Function to send an event
      const sendEvent = (data) => {
        const formattedEvent = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(formattedEvent));
      };

      // Watch for attendance changes
      const watchAttendance = async () => {
        try {
          const activeSession = await AttendanceSession.findOne({
            class: classId,
            status: 'active',
          }).populate('attendees.student', 'name collegeId');

          if (activeSession) {
            sendEvent({
              type: 'attendance-update',
              attendees: activeSession.attendees.map((attendee) => ({
                name: attendee.student.name,
                collegeId: attendee.student.collegeId,
                markedAt: attendee.markedAt,
              })),
            });
          }
        } catch (error) {
          console.error('Streaming error:', error);
        }
      };

      // Initial check
      watchAttendance();

      // Set up periodic checks
      const intervalId = setInterval(watchAttendance, 5000);

      // Cleanup
      controller.close = () => {
        clearInterval(intervalId);
      };
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
