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
