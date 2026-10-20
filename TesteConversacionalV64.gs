/**
 * FEEDS SOLUTIONS V6.4 — TESTES CONVERSACIONAIS
 *
 * TESTAR_CONVERSACIONAL_V64() executa cenários determinísticos com adaptadores
 * simulados: não chama Gemini nem altera planilhas.
 *
 * TESTAR_GEMINI_REAL_INVESTIGACAO_V64() é separado e chama Gemini real com
 * mensagem sintética. O log é sanitizado e não registra a mensagem completa.
 */

function TESTAR_CONVERSACIONAL_V64() {
  var resultados = [];
  function assert(nome, condicao, detalhe) {
    resultados.push({ teste: nome, passou: !!condicao, detalhe: detalhe || '' });
  }
  function estadoBase() {
    var e = criarEstadoInvestigacaoVazioV64_();
    atualizarFatoV64_(e, 'processo', 'Lançamento manual de pedidos', 'Lançamos os pedidos manualmente', CERTEZA_V64.CONFIRMADO, 'baseline');
    atualizarFatoV64_(e, 'dor_causa', 'Retrabalho na conferência', 'Precisamos conferir tudo de novo', CERTEZA_V64.CONFIRMADO, 'baseline');
    return e;
  }
  function adaptadores(opcoes) {
    opcoes = opcoes || {};
    return {
      interpretar: function(mensagem, estado) {
        return opcoes.interpretar ? opcoes.interpretar(mensagem, estado) : { fatos: [], respondeuPerguntaPendente: true, ambiguidade: false, explicacaoAmbiguidade: '' };
      },
      selecionarPergunta: function(estado, mensagem, motivo) {
        return opcoes.selecionarPergunta ? opcoes.selecionarPergunta(estado, mensagem, motivo) : {
          proximaPergunta: 'Qual etapa do processo precisa ser melhor compreendida?',
          dimensaoAlvo: 'processo',
          justificativa: 'A etapa ainda precisa ser detalhada.',
          lacunaQueReduz: 'etapas do processo'
        };
      },
      verificarRepeticao: function(perguntas, candidata) {
        return opcoes.verificarRepeticao ? opcoes.verificarRepeticao(perguntas, candidata) : { equivalente: false, indice: -1, motivo: '' };
      }
    };
  }
  function fato(dimensao, valor, evidencia, certeza, certezaDetalhe) {
    return { dimensao: dimensao, valor: valor, evidencia: evidencia, certeza: certeza, certezaDetalhe: certezaDetalhe || '' };
  }

  try {
    // O contrato do JSON Schema precisa acompanhar todas as dimensões do estado.
    // Esta regressão detecta dimensões declaradas no prompt/estado, mas proibidas
    // pelo schema enviado ao Gemini (como ocorreu com FREQUENCIA).
    // Verifica a dependência global antes de acessar o schema, com erro legível.
    var schemaFn = (typeof schemaInterpretacaoTurnoInvestigacaoV64_ === 'function') ? schemaInterpretacaoTurnoInvestigacaoV64_ : null;
    if (!schemaFn) throw new Error('DEPENDENCIA_SCHEMA_V64_AUSENTE: confirme que MotorInvestigacaoV64.gs está salvo no mesmo projeto Apps Script.');
    var schemaInterpretacao = schemaFn();
    var dimensoesSchema = schemaInterpretacao.properties.fatos.items.properties.dimensao.enum;
    var dimensoesContrato = Object.keys(DIMENSOES_V64).map(function(chave) { return DIMENSOES_V64[chave]; });
    assert('schema de interpretação aceita todas as dimensões contratuais, inclusive frequência',
      dimensoesSchema.length === dimensoesContrato.length &&
      dimensoesContrato.every(function(dim) { return dimensoesSchema.indexOf(dim) !== -1; }),
      'Contrato=' + dimensoesContrato.join(',') + '; schema=' + dimensoesSchema.join(','));

    // A resposta temporal não pode ser absorvida pelo fato de escala diário.
    var estadoFrequencia = estadoBase();
    atualizarFatoV64_(estadoFrequencia, 'escala', '100 pedidos por dia', '100 pedidos por dia', CERTEZA_V64.CONFIRMADO, 'baseline');
    definirPerguntaPendenteV64_(estadoFrequencia, { id: 'q-frequencia', dimensao: 'frequencia', texto: 'Em quais horários os pedidos costumam chegar?' });
    var interpretacaoFrequencia = {
      fatos: [fato('escala', 'Os pedidos chegam principalmente entre 10h e meio-dia', 'Os pedidos chegam principalmente entre 10h e meio-dia', 'CONFIRMADO')],
      respondeuPerguntaPendente: true,
      ambiguidade: false
    };
    corrigirFrequenciaMalClassificadaV64_(interpretacaoFrequencia, 'Os pedidos chegam principalmente entre 10h e meio-dia.', estadoFrequencia);
    assert('resposta de horário à pergunta de frequência não é classificada como escala',
      interpretacaoFrequencia.fatos[0].dimensao === 'frequencia' &&
      interpretacaoFrequencia.fatos[0].evidencia === 'Os pedidos chegam principalmente entre 10h e meio-dia');

    // Resposta de duração à pergunta pendente de impacto não pode virar frequência.
    var estadoImpacto = estadoBase();
    definirPerguntaPendenteV64_(estadoImpacto, { id: 'q-impacto', dimensao: 'impacto', texto: 'Qual é o impacto do tempo gasto na conferência?' });
    var interpretacaoImpacto = {
      fatos: [fato('frequencia', 'A conferência consome exatamente duas horas de trabalho por dia', 'A conferência consome exatamente duas horas de trabalho por dia', 'CONFIRMADO')],
      respondeuPerguntaPendente: true,
      ambiguidade: false
    };
    corrigirImpactoMalClassificadoV64_(interpretacaoImpacto, 'A conferência consome exatamente duas horas de trabalho por dia.', estadoImpacto);
    assert('duração de trabalho na pergunta pendente de impacto é classificada como impacto',
      interpretacaoImpacto.fatos[0].dimensao === 'impacto');

    // Regressão reproduzida no log Gemini real: a palavra "volume" aparece
    // dentro de uma pergunta temporal, mas não transforma a intenção em escala.
    var perguntaTemporalComVolume = classificarDimensaoPerguntaV64_(
      'Em quais dias da semana ou horários o volume de pedidos costuma ser maior?', null);
    var perguntaQuantitativaNoPico = classificarDimensaoPerguntaV64_(
      'Quantos pedidos chegam no horário de pico?', null);
    assert('pergunta sobre dias/horários com a palavra volume continua sendo frequência',
      perguntaTemporalComVolume === 'frequencia');
    assert('pergunta explícita sobre quantos pedidos no pico continua sendo escala',
      perguntaQuantitativaNoPico === 'escala');

    // 1. Resposta numérica à pergunta de escala é guardada como fato confirmado.
    var e1 = estadoBase();
    var r1 = processarTurnoInvestigacaoV64_(e1, 'São 100 pedidos por dia.', adaptadores({
      interpretar: function() { return { fatos: [fato('escala', '100 pedidos por dia', 'São 100 pedidos por dia', 'CONFIRMADO')], respondeuPerguntaPendente: true, ambiguidade: false }; },
      selecionarPergunta: function() { return { proximaPergunta: 'Quanto tempo a conferência consome por dia?', dimensaoAlvo: 'impacto', justificativa: 'Medir o esforço.', lacunaQueReduz: 'tempo consumido' }; }
    }));
    assert('1. volume numérico fica confirmado com evidência', r1.estado.fatos.escala.certeza === 'CONFIRMADO' && r1.estado.fatos.escala.evidencia === 'São 100 pedidos por dia');

    // 2. Periodicidade a pergunta de quantidade gera esclarecimento estreito sem repetição.
    var e2 = estadoBase();
    registrarPerguntaFeitaV64_(e2, 'Quantas divulgações vocês costumam fazer por semana?', 'escala', 'q-volume');
    definirPerguntaPendenteV64_(e2, { id: 'q-volume', dimensao: 'escala', texto: 'Quantas divulgações vocês costumam fazer por semana?' });
    var r2 = processarTurnoInvestigacaoV64_(e2, 'Diariamente.', adaptadores({
      interpretar: function() { return { fatos: [fato('frequencia', 'Diária', 'Diariamente', 'CONFIRMADO', 'PERIODICIDADE')], respondeuPerguntaPendente: true, ambiguidade: true, explicacaoAmbiguidade: 'A resposta informa frequência, não quantidade.' }; },
      selecionarPergunta: function() { return { proximaPergunta: 'Em média, quantas divulgações são feitas por dia?', dimensaoAlvo: 'escala', justificativa: 'A periodicidade foi informada, mas a quantidade não.', lacunaQueReduz: 'quantidade diária' }; }
    }));
    assert('2. periodicidade provoca esclarecimento estreito e não repete', r2.sucesso && r2.proxima_pergunta === 'Em média, quantas divulgações são feitas por dia?' &&
      normalizarPerguntaInvestigacaoV64_(r2.proxima_pergunta) !== normalizarPerguntaInvestigacaoV64_('Quantas divulgações vocês costumam fazer por semana?'));

    // 3. "não sei", "depende", "não acontece" e "às vezes" não viram fatos confirmados automaticamente.
    var respostas = [
      { texto: 'Não sei.', certeza: 'NEGADO', detalhe: 'NAO_SEI' },
      { texto: 'Depende.', certeza: 'ESTIMADO', detalhe: 'VARIAVEL' },
      { texto: 'Não acontece.', certeza: 'NEGADO', detalhe: 'NAO_EXISTE' },
      { texto: 'Às vezes.', certeza: 'ESTIMADO', detalhe: 'FREQUENCIA_APROXIMADA' }
    ];
    var naoConfirmouTodas = true;
    respostas.forEach(function(item) {
      var e = estadoBase();
      var r = processarTurnoInvestigacaoV64_(e, item.texto, adaptadores({
        interpretar: function() { return { fatos: [fato('impacto', item.texto, item.texto, item.certeza, item.detalhe)], respondeuPerguntaPendente: true, ambiguidade: false }; },
        selecionarPergunta: function() { return { proximaPergunta: 'Quantos pedidos são processados por dia?', dimensaoAlvo: 'escala', justificativa: 'Dimensionar o volume.', lacunaQueReduz: 'volume' }; }
      }));
      if (r.estado.fatos.impacto.certeza === 'CONFIRMADO') naoConfirmouTodas = false;
    });
    assert('3. respostas incertas/negativas não são promovidas a confirmadas', naoConfirmouTodas);

    // 4. Correção conflitante preserva o fato anterior e exige esclarecimento.
    var e4 = estadoBase();
    atualizarFatoV64_(e4, 'escala', '100 pedidos por dia', 'São 100 pedidos por dia', 'CONFIRMADO', 'turno-anterior');
    var r4 = processarTurnoInvestigacaoV64_(e4, 'Na verdade, são 200 por dia.', adaptadores({
      interpretar: function() { return { fatos: [fato('escala', '200 pedidos por dia', 'Na verdade, são 200 por dia', 'CONFIRMADO')], respondeuPerguntaPendente: true, ambiguidade: false }; }
    }));
    assert('4. correção conflitante preserva histórico e abre conflito', r4.estado.fatos.escala.valor === '100 pedidos por dia' &&
      r4.estado.conflitos.length === 1 && r4.proxima_pergunta.indexOf('Qual delas') !== -1);

    // 5. Uma mensagem com várias dimensões atualiza todos os fatos apresentados.
    var e5 = estadoBase();
    var r5 = processarTurnoInvestigacaoV64_(e5, 'Lançamos pedidos manualmente, perdemos duas horas por dia e queremos reduzir a conferência.', adaptadores({
      interpretar: function() { return { fatos: [
        fato('processo', 'Lançamento manual de pedidos', 'Lançamos pedidos manualmente', 'CONFIRMADO'),
        fato('impacto', 'Duas horas por dia', 'perdemos duas horas por dia', 'CONFIRMADO'),
        fato('objetivo', 'Reduzir a conferência', 'queremos reduzir a conferência', 'CONFIRMADO')
      ], respondeuPerguntaPendente: true, ambiguidade: false }; },
      selecionarPergunta: function() { return { proximaPergunta: 'Como vocês verificariam que a melhoria funcionou?', dimensaoAlvo: 'aceitacao', justificativa: 'Definir critério observável.', lacunaQueReduz: 'critérios de aceitação' }; }
    }));
    assert('5. múltiplas dimensões da mesma resposta são registradas',
      r5.estado.fatos.processo.certeza === 'CONFIRMADO' &&
      r5.estado.fatos.impacto.certeza === 'CONFIRMADO' &&
      r5.estado.fatos.objetivo.certeza === 'CONFIRMADO');

    // 6. Uma resposta que cobre a pergunta atual e outra dimensão guarda ambas.
    var e6 = estadoBase();
    var r6 = processarTurnoInvestigacaoV64_(e6, 'São 100 pedidos por dia e a conferência leva 2 horas.', adaptadores({
      interpretar: function() { return { fatos: [
        fato('escala', '100 pedidos por dia', 'São 100 pedidos por dia', 'CONFIRMADO'),
        fato('impacto', '2 horas', 'a conferência leva 2 horas', 'CONFIRMADO')
      ], respondeuPerguntaPendente: true, ambiguidade: false }; },
      selecionarPergunta: function() { return { proximaPergunta: 'Há exceções ao processo padrão?', dimensaoAlvo: 'excecoes', justificativa: 'Mapear regras especiais.', lacunaQueReduz: 'exceções' }; }
    }));
    assert('6. informação extra de outra dimensão não se perde',
      r6.estado.fatos.escala.valor === '100 pedidos por dia' && r6.estado.fatos.impacto.valor === '2 horas');

    // 7. Uma pergunta sobre volume já respondida não pode entrar em loop.
    var e7 = estadoBase();
    atualizarFatoV64_(e7, 'escala', '100 pedidos por dia', 'São 100 pedidos por dia', 'CONFIRMADO', 'baseline');
    registrarPerguntaFeitaV64_(e7, 'Qual é o volume diário de pedidos?', 'escala', 'q-antiga');
    var selecionadas7 = 0;
    var r7 = processarTurnoInvestigacaoV64_(e7, 'O problema ocorre todos os dias.', adaptadores({
      interpretar: function() { return { fatos: [fato('frequencia', 'Diária', 'todos os dias', 'CONFIRMADO')], respondeuPerguntaPendente: true, ambiguidade: false }; },
      selecionarPergunta: function(estado, mensagem, motivo) {
        selecionadas7++;
        if (motivo.indexOf('DIMENSAO_JA_SUFICIENTE') !== -1 ||
            motivo.indexOf('REPETICAO_SEMANTICA') !== -1 ||
            motivo.indexOf('DIMENSAO_ALVO_NAO_CORRESPONDE') !== -1) {
          return { proximaPergunta: 'Quais consequências concretas os erros causam?', dimensaoAlvo: 'impacto', justificativa: 'Investigar consequência ainda desconhecida.', lacunaQueReduz: 'consequências' };
        }
        return { proximaPergunta: 'Quantos pedidos vocês processam por dia?', dimensaoAlvo: 'escala', justificativa: 'Medir o volume.', lacunaQueReduz: 'volume diário' };
      },
      verificarRepeticao: function(perguntas, candidata) {
        var p = normalizarPerguntaInvestigacaoV64_(candidata);
        return p.indexOf('quantos pedidos') === 0
          ? { equivalente: true, indice: 0, motivo: 'mesma informação de volume diário' }
          : { equivalente: false, indice: -1, motivo: '' };
      }
    }));
    assert('7. repetição semântica ou dimensão já suficiente é substituída', r7.sucesso &&
      r7.proxima_pergunta === 'Quais consequências concretas os erros causam?' && selecionadas7 >= 2);

    // 8. Comparação semântica é delegada ao avaliador semântico.
    var cmp = compararPerguntaSemanticamenteV64_(
      ['Quanto tempo a conferência demora?'],
      'Quantas horas são gastas conferindo os pedidos?',
      function() { return { equivalente: true, indice: 0, motivo: 'mesma informação sobre duração' }; }
    );
    assert('8. paráfrase semanticamente equivalente é detectada', cmp.equivalente === true && cmp.indice === 0);

    // 9. Exceções e regras especiais são persistidas no campo próprio.
    var e9 = estadoBase();
    var r9 = processarTurnoInvestigacaoV64_(e9, 'Pedidos urgentes pulam a conferência.', adaptadores({
      interpretar: function() { return { fatos: [fato('excecoes', 'Pedidos urgentes pulam a conferência', 'Pedidos urgentes pulam a conferência', 'CONFIRMADO')], respondeuPerguntaPendente: true, ambiguidade: false }; },
      selecionarPergunta: function() { return { proximaPergunta: 'Quantos pedidos são processados por dia?', dimensaoAlvo: 'escala', justificativa: 'Dimensionar a exceção.', lacunaQueReduz: 'volume' }; }
    }));
    assert('9. exceções ficam registradas separadamente', r9.estado.fatos.excecoes.valor === 'Pedidos urgentes pulam a conferência');

    // 10. Sistemas e canais mencionados permanecem no fato de processo.
    var e10 = estadoBase();
    var r10 = processarTurnoInvestigacaoV64_(e10, 'Recebemos pelo WhatsApp e lançamos no ERP e na planilha.', adaptadores({
      interpretar: function() { return { fatos: [Object.assign(fato('processo', 'Recebimento pelo WhatsApp; lançamento no ERP e na planilha', 'WhatsApp; ERP; planilha', 'CONFIRMADO'), { tipoAtualizacao: 'EXTENSAO' })], respondeuPerguntaPendente: true, ambiguidade: false }; },
      selecionarPergunta: function() { return { proximaPergunta: 'Em qual etapa surgem os erros?', dimensaoAlvo: 'dor_causa', justificativa: 'Localizar a falha.', lacunaQueReduz: 'etapa da falha' }; }
    }));
    assert('10. múltiplos sistemas e canais são registrados sem apagar o fato anterior',
      r10.estado.fatos.processo.valor === 'Lançamento manual de pedidos' &&
      r10.estado.fatos.processo.detalhes.length === 1 &&
      /WhatsApp/.test(r10.estado.fatos.processo.detalhes[0].valor) &&
      /ERP/.test(r10.estado.fatos.processo.detalhes[0].valor) &&
      /planilha/.test(r10.estado.fatos.processo.detalhes[0].valor));

    // 11. O gate bloqueia conclusão quando processo ou objetivo essencial é desconhecido.
    var e11 = criarEstadoInvestigacaoVazioV64_();
    atualizarFatoV64_(e11, 'dor_causa', 'Retrabalho', 'Precisamos refazer', 'CONFIRMADO', 'turno');
    atualizarFatoV64_(e11, 'impacto', 'Duas horas', 'Duas horas', 'CONFIRMADO', 'turno');
    var gate11 = podeConcluirDiagnosticoV64_(e11);
    assert('11. gate bloqueia dimensões essenciais desconhecidas', gate11.pode === false && /DESCONHECIDA/.test(gate11.motivo));

    // 12. Estado e pergunta pendente são serializados e recuperados.
    var e12 = estadoBase();
    registrarPerguntaFeitaV64_(e12, 'Em média, quantos pedidos são processados por dia?', 'escala', 'q-12');
    definirPerguntaPendenteV64_(e12, { id: 'q-12', dimensao: 'escala', texto: 'Em média, quantos pedidos são processados por dia?' });
    var envelope = inserirEstadoInvestigacaoV64EmInformacoes_([{ tipo: 'LEGADO', valor: 'preservar' }], e12);
    var e12Recuperado = extrairEstadoInvestigacaoV64DeInformacoes_(JSON.stringify(envelope));
    assert('12. persistência recupera pergunta pendente e preserva dados legados',
      !!e12Recuperado && e12Recuperado.perguntaPendente.texto === e12.perguntaPendente.texto &&
      envelope[0].tipo === 'LEGADO');

    // 14. Fluxo completo determinístico: fatos essenciais, frequência e aceitação
    // precisam ser coletados antes de o gate permitir conclusão.
    var e2e = criarEstadoInvestigacaoVazioV64_();
    var resultadoE2E = null;
    var mensagemE2E = 'Recebemos 100 pedidos por dia, lançamos manualmente, há erros de digitação, a conferência consome duas horas e queremos reduzir o retrabalho.';
    var respostasE2E = {
      frequencia: 'O maior movimento acontece no intervalo entre 10h e meio-dia; não estou falando da quantidade, mas dos horários em que chegam.',
      aceitacao: 'Consideraremos sucesso reduzir o retrabalho pela metade.'
    };
    for (var passoE2E = 0; passoE2E < 4; passoE2E++) {
      resultadoE2E = processarTurnoInvestigacaoV64_(e2e, mensagemE2E, adaptadores({
        interpretar: function(mensagem, estado) {
          if (!estado.perguntaPendente) {
            return {
              fatos: [
                fato('processo', 'Lançamento manual de pedidos', 'lançamos manualmente', 'CONFIRMADO'),
                fato('dor_causa', 'Erros de digitação e retrabalho', 'há erros de digitação', 'CONFIRMADO'),
                fato('escala', '100 pedidos por dia', '100 pedidos por dia', 'CONFIRMADO'),
                fato('impacto', 'Duas horas de conferência por dia', 'consome duas horas', 'CONFIRMADO'),
                fato('objetivo', 'Reduzir retrabalho', 'queremos reduzir o retrabalho', 'CONFIRMADO')
              ],
              respondeuPerguntaPendente: true,
              ambiguidade: false
            };
          }
          var dim = estado.perguntaPendente.dimensao;
          return {
            fatos: [fato(dim, respostasE2E[dim], mensagem, 'CONFIRMADO')],
            respondeuPerguntaPendente: true,
            ambiguidade: false
          };
        },
        selecionarPergunta: function(estado) {
          if (estado.lacunas.frequencia) {
            return { proximaPergunta: 'Em quais horários os pedidos costumam chegar?', dimensaoAlvo: 'frequencia', justificativa: 'Identificar distribuição temporal.', lacunaQueReduz: 'horários' };
          }
          if (estado.lacunas.aceitacao) {
            return { proximaPergunta: 'Como vamos medir o sucesso da melhoria?', dimensaoAlvo: 'aceitacao', justificativa: 'Definir critério verificável.', lacunaQueReduz: 'critério de sucesso' };
          }
          return { proximaPergunta: 'Como vamos medir o sucesso da melhoria?', dimensaoAlvo: 'aceitacao', justificativa: 'Definir critério verificável.', lacunaQueReduz: 'critério de sucesso' };
        }
      }));
      e2e = resultadoE2E.estado;
      if (resultadoE2E.status_diagnostico === 'CONCLUIDO') break;
      if (e2e.perguntaPendente && respostasE2E[e2e.perguntaPendente.dimensao]) {
        mensagemE2E = respostasE2E[e2e.perguntaPendente.dimensao];
      } else if (e2e.perguntaPendente) {
        mensagemE2E = 'Resposta sintética para a dimensão pendente.';
      }
    }
    assert('14. fluxo completo só conclui após confirmar frequência e critério de aceitação',
      !!resultadoE2E &&
      resultadoE2E.sucesso === true &&
      resultadoE2E.status_diagnostico === 'CONCLUIDO' &&
      resultadoE2E.gate && resultadoE2E.gate.pode === true &&
      e2e.perguntaPendente === null &&
      ['processo','dor_causa','escala','frequencia','impacto','objetivo','aceitacao'].every(function(dim) {
        return e2e.fatos[dim].certeza === CERTEZA_V64.CONFIRMADO;
      }));

    // 13. O fallback determinístico recupera a investigação sem preencher lacunas.
    var e13 = estadoBase();
    var fallback13 = selecionarFallbackDeterministicoInvestigacaoV64_(e13);
    assert('13. fallback seleciona uma pergunta válida para lacuna ainda aberta',
      !!fallback13 && fallback13.validacao.valida &&
      e13.lacunas[fallback13.candidata.dimensaoAlvo] !== false &&
      !e13.perguntasFeitas.some(function(p) {
        return (p.dimensao || classificarDimensaoPerguntaV64_(p.texto || p, e13)) === fallback13.candidata.dimensaoAlvo;
      }));

    // 20. Gate já satisfeito tem precedência sobre uma pergunta pendente
    // cuja resposta não foi reconhecida: não manter a investigação aberta artificialmente.
    var e20 = estadoBase();
    atualizarFatoV64_(e20, 'escala', '100 pedidos por dia', 'São 100 pedidos por dia', CERTEZA_V64.CONFIRMADO, 'fixture');
    atualizarFatoV64_(e20, 'frequencia', 'Pico entre 10h e meio-dia', 'Os pedidos chegam entre 10h e meio-dia', CERTEZA_V64.CONFIRMADO, 'fixture');
    atualizarFatoV64_(e20, 'impacto', 'Duas horas por dia', 'A conferência consome duas horas por dia', CERTEZA_V64.CONFIRMADO, 'fixture');
    atualizarFatoV64_(e20, 'objetivo', 'Reduzir retrabalho', 'Queremos reduzir o retrabalho', CERTEZA_V64.CONFIRMADO, 'fixture');
    atualizarFatoV64_(e20, 'aceitacao', 'Reduzir retrabalho pela metade', 'Consideraremos sucesso reduzir o retrabalho pela metade', CERTEZA_V64.CONFIRMADO, 'fixture');
    definirPerguntaPendenteV64_(e20, { id: 'q-pendente-20', dimensao: 'restricoes', texto: 'Há alguma restrição adicional?' });
    var r20 = processarTurnoInvestigacaoV64_(e20, 'Precisamos manter as ferramentas atuais.', adaptadores({
      interpretar: function() {
        return { fatos: [], respondeuPerguntaPendente: false, ambiguidade: true, explicacaoAmbiguidade: 'Resposta não reconhecida para a pergunta pendente.' };
      }
    }));
    assert('20. gate satisfeito encerra diagnóstico mesmo se a resposta à última pergunta não foi reconhecida',
      r20.sucesso === true &&
      r20.status_diagnostico === 'CONCLUIDO' &&
      r20.gate && r20.gate.pode === true &&
      r20.estado.perguntaPendente === null &&
      r20.proxima_pergunta === '');

  } catch (erro) {
    resultados.push({ teste: 'execução da suíte', passou: false, detalhe: erro && erro.stack ? erro.stack : String(erro) });
  }

  var aprovados = resultados.filter(function(r) { return r.passou; }).length;
  var resumo = {
    versao: 'V6.4',
    suite: 'CONVERSACIONAL_DETERMINISTICA',
    sucesso: resultados.length === 20 && aprovados === resultados.length,
    total: resultados.length,
    aprovados: aprovados,
    falhas: resultados.length - aprovados,
    resultados: resultados
  };
  Logger.log('FEEDS SOLUTIONS V6.4 — TESTES CONVERSACIONAIS DETERMINÍSTICOS: ' + JSON.stringify(resumo));
  return resumo;
}


