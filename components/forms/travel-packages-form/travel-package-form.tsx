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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { createTravelPackage } from '@/app/api/travel-package/travel-package-create';
import { updateTravelPackageWithFiles } from '@/app/api/travel-package/travel-package-update-with-files';
import { updateTravelPackage } from '@/app/api/travel-package/travel-package-update';
import { TravelPackage } from '@/app/api/travel-package/travel-packages-admin';
import { AlertModal } from '@/components/modal/alert-modal';
import { deleteTravelPackage } from '@/app/api/travel-package/travel-package-delete';
import { formatTravelMonth } from './travel-package-utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  price: z.coerce.number().min(0, { message: 'Preço deve ser um número positivo' }),
  description: z.string().min(10, { message: 'Descrição deve ter pelo menos 10 caracteres' }),
  pdfMethod: z.enum(['url', 'upload'], { 
    required_error: 'Por favor, selecione uma opção para o PDF'
  }),
  pdfUrl: z.string()
    .url({ message: 'URL do PDF inválida' })
    .optional()
    .refine(val => val !== undefined && val !== '', {
      message: 'URL do PDF é obrigatória quando o método é URL',
      path: ['pdfUrl']
    }),
  maxPeople: z.coerce.number().int().positive({ message: 'Número máximo de pessoas deve ser positivo' }),
  boardingLocations: z.array(z.string()).min(1, { message: 'Pelo menos um local de embarque é necessário' }),
  travelMonth: z.string().min(1, { message: 'Mês da viagem é obrigatório' })
  .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/, { 
    message: 'Mês deve conter apenas o nome (ex: Janeiro)' 
  }),
  travelDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, { 
    message: 'Data deve estar no formato "DD/MM/AAAA"' 
  }).optional().or(z.literal('')),
  returnDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, { 
    message: 'Data de retorno deve estar no formato "DD/MM/AAAA"' 
  }).optional().or(z.literal('')),
  travelTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: 'Horário deve estar no formato "HH:MM"' 
  }).optional().or(z.literal(''))
}).refine(
  (data) => {
    if (data.pdfMethod === 'url') {
      return data.pdfUrl && data.pdfUrl.trim() !== '';
    }
    return true;
  },
  {
    message: "Por favor, forneça uma URL de PDF válida",
    path: ["pdfUrl"],
  }
);

type TravelPackageFormValues = z.infer<typeof formSchema>;

interface TravelPackageFormProps {
  initialData: TravelPackage | null;
}

