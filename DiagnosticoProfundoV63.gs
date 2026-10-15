/**
 * ============================================================
 * FEEDS SOLUTIONS — DIAGNÓSTICO PROFUNDO V6.3
 * ============================================================
 *
 * Arquivo exclusivo de TESTES. Não altera os arquivos de produção.
 *
 * OBJETIVOS:
 * 1) Executar testes determinísticos de regras críticas.
 * 2) Executar novamente a suíte de aceitação existente.
 * 3) Capturar Logger.log dos testes antigos para detectar falhas
 *    internas que não lançam exceção.
 * 4) Medir duração, assertivas, falhas, funções ausentes e testes
 *    executados sem evidência de aprovação.
 * 5) Persistir cursor e resultados entre execuções.
 * 6) Gerar relatório detalhado na aba RELATORIO_TESTE_PROFUNDO_V63,
 *    se o projeto tiver uma planilha ativa.
 *
 * IMPORTANTE:
 * - O runner é retomável: execute CONTINUAR até concluir.
 * - Cada execução para antes do limite máximo do Apps Script.
 * - Testes antigos podem chamar Gemini e consumir cota/tempo.
 * - O teste não é uma prova matemática de ausência de bugs.
 * - "Executou sem exceção" NÃO equivale a "passou".
 * ============================================================
 */

var FEEDS_PROFUNDO_V63_PREFIXO_ = 'FEEDS_PROFUNDO_V63_';
var FEEDS_PROFUNDO_V63_ABA_ = 'RELATORIO_TESTE_PROFUNDO_V63';
var FEEDS_PROFUNDO_V63_LIMITE_MS_ = 90000;
// Reserva tempo para persistir e registrar o lote antes do limite do Apps Script.
var FEEDS_PROFUNDO_V63_RESERVA_LOTE_MS_ = 25000;

function TESTAR_DIAGNOSTICO_PROFUNDO_V63_RESETAR() {
  var props = PropertiesService.getScriptProperties();
  var existentes = props.getProperties();
  Object.keys(existentes).forEach(function(chave) {
    if (chave.indexOf(FEEDS_PROFUNDO_V63_PREFIXO_) === 0) {
      props.deleteProperty(chave);
    }
  });

  // Cada rodada recebe um relatório novo. Não apaga histórico anterior.
  // A suíte profunda executa testes legados caros; manter lotes curtos evita timeout.
  // O limite do lote é menor que o tempo máximo da plataforma para permitir gravação final.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var runId = Utilities.getUuid();
  var nomeAba = FEEDS_PROFUNDO_V63_ABA_ + '_' + runId.slice(0, 8);
  var aba = null;
  try {
    if (ss) {
      aba = ss.getSheetByName(nomeAba) || ss.insertSheet(nomeAba);
      aba.clearContents();
      aba.getRange(1, 1, 1, 9).setValues([[
        'timestamp', 'run_id', 'índice', 'grupo', 'caso', 'status',
        'duração_ms', 'detalhe', 'origem'
      ]]);
      aba.setFrozenRows(1);
      props.setProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'REPORT_SHEET', nomeAba);
    } else {
      props.deleteProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'REPORT_SHEET');
    }
  } catch (erroAba) {
    Logger.log('AVISO: não foi possível criar aba exclusiva: ' + FEEDS_PROFUNDO_V63_textoErro_(erroAba));
    props.deleteProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'REPORT_SHEET');
  }
  props.setProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'RUN_ID', runId);
  props.setProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'CURSOR', '0');
  props.setProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'INICIO', new Date().toISOString());

  Logger.log('============================================================');
  Logger.log('FEEDS SOLUTIONS — DIAGNÓSTICO PROFUNDO V6.3');
  Logger.log('RESET CONCLUÍDO. RUN_ID=' + runId);
  Logger.log('Relatório: ' + (aba ? nomeAba : 'Logger de execução (planilha ativa indisponível)'));
  Logger.log('Próximo passo: execute TESTAR_DIAGNOSTICO_PROFUNDO_V63_CONTINUAR().');
  Logger.log('============================================================');
  return { sucesso: true, run_id: runId, proximo: 'TESTAR_DIAGNOSTICO_PROFUNDO_V63_CONTINUAR' };
}

/**
 * EXECUÇÃO FULL AUTOMÁTICA
 *
 * Inicie esta função uma única vez no Apps Script.
 * Ela reinicia a rodada e processa os 70 casos em lotes sucessivos,
 * usando gatilhos temporizados para continuar sem intervenção manual.
 * Cada caso conserva resultado/duração e o resumo final fica em ScriptProperties
 * e na aba exclusiva do relatório.
 */
function TESTAR_DIAGNOSTICO_PROFUNDO_V63_FULL() {
  FEEDS_PROFUNDO_V63_removerGatilhosFull_();
  var inicio = TESTAR_DIAGNOSTICO_PROFUNDO_V63_RESETAR();
  var resultado = TESTAR_DIAGNOSTICO_PROFUNDO_V63_FULL_CONTINUAR_AUTO();
  return {
    iniciado: true,
    run_id: inicio.run_id,
    primeiro_lote: resultado,
    observacao: 'A execução continuará automaticamente por gatilhos até os 70 casos ou até uma falha fatal.'
  };
}

/**
 * Processa um lote e agenda exatamente uma continuação quando necessário.
 * Se houver exceção fatal, registra o erro e interrompe para não criar loop infinito.
 */
