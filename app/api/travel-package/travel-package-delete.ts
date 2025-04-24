import { API_URL } from "@/services/apiUrl";
import { getToken } from "@/services/token/getToken";
import Cookies from 'js-cookie';
import { decrypt } from "@/services/crypto/crypt";

export const deleteTravelPackage = async (id: string): Promise<void> => {
  // Validar que temos um ID válido
  if (!id || id === 'undefined') {
    throw new Error("ID do pacote de viagem inválido");
  }

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
    throw new Error("Token não encontrado");
  }

  console.log(`Excluindo pacote de viagem com ID: ${id}`);

  const url = `${API_URL}/travel-packages/${id}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro na resposta:", response.status, errorText);
    throw new Error(`Erro ao excluir pacote de viagem: ${response.status} ${response.statusText}`);
  }
};