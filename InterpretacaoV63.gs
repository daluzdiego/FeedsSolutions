/**
 * ============================================================
 * FEEDS SOLUTIONS — V6.3
 * INTERPRETAÇÃO SEMÂNTICA
 * ============================================================
 *
 * Responsabilidade:
 * - Transformar linguagem natural em estrutura semântica
 * - Preservar somente informações fornecidas/identificadas
 * - Preparar o problema para o motor de reconhecimento
 *
 * NÃO:
 * - cria solução
 * - valida solução
 * - define preço
 * - expõe tecnologia
 * - altera a biblioteca
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * CONTRATO
 * ------------------------------------------------------------
 */
const INTERPRETACAO_V63 = {

  VERSAO: 'V6.3',

  CAMPOS: [
    'problema',
    'processo',
    'dores',
    'impactos',
    'resultado_desejado',
    'contexto',
    'restricoes',
    'padrao_problema'
  ],

  STATUS: {
    CONFIRMADO: 'CONFIRMADO',
    INFERIDO: 'INFERIDO',
    DESCONHECIDO: 'DESCONHECIDO'
  }

};


/**
 * ------------------------------------------------------------
 * NORMALIZAR TEXTO
 * ------------------------------------------------------------
 */
function normalizarTextoInterpretacaoV63_(
  valor
) {

  if (
    valor === undefined ||
    valor === null
  ) {
    return '';
  }

  return String(
    valor
  ).trim();

}


/**
 * ------------------------------------------------------------
 * NORMALIZAR ARRAY
 * ------------------------------------------------------------
 */
function normalizarArrayInterpretacaoV63_(
  valor
) {

  if (
    Array.isArray(valor)
  ) {

    return valor
      .map(
        function(item) {

          return normalizarTextoInterpretacaoV63_(
            item
          );

        }
      )
      .filter(
        function(item) {

          return !!item;

        }
      );

  }

  if (
    valor === undefined ||
    valor === null ||
    valor === ''
  ) {

    return [];

  }

  return [
    normalizarTextoInterpretacaoV63_(
      valor
    )
  ];

}


/**
 * ------------------------------------------------------------
 * NORMALIZAR STATUS
 * ------------------------------------------------------------
 */
function normalizarStatusInterpretacaoV63_(
  valor
) {

  const status =
    normalizarTextoInterpretacaoV63_(
      valor
    ).toUpperCase();

  if (
    status ===
    INTERPRETACAO_V63.STATUS.CONFIRMADO
  ) {

    return status;

  }

  if (
    status ===
    INTERPRETACAO_V63.STATUS.INFERIDO
  ) {

    return status;

  }

  if (
    status ===
    INTERPRETACAO_V63.STATUS.DESCONHECIDO
  ) {

    return status;

  }

  return INTERPRETACAO_V63.STATUS.DESCONHECIDO;

}


/**
 * ------------------------------------------------------------
 * CRIAR INTERPRETAÇÃO
 * ------------------------------------------------------------
 */
function criarInterpretacaoSemanticaV63_(
  dados
) {

  dados =
    dados || {};

  return {

    versao:
      INTERPRETACAO_V63.VERSAO,

    problema:
      normalizarTextoInterpretacaoV63_(
        dados.problema
      ),

    processo:
      normalizarTextoInterpretacaoV63_(
        dados.processo
      ),

    dores:
      normalizarArrayInterpretacaoV63_(
        dados.dores
      ),

    impactos:
      normalizarArrayInterpretacaoV63_(
        dados.impactos
      ),

    resultado_desejado:
      normalizarTextoInterpretacaoV63_(
        dados.resultado_desejado
      ),

    contexto:
      normalizarTextoInterpretacaoV63_(
        dados.contexto
      ),

    restricoes:
      normalizarArrayInterpretacaoV63_(
        dados.restricoes
      ),

    padrao_problema:
      normalizarTextoInterpretacaoV63_(
        dados.padrao_problema
      ),

    status: {

      problema:
        normalizarStatusInterpretacaoV63_(
          dados.status &&
          dados.status.problema
        ),

      processo:
        normalizarStatusInterpretacaoV63_(
          dados.status &&
          dados.status.processo
        ),

      dores:
        normalizarStatusInterpretacaoV63_(
          dados.status &&
          dados.status.dores
        ),

      impactos:
        normalizarStatusInterpretacaoV63_(
          dados.status &&
          dados.status.impactos
        ),

      resultado_desejado:
        normalizarStatusInterpretacaoV63_(
          dados.status &&
          dados.status.resultado_desejado
        ),

      contexto:
        normalizarStatusInterpretacaoV63_(
          dados.status &&
          dados.status.contexto
        ),

      restricoes:
        normalizarStatusInterpretacaoV63_(
          dados.status &&
          dados.status.restricoes
        ),

      padrao_problema:
        normalizarStatusInterpretacaoV63_(
          dados.status &&
          dados.status.padrao_problema
        )

    }

  };

}


