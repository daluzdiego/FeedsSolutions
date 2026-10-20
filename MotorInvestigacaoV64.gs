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
    'Classifique pela variável efetivamente informada. Se a pergunta pendente for FREQUENCIA e a resposta mencionar horários, faixa do dia, pico ou dias da semana, registre frequencia, não escala. O fato de já existir “100 pedidos por dia” não transforma uma resposta sobre “entre 10h e meio-dia” em extensão de escala. Quantidade por período é escala; momento/distribuição temporal é frequência.',
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
    'Escala é quantidade de itens por período. Frequência é quando/quais dias/horários o processo acontece. Impacto é consequência/tempo/custo. Não confunda essas dimensões.',
    'Se escala/quantidade já estiver informada, não repita perguntas sobre quantidade diária, semanal ou volume.',
    'Perguntas sobre horários, picos e distribuição temporal pertencem a FREQUENCIA; perguntas sobre quantidades pertencem a ESCALA, mesmo se mencionarem períodos de pico.',
    'Se o motivo anterior indicar REPETICAO_SEMANTICA, preserve a lacuna como aberta, mas não repita a mesma redação/semântica: gere uma pergunta diferente para esclarecer outro aspecto da mesma dimensão ou vá à próxima lacuna.',
    'Se o motivo anterior indicar DIMENSAO_JA_SUFICIENTE, selecione outra dimensão ainda aberta.',
    'Nunca marque uma lacuna como preenchida apenas porque a pergunta foi repetida; somente um fato sustentado pode preenchê-la.',
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

