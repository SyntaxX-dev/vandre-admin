'use client'

import { useEffect, useState, useRef } from 'react';
import { BookingClient } from '@/components/tables/bookings-tables/booking-client';
import { getAdminBookings, Booking } from '@/app/api/bookings/bookings-admin';
import BreadCrumb from '@/components/breadcrumb';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const breadcrumbItems = [{ title: 'Reservas', link: '/dashboard/bookings' }];

export default function Page() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState<string>('');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const isSearchActive = useRef(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearchValue = searchParams?.get('search') || '';
  
  // Inicializa o valor de busca da URL apenas uma vez
  useEffect(() => {
    if (!initialLoadComplete && urlSearchValue) {
      console.log('Inicializando busca da URL:', urlSearchValue);
      setSearchValue(urlSearchValue);
      isSearchActive.current = true;
    }
    setInitialLoadComplete(true);
  }, [urlSearchValue, initialLoadComplete]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        
        console.log("Buscando reservas com parâmetros:", {
          skip: pageIndex * pageSize,
          take: pageSize,
          searchValue: isSearchActive.current ? searchValue : '',
        });
        
        const data = await getAdminBookings(
          pageIndex * pageSize, 
          pageSize, 
          isSearchActive.current ? searchValue : ''
        );
        
        console.log(`Recebidos ${data.bookings.length} reservas de um total de ${data.totalCount}`);
        
        setBookings(data.bookings);
        
        const calculatedPageCount = Math.ceil(data.totalCount / pageSize);
        setPageCount(calculatedPageCount);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    // Garantir que a busca seja realizada quando os parâmetros mudarem
    if (initialLoadComplete) {
      fetchBookings();
    }
  }, [pageIndex, pageSize, searchValue, initialLoadComplete]);

  // Manipulador para quando a busca for alterada
  const handleSearchChange = (value: string) => {
    console.log('Valor de busca alterado para:', value);
    setSearchValue(value);
    
    // Se o valor de busca estiver vazio, desativamos o modo de busca
    if (!value || value.trim() === '') {
      isSearchActive.current = false;
      // Limpamos a URL de busca
      if (searchParams?.has('search')) {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('search');
        router.push(`?${newParams.toString()}`);
      }
    } else {
      // Ativamos o modo de busca
      isSearchActive.current = true;
    }
    
    // Volta para a primeira página quando fizer uma nova pesquisa
    setPageIndex(0);
  };

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <BreadCrumb items={breadcrumbItems} />
          {/* <Button
            onClick={() => router.push('/dashboard/bookings/new')}
            className="text-xs md:text-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Nova Reserva
          </Button> */}
        </div>
        
        {loading && !bookings.length ? (
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
            onSearchChange={handleSearchChange}
            currentSearchValue={searchValue}
            isLoading={loading}
          />
        )}
      </div>
    </>
  );
}