/**
 * ------------------------------------------------------------
 * VALIDAR INTERPRETAÇÃO
 * ------------------------------------------------------------
 */
function validarInterpretacaoSemanticaV63_(
  interpretacao
) {

  /*
   * ----------------------------------------------------------
   * VALIDAÇÃO BÁSICA
   * ----------------------------------------------------------
   */

  if (
    !interpretacao ||
    typeof interpretacao !== 'object'
  ) {
    return false;
  }


  /*
   * ----------------------------------------------------------
   * VERSÃO
   * ----------------------------------------------------------
   */

  if (
    interpretacao.versao !== 'V6.3'
  ) {
    return false;
  }


  /*
   * ----------------------------------------------------------
   * CAMPOS OBRIGATÓRIOS
   * ----------------------------------------------------------
   *
   * O campo precisa EXISTIR no contrato.
   *
   * Porém, ele não precisa necessariamente possuir conteúdo.
   *
   * Isso é fundamental para permitir:
   *
   * campo = []
   * status = DESCONHECIDO
   *
   * ou:
   *
   * campo = ''
   * status = DESCONHECIDO
   */

  const camposObrigatorios =
    IA_SEMANTICA_V63.CAMPOS_OBRIGATORIOS ||
    [
      'problema',
      'processo',
      'dores',
      'impactos',
      'resultado_desejado',
      'contexto',
      'restricoes',
      'padrao_problema'
    ];

  for (
    let i = 0;
    i < camposObrigatorios.length;
    i++
  ) {

    const campo =
      camposObrigatorios[i];

    if (
      !Object.prototype.hasOwnProperty.call(
        interpretacao,
        campo
      )
    ) {
      return false;
    }
  }


  /*
   * ----------------------------------------------------------
   * TIPOS DOS CAMPOS
   * ----------------------------------------------------------
   */

  if (
    typeof interpretacao.problema !==
    'string'
  ) {
    return false;
  }

  if (
    typeof interpretacao.processo !==
    'string'
  ) {
    return false;
  }

  if (
    !Array.isArray(
      interpretacao.dores
    )
  ) {
    return false;
  }

  if (
    !Array.isArray(
      interpretacao.impactos
    )
  ) {
    return false;
  }

  if (
    typeof interpretacao.resultado_desejado !==
    'string'
  ) {
    return false;
  }

  if (
    typeof interpretacao.contexto !==
    'string'
  ) {
    return false;
  }

  if (
    !Array.isArray(
      interpretacao.restricoes
    )
  ) {
    return false;
  }

  if (
    typeof interpretacao.padrao_problema !==
    'string'
  ) {
    return false;
  }


  /*
   * ----------------------------------------------------------
   * STATUS
   * ----------------------------------------------------------
   */

  if (
    !interpretacao.status ||
    typeof interpretacao.status !==
      'object'
  ) {
    return false;
  }


  for (
    let i = 0;
    i < camposObrigatorios.length;
    i++
  ) {

    const campo =
      camposObrigatorios[i];

    if (
      !Object.prototype.hasOwnProperty.call(
        interpretacao.status,
        campo
      )
    ) {
      return false;
    }

    const status =
      String(
        interpretacao.status[campo] || ''
      )
        .trim()
        .toUpperCase();

    if (
      IA_SEMANTICA_V63.STATUS_VALIDOS
        .indexOf(status) === -1
    ) {
      return false;
    }
  }


  /*
   * ----------------------------------------------------------
   * REGRA SEMÂNTICA DOS CAMPOS DESCONHECIDOS
   * ----------------------------------------------------------
   *
   * Se a IA disser que algo é DESCONHECIDO,
   * não exigimos conteúdo.
   *
   * Exemplos válidos:
   *
   * restricoes: []
   * status.restricoes: DESCONHECIDO
   *
   * contexto: ''
   * status.contexto: DESCONHECIDO
   *
   * processo: ''
   * status.processo: DESCONHECIDO
   *
   * Isso evita que o sistema obrigue a IA a inventar
   * informações apenas para satisfazer o schema.
   */

  for (
    let i = 0;
    i < camposObrigatorios.length;
    i++
  ) {

    const campo =
      camposObrigatorios[i];

    const status =
      String(
        interpretacao.status[campo] || ''
      )
        .trim()
        .toUpperCase();

    const valor =
      interpretacao[campo];

    if (
      status === 'DESCONHECIDO'
    ) {
      continue;
    }


    /*
     * CONFIRMADO ou INFERIDO exigem conteúdo.
     */

    if (
      typeof valor === 'string'
    ) {

      if (
        !valor.trim()
      ) {
        return false;
      }

    } else if (
      Array.isArray(valor)
    ) {

      if (
        valor.length === 0
      ) {
        return false;
      }

      const possuiValor =
        valor.some(function(item) {

          return (
            item !== null &&
            item !== undefined &&
            String(item).trim() !== ''
          );

        });

      if (!possuiValor) {
        return false;
      }

    } else {

      return false;
    }
  }


  /*
   * ----------------------------------------------------------
   * LIMPEZA DOS ARRAYS
   * ----------------------------------------------------------
   *
   * Nenhum array pode conter valores vazios.
   */

  const arrays =
    [
      'dores',
      'impactos',
      'restricoes'
    ];

  for (
    let i = 0;
    i < arrays.length;
    i++
  ) {

    const campo =
      arrays[i];

    for (
      let j = 0;
      j < interpretacao[campo].length;
      j++
    ) {

      const item =
        interpretacao[campo][j];

      if (
        item === null ||
        item === undefined ||
        String(item).trim() === ''
      ) {
        return false;
      }
    }
  }


  /*
   * ----------------------------------------------------------
   * RESULTADO
   * ----------------------------------------------------------
   */

  return true;
}

