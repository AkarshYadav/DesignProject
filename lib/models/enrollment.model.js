import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },
    status: {
        type: String,
        enum: ["active", "inactive", "pending"],
        default: "active"
    },
    role: {
        type: String,
        enum: ["student", "teacher"],
        default: "student"
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, class: 1 }, { unique: true });

const Enrollment = mongoose.models && mongoose.models.Enrollment 
    ? mongoose.models.Enrollment 
    : mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;

