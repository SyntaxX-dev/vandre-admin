import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { columns } from './columns';
import { Booking } from '@/app/api/bookings/bookings-admin';
import { useState, useEffect } from 'react';
import { getAdminBookings } from '@/app/api/bookings/bookings-admin';
import { useToast } from '@/components/ui/use-toast';
import { deleteBooking } from '@/app/api/bookings/booking-delete';

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
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(data);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [currentSearchValue, setCurrentSearchValue] = useState('');

  // Function to refresh the data
  const refreshData = async () => {
    try {
      const result = await getAdminBookings(
        currentPageIndex * currentPageSize,
        currentPageSize,
        currentSearchValue
      );
      
      setBookings(result.bookings);
      
      // Trigger page refresh
      router.refresh();
      setRefreshCounter(prev => prev + 1);
    } catch (error) {
      console.error('Error refreshing bookings:', error);
    }
  };

  // Update local state when props change
  useEffect(() => {
    setBookings(data);
  }, [data]);

  // Track pagination state for refresh
  useEffect(() => {
    if (onPageChange) {
      setCurrentPageIndex(currentPageIndex);
    }
  }, [currentPageIndex, onPageChange]);

  useEffect(() => {
    if (onPageSizeChange) {
      setCurrentPageSize(currentPageSize);
    }
  }, [currentPageSize, onPageSizeChange]);

  useEffect(() => {
    if (onSearchChange) {
      setCurrentSearchValue(currentSearchValue);
    }
  }, [currentSearchValue, onSearchChange]);

  // Handle delete with immediate local state update
  const handleDelete = async (id: string) => {
    try {
      // Validar que temos um ID válido antes de prosseguir
      if (!id || id === 'undefined') {
        toast({
          variant: 'destructive',
          title: 'ID da reserva inválido'
        });
        return;
      }
      
      await deleteBooking(id);
      
      // Update local state immediately
      setBookings(prevBookings => prevBookings.filter(booking => booking.id !== id));
      
      toast({
        title: 'Reserva removida com sucesso'
      });
      
      // Refresh data from server
      await refreshData();
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover a reserva',
        description: error.message
      });
    }
  };

  // Handle page change with state tracking
  const handlePageChange = (pageIndex: number) => {
    setCurrentPageIndex(pageIndex);
    if (onPageChange) {
      onPageChange(pageIndex);
    }
  };

  // Handle page size change with state tracking
  const handlePageSizeChange = (pageSize: number) => {
    setCurrentPageSize(pageSize);
    if (onPageSizeChange) {
      onPageSizeChange(pageSize);
    }
  };

  // Handle search change with state tracking
  const handleSearchChange = (searchValue: string) => {
    setCurrentSearchValue(searchValue);
    if (onSearchChange) {
      onSearchChange(searchValue);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Reservas (${bookings.length})`}
          description="Gerencie as reservas para seus pacotes de viagem."
        />
      </div>
      <Separator />
      <DataTable
        searchKey="fullName"
        columns={columns(refreshData)}
        data={bookings}
        pageCount={pageCount}
        pageSizeOptions={pageSizeOptions}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}
        totalUsers={bookings.length}
        onDelete={handleDelete}
        searchPlaceholder="Buscar por nome do passageiro..."
        key={`bookings-table-${refreshCounter}`}
      />
    </>
  );
};