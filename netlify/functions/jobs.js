import { getStore } from '@netlify/blobs'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS'
}

export default async (req, context) => {
  const store = getStore('jobs-store')

  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (req.method === 'GET') {
      const raw = await store.get('all-jobs')
      const jobs = raw ? JSON.parse(raw) : []
      return Response.json({ jobs }, { headers: corsHeaders })
    }

    // Auth for modifying routes
    const auth = req.headers.get('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    const adminToken = process.env.ADMIN_TOKEN || ''
    if (!adminToken || token !== adminToken) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    if (req.method === 'POST') {
      const payload = await req.json()
      const { title, location, type, experience, salary, description, applicationLink } = payload || {}
      if (!title) return new Response('Missing title', { status: 400, headers: corsHeaders })

      const raw = await store.get('all-jobs')
      const jobs = raw ? JSON.parse(raw) : []
      const job = {
        id: (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
        title, location, type, experience, salary, description, applicationLink,
        createdAt: new Date().toISOString()
      }
      jobs.unshift(job)
      await store.setJSON('all-jobs', jobs)
      return Response.json({ job }, { headers: corsHeaders })
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url)
      const id = url.searchParams.get('id')
      if (!id) return new Response('Missing id', { status: 400, headers: corsHeaders })

      const raw = await store.get('all-jobs')
      const jobs = raw ? JSON.parse(raw) : []
      const filtered = jobs.filter(j => j.id !== id)
      await store.setJSON('all-jobs', filtered)
      return Response.json({ ok: true }, { headers: corsHeaders })
    }

    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  } catch (err) {
    console.error('jobs function error', err)
    return new Response('Server error', { status: 500, headers: corsHeaders })
  }
}
