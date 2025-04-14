import { API_URL } from "@/services/apiUrl";
import { getToken } from "@/services/token/getToken";
import Cookies from 'js-cookie';
import { Booking } from "./bookings-admin";

export const getBookingById = async (id: string): Promise<Booking> => {
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

  const url = `${API_URL}/bookings/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar reserva: ${response.status} ${response.statusText}`);
  }

  return response.json();
};