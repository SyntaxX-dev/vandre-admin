'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BreadCrumb from '@/components/breadcrumb';
import { BookingDetail } from '@/components/forms/bookings-form/booking-detail';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getBookingById } from '@/app/api/bookings/booking-by-id';
import { Booking } from '@/app/api/bookings/bookings-admin';

export default function Page() {
  const { bookingId } = useParams();
  
  // Garantindo que bookingId seja sempre uma string
  const bookingIdString = Array.isArray(bookingId) ? bookingId[0] : bookingId;

  const [bookingData, setBookingData] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (bookingIdString) {
          const data = await getBookingById(bookingIdString);
          setBookingData(data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados da reserva:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingIdString]);

  const breadcrumbItems = [
    { title: 'Reservas', link: '/dashboard/bookings' },
    { title: 'Detalhes da Reserva', link: `/dashboard/bookings/${bookingId}` }
  ];

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        {!loading ? (
          bookingData ? (
            <BookingDetail booking={bookingData} />
          ) : (
            <p>Reserva não encontrada.</p>
          )
        ) : (
          <p>Carregando...</p>
        )}
      </div>
    </ScrollArea>
  );
}