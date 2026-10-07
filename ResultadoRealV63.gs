/**
 * ============================================================
 * FEEDS SOLUTIONS — ENTRADA OPERACIONAL DO RESULTADO REAL V6.3
 * ============================================================
 *
 * Camada fina entre o fluxo principal já executado e o
 * fechamento oficial do aprendizado.
 *
 * IMPORTANTE:
 * Esta função NÃO fecha aprendizado quando a solução é apenas
 * apresentada. Ela só deve ser chamada quando houver resultado
 * real da aplicação.
 * ============================================================
 */

function registrarResultadoRealV63_(resultadoFluxo, dadosResultado) {

  dadosResultado = dadosResultado || {};

  if (!resultadoFluxo || typeof resultadoFluxo !== 'object') {
    throw new Error(
      'resultadoFluxo é obrigatório para registrar resultado real V6.3.'
    );
  }

  const resultado =
    String(dadosResultado.resultado || '').trim().toUpperCase();

  if (
    resultado !== 'POSITIVO' &&
    resultado !== 'PARCIAL' &&
    resultado !== 'NEGATIVO'
  ) {
    throw new Error(
      'Resultado real inválido. Use POSITIVO, PARCIAL ou NEGATIVO.'
    );
  }

  return fecharCicloAprendizadoV63_({
    resultado_fluxo: resultadoFluxo,
    feedback_id: dadosResultado.feedback_id || dadosResultado.evento_id || '',
    resolucao_id: dadosResultado.resolucao_id || '',
    resultado: resultado,
    resposta: dadosResultado.resposta || '',
    comentario: dadosResultado.comentario || '',
    evidencia: dadosResultado.evidencia || '',
    timestamp: dadosResultado.timestamp || new Date()
  });
}


/**
 * Contrato operacional exposto pelo fluxo principal.
 *
 * O chamador guarda o objeto retornado por
 * processarMensagemDiagnostico() e, quando o resultado real
 * existir, chama registrarResultadoRealV63_().
 */
function prepararFechamentoAprendizadoV63_(resultadoFluxo) {

  if (!resultadoFluxo || typeof resultadoFluxo !== 'object') {
    throw new Error(
      'resultadoFluxo é obrigatório.'
    );
  }

  const diagnosticoId =
    String(
      resultadoFluxo.diagnostico_id ||
      (
        resultadoFluxo.diagnostico &&
        resultadoFluxo.diagnostico.diagnostico_id
      ) ||
      ''
    ).trim();

  if (!diagnosticoId) {
    throw new Error(
      'Fluxo sem diagnostico_id não pode iniciar fechamento V6.3.'
    );
  }

  return {
    disponivel: true,
    versao: 'V6.3',
    diagnostico_id: diagnosticoId,
    pronto_para_resultado_real: true,
    instrucao:
      'Após aplicar a solução, registre POSITIVO, PARCIAL ou NEGATIVO por registrarResultadoRealV63_().'
  };
}


/**
 * ============================================================
 * TESTE OFICIAL — ENTRADA OPERACIONAL DO RESULTADO REAL
 * ============================================================
 */
