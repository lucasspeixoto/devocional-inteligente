## 1. Fonte NVI empacotada

- [x] 1.1 Definir os tipos da estrutura de `databases/NVI.json`, o código canônico `nvi` e o rótulo "NVI (Nova Versão Internacional)"; verificar com o typecheck que consumidores não aceitam traduções arbitrárias.
- [x] 1.2 Criar o catálogo local dos 66 livros com nome, abreviação, autor, grupo e testamento na ordem canônica; verificar por teste a cobertura, unicidade e correspondência case-insensitive com todas as entradas do JSON.
- [x] 1.3 Implementar o adaptador local que importa e valida o JSON e resolve livros/capítulos com numeração baseada em 1; verificar por testes Gênesis 1, Apocalipse 22, abreviações em caixa diferente e referências fora dos limites.
- [x] 1.4 Adicionar teste de integridade que percorra a base completa e confirme 66 livros, capítulos não vazios e versículos textuais não vazios; verificar que uma fixture inválida produz erro local sem tentativa de rede.

## 2. Preparação e migração do SQLite

- [x] 2.1 Adicionar metadado persistido de revisão da base bíblica e a migração correspondente; verificar em banco novo e existente que a mudança é idempotente.
- [x] 2.2 Implementar o seed transacional e em lotes dos livros e versículos NVI, marcando a revisão somente após commit; verificar contagens contra o JSON e rollback integral em falha simulada.
- [x] 2.3 Preservar `books.comment` durante upserts e manter notas, tema e último ponto de leitura durante o seed; verificar com teste de atualização de um banco previamente populado.
- [x] 2.4 Normalizar `user_preferences.selected_version` para `nvi` sem reatribuir ou excluir notas de outras versões; verificar que notas NVI continuam visíveis e notas legadas permanecem armazenadas, mas fora das consultas NVI.
- [x] 2.5 Integrar a preparação da base ao `DatabaseContext` antes de liberar consumidores; verificar que uma primeira abertura exibe estado de preparação, uma segunda abertura com a mesma revisão não repete o seed e uma falha é recuperável.

## 3. Catálogo e leitura exclusivamente locais

- [x] 3.1 Refatorar o carregamento de livros para consultar somente a base local preparada e fazer `refresh` repetir a consulta local; verificar a listagem completa dos 39 livros do Velho Testamento e 27 do Novo Testamento com a rede desativada.
- [x] 3.2 Refatorar detalhes de livro para usar metadados e comentários locais; verificar navegação, autor, grupo, capítulos e comentário editável em modo avião.
- [x] 3.3 Refatorar o carregamento de capítulos para remover sincronização/fallback remoto e consultar somente versículos `nvi`; verificar leitura e swipe entre limites de livros/capítulos sem conectividade.
- [x] 3.4 Atualizar estados de loading, erro e retry para operações locais e referências inválidas; verificar que nenhuma mensagem de erro menciona rede, servidor ou autenticação.

## 4. Tradução única nas configurações e notas

- [x] 4.1 Simplificar hook/contexto de configurações removendo lista, busca e mutação de versões e mantendo tema mais a tradução canônica NVI; verificar pelo typecheck que a interface pública não expõe seleção de tradução.
- [x] 4.2 Substituir o seletor de versões por uma identificação não interativa "NVI (Nova Versão Internacional)" e preservar o controle de tema; verificar visualmente em temas claro e escuro e por teste de interface sem opções clicáveis de tradução.
- [x] 4.3 Ajustar leitura, journal e criação/consulta de notas para usar consistentemente `nvi`; verificar criação, edição, exclusão, ordenação e restauração de notas NVI após reiniciar o aplicativo.

## 5. Remoção da integração descontinuada

- [x] 5.1 Remover o cliente/funções HTTP, imports de respostas remotas e tipos exclusivos da API após migrar todos os consumidores; verificar com `rg` que o domínio `abibliadigital.com.br` não aparece no código executável.
- [x] 5.2 Remover leitura de `EXPO_PUBLIC_ACCESS_TOKEN`, cache de versões no AsyncStorage e dependências que ficarem sem uso; verificar que `package.json`, lockfile e configuração do app não mantêm requisitos exclusivos da API.
- [x] 5.3 Atualizar documentação operacional relevante para declarar a única versão NVI offline e ausência de token/sincronização; verificar que instruções ativas não orientam configurar ou chamar a API descontinuada.

## 6. Validação integrada

- [x] 6.1 Executar lint, typecheck e suíte de testes e corrigir regressões; verificar que todos os comandos terminam sem erros.
- [ ] 6.2 Medir primeira preparação e segunda inicialização em pelo menos um dispositivo/emulador alvo, registrar contagens e duração e otimizar lotes se houver bloqueio perceptível; verificar que a revisão evita novo seed.
- [ ] 6.3 Validar o fluxo completo em modo avião — primeira abertura, catálogo, detalhes, leitura, swipe, progresso, tema e notas — e confirmar ausência de requisições para a API descontinuada.
- [x] 6.4 Executar as verificações/builds ou exports relevantes do Expo SDK 54 para Android, iOS e web conforme os alvos do projeto; verificar que `databases/NVI.json` é incluído e acessível em cada bundle produzido.
