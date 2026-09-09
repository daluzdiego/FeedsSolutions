/**
 * ============================================================
 * NEURO SOLUTIONS — MVP V1
 * DADOS.GS
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * EMPRESA
 * ------------------------------------------------------------
 */
function salvarEmpresa_(dados) {

  const sheet = obterAba_(SHEETS.EMPRESAS);

  const empresaId = dados.empresa_id ||
    gerarId_(ID_PREFIXOS.EMPRESA);

  const agora = new Date();

  const linha = [

    empresaId,

    dados.nome_empresa || '',

    dados.segmento || '',

    dados.porte || '',

    dados.nome_contato || '',

    dados.whatsapp || '',

    dados.email || '',

    dados.cidade || '',

    dados.data_criacao || agora,

    dados.ultima_interacao || agora,

    dados.status || STATUS_EMPRESA.ATIVA

  ];

  sheet.appendRow(linha);

  return {

    empresa_id: empresaId,

    sucesso: true

  };
}


/**
 * ------------------------------------------------------------
 * MENSAGEM
 * ------------------------------------------------------------
 */
function salvarMensagem_(dados) {

  const sheet = obterAba_(SHEETS.CONVERSAS);

  const mensagemId =
    dados.mensagem_id ||
    gerarId_(ID_PREFIXOS.MENSAGEM);

  const timestamp =
    dados.timestamp || new Date();

  const linha = [

    mensagemId,

    dados.conversa_id || '',

    dados.empresa_id || '',

    timestamp,

    dados.remetente || '',

    dados.mensagem || '',

    dados.tipo || '',

    dados.ordem || ''

  ];

  sheet.appendRow(linha);

  return {

    mensagem_id: mensagemId,

    sucesso: true

  };
}


/**
 * ------------------------------------------------------------
 * CRIAR DIAGNÓSTICO
 * ------------------------------------------------------------
 */
function criarDiagnostico_(dados) {

  const sheet =
    obterAba_(SHEETS.DIAGNOSTICOS);

  const diagnosticoId =
    dados.diagnostico_id ||
    gerarId_(ID_PREFIXOS.DIAGNOSTICO);

  const agora = new Date();

  const linha = [

    diagnosticoId,

    dados.empresa_id || '',

    dados.conversa_id || '',

    dados.processo_nome || '',

    dados.processo_resumo || '',

    dados.dor_principal || '',

    dados.dor_categoria || '',

    dados.impacto_nivel || '',

    dados.frequencia || '',

    dados.objetivo || '',

    dados.status_diagnostico ||
      STATUS_DIAGNOSTICO.EM_ANDAMENTO,

    dados.classificacao || '',

    dados.confianca || '',

    dados.intencao || '',

    dados.criado_em || agora,

    dados.atualizado_em || agora

  ];

  sheet.appendRow(linha);

  return {

    diagnostico_id: diagnosticoId,

    sucesso: true

  };
}


/**
 * ------------------------------------------------------------
 * ATUALIZAR DIAGNÓSTICO
 * ------------------------------------------------------------
 */
function atualizarDiagnostico_(diagnosticoId, dados) {

  const sheet =
    obterAba_(SHEETS.DIAGNOSTICOS);

  const valores =
    sheet.getDataRange().getValues();

  if (valores.length <= 1) {

    throw new Error(
      'Diagnóstico não encontrado.'
    );
  }

  const cabecalhos = valores[0];

  const colunaId =
    cabecalhos.indexOf('diagnostico_id');

  if (colunaId === -1) {

    throw new Error(
      'Coluna diagnostico_id não encontrada.'
    );
  }

  for (let i = 1; i < valores.length; i++) {

    if (
      String(valores[i][colunaId]) ===
      String(diagnosticoId)
    ) {

      const linhaPlanilha = i + 1;

      Object.keys(dados).forEach(function(campo) {

        const coluna =
          cabecalhos.indexOf(campo);

        if (coluna !== -1) {

          sheet
            .getRange(
              linhaPlanilha,
              coluna + 1
            )
            .setValue(dados[campo]);

        }

      });

      sheet
        .getRange(
          linhaPlanilha,
          cabecalhos.indexOf('atualizado_em') + 1
        )
        .setValue(new Date());

      return {
        sucesso: true,
        diagnostico_id: diagnosticoId
      };
    }
  }

  throw new Error(
    'Diagnóstico não encontrado: ' +
    diagnosticoId
  );
}


