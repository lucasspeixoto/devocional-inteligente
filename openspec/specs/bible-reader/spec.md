# bible-reader

## Purpose
Tela principal de leitura com exibição de versículos, navegação por swipe entre capítulos e retomada do último ponto de leitura.
## Requirements
### Requirement: Exibição de versículos do capítulo atual

O sistema DEVE exibir todos os versículos do capítulo atualmente selecionado na tela principal (Home). Cada versículo DEVE apresentar seu número e texto de forma clara e legível. O componente de leitura DEVE ocupar a área principal da tela, com rolagem vertical quando o conteúdo exceder o espaço visível.

#### Scenario: Exibir versículos ao abrir um capítulo

WHEN o usuário abre a tela de leitura com um livro e capítulo válidos (ex: Gênesis, capítulo 1)
THEN o sistema DEVE exibir todos os versículos daquele capítulo em ordem sequencial
AND cada versículo DEVE mostrar seu número (ex: "1", "2", "3") seguido do texto correspondente
AND a lista DEVE ser rolável verticalmente caso os versículos excedam a área visível

#### Scenario: Renderizar versículos com dados da API

WHEN os versículos do capítulo são carregados com sucesso a partir do banco de dados local ou da API da Bíblia Digital
THEN cada versículo DEVE ser renderizado como um item distinto na lista
AND o texto dos versículos DEVE respeitar a versão da Bíblia selecionada nas configurações

#### Scenario: Exibir capítulo vazio quando não há versículos

WHEN o sistema tenta carregar um capítulo que não possui versículos disponíveis (dados ausentes ou erro de dados)
THEN o sistema DEVE exibir uma mensagem informativa indicando que não há conteúdo disponível para este capítulo
AND NÃO DEVE exibir uma lista vazia sem explicação

---

### Requirement: Formatação visual dos versículos e cabeçalho do capítulo

O sistema DEVE apresentar os versículos com formatação visual consistente e agradável. O cabeçalho DEVE exibir o nome do livro e número do capítulo. A paleta de cores DEVE utilizar marrom como cor primária e amarelo como cor secundária, conforme o sistema de temas do app.

#### Scenario: Exibir cabeçalho com nome do livro e capítulo

WHEN um capítulo é carregado na tela de leitura
THEN o cabeçalho DEVE exibir o nome do livro (ex: "Gênesis") e o número do capítulo (ex: "Capítulo 1")
AND o cabeçalho DEVE utilizar a cor primária (marrom) do tema ativo

#### Scenario: Formatar número do versículo com destaque visual

WHEN os versículos são renderizados na tela
THEN o número de cada versículo DEVE ter destaque visual diferenciado do texto (ex: negrito, cor secundária amarela, ou tamanho de fonte menor/superscript)
AND o texto do versículo DEVE ser exibido em fonte legível com tamanho adequado para leitura prolongada

#### Scenario: Aplicar espaçamento entre versículos

WHEN múltiplos versículos são exibidos na lista
THEN DEVE haver espaçamento vertical adequado entre cada versículo para facilitar a leitura
AND o texto NÃO DEVE ficar aglomerado ou difícil de distinguir entre versículos adjacentes

---

### Requirement: Navegação por swipe entre capítulos

O sistema DEVE permitir que o usuário navegue entre capítulos utilizando gestos de swipe horizontal. Swipe para a esquerda DEVE avançar para o próximo capítulo e swipe para a direita DEVE voltar ao capítulo anterior. A navegação DEVE utilizar `react-native-gesture-handler` para detecção de gestos e `react-native-reanimated` para animações de transição.

#### Scenario: Avançar para o próximo capítulo com swipe para a esquerda

WHEN o usuário realiza um gesto de swipe para a esquerda na tela de leitura
AND o capítulo atual NÃO é o último capítulo do livro atual
THEN o sistema DEVE navegar para o próximo capítulo do mesmo livro
AND DEVE exibir uma animação de transição suave (slide) usando react-native-reanimated
AND os versículos do novo capítulo DEVEM ser carregados e exibidos
AND o cabeçalho DEVE ser atualizado com o novo número do capítulo

