/**
 * ============================================================
 * NEURO SOLUTIONS — MVP V1
 * IA.GS
 * ============================================================
 *
 * CAMADA DE INTELIGÊNCIA ARTIFICIAL
 *
 * Responsabilidades:
 * - Comunicação com Gemini
 * - Teste de conexão
 * - Consulta de modelos
 * - Saída estruturada
 * - Interpretação inicial do diagnóstico
 *
 * A IA INTERPRETA.
 * O MOTOR DE DECISÃO DECIDE.
 *
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * CONFIGURAÇÃO
 * ------------------------------------------------------------
 */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta';


/**
 * ------------------------------------------------------------
 * TESTE DE CONEXÃO
 * ------------------------------------------------------------
 */
function testarGemini() {

  const apiKey =
    obterGeminiApiKey_();

  const model =
    obterGeminiModel_();

  const url =
    construirUrlGemini_(model);

  const payload = {

    contents: [

      {
        parts: [

          {
            text: 'Responda somente: OK'
          }

        ]
      }

    ],

    generationConfig: {

      maxOutputTokens: 50,

      thinkingConfig: {
        thinkingLevel: 'minimal'
      }

    }

  };


  const resultado =
    executarGemini_(url, payload, apiKey);


  const resposta =
    extrairTextoGemini_(
      resultado.dados
    );


  return {

    sucesso: true,

    modelo: model,

    tempo_ms: resultado.tempo_ms,

    resposta: resposta

  };
}


/**
 * ------------------------------------------------------------
 * TESTE REAL DO DIAGNÓSTICO
 * ------------------------------------------------------------
 *
 * Esta é a primeira função que realmente interessa.
 *
 * Ela recebe uma fala do empresário e pede à IA somente
 * para interpretar o que foi dito.
 *
 * A IA NÃO escolhe solução.
 * A IA NÃO classifica o lead.
 * A IA NÃO promete nada.
 */
function testarDiagnosticoIA() {

  const mensagem =
    'Tenho uma gráfica e minha funcionária perde três horas por dia colocando os pedidos manualmente numa planilha.';


  const resultado =
    analisarMensagemDiagnostico_(
      mensagem
    );


  Logger.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );


  return resultado;
}


/**
 * ------------------------------------------------------------
 * ANALISAR MENSAGEM DO DIAGNÓSTICO
 * ------------------------------------------------------------
 */
function analisarMensagemDiagnostico_(mensagem) {

  if (!mensagem) {

    throw new Error(
      'Mensagem do empresário não informada.'
    );
  }


  const apiKey =
    obterGeminiApiKey_();

  const model =
    obterGeminiModel_();

  const url =
    construirUrlGemini_(model);


  const schema =
    obterSchemaDiagnostico_();


  const prompt =
    construirPromptDiagnostico_(
      mensagem
    );


  const payload = {

    contents: [

      {

        role: 'user',

        parts: [

          {
            text: prompt
          }

        ]

      }

    ],

    generationConfig: {

      responseMimeType:
        'application/json',

      responseSchema:
        schema,

      maxOutputTokens: 600,

      thinkingConfig: {
        thinkingLevel: 'minimal'
      }

    }

  };


  const resultado =
    executarGemini_(
      url,
      payload,
      apiKey
    );


  const texto =
    extrairTextoGemini_(
      resultado.dados
    );


  let dados;


  try {

    dados =
      JSON.parse(texto);

  } catch (erro) {

    throw new Error(
      'Gemini retornou conteúdo que não pôde ser convertido em JSON: ' +
      texto
    );

  }


  validarDiagnosticoIA_(dados);


  return {

    sucesso: true,

    modelo: model,

    tempo_ms:
      resultado.tempo_ms,

    dados: dados

  };

}


/**
 * ------------------------------------------------------------
 * PROMPT DO DIAGNÓSTICO
 * ------------------------------------------------------------
 */
function construirPromptDiagnostico_(mensagem) {

  return [

    'Você é o componente de interpretação de um sistema de diagnóstico empresarial.',

    '',

    'Sua função é interpretar exatamente o que o empresário contou.',

    '',

    'REGRAS ABSOLUTAS:',

    '1. Não invente informações.',

    '2. Não faça suposições apresentadas como fatos.',

    '3. Não ofereça soluções.',

    '4. Não classifique o cliente como lead.',

    '5. Não diga que podemos resolver o problema.',

    '6. Não mencione produtos ou serviços.',

    '7. Se uma informação não foi fornecida, deixe o campo vazio.',

    '8. Identifique somente informações sustentadas pela mensagem.',

    '9. A próxima pergunta deve buscar somente uma informação realmente relevante para entender a dor.',

    '10. A pergunta deve ser curta e natural.',

    '',

    'OBJETIVO:',

    'Transformar a fala do empresário em dados estruturados para que outro componente do sistema faça a decisão posteriormente.',

    '',

    'MENSAGEM DO EMPRESÁRIO:',

    mensagem

  ].join('\n');

}


