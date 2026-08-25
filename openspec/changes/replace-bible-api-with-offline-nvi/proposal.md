## Why

A API A Bíblia Digital foi descontinuada, deixando a leitura, o catálogo e as configurações dependentes de um serviço indisponível. O aplicativo deve passar a distribuir e consultar a Bíblia NVI local de `databases/NVI.json`, garantindo funcionamento integralmente offline e uma única tradução suportada.

## What Changes

- Substituir todas as consultas à API remota por uma fonte bíblica empacotada baseada em `databases/NVI.json`.
- Popular e consultar o catálogo de 66 livros e seus versículos localmente, sem sincronização ou fallback de rede.
- Fixar a tradução canônica em `nvi`, exibida ao usuário como "NVI (Nova Versão Internacional)", preservando a associação de notas e dados já gravados com esse identificador.
- Remover a busca, o cache e a seleção de múltiplas versões da Bíblia na tela de configurações.
- Ajustar estados de carregamento, erro e atualização para refletirem somente operações locais.
- Remover configuração de token, cliente HTTP e dependências/caches usados exclusivamente pela antiga API.
- **BREAKING**: remover o contrato de integração com `https://www.abibliadigital.com.br` e o suporte a traduções diferentes de NVI.

## Capabilities

### New Capabilities

- `offline-bible-source`: carregamento validado da Bíblia NVI empacotada e transformação do JSON local para os modelos usados pelo aplicativo.

### Modified Capabilities

- `bible-api-service`: remover o contrato HTTP descontinuado e delegar o fornecimento de conteúdo à fonte offline NVI.
- `books-catalog`: obter o catálogo e a quantidade de capítulos exclusivamente da base local.
- `bible-reader`: carregar qualquer capítulo da NVI sem rede ou sincronização sob demanda.
- `local-database`: inicializar/atualizar deterministicamente os dados bíblicos empacotados, preservando preferências, progresso, comentários e notas do usuário.
- `settings-screen`: remover o seletor e a persistência de múltiplas versões, mantendo NVI como única tradução informada ao usuário.

## Impact

- Afeta `services/api.ts`, inicialização e repositórios SQLite, hooks de livros/capítulos/configurações, contexto de configurações, tela de configurações e tipos da API.
- Introduz um adaptador local para `databases/NVI.json` e uma estratégia idempotente de seed/migração do SQLite.
- Remove chamadas de rede, `EXPO_PUBLIC_ACCESS_TOKEN` e o cache de versões no AsyncStorage; o arquivo bíblico passa a integrar o bundle do aplicativo Expo.
- Exige testes para integridade dos 66 livros, normalização de abreviações, limites de capítulos/versículos, inicialização limpa, atualização de instalações existentes e leitura sem conectividade.
