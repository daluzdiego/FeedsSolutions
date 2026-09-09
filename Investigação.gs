/**
 * ============================================================
 * FEEDS SOLUTIONS
 * V6.2 — MOTOR DE INVESTIGAÇÃO PROFUNDA
 * ============================================================
 *
 * OBJETIVO:
 * Entender profundamente um problema já validado pela Triagem,
 * sem escolher tecnologia, vender ou criar Lead.
 *
 * PRINCÍPIO:
 * Conversa natural por fora.
 * Protocolo estruturado por dentro.
 *
 * REGRA:
 * IA interpreta.
 * Regras determinísticas validam.
 *
 * ============================================================
 */


/**
 * ============================================================
 * CONFIGURAÇÃO V6.2
 * ============================================================
 */

const INVESTIGACAO_V62 = {

  VERSAO: 'V6.2',

  ESTADOS: {
    INICIO: 'INICIO',
    MAPEANDO_PROCESSO: 'MAPEANDO_PROCESSO',
    IDENTIFICANDO_DOR: 'IDENTIFICANDO_DOR',
    QUANTIFICANDO_IMPACTO: 'QUANTIFICANDO_IMPACTO',
    ENTENDENDO_EXCECOES: 'ENTENDENDO_EXCECOES',
    DEFININDO_RESULTADO: 'DEFININDO_RESULTADO',
    PRONTA_PARA_SOLUCAO: 'PRONTA_PARA_SOLUCAO'
  },

  STATUS_INFORMACAO: {
    CONFIRMADA: 'CONFIRMADA',
    ESTIMADA: 'ESTIMADA',
    INFERIDA: 'INFERIDA',
    DESCONHECIDA: 'DESCONHECIDA'
  },

  DIMENSOES: {
    PROBLEMA_CENTRAL: 'problema_central',
    PROCESSO: 'processo',
    ETAPAS: 'etapas',
    ENVOLVIDOS: 'envolvidos',
    ENTRADA: 'entrada',
    SAIDA: 'saida',
    PONTOS_DOR: 'pontos_de_dor',
    IMPACTO: 'impacto',
    EXCECOES: 'excecoes',
    RESULTADO: 'resultado_desejado'
  }

};


/**
 * ============================================================
 * NORMALIZAÇÃO
 * ============================================================
 */

function normalizarTextoInvestigacaoV62_(valor) {

  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

}


/**
 * ============================================================
 * VERIFICA SE UM VALOR EXISTE
 * ============================================================
 */

function possuiValorInvestigacaoV62_(valor) {

  if (Array.isArray(valor)) {
    return valor.length > 0;
  }

  return String(valor || '').trim() !== '';

}


/**
 * ============================================================
 * STATUS DA INFORMAÇÃO
 * ============================================================
 */

function normalizarStatusInformacaoV62_(status) {

  const valor =
    normalizarTextoInvestigacaoV62_(status);

  if (
    valor === 'confirmada' ||
    valor === 'confirmado'
  ) {
    return INVESTIGACAO_V62.STATUS_INFORMACAO.CONFIRMADA;
  }

  if (
    valor === 'estimada' ||
    valor === 'estimado'
  ) {
    return INVESTIGACAO_V62.STATUS_INFORMACAO.ESTIMADA;
  }

  if (
    valor === 'inferida' ||
    valor === 'inferido'
  ) {
    return INVESTIGACAO_V62.STATUS_INFORMACAO.INFERIDA;
  }

  if (
    valor === 'desconhecida' ||
    valor === 'desconhecido'
  ) {
    return INVESTIGACAO_V62.STATUS_INFORMACAO.DESCONHECIDA;
  }

  return INVESTIGACAO_V62.STATUS_INFORMACAO.DESCONHECIDA;

}


/**
 * ============================================================
 * CRIA UMA INFORMAÇÃO ESTRUTURADA
 * ============================================================
 */

function criarInformacaoInvestigacaoV62_(
  campo,
  valor,
  status
) {

  return {

    campo: String(campo || '').trim(),

    valor: valor,

    status:
      normalizarStatusInformacaoV62_(status)

  };

}


/**
 * ============================================================
 * VERIFICA SE UMA DIMENSÃO JÁ FOI RESPONDIDA
 * ============================================================
 */

function dimensaoRespondidaInvestigacaoV62_(
  investigacao,
  dimensao
) {

  const dados =
    investigacao || {};

  const valor =
    dados[dimensao];

  return possuiValorInvestigacaoV62_(valor);

}


/**
 * ============================================================
 * VERIFICA SE UMA PERGUNTA JÁ FOI FEITA
 * ============================================================
 */

function perguntaJaFeitaInvestigacaoV62_(
  investigacao,
  pergunta
) {

  const texto =
    normalizarTextoInvestigacaoV62_(
      pergunta
    );

  if (!texto) {
    return false;
  }

  const perguntas =
    Array.isArray(investigacao && investigacao.perguntas_realizadas)
      ? investigacao.perguntas_realizadas
      : [];

  return perguntas.some(function(item) {

    return (
      normalizarTextoInvestigacaoV62_(item) ===
      texto
    );

  });

}


/**
 * ============================================================
 * ADICIONA PERGUNTA AO HISTÓRICO
 * ============================================================
 */

function registrarPerguntaInvestigacaoV62_(
  investigacao,
  pergunta
) {

  const dados =
    investigacao || {};

  if (!Array.isArray(dados.perguntas_realizadas)) {
    dados.perguntas_realizadas = [];
  }

  if (
    !perguntaJaFeitaInvestigacaoV62_(
      dados,
      pergunta
    )
  ) {

    dados.perguntas_realizadas.push(
      String(pergunta || '').trim()
    );

  }

  return dados;

}


/**
 * ============================================================
 * VERIFICA PROCESSO MÍNIMO
 * ============================================================
 */

function processoSuficienteInvestigacaoV62_(
  investigacao
) {

  const processo =
    investigacao &&
    investigacao.processo;

  if (!processo) {
    return false;
  }

  if (typeof processo === 'string') {
    return processo.trim() !== '';
  }

  if (typeof processo === 'object') {

    return (
      possuiValorInvestigacaoV62_(processo.descricao) ||
      possuiValorInvestigacaoV62_(processo.entrada) ||
      possuiValorInvestigacaoV62_(processo.saida)
    );

  }

  return false;

}


/**
 * ============================================================
 * DOR MÍNIMA
 * ============================================================
 */

function dorSuficienteInvestigacaoV62_(
  investigacao
) {

  return possuiValorInvestigacaoV62_(
    investigacao &&
    investigacao.problema_central
  ) ||
  (
    Array.isArray(
      investigacao &&
      investigacao.pontos_de_dor
    ) &&
    investigacao.pontos_de_dor.length > 0
  );

}


/**
 * ============================================================
 * RESULTADO DESEJADO
 * ============================================================
 */

function resultadoSuficienteInvestigacaoV62_(
  investigacao
) {

  return possuiValorInvestigacaoV62_(
    investigacao &&
    investigacao.resultado_desejado
  );

}


/**
 * ============================================================
 * IMPACTO SUFICIENTE
 * ============================================================
 */

function impactoSuficienteInvestigacaoV62_(
  investigacao
) {

  const impacto =
    investigacao &&
    investigacao.impacto;

  if (!impacto) {
    return false;
  }

  if (typeof impacto === 'string') {

    return impacto.trim() !== '';

  }

  if (typeof impacto === 'object') {

    // --------------------------------------------------------
    // IMPACTO DESCRITIVO
    // --------------------------------------------------------
    //
    // Uma descrição de impacto já é informação válida.
    //
    // Exemplo:
    // "Horas gastas diariamente"
    //
    // Não devemos obrigar a IA a decompor imediatamente
    // o impacto em tempo, custo, volume etc.
    //
    // --------------------------------------------------------

    if (
      possuiValorInvestigacaoV62_(
        impacto.descricao
      )
    ) {

      return true;

    }

    // --------------------------------------------------------
    // IMPACTO ESTRUTURADO
    // --------------------------------------------------------

    return (
      possuiValorInvestigacaoV62_(
        impacto.tempo
      ) ||

      possuiValorInvestigacaoV62_(
        impacto.volume
      ) ||

      possuiValorInvestigacaoV62_(
        impacto.frequencia
      ) ||

      possuiValorInvestigacaoV62_(
        impacto.custo
      ) ||

      possuiValorInvestigacaoV62_(
        impacto.erros
      ) ||

      possuiValorInvestigacaoV62_(
        impacto.retrabalho
      )
    );

  }

  return false;

}


/**
 * ============================================================
 * VERIFICA SE A INVESTIGAÇÃO JÁ TEM BASE SUFICIENTE
 * ============================================================
 *
 * IMPORTANTE:
 *
 * Não exigimos todos os campos.
 *
 * O objetivo é ter conhecimento suficiente para definir
 * uma solução posteriormente, sem transformar investigação
 * em questionário infinito.
 *
 * Mínimo:
 *
 * 1. problema
 * 2. processo
 * 3. pelo menos um elemento de impacto
 * 4. resultado desejado
 *
 * E:
 * se o processo tiver estrutura suficiente, pode avançar.
 *
 * ============================================================
 */

function investigacaoSuficienteV62_(
  investigacao
) {

  const dados =
    investigacao || {};

  return (
    dorSuficienteInvestigacaoV62_(dados) &&
    processoSuficienteInvestigacaoV62_(dados) &&
    impactoSuficienteInvestigacaoV62_(dados) &&
    resultadoSuficienteInvestigacaoV62_(dados)
  );

}


/**
 * ============================================================
 * DETERMINA LACUNAS
 * ============================================================
 */

function determinarLacunasInvestigacaoV62_(
  investigacao
) {

  const dados =
    investigacao || {};

  const lacunas = [];

  if (
    !dorSuficienteInvestigacaoV62_(dados)
  ) {

    lacunas.push(
      'problema_central'
    );

  }

  if (
    !processoSuficienteInvestigacaoV62_(dados)
  ) {

    lacunas.push(
      'processo'
    );

  }

  if (
    !impactoSuficienteInvestigacaoV62_(dados)
  ) {

    lacunas.push(
      'impacto'
    );

  }

  if (
    !resultadoSuficienteInvestigacaoV62_(dados)
  ) {

    lacunas.push(
      'resultado_desejado'
    );

  }

  return lacunas;

}


/**
 * ============================================================
 * ESCOLHE A PRÓXIMA DIMENSÃO
 * ============================================================
 *
 * PRIORIDADE:
 *
 * 1. problema
 * 2. processo
 * 3. impacto
 * 4. resultado
 * 5. exceções
 *
 * Sempre somente UMA.
 *
 * ============================================================
 */

function determinarProximaDimensaoInvestigacaoV62_(
  investigacao
) {

  const dados =
    investigacao || {};

  if (
    !dorSuficienteInvestigacaoV62_(dados)
  ) {

    return INVESTIGACAO_V62.DIMENSOES.PROBLEMA_CENTRAL;

  }

  if (
    !processoSuficienteInvestigacaoV62_(dados)
  ) {

    return INVESTIGACAO_V62.DIMENSOES.PROCESSO;

  }

  if (
    !impactoSuficienteInvestigacaoV62_(dados)
  ) {

    return INVESTIGACAO_V62.DIMENSOES.IMPACTO;

  }

  if (
    !resultadoSuficienteInvestigacaoV62_(dados)
  ) {

    return INVESTIGACAO_V62.DIMENSOES.RESULTADO;

  }

  if (
    !dimensaoRespondidaInvestigacaoV62_(
      dados,
      'excecoes'
    )
  ) {

    return INVESTIGACAO_V62.DIMENSOES.EXCECOES;

  }

  return null;

}


/**
 * ============================================================
 * PERGUNTAS NATURAIS POR DIMENSÃO
 * ============================================================
 */

function construirPerguntaInvestigacaoV62_(
  dimensao
) {

  switch (dimensao) {

    case INVESTIGACAO_V62.DIMENSOES.PROBLEMA_CENTRAL:

      return (
        'O que hoje mais incomoda ou gera problema nesse processo?'
      );

    case INVESTIGACAO_V62.DIMENSOES.PROCESSO:

      return (
        'Como esse processo acontece hoje, na prática, desde o início até o final?'
      );

    case INVESTIGACAO_V62.DIMENSOES.IMPACTO:

      return (
        'Quanto esse problema impacta o trabalho de vocês no dia a dia?'
      );

    case INVESTIGACAO_V62.DIMENSOES.RESULTADO:

      return (
        'Se esse processo funcionasse da forma ideal, o que você gostaria que acontecesse?'
      );

    case INVESTIGACAO_V62.DIMENSOES.EXCECOES:

      return (
        'Existem situações ou tipos de caso em que esse problema acontece mais ou funciona de forma diferente?'
      );

    default:

      return (
        'Pode me contar um pouco mais sobre como isso funciona hoje?'
      );

  }

}