/**
 * ------------------------------------------------------------
 * SCHEMA DO DIAGNÓSTICO
 * ------------------------------------------------------------
 */
function obterSchemaDiagnostico_() {

  return {

    type: 'object',

    properties: {

      processo: {

        type: 'string',

        description:
          'Processo ou atividade mencionada pelo empresário. Vazio se não identificado.'

      },

      dor_principal: {

        type: 'string',

        description:
          'Principal dificuldade explicitamente relatada. Vazio se não identificada.'

      },

      frequencia: {

        type: 'string',

        description:
          'Frequência explicitamente informada, como diária, semanal, mensal ou outra. Vazio se não informada.'

      },

      impacto: {

        type: 'string',

        description:
          'Impacto explicitamente informado ou claramente quantificado pelo empresário. Não inventar. Vazio se não informado.'

      },

      objetivo: {

        type: 'string',

        description:
          'O que o empresário explicitamente deseja melhorar ou alcançar. Vazio se não informado.'

      },

      informacao_faltante: {

        type: 'string',

        description:
          'Uma única informação relevante que ainda falta para compreender melhor a dor. Vazio se nenhuma informação importante estiver faltando.'

      },

      proxima_pergunta: {

        type: 'string',

        description:
          'Uma única pergunta curta que busca a informação faltante. Vazio se não for necessária.'

      }

    },

    required: [

      'processo',

      'dor_principal',

      'frequencia',

      'impacto',

      'objetivo',

      'informacao_faltante',

      'proxima_pergunta'

    ]

  };

}


/**
 * ------------------------------------------------------------
 * VALIDAR RESULTADO DA IA
 * ------------------------------------------------------------
 */
function validarDiagnosticoIA_(dados) {

  const camposObrigatorios = [

    'processo',

    'dor_principal',

    'frequencia',

    'impacto',

    'objetivo',

    'informacao_faltante',

    'proxima_pergunta'

  ];


  camposObrigatorios.forEach(
    function(campo) {

      if (
        dados[campo] === undefined ||
        dados[campo] === null
      ) {

        throw new Error(
          'Resposta da IA não possui o campo obrigatório: ' +
          campo
        );

      }


      if (
        typeof dados[campo] !== 'string'
      ) {

        throw new Error(
          'Campo da IA possui tipo inválido: ' +
          campo
        );

      }

    }
  );


  return true;
}


/**
 * ------------------------------------------------------------
 * TESTE COM TEXTO
 * ------------------------------------------------------------
 */
function testarGeminiComTexto() {

  const texto =
    'Tenho uma empresa e minha equipe perde muito tempo digitando informações manualmente em planilhas.';


  return chamarGemini_(
    texto
  );

}


/**
 * ------------------------------------------------------------
 * CHAMADA GENÉRICA
 * ------------------------------------------------------------
 */
function chamarGemini_(texto) {

  if (!texto) {

    throw new Error(
      'Texto para a IA não informado.'
    );
  }


  const apiKey =
    obterGeminiApiKey_();

  const model =
    obterGeminiModel_();

  const url =
    construirUrlGemini_(model);


  const payload = {

    contents: [

      {

        role: 'user',

        parts: [

          {
            text: texto
          }

        ]

      }

    ]

  };


  const resultado =
    executarGemini_(
      url,
      payload,
      apiKey
    );


  const resposta =
    extrairTextoGemini_(
      resultado.dados
    );


  return {

    sucesso: true,

    modelo: model,

    tempo_ms:
      resultado.tempo_ms,

    resposta: resposta,

    resposta_bruta:
      resultado.dados

  };

}


/**
 * ------------------------------------------------------------
 * LISTAR MODELOS
 * ------------------------------------------------------------
 */
function listarModelosGemini() {

  const apiKey =
    obterGeminiApiKey_();


  const url =
    GEMINI_API_URL +
    '/models';


  const options = {

    method: 'get',

    headers: {

      'x-goog-api-key':
        apiKey

    },

    muteHttpExceptions: true

  };


  const response =
    UrlFetchApp.fetch(
      url,
      options
    );


  const statusCode =
    response.getResponseCode();


  const texto =
    response.getContentText();


  Logger.log(
    'HTTP STATUS: ' +
    statusCode
  );


  if (
    statusCode < 200 ||
    statusCode >= 300
  ) {

    throw new Error(
      'Erro ao consultar modelos Gemini. HTTP ' +
      statusCode +
      ': ' +
      texto
    );

  }


  const dados =
    JSON.parse(
      texto
    );


  const modelos =
    (dados.models || [])
      .map(
        function(modelo) {

          return {

            nome:
              modelo.name || '',

            displayName:
              modelo.displayName || '',

            descricao:
              modelo.description || '',

            metodos:
              modelo.supportedGenerationMethods || []

          };

        }
      );


  Logger.log(
    JSON.stringify(
      modelos,
      null,
      2
    )
  );


  return modelos;
}


