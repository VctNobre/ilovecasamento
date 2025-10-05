// public/js/layouts/moderno.js

function createMonogram(title) {
    if (!title) return '';
    const cleanedTitle = title.replace(/\s*&\s*|\s+e\s+|\s+and\s+/i, ' ').trim();
    const names = cleanedTitle.split(/\s+/);
    if (names.length < 2) return '';
    const initial1 = names[0].charAt(0).toUpperCase();
    const initial2 = names[names.length - 1].charAt(0).toUpperCase();

    return `
        <div id="monogram-container" class="absolute top-8 left-8 text-white border-2 border-white rounded-full w-24 h-24 flex items-center justify-center text-4xl font-title opacity-80">
            <span id="monogram-initial-1">${initial1}</span>
            <span class="mx-1">&</span>
            <span id="monogram-initial-2">${initial2}</span>
        </div>
    `;
}


function createStorySection(data) {
    if (!data.story_section_enabled) return '';
    const hasText = data.story_how_we_met || data.story_proposal;
    if (!data.story_image_1_url && !hasText) return '';

    return `
        <section id="story-section" class="py-16 md:py-20 max-w-4xl mx-auto">
            <h2 class="text-3xl md:text-4xl mb-12 font-title text-center">Nossa História</h2>
            <div class="relative flex flex-col md:flex-row items-center gap-12 md:gap-16">
                
                ${data.story_image_1_url ? `
                    <div class="flex-shrink-0 w-full md:w-2/5 relative">
                        <div class="absolute -top-4 -left-4 w-full h-full bg-[color:var(--primary-color)] bg-opacity-20 rounded-2xl transform -rotate-3"></div>
                        <div class="relative story-image-clip">
                            <img src="${data.story_image_1_url}" alt="Nossa história" class="w-full object-cover mx-auto shadow-2xl aspect-square">
                        </div>
                    </div>
                ` : ''}

                <div class="flex-grow text-center md:text-left text-gray-600 leading-relaxed space-y-8 md:w-3/5">
                    ${data.story_how_we_met ? `<div><h3 class="text-2xl font-title mb-3" style="color: var(--primary-color);">Como nos Conhecemos</h3><p>${data.story_how_we_met.replace(/\n/g, '<br>')}</p></div>` : ''}
                    ${data.story_proposal ? `<div><h3 class="text-2xl font-title mb-3" style="color: var(--primary-color);">O Pedido</h3><p>${data.story_proposal.replace(/\n/g, '<br>')}</p></div>` : ''}
                </div>
            </div>
            ${data.story_image_2_url ? `
                <div class="w-full md:w-1/4 mt-12 md:-mt-16 ml-auto">
                    <img src="${data.story_image_2_url}" alt="Detalhe da nossa história" class="rounded-lg w-full object-cover mx-auto shadow-xl transform hover:scale-105 transition-transform duration-300">
                </div>
            ` : ''}
        </section>
    `;
}

function createGallerySection(data) {
    if (!data.gallery_section_enabled || !data.gallery_photos || data.gallery_photos.length === 0) return '';
    
    const galleryItems = data.gallery_photos.map((photoUrl, index) => {
        // A classe 'aspect-square' garante que a proporção da imagem seja 1:1 (quadrada)
        return `
            <div class="gallery-item overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 relative aspect-square">
                <img src="${photoUrl}" alt="Foto da galeria ${index + 1}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
        `;
    }).join('');

    return `
        <section id="gallery-section" class="py-16 md:py-20 border-t max-w-6xl mx-auto">
            <h2 class="text-3xl md:text-4xl mb-12 font-title text-center">Nossos Momentos</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                ${galleryItems}
            </div>
        </section>
    `;
}

function createRsvpSection(data) {
    if (!data.rsvp_enabled) return '';

    return `
        <section id="rsvp-section" class="rsvp-section mt-16 md:mt-20 border-t pt-16 max-w-3xl mx-auto">
             <h2 class="text-3xl md:text-4xl mb-12 font-title text-center">Confirme sua Presença</h2>
            <form id="rsvp-form" class="max-w-xl mx-auto space-y-6">
                <div>
                    <label for="rsvp-name" class="block text-sm font-medium text-gray-700 mb-1">Seu nome completo</label>
                    <input type="text" id="rsvp-name" required class="input-styled w-full">
                </div>
                <fieldset>
                    <legend class="block text-sm font-medium text-gray-700 mb-2">Você poderá comparecer?</legend>
                    <div class="flex items-center gap-x-6">
                        <label class="flex items-center">
                            <input type="radio" name="attending" value="yes" required class="h-4 w-4 text-[color:var(--primary-color)] focus:ring-[color:var(--primary-color)] border-gray-300">
                            <span class="ml-2">Sim, estarei lá!</span>
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="attending" value="no" class="h-4 w-4 text-[color:var(--primary-color)] focus:ring-[color:var(--primary-color)] border-gray-300">
                            <span class="ml-2">Não poderei comparecer</span>
                        </label>
                    </div>
                </fieldset>
                <div>
                    <label for="rsvp-guests" class="block text-sm font-medium text-gray-700 mb-1">Número de convidados (incluindo você)</label>
                    <input type="number" id="rsvp-guests" min="1" value="1" class="input-styled w-full">
                </div>
                <div>
                    <label for="rsvp-message" class="block text-sm font-medium text-gray-700 mb-1">Deixe uma mensagem para os noivos (opcional)</label>
                    <textarea id="rsvp-message" rows="4" class="input-styled w-full"></textarea>
                </div>
                <div class="text-center">
                    <button type="button" id="btn-submit-rsvp" class="btn-primary">Enviar Confirmação</button>
                </div>
            </form>
        </section>
    `;
}

export function render(data) {
    return `
        <!-- Cabeçalho de ecrã inteiro -->
        <header id="hero-section" class="hero-section relative w-full h-screen bg-gray-200">
            <img id="hero-image" src="" alt="Foto do Casal" class="w-full h-full object-cover opacity-0 transition-opacity duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end text-white p-8 md:p-12">
                ${createMonogram(data.main_title)}
                <div class="z-10">
                     <h1 id="hero-title" class="text-5xl md:text-6xl font-title leading-tight" style="color: var(--hero-title-color);"></h1>
                    <p id="hero-date" class="mt-2 text-lg md:text-xl"></p>
                </div>
            </div>
        </header>

        <!-- Conteúdo principal que rola abaixo do cabeçalho -->
        <div id="page-content">
            <main id="main-content" class="p-8 md:p-12 lg:p-16">
                <section id="intro-section" class="mb-16 md:mb-20 text-center max-w-3xl mx-auto">
                    <div id="intro-text-container" class="text-gray-600 text-lg leading-relaxed space-y-6">
                        <!-- Parágrafos e assinatura -->
                    </div>
                </section>
                
                ${createStorySection(data)}
                ${createGallerySection(data)}

                <section id="gifts-section" class="gifts-section pt-16 md:pt-20 border-t max-w-5xl mx-auto">
                    <h2 class="text-3xl md:text-4xl mb-12 font-title text-center">Nossa Lista de Presentes</h2>
                    <div class="flex justify-end mb-6">
                        <select id="sort-gifts" class="input-styled">
                            <option value="default">Ordenar por</option>
                            <option value="price-asc">Menor Preço</option>
                            <option value="price-desc">Maior Preço</option>
                            <option value="az">Nome (A-Z)</option>
                            <option value="za">Nome (Z-A)</option>
                        </select>
                    </div>
                    <div id="gift-list-container" class="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left"></div>
                </section>

                ${createRsvpSection(data)}
            </main>
        </div>
    `;
}

