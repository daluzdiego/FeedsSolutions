/**
 * ============================================================
 * FEEDS SOLUTIONS — FECHAMENTO OFICIAL DO APRENDIZADO V6.3
 * ============================================================
 *
 * Porta oficial para encerrar o ciclo após o resultado real
 * de uma solução.
 *
 * FLUXO:
 *
 * RESULTADO REAL
 *      ↓
 * FECHAMENTO V6.3
 *      ↓
 * FEEDBACK
 *      ↓
 * EVIDÊNCIA + CASO
 *
 * Regras:
 * - resultado deve ser POSITIVO, PARCIAL ou NEGATIVO;
 * - diagnóstico é obrigatório;
 * - resolução pode ser inferida somente quando existe uma
 *   única solução validada reconhecida pelo fluxo;
 * - em múltiplas soluções, a resolução deve ser explicitada;
 * - uma resolução explicitamente informada precisa pertencer
 *   às soluções reconhecidas pelo fluxo;
 * - repetição do mesmo feedback_id é idempotente;
 * - nenhum resultado altera automaticamente o status da solução.
 * ============================================================
 */

function fecharCicloAprendizadoV63_(dados) {

  dados = dados || {};

  const resultadoFluxo =
    dados.resultado_fluxo ||
    dados.resultadoFluxo ||
    null;

  if (!resultadoFluxo || typeof resultadoFluxo !== 'object') {
    throw new Error(
      'resultado_fluxo é obrigatório para fechar o ciclo V6.3.'
    );
  }

  const diagnosticoId =
    String(
      resultadoFluxo.diagnostico_id ||
      (
        resultadoFluxo.diagnostico &&
        resultadoFluxo.diagnostico.diagnostico_id
      ) ||
      dados.diagnostico_id ||
      ''
    ).trim();

  if (!diagnosticoId) {
    throw new Error(
      'diagnostico_id é obrigatório para fechar o ciclo V6.3.'
    );
  }

  const resultado =
    normalizarResultadoFeedbackV63_(
      dados.resultado
    );

  if (
    resultado !== APRENDIZADO_V63.RESULTADOS.POSITIVO &&
    resultado !== APRENDIZADO_V63.RESULTADOS.PARCIAL &&
    resultado !== APRENDIZADO_V63.RESULTADOS.NEGATIVO
  ) {
    throw new Error(
      'Resultado real inválido para fechamento V6.3. ' +
      'Use POSITIVO, PARCIAL ou NEGATIVO.'
    );
  }

  const integracao =
    resultadoFluxo.integracao_v63 || null;

  const resultadoV63 =
    integracao &&
    integracao.resultado_v63
      ? integracao.resultado_v63
      : null;

  const resultadosReconhecimento =
    resultadoV63 &&
    Array.isArray(resultadoV63.resultados_reconhecimento)
      ? resultadoV63.resultados_reconhecimento
      : [];

  const idsReconhecidos =
    resultadosReconhecimento
      .filter(function(item) {
        return item && item.resolucao_id;
      })
      .map(function(item) {
        return String(item.resolucao_id).trim();
      });

  let resolucaoId =
    String(
      dados.resolucao_id || ''
    ).trim();

  /*
   * ----------------------------------------------------------
   * REGRA DE VÍNCULO
   * ----------------------------------------------------------
   * Se o chamador informou resolução, ela precisa estar entre
   * as soluções reconhecidas pelo fluxo quando o fluxo possui
   * resultados de reconhecimento.
   *
   * Isso impede vincular feedback a uma solução arbitrária.
   * ----------------------------------------------------------
   */

  if (
    resolucaoId &&
    idsReconhecidos.length > 0 &&
    idsReconhecidos.indexOf(resolucaoId) === -1
  ) {
    throw new Error(
      'A resolução informada não pertence às soluções ' +
      'reconhecidas pelo fluxo V6.3.'
    );
  }

  /*
   * ----------------------------------------------------------
   * INFERÊNCIA SEGURA
   * ----------------------------------------------------------
   * Só inferimos automaticamente quando existe exatamente
   * uma solução validada reconhecida.
   * ----------------------------------------------------------
   */

  if (!resolucaoId) {

    const decisao =
      resultadoV63 &&
      resultadoV63.decisao
        ? resultadoV63.decisao
        : null;

    if (
      decisao &&
      decisao.estado === 'SOLUCAO_VALIDADA' &&
      idsReconhecidos.length === 1
    ) {
      resolucaoId =
        idsReconhecidos[0];
    }

    if (idsReconhecidos.length > 1) {
      throw new Error(
        'Múltiplas soluções reconhecidas. ' +
        'Informe explicitamente a resolucao_id selecionada.'
      );
    }
  }

  /*
   * ----------------------------------------------------------
   * ID DE IDEMPOTÊNCIA
   * ----------------------------------------------------------
   * O feedback_id pode ser fornecido pelo sistema externo.
   * Se não vier, criamos um ID único.
   *
   * Uma nova tentativa usando o mesmo feedback_id não cria
   * uma segunda linha de feedback.
   * ----------------------------------------------------------
   */

  const feedbackId =
    String(
      dados.feedback_id ||
      dados.evento_id ||
      gerarId_('FEEDBACK-V63')
    ).trim();

  const lock =
    LockService.getScriptLock();

  lock.waitLock(30000);

  try {

    const existente =
      buscarFeedbackAprendizadoV63_({
        feedback_id: feedbackId
      });

    if (existente.length > 0) {

      const anterior =
        existente[0];

      return {
        sucesso: true,
        versao: APRENDIZADO_V63.VERSAO,
        repetido: true,
        feedback_id: feedbackId,
        diagnostico_id:
          String(
            anterior.diagnostico_id || ''
          ),
        resolucao_id:
          String(
            anterior.resolucao_id || ''
          ),
        resultado:
          normalizarResultadoFeedbackV63_(
            anterior.resultado
          ),
        acao_aprendizado:
          anterior.acao_aprendizado || '',
        aprendizado: null
      };
    }

    const feedback =
      registrarFeedbackFluxoPrincipalV63_(
        resultadoFluxo,
        {
          feedback_id: feedbackId,
          diagnostico_id: diagnosticoId,
          resolucao_id: resolucaoId,
          resultado: resultado,
          resposta:
            dados.resposta ||
            resultado,
          comentario:
            dados.comentario || '',
          evidencia:
            dados.evidencia || '',
          timestamp:
            dados.timestamp || new Date()
        }
      );

    return {
      sucesso: true,
      versao: APRENDIZADO_V63.VERSAO,
      repetido: false,
      feedback_id:
        feedback.feedback_id,
      diagnostico_id:
        feedback.diagnostico_id,
      resolucao_id:
        feedback.resolucao_id,
      resultado:
        feedback.resultado,
      acao_aprendizado:
        feedback.acao_aprendizado,
      aprendizado:
        feedback.aprendizado || null
    };

  } finally {

    SpreadsheetApp.flush();
    lock.releaseLock();

  }
}


