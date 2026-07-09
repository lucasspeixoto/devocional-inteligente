## Why

O projeto "Devocional Inteligente" precisa de sua funcionalidade principal: um leitor de Bíblia completo com dados armazenados localmente via SQLite, integrado à API da Bíblia Digital. Atualmente o projeto é apenas um scaffold vazio do Expo Router. O usuário precisa de um app funcional para leitura bíblica com navegação intuitiva, anotações pessoais, e configurações persistentes — tudo consumindo dados da API e armazenando-os localmente para uso offline.

## What Changes

- **Nova estrutura de navegação com tabs**: Home (leitura), Livros, e Configurações usando Expo Router com bottom tabs
- **Integração com API da Bíblia Digital**: Serviço HTTP para consumir endpoints de livros, versículos, detalhes e versões com autenticação Bearer token
- **Banco de dados local SQLite**: Armazenamento de livros, versículos, anotações, preferências do usuário e último versículo lido
- **Tela Home com leitura**: Exibição do último versículo/capítulo lido, com navegação por swipe (gestos esquerda/direita) entre capítulos
- **Tela de Livros**: Listagem de todos os livros da Bíblia agrupados, com tela de detalhes por livro
- **Sistema de anotações**: Capacidade de criar, editar e excluir anotações associadas a versículos específicos
- **Tela de Configurações**: Toggle de tema (light/dark) e seletor de versão da Bíblia, com persistência local
- **Sistema de temas**: Tema light e dark com cor primária em tons de marrom e secundária em amarelo, com animações e layout premium

## Capabilities

### New Capabilities
- `bible-api-service`: Serviço de integração com a API da Bíblia Digital (livros, versículos, detalhes, versões) com autenticação Bearer
- `local-database`: Banco de dados SQLite para armazenamento offline de livros, versículos, anotações e preferências
- `bible-reader`: Tela principal de leitura com exibição de versículos, navegação por swipe entre capítulos e retomada do último ponto de leitura
- `books-catalog`: Listagem e detalhes dos livros da Bíblia com informações da API
- `notes-system`: Sistema de anotações vinculadas a versículos específicos
- `settings-screen`: Tela de configurações com alternância de tema e seleção de versão da Bíblia
- `theming`: Sistema de temas (light/dark) com paleta marrom/amarelo e animações

### Modified Capabilities
_Nenhuma — projeto novo._

## Impact

- **Novas dependências**: `expo-sqlite`, `expo-haptics` (já presente), possivelmente `@expo/vector-icons` (já presente)
- **Estrutura de navegação**: Migração do layout raiz de `Stack` simples para estrutura com `Tabs` + `Stack` aninhado
- **Arquivos de app**: Criação de múltiplas telas e componentes dentro de `app/`
- **Serviços**: Novo diretório `services/` para API e banco de dados
- **Tipos**: Novo diretório `types/` para interfaces TypeScript
- **Constantes/Tema**: Novo diretório `constants/` para definição de cores e temas
