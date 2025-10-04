// public/js/layouts/classico.js

// Funções auxiliares para gerar partes do HTML
function createGallery(photos) {
    if (!photos || photos.length === 0) return '';
    return photos.map(photo => `<img src="${photo}" alt="Foto da galeria" class="w-full rounded-lg shadow-md">`).join('');
}

// A função principal que gera o HTML do tema
export function render(data) {
    return `
        <!-- Secção de Capa (Hero) -->
        <header id="hero-section" class="hero-section relative w-full bg-gray-200">
            <img id="hero-image" src="${data.hero_image_url || ''}" alt="Foto do Casal" class="w-full h-auto object-cover opacity-0 transition-opacity duration-500">
            <div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                <div class="text-center z-10 p-4">
                    <!-- Monograma, Título e Data -->
                </div>
            </div>
        </header>

        <!-- Conteúdo Principal -->
        <div id="page-content" class="container mx-auto p-4 md:p-8 max-w-5xl relative z-10">
            <main id="main-content" class="bg-white rounded-xl p-8 md:p-12 text-center card-shadow">
                <section id="intro-section" class="mb-16">
                    <h2 class="text-3xl md:text-4xl mb-6 font-title" style="color: var(--primary-color);">Bem-vindos!</h2>
                    <div id="intro-text-container" class="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed text-center space-y-6">
                        <!-- Parágrafos e assinatura -->
                    </div>
                </section>

                <section id="gifts-section" class="gifts-section pt-12 border-t">
                    <h2 class="text-3xl md:text-4xl mb-12 font-title">Nossa Lista de Presentes</h2>
                    <div class="flex justify-end mb-6">
                        <!-- Seletor de ordenação -->
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
