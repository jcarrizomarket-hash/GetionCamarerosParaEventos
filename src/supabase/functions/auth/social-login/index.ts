// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { provider, idToken } = await req.json()

    if (!provider || !idToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Provider e idToken son requeridos' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: provider as any,
      token: idToken,
    })

    if (error || !data.session) {
      return new Response(
        JSON.stringify({ success: false, error: error?.message ?? 'Error de autenticación social' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const user = data.user
    const role = user.user_metadata?.role ?? 'User'

    return new Response(
      JSON.stringify({
        success: true,
        token: data.session.access_token,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.user_metadata?.nombre ?? user.user_metadata?.name ?? '',
          apellido: user.user_metadata?.apellido,
          role,
          createdAt: user.created_at,
          updatedAt: user.updated_at ?? user.created_at,
        },
        role,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message ?? 'Error interno' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
