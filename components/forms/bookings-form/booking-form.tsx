'use client';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
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
import { useToast } from '@/components/ui/use-toast';
import { createBooking } from '@/app/api/bookings/booking-create';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { TravelPackage } from '@/app/api/travel-package/travel-packages-admin';
import { getAdminTravelPackages } from '@/app/api/travel-package/travel-packages-admin';

const formSchema = z.object({
  travelPackageId: z.string().min(1, { message: 'O pacote de viagem é obrigatório' }),
  fullName: z.string().min(3, { message: 'Nome completo deve ter pelo menos 3 caracteres' }),
  rg: z.string().min(1, { message: 'RG é obrigatório' }),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF inválido, formato esperado: 000.000.000-00',
  }),
  birthDate: z.string().min(1, { message: 'Data de nascimento é obrigatória' }),
  phone: z.string().min(1, { message: 'Telefone é obrigatório' }),
  email: z.string().email({ message: 'Email inválido' }),
  boardingLocation: z.string().min(1, { message: 'Local de embarque é obrigatório' }),
});

type BookingFormValues = z.infer<typeof formSchema>;

export const BookingForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [travelPackages, setTravelPackages] = useState<TravelPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
  const [loadingPackages, setLoadingPackages] = useState(true);

  const defaultValues: BookingFormValues = {
    travelPackageId: '',
    fullName: '',
    rg: '',
    cpf: '',
    birthDate: '',
    phone: '',
    email: '',
    boardingLocation: '',
  };

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  useEffect(() => {
    const fetchTravelPackages = async () => {
      try {
        setLoadingPackages(true);
        const data = await getAdminTravelPackages(0, 100);
        setTravelPackages(data.travelPackages);
      } catch (error) {
        console.error('Erro ao buscar pacotes de viagem:', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar os pacotes de viagem'
        });
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchTravelPackages();
  }, [toast]);

  const handlePackageSelect = (packageId: string) => {
    const selectedPkg = travelPackages.find(pkg => pkg.id === packageId);
    setSelectedPackage(selectedPkg || null);
    form.setValue('boardingLocation', ''); // Reset boarding location when package changes
  };

  const onSubmit = async (values: BookingFormValues) => {
    try {
      setLoading(true);
      
      await createBooking(values);

      toast({
        title: 'Reserva criada com sucesso',
      });
      
      router.push('/dashboard/bookings');
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

  const formatCPF = (value: string): string => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    } else if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    } else {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCPF(e.target.value);
    form.setValue('cpf', formattedCPF);
  };

  const formatPhone = (value: string): string => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (digits.length <= 2) {
      return `(${digits}`;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value);
    form.setValue('phone', formattedPhone);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Nova Reserva"
          description="Crie uma nova reserva para um pacote de viagem"
        />
      </div>
      <Separator />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-6">
          <FormField
            control={form.control}
            name="travelPackageId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pacote de Viagem</FormLabel>
                <FormControl>
                  <Select
                    disabled={loading || loadingPackages}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handlePackageSelect(value);
                    }}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um pacote de viagem" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingPackages ? (
                        <SelectItem value="loading" disabled>
                          Carregando pacotes...
                        </SelectItem>
                      ) : travelPackages.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nenhum pacote disponível
                        </SelectItem>
                      ) : (
                        travelPackages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} - {pkg.travelMonth}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Nome completo do passageiro"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="email@exemplo.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="000.000.000-00"
                      {...field}
                      onChange={handleCPFChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Formato: 000.000.000-00
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RG</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="00.000.000-0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="(00) 00000-0000"
                      {...field}
                      onChange={handlePhoneChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="boardingLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local de Embarque</FormLabel>
                <FormControl>
                  <Select
                    disabled={loading || !selectedPackage}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedPackage ? "Selecione um local de embarque" : "Selecione um pacote primeiro"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!selectedPackage ? (
                        <SelectItem value="none" disabled>
                          Selecione um pacote primeiro
                        </SelectItem>
                      ) : selectedPackage.boardingLocations.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nenhum local de embarque disponível
                        </SelectItem>
                      ) : (
                        selectedPackage.boardingLocations.map((location, index) => (
                          <SelectItem key={index} value={location}>
                            {location}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => router.push('/dashboard/bookings')}
              variant="outline"
              className="mr-2"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              Criar Reserva
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};