/**
 * ============================================================
 * FEEDS SOLUTIONS — APRENDIZADO NO RECONHECIMENTO V6.3
 * ============================================================
 *
 * O feedback real passa a ser uma evidência secundária para o
 * ranking de resoluções.
 *
 * Regras de segurança:
 * - não altera status da resolução;
 * - não promove HIPOTESE para VALIDADA;
 * - não substitui a similaridade semântica;
 * - impacto máximo de -5 a +5 pontos;
 * - sem feedback, o comportamento anterior é preservado.
 * ============================================================
 */

function obterSinalAprendizadoResolucaoV63_(resolucaoId) {

  const id = String(resolucaoId || '').trim();

  if (!id || typeof buscarFeedbackAprendizadoV63_ !== 'function') {
    return {
      total: 0,
      positivos: 0,
      parciais: 0,
      negativos: 0,
      neutros: 0,
      modificador: 0
    };
  }

  const feedbacks = buscarFeedbackAprendizadoV63_({
    resolucao_id: id
  }) || [];

  let positivos = 0;
  let parciais = 0;
  let negativos = 0;
  let neutros = 0;

  feedbacks.forEach(function(item) {
    const resultado = String(item.resultado || '').trim().toUpperCase();

    if (resultado === 'POSITIVO') {
      positivos++;
    } else if (resultado === 'PARCIAL') {
      parciais++;
    } else if (resultado === 'NEGATIVO') {
      negativos++;
    } else {
      neutros++;
    }
  });

  const total =
    positivos +
    parciais +
    negativos;

  if (total === 0) {
    return {
      total: 0,
      positivos: positivos,
      parciais: parciais,
      negativos: negativos,
      neutros: neutros,
      modificador: 0
    };
  }

  /*
   * Suavização conservadora:
   * - positivo = +1
   * - parcial  = +0,5
   * - negativo = -1
   *
   * +2 no denominador evita que um único evento determine
   * sozinho o comportamento do ranking.
   */
  const evidenciaLiquida =
    positivos +
    (parciais * 0.5) -
    negativos;

  const modificador =
    Math.max(
      -5,
      Math.min(
        5,
        Math.round(
          (
            evidenciaLiquida /
            (total + 2)
          ) * 5
        )
      )
    );

  return {
    total: total,
    positivos: positivos,
    parciais: parciais,
    negativos: negativos,
    neutros: neutros,
    modificador: modificador
  };
}


/**
 * ============================================================
 * TESTE OFICIAL — APRENDIZADO INFLUENCIA RECONHECIMENTO V6.3
 * ============================================================
 */
