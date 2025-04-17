import { API_URL } from "@/services/apiUrl";
import { getToken } from "@/services/token/getToken";
import Cookies from 'js-cookie';

export interface TravelPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  pdfUrl: string;
  maxPeople: number;
  boardingLocations: string[];
  travelMonth: string;
  travelDate?: string | null;
  returnDate?: string | null;
  travelTime?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  imageUrl?: string | null;
}

interface GetTravelPackagesResponse {
  data: TravelPackage[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export const getAdminTravelPackages = async (
  skip = 0, 
  take = 10, 
  searchValue = '',
  month?: string
): Promise<{ travelPackages: TravelPackage[], totalCount: number }> => {
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
    throw new Error("Token não encontrado");
  }

  let url = `${API_URL}/travel-packages`;
  
  if (searchValue) {
    url += `?search=${encodeURIComponent(searchValue)}`;
  }
  
  if (month) {
    url += `${searchValue ? '&' : '?'}month=${encodeURIComponent(month)}`;
  }

  console.log("Fazendo requisição para:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar pacotes de viagem: ${response.status} ${response.statusText}`);
  }

  // Analisar a resposta como um array simples de pacotes de viagem
  const travelPackages: TravelPackage[] = await response.json();
  
  // Aplicar paginação no cliente
  const start = skip;
  const end = skip + take;
  const paginatedPackages = travelPackages.slice(start, end);
  
  return {
    travelPackages: paginatedPackages,
    totalCount: travelPackages.length
  };
};