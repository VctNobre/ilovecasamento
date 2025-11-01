// app.js (Versão Módulo Corrigida e Robusta)

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const SUPABASE_URL = 'https://usqlbfemsriqdohrslck.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcWxiZmVtc3JpcWRvaHJzbGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Nzg0NjIsImV4cCI6MjA3MzQ1NDQ2Mn0.12Cg9TJF1ENQcxloS9N--DlH2UzdjgUDpv2-gqUFNho';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {

        storage: window.sessionStorage,
    }
});

// --- FUNÇÃO DE NOTIFICAÇÃO TOAST GLOBAL ---
const showToast = (message, type = 'success') => {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) { alert(message); return; }
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? `<svg class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>` : `<svg class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    toast.className = `flex items-center text-white p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
    toast.innerHTML = `${icon}<span>${message}</span>`;
    toast.classList.add(bgColor);
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.classList.remove('translate-x-full', 'opacity-0'); }, 10);
    setTimeout(() => { toast.classList.add('translate-x-full', 'opacity-0'); toast.addEventListener('transitionend', () => toast.remove()); }, 5000);
};

// Exporta as funções para que outros ficheiros as possam usar
export { supabaseClient, showToast };

// --- LÓGICA DE REDIRECIONAMENTO GLOBAL (CORRIGIDA) ---
supabaseClient.auth.onAuthStateChange((event, session) => {
    const user = session?.user;
    const currentPage = window.location.pathname;
    
    // Se temos um utilizador (sessão existe)...
    if (user) {
        // E estamos na página de login...
        if (currentPage.includes('/login')) {
            
            // ...NÃO nos redirecione se o evento for PASSWORD_RECOVERY.
            // Isto permite ao auth.js mostrar o formulário de redefinição.
            if (event === "PASSWORD_RECOVERY") {
                return; // Para o script aqui e não faz nada.
            }
            
            // Se for qualquer outro evento (SIGNED_IN, etc.), então redirecione.
            window.location.href = '/dashboard';
        }
    } else {
        // Se não há utilizador (sessão é nula), e estamos no dashboard...
        if (currentPage.includes('/dashboard')) {
            // ...manda para o login.
            window.location.href = '/login';
        }
    }
});

