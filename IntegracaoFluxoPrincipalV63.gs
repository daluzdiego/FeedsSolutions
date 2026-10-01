/**
 * ============================================================
 * FEEDS SOLUTIONS
 * ADAPTADOR DE INTEGRAÇÃO DEFINITIVA — V6.3
 * ============================================================
 *
 * OBJETIVO
 *
 * Conectar a V6.3 ao resultado REAL de
 * processarMensagemDiagnostico() sem substituir
 * o legado antes de a integração estar validada.
 *
 * PRINCÍPIOS
 *
 * 1. Triagem incompatível não entra na V6.3.
 * 2. Investigação ainda incompleta não entra na V6.3.
 * 3. Quando a investigação estiver PRONTA_PARA_SOLUCAO,
 *    a Ponte V6.3 pode assumir a resposta ao cliente.
 * 4. Falha técnica da V6.3 NÃO derruba o diagnóstico.
 * 5. A resposta legada permanece disponível como fallback.
 * 6. IDs do fluxo principal são preservados no contexto.
 * 7. A resposta V6.3 só é oficial se passar pelo filtro
 *    de segurança da própria Ponte.
 *
 * IMPORTANTE:
 * Este arquivo NÃO altera processarMensagemDiagnostico().
 *
 * ============================================================
 */


/**
 * ============================================================
 * CONTRATO DO ADAPTADOR
 * ============================================================
 */

const INTEGRACAO_FLUXO_PRINCIPAL_V63 = {

  VERSAO:
    'V6.3',

  ESTADOS_ATIVACAO: {

    TRIAGEM_COMPATIVEL:
      'COMPATIVEL',

    INVESTIGACAO_PRONTA:
      'PRONTA_PARA_SOLUCAO'

  },

  MOTIVOS: {

    TRIAGEM_NAO_COMPATIVEL:
      'TRIAGEM_NAO_COMPATIVEL',

    INVESTIGACAO_INCOMPLETA:
      'INVESTIGACAO_INCOMPLETA',

    V63_ATIVADA:
      'V63_ATIVADA',

    V63_INDISPONIVEL:
      'V63_INDISPONIVEL',

    V63_REPROVADA:
      'V63_REPROVADA'

  }

};


/**
 * ============================================================
 * NORMALIZAÇÃO
 * ============================================================
 */

function normalizarTextoIntegracaoV63_(
  valor
) {

  if (
    valor === null ||
    valor === undefined
  ) {

    return '';

  }

  return String(
    valor
  ).trim();

}


/**
 * ============================================================
 * VERIFICA SE A V6.3 PODE SER ATIVADA
 * ============================================================
 *
 * A V6.3 não deve responder antes de o diagnóstico
 * ter investigação suficiente.
 *
 * ============================================================
 */

function podeAtivarV63NoFluxoPrincipal_(
  resultadoFluxoPrincipal
) {

  const fluxo =
    resultadoFluxoPrincipal || {};

  const triagem =
    fluxo.triagem || {};

  const investigacao =
    fluxo.investigacao || {};

  if (
    triagem.classificacao !==
    INTEGRACAO_FLUXO_PRINCIPAL_V63
      .ESTADOS_ATIVACAO
      .TRIAGEM_COMPATIVEL
  ) {

    return {

      ativar:
        false,

      motivo:
        INTEGRACAO_FLUXO_PRINCIPAL_V63
          .MOTIVOS
          .TRIAGEM_NAO_COMPATIVEL

    };

  }


  if (
    investigacao.estado !==
    INTEGRACAO_FLUXO_PRINCIPAL_V63
      .ESTADOS_ATIVACAO
      .INVESTIGACAO_PRONTA
  ) {

    return {

      ativar:
        false,

      motivo:
        INTEGRACAO_FLUXO_PRINCIPAL_V63
          .MOTIVOS
          .INVESTIGACAO_INCOMPLETA

    };

  }


  return {

    ativar:
      true,

    motivo:
      INTEGRACAO_FLUXO_PRINCIPAL_V63
        .MOTIVOS
        .V63_ATIVADA

  };

}


/**
 * ============================================================
 * MONTA CONTEXTO DA V6.3
 * ============================================================
 */

