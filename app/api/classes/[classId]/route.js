// app/api/classes/[classId]/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse  } from "next/server";
import connect from "@/lib/mongodb/mongoose";
import User from "@/lib/models/user.model";
import Class from "@/lib/models/class.model";
import Enrollment from "@/lib/models/enrollment.model";

export async function GET(request, { params }) {
  try {
    await connect();

    // Extract classId from the URL parameters
    const classId = await params.classId;
    
    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find the class
    const classData = await Class.findById(classId)
      .select('className subject classCode description section creator materials')
      .populate('creator', 'email');

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Determine user role
    let userRole = null;

    // Check if user is the creator (teacher)
    if (classData.creator._id.toString() === user._id.toString()) {
      userRole = 'teacher';
    } else {
      // Check if user is enrolled (student)
      const enrollment = await Enrollment.findOne({
        student: user._id,
        class: classData._id,
        status: 'active'
      });

      if (enrollment) {
        userRole = 'student';
      }
    }

    if (!userRole) {
      return NextResponse.json(
        { error: "Not authorized to access this class" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      classData: {
        _id: classData._id,
        className: classData.className,
        subject: classData.subject,
        classCode: classData.classCode,
        description: classData.description,
        section: classData.section,
        materials: classData.materials,
        creator: {
          email: classData.creator.email
        }
      },
      userRole
    });

  } catch (error) {
    console.error('Class API Error:', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}