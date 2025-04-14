'use client';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Trash } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import FileUpload from '@/components/file-upload';
import { UploadFileResponse } from 'uploadthing/client';
import { createCommunity } from '@/app/api/community/communities-admin-created';
import { updateCommunity } from '@/app/api/community/communities-admin-update';
import { getCurrencies } from '@/app/api/currencies/currencies';
import { uploadImage } from '@/app/api/imageUpload/ImageUpload';

const ImgSchema = z.object({
  fileName: z.string(),
  name: z.string(),
  fileSize: z.number(),
  size: z.number(),
  fileKey: z.string(),
  key: z.string(),
  fileUrl: z.string(),
  url: z.string()
});
export const IMG_MAX_LIMIT = 3;

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(3, { message: 'Description must be at least 3 characters' }),
  entryType: z.enum(['FREE', 'PAID']),
  thumbnailId: z.string().min(1, { message: 'Thumbnail ID is required' }),
  price: z.object({
    amount: z.number().min(0, { message: 'Price must be at least 0' }),
    currencyId: z.string().min(1, { message: 'Currency ID is required' })
  }),
});

type CommunityFormValues = z.infer<typeof formSchema>;

interface CommunityFormProps {
  initialData: any | null;
  categories: any;
}

interface Currency {
  id: string;
  name: string;
  code: string;
  icon: {
    url: string;
  };
}

interface CurrencyResponse {
  currencies: Currency[];
}


export const CommunityForm: React.FC<CommunityFormProps> = ({
  initialData,
  categories
}) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const title = initialData ? 'Edit Communities' : 'Create Communities';
  const description = initialData ? 'Edit a Community.' : 'Add a new Community';
  const toastMessage = initialData ? 'Community updated.' : 'Community created.';
  const action = initialData ? 'Save changes' : 'Create';

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState<boolean>(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [thumbnailId, setThumbnailId] = useState<string | null>(initialData?.thumbnailId || null);


  const defaultValues = initialData
  ? {
      title: initialData.title,
      description: initialData.description,
      entryType: initialData.entryType,
      thumbnailId: initialData.thumbnailId,
      price: {
        amount: initialData.price?.amount || 0,
        currencyId: initialData.price?.currency?.id || ''
      },
      currencyId: initialData.price?.currency?.id || ''
    }
  : {
      title: '',
      description: '',
      entryType: 'FREE',
      thumbnailId: '',
      price: {
        amount: 0,
        currencyId: ''
      },
      currencyId: ''
    };


  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const handleImageUpload = async (file: File) => {
    try {
      const { id } = await uploadImage(file);
      setThumbnailId(id);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer upload da imagem',
      });
    }
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(true);
  
      const formValues = form.getValues();
  
      const formData = {
        ...formValues,
        price: {
          amount: formValues.price.amount,
          currency: { id: formValues.price.currencyId }
        },
        thumbnailId: thumbnailId ?? ""
      };
  
      if (initialData) {
        await updateCommunity(initialData.id, formData);
        toast({
          title: 'Community updated.',
          description: 'Your community has been updated successfully.',
        });
      } else {
        await createCommunity(formData);
        toast({
          title: 'Community created.',
          description: 'Your new community has been created successfully.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
      });
    } finally {
      setLoading(false);
      router.refresh();
      router.push('/dashboard/communities');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      handleImageUpload(file);
    }
  };

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await getCurrencies();
        if (Array.isArray(response)) {
          setCurrencies(response);
        }
      } catch (error) {
        console.error('Failed to fetch currencies:', error);
      } finally {
        setLoadingCurrencies(false);
      }
    };

    fetchCurrencies();
  }, []);

  const onDelete = async () => {
    try {
      setLoading(true);
      router.refresh();
      router.push('/dashboard/communities');
    } catch (error: any) {
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      {/* <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      /> */}
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form className="w-full space-y-8">
          {/* Campos do formulário */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Community Title"
                    {...field}
                  />
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
                  <Input
                    disabled={loading}
                    placeholder="Community Description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="entryType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Type</FormLabel>
                <FormControl>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entry type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FREE">FREE</SelectItem>
                      <SelectItem value="PAID">PAID</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-4 p-4 border border-gray-300 rounded-md shadow-sm">
            <label
              htmlFor="thumbnail"
              className="text-sm font-medium"
            >
              Thumbnail
            </label>
            <div className="flex items-center">
              <label
                htmlFor="thumbnail"
                className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Escolher arquivo
              </label>
              <span className="ml-4 text-gray-600 text-sm truncate">
                {imageFile ? imageFile.name : 'Nenhum arquivo selecionado'}
              </span>
              <input
                type="file"
                id="thumbnail"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
          <FormField
            control={form.control}
            name="price.amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Amount</FormLabel>
                <FormControl>
                  <Input type="number" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price.currencyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Select
                    disabled={loading || loadingCurrencies}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.id}>
                          {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botão de envio */}
          <Button
            type="button"
            onClick={handleFormSubmit}
            disabled={loading}
          >
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
