/**
 * ============================================================
 * FEEDS SOLUTIONS — APRENDIZADO V6.3
 * ============================================================
 *
 * Ciclo controlado:
 *
 * FEEDBACK
 *   ↓
 * RESULTADO REAL
 *   ↓
 * EVIDÊNCIA
 *   ↓
 * CASO RELACIONADO
 *
 * O feedback NÃO promove automaticamente uma resolução.
 * A promoção para VALIDADA continua dependendo de
 * validarResolucaoV63_(), com evidência e confirmação explícita.
 * ============================================================
 */

const APRENDIZADO_V63 = {

  VERSAO: 'V6.3',

  RESULTADOS: {
    POSITIVO: 'POSITIVO',
    PARCIAL: 'PARCIAL',
    NEGATIVO: 'NEGATIVO',
    NAO_AVALIADO: 'NAO_AVALIADO'
  },

  ACOES: {
    POSITIVO: 'REGISTRAR_EVIDENCIA_POSITIVA',
    PARCIAL: 'REGISTRAR_EVIDENCIA_PARCIAL',
    NEGATIVO: 'REGISTRAR_EVIDENCIA_NEGATIVA',
    SEM_RESOLUCAO: 'REGISTRAR_FEEDBACK_SEM_RESOLUCAO'
  }
};


/**
 * ------------------------------------------------------------
 * GARANTIR ESTRUTURA DO FEEDBACK
 * ------------------------------------------------------------
 *
 * Compatibilidade:
 * - planilhas antigas recebem as novas colunas no final;
 * - dados antigos permanecem intactos.
 * ------------------------------------------------------------
 */
function garantirEstruturaFeedbackV63_() {

  const sheet =
    obterAba_(SHEETS.FEEDBACK);

  const esperados = [
    'feedback_id',
    'diagnostico_id',
    'resolucao_id',
    'resposta',
    'resultado',
    'comentario',
    'evidencia',
    'acao_aprendizado',
    'timestamp'
  ];

  const ultimaColuna =
    Math.max(
      sheet.getLastColumn(),
      1
    );

  let cabecalhos =
    sheet
      .getRange(
        1,
        1,
        1,
        ultimaColuna
      )
      .getValues()[0]
      .map(function(valor) {
        return String(valor || '').trim();
      });

  if (!cabecalhos.some(function(v) { return v !== ''; })) {
    sheet
      .getRange(
        1,
        1,
        1,
        esperados.length
      )
      .setValues([esperados]);

    return esperados;
  }

  esperados.forEach(function(campo) {

    if (cabecalhos.indexOf(campo) === -1) {

      const novaColuna =
        sheet.getLastColumn() + 1;

      sheet
        .getRange(
          1,
          novaColuna
        )
        .setValue(campo);

      cabecalhos.push(campo);
    }

  });

  return cabecalhos;
}


/**
 * ------------------------------------------------------------
 * NORMALIZA RESULTADO
 * ------------------------------------------------------------
 */
function normalizarResultadoFeedbackV63_(valor) {

  const texto =
    String(valor || '')
      .trim()
      .toUpperCase();

  const resultados =
    APRENDIZADO_V63.RESULTADOS;

  if (texto === resultados.POSITIVO) {
    return resultados.POSITIVO;
  }

  if (texto === resultados.PARCIAL) {
    return resultados.PARCIAL;
  }

  if (texto === resultados.NEGATIVO) {
    return resultados.NEGATIVO;
  }

  return resultados.NAO_AVALIADO;
}


/**
 * ------------------------------------------------------------
 * REGISTRAR FEEDBACK DE APRENDIZADO
 * ------------------------------------------------------------
 *
 * O feedback pode existir sem resolução.
 * Para produzir aprendizado sobre uma resolução,
 * resolucao_id deve ser informado.
 * ------------------------------------------------------------
 */
