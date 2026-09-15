/**
 * ============================================================
 * FEEDS SOLUTIONS — V6.3
 * BIBLIOTECA DE RESOLUÇÕES DA IA
 * ============================================================
 *
 * Responsabilidade:
 * - Persistir a memória de resoluções da Feeds
 * - Controlar ciclo de vida das resoluções
 * - Diferenciar hipótese de solução validada
 * - Permitir recuperação segura da biblioteca
 *
 * IMPORTANTE:
 * Este módulo NÃO altera o motor V6.2.3.
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * CONTRATO DA BIBLIOTECA V6.3
 * ------------------------------------------------------------
 */
const BIBLIOTECA_RESOLUCOES_V63 = {

  VERSAO: 'V6.3',

  STATUS: {
    HIPOTESE: 'HIPOTESE',
    EM_ANALISE: 'EM_ANALISE',
    VALIDADA: 'VALIDADA',
    SUPERADA: 'SUPERADA',
    ARQUIVADA: 'ARQUIVADA'
  },

  CONFIANCAS: {
    BAIXA: 'BAIXA',
    MEDIA: 'MEDIA',
    ALTA: 'ALTA'
  },

  ORIGENS: {
    PESQUISA_IA: 'PESQUISA_IA',
    ENGENHARIA_FEEDS: 'ENGENHARIA_FEEDS',
    CASO_VALIDADO: 'CASO_VALIDADO',
    BIBLIOTECA: 'BIBLIOTECA'
  }
};


/**
 * ------------------------------------------------------------
 * NORMALIZAR TEXTO
 * ------------------------------------------------------------
 */
function normalizarTextoResolucaoV63_(valor) {

  if (
    valor === undefined ||
    valor === null
  ) {
    return '';
  }

  return String(valor)
    .trim();

}


/**
 * ------------------------------------------------------------
 * NORMALIZAR STATUS
 * ------------------------------------------------------------
 */
function normalizarStatusResolucaoV63_(status) {

  const valor =
    normalizarTextoResolucaoV63_(
      status
    ).toUpperCase();

  const statusValidos =
    BIBLIOTECA_RESOLUCOES_V63.STATUS;

  if (
    Object.keys(statusValidos)
      .some(function(chave) {

        return (
          statusValidos[chave] ===
          valor
        );

      })
  ) {

    return valor;

  }

  return BIBLIOTECA_RESOLUCOES_V63.STATUS.HIPOTESE;

}

/**
 * ------------------------------------------------------------
 * NORMALIZAR CONFIANÇA
 * ------------------------------------------------------------
 */
function normalizarConfiancaResolucaoV63_(confianca) {

  const valor =
    normalizarTextoResolucaoV63_(
      confianca
    ).toUpperCase();

  const confiancas =
    BIBLIOTECA_RESOLUCOES_V63.CONFIANCAS;

  if (
    Object.keys(confiancas)
      .some(function(chave) {
        return confiancas[chave] === valor;
      })
  ) {
    return valor;
  }

  return
    BIBLIOTECA_RESOLUCOES_V63.CONFIANCAS
      .BAIXA;

}


/**
 * ------------------------------------------------------------
 * NORMALIZAR ORIGEM
 * ------------------------------------------------------------
 */
function normalizarOrigemResolucaoV63_(origem) {

  const valor =
    normalizarTextoResolucaoV63_(
      origem
    ).toUpperCase();

  const origens =
    BIBLIOTECA_RESOLUCOES_V63.ORIGENS;

  if (
    Object.keys(origens)
      .some(function(chave) {
        return origens[chave] === valor;
      })
  ) {
    return valor;
  }

  return
    BIBLIOTECA_RESOLUCOES_V63.ORIGENS
      .PESQUISA_IA;

}


/**
 * ------------------------------------------------------------
 * SERIALIZAR CAMPO ESTRUTURADO
 * ------------------------------------------------------------
 */
function serializarResolucaoV63_(valor) {

  if (
    valor === undefined ||
    valor === null ||
    valor === ''
  ) {
    return '';
  }

  if (
    typeof valor === 'object'
  ) {

    return JSON.stringify(
      valor
    );

  }

  return String(valor);

}


/**
 * ------------------------------------------------------------
 * DESSERIALIZAR CAMPO ESTRUTURADO
 * ------------------------------------------------------------
 */
function desserializarResolucaoV63_(valor) {

  if (
    valor === undefined ||
    valor === null ||
    valor === ''
  ) {
    return '';
  }

  if (
    typeof valor !== 'string'
  ) {
    return valor;
  }

  try {

    return JSON.parse(
      valor
    );

  } catch (erro) {

    return valor;

  }

}

/**
 * ============================================================
 * FEEDS SOLUTIONS — V6.3
 * MOTOR DE RECONHECIMENTO DE RESOLUÇÕES
 * ============================================================
 *
 * Responsabilidade:
 * - Comparar um problema investigado com a biblioteca
 * - Calcular aderência de forma determinística
 * - Ranqueiar resoluções
 * - Respeitar o status da resolução
 * - Nunca transformar hipótese em solução validada
 *
 * Esta camada NÃO expõe tecnologia ao cliente.
 * Esta camada NÃO trata preço.
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * TOKENIZAR TEXTO
 * ------------------------------------------------------------
 */
function tokenizarReconhecimentoV63_(valor) {

  const texto =
    normalizarTextoResolucaoV63_(
      valor
    )
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ');

  if (!texto) {
    return [];
  }

  const stopwords = {

    a: true,
    o: true,
    os: true,
    as: true,
    um: true,
    uma: true,
    uns: true,
    umas: true,

    de: true,
    da: true,
    do: true,
    das: true,
    dos: true,

    em: true,
    no: true,
    na: true,
    nos: true,
    nas: true,

    por: true,
    para: true,

    e: true,
    ou: true,

    que: true,
    se: true,

    com: true,
    sem: true,

    hoje: true,
    muito: true,
    mais: true,
    menos: true,

    esse: true,
    essa: true,
    isso: true,
    este: true,
    esta: true

  };

  const tokens =
    texto
      .split(/\s+/)
      .filter(function(token) {

        return (
          token.length >= 3 &&
          !stopwords[token]
        );

      });

  return Array.from(
    new Set(tokens)
  );

}


/**
 * ------------------------------------------------------------
 * INTERSEÇÃO DE TOKENS
 * ------------------------------------------------------------
 */
function calcularIntersecaoReconhecimentoV63_(
  tokensA,
  tokensB
) {

  const a =
    Array.isArray(tokensA)
      ? tokensA
      : [];

  const b =
    Array.isArray(tokensB)
      ? tokensB
      : [];

  if (
    a.length === 0 ||
    b.length === 0
  ) {
    return 0;
  }

  const conjuntoB =
    {};

  b.forEach(
    function(token) {
      conjuntoB[token] = true;
    }
  );

  let iguais = 0;

  a.forEach(
    function(token) {

      if (
        conjuntoB[token]
      ) {
        iguais++;
      }

    }
  );

  return iguais;

}


/**
 * ------------------------------------------------------------
 * SIMILARIDADE DE TEXTO
 * ------------------------------------------------------------
 *
 * Usa Jaccard:
 *
 * interseção / união
 *
 * Resultado:
 * 0 a 100
 * ------------------------------------------------------------
 */