/**
 * ------------------------------------------------------------
 * DOR
 * ------------------------------------------------------------
 */
function salvarDor_(dados) {

  const sheet =
    obterAba_(SHEETS.DORES);

  const dorId =
    dados.dor_id ||
    gerarId_(ID_PREFIXOS.DOR);

  const linha = [

    dorId,

    dados.diagnostico_id || '',

    dados.categoria || '',

    dados.descricao || '',

    dados.frequencia || '',

    dados.impacto || '',

    dados.confirmada_cliente || '',

    dados.confianca || ''

  ];

  sheet.appendRow(linha);

  return {

    dor_id: dorId,

    sucesso: true

  };
}


/**
 * ------------------------------------------------------------
 * RELAÇÃO DIAGNÓSTICO × SOLUÇÃO
 * ------------------------------------------------------------
 */
function salvarDiagnosticoSolucao_(dados) {

  const sheet =
    obterAba_(SHEETS.DIAGNOSTICO_SOLUCOES);

  const relacaoId =
    dados.relacao_id ||
    gerarId_(ID_PREFIXOS.RELACAO);

  const linha = [

    relacaoId,

    dados.diagnostico_id || '',

    dados.solucao_id || '',

    dados.compatibilidade || '',

    dados.motivo || '',

    dados.viabilidade || '',

    dados.principal || '',

    dados.criado_em || new Date()

  ];

  sheet.appendRow(linha);

  return {

    relacao_id: relacaoId,

    sucesso: true

  };
}


/**
 * ------------------------------------------------------------
 * LEAD
 * ------------------------------------------------------------
 */
function salvarLead_(dados) {

  const sheet =
    obterAba_(SHEETS.LEADS);

  const leadId =
    dados.lead_id ||
    gerarId_(ID_PREFIXOS.LEAD);

  const agora = new Date();

  const linha = [

    leadId,

    dados.empresa_id || '',

    dados.diagnostico_id || '',

    dados.nome || '',

    dados.whatsapp || '',

    dados.interesse || '',

    dados.prioridade || '',

    dados.status || STATUS_LEAD.NOVO,

    dados.responsavel || '',

    dados.criado_em || agora,

    dados.atualizado_em || agora

  ];

  sheet.appendRow(linha);

  return {

    lead_id: leadId,

    sucesso: true

  };
}


/**
 * ------------------------------------------------------------
 * FEEDBACK
 * ------------------------------------------------------------
 */
function salvarFeedback_(dados) {

  const sheet =
    obterAba_(SHEETS.FEEDBACK);

  const feedbackId =
    dados.feedback_id ||
    gerarId_(ID_PREFIXOS.FEEDBACK);

  const linha = [

    feedbackId,

    dados.diagnostico_id || '',

    dados.resposta || '',

    dados.comentario || '',

    dados.timestamp || new Date()

  ];

  sheet.appendRow(linha);

  return {

    feedback_id: feedbackId,

    sucesso: true

  };
}


/**
 * ------------------------------------------------------------
 * BUSCAR EMPRESA
 * ------------------------------------------------------------
 */
function buscarEmpresa_(empresaId) {

  const sheet =
    obterAba_(SHEETS.EMPRESAS);

  const dados =
    sheet.getDataRange().getValues();

  if (dados.length <= 1) return null;

  const cabecalhos = dados[0];

  const colunaId =
    cabecalhos.indexOf('empresa_id');

  for (let i = 1; i < dados.length; i++) {

    if (
      String(dados[i][colunaId]) ===
      String(empresaId)
    ) {

      return objetoDaLinha_(
        cabecalhos,
        dados[i]
      );
    }
  }

  return null;
}


/**
 * ------------------------------------------------------------
 * BUSCAR DIAGNÓSTICO
 * ------------------------------------------------------------
 */
