// casamento.js
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
        
     
        if (parts[1] === 'casamento' && !isNaN(identifier)) {
            return { type: 'id', value: identifier };
        }
        
        if (identifier) {
             return { type: 'slug', value: identifier };
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
        const query = supabaseClient
            .from('wedding_pages')
            .select('*, gifts(*)')
            .eq(identifier.type, identifier.value)
            .single();

        const { data, error } = await query;

        if (error || !data) throw new Error("Dados do casamento não encontrados.");

        const themeName = data.layout_theme || 'padrao';
        const layout = layouts[themeName];
        if (!layout) throw new Error(`Layout "${themeName}" não definido.`);

        if(themeStyleLink) themeStyleLink.setAttribute('href', layout.css);
        
        const renderFunction = await layout.render();

        const htmlContent = renderFunction(data);

        if (pageWrapper) pageWrapper.innerHTML = htmlContent;

        populateDynamicContent(data);

        attachEventListeners(data, data.id);

        if (pageLoader) {
            pageLoader.style.opacity = '0';
            setTimeout(() => pageLoader.remove(), 600);
        }
        if (pageWrapper) pageWrapper.style.opacity = '1';

    } catch (err) {
        console.error("Erro ao carregar a página:", err);
        if(pageLoader) pageLoader.remove();
        if(pageWrapper) {
             pageWrapper.innerHTML = `<h1 class="text-center p-12 text-2xl font-title">Página de Casamento não encontrada.</h1>`;
             pageWrapper.style.opacity = '1';
        }
    }
});

function populateDynamicContent(data) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', data.primary_color || '#D9A8A4');
    root.style.setProperty('--title-color', data.title_color || '#333333');
    root.style.setProperty('--hero-title-color', data.hero_title_color || '#FFFFFF');
    document.title = `${data.main_title || 'Nosso Casamento'} | Ilovecasamento`;
}

function attachEventListeners(data, currentPageId) {
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
    const updateCartUI = () => {     if (!cartItemsContainer || !cartCount || !cartTotal) return;
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
        if (btnCheckout) btnCheckout.disabled = cart.length === 0;};
    
    if (giftListContainer) {
        giftListContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.add-to-cart-btn');
            if (button) {
                const giftId = Number(button.dataset.id);
                const giftToAdd = originalGifts.find(g => g.id === giftId);
                if (giftToAdd) {
                    cart.push({ ...giftToAdd, cartItemId: Date.now() + Math.random() });
                    updateCartUI();
                }
            }
        });
    }

    if(cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
             const button = e.target.closest('.remove-item-btn');
             if(button) {
                 const cartItemIdToRemove = Number(button.dataset.cartItemId);
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
            if (cart.length === 0 || !currentPageId) return;

            btnCheckout.textContent = 'Processando...';
            btnCheckout.disabled = true;

            try {
                const response = await fetch('/create-payment-preference', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cartItems: cart,
                        weddingPageId: currentPageId,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Falha ao criar a preferência de pagamento.');
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

    if (btnSubmitRsvp) {
        btnSubmitRsvp.addEventListener('click', async () => {
            const rsvpName = document.getElementById('rsvp-name');
            const rsvpGuests = document.getElementById('rsvp-guests');
            const rsvpMessage = document.getElementById('rsvp-message');
            const attendingRadio = document.querySelector('input[name="attending"]:checked');
            const rsvpSection = document.getElementById('rsvp-section');

            if (!rsvpName || !rsvpGuests || !rsvpMessage) return;

            if (!rsvpName.value || !attendingRadio) {
                return alert("Por favor, preencha o seu nome e confirme a sua presença.");
            }

            btnSubmitRsvp.disabled = true;
            btnSubmitRsvp.textContent = "Enviando...";

            const rsvpData = {
                wedding_page_id: currentPageId,
                guest_name: rsvpName.value,
                is_attending: attendingRadio.value === 'yes',
                plus_ones: parseInt(rsvpGuests.value) || 0,
                message: rsvpMessage.value,
            };
            
            const { error } = await supabaseClient.from('rsvps').insert([rsvpData]);

            if (error) {
                alert("Ocorreu um erro ao enviar a sua confirmação. Por favor, tente novamente.");
                btnSubmitRsvp.disabled = false;
                btnSubmitRsvp.textContent = "Enviar Confirmação";
            } else {
                if (rsvpSection) {
                    rsvpSection.innerHTML = '<div class="text-center"><p class="text-lg text-green-600 font-semibold">Obrigado! A sua presença foi registada com sucesso.</p></div>';
                }
            }
        });
    }
}

