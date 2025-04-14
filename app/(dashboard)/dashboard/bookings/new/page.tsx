'use client'

import BreadCrumb from '@/components/breadcrumb';
import { BookingForm } from '@/components/forms/bookings-form/booking-form';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Page() {
  const breadcrumbItems = [
    { title: 'Reservas', link: '/dashboard/bookings' },
    { title: 'Nova Reserva', link: '/dashboard/bookings/new' }
  ];

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        <BookingForm />
      </div>
    </ScrollArea>
  );
}