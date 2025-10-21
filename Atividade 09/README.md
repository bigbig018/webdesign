# Aurora Studios — Projeto Web (Atividade 09)

Este repositório contém uma pequena página institucional estática para o estúdio fictício "Aurora Studios". O objetivo do projeto é demonstrar práticas de HTML semântico, CSS modularizado e JavaScript vanilla para comportamentos de interface. Este README descreve, em detalhes, as funcionalidades implementadas, a estrutura de arquivos, o comportamento de cada componente e dicas rápidas de manutenção.

Observação: o conteúdo deste README está escrito em português e documenta as funcionalidades que aparecem nos arquivos HTML, CSS e JavaScript do projeto — como menu responsivo, alternância de tema, carrossel, galeria com lazy-loading, formulários com rascunho local e observadores de interseção.

---

Índice

1. Visão geral do projeto
2. Estrutura de arquivos
3. Funcionalidades principais
   - Navegação e menu responsivo
   - Controle de tema (claro/escuro)
   - Carrossel de imagens
   - Galeria com lazy-loading e controles
   - Formulário de contato com rascunho local
   - Observers e animações de entrada (reveal)
   - Atalhos de teclado e acessibilidade
4. Como executar localmente
5. Notas sobre CSS e design tokens
6. Notas sobre o JavaScript (script.js)
7. Boas práticas e sugestões de melhoria
8. Histórico de mudanças
9. Contato e créditos

---

1. Visão geral do projeto

Aurora Studios é um site estático com várias páginas (Home, Sobre, Galeria, Serviços, Contato) que visa demonstrar:

- HTML semântico e estruturas de conteúdo claras (sections, headers, footers, nav, main).
- Uso de CSS para tema, layout e componentes reutilizáveis.
- JavaScript vanilla para interações: menu responsivo, alternância de tema, carrossel, construção dinâmica de galeria, lazy-loading de imagens e formulários com rascunho salvo no armazenamento local do navegador (localStorage).

O projeto é intencionalmente simples e serve como base para exercícios de frontend e estudos de usabilidade e acessibilidade.


2. Estrutura de arquivos

A raiz do projeto contém os seguintes arquivos e pastas:

- `index.html` — Página inicial (Home).
- `about.html` — Página "Sobre" com seções institucionais.
- `gallery.html` — Página de galeria com filtros e grade masonry.
- `services.html` — Página de serviços e pacotes.
- `contact.html` — Página de contato com formulário.
- `style.css` — Folha de estilos principal que define temas, layout e utilitários.
- `script.js` — Arquivo JavaScript que inicializa comportamentos de UI.
- `assets/` — Pasta para imagens e recursos (used como mock em scripts).
- `README.md` — Este arquivo de documentação (adicionado nesta atividade).

Cada página HTML referencia `style.css` e carrega `script.js` com o atributo `defer` para que o JavaScript seja executado após o parse do HTML.


3. Funcionalidades principais

Abaixo descrevo cada funcionalidade implementada no projeto, seu comportamento, pontos de atenção e como testá-la.

3.1 Navegação e menu responsivo

- Comportamento:
  - O cabeçalho (`header.site-header`) contém a marca e a navegação principal (`nav.main-nav`).
  - Em telas grandes, a lista de navegação (`.nav-list`) é exibida como um menu horizontal.
  - Em telas pequenas (media query até 640px), a `.nav-list` é escondida e um botão `.nav-toggle` é mostrado. Esse botão controla a visibilidade do menu e o atributo `aria-expanded` para acessibilidade.

- Implementação no JavaScript:
  - `initNav()` (implementado em `script.js`) adiciona listeners ao botão `.nav-toggle` para alternar classes e atributos ARIA.
  - O menu quando aberto mantém foco e é controlável por teclado.

- Observações de acessibilidade:
  - O botão usa `aria-controls` apontando para `#main-menu` e atualiza `aria-expanded` entre `true` e `false`.
  - Garantir que os links do menu sejam focusáveis e tenham contraste suficiente.


3.2 Controle de tema (claro/escuro)

- Comportamento:
  - O botão `#theme-toggle` alterna entre o tema claro (`theme-light`) e o tema escuro (`theme-dark`) aplicados como classes no elemento `<body>`.
  - A preferência atual é persistida em `localStorage` com a chave `aurora-theme`.
  - No carregamento da página, o JavaScript aplica o tema salvo (se existir) para manter a preferência do usuário.

- Implementação no JavaScript:
  - `applyTheme(theme)` aplica a classe correspondente no `body` e atualiza o `aria-pressed` do botão.
  - `toggleTheme()` troca o estado atual, persiste em `localStorage` e chama `applyTheme()`.

- Observações:
  - O CSS contém variáveis e regras para `.theme-dark` e `.theme-light` (cores, fundo, contrastes).
  - Verificar contraste de texto em ambos os temas para manter acessibilidade.


3.3 Carrossel de imagens

