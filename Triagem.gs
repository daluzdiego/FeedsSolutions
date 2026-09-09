/**
 * ============================================================
 * FEEDS SOLUTIONS
 * MOTOR DE COMPATIBILIDADE V1
 * ============================================================
 *
 * RESPONSABILIDADE:
 *
 * Determinar se o problema apresentado pelo empresário:
 *
 *   COMPATIVEL
 *   INVESTIGAR
 *   NAO_COMPATIVEL
 *   AGUARDANDO_EMPRESARIO
 *
 * PRINCÍPIO:
 *
 *   IA interpreta.
 *   Motor determinístico valida.
 *   Sistema conduz a próxima etapa.
 *
 * IMPORTANTE:
 *
 * Este módulo NÃO:
 *
 * - cria Lead;
 * - cria oportunidade;
 * - escolhe tecnologia;
 * - define arquitetura;
 * - cria proposta;
 * - calcula preço;
 * - executa investigação profunda;
 * - substitui V5.10;
 * - substitui V5.11;
 * - altera V5.6-V6.1.
 *
 * ============================================================
 */


/**
 * ============================================================
 * CONFIGURAÇÃO
 * ============================================================
 */

const TRIAGEM_V1 = {

  VERSAO:
    'V1',

  CLASSIFICACOES: {

    COMPATIVEL:
      'COMPATIVEL',

    INVESTIGAR:
      'INVESTIGAR',

    NAO_COMPATIVEL:
      'NAO_COMPATIVEL',

    AGUARDANDO_EMPRESARIO:
      'AGUARDANDO_EMPRESARIO'

  },

  CONFIANCAS: {

    ALTA:
      'ALTA',

    MEDIA:
      'MEDIA',

    BAIXA:
      'BAIXA'

  },

  VALORES_POTENCIAIS: {

    ALTO:
      'ALTO',

    MEDIO:
      'MEDIO',

    BAIXO:
      'BAIXO',

    DESCONHECIDO:
      'DESCONHECIDO'

  },

  ACOES: {

    DEMONSTRAR_VALOR:
      'DEMONSTRAR_VALOR',

    FAZER_PERGUNTA_ALTO_VALOR:
      'FAZER_PERGUNTA_ALTO_VALOR',

    ENCERRAR_TRIAGEM:
      'ENCERRAR_TRIAGEM',

    AGUARDAR_CONTINUIDADE:
      'AGUARDAR_CONTINUIDADE'

  }

};


/**
 * ============================================================
 * NORMALIZA TEXTO
 * ============================================================
 */

function normalizarTextoTriagemV1_(valor) {

  return String(
    valor === null ||
    valor === undefined
      ? ''
      : valor
  )
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

}


/**
 * ============================================================
 * NORMALIZA CLASSIFICAÇÃO
 * ============================================================
 */

function normalizarClassificacaoTriagemV1_(valor) {

  const texto =
    normalizarTextoTriagemV1_(valor);

  if (
    texto === 'compativel'
  ) {
    return TRIAGEM_V1.CLASSIFICACOES.COMPATIVEL;
  }

  if (
    texto === 'investigar'
  ) {
    return TRIAGEM_V1.CLASSIFICACOES.INVESTIGAR;
  }

  if (
    texto === 'nao_compativel' ||
    texto === 'nao compativel'
  ) {
    return TRIAGEM_V1.CLASSIFICACOES.NAO_COMPATIVEL;
  }

  if (
    texto === 'aguardando_empresario' ||
    texto === 'aguardando empresario'
  ) {
    return TRIAGEM_V1.CLASSIFICACOES.AGUARDANDO_EMPRESARIO;
  }

  return '';

}


/**
 * ============================================================
 * VERIFICA TEXTO PREENCHIDO
 * ============================================================
 */

function possuiValorTriagemV1_(valor) {

  return !!String(
    valor === null ||
    valor === undefined
      ? ''
      : valor
  ).trim();

}


/**
 * ============================================================
 * DETERMINA SE EXISTE DOR CONCRETA
 * ============================================================
 */

function possuiDorConcretaTriagemV1_(dados) {

  return possuiValorTriagemV1_(
    dados &&
    dados.dor
  );

}


/**
 * ============================================================
 * DETERMINA SE EXISTE PROCESSO IDENTIFICÁVEL
 * ============================================================
 */

function possuiProcessoTriagemV1_(dados) {

  return possuiValorTriagemV1_(
    dados &&
    dados.processo
  );

}


/**
 * ============================================================
 * DETERMINA SE EXISTE IMPACTO
 *
 * IMPACTO NÃO É OBRIGATÓRIO PARA COMPATIBILIDADE.
 * Ele aumenta a confiança.
 * ============================================================
 */

function possuiImpactoTriagemV1_(dados) {

  return possuiValorTriagemV1_(
    dados &&
    dados.impacto
  );

}


/**
 * ============================================================
 * DETERMINA POSSIBILIDADE DE ATUAÇÃO
 *
 * Valores esperados:
 *
 *   SIM
 *   NAO
 *   DESCONHECIDO
 *
 * Aceita também boolean.
 * ============================================================
 */

function normalizarPossibilidadeAtuacaoTriagemV1_(valor) {

  if (
    valor === true
  ) {
    return 'SIM';
  }

  if (
    valor === false
  ) {
    return 'NAO';
  }

  const texto =
    normalizarTextoTriagemV1_(valor);

  if (
    texto === 'sim' ||
    texto === 's' ||
    texto === 'true'
  ) {
    return 'SIM';
  }

  if (
    texto === 'nao' ||
    texto === 'n' ||
    texto === 'false'
  ) {
    return 'NAO';
  }

  return 'DESCONHECIDO';

}


/**
 * ============================================================
 * DETERMINA VALOR POTENCIAL
 * ============================================================
 */

function determinarValorPotencialTriagemV1_(dados) {

  const impacto =
    normalizarTextoTriagemV1_(
      dados &&
      dados.impacto
    );

  const frequencia =
    normalizarTextoTriagemV1_(
      dados &&
      dados.frequencia
    );

  const valorInformado =
    normalizarTextoTriagemV1_(
      dados &&
      dados.valor_potencial
    );

  if (
    valorInformado === 'alto'
  ) {
    return TRIAGEM_V1.VALORES_POTENCIAIS.ALTO;
  }

  if (
    valorInformado === 'medio' ||
    valorInformado === 'médio'
  ) {
    return TRIAGEM_V1.VALORES_POTENCIAIS.MEDIO;
  }

  if (
    valorInformado === 'baixo'
  ) {
    return TRIAGEM_V1.VALORES_POTENCIAIS.BAIXO;
  }

  const texto =
    impacto +
    ' ' +
    frequencia;

  if (
    /grave|alto|alta|grande|muito|diari|sempre|constante|continu/.test(
      texto
    )
  ) {
    return TRIAGEM_V1.VALORES_POTENCIAIS.ALTO;
  }

  if (
    impacto ||
    frequencia
  ) {
    return TRIAGEM_V1.VALORES_POTENCIAIS.MEDIO;
  }

  return TRIAGEM_V1.VALORES_POTENCIAIS.DESCONHECIDO;

}


