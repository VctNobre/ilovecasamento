// public/js/layouts/classico.js

// --- Seção da História ---
function createStorySection(data) {
    if (!data.story_section_enabled) return '';

    // Helper para renderizar carrossel ou placeholder da História
    const renderStoryCarousel = (images, containerId, imageId, prevId, nextId, counterId, placeholder) => {
        if (!images || images.length === 0) {
            return `<img src="${placeholder}" alt="Foto da história" class="rounded-lg shadow-xl w-full">`;
        }
        // Note: IDs precisam ser únicos, então usamos os IDs passados como parâmetros
        return `
            <div id="${containerId}" class="relative w-full rounded-lg shadow-xl overflow-hidden" style="aspect-ratio: 16 / 10; user-select: none;">
                <img id="${imageId}" src="${images[0]}" alt="Foto da Galeria" class="w-full h-full object-cover transition-opacity duration-300">
                <button id="${prevId}" class="gallery-nav-btn absolute left-4 top-1/2 -translate-y-1/2">&#10094;</button>
                <button id="${nextId}" class="gallery-nav-btn absolute right-4 top-1/2 -translate-y-1/2">&#10095;</button>
                <div id="${counterId}" class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm py-1 px-3 rounded-full">
                    1 / ${images.length}
                </div>
            </div>
        `;
    };

    return `
        <section id="story-section" class="py-16 md:py-20 border-t">
            <div class="container mx-auto px-6 md:px-8 max-w-4xl text-center">
                <h2 class="text-3xl md:text-4xl font-serif mb-12" style="color: ${data.title_color || '#333333'};">${data.story_title_1 || 'Nossa História'}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
                    <div class="md:w-full">
                         ${renderStoryCarousel(
                            data.story_images_1,
                            'story-1-carousel-container',
                            'story-1-gallery-image',
                            'story-1-gallery-prev',
                            'story-1-gallery-next',
                            'story-1-gallery-counter',
                            'https://placehold.co/600x400/EADFD6/967E76?text=Foto+1'
                        )}
                    </div>
                    <div class="text-gray-600 text-left">
                        <p class="leading-relaxed">${data.story_how_we_met ? data.story_how_we_met.replace(/\n/g, '<br>') : ''}</p>
                    </div>
                </div>
                
                <h2 class="text-3xl md:text-4xl font-serif mt-16 mb-12" style="color: ${data.title_color || '#333333'};">${data.story_title_2 || 'O Pedido'}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                     <div class="text-gray-600 text-left md:order-2">
                        <p class="leading-relaxed">${data.story_proposal ? data.story_proposal.replace(/\n/g, '<br>') : ''}</p>
                    </div>
                    <div class="md:order-1 md:w-full">
                        ${renderStoryCarousel(
                            data.story_images_2,
                            'story-2-carousel-container',
                            'story-2-gallery-image',
                            'story-2-gallery-prev',
                            'story-2-gallery-next',
                            'story-2-gallery-counter',
                            'https://placehold.co/600x400/EADFD6/967E76?text=Foto+2'
                        )}
                    </div>
                </div>
            </div>
        </section>
    `;
}

// --- Seção da Galeria (com Lightbox) ---
function createGallerySection(data) {
    if (!data.gallery_section_enabled || !data.gallery_photos || data.gallery_photos.length === 0) return '';
    
    const galleryItems = data.gallery_photos.map((photoUrl, index) => 
        // Adiciona classe 'gallery-item' e data-attributes para o lightbox
        `<button class="gallery-item w-full h-full overflow-hidden rounded-lg shadow-md group" data-gallery-src="${photoUrl}" data-gallery-index="${index}">
            <img src="${photoUrl}" alt="Foto da galeria ${index + 1}" class="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105">
        </button>`
    ).join('');

    return `
        <section id="gallery-section" class="py-16 md:py-20 border-t bg-gray-50">
            <div class="container mx-auto px-6 md:px-8 max-w-5xl">
                <h2 class="text-3xl md:text-4xl font-serif text-center mb-12" style="color: ${data.title_color || '#333333'};">${data.gallery_title || 'Nossos Momentos'}</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${galleryItems}
                </div>
            </div>
        </section>
    `;
}