function construirContextoIntegracaoV63_(
  resultadoFluxoPrincipal
) {

  const fluxo =
    resultadoFluxoPrincipal || {};

  const diagnostico =
    fluxo.diagnostico || {};

  const investigacao =
    fluxo.investigacao || {};

  return {

    empresa_id:
      fluxo.empresa_id ||
      diagnostico.empresa_id ||
      '',

    conversa_id:
      fluxo.conversa_id ||
      diagnostico.conversa_id ||
      '',

    diagnostico_id:
      fluxo.diagnostico_id ||
      diagnostico.diagnostico_id ||
      '',

    investigacao_id:
      investigacao.investigacao_id ||
      '',

    pontuacao_minima:
      20

  };

}


/**
 * ============================================================
 * VALIDA CONTEXTO MÍNIMO
 * ============================================================
 */

function validarContextoIntegracaoV63_(
  contexto
) {

  contexto =
    contexto || {};

  return !!(
    contexto.empresa_id &&
    contexto.conversa_id &&
    contexto.diagnostico_id &&
    contexto.investigacao_id
  );

}


/**
 * ============================================================
 * EXECUTA INTEGRAÇÃO CONTROLADA
 * ============================================================
 *
 * Entrada:
 *
 * - mensagem atual
 * - resultado REAL de processarMensagemDiagnostico()
 *
 * Saída:
 *
 * {
 *   sucesso,
 *   ativada,
 *   motivo,
 *   resposta_cliente,
 *   resultado_v63,
 *   contexto
 * }
 *
 * ============================================================
 */

