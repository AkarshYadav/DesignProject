import mongoose from "mongoose";

const attendanceRecordSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AttendanceSession",
        required: true
    },
    isPresent: {
        type: Boolean,
        default: false
    },
    markedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const AttendanceRecord = mongoose.models.AttendanceRecord || 
    mongoose.model("AttendanceRecord", attendanceRecordSchema);

export default AttendanceRecord;