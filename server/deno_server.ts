import "jsr:@std/dotenv@^0.225.6/load";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.24.1";


const PORT = 8000;

// Access API key from environment variables
const apiKey = Deno.env.get("GEMINI_API_KEY") || "";

if (!apiKey) {
  console.warn("⚠️ ADVERTENCIA: La variable GEMINI_API_KEY no está definida en tu archivo .env.");
  console.warn("Por favor, asegúrate de tener un archivo .env en la raíz con: GEMINI_API_KEY=\"TU_API_KEY\"");
}

// Initialize the Google Generative AI SDK
const genAI = new GoogleGenerativeAI(apiKey);

// Deno HTTP Server handler
const handler = async (req: Request): Promise<Response> => {
  // CORS Headers
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  // Handle CORS Preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  // Handle Chat API requests
  if (req.method === "POST" && new URL(req.url).pathname === "/api/chat") {
    try {
      if (!apiKey) {
        return new Response(
          JSON.stringify({
            error: "La API Key de Gemini no está configurada en el servidor de Deno.",
          }),
          { status: 500, headers: { ...Object.fromEntries(headers), "Content-Type": "application/json" } }
        );
      }

      // Parse prompt from body
      const body = await req.json().catch(() => ({}));
      const prompt = body.prompt;

      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "Falta el campo 'prompt' en el cuerpo de la petición." }),
          { status: 400, headers: { ...Object.fromEntries(headers), "Content-Type": "application/json" } }
        );
      }

      console.log(`[Deno Server] Recibido prompt: "${prompt.slice(0, 60)}${prompt.length > 60 ? '...' : ''}"`);

      // Initialize Gemini Model dynamically from environment variable
      const modelName = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
      console.log(`[Deno Server] Utilizando modelo: "${modelName}"`);
      const model = genAI.getGenerativeModel({ model: modelName });

      // Generate content
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      console.log(`[Deno Server] Respuesta generada exitosamente (${responseText.length} caracteres)`);

      return new Response(
        JSON.stringify({ response: responseText }),
        { status: 200, headers: { ...Object.fromEntries(headers), "Content-Type": "application/json" } }
      );

    } catch (err: any) {
      console.error("[Deno Server Error]:", err);
      return new Response(
        JSON.stringify({ error: `Ocurrió un error en el servidor Deno: ${err.message}` }),
        { status: 500, headers: { ...Object.fromEntries(headers), "Content-Type": "application/json" } }
      );
    }
  }

  // Fallback 404
  return new Response(
    JSON.stringify({ error: "Ruta no encontrada." }),
    { status: 404, headers: { ...Object.fromEntries(headers), "Content-Type": "application/json" } }
  );
};

console.log(`🚀 Servidor backend en Deno corriendo en http://localhost:${PORT}`);
Deno.serve({ port: PORT }, handler);
