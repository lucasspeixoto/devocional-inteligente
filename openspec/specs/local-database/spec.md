# local-database

Banco de dados local SQLite.

## Requirements

### Requirement: Inicialização do Banco de Dados

O sistema DEVE inicializar um banco de dados SQLite local utilizando `expo-sqlite` na primeira execução do aplicativo. O banco DEVE criar todas as tabelas necessárias automaticamente caso ainda não existam, garantindo que o app funcione corretamente mesmo sem conexão com a internet após a sincronização inicial.

#### Scenario: Criação do banco na primeira execução

WHEN o aplicativo é iniciado pela primeira vez
THEN o banco de dados SQLite DEVE ser criado com o nome definido para o aplicativo
AND todas as tabelas (books, chapters, verses, notes, user_preferences) DEVEM ser criadas automaticamente

#### Scenario: Banco já existente em execuções subsequentes

WHEN o aplicativo é iniciado e o banco de dados já existe
THEN o sistema NÃO DEVE recriar as tabelas existentes
AND os dados previamente armazenados DEVEM permanecer intactos

#### Scenario: Tratamento de erro na inicialização

WHEN ocorre um erro durante a criação ou abertura do banco de dados
THEN o sistema DEVE capturar o erro e registrar uma mensagem de log adequada
AND o app DEVE exibir uma mensagem informando que houve um problema ao acessar os dados locais

---

### Requirement: Schema do Banco de Dados

O banco de dados DEVE conter tabelas para armazenar livros, capítulos/versículos, anotações do usuário e preferências do usuário. Cada tabela DEVE ter chaves primárias definidas e os relacionamentos necessários via chaves estrangeiras.

#### Scenario: Tabela de livros contém campos obrigatórios

WHEN a tabela `books` é criada
THEN ela DEVE conter os campos: `abbrev` (TEXT, PRIMARY KEY), `name` (TEXT NOT NULL), `author` (TEXT), `group_name` (TEXT), `chapters` (INTEGER NOT NULL), `testament` (TEXT NOT NULL), `version` (TEXT NOT NULL)
AND DEVE existir um índice sobre o campo `testament` para facilitar consultas por testamento

#### Scenario: Tabela de versículos contém campos obrigatórios

WHEN a tabela `verses` é criada
THEN ela DEVE conter os campos: `id` (INTEGER, PRIMARY KEY AUTOINCREMENT), `book_abbrev` (TEXT NOT NULL), `chapter` (INTEGER NOT NULL), `verse_number` (INTEGER NOT NULL), `text` (TEXT NOT NULL), `version` (TEXT NOT NULL)
AND DEVE existir uma chave estrangeira de `book_abbrev` referenciando `books(abbrev)`
AND DEVE existir um índice composto sobre (`book_abbrev`, `chapter`, `version`) para consultas eficientes

#### Scenario: Tabela de anotações contém campos obrigatórios

WHEN a tabela `notes` é criada
THEN ela DEVE conter os campos: `id` (INTEGER, PRIMARY KEY AUTOINCREMENT), `book_abbrev` (TEXT NOT NULL), `chapter` (INTEGER NOT NULL), `verse_number` (INTEGER NOT NULL), `version` (TEXT NOT NULL), `content` (TEXT NOT NULL), `created_at` (TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP), `updated_at` (TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)
AND DEVE existir uma chave estrangeira de `book_abbrev` referenciando `books(abbrev)`

#### Scenario: Tabela de preferências do usuário contém campos obrigatórios

WHEN a tabela `user_preferences` é criada
THEN ela DEVE conter os campos: `id` (INTEGER, PRIMARY KEY, DEFAULT 1), `selected_version` (TEXT NOT NULL DEFAULT 'nvi'), `theme` (TEXT NOT NULL DEFAULT 'light'), `last_book_abbrev` (TEXT), `last_chapter` (INTEGER), `last_verse` (INTEGER)
AND DEVE existir uma constraint CHECK para garantir que `id` seja sempre 1 (registro singleton)
AND DEVE existir uma constraint CHECK para garantir que `theme` seja 'light' ou 'dark'

---

### Requirement: CRUD de Livros

O sistema DEVE fornecer operações de criação, leitura, atualização e exclusão para livros da Bíblia armazenados no banco de dados local.

#### Scenario: Inserir um livro no banco de dados

WHEN um livro é recebido da API com dados válidos (abbrev, name, chapters, testament, version)
THEN o sistema DEVE inserir o registro na tabela `books`
AND o livro DEVE ser recuperável por sua `abbrev`

#### Scenario: Inserir múltiplos livros em lote

WHEN uma lista de livros é recebida da API
THEN o sistema DEVE inserir todos os livros em uma única transação
AND se qualquer inserção falhar, toda a transação DEVE ser revertida (rollback)

#### Scenario: Listar todos os livros

WHEN o usuário solicita a lista de livros
THEN o sistema DEVE retornar todos os livros armazenados no banco local
AND os livros DEVEM estar ordenados pela ordem canônica (ordem de inserção ou campo explícito)

