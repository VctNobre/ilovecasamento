// public/js/auth.js
import { supabaseClient, showToast } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    // Executa o código apenas se estivermos na página de login/registo
    if (!document.getElementById('login-form')) return;

    // --- Seletores de Elementos ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleFormLink = document.getElementById('toggle-form');
    const forgotPasswordContainer = document.getElementById('forgot-password-container');
    
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    // Botões de Ação
    const btnLogin = document.getElementById('btn-login');
    const btnGoogleLogin = document.getElementById('btn-google-login');
    const btnRegister = document.getElementById('btn-register');

    // Elementos do Formulário de Registo
    const passwordInput = document.getElementById('register-password');
    const passwordRequirements = document.getElementById('password-requirements');
    const requirements = {
        length: document.getElementById('req-length'),
        uppercase: document.getElementById('req-uppercase'),
        lowercase: document.getElementById('req-lowercase'),
        number: document.getElementById('req-number'),
        special: document.getElementById('req-special'),
    };
    
    // Elementos de "Esqueceu a Senha"
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const resetPasswordModal = document.getElementById('reset-password-modal');
    const btnCancelReset = document.getElementById('btn-cancel-reset');
    const btnSendResetLink = document.getElementById('btn-send-reset-link');
    const resetEmailInput = document.getElementById('reset-email-input');

    // --- Funções ---
    const loginWithGoogle = () => {
        supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + '/dashboard.html' }
        });
    };

    const setRequirementStyle = (element, isValid) => {
        if (!element) return;
        element.style.color = isValid ? '#10B981' : '#6B7280';
        element.style.fontWeight = isValid ? '600' : 'normal';
    };

    const openResetModal = () => resetPasswordModal && resetPasswordModal.classList.replace('hidden', 'flex');
    const closeResetModal = () => resetPasswordModal && resetPasswordModal.classList.replace('flex', 'hidden');

    // --- Event Listeners ---

    // Feedback visual em tempo real para a senha
     if (passwordInput && passwordRequirements) {
        passwordInput.addEventListener('focus', () => {
            passwordRequirements.classList.remove('hidden');
        });

        // Atualiza os requisitos em tempo real enquanto o utilizador digita
        passwordInput.addEventListener('input', () => {
            const value = passwordInput.value;
            const checks = {
                length: value.length >= 8,
                uppercase: /[A-Z]/.test(value),
                lowercase: /[a-z]/.test(value),
                number: /[0-9]/.test(value),
                special: /[^A-Za-z0-9]/.test(value),
            };

            const setRequirementVisibility = (element, isValid) => {
                if (!element) return;
                if (isValid) {
                    element.classList.add('hidden'); // Esconde se for válido
                } else {
                    element.classList.remove('hidden'); // Mostra se for inválido
                    element.style.color = '#EF4444'; // Cor vermelha (red-500 do Tailwind)
                    element.style.fontWeight = '600';
                }
            };

            setRequirementVisibility(requirements.length, checks.length);
            setRequirementVisibility(requirements.uppercase, checks.uppercase);
            setRequirementVisibility(requirements.lowercase, checks.lowercase);
            setRequirementVisibility(requirements.number, checks.number);
            setRequirementVisibility(requirements.special, checks.special);

            // Esconde a lista inteira se todos os requisitos forem cumpridos
            const allValid = Object.values(checks).every(Boolean);
            if (allValid) {
                passwordRequirements.classList.add('hidden');
            }
        });
    }

    // Login com email e senha
    if (btnLogin) {
        btnLogin.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const loginError = document.getElementById('login-error');
            loginError.textContent = '';
            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) loginError.textContent = "Email ou senha inválidos.";
        });
    }
    
    // Registo com validação completa
    if (btnRegister) {
        btnRegister.addEventListener('click', async () => {
            registerError.textContent = '';
            const email = emailRegisterInput.value;
            const password = passwordInput.value;
            const passwordConfirm = passwordConfirmInput.value;
            const dob = dobInput.value;

            if (!dob) return registerError.textContent = 'Por favor, insira a sua data de nascimento.';
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
            if (age < 16) return registerError.textContent = 'Você deve ter pelo menos 16 anos para se registar.';
            if (password !== passwordConfirm) return registerError.textContent = 'As senhas não coincidem.';
            if (!(/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) && password.length >= 8)) {
                return registerError.textContent = 'A senha não cumpre todos os requisitos de segurança.';
            }

            const { error } = await supabaseClient.auth.signUp({ email, password });
            if (error) {
                registerError.textContent = "Erro ao registar: " + error.message;
            } else {
                showToast("Registo realizado! Verifique o seu e-mail para confirmar a conta.");
                setTimeout(() => window.location.reload(), 3000);
            }
        });
    }

    // Login com Google
    if (btnGoogleLogin) btnGoogleLogin.addEventListener('click', loginWithGoogle);

    // Alternar entre formulários
    if (toggleFormLink) {
        toggleFormLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.toggle('hidden');
            registerForm.classList.toggle('hidden');
            const isLoginFormVisible = !loginForm.classList.contains('hidden');
            toggleFormLink.textContent = isLoginFormVisible ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login';
            if (forgotPasswordContainer) forgotPasswordContainer.style.display = isLoginFormVisible ? 'block' : 'none';
        });
    }

    // "Esqueceu a senha?"
    if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); openResetModal(); });
    if (btnCancelReset) btnCancelReset.addEventListener('click', closeResetModal);
    if (resetPasswordModal) resetPasswordModal.addEventListener('click', (e) => { if (e.target === resetPasswordModal) closeResetModal(); });

    if (btnSendResetLink) {
        btnSendResetLink.addEventListener('click', async () => {
            const email = resetEmailInput.value;
            if (!email) return showToast('Por favor, insira o seu email.', 'error');

            const originalText = btnSendResetLink.textContent;
            btnSendResetLink.disabled = true;
            btnSendResetLink.textContent = 'Enviando...';

            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
            if (error) {
                showToast(`Erro: ${error.message}`, 'error');
                btnSendResetLink.disabled = false;
                btnSendResetLink.textContent = originalText;
            } else {
                showToast('Se existir uma conta com este email, um link foi enviado.');
                btnSendResetLink.textContent = 'Enviado!';
                btnSendResetLink.classList.remove('btn-primary');
                btnSendResetLink.classList.add('bg-green-500');
                setTimeout(() => {
                    closeResetModal();
                    setTimeout(() => {
                        btnSendResetLink.disabled = false;
                        btnSendResetLink.textContent = originalText;
                        btnSendResetLink.classList.remove('bg-green-500');
                        btnSendResetLink.classList.add('btn-primary');
                    }, 300);
                }, 2000);
            }
        });
    }

     if (action === 'register') {
        if (loginForm) loginForm.classList.add('hidden');
        if (registerForm) registerForm.classList.remove('hidden');
        if (toggleFormLink) toggleFormLink.textContent = 'Já tem uma conta? Faça login';
        if (forgotPasswordContainer) {
            forgotPasswordContainer.style.display = 'none';
        }
    }
});

