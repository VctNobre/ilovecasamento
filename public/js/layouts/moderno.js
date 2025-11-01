// public/js/layouts/moderno.js

// Função helper para formatar o texto em parágrafos
function formatTextToParagraphs(text, defaultText = '') {
    if (!text || text.trim() === '') {
        return `<p class="leading-relaxed">${defaultText}</p>`;
    }
    
    return text
        .split('\n') // Divide o texto em parágrafos a cada quebra de linha
        .filter(p => p.trim() !== '') // Remove linhas vazias
        .map(p => `<p class="leading-relaxed mb-4">${p}</p>`) // Envolve cada parágrafo numa tag <p> com margem
        .join(''); // Junta tudo
}


function createStorySection(data) {
    if (!data.story_section_enabled) return '';

    // Helper para renderizar carrossel ou placeholder da História
    const renderStoryCarousel = (images, containerId, imageId, prevId, nextId, counterId, placeholder) => {
        if (!images || images.length === 0) {
            return `<img src="${placeholder}" alt="Foto da história" class="rounded-lg shadow-xl w-full">`;
        }
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
        <section id="story-section" class="py-20 md:py-28">
            <div class="container mx-auto px-6 md:px-8 max-w-4xl">
                <!-- RESTAURADO: Títulos <h2> voltam ao normal (usando .font-serif do CSS) -->
                <h2 class="text-4xl md:text-5xl font-serif text-center mb-16" style="color: ${data.title_color || '#333333'};">${data.story_title_1 || 'Nossa História'}</h2>
                
                <!-- Como nos Conhecemos -->
                <div class="flex flex-col md:flex-row items-center gap-12 md:gap-16 mb-20">
                    <div class="md:w-2/5 text-gray-600 text-center md:text-left">
                        ${formatTextToParagraphs(data.story_how_we_met, 'Texto sobre como nos conhecemos...')}
                    </div>
                    <div class="md:w-3/5">
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
                </div>

                <!-- O Pedido -->
                <!-- RESTAURADO: Títulos <h2> voltam ao normal -->
                <h2 class="text-4xl md:text-5xl font-serif text-center mb-16" style="color: ${data.title_color || '#333333'};">${data.story_title_2 || 'O Pedido'}</h2>
                <div class="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-16">
                    <div class="md:w-2/5 text-gray-600 text-center md:text-left">
                        ${formatTextToParagraphs(data.story_proposal, 'Texto sobre o pedido de casamento...')}
                    </div>
                    <div class="md:w-3/5">
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

function createGallerySection(data) {
    if (!data.gallery_section_enabled || !data.gallery_photos || data.gallery_photos.length === 0) return '';
    
    return `
        <section id="gallery-section" class="py-20 md:py-28 bg-white">
            <div class="container mx-auto px-6 md:px-8 max-w-5xl">
                <!-- RESTAURADO: Títulos <h2> voltam ao normal -->
                <h2 class="text-4xl md:text-5xl font-serif text-center mb-16" style="color: ${data.title_color || '#333333'};">${data.gallery_title || 'Galeria de Fotos'}</h2>
                
                <div id="main-gallery-container" class="relative w-full rounded-lg shadow-xl overflow-hidden" style="aspect-ratio: 16 / 10; user-select: none;">
                    <img id="modern-gallery-image" src="${data.gallery_photos[0]}" alt="Foto da Galeria" class="w-full h-full object-cover transition-opacity duration-300">
                    <button id="modern-gallery-prev" class="gallery-nav-btn absolute left-4 top-1/2 -translate-y-1/2">&#10094;</button>
                    <button id="modern-gallery-next" class="gallery-nav-btn absolute right-4 top-1/2 -translate-y-1/2">&#10095;</button>
                    <div id="modern-gallery-counter" class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm py-1 px-3 rounded-full">
                        1 / ${data.gallery_photos.length}
                    </div>
                </div>
            </div>
        </section>
    `;
}

function createGiftsSection(data) {
    
    const introText = data.gifts_intro_text 
        ? `<p class="text-gray-600 max-w-3xl mx-auto mb-12 text-center leading-relaxed">${data.gifts_intro_text.replace(/\n/g, '<br>')}</p>` 
        : '';

    if (!data.gifts || data.gifts.length === 0) {
        return `
        <section id="gifts-section" class="py-20 md:py-28">
             <div class="container mx-auto px-6 md:px-8 max-w-5xl">
                <!-- RESTAURADO: Títulos <h2> voltam ao normal -->
                <h2 class="text-4xl md:text-5xl font-serif text-center mb-16" style="color: ${data.title_color || '#33333V'};">Lista de Presentes</h2>
                ${introText} <p class="text-center text-gray-500">A lista de presentes ainda não foi adicionada.</p>
            </div>
        </section>
        `;
    }

    const giftItems = data.gifts.map(gift => `
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

    return `
        <section id="gifts-section" class="py-20 md:py-28">
             <div class="container mx-auto px-6 md:px-8 max-w-5xl">
                <!-- RESTAURADO: Títulos <h2> voltam ao normal -->
                <h2 class="text-4xl md:text-5xl font-serif text-center mb-16" style="color: ${data.title_color || '#333333'};">Lista de Presentes</h2>
                ${introText} <div id="gift-list-container" class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
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
                <!-- RESTAURADO: Títulos <h2> voltam ao normal -->
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
        
    // Adiciona a classe de tema ao body
    document.body.classList.remove('theme-padrao'); 
    document.body.classList.add('theme-moderno'); // Garante que está no modo moderno

    return `
        <!-- CORREÇÃO DE LAYOUT: Adicionada a class="hero-section" para o CSS do grid funcionar -->
        <header id="hero-section" class="hero-section relative w-full h-[70vh] md:h-screen overflow-hidden">
            <img id="hero-image" src="${data.hero_image_url || 'https://images.pexels.com/photos/1024989/pexels-photo-1024989.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'}" alt="Foto do Casal" class="w-full h-full object-cover">
            
            <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white p-4">
                <div class="text-center">
                    
                    <!-- CORREÇÃO: Aplica o estilo Montserrat Medium, uppercase e letter-spacing APENAS AQUI -->
                    <!-- Usa font-sans (Montserrat) e font-medium (500) -->
                    <!-- Reduzido o tamanho da fonte para text-4xl / md:text-5xl para ser menos "enorme" -->
                    <h1 class="text-4xl md:text-5xl font-sans font-medium leading-tight uppercase" style="letter-spacing: 6.4px; color: ${data.main_title_color || '#FFFFFF'};">${data.main_title || 'Felipe & Caroline'}</h1>
                    
                    <!-- CORREÇÃO: Aplica o estilo Montserrat Medium, uppercase e letter-spacing APENAS AQUI -->
                    <p class="text-lg md:text-xl mt-4 font-sans font-medium uppercase" style="letter-spacing: 6.4px;">${formattedDate.toUpperCase()}</p>
                </div>
            </div>
        </header>

        <div id="page-content">
            <div id="intro-block" class="bg-beige-extralight text-center py-12 md:py-16">
                <div class="container mx-auto px-6">
                    <div class="text-gray-600 max-w-2xl mx-auto">
                        ${formatTextToParagraphs(data.intro_text)}
                    </div>
                    <!-- RESTAURADO: Assinatura volta a usar .font-signature (Playfair Display Italic) -->
                    <p class="font-signature text-3xl md:text-4xl mt-8" style="color: ${data.title_color || '#333333'};">${data.signature || 'Felipe & Caroline'}</p>
                </div>
            </div>

            <main id="main-content" class="bg-beige-extralight">
                ${createStorySection(data)}
                ${createGallerySection(data)}
                ${createGiftsSection(data)}
                ${createRsvpSection(data)}
            </main>
            
            <footer class="py-8 text-center text-gray-600 bg-beige-extralight">
                <p>Com amor, ${data.signature || 'Anfitriões'} ♥</p>
            </footer>
        </div>

        <!-- Lightbox (inalterado) -->
        <div id="gallery-lightbox" class="fixed inset-0 bg-black/90 z-50 hidden items-center justify-center p-4 transition-opacity duration-300 opacity-0 pointer-events-none">
            <button id="lightbox-close" class="absolute top-4 right-4 text-white text-5xl opacity-80 hover:opacity-100">&times;</button>
            <button id="lightbox-prev" class="absolute left-4 md:left-10 text-white text-4xl opacity-80 hover:opacity-100">&#10094;</button>
            <button id="lightbox-next" class="absolute right-4 md:right-10 text-white text-4xl opacity-80 hover:opacity-100">&#10095;</button>
            <img id="lightbox-image" src="" alt="Foto da Galeria" class="max-w-full max-h-[90vh] rounded-lg shadow-2xl transition-transform duration-300 transform scale-95">
        </div>
    `;
}