function calcularSimilaridadeTextoV63_(
  valorA,
  valorB
) {

  const tokensA =
    tokenizarReconhecimentoV63_(
      valorA
    );

  const tokensB =
    tokenizarReconhecimentoV63_(
      valorB
    );

  if (
    tokensA.length === 0 ||
    tokensB.length === 0
  ) {
    return 0;
  }

  const intersecao =
    calcularIntersecaoReconhecimentoV63_(
      tokensA,
      tokensB
    );

  const uniao =
    Array.from(
      new Set(
        tokensA.concat(
          tokensB
        )
      )
    ).length;

  if (
    uniao === 0
  ) {
    return 0;
  }

  return Math.round(
    (
      intersecao /
      uniao
    ) * 100
  );

}


/**
 * ------------------------------------------------------------
 * SIMILARIDADE DE ARRAYS
 * ------------------------------------------------------------
 */
function calcularSimilaridadeArrayV63_(
  valoresA,
  valoresB
) {

  const a =
    Array.isArray(valoresA)
      ? valoresA
      : [];

  const b =
    Array.isArray(valoresB)
      ? valoresB
      : [];

  if (
    a.length === 0 ||
    b.length === 0
  ) {
    return 0;
  }

  const textoA =
    a.join(' ');

  const textoB =
    b.join(' ');

  return calcularSimilaridadeTextoV63_(
    textoA,
    textoB
  );

}


/**
 * ------------------------------------------------------------
 * EXTRAIR RESULTADO DESEJADO
 * ------------------------------------------------------------
 */
function extrairResultadoReconhecimentoV63_(
  investigacao
) {

  if (!investigacao) {
    return '';
  }

  if (
    investigacao.resultado_desejado
  ) {
    return String(
      investigacao.resultado_desejado
    );
  }

  if (
    investigacao.resultados_desejados
  ) {

    if (
      Array.isArray(
        investigacao.resultados_desejados
      )
    ) {

      return investigacao.resultados_desejados
        .join(' ');

    }

    return String(
      investigacao.resultados_desejados
    );

  }

  return '';

}


/**
 * ------------------------------------------------------------
 * EXTRAIR DORES
 * ------------------------------------------------------------
 */
function extrairDoresReconhecimentoV63_(
  investigacao
) {

  if (!investigacao) {
    return [];
  }

  if (
    Array.isArray(
      investigacao.pontos_de_dor
    )
  ) {

    return investigacao.pontos_de_dor;

  }

  if (
    Array.isArray(
      investigacao.dores
    )
  ) {

    return investigacao.dores;

  }

  return [];

}


/**
 * ------------------------------------------------------------
 * EXTRAIR IMPACTOS
 * ------------------------------------------------------------
 */
function extrairImpactosReconhecimentoV63_(
  investigacao
) {

  if (!investigacao) {
    return [];
  }

  if (
    Array.isArray(
      investigacao.impactos
    )
  ) {

    return investigacao.impactos;

  }

  if (
    investigacao.impacto
  ) {

    if (
      typeof investigacao.impacto ===
      'object'
    ) {

      if (
        investigacao.impacto.descricao
      ) {

        return [
          investigacao.impacto.descricao
        ];

      }

      return Object.keys(
        investigacao.impacto
      ).map(
        function(chave) {
          return investigacao.impacto[chave];
        }
      );

    }

    return [
      investigacao.impacto
    ];

  }

  return [];

}


/**
 * ------------------------------------------------------------
 * COMPARAR INVESTIGAÇÃO COM RESOLUÇÃO
 * ------------------------------------------------------------
 */
function compararInvestigacaoResolucaoV63_(
  investigacao,
  resolucao
) {

  investigacao =
    investigacao || {};

  resolucao =
    resolucao || {};

  const problema =
    investigacao.problema_central ||
    investigacao.dor ||
    investigacao.dor_principal ||
    '';

  const processo =
    investigacao.processo ||
    investigacao.processo_resumo ||
    '';

  const dores =
    extrairDoresReconhecimentoV63_(
      investigacao
    );

  const impactos =
    extrairImpactosReconhecimentoV63_(
      investigacao
    );

  const resultado =
    extrairResultadoReconhecimentoV63_(
      investigacao
    );

  const contexto =
    investigacao.contexto ||
    investigacao.processo_nome ||
    '';

  const similaridadeProblema =
    calcularSimilaridadeTextoV63_(
      problema,
      resolucao.descricao_problema ||
      resolucao.padrao_problema ||
      ''
    );

  const similaridadeProcesso =
    calcularSimilaridadeTextoV63_(
      processo,
      resolucao.processo ||
      ''
    );

  const similaridadeDores =
    calcularSimilaridadeArrayV63_(
      dores,
      resolucao.dores
    );

  const similaridadeImpactos =
    calcularSimilaridadeArrayV63_(
      impactos,
      resolucao.impactos
    );

  const similaridadeResultado =
    calcularSimilaridadeTextoV63_(
      resultado,
      (
        Array.isArray(
          resolucao.resultados_desejados
        )
          ? resolucao.resultados_desejados.join(' ')
          : resolucao.resultados_desejados || ''
      )
    );

  const similaridadeContexto =
    calcularSimilaridadeTextoV63_(
      contexto,
      resolucao.contexto ||
      ''
    );


  const pontuacao =
    Math.round(

      (
        similaridadeProblema *
        0.30
      ) +

      (
        similaridadeProcesso *
        0.25
      ) +

      (
        similaridadeDores *
        0.15
      ) +

      (
        similaridadeImpactos *
        0.10
      ) +

      (
        similaridadeResultado *
        0.15
      ) +

      (
        similaridadeContexto *
        0.05
      )

    );


  return {

    resolucao_id:
      resolucao.resolucao_id,

    titulo_interno:
      resolucao.titulo_interno,

    status:
      resolucao.status,

    confianca:
      resolucao.confianca,

    origem:
      resolucao.origem,

    pontuacao:
      Math.max(
        0,
        Math.min(
          100,
          pontuacao
        )
      ),

    dimensoes: {

      problema:
        similaridadeProblema,

      processo:
        similaridadeProcesso,

      dores:
        similaridadeDores,

      impactos:
        similaridadeImpactos,

      resultado:
        similaridadeResultado,

      contexto:
        similaridadeContexto

    },

    resolucao:
      resolucao

  };

}


/**
 * ------------------------------------------------------------
 * DEFINIR PRIORIDADE DO STATUS
 * ------------------------------------------------------------
 */
function prioridadeStatusResolucaoV63_(
  status
) {

  switch (
    normalizarStatusResolucaoV63_(
      status
    )
  ) {

    case 'VALIDADA':
      return 5;

    case 'EM_ANALISE':
      return 4;

    case 'HIPOTESE':
      return 3;

    case 'SUPERADA':
      return 2;

    case 'ARQUIVADA':
      return 1;

    default:
      return 0;

  }

}


/**
 * ------------------------------------------------------------
 * BUSCAR RESOLUÇÕES RELACIONADAS
 * ------------------------------------------------------------
 */
