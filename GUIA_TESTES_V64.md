# FEEDS SOLUTIONS V6.4 — Guia de validação

## Estado de ativação

O motor V6.4 está integrado ao fluxo principal por meio de um adaptador, mas permanece **desativado por padrão** até que os testes sejam executados no Google Apps Script e o teste com Gemini real seja aprovado.

Arquivo: `IntegracaoInvestigacaoV64.gs`  
Variável: `FEEDS_MOTOR_INVESTIGACAO_V64_ATIVO`  
Valor inicial: `false`

Enquanto estiver `false`, o fluxo de produção continua usando o caminho legado V6.3. A interface HTML não foi alterada.

## Ordem dos testes

Execute cada função no editor do Google Apps Script. Os testes determinísticos não chamam Gemini e não escrevem nas planilhas de produção.

| Ordem | Arquivo exato | Função | Resultado esperado |
|---|---|---|---|
| 1 | `TesteEstadoInvestigacaoV64.gs` | `TESTAR_ESTADO_INVESTIGACAO_V64()` | 19/19 esperados; confirmar no registro atualizado |
| 2 | `TesteConversacionalV64.gs` | `TESTAR_CONVERSACIONAL_V64()` | 15/15 aprovados (inclui contrato do schema e fluxo completo determinístico) |
| 3 | `IntegracaoInvestigacaoV64.gs` | `TESTAR_ADAPTADOR_INVESTIGACAO_V64()` | 4/4 aprovados |
| 4 | `TesteIntegracaoV64.gs` | `TESTAR_INTEGRACAO_V64()` | 17/17 aprovados (inclui regressão de fallback em lacuna aberta) |
| 5 | `TesteConversacionalV64.gs` | `TESTAR_GEMINI_REAL_INVESTIGACAO_V64()` | `sucesso: true`; resultado sanitizado |

O teste 5 chama o Gemini real, usa somente uma conversa sintética e registra apenas dimensões, certezas e indicadores. Na atualização de `TESTES` de 19/10/2026, a suíte de integração determinística passou com 17/17, a suíte conversacional determinística passou com 13/13 e o teste Gemini real passou com `sucesso: true` após 4 turnos. O teste real confirmou processo, dor/causa, escala e impacto; ainda não demonstrou a coleta das dimensões frequência, objetivo e critérios de aceitação. Portanto, a aprovação confirma continuidade sem falha imediata, mas não a conclusão de uma investigação completa. Execute ainda o teste de estado explícito e o adaptador, depois a regressão V6.3 e a revisão humana descrita abaixo. Falha por indisponibilidade, limite de chamadas ou pergunta repetida deve ser tratada como falha real, não como aprovação.

## Regressão da V6.3

Depois que os testes V6.4 acima passarem:

1. **Não execute** `TESTAR_ACEITACAO_FINAL_V63_RESETAR()`, pois ela reseta a baseline V6.3.
2. Execute somente `TESTAR_ACEITACAO_FINAL_V63_CONTINUAR()` no arquivo `TesteAceitacaoFinalV63.gs`, depois de confirmar que o cenário não depende de reset.
3. Confira as assertivas e registre o resultado; “executou sem exceção” não é suficiente.
4. No arquivo `DiagnosticoProfundoV63.gs`, execute `TESTAR_DIAGNOSTICO_PROFUNDO_V63_FULL()` e confirme que o cenário de periodicidade/volume não falha.
5. Não ative o motor V6.4 se houver regressão.

## Revisão humana obrigatória

Após a regressão, executar 3 a 5 conversas sintéticas/experimentais controladas e revisar manualmente:
- se cada pergunta se conecta à resposta anterior;
- se fatos têm evidência e nível de certeza corretos;
- se o motor captura múltiplas informações numa mesma mensagem;
- se não repete perguntas equivalentes;
- se não conclui sem escala, frequência, impacto, objetivo e critérios de aceitação confirmados ou explicitamente desconhecidos/não aplicáveis.

A ativação só deve ocorrer depois de registrar os resultados dos testes reais e da revisão humana.

## Implementação e rollback

- A implementação inicial foi incorporada à `main` no commit `0a1b8358dc6b998a4574b51aef415b8e0791577f`.
- Correção de fallback para manter dimensões ainda abertas elegíveis, mesmo após pergunta anterior: commit `b52f7db5e74181c7cabc7c2e9130b021f8040ab8`.
- Regressão para cobrir esse caso: commit `e5796df770dfc0b404c3796c7ee526c67e5c988b`.
- O motor segue desativado por padrão.
- O estado V6.4 é serializado como envelope `ESTADO_INVESTIGACAO_V64` no campo existente `INVESTIGACOES.informacoes`, preservando outros itens legados.
- Para rollback imediato após ativação, definir `FEEDS_MOTOR_INVESTIGACAO_V64_ATIVO = false`; o caminho legado continua disponível.
- Não houve alteração de `Admin.html`, `Index.html` ou `Styles.html`, nem exclusão de dados históricos.


