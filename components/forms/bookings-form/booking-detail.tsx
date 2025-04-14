'use client';
import { useState } from 'react';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { useToast } from '@/components/ui/use-toast';
import { AlertModal } from '@/components/modal/alert-modal';
import { Booking } from '@/app/api/bookings/bookings-admin';
import { deleteBooking } from '@/app/api/bookings/booking-delete';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface BookingDetailProps {
  booking: Booking;
}

export const BookingDetail: React.FC<BookingDetailProps> = ({
  booking
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' 
        ? new Date(dateString)
        : dateString;
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      return String(dateString);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await deleteBooking(booking.id);
      
      toast({
        title: 'Reserva excluída com sucesso'
      });
      
      router.push('/dashboard/bookings');
      router.refresh();
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
        <Heading
          title="Detalhes da Reserva"
          description={`Informações da reserva: ${booking.fullName}`}
        />
        <Button
          disabled={loading}
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Trash className="h-4 w-4 mr-2" />
          Excluir Reserva
        </Button>
      </div>
      <Separator />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Informações do Passageiro</CardTitle>
          <CardDescription>Dados pessoais do passageiro</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Nome Completo</h3>
            <p className="mt-1 text-base">{booking.fullName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">CPF</h3>
            <p className="mt-1 text-base">{booking.cpf}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">RG</h3>
            <p className="mt-1 text-base">{booking.rg}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Data de Nascimento</h3>
            <p className="mt-1 text-base">{formatDate(booking.birthDate)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1 text-base">{booking.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
            <p className="mt-1 text-base">{booking.phone}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Informações da Viagem</CardTitle>
          <CardDescription>Detalhes sobre a reserva</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">ID do Pacote</h3>
            <p className="mt-1 text-base">{booking.travelPackageId}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Local de Embarque</h3>
            <p className="mt-1 text-base">{booking.boardingLocation}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Data de Criação</h3>
            <p className="mt-1 text-base">{formatDate(booking.created_at)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Última Atualização</h3>
            <p className="mt-1 text-base">{formatDate(booking.updated_at)}</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 flex justify-end">
        <Button
          onClick={() => router.push('/dashboard/bookings')}
          variant="outline"
          className="mr-2"
        >
          Voltar para Lista
        </Button>
      </div>
    </>
  );
};