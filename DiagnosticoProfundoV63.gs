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
var FEEDS_PROFUNDO_V63_LIMITE_MS_ = 210000;

function TESTAR_DIAGNOSTICO_PROFUNDO_V63_RESETAR() {
  var props = PropertiesService.getScriptProperties();
  var existentes = props.getProperties();
  Object.keys(existentes).forEach(function(chave) {
    if (chave.indexOf(FEEDS_PROFUNDO_V63_PREFIXO_) === 0) {
      props.deleteProperty(chave);
    }
  });

  var aba = FEEDS_PROFUNDO_V63_obterAbaRelatorio_(true);
  if (aba) {
    aba.clearContents();
    aba.getRange(1, 1, 1, 9).setValues([[
      'timestamp', 'run_id', 'índice', 'grupo', 'caso', 'status',
      'duração_ms', 'detalhe', 'origem'
    ]]);
    aba.setFrozenRows(1);
  }

  var runId = Utilities.getUuid();
  props.setProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'RUN_ID', runId);
  props.setProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'CURSOR', '0');
  props.setProperty(FEEDS_PROFUNDO_V63_PREFIXO_ + 'INICIO', new Date().toISOString());

  Logger.log('============================================================');
  Logger.log('FEEDS SOLUTIONS — DIAGNÓSTICO PROFUNDO V6.3');
  Logger.log('RESET CONCLUÍDO. RUN_ID=' + runId);
  Logger.log('Relatório: ' + (aba ? FEEDS_PROFUNDO_V63_ABA_ : 'Logger de execução (planilha ativa indisponível)'));
  Logger.log('Próximo passo: execute TESTAR_DIAGNOSTICO_PROFUNDO_V63_CONTINUAR().');
  Logger.log('============================================================');
  return { sucesso: true, run_id: runId, proximo: 'TESTAR_DIAGNOSTICO_PROFUNDO_V63_CONTINUAR' };
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

  while (cursor < casos.length && (Date.now() - inicioLote) < FEEDS_PROFUNDO_V63_LIMITE_MS_) {
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
    return /ASSERTIVA|TESTE\\s+\\d+|PASSOU\\s*[-:]|FALHOU|APROVADOS?:\\s*\\d+\\s*\\/\\s*\\d+|FALHAS(?: FUNCIONAIS)?:\\s*\\d+|PERCENTUAL:|RESULTADO FINAL|TESTAR_[A-Z0-9_]+:\\s*(?:PASSOU|FALHOU)|REGRESSÕES FALHARAM/i.test(linha);
  });

  // Alguns testes antigos devolvem resultados estruturados com
  // resultados[].passou/erro, mas podem registrar somente um resumo.
  // Transformamos o objeto em evidências explícitas para o relatório.
  var resultadosRetorno = retorno && typeof retorno === 'object' &&
    Array.isArray(retorno.resultados) ? retorno.resultados : [];
  resultadosRetorno.forEach(function(item, indice) {
    var passou = item && item.passou === true && !item.erro;
    var falhou = !passou;
    capturados.push(
      (passou ? '✅ ASSERTIVA RETORNO: ' : '❌ ASSERTIVA RETORNO: ') +
      'teste=' + (item && (item.numero || indice + 1)) +
      ' | descrição=' + String(item && item.descricao || '') +
      ' | erro=' + String(item && item.erro || '')
    );
  });
  // Recalcula após agregar assertivas estruturadas do retorno.
  linhasAssertivas = capturados.filter(function(linha) {
    return /ASSERTIVA|TESTE\\s+\\d+|PASSOU\\s*[-:]|FALHOU|APROVADOS?:\\s*\\d+\\s*\\/\\s*\\d+|FALHAS(?: FUNCIONAIS)?:\\s*\\d+|PERCENTUAL:|RESULTADO FINAL|TESTAR_[A-Z0-9_]+:\\s*(?:PASSOU|FALHOU)|REGRESSÕES FALHARAM/i.test(linha);
  });

  var assertivas = 0;
  var falhasInternas = 0;
  linhasAssertivas.forEach(function(linha) {
    if (/(?:✅|PASSOU\s*[-:])/i.test(linha) && /TESTE|ASSERTIVA|PASSOU\s*[-:]/i.test(linha)) assertivas++;
    if (/(?:❌\s*TESTE|ASSERTIVA FALHOU|TESTAR_[A-Z0-9_]+:\s*FALHOU|FALHAS(?: FUNCIONAIS)?:\s*[1-9]\d*|FALHOU\s*[-:])/i.test(linha)) falhasInternas++;
  });

  var retornoFalha = retorno === false ||
    (retorno && typeof retorno === 'object' &&
      (retorno.sucesso === false || retorno.success === false || retorno.aprovado === false));
  var retornoSucesso = retorno === true ||
    (retorno && typeof retorno === 'object' &&
      (retorno.sucesso === true || retorno.success === true || retorno.aprovado === true));

  // Lê também os resumos numéricos. Isso detecta, por exemplo,
  // 24/25 mesmo se o teste não lançar exceção nem imprimir ❌.
  var resumoNumerico = null;
  capturados.forEach(function(linha) {
    var m = linha.match(/APROVADOS?:\s*(\d+)\s*\/\s*(\d+)/i);
    if (m) {
      resumoNumerico = { aprovados: Number(m[1]), total: Number(m[2]) };
    }
  });
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
  } else if (assertivas > 0 && linhasAssertivas.length && !falhasInternas) {
    status = 'PASSOU_PELAS_ASSERTIVAS_CAPTURADAS';
  } else {
    status = 'EXECUTOU_SEM_EXCECAO_NAO_VERIFICADO';
  }

  var detalhe = [
    'captura_logger=' + capturaAtiva,
    'linhas_diagnosticas=' + linhasAssertivas.length,
    'assertivas_estimadas=' + assertivas,
    'falhas_internas_detectadas=' + falhasInternas,
    'retorno=' + FEEDS_PROFUNDO_V63_resumirRetorno_(retorno),
    erroExecucao ? 'exceção=' + FEEDS_PROFUNDO_V63_textoErro_(erroExecucao) : ''
  ].filter(Boolean).join('; ');

  var linhas = linhasAssertivas.slice(-80).map(function(linha) {
    var falha = /❌|FALHOU|FALHAS(?: FUNCIONAIS)?:\s*[1-9]\d*/i.test(linha);
    return {
      status: falha ? 'FALHOU' : 'LOG_INTERNO',
      nome: caso.nome,
      detalhe: linha.slice(0, 1500)
    };
  });

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
    var aba = ss.getSheetByName(FEEDS_PROFUNDO_V63_ABA_);
    if (!aba && criar) aba = ss.insertSheet(FEEDS_PROFUNDO_V63_ABA_);
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

  var conclusao = falhas > 0 || falhasAssertivas > 0
    ? 'REPROVADO — existem falhas registradas'
    : (naoVerificados > 0
      ? 'INCONCLUSIVO — há testes legados sem aprovação verificável'
      : 'APROVADO NOS CASOS EXECUTADOS — ainda exige validação manual em conversa real');

  Logger.log('CONCLUSÃO HONESTA: ' + conclusao);
  Logger.log('Relatório detalhado, quando disponível: aba ' + FEEDS_PROFUNDO_V63_ABA_);

  var resumo = {
    concluido: true,
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