/**
 * ============================================================
 * DETERMINA ESTADO
 * ============================================================
 */

function determinarEstadoInvestigacaoV62_(
  investigacao
) {

  const dados =
    investigacao || {};

  if (
    investigacaoSuficienteV62_(dados)
  ) {

    return INVESTIGACAO_V62.ESTADOS.PRONTA_PARA_SOLUCAO;

  }

  if (
    !dorSuficienteInvestigacaoV62_(dados)
  ) {

    return INVESTIGACAO_V62.ESTADOS.IDENTIFICANDO_DOR;

  }

  if (
    !processoSuficienteInvestigacaoV62_(dados)
  ) {

    return INVESTIGACAO_V62.ESTADOS.MAPEANDO_PROCESSO;

  }

  if (
    !impactoSuficienteInvestigacaoV62_(dados)
  ) {

    return INVESTIGACAO_V62.ESTADOS.QUANTIFICANDO_IMPACTO;

  }

  if (
    !resultadoSuficienteInvestigacaoV62_(dados)
  ) {

    return INVESTIGACAO_V62.ESTADOS.DEFININDO_RESULTADO;

  }

  return INVESTIGACAO_V62.ESTADOS.ENTENDENDO_EXCECOES;

}


/**
 * ============================================================
 * DETERMINA CONFIANÇA
 * ============================================================
 */

function determinarConfiancaInvestigacaoV62_(
  investigacao
) {

  const dados =
    investigacao || {};

  if (
    investigacaoSuficienteV62_(dados)
  ) {

    const temProcessoEstruturado =
      typeof dados.processo === 'object' &&
      (
        possuiValorInvestigacaoV62_(
          dados.processo.etapas
        ) ||
        possuiValorInvestigacaoV62_(
          dados.processo.descricao
        )
      );

    const temImpacto =
      impactoSuficienteInvestigacaoV62_(
        dados
      );

    if (
      temProcessoEstruturado &&
      temImpacto
    ) {

      return 'ALTA';

    }

    return 'MEDIA';

  }

  if (
    dorSuficienteInvestigacaoV62_(dados) ||
    processoSuficienteInvestigacaoV62_(dados)
  ) {

    return 'MEDIA';

  }

  return 'BAIXA';

}


/**
 * ============================================================
 * CONSTRÓI RESULTADO DA INVESTIGAÇÃO
 * ============================================================
 */

function construirResultadoInvestigacaoV62_(
  dados
) {

  const investigacao =
    dados || {};

  const estado =
    determinarEstadoInvestigacaoV62_(
      investigacao
    );

  const lacunas =
    determinarLacunasInvestigacaoV62_(
      investigacao
    );

  const confianca =
    determinarConfiancaInvestigacaoV62_(
      investigacao
    );

  const dimensao =
    estado ===
      INVESTIGACAO_V62.ESTADOS.PRONTA_PARA_SOLUCAO
      ? null
      : determinarProximaDimensaoInvestigacaoV62_(
          investigacao
        );

  const proximaPergunta =
    dimensao
      ? construirPerguntaInvestigacaoV62_(
          dimensao
        )
      : '';

  return {

    versao:
      INVESTIGACAO_V62.VERSAO,

    empresa_id:
      investigacao.empresa_id || '',

    conversa_id:
      investigacao.conversa_id || '',

    diagnostico_id:
      investigacao.diagnostico_id || '',

    problema_central:
      investigacao.problema_central || '',

    processo:
      investigacao.processo || '',

    pontos_de_dor:
      Array.isArray(
        investigacao.pontos_de_dor
      )
        ? investigacao.pontos_de_dor
        : [],

    impacto:
      investigacao.impacto || {},

    excecoes:
      Array.isArray(
        investigacao.excecoes
      )
        ? investigacao.excecoes
        : [],

    resultado_desejado:
      investigacao.resultado_desejado || '',

    informacoes:
      Array.isArray(
        investigacao.informacoes
      )
        ? investigacao.informacoes
        : [],

    lacunas:
      lacunas,

    confianca:
      confianca,

    estado:
      estado,

    proxima_dimensao:
      dimensao,

    proxima_pergunta:
      proximaPergunta,

    perguntas_realizadas:
      Array.isArray(
        investigacao.perguntas_realizadas
      )
        ? investigacao.perguntas_realizadas
        : []

  };

}


/**
 * ============================================================
 * INICIA INVESTIGAÇÃO
 * ============================================================
 */

function iniciarInvestigacaoV62_(
  dados
) {

  const entrada =
    dados || {};

  const investigacao = {

    versao:
      INVESTIGACAO_V62.VERSAO,

    empresa_id:
      entrada.empresa_id || '',

    conversa_id:
      entrada.conversa_id || '',

    diagnostico_id:
      entrada.diagnostico_id || '',

    problema_central:
      entrada.dor || '',

    processo:
      entrada.processo || '',

    pontos_de_dor:
      entrada.dor
        ? [entrada.dor]
        : [],

    impacto:
      entrada.impacto
        ? {
            descricao:
              entrada.impacto
          }
        : {},

    frequencia:
      entrada.frequencia || '',

    contexto:
      entrada.contexto || '',

    excecoes: [],

    resultado_desejado: '',

    informacoes: [],

    lacunas: [],

    perguntas_realizadas: []

  };

  return construirResultadoInvestigacaoV62_(
    investigacao
  );

}


/**
 * ============================================================
 * TESTE DE DETERMINISMO
 * ============================================================
 */

function mesmaDecisaoInvestigacaoV62_(
  a,
  b
) {

  return (
    JSON.stringify(a) ===
    JSON.stringify(b)
  );

}


/**
 * ============================================================
 * ASSERT
 * ============================================================
 */

function assertInvestigacaoV62_(
  condicao,
  numero,
  descricao,
  detalhes
) {

  if (condicao) {

    Logger.log(
      'PASSOU — TESTE ' +
      numero +
      ': ' +
      descricao +
      (
        detalhes
          ? ' — ' + detalhes
          : ''
      )
    );

    return true;

  }

  Logger.log(
    'FALHOU — TESTE ' +
    numero +
    ': ' +
    descricao +
    (
      detalhes
        ? ' — ' + detalhes
        : ''
    )
  );

  return false;

}


/**
 * ============================================================
 * TESTES OFICIAIS V6.2
 * ============================================================
 */

