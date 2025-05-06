import React, { useState, useEffect } from 'react';
import { ColumnDef, PaginationState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';
import { ChevronLeftIcon, ChevronRightIcon, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  totalUsers: number;
  data: TData[];
  searchKey: string;
  searchPlaceholder?: string;
  pageCount: number;
  pageSizeOptions?: number[];
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange?: (searchValue: string) => void;
  onDelete: (id: string) => void;
  onRowClick?: (data: TData) => void;
  initialSearchValue?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  pageCount,
  onDelete,
  searchPlaceholder,
  pageSizeOptions = [10, 20, 30, 40, 50],
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onRowClick,
  initialSearchValue = '',
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterValue, setFilterValue] = useState<string>(initialSearchValue);
  const [tempFilterValue, setTempFilterValue] = useState<string>(initialSearchValue);
  
  // Parse page from URL or use default
  const page = searchParams?.get('page') ?? '1';
  const pageAsNumber = Number(page);
  const fallbackPage = isNaN(pageAsNumber) || pageAsNumber < 1 ? 1 : pageAsNumber;
  
  // Parse page size from URL or use default
  const per_page = searchParams?.get('limit') ?? '10';
  const perPageAsNumber = Number(per_page);
  const fallbackPerPage = isNaN(perPageAsNumber) ? 10 : perPageAsNumber;
  
  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
  };
  
  // Initialize pagination state from URL params
  const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
    pageIndex: fallbackPage - 1, // Convert from 1-based (URL) to 0-based (internal state)
    pageSize: fallbackPerPage,
  });

  // Keep URL in sync with pagination state
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    // Update URL when pagination changes (convert from 0-based to 1-based for URL)
    newParams.set('page', String(pageIndex + 1));
    newParams.set('limit', String(pageSize));
    
    // Preserve search if it exists
    if (filterValue) {
      newParams.set('search', filterValue);
    }
    
    // Update URL without refreshing the page
    router.push(`?${newParams.toString()}`, { scroll: false });
    
  }, [pageIndex, pageSize, filterValue]);

  // Synchronize with URL changes (useful for back/forward navigation)
  useEffect(() => {
    setPagination({
      pageIndex: fallbackPage - 1,
      pageSize: fallbackPerPage
    });
  }, [fallbackPage, fallbackPerPage]);

  // Update filterValue when initialSearchValue changes
  useEffect(() => {
    if (initialSearchValue !== filterValue) {
      setFilterValue(initialSearchValue);
      setTempFilterValue(initialSearchValue);
    }
  }, [initialSearchValue]);

  // Notify parent component when page changes
  useEffect(() => {
    if (onPageChange) onPageChange(pageIndex);
  }, [pageIndex, onPageChange]);

  // Notify parent component when page size changes
  useEffect(() => {
    if (onPageSizeChange) onPageSizeChange(pageSize);
  }, [pageSize, onPageSizeChange]);

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { 
      pagination: { pageIndex, pageSize },
      columnFilters: searchKey ? [{ id: searchKey, value: filterValue }] : []
    },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  const createQueryString = (params: Record<string, string | number | null>) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, String(value));
      }
    }
    return newSearchParams.toString();
  };

  const handleSearchClick = () => {
    // Update filterValue with temporary value
    setFilterValue(tempFilterValue);
    
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    
    // Notify parent component
    if (onSearchChange) {
      onSearchChange(tempFilterValue);
    }
    
    // Update URL
    const queryParams = {
      page: 1, // Always go back to first page for new searches
      limit: pageSize,
      search: tempFilterValue,
    };

    // Update URL if there's a search term, otherwise clear it
    if (tempFilterValue.trim()) {
      router.push(`?${createQueryString(queryParams)}`, { scroll: false });
    } else if (searchParams?.has('search')) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('search');
      newParams.set('page', '1'); // Reset to page 1
      router.push(`?${newParams.toString()}`, { scroll: false });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  // Custom handlers to manage both state and URL updates
  const goToPage = (pageIndex: number) => {
    setPagination(prev => ({ ...prev, pageIndex }));
  };

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex-1 relative">
          <Input
            placeholder={searchPlaceholder || `Buscar por ${searchKey}...`}
            value={tempFilterValue}
            onChange={(event) => setTempFilterValue(event.target.value)}
            className="pr-10"
            onKeyDown={handleKeyDown}
          />
          <div className="absolute top-0 right-0 h-full flex items-center pr-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        <Button onClick={handleSearchClick}>
          Buscar
        </Button>
      </div>
      <ScrollArea className="h-[calc(80vh-220px)] rounded-md border">
        <Table className="relative">
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow 
                  key={row.id} 
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={onRowClick ? "cursor-pointer hover:bg-gray-100" : ""}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex flex-col items-center justify-end gap-2 space-x-2 py-4 sm:flex-row">
        <div className="flex w-full items-center justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} de{' '}
            {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
            <div className="flex items-center space-x-2">
              <p className="whitespace-nowrap text-sm font-medium">Linhas por página</p>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => setPagination(prev => ({ ...prev, pageSize: Number(value), pageIndex: 0 }))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue>{pageSize}</SelectValue>
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map(size => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-2 sm:justify-end">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {pageIndex + 1} de {table.getPageCount() || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              aria-label="Ir para primeira página"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => goToPage(0)}
              disabled={pageIndex === 0}
            >
              <DoubleArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Ir para página anterior"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => goToPage(Math.max(0, pageIndex - 1))}
              disabled={pageIndex === 0}
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Ir para próxima página"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => goToPage(Math.min(pageCount - 1, pageIndex + 1))}
              disabled={pageIndex >= pageCount - 1}
            >
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Ir para última página"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => goToPage(pageCount - 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <DoubleArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}