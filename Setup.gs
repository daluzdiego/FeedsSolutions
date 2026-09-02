/**
 * ============================================================
 * NEURO SOLUTIONS — MVP V1
 * CONTRATO DE DADOS + ESTRUTURA DAS PLANILHAS
 * ============================================================
 *
 * Cria todas as abas e cabeçalhos definidos para o MVP.
 *
 * IMPORTANTE:
 * - Não apaga dados existentes.
 * - Se uma aba já existir, apenas garante os cabeçalhos.
 * - Pode ser executado novamente com segurança.
 * ============================================================
 */

function criarEstruturaMVP() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const estruturas = {

    // ========================================================
    // 1. EMPRESAS
    // ========================================================
    'EMPRESAS': [
      'empresa_id',
      'nome_empresa',
      'segmento',
      'porte',
      'nome_contato',
      'whatsapp',
      'email',
      'cidade',
      'data_criacao',
      'ultima_interacao',
      'status'
    ],

    // ========================================================
    // 2. CONVERSAS
    // ========================================================
    'CONVERSAS': [
      'mensagem_id',
      'conversa_id',
      'empresa_id',
      'timestamp',
      'remetente',
      'mensagem',
      'tipo',
      'ordem'
    ],

    // ========================================================
    // 3. DIAGNOSTICOS
    // ========================================================
    'DIAGNOSTICOS': [
      'diagnostico_id',
      'empresa_id',
      'conversa_id',
      'processo_nome',
      'processo_resumo',
      'dor_principal',
      'dor_categoria',
      'impacto_nivel',
      'frequencia',
      'objetivo',
      'status_diagnostico',
      'classificacao',
      'confianca',
      'intencao',
      'criado_em',
      'atualizado_em'
    ],

    // ========================================================
// 4. DORES
// ========================================================
'DORES': [
  'dor_id',
  'diagnostico_id',
  'categoria',
  'descricao',
  'frequencia',
  'impacto',
  'confirmada_cliente',
  'confianca'
],

// ========================================================
// 5. OPORTUNIDADES
// ========================================================
'OPORTUNIDADES': [
  'oportunidade_id',
  'diagnostico_id',
  'empresa_id',
  'conversa_id',
  'processo',
  'dor',
  'frequencia',
  'volume',
  'impacto',
  'objetivo',
  'descricao',
  'prioridade',
  'justificativa',
  'status',
  'criado_em',
  'atualizado_em'
],

// ========================================================
// 6. SOLUCOES
// ========================================================
'SOLUCOES': [
      'solucao_id',
      'familia',
      'nome',
      'descricao',
      'status',
      'nivel_complexidade',
      'repetibilidade',
      'pode_oferecer',
      'versao'
    ],

    // ========================================================
    // 7. DIAGNOSTICO_SOLUCOES
    // ========================================================
    'DIAGNOSTICO_SOLUCOES': [
      'relacao_id',
      'diagnostico_id',
      'solucao_id',
      'compatibilidade',
      'motivo',
      'viabilidade',
      'principal',
      'criado_em'
    ],

    // ========================================================
    // 8. LEADS
    // ========================================================
    'LEADS': [
      'lead_id',
      'empresa_id',
      'diagnostico_id',
      'nome',
      'whatsapp',
      'interesse',
      'prioridade',
      'status',
      'responsavel',
      'criado_em',
      'atualizado_em'
    ],

    // ========================================================
    // 9. FEEDBACK
    // ========================================================
    'FEEDBACK': [
      'feedback_id',
      'diagnostico_id',
      'resposta',
      'comentario',
      'timestamp'
    ],

    // ========================================================
    // 10. METRICAS
    // ========================================================
    'METRICAS': [
      'evento_id',
      'conversa_id',
      'empresa_id',
      'evento',
      'timestamp',
      'valor'
    ],

    // ========================================================
    // 11. CONFIG
    // ========================================================
    'CONFIG': [
      'parametro',
      'valor'
    ]
  };


  // ==========================================================
  // CRIA / CONFIGURA CADA ABA
  // ==========================================================

  Object.keys(estruturas).forEach(function(nomeAba) {

    let sheet = ss.getSheetByName(nomeAba);

    // Se não existir, cria.
    if (!sheet) {
      sheet = ss.insertSheet(nomeAba);
    }

    const cabecalhos = estruturas[nomeAba];

    // Garante que exista espaço suficiente.
    if (sheet.getMaxColumns() < cabecalhos.length) {
      sheet.insertColumnsAfter(
        sheet.getMaxColumns(),
        cabecalhos.length - sheet.getMaxColumns()
      );
    }

    // Se a primeira linha estiver vazia,
    // escreve os cabeçalhos.
    const primeiraLinha = sheet
      .getRange(1, 1, 1, cabecalhos.length)
      .getValues()[0];

    const estaVazia = primeiraLinha.every(function(valor) {
      return valor === '';
    });

    if (estaVazia) {
      sheet
        .getRange(1, 1, 1, cabecalhos.length)
        .setValues([cabecalhos]);
    } else {

      // Se já existe estrutura, não sobrescreve.
      // Apenas verifica se os cabeçalhos esperados estão presentes.
      const faltantes = [];

      cabecalhos.forEach(function(cabecalho) {

        if (primeiraLinha.indexOf(cabecalho) === -1) {
          faltantes.push(cabecalho);
        }

      });

      if (faltantes.length > 0) {

        const ultimaColuna = Math.max(
          sheet.getLastColumn(),
          cabecalhos.length
        );

        if (sheet.getMaxColumns() < ultimaColuna + faltantes.length) {
          sheet.insertColumnsAfter(
            sheet.getMaxColumns(),
            (ultimaColuna + faltantes.length) - sheet.getMaxColumns()
          );
        }

        faltantes.forEach(function(cabecalho) {

          const colunaNova = sheet.getLastColumn() + 1;

          sheet
            .getRange(1, colunaNova)
            .setValue(cabecalho);

        });
      }
    }

    // ========================================================
    // FORMATAÇÃO
    // ========================================================

    const ultimaColuna = sheet.getLastColumn();

    if (ultimaColuna > 0) {

      const header = sheet.getRange(1, 1, 1, ultimaColuna);

      header
        .setFontWeight('bold')
        .setHorizontalAlignment('center');

      sheet.setFrozenRows(1);

      // Auto resize inicial
      sheet.autoResizeColumns(1, ultimaColuna);

    }

  });


  // ==========================================================
  // CONFIGURAÇÕES INICIAIS
  // ==========================================================

  configurarAbaConfig(ss);

  // ==========================================================
  // ORGANIZAÇÃO DAS ABAS
  // ==========================================================

  organizarAbas(ss);

  // ==========================================================
  // MENSAGEM FINAL
  // ==========================================================

