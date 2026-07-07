Quero criar uma aplicativo com react native e expo (estrutura do projeto ja criada) da biblia para leitura.
Para isso considere as informações:
 -> O Aplicativo deve fazer integração com a api da biblia (https://www.abibliadigital.com.br), que possue os seguintes endpoints:
   1: Livros (/api/books)
      1.1 Chamada: /GET para https://www.abibliadigital.com.br/api/books
      1.2 Response: [
            {
              "abbrev": {
                "pt": "gn",
                "en": "gn"
              },
              "author": "Moisés",
              "chapters": 50,
              "group": "Pentateuco",
              "name": "Gênesis",
              "testament": "VT"
            },...]
    2: Detalhe livro (/api/books/:abbrev)
      2.1 Chamada: /GET para https://www.abibliadigital.com.br/api/books/gn
      2.2: Response: {
            "abbrev": {
              "pt": "gn",
              "en": "gn"
              },
            "author": "Moisés",
            "chapters": 50,
            "comment": "Autor: Uma vez que este livro anôn....",
            "group": "Pentateuco",
            "name": "Gênesis",
            "testament": "VT"
          }
    3: Versos (api/verses/:version/:abbrev/23)
      3.1: Chamada: /GET para https://www.abibliadigital.com.br/api/verses/nvi/sl/23
      3.2: Response: {
        "book": {
          "abbrev": {
            "pt": "sl",
            "en": "ps"
          },
          "name": "Salmos",
          "author": "David, Moisés, Salomão",
          "group": "Poéticos",
          "version": "nvi"
        },
        "chapter": {
          "number": 23,
          "verses": 6
        },
        "verses": [
          {
            "number": 1,
            "text": "O Senhor é o meu pastor; de nada terei falta."
          },
          {
            "number": 2,
            "text": "Em verdes pastagens me faz repousar e me conduz a águas tranqüilas;"
          },
          {
            "number": 3,
            "text": "restaura-me o vigor. Guia-me nas veredas da justiça por amor do seu nome."
          },
          {
            "number": 4,
            "text": "Mesmo quando eu andar por um vale de trevas e morte, não temerei perigo algum, pois tu estás comigo; a tua vara e o teu cajado me protegem."
          },
          {
            "number": 5,
            "text": "Preparas um banquete para mim à vista dos meus inimigos. Tu me honras, ungindo a minha cabeça com óleo e fazendo transbordar o meu cálice."
          },
          {
            "number": 6,
            "text": "Sei que a bondade e a fidelidade me acompanharão todos os dias da minha vida, e voltarei à casa do Senhor enquanto eu viver."
          }
        ]
      }
    4. Versões (api/versions)
      4.1: Chamada: /GET para https://www.abibliadigital.com.br/api/versions
      4.2: Response: [
        {
          "version": "acf",
          "verses": 31106
        },
        {
          "version": "apee",
          "verses": 30975
        },
        {
          "version": "bbe",
          "verses": 31104
        },
        {
          "version": "kjv",
          "verses": 31101
        },
        {
          "version": "nvi",
          "verses": 31105
        },
        {
          "version": "ra",
          "verses": 31104
        },
        {
          "version": "rvr",
          "verses": 31102
        }
      ]

  -> O aplicativo deve trabalhar apenas com dados locais utilizando SQLite
  -> O aplicativo deve ter uma tela inicial com um botão para abrir a leitura
  -> A tela inicial deve ser o livro com o versículo aberto na ultima vez (salvo localmente)
  -> Deve ter uma forma de fazer anotações e associar a um versículo em específico
  -> Baseado na api de detalhes dos livros (api/books/gn), deve ter um página para listar os livros e clicar para abrir a tela mostrando os dados referente ao retorno da api
  -> Nas (tabs), a última deve ser de configuração, que deve ter um toggle para trocar de tema (light e dark) e outro para trocar a versão da biblia, salva localmente e alterada com base nas opções da api de versões (/api/versions)
  -> As chamadas para a api da biblia devem ter apenas o header Authorization que deve ser 'Bearer {{ACCESS_TOKEN}}', onde o ACCESS_TOKEN é a variavel salva no .env com nome EXPO_PUBLIC_ACCESS_TOKEN
  -> O layout deve ser bonito e intuitivo com animações, com cor primaria sendo algum tom de marrom e cor secundaria algum tom de amarelo
  -> Deve ser possível sair de um versículo e ir para o anterior ou próxima movimentando o dedo da esquerda -> direita ou direita -> esquerda