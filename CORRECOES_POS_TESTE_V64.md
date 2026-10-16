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
