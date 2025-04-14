"use server";

import { cookies } from "next/headers";
import { decrypt } from "../crypto/crypt";

export const getCookie = async (name: string, json: boolean = false) => {
  "use server";

  const cookieStore = cookies();
  const data: any = cookieStore.get(name);

  if (!!data) {
    const cookie = decrypt(data?.value);

    if (json) {
      if (cookie) {
        return JSON.parse(cookie);
      } else {
        return null;
      }
    }

    return cookie;
  } else {
    return null;
  }
};