export const TravelPackageForm: React.FC<TravelPackageFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [boardingLocationInput, setBoardingLocationInput] = useState('');
  
  const title = initialData ? 'Editar Pacote de Viagem' : 'Criar Pacote de Viagem';
  const description = initialData ? 'Edite os detalhes do pacote de viagem.' : 'Adicione um novo pacote de viagem';
  const toastMessage = initialData ? 'Pacote de viagem atualizado.' : 'Pacote de viagem criado.';
  const action = initialData ? 'Salvar alterações' : 'Criar';

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const processBoardingLocations = (): string[] => {
    if (!initialData?.boardingLocations) return [];
    
    if (Array.isArray(initialData.boardingLocations)) {
      const processedLocations: string[] = [];
      initialData.boardingLocations.forEach(location => {
        if (typeof location === 'string' && location.includes(',')) {
          processedLocations.push(...location.split(',').map(l => l.trim()));
        } else {
          processedLocations.push(location);
        }
      });
      return processedLocations;
    }
    
    if (typeof initialData.boardingLocations === 'string' && initialData.boardingLocations) {
      return String(initialData.boardingLocations).split(',').map(l => l.trim());
    }
    
    return [];
  };

  const defaultValues: Partial<TravelPackageFormValues> = initialData
    ? {
        name: initialData.name,
        price: initialData.price,
        description: initialData.description,
        pdfMethod: 'upload',
        pdfUrl: initialData.pdfUrl || 'https://heyzine.com/flip-book/17596072a4.html',
        maxPeople: initialData.maxPeople,
        boardingLocations: processBoardingLocations(),
        travelMonth: initialData.travelMonth,
        travelDate: initialData.travelDate || '',
        returnDate: initialData.returnDate || '',
        travelTime: initialData.travelTime || ''
      }
    : {
        name: '',
        price: 0,
        description: '',
        pdfMethod: 'upload',
        pdfUrl: 'https://heyzine.com/flip-book/17596072a4.html',
        maxPeople: 1,
        boardingLocations: [],
        travelMonth: '',
        travelDate: '',
        returnDate: '', 
        travelTime: ''
      };

  const form = useForm<TravelPackageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const addBoardingLocation = () => {
    if (boardingLocationInput.trim()) {
      const currentLocations = form.getValues().boardingLocations || [];
      form.setValue('boardingLocations', [...currentLocations, boardingLocationInput]);
      setBoardingLocationInput('');
    }
  };

  const removeBoardingLocation = (index: number) => {
    const currentLocations = form.getValues().boardingLocations || [];
    form.setValue('boardingLocations', currentLocations.filter((_, i) => i !== index));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'pdf') => {
    const file = event.target.files?.[0];
    if (file) {
      if (fileType === 'image') {
        setImageFile(file);
      } else if (fileType === 'pdf') {
        setPdfFile(file);
      }
    }
  };

  const onSubmit = async (values: TravelPackageFormValues) => {
    try {
      setLoading(true);
  
      // Verificar se os campos obrigatórios estão presentes
      if (values.pdfMethod === 'upload' && !pdfFile && !initialData) {
        toast({
          variant: 'destructive',
          title: 'Arquivo PDF obrigatório',
          description: 'Por favor, faça upload de um arquivo PDF para o pacote de viagem.'
        });
        setLoading(false);
        return;
      }
  
      // Certificar-se de que o travelMonth esteja no formato correto
      const formattedValues = {
        ...values,
        travelMonth: formatTravelMonth(values.travelMonth)
      };
  
      if (initialData) {
        // Atualizar pacote existente
        if (values.pdfMethod === 'upload') {
          // Se for upload com arquivo, usar FormData para o update
          const formData = new FormData();
          
          // Adicionar os campos do formattedValues
          Object.entries(formattedValues).forEach(([key, value]) => {
            // Pular pdfMethod no FormData
            if (key === 'pdfMethod') return;
            
            // Sempre enviar pdfUrl vazia quando o método for upload para substituir no servidor
            if (key === 'pdfUrl') {
              formData.append('pdfUrl', ''); // Importante: Enviar pdfUrl vazia para remover URL existente
              return;
            }
            
            // Tratar arrays (como boardingLocations)
            if (Array.isArray(value)) {
              value.forEach(item => {
                formData.append(key, item);
              });
            } else if (value !== undefined && value !== null) {
              formData.append(key, String(value));
            }
          });
          
          // Adicionar hasPdfFile como true para indicar upload of PDF
          formData.append('hasPdfFile', 'true');
          
          // Adicionar os arquivos se existirem
          if (imageFile) {
            formData.append('image', imageFile);
          }
          
          if (pdfFile) {
            formData.append('pdf', pdfFile);
          } else {
            // Se não tem PDF, verificar se é um update e se necessário
            toast({
              variant: 'destructive',
              title: 'Arquivo PDF obrigatório',
              description: 'Por favor, faça upload de um arquivo PDF para o pacote de viagem.'
            });
            setLoading(false);
            return;
          }
          
          // Chamar função para update com FormData
          await updateTravelPackageWithFiles(initialData.id, formData);
        } else {
          // Update normal com JSON quando usando URL
          await updateTravelPackage(initialData.id, {
            ...formattedValues,
            pdfUrl: values.pdfMethod === 'url' ? 'https://heyzine.com/flip-book/17596072a4.html' : '',
            hasPdfFile: false
          });
        }
      } else {
        // Criar novo pacote
        if (!imageFile) {
          toast({
            variant: 'destructive',
            title: 'Imagem obrigatória',
            description: 'Por favor, faça upload de uma imagem para o pacote de viagem.'
          });
          setLoading(false);
          return;
        }
        
        // Criar pacote com arquivo PDF ou URL
        if (values.pdfMethod === 'upload') {
          if (!pdfFile) {
            toast({
              variant: 'destructive',
              title: 'Arquivo PDF obrigatório',
              description: 'Por favor, faça upload de um arquivo PDF para o pacote de viagem.'
            });
            setLoading(false);
            return;
          }
          
          // Preparar FormData para criar pacote
          const formData = new FormData();
          Object.entries(formattedValues).forEach(([key, value]) => {
            // Pular pdfMethod e pdfUrl no FormData para upload
            if (key === 'pdfMethod' || key === 'pdfUrl') return;
            
            // Tratar arrays (como boardingLocations)
            if (Array.isArray(value)) {
              value.forEach(item => {
                formData.append(key, item);
              });
            } else if (value !== undefined && value !== null) {
              formData.append(key, String(value));
            }
          });
          
          // Configurar hasPdfFile como true para indicar upload de PDF
          formData.append('hasPdfFile', 'true');
          formData.append('pdfUrl', ''); // Enviar pdfUrl vazia
          
          // Adicionar arquivos
          formData.append('image', imageFile);
          formData.append('pdf', pdfFile);
          
          // Chamar createTravelPackage com os arquivos
          await createTravelPackage(
            {
              ...formattedValues,
              hasPdfFile: true,
              pdfUrl: ''
            },
            imageFile,
            pdfFile
          );
        } else {
          // Criar com URL do PDF
          await createTravelPackage(
            {
              ...formattedValues,
              hasPdfFile: false,
              pdfUrl: 'https://heyzine.com/flip-book/17596072a4.html',
            },
            imageFile,
            null
          );
        }
      }
  
      toast({
        title: toastMessage,
      });
      
      router.push('/dashboard/travel-packages');
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      
      if (initialData) {
        await deleteTravelPackage(initialData.id);
        
        toast({
          title: 'Pacote de viagem excluído.'
        });
        
        router.push('/dashboard/travel-packages');
        router.refresh();
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: error.message
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Nome do pacote de viagem"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={loading}
                    placeholder="0.00"
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
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={loading}
                    placeholder="Descrição do pacote de viagem"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Campo para escolher entre URL e Upload para o PDF */}
          <FormField
            control={form.control}
            name="pdfMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Como deseja fornecer o PDF do itinerário?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="url" disabled />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Fornecer URL do PDF
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="upload" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Fazer upload do arquivo PDF
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {form.watch('pdfMethod') === 'url' && (
            <FormField
              control={form.control}
              name="pdfUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do PDF</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      readOnly
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Campo para upload do PDF - mostrado apenas quando o método é Upload */}
          {form.watch('pdfMethod') === 'upload' && (
            <div className="flex flex-col gap-4 p-4 border border-gray-300 rounded-md shadow-sm">
              <FormLabel>Arquivo PDF do Itinerário</FormLabel>
              <div className="flex items-center">
                <label
                  htmlFor="pdf"
                  className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Escolher arquivo PDF
                </label>
                <span className="ml-4 text-gray-600 text-sm truncate">
                  {pdfFile ? pdfFile.name : 'Nenhum arquivo selecionado'}
                </span>
                <input
                  type="file"
                  id="pdf"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, 'pdf')}
                  className="hidden"
                />
              </div>
              {form.formState.errors.pdfMethod && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.pdfMethod.message}
                </p>
              )}
            </div>
          )}
          
          <FormField
            control={form.control}
            name="maxPeople"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Máximo de Pessoas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex flex-col gap-4 p-4 border border-gray-300 rounded-md shadow-sm">
            <FormLabel>Imagem do Pacote</FormLabel>
            <div className="flex items-center">
              <label
                htmlFor="image"
                className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Escolher arquivo
              </label>
              <span className="ml-4 text-gray-600 text-sm truncate">
                {imageFile ? imageFile.name : 'Nenhum arquivo selecionado'}
              </span>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'image')}
                className="hidden"
              />
            </div>
            {initialData && initialData.imageUrl && !imageFile && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Imagem atual:</p>
                <img 
                  src={initialData.imageUrl} 
                  alt={initialData.name} 
                  className="mt-2 max-h-40 object-cover rounded-md"
                />
              </div>
            )}
          </div>
          
          <FormField
            control={form.control}
            name="travelMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mês da Viagem</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Janeiro"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Exemplo: Janeiro, Fevereiro, Março...
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="travelDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data da Viagem (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="DD/MM/AAAA"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Formato: DD/MM/AAAA (exemplo: 15/01/2025)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="returnDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Retorno (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="DD/MM/AAAA"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Formato: DD/MM/AAAA (exemplo: 20/01/2025)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="travelTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário da Viagem (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="HH:MM"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Formato: HH:MM (exemplo: 08:00)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="boardingLocations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Locais de Embarque</FormLabel>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      disabled={loading}
                      placeholder="Adicionar local de embarque"
                      value={boardingLocationInput}
                      onChange={(e) => setBoardingLocationInput(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={addBoardingLocation}
                      disabled={loading}
                    >
                      Adicionar
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {field.value?.map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                        <span>{location}</span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeBoardingLocation(index)}
                          disabled={loading}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {form.formState.errors.boardingLocations && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.boardingLocations.message}
                    </p>
                  )}
                </div>
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={loading} className="ml-auto">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};