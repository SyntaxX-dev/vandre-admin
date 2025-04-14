"use server";

import { cookies } from "next/headers";
import { decrypt } from "../crypto/crypt";

export const getToken = async () => {
  "use server";

  const cookieStore = cookies();
  const data: any = cookieStore.get("token");

  if (!!data) {
    return {
      token: decrypt(data?.value),
    };
  } else {
    return {
      token: null,
    };
  }
};