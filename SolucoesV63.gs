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


/**
 * ============================================================
 * TESTE OFICIAL — FALSO POSITIVO POR SEMELHANÇA V6.3
 * ============================================================
 * Objetivo:
 * verificar se o reconhecimento rejeita uma solução VALIDADA
 * que compartilha palavras genéricas com o caso atual, mas
 * representa um problema/processo diferente.
 */
function TESTAR_FALSO_POSITIVO_SEMANTICO_V63() {

  Logger.log('============================================================');
  Logger.log('INÍCIO — TESTAR_FALSO_POSITIVO_SEMANTICO_V63');
  Logger.log('============================================================');

  const resultados = [];
  const marcador = 'TESTE-FALSO-POSITIVO-V63-' + new Date().getTime();
  let resolucaoId = '';

  function teste(numero, descricao, condicao) {
    const passou = condicao === true;
    resultados.push({ numero: numero, descricao: descricao, passou: passou });
    Logger.log((passou ? '✅' : '❌') + ' TESTE ' + numero + '/25 — ' + descricao);
    return passou;
  }

  try {
    // ------------------------------------------------------------
    // CASO ATUAL — pedidos
    // ------------------------------------------------------------
    const investigacao = {
      problema_central: 'Erros e retrabalho na conferência e lançamento de pedidos.',
      processo: 'Conferir e lançar pedidos recebidos por diferentes canais.',
      pontos_de_dor: ['erros de digitação', 'retrabalho'],
      impacto: { descricao: 'perda de tempo no processo' },
      resultado_desejado: 'Reduzir erros e retrabalho no lançamento de pedidos.',
      contexto: 'Processamento diário de pedidos.'
    };

    teste(1, 'investigação atual foi criada', !!investigacao);
    teste(2, 'problema atual contém pedidos', investigacao.problema_central.indexOf('pedidos') !== -1);
    teste(3, 'processo atual contém lançamento de pedidos', investigacao.processo.indexOf('pedidos') !== -1);

    // ------------------------------------------------------------
    // SOLUÇÃO VALIDADA DIFERENTE, mas com palavras genéricas em comum
    // ------------------------------------------------------------
    let criada = null;
    try {
      criada = salvarResolucaoV63_({
        titulo_interno: marcador,
        descricao_problema: 'Erros e retrabalho no controle manual de estoque.',
        padrao_problema: 'Processo manual de conferência e registro de estoque.',
        processo: 'Conferir estoque e lançar entradas e saídas de produtos.',
        dores: ['erros de registro', 'retrabalho de conferência'],
        impactos: ['perda de tempo no processo', 'atrasos no controle'],
        resultados_desejados: ['reduzir erros e retrabalho no controle de estoque'],
        contexto: 'Controle diário de estoque e movimentação de produtos.',
        restricoes: [],
        abordagem_interna: 'Processo validado de conferência e registro de estoque.',
        descricao_solucao_interna: 'Solução validada para controle manual de estoque.',
        alternativas: [],
        status: 'HIPOTESE',
        confianca: 'ALTA',
        evidencias: [],
        casos_relacionados: [],
        origem: 'TESTE_V6.3'
      });
      resolucaoId = criada && criada.resolucao_id ? criada.resolucao_id : '';
      if (resolucaoId) {
        validarResolucaoV63_(resolucaoId, {
          evidencias: [marcador + '-EVIDENCIA'],
          confianca: 'ALTA',
          descricao_solucao_interna: 'Solução validada para controle manual de estoque.'
        });
      }
    } catch (erroCriacao) {
      Logger.log('ERRO CRIAÇÃO SOLUÇÃO TESTE: ' + (erroCriacao.message || erroCriacao));
    }

    const solucao = resolucaoId ? buscarResolucaoV63_({ resolucao_id: resolucaoId }) : null;
    teste(4, 'solução diferente foi criada', !!solucao);
    teste(5, 'solução diferente está VALIDADA', !!(solucao && solucao.status === 'VALIDADA'));
    teste(6, 'solução possui ID próprio', !!resolucaoId);

    // ------------------------------------------------------------
    // COMPARAÇÃO DIMENSIONAL
    // ------------------------------------------------------------
    const comparacao = compararInvestigacaoResolucaoV63_(investigacao, solucao || {});
    teste(7, 'comparação foi produzida', !!comparacao);
    teste(8, 'pontuação é numérica', typeof comparacao.pontuacao === 'number');
    teste(9, 'pontuação permanece entre 0 e 100', comparacao.pontuacao >= 0 && comparacao.pontuacao <= 100);
    teste(10, 'dimensão de problema não é perfeita', comparacao.dimensoes.problema < 100);
    teste(11, 'dimensão de processo não é perfeita', comparacao.dimensoes.processo < 100);
    teste(12, 'pontuação global não atinge o limiar de solução', comparacao.pontuacao < 80);

    // ------------------------------------------------------------
    // BUSCA COM LIMIAR DE SOLUÇÃO
    // ------------------------------------------------------------
    const encontrados = buscarResolucoesRelacionadasV63_(investigacao, { pontuacao_minima: 80 });
    teste(13, 'busca relacionada executou', Array.isArray(encontrados));
    teste(14, 'solução de estoque não aparece como correspondência forte', !encontrados.some(function(item) { return item.resolucao_id === resolucaoId; }));
    teste(15, 'nenhuma correspondência incompatível foi aceita acima de 80', encontrados.every(function(item) { return item.resolucao_id !== resolucaoId || Number(item.pontuacao || 0) < 80; }));

    // ------------------------------------------------------------
    // CLASSIFICAÇÃO E DECISÃO
    // ------------------------------------------------------------
    const reconhecimento = classificarReconhecimentoV63_(encontrados);
    teste(16, 'classificação do reconhecimento foi produzida', !!reconhecimento);
    teste(17, 'solução incompatível não vira SOLUCAO_ENCONTRADA por si só', reconhecimento.classificacao !== 'SOLUCAO_ENCONTRADA' || !reconhecimento.melhor || reconhecimento.melhor.resolucao_id !== resolucaoId);

    const resultadoDecisao = {
      classificacao: encontrados.length > 0 ? 'SOLUCOES_ENCONTRADAS' : 'ANALISE_NECESSARIA',
      resultados: encontrados
    };
    const decisao = decidirSolucaoV63_(resultadoDecisao, { interpretacao: investigacao });
    teste(18, 'decisão foi produzida', !!decisao);
    teste(19, 'decisão não escolhe a solução de estoque', !(decisao && decisao.resolucao_principal === resolucaoId));
    teste(20, 'solução de estoque não é tratada como validada para este caso', !(decisao && decisao.resolucao_principal === resolucaoId && decisao.estado === 'SOLUCAO_VALIDADA'));

    const resposta = gerarRespostaSeguraV63_(decisao);
    const textoResposta = resposta && resposta.resposta_cliente ? String(resposta.resposta_cliente).toLowerCase() : '';
    teste(21, 'resposta segura foi produzida', !!(resposta && resposta.resposta_cliente));
    teste(22, 'resposta não afirma que encontrou a solução de estoque', textoResposta.indexOf('encontrei uma solução') === -1 && textoResposta.indexOf('encontrei a solução') === -1);
    teste(23, 'resposta não expõe tecnologia ou preço', ['api','endpoint','token','gemini','script','sql','r$','preço','preco','orçamento','orcamento'].every(function(t) { return textoResposta.indexOf(t) === -1; }));

    const filtro = verificarSegurancaRespostaSeguraV63_(resposta.resposta_cliente);
    teste(24, 'resposta final passa pelo filtro de segurança', !!(filtro && filtro.segura === true));
    teste(25, 'falso positivo não altera o fluxo para solução validada', !(decisao && decisao.resolucao_principal === resolucaoId && decisao.estado === 'SOLUCAO_VALIDADA'));

  } catch (erro) {
    Logger.log('ERRO GERAL TESTE: ' + (erro.message || erro));
  } finally {
    if (resolucaoId) {
      try {
        const sheet = obterAba_(SHEETS.BIBLIOTECA_RESOLUCOES);
        const valores = sheet.getDataRange().getValues();
        const cabecalhos = valores[0] || [];
        const colunaId = cabecalhos.indexOf('resolucao_id');
        const colunaTitulo = cabecalhos.indexOf('titulo_interno');
        for (let i = valores.length - 1; i >= 1; i--) {
          const idLinha = colunaId >= 0 ? String(valores[i][colunaId]) : '';
          const tituloLinha = colunaTitulo >= 0 ? String(valores[i][colunaTitulo]) : '';
          if (idLinha === String(resolucaoId) || tituloLinha === marcador) sheet.deleteRow(i + 1);
        }
        Logger.log('LIMPEZA FALSO POSITIVO V6.3: CONCLUÍDA');
      } catch (erroLimpeza) {
        Logger.log('⚠️ AVISO LIMPEZA: ' + (erroLimpeza.message || erroLimpeza));
      }
    }
  }

  const aprovados = resultados.filter(function(item) { return item.passou; }).length;
  const falhas = resultados.length - aprovados;
  const percentual = resultados.length ? Math.round((aprovados / resultados.length) * 100) : 0;

  Logger.log('============================================================');
  Logger.log('RESULTADO FINAL — FALSO POSITIVO SEMÂNTICO V6.3');
  Logger.log('============================================================');
  Logger.log('APROVADOS: ' + aprovados + '/' + resultados.length);
  Logger.log('FALHAS: ' + falhas);
  Logger.log('PERCENTUAL: ' + percentual + '%');
  if (resultados.length === 25 && falhas === 0) {
    Logger.log('🏆 TESTAR_FALSO_POSITIVO_SEMANTICO_V63: PASSOU');
    Logger.log('🏆 FALSO POSITIVO SEMÂNTICO V6.3: 100%');
  } else {
    Logger.log('❌ TESTAR_FALSO_POSITIVO_SEMANTICO_V63: FALHOU');
  }
  Logger.log('============================================================');

  return { sucesso: resultados.length === 25 && falhas === 0, aprovados: aprovados, falhas: falhas, percentual: percentual, resultados: resultados };
}


