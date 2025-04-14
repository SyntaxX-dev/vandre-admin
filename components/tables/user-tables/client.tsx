"use client";
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { User } from '@/types/user';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { columns } from './columns';
import { useEffect, useState } from 'react';
import { deleteUser, fetchUsers } from '@/app/api/users/users-api';
import { CellAction } from './cell-action';

interface UserClientProps {
  initialData: User[];
  totalCount: number;
}

export const UserClient: React.FC<UserClientProps> = ({ initialData, totalCount }) => {
  const [users, setUsers] = useState<User[]>(initialData);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalUsers, setTotalUsers] = useState<number>(totalCount);
  const router = useRouter();

  const fetchAndSetUsers = async (page: number, pageSize: number) => {
    try {
      const { users, totalCount } = await fetchUsers(search, page, pageSize);
      setUsers(users);
      setTotalUsers(totalCount);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    fetchAndSetUsers(page, pageSize);
  }, [search, page, pageSize]);

  const handleUserDeleted = async (userId: string) => {
    try {
      await deleteUser(userId);

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

      setTotalUsers((prevCount) => prevCount - 1);

      console.log('Usuário deletado com sucesso');
    } catch (error) {
      console.error('Falha ao deletar usuário:', error);
      alert(`Falha ao deletar usuário: ${(error as Error).message}`);
    }
  };


  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Users (${totalUsers})`}
          description="Manage users (Client side table functionalities.)"
        />
        <Button
          className="text-xs md:text-sm"
          onClick={() => router.push(`/dashboard/user/create`)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>

      </div>
      <Separator />
      {/* <DataTable
        totalUsers={totalUsers}
        searchKey="name"
        columns={columns}
        data={users}
        search={search}
        onSearchChange={(value) => setSearch(value)}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(size) => setPageSize(size)}
      /> */}
      {users.map((user) => (
        <CellAction key={user.id} data={user} 
         />
      ))}
    </>
  );
};
