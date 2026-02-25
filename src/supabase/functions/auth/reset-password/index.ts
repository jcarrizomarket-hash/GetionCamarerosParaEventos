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
    const { token, tempPassword, newPassword } = await req.json()

    if (!token || !tempPassword || !newPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token, contraseña temporal y nueva contraseña son requeridos' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Look up the temp password record
    const { data: resetRecord, error: lookupError } = await supabase
      .from('password_resets')
      .select('user_id, temp_password, expires_at, used')
      .eq('token', token)
      .single()

    if (lookupError || !resetRecord) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token inválido o no encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (resetRecord.used) {
      return new Response(
        JSON.stringify({ success: false, error: 'Este token ya ha sido utilizado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: 'El token ha expirado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (resetRecord.temp_password !== tempPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Contraseña temporal incorrecta' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.admin.updateUserById(resetRecord.user_id, {
      password: newPassword,
    })

    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Mark token as used
    await supabase.from('password_resets').update({ used: true }).eq('token', token)

    return new Response(
      JSON.stringify({ success: true, message: 'Contraseña actualizada correctamente' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message ?? 'Error interno' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
