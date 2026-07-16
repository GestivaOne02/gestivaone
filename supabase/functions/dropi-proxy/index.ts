import { createClient } from "jsr:@supabase/supabase-js@2"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// Simple in-memory rate limiter (per isolate)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30 // 30 requests per minute

function checkRateLimit(ip: string | null, userId: string | undefined): boolean {
  const key = userId || ip || 'anonymous'
  const now = Date.now()
  let record = rateLimitMap.get(key)

  if (!record || now > record.resetAt) {
    record = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS }
    rateLimitMap.set(key, record)
    return true
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }

  record.count++
  return true
}

Deno.serve(async (req: Request) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  }

  try {
    // 1. Validate JWT and get User
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    
    // Create client acting as the user
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    // 2. Rate Limiting
    // Extract IP from common headers if behind proxy
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null
    if (!checkRateLimit(clientIp, user.id)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    // 3. Parse Request
    const body = await req.json()
    const { action, companyId, payload } = body

    if (!action || !companyId) {
      return new Response(JSON.stringify({ error: "Missing action or companyId" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    // 4. Fetch the company's Dropi token securely from the database
    // We use the service role key to bypass RLS in case store_settings is restricted, 
    // OR we can use the user client if RLS allows it. Let's use userClient so RLS naturally protects it.
    const { data: company, error: dbError } = await supabaseUserClient
      .from("companies")
      .select("store_settings")
      .eq("id", companyId)
      .single()

    if (dbError || !company) {
      return new Response(JSON.stringify({ error: "Company not found or access denied" }), {
        status: 403,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    const dropiToken = company.store_settings?.integrations?.dropi_token
    if (!dropiToken) {
      return new Response(JSON.stringify({ error: "Dropi token not configured for this company" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    // 5. Route to Dropi API
    let dropiRes;
    
    if (action === "test") {
      dropiRes = await fetch("https://dropi.co/api/external/v1/orders?page=1&per_page=1", {
        headers: {
          Authorization: `Bearer ${dropiToken}`,
          Accept: "application/json"
        }
      })
    } else if (action === "search_cities") {
      const query = payload?.search || ""
      dropiRes = await fetch(`https://dropi.co/api/external/v1/cities?search=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${dropiToken}`,
          Accept: "application/json"
        }
      })
    } else if (action === "push_order") {
      dropiRes = await fetch("https://dropi.co/api/external/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${dropiToken}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      })
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    // 6. Return Dropi response to client
    const dropiData = await dropiRes.json().catch(() => ({}))
    
    if (!dropiRes.ok) {
      return new Response(JSON.stringify({ error: dropiData?.message || `Dropi API Error: ${dropiRes.status}` }), {
        status: dropiRes.status,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify(dropiData), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })

  } catch (err: any) {
    console.error("Dropi proxy error:", err)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  }
})
