/**
 * FEEDS SOLUTIONS V6.4 — MOTOR DE INVESTIGAÇÃO ORIENTADO A EVIDÊNCIAS
 *
 * Camadas separadas:
 * 1) interpretação do turno;
 * 2) atualização do estado;
 * 3) seleção adaptativa da pergunta;
 * 4) validação determinística do fluxo;
 * 5) gate de conclusão.
 *
 * Todas as funções de orquestração aceitam adaptadores opcionais para testes
 * determinísticos sem chamadas ao Gemini.
 */

function resumoEstadoInvestigacaoV64_(estado) {
  var fatos = {};
  Object.keys(DIMENSOES_V64).forEach(function(chave) {
    var dimensao = DIMENSOES_V64[chave];
    fatos[dimensao] = estado && estado.fatos && estado.fatos[dimensao]
      ? estado.fatos[dimensao] : { valor: null, evidencia: null, certeza: CERTEZA_V64.DESCONHECIDO };
  });
  var lacunas = Object.keys(DIMENSOES_V64).map(function(chave) {
    return DIMENSOES_V64[chave];
  }).filter(function(dim) {
    return !estado || !estado.lacunas || estado.lacunas[dim] === true;
  });
  return {
    fatos: fatos,
    lacunas: lacunas,
    perguntasFeitas: (estado && estado.perguntasFeitas || []).map(function(p) { return p.texto; }),
    perguntaPendente: estado && estado.perguntaPendente || null,
    conflitosAbertos: (estado && estado.conflitos || []).filter(function(c) { return !c.resolvido; })
  };
}

function construirPromptInterpretacaoTurnoV64_(mensagem, estado) {
  return [
    'Você é a camada de interpretação factual da Feeds Solutions V6.4.',
    'Interprete a resposta do empresário usando o estado e a pergunta pendente como contexto.',
    'Não escolha a próxima pergunta nesta etapa. Não proponha soluções. Não invente fatos.',
    'Uma mensagem pode conter fatos de várias dimensões; extraia todos os fatos sustentados.',
    'Para cada fato, inclua a evidência literal ou trecho fiel da mensagem atual.',
    'CONFIRMADO = dito explicitamente; ESTIMADO = aproximação declarada pelo empresário; NEGADO = explicitamente não se aplica/não existe ou o empresário declara que não sabe responder, sempre detalhando qual dos casos; DESCONHECIDO = sem evidência.',
    'Se a resposta for ambígua, não preencha a dimensão por conveniência; indique ambiguidade e explique o que precisa ser esclarecido.',
    'Uma correção do empresário deve ser registrada como fato novo e não deve apagar silenciosamente a informação anterior.',
    'Classifique cada atualização como NOVO, EXTENSAO, CORRECAO ou CONFIRMACAO. EXTENSAO acrescenta detalhe compatível sem contradizer o fato anterior; CORRECAO contradiz/corrige informação anterior e deve gerar conflito para esclarecimento.', 
    'Retorne somente JSON com o formato: {"fatos":[{"dimensao":"processo|dor_causa|escala|frequencia|impacto|excecoes|objetivo|restricoes|aceitacao","valor":"...","evidencia":"...","certeza":"CONFIRMADO|ESTIMADO|NEGADO|DESCONHECIDO","certezaDetalhe":"NAO_SEI|NAO_SE_APLICA|NAO_EXISTE|APROXIMADO|","tipoAtualizacao":"NOVO|EXTENSAO|CORRECAO|CONFIRMACAO"}],"respondeuPerguntaPendente":true,"ambiguidade":false,"explicacaoAmbiguidade":""}.',
    '',
    'ESTADO ATUAL:',
    JSON.stringify(resumoEstadoInvestigacaoV64_(estado)),
    '',
    'MENSAGEM ATUAL DO EMPRESÁRIO:',
    String(mensagem || '')
  ].join('\n');
}