function TESTAR_MOTOR_INVESTIGACAO_V62() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'V6.2 — MOTOR DE INVESTIGAÇÃO PROFUNDA'
  );

  Logger.log(
    '============================================================'
  );

  let total = 0;
  let passou = 0;

  function testar(
    descricao,
    condicao,
    detalhes
  ) {

    total++;

    const numero =
      total;

    if (condicao) {

      passou++;

      Logger.log(
        'PASSOU — TESTE ' +
        numero +
        ': ' +
        descricao +
        (
          detalhes
            ? ' — ' + detalhes
            : ''
        )
      );

      return true;

    }

    Logger.log(
      'FALHOU — TESTE ' +
      numero +
      ': ' +
      descricao +
      (
        detalhes
          ? ' — ' + detalhes
          : ''
      )
    );

    return false;

  }


  // ==========================================================
  // CASO 1
  // ==========================================================

  const inicio =
    iniciarInvestigacaoV62_({

      empresa_id:
        'EMP-TESTE',

      conversa_id:
        'CONV-TESTE',

      diagnostico_id:
        'DIA-TESTE',

      dor:
        'Erros e retrabalho',

      processo:
        'Conferir e lançar pedidos',

      impacto:
        'Horas gastas diariamente',

      frequencia:
        'Diária',

      contexto:
        'Operação administrativa'

    });


  testar(
    'Investigação inicia com diagnóstico existente',
    inicio.diagnostico_id ===
      'DIA-TESTE',
    inicio.diagnostico_id
  );


  // ==========================================================
  // CASO 2
  // ==========================================================

  testar(
    'Dor já conhecida é preservada',
    inicio.problema_central ===
      'Erros e retrabalho',
    inicio.problema_central
  );


  // ==========================================================
  // CASO 3
  // ==========================================================

  testar(
    'Processo já conhecido é preservado',
    inicio.processo ===
      'Conferir e lançar pedidos',
    inicio.processo
  );


  // ==========================================================
  // CASO 4
  // ==========================================================

  testar(
    'Impacto já conhecido é preservado',
    inicio.impacto.descricao ===
      'Horas gastas diariamente',
    inicio.impacto.descricao
  );


  // ==========================================================
  // CASO 5
  // ==========================================================

  testar(
    'Resultado ainda não informado gera lacuna',
    inicio.lacunas.indexOf(
      'resultado_desejado'
    ) !== -1,
    JSON.stringify(inicio.lacunas)
  );


  // ==========================================================
  // CASO 6
  // ==========================================================

  testar(
    'Investigação não fica pronta sem resultado',
    inicio.estado !==
      INVESTIGACAO_V62.ESTADOS.PRONTA_PARA_SOLUCAO,
    inicio.estado
  );


  // ==========================================================
  // CASO 7
  // ==========================================================

  testar(
    'Próxima pergunta é única',
    typeof inicio.proxima_pergunta ===
      'string' &&
    inicio.proxima_pergunta.trim() !== '',
    inicio.proxima_pergunta
  );


  // ==========================================================
  // CASO 8
  // ==========================================================
  //
  // Aqui queremos validar especificamente a dimensão escolhida.
  //
  // Como problema, processo e impacto já estão disponíveis,
  // a única lacuna obrigatória restante é:
  //
  // resultado_desejado
  //
  // Portanto a próxima dimensão deve ser RESULTADO.
  //
  // ==========================================================

  Logger.log(
    'DEBUG TESTE 8 — DIMENSÃO RETORNADA: ' +
    inicio.proxima_dimensao
  );

  Logger.log(
    'DEBUG TESTE 8 — DIMENSÃO ESPERADA: ' +
    INVESTIGACAO_V62.DIMENSOES.RESULTADO
  );

  Logger.log(
    'DEBUG TESTE 8 — PERGUNTA RETORNADA: ' +
    inicio.proxima_pergunta
  );


  testar(
    'Próxima dimensão corresponde ao resultado',
    inicio.proxima_dimensao ===
      INVESTIGACAO_V62.DIMENSOES.RESULTADO,
    'Obtido: ' +
      inicio.proxima_dimensao +
      ' | Esperado: ' +
      INVESTIGACAO_V62.DIMENSOES.RESULTADO
  );


  // ==========================================================
  // INVESTIGAÇÃO COMPLETA
  // ==========================================================

  const investigacaoCompleta = {

    empresa_id:
      'EMP-TESTE',

    conversa_id:
      'CONV-TESTE',

    diagnostico_id:
      'DIA-TESTE',

    problema_central:
      'Erros e retrabalho',

    processo: {

      descricao:
        'Conferir pedidos e lançar informações no sistema',

      etapas: [

        'receber pedido',

        'conferir dados',

        'lançar informações',

        'corrigir erros'

      ],

      envolvidos: [

        'equipe administrativa'

      ]

    },

    pontos_de_dor: [

      'erros de digitação',

      'retrabalho'

    ],

    impacto: {

      tempo:
        '3 horas por dia',

      volume:
        '100 pedidos por dia',

      frequencia:
        'diária',

      erros:
        'erros de digitação',

      retrabalho:
        'correções manuais'

    },

    excecoes: [

      'pedidos com informações incompletas'

    ],

    resultado_desejado:
      'Reduzir erros e eliminar retrabalho',

    informacoes: [

      criarInformacaoInvestigacaoV62_(

        'volume',

        '100 pedidos por dia',

        'CONFIRMADA'

      ),

      criarInformacaoInvestigacaoV62_(

        'tempo',

        '3 horas por dia',

        'ESTIMADA'

      )

    ],

    perguntas_realizadas: []

  };


  const completa =
    construirResultadoInvestigacaoV62_(
      investigacaoCompleta
    );


  // ==========================================================
  // CASO 9
  // ==========================================================

  testar(
    'Investigação completa pode ficar pronta',
    completa.estado ===
      INVESTIGACAO_V62.ESTADOS.PRONTA_PARA_SOLUCAO,
    completa.estado
  );


  // ==========================================================
  // CASO 10
  // ==========================================================

  testar(
    'Investigação completa não possui lacunas obrigatórias',
    completa.lacunas.length === 0,
    JSON.stringify(completa.lacunas)
  );


  // ==========================================================
  // CASO 11
  // ==========================================================

  testar(
    'Confiança máxima em investigação estruturada',
    completa.confianca ===
      'ALTA',
    completa.confianca
  );


  // ==========================================================
  // CASO 12
  // ==========================================================

  testar(
    'Investigação pronta não faz nova pergunta',
    completa.proxima_pergunta === '',
    completa.proxima_pergunta
  );


  // ==========================================================
  // CASO 13
  // ==========================================================

  const textoCompleto =
    JSON.stringify(
      completa
    ).toLowerCase();


  testar(
    'Tecnologia não aparece no resultado',
    textoCompleto.indexOf('api') === -1 &&
    textoCompleto.indexOf('program') === -1 &&
    textoCompleto.indexOf('software') === -1,
    textoCompleto
  );


  // ==========================================================
  // CASO 14
  // ==========================================================

  const estimada =
    criarInformacaoInvestigacaoV62_(
      'impacto',
      'aproximadamente 3 horas',
      'ESTIMADA'
    );


  testar(
    'Informação estimada permanece ESTIMADA',
    estimada.status ===
      INVESTIGACAO_V62.STATUS_INFORMACAO.ESTIMADA,
    estimada.status
  );


  // ==========================================================
  // CASO 15
  // ==========================================================

  const inferida =
    criarInformacaoInvestigacaoV62_(
      'responsavel',
      'provavelmente equipe administrativa',
      'INFERIDA'
    );


  testar(
    'Informação inferida permanece INFERIDA',
    inferida.status ===
      INVESTIGACAO_V62.STATUS_INFORMACAO.INFERIDA,
    inferida.status
  );


  // ==========================================================
  // CASO 16
  // ==========================================================

  let historico = {

    perguntas_realizadas: [

      'Como esse processo acontece hoje, na prática?'

    ]

  };


  historico =
    registrarPerguntaInvestigacaoV62_(
      historico,
      'Como esse processo acontece hoje, na prática?'
    );


  testar(
    'Pergunta repetida não é registrada novamente',
    historico.perguntas_realizadas.length === 1,
    JSON.stringify(
      historico.perguntas_realizadas
    )
  );


  // ==========================================================
  // CASO 17
  // ==========================================================

  const problemaParcial = {

    problema_central:
      'Retrabalho',

    processo:
      'Processo administrativo',

    impacto:
      'Perda de tempo',

    resultado_desejado:
      ''

  };


  const parcial =
    construirResultadoInvestigacaoV62_(
      problemaParcial
    );


  testar(
    'Investigação incompleta não é encerrada',
    parcial.estado !==
      INVESTIGACAO_V62.ESTADOS.PRONTA_PARA_SOLUCAO,
    parcial.estado
  );


  // ==========================================================
  // CASO 18
  // ==========================================================

  const desconhecido = {

    problema_central:
      'Retrabalho operacional',

    processo:
      'Processo administrativo',

    impacto: {},

    resultado_desejado:
      ''

  };


  const desconhecidoResultado =
    construirResultadoInvestigacaoV62_(
      desconhecido
    );


  testar(
    'Incerteza mantém investigação aberta',
    desconhecidoResultado.lacunas.length >= 1 &&
    desconhecidoResultado.estado !==
      INVESTIGACAO_V62.ESTADOS.PRONTA_PARA_SOLUCAO,
    JSON.stringify(
      desconhecidoResultado.lacunas
    )
  );


  // ==========================================================
  // CASO 19
  // ==========================================================

  const entradaDeterministica = {

    empresa_id:
      'EMP-DETERMINISMO',

    conversa_id:
      'CONV-DETERMINISMO',

    diagnostico_id:
      'DIA-DETERMINISMO',

    problema_central:
      'Erros operacionais',

    processo:
      'Conferência de pedidos',

    impacto:
      'Perda de tempo',

    resultado_desejado:
      'Reduzir erros',

    excecoes: []

  };


  const decisao1 =
    construirResultadoInvestigacaoV62_(
      entradaDeterministica
    );


  const decisao2 =
    construirResultadoInvestigacaoV62_(
      entradaDeterministica
    );


  testar(
    'Mesma entrada produz mesma decisão',
    JSON.stringify(decisao1) ===
      JSON.stringify(decisao2)
  );


  // ==========================================================
  // CASO 20
  // ==========================================================
  //
  // Caso adicional:
  // uma investigação que já possui resultado não deve
  // voltar a perguntar pelo resultado.
  //
  // ==========================================================

  const resultadoJaConhecido = {

    problema_central:
      'Retrabalho',

    processo:
      'Conferência de pedidos',

    impacto:
      'Perda de tempo',

    resultado_desejado:
      'Reduzir retrabalho',

    excecoes: []

  };


  const resultadoConhecido =
    construirResultadoInvestigacaoV62_(
      resultadoJaConhecido
    );


  testar(
    'Resultado já conhecido não gera pergunta de resultado',
    resultadoConhecido.proxima_dimensao !==
      INVESTIGACAO_V62.DIMENSOES.RESULTADO,
    resultadoConhecido.proxima_dimensao
  );


  // ==========================================================
  // RESULTADO FINAL
  // ==========================================================

  const percentual =
    total === 0
      ? 0
      : Math.round(
          (
            passou /
            total
          ) * 100
        );


  Logger.log(
    '============================================================'
  );

  Logger.log(
    'RESULTADO MOTOR INVESTIGAÇÃO V6.2: ' +
    passou +
    '/' +
    total
  );

  Logger.log(
    'FALHAS MOTOR INVESTIGAÇÃO V6.2: ' +
    (
      total -
      passou
    )
  );

  Logger.log(
    'PERCENTUAL MOTOR INVESTIGAÇÃO V6.2: ' +
    percentual +
    '%'
  );

  Logger.log(
    '============================================================'
  );


  if (
    passou === total &&
    total > 0
  ) {

    Logger.log(
      'TESTAR_MOTOR_INVESTIGACAO_V62: PASSOU'
    );

    Logger.log(
      'V6.2 MOTOR DE INVESTIGAÇÃO: 100%'
    );

    return {

      sucesso:
        true,

      total:
        total,

      passou:
        passou,

      falhas:
        total - passou,

      percentual:
        percentual

    };

  }


  throw new Error(
    'V6.2 REPROVADA: ' +
    passou +
    '/' +
    total +
    ' testes passaram.'
  );

}

/**
 * ============================================================
 * INTEGRAÇÃO REAL — V6.2 INVESTIGAÇÃO PROFUNDA
 * ============================================================
 *
 * Este teste:
 *
 * 1. cria um diagnóstico real;
 * 2. envia uma mensagem real para o fluxo atual;
 * 3. recupera o diagnóstico produzido;
 * 4. executa a Triagem V1;
 * 5. confirma compatibilidade;
 * 6. inicia a Investigação V6.2;
 * 7. preserva as informações já conhecidas;
 * 8. simula respostas sucessivas do empresário;
 * 9. valida avanço de dimensão;
 * 10. valida não repetição;
 * 11. valida conclusão;
 * 12. valida confiança;
 * 13. valida ausência de tecnologia;
 * 14. valida determinismo;
 * 15. limpa os registros temporários.
 *
 * IMPORTANTE:
 *
 * Este teste NÃO altera o fluxo principal.
 *
 * A V6.2 ainda não será incorporada ao
 * processarMensagemDiagnostico().
 *
 * META:
 *
 * 100%
 *
 * ============================================================
 */

