import { openapi } from "@/lib/openapi";

export const { GET, HEAD, PUT, POST, PATCH, DELETE } = openapi.createProxy({
    allowedOrigins: ["https://api.astracms.com", "https://docs.astracms.com", "http://localhost:3000", "http://localhost:8787"]
});
