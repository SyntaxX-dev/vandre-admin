'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, Trash, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TravelPackage } from '@/app/api/travel-package/travel-packages-admin';
import { deleteTravelPackage } from '@/app/api/travel-package/travel-package-delete';
import { useToast } from '@/components/ui/use-toast';

interface CellActionProps {
  data: TravelPackage;
  onDeleteSuccess?: () => void; // New prop to handle successful deletion
}

export const CellAction: React.FC<CellActionProps> = ({ 
  data, 
  onDeleteSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Verificar se data.id está definido antes de usar
  const travelPackageId = data?.id;

  const onConfirm = async () => {
    try {
      // Validar que temos um ID válido
      if (!travelPackageId) {
        toast({
          variant: 'destructive',
          title: 'Erro ao excluir',
          description: 'ID do pacote de viagem não encontrado'
        });
        setOpen(false);
        return;
      }

      setLoading(true);
      
      // Agora podemos ter certeza de que temos um ID válido
      await deleteTravelPackage(travelPackageId);
      
      toast({
        title: 'Pacote de viagem excluído com sucesso'
      });
      
      // Call the onDeleteSuccess callback if provided
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      
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

  const handleEdit = () => {
    if (travelPackageId) {
      router.push(`/dashboard/travel-packages/${travelPackageId}?tab=details`);
    }
  };

  const handleViewBookings = () => {
    if (travelPackageId) {
      router.push(`/dashboard/travel-packages/${travelPackageId}?tab=bookings`);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>

          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleViewBookings}>
            <Users className="mr-2 h-4 w-4" /> Ver Reservas
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};