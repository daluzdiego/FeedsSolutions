/**
 * FEEDS SOLUTIONS — REGRESSÃO DE CONCLUSÃO COMERCIAL V63
 * Testes determinísticos, sem chamadas à IA e sem gravar dados.
 */
function TESTAR_CONCLUSAO_COMERCIAL_V63() {
  var resultados = [];
  function verificar(nome, condicao, detalhe) {
    resultados.push({ teste: nome, passou: condicao === true, detalhe: detalhe || '' });
  }

  try {
    var diagnosticoCompleto = {
      processo_nome: 'Publicações orgânicas no Instagram',
      dor_principal: 'Dificuldade para captar clientes',
      frequencia: '',
      impacto_nivel: 'Melhorar a qualidade de vida da família',
      objetivo: 'Aumentar clientes e faturamento; meta de 20 clientes por mês'
    };
    var estadoCompleto = determinarEstadoDiagnostico_(diagnosticoCompleto, {
      informacao_faltante: 'critério de aceitação',
      proxima_pergunta: 'Que resultado observável faria considerar a melhoria bem-sucedida?'
    });
    verificar('Conclui com processo, dor, impacto e objetivo mesmo sem frequência', 
      estadoCompleto === DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE, String(estadoCompleto));

    var respostaConclusao = obterRespostaConversa_({
      informacao_faltante: 'critério de aceitação',
      proxima_pergunta: 'Que resultado observável faria considerar a melhoria bem-sucedida?'
    }, DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE);
    verificar('Conclusão tem precedência sobre pergunta complementar',
      /equipe comercial/i.test(respostaConclusao) && /proposta personalizada/i.test(respostaConclusao) &&
      !/resultado observável/i.test(respostaConclusao), respostaConclusao);

    var semImpacto = Object.assign({}, diagnosticoCompleto, { impacto_nivel: '' });
    verificar('Não conclui se o impacto ainda não foi coletado',
      determinarEstadoDiagnostico_(semImpacto, {}) === DIAGNOSTICO_ESTADOS.INVESTIGACAO);

    var semObjetivo = Object.assign({}, diagnosticoCompleto, { objetivo: '' });
    verificar('Não conclui se o objetivo ainda não foi coletado',
      determinarEstadoDiagnostico_(semObjetivo, {}) === DIAGNOSTICO_ESTADOS.INVESTIGACAO);

    var perguntaEmAberto = obterRespostaConversa_({
      informacao_faltante: 'impacto financeiro',
      proxima_pergunta: 'Qual é o impacto financeiro atual?'
    }, DIAGNOSTICO_ESTADOS.INVESTIGACAO);
    verificar('Continua perguntando quando uma dimensão central realmente falta',
      perguntaEmAberto === 'Qual é o impacto financeiro atual?', perguntaEmAberto);

    var perguntaInstagram = construirPerguntaContinuacaoDiagnostico_(
      { processo_nome: 'Captação de clientes', dor_principal: 'Poucos clientes' },
      'Fiz 1 post no instagram e ninguem nem curtiu, tenho 693 seguidores',
      'Quais ações você já tentou?',
      {}
    );
    verificar('Resposta sobre Instagram gera pergunta contextual, não agradecimento genérico',
      /post gerou alguma mensagem|pedido de orçamento/i.test(perguntaInstagram) &&
      !/obrigado.*vamos continuar/i.test(perguntaInstagram), perguntaInstagram);

    var perguntaEsclarecimento = construirPerguntaContinuacaoDiagnostico_(
      { processo_nome: 'Captação de clientes', dor_principal: 'Poucos clientes' },
      'nao entendi',
      'Quais ações você já tentou para atrair clientes?',
      {}
    );
    verificar('“Não entendi” recebe reformulação da pergunta anterior',
      /explicar de outra forma/i.test(perguntaEsclarecimento) &&
      /Quais ações você já tentou/i.test(perguntaEsclarecimento), perguntaEsclarecimento);
  } catch (e) {
    resultados.push({ teste: 'Exceção não prevista', passou: false, detalhe: String(e && e.stack || e) });
  }

  var aprovados = resultados.filter(function(r) { return r.passou; }).length;
  var resumo = {
    versao: 'V6.3',
    suite: 'CONCLUSAO_COMERCIAL',
    sucesso: resultados.length === 5 && aprovados === 5,
    total: resultados.length,
    aprovados: aprovados,
    falhas: resultados.filter(function(r) { return !r.passou; }),
    resultados: resultados
  };
  Logger.log('FEEDS SOLUTIONS — TESTE CONCLUSÃO COMERCIAL: ' + JSON.stringify(resumo));
  return resumo;
}
