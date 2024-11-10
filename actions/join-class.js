
'use server'

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Class from '@/lib/models/class.model';
import User from '@/lib/models/user.model';
import Enrollment from '@/lib/models/enrollment.model';
import connect from '@/lib/mongodb/mongoose';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcrypt';

export async function joinClass(formData) {
    try {
        await connect();

        // Get the authenticated user's session
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        const classCode = formData.get('classCode');
        if (!classCode) {
            return { success: false, error: 'Class code is required' };
        }

        // Get user from database with case-insensitive search
        let user = await User.findOne({ 
            email: { $regex: new RegExp(`^${session.user.email}$`, 'i') }
        });

        if (!user) {
            // If user not found, create them (for OAuth users)
            if (session.user.email) {
                const collegeId = session.user.email.split('@')[0];
                
                user = await User.create({
                    email: session.user.email,
                    password: await bcrypt.hash(Math.random().toString(36), 10),
                    collegeId: collegeId,
                    createdClasses: [],
                    enrolledIn: []
                });
            } else {
                return { success: false, error: 'User not found' };
            }
        }

        // Find the class by class code
        const classToJoin = await Class.findOne({ classCode });
        if (!classToJoin) {
            return { success: false, error: 'Invalid class code' };
        }

        // Check if user is the creator of the class
        if (classToJoin.creator.toString() === user._id.toString()) {
            return { success: false, error: 'You cannot join your own class' };
        }

        // Check if user is already enrolled
        const existingEnrollment = await Enrollment.findOne({
            student: user._id,
            class: classToJoin._id
        });

        if (existingEnrollment) {
            return { success: false, error: 'You are already enrolled in this class' };
        }

        // Create new enrollment
        const enrollment = await Enrollment.create({
            student: user._id,
            class: classToJoin._id,
            status: 'active',
            role: 'student'
        });

        // Update class enrollments array
        await Class.findByIdAndUpdate(classToJoin._id, {
            $push: { enrollments: enrollment._id }
        });

        // Update user's enrolledIn array
        await User.findByIdAndUpdate(user._id, {
            $push: { enrolledIn: enrollment._id }
        });

        revalidatePath('/');

        // Convert enrollment to plain object
        const plainEnrollment = {
            student: enrollment.student.toString(),
            class: enrollment.class.toString(),
            status: enrollment.status,
            role: enrollment.role,
            _id: enrollment._id.toString(),
            createdAt: enrollment.createdAt,
            updatedAt: enrollment.updatedAt,
            __v: enrollment.__v
        };

        return { success: true, data: plainEnrollment };

    } catch (error) {
        console.error('Error joining class:', error);
        return { success: false, error: error.message || 'Failed to join class' };
    }
}