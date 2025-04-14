import { API_URL } from '@/services/apiUrl';
import { User } from '@/types/user';
import { getToken } from '@/services/token/getToken';

interface PaginatedUsersResponse {
  users: User[];
  totalCount: number;
}
interface CreateUserDto {
  username:string;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
}

interface UpdateUserDto {
  username:string;
  name: string;
  email: string;
  password?: string;
  isActive: boolean;
}


export async function fetchUsers(search: string = '', page: number = 1, pageSize: number = 10): Promise<PaginatedUsersResponse> {
  const auth = await getToken();
  const token = auth.token;
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  const url = new URL(`${API_URL}/user/admin/users`);
  url.searchParams.append('skip', ((page - 1) * pageSize).toString());
  url.searchParams.append('limit', pageSize.toString());
  if (search) url.searchParams.append('search', search);

  const response = await fetch(url.toString(), { method: 'GET', headers });

  if (!response.ok) {
    throw new Error('Error fetching users');
  }

  return response.json();
}


export const deleteUser = async (id: string) => {
  const auth = await getToken();
  const token = auth.token;
  const response = await fetch(`${API_URL}/user/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.ok) {
    return response.json(); 
  }

  throw new Error(`Erro ao deletar usuário: ${response.statusText}`);
};


export const createUser = async (user: CreateUserDto ): Promise<User> => {
  const auth = await getToken();
  const token = auth.token;
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  const response = await fetch(`${API_URL}/user/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify(user),
  });

  if (response.ok) {
    return response.json();  
  }

  throw new Error(`Erro ao criar usuário: ${response.statusText}`);
};


export const updateUser = async (id: string, user: UpdateUserDto): Promise<User> => {
  const auth = await getToken();
  const token = auth.token;
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  const response = await fetch(`${API_URL}/user/admin/users/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(user),
  });

  if (response.ok) {
    return response.json();  
  }

  throw new Error(`Erro ao editar usuário: ${response.statusText}`);
};

export const fetchUserById = async (id: string): Promise<User> => {
  const auth = await getToken();
  const token = auth.token;
  
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  const response = await fetch(`${API_URL}/user/${id}`, {
    method: 'GET',
    headers,
  });
  console.log('aqui',response);

  if (response.ok) {
    console.log('aqui',response);
    return response.json();
  }

  throw new Error(`Erro ao buscar usuário: ${response.statusText}`);
};


export const disableUser = async (id: string): Promise<string> => {
  const auth = await getToken();
  const token = auth.token;
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  const response = await fetch(`${API_URL}/user/disable/${id}`, {
    method: 'PUT',
    headers,
  });

  if (response.ok) {
    return response.text(); 
  }

  throw new Error(`Erro ao desativar usuário: ${response.statusText}`);
};

export const activateUser = async (id: string): Promise<string> => {
  const auth = await getToken();
  const token = auth.token;
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  const response = await fetch(`${API_URL}/user/active/${id}`, {
    method: 'PUT',
    headers,
  });

  if (response.ok) {
    return response.text(); 
  }

  throw new Error(`Erro ao ativar usuário: ${response.statusText}`);
};



