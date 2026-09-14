/**
 * ============================================================
 * FEEDS SOLUTIONS — IA SEMÂNTICA V6.3
 * ============================================================
 *
 * Responsabilidade:
 * Transformar linguagem natural do empresário em uma
 * interpretação semântica estruturada.
 *
 * NÃO decide solução.
 * NÃO expõe tecnologia.
 * NÃO trata preço.
 * NÃO altera diagnóstico.
 * NÃO consulta a biblioteca de soluções.
 *
 * Fluxo:
 *
 * mensagem natural
 *      ↓
 * Gemini
 *      ↓
 * JSON estruturado
 *      ↓
 * normalização
 *      ↓
 * validação
 *      ↓
 * segurança
 *      ↓
 * interpretação V6.3
 *
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * CONFIGURAÇÃO
 * ------------------------------------------------------------
 */
const IA_SEMANTICA_V63 = {
  VERSAO: 'V6.3',

  TEMPERATURE: 0,

  CAMPOS_OBRIGATORIOS: [
    'problema',
    'processo',
    'dores',
    'impactos',
    'resultado_desejado',
    'contexto',
    'restricoes',
    'padrao_problema'
  ],

  STATUS_VALIDOS: [
    'CONFIRMADO',
    'INFERIDO',
    'DESCONHECIDO'
  ]
};


/**
 * ------------------------------------------------------------
 * PROMPT DO INTERPRETADOR
 * ------------------------------------------------------------
 */
function construirPromptInterpretacaoIAV63_(
  mensagem
) {

  return `
Você é o módulo de interpretação semântica da Feeds Solutions.

Sua única responsabilidade é compreender o que o empresário
disse e transformar a mensagem em uma estrutura semântica.

NÃO apresente solução.
NÃO recomende tecnologia.
NÃO mencione ferramentas.
NÃO mencione APIs.
NÃO mencione arquitetura.
NÃO mencione banco de dados.
NÃO mencione código.
NÃO mencione prompts.
NÃO trate preço.
NÃO invente informações.

REGRA FUNDAMENTAL:

Se uma informação não estiver presente na mensagem e não puder
ser inferida com segurança, marque o campo como DESCONHECIDO.

Nunca transforme uma hipótese em fato.

STATUS:

CONFIRMADO:
A informação foi explicitamente apresentada pelo empresário.

INFERIDO:
A informação não foi dita literalmente, mas pode ser inferida
com segurança a partir do contexto fornecido.

DESCONHECIDO:
A informação não está disponível.

ESTRUTURA OBRIGATÓRIA:

{
  "problema": "",
  "processo": "",
  "dores": [],
  "impactos": [],
  "resultado_desejado": "",
  "contexto": "",
  "restricoes": [],
  "padrao_problema": "",
  "status": {
    "problema": "CONFIRMADO|INFERIDO|DESCONHECIDO",
    "processo": "CONFIRMADO|INFERIDO|DESCONHECIDO",
    "dores": "CONFIRMADO|INFERIDO|DESCONHECIDO",
    "impactos": "CONFIRMADO|INFERIDO|DESCONHECIDO",
    "resultado_desejado": "CONFIRMADO|INFERIDO|DESCONHECIDO",
    "contexto": "CONFIRMADO|INFERIDO|DESCONHECIDO",
    "restricoes": "CONFIRMADO|INFERIDO|DESCONHECIDO",
    "padrao_problema": "CONFIRMADO|INFERIDO|DESCONHECIDO"
  }
}

REGRAS DOS CAMPOS:

problema:
Descreva o principal problema relatado.

processo:
Descreva como o processo acontece atualmente.

dores:
Liste problemas operacionais explicitamente relatados
ou claramente decorrentes da descrição.

impactos:
Liste consequências explicitamente relatadas
ou claramente decorrentes da situação.

resultado_desejado:
Descreva o que o empresário gostaria que acontecesse
idealmente, somente se isso estiver disponível.

contexto:
Descreva o contexto empresarial relevante.

restricoes:
Liste limitações ou condições explicitamente informadas.

padrao_problema:
Descreva o padrão semântico do problema.
Pode ser INFERIDO quando o padrão não foi literalmente
declarado, mas é claramente identificável.

IMPORTANTE:

Não invente números.
Não invente frequência.
Não invente volume.
Não invente pessoas.
Não invente causas.
Não invente resultados.

Retorne SOMENTE JSON válido.

MENSAGEM DO EMPRESÁRIO:

${String(mensagem || '')}
`;
}


