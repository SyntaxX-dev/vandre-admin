// C:\Users\Gabriel\Documents\vandre-admin\app\api\travel-package\travel-package-update-with-files.ts

import { API_URL } from "@/services/apiUrl";
import { getToken } from "@/services/token/getToken";
import { TravelPackage } from "./travel-packages-admin";
import Cookies from 'js-cookie';
import { decrypt } from "@/services/crypto/crypt";

export const updateTravelPackageWithFiles = async (
  id: string,
  formData: FormData
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

  console.log("Fazendo requisição PUT para:", url);
  
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        // Não definir Content-Type para multipart/form-data
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na resposta:", response.status, errorText);
      throw new Error(`Erro ao atualizar pacote de viagem: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Pacote atualizado com sucesso:", result);
    return result;
  } catch (error) {
    console.error("Erro completo:", error);
    throw error;
  }
};