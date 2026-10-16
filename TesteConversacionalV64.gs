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

    // 7. A pergunta semanticamente repetida é rejeitada e o motor tenta outra.
    var e7 = estadoBase();
    registrarPerguntaFeitaV64_(e7, 'Qual é o volume diário de pedidos?', 'escala', 'q-antiga');
    var r7 = processarTurnoInvestigacaoV64_(e7, 'O problema ocorre todos os dias.', adaptadores({
      interpretar: function() { return { fatos: [fato('frequencia', 'Diária', 'todos os dias', 'CONFIRMADO')], respondeuPerguntaPendente: true, ambiguidade: false }; },
      selecionarPergunta: function(estado, mensagem, motivo) {
        return motivo.indexOf('REPETICAO_SEMANTICA') !== -1
          ? { proximaPergunta: 'Quais consequências concretas os erros causam?', dimensaoAlvo: 'impacto', justificativa: 'Investigar consequência ainda desconhecida.', lacunaQueReduz: 'consequências' }
          : { proximaPergunta: 'Quantos pedidos vocês processam por dia?', dimensaoAlvo: 'escala', justificativa: 'Medir o volume.', lacunaQueReduz: 'volume diário' };
      },
      verificarRepeticao: function(perguntas, candidata) {
        return normalizarPerguntaInvestigacaoV64_(candidata).indexOf('quantos pedidos') === 0 ||
          normalizarPerguntaInvestigacaoV64_(candidata).indexOf('quantos pedidos voces processam') === 0
          ? { equivalente: true, indice: 0, motivo: 'mesma informação de volume diário' }
          : { equivalente: false, indice: -1, motivo: '' };
      }
    }));
    assert('7. repetição semântica é rejeitada e substituída', r7.sucesso && r7.proxima_pergunta === 'Quais consequências concretas os erros causam?');

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

  } catch (erro) {
    resultados.push({ teste: 'execução da suíte', passou: false, detalhe: erro && erro.stack ? erro.stack : String(erro) });
  }

  var aprovados = resultados.filter(function(r) { return r.passou; }).length;
  var resumo = {
    versao: 'V6.4',
    suite: 'CONVERSACIONAL_DETERMINISTICA',
    sucesso: resultados.length === 12 && aprovados === resultados.length,
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
  var respostaPorDimensao = {
    processo: 'Recebemos pedidos pelo WhatsApp, lançamos em uma planilha e depois conferimos os dados.',
    dor_causa: 'Ocorrem erros de digitação e retrabalho durante a conferência.',
    escala: 'São cerca de 100 pedidos por dia.',
    frequencia: 'Isso acontece diariamente.',
    impacto: 'A conferência consome cerca de duas horas por dia.',
    excecoes: 'Pedidos urgentes às vezes pulam a conferência.',
    objetivo: 'Queremos reduzir o retrabalho e liberar tempo da equipe.',
    restricoes: 'Precisamos manter as ferramentas atuais e proteger os dados.',
    aceitacao: 'Consideraremos sucesso reduzir o retrabalho pela metade.'
  };
  try {
    mensagens.push('Recebemos cerca de 100 pedidos por dia pelo WhatsApp, lançamos manualmente em planilha e gastamos duas horas conferindo.');
    for (var turno = 0; turno < 4; turno++) {
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
    var gate = podeConcluirDiagnosticoV64_(estado);
    var sucesso = turnosProcessados > 0 &&
      !falha &&
      semEvidencia.length === 0 &&
      semRepeticaoLiteral &&
      (gate.pode || estado.perguntaPendente !== null);

    var resumo = {
      versao: 'V6.4',
      teste: 'GEMINI_REAL_PONTA_A_PONTA',
      sucesso: sucesso,
      turnosProcessados: turnosProcessados,
      quantidadePerguntasGeradas: perguntas.length,
      dimensoesConfirmadas: fatosConfirmados,
      nenhumFatoConfirmadoSemEvidencia: semEvidencia.length === 0,
      nenhumaRepeticaoLiteral: semRepeticaoLiteral,
      gateConcluiuSomenteComCondicoesSatisfeitas: gate.pode || !/CONCLUIDO/.test(String(resultado && resultado.status_diagnostico || '')),
      conclusao: gate.pode ? 'CONCLUIDO' : 'INVESTIGACAO',
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
