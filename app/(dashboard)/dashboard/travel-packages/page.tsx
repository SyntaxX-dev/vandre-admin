// C:\Users\User\Documents\vandre-admin\app\(dashboard)\dashboard\travel-packages\page.tsx

'use client'

import { useEffect, useState, useRef } from 'react';
import { TravelPackageClient } from '@/components/tables/travel-package-tables/travel-package-client';
import { getAdminTravelPackages, TravelPackage } from '@/app/api/travel-package/travel-packages-admin';
import BreadCrumb from '@/components/breadcrumb';
import { useSearchParams, useRouter } from 'next/navigation';

const breadcrumbItems = [{ title: 'Pacotes de Viagem', link: '/dashboard/travel-packages' }];

export default function Page() {
  const [travelPackages, setTravelPackages] = useState<TravelPackage[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const isSearchActive = useRef(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
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
    const fetchTravelPackages = async () => {
      try {
        setLoading(true);
        
        console.log("Buscando pacotes com parâmetros:", {
          skip: pageIndex * pageSize,
          take: pageSize,
          searchValue,
          selectedMonth,
          isSearchActive: isSearchActive.current
        });
        
        const data = await getAdminTravelPackages(
          pageIndex * pageSize, 
          pageSize, 
          isSearchActive.current ? searchValue : '',
          selectedMonth
        );
        
        console.log(`Recebidos ${data.travelPackages.length} pacotes de um total de ${data.totalCount}`);
        
        setTravelPackages(data.travelPackages);
        
        const calculatedPageCount = Math.ceil(data.totalCount / pageSize);
        setPageCount(calculatedPageCount);
      } catch (error) {
        console.error('Erro ao buscar pacotes de viagem:', error);
      } finally {
        setLoading(false);
      }
    };

    // Garantir que a busca seja realizada quando os parâmetros mudarem
    if (initialLoadComplete) {
      fetchTravelPackages();
    }
  }, [pageIndex, pageSize, searchValue, selectedMonth, initialLoadComplete]);

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
        <BreadCrumb items={breadcrumbItems} />
        {loading && !travelPackages.length ? (
          <p>Carregando...</p>
        ) : (
          <TravelPackageClient
            data={travelPackages}
            pageCount={pageCount}
            pageSizeOptions={[10, 20, 30]}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
            onSearchChange={handleSearchChange}
            onMonthChange={setSelectedMonth}
            currentSearchValue={searchValue}
            isLoading={loading}
          />
        )}
      </div>
    </>
  );
}