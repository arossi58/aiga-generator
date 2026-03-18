/* ════════════════════════════════════════════
   SUPABASE — Community Templates
   Uses the official Supabase JS SDK (loaded via CDN in index.html)
════════════════════════════════════════════ */

const SUPABASE_TABLE = 'templates';

/* ── Init client (lazy to avoid TDZ if CDN loads async) ── */
let _sb = null;
function _getSb() {
  if (_sb) return _sb;
  if (typeof supabase === 'undefined') throw new Error('Supabase SDK not loaded — check CDN connection.');
  _sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  return _sb;
}

/* ── Public API ─────────────────────────────── */

/** Fetch all community templates, newest first */
async function sbGetTemplates() {
  const { data, error } = await _getSb()
    .from(SUPABASE_TABLE)
    .select('id, name, user_name, created_at, data')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`sbGetTemplates: ${error.message}`);
  return data;
}

/** Save a template to Supabase */
async function sbSaveTemplate(name, userName, data) {
  const { data: rows, error } = await _getSb()
    .from(SUPABASE_TABLE)
    .insert({ name, user_name: userName || null, data })
    .select();
  if (error) throw new Error(`sbSaveTemplate: ${error.message}`);
  return rows && rows[0];
}

/** Delete a template by id (only works if RLS allows it) */
async function sbDeleteTemplate(id) {
  const { error } = await _getSb().from(SUPABASE_TABLE).delete().eq('id', id);
  if (error) throw new Error(`sbDeleteTemplate: ${error.message}`);
}

/** Fetch a single template's data by id */
async function sbGetTemplate(id) {
  const { data, error } = await _getSb()
    .from(SUPABASE_TABLE)
    .select('data')
    .eq('id', id)
    .limit(1)
    .single();
  if (error) throw new Error(`sbGetTemplate: ${error.message}`);
  return data;
}
