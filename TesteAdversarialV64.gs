/**
 * FEEDS SOLUTIONS V6.4 — TESTES ADVERSARIAIS DETERMINÍSTICOS
 *
 * Exercita invariantes sob respostas vagas, contraditórias, incompletas e
 * com múltiplas informações. Não chama Gemini, não grava planilhas e não
 * altera a baseline V6.3.
 *
 * Executar: TESTAR_ADVERSARIAL_INVESTIGACAO_V64()
 */
function TESTAR_ADVERSARIAL_INVESTIGACAO_V64() {
  var resultados = [];
  function assert(nome, ok, detalhe) {
    resultados.push({ teste: nome, passou: !!ok, detalhe: detalhe || '' });
  }
  function fato(dim, valor, evidencia, certeza, detalhe) {
    return {
      dimensao: dim,
      valor: valor,
      evidencia: evidencia,
      certeza: certeza,
      certezaDetalhe: detalhe || '',
      tipoAtualizacao: ''
    };
  }
  function estadoBase() {
    var e = criarEstadoInvestigacaoVazioV64_();
    atualizarFatoV64_(e, 'processo', 'Lançamento manual de pedidos', 'Lançamos os pedidos manualmente', 'CONFIRMADO', 'base');
    atualizarFatoV64_(e, 'dor_causa', 'Erros de digitação e retrabalho', 'Há erros de digitação e retrabalho', 'CONFIRMADO', 'base');
    return e;
  }
  function adapters(interpretar, selecionar) {
    return {
      interpretar: interpretar,
      selecionarPergunta: selecionar || function() {
        return {
          proximaPergunta: 'Em um dia comum, quantos pedidos são processados?',
          dimensaoAlvo: 'escala',
          justificativa: 'Confirmar o volume em vez de assumir uma estimativa.',
          lacunaQueReduz: 'quantidade diária'
        };
      },
      verificarRepeticao: function() {
        return { equivalente: false, indice: -1, motivo: '' };
      }
    };
  }

  try {
    // A. Resposta vaga não pode converter uma estimativa em confirmação.
    var a = estadoBase();
    definirPerguntaPendenteV64_(a, {
      id: 'adv-a', dimensao: 'escala',
      texto: 'Quantos pedidos são processados por dia?'
    });
    var ra = processarTurnoInvestigacaoV64_(a, 'Depende do movimento; é mais ou menos isso.', adapters(
      function() {
        return {
          fatos: [fato('escala', 'Cerca de 100 pedidos por dia', 'é mais ou menos isso', 'ESTIMADO', 'APROXIMADO')],
          respondeuPerguntaPendente: true,
          ambiguidade: false
        };
      }
    ));
    assert('A. resposta vaga mantém escala estimada e lacuna aberta',
      ra.estado.fatos.escala.certeza === 'ESTIMADO' &&
      ra.estado.lacunas.escala === true &&
      ra.status_diagnostico !== 'CONCLUIDO');

    // B. Contradição não substitui silenciosamente o fato anterior.
    var b = estadoBase();
    atualizarFatoV64_(b, 'escala', '100 pedidos por dia', 'São 100 pedidos por dia', 'CONFIRMADO', 'turno-anterior');
    var rb = processarTurnoInvestigacaoV64_(b, 'Na verdade, são 200 por dia.', adapters(
      function() {
        return {
          fatos: [fato('escala', '200 pedidos por dia', 'Na verdade, são 200 por dia', 'CONFIRMADO')],
          respondeuPerguntaPendente: true,
          ambiguidade: false
        };
      }
    ));
    assert('B. correção contraditória preserva original e abre conflito',
      rb.estado.fatos.escala.valor === '100 pedidos por dia' &&
      rb.estado.conflitos.some(function(c) { return c.dimensao === 'escala' && !c.resolvido; }) &&
      rb.gate && rb.gate.pode === false);

    // C. Uma única mensagem com fatos de dimensões diferentes não perde informação.
    var c = estadoBase();
    var rc = processarTurnoInvestigacaoV64_(c,
      'São 100 pedidos por dia e a conferência consome duas horas.',
      adapters(function() {
        return {
          fatos: [
            fato('escala', '100 pedidos por dia', 'São 100 pedidos por dia', 'CONFIRMADO'),
            fato('impacto', 'Duas horas por dia', 'a conferência consome duas horas', 'CONFIRMADO')
          ],
          respondeuPerguntaPendente: true,
          ambiguidade: false
        };
      }));
    assert('C. mensagem com múltiplos fatos preserva escala e impacto',
      rc.estado.fatos.escala.certeza === 'CONFIRMADO' &&
      rc.estado.fatos.impacto.certeza === 'CONFIRMADO' &&
      rc.estado.fatos.escala.evidencia !== '' &&
      rc.estado.fatos.impacto.evidencia !== '');

    // D. Não saber responder não fecha a lacuna nem autoriza conclusão.
    var d = estadoBase();
    definirPerguntaPendenteV64_(d, {
      id: 'adv-d', dimensao: 'frequencia',
      texto: 'Em quais horários os pedidos chegam em maior volume?'
    });
    var rd = processarTurnoInvestigacaoV64_(d, 'Ainda não sei dizer.', adapters(
      function() {
        return {
          fatos: [],
          respondeuPerguntaPendente: false,
          ambiguidade: false,
          explicacaoAmbiguidade: ''
        };
      },
      function() {
        return {
          proximaPergunta: 'O movimento costuma se concentrar pela manhã, à tarde ou não há padrão?',
          dimensaoAlvo: 'frequencia',
          justificativa: 'Tentar uma formulação mais acessível sem presumir a resposta.',
          lacunaQueReduz: 'período de maior movimento'
        };
      }
    ));
    assert('D. ausência de resposta mantém frequência desconhecida e pergunta pendente',
      rd.sucesso === true &&
      rd.estado.fatos.frequencia.certeza === 'DESCONHECIDO' &&
      rd.estado.lacunas.frequencia === true &&
      rd.estado.perguntaPendente !== null &&
      rd.status_diagnostico !== 'CONCLUIDO');

    // E. Objetivo sem critério de sucesso não libera o gate.
    var e = criarEstadoInvestigacaoVazioV64_();
    atualizarFatoV64_(e, 'processo', 'Lançamento manual', 'Lançamos manualmente', 'CONFIRMADO', 't1');
    atualizarFatoV64_(e, 'dor_causa', 'Retrabalho', 'Refazemos conferências', 'CONFIRMADO', 't1');
    atualizarFatoV64_(e, 'escala', '100 pedidos/dia', 'São 100 pedidos/dia', 'CONFIRMADO', 't2');
    atualizarFatoV64_(e, 'frequencia', 'Diária', 'Todos os dias', 'CONFIRMADO', 't2');
    atualizarFatoV64_(e, 'impacto', 'Duas horas/dia', 'Gastamos duas horas/dia', 'CONFIRMADO', 't2');
    atualizarFatoV64_(e, 'objetivo', 'Reduzir retrabalho', 'Queremos reduzir retrabalho', 'CONFIRMADO', 't3');
    var ge = podeConcluirDiagnosticoV64_(e);
    assert('E. objetivo sem aceitação definida bloqueia conclusão',
      ge.pode === false && ge.motivo === 'CRITERIOS_ACEITACAO_DESCONHECIDOS');

    // F. Estimativa em dimensão essencial continua bloqueando conclusão mesmo
    // quando todas as outras dimensões essenciais estão confirmadas.
    var f = criarEstadoInvestigacaoVazioV64_();
    atualizarFatoV64_(f, 'processo', 'Lançamento manual', 'Lançamos manualmente', 'CONFIRMADO', 't1');
    atualizarFatoV64_(f, 'dor_causa', 'Retrabalho', 'Refazemos conferências', 'CONFIRMADO', 't1');
    atualizarFatoV64_(f, 'escala', 'Cerca de 100 pedidos/dia', 'Cerca de 100 pedidos/dia', 'ESTIMADO', 't1');
    atualizarFatoV64_(f, 'frequencia', 'Diária', 'Todos os dias', 'CONFIRMADO', 't2');
    atualizarFatoV64_(f, 'impacto', 'Duas horas/dia', 'Gastamos duas horas/dia', 'CONFIRMADO', 't2');
    atualizarFatoV64_(f, 'objetivo', 'Reduzir retrabalho', 'Queremos reduzir retrabalho', 'CONFIRMADO', 't3');
    var gf = podeConcluirDiagnosticoV64_(f);
    assert('F. escala estimada bloqueia conclusão sem depender das demais lacunas',
      gf.pode === false && gf.motivo === 'DIMENSAO_ESSENCIAL_ESTIMADA:escala');

    // G. Pergunta sobre distribuição temporal deve ser distinta de volume.
    var g = estadoBase();
    atualizarFatoV64_(g, 'escala', '100 pedidos por dia', 'São 100 pedidos por dia', 'CONFIRMADO', 't2');
    var dimHorario = classificarDimensaoPerguntaV64_(
      'Em quais períodos do dia os pedidos se concentram?', g);
    var dimQuantidade = classificarDimensaoPerguntaV64_(
      'Quantos pedidos chegam no horário de pico?', g);
    assert('G. separa distribuição temporal de quantidade no pico',
      dimHorario === 'frequencia' && dimQuantidade === 'escala');

    // H. Um conflito não resolvido bloqueia mesmo quando os campos parecem completos.
    var h = criarEstadoInvestigacaoVazioV64_();
    atualizarFatoV64_(h, 'processo', 'Lançamento manual', 'Lançamos manualmente', 'CONFIRMADO', 't1');
    atualizarFatoV64_(h, 'dor_causa', 'Retrabalho', 'Refazemos conferências', 'CONFIRMADO', 't1');
    atualizarFatoV64_(h, 'escala', '100 pedidos/dia', 'São 100 pedidos/dia', 'CONFIRMADO', 't2');
    atualizarFatoV64_(h, 'frequencia', 'Diária', 'Todos os dias', 'CONFIRMADO', 't2');
    atualizarFatoV64_(h, 'impacto', 'Duas horas/dia', 'Gastamos duas horas/dia', 'CONFIRMADO', 't2');
    atualizarFatoV64_(h, 'objetivo', 'Reduzir retrabalho', 'Queremos reduzir retrabalho', 'CONFIRMADO', 't3');
    atualizarFatoV64_(h, 'aceitacao', 'Reduzir retrabalho pela metade', 'Sucesso é reduzir pela metade', 'CONFIRMADO', 't3');
    h.conflitos.push({ dimensao: 'escala', valorAnterior: '100', valorNovo: '200', resolvido: false });
    var gh = podeConcluirDiagnosticoV64_(h);
    assert('H. conflito factual aberto bloqueia diagnóstico completo',
      gh.pode === false && /CONFLITO/.test(gh.motivo));
  } catch (erro) {
    resultados.push({
      teste: 'execução da suíte adversarial',
      passou: false,
      detalhe: String(erro && erro.stack || erro)
    });
  }

  var aprovados = resultados.filter(function(r) { return r.passou; }).length;
  var resumo = {
    versao: 'V6.4',
    suite: 'ADVERSARIAL_DETERMINISTICA',
    sucesso: resultados.length === 8 && aprovados === resultados.length,
    total: resultados.length,
    aprovados: aprovados,
    falhas: resultados.length - aprovados,
    resultados: resultados
  };
  Logger.log('FEEDS SOLUTIONS V6.4 — TESTE ADVERSARIAL: ' + JSON.stringify(resumo));
  return resumo;
}
