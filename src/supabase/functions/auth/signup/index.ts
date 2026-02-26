// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/** Validate password meets minimum strength requirements */
function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (password.length < 8) errors.push('Mínimo 8 caracteres')
  if (!/[A-Z]/.test(password)) errors.push('Al menos una letra mayúscula')
  if (!/[a-z]/.test(password)) errors.push('Al menos una letra minúscula')
  if (!/[0-9]/.test(password)) errors.push('Al menos un número')
  if (!/[!@#$%^&*]/.test(password)) errors.push('Al menos un carácter especial (!@#$%^&*)')
  return { valid: errors.length === 0, errors }
}

const VALID_ROLES = ['admin', 'coordinador', 'camarero'] as const
type UserRole = typeof VALID_ROLES[number]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, nombre, apellido, role } = await req.json()

    // Required field validation
    if (!email || !password || !nombre) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email, contraseña y nombre son requeridos' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Email format validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Formato de email inválido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Server-side password strength validation
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'La contraseña no cumple los requisitos de seguridad',
          details: passwordValidation.errors,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Role validation — default to 'camarero' if not provided
    const assignedRole: UserRole = VALID_ROLES.includes(role) ? role : 'camarero'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre, apellido, role: assignedRole },
      app_metadata: { role: assignedRole },
    })

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const user = data.user
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.user_metadata?.nombre ?? '',
          apellido: user.user_metadata?.apellido,
          role: assignedRole,
          createdAt: user.created_at,
          updatedAt: user.updated_at ?? user.created_at,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message ?? 'Error interno' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