- Comportamento:
  - Existe um carrossel simples com um conjunto de imagens (mock em `assets/mock-*.jpg`).
  - O carrossel permite navegação para a próxima e anterior imagem, e tem auto-advance (intervalo configurável).
  - O índice atual do carrossel é mantido em `state.carouselIndex`.

- Implementação no JavaScript:
  - `carouselImages` é um array com caminhos das imagens.
  - `showCarousel(index)` atualiza a imagem visível aplicando transições suaves.
  - `initCarousel()` configura botões prev/next e um `setInterval` para avançar automaticamente. Também respeita pausa ao focar o carrossel.

- Observações:
  - Se não houver imagens no diretório `assets/`, o carrossel pode exibir placeholders ou uma mensagem amigável.
  - Para produção, trocar imagens mock por versões otimizadas.


3.4 Galeria com lazy-loading e controles

- Comportamento:
  - A galeria é construída dinamicamente pelo JavaScript (`buildGallery()` e `renderGallery(items)`) e renderizada em um grid tipo masonry (`.masonry-grid`).
  - As imagens usam `data-src` para habilitar lazy-loading via IntersectionObserver. Quando um item entra na viewport, seu atributo `src` é preenchido com `data-src`.
  - Controles incluem: carregar mais itens, embaralhar, e filtros (categoria).

- Implementação no JavaScript:
  - `buildGallery()` cria os dados iniciais de `state.galleryItems` e chama `renderGallery()`.
  - `initGalleryControls()` adiciona handlers para botões e inputs que filtram ou atualizam a grade.
  - `initObserver()` configura IntersectionObserver para revelar elementos com a classe `.reveal` e para ativar o lazy-loading das imagens.

- Observações:
  - A grade CSS usa `grid-template-columns` para responsividade (3 colunas em desktop, 2/1 em telas menores).
  - Confirmar que as imagens tenham atributos `alt` quando adicionar imagens reais para melhor acessibilidade.


3.5 Formulário de contato com rascunho local

- Comportamento:
  - O formulário de contato salva um rascunho no `localStorage` periodicamente (ou quando o usuário interage), permitindo restaurar campos preenchidos caso o usuário retorne à página.
  - Na submissão, o formulário é validado com `validateForm(form)`. Em um projeto real, a submissão poderia enviar dados para um endpoint via fetch/AJAX.

- Implementação no JavaScript:
  - `initForm()` registra listeners de input para salvar rascunho e trata o submit para validação e limpeza do rascunho.
  - Utilitários como `serializeForm(form)`, `fillForm(data)` e `showMessage(msg)` ajudam no comportamento do formulário.

- Observações:
  - O projeto atual possui um formulário demonstrativo; para enviar mensagens de verdade é necessário implementar um backend ou integrar com um serviço (ex.: Netlify Forms, Formspree, ou endpoint próprio).
  - Remova rascunho do `localStorage` após envio bem-sucedido.


3.6 Observers e animações de entrada (reveal)

- Comportamento:
  - Elementos com a classe `.reveal` recebem a classe `.is-visible` quando entram na viewport, disparada por um IntersectionObserver. Isso permite animações suaves de entrada (fade/translate).
  - O mesmo Observer é reutilizado para lazy-loading de imagens (observa `data-src`).

- Implementação no JavaScript:
  - `initObserver()` cria pelo menos dois observers: um para animação de entrada e outro para lazy-loading ou combina ambos em um único observer com lógica condicional.

- Observações:
  - Ajuste os thresholds e rootMargin para controlar quando os elementos são revelados.
  - Verifique impacto de desempenho se a página tiver centenas de elementos; neste caso, use técnica de paginamento ou virtualização.


3.7 Atalhos de teclado e acessibilidade

- Comportamento:
  - O JavaScript registra atalhos globais, por exemplo `Ctrl/Cmd+K`, para abrir uma busca simulada ou exibir uma mensagem.
  - `trapFocus(container)` é utilitário para gerenciar foco quando modais são abertos (evita que o foco escape do modal usando ciclo de foco).

- Observações:
  - O projeto busca seguir boas práticas de acessibilidade: atributos ARIA onde necessário, foco visível, e controles acessíveis por teclado.
  - Ainda é recomendado fazer auditoria com ferramentas como Lighthouse ou axe-core para encontrar pontos de melhoria.


4. Como executar localmente

Este projeto é composto apenas por arquivos estáticos. Para visualizar localmente, você pode abrir `index.html` diretamente no navegador ou usar um servidor estático simples. Algumas opções:

- Abrir `index.html` no navegador (duplo clique). Observação: algumas features (por exemplo fetch) podem exigir servidor para evitar restrições de CORS ou políticas de origem.

- Usar Python HTTP server (necessário ter Python instalado):

```powershell
# na pasta do projeto
python -m http.server 8000
# então abra http://localhost:8000 no navegador
```

- Usar um servidor estático via Node (serve, http-server) se preferir:

```powershell
# instalar http-server globalmente (se necessário)
npm install -g http-server
# rodar
http-server -p 8000
```


5. Notas sobre CSS e design tokens

