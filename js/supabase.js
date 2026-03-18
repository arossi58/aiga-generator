/* ════════════════════════════════════════════
   SUPABASE — Community Templates
   Uses the official Supabase JS SDK (loaded via CDN in index.html)
   which handles the sb_publishable_ key format natively.
════════════════════════════════════════════ */

const SUPABASE_TABLE = 'templates';

/* ── Init official client ─────────────────── */
const _sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

/* ── Public API ─────────────────────────────── */

/** Fetch all community templates, newest first */
async function sbGetTemplates() {
  const { data, error } = await _sb
    .from(SUPABASE_TABLE)
    .select('id, name, user_name, created_at, data')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`sbGetTemplates: ${error.message}`);
  return data;
}

/** Save a template to Supabase */
async function sbSaveTemplate(name, userName, data) {
  const { data: rows, error } = await _sb
    .from(SUPABASE_TABLE)
    .insert({ name, user_name: userName || null, data })
    .select();
  if (error) throw new Error(`sbSaveTemplate: ${error.message}`);
  return rows && rows[0];
}

/** Delete a template by id (only works if RLS allows it) */
async function sbDeleteTemplate(id) {
  const { error } = await _sb.from(SUPABASE_TABLE).delete().eq('id', id);
  if (error) throw new Error(`sbDeleteTemplate: ${error.message}`);
}
