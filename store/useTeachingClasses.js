import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import connect from "@/lib/mongodb/mongoose";
import Class from "@/lib/models/class.model";
import { getServerSession } from "next-auth/next";

export const useTeachingClasses = create(
  immer((set, get) => ({
    teachingClasses: [],
    isLoading: false,
    isError: false,
    fetchTeachingClasses: async () => {
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

        const teachingClasses = await Class.find({
          creator: session.user.id
        }).select('className subject classCode description section');

        set((state) => {
          state.teachingClasses = teachingClasses;
          state.isLoading = false;
        });
      } catch (error) {
        console.error('Teaching Classes API Error:', error);
        set((state) => {
          state.isLoading = false;
          state.isError = true;
        });
      }
    }
  }))
);