function buscarResolucoesRelacionadasV63_(
  investigacao,
  opcoes
) {

  investigacao =
    investigacao || {};

  opcoes =
    opcoes || {};

  const todas =
    listarResolucoesV63_();

  const resultados =
    [];

  const pontuacaoMinima =
    opcoes.pontuacao_minima !== undefined
      ? Number(
          opcoes.pontuacao_minima
        )
      : 20;

  todas.forEach(
    function(resolucao) {

      if (
        !resolucao
      ) {
        return;
      }

      if (
        resolucao.status ===
        BIBLIOTECA_RESOLUCOES_V63.STATUS
          .ARQUIVADA
      ) {
        return;
      }

      const comparacao =
        compararInvestigacaoResolucaoV63_(
          investigacao,
          resolucao
        );

      if (
        comparacao.pontuacao <
        pontuacaoMinima
      ) {
        return;
      }

      resultados.push(
        comparacao
      );

    }
  );


  resultados.sort(
    function(a, b) {

      if (
        b.pontuacao !==
        a.pontuacao
      ) {

        return (
          b.pontuacao -
          a.pontuacao
        );

      }

      return (
        prioridadeStatusResolucaoV63_(
          b.status
        ) -
        prioridadeStatusResolucaoV63_(
          a.status
        )
      );

    }
  );


  const limite =
    opcoes.limite !== undefined
      ? Number(
          opcoes.limite
        )
      : 10;


  return resultados.slice(
    0,
    limite
  );

}


/**
 * ------------------------------------------------------------
 * BUSCAR SOMENTE RESOLUÇÕES VALIDADAS RELACIONADAS
 * ------------------------------------------------------------
 */
function buscarResolucoesValidadasRelacionadasV63_(
  investigacao,
  opcoes
) {

  const resultados =
    buscarResolucoesRelacionadasV63_(
      investigacao,
      opcoes
    );

  return resultados.filter(
    function(item) {

      return (
        item.status ===
        BIBLIOTECA_RESOLUCOES_V63.STATUS
          .VALIDADA
      );

    }
  );

}


/**
 * ------------------------------------------------------------
 * CLASSIFICAR RESULTADO DO RECONHECIMENTO
 * ------------------------------------------------------------
 */
function classificarReconhecimentoV63_(
  resultados
) {

  const lista =
    Array.isArray(
      resultados
    )
      ? resultados
      : [];

  if (
    lista.length === 0
  ) {

    return {
      classificacao:
        'NENHUMA_CORRESPONDENCIA',
      confianca:
        'BAIXA',
      resultados: []
    };

  }


  const validadas =
    lista.filter(
      function(item) {

        return (
          item.status ===
          BIBLIOTECA_RESOLUCOES_V63.STATUS
            .VALIDADA
        );

      }
    );


  const melhor =
    lista[0];


  if (
    validadas.length === 1
  ) {

    return {

      classificacao:
        'SOLUCAO_ENCONTRADA',

      confianca:
        melhor.pontuacao >= 80
          ? 'ALTA'
          : melhor.pontuacao >= 60
            ? 'MEDIA'
            : 'BAIXA',

      melhor:
        melhor,

      resultados:
        lista

    };

  }


  if (
    validadas.length > 1
  ) {

    return {

      classificacao:
        'SOLUCOES_ENCONTRADAS',

      confianca:
        melhor.pontuacao >= 80
          ? 'ALTA'
          : melhor.pontuacao >= 60
            ? 'MEDIA'
            : 'BAIXA',

      melhor:
        melhor,

      resultados:
        lista

    };

  }


  const hipoteses =
    lista.filter(
      function(item) {

        return (
          item.status ===
          BIBLIOTECA_RESOLUCOES_V63.STATUS
            .HIPOTESE ||
          item.status ===
          BIBLIOTECA_RESOLUCOES_V63.STATUS
            .EM_ANALISE
        );

      }
    );


  if (
    hipoteses.length > 0
  ) {

    return {

      classificacao:
        'ABORDAGEM_EM_ANALISE',

      confianca:
        melhor.pontuacao >= 80
          ? 'ALTA'
          : melhor.pontuacao >= 60
            ? 'MEDIA'
            : 'BAIXA',

      melhor:
        melhor,

      resultados:
        lista

    };

  }


  return {

    classificacao:
      'NENHUMA_SOLUCAO_VALIDADA',

    confianca:
      'BAIXA',

    melhor:
      melhor,

    resultados:
      lista

  };

}


/**
 * ============================================================
 * TESTE OFICIAL
 * MOTOR DE RECONHECIMENTO V6.3
 * ============================================================
 */