- `style.css` contém variáveis, utilitários e regras para temas. As variáveis de cores e espaçamentos estão definidas no topo do arquivo (em `:root`) e são aplicadas através de classes `.theme-light` e `.theme-dark`.
- O CSS inclui utilitários de espaçamento (classes `.u-gap-*`) e badges (`.badge-*`) — alguns utilitários são extensos e gerados para demonstração.
- A barra superior usa `position: sticky` para permanecer visível ao rolar a página.
- A grid da galeria é responsiva, e as media queries (980px e 640px) ajustam o número de colunas.

Recomendações:
- Consolidar utilitários repetidos se o arquivo crescer demais.
- Considerar modularizar os estilos (por exemplo, usar arquivos SCSS para componentes e variáveis).
- Minimizar e otimizar o CSS para produção.


6. Notas sobre o JavaScript (`script.js`)

- `script.js` é responsável por quase toda a interatividade do site. Ele define utilitários DOM (`qs`, `qsa`), estado global (`state`), e funções de inicialização para componentes (`initNav`, `initCarousel`, `buildGallery`, `initForm`, etc.).
- O arquivo usa padrões simples: funções puras para utilitários e manipulação direta do DOM. Ele evita dependências externas intencionamente.
- Há um bloco de helpers gerados automaticamente (funções `helper1`, `helper2`, ..., `helper129`) que foram mantidos por compatibilidade. Esses helpers parecem ser partes de um código gerado e retornam constantes ou transformações triviais. Eles não são necessários para entender o fluxo principal, mas permanecem no arquivo.

Recomendações de manutenção:
- Remover ou refatorar o bloco de helpers automáticos se não forem necessários, para reduzir o tamanho do arquivo.
- Considerar dividir `script.js` em módulos menores (por exemplo `nav.js`, `carousel.js`, `gallery.js`, `form.js`) para facilitar testes e manutenção.
- Adicionar testes simples (unitários) para utilitários puros se o projeto crescer.


7. Boas práticas e sugestões de melhoria

- Acessibilidade:
  - Validar contraste de cores em ambos os temas.
  - Garantir `alt` em todas as imagens e roles/labels adequados para controles dinâmicos.
  - Testar navegação apenas via teclado e screen readers.

- Performance:
  - Otimizar e comprimir imagens em `assets/`.
  - Usar técnicas de critical CSS e lazy-loading para recursos não essenciais.
  - Minimizar e concatenar arquivos CSS/JS para produção.

- Código:
  - Modularizar o JavaScript e aplicar bundlers se o projeto se expandir.
  - Adicionar pipeline de lint (ESLint) e formatação (Prettier) para consistência.


8. Histórico de mudanças

- Versão inicial: implementação básica das páginas HTML e CSS.
- Atualização: adição de `script.js` com inicializadores para menu, tema, carrossel, galeria, formulários e observers.
- Documentação: este `README.md` foi adicionado como parte da Atividade 09 para descrever funcionalidades e instruções de uso.

(Manter um changelog mais detalhado em `CHANGELOG.md` é recomendado para projetos maiores.)


9. Contato e créditos

Projeto de exemplo criado para fins acadêmicos (Atividade 09). Autores e contribuidores podem adicionar informações de contato e links.

---

Anexos e verificação rápida

- Confirmei os arquivos HTML, `style.css` e `script.js` fornecidos no workspace. O `script.js` contém comentários que descrevem as funções principais e observadores. O `style.css` contém regras de tema, layout, grid e utilitários.

- Este README detalha tanto a implementação quanto recomendações para continuidade.


---

Como verificar rapidamente

1. Abra `index.html` no navegador (ou rode servidor local).
2. Teste o botão de menu em tela pequena (resize do navegador) para verificar o comportamento de alternância.
3. Clique em `Modo` (botão `#theme-toggle`) para alternar entre claro e escuro. Recarregue a página para confirmar a persistência da preferência.
4. Navegue até `gallery.html` e role lentamente para observar lazy-loading das imagens e animações de entrada das seções com `.reveal`.
5. Em `contact.html`, preencha alguns campos e recarregue a página para verificar se o rascunho é restaurado.


---

Próximos passos sugeridos

- Adicionar imagens reais otimizadas em `assets/` e preencher atributos `alt` adequados.
- Modularizar `script.js` em arquivos menores e adicionar um pequeno build (parcel/webpack/vite) caso haja necessidade de suportar mais funcionalidades.
- Implementar integração de envio de formulário (backend ou serviço de terceiros) para tornar o formulário funcional em produção.
- Rodar ferramentas de auditoria (Lighthouse) e correções de acessibilidade detectadas.


---

Licença

Este projeto é um exercício acadêmico. Se você for reutilizar trechos, mantenha os créditos e ajuste a licença conforme necessário para o seu uso.


---

Fim do README

Obrigado por revisar este projeto. Se quiser, posso também:

- Gerar um changelog automático com as diferenças entre arquivos.
- Refatorar `script.js` dividindo-o em módulos.
- Adicionar um pequeno script de build e minificação.

Se quiser que eu faça qualquer um desses itens, diga qual deles e eu implemento nas próximas etapas.
