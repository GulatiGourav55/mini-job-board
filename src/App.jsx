import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'

const API_BASE = '/api' // mapped to Netlify functions via netlify.toml

function getApplyHref(job) {
  if (!job || !job.applicationLink) return null;
  const link = String(job.applicationLink).trim();

  // If it's already a full URL (http/https), just return it
  if (link.startsWith('http://') || link.startsWith('https://')) {
    return link;
  }

  // If it's an email address
if (link.includes('@')) {
  const subject = `Application for ${job.title || 'role'}`;
  return `mailto:${link}?subject=${encodeURIComponent(subject)}`;
  }

  return link;
}

function Layout({ children }) {
  return (
    <div style={{maxWidth:960, margin:'0 auto', padding:'24px'}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <Link to="/" style={{textDecoration:'none', color:'#fff'}}>
          <h1 style={{margin:0, fontSize:24}}>Open Roles</h1>
          <div style={{opacity:0.7, fontSize:14}}>Gaurav Gulati • Talent Acquisition</div>
        </Link>
        <nav style={{display:'flex', gap:12}}>
          <Link to="/" style={{color:'#9ca3af'}}>Jobs</Link>
          <Link to="/admin" style={{color:'#9ca3af'}}>Admin</Link>
        </nav>
      </header>
      {children}
      <footer style={{marginTop:48, opacity:0.6, fontSize:12}}>
        © {new Date().getFullYear()} Gaurav Gulati
      </footer>
    </div>
  )
}

function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/jobs`)
        if (!res.ok) throw new Error('Failed to load jobs')
        const data = await res.json()
        setJobs(data.jobs || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div>Loading…</div>
  if (error) return <div style={{color:'#fca5a5'}}>Error: {error}</div>

  if (!jobs.length) {
    return (
      <Layout>
        <div style={{background:'#111827', padding:24, borderRadius:16}}>
          <h2 style={{marginTop:0}}>No open roles right now</h2>
          <p>Check back later, or connect with me on LinkedIn.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{display:'grid', gap:16}}>
        {jobs.map(job => (
          <article key={job.id} style={{background:'#111827', padding:24, borderRadius:16, border:'1px solid #1f2937'}}>
            <h2 style={{marginTop:0, marginBottom:8}}>{job.title}</h2>
            <div style={{display:'flex', gap:12, fontSize:14, opacity:0.8, marginBottom:8}}>
              {job.location && <span>📍 {job.location}</span>}
              {job.type && <span>💼 {job.type}</span>}
              {job.experience && <span>⭐ {job.experience}</span>}
              {job.salary && <span>💰 {job.salary}</span>}
            </div>
            {job.description && <p style={{whiteSpace:'pre-wrap'}}>{job.description}</p>}
            <div style={{display:'flex', gap:12, marginTop:12}}>
              {job.applicationLink && (() => {
                const href = getApplyHref(job);
                return href ? (
                  <button
                     onClick={() => alert(`Please share your resume at ${job.applicationLink}`)} 
                     style={{background:'#2563eb', padding:'8px 12px', borderRadius:8, color:'#fff', border:'none', cursor:'pointer'}}
                    
                  >
                    Apply
                  </button>
                ) : null;
              })()}
              <a href={window.location.href} style={{padding:'8px 12px', borderRadius:8, background:'#374151', color:'#fff', textDecoration:'none'}}>Share</a>
            </div>
          </article>
        ))}
      </div>
    </Layout>
  )
}

function Admin() {
  const [token, setToken] = useState(sessionStorage.getItem('adminToken') || '')
  const [authed, setAuthed] = useState(!!sessionStorage.getItem('adminToken'))
  const [form, setForm] = useState({ title:'', location:'', type:'', experience:'', salary:'', description:'', applicationLink:'' })
  const [jobs, setJobs] = useState([])
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_BASE}/jobs`).then(r => r.json()).then(d => setJobs(d.jobs || []))
  }, [])

  function handleLogin(e) {
    e.preventDefault()
    if (!token) return
    sessionStorage.setItem('adminToken', token)
    setAuthed(true)
    setMsg('Logged in.')
  }

  async function addJob(e) {
    e.preventDefault()
    setMsg('Saving…')

    // prepare payload (leave Gmail link generation for frontend)
    const payload = { ...form }
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (sessionStorage.getItem('adminToken') || '') },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      setMsg('Save failed. Check token in Netlify env.')
      return
    }
    const data = await res.json()
    setJobs([data.job, ...jobs])
    setForm({ title:'', location:'', type:'', experience:'', salary:'', description:'', applicationLink:'' })
    setMsg('Saved ✓')
  }

  async function removeJob(id) {
    if (!confirm('Delete this job?')) return
    setMsg('Deleting…')
    const res = await fetch(`${API_BASE}/jobs?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + (sessionStorage.getItem('adminToken') || '') }
    })
    if (res.ok) {
      setJobs(jobs.filter(j => j.id !== id))
      setMsg('Deleted ✓')
    } else {
      setMsg('Delete failed. Check token.')
    }
  }

  if (!authed) {
    return (
      <Layout>
        <div style={{background:'#111827', padding:24, borderRadius:16, maxWidth:520}}>
          <h2 style={{marginTop:0}}>Admin</h2>
          <p style={{opacity:0.8}}>Enter your secret Admin Token to manage roles. Set this as <code>ADMIN_TOKEN</code> in Netlify.</p>
          <form onSubmit={handleLogin} style={{display:'grid', gap:12}}>
            <input value={token} onChange={e=>setToken(e.target.value)} placeholder="Admin Token" style={{padding:10, borderRadius:8, border:'1px solid #374151', background:'#0b1220', color:'#fff'}} />
            <button type="submit" style={{padding:10, borderRadius:8, background:'#2563eb', color:'#fff'}}>Unlock</button>
          </form>
          <p style={{opacity:0.7, marginTop:8}}>{msg}</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{display:'grid', gap:24}}>
        <section style={{background:'#111827', padding:24, borderRadius:16}}>
          <h2 style={{marginTop:0}}>Post a new role</h2>
          <form onSubmit={addJob} style={{display:'grid', gap:12}}>
            <input required placeholder="Job title *" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} style={{padding:10, borderRadius:8, border:'1px solid #374151', background:'#0b1220', color:'#fff'}} />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <input placeholder="Location" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} style={{padding:10, borderRadius:8, border:'1px solid #374151', background:'#0b1220', color:'#fff'}} />
              <input placeholder="Type (Full-time/Contract)" value={form.type} onChange={e=>setForm({...form, type:e.target.value})} style={{padding:10, borderRadius:8, border:'1px solid #374151', background:'#0b1220', color:'#fff'}} />
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <input placeholder="Experience (e.g., 3–5 yrs)" value={form.experience} onChange={e=>setForm({...form, experience:e.target.value})} style={{padding:10, borderRadius:8, border:'1px solid #374151', background:'#0b1220', color:'#fff'}} />
              <input placeholder="Salary (optional)" value={form.salary} onChange={e=>setForm({...form, salary:e.target.value})} style={{padding:10, borderRadius:8, border:'1px solid #374151', background:'#0b1220', color:'#fff'}} />
            </div>
            <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} rows={6} style={{padding:10, borderRadius:8, border:'1px solid #374151', background:'#0b1220', color:'#fff'}} />
            <input placeholder="Application email (you@company.com) or full link" value={form.applicationLink} onChange={e=>setForm({...form, applicationLink:e.target.value})} style={{padding:10, borderRadius:8, border:'1px solid #374151', background:'#0b1220', color:'#fff'}} />
            <div style={{display:'flex', gap:12}}>
              <button type="submit" style={{padding:'10px 14px', borderRadius:8, background:'#2563eb', color:'#fff'}}>Post role</button>
              <button type="button" onClick={()=>{ sessionStorage.removeItem('adminToken'); window.location.reload(); }} style={{padding:'10px 14px', borderRadius:8, background:'#374151', color:'#fff'}}>Lock</button>
            </div>
          </form>
          <div style={{opacity:0.7, marginTop:8}}>{msg}</div>
        </section>

        <section>
          <h3>Your open roles</h3>
          <div style={{display:'grid', gap:12}}>
            {jobs.map(j => (
              <div key={j.id} style={{background:'#111827', padding:16, borderRadius:12, border:'1px solid #1f2937', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:600}}>{j.title}</div>
                  <div style={{opacity:0.7, fontSize:12}}>{j.location} {j.type ? '• ' + j.type : ''}</div>
                </div>
                <button onClick={()=>removeJob(j.id)} style={{background:'#ef4444', color:'#fff', border:'none', padding:'8px 10px', borderRadius:8}}>Delete</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Jobs />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
