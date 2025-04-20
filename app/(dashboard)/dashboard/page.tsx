'use client';

import { useState, useEffect } from 'react';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { Overview } from '@/components/overview';
import { RecentSales } from '@/components/recent-sales';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAdminTravelPackages, TravelPackage } from '@/app/api/travel-package/travel-packages-admin';
import { getAdminBookings, Booking } from '@/app/api/bookings/bookings-admin';
import { format } from 'date-fns'; 
import { exportToCSV } from '@/lib/export-utils';

export default function DashboardPage() {
  const [travelPackages, setTravelPackages] = useState<TravelPackage[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    salesThisMonth: 0,
    activePackages: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Buscar pacotes de viagem
        const packagesResponse = await getAdminTravelPackages(0, 100);
        const packages = packagesResponse.travelPackages;
        setTravelPackages(packages);

        // Buscar reservas
        const bookingsResponse = await getAdminBookings(0, 1000);
        const bookingsData = bookingsResponse.bookings;
        setBookings(bookingsData);

        // Calcular métricas
        const currentMonth = format(new Date(), 'MMMM/yyyy').toLowerCase();

        // Total Revenue: preço do pacote * número de reservas associadas
        const totalRevenue = bookingsData.reduce((acc, booking) => {
          const pkg = packages.find((p) => p.id === booking.travelPackageId);
          return acc + (pkg ? pkg.price : 0);
        }, 0);

        // Total Bookings: número total de reservas
        const totalBookings = bookingsData.length;

        // Sales This Month: pacotes com reservas no último mês
        const salesThisMonth = packages.filter((pkg) =>
          bookingsData.some(
            (booking) =>
              booking.travelPackageId === pkg.id &&
              pkg.travelMonth.toLowerCase() === currentMonth
          )
        ).length;

        // Active Packages: pacotes com travelMonth atual ou futuro
        const activePackages = packages.length;

        setMetrics({
          totalRevenue,
          totalBookings,
          salesThisMonth,
          activePackages,
        });
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Função para exportar dados da dashboard
  const handleDownload = () => {
    const data = bookings.map((booking) => {
      const pkg = travelPackages.find((p) => p.id === booking.travelPackageId);
      return {
        Passenger: booking.fullName,
        CPF: booking.cpf,
        Package: pkg?.name || 'N/A',
        TravelMonth: pkg?.travelMonth || 'N/A',
        Price: pkg?.price || 0,
        BookingDate: format(
          new Date(booking.created_at),
          'dd/MM/yyyy'
        ),
      };
    });

    exportToCSV(data, 'dashboard-report');
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Olá, Turma do Vandré 👋
          </h2>
          {/* <div className="hidden items-center space-x-2 md:flex">
            <CalendarDateRangePicker />
            <Button onClick={handleDownload}>Download</Button>
          </div> */}
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics" disabled>
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            {loading ? (
              <p>Carregando dados...</p>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total de Vendas
                      </CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        R${metrics.totalRevenue.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {/* Calcular variação se houver dados históricos */}
                        Calculado com base nas reservas
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Reservas
                      </CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metrics.totalBookings}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total de reservas registradas
                      </p>
                    </CardContent>
                  </Card>
                  {/* <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Vendas deste mês
                      </CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <path d="M2 10h20" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metrics.salesThisMonth}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pacotes com reservas este mês
                      </p>
                    </CardContent>
                  </Card> */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total de pacotes de viagem
                      </CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metrics.activePackages}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pacotes com viagens futuras
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <Overview bookings={bookings} travelPackages={travelPackages} />
                    </CardContent>
                  </Card>
                  <Card className="col-span-4 md:col-span-3">
                    <CardHeader>
                      <CardTitle>Reservas recentes</CardTitle>
                      <CardDescription>
                        {bookings.length} reservas feitas recentemente
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RecentSales bookings={bookings} travelPackages={travelPackages} />
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}