function buscarDiagnostico_(diagnosticoId) {

  const sheet =
    obterAba_(SHEETS.DIAGNOSTICOS);

  const dados =
    sheet.getDataRange().getValues();

  if (dados.length <= 1) return null;

  const cabecalhos = dados[0];

  const colunaId =
    cabecalhos.indexOf('diagnostico_id');

  for (let i = 1; i < dados.length; i++) {

    if (
      String(dados[i][colunaId]) ===
      String(diagnosticoId)
    ) {

      return objetoDaLinha_(
        cabecalhos,
        dados[i]
      );
    }
  }

  return null;
}


/**
 * ------------------------------------------------------------
 * BUSCAR SOLUÇÕES ATIVAS
 * ------------------------------------------------------------
 */
function buscarSolucoesAtivas_() {

  const sheet =
    obterAba_(SHEETS.SOLUCOES);

  const dados =
    sheet.getDataRange().getValues();

  if (dados.length <= 1) return [];

  const cabecalhos = dados[0];

  const colunaStatus =
    cabecalhos.indexOf('status');

  return dados
    .slice(1)
    .filter(function(linha) {

      return String(
        linha[colunaStatus]
      ).toUpperCase() === 'ATIVA';

    })
    .map(function(linha) {

      return objetoDaLinha_(
        cabecalhos,
        linha
      );

    });
}


/**
 * ------------------------------------------------------------
 * UTILITÁRIO — OBTER ABA
 * ------------------------------------------------------------
 */
function obterAba_(nome) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName(nome);

  if (!sheet) {

    throw new Error(
      'Aba não encontrada: ' + nome
    );
  }

  return sheet;
}


/**
 * ------------------------------------------------------------
 * UTILITÁRIO — OBJETO DA LINHA
 * ------------------------------------------------------------
 */
function objetoDaLinha_(cabecalhos, linha) {

  const objeto = {};

  cabecalhos.forEach(function(cabecalho, index) {

    objeto[cabecalho] =
      linha[index];

  });

  return objeto;
}


/**
 * ------------------------------------------------------------
 * UTILITÁRIO — ID
 * ------------------------------------------------------------
 */
function gerarId_(prefixo) {

  return prefixo +
    '-' +
    Utilities
      .getUuid()
      .replace(/-/g, '')
      .substring(0, 16)
      .toUpperCase();
}


/**
 * ------------------------------------------------------------
 * UTILITÁRIO — NORMALIZAR TEXTO
 * ------------------------------------------------------------
 */
function normalizarTexto_(texto) {

  return String(texto || '')
    .trim()
    .toLowerCase();

}

/**
 * ============================================================
 * V6.2.1 — PERSISTÊNCIA DA INVESTIGAÇÃO
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * SERIALIZA VALOR DA INVESTIGAÇÃO
 * ------------------------------------------------------------
 */
function serializarInvestigacaoV62_(valor) {

  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return '';
  }

  if (
    typeof valor === 'object'
  ) {
    return JSON.stringify(valor);
  }

  return String(valor);

}


/**
 * ------------------------------------------------------------
 * DESSERIALIZA VALOR DA INVESTIGAÇÃO
 * ------------------------------------------------------------
 */
function desserializarInvestigacaoV62_(valor) {

  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return '';
  }

  const texto =
    String(valor);

  try {

    return JSON.parse(texto);

  } catch (erro) {

    return texto;

  }

}


/**
 * ------------------------------------------------------------
 * NORMALIZA REGISTRO RECUPERADO
 * ------------------------------------------------------------
 */
function normalizarRegistroInvestigacaoV62_(
  registro
) {

  if (!registro) {
    return null;
  }

  const dados =
    Object.assign(
      {},
      registro
    );

  const camposEstruturados = [

    'processo',
    'pontos_de_dor',
    'impacto',
    'excecoes',
    'informacoes',
    'lacunas',
    'perguntas_realizadas'

  ];

  camposEstruturados.forEach(
    function(campo) {

      dados[campo] =
        desserializarInvestigacaoV62_(
          dados[campo]
        );

    }
  );

  return dados;

}


/**
 * ------------------------------------------------------------
 * BUSCAR INVESTIGAÇÃO
 * ------------------------------------------------------------
 *
 * A busca é feita por um identificador específico.
 *
 * Prioridade:
 *
 * 1. diagnostico_id
 * 2. conversa_id
 * 3. investigacao_id
 *
 * empresa_id sozinho NÃO será utilizado para evitar
 * recuperar uma investigação errada da mesma empresa.
 * ------------------------------------------------------------
 */