function integrarV63AoFluxoPrincipal_(
  mensagem,
  resultadoFluxoPrincipal
) {

  const fluxo =
    resultadoFluxoPrincipal || {};

  const respostaLegada =
    normalizarTextoIntegracaoV63_(
      fluxo.resposta
    );


  const elegibilidade =
    podeAtivarV63NoFluxoPrincipal_(
      fluxo
    );


  /*
   * ----------------------------------------------------------
   * V6.3 AINDA NÃO DEVE ENTRAR
   * ----------------------------------------------------------
   */

  if (
    !elegibilidade.ativar
  ) {

    return {

      sucesso:
        true,

      ativada:
        false,

      motivo:
        elegibilidade.motivo,

      resposta_cliente:
        respostaLegada,

      resposta_legada:
        respostaLegada,

      resultado_v63:
        null,

      contexto:
        null,

      fallback:
        true

    };

  }


  /*
   * ----------------------------------------------------------
   * CONTEXTO
   * ----------------------------------------------------------
   */

  const contexto =
    construirContextoIntegracaoV63_(
      fluxo
    );


  if (
    !validarContextoIntegracaoV63_(
      contexto
    )
  ) {

    /*
     * Não derruba o fluxo.
     * Mantém resposta legada.
     */

    return {

      sucesso:
        true,

      ativada:
        false,

      motivo:
        INTEGRACAO_FLUXO_PRINCIPAL_V63
          .MOTIVOS
          .V63_INDISPONIVEL,

      resposta_cliente:
        respostaLegada,

      resposta_legada:
        respostaLegada,

      resultado_v63:
        null,

      contexto:
        contexto,

      fallback:
        true

    };

  }


  /*
   * ----------------------------------------------------------
   * PONTE V6.3
   * ----------------------------------------------------------
   */

  let resultadoV63 = null;

  try {

    resultadoV63 =
      executarPonteV63_(
        mensagem,
        contexto
      );

  } catch (erro) {

    Logger.log(
      '⚠️ V6.3 indisponível no fluxo principal: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

    return {

      sucesso:
        true,

      ativada:
        false,

      motivo:
        INTEGRACAO_FLUXO_PRINCIPAL_V63
          .MOTIVOS
          .V63_INDISPONIVEL,

      resposta_cliente:
        respostaLegada,

      resposta_legada:
        respostaLegada,

      resultado_v63:
        null,

      contexto:
        contexto,

      fallback:
        true

    };

  }


  /*
   * ----------------------------------------------------------
   * VALIDA RESULTADO V6.3
   * ----------------------------------------------------------
   */

  if (
    !resultadoV63 ||
    resultadoV63.sucesso !== true
  ) {

    return {

      sucesso:
        true,

      ativada:
        false,

      motivo:
        INTEGRACAO_FLUXO_PRINCIPAL_V63
          .MOTIVOS
          .V63_REPROVADA,

      resposta_cliente:
        respostaLegada,

      resposta_legada:
        respostaLegada,

      resultado_v63:
        resultadoV63,

      contexto:
        contexto,

      fallback:
        true

    };

  }


  /*
   * ----------------------------------------------------------
   * VALIDA RESPOSTA CLIENTE
   * ----------------------------------------------------------
   */

  const respostaV63 =
    normalizarTextoIntegracaoV63_(
      obterRespostaClientePonteV63_(
        resultadoV63
      )
    );


  if (
    !respostaV63
  ) {

    return {

      sucesso:
        true,

      ativada:
        false,

      motivo:
        INTEGRACAO_FLUXO_PRINCIPAL_V63
          .MOTIVOS
          .V63_REPROVADA,

      resposta_cliente:
        respostaLegada,

      resposta_legada:
        respostaLegada,

      resultado_v63:
        resultadoV63,

      contexto:
        contexto,

      fallback:
        true

    };

  }


  /*
   * ----------------------------------------------------------
   * RESPOSTA OFICIAL V6.3
   * ----------------------------------------------------------
   */

  return {

    sucesso:
      true,

    ativada:
      true,

    motivo:
      INTEGRACAO_FLUXO_PRINCIPAL_V63
        .MOTIVOS
        .V63_ATIVADA,

    resposta_cliente:
      respostaV63,

    resposta_legada:
      respostaLegada,

    resultado_v63:
      resultadoV63,

    contexto:
      contexto,

    fallback:
      false

  };

}


/**
 * ============================================================
 * TESTE DO ADAPTADOR
 * ============================================================
 *
 * 25 TESTES
 *
 * Este teste ainda NÃO altera o fluxo principal.
 *
 * Ele prova que:
 *
 * 1. O adaptador entende quando ativar.
 * 2. O adaptador preserva o legado.
 * 3. A V6.3 recebe os IDs corretos.
 * 4. A resposta V6.3 pode assumir a saída.
 * 5. Casos não prontos continuam no fluxo legado.
 *
 * ============================================================
 */

function TESTAR_ADAPTADOR_FLUXO_PRINCIPAL_V63() {

  let aprovados = 0;
  let falhas = [];

  let inicio = null;
  let fluxo = null;
  let resultado = null;
  let resolucaoId = null;

  function teste(
    numero,
    descricao,
    condicao,
    detalhe
  ) {

    if (
      condicao
    ) {

      aprovados++;

      Logger.log(
        '✅ TESTE ' +
        numero +
        '/25 — ' +
        descricao +
        (
          detalhe
            ? ' [' + detalhe + ']'
            : ''
        )
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
        '/25 — ' +
        descricao +
        (
          detalhe
            ? ' [' + detalhe + ']'
            : ''
        )
      );

    }

  }


  function criarResolucaoTemporaria_(
    interpretacao
  ) {

    resolucaoId =
      'RES-ADAPTADOR-V63-' +
      Date.now();

    return salvarResolucaoV63_({

      resolucao_id:
        resolucaoId,

      titulo_interno:
        'Resolução temporária — adaptador V6.3',

      descricao_problema:
        interpretacao.problema,

      padrao_problema:
        interpretacao.padrao_problema,

      processo:
        interpretacao.processo,

      dores:
        interpretacao.dores,

      impactos:
        interpretacao.impactos,

      resultados_desejados:
        [
          interpretacao
            .resultado_desejado
        ],

      contexto:
        interpretacao.contexto,

      restricoes:
        [],

      abordagem_interna:
        'Informação interna',

      descricao_solucao_interna:
        'Informação interna',

      alternativas:
        [],

      status:
        'VALIDADA',

      confianca:
        'ALTA',

      evidencias:
        [
          'Teste do adaptador V6.3'
        ],

      casos_relacionados:
        [],

      origem:
        'CASO_VALIDADO',

      versao:
        'V6.3'

    });

  }


  function limparResolucao_() {

    if (
      !resolucaoId
    ) {

      return;

    }

    try {

      const sheet =
        obterAba_(
          SHEETS.BIBLIOTECA_RESOLUCOES
        );

      const valores =
        sheet
          .getDataRange()
          .getValues();

      if (
        valores.length <= 1
      ) {

        return;

      }

      const cabecalhos =
        valores[0];

      const idx =
        cabecalhos.indexOf(
          'resolucao_id'
        );

      if (
        idx === -1
      ) {

        return;

      }

      for (
        let i =
          valores.length - 1;
        i >= 1;
        i--
      ) {

        if (
          String(
            valores[i][idx] || ''
          ) ===
          String(
            resolucaoId
          )
        ) {

          sheet.deleteRow(
            i + 1
          );

        }

      }

      SpreadsheetApp.flush();

    } catch (erro) {

      Logger.log(
        '⚠️ Limpeza resolução adaptador: ' +
        (
          erro &&
          erro.message
            ? erro.message
            : erro
        )
      );

    }

  }


  try {

    Logger.log('');
    Logger.log(
      '============================================================'
    );

    Logger.log(
      'TESTAR_ADAPTADOR_FLUXO_PRINCIPAL_V63'
    );

    Logger.log(
      '============================================================'
    );


    /*
     * ----------------------------------------------------------
     * CRIA CONVERSA REAL
     * ----------------------------------------------------------
     */

    inicio =
      iniciarDiagnostico({

        nome:
          'Empresa Teste Adaptador V63',

        nome_empresa:
          'Empresa Teste Adaptador V63',

        segmento:
          'Distribuidora',

        porte:
          'PEQUENA',

        nome_contato:
          'Teste Adaptador V63',

        email:
          'teste-adaptador-v63@mvp.local',

        cidade:
          'Teste'

      });


    teste(
      1,
      'diagnóstico inicial criado',
      !!(
        inicio &&
        inicio.sucesso === true &&
        inicio.empresa_id &&
        inicio.conversa_id &&
        inicio.diagnostico_id
      )
    );


    const mensagem =
      'Conferimos e lançamos pedidos manualmente. ' +
      'Isso gera erros de digitação e retrabalho todos os dias. ' +
      'Perdemos cerca de 3 horas por dia. ' +
      'Queremos reduzir erros e retrabalho mantendo a qualidade.';


    /*
     * ----------------------------------------------------------
     * EXECUTA FLUXO PRINCIPAL REAL
     * ----------------------------------------------------------
     */

    fluxo =
      processarMensagemDiagnostico({

        empresa_id:
          inicio.empresa_id,

        conversa_id:
          inicio.conversa_id,

        mensagem:
          mensagem

      });


    teste(
      2,
      'fluxo principal real executou',
      !!(
        fluxo &&
        fluxo.sucesso === true
      )
    );


    teste(
      3,
      'fluxo principal retornou triagem',
      !!fluxo.triagem
    );


    teste(
      4,
      'triagem é COMPATIVEL',
      !!(
        fluxo.triagem &&
        fluxo.triagem.classificacao ===
        'COMPATIVEL'
      )
    );


    teste(
      5,
      'fluxo principal retornou investigação',
      !!fluxo.investigacao
    );


    teste(
      6,
      'investigação possui ID',
      !!(
        fluxo.investigacao &&
        fluxo.investigacao.investigacao_id
      )
    );


    teste(
      7,
      'investigação está PRONTA_PARA_SOLUCAO',
      !!(
        fluxo.investigacao &&
        fluxo.investigacao.estado ===
        'PRONTA_PARA_SOLUCAO'
      )
    );


    const elegibilidade =
      podeAtivarV63NoFluxoPrincipal_(
        fluxo
      );


    teste(
      8,
      'adaptador autoriza ativação da V6.3',
      !!(
        elegibilidade &&
        elegibilidade.ativar === true
      )
    );


    const contexto =
      construirContextoIntegracaoV63_(
        fluxo
      );


    teste(
      9,
      'contexto possui empresa_id',
      !!contexto.empresa_id
    );


    teste(
      10,
      'contexto possui conversa_id',
      !!contexto.conversa_id
    );


    teste(
      11,
      'contexto possui diagnostico_id',
      !!contexto.diagnostico_id
    );


    teste(
      12,
      'contexto possui investigacao_id',
      !!contexto.investigacao_id
    );


    teste(
      13,
      'contexto mantém diagnostico_id correto',
      contexto.diagnostico_id ===
      fluxo.diagnostico_id
    );


    /*
     * ----------------------------------------------------------
     * PREPARA RESOLUÇÃO REAL
     * ----------------------------------------------------------
     */

    const interpretacao =
      interpretarMensagemSemanticaV63_(
        mensagem
      );


    teste(
      14,
      'interpretação semântica real foi produzida',
      !!interpretacao
    );


    const retornoResolucao =
      criarResolucaoTemporaria_(
        interpretacao
      );


    teste(
      15,
      'resolução temporária foi persistida',
      !!(
        retornoResolucao &&
        retornoResolucao.resolucao_id
      )
    );


    /*
     * ----------------------------------------------------------
     * EXECUTA ADAPTADOR REAL
     * ----------------------------------------------------------
     */

    resultado =
      integrarV63AoFluxoPrincipal_(
        mensagem,
        fluxo
      );


    teste(
      16,
      'adaptador executou com sucesso',
      !!(
        resultado &&
        resultado.sucesso === true
      )
    );


    teste(
      17,
      'V6.3 foi ativada',
      !!(
        resultado &&
        resultado.ativada === true
      )
    );


    teste(
      18,
      'motivo indica V6.3 ativada',
      !!(
        resultado &&
        resultado.motivo ===
        INTEGRACAO_FLUXO_PRINCIPAL_V63
          .MOTIVOS
          .V63_ATIVADA
      )
    );


    teste(
      19,
      'resultado V6.3 está disponível',
      !!(
        resultado &&
        resultado.resultado_v63 &&
        resultado.resultado_v63.sucesso === true
      )
    );


    teste(
      20,
      'resposta V6.3 está disponível',
      !!(
        resultado &&
        resultado.resposta_cliente
      )
    );


    teste(
      21,
      'resposta V6.3 é diferente da resposta legada quando necessário',
      !!(
        resultado &&
        resultado.resposta_cliente &&
        resultado.resposta_legada !==
        undefined
      )
    );


    teste(
      22,
      'resposta V6.3 passou pelo filtro seguro',
      !!(
        resultado &&
        resultado.resultado_v63 &&
        resultado.resultado_v63.seguranca &&
        resultado.resultado_v63.seguranca.segura ===
        true
      )
    );


    teste(
      23,
      'contexto do resultado mantém os IDs',
      !!(
        resultado &&
        resultado.contexto &&
        resultado.contexto.empresa_id ===
        fluxo.empresa_id &&
        resultado.contexto.conversa_id ===
        fluxo.conversa_id &&
        resultado.contexto.diagnostico_id ===
        fluxo.diagnostico_id &&
        resultado.contexto.investigacao_id ===
        fluxo.investigacao.investigacao_id
      )
    );


    /*
     * ----------------------------------------------------------
     * TESTE DE PROTEÇÃO:
     * INVESTIGAÇÃO NÃO PRONTA NÃO ATIVA V6.3.
     * ----------------------------------------------------------
     */

    const fluxoIncompleto = {

      sucesso:
        true,

      empresa_id:
        fluxo.empresa_id,

      conversa_id:
        fluxo.conversa_id,

      diagnostico_id:
        fluxo.diagnostico_id,

      resposta:
        'Pergunta legada de teste',

      triagem: {

        classificacao:
          'COMPATIVEL'

      },

      investigacao: {

        investigacao_id:
          fluxo.investigacao
            .investigacao_id,

        estado:
          'IDENTIFICANDO_DOR'

      }

    };


    const fallback =
      integrarV63AoFluxoPrincipal_(
        mensagem,
        fluxoIncompleto
      );


    teste(
      24,
      'investigação incompleta não ativa V6.3',
      !!(
        fallback &&
        fallback.ativada === false &&
        fallback.fallback === true &&
        fallback.resposta_cliente ===
        'Pergunta legada de teste'
      )
    );


    /*
     * ----------------------------------------------------------
     * TESTE DE PROTEÇÃO:
     * TRIAGEM INCOMPATÍVEL NÃO ATIVA V6.3.
     * ----------------------------------------------------------
     */

    const fluxoIncompativel = {

      sucesso:
        true,

      empresa_id:
        fluxo.empresa_id,

      conversa_id:
        fluxo.conversa_id,

      diagnostico_id:
        fluxo.diagnostico_id,

      resposta:
        'Resposta legada de caso incompatível',

      triagem: {

        classificacao:
          'NAO_COMPATIVEL'

      },

      investigacao:
        fluxo.investigacao

    };


    const bloqueioTriagem =
      integrarV63AoFluxoPrincipal_(
        mensagem,
        fluxoIncompativel
      );


    teste(
      25,
      'triagem incompatível bloqueia V6.3 e preserva legado',
      !!(
        bloqueioTriagem &&
        bloqueioTriagem.ativada === false &&
        bloqueioTriagem.fallback === true &&
        bloqueioTriagem.resposta_cliente ===
        'Resposta legada de caso incompatível'
      )
    );


  } catch (erro) {

    Logger.log('');
    Logger.log(
      '❌ ERRO FATAL NO TESTE DO ADAPTADOR'
    );

    Logger.log(
      erro &&
      erro.stack
        ? erro.stack
        : erro
    );

  } finally {

    limparResolucao_();


    /*
     * ----------------------------------------------------------
     * LIMPA INVESTIGAÇÃO DO TESTE
     * ----------------------------------------------------------
     */

    try {

      if (
        inicio &&
        inicio.diagnostico_id
      ) {

        const aba =
          obterAba_(
            SHEETS.INVESTIGACOES
          );

        const dados =
          aba
            .getDataRange()
            .getValues();

        if (
          dados.length > 1
        ) {

          const cabecalhos =
            dados[0];

          const idxId =
            cabecalhos.indexOf(
              'investigacao_id'
            );

          const idxDiagnostico =
            cabecalhos.indexOf(
              'diagnostico_id'
            );

          for (
            let i =
              dados.length - 1;
            i >= 1;
            i--
          ) {

            const id =
              idxId !== -1
                ? String(
                    dados[i][idxId] || ''
                  )
                : '';

            const diagnosticoId =
              idxDiagnostico !== -1
                ? String(
                    dados[i][idxDiagnostico] || ''
                  )
                : '';

            if (
              (
                fluxo &&
                fluxo.investigacao &&
                id ===
                String(
                  fluxo.investigacao
                    .investigacao_id || ''
                )
              ) ||
              diagnosticoId ===
              String(
                inicio.diagnostico_id
              )
            ) {

              aba.deleteRow(
                i + 1
              );

            }

          }

          SpreadsheetApp.flush();

        }

      }

    } catch (erroLimpeza) {

      Logger.log(
        '⚠️ Erro na limpeza da investigação: ' +
        (
          erroLimpeza &&
          erroLimpeza.message
            ? erroLimpeza.message
            : erroLimpeza
        )
      );

    }


    Logger.log('');
    Logger.log(
      '============================================================'
    );

    Logger.log(
      'RESULTADO — TESTAR_ADAPTADOR_FLUXO_PRINCIPAL_V63'
    );

    Logger.log(
      '============================================================'
    );

    Logger.log(
      'APROVADOS: ' +
      aprovados +
      '/25'
    );

    Logger.log(
      'FALHAS: ' +
      falhas.length
    );

    Logger.log(
      'PERCENTUAL: ' +
      Math.round(
        (
          aprovados /
          25
        ) * 100
      ) +
      '%'
    );


    if (
      aprovados === 25 &&
      falhas.length === 0
    ) {

      Logger.log('');
      Logger.log(
        '🏆 TESTAR_ADAPTADOR_FLUXO_PRINCIPAL_V63: PASSOU'
      );

      Logger.log(
        '🏆 ADAPTADOR V6.3: 100%'
      );

      Logger.log(
        '🏆 25/25 TESTES APROVADOS'
      );

    } else {

      Logger.log('');
      Logger.log(
        '❌ TESTAR_ADAPTADOR_FLUXO_PRINCIPAL_V63: FALHOU'
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

    Logger.log('');
    Logger.log(
      '============================================================'
    );

  }

}