/**
 * Teste real e separado com Gemini. Executar somente quando a chave Gemini
 * estiver configurada e o serviço disponível. Registra apenas metadados sanitizados.
 */
function TESTAR_GEMINI_REAL_INVESTIGACAO_V64() {
  var estado = criarEstadoInvestigacaoVazioV64_();
  var mensagens = [];
  var turnosProcessados = 0;
  var perguntas = [];
  var falha = '';
  // As respostas sintéticas devem responder ao conteúdo provável da pergunta, não apenas repetir o nome da dimensão.
  // Frequência aqui significa distribuição temporal/picos, pois o volume diário já foi informado na mensagem inicial.
  var respostaPorDimensao = {
    processo: 'Recebemos pedidos pelo WhatsApp, lançamos em uma planilha e depois conferimos os dados.',
    dor_causa: 'Ocorrem erros de digitação e retrabalho durante a conferência.',
    escala: 'São exatamente 100 pedidos por dia.',
    frequencia: 'Os pedidos chegam principalmente entre 10h e meio-dia.',
    impacto: 'A consequência é perder exatamente duas horas de trabalho por dia na conferência, reduzindo o tempo disponível para atender pedidos.',
    excecoes: 'Pedidos urgentes às vezes pulam a conferência.',
    objetivo: 'Queremos reduzir o retrabalho e liberar tempo da equipe.',
    restricoes: 'Precisamos manter as ferramentas atuais e proteger os dados.',
    aceitacao: 'Consideraremos sucesso reduzir o retrabalho pela metade.'
  };
  try {
    mensagens.push('Recebemos cerca de 100 pedidos por dia pelo WhatsApp, lançamos manualmente em planilha e gastamos duas horas conferindo.');
    for (var turno = 0; turno < 10; turno++) {
      if (turno > 0) {
        var pendente = estado.perguntaPendente;
        if (!pendente || !pendente.dimensao) break;
        mensagens.push(respostaPorDimensao[pendente.dimensao] || 'Preciso esclarecer esse ponto antes de responder.');
      }
      var resultado = processarTurnoInvestigacaoV64_(estado, mensagens[mensagens.length - 1]);
      estado = resultado.estado;
      turnosProcessados++;
      if (!resultado.sucesso) {
        falha = String(resultado.motivo || resultado.erro || 'MOTOR_SEM_PERGUNTA_VALIDA');
        break;
      }
      if (resultado.proxima_pergunta) perguntas.push(normalizarPerguntaInvestigacaoV64_(resultado.proxima_pergunta));
      if (resultado.status_diagnostico === 'CONCLUIDO') break;
    }

    var fatosConfirmados = Object.keys(estado.fatos || {}).filter(function(dim) {
      return estado.fatos[dim] && estado.fatos[dim].certeza === CERTEZA_V64.CONFIRMADO;
    });
    var semEvidencia = fatosConfirmados.filter(function(dim) {
      return !String(estado.fatos[dim].evidencia || '').trim();
    });
    var semRepeticaoLiteral = perguntas.every(function(p, i) { return perguntas.indexOf(p) === i; });
    var indicesComRepeticaoSemantica = [];
    perguntas.forEach(function(pergunta, indice) {
      if (indice === 0) return;
      var anteriores = perguntas.slice(0, indice);
      var comparacao = compararPerguntaSemanticamenteV64_(anteriores, pergunta, function() {
        return { equivalente: false, indice: -1, motivo: 'COMPARACAO_LEXICAL_DE_TESTE' };
      });
      if (comparacao.equivalente) indicesComRepeticaoSemantica.push(indice);
    });
    var semRepeticaoSemantica = indicesComRepeticaoSemantica.length === 0;
    var dimensoesCriticas = ['processo','dor_causa','escala','frequencia','impacto','objetivo','aceitacao'];
    var dimensoesCriticasNaoConfirmadas = dimensoesCriticas.filter(function(dim) {
      return !estado.fatos[dim] || estado.fatos[dim].certeza !== CERTEZA_V64.CONFIRMADO;
    });
    var gate = podeConcluirDiagnosticoV64_(estado);
    var semPerguntaPendente = estado.perguntaPendente === null;
    var sucesso = turnosProcessados > 0 &&
      !falha &&
      semEvidencia.length === 0 &&
      semRepeticaoLiteral &&
      semRepeticaoSemantica &&
      dimensoesCriticasNaoConfirmadas.length === 0 &&
      gate.pode === true &&
      semPerguntaPendente &&
      resultado.status_diagnostico === 'CONCLUIDO';

    var resumo = {
      versao: 'V6.4',
      teste: 'GEMINI_REAL_PONTA_A_PONTA',
      sucesso: sucesso,
      turnosProcessados: turnosProcessados,
      limiteTurnos: 10,
      quantidadePerguntasGeradas: perguntas.length,
      dimensoesConfirmadas: fatosConfirmados,
      dimensoesCriticasNaoConfirmadas: dimensoesCriticasNaoConfirmadas,
      nenhumFatoConfirmadoSemEvidencia: semEvidencia.length === 0,
      nenhumaRepeticaoLiteral: semRepeticaoLiteral,
      nenhumaRepeticaoSemanticaLexical: semRepeticaoSemantica,
      gateConcluiuSomenteComCondicoesSatisfeitas: gate.pode === true && resultado.status_diagnostico === 'CONCLUIDO',
      perguntaPendenteAoFinal: !semPerguntaPendente,
      conclusao: resultado.status_diagnostico || 'INVESTIGACAO',
      sanitizado: true,
      falha: falha ? falha.slice(0, 180) : ''
    };
    Logger.log('FEEDS SOLUTIONS V6.4 — GEMINI REAL (SANITIZADO): ' + JSON.stringify(resumo));
    return resumo;
  } catch (erro) {
    var falhaFinal = {
      versao: 'V6.4',
      teste: 'GEMINI_REAL_PONTA_A_PONTA',
      sucesso: false,
      erro: String(erro && erro.message || erro).slice(0, 180),
      sanitizado: true
    };
    Logger.log('FEEDS SOLUTIONS V6.4 — GEMINI REAL (SANITIZADO): ' + JSON.stringify(falhaFinal));
    return falhaFinal;
  }
}