#### Scenario: Voltar ao capítulo anterior com swipe para a direita

WHEN o usuário realiza um gesto de swipe para a direita na tela de leitura
AND o capítulo atual NÃO é o primeiro capítulo do livro atual
THEN o sistema DEVE navegar para o capítulo anterior do mesmo livro
AND DEVE exibir uma animação de transição suave (slide) usando react-native-reanimated
AND os versículos do capítulo anterior DEVEM ser carregados e exibidos

#### Scenario: Transição entre livros ao avançar do último capítulo

WHEN o usuário realiza um swipe para a esquerda
AND o capítulo atual é o último capítulo do livro atual
AND existe um próximo livro na ordem canônica da Bíblia
THEN o sistema DEVE navegar para o capítulo 1 do próximo livro
AND o cabeçalho DEVE ser atualizado com o nome do novo livro e "Capítulo 1"

#### Scenario: Transição entre livros ao retroceder do primeiro capítulo

WHEN o usuário realiza um swipe para a direita
AND o capítulo atual é o capítulo 1 do livro atual
AND existe um livro anterior na ordem canônica da Bíblia
THEN o sistema DEVE navegar para o último capítulo do livro anterior
AND o cabeçalho DEVE ser atualizado com o nome do livro anterior e o número do último capítulo

#### Scenario: Animação de feedback durante o gesto de swipe

WHEN o usuário inicia um gesto de swipe horizontal (sem completá-lo)
THEN o conteúdo DEVE acompanhar o movimento do dedo com uma animação fluida usando react-native-reanimated
AND se o gesto não atingir o limiar mínimo para troca de capítulo, o conteúdo DEVE retornar à posição original com animação

---

### Requirement: Tratamento de limites da navegação

O sistema DEVE tratar adequadamente os casos limite de navegação quando o usuário está no primeiro capítulo do primeiro livro ou no último capítulo do último livro da Bíblia.

#### Scenario: Bloquear swipe para a direita no início da Bíblia

WHEN o usuário está no capítulo 1 de Gênesis (primeiro livro da Bíblia)
AND realiza um gesto de swipe para a direita
THEN o sistema NÃO DEVE navegar para nenhum capítulo
AND DEVE exibir um feedback visual sutil indicando que não há capítulo anterior (ex: bounce/resistência no gesto)

#### Scenario: Bloquear swipe para a esquerda no final da Bíblia

WHEN o usuário está no último capítulo de Apocalipse (último livro da Bíblia)
AND realiza um gesto de swipe para a esquerda
THEN o sistema NÃO DEVE navegar para nenhum capítulo
AND DEVE exibir um feedback visual sutil indicando que não há próximo capítulo (ex: bounce/resistência no gesto)

---

### Requirement: Persistência e restauração da posição de leitura

O sistema DEVE salvar automaticamente a posição de leitura atual (livro e capítulo) no banco de dados local SQLite. Ao abrir o app, o sistema DEVE restaurar automaticamente o último ponto de leitura do usuário.

#### Scenario: Salvar posição de leitura ao navegar para novo capítulo

WHEN o usuário navega para um novo capítulo (via swipe ou qualquer outro meio)
THEN o sistema DEVE salvar o identificador do livro atual e o número do capítulo atual no banco de dados local SQLite
AND a operação de salvamento DEVE ser assíncrona e NÃO DEVE bloquear a interface do usuário

#### Scenario: Restaurar último ponto de leitura ao abrir o app

WHEN o usuário abre o app pela primeira vez na sessão
AND existe uma posição de leitura salva no banco de dados local
THEN o sistema DEVE carregar automaticamente o livro e capítulo correspondentes à última posição salva
AND DEVE exibir os versículos desse capítulo na tela Home

#### Scenario: Exibir capítulo padrão na primeira utilização