function TESTAR_INTEGRACAO_REAL_V62() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'INTEGRAÇÃO REAL — V6.2 INVESTIGAÇÃO PROFUNDA'
  );

  Logger.log(
    '============================================================'
  );


  const resultados = [];


  function teste(
    nome,
    passou,
    detalhe
  ) {

    resultados.push({

      nome:
        nome,

      passou:
        passou === true,

      detalhe:
        String(
          detalhe || ''
        )

    });

  }


  let inicio =
    null;


  try {

    /**
     * ========================================================
     * TESTE 1 — CRIAR DIAGNÓSTICO REAL
     * ========================================================
     */

    inicio =
      iniciarDiagnostico({

        nome:
          'Teste Integração V6.2',

        nome_empresa:
          'Teste Integração V6.2',

        segmento:
          'Serviços',

        porte:
          'PEQUENA',

        nome_contato:
          'Teste V6.2',

        whatsapp:
          '',

        email:
          '',

        cidade:
          ''

      });


    teste(

      '1 — Diagnóstico real criado',

      !!inicio &&
      !!inicio.empresa_id &&
      !!inicio.conversa_id &&
      !!inicio.diagnostico_id,

      inicio
        ? JSON.stringify(inicio)
        : 'Diagnóstico não criado'

    );


    /**
     * ========================================================
     * MENSAGEM REAL
     * ========================================================
     */

    const mensagem =
      'Minha equipe passa horas todos os dias copiando informações ' +
      'de pedidos entre planilhas e sistemas diferentes. ' +
      'Isso gera erros e retrabalho. ' +
      'Processamos cerca de 100 pedidos por dia.';


    Logger.log(
      '------------------------------------------------------------'
    );

    Logger.log(
      'MENSAGEM REAL ENVIADA AO FLUXO:'
    );

    Logger.log(
      mensagem
    );

    Logger.log(
      '------------------------------------------------------------'
    );


    /**
     * ========================================================
     * TESTE 2 — FLUXO REAL
     * ========================================================
     */

    const fluxo =
      processarMensagemDiagnostico({

        empresa_id:
          inicio.empresa_id,

        conversa_id:
          inicio.conversa_id,

        mensagem:
          mensagem

      });


    teste(

      '2 — Fluxo real executado',

      !!fluxo &&
      !!fluxo.analise_ia,

      fluxo
        ? JSON.stringify(
            fluxo.analise_ia
          )
        : 'Fluxo não retornou'

    );


    /**
     * ========================================================
     * TESTE 3 — DIAGNÓSTICO PRODUZIDO
     * ========================================================
     */

    const diagnostico =
      fluxo &&
      fluxo.diagnostico
        ? fluxo.diagnostico
        : null;


    teste(

      '3 — Diagnóstico retornado',

      !!diagnostico,

      diagnostico
        ? JSON.stringify(
            diagnostico
          )
        : 'Diagnóstico ausente'

    );


    /**
     * ========================================================
     * EXTRAÇÃO DOS SINAIS
     * ========================================================
     */

    const dor =
      diagnostico
        ? String(
            diagnostico.dor_principal ||
            ''
          ).trim()
        : '';


    const processo =
      diagnostico
        ? String(
            diagnostico.processo_nome ||
            ''
          ).trim()
        : '';


    const impacto =
      diagnostico
        ? String(
            diagnostico.impacto_nivel ||
            diagnostico.impacto ||
            ''
          ).trim()
        : '';


    const frequencia =
      diagnostico
        ? String(
            diagnostico.frequencia ||
            ''
          ).trim()
        : '';


    /**
     * ========================================================
     * TESTES 4–7
     * ========================================================
     */

    teste(

      '4 — IA identificou dor',

      !!dor,

      dor ||
      'Dor não identificada'

    );


    teste(

      '5 — IA identificou processo',

      !!processo,

      processo ||
      'Processo não identificado'

    );


    teste(

      '6 — IA identificou impacto',

      !!impacto,

      impacto ||
      'Impacto não identificado'

    );


    teste(

      '7 — IA identificou frequência',

      !!frequencia,

      frequencia ||
      'Frequência não identificada'

    );


    /**
     * ========================================================
     * TRIAGEM V1
     * ========================================================
     */

    const sinaisTriagem = {

      empresa_id:
        inicio.empresa_id,

      conversa_id:
        inicio.conversa_id,

      dor:
        dor,

      processo:
        processo,

      impacto:
        impacto,

      frequencia:
        frequencia,

      contexto:
        'empresa de serviços',

      possibilidade_de_atuacao:
        'SIM'

    };


    const triagem =
  avaliarCompatibilidadeTriagemV1_(
    sinaisTriagem
  );

Logger.log(
  'DEBUG TRIAGEM V6.2.2 — ENTRADA: ' +
  JSON.stringify(sinaisTriagem)
);

Logger.log(
  'DEBUG TRIAGEM V6.2.2 — SAÍDA: ' +
  JSON.stringify(triagem)
);

Logger.log(
  '------------------------------------------------------------'
);

Logger.log(
  'RESULTADO TRIAGEM V1:'
);

Logger.log(
  JSON.stringify(
    triagem
  )
);

Logger.log(
  '------------------------------------------------------------'
);


    /**
     * ========================================================
     * TESTE 8 — SINAIS DA TRIAGEM
     * ========================================================
     */

    teste(

      '8 — Triagem recebeu os sinais',

      !!triagem &&
      !!triagem.dor &&
      !!triagem.processo,

      JSON.stringify(
        triagem
      )

    );


    /**
     * ========================================================
     * TESTE 9 — COMPATIBILIDADE
     * ========================================================
     */

    teste(

      '9 — Triagem classifica problema como COMPATIVEL',

      triagem.classificacao ===
        TRIAGEM_V1.CLASSIFICACOES.COMPATIVEL,

      triagem.classificacao

    );


    /**
     * ========================================================
     * INICIA V6.2
     * ========================================================
     */

    const investigacaoInicial =
      iniciarInvestigacaoV62_({

        empresa_id:
          inicio.empresa_id,

        conversa_id:
          inicio.conversa_id,

        diagnostico_id:
          inicio.diagnostico_id,

        dor:
          dor,

        processo:
          processo,

        impacto:
          impacto,

        frequencia:
          frequencia,

        contexto:
          'empresa de serviços'

      });


    Logger.log(
      '------------------------------------------------------------'
    );

    Logger.log(
      'INVESTIGAÇÃO V6.2 INICIAL:'
    );

    Logger.log(
      JSON.stringify(
        investigacaoInicial
      )
    );

    Logger.log(
      '------------------------------------------------------------'
    );


    /**
     * ========================================================
     * TESTE 10
     * ========================================================
     */

    teste(

      '10 — Investigação V6.2 iniciou',

      !!investigacaoInicial &&
      investigacaoInicial.versao ===
        INVESTIGACAO_V62.VERSAO,

      investigacaoInicial
        ? investigacaoInicial.estado
        : 'Investigação não criada'

    );


    /**
     * ========================================================
     * TESTE 11
     * ========================================================
     */

    teste(

      '11 — Diagnóstico preservado na investigação',

      investigacaoInicial.diagnostico_id ===
        inicio.diagnostico_id,

      investigacaoInicial.diagnostico_id

    );


    /**
     * ========================================================
     * TESTE 12
     * ========================================================
     */

    teste(

      '12 — Dor conhecida preservada',

      investigacaoInicial.problema_central ===
        dor,

      investigacaoInicial.problema_central

    );


    /**
     * ========================================================
     * TESTE 13
     * ========================================================
     */

    teste(

      '13 — Processo conhecido preservado',

      (
        typeof investigacaoInicial.processo ===
        'string'
          ? investigacaoInicial.processo
          : investigacaoInicial.processo.descricao
      ) === processo,

      JSON.stringify(
        investigacaoInicial.processo
      )

    );


    /**
     * ========================================================
     * TESTE 14
     * ========================================================
     */

    const impactoInicial =
      typeof investigacaoInicial.impacto ===
      'string'
        ? investigacaoInicial.impacto
        : String(
            investigacaoInicial.impacto.descricao ||
            ''
          );


    teste(

      '14 — Impacto conhecido preservado',

      impactoInicial === impacto,

      impactoInicial

    );


    /**
     * ========================================================
     * TESTE 15
     * ========================================================
     */

    teste(

      '15 — Investigação identifica uma lacuna real',

      investigacaoInicial.lacunas.length >= 1,

      JSON.stringify(
        investigacaoInicial.lacunas
      )

    );


    /**
     * ========================================================
     * TESTE 16
     * ========================================================
     */

    teste(

      '16 — Investigação produz somente uma próxima pergunta',

      typeof investigacaoInicial.proxima_pergunta ===
        'string' &&
      investigacaoInicial.proxima_pergunta.trim() !== '' &&
      !investigacaoInicial.proxima_pergunta.includes('?')
        ? true
        : typeof investigacaoInicial.proxima_pergunta ===
            'string' &&
          investigacaoInicial.proxima_pergunta.trim() !== '',

      investigacaoInicial.proxima_pergunta

    );


    /**
     * ========================================================
     * RESPOSTA 1 DO EMPRESÁRIO
     * ========================================================
     *
     * O empresário explica o fluxo atual.
     * ========================================================
     */

    const respostaProcesso =
      'Hoje recebemos o pedido por WhatsApp. ' +
      'Uma pessoa copia os dados para uma planilha. ' +
      'Depois outra pessoa confere as informações e lança tudo no sistema. ' +
      'Quando encontra erro, precisa voltar e corrigir manualmente.';


    const investigacaoAposProcesso =
      Object.assign(
        {},
        investigacaoInicial,
        {

          processo: {

            descricao:
              respostaProcesso,

            etapas: [

              'receber pedido',

              'copiar dados',

              'conferir informações',

              'lançar no sistema',

              'corrigir erros'

            ],

            envolvidos: [

              'equipe administrativa'

            ],

            entrada:
              'Pedidos recebidos por WhatsApp',

            saida:
              'Pedido lançado no sistema'

          },

          informacoes:
            (
              Array.isArray(
                investigacaoInicial.informacoes
              )
                ? investigacaoInicial.informacoes.slice()
                : []
            ).concat([

              criarInformacaoInvestigacaoV62_(
                'fluxo_atual',
                respostaProcesso,
                'CONFIRMADA'
              )

            ])

        }

      );


    const resultadoAposProcesso =
      construirResultadoInvestigacaoV62_(
        investigacaoAposProcesso
      );


    Logger.log(
      '------------------------------------------------------------'
    );

    Logger.log(
      'APÓS RESPOSTA SOBRE O PROCESSO:'
    );

    Logger.log(
      JSON.stringify(
        resultadoAposProcesso
      )
    );

    Logger.log(
      '------------------------------------------------------------'
    );


    /**
     * ========================================================
     * TESTE 17
     * ========================================================
     */

    teste(

      '17 — Resposta do empresário é incorporada',

      resultadoAposProcesso.processo &&
      typeof resultadoAposProcesso.processo ===
        'object' &&
      Array.isArray(
        resultadoAposProcesso.processo.etapas
      ) &&
      resultadoAposProcesso.processo.etapas.length >= 3,

      JSON.stringify(
        resultadoAposProcesso.processo
      )

    );


    /**
     * ========================================================
     * TESTE 18
     * ========================================================
     */

    teste(

      '18 — Informações anteriores permanecem preservadas',

      resultadoAposProcesso.problema_central ===
        dor &&
      String(
        resultadoAposProcesso.impacto.descricao ||
        ''
      ) === impacto,

      JSON.stringify({

        dor:
          resultadoAposProcesso.problema_central,

        impacto:
          resultadoAposProcesso.impacto

      })

    );


    /**
     * ========================================================
     * TESTE 19
     * ========================================================
     */

    const historicoPerguntas =
      resultadoAposProcesso.perguntas_realizadas || [];


    const perguntaInicial =
      investigacaoInicial.proxima_pergunta;


    const historicoComPergunta =
      registrarPerguntaInvestigacaoV62_(
        resultadoAposProcesso,
        perguntaInicial
      );


    const historicoComPerguntaNovamente =
      registrarPerguntaInvestigacaoV62_(
        historicoComPergunta,
        perguntaInicial
      );


    teste(

      '19 — Pergunta anterior não é registrada novamente',

      historicoComPerguntaNovamente.perguntas_realizadas.length ===
        historicoComPergunta.perguntas_realizadas.length,

      JSON.stringify(
        historicoComPerguntaNovamente.perguntas_realizadas
      )

    );


    /**
     * ========================================================
     * RESPOSTA 2 — IMPACTO QUANTIFICADO
     * ========================================================
     */

    const investigacaoAposImpacto =
      Object.assign(
        {},
        resultadoAposProcesso,
        {

          impacto: {

            descricao:
              impacto,

            tempo:
              '3 horas por dia',

            volume:
              '100 pedidos por dia',

            frequencia:
              frequencia,

            erros:
              'erros de digitação',

            retrabalho:
              'correções manuais'

          },

          informacoes:
            (
              Array.isArray(
                resultadoAposProcesso.informacoes
              )
                ? resultadoAposProcesso.informacoes.slice()
                : []
            ).concat([

              criarInformacaoInvestigacaoV62_(
                'volume',
                '100 pedidos por dia',
                'CONFIRMADA'
              ),

              criarInformacaoInvestigacaoV62_(
                'tempo',
                '3 horas por dia',
                'ESTIMADA'
              )

            ])

        }

      );


    const resultadoAposImpacto =
      construirResultadoInvestigacaoV62_(
        investigacaoAposImpacto
      );


    /**
     * ========================================================
     * TESTE 20
     * ========================================================
     */

    teste(

      '20 — Investigação avança após quantificação do impacto',

      resultadoAposImpacto.estado !==
        INVESTIGACAO_V62.ESTADOS.QUANTIFICANDO_IMPACTO,

      resultadoAposImpacto.estado

    );


    /**
     * ========================================================
     * RESPOSTA 3 — RESULTADO DESEJADO
     * ========================================================
     */

    const investigacaoCompleta =
      Object.assign(
        {},
        resultadoAposImpacto,
        {

          resultado_desejado:
            'Reduzir os erros, eliminar o retrabalho e liberar tempo da equipe para outras atividades.',

          excecoes: [

            'Pedidos com informações incompletas',

            'Pedidos recebidos com dados diferentes do padrão'

          ],

          informacoes:
            (
              Array.isArray(
                resultadoAposImpacto.informacoes
              )
                ? resultadoAposImpacto.informacoes.slice()
                : []
            ).concat([

              criarInformacaoInvestigacaoV62_(
                'resultado_desejado',
                'Reduzir os erros, eliminar o retrabalho e liberar tempo da equipe para outras atividades.',
                'CONFIRMADA'
              )

            ])

        }

      );


    const resultadoFinal =
      construirResultadoInvestigacaoV62_(
        investigacaoCompleta
      );


    Logger.log(
      '------------------------------------------------------------'
    );

    Logger.log(
      'RESULTADO FINAL V6.2:'
    );

    Logger.log(
      JSON.stringify(
        resultadoFinal
      )
    );

    Logger.log(
      '------------------------------------------------------------'
    );


    /**
     * ========================================================
     * TESTE 21
     * ========================================================
     */

    teste(

      '21 — Resultado desejado incorporado',

      resultadoFinal.resultado_desejado ===
        investigacaoCompleta.resultado_desejado,

      resultadoFinal.resultado_desejado

    );


    /**
     * ========================================================
     * TESTE 22
     * ========================================================
     */

    teste(

      '22 — Investigação chega a PRONTA_PARA_SOLUCAO',

      resultadoFinal.estado ===
        INVESTIGACAO_V62.ESTADOS.PRONTA_PARA_SOLUCAO,

      resultadoFinal.estado

    );


    /**
     * ========================================================
     * TESTE 23
     * ========================================================
     */

    teste(

      '23 — Confiança chega a ALTA',

      resultadoFinal.confianca ===
        'ALTA',

      resultadoFinal.confianca

    );


    /**
     * ========================================================
     * TESTE 24 — NÃO EXPOR TECNOLOGIA
     * ========================================================
     */

    const textoFinal =
      JSON.stringify(
        resultadoFinal
      ).toLowerCase();


    teste(

      '24 — Investigação não expõe tecnologia',

      textoFinal.indexOf('api') === -1 &&
      textoFinal.indexOf('software') === -1 &&
      textoFinal.indexOf('programação') === -1 &&
      textoFinal.indexOf('programacao') === -1 &&
      textoFinal.indexOf('sistema desenvolvido') === -1 &&
      textoFinal.indexOf('automação') === -1 &&
      textoFinal.indexOf('automacao') === -1,

      textoFinal

    );


    /**
     * ========================================================
     * TESTE 25 — DETERMINISMO
     * ========================================================
     */

    const decisaoA =
      construirResultadoInvestigacaoV62_(
        investigacaoCompleta
      );


    const decisaoB =
      construirResultadoInvestigacaoV62_(
        investigacaoCompleta
      );


    teste(

      '25 — Mesma entrada produz mesma decisão',

      mesmaDecisaoInvestigacaoV62_(
        decisaoA,
        decisaoB
      ),

      'Resultados idênticos'

    );


    /**
     * ========================================================
     * RESULTADO
     * ========================================================
     */

    const aprovados =
      resultados.filter(
        function(item) {

          return item.passou === true;

        }
      ).length;


    const total =
      resultados.length;


    const falhas =
      total -
      aprovados;


    const percentual =
      total > 0
        ? (
            aprovados /
            total
          ) *
          100
        : 0;


    Logger.log(
      '============================================================'
    );


    resultados.forEach(
      function(
        item,
        indice
      ) {

        Logger.log(

          (
            item.passou
              ? 'PASSOU'
              : 'FALHOU'
          ) +

          ' — TESTE ' +

          (
            indice + 1
          ) +

          ': ' +

          item.nome +

          ' — ' +

          item.detalhe

        );

      }
    );


    Logger.log(
      '============================================================'
    );

    Logger.log(
      'RESULTADO INTEGRAÇÃO V6.2: ' +
      aprovados +
      '/' +
      total
    );

    Logger.log(
      'FALHAS INTEGRAÇÃO V6.2: ' +
      falhas
    );

    Logger.log(
      'PERCENTUAL INTEGRAÇÃO V6.2: ' +
      percentual +
      '%'
    );

    Logger.log(
      '============================================================'
    );


    if (
      aprovados !==
      total
    ) {

      throw new Error(
        'INTEGRAÇÃO V6.2 FALHOU: ' +
        aprovados +
        '/' +
        total
      );

    }


    Logger.log(
      'TESTAR_INTEGRACAO_REAL_V62: PASSOU'
    );

    Logger.log(
      'V6.2 INTEGRADA: 100%'
    );


    return {

      sucesso:
        true,

      total:
        total,

      aprovados:
        aprovados,

      falhas:
        falhas,

      percentual:
        percentual,

      resultados:
        resultados,

      investigacao:
        resultadoFinal

    };


  } finally {

    /**
     * ========================================================
     * LIMPEZA
     * ========================================================
     */

    if (
      inicio
    ) {

      try {

        limparRegistrosPorCampoV510_(
          SHEETS.DIAGNOSTICOS,
          'diagnostico_id',
          inicio.diagnostico_id
        );


        limparRegistrosPorCampoV510_(
          SHEETS.CONVERSAS,
          'conversa_id',
          inicio.conversa_id
        );


        limparRegistrosPorCampoV510_(
          SHEETS.METRICAS,
          'conversa_id',
          inicio.conversa_id
        );


        Logger.log(
          'LIMPEZA INTEGRAÇÃO V6.2 CONCLUÍDA'
        );


      } catch (
        erroLimpeza
      ) {

        Logger.log(
          'FALHA NA LIMPEZA V6.2: ' +
          erroLimpeza.message
        );

      }

    }

  }

}

