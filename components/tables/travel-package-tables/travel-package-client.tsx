import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { columns } from './columns';
import { TravelPackage } from '@/app/api/travel-package/travel-packages-admin';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '@/services/apiUrl';
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

  // Função para lidar com clique na linha
  const handleRowClick = (packageData: TravelPackage) => {
    router.push(`/dashboard/travel-packages/${packageData.id}?tab=bookings`);
  };
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/travel-package/${id}`);
      toast.success('Pacote removido com sucesso');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao remover o pacote');
    }
  };
  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Pacotes de Viagem (${data.length})`}
          description="Gerencie os pacotes de viagem disponíveis na plataforma."
        />
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="text-xs md:text-sm"
            onClick={() => {
              // Implementar ação para ver todas as reservas se necessário
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
        columns={columns}
        data={data}
        pageCount={pageCount}
        pageSizeOptions={pageSizeOptions}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onSearchChange={onSearchChange}
        onRowClick={handleRowClick} 
        totalUsers={data.length}
        onDelete={handleDelete}
      />
    </>
  );
};
