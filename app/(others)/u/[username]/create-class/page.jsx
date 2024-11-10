'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createClass } from '@/actions/create-class';

export default function CreateClass() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(formData) {
    setIsLoading(true);
    try {
      const result = await createClass(formData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Class created successfully!",
        });
        // Redirect to the home route
        router.push('/');
      } else {
        throw new Error(result.error || 'Failed to create class');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Create a New Class</h1>
      <form action={onSubmit} className="space-y-4">
        <div className='space-y-2'>
          <Label htmlFor="className">Class Name *</Label>
          <Input
            id="className"
            name="className"
            required
            aria-required="true"
            disabled={isLoading}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor="section">Section</Label>
          <Input
            id="section"
            name="section"
            disabled={isLoading}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            disabled={isLoading}
          />
        </div>
        <Button
          variant="dark"
          type="submit"
          disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Class'}
        </Button>
      </form>
    </div>
  );
}