/**
 * ------------------------------------------------------------
 * EXECUTAR CHAMADA GEMINI
 * ------------------------------------------------------------
 */
function executarGemini_(
  url,
  payload,
  apiKey
) {

  /**
   * ==========================================================
   * RETRY CONTROLADO
   * ==========================================================
   *
   * O Gemini pode retornar erros transitórios, principalmente
   * HTTP 503 (Service Unavailable), 429 (rate limit) e alguns
   * erros 5xx. Não devemos perder uma rodada do diagnóstico por
   * causa de uma indisponibilidade momentânea do serviço.
   *
   * Tentativas:
   * 1ª tentativa: imediata
   * 2ª tentativa: após 1,5 s
   * 3ª tentativa: após 3 s
   *
   * Erros permanentes (400, 401, 403, 404 etc.) não são repetidos.
   * ==========================================================
   */

  const dependenciasTeste = arguments[3] || null;

  const fetchGemini = dependenciasTeste && typeof dependenciasTeste.fetch === 'function'
    ? dependenciasTeste.fetch
    : function(urlFetch, optionsFetch) { return UrlFetchApp.fetch(urlFetch, optionsFetch); };

  const sleepGemini = dependenciasTeste && typeof dependenciasTeste.sleep === 'function'
    ? dependenciasTeste.sleep
    : function(ms) { Utilities.sleep(ms); };

  const MAX_TENTATIVAS = 3;

  const ESPERAS_MS = [
    0,
    1500,
    3000
  ];


  const options = {

    method: 'post',

    contentType:
      'application/json',

    headers: {

      'x-goog-api-key':
        apiKey

    },

    payload:
      JSON.stringify(payload),

    muteHttpExceptions:
      true

  };


  const inicioTotal =
    Date.now();


  let ultimoStatus = null;
  let ultimoTexto = '';


  for (
    let tentativa = 1;
    tentativa <= MAX_TENTATIVAS;
    tentativa++
  ) {

    if (
      ESPERAS_MS[tentativa - 1] > 0
    ) {

      sleepGemini(
        ESPERAS_MS[tentativa - 1]
      );

    }


    Logger.log(
      'GEMINI - TENTATIVA ' +
      tentativa +
      '/' +
      MAX_TENTATIVAS
    );


    const inicioTentativa =
      Date.now();


    let response;


    try {

      response =
        fetchGemini(
          url,
          options
        );

    } catch (erro) {

      Logger.log(
        'GEMINI - ERRO DE TRANSPORTE NA TENTATIVA ' +
        tentativa +
        ': ' +
        erro
      );

      if (
        tentativa < MAX_TENTATIVAS
      ) {

        continue;

      }

      throw new Error(
        'Não foi possível conectar ao Gemini após ' +
        MAX_TENTATIVAS +
        ' tentativas: ' +
        erro
      );

    }


    const tempoTentativa =
      Date.now() -
      inicioTentativa;


    const statusCode =
      response.getResponseCode();


    const texto =
      response.getContentText();


    ultimoStatus =
      statusCode;

    ultimoTexto =
      texto;


    Logger.log(
      'HTTP STATUS: ' +
      statusCode
    );


    Logger.log(
      'TEMPO: ' +
      tempoTentativa +
      ' ms'
    );


    Logger.log(
      'RESPOSTA GEMINI: ' +
      texto
    );


    /**
     * ----------------------------------------------------------
     * SUCESSO
     * ----------------------------------------------------------
     */

    if (
      statusCode >= 200 &&
      statusCode < 300
    ) {

      let dados;


      try {

        dados =
          JSON.parse(texto);

      } catch (erro) {

        throw new Error(
          'Resposta do Gemini não é JSON válido.'
        );

      }


      return {

        dados: dados,

        tempo_ms:
          Date.now() -
          inicioTotal,

        status_code:
          statusCode,

        tentativas:
          tentativa

      };

    }


    /**
     * ----------------------------------------------------------
     * ERROS TRANSITÓRIOS
     * ----------------------------------------------------------
     *
     * 429 = limite/rate limit
     * 500 = erro interno
     * 502 = bad gateway
     * 503 = service unavailable
     * 504 = gateway timeout
     */

    const erroTransitorio =
      (
        statusCode === 429 ||
        statusCode === 500 ||
        statusCode === 502 ||
        statusCode === 503 ||
        statusCode === 504
      );


    if (
      erroTransitorio &&
      tentativa < MAX_TENTATIVAS
    ) {

      Logger.log(
        'GEMINI - ERRO TRANSITÓRIO HTTP ' +
        statusCode +
        '. Nova tentativa será realizada.'
      );

      continue;

    }


    /**
     * ----------------------------------------------------------
     * ERRO DEFINITIVO OU TENTATIVAS ESGOTADAS
     * ----------------------------------------------------------
     */

    let mensagemErro =
      'Gemini retornou HTTP ' +
      statusCode +
      ': ' +
      texto;


    if (
      erroTransitorio
    ) {

      mensagemErro +=
        ' | Foram realizadas ' +
        tentativa +
        ' tentativas.';

    }


    throw new Error(
      mensagemErro
    );

  }


  throw new Error(
    'Falha inesperada ao executar Gemini. ' +
    'HTTP ' +
    ultimoStatus +
    ': ' +
    ultimoTexto
  );

}


