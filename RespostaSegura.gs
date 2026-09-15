/**
 * ============================================================
 * FEEDS SOLUTIONS
 * RESPOSTA SEGURA V6.3
 * ============================================================
 *
 * RESPONSABILIDADE:
 *
 * Transformar uma decisão interna da Feeds em uma resposta
 * apropriada para o cliente.
 *
 * FLUXO:
 *
 * DECISÃO INTERNA
 *      ↓
 * RESPOSTA SEGURA V6.3
 *      ↓
 * FILTROS
 *      ↓
 * CLIENTE
 *
 *
 * PRINCÍPIO:
 *
 * O sistema pode saber muito mais do que o cliente precisa saber.
 *
 * Portanto:
 *
 * CONHECIMENTO INTERNO != INFORMAÇÃO EXTERNA
 *
 * ============================================================
 */


/**
 * ============================================================
 * CONTRATO
 * ============================================================
 */

const RESPOSTA_SEGURA_V63 = {

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

  CAMPOS_INTERNOS_PROIBIDOS: [

    'resolucao_id',
    'id',
    'pontuacao',
    'score',
    'confianca',
    'status',
    'classificacao_reconhecimento',
    'estado_interno',
    'versao',
    'origem',
    'evidencias',
    'casos_relacionados',
    'abordagem_interna',
    'descricao_solucao_interna',
    'alternativas',
    'restricoes',
    'diagnostico_id',
    'investigacao_id',
    'conversa_id',
    'empresa_id'

  ],

  TERMOS_TECNICOS_PROIBIDOS: [

    'api',
    'endpoint',
    'token',
    'apikey',
    'database',
    'banco de dados',
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
    'backend',
    'frontend',
    'front-end',
    'integração técnica',
    'integracao tecnica',
    'tecnologia',
    'programação',
    'programacao',
    'linguagem de programação',
    'linguagem de programacao'

  ],

  TERMOS_COMERCIAIS_PROIBIDOS: [

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
    'negociacao',
    'prazo de entrega',
    'prazo comercial',
    'condição comercial',
    'condicao comercial'

  ],

  TERMOS_CAPACIDADE_NEGATIVA_PROIBIDOS: [

    'não sabemos',
    'nao sabemos',
    'não sei',
    'nao sei',
    'não conseguimos',
    'nao conseguimos',
    'não podemos',
    'nao podemos',
    'não temos capacidade',
    'nao temos capacidade',
    'não temos conhecimento',
    'nao temos conhecimento',
    'não temos estrutura',
    'nao temos estrutura',
    'fora da nossa capacidade',
    'fora da nossa capacidade atual',
    'não temos solução',
    'nao temos solucao',
    'não conseguimos resolver',
    'nao conseguimos resolver'

  ]

};


/**
 * ============================================================
 * NORMALIZAÇÃO
 * ============================================================
 */

function normalizarTextoRespostaSeguraV63_(
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
 * NORMALIZAÇÃO PARA FILTRO
 * ============================================================
 */

function normalizarParaFiltroRespostaSeguraV63_(
  valor
) {

  return normalizarTextoRespostaSeguraV63_(
    valor
  )
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    );

}


/**
 * ============================================================
 * OBJETO VÁLIDO
 * ============================================================
 */