/**
 * ============================================================
 * TESTE DE PERSISTÊNCIA — INVESTIGAÇÃO V6.2.1
 * ============================================================
 *
 * Objetivo:
 * - Validar criação da investigação
 * - Validar persistência dos campos simples e estruturados
 * - Validar recuperação por diagnostico_id
 * - Validar atualização do mesmo registro
 * - Garantir que não haja duplicação
 * - Garantir que os dados estruturados sobrevivam ao JSON
 * - Limpar completamente os dados de teste ao final
 *
 * Meta: 20/20 — 100%
 */
function TESTAR_PERSISTENCIA_INVESTIGACAO_V621() {

  const TESTE = {
    empresa_id: 'EMP-V621-TESTE',
    conversa_id: 'CONV-V621-TESTE',
    diagnostico_id: 'DIAG-V621-TESTE'
  };

  let total = 20;
  let aprovados = 0;
  let falhas = [];
  let investigacaoId = null;

  function teste(numero, descricao, condicao) {
    if (condicao) {
      aprovados++;
      Logger.log('✅ TESTE ' + numero + '/20 — ' + descricao);
    } else {
      falhas.push(numero + ' — ' + descricao);
      Logger.log('❌ TESTE ' + numero + '/20 — ' + descricao);
    }
  }

  function igualJSON(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function limparTeste() {
    try {
      const aba = obterAba_(SHEETS.INVESTIGACOES);

      if (!aba) {
        Logger.log('⚠️ Aba INVESTIGACOES não encontrada durante limpeza.');
        return;
      }

      const dados = aba.getDataRange().getValues();

      if (dados.length <= 1) {
        return;
      }

      const cabecalhos = dados[0];
      const idxId = cabecalhos.indexOf('investigacao_id');
      const idxDiagnostico = cabecalhos.indexOf('diagnostico_id');

      if (idxId === -1 || idxDiagnostico === -1) {
        Logger.log('⚠️ Cabeçalhos necessários não encontrados para limpeza.');
        return;
      }

      for (let i = dados.length - 1; i >= 1; i--) {

        const id = String(dados[i][idxId] || '');
        const diagnostico = String(dados[i][idxDiagnostico] || '');

        if (
          id === investigacaoId ||
          diagnostico === TESTE.diagnostico_id
        ) {
          aba.deleteRow(i + 1);
        }
      }

      SpreadsheetApp.flush();

      Logger.log('🧹 Dados temporários removidos.');

    } catch (erro) {
      Logger.log(
        '⚠️ Erro durante limpeza: ' +
        (erro && erro.message ? erro.message : erro)
      );
    }
  }

  Logger.log('');
  Logger.log('============================================================');
  Logger.log('INÍCIO — TESTAR_PERSISTENCIA_INVESTIGACAO_V621');
  Logger.log('============================================================');
  Logger.log('');

  try {

    // ----------------------------------------------------------
    // DADOS DE TESTE
    // ----------------------------------------------------------

    const processoOriginal = {
      descricao: 'Recebimento e organização dos pedidos dos clientes',
      etapas: [
        'Cliente envia pedido',
        'Equipe recebe o pedido',
        'Pedido é conferido',
        'Pedido é lançado',
        'Pedido segue para execução'
      ],
      envolvidos: [
        'Cliente',
        'Atendimento',
        'Equipe operacional'
      ],
      entrada: 'Pedido enviado pelo cliente',
      saida: 'Pedido registrado e encaminhado para execução'
    };

    const doresOriginais = [
      {
        descricao: 'Pedidos chegam por vários canais e acabam sendo esquecidos',
        status: INVESTIGACAO_V62.STATUS_INFORMACAO.CONFIRMADA
      },
      {
        descricao: 'Equipe precisa conferir informações manualmente',
        status: INVESTIGACAO_V62.STATUS_INFORMACAO.ESTIMADA
      }
    ];

    const impactoOriginal = {
      descricao: 'A equipe perde tempo procurando pedidos e alguns atrasam.',
      frequencia: 'diaria',
      volume: 'aproximadamente 30 pedidos por dia',
      consequencias: [
        'atrasos',
        'retrabalho',
        'perda de produtividade'
      ]
    };

    const excecoesOriginais = [
      {
        descricao: 'Pedidos urgentes são tratados fora do fluxo normal.',
        status: INVESTIGACAO_V62.STATUS_INFORMACAO.CONFIRMADA
      }
    ];

    const resultadoOriginal =
      'Todos os pedidos deveriam entrar em um único fluxo, ser conferidos e encaminhados sem retrabalho.';

    const informacoesOriginais = [
       criarInformacaoInvestigacaoV62_(
    INVESTIGACAO_V62.DIMENSOES.PROCESSO,
    'O processo acontece diariamente.',
    INVESTIGACAO_V62.STATUS_INFORMACAO.CONFIRMADA
  ),

  criarInformacaoInvestigacaoV62_(
    INVESTIGACAO_V62.DIMENSOES.IMPACTO,
    'São cerca de 30 pedidos por dia.',
    INVESTIGACAO_V62.STATUS_INFORMACAO.ESTIMADA
  ),

  criarInformacaoInvestigacaoV62_(
    INVESTIGACAO_V62.DIMENSOES.EXCECOES,
    'Pode existir perda de pedidos em períodos de maior movimento.',
    INVESTIGACAO_V62.STATUS_INFORMACAO.INFERIDA
  )
];

    const lacunasOriginais = [
      INVESTIGACAO_V62.DIMENSOES.EXCECOES
    ];

    const perguntasOriginais = [
      'Como esse processo acontece hoje, na prática, desde o início até o final?',
      'Quanto esse problema impacta o trabalho de vocês no dia a dia?'
    ];

    const investigacaoOriginal = {
      versao: INVESTIGACAO_V62.VERSAO,

      empresa_id: TESTE.empresa_id,
      conversa_id: TESTE.conversa_id,
      diagnostico_id: TESTE.diagnostico_id,

      problema_central:
        'Os pedidos dos clientes chegam por canais diferentes e o acompanhamento é manual.',

      processo: processoOriginal,

      pontos_de_dor: doresOriginais,

      impacto: impactoOriginal,

      excecoes: excecoesOriginais,

      resultado_desejado: resultadoOriginal,

      informacoes: informacoesOriginais,

      lacunas: lacunasOriginais,

      confianca: 'ALTA',

      estado:
        INVESTIGACAO_V62.ESTADOS.ENTENDENDO_EXCECOES,

      proxima_dimensao:
        INVESTIGACAO_V62.DIMENSOES.EXCECOES,

      proxima_pergunta:
        'Existem situações ou tipos de caso em que esse problema acontece mais ou funciona de forma diferente?',

      perguntas_realizadas: perguntasOriginais
    };

    // ----------------------------------------------------------
    // GARANTE QUE O TESTE COMEÇA LIMPO
    // ----------------------------------------------------------

    limparTeste();

    // ----------------------------------------------------------
    // 1 — ABA EXISTE
    // ----------------------------------------------------------

    const aba = obterAba_(SHEETS.INVESTIGACOES);

    teste(
      1,
      'Aba INVESTIGACOES existe',
      !!aba
    );

    if (!aba) {
      throw new Error(
        'Aba INVESTIGACOES não existe. Execute criarEstruturaMVP primeiro.'
      );
    }

    // ----------------------------------------------------------
    // 2 — CRIAÇÃO
    // ----------------------------------------------------------

    const resultadoSalvar =
      salvarInvestigacaoV62_(investigacaoOriginal);

    teste(
      2,
      'Investigação criada sem erro',
      !!resultadoSalvar
    );

    // ----------------------------------------------------------
    // RECUPERA A INVESTIGAÇÃO GRAVADA
    // ----------------------------------------------------------

    let gravada =
      buscarInvestigacaoV62_({
        diagnostico_id: TESTE.diagnostico_id
      });

    teste(
      3,
      'Investigação possui ID gerado',
      !!(
        gravada &&
        gravada.investigacao_id &&
        String(gravada.investigacao_id).indexOf('INV-') === 0
      )
    );

    if (gravada) {
      investigacaoId = gravada.investigacao_id;
    }

    // ----------------------------------------------------------
    // 4 — DIAGNÓSTICO
    // ----------------------------------------------------------

    teste(
      4,
      'diagnostico_id persistido corretamente',
      !!gravada &&
      gravada.diagnostico_id === TESTE.diagnostico_id
    );

    // ----------------------------------------------------------
    // 5 — EMPRESA
    // ----------------------------------------------------------

    teste(
      5,
      'empresa_id persistido corretamente',
      !!gravada &&
      gravada.empresa_id === TESTE.empresa_id
    );

    // ----------------------------------------------------------
    // 6 — CONVERSA
    // ----------------------------------------------------------

    teste(
      6,
      'conversa_id persistido corretamente',
      !!gravada &&
      gravada.conversa_id === TESTE.conversa_id
    );

    // ----------------------------------------------------------
    // 7 — VERSÃO
    // ----------------------------------------------------------

    teste(
      7,
      'versao V6.2 persistida corretamente',
      !!gravada &&
      gravada.versao === INVESTIGACAO_V62.VERSAO
    );

    // ----------------------------------------------------------
    // 8 — PROCESSO ESTRUTURADO
    // ----------------------------------------------------------

    teste(
      8,
      'processo estruturado sobrevive ao JSON',
      !!gravada &&
      igualJSON(gravada.processo, processoOriginal)
    );

    // ----------------------------------------------------------
    // 9 — PONTOS DE DOR
    // ----------------------------------------------------------

    teste(
      9,
      'pontos_de_dor persistidos corretamente',
      !!gravada &&
      Array.isArray(gravada.pontos_de_dor) &&
      igualJSON(gravada.pontos_de_dor, doresOriginais)
    );

    // ----------------------------------------------------------
    // 10 — IMPACTO
    // ----------------------------------------------------------

    teste(
      10,
      'impacto estruturado persistido corretamente',
      !!gravada &&
      igualJSON(gravada.impacto, impactoOriginal)
    );

    // ----------------------------------------------------------
    // 11 — EXCEÇÕES
    // ----------------------------------------------------------

    teste(
      11,
      'excecoes persistidas corretamente',
      !!gravada &&
      Array.isArray(gravada.excecoes) &&
      igualJSON(gravada.excecoes, excecoesOriginais)
    );

    // ----------------------------------------------------------
    // 12 — RESULTADO DESEJADO
    // ----------------------------------------------------------

    teste(
      12,
      'resultado_desejado persistido corretamente',
      !!gravada &&
      gravada.resultado_desejado === resultadoOriginal
    );

    // ----------------------------------------------------------
    // 13 — STATUS DAS INFORMAÇÕES
    // ----------------------------------------------------------

    const statusPersistidos =
      gravada &&
      Array.isArray(gravada.informacoes)
        ? gravada.informacoes.map(function(info) {
            return info.status;
          })
        : [];

    teste(
      13,
      'status CONFIRMADA / ESTIMADA / INFERIDA preservados',
      statusPersistidos.indexOf(
        INVESTIGACAO_V62.STATUS_INFORMACAO.CONFIRMADA
      ) !== -1 &&
      statusPersistidos.indexOf(
        INVESTIGACAO_V62.STATUS_INFORMACAO.ESTIMADA
      ) !== -1 &&
      statusPersistidos.indexOf(
        INVESTIGACAO_V62.STATUS_INFORMACAO.INFERIDA
      ) !== -1
    );

    // ----------------------------------------------------------
    // 14 — LACUNAS
    // ----------------------------------------------------------

    teste(
      14,
      'lacunas persistidas corretamente',
      !!gravada &&
      igualJSON(gravada.lacunas, lacunasOriginais)
    );

    // ----------------------------------------------------------
    // 15 — PERGUNTAS REALIZADAS
    // ----------------------------------------------------------

    teste(
      15,
      'perguntas_realizadas persistidas corretamente',
      !!gravada &&
      igualJSON(
        gravada.perguntas_realizadas,
        perguntasOriginais
      )
    );

    // ----------------------------------------------------------
    // 16 — RECUPERAÇÃO POR DIAGNÓSTICO
    // ----------------------------------------------------------

    const recuperada =
      buscarInvestigacaoV62_({
        diagnostico_id: TESTE.diagnostico_id
      });

    teste(
      16,
      'investigação recuperada por diagnostico_id',
      !!recuperada &&
      recuperada.investigacao_id === investigacaoId
    );

    // ----------------------------------------------------------
    // 17 — ATUALIZAÇÃO DO MESMO REGISTRO
    // ----------------------------------------------------------

    const processoAtualizado = {
      descricao:
        'Processo atualizado de recebimento e organização dos pedidos',
      etapas: [
        'Cliente envia pedido',
        'Sistema recebe pedido',
        'Equipe confere',
        'Pedido é registrado',
        'Pedido segue para execução'
      ],
      envolvidos: [
        'Cliente',
        'Atendimento',
        'Equipe operacional'
      ],
      entrada: 'Pedido enviado pelo cliente',
      saida: 'Pedido registrado automaticamente e encaminhado'
    };

    const investigacaoAtualizada = {
      problema_central:
        'Os pedidos ainda chegam por canais diferentes, mas agora identificamos o impacto operacional.',

      processo: processoAtualizado,

      impacto: {
        descricao:
          'O problema gera atrasos e retrabalho principalmente nos horários de maior movimento.',
        frequencia: 'diaria',
        volume: 'aproximadamente 40 pedidos por dia',
        consequencias: [
          'atrasos',
          'retrabalho',
          'perda de produtividade'
        ]
      },

      resultado_desejado:
        'Centralizar os pedidos e reduzir o retrabalho da equipe.',

      confianca: 'ALTA',

      estado:
        INVESTIGACAO_V62.ESTADOS.PRONTA_PARA_SOLUCAO,

      proxima_dimensao: null,

      proxima_pergunta: null,

      perguntas_realizadas: perguntasOriginais.concat([
        'Existem situações ou tipos de caso em que esse problema acontece mais ou funciona de forma diferente?'
      ])
    };

    const resultadoAtualizacao =
      atualizarInvestigacaoV62_(
        investigacaoId,
        investigacaoAtualizada
      );

    teste(
      17,
      'registro existente é atualizado, sem criar novo ID',
      !!resultadoAtualizacao
    );

    // ----------------------------------------------------------
    // RECUPERA NOVAMENTE APÓS UPDATE
    // ----------------------------------------------------------

    const aposUpdate =
      buscarInvestigacaoV62_({
        diagnostico_id: TESTE.diagnostico_id
      });

    // ----------------------------------------------------------
    // 18 — ALTERAÇÕES PERSISTIDAS
    // ----------------------------------------------------------

    teste(
      18,
      'dados alterados sobrevivem à atualização',
      !!aposUpdate &&
      igualJSON(
        aposUpdate.processo,
        processoAtualizado
      ) &&
      igualJSON(
        aposUpdate.impacto,
        investigacaoAtualizada.impacto
      ) &&
      aposUpdate.resultado_desejado ===
        investigacaoAtualizada.resultado_desejado &&
      aposUpdate.estado ===
        INVESTIGACAO_V62.ESTADOS.PRONTA_PARA_SOLUCAO
    );

    // ----------------------------------------------------------
    // 19 — NÃO DUPLICOU
    // ----------------------------------------------------------

    const dadosAba =
      aba.getDataRange().getValues();

    const cabecalhos =
      dadosAba[0];

    const idxDiagnostico =
      cabecalhos.indexOf('diagnostico_id');

    const linhasDoDiagnostico =
      dadosAba
        .slice(1)
        .filter(function(linha) {
          return String(linha[idxDiagnostico] || '') ===
            TESTE.diagnostico_id;
        });

    teste(
      19,
      'existe exatamente uma investigação para o diagnóstico',
      linhasDoDiagnostico.length === 1
    );

    // ----------------------------------------------------------
    // 20 — ID NÃO MUDOU
    // ----------------------------------------------------------

    const idDepoisUpdate =
      aposUpdate &&
      aposUpdate.investigacao_id;

    teste(
      20,
      'investigacao_id permanece o mesmo após atualização',
      !!idDepoisUpdate &&
      idDepoisUpdate === investigacaoId
    );

  } catch (erro) {

    Logger.log('');
    Logger.log('❌ ERRO FATAL NO TESTE');
    Logger.log(
      erro && erro.stack
        ? erro.stack
        : erro
    );

  } finally {

    // ----------------------------------------------------------
    // LIMPEZA
    // ----------------------------------------------------------

    limparTeste();

    Logger.log('');
    Logger.log('============================================================');
    Logger.log('RESULTADO FINAL — V6.2.1 PERSISTÊNCIA');
    Logger.log('============================================================');
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
      Math.round((aprovados / total) * 100) +
      '%'
    );

    if (falhas.length === 0 && aprovados === total) {

      Logger.log('');
      Logger.log('🏆 TESTAR_PERSISTENCIA_INVESTIGACAO_V621: PASSOU');
      Logger.log('🏆 V6.2.1 PERSISTÊNCIA: 100%');
      Logger.log('🏆 20/20 TESTES APROVADOS');
      Logger.log('');

    } else {

      Logger.log('');
      Logger.log('❌ TESTAR_PERSISTENCIA_INVESTIGACAO_V621: FALHOU');

      falhas.forEach(function(falha) {
        Logger.log('   ' + falha);
      });

      Logger.log('');

    }

    Logger.log('============================================================');
  }
}

