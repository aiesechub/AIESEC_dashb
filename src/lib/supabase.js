// src/lib/supabase.js
// ─────────────────────────────────────────────────────────────
// Install:  npm install @supabase/supabase-js
//
// .env (project root, next to package.json):
//   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-key-here
// ─────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─────────────────────────────────────────────────────────────
// EVENTS — public helpers (used by EventsFeature on the site)
// ─────────────────────────────────────────────────────────────

/** Fetch active events ordered by display_order — used on public site */
export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// EVENTS — admin helpers (used by EventsManager)
// ─────────────────────────────────────────────────────────────

/** Fetch ALL events including hidden ones — admin only */
export async function getAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data;
}

/** Create a new event row */
export async function createEvent(event) {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Update an existing event by id */
export async function updateEvent(id, updates) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Delete an event row by id */
export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

/** Reorder events — pass array of { id, display_order } */
export async function reorderEvents(items) {
  await Promise.all(
    items.map(({ id, display_order }) =>
      supabase.from('events').update({ display_order }).eq('id', id)
    )
  );
}

// ─────────────────────────────────────────────────────────────
// STORAGE — Supabase Storage helpers for event-photos bucket
// ─────────────────────────────────────────────────────────────

const BUCKET = 'event-photos';

/**
 * Upload a photo File to Supabase Storage.
 * Returns the public URL string.
 *
 * @param {File}   file        - The File object from <input type="file">
 * @param {string} [folder=''] - Optional subfolder inside the bucket
 */
export async function uploadEventPhoto(file, folder = '') {
  const ext      = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path     = folder ? `${folder}/${filename}` : filename;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a photo from Supabase Storage by its full public URL.
 */
export async function deleteEventPhoto(publicUrl) {
  try {
    const marker = `/object/public/${BUCKET}/`;
    const idx    = publicUrl.indexOf(marker);
    if (idx === -1) return;
    const storagePath = decodeURIComponent(publicUrl.slice(idx + marker.length));
    await supabase.storage.from(BUCKET).remove([storagePath]);
  } catch {
    console.warn('Could not delete photo from storage:', publicUrl);
  }
}