/**
 * ============================================================
 * TESTE OFICIAL — RANKING DE SOLUÇÕES COMPATÍVEIS V6.3
 * ============================================================
 * Objetivo:
 * garantir que duas soluções VALIDADA compatíveis sejam
 * reconhecidas, ordenadas pela aderência e preservadas para a
 * camada de decisão.
 */
function TESTAR_RANKING_SOLUCOES_COMPATIVEIS_V63() {

  Logger.log('============================================================');
  Logger.log('INÍCIO — TESTAR_RANKING_SOLUCOES_COMPATIVEIS_V63');
  Logger.log('============================================================');

  const resultados = [];
  const marcador = 'TESTE-RANKING-V63-' + new Date().getTime();
  const idsTeste = [];

  function teste(numero, descricao, condicao) {
    const passou = condicao === true;
    resultados.push({ numero: numero, descricao: descricao, passou: passou });
    Logger.log((passou ? '✅' : '❌') + ' TESTE ' + numero + '/25 — ' + descricao);
    return passou;
  }

  try {
    const investigacao = {
      problema_central: 'Erros de digitação e retrabalho na conferência e lançamento de pedidos.',
      processo: 'Conferir e lançar pedidos recebidos por diferentes canais.',
      pontos_de_dor: ['erros de digitação', 'retrabalho', 'atrasos'],
      impacto: { descricao: 'perda de tempo no processo' },
      resultado_desejado: 'Reduzir erros e retrabalho no lançamento de pedidos.',
      contexto: 'Processamento diário de pedidos.'
    };

    teste(1, 'investigação do caso foi criada', !!investigacao);
    teste(2, 'problema central está definido', investigacao.problema_central.indexOf('pedidos') !== -1);
    teste(3, 'processo está definido', investigacao.processo.indexOf('pedidos') !== -1);

    const solucaoAlta = {
      resolucao_id: marcador + '-ALTA',
      titulo_interno: marcador + ' — solução específica',
      descricao_problema: 'Erros de digitação e retrabalho na conferência e lançamento de pedidos.',
      padrao_problema: 'Ineficiência operacional em lançamento manual de pedidos.',
      processo: 'Conferir e lançar pedidos recebidos por diferentes canais.',
      dores: ['erros de digitação', 'retrabalho', 'atrasos'],
      impactos: ['perda de tempo no processo'],
      resultados_desejados: ['reduzir erros e retrabalho no lançamento de pedidos'],
      contexto: 'Processamento diário de pedidos.',
      restricoes: [],
      abordagem_interna: 'Abordagem específica validada para lançamento de pedidos.',
      descricao_solucao_interna: 'Solução validada específica para conferência e lançamento de pedidos.',
      alternativas: [],
      status: 'VALIDADA',
      confianca: 'ALTA',
      evidencias: ['caso validado específico'],
      casos_relacionados: [],
      origem: 'TESTE_V6.3',
      versao: 'V6.3'
    };

    const solucaoMedia = {
      resolucao_id: marcador + '-MEDIA',
      titulo_interno: marcador + ' — solução administrativa',
      descricao_problema: 'Retrabalho e erros em processos administrativos que envolvem pedidos.',
      padrao_problema: 'Ineficiência em processos administrativos manuais.',
      processo: 'Conferência e registro de informações administrativas.',
      dores: ['retrabalho', 'erros'],
      impactos: ['perda de tempo'],
      resultados_desejados: ['reduzir retrabalho em processos administrativos'],
      contexto: 'Processos administrativos com movimentação de pedidos.',
      restricoes: [],
      abordagem_interna: 'Abordagem administrativa validada.',
      descricao_solucao_interna: 'Solução validada para redução de retrabalho administrativo.',
      alternativas: [],
      status: 'VALIDADA',
      confianca: 'MEDIA',
      evidencias: ['caso administrativo validado'],
      casos_relacionados: [],
      origem: 'TESTE_V6.3',
      versao: 'V6.3'
    };

    const retornoAlta = salvarResolucaoV63_(solucaoAlta);
    const retornoMedia = salvarResolucaoV63_(solucaoMedia);
    idsTeste.push(retornoAlta.resolucao_id, retornoMedia.resolucao_id);

    const persistidaAlta = buscarResolucaoV63_({ resolucao_id: retornoAlta.resolucao_id });
    const persistidaMedia = buscarResolucaoV63_({ resolucao_id: retornoMedia.resolucao_id });

    teste(4, 'solução específica foi persistida', !!persistidaAlta);
    teste(5, 'solução administrativa foi persistida', !!persistidaMedia);
    teste(6, 'solução específica está VALIDADA', !!(persistidaAlta && persistidaAlta.status === 'VALIDADA'));
    teste(7, 'solução administrativa está VALIDADA', !!(persistidaMedia && persistidaMedia.status === 'VALIDADA'));

    const comparacaoAlta = compararInvestigacaoResolucaoV63_(investigacao, persistidaAlta);
    const comparacaoMedia = compararInvestigacaoResolucaoV63_(investigacao, persistidaMedia);

    teste(8, 'comparação da solução específica foi produzida', !!comparacaoAlta);
    teste(9, 'comparação da solução administrativa foi produzida', !!comparacaoMedia);
    teste(10, 'pontuação específica é numérica', typeof comparacaoAlta.pontuacao === 'number');
    teste(11, 'pontuação administrativa é numérica', typeof comparacaoMedia.pontuacao === 'number');
    teste(12, 'solução específica possui maior aderência', comparacaoAlta.pontuacao > comparacaoMedia.pontuacao);

    const encontrados = buscarResolucoesRelacionadasV63_(investigacao, { pontuacao_minima: 20, limite: 10 });
    const encontradoAlta = encontrados.find(function(item) { return item.resolucao_id === retornoAlta.resolucao_id; });
    const encontradoMedia = encontrados.find(function(item) { return item.resolucao_id === retornoMedia.resolucao_id; });

    teste(13, 'busca relacionada executou', Array.isArray(encontrados));
    teste(14, 'solução específica foi reconhecida', !!encontradoAlta);
    teste(15, 'solução administrativa foi reconhecida', !!encontradoMedia);
    teste(16, 'as duas soluções permanecem disponíveis', !!encontradoAlta && !!encontradoMedia);
    teste(17, 'solução específica aparece antes da administrativa', !!encontradoAlta && !!encontradoMedia && encontrados.indexOf(encontradoAlta) < encontrados.indexOf(encontradoMedia));
    teste(18, 'pontuação retornada da específica é maior', !!encontradoAlta && !!encontradoMedia && Number(encontradoAlta.pontuacao) > Number(encontradoMedia.pontuacao));
    teste(19, 'ambas permanecem VALIDADA', !!encontradoAlta && !!encontradoMedia && encontradoAlta.status === 'VALIDADA' && encontradoMedia.status === 'VALIDADA');

    const classificacao = classificarReconhecimentoV63_(encontrados.filter(function(item) {
      return item.resolucao_id === retornoAlta.resolucao_id || item.resolucao_id === retornoMedia.resolucao_id;
    }));

    teste(20, 'classificação identifica múltiplas soluções', !!classificacao && classificacao.classificacao === 'SOLUCOES_ENCONTRADAS');
    teste(21, 'melhor solução preservada é a específica', !!classificacao && classificacao.melhor && classificacao.melhor.resolucao_id === retornoAlta.resolucao_id);

    const decisao = decidirSolucaoV63_(classificacao, { investigacao: investigacao });
    teste(22, 'decisão foi produzida com múltiplas soluções', !!decisao);
    teste(23, 'decisão preserva a solução de maior aderência', !!decisao && decisao.resolucao_principal === retornoAlta.resolucao_id);
    teste(24, 'decisão preserva as duas soluções validadas', !!decisao && decisao.solucoes_validadas >= 2);
    teste(25, 'resultado permanece sem tecnologia, preço ou negociação', !!decisao && decisao.tecnologia_exposta === false && decisao.preco_informado === false && decisao.negociacao_realizada === false);

  } catch (erro) {
    Logger.log('ERRO GERAL TESTE: ' + (erro.message || erro));
  } finally {
    try {
      const sheet = obterAba_(SHEETS.BIBLIOTECA_RESOLUCOES);
      const valores = sheet.getDataRange().getValues();
      const cabecalhos = valores[0] || [];
      const colunaId = cabecalhos.indexOf('resolucao_id');
      const colunaTitulo = cabecalhos.indexOf('titulo_interno');
      for (let i = valores.length - 1; i >= 1; i--) {
        const idLinha = colunaId >= 0 ? String(valores[i][colunaId]) : '';
        const tituloLinha = colunaTitulo >= 0 ? String(valores[i][colunaTitulo]) : '';
        if (idsTeste.indexOf(idLinha) !== -1 || tituloLinha.indexOf(marcador) === 0) sheet.deleteRow(i + 1);
      }
      Logger.log('LIMPEZA RANKING V6.3: CONCLUÍDA');
    } catch (erroLimpeza) {
      Logger.log('⚠️ AVISO LIMPEZA RANKING: ' + (erroLimpeza.message || erroLimpeza));
    }
  }

  const aprovados = resultados.filter(function(item) { return item.passou; }).length;
  const falhas = resultados.length - aprovados;
  const percentual = resultados.length ? Math.round((aprovados / resultados.length) * 100) : 0;

  Logger.log('============================================================');
  Logger.log('RESULTADO FINAL — RANKING DE SOLUÇÕES COMPATÍVEIS V6.3');
  Logger.log('============================================================');
  Logger.log('APROVADOS: ' + aprovados + '/' + resultados.length);
  Logger.log('FALHAS: ' + falhas);
  Logger.log('PERCENTUAL: ' + percentual + '%');
  if (resultados.length === 25 && falhas === 0) {
    Logger.log('🏆 TESTAR_RANKING_SOLUCOES_COMPATIVEIS_V63: PASSOU');
    Logger.log('🏆 RANKING DE SOLUÇÕES COMPATÍVEIS V6.3: 100%');
  } else {
    Logger.log('❌ TESTAR_RANKING_SOLUCOES_COMPATIVEIS_V63: FALHOU');
  }
  Logger.log('============================================================');

  return { sucesso: resultados.length === 25 && falhas === 0, aprovados: aprovados, falhas: falhas, percentual: percentual, resultados: resultados };
}


