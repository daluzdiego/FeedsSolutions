/**
 * ============================================================
 * FEEDS SOLUTIONS
 * DECISÃO V6.3
 * ============================================================
 *
 * MISSÃO:
 *
 * Receber o resultado do reconhecimento de soluções e determinar
 * qual é o próximo estado interno do caso.
 *
 * FLUXO:
 *
 * INTERPRETAÇÃO
 *      ↓
 * RECONHECIMENTO
 *      ↓
 * DECISÃO V6.3
 *      ↓
 * RESPOSTA SEGURA
 *
 * IMPORTANTE:
 *
 * Esta camada NÃO:
 *
 * - cria tecnologia;
 * - escolhe arquitetura;
 * - revela implementação;
 * - informa preço;
 * - negocia;
 * - promete prazo técnico;
 * - inventa solução;
 * - altera a Biblioteca de Resoluções;
 * - altera o motor de Reconhecimento V6.3.
 *
 * ============================================================
 */


/**
 * ============================================================
 * CONTRATO V6.3
 * ============================================================
 */

const DECISAO_V63 = {

  VERSAO: 'V6.3',

  ESTADOS: {

    SOLUCAO_VALIDADA:
      'SOLUCAO_VALIDADA',

    SOLUCOES_ENCONTRADAS:
      'SOLUCOES_ENCONTRADAS',

    ABORDAGEM_EM_ANALISE:
      'ABORDAGEM_EM_ANALISE',

    ANALISE_NECESSARIA:
      'ANALISE_NECESSARIA'

  },

  CLASSIFICACOES_RECONHECIMENTO: {

    SOLUCAO_ENCONTRADA:
      'SOLUCAO_ENCONTRADA',

    SOLUCOES_ENCONTRADAS:
      'SOLUCOES_ENCONTRADAS',

    ABORDAGEM_EM_ANALISE:
      'ABORDAGEM_EM_ANALISE',

    NENHUMA_SOLUCAO_VALIDADA:
      'NENHUMA_SOLUCAO_VALIDADA',

    NENHUMA_CORRESPONDENCIA:
      'NENHUMA_CORRESPONDENCIA'

  },

  STATUS_RESOLUCAO: {

    VALIDADA:
      'VALIDADA',

    EM_ANALISE:
      'EM_ANALISE',

    HIPOTESE:
      'HIPOTESE',

    SUPERADA:
      'SUPERADA',

    ARQUIVADA:
      'ARQUIVADA'

  },

  CONFIANCAS: {

    ALTA:
      'ALTA',

    MEDIA:
      'MEDIA',

    BAIXA:
      'BAIXA'

  }

};


/**
 * ============================================================
 * NORMALIZAÇÃO
 * ============================================================
 */

