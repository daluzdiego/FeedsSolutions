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


/**
 * Regressão do caso real: empresário quer captar clientes via redes sociais,
 * não sabe publicar e delega à Feeds a decisão e execução das postagens.
 * A frequência de publicação e a métrica final podem ser definidas na proposta;
 * não podem manter o diagnóstico preliminar em loop.
 */
function TESTAR_CASO_MARKETING_DELEGADO_V64() {
  var resultados = [];
  function assert(nome, ok, detalhe) {
    resultados.push({ teste: nome, passou: !!ok, detalhe: detalhe || '' });
  }
  try {
    var estado = criarEstadoInvestigacaoVazioV64_();
    estado.historico = [
      { papel: 'EMPRESARIO', texto: 'Estou precisando captar clientes para minha empresa de IA, mas nem divulgamos nas redes sociais.' },
      { papel: 'SISTEMA', texto: 'Qual é a sua meta de captação de novos clientes por mês?' },
      { papel: 'EMPRESARIO', texto: 'Pretendo ter 300 clientes por mês.' },
      { papel: 'EMPRESARIO', texto: 'Eu nunca posto nada; ninguém sabe que a minha empresa existe.' },
      { papel: 'EMPRESARIO', texto: 'Eu não sei fazer.' }
    ];
    atualizarFatoV64_(estado, 'processo', 'Não publica nas redes sociais', 'Eu nunca posto nada', 'CONFIRMADO', 'fixture');
    atualizarFatoV64_(estado, 'dor_causa', 'Falta de divulgação impede captação', 'Nem divulgamos nas redes sociais', 'CONFIRMADO', 'fixture');
    atualizarFatoV64_(estado, 'escala', 'Meta de 300 clientes por mês', 'Pretendo ter 300 clientes por mês', 'CONFIRMADO', 'fixture');
    atualizarFatoV64_(estado, 'impacto', 'A empresa não é conhecida', 'Ninguém sabe que a minha empresa existe', 'CONFIRMADO', 'fixture');
    atualizarFatoV64_(estado, 'objetivo', 'Captar clientes para a empresa de IA', 'Estou precisando captar clientes para minha empresa de IA', 'CONFIRMADO', 'fixture');
    definirPerguntaPendenteV64_(estado, { dimensao: 'aceitacao', texto: 'Como você validará a solução de postagens automáticas?' });

    var mensagem = 'Quero que vocês façam as postagens.';
    var interpretacao = registrarEscopoDelegadoMarketingV64_({
      fatos: [],
      respondeuPerguntaPendente: false,
      ambiguidade: false,
      explicacaoAmbiguidade: ''
    }, mensagem, estado);
    interpretacao.fatos.forEach(function(fato) {
      atualizarFatoV64_(estado, fato.dimensao, fato.valor, fato.evidencia, fato.certeza, 'turno-real-fixture', {
        certezaDetalhe: fato.certezaDetalhe || null,
        tipoAtualizacao: fato.tipoAtualizacao || ''
      });
    });
    var gate = podeConcluirDiagnosticoV64_(estado);
    assert('Reconhece que o caso é captação por redes sociais', detectarPerfilMarketingV64_(estado));
    assert('Registra execução das postagens como escopo confirmado',
      estado.fatos.aceitacao.certeza === 'CONFIRMADO' &&
      /executar as postagens/.test(normalizarPerguntaInvestigacaoV64_(estado.fatos.aceitacao.valor)) &&
      estado.fatos.aceitacao.evidencia === mensagem);
    assert('Não exige frequência de publicação para diagnóstico preliminar',
      estado.fatos.frequencia.certeza === 'DESCONHECIDO' && gate.pode,
      JSON.stringify(gate));
    assert('Mantém a meta de 300 clientes como evidência separada',
      estado.fatos.escala.certeza === 'CONFIRMADO' &&
      /300 clientes por mes/.test(normalizarPerguntaInvestigacaoV64_(estado.fatos.escala.valor)));
  } catch (e) {
    resultados.push({ teste: 'Exceção não prevista', passou: false, detalhe: String(e && e.stack || e) });
  }
  var aprovados = resultados.filter(function(r) { return r.passou; }).length;
  var resumo = {
    versao: 'V6.4',
    suite: 'CASO_MARKETING_DELEGADO',
    sucesso: aprovados === resultados.length && resultados.length === 4,
    total: resultados.length,
    aprovados: aprovados,
    falhas: resultados.filter(function(r) { return !r.passou; }),
    resultados: resultados
  };
  Logger.log('FEEDS SOLUTIONS V6.4 — CASO MARKETING DELEGADO: ' + JSON.stringify(resumo));
  return resumo;
}