try {

  SpreadsheetApp.getUi().alert(
    'Estrutura criada com sucesso!',
    'Estrutura do MVP criada/configurada.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );

} catch (erro) {

  Logger.log(
    'Estrutura criada/configurada com sucesso.'
  );

}


/**
 * ============================================================
 * CONFIG
 * ============================================================
 */

function configurarAbaConfig(ss) {

  const sheet = ss.getSheetByName('CONFIG');

  if (!sheet) return;

  const configuracoes = [

    ['VERSAO_MOTOR', 'V1'],
    ['VERSAO_CATALOGO', 'V1'],
    ['STATUS_SISTEMA', 'DESENVOLVIMENTO'],
    ['MODO_MVP', 'ATIVO']
  ];

  // Só adiciona se a CONFIG ainda estiver sem dados.
  if (sheet.getLastRow() <= 1) {

    sheet
      .getRange(2, 1, configuracoes.length, 2)
      .setValues(configuracoes);

  }

}


/**
 * ============================================================
 * ORGANIZAÇÃO DAS ABAS
 * ============================================================
 */

function organizarAbas(ss) {

  const ordem = [
  'EMPRESAS',
  'CONVERSAS',
  'DIAGNOSTICOS',
  'DORES',
  'OPORTUNIDADES',
  'SOLUCOES',
  'DIAGNOSTICO_SOLUCOES',
  'LEADS',
  'FEEDBACK',
  'METRICAS',
  'CONFIG'
];

  ordem.forEach(function(nomeAba, index) {

    const sheet = ss.getSheetByName(nomeAba);

    if (sheet) {

      ss.setActiveSheet(sheet);

      ss.moveActiveSheet(index + 1);

    }

  });
}}
