# Devocional Inteligente 📖

![Versão do App](https://img.shields.io/badge/Vers%C3%A3o-1.0.0-gold.svg)
![React Native](https://img.shields.io/badge/React_Native-0.81.5-blue.svg)
![Expo](https://img.shields.io/badge/Expo_SDK-54-lightgray.svg)

**Devocional Inteligente** é um aplicativo premium de leitura da Bíblia Sagrada desenvolvido com **React Native** e **Expo SDK 54**. Com um foco incomparável em experiência de usuário (UX) e performance, o aplicativo oferece transições fluidas, navegação intuitiva e suporte completo a funcionamento offline parcial por meio de banco de dados nativo.

<div align="center">
  <img src="./assets/images/icon.png" alt="Devocional Inteligente Splash" width="300" />
</div>

---

## 🌟 Funcionalidades Principais

- **Animações Premium**: Splash screen inteiramente desenhada com SVG nativo e React Native Reanimated, garantindo o melhor impacto visual na abertura do aplicativo. Transições suaves e naturais entre a leitura de capítulos (sem piscar a tela).
- **Leitura Imersiva**: Componentes de `Skeleton` fluidos previnem mudanças abruptas enquanto aguardam os dados da internet, oferecendo uma experiência focada (estilo Kindle/iBooks).
- **Cache Local Inteligente**: 
  - Banco de dados robusto rodando em `expo-sqlite`. 
  - Livros, configurações do usuário e capítulos recém-baixados são mantidos offline.
  - O catálogo de Versões da API (`/api/versions`) possui um mecanismo inteligente de retenção no `AsyncStorage` para evitar travamentos de rate limit.
- **Anotações Dinâmicas**: Um sistema completo para escrever notas devocionais atreladas aos versículos com temas visuais consolidados.
- **Continuidade de Leitura**: A página inicial ("Última Leitura") registra exatamente onde você parou e apresenta prévias automáticas truncadas para manter o visual limpo do aplicativo.

## 🛠️ Tecnologias Utilizadas

- **Core**: [React Native](https://reactnative.dev) e [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/)
- **Roteamento**: `expo-router` v6 com rotas dinâmicas
- **Armazenamento / Cache**: `expo-sqlite` (SQLite nativo) e `@react-native-async-storage/async-storage`
- **Animações e Interação**: `react-native-reanimated` e `react-native-gesture-handler`
- **API Externa**: Integração com *ABíbliaDigital* para dados em nuvem
- **UX/Design**: Tema desenhado de forma 100% customizada em Typescript, sem bibliotecas externas pesadas.

---

## 📡 API da Bíblia (Integração)

O aplicativo consome os dados da [ABíbliaDigital](https://www.abibliadigital.com.br) utilizando chamadas HTTP autenticadas (via cabeçalho `Authorization: Bearer {{token}}`). Os endpoints mapeados e cacheados localmente são:

- **1. Listagem de Livros** (`GET /api/books`)
  Retorna a lista completa dos livros contendo abreviação, nome, autor, número de capítulos e grupo.
- **2. Detalhe do Livro** (`GET /api/books/:abbrev`)
  Retorna informações específicas de um livro, incluindo um comentário e resumo histórico.
- **3. Leitura de Capítulos** (`GET /api/verses/:version/:abbrev/:chapter`)
  Retorna o array com os textos de todos os versículos de um capítulo na tradução solicitada (ex: `nvi`, `acf`).
- **4. Traduções Disponíveis** (`GET /api/versions`)
  Retorna o catálogo de versões bíblicas disponíveis na API. *(Cacheadas via AsyncStorage para evitar limits).*

---

## 🚀 Como Executar o Projeto

Siga as etapas abaixo para configurar o ambiente e executar o projeto localmente:

### 1. Pré-requisitos
- Node.js (v18 ou superior) instalado
- Aplicativo Expo Go instalado no seu dispositivo móvel, ou Emulador (Android Studio/Xcode).

### 2. Clonando e Instalando
Clone este repositório para o seu ambiente local e instale as dependências:

```bash
git clone https://github.com/lucasspeixoto/devocional-inteligente.git
cd devocional-inteligente
npm install
```

### 3. Configurando o Ambiente
Crie um arquivo `.env` na raiz do projeto e configure seu Token de Acesso da API da Bíblia:

```env
EXPO_PUBLIC_ACCESS_TOKEN=seu_token_de_acesso_aqui
```

### 4. Iniciando o Aplicativo
Execute o comando principal do Expo para ligar o servidor de desenvolvimento:

```bash
npx expo start
```
Após executar, leia o QR Code usando seu smartphone com o aplicativo Expo Go ou pressione `a` no terminal para rodar o emulador Android (e `i` para iOS).

---

## 🏗️ Estrutura do Projeto

Abaixo a arquitetura e principais diretórios desenvolvidos no ecossistema Expo Router:

```text
├── app/                  # Rotas do App (Expo Router)
│   ├── (tabs)/           # Telas com a barra inferior de navegação (Início, Livros, Configurações)
│   ├── reading/          # Telas de leitura contínua (Navegação por capítulos)
│   └── _layout.tsx       # Layout Global (Contextos de Tema, DB e Splash Screen inicial)
├── components/ui/        # Componentes base construídos sob medida (QuoteCard, VersesSkeleton, LoadingIndicator, etc)
├── constants/            # Tokens de estilo globais (typography, theme colors)
├── contexts/             # Conectores globais do React (ThemeContext, DatabaseContext)
├── hooks/                # Lógicas visuais e dados separadas (useChapter, useBooks, useSettings)
├── services/             # Regras de Negócios 
│   ├── api.ts            # Cliente Fetch de comunicação externa (com interceptação de cache)
│   └── repositories/     # Camada de manipulação do SQLite local (books, verses, preferences)
└── types/                # Definições TS estritas do domínio da aplicação
```

## 🤝 Contribuições

Este projeto foi gerado focado na consistência, velocidade e resiliência visual. Sinta-se à vontade para abrir Issues para discutir possíveis melhorias ou enviar Pull Requests. Ao contribuir, por favor siga o padrão de linting do projeto executando `npm run lint` e resolvendo todos os alertas indicados.

---
Feito com dedicação para a Palavra. 📖✨
