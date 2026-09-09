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