/**
 * ------------------------------------------------------------
 * NORMALIZAR PARA RECONHECIMENTO
 * ------------------------------------------------------------
 *
 * Faz a ponte entre a interpretação semântica
 * e o motor determinístico já aprovado.
 * ------------------------------------------------------------
 */
function prepararParaReconhecimentoV63_(
  interpretacao
) {

  if (
    !validarInterpretacaoSemanticaV63_(
      interpretacao
    )
  ) {

    throw new Error(
      'Interpretação semântica inválida.'
    );

  }

  return {

    problema_central:
      interpretacao.problema,

    processo:
      interpretacao.processo,

    pontos_de_dor:
      interpretacao.dores,

    impacto:
      interpretacao.impactos,

    resultado_desejado:
      interpretacao.resultado_desejado,

    contexto:
      interpretacao.contexto,

    restricoes:
      interpretacao.restricoes,

    padrao_problema:
      interpretacao.padrao_problema

  };

}


/**
 * ------------------------------------------------------------
 * SEGURANÇA
 * ------------------------------------------------------------
 *
 * A interpretação semântica não pode carregar
 * instruções técnicas para comunicação externa.
 * ------------------------------------------------------------
 */
function verificarSegurancaInterpretacaoV63_(
  interpretacao
) {

  if (
    !interpretacao
  ) {
    return false;
  }

  const texto =
    JSON.stringify(
      interpretacao
    ).toLowerCase();

  const termosProibidos = [

    'api',
    'prompt',
    'endpoint',
    'token',
    'apikey',
    'banco de dados',
    'database',
    'arquitetura',
    'código fonte',
    'script',
    'sql'

  ];

  for (
    let i = 0;
    i < termosProibidos.length;
    i++
  ) {

    if (
      texto.indexOf(
        termosProibidos[i]
      ) !== -1
    ) {

      return false;

    }

  }

  return true;

}


