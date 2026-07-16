// supabase/functions/resend-email/index.ts
// Edge Function: Proxy de correos via Resend API
// Desplegada en Supabase – la RESEND_API_KEY nunca llega al cliente.

/// <reference path="./global.d.ts" />
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set in Edge Function secrets")
    return new Response(
      JSON.stringify({ error: "Servicio de correo no configurado. Contacta al administrador." }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    )
  }

  let body: {
    to: string | string[]
    subject: string
    html: string
    from?: string
    reply_to?: string
    attachments?: Array<{ filename: string; content: string }>
  }

  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "Body JSON inválido" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  }

  const { to, subject, html, from, reply_to, attachments } = body

  if (!to || !subject || !html) {
    return new Response(JSON.stringify({ error: "Faltan campos requeridos: to, subject, html" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  }

  const payload: Record<string, unknown> = {
    from: from || "GestivaOne <onboarding@resend.dev>",
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  }

  if (reply_to) payload.reply_to = reply_to
  if (attachments && attachments.length > 0) payload.attachments = attachments

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Resend API error:", data)
      return new Response(
        JSON.stringify({ error: data.message || "Error del proveedor de correo" }),
        {
          status: response.status,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      )
    }

    return new Response(JSON.stringify({ id: data.id, success: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("Fetch to Resend failed:", err)
    return new Response(
      JSON.stringify({ error: "Error de conexión con el servicio de correo" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    )
  }
})
