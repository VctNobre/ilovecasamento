// dashboard.js
import { supabaseClient } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('couple-dashboard')) return;

    // --- LÓGICA DO MENU RETRÁTIL (SIDEBAR) ---
    const menuButton = document.getElementById('menu-button');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    const toggleSidebar = () => {
        if (sidebar && overlay) {
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
        }
    };

    if (menuButton) menuButton.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', toggleSidebar);
    
    // --- LÓGICA DE NAVEGAÇÃO POR ABAS ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabPanels = document.querySelectorAll('.tab-panel');

    const switchTab = (tabName) => {
        tabLinks.forEach(link => {
            if (link.dataset.tab === tabName) {
                link.classList.add('bg-gray-100', 'font-semibold');
                link.style.color = 'var(--primary-color)';
            } else {
                link.classList.remove('bg-gray-100', 'font-semibold');
                link.style.color = '';
            }
        });
        tabPanels.forEach(panel => {
            if(panel) panel.id === `${tabName}-panel` ? panel.classList.remove('hidden') : panel.classList.add('hidden');
        });
        if (window.innerWidth < 768 && sidebar && !sidebar.classList.contains('-translate-x-full')) {
            toggleSidebar();
        }
        if (tabName === 'wallet') {
            walletPanel.updateStatus();
        }
        if (tabName === 'guests') {
            guestsPanel.loadRsvpData();
        }
    };

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.dataset.tab);
        });
    });

    // --- LÓGICA DE LOGOUT POR INATIVIDADE ---
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
    let inactivityTimer;
    const logoutDueToInactivity = () => { showToast('Você foi desconectado por inatividade.', 'error'); setTimeout(() => { supabaseClient.auth.signOut(); }, 2000); };
    const resetInactivityTimer = () => { clearTimeout(inactivityTimer); inactivityTimer = setTimeout(logoutDueToInactivity, INACTIVITY_TIMEOUT); };
    ['load', 'mousemove', 'mousedown', 'touchstart', 'keydown'].forEach(event => window.addEventListener(event, resetInactivityTimer));
    
    // --- SELETORES E VARIÁVEIS GLOBAIS ---
    const btnLogout = document.getElementById('btn-logout');
    const toastContainer = document.getElementById('toast-container');
    let eventData = null;
    let currentGalleryFiles = [];
    
    const viewSiteLink = document.getElementById('view-site-link');
    const pageSlugInput = document.getElementById('page-slug-input');
    const pageSlugPremiumInput = document.getElementById('page-slug-premium-input'); // Adicionado seletor
    const rsvpToggle = document.getElementById('rsvp-toggle');
    const storyToggle = document.getElementById('story-toggle');
    const galleryToggle = document.getElementById('gallery-toggle');
    const storyEditorWrapper = document.getElementById('story-editor-wrapper');
    const galleryEditorWrapper = document.getElementById('gallery-editor-wrapper');
    const btnSaveAll = document.getElementById('btn-save-all');
    const giftsEditorList = document.getElementById('gifts-editor-list');
    const btnAddGift = document.getElementById('btn-add-gift');
    const mainTitleInput = document.getElementById('main-title');
    const eventDateInput = document.getElementById('event-date');
    const introTextInput = document.getElementById('intro-text');
    const signatureInput = document.getElementById('signature');
    const heroImageUploadInput = document.getElementById('hero-image-upload');
    const heroImagePreview = document.getElementById('hero-image-preview');
    const primaryColorInput = document.getElementById('primary-color');
    const titleColorInput = document.getElementById('title-color');
    const mainTitleColorInput = document.getElementById('main-title-color');
    const accountEmailInput = document.getElementById('account-email');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const btnUpdatePassword = document.getElementById('btn-update-password');
    const btnUpdateEmail = document.getElementById('btn-update-email');
    const themeSelector = document.getElementById('theme-selector');
    const storyTitle1Input = document.getElementById('story-title-1');
    const storyContent1Input = document.getElementById('story-how-we-met');
    const storyTitle2Input = document.getElementById('story-title-2');
    const storyContent2Input = document.getElementById('story-proposal');
    const storyImage1Upload = document.getElementById('story-image-1-upload');
    const storyImage1Preview = document.getElementById('story-image-1-preview');
    const storyImage1Container = document.getElementById('story-image-1-container');
    const btnDeleteStory1 = document.getElementById('btn-delete-story-1');
    const storyImage2Upload = document.getElementById('story-image-2-upload');
    const storyImage2Preview = document.getElementById('story-image-2-preview');
    const storyImage2Container = document.getElementById('story-image-2-container');
    const btnDeleteStory2 = document.getElementById('btn-delete-story-2');
    const galleryPhotosUpload = document.getElementById('gallery-photos-upload');
    const galleryPreviewGrid = document.getElementById('gallery-preview-grid');

    // --- FUNÇÕES GLOBAIS ---
    const showToast = (message, type = 'success') => {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
        const icon = type === 'success' ? `<svg class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>` : `<svg class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
        toast.className = `flex items-center text-white p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
        toast.innerHTML = `${icon}<span>${message}</span>`;
        toast.classList.add(bgColor);
        toastContainer.appendChild(toast);
        setTimeout(() => { toast.classList.remove('translate-x-full', 'opacity-0'); }, 10);
        setTimeout(() => { toast.classList.add('translate-x-full', 'opacity-0'); toast.addEventListener('transitionend', () => toast.remove()); }, 4000);
    };

    // --- LÓGICA DO PAINEL "CONVIDADOS" (RSVP) ---
    const guestsPanel = {
        rsvpListContainer: document.getElementById('rsvp-list-container'),
        async loadRsvpData() {
            if (!this.rsvpListContainer || !eventData) {
                if (this.rsvpListContainer) this.rsvpListContainer.innerHTML = '<p>Salve o seu site primeiro para ver a lista de convidados.</p>';
                return;
            }
            this.rsvpListContainer.innerHTML = '<p>A carregar respostas...</p>';
            const { data: rsvps, error } = await supabaseClient.from('rsvps').select('*').eq('event_id', eventData.id);
            if (error) {
                this.rsvpListContainer.innerHTML = '<p class="text-red-500">Erro ao carregar as respostas.</p>';
                return;
            }
            if (rsvps.length === 0) {
                this.rsvpListContainer.innerHTML = '<p>Ainda ninguém respondeu à sua confirmação de presença.</p>';
                return;
            }
            rsvps.sort((a, b) => b.is_attending - a.is_attending);
            this.rsvpListContainer.innerHTML = rsvps.map(rsvp => `
                <div class="border p-4 rounded-lg ${rsvp.is_attending ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}">
                    <p class="font-bold text-gray-800">${rsvp.guest_name}</p>
                    <p class="text-sm">Status: ${rsvp.is_attending ? '<span class="font-semibold text-green-700">✅ Confirmado</span>' : '<span class="font-semibold text-red-700">❌ Não poderá ir</span>'}</p>
                    <p class="text-sm">Total de convidados: ${rsvp.plus_ones}</p>
                    ${rsvp.message ? `<p class="mt-2 text-sm italic text-gray-600">"${rsvp.message}"</p>` : ''}
                </div>
            `).join('');
        }
    };

    // --- LÓGICA DO PAINEL "MINHA CARTEIRA" ---
    const walletPanel = {
        container: document.getElementById('payment-status-container'),
        updateStatus() {
            if (!this.container) return;
            this.container.innerHTML = `<p class="text-gray-500">A verificar estado da conexão...</p>`;
            if (eventData && eventData.mp_credentials?.access_token) {
                this.renderConnected();
            } else {
                this.renderNotConnected();
            }
        },
        renderConnected() {
            this.container.innerHTML = `
                <div class="space-y-6 text-center">
                    <div class="flex justify-center items-center text-green-600">
                        <svg class="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p class="text-lg font-semibold">Sua conta está conectada e pronta para receber presentes!</p>
                    </div>
                    <div>
                        <a href="https://www.mercadopago.com.br/summary" target="_blank" rel="noopener noreferrer" class="btn-primary inline-block">
                            Gerir Ganhos no Mercado Pago
                        </a>
                        <p class="text-xs text-gray-500 mt-2">Você será redirecionado para o painel seguro do Mercado Pago para ver o seu saldo e gerir os seus saques.</p>
                    </div>
                </div>`;
        },
        renderNotConnected() {
            if (!this.container) return;
            this.container.innerHTML = `
                <p class="mb-4 text-center">Para receber os valores dos presentes, você precisa de conectar a sua conta do Mercado Pago à nossa plataforma. É um processo rápido e seguro.</p>
                <div class="flex justify-center">
                    <button id="btn-connect-mp" class="btn-primary">Conectar com Mercado Pago</button>
                </div>`;
            const btnConnect = document.getElementById('btn-connect-mp');
            if (btnConnect) {
                btnConnect.addEventListener('click', () => this.handleConnectMercadoPago());
            }
        },
        async handleConnectMercadoPago() {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (!user) return showToast('Por favor, faça login novamente.', 'error');
            try {
                const response = await fetch('/create-mp-connect-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id })
                });
                if (!response.ok) throw new Error("Falha na resposta do servidor.");
                const { authUrl } = await response.json();
                if (authUrl) {
                    window.location.href = authUrl;
                } else {
                    showToast('Não foi possível obter o link de conexão.', 'error');
                }
            } catch (error) {
                console.error("Erro ao conectar com MP:", error);
                showToast('Não foi possível iniciar a conexão. Tente novamente.', 'error');
            }
        },
    };
    
    // --- LÓGICA DOS BOTÕES DE ATIVAÇÃO (TOGGLES) ---
    const setupSectionToggle = (toggleElement, wrapperElement) => {
        if (!toggleElement) return null;
        const setToggleState = (isEnabled) => {
            if (typeof isEnabled !== 'boolean') return;
            const slider = toggleElement.querySelector('.toggle-knob');
            toggleElement.setAttribute('aria-checked', String(isEnabled));
            if (wrapperElement) wrapperElement.classList.toggle('hidden', !isEnabled);
            if (isEnabled) {
                toggleElement.classList.remove('bg-gray-200');
                toggleElement.classList.add('bg-green-500');
                if (slider) slider.classList.add('translate-x-6');
            } else {
                toggleElement.classList.remove('bg-green-500');
                toggleElement.classList.add('bg-gray-200');
                if (slider) slider.classList.remove('translate-x-6');
            }
        };
        toggleElement.addEventListener('click', () => {
            const isCurrentlyEnabled = toggleElement.getAttribute('aria-checked') === 'true';
            setToggleState(!isCurrentlyEnabled);
        });
        return setToggleState;
    };

    const setRsvpState = setupSectionToggle(rsvpToggle, null);
    const setStoryState = setupSectionToggle(storyToggle, storyEditorWrapper);
    const setGalleryState = setupSectionToggle(galleryToggle, galleryEditorWrapper);

    // --- FUNÇÕES DE UPLOAD E DADOS ---
    const sanitizeFilename = (filename) => filename.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9.\-_]/g, '-').replace(/-+/g, '-');
    const sanitizeSlug = (slug) => slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
    const uploadFile = async (file, path) => {
        const { data, error } = await supabaseClient.storage.from('wedding_photos').upload(path, file, { cacheControl: '3600', upsert: true });
        if (error) {
            console.error('Erro no upload:', error);
            showToast(`Erro ao enviar o ficheiro: ${error.message}`, 'error');
            return null;
        }
        const { data: { publicUrl } } = supabaseClient.storage.from('wedding_photos').getPublicUrl(data.path);
        return publicUrl;
    };

    const loadEventData = async (userId) => {
        const { data, error } = await supabaseClient.from('events').select('*, gifts(*)').eq('user_id', userId).single();
        if (error && error.code !== 'PGRST116') {
            console.error('Erro ao carregar dados do evento:', error);
            showToast("Erro ao carregar dados.", 'error');
            return;
        }
        if (data) {
            eventData = data;
            const pageUrl = data.slug ? `/${data.slug}` : `/evento/${data.id}`;
            if (viewSiteLink) { viewSiteLink.href = pageUrl; viewSiteLink.classList.remove('hidden'); }
            
            if(pageSlugInput) pageSlugInput.value = data.slug || '';
            if(pageSlugPremiumInput) pageSlugPremiumInput.value = data.slug_premium || ''; // Adicionado

            if (mainTitleInput) mainTitleInput.value = data.main_title || '';
            if (eventDateInput) eventDateInput.value = data.event_date || '';
            if (introTextInput) introTextInput.value = data.intro_text || '';
            if (signatureInput) signatureInput.value = data.signature || '';
            if (storyTitle1Input) storyTitle1Input.value = data.story_title_1 || '';
            if (storyContent1Input) storyContent1Input.value = data.story_how_we_met || '';
            if (storyTitle2Input) storyTitle2Input.value = data.story_title_2 || '';
            if (storyContent2Input) storyContent2Input.value = data.story_proposal || '';
            if (primaryColorInput) primaryColorInput.value = data.primary_color || '#D9A8A4';
            if (titleColorInput) titleColorInput.value = data.title_color || '#333333';
            if (mainTitleColorInput) mainTitleColorInput.value = data.main_title_color || '#FFFFFF';
            if (heroImagePreview && data.hero_image_url) { heroImagePreview.src = data.hero_image_url; heroImagePreview.classList.remove('hidden'); }
            if (giftsEditorList) { giftsEditorList.innerHTML = ''; if (data.gifts) data.gifts.sort((a, b) => a.id - b.id).forEach(renderGiftEditor); }
            
            if (data.story_image_1_url) {
                storyImage1Preview.src = data.story_image_1_url;
                storyImage1Container.classList.remove('hidden');
                storyImage1Upload.classList.add('hidden');
            } else {
                storyImage1Container.classList.add('hidden');
                storyImage1Upload.classList.remove('hidden');
                storyImage1Upload.value = '';
                storyImage1Preview.src = '';
            }

            if (data.story_image_2_url) {
                 storyImage2Preview.src = data.story_image_2_url;
                storyImage2Container.classList.remove('hidden');
                storyImage2Upload.classList.add('hidden');
            } else {
                storyImage2Container.classList.add('hidden');
                storyImage2Upload.classList.remove('hidden');
                storyImage2Upload.value = '';
                storyImage2Preview.src = '';
            }
            
            currentGalleryFiles = (data.gallery_photos && Array.isArray(data.gallery_photos)) ? [...data.gallery_photos] : [];
            renderGalleryPreviews();
            galleryPhotosUpload.value = '';

            if (setRsvpState) setRsvpState(data.rsvp_enabled);
            if (setStoryState) setStoryState(data.story_section_enabled);
            if (setGalleryState) setGalleryState(data.gallery_section_enabled);

            if (themeSelector && data.layout_theme) {
                const selectedRadio = themeSelector.querySelector(`input[value="${data.layout_theme}"]`);
                if (selectedRadio) {
                    selectedRadio.checked = true;
                    document.querySelectorAll('.theme-option').forEach(label => {
                        const radio = label.querySelector('input');
                        const indicator = label.querySelector('.selected-indicator');
                        if (indicator) {
                            indicator.style.opacity = radio.checked ? '1' : '0';
                        }
                    });
                }
            }
        }
    };
    
    const renderGiftEditor = (gift) => {
        const giftId = gift.id || `temp_${Date.now()}`;
        const editorDiv = document.createElement('div');
        editorDiv.className = 'p-6 border rounded-lg bg-gray-50';
        editorDiv.setAttribute('data-gift-id', giftId);
        editorDiv.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div class="lg:col-span-2">
                    <label class="block text-sm font-medium text-gray-600 mb-1">Título</label>
                    <input type="text" value="${gift.title || ''}" placeholder="Título do Presente" class="title-input w-full p-2 border rounded-md">
                    <label class="block text-sm font-medium text-gray-600 mt-2 mb-1">Descrição</label>
                    <textarea rows="3" placeholder="Descrição do presente" class="description-input w-full p-2 border rounded-md">${gift.description || ''}</textarea>
                </div>
                <div class="lg:col-span-1 space-y-2">
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1">Preço Padrão (R$)</label>
                        <input type="number" value="${gift.value_default || ''}" placeholder="100.00" class="value-default-input w-full p-2 border rounded-md">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1">Preço Premium (R$)</label>
                        <input type="number" value="${gift.value_premium || ''}" placeholder="150.00" class="value-premium-input w-full p-2 border rounded-md">
                    </div>
                </div>
                <div class="lg:col-span-2">
                    <label class="block text-sm font-medium text-gray-600 mb-1">Imagem do Presente</label>
                    <input type="file" class="image-input w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[color:var(--primary-color)] file:text-white hover:file:opacity-90" accept="image/*"><img src="${gift.image_url || 'https://placehold.co/400x200?text=Sem+Imagem'}" class="image-preview mt-2 rounded-md max-h-24">
                </div>
            </div>
            <button class="btn-remove-gift mt-4 text-red-500 text-sm hover:underline">Remover Presente</button>`;
        
        if (giftsEditorList) giftsEditorList.appendChild(editorDiv);
        editorDiv.querySelector('.btn-remove-gift').addEventListener('click', () => editorDiv.remove());
        editorDiv.querySelector('.image-input').addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) editorDiv.querySelector('.image-preview').src = URL.createObjectURL(file);
        });
    };
    
    const renderGalleryPreviews = () => {
        galleryPreviewGrid.innerHTML = '';
        currentGalleryFiles.forEach((fileOrUrl, index) => {
            const previewWrapper = document.createElement('div');
            previewWrapper.className = 'relative';
            const src = (typeof fileOrUrl === 'string') ? fileOrUrl : URL.createObjectURL(fileOrUrl);
            previewWrapper.innerHTML = `
                <img src="${src}" class="w-full h-24 object-cover rounded-md">
                <button type="button" data-index="${index}" class="btn-delete-gallery-item absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 leading-none hover:bg-red-700">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            `;
            galleryPreviewGrid.appendChild(previewWrapper);
        });
    };

    // --- EVENT LISTENERS ---
    if (btnLogout) btnLogout.addEventListener('click', async () => { clearTimeout(inactivityTimer); await supabaseClient.auth.signOut(); });
    if (btnAddGift) btnAddGift.addEventListener('click', () => renderGiftEditor({}));
    if (heroImageUploadInput) {
        heroImageUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file && heroImagePreview) { heroImagePreview.src = URL.createObjectURL(file); heroImagePreview.classList.remove('hidden'); }
        });
    }

    const setupImagePreviewAndDelete = (uploadInput, previewContainer, previewImg, deleteBtn) => {
        if (!uploadInput || !previewContainer || !previewImg || !deleteBtn) return;
        uploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                previewImg.src = URL.createObjectURL(file);
                previewContainer.classList.remove('hidden');
                uploadInput.classList.add('hidden');
            }
        });
        deleteBtn.addEventListener('click', () => {
            uploadInput.value = ''; // Limpa o input
            previewImg.src = '';
            previewContainer.classList.add('hidden');
            uploadInput.classList.remove('hidden');
        });
    };

    setupImagePreviewAndDelete(storyImage1Upload, storyImage1Container, storyImage1Preview, btnDeleteStory1);
    setupImagePreviewAndDelete(storyImage2Upload, storyImage2Container, storyImage2Preview, btnDeleteStory2);

    if (galleryPhotosUpload) {
        galleryPhotosUpload.addEventListener('change', (event) => {
            const newFiles = Array.from(event.target.files);
            currentGalleryFiles.push(...newFiles);
            renderGalleryPreviews();
            event.target.value = ''; // Limpa o input
        });
    }

    if (galleryPreviewGrid) {
        galleryPreviewGrid.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete-gallery-item');
            if (deleteBtn) {
                const indexToRemove = parseInt(deleteBtn.dataset.index, 10);
                currentGalleryFiles.splice(indexToRemove, 1);
                renderGalleryPreviews();
            }
        });
    }

     if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            if (e.target.name === 'layout-theme') {
                document.querySelectorAll('.theme-option .selected-indicator').forEach(indicator => {
                    indicator.style.opacity = '0';
                });
                const indicator = e.target.closest('.theme-option').querySelector('.selected-indicator');
                if (indicator) {
                    indicator.style.opacity = '1';
                }
            }
        });
    }

    if (btnSaveAll) {
        btnSaveAll.addEventListener('click', async () => {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (!user) return showToast("Sessão expirada.", 'error');
            btnSaveAll.textContent = 'Salvando...';
            btnSaveAll.disabled = true;
            
            try {
                const newSlug = sanitizeSlug(pageSlugInput.value);
                const newSlugPremium = sanitizeSlug(pageSlugPremiumInput.value); // Adicionado

                if (!newSlug) {
                    throw new Error("O link personalizado (padrão) não pode estar vazio.");
                }

                if (newSlug !== (eventData?.slug || '')) {
                    const { data: existingPage } = await supabaseClient
                        .from('events')
                        .select('slug')
                        .eq('slug', newSlug)
                        .single();

                    if (existingPage) {
                        throw new Error("Este link (padrão) já está em uso. Por favor, escolha outro.");
                    }
                }
                
                // Adicionada validação para o slug premium
                if (newSlugPremium && newSlugPremium !== (eventData?.slug_premium || '')) {
                    if (newSlugPremium === newSlug) {
                        throw new Error("O link premium não pode ser igual ao link padrão.");
                    }
                    const { data: existingPage } = await supabaseClient
                        .from('events')
                        .select('slug_premium')
                        .eq('slug_premium', newSlugPremium)
                        .single();

                    if (existingPage) {
                        throw new Error("Este link premium já está em uso. Por favor, escolha outro.");
                    }
                }

                let heroImageUrl = eventData?.hero_image_url || null;
                if (heroImageUploadInput && heroImageUploadInput.files[0]) {
                    const file = heroImageUploadInput.files[0];
                    const filePath = `${user.id}/hero-${Date.now()}-${sanitizeFilename(file.name)}`;
                    heroImageUrl = await uploadFile(file, filePath);
                }

                let storyImg1Url;
                if (storyImage1Upload && storyImage1Upload.files[0]) {
                    const file = storyImage1Upload.files[0];
                    const filePath = `${user.id}/story-1-${Date.now()}-${sanitizeFilename(file.name)}`;
                    storyImg1Url = await uploadFile(file, filePath);
                } else if (storyImage1Container && storyImage1Container.classList.contains('hidden')) {
                    storyImg1Url = null;
                } else {
                    storyImg1Url = eventData?.story_image_1_url || null;
                }

                let storyImg2Url;
                if (storyImage2Upload && storyImage2Upload.files[0]) {
                    const file = storyImage2Upload.files[0];
                    const filePath = `${user.id}/story-2-${Date.now()}-${sanitizeFilename(file.name)}`;
                    storyImg2Url = await uploadFile(file, filePath);
                } else if (storyImage2Container && storyImage2Container.classList.contains('hidden')) {
                    storyImg2Url = null;
                } else {
                    storyImg2Url = eventData?.story_image_2_url || null;
                }

                const galleryUrlsToSave = [];
                for (const fileOrUrl of currentGalleryFiles) {
                    if (typeof fileOrUrl === 'string') {
                        galleryUrlsToSave.push(fileOrUrl);
                    } else {
                        const filePath = `${user.id}/gallery-${Date.now()}-${sanitizeFilename(fileOrUrl.name)}`;
                        const url = await uploadFile(fileOrUrl, filePath);
                        if (url) galleryUrlsToSave.push(url);
                    }
                }
                
                const selectedTheme = themeSelector ? themeSelector.querySelector('input[name="layout-theme"]:checked')?.value : 'padrao';
                const pageDataToSave = {
                    user_id: user.id,
                    slug: newSlug,
                    slug_premium: newSlugPremium || null, // Adicionado
                    main_title: mainTitleInput ? mainTitleInput.value : null,
                    event_date: eventDateInput ? eventDateInput.value : null,
                    intro_text: introTextInput ? introTextInput.value : null,
                    signature: signatureInput ? signatureInput.value : null,
                    primary_color: primaryColorInput ? primaryColorInput.value : '#D9A8A4',
                    title_color: titleColorInput ? titleColorInput.value : '#333333',
                    main_title_color: mainTitleColorInput ? mainTitleColorInput.value : '#FFFFFF',
                    hero_image_url: heroImageUrl,
                    rsvp_enabled: rsvpToggle ? rsvpToggle.getAttribute('aria-checked') === 'true' : false,
                    layout_theme: selectedTheme,
                    story_section_enabled: storyToggle ? storyToggle.getAttribute('aria-checked') === 'true' : false,
                    gallery_section_enabled: galleryToggle ? galleryToggle.getAttribute('aria-checked') === 'true' : false,
                    story_title_1: storyTitle1Input ? storyTitle1Input.value : null,
                    story_how_we_met: storyContent1Input ? storyContent1Input.value : null,
                    story_title_2: storyTitle2Input ? storyTitle2Input.value : null,
                    story_proposal: storyContent2Input ? storyContent2Input.value : null,
                    story_image_1_url: storyImg1Url,
                    story_image_2_url: storyImg2Url,
                    gallery_photos: galleryUrlsToSave.length > 0 ? galleryUrlsToSave : null
                };
                const { data: pageResult, error: pageError } = await supabaseClient.from('events').upsert(pageDataToSave, { onConflict: 'user_id' }).select().single();
                if (pageError) throw pageError;

                const pageId = pageResult.id;
                const giftEditors = giftsEditorList.querySelectorAll('[data-gift-id]');
                const giftsToSave = [];
                for (const editor of giftEditors) {
                    const imageInput = editor.querySelector('.image-input');
                    let imageUrl = editor.querySelector('.image-preview').src;
                    if (imageInput && imageInput.files[0]) {
                        const file = imageInput.files[0];
                        const filePath = `${user.id}/gift-${Date.now()}-${sanitizeFilename(file.name)}`;
                        const uploadedUrl = await uploadFile(file, filePath);
                        if (uploadedUrl) imageUrl = uploadedUrl;
                    }
                    giftsToSave.push({ 
                        event_id: pageId, 
                        title: editor.querySelector('.title-input')?.value || '', 
                        description: editor.querySelector('.description-input')?.value || '', 
                        value_default: parseFloat(editor.querySelector('.value-default-input')?.value) || 0, 
                        value_premium: parseFloat(editor.querySelector('.value-premium-input')?.value) || 0, 
                        image_url: imageUrl.startsWith('https://placehold.co') ? null : imageUrl 
                    });
                }
                
                await supabaseClient.from('gifts').delete().eq('event_id', pageId);
                if (giftsToSave.length > 0) {
                    const { error: giftsError } = await supabaseClient.from('gifts').insert(giftsToSave);
                    if (giftsError) throw giftsError;
                }

                showToast("Site atualizado com sucesso!");
                await loadEventData(user.id);
            } catch (error) {
                console.error("ERRO DETALHADO AO SALVAR:", error);
                showToast("Ocorreu um erro ao salvar: " + error.message, 'error');
            } finally {
                btnSaveAll.textContent = 'Salvar Todas as Alterações';
                btnSaveAll.disabled = false;
            }
        });
    }

    if (btnUpdateEmail) {
        btnUpdateEmail.addEventListener('click', async () => {
            if (!accountEmailInput) return;
            const newEmail = accountEmailInput.value;
            if (!newEmail || !newEmail.includes('@')) return showToast("Por favor, insira um email válido.", 'error');
            const { error } = await supabaseClient.auth.updateUser({ email: newEmail });
            if (error) {
                showToast(`Erro ao atualizar o email: ${error.message}`, 'error');
            } else {
                showToast("Verifique o seu email antigo e o novo para confirmar a alteração.", 'success');
            }
        });
    }
    if(btnUpdatePassword) {
        btnUpdatePassword.addEventListener('click', async () => {
            if(!newPasswordInput || !confirmPasswordInput) return;
            const newPassword = newPasswordInput.value;
            if (newPassword !== confirmPasswordInput.value) return showToast("As senhas não coincidem.", 'error');
            if (newPassword.length < 8) return showToast("A senha deve ter no mínimo 8 caracteres.", 'error');
            const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
            if (error) {
                showToast(`Erro: ${error.message}`, 'error');
            } else {
                showToast("Senha atualizada com sucesso!");
                newPasswordInput.value = '';
                confirmPasswordInput.value = '';
            }
        });
    }

    // --- INICIALIZAÇÃO ---
    (async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            if (accountEmailInput) accountEmailInput.value = user.email;
            await loadEventData(user.id);
            switchTab('layouts');
        } else {
            window.location.href = '/login';
        }
    })();
});