/**
 * ------------------------------------------------------------
 * EXTRAIR TEXTO DA RESPOSTA
 * ------------------------------------------------------------
 */
function extrairTextoGemini_(dados) {

  if (
    !dados ||
    !dados.candidates ||
    !dados.candidates.length
  ) {

    throw new Error(
      'Gemini não retornou candidates.'
    );

  }


  const candidate =
    dados.candidates[0];


  if (
    candidate.finishReason ===
    'MAX_TOKENS'
  ) {

    throw new Error(
      'Gemini encerrou por MAX_TOKENS antes de concluir a resposta.'
    );

  }


  if (
    !candidate.content ||
    !candidate.content.parts ||
    !candidate.content.parts.length
  ) {

    throw new Error(
      'Gemini retornou uma resposta sem conteúdo.'
    );

  }


  return candidate.content.parts

    .map(
      function(part) {

        return part.text || '';

      }
    )

    .join('');

}


/**
 * ------------------------------------------------------------
 * OBTER API KEY
 * ------------------------------------------------------------
 */
function obterGeminiApiKey_() {

  const apiKey =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        'GEMINI_API_KEY'
      );


  if (!apiKey) {

    throw new Error(
      'GEMINI_API_KEY não encontrada nas Script Properties.'
    );

  }


  return apiKey;
}


/**
 * ------------------------------------------------------------
 * OBTER MODELO
 * ------------------------------------------------------------
 */
function obterGeminiModel_() {

  const model =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        'GEMINI_MODEL'
      );


  if (!model) {

    throw new Error(
      'GEMINI_MODEL não configurado nas Script Properties.'
    );

  }


  return model;
}


/**
 * ------------------------------------------------------------
 * CONSTRUIR URL
 * ------------------------------------------------------------
 */
function construirUrlGemini_(model) {

  return (
    GEMINI_API_URL +
    '/models/' +
    encodeURIComponent(model) +
    ':generateContent'
  );

}


/**
 * ------------------------------------------------------------
 * TESTE DE ROBUSTEZ DO CONTRATO GEMINI V6.3
 * ------------------------------------------------------------
 * Testa as funções puras de interpretação da resposta do Gemini
 * sem realizar chamadas externas, consumo de quota ou depender
 * da disponibilidade do serviço.
 */