/**
 * Executa a bateria V6.4 em uma única execução do Apps Script.
 * Não reseta a baseline V6.3 nem grava dados de produção.
 * O último teste chama Gemini real com dados sintéticos.
 */
function TESTAR_SUITE_COMPLETA_INVESTIGACAO_V64() {
  var suites = [];
  function executar(nome, fn) {
    try {
      var r = fn();
      suites.push({
        suite: nome,
        sucesso: !!(r && r.sucesso === true),
        total: r && r.total !== undefined ? r.total : null,
        aprovados: r && r.aprovados !== undefined ? r.aprovados : null,
        falhas: r && r.falhas !== undefined ? r.falhas : null,
        turnosProcessados: r && r.turnosProcessados !== undefined ? r.turnosProcessados : null,
        dimensoesCriticasNaoConfirmadas: r && r.dimensoesCriticasNaoConfirmadas || [],
        erro: r && (r.falha || r.erro) ? String(r.falha || r.erro).slice(0, 180) : ''
      });
    } catch (e) {
      suites.push({
        suite: nome,
        sucesso: false,
        total: null,
        aprovados: null,
        falhas: null,
        erro: String(e && e.message || e).slice(0, 180)
      });
    }
  }

  // Resolver cada teste dentro de uma função evita que um ReferenceError
  // na avaliação dos argumentos interrompa o runner antes do tratamento de erro.
  function executarSeDisponivel(nomeSuite, nomeFuncao) {
    executar(nomeSuite, function() {
      var funcoes = {
        TESTAR_ESTADO_INVESTIGACAO_V64: typeof TESTAR_ESTADO_INVESTIGACAO_V64 === 'function' ? TESTAR_ESTADO_INVESTIGACAO_V64 : null,
        TESTAR_CONVERSACIONAL_V64: typeof TESTAR_CONVERSACIONAL_V64 === 'function' ? TESTAR_CONVERSACIONAL_V64 : null,
        TESTAR_ADAPTADOR_INVESTIGACAO_V64: typeof TESTAR_ADAPTADOR_INVESTIGACAO_V64 === 'function' ? TESTAR_ADAPTADOR_INVESTIGACAO_V64 : null,
        TESTAR_INTEGRACAO_V64: typeof TESTAR_INTEGRACAO_V64 === 'function' ? TESTAR_INTEGRACAO_V64 : null,
        TESTAR_ADVERSARIAL_INVESTIGACAO_V64: typeof TESTAR_ADVERSARIAL_INVESTIGACAO_V64 === 'function' ? TESTAR_ADVERSARIAL_INVESTIGACAO_V64 : null,
        TESTAR_GEMINI_REAL_INVESTIGACAO_V64: typeof TESTAR_GEMINI_REAL_INVESTIGACAO_V64 === 'function' ? TESTAR_GEMINI_REAL_INVESTIGACAO_V64 : null
      };
      var fn = funcoes[nomeFuncao];
      if (typeof fn !== 'function') {
        throw new Error('FUNCAO_TESTE_AUSENTE: ' + nomeFuncao +
          '. Sincronize o arquivo .gs que declara essa função a partir do GitHub.');
      }
      return fn();
    });
  }

  executarSeDisponivel('ESTADO_EXPLICITO', 'TESTAR_ESTADO_INVESTIGACAO_V64');
  executarSeDisponivel('CONVERSACIONAL_DETERMINISTICA', 'TESTAR_CONVERSACIONAL_V64');
  executarSeDisponivel('ADAPTADOR', 'TESTAR_ADAPTADOR_INVESTIGACAO_V64');
  executarSeDisponivel('INTEGRACAO_DETERMINISTICA', 'TESTAR_INTEGRACAO_V64');
  executarSeDisponivel('ADVERSARIAL_DETERMINISTICA', 'TESTAR_ADVERSARIAL_INVESTIGACAO_V64');
  executarSeDisponivel('GEMINI_REAL_PONTA_A_PONTA', 'TESTAR_GEMINI_REAL_INVESTIGACAO_V64');

  var resumo = {
    versao: 'V6.4',
    suite: 'SUITE_COMPLETA_INVESTIGACAO',
    sucesso: suites.length === 6 && suites.every(function(s) { return s.sucesso; }) && motorInvestigacaoV64Ativo_() === false,
    totalSuites: suites.length,
    suitesAprovadas: suites.filter(function(s) { return s.sucesso; }).length,
    suitesFalhas: suites.filter(function(s) { return !s.sucesso; }).length,
    ativacaoMantidaDesligada: motorInvestigacaoV64Ativo_() === false,
    resultados: suites
  };
  Logger.log('FEEDS SOLUTIONS V6.4 — SUÍTE COMPLETA: ' + JSON.stringify(resumo));
  return resumo;
}