function registrarFeedbackAprendizadoV63_(dados) {

  dados = dados || {};

  const diagnosticoId =
    String(
      dados.diagnostico_id || ''
    ).trim();

  if (!diagnosticoId) {
    throw new Error(
      'diagnostico_id é obrigatório para registrar feedback.'
    );
  }

  garantirEstruturaFeedbackV63_();

  const resultado =
    normalizarResultadoFeedbackV63_(
      dados.resultado || dados.resposta
    );

  const resolucaoId =
    String(
      dados.resolucao_id || ''
    ).trim();

  let acao =
    APRENDIZADO_V63.ACOES.SEM_RESOLUCAO;

  if (resolucaoId) {

    if (!buscarResolucaoV63_({
      resolucao_id: resolucaoId
    })) {
      throw new Error(
        'Resolução não encontrada: ' +
        resolucaoId
      );
    }

    if (resultado === APRENDIZADO_V63.RESULTADOS.POSITIVO) {
      acao = APRENDIZADO_V63.ACOES.POSITIVO;
    } else if (resultado === APRENDIZADO_V63.RESULTADOS.PARCIAL) {
      acao = APRENDIZADO_V63.ACOES.PARCIAL;
    } else if (resultado === APRENDIZADO_V63.RESULTADOS.NEGATIVO) {
      acao = APRENDIZADO_V63.ACOES.NEGATIVO;
    }
  }

  const evidencia =
    String(
      dados.evidencia ||
      dados.comentario ||
      ''
    ).trim();

  const feedback =
    salvarFeedback_({
      feedback_id:
        dados.feedback_id,

      diagnostico_id:
        diagnosticoId,

      resolucao_id:
        resolucaoId,

      resposta:
        dados.resposta || resultado,

      resultado:
        resultado,

      comentario:
        dados.comentario || '',

      evidencia:
        evidencia,

      acao_aprendizado:
        acao,

      timestamp:
        dados.timestamp || new Date()
    });

  let aprendizado = null;

  if (resolucaoId) {

    aprendizado =
      aplicarFeedbackAprendizadoV63_({
        feedback_id:
          feedback.feedback_id,

        resolucao_id:
          resolucaoId,

        diagnostico_id:
          diagnosticoId,

        resultado:
          resultado,

        evidencia:
          evidencia
      });
  }

  return {
    sucesso: true,
    versao: APRENDIZADO_V63.VERSAO,
    feedback_id: feedback.feedback_id,
    diagnostico_id: diagnosticoId,
    resolucao_id: resolucaoId,
    resultado: resultado,
    acao_aprendizado: acao,
    aprendizado: aprendizado
  };
}


/**
 * ------------------------------------------------------------
 * APLICAR FEEDBACK À BIBLIOTECA
 * ------------------------------------------------------------
 *
 * Regra crítica:
 * NENHUM resultado altera automaticamente o status
 * da resolução.
 *
 * O feedback gera evidência e vínculo de caso.
 * A validação continua explícita.
 * ------------------------------------------------------------
 */
function aplicarFeedbackAprendizadoV63_(dados) {

  dados = dados || {};

  const resolucaoId =
    String(
      dados.resolucao_id || ''
    ).trim();

  if (!resolucaoId) {
    throw new Error(
      'resolucao_id é obrigatório para aplicar aprendizado.'
    );
  }

  const resolucao =
    buscarResolucaoV63_({
      resolucao_id: resolucaoId
    });

  if (!resolucao) {
    throw new Error(
      'Resolução não encontrada: ' +
      resolucaoId
    );
  }

  const resultado =
    normalizarResultadoFeedbackV63_(
      dados.resultado
    );

  const diagnosticoId =
    String(
      dados.diagnostico_id || ''
    ).trim();

  const feedbackId =
    String(
      dados.feedback_id || ''
    ).trim();

  const evidencia =
    String(
      dados.evidencia || ''
    ).trim();

  const evidenciasAtuais =
    Array.isArray(resolucao.evidencias)
      ? resolucao.evidencias.slice()
      : [];

  const casosAtuais =
    Array.isArray(resolucao.casos_relacionados)
      ? resolucao.casos_relacionados.slice()
      : [];

  const marcador =
    'FEEDBACK_V63:' +
    feedbackId +
    ':' +
    resultado;

  if (
    marcador &&
    evidenciasAtuais.indexOf(marcador) === -1
  ) {
    evidenciasAtuais.push(marcador);
  }

  if (evidencia) {

    const evidenciaComResultado =
      resultado +
      ': ' +
      evidencia;

    if (
      evidenciasAtuais.indexOf(
        evidenciaComResultado
      ) === -1
    ) {
      evidenciasAtuais.push(
        evidenciaComResultado
      );
    }
  }

  if (diagnosticoId) {

    const caso =
      JSON.stringify({
        diagnostico_id: diagnosticoId,
        feedback_id: feedbackId,
        resultado: resultado
      });

    const casoExiste =
      casosAtuais.some(function(item) {
        return String(item) === caso;
      });

    if (!casoExiste) {
      casosAtuais.push(caso);
    }
  }

  const antes =
    String(resolucao.status || '');

  atualizarResolucaoV63_(
    resolucaoId,
    {
      evidencias:
        evidenciasAtuais,

      casos_relacionados:
        casosAtuais
    }
  );

  const depois =
    buscarResolucaoV63_({
      resolucao_id: resolucaoId
    });

  return {
    sucesso: true,
    resolucao_id: resolucaoId,
    resultado: resultado,
    status_antes: antes,
    status_depois:
      depois
        ? depois.status
        : antes,
    status_alterado:
      antes !==
      (
        depois
          ? depois.status
          : antes
      ),
    evidencias_registradas:
      evidenciasAtuais.length,
    casos_relacionados:
      casosAtuais.length
  };
}


