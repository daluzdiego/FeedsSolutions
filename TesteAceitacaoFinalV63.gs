/**
 * ============================================================
 * FEEDS SOLUTIONS — TESTE DE ACEITAÇÃO FINAL V6.3
 * ============================================================
 *
 * Este arquivo NÃO altera a lógica de produção.
 *
 * Objetivo:
 * executar a suíte oficial existente em uma única chamada,
 * registrar falhas de execução e produzir um relatório único.
 *
 * IMPORTANTE:
 * Os testes históricos da V6.3 possuem contratos de retorno
 * diferentes. Portanto:
 *
 * - "APROVADO" = função de teste executou sem lançar exceção;
 * - "FALHA DE EXECUÇÃO" = função lançou exceção;
 * - os próprios testes continuam responsáveis por registrar
 *   suas assertivas internas como PASSOU/FALHOU.
 *
 * Assim, este runner NÃO inventa um 100% quando o teste interno
 * não fornece um retorno padronizado.
 *
 * Uso:
 *   TESTAR_ACEITACAO_FINAL_V63()
 *
 * Depois da execução, o Apps Script exibirá:
 *   - suíte executada;
 *   - funções com erro de execução;
 *   - percentual de execução sem exceção;
 *   - conclusão operacional.
 *
 * ============================================================
 */


/**
 * ============================================================
 * CONTROLE DE EXECUÇÃO RETOMÁVEL V6.3
 * ============================================================
 *
 * A suíte completa contém testes com Gemini real e pode
 * ultrapassar o limite de execução do Apps Script.
 *
 * O estado fica em PropertiesService e a execução trabalha
 * em lotes. Nenhum teste é pulado: a próxima chamada continua
 * exatamente do próximo índice.
 * ============================================================
 */

function TESTAR_ACEITACAO_FINAL_V63_RESETAR() {
  PropertiesService
    .getScriptProperties()
    .deleteProperty('FEEDS_V63_ACEITACAO_CURSOR');

  Logger.log('🟢 ACEITAÇÃO V6.3 RESETADA.');
  Logger.log('Execute TESTAR_ACEITACAO_FINAL_V63_CONTINUAR().');
}


function TESTAR_ACEITACAO_FINAL_V63_CONTINUAR() {

  var props =
    PropertiesService.getScriptProperties();

  var cursor =
    parseInt(
      props.getProperty(
        'FEEDS_V63_ACEITACAO_CURSOR'
      ) || '0',
      10
    );

  var testes =
    obterTestesAceitacaoFinalV63_();

  if (cursor >= testes.length) {
    Logger.log('🏆 ACEITAÇÃO FINAL V6.3 JÁ FOI CONCLUÍDA.');
    return {
      concluido: true,
      proximo: testes.length,
      total: testes.length
    };
  }

  /*
   * Limite conservador de tempo.
   * O Apps Script possui limite global próprio; encerramos
   * antes dele para preservar o cursor e permitir continuação.
   */
  var inicio =
    new Date().getTime();

  var LIMITE_MS =
    240000;

  var executados = 0;
  var falhas = 0;

  Logger.log('============================================================');
  Logger.log('FEEDS SOLUTIONS — ACEITAÇÃO FINAL V6.3 / LOTE');
  Logger.log('============================================================');
  Logger.log(
    'CONTINUANDO EM: ' +
    (cursor + 1) +
    '/' +
    testes.length
  );

  while (
    cursor < testes.length &&
    (new Date().getTime() - inicio) < LIMITE_MS
  ) {

    var item =
      testes[cursor];

    Logger.log('------------------------------------------------------------');
    Logger.log(
      'SUÍTE ' +
      (cursor + 1) +
      '/' +
      testes.length +
      ' — ' +
      item.etapa
    );
    Logger.log(item.nome);

    if (typeof item.fn !== 'function') {

      falhas++;

      Logger.log(
        '❌ FUNÇÃO AUSENTE: ' +
        item.nome
      );

    } else {

      try {

        item.fn();

        executados++;

        Logger.log(
          '✅ EXECUTADO SEM EXCEÇÃO: ' +
          item.nome
        );

      } catch (erro) {

        falhas++;

        Logger.log(
          '❌ EXCEÇÃO EM ' +
          item.nome +
          ': ' +
          (
            erro && erro.message
              ? erro.message
              : erro
          )
        );

      }

    }

    cursor++;

    props.setProperty(
      'FEEDS_V63_ACEITACAO_CURSOR',
      String(cursor)
    );

  }

  var concluido =
    cursor >= testes.length;

  Logger.log('============================================================');
  Logger.log(
    concluido
      ? '🏁 LOTE FINALIZADO — SUÍTE COMPLETA CONCLUÍDA'
      : '⏭️ LOTE FINALIZADO — CONTINUAÇÃO NECESSÁRIA'
  );
  Logger.log(
    'POSIÇÃO ATUAL: ' +
    cursor +
    '/' +
    testes.length
  );
  Logger.log(
    'EXECUTADOS SEM EXCEÇÃO NESTE LOTE: ' +
    executados
  );
  Logger.log(
    'FALHAS/AUSÊNCIAS NESTE LOTE: ' +
    falhas
  );

  if (!concluido) {
    Logger.log(
      '➡️ Execute novamente: TESTAR_ACEITACAO_FINAL_V63_CONTINUAR()'
    );
  } else {
    Logger.log(
      '🏆 TODOS OS 46 TESTES DA SUÍTE FORAM PERCORRIDOS.'
    );
    Logger.log(
      '⚠️ A aprovação final continua dependendo dos PASSOU/FALHOU internos de cada teste.'
    );
  }

  return {
    concluido: concluido,
    proximo: cursor,
    total: testes.length,
    executados_lote: executados,
    falhas_lote: falhas
  };
}


