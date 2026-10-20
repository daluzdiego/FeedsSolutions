/**
 * FEEDS SOLUTIONS V6.4 — SUÍTE MESTRA INTEGRADA 40 EMPRESAS + GEMINI REAL
 *
 * Executar somente: TESTAR_SUITE_MESTRA_40_EMPRESAS_GEMINI_V64()
 *
 * Integra:
 * 1) 40 empresas / 40 problemas específicos / 480 verificações determinísticas;
 * 2) estado, integridade, evidência, certeza, conflito, serialização e compatibilidade;
 * 3) conversação, integração, adaptador, testes adversariais e diagnóstico cirúrgico;
 * 4) uma conversa ponta a ponta com Gemini real usando dados sintéticos;
 * 5) rastreabilidade por suíte, resultado bruto resumido e falhas detalhadas.
 *
 * Limite deliberado: o Gemini real é executado uma vez nesta suíte mestra, não 40 vezes.
 * As 40 empresas passam pelo núcleo determinístico; o teste Gemini real exercita o
 * caminho real do modelo sem disparar centenas de chamadas, estourar quota ou mascarar
 * rate limits. Não alegar que cada uma das 40 empresas teve conversa real com Gemini.
 *
 * Segurança: não reseta baseline V6.3, não acessa nem escreve planilhas de produção,
 * não altera registros de produção e exige motor V6.4 desativado ao final.
 * Nunca chamar TESTAR_ACEITACAO_FINAL_V63_RESETAR().
 */
