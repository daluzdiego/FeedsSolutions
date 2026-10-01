/**
 * ============================================================
 * FEEDS SOLUTIONS
 * INTEGRAÇÃO V6.3
 * ============================================================
 *
 * Responsabilidade:
 *
 * Mensagem natural
 *      ↓
 * Interpretação Semântica V6.3
 *      ↓
 * Preparação para reconhecimento
 *      ↓
 * Biblioteca de Resoluções
 *      ↓
 * Reconhecimento
 *      ↓
 * Classificação
 *
 * Este arquivo NÃO:
 * - define preços;
 * - negocia;
 * - expõe tecnologia;
 * - altera a biblioteca;
 * - altera a interpretação;
 * - altera o motor de reconhecimento.
 *
 * Ele apenas integra os contratos já aprovados.
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * CONTRATO DA INTEGRAÇÃO
 * ------------------------------------------------------------
 */

const INTEGRACAO_V63 = {

  VERSAO: 'V6.3',

  CLASSIFICACOES: {
    SOLUCAO_ENCONTRADA:
      'SOLUCAO_ENCONTRADA',

    SOLUCOES_ENCONTRADAS:
      'SOLUCOES_ENCONTRADAS',

    NENHUMA_SOLUCAO_VALIDADA:
      'NENHUMA_SOLUCAO_VALIDADA',

    ABORDAGEM_IDENTIFICADA:
      'ABORDAGEM_IDENTIFICADA',

    ANALISE_NECESSARIA:
      'ANALISE_NECESSARIA'
  },

  ESTADOS: {
    CONHECIMENTO_EXISTENTE:
      'CONHECIMENTO_EXISTENTE',

    SOLUCAO_DESCOBERTA:
      'SOLUCAO_DESCOBERTA',

    SOLUCAO_EM_DESENVOLVIMENTO:
      'SOLUCAO_EM_DESENVOLVIMENTO',

    SOLUCAO_VALIDADA:
      'SOLUCAO_VALIDADA'
  }
};


/**
 * ------------------------------------------------------------
 * NORMALIZAÇÃO
 * ------------------------------------------------------------
 */

function normalizarIntegracaoV63_(valor) {

  if (
    valor === null ||
    valor === undefined
  ) {
    return '';
  }

  return String(valor)
    .trim();
}


/**
 * ------------------------------------------------------------
 * VALIDAR INTERPRETAÇÃO
 * ------------------------------------------------------------
 */

function validarEntradaIntegracaoV63_(
  interpretacao
) {

  if (
    !interpretacao ||
    typeof interpretacao !== 'object'
  ) {
    return false;
  }

  if (
    interpretacao.versao !== 'V6.3'
  ) {
    return false;
  }

  return true;
}


/**
 * ------------------------------------------------------------
 * DETERMINAR CLASSIFICAÇÃO
 * ------------------------------------------------------------
 *
 * Regra:
 *
 * 1 solução validada
 * → SOLUCAO_ENCONTRADA
 *
 * mais de 1 solução validada
 * → SOLUCOES_ENCONTRADAS
 *
 * nenhuma validada, mas há abordagem/relação
 * → ABORDAGEM_IDENTIFICADA
 *
 * nenhuma relação
 * → ANALISE_NECESSARIA
 *
 * A classificação NÃO significa que uma solução foi
 * tecnicamente implementada.
 * ------------------------------------------------------------
 */

function determinarClassificacaoIntegracaoV63_(
  reconhecimento
) {

  if (
    !reconhecimento ||
    typeof reconhecimento !== 'object'
  ) {
    return (
      INTEGRACAO_V63.CLASSIFICACOES
        .ANALISE_NECESSARIA
    );
  }

  const resultados =
    Array.isArray(
      reconhecimento.resultados
    )
      ? reconhecimento.resultados
      : Array.isArray(
          reconhecimento.resolucoes
        )
        ? reconhecimento.resolucoes
        : [];

  const quantidade =
    resultados.length;

  if (quantidade === 0) {

    return (
      INTEGRACAO_V63.CLASSIFICACOES
        .ANALISE_NECESSARIA
    );
  }

  const validadas =
    resultados.filter(
      function(item) {

        if (!item) {
          return false;
        }

        const status =
          normalizarIntegracaoV63_(
            item.status
          ).toUpperCase();

        return (
          status === 'VALIDADA'
        );
      }
    );

  if (
    validadas.length === 1
  ) {

    return (
      INTEGRACAO_V63.CLASSIFICACOES
        .SOLUCAO_ENCONTRADA
    );
  }

  if (
    validadas.length > 1
  ) {

    return (
      INTEGRACAO_V63.CLASSIFICACOES
        .SOLUCOES_ENCONTRADAS
    );
  }

  return (
    INTEGRACAO_V63.CLASSIFICACOES
      .ABORDAGEM_IDENTIFICADA
  );
}


/**
 * ------------------------------------------------------------
 * DETERMINAR ESTADO INTERNO
 * ------------------------------------------------------------
 */

function determinarEstadoIntegracaoV63_(
  reconhecimento
) {

  if (
    !reconhecimento ||
    typeof reconhecimento !== 'object'
  ) {

    return (
      INTEGRACAO_V63.ESTADOS
        .SOLUCAO_DESCOBERTA
    );
  }

  const resultados =
    Array.isArray(
      reconhecimento.resultados
    )
      ? reconhecimento.resultados
      : Array.isArray(
          reconhecimento.resolucoes
        )
        ? reconhecimento.resolucoes
        : [];

  const validadas =
    resultados.filter(
      function(item) {

        return (
          item &&
          normalizarIntegracaoV63_(
            item.status
          ).toUpperCase() ===
            'VALIDADA'
        );
      }
    );

  if (
    validadas.length > 0
  ) {

    return (
      INTEGRACAO_V63.ESTADOS
        .SOLUCAO_VALIDADA
    );
  }

  if (
    resultados.length > 0
  ) {

    return (
      INTEGRACAO_V63.ESTADOS
        .SOLUCAO_DESCOBERTA
    );
  }

  return (
    INTEGRACAO_V63.ESTADOS
      .SOLUCAO_DESCOBERTA
  );
}


/**
 * ------------------------------------------------------------
 * SEGURANÇA
 * ------------------------------------------------------------
 *
 * A integração pode trabalhar internamente com dados
 * técnicos da biblioteca, mas não deve produzir uma
 * resposta externa contendo implementação.
 * ------------------------------------------------------------
 */

function verificarSegurancaIntegracaoV63_(
  resultado
) {

  if (
    resultado === null ||
    resultado === undefined
  ) {
    return true;
  }

  const texto =
    JSON.stringify(
      resultado
    ).toLowerCase();

  const termosProibidos = [
    'api',
    'endpoint',
    'token',
    'apikey',
    'arquitetura',
    'código fonte',
    'codigo fonte',
    'script',
    'sql',
    'database',
    'banco de dados',
    'prompt',
    'modelo de ia',
    'gemini'
  ];

  return !termosProibidos.some(
    function(termo) {

      return texto.indexOf(
        termo
      ) !== -1;

    }
  );
}


/**
 * ------------------------------------------------------------
 * CONSTRUIR RESULTADO DA INTEGRAÇÃO
 * ------------------------------------------------------------
 */

function construirResultadoIntegracaoV63_(
  interpretacao,
  reconhecimento
) {

  const classificacao =
    determinarClassificacaoIntegracaoV63_(
      reconhecimento
    );

  const estado =
    determinarEstadoIntegracaoV63_(
      reconhecimento
    );

  return {

    versao:
      INTEGRACAO_V63.VERSAO,

    interpretacao:
      interpretacao,

    reconhecimento:
      reconhecimento,

    classificacao:
      classificacao,

    estado:
      estado,

    possui_solucao_validada:
      classificacao ===
        INTEGRACAO_V63.CLASSIFICACOES
          .SOLUCAO_ENCONTRADA ||
      classificacao ===
        INTEGRACAO_V63.CLASSIFICACOES
          .SOLUCOES_ENCONTRADAS,

    analise_necessaria:
      classificacao ===
        INTEGRACAO_V63.CLASSIFICACOES
          .ANALISE_NECESSARIA,

    segura:
      verificarSegurancaIntegracaoV63_(
        reconhecimento
      )
  };
}


/**
 * ------------------------------------------------------------
 * INTEGRAR INTERPRETAÇÃO COM BIBLIOTECA
 * ------------------------------------------------------------
 */