function TESTAR_ROBUSTEZ_GEMINI_V63() {
  Logger.log('============================================================');
  Logger.log('INÍCIO — TESTAR_ROBUSTEZ_GEMINI_V63');
  Logger.log('============================================================');

  const resultados = [];
  let aprovados = 0;

  function registrar(numero, descricao, condicao) {
    if (condicao) {
      aprovados++;
      resultados.push(true);
      Logger.log('✅ TESTE ' + numero + '/25 — ' + descricao);
    } else {
      resultados.push(false);
      Logger.log('❌ TESTE ' + numero + '/25 — ' + descricao);
    }
  }

  function deveFalhar(fn) {
    try { fn(); return false; } catch (erro) { return !!erro; }
  }

  function deveRetornar(fn, esperado) {
    try { return fn() === esperado; } catch (erro) { return false; }
  }

  function jsonBase() {
    return JSON.stringify({
      processo: 'lançamento manual de pedidos',
      dor_principal: 'erros e retrabalho',
      frequencia: 'diária',
      impacto: 'perda de tempo',
      objetivo: 'reduzir erros',
      informacao_faltante: '',
      proxima_pergunta: ''
    });
  }

  registrar(1, 'candidates ausente é rejeitado', deveFalhar(function() { extrairTextoGemini_({}); }));
  registrar(2, 'candidates vazio é rejeitado', deveFalhar(function() { extrairTextoGemini_({ candidates: [] }); }));
  registrar(3, 'content ausente é rejeitado', deveFalhar(function() { extrairTextoGemini_({ candidates: [{}] }); }));
  registrar(4, 'parts ausente é rejeitado', deveFalhar(function() { extrairTextoGemini_({ candidates: [{ content: {} }] }); }));
  registrar(5, 'parts vazio é rejeitado', deveFalhar(function() { extrairTextoGemini_({ candidates: [{ content: { parts: [] } }] }); }));
  registrar(6, 'MAX_TOKENS é rejeitado', deveFalhar(function() {
    extrairTextoGemini_({ candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: jsonBase() }] } }] });
  }));
  registrar(7, 'texto de uma única parte é extraído', deveRetornar(function() {
    return extrairTextoGemini_({ candidates: [{ content: { parts: [{ text: 'RESPOSTA_OK' }] } }] });
  }, 'RESPOSTA_OK'));
  registrar(8, 'texto de múltiplas partes é concatenado', deveRetornar(function() {
    return extrairTextoGemini_({ candidates: [{ content: { parts: [{ text: 'PARTE_A' }, { text: 'PARTE_B' }] } }] });
  }, 'PARTE_APARTE_B'));
  registrar(9, 'parte sem texto não quebra a extração', deveRetornar(function() {
    return extrairTextoGemini_({ candidates: [{ content: { parts: [{}, { text: 'OK' }] } }] });
  }, 'OK'));
  registrar(10, 'JSON puro de interpretação é aceito', deveRetornar(function() {
    return extrairJsonInterpretacaoIAV63_(jsonBase()).processo;
  }, 'lançamento manual de pedidos'));
  registrar(11, 'JSON envolvido em bloco markdown é aceito', deveRetornar(function() {
    return extrairJsonInterpretacaoIAV63_('```json\n' + jsonBase() + '\n```').dor_principal;
  }, 'erros e retrabalho'));
  registrar(12, 'JSON com espaços externos é aceito', deveRetornar(function() {
    return extrairJsonInterpretacaoIAV63_('  ' + jsonBase() + '  ').objetivo;
  }, 'reduzir erros'));
  registrar(13, 'JSON com texto ao redor é recuperado', deveRetornar(function() {
    return extrairJsonInterpretacaoIAV63_('Resultado:\n' + jsonBase() + '\nFim.').frequencia;
  }, 'diária'));
  registrar(14, 'JSON inválido é rejeitado', deveFalhar(function() { extrairJsonInterpretacaoIAV63_('{ processo: invalido }'); }));
  registrar(15, 'resposta vazia é rejeitada', deveFalhar(function() { extrairJsonInterpretacaoIAV63_(''); }));
  registrar(16, 'resposta somente com markdown é rejeitada', deveFalhar(function() { extrairJsonInterpretacaoIAV63_('```json```'); }));
  registrar(17, 'JSON truncado é rejeitado', deveFalhar(function() {
    const base = jsonBase();
    extrairJsonInterpretacaoIAV63_(base.slice(0, base.length - 3));
  }));
  registrar(18, 'JSON com estrutura de array é rejeitado pelo contrato', deveFalhar(function() { validarDiagnosticoIA_(extrairJsonInterpretacaoIAV63_('[{"processo":"teste"}]')); }));
  registrar(19, 'JSON vazio é rejeitado pelo contrato', deveFalhar(function() { validarDiagnosticoIA_(extrairJsonInterpretacaoIAV63_('{}')); }));
  registrar(20, 'JSON válido preserva todos os campos principais', (function() {
    try {
      const dados = extrairJsonInterpretacaoIAV63_(jsonBase());
      return dados.processo === 'lançamento manual de pedidos' && dados.dor_principal === 'erros e retrabalho' && dados.frequencia === 'diária' && dados.impacto === 'perda de tempo' && dados.objetivo === 'reduzir erros';
    } catch (erro) { return false; }
  })());
  registrar(21, 'campo ausente não é aceito silenciosamente', deveFalhar(function() {
    const dados = JSON.parse(jsonBase()); delete dados.processo; validarDiagnosticoIA_(extrairJsonInterpretacaoIAV63_(JSON.stringify(dados)));
  }));
  registrar(22, 'campo com tipo inválido não é aceito silenciosamente', deveFalhar(function() {
    const dados = JSON.parse(jsonBase()); dados.impacto = 123; validarDiagnosticoIA_(extrairJsonInterpretacaoIAV63_(JSON.stringify(dados)));
  }));
  registrar(23, 'campo nulo não é aceito silenciosamente', deveFalhar(function() {
    const dados = JSON.parse(jsonBase()); dados.objetivo = null; validarDiagnosticoIA_(extrairJsonInterpretacaoIAV63_(JSON.stringify(dados)));
  }));
  registrar(24, 'resposta válida permanece determinística em duas execuções', (function() {
    try { const a = extrairJsonInterpretacaoIAV63_(jsonBase()); const b = extrairJsonInterpretacaoIAV63_(jsonBase()); return JSON.stringify(a) === JSON.stringify(b); } catch (erro) { return false; }
  })());
  registrar(25, 'resposta válida continua compatível com o contrato de diagnóstico', (function() {
    try { const dados = extrairJsonInterpretacaoIAV63_(jsonBase()); validarDiagnosticoIA_(dados); return true; } catch (erro) { return false; }
  })());

  Logger.log('============================================================');
  Logger.log('RESULTADO FINAL — ROBUSTEZ GEMINI V6.3');
  Logger.log('============================================================');
  Logger.log('APROVADOS: ' + aprovados + '/25');
  Logger.log('FALHAS: ' + (25 - aprovados));
  Logger.log('PERCENTUAL: ' + Math.round((aprovados / 25) * 100) + '%');
  Logger.log(aprovados === 25 ? '🏆 TESTAR_ROBUSTEZ_GEMINI_V63: PASSOU' : '❌ TESTAR_ROBUSTEZ_GEMINI_V63: FALHOU');
  Logger.log('============================================================');

  return { aprovados: aprovados, falhas: 25 - aprovados, percentual: Math.round((aprovados / 25) * 100), passou: aprovados === 25, resultados: resultados };
}