/**
 * ------------------------------------------------------------
 * EXTRAÇÃO SEGURA DO JSON
 * ------------------------------------------------------------
 */
function extrairJsonInterpretacaoIAV63_(
  resposta
) {

  if (!resposta) {
    throw new Error(
      'Resposta vazia da IA semântica.'
    );
  }

  let texto =
    typeof resposta === 'string'
      ? resposta
      : JSON.stringify(resposta);

  texto = texto.trim();

  if (
    texto.indexOf('```json') === 0
  ) {
    texto = texto
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  } else if (
    texto.indexOf('```') === 0
  ) {
    texto = texto
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }

  try {
    return JSON.parse(texto);
  } catch (erro) {
    const inicio =
      texto.indexOf('{');

    const fim =
      texto.lastIndexOf('}');

    if (
      inicio !== -1 &&
      fim !== -1 &&
      fim > inicio
    ) {

      const trecho =
        texto.substring(
          inicio,
          fim + 1
        );

      try {
        return JSON.parse(trecho);
      } catch (erroInterno) {
        throw new Error(
          'JSON retornado pela IA semântica é inválido.'
        );
      }
    }

    throw new Error(
      'IA semântica não retornou JSON válido.'
    );
  }
}


/**
 * ------------------------------------------------------------
 * CHAMADA AO GEMINI
 * ------------------------------------------------------------
 */
function chamarGeminiInterpretacaoV63_(
  mensagem
) {

  if (
    typeof construirPromptInterpretacaoIAV63_ !==
    'function'
  ) {
    throw new Error(
      'Construtor do prompt semântico não encontrado.'
    );
  }

  const prompt =
    construirPromptInterpretacaoIAV63_(
      mensagem
    );

  let resposta;

  /*
   * ----------------------------------------------------------
   * REUTILIZAÇÃO DO MOTOR GEMINI EXISTENTE
   * ----------------------------------------------------------
   *
   * O IA.gs já possui:
   *
   * chamarGemini_(texto)
   *
   * Essa função retorna:
   *
   * {
   *   sucesso: true,
   *   modelo: ...,
   *   tempo_ms: ...,
   *   resposta: "texto produzido pelo Gemini",
   *   resposta_bruta: {...}
   * }
   *
   * Portanto, a camada semântica deve consumir
   * resposta.resposta.
   */

  if (
    typeof chamarGeminiDiagnostico_ ===
    'function'
  ) {

    resposta =
      chamarGeminiDiagnostico_(
        prompt
      );

  } else if (
    typeof chamarGemini_ ===
    'function'
  ) {

    resposta =
      chamarGemini_(
        prompt
      );

  } else {

    throw new Error(
      'Nenhuma função Gemini compatível encontrada.'
    );
  }


  /*
   * ----------------------------------------------------------
   * CAMINHO PADRÃO DO PROJETO
   * ----------------------------------------------------------
   */

  if (
    resposta &&
    resposta.resposta !== undefined &&
    resposta.resposta !== null
  ) {

    return String(
      resposta.resposta
    );
  }


  /*
   * ----------------------------------------------------------
   * COMPATIBILIDADE COM OUTROS FORMATOS
   * ----------------------------------------------------------
   *
   * Mantemos estes caminhos apenas como proteção.
   * O caminho oficial do Feeds é resposta.resposta.
   */

  if (
    resposta &&
    resposta.candidates &&
    Array.isArray(
      resposta.candidates
    ) &&
    resposta.candidates.length > 0
  ) {

    const candidato =
      resposta.candidates[0];

    if (
      candidato &&
      candidato.content &&
      Array.isArray(
        candidato.content.parts
      )
    ) {

      const textos = [];

      candidato.content.parts
        .forEach(function(part) {

          if (
            part &&
            part.text !== undefined &&
            part.text !== null
          ) {

            textos.push(
              String(part.text)
            );

          }

        });

      if (
        textos.length > 0
      ) {

        return textos.join('\n');
      }
    }
  }


  /*
   * ----------------------------------------------------------
   * FORMATO DIRETO
   * ----------------------------------------------------------
   */

  if (
    resposta &&
    resposta.text !== undefined &&
    resposta.text !== null
  ) {

    return String(
      resposta.text
    );
  }


  /*
   * ----------------------------------------------------------
   * NÃO ADIVINHAR
   * ----------------------------------------------------------
   */

  throw new Error(
    'Resposta Gemini sem conteúdo textual utilizável para interpretação semântica.'
  );
}

