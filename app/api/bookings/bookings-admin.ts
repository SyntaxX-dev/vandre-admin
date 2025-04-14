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

  let url = `${API_URL}/bookings`;
  
  console.log("URL base:", url);
  const params = new URLSearchParams();
  
  if (searchValue) {
    params.append('search', searchValue);
  }
  
  // Adicionar os parâmetros à URL se existirem
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  console.log("URL final da requisição:", url);

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
    const bookings: Booking[] = await response.json();
    
    console.log("Resposta da API:", bookings);
    
    // Aplicar paginação no cliente
    const start = skip;
    const end = start + take;
    const paginatedBookings = bookings.slice(start, Math.min(end, bookings.length));
    
    console.log(`Retornando ${paginatedBookings.length} reservas de ${bookings.length} total`);
    
    return {
      bookings: paginatedBookings,
      totalCount: bookings.length
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