function objetoValidoRespostaSeguraV63_(
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
 * ESTADO VÁLIDO
 * ============================================================
 */

function estadoValidoRespostaSeguraV63_(
  estado
) {

  const valor =
    normalizarTextoRespostaSeguraV63_(
      estado
    );

  return [

    RESPOSTA_SEGURA_V63.ESTADOS.SOLUCAO_VALIDADA,

    RESPOSTA_SEGURA_V63.ESTADOS.SOLUCOES_ENCONTRADAS,

    RESPOSTA_SEGURA_V63.ESTADOS.ABORDAGEM_EM_ANALISE,

    RESPOSTA_SEGURA_V63.ESTADOS.ANALISE_NECESSARIA

  ].indexOf(valor) !== -1;

}


/**
 * ============================================================
 * RESPOSTAS OFICIAIS
 * ============================================================
 */

function obterRespostaOficialSeguraV63_(
  estado
) {

  switch (
    normalizarTextoRespostaSeguraV63_(
      estado
    )
  ) {

    case RESPOSTA_SEGURA_V63
      .ESTADOS
      .SOLUCAO_VALIDADA:

      return (
        'Analisei o seu caso e encontrei ' +
        'uma solução adequada para esse tipo ' +
        'de problema em nossa biblioteca de ' +
        'resoluções. Vou encaminhar os próximos ' +
        'detalhes para o time da Feeds.'
      );


    case RESPOSTA_SEGURA_V63
      .ESTADOS
      .SOLUCOES_ENCONTRADAS:

      return (
        'Analisei o seu caso e identifiquei ' +
        'algumas possibilidades de solução. ' +
        'Vou avaliar qual delas se adapta melhor ' +
        'à realidade da sua empresa e encaminhar ' +
        'a análise para a equipe da Feeds.'
      );


    case RESPOSTA_SEGURA_V63
      .ESTADOS
      .ABORDAGEM_EM_ANALISE:

      return (
        'Analisei o seu cenário e identifiquei ' +
        'uma abordagem de solução para esse ' +
        'problema. Vou encaminhar a análise para ' +
        'a equipe da Feeds, que avaliará os ' +
        'próximos passos com você.'
      );


    case RESPOSTA_SEGURA_V63
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

      return '';

  }

}


/**
 * ============================================================
 * VERIFICA TERMOS PROIBIDOS
 * ============================================================
 */

function contemTermoProibidoRespostaSeguraV63_(
  texto,
  lista
) {

  const normalizado =
    normalizarParaFiltroRespostaSeguraV63_(
      texto
    );

  for (
    let i = 0;
    i < lista.length;
    i++
  ) {

    const termo =
      normalizarParaFiltroRespostaSeguraV63_(
        lista[i]
      );

    if (
      normalizado.indexOf(
        termo
      ) !== -1
    ) {

      return {

        bloqueado: true,

        termo: lista[i]

      };

    }

  }

  return {

    bloqueado: false,

    termo: ''

  };

}


/**
 * ============================================================
 * FILTRO DE TECNOLOGIA
 * ============================================================
 */

function verificarTecnologiaRespostaSeguraV63_(
  texto
) {

  return !contemTermoProibidoRespostaSeguraV63_(
    texto,
    RESPOSTA_SEGURA_V63
      .TERMOS_TECNICOS_PROIBIDOS
  ).bloqueado;

}


/**
 * ============================================================
 * FILTRO COMERCIAL
 * ============================================================
 */

function verificarComercialRespostaSeguraV63_(
  texto
) {

  return !contemTermoProibidoRespostaSeguraV63_(
    texto,
    RESPOSTA_SEGURA_V63
      .TERMOS_COMERCIAIS_PROIBIDOS
  ).bloqueado;

}


/**
 * ============================================================
 * FILTRO DE CAPACIDADE NEGATIVA
 * ============================================================
 */

function verificarCapacidadeNegativaRespostaSeguraV63_(
  texto
) {

  return !contemTermoProibidoRespostaSeguraV63_(
    texto,
    RESPOSTA_SEGURA_V63
      .TERMOS_CAPACIDADE_NEGATIVA_PROIBIDOS
  ).bloqueado;

}


/**
 * ============================================================
 * FILTRO GERAL
 * ============================================================
 */

function verificarSegurancaRespostaSeguraV63_(
  texto
) {

  const resposta =
    normalizarTextoRespostaSeguraV63_(
      texto
    );

  if (!resposta) {

    return {

      segura: false,

      motivo:
        'RESPOSTA_VAZIA'

    };

  }


  const tecnologia =
    contemTermoProibidoRespostaSeguraV63_(
      resposta,
      RESPOSTA_SEGURA_V63
        .TERMOS_TECNICOS_PROIBIDOS
    );

  if (
    tecnologia.bloqueado
  ) {

    return {

      segura: false,

      motivo:
        'TECNOLOGIA_EXPOSTA',

      termo:
        tecnologia.termo

    };

  }


  const comercial =
    contemTermoProibidoRespostaSeguraV63_(
      resposta,
      RESPOSTA_SEGURA_V63
        .TERMOS_COMERCIAIS_PROIBIDOS
    );

  if (
    comercial.bloqueado
  ) {

    return {

      segura: false,

      motivo:
        'INFORMACAO_COMERCIAL',

      termo:
        comercial.termo

    };

  }


  const capacidade =
    contemTermoProibidoRespostaSeguraV63_(
      resposta,
      RESPOSTA_SEGURA_V63
        .TERMOS_CAPACIDADE_NEGATIVA_PROIBIDOS
    );

  if (
    capacidade.bloqueado
  ) {

    return {

      segura: false,

      motivo:
        'CAPACIDADE_NEGATIVA',

      termo:
        capacidade.termo

    };

  }


  return {

    segura: true,

    motivo: 'APROVADA',

    termo: ''

  };

}


/**
 * ============================================================
 * VERIFICA SE RESPOSTA É OFICIAL
 * ============================================================
 */

function respostaOficialSeguraV63_(
  estado,
  resposta
) {

  const oficial =
    obterRespostaOficialSeguraV63_(
      estado
    );

  const atual =
    normalizarTextoRespostaSeguraV63_(
      resposta
    );

  return (
    oficial !== '' &&
    oficial === atual
  );

}


/**
 * ============================================================
 * VERIFICA SE EXISTE SOLUÇÃO VALIDADA REAL
 * ============================================================
 *
 * Esta função é propositalmente conservadora.
 *
 * A resposta "encontrei uma solução em nossa biblioteca"
 * só pode ser utilizada quando a decisão informa que existe
 * uma solução VALIDADA.
 *
 * ============================================================
 */

function podeDizerSolucaoValidadaV63_(
  decisao
) {

  if (
    !objetoValidoRespostaSeguraV63_(
      decisao
    )
  ) {

    return false;

  }

  if (
    decisao.estado !==
      RESPOSTA_SEGURA_V63
        .ESTADOS
        .SOLUCAO_VALIDADA
  ) {

    return false;

  }

  const quantidade =
    Number(
      decisao.solucoes_validadas ||
      0
    );

  return quantidade === 1;

}


/**
 * ============================================================
 * CONVERTE DECISÃO EM RESPOSTA SEGURA
 * ============================================================
 */

function gerarRespostaSeguraV63_(
  decisao
) {

  if (
    !objetoValidoRespostaSeguraV63_(
      decisao
    )
  ) {

    throw new Error(
      'Decisão V6.3 inválida.'
    );

  }


  const estado =
    normalizarTextoRespostaSeguraV63_(
      decisao.estado
    );


  if (
    !estadoValidoRespostaSeguraV63_(
      estado
    )
  ) {

    throw new Error(
      'Estado de decisão V6.3 inválido.'
    );

  }


  /*
   * Regra crítica:
   *
   * SOLUCAO_VALIDADA só pode ser comunicada
   * quando existe exatamente uma solução validada.
   */

  if (
    estado ===
      RESPOSTA_SEGURA_V63
        .ESTADOS
        .SOLUCAO_VALIDADA &&
    !podeDizerSolucaoValidadaV63_(
      decisao
    )
  ) {

    throw new Error(
      'Não é permitido comunicar solução validada sem evidência válida.'
    );

  }


  const resposta =
    obterRespostaOficialSeguraV63_(
      estado
    );


  const verificacao =
    verificarSegurancaRespostaSeguraV63_(
      resposta
    );


  if (
    !verificacao.segura
  ) {

    throw new Error(
      'Resposta reprovada pelo filtro de segurança: ' +
      verificacao.motivo
    );

  }


  return {

    versao:
      RESPOSTA_SEGURA_V63.VERSAO,

    estado_interno:
      estado,

    resposta_cliente:
      resposta,

    resposta_segura:
      true,

    tecnologia_exposta:
      false,

    informacao_comercial_exposta:
      false,

    capacidade_negativa_exposta:
      false

  };

}


/**
 * ============================================================
 * REMOVE CAMPOS INTERNOS DE UM OBJETO
 * ============================================================
 *
 * Esta função serve para impedir que dados internos sejam
 * enviados diretamente ao cliente.
 *
 * ============================================================
 */

function removerCamposInternosRespostaSeguraV63_(
  objeto
) {

  if (
    objeto === null ||
    objeto === undefined
  ) {

    return objeto;

  }


  if (
    Array.isArray(objeto)
  ) {

    return objeto.map(
      function(item) {

        return removerCamposInternosRespostaSeguraV63_(
          item
        );

      }
    );

  }


  if (
    typeof objeto !== 'object'
  ) {

    return objeto;

  }


  const resultado = {};


  Object.keys(
    objeto
  ).forEach(
    function(chave) {

      if (
        RESPOSTA_SEGURA_V63
          .CAMPOS_INTERNOS_PROIBIDOS
          .indexOf(chave) !== -1
      ) {

        return;

      }


      resultado[chave] =
        removerCamposInternosRespostaSeguraV63_(
          objeto[chave]
        );

    }
  );


  return resultado;

}


/**
 * ============================================================
 * TESTE PRINCIPAL
 * ============================================================
 *
 * 25 TESTES
 *
 * META:
 *
 * 25/25
 * 100%
 *
 * ============================================================
 */

function TESTAR_RESPOSTA_SEGURA_V63() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'TESTAR_RESPOSTA_SEGURA_V63'
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
   * FIXTURE 1
   * ==========================================================
   */

  const decisaoValidada = {

    versao:
      'V6.3',

    estado:
      'SOLUCAO_VALIDADA',

    classificacao_reconhecimento:
      'SOLUCAO_ENCONTRADA',

    resolucao_principal:
      'RES-TESTE-001',

    solucoes_validadas:
      1

  };


  let resposta1 = null;


  try {

    resposta1 =
      gerarRespostaSeguraV63_(
        decisaoValidada
      );

  } catch (erro) {

    Logger.log(
      'ERRO RESPOSTA 1: ' +
      erro.message
    );

  }


  /**
   * ==========================================================
   * TESTES 1–8
   * ==========================================================
   */

  teste(
    1,
    'Contrato V6.3 disponível',
    !!RESPOSTA_SEGURA_V63
  );

  teste(
    2,
    'Resposta possui versão V6.3',
    !!(
      resposta1 &&
      resposta1.versao === 'V6.3'
    )
  );

  teste(
    3,
    'Solução validada gera resposta correta',
    !!(
      resposta1 &&
      resposta1.estado_interno ===
        'SOLUCAO_VALIDADA'
    )
  );

  teste(
    4,
    'Resposta ao cliente é produzida',
    !!(
      resposta1 &&
      resposta1.resposta_cliente
    )
  );

  teste(
    5,
    'Resposta é marcada como segura',
    !!(
      resposta1 &&
      resposta1.resposta_segura === true
    )
  );

  teste(
    6,
    'Tecnologia não é exposta',
    !!(
      resposta1 &&
      resposta1.tecnologia_exposta === false
    )
  );

  teste(
    7,
    'Informação comercial não é exposta',
    !!(
      resposta1 &&
      resposta1.informacao_comercial_exposta === false
    )
  );

  teste(
    8,
    'Capacidade negativa não é exposta',
    !!(
      resposta1 &&
      resposta1.capacidade_negativa_exposta === false
    )
  );


  /**
   * ==========================================================
   * MÚLTIPLAS SOLUÇÕES
   * ==========================================================
   */

  const decisaoMultiplas = {

    versao:
      'V6.3',

    estado:
      'SOLUCOES_ENCONTRADAS',

    classificacao_reconhecimento:
      'SOLUCOES_ENCONTRADAS',

    resolucao_principal:
      '',

    solucoes_validadas:
      2

  };


  let resposta2 = null;


  try {

    resposta2 =
      gerarRespostaSeguraV63_(
        decisaoMultiplas
      );

  } catch (erro) {

    Logger.log(
      'ERRO RESPOSTA 2: ' +
      erro.message
    );

  }


  teste(
    9,
    'Múltiplas soluções geram resposta própria',
    !!(
      resposta2 &&
      resposta2.estado_interno ===
        'SOLUCOES_ENCONTRADAS'
    )
  );

  teste(
    10,
    'Múltiplas soluções não são apresentadas como uma única solução validada',
    !!(
      resposta2 &&
      resposta2.resposta_cliente.indexOf(
        'algumas possibilidades de solução'
      ) !== -1
    )
  );


  /**
   * ==========================================================
   * ABORDAGEM EM ANÁLISE
   * ==========================================================
   */

  const decisaoAnalise = {

    versao:
      'V6.3',

    estado:
      'ABORDAGEM_EM_ANALISE',

    classificacao_reconhecimento:
      'ABORDAGEM_EM_ANALISE',

    resolucao_principal:
      '',

    solucoes_validadas:
      0

  };


  let resposta3 = null;


  try {

    resposta3 =
      gerarRespostaSeguraV63_(
        decisaoAnalise
      );

  } catch (erro) {

    Logger.log(
      'ERRO RESPOSTA 3: ' +
      erro.message
    );

  }


  teste(
    11,
    'Abordagem em análise gera resposta adequada',
    !!(
      resposta3 &&
      resposta3.estado_interno ===
        'ABORDAGEM_EM_ANALISE'
    )
  );

  teste(
    12,
    'Abordagem em análise não é apresentada como solução validada',
    !!(
      resposta3 &&
      resposta3.resposta_cliente.indexOf(
        'abordagem de solução'
      ) !== -1
    )
  );


  /**
   * ==========================================================
   * ANÁLISE NECESSÁRIA
   * ==========================================================
   */

  const decisaoNecessaria = {

    versao:
      'V6.3',

    estado:
      'ANALISE_NECESSARIA',

    classificacao_reconhecimento:
      'NENHUMA_CORRESPONDENCIA',

    resolucao_principal:
      '',

    solucoes_validadas:
      0

  };


  let resposta4 = null;


  try {

    resposta4 =
      gerarRespostaSeguraV63_(
        decisaoNecessaria
      );

  } catch (erro) {

    Logger.log(
      'ERRO RESPOSTA 4: ' +
      erro.message
    );

  }


  teste(
    13,
    'Análise necessária gera resposta adequada',
    !!(
      resposta4 &&
      resposta4.estado_interno ===
        'ANALISE_NECESSARIA'
    )
  );

  teste(
    14,
    'Resposta de análise informa próximo passo sem revelar tecnologia',
    !!(
      resposta4 &&
      resposta4.resposta_cliente.indexOf(
        'análise mais detalhada'
      ) !== -1
    )
  );


  /**
   * ==========================================================
   * FILTROS DE SEGURANÇA
   * ==========================================================
   */

  teste(
    15,
    'Resposta oficial validada passa no filtro',
    verificarSegurancaRespostaSeguraV63_(
      resposta1.resposta_cliente
    ).segura === true
  );

  teste(
    16,
    'API é bloqueada',
    verificarSegurancaRespostaSeguraV63_(
      'A solução utiliza uma API.'
    ).segura === false
  );

  teste(
    17,
    'Arquitetura é bloqueada',
    verificarSegurancaRespostaSeguraV63_(
      'Vou apresentar a arquitetura da solução.'
    ).segura === false
  );

  teste(
    18,
    'Preço é bloqueado',
    verificarSegurancaRespostaSeguraV63_(
      'O preço da solução será R$ 5.000.'
    ).segura === false
  );

  teste(
    19,
    'Negociação é bloqueada',
    verificarSegurancaRespostaSeguraV63_(
      'Podemos negociar o valor.'
    ).segura === false
  );

  teste(
    20,
    'Falta de capacidade é bloqueada',
    verificarSegurancaRespostaSeguraV63_(
      'Não temos capacidade para resolver isso.'
    ).segura === false
  );


  /**
   * ==========================================================
   * PROTEÇÃO CONTRA FALSA SOLUÇÃO VALIDADA
   * ==========================================================
   */

  const decisaoFraude = {

    versao:
      'V6.3',

    estado:
      'SOLUCAO_VALIDADA',

    classificacao_reconhecimento:
      'SOLUCAO_ENCONTRADA',

    resolucao_principal:
      'RES-FAKE',

    solucoes_validadas:
      0

  };


  let bloqueouFalsa = false;


  try {

    gerarRespostaSeguraV63_(
      decisaoFraude
    );

  } catch (erro) {

    bloqueouFalsa = true;

  }


  teste(
    21,
    'Não comunica solução validada sem evidência',
    bloqueouFalsa === true
  );


  /**
   * ==========================================================
   * PROTEÇÃO CONTRA DADOS INTERNOS
   * ==========================================================
   */

  const dadosInternos = {

    resolucao_id:
      'RES-001',

    titulo:
      'Título público',

    pontuacao:
      97,

    confianca:
      'ALTA',

    status:
      'VALIDADA',

    tecnologia:
      'API',

    abordagem_interna:
      'Detalhes internos',

    resposta:
      'Texto público'

  };


  const dadosExternos =
    removerCamposInternosRespostaSeguraV63_(
      dadosInternos
    );


  teste(
    22,
    'ID interno não é exportado',
    !Object.prototype.hasOwnProperty.call(
      dadosExternos,
      'resolucao_id'
    )
  );


  teste(
    23,
    'Pontuação interna não é exportada',
    !Object.prototype.hasOwnProperty.call(
      dadosExternos,
      'pontuacao'
    )
  );


  /**
   * ==========================================================
   * RESPOSTA OFICIAL E DETERMINISMO
   * ==========================================================
   */

  teste(
    24,
    'Resposta gerada corresponde exatamente ao texto oficial',
    respostaOficialSeguraV63_(
      resposta1.estado_interno,
      resposta1.resposta_cliente
    ) === true
  );


  let resposta1b = null;


  try {

    resposta1b =
      gerarRespostaSeguraV63_(
        decisaoValidada
      );

  } catch (erro) {

    Logger.log(
      'ERRO DETERMINISMO: ' +
      erro.message
    );

  }


  teste(
    25,
    'Geração da resposta é determinística',
    !!(
      resposta1 &&
      resposta1b &&
      resposta1.resposta_cliente ===
        resposta1b.resposta_cliente &&
      resposta1.estado_interno ===
        resposta1b.estado_interno
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
      '🏆 TESTAR_RESPOSTA_SEGURA_V63: PASSOU'
    );

    Logger.log(
      '🏆 RESPOSTA SEGURA V6.3: 100%'
    );

  } else {

    Logger.log(
      '❌ TESTAR_RESPOSTA_SEGURA_V63: FALHOU'
    );

  }

}
