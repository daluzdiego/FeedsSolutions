# FEEDS SOLUTIONS — Proposta de endurecimento do diagnóstico conversacional

## Decisão
Não considerar a qualidade da investigação aprovada apenas porque funções isoladas ou suítes legadas executaram sem exceção. Preservar a V6.3 como baseline, mas tratar os defeitos conversacionais observados como bloqueadores funcionais para a próxima evolução.

## Evidências encontradas no repositório em 2026-10-16
1. Em `TESTES`, execução do Diagnóstico Profundo V6.3 (RUN_ID `f4ec9812-4cee-486d-acc1-a72f5360916e`), o caso 10/71 registra quatro falhas: respostas `diariamente` e `eventualmente` não são reconhecidas quando a pergunta pendente é “Quantas divulgações vocês costumam fazer por semana?”.
2. Um registro de fluxo real descrito no mesmo arquivo marca os testes de fluxo como “PASSOU”, apesar de o diagnóstico retornado manter `objetivo: ""`, `status_diagnostico: "INVESTIGACAO"` e próxima pergunta genérica. O critério de aprovação não mede a qualidade ou suficiência da investigação.
3. `Dignostico.gs` recupera a pergunta pendente buscando a última mensagem cujo remetente é `SISTEMA` ou cujo tipo é `PERGUNTA_IA`. A implementação pode aceitar uma mensagem do sistema que não seja uma pergunta investigativa, e o contexto guarda histórico limitado aos últimos 20 itens.
4. `ajustarContinuidadeDiagnostico_()` contém regras heurísticas determinísticas para a dimensão da pergunta, resposta válida e próxima dimensão. A classificação da pergunta “Quantas divulgações vocês costumam fazer por semana?” é VOLUME; por isso a regra para VOLUME rejeita “diariamente” e “eventualmente”, embora possam ser respostas válidas de frequência quando o empresário interpreta a pergunta como periodicidade. O sistema precisa separar quantidade por período da periodicidade do processo e repreguntar com clareza quando houver ambiguidade, não insistir em silêncio na mesma frase.
5. `construirEntradaDiagnosticoIA_()` instrui a IA a usar histórico e diagnóstico consolidado, mas a seleção da próxima pergunta também depende das heurísticas após a IA. Uma análise semântica correta não garante que o mecanismo determinístico preserve a intenção conversacional.
6. `TesteAceitacaoFinalV63.gs` explicita que “APROVADO” pode significar apenas que um teste executou sem exceção, pois muitos testes legados não oferecem retorno padronizado de assertivas. Portanto, 48/48 suítes executadas não é equivalente a 100% de qualidade do diálogo.

## Objetivo de produto
A IA deve descobrir com evidências suficientes como o trabalho é feito, onde falha, por que falha, quais consequências produz, quais exceções existem, quais restrições precisam ser respeitadas e como será medido o sucesso de uma futura solução. Deve gerar requisitos claros para desenvolvimento personalizado; não deve saltar prematuramente para recomendar solução.

## Contrato obrigatório para cada turno
A cada mensagem do empresário, o motor precisa:
1. Resolver o estado da conversa e identificar qual pergunta realmente ficou pendente.
2. Interpretar a resposta em contexto, inclusive respostas parciais, correções, negações, incerteza e informações espontâneas sobre outras dimensões.
3. Atualizar fatos sem destruir informação anterior, guardando origem/evidência e nível de certeza.
4. Atualizar lacunas por dimensão; distinguir desconhecido, negado, estimado e confirmado.
5. Escolher uma única próxima pergunta que reduza a incerteza mais relevante para o diagnóstico.
6. Verificar antes de responder se a pergunta é repetida, já respondida, irrelevante ou prematura.
7. Se a resposta for ambígua, formular uma pergunta de esclarecimento estreita; não marcar a dimensão como concluída por conveniência.
8. Não concluir a investigação enquanto os requisitos essenciais e os critérios de aceite do diagnóstico não estiverem satisfeitos.

