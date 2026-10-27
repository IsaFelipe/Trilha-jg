# Trilha do Consultor JG — guia de manutenção

Este guia é para quem **não programa**. Todo o conteúdo do site (planetas, dias, materiais, links e vídeos) fica em **um único arquivo**:

```
data/trilha.json
```

Você não precisa mexer em nenhum outro arquivo.

---

## O que tem em cada pasta

| Arquivo / pasta | Para que serve | Precisa editar? |
|---|---|---|
| `data/trilha.json` | Todo o conteúdo da trilha | **Sim, só este** |
| `index.html` | Estrutura da página | Não |
| `css/style.css` | Cores e visual | Não |
| `js/app.js` | Funcionamento (telas, pontos, progresso) | Não |
| `servidor-local.ps1` | Testar o site no seu computador (Windows) | Não |
| `LEIA-ME.md` | Este guia | — |

---

## Antes de começar: 4 regras do arquivo `trilha.json`

O arquivo usa um formato chamado JSON. Ele é rígido com pontuação:

1. **Todo texto fica entre aspas duplas**: `"titulo": "Mapa de personas"`.
2. **Itens de uma lista são separados por vírgula**, mas **o último item não leva vírgula**.
3. Não apague chaves `{ }` nem colchetes `[ ]`.
4. **Nunca mude o `"id"`** de um material ou de um dia que já está em uso: o progresso de cada pessoa é salvo pelo id. Pode mudar o título à vontade.

Se o site mostrar a mensagem *"O arquivo data/trilha.json tem um erro de digitação"*, quase sempre é uma vírgula sobrando ou faltando. Copie todo o conteúdo do arquivo, cole em **https://jsonlint.com** e clique em *Validate JSON*: ele mostra a linha com problema.

---

## 1. Como trocar um link

1. Abra o arquivo no Google Drive e clique em **Compartilhar**.
2. Em *Acesso geral*, escolha **Qualquer pessoa com o link** → **Leitor**. (Sem isso, o consultor não consegue abrir.)
3. Clique em **Copiar link**.
4. No `trilha.json`, procure o material (use Ctrl+F com o título) e troque o valor de `"link"`:

```json
"link": "https://drive.google.com/file/d/1AbCdEf.../view",
```

Enquanto o link estiver como `"COLE_O_LINK_AQUI"`, o card aparece como **Em breve** e o botão fica desativado.

> O site converte sozinho links do tipo `/file/d/ID/view` para `/file/d/ID/preview` na hora de mostrar a pré-visualização. Você pode colar o link do jeito que o Drive entrega.

Também funcionam links de Google Docs, Apresentações, Planilhas e Formulários.

---

## 2. Como incluir um vídeo

Cada material tem um campo `"video"`. Cole o link do vídeo nele:

```json
"video": "https://www.youtube.com/watch?v=XXXXXXXXXXX"
```

Funcionam:
- **YouTube**: `youtube.com/watch?v=...`, `youtu.be/...` ou `youtube.com/shorts/...` (pode ser vídeo *não listado*).
- **Google Drive**: `drive.google.com/file/d/ID/view` (o vídeo precisa estar compartilhado como *Qualquer pessoa com o link*).
- **Vimeo**: `vimeo.com/123456`.

O player aparece dentro do card do material. Se o campo estiver vazio (`"video": ""`), o card mostra **Vídeo em breve**.

---

## 3. Como adicionar um material novo

1. Encontre o dia certo no `trilha.json` (ex.: procure `"id": "s2d3"`).
2. Dentro de `"materiais": [ ... ]`, copie um material inteiro, do `{` até o `}`.
3. Cole logo depois dele, **colocando uma vírgula entre os dois**.
4. Troque os valores. Exemplo:

```json
"materiais": [
  { "id": "matriz-objecoes", "titulo": "Matriz de objeções", "formato": "Documento", "descricao": "...", "link": "...", "video": "" },
  { "id": "objecoes-preco", "titulo": "Objeções de preço", "formato": "PDF", "descricao": "Como responder quando o cliente diz que está caro.", "link": "COLE_O_LINK_AQUI", "video": "" }
]
```

Campos de cada material:

| Campo | O que colocar |
|---|---|
| `id` | Um nome único, sem espaços nem acentos (use hífens). Ex.: `objecoes-preco` |
| `titulo` | O nome que aparece no card |
| `formato` | `PPT`, `PDF`, `Documento`, `Planilha`, `Formulário` ou `Vídeo` (define o ícone) |
| `descricao` | Uma frase curta |
| `link` | Link do Drive (ou `COLE_O_LINK_AQUI`) |
| `video` | Link do vídeo (ou `""`) |
| `modulo` | Opcional. Se não colocar, o site usa o nome do planeta (é o filtro "Módulo" da Biblioteca) |