// --- Seção de Presentes ---
function createGiftsSection(data) {
    const introText = data.gifts_intro_text 
        ? `<p class="text-gray-600 max-w-3xl mx-auto mb-12 text-center leading-relaxed">${data.gifts_intro_text.replace(/\n/g, '<br>')}</p>` 
        : '';
    
    let giftItems = '';

    if (!data.gifts || data.gifts.length === 0) {
        giftItems = '<p class="text-center text-gray-500 col-span-1 md:col-span-3">A lista de presentes ainda não foi adicionada.</p>';
    } else {
        // Ordenação padrão inicial (pode ser alterada pelo select)
        giftItems = data.gifts
            // .sort((a, b) => a.value - b.value) // A ordenação agora é feita pelo evento.js
            .map(gift => `
            <div class="border rounded-lg overflow-hidden card-shadow bg-white">
                <img src="${gift.image_url || 'https://placehold.co/600x400/EFEAE6/967E76?text=Presente'}" alt="${gift.title}" class="w-full h-48 object-cover">
                <div class="p-6 text-center">
                    <h3 class="text-xl font-serif" style="color: ${data.title_color || '#333333'};">${gift.title}</h3>
                    ${gift.description ? `<p class="text-gray-600 my-2 text-sm">${gift.description}</p>` : ''}
                    <p class="text-2xl font-semibold my-4" style="color: ${data.primary_color || '#D9A8A4'};">R$ ${Number(gift.value).toFixed(2).replace('.', ',')}</p>
                    <button data-id="${gift.id}" class="add-to-cart-btn btn-primary w-full">Adicionar ao Carrinho</button>
                </div>
            </div>
        `).join('');
    }

    return `
        <section id="gifts-section" class="gifts-section pt-16 border-t">
            <h2 class="text-3xl md:text-4xl mb-6 font-serif text-center" style="color: ${data.title_color || '#333333'};">Nossa Lista de Presentes</h2>
            ${introText}
            <div class="flex justify-end mb-6">
                <select id="sort-gifts" class="input-styled">
                    <option value="price-asc">Ordenar por Menor Preço</option>
                    <option value="price-desc">Ordenar por Maior Preço</option>
                    <option value="az">Nome (A-Z)</option>
                    <option value="za">Nome (Z-A)</option>
                </select>
            </div>
            <div id="gift-list-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                ${giftItems}
            </div>
        </section>
    `;
}

// --- Seção de RSVP (Confirmação de Presença) ---
function createRsvpSection(data) {
    if (!data.rsvp_enabled) return '';

    return `
        <section id="rsvp-section" class="py-16 md:py-20 border-t">
            <div class="container mx-auto px-6 md:px-8 max-w-lg text-center">
                <h2 class="text-3xl md:text-4xl font-serif mb-8" style="color: ${data.title_color || '#333333'};">Confirme sua Presença</h2>
                <form id="rsvp-form" class="space-y-6 text-left">
                    <div>
                        <label for="rsvp-name" class="block text-sm font-medium text-gray-700 mb-1">Seu nome completo</label>
                        <input type="text" id="rsvp-name" required class="input-styled w-full">
                    </div>
                    <fieldset>
                        <legend class="block text-sm font-medium text-gray-700 mb-2">Você poderá comparecer?</legend>
                        <div class="flex items-center gap-x-6">
                            <label class="flex items-center text-gray-600 cursor-pointer"><input type="radio" name="attending" value="yes" required class="h-4 w-4 mr-2"><span class="ml-2">Sim, estarei lá!</span></label>
                            <label class="flex items-center text-gray-600 cursor-pointer"><input type="radio" name="attending" value="no" class="h-4 w-4 mr-2"><span class="ml-2">Não poderei comparecer</span></label>
                        </div>
                    </fieldset>
                    <!-- CAMPO DE NÚMERO DE CONVIDADOS REMOVIDO -->
                    <div>
                        <label for="rsvp-message" class="block text-sm font-medium text-gray-700 mb-1">Deixe uma mensagem para os noivos (opcional)</label>
                        <textarea id="rsvp-message" rows="4" class="input-styled w-full"></textarea>
                    </div>
                    <div class="text-center pt-4">
                        <button type="button" id="btn-submit-rsvp" class="btn-primary">Enviar Confirmação</button>
                    </div>
                </form>
            </div>
        </section>
    `;
}

