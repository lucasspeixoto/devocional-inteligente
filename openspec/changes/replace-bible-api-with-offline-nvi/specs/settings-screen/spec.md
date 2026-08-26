## ADDED Requirements

### Requirement: Identificação da Bíblia disponível
A tela de configurações MUST informar de forma não interativa que a Bíblia disponível é "NVI (Nova Versão Internacional)".

#### Scenario: Exibição da tradução única
- **WHEN** o usuário abre a tela de configurações
- **THEN** a tela DEVE apresentar "NVI (Nova Versão Internacional)" sem controle para trocar a tradução

## MODIFIED Requirements

### Requirement: Exibição da tela de configurações
A tela de configurações MUST continuar acessível como a última aba da navegação inferior e conter a alternância de aparência e a identificação da tradução NVI disponível.

#### Scenario: Navegação para a tela de configurações via bottom tab
- **WHEN** o usuário toca na última aba da navegação inferior
- **THEN** a tela DEVE exibir as seções de aparência e Bíblia disponível

#### Scenario: Posição da aba de configurações na navegação
- **WHEN** a navegação inferior é exibida
- **THEN** Configurações DEVE permanecer como a última aba

### Requirement: Persistência das configurações
A tela MUST persistir imediatamente alterações de tema; nenhuma escolha de tradução DEVE ser solicitada ou persistida a partir da interface.

#### Scenario: Persistência do tema após reiniciar o app
- **WHEN** o usuário altera o tema e reinicia o aplicativo
- **THEN** o tema escolhido DEVE continuar ativo e a Bíblia DEVE continuar identificada como NVI

#### Scenario: Persistência da versão da Bíblia após reiniciar o app
- **WHEN** o aplicativo é reiniciado após migrar uma preferência legada
- **THEN** a tradução DEVE permanecer canonicamente `nvi`

#### Scenario: Gravação imediata no banco ao alterar tema
- **WHEN** o usuário alterna o tema
- **THEN** a alteração DEVE ser gravada imediatamente

#### Scenario: Gravação imediata no banco ao alterar versão
- **WHEN** a interface de configurações é utilizada
- **THEN** nenhuma alteração de versão DEVE ser oferecida ou gravada e o valor canônico DEVE permanecer `nvi`

### Requirement: Valores padrão das configurações
Na primeira execução ou na ausência de preferências válidas, o sistema MUST usar tema claro e a tradução canônica `nvi`.

#### Scenario: Tema padrão na primeira execução
- **WHEN** o aplicativo inicia sem preferências anteriores
- **THEN** o tema DEVE ser claro

#### Scenario: Versão padrão da Bíblia na primeira execução
- **WHEN** o aplicativo inicia sem preferências anteriores
- **THEN** a tradução exibida DEVE ser "NVI (Nova Versão Internacional)"

#### Scenario: Inicialização com configurações ausentes no banco
- **WHEN** o registro de configurações está ausente
- **THEN** ele DEVE ser recriado com tema `light` e tradução `nvi`

## REMOVED Requirements

### Requirement: Seleção de versão da Bíblia
**Reason**: NVI é a única tradução disponível.
**Migration**: Substituir o seletor por identificação estática da NVI.

### Requirement: Aplicação imediata das mudanças
**Reason**: Os cenários de aplicação imediata da troca de versão deixam de existir; o comportamento de tema permanece definido na capability de theming e na alternância de tema desta tela.
**Migration**: Remover estado e callbacks de troca de tradução.
