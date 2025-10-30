// evento.js
import { supabaseClient } from './app.js';

// Mapeia os nomes dos temas aos seus ficheiros de módulo
const layouts = {
    padrao: {
        css: '/css/classico.css',
        render: () => import('./layouts/classico.js').then(module => module.render)
    },
    moderno: {
        css: '/css/moderno.css',
        render: () => import('./layouts/moderno.js').then(module => module.render)
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const pageLoader = document.getElementById('page-loader');
    const pageWrapper = document.getElementById('page-wrapper');
    const themeStyleLink = document.getElementById('theme-style');

    const getIdentifierFromUrl = () => {
        const path = window.location.pathname;
        const parts = path.split('/');
        const identifier = parts[parts.length - 1];
        
        // Rota antiga: /casamento/123 ou /evento/123
        if ((parts[1] === 'casamento' || parts[1] === 'evento') && !isNaN(identifier)) {
            return { type: 'id', value: identifier };
        }
        // Nova rota: /slug-do-evento
        if (identifier) {
             return { type: 'slug', value: identifier }; // Será testado em 'slug' e 'slug_premium'
        }
        return { type: null, value: null };
    };

    const identifier = getIdentifierFromUrl();

    if (!identifier.value) {
        if(pageLoader) pageLoader.remove();
        if(pageWrapper) {
            pageWrapper.innerHTML = '<h1 class="text-center p-12 text-2xl font-title">Página não encontrada.</h1>';
            pageWrapper.style.opacity = '1';
        }
        return;
    }

    try {
        // Tenta encontrar pelo tipo de identificador (id ou slug padrão)
        let { data, error } = await supabaseClient
            .from('events')
            .select('*, gifts(*)')
            .eq(identifier.type, identifier.value)
            .single();

        let isPremiumSlug = false;

        // Se não encontrou (erro) E o tipo era 'slug', tenta buscar por 'slug_premium'
        if ((error || !data) && identifier.type === 'slug') {
            const { data: premiumData, error: premiumError } = await supabaseClient
                .from('events')
                .select('*, gifts(*)')
                .eq('slug_premium', identifier.value) // Busca na coluna slug_premium
                .single();
            
            if (premiumError || !premiumData) {
                 throw new Error("Dados do evento não encontrados.");
            }
            data = premiumData; // Usa os dados encontrados
            isPremiumSlug = true; // Marca que esta é a URL premium
        } else if (error || !data) {
            // Se falhou por ID, ou se falhou por slug e não encontrou no premium
            throw new Error("Dados do evento não encontrados.");
        }


        // --- LÓGICA DE PREÇO MÚLTIPLO ---
        const urlParams = new URLSearchParams(window.location.search);
        // Ativa preço premium se:
        // 1. Foi acedido pela URL premium (isPremiumSlug === true)
        // 2. Ou se tem o parâmetro ?lista=premium
        const priceListType = (isPremiumSlug || urlParams.get('lista') === 'premium') ? 'premium' : 'default';

        // Processa os dados para unificar o preço
        const processedData = {
            ...data,
            gifts: data.gifts.map(gift => ({
                ...gift,
                // Define o 'value' principal com base na lista, com fallback para o padrão
                value: (priceListType === 'premium' && gift.value_premium > 0) ? gift.value_premium : (gift.value_default || 0)
            })).filter(gift => gift.value > 0) // Filtra presentes com valor 0
        };
        // --- FIM DA LÓGICA DE PREÇO ---

        const themeName = data.layout_theme || 'padrao';
        const layout = layouts[themeName];
        if (!layout) throw new Error(`Layout "${themeName}" não definido.`);

        if(themeStyleLink) themeStyleLink.setAttribute('href', layout.css);
        
        const renderFunction = await layout.render();
        
        const htmlContent = renderFunction(processedData); // Usa os dados processados

        if (pageWrapper) pageWrapper.innerHTML = htmlContent;

        populateDynamicContent(processedData);

        attachEventListeners(processedData); // Usa os dados processados

        if (pageLoader) {
            pageLoader.style.opacity = '0';
            setTimeout(() => pageLoader.remove(), 600);
        }
        if (pageWrapper) pageWrapper.style.opacity = '1';

    } catch (err) {
        console.error("Erro ao carregar a página:", err);
        if(pageLoader) pageLoader.remove();
        if(pageWrapper) {
             pageWrapper.innerHTML = `<h1 class="text-center p-12 text-2xl font-title">Página do Evento não encontrada.</h1><p class="text-center text-gray-600">${err.message}</p>`;
             pageWrapper.style.opacity = '1';
        }
    }
});

