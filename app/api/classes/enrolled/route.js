// app/api/classes/enrolled/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import connect from "@/lib/mongodb/mongoose";
import Enrollment from "@/lib/models/enrollment.model";

export async function GET() {
  try {
    await connect();

    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const enrollments = await Enrollment.find({
      student: session.user.id,
      status: "active"
    }).populate({
      path: 'class',
      select: 'className subject classCode description section creator'
    });

    const enrolledClasses = enrollments.map(enrollment => enrollment.class);

    return NextResponse.json({ enrolledClasses });
  } catch (error) {
    console.error('Enrolled Classes API Error:', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}