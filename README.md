# Devocional Inteligente 📖

![Versão do App](https://img.shields.io/badge/Vers%C3%A3o-1.0.0-gold.svg)
![React Native](https://img.shields.io/badge/React_Native-0.81.5-blue.svg)
![Expo](https://img.shields.io/badge/Expo_SDK-54-lightgray.svg)

**Devocional Inteligente** é um aplicativo de leitura da Bíblia Sagrada desenvolvido com **React Native** e **Expo SDK 54**. A tradução NVI completa é distribuída com o aplicativo e funciona sem conexão com a internet.

<div align="center">
  <img src="./assets/images/icon.png" alt="Devocional Inteligente Splash" width="300" />
</div>

---

## 🌟 Funcionalidades Principais

- **Animações Premium**: Splash screen inteiramente desenhada com SVG nativo e React Native Reanimated, garantindo o melhor impacto visual na abertura do aplicativo. Transições suaves e naturais entre a leitura de capítulos (sem piscar a tela).
- **Leitura Imersiva**: a Bíblia NVI completa está disponível offline desde a primeira execução.
- **Base Local**: `databases/NVI.json` é validado e preparado de forma transacional no `expo-sqlite`, preservando notas, comentários, tema e posição de leitura.
- **Anotações Dinâmicas**: Um sistema completo para escrever notas devocionais atreladas aos versículos com temas visuais consolidados.
- **Continuidade de Leitura**: A página inicial ("Última Leitura") registra exatamente onde você parou e apresenta prévias automáticas truncadas para manter o visual limpo do aplicativo.

## 🛠️ Tecnologias Utilizadas

- **Core**: [React Native](https://reactnative.dev) e [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/)
- **Roteamento**: `expo-router` v6 com rotas dinâmicas
- **Armazenamento**: `expo-sqlite` (SQLite nativo)
- **Animações e Interação**: `react-native-reanimated` e `react-native-gesture-handler`
- **Conteúdo bíblico**: NVI empacotada em `databases/NVI.json`, sem API ou token
- **UX/Design**: Tema desenhado de forma 100% customizada em Typescript, sem bibliotecas externas pesadas.

---

## 📖 Base bíblica offline

O aplicativo oferece uma única tradução: **NVI (Nova Versão Internacional)**. O conteúdo é importado estaticamente de `databases/NVI.json`; não há chamadas HTTP, sincronização sob demanda, variável de ambiente ou token de acesso.

No deploy web, o servidor deve enviar os cabeçalhos `Cross-Origin-Embedder-Policy` e `Cross-Origin-Opener-Policy` exigidos pelo `expo-sqlite` para uso de `SharedArrayBuffer`.

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

### 3. Iniciando o Aplicativo

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
│   ├── bibleData.ts      # Validação e catálogo da Bíblia NVI empacotada
│   └── repositories/     # Camada de manipulação do SQLite local (books, verses, preferences)
└── types/                # Definições TS estritas do domínio da aplicação
```

## 🤝 Contribuições

Este projeto foi gerado focado na consistência, velocidade e resiliência visual. Sinta-se à vontade para abrir Issues para discutir possíveis melhorias ou enviar Pull Requests. Ao contribuir, por favor siga o padrão de linting do projeto executando `npm run lint` e resolvendo todos os alertas indicados.

---

Feito com dedicação para a Palavra. 📖✨