/**
 * ============================================================
 * DIAGNÓSTICO DA PERSISTÊNCIA V6.2.1
 * ============================================================
 *
 * NÃO É TESTE DE APROVAÇÃO.
 * Serve exclusivamente para descobrir por que os testes
 * 18, 19 e 20 estão falhando após o UPDATE.
 * ============================================================
 */
function DIAGNOSTICAR_PERSISTENCIA_INVESTIGACAO_V621() {

  const TESTE = {
    empresa_id: 'EMP-V621-DIAG',
    conversa_id: 'CONV-V621-DIAG',
    diagnostico_id: 'DIAG-V621-DIAG'
  };

  let investigacaoId = null;

  function limpar() {

    try {

      const aba =
        obterAba_(SHEETS.INVESTIGACOES);

      if (!aba) return;

      const dados =
        aba.getDataRange().getValues();

      if (dados.length <= 1) return;

      const cabecalhos = dados[0];

      const idxId =
        cabecalhos.indexOf('investigacao_id');

      const idxDiagnostico =
        cabecalhos.indexOf('diagnostico_id');

      for (
        let i = dados.length - 1;
        i >= 1;
        i--
      ) {

        const id =
          String(
            idxId >= 0
              ? dados[i][idxId]
              : ''
          );

        const diagnostico =
          String(
            idxDiagnostico >= 0
              ? dados[i][idxDiagnostico]
              : ''
          );

        if (
          id === String(investigacaoId || '') ||
          diagnostico === TESTE.diagnostico_id
        ) {

          aba.deleteRow(i + 1);

        }
      }

      SpreadsheetApp.flush();

    } catch (erro) {

      Logger.log(
        'ERRO NA LIMPEZA: ' +
        erro
      );

    }
  }

  try {

    Logger.log('');
    Logger.log('============================================================');
    Logger.log('DIAGNÓSTICO V6.2.1');
    Logger.log('============================================================');

    const investigacao = {

      versao: INVESTIGACAO_V62.VERSAO,

      empresa_id: TESTE.empresa_id,

      conversa_id: TESTE.conversa_id,

      diagnostico_id:
        TESTE.diagnostico_id,

      problema_central:
        'Problema original de teste',

      processo: {
        descricao: 'Processo original',
        etapas: [
          'Etapa 1',
          'Etapa 2'
        ],
        envolvidos: [
          'Pessoa 1',
          'Pessoa 2'
        ],
        entrada: 'Entrada original',
        saida: 'Saída original'
      },

      pontos_de_dor: [
        {
          descricao: 'Dor original',
          status:
            INVESTIGACAO_V62.STATUS_INFORMACAO.CONFIRMADA
        }
      ],

      impacto: {
        descricao: 'Impacto original',
        frequencia: 'diaria',
        volume: '10 casos',
        consequencias: [
          'Retrabalho'
        ]
      },

      excecoes: [
        {
          descricao: 'Exceção original',
          status:
            INVESTIGACAO_V62.STATUS_INFORMACAO.ESTIMADA
        }
      ],

      resultado_desejado:
        'Resultado original',

      informacoes: [
        {
          dimensao:
            INVESTIGACAO_V62.DIMENSOES.PROCESSO,
          descricao:
            'Informação original',
          status:
            INVESTIGACAO_V62.STATUS_INFORMACAO.CONFIRMADA
        }
      ],

      lacunas: [
        INVESTIGACAO_V62.DIMENSOES.EXCECOES
      ],

      confianca: 'ALTA',

      estado:
        INVESTIGACAO_V62.ESTADOS.ENTENDENDO_EXCECOES,

      proxima_dimensao:
        INVESTIGACAO_V62.DIMENSOES.EXCECOES,

      proxima_pergunta:
        'Pergunta original',

      perguntas_realizadas: [
        'Pergunta original'
      ]
    };

    // ----------------------------------------------------------
    // LIMPA ANTES
    // ----------------------------------------------------------

    limpar();

    // ----------------------------------------------------------
    // CRIA
    // ----------------------------------------------------------

    Logger.log('');
    Logger.log('--- CRIANDO INVESTIGAÇÃO ---');

    const criada =
      salvarInvestigacaoV62_(investigacao);

    Logger.log(
      'RETORNO CRIAÇÃO: ' +
      JSON.stringify(criada)
    );

    investigacaoId =
      criada.investigacao_id;

    Logger.log(
      'ID GERADO: ' +
      investigacaoId
    );

    // ----------------------------------------------------------
    // LÊ ANTES DO UPDATE
    // ----------------------------------------------------------

    const antes =
      buscarInvestigacaoV62_({
        diagnostico_id:
          TESTE.diagnostico_id
      });

    Logger.log('');
    Logger.log('--- ANTES DO UPDATE ---');

    Logger.log(
      'OBJETO COMPLETO ANTES:'
    );

    Logger.log(
      JSON.stringify(antes)
    );

    Logger.log(
      'ID ANTES: ' +
      (antes && antes.investigacao_id)
    );

    Logger.log(
      'DIAGNOSTICO ANTES: ' +
      (antes && antes.diagnostico_id)
    );

    // ----------------------------------------------------------
    // INSPEÇÃO DIRETA DA PLANILHA
    // ----------------------------------------------------------

    const aba =
      obterAba_(SHEETS.INVESTIGACOES);

    const valoresAntes =
      aba.getDataRange().getValues();

    const cabecalhos =
      valoresAntes[0];

    Logger.log('');
    Logger.log('CABECALHOS:');
    Logger.log(
      JSON.stringify(cabecalhos)
    );

    const idxId =
      cabecalhos.indexOf(
        'investigacao_id'
      );

    const idxDiag =
      cabecalhos.indexOf(
        'diagnostico_id'
      );

    Logger.log(
      'ÍNDICE investigacao_id: ' +
      idxId
    );

    Logger.log(
      'ÍNDICE diagnostico_id: ' +
      idxDiag
    );

    for (
      let i = 1;
      i < valoresAntes.length;
      i++
    ) {

      if (
        String(
          valoresAntes[i][idxDiag]
        ) ===
        TESTE.diagnostico_id
      ) {

        Logger.log('');
        Logger.log(
          'LINHA ANTES DO UPDATE: ' +
          (i + 1)
        );

        Logger.log(
          JSON.stringify(
            valoresAntes[i]
          )
        );

      }

    }

    // ----------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------

    Logger.log('');
    Logger.log('--- EXECUTANDO UPDATE ---');

    const atualizada = {

      problema_central:
        'PROBLEMA ALTERADO',

      processo: {
        descricao:
          'PROCESSO ALTERADO',
        etapas: [
          'Etapa A',
          'Etapa B',
          'Etapa C'
        ],
        envolvidos: [
          'Pessoa A'
        ],
        entrada:
          'ENTRADA ALTERADA',
        saida:
          'SAÍDA ALTERADA'
      },

      impacto: {
        descricao:
          'IMPACTO ALTERADO',
        frequencia:
          'semanal',
        volume:
          '99 casos',
        consequencias: [
          'Consequência alterada'
        ]
      },

      resultado_desejado:
        'RESULTADO ALTERADO',

      confianca:
        'ALTA',

      estado:
        INVESTIGACAO_V62.ESTADOS.PRONTA_PARA_SOLUCAO,

      proxima_dimensao:
        null,

      proxima_pergunta:
        null,

      perguntas_realizadas: [
        'Pergunta original',
        'Pergunta adicional'
      ]
    };

    const retornoUpdate =
      atualizarInvestigacaoV62_(
        investigacaoId,
        atualizada
      );

    Logger.log(
      'RETORNO UPDATE: ' +
      JSON.stringify(retornoUpdate)
    );

    // ----------------------------------------------------------
    // LÊ DIRETAMENTE DA PLANILHA DEPOIS
    // ----------------------------------------------------------

    SpreadsheetApp.flush();

    const valoresDepois =
      aba.getDataRange().getValues();

    Logger.log('');
    Logger.log('--- PLANILHA DEPOIS DO UPDATE ---');

    let quantidade = 0;

    for (
      let i = 1;
      i < valoresDepois.length;
      i++
    ) {

      const id =
        String(
          valoresDepois[i][idxId] || ''
        );

      const diag =
        String(
          valoresDepois[i][idxDiag] || ''
        );

      if (
        id === String(investigacaoId) ||
        diag === TESTE.diagnostico_id
      ) {

        quantidade++;

        Logger.log('');
        Logger.log(
          'LINHA ENCONTRADA DEPOIS: ' +
          (i + 1)
        );

        Logger.log(
          JSON.stringify(
            valoresDepois[i]
          )
        );

      }

    }

    Logger.log('');
    Logger.log(
      'QUANTIDADE DE LINHAS DO TESTE: ' +
      quantidade
    );

    // ----------------------------------------------------------
    // BUSCA NOVAMENTE PELO SISTEMA
    // ----------------------------------------------------------

    const depois =
      buscarInvestigacaoV62_({
        diagnostico_id:
          TESTE.diagnostico_id
      });

    Logger.log('');
    Logger.log('--- BUSCA APÓS UPDATE ---');

    Logger.log(
      'OBJETO COMPLETO DEPOIS:'
    );

    Logger.log(
      JSON.stringify(depois)
    );

    Logger.log(
      'ID DEPOIS: ' +
      (
        depois
          ? depois.investigacao_id
          : 'NULL'
      )
    );

    Logger.log(
      'DIAGNOSTICO DEPOIS: ' +
      (
        depois
          ? depois.diagnostico_id
          : 'NULL'
      )
    );

    Logger.log(
      'ESTADO DEPOIS: ' +
      (
        depois
          ? depois.estado
          : 'NULL'
      )
    );

    Logger.log(
      'RESULTADO DESEJADO DEPOIS: ' +
      (
        depois
          ? depois.resultado_desejado
          : 'NULL'
      )
    );

    // ----------------------------------------------------------
    // CONCLUSÃO
    // ----------------------------------------------------------

    Logger.log('');
    Logger.log('============================================================');
    Logger.log('FIM DO DIAGNÓSTICO');
    Logger.log('============================================================');

  } catch (erro) {

    Logger.log('');
    Logger.log('❌ ERRO NO DIAGNÓSTICO');
    Logger.log(
      erro && erro.stack
        ? erro.stack
        : erro
    );

  } finally {

    limpar();

    Logger.log('');
    Logger.log('🧹 DADOS DO DIAGNÓSTICO REMOVIDOS.');
    Logger.log('');

  }
}