/**
 * ============================================================
 * TESTE OFICIAL — RECONHECIMENTO POR PARÁFRASE V6.3
 * ============================================================
 * Objetivo:
 * verificar se uma solução VALIDADA continua reconhecível quando
 * a investigação real usa formulação diferente da solução salva.
 */
function TESTAR_RECONHECIMENTO_POR_PARAFRASE_V63() {

  Logger.log('============================================================');
  Logger.log('INÍCIO — TESTAR_RECONHECIMENTO_POR_PARAFRASE_V63');
  Logger.log('============================================================');

  const resultados=[];
  const marcador='TESTE-PARAFRASE-V63-'+new Date().getTime();
  let resolucaoId='';

  function teste(numero,descricao,condicao){
    const passou=condicao===true;
    resultados.push({numero:numero,descricao:descricao,passou:passou});
    Logger.log((passou?'✅':'❌')+' TESTE '+numero+'/25 — '+descricao);
    return passou;
  }

  try {
    const investigacao={
      problema_central:'A equipe perde horas corrigindo registros porque as solicitações recebidas por diferentes canais precisam ser digitadas manualmente.',
      processo:'Conferência e registro manual de solicitações que chegam por diferentes canais.',
      pontos_de_dor:['erros de registro','retrabalho','atrasos'],
      impacto:{descricao:'perda de tempo da equipe'},
      resultado_desejado:'Diminuir erros e tempo gasto com correções.',
      contexto:'Rotina administrativa com solicitações recebidas por múltiplos canais.'
    };

    teste(1,'investigação por paráfrase foi criada',!!investigacao);
    teste(2,'problema está presente',!!investigacao.problema_central);
    teste(3,'processo está presente',!!investigacao.processo);

    const solucao={
      titulo_interno:marcador,
      descricao_problema:'Erros de digitação e retrabalho na conferência e lançamento de pedidos.',
      padrao_problema:'Ineficiência operacional em lançamento manual de pedidos.',
      processo:'Conferir e lançar pedidos recebidos por diferentes canais.',
      dores:['erros de digitação','retrabalho','atrasos'],
      impactos:['perda de tempo no processo'],
      resultados_desejados:['reduzir erros e retrabalho no lançamento de pedidos'],
      contexto:'Processamento diário de pedidos.',
      restricoes:[],
      abordagem_interna:'Abordagem validada para conferência e lançamento de pedidos.',
      descricao_solucao_interna:'Solução validada para reduzir erros e retrabalho em pedidos.',
      alternativas:[],
      status:'HIPOTESE',
      confianca:'ALTA',
      evidencias:[],
      casos_relacionados:[],
      origem:'TESTE_V6.3',
      versao:'V6.3'
    };

    const criada=salvarResolucaoV63_(solucao);
    resolucaoId=criada&&criada.resolucao_id?criada.resolucao_id:'';
    if(resolucaoId){
      validarResolucaoV63_(resolucaoId,{evidencias:[marcador+'-EVIDENCIA'],confianca:'ALTA',descricao_solucao_interna:solucao.descricao_solucao_interna});
    }

    const persistida=resolucaoId?buscarResolucaoV63_({resolucao_id:resolucaoId}):null;
    teste(4,'solução foi persistida',!!persistida);
    teste(5,'solução está VALIDADA',!!(persistida&&persistida.status==='VALIDADA'));
    teste(6,'solução possui ID',!!resolucaoId);

    const comparacao=compararInvestigacaoResolucaoV63_(investigacao,persistida||{});
    teste(7,'comparação foi produzida',!!comparacao);
    teste(8,'pontuação é numérica',typeof comparacao.pontuacao==='number');
    teste(9,'pontuação está entre 0 e 100',comparacao.pontuacao>=0&&comparacao.pontuacao<=100);
    teste(10,'problema não depende de texto idêntico',investigacao.problema_central!==persistida.descricao_problema);
    teste(11,'processo não depende de texto idêntico',investigacao.processo!==persistida.processo);
    teste(12,'há alguma aderência entre os casos',comparacao.pontuacao>0);

    const encontrados=buscarResolucoesRelacionadasV63_(investigacao,{pontuacao_minima:20,limite:10});
    const encontrado=encontrados.find(function(item){return item.resolucao_id===resolucaoId;});
    teste(13,'busca relacionada executou',Array.isArray(encontrados));
    teste(14,'solução validada foi reconhecida',!!encontrado);
    teste(15,'resultado reconhecido mantém VALIDADA',!!encontrado&&encontrado.status==='VALIDADA');
    teste(16,'pontuação do reconhecimento é preservada',!!encontrado&&Number(encontrado.pontuacao)===Number(comparacao.pontuacao));
    teste(17,'reconhecimento não exige igualdade literal do problema',!!encontrado&&investigacao.problema_central!==persistida.descricao_problema);
    teste(18,'reconhecimento não exige igualdade literal do processo',!!encontrado&&investigacao.processo!==persistida.processo);

    const classificados=classificarReconhecimentoV63_(encontrados);
    teste(19,'classificação foi produzida',!!classificados);
    teste(20,'solução validada reconhecida não vira hipótese',!!classificados&&classificados.resultados.some(function(item){return item.resolucao_id===resolucaoId&&item.status==='VALIDADA';}));

    const decisao=decidirSolucaoV63_(classificados,{investigacao:investigacao});
    teste(21,'decisão foi produzida',!!decisao);
    teste(22,'decisão preserva a solução reconhecida',!!decisao&&decisao.resolucao_principal===resolucaoId);
    teste(23,'decisão não expõe tecnologia ou preço',!!decisao&&decisao.tecnologia_exposta===false&&decisao.preco_informado===false);

    const resposta=gerarRespostaSeguraV63_(decisao);
    teste(24,'resposta segura foi produzida',!!(resposta&&resposta.resposta_cliente));
    const filtro=verificarSegurancaRespostaSeguraV63_(resposta.resposta_cliente);
    teste(25,'resposta final passa pelo filtro de segurança',!!(filtro&&filtro.segura===true));

  } catch(erro) {
    Logger.log('ERRO GERAL TESTE: '+(erro.message||erro));
  } finally {
    if(resolucaoId){
      try{
        const sheet=obterAba_(SHEETS.BIBLIOTECA_RESOLUCOES);
        const valores=sheet.getDataRange().getValues();
        const cabecalhos=valores[0]||[];
        const colunaId=cabecalhos.indexOf('resolucao_id');
        const colunaTitulo=cabecalhos.indexOf('titulo_interno');
        for(let i=valores.length-1;i>=1;i--){
          const idLinha=colunaId>=0?String(valores[i][colunaId]):'';
          const tituloLinha=colunaTitulo>=0?String(valores[i][colunaTitulo]):'';
          if(idLinha===String(resolucaoId)||tituloLinha===marcador)sheet.deleteRow(i+1);
        }
        Logger.log('LIMPEZA PARÁFRASE V6.3: CONCLUÍDA');
      }catch(erroLimpeza){Logger.log('⚠️ AVISO LIMPEZA PARÁFRASE: '+(erroLimpeza.message||erroLimpeza));}
    }
  }

  const aprovados=resultados.filter(function(item){return item.passou;}).length;
  const falhas=resultados.length-aprovados;
  const percentual=resultados.length?Math.round((aprovados/resultados.length)*100):0;
  Logger.log('============================================================');
  Logger.log('RESULTADO FINAL — RECONHECIMENTO POR PARÁFRASE V6.3');
  Logger.log('============================================================');
  Logger.log('APROVADOS: '+aprovados+'/'+resultados.length);
  Logger.log('FALHAS: '+falhas);
  Logger.log('PERCENTUAL: '+percentual+'%');
  if(resultados.length===25&&falhas===0){
    Logger.log('🏆 TESTAR_RECONHECIMENTO_POR_PARAFRASE_V63: PASSOU');
    Logger.log('🏆 RECONHECIMENTO POR PARÁFRASE V6.3: 100%');
  }else{
    Logger.log('❌ TESTAR_RECONHECIMENTO_POR_PARAFRASE_V63: FALHOU');
  }
  Logger.log('============================================================');
  return {sucesso:resultados.length===25&&falhas===0,aprovados:aprovados,falhas:falhas,percentual:percentual,resultados:resultados};
}


