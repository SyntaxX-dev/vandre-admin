"use server";
import { cookies } from "next/headers";
import { crypt } from "../crypto/crypt";

export async function changeCookie(name: string, value: string) {
  "use server";
  const cryptCookie = crypt(value);
  cookies().set(name, cryptCookie);
  return;
}
