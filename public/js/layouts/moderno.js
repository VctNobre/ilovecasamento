// public/js/layouts/moderno.js

function createStorySection(data) {
    if (!data.story_section_enabled) return '';

    return `
        <section id="story-section" class="py-20 md:py-28">
            <div class="container mx-auto px-6 md:px-8 max-w-4xl">
                <h2 class="text-4xl md:text-5xl font-serif text-center mb-16" style="color: ${data.title_color || '#333333'};">${data.story_title_1 || 'Nossa História'}</h2>
                
                <!-- Como nos Conhecemos --><div class="flex flex-col md:flex-row items-center gap-12 md:gap-16 mb-20">
                    <div class="md:w-1/2 text-gray-600 text-center md:text-left">
                        <p class="leading-relaxed">${data.story_how_we_met ? data.story_how_we_met.replace(/\n/g, '<br>') : 'Texto sobre como nos conhecemos...'}</p>
                    </div>
                    <div class="md:w-1/2">
                        <img src="${data.story_image_1_url || 'https://placehold.co/600x400/EADFD6/967E76?text=Foto+1'}" alt="Como nos conhecemos" class="rounded-lg shadow-xl w-full">
                    </div>
                </div>

                <!-- O Pedido --><h2 class="text-4xl md:text-5xl font-serif text-center mb-16" style="color: ${data.title_color || '#333333'};">${data.story_title_2 || 'O Pedido'}</h2>
                <div class="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-16">
                    <div class="md:w-1/2 text-gray-600 text-center md:text-left">
                        <p class="leading-relaxed">${data.story_proposal ? data.story_proposal.replace(/\n/g, '<br>') : 'Texto sobre o pedido de casamento...'}</p>
                    </div>
                    <div class="md:w-1/2">
                        <img src="${data.story_image_2_url || 'https://placehold.co/600x400/EADFD6/967E76?text=Foto+2'}" alt="O pedido" class="rounded-lg shadow-xl w-full">
                    </div>
                </div>
            </div>
        </section>
    `;
}

function createGallerySection(data) {
    if (!data.gallery_section_enabled || !data.gallery_photos || data.gallery_photos.length === 0) return '';
    
    const galleryItems = data.gallery_photos.map((photoUrl, index) => 
        // Adiciona classe 'gallery-item' e data-attributes para o lightbox
        `<button class="gallery-item overflow-hidden rounded-lg shadow-lg group" data-gallery-src="${photoUrl}" data-gallery-index="${index}">
            <img src="${photoUrl}" alt="Foto da galeria ${index + 1}" class="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105">
        </button>`
    ).join('');

    return `
        <section id="gallery-section" class="py-20 md:py-28 bg-white">
            <div class="container mx-auto px-6 md:px-8 max-w-5xl">
                <!-- CORREÇÃO: Usa o título da galeria do banco de dados --><h2 class="text-4xl md:text-5xl font-serif text-center mb-16" style="color: ${data.title_color || '#333333'};">${data.gallery_title || 'Galeria de Fotos'}</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    ${galleryItems}
                </div>
            </div>
        </section>
    `;
}

function createGiftsSection(data) {
    
    // CORREÇÃO: Define o texto de introdução
    const introText = data.gifts_intro_text 
        ? `<p class="text-gray-600 max-w-3xl mx-auto mb-12 text-center leading-relaxed">${data.gifts_intro_text.replace(/\n/g, '<br>')}</p>` 
        : '';

    if (!data.gifts || data.gifts.length === 0) {
        return `
        <section id="gifts-section" class="py-20 md:py-28">
             <div class="container mx-auto px-6 md:px-8 max-w-5xl">
                <h2 class="text-4xl md:text-5xl font-serif text-center mb-16" style="color: ${data.title_color || '#33333V'};">Lista de Presentes</h2>
                ${introText} <!-- Adicionado aqui --><p class="text-center text-gray-500">A lista de presentes ainda não foi adicionada.</p>
            </div>
        </section>
        `;
    }

    const giftItems = data.gifts.map(gift => `
        <div class="gift-card text-center">
            <div class="bg-white p-4 rounded-lg shadow-md mb-4">
                <img src="${gift.image_url || 'https://placehold.co/400x300/F9F5F2/967E76?text=Presente'}" alt="${gift.title}" class="w-full h-48 object-contain rounded-md">
            </div>
            <h3 class="text-lg font-semibold text-gray-700">${gift.title}</h3>
            <p class="text-gray-500 mb-4">R$ ${Number(gift.value).toFixed(2).replace('.', ',')}</p>
            <button data-id="${gift.id}" class="add-to-cart-btn btn-contribute">Contribuir</button>
        </div>
    `).join('');

    return `
        <section id="gifts-section" class="py-20 md:py-28">
             <div class="container mx-auto px-6 md:px-8 max-w-5xl">
                <h2 class="text-4xl md:text-5xl font-serif text-center mb-16" style="color: ${data.title_color || '#333333'};">Lista de Presentes</h2>
                ${introText} <!-- Adicionado aqui --><div id="gift-list-container" class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
                    ${giftItems}
                </div>
            </div>
        </section>
    `;
}


