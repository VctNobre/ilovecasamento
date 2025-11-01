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
    const ouDivider = document.getElementById('ou-divider'); // ID do divisor "OU"
    
    // Formulário de Redefinição de Senha (Novo)
    const passwordResetForm = document.getElementById('password-reset-form');
    const btnUpdatePasswordSubmit = document.getElementById('btn-update-password-submit');
    
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

    // Elementos de "Esqueceu a Senha" (Modal)
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
    
    // --- NOVO: Lógica de Redefinição de Senha (Ouve o evento do Supabase) ---
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
            // O utilizador clicou no link do email e está na sessão de recuperação
            
            // 1. Esconder tudo o que não é relevante
            if (loginForm) loginForm.classList.add('hidden');
            if (registerForm) registerForm.classList.add('hidden');
            if (toggleFormLink) toggleFormLink.classList.add('hidden');
            if (ouDivider) ouDivider.classList.add('hidden');
            if (btnGoogleLogin) btnGoogleLogin.classList.add('hidden');
            if (forgotPasswordContainer) forgotPasswordContainer.classList.add('hidden');

            // 2. Mostrar o formulário de redefinição
            if (passwordResetForm) passwordResetForm.classList.remove('hidden');
        }
    });

    // --- NOVO: Listener para o botão do formulário de redefinição de senha ---
    if (btnUpdatePasswordSubmit) {
        btnUpdatePasswordSubmit.addEventListener('click', async () => {
            const newPassword = document.getElementById('reset-new-password').value;
            const confirmPassword = document.getElementById('reset-confirm-password').value;
            const errorEl = document.getElementById('password-reset-error');
            
            if (errorEl) errorEl.textContent = '';

            // Validações
            if (!newPassword || !confirmPassword) {
                if (errorEl) errorEl.textContent = 'Por favor, preencha ambos os campos.';
                return;
            }
            if (newPassword.length < 8) {
                // Sincroniza com os requisitos de registro
                if (errorEl) errorEl.textContent = 'A senha deve ter no mínimo 8 caracteres.';
                return;
            }
            if (newPassword !== confirmPassword) {
                if (errorEl) errorEl.textContent = 'As senhas não coincidem.';
                return;
            }

            // Desativa o botão
            btnUpdatePasswordSubmit.disabled = true;
            btnUpdatePasswordSubmit.textContent = 'Salvando...';

            // Envia a atualização para o Supabase
            // (Funciona porque o utilizador está na sessão de 'PASSWORD_RECOVERY')
            const { error } = await supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (error) {
                if (errorEl) errorEl.textContent = `Erro: ${error.message}`;
                btnUpdatePasswordSubmit.disabled = false;
                btnUpdatePasswordSubmit.textContent = 'Salvar Nova Senha';
            } else {
                // Sucesso!
                showToast('Senha atualizada com sucesso! Pode fazer login.');
                
                // Recarrega a página para o estado de login normal
                setTimeout(() => {
                    window.location.hash = ''; // Limpa o token da URL
                    window.location.reload();
                }, 2000);
            }
        });
    }

    // --- Lógica de Registo (Existente) ---
    if (registerForm) {
        const btnRegister = document.getElementById('btn-register');
        const emailRegisterInput = document.getElementById('register-email');
        const dobInput = document.getElementById('register-dob');
        const passwordInput = document.getElementById('register-password');
        const passwordConfirmInput = document.getElementById('register-password-confirm');
        const registerError = document.getElementById('register-error');
        const passwordRequirements = document.getElementById('password-requirements');
        const requirements = {
            length: document.getElementById('req-length'),
            uppercase: document.getElementById('req-uppercase'),
            lowercase: document.getElementById('req-lowercase'),
            number: document.getElementById('req-number'),
            special: document.getElementById('req-special'),
        };

        // Validação dinâmica da senha
        if (passwordInput && passwordRequirements) {
            passwordInput.addEventListener('focus', () => {
                passwordRequirements.classList.remove('hidden');
            });

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
                        element.classList.add('hidden');
                    } else {
                        element.classList.remove('hidden');
                        element.style.color = '#EF4444';
                        element.style.fontWeight = '600';
                    }
                };

                setRequirementVisibility(requirements.length, checks.length);
                setRequirementVisibility(requirements.uppercase, checks.uppercase);
                setRequirementVisibility(requirements.lowercase, checks.lowercase);
                setRequirementVisibility(requirements.number, checks.number);
                setRequirementVisibility(requirements.special, checks.special);

                const allValid = Object.values(checks).every(Boolean);
                if (allValid) {
                    passwordRequirements.classList.add('hidden');
                }
            });
        }
        
        // Submissão do formulário de registo com validação completa
        if (btnRegister) {
            btnRegister.addEventListener('click', async () => {
                if(registerError) registerError.textContent = '';
                
                const email = emailRegisterInput.value;
                const password = passwordInput.value;
                const passwordConfirm = passwordConfirmInput.value;
                const dob = dobInput.value;

                // --- VALIDAÇÕES AO SUBMETER ---
                if (!email || !email.includes('@')) {
                    return registerError.textContent = 'Por favor, insira um email válido.';
                }
                if (!dob) {
                    return registerError.textContent = 'Por favor, insira a sua data de nascimento.';
                }
                const birthDate = new Date(dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                if (age < 18) {
                    return registerError.textContent = 'Você deve ter pelo menos 18 anos para se registar.';
                }
                if (password !== passwordConfirm) {
                    return registerError.textContent = 'As senhas não coincidem.';
                }
                const allValid = Object.values({
                    length: password.length >= 8,
                    uppercase: /[A-Z]/.test(password),
                    lowercase: /[a-z]/.test(password),
                    number: /[0-9]/.test(password),
                    special: /[^A-Za-z0-9]/.test(password),
                }).every(Boolean);
                if (!allValid) {
                    return registerError.textContent = 'A senha não cumpre todos os requisitos de segurança.';
                }

                // CORREÇÃO: Desativa o botão para prevenir múltiplos cliques
                btnRegister.disabled = true;
                btnRegister.textContent = 'Cadastrando...';

                // Se todas as validações passarem, submete para o Supabase
                const { error } = await supabaseClient.auth.signUp({ email, password });
                if (error) {
                    registerError.textContent = "Erro ao registar: " + error.message;
                    // Reativa o botão em caso de erro
                    btnRegister.disabled = false;
                    btnRegister.textContent = 'Cadastrar';
                } else {
                    showToast("Registo realizado! Verifique o seu e-mail para confirmar a conta.");
                    setTimeout(() => window.location.reload(), 3000);
                    // O botão permanece desativado, pois a página irá recarregar
                }
            });
        }
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

    // "Esqueceu a senha?" (Modal)
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

            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + window.location.pathname }); // Corrigido para incluir o pathname
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
