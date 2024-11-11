import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import connect from "@/lib/mongodb/mongoose";
import Enrollment from "@/lib/models/enrollment.model";
import { getServerSession } from "next-auth/next";

export const useEnrolledClasses = create(
  immer((set, get) => ({
    enrolledClasses: [],
    isLoading: false,
    isError: false,
    fetchEnrolledClasses: async () => {
      set((state) => {
        state.isLoading = true;
        state.isError = false;
      });

      try {
        await connect();
        const session = await getServerSession();
        if (!session) {
          set((state) => {
            state.isLoading = false;
            state.isError = true;
          });
          return;
        }

        const enrollments = await Enrollment.find({
          student: session.user.id,
          status: "active"
        }).populate({
          path: 'class',
          select: 'className subject classCode description section creator'
        });

        const enrolledClasses = enrollments.map(enrollment => enrollment.class);

        set((state) => {
          state.enrolledClasses = enrolledClasses;
          state.isLoading = false;
        });
      } catch (error) {
        console.error('Enrolled Classes API Error:', error);
        set((state) => {
          state.isLoading = false;
          state.isError = true;
        });
      }
    }
  }))
);
