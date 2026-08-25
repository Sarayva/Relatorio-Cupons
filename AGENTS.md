# AGENTS.md — Regras do Projeto

Este arquivo e lido automaticamente pelo Antigravity (e por outras ferramentas de
agente, como Cursor e Claude Code) no inicio de cada sessao. Siga estas regras
sempre, sem precisar que eu peca de novo.

\---

## Regras de Commit — leia antes de fazer qualquer commit neste projeto

Estas regras são obrigatórias para qualquer commit feito neste repositório,
seja por humano ou por IA. Siga a risca, sem exceção.

## Formato da mensagem (Conventional Commits)

```
tipo(escopo): descrição curta no imperativo

Corpo explicando o PORQUÊ da mudança (não apenas o que mudou — isso já
aparece no diff). Mencione contexto, decisão tomada, ou problema resolvido.

Refs: #numero-da-issue (se aplicável)
```

### Tipos permitidos

|Tipo|Quando usar|
|-|-|
|`feat`|Nova funcionalidade|
|`fix`|Correção de bug|
|`docs`|Só documentação (README, comentários, guias)|
|`refactor`|Muda a estrutura do código sem alterar comportamento|
|`style`|Formatação, espaços, ponto e vírgula — sem mudar lógica|
|`test`|Adiciona ou corrige testes|
|`chore`|Manutenção: dependências, configs, build, `.gitignore`|
|`perf`|Melhoria de performance|

### Escopo (opcional, mas recomendado)

Nome do módulo/arquivo/área afetada, minúsculo. Ex: `cupons`, `precificacao`,
`export-excel`, `parser-xml`.

## Regras obrigatórias

1. **Commit atômico** — um commit = uma mudança lógica só. Se a descrição
tem "e" no meio ("corrige bug e adiciona export"), separe em dois commits.
2. **Imperativo, não passado.** Escreva como uma ordem: "corrige", "adiciona",
"remove" — nunca "corrigido", "adicionado", "removendo".
3. **Primeira linha até \~50 caracteres.** Corpo com linhas de até \~72
caracteres.
4. **Nunca commitar mensagens vagas** como "ajustes", "correção", "wip",
"mudanças diversas" sem explicação. Daqui a 6 meses ninguém vai entender
o que era isso.
5. **Nunca commitar dados sensíveis ou arquivos reais de dados**:

   * Arquivos `.xls` / `.xlsx` com dados reais de lojas, vendas, custos ou preços
   * Chaves de API, senhas, tokens
   * Arquivos gerados (`graficos\_cupons.png`, `analise\_cupons\_\*.xlsx`,
`\_\_pycache\_\_/`, `.venv/`)
Verifique o `.gitignore` antes de commitar. Se um desses arquivos aparecer
no `git status`, pare e avise antes de prosseguir.
6. **Não commitar código quebrado.** O projeto deve rodar/importar sem erro
depois do commit, mesmo que a feature esteja incompleta.
7. **Ao corrigir um bug relatado pelo usuário**, sempre explique no corpo
do commit: qual era o erro, a causa raiz, e como foi corrigido. Exemplo
real deste projeto:

```
   fix(cupons): corrige erro de pd.to\_numeric com errors="ignore"

   O parametro errors="ignore" foi removido em versoes recentes do pandas,
   causando ValueError ao rodar o script. Trocado por try/except pra manter
   compatibilidade com qualquer versao do pandas instalada.
   ```

8. **Antes de commitar, rode um diff mental**: o que mudou realmente
pertence a essa mensagem de commit? Nada de "carona" (mudanças não
relacionadas empacotadas junto).

## Fluxo de branch

* Nunca trabalhar direto na `main`/`master`.
* Uma branch por funcionalidade ou correção: `feature/nome`, `fix/nome`.
* Ao finalizar, revisar o histórico da branch — se tiver commits tipo "wip",
"ajuste", "de novo", faça squash antes de abrir/mergear o PR, pra manter
a `main` com histórico limpo e legível.

## Checklist antes de cada commit

* \[ ] A mensagem segue o formato `tipo(escopo): descrição`?
* \[ ] É uma mudança atômica (uma coisa só)?
* \[ ] Não tem arquivo de dado sensível ou gerado sendo commitado?
* \[ ] O código roda sem erro?
* \[ ] O corpo da mensagem explica o porquê, não só o quê?

