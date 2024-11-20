        import { NextResponse } from "next/server";
        import { getServerSession } from "next-auth";
        import { authOptions } from "@/app/api/auth/[...nextauth]/route";
        import connect from "@/lib/mongodb/mongoose";
        import Class from "@/lib/models/class.model";
        import User from "@/lib/models/user.model";
        import Enrollment from "@/lib/models/enrollment.model";
        import AttendanceSession from "@/lib/models/attendance.model";

        // Helper function to calculate distance between two points
        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371e3; // Earth's radius in meters
            const φ1 = lat1 * Math.PI/180;
            const φ2 = lat2 * Math.PI/180;
            const Δφ = (lat2-lat1) * Math.PI/180;
            const Δλ = (lon2-lon1) * Math.PI/180;
            const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

            return R * c; // Distance in meters
        }

        // Start attendance session
        export async function POST(req, { params }) {
            try {
                await connect();
                const session = await getServerSession(authOptions);
                
                if (!session) {
                    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
                }

                const { location, radius, duration } = await req.json();
                const classId =await params.classId;

                // Verify user is the class creator
                const classDoc = await Class.findById(classId);
                if (!classDoc || classDoc.creator.toString() !== session.user.id) {
                    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
                }

                // Check if there's already an active session
                const activeSession = await AttendanceSession.findOne({
                    class: classId,
                    status: 'active'
                });

                if (activeSession) {
                    return NextResponse.json(
                        { error: "An active attendance session already exists" },
                        { status: 400 }
                    );
                }

                // Create new attendance session
                const endTime = new Date(Date.now() + duration * 1000);
                const attendanceSession = await AttendanceSession.create({
                    class: classId,
                    creator: session.user.id,
                    endTime,
                    location: {
                        type: 'Point',
                        coordinates: [location.longitude, location.latitude]
                    },
                    radius
                });

                // Schedule session end
                setTimeout(async () => {
                    await AttendanceSession.findByIdAndUpdate(
                        attendanceSession._id,
                        { status: 'completed' }
                    );
                }, duration * 1000);

                return NextResponse.json({ 
                    message: "Attendance session started",
                    sessionId: attendanceSession._id
                });

            } catch (error) {
                console.error('Error starting attendance:', error);
                return NextResponse.json(
                    { error: "Failed to start attendance session" },
                    { status: 500 }
                );
            }
        }

        // Mark attendance
        export async function PUT(req, { params }) {
            try {
                await connect();
                const session = await getServerSession(authOptions);
                
                if (!session) {
                    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
                }

                const { sessionId, location } = await req.json();
                const classId = await params.classId;

                // Verify student enrollment
                const enrollment = await Enrollment.findOne({
                    class: classId,
                    student: session.user.id,
                    status: 'active'
                });

                if (!enrollment) {
                    return NextResponse.json(
                        { error: "Not enrolled in this class" },
                        { status: 401 }
                    );
                }

                // Get active attendance session
                const attendanceSession = await AttendanceSession.findOne({
                    _id: sessionId,
                    class: classId,
                    status: 'active'
                });

                if (!attendanceSession) {
                    return NextResponse.json(
                        { error: "No active attendance session found" },
                        { status: 404 }
                    );
                }

                // Calculate distance between student and class location
                const distance = calculateDistance(
                    location.latitude,
                    location.longitude,
                    attendanceSession.location.coordinates[1],
                    attendanceSession.location.coordinates[0]
                );

                if (distance > attendanceSession.radius) {
                    return NextResponse.json(
                        { error: "You are too far from the class location" },
                        { status: 400 }
                    );
                }

                // Check if student already marked attendance
                const alreadyMarked = attendanceSession.attendees.some(
                    a => a.student.toString() === session.user.id
                );

                if (alreadyMarked) {
                    return NextResponse.json(
                        { error: "Attendance already marked" },
                        { status: 400 }
                    );
                }

                // Mark attendance
                await AttendanceSession.findByIdAndUpdate(
                    sessionId,
                    {
                        $push: {
                            attendees: {
                                student: session.user.id,
                                location: {
                                    type: 'Point',
                                    coordinates: [location.longitude, location.latitude]
                                }
                            }
                        }
                    }
                );

                return NextResponse.json({ message: "Attendance marked successfully" });

            } catch (error) {
                console.error('Error marking attendance:', error);
                return NextResponse.json(
                    { error: "Failed to mark attendance" },
                    { status: 500 }
                );
            }
        }

        // Get attendance session status
        export async function GET(req, { params }) {
            try {
                await connect();
                const session = await getServerSession(authOptions);
                
                if (!session) {
                    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
                }

                const classId =await params.classId;

                // Verify class access
                const enrollment = await Enrollment.findOne({
                    class: classId,
                    student: session.user.id,
                    status: 'active'
                });

                const classDoc = await Class.findById(classId);
                if (!enrollment && classDoc.creator.toString() !== session.user.id) {
                    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
                }

                // Get active attendance session
                const activeSession = await AttendanceSession.findOne({
                    class: classId,
                    status: 'active'
                });

                if (!activeSession) {
                    return NextResponse.json({ active: false });
                }

                // Check if user has marked attendance
                const hasMarked = activeSession.attendees.some(
                    a => a.student.toString() === session.user.id
                );

                return NextResponse.json({
                    active: true,
                    sessionId: activeSession._id,
                    hasMarked,
                    endTime: activeSession.endTime
                });

            } catch (error) {
                console.error('Error getting attendance status:', error);
                return NextResponse.json(
                    { error: "Failed to get attendance status" },
                    { status: 500 }
                );
            }
        }

        export async function PATCH(req, { params }) {
            try {
                await connect();
                const session = await getServerSession(authOptions);
                
                if (!session) {
                    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
                }

                const { sessionId } = await req.json();
                const classId =await params.classId;

                // Verify user is the class creator
                const classDoc = await Class.findById(classId);
                if (!classDoc || classDoc.creator.toString() !== session.user.id) {
                    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
                }

                // End the session
                await AttendanceSession.findByIdAndUpdate(
                    sessionId,
                    { status: 'completed' }
                );

                return NextResponse.json({ message: "Attendance session ended" });

            } catch (error) {
                console.error('Error ending attendance session:', error);
                return NextResponse.json(
                    { error: "Failed to end attendance session" },
                    { status: 500 }
                );
            }
        }