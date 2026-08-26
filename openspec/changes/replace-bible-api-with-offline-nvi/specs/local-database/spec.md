## ADDED Requirements

### Requirement: Seed idempotente da NVI empacotada
O sistema MUST preparar no SQLite os livros e versículos da base NVI de forma atômica e idempotente, registrando uma revisão da base para evitar reprocessamento desnecessário e permitir atualização futura do conteúdo empacotado.

#### Scenario: Primeira inicialização
- **WHEN** o banco é criado sem dados bíblicos preparados
- **THEN** os 66 livros e respectivos versículos DEVEM ser inseridos como `nvi` em uma transação antes de o conteúdo ser liberado para leitura

#### Scenario: Inicialização com revisão atual
- **WHEN** a revisão da base preparada corresponde à revisão empacotada
- **THEN** o sistema NÃO DEVE reinserir todos os livros e versículos

#### Scenario: Falha durante o seed
- **WHEN** uma falha ocorre antes da conclusão da preparação
- **THEN** a transação DEVE ser revertida e a revisão NÃO DEVE ser marcada como concluída

### Requirement: Migração preserva dados do usuário
O sistema MUST preservar tema, último ponto de leitura, comentários e notas existentes durante a migração e normalizar a preferência de versão para `nvi`.

#### Scenario: Atualização de instalação com dados existentes
- **WHEN** uma instalação existente é atualizada para a base offline
- **THEN** tema, progresso, comentários e notas associadas a `nvi` DEVEM permanecer acessíveis e a versão selecionada DEVE resultar em `nvi`

#### Scenario: Notas de outra tradução preexistente
- **WHEN** existem notas associadas a uma tradução diferente de `nvi`
- **THEN** elas DEVEM ser preservadas no armazenamento, mas NÃO DEVEM ser apresentadas como notas do texto NVI

## MODIFIED Requirements

### Requirement: Persistência de Preferências do Usuário
O sistema MUST persistir tema e último ponto de leitura em um registro local singleton; a tradução DEVE permanecer canonicamente `nvi` e não pode ser alterada pelo usuário.

#### Scenario: Inicializar preferências padrão
- **WHEN** não existe registro de preferências
- **THEN** o sistema DEVE criar o registro com tema `light`, tradução `nvi` e posição de leitura vazia

#### Scenario: Ler preferências atuais
- **WHEN** o aplicativo consulta o registro singleton
- **THEN** o sistema DEVE retornar tema, tradução `nvi` e último ponto de leitura

#### Scenario: Alterar versão da Bíblia selecionada
- **WHEN** o registro existente contém uma versão diferente de `nvi`
- **THEN** o sistema DEVE normalizá-la para `nvi` sem alterar as demais preferências

#### Scenario: Alterar tema do aplicativo
- **WHEN** o usuário alterna entre os temas suportados
- **THEN** o novo tema DEVE ser persistido imediatamente

#### Scenario: Tentar definir tema inválido
- **WHEN** uma preferência de tema fora de `light` e `dark` é submetida
- **THEN** o banco DEVE rejeitar a alteração e preservar o tema válido anterior

## REMOVED Requirements

### Requirement: Sincronização de Dados da API para o Banco Local
**Reason**: A fonte remota foi descontinuada e a Bíblia completa passa a ser distribuída com o aplicativo.
**Migration**: Substituir sincronização sob demanda pelo seed idempotente e versionado da NVI empacotada.