/**
 * ============================================================
 * DETERMINA CONFIANÇA
 * ============================================================
 */

function determinarConfiancaTriagemV1_(dados, classificacao) {

  if (
    classificacao ===
    TRIAGEM_V1.CLASSIFICACOES.NAO_COMPATIVEL
  ) {

    return TRIAGEM_V1.CONFIANCAS.ALTA;

  }

  if (
    classificacao ===
    TRIAGEM_V1.CLASSIFICACOES.AGUARDANDO_EMPRESARIO
  ) {

    return TRIAGEM_V1.CONFIANCAS.ALTA;

  }

  const possuiDor =
    possuiDorConcretaTriagemV1_(
      dados
    );

  const possuiProcesso =
    possuiProcessoTriagemV1_(
      dados
    );

  const atuacao =
    normalizarPossibilidadeAtuacaoTriagemV1_(
      dados &&
      dados.possibilidade_de_atuacao
    );

  const possuiImpacto =
    possuiImpactoTriagemV1_(
      dados
    );

  if (
    possuiDor &&
    possuiProcesso &&
    atuacao === 'SIM' &&
    possuiImpacto
  ) {

    return TRIAGEM_V1.CONFIANCAS.ALTA;

  }

  if (
    possuiDor &&
    possuiProcesso &&
    atuacao === 'SIM'
  ) {

    return TRIAGEM_V1.CONFIANCAS.MEDIA;

  }

  return TRIAGEM_V1.CONFIANCAS.BAIXA;

}


/**
 * ============================================================
 * DETERMINA PRÓXIMA AÇÃO
 * ============================================================
 */

function determinarProximaAcaoTriagemV1_(classificacao) {

  switch (
    classificacao
  ) {

    case TRIAGEM_V1.CLASSIFICACOES.COMPATIVEL:

      return TRIAGEM_V1.ACOES.DEMONSTRAR_VALOR;

    case TRIAGEM_V1.CLASSIFICACOES.INVESTIGAR:

      return TRIAGEM_V1.ACOES.FAZER_PERGUNTA_ALTO_VALOR;

    case TRIAGEM_V1.CLASSIFICACOES.NAO_COMPATIVEL:

      return TRIAGEM_V1.ACOES.ENCERRAR_TRIAGEM;

    case TRIAGEM_V1.CLASSIFICACOES.AGUARDANDO_EMPRESARIO:

      return TRIAGEM_V1.ACOES.AGUARDAR_CONTINUIDADE;

    default:

      return '';

  }

}


/**
 * ============================================================
 * DETERMINA INFORMAÇÕES FALTANTES
 * ============================================================
 */

function determinarInformacoesFaltantesTriagemV1_(dados) {

  const faltantes = [];

  if (
    !possuiDorConcretaTriagemV1_(
      dados
    )
  ) {

    faltantes.push(
      'dor'
    );

  }

  if (
    !possuiProcessoTriagemV1_(
      dados
    )
  ) {

    faltantes.push(
      'processo'
    );

  }

  const atuacao =
    normalizarPossibilidadeAtuacaoTriagemV1_(
      dados &&
      dados.possibilidade_de_atuacao
    );

  if (
    atuacao === 'DESCONHECIDO'
  ) {

    faltantes.push(
      'possibilidade_de_atuacao'
    );

  }

  return faltantes;

}


/**
 * ============================================================
 * CONSTRÓI JUSTIFICATIVA
 * ============================================================
 */

function construirJustificativaTriagemV1_(
  dados,
  classificacao
) {

  const dor =
    String(
      dados &&
      dados.dor
        ? dados.dor
        : ''
    ).trim();

  const processo =
    String(
      dados &&
      dados.processo
        ? dados.processo
        : ''
    ).trim();

  const atuacao =
    normalizarPossibilidadeAtuacaoTriagemV1_(
      dados &&
      dados.possibilidade_de_atuacao
    );

  if (
    classificacao ===
    TRIAGEM_V1.CLASSIFICACOES.COMPATIVEL
  ) {

    return (
      'Foi identificada uma dor concreta no processo' +
      (processo
        ? ' de ' + processo
        : '') +
      (dor
        ? ', relacionada a ' + dor
        : '') +
      '. Existem sinais suficientes de que a Feeds pode atuar sobre esse tipo de problema.'
    );

  }

  if (
    classificacao ===
    TRIAGEM_V1.CLASSIFICACOES.INVESTIGAR
  ) {

    const faltantes =
      determinarInformacoesFaltantesTriagemV1_(
        dados
      );

    if (
      faltantes.indexOf(
        'dor'
      ) >= 0
    ) {

      return (
        'Existe intenção ou sinal de problema, mas ainda não foi identificada uma dor concreta.'
      );

    }

    if (
      faltantes.indexOf(
        'processo'
      ) >= 0
    ) {

      return (
        'Existe uma dor ou impacto, mas ainda não foi identificado com clareza o processo ou atividade onde o problema ocorre.'
      );

    }

    if (
      atuacao === 'DESCONHECIDO'
    ) {

      return (
        'O problema apresenta potencial, mas ainda não há informação suficiente para validar se a Feeds consegue atuar sobre ele.'
      );

    }

    return (
      'Existe potencial, mas ainda falta informação relevante para afirmar compatibilidade com segurança.'
    );

  }

  if (
    classificacao ===
    TRIAGEM_V1.CLASSIFICACOES.NAO_COMPATIVEL
  ) {

    return (
      'O problema foi identificado com clareza e está fora do universo de atuação da Feeds.'
    );

  }

  if (
    classificacao ===
    TRIAGEM_V1.CLASSIFICACOES.AGUARDANDO_EMPRESARIO
  ) {

    return (
      'A continuidade depende de uma nova interação do empresário.'
    );

  }

  return '';

}


/**
 * ============================================================
 * MOTOR PRINCIPAL
 * ============================================================
 *
 * Esta é a decisão oficial do Motor de Compatibilidade V1.
 *
 * ============================================================
 */

