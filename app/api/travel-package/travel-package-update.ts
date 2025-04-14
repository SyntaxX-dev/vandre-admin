import { API_URL } from "@/services/apiUrl";
import { getToken } from "@/services/token/getToken";
import { TravelPackage } from "./travel-packages-admin";
import Cookies from 'js-cookie';

interface UpdateTravelPackagePayload {
  name?: string;
  price?: number;
  description?: string;
  pdfUrl?: string;
  maxPeople?: number;
  boardingLocations?: string[];
  travelMonth?: string;
  travelDate?: string;
  travelTime?: string;
}

export const updateTravelPackage = async (
  id: string,
  data: UpdateTravelPackagePayload
): Promise<TravelPackage> => {
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

  const url = `${API_URL}/travel-packages/${id}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Erro ao atualizar pacote de viagem: ${response.status} ${response.statusText}`);
  }

  return response.json();
};