/* Email authentication module for Second Cerveau OS.
   Uses only Supabase publishable key; never stores email sign-in credentials itself.
   Local Second Cerveau data is unaffected by this module. */
(() => {
  'use strict';
  const ROOT = 'https://jonathan777888.github.io/jonathan-os/';
  const API_URL = 'https://wuhbalxjpcfemsxdnggp.supabase.co';
  const API_KEY = 'sb_publishable_mPFAK_h6L8JjUQRuVx5RVg_odLPQNRn';
  const CALLBACK = ROOT; // Use the already configured Second Cerveau Site URL.
  let client = null, busy = false, currentEmail = '', subscription = null;
  const el = id => document.getElementById(id);
  const escapeText = str => String(str || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const isValidEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;

  function status(message, tone) {
    const target = el('sbEmailStatus');
    if (target) { target.textContent = message; target.dataset.tone = tone || ''; }
  }
  function setBusy(value) {
    busy = Boolean(value);
    for (const id of ['sbEmailSend', 'sbEmailVerify', 'sbEmailSignOut']) {
      const node = el(id); if (node) node.disabled = busy || !client;
    }
  }
  function ui(user) {
    const logged = Boolean(user && user.id);
    if (el('sbEmailGuest')) el('sbEmailGuest').hidden = logged;
    if (el('sbEmailLogged')) el('sbEmailLogged').hidden = !logged;
    if (el('sbEmailIdentity')) {
      el('sbEmailIdentity').textContent = logged ? user.email || 'Compte connecté' : '';
    }
    if (logged) {
      status('Compte connecté. Tu peux retourner à Second Cerveau OS.', 'success');
      const otp = el('sbEmailOtp'); if (otp) otp.hidden = true;
      const input = el('sbEmailCode'); if (input) input.value = '';
    }
    if (!logged && !busy) {
      status('Tu peux continuer à utiliser tes notes locales sans être connecté.');
    }
  }
  function explainAuthError(error) {
    const msg = String(error && (error.message || error) || 'Erreur inconnue.');
    if (/rate.limit|rate limit|429/i.test(msg)) return 'Trop de demandes de connexion. Réessaie plus tard.';
    if (/email.*not.*authorized|email.*not.*allowed|email.*address.*not/i.test(msg)) return 'Ce projet n’autorise pas encore l’envoi vers cette adresse. Vérifie la configuration SMTP et les destinataires autorisés dans Supabase.';
    return 'Connexion non aboutie : ' + msg;
  }
  async function ensureClient() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      return window.supabase.createClient(API_URL, API_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    }
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/dist/umd/supabase.min.js';
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Le module Supabase n’a pas pu être chargé.'));
      document.head.append(script);
    });
    if (!window.supabase || typeof window.supabase.createClient !== 'function') throw new Error('Module Supabase indisponible.');
    return window.supabase.createClient(API_URL, API_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }

  async function sendMagicLink(event) {
    event.preventDefault();
    if (busy || !client) return;
    const input = el('sbEmailInput');
    const address = (input && input.value || '').trim().toLowerCase();
    if (!isValidEmail(address)) { status('Entre une adresse e-mail valide.', 'error'); return; }
    currentEmail = address;
    setBusy(true);
    status('Demande de lien de connexion en cours…');
    try {
      const { error } = await client.auth.signInWithOtp({
        email: address,
        options: { emailRedirectTo: CALLBACK, shouldCreateUser: true }
      });
      if (error) throw error;
      status('Si l’envoi est autorisé, un e-mail est en route. Consulte ta boîte de réception et tes courriels indésirables. Ouvre le lien sur cet appareil.', 'success');
      if (el('sbEmailOtp')) el('sbEmailOtp').hidden = false;
      if (el('sbEmailCode')) el('sbEmailCode').focus();
    } catch (error) {
      status(explainAuthError(error), 'error');
    } finally { setBusy(false); }
  }

  async function verifyCode(event) {
    event.preventDefault();
    if (busy || !client) return;
    const code = (el('sbEmailCode') && el('sbEmailCode').value || '').replace(/\s/g, '');
    if (!currentEmail) currentEmail = (el('sbEmailInput') && el('sbEmailInput').value || '').trim().toLowerCase();
    if (!isValidEmail(currentEmail) || !/^\d{6,8}$/.test(code)) {
      status('Entre ton e-mail et le code numérique reçu. Si tu as reçu un lien, clique directement sur celui-ci.', 'error'); return;
    }
    setBusy(true);
    status('Vérification du code…');
    try {
      const {error, data} = await client.auth.verifyOtp({email:currentEmail, token:code, type:'email'});
      if (error) throw error;
      ui(data && data.user);
    } catch(error) { status(explainAuthError(error), 'error'); }
    finally { setBusy(false); }
  }

  async function signOut(event) {
    event.preventDefault();
    if (!client || busy) return;
    setBusy(true);
    status('Déconnexion de cet appareil…');
    try {
      const {error} = await client.auth.signOut({scope:'local'});
      if (error) throw error;
      ui(null);
      status('Tu es déconnecté de cet appareil. Tes notes locales n’ont pas été effacées.', 'success');
    } catch(error) { status(explainAuthError(error), 'error'); }
    finally { setBusy(false); }
  }

  async function start() {
    const form = el('sbEmailForm');
    if (!form) return;
    form.addEventListener('submit', sendMagicLink);
    const otp = el('sbEmailOtpForm'); if (otp) otp.addEventListener('submit', verifyCode);
    const logout = el('sbEmailSignOut'); if (logout) logout.addEventListener('click', signOut);
    setBusy(true);
    status('Connexion au service d’authentification…');
    try {
      client = await ensureClient();
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      setBusy(false);
      ui(data && data.session && data.session.user);
      const listener = client.auth.onAuthStateChange((_event, session) => {
        ui(session && session.user);
      });
      subscription = listener && listener.data && listener.data.subscription;
    } catch(error) {
      setBusy(false);
      for (const id of ['sbEmailSend','sbEmailVerify','sbEmailSignOut']) {
        if (el(id)) el(id).disabled = true;
      }
      status('Impossible de charger la connexion. Tu peux toujours accéder à Second Cerveau sans compte. ' + String(error.message||error), 'error');
    }
  }
  document.addEventListener('DOMContentLoaded', start, {once:true});
})();
