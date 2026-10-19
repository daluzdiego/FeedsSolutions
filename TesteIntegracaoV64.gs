/**
 * FEEDS SOLUTIONS V6.4 — TESTES DE INTEGRAÇÃO DETERMINÍSTICOS
 * Sem Gemini e sem gravação em planilhas.
 */
function TESTAR_INTEGRACAO_V64() {
  var resultados = [];
  function assert(nome, ok, detalhe) { resultados.push({ teste: nome, passou: !!ok, detalhe: detalhe || '' }); }
  function preencherEssenciais(estado) {
    atualizarFatoV64_(estado, 'processo', 'Lançamento manual', 'Lançamos manualmente', 'CONFIRMADO', 'turno-1');
    atualizarFatoV64_(estado, 'dor_causa', 'Retrabalho', 'Precisamos conferir tudo novamente', 'CONFIRMADO', 'turno-1');
    atualizarFatoV64_(estado, 'escala', '100 pedidos por dia', 'São 100 pedidos por dia', 'CONFIRMADO', 'turno-2');
    atualizarFatoV64_(estado, 'frequencia', 'Diária', 'Todos os dias', 'CONFIRMADO', 'turno-2');
    atualizarFatoV64_(estado, 'impacto', 'Duas horas por dia', 'Perdemos duas horas por dia', 'CONFIRMADO', 'turno-3');
    atualizarFatoV64_(estado, 'objetivo', 'Reduzir retrabalho', 'Queremos reduzir retrabalho', 'CONFIRMADO', 'turno-3');
  }
  try {
    var e1 = criarEstadoInvestigacaoVazioV64_();
    var g1 = podeConcluirDiagnosticoV64_(e1);
    assert('bloqueia conclusão com dimensões essenciais desconhecidas', g1.pode === false);

    var e2 = criarEstadoInvestigacaoVazioV64_();
    preencherEssenciais(e2);
    var g2 = podeConcluirDiagnosticoV64_(e2);
    assert('objetivo confirmado sem critério de aceitação bloqueia conclusão',
      g2.pode === false && g2.motivo === 'CRITERIOS_ACEITACAO_DESCONHECIDOS');

    atualizarFatoV64_(e2, 'aceitacao', 'Empresário não definiu métrica específica', 'Não sei como medir ainda', 'NEGADO', 'turno-4', { certezaDetalhe: 'NAO_SEI' });
    var g3 = podeConcluirDiagnosticoV64_(e2);
    assert('critério explicitamente desconhecido permite concluir com ressalva',
      g3.pode === true && g3.ressalvas.indexOf('aceitacao') !== -1);

    var e4 = criarEstadoInvestigacaoVazioV64_();
    var prematura = validarPerguntaInvestigativaV64_(e4, {
      proximaPergunta: 'Como vamos medir o sucesso da solução?',
      dimensaoAlvo: 'aceitacao',
      justificativa: 'medir',
      lacunaQueReduz: 'aceitação'
    }, function() { return { equivalente: false }; });
    assert('impede pergunta prematura sobre aceitação', prematura.valida === false && prematura.motivo === 'PREMATURA');

    var e5 = criarEstadoInvestigacaoVazioV64_();
    registrarPerguntaFeitaV64_(e5, 'Qual etapa do processo gera retrabalho?', 'dor_causa', 'q1');
    definirPerguntaPendenteV64_(e5, { id: 'q1', dimensao: 'dor_causa', texto: 'Qual etapa do processo gera retrabalho?' });
    reconciliarPerguntaPendenteV64_(e5, 'Qual é a etapa que gera retrabalho?');
    assert('reconcilia pergunta pendente do histórico sem duplicar texto idêntico',
      e5.perguntaPendente.texto === 'Qual é a etapa que gera retrabalho?' && e5.perguntasFeitas.length === 2);
    reconciliarPerguntaPendenteV64_(e5, 'Qual é a etapa que gera retrabalho?');
    assert('reconciliação repetida é idempotente', e5.perguntasFeitas.length === 2);

    var e6 = criarEstadoInvestigacaoVazioV64_();
    preencherEssenciais(e6);
    atualizarFatoV64_(e6, 'aceitacao', 'Aceitação definida', 'O sistema será aceito se reduzir retrabalho pela metade', 'CONFIRMADO', 'turno-4');
    e6.conflitos.push({ dimensao: 'escala', valorAnterior: '100', valorNovo: '200', resolvido: false });
    var g6 = podeConcluirDiagnosticoV64_(e6);
    assert('conflito não resolvido bloqueia conclusão', g6.pode === false && /CONFLITO/.test(g6.motivo));

    var e7 = criarEstadoInvestigacaoVazioV64_();
    atualizarFatoV64_(e7, 'escala', '100 pedidos/dia', 'São 100 pedidos por dia', 'CONFIRMADO', 'turno-1');
    var analise = mapearResultadoMotorV64ParaAnaliseLegada_({
      estado: e7, proxima_pergunta: 'Qual é a frequência desse processo?',
      status_diagnostico: 'INVESTIGACAO', interpretacao: { respondeuPerguntaPendente: false },
      gate: { pode: false, motivo: 'DIMENSAO_ESSENCIAL_DESCONHECIDA:processo' }
    });
    assert('adaptador não transforma dimensão desconhecida em fato legado', analise.processo === '' && analise.objetivo === '');
    assert('adaptador mantém frequência separada de escala', analise.volume === '100 pedidos/dia' && analise.frequencia === '');

    var e8 = criarEstadoInvestigacaoVazioV64_();
    var info = inserirEstadoInvestigacaoV64EmInformacoes_([{ tipo: 'NOTA_LEGADA', valor: 'preservar' }], e8);
    assert('persistência aditiva preserva notas antigas', info.length === 2 && info[0].valor === 'preservar');

    var e9 = criarEstadoInvestigacaoVazioV64_();
    atualizarFatoV64_(e9, 'processo', 'Lançamento manual', 'Lançamos manualmente', 'CONFIRMADO', 'turno-1');
    var contrato = ajustarContinuidadeDiagnostico_(e9, {
      proximaPergunta: 'Quantos pedidos são processados por dia?',
      dimensaoAlvo: 'escala',
      justificativa: 'medir volume',
      lacunaQueReduz: 'escala'
    }, null, function() { return { equivalente: false, indice: -1 }; });
    assert('ajustarContinuidadeDiagnostico_ retorna contrato de validação com pergunta e dimensão válidas',
      contrato.valida === true && contrato.perguntaAjustada === 'Quantos pedidos são processados por dia?' &&
      contrato.motivo === '',
      'Retorno observado: ' + JSON.stringify(contrato));

    var perguntaInvalida = ajustarContinuidadeDiagnostico_(e9, {
      proximaPergunta: 'Quais pedidos são processados por dia?',
      dimensaoAlvo: 'escala'
    }, { texto: 'Olá, tudo certo?', tipo: 'MENSAGEM_SISTEMA' }, function() { return { equivalente: false }; });
    assert('continuidade rejeita mensagem genérica como pergunta pendente',
      perguntaInvalida.valida === false && perguntaInvalida.motivo === 'PERGUNTA_PENDENTE_INVALIDA',
      'Retorno observado: ' + JSON.stringify(perguntaInvalida));

    var e10 = criarEstadoInvestigacaoVazioV64_();
    atualizarFatoV64_(e10, 'processo', 'Lançamento manual', 'Lançamos manualmente', 'CONFIRMADO', 'turno-1');
    atualizarFatoV64_(e10, 'escala', '100 pedidos por dia', 'São 100 pedidos por dia', 'CONFIRMADO', 'turno-2');
    var perguntaDimensaoFechada = validarPerguntaInvestigativaV64_(e10, {
      proximaPergunta: 'Quantos pedidos são processados por dia?',
      dimensaoAlvo: 'escala'
    }, function() { return { equivalente: false }; });
    assert('não pergunta novamente uma dimensão já suficiente',
      perguntaDimensaoFechada.valida === false && perguntaDimensaoFechada.motivo === 'DIMENSAO_JA_SUFICIENTE');

    assert('motor V6.4 permanece desativado até a aceitação real',
      motorInvestigacaoV64Ativo_() === false);

    var estadoNaoPerdeLacuna = criarEstadoInvestigacaoVazioV64_();
    atualizarFatoV64_(estadoNaoPerdeLacuna, 'processo', 'Recebimento por WhatsApp', 'Recebemos pedidos pelo WhatsApp', 'CONFIRMADO', 'turno-1');
    registrarPerguntaFeitaV64_(estadoNaoPerdeLacuna, 'Quais são os horários de pico?', 'frequencia', 'pico-1');
    var textoDepoisRepeticao = '';
    for (var tentativa = 0; tentativa < 2; tentativa++) {
      var resultadoRepeticao = processarTurnoInvestigacaoV64_(estadoNaoPerdeLacuna, 'Ainda não sei informar os horários.', {
        interpretar: function() { return { fatos: [], respondeuPerguntaPendente: true, ambiguidade: false, explicacaoAmbiguidade: '' }; },
        selecionarPergunta: function() { return { proximaPergunta: 'Quais são os horários de pico?', dimensaoAlvo: 'frequencia', justificativa: 'mapear horário', lacunaQueReduz: 'horários de pico' }; },
        verificarRepeticao: function() { return { equivalente: true, indice: 0, motivo: 'mesma lacuna temporal' }; }
      });
      textoDepoisRepeticao = resultadoRepeticao.motivo || '';
    }
    assert('repetição de pergunta não fecha silenciosamente a lacuna e aciona fallback distinto',
      estadoNaoPerdeLacuna.lacunas.frequencia === true &&
      estadoNaoPerdeLacuna.fatos.frequencia.certeza === 'DESCONHECIDO' &&
      resultadoRepeticao.sucesso === true &&
      resultadoRepeticao.proxima_pergunta !== 'Quais são os horários de pico?' &&
      resultadoRepeticao.decisao_pergunta &&
      resultadoRepeticao.decisao_pergunta.fallbackDeterministico === true &&
      estadoNaoPerdeLacuna.perguntaPendente &&
      estadoNaoPerdeLacuna.perguntaPendente.texto !== 'Quais são os horários de pico?');

    // Uma dimensão já perguntada, mas ainda aberta, deve continuar elegível
    // para uma formulação realmente diferente no fallback.
    var e17 = criarEstadoInvestigacaoVazioV64_();
    atualizarFatoV64_(e17, 'processo', 'Recebimento de pedidos', 'Recebemos pedidos', 'CONFIRMADO', 'turno-1');
    atualizarFatoV64_(e17, 'dor_causa', 'Retrabalho', 'Precisamos refazer conferências', 'CONFIRMADO', 'turno-1');
    Object.keys(e17.lacunas).forEach(function(dim) { e17.lacunas[dim] = false; });
    e17.lacunas.frequencia = true;
    registrarPerguntaFeitaV64_(e17, 'Quais são os horários de pico?', 'frequencia', 'freq-antiga');
    var fallbackMesmaLacuna = selecionarFallbackDeterministicoInvestigacaoV64_(e17);
    assert('fallback pode reformular dimensão já perguntada quando a lacuna continua aberta',
      !!fallbackMesmaLacuna &&
      fallbackMesmaLacuna.candidata.dimensaoAlvo === 'frequencia' &&
      fallbackMesmaLacuna.candidata.proximaPergunta !== 'Quais são os horários de pico?' &&
      fallbackMesmaLacuna.validacao.valida === true);

    var escalaEfrequencia = criarEstadoInvestigacaoVazioV64_();
    atualizarFatoV64_(escalaEfrequencia, 'processo', 'Recebimento de pedidos', 'Recebemos pedidos', 'CONFIRMADO', 'turno-1');
    var classPico = classificarDimensaoPerguntaV64_('Quais são os dias e horários de pico?', escalaEfrequencia);
    var classQuantidadePico = classificarDimensaoPerguntaV64_('Quantos pedidos chegam no horário de pico?', escalaEfrequencia);
    assert('classifica horários como frequência e quantidade em pico como escala',
      classPico === 'frequencia' && classQuantidadePico === 'escala');

  } catch (e) {
    resultados.push({ teste: 'execução da suíte', passou: false, detalhe: String(e && e.stack || e) });
  }
  var aprovados = resultados.filter(function(r) { return r.passou; }).length;
  var resumo = { versao: 'V6.4', suite: 'INTEGRACAO_DETERMINISTICA', sucesso: resultados.length === 17 && aprovados === resultados.length, total: resultados.length, aprovados: aprovados, falhas: resultados.length - aprovados, resultados: resultados };
  Logger.log('FEEDS SOLUTIONS V6.4 — INTEGRAÇÃO DETERMINÍSTICA: ' + JSON.stringify(resumo));
  return resumo;
}
