'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Booking } from '@/app/api/bookings/bookings-admin';
import { TravelPackage } from '@/app/api/travel-package/travel-packages-admin';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface OverviewProps {
  bookings: Booking[];
  travelPackages: TravelPackage[];
}

export function Overview({ bookings, travelPackages }: OverviewProps) {
  // Agrupar reservas por mês
  const bookingsByMonth = bookings.reduce((acc, booking) => {
    const pkg = travelPackages.find((p) => p.id === booking.travelPackageId);
    if (!pkg) return acc;
    const month = pkg.travelMonth;
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = {
    labels: Object.keys(bookingsByMonth),
    datasets: [
      {
        label: 'Reservas por Mês',
        data: Object.values(bookingsByMonth),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Distribuição de Reservas' },
    },
  };

  return <Bar options={options} data={data} />;
}