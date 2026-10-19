# V6.4 — Correções motivadas pelos resultados reais do arquivo TESTES

## Evidências de entrada
Executado no Google Apps Script em 16/10/2026:
- Estado explícito: 19/19 aprovados.
- Conversacional determinístico: 12/12 aprovados.
- Adaptador: 4/4 aprovados.
- Integração determinística: 12/14 aprovados. As duas falhas estavam nos testes do contrato de `ajustarContinuidadeDiagnostico_()`.
- Gemini ponta a ponta: falhou após quatro turnos. O modelo repetiu semanticamente perguntas sobre horários de pico, e o motor encerrou por `REPETICAO_SEMANTICA`.
- A execução também registrou respostas HTTP 503 transitórias, recuperadas por nova tentativa. Isso é uma questão de disponibilidade do modelo distinta da falha conversacional.

## Causa confirmada no código
O fluxo de repetição anterior marcava a lacuna da dimensão como preenchida depois de detectar que uma pergunta candidata era semanticamente repetida. Isso fazia o estado afirmar que uma lacuna foi resolvida sem resposta factual. A validação então deixava a dimensão indisponível, enquanto o Gemini continuava a sugerir perguntas semelhantes.

A classificação de perguntas de escala também precisava diferenciar “quantos itens chegam no pico” de “em quais horários ocorre pico”. São variáveis diferentes: quantidade pertence a escala; tempo/distribuição pertence a frequência.

## Alterações nesta correção
- A detecção de repetição mantém a lacuna aberta; não fabrica conclusão.
- O prompt exige formular uma pergunta semanticamente diferente e informa explicitamente o motivo da rejeição.
- Escala, frequência e impacto têm definições separadas no prompt e na validação.
- A classificação de perguntas usa a intenção que o texto procura medir, não apenas palavras como “pico” ou “dia”.
- A suíte de integração ganhou casos para provar que repetição não fecha lacuna e que escala/frequência são diferenciadas.
- O motor permanece desativado por padrão. Não ativar antes do novo teste real com Gemini.

## Validação após a correção
Execução isolada em JavaScript:
- Estado explícito: 19/19.
- Conversacional determinístico: 12/12.
- Adaptador: 4/4.
- Integração determinística: 16/16.

Esses números não significam que o teste real com Gemini passou. O teste real precisa ser repetido no Apps Script, e a aceitação fica pendente até ele concluir sem repetir perguntas e sem marcar lacunas como resolvidas sem evidências.


## Auditoria complementar — 19/10/2026

A inspeção do contrato enviado ao Gemini encontrou um defeito adicional: o prompt de interpretação listava frequência, mas o responseSchema não permitia frequencia no enum de fatos[].dimensao. Isso explicava por que a dimensão não aparecia como fato confirmado mesmo quando o diálogo tratava de horários/picos.

Correções:
- Criada a função schemaInterpretacaoTurnoInvestigacaoV64_() como fonte única do schema de interpretação.
- Incluída frequencia no enum e teste de contrato que compara todas as dimensões do schema com DIMENSOES_V64.
- A suíte conversacional foi ampliada de 13 para 14 testes.
- O teste Gemini real foi fortalecido: agora executa até 10 turnos sintéticos e só retorna sucesso se confirmar as dimensões críticas, incluindo frequência e aceitação, passar pelo gate de conclusão, terminar sem pergunta pendente e não repetir perguntas literal ou lexicalmente equivalentes.
- A aprovação real anterior (4 turnos) é considerada insuficiente e não deve ser usada como aceite da V6.4.

Commits:
- Schema de interpretação com frequência: 6bd2ae632732a041fa1fafe5c6da945f9ec9424b.
- Teste de contrato do schema e aceitação ponta a ponta mais rigorosa: 51a50fb7fd5597a632eb98231eef8dec1cb8037c.

Estado: correções publicadas; ainda é necessário executar as suítes atualizadas no Google Apps Script. O motor permanece desativado.


### Teste determinístico de conversa completa — 19/10/2026

Foi adicionado à suíte conversacional um cenário de ponta a ponta determinístico que fornece fatos iniciais de processo, dor, escala, impacto e objetivo; em seguida responde frequência e critério de aceitação. O teste exige que o motor só conclua com as sete dimensões críticas confirmadas, gate aprovado e pergunta pendente removida.

Resultado reexecutado em V8 isolado: estado 19/19, conversacional 15/15, adaptador 4/4 e integração 17/17. Isso testa a lógica determinística do fluxo, não a chamada real ao Gemini nem os serviços do Google Apps Script.


### Runner único de validação — 19/10/2026

Foi criada a função TESTAR_SUITE_COMPLETA_INVESTIGACAO_V64() em TesteConversacionalV64.gs para executar as quatro suítes determinísticas e o teste Gemini real estrito em uma única rodada. Ela não reseta a baseline V6.3 e falha se a flag V6.4 estiver ativa. O runner está publicado; ainda precisa ser executado no Apps Script.
