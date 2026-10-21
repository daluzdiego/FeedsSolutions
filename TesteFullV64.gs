/**
 * FEEDS SOLUTIONS V6.4 — RUNNER ÚNICO DE VALIDAÇÃO
 *
 * Executar somente: TESTAR_FULL_V64()
 *
 * Ordem:
 * 1) Estado explícito
 * 2) Conversacional determinístico
 * 3) Adaptador de legado
 * 4) Integração determinística
 * 5) Adversarial determinístico
 * 6) Diagnóstico cirúrgico de perguntas
 * 7) Gemini real ponta a ponta (último, pois consome cota)
 *
 * Não limpa dados, não escreve planilhas e não altera a ativação.
 * O teste real do Gemini usa mensagens sintéticas, mas consome cota da API.
 * Ausência de função/arquivo gera falha explícita e não interrompe as demais suítes.
 * Não substitui revisão de produção nem mede cobertura linha a linha.
 */
function TESTAR_FULL_V64() {
  var inicio = new Date().getTime();
  var resultados = [];

  var suites = [
    { nome: 'ESTADO_EXPLICITO', funcao: 'TESTAR_ESTADO_INVESTIGACAO_V64', tipo: 'deterministico' },
    { nome: 'CONVERSACIONAL_DETERMINISTICA', funcao: 'TESTAR_CONVERSACIONAL_V64', tipo: 'deterministico' },
    { nome: 'ADAPTADOR_LEGADO', funcao: 'TESTAR_ADAPTADOR_INVESTIGACAO_V64', tipo: 'deterministico' },
    { nome: 'INTEGRACAO_DETERMINISTICA', funcao: 'TESTAR_INTEGRACAO_V64', tipo: 'deterministico' },
    { nome: 'ADVERSARIAL_DETERMINISTICA', funcao: 'TESTAR_ADVERSARIAL_INVESTIGACAO_V64', tipo: 'deterministico' },
    { nome: 'DIAGNOSTICO_CIRURGICO', funcao: 'TESTAR_DIAGNOSTICO_CIRURGICO_PERGUNTAS_V64', tipo: 'deterministico' },
    { nome: 'GEMINI_REAL_PONTA_A_PONTA', funcao: 'TESTAR_GEMINI_REAL_INVESTIGACAO_V64', tipo: 'gemini' }
  ];

  function resumoResultado(r) {
    if (!r || typeof r !== 'object') {
      return { sucesso: false, erro: 'RETORNO_VAZIO_OU_NAO_OBJETO' };
    }
    var sucesso = r.sucesso === true;
    if (r.falhas !== undefined && Number(r.falhas) > 0) sucesso = false;
    if (r.total !== undefined && r.aprovados !== undefined &&
        Number(r.total) !== Number(r.aprovados)) sucesso = false;
    return {
      sucesso: sucesso,
      total: r.total !== undefined ? r.total : null,
      aprovados: r.aprovados !== undefined ? r.aprovados : null,
      falhas: r.falhas !== undefined ? r.falhas : null,
      turnosProcessados: r.turnosProcessados !== undefined ? r.turnosProcessados : null,
      quantidadePerguntasGeradas: r.quantidadePerguntasGeradas !== undefined ? r.quantidadePerguntasGeradas : null,
      conclusao: r.conclusao || null,
      falha: String(r.falha || r.erro || '').slice(0, 220),
      resultadoOriginal: r
    };
  }

  Logger.log('========== FEEDS SOLUTIONS V6.4 — FULL TEST — INÍCIO ==========');
  Logger.log('[FULL][AMBIENTE] ' + JSON.stringify({
    versao: 'V6.4',
    runner: 'TESTAR_FULL_V64',
    suitesPlanejadas: suites.length,
    chamadasGemini: 'somente na última suíte',
    escritaPlanilhas: false,
    resetDados: false,
    alteracaoAtivacao: false
  }));

  suites.forEach(function(suite, indice) {
    var linhaInicio = new Date().getTime();
    Logger.log('[FULL][SUITE ' + (indice + 1) + '/' + suites.length + '][INICIO] ' +
      JSON.stringify({ nome: suite.nome, funcao: suite.funcao, tipo: suite.tipo }));

    // Economia de tempo/cota: o E2E real só roda se todas as suítes determinísticas anteriores passaram.
    if (suite.tipo === 'gemini' && resultados.some(function(r) {
      return r.tipo === 'deterministico' && r.sucesso !== true;
    })) {
      var pulada = {
        suite: suite.nome,
        funcao: suite.funcao,
        tipo: suite.tipo,
        sucesso: false,
        ignorada: true,
        erro: 'GEMINI_NAO_EXECUTADO: corrigir/sincronizar as suítes determinísticas antes de consumir cota.'
      };
      resultados.push(pulada);
      Logger.log('[FULL][SUITE ' + (indice + 1) + '][IGNORADA] ' + JSON.stringify(pulada));
      return;
    }

    var fn = null;
    try {
      switch (suite.funcao) {
        case 'TESTAR_ESTADO_INVESTIGACAO_V64':
          fn = typeof TESTAR_ESTADO_INVESTIGACAO_V64 === 'function' ? TESTAR_ESTADO_INVESTIGACAO_V64 : null; break;
        case 'TESTAR_CONVERSACIONAL_V64':
          fn = typeof TESTAR_CONVERSACIONAL_V64 === 'function' ? TESTAR_CONVERSACIONAL_V64 : null; break;
        case 'TESTAR_ADAPTADOR_INVESTIGACAO_V64':
          fn = typeof TESTAR_ADAPTADOR_INVESTIGACAO_V64 === 'function' ? TESTAR_ADAPTADOR_INVESTIGACAO_V64 : null; break;
        case 'TESTAR_INTEGRACAO_V64':
          fn = typeof TESTAR_INTEGRACAO_V64 === 'function' ? TESTAR_INTEGRACAO_V64 : null; break;
        case 'TESTAR_ADVERSARIAL_INVESTIGACAO_V64':
          fn = typeof TESTAR_ADVERSARIAL_INVESTIGACAO_V64 === 'function' ? TESTAR_ADVERSARIAL_INVESTIGACAO_V64 : null; break;
        case 'TESTAR_DIAGNOSTICO_CIRURGICO_PERGUNTAS_V64':
          fn = typeof TESTAR_DIAGNOSTICO_CIRURGICO_PERGUNTAS_V64 === 'function' ? TESTAR_DIAGNOSTICO_CIRURGICO_PERGUNTAS_V64 : null; break;
        case 'TESTAR_GEMINI_REAL_INVESTIGACAO_V64':
          fn = typeof TESTAR_GEMINI_REAL_INVESTIGACAO_V64 === 'function' ? TESTAR_GEMINI_REAL_INVESTIGACAO_V64 : null; break;
      }

      if (!fn) {
        var ausente = {
          suite: suite.nome,
          funcao: suite.funcao,
          tipo: suite.tipo,
          sucesso: false,
          erro: 'FUNCAO_AUSENTE_NO_PROJETO_APPS_SCRIPT: sincronize o arquivo que declara esta função do GitHub.'
        };
        resultados.push(ausente);
        Logger.log('[FULL][SUITE ' + (indice + 1) + '][AUSENTE] ' + JSON.stringify(ausente));
        return;
      }

      var bruto = fn();
      var normalizado = resumoResultado(bruto);
      var item = {
        suite: suite.nome,
        funcao: suite.funcao,
        tipo: suite.tipo,
        duracaoMs: new Date().getTime() - linhaInicio,
        sucesso: normalizado.sucesso,
        total: normalizado.total,
        aprovados: normalizado.aprovados,
        falhas: normalizado.falhas,
        turnosProcessados: normalizado.turnosProcessados,
        quantidadePerguntasGeradas: normalizado.quantidadePerguntasGeradas,
        conclusao: normalizado.conclusao,
        erro: normalizado.falha
      };
      resultados.push(item);
      Logger.log('[FULL][SUITE ' + (indice + 1) + '][RESULTADO] ' + JSON.stringify(item));
    } catch (e) {
      var falha = {
        suite: suite.nome,
        funcao: suite.funcao,
        tipo: suite.tipo,
        sucesso: false,
        duracaoMs: new Date().getTime() - linhaInicio,
        erro: String(e && e.stack || e).slice(0, 900)
      };
      resultados.push(falha);
      Logger.log('[FULL][SUITE ' + (indice + 1) + '][EXCECAO] ' + JSON.stringify(falha));
    }
  });

  var ativacaoDesligada = null;
  try {
    ativacaoDesligada = typeof motorInvestigacaoV64Ativo_ === 'function'
      ? motorInvestigacaoV64Ativo_() === false
      : null;
  } catch (eAtivacao) {
    ativacaoDesligada = false;
  }

  var falhas = resultados.filter(function(r) { return r.sucesso !== true; });
  var resumo = {
    versao: 'V6.4',
    suite: 'FULL_VALIDATION',
    sucesso: resultados.length === suites.length && falhas.length === 0 && ativacaoDesligada === true,
    totalSuites: suites.length,
    suitesExecutadas: resultados.length,
    suitesAprovadas: resultados.filter(function(r) { return r.sucesso === true; }).length,
    suitesFalhas: falhas.length,
    ativacaoMantidaDesligada: ativacaoDesligada === true,
    verificacaoAtivacaoDisponivel: ativacaoDesligada !== null,
    duracaoTotalMs: new Date().getTime() - inicio,
    falhasDetalhadas: falhas,
    resultados: resultados
  };
  Logger.log('========== FEEDS SOLUTIONS V6.4 — FULL TEST — RESUMO ==========');
  Logger.log('[FULL][RESUMO_FINAL] ' + JSON.stringify(resumo));
  return resumo;
}