function integrarInterpretacaoBibliotecaV63_(
  interpretacao
) {

  if (
    !validarEntradaIntegracaoV63_(
      interpretacao
    )
  ) {

    return {
      sucesso: false,
      erro:
        'INTERPRETACAO_INVALIDA',
      versao:
        INTEGRACAO_V63.VERSAO
    };
  }


  /*
   * A interpretação semântica já possui
   * o contrato necessário para o reconhecimento.
   */

  const entradaReconhecimento =
    prepararParaReconhecimentoV63_(
      interpretacao
    );


  if (
    !entradaReconhecimento
  ) {

    return {
      sucesso: false,
      erro:
        'PREPARACAO_RECONHECIMENTO_FALHOU',
      versao:
        INTEGRACAO_V63.VERSAO
    };
  }


  /*
   * Busca relacionada.
   */

  const reconhecimento =
    buscarResolucoesRelacionadasV63_(
      entradaReconhecimento
    );


  const resultado =
    construirResultadoIntegracaoV63_(
      interpretacao,
      reconhecimento
    );


  resultado.entrada_reconhecimento =
    entradaReconhecimento;


  resultado.sucesso = true;


  return resultado;
}


/**
 * ------------------------------------------------------------
 * INTEGRAÇÃO DIRETA A PARTIR DE MENSAGEM
 * ------------------------------------------------------------
 *
 * Esta função representa o primeiro fluxo real:
 *
 * mensagem
 * ↓
 * IA semântica
 * ↓
 * biblioteca
 *
 * Ainda NÃO faz parte do fluxo principal.
 * ------------------------------------------------------------
 */

function processarMensagemIntegracaoV63_(
  mensagem
) {

  const texto =
    normalizarIntegracaoV63_(
      mensagem
    );

  if (!texto) {

    return {
      sucesso: false,
      erro:
        'MENSAGEM_VAZIA',
      versao:
        INTEGRACAO_V63.VERSAO
    };
  }


  const interpretacao =
    interpretarMensagemSemanticaV63_(
      texto
    );


  if (
    !interpretacao
  ) {

    return {
      sucesso: false,
      erro:
        'INTERPRETACAO_NAO_GERADA',
      versao:
        INTEGRACAO_V63.VERSAO
    };
  }


  return integrarInterpretacaoBibliotecaV63_(
    interpretacao
  );
}


/**
 * ============================================================
 * TESTE DA INTEGRAÇÃO
 * ============================================================
 */

function TESTAR_INTEGRACAO_SEMANTICA_BIBLIOTECA_V63() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'TESTAR_INTEGRACAO_SEMANTICA_BIBLIOTECA_V63'
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
   * ----------------------------------------------------------
   * CENÁRIO CONTROLADO
   * ----------------------------------------------------------
   */

  const interpretacao = {

    versao: 'V6.3',

    problema:
      'Erros e retrabalho no lançamento manual de pedidos.',

    processo:
      'Equipe recebe pedidos e lança manualmente em planilha.',

    dores: [
      'erros de digitação',
      'retrabalho'
    ],

    impactos: [
      'perda de tempo',
      'necessidade de correções'
    ],

    resultado_desejado:
      'reduzir erros e retrabalho',

    contexto:
      'processo administrativo',

    restricoes: [],

    padrao_problema:
      'processo manual sujeito a erros',

    status: {

      problema:
        'CONFIRMADO',

      processo:
        'CONFIRMADO',

      dores:
        'CONFIRMADO',

      impactos:
        'CONFIRMADO',

      resultado_desejado:
        'CONFIRMADO',

      contexto:
        'CONFIRMADO',

      restricoes:
        'DESCONHECIDO',

      padrao_problema:
        'INFERIDO'
    }
  };


  teste(
    1,
    'Interpretação V6.3 é aceita',
    validarEntradaIntegracaoV63_(
      interpretacao
    ) === true
  );


  let entrada = null;

  try {

    entrada =
      prepararParaReconhecimentoV63_(
        interpretacao
      );

  } catch (erro) {

    Logger.log(
      'ERRO PREPARAÇÃO: ' +
      erro.message
    );
  }


  teste(
    2,
    'Interpretação é preparada para reconhecimento',
    !!entrada
  );


  let reconhecimento = null;

  try {

    reconhecimento =
      buscarResolucoesRelacionadasV63_(
        entrada
      );

  } catch (erro) {

    Logger.log(
      'ERRO RECONHECIMENTO: ' +
      erro.message
    );
  }


  teste(
    3,
    'Reconhecimento retorna estrutura',
    !!(
      reconhecimento &&
      typeof reconhecimento ===
        'object'
    )
  );


  teste(
    4,
    'Reconhecimento não é null',
    reconhecimento !== null
  );


  const resultado =
    construirResultadoIntegracaoV63_(
      interpretacao,
      reconhecimento
    );


  teste(
    5,
    'Resultado possui versão V6.3',
    resultado.versao === 'V6.3'
  );


  teste(
    6,
    'Resultado possui interpretação',
    !!resultado.interpretacao
  );


  teste(
    7,
    'Resultado possui reconhecimento',
    !!(
      resultado &&
      resultado.reconhecimento !==
        undefined
    )
  );


  teste(
    8,
    'Classificação foi determinada',
    !!resultado.classificacao
  );


  teste(
    9,
    'Estado interno foi determinado',
    !!resultado.estado
  );


  teste(
    10,
    'Resultado possui indicador de solução validada',
    typeof resultado.possui_solucao_validada ===
      'boolean'
  );


  teste(
    11,
    'Resultado possui indicador de análise necessária',
    typeof resultado.analise_necessaria ===
      'boolean'
  );


  teste(
    12,
    'Resultado possui estado de segurança',
    typeof resultado.segura ===
      'boolean'
  );


  let integracaoCompleta = null;

  try {

    integracaoCompleta =
      integrarInterpretacaoBibliotecaV63_(
        interpretacao
      );

  } catch (erro) {

    Logger.log(
      'ERRO INTEGRAÇÃO COMPLETA: ' +
      erro.message
    );
  }


  teste(
    13,
    'Entrada de reconhecimento é preservada',
    !!(
      integracaoCompleta &&
      integracaoCompleta.entrada_reconhecimento
    )
  );


  teste(
    14,
    'Interpretação original não é alterada',
    interpretacao.problema ===
      'Erros e retrabalho no lançamento manual de pedidos.'
  );


  teste(
    15,
    'Integração não expõe preço',
    JSON.stringify(
      resultado
    )
      .toLowerCase()
      .indexOf('preço') === -1 &&
    JSON.stringify(
      resultado
    )
      .toLowerCase()
      .indexOf('preco') === -1
  );


  teste(
    16,
    'Integração não cria tecnologia',
    verificarSegurancaIntegracaoV63_(
      resultado.reconhecimento
    ) === true
  );


  teste(
    17,
    'Integração é determinística estruturalmente',
    resultado.classificacao ===
      determinarClassificacaoIntegracaoV63_(
        reconhecimento
      )
  );


  teste(
    18,
    'Estado permanece consistente',
    resultado.estado ===
      determinarEstadoIntegracaoV63_(
        reconhecimento
      )
  );


  teste(
    19,
    'Entrada vazia é rejeitada',
    validarEntradaIntegracaoV63_(
      null
    ) === false
  );


  teste(
    20,
    'Versão incorreta é rejeitada',
    validarEntradaIntegracaoV63_({
      versao: 'V6.2'
    }) === false
  );


  teste(
    21,
    'Objeto vazio é rejeitado',
    validarEntradaIntegracaoV63_(
      {}
    ) === false
  );


  teste(
    22,
    'Mensagem vazia é rejeitada',
    processarMensagemIntegracaoV63_(
      ''
    ).sucesso === false
  );


  teste(
    23,
    'Classificação sem reconhecimento exige análise',
    determinarClassificacaoIntegracaoV63_(
      null
    ) ===
      INTEGRACAO_V63.CLASSIFICACOES
        .ANALISE_NECESSARIA
  );


  teste(
    24,
    'Estado sem reconhecimento permanece interno',
    determinarEstadoIntegracaoV63_(
      null
    ) ===
      INTEGRACAO_V63.ESTADOS
        .SOLUCAO_DESCOBERTA
  );


  teste(
    25,
    'Integração não contém mecanismo de preço',
    JSON.stringify(
      INTEGRACAO_V63
    )
      .toLowerCase()
      .indexOf('preco') === -1 &&
    JSON.stringify(
      INTEGRACAO_V63
    )
      .toLowerCase()
      .indexOf('preço') === -1
  );


  const percentual =
    Math.round(
      (
        aprovados /
        (
          aprovados +
          falhas
        )
      ) * 100
    );


  Logger.log(
    'APROVADOS: ' +
    aprovados +
    '/' +
    (
      aprovados +
      falhas
    )
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
    falhas === 0 &&
    percentual === 100
  ) {

    Logger.log(
      '🏆 TESTAR_INTEGRACAO_SEMANTICA_BIBLIOTECA_V63: PASSOU'
    );

    Logger.log(
      '🏆 INTEGRAÇÃO SEMÂNTICA → BIBLIOTECA V6.3: 100%'
    );

  } else {

    Logger.log(
      '❌ TESTAR_INTEGRACAO_SEMANTICA_BIBLIOTECA_V63: FALHOU'
    );
  }
}

