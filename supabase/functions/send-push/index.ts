// Supabase Edge Function: send-push
// Deploy with: npx supabase functions deploy send-push
// This function sends Expo push notifications to customers

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const { token, title, body, data } = await req.json()

    if (!token || !title) {
      return new Response(JSON.stringify({ error: 'token and title required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const message = {
      to: token,
      sound: 'default',
      title,
      body: body || '',
      data: data || {},
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    const result = await response.json()
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
