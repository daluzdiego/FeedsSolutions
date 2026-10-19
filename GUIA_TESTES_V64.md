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

1. No arquivo `TesteAceitacaoFinalV63.gs`, execute `TESTAR_ACEITACAO_FINAL_V63_RESETAR()`.
2. Em seguida, no mesmo arquivo, execute `TESTAR_ACEITACAO_FINAL_V63_CONTINUAR()`.
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
