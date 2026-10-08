/**
 * ============================================================
 * FEEDS SOLUTIONS — INTEGRAÇÃO DO APRENDIZADO AO FLUXO V6.3
 * ============================================================
 */

function registrarFeedbackFluxoPrincipalV63_(resultadoFluxo, dadosFeedback) {

  resultadoFluxo = resultadoFluxo || {};
  dadosFeedback = dadosFeedback || {};

  const diagnosticoId =
    String(
      resultadoFluxo.diagnostico_id ||
      (resultadoFluxo.diagnostico &&
       resultadoFluxo.diagnostico.diagnostico_id) || ''
    ).trim();

  if (!diagnosticoId) {
    throw new Error('Fluxo principal sem diagnostico_id.');
  }

  let resolucaoId =
    String(dadosFeedback.resolucao_id || '').trim();

  if (!resolucaoId) {

    const v63 =
      resultadoFluxo.integracao_v63 &&
      resultadoFluxo.integracao_v63.resultado_v63
        ? resultadoFluxo.integracao_v63.resultado_v63
        : null;

    const decisao = v63 && v63.decisao
      ? v63.decisao
      : null;

    const resultados =
      v63 && Array.isArray(v63.resultados_reconhecimento)
        ? v63.resultados_reconhecimento
        : [];

    if (
      decisao &&
      decisao.estado === 'SOLUCAO_VALIDADA' &&
      resultados.length === 1 &&
      resultados[0] &&
      resultados[0].resolucao_id
    ) {
      resolucaoId =
        String(resultados[0].resolucao_id).trim();
    }
  }

  return registrarFeedbackAprendizadoV63_(
    Object.assign({}, dadosFeedback, {
      diagnostico_id: diagnosticoId,
      resolucao_id: resolucaoId
    })
  );
}