#### Scenario: Listar livros por testamento

WHEN o usuário filtra por testamento (ex: "VT" ou "NT")
THEN o sistema DEVE retornar apenas os livros que pertencem ao testamento solicitado

#### Scenario: Buscar livro por abreviação

WHEN o usuário busca um livro pela abreviação (ex: "gn" para Gênesis)
THEN o sistema DEVE retornar os dados completos do livro correspondente
AND se não existir livro com a abreviação informada, DEVE retornar `null`

#### Scenario: Inserir livro duplicado com conflito

WHEN um livro com a mesma `abbrev` e `version` já existe no banco
THEN o sistema DEVE atualizar os dados existentes (upsert) em vez de criar duplicata
AND nenhum erro DEVE ser lançado para o usuário

---

### Requirement: CRUD de Versículos e Capítulos

O sistema DEVE fornecer operações de criação, leitura, atualização e exclusão para versículos armazenados no banco de dados local, organizados por livro, capítulo e versão.

#### Scenario: Inserir versículos de um capítulo

WHEN os versículos de um capítulo específico são recebidos da API
THEN o sistema DEVE inserir todos os versículos na tabela `verses` com os campos `book_abbrev`, `chapter`, `verse_number`, `text` e `version`
AND a inserção DEVE ocorrer dentro de uma transação

#### Scenario: Buscar versículos por livro e capítulo

WHEN o usuário navega para um capítulo específico de um livro (ex: Gênesis capítulo 1)
THEN o sistema DEVE retornar todos os versículos daquele capítulo, ordenados por `verse_number`
AND a consulta DEVE filtrar pela versão da Bíblia selecionada nas preferências do usuário

#### Scenario: Buscar versículo específico

WHEN o sistema precisa de um versículo específico (ex: Gênesis 1:1 na versão NVI)
THEN DEVE ser possível consultar por `book_abbrev`, `chapter`, `verse_number` e `version`
AND DEVE retornar o texto do versículo ou `null` se não encontrado

#### Scenario: Verificar se capítulo já foi baixado

WHEN o app precisa exibir um capítulo
THEN o sistema DEVE verificar se os versículos daquele capítulo e versão já existem localmente
AND DEVE retornar um booleano indicando se o capítulo está disponível offline

#### Scenario: Substituir versículos ao re-sincronizar

WHEN versículos de um capítulo que já existe localmente são recebidos novamente da API
THEN o sistema DEVE excluir os versículos antigos daquele capítulo/versão
AND DEVE inserir os novos versículos em uma única transação

---

### Requirement: CRUD de Anotações

O sistema DEVE permitir que o usuário crie, leia, atualize e exclua anotações associadas a versículos específicos da Bíblia.

#### Scenario: Criar uma nova anotação

WHEN o usuário cria uma anotação para um versículo específico (ex: Gênesis 1:1)
THEN o sistema DEVE inserir um registro na tabela `notes` com `book_abbrev`, `chapter`, `verse_number`, `version` e `content`
AND o campo `created_at` DEVE ser preenchido automaticamente com a data/hora atual
AND o campo `updated_at` DEVE ser preenchido automaticamente com a data/hora atual

#### Scenario: Listar anotações de um versículo

WHEN o usuário visualiza um versículo que possui anotações
THEN o sistema DEVE retornar todas as anotações associadas àquele versículo (filtradas por `book_abbrev`, `chapter`, `verse_number`, `version`)
AND as anotações DEVEM ser ordenadas por `created_at` em ordem decrescente (mais recente primeiro)

#### Scenario: Listar todas as anotações do usuário

WHEN o usuário acessa a lista geral de anotações
THEN o sistema DEVE retornar todas as anotações armazenadas no banco
AND cada anotação DEVE incluir informações do versículo associado (livro, capítulo, versículo)
AND as anotações DEVEM ser ordenadas por `updated_at` em ordem decrescente

#### Scenario: Editar uma anotação existente

WHEN o usuário edita o conteúdo de uma anotação existente
THEN o sistema DEVE atualizar o campo `content` do registro correspondente
AND o campo `updated_at` DEVE ser atualizado para a data/hora atual
AND o campo `created_at` NÃO DEVE ser alterado

#### Scenario: Excluir uma anotação

WHEN o usuário exclui uma anotação
THEN o sistema DEVE remover o registro correspondente da tabela `notes`
AND a exclusão DEVE ser confirmada retornando o número de registros afetados (1)

#### Scenario: Criar anotação com conteúdo vazio

WHEN o usuário tenta salvar uma anotação sem conteúdo (string vazia ou somente espaços)
THEN o sistema DEVE rejeitar a operação
AND DEVE retornar um erro indicando que o conteúdo da anotação é obrigatório

---

### Requirement: Persistência de Preferências do Usuário

O sistema DEVE armazenar e recuperar as preferências do usuário em um registro singleton na tabela `user_preferences`, incluindo versão da Bíblia selecionada e tema visual.

#### Scenario: Inicializar preferências padrão

