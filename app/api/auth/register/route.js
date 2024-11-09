import connect from "../../../../libs/mongodb/mongoose";
import User from "../../../../libs/models/user.model";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connect();
        
        const formData = await req.formData();
        const email = formData.get("email");
        const password = formData.get("password");
        
        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }
        
        // Extract collegeId from email (everything before @)
        const collegeId = email.split('@')[0];
        
        // Validate collegeId format
        if (!collegeId || collegeId.length === 0) {
            return NextResponse.json(
                { message: "Invalid email format" },
                { status: 400 }
            );
        }
        
        // Check for existing user by email
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return NextResponse.json(
                { message: "Email already registered" },
                { status: 400 }
            );
        }
        
        // Check for existing user by collegeId
        const existingUserByCollegeId = await User.findOne({ collegeId });
        if (existingUserByCollegeId) {
            return NextResponse.json(
                { message: "College ID already registered" },
                { status: 400 }
            );
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const user = await User.create({
            email,
            password: hashedPassword,
            collegeId
        });
        
        // Remove password from response
        const userResponse = {
            email: user.email,
            collegeId: user.collegeId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            _id: user._id
        };
        
        return NextResponse.json(
            { 
                message: "User created successfully", 
                user: userResponse 
            },
            { status: 201 }
        );
        
    } catch (error) {
        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json(
                { 
                    message: `${field === 'email' ? 'Email' : 'College ID'} already exists` 
                },
                { status: 400 }
            );
        }
        
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}