/**
 * ============================================================
 * INVESTIGAÇÃO V6.2 — BUSCAR
 * ============================================================
 */
function buscarInvestigacaoV62_(filtros) {

  filtros = filtros || {};

  const sheet =
    obterAba_(SHEETS.INVESTIGACOES);

  const valores =
    sheet.getDataRange().getValues();

  if (valores.length <= 1) {
    return null;
  }

  const cabecalhos = valores[0];

  const idxId =
    cabecalhos.indexOf('investigacao_id');

  const idxDiagnostico =
    cabecalhos.indexOf('diagnostico_id');

  const idxConversa =
    cabecalhos.indexOf('conversa_id');

  if (idxId === -1) {
    throw new Error(
      'Coluna investigacao_id não encontrada.'
    );
  }

  let alvo = null;

  // ----------------------------------------------------------
  // PRIORIDADE 1 — INVESTIGACAO_ID
  // ----------------------------------------------------------

  if (filtros.investigacao_id) {

    alvo = valores.find(function(linha, index) {

      if (index === 0) {
        return false;
      }

      return String(linha[idxId] || '') ===
        String(filtros.investigacao_id);

    });

  }

  // ----------------------------------------------------------
  // PRIORIDADE 2 — DIAGNOSTICO_ID
  // ----------------------------------------------------------

  if (!alvo && filtros.diagnostico_id) {

    if (idxDiagnostico === -1) {
      throw new Error(
        'Coluna diagnostico_id não encontrada.'
      );
    }

    alvo = valores.find(function(linha, index) {

      if (index === 0) {
        return false;
      }

      return String(linha[idxDiagnostico] || '') ===
        String(filtros.diagnostico_id);

    });

  }

  // ----------------------------------------------------------
  // PRIORIDADE 3 — CONVERSA_ID
  // ----------------------------------------------------------

  if (!alvo && filtros.conversa_id) {

    if (idxConversa === -1) {
      throw new Error(
        'Coluna conversa_id não encontrada.'
      );
    }

    alvo = valores.find(function(linha, index) {

      if (index === 0) {
        return false;
      }

      return String(linha[idxConversa] || '') ===
        String(filtros.conversa_id);

    });

  }

  if (!alvo) {
    return null;
  }

  return normalizarRegistroInvestigacaoV62_(
    objetoDaLinha_(
      cabecalhos,
      alvo
    )
  );
}


/**
 * ============================================================
 * INVESTIGAÇÃO V6.2 — SALVAR
 * ============================================================
 */
function salvarInvestigacaoV62_(investigacao) {

  if (!investigacao) {
    throw new Error(
      'Investigação não informada.'
    );
  }

  if (!investigacao.diagnostico_id) {
    throw new Error(
      'diagnostico_id é obrigatório para salvar investigação.'
    );
  }

  // ----------------------------------------------------------
  // UMA INVESTIGAÇÃO POR DIAGNÓSTICO
  // ----------------------------------------------------------

  const existente =
    buscarInvestigacaoV62_({
      diagnostico_id:
        investigacao.diagnostico_id
    });

  if (existente) {

    return atualizarInvestigacaoV62_(
      existente.investigacao_id,
      investigacao
    );
  }

  const sheet =
    obterAba_(SHEETS.INVESTIGACOES);

  const agora = new Date();

  const investigacaoId =
    investigacao.investigacao_id ||
    gerarId_(ID_PREFIXOS.INVESTIGACAO);

  const registro =
    Object.assign({}, investigacao, {

      investigacao_id:
        investigacaoId,

      criado_em:
        investigacao.criado_em || agora,

      atualizado_em:
        investigacao.atualizado_em || agora

    });

  const cabecalhos =
    sheet
      .getRange(
        1,
        1,
        1,
        sheet.getLastColumn()
      )
      .getValues()[0];

  const linha =
    cabecalhos.map(function(cabecalho) {

      let valor =
        registro[cabecalho];

      // --------------------------------------------------------
      // CAMPOS ESTRUTURADOS
      // --------------------------------------------------------

      if (
        cabecalho === 'processo' ||
        cabecalho === 'pontos_de_dor' ||
        cabecalho === 'impacto' ||
        cabecalho === 'excecoes' ||
        cabecalho === 'informacoes' ||
        cabecalho === 'lacunas' ||
        cabecalho === 'perguntas_realizadas'
      ) {

        valor =
          serializarInvestigacaoV62_(valor);

      }

      return valor === undefined ||
        valor === null
        ? ''
        : valor;

    });

  sheet.appendRow(linha);

  SpreadsheetApp.flush();

  return {
    sucesso: true,
    operacao: 'CRIADA',
    investigacao_id: investigacaoId,
    diagnostico_id:
      investigacao.diagnostico_id
  };
}