function DIAGNOSTICAR_INTEGRACAO_V63() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'DIAGNÓSTICO INTEGRAÇÃO V6.3'
  );

  const interpretacao = {

    versao: 'V6.3',

    problema:
      'Erros e retrabalho no lançamento manual de pedidos.',

    processo:
      'Equipe recebe pedidos e lança manualmente em planilha.',

    dores: [
      'erros de digitação',
      'retrabalho'
    ],

    impactos: [
      'perda de tempo'
    ],

    resultado_desejado:
      'reduzir erros e retrabalho',

    contexto:
      'processo administrativo',

    restricoes: [],

    padrao_problema:
      'processo manual sujeito a erros',

    status: {

      problema: 'CONFIRMADO',
      processo: 'CONFIRMADO',
      dores: 'CONFIRMADO',
      impactos: 'CONFIRMADO',
      resultado_desejado: 'CONFIRMADO',
      contexto: 'CONFIRMADO',
      restricoes: 'DESCONHECIDO',
      padrao_problema: 'INFERIDO'
    }
  };


  const entrada =
    prepararParaReconhecimentoV63_(
      interpretacao
    );


  Logger.log(
    'ENTRADA RECONHECIMENTO:'
  );

  Logger.log(
    JSON.stringify(
      entrada,
      null,
      2
    )
  );


  const resultado =
    integrarInterpretacaoBibliotecaV63_(
      interpretacao
    );


  Logger.log(
    'RESULTADO INTEGRAÇÃO:'
  );

  Logger.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );


  Logger.log(
    'TIPO resultado: ' +
    typeof resultado
  );


  Logger.log(
    'POSSUI entrada_reconhecimento: ' +
    (
      resultado &&
      resultado.entrada_reconhecimento !==
        undefined
    )
  );


  Logger.log(
    'VALOR entrada_reconhecimento:'
  );

  Logger.log(
    JSON.stringify(
      resultado &&
      resultado.entrada_reconhecimento,
      null,
      2
    )
  );


  Logger.log(
    '============================================================'
  );
}

/**
 * ============================================================
 * FEEDS SOLUTIONS
 * INTEGRAÇÃO DO CICLO V6.3
 * ============================================================
 *
 * TESTE DE INTEGRAÇÃO REAL:
 *
 * MENSAGEM NATURAL
 *      ↓
 * IA SEMÂNTICA
 *      ↓
 * INTERPRETAÇÃO V6.3
 *      ↓
 * RECONHECIMENTO DA BIBLIOTECA
 *      ↓
 * DECISÃO V6.3
 *      ↓
 * RESPOSTA SEGURA
 *
 * Este teste NÃO altera o fluxo principal.
 *
 * Ele valida a nova cadeia antes de conectá-la
 * definitivamente ao sistema principal.
 *
 * ============================================================
 */


/**
 * ============================================================
 * TESTE DE INTEGRAÇÃO V6.3
 * ============================================================
 */

