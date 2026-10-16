/**
 * FEEDS SOLUTIONS V6.4 — ESTADO EXPLÍCITO DA INVESTIGAÇÃO
 *
 * Este módulo é aditivo e ainda não altera o fluxo de produção.
 * Ele define o contrato estruturado de fatos, evidências, lacunas e turnos.
 * Não renomeia nem modifica os campos legados da V6.3.
 */

var DIMENSOES_V64 = {
  PROCESSO: 'processo',
  DOR_CAUSA: 'dor_causa',
  ESCALA: 'escala',
  IMPACTO: 'impacto',
  EXCECOES: 'excecoes',
  OBJETIVO: 'objetivo',
  RESTRICOES: 'restricoes',
  ACEITACAO: 'aceitacao'
};

var CERTEZA_V64 = {
  CONFIRMADO: 'CONFIRMADO',
  ESTIMADO: 'ESTIMADO',
  NEGADO: 'NEGADO',
  DESCONHECIDO: 'DESCONHECIDO'
};

function criarEstadoInvestigacaoVazioV64_() {
  var fatos = {};
  var lacunas = {};
  Object.keys(DIMENSOES_V64).forEach(function(chave) {
    var dimensao = DIMENSOES_V64[chave];
    fatos[dimensao] = {
      valor: null,
      evidencia: null,
      certeza: CERTEZA_V64.DESCONHECIDO,
      origem: null,
      conflitos: []
    };
    lacunas[dimensao] = true;
  });

  return {
    versao: 'V6.4',
    fatos: fatos,
    lacunas: lacunas,
    perguntasFeitas: [],
    perguntaPendente: null,
    historico: [],
    conflitos: [],
    atualizadoEm: new Date().toISOString()
  };
}

/**
 * Atualiza um fato sem apagar silenciosamente informação anterior.
 *
 * - Um fato confirmado não é substituído por um valor conflitante.
 * - Contradições são guardadas em fato.conflitos e estado.conflitos.
 * - Uma nova confirmação explícita pode atualizar um fato estimado.
 * - NEGADO representa uma resposta explícita como "não se aplica" ou
 *   "não sei"; o subtipo deve ser indicado em certezaDetalhe quando possível.
 */
function atualizarFatoV64_(estado, dimensao, valor, evidencia, certeza, origem, opcoes) {
  if (!estado || typeof estado !== 'object') {
    throw new Error('ESTADO_INVESTIGACAO_V64_INVALIDO');
  }
  if (!estado.fatos || !estado.lacunas) {
    throw new Error('ESTRUTURA_FATOS_LACUNAS_V64_AUSENTE');
  }
  if (Object.keys(DIMENSOES_V64).map(function(k) {
    return DIMENSOES_V64[k];
  }).indexOf(dimensao) === -1) {
    throw new Error('DIMENSAO_INVESTIGACAO_V64_INVALIDA: ' + dimensao);
  }

  opcoes = opcoes || {};
  certeza = String(certeza || CERTEZA_V64.DESCONHECIDO).toUpperCase();
  if (!Object.keys(CERTEZA_V64).some(function(k) { return CERTEZA_V64[k] === certeza; })) {
    throw new Error('CERTEZA_INVESTIGACAO_V64_INVALIDA: ' + certeza);
  }

  var valorNovo = valor === undefined || valor === null || String(valor).trim() === ''
    ? null : valor;
  var evidenciaNova = evidencia === undefined || evidencia === null || String(evidencia).trim() === ''
    ? null : String(evidencia).trim();
  var fatoAnterior = estado.fatos[dimensao] || {
    valor: null,
    evidencia: null,
    certeza: CERTEZA_V64.DESCONHECIDO,
    origem: null,
    conflitos: []
  };

  if (!Array.isArray(fatoAnterior.conflitos)) fatoAnterior.conflitos = [];

  var anteriorConfirmado = fatoAnterior.certeza === CERTEZA_V64.CONFIRMADO;
  var novoValorContradiz = valorNovo !== null &&
    fatoAnterior.valor !== null &&
    String(valorNovo).trim().toLowerCase() !== String(fatoAnterior.valor).trim().toLowerCase();

  if (anteriorConfirmado && novoValorContradiz) {
    var conflito = {
      dimensao: dimensao,
      valorAnterior: fatoAnterior.valor,
      evidenciaAnterior: fatoAnterior.evidencia || null,
      origemAnterior: fatoAnterior.origem || null,
      valorNovo: valorNovo,
      evidenciaNova: evidenciaNova,
      origemNova: origem === undefined ? null : origem,
      certezaNova: certeza,
      registradoEm: new Date().toISOString(),
      resolvido: false
    };
    fatoAnterior.conflitos.push(conflito);
    estado.fatos[dimensao] = fatoAnterior;
    if (!Array.isArray(estado.conflitos)) estado.conflitos = [];
    estado.conflitos.push(conflito);
    estado.lacunas[dimensao] = true;
    estado.atualizadoEm = new Date().toISOString();
    return {
      atualizado: false,
      conflito: true,
      fato: fatoAnterior,
      conflitoRegistrado: conflito
    };
  }

  // Não substituir confirmação por estimativa/negação/desconhecimento.
  if (anteriorConfirmado && certeza !== CERTEZA_V64.CONFIRMADO && !opcoes.forcarResolucao) {
    return {
      atualizado: false,
      conflito: false,
      preservado: true,
      fato: fatoAnterior
    };
  }

  // Mesmo valor confirmado: preservar a descoberta e acumular evidência nova.
  if (anteriorConfirmado && certeza === CERTEZA_V64.CONFIRMADO && !novoValorContradiz) {
    if (evidenciaNova && evidenciaNova !== fatoAnterior.evidencia) {
      if (!Array.isArray(fatoAnterior.evidenciasAdicionais)) fatoAnterior.evidenciasAdicionais = [];
      fatoAnterior.evidenciasAdicionais.push({
        evidencia: evidenciaNova,
        origem: origem === undefined ? null : origem,
        registradoEm: new Date().toISOString()
      });
    }
    estado.fatos[dimensao] = fatoAnterior;
    estado.lacunas[dimensao] = false;
    estado.atualizadoEm = new Date().toISOString();
    return { atualizado: true, conflito: false, fato: fatoAnterior, evidênciaAdicionada: !!evidenciaNova };
  }

  estado.fatos[dimensao] = {
    valor: valorNovo,
    evidencia: evidenciaNova,
    certeza: certeza,
    origem: origem === undefined ? null : origem,
    certezaDetalhe: opcoes.certezaDetalhe || null,
    conflitos: fatoAnterior.conflitos.slice(),
    atualizadoEm: new Date().toISOString()
  };

  // ESTIMADO mantém a dimensão em aberto para confirmação; DESCONHECIDO também.
  estado.lacunas[dimensao] = certeza !== CERTEZA_V64.CONFIRMADO &&
    certeza !== CERTEZA_V64.NEGADO;
  estado.atualizadoEm = new Date().toISOString();

  return {
    atualizado: true,
    conflito: false,
    fato: estado.fatos[dimensao]
  };
}