/**
 * ============================================================
 * INVESTIGAÇÃO V6.2 — ATUALIZAR
 * ============================================================
 */
/**
 * ============================================================
 * INVESTIGAÇÃO V6.2 — ATUALIZAR
 * ============================================================
 *
 * Regra:
 * - Atualização é PARCIAL.
 * - Campos não enviados permanecem intactos.
 * - Identificadores nunca são apagados.
 * - investigacao_id nunca muda.
 * - criado_em nunca muda.
 * - atualizado_em é sempre atualizado.
 *
 * ============================================================
 */
function atualizarInvestigacaoV62_(
  investigacaoId,
  investigacao
) {

  if (!investigacaoId) {
    throw new Error(
      'investigacao_id é obrigatório para atualizar.'
    );
  }

  const sheet =
    obterAba_(SHEETS.INVESTIGACOES);

  if (!sheet) {
    throw new Error(
      'Aba INVESTIGACOES não encontrada.'
    );
  }

  const valores =
    sheet.getDataRange().getValues();

  if (valores.length <= 1) {
    throw new Error(
      'Nenhuma investigação encontrada.'
    );
  }

  const cabecalhos =
    valores[0];

  const idxId =
    cabecalhos.indexOf(
      'investigacao_id'
    );

  if (idxId === -1) {
    throw new Error(
      'Coluna investigacao_id não encontrada.'
    );
  }

  // ----------------------------------------------------------
  // LOCALIZA A LINHA PELO ID
  // ----------------------------------------------------------

  let linhaEncontrada = -1;

  for (
    let i = 1;
    i < valores.length;
    i++
  ) {

    if (
      String(
        valores[i][idxId] || ''
      ) ===
      String(investigacaoId)
    ) {

      linhaEncontrada = i + 1;
      break;

    }
  }

  if (linhaEncontrada === -1) {
    throw new Error(
      'Investigação não encontrada: ' +
      investigacaoId
    );
  }

  // ----------------------------------------------------------
  // IMPORTANTE:
  // LÊ A LINHA ATUAL ANTES DE ALTERAR.
  //
  // Assim conseguimos fazer UPDATE PARCIAL sem apagar
  // informações que não vieram no objeto recebido.
  // ----------------------------------------------------------

  const linhaAtual =
    sheet
      .getRange(
        linhaEncontrada,
        1,
        1,
        cabecalhos.length
      )
      .getValues()[0];

  // ----------------------------------------------------------
  // CRIA CÓPIA DA LINHA ATUAL
  // ----------------------------------------------------------

  const novaLinha =
    linhaAtual.slice();

  // ----------------------------------------------------------
  // CAMPOS QUE NUNCA PODEM SER APAGADOS
  // ----------------------------------------------------------

  const camposProtegidos = [
    'investigacao_id',
    'empresa_id',
    'conversa_id',
    'diagnostico_id',
    'versao',
    'criado_em'
  ];

  // ----------------------------------------------------------
  // CAMPOS ESTRUTURADOS
  // ----------------------------------------------------------

  const camposEstruturados = [
    'processo',
    'pontos_de_dor',
    'impacto',
    'excecoes',
    'informacoes',
    'lacunas',
    'perguntas_realizadas'
  ];

  // ----------------------------------------------------------
  // ATUALIZA SOMENTE O QUE FOI REALMENTE ENVIADO
  // ----------------------------------------------------------

  Object.keys(investigacao || {}).forEach(
    function(campo) {

      // Campo não existe na estrutura da planilha.
      if (
        cabecalhos.indexOf(campo) === -1
      ) {
        return;
      }

      // ID nunca é alterado.
      if (
        campo === 'investigacao_id'
      ) {
        return;
      }

      // --------------------------------------------------------
      // CAMPOS PROTEGIDOS
      // --------------------------------------------------------
      //
      // Se vierem no objeto, mantemos o valor original.
      // Isso impede que uma atualização parcial apague
      // empresa/conversa/diagnóstico/criação.
      // --------------------------------------------------------

      if (
        camposProtegidos.indexOf(campo) !== -1
      ) {
        return;
      }

      // --------------------------------------------------------
      // SOMENTE undefined SIGNIFICA "NÃO INFORMADO"
      //
      // null ou [] podem ser valores válidos de atualização.
      // Exemplo:
      // proxima_pergunta = null
      // proxima_dimensao = null
      // lacunas = []
      // --------------------------------------------------------

      if (
        investigacao[campo] === undefined
      ) {
        return;
      }

      let valor =
        investigacao[campo];

      // --------------------------------------------------------
      // SERIALIZA CAMPOS ESTRUTURADOS
      // --------------------------------------------------------

      if (
        camposEstruturados.indexOf(campo) !== -1
      ) {

        valor =
          serializarInvestigacaoV62_(
            valor
          );

      }

      const coluna =
        cabecalhos.indexOf(campo);

      novaLinha[coluna] =
        valor === undefined
          ? novaLinha[coluna]
          : valor;

    }
  );

  // ----------------------------------------------------------
  // GARANTE QUE O ID CONTINUA INTACTO
  // ----------------------------------------------------------

  novaLinha[idxId] =
    linhaAtual[idxId];

  // ----------------------------------------------------------
  // ATUALIZADO_EM
  // ----------------------------------------------------------

  const idxAtualizado =
    cabecalhos.indexOf(
      'atualizado_em'
    );

  if (idxAtualizado !== -1) {

    novaLinha[idxAtualizado] =
      new Date();

  }

  // ----------------------------------------------------------
  // GRAVA A LINHA INTEIRA DE UMA VEZ
  // ----------------------------------------------------------

  sheet
    .getRange(
      linhaEncontrada,
      1,
      1,
      cabecalhos.length
    )
    .setValues([
      novaLinha
    ]);

  SpreadsheetApp.flush();

  return {
    sucesso: true,
    acao: 'ATUALIZADA',
    investigacao_id: investigacaoId,
    empresa_id:
      novaLinha[
        cabecalhos.indexOf('empresa_id')
      ],
    conversa_id:
      novaLinha[
        cabecalhos.indexOf('conversa_id')
      ],
    diagnostico_id:
      novaLinha[
        cabecalhos.indexOf('diagnostico_id')
      ]
  };
}