function TESTAR_INTEGRACAO_CICLO_V63() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'TESTAR_INTEGRACAO_CICLO_V63'
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
   * DADOS DO CENÁRIO
   * ==========================================================
   */

  const mensagem =
    'Hoje minha equipe recebe pedidos pelo WhatsApp ' +
    'e precisa conferir e lançar tudo manualmente em ' +
    'uma planilha. Isso gera erros de digitação e muito ' +
    'retrabalho. Perdemos bastante tempo todos os dias. ' +
    'Queremos reduzir os erros e o retrabalho, mantendo ' +
    'a qualidade do processo.';


  const resolucaoId =
    'RES-INTEGRACAO-V63-' +
    Date.now();


  /**
   * ==========================================================
   * 1 — INTERPRETAÇÃO SEMÂNTICA REAL
   * ==========================================================
   */

  let interpretacao = null;
  let erroInterpretacao = null;


  try {

    interpretacao =
      interpretarMensagemSemanticaV63_(
        mensagem
      );

  } catch (erro) {

    erroInterpretacao = erro;

    Logger.log(
      'ERRO INTERPRETAÇÃO: ' +
      erro.message
    );

  }


  teste(
    1,
    'Gemini gerou interpretação semântica',
    !!interpretacao
  );


  teste(
    2,
    'Interpretação possui versão V6.3',
    !!(
      interpretacao &&
      interpretacao.versao === 'V6.3'
    )
  );


  teste(
    3,
    'Problema foi interpretado',
    !!(
      interpretacao &&
      interpretacao.problema
    )
  );


  teste(
    4,
    'Processo foi interpretado',
    !!(
      interpretacao &&
      interpretacao.processo
    )
  );


  teste(
    5,
    'Dores foram estruturadas',
    !!(
      interpretacao &&
      Array.isArray(
        interpretacao.dores
      ) &&
      interpretacao.dores.length > 0
    )
  );


  teste(
    6,
    'Impactos foram estruturados',
    !!(
      interpretacao &&
      Array.isArray(
        interpretacao.impactos
      ) &&
      interpretacao.impactos.length > 0
    )
  );


  teste(
    7,
    'Resultado desejado foi identificado',
    !!(
      interpretacao &&
      interpretacao.resultado_desejado
    )
  );


  teste(
    8,
    'Interpretação é válida',
    !!(
      interpretacao &&
      (
        validarInterpretacaoSemanticaV63_(
          interpretacao
        ) === true ||
        (
          validarInterpretacaoSemanticaV63_(
            interpretacao
          ) &&
          validarInterpretacaoSemanticaV63_(
            interpretacao
          ).valido === true
        )
      )
    )
  );


  /**
   * ==========================================================
   * 2 — PREPARAÇÃO PARA RECONHECIMENTO
   * ==========================================================
   */

  let investigacao = null;


  try {

    investigacao =
      prepararParaReconhecimentoV63_(
        interpretacao
      );

  } catch (erro) {

    Logger.log(
      'ERRO PREPARAÇÃO: ' +
      erro.message
    );

  }


  teste(
    9,
    'Interpretação pode alimentar reconhecimento',
    !!investigacao
  );


  teste(
    10,
    'Reconhecimento recebe o problema',
    !!(
      investigacao &&
      investigacao.problema_central
    )
  );


  teste(
    11,
    'Reconhecimento recebe o processo',
    !!(
      investigacao &&
      investigacao.processo
    )
  );


  teste(
    12,
    'Reconhecimento recebe as dores',
    !!(
      investigacao &&
      Array.isArray(
        investigacao.pontos_de_dor
      )
    )
  );


  /**
   * ==========================================================
   * 3 — CRIAÇÃO DE RESOLUÇÃO VALIDADA TEMPORÁRIA
   * ==========================================================
   *
   * A resolução é construída a partir da própria
   * interpretação real.
   *
   * Isso permite testar a cadeia completa sem depender
   * de dados permanentes da biblioteca.
   *
   * ==========================================================
   */

  const resolucaoTeste = {

    resolucao_id:
      resolucaoId,

    titulo_interno:
      'Resolução validada para conferência e lançamento de pedidos',

    descricao_problema:
      interpretacao.problema || '',

    padrao_problema:
      interpretacao.padrao_problema || '',

    processo:
      interpretacao.processo || '',

    dores:
      Array.isArray(
        interpretacao.dores
      )
        ? interpretacao.dores
        : [],

    impactos:
      Array.isArray(
        interpretacao.impactos
      )
        ? interpretacao.impactos
        : [],

    resultados_desejados:
      interpretacao.resultado_desejado
        ? [
            interpretacao.resultado_desejado
          ]
        : [],

    contexto:
      interpretacao.contexto || '',

    restricoes:
      Array.isArray(
        interpretacao.restricoes
      )
        ? interpretacao.restricoes
        : [],

    abordagem_interna:
      'Conteúdo interno de engenharia',

    descricao_solucao_interna:
      'Conteúdo interno de engenharia',

    alternativas:
      [],

    status:
      'VALIDADA',

    confianca:
      'ALTA',

    evidencias:
      [
        'caso de integração V6.3'
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
      'ERRO SALVAR RESOLUÇÃO: ' +
      erro.message
    );

  }


  teste(
    13,
    'Resolução temporária foi persistida',
    !!(
      retornoSalvar &&
      retornoSalvar.resolucao_id
    )
  );


  const resolucaoPersistida =
    buscarResolucaoV63_({
      resolucao_id:
        resolucaoId
    });


  teste(
    14,
    'Resolução persistida está disponível',
    !!resolucaoPersistida
  );


  teste(
    15,
    'Resolução persistida está VALIDADA',
    !!(
      resolucaoPersistida &&
      resolucaoPersistida.status ===
        'VALIDADA'
    )
  );


  /**
   * ==========================================================
   * 4 — RECONHECIMENTO REAL
   * ==========================================================
   */

  let resultados = [];


  try {

    resultados =
      buscarResolucoesRelacionadasV63_(
        investigacao,
        {
          pontuacao_minima: 20
        }
      );

  } catch (erro) {

    Logger.log(
      'ERRO RECONHECIMENTO: ' +
      erro.message
    );

  }


  teste(
    16,
    'Reconhecimento encontra a resolução',
    resultados.some(
      function(item) {

        return (
          item &&
          item.resolucao_id ===
            resolucaoId
        );

      }
    )
  );


  const classificacao =
    classificarReconhecimentoV63_(
      resultados
    );


  teste(
    17,
    'Reconhecimento produz classificação',
    !!(
      classificacao &&
      classificacao.classificacao
    )
  );


  teste(
    18,
    'Reconhecimento identifica solução validada',
    !!(
      classificacao &&
      (
        classificacao.classificacao ===
          'SOLUCAO_ENCONTRADA' ||
        classificacao.classificacao ===
          'SOLUCOES_ENCONTRADAS'
      )
    )
  );


  /**
   * ==========================================================
   * 5 — DECISÃO V6.3
   * ==========================================================
   */

  const reconhecimento = {

    classificacao:
      classificacao.classificacao,

    resultados:
      resultados

  };


  let decisao = null;


  try {

    decisao =
      decidirSolucaoV63_(
        reconhecimento,
        {
          interpretacao:
            interpretacao
        }
      );

  } catch (erro) {

    Logger.log(
      'ERRO DECISÃO: ' +
      erro.message
    );

  }


  teste(
    19,
    'Decisão V6.3 é produzida',
    !!decisao
  );


  teste(
    20,
    'Decisão identifica solução validada',
    !!(
      decisao &&
      decisao.estado ===
        'SOLUCAO_VALIDADA'
    )
  );


  teste(
    21,
    'Decisão mantém a resolução principal',
    !!(
      decisao &&
      decisao.resolucao_principal ===
        resolucaoId
    )
  );


  /**
   * ==========================================================
   * 6 — RESPOSTA SEGURA
   * ==========================================================
   */

  let respostaSegura = null;


  try {

    respostaSegura =
      gerarRespostaSeguraV63_(
        decisao
      );

  } catch (erro) {

    Logger.log(
      'ERRO RESPOSTA SEGURA: ' +
      erro.message
    );

  }


  teste(
    22,
    'Resposta segura é produzida',
    !!(
      respostaSegura &&
      respostaSegura.resposta_cliente
    )
  );


  teste(
    23,
    'Resposta é marcada como segura',
    !!(
      respostaSegura &&
      respostaSegura.resposta_segura ===
        true
    )
  );


  teste(
    24,
    'Resposta não expõe tecnologia ou comércio',
    !!(
      respostaSegura &&
      respostaSegura.tecnologia_exposta ===
        false &&
      respostaSegura.informacao_comercial_exposta ===
        false
    )
  );


  /**
   * ==========================================================
   * 7 — VERIFICAÇÃO FINAL DA MENSAGEM
   * ==========================================================
   */

  let verificacaoFinal = null;


  try {

    verificacaoFinal =
      verificarSegurancaRespostaSeguraV63_(
        respostaSegura
          ? respostaSegura.resposta_cliente
          : ''
      );

  } catch (erro) {

    Logger.log(
      'ERRO FILTRO FINAL: ' +
      erro.message
    );

  }


  teste(
    25,
    'Resposta final passa pelo filtro de segurança',
    !!(
      verificacaoFinal &&
      verificacaoFinal.segura === true
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
      '⚠️ AVISO LIMPEZA V6.3: ' +
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
      '🏆 TESTAR_INTEGRACAO_CICLO_V63: PASSOU'
    );

    Logger.log(
      '🏆 CICLO V6.3 INTEGRADO: 100%'
    );

  } else {

    Logger.log(
      '❌ TESTAR_INTEGRACAO_CICLO_V63: FALHOU'
    );

  }

}