function TESTAR_RECONHECIMENTO_SOLUCOES_V63() {

  const resultados =
    [];

  function testar(
    numero,
    descricao,
    funcao
  ) {

    try {

      const passou =
        funcao() === true;

      resultados.push({

        numero:
          numero,

        descricao:
          descricao,

        passou:
          passou,

        erro:
          passou
            ? ''
            : 'Resultado inesperado'

      });

    } catch (erro) {

      resultados.push({

        numero:
          numero,

        descricao:
          descricao,

        passou:
          false,

        erro:
          erro &&
          erro.message
            ? erro.message
            : String(
                erro
              )

      });

    }

  }


  const marcador =
    'TESTE_RECON_V63_' +
    new Date()
      .getTime();


  const idsTeste =
    [];


  const investigacaoPerfeita = {

    problema_central:
      'erros de digitação e retrabalho',

    processo:
      'conferência e lançamento manual de pedidos',

    pontos_de_dor: [
      'erros de digitação',
      'retrabalho'
    ],

    impacto: {
      descricao:
        'perda de tempo'
    },

    resultado_desejado:
      'reduzir erros e retrabalho',

    contexto:
      'processo administrativo'

  };


  testar(
    1,
    'Tokenização funciona',
    function() {

      const tokens =
        tokenizarReconhecimentoV63_(
          'Erros de digitação e retrabalho'
        );

      return (
        Array.isArray(
          tokens
        ) &&
        tokens.indexOf(
          'erros'
        ) !== -1 &&
        tokens.indexOf(
          'retrabalho'
        ) !== -1
      );

    }
  );


  testar(
    2,
    'Acentos são normalizados',
    function() {

      const tokens =
        tokenizarReconhecimentoV63_(
          'Conferência'
        );

      return (
        tokens.indexOf(
          'conferencia'
        ) !== -1
      );

    }
  );


  testar(
    3,
    'Palavras duplicadas são removidas',
    function() {

      const tokens =
        tokenizarReconhecimentoV63_(
          'pedido pedido pedido'
        );

      return (
        tokens.length === 1 &&
        tokens[0] ===
          'pedido'
      );

    }
  );


  testar(
    4,
    'Similaridade idêntica retorna 100',
    function() {

      return (
        calcularSimilaridadeTextoV63_(
          'conferência e lançamento manual',
          'conferência e lançamento manual'
        ) === 100
      );

    }
  );


  testar(
    5,
    'Textos diferentes não retornam 100',
    function() {

      return (
        calcularSimilaridadeTextoV63_(
          'conferência de pedidos',
          'controle financeiro'
        ) < 100
      );

    }
  );


  testar(
    6,
    'Textos sem relação retornam 0',
    function() {

      return (
        calcularSimilaridadeTextoV63_(
          'câmera segurança',
          'folha pagamento'
        ) === 0
      );

    }
  );


  testar(
    7,
    'Arrays semelhantes são comparados',
    function() {

      return (
        calcularSimilaridadeArrayV63_(
          [
            'erros',
            'retrabalho'
          ],
          [
            'erros',
            'retrabalho'
          ]
        ) === 100
      );

    }
  );


  const resolucaoPerfeita = {

    resolucao_id:
      marcador + '_PERFEITA',

    titulo_interno:
      marcador + '_PERFEITA',

    descricao_problema:
      'erros de digitação e retrabalho',

    padrao_problema:
      'erros de digitação e retrabalho',

    processo:
      'conferência e lançamento manual de pedidos',

    dores: [
      'erros de digitação',
      'retrabalho'
    ],

    impactos: [
      'perda de tempo'
    ],

    resultados_desejados: [
      'reduzir erros e retrabalho'
    ],

    contexto:
      'processo administrativo',

    restricoes: [],

    abordagem_interna:
      'abordagem interna de teste',

    descricao_solucao_interna:
      'solução interna de teste',

    alternativas: [],

    status:
      'VALIDADA',

    confianca:
      'ALTA',

    evidencias: [
      'teste controlado'
    ],

    casos_relacionados: [],

    origem:
      'CASO_VALIDADO',

    versao:
      'V6.3'

  };


  const resolucaoParcial = {

    resolucao_id:
      marcador + '_PARCIAL',

    titulo_interno:
      marcador + '_PARCIAL',

    descricao_problema:
      'conferência de pedidos',

    padrao_problema:
      'conferência manual',

    processo:
      'conferência de pedidos',

    dores: [
      'retrabalho'
    ],

    impactos: [
      'perda de tempo'
    ],

    resultados_desejados: [
      'reduzir retrabalho'
    ],

    contexto:
      'processo administrativo',

    restricoes: [],

    abordagem_interna:
      'abordagem parcial',

    descricao_solucao_interna:
      'solução parcial',

    alternativas: [],

    status:
      'VALIDADA',

    confianca:
      'MEDIA',

    evidencias: [
      'caso parcial'
    ],

    casos_relacionados: [],

    origem:
      'CASO_VALIDADO',

    versao:
      'V6.3'

  };


  const resolucaoHipotese = {

    resolucao_id:
      marcador + '_HIPOTESE',

    titulo_interno:
      marcador + '_HIPOTESE',

    descricao_problema:
      'automação de conferência de pedidos',

    padrao_problema:
      'automação de pedidos',

    processo:
      'conferência de pedidos',

    dores: [
      'retrabalho'
    ],

    impactos: [
      'perda de tempo'
    ],

    resultados_desejados: [
      'reduzir retrabalho'
    ],

    contexto:
      'processo administrativo',

    restricoes: [],

    abordagem_interna:
      'hipótese',

    descricao_solucao_interna:
      'hipótese ainda não validada',

    alternativas: [],

    status:
      'HIPOTESE',

    confianca:
      'MEDIA',

    evidencias: [],

    casos_relacionados: [],

    origem:
      'PESQUISA_IA',

    versao:
      'V6.3'

  };


  const resolucaoArquivada = {

    resolucao_id:
      marcador + '_ARQUIVADA',

    titulo_interno:
      marcador + '_ARQUIVADA',

    descricao_problema:
      'erros de digitação e retrabalho',

    padrao_problema:
      'erros de digitação',

    processo:
      'conferência e lançamento manual de pedidos',

    dores: [
      'erros de digitação',
      'retrabalho'
    ],

    impactos: [
      'perda de tempo'
    ],

    resultados_desejados: [
      'reduzir erros e retrabalho'
    ],

    contexto:
      'processo administrativo',

    restricoes: [],

    abordagem_interna:
      'arquivada',

    descricao_solucao_interna:
      'arquivada',

    alternativas: [],

    status:
      'ARQUIVADA',

    confianca:
      'ALTA',

    evidencias: [
      'histórico'
    ],

    casos_relacionados: [],

    origem:
      'CASO_VALIDADO',

    versao:
      'V6.3'

  };


  [
    resolucaoPerfeita,
    resolucaoParcial,
    resolucaoHipotese,
    resolucaoArquivada
  ].forEach(
    function(resolucao) {

      const retorno =
        salvarResolucaoV63_(
          resolucao
        );

      idsTeste.push(
        retorno.resolucao_id
      );

    }
  );


  testar(
    8,
    'Resolução perfeita foi persistida',
    function() {

      return !!buscarResolucaoV63_({
        resolucao_id:
          resolucaoPerfeita.resolucao_id
      });

    }
  );


  testar(
    9,
    'Comparação perfeita retorna pontuação 100',
    function() {

      const resultado =
        compararInvestigacaoResolucaoV63_(
          investigacaoPerfeita,
          resolucaoPerfeita
        );

      return (
        resultado.pontuacao === 100
      );

    }
  );


  testar(
    10,
    'Comparação possui todas as dimensões',
    function() {

      const resultado =
        compararInvestigacaoResolucaoV63_(
          investigacaoPerfeita,
          resolucaoPerfeita
        );

      return (
        resultado.dimensoes.problema === 100 &&
        resultado.dimensoes.processo === 100 &&
        resultado.dimensoes.dores === 100 &&
        resultado.dimensoes.impactos === 100 &&
        resultado.dimensoes.resultado === 100 &&
        resultado.dimensoes.contexto === 100
      );

    }
  );


  testar(
    11,
    'Busca relacionada encontra resolução',
    function() {

      const resultados =
        buscarResolucoesRelacionadasV63_(
          investigacaoPerfeita,
          {
            pontuacao_minima: 20
          }
        );

      return (
        resultados.length > 0 &&
        resultados.some(
          function(item) {
            return (
              item.resolucao_id ===
              resolucaoPerfeita.resolucao_id
            );
          }
        )
      );

    }
  );


  testar(
    12,
    'Resolução perfeita fica em primeiro lugar',
    function() {

      const resultados =
        buscarResolucoesRelacionadasV63_(
          investigacaoPerfeita
        );

      return (
        resultados.length > 0 &&
        resultados[0].resolucao_id ===
          resolucaoPerfeita.resolucao_id
      );

    }
  );


  testar(
    13,
    'Busca de validadas retorna apenas VALIDADA',
    function() {

      const resultados =
        buscarResolucoesValidadasRelacionadasV63_(
          investigacaoPerfeita
        );

      return (
        resultados.length > 0 &&
        resultados.every(
          function(item) {

            return (
              item.status ===
              'VALIDADA'
            );

          }
        )
      );

    }
  );


  testar(
    14,
    'HIPOTESE nunca é retornada como VALIDADA',
    function() {

      const resultados =
        buscarResolucoesValidadasRelacionadasV63_(
          investigacaoPerfeita
        );

      return (
        resultados.every(
          function(item) {

            return (
              item.status !==
              'HIPOTESE'
            );

          }
        )
      );

    }
  );


  testar(
    15,
    'ARQUIVADA não participa da busca',
    function() {

      const resultados =
        buscarResolucoesRelacionadasV63_(
          investigacaoPerfeita
        );

      return (
        resultados.every(
          function(item) {

            return (
              item.resolucao_id !==
              resolucaoArquivada.resolucao_id
            );

          }
        )
      );

    }
  );


  testar(
  16,
  'Resultado classifica múltiplas soluções encontradas',
  function() {

    const resultados =
      buscarResolucoesRelacionadasV63_(
        investigacaoPerfeita
      );

    const classificacao =
      classificarReconhecimentoV63_(
        resultados
      );

    return (
      classificacao.classificacao ===
      'SOLUCOES_ENCONTRADAS'
    );

  }
);


  testar(
    17,
    'Classificação mantém a melhor resolução',
    function() {

      const resultados =
        buscarResolucoesRelacionadasV63_(
          investigacaoPerfeita
        );

      const classificacao =
        classificarReconhecimentoV63_(
          resultados
        );

      return (
        classificacao.melhor &&
        classificacao.melhor.resolucao_id ===
          resolucaoPerfeita.resolucao_id
      );

    }
  );


  testar(
    18,
    'Confiança alta para aderência perfeita',
    function() {

      const resultados =
        buscarResolucoesRelacionadasV63_(
          investigacaoPerfeita
        );

      const classificacao =
        classificarReconhecimentoV63_(
          resultados
        );

      return (
        classificacao.confianca ===
        'ALTA'
      );

    }
  );


  testar(
    19,
    'Classificação não altera status da resolução',
    function() {

      const registro =
        buscarResolucaoV63_({
          resolucao_id:
            resolucaoPerfeita.resolucao_id
        });

      return (
        registro.status ===
        'VALIDADA'
      );

    }
  );


  testar(
    20,
    'Busca respeita limite',
    function() {

      const resultados =
        buscarResolucoesRelacionadasV63_(
          investigacaoPerfeita,
          {
            limite: 1
          }
        );

      return (
        resultados.length <= 1
      );

    }
  );


  testar(
    21,
    'Pontuação sempre fica entre 0 e 100',
    function() {

      const resultados =
        buscarResolucoesRelacionadasV63_(
          investigacaoPerfeita
        );

      return resultados.every(
        function(item) {

          return (
            item.pontuacao >= 0 &&
            item.pontuacao <= 100
          );

        }
      );

    }
  );


  testar(
    22,
    'Reconhecimento não expõe tecnologia',
    function() {

      const resultados =
        buscarResolucoesRelacionadasV63_(
          investigacaoPerfeita
        );

      const texto =
        JSON.stringify(
          resultados
        ).toLowerCase();

      return (
        texto.indexOf('api') === -1 &&
        texto.indexOf('prompt') === -1
      );

    }
  );


  testar(
    23,
    'Reconhecimento não trata preço',
    function() {

      const resultados =
        buscarResolucoesRelacionadasV63_(
          investigacaoPerfeita
        );

      const texto =
        JSON.stringify(
          resultados
        ).toLowerCase();

      return (
        texto.indexOf('preço') === -1 &&
        texto.indexOf('desconto') === -1
      );

    }
  );


  testar(
    24,
    'Nenhuma correspondência para problema totalmente diferente',
    function() {

      const diferente = {

        problema_central:
          'controle de manutenção de veículos',

        processo:
          'inspeção e manutenção de frota',

        pontos_de_dor: [
          'atrasos de manutenção'
        ],

        impacto: {
          descricao:
            'veículos indisponíveis'
        },

        resultado_desejado:
          'reduzir indisponibilidade',

        contexto:
          'frota'

      };

      const resultados =
        buscarResolucoesRelacionadasV63_(
          diferente,
          {
            pontuacao_minima: 70
          }
        );

      return (
        resultados.length === 0
      );

    }
  );


  testar(
    25,
    'Motor é determinístico',
    function() {

      const primeira =
        buscarResolucoesRelacionadasV63_(
          investigacaoPerfeita
        );

      const segunda =
        buscarResolucoesRelacionadasV63_(
          investigacaoPerfeita
        );

      return (
        JSON.stringify(
          primeira
        ) ===
        JSON.stringify(
          segunda
        )
      );

    }
  );


  /**
   * ----------------------------------------------------------
   * LIMPEZA
   * ----------------------------------------------------------
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

    const cabecalhos =
      valores[0];

    const colunaId =
      cabecalhos.indexOf(
        'resolucao_id'
      );

    for (
      let i =
        valores.length - 1;
      i >= 1;
      i--
    ) {

      if (
        idsTeste.indexOf(
          String(
            valores[i][colunaId]
          )
        ) !== -1
      ) {

        sheet.deleteRow(
          i + 1
        );

      }

    }

  } catch (erroLimpeza) {

    Logger.log(
      'AVISO LIMPEZA RECONHECIMENTO V6.3: ' +
      erroLimpeza.message
    );

  }


  const aprovados =
    resultados.filter(
      function(item) {
        return item.passou;
      }
    ).length;

  const falhas =
    resultados.length -
    aprovados;

  const percentual =
    resultados.length > 0
      ? Math.round(
          (
            aprovados /
            resultados.length
          ) * 100
        )
      : 0;


  Logger.log(
    '============================================================'
  );

  Logger.log(
    'TESTAR_RECONHECIMENTO_SOLUCOES_V63'
  );

  Logger.log(
    'APROVADOS: ' +
    aprovados +
    '/' +
    resultados.length
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


  resultados.forEach(
    function(item) {

      Logger.log(
        (
          item.passou
            ? '✅'
            : '❌'
        ) +
        ' TESTE ' +
        item.numero +
        ' — ' +
        item.descricao +
        (
          item.erro
            ? ' — ' +
              item.erro
            : ''
        )
      );

    }
  );


  if (
    aprovados ===
    resultados.length
  ) {

    Logger.log(
      '🏆 TESTAR_RECONHECIMENTO_SOLUCOES_V63: PASSOU'
    );

    Logger.log(
      '🏆 RECONHECIMENTO V6.3: 100%'
    );

  } else {

    Logger.log(
      '❌ TESTAR_RECONHECIMENTO_SOLUCOES_V63: FALHOU'
    );

  }


  return {

    sucesso:
      falhas === 0,

    aprovados:
      aprovados,

    falhas:
      falhas,

    percentual:
      percentual,

    resultados:
      resultados

  };

}
/**
 * ------------------------------------------------------------
 * NORMALIZAR REGISTRO
 * ------------------------------------------------------------
 */
function normalizarRegistroResolucaoV63_(
  registro
) {

  if (!registro) {
    return null;
  }

  return {

    resolucao_id:
      normalizarTextoResolucaoV63_(
        registro.resolucao_id
      ),

    titulo_interno:
      normalizarTextoResolucaoV63_(
        registro.titulo_interno
      ),

    descricao_problema:
      normalizarTextoResolucaoV63_(
        registro.descricao_problema
      ),

    padrao_problema:
      normalizarTextoResolucaoV63_(
        registro.padrao_problema
      ),

    processo:
      normalizarTextoResolucaoV63_(
        registro.processo
      ),

    dores:
      desserializarResolucaoV63_(
        registro.dores
      ) || [],

    impactos:
      desserializarResolucaoV63_(
        registro.impactos
      ) || [],

    resultados_desejados:
      desserializarResolucaoV63_(
        registro.resultados_desejados
      ) || [],

    contexto:
      normalizarTextoResolucaoV63_(
        registro.contexto
      ),

    restricoes:
      desserializarResolucaoV63_(
        registro.restricoes
      ) || [],

    abordagem_interna:
      normalizarTextoResolucaoV63_(
        registro.abordagem_interna
      ),

    descricao_solucao_interna:
      normalizarTextoResolucaoV63_(
        registro.descricao_solucao_interna
      ),

    alternativas:
      desserializarResolucaoV63_(
        registro.alternativas
      ) || [],

    status:
      normalizarStatusResolucaoV63_(
        registro.status
      ),

    confianca:
      normalizarConfiancaResolucaoV63_(
        registro.confianca
      ),

    evidencias:
      desserializarResolucaoV63_(
        registro.evidencias
      ) || [],

    casos_relacionados:
      desserializarResolucaoV63_(
        registro.casos_relacionados
      ) || [],

    origem:
      normalizarOrigemResolucaoV63_(
        registro.origem
      ),

    versao:
      normalizarTextoResolucaoV63_(
        registro.versao
      ) ||
      BIBLIOTECA_RESOLUCOES_V63.VERSAO,

    criado_em:
      registro.criado_em || '',

    atualizado_em:
      registro.atualizado_em || ''

  };

}


/**
 * ------------------------------------------------------------
 * SALVAR RESOLUÇÃO
 * ------------------------------------------------------------
 */
function salvarResolucaoV63_(
  dados
) {

  dados = dados || {};

  const sheet =
    obterAba_(
      SHEETS.BIBLIOTECA_RESOLUCOES
    );

  const agora =
    new Date();

  const resolucaoId =
    dados.resolucao_id ||
    gerarId_(
      ID_PREFIXOS.RESOLUCAO
    );

  const existente =
    buscarResolucaoV63_({
      resolucao_id:
        resolucaoId
    });

  if (existente) {

    throw new Error(
      'Resolução já existe: ' +
      resolucaoId
    );

  }

  const status =
    normalizarStatusResolucaoV63_(
      dados.status
    );

  const confianca =
    normalizarConfiancaResolucaoV63_(
      dados.confianca
    );

  const origem =
    normalizarOrigemResolucaoV63_(
      dados.origem
    );

  const linha = [

    resolucaoId,

    dados.titulo_interno || '',

    dados.descricao_problema || '',

    dados.padrao_problema || '',

    dados.processo || '',

    serializarResolucaoV63_(
      dados.dores || []
    ),

    serializarResolucaoV63_(
      dados.impactos || []
    ),

    serializarResolucaoV63_(
      dados.resultados_desejados || []
    ),

    dados.contexto || '',

    serializarResolucaoV63_(
      dados.restricoes || []
    ),

    dados.abordagem_interna || '',

    dados.descricao_solucao_interna || '',

    serializarResolucaoV63_(
      dados.alternativas || []
    ),

    status,

    confianca,

    serializarResolucaoV63_(
      dados.evidencias || []
    ),

    serializarResolucaoV63_(
      dados.casos_relacionados || []
    ),

    origem,

    dados.versao ||
      BIBLIOTECA_RESOLUCOES_V63.VERSAO,

    dados.criado_em ||
      agora,

    dados.atualizado_em ||
      agora

  ];

  sheet.appendRow(
    linha
  );

  return {

    sucesso: true,

    acao: 'CRIADA',

    resolucao_id:
      resolucaoId,

    status:
      status,

    confianca:
      confianca

  };

}


/**
 * ------------------------------------------------------------
 * BUSCAR RESOLUÇÃO
 * ------------------------------------------------------------
 */
function buscarResolucaoV63_(
  filtros
) {

  filtros =
    filtros || {};

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
    return null;
  }

  const cabecalhos =
    valores[0];

  const colunaId =
    cabecalhos.indexOf(
      'resolucao_id'
    );

  const colunaTitulo =
    cabecalhos.indexOf(
      'titulo_interno'
    );

  const colunaStatus =
    cabecalhos.indexOf(
      'status'
    );

  for (
    let i = 1;
    i < valores.length;
    i++
  ) {

    const linha =
      valores[i];

    if (
      filtros.resolucao_id &&
      String(
        linha[colunaId]
      ) !== String(
        filtros.resolucao_id
      )
    ) {
      continue;
    }

    if (
      filtros.titulo_interno &&
      String(
        linha[colunaTitulo]
      ).toLowerCase() !==
      String(
        filtros.titulo_interno
      ).toLowerCase()
    ) {
      continue;
    }

    if (
      filtros.status &&
      String(
        linha[colunaStatus]
      ).toUpperCase() !==
      String(
        filtros.status
      ).toUpperCase()
    ) {
      continue;
    }

    return normalizarRegistroResolucaoV63_(
      objetoDaLinha_(
        cabecalhos,
        linha
      )
    );

  }

  return null;

}


