# Theming — Sistema de Temas

Sistema de temas (light/dark) com paleta de cores em tons de marrom (primária) e amarelo (secundária), animações suaves via `react-native-reanimated`, e persistência local da preferência do usuário.

---

## ADDED Requirements

### Requirement: Paleta de cores do tema Light

O sistema DEVE definir uma paleta de cores para o tema claro (light) utilizando tons de marrom como cor primária e tons de amarelo como cor secundária, transmitindo uma estética premium e acolhedora.

As cores do tema light DEVEM incluir, no mínimo, os seguintes tokens semânticos:

| Token               | Descrição                              | Exemplo de Valor       |
|----------------------|----------------------------------------|------------------------|
| `primary`            | Cor primária (marrom médio)            | `#6B4226`              |
| `primaryDark`        | Variante escura do marrom              | `#4A2E17`              |
| `primaryLight`       | Variante clara do marrom               | `#8B6342`              |
| `secondary`          | Cor secundária (amarelo dourado)       | `#D4A843`              |
| `secondaryDark`      | Variante escura do amarelo             | `#B8922F`              |
| `secondaryLight`     | Variante clara do amarelo              | `#E8C96A`              |
| `background`         | Fundo principal da tela                | `#FFF8F0`              |
| `surface`            | Fundo de cards e superfícies elevadas  | `#FFFFFF`              |
| `textPrimary`        | Texto principal                        | `#1A1A1A`              |
| `textSecondary`      | Texto secundário / subtítulos          | `#5C5C5C`              |
| `border`             | Cor de bordas e separadores            | `#E0D5C7`              |
| `error`              | Cor de erro                            | `#D32F2F`              |
| `success`            | Cor de sucesso                         | `#388E3C`              |
| `tabBarBackground`   | Fundo da barra de tabs                 | `#FFFFFF`              |
| `tabBarActive`       | Cor do ícone/tab ativo                 | `#6B4226`              |
| `tabBarInactive`     | Cor do ícone/tab inativo               | `#9E9E9E`              |

#### Scenario: Tema light possui todos os tokens semânticos obrigatórios

WHEN o tema `light` é acessado  
THEN ele DEVE conter todos os tokens listados na tabela acima  
AND cada valor DEVE ser uma string hexadecimal válida no formato `#RRGGBB` ou `#RRGGBBAA`

#### Scenario: Cores primárias do tema light são tons de marrom

WHEN as cores `primary`, `primaryDark` e `primaryLight` do tema light são avaliadas  
THEN elas DEVEM ser tons reconhecíveis de marrom  
AND `primaryDark` DEVE ter luminosidade menor que `primary`  
AND `primaryLight` DEVE ter luminosidade maior que `primary`

#### Scenario: Cores secundárias do tema light são tons de amarelo/dourado

WHEN as cores `secondary`, `secondaryDark` e `secondaryLight` do tema light são avaliadas  
THEN elas DEVEM ser tons reconhecíveis de amarelo ou dourado  
AND `secondaryDark` DEVE ter luminosidade menor que `secondary`  
AND `secondaryLight` DEVE ter luminosidade maior que `secondary`

#### Scenario: Background do tema light é claro

WHEN a cor `background` do tema light é avaliada  
THEN ela DEVE ter luminosidade alta (valor de luminância relativa ≥ 0.8)  
AND DEVE possuir um tom levemente quente (off-white amarelado ou creme)

---

### Requirement: Paleta de cores do tema Dark

O sistema DEVE definir uma paleta de cores para o tema escuro (dark) utilizando variantes escuras dos mesmos tons de marrom e amarelo, mantendo a identidade visual e garantindo contraste adequado para legibilidade.

As cores do tema dark DEVEM incluir os mesmos tokens semânticos do tema light, com valores adaptados:

