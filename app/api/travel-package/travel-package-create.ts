import { API_URL } from "@/services/apiUrl";
import { getToken } from "@/services/token/getToken";
import Cookies from 'js-cookie';

import { TravelPackage } from "./travel-packages-admin";
import { decrypt } from "@/services/crypto/crypt";

interface CreateTravelPackagePayload {
  name: string;
  price: number;
  description: string;
  pdfUrl?: string;
  pdfMethod?: string;
  hasPdfFile?: boolean;
  maxPeople: number;
  boardingLocations: string[] | string;
  travelMonth: string;
  travelDate?: string;
  returnDate?: string;
  travelTime?: string;
}

export const createTravelPackage = async (
  data: CreateTravelPackagePayload,
  image: File,
  pdfFile?: File | null
): Promise<TravelPackage> => {
  let token;
  
  try {
    const tokenData = await getToken();
    token = tokenData?.token;
  } catch (error) {
    console.warn("Erro ao buscar token via getToken:", error);
  }
  
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
  
  if (!token) {
    token = Cookies.get('access_token');
  }
  
  if (!token) {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const parsedToken = JSON.parse(storedToken);
          token = parsedToken.token || parsedToken.access_token || storedToken;
        } catch {
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
  
  // Determinar se vamos usar URL ou arquivo para o PDF
  const isPdfUpload = data.pdfMethod === 'upload' || data.hasPdfFile;

  // Validate: if pdfMethod is 'upload', ensure pdfFile exists
  if (data.pdfMethod === 'upload' && !pdfFile) {
    throw new Error("Você selecionou a opção de upload de PDF, mas nenhum arquivo PDF foi fornecido.");
  }

  if (isPdfUpload && pdfFile) {
    formData.append("hasPdfFile", "true");
  } else {
    formData.append("hasPdfFile", "false");
    if (data.pdfUrl) {
      formData.append("pdfUrl", data.pdfUrl);
    } else {
      throw new Error("Você deve fornecer uma URL de PDF ou fazer upload de um arquivo PDF.");
    }
  }
  
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

  if (Array.isArray(data.boardingLocations)) {
    data.boardingLocations.forEach(location => {
      formData.append("boardingLocations", location);
    });
  } else if (typeof data.boardingLocations === 'string') {
    formData.append("boardingLocations", data.boardingLocations);
  }

  formData.append("image", image);
  
  if (isPdfUpload && pdfFile) {
    formData.append("pdf", pdfFile);
  }

  console.log("Fazendo requisição para:", url);
  console.log("Dados enviados:", {
    name: data.name,
    price: data.price,
    hasPdfFile: isPdfUpload && !!pdfFile,
    imageFilename: image.name,
    pdfFilename: pdfFile?.name || 'Não enviado'
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro na resposta:", response.status, errorData);
      throw new Error(errorData.message || `Erro ao criar pacote de viagem: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Pacote criado com sucesso:", result);
    return result;
  } catch (error) {
    console.error("Erro completo:", error);
    throw error;
  }
};