/**
 * ------------------------------------------------------------
 * LISTAR RESOLUÇÕES
 * ------------------------------------------------------------
 */
function listarResolucoesV63_(
  filtros
) {

  filtros =
    filtros || {};

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
    return [];
  }

  const cabecalhos =
    valores[0];

  const colunaStatus =
    cabecalhos.indexOf(
      'status'
    );

  const registros =
    [];

  for (
    let i = 1;
    i < valores.length;
    i++
  ) {

    const registro =
      normalizarRegistroResolucaoV63_(
        objetoDaLinha_(
          cabecalhos,
          valores[i]
        )
      );

    if (!registro) {
      continue;
    }

    if (
      filtros.status &&
      registro.status !==
        normalizarStatusResolucaoV63_(
          filtros.status
        )
    ) {
      continue;
    }

    if (
      filtros.somente_validadas === true &&
      registro.status !==
        BIBLIOTECA_RESOLUCOES_V63.STATUS
          .VALIDADA
    ) {
      continue;
    }

    registros.push(
      registro
    );

  }

  return registros;

}


/**
 * ------------------------------------------------------------
 * ATUALIZAR RESOLUÇÃO
 * ------------------------------------------------------------
 */
function atualizarResolucaoV63_(
  resolucaoId,
  dados
) {

  if (!resolucaoId) {

    throw new Error(
      'resolucao_id é obrigatório.'
    );

  }

  dados =
    dados || {};

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

    throw new Error(
      'Biblioteca de resoluções vazia.'
    );

  }

  const cabecalhos =
    valores[0];

  const colunaId =
    cabecalhos.indexOf(
      'resolucao_id'
    );

  if (
    colunaId === -1
  ) {

    throw new Error(
      'Coluna resolucao_id não encontrada.'
    );

  }

  for (
    let i = 1;
    i < valores.length;
    i++
  ) {

    if (
      String(
        valores[i][colunaId]
      ) !== String(
        resolucaoId
      )
    ) {
      continue;
    }

    const linhaPlanilha =
      i + 1;

    const camposProtegidos = {

      resolucao_id: true,
      criado_em: true

    };

    Object.keys(
      dados
    ).forEach(
      function(campo) {

        if (
          camposProtegidos[campo]
        ) {
          return;
        }

        const coluna =
          cabecalhos.indexOf(
            campo
          );

        if (
          coluna === -1
        ) {
          return;
        }

        let valor =
          dados[campo];

        if (
          campo === 'status'
        ) {

          valor =
            normalizarStatusResolucaoV63_(
              valor
            );

        }

        if (
          campo === 'confianca'
        ) {

          valor =
            normalizarConfiancaResolucaoV63_(
              valor
            );

        }

        if (
          campo === 'origem'
        ) {

          valor =
            normalizarOrigemResolucaoV63_(
              valor
            );

        }

        const camposEstruturados = [

          'dores',
          'impactos',
          'resultados_desejados',
          'restricoes',
          'alternativas',
          'evidencias',
          'casos_relacionados'

        ];

        if (
          camposEstruturados.indexOf(
            campo
          ) !== -1
        ) {

          valor =
            serializarResolucaoV63_(
              valor
            );

        }

        sheet
          .getRange(
            linhaPlanilha,
            coluna + 1
          )
          .setValue(
            valor
          );

      }
    );

    const colunaAtualizado =
      cabecalhos.indexOf(
        'atualizado_em'
      );

    if (
      colunaAtualizado !== -1
    ) {

      sheet
        .getRange(
          linhaPlanilha,
          colunaAtualizado + 1
        )
        .setValue(
          new Date()
        );

    }

    return {

      sucesso: true,

      acao: 'ATUALIZADA',

      resolucao_id:
        resolucaoId

    };

  }

  throw new Error(
    'Resolução não encontrada: ' +
    resolucaoId
  );

}