| Token               | Descrição                              | Exemplo de Valor       |
|----------------------|----------------------------------------|------------------------|
| `primary`            | Cor primária (marrom claro sobre escuro)| `#C49A6C`             |
| `primaryDark`        | Variante mais escura                   | `#A07A50`              |
| `primaryLight`       | Variante mais clara                    | `#D4B48A`              |
| `secondary`          | Cor secundária (amarelo dourado)       | `#E8C96A`              |
| `secondaryDark`      | Variante escura do amarelo             | `#D4A843`              |
| `secondaryLight`     | Variante clara do amarelo              | `#F0D98A`              |
| `background`         | Fundo principal da tela                | `#1A1410`              |
| `surface`            | Fundo de cards e superfícies elevadas  | `#2C2218`              |
| `textPrimary`        | Texto principal                        | `#F5F0E8`              |
| `textSecondary`      | Texto secundário / subtítulos          | `#B0A898`              |
| `border`             | Cor de bordas e separadores            | `#3D3228`              |
| `error`              | Cor de erro                            | `#EF5350`              |
| `success`            | Cor de sucesso                         | `#66BB6A`              |
| `tabBarBackground`   | Fundo da barra de tabs                 | `#2C2218`              |
| `tabBarActive`       | Cor do ícone/tab ativo                 | `#E8C96A`              |
| `tabBarInactive`     | Cor do ícone/tab inativo               | `#6B6B6B`              |

#### Scenario: Tema dark possui todos os tokens semânticos obrigatórios

WHEN o tema `dark` é acessado  
THEN ele DEVE conter exatamente os mesmos tokens (chaves) que o tema `light`  
AND cada valor DEVE ser uma string hexadecimal válida no formato `#RRGGBB` ou `#RRGGBBAA`

#### Scenario: Background do tema dark é escuro

WHEN a cor `background` do tema dark é avaliada  
THEN ela DEVE ter luminosidade baixa (valor de luminância relativa ≤ 0.1)  
AND DEVE possuir um tom levemente quente (marrom muito escuro, não preto puro)

#### Scenario: Contraste de texto é acessível no tema dark

WHEN a cor `textPrimary` do tema dark é comparada com `background`  
THEN o ratio de contraste DEVE ser ≥ 4.5:1 (WCAG AA para texto normal)  
AND WHEN a cor `textSecondary` do tema dark é comparada com `background`  
THEN o ratio de contraste DEVE ser ≥ 3.0:1

#### Scenario: Contraste de texto é acessível no tema light

WHEN a cor `textPrimary` do tema light é comparada com `background`  
THEN o ratio de contraste DEVE ser ≥ 4.5:1 (WCAG AA para texto normal)  
AND WHEN a cor `textSecondary` do tema light é comparada com `background`  
THEN o ratio de contraste DEVE ser ≥ 3.0:1

---

### Requirement: Tokens de cor e estrutura de constantes

O sistema DEVE exportar as definições de tema como constantes TypeScript tipadas, garantindo type-safety e consistência em todo o app.

#### Scenario: Existe um tipo ThemeColors com todos os tokens

WHEN o módulo de constantes de tema é importado  
THEN ele DEVE exportar um tipo ou interface `ThemeColors` contendo todas as chaves de token definidas nas tabelas de paleta  
AND cada propriedade DEVE ser do tipo `string`

#### Scenario: Temas light e dark são exportados como objetos tipados

WHEN o módulo de constantes de tema é importado  
THEN ele DEVE exportar um objeto `lightTheme` que satisfaça o tipo `ThemeColors`  
AND DEVE exportar um objeto `darkTheme` que satisfaça o tipo `ThemeColors`

#### Scenario: Os objetos de tema estão em um arquivo de constantes dedicado

WHEN o desenvolvedor procura as definições de tema  
THEN elas DEVEM estar localizadas no diretório `constants/`  
AND DEVEM estar em um arquivo dedicado (ex: `constants/Colors.ts` ou `constants/Theme.ts`)

---

### Requirement: Alternância de tema com persistência local

O sistema DEVE permitir ao usuário alternar entre tema light e dark, e DEVE persistir a escolha localmente para que ela seja restaurada ao reabrir o app.

#### Scenario: Usuário alterna de light para dark

WHEN o tema atual é `light`  
AND o usuário ativa o toggle de tema na tela de configurações  
THEN o tema DEVE mudar para `dark`  
AND todas as cores da interface DEVEM ser atualizadas para os valores do tema dark  
AND a barra de status (StatusBar) DEVE ter o estilo `light-content`

#### Scenario: Usuário alterna de dark para light

WHEN o tema atual é `dark`  
AND o usuário ativa o toggle de tema na tela de configurações  
THEN o tema DEVE mudar para `light`  
AND todas as cores da interface DEVEM ser atualizadas para os valores do tema light  
AND a barra de status (StatusBar) DEVE ter o estilo `dark-content`

#### Scenario: Tema escolhido é persistido localmente