function createRsvpSection(data) {
    if (!data.rsvp_enabled) return '';

    return `
        <section id="rsvp-section" class="py-20 md:py-28 bg-beige-light">
            <div class="container mx-auto px-6 md:px-8 max-w-2xl">
                <h2 class="text-4xl md:text-5xl font-serif text-center mb-12" style="color: ${data.title_color || '#333333'};">Confirme sua Presença</h2>
                <form id="rsvp-form" class="space-y-6">
                    <div>
                        <label for="rsvp-name" class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <input type="text" id="rsvp-name" required class="rsvp-input">
                    </div>
                    <fieldset>
                        <legend class="block text-sm font-medium text-gray-700 mb-2">Presença confirmada</legend>
                        <div class="flex items-center gap-x-6">
                            <label class="flex items-center text-gray-600"><input type="radio" name="attending" value="yes" required class="h-4 w-4 mr-2"><span class="ml-2">Sim</span></label>
                            <label class="flex items-center text-gray-600"><input type="radio" name="attending" value="no" class="h-4 w-4 mr-2"><span class="ml-2">Não</span></label>
                        </div>
                    </fieldset>
                    <div>
                        <label for="rsvp-guests" class="block text-sm font-medium text-gray-700 mb-1">Acompanhantes</label>
                        <input type="number" id="rsvp-guests" min="0" value="0" class="rsvp-input">
                    </div>
                    <div>
                        <label for="rsvp-message" class="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                        <textarea id="rsvp-message" rows="4" class="rsvp-input"></textarea>
                    </div>
                    <div class="text-center pt-4">
                        <button type="button" id="btn-submit-rsvp" class="btn-contribute">Enviar</button>
                    </div>
                </form>
            </div>
        </section>
    `;
}

export function render(data) {
    // Formata a data para um estilo mais elegante, ex: "25 de Novembro de 2025"
    const formattedDate = data.event_date 
        ? new Date(data.event_date + 'T12:00:00').toLocaleDateString('pt-BR', {
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })
        : 'Data do Casamento';

    return `
        <!-- Cabeçalho com Imagem de Capa e Overlay --><header class="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
            <img id="hero-image" src="${data.hero_image_url || 'https://images.pexels.com/photos/1024989/pexels-photo-1024989.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'}" alt="Foto do Casal" class="w-full h-full object-cover">
            
            <!-- Overlay para legibilidade --><div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white p-4">
                <div class="text-center">
                    <h1 class="text-5xl md:text-7xl font-serif leading-tight" style="color: ${data.main_title_color || '#FFFFFF'};">${data.main_title || 'Felipe & Caroline'}</h1>
                    <p class="text-xl md:text-2xl mt-4">${formattedDate}</p>
                </div>
            </div>
        </header>

        <!-- Bloco de Introdução (agora sem o título e a data) --><div id="intro-block" class="bg-beige-extralight text-center py-12 md:py-16">
            <div class="container mx-auto px-6">
                ${data.intro_text ? `
                    <div class="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        ${data.intro_text.replace(/\n/g, '<br>')}
                    </div>
                ` : ''}
                <p class="font-signature text-3xl md:text-4xl mt-8" style="color: ${data.title_color || '#333333'};">${data.signature || 'Felipe & Caroline'}</p>
            </div>
        </div>

        <!-- Conteúdo Principal --><main id="main-content" class="bg-beige-extralight">
            ${createStorySection(data)}
            ${createGallerySection(data)}
            ${createGiftsSection(data)}
            ${createRsvpSection(data)}
        </main>
        
        <footer class="py-8 text-center text-gray-600 bg-beige-extralight">
            <p>Com amor, ${data.signature || 'Anfitriões'} ♥</p>
        </footer>

        <!-- Adicionando o HTML do Lightbox para consistência (ele é controlado pelo evento.js) --><div id="gallery-lightbox" class="fixed inset-0 bg-black/90 z-50 hidden items-center justify-center p-4 transition-opacity duration-300 opacity-0 pointer-events-none">
            <button id="lightbox-close" class="absolute top-4 right-4 text-white text-5xl opacity-80 hover:opacity-100">&times;</button>
            <button id="lightbox-prev" class="absolute left-4 md:left-10 text-white text-4xl opacity-80 hover:opacity-100">&#10094;</button>
            <button id="lightbox-next" class="absolute right-4 md:right-10 text-white text-4xl opacity-80 hover:opacity-100">&#10095;</button>
            <img id="lightbox-image" src="" alt="Foto da Galeria" class="max-w-full max-h-[90vh] rounded-lg shadow-2xl transition-transform duration-300 transform scale-95">
        </div>
    `;
}

