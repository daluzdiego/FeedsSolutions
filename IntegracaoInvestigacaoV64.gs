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

function obterOuCriarEstadoInvestigacaoV64_(diagnostico, contexto, mensagemAtual) {
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
  if (Array.isArray(investigacao.excecoes) && investigacao.excecoes.length) {
    atualizarFatoV64_(estado, 'excecoes', investigacao.excecoes.join('; '), null, CERTEZA_V64.ESTIMADO, 'baseline-v6.3');
  }

  reconstruirHistoricoInvestigacaoV64_(estado, contexto.historico, mensagemAtual);
  return { estado: estado, investigacao: investigacao, inicializado: true };
}

/**
 * Reconstrói o contexto legado em ordem cronológica sem duplicar a mensagem
 * atual, que já foi salva pelo fluxo V6.3 e será inserida pelo motor V6.4.
 * A pergunta só fica pendente quando a última mensagem relevante do sistema
 * é uma pergunta real e nenhum turno posterior do empresário a respondeu.
 */
function reconstruirHistoricoInvestigacaoV64_(estado, historico, mensagemAtual) {
  var itens = Array.isArray(historico) ? historico : [];
  var atual = String(mensagemAtual || '').trim();
  var indiceMensagemAtual = -1;

  if (atual) {
    for (var busca = itens.length - 1; busca >= 0; busca--) {
      var candidato = itens[busca] || {};
      if (String(candidato.remetente || '').toUpperCase() === 'EMPRESARIO' &&
          String(candidato.mensagem || '').trim() === atual) {
        indiceMensagemAtual = busca;
        break;
      }
    }
  }

  // Preservar a cronologia mais recente limita o prompt e evita remontar
  // conversas indefinidamente longas em cada nova mensagem.
  var inicio = Math.max(0, itens.length - 16);
  var perguntaPendente = null;

  for (var i = inicio; i < itens.length; i++) {
    if (i === indiceMensagemAtual) continue;
    var item = itens[i] || {};
    var texto = String(item.mensagem || '').trim();
    var remetente = String(item.remetente || '').trim().toUpperCase();
    var tipo = String(item.tipo || '').trim().toUpperCase();
    if (!texto) continue;

    adicionarTurnoHistoricoV64_(estado, {
      id: 'LEGADO_' + (item.ordem || i + 1),
      papel: remetente,
      texto: texto,
      dataHora: item.timestamp || null,
      origem: 'historico-v6.3'
    });

    var perguntaExplícita = /^(PERGUNTA_IA|PERGUNTA_DIAGNOSTICO|PERGUNTA_INVESTIGACAO|PERGUNTA_INVESTIGATIVA)$/.test(tipo);
    var perguntaNatural = remetente === 'SISTEMA' &&
      /\?/.test(texto) &&
      /\b(qual|quais|como|quando|onde|quantos|quantas|quanto|quanta|por que|quem|o que|existe|costuma|acontece|consegue|há|tem)\b/i.test(texto);
    var ePergunta = (perguntaExplícita || perguntaNatural) && remetente === 'SISTEMA';

    if (ePergunta) {
      var dimensao = inferirDimensaoPerguntaV64_(texto);
      var jaExiste = estado.perguntasFeitas.some(function(p) {
        return normalizarPerguntaInvestigacaoV64_(p.texto) === normalizarPerguntaInvestigacaoV64_(texto);
      });
      if (!jaExiste) {
        registrarPerguntaFeitaV64_(estado, texto, dimensao, 'LEGADO_Q_' + (item.ordem || i + 1));
      }
      perguntaPendente = { id: 'LEGADO_Q_' + (item.ordem || i + 1), dimensao: dimensao, texto: texto };
    } else if (remetente === 'EMPRESARIO' ||
               (remetente === 'SISTEMA' && perguntaPendente)) {
      // Uma fala posterior do empresário responde à pergunta pendente anterior.
      // Mensagens genéricas posteriores do sistema também não devem deixá-la ativa.
      perguntaPendente = null;
    }
  }

  if (perguntaPendente) {
    definirPerguntaPendenteV64_(estado, perguntaPendente);
  } else {
    estado.perguntaPendente = null;
  }
  return {
    historicoImportado: estado.historico.length,
    perguntasImportadas: estado.perguntasFeitas.length,
    perguntaPendente: estado.perguntaPendente
  };
}

function inferirDimensaoPerguntaV64_(texto) {
  var t = normalizarPerguntaInvestigacaoV64_(texto);
  if (/horario|horarios|pico|maior movimento|distribuicao ao longo do dia|em que periodo|turno/.test(t)) return 'frequencia';
  if (/objetivo|resultado deseja|melhorar|alcancar/.test(t)) return 'objetivo';
  if (/aceitacao|criterio de sucesso|considerar concluido|funcionou|sucesso/.test(t)) return 'aceitacao';
  if (/restricao|orcamento|prazo|permissao|seguranca|integracao|ferramenta|sistema|canal/.test(t)) return 'restricoes';
  if (/excecao|fora do padrao|regra especial/.test(t)) return 'excecoes';
  if (/tempo|custo|impacto|atraso|retrabalho|consequencia|erro|perda|prejuizo/.test(t)) return 'impacto';
  if (/quant|volume|pedidos por|itens por|quantidade diaria|quantidade semanal/.test(t)) return 'escala';
  if (/frequencia|diariamente|semanalmente|mensalmente|quantas vezes|periodicidade/.test(t)) return 'frequencia';
  if (/dor|problema|falha|etapa|causa/.test(t)) return 'dor_causa';
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

function reconciliarPerguntaPendenteV64_(estado, perguntaDoHistorico) {
  var textoHistorico = String(perguntaDoHistorico || '').trim();
  var textoEstado = String(estado && estado.perguntaPendente && estado.perguntaPendente.texto || '').trim();
  if (!textoHistorico) {
    if (estado) estado.perguntaPendente = null;
    return estado;
  }
  if (normalizarPerguntaInvestigacaoV64_(textoHistorico) !== normalizarPerguntaInvestigacaoV64_(textoEstado)) {
    var jaRegistrada = (estado.perguntasFeitas || []).some(function(p) {
      return normalizarPerguntaInvestigacaoV64_(typeof p === 'string' ? p : p.texto) === normalizarPerguntaInvestigacaoV64_(textoHistorico);
    });
    if (!jaRegistrada) {
      registrarPerguntaFeitaV64_(estado, textoHistorico, inferirDimensaoPerguntaV64_(textoHistorico));
    }
    definirPerguntaPendenteV64_(estado, {
      id: 'PENDENTE_RECONCILIADO_V64_' + new Date().getTime(),
      dimensao: inferirDimensaoPerguntaV64_(textoHistorico),
      texto: textoHistorico
    });
  }
  return estado;
}

function processarTurnoPersistidoV64_(diagnostico, contexto, mensagem) {
  var carregado = obterOuCriarEstadoInvestigacaoV64_(diagnostico, contexto, mensagem);
  reconciliarPerguntaPendenteV64_(carregado.estado, contexto && contexto.pergunta_pendente);
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