function TESTAR_DIAGNOSTICO_PROFUNDO_V63_FULL_CONTINUAR_AUTO() {
  // Remove o gatilho já disparado para permitir criar o próximo lote.
  FEEDS_PROFUNDO_V63_removerGatilhosFull_();
  var props = PropertiesService.getScriptProperties();
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    FEEDS_PROFUNDO_V63_agendarContinuacaoFull_();
    return { concluido: false, motivo: 'Outra execução está ativa; continuação agendada.' };
  }

  var resultado;
  try {
    resultado = TESTAR_DIAGNOSTICO_PROFUNDO_V63_CONTINUAR();
    if (resultado && resultado.concluido === true) {
      props.setProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'FULL_STATUS', 'CONCLUIDO');
      FEEDS_PROFUNDO_V63_removerGatilhosFull_();
      Logger.log('FULL FINALIZADO: ' + JSON.stringify(resultado));
      return resultado;
    }

    if (resultado && Number(resultado.cursor) < Number(resultado.total)) {
      props.setProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'FULL_STATUS', 'EM_ANDAMENTO');
      FEEDS_PROFUNDO_V63_agendarContinuacaoFull_();
      Logger.log('FULL: continuação automática agendada; progresso=' +
        resultado.cursor + '/' + resultado.total);
    }
    return resultado;
  } catch (erro) {
    props.setProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'FULL_STATUS', 'ERRO_FATAL');
    props.setProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'FULL_ERRO', FEEDS_PROFUNDO_V63_textoErro_(erro));
    FEEDS_PROFUNDO_V63_removerGatilhosFull_();
    Logger.log('FULL INTERROMPIDO POR ERRO FATAL: ' + FEEDS_PROFUNDO_V63_textoErro_(erro));
    throw erro;
  } finally {
    lock.releaseLock();
  }
}

function FEEDS_PROFUNDO_V63_agendarContinuacaoFull_() {
  var props = PropertiesService.getScriptProperties();
  var gatilhos = ScriptApp.getProjectTriggers().filter(function(t) {
    return t.getHandlerFunction() === 'TESTAR_DIAGNOSTICO_PROFUNDO_V63_FULL_CONTINUAR_AUTO';
  });
  if (!gatilhos.length) {
    ScriptApp.newTrigger('TESTAR_DIAGNOSTICO_PROFUNDO_V63_FULL_CONTINUAR_AUTO')
      .timeBased()
      .after(60 * 1000)
      .create();
  }
  props.setProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'FULL_STATUS', 'AGUARDANDO_CONTINUACAO');
}

function FEEDS_PROFUNDO_V63_removerGatilhosFull_() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'TESTAR_DIAGNOSTICO_PROFUNDO_V63_FULL_CONTINUAR_AUTO') {
      ScriptApp.deleteTrigger(t);
    }
  });
}

/** Consulta o estado da última execução FULL sem reiniciar os testes. */
function TESTAR_DIAGNOSTICO_PROFUNDO_V63_FULL_STATUS() {
  var props = PropertiesService.getScriptProperties();
  var runId = props.getProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'RUN_ID');
  var cursor = Number(props.getProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'CURSOR') || 0);
  var casos = FEEDS_PROFUNDO_V63_montarCasos_();
  var bruto = props.getProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'RESUMO_FINAL');
  var resumo = null;
  try { resumo = bruto ? JSON.parse(bruto) : null; } catch (e) {}
  return {
    run_id: runId,
    cursor: cursor,
    total: casos.length,
    progresso_percentual: Math.round(cursor / Math.max(1, casos.length) * 100),
    status: props.getProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'FULL_STATUS') || 'NAO_INICIADO',
    erro: props.getProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'FULL_ERRO') || '',
    resumo_final: resumo
  };
}

function TESTAR_DIAGNOSTICO_PROFUNDO_V63_CONTINUAR() {
  var props = PropertiesService.getScriptProperties();
  var runId = props.getProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'RUN_ID');
  if (!runId) {
    throw new Error('Execute primeiro TESTAR_DIAGNOSTICO_PROFUNDO_V63_RESETAR().');
  }

  var casos = FEEDS_PROFUNDO_V63_montarCasos_();
  var cursor = Number(props.getProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'CURSOR') || 0);
  if (cursor >= casos.length) {
    return FEEDS_PROFUNDO_V63_emitirResumo_(casos.length, runId);
  }

  var inicioLote = Date.now();
  var executadosLote = 0;
  Logger.log('============================================================');
  Logger.log('DIAGNÓSTICO PROFUNDO V6.3 — LOTE');
  Logger.log('RUN_ID=' + runId + ' | CURSOR=' + cursor + '/' + casos.length);
  Logger.log('Limite conservador do lote: ' + FEEDS_PROFUNDO_V63_LIMITE_MS_ + ' ms');
  Logger.log('============================================================');

  while (cursor < casos.length && (Date.now() - inicioLote) < (FEEDS_PROFUNDO_V63_LIMITE_MS_ - FEEDS_PROFUNDO_V63_RESERVA_LOTE_MS_)) {
    var caso = casos[cursor];
    var inicioCaso = Date.now();
    var resultado;

    Logger.log('------------------------------------------------------------');
    Logger.log('CASO ' + (cursor + 1) + '/' + casos.length + ' | ' + caso.grupo + ' | ' + caso.nome);

    try {
      if (caso.tipo === 'deterministico') {
        resultado = FEEDS_PROFUNDO_V63_executarDeterministico_(caso);
      } else {
        resultado = FEEDS_PROFUNDO_V63_executarLegado_(caso);
      }
    } catch (erro) {
      resultado = {
        status: 'FALHOU',
        detalhe: 'Exceção não tratada pelo executor: ' + FEEDS_PROFUNDO_V63_textoErro_(erro),
        asserts: 0,
        falhas: 1,
        logs: []
      };
    }

    resultado.duracao_ms = Date.now() - inicioCaso;
    resultado.indice = cursor + 1;
    resultado.grupo = caso.grupo;
    resultado.nome = caso.nome;

    Logger.log('RESULTADO DO CASO: ' + resultado.status +
      ' | duração=' + resultado.duracao_ms + 'ms' +
      ' | assertivas=' + (resultado.asserts || 0) +
      ' | falhas=' + (resultado.falhas || 0));
    if (resultado.detalhe) Logger.log('DETALHE: ' + resultado.detalhe);

    FEEDS_PROFUNDO_V63_salvarResultado_(runId, resultado);
    FEEDS_PROFUNDO_V63_gravarLinhasRelatorio_(runId, resultado);

    cursor++;
    props.setProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'CURSOR', String(cursor));
    executadosLote++;
  }

  Logger.log('============================================================');
  Logger.log('FIM DO LOTE | executados=' + executadosLote +
    ' | cursor=' + cursor + '/' + casos.length +
    ' | duração=' + (Date.now() - inicioLote) + 'ms');
  if (cursor < casos.length) {
    Logger.log('CONTINUE executando TESTAR_DIAGNOSTICO_PROFUNDO_V63_CONTINUAR().');
  } else {
    Logger.log('TODOS OS CASOS FORAM PERCORRIDOS. Emitindo resumo final.');
    return FEEDS_PROFUNDO_V63_emitirResumo_(casos.length, runId);
  }

  return { concluido: false, cursor: cursor, total: casos.length, executados_lote: executadosLote };
}

