// casamento.js
import { supabaseClient } from './app.js';

// Mapeia os nomes dos temas aos seus ficheiros de módulo
const layouts = {
    padrao: {
        css: '/css/classico.css',
        // Importa o módulo do layout dinamicamente
        render: () => import('./layouts/classico.js').then(module => module.render)
    },
    moderno: {
        css: '/css/moderno.css',
        render: () => import('./layouts/moderno.js').then(module => module.render)
    }
};

// --- FUNÇÃO DE INICIALIZAÇÃO PRINCIPAL ---
document.addEventListener('DOMContentLoaded', async () => {
    const pageLoader = document.getElementById('page-loader');
    const pageWrapper = document.getElementById('page-wrapper');
    const themeStyleLink = document.getElementById('theme-style');

    const getPageIdFromUrl = () => {
        const path = window.location.pathname;
        const parts = path.split('/');
        return parts[parts.length - 1];
    };

    const pageId = getPageIdFromUrl();
    if (!pageId || isNaN(pageId)) {
        if(pageLoader) pageLoader.remove();
        if(pageWrapper) {
            pageWrapper.innerHTML = '<h1 class="text-center p-12 text-2xl font-title">Página não encontrada.</h1>';
            pageWrapper.style.opacity = '1';
        }
        return;
    }

    try {
        // 1. Busca os dados do casamento no Supabase
        const { data, error } = await supabaseClient
            .from('wedding_pages')
            .select('*, gifts(*)')
            .eq('id', pageId)
            .single();

        if (error || !data) throw new Error("Dados do casamento não encontrados.");

        // 2. Determina qual layout usar
        const themeName = data.layout_theme || 'padrao';
        const layout = layouts[themeName];
        if (!layout) throw new Error(`Layout "${themeName}" não definido.`);

        // 3. Carrega o CSS do tema
        if(themeStyleLink) themeStyleLink.setAttribute('href', layout.css);
        
        // 4. Carrega a função de renderização do módulo do tema
        const renderFunction = await layout.render();

        // 5. Gera o HTML do layout com os dados (ainda sem o conteúdo dinâmico)
        const htmlContent = renderFunction(data);

        // 6. Injeta o HTML "esqueleto" na página
        if (pageWrapper) pageWrapper.innerHTML = htmlContent;

        // 7. Depois de o HTML estar na página, preenchemos o conteúdo dinâmico
        populateDynamicContent(data);

        // 8. E adicionamos toda a interatividade
        attachEventListeners(data);

        // 9. Esconde o loader e mostra o conteúdo
        if (pageLoader) {
            pageLoader.style.opacity = '0';
            setTimeout(() => pageLoader.remove(), 600);
        }
        if (pageWrapper) pageWrapper.style.opacity = '1';

    } catch (err) {
        console.error("Erro ao carregar a página:", err);
        if(pageLoader) pageLoader.remove();
        if(pageWrapper) {
             pageWrapper.innerHTML = `<h1 class="text-center p-12 text-2xl font-title">Erro ao carregar a página.</h1>`;
             pageWrapper.style.opacity = '1';
        }
    }
});


// --- Funções que correm DEPOIS de o HTML ser injetado ---

/**
 * Preenche o conteúdo dinâmico (textos, imagens, cores) do layout que foi injetado na página.
 */