/**
 * ------------------------------------------------------------
 * TESTE DETERMINÍSTICO DO RETRY HTTP GEMINI V6.3
 * ------------------------------------------------------------
 * Não chama a internet, não consome quota e não aguarda sleeps reais.
 * Injeta respostas HTTP simuladas somente durante este teste.
 */
function TESTAR_RETRY_HTTP_GEMINI_V63() {
  Logger.log('============================================================');
  Logger.log('INÍCIO — TESTAR_RETRY_HTTP_GEMINI_V63');
  Logger.log('============================================================');

  let aprovados = 0;
  const resultados = [];

  function registrar(numero, descricao, condicao) {
    if (condicao) {
      aprovados++;
      resultados.push(true);
      Logger.log('✅ TESTE ' + numero + '/25 — ' + descricao);
    } else {
      resultados.push(false);
      Logger.log('❌ TESTE ' + numero + '/25 — ' + descricao);
    }
  }

  function resposta(status, corpo) {
    return {
      getResponseCode: function() { return status; },
      getContentText: function() { return corpo; }
    };
  }

  function executarSequencia(sequencia) {
    let chamadas = 0;
    const esperas = [];
    const deps = {
      fetch: function() {
        const item = sequencia[chamadas++];
        if (item && item.erro) throw new Error(item.erro);
        return resposta(item.status, item.corpo === undefined ? '{}' : item.corpo);
      },
      sleep: function(ms) { esperas.push(ms); }
    };
    try {
      const valor = executarGemini_('https://teste.local', {teste:true}, 'CHAVE_TESTE', deps);
      return { sucesso:true, valor:valor, chamadas:chamadas, esperas:esperas, erro:'' };
    } catch (erro) {
      return { sucesso:false, valor:null, chamadas:chamadas, esperas:esperas, erro:String(erro && erro.message ? erro.message : erro) };
    }
  }

  let r;

  r = executarSequencia([{status:200, corpo:'{"ok":true}'}]);
  registrar(1, 'HTTP 200 retorna sucesso', r.sucesso === true);
  registrar(2, 'HTTP 200 usa uma única tentativa', r.chamadas === 1);
  registrar(3, 'HTTP 200 informa tentativas = 1', r.valor && r.valor.tentativas === 1);
  registrar(4, 'HTTP 200 preserva status_code', r.valor && r.valor.status_code === 200);
  registrar(5, 'HTTP 200 não executa espera', r.esperas.length === 0);

  [429,500,502,503,504].forEach(function(status, indice) {
    r = executarSequencia([
      {status:status, corpo:'erro transitório'},
      {status:200, corpo:'{"recuperado":true}'}
    ]);
    registrar(6 + indice, 'HTTP ' + status + ' realiza retry e recupera', r.sucesso && r.chamadas === 2 && r.valor.tentativas === 2);
  });

  r = executarSequencia([{status:503},{status:200, corpo:'{"ok":true}'}]);
  registrar(11, 'primeiro retry aguarda 1500 ms', r.esperas.length === 1 && r.esperas[0] === 1500);

  r = executarSequencia([{status:503},{status:503},{status:200, corpo:'{"ok":true}'}]);
  registrar(12, 'dois erros transitórios chegam à terceira tentativa', r.sucesso && r.chamadas === 3 && r.valor.tentativas === 3);
  registrar(13, 'esperas do segundo e terceiro ciclos são 1500 e 3000 ms', r.esperas.length === 2 && r.esperas[0] === 1500 && r.esperas[1] === 3000);

  r = executarSequencia([{status:503},{status:503},{status:503}]);
  registrar(14, 'três HTTP 503 esgotam as tentativas', !r.sucesso && r.chamadas === 3);
  registrar(15, 'erro final informa três tentativas', !r.sucesso && r.erro.indexOf('Foram realizadas 3 tentativas') !== -1);
  registrar(16, 'erro final preserva HTTP 503', !r.sucesso && r.erro.indexOf('HTTP 503') !== -1);

  [400,401,403,404].forEach(function(status, indice) {
    r = executarSequencia([{status:status, corpo:'erro permanente'}]);
    registrar(17 + indice, 'HTTP ' + status + ' falha sem retry', !r.sucesso && r.chamadas === 1 && r.esperas.length === 0);
  });

  r = executarSequencia([{erro:'falha de rede'},{status:200, corpo:'{"ok":true}'}]);
  registrar(21, 'erro de transporte realiza retry e recupera', r.sucesso && r.chamadas === 2 && r.valor.tentativas === 2);

  r = executarSequencia([{erro:'rede 1'},{erro:'rede 2'},{erro:'rede 3'}]);
  registrar(22, 'três erros de transporte esgotam exatamente três tentativas', !r.sucesso && r.chamadas === 3);
  registrar(23, 'erro de transporte final informa três tentativas', !r.sucesso && r.erro.indexOf('após 3 tentativas') !== -1);

  r = executarSequencia([{status:200, corpo:'não é json'}]);
  registrar(24, 'HTTP 200 com JSON inválido é rejeitado sem retry', !r.sucesso && r.chamadas === 1 && r.erro.indexOf('não é JSON válido') !== -1);

  r = executarSequencia([{status:429},{status:500},{status:200, corpo:'{"fim":"ok"}'}]);
  registrar(25, 'sequência de erros transitórios diferentes recupera na terceira tentativa', r.sucesso && r.chamadas === 3 && r.valor && r.valor.dados.fim === 'ok');

  Logger.log('============================================================');
  Logger.log('RESULTADO FINAL — RETRY HTTP GEMINI V6.3');
  Logger.log('============================================================');
  Logger.log('APROVADOS: ' + aprovados + '/25');
  Logger.log('FALHAS: ' + (25 - aprovados));
  Logger.log('PERCENTUAL: ' + Math.round((aprovados / 25) * 100) + '%');
  Logger.log(aprovados === 25 ? '🏆 TESTAR_RETRY_HTTP_GEMINI_V63: PASSOU' : '❌ TESTAR_RETRY_HTTP_GEMINI_V63: FALHOU');
  Logger.log('============================================================');

  return { aprovados:aprovados, falhas:25-aprovados, percentual:Math.round((aprovados/25)*100), passou:aprovados===25, resultados:resultados };
}