/**
 * ------------------------------------------------------------
 * BUSCAR FEEDBACK
 * ------------------------------------------------------------
 */
function buscarFeedbackAprendizadoV63_(filtros) {

  filtros = filtros || {};

  const sheet =
    obterAba_(SHEETS.FEEDBACK);

  const valores =
    sheet
      .getDataRange()
      .getValues();

  if (valores.length <= 1) {
    return [];
  }

  const cabecalhos =
    valores[0];

  return valores
    .slice(1)
    .map(function(linha) {
      return objetoDaLinha_(
        cabecalhos,
        linha
      );
    })
    .filter(function(item) {

      if (
        filtros.feedback_id &&
        String(item.feedback_id) !==
          String(filtros.feedback_id)
      ) {
        return false;
      }

      if (
        filtros.diagnostico_id &&
        String(item.diagnostico_id) !==
          String(filtros.diagnostico_id)
      ) {
        return false;
      }

      if (
        filtros.resolucao_id &&
        String(item.resolucao_id) !==
          String(filtros.resolucao_id)
      ) {
        return false;
      }

      if (
        filtros.resultado &&
        String(item.resultado).toUpperCase() !==
          String(filtros.resultado).toUpperCase()
      ) {
        return false;
      }

      return true;
    });
}


/**
 * ============================================================
 * TESTE OFICIAL — CICLO DE APRENDIZADO V6.3
 * ============================================================
 */
