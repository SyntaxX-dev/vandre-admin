import { API_URL } from "@/services/apiUrl";
import { getToken } from "@/services/token/getToken";

interface UploadImageResponse {
  id: string;
}

export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  const { token } = await getToken();
  if (!token) {
    throw new Error("Token não encontrado");
  }

  const url = `${API_URL}/image/upload`;

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Erro ao fazer upload da imagem: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
