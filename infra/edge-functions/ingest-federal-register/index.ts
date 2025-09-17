import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';

const FEDERAL_REGISTER_API = 'https://www.federalregister.gov/api/v1/documents';
const DEFAULT_SOURCES = ['TREASURY/IRS', 'JUSTICE/DOJ'];

type FederalRegisterDocument = {
  document_number: string;
  title: string;
  publication_date: string;
  agencies: { name: string }[];
  html_url: string;
  body_html: string;
};

type IngestStats = {
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
};

async function upsertDocument(
  supabase: ReturnType<typeof createClient>,
  agency: string,
  doc: FederalRegisterDocument,
  stats: IngestStats,
) {
  stats.processed += 1;
  const categories = doc.agencies.map((entry) => entry.name);

  const { data: existing } = await supabase
    .from('documents')
    .select('id')
    .eq('source', agency)
    .eq('source_id', doc.document_number)
    .maybeSingle();

  const upsertPayload = {
    source: agency,
    source_id: doc.document_number,
    title: doc.title?.trim() ?? 'Untitled federal register notice',
    published_at: doc.publication_date,
    imported_at: new Date().toISOString(),
    status: 'imported',
    raw_text: doc.body_html,
    summary: null,
    categories,
    url: doc.html_url,
    metadata: { source: 'federal-register' },
  };

  const { error } = await supabase
    .from('documents')
    .upsert(upsertPayload, { onConflict: 'source,source_id' });

  if (error) {
    console.error('Failed to upsert document', { docId: doc.document_number, error });
    stats.errors += 1;
    return;
  }

  if (existing) {
    stats.updated += 1;
  } else {
    stats.inserted += 1;
  }
}

async function ingestAgency(
  supabase: ReturnType<typeof createClient>,
  agency: string,
  since: string,
  stats: IngestStats,
) {
  const apiUrl = `${FEDERAL_REGISTER_API}?order=newest&per_page=20&conditions[publication_date][gte]=${since}&conditions[agencies][]=${encodeURIComponent(
    agency,
  )}`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    console.error(`Federal Register request failed for ${agency}`, await response.text());
    stats.errors += 1;
    return;
  }

  const payload = await response.json();
  const documents: FederalRegisterDocument[] = payload?.results ?? [];

  if (!documents.length) {
    stats.skipped += 1;
  }

  for (const doc of documents) {
    await upsertDocument(supabase, agency, doc, stats);
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { searchParams } = new URL(req.url);
  const since = searchParams.get('since') ?? new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
  const sources = searchParams.getAll('source').length
    ? searchParams.getAll('source')
    : DEFAULT_SOURCES;

  const supabaseUrl =
    Deno.env.get('SIMPLEGOV_SUPABASE_URL') ?? Deno.env.get('SUPABASE_URL');
  const serviceKey =
    Deno.env.get('SIMPLEGOV_SUPABASE_SERVICE_ROLE_KEY') ??
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase credentials');
    return new Response('Server misconfigured', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const stats: IngestStats = { processed: 0, inserted: 0, updated: 0, skipped: 0, errors: 0 };

  for (const agency of sources) {
    await ingestAgency(supabase, agency, since, stats);
  }

  return new Response(JSON.stringify({ ok: true, since, sources, stats }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
