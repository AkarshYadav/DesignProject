// app/api/classes/teaching/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import connect from "@/lib/mongodb/mongoose";
import Class from "@/lib/models/class.model";

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

    const teachingClasses = await Class.find({
      creator: session.user.id
    }).select('className subject classCode description section');

    return NextResponse.json({ teachingClasses });
  } catch (error) {
    console.error('Teaching Classes API Error:', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}