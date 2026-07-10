## ADDED Requirements

### Requirement: Nova tab de Anotações no menu inferior

O menu inferior (tabs layout) do aplicativo SHALL exibir uma nova opção de navegação chamada "Anotações", posicionada imediatamente antes da opção "Configurações". Esta tab SHALL direcionar o usuário para a tela do diário de anotações.

#### Scenario: Visualizar a tab de Anotações no menu inferior
- **WHEN** o usuário está visualizando a barra de abas inferior
- **THEN** o menu inferior DEVE exibir 4 opções na seguinte ordem: Leitura, Livros, Anotações, Configurações
- **AND** a tab de Anotações DEVE exibir o ícone `document-text` (ativo) / `document-text-outline` (inativo)
- **AND** a tab de Anotações DEVE utilizar as cores ativas e inativas de acordo com o tema selecionado
