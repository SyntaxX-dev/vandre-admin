'use client';
import { useState, useEffect } from 'react';
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
import { getTravelPackageById } from '@/app/api/travel-package/travel-package-by-id';
import { TravelPackage } from '@/app/api/travel-package/travel-packages-admin';

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
  const [travelPackage, setTravelPackage] = useState<TravelPackage | null>(null);
  const [loadingPackage, setLoadingPackage] = useState(true);

  useEffect(() => {
    const fetchTravelPackage = async () => {
      if (booking.travelPackageId) {
        try {
          setLoadingPackage(true);
          const data = await getTravelPackageById(booking.travelPackageId);
          setTravelPackage(data);
        } catch (error) {
          console.error('Erro ao buscar pacote de viagem:', error);
          toast({
            variant: 'destructive',
            title: 'Erro ao carregar pacote de viagem',
            description: 'Não foi possível carregar os detalhes do pacote de viagem.'
          });
        } finally {
          setLoadingPackage(false);
        }
      }
    };

    fetchTravelPackage();
  }, [booking.travelPackageId, toast]);

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

      {/* Card com detalhes do pacote de viagem */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pacote de Viagem</CardTitle>
          <CardDescription>Detalhes do pacote reservado</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loadingPackage ? (
            <div className="col-span-2">Carregando detalhes do pacote...</div>
          ) : travelPackage ? (
            <>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nome do Pacote</h3>
                <p className="mt-1 text-base font-medium">{travelPackage.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Mês da Viagem</h3>
                <p className="mt-1 text-base">{travelPackage.travelMonth}</p>
              </div>
              {travelPackage.travelDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Data da Viagem</h3>
                  <p className="mt-1 text-base">{formatDate(travelPackage.travelDate)}</p>
                </div>
              )}
              {travelPackage.returnDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Data de Retorno</h3>
                  <p className="mt-1 text-base">{formatDate(travelPackage.returnDate)}</p>
                </div>
              )}
              {travelPackage.travelTime && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Horário da Viagem</h3>
                  <p className="mt-1 text-base">{travelPackage.travelTime}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Preço</h3>
                <p className="mt-1 text-base">R$ {travelPackage.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="col-span-2">
                <Button
                  onClick={() => router.push(`/dashboard/travel-packages/${travelPackage.id}`)}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Ver Detalhes Completos do Pacote
                </Button>
              </div>
            </>
          ) : (
            <div className="col-span-2">
              <p>Não foi possível carregar os detalhes do pacote de viagem.</p>
              <p className="text-sm text-gray-500 mt-1">ID do Pacote: {booking.travelPackageId}</p>
            </div>
          )}
        </CardContent>
      </Card>

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
          <div>
            <h3 className="text-sm font-medium text-gray-500">Cidade</h3>
            <p className="mt-1 text-base">{booking.city}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Como nos Conheceu</h3>
            <p className="mt-1 text-base">{booking.howDidYouMeetUs}</p>
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
