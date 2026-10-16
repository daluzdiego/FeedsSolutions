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

  } catch (e) {
    resultados.push({ teste: 'execução da suíte', passou: false, detalhe: String(e && e.stack || e) });
  }
  var aprovados = resultados.filter(function(r) { return r.passou; }).length;
  var resumo = { versao: 'V6.4', suite: 'INTEGRACAO_DETERMINISTICA', sucesso: resultados.length === 10 && aprovados === resultados.length, total: resultados.length, aprovados: aprovados, falhas: resultados.length - aprovados, resultados: resultados };
  Logger.log('FEEDS SOLUTIONS V6.4 — INTEGRAÇÃO DETERMINÍSTICA: ' + JSON.stringify(resumo));
  return resumo;
}
