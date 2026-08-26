## Purpose

Fornecer o catálogo e todo o texto da Bíblia NVI a partir de um recurso empacotado, com comportamento determinístico e independente de conectividade.

## ADDED Requirements

### Requirement: Disponibilidade integral da NVI offline
O sistema MUST disponibilizar os 66 livros, todos os capítulos e versículos contidos em `databases/NVI.json` sem realizar requisições de rede.

#### Scenario: Leitura sem conectividade
- **WHEN** o aplicativo é iniciado sem acesso à internet e o usuário abre qualquer capítulo válido
- **THEN** o sistema DEVE exibir os versículos NVI correspondentes a partir da base empacotada

### Requirement: Tradução canônica única
O sistema MUST identificar todo conteúdo bíblico empacotado com o código canônico `nvi` e o nome público "NVI (Nova Versão Internacional)".

#### Scenario: Identificação da tradução
- **WHEN** a tradução do conteúdo é apresentada ao usuário ou associada a dados locais
- **THEN** o sistema DEVE usar o nome público "NVI (Nova Versão Internacional)" e o código persistido `nvi`

### Requirement: Validação da estrutura empacotada
O sistema MUST rejeitar a inicialização da fonte bíblica quando um livro não possuir abreviação válida, capítulos não forem listas ou versículos não forem textos não vazios, apresentando erro local acionável em vez de dados parciais.

#### Scenario: Base empacotada inválida
- **WHEN** a estrutura do arquivo NVI não satisfaz o contrato esperado
- **THEN** o sistema DEVE sinalizar falha de dados locais e NÃO DEVE tentar obter conteúdo pela rede

### Requirement: Referências bíblicas normalizadas
O sistema MUST resolver as abreviações da base independentemente de diferenças de caixa e retornar capítulos e versículos com numeração baseada em 1.

#### Scenario: Consulta por abreviação em caixa diferente
- **WHEN** um livro válido é consultado com abreviação em caixa diferente da armazenada
- **THEN** o sistema DEVE localizar o mesmo livro e numerar capítulos e versículos a partir de 1