function populateDynamicContent(data) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', data.primary_color || '#D9A8A4');
    root.style.setProperty('--title-color', data.title_color || '#333333');
    root.style.setProperty('--main-title-color', data.main_title_color || '#FFFFFF');
    document.title = `${data.main_title || 'Nosso Evento'} | Welovepresente`;
}

function attachEventListeners(data) {
    const giftListContainer = document.getElementById('gift-list-container');
    const cartIcon = document.getElementById('cart-icon');
    const cartCount = document.getElementById('cart-count');
    const cartModalOverlay = document.getElementById('cart-modal-overlay');
    const cartModal = document.getElementById('cart-modal');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotal = document.getElementById('cart-total');
    const btnAddMore = document.getElementById('btn-add-more');
    const btnCheckout = document.getElementById('btn-checkout');
    const btnSubmitRsvp = document.getElementById('btn-submit-rsvp');
    
    // --- LÓGICA DO CARRINHO ---
    // 'data.gifts' aqui já contém os presentes com o 'value' correto e unificado
    let originalGifts = data.gifts || [];
    let cart = [];
    
    const openCart = () => {if (!cartModal || !cartModalOverlay) return;
        cartModalOverlay.classList.remove('hidden');
        cartModal.classList.remove('hidden');
        setTimeout(() => cartModal.classList.remove('scale-95'), 10); };
    const closeCart = () => { if (!cartModal || !cartModalOverlay) return;
        cartModal.classList.add('scale-95');
        setTimeout(() => {
            cartModalOverlay.classList.add('hidden');
            cartModal.classList.add('hidden');
        }, 300); };
    
    // O updateCartUI funcionará automaticamente porque 'item.value' já é o preço correto
    const updateCartUI = () => {     
        if (!cartItemsContainer || !cartCount || !cartTotal) return;
        cartItemsContainer.innerHTML = '';
        let total = 0;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-gray-500">O seu carrinho está vazio.</p>';
        } else {
            cart.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'flex items-center justify-between border-b pb-4';
                itemDiv.innerHTML = `<div class="flex items-center"><img src="${item.image_url || 'https://placehold.co/100x100?text=Presente'}" alt="${item.title}" class="w-16 h-16 object-cover rounded-md mr-4"><div><p class="font-semibold text-gray-800">${item.title}</p><button data-cart-item-id="${item.cartItemId}" class="remove-item-btn text-red-500 text-sm hover:underline">Remover</button></div></div><p class="font-semibold text-gray-900">R$ ${Number(item.value).toFixed(2).replace('.', ',')}</p>`;
                cartItemsContainer.appendChild(itemDiv);
                total += Number(item.value);
            });
        }
        cartCount.textContent = cart.length;
        cartTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        if (btnCheckout) btnCheckout.disabled = cart.length === 0;
    };
    
    if (giftListContainer) {
        giftListContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.add-to-cart-btn, .btn-contribute');
            if (button) {
                const giftId = Number(button.dataset.id);
                // Encontra o presente nos 'originalGifts' (que já têm o preço correto)
                const giftToAdd = originalGifts.find(g => g.id === giftId);
                if (giftToAdd) {
                    cart.push({ ...giftToAdd, cartItemId: Date.now() + Math.random() });
                    updateCartUI();
                    openCart(); // Abre o carrinho ao adicionar
                }
            }
        });
    }

    if(cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
             const button = e.target.closest('.remove-item-btn');
             if(button) {
                 const cartItemIdToRemove = parseFloat(button.dataset.cartItemId); // Corrigido para parseFloat
                 cart = cart.filter(item => item.cartItemId !== cartItemIdToRemove);
                 updateCartUI();
             }
        });
    }

    if (cartIcon) cartIcon.addEventListener('click', openCart);
    if (cartModalOverlay) cartModalOverlay.addEventListener('click', closeCart);
    if (btnAddMore) btnAddMore.addEventListener('click', closeCart);
    
    if (btnCheckout) {
         btnCheckout.addEventListener('click', async () => {
            if (cart.length === 0) return;

            btnCheckout.textContent = 'Processando...';
            btnCheckout.disabled = true;

            // Prepara os itens do carrinho para o checkout
            // O servidor espera um campo 'value', que já está correto
            const cartItemsForCheckout = cart.map(item => ({
                id: item.id,
                title: item.title,
                value: item.value || 0
            }));

            try {
                const response = await fetch('/create-payment-preference', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cartItems: cartItemsForCheckout,
                        eventId: data.id,
                    }),
                });

                if (!response.ok) {
                    const errorDetails = await response.json();
                    throw new Error(`Falha ao criar a preferência de pagamento: ${errorDetails.error || 'Erro desconhecido'}`);
                }

                const preference = await response.json();
                
                if (preference.init_point) {
                    window.location.href = preference.init_point;
                } else {
                    throw new Error('URL de checkout não recebida.');
                }

            } catch (error) {
                console.error("Erro no checkout:", error);
                alert("Não foi possível iniciar o pagamento. Por favor, tente novamente.");
                btnCheckout.textContent = 'Continuar Compra';
                btnCheckout.disabled = false;
            }
        });
    }

    // --- LÓGICA DE CARROSSEL GENÉRICA (MODERNO) ---
    const setupCarousel = (containerSelector, imageId, prevId, nextId, counterId, photos) => {
        const galleryContainer = document.querySelector(containerSelector);
        const imageEl = document.getElementById(imageId);
        const btnPrev = document.getElementById(prevId);
        const btnNext = document.getElementById(nextId);
        const counterEl = document.getElementById(counterId);
        const photoList = photos || [];
        let currentIndex = 0;

        if (!galleryContainer || !imageEl || !btnPrev || !btnNext || photoList.length === 0) {
            if(galleryContainer) galleryContainer.style.display = 'none'; // Esconde se não houver fotos
            return;
        }

        const showPhoto = (index) => {
            if (index < 0) index = photoList.length - 1; // Loop
            if (index >= photoList.length) index = 0; // Loop
            
            currentIndex = index;
            
            imageEl.style.opacity = '0';
            setTimeout(() => {
                imageEl.src = photoList[index];
                imageEl.style.opacity = '1';
            }, 300);
            
            if (counterEl) {
                counterEl.textContent = `${index + 1} / ${photoList.length}`;
            }
        };

        btnPrev.addEventListener('click', () => showPhoto(currentIndex - 1));
        btnNext.addEventListener('click', () => showPhoto(currentIndex + 1));
        
        // Suporte a swipe
        let touchStartX = 0;
        let touchEndX = 0;
        
        galleryContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        galleryContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        const handleSwipe = () => {
            if (touchEndX < touchStartX - 50) { // Swiped left
                showPhoto(currentIndex + 1);
            }
            if (touchEndX > touchStartX + 50) { // Swiped right
                showPhoto(currentIndex - 1);
            }
        };

        // Mostra a primeira foto
        showPhoto(0);
    };

    // INICIALIZA OS CARROSSÉIS (Layout Moderno)
    
    // Galeria Principal
    setupCarousel(
        '#main-gallery-container', // Usando o ID do container principal da galeria
        'modern-gallery-image', 
        'modern-gallery-prev', 
        'modern-gallery-next', 
        'modern-gallery-counter', 
        data.gallery_photos
    );
    
    // Carrossel da História 1
    setupCarousel(
        '#story-1-carousel-container',
        'story-1-gallery-image', 
        'story-1-gallery-prev', 
        'story-1-gallery-next', 
        'story-1-gallery-counter', 
        data.story_images_1 // Usando a nova coluna do Supabase
    );
    
    // Carrossel da História 2
    setupCarousel(
        '#story-2-carousel-container',
        'story-2-gallery-image', 
        'story-2-gallery-prev', 
        'story-2-gallery-next', 
        'story-2-gallery-counter', 
        data.story_images_2 // Usando a nova coluna do Supabase
    );


    // --- LÓGICA DO LIGHTBOX DA GALERIA (Layout Clássico) ---
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const btnClose = document.getElementById('lightbox-close');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');
    const galleryContainer = document.getElementById('gallery-section');
    
    // Pega as fotos dos dados do evento
    const galleryPhotos = data.gallery_photos || [];
    let currentPhotoIndex = 0;

    if (lightbox && galleryContainer && galleryPhotos.length > 0) {
        
        const showPhoto = (index) => {
            if (index < 0) index = galleryPhotos.length - 1; // Loop
            if (index >= galleryPhotos.length) index = 0; // Loop
            
            currentPhotoIndex = index;
            
            // Efeito de fade-out e scale-down
            if(lightboxImage) {
                 lightboxImage.style.opacity = '0';
                 lightboxImage.style.transform = 'scale(0.95)';
            }
           
            setTimeout(() => {
                if(lightboxImage) {
                    lightboxImage.src = galleryPhotos[index];
                    // Efeito de fade-in e scale-up
                    lightboxImage.style.opacity = '1';
                    lightboxImage.style.transform = 'scale(1)';
                }
            }, 150); // Tempo para a transição
        };

        galleryContainer.addEventListener('click', (e) => {
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                const index = parseInt(galleryItem.dataset.galleryIndex, 10);
                showPhoto(index);
                lightbox.classList.remove('hidden');
                setTimeout(() => {
                    lightbox.style.opacity = '1';
                    lightbox.style.pointerEvents = 'auto';
                }, 10);
            }
        });

        const closeLightbox = () => {
            lightbox.style.opacity = '0';
            lightbox.style.pointerEvents = 'none';
            if(lightboxImage) lightboxImage.style.transform = 'scale(0.95)';
            setTimeout(() => {
                lightbox.classList.add('hidden');
            }, 300); // Duração da transição
        };

        if(btnClose) btnClose.addEventListener('click', closeLightbox);
        if(btnPrev) btnPrev.addEventListener('click', () => showPhoto(currentPhotoIndex - 1));
        if(btnNext) btnNext.addEventListener('click', () => showPhoto(currentPhotoIndex + 1));
        if(lightbox) lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (lightbox && !lightbox.classList.contains('hidden')) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') showPhoto(currentPhotoIndex - 1);
                if (e.key === 'ArrowRight') showPhoto(currentPhotoIndex + 1);
            }
        });
    }

    // --- LÓGICA DE ORDENAÇÃO DE PRESENTES ---
    const sortSelect = document.getElementById('sort-gifts');
    if (sortSelect) {
        // Esconde a ordenação se não houver presentes
        if (originalGifts.length === 0) {
            sortSelect.classList.add('hidden');
        }

        const renderSortedGifts = (gifts) => {
            if (!giftListContainer) return;
            // A renderização dos presentes é diferente entre os layouts,
            // então não podemos ter uma função de renderização genérica aqui
            // sem refatorar os layouts.
            // Por enquanto, vamos apenas ordenar os dados e deixar o layout
            // tratar a renderização (o layout clássico faz isso).
            // A ordenação inicial já é feita no 'classico.js'.
            
            // Para o layout clássico:
            if(document.body.classList.contains('theme-padrao')) {
                giftListContainer.innerHTML = gifts.map(gift => {
                    return `
                        <div class="border rounded-lg overflow-hidden card-shadow bg-white">
                            <img src="${gift.image_url || 'https://placehold.co/600x400/EFEAE6/967E76?text=Presente'}" alt="${gift.title}" class="w-full h-48 object-cover">
                            <div class="p-6 text-center">
                                <h3 class="text-xl font-serif" style="color: ${data.title_color || '#333333'};">${gift.title}</h3>
                                ${gift.description ? `<p class="text-gray-600 my-2 text-sm">${gift.description}</p>` : ''}
                                <p class="text-2xl font-semibold my-4" style="color: ${data.primary_color || '#D9A8A4'};">R$ ${Number(gift.value).toFixed(2).replace('.', ',')}</p>
                                <button data-id="${gift.id}" class="add-to-cart-btn btn-primary w-full">Adicionar ao Carrinho</button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
            // Para o layout moderno (se precisar de ordenação):
            else if(document.body.classList.contains('theme-moderno')) {
                giftListContainer.innerHTML = gifts.map(gift => `
                    <div class="gift-card text-center bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                        <div class="w-full h-48">
                            <img src="${gift.image_url || 'https://placehold.co/400x300/F9F5F2/967E76?text=Presente'}" alt="${gift.title}" class="w-full h-full object-cover">
                        </div>
                        <div class="p-4 flex-grow flex flex-col">
                            <h3 class="text-lg font-semibold text-gray-700">${gift.title}</h3>
                            <p class="text-gray-500 mb-4 mt-1 flex-grow">R$ ${Number(gift.value).toFixed(2).replace('.', ',')}</p>
                            <button data-id="${gift.id}" class="add-to-cart-btn btn-contribute mt-auto">Contribuir</button>
                        </div>
                    </div>
                `).join('');
            }
        };
        
        sortSelect.addEventListener('change', () => {
            let sortedGifts = [...originalGifts];
            switch (sortSelect.value) {
                case 'price-asc':
                    sortedGifts.sort((a, b) => a.value - b.value);
                    break;
                case 'price-desc':
                    sortedGifts.sort((a, b) => b.value - b.value);
                    break;
                case 'az':
                    sortedGifts.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'za':
                    sortedGifts.sort((a, b) => b.title.localeCompare(a.title));
                    break;
            }
            renderSortedGifts(sortedGifts);
        });
    }
    
    // --- LÓGICA DO RSVP ---
    if (btnSubmitRsvp) {
        btnSubmitRsvp.addEventListener('click', async () => {
            const rsvpName = document.getElementById('rsvp-name');
            // const rsvpGuests = document.getElementById('rsvp-guests'); // CAMPO REMOVIDO
            const rsvpMessage = document.getElementById('rsvp-message');
            const attendingRadio = document.querySelector('input[name="attending"]:checked');
            const rsvpSection = document.getElementById('rsvp-section');

            if (!rsvpName || !attendingRadio) {
                return alert("Por favor, preencha o seu nome e confirme a sua presença.");
            }
            
            // Lógica de "acompanhantes" removida
            // const guestsValue = rsvpGuests ? (parseInt(rsvpGuests.value) || 0) : 0; // REMOVIDO

            btnSubmitRsvp.disabled = true;
            btnSubmitRsvp.textContent = "Enviando...";

            const rsvpData = {
                event_id: data.id,
                guest_name: rsvpName.value,
                is_attending: attendingRadio.value === 'yes',
                // Define plus_ones como 1 se for, 0 se não for.
                plus_ones: attendingRadio.value === 'yes' ? 1 : 0, 
                message: rsvpMessage ? rsvpMessage.value : '', // Garante que rsvpMessage exista
            };
            
            const { error } = await supabaseClient.from('rsvps').insert([rsvpData]);

            if (error) {
                alert("Ocorreu um erro ao enviar a sua confirmação. Por favor, tente novamente.");
                btnSubmitRsvp.disabled = false;
                btnSubmitRsvp.textContent = "Enviar Confirmação";
            } else {
                if (rsvpSection) {
                    rsvpSection.innerHTML = `<div class="text-center p-8"><p class="text-lg text-green-600 font-semibold">Obrigado! A sua presença foi registada com sucesso.</p></div>`;
                }
            }
        });
    }
}