/**
 * ------------------------------------------------------------
 * VALIDAR RESOLUÇÃO
 * ------------------------------------------------------------
 *
 * Esta função é deliberadamente restritiva.
 *
 * Uma resolução só pode virar VALIDADA
 * quando houver evidência.
 * ------------------------------------------------------------
 */
function validarResolucaoV63_(
  resolucaoId,
  dados
) {

  const resolucao =
    buscarResolucaoV63_({
      resolucao_id:
        resolucaoId
    });

  if (!resolucao) {

    throw new Error(
      'Resolução não encontrada: ' +
      resolucaoId
    );

  }

  dados =
    dados || {};

  const evidencias =
    dados.evidencias ||
    resolucao.evidencias ||
    [];

  if (
    !Array.isArray(
      evidencias
    ) ||
    evidencias.length === 0
  ) {

    throw new Error(
      'Uma resolução não pode ser VALIDADA sem evidências.'
    );

  }

  const descricao =
    dados.descricao_solucao_interna ||
    resolucao.descricao_solucao_interna ||
    '';

  if (!descricao) {

    throw new Error(
      'Uma resolução não pode ser VALIDADA sem descrição interna da solução.'
    );

  }

  const resultado =
    atualizarResolucaoV63_(
      resolucaoId,
      {

        status:
          BIBLIOTECA_RESOLUCOES_V63.STATUS
            .VALIDADA,

        confianca:
          dados.confianca ||
          BIBLIOTECA_RESOLUCOES_V63.CONFIANCAS
            .ALTA,

        evidencias:
          evidencias,

        descricao_solucao_interna:
          descricao

      }
    );

  return {

    sucesso: true,

    resolucao_id:
      resolucaoId,

    status:
      BIBLIOTECA_RESOLUCOES_V63.STATUS
        .VALIDADA,

    confianca:
      resultado &&
      resultado.sucesso
        ? (
          buscarResolucaoV63_({
            resolucao_id:
              resolucaoId
          }) || {}
        ).confianca || ''
        : ''

  };

}


