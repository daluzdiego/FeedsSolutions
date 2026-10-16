/**
 * FEEDS SOLUTIONS V6.4 — ADAPTADOR ENTRE MOTOR V64 E O FLUXO V63
 *
 * O motor novo permanece atrás de uma chave de ativação explícita até que
 * os testes reais no Apps Script/Gemini sejam executados.
 * Não modifica interface nem esquema de colunas; usa INVESTIGACOES.informacoes.
 */
var FEEDS_MOTOR_INVESTIGACAO_V64_ATIVO = false;

function motorInvestigacaoV64Ativo_() {
  return FEEDS_MOTOR_INVESTIGACAO_V64_ATIVO === true;
}

function obterOuCriarEstadoInvestigacaoV64_(diagnostico, contexto) {
  diagnostico = diagnostico || {};
  contexto = contexto || {};
  if (typeof buscarInvestigacaoV62_ !== 'function' ||
      typeof salvarInvestigacaoV62_ !== 'function' ||
      typeof iniciarInvestigacaoV62_ !== 'function') {
    throw new Error('DEPENDENCIAS_PERSISTENCIA_INVESTIGACAO_V64_AUSENTES');
  }

  var investigacao = buscarInvestigacaoV62_({ diagnostico_id: diagnostico.diagnostico_id });
  if (!investigacao) {
    var inicial = iniciarInvestigacaoV62_({
      empresa_id: diagnostico.empresa_id || '',
      conversa_id: diagnostico.conversa_id || '',
      diagnostico_id: diagnostico.diagnostico_id || '',
      dor: diagnostico.dor_principal || '',
      processo: diagnostico.processo_resumo || diagnostico.processo_nome || '',
      impacto: diagnostico.impacto_nivel || '',
      frequencia: diagnostico.frequencia || '',
      contexto: diagnostico.processo_nome || '',
      objetivo: diagnostico.objetivo || ''
    });
    var salvo = salvarInvestigacaoV62_(inicial);
    investigacao = buscarInvestigacaoV62_({
      investigacao_id: salvo && salvo.investigacao_id || inicial.investigacao_id,
      diagnostico_id: diagnostico.diagnostico_id
    });
  }
  if (!investigacao) throw new Error('NAO_FOI_POSSIVEL_CRIAR_INVESTIGACAO_V64');

  var estado = carregarEstadoInvestigacaoV64_(investigacao);
  if (estado) return { estado: estado, investigacao: investigacao, inicializado: false };

  estado = criarEstadoInvestigacaoVazioV64_();
  var fatosLegados = [
    ['processo', diagnostico.processo_resumo || diagnostico.processo_nome || investigacao.processo || ''],
    ['dor_causa', diagnostico.dor_principal || investigacao.problema_central || ''],
    ['escala', contexto.diagnostico && contexto.diagnostico.volume || diagnostico.volume || ''],
    ['frequencia', diagnostico.frequencia || investigacao.frequencia || ''],
    ['impacto', diagnostico.impacto_nivel || (investigacao.impacto && investigacao.impacto.descricao) || ''],
    ['objetivo', diagnostico.objetivo || investigacao.resultado_desejado || '']
  ];
  fatosLegados.forEach(function(par) {
    if (String(par[1] || '').trim()) {
      atualizarFatoV64_(estado, par[0], par[1], null, CERTEZA_V64.ESTIMADO, 'baseline-v6.3');
    }
  });

  var historico = Array.isArray(contexto.historico) ? contexto.historico : [];
  var perguntaMaisRecente = null;
  historico.forEach(function(item, indice) {
    if (!item) return;
    var texto = String(item.mensagem || '').trim();
    var remetente = String(item.remetente || '').toUpperCase();
    var tipo = String(item.tipo || '').toUpperCase();
    if (!texto) return;

    // O último turno do empresário já foi salvo no fluxo legado e será
    // registrado por processarTurnoInvestigacaoV64_ para evitar duplicação.
    if (remetente === 'EMPRESARIO' && indice === historico.length - 1) return;

    adicionarTurnoHistoricoV64_(estado, {
      id: 'LEGADO_' + (item.ordem || indice + 1),
      papel: remetente,
      texto: texto,
      dataHora: item.timestamp || null,
      origem: 'historico-v6.3'
    });

    if (/^(PERGUNTA_IA|PERGUNTA_DIAGNOSTICO|PERGUNTA_INVESTIGACAO|PERGUNTA_INVESTIGATIVA)$/.test(tipo)) {
      var dimensao = inferirDimensaoPerguntaV64_(texto);
      registrarPerguntaFeitaV64_(estado, texto, dimensao, 'LEGADO_Q_' + (item.ordem || indice + 1));
      perguntaMaisRecente = { id: 'LEGADO_Q_' + (item.ordem || indice + 1), dimensao: dimensao, texto: texto };
    }
  });
  if (perguntaMaisRecente) definirPerguntaPendenteV64_(estado, perguntaMaisRecente);
  return { estado: estado, investigacao: investigacao, inicializado: true };
}

