import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { columns } from './columns';
import { Booking } from '@/app/api/bookings/bookings-admin';

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
        onPageSizeChange={onPageSizeChange}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar por nome do passageiro..."
      />
    </>
  );
};