/**
 * ------------------------------------------------------------
 * SALVAR INVESTIGAÇÃO
 * ------------------------------------------------------------
 *
 * Regra:
 *
 * UMA investigação por diagnóstico.
 *
 * Se já existir investigação para o diagnóstico,
 * atualiza em vez de criar outra.
 * ------------------------------------------------------------
 */
function salvarInvestigacaoV62_(
  investigacao
) {

  if (!investigacao) {

    throw new Error(
      'Investigação não informada.'
    );

  }


  if (
    !investigacao.diagnostico_id
  ) {

    throw new Error(
      'diagnostico_id é obrigatório para salvar a investigação.'
    );

  }


  const existente =
    buscarInvestigacaoV62_({

      diagnostico_id:
        investigacao.diagnostico_id

    });


  if (existente) {

    return atualizarInvestigacaoV62_(
      existente.investigacao_id,
      investigacao
    );

  }


  const sheet =
    obterAba_(
      SHEETS.INVESTIGACOES
    );


  const investigacaoId =
    investigacao.investigacao_id ||
    gerarId_(
      ID_PREFIXOS.INVESTIGACAO
    );


  const agora =
    new Date();


  const linha = [

    investigacaoId,

    investigacao.empresa_id || '',

    investigacao.conversa_id || '',

    investigacao.diagnostico_id || '',

    investigacao.versao ||
      INVESTIGACAO_V62.VERSAO,

    serializarInvestigacaoV62_(
      investigacao.problema_central
    ),

    serializarInvestigacaoV62_(
      investigacao.processo
    ),

    serializarInvestigacaoV62_(
      investigacao.pontos_de_dor
    ),

    serializarInvestigacaoV62_(
      investigacao.impacto
    ),

    serializarInvestigacaoV62_(
      investigacao.excecoes
    ),

    serializarInvestigacaoV62_(
      investigacao.resultado_desejado
    ),

    serializarInvestigacaoV62_(
      investigacao.informacoes
    ),

    serializarInvestigacaoV62_(
      investigacao.lacunas
    ),

    investigacao.confianca || '',

    investigacao.estado || '',

    investigacao.proxima_dimensao || '',

    investigacao.proxima_pergunta || '',

    serializarInvestigacaoV62_(
      investigacao.perguntas_realizadas
    ),

    investigacao.criado_em ||
      agora,

    agora

  ];


  sheet.appendRow(
    linha
  );


  return {

    investigacao_id:
      investigacaoId,

    empresa_id:
      investigacao.empresa_id || '',

    conversa_id:
      investigacao.conversa_id || '',

    diagnostico_id:
      investigacao.diagnostico_id,

    sucesso:
      true,

    acao:
      'CRIADA'

  };

}