function TESTAR_INTEGRACAO_APRENDIZADO_FLUXO_V63() {

  const total = 16;
  let aprovados = 0;
  const falhas = [];
  let inicio = null;
  let fluxo = null;
  let resolucaoId = '';
  const feedbackIds = [];

  function teste(numero, descricao, condicao) {
    if (condicao) {
      aprovados++;
      Logger.log('✅ TESTE ' + numero + '/' + total + ' — ' + descricao);
    } else {
      falhas.push(numero + ' — ' + descricao);
      Logger.log('❌ TESTE ' + numero + '/' + total + ' — ' + descricao);
    }
  }

  try {

    Logger.log('============================================================');
    Logger.log('TESTAR_INTEGRACAO_APRENDIZADO_FLUXO_V63');
    Logger.log('============================================================');

    inicio = iniciarDiagnostico({
      nome: 'Empresa Teste Aprendizado Fluxo V63',
      nome_empresa: 'Empresa Teste Aprendizado Fluxo V63',
      segmento: 'Distribuidora',
      porte: 'PEQUENA',
      nome_contato: 'Teste Aprendizado Fluxo V63',
      email: 'teste-aprendizado-fluxo-v63@mvp.local',
      cidade: 'Teste'
    });

    teste(1, 'diagnóstico real criado',
      !!(inicio && inicio.sucesso === true && inicio.diagnostico_id));

    const mensagem =
      'Conferimos e lançamos ordens de manutenção de empilhadeiras manualmente. ' +
      'Isso gera erros de digitação e retrabalho todos os dias. ' +
      'Perdemos cerca de 3 horas por dia. ' +
      'Queremos reduzir erros e retrabalho mantendo a qualidade da manutenção.';

    const interpretacao =
      interpretarMensagemSemanticaV63_(mensagem);

    teste(2, 'interpretação semântica produzida', !!interpretacao);

    resolucaoId =
      'RES-APRENDIZADO-FLUXO-V63-' + Date.now();

    const criada = salvarResolucaoV63_({
      resolucao_id: resolucaoId,
      titulo_interno: 'Resolução validada — ordens de manutenção de empilhadeiras — aprendizado fluxo V6.3',
      descricao_problema: interpretacao.problema,
      padrao_problema: interpretacao.padrao_problema,
      processo: interpretacao.processo,
      dores: interpretacao.dores,
      impactos: interpretacao.impactos,
      resultados_desejados: [interpretacao.resultado_desejado],
      contexto: interpretacao.contexto,
      restricoes: [],
      abordagem_interna: 'Informação interna',
      descricao_solucao_interna: 'Procedimento validado de conferência.',
      alternativas: [],
      status: 'VALIDADA',
      confianca: 'ALTA',
      evidencias: ['Validação inicial do teste'],
      casos_relacionados: [],
      origem: 'TESTE_APRENDIZADO_FLUXO_V63',
      versao: 'V6.3'
    });

    teste(3, 'resolução validada criada',
      !!(criada && criada.resolucao_id));

    fluxo = processarMensagemDiagnostico({
      empresa_id: inicio.empresa_id,
      conversa_id: inicio.conversa_id,
      mensagem: mensagem
    });

    teste(4, 'fluxo principal real executou',
      !!(fluxo && fluxo.sucesso === true));

    teste(5, 'V6.3 foi ativada',
      !!(fluxo && fluxo.integracao_v63 &&
         fluxo.integracao_v63.ativada === true));

    teste(6, 'decisão reconheceu solução validada',
      !!(
        fluxo &&
        fluxo.integracao_v63 &&
        fluxo.integracao_v63.resultado_v63 &&
        fluxo.integracao_v63.resultado_v63.decisao &&
        fluxo.integracao_v63.resultado_v63.decisao.estado ===
          'SOLUCAO_VALIDADA'
      ));

    const feedback = registrarFeedbackFluxoPrincipalV63_(
      fluxo,
      {
        resultado: 'POSITIVO',
        resposta: 'SIM',
        comentario: 'A solução resolveu o problema.',
        evidencia: 'Cliente confirmou redução do retrabalho.'
      }
    );

    feedbackIds.push(feedback.feedback_id);

    teste(7, 'feedback foi registrado a partir do fluxo',
      !!(feedback && feedback.sucesso === true && feedback.feedback_id));

    teste(8, 'diagnostico_id foi preservado',
      feedback.diagnostico_id === inicio.diagnostico_id);

    teste(9, 'resolucao_id foi associado à solução',
      feedback.resolucao_id === resolucaoId);

    teste(10, 'resultado POSITIVO foi normalizado',
      feedback.resultado === 'POSITIVO');

    const recuperado = buscarFeedbackAprendizadoV63_({
      feedback_id: feedback.feedback_id
    });

    teste(11, 'feedback pode ser recuperado',
      recuperado.length === 1);

    const resolucao = buscarResolucaoV63_({
      resolucao_id: resolucaoId
    });

    teste(12, 'evidência foi acumulada na resolução',
      !!(
        resolucao &&
        Array.isArray(resolucao.evidencias) &&
        resolucao.evidencias.some(function(item) {
          return String(item).indexOf(
            'Cliente confirmou redução'
          ) !== -1;
        })
      ));

    teste(13, 'caso relacionado ao diagnóstico foi acumulado',
      !!(
        resolucao &&
        Array.isArray(resolucao.casos_relacionados) &&
        resolucao.casos_relacionados.some(function(item) {
          return String(item).indexOf(
            inicio.diagnostico_id
          ) !== -1;
        })
      ));

    teste(14, 'feedback não altera automaticamente status',
      !!(resolucao && resolucao.status === 'VALIDADA'));

    const fluxoAmbiguo = JSON.parse(JSON.stringify(fluxo));

    fluxoAmbiguo.integracao_v63.resultado_v63.decisao.estado =
      'SOLUCOES_ENCONTRADAS';

    fluxoAmbiguo.integracao_v63.resultado_v63.resultados_reconhecimento = [
      { resolucao_id: 'RES-AMBIGUA-1' },
      { resolucao_id: 'RES-AMBIGUA-2' }
    ];

    const semResolucao = registrarFeedbackFluxoPrincipalV63_(
      fluxoAmbiguo,
      {
        resultado: 'NAO_AVALIADO',
        comentario: 'Resultado sem solução individual selecionada.'
      }
    );

    feedbackIds.push(semResolucao.feedback_id);

    teste(15, 'múltiplas soluções não geram vínculo arbitrário',
      semResolucao.resolucao_id === '');

    teste(16, 'feedback sem solução permanece V6.3',
      semResolucao.versao === 'V6.3');

  } catch (erro) {

    Logger.log('❌ ERRO FATAL — ' +
      (erro && erro.stack ? erro.stack : erro));

    falhas.push(
      'ERRO FATAL — ' +
      (erro && erro.message ? erro.message : erro)
    );

  } finally {

    try {
      if (feedbackIds.length > 0) {
        const sheet = obterAba_(SHEETS.FEEDBACK);
        const valores = sheet.getDataRange().getValues();
        const cabecalhos = valores[0] || [];
        const idx = cabecalhos.indexOf('feedback_id');

        for (let i = valores.length - 1; i >= 1; i--) {
          if (
            idx !== -1 &&
            feedbackIds.indexOf(String(valores[i][idx])) !== -1
          ) {
            sheet.deleteRow(i + 1);
          }
        }
      }
    } catch (erro) {
      Logger.log('⚠️ Limpeza feedback: ' +
        (erro.message || erro));
    }

    try {
      if (inicio && inicio.diagnostico_id) {
        const sheet = obterAba_(SHEETS.INVESTIGACOES);
        const valores = sheet.getDataRange().getValues();
        const cabecalhos = valores[0] || [];
        const idxId = cabecalhos.indexOf('investigacao_id');
        const idxDiagnostico = cabecalhos.indexOf('diagnostico_id');

        for (let i = valores.length - 1; i >= 1; i--) {
          const id = idxId !== -1
            ? String(valores[i][idxId] || '') : '';
          const diagnostico = idxDiagnostico !== -1
            ? String(valores[i][idxDiagnostico] || '') : '';

          if (
            (
              fluxo &&
              fluxo.investigacao &&
              id === String(fluxo.investigacao.investigacao_id || '')
            ) ||
            diagnostico === String(inicio.diagnostico_id)
          ) {
            sheet.deleteRow(i + 1);
          }
        }

        SpreadsheetApp.flush();
      }
    } catch (erro) {
      Logger.log('⚠️ Limpeza investigação: ' +
        (erro.message || erro));
    }

    try {
      if (resolucaoId) {
        const sheet = obterAba_(SHEETS.BIBLIOTECA_RESOLUCOES);
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
      Logger.log('⚠️ Limpeza resolução: ' +
        (erro.message || erro));
    }

    Logger.log('============================================================');
    Logger.log(
      'RESULTADO — TESTAR_INTEGRACAO_APRENDIZADO_FLUXO_V63'
    );
    Logger.log('APROVADOS: ' + aprovados + '/' + total);
    Logger.log('FALHAS: ' + falhas.length);
    Logger.log(
      'PERCENTUAL: ' +
      Math.round((aprovados / total) * 100) + '%'
    );

    if (aprovados === total && falhas.length === 0) {
      Logger.log(
        '🏆 TESTAR_INTEGRACAO_APRENDIZADO_FLUXO_V63: PASSOU'
      );
    } else {
      Logger.log(
        '❌ TESTAR_INTEGRACAO_APRENDIZADO_FLUXO_V63: FALHOU'
      );
      falhas.forEach(function(falha) {
        Logger.log('   ' + falha);
      });
    }

    Logger.log('============================================================');
  }

  return {
    sucesso: aprovados === total && falhas.length === 0,
    aprovados: aprovados,
    falhas: falhas.length,
    percentual: Math.round((aprovados / total) * 100)
  };
}
