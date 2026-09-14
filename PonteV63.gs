/**
 * ============================================================
 * FEEDS SOLUTIONS
 * PONTE DE INTEGRAÇÃO V6.3
 * ============================================================
 *
 * RESPONSABILIDADE:
 *
 * Conectar o fluxo existente às novas camadas V6.3
 * sem modificar nenhuma camada congelada.
 *
 * FLUXO:
 *
 * DIAGNÓSTICO / INVESTIGAÇÃO
 *          ↓
 *      PONTE V6.3
 *          ↓
 * INTERPRETAÇÃO SEMÂNTICA
 *          ↓
 * RECONHECIMENTO
 *          ↓
 * DECISÃO
 *          ↓
 * RESPOSTA SEGURA
 *
 *
 * IMPORTANTE:
 *
 * Este arquivo NÃO altera:
 *
 * - Diagnóstico
 * - Triagem
 * - Investigação
 * - Biblioteca
 * - Reconhecimento
 * - Decisão
 * - Resposta Segura
 *
 * A ponte apenas orquestra as camadas existentes.
 *
 * ============================================================
 */


/**
 * ============================================================
 * CONTRATO
 * ============================================================
 */

const PONTE_V63 = {

  VERSAO: 'V6.3',

  STATUS: {

    SUCESSO:
      'SUCESSO',

    FALHA:
      'FALHA'

  }

};


/**
 * ============================================================
 * NORMALIZAÇÃO
 * ============================================================
 */

function normalizarTextoPonteV63_(
  valor
) {

  if (
    valor === null ||
    valor === undefined
  ) {

    return '';

  }

  return String(valor).trim();

}


/**
 * ============================================================
 * OBJETO VÁLIDO
 * ============================================================
 */

function objetoValidoPonteV63_(
  valor
) {

  return (
    valor !== null &&
    valor !== undefined &&
    typeof valor === 'object' &&
    !Array.isArray(valor)
  );

}


/**
 * ============================================================
 * EXECUTA O CICLO V6.3
 * ============================================================
 *
 * Esta é a função central da ponte.
 *
 * Ela recebe uma mensagem natural e, opcionalmente,
 * os dados já existentes do diagnóstico/investigação.
 *
 * ============================================================
 */

function executarPonteV63_(
  mensagem,
  contexto
) {

  contexto =
    contexto || {};

  mensagem =
    normalizarTextoPonteV63_(
      mensagem
    );


  if (!mensagem) {

    throw new Error(
      'A ponte V6.3 exige uma mensagem.'
    );

  }


  /**
   * ----------------------------------------------------------
   * 1. INTERPRETAÇÃO SEMÂNTICA
   * ----------------------------------------------------------
   */

  const interpretacao =
    interpretarMensagemSemanticaV63_(
      mensagem
    );


  if (!interpretacao) {

    throw new Error(
      'A IA semântica não retornou interpretação.'
    );

  }


  const validacao =
    validarInterpretacaoSemanticaV63_(
      interpretacao
    );


  const interpretacaoValida =
    validacao === true ||
    (
      validacao &&
      validacao.valido === true
    );


  if (!interpretacaoValida) {

    throw new Error(
      'Interpretação semântica V6.3 inválida.'
    );

  }


  /**
   * ----------------------------------------------------------
   * 2. SEGURANÇA DA INTERPRETAÇÃO
   * ----------------------------------------------------------
   */

  const interpretacaoSegura =
    verificarSegurancaInterpretacaoV63_(
      interpretacao
    );


  if (
    interpretacaoSegura !== true
  ) {

    throw new Error(
      'Interpretação V6.3 reprovada pelo filtro de segurança.'
    );

  }


  /**
   * ----------------------------------------------------------
   * 3. PREPARAÇÃO PARA RECONHECIMENTO
   * ----------------------------------------------------------
   */

  const investigacao =
    prepararParaReconhecimentoV63_(
      interpretacao
    );


  if (!investigacao) {

    throw new Error(
      'Não foi possível preparar a interpretação para reconhecimento.'
    );

  }


  /**
   * ----------------------------------------------------------
   * 4. RECONHECIMENTO NA BIBLIOTECA
   * ----------------------------------------------------------
   */

  const resultados =
    buscarResolucoesRelacionadasV63_(
      investigacao,
      {
        pontuacao_minima:
          contexto.pontuacao_minima ||
          20
      }
    );


  const classificacao =
    classificarReconhecimentoV63_(
      resultados
    );


  const reconhecimento = {

    classificacao:
      classificacao.classificacao,

    resultados:
      resultados

  };


  /**
   * ----------------------------------------------------------
   * 5. DECISÃO
   * ----------------------------------------------------------
   */

  const decisao =
    decidirSolucaoV63_(
      reconhecimento,
      {
        interpretacao:
          interpretacao,

        investigacao:
          investigacao,

        contexto:
          contexto
      }
    );


  if (!decisao) {

    throw new Error(
      'Decisão V6.3 não foi produzida.'
    );

  }


  /**
   * ----------------------------------------------------------
   * 6. RESPOSTA SEGURA
   * ----------------------------------------------------------
   */

  const resposta =
    gerarRespostaSeguraV63_(
      decisao
    );


  if (!resposta) {

    throw new Error(
      'Resposta Segura V6.3 não foi produzida.'
    );

  }


  /**
   * ----------------------------------------------------------
   * 7. FILTRO FINAL
   * ----------------------------------------------------------
   */

  const verificacao =
    verificarSegurancaRespostaSeguraV63_(
      resposta.resposta_cliente
    );


  if (
    !verificacao ||
    verificacao.segura !== true
  ) {

    throw new Error(
      'Resposta final V6.3 reprovada pelo filtro de segurança.'
    );

  }


  /**
   * ----------------------------------------------------------
   * 8. RESULTADO DA PONTE
   * ----------------------------------------------------------
   */

  return {

    sucesso:
      true,

    status:
      PONTE_V63.STATUS.SUCESSO,

    versao:
      PONTE_V63.VERSAO,

    contexto:
      contexto,

    interpretacao:
      interpretacao,

    investigacao:
      investigacao,

    resultados_reconhecimento:
      resultados,

    reconhecimento:
      reconhecimento,

    decisao:
      decisao,

    resposta:
      resposta,

    seguranca:
      verificacao

  };

}


