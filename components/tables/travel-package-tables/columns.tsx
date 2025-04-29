import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { TravelPackage } from '@/app/api/travel-package/travel-packages-admin';
import { CellAction } from './cell-action';

// We need to accept onRefreshData callback to handle deletions
export const columns = (onRefreshData?: () => void): ColumnDef<TravelPackage>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'created_at',
    header: 'DATA DE CRIAÇÃO',
    cell: ({ row }) => {
      const created_at = row.getValue('created_at');
      if (!created_at) return '-';
      
      // Verificar se é uma string de data válida ou um objeto Date
      const date = typeof created_at === 'string' 
        ? new Date(created_at) 
        : created_at instanceof Date 
          ? created_at 
          : new Date();
          
      return format(date, 'dd/MM/yyyy');
    }
  },
  {
    accessorKey: 'name',
    header: 'NOME'
  },
  {
    accessorKey: 'price',
    header: 'PREÇO',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      
      // Formatar como moeda brasileira
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price);
    }
  },
  {
    accessorKey: 'travelMonth',
    header: 'MÊS/ANO'
  },
  {
    accessorKey: 'maxPeople',
    header: 'MAX. PESSOAS'
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <CellAction 
        data={row.original} 
        onDeleteSuccess={onRefreshData} 
      />
    )
  }
];