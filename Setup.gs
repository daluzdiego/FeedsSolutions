/**
 * ============================================================
 * NEURO SOLUTIONS — MVP V1
 * METRICAS.GS
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * REGISTRAR EVENTO
 * ------------------------------------------------------------
 */
function registrarEvento_(
  evento,
  conversaId,
  empresaId,
  valor
) {

  const sheet =
    obterAba_(SHEETS.METRICAS);

  const eventoId =
    gerarId_(ID_PREFIXOS.EVENTO);

  const linha = [

    eventoId,

    conversaId || '',

    empresaId || '',

    evento || '',

    new Date(),

    valor || ''

  ];

  sheet.appendRow(linha);

  return eventoId;
}


/**
 * ------------------------------------------------------------
 * INÍCIO DA CONVERSA
 * ------------------------------------------------------------
 */
function registrarInicioConversa_(
  conversaId,
  empresaId
) {

  return registrarEvento_(
    'INICIO_CONVERSA',
    conversaId,
    empresaId,
    ''
  );
}


/**
 * ------------------------------------------------------------
 * PRIMEIRA RESPOSTA
 * ------------------------------------------------------------
 */
function registrarPrimeiraResposta_(
  conversaId,
  empresaId
) {

  return registrarEvento_(
    'PRIMEIRA_RESPOSTA',
    conversaId,
    empresaId,
    ''
  );
}


/**
 * ------------------------------------------------------------
 * MENSAGEM
 * ------------------------------------------------------------
 */
function registrarMensagem_(
  conversaId,
  empresaId,
  remetente
) {

  return registrarEvento_(
    remetente === 'usuario'
      ? 'RESPOSTA_USUARIO'
      : 'RESPOSTA_IA',
    conversaId,
    empresaId,
    ''
  );
}


/**
 * ------------------------------------------------------------
 * PERGUNTA IA
 * ------------------------------------------------------------
 */
function registrarPerguntaIA_(
  conversaId,
  empresaId
) {

  return registrarEvento_(
    'PERGUNTA_IA',
    conversaId,
    empresaId,
    ''
  );
}


/**
 * ------------------------------------------------------------
 * DIAGNÓSTICO GERADO
 * ------------------------------------------------------------
 */
function registrarDiagnosticoGerado_(
  conversaId,
  empresaId,
  diagnosticoId
) {

  return registrarEvento_(
    'DIAGNOSTICO_GERADO',
    conversaId,
    empresaId,
    diagnosticoId
  );
}


/**
 * ------------------------------------------------------------
 * CONVERSA CONCLUÍDA
 * ------------------------------------------------------------
 */
function registrarConclusao_(
  conversaId,
  empresaId
) {

  return registrarEvento_(
    'CONVERSA_CONCLUIDA',
    conversaId,
    empresaId,
    ''
  );
}


/**
 * ------------------------------------------------------------
 * ABANDONO
 * ------------------------------------------------------------
 */
function registrarAbandono_(
  conversaId,
  empresaId,
  estado
) {

  return registrarEvento_(
    'ABANDONO',
    conversaId,
    empresaId,
    estado || ''
  );
}


/**
 * ------------------------------------------------------------
 * INTERESSE
 * ------------------------------------------------------------
 */
function registrarInteresse_(
  conversaId,
  empresaId,
  interesse
) {

  return registrarEvento_(
    'INTERESSE_DEMONSTRADO',
    conversaId,
    empresaId,
    interesse || ''
  );
}


/**
 * ------------------------------------------------------------
 * FEEDBACK
 * ------------------------------------------------------------
 */
function registrarFeedbackEvento_(
  conversaId,
  empresaId,
  resposta
) {

  return registrarEvento_(
    'FEEDBACK_RESPONDIDO',
    conversaId,
    empresaId,
    resposta || ''
  );
}


/**
 * ------------------------------------------------------------
 * LISTAR MÉTRICAS — ADMIN
 * ------------------------------------------------------------
 */
function listarMetricasAdmin(token) {

  exigirSessaoAdmin_(token);

  const sheet =
    obterAba_(SHEETS.METRICAS);

  const dados =
    sheet.getDataRange().getValues();

  if (dados.length <= 1) {

    return [];
  }

  const cabecalhos = dados[0];

  return dados
    .slice(1)
    .map(function(linha) {

      return objetoDaLinha_(
        cabecalhos,
        linha
      );

    });
}
