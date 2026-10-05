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
function expandirSinonimosReconhecimentoV63_(tokens) {
  const grupos = [
    ['digitacao', 'redigitacao', 'digitar', 'digitando', 'digite', 'redigitar'],
    ['retrabalho', 'refazer', 'refazendo', 'repeticao', 'repetir', 'novamente'],
    ['tempo', 'gasto', 'perda', 'perder', 'perde'],
    ['lancamento', 'lancar', 'lanca', 'lancado', 'lancados', 'registrar', 'registro'],
    ['conferencia', 'conferir', 'conferido', 'conferidos', 'verificacao', 'verificar'],
    ['pedido', 'pedidos', 'solicitacao', 'solicitacoes'],
    ['erro', 'erros', 'falha', 'falhas'],
    ['manual', 'manualmente'],
    ['canal', 'canais']
  ];

  const mapa = {};
  grupos.forEach(function(grupo) {
    grupo.forEach(function(token) {
      mapa[token] = grupo;
    });
  });

  const resultado = [];
  (Array.isArray(tokens) ? tokens : []).forEach(function(token) {
    resultado.push(token);
    if (mapa[token]) {
      mapa[token].forEach(function(relacionado) {
        resultado.push(relacionado);
      });
    }
  });

  return Array.from(new Set(resultado));
}

function calcularSimilaridadeTextoV63_(
  valorA,
  valorB
) {

  const tokensA = tokenizarReconhecimentoV63_(valorA);
  const tokensB = tokenizarReconhecimentoV63_(valorB);

  if (tokensA.length === 0 || tokensB.length === 0) {
    return 0;
  }

  const expandidosA = expandirSinonimosReconhecimentoV63_(tokensA);
  const expandidosB = expandirSinonimosReconhecimentoV63_(tokensB);

  const intersecao = calcularIntersecaoReconhecimentoV63_(expandidosA, expandidosB);
  const uniao = Array.from(new Set(expandidosA.concat(expandidosB))).length;

  if (uniao === 0) {
    return 0;
  }

  return Math.round((intersecao / uniao) * 100);

}

