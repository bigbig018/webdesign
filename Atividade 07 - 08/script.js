/**
 * @file script.js
 * @description Contém toda a lógica interativa para o Guia de Tipagem Pokémon,
 * incluindo o carrossel de tipos, coloração de cards e funcionalidades de UI/UX.
 * @version 4.0
 */

document.addEventListener('DOMContentLoaded', () => {
    
    /**
     * @namespace Constants
     * @description Constantes e configurações globais para o script.
     */
    const Constants = {
        // Cores para cada tipo de Pokémon
        TYPE_COLORS: {
            'Fogo': '#F08030', 'Água': '#6890F0', 'Planta': '#78C850', 'Elétrico': '#F8D030',
            'Gelo': '#98D8D8', 'Lutador': '#C03028', 'Venenoso': '#A040A0', 'Terrestre': '#E0C068',
            'Voador': '#A890F0', 'Psíquico': '#F85888', 'Inseto': '#A8B820', 'Pedra': '#B8A038',
            'Fantasma': '#705898', 'Dragão': '#7038F8', 'Sombrio': '#705848', 'Aço': '#B8B8D0',
            'Fada': '#EE99AC', 'Normal': '#A8A878'
        },
        // Tipos que devem ter texto preto para melhor legibilidade
        TYPES_WITH_BLACK_TEXT: ['Elétrico', 'Gelo', 'Terrestre', 'Voador', 'Psíquico', 'Inseto', 'Aço', 'Fada', 'Normal'],
        // Configurações do Carrossel
        CAROUSEL_CLONES_COUNT: 5,
        CAROUSEL_GAP: 25,
        CAROUSEL_AUTOSCROLL_INTERVAL: 3000,
        // Configurações do Botão "Voltar ao Topo"
        BACK_TO_TOP_SCROLL_THRESHOLD: 400,
        BACK_TO_TOP_BTN_ID: 'backToTopBtn',
        BACK_TO_TOP_SHOW_CLASS: 'show'
    };

    /**
     * Aplica cores de fundo e de texto aos cards de tipo com base em seu tipo.
     * @returns {void}
     */
    const initTypeCardColors = () => {
        const allTypeCards = document.querySelectorAll('.tipo-card');
        if (allTypeCards.length === 0) return;

        allTypeCards.forEach(card => {
            const type = card.dataset.tipo;
            if (type && Constants.TYPE_COLORS[type]) {
                card.style.backgroundColor = Constants.TYPE_COLORS[type];
                if (Constants.TYPES_WITH_BLACK_TEXT.includes(type)) {
                    card.style.color = '#000';
                    card.style.textShadow = '1px 1px 2px rgba(255,255,255,0.4)';
                }
            }
        });
        console.log("Cores dos cards de tipo inicializadas.");
    };

    /**
     * Inicializa toda a lógica do carrossel de tipos.
     * @returns {void}
     */
    const initCarousel = () => {
        const container = document.querySelector('.tipos-container');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const wrapper = document.querySelector('.carousel-wrapper');
        
        if (!container || !prevBtn || !nextBtn || !wrapper) return;

        let originalCards = Array.from(container.children);
        if (originalCards.length === 0) return;

        const cardWidth = originalCards[0].offsetWidth;
        const cardWidthWithGap = cardWidth + Constants.CAROUSEL_GAP;
        const clonesCount = Constants.CAROUSEL_CLONES_COUNT;
        
        let currentIndex = clonesCount;
        let isTransitioning = false;
        let autoScrollInterval;
        let resizeTimeout;

        const adjustCarousel = () => {
            const screenWidth = window.innerWidth;
            let cardsToShow;
            if (screenWidth > 1200) cardsToShow = 5;
            else if (screenWidth > 992) cardsToShow = 4;
            else if (screenWidth > 768) cardsToShow = 3;
            else if (screenWidth > 550) cardsToShow = 2;
            else cardsToShow = 1;
            const wrapperWidth = (cardWidth * cardsToShow) + (Constants.CAROUSEL_GAP * (cardsToShow - 1));
            wrapper.style.width = `${wrapperWidth}px`;
        };
        
        for (let i = 0; i < clonesCount; i++) {
            container.appendChild(originalCards[i].cloneNode(true));
            container.insertBefore(originalCards[originalCards.length - 1 - i].cloneNode(true), container.firstChild);
        }

        container.style.transform = `translateX(${-cardWidthWithGap * currentIndex}px)`;

        const moveTo = (index) => {
            if (isTransitioning) return;
            isTransitioning = true;
            container.style.transition = 'transform 0.5s ease-in-out';
            currentIndex = index;
            container.style.transform = `translateX(${-cardWidthWithGap * currentIndex}px)`;
        };

        const moveToNext = () => moveTo(currentIndex + 1);
        const moveToPrev = () => moveTo(currentIndex - 1);

        container.addEventListener('transitionend', () => {
            isTransitioning = false;
            const currentCards = Array.from(container.children);
            if (currentIndex >= currentCards.length - clonesCount) {
                container.style.transition = 'none';
                currentIndex = clonesCount;
                container.style.transform = `translateX(${-cardWidthWithGap * currentIndex}px)`;
            }
            if (currentIndex < clonesCount) {
                container.style.transition = 'none';
                currentIndex = currentCards.length - (clonesCount * 2);
                container.style.transform = `translateX(${-cardWidthWithGap * currentIndex}px)`;
            }
        });

        nextBtn.addEventListener('click', moveToNext);
        prevBtn.addEventListener('click', moveToPrev);

        const startAutoScroll = () => {
            stopAutoScroll(); 
            autoScrollInterval = setInterval(moveToNext, Constants.CAROUSEL_AUTOSCROLL_INTERVAL);
        };
        const stopAutoScroll = () => clearInterval(autoScrollInterval);

        wrapper.addEventListener('mouseenter', stopAutoScroll);
        wrapper.addEventListener('mouseleave', startAutoScroll);

        adjustCarousel();
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(adjustCarousel, 150);
        });
        
        startAutoScroll();
        console.log("Carrossel inicializado com sucesso.");
    };

    /**
     * @function initSmoothScroll
     * @description Adiciona rolagem suave para links âncora.
     * @returns {void}
     */
    const initSmoothScroll = () => {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        if (anchorLinks.length === 0) return;

        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId.length <= 1) return;
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        console.log("Rolagem suave inicializada.");
    };

    /**
     * @function initBackToTopButton
     * @description Controla o botão "Voltar ao Topo".
     * @returns {void}
     */
    const initBackToTopButton = () => {
        const backToTopBtn = document.getElementById(Constants.BACK_TO_TOP_BTN_ID);
        if (!backToTopBtn) return;

        const toggleVisibility = () => {
            if (window.pageYOffset > Constants.BACK_TO_TOP_SCROLL_THRESHOLD) {
                backToTopBtn.classList.add(Constants.BACK_TO_TOP_SHOW_CLASS);
            } else {
                backToTopBtn.classList.remove(Constants.BACK_TO_TOP_SHOW_CLASS);
            }
        };

        const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

        window.addEventListener('scroll', toggleVisibility);
        backToTopBtn.addEventListener('click', scrollToTop);
        console.log("Botão 'Voltar ao Topo' inicializado.");
    };
    
    /**
     * @function initScrollAnimations
     * @description Anima elementos conforme entram na tela.
     * @returns {void}
     */
    const initScrollAnimations = () => {
        const elementsToReveal = document.querySelectorAll('.text-box, .card, .tipo-destaque-container');
        if (elementsToReveal.length === 0) return;

        elementsToReveal.forEach(element => element.classList.add('reveal-on-scroll'));

        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

        const handleIntersection = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, observerOptions);
        elementsToReveal.forEach(element => observer.observe(element));
        console.log(`Animação de rolagem inicializada para ${elementsToReveal.length} elementos.`);
    };

    /**
     * @function initPokemonModal
     * @description NOVA FUNCIONALIDADE: Controla o modal de detalhes dos Pokémon.
     * @returns {void}
     */
    const initPokemonModal = () => {
        // Seleciona os elementos do DOM necessários para o modal
        const modal = document.getElementById('pokemonModal');
        if (!modal) {
            console.warn("Elemento do modal não encontrado. Funcionalidade desativada.");
            return;
        }
        
        const closeModalBtn = document.getElementById('closeModalBtn');
        const modalImage = document.getElementById('modalPokemonImage');
        const modalName = document.getElementById('modalPokemonName');
        const modalDescription = document.getElementById('modalPokemonDescription');
        const pokemonCards = document.querySelectorAll('.pokemon-card');

        /**
         * Abre o modal e popula com os dados do Pokémon clicado.
         * @param {string} name - O nome do Pokémon.
         * @param {string} imgSrc - A URL da imagem do Pokémon.
         * @param {string} description - A descrição do Pokémon.
         */
        const openModal = (name, imgSrc, description) => {
            // Atualiza o conteúdo do modal
            modalImage.src = imgSrc;
            modalImage.alt = name;
            modalName.textContent = name;
            modalDescription.textContent = description;
            
            // Exibe o modal
            modal.classList.add('visible');
            // Impede a rolagem da página de fundo
            document.body.classList.add('modal-open');
        };

        /**
         * Fecha o modal.
         */
        const closeModal = () => {
            modal.classList.remove('visible');
            document.body.classList.remove('modal-open');
        };

        // Adiciona um listener de evento para cada card de Pokémon
        pokemonCards.forEach(card => {
            card.style.cursor = 'pointer'; // Muda o cursor para indicar que é clicável
            card.addEventListener('click', () => {
                // Pega os dados diretamente do card que foi clicado
                const name = card.querySelector('h4').textContent;
                const imgSrc = card.querySelector('img').src;
                const description = card.querySelector('p').textContent;
                
                openModal(name, imgSrc, description);
            });
        });

        // Adiciona listener para o botão de fechar
        closeModalBtn.addEventListener('click', closeModal);

        // Adiciona listener para fechar o modal ao clicar na área escura (overlay)
        modal.addEventListener('click', (event) => {
            // Se o clique foi no overlay e não no conteúdo do modal
            if (event.target === modal) {
                closeModal();
            }
        });

        // Adiciona listener para fechar o modal com a tecla 'Escape'
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.classList.contains('visible')) {
                closeModal();
            }
        });

        console.log("Modal de detalhes dos Pokémon inicializado.");
    };

    /**
     * @function main
     * @description Função principal que inicializa todos os módulos do script.
     */
    const main = () => {
        console.log("Iniciando scripts do Guia Pokémon...");
        initTypeCardColors();
        initCarousel();
        initSmoothScroll();
        initBackToTopButton();
        initScrollAnimations();
        initPokemonModal();
        console.log("Todos os scripts foram carregados.");
    };

    main();
});