'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BreadCrumb from '@/components/breadcrumb';
import { TravelPackageForm } from '@/components/forms/travel-packages-form/travel-package-form';
import { TravelPackageBookings } from '@/components/forms/travel-packages-form/travel-package-bookings';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getTravelPackageById } from '@/app/api/travel-package/travel-package-by-id';
import { TravelPackage } from '@/app/api/travel-package/travel-packages-admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Page() {
  const { travelPackageId } = useParams();
  
  // Garantindo que travelPackageId seja sempre uma string
  const travelPackageIdString = Array.isArray(travelPackageId) ? travelPackageId[0] : travelPackageId;

  const [travelPackageData, setTravelPackageData] = useState<TravelPackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTravelPackage = async () => {
      try {
        if (travelPackageIdString) {
          const data = await getTravelPackageById(travelPackageIdString);
          setTravelPackageData(data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do pacote de viagem:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTravelPackage();
  }, [travelPackageIdString]);

  const breadcrumbItems = [
    { title: 'Pacotes de Viagem', link: '/dashboard/travel-packages' },
    { title: travelPackageData ? 'Editar Pacote' : 'Novo Pacote', link: `/dashboard/travel-packages/${travelPackageId}` }
  ];

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        
        {!loading ? (
          travelPackageData ? (
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Detalhes do Pacote</TabsTrigger>
                <TabsTrigger value="bookings">Reservas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <TravelPackageForm
                  initialData={travelPackageData}
                  key={travelPackageData.id}
                />
              </TabsContent>
              
              <TabsContent value="bookings">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">{travelPackageData.name}</h2>
                  <p className="text-gray-500">{travelPackageData.travelMonth}</p>
                </div>
                <TravelPackageBookings travelPackageId={travelPackageData.id} />
              </TabsContent>
            </Tabs>
          ) : (
            <TravelPackageForm
              initialData={null}
              key="new"
            />
          )
        ) : (
          <p>Carregando...</p>
        )}
      </div>
    </ScrollArea>
  );
}