function TESTAR_ENTRADA_RESULTADO_REAL_V63() {

  const total = 12;
  let aprovados = 0;
  const falhas = [];
  let resolucaoId = '';

  function teste(numero, descricao, condicao) {
    if (condicao === true) {
      aprovados++;
      Logger.log(
        '✅ TESTE ' + numero + '/' + total + ' — ' + descricao
      );
    } else {
      falhas.push(numero + ' — ' + descricao);
      Logger.log(
        '❌ TESTE ' + numero + '/' + total + ' — ' + descricao
      );
    }
  }

  try {

    Logger.log('============================================================');
    Logger.log('TESTAR_ENTRADA_RESULTADO_REAL_V63');
    Logger.log('============================================================');

    const diagnosticoId =
      'DIAG-RESULTADO-REAL-V63-' + Date.now();

    resolucaoId =
      'RES-RESULTADO-REAL-V63-' + Date.now();

    const criada =
      salvarResolucaoV63_({
        resolucao_id: resolucaoId,
        titulo_interno: 'Teste entrada resultado real V6.3',
        descricao_problema: 'Retrabalho administrativo.',
        padrao_problema: 'Processo manual.',
        processo: 'Conferência e lançamento.',
        dores: ['erros', 'retrabalho'],
        impactos: ['perda de tempo'],
        resultados_desejados: ['reduzir erros'],
        contexto: 'Administrativo.',
        restricoes: [],
        abordagem_interna: 'Padronização.',
        descricao_solucao_interna: 'Procedimento padronizado.',
        alternativas: [],
        status: 'VALIDADA',
        confianca: 'ALTA',
        evidencias: [],
        casos_relacionados: [],
        origem: 'TESTE_ENTRADA_RESULTADO_REAL_V63',
        versao: 'V6.3'
      });

    teste(
      1,
      'resolução temporária criada',
      !!(criada && criada.resolucao_id === resolucaoId)
    );

    const fluxo = {
      sucesso: true,
      diagnostico_id: diagnosticoId,
      diagnostico: {
        diagnostico_id: diagnosticoId
      },
      integracao_v63: {
        ativada: true,
        resultado_v63: {
          decisao: {
            estado: 'SOLUCAO_VALIDADA'
          },
          resultados_reconhecimento: [
            {
              resolucao_id: resolucaoId
            }
          ]
        }
      }
    };

    const preparacao =
      prepararFechamentoAprendizadoV63_(fluxo);

    teste(
      2,
      'fluxo fica pronto para receber resultado real',
      preparacao.pronto_para_resultado_real === true
    );

    teste(
      3,
      'diagnostico_id é preservado no contrato',
      preparacao.diagnostico_id === diagnosticoId
    );

    const feedbackId =
      'EVENTO-RESULTADO-REAL-V63-' + Date.now();

    const fechamento =
      registrarResultadoRealV63_(
        fluxo,
        {
          feedback_id: feedbackId,
          resultado: 'POSITIVO',
          resposta: 'SIM',
          comentario: 'Resultado confirmado.',
          evidencia: 'Solução aplicada com redução do retrabalho.'
        }
      );

    teste(
      4,
      'resultado POSITIVO fecha o ciclo',
      fechamento.sucesso === true
    );

    teste(
      5,
      'feedback_id é preservado',
      fechamento.feedback_id === feedbackId
    );

    teste(
      6,
      'diagnostico_id é preservado',
      fechamento.diagnostico_id === diagnosticoId
    );

    teste(
      7,
      'resolucao_id é preservado',
      fechamento.resolucao_id === resolucaoId
    );

    teste(
      8,
      'feedback fica persistido',
      buscarFeedbackAprendizadoV63_({
        feedback_id: feedbackId
      }).length === 1
    );

    const repetido =
      registrarResultadoRealV63_(
        fluxo,
        {
          feedback_id: feedbackId,
          resultado: 'POSITIVO',
          evidencia: 'Repetição do mesmo evento.'
        }
      );

    teste(
      9,
      'repetição do evento é idempotente',
      repetido.repetido === true
    );

    let bloqueouResultadoInvalido = false;

    try {
      registrarResultadoRealV63_(
        fluxo,
        {
          feedback_id:
            'EVENTO-INVALIDO-V63-' + Date.now(),
          resultado: 'NAO_AVALIADO'
        }
      );
    } catch (erro) {
      bloqueouResultadoInvalido = true;
    }

    teste(
      10,
      'resultado inválido é bloqueado',
      bloqueouResultadoInvalido
    );

    const fluxoSemResultado =
      prepararFechamentoAprendizadoV63_(fluxo);

    teste(
      11,
      'preparação não registra aprendizado sozinha',
      buscarFeedbackAprendizadoV63_({
        diagnostico_id: diagnosticoId
      }).length === 1
    );

    const resolucao =
      buscarResolucaoV63_({
        resolucao_id: resolucaoId
      });

    teste(
      12,
      'status da solução permanece inalterado',
      !!(
        resolucao &&
        resolucao.status === 'VALIDADA'
      )
    );

  } catch (erro) {

    Logger.log(
      '❌ ERRO FATAL — ' +
      (erro && erro.stack ? erro.stack : erro)
    );

    falhas.push(
      'ERRO FATAL — ' +
      (erro && erro.message ? erro.message : erro)
    );

  } finally {

    try {
      const sheet = obterAba_(SHEETS.FEEDBACK);
      const valores = sheet.getDataRange().getValues();
      const cabecalhos = valores[0] || [];
      const idx = cabecalhos.indexOf('diagnostico_id');

      for (let i = valores.length - 1; i >= 1; i--) {
        if (
          idx !== -1 &&
          String(valores[i][idx] || '').indexOf(
            'DIAG-RESULTADO-REAL-V63-'
          ) === 0
        ) {
          sheet.deleteRow(i + 1);
        }
      }
    } catch (erro) {
      Logger.log(
        '⚠️ Limpeza feedback: ' + (erro.message || erro)
      );
    }

    try {
      if (resolucaoId) {
        const sheet =
          obterAba_(SHEETS.BIBLIOTECA_RESOLUCOES);
        const valores = sheet.getDataRange().getValues();
        const cabecalhos = valores[0] || [];
        const idx = cabecalhos.indexOf('resolucao_id');

        for (let i = valores.length - 1; i >= 1; i--) {
          if (
            idx !== -1 &&
            String(valores[i][idx] || '') === String(resolucaoId)
          ) {
            sheet.deleteRow(i + 1);
          }
        }

        SpreadsheetApp.flush();
      }
    } catch (erro) {
      Logger.log(
        '⚠️ Limpeza resolução: ' + (erro.message || erro)
      );
    }

    Logger.log('============================================================');
    Logger.log('RESULTADO — TESTAR_ENTRADA_RESULTADO_REAL_V63');
    Logger.log('APROVADOS: ' + aprovados + '/' + total);
    Logger.log('FALHAS: ' + falhas.length);
    Logger.log(
      'PERCENTUAL: ' +
      Math.round((aprovados / total) * 100) +
      '%'
    );

    if (aprovados === total && falhas.length === 0) {
      Logger.log(
        '🏆 TESTAR_ENTRADA_RESULTADO_REAL_V63: PASSOU'
      );
    } else {
      Logger.log(
        '❌ TESTAR_ENTRADA_RESULTADO_REAL_V63: FALHOU'
      );
      falhas.forEach(function(falha) {
        Logger.log('   ' + falha);
      });
    }

    Logger.log('============================================================');
  }

  return {
    sucesso:
      aprovados === total &&
      falhas.length === 0,
    aprovados: aprovados,
    falhas: falhas.length,
    percentual:
      Math.round((aprovados / total) * 100)
  };
}
