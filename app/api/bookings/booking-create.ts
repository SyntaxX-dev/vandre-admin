import { API_URL } from "@/services/apiUrl";
import { Booking } from "./bookings-admin";

interface CreateBookingPayload {
  travelPackageId: string;
  fullName: string;
  rg: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  boardingLocation: string;
}

export const createBooking = async (
  data: CreateBookingPayload
): Promise<Booking> => {
  const url = `${API_URL}/bookings`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `Erro ao criar reserva: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Erro ao criar reserva:", error);
    throw error;
  }
};