function construirPromptProximaPerguntaV64_(estado, ultimaMensagem, motivoRejeicao) {
  var resumo = resumoEstadoInvestigacaoV64_(estado);
  return [
    'Você é o investigador principal da Feeds Solutions V6.4.',
    'Escolha uma única próxima pergunta que reduza a incerteza mais importante para especificar um sistema personalizado.',
    'Use o estado consolidado, a última resposta e as lacunas reais. Não siga uma sequência fixa.',
    'Não pergunte algo que já esteja confirmado ou explicitamente marcado como não aplicável.',
    'Não repita semanticamente nenhuma pergunta já feita.',
    'Não pergunte por critérios de aceitação antes de compreender processo e dor.',
    'Não pergunte sobre integrações antes de saber quais ferramentas/sistemas/canais participam do processo.',
    'Se a última resposta for ambígua, faça uma pergunta de esclarecimento estreita, ligada ao que foi dito.',
    'Pergunte uma coisa por turno, em linguagem simples, sem múltiplas perguntas unidas.',
    'Não transforme estimativas em fatos confirmados. Não invente respostas.',
    'Retorne somente JSON: {"proximaPergunta":"...","dimensaoAlvo":"processo|dor_causa|escala|frequencia|impacto|excecoes|objetivo|restricoes|aceitacao","justificativa":"...","lacunaQueReduz":"..."}.',
    '',
    'ESTADO CONSOLIDADO:',
    JSON.stringify(resumo),
    '',
    'ÚLTIMA RESPOSTA:',
    String(ultimaMensagem || ''),
    '',
    'MOTIVO DA TENTATIVA ANTERIOR TER SIDO REJEITADA:',
    String(motivoRejeicao || 'nenhum')
  ].join('\n');
}

function chamarGeminiJsonInvestigacaoV64_(prompt, schema) {
  if (typeof obterGeminiApiKey_ !== 'function' ||
      typeof obterGeminiModel_ !== 'function' ||
      typeof construirUrlGemini_ !== 'function' ||
      typeof executarGemini_ !== 'function' ||
      typeof extrairTextoGemini_ !== 'function') {
    throw new Error('DEPENDENCIAS_GEMINI_V64_INDISPONIVEIS');
  }
  var apiKey = obterGeminiApiKey_();
  var model = obterGeminiModel_();
  var payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 1600,
      thinkingConfig: { thinkingLevel: 'low' }
    }
  };
  if (schema) payload.generationConfig.responseSchema = schema;
  var resposta = executarGemini_(construirUrlGemini_(model), payload, apiKey);
  var texto = extrairTextoGemini_(resposta.dados);
  try {
    return JSON.parse(texto);
  } catch (e) {
    throw new Error('JSON_GEMINI_V64_INVALIDO: ' + String(texto || '').slice(0, 500));
  }
}

function interpretarTurnoInvestigacaoV64_(mensagem, estado, adaptador) {
  if (typeof adaptador === 'function') return adaptador(mensagem, estado);
  return chamarGeminiJsonInvestigacaoV64_(
    construirPromptInterpretacaoTurnoV64_(mensagem, estado),
    {
      type: 'object',
      properties: {
        fatos: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              dimensao: { type: 'string', enum: ['processo','dor_causa','escala','impacto','excecoes','objetivo','restricoes','aceitacao'] },
              valor: { type: 'string' },
              evidencia: { type: 'string' },
              certeza: { type: 'string', enum: ['CONFIRMADO','ESTIMADO','NEGADO','DESCONHECIDO'] },
              certezaDetalhe: { type: 'string' },
              tipoAtualizacao: { type: 'string', enum: ['NOVO','EXTENSAO','CORRECAO','CONFIRMACAO'] }
            },
            required: ['dimensao','valor','evidencia','certeza','certezaDetalhe','tipoAtualizacao']
          }
        },
        respondeuPerguntaPendente: { type: 'boolean' },
        ambiguidade: { type: 'boolean' },
        explicacaoAmbiguidade: { type: 'string' }
      },
      required: ['fatos','respondeuPerguntaPendente','ambiguidade','explicacaoAmbiguidade']
    }
  );
}

function selecionarProximaPerguntaInvestigacaoV64_(estado, ultimaMensagem, motivoRejeicao, adaptador) {
  if (typeof adaptador === 'function') return adaptador(estado, ultimaMensagem, motivoRejeicao);
  return chamarGeminiJsonInvestigacaoV64_(
    construirPromptProximaPerguntaV64_(estado, ultimaMensagem, motivoRejeicao),
    {
      type: 'object',
      properties: {
        proximaPergunta: { type: 'string' },
        dimensaoAlvo: { type: 'string', enum: ['processo','dor_causa','escala','impacto','excecoes','objetivo','restricoes','aceitacao'] },
        justificativa: { type: 'string' },
        lacunaQueReduz: { type: 'string' }
      },
      required: ['proximaPergunta','dimensaoAlvo','justificativa','lacunaQueReduz']
    }
  );
}

