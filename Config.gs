/**
 * ============================================================
 * NEURO SOLUTIONS — MVP V1
 * CONFIG.GS
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * IDENTIDADE DO SISTEMA
 * ------------------------------------------------------------
 */

const APP_NAME = 'Neuro Solutions';

const APP_VERSION = 'MVP-V1';

const APP_ENVIRONMENT = 'MVP';


/**
 * ------------------------------------------------------------
 * NOMES DAS ABAS
 * ------------------------------------------------------------
 */

const SHEETS = {

  EMPRESAS: 'EMPRESAS',

  CONVERSAS: 'CONVERSAS',

  DIAGNOSTICOS: 'DIAGNOSTICOS',

  DORES: 'DORES',

  OPORTUNIDADES: 'OPORTUNIDADES',

  SOLUCOES: 'SOLUCOES',

  DIAGNOSTICO_SOLUCOES: 'DIAGNOSTICO_SOLUCOES',

  LEADS: 'LEADS',

  FEEDBACK: 'FEEDBACK',

  METRICAS: 'METRICAS',

  CONFIG: 'CONFIG'

};


/**
 * ------------------------------------------------------------
 * ESTADOS DA CONVERSA
 * ------------------------------------------------------------
 */

const ESTADOS_CONVERSA = {

  INICIO: 'INICIO',

  DESCOBERTA: 'DESCOBERTA',

  INVESTIGACAO: 'INVESTIGACAO',

  QUALIFICACAO: 'QUALIFICACAO',

  RESULTADO: 'RESULTADO',

  LEAD: 'LEAD',

  ENCERRAMENTO: 'ENCERRAMENTO',

  ABANDONO: 'ABANDONO'

};


/**
 * ------------------------------------------------------------
 * CLASSIFICAÇÕES
 * ------------------------------------------------------------
 */

const CLASSIFICACOES = {

  PODEMOS_AJUDAR: 'PODEMOS_AJUDAR',

  PRECISAMOS_AVALIAR: 'PRECISAMOS_AVALIAR',

  NAO_ENQUADRADO: 'NAO_ENQUADRADO'

};


/**
 * ------------------------------------------------------------
 * STATUS DE EMPRESA
 * ------------------------------------------------------------
 */

const STATUS_EMPRESA = {

  ATIVA: 'ATIVA',

  INATIVA: 'INATIVA'

};


/**
 * ------------------------------------------------------------
 * STATUS DO DIAGNÓSTICO
 * ------------------------------------------------------------
 */

const STATUS_DIAGNOSTICO = {

  EM_ANDAMENTO: 'EM_ANDAMENTO',

  CONCLUIDO: 'CONCLUIDO',

  ABANDONADO: 'ABANDONADO'

};


/**
 * ------------------------------------------------------------
 * STATUS DO LEAD
 * ------------------------------------------------------------
 */

const STATUS_LEAD = {

  NOVO: 'NOVO',

  EM_ANALISE: 'EM_ANALISE',

  CONTATADO: 'CONTATADO',

  PROPOSTA: 'PROPOSTA',

  FECHADO: 'FECHADO',

  PERDIDO: 'PERDIDO'

};


/**
 * ------------------------------------------------------------
 * CONFIGURAÇÕES
 * ------------------------------------------------------------
 */

const CONFIG_KEYS = {

  VERSAO_MOTOR: 'VERSAO_MOTOR',

  VERSAO_CATALOGO: 'VERSAO_CATALOGO',

  STATUS_SISTEMA: 'STATUS_SISTEMA',

  MODO_MVP: 'MODO_MVP'

};


/**
 * ------------------------------------------------------------
 * PREFIXOS DE ID
 * ------------------------------------------------------------
 */

const ID_PREFIXOS = {

  EMPRESA: 'EMP',

  CONVERSA: 'CONV',

  MENSAGEM: 'MSG',

  DIAGNOSTICO: 'DIAG',

  DOR: 'DOR',

  OPORTUNIDADE: 'OPP',

  SOLUCAO: 'SOL',

  RELACAO: 'REL',

  LEAD: 'LEAD',

  FEEDBACK: 'FDB',

  EVENTO: 'EVT'

};
/**
 * ============================================================
 * CONFIGURA PROPRIEDADES INICIAIS DO SISTEMA
 * ============================================================
 *
 * Cria somente as propriedades básicas do MVP.
 *
 * As credenciais do ADMIN NÃO são criadas aqui.
 * Elas serão configuradas separadamente pela função:
 *
 * configurarAdministradorInicial()
 *
 * ============================================================
 */
function configurarPropriedadesIniciais_() {

  const props = PropertiesService.getScriptProperties();

  const propriedades = {

    APP_NAME: APP_NAME,

    APP_VERSION: APP_VERSION,

    APP_ENVIRONMENT: APP_ENVIRONMENT,

    VERSAO_MOTOR: 'V1',

    VERSAO_CATALOGO: 'V1',

    STATUS_SISTEMA: 'DESENVOLVIMENTO',

    MODO_MVP: 'ATIVO'

  };

  const existentes = props.getProperties();

  const novas = {};

  Object.keys(propriedades).forEach(function(chave) {

    // Não sobrescreve uma propriedade que já exista.
    if (
      existentes[chave] === undefined ||
      existentes[chave] === null ||
      existentes[chave] === ''
    ) {

      novas[chave] = propriedades[chave];

    }

  });

  if (Object.keys(novas).length > 0) {

    props.setProperties(novas);

  }

  return true;
}
