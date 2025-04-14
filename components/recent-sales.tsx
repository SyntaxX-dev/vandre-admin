'use client';

import { Booking } from '@/app/api/bookings/bookings-admin';
import { TravelPackage } from '@/app/api/travel-package/travel-packages-admin';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardDescription } from '@/components/ui/card';

interface RecentSalesProps {
  bookings: Booking[];
  travelPackages: TravelPackage[];
}

export function RecentSales({ bookings, travelPackages }: RecentSalesProps) {
  // Ordenar por data de criação e limitar a 5
  const recentBookings = bookings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {recentBookings.map((booking) => {
        const pkg = travelPackages.find((p) => p.id === booking.travelPackageId);
        return (
          <div key={booking.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/01.png" alt="Avatar" />
              <AvatarFallback>{booking.fullName[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{booking.fullName}</p>
              <p className="text-sm text-muted-foreground">{pkg?.name || 'N/A'}</p>
            </div>
            <div className="ml-auto font-medium">
              {format(new Date(booking.created_at), 'dd/MM/yyyy')}
            </div>
          </div>
        );
      })}
      {recentBookings.length === 0 && (
        <CardDescription>Nenhuma reserva recente encontrada.</CardDescription>
      )}
    </div>
  );
}