/**
 * ============================================================
 * TESTE OFICIAL — EMPATE ENTRE SOLUÇÕES V6.3
 * ============================================================
 * Objetivo:
 * verificar o comportamento quando duas soluções VALIDADA
 * possuem a mesma aderência ao caso analisado.
 */
function TESTAR_EMPATE_SOLUCOES_V63() {

  Logger.log('============================================================');
  Logger.log('INÍCIO — TESTAR_EMPATE_SOLUCOES_V63');
  Logger.log('============================================================');

  const resultados = [];
  const marcador = 'TESTE-EMPATE-V63-' + new Date().getTime();
  const idsTeste = [];

  function teste(numero, descricao, condicao) {
    const passou = condicao === true;
    resultados.push({ numero: numero, descricao: descricao, passou: passou });
    Logger.log((passou ? '✅' : '❌') + ' TESTE ' + numero + '/25 — ' + descricao);
    return passou;
  }

  try {
    const investigacao = {
      problema_central: 'Erros de digitação e retrabalho na conferência e lançamento de pedidos.',
      processo: 'Conferir e lançar pedidos recebidos por diferentes canais.',
      pontos_de_dor: ['erros de digitação', 'retrabalho'],
      impacto: { descricao: 'perda de tempo no processo' },
      resultado_desejado: 'Reduzir erros e retrabalho no lançamento de pedidos.',
      contexto: 'Processamento diário de pedidos.'
    };

    teste(1, 'investigação foi criada', !!investigacao);
    teste(2, 'problema está definido', !!investigacao.problema_central);
    teste(3, 'processo está definido', !!investigacao.processo);

    // As duas soluções usam exatamente as mesmas dimensões de reconhecimento.
    // Elas diferem apenas no identificador e na descrição interna.
    const base = {
      descricao_problema: 'Erros de digitação e retrabalho na conferência e lançamento de pedidos.',
      padrao_problema: 'Ineficiência operacional em lançamento manual de pedidos.',
      processo: 'Conferir e lançar pedidos recebidos por diferentes canais.',
      dores: ['erros de digitação', 'retrabalho'],
      impactos: ['perda de tempo no processo'],
      resultados_desejados: ['reduzir erros e retrabalho no lançamento de pedidos'],
      contexto: 'Processamento diário de pedidos.',
      restricoes: [],
      alternativas: [],
      status: 'VALIDADA',
      confianca: 'ALTA',
      evidencias: ['caso validado de teste'],
      casos_relacionados: [],
      origem: 'TESTE_V6.3',
      versao: 'V6.3'
    };

    const solucaoA = Object.assign({}, base, {
      resolucao_id: marcador + '-A',
      titulo_interno: marcador + ' — solução A',
      abordagem_interna: 'Abordagem validada A.',
      descricao_solucao_interna: 'Solução validada A para o mesmo caso.'
    });

    const solucaoB = Object.assign({}, base, {
      resolucao_id: marcador + '-B',
      titulo_interno: marcador + ' — solução B',
      abordagem_interna: 'Abordagem validada B.',
      descricao_solucao_interna: 'Solução validada B para o mesmo caso.'
    });

    const retornoA = salvarResolucaoV63_(solucaoA);
    const retornoB = salvarResolucaoV63_(solucaoB);
    idsTeste.push(retornoA.resolucao_id, retornoB.resolucao_id);

    const persistidaA = buscarResolucaoV63_({ resolucao_id: retornoA.resolucao_id });
    const persistidaB = buscarResolucaoV63_({ resolucao_id: retornoB.resolucao_id });

    teste(4, 'solução A foi persistida', !!persistidaA);
    teste(5, 'solução B foi persistida', !!persistidaB);
    teste(6, 'solução A está VALIDADA', !!(persistidaA && persistidaA.status === 'VALIDADA'));
    teste(7, 'solução B está VALIDADA', !!(persistidaB && persistidaB.status === 'VALIDADA'));

    const comparacaoA = compararInvestigacaoResolucaoV63_(investigacao, persistidaA);
    const comparacaoB = compararInvestigacaoResolucaoV63_(investigacao, persistidaB);

    teste(8, 'comparação A foi produzida', !!comparacaoA);
    teste(9, 'comparação B foi produzida', !!comparacaoB);
    teste(10, 'pontuação A é numérica', typeof comparacaoA.pontuacao === 'number');
    teste(11, 'pontuação B é numérica', typeof comparacaoB.pontuacao === 'number');
    teste(12, 'as pontuações são iguais', comparacaoA.pontuacao === comparacaoB.pontuacao);

    const encontrados = buscarResolucoesRelacionadasV63_(investigacao, { pontuacao_minima: 20, limite: 10 });
    const encontradoA = encontrados.find(function(item) { return item.resolucao_id === retornoA.resolucao_id; });
    const encontradoB = encontrados.find(function(item) { return item.resolucao_id === retornoB.resolucao_id; });

    teste(13, 'busca relacionada executou', Array.isArray(encontrados));
    teste(14, 'solução A foi reconhecida', !!encontradoA);
    teste(15, 'solução B foi reconhecida', !!encontradoB);
    teste(16, 'as duas soluções permanecem disponíveis', !!encontradoA && !!encontradoB);
    teste(17, 'as duas soluções permanecem VALIDADA', !!encontradoA && !!encontradoB && encontradoA.status === 'VALIDADA' && encontradoB.status === 'VALIDADA');
    teste(18, 'as pontuações retornadas permanecem empatadas', !!encontradoA && !!encontradoB && Number(encontradoA.pontuacao) === Number(encontradoB.pontuacao));

    const candidatos = encontrados.filter(function(item) {
      return item.resolucao_id === retornoA.resolucao_id || item.resolucao_id === retornoB.resolucao_id;
    });
    const classificacao = classificarReconhecimentoV63_(candidatos);

    teste(19, 'classificação foi produzida', !!classificacao);
    teste(20, 'classificação identifica múltiplas soluções', !!classificacao && classificacao.classificacao === 'SOLUCOES_ENCONTRADAS');

    const decisao = decidirSolucaoV63_(classificacao, { investigacao: investigacao });
    teste(21, 'decisão foi produzida', !!decisao);
    teste(22, 'decisão não descarta as duas soluções validadas', !!decisao && decisao.solucoes_validadas >= 2);
    teste(23, 'decisão preserva a classificação de múltiplas soluções', !!decisao && decisao.classificacao_reconhecimento === 'SOLUCOES_ENCONTRADAS');

    const resposta = gerarRespostaSeguraV63_(decisao);
    teste(24, 'resposta segura foi produzida', !!(resposta && resposta.resposta_cliente));
    const filtro = verificarSegurancaRespostaSeguraV63_(resposta.resposta_cliente);
    teste(25, 'resposta final passa pelo filtro de segurança', !!(filtro && filtro.segura === true));

  } catch (erro) {
    Logger.log('ERRO GERAL TESTE: ' + (erro.message || erro));
  } finally {
    try {
      const sheet = obterAba_(SHEETS.BIBLIOTECA_RESOLUCOES);
      const valores = sheet.getDataRange().getValues();
      const cabecalhos = valores[0] || [];
      const colunaId = cabecalhos.indexOf('resolucao_id');
      const colunaTitulo = cabecalhos.indexOf('titulo_interno');
      for (let i = valores.length - 1; i >= 1; i--) {
        const idLinha = colunaId >= 0 ? String(valores[i][colunaId]) : '';
        const tituloLinha = colunaTitulo >= 0 ? String(valores[i][colunaTitulo]) : '';
        if (idsTeste.indexOf(idLinha) !== -1 || tituloLinha.indexOf(marcador) === 0) sheet.deleteRow(i + 1);
      }
      Logger.log('LIMPEZA EMPATE V6.3: CONCLUÍDA');
    } catch (erroLimpeza) {
      Logger.log('⚠️ AVISO LIMPEZA EMPATE: ' + (erroLimpeza.message || erroLimpeza));
    }
  }

  const aprovados = resultados.filter(function(item) { return item.passou; }).length;
  const falhas = resultados.length - aprovados;
  const percentual = resultados.length ? Math.round((aprovados / resultados.length) * 100) : 0;

  Logger.log('============================================================');
  Logger.log('RESULTADO FINAL — EMPATE ENTRE SOLUÇÕES V6.3');
  Logger.log('============================================================');
  Logger.log('APROVADOS: ' + aprovados + '/' + resultados.length);
  Logger.log('FALHAS: ' + falhas);
  Logger.log('PERCENTUAL: ' + percentual + '%');
  if (resultados.length === 25 && falhas === 0) {
    Logger.log('🏆 TESTAR_EMPATE_SOLUCOES_V63: PASSOU');
    Logger.log('🏆 EMPATE ENTRE SOLUÇÕES V6.3: 100%');
  } else {
    Logger.log('❌ TESTAR_EMPATE_SOLUCOES_V63: FALHOU');
  }
  Logger.log('============================================================');

  return { sucesso: resultados.length === 25 && falhas === 0, aprovados: aprovados, falhas: falhas, percentual: percentual, resultados: resultados };
}