function avaliarCompatibilidadeTriagemV1_(dados) {

  dados =
    dados || {};

  const classificacaoInformada =
    normalizarClassificacaoTriagemV1_(
      dados.classificacao
    );

  /**
   * ----------------------------------------------------------
   * 1. AGUARDANDO EMPRESÁRIO
   *
   * Este estado representa a conversa.
   * ----------------------------------------------------------
   */

  if (
    classificacaoInformada ===
    TRIAGEM_V1.CLASSIFICACOES.AGUARDANDO_EMPRESARIO
  ) {

    return construirResultadoTriagemV1_(
      dados,
      TRIAGEM_V1.CLASSIFICACOES.AGUARDANDO_EMPRESARIO
    );

  }

  /**
   * ----------------------------------------------------------
   * 2. VALIDAÇÃO EXPLÍCITA DE NÃO COMPATIBILIDADE
   *
   * A decisão negativa só é aceita quando existe evidência
   * explícita de que o problema está fora do universo Feeds.
   * ----------------------------------------------------------
   */

  if (
    classificacaoInformada ===
    TRIAGEM_V1.CLASSIFICACOES.NAO_COMPATIVEL &&
    dados.problema_fora_escopo === true
  ) {

    return construirResultadoTriagemV1_(
      dados,
      TRIAGEM_V1.CLASSIFICACOES.NAO_COMPATIVEL
    );

  }

  /**
   * ----------------------------------------------------------
   * 3. SINAIS
   * ----------------------------------------------------------
   */

  const possuiDor =
    possuiDorConcretaTriagemV1_(
      dados
    );

  const possuiProcesso =
    possuiProcessoTriagemV1_(
      dados
    );

  const atuacao =
    normalizarPossibilidadeAtuacaoTriagemV1_(
      dados.possibilidade_de_atuacao
    );

  /**
   * ----------------------------------------------------------
   * 4. PROTEÇÃO CONTRA FALSA INCOMPATIBILIDADE
   *
   * Se não entendemos o problema, INVESTIGAR.
   *
   * Nunca:
   *
   * não sei
   *   ↓
   * NAO_COMPATIVEL
   * ----------------------------------------------------------
   */

  if (
    !possuiDor
  ) {

    return construirResultadoTriagemV1_(
      dados,
      TRIAGEM_V1.CLASSIFICACOES.INVESTIGAR
    );

  }

  if (
    !possuiProcesso
  ) {

    return construirResultadoTriagemV1_(
      dados,
      TRIAGEM_V1.CLASSIFICACOES.INVESTIGAR
    );

  }

  /**
   * ----------------------------------------------------------
   * 5. FORA DO UNIVERSO
   *
   * Possibilidade de atuação explicitamente negativa.
   * ----------------------------------------------------------
   */

  if (
    atuacao === 'NAO'
  ) {

    return construirResultadoTriagemV1_(
      dados,
      TRIAGEM_V1.CLASSIFICACOES.NAO_COMPATIVEL
    );

  }

  /**
   * ----------------------------------------------------------
   * 6. PROBLEMA ENTENDIDO, MAS ATUAÇÃO DESCONHECIDA
   *
   * Problema novo não significa incompatível.
   * ----------------------------------------------------------
   */

  if (
    atuacao === 'DESCONHECIDO'
  ) {

    return construirResultadoTriagemV1_(
      dados,
      TRIAGEM_V1.CLASSIFICACOES.INVESTIGAR
    );

  }

  /**
   * ----------------------------------------------------------
   * 7. PROBLEMA ENTENDIDO + POSSIBILIDADE DE ATUAÇÃO
   * ----------------------------------------------------------
   */

  if (
    possuiDor &&
    possuiProcesso &&
    atuacao === 'SIM'
  ) {

    return construirResultadoTriagemV1_(
      dados,
      TRIAGEM_V1.CLASSIFICACOES.COMPATIVEL
    );

  }

  /**
   * ----------------------------------------------------------
   * 8. FALLBACK SEGURO
   * ----------------------------------------------------------
   */

  return construirResultadoTriagemV1_(
    dados,
    TRIAGEM_V1.CLASSIFICACOES.INVESTIGAR
  );

}


/**
 * ============================================================
 * CONSTRÓI RESULTADO
 * ============================================================
 */

function construirResultadoTriagemV1_(
  dados,
  classificacao
) {

  const resultado = {

    versao:
      TRIAGEM_V1.VERSAO,

    empresa_id:
      dados.empresa_id || '',

    conversa_id:
      dados.conversa_id || '',

    classificacao:
      classificacao,

    dor:
      dados.dor || '',

    processo:
      dados.processo || '',

    impacto:
      dados.impacto || '',

    frequencia:
      dados.frequencia || '',

    contexto:
      dados.contexto || '',

    compatibilidade:
      classificacao,

    confianca:
      determinarConfiancaTriagemV1_(
        dados,
        classificacao
      ),

    valor_potencial:
      determinarValorPotencialTriagemV1_(
        dados
      ),

    informacoes_faltantes:
      determinarInformacoesFaltantesTriagemV1_(
        dados
      ),

    justificativa:
      construirJustificativaTriagemV1_(
        dados,
        classificacao
      ),

    proxima_acao:
      determinarProximaAcaoTriagemV1_(
        classificacao
      )

  };

  return resultado;

}


/**
 * ============================================================
 * TESTE 01
 * ============================================================
 */

function TESTAR_TRIAGEM_V1_CASO_01_() {

  return avaliarCompatibilidadeTriagemV1_({

    dor:
      'erros e retrabalho',

    processo:
      'copiar dados entre planilhas',

    impacto:
      'muitos erros',

    frequencia:
      'diariamente',

    possibilidade_de_atuacao:
      'SIM'

  });

}


/**
 * ============================================================
 * TESTE PRINCIPAL — 20 CENÁRIOS
 * ============================================================
 *
 * Estes são os 20 cenários oficiais definidos para aprovação.
 *
 * ============================================================
 */