function TESTAR_SUITE_MESTRA_40_EMPRESAS_GEMINI_V64() {
  var inicio = new Date().getTime();
  var suites = [];
  var ordem = [
    { nome: 'STRESS_40_EMPRESAS_480_ASSERTIVAS', fn: 'TESTAR_STRESS_40_EMPRESAS_V64' },
    { nome: 'ESTADO_E_INTEGRIDADE', fn: 'TESTAR_ESTADO_INVESTIGACAO_V64' },
    { nome: 'CONVERSACAO_DETERMINISTICA', fn: 'TESTAR_CONVERSACIONAL_V64' },
    { nome: 'ADAPTADOR', fn: 'TESTAR_ADAPTADOR_INVESTIGACAO_V64' },
    { nome: 'INTEGRACAO', fn: 'TESTAR_INTEGRACAO_V64' },
    { nome: 'ADVERSARIAL', fn: 'TESTAR_ADVERSARIAL_INVESTIGACAO_V64' },
    { nome: 'DIAGNOSTICO_CIRURGICO', fn: 'TESTAR_DIAGNOSTICO_CIRURGICO_PERGUNTAS_V64' },
    { nome: 'GEMINI_REAL_PONTA_A_PONTA', fn: 'TESTAR_GEMINI_REAL_INVESTIGACAO_V64' }
  ];

  Logger.log('========== FEEDS SOLUTIONS V6.4 — SUÍTE MESTRA — INÍCIO ==========');
  Logger.log('[MESTRA][AMBIENTE] ' + JSON.stringify({
    suite: 'SUITE_MESTRA_40_EMPRESAS_GEMINI',
    versao: 'V6.4',
    empresasSinteticas: 40,
    verificacoesStressEsperadas: 480,
    suitesPlanejadas: ordem.length,
    chamadasGeminiEsperadas: 'fluxo real único, chamadas internas variáveis',
    planilhasProducao: 'SEM_LEITURA_NEM_ESCRITA',
    mutacaoProducao: false,
    resetBaselineV63: false,
    ativacaoProduccaoPermitida: false
  }));

  function executarSuite(def) {
    var t0 = new Date().getTime();
    var registro = {
      suite: def.nome,
      funcao: def.fn,
      executada: false,
      sucesso: false,
      duracaoMs: 0,
      total: null,
      aprovados: null,
      falhas: null,
      detalhes: null,
      erro: ''
    };
    try {
      var fn = (typeof globalThis !== 'undefined' && globalThis[def.fn]) || null;
      // Apps Script V8 pode não expor declarações globais por globalThis em todos os
      // contextos; o mapa explícito abaixo é a fonte de resolução principal.
      var funcoes = {
        TESTAR_STRESS_40_EMPRESAS_V64: typeof TESTAR_STRESS_40_EMPRESAS_V64 === 'function' ? TESTAR_STRESS_40_EMPRESAS_V64 : null,
        TESTAR_ESTADO_INVESTIGACAO_V64: typeof TESTAR_ESTADO_INVESTIGACAO_V64 === 'function' ? TESTAR_ESTADO_INVESTIGACAO_V64 : null,
        TESTAR_CONVERSACIONAL_V64: typeof TESTAR_CONVERSACIONAL_V64 === 'function' ? TESTAR_CONVERSACIONAL_V64 : null,
        TESTAR_ADAPTADOR_INVESTIGACAO_V64: typeof TESTAR_ADAPTADOR_INVESTIGACAO_V64 === 'function' ? TESTAR_ADAPTADOR_INVESTIGACAO_V64 : null,
        TESTAR_INTEGRACAO_V64: typeof TESTAR_INTEGRACAO_V64 === 'function' ? TESTAR_INTEGRACAO_V64 : null,
        TESTAR_ADVERSARIAL_INVESTIGACAO_V64: typeof TESTAR_ADVERSARIAL_INVESTIGACAO_V64 === 'function' ? TESTAR_ADVERSARIAL_INVESTIGACAO_V64 : null,
        TESTAR_DIAGNOSTICO_CIRURGICO_PERGUNTAS_V64: typeof TESTAR_DIAGNOSTICO_CIRURGICO_PERGUNTAS_V64 === 'function' ? TESTAR_DIAGNOSTICO_CIRURGICO_PERGUNTAS_V64 : null,
        TESTAR_GEMINI_REAL_INVESTIGACAO_V64: typeof TESTAR_GEMINI_REAL_INVESTIGACAO_V64 === 'function' ? TESTAR_GEMINI_REAL_INVESTIGACAO_V64 : null
      };
      fn = funcoes[def.fn];
      if (typeof fn !== 'function') throw new Error('FUNCAO_NAO_ENCONTRADA: ' + def.fn + '; confira se os arquivos .gs foram sincronizados.');
      var r = fn();
      registro.executada = true;
      registro.sucesso = !!(r && r.sucesso === true);
      registro.total = r && (r.totalTestes !== undefined ? r.totalTestes : r.total !== undefined ? r.total : null);
      registro.aprovados = r && (r.aprovados !== undefined ? r.aprovados : null);
      registro.falhas = r && (r.falhas !== undefined ? r.falhas : null);
      registro.detalhes = r ? {
        empresasPlanejadas: r.empresasPlanejadas,
        empresasExecutadas: r.empresasExecutadas,
        turnosProcessados: r.turnosProcessados,
        quantidadePerguntasGeradas: r.quantidadePerguntasGeradas,
        suitesAprovadas: r.suitesAprovadas,
        suitesFalhas: r.suitesFalhas,
        dimensoesCriticasNaoConfirmadas: r.dimensoesCriticasNaoConfirmadas,
        falhasDetalhadas: r.falhasDetalhadas
      } : null;
      if (!registro.sucesso) registro.erro = 'SUITE_RETORNOU_SUCESSO_FALSE';
    } catch (e) {
      registro.executada = true;
      registro.sucesso = false;
      registro.erro = String(e && e.message || e).slice(0, 500);
      registro.stack = e && e.stack ? String(e.stack).slice(0, 1200) : '';
    }
    registro.duracaoMs = new Date().getTime() - t0;
    suites.push(registro);
    Logger.log('[MESTRA][SUITE][' + (registro.sucesso ? 'PASSOU' : 'FALHOU') + '] ' + JSON.stringify(registro));
  }

  ordem.forEach(executarSuite);

  var falhas = suites.filter(function(s) { return !s.sucesso; });
  var ativacaoDesligada = false;
  try {
    ativacaoDesligada = typeof motorInvestigacaoV64Ativo_ === 'function' && motorInvestigacaoV64Ativo_() === false;
  } catch (e) {
    ativacaoDesligada = false;
  }
  var stress = suites.filter(function(s) { return s.suite === 'STRESS_40_EMPRESAS_480_ASSERTIVAS'; })[0];
  var gemini = suites.filter(function(s) { return s.suite === 'GEMINI_REAL_PONTA_A_PONTA'; })[0];
  var resumo = {
    versao: 'V6.4',
    suite: 'SUITE_MESTRA_40_EMPRESAS_GEMINI',
    sucesso: suites.length === ordem.length &&
      falhas.length === 0 &&
      !!(stress && stress.sucesso && stress.total === 480) &&
      !!(gemini && gemini.sucesso) &&
      ativacaoDesligada,
    suitesPlanejadas: ordem.length,
    suitesExecutadas: suites.length,
    suitesAprovadas: suites.filter(function(s) { return s.sucesso; }).length,
    suitesFalhas: falhas.length,
    empresasSinteticas: 40,
    verificacoesStressEsperadas: 480,
    stress480Aprovado: !!(stress && stress.sucesso && stress.total === 480),
    geminiRealAprovado: !!(gemini && gemini.sucesso),
    ativacaoMantidaDesligada: ativacaoDesligada,
    planilhasProducaoAlteradas: false,
    baselineV63Resetada: false,
    duracaoTotalMs: new Date().getTime() - inicio,
    falhasDetalhadas: falhas,
    resultadosPorSuite: suites
  };
  Logger.log('========== FEEDS SOLUTIONS V6.4 — SUÍTE MESTRA — RESUMO FINAL ==========');
  Logger.log('[MESTRA][RESUMO_FINAL] ' + JSON.stringify(resumo));
  return resumo;
}
