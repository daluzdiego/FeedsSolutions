/**
 * FEEDS SOLUTIONS — REGRESSÃO DA PROFUNDIDADE DO DIAGNÓSTICO COMERCIAL
 *
 * Testes determinísticos: não chamam Gemini, não leem nem alteram planilhas.
 * Executar TESTAR_PROFUNDIDADE_COMERCIAL_DIAGNOSTICO() no Apps Script.
 */
function TESTAR_PROFUNDIDADE_COMERCIAL_DIAGNOSTICO() {
  var resultados = [];
  function assert(nome, passou, detalhe) {
    resultados.push({ teste: nome, passou: !!passou, detalhe: detalhe || '' });
  }
  function item(remetente, mensagem, tipo, ordem) {
    return { remetente: remetente, mensagem: mensagem, tipo: tipo || '', ordem: ordem || 0 };
  }
  function historicoComPerguntas(perguntas, respostas) {
    var h = [];
    var ordem = 1;
    for (var i = 0; i < perguntas.length; i++) {
      h.push(item('SISTEMA', perguntas[i], 'PERGUNTA_IA', ordem++));
      if (respostas[i] !== undefined) h.push(item('EMPRESARIO', respostas[i], 'EMPRESARIO', ordem++));
    }
    return h;
  }

  try {
    var historicoCurto = historicoComPerguntas([
      'Quantos e-mails vocês recebem por dia ou semana?',
      'O processo costuma gerar erros, retrabalho ou atrasos?'
    ], ['5', 'sim']);
    var contextoCurto = {
      historico: historicoCurto,
      diagnostico: { volume: '5', frequencia: '', impacto: 'Erros, retrabalho ou atrasos gerados pelo processo' }
    };
    var diagnosticoBase = {
      processo_nome: 'Recebimento de e-mails com dados de clientes enviados por IA',
      processo_resumo: 'Recebimento de e-mails com dados de clientes enviados por IA',
      dor_principal: 'Tarefas repetitivas feitas por humanos que consomem o tempo dos donos',
      impacto_nivel: 'Erros, retrabalho ou atrasos gerados pelo processo',
      objetivo: 'Automatizar o recebimento dos e-mails com dados dos clientes'
    };
    var analiseCurta = {
      volume: '5',
      frequencia: '',
      impacto: 'Erros, retrabalho ou atrasos gerados pelo processo',
      objetivo: diagnosticoBase.objetivo
    };
    assert('não conclui após apenas duas respostas vagas', 
      determinarEstadoDiagnostico_(diagnosticoBase, analiseCurta, contextoCurto) !== DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE);

    var perguntaVolume = selecionarPerguntaObrigatoriaDiagnostico_(diagnosticoBase, analiseCurta, contextoCurto);
    assert('pede esclarecimento do período quando empresário responde apenas “5”',
      !!perguntaVolume && /por dia, por semana ou por mês/.test(perguntaVolume.pergunta),
      perguntaVolume && perguntaVolume.pergunta);

    var contextoVolume = {
      historico: historicoComPerguntas([
        'Quantos e-mails vocês recebem?',
        'Esse processo costuma gerar erros?'
      ], ['5 e-mails por dia', 'sim']),
      diagnostico: { volume: '5 e-mails por dia', frequencia: '', impacto: diagnosticoBase.impacto_nivel }
    };
    var perguntaFrequencia = selecionarPerguntaObrigatoriaDiagnostico_(
      diagnosticoBase,
      { volume: '5 e-mails por dia', frequencia: '', impacto: diagnosticoBase.impacto_nivel },
      contextoVolume
    );
    assert('investiga distribuição temporal quando frequência está ausente',
      !!perguntaFrequencia && /horários específicos|distribuída ao longo do dia/.test(perguntaFrequencia.pergunta));

    var perguntaDistribuicao = selecionarPerguntaObrigatoriaDiagnostico_(
      diagnosticoBase,
      { volume: '5 e-mails por dia', frequencia: 'Diária', impacto: diagnosticoBase.impacto_nivel },
      { historico: contextoVolume.historico, diagnostico: { volume: '5 e-mails por dia', frequencia: 'Diária' } }
    );
    assert('“Diária” derivada do volume não substitui a investigação de horários e picos',
      !!perguntaDistribuicao && /horários específicos|distribuída ao longo do dia/.test(perguntaDistribuicao.pergunta));

    var perguntaImpacto = selecionarPerguntaObrigatoriaDiagnostico_(
      diagnosticoBase,
      { volume: '5 e-mails por dia', frequencia: 'Diária', impacto: diagnosticoBase.impacto_nivel },
      { historico: contextoVolume.historico, diagnostico: { volume: '5 e-mails por dia', frequencia: 'Diária' } }
    );
    assert('não aceita “sim” como impacto concreto',
      !!perguntaImpacto && /consequência concreta/.test(perguntaImpacto.pergunta));

    var cincoPerguntas = historicoComPerguntas([
      'Quantos e-mails vocês recebem?',
      'Como o processo gera retrabalho?',
      'Em quais horários os e-mails chegam?',
      'Depois que um e-mail chega, quais etapas alguém executa?',
      'Onde os dados ficam registrados?'
    ], ['5 e-mails por dia', 'Precisamos refazer a conferência e perdemos 2 horas por dia', 'Ao longo do dia', 'Lemos o e-mail e copiamos os dados manualmente', 'No Gmail e depois em uma planilha']);
    assert('conta perguntas distintas respondidas, sem contar mensagens do sistema como evidência',
      contarPerguntasRespondidasDiagnostico_(cincoPerguntas) === 5,
      String(contarPerguntasRespondidasDiagnostico_(cincoPerguntas)));

    var contextoEtapas = {
      historico: historicoComPerguntas([
        'Quantos e-mails vocês recebem?',
        'Como isso prejudica o trabalho?',
        'Em quais horários chegam?',
        'Qual é a consequência concreta?',
        'Onde os dados ficam registrados?'
      ], ['5 e-mails por dia', 'Há retrabalho', 'Ao longo do dia', 'Perdemos 2 horas por dia refazendo a conferência', 'Usamos Gmail e planilha']),
      diagnostico: { volume: '5 e-mails por dia', frequencia: 'Diária' }
    };
    var perguntaEtapas = selecionarPerguntaObrigatoriaDiagnostico_(
      diagnosticoBase,
      { volume: '5 e-mails por dia', frequencia: 'Diária', impacto: 'Perdemos 2 horas por dia refazendo a conferência' },
      contextoEtapas
    );
    assert('investiga as etapas reais do processo, não presume que o resumo inicial seja suficiente',
      !!perguntaEtapas && /quais etapas alguém executa/.test(perguntaEtapas.pergunta));

    var contextoSaida = {
      historico: historicoComPerguntas([
        'Quantos e-mails vocês recebem?',
        'Como isso prejudica o trabalho?',
        'Em quais horários chegam?',
        'Depois que um e-mail chega, quais etapas alguém executa?',
        'Onde os dados ficam registrados?'
      ], ['5 e-mails por dia', 'Perdemos 2 horas por dia refazendo a conferência', 'Ao longo do dia', 'Lemos o e-mail e copiamos os dados', 'Gmail e planilha']),
      diagnostico: { volume: '5 e-mails por dia', frequencia: 'Diária' }
    };
    var perguntaSaida = selecionarPerguntaObrigatoriaDiagnostico_(
      diagnosticoBase,
      { volume: '5 e-mails por dia', frequencia: 'Diária', impacto: 'Perdemos 2 horas por dia refazendo a conferência' },
      contextoSaida
    );
    assert('não confunde o desejo genérico de automatizar com a especificação da ação automática',
      !!perguntaSaida && /o que exatamente você quer que o sistema faça sozinho/.test(perguntaSaida.pergunta));

    var gateCompletoMasCurto = determinarEstadoDiagnostico_(
      Object.assign({}, diagnosticoBase, { impacto_nivel: 'Perdemos 2 horas por dia refazendo a conferência' }),
      { volume: '5 e-mails por dia', frequencia: 'Diária', impacto: 'Perdemos 2 horas por dia refazendo a conferência', objetivo: diagnosticoBase.objetivo },
      { historico: historicoComPerguntas([
        'Quantos e-mails vocês recebem?',
        'Como isso prejudica o trabalho?',
        'Em quais horários chegam?',
        'Depois que um e-mail chega, quais etapas alguém executa?'
      ], ['5 e-mails por dia', 'Perdemos 2 horas por dia refazendo a conferência', 'Ao longo do dia', 'Lemos o e-mail e copiamos os dados']), diagnostico: { volume: '5 e-mails por dia', frequencia: 'Diária' } }
    );
    assert('não conclui com menos de cinco perguntas distintas respondidas, mesmo com campos centrais preenchidos',
      gateCompletoMasCurto !== DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE);

    var esclarecimentoPeriodo = ajustarContinuidadeDiagnosticoLegado_(
      { volume: '5', frequencia: '', informacao_faltante: 'período', proxima_pergunta: 'Você informou 5. Esse número corresponde a quantos e-mails por dia, por semana ou por mês?' },
      'Você informou 5. Esse número corresponde a quantos e-mails por dia, por semana ou por mês?',
      'por dia'
    );
    assert('anexa “por dia” ao volume já informado sem perguntar a quantidade novamente',
      /5.*por dia/.test(String(esclarecimentoPeriodo.volume || '')) &&
      /diaria/i.test(String(esclarecimentoPeriodo.frequencia || '')) &&
      !String(esclarecimentoPeriodo.proxima_pergunta || '').trim(),
      JSON.stringify(esclarecimentoPeriodo));

  } catch (e) {
    resultados.push({ teste: 'execução da suíte', passou: false, detalhe: e && e.stack ? e.stack : String(e) });
  }

  var aprovados = resultados.filter(function(r) { return r.passou; }).length;
  var resumo = {
    versao: 'V6.4',
    suite: 'PROFUNDIDADE_COMERCIAL_DETERMINISTICA',
    sucesso: resultados.length === 10 && aprovados === resultados.length,
    total: resultados.length,
    aprovados: aprovados,
    falhas: resultados.length - aprovados,
    resultados: resultados
  };
  Logger.log('FEEDS SOLUTIONS — TESTES DE PROFUNDIDADE COMERCIAL: ' + JSON.stringify(resumo));
  return resumo;
}