WHEN o usuário alterna o tema  
THEN a preferência (light ou dark) DEVE ser salva no banco de dados local (SQLite)  
AND a persistência DEVE ocorrer imediatamente após a alternância

#### Scenario: Tema persistido é restaurado ao abrir o app

WHEN o app é iniciado  
AND uma preferência de tema foi salva anteriormente  
THEN o tema DEVE ser restaurado para o valor salvo antes de renderizar a primeira tela  
AND NÃO DEVE haver flash visível do tema errado durante o carregamento

#### Scenario: Tema padrão quando nenhuma preferência foi salva

WHEN o app é iniciado pela primeira vez  
AND nenhuma preferência de tema foi salva  
THEN o tema padrão DEVE ser `light`

---

### Requirement: Animações de transição de tema

O sistema DEVE utilizar `react-native-reanimated` para animar a transição entre temas, garantindo uma experiência premium e fluida.

#### Scenario: Cores do background transitam com animação

WHEN o usuário alterna o tema  
THEN a cor de `background` DEVE transitar suavemente do valor antigo para o novo  
AND a duração da transição DEVE ser entre 200ms e 400ms  
AND a curva de easing DEVE ser suave (ex: `Easing.inOut(Easing.ease)` ou equivalente)

#### Scenario: Cores de texto transitam com animação

WHEN o usuário alterna o tema  
THEN as cores `textPrimary` e `textSecondary` DEVEM transitar suavemente  
AND a transição DEVE ocorrer sincronizadamente com a transição do background

#### Scenario: Cores de superfícies (cards) transitam com animação

WHEN o usuário alterna o tema  
THEN a cor de `surface` e `border` DEVEM transitar suavemente  
AND NÃO DEVE haver cintilação (flicker) durante a transição

#### Scenario: Tab bar anima durante transição de tema

WHEN o usuário alterna o tema  
THEN as cores `tabBarBackground`, `tabBarActive` e `tabBarInactive` DEVEM transitar suavemente  
AND a transição DEVE ser perceptível mas não disruptiva

#### Scenario: Animações executam na UI thread

WHEN uma animação de transição de tema é executada  
THEN ela DEVE ser processada na UI thread via `react-native-reanimated`  
AND NÃO DEVE causar travamento (jank) ou queda de frames  
AND o app DEVE manter ≥ 55 FPS durante a transição

---

### Requirement: Tipografia

O sistema DEVE definir uma escala tipográfica consistente que funcione harmoniosamente com ambos os temas e transmita a estética premium do app.

#### Scenario: Escala tipográfica definida com tokens

WHEN o módulo de tipografia é importado  
THEN ele DEVE exportar ao menos os seguintes estilos de texto como objetos `TextStyle`:

| Estilo             | Uso principal                     |
|--------------------|------------------------------------|
| `heading1`         | Título principal de tela           |
| `heading2`         | Subtítulo / título de seção        |
| `body`             | Texto de leitura (versículos)      |
| `bodySmall`        | Texto auxiliar / captions          |
| `label`            | Labels de botões e tabs            |
| `verseNumber`      | Número do versículo                |

#### Scenario: Tamanhos de fonte seguem hierarquia visual

WHEN os estilos tipográficos são avaliados  
THEN `heading1.fontSize` DEVE ser ≥ 24  
AND `heading2.fontSize` DEVE ser ≥ 18 e < `heading1.fontSize`  
AND `body.fontSize` DEVE ser ≥ 15 e < `heading2.fontSize`  
AND `bodySmall.fontSize` DEVE ser ≥ 12 e < `body.fontSize`  
AND `label.fontSize` DEVE ser ≥ 12

#### Scenario: Pesos de fonte diferenciam hierarquia

WHEN os estilos tipográficos são avaliados  
THEN `heading1.fontWeight` DEVE ser `'700'` ou `'bold'`  
AND `heading2.fontWeight` DEVE ser `'600'` ou `'700'`  
AND `body.fontWeight` DEVE ser `'400'` ou `'normal'`

#### Scenario: Tipografia não define cores fixas

WHEN os estilos tipográficos são avaliados  
THEN NENHUM estilo DEVE incluir a propriedade `color`  
AND as cores DEVEM ser aplicadas separadamente via tokens do tema ativo

---

### Requirement: Consistência de estilo nos componentes

Todos os componentes visuais do app DEVEM usar exclusivamente os tokens de cor e tipografia do tema, garantindo consistência visual e funcionamento correto em ambos os modos.

