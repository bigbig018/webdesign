document.addEventListener('DOMContentLoaded', () => {
    // --- 1. LÓGICA DE COLORIR OS CARDS (PERMANECE IGUAL) ---
    const tipoCores = {
        'Fogo': '#F08030', 'Água': '#6890F0', 'Planta': '#78C850', 'Elétrico': '#F8D030',
        'Gelo': '#98D8D8', 'Lutador': '#C03028', 'Venenoso': '#A040A0', 'Terrestre': '#E0C068',
        'Voador': '#A890F0', 'Psíquico': '#F85888', 'Inseto': '#A8B820', 'Pedra': '#B8A038',
        'Fantasma': '#705898', 'Dragão': '#7038F8', 'Sombrio': '#705848', 'Aço': '#B8B8D0',
        'Fada': '#EE99AC', 'Normal': '#A8A878'
    };
    const textoPreto = ['Elétrico', 'Gelo', 'Terrestre', 'Voador', 'Psíquico', 'Inseto', 'Aço', 'Fada', 'Normal'];
    
    const allCards = document.querySelectorAll('.tipo-card');
    allCards.forEach(card => {
        const tipo = card.dataset.tipo;
        if (tipo && tipoCores[tipo]) {
            card.style.backgroundColor = tipoCores[tipo];
            if (textoPreto.includes(tipo)) {
                card.style.color = '#000';
                card.style.textShadow = '1px 1px 2px rgba(255,255,255,0.4)';
            }
        }
    });

    // --- 2. LÓGICA DO CARROSSEL (AGORA RESPONSIVA) ---
    const container = document.querySelector('.tipos-container');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const wrapper = document.querySelector('.carousel-wrapper');
    
    if (!container || !prevBtn || !nextBtn || !wrapper) return;

    let cards = Array.from(container.children);
    if (cards.length === 0) return;

    const gap = 25;
    const cardWidth = cards[0].offsetWidth;
    const clonesCount = 5;
    let currentIndex = clonesCount;
    let isTransitioning = false;
    let autoScrollInterval;

    // --- NOVA FUNÇÃO PARA AJUSTAR O CARROSSEL AO TAMANHO DA TELA ---
    const adjustCarousel = () => {
        const screenWidth = window.innerWidth;
        let cardsToShow;

        if (screenWidth > 1200) {
            cardsToShow = 5; // Desktop
        } else if (screenWidth > 992) {
            cardsToShow = 4; // Laptop / Tablet grande
        } else if (screenWidth > 768) {
            cardsToShow = 3; // Tablet
        } else {
            cardsToShow = 2; // Celular
        }

        // Calcula a nova largura do wrapper
        const wrapperWidth = (cardWidth * cardsToShow) + (gap * (cardsToShow - 1));
        wrapper.style.width = `${wrapperWidth}px`;
    };

    // Ajusta o carrossel quando a página carrega
    adjustCarousel();

    // Adiciona um listener para ajustar o carrossel sempre que a janela for redimensionada
    let resizeTimeout;
    window.addEventListener('resize', () => {
        // Usa um "debounce" para não executar a função excessivamente durante o redimensionamento
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(adjustCarousel, 100);
    });
    // --- FIM DA LÓGICA RESPONSIVA ---

    const cardWidthWithGap = cardWidth + gap;

    for (let i = 0; i < clonesCount; i++) {
        container.appendChild(cards[i].cloneNode(true));
        container.insertBefore(cards[cards.length - 1 - i].cloneNode(true), container.firstChild);
    }

    container.style.transform = `translateX(${-cardWidthWithGap * currentIndex}px)`;

    const moveTo = (index) => {
        isTransitioning = true;
        container.style.transition = 'transform 0.5s ease-in-out';
        currentIndex = index;
        container.style.transform = `translateX(${-cardWidthWithGap * currentIndex}px)`;
    };

    const moveToNext = () => {
        if (isTransitioning) return;
        moveTo(currentIndex + 1);
    };

    const moveToPrev = () => {
        if (isTransitioning) return;
        moveTo(currentIndex - 1);
    };

    container.addEventListener('transitionend', () => {
        isTransitioning = false;
        cards = Array.from(container.children);

        if (currentIndex >= cards.length - clonesCount) {
            container.style.transition = 'none';
            currentIndex = clonesCount;
            container.style.transform = `translateX(${-cardWidthWithGap * currentIndex}px)`;
        }

        if (currentIndex <= clonesCount - 1) {
            container.style.transition = 'none';
            currentIndex = cards.length - (clonesCount * 2);
            container.style.transform = `translateX(${-cardWidthWithGap * currentIndex}px)`;
        }
    });

    nextBtn.addEventListener('click', moveToNext);
    prevBtn.addEventListener('click', moveToPrev);

    const startAutoScroll = () => {
        autoScrollInterval = setInterval(moveToNext, 3000);
    };

    const stopAutoScroll = () => {
        clearInterval(autoScrollInterval);
    };

    startAutoScroll();

    wrapper.addEventListener('mouseenter', stopAutoScroll);
    wrapper.addEventListener('mouseleave', startAutoScroll);
});
