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
| 1 | `TesteEstadoInvestigacaoV64.gs` | `TESTAR_ESTADO_INVESTIGACAO_V64()` | 19/19 aprovados |
| 2 | `TesteConversacionalV64.gs` | `TESTAR_CONVERSACIONAL_V64()` | 12/12 aprovados |
| 3 | `IntegracaoInvestigacaoV64.gs` | `TESTAR_ADAPTADOR_INVESTIGACAO_V64()` | 4/4 aprovados |
| 4 | `TesteIntegracaoV64.gs` | `TESTAR_INTEGRACAO_V64()` | 12/12 aprovados |
| 5 | `TesteConversacionalV64.gs` | `TESTAR_GEMINI_REAL_INVESTIGACAO_V64()` | `sucesso: true`; resultado sanitizado |

O teste 5 chama o Gemini real, usa somente uma conversa sintética e registra apenas dimensões, certezas e indicadores. Pode falhar por indisponibilidade, limite de chamadas ou uma pergunta inválida; isso deve ser tratado como falha real, não como aprovação.

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

- A implementação está isolada na branch `v6.4-investigacao-adaptativa`.
- O estado V6.4 é serializado como envelope `ESTADO_INVESTIGACAO_V64` no campo existente `INVESTIGACOES.informacoes`, preservando outros itens legados.
- Para rollback imediato após ativação, definir `FEEDS_MOTOR_INVESTIGACAO_V64_ATIVO = false`; o caminho legado continua disponível.
- Não houve alteração de `Admin.html`, `Index.html` ou `Styles.html`, nem exclusão de dados históricos.