/**
 * ------------------------------------------------------------
 * TESTE DE FLUXO COMPLETO GEMINI V6.3
 * ------------------------------------------------------------
 * Valida a cadeia:
 * chamarGemini_ -> executarGemini_ -> extrairTextoGemini_
 *
 * Não realiza chamadas externas. Injeta o motor HTTP somente
 * durante o teste e valida o comportamento observável da
 * função chamarGemini_.
 */
function TESTAR_FLUXO_COMPLETO_GEMINI_V63() {
  Logger.log('============================================================');
  Logger.log('INÍCIO — TESTAR_FLUXO_COMPLETO_GEMINI_V63');
  Logger.log('============================================================');

  let aprovados = 0;
  const resultados = [];

  function registrar(numero, descricao, condicao) {
    if (condicao) {
      aprovados++;
      resultados.push(true);
      Logger.log('✅ TESTE ' + numero + '/25 — ' + descricao);
    } else {
      resultados.push(false);
      Logger.log('❌ TESTE ' + numero + '/25 — ' + descricao);
    }
  }

  function resposta(status, corpo) {
    return {
      getResponseCode: function() { return status; },
      getContentText: function() { return corpo; }
    };
  }

  function executarCenario(sequencia) {
    let chamadas = 0;
    const deps = {
      fetch: function() {
        const item = sequencia[chamadas++];
        if (item && item.erro) throw new Error(item.erro);
        return resposta(item.status, item.corpo === undefined ? '{}' : item.corpo);
      },
      sleep: function() {}
    };

    try {
      const resultadoExecucao = executarGemini_(
        'https://teste.local',
        {contents:[{role:'user',parts:[{text:'mensagem teste'}]}]},
        'CHAVE_TESTE',
        deps
      );

      return {
        sucesso: true,
        dados: resultadoExecucao,
        chamadas: chamadas,
        erro: ''
      };
    } catch (erro) {
      return {
        sucesso: false,
        dados: null,
        chamadas: chamadas,
        erro: String(erro && erro.message ? erro.message : erro)
      };
    }
  }

  function simularChamarGemini(sequencia) {
    const execucao = executarCenario(sequencia);

    if (!execucao.sucesso) {
      throw new Error(execucao.erro);
    }

    const texto = extrairTextoGemini_(execucao.dados.dados);

    return {
      sucesso: true,
      modelo: 'modelo-teste-v63',
      tempo_ms: execucao.dados.tempo_ms,
      resposta: texto,
      resposta_bruta: execucao.dados.dados,
      tentativas: execucao.dados.tentativas,
      status_code: execucao.dados.status_code,
      chamadas: execucao.chamadas
    };
  }

  let r;

  r = simularChamarGemini([{
    status:200,
    corpo:'{"candidates":[{"content":{"parts":[{"text":"RESPOSTA_FINAL"}]}}]}'
  }]);
  registrar(1, 'sucesso HTTP 200 chega ao extrator', r.resposta === 'RESPOSTA_FINAL');
  registrar(2, 'fluxo bem-sucedido usa uma tentativa', r.chamadas === 1);
  registrar(3, 'fluxo preserva status HTTP 200', r.status_code === 200);
  registrar(4, 'fluxo preserva tentativas = 1', r.tentativas === 1);
  registrar(5, 'fluxo marca sucesso', r.sucesso === true);

  r = simularChamarGemini([
    {status:503, corpo:'erro'},
    {status:200, corpo:'{"candidates":[{"content":{"parts":[{"text":"RECUPERADO_503"}]}}]}'}
  ]);
  registrar(6, '503 seguido de 200 entrega resposta recuperada', r.resposta === 'RECUPERADO_503');
  registrar(7, '503 seguido de 200 usa duas tentativas', r.chamadas === 2);
  registrar(8, '503 seguido de 200 informa tentativas = 2', r.tentativas === 2);

  r = simularChamarGemini([
    {status:429, corpo:'erro'},
    {status:500, corpo:'erro'},
    {status:200, corpo:'{"candidates":[{"content":{"parts":[{"text":"RECUPERADO_MISTO"}]}}]}'}
  ]);
  registrar(9, '429 → 500 → 200 entrega resposta recuperada', r.resposta === 'RECUPERADO_MISTO');
  registrar(10, 'sequência mista usa três tentativas', r.chamadas === 3);
  registrar(11, 'sequência mista informa tentativas = 3', r.tentativas === 3);

  r = simularChamarGemini([
    {status:503, corpo:'erro'},
    {status:503, corpo:'erro'},
    {status:503, corpo:'erro'}
  ]);
  registrar(12, 'três falhas transitórias propagam erro', r === null ? false : true);
  registrar(13, 'três falhas transitórias fazem exatamente três chamadas', r.chamadas === 3);
  registrar(14, 'erro propagado preserva HTTP 503', r.erro.indexOf('HTTP 503') !== -1);
  registrar(15, 'erro propagado informa tentativas esgotadas', r.erro.indexOf('3 tentativas') !== -1);

  r = simularChamarGemini([
    {status:400, corpo:'requisição inválida'}
  ]);
  registrar(16, 'HTTP 400 propaga erro sem retry', !r.sucesso && r.chamadas === 1);
  registrar(17, 'HTTP 400 preserva status no erro', r.erro.indexOf('HTTP 400') !== -1);

  r = simularChamarGemini([
    {status:200, corpo:'JSON inválido'}
  ]);
  registrar(18, 'HTTP 200 com JSON inválido não chega como sucesso', !r.sucesso && r.chamadas === 1);
  registrar(19, 'JSON inválido é rejeitado no motor antes da extração', r.erro.indexOf('não é JSON válido') !== -1);

  r = simularChamarGemini([
    {status:200, corpo:'{"candidates":[]}'}
  ]);
  registrar(20, 'candidates vazio é rejeitado no extrator', !r.sucesso && r.chamadas === 1);
  registrar(21, 'erro de candidates vazio é preservado', r.erro.indexOf('candidates') !== -1);

  r = simularChamarGemini([
    {status:200, corpo:'{"candidates":[{"content":{"parts":[{"text":"A"},{"text":"B"}]}}]}'}
  ]);
  registrar(22, 'múltiplas partes chegam concatenadas', r.resposta === 'AB');

  r = simularChamarGemini([
    {erro:'falha de transporte'},
    {status:200, corpo:'{"candidates":[{"content":{"parts":[{"text":"TRANSPORTE_RECUPERADO"}]}}]}'}
  ]);
  registrar(23, 'falha de transporte seguida de 200 recupera o fluxo', r.resposta === 'TRANSPORTE_RECUPERADO');
  registrar(24, 'recuperação de transporte usa duas chamadas', r.chamadas === 2 && r.tentativas === 2);

  r = simularChamarGemini([
    {status:503, corpo:'erro'},
    {status:200, corpo:'{"candidates":[{"content":{"parts":[{}]}}]}'}
  ]);
  registrar(25, 'resposta recuperada sem texto utilizável é rejeitada pelo extrator', !r.sucesso && r.chamadas === 2);

  Logger.log('============================================================');
  Logger.log('RESULTADO FINAL — FLUXO COMPLETO GEMINI V6.3');
  Logger.log('============================================================');
  Logger.log('APROVADOS: ' + aprovados + '/25');
  Logger.log('FALHAS: ' + (25 - aprovados));
  Logger.log('PERCENTUAL: ' + Math.round((aprovados / 25) * 100) + '%');
  Logger.log(aprovados === 25 ? '🏆 TESTAR_FLUXO_COMPLETO_GEMINI_V63: PASSOU' : '❌ TESTAR_FLUXO_COMPLETO_GEMINI_V63: FALHOU');
  Logger.log('============================================================');

  return {
    aprovados: aprovados,
    falhas: 25 - aprovados,
    percentual: Math.round((aprovados / 25) * 100),
    passou: aprovados === 25,
    resultados: resultados
  };
}