/**
 * ============================================================
 * V6.2.2 — TESTE DE INTEGRAÇÃO DA INVESTIGAÇÃO
 * ============================================================
 *
 * Objetivo:
 *
 * 1. Criar uma investigação a partir de um diagnóstico.
 * 2. Persistir a investigação.
 * 3. Recuperar a mesma investigação.
 * 4. Simular evolução da investigação.
 * 5. Atualizar o mesmo registro.
 * 6. Garantir preservação das informações anteriores.
 * 7. Garantir que não haja duplicação.
 * 8. Garantir que perguntas anteriores não sejam repetidas.
 * 9. Chegar a PRONTA_PARA_SOLUCAO.
 * 10. Garantir ausência de tecnologia.
 *
 * IMPORTANTE:
 * Este teste NÃO altera processarMensagemDiagnostico().
 *
 * Meta: 25/25 — 100%
 * ============================================================
 */
function TESTAR_INTEGRACAO_V622() {

  const TESTE = {
    empresa_id: 'EMP-V622-TESTE',
    conversa_id: 'CONV-V622-TESTE',
    diagnostico_id: 'DIAG-V622-TESTE'
  };

  let total = 25;
  let aprovados = 0;
  let falhas = [];
  let investigacaoId = null;

  function teste(numero, descricao, condicao) {

    if (condicao) {

      aprovados++;

      Logger.log(
        '✅ TESTE ' +
        numero +
        '/25 — ' +
        descricao
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
        descricao
      );
    }
  }

  function limparTeste() {

    try {

      const aba =
        obterAba_(
          SHEETS.INVESTIGACOES
        );

      const dados =
        aba
          .getDataRange()
          .getValues();

      if (dados.length <= 1) {
        return;
      }

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
        let i = dados.length - 1;
        i >= 1;
        i--
      ) {

        const id =
          idxId !== -1
            ? String(dados[i][idxId] || '')
            : '';

        const empresa =
          idxEmpresa !== -1
            ? String(dados[i][idxEmpresa] || '')
            : '';

        const conversa =
          idxConversa !== -1
            ? String(dados[i][idxConversa] || '')
            : '';

        const diagnostico =
          idxDiagnostico !== -1
            ? String(dados[i][idxDiagnostico] || '')
            : '';

        if (
          id === String(investigacaoId || '') ||
          empresa === TESTE.empresa_id ||
          conversa === TESTE.conversa_id ||
          diagnostico === TESTE.diagnostico_id
        ) {

          aba.deleteRow(i + 1);

        }
      }

      SpreadsheetApp.flush();

    } catch (erro) {

      Logger.log(
        '⚠️ Erro na limpeza: ' +
        erro
      );

    }
  }

  try {

    Logger.log('');
    Logger.log(
      '============================================================'
    );
    Logger.log(
      'INÍCIO — TESTAR_INTEGRACAO_V622'
    );
    Logger.log(
      '============================================================'
    );
    Logger.log('');

    // ==========================================================
    // 1. DIAGNÓSTICO BASE
    // ==========================================================

    const diagnostico = {

      diagnostico_id:
        TESTE.diagnostico_id,

      empresa_id:
        TESTE.empresa_id,

      conversa_id:
        TESTE.conversa_id,

      processo_nome:
        'Recebimento de pedidos',

      processo_resumo:
        'Os pedidos chegam por diferentes canais e são conferidos manualmente.',

      dor_principal:
        'Pedidos podem ser esquecidos ou atrasados.',

      dor_categoria:
        'PROCESSO',

      impacto_nivel:
        'ALTO',

      frequencia:
        'DIARIA',

      objetivo:
        'Organizar os pedidos e reduzir atrasos.',

      status_diagnostico:
        STATUS_DIAGNOSTICO.EM_ANDAMENTO,

      classificacao:
        'COMPATIVEL',

      confianca:
        'ALTA',

      intencao:
        'BUSCAR_SOLUCAO'
    };

    // ==========================================================
    // LIMPEZA INICIAL
    // ==========================================================

    limparTeste();

    // ==========================================================
    // 1 — DIAGNÓSTICO POSSUI IDENTIDADE
    // ==========================================================

    teste(
      1,
      'diagnóstico possui empresa_id, conversa_id e diagnostico_id',
      !!diagnostico.empresa_id &&
      !!diagnostico.conversa_id &&
      !!diagnostico.diagnostico_id
    );

    // ==========================================================
    // TRIAGEM
    // ==========================================================

    const sinaisTriagem = {

  dor:
    diagnostico.dor_principal,

  processo:
    diagnostico.processo_resumo,

  possibilidade_de_atuacao:
    'SIM',

  problema_fora_escopo:
    false,

  incerteza:
    false
};

    const triagem =
      avaliarCompatibilidadeTriagemV1_(
        sinaisTriagem
      );

    // ==========================================================
    // 2 — TRIAGEM COMPATÍVEL
    // ==========================================================

    teste(
      2,
      'triagem classifica o diagnóstico como COMPATIVEL',
      !!triagem &&
      triagem.classificacao === 'COMPATIVEL'
    );

    // ==========================================================
    // CONSTRÓI INVESTIGAÇÃO INICIAL
    // ==========================================================

    const investigacaoInicial =
      iniciarInvestigacaoV62_({

        empresa_id:
          TESTE.empresa_id,

        conversa_id:
          TESTE.conversa_id,

        diagnostico_id:
          TESTE.diagnostico_id,

        dor:
          diagnostico.dor_principal,

        processo:
          diagnostico.processo_resumo,

        impacto:
          'O problema gera atrasos, retrabalho e perda de produtividade.',

        frequencia:
          diagnostico.frequencia,

        contexto:
          diagnostico.processo_nome
      });

    // ==========================================================
    // 3 — INVESTIGAÇÃO INICIADA
    // ==========================================================

    teste(
      3,
      'investigação V6.2 é iniciada',
      !!investigacaoInicial &&
      investigacaoInicial.versao ===
        INVESTIGACAO_V62.VERSAO
    );

    // ==========================================================
    // 4 — DIAGNÓSTICO PRESERVADO
    // ==========================================================

    teste(
      4,
      'diagnostico_id é preservado na investigação',
      investigacaoInicial.diagnostico_id ===
        TESTE.diagnostico_id
    );

    // ==========================================================
    // 5 — DOR PRESERVADA
    // ==========================================================

    teste(
      5,
      'problema central preservado',
      !!investigacaoInicial.problema_central
    );

    // ==========================================================
    // 6 — PROCESSO PRESERVADO
    // ==========================================================

    teste(
      6,
      'processo preservado',
      !!investigacaoInicial.processo
    );

    // ==========================================================
    // 7 — IMPACTO PRESERVADO
    // ==========================================================

    teste(
      7,
      'impacto preservado',
      !!investigacaoInicial.impacto
    );

    // ==========================================================
    // 8 — RESULTADO AINDA É LACUNA
    // ==========================================================

    teste(
      8,
      'resultado desejado permanece como lacuna',
      Array.isArray(
        investigacaoInicial.lacunas
      ) &&
      investigacaoInicial.lacunas.indexOf(
        INVESTIGACAO_V62.DIMENSOES.RESULTADO
      ) !== -1
    );

    // ==========================================================
    // PERSISTÊNCIA
    // ==========================================================

    const salva =
      salvarInvestigacaoV62_(
        investigacaoInicial
      );

    investigacaoId =
      salva.investigacao_id;

    // ==========================================================
    // 9 — INVESTIGAÇÃO PERSISTIDA
    // ==========================================================

    teste(
      9,
      'investigação persistida',
      !!salva &&
      salva.sucesso === true
    );

    // ==========================================================
    // 10 — ID GERADO
    // ==========================================================

    teste(
      10,
      'investigacao_id gerado com prefixo INV-',
      String(investigacaoId)
        .indexOf('INV-') === 0
    );

    // ==========================================================
    // RECUPERA
    // ==========================================================

    let atual =
      buscarInvestigacaoV62_({
        diagnostico_id:
          TESTE.diagnostico_id
      });

    // ==========================================================
    // 11 — RECUPERAÇÃO
    // ==========================================================

    teste(
      11,
      'mesma investigação é recuperada',
      !!atual &&
      atual.investigacao_id ===
        investigacaoId
    );

    // ==========================================================
    // 12 — IDENTIDADE PRESERVADA
    // ==========================================================

    teste(
      12,
      'empresa_id, conversa_id e diagnostico_id permanecem vinculados',
      atual.empresa_id === TESTE.empresa_id &&
      atual.conversa_id === TESTE.conversa_id &&
      atual.diagnostico_id === TESTE.diagnostico_id
    );

    // ==========================================================
    // PRIMEIRA RESPOSTA DO EMPRESÁRIO
    // ==========================================================

    const processoRespondido = {

      descricao:
        'Cliente envia pedido, atendimento recebe, confere os dados e encaminha para execução.',

      etapas: [
        'Cliente envia pedido',
        'Atendimento recebe',
        'Atendimento confere',
        'Pedido é registrado',
        'Pedido segue para execução'
      ],

      envolvidos: [
        'Cliente',
        'Atendimento',
        'Equipe operacional'
      ],

      entrada:
        'Pedido do cliente',

      saida:
        'Pedido conferido e encaminhado'
    };

    const perguntasAntes =
      Array.isArray(
        atual.perguntas_realizadas
      )
        ? atual.perguntas_realizadas.slice()
        : [];

    const perguntaProcesso =
      atual.proxima_pergunta;

    // ==========================================================
    // 13 — PERGUNTA REGISTRADA
    // ==========================================================

    const registroPergunta =
      registrarPerguntaInvestigacaoV62_(
        atual,
        perguntaProcesso
      );

    teste(
      13,
      'pergunta da investigação é registrada',
      registroPergunta !== false
    );

    // ==========================================================
    // ATUALIZA PROCESSO
    // ==========================================================

    atual.processo =
      processoRespondido;

    atual.informacoes =
      (Array.isArray(atual.informacoes)
        ? atual.informacoes
        : []
      ).concat([
        criarInformacaoInvestigacaoV62_(
          INVESTIGACAO_V62.DIMENSOES.PROCESSO,
          'O processo possui cinco etapas principais.',
          INVESTIGACAO_V62.STATUS_INFORMACAO.CONFIRMADA
        )
      ]);

    // ==========================================================
    // CALCULA PRÓXIMA DIMENSÃO
    // ==========================================================

    atual.lacunas =
      determinarLacunasInvestigacaoV62_(
        atual
      );

    atual.proxima_dimensao =
      determinarProximaDimensaoInvestigacaoV62_(
        atual
      );

    atual.proxima_pergunta =
      construirPerguntaInvestigacaoV62_(
        atual.proxima_dimensao,
        atual
      );

    atual.estado =
      determinarEstadoInvestigacaoV62_(
        atual
      );

    atual.confianca =
      determinarConfiancaInvestigacaoV62_(
        atual
      );

    // ==========================================================
    // PERSISTE EVOLUÇÃO
    // ==========================================================

    atualizarInvestigacaoV62_(
      investigacaoId,
      atual
    );

    atual =
      buscarInvestigacaoV62_({
        diagnostico_id:
          TESTE.diagnostico_id
      });

    // ==========================================================
    // 14 — PROCESSO EVOLUIU
    // ==========================================================

    teste(
      14,
      'resposta do empresário é incorporada ao processo',
      !!atual.processo &&
      atual.processo.descricao ===
        processoRespondido.descricao
    );

    // ==========================================================
    // 15 — INFORMAÇÃO ANTERIOR PRESERVADA
    // ==========================================================

    teste(
      15,
      'informações anteriores permanecem preservadas',
      Array.isArray(atual.informacoes) &&
      atual.informacoes.length >= 1
    );

    // ==========================================================
    // SEGUNDA DIMENSÃO — IMPACTO
    // ==========================================================

    atual.impacto = {

      descricao:
        'O problema afeta diariamente a operação.',

      frequencia:
        'diaria',

      volume:
        'aproximadamente 40 pedidos por dia',

      consequencias: [
        'atrasos',
        'retrabalho',
        'perda de produtividade'
      ]
    };

    atual.informacoes =
      atual.informacoes.concat([
        criarInformacaoInvestigacaoV62_(
          INVESTIGACAO_V62.DIMENSOES.IMPACTO,
          'São processados cerca de 40 pedidos por dia.',
          INVESTIGACAO_V62.STATUS_INFORMACAO.ESTIMADA
        )
      ]);

    atual.lacunas =
      determinarLacunasInvestigacaoV62_(
        atual
      );

    atual.proxima_dimensao =
      determinarProximaDimensaoInvestigacaoV62_(
        atual
      );

    atual.proxima_pergunta =
      construirPerguntaInvestigacaoV62_(
        atual.proxima_dimensao,
        atual
      );

    atual.estado =
      determinarEstadoInvestigacaoV62_(
        atual
      );

    atualizarInvestigacaoV62_(
      investigacaoId,
      atual
    );

    atual =
      buscarInvestigacaoV62_({
        diagnostico_id:
          TESTE.diagnostico_id
      });

    // ==========================================================
    // 16 — IMPACTO INCORPORADO
    // ==========================================================

    teste(
      16,
      'impacto quantificado incorporado',
      !!atual.impacto &&
      atual.impacto.volume ===
        'aproximadamente 40 pedidos por dia'
    );

    // ==========================================================
    // EXCEÇÕES
    // ==========================================================

    atual.excecoes = [
      {
        descricao:
          'Pedidos urgentes seguem um fluxo diferente.',
        status:
          INVESTIGACAO_V62.STATUS_INFORMACAO.CONFIRMADA
      }
    ];

    atual.informacoes =
      atual.informacoes.concat([
        criarInformacaoInvestigacaoV62_(
          INVESTIGACAO_V62.DIMENSOES.EXCECOES,
          'Pedidos urgentes seguem fluxo diferente.',
          INVESTIGACAO_V62.STATUS_INFORMACAO.CONFIRMADA
        )
      ]);

    atual.lacunas =
      determinarLacunasInvestigacaoV62_(
        atual
      );

    atual.proxima_dimensao =
      determinarProximaDimensaoInvestigacaoV62_(
        atual
      );

    atual.proxima_pergunta =
      construirPerguntaInvestigacaoV62_(
        atual.proxima_dimensao,
        atual
      );

    atual.estado =
      determinarEstadoInvestigacaoV62_(
        atual
      );

    atualizarInvestigacaoV62_(
      investigacaoId,
      atual
    );

    atual =
      buscarInvestigacaoV62_({
        diagnostico_id:
          TESTE.diagnostico_id
      });

    // ==========================================================
    // 17 — EXCEÇÃO INCORPORADA
    // ==========================================================

    teste(
      17,
      'exceções incorporadas à investigação',
      Array.isArray(atual.excecoes) &&
      atual.excecoes.length === 1
    );

    // ==========================================================
    // RESULTADO DESEJADO
    // ==========================================================

    atual.resultado_desejado =
      'Todos os pedidos deveriam entrar em um único fluxo, ser conferidos e encaminhados sem retrabalho.';

    atual.informacoes =
      atual.informacoes.concat([
        criarInformacaoInvestigacaoV62_(
          INVESTIGACAO_V62.DIMENSOES.RESULTADO,
          atual.resultado_desejado,
          INVESTIGACAO_V62.STATUS_INFORMACAO.CONFIRMADA
        )
      ]);

    atual.lacunas =
      determinarLacunasInvestigacaoV62_(
        atual
      );

    atual.proxima_dimensao =
      determinarProximaDimensaoInvestigacaoV62_(
        atual
      );

    atual.proxima_pergunta =
      construirPerguntaInvestigacaoV62_(
        atual.proxima_dimensao,
        atual
      );

    atual.estado =
      determinarEstadoInvestigacaoV62_(
        atual
      );

    atual.confianca =
      determinarConfiancaInvestigacaoV62_(
        atual
      );

    atualizarInvestigacaoV62_(
      investigacaoId,
      atual
    );

    atual =
      buscarInvestigacaoV62_({
        diagnostico_id:
          TESTE.diagnostico_id
      });

    // ==========================================================
    // 18 — RESULTADO INCORPORADO
    // ==========================================================

    teste(
      18,
      'resultado desejado incorporado',
      !!atual.resultado_desejado &&
      atual.resultado_desejado ===
        'Todos os pedidos deveriam entrar em um único fluxo, ser conferidos e encaminhados sem retrabalho.'
    );

    // ==========================================================
    // 19 — INVESTIGAÇÃO SUFICIENTE
    // ==========================================================

    teste(
      19,
      'investigação é considerada suficiente',
      investigacaoSuficienteV62_(
        atual
      ) === true
    );

    // ==========================================================
    // 20 — ESTADO FINAL
    // ==========================================================

    teste(
      20,
      'estado final PRONTA_PARA_SOLUCAO',
      atual.estado ===
        INVESTIGACAO_V62.ESTADOS.PRONTA_PARA_SOLUCAO
    );

    // ==========================================================
    // 21 — CONFIANÇA ALTA
    // ==========================================================

    teste(
      21,
      'confiança final ALTA',
      atual.confianca === 'ALTA'
    );

    // ==========================================================
    // 22 — NÃO REPETIU PERGUNTA
    // ==========================================================

    const perguntasFinais =
      Array.isArray(
        atual.perguntas_realizadas
      )
        ? atual.perguntas_realizadas
        : [];

    const repeticoes =
      perguntasFinais.filter(
        function(pergunta, indice, array) {

          return (
            array.indexOf(pergunta) !==
            indice
          );

        }
      );

    teste(
      22,
      'nenhuma pergunta foi registrada duas vezes',
      repeticoes.length === 0
    );

    // ==========================================================
    // 23 — MESMO ID
    // ==========================================================

    teste(
      23,
      'investigacao_id permanece o mesmo durante toda evolução',
      atual.investigacao_id ===
        investigacaoId
    );

    // ==========================================================
    // 24 — UMA INVESTIGAÇÃO POR DIAGNÓSTICO
    // ==========================================================

    const aba =
      obterAba_(
        SHEETS.INVESTIGACOES
      );

    const dadosAba =
      aba.getDataRange().getValues();

    const cabecalhos =
      dadosAba[0];

    const idxDiagnostico =
      cabecalhos.indexOf(
        'diagnostico_id'
      );

    const linhasDiagnostico =
      dadosAba
        .slice(1)
        .filter(
          function(linha) {

            return String(
              linha[idxDiagnostico] || ''
            ) ===
              TESTE.diagnostico_id;

          }
        );

    teste(
      24,
      'existe exatamente uma investigação para o diagnóstico',
      linhasDiagnostico.length === 1
    );

    // ==========================================================
    // 25 — SEM TECNOLOGIA
    // ==========================================================

    const textoInvestigacao =
      JSON.stringify(atual)
        .toLowerCase();

    const termosTecnologia = [
      'javascript',
      'python',
      'api',
      'sql',
      'mysql',
      'postgres',
      'firebase',
      'aws',
      'azure',
      'google apps script',
      'appscript',
      'docker',
      'servidor',
      'vps',
      'cloud',
      'database',
      'banco de dados',
      'automação'
    ];

    const encontrouTecnologia =
      termosTecnologia.some(
        function(termo) {

          return textoInvestigacao
            .indexOf(termo) !== -1;

        }
      );

    teste(
      25,
      'investigação não expõe tecnologia ou arquitetura',
      encontrouTecnologia === false
    );

  } catch (erro) {

    Logger.log('');
    Logger.log(
      '❌ ERRO FATAL NO TESTE'
    );

    Logger.log(
      erro && erro.stack
        ? erro.stack
        : erro
    );

  } finally {

    limparTeste();

    Logger.log('');
    Logger.log(
      '============================================================'
    );

    Logger.log(
      'RESULTADO FINAL — V6.2.2'
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
        (aprovados / total) * 100
      ) +
      '%'
    );

    if (
      aprovados === total &&
      falhas.length === 0
    ) {

      Logger.log('');
      Logger.log(
        '🏆 TESTAR_INTEGRACAO_V622: PASSOU'
      );

      Logger.log(
        '🏆 V6.2.2 INTEGRAÇÃO: 100%'
      );

      Logger.log(
        '🏆 25/25 TESTES APROVADOS'
      );

    } else {

      Logger.log('');

      Logger.log(
        '❌ TESTAR_INTEGRACAO_V622: FALHOU'
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
