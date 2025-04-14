import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { columns } from './columns';
import { Booking } from '@/app/api/bookings/bookings-admin';
import axios from 'axios';
import { toast } from 'react-hot-toast';
interface BookingClientProps {
  data: Booking[];
  pageCount: number;
  pageSizeOptions?: number[];
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange?: (searchValue: string) => void;
}

export const BookingClient: React.FC<BookingClientProps> = ({
  data,
  pageCount,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  onSearchChange
}) => {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/bookings/${id}`);
      toast.success('Reserva removida com sucesso');
      router.refresh();
    } catch (error) {
      toast.error('Algo deu errado ao remover a reserva');
    }
  };
  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Reservas (${data.length})`}
          description="Gerencie as reservas para seus pacotes de viagem."
        />
      </div>
      <Separator />
      <DataTable
        searchKey="fullName"
        columns={columns}
        data={data}
        pageCount={pageCount}
        pageSizeOptions={pageSizeOptions}
        onPageChange={onPageChange}
        onDelete={(id) => handleDelete(id)}
        onPageSizeChange={onPageSizeChange}
        totalUsers={data.length}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar por nome do passageiro..."
      />
    </>
  );
};