function populateDynamicContent(data) {
    const heroTitle = document.getElementById('hero-title');
    const heroDate = document.getElementById('hero-date');
    const heroImage = document.getElementById('hero-image');
    const introTextContainer = document.getElementById('intro-text-container');
    const monogramContainer = document.getElementById('monogram-container');
    const monogramInitial1 = document.getElementById('monogram-initial-1');
    const monogramInitial2 = document.getElementById('monogram-initial-2');
    const root = document.documentElement;

    document.title = `${data.main_title || 'Nosso Casamento'} | Ilovecasamento`;
    if (heroTitle) heroTitle.textContent = data.main_title;
    if (heroDate) heroDate.textContent = new Date(data.wedding_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    if (heroImage && data.hero_image_url) {
        heroImage.src = data.hero_image_url;
        heroImage.onload = () => { heroImage.classList.remove('opacity-0'); };
    }

    if (data.main_title && monogramContainer) {
        const cleanedTitle = data.main_title.replace(/\s*&\s*|\s+e\s+|\s+and\s+/i, ' ').trim();
        const names = cleanedTitle.split(/\s+/);
        if (names.length >= 2 && monogramInitial1 && monogramInitial2) {
            monogramInitial1.textContent = names[0].charAt(0).toUpperCase();
            monogramInitial2.textContent = names[names.length - 1].charAt(0).toUpperCase();
            monogramContainer.classList.remove('hidden');
        }
    }

    if (introTextContainer) {
        introTextContainer.innerHTML = '';
        if (data.intro_text) {
            data.intro_text.split('\n').forEach(pText => {
                if (pText.trim() !== '') {
                    const pElement = document.createElement('p');
                    pElement.textContent = pText;
                    introTextContainer.appendChild(pElement);
                }
            });
        }
        if (data.couple_signature) {
            const signatureElement = document.createElement('p');
            signatureElement.className = 'font-signature mt-8';
            signatureElement.textContent = data.couple_signature;
            introTextContainer.appendChild(signatureElement);
        }
    }

    root.style.setProperty('--primary-color', data.primary_color || '#D9A8A4');
    root.style.setProperty('--title-color', data.title_color || '#333333');
    root.style.setProperty('--hero-title-color', data.hero_title_color || '#FFFFFF');
}

/**
 * Adiciona a interatividade (carrinho, ordenação, rsvp) aos elementos que foram injetados.
 */
function attachEventListeners(data) {
    // Seletores dos elementos interativos
    const giftListContainer = document.getElementById('gift-list-container');
    const sortSelect = document.getElementById('sort-gifts');
    const cartIcon = document.getElementById('cart-icon');
    const cartCount = document.getElementById('cart-count');
    const cartModalOverlay = document.getElementById('cart-modal-overlay');
    const cartModal = document.getElementById('cart-modal');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotal = document.getElementById('cart-total');
    const btnAddMore = document.getElementById('btn-add-more');
    const btnCheckout = document.getElementById('btn-checkout');
    const rsvpSection = document.getElementById('rsvp-section');
    const btnSubmitRsvp = document.getElementById('btn-submit-rsvp');

    let originalGifts = data.gifts || [];
    let cart = [];
    
    // Funções do Carrinho
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
    
    // Função para renderizar os presentes
    const renderGifts = (gifts) => {
        if (!giftListContainer) return;
        giftListContainer.innerHTML = '';
        if (gifts && gifts.length > 0) {
            gifts.forEach(gift => {
                const giftCard = document.createElement('div');
                giftCard.className = 'bg-white rounded-lg overflow-hidden flex flex-col card-shadow';
                giftCard.innerHTML = `
                    <img src="${gift.image_url || 'https://placehold.co/600x400?text=Presente'}" alt="${gift.title}" class="w-full h-48 object-cover">
                    <div class="p-6 flex flex-col flex-grow">
                        <h3 class="text-2xl font-semibold mb-2 font-title">${gift.title}</h3>
                        <p class="text-gray-600 mb-4 flex-grow">${gift.description || ''}</p>
                        <p class="text-3xl font-light mb-6" style="color: var(--primary-color);">R$ ${Number(gift.value).toFixed(2).replace('.', ',')}</p>
                        <button data-id="${gift.id}" class="add-to-cart-btn mt-auto w-full btn-primary">Adicionar ao Carrinho</button>
                    </div>`;
                giftListContainer.appendChild(giftCard);
            });
        } else {
            giftListContainer.innerHTML = '<p class="text-gray-500 col-span-full">Este casal ainda não adicionou nenhum presente à lista.</p>';
        }
    };
    
    renderGifts(originalGifts);

    // Event listeners
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const sortBy = sortSelect.value;
            let sortedGifts = [...originalGifts];
            switch (sortBy) {
                case 'price-asc': sortedGifts.sort((a, b) => a.value - b.value); break;
                case 'price-desc': sortedGifts.sort((a, b) => b.value - a.value); break;
                case 'az': sortedGifts.sort((a, b) => a.title.localeCompare(b.title)); break;
                case 'za': sortedGifts.sort((a, b) => b.title.localeCompare(a.title)); break;
                default: sortedGifts.sort((a,b) => a.id - b.id); break;
            }
            renderGifts(sortedGifts);
        });
    }

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
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        cartItems: cart,
                        weddingPageId: currentPageId,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Falha ao criar a preferência de pagamento.');
                }

                const preference = await response.json();
                
                // Redireciona o convidado para a página de checkout do Mercado Pago
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
            const attendingRadio = document.querySelector('input[name="attending"]:checked');
            if (!rsvpName.value || !attendingRadio) {
                // Adicione uma notificação de erro mais elegante se desejar
                return alert("Por favor, preencha o seu nome e confirme a sua presença.");
            }

            btnSubmitRsvp.disabled = true;
            btnSubmitRsvp.textContent = "Enviando...";

            const rsvpData = {
                wedding_page_id: currentPageId,
                guest_name: rsvpName.value,
                is_attending: attendingRadio.value === 'yes',
                plus_ones: parseInt(rsvpGuests.value) || 1,
                message: rsvpMessage.value,
            };
            
            const { error } = await supabaseClient.from('rsvps').insert([rsvpData]);

            if (error) {
                alert("Ocorreu um erro ao enviar a sua confirmação. Por favor, tente novamente.");
                btnSubmitRsvp.disabled = false;
                btnSubmitRsvp.textContent = "Enviar Confirmação";
            } else {
                if (rsvpSection) {
                    rsvpSection.innerHTML = '<p class="text-center text-lg text-green-600 font-semibold">Obrigado! A sua presença foi registada com sucesso.</p>';
                }
            }
        });
    }

    // Mostra a secção de RSVP se estiver ativada
    if (data.rsvp_enabled && rsvpSection) {
        rsvpSection.classList.remove('hidden');
    }
}

