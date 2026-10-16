/**
 * FEEDS SOLUTIONS V6.4 — TESTES UNITÁRIOS DO ESTADO EXPLÍCITO
 * Determinísticos: não chamam Gemini, não leem/escrevem planilhas e não alteram produção.
 */
function TESTAR_ESTADO_INVESTIGACAO_V64() {
  var resultados = [];
  function verificar(nome, condicao, detalhe) {
    resultados.push({ teste: nome, passou: !!condicao, detalhe: detalhe || '' });
  }
  function novo() { return criarEstadoInvestigacaoVazioV64_(); }

  try {
    var estado = novo();
    verificar('cria as oito dimensões contratuais mais frequência separada', Object.keys(estado.fatos).length === 9, Object.keys(estado.fatos).join(','));
    verificar('todas começam como desconhecidas e lacuna aberta',
      Object.keys(estado.fatos).every(function(d) {
        return estado.fatos[d].certeza === CERTEZA_V64.DESCONHECIDO && estado.lacunas[d] === true;
      }));

    var r1 = atualizarFatoV64_(estado, DIMENSOES_V64.PROCESSO,
      'Lançamento manual de pedidos', 'A gente lança os pedidos manualmente', CERTEZA_V64.CONFIRMADO, 'turno-1');
    verificar('registra fato confirmado com evidência e origem',
      r1.atualizado && estado.fatos.processo.valor === 'Lançamento manual de pedidos' &&
      estado.fatos.processo.evidencia === 'A gente lança os pedidos manualmente' &&
      estado.fatos.processo.origem === 'turno-1');

    var r2 = atualizarFatoV64_(estado, DIMENSOES_V64.PROCESSO,
      'Lançamento automático', 'Na verdade agora é automático', CERTEZA_V64.CONFIRMADO, 'turno-2');
    verificar('contradição não apaga fato confirmado e registra conflito',
      r2.conflito && estado.fatos.processo.valor === 'Lançamento manual de pedidos' &&
      estado.fatos.processo.conflitos.length === 1 && estado.conflitos.length === 1);

    var r3 = atualizarFatoV64_(estado, DIMENSOES_V64.PROCESSO,
      'Lançamento manual de pedidos', 'O lançamento ainda é manual', CERTEZA_V64.CONFIRMADO, 'turno-3');
    verificar('mesmo fato confirmado preserva valor e acumula evidência adicional',
      r3.atualizado && estado.fatos.processo.valor === 'Lançamento manual de pedidos' &&
      estado.fatos.processo.evidenciasAdicionais.length === 1);
    verificar('conflito não resolvido mantém lacuna aberta',
      estado.lacunas.processo === true);

    var estadoResolucao = novo();
    atualizarFatoV64_(estadoResolucao, DIMENSOES_V64.PROCESSO,
      'Lançamento manual', 'Antes era manual', CERTEZA_V64.CONFIRMADO, 'turno-a');
    atualizarFatoV64_(estadoResolucao, DIMENSOES_V64.PROCESSO,
      'Lançamento automático', 'Agora é automático', CERTEZA_V64.CONFIRMADO, 'turno-b');
    var resolucao = atualizarFatoV64_(estadoResolucao, DIMENSOES_V64.PROCESSO,
      'Lançamento automático', 'Confirmei: agora é automático', CERTEZA_V64.CONFIRMADO, 'turno-c',
      { resolverConflito: true });
    verificar('conflito só é resolvido mediante confirmação explícita',
      resolucao.conflitoResolvido === true &&
      estadoResolucao.fatos.processo.valor === 'Lançamento automático' &&
      estadoResolucao.lacunas.processo === false &&
      estadoResolucao.conflitos.every(function(c) { return c.resolvido === true; }));

    atualizarFatoV64_(estado, DIMENSOES_V64.ESCALA, 'cerca de 100 pedidos/dia',
      'São uns 100 pedidos por dia', CERTEZA_V64.ESTIMADO, 'turno-4');
    verificar('estimativa mantém lacuna aberta para confirmação',
      estado.fatos.escala.certeza === CERTEZA_V64.ESTIMADO && estado.lacunas.escala === true);

    atualizarFatoV64_(estado, DIMENSOES_V64.EXCECOES, 'Não se aplica',
      'Não temos exceções nesse processo', CERTEZA_V64.NEGADO, 'turno-5',
      { certezaDetalhe: 'NAO_SE_APLICA' });
    verificar('negação explícita fica registrada e encerra a lacuna',
      estado.fatos.excecoes.certeza === CERTEZA_V64.NEGADO && estado.lacunas.excecoes === false);

    var preservacao = atualizarFatoV64_(estado, DIMENSOES_V64.PROCESSO,
      null, null, CERTEZA_V64.DESCONHECIDO, 'turno-6');
    verificar('desconhecimento posterior não substitui confirmação',
      preservacao.preservado === true && estado.fatos.processo.valor === 'Lançamento manual de pedidos');

    registrarPerguntaFeitaV64_(estado, 'Em qual etapa os erros aparecem?', 'dor_causa', 'q-1', '2026-10-16T10:00:00Z');
    definirPerguntaPendenteV64_(estado, { id: 'q-2', dimensao: 'impacto', texto: 'Quanto tempo isso consome?' });
    adicionarTurnoHistoricoV64_(estado, { papel: 'EMPRESARIO', texto: 'A conferência leva duas horas.', origem: 'turno-7' });
    verificar('persiste perguntas, pergunta pendente tipada e histórico',
      estado.perguntasFeitas.length === 1 &&
      estado.perguntaPendente.tipo === 'PERGUNTA_INVESTIGATIVA' &&
      estado.historico.length === 1);

    var validacao = validarEstadoInvestigacaoV64_(estado);
    verificar('estado completo passa pela validação estrutural', validacao.valido, validacao.erros.join(','));

    var errosInvalidos = false;
    try { atualizarFatoV64_(estado, 'dimensao_inventada', 'x', 'x', CERTEZA_V64.CONFIRMADO, 'turno-x'); }
    catch (e) { errosInvalidos = /DIMENSAO_INVESTIGACAO_V64_INVALIDA/.test(String(e)); }
    verificar('dimensão inválida é rejeitada explicitamente', errosInvalidos);

    var estadoPersistencia = novo();
    atualizarFatoV64_(estadoPersistencia, DIMENSOES_V64.DOR_CAUSA,
      'Retrabalho', 'Precisamos conferir tudo novamente', CERTEZA_V64.CONFIRMADO, 'turno-8');
    var serializado = serializarEstadoInvestigacaoV64_(estadoPersistencia);
    var desserializado = desserializarEstadoInvestigacaoV64_(serializado);
    verificar('serialização preserva fatos e evidências',
      !!desserializado && desserializado.fatos.dor_causa.valor === 'Retrabalho' &&
      desserializado.fatos.dor_causa.evidencia === 'Precisamos conferir tudo novamente');

    var informacoesLegadas = [{ tipo: 'NOTA_LEGADA', texto: 'não apagar' }];
    var informacoesComEstado = inserirEstadoInvestigacaoV64EmInformacoes_(informacoesLegadas, estadoPersistencia);
    verificar('persistência mantém informações legadas',
      informacoesComEstado.length === 2 && informacoesComEstado[0].texto === 'não apagar');

    var informacoesAtualizadas = inserirEstadoInvestigacaoV64EmInformacoes_(informacoesComEstado, estadoPersistencia);
    verificar('atualização substitui envelope V6.4 sem duplicá-lo',
      informacoesAtualizadas.length === 2 &&
      informacoesAtualizadas.filter(function(item) { return item.tipo === 'ESTADO_INVESTIGACAO_V64'; }).length === 1);

    var recuperado = extrairEstadoInvestigacaoV64DeInformacoes_(informacoesAtualizadas);
    verificar('recuperação localiza o estado persistido',
      !!recuperado && recuperado.fatos.dor_causa.valor === 'Retrabalho');

  } catch (erro) {
    resultados.push({ teste: 'execução da suíte', passou: false, detalhe: erro && erro.stack ? erro.stack : String(erro) });
  }

  var aprovados = resultados.filter(function(r) { return r.passou; }).length;
  var resumo = {
    versao: 'V6.4',
    suite: 'ESTADO_EXPLICITO',
    sucesso: resultados.length > 0 && aprovados === resultados.length,
    total: resultados.length,
    aprovados: aprovados,
    falhas: resultados.length - aprovados,
    resultados: resultados
  };
  Logger.log('FEEDS SOLUTIONS V6.4 — ESTADO EXPLÍCITO: ' + JSON.stringify(resumo));
  return resumo;
}