/**
 * ------------------------------------------------------------
 * INTERPRETAÇÃO PRINCIPAL
 * ------------------------------------------------------------
 */
function interpretarMensagemSemanticaV63_(
  mensagem
) {

  const texto =
    String(mensagem || '').trim();

  if (!texto) {
    throw new Error(
      'Mensagem obrigatória para interpretação semântica.'
    );
  }

  /*
   * ----------------------------------------------------------
   * 1. GEMINI
   * ----------------------------------------------------------
   */

  const respostaIA =
    chamarGeminiInterpretacaoV63_(
      texto
    );


  /*
   * ----------------------------------------------------------
   * 2. EXTRAÇÃO DO JSON
   * ----------------------------------------------------------
   */

  const objeto =
    extrairJsonInterpretacaoIAV63_(
      respostaIA
    );


  /*
   * ----------------------------------------------------------
   * 3. CONSTRUÇÃO DO CONTRATO V6.3
   * ----------------------------------------------------------
   */

  if (
    typeof criarInterpretacaoSemanticaV63_ !==
    'function'
  ) {
    throw new Error(
      'Motor semântico V6.3 não encontrado.'
    );
  }

  const interpretacao =
    criarInterpretacaoSemanticaV63_(
      objeto
    );


  /*
   * ----------------------------------------------------------
   * 4. VALIDAÇÃO
   * ----------------------------------------------------------
   *
   * O validador estrutural V6.3 atualmente retorna boolean.
   *
   * Portanto:
   *
   * true  = válido
   * false = inválido
   *
   * Também aceitamos { valido: true } para manter
   * compatibilidade caso o contrato seja ampliado futuramente.
   */

  if (
    typeof validarInterpretacaoSemanticaV63_ !==
    'function'
  ) {
    throw new Error(
      'Validador semântico V6.3 não encontrado.'
    );
  }

  const validacao =
    validarInterpretacaoSemanticaV63_(
      interpretacao
    );

  const interpretacaoValida =
    validacao === true ||
    (
      validacao &&
      validacao.valido === true
    );

  if (!interpretacaoValida) {

    throw new Error(
      'Interpretação semântica rejeitada: ' +
      JSON.stringify(validacao)
    );
  }


  /*
   * ----------------------------------------------------------
   * 5. SEGURANÇA
   * ----------------------------------------------------------
   */

  if (
    typeof verificarSegurancaInterpretacaoV63_ !==
    'function'
  ) {
    throw new Error(
      'Verificador de segurança semântico não encontrado.'
    );
  }

  const segura =
    verificarSegurancaInterpretacaoV63_(
      interpretacao
    );

  /*
   * O verificador estrutural atual também trabalha
   * com boolean.
   */
  const interpretacaoSegura =
    segura === true ||
    (
      segura &&
      segura.valido === true
    );

  if (!interpretacaoSegura) {

    throw new Error(
      'Interpretação semântica rejeitada pelo filtro de segurança.'
    );
  }


  /*
   * ----------------------------------------------------------
   * 6. RETORNO
   * ----------------------------------------------------------
   */

  return interpretacao;
}


/**
 * ------------------------------------------------------------
 * TESTE REAL — IA SEMÂNTICA V6.3
 * ------------------------------------------------------------
 */