/**
 * ============================================================
 * TESTE OFICIAL — FECHAMENTO DO CICLO V6.3
 * ============================================================
 */
function TESTAR_FECHAMENTO_CICLO_APRENDIZADO_V63() {

  const total = 18;
  let aprovados = 0;
  const falhas = [];
  const feedbackIds = [];
  let resolucaoId = '';

  function teste(numero, descricao, condicao) {

    if (condicao === true) {
      aprovados++;
      Logger.log(
        '✅ TESTE ' +
        numero +
        '/' +
        total +
        ' — ' +
        descricao
      );
    } else {
      falhas.push(
        numero +
        ' — ' +
        descricao
      );

      Logger.log(
        '❌ TESTE ' +
        numero +
        '/' +
        total +
        ' — ' +
        descricao
      );
    }
  }

  try {

    Logger.log(
      '============================================================'
    );

    Logger.log(
      'TESTAR_FECHAMENTO_CICLO_APRENDIZADO_V63'
    );

    Logger.log(
      '============================================================'
    );

    const diagnosticoId =
      'DIAG-FECHAMENTO-V63-' +
      Date.now();

    resolucaoId =
      'RES-FECHAMENTO-V63-' +
      Date.now();

    const criada =
      salvarResolucaoV63_({
        resolucao_id:
          resolucaoId,

        titulo_interno:
          'Resolução teste fechamento V6.3',

        descricao_problema:
          'Retrabalho em processo administrativo.',

        padrao_problema:
          'Processo manual repetitivo.',

        processo:
          'Conferência e lançamento manual.',

        dores: [
          'erros',
          'retrabalho'
        ],

        impactos: [
          'perda de tempo'
        ],

        resultados_desejados: [
          'reduzir erros'
        ],

        contexto:
          'Processo administrativo.',

        restricoes: [],

        abordagem_interna:
          'Padronização.',

        descricao_solucao_interna:
          'Procedimento padronizado.',

        alternativas: [],

        status:
          'VALIDADA',

        confianca:
          'ALTA',

        evidencias: [],

        casos_relacionados: [],

        origem:
          'TESTE_FECHAMENTO_CICLO_V63',

        versao:
          'V6.3'
      });

    teste(
      1,
      'resolução temporária criada',
      !!(
        criada &&
        criada.resolucao_id === resolucaoId
      )
    );

    const fluxo =
      {
        sucesso: true,

        diagnostico_id:
          diagnosticoId,

        diagnostico: {
          diagnostico_id:
            diagnosticoId
        },

        integracao_v63: {

          ativada: true,

          resultado_v63: {

            decisao: {
              estado:
                'SOLUCAO_VALIDADA'
            },

            resultados_reconhecimento: [
              {
                resolucao_id:
                  resolucaoId
              }
            ]

          }

        }

      };

    const feedbackId =
      'EVENTO-FECHAMENTO-V63-' +
      Date.now();

    const positivo =
      fecharCicloAprendizadoV63_({

        resultado_fluxo:
          fluxo,

        feedback_id:
          feedbackId,

        resultado:
          'POSITIVO',

        resposta:
          'SIM',

        comentario:
          'Cliente confirmou que a solução funcionou.',

        evidencia:
          'Redução comprovada de erros e retrabalho.'
      });

    feedbackIds.push(
      positivo.feedback_id
    );

    teste(
      2,
      'fechamento oficial executou',
      positivo.sucesso === true
    );

    teste(
      3,
      'versão V6.3 preservada',
      positivo.versao === 'V6.3'
    );

    teste(
      4,
      'diagnostico_id foi preservado',
      positivo.diagnostico_id ===
        diagnosticoId
    );

    teste(
      5,
      'resolução única foi inferida com segurança',
      positivo.resolucao_id ===
        resolucaoId
    );

    teste(
      6,
      'resultado POSITIVO foi registrado',
      positivo.resultado ===
        'POSITIVO'
    );

    teste(
      7,
      'feedback persistiu na base',
      buscarFeedbackAprendizadoV63_({
        feedback_id:
          feedbackId
      }).length === 1
    );

    const apos =
      buscarResolucaoV63_({
        resolucao_id:
          resolucaoId
      });

    teste(
      8,
      'evidência foi acumulada',
      !!(
        apos &&
        Array.isArray(apos.evidencias) &&
        apos.evidencias.some(
          function(item) {
            return String(item).indexOf(
              'Redução comprovada'
            ) !== -1;
          }
        )
      )
    );

    teste(
      9,
      'caso relacionado foi acumulado',
      !!(
        apos &&
        Array.isArray(apos.casos_relacionados) &&
        apos.casos_relacionados.some(
          function(item) {
            return String(item).indexOf(
              diagnosticoId
            ) !== -1;
          }
        )
      )
    );

    teste(
      10,
      'feedback não alterou automaticamente o status',
      !!(
        apos &&
        apos.status === 'VALIDADA'
      )
    );

    const repetido =
      fecharCicloAprendizadoV63_({

        resultado_fluxo:
          fluxo,

        feedback_id:
          feedbackId,

        resultado:
          'POSITIVO',

        evidencia:
          'Tentativa repetida.'
      });

    teste(
      11,
      'mesmo evento é idempotente',
      repetido.repetido === true
    );

    teste(
      12,
      'idempotência não duplica feedback',
      buscarFeedbackAprendizadoV63_({
        feedback_id:
          feedbackId
      }).length === 1
    );

    const fluxoAmbiguo =
      JSON.parse(
        JSON.stringify(fluxo)
      );

    fluxoAmbiguo.integracao_v63.resultado_v63.decisao.estado =
      'SOLUCOES_ENCONTRADAS';

    fluxoAmbiguo.integracao_v63.resultado_v63.resultados_reconhecimento =
      [
        {
          resolucao_id:
            resolucaoId
        },
        {
          resolucao_id:
            'RES-FECHAMENTO-OUTRA'
        }
      ];

    let erroSemSelecao =
      false;

    try {

      fecharCicloAprendizadoV63_({

        resultado_fluxo:
          fluxoAmbiguo,

        feedback_id:
          'EVENTO-AMBIGUO-V63-' +
          Date.now(),

        resultado:
          'POSITIVO',

        evidencia:
          'Teste de múltiplas soluções.'
      });

    } catch (erro) {
      erroSemSelecao = true;
    }

    teste(
      13,
      'múltiplas soluções exigem seleção explícita',
      erroSemSelecao
    );

    let erroVinculo =
      false;

    try {

      fecharCicloAprendizadoV63_({

        resultado_fluxo:
          fluxo,

        feedback_id:
          'EVENTO-ARBITRARIO-V63-' +
          Date.now(),

        resolucao_id:
          'RESOLUCAO-NAO-RECONHECIDA',

        resultado:
          'POSITIVO',

        evidencia:
          'Teste de vínculo arbitrário.'
      });

    } catch (erro) {
      erroVinculo = true;
    }

    teste(
      14,
      'vínculo arbitrário é bloqueado',
      erroVinculo
    );

    let erroResultado =
      false;

    try {

      fecharCicloAprendizadoV63_({

        resultado_fluxo:
          fluxo,

        feedback_id:
          'EVENTO-SEM-RESULTADO-V63-' +
          Date.now(),

        resultado:
          'NAO_AVALIADO'
      });

    } catch (erro) {
      erroResultado = true;
    }

    teste(
      15,
      'fechamento sem resultado real é bloqueado',
      erroResultado
    );

    const negativoId =
      'EVENTO-NEGATIVO-V63-' +
      Date.now();

    const negativo =
      fecharCicloAprendizadoV63_({

        resultado_fluxo:
          fluxo,

        feedback_id:
          negativoId,

        resultado:
          'NEGATIVO',

        evidencia:
          'A solução não resolveu o problema.'
      });

    feedbackIds.push(
      negativo.feedback_id
    );

    teste(
      16,
      'resultado NEGATIVO também fecha o ciclo',
      negativo.resultado ===
        'NEGATIVO'
    );

    const aposNegativo =
      buscarResolucaoV63_({
        resolucao_id:
          resolucaoId
      });

    teste(
      17,
      'feedback negativo não altera automaticamente o status',
      !!(
        aposNegativo &&
        aposNegativo.status === 'VALIDADA'
      )
    );

    teste(
      18,
      'feedback negativo também gera evidência',
      !!(
        aposNegativo &&
        Array.isArray(aposNegativo.evidencias) &&
        aposNegativo.evidencias.some(
          function(item) {
            return String(item).indexOf(
              'A solução não resolveu'
            ) !== -1;
          }
        )
      )
    );

  } catch (erro) {

    Logger.log(
      '❌ ERRO FATAL — ' +
      (
        erro && erro.stack
          ? erro.stack
          : erro
      )
    );

    falhas.push(
      'ERRO FATAL — ' +
      (
        erro && erro.message
          ? erro.message
          : erro
      )
    );

  } finally {

    try {

      if (feedbackIds.length > 0) {

        const sheet =
          obterAba_(SHEETS.FEEDBACK);

        const valores =
          sheet.getDataRange().getValues();

        const cabecalhos =
          valores[0] || [];

        const idx =
          cabecalhos.indexOf(
            'feedback_id'
          );

        for (
          let i = valores.length - 1;
          i >= 1;
          i--
        ) {

          if (
            idx !== -1 &&
            feedbackIds.indexOf(
              String(
                valores[i][idx]
              )
            ) !== -1
          ) {
            sheet.deleteRow(i + 1);
          }

        }
      }

    } catch (erro) {

      Logger.log(
        '⚠️ Limpeza feedback: ' +
        (erro.message || erro)
      );

    }

    try {

      if (resolucaoId) {

        const sheet =
          obterAba_(
            SHEETS.BIBLIOTECA_RESOLUCOES
          );

        const valores =
          sheet.getDataRange().getValues();

        const cabecalhos =
          valores[0] || [];

        const idx =
          cabecalhos.indexOf(
            'resolucao_id'
          );

        for (
          let i = valores.length - 1;
          i >= 1;
          i--
        ) {

          if (
            idx !== -1 &&
            String(
              valores[i][idx] || ''
            ) ===
            String(resolucaoId)
          ) {

            sheet.deleteRow(i + 1);

          }

        }

        SpreadsheetApp.flush();
      }

    } catch (erro) {

      Logger.log(
        '⚠️ Limpeza resolução: ' +
        (erro.message || erro)
      );

    }

    Logger.log(
      '============================================================'
    );

    Logger.log(
      'RESULTADO — TESTAR_FECHAMENTO_CICLO_APRENDIZADO_V63'
    );

    Logger.log(
      'APROVADOS: ' +
      aprovados +
      '/' +
      total
    );

    Logger.log(
      'FALHAS: ' +
      falhas.length
    );

    Logger.log(
      'PERCENTUAL: ' +
      Math.round(
        (aprovados / total) * 100
      ) +
      '%'
    );

    if (
      aprovados === total &&
      falhas.length === 0
    ) {

      Logger.log(
        '🏆 TESTAR_FECHAMENTO_CICLO_APRENDIZADO_V63: PASSOU'
      );

    } else {

      Logger.log(
        '❌ TESTAR_FECHAMENTO_CICLO_APRENDIZADO_V63: FALHOU'
      );

      falhas.forEach(
        function(falha) {
          Logger.log(
            '   ' +
            falha
          );
        }
      );
    }

    Logger.log(
      '============================================================'
    );
  }

  return {
    sucesso:
      aprovados === total &&
      falhas.length === 0,

    aprovados:
      aprovados,

    falhas:
      falhas.length,

    percentual:
      Math.round(
        (aprovados / total) * 100
      )
  };
}