function TESTAR_CICLO_APRENDIZADO_V63() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'TESTAR_CICLO_APRENDIZADO_V63'
  );

  Logger.log(
    '============================================================'
  );

  const resultados = [];

  function teste(
    numero,
    descricao,
    condicao
  ) {

    const passou =
      condicao === true;

    resultados.push({
      numero: numero,
      descricao: descricao,
      passou: passou
    });

    Logger.log(
      (passou ? '✅' : '❌') +
      ' TESTE ' +
      numero +
      '/20 — ' +
      descricao
    );
  }

  let resolucaoId = '';
  const marcador =
    'TESTE-APRENDIZADO-V63-' +
    new Date().getTime();

  const diagnosticoId =
    marcador +
    '-DIAGNOSTICO';

  const feedbackIds = [];

  try {

    garantirEstruturaFeedbackV63_();

    teste(
      1,
      'estrutura de feedback V6.3 disponível',
      true
    );

    const criada =
      salvarResolucaoV63_({

        titulo_interno:
          marcador,

        descricao_problema:
          'Retrabalho no lançamento de pedidos.',

        padrao_problema:
          'Processo manual de conferência e lançamento.',

        processo:
          'Conferir e lançar pedidos.',

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
          'Padronizar a conferência.',

        descricao_solucao_interna:
          'Procedimento padronizado de conferência.',

        alternativas: [],

        status:
          'HIPOTESE',

        confianca:
          'MEDIA',

        evidencias: [],

        casos_relacionados: [],

        origem:
          'TESTE_APRENDIZADO_V63'
      });

    resolucaoId =
      criada.resolucao_id;

    const inicial =
      buscarResolucaoV63_({
        resolucao_id:
          resolucaoId
      });

    teste(
      2,
      'resolução de teste criada',
      !!inicial
    );

    teste(
      3,
      'resolução começa como HIPOTESE',
      !!(
        inicial &&
        inicial.status ===
          'HIPOTESE'
      )
    );

    const positivo =
      registrarFeedbackAprendizadoV63_({

        diagnostico_id:
          diagnosticoId,

        resolucao_id:
          resolucaoId,

        resposta:
          'SIM',

        resultado:
          'POSITIVO',

        comentario:
          'A solução resolveu o problema.',

        evidencia:
          'Cliente confirmou redução do retrabalho.'
      });

    feedbackIds.push(
      positivo.feedback_id
    );

    teste(
      4,
      'feedback positivo foi registrado',
      !!(
        positivo &&
        positivo.feedback_id
      )
    );

    teste(
      5,
      'feedback ficou vinculado à resolução',
      positivo.resolucao_id ===
        resolucaoId
    );

    teste(
      6,
      'resultado positivo foi normalizado',
      positivo.resultado ===
        'POSITIVO'
    );

    const aposPositivo =
      buscarResolucaoV63_({
        resolucao_id:
          resolucaoId
      });

    teste(
      7,
      'feedback positivo NÃO promove automaticamente',
      !!(
        aposPositivo &&
        aposPositivo.status ===
          'HIPOTESE'
      )
    );

    teste(
      8,
      'evidência positiva foi registrada',
      !!(
        aposPositivo &&
        Array.isArray(
          aposPositivo.evidencias
        ) &&
        aposPositivo.evidencias.some(
          function(item) {
            return String(item)
              .indexOf(
                'Cliente confirmou redução'
              ) !== -1;
          }
        )
      )
    );

    teste(
      9,
      'caso relacionado foi registrado',
      !!(
        aposPositivo &&
        Array.isArray(
          aposPositivo.casos_relacionados
        ) &&
        aposPositivo.casos_relacionados.some(
          function(item) {
            return String(item)
              .indexOf(
                diagnosticoId
              ) !== -1;
          }
        )
      )
    );

    const negativo =
      registrarFeedbackAprendizadoV63_({

        diagnostico_id:
          diagnosticoId +
          '-NEGATIVO',

        resolucao_id:
          resolucaoId,

        resposta:
          'NAO',

        resultado:
          'NEGATIVO',

        comentario:
          'A solução não resolveu o problema.',

        evidencia:
          'Cliente informou que o retrabalho permaneceu.'
      });

    feedbackIds.push(
      negativo.feedback_id
    );

    const aposNegativo =
      buscarResolucaoV63_({
        resolucao_id:
          resolucaoId
      });

    teste(
      10,
      'feedback negativo foi registrado',
      !!(
        negativo &&
        negativo.feedback_id
      )
    );

    teste(
      11,
      'feedback negativo não promove resolução',
      !!(
        aposNegativo &&
        aposNegativo.status ===
          'HIPOTESE'
      )
    );

    teste(
      12,
      'evidência negativa foi preservada',
      !!(
        aposNegativo &&
        Array.isArray(
          aposNegativo.evidencias
        ) &&
        aposNegativo.evidencias.some(
          function(item) {
            return String(item)
              .indexOf(
                'Cliente informou que o retrabalho'
              ) !== -1;
          }
        )
      )
    );

    const feedbacks =
      buscarFeedbackAprendizadoV63_({
        resolucao_id:
          resolucaoId
      });

    teste(
      13,
      'feedbacks podem ser recuperados pela resolução',
      feedbacks.length >= 2
    );

    teste(
      14,
      'feedback positivo e negativo permanecem distintos',
      !!(
        feedbacks.some(
          function(item) {
            return item.resultado ===
              'POSITIVO';
          }
        ) &&
        feedbacks.some(
          function(item) {
            return item.resultado ===
              'NEGATIVO';
          }
        )
      )
    );

    const validacao =
      validarResolucaoV63_(
        resolucaoId,
        {
          evidencias: [
            marcador +
            '-VALIDACAO-EXPLICITA'
          ],
          confianca:
            'ALTA',
          descricao_solucao_interna:
            'Procedimento validado após avaliação explícita.'
        }
      );

    const aposValidacao =
      buscarResolucaoV63_({
        resolucao_id:
          resolucaoId
      });

    teste(
      15,
      'validação explícita continua funcionando',
      !!(
        validacao &&
        validacao.status ===
          'VALIDADA'
      )
    );

    teste(
      16,
      'somente a validação explícita promoveu resolução',
      !!(
        aposValidacao &&
        aposValidacao.status ===
          'VALIDADA'
      )
    );

    const feedbackPosValidacao =
      registrarFeedbackAprendizadoV63_({

        diagnostico_id:
          diagnosticoId +
          '-POS-VALIDACAO',

        resolucao_id:
          resolucaoId,

        resultado:
          'POSITIVO',

        comentario:
          'Novo caso também confirmou o resultado.',

        evidencia:
          'Novo caso confirmou o resultado.'
      });

    feedbackIds.push(
      feedbackPosValidacao.feedback_id
    );

    const final =
      buscarResolucaoV63_({
        resolucao_id:
          resolucaoId
      });

    teste(
      17,
      'feedback posterior pode acumular evidência',
      !!(
        final &&
        final.evidencias.length >=
          aposValidacao.evidencias.length
      )
    );

    teste(
      18,
      'feedback posterior não rebaixa solução validada',
      !!(
        final &&
        final.status ===
          'VALIDADA'
      )
    );

    teste(
      19,
      'feedback possui vínculo com diagnóstico',
      !!(
        buscarFeedbackAprendizadoV63_({
          diagnostico_id:
            diagnosticoId
        }).length > 0
      )
    );

    teste(
      20,
      'ciclo preserva versão V6.3',
      APRENDIZADO_V63.VERSAO ===
        'V6.3'
    );

  } catch (erro) {

    Logger.log(
      '❌ ERRO GERAL CICLO APRENDIZADO: ' +
      (
        erro &&
        erro.message
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

        const colunaId =
          cabecalhos.indexOf(
            'feedback_id'
          );

        for (
          let i = valores.length - 1;
          i >= 1;
          i--
        ) {

          if (
            colunaId !== -1 &&
            feedbackIds.indexOf(
              String(
                valores[i][colunaId]
              )
            ) !== -1
          ) {

            sheet.deleteRow(
              i + 1
            );
          }
        }
      }

    } catch (erroLimpezaFeedback) {

      Logger.log(
        '⚠️ AVISO LIMPEZA FEEDBACK: ' +
        (
          erroLimpezaFeedback.message ||
          erroLimpezaFeedback
        )
      );

    }

    if (resolucaoId) {

      try {

        const sheet =
          obterAba_(
            SHEETS.BIBLIOTECA_RESOLUCOES
          );

        const valores =
          sheet.getDataRange()
            .getValues();

        const cabecalhos =
          valores[0] || [];

        const colunaId =
          cabecalhos.indexOf(
            'resolucao_id'
          );

        const colunaTitulo =
          cabecalhos.indexOf(
            'titulo_interno'
          );

        for (
          let i = valores.length - 1;
          i >= 1;
          i--
        ) {

          const id =
            colunaId !== -1
              ? String(
                  valores[i][colunaId]
                )
              : '';

          const titulo =
            colunaTitulo !== -1
              ? String(
                  valores[i][colunaTitulo]
                )
              : '';

          if (
            id === String(
              resolucaoId
            ) ||
            titulo === marcador
          ) {

            sheet.deleteRow(
              i + 1
            );
          }
        }

      } catch (erroLimpezaResolucao) {

        Logger.log(
          '⚠️ AVISO LIMPEZA RESOLUÇÃO: ' +
          (
            erroLimpezaResolucao.message ||
            erroLimpezaResolucao
          )
        );
      }
    }
  }

  const aprovados =
    resultados.filter(
      function(item) {
        return item.passou;
      }
    ).length;

  const falhas =
    resultados.length -
    aprovados;

  const percentual =
    resultados.length > 0
      ? Math.round(
          (
            aprovados /
            resultados.length
          ) * 100
        )
      : 0;

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'RESULTADO FINAL — CICLO DE APRENDIZADO V6.3'
  );

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

  if (
    resultados.length === 20 &&
    falhas === 0
  ) {

    Logger.log(
      '🏆 TESTAR_CICLO_APRENDIZADO_V63: PASSOU'
    );

  } else {

    Logger.log(
      '❌ TESTAR_CICLO_APRENDIZADO_V63: FALHOU'
    );
  }

  Logger.log(
    '============================================================'
  );

  return {
    sucesso:
      resultados.length === 20 &&
      falhas === 0,

    aprovados:
      aprovados,

    falhas:
      falhas,

    percentual:
      percentual,

    resultados:
      resultados
  };
}