function FEEDS_PROFUNDO_V63_montarCasos_() {
  var casos = FEEDS_PROFUNDO_V63_casosDeterministicos_();
  var lista = [];

  if (typeof obterTestesAceitacaoFinalV63_ === 'function') {
    try {
      lista = obterTestesAceitacaoFinalV63_() || [];
    } catch (e) {
      casos.push({
        tipo: 'deterministico',
        grupo: 'INVENTÁRIO',
        nome: 'Lista de aceitação pode ser carregada',
        fn: function(ctx) {
          FEEDS_PROFUNDO_V63_assert_(ctx, 'obterTestesAceitacaoFinalV63_ não lança exceção', false, FEEDS_PROFUNDO_V63_textoErro_(e));
        }
      });
    }
  } else {
    casos.push({
      tipo: 'deterministico',
      grupo: 'INVENTÁRIO',
      nome: 'Runner de aceitação disponível',
      fn: function(ctx) {
        FEEDS_PROFUNDO_V63_assert_(ctx, 'obterTestesAceitacaoFinalV63_ existe', false, 'Função não encontrada.');
      }
    });
  }

  lista.forEach(function(item, i) {
    casos.push({
      tipo: 'legado',
      grupo: 'SUÍTE EXISTENTE ' + String(i + 1).padStart(2, '0'),
      nome: item.nome || ('Teste legado ' + (i + 1)),
      fn: item.fn || null,
      etapa: item.etapa || '',
      origem: 'TesteAceitacaoFinalV63.gs'
    });
  });

  return casos;
}