## Verificações executadas nesta auditoria — 19/10/2026

Verificação sintática JavaScript em V8 isolado: 33/33 arquivos .gs passaram. Os scripts inline de Index.html e Admin.html também passaram. As suítes determinísticas executadas em V8 isolado, com Logger simulado e os módulos necessários carregados, retornaram:

- Estado explícito: 19/19.
- Conversacional determinístico atualizado: 15/15 (inclui teste de conversa completa antes da conclusão).
- Adaptador: 4/4.
- Integração determinística: 17/17.

**Limite importante:** esta execução não é o runtime do Google Apps Script. Não valida SpreadsheetApp, PropertiesService, implantação do Web App nem a chamada real ao Gemini. O teste E2E estrito atualizado ainda precisa ser executado no Apps Script; não considerar a execução antiga de 4 turnos como aceite.


Atualização adicional: em 19/10/2026, após adicionar o teste de fluxo completo com adaptadores determinísticos, as suítes foram reexecutadas em V8 isolado: estado 19/19, conversacional 15/15, adaptador 4/4 e integração 17/17. O arquivo atualizado TesteConversacionalV64.gs passou também pela análise sintática. Isso ainda não substitui a execução no Apps Script nem o teste Gemini real com o critério mais rigoroso.


## Execução única acelerada

Para executar todas as suítes V6.4 em uma só rodada, no editor do Google Apps Script selecione o arquivo TesteConversacionalV64.gs e execute a função TESTAR_SUITE_COMPLETA_INVESTIGACAO_V64(). Ela executa estado explícito, conversacional determinístico, adaptador, integração determinística e, por último, o teste Gemini real atualizado. O resumo final indica cada suíte, o número de aprovações e as dimensões críticas que faltaram.

O runner usa apenas dados sintéticos no teste Gemini, não reseta a baseline V6.3 e exige que FEEDS_MOTOR_INVESTIGACAO_V64_ATIVO permaneça false. A execução real pode levar mais tempo porque chama o Gemini várias vezes. Se falhar, examine a suíte específica no resumo final; não ative o motor.


## Correção após execução real — 19/10/2026

O registro `TESTES` da execução das 11:30–11:35 apontou duas falhas: a função de contrato do schema não estava visível no contexto daquela execução, e a conversa real repetiu perguntas de frequência sem confirmar essa dimensão. A correção publicada acrescenta uma correção determinística e conservadora para respostas explicitamente temporais que o Gemini classifique equivocadamente como escala, melhora o fallback de frequência e evita chamadas semânticas ao Gemini quando as dimensões comparadas são claramente distintas. Foi incluído um teste determinístico específico para essa regressão; a suíte conversacional agora exige 16/16. Estas mudanças ainda precisam ser executadas no Apps Script; não são declaradas aprovadas só por estarem publicadas.


## Resultado real atualizado — 19/10/2026, 12:09

A execução do runner passou em 4/5 suítes: estado 19/19, conversacional 16/16, adaptador 4/4 e integração 17/17. O Gemini real processou 7 turnos, confirmou processo, dor/causa, frequência, impacto, exceções, objetivo, restrições e aceitação, mas manteve escala como `ESTIMADO` porque o cenário dizia “cerca de 100 pedidos por dia”. Apesar de a lacuna estimada permanecer aberta no estado, o gate permitia concluir com ressalva; o teste estrito reprovou corretamente porque escala é crítica e precisava ser confirmada. Corrigido o gate para bloquear conclusão quando uma dimensão essencial estiver `ESTIMADO`, incluído teste de regressão e alterada a resposta sintética de escala para uma confirmação explícita (“exatamente 100 pedidos por dia”). Após as mudanças, as suítes isoladas passaram: estado 19/19, conversacional 16/16, adaptador 4/4 e integração 18/18. A nova execução com Gemini real no Apps Script ainda é obrigatória.

## Próxima etapa — validação adversarial (19/10/2026)

Foi adicionado `TesteAdversarialV64.gs`, com a função `TESTAR_ADVERSARIAL_INVESTIGACAO_V64()`. Ela cobre oito invariantes sob entradas adversariais: resposta vaga/estimada, contradição, múltiplos fatos na mesma mensagem, ausência de resposta, objetivo sem critério de aceitação, escala estimada, separação entre frequência e escala e conflito não resolvido.

A suíte foi executada em JavaScript V8 isolado com as dependências atuais do repositório e passou **8/8**. Isso é uma validação local do código, não substitui a execução no Apps Script.

O runner `TESTAR_SUITE_COMPLETA_INVESTIGACAO_V64()` foi atualizado para executar seis suítes, incluindo a adversarial antes do Gemini real. Sincronize no projeto Apps Script os arquivos `TesteAdversarialV64.gs` e a versão atualizada de `TesteConversacionalV64.gs`, depois execute o runner completo. Resultado esperado: seis suítes aprovadas; a suíte adversarial deve mostrar 8/8. A chamada ao Gemini pode sofrer limite de cota (HTTP 429); se isso acontecer, aguarde a janela de cota e repita, sem tratar a falha como aprovação.