/**
 * ------------------------------------------------------------
 * PROTEÇÃO — RESOLUÇÃO VALIDADA
 * ------------------------------------------------------------
 *
 * Determina se uma resolução pode ser apresentada
 * como pertencente à biblioteca validada.
 * ------------------------------------------------------------
 */
function resolucaoValidadaV63_(
  resolucao
) {

  if (!resolucao) {
    return false;
  }

  return (
    normalizarStatusResolucaoV63_(
      resolucao.status
    ) ===
    BIBLIOTECA_RESOLUCOES_V63.STATUS
      .VALIDADA
  );

}


/**
 * ------------------------------------------------------------
 * BUSCAR SOMENTE RESOLUÇÕES VALIDADAS
 * ------------------------------------------------------------
 */
function buscarResolucoesValidadasV63_() {

  return listarResolucoesV63_({
    somente_validadas: true
  });

}


/**
 * ------------------------------------------------------------
 * MARCAR COMO SUPERADA
 * ------------------------------------------------------------
 */
function marcarResolucaoSuperadaV63_(
  resolucaoId
) {

  const resolucao =
    buscarResolucaoV63_({
      resolucao_id:
        resolucaoId
    });

  if (!resolucao) {

    throw new Error(
      'Resolução não encontrada: ' +
      resolucaoId
    );

  }

  return atualizarResolucaoV63_(
    resolucaoId,
    {
      status:
        BIBLIOTECA_RESOLUCOES_V63.STATUS
          .SUPERADA
    }
  );

}


/**
 * ------------------------------------------------------------
 * ARQUIVAR RESOLUÇÃO
 * ------------------------------------------------------------
 */
function arquivarResolucaoV63_(
  resolucaoId
) {

  const resolucao =
    buscarResolucaoV63_({
      resolucao_id:
        resolucaoId
    });

  if (!resolucao) {

    throw new Error(
      'Resolução não encontrada: ' +
      resolucaoId
    );

  }

  return atualizarResolucaoV63_(
    resolucaoId,
    {
      status:
        BIBLIOTECA_RESOLUCOES_V63.STATUS
          .ARQUIVADA
    }
  );

}


/**
 * ============================================================
 * TESTE OFICIAL — BIBLIOTECA V6.3
 * ============================================================
 */