#### Scenario: Nenhum componente usa cores hardcoded

WHEN o código-fonte de qualquer componente de UI é analisado  
THEN NÃO DEVEM existir valores de cor hexadecimais literais (ex: `'#FFFFFF'`) usados diretamente em propriedades de estilo  
AND todas as cores DEVEM ser referenciadas via tokens do tema (ex: `theme.background`, `colors.primary`)

#### Scenario: Cards e superfícies usam token surface

WHEN um componente do tipo card ou container elevado é renderizado  
THEN seu `backgroundColor` DEVE ser o token `surface` do tema ativo  
AND sua borda (se presente) DEVE usar o token `border`

#### Scenario: Textos principais usam token textPrimary

WHEN um texto principal (título, corpo de versículo) é renderizado  
THEN sua cor DEVE ser o token `textPrimary` do tema ativo

#### Scenario: Textos secundários usam token textSecondary

WHEN um texto secundário (legenda, subtítulo, data) é renderizado  
THEN sua cor DEVE ser o token `textSecondary` do tema ativo

#### Scenario: Botões primários usam a cor primary

WHEN um botão de ação principal é renderizado  
THEN seu `backgroundColor` DEVE ser o token `primary` do tema ativo  
AND seu texto DEVE ter contraste ≥ 4.5:1 com o background do botão

#### Scenario: A barra de tabs reflete o tema ativo

WHEN a barra de navegação por tabs é renderizada  
THEN seu `backgroundColor` DEVE ser o token `tabBarBackground` do tema ativo  
AND o ícone/label da tab ativa DEVE usar o token `tabBarActive`  
AND os ícones/labels das tabs inativas DEVEM usar o token `tabBarInactive`

---

### Requirement: Contexto de tema via React Context

O sistema DEVE fornecer o tema atual e a função de alternância através de um React Context, para que qualquer componente da árvore possa acessar as cores e alternar o tema.

#### Scenario: ThemeProvider envolve toda a aplicação

WHEN o componente raiz do app (layout root) é renderizado  
THEN ele DEVE conter um `ThemeProvider` que forneça o contexto de tema  
AND o `ThemeProvider` DEVE estar acima de todos os componentes de navegação na árvore

#### Scenario: Hook useTheme retorna cores e função de toggle

WHEN um componente chama o hook `useTheme()` (ou equivalente)  
THEN ele DEVE receber um objeto contendo:  
  - `colors`: objeto `ThemeColors` com todos os tokens do tema ativo  
  - `isDark`: booleano indicando se o tema atual é dark  
  - `toggleTheme`: função que alterna entre light e dark

#### Scenario: useTheme fora do Provider lança erro

WHEN o hook `useTheme()` é chamado fora de um `ThemeProvider`  
THEN ele DEVE lançar um erro descritivo informando que o hook deve ser usado dentro de um `ThemeProvider`

---

### Requirement: Animações gerais de UI

Além das transições de tema, o sistema DEVE utilizar `react-native-reanimated` para animações de UI que reforcem a sensação premium do app.

#### Scenario: Componentes de lista possuem animação de entrada

WHEN uma lista de itens (livros, versículos, anotações) é renderizada  
THEN cada item DEVE ter uma animação de entrada (fade-in, slide-up, ou similar)  
AND os itens DEVEM animar sequencialmente com stagger (atraso escalonado entre 30ms e 80ms por item)  
AND a duração individual de cada animação DEVE ser entre 200ms e 400ms

#### Scenario: Transições de tela possuem animação

WHEN o usuário navega entre telas  
THEN a transição DEVE incluir animação (fade, slide, ou combinação)  
AND a animação DEVE durar entre 200ms e 350ms

#### Scenario: Botões possuem feedback visual animado

WHEN o usuário pressiona um botão ou item interativo  
THEN DEVE haver feedback visual animado (ex: escala reduzida para ~0.96 no press)  
AND a animação de press DEVE durar ≤ 100ms  
AND a animação de release DEVE durar ≤ 150ms

#### Scenario: Animações respeitam configurações de acessibilidade

WHEN o dispositivo está com "Reduzir Movimento" ativado  
THEN todas as animações de UI (entrada, transição, feedback) DEVEM ser reduzidas ou desabilitadas  
AND as transições de tema DEVEM aplicar as cores instantaneamente sem animação