/**
 * ------------------------------------------------------------
 * ATUALIZAR INVESTIGAÇÃO
 * ------------------------------------------------------------
 */
function atualizarInvestigacaoV62_(
  investigacaoId,
  investigacao
) {

  const sheet =
    obterAba_(
      SHEETS.INVESTIGACOES
    );


  const valores =
    sheet
      .getDataRange()
      .getValues();


  if (
    valores.length <= 1
  ) {

    throw new Error(
      'Investigação não encontrada.'
    );

  }


  const cabecalhos =
    valores[0];


  const colunaId =
    cabecalhos.indexOf(
      'investigacao_id'
    );


  if (
    colunaId === -1
  ) {

    throw new Error(
      'Coluna investigacao_id não encontrada.'
    );

  }


  for (
    let i = 1;
    i < valores.length;
    i++
  ) {

    if (
      String(
        valores[i][colunaId]
      ) ===
      String(
        investigacaoId
      )
    ) {

      const linhaPlanilha =
        i + 1;


      const dadosAtualizacao = {

        empresa_id:
          investigacao.empresa_id || '',

        conversa_id:
          investigacao.conversa_id || '',

        diagnostico_id:
          investigacao.diagnostico_id || '',

        versao:
          investigacao.versao ||
          INVESTIGACAO_V62.VERSAO,

        problema_central:
          serializarInvestigacaoV62_(
            investigacao.problema_central
          ),

        processo:
          serializarInvestigacaoV62_(
            investigacao.processo
          ),

        pontos_de_dor:
          serializarInvestigacaoV62_(
            investigacao.pontos_de_dor
          ),

        impacto:
          serializarInvestigacaoV62_(
            investigacao.impacto
          ),

        excecoes:
          serializarInvestigacaoV62_(
            investigacao.excecoes
          ),

        resultado_desejado:
          serializarInvestigacaoV62_(
            investigacao.resultado_desejado
          ),

        informacoes:
          serializarInvestigacaoV62_(
            investigacao.informacoes
          ),

        lacunas:
          serializarInvestigacaoV62_(
            investigacao.lacunas
          ),

        confianca:
          investigacao.confianca || '',

        estado:
          investigacao.estado || '',

        proxima_dimensao:
          investigacao.proxima_dimensao || '',

        proxima_pergunta:
          investigacao.proxima_pergunta || '',

        perguntas_realizadas:
          serializarInvestigacaoV62_(
            investigacao.perguntas_realizadas
          ),

        atualizado_em:
          new Date()

      };


      Object.keys(
        dadosAtualizacao
      ).forEach(
        function(campo) {

          const coluna =
            cabecalhos.indexOf(
              campo
            );

          if (
            coluna !== -1
          ) {

            sheet
              .getRange(
                linhaPlanilha,
                coluna + 1
              )
              .setValue(
                dadosAtualizacao[campo]
              );

          }

        }
      );


      return {

        investigacao_id:
          investigacaoId,

        sucesso:
          true,

        acao:
          'ATUALIZADA'

      };

    }

  }


  throw new Error(
    'Investigação não encontrada: ' +
    investigacaoId
  );

}
