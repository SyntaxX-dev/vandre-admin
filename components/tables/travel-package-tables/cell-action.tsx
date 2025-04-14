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
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const onConfirm = async () => {
    try {
      setLoading(true);
      await deleteTravelPackage(data.id);
      
      toast({
        title: 'Pacote de viagem excluído com sucesso'
      });
      
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
    router.push(`/dashboard/travel-packages/${data.id}?tab=details`);
  };

  const handleViewBookings = () => {
    router.push(`/dashboard/travel-packages/${data.id}?tab=bookings`);
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