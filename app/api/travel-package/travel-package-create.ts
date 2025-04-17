import { API_URL } from "@/services/apiUrl";
import { getToken } from "@/services/token/getToken";
import Cookies from 'js-cookie';

import { TravelPackage } from "./travel-packages-admin";
import { decrypt } from "@/services/crypto/crypt";

interface CreateTravelPackagePayload {
  name: string;
  price: number;
  description: string;
  pdfUrl: string;
  maxPeople: number;
  boardingLocations: string[] | string;
  travelMonth: string;
  travelDate?: string;
  returnDate?: string;
  travelTime?: string;
}

export const createTravelPackage = async (
  data: CreateTravelPackagePayload,
  image: File
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
  
  console.log("Token encontrado, primeiros caracteres:", token.substring(0, 10) + "...");

  const url = `${API_URL}/travel-packages`;
  
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("price", data.price.toString());
  formData.append("description", data.description);
  formData.append("pdfUrl", data.pdfUrl);
  formData.append("maxPeople", data.maxPeople.toString());
  formData.append("travelMonth", data.travelMonth);
  
  if (data.travelDate) {
    formData.append("travelDate", data.travelDate);
  }

  if (data.returnDate) {
    formData.append("returnDate", data.returnDate);
  }
  
  if (data.travelTime) {
    formData.append("travelTime", data.travelTime);
  }

  // Adicionar locais de embarque
  if (Array.isArray(data.boardingLocations)) {
    data.boardingLocations.forEach(location => {
      formData.append("boardingLocations", location);
    });
  } else if (typeof data.boardingLocations === 'string') {
    formData.append("boardingLocations", data.boardingLocations);
  }

  // Adicionar imagem
  formData.append("image", image);

  console.log("Fazendo requisição para:", url);
  console.log("Dados enviados:", {
    name: data.name,
    price: data.price,
    // outros campos
    imageFilename: image.name
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Não definir Content-Type para multipart/form-data, o navegador irá adicionar automaticamente com o boundary correto
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na resposta:", response.status, errorText);
      throw new Error(`Erro ao criar pacote de viagem: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Pacote criado com sucesso:", result);
    return result;
  } catch (error) {
    console.error("Erro completo:", error);
    throw error;
  }
};