function schemaInterpretacaoTurnoInvestigacaoV64_() {
  // Este schema é a fonte única do contrato de dimensões da interpretação.
  // O teste conversacional compara-o com DIMENSOES_V64 para evitar que uma
  // dimensão exista no estado/prompt, mas seja proibida pelo JSON Schema.
  return {
    type: 'object',
    properties: {
      fatos: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            dimensao: { type: 'string', enum: ['processo','dor_causa','escala','frequencia','impacto','excecoes','objetivo','restricoes','aceitacao'] },
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
  };
}

function interpretarTurnoInvestigacaoV64_(mensagem, estado, adaptador) {
  if (typeof adaptador === 'function') return adaptador(mensagem, estado);
  return chamarGeminiJsonInvestigacaoV64_(
    construirPromptInterpretacaoTurnoV64_(mensagem, estado),
    schemaInterpretacaoTurnoInvestigacaoV64_()
  );
}

/**
 * Corrige uma confusão dimensional objetiva: uma resposta temporal à pergunta
 * pendente de frequência pode ser rotulada pelo modelo como extensão de escala
 * só porque o fato de escala contém “por dia”. A correção só ocorre quando a
 * mensagem tem marcador temporal e o fato escala não descreve quantidade.
 * Evidência/certeza são preservadas; nenhuma informação é inventada.
 */
function corrigirFrequenciaMalClassificadaV64_(interpretacao, mensagem, estado) {
  if (!interpretacao || !Array.isArray(interpretacao.fatos) || !estado) return interpretacao;
  var texto = normalizarPerguntaInvestigacaoV64_(mensagem);
  var pendenteFrequencia = estado.perguntaPendente && estado.perguntaPendente.dimensao === 'frequencia';
  var marcadorTemporal = /horario|horarios|\bpico\b|maior movimento|entre \d{1,2} ?h|\b\d{1,2} ?h(?:\d{0,2})?\b|manha|tarde|noite|madrugada|dias uteis|finais de semana|segunda feira|terca feira|quarta feira|quinta feira|sexta feira|sabado|domingo|periodo do dia|periodos do dia/.test(texto);
  if (!marcadorTemporal) return interpretacao;

  interpretacao.fatos = interpretacao.fatos.map(function(fato) {
    if (!fato || fato.dimensao !== 'escala') return fato;
    var conteudo = normalizarPerguntaInvestigacaoV64_(String(fato.valor || '') + ' ' + String(fato.evidencia || ''));
    var descreveQuantidade = /\b\d+\b.*(pedido|item|ordem|registro|unidade)|\b(cem|duzentos|trezentos) pedidos\b|quantidade|volume|media de pedidos|pedidos por dia|pedidos por semana|pedidos por mes/.test(conteudo);
    var fatoTemporal = /horario|horarios|\bpico\b|maior movimento|entre \d{1,2} ?h|\b\d{1,2} ?h(?:\d{0,2})?\b|manha|tarde|noite|madrugada|dias uteis|finais de semana|segunda feira|terca feira|quarta feira|quinta feira|sexta feira|sabado|domingo|periodo do dia|periodos do dia/.test(conteudo);
    if (fatoTemporal && !descreveQuantidade && (pendenteFrequencia || !/pedido|item|ordem|registro|unidade/.test(conteudo))) {
      fato.dimensao = 'frequencia';
      if (!fato.valor) fato.valor = String(mensagem || '').trim();
      if (!fato.evidencia) fato.evidencia = String(mensagem || '').trim();
    }
    return fato;
  });
  return interpretacao;
}


/**
 * Corrige duração operacional classificada na dimensão errada quando a pergunta
 * pendente é impacto. Duração de trabalho gasto/consumido é impacto, não frequência.
 * A regra só reclassifica um fato cuja própria descrição contenha duração explícita.
 */
function corrigirImpactoMalClassificadoV64_(interpretacao, mensagem, estado) {
  if (!interpretacao || !Array.isArray(interpretacao.fatos) || !estado) return interpretacao;
  var pendenteImpacto = estado.perguntaPendente && estado.perguntaPendente.dimensao === 'impacto';
  if (!pendenteImpacto) return interpretacao;

  var possuiDuracao = function(texto) {
    var t = normalizarPerguntaInvestigacaoV64_(texto);
    var unidadeTempo = /\b(hora|horas|minuto|minutos)\b/.test(t);
    var quantidadeTempo = /\b(\d+|uma|um|duas|dois|tres|quatro|cinco|seis|sete|oito|nove|dez|meia)\b/.test(t);
    var descreveEsforco = /gasta|gastamos|gasto|consome|consumimos|consumido|leva|demora|perdemos|perda de tempo|tempo de conferencia|conferencia manual/.test(t);
    return unidadeTempo && quantidadeTempo && descreveEsforco;
  };

  interpretacao.fatos = interpretacao.fatos.map(function(fato) {
    if (!fato || fato.dimensao === 'impacto') return fato;
    if (possuiDuracao(fato.valor || '') || possuiDuracao(fato.evidencia || '')) {
      fato.dimensao = 'impacto';
    }
    return fato;
  });
  return interpretacao;
}

function selecionarProximaPerguntaInvestigacaoV64_(estado, ultimaMensagem, motivoRejeicao, adaptador) {
  if (typeof adaptador === 'function') return adaptador(estado, ultimaMensagem, motivoRejeicao);
  return chamarGeminiJsonInvestigacaoV64_(
    construirPromptProximaPerguntaV64_(estado, ultimaMensagem, motivoRejeicao),
    {
      type: 'object',
      properties: {
        proximaPergunta: { type: 'string' },
        dimensaoAlvo: { type: 'string', enum: ['processo','dor_causa','escala','frequencia','impacto','excecoes','objetivo','restricoes','aceitacao'] },
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

  // Comparação determinística lexical para não gastar chamada de IA quando
  // a sobreposição e a dimensão já são claramente equivalentes.
  var tokensNova = normalizada.split(' ').filter(function(t) {
    return t.length > 2 && !/^(qual|quais|como|quando|onde|voce|voces|para|pela|pelo|isso|esse|essa|sobre|entre|mais|menos|uma|uns|dos|das|por|dia|dias|que|com|tem|ser|sao|estao|acontece)$/.test(t);
  });
  var dimNova = classificarDimensaoPerguntaV64_(texto, null);
  var existeDimensaoComparavel = false;
  for (var i = 0; i < perguntas.length; i++) {
    var registro = perguntas[i];
    var existente = typeof registro === 'string' ? registro : registro.texto;
    var normalizadaExistente = normalizarPerguntaInvestigacaoV64_(existente);
    if (normalizadaExistente === normalizada) {
      return { equivalente: true, indice: i, motivo: 'mesma pergunta normalizada', metodo: 'NORMALIZACAO_LITERAL' };
    }
    var tokensExistentes = normalizadaExistente.split(' ').filter(function(t) {
      return t.length > 2 && !/^(qual|quais|como|quando|onde|voce|voces|para|pela|pelo|isso|esse|essa|sobre|entre|mais|menos|uma|uns|dos|das|por|dia|dias|que|com|tem|ser|sao|estao|acontece)$/.test(t);
    });
    var intersecao = tokensNova.filter(function(t) { return tokensExistentes.indexOf(t) !== -1; });
    var uniao = tokensNova.filter(function(t, idx, arr) { return arr.indexOf(t) === idx; })
      .concat(tokensExistentes.filter(function(t) { return tokensNova.indexOf(t) === -1; }));
    var jaccard = uniao.length ? intersecao.length / uniao.length : 0;
    var dimAntiga = (registro && registro.dimensao) ||
      classificarDimensaoPerguntaV64_(existente, null);
    if (dimNova && dimAntiga && dimNova !== dimAntiga) continue;
    if (dimNova && dimAntiga && dimNova === dimAntiga) existeDimensaoComparavel = true;
    if (jaccard >= 0.72 && (!dimNova || !dimAntiga || dimNova === dimAntiga)) {
      return { equivalente: true, indice: i, motivo: 'alto grau de sobreposição lexical (' + jaccard.toFixed(2) + ')', metodo: 'SIMILARIDADE_LEXICAL' };
    }
  }
  // Se as perguntas anteriores medem dimensões explicitamente diferentes,
  // não consuma uma chamada Gemini apenas para confirmar que não são repetidas.
  var dimensoesHistorico = perguntas.map(function(registro) {
    var textoPergunta = typeof registro === 'string' ? registro : registro.texto;
    return (registro && registro.dimensao) || classificarDimensaoPerguntaV64_(textoPergunta, null);
  }).filter(function(dim) { return !!dim; });
  var dimensaoHistoricoNaoComparavel = dimNova && dimensoesHistorico.length > 0 && dimensoesHistorico.every(function(dim) { return dim !== dimNova; });
  if (dimensaoHistoricoNaoComparavel || (dimNova && !existeDimensaoComparavel && dimensoesHistorico.length === 0)) {
    return { equivalente: false, indice: -1, motivo: 'DIMENSAO_DISTINTA_DO_HISTORICO', metodo: 'DIMENSAO' };
  }
  if (typeof adaptador === 'function') return adaptador(perguntas, texto);
  var retorno = chamarGeminiJsonInvestigacaoV64_([
    'Compare semanticamente as perguntas já feitas com a pergunta candidata.',
    'SIM quando duas perguntas buscam a mesma resposta central, mesmo com paráfrases.',
    'NÃO quando perguntam por variáveis distintas, como quantidade total versus horários de pico.',
    'Responda JSON: {"equivalente":true|false,"indice":0,"motivo":"..."}.',
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

function inferirDimensaoLacunaV64_(lacuna) {
  var texto = normalizarPerguntaInvestigacaoV64_(lacuna);
  if (!texto) return null;

  // Só infere quando há marcador explícito; descrições ambíguas ficam sem classificação.
  var escala = /(^| )(escala|volume|quantidade|quantitativo|numero de pedidos|pedidos por dia|pedidos por semana|pedidos por mes)( |$)/.test(texto);
  var frequencia = /(^| )(frequencia|horario|horarios|distribuicao temporal|periodo do dia|periodos do dia|pico|dias da semana|dias de pico)( |$)/.test(texto);
  if (escala && !frequencia) return 'escala';
  if (frequencia && !escala) return 'frequencia';
  return null;
}

function validarPerguntaInvestigativaV64_(estado, candidata, adaptadorSemantico) {
  var pergunta = String(candidata && candidata.proximaPergunta || candidata && candidata.texto || '').trim();
  var dimensao = String(candidata && candidata.dimensaoAlvo || candidata && candidata.dimensao || '').trim();
  if (!pergunta || !/\?/.test(pergunta)) {
    return { valida: false, motivo: 'NAO_E_PERGUNTA_INVESTIGATIVA', perguntaAjustada: '' };
  }
  if ((pergunta.match(/\?/g) || []).length > 1) {
    return { valida: false, motivo: 'MULTIPLAS_PERGUNTAS_NO_MESMO_TURNO', perguntaAjustada: '' };
  }
  if (!estado || !estado.fatos || !estado.lacunas ||
      !estado.fatos.hasOwnProperty(dimensao)) {
    return { valida: false, motivo: 'DIMENSAO_ALVO_INVALIDA', perguntaAjustada: '' };
  }

  // A classificação explícita do texto tem precedência: impede que o Gemini
  // rotule uma pergunta sobre horários de pico como uma lacuna nova de escala.
  var dimensaoDetectada = classificarDimensaoPerguntaV64_(pergunta, estado);
  if (dimensaoDetectada && dimensaoDetectada !== dimensao) {
    return {
      valida: false,
      motivo: 'DIMENSAO_ALVO_NAO_CORRESPONDE_A_PERGUNTA',
      dimensaoDetectada: dimensaoDetectada,
      perguntaAjustada: ''
    };
  }

  var dimensaoLacunaDetectada = inferirDimensaoLacunaV64_(candidata && candidata.lacunaQueReduz);
  if (dimensaoLacunaDetectada && dimensaoLacunaDetectada !== dimensao) {
    return {
      valida: false,
      motivo: 'LACUNA_QUE_REDUZ_DIVERGE_DA_DIMENSAO_ALVO',
      dimensaoDetectada: dimensaoDetectada || null,
      dimensaoLacunaDetectada: dimensaoLacunaDetectada,
      dimensaoAlvo: dimensao,
      perguntaAjustada: ''
    };
  }

  if (estado.lacunas[dimensao] === false &&
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
      dimensaoEquivalente: compararDimensaoPerguntaComHistoricoV64_(estado, comparacao.indice),
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

function classificarDimensaoPerguntaV64_(pergunta, estado) {
  var p = normalizarPerguntaInvestigacaoV64_(pergunta);

  // Primeiro identifica a variável que a pergunta realmente mede.
  // "Quantos pedidos chegam nos horários de pico?" continua sendo escala;
  // só perguntas sobre quando/horários são frequência.
  // Duração/tempo consumido é impacto, mesmo quando a frase começa por “quantas horas”.
  if (/quanto tempo|quantas horas|quantos minutos|quantas horas sao gastas|horas por dia|minutos por dia|tempo gasto|tempo consumido|tempo leva|demora|duracao/.test(p)) return 'impacto';
  // Marcadores temporais têm precedência quando a pergunta procura saber QUANDO
  // ocorre o pico. Só tratamos como escala quando há uma solicitação quantitativa
  // explícita (por exemplo, "quantos pedidos chegam no horário de pico?").
  // A palavra "volume" isolada não torna quantitativa uma pergunta sobre dias/horários.
  var perguntaQuantitativaExplicita =
    /(^|\s)(quantos|quantas)\b/.test(p) ||
    /\b(qual a quantidade|qual o volume|quantidade de pedidos|media de pedidos)\b/.test(p);
  if (/horario|horarios|pico|maior movimento|distribuicao ao longo do dia|em que periodo|em que periodos|em quais periodos|em que epoca|em quais epocas|epoca do semestre|epocas do semestre|periodo da safra|periodos da safra|em que horario|turno de maior|horas de pico|distribuicao temporal|dias e horarios|quando chegam|em quais dias|periodo do dia|periodos do dia/.test(p) &&
      !perguntaQuantitativaExplicita) {
    return 'frequencia';
  }
  if (/quantos|quantas|quantidade|volume|media de pedidos|itens por dia|pedidos por dia|pedidos por semana|pedidos por mes|quantidade diaria|quantidade semanal|cem pedidos|100 pedidos/.test(p)) {
    return 'escala';
  }
  if (/objetivo|resultado deseja|alcancar|melhorar|conseguir ao final/.test(p)) return 'objetivo';
  // Critério verificável do resultado é aceitação, mesmo quando a pergunta menciona
  // redução de erros, chamados ou tempo. Diferenciar "qual o impacto atual" de
  // "qual indicador comprova que a solução melhorou".
  if (/aceitacao|criterio de sucesso|considerar concluido|medir o sucesso|funcionou|como sera medido|medido que|qual indicador|indicador comprovara|comprovar[a-z]* que|criterio verificavel|resultado observavel|reduziu chamados|reduziu erros|melhorou/.test(p)) return 'aceitacao';
  if (/excecao|fora do padrao|regra especial/.test(p)) return 'excecoes';
  // "Prazo" pode significar restrição do projeto ou consequência operacional.
  // Quando a pergunta fala explicitamente de impacto/erro/atraso/perda, classifique
  // pela consequência antes de aplicar o marcador genérico de restrição.
  if (/tempo|custo|impacto|atraso|retrabalho|consequencia|erro|perda|prejuizo/.test(p)) return 'impacto';
  if (/restricao|orcamento|prazo|permissao|seguranca|integracao|ferramenta|sistema|canal/.test(p)) return 'restricoes';
  if (/dor|problema|falha|etapa|causa/.test(p)) return 'dor_causa';
  if (/como acontece|como funciona|descreva o processo|primeiro passo|passo a passo/.test(p)) return 'processo';
  return null;
}

function compararDimensaoPerguntaComHistoricoV64_(estado, indice) {
  var perguntas = estado && estado.perguntasFeitas || [];
  var registro = perguntas[indice];
  if (!registro) return null;
  if (registro.dimensao) return registro.dimensao;
  return classificarDimensaoPerguntaV64_(registro.texto || registro, estado);
}

function podeConcluirDiagnosticoV64_(estado) {
  var essenciais = ['processo', 'dor_causa', 'escala', 'frequencia', 'impacto', 'objetivo'];
  for (var i = 0; i < essenciais.length; i++) {
    var dim = essenciais[i];
    var fato = estado && estado.fatos && estado.fatos[dim];
    if (!fato || fato.certeza === CERTEZA_V64.DESCONHECIDO) {
      return { pode: false, motivo: 'DIMENSAO_ESSENCIAL_DESCONHECIDA:' + dim };
    }
    // Estimativa mantém a lacuna aberta no contrato do estado. Uma dimensão
    // essencial estimada não pode liberar conclusão; é necessário confirmá-la.
    if (fato.certeza === CERTEZA_V64.ESTIMADO) {
      return { pode: false, motivo: 'DIMENSAO_ESSENCIAL_ESTIMADA:' + dim };
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


/**
 * Plano de contingência determinístico: se o Gemini não produzir uma pergunta
 * válida após as tentativas limitadas, tenta uma lacuna ainda aberta, inclusive
 * com formulação alternativa quando a dimensão já foi perguntada mas não resolvida.
 * Não altera fatos nem conclui o diagnóstico.
 */
function selecionarFallbackDeterministicoInvestigacaoV64_(estado) {
  var candidatas = [
    { dimensaoAlvo: 'dor_causa', proximaPergunta: 'Em qual etapa do processo surge a principal dificuldade?', justificativa: 'Localizar a etapa problemática sem presumir sua causa.', lacunaQueReduz: 'etapa da dificuldade' },
    { dimensaoAlvo: 'escala', proximaPergunta: 'Quantos pedidos são processados em um dia comum?', justificativa: 'Dimensionar o volume de trabalho.', lacunaQueReduz: 'quantidade de pedidos' },
    { dimensaoAlvo: 'frequencia', proximaPergunta: 'Em que períodos do dia o movimento aumenta, independentemente do total de pedidos?', justificativa: 'Entender a distribuição temporal do processo sem voltar a medir volume.', lacunaQueReduz: 'distribuição temporal' },
    { dimensaoAlvo: 'impacto', proximaPergunta: 'Quanto tempo a equipe gasta conferindo os pedidos por dia?', justificativa: 'Dimensionar o esforço operacional.', lacunaQueReduz: 'tempo de conferência' },
    { dimensaoAlvo: 'objetivo', proximaPergunta: 'Qual é o principal resultado que vocês querem alcançar com a melhoria?', justificativa: 'Definir o resultado esperado pelo empresário.', lacunaQueReduz: 'resultado esperado' },
    { dimensaoAlvo: 'excecoes', proximaPergunta: 'Existe alguma situação em que o processo funciona de maneira diferente?', justificativa: 'Identificar exceções que afetem o desenho da solução.', lacunaQueReduz: 'exceções do processo' },
    { dimensaoAlvo: 'restricoes', proximaPergunta: 'Há alguma limitação de prazo, orçamento ou ferramenta que precisamos respeitar?', justificativa: 'Identificar restrições relevantes para a solução.', lacunaQueReduz: 'restrições do projeto' },
    { dimensaoAlvo: 'aceitacao', proximaPergunta: 'Que resultado observável faria vocês considerar a melhoria bem-sucedida?', justificativa: 'Definir um critério verificável de sucesso.', lacunaQueReduz: 'critério de sucesso' }
  ];
  // Uma dimensão já perguntada não está necessariamente resolvida: o empresário
  // pode não saber responder, responder parcialmente ou o Gemini pode repetir a
  // pergunta. Só descartamos dimensões cuja lacuna foi efetivamente fechada.
  // A validação abaixo continua impedindo repetição literal/lexical e perguntas
  // prematuras. Isso permite uma formulação alternativa para a mesma lacuna aberta.
  for (var i = 0; i < candidatas.length; i++) {
    var candidata = candidatas[i];
    var dimensao = candidata.dimensaoAlvo;
    if (estado && estado.lacunas && estado.lacunas[dimensao] === false) continue;

    var validacao = validarPerguntaInvestigativaV64_(
      estado,
      candidata,
      // O fallback só tenta dimensões ainda não perguntadas; a validação lexical
      // continua ativa, mas a contingência não depende de uma nova chamada Gemini.
      function() { return { equivalente: false, indice: -1, motivo: 'FALLBACK_DIMENSAO_NAO_PERGUNTADA' }; }
    );
    if (validacao.valida) {
      return { candidata: candidata, validacao: validacao };
    }
  }
  return null;
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
  interpretacao = corrigirFrequenciaMalClassificadaV64_(interpretacao, texto, estado);
  interpretacao = corrigirImpactoMalClassificadoV64_(interpretacao, texto, estado);
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
  } else if (podeConcluirDiagnosticoV64_(estado).pode) {
    // A conclusão é avaliada depois de incorporar os fatos deste turno e antes
    // de tentar esclarecer uma pergunta pendente. Se todas as condições do gate
    // já foram satisfeitas, uma interpretação que não reconheceu a resposta à
    // última pergunta não deve manter o diagnóstico aberto artificialmente.
    var gatePosInterpretacao = podeConcluirDiagnosticoV64_(estado);
    estado.perguntaPendente = null;
    return {
      sucesso: true,
      estado: estado,
      interpretacao: interpretacao,
      status_diagnostico: 'CONCLUIDO',
      gate: gatePosInterpretacao,
      proxima_pergunta: ''
    };
  } else if (interpretacao.ambiguidade === true || naoRespondeuPerguntaPendente) {
    var motivoEsclarecimento = naoRespondeuPerguntaPendente
      ? 'RESPOSTA_NAO_RESPONDEU_PERGUNTA_PENDENTE'
      : String(interpretacao.explicacaoAmbiguidade || 'RESPOSTA_AMBIGUA');
    while (tentativas < 2) {
      perguntaCandidata = selecionarProximaPerguntaInvestigacaoV64_(
        estado, texto, motivoRejeicao || motivoEsclarecimento,
        adaptadores.selecionarPergunta
      );
      validacao = validarPerguntaInvestigativaV64_(estado, perguntaCandidata, adaptadores.verificarRepeticao);
      if (validacao.valida) break;

      // Repetição da pergunta não significa que a lacuna foi respondida.
      // Preservamos a lacuna aberta e exigimos uma pergunta distinta.
      var dimensaoRepetida = validacao.dimensaoEquivalente ||
        (validacao.perguntaEquivalenteIndice >= 0
          ? compararDimensaoPerguntaComHistoricoV64_(estado, validacao.perguntaEquivalenteIndice)
          : null);
      if (validacao.motivo === 'REPETICAO_SEMANTICA' && dimensaoRepetida) {
        motivoRejeicao = 'REPETICAO_SEMANTICA:' + dimensaoRepetida +
          '. NÃO marque essa lacuna como preenchida. Pergunte algo realmente diferente; ' +
          'se não houver outra formulação útil, selecione a próxima lacuna essencial.';
      } else {
        motivoRejeicao = validacao.motivo +
          (validacao.dimensoesPrecedentes ? ':' + validacao.dimensoesPrecedentes.join(',') : '') +
          (validacao.dimensaoDetectada ? ':dimensaoDetectada=' + validacao.dimensaoDetectada : '');
      }
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
    while (tentativas < 2) {
      perguntaCandidata = selecionarProximaPerguntaInvestigacaoV64_(
        estado, texto, motivoRejeicao, adaptadores.selecionarPergunta
      );
      validacao = validarPerguntaInvestigativaV64_(estado, perguntaCandidata, adaptadores.verificarRepeticao);
      if (validacao.valida) break;
      var dimensaoRepetidaNormal = validacao.dimensaoEquivalente ||
        (validacao.perguntaEquivalenteIndice >= 0
          ? compararDimensaoPerguntaComHistoricoV64_(estado, validacao.perguntaEquivalenteIndice)
          : null);
      if (validacao.motivo === 'REPETICAO_SEMANTICA' && dimensaoRepetidaNormal) {
        motivoRejeicao = 'REPETICAO_SEMANTICA:' + dimensaoRepetidaNormal +
          '. Não marque essa lacuna como preenchida; use formulação realmente diferente ou avance para outra lacuna essencial.';
      } else {
        motivoRejeicao = validacao.motivo +
          (validacao.dimensoesPrecedentes ? ':' + validacao.dimensoesPrecedentes.join(',') : '') +
          (validacao.dimensaoDetectada ? ':dimensaoDetectada=' + validacao.dimensaoDetectada : '');
      }
      tentativas++;
    }
  }

  var usouFallbackDeterministico = false;
  if (!validacao || !validacao.valida) {
    var fallback = selecionarFallbackDeterministicoInvestigacaoV64_(estado);
    if (fallback) {
      perguntaCandidata = fallback.candidata;
      validacao = fallback.validacao;
      usouFallbackDeterministico = true;
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
      tentativas: tentativas + 1,
      fallbackDeterministico: usouFallbackDeterministico
    }
  };
}
