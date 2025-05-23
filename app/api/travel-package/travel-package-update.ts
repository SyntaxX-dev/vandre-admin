// C:\Users\Gabriel\Documents\vandre-admin\app\api\travel-package\travel-package-update.ts

import { API_URL } from "@/services/apiUrl";
import { getToken } from "@/services/token/getToken";
import { TravelPackage } from "./travel-packages-admin";
import Cookies from 'js-cookie';
import { decrypt } from "@/services/crypto/crypt";

interface UpdateTravelPackagePayload {
  name?: string;
  price?: number;
  description?: string;
  pdfUrl?: string;
  hasPdfFile?: boolean;
  maxPeople?: number;
  boardingLocations?: string[] | string;
  travelMonth?: string;
  travelDate?: string;
  returnDate?: string;
  travelTime?: string;
}

export const updateTravelPackage = async (
  id: string,
  data: UpdateTravelPackagePayload
): Promise<TravelPackage> => {
  // Obter token de várias fontes possíveis
  let token;
  
  // Tentar getToken primeiro (função client-side)
  try {
    const tokenData = await getToken();
    token = tokenData?.token;
  } catch (error) {
    console.warn("Erro ao buscar token via getToken:", error);
  }
  
  // Se não encontrou, tentar cookies diretamente
  if (!token) {
    try {
      const encryptedToken = Cookies.get('token');
      if (encryptedToken) {
        token = decrypt(encryptedToken);
      }
    } catch (e) {
      console.warn("Erro ao buscar token do cookie:", e);
    }
  }
  
  // Tentativa alternativa: verificar se há um token não criptografado
  if (!token) {
    token = Cookies.get('access_token');
  }
  
  // Última tentativa: localStorage
  if (!token) {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Tentar como JSON
          const parsedToken = JSON.parse(storedToken);
          token = parsedToken.token || parsedToken.access_token || storedToken;
        } catch {
          // Se não for JSON, usar como string
          token = storedToken;
        }
      }
    } catch (e) {
      console.warn("Erro ao verificar localStorage:", e);
    }
  }
  
  if (!token) {
    console.error("Nenhum token encontrado em nenhuma fonte");
    throw new Error("Token de autenticação não encontrado. Por favor, faça login novamente.");
  }

  const url = `${API_URL}/travel-packages/${id}`;

  // Se boardingLocations é um array, precisa ser tratado especificamente
  const requestData = { ...data };

  console.log("Fazendo requisição para:", url);
  console.log("Dados enviados:", requestData);

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na resposta:", response.status, errorText);
      throw new Error(`Erro ao atualizar pacote de viagem: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Erro completo:", error);
    throw error;
  }
};