function TESTAR_MOTOR_COMPATIBILIDADE_V1() {

  const casos = [

    /**
     * 01
     */
    {
      id: 1,

      descricao:
        'Equipe copia dados de uma planilha para outra e gera erros.',

      entrada: {
        dor:
          'erros ao copiar dados',

        processo:
          'copiar dados entre planilhas',

        impacto:
          'gera muitos erros',

        frequencia:
          'diariamente',

        possibilidade_de_atuacao:
          'SIM'
      },

      esperado:
        'COMPATIVEL'
    },

    /**
     * 02
     */
    {
      id: 2,

      descricao:
        'Pedidos são conferidos e lançados novamente.',

      entrada: {
        dor:
          'retrabalho',

        processo:
          'conferir e lançar pedidos',

        impacto:
          'trabalho duplicado',

        frequencia:
          'frequente',

        possibilidade_de_atuacao:
          'SIM'
      },

      esperado:
        'COMPATIVEL'
    },

    /**
     * 03
     */
    {
      id: 3,

      descricao:
        'Informações espalhadas em WhatsApp, planilhas, papel e e-mail.',

      entrada: {
        dor:
          'dificuldade para encontrar informação correta',

        processo:
          'organização e consulta de informações',

        impacto:
          'perda de tempo',

        frequencia:
          'diariamente',

        possibilidade_de_atuacao:
          'SIM'
      },

      esperado:
        'COMPATIVEL'
    },

    /**
     * 04
     */
    {
      id: 4,

      descricao:
        'Oficina perde tempo respondendo status dos veículos.',

      entrada: {
        dor:
          'dificuldade de informar o status dos carros',

        processo:
          'acompanhar status dos veículos',

        impacto:
          'perda de tempo',

        frequencia:
          'diariamente',

        possibilidade_de_atuacao:
          'SIM'
      },

      esperado:
        'COMPATIVEL'
    },

    /**
     * 05
     */
    {
      id: 5,

      descricao:
        'Equipe perde duas horas procurando informações.',

      entrada: {
        dor:
          'perda de tempo procurando informações',

        processo:
          'buscar informações para trabalhar',

        impacto:
          'duas horas por dia',

        frequencia:
          'diariamente',

        possibilidade_de_atuacao:
          'SIM'
      },

      esperado:
        'COMPATIVEL'
    },

    /**
     * 06
     */
    {
      id: 6,

      descricao:
        'Processo específico ainda não automatizado.',

      entrada: {
        dor:
          'processo consome muito tempo',

        processo:
          'processo operacional específico',

        impacto:
          'consome muito tempo da equipe',

        frequencia:
          'frequente',

        possibilidade_de_atuacao:
          'DESCONHECIDO'
      },

      esperado:
        'INVESTIGAR'
    },

    /**
     * 07
     */
    {
      id: 7,

      descricao:
        'Empresa está desorganizada.',

      entrada: {
        dor:
          'desorganização',

        processo:
          '',

        impacto:
          '',

        frequencia:
          '',

        possibilidade_de_atuacao:
          'DESCONHECIDO'
      },

      esperado:
        'INVESTIGAR'
    },

    /**
     * 08
     */
    {
      id: 8,

      descricao:
        'Empresário quer colocar IA na empresa.',

      entrada: {
        dor:
          '',

        processo:
          '',

        impacto:
          '',

        frequencia:
          '',

        possibilidade_de_atuacao:
          'DESCONHECIDO'
      },

      esperado:
        'INVESTIGAR'
    },

    /**
     * 09
     */
    {
      id: 9,

      descricao:
        'Empresário quer melhorar processos.',

      entrada: {
        dor:
          '',

        processo:
          'processos da empresa',

        impacto:
          '',

        frequencia:
          '',

        possibilidade_de_atuacao:
          'DESCONHECIDO'
      },

      esperado:
        'INVESTIGAR'
    },

    /**
     * 10
     */
    {
      id: 10,

      descricao:
        'Equipe está perdendo muito tempo, mas causa desconhecida.',

      entrada: {
        dor:
          'perda de tempo',

        processo:
          '',

        impacto:
          'equipe está perdendo muito tempo',

        frequencia:
          'frequente',

        possibilidade_de_atuacao:
          'DESCONHECIDO'
      },

      esperado:
        'INVESTIGAR'
    },

    /**
     * 11
     */
    {
      id: 11,

      descricao:
        'Controle de pedidos feito em planilha, sem dor informada.',

      entrada: {
        dor:
          '',

        processo:
          'controle de pedidos',

        impacto:
          '',

        frequencia:
          '',

        possibilidade_de_atuacao:
          'DESCONHECIDO'
      },

      esperado:
        'INVESTIGAR'
    },

    /**
     * 12
     */
    {
      id: 12,

      descricao:
        'Defesa em processo trabalhista.',

      entrada: {
        dor:
          'processo trabalhista',

        processo:
          'defesa jurídica',

        impacto:
          'necessidade de representação',

        frequencia:
          'pontual',

        possibilidade_de_atuacao:
          'NAO',

        problema_fora_escopo:
          true
      },

      esperado:
        'NAO_COMPATIVEL'
    },

    /**
     * 13
     */
    {
      id: 13,

      descricao:
        'Manutenção elétrica da fábrica.',

      entrada: {
        dor:
          'necessidade de manutenção elétrica',

        processo:
          'manutenção elétrica física',

        impacto:
          'necessidade de execução física',

        frequencia:
          'pontual',

        possibilidade_de_atuacao:
          'NAO',

        problema_fora_escopo:
          true
      },

      esperado:
        'NAO_COMPATIVEL'
    },

    /**
     * 14
     */
    {
      id: 14,

      descricao:
        'Avaliação médica dos funcionários.',

      entrada: {
        dor:
          'necessidade de avaliação médica',

        processo:
          'avaliação clínica',

        impacto:
          'necessidade de atendimento médico',

        frequencia:
          'pontual',

        possibilidade_de_atuacao:
          'NAO',

        problema_fora_escopo:
          true
      },

      esperado:
        'NAO_COMPATIVEL'
    },

    /**
     * 15
     */
    {
      id: 15,

      descricao:
        'Secretária confere documentos manualmente e deixa coisas para trás.',

      entrada: {
        dor:
          'documentos ficam para trás',

        processo:
          'conferência manual de documentos',

        impacto:
          'tarefas ficam pendentes',

        frequencia:
          'diariamente',

        possibilidade_de_atuacao:
          'SIM'
      },

      esperado:
        'COMPATIVEL'
    },

    /**
     * 16
     */
    {
      id: 16,

      descricao:
        'Operação específica para a qual o empresário quer criar algo.',

      entrada: {
        dor:
          'problema em operação específica',

        processo:
          'operação específica',

        impacto:
          '',

        frequencia:
          '',

        possibilidade_de_atuacao:
          'DESCONHECIDO'
      },

      esperado:
        'INVESTIGAR'
    },

    /**
     * 17
     */
    {
      id: 17,

      descricao:
        'Relatórios de vários lugares precisam ser consolidados manualmente.',

      entrada: {
        dor:
          'trabalho manual para consolidar relatórios',

        processo:
          'consolidação de relatórios',

        impacto:
          'quase um dia inteiro de trabalho',

        frequencia:
          'semanalmente',

        possibilidade_de_atuacao:
          'SIM'
      },

      esperado:
        'COMPATIVEL'
    },

    /**
     * 18
     */
    {
      id: 18,

      descricao:
        'Reforma física da fachada.',

      entrada: {
        dor:
          'necessidade de reformar fachada',

        processo:
          'obra física',

        impacto:
          'necessidade de execução física',

        frequencia:
          'pontual',

        possibilidade_de_atuacao:
          'NAO',

        problema_fora_escopo:
          true
      },

      esperado:
        'NAO_COMPATIVEL'
    },

    /**
     * 19
     */
    {
      id: 19,

      descricao:
        'Empresário pede para continuar outro dia.',

      entrada: {
        classificacao:
          'AGUARDANDO_EMPRESARIO',

        dor:
          'problema operacional',

        processo:
          'processo operacional',

        impacto:
          'impacto existente',

        frequencia:
          'frequente',

        possibilidade_de_atuacao:
          'SIM'
      },

      esperado:
        'AGUARDANDO_EMPRESARIO'
    },

    /**
     * 20
     */
    {
      id: 20,

      descricao:
        'Empresa de logística recebe pedidos por vários canais e atualiza sistemas diferentes.',

      entrada: {
        dor:
          'atrasos, retrabalho e informações erradas',

        processo:
          'receber pedidos, conferir informações e atualizar status',

        impacto:
          'atraso, retrabalho e erro para o cliente',

        frequencia:
          'frequente',

        possibilidade_de_atuacao:
          'SIM',

        contexto:
          'empresa de logística'
      },

      esperado:
        'COMPATIVEL'
    }

  ];


  let aprovados =
    0;

  let falhas =
    0;

  const resultados =
    [];


  Logger.log(
    '============================================================'
  );

  Logger.log(
    'MOTOR DE COMPATIBILIDADE V1 — TESTE OFICIAL'
  );

  Logger.log(
    '============================================================'
  );


  casos.forEach(function(caso) {

    let resultado;

    let passou =
      false;

    try {

      resultado =
        avaliarCompatibilidadeTriagemV1_(
          caso.entrada
        );

      passou =
        resultado.classificacao ===
        caso.esperado;

    } catch (erro) {

      resultado = {

        erro:
          erro.message

      };

    }


    if (
      passou
    ) {

      aprovados++;

    } else {

      falhas++;

    }


    resultados.push({

      id:
        caso.id,

      descricao:
        caso.descricao,

      esperado:
        caso.esperado,

      obtido:
        resultado.classificacao ||
        'ERRO',

      confianca:
        resultado.confianca ||
        '',

      proxima_acao:
        resultado.proxima_acao ||
        '',

      passou:
        passou

    });


    Logger.log(
      'CASO ' +
      caso.id +
      ' | ' +
      (
        passou
          ? 'PASSOU'
          : 'FALHOU'
      ) +
      ' | ESPERADO: ' +
      caso.esperado +
      ' | OBTIDO: ' +
      (
        resultado.classificacao ||
        'ERRO'
      )
    );

  });


  const total =
    casos.length;

  const percentual =
    total > 0
      ? (
          aprovados /
          total
        ) *
        100
      : 0;


  Logger.log(
    '------------------------------------------------------------'
  );

  Logger.log(
    'RESULTADO MOTOR COMPATIBILIDADE V1: ' +
    aprovados +
    '/' +
    total
  );

  Logger.log(
    'FALHAS MOTOR COMPATIBILIDADE V1: ' +
    falhas
  );

  Logger.log(
    'PERCENTUAL MOTOR COMPATIBILIDADE V1: ' +
    percentual +
    '%'
  );

  Logger.log(
    '------------------------------------------------------------'
  );


  if (
    percentual === 100
  ) {

    Logger.log(
      'TESTAR_MOTOR_COMPATIBILIDADE_V1: PASSOU'
    );

    Logger.log(
      'V1 MOTOR DE COMPATIBILIDADE: 100%'
    );

  } else {

    Logger.log(
      'TESTAR_MOTOR_COMPATIBILIDADE_V1: FALHOU'
    );

    Logger.log(
      'V1 MOTOR DE COMPATIBILIDADE: NAO APROVADA'
    );

  }


  Logger.log(
    '============================================================'
  );


  return {

    sucesso:
      percentual === 100,

    versao:
      TRIAGEM_V1.VERSAO,

    total:
      total,

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
 * INTEGRAÇÃO REAL — MOTOR DE COMPATIBILIDADE V1
 * ============================================================
 *
 * IMPORTANTE:
 *
 * Este teste NÃO altera o fluxo principal.
 *
 * Ele:
 *
 * 1. cria um diagnóstico temporário;
 * 2. envia uma mensagem real para Gemini;
 * 3. recupera os dados estruturados produzidos pela IA;
 * 4. transforma esses dados nos sinais da Triagem V1;
 * 5. executa o motor determinístico;
 * 6. valida o resultado;
 * 7. executa uma segunda mensagem para testar continuidade;
 * 8. verifica que o motor não inventa incompatibilidade;
 * 9. limpa os registros temporários.
 *
 * META:
 *
 * 100%
 *
 * ============================================================
 */

function TESTAR_INTEGRACAO_TRIAGEM_V1() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'INTEGRAÇÃO REAL — MOTOR DE COMPATIBILIDADE V1'
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
          'Teste Triagem V1',

        nome_empresa:
          'Teste Triagem V1',

        segmento:
          'Serviços',

        porte:
          'PEQUENA',

        nome_contato:
          'Teste Triagem V1',

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

      JSON.stringify(
        inicio
      )

    );


    /**
     * ========================================================
     * TESTE 2 — MENSAGEM REAL
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
      'MENSAGEM REAL ENVIADA À IA:'
    );

    Logger.log(
      mensagem
    );

    Logger.log(
      '------------------------------------------------------------'
    );


    /**
     * ========================================================
     * TESTE 3 — EXECUTAR FLUXO REAL
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
     * TESTE 4 — DIAGNÓSTICO PRODUZIDO
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
     * TESTE 5 — DOR IDENTIFICADA
     * ========================================================
     */

    const dor =
      diagnostico
        ? String(
            diagnostico.dor_principal ||
            ''
          ).trim()
        : '';


    teste(

      '4 — IA identificou dor',

      !!dor,

      dor ||
      'Dor não identificada'

    );


    /**
     * ========================================================
     * TESTE 6 — PROCESSO IDENTIFICADO
     * ========================================================
     */

    const processo =
      diagnostico
        ? String(
            diagnostico.processo_nome ||
            ''
          ).trim()
        : '';


    teste(

      '5 — IA identificou processo',

      !!processo,

      processo ||
      'Processo não identificado'

    );


    /**
     * ========================================================
     * TESTE 7 — IMPACTO
     * ========================================================
     */

    const impacto =
      diagnostico
        ? String(
            diagnostico.impacto_nivel ||
            ''
          ).trim()
        : '';


    const impactoIA =
      fluxo &&
      fluxo.analise_ia
        ? String(
            fluxo.analise_ia.impacto ||
            ''
          ).trim()
        : '';


    const impactoFinal =
      impacto ||
      impactoIA;


    teste(

      '6 — Impacto identificado ou preservado',

      !!impactoFinal,

      impactoFinal ||
      'Impacto não identificado'

    );


    /**
     * ========================================================
     * TESTE 8 — FREQUÊNCIA
     * ========================================================
     */

    const frequencia =
      diagnostico
        ? String(
            diagnostico.frequencia ||
            ''
          ).trim()
        : '';


    teste(

      '7 — Frequência identificada',

      !!frequencia,

      frequencia ||
      'Frequência não identificada'

    );


    /**
     * ========================================================
     * TESTE 9 — CONSTRUIR SINAIS DA TRIAGEM
     * ========================================================
     */

    const sinais = {

      empresa_id:
        inicio.empresa_id,

      conversa_id:
        inicio.conversa_id,

      dor:
        dor,

      processo:
        processo,

      impacto:
        impactoFinal,

      frequencia:
        frequencia,

      contexto:
        'empresa de serviços',

      possibilidade_de_atuacao:
        'SIM'

    };


    Logger.log(
      '------------------------------------------------------------'
    );

    Logger.log(
      'SINAIS ENVIADOS AO MOTOR DE COMPATIBILIDADE:'
    );

    Logger.log(
      JSON.stringify(
        sinais
      )
    );

    Logger.log(
      '------------------------------------------------------------'
    );


    teste(

      '8 — Sinais estruturados preparados',

      !!sinais.dor &&
      !!sinais.processo &&
      !!sinais.possibilidade_de_atuacao,

      JSON.stringify(
        sinais
      )

    );


    /**
     * ========================================================
     * TESTE 10 — EXECUTAR MOTOR
     * ========================================================
     */

    const resultadoTriagem =
      avaliarCompatibilidadeTriagemV1_(
        sinais
      );


    Logger.log(
      'RESULTADO MOTOR V1:'
    );

    Logger.log(
      JSON.stringify(
        resultadoTriagem
      )
    );


    teste(

      '9 — Motor retornou resultado',

      !!resultadoTriagem &&
      !!resultadoTriagem.classificacao,

      JSON.stringify(
        resultadoTriagem
      )

    );


    /**
     * ========================================================
     * TESTE 11 — CLASSIFICAÇÃO
     * ========================================================
     */

    teste(

      '10 — Classificação correta',

      resultadoTriagem.classificacao ===
        TRIAGEM_V1.CLASSIFICACOES.COMPATIVEL,

      'Esperado: COMPATIVEL | Obtido: ' +
      resultadoTriagem.classificacao

    );


    /**
     * ========================================================
     * TESTE 12 — PRÓXIMA AÇÃO
     * ========================================================
     */

    teste(

      '11 — Próxima ação correta',

      resultadoTriagem.proxima_acao ===
        TRIAGEM_V1.ACOES.DEMONSTRAR_VALOR,

      'Esperado: DEMONSTRAR_VALOR | Obtido: ' +
      resultadoTriagem.proxima_acao

    );


    /**
     * ========================================================
     * TESTE 13 — NÃO INVENTAR SOLUÇÃO
     * ========================================================
     */

    const textoResultado =
      JSON.stringify(
        resultadoTriagem
      ).toLowerCase();


    const possuiTecnologiaIndevida =
      /apps script|javascript|python|api|banco de dados|sql|arquitetura|gemini|openai/.test(
        textoResultado
      );


    teste(

      '12 — Motor não expõe tecnologia',

      possuiTecnologiaIndevida === false,

      possuiTecnologiaIndevida
        ? 'Tecnologia encontrada indevidamente'
        : 'Nenhuma tecnologia exposta'

    );


    /**
     * ========================================================
     * TESTE 14 — SEGUNDA MENSAGEM
     *
     * Agora fazemos uma continuação real.
     * ========================================================
     */

    const mensagemSegunda =
      'Isso acontece praticamente todos os dias e ' +
      'a maior dificuldade é o retrabalho causado pelos erros.';


    Logger.log(
      '------------------------------------------------------------'
    );

    Logger.log(
      'SEGUNDA MENSAGEM REAL:'
    );

    Logger.log(
      mensagemSegunda
    );

    Logger.log(
      '------------------------------------------------------------'
    );


    const fluxoSegundo =
      processarMensagemDiagnostico({

        empresa_id:
          inicio.empresa_id,

        conversa_id:
          inicio.conversa_id,

        mensagem:
          mensagemSegunda

      });


    teste(

      '13 — Segunda mensagem processada',

      !!fluxoSegundo,

      fluxoSegundo
        ? 'Fluxo concluído'
        : 'Fluxo não retornou'

    );


    /**
     * ========================================================
     * TESTE 15 — DIAGNÓSTICO PRESERVADO
     * ========================================================
     */

    const diagnosticoSegundo =
      fluxoSegundo &&
      fluxoSegundo.diagnostico
        ? fluxoSegundo.diagnostico
        : null;


    teste(

      '14 — Diagnóstico preservado',

      !!diagnosticoSegundo &&
      String(
        diagnosticoSegundo.diagnostico_id ||
        ''
      ) ===
      String(
        inicio.diagnostico_id
      ),

      diagnosticoSegundo
        ? JSON.stringify(
            diagnosticoSegundo
          )
        : 'Diagnóstico ausente'

    );


    /**
     * ========================================================
     * TESTE 16 — DOR CONTINUA PRESENTE
     * ========================================================
     */

    const dorSegunda =
      diagnosticoSegundo
        ? String(
            diagnosticoSegundo.dor_principal ||
            ''
          ).trim()
        : '';


    teste(

      '15 — Dor continua preservada',

      !!dorSegunda,

      dorSegunda ||
      'Dor perdida'

    );


    /**
     * ========================================================
     * TESTE 17 — REAVALIAR TRIAGEM
     * ========================================================
     */

    const sinaisSegunda = {

      empresa_id:
        inicio.empresa_id,

      conversa_id:
        inicio.conversa_id,

      dor:
        dorSegunda,

      processo:
        diagnosticoSegundo
          ? String(
              diagnosticoSegundo.processo_nome ||
              ''
            ).trim()
          : '',

      impacto:
        diagnosticoSegundo
          ? String(
              diagnosticoSegundo.impacto_nivel ||
              ''
            ).trim()
          : '',

      frequencia:
        diagnosticoSegundo
          ? String(
              diagnosticoSegundo.frequencia ||
              ''
            ).trim()
          : '',

      contexto:
        'empresa de serviços',

      possibilidade_de_atuacao:
        'SIM'

    };


    const resultadoSegundo =
      avaliarCompatibilidadeTriagemV1_(
        sinaisSegunda
      );


    teste(

      '16 — Segunda avaliação continua COMPATIVEL',

      resultadoSegundo.classificacao ===
        TRIAGEM_V1.CLASSIFICACOES.COMPATIVEL,

      JSON.stringify(
        resultadoSegundo
      )

    );


    /**
     * ========================================================
     * TESTE 18 — NÃO GERAR NÃO_COMPATÍVEL POR FALTA DE DADO
     * ========================================================
     *
     * Simula um cenário em que a IA não conseguiu identificar
     * possibilidade de atuação.
     *
     * O resultado correto é INVESTIGAR.
     * ========================================================
     */

    const sinaisDesconhecidos = {

      empresa_id:
        inicio.empresa_id,

      conversa_id:
        inicio.conversa_id,

      dor:
        'retrabalho operacional',

      processo:
        'processo administrativo',

      impacto:
        'perda de tempo',

      frequencia:
        'frequente',

      possibilidade_de_atuacao:
        'DESCONHECIDO'

    };


    const resultadoDesconhecido =
      avaliarCompatibilidadeTriagemV1_(
        sinaisDesconhecidos
      );


    teste(

      '17 — Problema desconhecido vira INVESTIGAR',

      resultadoDesconhecido.classificacao ===
        TRIAGEM_V1.CLASSIFICACOES.INVESTIGAR,

      JSON.stringify(
        resultadoDesconhecido
      )

    );


    /**
     * ========================================================
     * TESTE 19 — FORA DO ESCOPO
     * ========================================================
     */

    const sinaisForaEscopo = {

      empresa_id:
        inicio.empresa_id,

      conversa_id:
        inicio.conversa_id,

      dor:
        'necessidade de defesa jurídica',

      processo:
        'processo trabalhista',

      impacto:
        'necessidade de representação jurídica',

      frequencia:
        'pontual',

      possibilidade_de_atuacao:
        'NAO',

      problema_fora_escopo:
        true

    };


    const resultadoForaEscopo =
      avaliarCompatibilidadeTriagemV1_(
        sinaisForaEscopo
      );


    teste(

      '18 — Fora do escopo vira NAO_COMPATIVEL',

      resultadoForaEscopo.classificacao ===
        TRIAGEM_V1.CLASSIFICACOES.NAO_COMPATIVEL,

      JSON.stringify(
        resultadoForaEscopo
      )

    );


    /**
     * ========================================================
     * TESTE 20 — AGUARDANDO EMPRESÁRIO
     * ========================================================
     */

    const resultadoAguardando =
      avaliarCompatibilidadeTriagemV1_({

        empresa_id:
          inicio.empresa_id,

        conversa_id:
          inicio.conversa_id,

        classificacao:
          'AGUARDANDO_EMPRESARIO'

      });


    teste(

      '19 — Empresário interrompe conversa',

      resultadoAguardando.classificacao ===
        TRIAGEM_V1.CLASSIFICACOES.AGUARDANDO_EMPRESARIO,

      JSON.stringify(
        resultadoAguardando
      )

    );


    /**
     * ========================================================
     * TESTE 21 — IDEMPOTÊNCIA DO MOTOR
     * ========================================================
     */

    const resultadoRepetido =
      avaliarCompatibilidadeTriagemV1_(
        sinais
      );


    teste(

      '20 — Mesma entrada produz mesma decisão',

      JSON.stringify(
        resultadoTriagem
      ) ===
      JSON.stringify(
        resultadoRepetido
      ),

      'Primeiro: ' +
      JSON.stringify(
        resultadoTriagem
      ) +
      ' | Segundo: ' +
      JSON.stringify(
        resultadoRepetido
      )

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
      'RESULTADO INTEGRAÇÃO TRIAGEM V1: ' +
      aprovados +
      '/' +
      total
    );

    Logger.log(
      'FALHAS INTEGRAÇÃO TRIAGEM V1: ' +
      (
        total -
        aprovados
      )
    );

    Logger.log(
      'PERCENTUAL INTEGRAÇÃO TRIAGEM V1: ' +
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
        'INTEGRAÇÃO TRIAGEM V1 FALHOU: ' +
        aprovados +
        '/' +
        total
      );

    }


    Logger.log(
      'TESTAR_INTEGRACAO_TRIAGEM_V1: PASSOU'
    );

    Logger.log(
      'TRIAGEM V1 INTEGRADA: 100%'
    );


    return {

      sucesso:
        true,

      total:
        total,

      aprovados:
        aprovados,

      falhas:
        total -
        aprovados,

      percentual:
        percentual,

      resultados:
        resultados,

      triagem:
        resultadoTriagem

    };


  } finally {

    /**
     * ========================================================
     * LIMPEZA
     * ========================================================
     *
     * Remove somente os registros criados por este teste.
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
          'LIMPEZA INTEGRAÇÃO TRIAGEM V1 CONCLUÍDA'
        );

      } catch (
        erroLimpeza
      ) {

        Logger.log(
          'FALHA NA LIMPEZA TRIAGEM V1: ' +
          erroLimpeza.message
        );

      }

    }

  }

}function TESTAR_PAYLOAD_DIAGNOSTICO_GEMINI_V1() {

  Logger.log('============================================================');
  Logger.log('TESTE ISOLADO — PAYLOAD REAL DO DIAGNÓSTICO V1');
  Logger.log('============================================================');

  const mensagem =
    'Minha equipe passa horas todos os dias copiando informações de pedidos entre planilhas e sistemas diferentes. Isso gera erros e retrabalho. Processamos cerca de 100 pedidos por dia.';

  Logger.log('');
  Logger.log('MODELO CONFIGURADO:');
  Logger.log(obterGeminiModel_());

  Logger.log('');
  Logger.log('MENSAGEM DE TESTE:');
  Logger.log(mensagem);

  Logger.log('');
  Logger.log('------------------------------------------------------------');
  Logger.log('CONSTRUINDO PAYLOAD REAL DO DIAGNÓSTICO');
  Logger.log('------------------------------------------------------------');

  const apiKey =
    obterGeminiApiKey_();

  const model =
    obterGeminiModel_();

  const url =
    construirUrlGemini_(model);

  const schema =
    obterSchemaDiagnostico_();

  const prompt =
    construirPromptDiagnostico_(
      mensagem
    );

  const payload = {

    contents: [
      {
        role: 'user',

        parts: [
          {
            text: prompt
          }
        ]
      }
    ],

    generationConfig: {

      responseMimeType:
        'application/json',

      responseSchema:
        schema,

      maxOutputTokens:
        600,

      thinkingConfig: {
        thinkingLevel:
          'minimal'
      }

    }

  };

  Logger.log('');
  Logger.log('PAYLOAD CONSTRUÍDO COM SUCESSO.');

  Logger.log(
    'TAMANHO DO PROMPT: ' +
    prompt.length +
    ' caracteres.'
  );

  Logger.log(
    'TAMANHO DO PAYLOAD: ' +
    JSON.stringify(payload).length +
    ' caracteres.'
  );

  Logger.log('');
  Logger.log('------------------------------------------------------------');
  Logger.log('ENVIANDO PAYLOAD PARA GEMINI');
  Logger.log('------------------------------------------------------------');

  let resultado;

  try {

    resultado =
      executarGemini_(
        url,
        payload,
        apiKey
      );

  } catch (erro) {

    Logger.log('');
    Logger.log(
      '❌ FALHA NA CHAMADA DO PAYLOAD REAL.'
    );

    Logger.log(
      String(erro)
    );

    Logger.log('');
    Logger.log(
      'DIAGNÓSTICO DO TESTE:'
    );

    Logger.log(
      'A API/key/model funcionaram no teste simples,'
    );

    Logger.log(
      'mas o payload estruturado do diagnóstico'
    );

    Logger.log(
      'não conseguiu completar a chamada.'
    );

    throw erro;
  }

  Logger.log('');
  Logger.log('------------------------------------------------------------');
  Logger.log('RESPOSTA RECEBIDA');
  Logger.log('------------------------------------------------------------');

  Logger.log(
    'HTTP STATUS: ' +
    resultado.status_code
  );

  Logger.log(
    'TEMPO TOTAL: ' +
    resultado.tempo_ms +
    ' ms'
  );

  Logger.log(
    'TENTATIVAS: ' +
    resultado.tentativas
  );

  const texto =
    extrairTextoGemini_(
      resultado.dados
    );

  Logger.log('');
  Logger.log('TEXTO RETORNADO:');
  Logger.log(texto);

  Logger.log('');
  Logger.log('------------------------------------------------------------');
  Logger.log('VALIDANDO JSON');
  Logger.log('------------------------------------------------------------');

  let dados;

  try {

    dados =
      JSON.parse(
        texto
      );

  } catch (erro) {

    Logger.log(
      '❌ JSON INVÁLIDO.'
    );

    throw new Error(
      'O Gemini respondeu, mas o conteúdo não pôde ser convertido em JSON: ' +
      texto
    );

  }

  Logger.log(
    'JSON VÁLIDO: SIM'
  );

  Logger.log('');
  Logger.log('------------------------------------------------------------');
  Logger.log('VALIDANDO ESTRUTURA DO DIAGNÓSTICO');
  Logger.log('------------------------------------------------------------');

  validarDiagnosticoIA_(
    dados
  );

  Logger.log(
    'ESTRUTURA VÁLIDA: SIM'
  );

  Logger.log('');
  Logger.log('RESULTADO INTERPRETADO:');

  Logger.log(
    JSON.stringify(
      dados,
      null,
      2
    )
  );

  Logger.log('');
  Logger.log('============================================================');
  Logger.log('RESULTADO FINAL');
  Logger.log('============================================================');

  Logger.log(
    'PAYLOAD DIAGNÓSTICO GEMINI V1: 100%'
  );

  Logger.log(
    'HTTP: ' +
    resultado.status_code
  );

  Logger.log(
    'JSON: VÁLIDO'
  );

  Logger.log(
    'SCHEMA: VÁLIDO'
  );

  Logger.log(
    '============================================================'
  );

  return {

    sucesso: true,

    modelo:
      model,

    status_code:
      resultado.status_code,

    tempo_ms:
      resultado.tempo_ms,

    tentativas:
      resultado.tentativas,

    dados:
      dados

  };

}

function TESTAR_PAYLOAD_DIAGNOSTICO_GEMINI_V1() {

  Logger.log('============================================================');
  Logger.log('TESTE ISOLADO — PAYLOAD REAL DO DIAGNÓSTICO V1');
  Logger.log('============================================================');

  const mensagem =
    'Minha equipe passa horas todos os dias copiando informações de pedidos entre planilhas e sistemas diferentes. Isso gera erros e retrabalho. Processamos cerca de 100 pedidos por dia.';

  Logger.log('');
  Logger.log('MODELO CONFIGURADO:');
  Logger.log(obterGeminiModel_());

  Logger.log('');
  Logger.log('MENSAGEM DE TESTE:');
  Logger.log(mensagem);

  Logger.log('');
  Logger.log('------------------------------------------------------------');
  Logger.log('CONSTRUINDO PAYLOAD REAL DO DIAGNÓSTICO');
  Logger.log('------------------------------------------------------------');

  const apiKey =
    obterGeminiApiKey_();

  const model =
    obterGeminiModel_();

  const url =
    construirUrlGemini_(model);

  const schema =
    obterSchemaDiagnostico_();

  const prompt =
    construirPromptDiagnostico_(
      mensagem
    );

  const payload = {

    contents: [
      {
        role: 'user',

        parts: [
          {
            text: prompt
          }
        ]
      }
    ],

    generationConfig: {

      responseMimeType:
        'application/json',

      responseSchema:
        schema,

      maxOutputTokens:
        600,

      thinkingConfig: {
        thinkingLevel:
          'minimal'
      }

    }

  };

  Logger.log('');
  Logger.log('PAYLOAD CONSTRUÍDO COM SUCESSO.');

  Logger.log(
    'TAMANHO DO PROMPT: ' +
    prompt.length +
    ' caracteres.'
  );

  Logger.log(
    'TAMANHO DO PAYLOAD: ' +
    JSON.stringify(payload).length +
    ' caracteres.'
  );

  Logger.log('');
  Logger.log('------------------------------------------------------------');
  Logger.log('ENVIANDO PAYLOAD PARA GEMINI');
  Logger.log('------------------------------------------------------------');

  let resultado;

  try {

    resultado =
      executarGemini_(
        url,
        payload,
        apiKey
      );

  } catch (erro) {

    Logger.log('');
    Logger.log(
      '❌ FALHA NA CHAMADA DO PAYLOAD REAL.'
    );

    Logger.log(
      String(erro)
    );

    Logger.log('');
    Logger.log(
      'DIAGNÓSTICO DO TESTE:'
    );

    Logger.log(
      'A API/key/model funcionaram no teste simples,'
    );

    Logger.log(
      'mas o payload estruturado do diagnóstico'
    );

    Logger.log(
      'não conseguiu completar a chamada.'
    );

    throw erro;
  }

  Logger.log('');
  Logger.log('------------------------------------------------------------');
  Logger.log('RESPOSTA RECEBIDA');
  Logger.log('------------------------------------------------------------');

  Logger.log(
    'HTTP STATUS: ' +
    resultado.status_code
  );

  Logger.log(
    'TEMPO TOTAL: ' +
    resultado.tempo_ms +
    ' ms'
  );

  Logger.log(
    'TENTATIVAS: ' +
    resultado.tentativas
  );

  const texto =
    extrairTextoGemini_(
      resultado.dados
    );

  Logger.log('');
  Logger.log('TEXTO RETORNADO:');
  Logger.log(texto);

  Logger.log('');
  Logger.log('------------------------------------------------------------');
  Logger.log('VALIDANDO JSON');
  Logger.log('------------------------------------------------------------');

  let dados;

  try {

    dados =
      JSON.parse(
        texto
      );

  } catch (erro) {

    Logger.log(
      '❌ JSON INVÁLIDO.'
    );

    throw new Error(
      'O Gemini respondeu, mas o conteúdo não pôde ser convertido em JSON: ' +
      texto
    );

  }

  Logger.log(
    'JSON VÁLIDO: SIM'
  );

  Logger.log('');
  Logger.log('------------------------------------------------------------');
  Logger.log('VALIDANDO ESTRUTURA DO DIAGNÓSTICO');
  Logger.log('------------------------------------------------------------');

  validarDiagnosticoIA_(
    dados
  );

  Logger.log(
    'ESTRUTURA VÁLIDA: SIM'
  );

  Logger.log('');
  Logger.log('RESULTADO INTERPRETADO:');

  Logger.log(
    JSON.stringify(
      dados,
      null,
      2
    )
  );

  Logger.log('');
  Logger.log('============================================================');
  Logger.log('RESULTADO FINAL');
  Logger.log('============================================================');

  Logger.log(
    'PAYLOAD DIAGNÓSTICO GEMINI V1: 100%'
  );

  Logger.log(
    'HTTP: ' +
    resultado.status_code
  );

  Logger.log(
    'JSON: VÁLIDO'
  );

  Logger.log(
    'SCHEMA: VÁLIDO'
  );

  Logger.log(
    '============================================================'
  );

  return {

    sucesso: true,

    modelo:
      model,

    status_code:
      resultado.status_code,

    tempo_ms:
      resultado.tempo_ms,

    tentativas:
      resultado.tentativas,

    dados:
      dados

  };

}