A ativação continua desligada (`FEEDS_MOTOR_INVESTIGACAO_V64_ATIVO = false`) e a baseline V6.3 deve permanecer intacta. Não executar `TESTAR_ACEITACAO_FINAL_V63_RESETAR()`.

## Correção após execução de 19/10/2026 às 14:52

O log real mostrou cinco suítes determinísticas aprovadas (19/19 estado, 16/16 conversacional, 4/4 adaptador, 18/18 integração, 8/8 adversarial), mas o E2E com Gemini falhou por HTTP 429. A investigação do log identificou uma causa concreta para consumo excessivo: a pergunta temporal “Em quais dias da semana ou horários o volume de pedidos costuma ser maior?” continha a palavra “volume” e era classificada como escala; o motor tentava gerar novas perguntas até cair no fallback de escala.

Correção publicada em `MotorInvestigacaoV64.gs`: marcadores temporais prevalecem quando a pergunta procura saber quando ocorre o pico; somente um pedido quantitativo explícito (como “Quantos pedidos chegam no horário de pico?”) é classificado como escala. Adicionados dois testes de regressão, incluindo a frase exata do log, e ajustada a resposta sintética de impacto para confirmar exatamente duas horas, evitando que o cenário de teste introduza nova estimativa.

Validação V8 isolada após a correção: estado 19/19, conversacional 18/18, adaptador 4/4, integração 18/18 e adversarial 8/8 — **67/67 aprovados**. Isso não comprova o E2E real. Sincronizar `MotorInvestigacaoV64.gs` e `TesteConversacionalV64.gs` no Apps Script; após a janela de cota informada pelo Gemini, executar novamente a suíte completa uma única vez. O resultado real continua pendente até `GEMINI_REAL_PONTA_A_PONTA` passar sem 429.


## Correção após execução de 19/10/2026 às 16:22

O log voltou a aprovar as cinco suítes determinísticas (19/19, 18/18, 4/4, 18/18 e 8/8), mas o Gemini real falhou por HTTP 429. Além da cota, o log demonstrou uma falha de classificação: a resposta sobre tempo consumido na conferência foi atribuída a frequência, embora a pergunta pendente fosse impacto. Isso fez o motor insistir na mesma lacuna.

Correções publicadas:
- `MotorInvestigacaoV64.gs`: nova normalização conservadora de duração para impacto quando a pergunta pendente é impacto; limite de duas tentativas de seleção por turno antes do fallback determinístico.
- `TesteConversacionalV64.gs`: resposta sintética de impacto agora descreve explicitamente a consequência e confirma exatamente duas horas; acrescentado teste de regressão da classificação duração → impacto. A suíte conversacional agora exige 19/19.

**Próxima validação no Apps Script:** sincronize os dois arquivos acima. Execute primeiro `TESTAR_CONVERSACIONAL_V64()` (esperado 19/19) e as suítes determinísticas restantes. Só depois da janela de cota, execute `TESTAR_GEMINI_REAL_INVESTIGACAO_V64()` isoladamente. Não use a falha HTTP 429 como aprovação e mantenha `FEEDS_MOTOR_INVESTIGACAO_V64_ATIVO = false`.


## Correção adicional de cota — 19/10/2026

O log mostrou que, apesar de o Gemini informar `retryDelay` de 35 s, 30 s e valores semelhantes, `IA.gs` repetia a chamada após apenas 1,5 s e 3 s. Isso contrariava a orientação explícita da API e aumentava as respostas HTTP 429.

Alterações publicadas:
- `IA.gs`: nova função `extrairEsperaRetryGeminiMs_` lê `RetryInfo.retryDelay` (com fallback para a mensagem textual) e usa esse atraso antes da próxima tentativa em HTTP 429.
- `TesteIntegracaoV64.gs`: regressão determinística que verifica `35.542506408s` → `35543 ms`; a suíte de integração agora exige 19/19.
- `MotorInvestigacaoV64.gs` e `TesteConversacionalV64.gs`: correção da classificação duração → impacto, fixture de impacto explícita e duas tentativas de seleção antes do fallback; a suíte conversacional agora exige 19/19.

**Sincronize estes quatro arquivos no Apps Script:** `IA.gs`, `MotorInvestigacaoV64.gs`, `TesteConversacionalV64.gs` e `TesteIntegracaoV64.gs`. Execute primeiro as suítes determinísticas. Só então, depois da janela de cota, execute `TESTAR_GEMINI_REAL_INVESTIGACAO_V64()` isoladamente. A correção de retry evita insistência prematura, mas não garante que uma execução que exceda a cota consiga concluir; o resultado real continua pendente. V6.4 permanece desativada.
