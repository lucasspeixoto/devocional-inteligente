## Context

O aplicativo Expo SDK 54 usa hooks que primeiro consultam SQLite e, na ausência de dados, recorrem a `services/api.ts`. Livros, capítulos e versões dependem da API descontinuada; notas e preferências usam o identificador de versão como parte de suas consultas. `databases/NVI.json` contém 66 objetos no formato `{ abbrev, chapters: string[][] }`, totaliza cerca de 4,6 MB e não inclui os metadados completos anteriormente retornados por `/api/books`.

O Expo SDK 54/Metro aceita JSON como módulo do bundle. O SQLite já é o ponto comum de leitura do aplicativo e oferece transações assíncronas, portanto permanece como índice persistente para não manter toda a Bíblia parseada em memória durante cada sessão.

## Goals / Non-Goals

**Goals:**

- Tornar catálogo, leitura e anotações NVI independentes de rede desde a primeira execução.
- Manter contratos de repositório e o código canônico `nvi` onde isso reduz o risco de migração.
- Preparar a base grande sem bloquear desnecessariamente a interface e sem deixar seeds parciais.
- Preservar preferências, progresso, comentários e notas existentes.
- Tornar erros de integridade local diagnosticáveis e testáveis.

**Non-Goals:**

- Adicionar outras traduções, download opcional ou atualização remota da Bíblia.
- Converter o JSON em um banco SQLite pré-construído nesta mudança.
- Reclassificar ou enriquecer o texto bíblico com recursos editoriais novos.
- Associar automaticamente notas de outras traduções ao texto NVI.

## Decisions

### 1. Adaptador tipado sobre import estático do JSON

Criar uma fonte local dedicada que importe estaticamente `databases/NVI.json`, valide sua forma e exponha catálogo/capítulos normalizados. O import estático permite que Metro inclua o arquivo no bundle em Android, iOS e web sem acesso ao sistema de arquivos em runtime.

Alternativas consideradas:

- Ler o JSON com API de arquivos/assets: acrescenta cópia, URI e diferenças entre plataformas sem benefício para um recurso imutável.
- Consultar o JSON diretamente em cada hook: duplica normalização, aumenta acoplamento e pode repetir parsing/transformação.
- Entregar SQLite pré-populado: melhora o primeiro seed, mas exige pipeline de geração e migração de asset mais amplo que o necessário agora.

### 2. SQLite como representação preparada, com seed revisionado

Na inicialização, comparar uma constante de revisão do conteúdo com metadado persistido. Se ausente ou diferente, validar a fonte e executar um upsert/substituição da NVI em uma transação, marcando a revisão somente após sucesso. Consultas normais continuam nos repositórios SQLite.

O seed deve inserir em lotes por livro/capítulo para evitar uma chamada JS-nativa por versículo quando a API do SQLite permitir, cedendo controle entre lotes caso a medição em dispositivo revele bloqueio perceptível. A tela raiz mantém estado de preparação até o banco estar consistente.

Alternativas consideradas:

- Ler sempre do JSON: simplifica persistência bíblica, mas obriga refatoração maior das consultas, notas e joins e aumenta memória/tempo de parse por sessão.
- Seed apenas quando `books` estiver vazio: não detecta atualização do asset nem bancos parcialmente populados.

### 3. Metadados de livros locais separados do texto

Manter um catálogo local tipado com nome, abreviação canônica, autor, grupo e testamento na ordem dos 66 objetos do JSON. Durante a validação, cada entrada do catálogo deve corresponder exatamente a um livro da base após normalização case-insensitive; o número de capítulos deriva do JSON.

Alternativas consideradas:

- Inferir todos os metadados apenas pela abreviação: o JSON não contém nome, autor, grupo ou testamento.
- Reutilizar dados já cacheados da API: instalações novas não os possuem e o resultado não seria determinístico.

### 4. Compatibilidade por código `nvi`, sem seletor

Preservar o campo `version` nas tabelas e nos contratos de notas nesta mudança, mas fixar o fluxo ativo em `nvi`. Isso mantém notas NVI e consultas existentes compatíveis. A UI remove lista, loading/error de versões e callback de seleção, apresentando apenas o rótulo estático "NVI (Nova Versão Internacional)". Preferências legadas diferentes são normalizadas para `nvi`; notas de outras versões permanecem armazenadas e invisíveis no fluxo NVI.

Alternativas consideradas:

- Remover imediatamente todas as colunas `version`: exige recriar tabelas e aumenta risco de perda ou associação incorreta de notas.
- Migrar notas de qualquer versão para NVI: uma nota pode depender do texto da tradução original e não deve ser reatribuída silenciosamente.

### 5. Remoção completa do caminho remoto

Eliminar cliente HTTP, token público, cache de versões e fallbacks de rede. Os hooks passam a depender apenas da preparação/local repositories; `refresh` repete a consulta local, não sincroniza. Tipos específicos de respostas da API são removidos ou substituídos por modelos locais.

Alternativa considerada: manter a API como fallback oculto. Isso conserva código morto, produz atrasos/erros e contradiz a garantia offline.

## Risks / Trade-offs

- [Seed inicial de dezenas de milhares de versículos pode aumentar o tempo da primeira abertura] → usar transação e lotes, medir em dispositivo e exibir preparação explícita.
- [Importar 4,6 MB de JSON aumenta bundle e memória temporária] → carregar uma vez, liberar referências intermediárias após o seed e acompanhar tamanho/tempo de inicialização.
- [Metadados manuais podem divergir das abreviações do JSON] → validação automatizada de unicidade, cobertura dos 66 livros, ordem e contagens de capítulos.
- [Interrupção durante atualização pode deixar conteúdo inconsistente] → transação atômica e revisão gravada apenas após commit.
- [Seed indiscriminado pode sobrescrever comentários do usuário em `books`] → atualizar somente metadados editoriais, preservando a coluna `comment`.
- [Notas legadas de outras traduções deixam de aparecer] → preservar linhas sem convertê-las e documentar que apenas notas `nvi` são exibidas.

## Migration Plan

1. Introduzir catálogo/metadados e fonte NVI local com testes de integridade, sem alterar consumidores.
2. Adicionar metadado de revisão e seed transacional idempotente; testar banco novo, banco parcial e banco existente com notas/comentários/progresso.
3. Executar o seed durante a inicialização do contexto do banco e só então disponibilizar os hooks consumidores.
4. Trocar livros e capítulos para consultas exclusivamente locais e remover os fallbacks HTTP.
5. Fixar configurações em `nvi`, remover o seletor e normalizar preferências legadas.
6. Remover serviço/tipos/cache/token da API e validar que não há referência ao domínio descontinuado.
7. Validar lint, tipos, testes e builds/exports relevantes do Expo SDK 54, incluindo uma execução sem conectividade.

Rollback: restaurar o código da versão anterior não recupera a API descontinuada, mas o schema compatível permite abrir o mesmo banco. Não apagar notas de outras versões nem remover colunas durante esta mudança, garantindo reversibilidade dos dados do usuário.