function TESTAR_APRENDIZADO_RECONHECIMENTO_V63() {

  const resultados = [];
  const marcador =
    'TESTE-APRENDIZADO-RECONHECIMENTO-V63-' +
    Date.now();

  let resolucaoId = '';
  const feedbackIds = [];

  function teste(numero, descricao, condicao) {
    const passou = condicao === true;

    resultados.push({
      numero: numero,
      descricao: descricao,
      passou: passou
    });

    Logger.log(
      (passou ? '✅' : '❌') +
      ' TESTE ' +
      numero +
      '/12 — ' +
      descricao
    );
  }

  function limparFeedbacks() {
    try {
      const sheet = obterAba_(SHEETS.FEEDBACK);
      const valores = sheet.getDataRange().getValues();
      if (valores.length <= 1) return;

      const cabecalhos = valores[0];
      const idxFeedback = cabecalhos.indexOf('feedback_id');
      const idxResolucao = cabecalhos.indexOf('resolucao_id');

      for (let i = valores.length - 1; i >= 1; i--) {
        const feedbackId =
          idxFeedback >= 0 ? String(valores[i][idxFeedback] || '') : '';
        const id =
          idxResolucao >= 0 ? String(valores[i][idxResolucao] || '') : '';

        if (
          feedbackIds.indexOf(feedbackId) !== -1 ||
          id === String(resolucaoId)
        ) {
          sheet.deleteRow(i + 1);
        }
      }
    } catch (erro) {
      Logger.log(
        '⚠️ Limpeza feedback aprendizado reconhecimento: ' +
        (erro.message || erro)
      );
    }
  }

  function limparResolucao() {
    try {
      if (!resolucaoId) return;

      const sheet =
        obterAba_(SHEETS.BIBLIOTECA_RESOLUCOES);

      const valores = sheet.getDataRange().getValues();
      const cabecalhos = valores[0] || [];
      const idx = cabecalhos.indexOf('resolucao_id');

      for (let i = valores.length - 1; i >= 1; i--) {
        if (
          idx >= 0 &&
          String(valores[i][idx] || '') ===
          String(resolucaoId)
        ) {
          sheet.deleteRow(i + 1);
        }
      }
    } catch (erro) {
      Logger.log(
        '⚠️ Limpeza resolução aprendizado reconhecimento: ' +
        (erro.message || erro)
      );
    }
  }

  try {

    Logger.log('============================================================');
    Logger.log('TESTAR_APRENDIZADO_RECONHECIMENTO_V63');
    Logger.log('============================================================');

    const resolucao =
      salvarResolucaoV63_({
        resolucao_id: marcador,
        titulo_interno: marcador,
        descricao_problema:
          'Erros de digitação e retrabalho no lançamento de pedidos.',
        padrao_problema:
          'Processo manual de conferência e lançamento.',
        processo:
          'Conferir e lançar pedidos.',
        dores:
          ['erros de digitação', 'retrabalho'],
        impactos:
          ['perda de tempo'],
        resultados_desejados:
          ['reduzir erros e retrabalho'],
        contexto:
          'Processo administrativo.',
        restricoes: [],
        abordagem_interna:
          'Procedimento de conferência.',
        descricao_solucao_interna:
          'Procedimento de conferência.',
        alternativas: [],
        status: 'VALIDADA',
        confianca: 'ALTA',
        evidencias: [],
        casos_relacionados: [],
        origem: 'TESTE_APRENDIZADO_RECONHECIMENTO',
        versao: 'V6.3'
      });

    resolucaoId = resolucao.resolucao_id;

    const investigacao = {
      problema_central:
        'Erros de digitação e retrabalho no lançamento de pedidos.',
      processo:
        'Conferir e lançar pedidos.',
      pontos_de_dor:
        ['erros de digitação', 'retrabalho'],
      impactos:
        ['perda de tempo'],
      resultado_desejado:
        'reduzir erros e retrabalho',
      contexto:
        'Processo administrativo.',
      status_interpretacao: {
        processo: 'CONFIRMADO',
        resultado_desejado: 'CONFIRMADO'
      },
      lacunas: [],
      reconhecimento_habilitado: true
    };

    const antes =
      compararInvestigacaoResolucaoV63_(
        investigacao,
        buscarResolucaoV63_({ resolucao_id: resolucaoId })
      );

    teste(
      1,
      'sem feedback o modificador é zero',
      antes.aprendizado.modificador === 0
    );

    teste(
      2,
      'pontuação base permanece disponível',
      antes.pontuacao_base === antes.pontuacao
    );

    const positivo =
      registrarFeedbackAprendizadoV63_({
        diagnostico_id: marcador + '-D1',
        resolucao_id: resolucaoId,
        resultado: 'POSITIVO',
        evidencia: 'Cliente confirmou o resultado.'
      });

    feedbackIds.push(positivo.feedback_id);

    const aposPositivo =
      compararInvestigacaoResolucaoV63_(
        investigacao,
        buscarResolucaoV63_({ resolucao_id: resolucaoId })
      );

    teste(
      3,
      'feedback positivo é contabilizado',
      aposPositivo.aprendizado.positivos === 1
    );

    teste(
      4,
      'feedback positivo aumenta o sinal',
      aposPositivo.aprendizado.modificador > 0
    );

    teste(
      5,
      'pontuação base não é alterada pelo aprendizado',
      aposPositivo.pontuacao_base === antes.pontuacao_base
    );

    const negativo =
      registrarFeedbackAprendizadoV63_({
        diagnostico_id: marcador + '-D2',
        resolucao_id: resolucaoId,
        resultado: 'NEGATIVO',
        evidencia: 'Cliente informou que o problema permaneceu.'
      });

    feedbackIds.push(negativo.feedback_id);

    const aposNegativo =
      compararInvestigacaoResolucaoV63_(
        investigacao,
        buscarResolucaoV63_({ resolucao_id: resolucaoId })
      );

    teste(
      6,
      'feedback negativo é contabilizado',
      aposNegativo.aprendizado.negativos === 1
    );

    teste(
      7,
      'sinal líquido considera positivo e negativo',
      aposNegativo.aprendizado.modificador === 0
    );

    const parcial =
      registrarFeedbackAprendizadoV63_({
        diagnostico_id: marcador + '-D3',
        resolucao_id: resolucaoId,
        resultado: 'PARCIAL',
        evidencia: 'Cliente relatou melhora parcial.'
      });

    feedbackIds.push(parcial.feedback_id);

    const aposParcial =
      compararInvestigacaoResolucaoV63_(
        investigacao,
        buscarResolucaoV63_({ resolucao_id: resolucaoId })
      );

    teste(
      8,
      'feedback parcial é contabilizado',
      aposParcial.aprendizado.parciais === 1
    );

    teste(
      9,
      'sinal parcial influencia positivamente o ranking',
      aposParcial.aprendizado.modificador > 0
    );

    const persistida =
      buscarResolucaoV63_({
        resolucao_id: resolucaoId
      });

    teste(
      10,
      'aprendizado não altera status da resolução',
      persistida.status === 'VALIDADA'
    );

    teste(
      11,
      'aprendizado permanece limitado a cinco pontos',
      Math.abs(aposParcial.aprendizado.modificador) <= 5
    );

    teste(
      12,
      'estrutura de aprendizado permanece determinística',
      obterSinalAprendizadoResolucaoV63_(resolucaoId).modificador ===
      aposParcial.aprendizado.modificador
    );

  } catch (erro) {

    Logger.log(
      '❌ ERRO GERAL APRENDIZADO NO RECONHECIMENTO: ' +
      (erro && erro.message ? erro.message : erro)
    );

  } finally {

    limparFeedbacks();
    limparResolucao();

    Logger.log('============================================================');
    Logger.log('RESULTADO — TESTAR_APRENDIZADO_RECONHECIMENTO_V63');
    Logger.log('============================================================');

    const aprovados =
      resultados.filter(function(item) {
        return item.passou;
      }).length;

    const falhas =
      resultados.length - aprovados;

    const percentual =
      resultados.length
        ? Math.round(
            (aprovados / resultados.length) * 100
          )
        : 0;

    Logger.log(
      'APROVADOS: ' +
      aprovados +
      '/' +
      resultados.length
    );

    Logger.log(
      'FALHAS: ' +
      falhas
    );

    Logger.log(
      'PERCENTUAL: ' +
      percentual +
      '%'
    );

    Logger.log(
      (
        resultados.length === 12 &&
        falhas === 0
      )
        ? '🏆 TESTAR_APRENDIZADO_RECONHECIMENTO_V63: PASSOU'
        : '❌ TESTAR_APRENDIZADO_RECONHECIMENTO_V63: FALHOU'
    );

    Logger.log('============================================================');
  }

  return {
    sucesso:
      resultados.length === 12 &&
      resultados.every(function(item) {
        return item.passou;
      }),
    aprovados:
      resultados.filter(function(item) {
        return item.passou;
      }).length,
    falhas:
      resultados.filter(function(item) {
        return !item.passou;
      }).length,
    resultados: resultados
  };
}
