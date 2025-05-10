'use client';
import { useEffect, useState, useRef } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAdminBookings, Booking } from '@/app/api/bookings/bookings-admin';
import { getTravelPackageById } from '@/app/api/travel-package/travel-package-by-id';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Trash, Download, FileText, Loader2, Search, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface TravelPackageBookingsProps {
  travelPackageId: string;
}

export const TravelPackageBookings: React.FC<TravelPackageBookingsProps> = ({
  travelPackageId
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAlertId, setOpenAlertId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [packageInfo, setPackageInfo] = useState<{ name: string, travelMonth: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  // Função para buscar todas as reservas deste pacote
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
      
      // Aplicar filtro de busca se existir
      applySearchFilter(filteredBookings, searchValue);

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

  // Aplicar filtro de busca às reservas
  const applySearchFilter = (bookingsToFilter: Booking[], term: string) => {
    if (!term || term.trim() === '') {
      setFilteredBookings(bookingsToFilter);
      return;
    }
    
    setIsSearching(true);
    const searchLower = term.toLowerCase();
    
    const filtered = bookingsToFilter.filter(booking => 
      booking.fullName.toLowerCase().includes(searchLower) ||
      booking.email.toLowerCase().includes(searchLower) ||
      booking.phone.toLowerCase().includes(searchLower) ||
      booking.cpf.toLowerCase().includes(searchLower) ||
      booking.boardingLocation.toLowerCase().includes(searchLower)
    );
    
    setFilteredBookings(filtered);
    setIsSearching(false);
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (travelPackageId) {
      fetchBookings();
    }
  }, [travelPackageId, refreshKey]);

  // Função para pesquisar
  const handleSearch = (value: string) => {
    setSearchValue(value);
    applySearchFilter(bookings, value);
  };

  // Limpar pesquisa
  const clearSearch = () => {
    setSearchValue('');
    setFilteredBookings(bookings);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Função para excluir reserva
  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(true);
      await deleteBooking(id);

      // Atualizar a lista após excluir
      const updatedBookings = bookings.filter(booking => booking.id !== id);
      setBookings(updatedBookings);
      applySearchFilter(updatedBookings, searchValue);

      // Incrementar chave de atualização para forçar re-render
      setRefreshKey(prevKey => prevKey + 1);

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
    const bookingsToExport = searchValue ? filteredBookings : bookings;
    if (bookingsToExport.length === 0) return;

    // Preparar as colunas do CSV
    const headers = ['Nome Completo', 'CPF', 'RG', 'Email', 'Telefone', 'Data Nascimento', 'Local de Embarque'];

    // Preparar os dados
    const csvData = bookingsToExport.map(booking => [
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
    const fileName = searchValue 
      ? `passageiros-filtrados-${new Date().toISOString().split('T')[0]}.csv`
      : `passageiros-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'CSV exportado com sucesso',
      description: searchValue 
        ? `Lista filtrada com ${bookingsToExport.length} passageiros`
        : `Lista completa com ${bookingsToExport.length} passageiros`
    });
  };

  // Exportar lista de passageiros para PDF
  const exportToPDF = () => {
    const bookingsToExport = searchValue ? filteredBookings : bookings;
    if (bookingsToExport.length === 0) return;
    
    // @ts-ignore
    const doc = new jsPDF({
      orientation: 'landscape', // Formato paisagem para mais espaço horizontal
    });
    
    // Adicionar título
    doc.setFontSize(18);
    doc.text('Lista de Passageiros', 20, 20);
    
    // Adicionar informações do pacote
    doc.setFontSize(12);
    if (packageInfo) {
      doc.text(`Pacote: ${packageInfo.name}`, 20, 30);
      doc.text(`Data: ${packageInfo.travelMonth}`, 20, 36);
    }
    
    // Adicionar informações da lista
    if (searchValue) {
      doc.text(`Filtro aplicado: "${searchValue}"`, 20, 42);
      doc.text(`Passageiros encontrados: ${bookingsToExport.length}`, 20, 48);
      doc.text(`Data de emissão: ${format(new Date(), 'dd/MM/yyyy')}`, 20, 54);
    } else {
      doc.text(`Total de passageiros: ${bookingsToExport.length}`, 20, 42);
      doc.text(`Data de emissão: ${format(new Date(), 'dd/MM/yyyy')}`, 20, 48);
    }
    
    // Converter dados para formato de tabela
    const tableColumn = ["Nome", "CPF", "RG", "Telefone", "Email", "Data Nasc.", "Local de Embarque"];
    const tableRows = bookingsToExport.map(booking => {
      // Formatação correta da data de nascimento
      let formattedBirthDate = '';
      if (booking.birthDate) {
        if (typeof booking.birthDate === 'string') {
          // Se for string, converter para Date e formatar
          const parts = booking.birthDate.split('T')[0].split('-');
          if (parts.length === 3) {
            // Formato brasileiro: DD/MM/YYYY
            formattedBirthDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        } else {
          // Se for Date, usar o format
          formattedBirthDate = format(booking.birthDate, 'dd/MM/yyyy');
        }
      }
      
      return [
        booking.fullName,
        booking.cpf,
        booking.rg,
        booking.phone,
        booking.email,
        formattedBirthDate,
        booking.boardingLocation
      ];
    });
    
    // @ts-ignore
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: searchValue ? 60 : 55,
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50 }, // Nome
        1: { cellWidth: 35 }, // CPF
        2: { cellWidth: 30 }, // RG
        3: { cellWidth: 30 }, // Telefone
        4: { cellWidth: 60 }, // Email
        5: { cellWidth: 25 }, // Data Nasc.
        6: { cellWidth: 45 }, // Local de Embarque
      },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
    
    // Em vez de salvar diretamente, criar um blob e abrir em uma nova guia
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Abrir em uma nova guia
    window.open(pdfUrl, '_blank');
    
    toast({
      title: 'PDF gerado com sucesso',
      description: 'A lista de passageiros foi aberta em uma nova guia'
    });
  };

  // Definição das colunas da tabela
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
            {searchValue ? filteredBookings.length : bookings.length}
            {(searchValue ? filteredBookings.length : bookings.length) === 1 ? ' reserva encontrada' : ' reservas encontradas'}
          </CardDescription>
        </div>

        {(searchValue ? filteredBookings.length : bookings.length) > 0 && (
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
              Abrir PDF
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Campo de busca personalizado */}
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar por nome, CPF, telefone..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-8"
              />
              {searchValue && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Badge de busca */}
          {searchValue && (
            <div className="mt-2 flex items-center">
              <Badge variant="outline" className="px-2 py-1 text-xs">
                Filtro: "{searchValue}" - {filteredBookings.length} resultado(s)
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearSearch}
                className="h-6 px-2 text-xs ml-2"
              >
                Limpar
              </Button>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando reservas...</span>
          </div>
        ) : (searchValue ? filteredBookings : bookings).length === 0 ? (
          <p>
            {searchValue 
              ? `Nenhuma reserva encontrada para "${searchValue}".` 
              : "Nenhuma reserva encontrada para este pacote."}
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  {columns.filter(col => col.id !== 'actions').map((column, index) => (
                    <th key={index} className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      {typeof column.header === 'string' ? column.header : ''}
                    </th>
                  ))}
                  <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {(searchValue ? filteredBookings : bookings).map((booking, index) => (
                  <tr key={booking.id} className={index % 2 ? "bg-muted/50" : "bg-white"}>
                    <td className="p-4 align-middle">{booking.fullName}</td>
                    <td className="p-4 align-middle">{booking.cpf}</td>
                    <td className="p-4 align-middle">{booking.phone}</td>
                    <td className="p-4 align-middle"><span className="text-xs">{booking.email}</span></td>
                    <td className="p-4 align-middle">{booking.boardingLocation}</td>
                    <td className="p-4 align-middle">
                      {format(new Date(booking.created_at), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-4 align-middle text-right">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};