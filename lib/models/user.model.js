import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    collegeId: {
        type: String,
        unique: true,
        required: true
    },
    attendanceStats: {
        totalSessions: {
            type: Number,
            default: 0
        },
        attendedSessions: {
            type: Number,
            default: 0
        }
    },


    createdClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    enrolledIn: [{ type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" }]
},
    {
        timestamps: true
    }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;