function FEEDS_PROFUNDO_V63_casosDeterministicos_() {
  return [
    {
      tipo: 'deterministico', grupo: 'DIAGNÓSTICO DO TESTADOR', nome: 'Leitura de resultados booleanos e estruturados não cria falso negativo',
      fn: function(ctx) {
        FEEDS_PROFUNDO_V63_assert_(ctx, 'boolean true representa aprovação', FEEDS_PROFUNDO_V63_itemResultadoPassou_(true) === true, 'valor=true');
        FEEDS_PROFUNDO_V63_assert_(ctx, 'boolean false representa reprovação', FEEDS_PROFUNDO_V63_itemResultadoPassou_(false) === false, 'valor=false');
        FEEDS_PROFUNDO_V63_assert_(ctx, 'objeto passou=true sem erro representa aprovação', FEEDS_PROFUNDO_V63_itemResultadoPassou_({passou:true, erro:''}) === true, 'formato={passou:true}');
        FEEDS_PROFUNDO_V63_assert_(ctx, 'objeto passou=false representa reprovação', FEEDS_PROFUNDO_V63_itemResultadoPassou_({passou:false}) === false, 'formato={passou:false}');
        FEEDS_PROFUNDO_V63_assert_(ctx, 'objeto com erro não representa aprovação', FEEDS_PROFUNDO_V63_itemResultadoPassou_({passou:true, erro:'falhou validação'}) === false, 'formato={passou:true, erro:...}');
      }
    },
    {
      tipo: 'deterministico', grupo: 'DIAGNÓSTICO DO TESTADOR', nome: 'Deduplicação reconhece os formatos reais de log sem filtrar assertivas distintas',
      fn: function(ctx) {
        FEEDS_PROFUNDO_V63_assert_(ctx, 'reconhece teste numerado como 1/25', FEEDS_PROFUNDO_V63_ehLinhaTesteDuplicada_('✅ TESTE 1/25 — catálogo foi persistido'), 'formato=TESTE 1/25');
        FEEDS_PROFUNDO_V63_assert_(ctx, 'reconhece teste numerado sem total', FEEDS_PROFUNDO_V63_ehLinhaTesteDuplicada_('❌ TESTE 8 — contexto foi inventado'), 'formato=TESTE 8');
        FEEDS_PROFUNDO_V63_assert_(ctx, 'não filtra log de assertiva independente', !FEEDS_PROFUNDO_V63_ehLinhaTesteDuplicada_('✅ ASSERTIVA PASSOU: contexto desconhecido'), 'formato=ASSERTIVA PASSOU');
        FEEDS_PROFUNDO_V63_assert_(ctx, 'não filtra resumo do caso', !FEEDS_PROFUNDO_V63_ehLinhaTesteDuplicada_('RESULTADO DO CASO: PASSOU | assertivas=25'), 'formato=RESULTADO DO CASO');
      }
    },
    {
      tipo: 'deterministico', grupo: 'CONTRATO', nome: 'Funções críticas do diagnóstico estão disponíveis',
      fn: function(ctx) {
        [
          'normalizarTextoDiagnostico_',
          'normalizarAnaliseDiagnostico_',
          'ajustarContinuidadeDiagnostico_',
          'classificarDimensaoPerguntaDiagnostico_',
          'atualizarDiagnosticoComAnalise_',
          'extrairEtapasProcessoDiagnostico_',
          'acumularEtapaProcessoDiagnostico_',
          'obterTestesAceitacaoFinalV63_'
        ].forEach(function(nome) {
          FEEDS_PROFUNDO_V63_assert_(ctx, nome + ' existe', typeof globalThis[nome] === 'function', 'typeof=' + typeof globalThis[nome]);
        });
      }
    },
    {
      tipo: 'deterministico', grupo: 'NORMALIZAÇÃO', nome: 'Acentos, caixa e espaços são normalizados',
      fn: function(ctx) {
        var valor = normalizarTextoDiagnostico_('  AÇÃO   DIÁRIA   ');
        FEEDS_PROFUNDO_V63_assert_(ctx, 'remove acentos e converte para minúsculas', valor === 'acao diaria', 'obtido=' + valor);
      }
    },
    {
      tipo: 'deterministico', grupo: 'CLASSIFICAÇÃO', nome: 'Perguntas de frequência em linguagem natural',
      fn: function(ctx) {
        [
          'Quantas divulgações vocês costumam fazer por semana?',
          'Com que frequência isso acontece?',
          'Quantas vezes por mês vocês fazem isso?',
          'Vocês publicam diariamente?',
          'Vocês postam todos os dias?',
          'Publicam uma vez por semana?',
          'Isso é feito mensalmente?'
        ].forEach(function(pergunta) {
          var dim = classificarDimensaoPerguntaDiagnostico_(pergunta);
          FEEDS_PROFUNDO_V63_assert_(ctx, 'classifica como FREQUENCIA: ' + pergunta, dim === 'FREQUENCIA', 'obtido=' + dim);
        });
      }
    },
    {
      tipo: 'deterministico', grupo: 'CLASSIFICAÇÃO', nome: 'Perguntas de volume, impacto, erros e objetivo',
      fn: function(ctx) {
        var casos = [
          ['Quantos pedidos vocês processam?', 'VOLUME'],
          ['Qual o impacto disso no negócio?', 'IMPACTO'],
          ['Esse processo gera retrabalho ou atrasos?', 'ERROS'],
          ['O que você gostaria de melhorar ou alcançar?', 'OBJETIVO'],
          ['Qual o resultado desejado?', 'OBJETIVO'],
          ['Quantas vezes por semana isso ocorre?', 'FREQUENCIA']
        ];
        casos.forEach(function(c) {
          var obtido = classificarDimensaoPerguntaDiagnostico_(c[0]);
          FEEDS_PROFUNDO_V63_assert_(ctx, c[1] + ' | ' + c[0], obtido === c[1], 'obtido=' + obtido);
        });
      }
    },
    {
      tipo: 'deterministico', grupo: 'CONTINUIDADE', nome: 'Não inventa resposta quando não há pergunta pendente',
      fn: function(ctx) {
        var r = ajustarContinuidadeDiagnostico_({ proxima_pergunta: 'Pergunta original?' }, '', 'resposta');
        FEEDS_PROFUNDO_V63_assert_(ctx, 'sem pergunta pendente não marca resposta pendente', r.respondeu_pergunta_pendente === false, JSON.stringify(r));
      }
    },
    {
      tipo: 'deterministico', grupo: 'CONTINUIDADE', nome: 'Resposta numérica avança da pergunta de volume',
      fn: function(ctx) {
        var pergunta = 'Quantas divulgações vocês costumam fazer por semana?';
        var r = ajustarContinuidadeDiagnostico_({ proxima_pergunta: pergunta, informacao_faltante: pergunta }, pergunta, '20');
        FEEDS_PROFUNDO_V63_assert_(ctx, 'reconhece o número como resposta', r.respondeu_pergunta_pendente === true, JSON.stringify(r));
        FEEDS_PROFUNDO_V63_assert_(ctx, 'não repete a pergunta de volume', r.proxima_pergunta !== pergunta, 'próxima=' + r.proxima_pergunta);
        FEEDS_PROFUNDO_V63_assert_(ctx, 'preserva o número como evidência de volume', String(r.volume || '') === '20', 'volume=' + r.volume);
      }
    },
    {
      tipo: 'deterministico', grupo: 'CONTINUIDADE', nome: 'Variações de frequência avançam sem repetir a pergunta',
      fn: function(ctx) {
        var pergunta = 'Quantas divulgações vocês costumam fazer por semana?';
        ['uma por mês', '20 por dia', '~50 por semana', 'diariamente', 'eventualmente'].forEach(function(resposta) {
          var r = ajustarContinuidadeDiagnostico_({ proxima_pergunta: pergunta, informacao_faltante: pergunta }, pergunta, resposta);
          FEEDS_PROFUNDO_V63_assert_(ctx, 'resposta "' + resposta + '" é reconhecida', r.respondeu_pergunta_pendente === true, 'obtido=' + JSON.stringify(r));
          FEEDS_PROFUNDO_V63_assert_(ctx, 'resposta "' + resposta + '" avança', r.proxima_pergunta !== pergunta, 'próxima=' + r.proxima_pergunta);
        });
      }
    },
    {
      tipo: 'deterministico', grupo: 'CONTINUIDADE', nome: 'Resposta curta contextual à pergunta de erros não entra em loop',
      fn: function(ctx) {
        var pergunta = 'Esse processo costuma gerar erros, retrabalho ou atrasos?';
        ['diariamente', 'não sei dizer', 'sim', 'não'].forEach(function(resposta) {
          var r = ajustarContinuidadeDiagnostico_({ proxima_pergunta: pergunta, informacao_faltante: pergunta }, pergunta, resposta);
          FEEDS_PROFUNDO_V63_assert_(ctx, 'resposta "' + resposta + '" é reconhecida', r.respondeu_pergunta_pendente === true, JSON.stringify(r));
          FEEDS_PROFUNDO_V63_assert_(ctx, 'resposta "' + resposta + '" não repete pergunta', r.proxima_pergunta !== pergunta, 'próxima=' + r.proxima_pergunta);
        });
      }
    },
    {
      tipo: 'deterministico', grupo: 'CONTINUIDADE', nome: 'Mensagem vazia não é tratada como resposta válida',
      fn: function(ctx) {
        var pergunta = 'Esse processo costuma gerar erros, retrabalho ou atrasos?';
        var r = ajustarContinuidadeDiagnostico_({ proxima_pergunta: pergunta, informacao_faltante: pergunta }, pergunta, ' ');
        FEEDS_PROFUNDO_V63_assert_(ctx, 'mensagem vazia não marca pergunta respondida', r.respondeu_pergunta_pendente !== true, JSON.stringify(r));
      }
    },
    {
      tipo: 'deterministico', grupo: 'CONTINUIDADE', nome: 'Resposta livre de impacto é preservada literalmente',
      fn: function(ctx) {
        var pergunta = 'Qual o impacto disso no seu negócio?';
        var resposta = 'Perdemos vendas quando os pedidos atrasam.';
        var r = ajustarContinuidadeDiagnostico_({ proxima_pergunta: pergunta, informacao_faltante: pergunta }, pergunta, resposta);
        FEEDS_PROFUNDO_V63_assert_(ctx, 'reconhece a resposta de impacto', r.respondeu_pergunta_pendente === true, JSON.stringify(r));
        FEEDS_PROFUNDO_V63_assert_(ctx, 'preserva o texto original como evidência', r.impacto === resposta, 'impacto=' + r.impacto);
        FEEDS_PROFUNDO_V63_assert_(ctx, 'avança para outra pergunta', r.proxima_pergunta !== pergunta, 'próxima=' + r.proxima_pergunta);
      }
    },
    {
      tipo: 'deterministico', grupo: 'NORMALIZAÇÃO SEMÂNTICA', nome: 'Extrai processo, volume, frequência, impacto e dor de uma resposta',
      fn: function(ctx) {
        var msg = 'Estamos digitando pedidos na planilha todos os dias. São 100 pedidos por dia, temos erros de digitação e perdemos 2 horas por dia.';
        var r = normalizarAnaliseDiagnostico_({}, msg, {});
        FEEDS_PROFUNDO_V63_assert_(ctx, 'identifica processo', !!r.processo, 'processo=' + r.processo);
        FEEDS_PROFUNDO_V63_assert_(ctx, 'identifica volume', /100 pedidos por dia/i.test(r.volume), 'volume=' + r.volume);
        FEEDS_PROFUNDO_V63_assert_(ctx, 'identifica frequência diária', r.frequencia === 'Diária', 'frequência=' + r.frequencia);
        FEEDS_PROFUNDO_V63_assert_(ctx, 'identifica impacto temporal', /2 horas por dia/i.test(r.impacto), 'impacto=' + r.impacto);
        FEEDS_PROFUNDO_V63_assert_(ctx, 'identifica dor de digitação', /digita/i.test(r.dor_principal), 'dor=' + r.dor_principal);
      }
    },
    {
      tipo: 'deterministico', grupo: 'INTEGRIDADE DOS DADOS', nome: 'Volume não é confundido com impacto',
      fn: function(ctx) {
        var r = normalizarAnaliseDiagnostico_({ impacto: '100 pedidos por dia' }, 'Recebemos 100 pedidos por dia.', {});
        FEEDS_PROFUNDO_V63_assert_(ctx, 'mantém volume como volume', /100 pedidos por dia/i.test(r.volume), 'volume=' + r.volume);
        FEEDS_PROFUNDO_V63_assert_(ctx, 'não mantém volume no campo impacto', !/pedidos/i.test(r.impacto), 'impacto=' + r.impacto);
      }
    },
    {
      tipo: 'deterministico', grupo: 'INTEGRIDADE DOS DADOS', nome: 'Volume já confirmado é preservado quando a nova mensagem não o substitui',
      fn: function(ctx) {
        var r = normalizarAnaliseDiagnostico_({}, 'A equipe trabalha manualmente.', { volume: '80 pedidos por dia' });
        FEEDS_PROFUNDO_V63_assert_(ctx, 'preserva volume anterior', r.volume === '80 pedidos por dia', 'volume=' + r.volume);
      }
    },
    {
      tipo: 'deterministico', grupo: 'INTEGRIDADE DOS DADOS', nome: 'Objetivo placeholder não é salvo como objetivo real',
      fn: function(ctx) {
        var r = normalizarAnaliseDiagnostico_({ objetivo: 'O que você gostaria de alcançar?' }, 'A rotina é manual.', {});
        FEEDS_PROFUNDO_V63_assert_(ctx, 'remove pergunta/placeholder do campo objetivo', !r.objetivo, 'objetivo=' + r.objetivo);
      }
    },
    {
      tipo: 'deterministico', grupo: 'PROCESSO', nome: 'Etapas do processo são divididas e ordenadas',
      fn: function(ctx) {
        var r = extrairEtapasProcessoDiagnostico_('Receber pedidos → Conferir pedidos -> Lançar na planilha');
        FEEDS_PROFUNDO_V63_assert_(ctx, 'extrai três etapas', r.length === 3, 'etapas=' + JSON.stringify(r));
        FEEDS_PROFUNDO_V63_assert_(ctx, 'preserva a ordem das etapas', r[0] === 'Receber pedidos' && r[2] === 'Lançar na planilha', 'etapas=' + JSON.stringify(r));
      }
    },
    {
      tipo: 'deterministico', grupo: 'PROCESSO', nome: 'Acumulação adiciona nova etapa sem apagar a anterior',
      fn: function(ctx) {
        var r = acumularEtapaProcessoDiagnostico_('Receber pedidos', 'Conferir pedidos');
        FEEDS_PROFUNDO_V63_assert_(ctx, 'preserva primeira etapa', r.processo_nome === 'Receber pedidos', JSON.stringify(r));
        FEEDS_PROFUNDO_V63_assert_(ctx, 'inclui nova etapa no resumo', /Receber pedidos/.test(r.processo_resumo) && /Conferir pedidos/.test(r.processo_resumo), JSON.stringify(r));
      }
    },
    {
      tipo: 'deterministico', grupo: 'PROCESSO', nome: 'Acumulação não duplica uma etapa idêntica',
      fn: function(ctx) {
        var r = acumularEtapaProcessoDiagnostico_('Receber pedidos → Conferir pedidos', 'Conferir pedidos');
        var etapas = extrairEtapasProcessoDiagnostico_(r.processo_resumo);
        FEEDS_PROFUNDO_V63_assert_(ctx, 'mantém exatamente duas etapas únicas', etapas.length === 2, JSON.stringify(r));
      }
    },
    {
      tipo: 'deterministico', grupo: 'ATUALIZAÇÃO', nome: 'Atualização não sobrescreve objetivo já confirmado',
      fn: function(ctx) {
        var r = atualizarDiagnosticoComAnalise_(
          { objetivo: 'Reduzir erros de digitação', processo_nome: 'Receber pedidos', processo_resumo: 'Receber pedidos' },
          { objetivo: 'Aumentar vendas', processo: 'Conferir pedidos', volume: '100 pedidos por dia' }
        );
        FEEDS_PROFUNDO_V63_assert_(ctx, 'preserva objetivo existente', r.objetivo === 'Reduzir erros de digitação', 'objetivo=' + r.objetivo);
        FEEDS_PROFUNDO_V63_assert_(ctx, 'preserva primeira etapa do processo', r.processo_nome === 'Receber pedidos', 'processo_nome=' + r.processo_nome);
        FEEDS_PROFUNDO_V63_assert_(ctx, 'registra volume da análise', r.volume === '100 pedidos por dia', 'volume=' + r.volume);
      }
    },
    {
      tipo: 'deterministico', grupo: 'REGRESSÃO', nome: 'Teste de regressão da repetição de perguntas: 5 cenários',
      fn: function(ctx) {
        if (typeof TESTAR_CORRECAO_REPETICAO_PERGUNTAS_DIAGNOSTICO_V1 !== 'function') {
          FEEDS_PROFUNDO_V63_assert_(ctx, 'função de regressão existe', false, 'Não encontrada em TesteAceitacaoFinalV63.gs');
          return;
        }
        var r = TESTAR_CORRECAO_REPETICAO_PERGUNTAS_DIAGNOSTICO_V1();
        FEEDS_PROFUNDO_V63_assert_(ctx, 'regressão retorna sucesso', !!(r && r.sucesso === true), JSON.stringify(r));
        FEEDS_PROFUNDO_V63_assert_(ctx, 'regressão cobre cinco casos', !!(r && r.total === 5 && r.aprovados === 5), JSON.stringify(r));
      }
    },
    {
      tipo: 'deterministico', grupo: 'INVENTÁRIO', nome: 'Todas as funções listadas na aceitação estão disponíveis',
      fn: function(ctx) {
        if (typeof obterTestesAceitacaoFinalV63_ !== 'function') {
          FEEDS_PROFUNDO_V63_assert_(ctx, 'runner de aceitação disponível', false, 'Função não encontrada.');
          return;
        }
        var lista = obterTestesAceitacaoFinalV63_() || [];
        FEEDS_PROFUNDO_V63_assert_(ctx, 'a lista de aceitação não está vazia', lista.length > 0, 'total=' + lista.length);
        var ausentes = lista.filter(function(item) { return typeof item.fn !== 'function'; }).map(function(item) { return item.nome; });
        FEEDS_PROFUNDO_V63_assert_(ctx, 'nenhuma função de teste está ausente', ausentes.length === 0, 'ausentes=' + JSON.stringify(ausentes));
      }
    }
  ];
}