function TESTAR_BIBLIOTECA_RESOLUCOES_V63() {

  const resultados = [];

  function testar(
    numero,
    descricao,
    funcao
  ) {

    try {

      const resultado =
        funcao();

      const passou =
        resultado === true;

      resultados.push({

        numero:
          numero,

        descricao:
          descricao,

        passou:
          passou,

        erro:
          passou
            ? ''
            : 'Resultado inesperado'

      });

    } catch (erro) {

      resultados.push({

        numero:
          numero,

        descricao:
          descricao,

        passou:
          false,

        erro:
          erro &&
          erro.message
            ? erro.message
            : String(
                erro
              )

      });

    }

  }


  const marcador =
    'TESTE_V63_' +
    new Date()
      .getTime();


  let resolucaoId =
    '';


  testar(
    1,
    'Contrato V6.3 disponível',
    function() {

      return (
        BIBLIOTECA_RESOLUCOES_V63 &&
        BIBLIOTECA_RESOLUCOES_V63.VERSAO ===
          'V6.3'
      );

    }
  );


  testar(
    2,
    'Status HIPOTESE disponível',
    function() {

      return (
        BIBLIOTECA_RESOLUCOES_V63.STATUS
          .HIPOTESE ===
          'HIPOTESE'
      );

    }
  );


  testar(
    3,
    'Status VALIDADA disponível',
    function() {

      return (
        BIBLIOTECA_RESOLUCOES_V63.STATUS
          .VALIDADA ===
          'VALIDADA'
      );

    }
  );


  testar(
    4,
    'Status SUPERADA disponível',
    function() {

      return (
        BIBLIOTECA_RESOLUCOES_V63.STATUS
          .SUPERADA ===
          'SUPERADA'
      );

    }
  );


  testar(
    5,
    'Normalização de status',
    function() {

      return (
        normalizarStatusResolucaoV63_(
          'validada'
        ) ===
        'VALIDADA'
      );

    }
  );


  testar(
    6,
    'Status inválido retorna HIPOTESE',
    function() {

      return (
        normalizarStatusResolucaoV63_(
          'QUALQUER_COISA'
        ) ===
        'HIPOTESE'
      );

    }
  );


  testar(
    7,
    'Normalização de confiança',
    function() {

      return (
        normalizarConfiancaResolucaoV63_(
          'alta'
        ) ===
        'ALTA'
      );

    }
  );


  testar(
    8,
    'Serialização estruturada',
    function() {

      const valor =
        serializarResolucaoV63_([
          'erro',
          'retrabalho'
        ]);

      return (
        typeof valor === 'string' &&
        valor.indexOf(
          'retrabalho'
        ) !== -1
      );

    }
  );


  testar(
    9,
    'Desserialização estruturada',
    function() {

      const valor =
        desserializarResolucaoV63_(
          '["erro","retrabalho"]'
        );

      return (
        Array.isArray(
          valor
        ) &&
        valor.length === 2
      );

    }
  );


  testar(
    10,
    'Criação de resolução',
    function() {

      const retorno =
        salvarResolucaoV63_({

          titulo_interno:
            marcador,

          descricao_problema:
            'Processo manual com retrabalho.',

          padrao_problema:
            'Conferência e lançamento manual.',

          processo:
            'Receber, conferir e lançar pedidos.',

          dores: [
            'erros',
            'retrabalho'
          ],

          impactos: [
            'perda de tempo'
          ],

          resultados_desejados: [
            'reduzir tempo e erros'
          ],

          contexto:
            'Operação administrativa.',

          restricoes: [
            'manter qualidade'
          ],

          abordagem_interna:
            'Automatizar etapas de conferência e lançamento.',

          descricao_solucao_interna:
            'Solução interna de automação.',

          alternativas: [],

          status:
            'HIPOTESE',

          confianca:
            'MEDIA',

          evidencias: [],

          casos_relacionados: [],

          origem:
            'PESQUISA_IA'

        });

      resolucaoId =
        retorno.resolucao_id;

      return (
        retorno.sucesso === true &&
        !!resolucaoId &&
        retorno.status ===
          'HIPOTESE'
      );

    }
  );


  testar(
    11,
    'Resolução criada pode ser recuperada',
    function() {

      const registro =
        buscarResolucaoV63_({
          resolucao_id:
            resolucaoId
        });

      return (
        !!registro &&
        registro.resolucao_id ===
          resolucaoId
      );

    }
  );


  testar(
    12,
    'Dados estruturados são recuperados como arrays',
    function() {

      const registro =
        buscarResolucaoV63_({
          resolucao_id:
            resolucaoId
        });

      return (
        Array.isArray(
          registro.dores
        ) &&
        Array.isArray(
          registro.impactos
        ) &&
        Array.isArray(
          registro.resultados_desejados
        )
      );

    }
  );


  testar(
    13,
    'HIPOTESE não é considerada validada',
    function() {

      const registro =
        buscarResolucaoV63_({
          resolucao_id:
            resolucaoId
        });

      return (
        resolucaoValidadaV63_(
          registro
        ) === false
      );

    }
  );


  testar(
    14,
    'Hipótese não pode ser validada sem evidências',
    function() {

      let bloqueou =
        false;

      try {

        validarResolucaoV63_(
          resolucaoId,
          {
            evidencias: []
          }
        );

      } catch (erro) {

        bloqueou =
          true;

      }

      return bloqueou;

    }
  );


  testar(
    15,
    'Hipótese pode ser atualizada',
    function() {

      const retorno =
        atualizarResolucaoV63_(
          resolucaoId,
          {
            confianca:
              'ALTA'
          }
        );

      return (
        retorno.sucesso === true &&
        retorno.resolucao_id ===
          resolucaoId
      );

    }
  );


  testar(
    16,
    'Validação exige evidência',
    function() {

      const retorno =
        validarResolucaoV63_(
          resolucaoId,
          {
            evidencias: [
              marcador +
              '_EVIDENCIA'
            ],
            confianca:
              'ALTA',
            descricao_solucao_interna:
              'Solução comprovada em teste controlado.'
          }
        );

      return (
        retorno.sucesso === true &&
        retorno.status ===
          'VALIDADA'
      );

    }
  );


  testar(
    17,
    'Resolução validada é reconhecida como validada',
    function() {

      const registro =
        buscarResolucaoV63_({
          resolucao_id:
            resolucaoId
        });

      return (
        resolucaoValidadaV63_(
          registro
        ) === true
      );

    }
  );


  testar(
    18,
    'Busca somente validadas funciona',
    function() {

      const registros =
        buscarResolucoesValidadasV63_();

      return (
        Array.isArray(
          registros
        ) &&
        registros.some(
          function(item) {
            return (
              item.resolucao_id ===
              resolucaoId
            );
          }
        )
      );

    }
  );


  testar(
    19,
    'Resolução pode ser marcada como SUPERADA',
    function() {

      const retorno =
        marcarResolucaoSuperadaV63_(
          resolucaoId
        );

      const registro =
        buscarResolucaoV63_({
          resolucao_id:
            resolucaoId
        });

      return (
        retorno.sucesso === true &&
        registro.status ===
          'SUPERADA'
      );

    }
  );


  testar(
    20,
    'SUPERADA não é considerada validada',
    function() {

      const registro =
        buscarResolucaoV63_({
          resolucao_id:
            resolucaoId
        });

      return (
        resolucaoValidadaV63_(
          registro
        ) === false
      );

    }
  );


  /**
   * Limpeza do registro de teste.
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

    const cabecalhos =
      valores[0];

    const colunaId =
      cabecalhos.indexOf(
        'resolucao_id'
      );

    for (
      let i =
        valores.length - 1;
      i >= 1;
      i--
    ) {

      if (
        String(
          valores[i][colunaId]
        ) === String(
          resolucaoId
        )
      ) {

        sheet.deleteRow(
          i + 1
        );

      }

    }

  } catch (erroLimpeza) {

    Logger.log(
      'AVISO LIMPEZA V6.3: ' +
      erroLimpeza.message
    );

  }


  const aprovados =
    resultados.filter(
      function(item) {
        return item.passou;
      }
    ).length;

  const falhas =
    resultados.length -
    aprovados;

  const percentual =
    resultados.length > 0
      ? Math.round(
          (
            aprovados /
            resultados.length
          ) * 100
        )
      : 0;


  Logger.log(
    '============================================================'
  );

  Logger.log(
    'TESTAR_BIBLIOTECA_RESOLUCOES_V63'
  );

  Logger.log(
    'APROVADOS: ' +
    aprovados +
    '/' +
    resultados.length
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


  resultados.forEach(
    function(item) {

      Logger.log(
        (
          item.passou
            ? '✅'
            : '❌'
        ) +
        ' TESTE ' +
        item.numero +
        ' — ' +
        item.descricao +
        (
          item.erro
            ? ' — ' +
              item.erro
            : ''
        )
      );

    }
  );


  if (
    aprovados ===
    resultados.length
  ) {

    Logger.log(
      '🏆 TESTAR_BIBLIOTECA_RESOLUCOES_V63: PASSOU'
    );

    Logger.log(
      '🏆 BIBLIOTECA V6.3: 100%'
    );

  } else {

    Logger.log(
      '❌ TESTAR_BIBLIOTECA_RESOLUCOES_V63: FALHOU'
    );

  }

  return {

    sucesso:
      falhas === 0,

    aprovados:
      aprovados,

    falhas:
      falhas,

    percentual:
      percentual,

    resultados:
      resultados

  };

}