function inferirDimensaoPerguntaV64_(texto) {
  var t = normalizarPerguntaInvestigacaoV64_(texto);
  if (/objetivo|resultado deseja|melhorar|alcancar/.test(t)) return 'objetivo';
  if (/aceitacao|considerar concluido|funcionou|sucesso/.test(t)) return 'aceitacao';
  if (/restricao|orcamento|prazo|permissao|seguranca|integracao|ferramenta|sistema|canal/.test(t)) return 'restricoes';
  if (/excecao|fora do padrao|regra especial/.test(t)) return 'excecoes';
  if (/tempo|custo|impacto|atraso|retrabalho|consequencia|erro/.test(t)) return 'impacto';
  if (/quant|volume|pedidos por|itens por/.test(t)) return 'escala';
  if (/frequencia|diariamente|semanalmente|quantas vezes/.test(t)) return 'frequencia';
  if (/dor|problema|falha|etapa/.test(t)) return 'dor_causa';
  return 'processo';
}

function mapearResultadoMotorV64ParaAnaliseLegada_(resultado) {
  var estado = resultado && resultado.estado || {};
  var fatos = estado.fatos || {};
  function valor(dim) {
    var fato = fatos[dim];
    if (!fato || fato.certeza === CERTEZA_V64.DESCONHECIDO || fato.certeza === CERTEZA_V64.NEGADO) return '';
    return String(fato.valor || '');
  }
  var pergunta = String(resultado && resultado.proxima_pergunta || '').trim();
  var gate = resultado && resultado.gate || {};
  return {
    processo: valor('processo'),
    dor_principal: valor('dor_causa'),
    volume: valor('escala'),
    frequencia: valor('frequencia'),
    impacto: valor('impacto'),
    objetivo: valor('objetivo'),
    excecoes: valor('excecoes'),
    restricoes: valor('restricoes'),
    criterios_aceitacao: valor('aceitacao'),
    informacao_faltante: resultado && resultado.decisao_pergunta && resultado.decisao_pergunta.lacunaQueReduz ||
      (gate.pode ? '' : String(gate.motivo || '')),
    proxima_pergunta: pergunta,
    respondeu_pergunta_pendente: !!(resultado && resultado.interpretacao && resultado.interpretacao.respondeuPerguntaPendente),
    estado_investigacao_v64: resultado && resultado.status_diagnostico || 'INVESTIGACAO'
  };
}

function processarTurnoPersistidoV64_(diagnostico, contexto, mensagem) {
  var carregado = obterOuCriarEstadoInvestigacaoV64_(diagnostico, contexto);
  var resultado = processarTurnoInvestigacaoV64_(carregado.estado, mensagem);
  var persistencia = persistirEstadoInvestigacaoV64_(carregado.investigacao.investigacao_id, resultado.estado);
  return {
    resultado: resultado,
    investigacao: carregado.investigacao,
    persistencia: persistencia,
    analise: mapearResultadoMotorV64ParaAnaliseLegada_(resultado)
  };
}

/**
 * Prueba de adaptación de datos legados: no accede a hojas ni llama al Gemini.
 */
function TESTAR_ADAPTADOR_INVESTIGACAO_V64() {
  var resultados = [];
  function assert(nome, ok, detalhe) { resultados.push({ teste: nome, passou: !!ok, detalhe: detalhe || '' }); }
  try {
    var estado = criarEstadoInvestigacaoVazioV64_();
    atualizarFatoV64_(estado, 'processo', 'Lançamento manual', 'Lançamos manualmente', 'CONFIRMADO', 'turno-1');
    atualizarFatoV64_(estado, 'escala', '100 pedidos por dia', 'São 100 pedidos por dia', 'CONFIRMADO', 'turno-2');
    atualizarFatoV64_(estado, 'frequencia', 'Diária', 'Todos os dias', 'CONFIRMADO', 'turno-3');
    var mapeado = mapearResultadoMotorV64ParaAnaliseLegada_({
      estado: estado,
      proxima_pergunta: 'Quais erros aparecem no lançamento?',
      status_diagnostico: 'INVESTIGACAO',
      interpretacao: { respondeuPerguntaPendente: true },
      gate: { pode: false, motivo: 'DIMENSAO_ESSENCIAL_DESCONHECIDA:impacto' }
    });
    assert('mapeia escala e frequência em campos distintos', mapeado.volume === '100 pedidos por dia' && mapeado.frequencia === 'Diária');
    assert('preserva a pergunta do motor V64', mapeado.proxima_pergunta === 'Quais erros aparecem no lançamento?');
    assert('não declara conclusão quando o gate bloqueia', mapeado.estado_investigacao_v64 === 'INVESTIGACAO' && mapeado.informacao_faltante.indexOf('impacto') !== -1);
    assert('não expõe como fato confirmado uma dimensão desconhecida', mapeado.objetivo === '');
  } catch (e) {
    resultados.push({ teste: 'execução', passou: false, detalhe: String(e && e.stack || e) });
  }
  var aprovados = resultados.filter(function(r) { return r.passou; }).length;
  var resumo = { versao: 'V6.4', suite: 'ADAPTADOR', sucesso: resultados.length === 4 && aprovados === resultados.length, total: resultados.length, aprovados: aprovados, falhas: resultados.length - aprovados, resultados: resultados };
  Logger.log('FEEDS SOLUTIONS V6.4 — ADAPTADOR: ' + JSON.stringify(resumo));
  return resumo;
}
