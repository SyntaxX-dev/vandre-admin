'use client'

import { useEffect, useState } from 'react';
import { BookingClient } from '@/components/tables/bookings-tables/booking-client';
import { getAdminBookings, Booking } from '@/app/api/bookings/bookings-admin';
import BreadCrumb from '@/components/breadcrumb';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const breadcrumbItems = [{ title: 'Reservas', link: '/dashboard/bookings' }];

export default function Page() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        
        console.log("Buscando reservas com parâmetros:", {
          skip: pageIndex * pageSize,
          take: pageSize,
          searchValue
        });
        
        const data = await getAdminBookings(
          pageIndex * pageSize, 
          pageSize, 
          searchValue
        );
        
        console.log("Reservas recebidas:", data.bookings);
        
        setBookings(data.bookings);
        
        const calculatedPageCount = Math.ceil(data.totalCount / pageSize);
        setPageCount(calculatedPageCount);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [pageIndex, pageSize, searchValue]);

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <BreadCrumb items={breadcrumbItems} />
          <Button
            onClick={() => router.push('/dashboard/bookings/new')}
            className="text-xs md:text-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Nova Reserva
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Carregando...</p>
          </div>
        ) : (
          <BookingClient
            data={bookings}
            pageCount={pageCount}
            pageSizeOptions={[10, 20, 30]}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
            onSearchChange={setSearchValue}
          />
        )}
      </div>
    </>
  );
}