function FEEDS_PROFUNDO_V63_executarDeterministico_(caso) {
  var ctx = { checks: [] };
  caso.fn(ctx);
  var falhas = ctx.checks.filter(function(c) { return !c.passou; });
  ctx.checks.forEach(function(c) {
    Logger.log((c.passou ? '✅ ASSERTIVA PASSOU: ' : '❌ ASSERTIVA FALHOU: ') +
      c.nome + ' | detalhe=' + c.detalhe);
  });
  var total = ctx.checks.length;
  return {
    status: falhas.length ? 'FALHOU' : (total ? 'PASSOU' : 'SEM_ASSERTIVAS'),
    detalhe: 'assertivas=' + total + '; falhas=' + falhas.length,
    asserts: total,
    falhas: falhas.length,
    linhas: ctx.checks.map(function(c) {
      return {
        status: c.passou ? 'PASSOU' : 'FALHOU',
        nome: c.nome,
        detalhe: c.detalhe
      };
    })
  };
}

function FEEDS_PROFUNDO_V63_assert_(ctx, nome, condicao, detalhe) {
  ctx.checks.push({
    nome: String(nome || ''),
    passou: !!condicao,
    detalhe: String(detalhe === undefined ? '' : detalhe).slice(0, 1500)
  });
}

function FEEDS_PROFUNDO_V63_itemResultadoPassou_(item) {
  if (typeof item === 'boolean') return item;
  if (!item || typeof item !== 'object') return false;
  return item.passou === true && !item.erro;
}

