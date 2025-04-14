'use client'

import BreadCrumb from '@/components/breadcrumb';
import { TravelPackageForm } from '@/components/forms/travel-packages-form/travel-package-form';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Page() {
  const breadcrumbItems = [
    { title: 'Pacotes de Viagem', link: '/dashboard/travel-packages' },
    { title: 'Novo Pacote', link: '/dashboard/travel-packages/new' }
  ];

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        <TravelPackageForm
          initialData={null}
        />
      </div>
    </ScrollArea>
  );
}