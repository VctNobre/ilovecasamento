// public/js/layouts/classico.js

function createStorySection(data) {
    if (!data.story_section_enabled) return '';

    const hasImages = data.story_image_1_url || data.story_image_2_url;
    const hasText = data.story_how_we_met || data.story_proposal;

    if (!hasImages && !hasText) return '';

    let imagesHtml = '';
    if (hasImages) {
        imagesHtml = `
            <div class="flex flex-col sm:flex-row justify-center items-center gap-8 mb-12">
                ${data.story_image_1_url ? `<img src="${data.story_image_1_url}" alt="Nossa história, foto 1" class="w-full sm:w-1/2 md:w-2/5 rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300">` : ''}
                ${data.story_image_2_url ? `<img src="${data.story_image_2_url}" alt="Nossa história, foto 2" class="w-full sm:w-1/2 md:w-2/5 rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300">` : ''}
            </div>
        `;
    }

    let textHtml = '';
    if (hasText) {
        textHtml = `
            <div class="max-w-3xl mx-auto text-gray-600 text-lg leading-relaxed space-y-8">
                ${data.story_how_we_met ? `<div><h3 class="text-2xl font-title mb-4" style="color: var(--primary-color);">Como nos Conhecemos</h3><p>${data.story_how_we_met.replace(/\n/g, '<br>')}</p></div>` : ''}
                ${data.story_proposal ? `<div><h3 class="text-2xl font-title mb-4" style="color: var(--primary-color);">O Pedido</h3><p>${data.story_proposal.replace(/\n/g, '<br>')}</p></div>` : ''}
            </div>
        `;
    }
    
    return `
        <section id="story-section" class="py-16 border-t">
            <h2 class="text-3xl md:text-4xl mb-12 font-title text-center">Nossa História</h2>
            ${imagesHtml}
            ${textHtml}
        </section>
    `;
}


function createGallerySection(data) {
    if (!data.gallery_section_enabled || !data.gallery_photos || data.gallery_photos.length === 0) return '';
    
    const galleryItems = data.gallery_photos.map(photoUrl => `
        <div class="overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
            <img src="${photoUrl}" alt="Foto da galeria" class="w-full h-full object-cover">
        </div>
    `).join('');

    return `
        <section id="gallery-section" class="py-16 border-t">
            <h2 class="text-3xl md:text-4xl mb-12 font-title text-center">Galeria de Fotos</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                ${galleryItems}
            </div>
        </section>
    `;
}

export function render(data) {
    return `
        <header id="hero-section" class="hero-section relative w-full h-96 md:h-screen bg-gray-200">
            <img id="hero-image" src="" alt="Foto do Casal" class="w-full h-full object-cover opacity-0 transition-opacity duration-500">
            <div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                <div class="text-center z-10 p-4">
                    <div id="monogram-container" class="monogram-container hidden mx-auto mb-4">
                        <span id="monogram-initial-1"></span>
                        <span>&</span>
                        <span id="monogram-initial-2"></span>
                    </div>
                    <h1 id="hero-title" class="text-5xl md:text-7xl font-title" style="color: var(--hero-title-color);"></h1>
                    <p id="hero-date" class="mt-4 text-lg md:text-xl"></p>
                </div>
            </div>
        </header>

        <div id="page-content" class="container mx-auto p-4 md:p-8 max-w-5xl relative z-10" style="margin-top: -8rem;">
            <main id="main-content" class="bg-white rounded-xl p-8 md:p-12 text-center card-shadow">
                <section id="intro-section" class="mb-16">
                    <h2 class="text-3xl md:text-4xl mb-6 font-title" style="color: var(--primary-color);">Bem-vindos!</h2>
                    <div id="intro-text-container" class="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed text-center space-y-6">
                        <!-- Parágrafos e assinatura preenchidos via JS -->
                    </div>
                </section>
                
                ${createStorySection(data)}
                ${createGallerySection(data)}

                <section id="gifts-section" class="gifts-section pt-12 border-t">
                    <h2 class="text-3xl md:text-4xl mb-12 font-title">Nossa Lista de Presentes</h2>
                    <div class="flex justify-end mb-6">
                         <select id="sort-gifts" class="input-styled">
                            <option value="default">Ordenar por</option>
                            <option value="price-asc">Menor Preço</option>
                            <option value="price-desc">Maior Preço</option>
                            <option value="az">Nome (A-Z)</option>
                            <option value="za">Nome (Z-A)</option>
                        </select>
                    </div>
                    <div id="gift-list-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left"></div>
                </section>

                <section id="rsvp-section" class="rsvp-section mt-16 border-t pt-12 hidden">
                     <!-- Formulário de RSVP -->
                </section>
            </main>
        </div>
    `;
}