/**
 * ============================================================
 * PRESERVA CONTEXTO EXISTENTE
 * ============================================================
 *
 * A ponte nunca deve substituir IDs ou dados existentes.
 *
 * ============================================================
 */

function preservarContextoPonteV63_(
  contextoOriginal,
  resultado
) {

  contextoOriginal =
    contextoOriginal || {};

  resultado =
    resultado || {};


  return {

    empresa_id:
      contextoOriginal.empresa_id || '',

    conversa_id:
      contextoOriginal.conversa_id || '',

    diagnostico_id:
      contextoOriginal.diagnostico_id || '',

    investigacao_id:
      contextoOriginal.investigacao_id || '',

    resultado_v63:
      resultado

  };

}


/**
 * ============================================================
 * VALIDAÇÃO DE IDENTIDADE
 * ============================================================
 */

function validarIdentidadePonteV63_(
  contexto,
  resultado
) {

  contexto =
    contexto || {};

  resultado =
    resultado || {};


  const investigacao =
    resultado.investigacao || {};


  const campos = [

    'empresa_id',
    'conversa_id',
    'diagnostico_id'

  ];


  for (
    let i = 0;
    i < campos.length;
    i++
  ) {

    const campo =
      campos[i];

    if (
      contexto[campo] &&
      investigacao[campo] &&
      String(
        contexto[campo]
      ) !== String(
        investigacao[campo]
      )
    ) {

      return false;

    }

  }


  return true;

}


/**
 * ============================================================
 * RESPOSTA FINAL DA PONTE
 * ============================================================
 *
 * Esta função será usada posteriormente pelo fluxo principal.
 *
 * Ela retorna somente a resposta destinada ao cliente,
 * mantendo o restante do resultado disponível internamente.
 *
 * ============================================================
 */

function obterRespostaClientePonteV63_(
  resultado
) {

  if (
    !resultado ||
    !resultado.resposta
  ) {

    return '';

  }


  return normalizarTextoPonteV63_(
    resultado
      .resposta
      .resposta_cliente
  );

}


/**
 * ============================================================
 * TESTE DE INTEGRAÇÃO CONTROLADA
 * ============================================================
 *
 * 25 TESTES
 *
 * Este teste usa:
 *
 * - Gemini real
 * - Biblioteca real
 * - Persistência real da biblioteca
 * - Reconhecimento real
 * - Decisão real
 * - Resposta Segura real
 *
 * Mas NÃO modifica o processarMensagemDiagnostico().
 *
 * ============================================================
 */

