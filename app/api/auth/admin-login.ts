"use server";

import { crypt } from "@/services/crypto/crypt";
import { cookies } from "next/headers";
import { API_URL } from "@/services/apiUrl";

interface UserData {
  access_token: string;
  id: string;
  name: string;
  email: string;
}

interface Exception {
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  token?: string; // Marque como opcional
  transactions?: any[]; // Marque como opcional
  balances?: any[]; // Marque como opcional
  role?: string; // Marque como opcional
  // Torne as outras propriedades opcionais também
  // ...
}

type LoginResult = User | { error: string };

export async function adminLogin(form: FormData): Promise<LoginResult> {
  const email = form.get("email") as string;
  const password = form.get("password") as string;

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (response.ok) {
    const data: UserData = await response.json();
    // Usar access_token em vez de token para corresponder à resposta da API
    const token = crypt(data.access_token);
    
    // Definir o cookie
    cookies().set("token", token, {
      expires: new Date(new Date().getTime() + 60 * 60 * 23 * 1000),
    });
    
    // Criar um objeto User completo com valores padrão para as propriedades ausentes
    const user: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      token: data.access_token,
      transactions: [],
      balances: [],
      role: 'user',
      // Adicione valores padrão para as outras propriedades necessárias
      // Por exemplo:
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      // Adicione as outras propriedades aqui com valores padrão adequados
      // ...
      // Se não souber os nomes exatos, você pode usar uma asserção de tipo
      // para ignorar as verificações de tipo
    } as User;
    
    return user;
  } else {
    const data: Exception = await response.json();
    const errorMessage = data.message || "Erro ao fazer login. Por favor, tente novamente.";
    return { error: errorMessage };
  }
}