function TESTAR_IA_SEMANTICA_REAL_V63() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'TESTAR_IA_SEMANTICA_REAL_V63'
  );

  let aprovados = 0;
  let falhas = 0;
  let bloqueados = 0;

  function teste(
    numero,
    descricao,
    condicao
  ) {

    if (condicao) {

      aprovados++;

      Logger.log(
        '✅ TESTE ' +
        numero +
        ' — ' +
        descricao
      );

    } else {

      falhas++;

      Logger.log(
        '❌ TESTE ' +
        numero +
        ' — ' +
        descricao
      );
    }
  }

  function testeBloqueado(
    numero,
    descricao
  ) {

    bloqueados++;

    Logger.log(
      '⏸️ TESTE ' +
      numero +
      ' — ' +
      descricao +
      ' — BLOQUEADO POR INDISPONIBILIDADE DO GEMINI'
    );
  }

  function ehIndisponibilidadeGemini(
    erro
  ) {

    if (!erro) {
      return false;
    }

    const mensagem =
      String(
        erro.message ||
        erro ||
        ''
      ).toLowerCase();

    return (
      mensagem.indexOf('503') !== -1 ||
      mensagem.indexOf('unavailable') !== -1 ||
      mensagem.indexOf('indispon') !== -1 ||
      mensagem.indexOf('high demand') !== -1
    );
  }


  /*
   * ----------------------------------------------------------
   * CENÁRIO 1
   * ----------------------------------------------------------
   */

  const mensagem1 =
    'Minha equipe recebe os pedidos pelo WhatsApp, ' +
    'depois precisa digitar tudo manualmente em uma planilha. ' +
    'Como são muitos pedidos, sempre acabam errando alguma ' +
    'coisa e depois precisam voltar para corrigir. ' +
    'Gostaria de reduzir esses erros e o retrabalho.';

  let interpretacao1 = null;
  let indisponibilidade1 = false;

  try {

    interpretacao1 =
      interpretarMensagemSemanticaV63_(
        mensagem1
      );

  } catch (erro) {

    indisponibilidade1 =
      ehIndisponibilidadeGemini(
        erro
      );

    Logger.log(
      'ERRO CENÁRIO 1: ' +
      erro.message
    );
  }


  /*
   * ----------------------------------------------------------
   * TESTES 1 A 20
   * ----------------------------------------------------------
   */

  if (indisponibilidade1) {

    for (
      let numero = 1;
      numero <= 20;
      numero++
    ) {

      testeBloqueado(
        numero,
        'Cenário 1 não executado'
      );
    }

  } else {

    teste(
      1,
      'IA retornou interpretação',
      !!interpretacao1
    );

    teste(
      2,
      'Interpretação possui versão',
      !!(
        interpretacao1 &&
        interpretacao1.versao === 'V6.3'
      )
    );

    teste(
      3,
      'Problema foi identificado',
      !!(
        interpretacao1 &&
        interpretacao1.problema
      )
    );

    teste(
      4,
      'Processo foi identificado',
      !!(
        interpretacao1 &&
        interpretacao1.processo
      )
    );

    teste(
      5,
      'Dores foram estruturadas',
      !!(
        interpretacao1 &&
        Array.isArray(
          interpretacao1.dores
        )
      )
    );

    teste(
      6,
      'Impactos foram estruturados',
      !!(
        interpretacao1 &&
        Array.isArray(
          interpretacao1.impactos
        )
      )
    );

    teste(
      7,
      'Resultado desejado foi identificado',
      !!(
        interpretacao1 &&
        interpretacao1.resultado_desejado
      )
    );

    teste(
      8,
      'Contexto foi estruturado',
      !!(
        interpretacao1 &&
        interpretacao1.contexto
      )
    );

    teste(
      9,
      'Restrições foram estruturadas',
      !!(
        interpretacao1 &&
        Array.isArray(
          interpretacao1.restricoes
        )
      )
    );

    teste(
      10,
      'Padrão do problema foi identificado',
      !!(
        interpretacao1 &&
        interpretacao1.padrao_problema
      )
    );

    teste(
      11,
      'Status possui estrutura',
      !!(
        interpretacao1 &&
        interpretacao1.status &&
        typeof interpretacao1.status ===
          'object'
      )
    );

    teste(
      12,
      'Problema possui status válido',
      !!(
        interpretacao1 &&
        interpretacao1.status &&
        IA_SEMANTICA_V63.STATUS_VALIDOS
          .indexOf(
            interpretacao1.status.problema
          ) !== -1
      )
    );

    teste(
      13,
      'Processo possui status válido',
      !!(
        interpretacao1 &&
        interpretacao1.status &&
        IA_SEMANTICA_V63.STATUS_VALIDOS
          .indexOf(
            interpretacao1.status.processo
          ) !== -1
      )
    );

    let validacao1 = null;

    try {

      validacao1 =
        validarInterpretacaoSemanticaV63_(
          interpretacao1
        );

    } catch (erro) {

      Logger.log(
        'ERRO VALIDAÇÃO: ' +
        erro.message
      );
    }

    teste(
      14,
      'Interpretação real é válida',
      !!(
        validacao1 === true ||
        (
          validacao1 &&
          validacao1.valido === true
        )
      )
    );

    let reconhecimento1 = null;

    try {

      reconhecimento1 =
        prepararParaReconhecimentoV63_(
          interpretacao1
        );

    } catch (erro) {

      Logger.log(
        'ERRO RECONHECIMENTO: ' +
        erro.message
      );
    }

    teste(
      15,
      'Interpretação pode ser preparada para reconhecimento',
      !!reconhecimento1
    );

    let segura1 = false;

    try {

      segura1 =
        verificarSegurancaInterpretacaoV63_(
          interpretacao1
        );

    } catch (erro) {

      Logger.log(
        'ERRO SEGURANÇA: ' +
        erro.message
      );
    }

    teste(
      16,
      'Interpretação real passa no filtro de segurança',
      segura1 === true
    );

    teste(
      17,
      'A interpretação não cria tecnologia',
      !(
        JSON.stringify(
          interpretacao1 || {}
        )
          .toLowerCase()
          .match(
            /api|endpoint|token|apikey|arquitetura|código fonte|database|banco de dados/
          )
      )
    );

    teste(
      18,
      'Interpretação possui estrutura objeto',
      !!(
        interpretacao1 &&
        typeof interpretacao1 ===
          'object'
      )
    );

    teste(
      19,
      'Dores são array',
      !!(
        interpretacao1 &&
        Array.isArray(
          interpretacao1.dores
        )
      )
    );

    teste(
      20,
      'Impactos são array',
      !!(
        interpretacao1 &&
        Array.isArray(
          interpretacao1.impactos
        )
      )
    );
  }


  /*
   * ----------------------------------------------------------
   * CENÁRIO 2 — PARÁFRASE
   * ----------------------------------------------------------
   */

  const mensagem2 =
    'Os colaboradores fazem o lançamento manual ' +
    'das solicitações e frequentemente precisam refazer ' +
    'o trabalho por causa de erros de digitação. ' +
    'Queremos diminuir esse retrabalho.';

  let interpretacao2 = null;
  let indisponibilidade2 = false;

  try {

    interpretacao2 =
      interpretarMensagemSemanticaV63_(
        mensagem2
      );

  } catch (erro) {

    indisponibilidade2 =
      ehIndisponibilidadeGemini(
        erro
      );

    Logger.log(
      'ERRO CENÁRIO 2: ' +
      erro.message
    );
  }


  /*
   * TESTES 21 E 22
   */

  if (indisponibilidade2) {

    testeBloqueado(
      21,
      'Paráfrase também gera interpretação'
    );

    testeBloqueado(
      22,
      'Paráfrase mantém padrão semântico'
    );

  } else {

    teste(
      21,
      'Paráfrase também gera interpretação',
      !!interpretacao2
    );

    teste(
      22,
      'Paráfrase mantém padrão semântico',
      !!(
        interpretacao2 &&
        interpretacao2.padrao_problema
      )
    );
  }


  /*
   * ----------------------------------------------------------
   * CENÁRIO 3 — PROBLEMA DIFERENTE
   * ----------------------------------------------------------
   */

  const mensagem3 =
    'Precisamos controlar melhor a manutenção ' +
    'dos veículos da empresa porque estamos perdendo ' +
    'os prazos das revisões.';

  let interpretacao3 = null;
  let indisponibilidade3 = false;

  try {

    interpretacao3 =
      interpretarMensagemSemanticaV63_(
        mensagem3
      );

  } catch (erro) {

    indisponibilidade3 =
      ehIndisponibilidadeGemini(
        erro
      );

    Logger.log(
      'ERRO CENÁRIO 3: ' +
      erro.message
    );
  }


  /*
   * TESTES 23 A 25
   */

  if (indisponibilidade3) {

    testeBloqueado(
      23,
      'Problema diferente também é interpretado'
    );

    testeBloqueado(
      24,
      'Problema diferente possui padrão próprio'
    );

    testeBloqueado(
      25,
      'Problema diferente não é confundido com pedidos'
    );

  } else {

    teste(
      23,
      'Problema diferente também é interpretado',
      !!interpretacao3
    );

    teste(
      24,
      'Problema diferente possui padrão próprio',
      !!(
        interpretacao3 &&
        interpretacao3.padrao_problema
      )
    );

    teste(
      25,
      'Problema diferente não é confundido com pedidos',
      !!(
        interpretacao3 &&
        String(
          interpretacao3.padrao_problema
        )
          .toLowerCase()
          .indexOf('pedido') === -1
      )
    );
  }


  /*
   * ----------------------------------------------------------
   * RESULTADO
   * ----------------------------------------------------------
   */

  const executados =
    aprovados +
    falhas;

  const percentual =
    executados > 0
      ? Math.round(
          (
            aprovados /
            executados
          ) * 100
        )
      : 0;

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'APROVADOS: ' +
    aprovados +
    '/' +
    executados
  );

  Logger.log(
    'FALHAS FUNCIONAIS: ' +
    falhas
  );

  Logger.log(
    'BLOQUEADOS POR GEMINI: ' +
    bloqueados
  );

  Logger.log(
    'PERCENTUAL FUNCIONAL: ' +
    percentual +
    '%'
  );

  Logger.log(
    'TESTES TOTAIS: ' +
    (
      executados +
      bloqueados
    ) +
    '/25'
  );


  /*
   * ----------------------------------------------------------
   * APROVAÇÃO
   * ----------------------------------------------------------
   *
   * Só aprova a IA REAL quando:
   *
   * 25/25 executados
   * 0 falhas
   * 100%
   *
   * Se houver indisponibilidade externa:
   *
   * NÃO É FALHA FUNCIONAL
   * MAS TAMBÉM NÃO É APROVAÇÃO FINAL
   * ----------------------------------------------------------
   */

  if (
    executados === 25 &&
    falhas === 0 &&
    bloqueados === 0 &&
    percentual === 100
  ) {

    Logger.log(
      '🏆 TESTAR_IA_SEMANTICA_REAL_V63: PASSOU'
    );

    Logger.log(
      '🏆 IA SEMÂNTICA REAL V6.3: 100%'
    );

  } else if (
    falhas === 0 &&
    bloqueados > 0
  ) {

    Logger.log(
      '⚠️ TESTAR_IA_SEMANTICA_REAL_V63: BLOQUEADO PARCIALMENTE'
    );

    Logger.log(
      '⚠️ NÃO HOUVE FALHA FUNCIONAL NOS TESTES EXECUTADOS.'
    );

    Logger.log(
      '⚠️ A APROVAÇÃO FINAL AGUARDA A EXECUÇÃO DOS ' +
      bloqueados +
      ' TESTES BLOQUEADOS.'
    );

  } else {

    Logger.log(
      '❌ TESTAR_IA_SEMANTICA_REAL_V63: FALHOU'
    );

    Logger.log(
      '❌ EXISTEM FALHAS FUNCIONAIS A INVESTIGAR.'
    );
  }
}