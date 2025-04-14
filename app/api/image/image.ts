import { API_URL } from "@/services/apiUrl";
import { getToken } from "@/services/token/getToken";

export async function uploadImage(data: FormData) {
  const auth = await getToken();
  const token = auth.token;

  const response = await fetch(`${API_URL}/image/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  if (response.ok) {
    return await response.json(); 
  } else {
    return { error: 'Erro ao fazer upload da imagem. Por favor, tente novamente.' };
  }
}
