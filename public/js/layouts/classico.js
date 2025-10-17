// public/js/layouts/classico.js

function createStorySection(data) {
    if (!data.story_section_enabled) return '';

    return `
        <section id="story-section" class="py-16 md:py-20 border-t">
            <div class="container mx-auto px-6 md:px-8 max-w-4xl text-center">
                <h2 class="text-3xl md:text-4xl font-serif mb-12" style="color: ${data.title_color || '#333333'};">Nossa História</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
                    <img src="${data.story_image_1_url || 'https://placehold.co/600x400/EADFD6/967E76?text=Foto'}" alt="Como nos conhecemos" class="rounded-lg shadow-lg w-full">
                    <div class="text-gray-600 text-left">
                        <h3 class="text-2xl font-serif mb-3" style="color: ${data.title_color || '#333333'};">Como nos Conhecemos</h3>
                        <p class="leading-relaxed">${data.story_how_we_met ? data.story_how_we_met.replace(/\n/g, '<br>') : ''}</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                     <div class="text-gray-600 text-left md:order-2">
                        <h3 class="text-2xl font-serif mb-3" style="color: ${data.title_color || '#333333'};">O Pedido</h3>
                        <p class="leading-relaxed">${data.story_proposal ? data.story_proposal.replace(/\n/g, '<br>') : ''}</p>
                    </div>
                    <div class="md:order-1">
                        <img src="${data.story_image_2_url || 'https://placehold.co/600x400/EADFD6/967E76?text=Foto'}" alt="O pedido" class="rounded-lg shadow-lg w-full">
                    </div>
                </div>
            </div>
        </section>
    `;
}

function createGallerySection(data) {
    if (!data.gallery_section_enabled || !data.gallery_photos || data.gallery_photos.length === 0) return '';
    
    const galleryItems = data.gallery_photos.map((photoUrl, index) => 
        `<div class="overflow-hidden rounded-lg shadow-md"><img src="${photoUrl}" alt="Foto da galeria ${index + 1}" class="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"></div>`
    ).join('');

    return `
        <section id="gallery-section" class="py-16 md:py-20 border-t bg-gray-50">
            <div class="container mx-auto px-6 md:px-8 max-w-5xl">
                <h2 class="text-3xl md:text-4xl font-serif text-center mb-12" style="color: ${data.title_color || '#333333'};">Nossos Momentos</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${galleryItems}
                </div>
            </div>
        </section>
    `;
}

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
                    <div>
                        <label for="rsvp-guests" class="block text-sm font-medium text-gray-700 mb-1">Número de convidados (incluindo você)</label>
                        <input type="number" id="rsvp-guests" min="1" value="1" class="input-styled w-full">
                    </div>
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

export function render(data) {
    return `
        <!-- Secção de Capa (Hero) -->
        <header id="hero-section" class="hero-section relative w-full h-[60vh] md:h-[70vh] bg-gray-200">
            <img id="hero-image" src="${data.hero_image_url || 'https://placehold.co/1920x1080/EFEAE6/967E76?text=Foto+do+Casal'}" alt="Foto do Casal" class="w-full h-full object-cover opacity-0 transition-opacity duration-500">
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                <div class="text-center z-10 p-4">
                    <h1 id="hero-title" class="text-5xl md:text-7xl font-serif leading-tight" style="color: ${data.hero_title_color || '#FFFFFF'};">${data.main_title || ''}</h1>
                    <p id="hero-date" class="mt-4 text-lg md:text-xl"></p>
                </div>
            </div>
        </header>

        <!-- Conteúdo Principal -->
        <div id="page-content" class="container mx-auto p-4 md:p-8 max-w-5xl relative z-10">
            <main id="main-content" class="bg-white rounded-xl p-8 md:p-12 text-center card-shadow">
                <section id="intro-section" class="mb-16">
                    <div id="intro-text-container" class="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed text-center space-y-6">
                        <!-- Parágrafos e assinatura preenchidos pelo casamento.js -->
                    </div>
                </section>

                ${createStorySection(data)}
                ${createGallerySection(data)}

                <section id="gifts-section" class="gifts-section pt-16 border-t">
                    <h2 class="text-3xl md:text-4xl mb-12 font-serif" style="color: ${data.title_color || '#333333'};">Nossa Lista de Presentes</h2>
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

                ${createRsvpSection(data)}
            </main>
        </div>
         <footer class="py-8 text-center text-gray-600">
            <p>Com amor, ${data.couple_signature || ''} ♥</p>
        </footer>
    `;
}
