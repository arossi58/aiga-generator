/* ════════════════════════════════════════════
   SUPABASE — Community Templates
   Replace SUPABASE_URL and SUPABASE_ANON_KEY with
   your values from Project Settings → API
════════════════════════════════════════════ */
const SUPABASE_URL      = CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;
const SUPABASE_TABLE    = 'templates';

/* ── Thin REST client (no npm needed) ──────── */
async function _sbFetch(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        method === 'POST' ? 'return=representation' : '',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase ${method} ${path}: ${err}`);
  }
  return res.status === 204 ? null : res.json();
}

/* ── Public API ─────────────────────────────── */

/** Fetch all community templates, newest first */
async function sbGetTemplates() {
  return _sbFetch('GET',
    `${SUPABASE_TABLE}?select=id,name,user_name,created_at,data&order=created_at.desc`
  );
}

/** Save a template to Supabase */
async function sbSaveTemplate(name, userName, data) {
  const rows = await _sbFetch('POST', SUPABASE_TABLE, {
    name,
    user_name: userName || null,
    data,
  });
  return rows && rows[0];
}

/** Delete a template by id (only works if RLS allows it) */
async function sbDeleteTemplate(id) {
  return _sbFetch('DELETE', `${SUPABASE_TABLE}?id=eq.${id}`);
}