function TESTAR_CENARIO_SEM_SOLUCAO_V63() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'TESTAR_CENARIO_SEM_SOLUCAO_V63'
  );

  Logger.log(
    'CENÁRIO: CLIENTE COM PROBLEMA SEM SOLUÇÃO ENCONTRADA'
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
   * CENÁRIO
   * ==========================================================
   *
   * O cenário utiliza um problema deliberadamente específico
   * e sem correspondência esperada na biblioteca.
   *
   * Não criamos nenhuma resolução temporária.
   *
   * O objetivo é provar o comportamento quando a biblioteca
   * realmente não encontra uma solução.
   * ==========================================================
   */

  const mensagem =
    'Nossa empresa possui um processo muito específico de ' +
    'reconciliação manual de microcristais de neblina quântica ' +
    'utilizados em um protocolo interno de calibração atmosférica. ' +
    'A equipe registra cada ocorrência manualmente em anotações ' +
    'separadas, perde muito tempo conferindo os registros e ' +
    'precisamos encontrar uma forma de organizar esse processo ' +
    'e reduzir os erros de conferência.';


  /**
   * ==========================================================
   * 1 — INTERPRETAÇÃO SEMÂNTICA REAL
   * ==========================================================
   */

  let interpretacao = null;

  try {

    interpretacao =
      interpretarMensagemSemanticaV63_(
        mensagem
      );

  } catch (erro) {

    Logger.log(
      'ERRO INTERPRETAÇÃO: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    1,
    'IA gerou interpretação semântica',
    !!interpretacao
  );


  teste(
    2,
    'Interpretação possui versão V6.3',
    !!(
      interpretacao &&
      interpretacao.versao === 'V6.3'
    )
  );


  teste(
    3,
    'Problema foi identificado',
    !!(
      interpretacao &&
      interpretacao.problema
    )
  );


  teste(
    4,
    'Processo foi identificado',
    !!(
      interpretacao &&
      interpretacao.processo
    )
  );


  teste(
    5,
    'Dores foram estruturadas',
    !!(
      interpretacao &&
      Array.isArray(
        interpretacao.dores
      ) &&
      interpretacao.dores.length > 0
    )
  );


  teste(
    6,
    'Impactos foram estruturados',
    !!(
      interpretacao &&
      Array.isArray(
        interpretacao.impactos
      ) &&
      interpretacao.impactos.length > 0
    )
  );


  teste(
    7,
    'Resultado desejado foi identificado',
    !!(
      interpretacao &&
      interpretacao.resultado_desejado
    )
  );


  let interpretacaoValida = false;

  try {

    const validacao =
      validarInterpretacaoSemanticaV63_(
        interpretacao
      );

    interpretacaoValida =
      validacao === true ||
      (
        validacao &&
        validacao.valido === true
      );

  } catch (erro) {

    Logger.log(
      'ERRO VALIDAÇÃO: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    8,
    'Interpretação semântica é válida',
    interpretacaoValida
  );


  /**
   * ==========================================================
   * 2 — PREPARAÇÃO PARA RECONHECIMENTO
   * ==========================================================
   */

  let entradaReconhecimento = null;

  try {

    entradaReconhecimento =
      prepararParaReconhecimentoV63_(
        interpretacao
      );

  } catch (erro) {

    Logger.log(
      'ERRO PREPARAÇÃO: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    9,
    'Interpretação pode alimentar reconhecimento',
    !!entradaReconhecimento
  );


  teste(
    10,
    'Reconhecimento recebe o problema',
    !!(
      entradaReconhecimento &&
      (
        entradaReconhecimento.problema_central ||
        entradaReconhecimento.problema
      )
    )
  );


  teste(
    11,
    'Reconhecimento recebe o processo',
    !!(
      entradaReconhecimento &&
      entradaReconhecimento.processo
    )
  );


  teste(
    12,
    'Reconhecimento recebe as dores',
    !!(
      entradaReconhecimento &&
      Array.isArray(
        entradaReconhecimento.pontos_de_dor
      )
    )
  );


  /**
   * ==========================================================
   * 3 — RECONHECIMENTO
   * ==========================================================
   *
   * Utilizamos pontuação mínima de 99 para garantir que este
   * cenário só considere uma correspondência praticamente
   * idêntica como solução encontrada.
   *
   * Como não existe resolução criada para este cenário,
   * esperamos uma lista vazia.
   * ==========================================================
   */

  let resultados = [];

  try {

    resultados =
      buscarResolucoesRelacionadasV63_(
        entradaReconhecimento,
        {
          pontuacao_minima: 99
        }
      );

  } catch (erro) {

    Logger.log(
      'ERRO RECONHECIMENTO: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    13,
    'Reconhecimento executou sem erro',
    Array.isArray(resultados)
  );


  teste(
    14,
    'Nenhuma correspondência foi encontrada',
    Array.isArray(resultados) &&
    resultados.length === 0
  );


  /**
   * ==========================================================
   * 4 — CLASSIFICAÇÃO V6.3
   * ==========================================================
   */

  const reconhecimento = {
    classificacao:
      INTEGRACAO_V63.CLASSIFICACOES
        .ANALISE_NECESSARIA,

    resultados:
      resultados
  };


  const classificacao =
    determinarClassificacaoIntegracaoV63_(
      reconhecimento
    );


  teste(
    15,
    'Classificação é ANALISE_NECESSARIA',
    classificacao ===
      INTEGRACAO_V63.CLASSIFICACOES
        .ANALISE_NECESSARIA
  );


  teste(
    16,
    'Não existe solução validada',
    resultados.filter(
      function(item) {

        return (
          item &&
          String(
            item.status || ''
          ).toUpperCase() ===
            'VALIDADA'
        );

      }
    ).length === 0
  );


  /**
   * ==========================================================
   * 5 — DECISÃO V6.3
   * ==========================================================
   */

  let decisao = null;

  try {

    decisao =
      decidirSolucaoV63_(
        reconhecimento,
        {
          interpretacao:
            interpretacao
        }
      );

  } catch (erro) {

    Logger.log(
      'ERRO DECISÃO: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    17,
    'Decisão V6.3 foi produzida',
    !!decisao
  );


  teste(
    18,
    'Estado interno é ANALISE_NECESSARIA',
    !!(
      decisao &&
      decisao.estado ===
        'ANALISE_NECESSARIA'
    )
  );


  teste(
  19,
  'Decisão confirma ausência de correspondência e exige análise',
  !!(
    decisao &&
    (
      decisao.classificacao ===
        'ANALISE_NECESSARIA' ||
      decisao.estado ===
        'ANALISE_NECESSARIA'
    )
  )
);


  teste(
    20,
    'Nenhuma resolução principal foi inventada',
    !!(
      decisao &&
      (
        !decisao.resolucao_principal ||
        decisao.resolucao_principal === ''
      )
    )
  );


  /**
   * ==========================================================
   * 6 — RESPOSTA SEGURA
   * ==========================================================
   */

  let respostaSegura = null;

  try {

    respostaSegura =
      gerarRespostaSeguraV63_(
        decisao
      );

  } catch (erro) {

    Logger.log(
      'ERRO RESPOSTA SEGURA: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    21,
    'Resposta segura foi produzida',
    !!(
      respostaSegura &&
      respostaSegura.resposta_cliente
    )
  );


  teste(
    22,
    'Resposta orienta uma análise mais detalhada',
    !!(
      respostaSegura &&
      respostaSegura.resposta_cliente &&
      respostaSegura.resposta_cliente.indexOf(
        'análise mais detalhada'
      ) !== -1
    )
  );


  /**
   * ==========================================================
   * 7 — SEGURANÇA DA RESPOSTA
   * ==========================================================
   */

  const textoResposta =
    respostaSegura &&
    respostaSegura.resposta_cliente
      ? String(
          respostaSegura.resposta_cliente
        ).toLowerCase()
      : '';


  const termosTecnicos = [
    'api',
    'endpoint',
    'token',
    'apikey',
    'arquitetura',
    'código fonte',
    'codigo fonte',
    'script',
    'sql',
    'database',
    'banco de dados',
    'prompt',
    'modelo de ia',
    'gemini'
  ];


  const exposicaoTecnica =
    termosTecnicos.some(
      function(termo) {

        return (
          textoResposta.indexOf(
            termo
          ) !== -1
        );

      }
    );


  const termosComerciais = [
    'preço',
    'preco',
    'valor',
    'r$',
    'orçamento',
    'orcamento',
    'negociar'
  ];


  const exposicaoComercial =
    termosComerciais.some(
      function(termo) {

        return (
          textoResposta.indexOf(
            termo
          ) !== -1
        );

      }
    );


  teste(
    23,
    'Resposta não expõe tecnologia',
    exposicaoTecnica === false &&
    !!(
      respostaSegura &&
      respostaSegura.tecnologia_exposta === false
    )
  );


  teste(
    24,
    'Resposta não expõe preço ou negociação',
    exposicaoComercial === false &&
    !!(
      respostaSegura &&
      respostaSegura.informacao_comercial_exposta === false
    )
  );


  /**
   * ==========================================================
   * 8 — FILTRO FINAL
   * ==========================================================
   */

  let filtroFinal = null;

  try {

    filtroFinal =
      verificarSegurancaRespostaSeguraV63_(
        respostaSegura
          ? respostaSegura.resposta_cliente
          : ''
      );

  } catch (erro) {

    Logger.log(
      'ERRO FILTRO FINAL: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    25,
    'Resposta final passa pelo filtro de segurança',
    !!(
      filtroFinal &&
      filtroFinal.segura === true
    )
  );


  /**
   * ==========================================================
   * RESULTADO FINAL
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
    'RESULTADO DO CENÁRIO SEM SOLUÇÃO V6.3'
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
    falhas === 0 &&
    percentual === 100
  ) {

    Logger.log(
      '🏆 TESTAR_CENARIO_SEM_SOLUCAO_V63: PASSOU'
    );

    Logger.log(
      '🏆 CENÁRIO SEM SOLUÇÃO V6.3: 100%'
    );

  } else {

    Logger.log(
      '❌ TESTAR_CENARIO_SEM_SOLUCAO_V63: FALHOU'
    );

  }


  Logger.log(
    '============================================================'
  );


  return {
    sucesso:
      falhas === 0,

    aprovados:
      aprovados,

    falhas:
      falhas,

    percentual:
      percentual,

    classificacao:
      classificacao,

    decisao:
      decisao,

    resposta:
      respostaSegura
  };

}

function TESTAR_CENARIO_MULTIPLAS_SOLUCOES_V63() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'TESTAR_CENARIO_MULTIPLAS_SOLUCOES_V63'
  );

  Logger.log(
    'CENÁRIO: CLIENTE COM MÚLTIPLAS SOLUÇÕES VALIDADA'
  );

  let aprovados = 0;
  let falhas = 0;

  const marcador =
    'CENARIO_MULTIPLAS_V63_' +
    new Date().getTime();

  let resolucaoId1 = '';
  let resolucaoId2 = '';

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
   * CENÁRIO CONTROLADO
   * ==========================================================
   */

  const investigacao = {

    problema_central:
      'erros e retrabalho no lançamento manual de pedidos',

    processo:
      'equipe recebe pedidos e lança manualmente em planilha',

    pontos_de_dor: [
      'erros de digitação',
      'retrabalho'
    ],

    impacto: {
      descricao:
        'perda de tempo e necessidade de correções'
    },

    resultado_desejado:
      'reduzir erros e retrabalho',

    contexto:
      'processo administrativo',

    restricoes: []

  };


  /**
   * ==========================================================
   * 1 — CRIAÇÃO DAS DUAS SOLUÇÕES VALIDADA
   * ==========================================================
   */

  try {

    const retorno1 =
      salvarResolucaoV63_({

        titulo_interno:
          marcador +
          '_SOLUCAO_1',

        descricao_problema:
          investigacao.problema_central,

        padrao_problema:
          'processo manual sujeito a erros',

        processo:
          investigacao.processo,

        dores:
          investigacao.pontos_de_dor,

        impactos: [
          'perda de tempo',
          'necessidade de correções'
        ],

        resultados_desejados: [
          investigacao.resultado_desejado
        ],

        contexto:
          investigacao.contexto,

        restricoes: [],

        abordagem_interna:
          'Automação estruturada do lançamento e conferência de pedidos.',

        descricao_solucao_interna:
          'Solução validada para automatizar e organizar o processo.',

        alternativas: [],

        status:
          'HIPOTESE',

        confianca:
          'ALTA',

        evidencias: [],

        casos_relacionados: [],

        origem:
          'PESQUISA_IA',

        versao:
          'V6.3'

      });


    resolucaoId1 =
      retorno1.resolucao_id;


    const retorno2 =
      salvarResolucaoV63_({

        titulo_interno:
          marcador +
          '_SOLUCAO_2',

        descricao_problema:
          investigacao.problema_central,

        padrao_problema:
          'processo manual sujeito a erros',

        processo:
          investigacao.processo,

        dores:
          investigacao.pontos_de_dor,

        impactos: [
          'perda de tempo',
          'necessidade de correções'
        ],

        resultados_desejados: [
          investigacao.resultado_desejado
        ],

        contexto:
          investigacao.contexto,

        restricoes: [],

        abordagem_interna:
          'Outra abordagem validada para organizar o fluxo de pedidos.',

        descricao_solucao_interna:
          'Segunda solução validada para o mesmo padrão de problema.',

        alternativas: [],

        status:
          'HIPOTESE',

        confianca:
          'ALTA',

        evidencias: [],

        casos_relacionados: [],

        origem:
          'PESQUISA_IA',

        versao:
          'V6.3'

      });


    resolucaoId2 =
      retorno2.resolucao_id;


    /**
     * A biblioteca exige evidências para VALIDADA.
     * Portanto a validação ocorre pelo contrato oficial.
     */

    validarResolucaoV63_(
      resolucaoId1,
      {
        evidencias: [
          marcador +
          '_EVIDENCIA_1'
        ],

        confianca:
          'ALTA',

        descricao_solucao_interna:
          'Solução validada em teste controlado.'
      }
    );


    validarResolucaoV63_(
      resolucaoId2,
      {
        evidencias: [
          marcador +
          '_EVIDENCIA_2'
        ],

        confianca:
          'ALTA',

        descricao_solucao_interna:
          'Segunda solução validada em teste controlado.'
      }
    );

  } catch (erro) {

    Logger.log(
      'ERRO NA CRIAÇÃO DAS SOLUÇÕES: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  /**
   * ==========================================================
   * 2 — PERSISTÊNCIA
   * ==========================================================
   */

  const solucao1 =
    resolucaoId1
      ? buscarResolucaoV63_({
          resolucao_id:
            resolucaoId1
        })
      : null;


  const solucao2 =
    resolucaoId2
      ? buscarResolucaoV63_({
          resolucao_id:
            resolucaoId2
        })
      : null;


  teste(
    1,
    'Primeira solução foi criada',
    !!(
      solucao1 &&
      solucao1.resolucao_id ===
        resolucaoId1
    )
  );


  teste(
    2,
    'Segunda solução foi criada',
    !!(
      solucao2 &&
      solucao2.resolucao_id ===
        resolucaoId2
    )
  );


  teste(
    3,
    'Primeira solução está VALIDADA',
    !!(
      solucao1 &&
      solucao1.status ===
        'VALIDADA'
    )
  );


  teste(
    4,
    'Segunda solução está VALIDADA',
    !!(
      solucao2 &&
      solucao2.status ===
        'VALIDADA'
    )
  );


  /**
   * ==========================================================
   * 3 — RECONHECIMENTO REAL
   * ==========================================================
   */

  let resultados = [];

  try {

    resultados =
      buscarResolucoesRelacionadasV63_(
        investigacao,
        {
          pontuacao_minima:
            20
        }
      );

  } catch (erro) {

    Logger.log(
      'ERRO RECONHECIMENTO: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    5,
    'Reconhecimento executou sem erro',
    Array.isArray(
      resultados
    )
  );


  const encontradas1 =
    resultados.some(
      function(item) {

        return (
          item &&
          item.resolucao_id ===
            resolucaoId1
        );

      }
    );


  const encontradas2 =
    resultados.some(
      function(item) {

        return (
          item &&
          item.resolucao_id ===
            resolucaoId2
        );

      }
    );


  teste(
    6,
    'Primeira solução foi encontrada',
    encontradas1
  );


  teste(
    7,
    'Segunda solução foi encontrada',
    encontradas2
  );


  const validadas =
    resultados.filter(
      function(item) {

        return (
          item &&
          String(
            item.status || ''
          ).toUpperCase() ===
            'VALIDADA'
        );

      }
    );


  teste(
    8,
    'Reconhecimento encontrou pelo menos duas soluções',
    validadas.length >= 2
  );


  teste(
    9,
    'As duas soluções encontradas são VALIDADA',
    validadas.filter(
      function(item) {

        return (
          item.resolucao_id ===
            resolucaoId1 ||
          item.resolucao_id ===
            resolucaoId2
        );

      }
    ).length === 2
  );


  /**
   * ==========================================================
   * 4 — CLASSIFICAÇÃO DO RECONHECIMENTO
   * ==========================================================
   */

  let classificacaoReconhecimento =
    null;

  try {

    classificacaoReconhecimento =
      classificarReconhecimentoV63_(
        resultados
      );

  } catch (erro) {

    Logger.log(
      'ERRO CLASSIFICAÇÃO RECONHECIMENTO: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    10,
    'Classificação do reconhecimento foi produzida',
    !!classificacaoReconhecimento
  );


  teste(
    11,
    'Classificação é SOLUCOES_ENCONTRADAS',
    !!(
      classificacaoReconhecimento &&
      classificacaoReconhecimento.classificacao ===
        'SOLUCOES_ENCONTRADAS'
    )
  );


  teste(
    12,
    'Classificação reconhece múltiplas soluções',
    !!(
      classificacaoReconhecimento &&
      Array.isArray(
        classificacaoReconhecimento
          .solucoes
      )
        ? classificacaoReconhecimento
            .solucoes.length >= 2
        : validadas.length >= 2
    )
  );


  /**
   * ==========================================================
   * 5 — INTEGRAÇÃO V6.3
   * ==========================================================
   */

  const resultadoIntegracao =
    construirResultadoIntegracaoV63_(
      {
        versao:
          'V6.3',

        problema:
          investigacao.problema_central,

        processo:
          investigacao.processo,

        dores:
          investigacao.pontos_de_dor,

        impactos: [
          'perda de tempo'
        ],

        resultado_desejado:
          investigacao.resultado_desejado,

        contexto:
          investigacao.contexto,

        restricoes: [],

        padrao_problema:
          'processo manual sujeito a erros'

      },
      {
        resultados:
          resultados
      }
    );


  teste(
    13,
    'Resultado integrado possui versão V6.3',
    resultadoIntegracao.versao ===
      'V6.3'
  );


  teste(
    14,
    'Integração classifica como SOLUCOES_ENCONTRADAS',
    resultadoIntegracao.classificacao ===
      INTEGRACAO_V63.CLASSIFICACOES
        .SOLUCOES_ENCONTRADAS
  );


  teste(
    15,
    'Integração reconhece que existe solução validada',
    resultadoIntegracao.possui_solucao_validada ===
      true
  );


  teste(
    16,
    'Integração não classifica como análise necessária',
    resultadoIntegracao.analise_necessaria ===
      false
  );


  teste(
    17,
    'Integração permanece segura',
    resultadoIntegracao.segura ===
      true
  );


  /**
   * ==========================================================
   * 6 — NÃO ESCOLHER ARBITRARIAMENTE UMA ÚNICA
   * ==========================================================
   */

  const idsValidados =
    validadas.map(
      function(item) {

        return String(
          item.resolucao_id
        );

      }
    );


  teste(
    18,
    'As duas soluções permanecem disponíveis para decisão',
    idsValidados.indexOf(
      String(resolucaoId1)
    ) !== -1 &&
    idsValidados.indexOf(
      String(resolucaoId2)
    ) !== -1
  );


  teste(
    19,
    'Nenhuma das duas soluções foi rebaixada',
    solucao1 &&
    solucao2 &&
    buscarResolucaoV63_({
      resolucao_id:
        resolucaoId1
    }).status ===
      'VALIDADA' &&
    buscarResolucaoV63_({
      resolucao_id:
        resolucaoId2
    }).status ===
      'VALIDADA'
  );


  /**
   * ==========================================================
   * 7 — SEGURANÇA DO RESULTADO
   * ==========================================================
   */

  const textoIntegracao =
    JSON.stringify(
      resultadoIntegracao
    ).toLowerCase();


  teste(
    20,
    'Resultado integrado não expõe preço',
    textoIntegracao.indexOf(
      'preço'
    ) === -1 &&
    textoIntegracao.indexOf(
      'preco'
    ) === -1
  );


  teste(
    21,
    'Resultado integrado não expõe API ou implementação',
    textoIntegracao.indexOf(
      'api'
    ) === -1 &&
    textoIntegracao.indexOf(
      'endpoint'
    ) === -1 &&
    textoIntegracao.indexOf(
      'prompt'
    ) === -1
  );


  /**
   * ==========================================================
   * 8 — DETERMINISMO
   * ==========================================================
   */

  const segundaBusca =
    buscarResolucoesRelacionadasV63_(
      investigacao,
      {
        pontuacao_minima:
          20
      }
    );


  const idsPrimeiraBusca =
    resultados
      .map(
        function(item) {
          return String(
            item.resolucao_id
          );
        }
      )
      .filter(
        function(id) {
          return (
            id ===
              String(resolucaoId1) ||
            id ===
              String(resolucaoId2)
          );
        }
      )
      .sort();


  const idsSegundaBusca =
    segundaBusca
      .map(
        function(item) {
          return String(
            item.resolucao_id
          );
        }
      )
      .filter(
        function(id) {
          return (
            id ===
              String(resolucaoId1) ||
            id ===
              String(resolucaoId2)
          );
        }
      )
      .sort();


  teste(
    22,
    'Reconhecimento é determinístico para as duas soluções',
    JSON.stringify(
      idsPrimeiraBusca
    ) ===
    JSON.stringify(
      idsSegundaBusca
    )
  );


  /**
   * ==========================================================
   * 9 — LIMPEZA
   * ==========================================================
   */

  let limpeza1 =
    false;

  let limpeza2 =
    false;


  try {

    if (resolucaoId1) {

      const retorno =
        arquivarResolucaoV63_(
          resolucaoId1
        );

      limpeza1 =
        retorno &&
        retorno.sucesso === true;

    }


    if (resolucaoId2) {

      const retorno =
        arquivarResolucaoV63_(
          resolucaoId2
        );

      limpeza2 =
        retorno &&
        retorno.sucesso === true;

    }

  } catch (erro) {

    Logger.log(
      'ERRO LIMPEZA: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    23,
    'Primeira solução foi limpa do cenário',
    limpeza1
  );


  teste(
    24,
    'Segunda solução foi limpa do cenário',
    limpeza2
  );


  /**
   * ==========================================================
   * 10 — CONFIRMAÇÃO FINAL DE LIMPEZA
   * ==========================================================
   */

  const depois1 =
    resolucaoId1
      ? buscarResolucaoV63_({
          resolucao_id:
            resolucaoId1
        })
      : null;


  const depois2 =
    resolucaoId2
      ? buscarResolucaoV63_({
          resolucao_id:
            resolucaoId2
        })
      : null;


  teste(
    25,
    'As duas soluções deixam de participar como VALIDADA',
    !!(
      depois1 &&
      depois2 &&
      depois1.status !== 'VALIDADA' &&
      depois2.status !== 'VALIDADA'
    )
  );


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
    'RESULTADO DO CENÁRIO MULTIPLAS SOLUÇÕES V6.3'
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
    falhas === 0 &&
    percentual === 100
  ) {

    Logger.log(
      '🏆 TESTAR_CENARIO_MULTIPLAS_SOLUCOES_V63: PASSOU'
    );

    Logger.log(
      '🏆 CENÁRIO MÚLTIPLAS SOLUÇÕES V6.3: 100%'
    );

  } else {

    Logger.log(
      '❌ TESTAR_CENARIO_MULTIPLAS_SOLUCOES_V63: FALHOU'
    );

  }


  Logger.log(
    '============================================================'
  );


  return {

    sucesso:
      falhas === 0,

    aprovados:
      aprovados,

    falhas:
      falhas,

    percentual:
      percentual,

    resolucao_1:
      resolucaoId1,

    resolucao_2:
      resolucaoId2,

    classificacao:
      classificacaoReconhecimento,

    integracao:
      resultadoIntegracao

  };

}

function TESTAR_CENARIO_INFORMACAO_INCOMPLETA_V63() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'TESTAR_CENARIO_INFORMACAO_INCOMPLETA_V63'
  );

  Logger.log(
    'CENÁRIO: CLIENTE FORNECE INFORMAÇÃO INSUFICIENTE'
  );

  let aprovados = 0;
  let falhas = 0;

  function teste(numero, descricao, condicao) {

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
   * CENÁRIO
   * ==========================================================
   *
   * Mensagem propositalmente curta e vaga.
   *
   * Não informa:
   * - qual processo;
   * - qual problema específico;
   * - qual impacto;
   * - qual resultado desejado.
   *
   * A V6.3 NÃO deve inventar esses dados.
   */

  const mensagem =
    'Está dando problema no sistema e está atrapalhando a equipe.';


  /**
   * ==========================================================
   * 1 — INTERPRETAÇÃO SEMÂNTICA
   * ==========================================================
   */

  let interpretacao = null;

  try {

    interpretacao =
      interpretarMensagemSemanticaV63_(
        mensagem
      );

  } catch (erro) {

    Logger.log(
      'ERRO INTERPRETAÇÃO: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    1,
    'IA gerou interpretação semântica',
    !!interpretacao
  );


  teste(
    2,
    'Interpretação possui versão V6.3',
    !!(
      interpretacao &&
      interpretacao.versao === 'V6.3'
    )
  );


  /**
   * ==========================================================
   * 2 — NÃO INVENTAR DADOS
   * ==========================================================
   */

  const textoInterpretacao =
    JSON.stringify(
      interpretacao || {}
    ).toLowerCase();


  const termosInventados = [
    'erp',
    'crm',
    'planilha',
    'excel',
    'financeiro',
    'estoque',
    'vendas',
    'faturamento',
    'api',
    'software específico'
  ];


  const possuiContextoInventado =
    termosInventados.some(
      function(termo) {

        return (
          textoInterpretacao.indexOf(
            termo
          ) !== -1
        );

      }
    );


  teste(
    3,
    'Interpretação não inventa uma tecnologia ou sistema específico',
    possuiContextoInventado === false
  );


  /**
   * ==========================================================
   * 3 — LACUNAS
   * ==========================================================
   */

  const lacunas =
    interpretacao &&
    Array.isArray(
      interpretacao.lacunas
    )
      ? interpretacao.lacunas
      : [];


  teste(
    4,
    'Interpretação identifica ou preserva lacunas',
    lacunas.length > 0
  );


  teste(
    5,
    'Processo não é tratado como confirmado sem evidência',
    !(
      interpretacao &&
      interpretacao.status &&
      interpretacao.status.processo ===
        'CONFIRMADO'
    )
  );


  teste(
    6,
    'Impacto não é tratado como confirmado sem evidência',
    !(
      interpretacao &&
      interpretacao.status &&
      interpretacao.status.impactos ===
        'CONFIRMADO'
    )
  );


  teste(
    7,
    'Resultado desejado não é tratado como confirmado sem evidência',
    !(
      interpretacao &&
      interpretacao.status &&
      interpretacao.status.resultado_desejado ===
        'CONFIRMADO'
    )
  );


  /**
   * ==========================================================
   * 4 — RECONHECIMENTO
   * ==========================================================
   *
   * Sem informação suficiente, não devemos procurar uma
   * solução específica baseada em uma suposição.
   */

  let entradaReconhecimento = null;

  try {

    entradaReconhecimento =
      prepararParaReconhecimentoV63_(
        interpretacao
      );

  } catch (erro) {

    Logger.log(
      'ERRO PREPARAÇÃO: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    8,
    'Preparação para reconhecimento executou',
    !!entradaReconhecimento
  );


  /**
   * ==========================================================
   * 5 — VERIFICAÇÃO DE SUFICIÊNCIA
   * ==========================================================
   */

  let reconhecimento = null;

  try {

    reconhecimento =
      buscarResolucoesRelacionadasV63_(
        entradaReconhecimento || {},
        {
          pontuacao_minima: 80
        }
      );

  } catch (erro) {

    Logger.log(
      'ERRO RECONHECIMENTO: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    9,
    'Reconhecimento executou sem erro',
    Array.isArray(
      reconhecimento
    )
  );


  /**
   * Uma mensagem vaga não deve produzir uma solução
   * específica apenas por semelhança superficial.
   */

  teste(
    10,
    'Nenhuma solução específica é aceita por associação superficial',
    Array.isArray(reconhecimento) &&
    reconhecimento.length === 0
  );


  /**
   * ==========================================================
   * 6 — CLASSIFICAÇÃO
   * ==========================================================
   */

  const resultadoReconhecimento = {

    classificacao:
      reconhecimento &&
      reconhecimento.length > 0
        ? 'SOLUCOES_ENCONTRADAS'
        : 'ANALISE_NECESSARIA',

    resultados:
      reconhecimento || []

  };


  let classificacao = null;

  try {

    classificacao =
      determinarClassificacaoIntegracaoV63_(
        resultadoReconhecimento
      );

  } catch (erro) {

    Logger.log(
      'ERRO CLASSIFICAÇÃO: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    11,
    'Classificação foi produzida',
    !!classificacao
  );


  teste(
    12,
    'Classificação é ANALISE_NECESSARIA',
    classificacao ===
      INTEGRACAO_V63.CLASSIFICACOES
        .ANALISE_NECESSARIA
  );


  /**
   * ==========================================================
   * 7 — DECISÃO
   * ==========================================================
   */

  let decisao = null;

  try {

    decisao =
      decidirSolucaoV63_(
        resultadoReconhecimento,
        {
          interpretacao:
            interpretacao
        }
      );

  } catch (erro) {

    Logger.log(
      'ERRO DECISÃO: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    13,
    'Decisão V6.3 foi produzida',
    !!decisao
  );


  teste(
    14,
    'Decisão exige análise',
    !!(
      decisao &&
      decisao.estado ===
        'ANALISE_NECESSARIA'
    )
  );


  teste(
    15,
    'Decisão não inventa resolução principal',
    !!(
      decisao &&
      (
        !decisao.resolucao_principal ||
        decisao.resolucao_principal === ''
      )
    )
  );


  /**
   * ==========================================================
   * 8 — PERGUNTAS / CONTINUAÇÃO
   * ==========================================================
   */

  const textoDecisao =
    JSON.stringify(
      decisao || {}
    ).toLowerCase();


  teste(
    16,
    'Decisão preserva necessidade de obter mais contexto',
    (
      textoDecisao.indexOf('lacuna') !== -1 ||
      textoDecisao.indexOf('analis') !== -1 ||
      textoDecisao.indexOf('inform') !== -1 ||
      textoDecisao.indexOf('context') !== -1
    )
  );


  /**
   * ==========================================================
   * 9 — RESPOSTA SEGURA
   * ==========================================================
   */

  let resposta = null;

  try {

    resposta =
      gerarRespostaSeguraV63_(
        decisao
      );

  } catch (erro) {

    Logger.log(
      'ERRO RESPOSTA SEGURA: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    17,
    'Resposta segura foi produzida',
    !!(
      resposta &&
      resposta.resposta_cliente
    )
  );


  const textoResposta =
    resposta &&
    resposta.resposta_cliente
      ? String(
          resposta.resposta_cliente
        ).toLowerCase()
      : '';


  /**
   * ==========================================================
   * 10 — RESPOSTA NÃO PODE AFIRMAR SOLUÇÃO ENCONTRADA
   * ==========================================================
   */

  const afirmaSolucao =
    (
      textoResposta.indexOf(
        'encontrei uma solução'
      ) !== -1
    ) ||
    (
      textoResposta.indexOf(
        'encontrei a solução'
      ) !== -1
    ) ||
    (
      textoResposta.indexOf(
        'solução validada'
      ) !== -1
    );


  teste(
    18,
    'Resposta não afirma que encontrou uma solução',
    afirmaSolucao === false
  );


  /**
   * ==========================================================
   * 11 — RESPOSTA RECONHECE NECESSIDADE DE ANÁLISE
   * ==========================================================
   */

  teste(
    19,
    'Resposta orienta análise do problema',
    (
      textoResposta.indexOf('analis') !== -1 ||
      textoResposta.indexOf('entendi') !== -1
    )
  );


  /**
   * ==========================================================
   * 12 — SEGURANÇA
   * ==========================================================
   */

  const termosTecnicos = [
    'api',
    'endpoint',
    'token',
    'apikey',
    'arquitetura',
    'script',
    'sql',
    'database',
    'prompt',
    'gemini',
    'modelo de ia'
  ];


  const expTecnica =
    termosTecnicos.some(
      function(termo) {

        return (
          textoResposta.indexOf(
            termo
          ) !== -1
        );

      }
    );


  teste(
    20,
    'Resposta não expõe tecnologia',
    expTecnica === false
  );


  const termosComerciais = [
    'preço',
    'preco',
    'valor',
    'r$',
    'orçamento',
    'orcamento',
    'negociação',
    'negociacao'
  ];


  const expComercial =
    termosComerciais.some(
      function(termo) {

        return (
          textoResposta.indexOf(
            termo
          ) !== -1
        );

      }
    );


  teste(
    21,
    'Resposta não expõe preço ou negociação',
    expComercial === false
  );


  /**
   * ==========================================================
   * 13 — NÃO EXPOR LIMITAÇÃO INTERNA
   * ==========================================================
   */

  const termosCapacidade = [
    'não temos capacidade',
    'nao temos capacidade',
    'não conseguimos',
    'nao conseguimos',
    'não temos conhecimento',
    'nao temos conhecimento',
    'fora da nossa capacidade',
    'fora da capacidade',
    'não podemos',
    'nao podemos'
  ];


  const expCapacidade =
    termosCapacidade.some(
      function(termo) {

        return (
          textoResposta.indexOf(
            termo
          ) !== -1
        );

      }
    );


  teste(
    22,
    'Resposta não expõe limitação interna',
    expCapacidade === false
  );


  /**
   * ==========================================================
   * 14 — RESPOSTA NÃO INVENTA CONTEXTO
   * ==========================================================
   */

  const termosContextoInventado = [
    'erp',
    'crm',
    'financeiro',
    'estoque',
    'vendas',
    'faturamento',
    'planilha',
    'excel'
  ];


  const contextoInventado =
    termosContextoInventado.some(
      function(termo) {

        return (
          textoResposta.indexOf(
            termo
          ) !== -1
        );

      }
    );


  teste(
    23,
    'Resposta não inventa o contexto empresarial',
    contextoInventado === false
  );


  /**
   * ==========================================================
   * 15 — FILTRO FINAL
   * ==========================================================
   */

  let filtroFinal = null;

  try {

    filtroFinal =
      verificarSegurancaRespostaSeguraV63_(
        resposta &&
        resposta.resposta_cliente
          ? resposta.resposta_cliente
          : ''
      );

  } catch (erro) {

    Logger.log(
      'ERRO FILTRO FINAL: ' +
      (
        erro &&
        erro.message
          ? erro.message
          : erro
      )
    );

  }


  teste(
    24,
    'Resposta final passa pelo filtro de segurança',
    !!(
      filtroFinal &&
      filtroFinal.segura === true
    )
  );


  /**
   * ==========================================================
   * 16 — CONSISTÊNCIA FINAL
   * ==========================================================
   */

  teste(
    25,
    'Fluxo completo mantém ANALISE_NECESSARIA até a resposta',
    !!(
      classificacao ===
        'ANALISE_NECESSARIA' &&
      decisao &&
      decisao.estado ===
        'ANALISE_NECESSARIA' &&
      resposta &&
      resposta.resposta_cliente
    )
  );


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
    'RESULTADO DO CENÁRIO INFORMAÇÃO INCOMPLETA V6.3'
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
    falhas === 0 &&
    percentual === 100
  ) {

    Logger.log(
      '🏆 TESTAR_CENARIO_INFORMACAO_INCOMPLETA_V63: PASSOU'
    );

    Logger.log(
      '🏆 CENÁRIO INFORMAÇÃO INCOMPLETA V6.3: 100%'
    );

  } else {

    Logger.log(
      '❌ TESTAR_CENARIO_INFORMACAO_INCOMPLETA_V63: FALHOU'
    );

  }


  Logger.log(
    '============================================================'
  );


  return {

    sucesso:
      falhas === 0,

    aprovados:
      aprovados,

    falhas:
      falhas,

    percentual:
      percentual,

    classificacao:
      classificacao,

    decisao:
      decisao,

    resposta:
      resposta

  };

}
