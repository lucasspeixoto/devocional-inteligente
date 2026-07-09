# settings-screen

Tela de configurações.

## Requirements

### Requirement: Exibição da tela de configurações

A tela de configurações DEVE ser acessível como a última aba na navegação inferior (bottom tabs). A tela DEVE exibir um título "Configurações" no cabeçalho. A tela DEVE conter seções claramente separadas para alternância de tema e seleção de versão da Bíblia.

#### Scenario: Navegação para a tela de configurações via bottom tab

WHEN o usuário toca na aba "Configurações" na navegação inferior
THEN a tela de configurações DEVE ser exibida
AND o título "Configurações" DEVE aparecer no cabeçalho
AND a tela DEVE exibir a seção de alternância de tema
AND a tela DEVE exibir a seção de seleção de versão da Bíblia

#### Scenario: Posição da aba de configurações na navegação

WHEN a navegação inferior é renderizada
THEN a aba "Configurações" DEVE ser a última aba (posição mais à direita)

### Requirement: Alternância de tema (light/dark)

A tela de configurações DEVE exibir um controle de alternância (toggle) para alternar entre tema claro (light) e tema escuro (dark). O toggle DEVE refletir visualmente o estado atual do tema. O rótulo do toggle DEVE indicar claramente a funcionalidade de troca de tema.

#### Scenario: Exibição do toggle de tema com tema light ativo

WHEN o usuário acessa a tela de configurações
AND o tema atual é light
THEN o toggle de tema DEVE estar na posição desativada (off)
AND o rótulo DEVE indicar "Tema Escuro" ou equivalente

#### Scenario: Alternância de tema light para dark

WHEN o tema atual é light
AND o usuário ativa o toggle de tema
THEN o tema DEVE mudar imediatamente para dark
AND o toggle DEVE refletir o estado ativado (on)
AND toda a interface do aplicativo DEVE atualizar para as cores do tema escuro

#### Scenario: Alternância de tema dark para light

WHEN o tema atual é dark
AND o usuário desativa o toggle de tema
THEN o tema DEVE mudar imediatamente para light
AND o toggle DEVE refletir o estado desativado (off)
AND toda a interface do aplicativo DEVE atualizar para as cores do tema claro

### Requirement: Seleção de versão da Bíblia

A tela de configurações DEVE exibir um seletor para escolher a versão da Bíblia. As versões disponíveis DEVEM ser obtidas do endpoint `/api/versions` da API da Bíblia Digital. O seletor DEVE exibir a versão atualmente selecionada de forma destacada.

#### Scenario: Exibição das versões disponíveis

WHEN o usuário acessa a tela de configurações
THEN o seletor de versão DEVE exibir as versões disponíveis da Bíblia
AND as seguintes versões DEVEM estar disponíveis: acf, apee, bbe, kjv, nvi, ra, rvr
AND a versão atualmente selecionada DEVE estar visualmente destacada

#### Scenario: Seleção de uma nova versão da Bíblia

WHEN o usuário seleciona uma versão diferente da atualmente ativa (por exemplo, de "nvi" para "kjv")
THEN a nova versão DEVE ser marcada como selecionada no seletor
AND a versão anterior DEVE perder o destaque visual
AND o conteúdo bíblico exibido nas outras telas DEVE usar a nova versão selecionada

#### Scenario: Versão atual destacada ao abrir o seletor

WHEN o usuário acessa a tela de configurações
AND a versão salva é "nvi"
THEN a opção "nvi" DEVE estar visualmente destacada como a versão ativa

### Requirement: Persistência das configurações

Todas as configurações (tema e versão da Bíblia) DEVEM ser salvas localmente via SQLite. As configurações DEVEM persistir entre sessões do aplicativo (fechamento e reabertura). A gravação DEVE ocorrer imediatamente ao alterar qualquer configuração.

#### Scenario: Persistência do tema após reiniciar o app

WHEN o usuário alterna o tema para dark
AND o usuário fecha completamente o aplicativo
AND o usuário reabre o aplicativo
THEN o tema dark DEVE estar ativo
AND o toggle de tema na tela de configurações DEVE refletir o estado dark (ativado)

#### Scenario: Persistência da versão da Bíblia após reiniciar o app

WHEN o usuário seleciona a versão "kjv"
AND o usuário fecha completamente o aplicativo
AND o usuário reabre o aplicativo
THEN a versão "kjv" DEVE estar selecionada
AND o seletor de versão na tela de configurações DEVE exibir "kjv" como ativa
AND o conteúdo bíblico DEVE ser carregado na versão "kjv"

#### Scenario: Gravação imediata no banco ao alterar tema

WHEN o usuário alterna o toggle de tema
THEN a preferência de tema DEVE ser gravada no banco SQLite imediatamente
AND nenhuma ação adicional do usuário (como botão "salvar") DEVE ser necessária

#### Scenario: Gravação imediata no banco ao alterar versão

WHEN o usuário seleciona uma nova versão da Bíblia
THEN a preferência de versão DEVE ser gravada no banco SQLite imediatamente
AND nenhuma ação adicional do usuário (como botão "salvar") DEVE ser necessária

### Requirement: Aplicação imediata das mudanças

Alterações de tema e versão da Bíblia DEVEM ser aplicadas imediatamente em toda a interface, sem necessidade de reiniciar o aplicativo ou navegar para outra tela.

#### Scenario: Aplicação imediata do tema na tela atual

WHEN o usuário alterna o tema de light para dark na tela de configurações
THEN as cores da própria tela de configurações DEVEM atualizar imediatamente para o tema dark
AND não DEVE haver necessidade de navegar para outra tela para ver a mudança

#### Scenario: Aplicação imediata do tema em outras telas

WHEN o usuário alterna o tema de light para dark na tela de configurações
AND o usuário navega para a tela Home
THEN a tela Home DEVE estar renderizada com as cores do tema dark

#### Scenario: Aplicação imediata da versão nas telas de leitura

WHEN o usuário altera a versão da Bíblia de "nvi" para "acf" na tela de configurações
AND o usuário navega para a tela de leitura (Home)
THEN o conteúdo bíblico DEVE ser carregado/recarregado na versão "acf"

### Requirement: Valores padrão das configurações

O aplicativo DEVE definir valores padrão para todas as configurações quando o usuário abre o app pela primeira vez ou quando não existem configurações salvas no banco de dados.

#### Scenario: Tema padrão na primeira execução

WHEN o usuário abre o aplicativo pela primeira vez
AND nenhuma preferência de tema está salva no banco de dados
THEN o tema light DEVE ser aplicado como padrão
AND o toggle de tema na tela de configurações DEVE estar desativado (off)

#### Scenario: Versão padrão da Bíblia na primeira execução

WHEN o usuário abre o aplicativo pela primeira vez
AND nenhuma preferência de versão está salva no banco de dados
THEN a versão "nvi" DEVE ser selecionada como padrão
AND o seletor de versão DEVE exibir "nvi" como a versão ativa

#### Scenario: Inicialização com configurações ausentes no banco

WHEN o banco de dados SQLite existe mas a tabela de preferências está vazia
THEN o aplicativo DEVE utilizar os valores padrão (tema: light, versão: nvi)
AND o aplicativo NÃO DEVE apresentar erro ou tela em branco
