import axios from "axios";
import { env } from "@/env";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export async function request<T>(
  endpoint: string,
  method: RequestMethod = "GET",
  body?: unknown
) {
  const response = await axios<T>({
    method,
    url: `${env.NEXT_PUBLIC_APP_URL}/api/${endpoint}`,
    data: body,
  });
  return response;
}
