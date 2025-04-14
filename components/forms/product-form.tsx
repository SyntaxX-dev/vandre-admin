"use client"
import React, { useEffect, useState } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { useToast } from '../ui/use-toast';
import { AlertModal } from '@/components/modal/alert-modal';
import { createCourse } from '@/app/api/course/createCourse';
import { uploadImage } from '@/app/api/image/image';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().optional(),
  image: z.instanceof(File, { message: 'Invalid file' }).optional(),
});

type CourseFormValues = z.infer<typeof formSchema>;

interface CourseData extends CourseFormValues {
  id?: string;
}

interface CourseFormProps {
  initialData: CourseData | null;
  courseId: string;
}

export const CourseForm: React.FC<CourseFormProps> = ({
  initialData,
  courseId,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const title = initialData ? 'Edit Course' : 'Create Course';
  const action = initialData ? 'Save changes' : 'Create';
  const description = initialData ? 'Edit a course.' : 'Add a new course';

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      image: undefined,
    },
  });

  const handleDelete = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setLoading(true);
    // Simular exclusão
    setTimeout(() => {
      toast({
        title: 'Course deleted successfully',
        description: 'The course has been deleted.',
      });
      setLoading(false);
      setIsModalOpen(false);
      router.push('/dashboard/course');
    }, 1000);
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description,
        image: undefined,
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: CourseFormValues) => {
    setLoading(true);

    try {
      let imageId: string | undefined = undefined;

      if (data.image) {
        const imageForm = new FormData();
        imageForm.append('file', data.image);
        const imageResponse = await uploadImage(imageForm);

        if (imageResponse.error) {
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: imageResponse.error,
          });
          return;
        } else {
          imageId = imageResponse.id;
        }
      }

      const response = await createCourse({
        title: data.title,
        description: data.description,
        imageId: imageId as string, 
      });

      if (response.error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: response.error,
        });
      } else {
        toast({
          title: 'Course created successfully',
          description: 'The course has been added.',
        });
        router.push('/dashboard/course');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao criar curso. Por favor, tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('image', file);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8"
          key={initialData ? initialData.id : 'new'}
        >
          <div className="gap-8 md:grid md:grid-cols-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      disabled={loading}
                      onChange={handleImageChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>

      <AlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />
    </>
  );
};