function FEEDS_PROFUNDO_V63_ehLinhaTesteDuplicada_(linha) {
  return /^(?:✅|❌)\s*TESTE\s+\d+(?:\s*\/\s*\d+)?\s*[—-]/i
    .test(String(linha || '').trim());
}

function FEEDS_PROFUNDO_V63_executarLegado_(caso) {
  if (typeof caso.fn !== 'function') {
    return {
      status: 'FUNCAO_AUSENTE',
      detalhe: 'A função listada na aceitação não existe no ambiente atual.',
      asserts: 0,
      falhas: 1,
      linhas: [{ status: 'FALHOU', nome: 'Função disponível', detalhe: caso.nome }]
    };
  }

  var capturados = [];
  var loggerOriginal = null;
  var capturaAtiva = false;
  var retorno;
  var erroExecucao = null;

  try {
    loggerOriginal = Logger.log;
    Logger.log = function() {
      var args = Array.prototype.slice.call(arguments);
      var texto = args.map(function(x) {
        if (typeof x === 'string') return x;
        try { return JSON.stringify(x); } catch (e) { return String(x); }
      }).join(' ');
      capturados.push(texto);
      return loggerOriginal.apply(Logger, arguments);
    };
    capturaAtiva = Logger.log !== loggerOriginal;
  } catch (e) {
    capturaAtiva = false;
  }

  try {
    retorno = caso.fn();
  } catch (erro) {
    erroExecucao = erro;
  } finally {
    if (loggerOriginal) {
      try { Logger.log = loggerOriginal; } catch (ignorar) {}
    }
  }

  var linhasAssertivas = capturados.filter(function(linha) {
    return /ASSERTIVA|TESTE\s+\d+|PASSOU\s*[-:]|FALHOU|APROVADOS?:\s*\d+\s*\/\s*\d+|FALHAS(?: FUNCIONAIS)?:\s*\d+|PERCENTUAL:|RESULTADO FINAL|TESTAR_[A-Z0-9_]+:\s*(?:PASSOU|FALHOU)|REGRESSÕES FALHARAM/i.test(linha);
  });

  // Retornos estruturados são a fonte preferencial de assertivas
  // quando os objetos incluem resultados[]; nesse caso não somamos
  // novamente as mesmas verificações impressas no Logger.
  var resultadosRetorno = retorno && typeof retorno === 'object' &&
    Array.isArray(retorno.resultados) ? retorno.resultados : [];
  var evidenciasAssertivas = linhasAssertivas.slice();

  var quantidadeFalhasRetorno = resultadosRetorno.filter(function(item) {
    return !FEEDS_PROFUNDO_V63_itemResultadoPassou_(item);
  }).length;

  if (resultadosRetorno.length) {
    evidenciasAssertivas = linhasAssertivas.filter(function(linha) {
      return !FEEDS_PROFUNDO_V63_ehLinhaTesteDuplicada_(linha);
    });
    resultadosRetorno.forEach(function(item, indice) {
      var passou = FEEDS_PROFUNDO_V63_itemResultadoPassou_(item);
      var numero = item && typeof item === 'object' && item.numero
        ? item.numero
        : indice + 1;
      var descricao = item && typeof item === 'object' && item.descricao
        ? item.descricao
        : (typeof item === 'boolean' ? 'assertiva booleana retornada' : 'resultado retornado');
      var erro = item && typeof item === 'object' ? item.erro : '';
      evidenciasAssertivas.push(
        (passou ? '✅ ASSERTIVA RETORNO: ' : '❌ ASSERTIVA RETORNO: ') +
        'teste=' + numero +
        ' | descrição=' + String(descricao) +
        ' | erro=' + String(erro || '')
      );
    });
  }

  var assertivas = 0;
  var falhasInternas = 0;
  evidenciasAssertivas.forEach(function(linha) {
    if (/(?:✅|PASSOU\s*[-:])/i.test(linha) && /TESTE|ASSERTIVA|PASSOU\s*[-:]/i.test(linha)) assertivas++;
    if (/(?:❌\s*TESTE|❌\s*ASSERTIVA|ASSERTIVA FALHOU|TESTAR_[A-Z0-9_]+:\s*FALHOU|FALHAS(?: FUNCIONAIS)?:\s*[1-9]\d*|FALHOU\s*[-:])/i.test(linha)) falhasInternas++;
  });

  // As suítes mais antigas podem retornar resultados: [true, false, ...]
  // sem nomes nem logs por assertiva. Contamos esses booleanos diretamente
  // no retorno, sem depender de padrões do Logger.
  if (resultadosRetorno.length && resultadosRetorno.every(function(item) {
    return typeof item === 'boolean';
  })) {
    assertivas = resultadosRetorno.length;
    falhasInternas = Math.max(falhasInternas, quantidadeFalhasRetorno);
  }

  var retornoFalha = retorno === false ||
    (retorno && typeof retorno === 'object' &&
      (retorno.sucesso === false || retorno.success === false || retorno.aprovado === false ||
       retorno.passou === false || Number(retorno.falhas || 0) > 0)) ||
    quantidadeFalhasRetorno > 0;
  var retornoSucesso = retorno === true ||
    (retorno && typeof retorno === 'object' &&
      (retorno.sucesso === true || retorno.success === true || retorno.aprovado === true ||
       (retorno.passou === true && Number(retorno.falhas || 0) === 0)));

  // Lê também os resumos numéricos. Isso detecta, por exemplo,
  // 24/25 mesmo se o teste não lançar exceção nem imprimir ❌.
  var resumosNumericos = [];
  capturados.forEach(function(linha) {
    var m = linha.match(/APROVADOS?:\s*(\d+)\s*\/\s*(\d+)/i);
    if (m) {
      resumosNumericos.push({ aprovados: Number(m[1]), total: Number(m[2]), linha: linha });
    }
  });
  // Considera o último resumo do teste principal para classificação,
  // mas não descarta as falhas explícitas capturadas em qualquer etapa.
  var resumoNumerico = resumosNumericos.length
    ? resumosNumericos[resumosNumericos.length - 1]
    : null;
  if (resumoNumerico && resumoNumerico.aprovados < resumoNumerico.total) {
    falhasInternas = Math.max(falhasInternas, resumoNumerico.total - resumoNumerico.aprovados);
  }

  var status;
  if (erroExecucao || retornoFalha || falhasInternas > 0) {
    status = 'FALHOU';
  } else if (retornoSucesso) {
    status = 'PASSOU_COM_RETORNO_EXPLICITO';
  } else if (resumoNumerico && resumoNumerico.total > 0 &&
      resumoNumerico.aprovados === resumoNumerico.total) {
    status = 'PASSOU_POR_RESUMO_NUMERICO';
  } else if (assertivas > 0 && evidenciasAssertivas.length && !falhasInternas) {
    status = 'PASSOU_PELAS_ASSERTIVAS_CAPTURADAS';
  } else {
    status = 'EXECUTOU_SEM_EXCECAO_NAO_VERIFICADO';
  }

  var detalhe = [
    'captura_logger=' + capturaAtiva,
    'linhas_diagnosticas_originais=' + linhasAssertivas.length,
    'linhas_diagnosticas_contadas=' + evidenciasAssertivas.length,
    'assertivas_contadas_sem_duplicacao=' + assertivas,
    'falhas_internas_detectadas=' + falhasInternas,
    'retorno=' + FEEDS_PROFUNDO_V63_resumirRetorno_(retorno),
    erroExecucao ? 'exceção=' + FEEDS_PROFUNDO_V63_textoErro_(erroExecucao) : ''
  ].filter(Boolean).join('; ');

  var linhas = evidenciasAssertivas.slice(-120).map(function(linha) {
    var falha = /❌|FALHOU|FALHAS(?: FUNCIONAIS)?:\s*[1-9]\d*/i.test(linha);
    return {
      status: falha ? 'FALHOU' : 'LOG_INTERNO',
      nome: caso.nome,
      detalhe: linha.slice(0, 1500)
    };
  });

  // Registra um alerta se o teste informou mais aprovados do que o
  // número de assertivas únicas contadas pelo adaptador.
  if (resumoNumerico && resumoNumerico.aprovados > assertivas && !falhasInternas) {
    linhas.push({
      status: 'ALERTA_METRICA',
      nome: caso.nome,
      detalhe: 'Resumo do teste informa ' + resumoNumerico.aprovados +
        ' aprovados; o capturador contou ' + assertivas +
        ' evidências únicas. Não converter essa diferença em falha funcional.'
    });
  }

  if (erroExecucao) {
    linhas.push({ status: 'FALHOU', nome: caso.nome, detalhe: FEEDS_PROFUNDO_V63_textoErro_(erroExecucao) });
  }

  return {
    status: status,
    detalhe: detalhe,
    asserts: assertivas,
    falhas: (erroExecucao || retornoFalha ? 1 : 0) + falhasInternas,
    linhas: linhas
  };
}

