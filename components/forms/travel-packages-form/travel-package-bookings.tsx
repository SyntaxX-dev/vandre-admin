'use client';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAdminBookings, Booking } from '@/app/api/bookings/bookings-admin';
import { getTravelPackageById } from '@/app/api/travel-package/travel-package-by-id';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Trash, Download, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { AlertModal } from '@/components/modal/alert-modal';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { deleteBooking } from '@/app/api/bookings/booking-delete';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TravelPackageBookingsProps {
  travelPackageId: string;
}

export const TravelPackageBookings: React.FC<TravelPackageBookingsProps> = ({
  travelPackageId
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAlertId, setOpenAlertId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [packageInfo, setPackageInfo] = useState<{ name: string, travelMonth: string } | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        // Buscamos todas as reservas e filtramos pelo ID do pacote no cliente
        const result = await getAdminBookings(0, 1000); // Buscar um número grande para pegar todas

        // Filtrar apenas as reservas do pacote atual
        const filteredBookings = result.bookings.filter(
          booking => booking.travelPackageId === travelPackageId
        );

        setBookings(filteredBookings);

        // Buscar informações do pacote para o cabeçalho do PDF
        try {
          const packageData = await getTravelPackageById(travelPackageId);
          setPackageInfo({
            name: packageData.name,
            travelMonth: packageData.travelMonth
          });
        } catch (error) {
          console.error('Erro ao buscar detalhes do pacote:', error);
        }
      } catch (error) {
        console.error('Erro ao buscar reservas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (travelPackageId) {
      fetchBookings();
    }
  }, [travelPackageId]);

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(true);
      await deleteBooking(id);

      // Atualizar a lista após excluir
      setBookings(bookings.filter(booking => booking.id !== id));

      toast({
        title: 'Reserva excluída com sucesso'
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: error.message
      });
    } finally {
      setDeleteLoading(false);
      setOpenAlertId(null);
    }
  };

  // Exportar lista de passageiros para CSV
  const exportToCSV = () => {
    if (bookings.length === 0) return;

    // Preparar as colunas do CSV
    const headers = ['Nome Completo', 'CPF', 'RG', 'Email', 'Telefone', 'Data Nascimento', 'Local de Embarque'];

    // Preparar os dados
    const csvData = bookings.map(booking => [
      booking.fullName,
      booking.cpf,
      booking.rg,
      booking.email,
      booking.phone,
      booking.birthDate ? (typeof booking.birthDate === 'string' ? booking.birthDate.split('T')[0] : format(booking.birthDate, 'dd/MM/yyyy')) : '',
      booking.boardingLocation
    ]);

    // Combinar cabeçalhos e dados
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Criar e fazer download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `passageiros-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar lista de passageiros para PDF
  const exportToPDF = () => {
    if (bookings.length === 0) return;

    // @ts-ignore
    const doc = new jsPDF();

    // Adicionar título
    doc.setFontSize(18);
    doc.text('Lista de Passageiros', 14, 22);

    // Adicionar informações do pacote
    doc.setFontSize(12);
    if (packageInfo) {
      doc.text(`Pacote: ${packageInfo.name}`, 14, 32);
      doc.text(`Data: ${packageInfo.travelMonth}`, 14, 38);
    }

    doc.text(`Total de passageiros: ${bookings.length}`, 14, 44);
    doc.text(`Data de emissão: ${format(new Date(), 'dd/MM/yyyy')}`, 14, 50);

    // Converter dados para formato de tabela
    const tableColumn = ["Nome", "CPF", "RG", "Telefone", "Email", "Data Nasc.", "Local de Embarque"];
    const tableRows = bookings.map(booking => [
      booking.fullName,
      booking.cpf,
      booking.rg,
      booking.phone,
      booking.email,
      booking.birthDate ? (typeof booking.birthDate === 'string' ? booking.birthDate.split('T')[0] : format(booking.birthDate, 'dd/MM/yyyy')) : '',
      booking.boardingLocation
    ]);

    // @ts-ignore
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 40 }, // Nome
        4: { cellWidth: 45 }, // Email
        6: { cellWidth: 30 }, // Local de embarque
      },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });

    // Salvar o PDF
    doc.save(`passageiros-${packageInfo?.name || travelPackageId}-${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: 'PDF gerado com sucesso',
      description: 'A lista de passageiros foi exportada para PDF'
    });
  };

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: 'fullName',
      header: 'Passageiro',
    },
    {
      accessorKey: 'cpf',
      header: 'CPF'
    },
    {
      accessorKey: 'phone',
      header: 'Telefone'
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => {
        const email = row.getValue('email') as string;
        return <span className="text-xs">{email}</span>;
      }
    },
    {
      accessorKey: 'boardingLocation',
      header: 'Embarque'
    },
    {
      accessorKey: 'created_at',
      header: 'Data Reserva',
      cell: ({ row }) => {
        const createdAt = row.getValue('created_at');
        if (!createdAt) return '-';

        try {
          const date = typeof createdAt === 'string'
            ? new Date(createdAt)
            : createdAt instanceof Date
              ? createdAt
              : new Date();

          return format(date, 'dd/MM/yyyy');
        } catch {
          return String(createdAt).split('T')[0] || '-';
        }
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const booking = row.original;

        return (
          <>
            <AlertModal
              isOpen={openAlertId === booking.id}
              onClose={() => setOpenAlertId(null)}
              onConfirm={() => handleDelete(booking.id)}
              loading={deleteLoading}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}>
                  <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenAlertId(booking.id)}>
                  <Trash className="mr-2 h-4 w-4" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      }
    }
  ];

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Reservas para este Pacote</CardTitle>
          <CardDescription>
            {bookings.length}
            {bookings.length === 1 ? ' reserva encontrada' : ' reservas encontradas'}
          </CardDescription>
        </div>

        {bookings.length > 0 && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={exportToPDF}
              className="flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Gerar PDF
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando reservas...</p>
        ) : bookings.length === 0 ? (
          <p>Nenhuma reserva encontrada para este pacote.</p>
        ) : (
          <DataTable<Booking, any>
            columns={columns}
            data={bookings}
            searchKey="fullName"
            searchPlaceholder="Buscar por nome do passageiro..."
            totalUsers={bookings.length}
            pageCount={1}
            onDelete={(id: string) => handleDelete(id)}
          />
        )}
      </CardContent>
    </Card>
  );
};