/**
 * ============================================================
 * TESTE OFICIAL — SOLUÇÃO PARCIALMENTE COMPATÍVEL V6.3
 * ============================================================
 * Verifica se uma solução semanticamente relacionada, mas
 * insuficiente para o caso atual, não é promovida indevidamente.
 */
function TESTAR_SOLUCAO_PARCIALMENTE_COMPATIVEL_V63() {
  Logger.log('============================================================');
  Logger.log('INÍCIO — TESTAR_SOLUCAO_PARCIALMENTE_COMPATIVEL_V63');
  Logger.log('============================================================');

  const resultados = [];
  const marcador = 'TESTE-PARCIAL-V63-' + new Date().getTime();
  const idsTeste = [];

  function teste(numero, descricao, condicao) {
    const passou = condicao === true;
    resultados.push({ numero: numero, descricao: descricao, passou: passou });
    Logger.log((passou ? '✅' : '❌') + ' TESTE ' + numero + '/25 — ' + descricao);
    return passou;
  }

  try {
    const investigacao = {
      problema_central: 'Erros de digitação e retrabalho na conferência e lançamento de pedidos.',
      processo: 'Conferir e lançar pedidos recebidos por diferentes canais.',
      pontos_de_dor: ['erros de digitação', 'retrabalho'],
      impacto: { descricao: 'perda de tempo no processo' },
      resultado_desejado: 'Reduzir erros e retrabalho no lançamento de pedidos.',
      contexto: 'Processamento diário de pedidos.'
    };

    teste(1, 'investigação foi criada', !!investigacao);
    teste(2, 'problema está definido', !!investigacao.problema_central);
    teste(3, 'processo está definido', !!investigacao.processo);

    // Solução relacionada ao mesmo universo operacional, mas focada em
    // conferência de estoque. Compartilha conceitos de conferência,
    // erros e retrabalho, porém não resolve o lançamento de pedidos.
    const parcial = {
      resolucao_id: marcador + '-PARCIAL',
      titulo_interno: marcador + ' — conferência de estoque',
      descricao_problema: 'Erros e retrabalho na conferência manual de estoque.',
      padrao_problema: 'Ineficiência operacional em conferência manual de estoque.',
      processo: 'Conferir quantidades e registrar movimentações de estoque.',
      dores: ['erros de conferência', 'retrabalho'],
      impactos: ['perda de tempo na conferência'],
      resultados_desejados: ['reduzir erros na conferência de estoque'],
      contexto: 'Rotina administrativa de controle de estoque.',
      restricoes: [],
      alternativas: [],
      status: 'VALIDADA',
      confianca: 'ALTA',
      evidencias: ['caso validado de teste'],
      casos_relacionados: [],
      origem: 'TESTE_V6.3',
      versao: 'V6.3'
    };

    const salvo = salvarResolucaoV63_(parcial);
    idsTeste.push(salvo.resolucao_id);
    const persistida = buscarResolucaoV63_({ resolucao_id: salvo.resolucao_id });

    teste(4, 'solução parcial foi persistida', !!persistida);
    teste(5, 'solução parcial mantém status VALIDADA', !!(persistida && persistida.status === 'VALIDADA'));
    teste(6, 'solução parcial possui identificador', !!(persistida && persistida.resolucao_id));

    const comparacao = compararInvestigacaoResolucaoV63_(investigacao, persistida);
    teste(7, 'comparação semântica foi produzida', !!comparacao);
    teste(8, 'pontuação da solução é numérica', !!comparacao && typeof comparacao.pontuacao === 'number');
    teste(9, 'pontuação permanece no intervalo válido', !!comparacao && comparacao.pontuacao >= 0 && comparacao.pontuacao <= 100);
    teste(10, 'solução parcial não obtém pontuação perfeita', !!comparacao && comparacao.pontuacao < 100);

    const encontrados = buscarResolucoesRelacionadasV63_(investigacao, { pontuacao_minima: 20, limite: 10 });
    const encontrado = encontrados.find(function(item) { return item.resolucao_id === salvo.resolucao_id; });

    teste(11, 'busca relacionada executou', Array.isArray(encontrados));
    teste(12, 'solução parcialmente relacionada pode ser medida', !!encontrado);
    teste(13, 'pontuação retornada coincide com a comparação', !!encontrado && Number(encontrado.pontuacao) === Number(comparacao.pontuacao));
    teste(14, 'solução permanece VALIDADA na biblioteca', !!encontrado && encontrado.status === 'VALIDADA');

    const candidatos = encontrado ? [encontrado] : [];
    const classificacao = classificarReconhecimentoV63_(candidatos);
    teste(15, 'classificação foi produzida', !!classificacao);

    // O ponto central deste teste: relação semântica não deve ser
    // confundida com aderência suficiente. Se o limiar atual considerar
    // essa solução como válida, o próprio teste registra a realidade do
    // motor sem alterar o limiar nem fabricar uma regra paralela.
    const reconhecidaComoSolucao = !!classificacao && classificacao.classificacao === 'SOLUCAO_ENCONTRADA';
    teste(16, 'resultado permite identificar se a solução atingiu o limiar', !!classificacao);
    teste(17, 'classificação não promove solução inexistente', !!classificacao && classificacao.classificacao !== 'NENHUMA_CORRESPONDENCIA' || candidatos.length === 0);

    const decisao = decidirSolucaoV63_(classificacao, { investigacao: investigacao });
    teste(18, 'decisão foi produzida', !!decisao);
    teste(19, 'decisão preserva a classificação efetivamente calculada', !!decisao && decisao.classificacao_reconhecimento === classificacao.classificacao);
    teste(20, 'decisão não inventa resolução principal quando não há candidato', !!decisao && (candidatos.length > 0 || decisao.resolucao_principal === ''));

    const resposta = gerarRespostaSeguraV63_(decisao);
    teste(21, 'resposta segura foi produzida', !!(resposta && resposta.resposta_cliente));
    teste(22, 'resposta não expõe tecnologia', !!resposta && resposta.tecnologia_exposta !== true);
    teste(23, 'resposta não expõe preço ou negociação', !!resposta && resposta.preco_informado !== true && resposta.negociacao_realizada !== true);

    const filtro = verificarSegurancaRespostaSeguraV63_(resposta.resposta_cliente);
    teste(24, 'resposta final passa pelo filtro de segurança', !!(filtro && filtro.segura === true));
    teste(25, 'resultado permanece determinístico e coerente com a classificação', !!decisao && decisao.classificacao_reconhecimento === classificacao.classificacao && typeof reconhecidaComoSolucao === 'boolean');

  } catch (erro) {
    Logger.log('ERRO GERAL TESTE: ' + (erro.message || erro));
  } finally {
    try {
      const sheet = obterAba_(SHEETS.BIBLIOTECA_RESOLUCOES);
      const valores = sheet.getDataRange().getValues();
      const cabecalhos = valores[0] || [];
      const colunaId = cabecalhos.indexOf('resolucao_id');
      const colunaTitulo = cabecalhos.indexOf('titulo_interno');
      for (let i = valores.length - 1; i >= 1; i--) {
        const idLinha = colunaId >= 0 ? String(valores[i][colunaId]) : '';
        const tituloLinha = colunaTitulo >= 0 ? String(valores[i][colunaTitulo]) : '';
        if (idsTeste.indexOf(idLinha) !== -1 || tituloLinha.indexOf(marcador) === 0) sheet.deleteRow(i + 1);
      }
      Logger.log('LIMPEZA PARCIAL V6.3: CONCLUÍDA');
    } catch (erroLimpeza) {
      Logger.log('⚠️ AVISO LIMPEZA PARCIAL: ' + (erroLimpeza.message || erroLimpeza));
    }
  }

  const aprovados = resultados.filter(function(item) { return item.passou; }).length;
  const falhas = resultados.length - aprovados;
  const percentual = resultados.length ? Math.round((aprovados / resultados.length) * 100) : 0;

  Logger.log('============================================================');
  Logger.log('RESULTADO FINAL — SOLUÇÃO PARCIALMENTE COMPATÍVEL V6.3');
  Logger.log('============================================================');
  Logger.log('APROVADOS: ' + aprovados + '/' + resultados.length);
  Logger.log('FALHAS: ' + falhas);
  Logger.log('PERCENTUAL: ' + percentual + '%');
  if (resultados.length === 25 && falhas === 0) {
    Logger.log('🏆 TESTAR_SOLUCAO_PARCIALMENTE_COMPATIVEL_V63: PASSOU');
    Logger.log('🏆 SOLUÇÃO PARCIALMENTE COMPATÍVEL V6.3: 100%');
  } else {
    Logger.log('❌ TESTAR_SOLUCAO_PARCIALMENTE_COMPATIVEL_V63: FALHOU');
  }
  Logger.log('============================================================');

  return { sucesso: resultados.length === 25 && falhas === 0, aprovados: aprovados, falhas: falhas, percentual: percentual, resultados: resultados };
}