function registrarPerguntaFeitaV64_(estado, pergunta, dimensao, id, dataHora) {
  if (!estado || !Array.isArray(estado.perguntasFeitas)) {
    throw new Error('ESTADO_OU_LISTA_PERGUNTAS_V64_INVALIDO');
  }
  var texto = String(pergunta || '').trim();
  if (!texto) throw new Error('TEXTO_PERGUNTA_V64_VAZIO');

  var registro = {
    id: id || 'PERGUNTA_V64_' + (estado.perguntasFeitas.length + 1),
    dimensao: dimensao || null,
    texto: texto,
    dataHora: dataHora || new Date().toISOString()
  };
  estado.perguntasFeitas.push(registro);
  estado.atualizadoEm = new Date().toISOString();
  return registro;
}

function definirPerguntaPendenteV64_(estado, pergunta, dimensao, id, dataHora) {
  if (!estado || typeof estado !== 'object') throw new Error('ESTADO_INVESTIGACAO_V64_INVALIDO');
  if (!pergunta || !String(pergunta.texto || '').trim()) {
    estado.perguntaPendente = null;
    return null;
  }
  estado.perguntaPendente = {
    id: pergunta.id || id || 'PENDENTE_V64_' + new Date().getTime(),
    dimensao: pergunta.dimensao || dimensao || null,
    texto: String(pergunta.texto).trim(),
    tipo: 'PERGUNTA_INVESTIGATIVA',
    dataHora: pergunta.dataHora || dataHora || new Date().toISOString()
  };
  estado.atualizadoEm = new Date().toISOString();
  return estado.perguntaPendente;
}

function adicionarTurnoHistoricoV64_(estado, turno) {
  if (!estado || !Array.isArray(estado.historico)) throw new Error('HISTORICO_INVESTIGACAO_V64_INVALIDO');
  if (!turno || typeof turno !== 'object') throw new Error('TURNO_INVESTIGACAO_V64_INVALIDO');
  var registro = {
    id: turno.id || 'TURNO_V64_' + (estado.historico.length + 1),
    papel: turno.papel || null,
    texto: String(turno.texto || ''),
    dataHora: turno.dataHora || new Date().toISOString(),
    origem: turno.origem || null
  };
  estado.historico.push(registro);
  estado.atualizadoEm = new Date().toISOString();
  return registro;
}

function validarEstadoInvestigacaoV64_(estado) {
  var erros = [];
  if (!estado || typeof estado !== 'object') return { valido: false, erros: ['ESTADO_AUSENTE'] };
  if (!estado.fatos || !estado.lacunas) return { valido: false, erros: ['FATOS_OU_LACUNAS_AUSENTES'] };
  Object.keys(DIMENSOES_V64).forEach(function(chave) {
    var dim = DIMENSOES_V64[chave];
    var fato = estado.fatos[dim];
    if (!fato) erros.push('FATO_AUSENTE:' + dim);
    else if (!Object.keys(CERTEZA_V64).some(function(k) { return CERTEZA_V64[k] === fato.certeza; })) {
      erros.push('CERTEZA_INVALIDA:' + dim);
    }
    if (typeof estado.lacunas[dim] !== 'boolean') erros.push('LACUNA_INVALIDA:' + dim);
  });
  if (!Array.isArray(estado.perguntasFeitas)) erros.push('PERGUNTAS_FEITAS_INVALIDAS');
  if (!Array.isArray(estado.historico)) erros.push('HISTORICO_INVALIDO');
  return { valido: erros.length === 0, erros: erros };
}