WHEN o banco de dados é criado e a tabela `user_preferences` está vazia
THEN o sistema DEVE inserir um registro com os valores padrão: `selected_version = 'nvi'`, `theme = 'light'`, e campos de último ponto de leitura como `NULL`

#### Scenario: Ler preferências atuais

WHEN o aplicativo precisa acessar as preferências do usuário
THEN o sistema DEVE retornar o registro singleton da tabela `user_preferences`
AND DEVE incluir todos os campos: `selected_version`, `theme`, `last_book_abbrev`, `last_chapter`, `last_verse`

#### Scenario: Alterar versão da Bíblia selecionada

WHEN o usuário seleciona uma versão diferente da Bíblia (ex: de "nvi" para "acf")
THEN o sistema DEVE atualizar o campo `selected_version` no registro de preferências
AND a nova versão DEVE ser refletida nas próximas consultas de versículos

#### Scenario: Alterar tema do aplicativo

WHEN o usuário altera o tema de "light" para "dark" (ou vice-versa)
THEN o sistema DEVE atualizar o campo `theme` no registro de preferências
AND o valor DEVE ser exatamente "light" ou "dark"

#### Scenario: Tentar definir tema inválido

WHEN o sistema tenta salvar um valor de tema diferente de "light" ou "dark"
THEN a operação DEVE falhar com um erro de constraint
AND o valor anterior do tema DEVE ser preservado

---

### Requirement: Rastreamento do Último Ponto de Leitura

O sistema DEVE rastrear e persistir a última posição de leitura do usuário (livro, capítulo e versículo) para que a leitura possa ser retomada exatamente de onde parou.

#### Scenario: Salvar posição de leitura ao navegar

WHEN o usuário navega para um capítulo (ex: abre Gênesis capítulo 3)
THEN o sistema DEVE atualizar os campos `last_book_abbrev`, `last_chapter` e `last_verse` na tabela `user_preferences`
AND os valores DEVEM corresponder ao livro e capítulo atualmente exibidos

#### Scenario: Restaurar última posição ao abrir o app

WHEN o aplicativo é aberto e existem dados de última leitura armazenados
THEN o sistema DEVE consultar os campos `last_book_abbrev`, `last_chapter` e `last_verse` da tabela `user_preferences`
AND DEVE retornar os valores para que a tela de leitura navegue diretamente ao ponto salvo

#### Scenario: Primeira abertura sem posição salva

WHEN o aplicativo é aberto pela primeira vez e não há posição de leitura salva (campos são NULL)
THEN o sistema DEVE retornar `null` para os campos de última leitura
AND a tela de leitura DEVE definir um padrão (ex: Gênesis capítulo 1)

#### Scenario: Atualizar posição ao mudar de capítulo por swipe

WHEN o usuário navega para o próximo ou anterior capítulo via gesto de swipe
THEN o sistema DEVE atualizar automaticamente a posição de leitura com o novo capítulo
AND a atualização DEVE ser feita de forma assíncrona sem bloquear a navegação

---

### Requirement: Sincronização de Dados da API para o Banco Local

O sistema DEVE sincronizar dados recebidos da API da Bíblia Digital para o banco de dados SQLite local, permitindo que o aplicativo funcione completamente offline após a sincronização inicial.

#### Scenario: Sincronizar lista de livros da API

WHEN o app se conecta à API e recebe a lista de livros da Bíblia
THEN o sistema DEVE mapear os dados da API para o schema da tabela `books`
AND DEVE inserir ou atualizar (upsert) todos os livros no banco local em uma única transação
AND a transação DEVE ser atômica — se falhar, nenhum livro é inserido

#### Scenario: Sincronizar versículos de um capítulo sob demanda

WHEN o usuário acessa um capítulo que ainda não foi baixado localmente
THEN o sistema DEVE buscar os versículos daquele capítulo na API
AND DEVE armazená-los na tabela `verses` com a versão correspondente
AND após a sincronização, o capítulo DEVE estar disponível offline

#### Scenario: Não buscar na API dados já disponíveis localmente

WHEN o usuário acessa um capítulo que já foi sincronizado anteriormente
THEN o sistema DEVE servir os dados diretamente do banco local
AND NÃO DEVE fazer requisição à API

#### Scenario: Falha na sincronização com a API

WHEN a sincronização com a API falha (erro de rede, timeout, erro do servidor)
THEN o sistema DEVE registrar o erro em log
AND se existirem dados locais para o conteúdo solicitado, DEVE exibi-los
AND se não existirem dados locais, DEVE informar ao usuário que é necessário conexão com a internet para baixar o conteúdo

#### Scenario: Sincronizar dados para versão diferente da Bíblia

WHEN o usuário troca a versão da Bíblia selecionada (ex: de "nvi" para "acf")
THEN os capítulos já baixados na versão anterior DEVEM permanecer no banco
AND novos capítulos acessados DEVEM ser buscados na API para a nova versão
AND os dados de ambas as versões DEVEM coexistir no banco local sem conflito
