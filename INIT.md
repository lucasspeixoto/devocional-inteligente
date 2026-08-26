# Diretrizes funcionais atuais

- O aplicativo usa exclusivamente a Bíblia local em `databases/NVI.json`.
- A única tradução suportada é `NVI (Nova Versão Internacional)`, identificada internamente como `nvi`.
- Livros e versículos são preparados no SQLite na inicialização e permanecem disponíveis sem internet.
- Não existe integração com API bíblica, token de acesso, download de capítulos ou seletor de tradução.
- Tema, última posição de leitura, comentários e anotações são persistidos localmente.
- A tela inicial restaura a última leitura, o catálogo lista os 66 livros e a leitura permite navegação por swipe.
- A última aba é Configurações, com alternância entre os temas claro e escuro e identificação da NVI disponível offline.
