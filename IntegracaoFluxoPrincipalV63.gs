/**
 * ============================================================
 * FEEDS SOLUTIONS
 * INTEGRAÇÃO DO FLUXO PRINCIPAL + V6.3
 * ============================================================
 *
 * TESTE CONTROLADO:
 *
 * processarMensagemDiagnostico()
 *        ↓
 * Diagnóstico / Triagem / Investigação / V5.x
 *        ↓
 * Ponte V6.3
 *        ↓
 * Interpretação / Reconhecimento / Decisão / Resposta Segura
 *
 * IMPORTANTE:
 * - NÃO altera processarMensagemDiagnostico().
 * - NÃO substitui a resposta atual.
 * - Usa o fluxo principal REAL.
 * - Usa a Ponte V6.3 REAL.
 * - Usa persistência REAL.
 * - Usa Gemini REAL.
 * - Exige 25/25 para aprovação.
 * ============================================================
 */

function TESTAR_INTEGRACAO_FLUXO_PRINCIPAL_V63() {

  const total = 25;
  let aprovados = 0;
  const falhas = [];

  let inicio = null;
  let resultadoFluxo = null;
  let diagnostico = null;
  let triagem = null;
  let investigacao = null;
  let investigacaoPersistida = null;
  let resultadoV63 = null;
  let resolucaoId = null;

  function teste(numero, descricao, condicao, detalhe) {

    if (condicao) {

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


  function prepararCatalogoV595_() {

    const abaSolucoes =
      obterAba_(
        SHEETS.SOLUCOES
      );

    const dados =
      abaSolucoes
        .getDataRange()
        .getValues();

    if (!dados.length) {
      throw new Error(
        'Aba SOLUCOES sem cabeçalho.'
      );
    }

    const cabecalhos =
      dados[0];

    const mapa = {};

    cabecalhos.forEach(
      function(cabecalho, indice) {

        mapa[cabecalho] =
          indice;

      }
    );


    /*
     * Limpa qualquer fixture V5.9.5
     * deixada por execução anterior.
     */

    for (
      let i = dados.length - 1;
      i >= 1;
      i--
    ) {

      const id =
        String(
          dados[i][
            mapa.solucao_id
          ] || ''
        ).trim();

      if (
        id.indexOf('V595-FLUXO-V63-') === 0
      ) {

        abaSolucoes.deleteRow(
          i + 1
        );

      }

    }


    const marcador =
      'V595-FLUXO-V63-' +
      Date.now();


    const solucoesTeste = [

      {
        solucao_id:
          marcador + '-PERFEITA',

        familia:
          'Automação de pedidos',

        nome:
          'Conferir e lançar pedidos',

        descricao:
          'Reduzir erros de digitação e retrabalho no processo de conferir e lançar pedidos.',

        status:
          'ATIVA',

        nivel_complexidade:
          'MEDIA',

        repetibilidade:
          'ALTA',

        pode_oferecer:
          'SIM',

        versao:
          'V5.9.5'

      },

      {
        solucao_id:
          marcador + '-PARCIAL',

        familia:
          'Processos administrativos',

        nome:
          'Apoio para conferir pedidos',

        descricao:
          'Apoio na conferência de pedidos e identificação de informações administrativas.',

        status:
          'ATIVA',

        nivel_complexidade:
          'MEDIA',

        repetibilidade:
          'ALTA',

        pode_oferecer:
          'SIM',

        versao:
          'V5.9.5'

      },

      {
        solucao_id:
          marcador + '-INCOMPATIVEL',

        familia:
          'Marketing',

        nome:
          'Gestão de redes sociais',

        descricao:
          'Planejamento e publicação de conteúdo para redes sociais.',

        status:
          'ATIVA',

        nivel_complexidade:
          'MEDIA',

        repetibilidade:
          'ALTA',

        pode_oferecer:
          'SIM',

        versao:
          'V5.9.5'

      },

      {
        solucao_id:
          marcador + '-INATIVA',

        familia:
          'Automação de pedidos',

        nome:
          'Conferir e lançar pedidos',

        descricao:
          'Reduzir erros de digitação e retrabalho no processo de conferir e lançar pedidos.',

        status:
          'INATIVA',

        nivel_complexidade:
          'MEDIA',

        repetibilidade:
          'ALTA',

        pode_oferecer:
          'SIM',

        versao:
          'V5.9.5'

      }

    ];


    solucoesTeste.forEach(
      function(solucao) {

        const linha =
          new Array(
            cabecalhos.length
          ).fill('');

        Object.keys(
          solucao
        ).forEach(
          function(campo) {

            if (
              Object.prototype
                .hasOwnProperty.call(
                  mapa,
                  campo
                )
            ) {

              linha[
                mapa[campo]
              ] =
                solucao[campo];

            }

          }
        );

        abaSolucoes.appendRow(
          linha
        );

      }
    );

    SpreadsheetApp.flush();

    Logger.log(
      'CATÁLOGO V5.9.5 TEMPORÁRIO: 4 soluções preparadas.'
    );

  }


  function limparCatalogoV595_() {

    try {

      const abaSolucoes =
        obterAba_(
          SHEETS.SOLUCOES
        );

      const dados =
        abaSolucoes
          .getDataRange()
          .getValues();

      if (dados.length <= 1) {
        return;
      }

      const cabecalhos =
        dados[0];

      const idxId =
        cabecalhos.indexOf(
          'solucao_id'
        );

      if (idxId === -1) {
        return;
      }

      for (
        let i = dados.length - 1;
        i >= 1;
        i--
      ) {

        const id =
          String(
            dados[i][idxId] || ''
          ).trim();

        if (
          id.indexOf('V595-FLUXO-V63-') === 0
        ) {

          abaSolucoes.deleteRow(
            i + 1
          );

        }

      }

      SpreadsheetApp.flush();

      Logger.log(
        'LIMPEZA CATÁLOGO V5.9.5: CONCLUÍDA'
      );

    } catch (erro) {

      Logger.log(
        '⚠️ Erro na limpeza do catálogo V5.9.5: ' +
        (
          erro && erro.message
            ? erro.message
            : erro
        )
      );

    }

  }


  function criarResolucaoV63Teste_() {

    resolucaoId =
      'RES-FLUXO-V63-' +
      Date.now();

    const resolucao = {

      resolucao_id:
        resolucaoId,

      titulo_interno:
        'Resolução validada — fluxo principal V6.3',

      descricao_problema:
        'erros de digitação e retrabalho',

      padrao_problema:
        'processo manual de conferência e lançamento de pedidos',

      processo:
        'conferência e lançamento manual de pedidos',

      dores: [
        'erros de digitação',
        'retrabalho'
      ],

      impactos: [
        'perda de tempo',
        'atrasos'
      ],

      resultados_desejados: [
        'reduzir erros e retrabalho'
      ],

      contexto:
        'processo administrativo',

      restricoes: [
        'manter a qualidade do processo'
      ],

      abordagem_interna:
        'Informação interna de engenharia',

      descricao_solucao_interna:
        'Informação interna de engenharia',

      alternativas: [],

      status:
        'VALIDADA',

      confianca:
        'ALTA',

      evidencias: [
        'teste controlado do fluxo principal V6.3'
      ],

      casos_relacionados: [],

      origem:
        'CASO_VALIDADO',

      versao:
        'V6.3'

    };


    const retorno =
      salvarResolucaoV63_(
        resolucao
      );

    Logger.log(
      'RESOLUÇÃO V6.3 TEMPORÁRIA: ' +
      (
        retorno &&
        retorno.resolucao_id
          ? retorno.resolucao_id
          : resolucaoId
      )
    );

    return (
      retorno &&
      retorno.resolucao_id
        ? retorno.resolucao_id
        : resolucaoId
    );

  }


  function limparResolucaoV63Teste_() {

    if (!resolucaoId) {
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

      if (valores.length <= 1) {
        return;
      }

      const cabecalhos =
        valores[0];

      const colunaId =
        cabecalhos.indexOf(
          'resolucao_id'
        );

      if (colunaId === -1) {
        return;
      }

      for (
        let i = valores.length - 1;
        i >= 1;
        i--
      ) {

        if (
          String(
            valores[i][colunaId] || ''
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

      Logger.log(
        'LIMPEZA RESOLUÇÃO V6.3: CONCLUÍDA'
      );

    } catch (erro) {

      Logger.log(
        '⚠️ Erro na limpeza da resolução V6.3: ' +
        (
          erro && erro.message
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
      'INÍCIO — TESTAR_INTEGRACAO_FLUXO_PRINCIPAL_V63'
    );
    Logger.log(
      '============================================================'
    );
    Logger.log('');


    /*
     * ==========================================================
     * 0 — PREPARAR AMBIENTE
     * ==========================================================
     */

    prepararCatalogoV595_();
    criarResolucaoV63Teste_();


    /*
     * ==========================================================
     * 1 — CRIAR EMPRESA / CONVERSA / DIAGNÓSTICO
     * ==========================================================
     */

    inicio =
      iniciarDiagnostico({

        nome:
          'Empresa Teste Fluxo Principal V63',

        nome_empresa:
          'Empresa Teste Fluxo Principal V63',

        segmento:
          'Distribuidora',

        porte:
          'PEQUENA',

        nome_contato:
          'Teste Fluxo Principal V63',

        email:
          'teste-fluxo-v63@mvp.local',

        whatsapp:
          '',

        cidade:
          'Teste'

      });


    teste(
      1,
      'diagnóstico inicial foi criado',
      !!(
        inicio &&
        inicio.sucesso === true &&
        inicio.empresa_id &&
        inicio.conversa_id &&
        inicio.diagnostico_id
      )
    );


    if (
      !inicio ||
      !inicio.empresa_id ||
      !inicio.conversa_id ||
      !inicio.diagnostico_id
    ) {

      throw new Error(
        'Não foi possível iniciar o diagnóstico de teste.'
      );

    }


    Logger.log(
      'EMPRESA TESTE: ' +
      inicio.empresa_id
    );

    Logger.log(
      'CONVERSA TESTE: ' +
      inicio.conversa_id
    );

    Logger.log(
      'DIAGNÓSTICO TESTE: ' +
      inicio.diagnostico_id
    );


    /*
     * ==========================================================
     * 2 — FLUXO PRINCIPAL REAL
     * ==========================================================
     */

    const mensagemTeste =
      'Nosso processo principal é conferir e lançar pedidos. ' +
      'Os pedidos chegam por diferentes canais e são conferidos manualmente. ' +
      'Temos erros de digitação e retrabalho nesse processo. ' +
      'Isso acontece diariamente. ' +
      'Processamos aproximadamente 120 pedidos por dia. ' +
      'Perdemos cerca de 3 horas por dia por causa desse problema. ' +
      'Isso gera atrasos e retrabalho. ' +
      'Nosso objetivo é reduzir os erros e diminuir o retrabalho, mantendo a qualidade do processo.';


    Logger.log('');
    Logger.log(
      '========== FLUXO PRINCIPAL REAL =========='
    );


    resultadoFluxo =
      processarMensagemDiagnostico({

        empresa_id:
          inicio.empresa_id,

        conversa_id:
          inicio.conversa_id,

        mensagem:
          mensagemTeste

      });


    teste(
      2,
      'processarMensagemDiagnostico executou com sucesso',
      !!(
        resultadoFluxo &&
        resultadoFluxo.sucesso === true
      )
    );


    diagnostico =
      resultadoFluxo
        ? resultadoFluxo.diagnostico
        : null;


    teste(
      3,
      'diagnóstico foi retornado',
      !!diagnostico
    );


    teste(
      4,
      'empresa_id foi preservado',
      !!(
        diagnostico &&
        diagnostico.empresa_id ===
        inicio.empresa_id
      )
    );


    teste(
      5,
      'conversa_id foi preservado',
      !!(
        diagnostico &&
        diagnostico.conversa_id ===
        inicio.conversa_id
      )
    );


    teste(
      6,
      'diagnostico_id foi preservado',
      !!(
        diagnostico &&
        diagnostico.diagnostico_id ===
        inicio.diagnostico_id
      )
    );


    triagem =
      resultadoFluxo
        ? resultadoFluxo.triagem
        : null;


    teste(
      7,
      'Triagem V1 foi executada e retornada',
      !!triagem
    );


    teste(
      8,
      'Triagem classificou como COMPATIVEL',
      !!(
        triagem &&
        triagem.classificacao ===
        'COMPATIVEL'
      )
    );


    investigacao =
      resultadoFluxo
        ? resultadoFluxo.investigacao
        : null;


    teste(
      9,
      'Investigação V6.2 foi criada e retornada',
      !!investigacao
    );


    teste(
      10,
      'investigação utiliza V6.2',
      !!(
        investigacao &&
        investigacao.versao ===
        INVESTIGACAO_V62.VERSAO
      )
    );


    teste(
      11,
      'investigação mantém diagnostico_id',
      !!(
        investigacao &&
        investigacao.diagnostico_id ===
        inicio.diagnostico_id
      )
    );


    teste(
      12,
      'investigação mantém empresa_id',
      !!(
        investigacao &&
        investigacao.empresa_id ===
        inicio.empresa_id
      )
    );


    teste(
      13,
      'investigação mantém conversa_id',
      !!(
        investigacao &&
        investigacao.conversa_id ===
        inicio.conversa_id
      )
    );


    teste(
      14,
      'problema central está presente na investigação',
      !!(
        investigacao &&
        investigacao.problema_central
      )
    );


    teste(
      15,
      'processo está presente na investigação',
      !!(
        investigacao &&
        investigacao.processo
      )
    );


    teste(
      16,
      'impacto está presente na investigação',
      !!(
        investigacao &&
        investigacao.impacto
      )
    );


    investigacaoPersistida =
      buscarInvestigacaoV62_({
        diagnostico_id:
          inicio.diagnostico_id
      });


    teste(
      17,
      'investigação foi persistida',
      !!investigacaoPersistida
    );


    teste(
      18,
      'investigação persistida mantém o mesmo ID',
      !!(
        investigacao &&
        investigacaoPersistida &&
        investigacao.investigacao_id ===
        investigacaoPersistida.investigacao_id
      )
    );


    teste(
      19,
      'fluxo principal continua produzindo resposta',
      !!(
        resultadoFluxo &&
        resultadoFluxo.resposta !== undefined
      )
    );


    /*
     * ==========================================================
     * 3 — PONTE V6.3 REAL
     * ==========================================================
     */

    Logger.log('');
    Logger.log(
      '========== PONTE V6.3 REAL =========='
    );


    const contextoPonte = {

      empresa_id:
        inicio.empresa_id,

      conversa_id:
        inicio.conversa_id,

      diagnostico_id:
        inicio.diagnostico_id,

      investigacao_id:
        investigacao &&
        investigacao.investigacao_id
          ? investigacao.investigacao_id
          : '',

      pontuacao_minima:
        20

    };


    try {

      resultadoV63 =
        executarPonteV63_(
          mensagemTeste,
          contextoPonte
        );

    } catch (erroPonte) {

      Logger.log(
        '❌ ERRO PONTE V6.3: ' +
        (
          erroPonte &&
          erroPonte.stack
            ? erroPonte.stack
            : erroPonte
        )
      );

      resultadoV63 = null;

    }


    teste(
      20,
      'Ponte V6.3 executou sobre o fluxo principal',
      !!(
        resultadoV63 &&
        resultadoV63.sucesso === true
      )
    );


    teste(
      21,
      'Ponte retornou versão V6.3',
      !!(
        resultadoV63 &&
        resultadoV63.versao ===
        'V6.3'
      )
    );


    teste(
      22,
      'V6.3 produziu interpretação semântica',
      !!(
        resultadoV63 &&
        resultadoV63.interpretacao &&
        resultadoV63.interpretacao.problema &&
        resultadoV63.interpretacao.processo
      )
    );


    teste(
      23,
      'V6.3 reconheceu a resolução validada temporária',
      !!(
        resultadoV63 &&
        Array.isArray(
          resultadoV63.resultados_reconhecimento
        ) &&
        resultadoV63.resultados_reconhecimento.some(
          function(item) {

            return (
              item &&
              String(
                item.resolucao_id || ''
              ) ===
              String(
                resolucaoId
              )
            );

          }
        )
      )
    );


    teste(
      24,
      'V6.3 decidiu solução validada e produziu resposta segura',
      !!(
        resultadoV63 &&
        resultadoV63.decisao &&
        resultadoV63.decisao.estado ===
        'SOLUCAO_VALIDADA' &&
        resultadoV63.resposta &&
        resultadoV63.resposta.resposta_cliente &&
        resultadoV63.resposta.resposta_segura ===
        true &&
        resultadoV63.resposta.tecnologia_exposta ===
        false &&
        resultadoV63.resposta.informacao_comercial_exposta ===
        false
      )
    );


    /*
     * ==========================================================
     * 4 — IDENTIDADE / CONTEXTO
     * ==========================================================
     *
     * A Ponte atual mantém os IDs no contexto retornado.
     * O teste não exige que a interpretação semântica carregue
     * IDs, pois essa camada é deliberadamente independente.
     */

    const contextoPreservado =
      preservarContextoPonteV63_(
        contextoPonte,
        resultadoV63
      );


    teste(
      25,
      'contexto do fluxo principal permanece íntegro na Ponte V6.3',
      !!(
        contextoPreservado &&
        contextoPreservado.empresa_id ===
        inicio.empresa_id &&
        contextoPreservado.conversa_id ===
        inicio.conversa_id &&
        contextoPreservado.diagnostico_id ===
        inicio.diagnostico_id &&
        contextoPreservado.investigacao_id ===
        (
          investigacao
            ? investigacao.investigacao_id
            : ''
        ) &&
        contextoPreservado.resultado_v63 ===
        resultadoV63
      )
    );


  } catch (erro) {

    Logger.log('');
    Logger.log(
      '❌ ERRO FATAL NO TESTE'
    );

    Logger.log(
      erro &&
      erro.stack
        ? erro.stack
        : erro
    );

  } finally {


    /*
     * ==========================================================
     * LIMPEZA DA INVESTIGAÇÃO DE TESTE
     * ==========================================================
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

          const idxEmpresa =
            cabecalhos.indexOf(
              'empresa_id'
            );

          const idxConversa =
            cabecalhos.indexOf(
              'conversa_id'
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

            const empresa =
              idxEmpresa !== -1
                ? String(
                    dados[i][idxEmpresa] || ''
                  )
                : '';

            const conversa =
              idxConversa !== -1
                ? String(
                    dados[i][idxConversa] || ''
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
                investigacao &&
                id === String(
                  investigacao.investigacao_id || ''
                )
              ) ||
              (
                inicio &&
                empresa === String(
                  inicio.empresa_id
                )
              ) ||
              (
                inicio &&
                conversa === String(
                  inicio.conversa_id
                )
              ) ||
              (
                inicio &&
                diagnosticoId === String(
                  inicio.diagnostico_id
                )
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

    } catch (erroLimpezaInvestigacao) {

      Logger.log(
        '⚠️ Erro na limpeza da investigação: ' +
        (
          erroLimpezaInvestigacao &&
          erroLimpezaInvestigacao.message
            ? erroLimpezaInvestigacao.message
            : erroLimpezaInvestigacao
        )
      );

    }


    /*
     * ==========================================================
     * LIMPAR V5.9.5
     * ==========================================================
     */

    limparCatalogoV595_();


    /*
     * ==========================================================
     * LIMPAR V6.3
     * ==========================================================
     */

    limparResolucaoV63Teste_();


    /*
     * ==========================================================
     * RESULTADO FINAL
     * ==========================================================
     */

    Logger.log('');
    Logger.log(
      '============================================================'
    );

    Logger.log(
      'RESULTADO FINAL — INTEGRAÇÃO FLUXO PRINCIPAL V6.3'
    );

    Logger.log(
      '============================================================'
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
        (
          aprovados /
          total
        ) * 100
      ) +
      '%'
    );


    if (
      aprovados === total &&
      falhas.length === 0
    ) {

      Logger.log('');
      Logger.log(
        '🏆 TESTAR_INTEGRACAO_FLUXO_PRINCIPAL_V63: PASSOU'
      );

      Logger.log(
        '🏆 FLUXO PRINCIPAL + V6.3: 100%'
      );

      Logger.log(
        '🏆 25/25 TESTES APROVADOS'
      );

    } else {

      Logger.log('');
      Logger.log(
        '❌ TESTAR_INTEGRACAO_FLUXO_PRINCIPAL_V63: FALHOU'
      );

      falhas.forEach(
        function(falha) {

          Logger.log(
            '   ' + falha
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
