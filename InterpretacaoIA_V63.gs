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

============================================================
REGRA FUNDAMENTAL
============================================================

Se uma informação não estiver presente na mensagem e não puder
ser inferida com segurança, marque o campo como DESCONHECIDO.

Nunca transforme uma hipótese em fato.

Nunca invente:

- processo;
- frequência;
- volume;
- quantidade;
- tempo;
- custo;
- resultado desejado;
- contexto;
- restrição;
- impacto mensurável.

============================================================
STATUS
============================================================

CONFIRMADO:

A informação foi explicitamente apresentada pelo empresário.

INFERIDO:

A informação não foi dita literalmente, mas pode ser inferida
com segurança a partir do contexto fornecido.

DESCONHECIDO:

A informação não está disponível ou não possui evidência
suficiente para uma interpretação segura.

============================================================
ESTRUTURA OBRIGATÓRIA
============================================================

{
  "problema": "",
  "processo": "",
  "dores": [],
  "impactos": [],
  "resultado_desejado": "",
  "contexto": "",
  "restricoes": [],
  "padrao_problema": "",
  "lacunas": [],
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

============================================================
REGRAS DOS CAMPOS
============================================================

problema:

Descreva o principal problema relatado pelo empresário.

Não transforme uma hipótese em fato.

------------------------------------------------------------

processo:

Descreva como o processo acontece atualmente.

Se o processo não estiver disponível na mensagem, use:

""

e:

"status.processo": "DESCONHECIDO"

------------------------------------------------------------

dores:

Liste problemas operacionais explicitamente relatados ou
claramente decorrentes da descrição.

Não invente dores que não estejam sustentadas pela mensagem.

------------------------------------------------------------

impactos:

Liste somente consequências sustentadas pela mensagem.

IMPORTANTE:

Um impacto somente pode receber status CONFIRMADO quando
existir evidência concreta da consequência na mensagem.

Exemplos de evidência concreta:

- quantidade;
- número de erros;
- tempo;
- horas;
- minutos;
- custo;
- dinheiro;
- prejuízo;
- perda;
- atraso;
- volume ou frequência somente quando também estiverem ligados a uma consequência explícita;
- volume ou frequência isolados NÃO são impacto;
- retrabalho quantificado;
- paralisação explicitamente informada;
- interrupção explicitamente informada.

Exemplo:

"Perdemos 3 horas por dia com isso."

Nesse caso:

"impactos" pode conter a consequência correspondente.

E:

"status.impactos": "CONFIRMADO"

Porém:

"Está atrapalhando a equipe."

é uma consequência vaga.

Nesse caso:

"status.impactos": "INFERIDO"

Nunca transforme uma consequência vaga em impacto CONFIRMADO.

Nunca invente uma quantidade para tornar um impacto confirmado.

------------------------------------------------------------

resultado_desejado:

Descreva o que o empresário gostaria que acontecesse
idealmente, somente se isso estiver disponível.

Se não estiver disponível:

""

e:

"status.resultado_desejado": "DESCONHECIDO"

------------------------------------------------------------

contexto:

Descreva o contexto empresarial relevante somente quando
houver informação suficiente.

Caso contrário:

""

e:

"status.contexto": "DESCONHECIDO"

------------------------------------------------------------

restricoes:

Liste limitações ou condições explicitamente informadas.

Não invente restrições.

------------------------------------------------------------

padrao_problema:

Descreva o padrão semântico do problema.

Pode ser INFERIDO quando o padrão não foi literalmente
declarado, mas é claramente identificável.

Nunca utilize o padrão inferido para inventar informações
sobre processo, impacto, contexto ou resultado desejado.

============================================================
LACUNAS
============================================================

O campo "lacunas" deve listar os campos relevantes que ainda
não possuem informação suficiente para uma interpretação segura.

Use somente estes nomes:

"problema"
"processo"
"dores"
"impactos"
"resultado_desejado"
"contexto"
"restricoes"
"padrao_problema"

Se um campo estiver ausente, insuficiente ou DESCONHECIDO,
registre o nome desse campo em "lacunas".

Não invente informações para preencher uma lacuna.

Exemplo:

Mensagem:

"Está dando problema no sistema e está atrapalhando a equipe."

Uma interpretação segura pode identificar:

- problema;
- dor;
- uma consequência vaga;

mas não possui informação suficiente sobre:

- processo;
- resultado desejado;
- contexto;
- restrições.

Portanto esses campos devem permanecer desconhecidos e
devem ser registrados em "lacunas".

============================================================
REGRAS DE SEGURANÇA
============================================================

Nunca invente números.

Nunca invente frequência.

Nunca invente volume.

Nunca invente pessoas.

Nunca invente causas.

Nunca invente resultados.

Nunca transforme inferência em confirmação.

Nunca transforme consequência vaga em impacto confirmado.

Nunca preencha uma lacuna com informação inventada.

============================================================

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
 * PROTEÇÃO DETERMINÍSTICA DE IMPACTO
 * ------------------------------------------------------------
 *
 * O Gemini não deve conseguir transformar uma consequência
 * vaga em impacto CONFIRMADO.
 *
 * Exemplos:
 *
 * "Está atrapalhando a equipe."
 * → INFERIDO
 *
 * "Perdemos 3 horas por dia."
 * → CONFIRMADO
 *
 * A função não cria impacto.
 * Apenas impede confirmação sem evidência mínima.
 * ------------------------------------------------------------
 */
function normalizarImpactoSemanticoV63_(
  dados,
  mensagem
) {

  if (
    !dados ||
    typeof dados !== 'object'
  ) {
    return dados;
  }

  if (
    !dados.status ||
    typeof dados.status !== 'object'
  ) {
    dados.status = {};
  }

  const statusImpacto =
    String(
      dados.status.impactos || ''
    )
      .trim()
      .toUpperCase();

  if (
    statusImpacto !== 'CONFIRMADO'
  ) {
    return dados;
  }

  const texto =
    String(
      mensagem || ''
    )
      .toLowerCase();

  /*
   * Evidência quantitativa só conta quando o número está
   * associado a uma consequência mensurável ou financeira.
   * "120 pedidos por dia" é volume, não impacto.
   */
  const possuiNumeroDeImpacto =
    /\\d+[^.?!]{0,40}(hora|horas|minuto|minutos|dia|dias|semana|semanas|mês|meses|r\\$|reais|prejuízo|prejuizo|custo|custos|perda|perdas|atraso|atrasos|gasto|gastos|paralisação|paralisacao|interrupção|interrupcao)/.test(texto) ||
    /(hora|horas|minuto|minutos|dia|dias|semana|semanas|mês|meses|r\\$|reais)[^.?!]{0,40}\\d+/.test(texto);

  /*
   * Consequências explicitamente relatadas.
   * Não incluímos termos como "erro", "pedido", "retrabalho"
   * ou "volume" isoladamente, pois eles podem ser dores/processo,
   * e não necessariamente impactos.
   */
  const termosDeImpactoExplicito = [
    'perdemos',
    'perdeu',
    'perder',
    'perda',
    'prejuízo',
    'prejuizo',
    'custo',
    'custos',
    'gasto',
    'gastos',
    'gasta',
    'atraso',
    'atrasos',
    'paralisação',
    'paralisacao',
    'interrupção',
    'interrupcao',
    'horas por',
    'minutos por',
    'dias por',
    'semanas por',
    'meses por'
  ];

  const possuiImpactoExplicito =
    termosDeImpactoExplicito.some(
      function(termo) {
        return texto.indexOf(termo) !== -1;
      }
    );

  if (
    !possuiNumeroDeImpacto &&
    !possuiImpactoExplicito
  ) {
    dados.status.impactos =
      'INFERIDO';
  }

  return dados;
}


/**
 * ------------------------------------------------------------
/**
 * ------------------------------------------------------------
 * PRESERVAÇÃO DETERMINÍSTICA DE IMPACTO EXPLÍCITO
 * ------------------------------------------------------------
 */
function preservarImpactoExplicitoV63_(
  dados,
  mensagem
) {

  if (
    !dados ||
    typeof dados !== 'object'
  ) {
    return dados;
  }

  if (!Array.isArray(dados.impactos)) {
    dados.impactos = [];
  }

  if (dados.impactos.length > 0) {
    return dados;
  }

  const texto =
    String(mensagem || '')
      .trim()
      .toLowerCase();

  if (!texto) {
    return dados;
  }

  if (
    /\b(perdemos|perde|perder|gasta|gastamos|gastar)\b[^.?!]{0,80}\btempo\b/.test(texto) ||
    /\bperda\s+de\s+tempo\b/.test(texto)
  ) {

    dados.impactos.push(
      'Perda de tempo no processo.'
    );

    if (
      !dados.status ||
      typeof dados.status !== 'object'
    ) {
      dados.status = {};
    }

    dados.status.impactos =
      'INFERIDO';
  }

  return dados;
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
   * 3. PROTEÇÃO DETERMINÍSTICA DE IMPACTO
   * ----------------------------------------------------------
   *
   * O Gemini pode classificar incorretamente uma consequência
   * vaga como CONFIRMADO.
   *
   * A regra abaixo corrige isso antes da criação do contrato.
   */

  normalizarImpactoSemanticoV63_(
    objeto,
    texto
  );

  preservarImpactoExplicitoV63_(
    objeto,
    texto
  );


  /*
   * ----------------------------------------------------------
   * 4. CONSTRUÇÃO DO CONTRATO V6.3
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
   * 4.1 — PRESERVAÇÃO DETERMINÍSTICA DE LACUNAS
   * ----------------------------------------------------------
   */

  if (
    interpretacao &&
    typeof interpretacao === 'object'
  ) {

    if (!Array.isArray(interpretacao.lacunas)) {
      interpretacao.lacunas = [];
    }

    const camposLacunas = [
      'problema',
      'processo',
      'dores',
      'impactos',
      'resultado_desejado',
      'contexto',
      'restricoes',
      'padrao_problema'
    ];

    camposLacunas.forEach(function(campo) {

      const valor = interpretacao[campo];
      const status =
        interpretacao.status &&
        interpretacao.status[campo];

      const vazio =
        Array.isArray(valor)
          ? valor.length === 0
          : !String(valor || '').trim();

      const desconhecido =
        String(status || '').trim().toUpperCase() ===
        'DESCONHECIDO';

      if (vazio || desconhecido) {

        if (interpretacao.lacunas.indexOf(campo) === -1) {
          interpretacao.lacunas.push(campo);
        }

      }

    });

    interpretacao.lacunas =
      normalizarArrayInterpretacaoV63_(
        interpretacao.lacunas
      );

  }



  /*
   * ----------------------------------------------------------
   * 4.2 — NORMALIZAÇÃO FINAL DE STATUS
   * ----------------------------------------------------------
   *
   * O Gemini pode retornar um campo vazio com status
   * CONFIRMADO ou INFERIDO. Isso viola o contrato semântico:
   * status não pode afirmar conhecimento onde não existe valor.
   *
   * A correção é determinística e não inventa informação:
   * campo vazio → DESCONHECIDO + lacuna.
   * ----------------------------------------------------------
   */

  if (
    interpretacao &&
    typeof interpretacao === 'object'
  ) {

    if (
      !interpretacao.status ||
      typeof interpretacao.status !== 'object'
    ) {
      interpretacao.status = {};
    }

    if (!Array.isArray(interpretacao.lacunas)) {
      interpretacao.lacunas = [];
    }

    const camposStatus = [
      'problema',
      'processo',
      'dores',
      'impactos',
      'resultado_desejado',
      'contexto',
      'restricoes',
      'padrao_problema'
    ];

    camposStatus.forEach(function(campo) {

      const valor = interpretacao[campo];

      const vazio =
        Array.isArray(valor)
          ? valor.length === 0
          : !String(valor || '').trim();

      const statusAtual =
        String(
          interpretacao.status[campo] || ''
        )
          .trim()
          .toUpperCase();

      if (vazio) {

        interpretacao.status[campo] =
          'DESCONHECIDO';

        if (
          interpretacao.lacunas.indexOf(campo) === -1
        ) {
          interpretacao.lacunas.push(campo);
        }

      } else if (
        statusAtual === 'DESCONHECIDO' &&
        interpretacao.lacunas.indexOf(campo) === -1
      ) {

        interpretacao.lacunas.push(campo);
      }

    });

    interpretacao.lacunas =
      normalizarArrayInterpretacaoV63_(
        interpretacao.lacunas
      );

  }


  /*
   * ----------------------------------------------------------
   * 5. VALIDAÇÃO
   * ----------------------------------------------------------
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
   * 6. SEGURANÇA
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
   * 7. RETORNO
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
      'Contexto não foi inventado quando a mensagem não o sustenta',
      !!(
        interpretacao1 &&
        !String(interpretacao1.contexto || '').trim() &&
        interpretacao1.status &&
        interpretacao1.status.contexto === 'DESCONHECIDO' &&
        Array.isArray(interpretacao1.lacunas) &&
        interpretacao1.lacunas.indexOf('contexto') !== -1
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


/**
 * ============================================================
 * TESTE DE GUARDA DE IMPACTO SEMÂNTICO V6.3
 * ============================================================
 *
 * Garante que uma dor/processo não seja promovido
 * deterministicamente a impacto CONFIRMADO apenas
 * por conter palavras como "erro" ou "retrabalho".
 * ============================================================
 */
/**
 * ============================================================
 * TESTE ADVERSARIAL — INFORMAÇÃO INCOMPLETA V6.3
 * ============================================================
 */
function TESTAR_INFORMACAO_INCOMPLETA_SEMANTICA_V63() {

  const mensagem =
    'Meu sistema está dando problema e isso está atrapalhando a equipe.';

  let interpretacao = null;
  let erro = null;

  try {
    interpretacao =
      interpretarMensagemSemanticaV63_(mensagem);
  } catch (e) {
    erro = e;
  }

  let aprovados = 0;
  const total = 12;

  function teste(numero, descricao, condicao) {
    if (condicao) {
      aprovados++;
      Logger.log('✅ TESTE ' + numero + ' — ' + descricao);
    } else {
      Logger.log('❌ TESTE ' + numero + ' — ' + descricao);
    }
  }

  teste(1, 'interpretação foi produzida', !!interpretacao && !erro);

  teste(
    2,
    'problema foi identificado',
    !!(
      interpretacao &&
      interpretacao.problema &&
      interpretacao.status &&
      interpretacao.status.problema !== 'DESCONHECIDO'
    )
  );

  teste(
    3,
    'processo não foi inventado',
    !!(
      interpretacao &&
      !String(interpretacao.processo || '').trim() &&
      interpretacao.status.processo === 'DESCONHECIDO'
    )
  );

  teste(
    4,
    'resultado desejado não foi inventado',
    !!(
      interpretacao &&
      !String(interpretacao.resultado_desejado || '').trim() &&
      interpretacao.status.resultado_desejado === 'DESCONHECIDO'
    )
  );

  teste(
    5,
    'contexto não foi inventado',
    !!(
      interpretacao &&
      !String(interpretacao.contexto || '').trim() &&
      interpretacao.status.contexto === 'DESCONHECIDO'
    )
  );

  teste(
    6,
    'restrições não foram inventadas',
    !!(
      interpretacao &&
      Array.isArray(interpretacao.restricoes) &&
      interpretacao.restricoes.length === 0 &&
      interpretacao.status.restricoes === 'DESCONHECIDO'
    )
  );

  teste(
    7,
    'impacto não foi promovido a confirmado',
    !!(
      interpretacao &&
      interpretacao.status.impactos !== 'CONFIRMADO'
    )
  );

  teste(
    8,
    'impacto vago permanece inferido ou desconhecido',
    !!(
      interpretacao &&
      (
        interpretacao.status.impactos === 'INFERIDO' ||
        interpretacao.status.impactos === 'DESCONHECIDO'
      )
    )
  );

  teste(
    9,
    'lacunas contém processo',
    !!(
      interpretacao &&
      Array.isArray(interpretacao.lacunas) &&
      interpretacao.lacunas.indexOf('processo') !== -1
    )
  );

  teste(
    10,
    'lacunas contém resultado desejado',
    !!(
      interpretacao &&
      Array.isArray(interpretacao.lacunas) &&
      interpretacao.lacunas.indexOf('resultado_desejado') !== -1
    )
  );

  teste(
    11,
    'lacunas contém contexto',
    !!(
      interpretacao &&
      Array.isArray(interpretacao.lacunas) &&
      interpretacao.lacunas.indexOf('contexto') !== -1
    )
  );

  teste(
    12,
    'lacunas contém restrições',
    !!(
      interpretacao &&
      Array.isArray(interpretacao.lacunas) &&
      interpretacao.lacunas.indexOf('restricoes') !== -1
    )
  );

  Logger.log('============================================================');
  Logger.log('TESTAR_INFORMACAO_INCOMPLETA_SEMANTICA_V63');
  Logger.log('APROVADOS: ' + aprovados + '/' + total);
  Logger.log('FALHAS: ' + (total - aprovados));
  Logger.log(
    'PERCENTUAL: ' +
    Math.round((aprovados / total) * 100) +
    '%'
  );

  if (aprovados === total) {
    Logger.log(
      '🏆 TESTAR_INFORMACAO_INCOMPLETA_SEMANTICA_V63: PASSOU'
    );
  } else {
    Logger.log(
      '❌ TESTAR_INFORMACAO_INCOMPLETA_SEMANTICA_V63: FALHOU'
    );
  }

  return {
    sucesso: aprovados === total,
    aprovados: aprovados,
    falhas: total - aprovados,
    percentual: Math.round((aprovados / total) * 100),
    interpretacao: interpretacao,
    erro: erro ? String(erro.message || erro) : null
  };
}

function TESTAR_GUARDA_IMPACTO_SEMANTICO_V63() {

  const casos = [
    {
      nome: 'erro de digitação sem consequência mensurável',
      mensagem: 'Temos muitos erros de digitação nos pedidos.',
      status: 'CONFIRMADO',
      esperado: 'INFERIDO'
    },
    {
      nome: 'retrabalho sem consequência mensurável',
      mensagem: 'O processo gera muito retrabalho.',
      status: 'CONFIRMADO',
      esperado: 'INFERIDO'
    },
    {
      nome: 'pedidos sem consequência mensurável',
      mensagem: 'Recebemos muitos pedidos diariamente.',
      status: 'CONFIRMADO',
      esperado: 'INFERIDO'
    },
    {
      nome: 'perda de tempo explícita',
      mensagem: 'Perdemos tempo todos os dias com esse processo.',
      status: 'CONFIRMADO',
      esperado: 'CONFIRMADO'
    },
    {
      nome: 'perda de 3 horas',
      mensagem: 'Perdemos 3 horas por dia com isso.',
      status: 'CONFIRMADO',
      esperado: 'CONFIRMADO'
    },
    {
      nome: 'prejuízo explícito',
      mensagem: 'Esse problema gera prejuízo para a empresa.',
      status: 'CONFIRMADO',
      esperado: 'CONFIRMADO'
    },
    {
      nome: 'atraso explícito',
      mensagem: 'Os pedidos sofrem atraso por causa do processo.',
      status: 'CONFIRMADO',
      esperado: 'CONFIRMADO'
    },
    {
      nome: 'custo explícito',
      mensagem: 'O processo gera custo adicional para a empresa.',
      status: 'CONFIRMADO',
      esperado: 'CONFIRMADO'
    },
    {
      nome: 'volume numérico não é impacto',
      mensagem: 'Processamos 120 pedidos por dia.',
      status: 'CONFIRMADO',
      esperado: 'INFERIDO'
    },
    {
      nome: 'status já inferido permanece inferido',
      mensagem: 'Temos muitos erros no processo.',
      status: 'INFERIDO',
      esperado: 'INFERIDO'
    },
    {
      nome: 'status desconhecido permanece desconhecido',
      mensagem: 'Temos muitos erros no processo.',
      status: 'DESCONHECIDO',
      esperado: 'DESCONHECIDO'
    },
    {
      nome: 'mensagem vazia não promove impacto',
      mensagem: '',
      status: 'CONFIRMADO',
      esperado: 'INFERIDO'
    }
  ];

  let aprovados = 0;

  casos.forEach(function(caso, indice) {

    const dados = {
      impactos: ['impacto'],
      status: {
        impactos: caso.status
      }
    };

    normalizarImpactoSemanticoV63_(
      dados,
      caso.mensagem
    );

    const passou =
      dados.status.impactos === caso.esperado;

    if (passou) {
      aprovados++;
    }

    Logger.log(
      (passou ? '✅' : '❌') +
      ' TESTE ' + (indice + 1) +
      ' — ' + caso.nome +
      ' — obtido=' + dados.status.impactos +
      ' — esperado=' + caso.esperado
    );
  });

  const percentual =
    Math.round((aprovados / casos.length) * 100);

  Logger.log('============================================================');
  Logger.log('TESTAR_GUARDA_IMPACTO_SEMANTICO_V63');
  Logger.log('APROVADOS: ' + aprovados + '/' + casos.length);
  Logger.log('FALHAS: ' + (casos.length - aprovados));
  Logger.log('PERCENTUAL: ' + percentual + '%');

  if (aprovados === casos.length) {
    Logger.log('🏆 TESTAR_GUARDA_IMPACTO_SEMANTICO_V63: PASSOU');
  } else {
    Logger.log('❌ TESTAR_GUARDA_IMPACTO_SEMANTICO_V63: FALHOU');
  }

  return {
    sucesso: aprovados === casos.length,
    aprovados: aprovados,
    falhas: casos.length - aprovados,
    percentual: percentual
  };
}
