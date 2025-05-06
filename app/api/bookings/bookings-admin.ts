// C:\Users\User\Documents\vandre-admin\app\api\bookings\bookings-admin.ts

import { API_URL } from "@/services/apiUrl";
import { getToken } from "@/services/token/getToken";
import Cookies from 'js-cookie';

export interface Booking {
  id: string;
  travelPackageId: string;
  userId: string;
  fullName: string;
  rg: string;
  cpf: string;
  birthDate: Date | string;
  phone: string;
  email: string;
  boardingLocation: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export const getAdminBookings = async (
  skip = 0, 
  take = 10, 
  searchValue = ''
): Promise<{ bookings: Booking[], totalCount: number }> => {
  // Tenta obter o token pela função getToken
  let token;
  try {
    const tokenData = await getToken();
    token = tokenData?.token;
  } catch (error) {
    console.warn("Erro ao buscar token via getToken:", error);
  }

  // Se não encontrou o token pela função, tenta buscar direto dos cookies
  if (!token) {
    token = Cookies.get('token');
  }

  // Última tentativa: verificar se há um token armazenado no localStorage
  if (!token) {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        token = JSON.parse(storedToken).token || storedToken;
      }
    } catch (e) {
      console.warn("Erro ao verificar localStorage:", e);
    }
  }

  if (!token) {
    console.log("Tentando fazer requisição sem token...");
  }

  // Fazemos uma requisição simples para obter todas as reservas
  const url = `${API_URL}/bookings`;
  
  console.log("URL base da requisição:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar reservas: ${response.status} ${response.statusText}`);
    }

    // Analisar a resposta como um array simples de reservas
    const allBookings: Booking[] = await response.json();
    
    console.log(`Recebidas ${allBookings.length} reservas do servidor`);
    
    // Aplicar filtro de busca no cliente
    let filteredBookings = [...allBookings];
    
    if (searchValue && searchValue.trim() !== '') {
      const searchLower = searchValue.toLowerCase();
      
      // Filtrar por vários campos relevantes
      filteredBookings = filteredBookings.filter(booking => 
        booking.fullName.toLowerCase().includes(searchLower) ||
        booking.email.toLowerCase().includes(searchLower) ||
        booking.cpf.toLowerCase().includes(searchLower) ||
        booking.phone.toLowerCase().includes(searchLower) ||
        booking.boardingLocation.toLowerCase().includes(searchLower)
      );
      
      console.log(`Filtrando por "${searchValue}" - Encontradas: ${filteredBookings.length} de ${allBookings.length}`);
    }
    
    // Obter o total antes da paginação
    const totalCount = filteredBookings.length;
    
    // Aplicar paginação
    const paginatedBookings = filteredBookings.slice(skip, skip + take);
    
    console.log(`Retornando ${paginatedBookings.length} reservas de ${totalCount} filtradas`);
    
    return {
      bookings: paginatedBookings,
      totalCount: totalCount
    };
  } catch (error) {
    console.error("Erro ao buscar reservas:", error);
    // Em caso de erro, retornar array vazio
    return {
      bookings: [],
      totalCount: 0
    };
  }
};