**Material que não pertence a nenhum dia** (só para consulta na Biblioteca): adicione na lista `"complementares"`, no fim do arquivo, do mesmo jeito.

**Alterar um dia**: os campos `tema`, `atividade` e `entregavel` de cada dia podem ser editados livremente.

**Pontos e selos**: no começo do arquivo, em `"config"`, você muda quantas estrelas vale cada ação (`"pontos"`) e a partir de quantas estrelas vem cada selo (`"selos"`).

---

## 4. Como testar no seu computador antes de publicar

Dar dois cliques no `index.html` **não funciona** (o navegador bloqueia a leitura do `trilha.json` por segurança). No Windows:

1. Clique com o botão direito em `servidor-local.ps1` → **Executar com o PowerShell**.
2. Abra **http://localhost:8080** no navegador.
3. Feche a janela azul do PowerShell para parar.

Se preferir pular essa etapa, publique e confira direto no site.

---

## 5. Como publicar de graça

Escolha **uma** das opções. As duas são gratuitas.

### Opção A — GitHub Pages (recomendada)

**Primeira vez (uns 10 minutos):**

1. Crie uma conta em **https://github.com** (botão *Sign up*).
2. Clique no **+** no canto superior direito → **New repository**.
3. Em *Repository name*, digite `trilha-jg`. Deixe **Public** marcado. Clique em **Create repository**.
4. Na página seguinte, clique no link **uploading an existing file**.
5. Abra a pasta `trilha-jg` no seu computador, selecione **tudo o que está dentro dela** (as pastas `css`, `data`, `js` e os arquivos `index.html`, `LEIA-ME.md` etc.) e arraste para a página do GitHub.
   - Importante: arraste o **conteúdo** da pasta, não a pasta em si. O `index.html` precisa ficar na raiz.
6. Clique em **Commit changes**.
7. Vá em **Settings** (aba no topo do repositório) → **Pages** (menu à esquerda).
8. Em *Branch*, escolha **main** e a pasta **/ (root)**. Clique em **Save**.
9. Espere 1 a 2 minutos e recarregue a página. O endereço aparece no topo, algo como:
   `https://SEU-USUARIO.github.io/trilha-jg/`

**Para atualizar depois (ex.: trocar um link):**

1. No repositório, clique na pasta `data` → no arquivo `trilha.json`.
2. Clique no ícone de **lápis** (*Edit this file*).
3. Faça a alteração direto no navegador.
4. Clique em **Commit changes** → **Commit changes** de novo.
5. Em 1 a 2 minutos o site está atualizado. (Se não aparecer, recarregue com Ctrl+F5.)

O GitHub **não avisa** se uma vírgula ficar faltando. Se tiver dúvida, valide o arquivo em jsonlint.com antes de salvar.

### Opção B — Vercel

**Primeira vez:**

1. Faça os passos 1 a 6 da Opção A (o site precisa estar no GitHub).
2. Acesse **https://vercel.com** e clique em **Sign Up** → **Continue with GitHub**.
3. Clique em **Add New… → Project**.
4. Ao lado do repositório `trilha-jg`, clique em **Import**.
5. Em *Framework Preset*, deixe **Other**. Não mude mais nada. Clique em **Deploy**.
6. Em menos de um minuto você recebe um endereço como `https://trilha-jg.vercel.app`.

**Para atualizar depois:** edite o `trilha.json` no GitHub (mesmos passos da Opção A). A Vercel publica sozinha a cada alteração.

---

## Perguntas frequentes

**O progresso do consultor some?**
O progresso fica salvo **só no navegador e no aparelho** que a pessoa usou. Trocar de computador, usar janela anônima ou limpar os dados do navegador faz o progresso recomeçar. Atualizar o site **não** apaga o progresso de ninguém (desde que os `id` não mudem).

**O material abre com "Você precisa de acesso".**
O arquivo no Drive não está compartilhado como *Qualquer pessoa com o link → Leitor*.

**A pré-visualização aparece em branco.**
Alguns tipos de arquivo (como `.xlsm` com macros) não têm pré-visualização no Drive. O botão **Abrir material** continua funcionando.

**Quero mudar as cores.**
Ficam no início de `css/style.css`, em `:root`. As cores de cada planeta ficam no próprio `trilha.json`, em `"visual"` (`cor`, `sombra`, `anel`, `crateras`, `faixas`, `lua`).