function normalizarTextoDecisaoV63_(
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
 * VERIFICA SE É UM OBJETO
 * ============================================================
 */

function objetoValidoDecisaoV63_(
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
 * OBTÉM CLASSIFICAÇÃO DO RECONHECIMENTO
 * ============================================================
 */

function obterClassificacaoReconhecimentoV63_(
  reconhecimento
) {

  if (
    !objetoValidoDecisaoV63_(
      reconhecimento
    )
  ) {

    return '';

  }

  return normalizarTextoDecisaoV63_(
    reconhecimento.classificacao ||
    reconhecimento.tipo ||
    reconhecimento.estado ||
    ''
  ).toUpperCase();

}


/**
 * ============================================================
 * OBTÉM RESULTADOS DO RECONHECIMENTO
 * ============================================================
 */

function obterResultadosReconhecimentoV63_(
  reconhecimento
) {

  if (
    !objetoValidoDecisaoV63_(
      reconhecimento
    )
  ) {

    return [];

  }

  if (
    Array.isArray(
      reconhecimento.resultados
    )
  ) {

    return reconhecimento.resultados;

  }

  if (
    Array.isArray(
      reconhecimento.resolucoes
    )
  ) {

    return reconhecimento.resolucoes;

  }

  if (
    reconhecimento.resolucao
  ) {

    return [
      reconhecimento.resolucao
    ];

  }

  return [];

}


/**
 * ============================================================
 * OBTÉM SOLUÇÕES VALIDADAS
 * ============================================================
 */

function obterSolucoesValidadasDecisaoV63_(
  reconhecimento
) {

  const resultados =
    obterResultadosReconhecimentoV63_(
      reconhecimento
    );

  return resultados.filter(
    function(item) {

      if (
        !item ||
        typeof item !== 'object'
      ) {

        return false;

      }

      return (
        normalizarTextoDecisaoV63_(
          item.status
        ).toUpperCase() ===
        DECISAO_V63.STATUS_RESOLUCAO.VALIDADA
      );

    }
  );

}


/**
 * ============================================================
 * SELECIONA MELHOR SOLUÇÃO
 * ============================================================
 */

function selecionarMelhorSolucaoDecisaoV63_(
  reconhecimento
) {

  const resultados =
    obterSolucoesValidadasDecisaoV63_(
      reconhecimento
    );

  if (
    resultados.length === 0
  ) {

    return null;

  }

  const ordenados =
    resultados.slice().sort(
      function(a, b) {

        const pontuacaoA =
          Number(
            a.pontuacao ||
            a.score ||
            0
          );

        const pontuacaoB =
          Number(
            b.pontuacao ||
            b.score ||
            0
          );

        return (
          pontuacaoB -
          pontuacaoA
        );

      }
    );

  return ordenados[0];

}


/**
 * ============================================================
 * MAPEAMENTO DA CLASSIFICAÇÃO
 * ============================================================
 */

function mapearEstadoDecisaoV63_(
  reconhecimento
) {

  const classificacao =
    obterClassificacaoReconhecimentoV63_(
      reconhecimento
    );

  switch (
    classificacao
  ) {

    case DECISAO_V63
      .CLASSIFICACOES_RECONHECIMENTO
      .SOLUCAO_ENCONTRADA:

      return DECISAO_V63
        .ESTADOS
        .SOLUCAO_VALIDADA;


    case DECISAO_V63
      .CLASSIFICACOES_RECONHECIMENTO
      .SOLUCOES_ENCONTRADAS:

      return DECISAO_V63
        .ESTADOS
        .SOLUCOES_ENCONTRADAS;


    case DECISAO_V63
      .CLASSIFICACOES_RECONHECIMENTO
      .ABORDAGEM_EM_ANALISE:

      return DECISAO_V63
        .ESTADOS
        .ABORDAGEM_EM_ANALISE;


    case DECISAO_V63
      .CLASSIFICACOES_RECONHECIMENTO
      .NENHUMA_SOLUCAO_VALIDADA:

      return DECISAO_V63
        .ESTADOS
        .ANALISE_NECESSARIA;


    case DECISAO_V63
      .CLASSIFICACOES_RECONHECIMENTO
      .NENHUMA_CORRESPONDENCIA:

      return DECISAO_V63
        .ESTADOS
        .ANALISE_NECESSARIA;


    default:

      return DECISAO_V63
        .ESTADOS
        .ANALISE_NECESSARIA;

  }

}


/**
 * ============================================================
 * RESPOSTA AO CLIENTE
 * ============================================================
 *
 * IMPORTANTE:
 *
 * Esta função só pode devolver linguagem comercial segura.
 *
 * Nunca deve revelar:
 *
 * - tecnologia;
 * - arquitetura;
 * - API;
 * - código;
 * - modelo;
 * - prompt;
 * - implementação;
 * - preço;
 * - desconto;
 * - negociação.
 *
 * ============================================================
 */

function construirRespostaSeguraDecisaoV63_(
  estado,
  opcoes
) {

  opcoes =
    opcoes || {};

  switch (
    estado
  ) {

    case DECISAO_V63
      .ESTADOS
      .SOLUCAO_VALIDADA:

      return (
        'Analisei o seu caso e encontrei ' +
        'uma solução adequada para esse tipo ' +
        'de problema em nossa biblioteca de ' +
        'resoluções. Vou encaminhar os próximos ' +
        'detalhes para o time da Feeds.'
      );


    case DECISAO_V63
      .ESTADOS
      .SOLUCOES_ENCONTRADAS:

      return (
        'Analisei o seu caso e identifiquei ' +
        'algumas possibilidades de solução. ' +
        'Vou avaliar qual delas se adapta melhor ' +
        'à realidade da sua empresa e encaminhar ' +
        'a análise para a equipe da Feeds.'
      );


    case DECISAO_V63
      .ESTADOS
      .ABORDAGEM_EM_ANALISE:

      return (
        'Analisei o seu cenário e identifiquei ' +
        'uma abordagem de solução para esse ' +
        'problema. Vou encaminhar a análise para ' +
        'a equipe da Feeds, que avaliará os ' +
        'próximos passos com você.'
      );


    case DECISAO_V63
      .ESTADOS
      .ANALISE_NECESSARIA:

      return (
        'Entendi o seu cenário. Vou realizar uma ' +
        'análise mais detalhada para identificar ' +
        'a melhor forma de resolver esse problema. ' +
        'Assim que tivermos a definição, entraremos ' +
        'em contato com você.'
      );


    default:

      return (
        'Entendi o seu cenário. Vou realizar uma ' +
        'análise mais detalhada para identificar ' +
        'a melhor forma de resolver esse problema. ' +
        'Assim que tivermos a definição, entraremos ' +
        'em contato com você.'
      );

  }

}


/**
 * ============================================================
 * FILTRO DE SEGURANÇA DA RESPOSTA
 * ============================================================
 */

function verificarSegurancaRespostaDecisaoV63_(
  resposta
) {

  const texto =
    normalizarTextoDecisaoV63_(
      resposta
    ).toLowerCase();

  if (!texto) {

    return false;

  }

  const termosProibidos = [

    'api',
    'endpoint',
    'token',
    'apikey',
    'banco de dados',
    'database',
    'arquitetura',
    'código',
    'codigo',
    'script',
    'sql',
    'prompt',
    'modelo',
    'model',
    'framework',
    'servidor',
    'webhook',
    'integração técnica',
    'integração tecnica',
    'tecnologia',
    'programação',
    'programacao'

  ];

  for (
    let i = 0;
    i < termosProibidos.length;
    i++
  ) {

    if (
      texto.indexOf(
        termosProibidos[i]
      ) !== -1
    ) {

      return false;

    }

  }

  /*
   * Preço e negociação também são
   * responsabilidade da equipe Feeds.
   */

  const termosComerciaisProibidos = [

    'r$',
    'preço',
    'preco',
    'valor',
    'orçamento',
    'orcamento',
    'desconto',
    'parcelamento',
    'negociar',
    'negociação',
    'negociacao'

  ];

  for (
    let j = 0;
    j < termosComerciaisProibidos.length;
    j++
  ) {

    if (
      texto.indexOf(
        termosComerciaisProibidos[j]
      ) !== -1
    ) {

      return false;

    }

  }

  return true;

}


/**
 * ============================================================
 * DECISÃO PRINCIPAL
 * ============================================================
 */

function decidirSolucaoV63_(
  reconhecimento,
  contexto
) {

  contexto =
    contexto || {};

  const estado =
    mapearEstadoDecisaoV63_(
      reconhecimento
    );

  const melhorSolucao =
    selecionarMelhorSolucaoDecisaoV63_(
      reconhecimento
    );

  const resposta =
    construirRespostaSeguraDecisaoV63_(
      estado,
      {
        reconhecimento:
          reconhecimento,
        contexto:
          contexto
      }
    );

  const segura =
    verificarSegurancaRespostaDecisaoV63_(
      resposta
    );

  if (!segura) {

    throw new Error(
      'Resposta V6.3 reprovada pelo filtro de segurança.'
    );

  }

  const classificacao =
    obterClassificacaoReconhecimentoV63_(
      reconhecimento
    );

  const resultado = {

    versao:
      DECISAO_V63.VERSAO,

    estado:
      estado,

    classificacao_reconhecimento:
      classificacao,

    resolucao_principal:
      melhorSolucao
        ? (
            melhorSolucao.resolucao_id ||
            melhorSolucao.id ||
            ''
          )
        : '',

    solucoes_validadas:
      obterSolucoesValidadasDecisaoV63_(
        reconhecimento
      ).length,

    resposta_cliente:
      resposta,

    resposta_segura:
      true,

    preco_informado:
      false,

    negociacao_realizada:
      false,

    tecnologia_exposta:
      false

  };

  return resultado;

}


/**
 * ============================================================
 * IDEMPOTÊNCIA
 * ============================================================
 */

function mesmaDecisaoV63_(
  decisaoA,
  decisaoB
) {

  if (
    !decisaoA ||
    !decisaoB
  ) {

    return false;

  }

  return (
    decisaoA.versao ===
      decisaoB.versao &&

    decisaoA.estado ===
      decisaoB.estado &&

    decisaoA.classificacao_reconhecimento ===
      decisaoB.classificacao_reconhecimento &&

    decisaoA.resolucao_principal ===
      decisaoB.resolucao_principal &&

    decisaoA.resposta_cliente ===
      decisaoB.resposta_cliente &&

    decisaoA.resposta_segura ===
      decisaoB.resposta_segura &&

    decisaoA.preco_informado ===
      decisaoB.preco_informado &&

    decisaoA.negociacao_realizada ===
      decisaoB.negociacao_realizada &&

    decisaoA.tecnologia_exposta ===
      decisaoB.tecnologia_exposta

  );

}


/**
 * ============================================================
 * ASSERT
 * ============================================================
 */

function assertDecisaoV63_(
  condicao,
  mensagem
) {

  if (!condicao) {

    throw new Error(
      mensagem
    );

  }

}


/**
 * ============================================================
 * TESTES V6.3
 * ============================================================
 *
 * 25 TESTES
 *
 * META:
 *
 * 25/25
 * 100%
 *
 * Sem Gemini.
 *
 * A decisão é determinística.
 *
 * ============================================================
 */

function TESTAR_DECISAO_V63() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'TESTAR_DECISAO_V63'
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


  /*
   * ==========================================================
   * FIXTURES
   * ==========================================================
   */

  const solucaoPerfeita = {

    resolucao_id:
      'RES-DECISAO-PERFEITA',

    titulo_interno:
      'Conferência e lançamento de pedidos',

    status:
      'VALIDADA',

    confianca:
      'ALTA',

    pontuacao:
      96

  };


  const solucaoParcial = {

    resolucao_id:
      'RES-DECISAO-PARCIAL',

    titulo_interno:
      'Apoio ao lançamento de pedidos',

    status:
      'VALIDADA',

    confianca:
      'MEDIA',

    pontuacao:
      72

  };


  /*
   * ==========================================================
   * CENÁRIO 1 — UMA SOLUÇÃO VALIDADA
   * ==========================================================
   */

  const reconhecimento1 = {

    classificacao:
      'SOLUCAO_ENCONTRADA',

    resultados: [
      solucaoPerfeita
    ]

  };


  let decisao1 = null;

  try {

    decisao1 =
      decidirSolucaoV63_(
        reconhecimento1
      );

  } catch (erro) {

    Logger.log(
      'ERRO CENÁRIO 1: ' +
      erro.message
    );

  }


  teste(
    1,
    'Contrato V6.3 disponível',
    !!DECISAO_V63
  );

  teste(
    2,
    'Decisão possui versão V6.3',
    !!(
      decisao1 &&
      decisao1.versao === 'V6.3'
    )
  );

  teste(
    3,
    'Uma solução validada gera SOLUCAO_VALIDADA',
    !!(
      decisao1 &&
      decisao1.estado ===
        'SOLUCAO_VALIDADA'
    )
  );

  teste(
    4,
    'Classificação original é preservada',
    !!(
      decisao1 &&
      decisao1.classificacao_reconhecimento ===
        'SOLUCAO_ENCONTRADA'
    )
  );

  teste(
    5,
    'Melhor solução é identificada',
    !!(
      decisao1 &&
      decisao1.resolucao_principal ===
        'RES-DECISAO-PERFEITA'
    )
  );

  teste(
    6,
    'Quantidade de soluções validadas é correta',
    !!(
      decisao1 &&
      decisao1.solucoes_validadas === 1
    )
  );

  teste(
    7,
    'Resposta ao cliente é produzida',
    !!(
      decisao1 &&
      decisao1.resposta_cliente
    )
  );

  teste(
    8,
    'Resposta é marcada como segura',
    !!(
      decisao1 &&
      decisao1.resposta_segura === true
    )
  );


  /*
   * ==========================================================
   * CENÁRIO 2 — MÚLTIPLAS SOLUÇÕES
   * ==========================================================
   */

  const reconhecimento2 = {

    classificacao:
      'SOLUCOES_ENCONTRADAS',

    resultados: [

      solucaoPerfeita,

      solucaoParcial

    ]

  };


  let decisao2 = null;

  try {

    decisao2 =
      decidirSolucaoV63_(
        reconhecimento2
      );

  } catch (erro) {

    Logger.log(
      'ERRO CENÁRIO 2: ' +
      erro.message
    );

  }


  teste(
    9,
    'Múltiplas soluções geram SOLUCOES_ENCONTRADAS',
    !!(
      decisao2 &&
      decisao2.estado ===
        'SOLUCOES_ENCONTRADAS'
    )
  );

  teste(
    10,
    'Duas soluções validadas são contabilizadas',
    !!(
      decisao2 &&
      decisao2.solucoes_validadas === 2
    )
  );

  teste(
    11,
    'Resposta de múltiplas soluções é produzida',
    !!(
      decisao2 &&
      decisao2.resposta_cliente
    )
  );


  /*
   * ==========================================================
   * CENÁRIO 3 — ABORDAGEM EM ANÁLISE
   * ==========================================================
   */

  const reconhecimento3 = {

    classificacao:
      'ABORDAGEM_EM_ANALISE',

    resultados: [

      {

        resolucao_id:
          'RES-DECISAO-HIPOTESE',

        status:
          'HIPOTESE',

        pontuacao:
          81

      }

    ]

  };


  let decisao3 = null;

  try {

    decisao3 =
      decidirSolucaoV63_(
        reconhecimento3
      );

  } catch (erro) {

    Logger.log(
      'ERRO CENÁRIO 3: ' +
      erro.message
    );

  }


  teste(
    12,
    'Hipótese gera ABORDAGEM_EM_ANALISE',
    !!(
      decisao3 &&
      decisao3.estado ===
        'ABORDAGEM_EM_ANALISE'
    )
  );

  teste(
    13,
    'Hipótese não é apresentada como solução validada',
    !!(
      decisao3 &&
      decisao3.solucoes_validadas === 0
    )
  );


  /*
   * ==========================================================
   * CENÁRIO 4 — NENHUMA SOLUÇÃO VALIDADA
   * ==========================================================
   */

  const reconhecimento4 = {

    classificacao:
      'NENHUMA_SOLUCAO_VALIDADA',

    resultados: [

      {

        resolucao_id:
          'RES-DECISAO-ANALISE',

        status:
          'EM_ANALISE',

        pontuacao:
          74

      }

    ]

  };


  let decisao4 = null;

  try {

    decisao4 =
      decidirSolucaoV63_(
        reconhecimento4
      );

  } catch (erro) {

    Logger.log(
      'ERRO CENÁRIO 4: ' +
      erro.message
    );

  }


  teste(
    14,
    'Nenhuma solução validada gera ANALISE_NECESSARIA',
    !!(
      decisao4 &&
      decisao4.estado ===
        'ANALISE_NECESSARIA'
    )
  );

  teste(
    15,
    'Solução em análise não é tratada como validada',
    !!(
      decisao4 &&
      decisao4.solucoes_validadas === 0
    )
  );


  /*
   * ==========================================================
   * CENÁRIO 5 — NENHUMA CORRESPONDÊNCIA
   * ==========================================================
   */

  const reconhecimento5 = {

    classificacao:
      'NENHUMA_CORRESPONDENCIA',

    resultados: []

  };


  let decisao5 = null;

  try {

    decisao5 =
      decidirSolucaoV63_(
        reconhecimento5
      );

  } catch (erro) {

    Logger.log(
      'ERRO CENÁRIO 5: ' +
      erro.message
    );

  }


  teste(
    16,
    'Nenhuma correspondência gera ANALISE_NECESSARIA',
    !!(
      decisao5 &&
      decisao5.estado ===
        'ANALISE_NECESSARIA'
    )
  );

  teste(
    17,
    'Nenhuma correspondência não gera solução inventada',
    !!(
      decisao5 &&
      decisao5.resolucao_principal === ''
    )
  );


  /*
   * ==========================================================
   * SEGURANÇA
   * ==========================================================
   */

  teste(
    18,
    'Resposta de solução validada não expõe tecnologia',
    !!(
      decisao1 &&
      verificarSegurancaRespostaDecisaoV63_(
        decisao1.resposta_cliente
      ) === true
    )
  );

  teste(
    19,
    'Resposta de análise não expõe tecnologia',
    !!(
      decisao5 &&
      verificarSegurancaRespostaDecisaoV63_(
        decisao5.resposta_cliente
      ) === true
    )
  );

  teste(
    20,
    'Filtro rejeita API',
    verificarSegurancaRespostaDecisaoV63_(
      'Nossa solução utiliza uma API.'
    ) === false
  );

  teste(
    21,
    'Filtro rejeita preço',
    verificarSegurancaRespostaDecisaoV63_(
      'O preço da solução é R$ 5.000.'
    ) === false
  );

  teste(
    22,
    'Filtro rejeita arquitetura',
    verificarSegurancaRespostaDecisaoV63_(
      'Nossa arquitetura resolve o problema.'
    ) === false
  );


  /*
   * ==========================================================
   * IDEMPOTÊNCIA
   * ==========================================================
   */

  let decisao1b = null;

  try {

    decisao1b =
      decidirSolucaoV63_(
        reconhecimento1
      );

  } catch (erro) {

    Logger.log(
      'ERRO IDEMPOTÊNCIA: ' +
      erro.message
    );

  }


  teste(
    23,
    'Decisão é determinística',
    mesmaDecisaoV63_(
      decisao1,
      decisao1b
    )
  );


  /*
   * ==========================================================
   * FRONTEIRA COMERCIAL
   * ==========================================================
   */

  teste(
    24,
    'Decisão não informa preço',
    !!(
      decisao1 &&
      decisao1.preco_informado === false
    )
  );

  teste(
    25,
    'Decisão não realiza negociação',
    !!(
      decisao1 &&
      decisao1.negociacao_realizada === false &&
      decisao1.tecnologia_exposta === false
    )
  );


  /*
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
      '🏆 TESTAR_DECISAO_V63: PASSOU'
    );

    Logger.log(
      '🏆 DECISÃO V6.3: 100%'
    );

  } else {

    Logger.log(
      '❌ TESTAR_DECISAO_V63: FALHOU'
    );

  }

}