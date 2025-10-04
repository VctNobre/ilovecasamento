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
    let weddingPageData = null;
    let galleryFiles = [];
    
    // Seletores dos Painéis
    const viewSiteLink = document.getElementById('view-site-link');
    const rsvpToggle = document.getElementById('rsvp-toggle');
    const storyToggle = document.getElementById('story-toggle');
    const galleryToggle = document.getElementById('gallery-toggle');
    const storyEditorWrapper = document.getElementById('story-editor-wrapper');
    const galleryEditorWrapper = document.getElementById('gallery-editor-wrapper');
    const btnSaveAll = document.getElementById('btn-save-all');
    const giftsEditorList = document.getElementById('gifts-editor-list');
    const btnAddGift = document.getElementById('btn-add-gift');
    const shareSection = document.getElementById('share-section');
    const shareUrlInput = document.getElementById('share-url-input');
    const btnCopyLink = document.getElementById('btn-copy-link');
    const mainTitleInput = document.getElementById('main-title');
    const weddingDateInput = document.getElementById('wedding-date');
    const introTextInput = document.getElementById('intro-text');
    const coupleSignatureInput = document.getElementById('couple-signature');
    const heroImageUploadInput = document.getElementById('hero-image-upload');
    const heroImagePreview = document.getElementById('hero-image-preview');
    const primaryColorInput = document.getElementById('primary-color');
    const titleColorInput = document.getElementById('title-color');
    const heroTitleColorInput = document.getElementById('hero-title-color');
    const accountEmailInput = document.getElementById('account-email');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const btnUpdatePassword = document.getElementById('btn-update-password');
    const btnUpdateEmail = document.getElementById('btn-update-email');
    const themeSelector = document.getElementById('theme-selector');
    
    // Seletores de "Nossa História" e "Galeria"
    const storyHowWeMetInput = document.getElementById('story-how-we-met');
    const storyProposalInput = document.getElementById('story-proposal');
    const storyImage1Upload = document.getElementById('story-image-1-upload');
    const storyImage1Preview = document.getElementById('story-image-1-preview');
    const storyImage1Container = document.getElementById('story-image-1-container');
    const storyImage2Upload = document.getElementById('story-image-2-upload');
    const storyImage2Preview = document.getElementById('story-image-2-preview');
    const storyImage2Container = document.getElementById('story-image-2-container');
    const galleryPhotosUpload = document.getElementById('gallery-photos-upload');
    const galleryPreviewGrid = document.getElementById('gallery-preview-grid');
    const btnDeleteStory1 = document.getElementById('btn-delete-story-1');
    const btnDeleteStory2 = document.getElementById('btn-delete-story-2');


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
            if (!this.rsvpListContainer || !weddingPageData) {
                if (this.rsvpListContainer) this.rsvpListContainer.innerHTML = '<p>Salve o seu site primeiro para ver a lista de convidados.</p>';
                return;
            }
            this.rsvpListContainer.innerHTML = '<p>A carregar respostas...</p>';
            const { data: rsvps, error } = await supabaseClient.from('rsvps').select('*').eq('wedding_page_id', weddingPageData.id);
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
            if (weddingPageData && weddingPageData.mp_credentials?.access_token) {
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
            if (wrapperElement) {
                wrapperElement.classList.toggle('hidden', !isEnabled);
            }
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
    const sanitizeFilename = (filename) => {
        const withoutAccents = filename.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return withoutAccents.replace(/[^a-zA-Z0-9.\-_]/g, '-').replace(/-+/g, '-');
    };

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

    const loadWeddingPageData = async (userId) => {
        const { data, error } = await supabaseClient.from('wedding_pages').select('*, gifts(*)').eq('user_id', userId).single();
        if (error && error.code !== 'PGRST116') return showToast("Erro ao carregar dados.", 'error');
        if (data) {
            weddingPageData = data;
            const pageUrl = `/casamento/${data.id}`;
            const absoluteUrl = new URL(pageUrl, window.location.origin).href;
            if (viewSiteLink) { viewSiteLink.href = pageUrl; viewSiteLink.classList.remove('hidden'); }
            if (shareUrlInput) shareUrlInput.value = absoluteUrl;
            if (shareSection) shareSection.classList.remove('hidden');
            if (mainTitleInput) mainTitleInput.value = data.main_title || '';
            if (weddingDateInput) weddingDateInput.value = data.wedding_date || '';
            if (introTextInput) introTextInput.value = data.intro_text || '';
            if (coupleSignatureInput) coupleSignatureInput.value = data.couple_signature || '';
            if (primaryColorInput) primaryColorInput.value = data.primary_color || '#D9A8A4';
            if (titleColorInput) titleColorInput.value = data.title_color || '#333333';
            if (heroTitleColorInput) heroTitleColorInput.value = data.hero_title_color || '#FFFFFF';
            if (heroImagePreview && data.hero_image_url) { heroImagePreview.src = data.hero_image_url; heroImagePreview.classList.remove('hidden'); }
            if (giftsEditorList) { giftsEditorList.innerHTML = ''; if (data.gifts) data.gifts.sort((a, b) => a.id - b.id).forEach(renderGiftEditor); }
            
            if (storyHowWeMetInput) storyHowWeMetInput.value = data.story_how_we_met || '';
            if (storyProposalInput) storyProposalInput.value = data.story_proposal || '';
            
            if (storyImage1Preview && data.story_image_1_url) {
                storyImage1Preview.src = data.story_image_1_url;
                storyImage1Container.classList.remove('hidden');
                storyImage1Upload.classList.add('hidden');
            }
             if (storyImage2Preview && data.story_image_2_url) {
                storyImage2Preview.src = data.story_image_2_url;
                storyImage2Container.classList.remove('hidden');
                storyImage2Upload.classList.add('hidden');
            }

            if (galleryPreviewGrid && data.gallery_photos) {
                galleryFiles = data.gallery_photos.map(url => ({ isUrl: true, content: url }));
                renderGalleryPreviews();
            }


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
        } else {
            if (shareSection) shareSection.classList.add('hidden');
            if (viewSiteLink) viewSiteLink.classList.add('hidden');
        }
    };
    
    const renderGiftEditor = (gift) => {
        const giftId = gift.id || `temp_${Date.now()}`;
        const editorDiv = document.createElement('div');
        editorDiv.className = 'p-6 border rounded-lg bg-gray-50';
        editorDiv.setAttribute('data-gift-id', giftId);
        editorDiv.innerHTML = `<div class="grid grid-cols-1 lg:grid-cols-5 gap-4"><div class="lg:col-span-2"><label class="block text-sm font-medium text-gray-600 mb-1">Título</label><input type="text" value="${gift.title || ''}" placeholder="Título do Presente" class="title-input w-full p-2 border rounded-md"><label class="block text-sm font-medium text-gray-600 mt-2 mb-1">Descrição</label><textarea rows="3" placeholder="Descrição do presente" class="description-input w-full p-2 border rounded-md">${gift.description || ''}</textarea></div><div class="lg:col-span-1"><label class="block text-sm font-medium text-gray-600 mb-1">Valor (R$)</label><input type="number" value="${gift.value || ''}" placeholder="250.50" class="value-input w-full p-2 border rounded-md"></div><div class="lg:col-span-2"><label class="block text-sm font-medium text-gray-600 mb-1">Imagem do Presente</label><input type="file" class="image-input w-full p-1.5 border rounded-md file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-200" accept="image/*"><img src="${gift.image_url || 'https://placehold.co/400x200?text=Sem+Imagem'}" class="image-preview mt-2 rounded-md max-h-24"></div></div><button class="btn-remove-gift mt-4 text-red-500 text-sm hover:underline">Remover Presente</button>`;
        if (giftsEditorList) giftsEditorList.appendChild(editorDiv);
        editorDiv.querySelector('.btn-remove-gift').addEventListener('click', () => editorDiv.remove());
        editorDiv.querySelector('.image-input').addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) editorDiv.querySelector('.image-preview').src = URL.createObjectURL(file);
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

    const setupStoryImageUpload = (uploadEl, previewEl, containerEl, deleteBtn) => {
        uploadEl.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                previewEl.src = URL.createObjectURL(file);
                containerEl.classList.remove('hidden');
                uploadEl.classList.add('hidden');
            }
        });
        deleteBtn.addEventListener('click', () => {
            uploadEl.value = '';
            previewEl.src = '';
            containerEl.classList.add('hidden');
            uploadEl.classList.remove('hidden');
        });
    };

    if (storyImage1Upload) setupStoryImageUpload(storyImage1Upload, storyImage1Preview, storyImage1Container, btnDeleteStory1);
    if (storyImage2Upload) setupStoryImageUpload(storyImage2Upload, storyImage2Preview, storyImage2Container, btnDeleteStory2);

    const renderGalleryPreviews = () => {
        if (!galleryPreviewGrid) return;
        galleryPreviewGrid.innerHTML = '';
        galleryFiles.forEach((fileItem, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'relative';
            const img = document.createElement('img');
            img.src = fileItem.isUrl ? fileItem.content : URL.createObjectURL(fileItem.content);
            img.className = 'w-full h-24 object-cover rounded-md';
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 leading-none hover:bg-red-700 transition-colors';
            deleteBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
            deleteBtn.onclick = () => {
                galleryFiles.splice(index, 1);
                renderGalleryPreviews();
            };
            wrapper.appendChild(img);
            wrapper.appendChild(deleteBtn);
            galleryPreviewGrid.appendChild(wrapper);
        });
    };

    if (galleryPhotosUpload) {
        galleryPhotosUpload.addEventListener('change', (event) => {
            const newFiles = Array.from(event.target.files).map(file => ({ isUrl: false, content: file }));
            galleryFiles.push(...newFiles);
            renderGalleryPreviews();
            galleryPhotosUpload.value = '';
        });
    }

    if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            if (e.target.name === 'layout-theme') {
                document.querySelectorAll('.theme-option .selected-indicator').forEach(indicator => { indicator.style.opacity = '0'; });
                const indicator = e.target.closest('.theme-option').querySelector('.selected-indicator');
                if (indicator) { indicator.style.opacity = '1'; }
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
                let heroImageUrl = weddingPageData?.hero_image_url || null;
                if (heroImageUploadInput.files[0]) {
                    heroImageUrl = await uploadFile(heroImageUploadInput.files[0], `${user.id}/hero-${Date.now()}`);
                }

                let storyImageUrl1 = weddingPageData?.story_image_1_url || null;
                if (storyImage1Upload.files[0]) {
                    storyImageUrl1 = await uploadFile(storyImage1Upload.files[0], `${user.id}/story-1-${Date.now()}`);
                } else if (!storyImage1Container.classList.contains('hidden') && storyImage1Preview.src.startsWith('http')) {
                    storyImageUrl1 = storyImage1Preview.src;
                } else {
                    storyImageUrl1 = null;
                }
                
                let storyImageUrl2 = weddingPageData?.story_image_2_url || null;
                if (storyImage2Upload.files[0]) {
                    storyImageUrl2 = await uploadFile(storyImage2Upload.files[0], `${user.id}/story-2-${Date.now()}`);
                } else if (!storyImage2Container.classList.contains('hidden') && storyImage2Preview.src.startsWith('http')) {
                    storyImageUrl2 = storyImage2Preview.src;
                } else {
                    storyImageUrl2 = null;
                }
                
                const galleryUrls = [];
                for(const fileItem of galleryFiles){
                    if(fileItem.isUrl){
                        galleryUrls.push(fileItem.content);
                    } else {
                        const url = await uploadFile(fileItem.content, `${user.id}/gallery/${Date.now()}-${sanitizeFilename(fileItem.content.name)}`);
                        if(url) galleryUrls.push(url);
                    }
                }

                const selectedTheme = themeSelector ? themeSelector.querySelector('input[name="layout-theme"]:checked')?.value : 'padrao';
                const pageDataToSave = {
                    user_id: user.id,
                    main_title: mainTitleInput.value,
                    wedding_date: weddingDateInput.value,
                    intro_text: introTextInput.value,
                    couple_signature: coupleSignatureInput.value,
                    primary_color: primaryColorInput.value,
                    title_color: titleColorInput.value,
                    hero_title_color: heroTitleColorInput.value,
                    hero_image_url: heroImageUrl,
                    rsvp_enabled: rsvpToggle.getAttribute('aria-checked') === 'true',
                    story_section_enabled: storyToggle.getAttribute('aria-checked') === 'true',
                    gallery_section_enabled: galleryToggle.getAttribute('aria-checked') === 'true',
                    story_how_we_met: storyHowWeMetInput.value,
                    story_proposal: storyProposalInput.value,
                    story_image_1_url: storyImageUrl1,
                    story_image_2_url: storyImageUrl2,
                    gallery_photos: galleryUrls,
                    layout_theme: selectedTheme
                };

                const { data: pageResult, error: pageError } = await supabaseClient.from('wedding_pages').upsert(pageDataToSave, { onConflict: 'user_id' }).select().single();
                if (pageError) throw pageError;
                const pageId = pageResult.id;
                const giftEditors = giftsEditorList.querySelectorAll('[data-gift-id]');
                const giftsToSave = [];
                for (const editor of giftEditors) {
                    const imageInput = editor.querySelector('.image-input');
                    let imageUrl = editor.querySelector('.image-preview').src;
                    if (imageInput.files[0]) {
                        imageUrl = await uploadFile(imageInput.files[0], `${user.id}/gift-${Date.now()}`);
                    }
                    giftsToSave.push({ page_id: pageId, title: editor.querySelector('.title-input')?.value || '', description: editor.querySelector('.description-input')?.value || '', value: parseFloat(editor.querySelector('.value-input')?.value) || 0, image_url: imageUrl.startsWith('https://placehold.co') ? null : imageUrl });
                }
                await supabaseClient.from('gifts').delete().eq('page_id', pageId);
                if (giftsToSave.length > 0) {
                    const { error: giftsError } = await supabaseClient.from('gifts').insert(giftsToSave);
                    if (giftsError) throw giftsError;
                }
                showToast("Site atualizado com sucesso!");
                loadWeddingPageData(user.id);
            } catch (error) {
                console.error("ERRO DETALHADO AO SALVAR:", error);
                showToast("Ocorreu um erro ao salvar: " + error.message, 'error');
            } finally {
                btnSaveAll.textContent = 'Salvar Todas as Alterações';
                btnSaveAll.disabled = false;
            }
        });
    }

    if (btnCopyLink) { btnCopyLink.addEventListener('click', () => { if (shareUrlInput) shareUrlInput.select(); document.execCommand('copy'); const originalText = btnCopyLink.textContent; btnCopyLink.textContent = 'Copiado!'; btnCopyLink.classList.add('bg-green-500'); setTimeout(() => { btnCopyLink.textContent = originalText; btnCopyLink.classList.remove('bg-green-500'); }, 2000); }); }
    
    if (btnUpdateEmail) {
        btnUpdateEmail.addEventListener('click', async () => {
            if (!accountEmailInput) return;
            const newEmail = accountEmailInput.value;
            if (!newEmail || !newEmail.includes('@')) return showToast("Por favor, insira um email válido.", 'error');
            const { error } = await supabaseClient.auth.updateUser({ email: newEmail });
            if (error) { showToast(`Erro ao atualizar o email: ${error.message}`, 'error'); } 
            else { showToast("Verifique o seu email antigo e o novo para confirmar a alteração.", 'success'); }
        });
    }

    if(btnUpdatePassword) {
        btnUpdatePassword.addEventListener('click', async () => {
            if(!newPasswordInput || !confirmPasswordInput) return;
            const newPassword = newPasswordInput.value;
            if (newPassword !== confirmPasswordInput.value) return showToast("As senhas não coincidem.", 'error');
            if (newPassword.length < 8) return showToast("A senha deve ter no mínimo 8 caracteres.", 'error');
            const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
            if (error) { showToast(`Erro: ${error.message}`, 'error'); } 
            else { showToast("Senha atualizada com sucesso!"); newPasswordInput.value = ''; confirmPasswordInput.value = ''; }
        });
    }

    (async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            if (accountEmailInput) accountEmailInput.value = user.email;
            await loadWeddingPageData(user.id);
            switchTab('layouts');
        } else {
            window.location.href = '/login';
        }
    })();
});

