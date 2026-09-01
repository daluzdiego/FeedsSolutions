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

      Utilities.sleep(
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
        UrlFetchApp.fetch(
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