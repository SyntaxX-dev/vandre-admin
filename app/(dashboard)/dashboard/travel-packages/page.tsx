'use client'

import { useEffect, useState } from 'react';
import { TravelPackageClient } from '@/components/tables/travel-package-tables/travel-package-client';
import { getAdminTravelPackages, TravelPackage } from '@/app/api/travel-package/travel-packages-admin';
import BreadCrumb from '@/components/breadcrumb';

const breadcrumbItems = [{ title: 'Pacotes de Viagem', link: '/dashboard/travel-packages' }];

export default function Page() {
  const [travelPackages, setTravelPackages] = useState<TravelPackage[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  useEffect(() => {
    const fetchTravelPackages = async () => {
      try {
        const data = await getAdminTravelPackages(
          pageIndex * pageSize, 
          pageSize, 
          searchValue,
          selectedMonth
        );
        
        setTravelPackages(data.travelPackages);
        
        const calculatedPageCount = Math.ceil(data.totalCount / pageSize);
        setPageCount(calculatedPageCount);
      } catch (error) {
        console.error('Error fetching travel packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTravelPackages();
  }, [pageIndex, pageSize, searchValue, selectedMonth]);

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <BreadCrumb items={breadcrumbItems} />
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <TravelPackageClient
            data={travelPackages}
            pageCount={pageCount}
            pageSizeOptions={[10, 20, 30]}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
            onSearchChange={setSearchValue}
            onMonthChange={setSelectedMonth}
          />
        )}
      </div>
    </>
  );
}