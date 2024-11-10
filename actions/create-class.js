'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Class from '@/lib/models/class.model';
import User from '@/lib/models/user.model';
import connect from '@/lib/mongodb/mongoose';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcrypt';

export async function createClass(formData) {
    try {
        await connect();

        // Get the authenticated user's session
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        const className = formData.get('className');
        const section = formData.get('section');
        const subject = formData.get('subject');

        if (!className) {
            return { success: false, error: 'Class name is required' };
        }

        // Retrieve user from the database with case-insensitive search
        let user = await User.findOne({
            email: { $regex: new RegExp(`^${session.user.email}$`, 'i') }
        });

        console.log('Session:', session);
        console.log('Found User:', user);

        // Create user if not found and authenticated through provider
        if (!user && session.user.email) {
            const collegeId = session.user.email.split('@')[0];
            const newUser = await User.create({
                email: session.user.email,
                password: await bcrypt.hash(Math.random().toString(36), 10),
                collegeId,
                createdClasses: [],
                enrolledIn: []
            });

            user = newUser;
        }

        if (!user) {
            return { success: false, error: 'User not found and cannot be created' };
        }

        // Generate a unique class code
        let classCode;
        let isCodeUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isCodeUnique && attempts < maxAttempts) {
            attempts++;
            classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const existingClass = await Class.findOne({ classCode });
            if (!existingClass) {
                isCodeUnique = true;
            }
        }

        if (!isCodeUnique) {
            return { success: false, error: 'Unable to generate a unique class code' };
        }

        // Create the new class
        const newClass = await Class.create({
            className,
            section,
            subject,
            classCode,
            creator: user._id,
            description: '',
            materials: [],
            enrollments: []
        });

        // Update user's createdClasses array
        await User.findByIdAndUpdate(user._id, {
            $push: { createdClasses: newClass._id }
        });

        console.log('Created class:', newClass);

        revalidatePath('/');
        return { success: true, data: newClass };

    } catch (error) {
        console.error('Error creating class:', error);
        return { success: false, error: error.message || 'Failed to create class' };
    }
}