// --- Renderização Principal ---
export function render(data) {
     // Formata a data
    const formattedDate = data.event_date 
        ? new Date(data.event_date + 'T12:00:00').toLocaleDateString('pt-BR', {
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })
        : 'Data do Evento';

    // Adiciona a classe de tema ao body
    document.body.classList.add('theme-padrao');
    document.body.classList.remove('theme-moderno'); // Garante que não está no modo moderno

    return `
        <!-- Secção de Capa (Hero) -->
        <header id="hero-section" class="hero-section relative w-full h-[60vh] md:h-[70vh] bg-gray-200">
            <img id="hero-image" src="${data.hero_image_url || 'https://placehold.co/1920x1080/EFEAE6/967E76?text=Foto+do+Casal'}" alt="Foto do Casal" class="w-full h-full object-cover opacity-100 transition-opacity duration-500">
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                <div class="text-center z-10 p-4">
                    <h1 id="hero-title" class="text-5xl md:text-7xl font-serif leading-tight" style="color: ${data.main_title_color || '#FFFFFF'};">${data.main_title || ''}</h1>
                    <p id="hero-date" class="mt-4 text-lg md:text-xl">${formattedDate}</p>
                </div>
            </div>
        </header>

        <!-- Conteúdo Principal -->
        <div id="page-content" class="container mx-auto p-4 md:p-8 max-w-5xl relative z-10">
            <main id="main-content" class="bg-white rounded-xl p-8 md:p-12 text-center card-shadow">
                <section id="intro-section" class="mb-16">
                    <div id="intro-text-container" class="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed text-center space-y-6">
                        ${data.intro_text ? data.intro_text.replace(/\n/g, '<p class="mt-4"></p>') : ''}
                        <p class="font-signature text-4xl mt-8" style="color: ${data.primary_color || '#D9A8A4'};">${data.signature || ''}</p>
                    </div>
                </section>

                ${createStorySection(data)}
                ${createGallerySection(data)}
                ${createGiftsSection(data)}
                ${createRsvpSection(data)}
            </main>
        </div>
         <footer class="py-8 text-center text-gray-600">
            <p>Com amor, ${data.signature || ''} ♥</p>
        </footer>
        
        <!-- Lightbox da Galeria (HTML Oculto) -->
        <div id="gallery-lightbox" class="fixed inset-0 bg-black/90 z-50 hidden items-center justify-center p-4 transition-opacity duration-300 opacity-0 pointer-events-none">
            <button id="lightbox-close" class="absolute top-4 right-4 text-white text-5xl opacity-80 hover:opacity-100">&times;</button>
            <button id="lightbox-prev" class="absolute left-4 md:left-10 text-white text-4xl opacity-80 hover:opacity-100">&#10094;</button>
            <button id="lightbox-next" class="absolute right-4 md:right-10 text-white text-4xl opacity-80 hover:opacity-100">&#10095;</button>
            <img id="lightbox-image" src="" alt="Foto da Galeria" class="max-w-full max-h-[90vh] rounded-lg shadow-2xl transition-transform duration-300 transform scale-95">
        </div>
    `;
}