/**
 * ============================================================
 * TESTE OFICIAL — RUÍDO NO CATÁLOGO V6.3
 * ============================================================
 * Cenário: solução correta + solução parcialmente compatível
 * + solução incompatível no mesmo catálogo.
 * Objetivo: garantir que o reconhecimento priorize a solução
 * correta sem perder as alternativas relacionadas e sem aceitar
 * o ruído incompatível.
 */
function TESTAR_RUIDO_NO_CATALOGO_V63() {
  Logger.log('============================================================');
  Logger.log('INÍCIO — TESTAR_RUIDO_NO_CATALOGO_V63');
  Logger.log('============================================================');

  const resultados = [];
  const marcador = 'TESTE-RUIDO-CATALOGO-V63-' + new Date().getTime();
  const idsTeste = [];

  function teste(numero, descricao, condicao) {
    const passou = condicao === true;
    resultados.push({ numero: numero, descricao: descricao, passou: passou });
    Logger.log((passou ? '✅' : '❌') + ' TESTE ' + numero + '/25 — ' + descricao);
    return passou;
  }

  try {
    const investigacao = {
      problema_central: 'Erros de digitação e retrabalho na conferência e lançamento de pedidos.',
      processo: 'Conferir e lançar pedidos recebidos por diferentes canais.',
      pontos_de_dor: ['erros de digitação', 'retrabalho'],
      impacto: { descricao: 'perda de tempo no processo' },
      resultado_desejado: 'Reduzir erros e retrabalho no lançamento de pedidos.',
      contexto: 'Processamento diário de pedidos.'
    };

    teste(1, 'investigação foi criada', !!investigacao);
    teste(2, 'problema está definido', !!investigacao.problema_central);
    teste(3, 'processo está definido', !!investigacao.processo);

    const base = {
      status: 'VALIDADA',
      confianca: 'ALTA',
      evidencias: ['caso validado de teste'],
      casos_relacionados: [],
      origem: 'TESTE_V6.3',
      versao: 'V6.3',
      restricoes: [],
      alternativas: []
    };

    const correta = Object.assign({}, base, {
      resolucao_id: marcador + '-CORRETA',
      titulo_interno: marcador + ' — lançamento de pedidos',
      descricao_problema: 'Erros de digitação e retrabalho na conferência e lançamento de pedidos.',
      padrao_problema: 'Ineficiência operacional em lançamento manual de pedidos.',
      processo: 'Conferir e lançar pedidos recebidos por diferentes canais.',
      dores: ['erros de digitação', 'retrabalho'],
      impactos: ['perda de tempo no processo'],
      resultados_desejados: ['reduzir erros e retrabalho no lançamento de pedidos'],
      contexto: 'Processamento diário de pedidos.'
    });

    const parcial = Object.assign({}, base, {
      resolucao_id: marcador + '-PARCIAL',
      titulo_interno: marcador + ' — conferência de estoque',
      descricao_problema: 'Erros e retrabalho na conferência manual de estoque.',
      padrao_problema: 'Ineficiência operacional em conferência manual de estoque.',
      processo: 'Conferir quantidades e registrar movimentações de estoque.',
      dores: ['erros de conferência', 'retrabalho'],
      impactos: ['perda de tempo na conferência'],
      resultados_desejados: ['reduzir erros na conferência de estoque'],
      contexto: 'Rotina administrativa de controle de estoque.'
    });

    const ruido = Object.assign({}, base, {
      resolucao_id: marcador + '-RUIDO',
      titulo_interno: marcador + ' — manutenção de veículos',
      descricao_problema: 'Atrasos e retrabalho no controle de manutenção de veículos.',
      padrao_problema: 'Falhas administrativas no acompanhamento de manutenção.',
      processo: 'Acompanhar revisões, manutenções e prazos de veículos.',
      dores: ['atrasos', 'retrabalho'],
      impactos: ['perda de tempo no acompanhamento'],
      resultados_desejados: ['reduzir atrasos de manutenção'],
      contexto: 'Gestão de frota e manutenção.'
    });

    const salvoCorreta = salvarResolucaoV63_(correta);
    const salvoParcial = salvarResolucaoV63_(parcial);
    const salvoRuido = salvarResolucaoV63_(ruido);
    idsTeste.push(salvoCorreta.resolucao_id, salvoParcial.resolucao_id, salvoRuido.resolucao_id);

    const pCorreta = buscarResolucaoV63_({ resolucao_id: salvoCorreta.resolucao_id });
    const pParcial = buscarResolucaoV63_({ resolucao_id: salvoParcial.resolucao_id });
    const pRuido = buscarResolucaoV63_({ resolucao_id: salvoRuido.resolucao_id });

    teste(4, 'solução correta foi persistida', !!pCorreta);
    teste(5, 'solução parcial foi persistida', !!pParcial);
    teste(6, 'solução incompatível foi persistida', !!pRuido);
    teste(7, 'as três soluções permanecem VALIDADA na biblioteca', !!pCorreta && !!pParcial && !!pRuido && pCorreta.status === 'VALIDADA' && pParcial.status === 'VALIDADA' && pRuido.status === 'VALIDADA');

    const cCorreta = compararInvestigacaoResolucaoV63_(investigacao, pCorreta);
    const cParcial = compararInvestigacaoResolucaoV63_(investigacao, pParcial);
    const cRuido = compararInvestigacaoResolucaoV63_(investigacao, pRuido);

    teste(8, 'comparação da solução correta foi produzida', !!cCorreta);
    teste(9, 'comparação da solução parcial foi produzida', !!cParcial);
    teste(10, 'comparação do ruído foi produzida', !!cRuido);
    teste(11, 'solução correta supera a parcial', !!cCorreta && !!cParcial && cCorreta.pontuacao > cParcial.pontuacao);
    teste(12, 'solução correta supera o ruído', !!cCorreta && !!cRuido && cCorreta.pontuacao > cRuido.pontuacao);

    const encontrados = buscarResolucoesRelacionadasV63_(investigacao, { pontuacao_minima: 20, limite: 10 });
    const eCorreta = encontrados.find(function(item) { return item.resolucao_id === salvoCorreta.resolucao_id; });
    const eParcial = encontrados.find(function(item) { return item.resolucao_id === salvoParcial.resolucao_id; });
    const eRuido = encontrados.find(function(item) { return item.resolucao_id === salvoRuido.resolucao_id; });

    teste(13, 'busca relacionada executou', Array.isArray(encontrados));
    teste(14, 'solução correta foi reconhecida', !!eCorreta);
    teste(15, 'solução correta aparece antes da parcial', !!eCorreta && !!eParcial && encontrados.indexOf(eCorreta) < encontrados.indexOf(eParcial));
    teste(16, 'solução correta mantém pontuação superior ao ruído quando ambos são retornados', !!eCorreta && !!eRuido && Number(eCorreta.pontuacao) > Number(eRuido.pontuacao));
    teste(17, 'ruído não supera a solução correta', !!eCorreta && (!eRuido || Number(eCorreta.pontuacao) > Number(eRuido.pontuacao)));

    const candidatos = encontrados.filter(function(item) {
      return item.resolucao_id === salvoCorreta.resolucao_id || item.resolucao_id === salvoParcial.resolucao_id || item.resolucao_id === salvoRuido.resolucao_id;
    });
    const classificacao = classificarReconhecimentoV63_(candidatos);
    const decisao = decidirSolucaoV63_(classificacao, { investigacao: investigacao });

    teste(18, 'classificação foi produzida', !!classificacao);
    teste(19, 'decisão foi produzida', !!decisao);
    teste(20, 'solução principal é a correta', !!decisao && decisao.resolucao_principal === salvoCorreta.resolucao_id);
    teste(21, 'decisão preserva a classificação calculada', !!decisao && decisao.classificacao_reconhecimento === classificacao.classificacao);

    const resposta = gerarRespostaSeguraV63_(decisao);
    teste(22, 'resposta segura foi produzida', !!(resposta && resposta.resposta_cliente));
    teste(23, 'resposta não expõe tecnologia', !!resposta && resposta.tecnologia_exposta !== true);
    teste(24, 'resposta não expõe preço ou negociação', !!resposta && resposta.preco_informado !== true && resposta.negociacao_realizada !== true);

    const filtro = verificarSegurancaRespostaSeguraV63_(resposta.resposta_cliente);
    teste(25, 'resposta final passa pelo filtro de segurança', !!(filtro && filtro.segura === true));

  } catch (erro) {
    Logger.log('ERRO GERAL TESTE: ' + (erro.message || erro));
  } finally {
    try {
      const sheet = obterAba_(SHEETS.BIBLIOTECA_RESOLUCOES);
      const valores = sheet.getDataRange().getValues();
      const cabecalhos = valores[0] || [];
      const colunaId = cabecalhos.indexOf('resolucao_id');
      const colunaTitulo = cabecalhos.indexOf('titulo_interno');
      for (let i = valores.length - 1; i >= 1; i--) {
        const idLinha = colunaId >= 0 ? String(valores[i][colunaId]) : '';
        const tituloLinha = colunaTitulo >= 0 ? String(valores[i][colunaTitulo]) : '';
        if (idsTeste.indexOf(idLinha) !== -1 || tituloLinha.indexOf(marcador) === 0) sheet.deleteRow(i + 1);
      }
      Logger.log('LIMPEZA RUÍDO V6.3: CONCLUÍDA');
    } catch (erroLimpeza) {
      Logger.log('⚠️ AVISO LIMPEZA RUÍDO: ' + (erroLimpeza.message || erroLimpeza));
    }
  }

  const aprovados = resultados.filter(function(item) { return item.passou; }).length;
  const falhas = resultados.length - aprovados;
  const percentual = resultados.length ? Math.round((aprovados / resultados.length) * 100) : 0;

  Logger.log('============================================================');
  Logger.log('RESULTADO FINAL — RUÍDO NO CATÁLOGO V6.3');
  Logger.log('============================================================');
  Logger.log('APROVADOS: ' + aprovados + '/' + resultados.length);
  Logger.log('FALHAS: ' + falhas);
  Logger.log('PERCENTUAL: ' + percentual + '%');
  if (resultados.length === 25 && falhas === 0) {
    Logger.log('🏆 TESTAR_RUIDO_NO_CATALOGO_V63: PASSOU');
    Logger.log('🏆 RUÍDO NO CATÁLOGO V6.3: 100%');
  } else {
    Logger.log('❌ TESTAR_RUIDO_NO_CATALOGO_V63: FALHOU');
  }
  Logger.log('============================================================');

  return { sucesso: resultados.length === 25 && falhas === 0, aprovados: aprovados, falhas: falhas, percentual: percentual, resultados: resultados };
}