function normalizarPerguntaInvestigacaoV64_(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function verificarPrecedenciaPerguntaV64_(estado, dimensao) {
  var prerequisitos = {
    processo: [],
    dor_causa: ['processo'],
    escala: ['processo'],
    frequencia: ['processo'],
    impacto: ['processo', 'dor_causa'],
    excecoes: ['processo'],
    objetivo: ['processo', 'dor_causa'],
    restricoes: ['processo', 'dor_causa'],
    aceitacao: ['processo', 'dor_causa', 'objetivo']
  };
  if (!prerequisitos.hasOwnProperty(dimensao)) {
    return { valida: false, motivo: 'DIMENSAO_ALVO_INVALIDA' };
  }
  var faltantes = prerequisitos[dimensao].filter(function(dim) {
    var fato = estado && estado.fatos && estado.fatos[dim];
    return !fato ||
      (fato.certeza !== CERTEZA_V64.CONFIRMADO &&
       fato.certeza !== CERTEZA_V64.NEGADO);
  });
  return faltantes.length
    ? { valida: false, motivo: 'PREMATURA', dimensoesPrecedentes: faltantes }
    : { valida: true, motivo: '' };
}

function compararPerguntaSemanticamenteV64_(perguntasFeitas, candidata, adaptador) {
  var texto = String(candidata || '').trim();
  var normalizada = normalizarPerguntaInvestigacaoV64_(texto);
  var perguntas = Array.isArray(perguntasFeitas) ? perguntasFeitas : [];
  if (!perguntas.length) return { equivalente: false, indice: -1, motivo: '', metodo: 'SEM_HISTORICO' };
  for (var i = 0; i < perguntas.length; i++) {
    var existente = typeof perguntas[i] === 'string' ? perguntas[i] : perguntas[i].texto;
    if (normalizarPerguntaInvestigacaoV64_(existente) === normalizada) {
      return { equivalente: true, indice: i, metodo: 'NORMALIZACAO_LITERAL' };
    }
  }
  if (typeof adaptador === 'function') return adaptador(perguntas, texto);
  var retorno = chamarGeminiJsonInvestigacaoV64_([
    'Compare semanticamente as perguntas já feitas com a pergunta candidata.',
    'Responda JSON: {"equivalente":true|false,"indice":0,"motivo":"..."}.',
    'SIM somente quando buscam essencialmente a mesma informação, mesmo com palavras diferentes.',
    'Perguntas já feitas:',
    JSON.stringify(perguntas),
    'Pergunta candidata:',
    texto
  ].join('\n'), {
    type: 'object',
    properties: {
      equivalente: { type: 'boolean' },
      indice: { type: 'integer' },
      motivo: { type: 'string' }
    },
    required: ['equivalente','indice','motivo']
  });
  return {
    equivalente: retorno.equivalente === true,
    indice: Number.isInteger(retorno.indice) ? retorno.indice : -1,
    motivo: String(retorno.motivo || ''),
    metodo: 'LLM'
  };
}

function validarPerguntaInvestigativaV64_(estado, candidata, adaptadorSemantico) {
  var pergunta = String(candidata && candidata.proximaPergunta || candidata && candidata.texto || '').trim();
  var dimensao = String(candidata && candidata.dimensaoAlvo || candidata && candidata.dimensao || '').trim();
  if (!pergunta || !/\?/.test(pergunta)) {
    return { valida: false, motivo: 'NAO_E_PERGUNTA_INVESTIGATIVA', perguntaAjustada: '' };
  }
  var contagem = (pergunta.match(/\?/g) || []).length;
  if (contagem > 1) {
    return { valida: false, motivo: 'MULTIPLAS_PERGUNTAS_NO_MESMO_TURNO', perguntaAjustada: '' };
  }
  if (estado && estado.lacunas && estado.lacunas[dimensao] === false &&
      !(candidata && candidata.forcarDetalhamento === true)) {
    return { valida: false, motivo: 'DIMENSAO_JA_SUFICIENTE', perguntaAjustada: '' };
  }
  var precedencia = verificarPrecedenciaPerguntaV64_(estado, dimensao);
  if (!precedencia.valida) {
    return {
      valida: false,
      motivo: precedencia.motivo,
      dimensoesPrecedentes: precedencia.dimensoesPrecedentes || [],
      perguntaAjustada: ''
    };
  }
  var comparacao = compararPerguntaSemanticamenteV64_(
    estado && estado.perguntasFeitas || [],
    pergunta,
    adaptadorSemantico
  );
  if (comparacao.equivalente) {
    return {
      valida: false,
      motivo: 'REPETICAO_SEMANTICA',
      perguntaEquivalenteIndice: comparacao.indice,
      perguntaAjustada: ''
    };
  }
  return {
    valida: true,
    motivo: '',
    perguntaAjustada: pergunta,
    dimensaoAlvo: dimensao,
    justificativa: String(candidata.justificativa || ''),
    lacunaQueReduz: String(candidata.lacunaQueReduz || '')
  };
}

function podeConcluirDiagnosticoV64_(estado) {
  var essenciais = ['processo', 'dor_causa', 'escala', 'frequencia', 'impacto', 'objetivo'];
  for (var i = 0; i < essenciais.length; i++) {
    var dim = essenciais[i];
    var fato = estado && estado.fatos && estado.fatos[dim];
    if (!fato || fato.certeza === CERTEZA_V64.DESCONHECIDO) {
      return { pode: false, motivo: 'DIMENSAO_ESSENCIAL_DESCONHECIDA:' + dim };
    }
    if (fato.conflitos && fato.conflitos.some(function(c) { return !c.resolvido; })) {
      return { pode: false, motivo: 'CONFLITO_NAO_RESOLVIDO:' + dim };
    }
  }
  var objetivo = estado.fatos.objetivo;
  var aceitacao = estado.fatos.aceitacao;
  if (objetivo.certeza === CERTEZA_V64.CONFIRMADO &&
      (!aceitacao || aceitacao.certeza === CERTEZA_V64.DESCONHECIDO)) {
    return { pode: false, motivo: 'CRITERIOS_ACEITACAO_DESCONHECIDOS' };
  }
  if (estado && Array.isArray(estado.conflitos) &&
      estado.conflitos.some(function(c) { return !c.resolvido; })) {
    return { pode: false, motivo: 'HA_CONFLITOS_NAO_RESOLVIDOS' };
  }
  return { pode: true, motivo: '', ressalvas: Object.keys(DIMENSOES_V64).map(function(k) {
    return DIMENSOES_V64[k];
  }).filter(function(dim) {
    var f = estado.fatos[dim];
    return f && (f.certeza === CERTEZA_V64.ESTIMADO ||
      (f.certeza === CERTEZA_V64.NEGADO && f.certezaDetalhe === 'NAO_SEI'));
  }) };
}

function processarTurnoInvestigacaoV64_(estado, mensagem, adaptadores) {
  adaptadores = adaptadores || {};
  if (!estado) estado = criarEstadoInvestigacaoVazioV64_();
  var texto = String(mensagem || '').trim();
  if (!texto) throw new Error('MENSAGEM_VAZIA_V64');

  var numeroTurno = estado.historico.length + 1;
  adicionarTurnoHistoricoV64_(estado, {
    id: 'EMPRESARIO_V64_' + numeroTurno,
    papel: 'EMPRESARIO',
    texto: texto,
    origem: 'turno-' + numeroTurno
  });

  var interpretacao = interpretarTurnoInvestigacaoV64_(
    texto, estado, adaptadores.interpretar
  );
  if (!interpretacao || !Array.isArray(interpretacao.fatos)) {
    throw new Error('INTERPRETACAO_TURNO_V64_INVALIDA');
  }

  var conflitos = [];
  interpretacao.fatos.forEach(function(fato) {
    if (!fato || !DIMENSOES_V64 ||
        Object.keys(DIMENSOES_V64).map(function(k) { return DIMENSOES_V64[k]; }).indexOf(fato.dimensao) === -1) return;
    var resultado = atualizarFatoV64_(
      estado,
      fato.dimensao,
      fato.valor,
      fato.evidencia,
      fato.certeza,
      'turno-' + numeroTurno,
      { certezaDetalhe: fato.certezaDetalhe || null, tipoAtualizacao: fato.tipoAtualizacao || '' }
    );
    if (resultado.conflito) conflitos.push(fato.dimensao);
  });

  var perguntaCandidata = null;
  var validacao = null;
  var motivoRejeicao = '';
  var tentativas = 0;
  var naoRespondeuPerguntaPendente = !!estado.perguntaPendente &&
    interpretacao.respondeuPerguntaPendente !== true;

  // Conflito factual exige esclarecimento antes de continuar a investigação ampla.
  if (conflitos.length) {
    var dimensaoConflito = conflitos[0];
    perguntaCandidata = {
      proximaPergunta: 'Percebi duas informações diferentes sobre ' +
        dimensaoConflito.replace(/_/g, ' ') +
        '. Qual delas devo considerar correta?',
      dimensaoAlvo: dimensaoConflito,
      justificativa: 'Resolver uma contradição antes de consolidar o diagnóstico.',
      lacunaQueReduz: 'conflito factual não resolvido'
    };
    validacao = { valida: true, motivo: '', perguntaAjustada: perguntaCandidata.proximaPergunta, dimensaoAlvo: dimensaoConflito };
  } else if (interpretacao.ambiguidade === true || naoRespondeuPerguntaPendente) {
    var motivoEsclarecimento = naoRespondeuPerguntaPendente
      ? 'RESPOSTA_NAO_RESPONDEU_PERGUNTA_PENDENTE'
      : String(interpretacao.explicacaoAmbiguidade || 'RESPOSTA_AMBIGUA');
    while (tentativas < 3) {
      perguntaCandidata = selecionarProximaPerguntaInvestigacaoV64_(
        estado, texto, motivoRejeicao || motivoEsclarecimento,
        adaptadores.selecionarPergunta
      );
      validacao = validarPerguntaInvestigativaV64_(estado, perguntaCandidata, adaptadores.verificarRepeticao);
      if (validacao.valida) break;
      motivoRejeicao = validacao.motivo + (validacao.dimensoesPrecedentes ? ':' + validacao.dimensoesPrecedentes.join(',') : '');
      tentativas++;
    }
  } else {
    var gate = podeConcluirDiagnosticoV64_(estado);
    if (gate.pode) {
      estado.perguntaPendente = null;
      return {
        sucesso: true,
        estado: estado,
        interpretacao: interpretacao,
        status_diagnostico: 'CONCLUIDO',
        gate: gate,
        proxima_pergunta: ''
      };
    }
    while (tentativas < 3) {
      perguntaCandidata = selecionarProximaPerguntaInvestigacaoV64_(
        estado, texto, motivoRejeicao, adaptadores.selecionarPergunta
      );
      validacao = validarPerguntaInvestigativaV64_(estado, perguntaCandidata, adaptadores.verificarRepeticao);
      if (validacao.valida) break;
      motivoRejeicao = validacao.motivo + (validacao.dimensoesPrecedentes ? ':' + validacao.dimensoesPrecedentes.join(',') : '');
      tentativas++;
    }
  }

  if (!validacao || !validacao.valida) {
    return {
      sucesso: false,
      estado: estado,
      interpretacao: interpretacao,
      status_diagnostico: 'INVESTIGACAO',
      erro: 'NAO_FOI_POSSIVEL_VALIDAR_PROXIMA_PERGUNTA',
      motivo: validacao && validacao.motivo || motivoRejeicao,
      tentativas: tentativas
    };
  }

  var perguntaFinal = validacao.perguntaAjustada;
  registrarPerguntaFeitaV64_(estado, perguntaFinal, validacao.dimensaoAlvo || perguntaCandidata.dimensaoAlvo);
  definirPerguntaPendenteV64_(estado, {
    id: 'PENDENTE_V64_' + numeroTurno,
    dimensao: validacao.dimensaoAlvo || perguntaCandidata.dimensaoAlvo,
    texto: perguntaFinal
  });
  adicionarTurnoHistoricoV64_(estado, {
    id: 'SISTEMA_V64_' + numeroTurno,
    papel: 'SISTEMA',
    texto: perguntaFinal,
    origem: 'motor-v6.4'
  });

  var gateFinal = podeConcluirDiagnosticoV64_(estado);
  return {
    sucesso: true,
    estado: estado,
    interpretacao: interpretacao,
    status_diagnostico: gateFinal.pode && !estado.perguntaPendente ? 'CONCLUIDO' : 'INVESTIGACAO',
    gate: gateFinal,
    proxima_pergunta: perguntaFinal,
    decisao_pergunta: {
      dimensaoAlvo: validacao.dimensaoAlvo || perguntaCandidata.dimensaoAlvo,
      justificativa: perguntaCandidata.justificativa || '',
      lacunaQueReduz: perguntaCandidata.lacunaQueReduz || '',
      tentativas: tentativas + 1
    }
  };
}