WHEN o usuário abre o app pela primeira vez (nenhuma posição salva)
THEN o sistema DEVE carregar Gênesis capítulo 1 como ponto de leitura padrão
AND DEVE salvar essa posição como a posição de leitura atual

#### Scenario: Manter posição de leitura após fechar e reabrir o app

WHEN o usuário está lendo Salmos capítulo 23
AND fecha o app completamente
AND reabre o app posteriormente
THEN o sistema DEVE exibir Salmos capítulo 23 na tela Home
AND os versículos desse capítulo DEVEM ser carregados e exibidos corretamente

---

### Requirement: Estados de carregamento

O sistema DEVE exibir indicadores de carregamento apropriados enquanto os dados dos versículos estão sendo buscados, garantindo que o usuário tenha feedback visual durante operações assíncronas.

#### Scenario: Exibir indicador de carregamento ao buscar versículos

WHEN o sistema está buscando os versículos de um capítulo (do banco local ou da API)
THEN DEVE exibir um indicador de carregamento visual (spinner ou skeleton) na área de conteúdo
AND o indicador DEVE utilizar as cores do tema ativo (marrom/amarelo)
AND o cabeçalho com o nome do livro e capítulo DEVE permanecer visível durante o carregamento

#### Scenario: Substituir indicador por conteúdo após carregamento

WHEN os versículos são carregados com sucesso
THEN o indicador de carregamento DEVE ser removido
AND os versículos DEVEM ser exibidos com uma animação de entrada suave (fade-in) usando react-native-reanimated
AND a transição DEVE ser fluida, sem saltos visuais

#### Scenario: Exibir estado de erro quando o carregamento falha

WHEN a busca dos versículos falha (erro de rede, dados corrompidos, etc.)
THEN o sistema DEVE exibir uma mensagem de erro amigável ao usuário
AND DEVE oferecer uma opção para tentar novamente (botão "Tentar novamente")
AND NÃO DEVE exibir o indicador de carregamento indefinidamente

#### Scenario: Carregamento durante transição entre capítulos por swipe

WHEN o usuário navega para um novo capítulo via swipe
AND os versículos do novo capítulo ainda não estão disponíveis localmente
THEN o sistema DEVE exibir o indicador de carregamento no novo capítulo enquanto busca os dados
AND a animação de swipe DEVE completar normalmente independente do estado de carregamento dos dados

---

### Requirement: Rolagem para o topo ao trocar de capítulo

O sistema DEVE garantir que a lista de versículos esteja posicionada no topo sempre que um novo capítulo for carregado, independente da posição de rolagem do capítulo anterior.

#### Scenario: Resetar posição de rolagem ao navegar por swipe

WHEN o usuário está com a lista de versículos rolada até o meio ou final de um capítulo
AND navega para o próximo ou anterior capítulo via swipe
THEN a lista de versículos do novo capítulo DEVE ser exibida a partir do topo (versículo 1 visível)
AND NÃO DEVE manter a posição de rolagem do capítulo anterior

#### Scenario: Iniciar do topo ao restaurar posição de leitura

WHEN o app é aberto e a posição de leitura é restaurada do banco de dados
THEN a lista de versículos DEVE ser exibida a partir do topo (versículo 1 visível)

### Requirement: Nova tab de Anotações no menu inferior

O menu inferior (tabs layout) do aplicativo SHALL exibir uma nova opção de navegação chamada "Anotações", posicionada imediatamente antes da opção "Configurações". Esta tab SHALL direcionar o usuário para a tela do diário de anotações.

#### Scenario: Visualizar a tab de Anotações no menu inferior
- **WHEN** o usuário está visualizando a barra de abas inferior
- **THEN** o menu inferior DEVE exibir 4 opções na seguinte ordem: Leitura, Livros, Anotações, Configurações
- **AND** a tab de Anotações DEVE exibir o ícone `document-text` (ativo) / `document-text-outline` (inativo)
- **AND** a tab de Anotações DEVE utilizar as cores ativas e inativas de acordo com o tema selecionado

