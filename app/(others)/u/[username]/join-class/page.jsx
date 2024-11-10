'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { joinClass } from '@/actions/join-class';

export default function JoinClass() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(formData) {
    setIsLoading(true);
    try {
      const result = await joinClass(formData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Successfully joined the class!",
        });
        // Redirect to the home route or classes page
        router.push('/');
      } else {
        throw new Error(result.error || 'Failed to join class');
      }
    } catch (error) {
      console.error('Error joining class:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-8">Join Class</h1>
      <form action={onSubmit} className="space-y-4">
        <div className=''>
          <Label htmlFor="classCode" className='text-xl'>Class Code</Label>
          <p className='my-2'>Ask your teacher for the class code, then enter it here</p>
          <Input
            id="classCode"
            name="classCode"
            required
            aria-required="true"
            disabled={isLoading}
          />
        </div>
        <Button
          variant="dark"
          type="submit"
          disabled={isLoading}
          className='rounded-2xl'>
          {isLoading ? 'Joining...' : 'Join Class'}
        </Button>
      </form>
    </div>
  );
}