function FEEDS_PROFUNDO_V63_resumirRetorno_(retorno) {
  if (retorno === undefined) return 'undefined';
  if (retorno === null) return 'null';
  if (typeof retorno === 'string') return retorno.slice(0, 300);
  try { return JSON.stringify(retorno).slice(0, 500); } catch (e) { return String(retorno).slice(0, 300); }
}

function FEEDS_PROFUNDO_V63_textoErro_(erro) {
  return String(erro && erro.stack ? erro.stack : (erro && erro.message ? erro.message : erro)).slice(0, 3000);
}

function FEEDS_PROFUNDO_V63_salvarResultado_(runId, resultado) {
  var props = PropertiesService.getScriptProperties();
  var chave = FEEDS_PROFUNDO_V63_PREFIXO_ + 'RESULTADO_' + resultado.indice;
  var compacto = {
    indice: resultado.indice,
    grupo: resultado.grupo,
    nome: resultado.nome,
    status: resultado.status,
    duracao_ms: resultado.duracao_ms,
    asserts: resultado.asserts || 0,
    falhas: resultado.falhas || 0,
    detalhe: String(resultado.detalhe || '').slice(0, 2500)
  };
  props.setProperty(chave, JSON.stringify(compacto));
}

function FEEDS_PROFUNDO_V63_gravarLinhasRelatorio_(runId, resultado) {
  var aba = FEEDS_PROFUNDO_V63_obterAbaRelatorio_(false);
  var linhas = [];
  var ts = new Date();

  linhas.push([
    ts, runId, resultado.indice, resultado.grupo, resultado.nome,
    resultado.status, resultado.duracao_ms, resultado.detalhe || '', 'resumo'
  ]);

  (resultado.linhas || []).forEach(function(linha) {
    linhas.push([
      ts, runId, resultado.indice, resultado.grupo,
      linha.nome || resultado.nome, linha.status || 'LOG_INTERNO',
      resultado.duracao_ms, linha.detalhe || '', 'assertiva/log interno'
    ]);
  });

  if (aba && linhas.length) {
    var inicio = aba.getLastRow() + 1;
    aba.getRange(inicio, 1, linhas.length, 9).setValues(linhas);
  }
}

