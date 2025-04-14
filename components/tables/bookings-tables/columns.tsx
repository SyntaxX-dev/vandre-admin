import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Booking } from '@/app/api/bookings/bookings-admin';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Booking>[] = [
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
      const createdAt = row.getValue('created_at');
      if (!createdAt) return '-';
      
      try {
        // Verificar se é uma string de data válida ou um objeto Date
        const date = typeof createdAt === 'string' 
          ? new Date(createdAt) 
          : createdAt instanceof Date 
            ? createdAt 
            : new Date();
            
        return format(date, 'dd/MM/yyyy');
      } catch (error) {
        console.error("Erro ao formatar data:", error, createdAt);
        return String(createdAt).split('T')[0] || '-';
      }
    }
  },
  {
    accessorKey: 'fullName',
    header: 'PASSAGEIRO'
  },
  {
    accessorKey: 'cpf',
    header: 'CPF'
  },
  {
    accessorKey: 'email',
    header: 'EMAIL'
  },
  {
    accessorKey: 'phone',
    header: 'TELEFONE'
  },
  {
    accessorKey: 'boardingLocation',
    header: 'LOCAL DE EMBARQUE'
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];