import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true
    },
    section: {
        type: String
    },
    subject: {
        type: String,
        required: true
    },
    classCode: {
        type: String,
        unique: true,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: {
        type: String
    },
    materials: [{
        title: String,
        description: String,
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    enrollments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Enrollment"
    }]
}, {
    timestamps: true
});

const Class = mongoose.models.Class || mongoose.model("Class", classSchema);
export default Class;