/**
 * FEEDS SOLUTIONS V6.4 — PRÉ-VOO SEGURO PARA HOMOLOGAÇÃO
 *
 * Não chama Gemini, não grava planilhas, não altera a chave de ativação.
 * Confirma que as dependências do caminho V6.4 estão carregadas no Apps Script.
 * NÃO equivale ao E2E real do controlador.
 */
function TESTAR_PRE_VOO_ATIVACAO_V64() {
  var verificacoes = [];
  function verificar(nome, ok, detalhe) {
    verificacoes.push({ teste: nome, passou: !!ok, detalhe: detalhe || '' });
  }

  var funcoesObrigatorias = [
    'processarMensagemDiagnostico',
    'motorInvestigacaoV64Ativo_',
    'processarTurnoPersistidoV64_',
    'obterOuCriarEstadoInvestigacaoV64_',
    'processarTurnoInvestigacaoV64_',
    'mapearResultadoMotorV64ParaAnaliseLegada_',
    'persistirEstadoInvestigacaoV64_',
    'serializarRetornoClienteDiagnosticoV63_'
  ];

  funcoesObrigatorias.forEach(function(nome) {
    var existe = false;
    try {
      existe = typeof globalThis[nome] === 'function';
    } catch (e) {
      existe = false;
    }
    verificar('dependência carregada: ' + nome, existe, existe ? 'FUNÇÃO DISPONÍVEL' : 'FUNÇÃO AUSENTE NO PROJETO CARREGADO');
  });

  var ativacao = null;
  try {
    ativacao = typeof motorInvestigacaoV64Ativo_ === 'function'
      ? motorInvestigacaoV64Ativo_()
      : null;
  } catch (e) {
    ativacao = null;
  }
  verificar('chave de ativação permanece desligada', ativacao === false,
    ativacao === false ? 'SEGURO: V6.4 ainda não atende tráfego real' : 'ESTADO INESPERADO: ' + String(ativacao));

  var aprovados = verificacoes.filter(function(v) { return v.passou; }).length;
  var resumo = {
    versao: 'V6.4',
    suite: 'PRE_VOO_ATIVACAO',
    sucesso: aprovados === verificacoes.length,
    total: verificacoes.length,
    aprovados: aprovados,
    falhas: verificacoes.length - aprovados,
    prontoParaE2E: aprovados === verificacoes.length && ativacao === false,
    prontoParaProducao: false,
    motivoBloqueioProducao: 'O pré-voo verifica carregamento de funções, não valida uma transação real da interface, Gemini, persistência e retorno.',
    chamadasGemini: 0,
    escritaPlanilhas: false,
    alteracaoAtivacao: false,
    resultados: verificacoes
  };
  Logger.log('FEEDS SOLUTIONS V6.4 — PRÉ-VOO DE ATIVAÇÃO: ' + JSON.stringify(resumo));
  return resumo;
}
