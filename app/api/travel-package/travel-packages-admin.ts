// C:\Users\User\Documents\vandre-admin\app\api\travel-package\travel-packages-admin.ts

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

  // Fazemos uma requisição simples para obter todos os pacotes
  const url = `${API_URL}/travel-packages`;
  
  console.log("Fazendo requisição para:", url);

  try {
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
    const allPackages: TravelPackage[] = await response.json();
    
    // Aplicar filtros no cliente
    let filteredPackages = [...allPackages];
    
    // Aplicar filtro de busca
    if (searchValue && searchValue.trim() !== '') {
      const searchTerms = searchValue.toLowerCase().split(' ');
      filteredPackages = filteredPackages.filter(pkg => {
        const nameMatch = searchTerms.every(term => 
          pkg.name.toLowerCase().includes(term) ||
          pkg.description?.toLowerCase().includes(term) ||
          pkg.travelMonth?.toLowerCase().includes(term)
        );
        return nameMatch;
      });
      
      console.log(`Filtrando por "${searchValue}" - Encontrados: ${filteredPackages.length} de ${allPackages.length}`);
    }
    
    // Aplicar filtro de mês
    if (month && month.trim() !== '') {
      filteredPackages = filteredPackages.filter(pkg => 
        pkg.travelMonth.toLowerCase().includes(month.toLowerCase())
      );
      
      console.log(`Filtrando por mês "${month}" - Encontrados: ${filteredPackages.length} de ${allPackages.length}`);
    }
    
    // Obter o total antes da paginação
    const totalCount = filteredPackages.length;
    
    // Aplicar paginação
    const paginatedPackages = filteredPackages.slice(skip, skip + take);
    
    console.log(`Retornando ${paginatedPackages.length} pacotes de ${totalCount} filtrados`);
    
    return {
      travelPackages: paginatedPackages,
      totalCount: totalCount
    };
  } catch (error) {
    console.error("Erro na requisição:", error);
    throw error;
  }
};