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

    // --- LÓGICA DO CAROUSEL (MODERNO) ---
    const modernGalleryImage = document.getElementById('modern-gallery-image');
    const btnModernPrev = document.getElementById('modern-gallery-prev');
    const btnModernNext = document.getElementById('modern-gallery-next');
    const modernGalleryCounter = document.getElementById('modern-gallery-counter');
    const galleryPhotosCarousel = data.gallery_photos || [];
    let currentCarouselIndex = 0;

    if (modernGalleryImage && galleryPhotosCarousel.length > 0) {
        
        const showModernPhoto = (index) => {
            if (index < 0) index = galleryPhotosCarousel.length - 1; // Loop
            if (index >= galleryPhotosCarousel.length) index = 0; // Loop
            
            currentCarouselIndex = index;
            
            // Efeito de fade
            modernGalleryImage.style.opacity = '0';
            setTimeout(() => {
                modernGalleryImage.src = galleryPhotosCarousel[index];
                modernGalleryImage.style.opacity = '1';
            }, 300); // Deve corresponder à duração da transição
            
            if (modernGalleryCounter) {
                modernGalleryCounter.textContent = `${index + 1} / ${galleryPhotosCarousel.length}`;
            }
        };

        if (btnModernPrev) {
            btnModernPrev.addEventListener('click', () => showModernPhoto(currentCarouselIndex - 1));
        }
        if (btnModernNext) {
            btnModernNext.addEventListener('click', () => showModernPhoto(currentCarouselIndex + 1));
        }
        
        // Suporte a swipe
        let touchStartX = 0;
        let touchEndX = 0;
        
        modernGalleryImage.parentElement.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        modernGalleryImage.parentElement.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        const handleSwipe = () => {
            if (touchEndX < touchStartX - 50) { // Swiped left
                showModernPhoto(currentCarouselIndex + 1);
            }
            if (touchEndX > touchStartX + 50) { // Swiped right
                showModernPhoto(currentCarouselIndex - 1);
            }
        };
    }

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
            if (!lightbox.classList.contains('hidden')) {
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
            giftListContainer.innerHTML = gifts.map(gift => {
                 // Reutiliza a renderização do layout clássico, se disponível
                 // Esta é uma simplificação; idealmente, a função de renderização de item seria separada.
                 // Para este caso, vamos recriar o HTML básico do 'classico.js'.
                 return `
                    <div class="border rounded-lg overflow-hidden card-shadow bg-white">
                        <img src="${gift.image_url || 'https://placehold.co/600x400/EFEAE6/967E76?text=Presente'}" alt="${gift.title}" class="w-full h-48 object-cover">
                        <div class="p-6 text-center">
                            <h3 class="text-xl font-serif" style="color: ${data.title_color || '#333333'};">${gift.title}</h3>
                            <p class="text-gray-600 my-2">${gift.description || ''}</p>
                            <p class="text-2xl font-semibold my-4" style="color: ${data.primary_color || '#D9A8A4'};">R$ ${Number(gift.value).toFixed(2).replace('.', ',')}</p>
                            <button data-id="${gift.id}" class="add-to-cart-btn btn-primary w-full">Adicionar ao Carrinho</button>
                        </div>
                    </div>
                 `;
            }).join('');
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
            const rsvpGuests = document.getElementById('rsvp-guests');
            const rsvpMessage = document.getElementById('rsvp-message');
            const attendingRadio = document.querySelector('input[name="attending"]:checked');
            const rsvpSection = document.getElementById('rsvp-section');

            if (!rsvpName || !attendingRadio) {
                return alert("Por favor, preencha o seu nome e confirme a sua presença.");
            }
            
            // Garante que rsvpGuests exista ou define um valor padrão
            const guestsValue = rsvpGuests ? (parseInt(rsvpGuests.value) || 0) : 0;

            btnSubmitRsvp.disabled = true;
            btnSubmitRsvp.textContent = "Enviando...";

            const rsvpData = {
                event_id: data.id,
                guest_name: rsvpName.value,
                is_attending: attendingRadio.value === 'yes',
                plus_ones: guestsValue, // Usa o valor seguro
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

