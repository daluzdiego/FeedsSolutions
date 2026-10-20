/**
 * FEEDS SOLUTIONS V6.4 — DIAGNÓSTICO CIRÚRGICO DA SELEÇÃO DE PERGUNTAS
 *
 * Objetivo: reproduzir inconsistências reais observadas no teste Gemini ponta a ponta.
 * Não chama Gemini, não acessa planilhas e não altera estado de produção.
 *
 * Executar: TESTAR_DIAGNOSTICO_CIRURGICO_PERGUNTAS_V64()
 *
 * Logs:
 * - um bloco detalhado por cenário (entrada, dimensão inferida, contrato e diagnóstico);
 * - resumo final com invariantes aprovadas/falhas;
 * - falhas incluem esperado versus observado, sem mensagens genéricas.
 */

function TESTAR_DIAGNOSTICO_CIRURGICO_PERGUNTAS_V64() {
  var resultados = [];
  var cenarios = [];

  function registrar(id, nome, esperado, observado, passou, evidencia) {
    var item = {
      id: id,
      teste: nome,
      passou: !!passou,
      esperado: esperado,
      observado: observado,
      evidencia: evidencia || ''
    };
    resultados.push(item);
    cenarios.push(item);
    Logger.log('[V64][DIAG][CASO ' + id + '] ' + JSON.stringify(item));
  }

  function novoEstadoBase() {
    var e = criarEstadoInvestigacaoVazioV64_();
    atualizarFatoV64_(e, 'processo', 'Recebimento e lançamento manual de pedidos',
      'Recebemos pedidos pelo WhatsApp e lançamos manualmente', 'CONFIRMADO', 'fixture-processo');
    atualizarFatoV64_(e, 'dor_causa', 'Retrabalho na conferência',
      'Precisamos conferir os pedidos novamente', 'CONFIRMADO', 'fixture-dor');
    return e;
  }

  try {
    Logger.log('========== INÍCIO DIAGNÓSTICO CIRÚRGICO V6.4 ==========');
    Logger.log('[V64][DIAG][AMBIENTE] ' + JSON.stringify({
      suite: 'DIAGNOSTICO_CIRURGICO_PERGUNTAS',
      versao: 'V6.4',
      chamadasGemini: 0,
      escritaPlanilhas: false,
      alteracaoProducao: false,
      objetivo: 'detectar divergência entre pergunta, dimensão-alvo e lacuna declarada'
    }));

    // Caso 01: reproduz exatamente a forma da pergunta vista no log real.
    var perguntaPico = 'Existe alguma variação significativa nesses 100 pedidos diários em dias de pico, como finais de semana ou feriados?';
    var dimPico = classificarDimensaoPerguntaV64_(perguntaPico, null);
    registrar('01', 'Pergunta sobre variação temporal em dias de pico é classificada como frequência',
      'frequencia', dimPico, dimPico === 'frequencia', perguntaPico);

    // Caso 02: pergunta explícita por quantidade em horário de pico é escala.
    var perguntaQuantidadePico = 'Quantos pedidos chegam no horário de pico?';
    var dimQuantidadePico = classificarDimensaoPerguntaV64_(perguntaQuantidadePico, null);
    registrar('02', 'Pergunta quantitativa sobre pico continua sendo escala',
      'escala', dimQuantidadePico, dimQuantidadePico === 'escala', perguntaQuantidadePico);

    // Caso 03: pergunta por horário é frequência mesmo quando escala já é conhecida.
    var e3 = novoEstadoBase();
    atualizarFatoV64_(e3, 'escala', '100 pedidos por dia', 'São exatamente 100 pedidos por dia',
      'CONFIRMADO', 'fixture-escala');
    var perguntaHorario = 'Existe algum horário específico do dia em que o volume de pedidos é maior?';
    var dimHorario = classificarDimensaoPerguntaV64_(perguntaHorario, e3);
    registrar('03', 'Horário de pico não é confundido com volume já confirmado',
      'frequencia', dimHorario, dimHorario === 'frequencia',
      JSON.stringify({ pergunta: perguntaHorario, escalaExistente: e3.fatos.escala }));

    // Caso 04: validação deve rejeitar candidata cuja pergunta e dimensão-alvo divergem.
    var e4 = novoEstadoBase();
    var candidataDivergente = {
      proximaPergunta: 'Existe algum horário específico do dia em que o volume de pedidos é maior?',
      dimensaoAlvo: 'escala',
      justificativa: 'Reproduz candidato inconsistente.',
      lacunaQueReduz: 'escala'
    };
    var validacaoDivergente = validarPerguntaInvestigativaV64_(e4, candidataDivergente,
      function() { return { equivalente: false, indice: -1, motivo: 'fixture sem repetição' }; });
    registrar('04', 'Validador rejeita pergunta temporal rotulada como escala',
      'valida=false; motivo=DIMENSAO_ALVO_NAO_CORRESPONDE_A_PERGUNTA',
      { valida: validacaoDivergente.valida, motivo: validacaoDivergente.motivo,
        dimensaoDetectada: validacaoDivergente.dimensaoDetectada },
      validacaoDivergente.valida === false &&
        validacaoDivergente.motivo === 'DIMENSAO_ALVO_NAO_CORRESPONDE_A_PERGUNTA',
      JSON.stringify(candidataDivergente));

    // Caso 05: a validação de produção deve rejeitar a lacuna declarada em dimensão divergente.
    var candidataLacunaDivergente = {
      proximaPergunta: 'Existe algum horário específico do dia em que o volume de pedidos é maior?',
      dimensaoAlvo: 'frequencia',
      justificativa: 'Pergunta sobre distribuição temporal.',
      lacunaQueReduz: 'escala'
    };
    var dimensaoDetectada05 = classificarDimensaoPerguntaV64_(candidataLacunaDivergente.proximaPergunta, null);
    var dimensaoLacuna05 = inferirDimensaoLacunaV64_(candidataLacunaDivergente.lacunaQueReduz);
    var validacao05 = validarPerguntaInvestigativaV64_(novoEstadoBase(), candidataLacunaDivergente,
      function() { return { equivalente: false, indice: -1, motivo: 'fixture sem repetição' }; });
    registrar('05', 'Validador rejeita lacuna declarada incompatível com a dimensão-alvo',
      'valida=false; motivo=LACUNA_QUE_REDUZ_DIVERGE_DA_DIMENSAO_ALVO; lacuna=escala',
      { valida: validacao05.valida, motivo: validacao05.motivo,
        dimensaoAlvo: candidataLacunaDivergente.dimensaoAlvo,
        dimensaoDetectada: dimensaoDetectada05,
        dimensaoLacunaDetectada: dimensaoLacuna05 },
      validacao05.valida === false &&
        validacao05.motivo === 'LACUNA_QUE_REDUZ_DIVERGE_DA_DIMENSAO_ALVO' &&
        dimensaoLacuna05 === 'escala',
      'Reproduz a divergência observada no E2E real e exige rejeição explícita pelo validador de produção.');

    // Caso 06: pergunta de frequência não pode fechar escala nem substituir a evidência da escala.
    var e6 = novoEstadoBase();
    atualizarFatoV64_(e6, 'escala', '100 pedidos por dia', 'São exatamente 100 pedidos por dia',
      'CONFIRMADO', 'fixture-escala');
    var escalaAntes = JSON.stringify(e6.fatos.escala);
    var perguntaFrequencia06 = 'Em quais horários os pedidos costumam chegar?';
    var frequencia06 = classificarDimensaoPerguntaV64_(perguntaFrequencia06, e6);
    registrar('06', 'Investigação de frequência preserva fato de escala sem reclassificá-lo',
      { escala: '100 pedidos por dia', dimensaoPergunta: 'frequencia' },
      { escala: e6.fatos.escala.valor, dimensaoPergunta: frequencia06 },
      e6.fatos.escala.valor === '100 pedidos por dia' && frequencia06 === 'frequencia' &&
        JSON.stringify(e6.fatos.escala) === escalaAntes,
      'Verifica ausência de mutação no fato de escala durante classificação da pergunta.');

    // Caso 07: pergunta semanticamente distinta do histórico deve ser permitida.
    var e7 = novoEstadoBase();
    atualizarFatoV64_(e7, 'escala', '100 pedidos por dia', 'São 100 pedidos por dia',
      'CONFIRMADO', 'fixture-escala');
    registrarPerguntaFeitaV64_(e7, 'Quantos pedidos vocês recebem por dia?', 'escala', 'q-escala');
    var candidataFrequencia07 = {
      proximaPergunta: 'Em quais horários os pedidos costumam chegar?',
      dimensaoAlvo: 'frequencia',
      justificativa: 'Mapear distribuição temporal.',
      lacunaQueReduz: 'distribuição temporal'
    };
    var validacao07 = validarPerguntaInvestigativaV64_(e7, candidataFrequencia07,
      function() { return { equivalente: false, indice: -1, motivo: 'dimensão distinta no fixture' }; });
    registrar('07', 'Pergunta de frequência não é bloqueada como repetição de pergunta de escala',
      'valida=true', { valida: validacao07.valida, motivo: validacao07.motivo,
        dimensaoAlvo: validacao07.dimensaoAlvo },
      validacao07.valida === true,
      JSON.stringify({ historico: e7.perguntasFeitas, candidata: candidataFrequencia07 }));

    // Caso 08: uma dimensão de frequência já fechada não deve receber nova pergunta.
    var e8 = novoEstadoBase();
    atualizarFatoV64_(e8, 'frequencia', 'Pico entre 10h e meio-dia',
      'Os pedidos chegam principalmente entre 10h e meio-dia', 'CONFIRMADO', 'fixture-frequencia');
    var candidataFechada08 = {
      proximaPergunta: 'Em quais horários os pedidos costumam chegar?',
      dimensaoAlvo: 'frequencia',
      justificativa: 'Fixture para dimensão fechada.',
      lacunaQueReduz: 'distribuição temporal'
    };
    var validacao08 = validarPerguntaInvestigativaV64_(e8, candidataFechada08,
      function() { return { equivalente: false, indice: -1, motivo: 'fixture sem repetição' }; });
    registrar('08', 'Dimensão de frequência já suficiente não gera pergunta redundante',
      'valida=false; motivo=DIMENSAO_JA_SUFICIENTE',
      { valida: validacao08.valida, motivo: validacao08.motivo },
      validacao08.valida === false && validacao08.motivo === 'DIMENSAO_JA_SUFICIENTE',
      JSON.stringify({ lacuna: e8.lacunas.frequencia, fato: e8.fatos.frequencia }));

    // Caso 09: formato de saída da seleção deve incluir campos coerentes e auditáveis.
    var candidata09 = {
      proximaPergunta: 'Em quais períodos do dia o movimento aumenta?',
      dimensaoAlvo: 'frequencia',
      justificativa: 'A escala diária está confirmada; falta a distribuição temporal.',
      lacunaQueReduz: 'distribuição temporal'
    };
    var dimensao09 = classificarDimensaoPerguntaV64_(candidata09.proximaPergunta, null);
    var contrato09 = ['proximaPergunta', 'dimensaoAlvo', 'justificativa', 'lacunaQueReduz'];
    var camposAusentes09 = contrato09.filter(function(k) {
      return typeof candidata09[k] !== 'string' || !candidata09[k].trim();
    });
    registrar('09', 'Contrato da candidata contém os quatro campos textuais obrigatórios e coerência dimensional',
      { campos: contrato09, dimensao: 'frequencia' },
      { camposAusentes: camposAusentes09, dimensaoDetectada: dimensao09,
        dimensaoAlvo: candidata09.dimensaoAlvo, lacunaQueReduz: candidata09.lacunaQueReduz },
      camposAusentes09.length === 0 && dimensao09 === candidata09.dimensaoAlvo,
      JSON.stringify(candidata09));

  } catch (e) {
    registrar('ERRO_EXECUCAO', 'Erro real de execução da suíte (não é falha de assertiva)',
      'nenhuma exceção não tratada',
      { mensagem: String(e), stack: e && e.stack ? String(e.stack) : '' },
      false, 'Exceção capturada no nível da suíte.');
  }

  var aprovados = resultados.filter(function(r) { return r.passou; }).length;
  var falhas = resultados.length - aprovados;
  var resumo = {
    versao: 'V6.4',
    suite: 'DIAGNOSTICO_CIRURGICO_PERGUNTAS',
    sucesso: resultados.length === 9 && falhas === 0,
    total: resultados.length,
    aprovados: aprovados,
    falhas: falhas,
    chamadasGemini: 0,
    escritaPlanilhas: false,
    falhasDetalhadas: resultados.filter(function(r) { return !r.passou; }),
    resultados: resultados
  };
  Logger.log('========== RESUMO DIAGNÓSTICO CIRÚRGICO V6.4 ==========');
  Logger.log('[V64][DIAG][RESUMO] ' + JSON.stringify(resumo));
  return resumo;
}