function FEEDS_PROFUNDO_V63_obterAbaRelatorio_(criar) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return null;
    var props = PropertiesService.getScriptProperties();
    var nomeAba = props.getProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'REPORT_SHEET') || FEEDS_PROFUNDO_V63_ABA_;
    var aba = ss.getSheetByName(nomeAba);
    if (!aba && criar) aba = ss.insertSheet(nomeAba);
    if (aba && criar && aba.getLastRow() === 0) {
      aba.getRange(1, 1, 1, 9).setValues([[
        'timestamp', 'run_id', 'índice', 'grupo', 'caso', 'status',
        'duração_ms', 'detalhe', 'origem'
      ]]);
      aba.setFrozenRows(1);
    }
    return aba;
  } catch (e) {
    Logger.log('AVISO: relatório em planilha indisponível: ' + FEEDS_PROFUNDO_V63_textoErro_(e));
    return null;
  }
}

function FEEDS_PROFUNDO_V63_emitirResumo_(total, runId) {
  var props = PropertiesService.getScriptProperties();
  var resultados = [];
  for (var i = 1; i <= total; i++) {
    var bruto = props.getProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'RESULTADO_' + i);
    if (bruto) {
      try { resultados.push(JSON.parse(bruto)); } catch (e) {}
    }
  }

  var contagem = {};
  resultados.forEach(function(r) { contagem[r.status] = (contagem[r.status] || 0) + 1; });
  var assertivas = resultados.reduce(function(s, r) { return s + Number(r.asserts || 0); }, 0);
  var falhasAssertivas = resultados.reduce(function(s, r) { return s + Number(r.falhas || 0); }, 0);
  var tempoTotal = resultados.reduce(function(s, r) { return s + Number(r.duracao_ms || 0); }, 0);
  var naoVerificados = Number(contagem.EXECUTOU_SEM_EXCECAO_NAO_VERIFICADO || 0);
  var falhas = Number(contagem.FALHOU || 0) + Number(contagem.FUNCAO_AUSENTE || 0);

  Logger.log('============================================================');
  Logger.log('RELATÓRIO FINAL — DIAGNÓSTICO PROFUNDO FEEDS SOLUTIONS V6.3');
  Logger.log('RUN_ID=' + runId);
  Logger.log('CASOS PERCORRIDOS=' + resultados.length + '/' + total);
  Logger.log('STATUS POR CATEGORIA=' + JSON.stringify(contagem));
  Logger.log('ASSERTIVAS CAPTURADAS/EXECUTADAS=' + assertivas);
  Logger.log('FALHAS REGISTRADAS=' + falhasAssertivas);
  Logger.log('CASOS COM FALHA OU FUNÇÃO AUSENTE=' + falhas);
  Logger.log('CASOS SEM APROVAÇÃO VERIFICÁVEL=' + naoVerificados);
  Logger.log('TEMPO ACUMULADO DOS CASOS=' + tempoTotal + 'ms');
  Logger.log('============================================================');

  var rodadaCompleta = resultados.length === total;
  var conclusao = !rodadaCompleta
    ? 'INCOMPLETO — ainda há casos que não foram executados'
    : (falhas > 0 || falhasAssertivas > 0
      ? 'REPROVADO — existem falhas registradas'
      : (naoVerificados > 0
        ? 'INCONCLUSIVO — há testes legados sem aprovação verificável'
        : 'APROVADO NOS CASOS EXECUTADOS — ainda exige validação manual em conversa real'));

  Logger.log('CONCLUSÃO HONESTA: ' + conclusao);
  Logger.log('Relatório detalhado, quando disponível: aba ' +
    (props.getProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'REPORT_SHEET') || FEEDS_PROFUNDO_V63_ABA_));

  var resumo = {
    concluido: rodadaCompleta,
    run_id: runId,
    casos: resultados.length,
    total: total,
    status: contagem,
    assertivas: assertivas,
    falhas_registradas: falhasAssertivas,
    casos_com_falha: falhas,
    nao_verificados: naoVerificados,
    tempo_acumulado_ms: tempoTotal,
    conclusao: conclusao
  };
  props.setProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'RESUMO_FINAL', JSON.stringify(resumo));
  return resumo;
}
