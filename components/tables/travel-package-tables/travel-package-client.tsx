import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { columns } from './columns';
import { TravelPackage } from '@/app/api/travel-package/travel-packages-admin';
import { useState, useEffect } from 'react';
import { getAdminTravelPackages } from '@/app/api/travel-package/travel-packages-admin';
import { useToast } from '@/components/ui/use-toast';
import { deleteTravelPackage } from '@/app/api/travel-package/travel-package-delete';

interface TravelPackageClientProps {
  data: TravelPackage[];
  pageCount: number;
  pageSizeOptions?: number[];
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange?: (searchValue: string) => void;
  onMonthChange?: (month: string) => void;
}

export const TravelPackageClient: React.FC<TravelPackageClientProps> = ({
  data,
  pageCount,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onMonthChange
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [packages, setPackages] = useState<TravelPackage[]>(data);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [currentSearchValue, setCurrentSearchValue] = useState('');
  const [currentMonth, setCurrentMonth] = useState('');

  // Function to refresh the data
  const refreshData = async () => {
    try {
      const result = await getAdminTravelPackages(
        currentPageIndex * currentPageSize,
        currentPageSize,
        currentSearchValue,
        currentMonth
      );
      
      setPackages(result.travelPackages);
      
      // Trigger page refresh
      router.refresh();
      setRefreshCounter(prev => prev + 1);
    } catch (error) {
      console.error('Error refreshing travel packages:', error);
    }
  };

  // Update local state when props change
  useEffect(() => {
    setPackages(data);
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

  useEffect(() => {
    if (onMonthChange) {
      setCurrentMonth(currentMonth);
    }
  }, [currentMonth, onMonthChange]);

  // Função para lidar com clique na linha
  const handleRowClick = (packageData: TravelPackage) => {
    router.push(`/dashboard/travel-packages/${packageData.id}?tab=bookings`);
  };
  
  // Handle delete with immediate local state update
  const handleDelete = async (id: string) => {
    try {
      // Validar que temos um ID válido antes de prosseguir
      if (!id || id === 'undefined') {
        toast({
          variant: 'destructive',
          title: 'ID do pacote inválido'
        });
        return;
      }
      
      await deleteTravelPackage(id);
      
      // Update local state immediately
      setPackages(prevPackages => prevPackages.filter(pkg => pkg.id !== id));
      
      toast({
        title: 'Pacote removido com sucesso'
      });
      
      // Refresh data from server
      await refreshData();
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover o pacote',
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

  // Handle month change with state tracking
  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
    if (onMonthChange) {
      onMonthChange(month);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Pacotes de Viagem (${packages.length})`}
          description="Gerencie os pacotes de viagem disponíveis na plataforma."
        />
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="text-xs md:text-sm"
            onClick={() => {
              router.push('/dashboard/bookings');
            }}
          >
            <Users className="mr-2 h-4 w-4" /> Todas as Reservas
          </Button>
          <Button
            className="text-xs md:text-sm"
            onClick={() => router.push('/dashboard/travel-packages/new')}
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar Novo
          </Button>
        </div>
      </div>
      <Separator />
      <DataTable
        searchKey="name"
        columns={columns(refreshData)}
        data={packages}
        pageCount={pageCount}
        pageSizeOptions={pageSizeOptions}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}
        onRowClick={handleRowClick} 
        totalUsers={packages.length}
        onDelete={handleDelete}
        key={`travel-packages-table-${refreshCounter}`}
      />
    </>
  );
};