## Esquema mínimo de evidências
- Processo: gatilho/entrada, atores, etapas, sistemas/canais utilizados, saídas e destino.
- Dor/causa: problema observado, em que etapa ocorre, exemplos concretos, frequência, causa conhecida versus hipótese.
- Escala: volume e unidade por intervalo; nunca confundir volume com frequência ou impacto.
- Impacto: tempo, custo, erros, atrasos, retrabalho, receita/risco, distinguindo medido de estimado.
- Exceções: casos fora do fluxo padrão, regras especiais e tratamento atual.
- Objetivo: resultado que o empresário busca; se não souber, registrar isso sem inventar.
- Restrições: orçamento, ferramentas que precisam ser mantidas, permissões, segurança, integrações, prazo e regras operacionais pertinentes.
- Aceitação: como verificar que a solução funcionou, indicadores e condições de sucesso.
Nem todas as dimensões precisam ter valor numérico ou ser aplicáveis; as não aplicáveis/negadas devem ser explicitamente registradas.

## Critério de pergunta cirúrgica
Selecionar a pergunta com maior valor para diminuir uma lacuna que afeta a compreensão, causa, viabilidade ou critérios de aceitação. Fazer uma pergunta por turno, em linguagem simples, ligada ao que o empresário já disse. Evitar checklist rígido, perguntas múltiplas disfarçadas e perguntas genéricas como “qual o impacto?” sem contexto.

## Nova suíte de testes de ponta a ponta (obrigatória antes de declarar aceite)
Testar conversas inteiras, em múltiplos turnos, cobrindo:
- resposta numérica à pergunta de volume;
- resposta com periodicidade a pergunta ambígua de quantidade por semana;
- respostas “não sei”, “depende”, “não acontece”, “às vezes” e correções;
- uma mensagem que espontaneamente inclui várias dimensões;
- resposta de uma dimensão que menciona outra;
- informação já dita que não pode ser perguntada de novo;
- variações semânticas de uma mesma pergunta, não apenas igualdade literal;
- exceções e regras de negócio;
- múltiplos sistemas/canais;
- impossibilidade de concluir quando objetivo/processo essencial ainda é desconhecido;
- persistência entre chamadas e recuperação correta da pergunta pendente;
- teste real com Gemini, com entrada e saída registradas de forma sanitizada.
Em cada passo, avaliar estado antes/depois, campo atualizado, evidência atribuída, próxima lacuna, pergunta emitida e prova de que não há repetição. Retornos “executou sem exceção” não contam como aprovação.

## Critérios de aceite sugeridos
- Zero perguntas repetidas ou semanticamente equivalentes nos roteiros testados.
- Zero fatos confirmados sem evidência.
- Nenhuma conclusão quando faltam dimensões essenciais para o tipo de problema.
- Toda resposta relevante é registrada no campo correspondente ou identificada como ambígua/não aplicável.
- A próxima pergunta é justificada por uma lacuna real e não por uma sequência fixa.
- Diagnóstico final inclui fatos confirmados, inferências explicitadas, desconhecidos, hipóteses, exceções, requisitos e critérios de aceite.
- O relatório distingue testes unitários, testes de integração determinísticos, cenários de ponta a ponta com Gemini e amostras reais revisadas por humano.

## Plano de implementação
1. Preservar baseline V6.3 e o fallback existente.
2. Adicionar uma suíte conversacional de ponta a ponta antes de alterar a lógica de produção.
3. Registrar uma estrutura de estado conversacional explícita: pergunta pendente com dimensão e ID, respostas anteriores, lacunas, evidências e histórico de perguntas equivalentes.
4. Corrigir a recuperação da pergunta pendente para localizar a última pergunta investigativa real, não simplesmente a última mensagem do sistema.
5. Desacoplar a interpretação de resposta da seleção da próxima pergunta. A seleção deve receber estado consolidado e lacunas; as heurísticas não devem sobrescrever uma interpretação válida sem motivo registrado.
6. Corrigir o caso de volume versus frequência. Se a pergunta pede número de itens por semana e a resposta é “diariamente”, esclarecer se o empresário informa periodicidade ou volume, mantendo o que já foi dito e sem loop.
7. Implementar gate de conclusão com campos essenciais e evidência; se não estiver pronto, a investigação deve continuar ou registrar conscientemente que o empresário não sabe responder.
8. Rodar regressão completa e revisar diálogos reais antes de declarar aceite.

## Restrições
Não alterar a interface/UX nem apagar dados históricos nessa etapa. Não mexer em múltiplos módulos ao mesmo tempo sem evidência. Toda alteração de produção deve ter patch delimitado, testes antes/depois e rollback claro.