/**
 * ============================================================
 * TESTE OFICIAL
 * INTERPRETAÇÃO SEMÂNTICA V6.3
 * ============================================================
 */
function TESTAR_INTERPRETACAO_SEMANTICA_V63() {

  const resultados =
    [];

  function testar(
    numero,
    descricao,
    funcao
  ) {

    try {

      const passou =
        funcao() === true;

      resultados.push({

        numero:
          numero,

        descricao:
          descricao,

        passou:
          passou,

        erro:
          passou
            ? ''
            : 'Resultado inesperado'

      });

    } catch (erro) {

      resultados.push({

        numero:
          numero,

        descricao:
          descricao,

        passou:
          false,

        erro:
          erro &&
          erro.message
            ? erro.message
            : String(
                erro
              )

      });

    }

  }


  const interpretacao =
    criarInterpretacaoSemanticaV63_({

      problema:
        'Erros de digitação e retrabalho',

      processo:
        'Funcionários conferem e lançam pedidos manualmente',

      dores: [
        'erros de digitação',
        'retrabalho'
      ],

      impactos: [
        'perda de tempo',
        'necessidade de refazer trabalho'
      ],

      resultado_desejado:
        'reduzir erros e retrabalho',

      contexto:
        'processo administrativo',

      restricoes: [
        'manter qualidade'
      ],

      padrao_problema:
        'processo manual de conferência e lançamento de pedidos',

      status: {

        problema:
          'CONFIRMADO',

        processo:
          'CONFIRMADO',

        dores:
          'CONFIRMADO',

        impactos:
          'CONFIRMADO',

        resultado_desejado:
          'CONFIRMADO',

        contexto:
          'CONFIRMADO',

        restricoes:
          'CONFIRMADO',

        padrao_problema:
          'INFERIDO'

      }

    });


  testar(
    1,
    'Contrato V6.3 disponível',
    function() {

      return (
        INTERPRETACAO_V63 &&
        INTERPRETACAO_V63.VERSAO ===
          'V6.3'
      );

    }
  );


  testar(
    2,
    'Interpretação possui versão',
    function() {

      return (
        interpretacao.versao ===
        'V6.3'
      );

    }
  );


  testar(
    3,
    'Problema foi estruturado',
    function() {

      return (
        interpretacao.problema ===
        'Erros de digitação e retrabalho'
      );

    }
  );


  testar(
    4,
    'Processo foi estruturado',
    function() {

      return (
        !!interpretacao.processo
      );

    }
  );


  testar(
    5,
    'Dores foram estruturadas',
    function() {

      return (
        Array.isArray(
          interpretacao.dores
        ) &&
        interpretacao.dores.length === 2
      );

    }
  );


  testar(
    6,
    'Impactos foram estruturados',
    function() {

      return (
        Array.isArray(
          interpretacao.impactos
        ) &&
        interpretacao.impactos.length === 2
      );

    }
  );


  testar(
    7,
    'Resultado desejado foi estruturado',
    function() {

      return (
        !!interpretacao.resultado_desejado
      );

    }
  );


  testar(
    8,
    'Contexto foi estruturado',
    function() {

      return (
        interpretacao.contexto ===
        'processo administrativo'
      );

    }
  );


  testar(
    9,
    'Restrições foram estruturadas',
    function() {

      return (
        Array.isArray(
          interpretacao.restricoes
        ) &&
        interpretacao.restricoes.length === 1
      );

    }
  );


  testar(
    10,
    'Padrão do problema foi estruturado',
    function() {

      return (
        !!interpretacao.padrao_problema
      );

    }
  );


  testar(
    11,
    'Status CONFIRMADO é preservado',
    function() {

      return (
        interpretacao.status.problema ===
        'CONFIRMADO'
      );

    }
  );


  testar(
    12,
    'Status INFERIDO é preservado',
    function() {

      return (
        interpretacao.status.padrao_problema ===
        'INFERIDO'
      );

    }
  );


  testar(
    13,
    'Interpretação completa é válida',
    function() {

      return (
        validarInterpretacaoSemanticaV63_(
          interpretacao
        ) === true
      );

    }
  );


  testar(
    14,
    'Interpretação pode ser preparada para reconhecimento',
    function() {

      const preparada =
        prepararParaReconhecimentoV63_(
          interpretacao
        );

      return (
        preparada.problema_central ===
          interpretacao.problema &&
        preparada.processo ===
          interpretacao.processo &&
        Array.isArray(
          preparada.pontos_de_dor
        ) &&
        preparada.resultado_desejado ===
          interpretacao.resultado_desejado
      );

    }
  );


  testar(
    15,
    'Interpretação vazia não é considerada conteúdo',
    function() {

      return (
        possuiConteudoInterpretacaoV63_(
          ''
        ) === false
      );

    }
  );


  testar(
    16,
    'Array vazio não é considerado conteúdo',
    function() {

      return (
        possuiConteudoInterpretacaoV63_(
          []
        ) === false
      );

    }
  );


  testar(
    17,
    'Array preenchido é considerado conteúdo',
    function() {

      return (
        possuiConteudoInterpretacaoV63_(
          [
            'retrabalho'
          ]
        ) === true
      );

    }
  );


  testar(
    18,
    'Campo ausente invalida interpretação',
    function() {

      const incompleta =
        criarInterpretacaoSemanticaV63_({
          problema:
            'problema'
        });

      delete incompleta.processo;

      return (
        validarInterpretacaoSemanticaV63_(
          incompleta
        ) === false
      );

    }
  );


  testar(
    19,
    'Status inválido vira DESCONHECIDO',
    function() {

      const teste =
        criarInterpretacaoSemanticaV63_({
          problema:
            'problema',
          status: {
            problema:
              'QUALQUER_COISA'
          }
        });

      return (
        teste.status.problema ===
        'DESCONHECIDO'
      );

    }
  );


  testar(
    20,
    'Interpretação não expõe tecnologia',
    function() {

      return (
        verificarSegurancaInterpretacaoV63_(
          interpretacao
        ) === true
      );

    }
  );


  testar(
    21,
    'Interpretação é determinística',
    function() {

      const primeira =
        criarInterpretacaoSemanticaV63_({
          problema:
            'problema',
          processo:
            'processo',
          dores: [
            'dor'
          ],
          impactos: [
            'impacto'
          ],
          resultado_desejado:
            'resultado',
          contexto:
            'contexto',
          restricoes: [
            'restrição'
          ],
          padrao_problema:
            'padrão'
        });

      const segunda =
        criarInterpretacaoSemanticaV63_({
          problema:
            'problema',
          processo:
            'processo',
          dores: [
            'dor'
          ],
          impactos: [
            'impacto'
          ],
          resultado_desejado:
            'resultado',
          contexto:
            'contexto',
          restricoes: [
            'restrição'
          ],
          padrao_problema:
            'padrão'
        });

      return (
        JSON.stringify(
          primeira
        ) ===
        JSON.stringify(
          segunda
        )
      );

    }
  );


  testar(
    22,
    'Normalização de texto remove espaços externos',
    function() {

      return (
        normalizarTextoInterpretacaoV63_(
          '  problema  '
        ) ===
        'problema'
      );

    }
  );


  testar(
    23,
    'Arrays removem valores vazios',
    function() {

      const resultado =
        normalizarArrayInterpretacaoV63_([
          'dor',
          '',
          '   ',
          'impacto'
        ]);

      return (
        resultado.length === 2
      );

    }
  );


  testar(
    24,
    'Versão incorreta invalida interpretação',
    function() {

      const invalida =
        criarInterpretacaoSemanticaV63_({
          problema:
            'problema'
        });

      invalida.versao =
        'V1';

      return (
        validarInterpretacaoSemanticaV63_(
          invalida
        ) === false
      );

    }
  );


  testar(
    25,
    'Segurança rejeita conteúdo técnico',
    function() {

      const perigosa =
        criarInterpretacaoSemanticaV63_({
          problema:
            'usar uma API para automatizar'
        });

      return (
        verificarSegurancaInterpretacaoV63_(
          perigosa
        ) === false
      );

    }
  );


  const aprovados =
    resultados.filter(
      function(item) {
        return item.passou;
      }
    ).length;

  const falhas =
    resultados.length -
    aprovados;

  const percentual =
    resultados.length > 0
      ? Math.round(
          (
            aprovados /
            resultados.length
          ) * 100
        )
      : 0;


  Logger.log(
    '============================================================'
  );

  Logger.log(
    'TESTAR_INTERPRETACAO_SEMANTICA_V63'
  );

  Logger.log(
    'APROVADOS: ' +
    aprovados +
    '/' +
    resultados.length
  );

  Logger.log(
    'FALHAS: ' +
    falhas
  );

  Logger.log(
    'PERCENTUAL: ' +
    percentual +
    '%'
  );


  resultados.forEach(
    function(item) {

      Logger.log(
        (
          item.passou
            ? '✅'
            : '❌'
        ) +
        ' TESTE ' +
        item.numero +
        ' — ' +
        item.descricao +
        (
          item.erro
            ? ' — ' +
              item.erro
            : ''
        )
      );

    }
  );


  if (
    aprovados ===
    resultados.length
  ) {

    Logger.log(
      '🏆 TESTAR_INTERPRETACAO_SEMANTICA_V63: PASSOU'
    );

    Logger.log(
      '🏆 INTERPRETAÇÃO SEMÂNTICA V6.3: 100%'
    );

  } else {

    Logger.log(
      '❌ TESTAR_INTERPRETACAO_SEMANTICA_V63: FALHOU'
    );

  }


  return {

    sucesso:
      falhas === 0,

    aprovados:
      aprovados,

    falhas:
      falhas,

    percentual:
      percentual,

    resultados:
      resultados

  };

}