/**
 * Retorna a mesma lista oficial usada pela aceitação final.
 * Mantemos uma única fonte para evitar divergência entre
 * o runner original e o runner retomável.
 */
function obterTestesAceitacaoFinalV63_() {
  return [
    {
      etapa: 'Interpretação — resistência',
      nome: 'TESTAR_RESISTENCIA_INTERPRETACAO_V63',
      fn: typeof TESTAR_RESISTENCIA_INTERPRETACAO_V63 === 'function'
        ? TESTAR_RESISTENCIA_INTERPRETACAO_V63
        : null
    },
    {
      etapa: 'Interpretação — semântica',
      nome: 'TESTAR_INTERPRETACAO_SEMANTICA_V63',
      fn: typeof TESTAR_INTERPRETACAO_SEMANTICA_V63 === 'function'
        ? TESTAR_INTERPRETACAO_SEMANTICA_V63
        : null
    },
    {
      etapa: 'IA semântica real',
      nome: 'TESTAR_IA_SEMANTICA_REAL_V63',
      fn: typeof TESTAR_IA_SEMANTICA_REAL_V63 === 'function'
        ? TESTAR_IA_SEMANTICA_REAL_V63
        : null
    },
    {
      etapa: 'IA — informação incompleta',
      nome: 'TESTAR_INFORMACAO_INCOMPLETA_SEMANTICA_V63',
      fn: typeof TESTAR_INFORMACAO_INCOMPLETA_SEMANTICA_V63 === 'function'
        ? TESTAR_INFORMACAO_INCOMPLETA_SEMANTICA_V63
        : null
    },
    {
      etapa: 'IA — guarda de impacto',
      nome: 'TESTAR_GUARDA_IMPACTO_SEMANTICO_V63',
      fn: typeof TESTAR_GUARDA_IMPACTO_SEMANTICO_V63 === 'function'
        ? TESTAR_GUARDA_IMPACTO_SEMANTICO_V63
        : null
    },
    {
      etapa: 'Gemini — robustez',
      nome: 'TESTAR_ROBUSTEZ_GEMINI_V63',
      fn: typeof TESTAR_ROBUSTEZ_GEMINI_V63 === 'function'
        ? TESTAR_ROBUSTEZ_GEMINI_V63
        : null
    },
    {
      etapa: 'Gemini — retry HTTP',
      nome: 'TESTAR_RETRY_HTTP_GEMINI_V63',
      fn: typeof TESTAR_RETRY_HTTP_GEMINI_V63 === 'function'
        ? TESTAR_RETRY_HTTP_GEMINI_V63
        : null
    },
    {
      etapa: 'Gemini — fluxo completo',
      nome: 'TESTAR_FLUXO_COMPLETO_GEMINI_V63',
      fn: typeof TESTAR_FLUXO_COMPLETO_GEMINI_V63 === 'function'
        ? TESTAR_FLUXO_COMPLETO_GEMINI_V63
        : null
    },
    {
      etapa: 'Soluções — reconhecimento',
      nome: 'TESTAR_RECONHECIMENTO_SOLUCOES_V63',
      fn: typeof TESTAR_RECONHECIMENTO_SOLUCOES_V63 === 'function'
        ? TESTAR_RECONHECIMENTO_SOLUCOES_V63
        : null
    },
    {
      etapa: 'Soluções — biblioteca',
      nome: 'TESTAR_BIBLIOTECA_RESOLUCOES_V63',
      fn: typeof TESTAR_BIBLIOTECA_RESOLUCOES_V63 === 'function'
        ? TESTAR_BIBLIOTECA_RESOLUCOES_V63
        : null
    },
    {
      etapa: 'Soluções — falso positivo',
      nome: 'TESTAR_FALSO_POSITIVO_SEMANTICO_V63',
      fn: typeof TESTAR_FALSO_POSITIVO_SEMANTICO_V63 === 'function'
        ? TESTAR_FALSO_POSITIVO_SEMANTICO_V63
        : null
    },
    {
      etapa: 'Soluções — ranking',
      nome: 'TESTAR_RANKING_SOLUCOES_COMPATIVEIS_V63',
      fn: typeof TESTAR_RANKING_SOLUCOES_COMPATIVEIS_V63 === 'function'
        ? TESTAR_RANKING_SOLUCOES_COMPATIVEIS_V63
        : null
    },
    {
      etapa: 'Soluções — paráfrase',
      nome: 'TESTAR_RECONHECIMENTO_POR_PARAFRASE_V63',
      fn: typeof TESTAR_RECONHECIMENTO_POR_PARAFRASE_V63 === 'function'
        ? TESTAR_RECONHECIMENTO_POR_PARAFRASE_V63
        : null
    },
    {
      etapa: 'Soluções — empate',
      nome: 'TESTAR_EMPATE_SOLUCOES_V63',
      fn: typeof TESTAR_EMPATE_SOLUCOES_V63 === 'function'
        ? TESTAR_EMPATE_SOLUCOES_V63
        : null
    },
    {
      etapa: 'Soluções — compatibilidade parcial',
      nome: 'TESTAR_SOLUCAO_PARCIALMENTE_COMPATIVEL_V63',
      fn: typeof TESTAR_SOLUCAO_PARCIALMENTE_COMPATIVEL_V63 === 'function'
        ? TESTAR_SOLUCAO_PARCIALMENTE_COMPATIVEL_V63
        : null
    },
    {
      etapa: 'Soluções — ruído',
      nome: 'TESTAR_RUIDO_NO_CATALOGO_V63',
      fn: typeof TESTAR_RUIDO_NO_CATALOGO_V63 === 'function'
        ? TESTAR_RUIDO_NO_CATALOGO_V63
        : null
    },
    {
      etapa: 'Soluções — múltiplas',
      nome: 'TESTAR_CATALOGO_COM_MULTIPLAS_SOLUCOES_V63',
      fn: typeof TESTAR_CATALOGO_COM_MULTIPLAS_SOLUCOES_V63 === 'function'
        ? TESTAR_CATALOGO_COM_MULTIPLAS_SOLUCOES_V63
        : null
    },
    {
      etapa: 'Soluções — estabilidade',
      nome: 'TESTAR_ESCALA_SEMELHANCA_ESTABILIDADE_V63',
      fn: typeof TESTAR_ESCALA_SEMELHANCA_ESTABILIDADE_V63 === 'function'
        ? TESTAR_ESCALA_SEMELHANCA_ESTABILIDADE_V63
        : null
    },
    {
      etapa: 'Soluções — quase idênticas',
      nome: 'TESTAR_CONCORRENCIA_SOLUCOES_QUASE_IDENTICAS_V63',
      fn: typeof TESTAR_CONCORRENCIA_SOLUCOES_QUASE_IDENTICAS_V63 === 'function'
        ? TESTAR_CONCORRENCIA_SOLUCOES_QUASE_IDENTICAS_V63
        : null
    },
    {
      etapa: 'Soluções — catálogo misto',
      nome: 'TESTAR_CATALOGO_MISTO_PRODUCAO_V63',
      fn: typeof TESTAR_CATALOGO_MISTO_PRODUCAO_V63 === 'function'
        ? TESTAR_CATALOGO_MISTO_PRODUCAO_V63
        : null
    },
    {
      etapa: 'Soluções — investigação por paráfrase',
      nome: 'TESTAR_INVESTIGACAO_REAL_PARAFRASE_V63',
      fn: typeof TESTAR_INVESTIGACAO_REAL_PARAFRASE_V63 === 'function'
        ? TESTAR_INVESTIGACAO_REAL_PARAFRASE_V63
        : null
    },
    {
      etapa: 'Soluções — bloqueio incompleto',
      nome: 'TESTAR_BLOQUEIO_RECONHECIMENTO_INCOMPLETO_V63',
      fn: typeof TESTAR_BLOQUEIO_RECONHECIMENTO_INCOMPLETO_V63 === 'function'
        ? TESTAR_BLOQUEIO_RECONHECIMENTO_INCOMPLETO_V63
        : null
    },
    {
      etapa: 'Integração semântica → biblioteca',
      nome: 'TESTAR_INTEGRACAO_SEMANTICA_BIBLIOTECA_V63',
      fn: typeof TESTAR_INTEGRACAO_SEMANTICA_BIBLIOTECA_V63 === 'function'
        ? TESTAR_INTEGRACAO_SEMANTICA_BIBLIOTECA_V63
        : null
    },
    {
      etapa: 'Integração — ciclo',
      nome: 'TESTAR_INTEGRACAO_CICLO_V63',
      fn: typeof TESTAR_INTEGRACAO_CICLO_V63 === 'function'
        ? TESTAR_INTEGRACAO_CICLO_V63
        : null
    },
    {
      etapa: 'Integração — sem solução',
      nome: 'TESTAR_CENARIO_SEM_SOLUCAO_V63',
      fn: typeof TESTAR_CENARIO_SEM_SOLUCAO_V63 === 'function'
        ? TESTAR_CENARIO_SEM_SOLUCAO_V63
        : null
    },
    {
      etapa: 'Integração — múltiplas soluções',
      nome: 'TESTAR_CENARIO_MULTIPLAS_SOLUCOES_V63',
      fn: typeof TESTAR_CENARIO_MULTIPLAS_SOLUCOES_V63 === 'function'
        ? TESTAR_CENARIO_MULTIPLAS_SOLUCOES_V63
        : null
    },
    {
      etapa: 'Integração — informação incompleta',
      nome: 'TESTAR_CENARIO_INFORMACAO_INCOMPLETA_V63',
      fn: typeof TESTAR_CENARIO_INFORMACAO_INCOMPLETA_V63 === 'function'
        ? TESTAR_CENARIO_INFORMACAO_INCOMPLETA_V63
        : null
    },
    {
      etapa: 'Integração — solução incompatível',
      nome: 'TESTAR_SOLUCAO_NAO_COMPATIVEL_V63',
      fn: typeof TESTAR_SOLUCAO_NAO_COMPATIVEL_V63 === 'function'
        ? TESTAR_SOLUCAO_NAO_COMPATIVEL_V63
        : null
    },
    {
      etapa: 'Decisão V6.3',
      nome: 'TESTAR_DECISAO_V63',
      fn: typeof TESTAR_DECISAO_V63 === 'function'
        ? TESTAR_DECISAO_V63
        : null
    },
    {
      etapa: 'Resposta segura',
      nome: 'TESTAR_RESPOSTA_SEGURA_V63',
      fn: typeof TESTAR_RESPOSTA_SEGURA_V63 === 'function'
        ? TESTAR_RESPOSTA_SEGURA_V63
        : null
    },
    {
      etapa: 'Ponte de integração',
      nome: 'TESTAR_PONTE_INTEGRACAO_V63',
      fn: typeof TESTAR_PONTE_INTEGRACAO_V63 === 'function'
        ? TESTAR_PONTE_INTEGRACAO_V63
        : null
    },
    {
      etapa: 'Triagem',
      nome: 'TESTAR_TRIAGEM_V1_CASO_01_',
      fn: typeof TESTAR_TRIAGEM_V1_CASO_01_ === 'function'
        ? TESTAR_TRIAGEM_V1_CASO_01_
        : null
    },
    {
      etapa: 'Triagem — compatibilidade',
      nome: 'TESTAR_MOTOR_COMPATIBILIDADE_V1',
      fn: typeof TESTAR_MOTOR_COMPATIBILIDADE_V1 === 'function'
        ? TESTAR_MOTOR_COMPATIBILIDADE_V1
        : null
    },
    {
      etapa: 'Triagem — integração',
      nome: 'TESTAR_INTEGRACAO_TRIAGEM_V1',
      fn: typeof TESTAR_INTEGRACAO_TRIAGEM_V1 === 'function'
        ? TESTAR_INTEGRACAO_TRIAGEM_V1
        : null
    },
    {
      etapa: 'Triagem — payload Gemini',
      nome: 'TESTAR_PAYLOAD_DIAGNOSTICO_GEMINI_V1',
      fn: typeof TESTAR_PAYLOAD_DIAGNOSTICO_GEMINI_V1 === 'function'
        ? TESTAR_PAYLOAD_DIAGNOSTICO_GEMINI_V1
        : null
    },
    {
      etapa: 'Investigação V6.2',
      nome: 'TESTAR_MOTOR_INVESTIGACAO_V62',
      fn: typeof TESTAR_MOTOR_INVESTIGACAO_V62 === 'function'
        ? TESTAR_MOTOR_INVESTIGACAO_V62
        : null
    },
    {
      etapa: 'Investigação — integração',
      nome: 'TESTAR_INTEGRACAO_REAL_V62',
      fn: typeof TESTAR_INTEGRACAO_REAL_V62 === 'function'
        ? TESTAR_INTEGRACAO_REAL_V62
        : null
    },
    {
      etapa: 'Investigação — persistência',
      nome: 'TESTAR_PERSISTENCIA_INVESTIGACAO_V621',
      fn: typeof TESTAR_PERSISTENCIA_INVESTIGACAO_V621 === 'function'
        ? TESTAR_PERSISTENCIA_INVESTIGACAO_V621
        : null
    },
    {
      etapa: 'Investigação — integração V6.2.2',
      nome: 'TESTAR_INTEGRACAO_V622',
      fn: typeof TESTAR_INTEGRACAO_V622 === 'function'
        ? TESTAR_INTEGRACAO_V622
        : null
    },
    {
      etapa: 'Aprendizado V6.3',
      nome: 'TESTAR_CICLO_APRENDIZADO_V63',
      fn: typeof TESTAR_CICLO_APRENDIZADO_V63 === 'function'
        ? TESTAR_CICLO_APRENDIZADO_V63
        : null
    },
    {
      etapa: 'Aprendizado — fluxo',
      nome: 'TESTAR_INTEGRACAO_APRENDIZADO_FLUXO_V63',
      fn: typeof TESTAR_INTEGRACAO_APRENDIZADO_FLUXO_V63 === 'function'
        ? TESTAR_INTEGRACAO_APRENDIZADO_FLUXO_V63
        : null
    },
    {
      etapa: 'Aprendizado — fechamento',
      nome: 'TESTAR_FECHAMENTO_CICLO_APRENDIZADO_V63',
      fn: typeof TESTAR_FECHAMENTO_CICLO_APRENDIZADO_V63 === 'function'
        ? TESTAR_FECHAMENTO_CICLO_APRENDIZADO_V63
        : null
    },
    {
      etapa: 'Resultado real — entrada',
      nome: 'TESTAR_ENTRADA_RESULTADO_REAL_V63',
      fn: typeof TESTAR_ENTRADA_RESULTADO_REAL_V63 === 'function'
        ? TESTAR_ENTRADA_RESULTADO_REAL_V63
        : null
    },
    {
      etapa: 'Resultado real — fluxo principal',
      nome: 'TESTAR_RESULTADO_REAL_FLUXO_PRINCIPAL_V63',
      fn: typeof TESTAR_RESULTADO_REAL_FLUXO_PRINCIPAL_V63 === 'function'
        ? TESTAR_RESULTADO_REAL_FLUXO_PRINCIPAL_V63
        : null
    },
    {
      etapa: 'Fluxo principal — adaptador',
      nome: 'TESTAR_ADAPTADOR_FLUXO_PRINCIPAL_V63',
      fn: typeof TESTAR_ADAPTADOR_FLUXO_PRINCIPAL_V63 === 'function'
        ? TESTAR_ADAPTADOR_FLUXO_PRINCIPAL_V63
        : null
    },
    {
      etapa: 'Fluxo principal — real',
      nome: 'TESTAR_FLUXO_PRINCIPAL_REAL_V63',
      fn: typeof TESTAR_FLUXO_PRINCIPAL_REAL_V63 === 'function'
        ? TESTAR_FLUXO_PRINCIPAL_REAL_V63
        : null
    }
  ];;
}

function TESTAR_ACEITACAO_FINAL_V63() {

  /*
   * A aceitação agora é retomável.
   *
   * Primeira execução:
   *   começa no teste 1.
   *
   * Execuções seguintes:
   *   continuam do próximo teste.
   *
   * Para reiniciar do zero:
   *   TESTAR_ACEITACAO_FINAL_V63_RESETAR()
   */

  return TESTAR_ACEITACAO_FINAL_V63_CONTINUAR();
}
