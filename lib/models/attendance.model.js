import mongoose from "mongoose";

const attendanceSessionSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: {
        type: Date,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    radius: {
        type: Number,
        required: true,
        default: 100 // Default radius in meters
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    },
    attendees: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        markedAt: {
            type: Date,
            default: Date.now
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true
            }
        }
    }]
}, {
    timestamps: true
});

// Index for geospatial queries
attendanceSessionSchema.index({ location: '2dsphere' });

const AttendanceSession = mongoose.models.AttendanceSession || 
    mongoose.model("AttendanceSession", attendanceSessionSchema);

export default AttendanceSession;