function possuiConteudoInterpretacaoV63_(
  valor
) {

  if (
    valor === null ||
    valor === undefined
  ) {
    return false;
  }

  if (
    typeof valor === 'string'
  ) {
    return valor.trim() !== '';
  }

  if (
    Array.isArray(valor)
  ) {

    return valor.some(function(item) {

      return (
        item !== null &&
        item !== undefined &&
        String(item).trim() !== ''
      );

    });
  }

  if (
    typeof valor === 'object'
  ) {

    return Object.keys(valor).some(
      function(chave) {

        return possuiConteudoInterpretacaoV63_(
          valor[chave]
        );

      }
    );
  }

  return true;
}

function DIAGNOSTICAR_INTEGRACAO_V63() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    'DIAGNÓSTICO INTEGRAÇÃO V6.3'
  );

  const interpretacao = {

    versao: 'V6.3',

    problema:
      'Erros e retrabalho no lançamento manual de pedidos.',

    processo:
      'Equipe recebe pedidos e lança manualmente em planilha.',

    dores: [
      'erros de digitação',
      'retrabalho'
    ],

    impactos: [
      'perda de tempo'
    ],

    resultado_desejado:
      'reduzir erros e retrabalho',

    contexto:
      'processo administrativo',

    restricoes: [],

    padrao_problema:
      'processo manual sujeito a erros',

    status: {

      problema: 'CONFIRMADO',
      processo: 'CONFIRMADO',
      dores: 'CONFIRMADO',
      impactos: 'CONFIRMADO',
      resultado_desejado: 'CONFIRMADO',
      contexto: 'CONFIRMADO',
      restricoes: 'DESCONHECIDO',
      padrao_problema: 'INFERIDO'
    }
  };


  const entrada =
    prepararParaReconhecimentoV63_(
      interpretacao
    );


  Logger.log(
    'ENTRADA RECONHECIMENTO:'
  );

  Logger.log(
    JSON.stringify(
      entrada,
      null,
      2
    )
  );


  const resultado =
    integrarInterpretacaoBibliotecaV63_(
      interpretacao
    );


  Logger.log(
    'RESULTADO INTEGRAÇÃO:'
  );

  Logger.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );


  Logger.log(
    'TIPO resultado: ' +
    typeof resultado
  );


  Logger.log(
    'POSSUI entrada_reconhecimento: ' +
    (
      resultado &&
      resultado.entrada_reconhecimento !==
        undefined
    )
  );


  Logger.log(
    'VALOR entrada_reconhecimento:'
  );

  Logger.log(
    JSON.stringify(
      resultado &&
      resultado.entrada_reconhecimento,
      null,
      2
    )
  );


  Logger.log(
    '============================================================'
  );
}