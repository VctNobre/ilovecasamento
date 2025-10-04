// public/js/layouts/moderno.js

function createStorySection(data) {
    if (!data.story_section_enabled) return '';
    
    const hasText = data.story_how_we_met || data.story_proposal;
    if (!data.story_image_1_url && !hasText) return '';

    // Adiciona um container flex principal para alinhar itens verticalmente
    return `
        <section id="story-section" class="py-16 md:py-20">
            <h2 class="text-3xl md:text-4xl mb-12 font-title text-center md:text-left">Nossa História</h2>
            <div class="flex flex-col md:flex-row items-center gap-12 md:gap-16">
                
                ${data.story_image_1_url ? `
                    <div class="flex-shrink-0 w-full md:w-1/3">
                        <img src="${data.story_image_1_url}" alt="Nossa história" class="rounded-full w-64 h-64 md:w-full md:h-auto object-cover mx-auto shadow-2xl aspect-square">
                    </div>
                ` : ''}

                <div class="flex-grow text-center md:text-left text-gray-600 leading-relaxed space-y-6">
                    ${data.story_how_we_met ? `<div><h3 class="text-2xl font-title mb-3" style="color: var(--primary-color);">Como nos Conhecemos</h3><p>${data.story_how_we_met.replace(/\n/g, '<br>')}</p></div>` : ''}
                    ${data.story_proposal ? `<div><h3 class="text-2xl font-title mb-3" style="color: var(--primary-color);">O Pedido</h3><p>${data.story_proposal.replace(/\n/g, '<br>')}</p></div>` : ''}
                </div>
                
                 ${data.story_image_2_url ? `
                    <div class="flex-shrink-0 w-full md:w-1/5 mt-8 md:mt-0">
                        <img src="${data.story_image_2_url}" alt="Detalhe da nossa história" class="rounded-lg w-full object-cover mx-auto shadow-xl">
                    </div>
                ` : ''}
            </div>
        </section>
    `;
}

function createGallerySection(data) {
    if (!data.gallery_section_enabled || !data.gallery_photos || data.gallery_photos.length === 0) return '';
    
    const galleryItems = data.gallery_photos.map((photoUrl, index) => {
        // Aplica classes diferentes para criar o efeito masonry
        const spanClass = (index % 5 === 0 || index % 5 === 3) ? 'md:col-span-2 md:row-span-2' : '';
        return `
            <div class="overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 ${spanClass}">
                <img src="${photoUrl}" alt="Foto da galeria ${index + 1}" class="w-full h-full object-cover">
            </div>
        `;
    }).join('');

    return `
        <section id="gallery-section" class="py-16 md:py-20 border-t">
            <h2 class="text-3xl md:text-4xl mb-12 font-title text-center md:text-left">Nossos Momentos</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] gap-4">
                ${galleryItems}
            </div>
        </section>
    `;
}


export function render(data) {
    return `
        <!-- Coluna da Esquerda (Fixa no Desktop) -->
        <header id="hero-section" class="hero-section relative w-full h-96 md:h-screen bg-gray-200">
            <img id="hero-image" src="" alt="Foto do Casal" class="w-full h-full object-cover opacity-0 transition-opacity duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end text-white p-8 md:p-12">
                <div class="z-10">
                     <h1 id="hero-title" class="text-5xl md:text-6xl font-title leading-tight" style="color: var(--hero-title-color);"></h1>
                    <p id="hero-date" class="mt-2 text-lg md:text-xl"></p>
                </div>
            </div>
        </header>

        <!-- Coluna da Direita (Scroll) -->
        <div id="page-content">
            <main id="main-content" class="p-8 md:p-12 lg:p-16">
                <section id="intro-section" class="mb-16 md:mb-20 text-center md:text-left">
                    <div id="intro-text-container" class="text-gray-600 text-lg max-w-3xl leading-relaxed space-y-6">
                        <!-- Parágrafos e assinatura -->
                    </div>
                </section>
                
                ${createStorySection(data)}
                ${createGallerySection(data)}

                <section id="gifts-section" class="gifts-section pt-16 md:pt-20 border-t">
                    <h2 class="text-3xl md:text-4xl mb-12 font-title text-center md:text-left">Nossa Lista de Presentes</h2>
                    <div class="flex justify-end mb-6">
                        <select id="sort-gifts" class="input-styled">
                            <option value="default">Ordenar por</option>
                            <option value="price-asc">Menor Preço</option>
                            <option value="price-desc">Maior Preço</option>
                            <option value="az">Nome (A-Z)</option>
                            <option value="za">Nome (Z-A)</option>
                        </select>
                    </div>
                    <div id="gift-list-container" class="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"></div>
                </section>

                <section id="rsvp-section" class="rsvp-section mt-16 md:mt-20 border-t pt-12 hidden">
                    <!-- Formulário de RSVP -->
                </section>
            </main>
        </div>
    `;
}