function TESTAR_PONTE_INTEGRACAO_V63() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'TESTAR_PONTE_INTEGRACAO_V63'
  );


  let aprovados = 0;
  let falhas = 0;


  function teste(
    numero,
    descricao,
    condicao
  ) {

    if (condicao) {

      aprovados++;

      Logger.log(
        '✅ TESTE ' +
        numero +
        ' — ' +
        descricao
      );

    } else {

      falhas++;

      Logger.log(
        '❌ TESTE ' +
        numero +
        ' — ' +
        descricao
      );

    }

  }


  /**
   * ==========================================================
   * CONTEXTO SIMULANDO DADOS JÁ EXISTENTES
   * ==========================================================
   */

  const contexto = {

    empresa_id:
      'EMP-PONTE-V63',

    conversa_id:
      'CONV-PONTE-V63',

    diagnostico_id:
      'DIAG-PONTE-V63',

    investigacao_id:
      'INV-PONTE-V63',

    pontuacao_minima:
      20

  };


  const mensagem =
    'Hoje minha equipe recebe pedidos pelo WhatsApp ' +
    'e precisa conferir e lançar tudo manualmente em ' +
    'uma planilha. Isso gera erros de digitação, ' +
    'retrabalho e perda de tempo todos os dias. ' +
    'Queremos reduzir os erros e o retrabalho, ' +
    'mantendo a qualidade do processo.';


  /**
   * ==========================================================
   * CRIA RESOLUÇÃO TEMPORÁRIA
   * ==========================================================
   */

  let interpretacaoFixture = null;


  try {

    interpretacaoFixture =
      interpretarMensagemSemanticaV63_(
        mensagem
      );

  } catch (erro) {

    Logger.log(
      'ERRO FIXTURE IA: ' +
      erro.message
    );

  }


  teste(
    1,
    'Interpretação de referência foi produzida',
    !!interpretacaoFixture
  );


  const resolucaoId =
    'RES-PONTE-V63-' +
    Date.now();


  const resolucaoTeste = {

    resolucao_id:
      resolucaoId,

    titulo_interno:
      'Resolução validada para processo manual de pedidos',

    descricao_problema:
      interpretacaoFixture
        ? interpretacaoFixture.problema
        : '',

    padrao_problema:
      interpretacaoFixture
        ? interpretacaoFixture.padrao_problema
        : '',

    processo:
      interpretacaoFixture
        ? interpretacaoFixture.processo
        : '',

    dores:
      interpretacaoFixture &&
      Array.isArray(
        interpretacaoFixture.dores
      )
        ? interpretacaoFixture.dores
        : [],

    impactos:
      interpretacaoFixture &&
      Array.isArray(
        interpretacaoFixture.impactos
      )
        ? interpretacaoFixture.impactos
        : [],

    resultados_desejados:
      interpretacaoFixture &&
      interpretacaoFixture.resultado_desejado
        ? [
            interpretacaoFixture
              .resultado_desejado
          ]
        : [],

    contexto:
      interpretacaoFixture
        ? interpretacaoFixture.contexto
        : '',

    restricoes:
      [],

    abordagem_interna:
      'Informação interna de engenharia',

    descricao_solucao_interna:
      'Informação interna de engenharia',

    alternativas:
      [],

    status:
      'VALIDADA',

    confianca:
      'ALTA',

    evidencias:
      [
        'teste controlado da ponte V6.3'
      ],

    casos_relacionados:
      [],

    origem:
      'CASO_VALIDADO',

    versao:
      'V6.3'

  };


  let retornoSalvar = null;


  try {

    retornoSalvar =
      salvarResolucaoV63_(
        resolucaoTeste
      );

  } catch (erro) {

    Logger.log(
      'ERRO PERSISTÊNCIA FIXTURE: ' +
      erro.message
    );

  }


  teste(
    2,
    'Resolução de teste foi persistida',
    !!(
      retornoSalvar &&
      retornoSalvar.resolucao_id
    )
  );


  /**
   * ==========================================================
   * EXECUTA PONTE
   * ==========================================================
   */

  let resultado = null;


  try {

    resultado =
      executarPonteV63_(
        mensagem,
        contexto
      );

  } catch (erro) {

    Logger.log(
      'ERRO PONTE V6.3: ' +
      erro.message
    );

  }


  /**
   * ==========================================================
   * TESTES 3–25
   * ==========================================================
   */

  teste(
    3,
    'Ponte retorna resultado',
    !!resultado
  );


  teste(
    4,
    'Ponte informa sucesso',
    !!(
      resultado &&
      resultado.sucesso === true
    )
  );


  teste(
    5,
    'Ponte informa versão V6.3',
    !!(
      resultado &&
      resultado.versao === 'V6.3'
    )
  );


  teste(
    6,
    'Interpretação está presente',
    !!(
      resultado &&
      resultado.interpretacao
    )
  );


  teste(
    7,
    'Interpretação possui problema',
    !!(
      resultado &&
      resultado.interpretacao &&
      resultado.interpretacao.problema
    )
  );


  teste(
    8,
    'Interpretação possui processo',
    !!(
      resultado &&
      resultado.interpretacao &&
      resultado.interpretacao.processo
    )
  );


  teste(
    9,
    'Interpretação possui dores',
    !!(
      resultado &&
      resultado.interpretacao &&
      Array.isArray(
        resultado.interpretacao.dores
      ) &&
      resultado.interpretacao.dores.length > 0
    )
  );


  teste(
    10,
    'Interpretação possui resultado desejado',
    !!(
      resultado &&
      resultado.interpretacao &&
      resultado.interpretacao.resultado_desejado
    )
  );


  teste(
    11,
    'Investigação para reconhecimento está presente',
    !!(
      resultado &&
      resultado.investigacao
    )
  );


  teste(
    12,
    'Reconhecimento foi executado',
    !!(
      resultado &&
      resultado.reconhecimento
    )
  );


  teste(
    13,
    'Reconhecimento encontrou resultados',
    !!(
      resultado &&
      Array.isArray(
        resultado.resultados_reconhecimento
      ) &&
      resultado.resultados_reconhecimento.length > 0
    )
  );


  teste(
    14,
    'Reconhecimento identifica classificação',
    !!(
      resultado &&
      resultado.reconhecimento &&
      resultado.reconhecimento.classificacao
    )
  );


  teste(
    15,
    'Resolução temporária foi encontrada',
    !!(
      resultado &&
      resultado.resultados_reconhecimento &&
      resultado.resultados_reconhecimento.some(
        function(item) {

          return (
            item &&
            item.resolucao_id ===
              resolucaoId
          );

        }
      )
    )
  );


  teste(
    16,
    'Reconhecimento identifica solução validada',
    !!(
      resultado &&
      resultado.reconhecimento &&
      (
        resultado.reconhecimento.classificacao ===
          'SOLUCAO_ENCONTRADA' ||
        resultado.reconhecimento.classificacao ===
          'SOLUCOES_ENCONTRADAS'
      )
    )
  );


  teste(
    17,
    'Decisão foi produzida',
    !!(
      resultado &&
      resultado.decisao
    )
  );


  teste(
    18,
    'Decisão indica solução validada',
    !!(
      resultado &&
      resultado.decisao &&
      resultado.decisao.estado ===
        'SOLUCAO_VALIDADA'
    )
  );


  teste(
    19,
    'Decisão mantém a resolução principal',
    !!(
      resultado &&
      resultado.decisao &&
      resultado.decisao.resolucao_principal ===
        resolucaoId
    )
  );


  teste(
    20,
    'Resposta Segura foi produzida',
    !!(
      resultado &&
      resultado.resposta &&
      resultado.resposta.resposta_cliente
    )
  );


  teste(
    21,
    'Resposta está marcada como segura',
    !!(
      resultado &&
      resultado.resposta &&
      resultado.resposta.resposta_segura ===
        true
    )
  );


  teste(
    22,
    'Resposta não expõe tecnologia',
    !!(
      resultado &&
      resultado.resposta &&
      resultado.resposta.tecnologia_exposta ===
        false
    )
  );


  teste(
    23,
    'Resposta não expõe informação comercial',
    !!(
      resultado &&
      resultado.resposta &&
      resultado.resposta.informacao_comercial_exposta ===
        false
    )
  );


  teste(
    24,
    'Filtro final aprova a resposta',
    !!(
      resultado &&
      resultado.seguranca &&
      resultado.seguranca.segura ===
        true
    )
  );


  /**
   * ----------------------------------------------------------
   * IDENTIDADE / CONTEXTO
   * ----------------------------------------------------------
   */

  teste(
    25,
    'Contexto existente permanece íntegro',
    !!(
      resultado &&
      validarIdentidadePonteV63_(
        contexto,
        resultado
      )
    )
  );


  /**
   * ==========================================================
   * LIMPEZA
   * ==========================================================
   */

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
      valores.length > 1
    ) {

      const cabecalhos =
        valores[0];

      const colunaId =
        cabecalhos.indexOf(
          'resolucao_id'
        );


      if (
        colunaId !== -1
      ) {

        for (
          let i =
            valores.length - 1;
          i >= 1;
          i--
        ) {

          if (
            String(
              valores[i][colunaId]
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

      }

    }

  } catch (erroLimpeza) {

    Logger.log(
      '⚠️ AVISO LIMPEZA PONTE V6.3: ' +
      erroLimpeza.message
    );

  }


  /**
   * ==========================================================
   * RESULTADO
   * ==========================================================
   */

  const total =
    aprovados +
    falhas;


  const percentual =
    total > 0
      ? Math.round(
          (
            aprovados /
            total
          ) * 100
        )
      : 0;


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
    falhas
  );

  Logger.log(
    'PERCENTUAL: ' +
    percentual +
    '%'
  );


  if (
    aprovados === 25 &&
    falhas === 0 &&
    percentual === 100
  ) {

    Logger.log(
      '🏆 TESTAR_PONTE_INTEGRACAO_V63: PASSOU'
    );

    Logger.log(
      '🏆 PONTE V6.3: 100%'
    );

  } else {

    Logger.log(
      '❌ TESTAR_PONTE_INTEGRACAO_V63: FALHOU'
    );

  }

}