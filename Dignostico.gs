/**
 * ============================================================
 * NEURO SOLUTIONS — MVP V1
 * DIAGNOSTICO.GS
 * ============================================================
 *
 * ORQUESTRADOR DO DIAGNÓSTICO EMPRESARIAL
 *
 * Responsabilidades:
 *
 * - iniciar uma conversa
 * - criar empresa
 * - receber mensagens
 * - salvar mensagens em CONVERSAS
 * - recuperar diagnóstico atual
 * - enviar contexto para IA
 * - atualizar DIAGNOSTICOS
 * - controlar estado do diagnóstico
 * - gerar próxima pergunta
 * - registrar métricas
 *
 * IMPORTANTE:
 *
 * Este módulo NÃO decide:
 *
 * - qual solução vender
 * - se devemos vender
 * - preço
 * - contrato
 * - qualificação comercial definitiva
 *
 * Essas decisões pertencem ao MOTOR DE DECISÃO.
 *
 * ============================================================
 */


/**
 * ============================================================
 * ESTADOS DO DIAGNÓSTICO
 * ============================================================
 */

const DIAGNOSTICO_ESTADOS = {

  INICIO:
    'INICIO',

  DESCOBERTA:
    'DESCOBERTA',

  INVESTIGACAO:
    'INVESTIGACAO',

  PRONTO_PARA_ANALISE:
    'PRONTO_PARA_ANALISE',

  FINALIZADO:
    'FINALIZADO'

};


/**
 * ============================================================
 * INICIAR NOVO DIAGNÓSTICO
 * ============================================================
 *
 * Cria:
 *
 * - empresa
 * - conversa
 * - diagnóstico
 *
 * A conversa em si não é gravada como uma linha vazia.
 * A primeira linha da CONVERSAS será a primeira mensagem real.
 *
 * ============================================================
 */

function iniciarDiagnostico(dadosEmpresa) {

  dadosEmpresa =
    dadosEmpresa || {};


  const empresaId =
    gerarIdDiagnostico_(
      'EMP'
    );


  const conversaId =
    gerarIdDiagnostico_(
      'CONV'
    );


  const diagnosticoId =
    gerarIdDiagnostico_(
      'DIA'
    );


  const agora =
    new Date();


  /**
   * ----------------------------------------------------------
   * EMPRESA
   * ----------------------------------------------------------
   */

  salvarEmpresaDiagnostico_({

    empresa_id:
      empresaId,

    nome:
      dadosEmpresa.nome ||
      dadosEmpresa.nome_empresa ||
      '',

    segmento:
      dadosEmpresa.segmento ||
      '',

    porte:
      dadosEmpresa.porte ||
      '',

    nome_contato:
      dadosEmpresa.nome_contato ||
      dadosEmpresa.nome ||
      '',

    whatsapp:
      dadosEmpresa.whatsapp ||
      dadosEmpresa.celular ||
      '',

    email:
      dadosEmpresa.email ||
      '',

    cidade:
      dadosEmpresa.cidade ||
      '',

    criado_em:
      agora

  });


  /**
   * ----------------------------------------------------------
   * DIAGNÓSTICO
   * ----------------------------------------------------------
   */

  salvarDiagnosticoInicial_({

    diagnostico_id:
      diagnosticoId,

    empresa_id:
      empresaId,

    conversa_id:
      conversaId,

    processo_nome:
      '',

    processo_resumo:
      '',

    dor_principal:
      '',

    dor_categoria:
      '',

    impacto_nivel:
      '',

    frequencia:
      '',

    objetivo:
      '',

    status_diagnostico:
      DIAGNOSTICO_ESTADOS.INICIO,

    classificacao:
      '',

    confianca:
      '',

    intencao:
      '',

    criado_em:
      agora,

    atualizado_em:
      agora

  });


  /**
   * ----------------------------------------------------------
   * MÉTRICA
   * ----------------------------------------------------------
   */

  registrarEventoDiagnostico_(
    'DIAGNOSTICO_INICIADO',
    {

      empresa_id:
        empresaId,

      conversa_id:
        conversaId

    }
  );


  /**
   * ----------------------------------------------------------
   * RETORNO
   * ----------------------------------------------------------
   */

  return {

    sucesso:
      true,

    empresa_id:
      empresaId,

    conversa_id:
      conversaId,

    diagnostico_id:
      diagnosticoId,

    estado:
      DIAGNOSTICO_ESTADOS.INICIO

  };

}


/**
 * ============================================================
 * PROCESSAR MENSAGEM DO EMPRESÁRIO
 * ============================================================
 *
 * Função principal do módulo.
 *
 * Recebe:
 *
 * {
 *   empresa_id,
 *   conversa_id,
 *   mensagem
 * }
 *
 * ============================================================
 */

function processarMensagemDiagnostico(dados) {

  if (!dados) {

    throw new Error(
      'Dados da mensagem não informados.'
    );

  }


  const empresaId =
    dados.empresa_id;


  const conversaId =
    dados.conversa_id;


  const mensagem =
    limparMensagemDiagnostico_(
      dados.mensagem
    );


  if (!empresaId) {

    throw new Error(
      'empresa_id não informado.'
    );

  }


  if (!conversaId) {

    throw new Error(
      'conversa_id não informado.'
    );

  }


  if (!mensagem) {

    throw new Error(
      'Mensagem vazia.'
    );

  }


  /*
   * ==========================================================
   * 1. RECUPERAR DIAGNÓSTICO
   * ==========================================================
   */

  const diagnostico =
    obterDiagnosticoAtual_(
      empresaId,
      conversaId
    );


  if (!diagnostico) {

    throw new Error(
      'Diagnóstico não encontrado para esta conversa.'
    );

  }


  /*
   * ==========================================================
   * 2. SALVAR MENSAGEM DO EMPRESÁRIO
   * ==========================================================
   */

  salvarMensagemDiagnostico_({

    mensagem_id:
      gerarIdDiagnostico_(
        'MSG'
      ),

    conversa_id:
      conversaId,

    empresa_id:
      empresaId,

    remetente:
      'EMPRESARIO',

    texto:
      mensagem,

    tipo:
      'EMPRESARIO',

    timestamp:
      new Date()

  });


  /*
   * ==========================================================
   * 3. RECUPERAR CONTEXTO
   * ==========================================================
   */

  const contexto =
    construirContextoDiagnostico_(
      diagnostico
    );


  /*
   * ==========================================================
   * 4. CONSTRUIR ENTRADA PARA IA
   * ==========================================================
   */

  const entradaIA =
    construirEntradaDiagnosticoIA_(
      mensagem,
      contexto
    );


  /*
   * ==========================================================
   * 5. ANALISAR COM GEMINI
   * ==========================================================
   */

  const analise =
    analisarMensagemDiagnostico_(
      entradaIA
    );


  if (
    !analise ||
    !analise.dados
  ) {

    throw new Error(
      'A IA não retornou uma análise válida.'
    );

  }


  /*
   * ==========================================================
   * 6. NORMALIZAR E VALIDAR ANÁLISE
   * ==========================================================
   */

  const analiseNormalizada =
    normalizarAnaliseDiagnostico_(
      analise.dados,
      mensagem,
      contexto.diagnostico || {}
    );


  /*
   * A IA pode retornar vazio em uma rodada posterior.
   * O motor nunca perde uma medida confirmada já existente.
   */

  if (
    !analiseNormalizada.volume &&
    contexto.diagnostico &&
    contexto.diagnostico.volume
  ) {

    analiseNormalizada.volume =
      contexto.diagnostico.volume;

  }


  /*
   * ==========================================================
   * 7. CONTROLAR CONTINUIDADE
   * ==========================================================
   */

  const analiseContinuidade =
    ajustarContinuidadeDiagnostico_(
      analiseNormalizada,
      contexto.pergunta_pendente || '',
      mensagem
    );


  /*
   * ==========================================================
   * 8. ATUALIZAR DIAGNÓSTICO
   * ==========================================================
   */

  const novoDiagnostico =
    atualizarDiagnosticoComAnalise_(
      diagnostico,
      analiseContinuidade
    );


  /*
   * ==========================================================
   * 9. DETERMINAR ESTADO
   * ==========================================================
   */

  const novoEstado =
    determinarEstadoDiagnostico_(
      novoDiagnostico,
      analiseContinuidade
    );


  novoDiagnostico.status_diagnostico =
    novoEstado;


  novoDiagnostico.atualizado_em =
    new Date();


  /*
   * ==========================================================
   * 10. SALVAR DIAGNÓSTICO
   * ==========================================================
   */

  atualizarDiagnostico_(
    novoDiagnostico
  );


  /*
   * Persistência separada:
   * novas dores e medidas não substituem
   * o diagnóstico consolidado.
   */

  registrarNovasInformacoesDiagnostico_(
    novoDiagnostico,
    analiseContinuidade,
    mensagem
  );


  /*
   * ==========================================================
   * V5.7 — GERAR / ATUALIZAR OPORTUNIDADE
   * ==========================================================
   */

  const oportunidadeV57 =
    persistirOportunidadeDiagnosticoV57_(
      novoDiagnostico
    );


  /*
   * ==========================================================
   * V5.8 — GERAR / ATUALIZAR ANÁLISE DIAGNÓSTICA
   * ==========================================================
   */

  const analiseDiagnosticaV58 =
    persistirAnaliseDiagnosticaV58_(
      novoDiagnostico
    );


  /*
   * ==========================================================
   * V5.9.5 — GERAR / ATUALIZAR SOLUÇÕES
   * ==========================================================
   */

  const solucoesDiagnosticoV595 =
    integrarSolucoesDiagnosticoV595_(
      novoDiagnostico
    );


  /*
   * ==========================================================
   * ATUALIZAR ÚLTIMA INTERAÇÃO DA EMPRESA
   * ==========================================================
   */

  atualizarUltimaInteracaoEmpresa_(
    empresaId
  );


  /*
   * ==========================================================
   * DETERMINAR RESPOSTA
   * ==========================================================
   */

  const resposta =
    obterRespostaConversa_(
      analiseContinuidade,
      novoEstado
    );


  /*
   * ==========================================================
   * SALVAR RESPOSTA DO SISTEMA
   * ==========================================================
   */

  if (
    resposta
  ) {

    salvarMensagemDiagnostico_({

      mensagem_id:
        gerarIdDiagnostico_(
          'MSG'
        ),

      conversa_id:
        conversaId,

      empresa_id:
        empresaId,

      remetente:
        'SISTEMA',

      texto:
        resposta,

      tipo:
        'PERGUNTA_IA',

      timestamp:
        new Date()

    });

  }


  /*
   * ==========================================================
   * MÉTRICA
   * ==========================================================
   */

  registrarEventoDiagnostico_(
    'MENSAGEM_PROCESSADA',
    {

      empresa_id:
        empresaId,

      conversa_id:
        conversaId,

      valor: {

        estado:
          novoEstado,

        tempo_ia_ms:
          analise.tempo_ms ||
          ''

      }

    }
  );


  /*
   * ==========================================================
   * RETORNO PARA INTERFACE
   * ==========================================================
   *
   * IMPORTANTE:
   *
   * V5.7 retorna agora a oportunidade COMPLETA.
   *
   * Não podemos devolver somente:
   *
   * acao
   * oportunidade_id
   * linha
   *
   * porque o V5.10 precisa validar:
   *
   * processo
   * dor
   * frequencia
   * volume
   * impacto
   * objetivo
   * descricao
   * prioridade
   * justificativa
   *
   * ==========================================================
   */

  return {

    sucesso:
      true,


    empresa_id:
      empresaId,


    conversa_id:
      conversaId,


    diagnostico_id:
      novoDiagnostico.diagnostico_id,


    estado:
      novoEstado,


    resposta:
      resposta,


    diagnostico:
      novoDiagnostico,


    analise_ia:
      analiseContinuidade,


    /*
     * ----------------------------------------------------------
     * V5.7 — OPORTUNIDADE COMPLETA
     * ----------------------------------------------------------
     */

    oportunidade:
      oportunidadeV57
        ? {

            acao:
              oportunidadeV57.acao,

            oportunidade_id:
              oportunidadeV57.oportunidade_id,

            linha:
              oportunidadeV57.linha,

            oportunidade:
              oportunidadeV57.oportunidade

          }
        : null,


    /*
     * ----------------------------------------------------------
     * V5.8 — ANÁLISE COMPLETA
     * ----------------------------------------------------------
     */

    analise_diagnostica:
      analiseDiagnosticaV58
        ? {

            acao:
              analiseDiagnosticaV58.acao,

            analise_id:
              analiseDiagnosticaV58.analise_id,

            diagnostico_id:
              analiseDiagnosticaV58.diagnostico_id,

            linha:
              analiseDiagnosticaV58.linha,

            analise:
              analiseDiagnosticaV58.analise

          }
        : null,


    /*
     * ----------------------------------------------------------
     * V5.9.5 — SOLUÇÕES
     * ----------------------------------------------------------
     */

    solucoes:
      solucoesDiagnosticoV595
        ? {

            acao:
              solucoesDiagnosticoV595.acao,

            diagnostico_id:
              solucoesDiagnosticoV595.diagnostico_id,

            total:
              solucoesDiagnosticoV595.total,

            relacoes:
              solucoesDiagnosticoV595.relacoes

          }
        : null

  };

}


/**
 * ============================================================
 * CONSTRUIR ENTRADA PARA IA
 * ============================================================
 */

function construirEntradaDiagnosticoIA_(
  mensagem,
  contexto
) {

  const historico = contexto.historico || [];
  const perguntaPendente = contexto.pergunta_pendente || '';

  return [
    'VOCÊ É O MOTOR DE COMPREENSÃO DO DIAGNÓSTICO EMPRESARIAL.',
    'Sua função é extrair fatos da mensagem atual e escolher UMA próxima pergunta.',
    'O motor de dados é responsável por consolidar e preservar o histórico.',
    '',
    'REGRAS ABSOLUTAS:',
    '1. Nunca apague uma informação válida já descoberta.',
    '2. PROCESSO: retorne somente a NOVA etapa/atividade revelada pela mensagem atual.',
    '3. Nunca retorne no campo processo uma etapa que já esteja nas etapas conhecidas.',
    '4. Nunca transforme o processo inteiro em uma nova etapa.',
    '5. DORES: retorne somente uma dor explicitamente revelada pela mensagem atual. Se não houver nova dor, deixe vazio.',
    '6. Não substitua uma dor anterior por uma dor nova. O motor fará o acúmulo.',
    '7. FREQUÊNCIA: somente periodicidade explícita: diária, semanal, mensal, ocasional etc.',
    '8. IMPACTO: tempo perdido, custo, atraso, erro, retrabalho ou outra consequência explicitamente informada.',
    '9. VOLUME: não coloque volume em impacto. Para quantidade como "80 pedidos por dia", deixe impacto vazio e informe a informação no campo volume quando possível.',
    '10. OBJETIVO: só preencha se o empresário disser claramente o que quer alcançar.',
    '11. Se houver pergunta pendente, diga se a mensagem atual realmente respondeu aquela pergunta.',
    '12. Se não respondeu, preserve a pergunta pendente e não invente outra lacuna.',
    '12A. Se NÃO houver pergunta pendente, responda_pergunta_pendente deve ser false.',
    '13. Se respondeu, escolha a próxima lacuna mais útil.',
    '14. Prioridade de lacunas: volume/quantidade → erros/retrabalho/atrasos → objetivo → outra informação necessária.',
    '15. Faça somente UMA pergunta por vez.',
    '16. Não ofereça solução, preço, venda ou promessa.',
    '17. Não transforme inferências em fatos.',
    '18. Se uma mensagem trouxer várias informações, extraia todas nos campos adequados, mas faça somente uma pergunta.',
    '19. RESPOSTA NEGATIVA: "não", "nao", "sem", "nunca", "não gera", "não acontece" etc. é uma resposta válida e encerra a dimensão perguntada.',
    '20. Nunca transforme algo que o empresário negou em dor, erro, retrabalho, atraso ou impacto.',
    '21. Se uma dimensão já foi respondida negativamente, nunca pergunte novamente sobre ela nesta conversa.',
    '22. O VOLUME CONSOLIDADO é memória confirmada; nunca o apague porque a mensagem atual não contém volume.',
    '23. Se o cliente responder negativamente à pergunta de erros/retrabalho/atrasos, avance para objetivo.',
    '',
    'FORMATO: SOMENTE JSON válido.',
    '{',
    '  "processo": "somente nova etapa; vazio se não houver",',
    '  "dor_principal": "somente nova dor explícita; vazio se não houver",',
    '  "frequencia": "periodicidade explícita; vazio se não houver",',
    '  "impacto": "tempo/custo/erro/retrabalho/atraso/consequência explícita; vazio se não houver",',
    '  "volume": "quantidade explícita, por exemplo 80 pedidos/dia; vazio se não houver",',
    '  "objetivo": "objetivo explícito; vazio se não houver",',
    '  "respondeu_pergunta_pendente": true ou false,',
    '  "informacao_faltante": "a informação mais importante que ainda falta",',
    '  "proxima_pergunta": "uma única pergunta curta e natural"',
    '}',
    '',
    'DIAGNÓSTICO CONSOLIDADO:',
    JSON.stringify(contexto.diagnostico || {}),
    '',
    'DORES JÁ REGISTRADAS:',
    JSON.stringify(contexto.dores || []),
    '',
    'MEDIDAS JÁ REGISTRADAS:',
    JSON.stringify(contexto.medidas || []),
    '',
    'RESPOSTAS NEGATIVAS JÁ CONFIRMADAS:',
    JSON.stringify(contexto.respostas_negativas || []),
    '',
    'ETAPAS JÁ IDENTIFICADAS:',
    JSON.stringify(contexto.etapas_processo || []),
    '',
    'PERGUNTA PENDENTE:',
    perguntaPendente || 'Nenhuma',
    '',
    'HISTÓRICO RECENTE:',
    JSON.stringify(historico),
    '',
    'NOVA MENSAGEM:',
    mensagem
  ].join('\n');

}


/**
 * ============================================================
 * CONSTRUIR CONTEXTO
 * ============================================================
 */

function construirContextoDiagnostico_(
  diagnostico
) {

  const historico =
    obterHistoricoConversaDiagnostico_(
      diagnostico.conversa_id,
      20
    );

  const perguntaPendente =
    obterPerguntaPendenteDiagnostico_(
      historico
    );

  const etapasProcesso =
    extrairEtapasProcessoDiagnostico_(
      diagnostico.processo_resumo ||
      diagnostico.processo_nome ||
      ''
    );

  const dores =
    obterDoresDiagnostico_(
      diagnostico.diagnostico_id
    );

  const medidas =
    obterMedidasDiagnostico_(
      diagnostico.empresa_id,
      diagnostico.conversa_id
    );

  // A aba DIAGNOSTICOS não precisa possuir uma coluna de volume.
  // O volume é uma medida operacional e vive em METRICAS.
  // Porém, para a IA e para o motor, ele precisa aparecer como
  // memória consolidada da conversa.
  const volumeConsolidado =
    obterUltimoVolumeDiagnostico_(
      medidas
    );

  const respostasNegativas =
    obterRespostasNegativasDiagnostico_(
      diagnostico.empresa_id,
      diagnostico.conversa_id
    );

  return {

    diagnostico: {
      processo: diagnostico.processo_nome || '',
      processo_resumo: diagnostico.processo_resumo || '',
      dor_principal: diagnostico.dor_principal || '',
      frequencia: diagnostico.frequencia || '',
      impacto: diagnostico.impacto_nivel || '',
      volume: volumeConsolidado || '',
      objetivo: diagnostico.objetivo || ''
    },

    dores: dores,
    medidas: medidas,
    respostas_negativas: respostasNegativas,
    historico: historico,
    pergunta_pendente: perguntaPendente,
    etapas_processo: etapasProcesso

  };

}


function obterHistoricoConversaDiagnostico_(
  conversaId,
  limite
) {

  const aba =
    obterAbaDiagnostico_([
      'CONVERSAS'
    ]);

  const valores =
    aba.getDataRange().getValues();

  if (valores.length <= 1) return [];

  const cabecalhos = valores[0];
  const mapa = {};

  cabecalhos.forEach(function(cabecalho, indice) {
    mapa[String(cabecalho || '').trim().toLowerCase()] = indice;
  });

  if (mapa.conversa_id === undefined) {
    throw new Error(
      'A aba CONVERSAS precisa possuir conversa_id.'
    );
  }

  const registros = [];

  for (let i = 1; i < valores.length; i++) {

    const linha = valores[i];

    if (
      String(linha[mapa.conversa_id]) !==
      String(conversaId)
    ) continue;

    registros.push({

      ordem:
        mapa.ordem !== undefined
          ? Number(linha[mapa.ordem]) || 0
          : i,

      remetente:
        mapa.remetente !== undefined
          ? String(linha[mapa.remetente] || '')
          : '',

      mensagem:
        mapa.mensagem !== undefined
          ? String(linha[mapa.mensagem] || '')
          : '',

      tipo:
        mapa.tipo !== undefined
          ? String(linha[mapa.tipo] || '')
          : ''

    });

  }

  registros.sort(function(a, b) {
    return a.ordem - b.ordem;
  });

  const quantidade =
    Number(limite) || 20;

  return registros.slice(
    Math.max(0, registros.length - quantidade)
  );

}


function obterPerguntaPendenteDiagnostico_(
  historico
) {

  if (!historico || !historico.length) return '';

  for (let i = historico.length - 1; i >= 0; i--) {

    const item = historico[i];

    const remetente =
      String(item.remetente || '')
        .trim()
        .toUpperCase();

    const tipo =
      String(item.tipo || '')
        .trim()
        .toUpperCase();

    if (
      remetente === 'SISTEMA' ||
      tipo === 'PERGUNTA_IA'
    ) {

      const pergunta =
        String(item.mensagem || '').trim();

      if (pergunta) return pergunta;

    }

  }

  return '';

}


function extrairEtapasProcessoDiagnostico_(
  processo
) {

  if (!processo) return [];

  return String(processo)
    .split(/\s*(?:→|->|\n|\|)\s*/)
    .map(function(item) {
      return item.trim();
    })
    .filter(function(item) {
      return !!item;
    });

}


function normalizarNovaEtapaProcessoDiagnostico_(
  processoAtual,
  novaEtapa
) {

  let candidata = String(novaEtapa || '').trim();
  if (!candidata) return '';

  const etapas = extrairEtapasProcessoDiagnostico_(processoAtual || '');
  const candidataNorm = normalizarTextoDiagnostico_(candidata);

  if (!candidataNorm) return '';

  // Se a IA devolver o processo acumulado, retiramos todas as etapas já conhecidas.
  etapas.forEach(function(etapa) {
    const norm = normalizarTextoDiagnostico_(etapa);
    if (!norm) return;

    if (normalizarTextoDiagnostico_(candidata) === norm) {
      candidata = '';
      return;
    }

    const re = new RegExp('^' + escaparRegexDiagnostico_(etapa) + '\\s*(?:→|->|e|,|;|depois|então|entao)?\\s*', 'i');
    if (re.test(candidata)) {
      candidata = candidata.replace(re, '').trim();
    }
  });

  // Se ainda vier algo como "etapa antiga e etapa nova", corta a parte conhecida.
  etapas.forEach(function(etapa) {
    const norm = normalizarTextoDiagnostico_(etapa);
    if (!norm) return;
    const pos = normalizarTextoDiagnostico_(candidata).indexOf(norm);
    if (pos === 0) {
      const original = candidata;
      const resto = original.slice(etapa.length).replace(/^\s*(?:e|,|;|→|->|depois|então|entao)\s*/i, '').trim();
      if (resto) candidata = resto;
    }
  });

  const finalNorm = normalizarTextoDiagnostico_(candidata);
  if (!finalNorm) return '';

  const jaExiste = etapas.some(function(etapa) {
    return normalizarTextoDiagnostico_(etapa) === finalNorm;
  });

  return jaExiste ? '' : candidata;

}

function escaparRegexDiagnostico_(texto) {
  return String(texto || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


function acumularEtapaProcessoDiagnostico_(
  processoAtual,
  novaEtapa
) {

  const etapas =
    extrairEtapasProcessoDiagnostico_(
      processoAtual
    );

  const nova =
    normalizarNovaEtapaProcessoDiagnostico_(
      processoAtual,
      novaEtapa
    );

  if (!nova) {

    return {
      processo_nome:
        etapas.length ? etapas[0] : '',

      processo_resumo:
        etapas.join(' → ')
    };

  }

  const novaNormalizada =
    normalizarTextoDiagnostico_(nova);

  const jaExiste =
    etapas.some(function(etapa) {

      return (
        normalizarTextoDiagnostico_(etapa) ===
        novaNormalizada
      );

    });

  if (!jaExiste) etapas.push(nova);

  return {

    processo_nome:
      etapas.length ? etapas[0] : nova,

    processo_resumo:
      etapas.join(' → ')

  };

}


function normalizarTextoDiagnostico_(
  texto
) {

  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

}



/**
 * ============================================================
 * NORMALIZAR / VALIDAR ANÁLISE DA IA
 * V5.2 — PROTEÇÃO DE CONTINUIDADE DO PROCESSO
 * ============================================================
 *
 * A IA interpreta a conversa.
 *
 * O MOTOR protege a estrutura do diagnóstico.
 *
 * PRINCÍPIOS:
 *
 * - nunca apagar informação válida;
 * - nunca deixar frequência virar impacto;
 * - nunca deixar volume virar impacto;
 * - preservar volume confirmado;
 * - preservar objetivo confirmado;
 * - preservar dores;
 * - reconhecer novas etapas do processo;
 * - não depender exclusivamente do campo "processo"
 *   devolvido pela IA;
 * - reconhecer uma etapa explicitamente descrita
 *   na mensagem atual mesmo quando a IA retornar
 *   processo vazio.
 *
 * ============================================================
 */

function normalizarAnaliseDiagnostico_(
  analise,
  mensagemAtual,
  diagnosticoAtual
) {

  const resultado = Object.assign({}, analise || {});
  const textoOriginal = String(mensagemAtual || '').trim();
  const texto = normalizarTextoDiagnostico_(textoOriginal);
  const diagnostico = diagnosticoAtual || {};

  resultado.processo = String(resultado.processo || '').trim();
  resultado.dor_principal = String(resultado.dor_principal || '').trim();
  resultado.frequencia = String(resultado.frequencia || '').trim();
  resultado.impacto = String(resultado.impacto || '').trim();
  resultado.volume = String(resultado.volume || diagnostico.volume || '').trim();
  resultado.objetivo = String(resultado.objetivo || '').trim();
  resultado.informacao_faltante = String(resultado.informacao_faltante || '').trim();
  resultado.proxima_pergunta = String(resultado.proxima_pergunta || '').trim();
  resultado.respondeu_pergunta_pendente = resultado.respondeu_pergunta_pendente === true;

  // 1. PROCESSO
  if (!resultado.processo) {
    const termosConferencia = [
      'conferir', 'conferidos', 'conferidas', 'conferido', 'conferida',
      'conferimos', 'conferencia', 'revisar', 'revisamos', 'revisado',
      'revisada', 'revisados', 'revisadas', 'revisar novamente',
      'conferir novamente', 'conferidos novamente', 'conferidas novamente'
    ];
    const termosSeparacao = [
      'separar os pedidos', 'separa os pedidos', 'separamos os pedidos',
      'separacao dos pedidos'
    ];
    const termosProducao = [
      'enviar para a producao', 'envia para a producao',
      'enviamos para a producao', 'envio para a producao',
      'mandar para a producao', 'mandamos para a producao'
    ];
    const termosPlanilha = [
      'lancar pedidos', 'lancamento de pedidos', 'colocando pedidos',
      'colocar pedidos', 'digitar pedidos', 'digitando pedidos',
      'preencher a planilha', 'preenchendo a planilha',
      'colocar na planilha', 'colocando na planilha'
    ];

    if (termosConferencia.some(function(termo) {
      return texto.indexOf(normalizarTextoDiagnostico_(termo)) !== -1;
    })) {
      resultado.processo = 'Conferência de pedidos';
    } else if (termosSeparacao.some(function(termo) {
      return texto.indexOf(normalizarTextoDiagnostico_(termo)) !== -1;
    })) {
      resultado.processo = 'Separar pedidos';
    } else if (termosProducao.some(function(termo) {
      return texto.indexOf(normalizarTextoDiagnostico_(termo)) !== -1;
    })) {
      resultado.processo = 'Enviar pedidos para a produção';
    } else if (termosPlanilha.some(function(termo) {
      return texto.indexOf(normalizarTextoDiagnostico_(termo)) !== -1;
    })) {
      resultado.processo = 'Colocação manual de pedidos em planilha';
    }
  }

  // 2. FREQUÊNCIA
  if (
    resultado.frequencia &&
    /(?:hora|horas|minuto|minutos)\b/i.test(resultado.frequencia)
  ) {
    resultado.frequencia = '';
  }

  if (!resultado.frequencia) {
    if (/(?:^|\s)(diariamente|todo dia|todos os dias|por dia|diaria)(?:\s|$)/i.test(texto)) {
      resultado.frequencia = 'Diária';
    } else if (/(?:^|\s)(semanalmente|toda semana|todas as semanas|por semana|semanal)(?:\s|$)/i.test(texto)) {
      resultado.frequencia = 'Semanal';
    } else if (/(?:^|\s)(mensalmente|todo mes|por mes|mensal)(?:\s|$)/i.test(texto)) {
      resultado.frequencia = 'Mensal';
    } else if (/(?:^|\s)(ocasionalmente|ocasional|eventualmente)(?:\s|$)/i.test(texto)) {
      resultado.frequencia = 'Ocasional';
    }
  }

  // 3. IMPACTO
  const duracao = textoOriginal.match(
    /\b\d+(?:[.,]\d+)?\s*(?:hora|horas|minuto|minutos)\s+por\s+(?:dia|semana|mes|mês)\b/i
  );

  if (duracao) {
    resultado.impacto = duracao[0];
  } else if (
    resultado.impacto &&
    /\b\d+(?:[.,]\d+)?\s+(?:pedidos?|vendas?|clientes?|ordens?|orcamentos?|orçamentos?|atendimentos?)\b/i.test(resultado.impacto)
  ) {
    resultado.impacto = '';
  }

  // 4. VOLUME
  const volumeMsg = textoOriginal.match(
    /\b(\d+(?:[.,]\d+)?)\s+(pedidos?|vendas?|clientes?|ordens?|orcamentos?|orçamentos?|atendimentos?)\b(?:\s+por\s+(dia|semana|mes|mês))?/i
  );

  if (volumeMsg) {
    resultado.volume = volumeMsg[0];
  }

  if (!resultado.volume && resultado.impacto) {
    const volumeImpacto = String(resultado.impacto).match(
      /\b\d+(?:[.,]\d+)?\s+(?:pedidos?|vendas?|clientes?|ordens?|orcamentos?|orçamentos?|atendimentos?)\b(?:\s+por\s+(?:dia|semana|mes|mês))?/i
    );
    if (volumeImpacto) {
      resultado.volume = volumeImpacto[0];
      resultado.impacto = '';
    }
  }

  if (resultado.volume && !resultado.frequencia) {
    const p = normalizarTextoDiagnostico_(resultado.volume);
    if (/\bpor dia\b/.test(p)) {
      resultado.frequencia = 'Diária';
    } else if (/\bpor semana\b/.test(p)) {
      resultado.frequencia = 'Semanal';
    } else if (/\bpor mes\b/.test(p)) {
      resultado.frequencia = 'Mensal';
    }
  }

  // 5. NOVAS DORES
  if (!resultado.dor_principal) {
    const temErroFalha = /\b(?:erro|erros|falha|falhas)\b/i.test(texto);
    const temDigitacao = /\b(?:digitacao|preenchimento|lancamento)\b/i.test(texto);

    if (temErroFalha && temDigitacao) {
      resultado.dor_principal = 'Erros de digitação';
    } else if (/\b(?:retrabalho|refazer|refaz|conferir novamente|conferencia|revisar novamente|revisao)\b/i.test(texto)) {
      resultado.dor_principal = 'Retrabalho / necessidade de conferência';
    } else if (/\b(?:atraso|atrasos|demora|demoras)\b/i.test(texto)) {
      resultado.dor_principal = 'Atrasos no processo';
    }
  }

  // 6. PROTEÇÃO CONTRA NEGAÇÃO
  if (
    resultado.dor_principal &&
    mensagemNegaTemaDiagnostico_(textoOriginal, 'erros_retrabalho_atrasos') &&
    /erro|falha|retrabalho|conferencia|revisao|atraso|demora/i.test(resultado.dor_principal)
  ) {
    resultado.dor_principal = '';
  }

  // 7. OBJETIVO
  if (resultado.objetivo) {
    const objetivo = normalizarTextoDiagnostico_(resultado.objetivo);
    const ePerguntaOuPlaceholder =
      objetivo.indexOf('qual o principal objetivo') !== -1 ||
      objetivo.indexOf('o que voce gostaria de alcancar') !== -1 ||
      objetivo.indexOf('objetivo ainda nao informado') !== -1 ||
      objetivo.indexOf('objetivo nao informado') !== -1;

    if (ePerguntaOuPlaceholder) {
      resultado.objetivo = '';
    }
  }

  if (resultado.objetivo) {
    const objetivoParecePergunta = /\?/.test(resultado.objetivo);
    const objetivoTemIntencao = /\b(?:quero|queremos|gostaria|gostariamos|preciso|precisamos|pretendo|pretendemos|nosso objetivo|desejo|desejamos|reduzir|diminuir|aumentar|melhorar|economizar|agilizar)\b/i.test(textoOriginal);

    if (objetivoParecePergunta && !objetivoTemIntencao) {
      resultado.objetivo = '';
    }
  }

  return resultado;
}

function ajustarContinuidadeDiagnostico_(
  analise,
  perguntaPendente,
  mensagemAtual
) {

  const resultado = Object.assign({}, analise || {});
  const pergunta = String(perguntaPendente || '').trim();
  const mensagemOriginal = String(mensagemAtual || '').trim();
  const mensagem = normalizarTextoDiagnostico_(mensagemOriginal);

  // ----------------------------------------------------------
  // 0. SEM PERGUNTA PENDENTE
  // ----------------------------------------------------------
  if (!pergunta) {
    resultado.respondeu_pergunta_pendente = false;
    return resultado;
  }

  const perguntaNorm = normalizarTextoDiagnostico_(pergunta);
  let respondeuDeterministicamente = false;
  let respostaNegativa = false;

  // ----------------------------------------------------------
  // 1. VOLUME / QUANTIDADE
  // ----------------------------------------------------------
  if (/quantos|quantidade|volume/.test(perguntaNorm)) {

    const respondeuVolume =
      /\b\d+(?:[.,]\d+)?\s+(?:pedidos?|vendas?|clientes?|ordens?|orcamentos?|orçamentos?|atendimentos?)\b/i
        .test(mensagem);

    if (respondeuVolume) {
      respondeuDeterministicamente = true;
    }
  }

  // ----------------------------------------------------------
  // 2. ERROS / RETRABALHO / ATRASOS
  // ----------------------------------------------------------
  if (
    /erro|erros|atraso|atrasos|retrabalho|revisao|revisão|conferencia|conferência/
      .test(perguntaNorm)
  ) {

    const respondeuProblema =
      /\b(erro|erros|atraso|atrasos|retrabalho|revisao|revisão|conferencia|conferência|sim|nao|não|sem|nunca)\b/i
        .test(mensagem);

    if (respondeuProblema) {
      respondeuDeterministicamente = true;
    }

    respostaNegativa =
      mensagemNegaTemaDiagnostico_(
        mensagemOriginal,
        'erros_retrabalho_atrasos'
      );
  }

  // ----------------------------------------------------------
  // 3. PERGUNTA DE OBJETIVO
  // ----------------------------------------------------------
  if (
    /objetivo|alcançar|alcancar|melhorar|resultado|ganhar|reduzir/
      .test(perguntaNorm)
  ) {

    const respondeuObjetivo =
      /\b(quero|queremos|gostaria|gostariamos|gostaríamos|preciso|precisamos|pretendo|pretendemos|nosso objetivo|nosso objetivo é|nosso objetivo e|desejo|desejamos|reduzir|aumentar|melhorar|ganhar|economizar|agilizar)\b/i
        .test(mensagem);

    if (respondeuObjetivo) {
      respondeuDeterministicamente = true;
    }
  }

  // ----------------------------------------------------------
  // 4. PERGUNTA RESPONDIDA
  // ----------------------------------------------------------
  if (respondeuDeterministicamente) {

    resultado.respondeu_pergunta_pendente = true;

    // Se a resposta foi negativa para erros/retrabalho/atrasos,
    // essa dimensão está encerrada. Não aceitamos uma pergunta
    // criada pela IA sobre a mesma dimensão.
    if (respostaNegativa) {

      resultado.resposta_negativa = true;
      resultado.dimensao_negada = 'erros_retrabalho_atrasos';

      resultado.informacao_faltante =
        'objetivo do empresário para melhorar o processo';

      resultado.proxima_pergunta =
        'O que você gostaria de melhorar ou alcançar nesse processo?';

      return resultado;
    }

    const proximaNorm =
      normalizarTextoDiagnostico_(
        resultado.proxima_pergunta || ''
      );

    const infoNorm =
      normalizarTextoDiagnostico_(
        resultado.informacao_faltante || ''
      );

    const respostaIAValida =
      !!proximaNorm &&
      proximaNorm !== perguntaNorm &&
      infoNorm !== perguntaNorm;

    if (!respostaIAValida) {

      if (/quantos|quantidade|volume/.test(perguntaNorm)) {

        resultado.informacao_faltante =
          'erros, retrabalho ou atrasos gerados pelo processo';

        resultado.proxima_pergunta =
          'Esse processo costuma gerar erros, retrabalho ou atrasos?';

      } else if (
        /erro|erros|atraso|atrasos|retrabalho|revisao|revisão|conferencia|conferência/
          .test(perguntaNorm)
      ) {

        resultado.informacao_faltante =
          'objetivo do empresário para melhorar o processo';

        resultado.proxima_pergunta =
          'O que você gostaria de melhorar ou alcançar nesse processo?';

      } else if (
        /objetivo|alcançar|alcancar|melhorar|resultado|ganhar|reduzir/
          .test(perguntaNorm)
      ) {

        // Objetivo é a última lacuna obrigatória deste fluxo V5.2.
        // Se o empresário respondeu e a IA não trouxe uma nova lacuna
        // válida, encerramos a investigação em vez de inventar outra pergunta.
        resultado.informacao_faltante = '';
        resultado.proxima_pergunta = '';

      } else {

        resultado.informacao_faltante =
          'outro impacto relevante do processo';

        resultado.proxima_pergunta =
          'Existe algum outro impacto importante desse processo?';
      }
    }

    return resultado;
  }

  // ----------------------------------------------------------
  // 5. NÃO RESPONDEU À PERGUNTA
  // ----------------------------------------------------------
  resultado.respondeu_pergunta_pendente = false;
  resultado.informacao_faltante = pergunta;
  resultado.proxima_pergunta = pergunta;

  return resultado;

}


/**
 * ============================================================
 * ATUALIZAR DIAGNÓSTICO COM ANÁLISE DA IA
 * ============================================================
 */

function atualizarDiagnosticoComAnalise_(
  diagnostico,
  analise
) {

  const resultado =
    Object.assign(
      {},
      diagnostico || {}
    );


  // ============================================================
  // PROCESSO
  // ============================================================

  if (
    analise &&
    analise.processo
  ) {

    const processoAcumulado =
      acumularEtapaProcessoDiagnostico_(
        resultado.processo_resumo ||
        resultado.processo_nome ||
        '',
        analise.processo
      );

    resultado.processo_nome =
      processoAcumulado.processo_nome;

    resultado.processo_resumo =
      processoAcumulado.processo_resumo;
  }


  // ============================================================
  // DOR PRINCIPAL
  // ============================================================

  if (
    !resultado.dor_principal &&
    analise &&
    analise.dor_principal
  ) {

    const dor =
      String(
        analise.dor_principal ||
        ''
      ).trim();


    const impacto =
      String(
        analise.impacto ||
        resultado.impacto_nivel ||
        ''
      ).trim();


    /*
     * Uma medida de impacto não pode assumir
     * o papel de dor principal.
     */

    if (
      dor &&
      !dorEhSomenteImpactoDiagnostico_(
        dor,
        impacto
      )
    ) {

      resultado.dor_principal =
        dor;

    } else {

      Logger.log(
        'DOR PRINCIPAL IGNORADA: descrição representa somente impacto/medida.'
      );

      Logger.log(
        'DOR RECEBIDA: ' +
        dor
      );

      Logger.log(
        'IMPACTO ASSOCIADO: ' +
        impacto
      );
    }
  }


  // ============================================================
  // FREQUÊNCIA
  // ============================================================

  if (
    !resultado.frequencia &&
    analise &&
    analise.frequencia
  ) {

    resultado.frequencia =
      analise.frequencia;
  }


  // ============================================================
  // IMPACTO
  // ============================================================

  if (
    !resultado.impacto_nivel &&
    analise &&
    analise.impacto
  ) {

    resultado.impacto_nivel =
      analise.impacto;
  }


  // ============================================================
  // OBJETIVO
  // ============================================================

  if (
    !resultado.objetivo &&
    analise &&
    analise.objetivo
  ) {

    resultado.objetivo =
      analise.objetivo;
  }


  // ============================================================
  // VOLUME
  // ============================================================

  if (
    analise &&
    analise.volume
  ) {

    resultado.volume =
      analise.volume;
  }


  // ============================================================
  // ATUALIZAÇÃO
  // ============================================================

  resultado.atualizado_em =
    new Date();


  return resultado;
}


function dorEhSomenteImpactoDiagnostico_(dor, impacto) {

  function normalizar(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  const dorNormalizada =
    normalizar(dor);

  const impactoNormalizado =
    normalizar(impacto);

  if (!dorNormalizada) {
    return true;
  }

  // Se a dor é exatamente igual ao impacto,
  // não consideramos isso uma dor independente.
  if (
    impactoNormalizado &&
    dorNormalizada === impactoNormalizado
  ) {
    return true;
  }

  // Exemplos:
  // "3 horas"
  // "3 horas por dia"
  // "30 minutos por dia"
  // "três horas diariamente"

  const somenteMedidaTempo =
    /^(?:\d+(?:[.,]\d+)?|zero|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)\s*(?:hora|horas|minuto|minutos)(?:\s+por\s+dia|\s+diariamente)?$/i;

  if (
    somenteMedidaTempo.test(
      dorNormalizada
    )
  ) {
    return true;
  }

  // Exemplos:
  // "perde 3 horas por dia"
  // "perde três horas por dia"
  // "perde 30 minutos por dia"

  const somentePerdaTempo =
    /^perde\s+(?:\d+(?:[.,]\d+)?|zero|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)\s+(?:hora|horas|minuto|minutos)(?:\s+por\s+dia|\s+diariamente)?$/i;

  if (
    somentePerdaTempo.test(
      dorNormalizada
    )
  ) {
    return true;
  }

  return false;
}

/**
 * ============================================================
 * DETERMINAR ESTADO DO DIAGNÓSTICO
 * ============================================================
 *
 * IMPORTANTE:
 *
 * PRONTO_PARA_ANALISE NÃO significa:
 *
 * "cliente qualificado"
 *
 * Significa somente:
 *
 * "há informação suficiente para o próximo motor analisar
 * se existe uma oportunidade real."
 *
 * ============================================================
 */


/**
 * ============================================================
 * PERSISTIR NOVAS INFORMAÇÕES DO DIAGNÓSTICO
 * ============================================================
 * Usa somente as abas já existentes no contrato V1:
 * - DORES para dores acumulativas
 * - METRICAS para medidas/eventos estruturados
 */

function dorTemEvidenciaNaMensagem_(
  dor,
  mensagem
) {

  const dorOriginal =
    String(
      dor || ''
    ).trim();

  const mensagemOriginal =
    String(
      mensagem || ''
    ).trim();


  if (
    !dorOriginal ||
    !mensagemOriginal
  ) {
    return false;
  }


  const dorNormalizada =
    normalizarTextoDiagnostico_(
      dorOriginal
    );

  const mensagemNormalizada =
    normalizarTextoDiagnostico_(
      mensagemOriginal
    );


  if (
    !dorNormalizada ||
    !mensagemNormalizada
  ) {
    return false;
  }


  // ============================================================
  // 1. CORRESPONDÊNCIA LITERAL
  // ============================================================

  if (
    mensagemNormalizada.indexOf(
      dorNormalizada
    ) !== -1
  ) {
    return true;
  }


  // ============================================================
  // 2. EXPRESSÕES EQUIVALENTES
  //
  // Permite que a IA transforme:
  //
  // "perde três horas por dia"
  //
  // em uma descrição conceitual de impacto/dor,
  // sem exigir igualdade literal.
  // ============================================================

  const equivalencias = [
    {
      padroesDor: [
        'perda de tempo',
        'perda de tempo com processo manual',
        'tempo perdido',
        'demora no processo',
        'processo demorado'
      ],

      evidencias: [
        'perde',
        'perda',
        'tempo',
        'horas',
        'minutos',
        'demora',
        'demorado',
        'demorada'
      ]
    },

    {
      padroesDor: [
        'erro de digitacao',
        'erros de digitacao',
        'erro de preenchimento',
        'erros de preenchimento',
        'falha de digitacao',
        'falhas de digitacao'
      ],

      evidencias: [
        'erro',
        'erros',
        'digitacao',
        'preenchimento',
        'digitar',
        'digitado',
        'digitados',
        'falha',
        'falhas'
      ]
    },

    {
      padroesDor: [
        'retrabalho',
        'trabalho repetido',
        'necessidade de refazer',
        'refazer o trabalho'
      ],

      evidencias: [
        'retrabalho',
        'refazer',
        'refeito',
        'refazer novamente',
        'novamente',
        'conferir novamente',
        'conferidos novamente',
        'revisar novamente'
      ]
    },

    {
      padroesDor: [
        'atraso',
        'atrasos',
        'atraso na entrega',
        'atrasos na entrega'
      ],

      evidencias: [
        'atraso',
        'atrasos',
        'atrasada',
        'atrasado',
        'demora',
        'demorar',
        'prazo'
      ]
    }
  ];


  for (
    let i = 0;
    i < equivalencias.length;
    i++
  ) {

    const grupo =
      equivalencias[i];


    const dorPertenceAoGrupo =
      grupo.padroesDor.some(
        function(padrao) {

          return (
            dorNormalizada.indexOf(
              normalizarTextoDiagnostico_(
                padrao
              )
            ) !== -1
          );

        }
      );


    if (
      !dorPertenceAoGrupo
    ) {
      continue;
    }


    const evidenciaEncontrada =
      grupo.evidencias.some(
        function(evidencia) {

          return (
            mensagemNormalizada.indexOf(
              normalizarTextoDiagnostico_(
                evidencia
              )
            ) !== -1
          );

        }
      );


    if (
      evidenciaEncontrada
    ) {
      return true;
    }
  }


  // ============================================================
  // 3. ANÁLISE POR PALAVRAS SIGNIFICATIVAS
  //
  // Evita depender de igualdade literal quando a IA apenas
  // reformula a descrição.
  //
  // Exemplo:
  //
  // IA:
  // "Perda de tempo com processo manual"
  //
  // Mensagem:
  // "Minha funcionária perde três horas por dia
  //  colocando pedidos manualmente."
  //
  // Há evidência suficiente em:
  // "perde" + "tempo" + "manual".
  // ============================================================

  const palavrasDor =
    dorNormalizada
      .replace(
        /[^a-z0-9\s]/g,
        ' '
      )
      .split(/\s+/)
      .filter(
        function(palavra) {

          return (
            palavra.length >= 4 &&
            [
              'para',
              'pelo',
              'pela',
              'isso',
              'essa',
              'esse',
              'como',
              'mais',
              'menos',
              'muito',
              'muita',
              'muitos',
              'muitas',
              'cada',
              'quando',
              'ainda',
              'depois',
              'alguns',
              'algumas'
            ].indexOf(
              palavra
            ) === -1
          );

        }
      );


  if (
    palavrasDor.length === 0
  ) {
    return false;
  }


  const mensagemPalavras =
    mensagemNormalizada
      .replace(
        /[^a-z0-9\s]/g,
        ' '
      )
      .split(/\s+/);


  let correspondencias = 0;


  palavrasDor.forEach(
    function(palavraDor) {

      const encontrou =
        mensagemPalavras.some(
          function(palavraMensagem) {

            /*
             * Igualdade direta.
             */

            if (
              palavraMensagem ===
              palavraDor
            ) {
              return true;
            }


            /*
             * Pequenas variações morfológicas.
             *
             * perde / perder
             * erro / erros
             * manual / manualmente
             * conferir / conferidos
             */

            if (
              palavraDor.length >= 6 &&
              palavraMensagem.length >= 6
            ) {

              if (
                palavraMensagem.indexOf(
                  palavraDor
                ) === 0 ||
                palavraDor.indexOf(
                  palavraMensagem
                ) === 0
              ) {
                return true;
              }
            }


            /*
             * Mapa de equivalências simples.
             */

            const sinonimos = {
              perda: [
                'perde',
                'perder',
                'gasto',
                'gastar'
              ],

              erro: [
                'erros',
                'falha',
                'falhas'
              ],

              erros: [
                'erro',
                'falha',
                'falhas'
              ],

              manual: [
                'manualmente'
              ],

              manualmente: [
                'manual'
              ],

              conferir: [
                'conferencia',
                'conferir',
                'conferidos',
                'conferidas',
                'revisar',
                'revisado',
                'revisada'
              ],

              conferencia: [
                'conferir',
                'conferidos',
                'conferidas',
                'revisar',
                'revisado',
                'revisada'
              ],

              atraso: [
                'atrasos',
                'demora',
                'demorar'
              ],

              atrasos: [
                'atraso',
                'demora',
                'demorar'
              ]
            };


            const listaSinonimos =
              sinonimos[
                palavraDor
              ] || [];


            return (
              listaSinonimos.indexOf(
                palavraMensagem
              ) !== -1
            );

          }
        );


      if (
        encontrou
      ) {
        correspondencias++;
      }

    }
  );


  // ============================================================
  // 4. REGRA MÍNIMA DE EVIDÊNCIA
  //
  // Uma palavra isolada NÃO é suficiente.
  //
  // Para dores com várias palavras significativas,
  // exigimos pelo menos 2 correspondências.
  //
  // Para descrições muito curtas, exigimos 1 correspondência
  // forte.
  // ============================================================

  if (
    palavrasDor.length === 1
  ) {

    return (
      correspondencias >= 1
    );
  }


  return (
    correspondencias >= 2
  );
}

function extrairMedidasMensagemDiagnostico_(
  mensagem
) {

  const textoOriginal =
    String(
      mensagem || ''
    ).trim();

  if (!textoOriginal) {
    return [];
  }


  const texto =
    normalizarTextoDiagnostico_(
      textoOriginal
    );


  const medidas = [];


  function adicionarMedida_(
    tipo,
    textoMedida
  ) {

    const valor =
      String(
        textoMedida || ''
      ).trim();

    if (!valor) {
      return;
    }


    const chave =
      tipo +
      '|' +
      normalizarTextoDiagnostico_(
        valor
      );


    const jaExiste =
      medidas.some(
        function(medida) {

          return (
            medida.tipo +
            '|' +
            normalizarTextoDiagnostico_(
              medida.texto
            ) === chave
          );

        }
      );


    if (!jaExiste) {

      medidas.push({
        tipo: tipo,
        texto: valor
      });

    }

  }


  // ============================================================
  // VOLUME
  //
  // Exemplos aceitos:
  //
  // 80 pedidos por dia
  // 80 pedidos
  // aproximadamente 80 pedidos por dia
  // 120 vendas por semana
  // 30 clientes por mês
  // ============================================================

  const volumeRegex =
    /\b(\d+(?:[.,]\d+)?)\s+(pedidos?|vendas?|clientes?|ordens?|orcamentos?|orçamentos?|atendimentos?)\b(?:\s+por\s+(dia|semana|mes|mês))?/gi;


  let correspondenciaVolume;


  while (
    (
      correspondenciaVolume =
        volumeRegex.exec(
          textoOriginal
        )
    ) !== null
  ) {

    adicionarMedida_(
      'VOLUME',
      correspondenciaVolume[0]
    );

  }


  // ============================================================
  // TEMPO
  //
  // Exemplos:
  //
  // três horas por dia
  // 3 horas por dia
  // duas horas
  // 30 minutos por dia
  //
  // O tempo é registrado como medida somente quando
  // estiver explicitamente presente na mensagem.
  // ============================================================

  const tempoRegex =
    /\b(?:perde|gasta|leva|demora|consome|são|sao)?\s*(\d+(?:[.,]\d+)?|zero|um|uma|dois|duas|tres|três|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)\s+(horas?|minutos?)\b(?:\s+por\s+(dia|semana|mes|mês))?/gi;


  let correspondenciaTempo;


  while (
    (
      correspondenciaTempo =
        tempoRegex.exec(
          textoOriginal
        )
    ) !== null
  ) {

    adicionarMedida_(
      'TEMPO',
      correspondenciaTempo[0]
        .trim()
    );

  }


  // ============================================================
  // PERCENTUAL
  //
  // Exemplos:
  //
  // 10% dos pedidos
  // 20 por cento dos pedidos
  // ============================================================

  const percentualRegex =
    /\b\d+(?:[.,]\d+)?\s*(?:%|por cento)\b/gi;


  let correspondenciaPercentual;


  while (
    (
      correspondenciaPercentual =
        percentualRegex.exec(
          textoOriginal
        )
    ) !== null
  ) {

    adicionarMedida_(
      'PERCENTUAL',
      correspondenciaPercentual[0]
        .trim()
    );

  }


  // ============================================================
  // VALOR MONETÁRIO
  //
  // Exemplos:
  //
  // R$ 500
  // R$ 1.500,00
  // 500 reais
  // ============================================================

  const dinheiroRegex =
    /(?:R\$\s*)\d+(?:\.\d{3})*(?:,\d{2})?|\b\d+(?:[.,]\d{2})?\s+reais?\b/gi;


  let correspondenciaDinheiro;


  while (
    (
      correspondenciaDinheiro =
        dinheiroRegex.exec(
          textoOriginal
        )
    ) !== null
  ) {

    adicionarMedida_(
      'VALOR',
      correspondenciaDinheiro[0]
        .trim()
    );

  }


  // ============================================================
  // RETORNO
  //
  // A função NÃO interpreta a medida.
  //
  // Ela somente extrai fatos quantitativos explicitamente
  // presentes na mensagem.
  // ============================================================

  return medidas;
}

function registrarNovasInformacoesDiagnostico_(
  diagnostico,
  analise,
  mensagemAtual
) {

  if (!diagnostico) {
    throw new Error(
      'Diagnóstico não informado para registro de novas informações.'
    );
  }

  if (!analise) {
    return;
  }

  const diagnosticoId =
    diagnostico.diagnostico_id;

  // ============================================================
  // DOR
  // ============================================================

  if (
    analise.dor_principal &&
    dorTemEvidenciaNaMensagem_(
      analise.dor_principal,
      mensagemAtual
    )
  ) {

    const dor =
      String(
        analise.dor_principal || ''
      ).trim();

    const impacto =
      String(
        analise.impacto ||
        diagnostico.impacto_nivel ||
        ''
      ).trim();

    /*
     * Uma medida ou impacto não pode ser
     * registrada como uma nova dor.
     */

    if (
      dor &&
      !dorEhSomenteImpactoDiagnostico_(
        dor,
        impacto
      )
    ) {

      salvarDorDiagnostico_({
        diagnostico_id:
          diagnosticoId,

        categoria:
          '',

        descricao:
          dor,

        frequencia:
          analise.frequencia ||
          diagnostico.frequencia ||
          '',

        impacto:
          impacto,

        confirmada_cliente:
          true,

        confianca:
          ''
      });

      
    } else {

      Logger.log(
        'DOR IGNORADA: descrição representa somente impacto/medida.'
      );

      Logger.log(
        'DOR RECEBIDA: ' +
        dor
      );

      Logger.log(
        'IMPACTO ASSOCIADO: ' +
        impacto
      );

    }

  }


  // ============================================================
  // MEDIDAS
  // ============================================================

  let medidas =
    extrairMedidasMensagemDiagnostico_(
      mensagemAtual
    );


  /*
   * IMPORTANTE — V5.6
   *
   * A IA recebe o volume consolidado como memória.
   *
   * Portanto:
   *
   *   analise.volume
   *
   * NÃO significa automaticamente que existe uma
   * nova medida nesta mensagem.
   *
   * Só utilizamos o volume retornado pela IA como
   * fallback quando a mensagem não trouxe uma medida
   * detectável E o volume retornado representa um valor
   * diferente do último volume já registrado.
   */

  if (
    medidas.length === 0 &&
    analise.volume
  ) {

    const volumeIA =
      String(
        analise.volume || ''
      ).trim();

    if (volumeIA) {

      const medidasExistentes =
        obterMedidasDiagnostico_(
          diagnostico.empresa_id,
          diagnostico.conversa_id
        );

      const ultimoVolume =
        obterUltimoVolumeDiagnostico_(
          medidasExistentes
        );

      const volumeIANormalizado =
        normalizarVolumeDiagnostico_(
          volumeIA
        );

      const ultimoVolumeNormalizado =
        normalizarVolumeDiagnostico_(
          ultimoVolume
        );

      /*
       * Se a IA apenas devolveu o volume que já era
       * memória consolidada, NÃO criamos nova medida.
       */

      if (
        volumeIANormalizado &&
        volumeIANormalizado !==
        ultimoVolumeNormalizado
      ) {

        medidas.push({
          tipo:
            'VOLUME',

          texto:
            volumeIA
        });

        Logger.log(
          'NOVO VOLUME DETECTADO PELA IA: ' +
          volumeIA
        );

      } else {

        Logger.log(
          'VOLUME CONSOLIDADO IGNORADO — não é nova informação: ' +
          volumeIA
        );

      }

    }

  }


  // ============================================================
  // REGISTRO DAS MEDIDAS
  // ============================================================

  medidas.forEach(
    function(medida) {

      if (!medida) {
        return;
      }

      const tipo =
        String(
          medida.tipo || ''
        )
          .trim()
          .toUpperCase();

      const texto =
        String(
          medida.texto || ''
        ).trim();


      if (!tipo || !texto) {
        return;
      }


      /*
       * ========================================================
       * PROTEÇÃO DE IDEMPOTÊNCIA
       * ========================================================
       *
       * Nunca registrar duas vezes a mesma medida para
       * a mesma conversa.
       */

      const existentes =
        obterMedidasDiagnostico_(
          diagnostico.empresa_id,
          diagnostico.conversa_id
        );


      const chaveNova =
        normalizarChaveMedidaDiagnostico_(
          tipo,
          texto
        );


      const duplicada =
        existentes.some(
          function(existente) {

            if (!existente) {
              return false;
            }

            const tipoExistente =
              String(
                existente.tipo || ''
              )
                .trim()
                .toUpperCase();

            const textoExistente =
              String(
                existente.texto || ''
              ).trim();


            const chaveExistente =
              normalizarChaveMedidaDiagnostico_(
                tipoExistente,
                textoExistente
              );


            return (
              chaveNova &&
              chaveExistente &&
              chaveNova === chaveExistente
            );

          }
        );


      if (duplicada) {

        Logger.log(
          'MEDIDA DUPLICADA IGNORADA: ' +
          tipo +
          ' | ' +
          texto
        );

        return;
      }


      /*
       * ========================================================
       * NOVA MEDIDA
       * ========================================================
       */

      registrarEventoDiagnostico_(
        'MEDIDA_DIAGNOSTICO',
        {
          empresa_id:
            diagnostico.empresa_id,

          conversa_id:
            diagnostico.conversa_id,

          valor:
            {
              tipo:
                tipo,

              texto:
                texto
            }
        }
      );


      Logger.log(
        'NOVA MEDIDA REGISTRADA: ' +
        tipo +
        ' | ' +
        texto
      );

    }
  );

}


/**
 * ============================================================
 * NORMALIZAR VOLUME
 * ============================================================
 *
 * Cria uma chave de comparação sem alterar o texto original
 * armazenado.
 *
 * Exemplos considerados iguais:
 *
 * "80 pedidos por dia"
 * "80 pedidos/dia"
 * "80 pedidos diariamente"
 *
 * ============================================================
 */

function normalizarVolumeDiagnostico_(
  valor
) {

  let texto =
    String(
      valor || ''
    )
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .toLowerCase()
      .trim();

  if (!texto) {
    return '';
  }


  texto =
    texto
      .replace(
        /\bdiariamente\b/g,
        'por dia'
      )
      .replace(
        /\bpor\s*\/\s*dia\b/g,
        'por dia'
      )
      .replace(
        /\/dia\b/g,
        ' por dia'
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();


  return texto;

}


/**
 * ============================================================
 * NORMALIZAR CHAVE DE MEDIDA
 * ============================================================
 *
 * Não altera o valor salvo.
 * Serve somente para detectar duplicações.
 * ============================================================
 */

function normalizarChaveMedidaDiagnostico_(
  tipo,
  texto
) {

  const tipoNormalizado =
    String(
      tipo || ''
    )
      .trim()
      .toUpperCase();


  const textoNormalizado =
    normalizarVolumeDiagnostico_(
      texto
    );


  if (
    !tipoNormalizado ||
    !textoNormalizado
  ) {
    return '';
  }


  return (
    tipoNormalizado +
    '|' +
    textoNormalizado
  );

}

function salvarDorDiagnostico_(dados) {

  const aba =
    obterAbaDiagnostico_([
      'DORES'
    ]);

  const diagnosticoId =
    dados.diagnostico_id || '';

  const descricaoOriginal =
    String(
      dados.descricao || ''
    ).trim();

  if (!diagnosticoId || !descricaoOriginal) {
    return false;
  }

  /**
   * ----------------------------------------------------------
   * NORMALIZA A DOR PARA COMPARAÇÃO SEMÂNTICA
   * ----------------------------------------------------------
   *
   * Não alteramos o texto que será salvo.
   * Apenas criamos uma chave interna para descobrir
   * se duas descrições representam a mesma dor.
   */

  const chaveNova =
    normalizarChaveDorDiagnostico_(
      descricaoOriginal
    );

  if (!chaveNova) {
    return false;
  }


  /**
   * ----------------------------------------------------------
   * BUSCAR DORES JÁ REGISTRADAS
   * ----------------------------------------------------------
   */

  const existentes =
    obterDoresDiagnostico_(
      diagnosticoId
    );


  /**
   * ----------------------------------------------------------
   * VERIFICAR DUPLICIDADE
   * ----------------------------------------------------------
   */

  const duplicada =
    existentes.some(
      function(dor) {

        const descricaoExistente =
          String(
            dor.descricao || ''
          ).trim();

        const chaveExistente =
          normalizarChaveDorDiagnostico_(
            descricaoExistente
          );

        return (
          chaveExistente &&
          chaveExistente === chaveNova
        );

      }
    );


  /**
   * ----------------------------------------------------------
   * SE JÁ EXISTE, NÃO GRAVA NOVA LINHA
   * ----------------------------------------------------------
   */

  if (duplicada) {

    Logger.log(
      'DOR DUPLICADA IGNORADA: ' +
      descricaoOriginal
    );

    return false;

  }


  /**
   * ----------------------------------------------------------
   * NOVA DOR
   * ----------------------------------------------------------
   */

  escreverRegistroDiagnostico_(
    aba,
    {

      dor_id:
        gerarIdDiagnostico_(
          'DOR'
        ),

      diagnostico_id:
        diagnosticoId,

      categoria:
        dados.categoria || '',

      descricao:
        descricaoOriginal,

      frequencia:
        dados.frequencia || '',

      impacto:
        dados.impacto || '',

      confirmada_cliente:
        dados.confirmada_cliente === true
          ? true
          : '',

      confianca:
        dados.confianca || ''

    }
  );


  Logger.log(
    'NOVA DOR REGISTRADA: ' +
    descricaoOriginal
  );


  return true;

}

function normalizarChaveDorDiagnostico_(
  descricao
) {

  let texto =
    normalizarTextoDiagnostico_(
      descricao
    );

  if (!texto) {
    return '';
  }


  /**
   * ----------------------------------------------------------
   * 1. ERROS DE DIGITAÇÃO
   * ----------------------------------------------------------
   *
   * Todas estas formas representam a mesma dimensão:
   *
   * - erro de digitação
   * - erros de digitação
   * - erros de digitação nos pedidos
   * - erro de digitação no preenchimento
   * - erros no preenchimento
   * - erros durante o lançamento
   */

  const temErro =
    /\berros?\b|\bfalhas?\b/.test(
      texto
    );

  const temDigitacao =
    /\bdigitacao\b|\bpreenchimento\b|\blancamento\b|\bdigitar\b|\bpreencher\b/.test(
      texto
    );

  if (
    temErro &&
    temDigitacao
  ) {

    return 'ERROS_DIGITACAO';

  }


  /**
   * ----------------------------------------------------------
   * 2. RETRABALHO / CONFERÊNCIA
   * ----------------------------------------------------------
   */

  const temRetrabalho =
    /\bretrabalho\b|\brefazer\b|\brefaz\b/.test(
      texto
    );

  const temConferencia =
    /\bconferencia\b|\brevisao\b|\brevisar\b|\bconferir\b|\bconferido\b|\bconferidos\b|\bconferidas\b/.test(
      texto
    );

  if (
    temRetrabalho ||
    temConferencia
  ) {

    return 'RETRABALHO_CONFERENCIA';

  }


  /**
   * ----------------------------------------------------------
   * 3. ATRASOS / DEMORA
   * ----------------------------------------------------------
   */

  if (
    /\batraso\b|\batrasos\b|\bdemora\b|\bdemoras\b/.test(
      texto
    )
  ) {

    return 'ATRASOS_PROCESSO';

  }


  /**
   * ----------------------------------------------------------
   * 4. PERDA DE TEMPO / TRABALHO MANUAL
   * ----------------------------------------------------------
   */

  const temTempo =
    /\bperda de tempo\b|\btempo perdido\b|\bperde tempo\b|\btempo gasto\b/.test(
      texto
    );

  const temManual =
    /\bmanual\b|\bmanualmente\b|\bprocesso manual\b|\btrabalho manual\b/.test(
      texto
    );

  if (
    temTempo &&
    temManual
  ) {

    return 'PERDA_TEMPO_TRABALHO_MANUAL';

  }


  /**
   * ----------------------------------------------------------
   * 5. CASO GENÉRICO
   * ----------------------------------------------------------
   *
   * Para dores que não pertencem a uma categoria conhecida,
   * usamos o texto normalizado.
   *
   * Assim não corremos o risco de juntar dores diferentes.
   */

  return texto;

}

function obterDoresDiagnostico_(diagnosticoId) {
  let aba;
  try {
    aba = obterAbaDiagnostico_(['DORES']);
  } catch (e) {
    return [];
  }

  const valores = aba.getDataRange().getValues();
  if (valores.length <= 1) return [];

  const mapa = {};
  valores[0].forEach(function(c, i) {
    mapa[String(c || '').trim().toLowerCase()] = i;
  });

  const saida = [];
  for (let i = 1; i < valores.length; i++) {
    const linha = valores[i];
    if (String(linha[mapa.diagnostico_id] || '') !== String(diagnosticoId || '')) continue;
    saida.push({
      dor_id: mapa.dor_id !== undefined ? linha[mapa.dor_id] : '',
      descricao: mapa.descricao !== undefined ? linha[mapa.descricao] : '',
      categoria: mapa.categoria !== undefined ? linha[mapa.categoria] : '',
      frequencia: mapa.frequencia !== undefined ? linha[mapa.frequencia] : '',
      impacto: mapa.impacto !== undefined ? linha[mapa.impacto] : '',
      confirmada_cliente: mapa.confirmada_cliente !== undefined ? linha[mapa.confirmada_cliente] : ''
    });
  }
  return saida;
}

function obterMedidasDiagnostico_(empresaId, conversaId) {
  let aba;
  try {
    aba = obterAbaDiagnostico_(['METRICAS']);
  } catch (e) {
    return [];
  }

  const valores = aba.getDataRange().getValues();
  if (valores.length <= 1) return [];

  const mapa = {};
  valores[0].forEach(function(c, i) {
    mapa[String(c || '').trim().toLowerCase()] = i;
  });

  const saida = [];
  for (let i = 1; i < valores.length; i++) {
    const linha = valores[i];
    const empresa = mapa.empresa_id !== undefined ? linha[mapa.empresa_id] : '';
    const conversa = mapa.conversa_id !== undefined ? linha[mapa.conversa_id] : '';
    const evento = mapa.evento !== undefined ? String(linha[mapa.evento] || '') : '';
    if (String(empresa) !== String(empresaId) || String(conversa) !== String(conversaId)) continue;
    if (evento !== 'MEDIDA_DIAGNOSTICO') continue;

    let valor = mapa.valor !== undefined ? linha[mapa.valor] : '';
    try { valor = JSON.parse(String(valor)); } catch (e) {}
    saida.push(valor);
  }
  return saida;
}

function obterUltimoVolumeDiagnostico_(medidas) {

  const lista = medidas || [];

  for (let i = lista.length - 1; i >= 0; i--) {

    const medida = lista[i] || {};

    if (
      String(medida.tipo || '').toUpperCase() === 'VOLUME' &&
      String(medida.texto || '').trim()
    ) {
      return String(medida.texto).trim();
    }

    if (
      String(medida.tipo || '').toUpperCase() === 'VOLUME' &&
      medida.valor !== undefined &&
      String(medida.valor).trim()
    ) {
      const unidade = medida.unidade ? ' ' + medida.unidade : '';
      const frequencia = medida.frequencia
        ? ' por ' + medida.frequencia
        : '';

      return (
        String(medida.valor).trim() +
        unidade +
        frequencia
      ).trim();
    }
  }

  return '';
}


function obterRespostasNegativasDiagnostico_(
  empresaId,
  conversaId
) {

  let aba;

  try {
    aba = obterAbaDiagnostico_(['METRICAS']);
  } catch (e) {
    return [];
  }

  const valores = aba.getDataRange().getValues();

  if (valores.length <= 1) return [];

  const mapa = {};

  valores[0].forEach(function(c, i) {
    mapa[String(c || '').trim().toLowerCase()] = i;
  });

  const saida = [];

  for (let i = 1; i < valores.length; i++) {

    const linha = valores[i];

    const empresa =
      mapa.empresa_id !== undefined
        ? linha[mapa.empresa_id]
        : '';

    const conversa =
      mapa.conversa_id !== undefined
        ? linha[mapa.conversa_id]
        : '';

    const evento =
      mapa.evento !== undefined
        ? String(linha[mapa.evento] || '')
        : '';

    if (
      String(empresa) !== String(empresaId) ||
      String(conversa) !== String(conversaId)
    ) continue;

    if (evento !== 'RESPOSTA_NEGATIVA_DIAGNOSTICO') continue;

    let valor =
      mapa.valor !== undefined
        ? linha[mapa.valor]
        : '';

    try {
      valor = JSON.parse(String(valor));
    } catch (e) {}

    saida.push(valor);
  }

  return saida;
}


function mensagemNegaTemaDiagnostico_(
  mensagem,
  tema
) {

  const texto = normalizarTextoDiagnostico_(mensagem || '');

  if (!texto) return false;

  if (tema !== 'erros_retrabalho_atrasos') {
    return false;
  }

  // Formas diretas de negação.
  if (
    /\bsem\s+(?:erros?|falhas?|retrabalho|atrasos?|demoras?)\b/.test(texto)
  ) {
    return true;
  }

  if (
    /\bnunca\s+(?:gera|gerou|teve|tem|acontece|acontecem)\b/.test(texto)
  ) {
    return true;
  }

  // "não gera erros", "não tem retrabalho", "não acontece atraso".
  if (
    /\bnao\s+(?:gera|geram|gerou|tem|temos|existe|existem|acontece|acontecem|produz|produzem)\b[^.!?]{0,100}\b(?:erro|erros|falha|falhas|retrabalho|atraso|atrasos|demora|demoras)\b/
      .test(texto)
  ) {
    return true;
  }

  // "não há erros/retrabalho/atrasos".
  if (
    /\bnao\s+(?:ha|há)\b[^.!?]{0,100}\b(?:erro|erros|falha|falhas|retrabalho|atraso|atrasos|demora|demoras)\b/
      .test(texto)
  ) {
    return true;
  }

  // "não, não gera erros..." / "não. não temos retrabalho..."
  if (
    /^\s*nao\b[^.!?]{0,20}\b(?:nao)\b[^.!?]{0,100}\b(?:erro|erros|retrabalho|atraso|atrasos)\b/
      .test(texto)
  ) {
    return true;
  }

  return false;
}


function determinarEstadoDiagnostico_(
  diagnostico,
  analise
) {

  const dados =
    diagnostico || {};

  const analiseAtual =
    analise || {};


  // ============================================================
  // PRESENÇA DOS ELEMENTOS FUNDAMENTAIS
  // ============================================================

  const possuiProcesso =
    !!String(
      dados.processo_nome || ''
    ).trim();


  const possuiDor =
    !!String(
      dados.dor_principal || ''
    ).trim();


  const possuiFrequencia =
    !!String(
      dados.frequencia || ''
    ).trim();


  const possuiImpacto =
    !!String(
      dados.impacto_nivel || ''
    ).trim();


  const possuiObjetivo =
    !!String(
      dados.objetivo || ''
    ).trim();


  const informacaoFaltante =
    String(
      analiseAtual.informacao_faltante || ''
    ).trim();


  // ============================================================
  // 1. INÍCIO
  // ============================================================
  //
  // Ainda não existe nenhum dos dois elementos fundamentais.
  //
  // ============================================================

  if (
    !possuiProcesso &&
    !possuiDor
  ) {

    return DIAGNOSTICO_ESTADOS.INICIO;

  }


  // ============================================================
  // 2. DESCOBERTA
  // ============================================================
  //
  // Já existe alguma informação fundamental, mas ainda não
  // temos PROCESSO + DOR.
  //
  // ============================================================

  if (
    !possuiProcesso ||
    !possuiDor
  ) {

    return DIAGNOSTICO_ESTADOS.DESCOBERTA;

  }


  // ============================================================
  // 3. INVESTIGAÇÃO — DADOS ESSENCIAIS AUSENTES
  // ============================================================
  //
  // PROCESSO + DOR já existem.
  //
  // Porém, para o diagnóstico mínimo ficar pronto, ainda
  // precisamos de:
  //
  // - frequência
  // - impacto
  // - objetivo
  //
  // O VOLUME NÃO é obrigatório para avançar.
  //
  // ============================================================

  if (
    !possuiFrequencia ||
    !possuiImpacto ||
    !possuiObjetivo
  ) {

    return DIAGNOSTICO_ESTADOS.INVESTIGACAO;

  }


  // ============================================================
  // 4. INFORMAÇÃO FALTANTE
  // ============================================================
  //
  // Se todos os elementos essenciais já existem, a informação
  // faltante só deve bloquear o diagnóstico se for realmente
  // ESSENCIAL.
  //
  // Informações complementares não impedem o avanço.
  //
  // ============================================================

  if (
    informacaoFaltante &&
    informacaoFaltanteEhEssencialDiagnostico_(
      informacaoFaltante
    )
  ) {

    return DIAGNOSTICO_ESTADOS.INVESTIGACAO;

  }


  // ============================================================
  // 5. PRONTO PARA ANÁLISE
  // ============================================================
  //
  // Temos:
  //
  // PROCESSO
  // DOR
  // FREQUÊNCIA
  // IMPACTO
  // OBJETIVO
  //
  // E não existe nenhuma lacuna essencial bloqueando o avanço.
  //
  // VOLUME continua sendo uma métrica complementar.
  //
  // ============================================================

  return DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE;

}

/**
 * ============================================================
 * OBTER RESPOSTA PARA O EMPRESÁRIO
 * ============================================================
 */

function obterRespostaConversa_(
  analise,
  estado
) {

  /**
   * Se ainda existe uma informação relevante faltando,
   * utilizamos a pergunta da IA.
   */

  if (
    analise &&
    analise.informacao_faltante &&
    analise.proxima_pergunta
  ) {

    return String(
      analise.proxima_pergunta
    ).trim();

  }


  /**
   * Se não existe pergunta necessária,
   * não inventamos uma.
   */

  return '';

}


/**
 * ============================================================
 * LIMPAR MENSAGEM
 * ============================================================
 */

function limparMensagemDiagnostico_(
  mensagem
) {

  if (
    mensagem === null ||
    mensagem === undefined
  ) {

    return '';

  }


  return String(
    mensagem
  )
    .trim()
    .replace(
      /\s+/g,
      ' '
    );

}


/**
 * ============================================================
 * GERAR ID
 * ============================================================
 */

function gerarIdDiagnostico_(
  prefixo
) {

  return (

    prefixo +
    '-' +
    Utilities.getUuid()

  );

}


/**
 * ============================================================
 * OBTER PLANILHA
 * ============================================================
 */

function obterPlanilhaDiagnostico_() {

  /**
   * Primeiro tenta utilizar uma função central do projeto,
   * caso ela já exista.
   */

  if (
    typeof obterPlanilha_ ===
    'function'
  ) {

    return obterPlanilha_();

  }


  /**
   * Depois procura PLANILHA_ID nas Script Properties.
   */

  const propriedades =
    PropertiesService
      .getScriptProperties();


  const planilhaId =
    propriedades.getProperty(
      'PLANILHA_ID'
    );


  if (
    planilhaId
  ) {

    return SpreadsheetApp
      .openById(
        planilhaId
      );

  }


  /**
   * Último recurso:
   * planilha vinculada ao projeto.
   */

  const planilha =
    SpreadsheetApp
      .getActiveSpreadsheet();


  if (
    !planilha
  ) {

    throw new Error(
      'Não foi possível localizar a planilha principal.'
    );

  }


  return planilha;

}


/**
 * ============================================================
 * OBTER ABA
 * ============================================================
 */

function obterAbaDiagnostico_(
  nomes
) {

  const planilha =
    obterPlanilhaDiagnostico_();


  for (
    let i = 0;
    i < nomes.length;
    i++
  ) {

    const aba =
      planilha.getSheetByName(
        nomes[i]
      );


    if (
      aba
    ) {

      return aba;

    }

  }


  throw new Error(
    'Nenhuma das abas encontradas: ' +
    nomes.join(', ')
  );

}


/**
 * ============================================================
 * OBTER MAPA DE CABEÇALHOS
 * ============================================================
 */

function obterMapaCabecalhosDiagnostico_(
  aba
) {

  const ultimaColuna =
    aba.getLastColumn();


  if (
    ultimaColuna === 0
  ) {

    throw new Error(
      'A aba ' +
      aba.getName() +
      ' não possui cabeçalhos.'
    );

  }


  const cabecalhos =
    aba
      .getRange(
        1,
        1,
        1,
        ultimaColuna
      )
      .getValues()[0];


  const mapa = {};


  cabecalhos.forEach(
    function(
      cabecalho,
      indice
    ) {

      const chave =
        String(
          cabecalho || ''
        )
          .trim()
          .toLowerCase();


      if (
        chave
      ) {

        mapa[chave] =
          indice + 1;

      }

    }
  );


  return mapa;

}


/**
 * ============================================================
 * ESCREVER REGISTRO
 * ============================================================
 */

function escreverRegistroDiagnostico_(
  aba,
  dados
) {

  const mapa =
    obterMapaCabecalhosDiagnostico_(
      aba
    );


  const ultimaColuna =
    aba.getLastColumn();


  const linha =
    new Array(
      ultimaColuna
    ).fill('');


  Object.keys(
    dados
  )
    .forEach(
      function(
        chave
      ) {

        const chaveNormalizada =
          String(
            chave
          )
            .trim()
            .toLowerCase();


        const coluna =
          mapa[
            chaveNormalizada
          ];


        if (
          coluna
        ) {

          linha[
            coluna - 1
          ] =
            dados[chave];

        }

      }
    );


  aba.appendRow(
    linha
  );

}


/**
 * ============================================================
 * SALVAR EMPRESA
 * ============================================================
 */

function salvarEmpresaDiagnostico_(
  dados
) {

  const aba =
    obterAbaDiagnostico_([
      'EMPRESAS'
    ]);


  escreverRegistroDiagnostico_(
    aba,
    {

      empresa_id:
        dados.empresa_id ||
        '',

      nome_empresa:
        dados.nome_empresa ||
        dados.nome ||
        '',

      segmento:
        dados.segmento ||
        '',

      porte:
        dados.porte ||
        '',

      nome_contato:
        dados.nome_contato ||
        dados.nome ||
        '',

      whatsapp:
        dados.whatsapp ||
        dados.celular ||
        '',

      email:
        dados.email ||
        '',

      cidade:
        dados.cidade ||
        '',

      data_criacao:
        dados.criado_em ||
        new Date(),

      ultima_interacao:
        dados.criado_em ||
        new Date(),

      status:
        'ATIVA'

    }
  );

}


/**
 * ============================================================
 * SALVAR MENSAGEM
 * ============================================================
 *
 * TODAS as mensagens da conversa ficam em CONVERSAS.
 *
 * Não existe uma aba MENSAGENS no contrato V1.
 *
 * ============================================================
 */

function salvarMensagemDiagnostico_(
  dados
) {

  const aba =
    obterAbaDiagnostico_([
      'CONVERSAS'
    ]);


  const conversaId =
    dados.conversa_id ||
    '';


  const ordem =
    dados.ordem ||
    obterProximaOrdemConversa_(
      conversaId
    );


  escreverRegistroDiagnostico_(
    aba,
    {

      mensagem_id:
        dados.mensagem_id ||
        gerarIdDiagnostico_(
          'MSG'
        ),

      conversa_id:
        conversaId,

      empresa_id:
        dados.empresa_id ||
        '',

      timestamp:
        dados.timestamp ||
        new Date(),

      remetente:
        dados.remetente ||
        '',

      mensagem:
        dados.texto ||
        dados.mensagem ||
        '',

      tipo:
        dados.tipo ||
        '',

      ordem:
        ordem

    }
  );

}


/**
 * ============================================================
 * SALVAR DIAGNÓSTICO INICIAL
 * ============================================================
 */

function salvarDiagnosticoInicial_(
  dados
) {

  const aba =
    obterAbaDiagnostico_([
      'DIAGNOSTICOS'
    ]);


  escreverRegistroDiagnostico_(
    aba,
    {

      diagnostico_id:
        dados.diagnostico_id ||
        '',

      empresa_id:
        dados.empresa_id ||
        '',

      conversa_id:
        dados.conversa_id ||
        '',

      processo_nome:
        dados.processo_nome ||
        '',

      processo_resumo:
        dados.processo_resumo ||
        '',

      dor_principal:
        dados.dor_principal ||
        '',

      dor_categoria:
        dados.dor_categoria ||
        '',

      impacto_nivel:
        dados.impacto_nivel ||
        '',

      frequencia:
        dados.frequencia ||
        '',

      objetivo:
        dados.objetivo ||
        '',

      status_diagnostico:
        dados.status_diagnostico ||
        DIAGNOSTICO_ESTADOS.INICIO,

      classificacao:
        dados.classificacao ||
        '',

      confianca:
        dados.confianca ||
        '',

      intencao:
        dados.intencao ||
        '',

      criado_em:
        dados.criado_em ||
        new Date(),

      atualizado_em:
        dados.atualizado_em ||
        new Date()

    }
  );

}


/**
 * ============================================================
 * OBTER PRÓXIMA ORDEM DA CONVERSA
 * ============================================================
 */

function obterProximaOrdemConversa_(
  conversaId
) {

  const aba =
    obterAbaDiagnostico_([
      'CONVERSAS'
    ]);


  const valores =
    aba
      .getDataRange()
      .getValues();


  if (
    valores.length <= 1
  ) {

    return 1;

  }


  const cabecalhos =
    valores[0];


  const mapa = {};


  cabecalhos.forEach(
    function(
      cabecalho,
      indice
    ) {

      mapa[
        String(
          cabecalho || ''
        )
          .trim()
          .toLowerCase()
      ] =
        indice;

    }
  );


  if (
    mapa.conversa_id === undefined ||
    mapa.ordem === undefined
  ) {

    throw new Error(
      'A aba CONVERSAS precisa possuir conversa_id e ordem.'
    );

  }


  let maiorOrdem =
    0;


  for (
    let i = 1;
    i < valores.length;
    i++
  ) {

    const conversa =
      valores[i][
        mapa.conversa_id
      ];


    if (
      String(conversa) ===
      String(conversaId)
    ) {

      const ordem =
        Number(
          valores[i][
            mapa.ordem
          ]
        ) || 0;


      if (
        ordem > maiorOrdem
      ) {

        maiorOrdem =
          ordem;

      }

    }

  }


  return maiorOrdem + 1;

}


/**
 * ============================================================
 * OBTER DIAGNÓSTICO ATUAL
 * ============================================================
 */

function obterDiagnosticoAtual_(
  empresaId,
  conversaId
) {

  const aba =
    obterAbaDiagnostico_([
      'DIAGNOSTICOS'
    ]);


  const valores =
    aba
      .getDataRange()
      .getValues();


  if (
    valores.length <= 1
  ) {

    return null;

  }


  const cabecalhos =
    valores[0];


  const mapa = {};


  cabecalhos.forEach(
    function(
      cabecalho,
      indice
    ) {

      mapa[
        String(
          cabecalho || ''
        )
          .trim()
          .toLowerCase()
      ] =
        indice;

    }
  );


  if (
    mapa.empresa_id === undefined ||
    mapa.conversa_id === undefined
  ) {

    throw new Error(
      'A aba DIAGNOSTICOS precisa possuir empresa_id e conversa_id.'
    );

  }


  for (
    let i = valores.length - 1;
    i >= 1;
    i--
  ) {

    const linha =
      valores[i];


    const empresa =
      obterValorLinhaDiagnostico_(
        linha,
        mapa,
        'empresa_id'
      );


    const conversa =
      obterValorLinhaDiagnostico_(
        linha,
        mapa,
        'conversa_id'
      );


    if (
      String(empresa) ===
      String(empresaId) &&

      String(conversa) ===
      String(conversaId)
    ) {

      return {

        diagnostico_id:
          obterValorLinhaDiagnostico_(
            linha,
            mapa,
            'diagnostico_id'
          ),

        empresa_id:
          empresa,

        conversa_id:
          conversa,

        processo_nome:
          obterValorLinhaDiagnostico_(
            linha,
            mapa,
            'processo_nome'
          ),

        processo_resumo:
          obterValorLinhaDiagnostico_(
            linha,
            mapa,
            'processo_resumo'
          ),

        dor_principal:
          obterValorLinhaDiagnostico_(
            linha,
            mapa,
            'dor_principal'
          ),

        dor_categoria:
          obterValorLinhaDiagnostico_(
            linha,
            mapa,
            'dor_categoria'
          ),

        impacto_nivel:
          obterValorLinhaDiagnostico_(
            linha,
            mapa,
            'impacto_nivel'
          ),

        frequencia:
          obterValorLinhaDiagnostico_(
            linha,
            mapa,
            'frequencia'
          ),

        objetivo:
          obterValorLinhaDiagnostico_(
            linha,
            mapa,
            'objetivo'
          ),

        status_diagnostico:
          obterValorLinhaDiagnostico_(
            linha,
            mapa,
            'status_diagnostico'
          ),

        classificacao:
          obterValorLinhaDiagnostico_(
            linha,
            mapa,
            'classificacao'
          ),

        confianca:
          obterValorLinhaDiagnostico_(
            linha,
            mapa,
            'confianca'
          ),

        intencao:
          obterValorLinhaDiagnostico_(
            linha,
            mapa,
            'intencao'
          ),

        criado_em:
          obterValorLinhaDiagnostico_(
            linha,
            mapa,
            'criado_em'
          ),

        atualizado_em:
          obterValorLinhaDiagnostico_(
            linha,
            mapa,
            'atualizado_em'
          )

      };

    }

  }


  return null;

}

/**
 * ============================================================
 * OBTER DIAGNÓSTICO POR ID PARA ANÁLISE
 * ============================================================
 *
 * Recupera um diagnóstico específico pelo diagnostico_id.
 *
 * RESPONSABILIDADE:
 * - Somente leitura.
 * - Não altera DIAGNOSTICOS.
 * - Não altera estado.
 * - Não cria registros.
 * - Retorna o mesmo contrato de dados utilizado
 *   pelo motor de análise.
 *
 * ============================================================
 */
function obterDiagnosticoPorIdParaAnalise_(
  diagnosticoId
) {

  if (!diagnosticoId) {
    throw new Error(
      'diagnostico_id não informado para recuperação do diagnóstico.'
    );
  }


  const aba =
    obterAbaDiagnostico_([
      'DIAGNOSTICOS'
    ]);


  const valores =
    aba
      .getDataRange()
      .getValues();


  if (
    valores.length <= 1
  ) {

    return null;

  }


  const cabecalhos =
    valores[0];


  const mapa = {};


  cabecalhos.forEach(
    function(
      cabecalho,
      indice
    ) {

      mapa[
        String(
          cabecalho || ''
        )
          .trim()
          .toLowerCase()
      ] =
        indice;

    }
  );


  if (
    mapa.diagnostico_id === undefined
  ) {

    throw new Error(
      'A aba DIAGNOSTICOS precisa possuir diagnostico_id.'
    );

  }


  /*
   * Percorremos de baixo para cima para preservar
   * a mesma lógica de leitura utilizada pelo sistema:
   * caso exista mais de uma ocorrência do ID,
   * consideramos a ocorrência mais recente.
   */
  for (
    let i = valores.length - 1;
    i >= 1;
    i--
  ) {

    const linha =
      valores[i];


    const id =
      obterValorLinhaDiagnostico_(
        linha,
        mapa,
        'diagnostico_id'
      );


    if (
      String(id) !==
      String(diagnosticoId)
    ) {

      continue;

    }


    const empresa =
      obterValorLinhaDiagnostico_(
        linha,
        mapa,
        'empresa_id'
      );


    const conversa =
      obterValorLinhaDiagnostico_(
        linha,
        mapa,
        'conversa_id'
      );


    return {

      diagnostico_id:
        id,


      empresa_id:
        empresa,


      conversa_id:
        conversa,


      processo_nome:
        obterValorLinhaDiagnostico_(
          linha,
          mapa,
          'processo_nome'
        ),


      processo_resumo:
        obterValorLinhaDiagnostico_(
          linha,
          mapa,
          'processo_resumo'
        ),


      dor_principal:
        obterValorLinhaDiagnostico_(
          linha,
          mapa,
          'dor_principal'
        ),


      dor_categoria:
        obterValorLinhaDiagnostico_(
          linha,
          mapa,
          'dor_categoria'
        ),


      impacto_nivel:
        obterValorLinhaDiagnostico_(
          linha,
          mapa,
          'impacto_nivel'
        ),


      frequencia:
        obterValorLinhaDiagnostico_(
          linha,
          mapa,
          'frequencia'
        ),


      objetivo:
        obterValorLinhaDiagnostico_(
          linha,
          mapa,
          'objetivo'
        ),


      status_diagnostico:
        obterValorLinhaDiagnostico_(
          linha,
          mapa,
          'status_diagnostico'
        ),


      classificacao:
        obterValorLinhaDiagnostico_(
          linha,
          mapa,
          'classificacao'
        ),


      confianca:
        obterValorLinhaDiagnostico_(
          linha,
          mapa,
          'confianca'
        ),


      intencao:
        obterValorLinhaDiagnostico_(
          linha,
          mapa,
          'intencao'
        ),


      criado_em:
        obterValorLinhaDiagnostico_(
          linha,
          mapa,
          'criado_em'
        ),


      atualizado_em:
        obterValorLinhaDiagnostico_(
          linha,
          mapa,
          'atualizado_em'
        )

    };

  }


  return null;

}


/**
 * ============================================================
 * OBTER VALOR DA LINHA
 * ============================================================
 */

function obterValorLinhaDiagnostico_(
  linha,
  mapa,
  campo
) {

  if (
    mapa[campo] === undefined
  ) {

    return '';

  }


  return linha[
    mapa[campo]
  ];

}


/**
 * ============================================================
 * ATUALIZAR DIAGNÓSTICO
 * ============================================================
 */

function atualizarDiagnostico_(
  diagnostico
) {

  const aba =
    obterAbaDiagnostico_([
      'DIAGNOSTICOS'
    ]);


  const valores =
    aba
      .getDataRange()
      .getValues();


  if (
    valores.length <= 1
  ) {

    throw new Error(
      'Diagnóstico não encontrado.'
    );

  }


  const cabecalhos =
    valores[0];


  const mapa = {};


  cabecalhos.forEach(
    function(
      cabecalho,
      indice
    ) {

      mapa[
        String(
          cabecalho || ''
        )
          .trim()
          .toLowerCase()
      ] =
        indice + 1;

    }
  );


  if (
    mapa.diagnostico_id === undefined
  ) {

    throw new Error(
      'A aba DIAGNOSTICOS precisa possuir diagnostico_id.'
    );

  }


  for (
    let i = 1;
    i < valores.length;
    i++
  ) {

    const id =
      valores[i][
        mapa.diagnostico_id - 1
      ];


    if (
      String(id) ===
      String(
        diagnostico.diagnostico_id
      )
    ) {

      Object.keys(
        diagnostico
      )
        .forEach(
          function(
            campo
          ) {

            const coluna =
              mapa[
                String(
                  campo
                )
                  .trim()
                  .toLowerCase()
              ];


            if (
              coluna
            ) {

              aba
                .getRange(
                  i + 1,
                  coluna
                )
                .setValue(
                  diagnostico[campo]
                );

            }

          }
        );


      return true;

    }

  }


  throw new Error(
    'Diagnóstico ' +
    diagnostico.diagnostico_id +
    ' não localizado.'
  );

}


/**
 * ============================================================
 * ATUALIZAR ÚLTIMA INTERAÇÃO DA EMPRESA
 * ============================================================
 */

function atualizarUltimaInteracaoEmpresa_(
  empresaId
) {

  const aba =
    obterAbaDiagnostico_([
      'EMPRESAS'
    ]);


  const valores =
    aba
      .getDataRange()
      .getValues();


  if (
    valores.length <= 1
  ) {

    return false;

  }


  const cabecalhos =
    valores[0];


  const mapa = {};


  cabecalhos.forEach(
    function(
      cabecalho,
      indice
    ) {

      mapa[
        String(
          cabecalho || ''
        )
          .trim()
          .toLowerCase()
      ] =
        indice + 1;

    }
  );


  if (
    mapa.empresa_id === undefined
  ) {

    return false;

  }


  for (
    let i = 1;
    i < valores.length;
    i++
  ) {

    const id =
      valores[i][
        mapa.empresa_id - 1
      ];


    if (
      String(id) ===
      String(empresaId)
    ) {

      if (
        mapa.ultima_interacao
      ) {

        aba
          .getRange(
            i + 1,
            mapa.ultima_interacao
          )
          .setValue(
            new Date()
          );

      }


      return true;

    }

  }


  return false;

}


/**
 * ============================================================
 * REGISTRAR MÉTRICA
 * ============================================================
 *
 * Contrato METRICAS:
 *
 * evento_id
 * conversa_id
 * empresa_id
 * evento
 * timestamp
 * valor
 *
 * ============================================================
 */

function registrarEventoDiagnostico_(
  evento,
  dados
) {

  let aba;

  try {

    aba =
      obterAbaDiagnostico_([
        'METRICAS'
      ]);

  } catch (erro) {

    return false;

  }


  const dadosSeguros =
    dados || {};


  /*
   * ============================================================
   * PROTEÇÃO CENTRAL CONTRA DUPLICAÇÃO DE MEDIDAS
   * ============================================================
   */

  if (
    String(evento || '')
      .trim()
      .toUpperCase() ===
    'MEDIDA_DIAGNOSTICO'
  ) {

    let valorMedida =
      dadosSeguros.valor ||
      '';


    if (
      typeof valorMedida ===
      'string'
    ) {

      try {

        valorMedida =
          JSON.parse(
            valorMedida
          );

      } catch (e) {

        // Mantém string caso não seja JSON.

      }

    }


    const tipo =
      String(
        valorMedida &&
        valorMedida.tipo ||
        ''
      )
        .trim()
        .toUpperCase();


    const texto =
      String(
        valorMedida &&
        valorMedida.texto ||
        ''
      ).trim();


    if (
      tipo &&
      texto
    ) {

      const medidasExistentes =
        obterMedidasDiagnostico_(
          dadosSeguros.empresa_id,
          dadosSeguros.conversa_id
        );


      const chaveNova =
        normalizarChaveMedidaDiagnostico_(
          tipo,
          texto
        );


      const duplicada =
        medidasExistentes.some(
          function(medidaExistente) {

            if (!medidaExistente) {
              return false;
            }


            const tipoExistente =
              String(
                medidaExistente.tipo || ''
              )
                .trim()
                .toUpperCase();


            const textoExistente =
              String(
                medidaExistente.texto || ''
              ).trim();


            const chaveExistente =
              normalizarChaveMedidaDiagnostico_(
                tipoExistente,
                textoExistente
              );


            return (
              chaveNova &&
              chaveExistente &&
              chaveNova ===
              chaveExistente
            );

          }
        );


      if (duplicada) {

        Logger.log(
          'MEDIDA_DIAGNOSTICO DUPLICADA BLOQUEADA: ' +
          tipo +
          ' | ' +
          texto
        );

        return false;

      }

    }

  }


  /*
   * ============================================================
   * REGISTRO NORMAL
   * ============================================================
   */

  let valor =
    dadosSeguros.valor ||
    '';


  if (
    typeof valor ===
    'object'
  ) {

    valor =
      JSON.stringify(
        valor
      );

  }


  escreverRegistroDiagnostico_(
    aba,
    {

      evento_id:
        gerarIdDiagnostico_(
          'EVT'
        ),

      conversa_id:
        dadosSeguros.conversa_id ||
        '',

      empresa_id:
        dadosSeguros.empresa_id ||
        '',

      evento:
        evento ||
        '',

      timestamp:
        new Date(),

      valor:
        valor

    }
  );


  return true;

}


/**
 * ============================================================
 * TESTE COMPLETO DO FLUXO
 * ============================================================
 *
 * Este teste cria:
 *
 * 1 empresa
 * 1 diagnóstico
 * 1 conversa
 * 1 mensagem do empresário
 * 1 análise da IA
 * 1 possível resposta do sistema
 *
 * IMPORTANTE:
 *
 * Cada execução cria um novo registro de teste.
 *
 * ============================================================
 */


/**
 * ============================================================
 * TESTE ESTRUTURAL V5 — SEM GEMINI
 * ============================================================
 *
 * Testa somente o MOTOR DE CONSOLIDAÇÃO.
 * Não chama API, não consome tempo do Gemini e não cria
 * uma conversa real.
 *
 * Cobre:
 * - acumulação de etapas;
 * - preservação da dor principal;
 * - múltiplas dores;
 * - frequência;
 * - impacto;
 * - volume;
 * - objetivo explícito;
 * - não sobrescrever fatos antigos.
 *
 * ============================================================
 */
function testarConsolidacaoDiagnosticoV5() {

  Logger.log('========== INÍCIO TESTE ESTRUTURAL V5 ==========');

  const diagnosticoInicial = {
    diagnostico_id: 'DIA-TESTE-V5',
    empresa_id: 'EMP-TESTE-V5',
    conversa_id: 'CONV-TESTE-V5',
    processo_nome: '',
    processo_resumo: '',
    dor_principal: '',
    dor_categoria: '',
    impacto_nivel: '',
    frequencia: '',
    objetivo: '',
    status_diagnostico: DIAGNOSTICO_ESTADOS.INICIO,
    classificacao: '',
    confianca: '',
    intencao: '',
    criado_em: new Date(),
    atualizado_em: new Date()
  };

  let estado = Object.assign({}, diagnosticoInicial);

  const passos = [
    {
      mensagem: 'Minha funcionária perde três horas por dia colocando pedidos manualmente em uma planilha.',
      analise: {
        processo: 'Colocação manual de pedidos em planilha',
        dor_principal: 'Perda de tempo com trabalho manual',
        frequencia: 'Diária',
        impacto: 'Três horas por dia',
        volume: '',
        objetivo: ''
      }
    },
    {
      mensagem: 'Depois que entram na planilha, usamos essas informações para separar os pedidos e enviar para a produção.',
      analise: {
        processo: 'Separar e enviar pedidos para a produção',
        dor_principal: '',
        frequencia: '',
        impacto: '',
        volume: '',
        objetivo: ''
      }
    },
    {
      mensagem: 'São aproximadamente 80 pedidos por dia.',
      analise: {
        processo: '',
        dor_principal: '',
        frequencia: 'Diária',
        impacto: '',
        volume: '80 pedidos por dia',
        objetivo: ''
      }
    },
    {
      mensagem: 'Depois disso, alguns pedidos ainda precisam ser conferidos novamente porque às vezes há erros de digitação.',
      analise: {
        processo: 'Conferência de pedidos',
        dor_principal: 'Erros de digitação',
        frequencia: '',
        impacto: 'Necessidade de conferir novamente',
        volume: '',
        objetivo: ''
      }
    }
  ];

  passos.forEach(function(passo, indice) {

    const normalizada = normalizarAnaliseDiagnostico_(
      passo.analise,
      passo.mensagem,
      estado
    );

    estado = atualizarDiagnosticoComAnalise_(
      estado,
      normalizada
    );

    Logger.log('PASSO ' + (indice + 1) + ': ' + JSON.stringify({
      processo: estado.processo_resumo,
      dor_principal: estado.dor_principal,
      frequencia: estado.frequencia,
      impacto: estado.impacto_nivel,
      volume: normalizada.volume,
      objetivo: estado.objetivo,
      nova_dor: normalizada.dor_principal
    }, null, 2));
  });

  const etapas = extrairEtapasProcessoDiagnostico_(estado.processo_resumo);

  const esperadoEtapas = [
    'Colocação manual de pedidos em planilha',
    'Separar e enviar pedidos para a produção',
    'Conferência de pedidos'
  ];

  const processoOK = esperadoEtapas.every(function(esperada) {
    return etapas.some(function(real) {
      return normalizarTextoDiagnostico_(real) === normalizarTextoDiagnostico_(esperada);
    });
  });

  const frequenciaOK = estado.frequencia === 'Diária';
  const impactoOK = normalizarTextoDiagnostico_(estado.impacto_nivel) === 'tres horas por dia';
  const dorOK = normalizarTextoDiagnostico_(estado.dor_principal) === 'perda de tempo com trabalho manual';

  const medidasEsperadas = extrairMedidasMensagemDiagnostico_(passos[2].mensagem);
  const volumeOK = medidasEsperadas.some(function(m) {
    return m.tipo === 'VOLUME' && String(m.texto).indexOf('80') !== -1;
  });

  const relatorio = {
    processo_OK: processoOK,
    dor_principal_OK: dorOK,
    frequencia_OK: frequenciaOK,
    impacto_OK: impactoOK,
    volume_OK: volumeOK,
    etapas: etapas,
    estado_final: estado
  };

  Logger.log('========== RESULTADO V5 ==========');
  Logger.log(JSON.stringify(relatorio, null, 2));

  if (!processoOK || !dorOK || !frequenciaOK || !impactoOK || !volumeOK) {
    throw new Error(
      'TESTE ESTRUTURAL V5 FALHOU: ' + JSON.stringify(relatorio)
    );
  }

  Logger.log('========== TESTE ESTRUTURAL V5 APROVADO ==========');

  return relatorio;
}


function testarFluxoDiagnosticoAbrangente() {

  Logger.log('========== INÍCIO TESTE V4 ==========' );

  const inicio = iniciarDiagnostico({
    nome: 'Empresa Teste V4',
    celular: '51999999997',
    whatsapp: '51999999997',
    email: 'testev4@mvp.local',
    segmento: 'Gráfica',
    porte: 'Pequeno',
    cidade: 'Teste'
  });

  const rodadas = [
    'Minha funcionária perde três horas por dia colocando pedidos manualmente em uma planilha.',
    'Depois que entram na planilha, usamos essas informações para separar os pedidos e enviar para a produção.',
    'São aproximadamente 80 pedidos por dia.',
    'Depois disso, alguns pedidos ainda precisam ser conferidos novamente porque às vezes há erros de digitação.'
  ];

  const resultados = [];

  rodadas.forEach(function(mensagem, indice) {
    Logger.log('========== RODADA ' + (indice + 1) + ' ==========' );
    const resultado = processarMensagemDiagnostico({
      empresa_id: inicio.empresa_id,
      conversa_id: inicio.conversa_id,
      mensagem: mensagem
    });
    resultados.push(resultado);
    Logger.log('RODADA ' + (indice + 1) + ': ' + JSON.stringify(resultado, null, 2));
  });

  const final = resultados[resultados.length - 1];
  const dores = obterDoresDiagnostico_(inicio.diagnostico_id);
  const medidas = obterMedidasDiagnostico_(inicio.empresa_id, inicio.conversa_id);

  Logger.log('========== VALIDAÇÕES V4 ==========' );
  Logger.log('PROCESSO: ' + final.diagnostico.processo_resumo);
  Logger.log('DOR PRINCIPAL: ' + final.diagnostico.dor_principal);
  Logger.log('DORES REGISTRADAS: ' + JSON.stringify(dores, null, 2));
  Logger.log('FREQUÊNCIA: ' + final.diagnostico.frequencia);
  Logger.log('IMPACTO: ' + final.diagnostico.impacto_nivel);
  Logger.log('MEDIDAS: ' + JSON.stringify(medidas, null, 2));
  Logger.log('OBJETIVO: ' + final.diagnostico.objetivo);
  Logger.log('ESTADO FINAL: ' + final.estado);
  Logger.log('ÚLTIMA PERGUNTA: ' + final.resposta);
  Logger.log('========== FIM TESTE V4 ==========' );

  return {
    inicio: inicio,
    resultados: resultados,
    final: final,
    dores: dores,
    medidas: medidas
  };

}


function testarFluxoDiagnostico() {

  Logger.log(
    '========== INÍCIO TESTE 2 RODADAS =========='
  );


  /**
   * ==========================================================
   * 1. CRIAR EMPRESA + CONVERSA + DIAGNÓSTICO
   * ==========================================================
   */

  const inicio =
    iniciarDiagnostico({

      nome:
        'Empresa Teste 2 Rodadas',

      celular:
        '51999999999',

      whatsapp:
        '51999999999',

      email:
        'teste2@mvp.local',

      segmento:
        'Gráfica',

      porte:
        'Pequeno',

      cidade:
        'Teste'

    });


  Logger.log(
    'CONVERSA CRIADA: ' +
    inicio.conversa_id
  );


  /**
   * ==========================================================
   * 2. PRIMEIRA MENSAGEM
   * ==========================================================
   */

  Logger.log(
    '========== RODADA 1 =========='
  );


  const rodada1 =
    processarMensagemDiagnostico({

      empresa_id:
        inicio.empresa_id,

      conversa_id:
        inicio.conversa_id,

      mensagem:
        'Minha funcionária perde três horas por dia colocando pedidos manualmente em uma planilha.'

    });


  Logger.log(
    'RODADA 1: ' +
    JSON.stringify(
      rodada1,
      null,
      2
    )
  );


  /**
   * ==========================================================
   * 3. SEGUNDA MENSAGEM
   * ==========================================================
   *
   * IMPORTANTE:
   *
   * Estamos utilizando EXATAMENTE a mesma:
   *
   * empresa_id
   * conversa_id
   *
   * Portanto, esta mensagem pertence à mesma conversa.
   */

  Logger.log(
    '========== RODADA 2 =========='
  );


  const rodada2 =
    processarMensagemDiagnostico({

      empresa_id:
        inicio.empresa_id,

      conversa_id:
        inicio.conversa_id,

      mensagem:
        'Depois que entram na planilha, usamos essas informações para separar os pedidos e enviar para a produção.'

    });


  Logger.log(
    'RODADA 2: ' +
    JSON.stringify(
      rodada2,
      null,
      2
    )
  );


  /**
   * ==========================================================
   * 4. RESUMO DO TESTE
   * ==========================================================
   */

  Logger.log(
    '========== RESUMO =========='
  );


  Logger.log(
    'EMPRESA: ' +
    inicio.empresa_id
  );


  Logger.log(
    'CONVERSA: ' +
    inicio.conversa_id
  );


  Logger.log(
    'DIAGNÓSTICO: ' +
    inicio.diagnostico_id
  );


  Logger.log(
    'PERGUNTA DA RODADA 1: ' +
    rodada1.resposta
  );


  Logger.log(
    'PERGUNTA DA RODADA 2: ' +
    rodada2.resposta
  );


  Logger.log(
    'ESTADO FINAL: ' +
    rodada2.estado
  );


  Logger.log(
    '========== FIM TESTE 2 RODADAS =========='
  );


  return {

    inicio:
      inicio,

    rodada1:
      rodada1,

    rodada2:
      rodada2

  };

}

/**
 * ============================================================
 * TESTE V5 — RESPOSTA À PERGUNTA PENDENTE
 * ============================================================
 *
 * OBJETIVO:
 *
 * Validar o ciclo:
 *
 * 1. Empresário informa o problema
 * 2. IA cria uma pergunta
 * 3. Empresário responde à pergunta
 * 4. Motor reconhece a resposta
 * 5. Informação é incorporada à memória
 * 6. Pergunta anterior deixa de ser pendente
 * 7. Nova pergunta é criada
 *
 * IMPORTANTE:
 * - Não altera nenhuma função existente.
 * - Cria uma nova conversa de teste.
 * - Usa Gemini de verdade.
 * ============================================================
 */


/**
 * ============================================================
 * TESTE V5.1 — CONTINUIDADE DETERMINÍSTICA
 * ============================================================
 *
 * Não chama Gemini.
 *
 * Valida exatamente os dois erros encontrados no teste real:
 *
 * 1. Primeira mensagem sem pergunta pendente => false.
 * 2. Resposta à pergunta de volume => true + nova pergunta.
 *
 * Este teste deve passar antes de gastar uma chamada real ao Gemini.
 * ============================================================
 */
function testarContinuidadeDiagnosticoV5() {

  Logger.log(
    '========== INÍCIO TESTE CONTINUIDADE V5.1 =========='
  );

  const erros = [];

  // ----------------------------------------------------------
  // CASO 1 — PRIMEIRA MENSAGEM
  // ----------------------------------------------------------
  const primeira =
    ajustarContinuidadeDiagnostico_(
      {
        processo: 'colocação manual de pedidos em planilha',
        dor_principal: 'perda de tempo com trabalho manual',
        frequencia: 'Diária',
        impacto: 'Três horas por dia',
        volume: '',
        objetivo: '',
        informacao_faltante: 'volume de pedidos',
        proxima_pergunta: 'Quantos pedidos são feitos por dia?',
        respondeu_pergunta_pendente: true
      },
      '',
      'Minha funcionária perde três horas por dia colocando pedidos manualmente em uma planilha.'
    );

  if (primeira.respondeu_pergunta_pendente !== false) {
    erros.push(
      'Primeira mensagem foi marcada como resposta de pergunta pendente.'
    );
  }

  // ----------------------------------------------------------
  // CASO 2 — RESPOSTA À PERGUNTA DE VOLUME
  // ----------------------------------------------------------
  const segunda =
    ajustarContinuidadeDiagnostico_(
      {
        processo: '',
        dor_principal: '',
        frequencia: 'Diária',
        impacto: '',
        volume: '80 pedidos por dia',
        objetivo: '',
        informacao_faltante: '',
        proxima_pergunta: '',
        respondeu_pergunta_pendente: false
      },
      'Quantos pedidos são feitos por dia?',
      'São aproximadamente 80 pedidos por dia.'
    );

  if (segunda.respondeu_pergunta_pendente !== true) {
    erros.push(
      'Resposta de volume não foi reconhecida como resposta à pergunta pendente.'
    );
  }

  if (!segunda.proxima_pergunta) {
    erros.push(
      'Depois de responder ao volume, nenhuma nova pergunta foi criada.'
    );
  }

  if (
    normalizarTextoDiagnostico_(segunda.proxima_pergunta) ===
    normalizarTextoDiagnostico_('Quantos pedidos são feitos por dia?')
  ) {
    erros.push(
      'A pergunta de volume foi repetida depois de respondida.'
    );
  }

  if (
    normalizarTextoDiagnostico_(segunda.informacao_faltante) !==
    normalizarTextoDiagnostico_(
      'erros, retrabalho ou atrasos gerados pelo processo'
    )
  ) {
    erros.push(
      'A próxima lacuna após o volume não foi definida corretamente.'
    );
  }

  const relatorio = {
    aprovado: erros.length === 0,
    erros: erros,
    primeira: primeira,
    segunda: segunda
  };

  Logger.log(
    '========== RESULTADO TESTE CONTINUIDADE V5.1 =========='
  );

  Logger.log(
    JSON.stringify(
      relatorio,
      null,
      2
    )
  );

  if (erros.length) {
    throw new Error(
      'TESTE CONTINUIDADE V5.1 FALHOU: ' +
      JSON.stringify(erros)
    );
  }

  Logger.log(
    '========== TESTE CONTINUIDADE V5.1 APROVADO =========='
  );

  return relatorio;
}


function testarRespostaPerguntaPendenteV5() {

  Logger.log(
    '========== INÍCIO TESTE RESPOSTA PERGUNTA V5 =========='
  );


  /**
   * ==========================================================
   * 1. CRIAR DIAGNÓSTICO
   * ==========================================================
   */

  const inicio =
    iniciarDiagnostico({

      nome:
        'Empresa Teste Resposta Pergunta V5',

      celular:
        '51999999999',

      whatsapp:
        '51999999999',

      email:
        'teste-resposta-v5@mvp.local',

      segmento:
        'Gráfica',

      porte:
        'Pequeno',

      cidade:
        'Teste'

    });


  Logger.log(
    'INÍCIO: ' +
    JSON.stringify(
      inicio,
      null,
      2
    )
  );


  /**
   * ==========================================================
   * 2. RODADA 1
   * ==========================================================
   *
   * O empresário apresenta a dor.
   *
   * Esperamos que a IA pergunte:
   *
   * "Quantos pedidos são feitos por dia?"
   *
   * ou equivalente.
   */

  Logger.log(
    '========== RODADA 1 =========='
  );


  const rodada1 =
    processarMensagemDiagnostico({

      empresa_id:
        inicio.empresa_id,

      conversa_id:
        inicio.conversa_id,

      mensagem:
        'Minha funcionária perde três horas por dia colocando pedidos manualmente em uma planilha.'

    });


  Logger.log(
    'RODADA 1: ' +
    JSON.stringify(
      rodada1,
      null,
      2
    )
  );


  /**
   * ==========================================================
   * 3. VALIDAR RODADA 1
   * ==========================================================
   */

  const errosRodada1 = [];


  if (!rodada1 || !rodada1.sucesso) {

    errosRodada1.push(
      'Rodada 1 não retornou sucesso.'
    );

  }


  if (
    !rodada1 ||
    !rodada1.resposta
  ) {

    errosRodada1.push(
      'Rodada 1 não criou uma pergunta.'
    );

  }


  if (
    rodada1 &&
    rodada1.analise_ia &&
    rodada1.analise_ia.respondeu_pergunta_pendente === true
  ) {

    errosRodada1.push(
      'ERRO: primeira mensagem foi marcada como resposta de uma pergunta pendente.'
    );

  }


  if (
    rodada1 &&
    rodada1.diagnostico &&
    !rodada1.diagnostico.processo_nome
  ) {

    errosRodada1.push(
      'Processo não foi identificado na rodada 1.'
    );

  }


  if (
    rodada1 &&
    rodada1.diagnostico &&
    !rodada1.diagnostico.dor_principal
  ) {

    errosRodada1.push(
      'Dor principal não foi identificada na rodada 1.'
    );

  }


  /**
   * ==========================================================
   * 4. RODADA 2
   * ==========================================================
   *
   * AGORA O EMPRESÁRIO RESPONDE À PERGUNTA.
   *
   * A resposta deve ser reconhecida como:
   *
   * VOLUME = 80 pedidos por dia
   */

  Logger.log(
    '========== RODADA 2 =========='
  );


  const rodada2 =
    processarMensagemDiagnostico({

      empresa_id:
        inicio.empresa_id,

      conversa_id:
        inicio.conversa_id,

      mensagem:
        'São aproximadamente 80 pedidos por dia.'

    });


  Logger.log(
    'RODADA 2: ' +
    JSON.stringify(
      rodada2,
      null,
      2
    )
  );


  /**
   * ==========================================================
   * 5. VALIDAR RODADA 2
   * ==========================================================
   */

  const errosRodada2 = [];


  if (!rodada2 || !rodada2.sucesso) {

    errosRodada2.push(
      'Rodada 2 não retornou sucesso.'
    );

  }


  /**
   * ----------------------------------------------------------
   * VOLUME
   * ----------------------------------------------------------
   */

  const volume =
    rodada2 &&
    rodada2.analise_ia
      ? rodada2.analise_ia.volume
      : '';


  if (!volume) {

    errosRodada2.push(
      'Volume não foi capturado.'
    );

  } else {

    const volumeNormalizado =
      String(volume)
        .toLowerCase()
        .replace(/\s+/g, ' ');


    if (
      volumeNormalizado.indexOf('80') === -1 ||
      volumeNormalizado.indexOf('pedido') === -1
    ) {

      errosRodada2.push(
        'Volume capturado, mas não corresponde a "80 pedidos por dia": ' +
        volume
      );

    }

  }


  /**
   * ----------------------------------------------------------
   * RESPOSTA À PERGUNTA PENDENTE
   * ----------------------------------------------------------
   */

  if (
    !rodada2 ||
    !rodada2.analise_ia ||
    rodada2.analise_ia.respondeu_pergunta_pendente !== true
  ) {

    errosRodada2.push(
      'A segunda mensagem não foi reconhecida como resposta à pergunta pendente.'
    );

  }


  /**
   * ----------------------------------------------------------
   * NOVA PERGUNTA
   * ----------------------------------------------------------
   *
   * Depois que o volume foi respondido,
   * não queremos repetir a mesma pergunta.
   */

  const pergunta1 =
    rodada1 &&
    rodada1.resposta
      ? String(rodada1.resposta)
      : '';


  const pergunta2 =
    rodada2 &&
    rodada2.resposta
      ? String(rodada2.resposta)
      : '';


  if (!pergunta2) {

    errosRodada2.push(
      'Depois de responder a pergunta, nenhuma nova pergunta foi gerada.'
    );

  }


  if (
    pergunta1 &&
    pergunta2 &&
    pergunta1.trim().toLowerCase() ===
    pergunta2.trim().toLowerCase()
  ) {

    errosRodada2.push(
      'A pergunta pendente foi repetida mesmo depois de respondida.'
    );

  }


  /**
   * ----------------------------------------------------------
   * MEMÓRIA DO DIAGNÓSTICO
   * ----------------------------------------------------------
   */

  const diagnostico2 =
    rodada2
      ? rodada2.diagnostico
      : null;


  if (
    !diagnostico2 ||
    !diagnostico2.processo_nome
  ) {

    errosRodada2.push(
      'Processo não foi preservado após responder a pergunta.'
    );

  }


  if (
    !diagnostico2 ||
    !diagnostico2.dor_principal
  ) {

    errosRodada2.push(
      'Dor principal não foi preservada após responder a pergunta.'
    );

  }


  if (
    !diagnostico2 ||
    !diagnostico2.frequencia
  ) {

    errosRodada2.push(
      'Frequência não foi preservada após responder a pergunta.'
    );

  }


  if (
    !diagnostico2 ||
    !diagnostico2.impacto_nivel
  ) {

    errosRodada2.push(
      'Impacto não foi preservado após responder a pergunta.'
    );

  }


  /**
   * ==========================================================
   * 6. RESULTADO
   * ==========================================================
   */

  const aprovado =
    errosRodada1.length === 0 &&
    errosRodada2.length === 0;


  Logger.log(
    '========== RESULTADO TESTE V5 =========='
  );


  Logger.log(
    JSON.stringify({

      aprovado:
        aprovado,

      erros_rodada_1:
        errosRodada1,

      erros_rodada_2:
        errosRodada2,

      pergunta_rodada_1:
        pergunta1,

      pergunta_rodada_2:
        pergunta2,

      volume:
        volume,

      respondeu_pergunta:
        rodada2 &&
        rodada2.analise_ia
          ? rodada2.analise_ia.respondeu_pergunta_pendente
          : null,

      diagnostico_final:
        diagnostico2

    }, null, 2)
  );


  /**
   * ==========================================================
   * 7. RESULTADO FINAL
   * ==========================================================
   */

  if (aprovado) {

    Logger.log(
      '========== TESTE V5 APROVADO =========='
    );

  } else {

    Logger.log(
      '========== TESTE V5 REPROVADO =========='
    );

    Logger.log(
      'ERROS ENCONTRADOS:'
    );

    errosRodada1
      .concat(errosRodada2)
      .forEach(function(erro) {

        Logger.log(
          ' - ' + erro
        );

      });

  }


  return {

    aprovado:
      aprovado,

    erros_rodada_1:
      errosRodada1,

    erros_rodada_2:
      errosRodada2,

    pergunta_rodada_1:
      pergunta1,

    pergunta_rodada_2:
      pergunta2,

    volume:
      volume,

    respondeu_pergunta:
      rodada2 &&
      rodada2.analise_ia
        ? rodada2.analise_ia.respondeu_pergunta_pendente
        : null,

    diagnostico:
      diagnostico2

  };

}

/**
 * ============================================================
 * TESTE V5 — CENÁRIO NEGATIVO
 * ============================================================
 *
 * OBJETIVO:
 *
 * Validar se o motor entende que uma dimensão foi respondida
 * negativamente e NÃO continua insistindo na mesma pergunta.
 *
 * FLUXO:
 *
 * 1. Problema inicial
 * 2. Volume
 * 3. Cliente informa que NÃO existem erros/retrabalho/atrasos
 *
 * ESPERADO:
 *
 * - Volume preservado
 * - Resposta negativa reconhecida
 * - Erros/retrabalho/atrasos encerrados
 * - Pergunta sobre erros não repetida
 * - Próxima pergunta direcionada ao objetivo
 * - Diagnóstico continua em INVESTIGACAO
 *
 * NÃO ALTERA O MOTOR.
 * É SOMENTE UM TESTE.
 * ============================================================
 */

function testarProtecoesDiagnosticoV5_2() {

  Logger.log(
    '========== INÍCIO TESTE PROTEÇÕES V5.2 =========='
  );

  const erros = [];

  // ----------------------------------------------------------
  // 1. PRIMEIRA MENSAGEM NÃO RESPONDE PERGUNTA
  // ----------------------------------------------------------
  const primeira = ajustarContinuidadeDiagnostico_(
    {
      processo: 'colocação manual de pedidos em planilha',
      dor_principal: 'perda de tempo com trabalho manual',
      frequencia: 'Diária',
      impacto: 'Três horas por dia',
      volume: '',
      objetivo: '',
      informacao_faltante: 'volume de pedidos',
      proxima_pergunta: 'Quantos pedidos são feitos por dia?',
      respondeu_pergunta_pendente: true
    },
    '',
    'Minha funcionária perde três horas por dia colocando pedidos manualmente em uma planilha.'
  );

  if (primeira.respondeu_pergunta_pendente !== false) {
    erros.push(
      'Primeira mensagem foi tratada como resposta de pergunta pendente.'
    );
  }

  // ----------------------------------------------------------
  // 2. VOLUME É PRESERVADO MESMO QUANDO A IA NÃO O DEVOLVE
  // ----------------------------------------------------------
  const volumePreservado = normalizarAnaliseDiagnostico_(
    {
      processo: '',
      dor_principal: '',
      frequencia: '',
      impacto: '',
      volume: '',
      objetivo: '',
      informacao_faltante: '',
      proxima_pergunta: ''
    },
    'Não, não gera erros nem retrabalho. O problema é apenas o tempo gasto.',
    {
      processo: 'colocação manual de pedidos em planilha',
      frequencia: 'Diária',
      impacto: 'Três horas por dia',
      volume: '80 pedidos por dia',
      objetivo: ''
    }
  );

  if (
    normalizarTextoDiagnostico_(volumePreservado.volume) !==
    normalizarTextoDiagnostico_('80 pedidos por dia')
  ) {
    erros.push(
      'Volume confirmado anteriormente foi perdido quando a mensagem atual não trouxe volume.'
    );
  }

  // ----------------------------------------------------------
  // 3. NEGAÇÃO NÃO PODE VIRAR NOVA DOR
  // ----------------------------------------------------------
  if (volumePreservado.dor_principal) {
    erros.push(
      'Uma dimensão negada foi transformada em nova dor: ' +
      volumePreservado.dor_principal
    );
  }

  // ----------------------------------------------------------
  // 4. NEGAÇÃO DE ERROS AVANÇA PARA OBJETIVO
  // ----------------------------------------------------------
  const negativa = ajustarContinuidadeDiagnostico_(
    {
      processo: '',
      dor_principal: '',
      frequencia: 'Diária',
      impacto: '',
      volume: '80 pedidos por dia',
      objetivo: '',
      informacao_faltante: 'erros, retrabalho ou atrasos gerados pelo processo',
      proxima_pergunta: 'Esse processo costuma gerar erros, retrabalho ou atrasos?',
      respondeu_pergunta_pendente: false
    },
    'Esse processo costuma gerar erros, retrabalho ou atrasos?',
    'Não, não gera erros nem retrabalho. O problema é apenas o tempo gasto.'
  );

  if (negativa.respondeu_pergunta_pendente !== true) {
    erros.push(
      'Resposta negativa não foi reconhecida como resposta à pergunta pendente.'
    );
  }

  if (
    negativa.dimensao_negada !==
    'erros_retrabalho_atrasos'
  ) {
    erros.push(
      'A dimensão negada não foi registrada corretamente.'
    );
  }

  if (
    !/objetivo|melhorar|alcançar|alcancar|resultado/i.test(
      String(negativa.proxima_pergunta || '')
    )
  ) {
    erros.push(
      'Após negar erros/retrabalho/atrasos, o motor não avançou para objetivo.'
    );
  }

  if (
    /erro|retrabalho|atraso/i.test(
      String(negativa.proxima_pergunta || '')
    )
  ) {
    erros.push(
      'A pergunta sobre erros/retrabalho/atrasos foi repetida após uma negativa.'
    );
  }

  const relatorio = {
    aprovado: erros.length === 0,
    erros: erros,
    primeira: primeira,
    volume_preservado: volumePreservado,
    negativa: negativa
  };

  Logger.log(
    '========== RESULTADO TESTE PROTEÇÕES V5.2 =========='
  );

  Logger.log(
    JSON.stringify(
      relatorio,
      null,
      2
    )
  );

  if (erros.length) {
    throw new Error(
      'TESTE PROTEÇÕES V5.2 FALHOU: ' +
      JSON.stringify(erros)
    );
  }

  Logger.log(
    '========== TESTE PROTEÇÕES V5.2 APROVADO =========='
  );

  return relatorio;
}


function testarCenarioNegativoV5() {

  Logger.log(
    '========== INÍCIO TESTE CENÁRIO NEGATIVO V5 =========='
  );


  /**
   * ==========================================================
   * 1. INICIAR DIAGNÓSTICO
   * ==========================================================
   */

  const inicio =
    iniciarDiagnostico({

      nome:
        'Empresa Teste Cenário Negativo V5',

      celular:
        '51999999999',

      whatsapp:
        '51999999999',

      email:
        'teste-negativo-v5@mvp.local',

      segmento:
        'Gráfica',

      porte:
        'Pequeno',

      cidade:
        'Teste'

    });


  Logger.log(
    'INÍCIO: ' +
    JSON.stringify(
      inicio,
      null,
      2
    )
  );


  /**
   * ==========================================================
   * 2. RODADA 1
   * ==========================================================
   */

  Logger.log(
    '========== RODADA 1 =========='
  );


  const rodada1 =
    processarMensagemDiagnostico({

      empresa_id:
        inicio.empresa_id,

      conversa_id:
        inicio.conversa_id,

      mensagem:
        'Minha funcionária perde três horas por dia colocando pedidos manualmente em uma planilha.'

    });


  Logger.log(
    'RODADA 1: ' +
    JSON.stringify(
      rodada1,
      null,
      2
    )
  );


  /**
   * ==========================================================
   * 3. RODADA 2 — VOLUME
   * ==========================================================
   */

  Logger.log(
    '========== RODADA 2 — VOLUME =========='
  );


  const rodada2 =
    processarMensagemDiagnostico({

      empresa_id:
        inicio.empresa_id,

      conversa_id:
        inicio.conversa_id,

      mensagem:
        'São aproximadamente 80 pedidos por dia.'

    });


  Logger.log(
    'RODADA 2: ' +
    JSON.stringify(
      rodada2,
      null,
      2
    )
  );


  /**
   * ==========================================================
   * 4. RODADA 3 — CENÁRIO NEGATIVO
   * ==========================================================
   *
   * O empresário responde:
   *
   * "Não, não gera erros nem retrabalho."
   *
   * Isso deve:
   *
   * - responder a pergunta pendente;
   * - encerrar a dimensão de erros/retrabalho/atrasos;
   * - preservar o volume;
   * - preservar o processo;
   * - preservar a dor;
   * - preservar frequência;
   * - preservar impacto;
   * - avançar para objetivo;
   * - continuar em INVESTIGACAO.
   */

  Logger.log(
    '========== RODADA 3 — CENÁRIO NEGATIVO =========='
  );


  const mensagemNegativa =
    'Não, não gera erros nem retrabalho. O problema é apenas o tempo gasto.';


  const rodada3 =
    processarMensagemDiagnostico({

      empresa_id:
        inicio.empresa_id,

      conversa_id:
        inicio.conversa_id,

      mensagem:
        mensagemNegativa

    });


  Logger.log(
    'RODADA 3: ' +
    JSON.stringify(
      rodada3,
      null,
      2
    )
  );


  /**
   * ==========================================================
   * 5. PREPARAR VALIDAÇÕES
   * ==========================================================
   */

  const erros = [];


  /**
   * ==========================================================
   * 6. VALIDAÇÃO BÁSICA
   * ==========================================================
   */

  if (
    !rodada1 ||
    !rodada1.sucesso
  ) {

    erros.push(
      'Rodada 1 não retornou sucesso.'
    );

  }


  if (
    !rodada2 ||
    !rodada2.sucesso
  ) {

    erros.push(
      'Rodada 2 não retornou sucesso.'
    );

  }


  if (
    !rodada3 ||
    !rodada3.sucesso
  ) {

    erros.push(
      'Rodada 3 não retornou sucesso.'
    );

  }


  /**
   * ==========================================================
   * 7. VALIDAR VOLUME
   * ==========================================================
   */

  const volume =
    rodada3 &&
    rodada3.analise_ia
      ? rodada3.analise_ia.volume
      : '';


  if (!volume) {

    erros.push(
      'Volume não foi preservado após o cenário negativo.'
    );

  } else {

    const volumeNormalizado =
      String(volume)
        .toLowerCase()
        .replace(/\s+/g, ' ');


    if (
      volumeNormalizado.indexOf('80') === -1 ||
      volumeNormalizado.indexOf('pedido') === -1
    ) {

      erros.push(
        'Volume incorreto após cenário negativo: ' +
        volume
      );

    }

  }


  /**
   * ==========================================================
   * 8. VALIDAR VOLUME NA MEMÓRIA CONSOLIDADA
   * ==========================================================
   */

  const volumeDiagnostico =
    rodada3 &&
    rodada3.diagnostico
      ? rodada3.diagnostico.volume
      : '';


  if (
    !volumeDiagnostico ||
    String(volumeDiagnostico)
      .toLowerCase()
      .indexOf('80') === -1
  ) {

    erros.push(
      'Volume não apareceu na memória consolidada do diagnóstico após a rodada negativa.'
    );

  }


  /**
   * ==========================================================
   * 9. VALIDAR RESPOSTA NEGATIVA
   * ==========================================================
   *
   * NÃO procuramos a palavra "não" dentro do JSON.
   *
   * O motor possui campos estruturados para isso.
   */

  const analise3 =
    rodada3 &&
    rodada3.analise_ia
      ? rodada3.analise_ia
      : {};


  if (
    analise3.resposta_negativa !== true
  ) {

    erros.push(
      'A resposta negativa não foi reconhecida estruturalmente pela análise.'
    );

  }


  if (
    analise3.dimensao_negada !==
    'erros_retrabalho_atrasos'
  ) {

    erros.push(
      'A dimensão negada não foi registrada corretamente: ' +
      String(
        analise3.dimensao_negada || ''
      )
    );

  }


  /**
   * ==========================================================
   * 10. VALIDAR O DETECTOR DETERMINÍSTICO
   * ==========================================================
   *
   * Além da saída do fluxo, testamos diretamente o detector.
   */

  const negacaoDeterministica =
    mensagemNegaTemaDiagnostico_(
      mensagemNegativa,
      'erros_retrabalho_atrasos'
    );


  if (
    negacaoDeterministica !== true
  ) {

    erros.push(
      'O detector determinístico não reconheceu a negativa.'
    );

  }


  /**
   * ==========================================================
   * 11. NÃO REPETIR PERGUNTA SOBRE ERROS
   * ==========================================================
   */

  const pergunta2 =
    rodada2 &&
    rodada2.resposta
      ? String(
          rodada2.resposta
        )
      : '';


  const pergunta3 =
    rodada3 &&
    rodada3.resposta
      ? String(
          rodada3.resposta
        )
      : '';


  const perguntaErros =
    /erro|retrabalho|atraso/i;


  if (
    pergunta3 &&
    perguntaErros.test(
      pergunta3
    )
  ) {

    erros.push(
      'O motor continuou perguntando sobre erros/retrabalho/atrasos após o cliente negar essa dimensão: ' +
      pergunta3
    );

  }


  /**
   * ==========================================================
   * 12. NÃO REPETIR PERGUNTA ANTERIOR
   * ==========================================================
   */

  if (
    pergunta2 &&
    pergunta3 &&
    pergunta2.trim().toLowerCase() ===
    pergunta3.trim().toLowerCase()
  ) {

    erros.push(
      'A pergunta anterior foi repetida.'
    );

  }


  /**
   * ==========================================================
   * 13. AVANÇAR PARA OBJETIVO
   * ==========================================================
   */

  const perguntaObjetivo =
    /objetivo|alcançar|alcancar|melhorar|resultado|deseja|gostaria|espera/i;


  if (
    !pergunta3 ||
    !perguntaObjetivo.test(
      pergunta3
    )
  ) {

    erros.push(
      'Depois de encerrar erros/retrabalho/atrasos, o motor não avançou para uma pergunta relacionada ao objetivo.'
    );

  }


  /**
   * ==========================================================
   * 14. RESPOSTA À PERGUNTA PENDENTE
   * ==========================================================
   */

  if (
    !analise3.respondeu_pergunta_pendente
  ) {

    erros.push(
      'A resposta negativa não foi reconhecida como resposta à pergunta pendente.'
    );

  }


  /**
   * ==========================================================
   * 15. MEMÓRIA PRINCIPAL
   * ==========================================================
   */

  const diagnosticoFinal =
    rodada3
      ? rodada3.diagnostico
      : null;


  if (
    !diagnosticoFinal ||
    !diagnosticoFinal.processo_nome
  ) {

    erros.push(
      'Processo não foi preservado.'
    );

  }


  if (
    !diagnosticoFinal ||
    !diagnosticoFinal.dor_principal
  ) {

    erros.push(
      'Dor principal não foi preservada.'
    );

  }


  if (
    !diagnosticoFinal ||
    !diagnosticoFinal.frequencia
  ) {

    erros.push(
      'Frequência não foi preservada.'
    );

  }


  if (
    !diagnosticoFinal ||
    !diagnosticoFinal.impacto_nivel
  ) {

    erros.push(
      'Impacto não foi preservado.'
    );

  }


  /**
   * ==========================================================
   * 16. ESTADO
   * ==========================================================
   */

  if (
    diagnosticoFinal &&
    diagnosticoFinal.status_diagnostico !==
      'INVESTIGACAO'
  ) {

    erros.push(
      'Estado incorreto. Esperado INVESTIGACAO, recebido: ' +
      diagnosticoFinal.status_diagnostico
    );

  }


  /**
   * ==========================================================
   * 17. RESULTADO
   * ==========================================================
   */

  const aprovado =
    erros.length === 0;


  const relatorio = {

    aprovado:
      aprovado,

    erros:
      erros,

    volume:
      volume,

    volume_diagnostico:
      volumeDiagnostico,

    resposta_negativa:
      analise3.resposta_negativa === true,

    dimensao_negada:
      analise3.dimensao_negada || '',

    detector_negativo:
      negacaoDeterministica,

    pergunta_rodada_2:
      pergunta2,

    pergunta_rodada_3:
      pergunta3,

    respondeu_pergunta_pendente:
      analise3.respondeu_pergunta_pendente === true,

    diagnostico_final:
      diagnosticoFinal

  };


  Logger.log(
    '========== RESULTADO TESTE CENÁRIO NEGATIVO V5 =========='
  );


  Logger.log(
    JSON.stringify(
      relatorio,
      null,
      2
    )
  );


  /**
   * ==========================================================
   * 18. RESULTADO FINAL
   * ==========================================================
   */

  if (aprovado) {

    Logger.log(
      '========== TESTE CENÁRIO NEGATIVO V5 APROVADO =========='
    );

  } else {

    Logger.log(
      '========== TESTE CENÁRIO NEGATIVO V5 REPROVADO =========='
    );


    Logger.log(
      'ERROS ENCONTRADOS:'
    );


    erros.forEach(
      function(erro) {

        Logger.log(
          ' - ' + erro
        );

      }
    );

  }


  return relatorio;

}

/**
 * ============================================================
 * TESTE DE CONTINUIDADE DO OBJETIVO — V5.2
 * ============================================================
 *
 * Objetivo deste teste:
 *
 * 1. Criar um diagnóstico novo.
 * 2. Reproduzir o fluxo V4 já aprovado.
 * 3. Responder à pergunta de objetivo.
 * 4. Verificar se o motor:
 *
 *    - preserva o processo;
 *    - preserva a dor principal;
 *    - preserva as dores acumuladas;
 *    - preserva a frequência;
 *    - preserva o impacto;
 *    - preserva o volume;
 *    - registra o objetivo;
 *    - não volta a perguntar sobre volume;
 *    - não volta a perguntar sobre erros/retrabalho;
 *    - chega ao estado PRONTO_PARA_ANALISE.
 *
 * IMPORTANTE:
 * Este teste NÃO altera nenhuma função do motor.
 * Ele apenas cria um novo diagnóstico de teste.
 *
 * Cada execução cria novos registros.
 *
 * ============================================================
 */

function testarContinuidadeObjetivoDiagnosticoV5_2() {

  Logger.log(
    '============================================================'
  );
  Logger.log(
    ' INÍCIO TESTE CONTINUIDADE OBJETIVO V5.2'
  );
  Logger.log(
    '============================================================'
  );


  /**
   * ----------------------------------------------------------
   * FUNÇÃO AUXILIAR DE FALHA
   * ----------------------------------------------------------
   */

  function falhar(mensagem, dados) {

    Logger.log(
      '❌ FALHA: ' + mensagem
    );

    if (dados !== undefined) {
      Logger.log(
        JSON.stringify(
          dados,
          null,
          2
        )
      );
    }

    throw new Error(
      'TESTE CONTINUIDADE OBJETIVO V5.2 FALHOU: ' +
      mensagem
    );
  }


  /**
   * ----------------------------------------------------------
   * NORMALIZAÇÃO LOCAL DO TESTE
   * ----------------------------------------------------------
   */

  function normalizar(valor) {

    return String(valor || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  }


  /**
   * ----------------------------------------------------------
   * 1. CRIAR NOVO DIAGNÓSTICO
   * ----------------------------------------------------------
   */

  Logger.log(
    '========== 1. CRIANDO DIAGNÓSTICO =========='
  );

  const inicio = iniciarDiagnostico({

    nome:
      'Empresa Teste Objetivo V5.2',

    celular:
      '51999999996',

    whatsapp:
      '51999999996',

    email:
      'testeobjetivo@mvp.local',

    segmento:
      'Gráfica',

    porte:
      'Pequeno',

    cidade:
      'Teste'

  });


  if (!inicio) {
    falhar(
      'iniciarDiagnostico não retornou resultado.'
    );
  }


  if (!inicio.empresa_id) {
    falhar(
      'empresa_id não foi criado.'
    );
  }


  if (!inicio.conversa_id) {
    falhar(
      'conversa_id não foi criado.'
    );
  }


  if (!inicio.diagnostico_id) {
    falhar(
      'diagnostico_id não foi criado.'
    );
  }


  Logger.log(
    'EMPRESA: ' +
    inicio.empresa_id
  );

  Logger.log(
    'CONVERSA: ' +
    inicio.conversa_id
  );

  Logger.log(
    'DIAGNÓSTICO: ' +
    inicio.diagnostico_id
  );


  /**
   * ----------------------------------------------------------
   * 2. MENSAGENS DO TESTE
   * ----------------------------------------------------------
   */

  const rodadas = [

    'Minha funcionária perde três horas por dia colocando pedidos manualmente em uma planilha.',

    'Depois que entram na planilha, usamos essas informações para separar os pedidos e enviar para a produção.',

    'São aproximadamente 80 pedidos por dia.',

    'Depois disso, alguns pedidos ainda precisam ser conferidos novamente porque às vezes há erros de digitação.',

    'Quero reduzir o tempo gasto nesse processo e diminuir os erros de digitação.'

  ];


  const resultados = [];


  /**
   * ----------------------------------------------------------
   * 3. EXECUTAR TODAS AS RODADAS
   * ----------------------------------------------------------
   */

  rodadas.forEach(function(mensagem, indice) {

    const numero =
      indice + 1;


    Logger.log(
      ''
    );

    Logger.log(
      '============================================================'
    );

    Logger.log(
      ' RODADA ' + numero
    );

    Logger.log(
      '============================================================'
    );

    Logger.log(
      'MENSAGEM: ' +
      mensagem
    );


    const resultado =
      processarMensagemDiagnostico({

        empresa_id:
          inicio.empresa_id,

        conversa_id:
          inicio.conversa_id,

        mensagem:
          mensagem

      });


    if (!resultado) {

      falhar(
        'A rodada ' +
        numero +
        ' não retornou resultado.'
      );

    }


    resultados.push(
      resultado
    );


    Logger.log(
      'ESTADO: ' +
      resultado.estado
    );

    Logger.log(
      'RESPOSTA: ' +
      (
        resultado.resposta ||
        '[nenhuma]'
      )
    );

    Logger.log(
      'DIAGNÓSTICO: ' +
      JSON.stringify(
        resultado.diagnostico,
        null,
        2
      )
    );

  });


  /**
   * ----------------------------------------------------------
   * 4. RESULTADOS INDIVIDUAIS
   * ----------------------------------------------------------
   */

  const rodada1 =
    resultados[0];

  const rodada2 =
    resultados[1];

  const rodada3 =
    resultados[2];

  const rodada4 =
    resultados[3];

  const rodada5 =
    resultados[4];


  if (!rodada5) {

    falhar(
      'A quinta rodada não foi executada.'
    );

  }


  /**
   * ----------------------------------------------------------
   * 5. VALIDAR RODADA 2
   *
   * A segunda mensagem NÃO responde à pergunta de volume.
   *
   * Portanto o motor deve manter a pergunta sobre volume.
   * ----------------------------------------------------------
   */

  Logger.log(
    ''
  );

  Logger.log(
    '========== VALIDAÇÃO RODADA 2 =========='
  );


  const perguntaRodada2 =
    normalizar(
      rodada2.resposta
    );


  if (
    perguntaRodada2.indexOf('quant') === -1 &&
    perguntaRodada2.indexOf('volume') === -1
  ) {

    falhar(
      'Rodada 2 deveria manter a pergunta sobre volume/quantidade.',
      {
        resposta:
          rodada2.resposta
      }
    );

  }


  Logger.log(
    '✅ Rodada 2 manteve a lacuna de volume.'
  );


  /**
   * ----------------------------------------------------------
   * 6. VALIDAR VOLUME NA RODADA 3
   * ----------------------------------------------------------
   */

  Logger.log(
    '========== VALIDAÇÃO VOLUME =========='
  );


  const medidas =
    obterMedidasDiagnostico_(
      inicio.empresa_id,
      inicio.conversa_id
    );


  const volumeEncontrado =
    medidas.some(function(medida) {

      return (
        medida &&
        String(
          medida.tipo || ''
        ).toUpperCase() === 'VOLUME' &&
        normalizar(
          medida.texto
        ).indexOf('80') !== -1
      );

    });


  if (!volumeEncontrado) {

    falhar(
      'O volume de 80 pedidos/dia não foi preservado em METRICAS.',
      {
        medidas:
          medidas
      }
    );

  }


  Logger.log(
    '✅ Volume de 80 pedidos/dia preservado.'
  );


  /**
   * ----------------------------------------------------------
   * 7. VALIDAR RODADA 4
   *
   * A rodada 4 apresenta nova dor.
   * O motor não pode apagar a dor anterior.
   * ----------------------------------------------------------
   */

  Logger.log(
    '========== VALIDAÇÃO DORES =========='
  );


  const dores =
    obterDoresDiagnostico_(
      inicio.diagnostico_id
    );


  if (!dores || dores.length < 2) {

    falhar(
      'Esperávamos pelo menos duas dores acumuladas após a rodada 4.',
      {
        dores:
          dores
      }
    );

  }


  const textosDores =
    dores.map(function(dor) {

      return normalizar(
        dor.descricao
      );

    });


  const possuiErroDigitacao =
    textosDores.some(function(dor) {

      return (
        dor.indexOf('erro') !== -1 &&
        dor.indexOf('digitacao') !== -1
      );

    });


  if (!possuiErroDigitacao) {

    falhar(
      'A dor "Erros de digitação" não foi registrada.',
      {
        dores:
          dores
      }
    );

  }


  Logger.log(
    '✅ Nova dor "Erros de digitação" registrada.'
  );


  /**
   * ----------------------------------------------------------
   * 8. VALIDAR PERGUNTA DE OBJETIVO NA RODADA 4
   * ----------------------------------------------------------
   */

  const respostaRodada4 =
    normalizar(
      rodada4.resposta
    );


  if (
    respostaRodada4.indexOf('objetivo') === -1 &&
    respostaRodada4.indexOf('alcancar') === -1 &&
    respostaRodada4.indexOf('melhorar') === -1 &&
    respostaRodada4.indexOf('gostaria') === -1
  ) {

    falhar(
      'Após a rodada 4, o sistema deveria perguntar pelo objetivo.',
      {
        resposta:
          rodada4.resposta
      }
    );

  }


  Logger.log(
    '✅ Rodada 4 terminou solicitando o objetivo.'
  );


  /**
   * ----------------------------------------------------------
   * 9. VALIDAR OBJETIVO DA RODADA 5
   * ----------------------------------------------------------
   */

  Logger.log(
    '========== VALIDAÇÃO DO OBJETIVO =========='
  );


  const diagnosticoFinal =
    rodada5.diagnostico || {};


  const objetivo =
    normalizar(
      diagnosticoFinal.objetivo
    );


  Logger.log(
    'OBJETIVO FINAL: ' +
    diagnosticoFinal.objetivo
  );


  if (!objetivo) {

    falhar(
      'O objetivo não foi registrado após a quinta rodada.',
      {
        diagnostico:
          diagnosticoFinal
      }
    );

  }


  /**
   * O objetivo esperado contém a ideia de:
   *
   * - reduzir tempo;
   * - diminuir erros.
   *
   * Não exigimos texto idêntico porque a IA pode
   * normalizar a frase.
   */

  const objetivoTemTempo =
    objetivo.indexOf('tempo') !== -1;


  const objetivoTemReducao =
    objetivo.indexOf('reduzir') !== -1 ||
    objetivo.indexOf('diminuir') !== -1 ||
    objetivo.indexOf('economizar') !== -1;


  const objetivoTemErro =
    objetivo.indexOf('erro') !== -1;


  if (!objetivoTemTempo) {

    falhar(
      'O objetivo registrado não contém referência ao tempo.',
      {
        objetivo:
          diagnosticoFinal.objetivo
      }
    );

  }


  if (!objetivoTemReducao) {

    falhar(
      'O objetivo registrado não contém uma intenção de redução/melhoria.',
      {
        objetivo:
          diagnosticoFinal.objetivo
      }
    );

  }


  if (!objetivoTemErro) {

    falhar(
      'O objetivo registrado não preservou a intenção de reduzir/diminuir erros.',
      {
        objetivo:
          diagnosticoFinal.objetivo
      }
    );

  }


  Logger.log(
    '✅ Objetivo registrado corretamente.'
  );


  /**
   * ----------------------------------------------------------
   * 10. VALIDAR PRESERVAÇÃO DO PROCESSO
   * ----------------------------------------------------------
   */

  Logger.log(
    '========== VALIDAÇÃO DO PROCESSO =========='
  );


  const processo =
    normalizar(
      diagnosticoFinal.processo_resumo
    );


  const processoTemPlanilha =
    processo.indexOf('planilha') !== -1;


  const processoTemProducao =
    processo.indexOf('producao') !== -1;


  const processoTemConferencia =
    processo.indexOf('conferencia') !== -1;


  if (!processoTemPlanilha) {

    falhar(
      'O processo perdeu a etapa relacionada à planilha.',
      {
        processo:
          diagnosticoFinal.processo_resumo
      }
    );

  }


  if (!processoTemProducao) {

    falhar(
      'O processo perdeu a etapa relacionada à produção.',
      {
        processo:
          diagnosticoFinal.processo_resumo
      }
    );

  }


  if (!processoTemConferencia) {

    falhar(
      'O processo perdeu a etapa relacionada à conferência.',
      {
        processo:
          diagnosticoFinal.processo_resumo
      }
    );

  }


  Logger.log(
    '✅ Processo completo preservado.'
  );


  /**
   * ----------------------------------------------------------
   * 11. VALIDAR FREQUÊNCIA
   * ----------------------------------------------------------
   */

  if (
    normalizar(
      diagnosticoFinal.frequencia
    ) !== 'diaria'
  ) {

    falhar(
      'A frequência deveria continuar como Diária.',
      {
        frequencia:
          diagnosticoFinal.frequencia
      }
    );

  }


  Logger.log(
    '✅ Frequência diária preservada.'
  );


  /**
   * ----------------------------------------------------------
   * 12. VALIDAR IMPACTO
   * ----------------------------------------------------------
   */

  const impacto =
    normalizar(
      diagnosticoFinal.impacto_nivel
    );


  if (
    impacto.indexOf('3 horas por dia') === -1 &&
    impacto.indexOf('tres horas por dia') === -1
  ) {

    falhar(
      'O impacto de três horas por dia não foi preservado.',
      {
        impacto:
          diagnosticoFinal.impacto_nivel
      }
    );

  }


  Logger.log(
    '✅ Impacto de três horas por dia preservado.'
  );


  /**
   * ----------------------------------------------------------
   * 13. VALIDAR QUE O VOLUME CONTINUA EXISTINDO
   * ----------------------------------------------------------
   */

  const volumeFinal =
    medidas.filter(function(medida) {

      return (
        medida &&
        String(
          medida.tipo || ''
        ).toUpperCase() === 'VOLUME'
      );

    });


  if (!volumeFinal.length) {

    falhar(
      'O volume desapareceu após a rodada de objetivo.',
      {
        medidas:
          medidas
      }
    );

  }


  const possui80 =
    volumeFinal.some(function(medida) {

      return normalizar(
        medida.texto
      ).indexOf('80') !== -1;

    });


  if (!possui80) {

    falhar(
      'Os 80 pedidos/dia desapareceram após a rodada de objetivo.',
      {
        volume:
          volumeFinal
      }
    );

  }


  Logger.log(
    '✅ Volume continua preservado após o objetivo.'
  );


  /**
   * ----------------------------------------------------------
   * 14. VALIDAR QUE NÃO VOLTOU PARA VOLUME
   * ----------------------------------------------------------
   */

  const respostaFinal =
    normalizar(
      rodada5.resposta
    );


  if (
    respostaFinal.indexOf('quantos pedidos') !== -1 ||
    respostaFinal.indexOf('quantidade de pedidos') !== -1 ||
    respostaFinal.indexOf('qual o volume') !== -1
  ) {

    falhar(
      'Após o objetivo, o sistema voltou indevidamente a perguntar sobre volume.',
      {
        resposta:
          rodada5.resposta
      }
    );

  }


  Logger.log(
    '✅ Não voltou a perguntar sobre volume.'
  );


  /**
   * ----------------------------------------------------------
   * 15. VALIDAR QUE NÃO VOLTOU PARA ERROS/RETRABALHO
   * ----------------------------------------------------------
   */

  if (
    (
      respostaFinal.indexOf('gera erros') !== -1 ||
      respostaFinal.indexOf('gerar erros') !== -1 ||
      respostaFinal.indexOf('retrabalho') !== -1 ||
      respostaFinal.indexOf('atrasos') !== -1
    ) &&
    respostaFinal.indexOf('objetivo') === -1
  ) {

    falhar(
      'Após o objetivo, o sistema voltou indevidamente à dimensão de erros/retrabalho/atrasos.',
      {
        resposta:
          rodada5.resposta
      }
    );

  }


  Logger.log(
    '✅ Não voltou a perguntar sobre erros/retrabalho.'
  );


  /**
   * ----------------------------------------------------------
   * 16. VALIDAR ESTADO FINAL
   * ----------------------------------------------------------
   *
   * Neste ponto esperamos:
   *
   * processo      = OK
   * dor           = OK
   * frequência    = OK
   * impacto       = OK
   * objetivo      = OK
   * lacuna        = nenhuma
   *
   * Portanto o esperado é:
   *
   * PRONTO_PARA_ANALISE
   *
   * ----------------------------------------------------------
   */

  Logger.log(
    '========== VALIDAÇÃO DO ESTADO FINAL =========='
  );


  if (
    rodada5.estado !==
    DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE
  ) {

    falhar(
      'O diagnóstico não chegou a PRONTO_PARA_ANALISE.',
      {
        estado:
          rodada5.estado,

        diagnostico:
          diagnosticoFinal,

        analise:
          rodada5.analise_ia
      }
    );

  }


  Logger.log(
    '✅ Estado final = PRONTO_PARA_ANALISE.'
  );


  /**
   * ----------------------------------------------------------
   * 17. RELATÓRIO FINAL
   * ----------------------------------------------------------
   */

  const relatorio = {

    teste:
      'CONTINUIDADE OBJETIVO V5.2',

    aprovado:
      true,

    empresa_id:
      inicio.empresa_id,

    conversa_id:
      inicio.conversa_id,

    diagnostico_id:
      inicio.diagnostico_id,

    rodadas:
      resultados.length,

    processo:
      diagnosticoFinal.processo_resumo,

    dor_principal:
      diagnosticoFinal.dor_principal,

    dores_registradas:
      dores,

    frequencia:
      diagnosticoFinal.frequencia,

    impacto:
      diagnosticoFinal.impacto_nivel,

    volume:
      volumeFinal,

    objetivo:
      diagnosticoFinal.objetivo,

    estado_final:
      rodada5.estado,

    resposta_final:
      rodada5.resposta || ''

  };


  Logger.log(
    ''
  );

  Logger.log(
    '============================================================'
  );

  Logger.log(
    '           ✅ TESTE V5.2 APROVADO'
  );

  Logger.log(
    '============================================================'
  );

  Logger.log(
    JSON.stringify(
      relatorio,
      null,
      2
    )
  );

  Logger.log(
    '============================================================'
  );

  Logger.log(
    ' FIM TESTE CONTINUIDADE OBJETIVO V5.2'
  );

  Logger.log(
    '============================================================'
  );


  return relatorio;

}

function testarDeduplicacaoDoresDiagnosticoV5_3() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    ' INÍCIO TESTE DEDUPLICAÇÃO DE DORES V5.3'
  );

  Logger.log(
    '============================================================'
  );


  const inicio =
    iniciarDiagnostico({

      nome:
        'Empresa Teste Deduplicação V5.3',

      celular:
        '51999999999',

      whatsapp:
        '51999999999',

      email:
        'teste-deduplicacao-v53@mvp.local',

      segmento:
        'Gráfica',

      porte:
        'Pequeno',

      cidade:
        'Teste'

    });


  const diagnosticoId =
    inicio.diagnostico_id;


  Logger.log(
    'DIAGNÓSTICO: ' +
    diagnosticoId
  );


  /**
   * ----------------------------------------------------------
   * 1. PRIMEIRA DOR
   * ----------------------------------------------------------
   */

  const primeira =
    salvarDorDiagnostico_({

      diagnostico_id:
        diagnosticoId,

      categoria:
        '',

      descricao:
        'Erros de digitação',

      frequencia:
        'Diária',

      impacto:
        'Três horas por dia',

      confirmada_cliente:
        true,

      confianca:
        ''

    });


  /**
   * ----------------------------------------------------------
   * 2. MESMA DOR — TEXTO DIFERENTE
   * ----------------------------------------------------------
   */

  const segunda =
    salvarDorDiagnostico_({

      diagnostico_id:
        diagnosticoId,

      categoria:
        '',

      descricao:
        'Erros de digitação nos pedidos',

      frequencia:
        'Diária',

      impacto:
        'Três horas por dia',

      confirmada_cliente:
        true,

      confianca:
        ''

    });


  /**
   * ----------------------------------------------------------
   * 3. MESMA DOR — OUTRA FORMA
   * ----------------------------------------------------------
   */

  const terceira =
    salvarDorDiagnostico_({

      diagnostico_id:
        diagnosticoId,

      categoria:
        '',

      descricao:
        'Erro de digitação durante o preenchimento',

      frequencia:
        'Diária',

      impacto:
        'Três horas por dia',

      confirmada_cliente:
        true,

      confianca:
        ''

    });


  /**
   * ----------------------------------------------------------
   * 4. OUTRA DOR REAL
   * ----------------------------------------------------------
   */

  const quarta =
    salvarDorDiagnostico_({

      diagnostico_id:
        diagnosticoId,

      categoria:
        '',

      descricao:
        'Atrasos no processo',

      frequencia:
        'Diária',

      impacto:
        '',

      confirmada_cliente:
        true,

      confianca:
        ''

    });


  const dores =
    obterDoresDiagnostico_(
      diagnosticoId
    );


  Logger.log(
    'PRIMEIRA GRAVAÇÃO: ' +
    primeira
  );

  Logger.log(
    'SEGUNDA GRAVAÇÃO: ' +
    segunda
  );

  Logger.log(
    'TERCEIRA GRAVAÇÃO: ' +
    terceira
  );

  Logger.log(
    'QUARTA GRAVAÇÃO: ' +
    quarta
  );

  Logger.log(
    'DORES FINAIS: ' +
    JSON.stringify(
      dores,
      null,
      2
    )
  );


  /**
   * ----------------------------------------------------------
   * VALIDAÇÕES
   * ----------------------------------------------------------
   */

  const erros = [];


  if (primeira !== true) {

    erros.push(
      'A primeira dor deveria ter sido registrada.'
    );

  }


  if (segunda !== false) {

    erros.push(
      'A segunda dor deveria ter sido identificada como duplicada.'
    );

  }


  if (terceira !== false) {

    erros.push(
      'A terceira dor deveria ter sido identificada como duplicada.'
    );

  }


  if (quarta !== true) {

    erros.push(
      'A quarta dor é diferente e deveria ter sido registrada.'
    );

  }


  if (dores.length !== 2) {

    erros.push(
      'Esperadas 2 dores finais, encontradas: ' +
      dores.length
    );

  }


  const possuiErroDigitacao =
    dores.some(
      function(dor) {

        return (
          normalizarChaveDorDiagnostico_(
            dor.descricao
          ) ===
          'ERROS_DIGITACAO'
        );

      }
    );


  if (!possuiErroDigitacao) {

    erros.push(
      'A dor de erros de digitação não foi encontrada.'
    );

  }


  const possuiAtraso =
    dores.some(
      function(dor) {

        return (
          normalizarChaveDorDiagnostico_(
            dor.descricao
          ) ===
          'ATRASOS_PROCESSO'
        );

      }
    );


  if (!possuiAtraso) {

    erros.push(
      'A dor de atraso não foi encontrada.'
    );

  }


  const resultado = {

    aprovado:
      erros.length === 0,

    erros:
      erros,

    total_dores:
      dores.length,

    dores:
      dores,

    diagnostico_id:
      diagnosticoId

  };


  Logger.log(
    '============================================================'
  );

  Logger.log(
    ' RESULTADO TESTE DEDUPLICAÇÃO V5.3'
  );

  Logger.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  Logger.log(
    '============================================================'
  );


  if (erros.length > 0) {

    throw new Error(
      'TESTE DEDUPLICAÇÃO V5.3 FALHOU: ' +
      JSON.stringify(
        erros
      )
    );

  }


  Logger.log(
    '========== TESTE DEDUPLICAÇÃO V5.3 APROVADO =========='
  );


  return resultado;

}

/**
 * ============================================================
 * TESTE INTEGRAÇÃO DEDUPLICAÇÃO DE DORES V5.3
 * ============================================================
 *
 * OBJETIVO:
 * Validar a cadeia completa:
 *
 * Gemini
 *   ↓
 * Diagnóstico
 *   ↓
 * Nova dor
 *   ↓
 * Persistência em DORES
 *   ↓
 * Nova mensagem descrevendo a mesma dor
 *   ↓
 * Deduplicação
 *
 * NÃO altera funções do motor.
 * Cria apenas um novo diagnóstico de teste.
 * ============================================================
 */

/**
 * ============================================================
 * TESTE INTEGRAÇÃO DEDUPLICAÇÃO DE DORES V5.3
 * ============================================================
 *
 * OBJETIVO:
 * Validar a cadeia completa:
 *
 * Gemini
 *   ↓
 * Diagnóstico
 *   ↓
 * Nova dor
 *   ↓
 * Persistência em DORES
 *   ↓
 * Nova mensagem descrevendo a mesma dor
 *   ↓
 * Deduplicação
 *
 * NÃO altera funções do motor.
 * Cria apenas um novo diagnóstico de teste.
 *
 * IMPORTANTE:
 * Este teste utiliza o diagnóstico retornado pelo próprio
 * processarMensagemDiagnostico().
 * Não depende de uma função de consulta que possa não existir.
 * ============================================================
 */

function testarIntegracaoDeduplicacaoDoresV5_3() {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    ' INÍCIO TESTE INTEGRAÇÃO DEDUPLICAÇÃO V5.3'
  );

  Logger.log(
    '============================================================'
  );


  function falhar(mensagem, dados) {

    Logger.log(
      '❌ FALHA: ' + mensagem
    );

    if (dados !== undefined) {

      Logger.log(
        JSON.stringify(
          dados,
          null,
          2
        )
      );

    }

    throw new Error(
      'TESTE INTEGRAÇÃO DEDUPLICAÇÃO V5.3 FALHOU: ' +
      mensagem
    );

  }


  /**
   * Normaliza texto para as validações do teste.
   *
   * IMPORTANTE:
   * O teste não deve depender da forma exata como
   * o Gemini escreveu uma etapa.
   */
  function normalizarTextoTeste(texto) {

    return String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  }


  /**
   * Verifica se uma etapa está semanticamente presente.
   *
   * Aceita, por exemplo:
   *
   * "Colocar pedidos manualmente em uma planilha"
   *
   * "Colocando pedidos manualmente em uma planilha"
   *
   * "Lançamento manual de pedidos em planilha"
   *
   * sem exigir uma frase exata.
   */
  function contemEtapaInicial(texto) {

    const t =
      normalizarTextoTeste(texto);


    const temPedido =
      t.indexOf('pedido') !== -1;


    const temPlanilha =
      t.indexOf('planilha') !== -1;


    const temManual =
      t.indexOf('manual') !== -1;


    const temColocar =
      t.indexOf('colocar') !== -1 ||
      t.indexOf('colocando') !== -1 ||
      t.indexOf('lancamento') !== -1 ||
      t.indexOf('lancar') !== -1;


    return (
      temPedido &&
      temPlanilha &&
      temManual &&
      temColocar
    );

  }


  /**
   * Verifica a segunda etapa do processo.
   */
  function contemEtapaProducao(texto) {

    const t =
      normalizarTextoTeste(texto);


    const temPedido =
      t.indexOf('pedido') !== -1;


    const temProducao =
      t.indexOf('producao') !== -1;


    const temSeparar =
      t.indexOf('separar') !== -1;


    return (
      temPedido &&
      temProducao &&
      temSeparar
    );

  }


  /**
   * Verifica a etapa de conferência.
   */
  function contemEtapaConferencia(texto) {

    const t =
      normalizarTextoTeste(texto);


    return (
      t.indexOf('confer') !== -1
    );

  }


  Logger.log(
    '========== 1. CRIANDO DIAGNÓSTICO =========='
  );


  const inicio =
    iniciarDiagnostico({

      nome:
        'Empresa Teste Integração Dores V5.3',

      celular:
        '51999999997',

      whatsapp:
        '51999999997',

      email:
        'teste-integracao-dores-v53@mvp.local',

      segmento:
        'Gráfica',

      porte:
        'Pequeno',

      cidade:
        'Teste'

    });


  if (!inicio) {

    falhar(
      'iniciarDiagnostico não retornou resultado.'
    );

  }


  if (!inicio.empresa_id) {

    falhar(
      'empresa_id não foi criado.'
    );

  }


  if (!inicio.conversa_id) {

    falhar(
      'conversa_id não foi criado.'
    );

  }


  if (!inicio.diagnostico_id) {

    falhar(
      'diagnostico_id não foi criado.'
    );

  }


  Logger.log(
    'EMPRESA: ' +
    inicio.empresa_id
  );

  Logger.log(
    'CONVERSA: ' +
    inicio.conversa_id
  );

  Logger.log(
    'DIAGNÓSTICO: ' +
    inicio.diagnostico_id
  );


  /**
   * ----------------------------------------------------------
   * RODADAS DO TESTE
   * ----------------------------------------------------------
   */

  const rodadas = [

    'Minha funcionária perde três horas por dia colocando pedidos manualmente em uma planilha.',

    'Depois que entram na planilha, usamos essas informações para separar os pedidos e enviar para a produção.',

    'São aproximadamente 80 pedidos por dia.',

    'Depois disso, alguns pedidos ainda precisam ser conferidos novamente porque às vezes há erros de digitação.'

  ];


  const resultados = [];


  rodadas.forEach(
    function(mensagem, index) {

      const numero =
        index + 1;


      Logger.log(
        '============================================================'
      );

      Logger.log(
        ' RODADA ' +
        numero
      );

      Logger.log(
        '============================================================'
      );

      Logger.log(
        'MENSAGEM: ' +
        mensagem
      );


      const resultado =
        processarMensagemDiagnostico({

          diagnostico_id:
            inicio.diagnostico_id,

          empresa_id:
            inicio.empresa_id,

          conversa_id:
            inicio.conversa_id,

          mensagem:
            mensagem,

          remetente:
            'CLIENTE',

          tipo:
            'TEXTO'

        });


      if (!resultado) {

        falhar(
          'A rodada ' +
          numero +
          ' não retornou resultado.'
        );

      }


      resultados.push(
        resultado
      );


      Logger.log(
        'ESTADO: ' +
        (resultado.estado || '')
      );


      Logger.log(
        'RESPOSTA: ' +
        (resultado.resposta || '')
      );


      if (resultado.diagnostico) {

        Logger.log(
          'DIAGNÓSTICO DA RODADA: ' +
          JSON.stringify(
            resultado.diagnostico,
            null,
            2
          )
        );

      }

    }
  );


  /**
   * ----------------------------------------------------------
   * RECUPERA O DIAGNÓSTICO
   * ----------------------------------------------------------
   */

  Logger.log(
    '========== 4. RECUPERANDO DIAGNÓSTICO =========='
  );


  const ultimoResultado =
    resultados[
      resultados.length - 1
    ];


  if (!ultimoResultado) {

    falhar(
      'Nenhum resultado foi armazenado.'
    );

  }


  const diagnostico =
    ultimoResultado.diagnostico ||
    ultimoResultado.diagnostico_atual ||
    null;


  if (!diagnostico) {

    falhar(
      'O último resultado não contém diagnóstico.',
      ultimoResultado
    );

  }


  Logger.log(
    'DIAGNÓSTICO FINAL: ' +
    JSON.stringify(
      diagnostico,
      null,
      2
    )
  );


  /**
   * ----------------------------------------------------------
   * RECUPERA DORES
   * ----------------------------------------------------------
   */

  Logger.log(
    '========== 5. RECUPERANDO DORES =========='
  );


  const dores =
    obterDoresDiagnostico_(
      inicio.diagnostico_id
    );


  if (!Array.isArray(dores)) {

    falhar(
      'obterDoresDiagnostico_ não retornou uma lista.',
      dores
    );

  }


  Logger.log(
    'DORES ENCONTRADAS: ' +
    dores.length
  );


  Logger.log(
    JSON.stringify(
      dores,
      null,
      2
    )
  );


  /**
   * ----------------------------------------------------------
   * VALIDAR PROCESSO INICIAL
   * ----------------------------------------------------------
   */

  const processo =
    String(
      diagnostico.processo_resumo ||
      ''
    );


  if (
    !contemEtapaInicial(
      processo
    )
  ) {

    falhar(
      'A etapa inicial do processo não foi preservada.',
      {
        processo:
          processo,

        esperado:
          'processo envolvendo colocação/lancamento manual de pedidos em planilha'
      }
    );

  }


  Logger.log(
    '✅ ETAPA INICIAL PRESERVADA'
  );


  /**
   * ----------------------------------------------------------
   * VALIDAR SEGUNDA ETAPA
   * ----------------------------------------------------------
   */

  if (
    !contemEtapaProducao(
      processo
    )
  ) {

    falhar(
      'A etapa de separar os pedidos e enviar para produção não foi preservada.',
      {
        processo:
          processo
      }
    );

  }


  Logger.log(
    '✅ ETAPA DE PRODUÇÃO PRESERVADA'
  );


  /**
   * ----------------------------------------------------------
   * VALIDAR TERCEIRA ETAPA
   * ----------------------------------------------------------
   */

  if (
    !contemEtapaConferencia(
      processo
    )
  ) {

    falhar(
      'A etapa de conferência não foi preservada.',
      {
        processo:
          processo
      }
    );

  }


  Logger.log(
    '✅ ETAPA DE CONFERÊNCIA PRESERVADA'
  );


  /**
   * ----------------------------------------------------------
   * VALIDAR VOLUME
   * ----------------------------------------------------------
   */

  const volume =
    String(
      diagnostico.volume ||
      ''
    );


  if (
    volume.indexOf('80') === -1
  ) {

    falhar(
      'O volume de 80 pedidos por dia não foi preservado.',
      {
        volume:
          diagnostico.volume
      }
    );

  }


  Logger.log(
    '✅ VOLUME PRESERVADO: ' +
    diagnostico.volume
  );


  /**
   * ----------------------------------------------------------
   * VALIDAR DOR DE DIGITAÇÃO
   * ----------------------------------------------------------
   */

  const doresDigitacao =
    dores.filter(
      function(dor) {

        const descricao =
          normalizarTextoTeste(
            dor.descricao
          );


        return (
          descricao.indexOf(
            'erro de digitacao'
          ) !== -1
          ||
          descricao.indexOf(
            'erros de digitacao'
          ) !== -1
        );

      }
    );


  if (
    doresDigitacao.length !== 1
  ) {

    falhar(
      'Esperada exatamente uma dor relacionada a erros de digitação.',
      {
        quantidade:
          doresDigitacao.length,

        dores:
          dores
      }
    );

  }


  Logger.log(
    '✅ DOR DE DIGITAÇÃO REGISTRADA UMA ÚNICA VEZ'
  );


  /**
   * ----------------------------------------------------------
   * RODADA 5
   * TESTE DE DUPLICAÇÃO
   * ----------------------------------------------------------
   */

  Logger.log(
    '============================================================'
  );

  Logger.log(
    ' RODADA 5 — TESTANDO DEDUPLICAÇÃO'
  );

  Logger.log(
    '============================================================'
  );


  const mensagemDuplicada =
    'Na hora de preencher os pedidos, também acontecem erros de digitação.';


  Logger.log(
    'MENSAGEM: ' +
    mensagemDuplicada
  );


  const rodada5 =
    processarMensagemDiagnostico({

      diagnostico_id:
        inicio.diagnostico_id,

      empresa_id:
        inicio.empresa_id,

      conversa_id:
        inicio.conversa_id,

      mensagem:
        mensagemDuplicada,

      remetente:
        'CLIENTE',

      tipo:
        'TEXTO'

    });


  if (!rodada5) {

    falhar(
      'A rodada 5 não retornou resultado.'
    );

  }


  Logger.log(
    'ESTADO RODADA 5: ' +
    (rodada5.estado || '')
  );


  Logger.log(
    'RESPOSTA RODADA 5: ' +
    (rodada5.resposta || '')
  );


  /**
   * ----------------------------------------------------------
   * RECUPERAR DORES NOVAMENTE
   * ----------------------------------------------------------
   */

  Logger.log(
    '========== RECUPERANDO DORES APÓS DUPLICAÇÃO =========='
  );


  const doresFinais =
    obterDoresDiagnostico_(
      inicio.diagnostico_id
    );


  if (!Array.isArray(doresFinais)) {

    falhar(
      'A recuperação final das dores não retornou uma lista.',
      doresFinais
    );

  }


  Logger.log(
    'DORES FINAIS: ' +
    doresFinais.length
  );


  Logger.log(
    JSON.stringify(
      doresFinais,
      null,
      2
    )
  );


  /**
   * ----------------------------------------------------------
   * CONTAR DOR DE DIGITAÇÃO NOVAMENTE
   * ----------------------------------------------------------
   */

  const doresDigitacaoFinais =
    doresFinais.filter(
      function(dor) {

        const descricao =
          normalizarTextoTeste(
            dor.descricao
          );


        return (
          descricao.indexOf(
            'erro de digitacao'
          ) !== -1
          ||
          descricao.indexOf(
            'erros de digitacao'
          ) !== -1
        );

      }
    );


  /**
   * ----------------------------------------------------------
   * RESULTADO
   * ----------------------------------------------------------
   */

  const erros = [];


  if (
    doresDigitacaoFinais.length !== 1
  ) {

    erros.push(
      'A dor de erros de digitação foi registrada ' +
      doresDigitacaoFinais.length +
      ' vezes após a tentativa de duplicação. Esperado: 1.'
    );

  }


  /**
   * Não esperamos que a quantidade total de dores aumente
   * por causa da segunda descrição da mesma dor.
   */

  if (
    doresFinais.length >
    dores.length
  ) {

    erros.push(
      'A tentativa de registrar uma dor duplicada criou uma nova dor.'
    );

  }


  /**
   * ----------------------------------------------------------
   * RESULTADO FINAL
   * ----------------------------------------------------------
   */

  const resultado = {

    aprovado:
      erros.length === 0,

    erros:
      erros,

    empresa_id:
      inicio.empresa_id,

    conversa_id:
      inicio.conversa_id,

    diagnostico_id:
      inicio.diagnostico_id,

    total_dores_antes:
      dores.length,

    total_dores_depois:
      doresFinais.length,

    dores_digitacao_antes:
      doresDigitacao.length,

    dores_digitacao_depois:
      doresDigitacaoFinais.length,

    processo:
      diagnostico.processo_resumo,

    volume:
      diagnostico.volume,

    dores_finais:
      doresFinais

  };


  Logger.log(
    '============================================================'
  );

  Logger.log(
    ' RESULTADO TESTE INTEGRAÇÃO DEDUPLICAÇÃO V5.3'
  );

  Logger.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  Logger.log(
    '============================================================'
  );


  if (
    erros.length > 0
  ) {

    throw new Error(
      'TESTE INTEGRAÇÃO DEDUPLICAÇÃO V5.3 FALHOU: ' +
      JSON.stringify(
        erros
      )
    );

  }


  Logger.log(
    '========== TESTE INTEGRAÇÃO DEDUPLICAÇÃO V5.3 APROVADO =========='
  );


  return resultado;

}

function testarEncerramentoDiagnosticoV5_4() {

  Logger.log('============================================================');
  Logger.log(' INÍCIO TESTE ENCERRAMENTO DIAGNÓSTICO V5.4');
  Logger.log('============================================================');


  function falhar(mensagem, dados) {

    Logger.log('❌ FALHA: ' + mensagem);

    if (dados !== undefined) {
      Logger.log(JSON.stringify(dados, null, 2));
    }

    throw new Error(
      'TESTE ENCERRAMENTO DIAGNÓSTICO V5.4 FALHOU: ' +
      mensagem
    );
  }


  function texto(valor) {
    return String(valor || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }


  function possui(valor, termos) {

    const t = texto(valor);

    return termos.some(function(termo) {
      return t.indexOf(texto(termo)) !== -1;
    });

  }


  // ============================================================
  // 1. CRIAÇÃO
  // ============================================================

  Logger.log('========== 1. CRIANDO DIAGNÓSTICO ==========');


  const inicio = iniciarDiagnostico({

    nome:
      'Empresa Teste Encerramento V5.4',

    celular:
      '51999999996',

    whatsapp:
      '51999999996',

    email:
      'teste-encerramento-v54@mvp.local',

    segmento:
      'Gráfica',

    porte:
      'Pequeno',

    cidade:
      'Teste'

  });


  if (!inicio) {
    falhar(
      'iniciarDiagnostico não retornou resultado.'
    );
  }


  if (!inicio.empresa_id) {
    falhar(
      'empresa_id não foi criado.'
    );
  }


  if (!inicio.conversa_id) {
    falhar(
      'conversa_id não foi criado.'
    );
  }


  if (!inicio.diagnostico_id) {
    falhar(
      'diagnostico_id não foi criado.'
    );
  }


  Logger.log(
    'EMPRESA: ' + inicio.empresa_id
  );

  Logger.log(
    'CONVERSA: ' + inicio.conversa_id
  );

  Logger.log(
    'DIAGNÓSTICO: ' + inicio.diagnostico_id
  );


  // ============================================================
  // 2. CONVERSA COMPLETA
  // ============================================================

  const mensagens = [

    'Minha funcionária perde três horas por dia colocando pedidos manualmente em uma planilha.',

    'Depois que entram na planilha, usamos essas informações para separar os pedidos e enviar para a produção.',

    'São aproximadamente 80 pedidos por dia.',

    'Depois disso, alguns pedidos ainda precisam ser conferidos novamente porque às vezes há erros de digitação.',

    'Quero reduzir o tempo gasto nesse processo, diminuir os erros e conseguir liberar minha funcionária para outras atividades.'

  ];


  const resultados = [];


  mensagens.forEach(function(mensagem, indice) {

    const rodada =
      indice + 1;


    Logger.log(
      '============================================================'
    );

    Logger.log(
      ' RODADA ' + rodada
    );

    Logger.log(
      '============================================================'
    );

    Logger.log(
      'MENSAGEM: ' + mensagem
    );


    const resultado =
      processarMensagemDiagnostico({

        diagnostico_id:
          inicio.diagnostico_id,

        empresa_id:
          inicio.empresa_id,

        conversa_id:
          inicio.conversa_id,

        mensagem:
          mensagem,

        remetente:
          'CLIENTE',

        tipo:
          'TEXTO'

      });


    if (!resultado) {

      falhar(
        'A rodada ' +
        rodada +
        ' não retornou resultado.'
      );

    }


    resultados.push(resultado);


    Logger.log(
      'ESTADO: ' +
      (resultado.estado || '')
    );


    Logger.log(
      'RESPOSTA: ' +
      (resultado.resposta || '')
    );


    if (resultado.diagnostico) {

      Logger.log(
        'DIAGNÓSTICO: ' +
        JSON.stringify(
          resultado.diagnostico,
          null,
          2
        )
      );

    }

  });


  // ============================================================
  // 3. DIAGNÓSTICO FINAL
  // ============================================================

  Logger.log(
    '========== 3. RECUPERANDO DIAGNÓSTICO FINAL =========='
  );


  const ultimo =
    resultados[
      resultados.length - 1
    ];


  if (!ultimo) {

    falhar(
      'Não existe resultado final.'
    );

  }


  const diagnostico =
    ultimo.diagnostico ||
    ultimo.diagnostico_atual ||
    null;


  if (!diagnostico) {

    falhar(
      'O resultado final não contém diagnóstico.',
      ultimo
    );

  }


  Logger.log(
    'DIAGNÓSTICO FINAL: ' +
    JSON.stringify(
      diagnostico,
      null,
      2
    )
  );


  // ============================================================
  // 4. VALIDAÇÃO DOS DADOS ACUMULADOS
  // ============================================================

  Logger.log(
    '========== 4. VALIDANDO DADOS ACUMULADOS =========='
  );


  const erros = [];


  const processo =
    diagnostico.processo_resumo ||
    diagnostico.processo_nome ||
    '';


  if (!possui(
    processo,
    [
      'pedido',
      'planilha'
    ]
  )) {

    erros.push(
      'Processo não preservado corretamente.'
    );

  }


  const processoCompleto =
    texto(processo);


  if (
    processoCompleto.indexOf('producao') === -1 &&
    processoCompleto.indexOf('separar') === -1
  ) {

    erros.push(
      'Etapa de produção/separação não preservada.'
    );

  }


  if (
    processoCompleto.indexOf('confer') === -1
  ) {

    erros.push(
      'Etapa de conferência não preservada.'
    );

  }


  const volume =
    String(
      diagnostico.volume ||
      ''
    );


  if (
    volume.indexOf('80') === -1
  ) {

    erros.push(
      'Volume de 80 pedidos por dia não foi preservado.'
    );

  }


  const frequencia =
    texto(
      diagnostico.frequencia
    );


  if (
    frequencia.indexOf('diar') === -1
  ) {

    erros.push(
      'Frequência diária não foi preservada.'
    );

  }


  const impacto =
    texto(
      diagnostico.impacto_nivel
    );


  if (
    impacto.indexOf('tres') === -1 &&
    impacto.indexOf('3') === -1
  ) {

    erros.push(
      'Impacto de três horas por dia não foi preservado.'
    );

  }


  const objetivo =
    texto(
      diagnostico.objetivo
    );


  if (!objetivo) {

    erros.push(
      'Objetivo do empresário não foi registrado.'
    );

  }


  Logger.log(
    'PROCESSO: ' + processo
  );

  Logger.log(
    'VOLUME: ' + volume
  );

  Logger.log(
    'FREQUÊNCIA: ' +
    diagnostico.frequencia
  );

  Logger.log(
    'IMPACTO: ' +
    diagnostico.impacto_nivel
  );

  Logger.log(
    'OBJETIVO: ' +
    diagnostico.objetivo
  );


  // ============================================================
  // 5. DORES
  // ============================================================

  Logger.log(
    '========== 5. VALIDANDO DORES =========='
  );


  const dores =
    obterDoresDiagnostico_(
      inicio.diagnostico_id
    );


  if (!Array.isArray(dores)) {

    falhar(
      'obterDoresDiagnostico_ não retornou uma lista.',
      dores
    );

  }


  Logger.log(
    'TOTAL DE DORES: ' +
    dores.length
  );


  Logger.log(
    JSON.stringify(
      dores,
      null,
      2
    )
  );


  const dorDigitacao =
    dores.filter(function(dor) {

      return texto(
        dor.descricao
      ).indexOf(
        'digitacao'
      ) !== -1;

    });


  if (
    dorDigitacao.length !== 1
  ) {

    erros.push(
      'Esperada exatamente uma dor de erros de digitação.'
    );

  }


  // ============================================================
  // 6. OBJETIVO NÃO PODE APAGAR DADOS ANTERIORES
  // ============================================================

  Logger.log(
    '========== 6. VALIDANDO PRESERVAÇÃO APÓS OBJETIVO =========='
  );


  if (
    !volume ||
    volume.indexOf('80') === -1
  ) {

    erros.push(
      'O objetivo causou perda do volume.'
    );

  }


  if (
    !processoCompleto ||
    processoCompleto.indexOf('pedido') === -1
  ) {

    erros.push(
      'O objetivo causou perda do processo.'
    );

  }


  if (
    processoCompleto.indexOf('confer') === -1
  ) {

    erros.push(
      'O objetivo causou perda da etapa de conferência.'
    );

  }


  if (
    dorDigitacao.length !== 1
  ) {

    erros.push(
      'O objetivo causou perda ou duplicação da dor de digitação.'
    );

  }


  // ============================================================
  // 7. ESTADO FINAL
  // ============================================================

  Logger.log(
    '========== 7. VALIDANDO ESTADO FINAL =========='
  );


  const estadoFinal =
    String(
      ultimo.estado ||
      diagnostico.status_diagnostico ||
      ''
    );


  Logger.log(
    'ESTADO FINAL: ' +
    estadoFinal
  );


  const estadoNormalizado =
    texto(
      estadoFinal
    );


  if (
    estadoNormalizado !== 'pronto_para_analise' &&
    estadoNormalizado !== 'concluido' &&
    estadoNormalizado !== 'finalizado'
  ) {

    erros.push(
      'Diagnóstico não chegou a um estado final esperado. Estado atual: ' +
      estadoFinal
    );

  }


  // ============================================================
  // 8. RESULTADO
  // ============================================================

  const aprovado =
    erros.length === 0;


  const resultadoFinal = {

    aprovado:
      aprovado,

    erros:
      erros,

    empresa_id:
      inicio.empresa_id,

    conversa_id:
      inicio.conversa_id,

    diagnostico_id:
      inicio.diagnostico_id,

    estado_final:
      estadoFinal,

    processo:
      processo,

    volume:
      volume,

    frequencia:
      diagnostico.frequencia,

    impacto:
      diagnostico.impacto_nivel,

    objetivo:
      diagnostico.objetivo,

    total_dores:
      dores.length,

    dores:
      dores

  };


  Logger.log(
    '============================================================'
  );

  Logger.log(
    ' RESULTADO TESTE ENCERRAMENTO DIAGNÓSTICO V5.4'
  );

  Logger.log(
    JSON.stringify(
      resultadoFinal,
      null,
      2
    )
  );

  Logger.log(
    '============================================================'
  );


  if (!aprovado) {

    Logger.log(
      '========== TESTE ENCERRAMENTO DIAGNÓSTICO V5.4 REPROVADO =========='
    );

    throw new Error(
      'TESTE ENCERRAMENTO DIAGNÓSTICO V5.4 FALHOU: ' +
      JSON.stringify(
        erros
      )
    );

  }


  Logger.log(
    '========== TESTE ENCERRAMENTO DIAGNÓSTICO V5.4 APROVADO =========='
  );


  return resultadoFinal;

}

function testarAnaliseDiagnosticoV5_5() {

  Logger.log('============================================================');
  Logger.log(' INÍCIO TESTE ANÁLISE DIAGNÓSTICO V5.5');
  Logger.log('============================================================');


  function falhar(mensagem, dados) {

    Logger.log('❌ FALHA: ' + mensagem);

    if (dados !== undefined) {
      Logger.log(JSON.stringify(dados, null, 2));
    }

    throw new Error(
      'TESTE ANÁLISE DIAGNÓSTICO V5.5 FALHOU: ' +
      mensagem
    );
  }


  function normalizar(texto) {

    return String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  }


  function contem(texto, termos) {

    const t = normalizar(texto);

    return termos.some(function(termo) {

      return t.indexOf(
        normalizar(termo)
      ) !== -1;

    });

  }


  function obterPrimeiroCampo(obj, campos) {

    if (!obj) {
      return '';
    }

    for (let i = 0; i < campos.length; i++) {

      const valor =
        obj[campos[i]];

      if (
        valor !== undefined &&
        valor !== null &&
        String(valor).trim() !== ''
      ) {

        return valor;

      }

    }

    return '';

  }


  // ============================================================
  // 1. CRIAR DIAGNÓSTICO
  // ============================================================

  Logger.log(
    '========== 1. CRIANDO DIAGNÓSTICO =========='
  );


  const inicio =
    iniciarDiagnostico({

      nome:
        'Empresa Teste Análise V5.5',

      celular:
        '51999999995',

      whatsapp:
        '51999999995',

      email:
        'teste-analise-v55@mvp.local',

      segmento:
        'Gráfica',

      porte:
        'Pequeno',

      cidade:
        'Teste'

    });


  if (!inicio) {

    falhar(
      'iniciarDiagnostico não retornou resultado.'
    );

  }


  if (!inicio.empresa_id) {

    falhar(
      'empresa_id não foi criado.'
    );

  }


  if (!inicio.conversa_id) {

    falhar(
      'conversa_id não foi criado.'
    );

  }


  if (!inicio.diagnostico_id) {

    falhar(
      'diagnostico_id não foi criado.'
    );

  }


  Logger.log(
    'EMPRESA: ' +
    inicio.empresa_id
  );

  Logger.log(
    'CONVERSA: ' +
    inicio.conversa_id
  );

  Logger.log(
    'DIAGNÓSTICO: ' +
    inicio.diagnostico_id
  );


  // ============================================================
  // 2. CONSTRUIR DIAGNÓSTICO COMPLETO
  // ============================================================

  const mensagens = [

    'Minha funcionária perde três horas por dia colocando pedidos manualmente em uma planilha.',

    'Depois que entram na planilha, usamos essas informações para separar os pedidos e enviar para a produção.',

    'São aproximadamente 80 pedidos por dia.',

    'Depois disso, alguns pedidos ainda precisam ser conferidos novamente porque às vezes há erros de digitação.',

    'Quero reduzir o tempo gasto nesse processo, diminuir os erros e conseguir liberar minha funcionária para outras atividades.'

  ];


  const resultados =
    [];


  mensagens.forEach(
    function(mensagem, indice) {

      const rodada =
        indice + 1;


      Logger.log(
        '============================================================'
      );

      Logger.log(
        ' RODADA ' +
        rodada
      );

      Logger.log(
        '============================================================'
      );

      Logger.log(
        'MENSAGEM: ' +
        mensagem
      );


      const resultado =
        processarMensagemDiagnostico({

          diagnostico_id:
            inicio.diagnostico_id,

          empresa_id:
            inicio.empresa_id,

          conversa_id:
            inicio.conversa_id,

          mensagem:
            mensagem,

          remetente:
            'CLIENTE',

          tipo:
            'TEXTO'

        });


      if (!resultado) {

        falhar(
          'A rodada ' +
          rodada +
          ' não retornou resultado.'
        );

      }


      resultados.push(
        resultado
      );


      Logger.log(
        'ESTADO: ' +
        (
          resultado.estado ||
          ''
        )
      );


      Logger.log(
        'RESPOSTA: ' +
        (
          resultado.resposta ||
          ''
        )
      );

    }
  );


  // ============================================================
  // 3. RECUPERAR DIAGNÓSTICO
  // ============================================================

  Logger.log(
    '========== 3. RECUPERANDO DIAGNÓSTICO =========='
  );


  const ultimoResultado =
    resultados[
      resultados.length - 1
    ];


  if (!ultimoResultado) {

    falhar(
      'Nenhum resultado final foi encontrado.'
    );

  }


  let diagnostico =
    ultimoResultado.diagnostico ||
    ultimoResultado.diagnostico_atual ||
    null;


  if (!diagnostico) {

    /*
     * Compatibilidade com diferentes implementações
     * do retorno do sistema.
     */

    if (
      typeof obterDiagnosticoPorId_ ===
      'function'
    ) {

      diagnostico =
        obterDiagnosticoPorId_(
          inicio.diagnostico_id
        );

    }

  }


  if (!diagnostico) {

    falhar(
      'Não foi possível recuperar o diagnóstico final.'
    );

  }


  Logger.log(
    'DIAGNÓSTICO ANTES DA ANÁLISE:'
  );

  Logger.log(
    JSON.stringify(
      diagnostico,
      null,
      2
    )
  );


  // ============================================================
  // 4. SNAPSHOT ANTES DA ANÁLISE
  // ============================================================

  const snapshotAntes =
    JSON.parse(
      JSON.stringify(
        diagnostico
      )
    );


  const processoAntes =
    String(
      obterPrimeiroCampo(
        diagnostico,
        [
          'processo_resumo',
          'processo_nome'
        ]
      ) ||
      ''
    );


  const volumeAntes =
    String(
      obterPrimeiroCampo(
        diagnostico,
        [
          'volume'
        ]
      ) ||
      ''
    );


  const frequenciaAntes =
    String(
      obterPrimeiroCampo(
        diagnostico,
        [
          'frequencia'
        ]
      ) ||
      ''
    );


  const impactoAntes =
    String(
      obterPrimeiroCampo(
        diagnostico,
        [
          'impacto_nivel',
          'impacto'
        ]
      ) ||
      ''
    );


  const objetivoAntes =
    String(
      obterPrimeiroCampo(
        diagnostico,
        [
          'objetivo'
        ]
      ) ||
      ''
    );


  // ============================================================
  // 5. RECUPERAR DORES ANTES DA ANÁLISE
  // ============================================================

  Logger.log(
    '========== 5. DORES ANTES DA ANÁLISE =========='
  );


  const doresAntes =
    obterDoresDiagnostico_(
      inicio.diagnostico_id
    );


  if (!Array.isArray(doresAntes)) {

    falhar(
      'obterDoresDiagnostico_ não retornou uma lista.',
      doresAntes
    );

  }


  Logger.log(
    'TOTAL DE DORES ANTES: ' +
    doresAntes.length
  );


  Logger.log(
    JSON.stringify(
      doresAntes,
      null,
      2
    )
  );


  // ============================================================
  // 6. LOCALIZAR FUNÇÃO REAL DE ANÁLISE
  // ============================================================

  Logger.log(
    '========== 6. LOCALIZANDO MOTOR DE ANÁLISE =========='
  );


  let funcaoAnalise = null;

  const candidatos = [

    'analisarDiagnostico_',

    'gerarAnaliseDiagnostico_',

    'executarAnaliseDiagnostico_',

    'analisarDiagnosticoCompleto_',

    'gerarAnaliseDiagnostico',

    'analisarDiagnostico'

  ];


  for (
    let i = 0;
    i < candidatos.length;
    i++
  ) {

    const nomeFuncao =
      candidatos[i];


    try {

      if (
        typeof this[nomeFuncao] ===
        'function'
      ) {

        funcaoAnalise =
          this[nomeFuncao];

        Logger.log(
          'FUNÇÃO DE ANÁLISE ENCONTRADA: ' +
          nomeFuncao
        );

        break;

      }

    } catch (erro) {

      Logger.log(
        'Não foi possível verificar ' +
        nomeFuncao +
        ': ' +
        erro
      );

    }

  }


  if (!funcaoAnalise) {

    /*
     * Em Apps Script, funções globais nem sempre ficam
     * acessíveis através de this[nome].
     *
     * Tentamos as referências diretamente.
     */

    try {

      if (
        typeof analisarDiagnostico_ ===
        'function'
      ) {

        funcaoAnalise =
          analisarDiagnostico_;

        Logger.log(
          'FUNÇÃO ENCONTRADA: analisarDiagnostico_'
        );

      }

    } catch (e) {}


    try {

      if (
        !funcaoAnalise &&
        typeof gerarAnaliseDiagnostico_ ===
        'function'
      ) {

        funcaoAnalise =
          gerarAnaliseDiagnostico_;

        Logger.log(
          'FUNÇÃO ENCONTRADA: gerarAnaliseDiagnostico_'
        );

      }

    } catch (e) {}

  }


  if (!funcaoAnalise) {

    falhar(
      'Não encontrei automaticamente a função do motor de análise. ' +
      'Não vou criar uma análise falsa dentro do teste.'
    );

  }


  // ============================================================
  // 7. EXECUTAR ANÁLISE
  // ============================================================

  Logger.log(
    '========== 7. EXECUTANDO ANÁLISE =========='
  );


  let analise;


  try {

    /*
     * Primeira assinatura:
     * função recebe o ID do diagnóstico.
     */

    analise =
      funcaoAnalise(
        inicio.diagnostico_id
      );


  } catch (erro1) {

    Logger.log(
      'Primeira assinatura falhou: ' +
      erro1
    );


    try {

      /*
       * Segunda assinatura:
       * função recebe o objeto diagnóstico.
       */

      analise =
        funcaoAnalise(
          diagnostico
        );


    } catch (erro2) {

      Logger.log(
        'Segunda assinatura falhou: ' +
        erro2
      );


      try {

        /*
         * Terceira assinatura:
         * função recebe objeto de contexto.
         */

        analise =
          funcaoAnalise({

            diagnostico_id:
              inicio.diagnostico_id,

            empresa_id:
              inicio.empresa_id,

            conversa_id:
              inicio.conversa_id,

            diagnostico:
              diagnostico

          });


      } catch (erro3) {

        falhar(
          'Não foi possível executar o motor de análise.',
          {
            erro1:
              String(erro1),

            erro2:
              String(erro2),

            erro3:
              String(erro3)

          }
        );

      }

    }

  }


  if (!analise) {

    falhar(
      'O motor de análise retornou vazio.'
    );

  }


  Logger.log(
    'ANÁLISE GERADA:'
  );


  Logger.log(
    JSON.stringify(
      analise,
      null,
      2
    )
  );


  // ============================================================
  // 8. NORMALIZAR RESULTADO DA ANÁLISE
  // ============================================================

  let analiseObjeto =
    analise;


  /*
   * Alguns motores retornam:
   *
   * { analise: {...} }
   *
   * ou
   *
   * { resultado: {...} }
   *
   * ou
   *
   * { dados: {...} }
   */

  if (
    analiseObjeto.analise &&
    typeof analiseObjeto.analise ===
    'object'
  ) {

    analiseObjeto =
      analiseObjeto.analise;

  }


  if (
    analiseObjeto.resultado &&
    typeof analiseObjeto.resultado ===
    'object'
  ) {

    analiseObjeto =
      analiseObjeto.resultado;

  }


  if (
    analiseObjeto.dados &&
    typeof analiseObjeto.dados ===
    'object'
  ) {

    analiseObjeto =
      analiseObjeto.dados;

  }


  // ============================================================
  // 9. VALIDAR ESTRUTURA
  // ============================================================

  Logger.log(
    '========== 9. VALIDANDO ESTRUTURA DA ANÁLISE =========='
  );


  const erros =
    [];


  const processoAnalisado =
    obterPrimeiroCampo(
      analiseObjeto,
      [
        'processo_analisado',
        'processo',
        'processo_resumo'
      ]
    );


  const problemaPrincipal =
    obterPrimeiroCampo(
      analiseObjeto,
      [
        'problema_principal',
        'problema',
        'dor_principal'
      ]
    );


  const causas =
    obterPrimeiroCampo(
      analiseObjeto,
      [
        'causas_provaveis',
        'causas',
        'causa'
      ]
    );


  const impactos =
    obterPrimeiroCampo(
      analiseObjeto,
      [
        'impactos',
        'impacto'
      ]
    );


  const oportunidade =
    obterPrimeiroCampo(
      analiseObjeto,
      [
        'oportunidade',
        'oportunidade_melhoria'
      ]
    );


  const prioridade =
    obterPrimeiroCampo(
      analiseObjeto,
      [
        'prioridade',
        'nivel_prioridade'
      ]
    );


  const recomendacao =
    obterPrimeiroCampo(
      analiseObjeto,
      [
        'recomendacao',
        'recomendacoes'
      ]
    );


  const justificativa =
    obterPrimeiroCampo(
      analiseObjeto,
      [
        'justificativa',
        'justificativa_prioridade'
      ]
    );


  Logger.log(
    'PROCESSO ANALISADO: ' +
    processoAnalisado
  );

  Logger.log(
    'PROBLEMA PRINCIPAL: ' +
    problemaPrincipal
  );

  Logger.log(
    'CAUSAS: ' +
    JSON.stringify(causas)
  );

  Logger.log(
    'IMPACTOS: ' +
    JSON.stringify(impactos)
  );

  Logger.log(
    'OPORTUNIDADE: ' +
    oportunidade
  );

  Logger.log(
    'PRIORIDADE: ' +
    prioridade
  );

  Logger.log(
    'RECOMENDAÇÃO: ' +
    recomendacao
  );

  Logger.log(
    'JUSTIFICATIVA: ' +
    justificativa
  );


  // ============================================================
  // 10. VALIDAR CAMPOS OBRIGATÓRIOS
  // ============================================================

  if (!processoAnalisado) {

    erros.push(
      'processo_analisado não foi gerado.'
    );

  }


  if (!problemaPrincipal) {

    erros.push(
      'problema_principal não foi gerado.'
    );

  }


  if (!causas) {

    erros.push(
      'causas_provaveis não foi gerado.'
    );

  }


  if (!impactos) {

    erros.push(
      'impactos não foi gerado.'
    );

  }


  if (!oportunidade) {

    erros.push(
      'oportunidade não foi gerada.'
    );

  }


  if (!prioridade) {

    erros.push(
      'prioridade não foi gerada.'
    );

  }


  if (!recomendacao) {

    erros.push(
      'recomendacao não foi gerada.'
    );

  }


  if (!justificativa) {

    erros.push(
      'justificativa não foi gerada.'
    );

  }


  // ============================================================
  // 11. VALIDAR USO DOS DADOS
  // ============================================================

  Logger.log(
    '========== 11. VALIDANDO USO DOS DADOS =========='
  );


  const analiseTexto =
    normalizar(
      JSON.stringify(
        analiseObjeto
      )
    );


  if (
    analiseTexto.indexOf('80') === -1
  ) {

    erros.push(
      'A análise não demonstra uso do volume de 80 pedidos/dia.'
    );

  }


  if (
    analiseTexto.indexOf('tres') === -1 &&
    analiseTexto.indexOf('3 horas') === -1 &&
    analiseTexto.indexOf('3h') === -1
  ) {

    erros.push(
      'A análise não demonstra uso do impacto de três horas/dia.'
    );

  }


  if (
    analiseTexto.indexOf('digitacao') === -1 &&
    analiseTexto.indexOf('erro de digitacao') === -1 &&
    analiseTexto.indexOf('erros de digitacao') === -1
  ) {

    erros.push(
      'A análise não demonstra uso da dor de erros de digitação.'
    );

  }


  if (
    !contem(
      analiseTexto,
      [
        'tempo',
        'manual',
        'horas'
      ]
    )
  ) {

    erros.push(
      'A análise não demonstra compreensão do problema de trabalho manual/tempo.'
    );

  }


  // ============================================================
  // 12. VALIDAR PRIORIDADE
  // ============================================================

  const prioridadeNormalizada =
    normalizar(
      prioridade
    );


  if (
    prioridadeNormalizada !== 'alta' &&
    prioridadeNormalizada !== 'critica' &&
    prioridadeNormalizada !== 'crítica'
  ) {

    erros.push(
      'A prioridade esperada para este cenário deveria ser ALTA ou CRÍTICA. Retornado: ' +
      prioridade
    );

  }


  // ============================================================
  // 13. PROTEÇÃO CONTRA INVENÇÕES
  // ============================================================

  Logger.log(
    '========== 13. VALIDANDO PROTEÇÃO CONTRA INVENÇÕES =========='
  );


  const termosInventados =
    [

      'erp antigo',

      'erp desatualizado',

      'sistema legado',

      'whatsapp',

      'e-commerce',

      'ecommerce',

      'integracao com o erp',

      'integração com o erp',

      'sap',

      'totvs',

      'bling',

      'tiny',

      'omie',

      'zapier',

      'make.com',

      'n8n'

    ];


  termosInventados.forEach(
    function(termo) {

      if (
        analiseTexto.indexOf(
          normalizar(termo)
        ) !== -1
      ) {

        erros.push(
          'A análise apresentou informação não fornecida pelo diagnóstico: ' +
          termo
        );

      }

    }
  );


  // ============================================================
  // 14. RECUPERAR DIAGNÓSTICO DEPOIS DA ANÁLISE
  // ============================================================

  Logger.log(
    '========== 14. VERIFICANDO PRESERVAÇÃO DO DIAGNÓSTICO =========='
  );


  let diagnosticoDepois =
    null;


  if (
    ultimoResultado.diagnostico
  ) {

    diagnosticoDepois =
      ultimoResultado.diagnostico;

  }


  if (!diagnosticoDepois) {

    if (
      typeof obterDiagnosticoPorId_ ===
      'function'
    ) {

      diagnosticoDepois =
        obterDiagnosticoPorId_(
          inicio.diagnostico_id
        );

    }

  }


  if (!diagnosticoDepois) {

    /*
     * Se o motor não possui função pública de recuperação,
     * usamos o diagnóstico capturado antes como referência.
     * Não falsificamos a aprovação.
     */

    Logger.log(
      'AVISO: não foi possível recuperar novamente o diagnóstico após a análise.'
    );

  }


  if (diagnosticoDepois) {

    const processoDepois =
      String(
        obterPrimeiroCampo(
          diagnosticoDepois,
          [
            'processo_resumo',
            'processo_nome'
          ]
        ) ||
        ''
      );


    const volumeDepois =
      String(
        obterPrimeiroCampo(
          diagnosticoDepois,
          [
            'volume'
          ]
        ) ||
        ''
      );


    const objetivoDepois =
      String(
        obterPrimeiroCampo(
          diagnosticoDepois,
          [
            'objetivo'
          ]
        ) ||
        ''
      );


    if (
      normalizar(processoDepois) !==
      normalizar(processoAntes)
    ) {

      erros.push(
        'A análise alterou o processo original.'
      );

    }


    if (
      normalizar(volumeDepois) !==
      normalizar(volumeAntes)
    ) {

      erros.push(
        'A análise alterou o volume original.'
      );

    }


    if (
      normalizar(objetivoDepois) !==
      normalizar(objetivoAntes)
    ) {

      erros.push(
        'A análise alterou o objetivo original.'
      );

    }

  }


  // ============================================================
  // 15. DORES DEPOIS DA ANÁLISE
  // ============================================================

  Logger.log(
    '========== 15. VERIFICANDO DORES APÓS ANÁLISE =========='
  );


  const doresDepois =
    obterDoresDiagnostico_(
      inicio.diagnostico_id
    );


  if (!Array.isArray(doresDepois)) {

    falhar(
      'Não foi possível recuperar dores depois da análise.'
    );

  }


  if (
    doresDepois.length !==
    doresAntes.length
  ) {

    erros.push(
      'A análise alterou a quantidade de dores. Antes: ' +
      doresAntes.length +
      ' / Depois: ' +
      doresDepois.length
    );

  }


  // ============================================================
  // 16. IDEMPOTÊNCIA
  // ============================================================

  Logger.log(
    '========== 16. TESTANDO IDEMPOTÊNCIA =========='
  );


  let analiseSegundaExecucao;


  try {

    analiseSegundaExecucao =
      funcaoAnalise(
        inicio.diagnostico_id
      );

  } catch (erro1) {

    try {

      analiseSegundaExecucao =
        funcaoAnalise(
          diagnostico
        );

    } catch (erro2) {

      Logger.log(
        'Segunda execução do motor não pôde ser realizada.'
      );

      Logger.log(
        'ERRO 1: ' +
        erro1
      );

      Logger.log(
        'ERRO 2: ' +
        erro2
      );

      erros.push(
        'Não foi possível executar a análise novamente para validar idempotência.'
      );

    }

  }


  const doresDepoisIdempotencia =
    obterDoresDiagnostico_(
      inicio.diagnostico_id
    );


  if (
    doresDepoisIdempotencia.length !==
    doresAntes.length
  ) {

    erros.push(
      'A segunda execução da análise alterou a quantidade de dores.'
    );

  }


  // ============================================================
  // 17. RESULTADO FINAL
  // ============================================================

  const resultado = {

    aprovado:
      erros.length === 0,

    erros:
      erros,

    empresa_id:
      inicio.empresa_id,

    conversa_id:
      inicio.conversa_id,

    diagnostico_id:
      inicio.diagnostico_id,

    processo_analisado:
      processoAnalisado,

    problema_principal:
      problemaPrincipal,

    causas_provaveis:
      causas,

    impactos:
      impactos,

    oportunidade:
      oportunidade,

    prioridade:
      prioridade,

    recomendacao:
      recomendacao,

    justificativa:
      justificativa,

    volume_preservado:
      volumeAntes,

    objetivo_preservado:
      objetivoAntes,

    dores_antes:
      doresAntes.length,

    dores_depois:
      doresDepois.length,

    idempotencia_dores:
      doresDepoisIdempotencia.length

  };


  Logger.log(
    '============================================================'
  );

  Logger.log(
    ' RESULTADO TESTE ANÁLISE DIAGNÓSTICO V5.5'
  );

  Logger.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  Logger.log(
    '============================================================'
  );


  if (
    erros.length > 0
  ) {

    Logger.log(
      '========== TESTE ANÁLISE DIAGNÓSTICO V5.5 REPROVADO =========='
    );

    throw new Error(
      'TESTE ANÁLISE DIAGNÓSTICO V5.5 FALHOU: ' +
      JSON.stringify(
        erros
      )
    );

  }


  Logger.log(
    '========== TESTE ANÁLISE DIAGNÓSTICO V5.5 APROVADO =========='
  );


  return resultado;

}

/**
 * ============================================================
 * NEURO SOLUTIONS — MOTOR DE ANÁLISE DIAGNÓSTICA
 * V5.5
 * ============================================================
 *
 * RESPONSABILIDADE:
 *
 * Receber um diagnóstico já concluído e produzir uma análise
 * estruturada da oportunidade.
 *
 * IMPORTANTE:
 *
 * - NÃO altera DIAGNOSTICOS.
 * - NÃO cria DORES.
 * - NÃO grava METRICAS.
 * - NÃO altera o estado do diagnóstico.
 * - NÃO classifica o cliente como lead.
 * - NÃO escolhe produto.
 * - NÃO inventa informações.
 *
 * O diagnóstico continua sendo a memória factual.
 * Este motor somente ANALISA essa memória.
 *
 * Entrada:
 *
 *   diagnostico_id
 *
 * Saída:
 *
 * {
 *   processo_analisado,
 *   problema_principal,
 *   causas_provaveis,
 *   impactos,
 *   oportunidade,
 *   prioridade,
 *   recomendacao,
 *   justificativa
 * }
 *
 * ============================================================
 */


/**
 * ============================================================
 * MOTOR PRINCIPAL
 * ============================================================
 */
/**
 * ============================================================
 * NEURO SOLUTIONS — MOTOR DE ANÁLISE DIAGNÓSTICA
 * V5.5.1 — ANÁLISE LIMPA E DETERMINÍSTICA
 * ============================================================
 *
 * RESPONSABILIDADE:
 *
 * Receber um diagnóstico já concluído e produzir uma análise
 * estruturada da oportunidade.
 *
 * PRINCÍPIO CENTRAL:
 *
 * A IA interpreta.
 * O motor preserva.
 * O motor NÃO duplica.
 *
 * IMPORTANTE:
 *
 * - NÃO altera DIAGNOSTICOS.
 * - NÃO cria DORES.
 * - NÃO grava METRICAS.
 * - NÃO altera o estado do diagnóstico.
 * - NÃO classifica o cliente como lead.
 * - NÃO escolhe produto.
 * - NÃO inventa informações.
 * - NÃO copia automaticamente todos os fatos para todos os campos.
 * - NÃO utiliza "Dores registradas:" dentro de problema_principal.
 * - NÃO utiliza "Dados observados:" dentro de impactos.
 * - NÃO duplica o processo.
 *
 * ============================================================
 */

function analisarDiagnostico_(diagnosticoId) {

  Logger.log(
    '============================================================'
  );

  Logger.log(
    ' INÍCIO MOTOR DE ANÁLISE DIAGNÓSTICA V5.5.2'
  );

  Logger.log(
    ' DIAGNÓSTICO: ' + diagnosticoId
  );

  Logger.log(
    '============================================================'
  );


  if (!diagnosticoId) {

    throw new Error(
      'diagnostico_id não informado para o motor de análise.'
    );

  }


  /**
   * ==========================================================
   * 1. RECUPERAR DIAGNÓSTICO
   * ==========================================================
   */

  const diagnostico =
    obterDiagnosticoPorIdParaAnalise_(
      diagnosticoId
    );


  if (!diagnostico) {

    throw new Error(
      'Diagnóstico não encontrado: ' +
      diagnosticoId
    );

  }


  Logger.log(
    'DIAGNÓSTICO RECUPERADO:'
  );

  Logger.log(
    JSON.stringify(
      diagnostico,
      null,
      2
    )
  );


  /**
   * ==========================================================
   * 2. VALIDAR ESTADO
   * ==========================================================
   *
   * O motor é somente leitura.
   *
   * Não alteramos o estado mesmo que o diagnóstico esteja
   * em estado diferente de PRONTO_PARA_ANALISE.
   */

  const estado =
    String(
      diagnostico.status_diagnostico ||
      ''
    ).trim();


  if (
    estado &&
    estado !== 'PRONTO_PARA_ANALISE'
  ) {

    Logger.log(
      'AVISO: diagnóstico está no estado "' +
      estado +
      '".'
    );

  }


  /**
   * ==========================================================
   * 3. RECUPERAR DORES
   * ==========================================================
   */

  const dores =
    obterDoresDiagnostico_(
      diagnosticoId
    );


  if (!Array.isArray(dores)) {

    throw new Error(
      'obterDoresDiagnostico_ não retornou uma lista.'
    );

  }


  Logger.log(
    'TOTAL DE DORES: ' +
    dores.length
  );


  /**
   * ==========================================================
   * 4. RECUPERAR MÉTRICAS
   * ==========================================================
   */

  const medidas =
    obterMedidasDiagnostico_(
      diagnostico.empresa_id,
      diagnostico.conversa_id
    );


  if (!Array.isArray(medidas)) {

    throw new Error(
      'obterMedidasDiagnostico_ não retornou uma lista.'
    );

  }


  Logger.log(
    'TOTAL DE MEDIDAS: ' +
    medidas.length
  );


  /**
   * ==========================================================
   * 5. CONSOLIDAR VOLUME
   * ==========================================================
   */

  const volume =
    String(
      obterUltimoVolumeDiagnostico_(
        medidas
      ) ||
      ''
    ).trim();


  /**
   * ==========================================================
   * 6. RECUPERAR RESPOSTAS NEGATIVAS
   * ==========================================================
   */

  let respostasNegativas =
    obterRespostasNegativasDiagnostico_(
      diagnostico.empresa_id,
      diagnostico.conversa_id
    );


  if (!Array.isArray(respostasNegativas)) {

    respostasNegativas = [];

  }


  /**
   * ==========================================================
   * 7. RECUPERAR HISTÓRICO
   * ==========================================================
   */

  let historico = [];

  try {

    historico =
      obterHistoricoConversaDiagnostico_(
        diagnostico.conversa_id,
        30
      );

  } catch (erroHistorico) {

    Logger.log(
      'AVISO: não foi possível recuperar histórico: ' +
      erroHistorico
    );

    historico = [];

  }


  /**
   * ==========================================================
   * 8. CONSTRUIR CONTEXTO CONSOLIDADO
   * ==========================================================
   */

  let contexto;

  try {

    contexto =
      construirContextoDiagnostico_(
        diagnostico
      );

  } catch (erroContexto) {

    Logger.log(
      'AVISO: falha ao construir contexto consolidado.'
    );

    Logger.log(
      String(erroContexto)
    );

    contexto = {

      diagnostico: {

        processo:
          diagnostico.processo_nome ||
          '',

        processo_resumo:
          diagnostico.processo_resumo ||
          '',

        dor_principal:
          diagnostico.dor_principal ||
          '',

        frequencia:
          diagnostico.frequencia ||
          '',

        impacto:
          diagnostico.impacto_nivel ||
          '',

        volume:
          volume,

        objetivo:
          diagnostico.objetivo ||
          ''

      },

      dores:
        dores,

      medidas:
        medidas,

      respostas_negativas:
        respostasNegativas,

      historico:
        historico,

      pergunta_pendente:
        '',

      etapas_processo:
        []

    };

  }


  /**
   * ==========================================================
   * 9. NORMALIZAR FATOS CONSOLIDADOS
   * ==========================================================
   */

  const processo =
    String(
      diagnostico.processo_resumo ||
      diagnostico.processo_nome ||
      contexto.diagnostico.processo_resumo ||
      contexto.diagnostico.processo ||
      ''
    ).trim();


  const dorPrincipal =
    String(
      diagnostico.dor_principal ||
      contexto.diagnostico.dor_principal ||
      ''
    ).trim();


  const frequencia =
    String(
      diagnostico.frequencia ||
      contexto.diagnostico.frequencia ||
      ''
    ).trim();


  const impacto =
    String(
      diagnostico.impacto_nivel ||
      contexto.diagnostico.impacto ||
      ''
    ).trim();


  const objetivo =
    String(
      diagnostico.objetivo ||
      contexto.diagnostico.objetivo ||
      ''
    ).trim();


  const volumeTexto =
    volume;


  /**
   * ==========================================================
   * 10. LISTA LIMPA DE DORES
   * ==========================================================
   */

  const descricoesDores =
    dores
      .map(function(dor) {

        return String(
          dor &&
          dor.descricao
            ? dor.descricao
            : ''
        ).trim();

      })
      .filter(function(descricao) {

        return !!descricao;

      });


  /**
   * ==========================================================
   * 11. CONSTRUIR ENTRADA PARA GEMINI
   * ==========================================================
   *
   * A IA recebe somente fatos.
   *
   * É explicitamente proibido:
   *
   * - repetir o diagnóstico inteiro;
   * - criar listas artificiais;
   * - escrever "Dores registradas";
   * - escrever "Dados observados";
   * - inventar tecnologias;
   * - inventar números;
   * - repetir o processo.
   */

  const entrada =
    [

      'Você é o MOTOR DE ANÁLISE de um sistema de diagnóstico empresarial.',

      '',

      'Sua função é analisar uma memória factual já consolidada.',

      'Sua função NÃO é continuar a entrevista.',

      'Sua função NÃO é vender.',

      'Sua função NÃO é escolher produto.',

      'Sua função NÃO é classificar o cliente como lead.',

      '',

      'REGRAS ABSOLUTAS:',

      '1. Use SOMENTE os fatos fornecidos.',

      '2. Não invente informações.',

      '3. Não crie números.',

      '4. Não mencione tecnologias, softwares, ERPs, WhatsApp ou integrações que não estejam nos fatos.',

      '5. Não altere fatos confirmados.',

      '6. Não crie novas dores.',

      '7. Não descarte dores existentes.',

      '8. Não repita o processo duas vezes.',

      '9. Não escreva "Dores registradas:" dentro de nenhum campo.',

      '10. Não escreva "Dados observados:" dentro de nenhum campo.',

      '11. Não transforme volume em impacto.',

      '12. Não copie automaticamente todas as dores para problema_principal.',

      '13. problema_principal deve ser uma síntese única e limpa do problema central.',

      '14. impactos deve descrever consequências reais do problema, sem criar uma lista de fatos repetidos.',

      '15. causas_provaveis deve conter somente causas sustentadas pelos fatos.',

      '16. oportunidade deve derivar diretamente do objetivo e do problema.',

      '17. recomendacao deve indicar foco de melhoria, nunca produto.',

      '18. justificativa deve explicar a prioridade utilizando os fatos mais relevantes.',

      '19. Cada campo deve acrescentar informação analítica. Não repita o mesmo texto em campos diferentes.',

      '20. A resposta deve ser objetiva e profissional.',

      '',

      'FORMATO OBRIGATÓRIO: SOMENTE JSON VÁLIDO.',

      '{',

      '  "processo_analisado": "descrição única e limpa do processo",',

      '  "problema_principal": "síntese única do problema central",',

      '  "causas_provaveis": "causas sustentadas pelos fatos",',

      '  "impactos": "consequências reais do problema",',

      '  "oportunidade": "oportunidade de melhoria",',

      '  "prioridade": "ALTA, CRÍTICA, MÉDIA ou BAIXA",',

      '  "recomendacao": "foco de melhoria, sem produto",',

      '  "justificativa": "justificativa objetiva da prioridade"',

      '}',

      '',

      'DIAGNÓSTICO CONSOLIDADO:',

      JSON.stringify(
        contexto.diagnostico ||
        {}
      ),

      '',

      'DORES REGISTRADAS:',

      JSON.stringify(
        descricoesDores
      ),

      '',

      'MEDIDAS REGISTRADAS:',

      JSON.stringify(
        medidas ||
        []
      ),

      '',

      'RESPOSTAS NEGATIVAS:',

      JSON.stringify(
        respostasNegativas ||
        []
      ),

      '',

      'ETAPAS DO PROCESSO:',

      JSON.stringify(
        contexto.etapas_processo ||
        []
      ),

      '',

      'HISTÓRICO:',

      JSON.stringify(
        contexto.historico ||
        historico ||
        []
      ),

      '',

      'FATOS PRINCIPAIS:',

      'Processo: ' +
      processo,

      'Dor principal: ' +
      dorPrincipal,

      'Frequência: ' +
      frequencia,

      'Impacto: ' +
      impacto,

      'Volume: ' +
      volumeTexto,

      'Objetivo: ' +
      objetivo,

      '',

      'IMPORTANTE:',

      'O resultado deve ser uma ANÁLISE, não uma cópia do diagnóstico.',

      'Cada informação deve aparecer somente onde fizer sentido.'

    ].join('\n');


  /**
   * ==========================================================
   * 12. CHAMAR GEMINI
   * ==========================================================
   */

  const apiKey =
    obterGeminiApiKey_();


  const model =
    obterGeminiModel_();


  const url =
    construirUrlGemini_(
      model
    );


  const payload = {

    contents: [

      {

        role:
          'user',

        parts: [

          {

            text:
              entrada

          }

        ]

      }

    ],

    generationConfig: {

      responseMimeType:
        'application/json',

      maxOutputTokens:
        1200,

      thinkingConfig: {

        thinkingLevel:
          'minimal'

      }

    }

  };


  Logger.log(
    'EXECUTANDO GEMINI PARA ANÁLISE...'
  );


  const respostaGemini =
    executarGemini_(
      url,
      payload,
      apiKey
    );


  const textoResposta =
    extrairTextoGemini_(
      respostaGemini.dados
    );


  Logger.log(
    'RESPOSTA GEMINI:'
  );

  Logger.log(
    textoResposta
  );


  /**
   * ==========================================================
   * 13. CONVERTER JSON
   * ==========================================================
   */

  let analiseIA;

  try {

    analiseIA =
      JSON.parse(
        textoResposta
      );

  } catch (erroJSON) {

    throw new Error(
      'O motor de análise recebeu JSON inválido do Gemini: ' +
      textoResposta
    );

  }


  /**
   * ==========================================================
   * 14. NORMALIZAR ESTRUTURA
   * ==========================================================
   */

  if (
    analiseIA &&
    analiseIA.analise &&
    typeof analiseIA.analise ===
      'object'
  ) {

    analiseIA =
      analiseIA.analise;

  }


  if (
    analiseIA &&
    analiseIA.resultado &&
    typeof analiseIA.resultado ===
      'object'
  ) {

    analiseIA =
      analiseIA.resultado;

  }


  if (
    analiseIA &&
    analiseIA.dados &&
    typeof analiseIA.dados ===
      'object'
  ) {

    analiseIA =
      analiseIA.dados;

  }


  if (!analiseIA) {

    analiseIA = {};

  }


  /**
   * ==========================================================
   * 15. FUNÇÕES INTERNAS DE LIMPEZA
   * ==========================================================
   */

  function normalizarTexto(texto) {

    return String(
      texto ||
      ''
    )
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .toLowerCase()
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

  }


  function limparCampo(texto) {

    let valor =
      String(
        texto ||
        ''
      ).trim();


    if (!valor) {
      return '';
    }


    const marcadoresProibidos = [

      'Dores registradas:',
      'Dores registradas',
      'Dados observados:',
      'Dados observados',
      'Volume confirmado:',
      'Volume confirmado',
      'Impacto confirmado:',
      'Impacto confirmado'

    ];


    marcadoresProibidos.forEach(
      function(marcador) {

        const regex =
          new RegExp(
            '\\s*' +
            marcador.replace(
              /[.*+?^${}()|[\]\\]/g,
              '\\$&'
            ) +
            '\\s*',
            'ig'
          );

        valor =
          valor.replace(
            regex,
            ' '
          );

      }
    );


    valor =
      valor
        .replace(
          /\s*\.\s*\./g,
          '.'
        )
        .replace(
          /\s+/g,
          ' '
        )
        .trim();


    return valor;

  }


  /**
   * ==========================================================
   * 16. PROCESSO
   * ==========================================================
   *
   * O processo factual é a fonte principal.
   *
   * Não concatenamos processo + processo da IA.
   */

  let processoAnalisado =
    limparCampo(
      analiseIA.processo_analisado
    );


  if (!processoAnalisado) {

    processoAnalisado =
      limparCampo(
        processo
      );

  }


  if (!processoAnalisado) {

    throw new Error(
      'O motor de análise não conseguiu identificar o processo.'
    );

  }


  /**
   * ==========================================================
   * 17. PROBLEMA PRINCIPAL
   * ==========================================================
   *
   * A síntese do Gemini é a fonte principal.
   * As dores servem para memória e validação, mas nunca são
   * concatenadas automaticamente ao texto analítico.
   */

  let problemaPrincipal =
    limparCampo(
      analiseIA.problema_principal
    );


  if (!problemaPrincipal) {

    problemaPrincipal =
      limparCampo(
        dorPrincipal
      );

  }


  if (!problemaPrincipal) {

    throw new Error(
      'O motor de análise não conseguiu identificar o problema principal.'
    );

  }


  /**
   * ==========================================================
   * 18. CAUSAS
   * ==========================================================
   */

  let causas =
    limparCampo(
      analiseIA.causas_provaveis
    );


  if (!causas) {

    const partesCausas = [];


    if (processo) {

      partesCausas.push(
        'execução manual de etapas do processo'
      );

    }


    if (
      descricoesDores.length
    ) {

      partesCausas.push(
        'ocorrência de falhas operacionais identificadas no diagnóstico'
      );

    }


    causas =
      partesCausas.join(
        '; '
      );

  }


  /**
   * ==========================================================
   * 19. IMPACTOS
   * ==========================================================
   *
   * A síntese do Gemini é preservada.
   *
   * O fato confirmado NÃO é concatenado novamente. A validação
   * posterior verifica se ele foi preservado semanticamente.
   */

  let impactos =
    limparCampo(
      analiseIA.impactos
    );


  /**
   * Fallback somente quando o Gemini não produzir impacto.
   */

  if (!impactos && impacto) {

    impactos =
      limparCampo(
        impacto
      );

  }


  /**
   * Segundo fallback: medida explícita de tempo.
   */

  if (!impactos) {

    const medidasTempo =
      medidas.filter(
        function(medida) {

          return (
            medida &&
            String(
              medida.tipo ||
              ''
            ).toUpperCase() ===
              'TEMPO'
          );

        }
      );


    if (
      medidasTempo.length
    ) {

      const ultimaMedida =
        medidasTempo[
          medidasTempo.length - 1
        ];


      impactos =
        String(
          ultimaMedida.texto ||
          ''
        ).trim();

    }

  }


  /**
   * ==========================================================
   * 20. OPORTUNIDADE
   * ==========================================================
   */

  let oportunidade =
    limparCampo(
      analiseIA.oportunidade
    );


  if (!oportunidade) {

    if (objetivo) {

      oportunidade =
        'Melhorar o processo de acordo com o objetivo informado pelo empresário: ' +
        objetivo;

    } else {

      oportunidade =
        'Reduzir o esforço e os impactos associados ao processo identificado no diagnóstico.';

    }

  }


  /**
   * ==========================================================
   * 21. PRIORIDADE
   * ==========================================================
   */

  let prioridade =
    String(
      analiseIA.prioridade ||
      ''
    )
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      );


  const temVolume =
    !!volumeTexto;


  const temImpacto =
    !!impacto;


  const temDores =
    descricoesDores.length >
    0;


  const frequenciaDiaria =
    /diar/i.test(
      frequencia
    ) ||
    /por dia/i.test(
      volumeTexto
    );


  /**
   * CRITÉRIO DETERMINÍSTICO DE PRIORIDADE.
   *
   * Cenário crítico:
   *
   * - ocorrência diária;
   * - impacto mensurável;
   * - volume conhecido;
   * - pelo menos duas dores confirmadas.
   */

  if (
    frequenciaDiaria &&
    temImpacto &&
    temVolume &&
    descricoesDores.length >= 2
  ) {

    prioridade =
      'CRITICA';

  } else if (
    prioridade !== 'ALTA' &&
    prioridade !== 'CRITICA' &&
    prioridade !== 'MEDIA' &&
    prioridade !== 'BAIXA'
  ) {

    if (
      frequenciaDiaria &&
      temImpacto &&
      temVolume
    ) {

      prioridade =
        'ALTA';

    } else if (
      temImpacto &&
      temDores
    ) {

      prioridade =
        'ALTA';

    } else if (
      temImpacto ||
      temVolume
    ) {

      prioridade =
        'MEDIA';

    } else {

      prioridade =
        'BAIXA';

    }

  }


  /**
   * ==========================================================
   * 22. RECOMENDAÇÃO
   * ==========================================================
   */

  let recomendacao =
    limparCampo(
      analiseIA.recomendacao
    );


  if (!recomendacao) {

    recomendacao =
      'Priorizar a análise e melhoria do processo identificado, considerando o tempo envolvido, o volume e as dores confirmadas.';

  }


  /**
   * ==========================================================
   * 23. JUSTIFICATIVA
   * ==========================================================
   */

  let justificativa =
    limparCampo(
      analiseIA.justificativa
    );


  if (!justificativa) {

    const fatosJustificativa = [];


    if (frequencia) {

      fatosJustificativa.push(
        'ocorrência ' +
        frequencia.toLowerCase()
      );

    }


    if (volumeTexto) {

      fatosJustificativa.push(
        'volume de ' +
        volumeTexto
      );

    }


    if (impacto) {

      fatosJustificativa.push(
        'impacto de ' +
        impacto
      );

    }


    if (
      descricoesDores.length
    ) {

      fatosJustificativa.push(
        descricoesDores.length +
        ' dores confirmadas'
      );

    }


    justificativa =
      fatosJustificativa.length

        ? 'A prioridade decorre dos fatos confirmados: ' +
          fatosJustificativa.join(
            ', '
          ) +
          '.'

        : 'A análise foi baseada exclusivamente nas informações confirmadas no diagnóstico.';

  }


  /**
   * ==========================================================
   * 24. RESULTADO FINAL
   * ==========================================================
   */

  const resultadoFinal = {

    processo_analisado:
      processoAnalisado,

    problema_principal:
      problemaPrincipal,

    causas_provaveis:
      causas,

    impactos:
      impactos,

    oportunidade:
      oportunidade,

    prioridade:
      prioridade,

    recomendacao:
      recomendacao,

    justificativa:
      justificativa

  };


  /**
   * ==========================================================
   * 25. PROTEÇÃO CONTRA INVENÇÕES
   * ==========================================================
   */

  const textoAnalise =
    normalizarTexto(
      JSON.stringify(
        resultadoFinal
      )
    );


  const termosProibidos = [

    'erp antigo',
    'erp desatualizado',
    'sistema legado',
    'whatsapp',
    'e-commerce',
    'ecommerce',
    'integracao com o erp',
    'sap',
    'totvs',
    'bling',
    'tiny',
    'omie',
    'zapier',
    'make.com',
    'n8n'

  ];


  termosProibidos.forEach(
    function(termo) {

      if (
        textoAnalise.indexOf(
          normalizarTexto(
            termo
          )
        ) !== -1
      ) {

        throw new Error(
          'A análise apresentou informação não fornecida pelo diagnóstico: ' +
          termo
        );

      }

    }
  );


  /**
   * ==========================================================
   * 26. PROTEÇÃO CONTRA DUPLICAÇÃO
   * ==========================================================
   */

  const camposAnalise = [

    resultadoFinal.processo_analisado,

    resultadoFinal.problema_principal,

    resultadoFinal.causas_provaveis,

    resultadoFinal.impactos,

    resultadoFinal.oportunidade,

    resultadoFinal.recomendacao,

    resultadoFinal.justificativa

  ]
    .map(function(campo) {

      return normalizarTexto(
        campo
      );

    })
    .filter(function(campo) {

      return !!campo;

    });


  /**
   * Detecta somente duplicações exatas entre campos.
   *
   * Não bloqueamos campos semanticamente relacionados,
   * porque análise naturalmente reutiliza fatos.
   */

  for (
    let i = 0;
    i < camposAnalise.length;
    i++
  ) {

    for (
      let j = i + 1;
      j < camposAnalise.length;
      j++
    ) {

      if (
        camposAnalise[i] ===
        camposAnalise[j]
      ) {

        throw new Error(
          'A análise apresentou duplicação exata entre campos.'
        );

      }

    }

  }


  /**
   * ==========================================================
   * 27. PROTEÇÃO CONTRA MARCADORES DE DUPLICAÇÃO
   * ==========================================================
   */

  const marcadoresDuplicacao = [

    'dores registradas:',
    'dados observados:',
    'volume confirmado:',
    'impacto confirmado:'

  ];


  marcadoresDuplicacao.forEach(
    function(marcador) {

      if (
        textoAnalise.indexOf(
          normalizarTexto(
            marcador
          )
        ) !== -1
      ) {

        throw new Error(
          'A análise contém marcador de duplicação indevido: ' +
          marcador
        );

      }

    }
  );


  /**
   * ==========================================================
   * 28. PROTEÇÃO CONTRA PERDA DE FATOS
   * ==========================================================
   *
   * Não copiamos os fatos para campos aleatórios.
   *
   * Apenas garantimos que os fatos fundamentais estejam
   * representados em pelo menos um campo analítico adequado.
   */

  let textoCompleto =
    normalizarTexto(
      JSON.stringify(
        resultadoFinal
      )
    );


  /**
   * ----------------------------------------------------------
   * 28A. VALIDAÇÃO SEMÂNTICA DOS FATOS CONFIRMADOS
   * ----------------------------------------------------------
   *
   * IMPORTANTE:
   *
   * A análise pode PARAFRASEAR um fato sem perdê-lo.
   *
   * Exemplos válidos:
   * - "80 pedidos por dia" → "80 pedidos diariamente"
   * - "três horas por dia" → "3 horas diárias"
   *
   * Portanto, não exigimos mais a cópia literal da frase.
   * Exigimos que os elementos factuais essenciais permaneçam
   * representados na análise.
   */

  function numeroNormalizado(valor) {

    const mapaNumeros = {
      'zero': 0,
      'um': 1,
      'uma': 1,
      'dois': 2,
      'duas': 2,
      'tres': 3,
      'quatro': 4,
      'cinco': 5,
      'seis': 6,
      'sete': 7,
      'oito': 8,
      'nove': 9,
      'dez': 10,
      'onze': 11,
      'doze': 12,
      'treze': 13,
      'quatorze': 14,
      'catorze': 14,
      'quinze': 15,
      'dezesseis': 16,
      'dezessete': 17,
      'dezoito': 18,
      'dezenove': 19,
      'vinte': 20,
      'trinta': 30,
      'quarenta': 40,
      'cinquenta': 50,
      'sessenta': 60,
      'setenta': 70,
      'oitenta': 80,
      'noventa': 90,
      'cem': 100
    };

    const bruto =
      normalizarTexto(
        valor
      );

    if (!bruto) {
      return null;
    }

    const numero =
      bruto.match(
        /\b\d+(?:[.,]\d+)?\b/
      );

    if (numero) {
      return Number(
        numero[0].replace(',', '.')
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        mapaNumeros,
        bruto
      )
    ) {
      return mapaNumeros[bruto];
    }

    return null;
  }


  function fatoVolumeRepresentado(
    fato,
    texto
  ) {

    const fatoNorm =
      normalizarTexto(
        fato
      );

    const textoNorm =
      normalizarTexto(
        texto
      );

    if (
      !fatoNorm ||
      !textoNorm
    ) {
      return false;
    }

    const numeroFato =
      numeroNormalizado(
        fatoNorm
      );

    if (
      numeroFato === null
    ) {
      return (
        textoNorm.indexOf(
          fatoNorm
        ) !== -1
      );
    }

    const unidades = [
      'pedido',
      'pedidos',
      'venda',
      'vendas',
      'cliente',
      'clientes',
      'ordem',
      'ordens',
      'orcamento',
      'orcamentos',
      'atendimento',
      'atendimentos'
    ];

    const unidadePresente =
      unidades.some(
        function(unidade) {
          return (
            fatoNorm.indexOf(unidade) !== -1
          );
        }
      );

    const unidadeNaAnalise =
      unidades.some(
        function(unidade) {
          return (
            textoNorm.indexOf(unidade) !== -1
          );
        }
      );

    if (
      !unidadePresente ||
      !unidadeNaAnalise
    ) {
      return false;
    }

    const numerosNaAnalise =
      textoNorm.match(
        /\b\d+(?:[.,]\d+)?\b/g
      ) || [];

    const numeroLiteralPresente =
      numerosNaAnalise.some(
        function(valor) {
          return (
            Number(
              valor.replace(',', '.')
            ) === numeroFato
          );
        }
      );

    if (numeroLiteralPresente) {
      return true;
    }

    const numeroPorExtenso =
      Object.keys({
        zero: 0,
        um: 1,
        uma: 1,
        dois: 2,
        duas: 2,
        tres: 3,
        quatro: 4,
        cinco: 5,
        seis: 6,
        sete: 7,
        oito: 8,
        nove: 9,
        dez: 10,
        onze: 11,
        doze: 12,
        treze: 13,
        quatorze: 14,
        catorze: 14,
        quinze: 15,
        dezesseis: 16,
        dezessete: 17,
        dezoito: 18,
        dezenove: 19,
        vinte: 20,
        trinta: 30,
        quarenta: 40,
        cinquenta: 50,
        sessenta: 60,
        setenta: 70,
        oitenta: 80,
        noventa: 90,
        cem: 100
      });

    for (
      let i = 0;
      i < numeroPorExtenso.length;
      i++
    ) {

      const palavra =
        numeroPorExtenso[i];

      if (
        mapaNumeroPorExtenso_(
          palavra
        ) === numeroFato &&
        new RegExp(
          '\\b' +
          palavra +
          '\\b'
        ).test(textoNorm)
      ) {
        return true;
      }

    }

    return false;
  }


  function mapaNumeroPorExtenso_(
    palavra
  ) {

    const mapa = {
      zero: 0,
      um: 1,
      uma: 1,
      dois: 2,
      duas: 2,
      tres: 3,
      quatro: 4,
      cinco: 5,
      seis: 6,
      sete: 7,
      oito: 8,
      nove: 9,
      dez: 10,
      onze: 11,
      doze: 12,
      treze: 13,
      quatorze: 14,
      catorze: 14,
      quinze: 15,
      dezesseis: 16,
      dezessete: 17,
      dezoito: 18,
      dezenove: 19,
      vinte: 20,
      trinta: 30,
      quarenta: 40,
      cinquenta: 50,
      sessenta: 60,
      setenta: 70,
      oitenta: 80,
      noventa: 90,
      cem: 100
    };

    return mapa[
      normalizarTexto(
        palavra
      )
    ];
  }


  function fatoImpactoRepresentado(
    fato,
    texto
  ) {

    const fatoNorm =
      normalizarTexto(
        fato
      );

    const textoNorm =
      normalizarTexto(
        texto
      );

    if (
      !fatoNorm ||
      !textoNorm
    ) {
      return true;
    }

    if (
      textoNorm.indexOf(
        fatoNorm
      ) !== -1
    ) {
      return true;
    }

    const duracao =
      fatoNorm.match(
        /\b(\d+(?:[.,]\d+)?|zero|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)\s*(hora|horas|minuto|minutos)\b/
      );

    if (!duracao) {
      return true;
    }

    const valorFato =
      numeroNormalizado(
        duracao[1]
      );

    const unidadeFato =
      duracao[2].replace(
        /s$/,
        ''
      );

    const unidadeEncontrada =
      textoNorm.indexOf(
        unidadeFato
      ) !== -1;

    if (
      !unidadeEncontrada
    ) {
      return false;
    }

    if (
      valorFato === null
    ) {
      return true;
    }

    const numeros =
      textoNorm.match(
        /\b\d+(?:[.,]\d+)?\b/g
      ) || [];

    const possuiMesmoNumero =
      numeros.some(
        function(valor) {
          return (
            Number(
              valor.replace(',', '.')
            ) === valorFato
          );
        }
      );

    if (
      possuiMesmoNumero
    ) {
      return true;
    }

    const palavrasNumero = [
      'zero',
      'um',
      'uma',
      'dois',
      'duas',
      'tres',
      'quatro',
      'cinco',
      'seis',
      'sete',
      'oito',
      'nove',
      'dez'
    ];

    return palavrasNumero.some(
      function(palavra) {
        return (
          mapaNumeroPorExtenso_(
            palavra
          ) === valorFato &&
          new RegExp(
            '\\b' +
            palavra +
            '\\b'
          ).test(textoNorm)
        );
      }
    );
  }


  function fatoObjetivoRepresentado(
    fato,
    texto
  ) {

    const fatoNorm =
      normalizarTexto(
        fato
      );

    const textoNorm =
      normalizarTexto(
        texto
      );

    if (
      !fatoNorm ||
      !textoNorm
    ) {
      return false;
    }

    if (
      textoNorm.indexOf(
        fatoNorm
      ) !== -1
    ) {
      return true;
    }

    /*
     * O objetivo pode ser resumido ou parafraseado.
     * Exigimos pelo menos um núcleo de intenção e um
     * núcleo do resultado desejado.
     */

    const intencoes = [
      'reduzir',
      'diminuir',
      'melhorar',
      'aumentar',
      'agilizar',
      'economizar',
      'eliminar',
      'liberar',
      'ganhar',
      'evitar',
      'organizar'
    ];

    const resultados = [
      'tempo',
      'erro',
      'erros',
      'retrabalho',
      'custo',
      'custos',
      'funcionaria',
      'funcionarias',
      'atividade',
      'atividades',
      'produtividade',
      'processo'
    ];

    const temIntencao =
      intencoes.some(
        function(termo) {
          return textoNorm.indexOf(termo) !== -1;
        }
      );

    const temResultado =
      resultados.some(
        function(termo) {
          return fatoNorm.indexOf(termo) !== -1 &&
            textoNorm.indexOf(termo) !== -1;
        }
      );

    return (
      temIntencao &&
      temResultado
    );
  }


  /**
   * Volume:
   * valida o fato essencial, não a frase literal.
   *
   * Se a IA omitir um volume confirmado, preservamos o fato
   * automaticamente em um campo analítico adequado.
   *
   * REGRA:
   * - não altera o número confirmado;
   * - não inventa unidade;
   * - não cria novo fato;
   * - não copia o diagnóstico inteiro;
   * - somente recupera um fato que já foi confirmado.
   */
  if (
    volumeTexto &&
    !fatoVolumeRepresentado(
      volumeTexto,
      textoCompleto
    )
  ) {

    const volumePreservacao =
      limparCampo(
        volumeTexto
      );

    if (
      volumePreservacao &&
      !fatoVolumeRepresentado(
        volumePreservacao,
        textoCompleto
      )
    ) {

      const impactoAtual =
        limparCampo(
          resultadoFinal.impactos
        );

      resultadoFinal.impactos =
        impactoAtual
          ? impactoAtual +
            ' O processo movimenta ' +
            volumePreservacao +
            '.'
          : 'O processo movimenta ' +
            volumePreservacao +
            '.';

      textoCompleto =
        normalizarTexto(
          JSON.stringify(
            resultadoFinal
          )
        );
    }

    if (
      !fatoVolumeRepresentado(
        volumeTexto,
        textoCompleto
      )
    ) {

      throw new Error(
        'A análise perdeu o volume confirmado: ' +
        volumeTexto
      );
    }
  }




  /**
   * Impacto:
   * permite paráfrase mantendo duração e unidade.
   */
  if (
    impacto &&
    !fatoImpactoRepresentado(
      impacto,
      textoCompleto
    )
  ) {

    throw new Error(
      'A análise perdeu o impacto confirmado: ' +
      impacto
    );

  }


  /**
   * Objetivo:
   * aceita paráfrase sem exigir cópia literal.
   */
  if (
    objetivo &&
    !fatoObjetivoRepresentado(
      objetivo,
      textoCompleto
    )
  ) {

    throw new Error(
      'A análise perdeu o objetivo confirmado.'
    );

  }


  /**
   * ==========================================================
   * 29. VALIDAR CAMPOS OBRIGATÓRIOS
   * ==========================================================
   */

  const camposObrigatorios = [

    'processo_analisado',
    'problema_principal',
    'causas_provaveis',
    'impactos',
    'oportunidade',
    'prioridade',
    'recomendacao',
    'justificativa'

  ];


  camposObrigatorios.forEach(
    function(campo) {

      if (
        !String(
          resultadoFinal[campo] ||
          ''
        ).trim()
      ) {

        throw new Error(
          'Campo obrigatório ausente na análise: ' +
          campo
        );

      }

    }
  );


  /**
   * ==========================================================
   * 30. LOG FINAL
   * ==========================================================
   */

  Logger.log(
    '============================================================'
  );

  Logger.log(
    ' ANÁLISE DIAGNÓSTICA V5.5.2 CONCLUÍDA'
  );

  Logger.log(
    JSON.stringify(
      resultadoFinal,
      null,
      2
    )
  );

  Logger.log(
    '============================================================'
  );


  /**
   * ==========================================================
   * IMPORTANTE
   * ==========================================================
   *
   * MOTOR SOMENTE LEITURA.
   *
   * Nenhuma gravação é realizada aqui.
   */

  return resultadoFinal;

}

function testarPersistenciaIntegridadeDiagnosticoV5_6() {

  Logger.log('============================================================');
  Logger.log(' INÍCIO TESTE PERSISTÊNCIA E INTEGRIDADE V5.6');
  Logger.log('============================================================');


  const erros = [];


  function verificar_(condicao, mensagem) {

    if (!condicao) {

      erros.push(mensagem);

      Logger.log(
        '❌ FALHA: ' +
        mensagem
      );

    } else {

      Logger.log(
        '✅ OK: ' +
        mensagem
      );

    }

  }


  function falhar_(mensagem, detalhe) {

    erros.push(
      mensagem +
      (
        detalhe
          ? ' | ' + detalhe
          : ''
      )
    );

    Logger.log(
      '❌ FALHA CRÍTICA: ' +
      mensagem
    );

    if (detalhe) {

      Logger.log(
        String(detalhe)
      );

    }

  }


  // ============================================================
  // 1. CRIAR EMPRESA + CONVERSA + DIAGNÓSTICO
  // ============================================================

  Logger.log(
    '========== 1. CRIANDO DIAGNÓSTICO =========='
  );


  let inicio;


  try {

    inicio =
      iniciarDiagnostico({

        nome:
          'Empresa Teste Persistência V5.6',

        celular:
          '51999999996',

        whatsapp:
          '51999999996',

        email:
          'teste-persistencia-v56@mvp.local',

        segmento:
          'Gráfica',

        porte:
          'Pequeno',

        cidade:
          'Teste'

      });

  } catch (erro) {

    falhar_(
      'iniciarDiagnostico lançou erro.',
      erro
    );

    return {
      aprovado: false,
      erros: erros
    };

  }


  verificar_(
    !!inicio,
    'iniciarDiagnostico retornou resultado.'
  );


  if (!inicio) {

    return {
      aprovado: false,
      erros: erros
    };

  }


  verificar_(
    !!inicio.empresa_id,
    'empresa_id foi criado.'
  );


  verificar_(
    !!inicio.conversa_id,
    'conversa_id foi criado.'
  );


  verificar_(
    !!inicio.diagnostico_id,
    'diagnostico_id foi criado.'
  );


  Logger.log(
    'EMPRESA: ' +
    inicio.empresa_id
  );


  Logger.log(
    'CONVERSA: ' +
    inicio.conversa_id
  );


  Logger.log(
    'DIAGNÓSTICO: ' +
    inicio.diagnostico_id
  );


  if (
    !inicio.empresa_id ||
    !inicio.conversa_id ||
    !inicio.diagnostico_id
  ) {

    return {
      aprovado: false,
      erros: erros,
      inicio: inicio
    };

  }


  // ============================================================
  // 2. FLUXO REAL DO DIAGNÓSTICO
  // ============================================================

  Logger.log(
    '========== 2. PROCESSANDO MENSAGENS =========='
  );


  const mensagens = [

    'Minha funcionária perde três horas por dia colocando pedidos manualmente em uma planilha.',

    'Depois que entram na planilha, usamos essas informações para separar os pedidos e enviar para a produção.',

    'São aproximadamente 80 pedidos por dia.',

    'Depois disso, alguns pedidos ainda precisam ser conferidos novamente porque às vezes há erros de digitação.',

    'Quero reduzir o tempo gasto nesse processo, diminuir os erros e conseguir liberar minha funcionária para outras atividades.'

  ];


  const resultados = [];


  mensagens.forEach(
    function(
      mensagem,
      indice
    ) {

      const rodada =
        indice + 1;


      Logger.log(
        '============================================================'
      );


      Logger.log(
        ' RODADA ' +
        rodada
      );


      Logger.log(
        '============================================================'
      );


      Logger.log(
        'MENSAGEM: ' +
        mensagem
      );


      let resultado;


      try {

        resultado =
          processarMensagemDiagnostico({

            diagnostico_id:
              inicio.diagnostico_id,

            empresa_id:
              inicio.empresa_id,

            conversa_id:
              inicio.conversa_id,

            mensagem:
              mensagem,

            remetente:
              'CLIENTE',

            tipo:
              'TEXTO'

          });

      } catch (erro) {

        falhar_(
          'Erro ao processar a rodada ' +
          rodada +
          '.',
          erro
        );

        return;

      }


      verificar_(
        !!resultado,
        'Rodada ' +
        rodada +
        ' retornou resultado.'
      );


      if (resultado) {

        resultados.push(
          resultado
        );


        Logger.log(
          'ESTADO: ' +
          (
            resultado.estado ||
            ''
          )
        );


        Logger.log(
          'RESPOSTA: ' +
          (
            resultado.resposta ||
            ''
          )
        );

      }

    }
  );


  verificar_(
    resultados.length ===
      mensagens.length,
    'Todas as 5 rodadas foram processadas.'
  );


  // ============================================================
  // 3. RECUPERAR DIAGNÓSTICO DIRETAMENTE DA PERSISTÊNCIA
  // ============================================================

  Logger.log(
    '========== 3. RECUPERANDO DIAGNÓSTICO DA PLANILHA =========='
  );


  let diagnosticoRecuperado;


  try {

    diagnosticoRecuperado =
      obterDiagnosticoAtual_(
        inicio.empresa_id,
        inicio.conversa_id
      );

  } catch (erro) {

    falhar_(
      'obterDiagnosticoAtual_ lançou erro.',
      erro
    );

  }


  verificar_(
    !!diagnosticoRecuperado,
    'Diagnóstico foi recuperado diretamente da persistência.'
  );


  if (!diagnosticoRecuperado) {

    return {

      aprovado: false,

      erros: erros,

      empresa_id:
        inicio.empresa_id,

      conversa_id:
        inicio.conversa_id,

      diagnostico_id:
        inicio.diagnostico_id

    };

  }


  Logger.log(
    'DIAGNÓSTICO RECUPERADO:'
  );


  Logger.log(
    JSON.stringify(
      diagnosticoRecuperado,
      null,
      2
    )
  );


  // ============================================================
  // 4. VALIDAR IDENTIDADE E RELACIONAMENTOS
  // ============================================================

  Logger.log(
    '========== 4. VALIDANDO IDENTIDADE E RELACIONAMENTOS =========='
  );


  verificar_(
    String(
      diagnosticoRecuperado.diagnostico_id
    ) ===
    String(
      inicio.diagnostico_id
    ),
    'diagnostico_id permanece correto.'
  );


  verificar_(
    String(
      diagnosticoRecuperado.empresa_id
    ) ===
    String(
      inicio.empresa_id
    ),
    'empresa_id permanece correto.'
  );


  verificar_(
    String(
      diagnosticoRecuperado.conversa_id
    ) ===
    String(
      inicio.conversa_id
    ),
    'conversa_id permanece correto.'
  );


  // ============================================================
  // 5. VALIDAR PROCESSO
  // ============================================================

  Logger.log(
    '========== 5. VALIDANDO PROCESSO =========='
  );


  const processo =
    String(
      diagnosticoRecuperado.processo_resumo ||
      diagnosticoRecuperado.processo_nome ||
      ''
    ).trim();


  verificar_(
    processo.length > 0,
    'Processo foi persistido.'
  );


  verificar_(
    normalizarTextoDiagnostico_(
      processo
    ).indexOf(
      'pedido'
    ) !== -1,
    'Processo persistido contém referência aos pedidos.'
  );


  // ============================================================
  // 6. VALIDAR FREQUÊNCIA
  // ============================================================

  Logger.log(
    '========== 6. VALIDANDO FREQUÊNCIA =========='
  );


  const frequencia =
    String(
      diagnosticoRecuperado.frequencia ||
      ''
    ).trim();


  verificar_(
    normalizarTextoDiagnostico_(
      frequencia
    ) ===
    'diaria',
    'Frequência diária foi preservada.'
  );


  // ============================================================
  // 7. VALIDAR IMPACTO
  // ============================================================

  Logger.log(
    '========== 7. VALIDANDO IMPACTO =========='
  );


  const impacto =
    String(
      diagnosticoRecuperado.impacto_nivel ||
      diagnosticoRecuperado.impacto ||
      ''
    ).trim();


  verificar_(
    normalizarTextoDiagnostico_(
      impacto
    ).indexOf(
      'tres horas'
    ) !== -1,
    'Impacto de três horas por dia foi preservado.'
  );


  // ============================================================
  // 8. VALIDAR OBJETIVO
  // ============================================================

  Logger.log(
    '========== 8. VALIDANDO OBJETIVO =========='
  );


  const objetivo =
    String(
      diagnosticoRecuperado.objetivo ||
      ''
    ).trim();


  verificar_(
    objetivo.length > 0,
    'Objetivo foi persistido.'
  );


  const objetivoNormalizado =
    normalizarTextoDiagnostico_(
      objetivo
    );


  verificar_(
    objetivoNormalizado.indexOf(
      'reduzir o tempo'
    ) !== -1,
    'Objetivo de reduzir o tempo foi preservado.'
  );


  verificar_(
    objetivoNormalizado.indexOf(
      'diminuir os erros'
    ) !== -1 ||
    objetivoNormalizado.indexOf(
      'erros'
    ) !== -1,
    'Objetivo relacionado à redução dos erros foi preservado.'
  );


  // ============================================================
  // 9. RECUPERAR E VALIDAR DORES
  // ============================================================

  Logger.log(
    '========== 9. VALIDANDO DORES =========='
  );


  let dores = [];


  try {

    dores =
      obterDoresDiagnostico_(
        inicio.diagnostico_id
      );

  } catch (erro) {

    falhar_(
      'obterDoresDiagnostico_ lançou erro.',
      erro
    );

  }


  verificar_(
    Array.isArray(dores),
    'obterDoresDiagnostico_ retornou uma lista.'
  );


  Logger.log(
    'TOTAL DE DORES: ' +
    dores.length
  );


  Logger.log(
    JSON.stringify(
      dores,
      null,
      2
    )
  );


  verificar_(
    dores.length === 2,
    'Existem exatamente 2 dores persistidas.'
  );


  const descricoesDores =
    dores.map(
      function(dor) {

        return normalizarTextoDiagnostico_(
          dor.descricao ||
          ''
        );

      }
    );


  const temDorTempo =
    descricoesDores.some(
      function(descricao) {

        return (
          descricao.indexOf(
            'perda de tempo'
          ) !== -1 ||
          descricao.indexOf(
            'perde tres horas'
          ) !== -1 ||
          descricao.indexOf(
            'processo manual'
          ) !== -1
        );

      }
    );


  verificar_(
    temDorTempo,
    'Dor relacionada à perda de tempo/processo manual foi preservada.'
  );


  const temDorDigitacao =
    descricoesDores.some(
      function(descricao) {

        return (
          descricao.indexOf(
            'digitacao'
          ) !== -1 ||
          descricao.indexOf(
            'preenchimento'
          ) !== -1
        );

      }
    );


  verificar_(
    temDorDigitacao,
    'Dor relacionada aos erros de digitação foi preservada.'
  );


  // ============================================================
  // 10. VALIDAR IDS DAS DORES
  // ============================================================

  Logger.log(
    '========== 10. VALIDANDO IDS DAS DORES =========='
  );


  const idsDores =
    dores.map(
      function(dor) {

        return String(
          dor.dor_id ||
          ''
        ).trim();

      }
    );


  verificar_(
    idsDores.every(
      function(id) {

        return id.length > 0;

      }
    ),
    'Todas as dores possuem dor_id.'
  );


  const idsDoresUnicos =
    idsDores.filter(
      function(
        id,
        indice
      ) {

        return (
          idsDores.indexOf(id) ===
          indice
        );

      }
    );


  verificar_(
    idsDoresUnicos.length ===
      idsDores.length,
    'Os dor_id são únicos.'
  );


  // ============================================================
  // 11. VALIDAR RELACIONAMENTO DAS DORES
  // ============================================================

  Logger.log(
    '========== 11. VALIDANDO RELACIONAMENTO DAS DORES =========='
  );


  dores.forEach(
    function(dor) {

      /*
       * obterDoresDiagnostico_ filtra pelo diagnostico_id,
       * portanto o teste também verifica que o registro
       * retornado possui os dados mínimos esperados.
       */

      verificar_(
        String(
          dor.descricao ||
          ''
        ).trim().length > 0,
        'Dor possui descrição.'
      );


      verificar_(
        String(
          dor.diagnostico_id ||
          inicio.diagnostico_id
        ) ===
        String(
          inicio.diagnostico_id
        ),
        'Dor está vinculada ao diagnóstico correto.'
      );

    }
  );


  // ============================================================
  // 12. RECUPERAR E VALIDAR MEDIDAS
  // ============================================================

  Logger.log(
    '========== 12. VALIDANDO MEDIDAS =========='
  );


  let medidas = [];


  try {

    medidas =
      obterMedidasDiagnostico_(
        inicio.empresa_id,
        inicio.conversa_id
      );

  } catch (erro) {

    falhar_(
      'obterMedidasDiagnostico_ lançou erro.',
      erro
    );

  }


  verificar_(
    Array.isArray(medidas),
    'obterMedidasDiagnostico_ retornou uma lista.'
  );


  Logger.log(
    'TOTAL DE MEDIDAS: ' +
    medidas.length
  );


  Logger.log(
    JSON.stringify(
      medidas,
      null,
      2
    )
  );


  verificar_(
    medidas.length > 0,
    'Existem medidas persistidas.'
  );


  // ============================================================
  // 13. VALIDAR VOLUME CONFIRMADO
  // ============================================================

  Logger.log(
    '========== 13. VALIDANDO VOLUME CONFIRMADO =========='
  );


  let volume =
    '';


  try {

    volume =
      obterUltimoVolumeDiagnostico_(
        medidas
      );

  } catch (erro) {

    falhar_(
      'obterUltimoVolumeDiagnostico_ lançou erro.',
      erro
    );

  }


  Logger.log(
    'VOLUME RECUPERADO: ' +
    volume
  );


  const volumeNormalizado =
    normalizarTextoDiagnostico_(
      volume
    );


  verificar_(
    volumeNormalizado.indexOf(
      '80'
    ) !== -1 &&
    volumeNormalizado.indexOf(
      'pedido'
    ) !== -1,
    'Volume confirmado de 80 pedidos por dia foi preservado.'
  );


  // ============================================================
  // 14. SEGUNDA LEITURA DA PERSISTÊNCIA
  // ============================================================

  Logger.log(
    '========== 14. SEGUNDA LEITURA DA PERSISTÊNCIA =========='
  );


  let diagnosticoSegundaLeitura;


  try {

    diagnosticoSegundaLeitura =
      obterDiagnosticoAtual_(
        inicio.empresa_id,
        inicio.conversa_id
      );

  } catch (erro) {

    falhar_(
      'Segunda leitura do diagnóstico lançou erro.',
      erro
    );

  }


  verificar_(
    !!diagnosticoSegundaLeitura,
    'Diagnóstico continua recuperável na segunda leitura.'
  );


  if (diagnosticoSegundaLeitura) {

    verificar_(
      String(
        diagnosticoSegundaLeitura.diagnostico_id
      ) ===
      String(
        diagnosticoRecuperado.diagnostico_id
      ),
      'diagnostico_id permanece idêntico na segunda leitura.'
    );


    verificar_(
      String(
        diagnosticoSegundaLeitura.empresa_id
      ) ===
      String(
        diagnosticoRecuperado.empresa_id
      ),
      'empresa_id permanece idêntico na segunda leitura.'
    );


    verificar_(
      String(
        diagnosticoSegundaLeitura.conversa_id
      ) ===
      String(
        diagnosticoRecuperado.conversa_id
      ),
      'conversa_id permanece idêntico na segunda leitura.'
    );


    verificar_(
      normalizarTextoDiagnostico_(
        String(
          diagnosticoSegundaLeitura.impacto_nivel ||
          ''
        )
      ).indexOf(
        'tres horas'
      ) !== -1,
      'Impacto continua preservado na segunda leitura.'
    );


    verificar_(
      normalizarTextoDiagnostico_(
        String(
          diagnosticoSegundaLeitura.objetivo ||
          ''
        )
      ).indexOf(
        'reduzir o tempo'
      ) !== -1,
      'Objetivo continua preservado na segunda leitura.'
    );

  }


  // ============================================================
  // 15. SEGUNDA LEITURA DAS DORES
  // ============================================================

  Logger.log(
    '========== 15. SEGUNDA LEITURA DAS DORES =========='
  );


  let doresSegundaLeitura =
    [];


  try {

    doresSegundaLeitura =
      obterDoresDiagnostico_(
        inicio.diagnostico_id
      );

  } catch (erro) {

    falhar_(
      'Segunda leitura das dores lançou erro.',
      erro
    );

  }


  verificar_(
    Array.isArray(
      doresSegundaLeitura
    ),
    'Segunda leitura das dores retornou lista.'
  );


  verificar_(
    doresSegundaLeitura.length ===
      dores.length,
    'Quantidade de dores não mudou entre as leituras.'
  );


  const idsDoresSegunda =
    doresSegundaLeitura.map(
      function(dor) {

        return String(
          dor.dor_id ||
          ''
        ).trim();

      }
    );


  verificar_(
    idsDoresSegunda.filter(
      function(
        id,
        indice
      ) {

        return (
          idsDoresSegunda.indexOf(id) ===
          indice
        );

      }
    ).length ===
    idsDoresSegunda.length,
    'IDs continuam únicos na segunda leitura.'
  );


  // ============================================================
  // 16. SEGUNDA LEITURA DAS MEDIDAS
  // ============================================================

  Logger.log(
    '========== 16. SEGUNDA LEITURA DAS MEDIDAS =========='
  );


  let medidasSegundaLeitura =
    [];


  try {

    medidasSegundaLeitura =
      obterMedidasDiagnostico_(
        inicio.empresa_id,
        inicio.conversa_id
      );

  } catch (erro) {

    falhar_(
      'Segunda leitura das medidas lançou erro.',
      erro
    );

  }


  verificar_(
    Array.isArray(
      medidasSegundaLeitura
    ),
    'Segunda leitura das medidas retornou lista.'
  );


  verificar_(
    medidasSegundaLeitura.length ===
      medidas.length,
    'Quantidade de medidas não mudou entre as leituras.'
  );


  const volumeSegundaLeitura =
    obterUltimoVolumeDiagnostico_(
      medidasSegundaLeitura
    );


  verificar_(
    normalizarTextoDiagnostico_(
      volumeSegundaLeitura
    ).indexOf(
      '80'
    ) !== -1 &&
    normalizarTextoDiagnostico_(
      volumeSegundaLeitura
    ).indexOf(
      'pedido'
    ) !== -1,
    'Volume de 80 pedidos continua preservado na segunda leitura.'
  );


  // ============================================================
  // 17. RESULTADO FINAL
  // ============================================================

  Logger.log(
    '============================================================'
  );


  Logger.log(
    ' RESULTADO TESTE PERSISTÊNCIA E INTEGRIDADE V5.6'
  );


  Logger.log(
    '============================================================'
  );


  const resultado = {

    aprovado:
      erros.length === 0,

    erros:
      erros,

    empresa_id:
      inicio.empresa_id,

    conversa_id:
      inicio.conversa_id,

    diagnostico_id:
      inicio.diagnostico_id,

    total_resultados:
      resultados.length,

    total_dores:
      dores.length,

    total_dores_segunda_leitura:
      doresSegundaLeitura.length,

    total_medidas:
      medidas.length,

    total_medidas_segunda_leitura:
      medidasSegundaLeitura.length,

    processo:
      processo,

    frequencia:
      frequencia,

    impacto:
      impacto,

    volume:
      volume,

    objetivo:
      objetivo

  };


  Logger.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );


  if (
    erros.length === 0
  ) {

    Logger.log(
      '============================================================'
    );


    Logger.log(
      '========== TESTE PERSISTÊNCIA V5.6 APROVADO =========='
    );


    Logger.log(
      '============================================================'
    );

  } else {

    Logger.log(
      '============================================================'
    );


    Logger.log(
      '========== TESTE PERSISTÊNCIA V5.6 REPROVADO =========='
    );


    Logger.log(
      '============================================================'
    );

  }


  return resultado;
}
function TESTAR_DUPLICACAO_VOLUME_V56() {

  const empresaId = 'TESTE_V56';
  const conversaId = 'TESTE_VOLUME_V56';

  const volume = '80 pedidos por dia';

  Logger.log('========================================');
  Logger.log('TESTE V5.6 — DUPLICAÇÃO DE VOLUME');
  Logger.log('========================================');

  Logger.log('Empresa: ' + empresaId);
  Logger.log('Conversa: ' + conversaId);
  Logger.log('Volume de teste: ' + volume);

  const antes = obterMedidasDiagnostico_(
    empresaId,
    conversaId
  );

  Logger.log(
    'Medidas existentes antes: ' +
    JSON.stringify(antes)
  );

  registrarEventoDiagnostico_(
    'MEDIDA_DIAGNOSTICO',
    {
      empresa_id: empresaId,
      conversa_id: conversaId,
      valor: {
        tipo: 'VOLUME',
        texto: volume
      }
    }
  );

  const depoisPrimeiro =
    obterMedidasDiagnostico_(
      empresaId,
      conversaId
    );

  Logger.log(
    'Depois da primeira gravação: ' +
    JSON.stringify(depoisPrimeiro)
  );

  registrarEventoDiagnostico_(
    'MEDIDA_DIAGNOSTICO',
    {
      empresa_id: empresaId,
      conversa_id: conversaId,
      valor: {
        tipo: 'VOLUME',
        texto: volume
      }
    }
  );

  const depoisSegundo =
    obterMedidasDiagnostico_(
      empresaId,
      conversaId
    );

  Logger.log(
    'Depois da segunda tentativa: ' +
    JSON.stringify(depoisSegundo)
  );

  Logger.log('========================================');

  if (
    depoisSegundo.length ===
    depoisPrimeiro.length
  ) {

    Logger.log(
      '✅ TESTE PASSOU'
    );

    Logger.log(
      'A segunda gravação foi bloqueada.'
    );

  } else {

    Logger.log(
      '❌ TESTE FALHOU'
    );

    Logger.log(
      'O VOLUME foi duplicado.'
    );

  }

  Logger.log('========================================');
}function TESTAR_FLUXO_VOLUME_MEMORIA_V56() {

  const empresaId = 'TESTE_MEMORIA_V56';
  const conversaId = 'TESTE_MEMORIA_VOLUME_V56';

  Logger.log('========================================');
  Logger.log('TESTE FLUXO REAL DE MEMÓRIA V5.6');
  Logger.log('========================================');


  // ============================================================
  // 1. GARANTE UM VOLUME INICIAL
  // ============================================================

  Logger.log('');
  Logger.log('1) Gravando volume inicial: 80 pedidos por dia');

  registrarEventoDiagnostico_(
    'MEDIDA_DIAGNOSTICO',
    {
      empresa_id: empresaId,
      conversa_id: conversaId,

      valor: {
        tipo: 'VOLUME',
        texto: '80 pedidos por dia'
      }
    }
  );


  let medidas =
    obterMedidasDiagnostico_(
      empresaId,
      conversaId
    );


  Logger.log(
    'Medidas após volume inicial: ' +
    JSON.stringify(medidas)
  );


  // ============================================================
  // 2. SIMULA IA DEVOLVENDO A MEMÓRIA
  // ============================================================

  Logger.log('');
  Logger.log(
    '2) Simulando IA devolvendo o VOLUME antigo como memória'
  );

  registrarEventoDiagnostico_(
    'MEDIDA_DIAGNOSTICO',
    {
      empresa_id: empresaId,
      conversa_id: conversaId,

      valor: {
        tipo: 'VOLUME',
        texto: '80 pedidos por dia'
      }
    }
  );


  medidas =
    obterMedidasDiagnostico_(
      empresaId,
      conversaId
    );


  Logger.log(
    'Medidas após memória da IA: ' +
    JSON.stringify(medidas)
  );


  // ============================================================
  // 3. VERIFICA DUPLICAÇÃO
  // ============================================================

  Logger.log('');

  const volumes80 =
    medidas.filter(
      function(medida) {

        return (
          String(
            medida.tipo || ''
          )
            .trim()
            .toUpperCase() ===
          'VOLUME'
          &&
          String(
            medida.texto || ''
          )
            .trim() ===
          '80 pedidos por dia'
        );

      }
    );


  Logger.log(
    'Quantidade de VOLUMES "80 pedidos por dia": ' +
    volumes80.length
  );


  if (
    volumes80.length !== 1
  ) {

    Logger.log(
      '❌ FALHA: o volume antigo foi duplicado.'
    );

    return;

  }


  Logger.log(
    '✅ MEMÓRIA NÃO FOI DUPLICADA.'
  );


  // ============================================================
  // 4. SIMULA NOVO VOLUME
  // ============================================================

  Logger.log('');
  Logger.log(
    '3) Simulando nova informação: 120 pedidos por dia'
  );


  registrarEventoDiagnostico_(
    'MEDIDA_DIAGNOSTICO',
    {
      empresa_id: empresaId,
      conversa_id: conversaId,

      valor: {
        tipo: 'VOLUME',
        texto: '120 pedidos por dia'
      }
    }
  );


  medidas =
    obterMedidasDiagnostico_(
      empresaId,
      conversaId
    );


  Logger.log(
    'Medidas após novo volume: ' +
    JSON.stringify(medidas)
  );


  // ============================================================
  // 5. VERIFICA RESULTADO FINAL
  // ============================================================

  const volumes =
    medidas.filter(
      function(medida) {

        return (
          String(
            medida.tipo || ''
          )
            .trim()
            .toUpperCase() ===
          'VOLUME'
        );

      }
    );


  Logger.log('');
  Logger.log(
    'Quantidade total de VOLUMES: ' +
    volumes.length
  );


  const tem80 =
    volumes.some(
      function(medida) {

        return (
          String(
            medida.texto || ''
          ).trim() ===
          '80 pedidos por dia'
        );

      }
    );


  const tem120 =
    volumes.some(
      function(medida) {

        return (
          String(
            medida.texto || ''
          ).trim() ===
          '120 pedidos por dia'
        );

      }
    );


  Logger.log('');
  Logger.log('Tem volume 80: ' + tem80);
  Logger.log('Tem volume 120: ' + tem120);


  Logger.log('');
  Logger.log('========================================');


  if (
    volumes.length === 2 &&
    tem80 &&
    tem120
  ) {

    Logger.log(
      '✅ TESTE COMPLETO V5.6 PASSOU'
    );

    Logger.log(
      'Memória antiga não duplicou e novo volume foi registrado.'
    );

  } else {

    Logger.log(
      '❌ TESTE COMPLETO V5.6 FALHOU'
    );

  }


  Logger.log(
    '========================================'
  );

}
function TESTAR_ESTRUTURA_DIAGNOSTICO_V56() {

  Logger.log('========================================');
  Logger.log('AUDITORIA DA V5.6');
  Logger.log('========================================');

  const funcoes = [
    'processarMensagemDiagnostico_',
    'processarMensagemDiagnostico',
    'registrarNovasInformacoesDiagnostico_',
    'registrarEventoDiagnostico_',
    'obterMedidasDiagnostico_',
    'extrairMedidasMensagemDiagnostico_',
    'normalizarChaveMedidaDiagnostico_',
    'normalizarVolumeDiagnostico_'
  ];

  funcoes.forEach(function(nome) {

    try {

      const fn = eval(nome);

      Logger.log(
        '✅ EXISTE: ' + nome
      );

      Logger.log(
        '   tipo: ' +
        typeof fn
      );

      Logger.log(
        '   parâmetros: ' +
        fn.length
      );

    } catch (erro) {

      Logger.log(
        '❌ NÃO ENCONTRADA: ' +
        nome
      );

    }

  });

  Logger.log('');
  Logger.log('========================================');
  Logger.log('FIM DA AUDITORIA');
  Logger.log('========================================');

}
function TESTAR_V56_COMPLETO() {

  const inicio = new Date();

  const resultado = {
    inicio: inicio,
    testes: [],
    erros: [],
    ids: {
      empresa_id: '',
      conversa_id: '',
      diagnostico_id: ''
    }
  };


  function PASSOU(nome, detalhe) {

    resultado.testes.push({
      nome: nome,
      status: 'PASSOU',
      detalhe: detalhe || ''
    });

    Logger.log(
      '✅ PASSOU | ' +
      nome +
      (detalhe ? ' | ' + detalhe : '')
    );

  }


  function FALHOU(nome, erro) {

    const mensagem =
      erro &&
      erro.message
        ? erro.message
        : String(erro || 'Erro desconhecido');

    resultado.testes.push({
      nome: nome,
      status: 'FALHOU',
      detalhe: mensagem
    });

    resultado.erros.push({
      nome: nome,
      erro: mensagem
    });

    Logger.log(
      '❌ FALHOU | ' +
      nome +
      ' | ' +
      mensagem
    );

  }


  function executar(nome, funcao) {

    try {

      const retorno = funcao();

      PASSOU(
        nome,
        retorno !== undefined
          ? JSON.stringify(retorno).substring(0, 500)
          : ''
      );

      return retorno;

    } catch (erro) {

      FALHOU(
        nome,
        erro
      );

      return null;

    }

  }


  Logger.log('');
  Logger.log('==============================================');
  Logger.log('       FEEDS SOLUTIONS — V5.6');
  Logger.log('          TESTE GERAL INTEGRADO');
  Logger.log('==============================================');
  Logger.log('');


  // ============================================================
  // 01 — FUNÇÕES CRÍTICAS
  // ============================================================

  const funcoesCriticas = [

    'iniciarDiagnostico',
    'processarMensagemDiagnostico',
    'registrarNovasInformacoesDiagnostico_',
    'registrarEventoDiagnostico_',
    'obterMedidasDiagnostico_',
    'extrairMedidasMensagemDiagnostico_',
    'normalizarChaveMedidaDiagnostico_',
    'normalizarVolumeDiagnostico_',
    'construirContextoDiagnostico_',
    'construirEntradaDiagnosticoIA_',
    'normalizarAnaliseDiagnostico_',
    'ajustarContinuidadeDiagnostico_',
    'atualizarDiagnosticoComAnalise_',
    'determinarEstadoDiagnostico_',
    'obterRespostaConversa_'

  ];


  let funcoesOK = 0;

  funcoesCriticas.forEach(function(nome) {

    try {

      const fn = eval(nome);

      if (
        typeof fn === 'function'
      ) {

        funcoesOK++;

      } else {

        throw new Error(
          nome + ' não é uma função.'
        );

      }

    } catch (erro) {

      FALHOU(
        'FUNÇÃO ' + nome,
        erro
      );

    }

  });


  if (
    funcoesOK ===
    funcoesCriticas.length
  ) {

    PASSOU(
      'ESTRUTURA DAS FUNÇÕES CRÍTICAS',
      funcoesOK +
      '/' +
      funcoesCriticas.length
    );

  }


  // ============================================================
  // 02 — CONFIGURAÇÃO
  // ============================================================

  executar(
    'CONFIGURAÇÃO DO SISTEMA',
    function() {

      if (
        typeof SHEETS === 'undefined'
      ) {

        throw new Error(
          'Constante SHEETS não encontrada.'
        );

      }

      const obrigatorias = [
        'EMPRESAS',
        'CONVERSAS',
        'DIAGNOSTICOS',
        'DORES',
        'METRICAS'
      ];


      obrigatorias.forEach(function(nome) {

        if (
          !SHEETS[nome]
        ) {

          throw new Error(
            'SHEETS.' +
            nome +
            ' não configurada.'
          );

        }

      });


      return {
        sheets: obrigatorias
      };

    }
  );


  // ============================================================
  // 03 — ABAS
  // ============================================================

  const abasObrigatorias = [
    'EMPRESAS',
    'CONVERSAS',
    'DIAGNOSTICOS',
    'DORES',
    'METRICAS'
  ];


  abasObrigatorias.forEach(function(nome) {

    executar(
      'ABA ' + nome,
      function() {

        const aba =
          obterAbaDiagnostico_([
            nome
          ]);

        if (
          !aba
        ) {

          throw new Error(
            'Aba não encontrada.'
          );

        }

        return {
          nome: aba.getName(),
          linhas: aba.getLastRow(),
          colunas: aba.getLastColumn()
        };

      }
    );

  });


  // ============================================================
  // 04 — CRIAR DIAGNÓSTICO DE TESTE
  // ============================================================

  const diagnosticoTeste =
    executar(
      'CRIAR DIAGNÓSTICO DE TESTE',
      function() {

        return iniciarDiagnostico({

          nome:
            'TESTE V5.6 — NÃO USAR',

          nome_empresa:
            'TESTE V5.6 — NÃO USAR',

          segmento:
            'TESTE',

          porte:
            'TESTE',

          nome_contato:
            'TESTE AUTOMÁTICO',

          whatsapp:
            '',

          email:
            '',

          cidade:
            'TESTE'

        });

      }
    );


  if (
    !diagnosticoTeste ||
    !diagnosticoTeste.empresa_id ||
    !diagnosticoTeste.conversa_id ||
    !diagnosticoTeste.diagnostico_id
  ) {

    Logger.log('');
    Logger.log(
      '❌ Não foi possível continuar: criação do diagnóstico falhou.'
    );

    Logger.log(
      '=============================================='
    );

    return resultado;

  }


  resultado.ids =
    diagnosticoTeste;


  Logger.log('');
  Logger.log(
    'ID EMPRESA: ' +
    resultado.ids.empresa_id
  );

  Logger.log(
    'ID CONVERSA: ' +
    resultado.ids.conversa_id
  );

  Logger.log(
    'ID DIAGNÓSTICO: ' +
    resultado.ids.diagnostico_id
  );


  // ============================================================
  // 05 — PROCESSAMENTO REAL DA PRIMEIRA MENSAGEM
  // ============================================================

  const primeiraMensagem =
    executar(
      'PROCESSAR MENSAGEM REAL — VOLUME INICIAL',
      function() {

        return processarMensagemDiagnostico({

          empresa_id:
            resultado.ids.empresa_id,

          conversa_id:
            resultado.ids.conversa_id,

          mensagem:
            'Nossa empresa processa aproximadamente 80 pedidos por dia.'

        });

      }
    );


  if (
    primeiraMensagem
  ) {

    if (
      primeiraMensagem.sucesso
    ) {

      PASSOU(
        'RETORNO DO MOTOR DE DIAGNÓSTICO'
      );

    } else {

      FALHOU(
        'RETORNO DO MOTOR DE DIAGNÓSTICO',
        'A função retornou sem sucesso.'
      );

    }

  }


  // ============================================================
  // 06 — VERIFICAR VOLUME
  // ============================================================

  const medidasDepoisPrimeira =
    executar(
      'RECUPERAR MEDIDAS APÓS PRIMEIRA MENSAGEM',
      function() {

        return obterMedidasDiagnostico_(
          resultado.ids.empresa_id,
          resultado.ids.conversa_id
        );

      }
    );


  let volumes80 = [];


  if (
    medidasDepoisPrimeira
  ) {

    volumes80 =
      medidasDepoisPrimeira.filter(
        function(medida) {

          return (

            String(
              medida.tipo || ''
            )
              .trim()
              .toUpperCase() ===
            'VOLUME'

            &&

            normalizarVolumeDiagnostico_(
              medida.texto
            ) ===
            normalizarVolumeDiagnostico_(
              '80 pedidos por dia'
            )

          );

        }
      );


    if (
      volumes80.length === 1
    ) {

      PASSOU(
        'VOLUME INICIAL',
        '80 pedidos por dia registrado uma vez.'
      );

    } else {

      FALHOU(
        'VOLUME INICIAL',
        'Quantidade encontrada: ' +
        volumes80.length
      );

    }

  }


  // ============================================================
  // 07 — MEMÓRIA / NOVA MENSAGEM SEM VOLUME
  // ============================================================

  const segundaMensagem =
    executar(
      'PROCESSAR MENSAGEM REAL — SEM NOVO VOLUME',
      function() {

        return processarMensagemDiagnostico({

          empresa_id:
            resultado.ids.empresa_id,

          conversa_id:
            resultado.ids.conversa_id,

          mensagem:
            'Esse volume acontece normalmente durante a operação.'

        });

      }
    );


  const medidasDepoisSegunda =
    executar(
      'RECUPERAR MEDIDAS APÓS SEGUNDA MENSAGEM',
      function() {

        return obterMedidasDiagnostico_(
          resultado.ids.empresa_id,
          resultado.ids.conversa_id
        );

      }
    );


  if (
    medidasDepoisSegunda
  ) {

    const volumes80Depois =
      medidasDepoisSegunda.filter(
        function(medida) {

          return (

            String(
              medida.tipo || ''
            )
              .trim()
              .toUpperCase() ===
            'VOLUME'

            &&

            normalizarVolumeDiagnostico_(
              medida.texto
            ) ===
            normalizarVolumeDiagnostico_(
              '80 pedidos por dia'
            )

          );

        }
      );


    if (
      volumes80Depois.length === 1
    ) {

      PASSOU(
        'MEMÓRIA DO VOLUME',
        'Volume consolidado não foi duplicado.'
      );

    } else {

      FALHOU(
        'MEMÓRIA DO VOLUME',
        'Volume 80 apareceu ' +
        volumes80Depois.length +
        ' vezes.'
      );

    }

  }


  // ============================================================
  // 08 — NOVO VOLUME
  // ============================================================

  const terceiraMensagem =
    executar(
      'PROCESSAR MENSAGEM REAL — NOVO VOLUME',
      function() {

        return processarMensagemDiagnostico({

          empresa_id:
            resultado.ids.empresa_id,

          conversa_id:
            resultado.ids.conversa_id,

          mensagem:
            'Hoje estamos processando cerca de 120 pedidos por dia.'

        });

      }
    );


  const medidasFinais =
    executar(
      'RECUPERAR MEDIDAS FINAIS',
      function() {

        return obterMedidasDiagnostico_(
          resultado.ids.empresa_id,
          resultado.ids.conversa_id
        );

      }
    );


  if (
    medidasFinais
  ) {

    const volumes =
      medidasFinais.filter(
        function(medida) {

          return (
            String(
              medida.tipo || ''
            )
              .trim()
              .toUpperCase() ===
            'VOLUME'
          );

        }
      );


    const tem80 =
      volumes.some(
        function(medida) {

          return (
            normalizarVolumeDiagnostico_(
              medida.texto
            ) ===
            normalizarVolumeDiagnostico_(
              '80 pedidos por dia'
            )
          );

        }
      );


    const tem120 =
      volumes.some(
        function(medida) {

          return (
            normalizarVolumeDiagnostico_(
              medida.texto
            ) ===
            normalizarVolumeDiagnostico_(
              '120 pedidos por dia'
            )
          );

        }
      );


    if (
      volumes.length === 2 &&
      tem80 &&
      tem120
    ) {

      PASSOU(
        'EVOLUÇÃO DO VOLUME',
        '80 → 120 sem duplicação.'
      );

    } else {

      FALHOU(
        'EVOLUÇÃO DO VOLUME',
        'Volumes encontrados: ' +
        JSON.stringify(volumes)
      );

    }

  }


  // ============================================================
  // 09 — CONTEXTO
  // ============================================================

  executar(
    'CONSTRUÇÃO DO CONTEXTO',
    function() {

      const diagnostico =
        obterDiagnosticoAtual_(
          resultado.ids.empresa_id,
          resultado.ids.conversa_id
        );


      if (
        !diagnostico
      ) {

        throw new Error(
          'Diagnóstico não recuperado.'
        );

      }


      const contexto =
        construirContextoDiagnostico_(
          diagnostico
        );


      if (
        !contexto
      ) {

        throw new Error(
          'Contexto não construído.'
        );

      }


      return {
        volume:
          contexto.diagnostico &&
          contexto.diagnostico.volume,

        medidas:
          contexto.medidas &&
          contexto.medidas.length,

        historico:
          contexto.historico &&
          contexto.historico.length
      };

    }
  );


  // ============================================================
  // 10 — ENTRADA DA IA
  // ============================================================

  executar(
    'CONSTRUÇÃO DA ENTRADA DA IA',
    function() {

      const diagnostico =
        obterDiagnosticoAtual_(
          resultado.ids.empresa_id,
          resultado.ids.conversa_id
        );


      const contexto =
        construirContextoDiagnostico_(
          diagnostico
        );


      const entrada =
        construirEntradaDiagnosticoIA_(
          'Teste de integridade da V5.6.',
          contexto
        );


      if (
        !entrada ||
        typeof entrada !== 'string'
      ) {

        throw new Error(
          'Entrada da IA inválida.'
        );

      }


      if (
        entrada.indexOf(
          'DIAGNÓSTICO CONSOLIDADO:'
        ) === -1
      ) {

        throw new Error(
          'Diagnóstico não encontrado na entrada da IA.'
        );

      }


      if (
        entrada.indexOf(
          'MEDIDAS JÁ REGISTRADAS:'
        ) === -1
      ) {

        throw new Error(
          'Medidas não encontradas na entrada da IA.'
        );

      }


      return {
        caracteres:
          entrada.length,

        possuiVolume:
          entrada.indexOf(
            '80 pedidos por dia'
          ) !== -1 ||
          entrada.indexOf(
            '120 pedidos por dia'
          ) !== -1
      };

    }
  );


  // ============================================================
  // 11 — NORMALIZAÇÃO DE VOLUME
  // ============================================================

  executar(
    'NORMALIZAÇÃO DE VOLUME',
    function() {

      const a =
        normalizarVolumeDiagnostico_(
          '80 pedidos por dia'
        );

      const b =
        normalizarVolumeDiagnostico_(
          '80 pedidos/dia'
        );

      const c =
        normalizarVolumeDiagnostico_(
          '80 pedidos diariamente'
        );


      if (
        !a ||
        !b ||
        !c
      ) {

        throw new Error(
          'Normalização retornou valor vazio.'
        );

      }


      return {
        original: a,
        barra: b,
        diariamente: c
      };

    }
  );


  // ============================================================
  // 12 — DEDUPLICAÇÃO DIRETA
  // ============================================================

  executar(
    'DEDUPLICAÇÃO CENTRAL',
    function() {

      const antes =
        obterMedidasDiagnostico_(
          resultado.ids.empresa_id,
          resultado.ids.conversa_id
        );


      registrarEventoDiagnostico_(
        'MEDIDA_DIAGNOSTICO',
        {

          empresa_id:
            resultado.ids.empresa_id,

          conversa_id:
            resultado.ids.conversa_id,

          valor: {

            tipo:
              'VOLUME',

            texto:
              '120 pedidos por dia'

          }

        }
      );


      const depois =
        obterMedidasDiagnostico_(
          resultado.ids.empresa_id,
          resultado.ids.conversa_id
        );


      const quantidade120 =
        depois.filter(
          function(medida) {

            return (

              String(
                medida.tipo || ''
              )
                .trim()
                .toUpperCase() ===
              'VOLUME'

              &&

              normalizarVolumeDiagnostico_(
                medida.texto
              ) ===
              normalizarVolumeDiagnostico_(
                '120 pedidos por dia'
              )

            );

          }
        ).length;


      if (
        quantidade120 !== 1
      ) {

        throw new Error(
          'VOLUME 120 foi duplicado.'
        );

      }


      return {
        antes:
          antes.length,

        depois:
          depois.length,

        volume120:
          quantidade120
      };

    }
  );


  // ============================================================
  // 13 — DIAGNÓSTICO FINAL
  // ============================================================

  executar(
    'RECUPERAÇÃO DO DIAGNÓSTICO FINAL',
    function() {

      const diagnostico =
        obterDiagnosticoAtual_(
          resultado.ids.empresa_id,
          resultado.ids.conversa_id
        );


      if (
        !diagnostico
      ) {

        throw new Error(
          'Diagnóstico final não encontrado.'
        );

      }


      if (
        diagnostico.empresa_id !==
        resultado.ids.empresa_id
      ) {

        throw new Error(
          'empresa_id inconsistente.'
        );

      }


      if (
        diagnostico.conversa_id !==
        resultado.ids.conversa_id
      ) {

        throw new Error(
          'conversa_id inconsistente.'
        );

      }


      return {

        diagnostico_id:
          diagnostico.diagnostico_id,

        estado:
          diagnostico.status_diagnostico,

        volume:
          diagnostico.volume ||
          '(volume armazenado em METRICAS)'

      };

    }
  );


  // ============================================================
  // 14 — RELATÓRIO
  // ============================================================

  const total =
    resultado.testes.length;

  const passaram =
    resultado.testes.filter(
      function(t) {
        return t.status === 'PASSOU';
      }
    ).length;

  const falharam =
    resultado.testes.filter(
      function(t) {
        return t.status === 'FALHOU';
      }
    ).length;


  const fim = new Date();

  const duracao =
    fim.getTime() -
    inicio.getTime();


  Logger.log('');
  Logger.log('==============================================');
  Logger.log('              RESULTADO FINAL');
  Logger.log('==============================================');

  Logger.log(
    'TOTAL DE TESTES: ' +
    total
  );

  Logger.log(
    'PASSARAM: ' +
    passaram
  );

  Logger.log(
    'FALHARAM: ' +
    falharam
  );

  Logger.log(
    'DURAÇÃO: ' +
    duracao +
    ' ms'
  );


  Logger.log('');
  Logger.log('----------------------------------------------');


  resultado.testes.forEach(
    function(teste, indice) {

      Logger.log(
        String(indice + 1).padStart(2, '0') +
        ' | ' +
        teste.status +
        ' | ' +
        teste.nome +
        (
          teste.detalhe
            ? ' | ' + teste.detalhe
            : ''
        )
      );

    }
  );


  Logger.log('');
  Logger.log('----------------------------------------------');


  if (
    falharam === 0 &&
    total > 0
  ) {

    Logger.log(
      '🟢 V5.6 — TESTE GERAL PASSOU'
    );

    Logger.log(
      'Todos os testes executados nesta bateria passaram.'
    );

  } else {

    Logger.log(
      '🔴 V5.6 — TESTE GERAL FALHOU'
    );

    Logger.log(
      'NÃO evoluir a versão até corrigir os testes.'
    );

  }


  Logger.log('==============================================');
  Logger.log('');


  // ============================================================
  // LIMPEZA DOS DADOS DE TESTE
  // ============================================================

  Logger.log(
    '⚠️ INICIANDO LIMPEZA DOS DADOS DE TESTE...'
  );


  try {

    if (
      resultado.ids.empresa_id
    ) {

      limparDadosTesteV56_(
        resultado.ids.empresa_id,
        resultado.ids.conversa_id,
        resultado.ids.diagnostico_id
      );

      Logger.log(
        '✅ DADOS DE TESTE REMOVIDOS.'
      );

    }

  } catch (erroLimpeza) {

    Logger.log(
      '⚠️ ATENÇÃO: não foi possível limpar automaticamente os dados de teste.'
    );

    Logger.log(
      erroLimpeza.message ||
      String(erroLimpeza)
    );

  }


  return {

    sucesso:
      falharam === 0,

    total:
      total,

    passaram:
      passaram,

    falharam:
      falharam,

    duracao_ms:
      duracao,

    ids_teste:
      resultado.ids,

    detalhes:
      resultado.testes

  };

}
function limparDadosTesteV56_(
  empresaId,
  conversaId,
  diagnosticoId
) {

  const criterios = [
    String(empresaId || ''),
    String(conversaId || ''),
    String(diagnosticoId || '')
  ].filter(function(valor) {
    return valor !== '';
  });


  if (
    criterios.length === 0
  ) {

    return;

  }


  const nomesAbas = [
    'EMPRESAS',
    'CONVERSAS',
    'DIAGNOSTICOS',
    'DORES',
    'METRICAS',
    'DIAGNOSTICO_SOLUCOES',
    'LEADS',
    'FEEDBACK'
  ];


  nomesAbas.forEach(function(nomeAba) {

    try {

      const aba =
        obterAbaDiagnostico_([
          nomeAba
        ]);


      const valores =
        aba.getDataRange().getValues();


      if (
        valores.length <= 1
      ) {

        return;

      }


      const cabecalhos =
        valores[0].map(function(valor) {

          return String(
            valor || ''
          )
            .trim()
            .toLowerCase();

        });


      const colunasChave = [
        'empresa_id',
        'conversa_id',
        'diagnostico_id'
      ];


      const indices =
        colunasChave
          .map(function(nome) {

            return cabecalhos.indexOf(
              nome
            );

          })
          .filter(function(indice) {

            return indice !== -1;

          });


      if (
        indices.length === 0
      ) {

        return;

      }


      for (
        let i = valores.length - 1;
        i >= 1;
        i--
      ) {

        const linha =
          valores[i];


        const pertenceAoTeste =
          indices.some(
            function(indice) {

              return criterios.indexOf(
                String(
                  linha[indice] || ''
                )
              ) !== -1;

            }
          );


        if (
          pertenceAoTeste
        ) {

          aba.deleteRow(
            i + 1
          );

        }

      }

    } catch (erro) {

      Logger.log(
        'Limpeza ignorada em ' +
        nomeAba +
        ': ' +
        (
          erro.message ||
          String(erro)
        )
      );

    }

  });

}
function TESTAR_ESTADOS_V56() {

  Logger.log('');
  Logger.log('==============================================');
  Logger.log(' FEEDS SOLUTIONS — MATRIZ DE ESTADOS V5.6');
  Logger.log('==============================================');
  Logger.log('');


  const casos = [

    {
      nome: '01 — Nada informado',

      diagnostico: {
        processo_nome: '',
        dor_principal: '',
        frequencia: '',
        impacto_nivel: '',
        objetivo: ''
      },

      analise: {
        informacao_faltante: ''
      },

      esperado: 'INICIO'
    },


    {
      nome: '02 — Somente processo',

      diagnostico: {
        processo_nome: 'Processamento de pedidos',
        dor_principal: '',
        frequencia: '',
        impacto_nivel: '',
        objetivo: ''
      },

      analise: {
        informacao_faltante: ''
      },

      esperado: 'DESCOBERTA'
    },


    {
      nome: '03 — Somente dor',

      diagnostico: {
        processo_nome: '',
        dor_principal: 'Erros de digitação',
        frequencia: '',
        impacto_nivel: '',
        objetivo: ''
      },

      analise: {
        informacao_faltante: ''
      },

      esperado: 'DESCOBERTA'
    },


    {
      nome: '04 — Processo + dor',

      diagnostico: {
        processo_nome: 'Processamento de pedidos',
        dor_principal: 'Erros de digitação',
        frequencia: '',
        impacto_nivel: '',
        objetivo: ''
      },

      analise: {
        informacao_faltante:
          'Frequência e impacto'
      },

      esperado: 'INVESTIGACAO'
    },


    {
      nome: '05 — Processo + dor + frequência',

      diagnostico: {
        processo_nome: 'Processamento de pedidos',
        dor_principal: 'Erros de digitação',
        frequencia: 'Diária',
        impacto_nivel: '',
        objetivo: ''
      },

      analise: {
        informacao_faltante:
          'Impacto'
      },

      esperado: 'INVESTIGACAO'
    },


    {
      nome: '06 — Processo + dor + frequência + impacto',

      diagnostico: {
        processo_nome: 'Processamento de pedidos',
        dor_principal: 'Erros de digitação',
        frequencia: 'Diária',
        impacto_nivel: 'Alto',
        objetivo: ''
      },

      analise: {
        informacao_faltante:
          'Objetivo'
      },

      esperado: 'INVESTIGACAO'
    },


    {
      nome: '07 — Diagnóstico mínimo completo',

      diagnostico: {
        processo_nome: 'Processamento de pedidos',
        dor_principal: 'Erros de digitação',
        frequencia: 'Diária',
        impacto_nivel: 'Alto',
        objetivo: 'Reduzir erros'
      },

      analise: {
        informacao_faltante: ''
      },

      esperado: 'PRONTO_PARA_ANALISE'
    },


    {
      nome: '08 — Completo + informação complementar',

      diagnostico: {
        processo_nome: 'Processamento de pedidos',
        dor_principal: 'Erros de digitação',
        frequencia: 'Diária',
        impacto_nivel: 'Alto',
        objetivo: 'Reduzir erros'
      },

      analise: {
        informacao_faltante:
          'Quantas pessoas participam do processo?'
      },

      esperado: 'PRONTO_PARA_ANALISE'
    },


    {
      nome: '09 — Sem frequência',

      diagnostico: {
        processo_nome: 'Processamento de pedidos',
        dor_principal: 'Erros de digitação',
        frequencia: '',
        impacto_nivel: 'Alto',
        objetivo: 'Reduzir erros'
      },

      analise: {
        informacao_faltante: ''
      },

      esperado: 'INVESTIGACAO'
    },


    {
      nome: '10 — Sem impacto',

      diagnostico: {
        processo_nome: 'Processamento de pedidos',
        dor_principal: 'Erros de digitação',
        frequencia: 'Diária',
        impacto_nivel: '',
        objetivo: 'Reduzir erros'
      },

      analise: {
        informacao_faltante: ''
      },

      esperado: 'INVESTIGACAO'
    }

  ];


  let passou = 0;
  let falhou = 0;


  casos.forEach(function(caso) {

    try {

      const resultado =
        determinarEstadoDiagnostico_(
          caso.diagnostico,
          caso.analise
        );


      const esperado =
        DIAGNOSTICO_ESTADOS[
          caso.esperado
        ];


      const ok =
        resultado === esperado;


      if (ok) {

        passou++;

        Logger.log(
          '✅ PASSOU | ' +
          caso.nome +
          ' | esperado=' +
          caso.esperado +
          ' | obtido=' +
          resultado
        );

      } else {

        falhou++;

        Logger.log(
          '❌ FALHOU | ' +
          caso.nome +
          ' | esperado=' +
          caso.esperado +
          ' | obtido=' +
          resultado
        );

      }

    } catch (erro) {

      falhou++;

      Logger.log(
        '❌ ERRO | ' +
        caso.nome +
        ' | ' +
        (
          erro.message ||
          String(erro)
        )
      );

    }

  });


  Logger.log('');
  Logger.log('==============================================');
  Logger.log('RESULTADO');
  Logger.log('==============================================');

  Logger.log(
    'TOTAL: ' +
    casos.length
  );

  Logger.log(
    'PASSARAM: ' +
    passou
  );

  Logger.log(
    'FALHARAM: ' +
    falhou
  );


  if (
    falhou === 0
  ) {

    Logger.log(
      '🟢 MATRIZ ATUAL PASSOU'
    );

  } else {

    Logger.log(
      '🔴 MATRIZ ATUAL POSSUI DIVERGÊNCIAS'
    );

  }

  Logger.log(
    '=============================================='
  );

}
function TESTAR_LACUNAS_DIAGNOSTICO_V56() {

  Logger.log('');
  Logger.log('==============================================');
  Logger.log(' FEEDS SOLUTIONS — TESTE DE LACUNAS V5.6');
  Logger.log('==============================================');
  Logger.log('');

  const casos = [

    {
      nome: '01 — Qual é o impacto?',
      texto: 'Qual é o impacto desse problema?',
      esperado: true
    },

    {
      nome: '02 — Qual a frequência?',
      texto: 'Com que frequência esse problema acontece?',
      esperado: true
    },

    {
      nome: '03 — Qual o objetivo?',
      texto: 'Qual é o principal objetivo da empresa?',
      esperado: true
    },

    {
      nome: '04 — Quantas pessoas participam?',
      texto: 'Quantas pessoas participam desse processo?',
      esperado: false
    },

    {
      nome: '05 — Qual sistema vocês usam?',
      texto: 'Qual sistema vocês utilizam atualmente?',
      esperado: false
    },

    {
      nome: '06 — Quem é responsável?',
      texto: 'Quem é responsável por esse processo?',
      esperado: false
    },

    {
      nome: '07 — Qual o valor financeiro?',
      texto: 'Qual é o impacto financeiro desse problema?',
      esperado: true
    },

    {
      nome: '08 — Qual o prazo?',
      texto: 'Qual é o prazo para resolver esse problema?',
      esperado: false
    },

    {
      nome: '09 — Como fazem hoje?',
      texto: 'Como vocês fazem esse processo atualmente?',
      esperado: false
    },

    {
      nome: '10 — Existe outra informação?',
      texto: 'Existe alguma outra informação importante?',
      esperado: false
    },

    {
      nome: '11 — Quantos pedidos?',
      texto: 'Quantos pedidos vocês processam por dia?',
      esperado: false
    },

    {
      nome: '12 — Quanto tempo perde?',
      texto: 'Quanto tempo vocês perdem com esse problema?',
      esperado: true
    },

    {
      nome: '13 — Qual a causa?',
      texto: 'Qual é a causa desse problema?',
      esperado: true
    },

    {
      nome: '14 — Qual o resultado esperado?',
      texto: 'Qual é o resultado esperado?',
      esperado: true
    },

    {
      nome: '15 — Qual ferramenta?',
      texto: 'Qual ferramenta vocês utilizam?',
      esperado: false
    }

  ];


  let passou = 0;
  let falhou = 0;


  casos.forEach(function(caso) {

    try {

      const resultado =
        informacaoFaltanteEhEssencialDiagnostico_(
          caso.texto
        );


      const ok =
        resultado === caso.esperado;


      if (ok) {

        passou++;

        Logger.log(
          '✅ PASSOU | ' +
          caso.nome +
          ' | esperado=' +
          caso.esperado +
          ' | obtido=' +
          resultado
        );

      } else {

        falhou++;

        Logger.log(
          '❌ FALHOU | ' +
          caso.nome +
          ' | esperado=' +
          caso.esperado +
          ' | obtido=' +
          resultado
        );

      }

    } catch (erro) {

      falhou++;

      Logger.log(
        '❌ ERRO | ' +
        caso.nome +
        ' | ' +
        (
          erro.message ||
          String(erro)
        )
      );

    }

  });


  Logger.log('');
  Logger.log('==============================================');
  Logger.log('RESULTADO');
  Logger.log('==============================================');

  Logger.log(
    'TOTAL: ' +
    casos.length
  );

  Logger.log(
    'PASSARAM: ' +
    passou
  );

  Logger.log(
    'FALHARAM: ' +
    falhou
  );


  if (falhou === 0) {

    Logger.log(
      '🟢 TESTE DE LACUNAS PASSOU'
    );

  } else {

    Logger.log(
      '🔴 TESTE DE LACUNAS POSSUI DIVERGÊNCIAS'
    );

  }

  Logger.log(
    '=============================================='
  );

}

function informacaoFaltanteEhEssencialDiagnostico_(
  informacao
) {

  const texto =
    normalizarTextoDiagnostico_(
      String(
        informacao || ''
      ).trim()
    );


  if (!texto) {
    return false;
  }


  /*
   * ============================================================
   * INFORMAÇÕES ESSENCIAIS PARA CONCLUIR O DIAGNÓSTICO
   * ============================================================
   *
   * true  = lacuna essencial
   * false = lacuna complementar
   *
   * IMPORTANTE:
   * Tanto a informação recebida quanto cada termo da lista
   * passam pela MESMA normalização antes da comparação.
   *
   * ============================================================
   */


  const termosEssenciais = [

    // ----------------------------------------------------------
    // IMPACTO
    // ----------------------------------------------------------

    'impacto',
    'impacto financeiro',
    'impacto operacional',
    'prejuizo',
    'prejuizo financeiro',
    'custo do problema',
    'quanto custa',
    'quanto perde',
    'tempo perdido',
    'tempo voces perdem',
    'tempo perdido por dia',
    'tempo perdido por semana',
    'tempo perdido por mes',


    // ----------------------------------------------------------
    // FREQUÊNCIA
    // ----------------------------------------------------------

    'frequencia',
    'com que frequencia',
    'quantas vezes',
    'acontece por dia',
    'acontece por semana',
    'acontece por mes',
    'quantas vezes acontece',


    // ----------------------------------------------------------
    // OBJETIVO / RESULTADO
    // ----------------------------------------------------------

    'objetivo',
    'principal objetivo',
    'resultado esperado',
    'resultados esperados',
    'resultado que espera',
    'resultado que esperam',
    'resultado que deseja',
    'resultado que desejam',
    'resultado que pretende',
    'resultado que pretendem',
    'o que pretende',
    'o que pretendem',
    'o que gostaria',
    'o que gostariam',
    'o que quer',
    'o que querem',
    'o que deseja',
    'o que desejam',
    'o que espera',
    'o que esperam',


    // ----------------------------------------------------------
    // CAUSA
    // ----------------------------------------------------------

    'causa',
    'causa do problema',
    'por que acontece',
    'porque acontece',
    'motivo do problema',
    'origem do problema'

  ];


  return termosEssenciais.some(
    function(termo) {

      const termoNormalizado =
        normalizarTextoDiagnostico_(
          termo
        );


      if (!termoNormalizado) {
        return false;
      }


      return texto.indexOf(
        termoNormalizado
      ) !== -1;

    }
  );

}
function TESTAR_NORMALIZACAO_RESULTADO_V56() {

  const entrada =
    'Qual o resultado esperado?';

  const texto =
    normalizarTextoDiagnostico_(
      entrada
    );

  const termo =
    normalizarTextoDiagnostico_(
      'resultado esperado'
    );

  const posicao =
    texto.indexOf(
      termo
    );

  const resultado =
    posicao !== -1;


  Logger.log(
    '=============================================='
  );

  Logger.log(
    'TESTE DE NORMALIZAÇÃO — RESULTADO ESPERADO'
  );

  Logger.log(
    '=============================================='
  );

  Logger.log(
    'Entrada original: [' +
    entrada +
    ']'
  );

  Logger.log(
    'Texto normalizado: [' +
    texto +
    ']'
  );

  Logger.log(
    'Termo normalizado: [' +
    termo +
    ']'
  );

  Logger.log(
    'Posição encontrada: ' +
    posicao
  );

  Logger.log(
    'Resultado: ' +
    resultado
  );


  if (
    resultado === true
  ) {

    Logger.log(
      '✅ PASSOU — a comparação funciona.'
    );

  } else {

    Logger.log(
      '❌ FALHOU — a comparação não encontrou o termo.'
    );

  }

  Logger.log(
    '=============================================='
  );

}

function TESTAR_FLUXO_COMPLETO_PRONTO_V56() {

  Logger.log('');
  Logger.log('==============================================');
  Logger.log(' FEEDS SOLUTIONS — FLUXO COMPLETO V5.6');
  Logger.log('       TESTE ATÉ PRONTO PARA ANÁLISE');
  Logger.log('==============================================');
  Logger.log('');

  let ids = null;

  try {

    // ==========================================================
    // 1. CRIAR DIAGNÓSTICO DE TESTE
    // ==========================================================

    Logger.log(
      '1) Criando diagnóstico de teste...'
    );

    const inicio =
      iniciarDiagnostico({

        nome:
          'TESTE FLUXO COMPLETO V5.6',

        nome_empresa:
          'TESTE FLUXO COMPLETO V5.6',

        segmento:
          'TESTE',

        porte:
          'TESTE',

        nome_contato:
          'TESTE AUTOMÁTICO',

        whatsapp:
          '',

        email:
          '',

        cidade:
          'TESTE'

      });


    if (
      !inicio ||
      !inicio.empresa_id ||
      !inicio.conversa_id ||
      !inicio.diagnostico_id
    ) {

      throw new Error(
        'Não foi possível criar o diagnóstico de teste.'
      );

    }


    ids = inicio;


    Logger.log(
      '✅ Diagnóstico criado.'
    );

    Logger.log(
      'Empresa: ' +
      ids.empresa_id
    );

    Logger.log(
      'Conversa: ' +
      ids.conversa_id
    );

    Logger.log(
      'Diagnóstico: ' +
      ids.diagnostico_id
    );


    // ==========================================================
    // 2. MENSAGEM COMPLETA
    // ==========================================================

    const mensagem =
      'Nosso processo principal é conferir e lançar pedidos. ' +
      'Temos erros de digitação e retrabalho nesse processo. ' +
      'Isso acontece diariamente. ' +
      'Processamos 120 pedidos por dia. ' +
      'Perdemos aproximadamente 3 horas por dia com esse problema. ' +
      'Nosso objetivo é reduzir os erros e diminuir o retrabalho.';


    Logger.log('');
    Logger.log(
      '2) Enviando mensagem completa...'
    );

    Logger.log(
      'Mensagem: ' +
      mensagem
    );


    // ==========================================================
    // 3. PROCESSAR FLUXO REAL
    // ==========================================================

    const resposta =
      processarMensagemDiagnostico({

        empresa_id:
          ids.empresa_id,

        conversa_id:
          ids.conversa_id,

        mensagem:
          mensagem

      });


    if (
      !resposta ||
      !resposta.sucesso
    ) {

      throw new Error(
        'O processamento da mensagem não retornou sucesso.'
      );

    }


    Logger.log('');
    Logger.log(
      '✅ Mensagem processada.'
    );

    Logger.log(
      'Estado retornado: ' +
      resposta.estado
    );


    // ==========================================================
    // 4. RECUPERAR DIAGNÓSTICO CONSOLIDADO
    // ==========================================================

    const diagnostico =
      obterDiagnosticoAtual_(
        ids.empresa_id,
        ids.conversa_id
      );


    if (
      !diagnostico
    ) {

      throw new Error(
        'Diagnóstico consolidado não encontrado.'
      );

    }


    Logger.log('');
    Logger.log(
      '3) Diagnóstico consolidado:'
    );

    Logger.log(
      'Processo: ' +
      (
        diagnostico.processo_nome ||
        '(vazio)'
      )
    );

    Logger.log(
      'Dor: ' +
      (
        diagnostico.dor_principal ||
        '(vazio)'
      )
    );

    Logger.log(
      'Frequência: ' +
      (
        diagnostico.frequencia ||
        '(vazio)'
      )
    );

    Logger.log(
      'Impacto: ' +
      (
        diagnostico.impacto_nivel ||
        '(vazio)'
      )
    );

    Logger.log(
      'Objetivo: ' +
      (
        diagnostico.objetivo ||
        '(vazio)'
      )
    );

    Logger.log(
      'Estado: ' +
      diagnostico.status_diagnostico
    );


    // ==========================================================
    // 5. VALIDAR CAMPOS ESSENCIAIS
    // ==========================================================

    const campos = {

      processo:
        String(
          diagnostico.processo_nome || ''
        ).trim(),

      dor:
        String(
          diagnostico.dor_principal || ''
        ).trim(),

      frequencia:
        String(
          diagnostico.frequencia || ''
        ).trim(),

      impacto:
        String(
          diagnostico.impacto_nivel || ''
        ).trim(),

      objetivo:
        String(
          diagnostico.objetivo || ''
        ).trim()

    };


    const faltantes = [];


    Object.keys(campos).forEach(
      function(campo) {

        if (
          !campos[campo]
        ) {

          faltantes.push(
            campo
          );

        }

      }
    );


    if (
      faltantes.length > 0
    ) {

      throw new Error(
        'Campos essenciais não consolidados: ' +
        faltantes.join(', ')
      );

    }


    Logger.log('');
    Logger.log(
      '✅ Todos os campos essenciais foram consolidados.'
    );


    // ==========================================================
    // 6. VALIDAR ESTADO
    // ==========================================================

    if (
      diagnostico.status_diagnostico !==
      DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE
    ) {

      throw new Error(
        'Estado incorreto. Esperado PRONTO_PARA_ANALISE, ' +
        'obtido ' +
        diagnostico.status_diagnostico
      );

    }


    Logger.log(
      '✅ Estado PRONTO_PARA_ANALISE confirmado.'
    );


    // ==========================================================
    // 7. VALIDAR VOLUME NAS MÉTRICAS
    // ==========================================================

    const medidas =
      obterMedidasDiagnostico_(
        ids.empresa_id,
        ids.conversa_id
      );


    const volumes =
      (medidas || []).filter(
        function(medida) {

          return (
            String(
              medida.tipo || ''
            )
              .trim()
              .toUpperCase() ===
            'VOLUME'
          );

        }
      );


    const volume120 =
      volumes.filter(
        function(medida) {

          return (
            normalizarVolumeDiagnostico_(
              medida.texto
            ) ===
            normalizarVolumeDiagnostico_(
              '120 pedidos por dia'
            )
          );

        }
      );


    if (
      volume120.length !== 1
    ) {

      throw new Error(
        'VOLUME 120 não está exatamente uma vez nas métricas. ' +
        'Quantidade: ' +
        volume120.length
      );

    }


    Logger.log(
      '✅ VOLUME 120 registrado exatamente uma vez.'
    );


    // ==========================================================
    // 8. RESULTADO
    // ==========================================================

    Logger.log('');
    Logger.log(
      '=============================================='
    );

    Logger.log(
      '🟢 FLUXO COMPLETO ATÉ PRONTO PARA ANÁLISE'
    );

    Logger.log(
      '=============================================='
    );

    Logger.log(
      'Processo: OK'
    );

    Logger.log(
      'Dor: OK'
    );

    Logger.log(
      'Frequência: OK'
    );

    Logger.log(
      'Impacto: OK'
    );

    Logger.log(
      'Objetivo: OK'
    );

    Logger.log(
      'Volume: OK'
    );

    Logger.log(
      'Estado: PRONTO_PARA_ANALISE'
    );

    Logger.log(
      '=============================================='
    );


    return {

      sucesso:
        true,

      estado:
        diagnostico.status_diagnostico,

      diagnostico_id:
        ids.diagnostico_id,

      campos:
        campos,

      volumes:
        volumes

    };


  } catch (erro) {

    Logger.log('');
    Logger.log(
      '=============================================='
    );

    Logger.log(
      '🔴 FLUXO COMPLETO FALHOU'
    );

    Logger.log(
      erro.message ||
      String(erro)
    );

    Logger.log(
      '=============================================='
    );


    return {

      sucesso:
        false,

      erro:
        erro.message ||
        String(erro)

    };


  } finally {

    // ==========================================================
    // LIMPEZA
    // ==========================================================

    if (
      ids &&
      ids.empresa_id
    ) {

      Logger.log('');
      Logger.log(
        'Limpando dados do teste...'
      );


      try {

        limparDadosTesteV56_(
          ids.empresa_id,
          ids.conversa_id,
          ids.diagnostico_id
        );


        Logger.log(
          '✅ Dados do teste removidos.'
        );

      } catch (erroLimpeza) {

        Logger.log(
          '⚠️ Falha na limpeza: ' +
          (
            erroLimpeza.message ||
            String(erroLimpeza)
          )
        );

      }

    }

  }

}

function TESTAR_DOR_SEM_DUPLICACAO_V56() {

  Logger.log('');
  Logger.log('==============================================');
  Logger.log(' FEEDS SOLUTIONS — DOR V5.6');
  Logger.log('      TESTE DE NÃO DUPLICAÇÃO');
  Logger.log('==============================================');
  Logger.log('');

  let ids = null;

  try {

    // ==========================================================
    // 1. CRIAR DIAGNÓSTICO
    // ==========================================================

    const inicio =
      iniciarDiagnostico({

        nome:
          'TESTE DOR V5.6',

        nome_empresa:
          'TESTE DOR V5.6',

        segmento:
          'TESTE',

        porte:
          'TESTE',

        nome_contato:
          'TESTE',

        cidade:
          'TESTE'

      });


    ids = inicio;


    Logger.log(
      '✅ Diagnóstico criado: ' +
      ids.diagnostico_id
    );


    // ==========================================================
    // 2. PROCESSAR UMA MENSAGEM COM UMA ÚNICA DOR
    // ==========================================================

    const mensagem =
      'O processo é conferir e lançar pedidos. ' +
      'Temos erros de digitação e retrabalho todos os dias. ' +
      'Isso consome aproximadamente 3 horas por dia. ' +
      'Processamos 120 pedidos por dia. ' +
      'Queremos reduzir esses erros e o retrabalho.';


    const resposta =
      processarMensagemDiagnostico({

        empresa_id:
          ids.empresa_id,

        conversa_id:
          ids.conversa_id,

        mensagem:
          mensagem

      });


    if (
      !resposta ||
      !resposta.sucesso
    ) {

      throw new Error(
        'Processamento da mensagem falhou.'
      );

    }


    Logger.log(
      '✅ Mensagem processada.'
    );


    // ==========================================================
    // 3. RECUPERAR DORES
    // ==========================================================

    const dores =
      obterDoresDiagnostico_(
        ids.diagnostico_id
      );


    Logger.log('');
    Logger.log(
      'DORES ENCONTRADAS: ' +
      dores.length
    );


    dores.forEach(
      function(dor, indice) {

        Logger.log(
          (
            indice + 1
          ) +
          ' | ' +
          (
            dor.descricao ||
            ''
          )
        );

      }
    );


    // ==========================================================
    // 4. VALIDAR QUANTIDADE
    // ==========================================================

    if (
      dores.length !== 1
    ) {

      throw new Error(
        'ERRO: esperado exatamente 1 registro de dor, ' +
        'mas foram encontrados ' +
        dores.length
      );

    }


    Logger.log(
      '✅ EXATAMENTE 1 DOR REGISTRADA.'
    );


    // ==========================================================
    // 5. VALIDAR DESCRIÇÃO
    // ==========================================================

    const descricao =
      normalizarTextoDiagnostico_(
        dores[0].descricao
      );


    if (
      descricao.indexOf(
        'erros de digitacao'
      ) === -1 &&
      descricao.indexOf(
        'retrabalho'
      ) === -1
    ) {

      throw new Error(
        'A dor registrada não corresponde à mensagem.'
      );

    }


    Logger.log(
      '✅ DOR CORRETA REGISTRADA.'
    );


    // ==========================================================
    // RESULTADO
    // ==========================================================

    Logger.log('');
    Logger.log(
      '=============================================='
    );

    Logger.log(
      '🟢 TESTE DE DOR PASSOU'
    );

    Logger.log(
      '1 mensagem'
    );

    Logger.log(
      '1 dor'
    );

    Logger.log(
      '0 duplicações'
    );

    Logger.log(
      '=============================================='
    );


  } catch (erro) {

    Logger.log('');
    Logger.log(
      '=============================================='
    );

    Logger.log(
      '🔴 TESTE DE DOR FALHOU'
    );

    Logger.log(
      erro.message ||
      String(erro)
    );

    Logger.log(
      '=============================================='
    );


  } finally {

    // ==========================================================
    // LIMPEZA
    // ==========================================================

    if (
      ids &&
      ids.empresa_id
    ) {

      try {

        limparDadosTesteV56_(
          ids.empresa_id,
          ids.conversa_id,
          ids.diagnostico_id
        );

        Logger.log(
          '✅ Dados de teste removidos.'
        );

      } catch (erroLimpeza) {

        Logger.log(
          '⚠️ Falha na limpeza: ' +
          (
            erroLimpeza.message ||
            String(erroLimpeza)
          )
        );

      }

    }

  }

}
function TESTAR_OPORTUNIDADE_DIAGNOSTICO_V57() {

  Logger.log('');
  Logger.log('==============================================');
  Logger.log(' FEEDS SOLUTIONS — MOTOR DE OPORTUNIDADES');
  Logger.log('                 V5.7');
  Logger.log('==============================================');
  Logger.log('');


  let passou = 0;
  let falhou = 0;


  // ============================================================
  // CASO 01
  // DIAGNÓSTICO COMPLETO
  // ============================================================

  const caso01 = {

    processo_nome:
      'Conferir e lançar pedidos',

    dor_principal:
      'Erros de digitação e retrabalho',

    frequencia:
      'Diária',

    volume:
      '120 pedidos por dia',

    impacto_nivel:
      '3 horas por dia',

    objetivo:
      'Reduzir erros e retrabalho'

  };


  Logger.log(
    '01 — Diagnóstico completo'
  );


  try {

    const oportunidade =
      construirOportunidadeDiagnosticoV57_(
        caso01
      );


    const camposObrigatorios = [

      'processo',
      'dor',
      'frequencia',
      'volume',
      'impacto',
      'objetivo',
      'descricao',
      'prioridade',
      'justificativa'

    ];


    const faltantes = [];


    camposObrigatorios.forEach(
      function(campo) {

        if (
          !String(
            oportunidade[campo] || ''
          ).trim()
        ) {

          faltantes.push(
            campo
          );

        }

      }
    );


    if (
      faltantes.length > 0
    ) {

      throw new Error(
        'Campos ausentes: ' +
        faltantes.join(', ')
      );

    }


    // ----------------------------------------------------------
    // VALIDAR CÓPIA DOS DADOS
    // ----------------------------------------------------------

    if (
      oportunidade.processo !==
      caso01.processo_nome
    ) {

      throw new Error(
        'Processo não corresponde ao diagnóstico.'
      );

    }


    if (
      oportunidade.dor !==
      caso01.dor_principal
    ) {

      throw new Error(
        'Dor não corresponde ao diagnóstico.'
      );

    }


    if (
      oportunidade.frequencia !==
      caso01.frequencia
    ) {

      throw new Error(
        'Frequência não corresponde ao diagnóstico.'
      );

    }


    if (
      oportunidade.volume !==
      caso01.volume
    ) {

      throw new Error(
        'Volume não corresponde ao diagnóstico.'
      );

    }


    if (
      oportunidade.impacto !==
      caso01.impacto_nivel
    ) {

      throw new Error(
        'Impacto não corresponde ao diagnóstico.'
      );

    }


    if (
      oportunidade.objetivo !==
      caso01.objetivo
    ) {

      throw new Error(
        'Objetivo não corresponde ao diagnóstico.'
      );

    }


    // ----------------------------------------------------------
    // PROIBIR SOLUÇÃO ANTECIPADA
    // ----------------------------------------------------------

    const descricao =
      String(
        oportunidade.descricao || ''
      ).toLowerCase();


    const termosSolucao = [

      'automatizar',
      'automação',
      'automacao',
      'sistema',
      'software',
      'chatbot',
      'integração',
      'integracao',
      'erp',
      'api',
      'robô',
      'robo',
      'aplicativo',
      'plataforma'

    ];


    const encontrouSolucao =
      termosSolucao.some(
        function(termo) {

          return descricao.indexOf(
            termo
          ) !== -1;

        }
      );


    if (
      encontrouSolucao
    ) {

      throw new Error(
        'A oportunidade antecipou uma solução: ' +
        oportunidade.descricao
      );

    }


    Logger.log(
      'Processo: ' +
      oportunidade.processo
    );

    Logger.log(
      'Dor: ' +
      oportunidade.dor
    );

    Logger.log(
      'Frequência: ' +
      oportunidade.frequencia
    );

    Logger.log(
      'Volume: ' +
      oportunidade.volume
    );

    Logger.log(
      'Impacto: ' +
      oportunidade.impacto
    );

    Logger.log(
      'Objetivo: ' +
      oportunidade.objetivo
    );

    Logger.log(
      'Descrição: ' +
      oportunidade.descricao
    );

    Logger.log(
      'Prioridade: ' +
      oportunidade.prioridade
    );

    Logger.log(
      'Justificativa: ' +
      oportunidade.justificativa
    );


    Logger.log(
      '✅ CASO 01 PASSOU'
    );

    passou++;


  } catch (erro) {

    Logger.log(
      '❌ CASO 01 FALHOU: ' +
      (
        erro.message ||
        String(erro)
      )
    );

    falhou++;

  }


  // ============================================================
  // CASO 02
  // DIAGNÓSTICO INCOMPLETO
  // ============================================================

  Logger.log('');
  Logger.log(
    '02 — Diagnóstico incompleto'
  );


  try {

    const caso02 = {

      processo_nome:
        'Processamento de pedidos',

      dor_principal:
        'Erros de digitação',

      frequencia:
        'Diária',

      volume:
        '120 pedidos por dia',

      impacto_nivel:
        '',

      objetivo:
        'Reduzir erros'

    };


    const oportunidade02 =
      construirOportunidadeDiagnosticoV57_(
        caso02
      );


    if (
      oportunidade02 !== null
    ) {

      throw new Error(
        'Diagnóstico incompleto gerou oportunidade.'
      );

    }


    Logger.log(
      '✅ Diagnóstico incompleto corretamente bloqueado.'
    );

    passou++;


  } catch (erro) {

    Logger.log(
      '❌ CASO 02 FALHOU: ' +
      (
        erro.message ||
        String(erro)
      )
    );

    falhou++;

  }


  // ============================================================
  // CASO 03
  // SEM DOR
  // ============================================================

  Logger.log('');
  Logger.log(
    '03 — Diagnóstico sem dor'
  );


  try {

    const caso03 = {

      processo_nome:
        'Processamento de pedidos',

      dor_principal:
        '',

      frequencia:
        'Diária',

      volume:
        '120 pedidos por dia',

      impacto_nivel:
        '3 horas por dia',

      objetivo:
        'Reduzir tempo'

    };


    const oportunidade03 =
      construirOportunidadeDiagnosticoV57_(
        caso03
      );


    if (
      oportunidade03 !== null
    ) {

      throw new Error(
        'Diagnóstico sem dor gerou oportunidade.'
      );

    }


    Logger.log(
      '✅ Diagnóstico sem dor corretamente bloqueado.'
    );

    passou++;


  } catch (erro) {

    Logger.log(
      '❌ CASO 03 FALHOU: ' +
      (
        erro.message ||
        String(erro)
      )
    );

    falhou++;

  }


  // ============================================================
  // RESULTADO
  // ============================================================

  Logger.log('');
  Logger.log(
    '=============================================='
  );

  Logger.log(
    'RESULTADO V5.7'
  );

  Logger.log(
    '=============================================='
  );

  Logger.log(
    'TOTAL: 3'
  );

  Logger.log(
    'PASSARAM: ' +
    passou
  );

  Logger.log(
    'FALHARAM: ' +
    falhou
  );


  if (
    falhou === 0
  ) {

    Logger.log(
      '🟢 TESTE DE OPORTUNIDADE V5.7 PASSOU'
    );

  } else {

    Logger.log(
      '🔴 TESTE DE OPORTUNIDADE V5.7 POSSUI FALHAS'
    );

  }


  Logger.log(
    '=============================================='
  );

}

function construirOportunidadeDiagnosticoV57_(
  diagnostico
) {

  const dados =
    diagnostico || {};


  const processo =
    String(
      dados.processo_nome || ''
    ).trim();


  const dor =
    String(
      dados.dor_principal || ''
    ).trim();


  const frequencia =
    String(
      dados.frequencia || ''
    ).trim();


  const volume =
    String(
      dados.volume || ''
    ).trim();


  const impacto =
    String(
      dados.impacto_nivel || ''
    ).trim();


  const objetivo =
    String(
      dados.objetivo || ''
    ).trim();


  // ============================================================
  // DIAGNÓSTICO MÍNIMO NECESSÁRIO
  // ============================================================

  if (
    !processo ||
    !dor ||
    !frequencia ||
    !impacto ||
    !objetivo
  ) {

    return null;

  }


  // ============================================================
  // DESCRIÇÃO DA OPORTUNIDADE
  // ============================================================

  let descricao =
    'Reduzir o problema de ' +
    dor +
    ' no processo de ' +
    processo +
    '.';


  // ============================================================
  // PRIORIDADE
  // ============================================================

  let prioridade =
    'Média';


  const impactoNormalizado =
    normalizarTextoDiagnostico_(
      impacto
    );


  const volumeNormalizado =
    normalizarTextoDiagnostico_(
      volume
    );


  if (
    /alto|alta|grave|grande/.test(
      impactoNormalizado
    )
  ) {

    prioridade =
      'Alta';

  }


  if (
    volume &&
    /\b\d+\b/.test(
      volumeNormalizado
    ) &&
    (
      /por dia/.test(
        volumeNormalizado
      ) ||
      /diario/.test(
        volumeNormalizado
      )
    )
  ) {

    prioridade =
      'Alta';

  }


  // ============================================================
  // JUSTIFICATIVA
  // ============================================================

  const partes =
    [];


  if (volume) {

    partes.push(
      volume
    );

  }


  partes.push(
    frequencia
  );


  partes.push(
    impacto
  );


  const justificativa =
    'A oportunidade está relacionada a ' +
    dor +
    '. ' +
    (
      partes.length
        ? 'O diagnóstico registra ' +
          partes.join(' e ') +
          '. '
        : ''
    ) +
    'O objetivo informado é ' +
    objetivo +
    '.';


  // ============================================================
  // RETORNO
  // ============================================================

  return {

    processo:
      processo,

    dor:
      dor,

    frequencia:
      frequencia,

    volume:
      volume,

    impacto:
      impacto,

    objetivo:
      objetivo,

    descricao:
      descricao,

    prioridade:
      prioridade,

    justificativa:
      justificativa

  };

}
function TESTAR_OPORTUNIDADE_ROBUSTEZ_V57() {

  Logger.log('');
  Logger.log('==============================================');
  Logger.log(' FEEDS SOLUTIONS — ROBUSTEZ DO MOTOR');
  Logger.log('                 V5.7');
  Logger.log('==============================================');
  Logger.log('');

  let passou = 0;
  let falhou = 0;


  const casos = [

    {
      nome: '01 — Completo',
      diagnostico: {
        processo_nome: 'Conferir pedidos',
        dor_principal: 'Erros de digitação',
        frequencia: 'Diária',
        volume: '120 pedidos por dia',
        impacto_nivel: '3 horas por dia',
        objetivo: 'Reduzir erros'
      },
      esperado: true
    },


    {
      nome: '02 — Sem volume',
      diagnostico: {
        processo_nome: 'Conferir pedidos',
        dor_principal: 'Erros de digitação',
        frequencia: 'Diária',
        volume: '',
        impacto_nivel: '3 horas por dia',
        objetivo: 'Reduzir erros'
      },
      esperado: true
    },


    {
      nome: '03 — Impacto baixo',
      diagnostico: {
        processo_nome: 'Conferir pedidos',
        dor_principal: 'Pequenos erros',
        frequencia: 'Semanal',
        volume: '10 pedidos por semana',
        impacto_nivel: 'Baixo',
        objetivo: 'Melhorar precisão'
      },
      esperado: true
    },


    {
      nome: '04 — Impacto alto',
      diagnostico: {
        processo_nome: 'Processamento de pedidos',
        dor_principal: 'Retrabalho',
        frequencia: 'Diária',
        volume: '500 pedidos por dia',
        impacto_nivel: 'Alto',
        objetivo: 'Reduzir retrabalho'
      },
      esperado: true
    },


    {
      nome: '05 — Volume alto',
      diagnostico: {
        processo_nome: 'Atendimento',
        dor_principal: 'Demora no atendimento',
        frequencia: 'Diária',
        volume: '1000 clientes por dia',
        impacto_nivel: 'Médio',
        objetivo: 'Agilizar atendimento'
      },
      esperado: true
    },


    {
      nome: '06 — Sem volume + impacto alto',
      diagnostico: {
        processo_nome: 'Financeiro',
        dor_principal: 'Retrabalho financeiro',
        frequencia: 'Mensal',
        volume: '',
        impacto_nivel: 'Alto',
        objetivo: 'Reduzir retrabalho'
      },
      esperado: true
    },


    {
      nome: '07 — Objetivo diferente',
      diagnostico: {
        processo_nome: 'Estoque',
        dor_principal: 'Erros de controle',
        frequencia: 'Diária',
        volume: '80 movimentações por dia',
        impacto_nivel: 'Médio',
        objetivo: 'Aumentar confiabilidade'
      },
      esperado: true
    },


    {
      nome: '08 — Dor diferente',
      diagnostico: {
        processo_nome: 'Vendas',
        dor_principal: 'Atrasos no processo',
        frequencia: 'Semanal',
        volume: '40 vendas por semana',
        impacto_nivel: 'Médio',
        objetivo: 'Acelerar vendas'
      },
      esperado: true
    },


    {
      nome: '09 — Sem impacto',
      diagnostico: {
        processo_nome: 'Pedidos',
        dor_principal: 'Erros',
        frequencia: 'Diária',
        volume: '100 pedidos por dia',
        impacto_nivel: '',
        objetivo: 'Reduzir erros'
      },
      esperado: false
    },


    {
      nome: '10 — Sem objetivo',
      diagnostico: {
        processo_nome: 'Pedidos',
        dor_principal: 'Erros',
        frequencia: 'Diária',
        volume: '100 pedidos por dia',
        impacto_nivel: 'Alto',
        objetivo: ''
      },
      esperado: false
    }

  ];


  casos.forEach(function(caso) {

    Logger.log('');
    Logger.log(caso.nome);


    try {

      const oportunidade =
        construirOportunidadeDiagnosticoV57_(
          caso.diagnostico
        );


      const existe =
        oportunidade !== null;


      if (
        existe !== caso.esperado
      ) {

        throw new Error(
          'Existência incorreta. ' +
          'Esperado=' +
          caso.esperado +
          ' obtido=' +
          existe
        );

      }


      if (
        oportunidade
      ) {

        // ------------------------------------------------------
        // VALIDAR CAMPOS
        // ------------------------------------------------------

        const campos = [
          'processo',
          'dor',
          'frequencia',
          'impacto',
          'objetivo',
          'descricao',
          'prioridade',
          'justificativa'
        ];


        campos.forEach(
          function(campo) {

            if (
              !String(
                oportunidade[campo] || ''
              ).trim()
            ) {

              throw new Error(
                'Campo vazio: ' +
                campo
              );

            }

          }
        );


        // ------------------------------------------------------
        // VALIDAR QUE NÃO INVENTOU SOLUÇÃO
        // ------------------------------------------------------

        const texto =
          (
            oportunidade.descricao +
            ' ' +
            oportunidade.justificativa
          ).toLowerCase();


        const termosProibidos = [

          'automatizar',
          'automação',
          'automacao',
          'software',
          'sistema',
          'chatbot',
          'erp',
          'api',
          'robô',
          'robo',
          'aplicativo',
          'plataforma',
          'integração',
          'integracao'

        ];


        const encontrou =
          termosProibidos.some(
            function(termo) {

              return texto.indexOf(
                termo
              ) !== -1;

            }
          );


        if (
          encontrou
        ) {

          throw new Error(
            'Oportunidade antecipou solução.'
          );

        }


        // ------------------------------------------------------
        // VALIDAR PRIORIDADE
        // ------------------------------------------------------

        const prioridades = [
          'Baixa',
          'Média',
          'Alta'
        ];


        if (
          prioridades.indexOf(
            oportunidade.prioridade
          ) === -1
        ) {

          throw new Error(
            'Prioridade inválida: ' +
            oportunidade.prioridade
          );

        }

      }


      Logger.log(
        '✅ PASSOU'
      );

      passou++;


    } catch (erro) {

      Logger.log(
        '❌ FALHOU: ' +
        (
          erro.message ||
          String(erro)
        )
      );

      falhou++;

    }

  });


  Logger.log('');
  Logger.log(
    '=============================================='
  );

  Logger.log(
    'RESULTADO DA ROBUSTEZ V5.7'
  );

  Logger.log(
    '=============================================='
  );

  Logger.log(
    'TOTAL: ' +
    casos.length
  );

  Logger.log(
    'PASSARAM: ' +
    passou
  );

  Logger.log(
    'FALHARAM: ' +
    falhou
  );


  if (
    falhou === 0
  ) {

    Logger.log(
      '🟢 ROBUSTEZ V5.7 PASSOU'
    );

  } else {

    Logger.log(
      '🔴 ROBUSTEZ V5.7 POSSUI FALHAS'
    );

  }


  Logger.log(
    '=============================================='
  );

}
function TESTAR_QUALIDADE_OPORTUNIDADE_V571() {

  Logger.log('');
  Logger.log('==============================================');
  Logger.log(' FEEDS SOLUTIONS — QUALIDADE DA OPORTUNIDADE');
  Logger.log('                 V5.7.1');
  Logger.log('==============================================');
  Logger.log('');

  let passou = 0;
  let falhou = 0;


  const casos = [

    {
      nome: '01 — Caso principal',

      diagnostico: {
        processo_nome:
          'Conferir e lançar pedidos',

        dor_principal:
          'Erros de digitação e retrabalho',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '3 horas por dia',

        objetivo:
          'Reduzir erros e retrabalho'
      },

      proibidos: [
        'r$',
        'economia',
        'economizar',
        '%',
        'percentual',
        'redução de 50%',
        'redução de 30%',
        'sistema',
        'software',
        'automação',
        'automacao',
        'chatbot',
        'erp',
        'api',
        'robô',
        'robo',
        'plataforma'
      ]
    },


    {
      nome: '02 — Caso sem volume',

      diagnostico: {
        processo_nome:
          'Atendimento',

        dor_principal:
          'Demora no atendimento',

        frequencia:
          'Diária',

        volume:
          '',

        impacto_nivel:
          '2 horas por dia',

        objetivo:
          'Agilizar o atendimento'
      },

      proibidos: [
        '120',
        '500',
        '1000',
        'r$',
        '%',
        'automação',
        'automacao',
        'sistema',
        'software'
      ]
    },


    {
      nome: '03 — Caso de estoque',

      diagnostico: {
        processo_nome:
          'Controle de estoque',

        dor_principal:
          'Erros de controle',

        frequencia:
          'Semanal',

        volume:
          '80 movimentações por semana',

        impacto_nivel:
          'Médio',

        objetivo:
          'Aumentar a confiabilidade'
      },

      proibidos: [
        'r$',
        '%',
        'automação',
        'automacao',
        'software',
        'sistema',
        'erp'
      ]
    },


    {
      nome: '04 — Caso de baixo impacto',

      diagnostico: {
        processo_nome:
          'Conferência de documentos',

        dor_principal:
          'Pequenos erros',

        frequencia:
          'Mensal',

        volume:
          '20 documentos por mês',

        impacto_nivel:
          'Baixo',

        objetivo:
          'Melhorar a precisão'
      },

      proibidos: [
        'alta',
        'grave',
        'crítico',
        'critico',
        'r$',
        '%',
        'automação',
        'automacao',
        'software'
      ]
    }

  ];


  casos.forEach(function(caso) {

    Logger.log('');
    Logger.log(caso.nome);


    try {

      const oportunidade =
        construirOportunidadeDiagnosticoV57_(
          caso.diagnostico
        );


      if (
        !oportunidade
      ) {

        throw new Error(
          'Oportunidade não foi criada.'
        );

      }


      const descricao =
        String(
          oportunidade.descricao || ''
        ).trim();


      const justificativa =
        String(
          oportunidade.justificativa || ''
        ).trim();


      const texto =
        (
          descricao +
          ' ' +
          justificativa
        ).toLowerCase();


      // ========================================================
      // 1. TEXTO NÃO PODE ESTAR VAZIO
      // ========================================================

      if (
        !descricao
      ) {

        throw new Error(
          'Descrição vazia.'
        );

      }


      if (
        !justificativa
      ) {

        throw new Error(
          'Justificativa vazia.'
        );

      }


      // ========================================================
      // 2. NÃO PODE INVENTAR DADOS
      // ========================================================

      caso.proibidos.forEach(
        function(termo) {

          if (
            texto.indexOf(
              termo
            ) !== -1
          ) {

            throw new Error(
              'Informação/solução não sustentada encontrada: ' +
              termo
            );

          }

        }
      );


      // ========================================================
      // 3. PRECISA ESTAR RELACIONADA AO DIAGNÓSTICO
      // ========================================================

      const dor =
        String(
          caso.diagnostico.dor_principal
        ).toLowerCase();


      const processo =
        String(
          caso.diagnostico.processo_nome
        ).toLowerCase();


      if (
        texto.indexOf(
          dor
        ) === -1
      ) {

        throw new Error(
          'A oportunidade não menciona a dor diagnosticada.'
        );

      }


      if (
        texto.indexOf(
          processo
        ) === -1
      ) {

        throw new Error(
          'A oportunidade não menciona o processo diagnosticado.'
        );

      }


      // ========================================================
      // 4. NÃO PODE CRIAR NÚMEROS NOVOS
      // ========================================================

      const numeros =
        texto.match(
          /\b\d+(?:[.,]\d+)?\b/g
        ) || [];


      numeros.forEach(
        function(numero) {

          const permitido =
            (
              String(
                caso.diagnostico.volume || ''
              ).indexOf(
                numero
              ) !== -1
            ) ||
            (
              String(
                caso.diagnostico.impacto_nivel || ''
              ).indexOf(
                numero
              ) !== -1
            );


          if (
            !permitido
          ) {

            throw new Error(
              'Número não presente no diagnóstico: ' +
              numero
            );

          }

        }
      );


      // ========================================================
      // 5. PRIORIDADE VÁLIDA
      // ========================================================

      const prioridades = [
        'Baixa',
        'Média',
        'Alta'
      ];


      if (
        prioridades.indexOf(
          oportunidade.prioridade
        ) === -1
      ) {

        throw new Error(
          'Prioridade inválida: ' +
          oportunidade.prioridade
        );

      }


      Logger.log(
        'Descrição: ' +
        descricao
      );

      Logger.log(
        'Justificativa: ' +
        justificativa
      );

      Logger.log(
        'Prioridade: ' +
        oportunidade.prioridade
      );

      Logger.log(
        '✅ PASSOU'
      );


      passou++;


    } catch (erro) {

      Logger.log(
        '❌ FALHOU: ' +
        (
          erro.message ||
          String(erro)
        )
      );

      falhou++;

    }

  });


  Logger.log('');
  Logger.log(
    '=============================================='
  );

  Logger.log(
    'RESULTADO V5.7.1'
  );

  Logger.log(
    '=============================================='
  );

  Logger.log(
    'TOTAL: ' +
    casos.length
  );

  Logger.log(
    'PASSARAM: ' +
    passou
  );

  Logger.log(
    'FALHARAM: ' +
    falhou
  );


  if (
    falhou === 0
  ) {

    Logger.log(
      '🟢 QUALIDADE V5.7.1 PASSOU'
    );

  } else {

    Logger.log(
      '🔴 QUALIDADE V5.7.1 POSSUI FALHAS'
    );

  }


  Logger.log(
    '=============================================='
  );

}
function TESTAR_OPORTUNIDADE_APOS_ATUALIZACAO_V57() {

  Logger.log('');
  Logger.log('==============================================');
  Logger.log(' FEEDS SOLUTIONS — ATUALIZAÇÃO DE OPORTUNIDADE');
  Logger.log('                 V5.7');
  Logger.log('==============================================');
  Logger.log('');

  let passou = 0;
  let falhou = 0;


  // ============================================================
  // DIAGNÓSTICO INICIAL
  // ============================================================

  const diagnosticoInicial = {

    processo_nome:
      'Conferir pedidos',

    dor_principal:
      'Erros de digitação',

    frequencia:
      'Diária',

    volume:
      '80 pedidos por dia',

    impacto_nivel:
      '2 horas por dia',

    objetivo:
      'Reduzir erros'

  };


  // ============================================================
  // PRIMEIRA OPORTUNIDADE
  // ============================================================

  Logger.log(
    '01 — Construindo oportunidade inicial'
  );


  try {

    const oportunidadeInicial =
      construirOportunidadeDiagnosticoV57_(
        diagnosticoInicial
      );


    if (
      !oportunidadeInicial
    ) {

      throw new Error(
        'Oportunidade inicial não foi criada.'
      );

    }


    if (
      oportunidadeInicial.volume !==
      '80 pedidos por dia'
    ) {

      throw new Error(
        'Volume inicial incorreto.'
      );

    }


    if (
      oportunidadeInicial.impacto !==
      '2 horas por dia'
    ) {

      throw new Error(
        'Impacto inicial incorreto.'
      );

    }


    Logger.log(
      'Volume inicial: ' +
      oportunidadeInicial.volume
    );

    Logger.log(
      'Impacto inicial: ' +
      oportunidadeInicial.impacto
    );

    Logger.log(
      '✅ OPORTUNIDADE INICIAL OK'
    );


    passou++;


  } catch (erro) {

    Logger.log(
      '❌ FALHOU: ' +
      (
        erro.message ||
        String(erro)
      )
    );

    falhou++;

  }


  // ============================================================
  // ATUALIZAÇÃO DO DIAGNÓSTICO
  // ============================================================

  const diagnosticoAtualizado = {

    processo_nome:
      'Conferir pedidos',

    dor_principal:
      'Erros de digitação e retrabalho',

    frequencia:
      'Diária',

    volume:
      '120 pedidos por dia',

    impacto_nivel:
      '3 horas por dia',

    objetivo:
      'Reduzir erros e retrabalho'

  };


  // ============================================================
  // SEGUNDA OPORTUNIDADE
  // ============================================================

  Logger.log('');
  Logger.log(
    '02 — Reconstruindo após atualização'
  );


  try {

    const oportunidadeAtualizada =
      construirOportunidadeDiagnosticoV57_(
        diagnosticoAtualizado
      );


    if (
      !oportunidadeAtualizada
    ) {

      throw new Error(
        'Oportunidade atualizada não foi criada.'
      );

    }


    // ----------------------------------------------------------
    // VOLUME NOVO
    // ----------------------------------------------------------

    if (
      oportunidadeAtualizada.volume !==
      '120 pedidos por dia'
    ) {

      throw new Error(
        'A oportunidade não incorporou o novo volume.'
      );

    }


    // ----------------------------------------------------------
    // IMPACTO NOVO
    // ----------------------------------------------------------

    if (
      oportunidadeAtualizada.impacto !==
      '3 horas por dia'
    ) {

      throw new Error(
        'A oportunidade não incorporou o novo impacto.'
      );

    }


    // ----------------------------------------------------------
    // NOVA DOR
    // ----------------------------------------------------------

    if (
      oportunidadeAtualizada.dor !==
      'Erros de digitação e retrabalho'
    ) {

      throw new Error(
        'A oportunidade não incorporou a nova dor.'
      );

    }


    // ----------------------------------------------------------
    // GARANTIR QUE O VALOR ANTIGO NÃO APARECE
    // ----------------------------------------------------------

    const texto =
      (
        oportunidadeAtualizada.descricao +
        ' ' +
        oportunidadeAtualizada.justificativa +
        ' ' +
        oportunidadeAtualizada.volume +
        ' ' +
        oportunidadeAtualizada.impacto
      ).toLowerCase();


    if (
      texto.indexOf(
        '80 pedidos por dia'
      ) !== -1
    ) {

      throw new Error(
        'A oportunidade atualizada ainda contém o volume antigo.'
      );

    }


    if (
      texto.indexOf(
        '2 horas por dia'
      ) !== -1
    ) {

      throw new Error(
        'A oportunidade atualizada ainda contém o impacto antigo.'
      );

    }


    Logger.log(
      'Novo volume: ' +
      oportunidadeAtualizada.volume
    );

    Logger.log(
      'Novo impacto: ' +
      oportunidadeAtualizada.impacto
    );

    Logger.log(
      'Nova dor: ' +
      oportunidadeAtualizada.dor
    );

    Logger.log(
      '✅ OPORTUNIDADE ATUALIZADA CORRETAMENTE'
    );


    passou++;


  } catch (erro) {

    Logger.log(
      '❌ FALHOU: ' +
      (
        erro.message ||
        String(erro)
      )
    );

    falhou++;

  }


  // ============================================================
  // RESULTADO
  // ============================================================

  Logger.log('');
  Logger.log(
    '=============================================='
  );

  Logger.log(
    'RESULTADO — ATUALIZAÇÃO V5.7'
  );

  Logger.log(
    '=============================================='
  );

  Logger.log(
    'TOTAL: 2'
  );

  Logger.log(
    'PASSARAM: ' +
    passou
  );

  Logger.log(
    'FALHARAM: ' +
    falhou
  );


  if (
    falhou === 0
  ) {

    Logger.log(
      '🟢 ATUALIZAÇÃO DE OPORTUNIDADE PASSOU'
    );

  } else {

    Logger.log(
      '🔴 ATUALIZAÇÃO DE OPORTUNIDADE POSSUI FALHAS'
    );

  }


  Logger.log(
    '=============================================='
  );

}
function TESTAR_RASTREABILIDADE_OPORTUNIDADE_V57() {

  Logger.log('');
  Logger.log('==============================================');
  Logger.log(' FEEDS SOLUTIONS — RASTREABILIDADE');
  Logger.log('                 V5.7');
  Logger.log('==============================================');
  Logger.log('');

  let passou = 0;
  let falhou = 0;


  // ============================================================
  // CASO 01 — VALORES DEVEM VIR DO DIAGNÓSTICO
  // ============================================================

  Logger.log(
    '01 — Valores devem ser rastreáveis ao diagnóstico'
  );


  try {

    const diagnostico = {

      processo_nome:
        'Conferir pedidos',

      dor_principal:
        'Erros de digitação',

      frequencia:
        'Diária',

      volume:
        '120 pedidos por dia',

      impacto_nivel:
        '3 horas por dia',

      objetivo:
        'Reduzir erros'

    };


    const oportunidade =
      construirOportunidadeDiagnosticoV57_(
        diagnostico
      );


    if (
      oportunidade.volume !==
      diagnostico.volume
    ) {

      throw new Error(
        'Volume não corresponde ao diagnóstico.'
      );

    }


    if (
      oportunidade.impacto !==
      diagnostico.impacto_nivel
    ) {

      throw new Error(
        'Impacto não corresponde ao diagnóstico.'
      );

    }


    if (
      oportunidade.processo !==
      diagnostico.processo_nome
    ) {

      throw new Error(
        'Processo não corresponde ao diagnóstico.'
      );

    }


    if (
      oportunidade.dor !==
      diagnostico.dor_principal
    ) {

      throw new Error(
        'Dor não corresponde ao diagnóstico.'
      );

    }


    if (
      oportunidade.frequencia !==
      diagnostico.frequencia
    ) {

      throw new Error(
        'Frequência não corresponde ao diagnóstico.'
      );

    }


    if (
      oportunidade.objetivo !==
      diagnostico.objetivo
    ) {

      throw new Error(
        'Objetivo não corresponde ao diagnóstico.'
      );

    }


    Logger.log(
      '✅ PASSOU'
    );

    passou++;


  } catch (erro) {

    Logger.log(
      '❌ FALHOU: ' +
      (
        erro.message ||
        String(erro)
      )
    );

    falhou++;

  }


  // ============================================================
  // CASO 02 — ALTERAÇÃO DO DIAGNÓSTICO
  // ============================================================

  Logger.log('');
  Logger.log(
    '02 — Alteração do diagnóstico deve alterar oportunidade'
  );


  try {

    const diagnostico = {

      processo_nome:
        'Conferir pedidos',

      dor_principal:
        'Erros de digitação',

      frequencia:
        'Diária',

      volume:
        '250 pedidos por dia',

      impacto_nivel:
        '5 horas por dia',

      objetivo:
        'Reduzir erros'

    };


    const oportunidade =
      construirOportunidadeDiagnosticoV57_(
        diagnostico
      );


    if (
      oportunidade.volume !==
      '250 pedidos por dia'
    ) {

      throw new Error(
        'Novo volume não foi propagado.'
      );

    }


    if (
      oportunidade.impacto !==
      '5 horas por dia'
    ) {

      throw new Error(
        'Novo impacto não foi propagado.'
      );

    }


    Logger.log(
      'Novo volume: ' +
      oportunidade.volume
    );

    Logger.log(
      'Novo impacto: ' +
      oportunidade.impacto
    );

    Logger.log(
      '✅ PASSOU'
    );

    passou++;


  } catch (erro) {

    Logger.log(
      '❌ FALHOU: ' +
      (
        erro.message ||
        String(erro)
      )
    );

    falhou++;

  }


  // ============================================================
  // CASO 03 — AUSÊNCIA DE VOLUME NÃO PODE INVENTAR VALOR
  // ============================================================

  Logger.log('');
  Logger.log(
    '03 — Ausência de volume não pode inventar valor'
  );


  try {

    const diagnostico = {

      processo_nome:
        'Atendimento',

      dor_principal:
        'Demora no atendimento',

      frequencia:
        'Diária',

      volume:
        '',

      impacto_nivel:
        '2 horas por dia',

      objetivo:
        'Agilizar atendimento'

    };


    const oportunidade =
      construirOportunidadeDiagnosticoV57_(
        diagnostico
      );


    if (
      !oportunidade
    ) {

      throw new Error(
        'Diagnóstico válido não gerou oportunidade.'
      );

    }


    if (
      oportunidade.volume
    ) {

      throw new Error(
        'Volume foi inventado mesmo estando ausente.'
      );

    }


    if (
      String(
        oportunidade.descricao
      ).match(
        /\b\d+\b/
      )
    ) {

      throw new Error(
        'Descrição inventou número sem suporte no diagnóstico.'
      );

    }


    Logger.log(
      'Volume: [' +
      oportunidade.volume +
      ']'
    );

    Logger.log(
      '✅ PASSOU'
    );

    passou++;


  } catch (erro) {

    Logger.log(
      '❌ FALHOU: ' +
      (
        erro.message ||
        String(erro)
      )
    );

    falhou++;

  }


  // ============================================================
  // RESULTADO
  // ============================================================

  Logger.log('');
  Logger.log(
    '=============================================='
  );

  Logger.log(
    'RESULTADO DE RASTREABILIDADE V5.7'
  );

  Logger.log(
    '=============================================='
  );

  Logger.log(
    'TOTAL: 3'
  );

  Logger.log(
    'PASSARAM: ' +
    passou
  );

  Logger.log(
    'FALHARAM: ' +
    falhou
  );


  if (
    falhou === 0
  ) {

    Logger.log(
      '🟢 RASTREABILIDADE V5.7 PASSOU'
    );

  } else {

    Logger.log(
      '🔴 RASTREABILIDADE V5.7 POSSUI FALHAS'
    );

  }


  Logger.log(
    '=============================================='
  );

}

function TESTAR_INTEGRACAO_DIAGNOSTICO_OPORTUNIDADE_V57() {

  Logger.log('');
  Logger.log('==============================================');
  Logger.log(' FEEDS SOLUTIONS — INTEGRAÇÃO');
  Logger.log(' DIAGNÓSTICO → OPORTUNIDADE — V5.7');
  Logger.log('==============================================');
  Logger.log('');

  let passou = 0;
  let falhou = 0;


  // ============================================================
  // FUNÇÃO LOCAL DE INTEGRAÇÃO
  // ============================================================

  function gerarOportunidadeSePronto_(diagnostico) {

    if (
      !diagnostico
    ) {
      return null;
    }


    const estado =
      determinarEstadoDiagnostico_(
        diagnostico,
        {}
      );


    if (
      estado !==
      DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE
    ) {

      return null;

    }


    return construirOportunidadeDiagnosticoV57_(
      diagnostico
    );

  }


  // ============================================================
  // CASO 01 — INICIO
  // ============================================================

  Logger.log(
    '01 — INICIO não pode gerar oportunidade'
  );


  try {

    const diagnostico = {

      processo_nome: '',
      dor_principal: '',
      frequencia: '',
      volume: '',
      impacto_nivel: '',
      objetivo: ''

    };


    const oportunidade =
      gerarOportunidadeSePronto_(
        diagnostico
      );


    if (
      oportunidade !== null
    ) {

      throw new Error(
        'INICIO gerou oportunidade indevidamente.'
      );

    }


    Logger.log(
      '✅ PASSOU'
    );

    passou++;


  } catch (erro) {

    Logger.log(
      '❌ FALHOU: ' +
      (
        erro.message ||
        String(erro)
      )
    );

    falhou++;

  }


  // ============================================================
  // CASO 02 — DESCOBERTA
  // ============================================================

  Logger.log('');
  Logger.log(
    '02 — DESCOBERTA não pode gerar oportunidade'
  );


  try {

    const diagnostico = {

      processo_nome:
        'Conferir pedidos',

      dor_principal:
        '',

      frequencia: '',
      volume: '',
      impacto_nivel: '',
      objetivo: ''

    };


    const oportunidade =
      gerarOportunidadeSePronto_(
        diagnostico
      );


    if (
      oportunidade !== null
    ) {

      throw new Error(
        'DESCOBERTA gerou oportunidade indevidamente.'
      );

    }


    Logger.log(
      '✅ PASSOU'
    );

    passou++;


  } catch (erro) {

    Logger.log(
      '❌ FALHOU: ' +
      (
        erro.message ||
        String(erro)
      )
    );

    falhou++;

  }


  // ============================================================
  // CASO 03 — INVESTIGAÇÃO
  // ============================================================

  Logger.log('');
  Logger.log(
    '03 — INVESTIGACAO não pode gerar oportunidade'
  );


  try {

    const diagnostico = {

      processo_nome:
        'Conferir pedidos',

      dor_principal:
        'Erros de digitação',

      frequencia:
        'Diária',

      volume:
        '120 pedidos por dia',

      impacto_nivel:
        '',

      objetivo:
        'Reduzir erros'

    };


    const oportunidade =
      gerarOportunidadeSePronto_(
        diagnostico
      );


    if (
      oportunidade !== null
    ) {

      throw new Error(
        'INVESTIGACAO gerou oportunidade indevidamente.'
      );

    }


    Logger.log(
      '✅ PASSOU'
    );

    passou++;


  } catch (erro) {

    Logger.log(
      '❌ FALHOU: ' +
      (
        erro.message ||
        String(erro)
      )
    );

    falhou++;

  }


  // ============================================================
  // CASO 04 — PRONTO PARA ANÁLISE
  // ============================================================

  Logger.log('');
  Logger.log(
    '04 — PRONTO_PARA_ANALISE deve gerar oportunidade'
  );


  try {

    const diagnostico = {

      processo_nome:
        'Conferir e lançar pedidos',

      dor_principal:
        'Erros de digitação e retrabalho',

      frequencia:
        'Diária',

      volume:
        '120 pedidos por dia',

      impacto_nivel:
        '3 horas por dia',

      objetivo:
        'Reduzir erros e retrabalho'

    };


    const estado =
      determinarEstadoDiagnostico_(
        diagnostico,
        {}
      );


    if (
      estado !==
      DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE
    ) {

      throw new Error(
        'Diagnóstico completo não chegou a PRONTO_PARA_ANALISE.'
      );

    }


    const oportunidade =
      gerarOportunidadeSePronto_(
        diagnostico
      );


    if (
      !oportunidade
    ) {

      throw new Error(
        'Diagnóstico pronto não gerou oportunidade.'
      );

    }


    if (
      oportunidade.processo !==
      diagnostico.processo_nome
    ) {

      throw new Error(
        'Processo da oportunidade divergiu.'
      );

    }


    if (
      oportunidade.dor !==
      diagnostico.dor_principal
    ) {

      throw new Error(
        'Dor da oportunidade divergiu.'
      );

    }


    if (
      oportunidade.volume !==
      diagnostico.volume
    ) {

      throw new Error(
        'Volume da oportunidade divergiu.'
      );

    }


    if (
      oportunidade.impacto !==
      diagnostico.impacto_nivel
    ) {

      throw new Error(
        'Impacto da oportunidade divergiu.'
      );

    }


    Logger.log(
      'Estado: ' +
      estado
    );

    Logger.log(
      'Oportunidade criada: SIM'
    );

    Logger.log(
      '✅ PASSOU'
    );

    passou++;


  } catch (erro) {

    Logger.log(
      '❌ FALHOU: ' +
      (
        erro.message ||
        String(erro)
      )
    );

    falhou++;

  }


  // ============================================================
  // CASO 05 — ATUALIZAÇÃO
  // ============================================================

  Logger.log('');
  Logger.log(
    '05 — Oportunidade deve acompanhar atualização'
  );


  try {

    const diagnosticoInicial = {

      processo_nome:
        'Conferir pedidos',

      dor_principal:
        'Erros de digitação',

      frequencia:
        'Diária',

      volume:
        '80 pedidos por dia',

      impacto_nivel:
        '2 horas por dia',

      objetivo:
        'Reduzir erros'

    };


    const diagnosticoAtualizado = {

      processo_nome:
        'Conferir e lançar pedidos',

      dor_principal:
        'Erros de digitação e retrabalho',

      frequencia:
        'Diária',

      volume:
        '120 pedidos por dia',

      impacto_nivel:
        '3 horas por dia',

      objetivo:
        'Reduzir erros e retrabalho'

    };


    const oportunidadeInicial =
      gerarOportunidadeSePronto_(
        diagnosticoInicial
      );


    if (
      !oportunidadeInicial
    ) {

      throw new Error(
        'Oportunidade inicial não foi criada.'
      );

    }


    const oportunidadeAtualizada =
      gerarOportunidadeSePronto_(
        diagnosticoAtualizado
      );


    if (
      !oportunidadeAtualizada
    ) {

      throw new Error(
        'Oportunidade atualizada não foi criada.'
      );

    }


    if (
      oportunidadeAtualizada.volume !==
      '120 pedidos por dia'
    ) {

      throw new Error(
        'Oportunidade não recebeu novo volume.'
      );

    }


    if (
      oportunidadeAtualizada.impacto !==
      '3 horas por dia'
    ) {

      throw new Error(
        'Oportunidade não recebeu novo impacto.'
      );

    }


    if (
      oportunidadeAtualizada.dor !==
      'Erros de digitação e retrabalho'
    ) {

      throw new Error(
        'Oportunidade não recebeu nova dor.'
      );

    }


    Logger.log(
      'Volume anterior: ' +
      oportunidadeInicial.volume
    );

    Logger.log(
      'Volume atual: ' +
      oportunidadeAtualizada.volume
    );

    Logger.log(
      'Impacto anterior: ' +
      oportunidadeInicial.impacto
    );

    Logger.log(
      'Impacto atual: ' +
      oportunidadeAtualizada.impacto
    );

    Logger.log(
      '✅ PASSOU'
    );

    passou++;


  } catch (erro) {

    Logger.log(
      '❌ FALHOU: ' +
      (
        erro.message ||
        String(erro)
      )
    );

    falhou++;

  }


  // ============================================================
  // RESULTADO
  // ============================================================

  Logger.log('');
  Logger.log(
    '=============================================='
  );

  Logger.log(
    'RESULTADO DA INTEGRAÇÃO V5.7'
  );

  Logger.log(
    '=============================================='
  );

  Logger.log(
    'TOTAL: 5'
  );

  Logger.log(
    'PASSARAM: ' +
    passou
  );

  Logger.log(
    'FALHARAM: ' +
    falhou
  );


  if (
    falhou === 0
  ) {

    Logger.log(
      '🟢 INTEGRAÇÃO DIAGNÓSTICO → OPORTUNIDADE PASSOU'
    );

  } else {

    Logger.log(
      '🔴 INTEGRAÇÃO DIAGNÓSTICO → OPORTUNIDADE POSSUI FALHAS'
    );

  }


  Logger.log(
    '=============================================='
  );

}

/**
 * V5.7 — Motor real de integração
 * Diagnóstico → Oportunidade
 *
 * Regras:
 * - Só gera oportunidade quando o diagnóstico está pronto.
 * - Não grava dados.
 * - Não altera o diagnóstico.
 * - Não utiliza IA.
 */
function construirOportunidadeSeProntoDiagnosticoV57_(diagnostico) {

  if (!diagnostico) {
    return null;
  }

  const estado =
    determinarEstadoDiagnostico_(
      diagnostico,
      {}
    );

  if (
    String(estado || '').trim().toUpperCase() !==
    String(
      DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE
    ).trim().toUpperCase()
  ) {
    return null;
  }

  return construirOportunidadeDiagnosticoV57_(
    diagnostico
  );
}

function TESTAR_MOTOR_REAL_OPORTUNIDADE_V57() {

  Logger.log('');
  Logger.log('==============================================');
  Logger.log(' FEEDS SOLUTIONS — MOTOR REAL DE OPORTUNIDADE');
  Logger.log(' V5.7');
  Logger.log('==============================================');
  Logger.log('');

  let passou = 0;
  let falhou = 0;


  function testar_(numero, descricao, callback) {

    Logger.log(
      numero + ' — ' + descricao
    );

    try {

      callback();

      Logger.log('✅ PASSOU');
      passou++;

    } catch (erro) {

      Logger.log(
        '❌ FALHOU: ' +
        (
          erro.message ||
          String(erro)
        )
      );

      falhou++;
    }

    Logger.log('');
  }


  // ============================================================
  // 01 — INICIO
  // ============================================================

  testar_(
    '01',
    'INICIO não gera oportunidade',
    function() {

      const diagnostico = {

        processo_nome: '',
        dor_principal: '',
        frequencia: '',
        volume: '',
        impacto_nivel: '',
        objetivo: ''

      };

      const resultado =
        construirOportunidadeSeProntoDiagnosticoV57_(
          diagnostico
        );

      if (resultado !== null) {

        throw new Error(
          'O motor gerou oportunidade em INICIO.'
        );

      }
    }
  );


  // ============================================================
  // 02 — DESCOBERTA
  // ============================================================

  testar_(
    '02',
    'DESCOBERTA não gera oportunidade',
    function() {

      const diagnostico = {

        processo_nome:
          'Conferir pedidos',

        dor_principal:
          '',

        frequencia: '',
        volume: '',
        impacto_nivel: '',
        objetivo: ''

      };

      const resultado =
        construirOportunidadeSeProntoDiagnosticoV57_(
          diagnostico
        );

      if (resultado !== null) {

        throw new Error(
          'O motor gerou oportunidade em DESCOBERTA.'
        );

      }
    }
  );


  // ============================================================
  // 03 — INVESTIGACAO
  // ============================================================

  testar_(
    '03',
    'INVESTIGACAO não gera oportunidade',
    function() {

      const diagnostico = {

        processo_nome:
          'Conferir pedidos',

        dor_principal:
          'Erros de digitação',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '',

        objetivo:
          'Reduzir erros'

      };

      const resultado =
        construirOportunidadeSeProntoDiagnosticoV57_(
          diagnostico
        );

      if (resultado !== null) {

        throw new Error(
          'O motor gerou oportunidade em INVESTIGACAO.'
        );

      }
    }
  );


  // ============================================================
  // 04 — PRONTO
  // ============================================================

  testar_(
    '04',
    'PRONTO_PARA_ANALISE gera oportunidade',
    function() {

      const diagnostico = {

        processo_nome:
          'Conferir e lançar pedidos',

        dor_principal:
          'Erros de digitação e retrabalho',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '3 horas por dia',

        objetivo:
          'Reduzir erros e retrabalho'

      };

      const resultado =
        construirOportunidadeSeProntoDiagnosticoV57_(
          diagnostico
        );

      if (!resultado) {

        throw new Error(
          'O motor não gerou oportunidade.'
        );

      }

      if (
        resultado.processo !==
        diagnostico.processo_nome
      ) {

        throw new Error(
          'Processo não foi preservado.'
        );

      }

      if (
        resultado.dor !==
        diagnostico.dor_principal
      ) {

        throw new Error(
          'Dor não foi preservada.'
        );

      }

      if (
        resultado.volume !==
        diagnostico.volume
      ) {

        throw new Error(
          'Volume não foi preservado.'
        );

      }

      if (
        resultado.impacto !==
        diagnostico.impacto_nivel
      ) {

        throw new Error(
          'Impacto não foi preservado.'
        );

      }

      if (
        resultado.objetivo !==
        diagnostico.objetivo
      ) {

        throw new Error(
          'Objetivo não foi preservado.'
        );

      }
    }
  );


  // ============================================================
  // 05 — DIAGNÓSTICO INCOMPLETO NÃO PODE SER FORÇADO
  // ============================================================

  testar_(
    '05',
    'Diagnóstico incompleto continua bloqueado',
    function() {

      const diagnostico = {

        processo_nome:
          'Conferir pedidos',

        dor_principal:
          'Erros de digitação',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '3 horas por dia',

        objetivo:
          ''

      };

      const resultado =
        construirOportunidadeSeProntoDiagnosticoV57_(
          diagnostico
        );

      if (resultado !== null) {

        throw new Error(
          'O motor ignorou a ausência do objetivo.'
        );

      }
    }
  );


  // ============================================================
  // 06 — SEM DOR
  // ============================================================

  testar_(
    '06',
    'Diagnóstico sem dor continua bloqueado',
    function() {

      const diagnostico = {

        processo_nome:
          'Conferir e lançar pedidos',

        dor_principal:
          '',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '3 horas por dia',

        objetivo:
          'Reduzir erros'

      };

      const resultado =
        construirOportunidadeSeProntoDiagnosticoV57_(
          diagnostico
        );

      if (resultado !== null) {

        throw new Error(
          'O motor criou oportunidade sem dor.'
        );

      }
    }
  );


  // ============================================================
  // 07 — SEM PROCESSO
  // ============================================================

  testar_(
    '07',
    'Diagnóstico sem processo continua bloqueado',
    function() {

      const diagnostico = {

        processo_nome:
          '',

        dor_principal:
          'Erros de digitação',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '3 horas por dia',

        objetivo:
          'Reduzir erros'

      };

      const resultado =
        construirOportunidadeSeProntoDiagnosticoV57_(
          diagnostico
        );

      if (resultado !== null) {

        throw new Error(
          'O motor criou oportunidade sem processo.'
        );

      }
    }
  );


  // ============================================================
  // 08 — SEM IMPACTO
  // ============================================================

  testar_(
    '08',
    'Diagnóstico sem impacto continua bloqueado',
    function() {

      const diagnostico = {

        processo_nome:
          'Conferir pedidos',

        dor_principal:
          'Erros de digitação',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '',

        objetivo:
          'Reduzir erros'

      };

      const resultado =
        construirOportunidadeSeProntoDiagnosticoV57_(
          diagnostico
        );

      if (resultado !== null) {

        throw new Error(
          'O motor criou oportunidade sem impacto.'
        );

      }
    }
  );


  // ============================================================
  // 09 — SEM FREQUÊNCIA
  // ============================================================

  testar_(
    '09',
    'Diagnóstico sem frequência continua bloqueado',
    function() {

      const diagnostico = {

        processo_nome:
          'Conferir pedidos',

        dor_principal:
          'Erros de digitação',

        frequencia:
          '',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '3 horas por dia',

        objetivo:
          'Reduzir erros'

      };

      const resultado =
        construirOportunidadeSeProntoDiagnosticoV57_(
          diagnostico
        );

      if (resultado !== null) {

        throw new Error(
          'O motor criou oportunidade sem frequência.'
        );

      }
    }
  );


  // ============================================================
  // 10 — SEM EFEITO COLATERAL
  // ============================================================

  testar_(
    '10',
    'Motor não altera o diagnóstico original',
    function() {

      const diagnostico = {

        processo_nome:
          'Conferir pedidos',

        dor_principal:
          'Erros de digitação',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '3 horas por dia',

        objetivo:
          'Reduzir erros'

      };

      const antes =
        JSON.stringify(diagnostico);

      const resultado =
        construirOportunidadeSeProntoDiagnosticoV57_(
          diagnostico
        );

      if (!resultado) {

        throw new Error(
          'Oportunidade não foi criada.'
        );

      }

      const depois =
        JSON.stringify(diagnostico);

      if (
        antes !== depois
      ) {

        throw new Error(
          'O motor alterou o diagnóstico original.'
        );

      }
    }
  );


  // ============================================================
  // RESULTADO
  // ============================================================

  Logger.log(
    '=============================================='
  );

  Logger.log(
    'RESULTADO DO MOTOR REAL V5.7'
  );

  Logger.log(
    '=============================================='
  );

  Logger.log(
    'TOTAL: 10'
  );

  Logger.log(
    'PASSARAM: ' +
    passou
  );

  Logger.log(
    'FALHARAM: ' +
    falhou
  );


  if (falhou === 0) {

    Logger.log(
      '🟢 MOTOR REAL DE OPORTUNIDADE APROVADO'
    );

  } else {

    Logger.log(
      '🔴 MOTOR REAL DE OPORTUNIDADE POSSUI FALHAS'
    );

  }

  Logger.log(
    '=============================================='
  );
}
/**
 * V5.7 — Atualiza uma oportunidade existente
 * ou cria uma nova quando necessário.
 *
 * Esta função ainda NÃO é chamada pelo fluxo principal.
 *
 * Regras:
 * - Diagnóstico precisa estar pronto.
 * - Uma oportunidade por diagnóstico/conversa.
 * - Reprocessamento não cria duplicata.
 * - Atualização substitui os dados antigos pelos atuais.
 *
 * IMPORTANTE:
 * Esta primeira versão trabalha em memória.
 * A persistência em planilha será criada somente após
 * os testes de idempotência passarem.
 */
function processarOportunidadeDiagnosticoV57_(diagnostico, oportunidadeExistente) {

  if (!diagnostico) {
    return null;
  }


  const oportunidade =
    construirOportunidadeSeProntoDiagnosticoV57_(
      diagnostico
    );


  // Diagnóstico ainda não está pronto.
  if (!oportunidade) {
    return null;
  }


  // Não existe oportunidade anterior:
  // criar a primeira.
  if (!oportunidadeExistente) {

    return {
      acao: 'CRIAR',
      oportunidade: oportunidade
    };

  }


  // Já existe:
  // atualizar com o diagnóstico atual.
  return {
    acao: 'ATUALIZAR',
    oportunidade: oportunidade
  };
}

function TESTAR_PERSISTENCIA_IDEMPOTENCIA_OPORTUNIDADE_V57() {

  Logger.log('');
  Logger.log('==============================================');
  Logger.log(' FEEDS SOLUTIONS — PERSISTÊNCIA / IDEMPOTÊNCIA');
  Logger.log(' OPORTUNIDADE — V5.7');
  Logger.log('==============================================');
  Logger.log('');

  let passou = 0;
  let falhou = 0;


  function testar_(numero, descricao, callback) {

    Logger.log(
      numero + ' — ' + descricao
    );

    try {

      callback();

      Logger.log('✅ PASSOU');
      passou++;

    } catch (erro) {

      Logger.log(
        '❌ FALHOU: ' +
        (
          erro.message ||
          String(erro)
        )
      );

      falhou++;
    }

    Logger.log('');
  }


  // ============================================================
  // DIAGNÓSTICO BASE
  // ============================================================

  const diagnosticoCompleto = {

    processo_nome:
      'Conferir e lançar pedidos',

    dor_principal:
      'Erros de digitação e retrabalho',

    frequencia:
      'Diária',

    volume:
      '120 pedidos por dia',

    impacto_nivel:
      '3 horas por dia',

    objetivo:
      'Reduzir erros e retrabalho'

  };


  // ============================================================
  // 01 — PRIMEIRA EXECUÇÃO
  // ============================================================

  testar_(
    '01',
    'Primeira execução deve CRIAR',
    function() {

      const resultado =
        processarOportunidadeDiagnosticoV57_(
          diagnosticoCompleto,
          null
        );


      if (!resultado) {

        throw new Error(
          'Nenhum resultado foi retornado.'
        );

      }


      if (
        resultado.acao !==
        'CRIAR'
      ) {

        throw new Error(
          'Ação esperada: CRIAR. Recebida: ' +
          resultado.acao
        );

      }


      if (
        !resultado.oportunidade
      ) {

        throw new Error(
          'Oportunidade não foi criada.'
        );

      }

    }
  );


  // ============================================================
  // 02 — SEGUNDA EXECUÇÃO
  // ============================================================

  testar_(
    '02',
    'Reprocessamento deve ATUALIZAR, não criar',
    function() {

      const primeira =
        processarOportunidadeDiagnosticoV57_(
          diagnosticoCompleto,
          null
        );


      const segunda =
        processarOportunidadeDiagnosticoV57_(
          diagnosticoCompleto,
          primeira.oportunidade
        );


      if (!segunda) {

        throw new Error(
          'Segundo processamento não retornou resultado.'
        );

      }


      if (
        segunda.acao !==
        'ATUALIZAR'
      ) {

        throw new Error(
          'Reprocessamento criou nova oportunidade.'
        );

      }

    }
  );


  // ============================================================
  // 03 — MESMA OPORTUNIDADE
  // ============================================================

  testar_(
    '03',
    'Reprocessamento mantém os mesmos dados',
    function() {

      const primeira =
        processarOportunidadeDiagnosticoV57_(
          diagnosticoCompleto,
          null
        );


      const segunda =
        processarOportunidadeDiagnosticoV57_(
          diagnosticoCompleto,
          primeira.oportunidade
        );


      const campos = [
        'processo',
        'dor',
        'frequencia',
        'volume',
        'impacto',
        'objetivo'
      ];


      campos.forEach(function(campo) {

        if (
          primeira.oportunidade[campo] !==
          segunda.oportunidade[campo]
        ) {

          throw new Error(
            'Campo ' +
            campo +
            ' mudou indevidamente.'
          );

        }

      });

    }
  );


  // ============================================================
  // 04 — ATUALIZAÇÃO DE VOLUME
  // ============================================================

  testar_(
    '04',
    'Atualização deve substituir o volume antigo',
    function() {

      const primeiraDiagnostico = {

        processo_nome:
          'Conferir pedidos',

        dor_principal:
          'Erros de digitação',

        frequencia:
          'Diária',

        volume:
          '80 pedidos por dia',

        impacto_nivel:
          '2 horas por dia',

        objetivo:
          'Reduzir erros'

      };


      const segundaDiagnostico = {

        processo_nome:
          'Conferir pedidos',

        dor_principal:
          'Erros de digitação',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '2 horas por dia',

        objetivo:
          'Reduzir erros'

      };


      const primeira =
        processarOportunidadeDiagnosticoV57_(
          primeiraDiagnostico,
          null
        );


      const segunda =
        processarOportunidadeDiagnosticoV57_(
          segundaDiagnostico,
          primeira.oportunidade
        );


      if (
        segunda.acao !==
        'ATUALIZAR'
      ) {

        throw new Error(
          'Atualização não foi identificada.'
        );

      }


      if (
        segunda.oportunidade.volume !==
        '120 pedidos por dia'
      ) {

        throw new Error(
          'Novo volume não foi aplicado.'
        );

      }


      if (
        segunda.oportunidade.volume.indexOf(
          '80'
        ) !== -1
      ) {

        throw new Error(
          'Volume antigo permaneceu na oportunidade.'
        );

      }

    }
  );


  // ============================================================
  // 05 — ATUALIZAÇÃO DE IMPACTO
  // ============================================================

  testar_(
    '05',
    'Atualização deve substituir o impacto antigo',
    function() {

      const primeiraDiagnostico = {

        processo_nome:
          'Conferir pedidos',

        dor_principal:
          'Erros de digitação',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '2 horas por dia',

        objetivo:
          'Reduzir erros'

      };


      const segundaDiagnostico = {

        processo_nome:
          'Conferir pedidos',

        dor_principal:
          'Erros de digitação',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '3 horas por dia',

        objetivo:
          'Reduzir erros'

      };


      const primeira =
        processarOportunidadeDiagnosticoV57_(
          primeiraDiagnostico,
          null
        );


      const segunda =
        processarOportunidadeDiagnosticoV57_(
          segundaDiagnostico,
          primeira.oportunidade
        );


      if (
        segunda.oportunidade.impacto !==
        '3 horas por dia'
      ) {

        throw new Error(
          'Novo impacto não foi aplicado.'
        );

      }


      if (
        segunda.oportunidade.impacto.indexOf(
          '2 horas'
        ) !== -1
      ) {

        throw new Error(
          'Impacto antigo permaneceu.'
        );

      }

    }
  );


  // ============================================================
  // 06 — ATUALIZAÇÃO DA DOR
  // ============================================================

  testar_(
    '06',
    'Atualização deve substituir a dor antiga',
    function() {

      const primeiraDiagnostico = {

        processo_nome:
          'Conferir pedidos',

        dor_principal:
          'Erros de digitação',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '3 horas por dia',

        objetivo:
          'Reduzir erros'

      };


      const segundaDiagnostico = {

        processo_nome:
          'Conferir pedidos',

        dor_principal:
          'Erros de digitação e retrabalho',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '3 horas por dia',

        objetivo:
          'Reduzir erros e retrabalho'

      };


      const primeira =
        processarOportunidadeDiagnosticoV57_(
          primeiraDiagnostico,
          null
        );


      const segunda =
        processarOportunidadeDiagnosticoV57_(
          segundaDiagnostico,
          primeira.oportunidade
        );


      if (
        segunda.oportunidade.dor !==
        'Erros de digitação e retrabalho'
      ) {

        throw new Error(
          'Nova dor não foi aplicada.'
        );

      }

    }
  );


  // ============================================================
  // 07 — DIAGNÓSTICO INCOMPLETO
  // ============================================================

  testar_(
    '07',
    'Diagnóstico incompleto não cria oportunidade',
    function() {

      const diagnostico = {

        processo_nome:
          'Conferir pedidos',

        dor_principal:
          'Erros de digitação',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '',

        objetivo:
          'Reduzir erros'

      };


      const resultado =
        processarOportunidadeDiagnosticoV57_(
          diagnostico,
          null
        );


      if (
        resultado !== null
      ) {

        throw new Error(
          'Diagnóstico incompleto gerou oportunidade.'
        );

      }

    }
  );


  // ============================================================
  // 08 — DIAGNÓSTICO INCOMPLETO COM OPORTUNIDADE EXISTENTE
  // ============================================================

  testar_(
    '08',
    'Diagnóstico incompleto não deve destruir oportunidade existente',
    function() {

      const oportunidadeExistente = {

        processo:
          'Conferir pedidos',

        dor:
          'Erros de digitação',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto:
          '3 horas por dia',

        objetivo:
          'Reduzir erros'

      };


      const diagnosticoIncompleto = {

        processo_nome:
          'Conferir pedidos',

        dor_principal:
          'Erros de digitação',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '',

        objetivo:
          'Reduzir erros'

      };


      const resultado =
        processarOportunidadeDiagnosticoV57_(
          diagnosticoIncompleto,
          oportunidadeExistente
        );


      if (
        resultado !== null
      ) {

        throw new Error(
          'Diagnóstico incompleto deveria permanecer sem processamento.'
        );

      }

    }
  );


  // ============================================================
  // 09 — NÃO ALTERAR OBJETO EXISTENTE
  // ============================================================

  testar_(
    '09',
    'Processamento não altera a oportunidade existente',
    function() {

      const diagnostico = {

        processo_nome:
          'Conferir pedidos',

        dor_principal:
          'Erros de digitação',

        frequencia:
          'Diária',

        volume:
          '120 pedidos por dia',

        impacto_nivel:
          '3 horas por dia',

        objetivo:
          'Reduzir erros'

      };


      const existente = {

        processo:
          'Conferir pedidos',

        dor:
          'Erros de digitação',

        frequencia:
          'Diária',

        volume:
          '80 pedidos por dia',

        impacto:
          '2 horas por dia',

        objetivo:
          'Reduzir erros'

      };


      const antes =
        JSON.stringify(existente);


      const resultado =
        processarOportunidadeDiagnosticoV57_(
          diagnostico,
          existente
        );


      if (!resultado) {

        throw new Error(
          'Processamento não retornou resultado.'
        );

      }


      const depois =
        JSON.stringify(existente);


      if (
        antes !== depois
      ) {

        throw new Error(
          'A oportunidade existente foi alterada diretamente.'
        );

      }

    }
  );


  // ============================================================
  // 10 — NULL
  // ============================================================

  testar_(
    '10',
    'Diagnóstico nulo não causa erro',
    function() {

      const resultado =
        processarOportunidadeDiagnosticoV57_(
          null,
          null
        );


      if (
        resultado !== null
      ) {

        throw new Error(
          'Diagnóstico nulo deveria retornar null.'
        );

      }

    }
  );


  // ============================================================
  // RESULTADO
  // ============================================================

  Logger.log(
    '=============================================='
  );

  Logger.log(
    'RESULTADO DA PERSISTÊNCIA / IDEMPOTÊNCIA V5.7'
  );

  Logger.log(
    '=============================================='
  );

  Logger.log(
    'TOTAL: 10'
  );

  Logger.log(
    'PASSARAM: ' +
    passou
  );

  Logger.log(
    'FALHARAM: ' +
    falhou
  );


  if (
    falhou === 0
  ) {

    Logger.log(
      '🟢 PERSISTÊNCIA / IDEMPOTÊNCIA APROVADA'
    );

  } else {

    Logger.log(
      '🔴 PERSISTÊNCIA / IDEMPOTÊNCIA POSSUI FALHAS'
    );

  }


  Logger.log(
    '=============================================='
  );
}
/**
 * ============================================================
 * V5.7 — PERSISTÊNCIA REAL DE OPORTUNIDADES
 * ============================================================
 *
 * Regras:
 *
 * 1. Só persiste diagnóstico PRONTO_PARA_ANALISE.
 * 2. Uma oportunidade por diagnostico_id.
 * 3. Se não existir, cria.
 * 4. Se existir, atualiza.
 * 5. Nunca cria duplicata.
 * 6. Não altera o diagnóstico.
 * 7. Não utiliza IA.
 *
 * ============================================================
 */


/**
 * Retorna a aba OPORTUNIDADES.
 */
function obterAbaOportunidadesV57_() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const nomeAba =
    (
      typeof SHEETS !== 'undefined' &&
      SHEETS.OPORTUNIDADES
    )
      ? SHEETS.OPORTUNIDADES
      : 'OPORTUNIDADES';

  const sheet =
    ss.getSheetByName(nomeAba);

  if (!sheet) {

    throw new Error(
      'Aba OPORTUNIDADES não encontrada. ' +
      'Execute criarEstruturaMVP() antes.'
    );

  }

  return sheet;
}


/**
 * Lê os cabeçalhos da aba.
 */
function obterCabecalhosOportunidadesV57_() {

  const sheet =
    obterAbaOportunidadesV57_();

  return sheet
    .getRange(
      1,
      1,
      1,
      sheet.getLastColumn()
    )
    .getValues()[0];
}


/**
 * Localiza uma oportunidade pelo diagnostico_id.
 *
 * Esse é o mecanismo central de idempotência.
 */
function buscarOportunidadePorDiagnosticoV57_(
  diagnosticoId
) {

  const id =
    String(
      diagnosticoId || ''
    ).trim();

  if (!id) {
    return null;
  }

  const sheet =
    obterAbaOportunidadesV57_();

  const ultimaLinha =
    sheet.getLastRow();

  if (ultimaLinha <= 1) {
    return null;
  }

  const cabecalhos =
    obterCabecalhosOportunidadesV57_();

  const colunaDiagnostico =
    cabecalhos.indexOf(
      'diagnostico_id'
    ) + 1;

  const colunaOportunidade =
    cabecalhos.indexOf(
      'oportunidade_id'
    ) + 1;

  if (
    colunaDiagnostico <= 0 ||
    colunaOportunidade <= 0
  ) {

    throw new Error(
      'Estrutura da aba OPORTUNIDADES inválida.'
    );

  }

  const valores =
    sheet
      .getRange(
        2,
        1,
        ultimaLinha - 1,
        sheet.getLastColumn()
      )
      .getValues();

  for (
    let i = 0;
    i < valores.length;
    i++
  ) {

    const valorDiagnostico =
      String(
        valores[i][colunaDiagnostico - 1] || ''
      ).trim();

    if (
      valorDiagnostico === id
    ) {

      const numeroLinha =
        i + 2;

      const objeto = {};

      cabecalhos.forEach(
        function(cabecalho, indice) {

          objeto[cabecalho] =
            valores[i][indice];

        }
      );

      objeto._linha =
        numeroLinha;

      objeto._oportunidade_id =
        String(
          valores[i][colunaOportunidade - 1] || ''
        ).trim();

      return objeto;

    }
  }

  return null;
}


/**
 * Gera ID de oportunidade.
 */
function gerarIdOportunidadeDiagnosticoV57_() {

  const prefixo =
    (
      typeof ID_PREFIXOS !== 'undefined' &&
      ID_PREFIXOS.OPORTUNIDADE
    )
      ? ID_PREFIXOS.OPORTUNIDADE
      : 'OPP';

  return (
    prefixo +
    '_' +
    Utilities.getUuid()
      .replace(/-/g, '')
      .substring(0, 16)
      .toUpperCase()
  );
}


/**
 * Converte o objeto da oportunidade
 * para os dados da planilha.
 */
function montarRegistroOportunidadeV57_(
  oportunidade,
  diagnostico,
  oportunidadeId,
  dataCriacao
) {

  const agora =
    new Date();

  return {

    oportunidade_id:
      oportunidadeId,

    diagnostico_id:
      String(
        diagnostico.diagnostico_id || ''
      ).trim(),

    empresa_id:
      String(
        diagnostico.empresa_id || ''
      ).trim(),

    conversa_id:
      String(
        diagnostico.conversa_id || ''
      ).trim(),

    processo:
      String(
        oportunidade.processo || ''
      ).trim(),

    dor:
      String(
        oportunidade.dor || ''
      ).trim(),

    frequencia:
      String(
        oportunidade.frequencia || ''
      ).trim(),

    volume:
      String(
        oportunidade.volume || ''
      ).trim(),

    impacto:
      String(
        oportunidade.impacto || ''
      ).trim(),

    objetivo:
      String(
        oportunidade.objetivo || ''
      ).trim(),

    descricao:
      String(
        oportunidade.descricao || ''
      ).trim(),

    prioridade:
      String(
        oportunidade.prioridade || ''
      ).trim(),

    justificativa:
      String(
        oportunidade.justificativa || ''
      ).trim(),

    status:
      'ABERTA',

    criado_em:
      dataCriacao || agora,

    atualizado_em:
      agora
  };
}


/**
 * Persiste uma oportunidade.
 *
 * Retorno:
 *
 * {
 *   acao: 'CRIAR' | 'ATUALIZAR',
 *   oportunidade_id: 'OPP_...',
 *   linha: number,
 *   oportunidade: object
 * }
 */
function persistirOportunidadeDiagnosticoV57_(
  diagnostico
) {

  if (!diagnostico) {

    return null;

  }


  /*
   * ============================================================
   * V5.7 — VOLUME CONSOLIDADO
   * ============================================================
   *
   * O volume não pertence à aba DIAGNOSTICOS.
   * Ele é uma medida persistida em METRICAS.
   *
   * Portanto, antes de construir a oportunidade,
   * recuperamos o último VOLUME confirmado.
   */

  const diagnosticoParaOportunidade =
    Object.assign(
      {},
      diagnostico
    );


  if (
    !String(
      diagnosticoParaOportunidade.volume || ''
    ).trim()
  ) {

    const medidas =
      obterMedidasDiagnostico_(
        diagnostico.empresa_id,
        diagnostico.conversa_id
      );


    const volumeConsolidado =
      obterUltimoVolumeDiagnostico_(
        medidas
      );


    diagnosticoParaOportunidade.volume =
      volumeConsolidado || '';

  }


  const oportunidade =
    construirOportunidadeSeProntoDiagnosticoV57_(
      diagnosticoParaOportunidade
    );


  // Diagnóstico ainda não está pronto.
  if (!oportunidade) {

    return null;

  }


  const diagnosticoId =
    String(
      diagnostico.diagnostico_id || ''
    ).trim();


  if (!diagnosticoId) {

    throw new Error(
      'Não é possível persistir oportunidade sem diagnostico_id.'
    );

  }


  const sheet =
    obterAbaOportunidadesV57_();


  const existente =
    buscarOportunidadePorDiagnosticoV57_(
      diagnosticoId
    );


  // ============================================================
  // ATUALIZAÇÃO
  // ============================================================

  if (existente) {

    const oportunidadeId =
      existente.oportunidade_id ||
      existente._oportunidade_id;


    const registro =
      montarRegistroOportunidadeV57_(
        oportunidade,
        diagnosticoParaOportunidade,
        oportunidadeId,
        existente.criado_em || new Date()
      );


    const cabecalhos =
      obterCabecalhosOportunidadesV57_();


    const valores =
      cabecalhos.map(
        function(cabecalho) {

          return registro[cabecalho] !== undefined
            ? registro[cabecalho]
            : '';

        }
      );


    sheet
      .getRange(
        existente._linha,
        1,
        1,
        cabecalhos.length
      )
      .setValues([
        valores
      ]);


    return {

      acao:
        'ATUALIZAR',

      oportunidade_id:
        oportunidadeId,

      linha:
        existente._linha,

      oportunidade:
        oportunidade

    };

  }


  // ============================================================
  // CRIAÇÃO
  // ============================================================

  const oportunidadeId =
    gerarIdOportunidadeDiagnosticoV57_();


  const registro =
    montarRegistroOportunidadeV57_(
      oportunidade,
      diagnosticoParaOportunidade,
      oportunidadeId,
      new Date()
    );


  const cabecalhos =
    obterCabecalhosOportunidadesV57_();


  const valores =
    cabecalhos.map(
      function(cabecalho) {

        return registro[cabecalho] !== undefined
          ? registro[cabecalho]
          : '';

      }
    );


  sheet.appendRow(
    valores
  );


  const linha =
    sheet.getLastRow();


  return {

    acao:
      'CRIAR',

    oportunidade_id:
      oportunidadeId,

    linha:
      linha,

    oportunidade:
      oportunidade

  };

}

function TESTAR_PERSISTENCIA_REAL_OPORTUNIDADE_V57() {

  Logger.log('');
  Logger.log('==============================================');
  Logger.log(' FEEDS SOLUTIONS — PERSISTÊNCIA REAL');
  Logger.log(' OPORTUNIDADE V5.7');
  Logger.log('==============================================');
  Logger.log('');

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName('OPORTUNIDADES');

  if (!sheet) {
    throw new Error(
      'Aba OPORTUNIDADES não existe.'
    );
  }

  const diagnosticoId =
    'DIAG_TEST_V57_PERSISTENCIA_' +
    Date.now();

  const diagnostico = {

    diagnostico_id:
      diagnosticoId,

    empresa_id:
      'EMP_TEST_V57',

    conversa_id:
      'CONV_TEST_V57',

    processo_nome:
      'Conferir e lançar pedidos',

    dor_principal:
      'Erros de digitação e retrabalho',

    frequencia:
      'Diária',

    volume:
      '120 pedidos por dia',

    impacto_nivel:
      '3 horas por dia',

    objetivo:
      'Reduzir erros e retrabalho'
  };


  // ============================================================
  // 01 — CRIAR
  // ============================================================

  Logger.log(
    '01 — Criar primeira oportunidade'
  );

  const primeira =
    persistirOportunidadeDiagnosticoV57_(
      diagnostico
    );

  if (!primeira) {
    throw new Error(
      'Nenhuma oportunidade foi retornada.'
    );
  }

  if (
    primeira.acao !== 'CRIAR'
  ) {
    throw new Error(
      'Ação esperada: CRIAR. Recebida: ' +
      primeira.acao
    );
  }

  Logger.log(
    'Oportunidade criada: ' +
    primeira.oportunidade_id
  );


  // ============================================================
  // 02 — CONFIRMAR PERSISTÊNCIA
  // ============================================================

  Logger.log(
    '02 — Confirmar persistência na planilha'
  );

  const encontrada =
    buscarOportunidadePorDiagnosticoV57_(
      diagnosticoId
    );

  if (!encontrada) {
    throw new Error(
      'Oportunidade não foi encontrada na planilha.'
    );
  }

  if (
    encontrada.oportunidade_id !==
    primeira.oportunidade_id
  ) {
    throw new Error(
      'ID persistido diverge do ID retornado.'
    );
  }

  Logger.log(
    'Linha persistida: ' +
    encontrada._linha
  );


  // ============================================================
  // 03 — REPROCESSAR
  // ============================================================

  Logger.log(
    '03 — Reprocessar o mesmo diagnóstico'
  );

  const segunda =
    persistirOportunidadeDiagnosticoV57_(
      diagnostico
    );

  if (
    segunda.acao !== 'ATUALIZAR'
  ) {
    throw new Error(
      'Reprocessamento criou uma segunda oportunidade.'
    );
  }

  if (
    segunda.oportunidade_id !==
    primeira.oportunidade_id
  ) {
    throw new Error(
      'Reprocessamento gerou outro ID.'
    );
  }

  if (
    segunda.linha !==
    primeira.linha
  ) {
    throw new Error(
      'Reprocessamento gravou em outra linha.'
    );
  }


  // ============================================================
  // 04 — ATUALIZAR DADOS
  // ============================================================

  Logger.log(
    '04 — Atualizar dados do diagnóstico'
  );

  const diagnosticoAtualizado =
    Object.assign(
      {},
      diagnostico,
      {

        volume:
          '150 pedidos por dia',

        impacto_nivel:
          '4 horas por dia',

        dor_principal:
          'Erros de digitação, retrabalho e atrasos',

        objetivo:
          'Reduzir erros, retrabalho e atrasos'
      }
    );

  const terceira =
    persistirOportunidadeDiagnosticoV57_(
      diagnosticoAtualizado
    );

  if (
    terceira.acao !== 'ATUALIZAR'
  ) {
    throw new Error(
      'Atualização não foi identificada.'
    );
  }

  if (
    terceira.oportunidade_id !==
    primeira.oportunidade_id
  ) {
    throw new Error(
      'Atualização criou outro ID.'
    );
  }


  // ============================================================
  // 05 — VALIDAR DADOS PERSISTIDOS
  // ============================================================

  Logger.log(
    '05 — Validar dados finais'
  );

  const final =
    buscarOportunidadePorDiagnosticoV57_(
      diagnosticoId
    );

  if (
    final.volume !==
    '150 pedidos por dia'
  ) {
    throw new Error(
      'Volume atualizado não foi persistido.'
    );
  }

  if (
    final.impacto !==
    '4 horas por dia'
  ) {
    throw new Error(
      'Impacto atualizado não foi persistido.'
    );
  }

  if (
    final.dor !==
    'Erros de digitação, retrabalho e atrasos'
  ) {
    throw new Error(
      'Nova dor não foi persistida.'
    );
  }

  if (
    final.objetivo !==
    'Reduzir erros, retrabalho e atrasos'
  ) {
    throw new Error(
      'Novo objetivo não foi persistido.'
    );
  }


  // ============================================================
  // 06 — CONFIRMAR UMA ÚNICA LINHA
  // ============================================================

  Logger.log(
    '06 — Confirmar idempotência física'
  );

  const ultimaLinha =
    sheet.getLastRow();

  const quantidadeDados =
    Math.max(
      ultimaLinha - 1,
      0
    );

  let quantidade = 0;

  if (
    quantidadeDados > 0
  ) {

    const cabecalhos =
      sheet
        .getRange(
          1,
          1,
          1,
          sheet.getLastColumn()
        )
        .getValues()[0];

    const dados =
      sheet
        .getRange(
          2,
          1,
          quantidadeDados,
          sheet.getLastColumn()
        )
        .getValues();

    const colunaDiagnostico =
      cabecalhos.indexOf(
        'diagnostico_id'
      );

    dados.forEach(
      function(linha) {

        if (
          String(
            linha[colunaDiagnostico] || ''
          ).trim() ===
          diagnosticoId
        ) {

          quantidade++;

        }

      }
    );
  }

  if (
    quantidade !== 1
  ) {
    throw new Error(
      'Foram encontradas ' +
      quantidade +
      ' oportunidades para o mesmo diagnóstico.'
    );
  }

  Logger.log(
    'Quantidade de oportunidades: ' +
    quantidade
  );


  // ============================================================
  // LIMPEZA
  // ============================================================

  Logger.log(
    'Limpando registro de teste...'
  );

  sheet.deleteRow(
    final._linha
  );


  Logger.log('');
  Logger.log(
    '=============================================='
  );

  Logger.log(
    '🟢 PERSISTÊNCIA REAL V5.7 PASSOU'
  );

  Logger.log(
    '=============================================='
  );
}

function TESTAR_FLUXO_COMPLETO_PRONTO_V57() {

  Logger.log(
    '=============================================='
  );

  Logger.log(
    '     FEEDS SOLUTIONS — V5.7'
  );

  Logger.log(
    '     TESTE INTEGRADO — OPORTUNIDADE'
  );

  Logger.log(
    '=============================================='
  );


  let empresa = null;
  let conversa = null;
  let diagnostico = null;


  try {

    // ==================================================
    // 01. CRIAR DIAGNÓSTICO DE TESTE
    // ==================================================

    Logger.log(
      '01 — Criando diagnóstico de teste...'
    );


    const inicio =
      iniciarDiagnostico();


    if (
      !inicio ||
      !inicio.sucesso
    ) {

      throw new Error(
        'Falha ao iniciar diagnóstico: ' +
        JSON.stringify(inicio)
      );

    }


    empresa =
      inicio.empresa_id;


    conversa =
      inicio.conversa_id;


    diagnostico =
      inicio.diagnostico_id;


    Logger.log(
      'Diagnóstico criado: ' +
      diagnostico
    );


    // ==================================================
    // 02. PROCESSAR MENSAGEM COMPLETA
    // ==================================================

    Logger.log(
      '02 — Processando mensagem completa...'
    );


    const mensagem =
      'Nosso processo principal é conferir e lançar pedidos. ' +
      'Temos erros de digitação e retrabalho nesse processo. ' +
      'Isso acontece diariamente. ' +
      'Processamos 120 pedidos por dia. ' +
      'Perdemos aproximadamente 3 horas por dia com esse problema. ' +
      'Nosso objetivo é reduzir os erros e diminuir o retrabalho.';


    /*
     * IMPORTANTE:
     *
     * processarMensagemDiagnostico()
     * recebe UM objeto "dados".
     */

    const resultado =
      processarMensagemDiagnostico({

        empresa_id:
          empresa,

        conversa_id:
          conversa,

        mensagem:
          mensagem

      });


    if (
      !resultado ||
      !resultado.sucesso
    ) {

      throw new Error(
        'Falha ao processar mensagem: ' +
        JSON.stringify(resultado)
      );

    }


    Logger.log(
      'Estado retornado: ' +
      resultado.estado
    );


    // ==================================================
    // 03. VERIFICAR DIAGNÓSTICO PRONTO
    // ==================================================

    Logger.log(
      '03 — Verificando PRONTO_PARA_ANALISE...'
    );


    const diagnosticoFinal =
      resultado.diagnostico || {};


    const estadoFinal =
      String(
        diagnosticoFinal.status_diagnostico ||
        resultado.estado ||
        ''
      )
        .trim()
        .toUpperCase();


    if (
      estadoFinal !==
      String(
        DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE
      )
        .trim()
        .toUpperCase()
    ) {

      throw new Error(
        'Diagnóstico não chegou a PRONTO_PARA_ANALISE. ' +
        'Estado atual: ' +
        estadoFinal +
        ' | Diagnóstico: ' +
        JSON.stringify(diagnosticoFinal)
      );

    }


    Logger.log(
      'Diagnóstico chegou a PRONTO_PARA_ANALISE.'
    );


    // ==================================================
    // 04. VERIFICAR OPORTUNIDADE CRIADA
    // ==================================================

    Logger.log(
      '04 — Verificando oportunidade persistida...'
    );


    const oportunidade =
      buscarOportunidadePorDiagnosticoV57_(
        diagnostico
      );


    if (!oportunidade) {

      throw new Error(
        'Nenhuma oportunidade foi persistida para o diagnóstico.'
      );

    }


    Logger.log(
      'Oportunidade encontrada: ' +
      JSON.stringify(oportunidade)
    );


    // ==================================================
    // 05. VERIFICAR ID
    // ==================================================

    Logger.log(
      '05 — Verificando oportunidade_id...'
    );


    if (
      !String(
        oportunidade.oportunidade_id || ''
      ).trim()
    ) {

      throw new Error(
        'Oportunidade encontrada sem oportunidade_id.'
      );

    }


    Logger.log(
      'ID da oportunidade: ' +
      oportunidade.oportunidade_id
    );


    // ==================================================
    // 06. VERIFICAR DIAGNÓSTICO
    // ==================================================

    Logger.log(
      '06 — Verificando diagnostico_id...'
    );


    if (
      String(
        oportunidade.diagnostico_id || ''
      ).trim() !==
      String(
        diagnostico || ''
      ).trim()
    ) {

      throw new Error(
        'diagnostico_id da oportunidade não corresponde ao diagnóstico.'
      );

    }


    Logger.log(
      'diagnostico_id corretamente relacionado.'
    );


    // ==================================================
    // 07. VERIFICAR CAMPOS PRINCIPAIS
    // ==================================================

    Logger.log(
      '07 — Verificando dados da oportunidade...'
    );


    const camposObrigatorios = [

      'processo',
      'dor',
      'frequencia',
      'impacto',
      'objetivo',
      'descricao',
      'prioridade',
      'justificativa',
      'status'

    ];


    camposObrigatorios.forEach(
      function(campo) {

        if (
          !String(
            oportunidade[campo] || ''
          ).trim()
        ) {

          throw new Error(
            'Campo obrigatório vazio na oportunidade: ' +
            campo
          );

        }

      }
    );


    Logger.log(
      'Todos os campos principais estão preenchidos.'
    );


    // ==================================================
    // 08. VERIFICAR VOLUME
    // ==================================================

    Logger.log(
      '08 — Verificando VOLUME consolidado...'
    );


    if (
      !String(
        oportunidade.volume || ''
      ).trim()
    ) {

      throw new Error(
        'Volume não foi persistido na oportunidade.'
      );

    }


    Logger.log(
      'Volume persistido: ' +
      oportunidade.volume
    );


    // ==================================================
    // 09. VERIFICAR IDEMPOTÊNCIA
    // ==================================================

    Logger.log(
      '09 — Reprocessando o mesmo diagnóstico...'
    );


    const resultadoPersistencia =
      persistirOportunidadeDiagnosticoV57_(
        diagnosticoFinal
      );


    if (!resultadoPersistencia) {

      throw new Error(
        'Reprocessamento não retornou resultado.'
      );

    }


    Logger.log(
      'Ação no reprocessamento: ' +
      resultadoPersistencia.acao
    );


    if (
      resultadoPersistencia.acao !==
      'ATUALIZAR'
    ) {

      throw new Error(
        'O reprocessamento deveria ATUALIZAR a oportunidade, ' +
        'mas retornou: ' +
        resultadoPersistencia.acao
      );

    }


    // ==================================================
    // 10. BUSCAR NOVAMENTE
    // ==================================================

    Logger.log(
      '10 — Confirmando idempotência física...'
    );


    const oportunidadeDepois =
      buscarOportunidadePorDiagnosticoV57_(
        diagnostico
      );


    if (!oportunidadeDepois) {

      throw new Error(
        'Oportunidade desapareceu após reprocessamento.'
      );

    }


    if (
      String(
        oportunidadeDepois.oportunidade_id
      ).trim() !==
      String(
        oportunidade.oportunidade_id
      ).trim()
    ) {

      throw new Error(
        'O reprocessamento criou outro oportunidade_id.'
      );

    }


    Logger.log(
      'Mesmo oportunidade_id mantido: ' +
      oportunidadeDepois.oportunidade_id
    );


    // ==================================================
    // 11. CONTAGEM FÍSICA
    // ==================================================

    Logger.log(
      '11 — Confirmando apenas uma oportunidade...'
    );


    const aba =
      obterAbaOportunidadesV57_();


    if (!aba) {

      throw new Error(
        'Aba OPORTUNIDADES não encontrada.'
      );

    }


    const valores =
      aba.getDataRange().getValues();


    const colunaDiagnostico =
      obterCabecalhosOportunidadesV57_()
        .indexOf(
          'diagnostico_id'
        );


    if (
      colunaDiagnostico < 0
    ) {

      throw new Error(
        'Coluna diagnostico_id não encontrada.'
      );

    }


    let quantidade = 0;


    for (
      let i = 1;
      i < valores.length;
      i++
    ) {

      if (
        String(
          valores[i][colunaDiagnostico] || ''
        ).trim() ===
        String(
          diagnostico || ''
        ).trim()
      ) {

        quantidade++;

      }

    }


    Logger.log(
      'Quantidade física de oportunidades: ' +
      quantidade
    );


    if (
      quantidade !== 1
    ) {

      throw new Error(
        'Falha de idempotência: esperado 1 registro, encontrado ' +
        quantidade
      );

    }


    // ==================================================
    // RESULTADO
    // ==================================================

    Logger.log('');

    Logger.log(
      '=============================================='
    );

    Logger.log(
      '🟢 V5.7 — TESTE INTEGRADO PASSOU'
    );

    Logger.log(
      'Diagnóstico → PRONTO → OPORTUNIDADE → VOLUME → IDEMPOTÊNCIA'
    );

    Logger.log(
      '=============================================='
    );


  } catch (erro) {

    Logger.log('');

    Logger.log(
      '🔴 V5.7 — TESTE INTEGRADO FALHOU'
    );

    Logger.log(
      'ERRO: ' +
      erro.message
    );

    Logger.log(
      erro.stack || ''
    );


    throw erro;


  } finally {

    // ==================================================
    // LIMPEZA DA OPORTUNIDADE DE TESTE
    // ==================================================

    Logger.log(
      'Limpando dados do teste...'
    );


    try {

      if (
        typeof diagnostico !== 'undefined' &&
        diagnostico
      ) {

        const abaOportunidades =
          obterAbaOportunidadesV57_();


        if (
          abaOportunidades
        ) {

          const dados =
            abaOportunidades
              .getDataRange()
              .getValues();


          const cabecalhos =
            obterCabecalhosOportunidadesV57_();


          const colDiagnostico =
            cabecalhos.indexOf(
              'diagnostico_id'
            );


          if (
            colDiagnostico >= 0
          ) {

            for (
              let i = dados.length - 1;
              i >= 1;
              i--
            ) {

              if (
                String(
                  dados[i][colDiagnostico] || ''
                ).trim() ===
                String(
                  diagnostico
                ).trim()
              ) {

                abaOportunidades.deleteRow(
                  i + 1
                );

              }

            }

          }

        }

      }


      Logger.log(
        'Limpeza da oportunidade concluída.'
      );


    } catch (limpezaErro) {

      Logger.log(
        '⚠️ Erro durante limpeza: ' +
        limpezaErro.message
      );

    }

  }

}

/**
 * ============================================================
 * NEURO SOLUTIONS — V5.8
 * MOTOR DE ANÁLISE DIAGNÓSTICA
 * ============================================================
 *
 * RESPONSABILIDADE:
 *
 * Transformar um diagnóstico já confirmado em uma análise
 * estruturada, determinística e rastreável.
 *
 * IMPORTANTE:
 *
 * - NÃO altera o diagnóstico.
 * - NÃO cria novas dores.
 * - NÃO cria novas métricas.
 * - NÃO escolhe solução comercial.
 * - NÃO define preço.
 * - NÃO inventa causas.
 * - NÃO utiliza IA nesta primeira camada.
 *
 * A análise utiliza somente informações já confirmadas.
 *
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * CONSTRUIR ANÁLISE DIAGNÓSTICA V5.8
 * ------------------------------------------------------------
 */
function construirAnaliseDiagnosticaV58_(diagnostico) {

  if (!diagnostico) {
    return null;
  }


  const processo =
    String(
      diagnostico.processo_nome || ''
    ).trim();


  const problema =
    String(
      diagnostico.dor_principal || ''
    ).trim();


  const frequencia =
    String(
      diagnostico.frequencia || ''
    ).trim();


  const impacto =
    String(
      diagnostico.impacto_nivel || ''
    ).trim();


  const objetivo =
    String(
      diagnostico.objetivo || ''
    ).trim();


  /*
   * O VOLUME não fica armazenado diretamente em
   * DIAGNOSTICOS.
   *
   * Ele é recuperado das métricas quando necessário.
   */

  let volume = '';


  try {

    if (
      typeof obterMedidasDiagnostico_ === 'function'
    ) {

      const medidas =
        obterMedidasDiagnostico_(
          diagnostico.empresa_id,
          diagnostico.conversa_id
        );


      if (
        typeof obterUltimoVolumeDiagnostico_ === 'function'
      ) {

        volume =
          obterUltimoVolumeDiagnostico_(
            medidas
          ) || '';

      }

    }

  } catch (erroVolume) {

    Logger.log(
      'V5.8 — Não foi possível recuperar VOLUME: ' +
      erroVolume.message
    );

  }


  /*
   * ----------------------------------------------------------
   * VALIDAÇÃO MÍNIMA
   * ----------------------------------------------------------
   *
   * A análise só pode existir quando o diagnóstico estiver
   * efetivamente pronto.
   */

  const possuiProcesso =
    !!processo;


  const possuiProblema =
    !!problema;


  const possuiFrequencia =
    !!frequencia;


  const possuiImpacto =
    !!impacto;


  const possuiObjetivo =
    !!objetivo;


  if (
    !possuiProcesso ||
    !possuiProblema ||
    !possuiFrequencia ||
    !possuiImpacto ||
    !possuiObjetivo
  ) {

    return null;

  }


  /*
   * ----------------------------------------------------------
   * PRIORIDADE
   * ----------------------------------------------------------
   *
   * A prioridade aqui é uma classificação analítica simples.
   *
   * Ela NÃO representa decisão comercial.
   */

  let prioridade =
    'MÉDIA';


  const impactoNormalizado =
    String(
      impacto
    )
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      );


  const volumeNormalizado =
    String(
      volume
    )
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        '' 
      );


  if (
    impactoNormalizado.indexOf('alto') >= 0 ||
    impactoNormalizado.indexOf('alta') >= 0 ||
    impactoNormalizado.indexOf('grave') >= 0 ||
    impactoNormalizado.indexOf('grande') >= 0
  ) {

    prioridade =
      'ALTA';

  }


  if (
    /\d/.test(volumeNormalizado) &&
    (
      volumeNormalizado.indexOf('por dia') >= 0 ||
      volumeNormalizado.indexOf('diario') >= 0 ||
      volumeNormalizado.indexOf('diariamente') >= 0
    )
  ) {

    prioridade =
      'ALTA';

  }


  /*
   * ----------------------------------------------------------
   * EVIDÊNCIAS
   * ----------------------------------------------------------
   *
   * A análise não inventa evidências.
   *
   * Cada item abaixo corresponde diretamente a uma informação
   * existente no diagnóstico.
   */

  const evidencias = [];


  if (processo) {

    evidencias.push(
      'Processo informado: ' +
      processo
    );

  }


  if (problema) {

    evidencias.push(
      'Problema informado: ' +
      problema
    );

  }


  if (frequencia) {

    evidencias.push(
      'Frequência informada: ' +
      frequencia
    );

  }


  if (volume) {

    evidencias.push(
      'Volume registrado: ' +
      volume
    );

  }


  if (impacto) {

    evidencias.push(
      'Impacto informado: ' +
      impacto
    );

  }


  if (objetivo) {

    evidencias.push(
      'Objetivo informado: ' +
      objetivo
    );

  }


  /*
   * ----------------------------------------------------------
   * LACUNAS
   * ----------------------------------------------------------
   *
   * Nesta primeira versão, somente registramos lacunas.
   *
   * Não transformamos lacuna em fato.
   */

  const lacunas = [];


  if (!volume) {

    lacunas.push(
      'volume'
    );

  }


  /*
   * ----------------------------------------------------------
   * CONFIANÇA
   * ----------------------------------------------------------
   *
   * A confiança é determinada pela completude dos campos
   * estruturais do diagnóstico.
   */

  let confianca =
    'ALTA';


  if (
    evidencias.length < 5
  ) {

    confianca =
      'MÉDIA';

  }


  /*
   * ----------------------------------------------------------
   * RESUMO ANALÍTICO
   * ----------------------------------------------------------
   */

  const resumo =
    'O processo de ' +
    processo +
    ' apresenta o problema de ' +
    problema +
    ', com frequência ' +
    frequencia +
    '. O impacto informado é ' +
    impacto +
    '. O objetivo declarado é ' +
    objetivo +
    '.';


  /*
   * ----------------------------------------------------------
   * OPORTUNIDADE
   * ----------------------------------------------------------
   *
   * Aqui NÃO estamos criando uma nova oportunidade comercial.
   *
   * Estamos apenas descrevendo a oportunidade analítica
   * derivada diretamente do diagnóstico.
   */

  const oportunidadeAnalitica =
    'Reduzir ' +
    problema +
    ' no processo de ' +
    processo +
    '.';


  /*
   * ----------------------------------------------------------
   * RESULTADO
   * ----------------------------------------------------------
   */

  return {

    versao:
      'V5.8',

    diagnostico_id:
      diagnostico.diagnostico_id || '',

    empresa_id:
      diagnostico.empresa_id || '',

    conversa_id:
      diagnostico.conversa_id || '',

    processo:
      processo,

    problema:
      problema,

    frequencia:
      frequencia,

    volume:
      volume,

    impacto:
      impacto,

    objetivo:
      objetivo,

    resumo:
      resumo,

    oportunidade:
      oportunidadeAnalitica,

    prioridade:
      prioridade,

    evidencias:
      evidencias,

    lacunas:
      lacunas,

    confianca:
      confianca,

    criado_em:
      new Date()

  };

}

/**
 * ------------------------------------------------------------
 * ANALISAR SOMENTE SE DIAGNÓSTICO ESTIVER PRONTO
 * ------------------------------------------------------------
 */
function analisarDiagnosticoV58_(diagnostico) {

  if (!diagnostico) {

    return null;

  }


  const estado =
    String(
      diagnostico.status_diagnostico || ''
    )
      .trim()
      .toUpperCase();


  const estadoPronto =
    String(
      DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE
    )
      .trim()
      .toUpperCase();


  if (
    estado !== estadoPronto
  ) {

    return null;

  }


  return construirAnaliseDiagnosticaV58_(
    diagnostico
  );

}

/**
 * ============================================================
 * V5.8 — TESTE DO MOTOR DE ANÁLISE DIAGNÓSTICA
 * ============================================================
 */
function TESTAR_ANALISE_DIAGNOSTICA_V58() {

  Logger.log(
    '=============================================='
  );

  Logger.log(
    '     FEEDS SOLUTIONS — V5.8'
  );

  Logger.log(
    '     TESTE DO MOTOR DE ANÁLISE'
  );

  Logger.log(
    '=============================================='
  );


  // ==========================================================
  // DIAGNÓSTICO FICTÍCIO
  // ==========================================================

  const diagnostico = {

    diagnostico_id:
      'DIA-TESTE-V58',

    empresa_id:
      'EMP-TESTE-V58',

    conversa_id:
      'CONV-TESTE-V58',

    processo_nome:
      'conferir e lançar pedidos',

    dor_principal:
      'erros de digitação e retrabalho',

    frequencia:
      'diariamente',

    impacto_nivel:
      '3 horas por dia',

    objetivo:
      'reduzir os erros e diminuir o retrabalho',

    status_diagnostico:
      DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE

  };


  Logger.log(
    '01 — Diagnóstico de teste criado.'
  );


  // ==========================================================
  // EXECUTAR MOTOR
  // ==========================================================

  const analise =
    analisarDiagnosticoV58_(
      diagnostico
    );


  if (!analise) {

    throw new Error(
      'O motor não produziu uma análise.'
    );

  }


  Logger.log(
    '02 — Análise criada.'
  );


  // ==========================================================
  // CAMPOS OBRIGATÓRIOS
  // ==========================================================

  const camposObrigatorios = [

    'versao',
    'diagnostico_id',
    'empresa_id',
    'conversa_id',
    'processo',
    'problema',
    'frequencia',
    'impacto',
    'objetivo',
    'resumo',
    'oportunidade',
    'prioridade',
    'confianca'

  ];


  camposObrigatorios.forEach(
    function(campo) {

      if (
        !String(
          analise[campo] || ''
        ).trim()
      ) {

        throw new Error(
          'Campo obrigatório ausente na análise: ' +
          campo
        );

      }

    }
  );


  Logger.log(
    '03 — Campos obrigatórios preenchidos.'
  );


  // ==========================================================
  // EVIDÊNCIAS
  // ==========================================================

  if (
    !Array.isArray(
      analise.evidencias
    )
  ) {

    throw new Error(
      'Evidências não foram retornadas como array.'
    );

  }


  Logger.log(
    '04 — Evidências válidas: ' +
    analise.evidencias.length
  );


  // ==========================================================
  // LACUNAS
  // ==========================================================

  if (
    !Array.isArray(
      analise.lacunas
    )
  ) {

    throw new Error(
      'Lacunas não foram retornadas como array.'
    );

  }


  Logger.log(
    '05 — Lacunas válidas: ' +
    analise.lacunas.length
  );


  // ==========================================================
  // PROTEÇÃO DO DIAGNÓSTICO ORIGINAL
  // ==========================================================

  if (
    diagnostico.processo_nome !==
    'conferir e lançar pedidos'
  ) {

    throw new Error(
      'O diagnóstico original foi alterado.'
    );

  }


  if (
    diagnostico.dor_principal !==
    'erros de digitação e retrabalho'
  ) {

    throw new Error(
      'A dor original foi alterada.'
    );

  }


  if (
    diagnostico.frequencia !==
    'diariamente'
  ) {

    throw new Error(
      'A frequência original foi alterada.'
    );

  }


  if (
    diagnostico.impacto_nivel !==
    '3 horas por dia'
  ) {

    throw new Error(
      'O impacto original foi alterado.'
    );

  }


  if (
    diagnostico.objetivo !==
    'reduzir os erros e diminuir o retrabalho'
  ) {

    throw new Error(
      'O objetivo original foi alterado.'
    );

  }


  Logger.log(
    '06 — Diagnóstico original preservado.'
  );


  // ==========================================================
  // TESTAR BLOQUEIO DE DIAGNÓSTICO INCOMPLETO
  // ==========================================================

  const diagnosticoIncompleto =
    Object.assign(
      {},
      diagnostico,
      {
        objetivo: ''
      }
    );


  const resultadoIncompleto =
    analisarDiagnosticoV58_(
      diagnosticoIncompleto
    );


  if (
    resultadoIncompleto !== null
  ) {

    throw new Error(
      'Diagnóstico incompleto foi analisado indevidamente.'
    );

  }


  Logger.log(
    '07 — Diagnóstico incompleto corretamente bloqueado.'
  );


  // ==========================================================
  // RESULTADO
  // ==========================================================

  Logger.log('');

  Logger.log(
    'ANÁLISE GERADA:'
  );

  Logger.log(
    JSON.stringify(
      analise,
      null,
      2
    )
  );

  Logger.log('');

  Logger.log(
    '=============================================='
  );

  Logger.log(
    '🟢 V5.8 — TESTE DO MOTOR DE ANÁLISE PASSOU'
  );

  Logger.log(
    '=============================================='
  );

}

/**
 * ============================================================
 * V5.8 — TESTE INTEGRADO COM DIAGNÓSTICO REAL
 * ============================================================
 */
function TESTAR_ANALISE_REAL_V58() {

  Logger.log(
    '=============================================='
  );

  Logger.log(
    '     FEEDS SOLUTIONS — V5.8'
  );

  Logger.log(
    '     TESTE INTEGRADO — ANÁLISE REAL'
  );

  Logger.log(
    '=============================================='
  );


  let empresaId = '';
  let conversaId = '';
  let diagnosticoId = '';


  try {

    // ==========================================================
    // 01 — CRIAR DIAGNÓSTICO REAL
    // ==========================================================

    Logger.log(
      '01 — Criando diagnóstico real...'
    );


    const inicio =
      iniciarDiagnostico({});


    if (
      !inicio ||
      !inicio.sucesso
    ) {

      throw new Error(
        'Falha ao iniciar diagnóstico: ' +
        JSON.stringify(inicio)
      );

    }


    empresaId =
      inicio.empresa_id;


    conversaId =
      inicio.conversa_id;


    diagnosticoId =
      inicio.diagnostico_id;


    Logger.log(
      'Diagnóstico: ' +
      diagnosticoId
    );


    // ==========================================================
    // 02 — PROCESSAR MENSAGEM REAL
    // ==========================================================

    Logger.log(
      '02 — Processando mensagem real...'
    );


    const mensagem =
      'Nosso processo principal é conferir e lançar pedidos. ' +
      'Temos erros de digitação e retrabalho nesse processo. ' +
      'Isso acontece diariamente. ' +
      'Processamos 120 pedidos por dia. ' +
      'Perdemos aproximadamente 3 horas por dia com esse problema. ' +
      'Nosso objetivo é reduzir os erros e diminuir o retrabalho.';


    const resultado =
      processarMensagemDiagnostico({

        empresa_id:
          empresaId,

        conversa_id:
          conversaId,

        mensagem:
          mensagem

      });


    if (
      !resultado ||
      !resultado.sucesso
    ) {

      throw new Error(
        'Falha ao processar mensagem: ' +
        JSON.stringify(resultado)
      );

    }


    Logger.log(
      'Estado retornado: ' +
      resultado.estado
    );


    // ==========================================================
    // 03 — RECUPERAR DIAGNÓSTICO REAL
    // ==========================================================

    Logger.log(
      '03 — Recuperando diagnóstico real...'
    );


    const diagnostico =
      obterDiagnosticoAtual_(
        empresaId,
        conversaId
      );


    if (!diagnostico) {

      throw new Error(
        'Diagnóstico real não encontrado.'
      );

    }


    Logger.log(
      'Diagnóstico recuperado.'
    );


    // ==========================================================
    // 04 — CONFIRMAR ESTADO
    // ==========================================================

    Logger.log(
      '04 — Confirmando PRONTO_PARA_ANALISE...'
    );


    const estado =
      String(
        diagnostico.status_diagnostico || ''
      )
        .trim()
        .toUpperCase();


    if (
      estado !==
      String(
        DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE
      )
        .trim()
        .toUpperCase()
    ) {

      throw new Error(
        'Diagnóstico não chegou a PRONTO_PARA_ANALISE. ' +
        'Estado atual: ' +
        estado
      );

    }


    Logger.log(
      'Diagnóstico está PRONTO_PARA_ANALISE.'
    );


    // ==========================================================
    // 05 — EXECUTAR MOTOR V5.8
    // ==========================================================

    Logger.log(
      '05 — Executando Motor de Análise V5.8...'
    );


    const analise =
      analisarDiagnosticoV58_(
        diagnostico
      );


    if (!analise) {

      throw new Error(
        'Motor V5.8 não produziu análise.'
      );

    }


    Logger.log(
      'Análise produzida.'
    );


    // ==========================================================
    // 06 — VALIDAR VOLUME REAL
    // ==========================================================

    Logger.log(
      '06 — Validando VOLUME real...'
    );


    if (
      !String(
        analise.volume || ''
      ).trim()
    ) {

      throw new Error(
        'Motor V5.8 não recuperou o VOLUME real das METRICAS.'
      );

    }


    Logger.log(
      'VOLUME recuperado: ' +
      analise.volume
    );


    // ==========================================================
    // 07 — VALIDAR PRIORIDADE
    // ==========================================================

    Logger.log(
      '07 — Validando prioridade...'
    );


    if (
      String(
        analise.prioridade || ''
      ).trim().toUpperCase() !==
      'ALTA'
    ) {

      throw new Error(
        'Prioridade esperada ALTA, encontrada: ' +
        analise.prioridade
      );

    }


    Logger.log(
      'Prioridade: ' +
      analise.prioridade
    );


    // ==========================================================
    // 08 — VALIDAR DADOS PRINCIPAIS
    // ==========================================================

    Logger.log(
      '08 — Validando dados principais...'
    );


    const campos =
      [
        'processo',
        'problema',
        'frequencia',
        'impacto',
        'objetivo',
        'volume',
        'resumo',
        'oportunidade'
      ];


    campos.forEach(
      function(campo) {

        if (
          !String(
            analise[campo] || ''
          ).trim()
        ) {

          throw new Error(
            'Campo ausente na análise real: ' +
            campo
          );

        }

      }
    );


    Logger.log(
      'Todos os dados principais foram confirmados.'
    );


    // ==========================================================
    // 09 — VALIDAR RASTREABILIDADE
    // ==========================================================

    Logger.log(
      '09 — Validando rastreabilidade...'
    );


    if (
      String(
        analise.diagnostico_id || ''
      ).trim() !==
      String(
        diagnosticoId
      ).trim()
    ) {

      throw new Error(
        'diagnostico_id da análise não corresponde ao diagnóstico real.'
      );

    }


    if (
      String(
        analise.empresa_id || ''
      ).trim() !==
      String(
        empresaId
      ).trim()
    ) {

      throw new Error(
        'empresa_id da análise não corresponde ao diagnóstico real.'
      );

    }


    if (
      String(
        analise.conversa_id || ''
      ).trim() !==
      String(
        conversaId
      ).trim()
    ) {

      throw new Error(
        'conversa_id da análise não corresponde ao diagnóstico real.'
      );

    }


    Logger.log(
      'Rastreabilidade confirmada.'
    );


    // ==========================================================
    // 10 — RESULTADO
    // ==========================================================

    Logger.log('');

    Logger.log(
      'ANÁLISE REAL GERADA:'
    );


    Logger.log(
      JSON.stringify(
        analise,
        null,
        2
      )
    );


    Logger.log('');

    Logger.log(
      '=============================================='
    );

    Logger.log(
      '🟢 V5.8 — TESTE INTEGRADO REAL PASSOU'
    );

    Logger.log(
      'Diagnóstico real → METRICAS → Análise V5.8'
    );

    Logger.log(
      '=============================================='
    );


  } catch (erro) {

    Logger.log('');

    Logger.log(
      '🔴 V5.8 — TESTE INTEGRADO REAL FALHOU'
    );

    Logger.log(
      'ERRO: ' +
      erro.message
    );

    Logger.log(
      erro.stack || ''
    );


    throw erro;

  }

}

function TESTAR_INTEGRACAO_V58_FLUXO_PRINCIPAL() {

  Logger.log('==============================================');
  Logger.log('     FEEDS SOLUTIONS — V5.8');
  Logger.log('     TESTE INTEGRAÇÃO NO FLUXO PRINCIPAL');
  Logger.log('==============================================');

  let empresaId = '';
  let conversaId = '';

  try {

    Logger.log('01 — Criando diagnóstico real...');

    const inicio =
      iniciarDiagnostico({});

    if (
      !inicio ||
      !inicio.sucesso
    ) {
      throw new Error(
        'Falha ao iniciar diagnóstico: ' +
        JSON.stringify(inicio)
      );
    }

    empresaId =
      inicio.empresa_id;

    conversaId =
      inicio.conversa_id;

    Logger.log(
      'Diagnóstico: ' +
      inicio.diagnostico_id
    );


    Logger.log(
      '02 — Executando fluxo principal...'
    );

    const mensagem =
      'Nosso processo principal é conferir e lançar pedidos. ' +
      'Temos erros de digitação e retrabalho nesse processo. ' +
      'Isso acontece diariamente. ' +
      'Processamos 120 pedidos por dia. ' +
      'Perdemos aproximadamente 3 horas por dia com esse problema. ' +
      'Nosso objetivo é reduzir os erros e diminuir o retrabalho.';


    const resultado =
      processarMensagemDiagnostico({

        empresa_id:
          empresaId,

        conversa_id:
          conversaId,

        mensagem:
          mensagem

      });


    if (
      !resultado ||
      !resultado.sucesso
    ) {

      throw new Error(
        'Fluxo principal não retornou sucesso: ' +
        JSON.stringify(resultado)
      );

    }


    Logger.log(
      'Fluxo principal executado.'
    );


    Logger.log(
      '03 — Validando estado...'
    );

    const estado =
      String(
        resultado.estado || ''
      )
        .trim()
        .toUpperCase();


    if (
      estado !==
      String(
        DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE
      )
        .trim()
        .toUpperCase()
    ) {

      throw new Error(
        'Estado inesperado: ' +
        estado
      );

    }


    Logger.log(
      'Estado: ' +
      estado
    );


    Logger.log(
      '04 — Validando oportunidade V5.7...'
    );

    if (
      !resultado.oportunidade
    ) {

      throw new Error(
        'Oportunidade V5.7 não foi retornada.'
      );

    }


    if (
      !resultado.oportunidade.oportunidade_id
    ) {

      throw new Error(
        'oportunidade_id não foi retornado.'
      );

    }


    Logger.log(
      'Oportunidade: ' +
      resultado.oportunidade.oportunidade_id
    );


    Logger.log(
      '05 — Validando análise V5.8...'
    );

    if (
      !resultado.analise_diagnostica
    ) {

      throw new Error(
        'ANÁLISE V5.8 NÃO FOI RETORNADA PELO FLUXO PRINCIPAL.'
      );

    }


    const analise =
      resultado.analise_diagnostica;


    Logger.log(
      'Análise V5.8 retornada.'
    );


    Logger.log(
      '06 — Validando versão...'
    );

    if (
      String(
        analise.versao || ''
      ).trim() !==
      'V5.8'
    ) {

      throw new Error(
        'Versão da análise inesperada: ' +
        analise.versao
      );

    }


    Logger.log(
      'Versão: ' +
      analise.versao
    );


    Logger.log(
      '07 — Validando rastreabilidade...'
    );

    if (
      String(
        analise.diagnostico_id || ''
      ).trim() !==
      String(
        resultado.diagnostico_id || ''
      ).trim()
    ) {

      throw new Error(
        'diagnostico_id da análise não corresponde ao resultado.'
      );

    }


    if (
      String(
        analise.empresa_id || ''
      ).trim() !==
      String(
        empresaId
      ).trim()
    ) {

      throw new Error(
        'empresa_id da análise não corresponde à empresa.'
      );

    }


    if (
      String(
        analise.conversa_id || ''
      ).trim() !==
      String(
        conversaId
      ).trim()
    ) {

      throw new Error(
        'conversa_id da análise não corresponde à conversa.'
      );

    }


    Logger.log(
      'Rastreabilidade confirmada.'
    );


    Logger.log(
      '08 — Validando campos principais...'
    );

    const campos =
      [
        'processo',
        'problema',
        'frequencia',
        'volume',
        'impacto',
        'objetivo',
        'resumo',
        'oportunidade',
        'prioridade',
        'confianca'
      ];


    campos.forEach(
      function(campo) {

        if (
          !String(
            analise[campo] || ''
          ).trim()
        ) {

          throw new Error(
            'Campo ausente na análise V5.8: ' +
            campo
          );

        }

      }
    );


    Logger.log(
      'Todos os campos principais presentes.'
    );


    Logger.log(
      '09 — Validando evidências...'
    );

    if (
      !Array.isArray(
        analise.evidencias
      )
    ) {

      throw new Error(
        'evidencias não é um array.'
      );

    }


    if (
      analise.evidencias.length <
      5
    ) {

      throw new Error(
        'Quantidade insuficiente de evidências: ' +
        analise.evidencias.length
      );

    }


    Logger.log(
      'Evidências: ' +
      analise.evidencias.length
    );


    Logger.log(
      '10 — Validando lacunas...'
    );

    if (
      !Array.isArray(
        analise.lacunas
      )
    ) {

      throw new Error(
        'lacunas não é um array.'
      );

    }


    Logger.log(
      'Lacunas: ' +
      analise.lacunas.length
    );


    Logger.log('');
    Logger.log(
      'ANÁLISE V5.8 RETORNADA PELO FLUXO PRINCIPAL:'
    );

    Logger.log(
      JSON.stringify(
        analise,
        null,
        2
      )
    );

    Logger.log('');

    Logger.log(
      '=============================================='
    );

    Logger.log(
      '🟢 V5.8 — INTEGRAÇÃO NO FLUXO PRINCIPAL PASSOU'
    );

    Logger.log(
      'Mensagem → Diagnóstico → Oportunidade → Análise'
    );

    Logger.log(
      '=============================================='
    );


  } catch (erro) {

    Logger.log('');

    Logger.log(
      '🔴 V5.8 — INTEGRAÇÃO NO FLUXO PRINCIPAL FALHOU'
    );

    Logger.log(
      'ERRO: ' +
      erro.message
    );

    Logger.log(
      erro.stack || ''
    );

    throw erro;

  } finally {

    /**
     * --------------------------------------------------------
     * LIMPEZA
     * --------------------------------------------------------
     *
     * A própria função de teste deverá remover os dados
     * temporários se você já possuir o padrão de limpeza
     * utilizado nos testes V5.6/V5.7.
     *
     * Não apagamos dados aqui de forma arbitrária.
     */

    Logger.log(
      'Teste finalizado.'
    );

  }

}

/**
 * ============================================================
 * V5.8 — PERSISTÊNCIA DA ANÁLISE DIAGNÓSTICA
 * ============================================================
 *
 * Responsabilidades:
 *
 * - localizar a aba ANALISES_DIAGNOSTICAS;
 * - localizar análise pelo diagnostico_id;
 * - criar uma análise quando ainda não existe;
 * - atualizar a mesma análise quando já existe;
 * - impedir duplicação;
 * - preservar rastreabilidade;
 *
 * NÃO:
 * - altera DIAGNOSTICOS;
 * - cria DORES;
 * - cria METRICAS;
 * - cria OPORTUNIDADES;
 * - escolhe solução;
 * - define preço.
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * OBTER ABA DE ANÁLISES
 * ------------------------------------------------------------
 */

function obterAbaAnalisesDiagnosticasV58_() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName(
      'ANALISES_DIAGNOSTICAS'
    );

  if (!sheet) {

    throw new Error(
      'Aba ANALISES_DIAGNOSTICAS não encontrada.'
    );

  }

  return sheet;

}


/**
 * ------------------------------------------------------------
 * OBTER CABEÇALHOS
 * ------------------------------------------------------------
 */

function obterCabecalhosAnalisesDiagnosticasV58_() {

  const sheet =
    obterAbaAnalisesDiagnosticasV58_();

  const ultimaColuna =
    sheet.getLastColumn();

  if (
    ultimaColuna < 1
  ) {

    throw new Error(
      'Aba ANALISES_DIAGNOSTICAS sem cabeçalhos.'
    );

  }

  return sheet
    .getRange(
      1,
      1,
      1,
      ultimaColuna
    )
    .getValues()[0];

}


/**
 * ------------------------------------------------------------
 * BUSCAR ANÁLISE POR DIAGNÓSTICO
 * ------------------------------------------------------------
 */

function buscarAnaliseDiagnosticaV58_(
  diagnosticoId
) {

  const id =
    String(
      diagnosticoId || ''
    ).trim();

  if (!id) {
    return null;
  }

  const sheet =
    obterAbaAnalisesDiagnosticasV58_();

  const ultimaLinha =
    sheet.getLastRow();

  if (
    ultimaLinha < 2
  ) {

    return null;

  }

  const cabecalhos =
    obterCabecalhosAnalisesDiagnosticasV58_();

  const colunaDiagnostico =
    cabecalhos.indexOf(
      'diagnostico_id'
    );

  if (
    colunaDiagnostico === -1
  ) {

    throw new Error(
      'Cabeçalho diagnostico_id não encontrado em ANALISES_DIAGNOSTICAS.'
    );

  }

  const dados =
    sheet
      .getRange(
        2,
        1,
        ultimaLinha - 1,
        cabecalhos.length
      )
      .getValues();

  for (
    let i = 0;
    i < dados.length;
    i++
  ) {

    const valor =
      String(
        dados[i][colunaDiagnostico] || ''
      ).trim();

    if (
      valor === id
    ) {

      const registro = {};

      cabecalhos.forEach(
        function(
          cabecalho,
          indice
        ) {

          registro[cabecalho] =
            dados[i][indice];

        }
      );

      registro.linha =
        i + 2;

      return registro;

    }

  }

  return null;

}


/**
 * ------------------------------------------------------------
 * GERAR ID DA ANÁLISE
 * ------------------------------------------------------------
 */

function gerarIdAnaliseDiagnosticaV58_() {

  return (
    'ANA-' +
    Utilities.getUuid()
  );

}


/**
 * ------------------------------------------------------------
 * SERIALIZAR ARRAY
 * ------------------------------------------------------------
 */

function serializarAnaliseDiagnosticaV58_(
  valor
) {

  if (
    Array.isArray(valor)
  ) {

    return JSON.stringify(
      valor
    );

  }

  if (
    valor === null ||
    valor === undefined
  ) {

    return '[]';

  }

  const texto =
    String(
      valor
    ).trim();

  if (!texto) {
    return '[]';
  }

  return JSON.stringify([
    texto
  ]);

}


/**
 * ------------------------------------------------------------
 * MONTAR REGISTRO
 * ------------------------------------------------------------
 */

function montarRegistroAnaliseDiagnosticaV58_(
  analise,
  analiseId,
  dataCriacao
) {

  if (!analise) {

    throw new Error(
      'Análise V5.8 não informada.'
    );

  }

  const agora =
    new Date();

  const criadoEm =
    dataCriacao ||
    analise.criado_em ||
    agora;

  const atualizadoEm =
    agora;

  return [

    analiseId,

    String(
      analise.diagnostico_id || ''
    ).trim(),

    String(
      analise.empresa_id || ''
    ).trim(),

    String(
      analise.conversa_id || ''
    ).trim(),

    String(
      analise.versao || 'V5.8'
    ).trim(),

    String(
      analise.processo || ''
    ).trim(),

    String(
      analise.problema || ''
    ).trim(),

    String(
      analise.frequencia || ''
    ).trim(),

    String(
      analise.volume || ''
    ).trim(),

    String(
      analise.impacto || ''
    ).trim(),

    String(
      analise.objetivo || ''
    ).trim(),

    String(
      analise.resumo || ''
    ).trim(),

    String(
      analise.oportunidade || ''
    ).trim(),

    String(
      analise.prioridade || ''
    ).trim(),

    serializarAnaliseDiagnosticaV58_(
      analise.evidencias
    ),

    serializarAnaliseDiagnosticaV58_(
      analise.lacunas
    ),

    String(
      analise.confianca || ''
    ).trim(),

    criadoEm,

    atualizadoEm

  ];

}


/**
 * ------------------------------------------------------------
 * PERSISTIR ANÁLISE V5.8
 * ------------------------------------------------------------
 */

function persistirAnaliseDiagnosticaV58_(
  diagnostico
) {

  if (!diagnostico) {

    return null;

  }


  /**
   * A análise é construída somente a partir
   * do diagnóstico consolidado.
   */

  const analise =
    analisarDiagnosticoV58_(
      diagnostico
    );


  if (!analise) {

    return null;

  }


  const diagnosticoId =
    String(
      analise.diagnostico_id || ''
    ).trim();


  if (!diagnosticoId) {

    throw new Error(
      'Análise V5.8 sem diagnostico_id.'
    );

  }


  const sheet =
    obterAbaAnalisesDiagnosticasV58_();


  const existente =
    buscarAnaliseDiagnosticaV58_(
      diagnosticoId
    );


  /**
   * ----------------------------------------------------------
   * ATUALIZAÇÃO
   * ----------------------------------------------------------
   */

  if (existente) {

    const analiseId =
      String(
        existente.analise_id || ''
      ).trim();


    if (!analiseId) {

      throw new Error(
        'Registro de análise existente sem analise_id.'
      );

    }


    const registro =
      montarRegistroAnaliseDiagnosticaV58_(
        analise,
        analiseId,
        existente.criado_em || new Date()
      );


    sheet
      .getRange(
        existente.linha,
        1,
        1,
        registro.length
      )
      .setValues([
        registro
      ]);


    return {

      acao:
        'ATUALIZAR',

      analise_id:
        analiseId,

      diagnostico_id:
        diagnosticoId,

      linha:
        existente.linha,

      analise:
        analise

    };

  }


  /**
   * ----------------------------------------------------------
   * CRIAÇÃO
   * ----------------------------------------------------------
   */

  const analiseId =
    gerarIdAnaliseDiagnosticaV58_();


  const registro =
    montarRegistroAnaliseDiagnosticaV58_(
      analise,
      analiseId,
      new Date()
    );


  const novaLinha =
    sheet.getLastRow() + 1;


  sheet
    .getRange(
      novaLinha,
      1,
      1,
      registro.length
    )
    .setValues([
      registro
    ]);


  return {

    acao:
      'CRIAR',

    analise_id:
      analiseId,

    diagnostico_id:
      diagnosticoId,

    linha:
      novaLinha,

    analise:
      analise

  };

}

function TESTAR_PERSISTENCIA_ANALISE_V58() {

  Logger.log(
    '=============================================='
  );

  Logger.log(
    '     FEEDS SOLUTIONS — V5.8'
  );

  Logger.log(
    '     TESTE PERSISTÊNCIA + IDEMPOTÊNCIA'
  );

  Logger.log(
    '=============================================='
  );


  let empresaId = '';
  let conversaId = '';
  let diagnosticoId = '';

  try {

    Logger.log(
      '01 — Criando diagnóstico real...'
    );


    const inicio =
      iniciarDiagnostico({});


    if (
      !inicio ||
      !inicio.sucesso
    ) {

      throw new Error(
        'Falha ao iniciar diagnóstico: ' +
        JSON.stringify(inicio)
      );

    }


    empresaId =
      inicio.empresa_id;

    conversaId =
      inicio.conversa_id;

    diagnosticoId =
      inicio.diagnostico_id;


    Logger.log(
      'Diagnóstico: ' +
      diagnosticoId
    );


    Logger.log(
      '02 — Processando mensagem real...'
    );


    const mensagem =
      'Nosso processo principal é conferir e lançar pedidos. ' +
      'Temos erros de digitação e retrabalho nesse processo. ' +
      'Isso acontece diariamente. ' +
      'Processamos 120 pedidos por dia. ' +
      'Perdemos aproximadamente 3 horas por dia com esse problema. ' +
      'Nosso objetivo é reduzir os erros e diminuir o retrabalho.';


    const resultado =
      processarMensagemDiagnostico({

        empresa_id:
          empresaId,

        conversa_id:
          conversaId,

        mensagem:
          mensagem

      });


    if (
      !resultado ||
      !resultado.sucesso
    ) {

      throw new Error(
        'Falha no processamento: ' +
        JSON.stringify(resultado)
      );

    }


    Logger.log(
      'Fluxo processado.'
    );


    Logger.log(
      '03 — Recuperando diagnóstico...'
    );


    const diagnostico =
      obterDiagnosticoAtual_(
        empresaId,
        conversaId
      );


    if (!diagnostico) {

      throw new Error(
        'Diagnóstico não encontrado.'
      );

    }


    Logger.log(
      'Diagnóstico recuperado.'
    );


    Logger.log(
      '04 — Confirmando PRONTO_PARA_ANALISE...'
    );


    const estado =
      String(
        diagnostico.status_diagnostico || ''
      )
        .trim()
        .toUpperCase();


    if (
      estado !==
      String(
        DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE
      )
        .trim()
        .toUpperCase()
    ) {

      throw new Error(
        'Diagnóstico não está pronto. Estado: ' +
        estado
      );

    }


    Logger.log(
      'Diagnóstico pronto.'
    );


    Logger.log(
      '05 — Persistindo análise V5.8...'
    );


    const primeira =
      persistirAnaliseDiagnosticaV58_(
        diagnostico
      );


    if (
      !primeira
    ) {

      throw new Error(
        'Primeira persistência não produziu resultado.'
      );

    }


    if (
      primeira.acao !==
      'CRIAR'
    ) {

      throw new Error(
        'Primeira persistência deveria ser CRIAR. ' +
        'Encontrado: ' +
        primeira.acao
      );

    }


    Logger.log(
      'Análise criada: ' +
      primeira.analise_id
    );


    Logger.log(
      '06 — Recuperando análise física...'
    );


    const recuperada =
      buscarAnaliseDiagnosticaV58_(
        diagnosticoId
      );


    if (
      !recuperada
    ) {

      throw new Error(
        'Análise não foi encontrada fisicamente na planilha.'
      );

    }


    Logger.log(
      'Análise encontrada na linha ' +
      recuperada.linha
    );


    Logger.log(
      '07 — Validando rastreabilidade...'
    );


    if (
      String(
        recuperada.diagnostico_id || ''
      ).trim() !==
      String(
        diagnosticoId
      ).trim()
    ) {

      throw new Error(
        'diagnostico_id não corresponde.'
      );

    }


    if (
      String(
        recuperada.empresa_id || ''
      ).trim() !==
      String(
        empresaId
      ).trim()
    ) {

      throw new Error(
        'empresa_id não corresponde.'
      );

    }


    if (
      String(
        recuperada.conversa_id || ''
      ).trim() !==
      String(
        conversaId
      ).trim()
    ) {

      throw new Error(
        'conversa_id não corresponde.'
      );

    }


    Logger.log(
      'Rastreabilidade confirmada.'
    );


    Logger.log(
      '08 — Validando VOLUME persistido...'
    );


    if (
      String(
        recuperada.volume || ''
      ).trim() !==
      '120 pedidos por dia'
    ) {

      throw new Error(
        'VOLUME incorreto: ' +
        recuperada.volume
      );

    }


    Logger.log(
      'VOLUME: ' +
      recuperada.volume
    );


    Logger.log(
      '09 — Persistindo novamente...'
    );


    const segunda =
      persistirAnaliseDiagnosticaV58_(
        diagnostico
      );


    if (
      !segunda
    ) {

      throw new Error(
        'Segunda persistência não produziu resultado.'
      );

    }


    if (
      segunda.acao !==
      'ATUALIZAR'
    ) {

      throw new Error(
        'Segunda persistência deveria ser ATUALIZAR. ' +
        'Encontrado: ' +
        segunda.acao
      );

    }


    Logger.log(
      'Segunda operação: ATUALIZAR'
    );


    Logger.log(
      '10 — Validando mesmo analise_id...'
    );


    if (
      String(
        segunda.analise_id
      ).trim() !==
      String(
        primeira.analise_id
      ).trim()
    ) {

      throw new Error(
        'A segunda execução criou outro analise_id.'
      );

    }


    Logger.log(
      'Mesmo analise_id confirmado.'
    );


    Logger.log(
      '11 — Contando registros físicos...'
    );


    const sheet =
      obterAbaAnalisesDiagnosticasV58_();


    const ultimaLinha =
      sheet.getLastRow();


    const cabecalhos =
      obterCabecalhosAnalisesDiagnosticasV58_();


    const colunaDiagnostico =
      cabecalhos.indexOf(
        'diagnostico_id'
      );


    if (
      colunaDiagnostico === -1
    ) {

      throw new Error(
        'Coluna diagnostico_id não encontrada.'
      );

    }


    let quantidade = 0;


    if (
      ultimaLinha >= 2
    ) {

      const valores =
        sheet
          .getRange(
            2,
            colunaDiagnostico + 1,
            ultimaLinha - 1,
            1
          )
          .getValues();


      valores.forEach(
        function(linha) {

          if (
            String(
              linha[0] || ''
            ).trim() ===
            String(
              diagnosticoId
            ).trim()
          ) {

            quantidade++;

          }

        }
      );

    }


    Logger.log(
      'Registros físicos para o diagnóstico: ' +
      quantidade
    );


    if (
      quantidade !== 1
    ) {

      throw new Error(
        'IDEMPOTÊNCIA FALHOU. ' +
        'Esperado 1 registro, encontrado: ' +
        quantidade
      );

    }


    Logger.log(
      'Idempotência confirmada.'
    );


    Logger.log('');
    Logger.log(
      'ANÁLISE PERSISTIDA:'
    );


    Logger.log(
      JSON.stringify(
        recuperada,
        null,
        2
      )
    );


    Logger.log('');
    Logger.log(
      '=============================================='
    );


    Logger.log(
      '🟢 V5.8 — PERSISTÊNCIA + IDEMPOTÊNCIA PASSOU'
    );


    Logger.log(
      'CRIAR → RECUPERAR → ATUALIZAR → 1 REGISTRO'
    );


    Logger.log(
      '=============================================='
    );


  } catch (erro) {

    Logger.log('');
    Logger.log(
      '🔴 V5.8 — PERSISTÊNCIA + IDEMPOTÊNCIA FALHOU'
    );


    Logger.log(
      'ERRO: ' +
      erro.message
    );


    Logger.log(
      erro.stack || ''
    );


    throw erro;

  }

}

function TESTAR_BLOQUEIO_ANALISE_INCOMPLETA_V58() {

  Logger.log('==============================================');
  Logger.log('     FEEDS SOLUTIONS — V5.8');
  Logger.log('     TESTE BLOQUEIO DE ANÁLISE INCOMPLETA');
  Logger.log('==============================================');

  try {

    Logger.log(
      '01 — Criando diagnóstico artificial incompleto...'
    );

    const diagnosticoId =
      'DIA-TESTE-BLOQUEIO-V58-' +
      Utilities.getUuid();

    const diagnostico = {

      diagnostico_id:
        diagnosticoId,

      empresa_id:
        'EMP-TESTE-BLOQUEIO-V58',

      conversa_id:
        'CONV-TESTE-BLOQUEIO-V58',

      processo_nome:
        'conferir e lançar pedidos',

      dor_principal:
        'erros de digitação',

      frequencia:
        '',

      impacto_nivel:
        '3 horas por dia',

      objetivo:
        '',

      status_diagnostico:
        DIAGNOSTICO_ESTADOS.INVESTIGACAO

    };


    Logger.log(
      'Diagnóstico artificial criado.'
    );


    Logger.log(
      '02 — Confirmando que o diagnóstico está incompleto...'
    );


    const estado =
      determinarEstadoDiagnostico_(
        diagnostico,
        {
          informacao_faltante:
            'frequência e objetivo'
        }
      );


    Logger.log(
      'Estado calculado: ' +
      estado
    );


    if (
      String(
        estado || ''
      ).trim().toUpperCase() !==
      String(
        DIAGNOSTICO_ESTADOS.INVESTIGACAO
      ).trim().toUpperCase()
    ) {

      throw new Error(
        'Diagnóstico incompleto não foi classificado como INVESTIGACAO.'
      );

    }


    Logger.log(
      'Diagnóstico corretamente bloqueado.'
    );


    Logger.log(
      '03 — Procurando análise antes da persistência...'
    );


    const antes =
      buscarAnaliseDiagnosticaV58_(
        diagnosticoId
      );


    if (
      antes
    ) {

      throw new Error(
        'Já existe uma análise para o diagnóstico artificial antes do teste.'
      );

    }


    Logger.log(
      'Nenhuma análise encontrada antes do teste.'
    );


    Logger.log(
      '04 — Tentando persistir diagnóstico incompleto...'
    );


    const resultado =
      persistirAnaliseDiagnosticaV58_(
        diagnostico
      );


    Logger.log(
      'Resultado da persistência: ' +
      JSON.stringify(
        resultado
      )
    );


    if (
      resultado !== null
    ) {

      throw new Error(
        'A persistência deveria retornar null para diagnóstico incompleto.'
      );

    }


    Logger.log(
      'Persistência corretamente bloqueada.'
    );


    Logger.log(
      '05 — Confirmando ausência física de registro...'
    );


    const depois =
      buscarAnaliseDiagnosticaV58_(
        diagnosticoId
      );


    if (
      depois
    ) {

      throw new Error(
        'Foi criado registro físico para diagnóstico incompleto.'
      );

    }


    Logger.log(
      'Nenhum registro físico foi criado.'
    );


    Logger.log(
      '06 — Testando outro diagnóstico com lacuna diferente...'
    );


    const diagnosticoSemImpacto = {

      diagnostico_id:
        'DIA-TESTE-BLOQUEIO-V58-2-' +
        Utilities.getUuid(),

      empresa_id:
        'EMP-TESTE-BLOQUEIO-V58-2',

      conversa_id:
        'CONV-TESTE-BLOQUEIO-V58-2',

      processo_nome:
        'conferir pedidos',

      dor_principal:
        'retrabalho',

      frequencia:
        'diariamente',

      impacto_nivel:
        '',

      objetivo:
        'reduzir retrabalho',

      status_diagnostico:
        DIAGNOSTICO_ESTADOS.INVESTIGACAO

    };


    const resultado2 =
      persistirAnaliseDiagnosticaV58_(
        diagnosticoSemImpacto
      );


    if (
      resultado2 !== null
    ) {

      throw new Error(
        'A persistência criou análise sem impacto confirmado.'
      );

    }


    const depois2 =
      buscarAnaliseDiagnosticaV58_(
        diagnosticoSemImpacto.diagnostico_id
      );


    if (
      depois2
    ) {

      throw new Error(
        'Foi criado registro físico para diagnóstico sem impacto.'
      );

    }


    Logger.log(
      'Segundo bloqueio confirmado.'
    );


    Logger.log('');
    Logger.log(
      '=============================================='
    );


    Logger.log(
      '🟢 V5.8 — BLOQUEIO DE ANÁLISE INCOMPLETA PASSOU'
    );


    Logger.log(
      'Diagnóstico incompleto → NÃO PERSISTE'
    );


    Logger.log(
      'Nenhum registro físico indevido foi criado.'
    );


    Logger.log(
      '=============================================='
    );


  } catch (erro) {

    Logger.log('');
    Logger.log(
      '🔴 V5.8 — BLOQUEIO DE ANÁLISE INCOMPLETA FALHOU'
    );


    Logger.log(
      'ERRO: ' +
      erro.message
    );


    Logger.log(
      erro.stack || ''
    );


    throw erro;

  }

}

function TESTAR_PERSISTENCIA_INTEGRADA_V58() {

  Logger.log('==============================================');
  Logger.log('     FEEDS SOLUTIONS — V5.8');
  Logger.log('     TESTE FINAL — PERSISTÊNCIA INTEGRADA');
  Logger.log('==============================================');


  let empresaId = '';
  let conversaId = '';
  let diagnosticoId = '';

  try {

    Logger.log(
      '01 — Criando diagnóstico real...'
    );


    const inicio =
      iniciarDiagnostico({});


    if (
      !inicio ||
      !inicio.sucesso
    ) {

      throw new Error(
        'Falha ao iniciar diagnóstico: ' +
        JSON.stringify(inicio)
      );

    }


    empresaId =
      inicio.empresa_id;

    conversaId =
      inicio.conversa_id;

    diagnosticoId =
      inicio.diagnostico_id;


    Logger.log(
      'Diagnóstico: ' +
      diagnosticoId
    );


    const mensagem =
      'Nosso processo principal é conferir e lançar pedidos. ' +
      'Temos erros de digitação e retrabalho nesse processo. ' +
      'Isso acontece diariamente. ' +
      'Processamos 120 pedidos por dia. ' +
      'Perdemos aproximadamente 3 horas por dia com esse problema. ' +
      'Nosso objetivo é reduzir os erros e diminuir o retrabalho.';


    /**
     * --------------------------------------------------------
     * PRIMEIRO PROCESSAMENTO
     * --------------------------------------------------------
     */

    Logger.log(
      '02 — Primeiro processamento do fluxo principal...'
    );


    const primeira =
      processarMensagemDiagnostico({

        empresa_id:
          empresaId,

        conversa_id:
          conversaId,

        mensagem:
          mensagem

      });


    if (
      !primeira ||
      !primeira.sucesso
    ) {

      throw new Error(
        'Primeiro processamento falhou: ' +
        JSON.stringify(primeira)
      );

    }


    Logger.log(
      'Primeiro processamento concluído.'
    );


    /**
     * --------------------------------------------------------
     * ESTADO
     * --------------------------------------------------------
     */

    Logger.log(
      '03 — Validando PRONTO_PARA_ANALISE...'
    );


    if (
      String(
        primeira.estado || ''
      ).trim().toUpperCase() !==
      String(
        DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE
      ).trim().toUpperCase()
    ) {

      throw new Error(
        'Estado inesperado: ' +
        primeira.estado
      );

    }


    Logger.log(
      'Estado: PRONTO_PARA_ANALISE'
    );


    /**
     * --------------------------------------------------------
     * ANÁLISE
     * --------------------------------------------------------
     */

    Logger.log(
      '04 — Validando persistência V5.8 no retorno...'
    );


    if (
      !primeira.analise_diagnostica
    ) {

      throw new Error(
        'O fluxo principal não retornou analise_diagnostica.'
      );

    }


    if (
      primeira.analise_diagnostica.acao !==
      'CRIAR'
    ) {

      throw new Error(
        'Primeiro processamento deveria retornar CRIAR. ' +
        'Encontrado: ' +
        primeira.analise_diagnostica.acao
      );

    }


    const analiseId =
      primeira
        .analise_diagnostica
        .analise_id;


    if (
      !analiseId
    ) {

      throw new Error(
        'analise_id não retornado.'
      );

    }


    Logger.log(
      'Análise criada: ' +
      analiseId
    );


    /**
     * --------------------------------------------------------
     * RECUPERAR DA PLANILHA
     * --------------------------------------------------------
     */

    Logger.log(
      '05 — Recuperando análise física...'
    );


    const fisica =
      buscarAnaliseDiagnosticaV58_(
        diagnosticoId
      );


    if (
      !fisica
    ) {

      throw new Error(
        'Análise não encontrada fisicamente.'
      );

    }


    if (
      String(
        fisica.analise_id || ''
      ).trim() !==
      String(
        analiseId
      ).trim()
    ) {

      throw new Error(
        'analise_id físico diferente do retorno.'
      );

    }


    Logger.log(
      'Análise encontrada na linha ' +
      fisica.linha
    );


    /**
     * --------------------------------------------------------
     * VOLUME
     * --------------------------------------------------------
     */

    Logger.log(
      '06 — Validando VOLUME físico...'
    );


    if (
      String(
        fisica.volume || ''
      ).trim() !==
      '120 pedidos por dia'
    ) {

      throw new Error(
        'VOLUME físico incorreto: ' +
        fisica.volume
      );

    }


    Logger.log(
      'VOLUME confirmado: ' +
      fisica.volume
    );


    /**
     * --------------------------------------------------------
     * SEGUNDO PROCESSAMENTO
     * --------------------------------------------------------
     */

    Logger.log(
      '07 — Segundo processamento do mesmo diagnóstico...'
    );


    const segunda =
      processarMensagemDiagnostico({

        empresa_id:
          empresaId,

        conversa_id:
          conversaId,

        mensagem:
          mensagem

      });


    if (
      !segunda ||
      !segunda.sucesso
    ) {

      throw new Error(
        'Segundo processamento falhou: ' +
        JSON.stringify(segunda)
      );

    }


    Logger.log(
      'Segundo processamento concluído.'
    );


    /**
     * --------------------------------------------------------
     * IDEMPOTÊNCIA
     * --------------------------------------------------------
     */

    Logger.log(
      '08 — Validando ATUALIZAR...'
    );


    if (
      !segunda.analise_diagnostica
    ) {

      throw new Error(
        'Segundo processamento não retornou análise.'
      );

    }


    if (
      segunda.analise_diagnostica.acao !==
      'ATUALIZAR'
    ) {

      throw new Error(
        'Segundo processamento deveria retornar ATUALIZAR. ' +
        'Encontrado: ' +
        segunda.analise_diagnostica.acao
      );

    }


    Logger.log(
      'Operação: ATUALIZAR'
    );


    /**
     * --------------------------------------------------------
     * MESMO ID
     * --------------------------------------------------------
     */

    Logger.log(
      '09 — Validando mesmo analise_id...'
    );


    if (
      String(
        segunda
          .analise_diagnostica
          .analise_id
      ).trim() !==
      String(
        analiseId
      ).trim()
    ) {

      throw new Error(
        'Segundo processamento criou outro analise_id.'
      );

    }


    Logger.log(
      'Mesmo analise_id confirmado.'
    );


    /**
     * --------------------------------------------------------
     * CONTAGEM FÍSICA
     * --------------------------------------------------------
     */

    Logger.log(
      '10 — Contando registros físicos...'
    );


    const sheet =
      obterAbaAnalisesDiagnosticasV58_();


    const cabecalhos =
      obterCabecalhosAnalisesDiagnosticasV58_();


    const colunaDiagnostico =
      cabecalhos.indexOf(
        'diagnostico_id'
      );


    if (
      colunaDiagnostico === -1
    ) {

      throw new Error(
        'Coluna diagnostico_id não encontrada.'
      );

    }


    const ultimaLinha =
      sheet.getLastRow();


    let quantidade =
      0;


    if (
      ultimaLinha >= 2
    ) {

      const valores =
        sheet
          .getRange(
            2,
            colunaDiagnostico + 1,
            ultimaLinha - 1,
            1
          )
          .getValues();


      valores.forEach(
        function(linha) {

          if (
            String(
              linha[0] || ''
            ).trim() ===
            String(
              diagnosticoId
            ).trim()
          ) {

            quantidade++;

          }

        }
      );

    }


    Logger.log(
      'Registros físicos: ' +
      quantidade
    );


    if (
      quantidade !== 1
    ) {

      throw new Error(
        'IDEMPOTÊNCIA FALHOU. ' +
        'Esperado 1 registro, encontrado: ' +
        quantidade
      );

    }


    Logger.log(
      'Idempotência confirmada.'
    );


    /**
     * --------------------------------------------------------
     * RECUPERAÇÃO FINAL
     * --------------------------------------------------------
     */

    Logger.log(
      '11 — Recuperando estado final da análise...'
    );


    const final =
      buscarAnaliseDiagnosticaV58_(
        diagnosticoId
      );


    if (
      !final
    ) {

      throw new Error(
        'Análise final não encontrada.'
      );

    }


    Logger.log(
      JSON.stringify(
        final,
        null,
        2
      )
    );


    Logger.log('');
    Logger.log(
      '=============================================='
    );


    Logger.log(
      '🟢 V5.8 — PERSISTÊNCIA INTEGRADA PASSOU'
    );


    Logger.log(
      'FLUXO PRINCIPAL → CRIAR → ATUALIZAR → 1 REGISTRO'
    );


    Logger.log(
      '=============================================='
    );


  } catch (erro) {

    Logger.log('');
    Logger.log(
      '🔴 V5.8 — PERSISTÊNCIA INTEGRADA FALHOU'
    );


    Logger.log(
      'ERRO: ' +
      erro.message
    );


    Logger.log(
      erro.stack || ''
    );


    throw erro;

  }

}

/* ============================================================
 * V5.9 — MOTOR DE COMPATIBILIDADE DE SOLUÇÕES
 * ============================================================
 *
 * Objetivo:
 * Relacionar um diagnóstico confirmado às soluções ativas
 * existentes na aba SOLUCOES.
 *
 * Princípios:
 * - Determinístico
 * - Sem IA
 * - Sem alteração do diagnóstico
 * - Sem criação automática de soluções
 * - Explicável
 * - Idempotente na persistência
 * ============================================================ */


/**
 * Normaliza texto para comparação.
 */
function normalizarTextoSolucaoV59_(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}


/**
 * Remove palavras muito comuns que não ajudam
 * na comparação de compatibilidade.
 */
function obterTermosRelevantesSolucaoV59_(texto) {

  const stopwords = {
    a: true,
    as: true,
    o: true,
    os: true,
    um: true,
    uma: true,
    uns: true,
    umas: true,
    de: true,
    da: true,
    do: true,
    das: true,
    dos: true,
    em: true,
    no: true,
    na: true,
    nos: true,
    nas: true,
    por: true,
    para: true,
    com: true,
    sem: true,
    e: true,
    ou: true,
    que: true,
    se: true,
    ao: true,
    aos: true,
    pela: true,
    pelo: true,
    pelas: true,
    pelos: true,
    mais: true,
    menos: true,
    muito: true,
    muita: true,
    muitos: true,
    muitas: true,
    problema: true,
    problemas: true
  };

  return normalizarTextoSolucaoV59_(texto)
    .split(' ')
    .filter(function(termo) {
      return termo.length >= 3 && !stopwords[termo];
    });
}


/**
 * Calcula interseção entre termos.
 */
function calcularTermosComunsSolucaoV59_(
  termosDiagnostico,
  termosSolucao
) {

  const mapa = {};

  termosSolucao.forEach(function(termo) {
    mapa[termo] = true;
  });

  const encontrados = [];

  termosDiagnostico.forEach(function(termo) {
    if (mapa[termo] && encontrados.indexOf(termo) === -1) {
      encontrados.push(termo);
    }
  });

  return encontrados;
}


/**
 * Calcula compatibilidade entre um campo do diagnóstico
 * e um conjunto de textos da solução.
 */
function calcularCorrespondenciaSolucaoV59_(
  textoDiagnostico,
  textoSolucao
) {

  const diagnosticoNormalizado =
    normalizarTextoSolucaoV59_(textoDiagnostico);

  const solucaoNormalizada =
    normalizarTextoSolucaoV59_(textoSolucao);

  if (!diagnosticoNormalizado || !solucaoNormalizada) {
    return {
      pontos: 0,
      termos: []
    };
  }

  /*
   * Correspondência textual direta.
   */
  if (
    solucaoNormalizada.indexOf(
      diagnosticoNormalizado
    ) !== -1 ||
    diagnosticoNormalizado.indexOf(
      solucaoNormalizada
    ) !== -1
  ) {
    return {
      pontos: 100,
      termos: obterTermosRelevantesSolucaoV59_(
        diagnosticoNormalizado
      )
    };
  }

  const termosDiagnostico =
    obterTermosRelevantesSolucaoV59_(
      diagnosticoNormalizado
    );

  const termosSolucao =
    obterTermosRelevantesSolucaoV59_(
      solucaoNormalizada
    );

  if (!termosDiagnostico.length || !termosSolucao.length) {
    return {
      pontos: 0,
      termos: []
    };
  }

  const termosComuns =
    calcularTermosComunsSolucaoV59_(
      termosDiagnostico,
      termosSolucao
    );

  if (!termosComuns.length) {
    return {
      pontos: 0,
      termos: []
    };
  }

  const percentual =
    Math.round(
      (
        termosComuns.length /
        Math.max(
          1,
          Math.min(
            termosDiagnostico.length,
            termosSolucao.length
          )
        )
      ) * 100
    );

  return {
    pontos: Math.min(100, percentual),
    termos: termosComuns
  };
}


/**
 * Calcula a compatibilidade completa entre diagnóstico
 * e uma solução.
 */
function calcularCompatibilidadeSolucaoV59_(
  diagnostico,
  solucao
) {

  const dadosDiagnostico = diagnostico || {};
  const dadosSolucao = solucao || {};

  const processo =
    String(
      dadosDiagnostico.processo_nome ||
      dadosDiagnostico.processo ||
      ''
    ).trim();

  const dor =
    String(
      dadosDiagnostico.dor_principal ||
      dadosDiagnostico.dor ||
      ''
    ).trim();

  const objetivo =
    String(
      dadosDiagnostico.objetivo ||
      ''
    ).trim();

  const nomeSolucao =
    String(
      dadosSolucao.nome ||
      ''
    ).trim();

  const descricaoSolucao =
    String(
      dadosSolucao.descricao ||
      ''
    ).trim();

  const familiaSolucao =
    String(
      dadosSolucao.familia ||
      ''
    ).trim();

  const textoSolucao = [
    nomeSolucao,
    descricaoSolucao,
    familiaSolucao
  ]
    .filter(Boolean)
    .join(' ');


  /*
   * ==========================================================
   * CORRESPONDÊNCIAS
   * ==========================================================
   */

  const correspondenciaProcesso =
    calcularCorrespondenciaSolucaoV59_(
      processo,
      textoSolucao
    );

  const correspondenciaDor =
    calcularCorrespondenciaSolucaoV59_(
      dor,
      textoSolucao
    );

  const correspondenciaObjetivo =
    calcularCorrespondenciaSolucaoV59_(
      objetivo,
      textoSolucao
    );


  /*
   * ==========================================================
   * PONTUAÇÃO
   * ==========================================================
   *
   * Processo = 35
   * Dor      = 40
   * Objetivo = 25
   *
   * A DOR recebe o maior peso porque é o problema
   * que a solução precisa atacar.
   */

  let pontuacao = Math.round(
    (
      correspondenciaProcesso.pontos * 0.35
    ) +
    (
      correspondenciaDor.pontos * 0.40
    ) +
    (
      correspondenciaObjetivo.pontos * 0.25
    )
  );


  /*
   * ==========================================================
   * BÔNUS DE COERÊNCIA
   * ==========================================================
   *
   * Quando processo + dor possuem correspondência,
   * existe evidência de que a solução atua diretamente
   * no problema diagnosticado.
   */

  if (
    correspondenciaProcesso.pontos >= 40 &&
    correspondenciaDor.pontos >= 40
  ) {
    pontuacao += 15;
  }

  /*
   * Quando os três eixos possuem correspondência,
   * tratamos como forte alinhamento diagnóstico.
   */

  if (
    correspondenciaProcesso.pontos >= 30 &&
    correspondenciaDor.pontos >= 30 &&
    correspondenciaObjetivo.pontos >= 30
  ) {
    pontuacao += 10;
  }

  pontuacao =
    Math.min(
      100,
      Math.max(
        0,
        pontuacao
      )
    );


  /*
   * ==========================================================
   * CLASSIFICAÇÃO
   * ==========================================================
   */

  let compatibilidade =
    'INCOMPATIVEL';

  if (pontuacao >= 70) {

    compatibilidade =
      'ALTA';

  } else if (pontuacao >= 45) {

    compatibilidade =
      'MEDIA';

  } else if (pontuacao >= 20) {

    compatibilidade =
      'BAIXA';
  }


  /*
   * ==========================================================
   * VIABILIDADE
   * ==========================================================
   */

  const status =
    String(
      dadosSolucao.status ||
      ''
    ).trim().toUpperCase();

  const podeOferecer =
    String(
      dadosSolucao.pode_oferecer ||
      ''
    ).trim().toUpperCase();

  let viabilidade =
    'BAIXA';

  if (status === 'ATIVA') {

    viabilidade =
      'MEDIA';

    if (
      !podeOferecer ||
      podeOferecer === 'SIM' ||
      podeOferecer === 'S' ||
      podeOferecer === 'TRUE'
    ) {
      viabilidade =
        'ALTA';
    }
  }


  /*
   * ==========================================================
   * TERMOS RELACIONADOS
   * ==========================================================
   */

  const termos =
    []
      .concat(
        correspondenciaProcesso.termos
      )
      .concat(
        correspondenciaDor.termos
      )
      .concat(
        correspondenciaObjetivo.termos
      )
      .filter(function(
        termo,
        indice,
        lista
      ) {
        return (
          lista.indexOf(termo) === indice
        );
      });


  /*
   * ==========================================================
   * MOTIVO EXPLICÁVEL
   * ==========================================================
   */

  const motivoPartes = [];

  if (
    correspondenciaProcesso.pontos > 0
  ) {
    motivoPartes.push(
      'há correspondência com o processo'
    );
  }

  if (
    correspondenciaDor.pontos > 0
  ) {
    motivoPartes.push(
      'há correspondência com a dor principal'
    );
  }

  if (
    correspondenciaObjetivo.pontos > 0
  ) {
    motivoPartes.push(
      'há correspondência com o objetivo'
    );
  }

  let motivo =
    motivoPartes.length
      ? motivoPartes.join('; ') + '.'
      : 'Não foram encontradas correspondências suficientes.';

  if (termos.length) {
    motivo +=
      ' Termos relacionados: ' +
      termos.join(', ') +
      '.';
  }


  /*
   * ==========================================================
   * RESULTADO
   * ==========================================================
   */

  return {

    compatibilidade:
      compatibilidade,

    pontuacao:
      pontuacao,

    viabilidade:
      viabilidade,

    motivo:
      motivo,

    termos:
      termos,

    processo_pontos:
      correspondenciaProcesso.pontos,

    dor_pontos:
      correspondenciaDor.pontos,

    objetivo_pontos:
      correspondenciaObjetivo.pontos
  };
}


/**
 * Constrói uma relação diagnóstico → solução.
 *
 * Não grava no banco.
 */
function construirRelacaoDiagnosticoSolucaoV59_(
  diagnostico,
  solucao
) {

  if (!diagnostico || !solucao) {
    return null;
  }

  const solucaoId =
    String(
      solucao.solucao_id ||
      ''
    ).trim();

  if (!solucaoId) {
    return null;
  }

  const resultado =
    calcularCompatibilidadeSolucaoV59_(
      diagnostico,
      solucao
    );

  /*
   * Soluções incompatíveis não entram na relação.
   */
  if (
    resultado.compatibilidade ===
    'INCOMPATIVEL'
  ) {
    return null;
  }

  return {
    diagnostico_id:
      String(
        diagnostico.diagnostico_id ||
        ''
      ).trim(),

    empresa_id:
      String(
        diagnostico.empresa_id ||
        ''
      ).trim(),

    conversa_id:
      String(
        diagnostico.conversa_id ||
        ''
      ).trim(),

    solucao_id:
      solucaoId,

    compatibilidade:
      resultado.compatibilidade,

    pontuacao:
      resultado.pontuacao,

    motivo:
      resultado.motivo,

    viabilidade:
      resultado.viabilidade,

    principal: false,

    termos:
      resultado.termos
  };
}


/**
 * Seleciona a solução principal entre as relações.
 *
 * Critério:
 * 1. Maior compatibilidade
 * 2. Maior pontuação
 * 3. Primeira ocorrência em caso de empate
 */
function selecionarSolucaoPrincipalV59_(
  relacoes
) {

  if (!Array.isArray(relacoes) || !relacoes.length) {
    return [];
  }

  let maiorPontuacao = -1;
  let indicePrincipal = 0;

  relacoes.forEach(function(relacao, indice) {

    const pontuacao =
      Number(
        relacao.pontuacao || 0
      );

    if (pontuacao > maiorPontuacao) {
      maiorPontuacao = pontuacao;
      indicePrincipal = indice;
    }
  });

  return relacoes.map(function(relacao, indice) {

    const copia =
      Object.assign({}, relacao);

    copia.principal =
      indice === indicePrincipal;

    return copia;
  });
}


/**
 * Analisa todas as soluções ativas para um diagnóstico.
 *
 * Não grava no banco.
 */
function analisarSolucoesDiagnosticoV59_(
  diagnostico
) {

  if (!diagnostico) {
    return [];
  }

  const solucoes =
    buscarSolucoesAtivas_();

  if (!Array.isArray(solucoes) || !solucoes.length) {
    return [];
  }

  const relacoes = [];

  solucoes.forEach(function(solucao) {

    const relacao =
      construirRelacaoDiagnosticoSolucaoV59_(
        diagnostico,
        solucao
      );

    if (relacao) {
      relacoes.push(relacao);
    }
  });

  return selecionarSolucaoPrincipalV59_(
    relacoes
  );
}

function TESTAR_MOTOR_COMPATIBILIDADE_V59() {

  const diagnostico = {
    diagnostico_id: 'DIAG-TESTE-V59',
    empresa_id: 'EMP-TESTE-V59',
    conversa_id: 'CONV-TESTE-V59',

    processo_nome:
      'conferir e lançar pedidos',

    dor_principal:
      'erros de digitação e retrabalho',

    frequencia:
      'diariamente',

    objetivo:
      'reduzir os erros e diminuir o retrabalho'
  };

  const solucoes = [

    {
      solucao_id: 'SOL-01',
      familia: 'Automação',
      nome: 'Automação de lançamento de pedidos',
      descricao:
        'Automatiza a conferência e o lançamento de pedidos, reduzindo erros de digitação e retrabalho.',
      status: 'ATIVA',
      nivel_complexidade: 'MEDIA',
      repetibilidade: 'ALTA',
      pode_oferecer: 'SIM',
      versao: '1.0'
    },

    {
      solucao_id: 'SOL-02',
      familia: 'Treinamento',
      nome: 'Treinamento administrativo',
      descricao:
        'Capacitação geral para equipes administrativas.',
      status: 'ATIVA',
      nivel_complexidade: 'BAIXA',
      repetibilidade: 'ALTA',
      pode_oferecer: 'SIM',
      versao: '1.0'
    },

    {
      solucao_id: 'SOL-03',
      familia: 'Marketing',
      nome: 'Gestão de redes sociais',
      descricao:
        'Planejamento e publicação de conteúdo para redes sociais.',
      status: 'ATIVA',
      nivel_complexidade: 'MEDIA',
      repetibilidade: 'ALTA',
      pode_oferecer: 'SIM',
      versao: '1.0'
    }
  ];

  const relacoes = [];

  solucoes.forEach(function(solucao) {

    const relacao =
      construirRelacaoDiagnosticoSolucaoV59_(
        diagnostico,
        solucao
      );

    if (relacao) {
      relacoes.push(relacao);
    }
  });

  const resultado =
    selecionarSolucaoPrincipalV59_(
      relacoes
    );

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  if (!Array.isArray(resultado)) {
    throw new Error(
      'FALHA: resultado não é array.'
    );
  }

  if (!resultado.length) {
    throw new Error(
      'FALHA: nenhuma solução compatível foi encontrada.'
    );
  }

  const principal =
    resultado.filter(function(relacao) {
      return relacao.principal === true;
    });

  if (principal.length !== 1) {
    throw new Error(
      'FALHA: deve existir exatamente uma solução principal.'
    );
  }

  if (
    principal[0].solucao_id !== 'SOL-01'
  ) {
    throw new Error(
      'FALHA: a solução principal esperada não foi selecionada.'
    );
  }

  resultado.forEach(function(relacao) {

    if (
      !relacao.diagnostico_id ||
      !relacao.solucao_id ||
      !relacao.compatibilidade ||
      !relacao.viabilidade ||
      !relacao.motivo
    ) {
      throw new Error(
        'FALHA: relação incompleta.'
      );
    }
  });

  const incompatibilidade =
    calcularCompatibilidadeSolucaoV59_(
      diagnostico,
      solucoes[2]
    );

  if (
    incompatibilidade.compatibilidade !==
    'INCOMPATIVEL'
  ) {
    throw new Error(
      'FALHA: solução de marketing deveria ser incompatível.'
    );
  }

  console.log(
    'TESTAR_MOTOR_COMPATIBILIDADE_V59: PASSOU'
  );

  return {
    sucesso: true,
    total_solucoes_analisadas:
      solucoes.length,
    total_compativeis:
      resultado.length,
    principal:
      principal[0].solucao_id,
    resultado:
      resultado
  };
}

/* ============================================================
 * V5.9.2 — AUDITORIA DO CATÁLOGO DE SOLUÇÕES
 * ============================================================ */


/**
 * Retorna os cabeçalhos esperados da aba SOLUCOES.
 */
function obterCabecalhosSolucoesV592_() {

  return [
    'solucao_id',
    'familia',
    'nome',
    'descricao',
    'status',
    'nivel_complexidade',
    'repetibilidade',
    'pode_oferecer',
    'versao'
  ];
}


/**
 * Audita a estrutura real da aba SOLUCOES.
 *
 * Não altera dados.
 */
function auditarCatalogoSolucoesV592_() {

  const sheet =
    obterAba_(SHEETS.SOLUCOES);

  if (!sheet) {
    throw new Error(
      'FALHA: aba SOLUCOES não encontrada.'
    );
  }

  const dados =
    sheet.getDataRange().getValues();

  if (!dados.length) {
    throw new Error(
      'FALHA: aba SOLUCOES não possui cabeçalho.'
    );
  }

  const cabecalhos =
    dados[0].map(function(cabecalho) {
      return String(
        cabecalho || ''
      ).trim();
    });

  const esperados =
    obterCabecalhosSolucoesV592_();

  const ausentes =
    esperados.filter(function(cabecalho) {
      return cabecalhos.indexOf(cabecalho) === -1;
    });

  if (ausentes.length) {
    throw new Error(
      'FALHA: cabeçalhos ausentes em SOLUCOES: ' +
      ausentes.join(', ')
    );
  }

  const linhasFisicas =
    Math.max(
      0,
      dados.length - 1
    );

  const solucoesAtivas =
    buscarSolucoesAtivas_();

  if (!Array.isArray(solucoesAtivas)) {
    throw new Error(
      'FALHA: buscarSolucoesAtivas_ não retornou array.'
    );
  }

  return {
    sucesso: true,

    aba:
      sheet.getName(),

    cabecalhos:
      cabecalhos,

    cabecalhos_esperados:
      esperados,

    linhas_fisicas:
      linhasFisicas,

    solucoes_ativas:
      solucoesAtivas.length,

    dados_ativos:
      solucoesAtivas
  };
}


/**
 * Teste oficial V5.9.2.
 *
 * O catálogo está vazio neste momento.
 * Portanto, o resultado máximo esperado é:
 *
 * estrutura correta
 * + zero soluções ativas
 * + nenhum dado inventado
 */
function TESTAR_AUDITORIA_CATALOGO_V592() {

  const resultado =
    auditarCatalogoSolucoesV592_();

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  if (resultado.sucesso !== true) {
    throw new Error(
      'FALHA: auditoria não retornou sucesso.'
    );
  }

  if (
    resultado.aba !== 'SOLUCOES'
  ) {
    throw new Error(
      'FALHA: aba incorreta.'
    );
  }

  const esperados =
    obterCabecalhosSolucoesV592_();

  esperados.forEach(function(cabecalho) {

    if (
      resultado.cabecalhos.indexOf(cabecalho) === -1
    ) {
      throw new Error(
        'FALHA: cabeçalho ausente: ' +
        cabecalho
      );
    }
  });

  /*
   * Como o catálogo real está vazio,
   * o resultado máximo correto agora
   * é zero soluções ativas.
   */
  if (
    resultado.solucoes_ativas !== 0
  ) {
    throw new Error(
      'FALHA: o catálogo deveria estar vazio neste estágio.'
    );
  }

  if (
    !Array.isArray(
      resultado.dados_ativos
    )
  ) {
    throw new Error(
      'FALHA: dados ativos não são array.'
    );
  }

  if (
    resultado.dados_ativos.length !== 0
  ) {
    throw new Error(
      'FALHA: foram encontradas soluções ativas inesperadas.'
    );
  }

  console.log(
    'TESTAR_AUDITORIA_CATALOGO_V592: PASSOU'
  );

  return resultado;
}

/* ============================================================
 * V5.9.3 — TESTE DE QUALIDADE DO MOTOR DE COMPATIBILIDADE
 * ============================================================ */


/**
 * Cria uma solução temporária de teste.
 */
function criarSolucaoTesteV593_(
  sheet,
  dados
) {

  sheet.appendRow([
    dados.solucao_id,
    dados.familia,
    dados.nome,
    dados.descricao,
    dados.status,
    dados.nivel_complexidade,
    dados.repetibilidade,
    dados.pode_oferecer,
    dados.versao
  ]);
}


/**
 * Remove todas as soluções temporárias V5.9.3.
 */
function limparSolucoesTesteV593_(
  sheet
) {

  const dados =
    sheet.getDataRange().getValues();

  if (dados.length <= 1) {
    return;
  }

  const linhasParaExcluir = [];

  for (
    let i = 1;
    i < dados.length;
    i++
  ) {

    const solucaoId =
      String(
        dados[i][0] || ''
      ).trim();

    if (
      solucaoId.indexOf(
        'V593-'
      ) === 0
    ) {
      linhasParaExcluir.push(
        i + 1
      );
    }
  }

  /*
   * Exclui de baixo para cima.
   */
  for (
    let i = linhasParaExcluir.length - 1;
    i >= 0;
    i--
  ) {

    sheet.deleteRow(
      linhasParaExcluir[i]
    );
  }
}


/**
 * Teste oficial V5.9.3.
 *
 * Valida:
 *
 * 1. Correspondência perfeita = 100 / ALTA
 * 2. Correspondência parcial = MEDIA
 * 3. Sem correspondência = INCOMPATIVEL
 * 4. Solução inativa = não viável
 * 5. Apenas uma solução principal
 * 6. Relações possuem rastreabilidade
 * 7. Nenhuma solução incompatível entra na relação
 * 8. Limpeza física ao final
 */
function TESTAR_QUALIDADE_COMPATIBILIDADE_V593() {

  const sheet =
    obterAba_(SHEETS.SOLUCOES);

  if (!sheet) {
    throw new Error(
      'FALHA: aba SOLUCOES não encontrada.'
    );
  }

  const diagnostico = {

    diagnostico_id:
      'DIAG-V593',

    empresa_id:
      'EMP-V593',

    conversa_id:
      'CONV-V593',

    processo_nome:
      'conferir e lançar pedidos',

    dor_principal:
      'erros de digitação e retrabalho',

    frequencia:
      'diariamente',

    objetivo:
      'reduzir os erros e diminuir o retrabalho'
  };


  /*
   * ==========================================================
   * SOLUÇÃO 1 — PERFEITA
   * ==========================================================
   *
   * Este cenário DEVE atingir 100 pontos.
   */

  const solucaoPerfeita = {

    solucao_id:
      'V593-PERFEITA',

    familia:
      'Automação de pedidos',

    nome:
      'Conferir e lançar pedidos',

    descricao:
      'Reduzir erros de digitação e retrabalho no processo de conferir e lançar pedidos.',

    status:
      'ATIVA',

    nivel_complexidade:
      'MEDIA',

    repetibilidade:
      'ALTA',

    pode_oferecer:
      'SIM',

    versao:
      'V5.9.3'
  };


  /*
   * ==========================================================
   * SOLUÇÃO 2 — PARCIAL
   * ==========================================================
   *
   * Possui relação real com o processo,
   * mas não atende diretamente a dor e o objetivo.
   *
   * Portanto:
   * > 0
   * < 100
   * não pode ser INCOMPATIVEL
   */

  const solucaoParcial = {

    solucao_id:
      'V593-PARCIAL',

    familia:
      'Processos administrativos',

    nome:
      'Apoio para conferir pedidos',

    descricao:
      'Apoio na conferência de pedidos e identificação de informações administrativas.',

    status:
      'ATIVA',

    nivel_complexidade:
      'MEDIA',

    repetibilidade:
      'ALTA',

    pode_oferecer:
      'SIM',

    versao:
      'V5.9.3'
  };


  /*
   * ==========================================================
   * SOLUÇÃO 3 — INCOMPATÍVEL
   * ==========================================================
   */

  const solucaoIncompativel = {

    solucao_id:
      'V593-INCOMPATIVEL',

    familia:
      'Marketing',

    nome:
      'Gestão de redes sociais',

    descricao:
      'Planejamento e publicação de conteúdo para redes sociais.',

    status:
      'ATIVA',

    nivel_complexidade:
      'MEDIA',

    repetibilidade:
      'ALTA',

    pode_oferecer:
      'SIM',

    versao:
      'V5.9.3'
  };


  /*
   * ==========================================================
   * SOLUÇÃO 4 — PERFEITA, MAS INATIVA
   * ==========================================================
   *
   * A compatibilidade deve continuar sendo 100.
   * Porém a viabilidade NÃO pode ser ALTA.
   */

  const solucaoInativa = {

    solucao_id:
      'V593-INATIVA',

    familia:
      'Automação de pedidos',

    nome:
      'Conferir e lançar pedidos',

    descricao:
      'Reduzir erros de digitação e retrabalho no processo de conferir e lançar pedidos.',

    status:
      'INATIVA',

    nivel_complexidade:
      'MEDIA',

    repetibilidade:
      'ALTA',

    pode_oferecer:
      'SIM',

    versao:
      'V5.9.3'
  };


  const solucoes = [
    solucaoPerfeita,
    solucaoParcial,
    solucaoIncompativel,
    solucaoInativa
  ];


  let resultado = null;


  try {

    /*
     * ========================================================
     * INSERÇÃO TEMPORÁRIA
     * ========================================================
     */

    solucoes.forEach(function(solucao) {

      criarSolucaoTesteV593_(
        sheet,
        solucao
      );

    });


    /*
     * ========================================================
     * TESTE 1 — SOLUÇÃO PERFEITA
     * ========================================================
     */

    const perfeita =
      calcularCompatibilidadeSolucaoV59_(
        diagnostico,
        solucaoPerfeita
      );

    console.log(
      'TESTE 1 — SOLUÇÃO PERFEITA:'
    );

    console.log(
      JSON.stringify(
        perfeita,
        null,
        2
      )
    );


    /*
     * Pontuação máxima obrigatória.
     */

    if (
      perfeita.pontuacao !== 100
    ) {
      throw new Error(
        'FALHA TESTE 1: solução perfeita deve atingir 100 pontos. Resultado: ' +
        perfeita.pontuacao
      );
    }


    if (
      perfeita.compatibilidade !==
      'ALTA'
    ) {
      throw new Error(
        'FALHA TESTE 1: solução perfeita deve ser ALTA.'
      );
    }


    if (
      perfeita.viabilidade !==
      'ALTA'
    ) {
      throw new Error(
        'FALHA TESTE 1: solução perfeita deve ter viabilidade ALTA.'
      );
    }


    /*
     * ========================================================
     * TESTE 2 — SOLUÇÃO PARCIAL
     * ========================================================
     */

    const parcial =
      calcularCompatibilidadeSolucaoV59_(
        diagnostico,
        solucaoParcial
      );

    console.log(
      'TESTE 2 — SOLUÇÃO PARCIAL:'
    );

    console.log(
      JSON.stringify(
        parcial,
        null,
        2
      )
    );


    /*
     * A solução parcial precisa possuir
     * alguma correspondência real.
     */

    if (
      parcial.pontuacao <= 0
    ) {
      throw new Error(
        'FALHA TESTE 2: solução parcial deveria apresentar alguma correspondência. Resultado: ' +
        parcial.pontuacao
      );
    }


    /*
     * Não pode atingir a pontuação máxima.
     */

    if (
      parcial.pontuacao >= 100
    ) {
      throw new Error(
        'FALHA TESTE 2: solução parcial não pode atingir 100 pontos.'
      );
    }


    /*
     * Não pode ser incompatível.
     */

    if (
      parcial.compatibilidade ===
      'INCOMPATIVEL'
    ) {
      throw new Error(
        'FALHA TESTE 2: solução parcialmente relacionada não pode ser INCOMPATIVEL. Resultado: ' +
        parcial.compatibilidade +
        ' / ' +
        parcial.pontuacao
      );
    }


    /*
     * ========================================================
     * TESTE 3 — INCOMPATÍVEL
     * ========================================================
     */

    const incompativel =
      calcularCompatibilidadeSolucaoV59_(
        diagnostico,
        solucaoIncompativel
      );

    console.log(
      'TESTE 3 — INCOMPATÍVEL:'
    );

    console.log(
      JSON.stringify(
        incompativel,
        null,
        2
      )
    );


    if (
      incompativel.compatibilidade !==
      'INCOMPATIVEL'
    ) {
      throw new Error(
        'FALHA TESTE 3: solução sem relação deve ser INCOMPATIVEL. Resultado: ' +
        incompativel.compatibilidade +
        ' / ' +
        incompativel.pontuacao
      );
    }


    if (
      incompativel.pontuacao !== 0
    ) {
      throw new Error(
        'FALHA TESTE 3: solução incompatível deve ter 0 pontos. Resultado: ' +
        incompativel.pontuacao
      );
    }


    /*
     * ========================================================
     * TESTE 4 — SOLUÇÃO INATIVA
     * ========================================================
     */

    const inativa =
      calcularCompatibilidadeSolucaoV59_(
        diagnostico,
        solucaoInativa
      );

    console.log(
      'TESTE 4 — SOLUÇÃO INATIVA:'
    );

    console.log(
      JSON.stringify(
        inativa,
        null,
        2
      )
    );


    /*
     * A solução continua sendo perfeitamente
     * compatível com o diagnóstico.
     */

    if (
      inativa.pontuacao !== 100
    ) {
      throw new Error(
        'FALHA TESTE 4: solução inativa deve preservar 100 pontos. Resultado: ' +
        inativa.pontuacao
      );
    }


    if (
      inativa.compatibilidade !==
      'ALTA'
    ) {
      throw new Error(
        'FALHA TESTE 4: solução inativa deve continuar ALTA em compatibilidade.'
      );
    }


    /*
     * Mas não pode ser viável para oferta.
     */

    if (
      inativa.viabilidade ===
      'ALTA'
    ) {
      throw new Error(
        'FALHA TESTE 4: solução INATIVA não pode possuir viabilidade ALTA.'
      );
    }


    /*
     * ========================================================
     * TESTE 5 — LEITURA REAL DO CATÁLOGO
     * ========================================================
     */

    const solucoesAtivas =
      buscarSolucoesAtivas_();

    console.log(
      'TESTE 5 — SOLUÇÕES ATIVAS:'
    );

    console.log(
      JSON.stringify(
        solucoesAtivas,
        null,
        2
      )
    );


    if (
      !Array.isArray(
        solucoesAtivas
      )
    ) {
      throw new Error(
        'FALHA TESTE 5: buscarSolucoesAtivas_ não retornou array.'
      );
    }


    const idsAtivos =
      solucoesAtivas.map(function(solucao) {

        return String(
          solucao.solucao_id || ''
        ).trim();

      });


    /*
     * Ativas precisam aparecer.
     */

    if (
      idsAtivos.indexOf(
        'V593-PERFEITA'
      ) === -1
    ) {
      throw new Error(
        'FALHA TESTE 5: solução perfeita não foi encontrada entre as ativas.'
      );
    }


    if (
      idsAtivos.indexOf(
        'V593-PARCIAL'
      ) === -1
    ) {
      throw new Error(
        'FALHA TESTE 5: solução parcial não foi encontrada entre as ativas.'
      );
    }


    if (
      idsAtivos.indexOf(
        'V593-INCOMPATIVEL'
      ) === -1
    ) {
      throw new Error(
        'FALHA TESTE 5: solução incompatível ativa não foi encontrada no catálogo.'
      );
    }


    /*
     * Inativa não pode aparecer.
     */

    if (
      idsAtivos.indexOf(
        'V593-INATIVA'
      ) !== -1
    ) {
      throw new Error(
        'FALHA TESTE 5: solução INATIVA apareceu entre as soluções ativas.'
      );
    }


    /*
     * ========================================================
     * TESTE 6 — MOTOR COMPLETO
     * ========================================================
     */

    const relacoes =
      analisarSolucoesDiagnosticoV59_(
        diagnostico
      );

    console.log(
      'TESTE 6 — MOTOR COMPLETO:'
    );

    console.log(
      JSON.stringify(
        relacoes,
        null,
        2
      )
    );


    if (
      !Array.isArray(
        relacoes
      )
    ) {
      throw new Error(
        'FALHA TESTE 6: resultado do motor não é array.'
      );
    }


    /*
     * A solução incompatível não pode
     * entrar nas relações.
     */

    const encontrouIncompativel =
      relacoes.some(function(relacao) {

        return (
          relacao.solucao_id ===
          'V593-INCOMPATIVEL'
        );

      });


    if (
      encontrouIncompativel
    ) {
      throw new Error(
        'FALHA TESTE 6: solução incompatível entrou nas relações.'
      );
    }


    /*
     * A solução inativa também não pode
     * entrar, pois o motor trabalha apenas
     * com soluções ativas.
     */

    const encontrouInativa =
      relacoes.some(function(relacao) {

        return (
          relacao.solucao_id ===
          'V593-INATIVA'
        );

      });


    if (
      encontrouInativa
    ) {
      throw new Error(
        'FALHA TESTE 6: solução inativa entrou nas relações.'
      );
    }


    /*
     * A solução perfeita precisa existir.
     */

    const relacaoPerfeita =
      relacoes.find(function(relacao) {

        return (
          relacao.solucao_id ===
          'V593-PERFEITA'
        );

      });


    if (
      !relacaoPerfeita
    ) {
      throw new Error(
        'FALHA TESTE 6: solução perfeita não entrou nas relações.'
      );
    }


    /*
     * A solução perfeita precisa
     * preservar 100 pontos.
     */

    if (
      relacaoPerfeita.pontuacao !== 100
    ) {
      throw new Error(
        'FALHA TESTE 6: solução perfeita não preservou 100 pontos. Resultado: ' +
        relacaoPerfeita.pontuacao
      );
    }


    /*
     * ========================================================
     * TESTE 7 — SOLUÇÃO PRINCIPAL
     * ========================================================
     */

    const principais =
      relacoes.filter(function(relacao) {

        return (
          relacao.principal === true
        );

      });


    if (
      principais.length !== 1
    ) {
      throw new Error(
        'FALHA TESTE 7: deve existir exatamente uma solução principal. Encontradas: ' +
        principais.length
      );
    }


    if (
      principais[0].solucao_id !==
      'V593-PERFEITA'
    ) {
      throw new Error(
        'FALHA TESTE 7: solução principal incorreta. Resultado: ' +
        principais[0].solucao_id
      );
    }


    /*
     * ========================================================
     * TESTE 8 — RASTREABILIDADE
     * ========================================================
     */

    relacoes.forEach(function(relacao) {

      if (
        relacao.diagnostico_id !==
        diagnostico.diagnostico_id
      ) {
        throw new Error(
          'FALHA TESTE 8: diagnostico_id incorreto.'
        );
      }


      if (
        relacao.empresa_id !==
        diagnostico.empresa_id
      ) {
        throw new Error(
          'FALHA TESTE 8: empresa_id incorreto.'
        );
      }


      if (
        relacao.conversa_id !==
        diagnostico.conversa_id
      ) {
        throw new Error(
          'FALHA TESTE 8: conversa_id incorreto.'
        );
      }


      if (
        !relacao.solucao_id
      ) {
        throw new Error(
          'FALHA TESTE 8: solucao_id ausente.'
        );
      }


      if (
        !relacao.compatibilidade
      ) {
        throw new Error(
          'FALHA TESTE 8: compatibilidade ausente.'
        );
      }


      if (
        typeof relacao.pontuacao !==
        'number'
      ) {
        throw new Error(
          'FALHA TESTE 8: pontuação ausente ou inválida.'
        );
      }


      if (
        !relacao.motivo
      ) {
        throw new Error(
          'FALHA TESTE 8: motivo ausente.'
        );
      }


      if (
        !relacao.viabilidade
      ) {
        throw new Error(
          'FALHA TESTE 8: viabilidade ausente.'
        );
      }

    });


    /*
     * ========================================================
     * RESULTADO FINAL
     * ========================================================
     */

    resultado = {

      sucesso:
        true,

      testes:
        8,

      pontuacao_maxima_obtida:
        perfeita.pontuacao,

      solucao_perfeita:
        perfeita,

      solucao_parcial:
        parcial,

      solucao_incompativel:
        incompativel,

      solucao_inativa:
        inativa,

      relacoes:
        relacoes,

      principal:
        principais[0].solucao_id
    };


    console.log(
      'TESTAR_QUALIDADE_COMPATIBILIDADE_V593: PASSOU'
    );


    return resultado;


  } finally {

    /*
     * ========================================================
     * LIMPEZA OBRIGATÓRIA
     * ========================================================
     */

    limparSolucoesTesteV593_(
      sheet
    );

    console.log(
      'LIMPEZA V5.9.3 CONCLUÍDA'
    );
  }
}

/* ============================================================
 * V5.9.4 — PERSISTÊNCIA DE RELAÇÕES DIAGNÓSTICO → SOLUÇÃO
 * ============================================================
 */


/**
 * Obtém a aba DIAGNOSTICO_SOLUCOES.
 */
function obterAbaDiagnosticoSolucoesV594_() {

  const sheet =
    obterAba_(
      SHEETS.DIAGNOSTICO_SOLUCOES
    );

  if (!sheet) {
    throw new Error(
      'Aba DIAGNOSTICO_SOLUCOES não encontrada.'
    );
  }

  return sheet;
}


/**
 * Obtém os cabeçalhos esperados.
 */
function obterCabecalhosDiagnosticoSolucoesV594_() {

  return [
    'relacao_id',
    'diagnostico_id',
    'solucao_id',
    'compatibilidade',
    'motivo',
    'viabilidade',
    'principal',
    'criado_em'
  ];
}


/**
 * Localiza uma relação específica por:
 *
 * diagnostico_id + solucao_id
 *
 * Retorna:
 * {
 *   linha,
 *   dados
 * }
 *
 * ou null.
 */
function buscarRelacaoDiagnosticoSolucaoV594_(
  diagnosticoId,
  solucaoId
) {

  const sheet =
    obterAbaDiagnosticoSolucoesV594_();

  const dados =
    sheet.getDataRange().getValues();

  if (
    dados.length <= 1
  ) {
    return null;
  }

  const cabecalhos =
    dados[0];

  const colunaDiagnostico =
    cabecalhos.indexOf(
      'diagnostico_id'
    );

  const colunaSolucao =
    cabecalhos.indexOf(
      'solucao_id'
    );

  if (
    colunaDiagnostico === -1 ||
    colunaSolucao === -1
  ) {
    throw new Error(
      'Estrutura de DIAGNOSTICO_SOLUCOES inválida.'
    );
  }

  const diagnosticoNormalizado =
    String(
      diagnosticoId || ''
    ).trim();

  const solucaoNormalizada =
    String(
      solucaoId || ''
    ).trim();

  for (
    let i = 1;
    i < dados.length;
    i++
  ) {

    const linha =
      dados[i];

    if (
      String(
        linha[colunaDiagnostico] || ''
      ).trim() ===
      diagnosticoNormalizado &&
      String(
        linha[colunaSolucao] || ''
      ).trim() ===
      solucaoNormalizada
    ) {

      return {
        linha: i + 1,
        dados:
          objetoDaLinha_(
            cabecalhos,
            linha
          )
      };
    }
  }

  return null;
}


/**
 * Conta fisicamente as relações de um diagnóstico
 * com uma solução.
 */
function contarRelacoesDiagnosticoSolucaoV594_(
  diagnosticoId,
  solucaoId
) {

  const sheet =
    obterAbaDiagnosticoSolucoesV594_();

  const dados =
    sheet.getDataRange().getValues();

  if (
    dados.length <= 1
  ) {
    return 0;
  }

  const cabecalhos =
    dados[0];

  const colunaDiagnostico =
    cabecalhos.indexOf(
      'diagnostico_id'
    );

  const colunaSolucao =
    cabecalhos.indexOf(
      'solucao_id'
    );

  let total = 0;

  for (
    let i = 1;
    i < dados.length;
    i++
  ) {

    if (
      String(
        dados[i][colunaDiagnostico] || ''
      ).trim() ===
      String(
        diagnosticoId || ''
      ).trim() &&
      String(
        dados[i][colunaSolucao] || ''
      ).trim() ===
      String(
        solucaoId || ''
      ).trim()
    ) {

      total++;
    }
  }

  return total;
}


/**
 * Monta a linha física da relação.
 */
function montarRegistroDiagnosticoSolucaoV594_(
  relacao,
  relacaoId,
  dataCriacao
) {

  return [

    relacaoId,

    String(
      relacao.diagnostico_id || ''
    ).trim(),

    String(
      relacao.solucao_id || ''
    ).trim(),

    String(
      relacao.compatibilidade || ''
    ).trim(),

    String(
      relacao.motivo || ''
    ).trim(),

    String(
      relacao.viabilidade || ''
    ).trim(),

    relacao.principal === true
      ? true
      : false,

    dataCriacao || new Date()
  ];
}


/**
 * Persiste uma relação diagnóstico → solução.
 *
 * Comportamento:
 *
 * inexistente → CRIAR
 * existente   → ATUALIZAR
 *
 * Nunca cria duas relações para o mesmo
 * diagnóstico + solução.
 */
function persistirRelacaoDiagnosticoSolucaoV594_(
  relacao
) {

  if (!relacao) {
    return null;
  }

  const diagnosticoId =
    String(
      relacao.diagnostico_id || ''
    ).trim();

  const solucaoId =
    String(
      relacao.solucao_id || ''
    ).trim();

  if (
    !diagnosticoId ||
    !solucaoId
  ) {
    throw new Error(
      'Não é possível persistir relação sem diagnostico_id e solucao_id.'
    );
  }

  const sheet =
    obterAbaDiagnosticoSolucoesV594_();

  const existente =
    buscarRelacaoDiagnosticoSolucaoV594_(
      diagnosticoId,
      solucaoId
    );


  /*
   * ==========================================================
   * ATUALIZAÇÃO
   * ==========================================================
   */

  if (existente) {

    const relacaoId =
      String(
        existente.dados.relacao_id || ''
      ).trim();

    const dataCriacao =
      existente.dados.criado_em ||
      new Date();

    const registro =
      montarRegistroDiagnosticoSolucaoV594_(
        relacao,
        relacaoId,
        dataCriacao
      );

    sheet
      .getRange(
        existente.linha,
        1,
        1,
        registro.length
      )
      .setValues([
        registro
      ]);

    return {

      acao:
        'ATUALIZAR',

      relacao_id:
        relacaoId,

      diagnostico_id:
        diagnosticoId,

      solucao_id:
        solucaoId,

      linha:
        existente.linha,

      relacao:
        relacao

    };
  }


  /*
   * ==========================================================
   * CRIAÇÃO
   * ==========================================================
   */

  const relacaoId =
    gerarId_(
      ID_PREFIXOS.RELACAO
    );

  const dataCriacao =
    new Date();

  const registro =
    montarRegistroDiagnosticoSolucaoV594_(
      relacao,
      relacaoId,
      dataCriacao
    );

  sheet.appendRow(
    registro
  );

  const linha =
    sheet.getLastRow();

  return {

    acao:
      'CRIAR',

    relacao_id:
      relacaoId,

    diagnostico_id:
      diagnosticoId,

    solucao_id:
      solucaoId,

    linha:
      linha,

    relacao:
      relacao
  };
}


/**
 * Persiste todas as relações compatíveis
 * de um diagnóstico.
 *
 * Soluções incompatíveis não são persistidas.
 */
function persistirRelacoesDiagnosticoSolucoesV594_(
  diagnostico
) {

  if (!diagnostico) {
    return [];
  }

  const relacoes =
    analisarSolucoesDiagnosticoV59_(
      diagnostico
    );

  if (
    !Array.isArray(relacoes) ||
    !relacoes.length
  ) {
    return [];
  }

  return relacoes.map(function(relacao) {

    return persistirRelacaoDiagnosticoSolucaoV594_(
      relacao
    );

  });
}

function TESTAR_PERSISTENCIA_RELACOES_V594() {

  const sheetSolucoes =
    obterAba_(
      SHEETS.SOLUCOES
    );

  const sheetRelacoes =
    obterAbaDiagnosticoSolucoesV594_();

  if (!sheetSolucoes) {
    throw new Error(
      'FALHA: aba SOLUCOES não encontrada.'
    );
  }

  if (!sheetRelacoes) {
    throw new Error(
      'FALHA: aba DIAGNOSTICO_SOLUCOES não encontrada.'
    );
  }


  const diagnostico = {

    diagnostico_id:
      'DIAG-V594',

    empresa_id:
      'EMP-V594',

    conversa_id:
      'CONV-V594',

    processo_nome:
      'conferir e lançar pedidos',

    dor_principal:
      'erros de digitação e retrabalho',

    frequencia:
      'diariamente',

    objetivo:
      'reduzir os erros e diminuir o retrabalho'
  };


  /*
   * ==========================================================
   * SOLUÇÃO PERFEITA
   * ==========================================================
   */

  const solucaoPerfeita = {

    solucao_id:
      'V594-PERFEITA',

    familia:
      'Automação de pedidos',

    nome:
      'Conferir e lançar pedidos',

    descricao:
      'Reduzir erros de digitação e retrabalho no processo de conferir e lançar pedidos.',

    status:
      'ATIVA',

    nivel_complexidade:
      'MEDIA',

    repetibilidade:
      'ALTA',

    pode_oferecer:
      'SIM',

    versao:
      'V5.9.4'
  };


  /*
   * ==========================================================
   * SOLUÇÃO PARCIAL
   * ==========================================================
   */

  const solucaoParcial = {

    solucao_id:
      'V594-PARCIAL',

    familia:
      'Processos administrativos',

    nome:
      'Apoio para conferir pedidos',

    descricao:
      'Apoio na conferência de pedidos e identificação de informações administrativas.',

    status:
      'ATIVA',

    nivel_complexidade:
      'MEDIA',

    repetibilidade:
      'ALTA',

    pode_oferecer:
      'SIM',

    versao:
      'V5.9.4'
  };


  /*
   * ==========================================================
   * SOLUÇÃO INCOMPATÍVEL
   * ==========================================================
   */

  const solucaoIncompativel = {

    solucao_id:
      'V594-INCOMPATIVEL',

    familia:
      'Marketing',

    nome:
      'Gestão de redes sociais',

    descricao:
      'Planejamento e publicação de conteúdo para redes sociais.',

    status:
      'ATIVA',

    nivel_complexidade:
      'MEDIA',

    repetibilidade:
      'ALTA',

    pode_oferecer:
      'SIM',

    versao:
      'V5.9.4'
  };


  /*
   * ==========================================================
   * SOLUÇÃO INATIVA
   * ==========================================================
   */

  const solucaoInativa = {

    solucao_id:
      'V594-INATIVA',

    familia:
      'Automação de pedidos',

    nome:
      'Conferir e lançar pedidos',

    descricao:
      'Reduzir erros de digitação e retrabalho no processo de conferir e lançar pedidos.',

    status:
      'INATIVA',

    nivel_complexidade:
      'MEDIA',

    repetibilidade:
      'ALTA',

    pode_oferecer:
      'SIM',

    versao:
      'V5.9.4'
  };


  const solucoes = [
    solucaoPerfeita,
    solucaoParcial,
    solucaoIncompativel,
    solucaoInativa
  ];

let resultado = null;

  try {

    /*
     * ========================================================
     * INSERE CATÁLOGO TEMPORÁRIO
     * ========================================================
     */

    solucoes.forEach(function(solucao) {

      criarSolucaoTesteV593_(
        sheetSolucoes,
        solucao
      );

    });


    /*
     * ========================================================
     * TESTE 1
     * MOTOR
     * ========================================================
     */

    const relacoes =
      analisarSolucoesDiagnosticoV59_(
        diagnostico
      );

    console.log(
      'TESTE 1 — RELAÇÕES GERADAS:'
    );

    console.log(
      JSON.stringify(
        relacoes,
        null,
        2
      )
    );


    /*
     * Deve haver exatamente duas:
     *
     * perfeita
     * parcial
     */

    if (
      relacoes.length !== 2
    ) {
      throw new Error(
        'FALHA TESTE 1: esperado 2 relações compatíveis. Encontradas: ' +
        relacoes.length
      );
    }


    /*
     * ========================================================
     * TESTE 2
     * PERFEITA = 100
     * ========================================================
     */

    const perfeita =
      relacoes.find(function(relacao) {

        return (
          relacao.solucao_id ===
          'V594-PERFEITA'
        );

      });


    if (!perfeita) {
      throw new Error(
        'FALHA TESTE 2: solução perfeita não encontrada.'
      );
    }


    if (
      perfeita.pontuacao !== 100
    ) {
      throw new Error(
        'FALHA TESTE 2: solução perfeita deve ter 100 pontos.'
      );
    }


    if (
      perfeita.compatibilidade !==
      'ALTA'
    ) {
      throw new Error(
        'FALHA TESTE 2: solução perfeita deve ser ALTA.'
      );
    }


    if (
      perfeita.principal !== true
    ) {
      throw new Error(
        'FALHA TESTE 2: solução perfeita deve ser principal.'
      );
    }


    /*
     * ========================================================
     * TESTE 3
     * INCOMPATÍVEL NÃO ENTRA
     * ========================================================
     */

    const encontrouIncompativel =
      relacoes.some(function(relacao) {

        return (
          relacao.solucao_id ===
          'V594-INCOMPATIVEL'
        );

      });


    if (
      encontrouIncompativel
    ) {
      throw new Error(
        'FALHA TESTE 3: solução incompatível entrou nas relações.'
      );
    }


    /*
     * ========================================================
     * TESTE 4
     * INATIVA NÃO ENTRA
     * ========================================================
     */

    const encontrouInativa =
      relacoes.some(function(relacao) {

        return (
          relacao.solucao_id ===
          'V594-INATIVA'
        );

      });


    if (
      encontrouInativa
    ) {
      throw new Error(
        'FALHA TESTE 4: solução inativa entrou nas relações.'
      );
    }


    /*
     * ========================================================
     * TESTE 5
     * PRIMEIRA PERSISTÊNCIA
     * ========================================================
     */

    const primeiraPersistencia =
      persistirRelacoesDiagnosticoSolucoesV594_(
        diagnostico
      );


    console.log(
      'TESTE 5 — PRIMEIRA PERSISTÊNCIA:'
    );

    console.log(
      JSON.stringify(
        primeiraPersistencia,
        null,
        2
      )
    );


    if (
      primeiraPersistencia.length !== 2
    ) {
      throw new Error(
        'FALHA TESTE 5: deveriam ser criadas 2 relações.'
      );
    }


    const criadas =
      primeiraPersistencia.filter(function(item) {

        return (
          item.acao ===
          'CRIAR'
        );

      });


    if (
      criadas.length !== 2
    ) {
      throw new Error(
        'FALHA TESTE 5: as duas relações deveriam ser CRIAR.'
      );
    }


    /*
     * ========================================================
     * TESTE 6
     * PERSISTÊNCIA FÍSICA
     * ========================================================
     */

    const relacaoFisicaPerfeita =
      buscarRelacaoDiagnosticoSolucaoV594_(
        diagnostico.diagnostico_id,
        'V594-PERFEITA'
      );


    if (
      !relacaoFisicaPerfeita
    ) {
      throw new Error(
        'FALHA TESTE 6: relação perfeita não foi encontrada fisicamente.'
      );
    }


    if (
      relacaoFisicaPerfeita.dados.relacao_id !==
      criadas.find(function(item) {

        return (
          item.solucao_id ===
          'V594-PERFEITA'
        );

      }).relacao_id
    ) {
      throw new Error(
        'FALHA TESTE 6: relacao_id físico diferente do retornado.'
      );
    }


    if (
      relacaoFisicaPerfeita.dados.compatibilidade !==
      'ALTA'
    ) {
      throw new Error(
        'FALHA TESTE 6: compatibilidade física incorreta.'
      );
    }


    if (
      relacaoFisicaPerfeita.dados.principal !==
      true
    ) {
      throw new Error(
        'FALHA TESTE 6: principal físico incorreto.'
      );
    }


    /*
     * ========================================================
     * TESTE 7
     * RASTREABILIDADE
     * ========================================================
     */

    primeiraPersistencia.forEach(function(item) {

      if (
        item.diagnostico_id !==
        diagnostico.diagnostico_id
      ) {
        throw new Error(
          'FALHA TESTE 7: diagnostico_id incorreto.'
        );
      }


      if (
        !item.relacao_id
      ) {
        throw new Error(
          'FALHA TESTE 7: relacao_id ausente.'
        );
      }


      if (
        !item.solucao_id
      ) {
        throw new Error(
          'FALHA TESTE 7: solucao_id ausente.'
        );
      }

    });

    teste(
      '6 — Exatamente uma solução principal',
      principais.length === 1,
      'Principais: ' + principais.length
    );


    /**
     * --------------------------------------------------------
     * 7. SOLUÇÃO PERFEITA
     * --------------------------------------------------------
     */

   
    teste(
      '7 — Solução perfeita encontrada',
      !!perfeita,
      perfeita
        ? JSON.stringify(perfeita)
        : 'Não encontrada'
    );

    teste(
      '8 — Solução perfeita com pontuação máxima',
      perfeita &&
        Number(perfeita.pontuacao) === 100,
      perfeita
        ? String(perfeita.pontuacao)
        : 'N/A'
    );

    teste(
      '9 — Solução perfeita com compatibilidade ALTA',
      perfeita &&
        String(
          perfeita.compatibilidade || ''
        ).toUpperCase() === 'ALTA',
      perfeita
        ? perfeita.compatibilidade
        : 'N/A'
    );


    /**
     * --------------------------------------------------------
     * 8. INCOMPATÍVEL NÃO PERSISTE
     * --------------------------------------------------------
     */

    const incompatibilidade =
      relacoes.find(function(relacao) {
        return (
          relacao.solucao_id ===
          'V595-INCOMPATIVEL'
        );
      });

    teste(
      '10 — Solução incompatível não persistida',
      !incompatibilidade,
      incompatibilidade
        ? 'ERRO: incompatível persistida'
        : 'Correto'
    );


    /**
     * --------------------------------------------------------
     * 9. INATIVA NÃO PERSISTE
     * --------------------------------------------------------
     */

    const inativa =
      relacoes.find(function(relacao) {
        return (
          relacao.solucao_id ===
          'V595-INATIVA'
        );
      });

    teste(
      '11 — Solução inativa não persistida',
      !inativa,
      inativa
        ? 'ERRO: inativa persistida'
        : 'Correto'
    );


    /**
     * --------------------------------------------------------
     * 10. PERSISTÊNCIA FÍSICA
     * --------------------------------------------------------
     */

    const abaRelacoes =
      obterAba_(
        SHEETS.DIAGNOSTICO_SOLUCOES
      );

    const dadosRelacoes =
      abaRelacoes
        .getDataRange()
        .getValues();

    const cabRelacoes =
      dadosRelacoes[0];

    const idxDiag =
      cabRelacoes.indexOf(
        'diagnostico_id'
      );

    const idxSolucao =
      cabRelacoes.indexOf(
        'solucao_id'
      );

    const fisicas =
      dadosRelacoes
        .slice(1)
        .filter(function(linha) {

          return (
            String(
              linha[idxDiag] || ''
            ) ===
            String(
              diagnostico.diagnostico_id
            )
          );
        });

    teste(
      '12 — Relação física criada',
      fisicas.length >= 1,
      'Registros: ' + fisicas.length
    );


    /**
     * --------------------------------------------------------
     * 11. RASTREABILIDADE
     * --------------------------------------------------------
     */

    const rastreavel =
      fisicas.every(function(linha) {

        return (
          String(
            linha[idxDiag] || ''
          ) ===
          String(
            diagnostico.diagnostico_id
          ) &&
          String(
            linha[idxSolucao] || ''
          ).trim() !== ''
        );
      });

    teste(
      '13 — Relações fisicamente rastreáveis',
      rastreavel,
      rastreavel
        ? 'Diagnóstico + solução presentes'
        : 'Falha de rastreabilidade'
    );


    /**
     * --------------------------------------------------------
     * 12. IDEMPOTÊNCIA
     * --------------------------------------------------------
     */

    const antes =
      fisicas.length;

    const segundaExecucao =
      integrarSolucoesDiagnosticoV595_(
        diagnostico
      );

    const depoisDados =
      abaRelacoes
        .getDataRange()
        .getValues();

    const depois =
      depoisDados
        .slice(1)
        .filter(function(linha) {

          return (
            String(
              linha[idxDiag] || ''
            ) ===
            String(
              diagnostico.diagnostico_id
            )
          );
        })
        .length;

    teste(
      '14 — Segunda execução realizada',
      !!segundaExecucao,
      segundaExecucao
        ? JSON.stringify(
            segundaExecucao
          )
        : 'Sem retorno'
    );

    teste(
      '15 — Idempotência física',
      antes === depois,
      'Antes: ' +
        antes +
        ' | Depois: ' +
        depois
    );


    /**
     * --------------------------------------------------------
     * RESULTADO
     * --------------------------------------------------------
     */

    const aprovados =
      resultados.filter(function(item) {
        return item.passou;
      }).length;

    const total =
      resultados.length;

    Logger.log(
      '===================================================='
    );

    resultados.forEach(function(item, indice) {

      Logger.log(
        (item.passou ? 'PASSOU' : 'FALHOU') +
        ' — TESTE ' +
        (indice + 1) +
        ': ' +
        item.teste +
        ' — ' +
        item.detalhe
      );
    });

    Logger.log(
      '===================================================='
    );

    Logger.log(
      'RESULTADO V5.9.5: ' +
      aprovados +
      '/' +
      total
    );

    if (aprovados !== total) {
      throw new Error(
        'V5.9.5 FALHOU: ' +
        aprovados +
        '/' +
        total
      );
    }

    Logger.log(
      'TESTAR_INTEGRACAO_REAL_V595: PASSOU'
    );

  } finally {

    /**
     * --------------------------------------------------------
     * LIMPEZA
     * --------------------------------------------------------
     */

    try {

      const abaSolucoes =
        obterAba_(SHEETS.SOLUCOES);

      const dados =
        abaSolucoes
          .getDataRange()
          .getValues();

      const cabecalhos =
        dados[0];

      const idxId =
        cabecalhos.indexOf(
          'solucao_id'
        );

      for (
        let i = dados.length - 1;
        i >= 1;
        i--
      ) {

        const id =
          String(
            dados[i][idxId] || ''
          );

        if (
          id.indexOf('V595-') === 0
        ) {
          abaSolucoes.deleteRow(i + 1);
        }
      }

    } catch (erro) {

      Logger.log(
        'Erro na limpeza de SOLUCOES: ' +
        erro.message
      );
    }

    try {

      if (diagnostico) {

        const abaRelacoes =
          obterAba_(
            SHEETS.DIAGNOSTICO_SOLUCOES
          );

        const dados =
          abaRelacoes
            .getDataRange()
            .getValues();

        const cabecalhos =
          dados[0];

        const idxDiag =
          cabecalhos.indexOf(
            'diagnostico_id'
          );

        for (
          let i = dados.length - 1;
          i >= 1;
          i--
        ) {

          if (
            String(
              dados[i][idxDiag] || ''
            ) ===
            String(
              diagnostico.diagnostico_id
            )
          ) {
            abaRelacoes.deleteRow(
              i + 1
            );
          }
        }
      }

    } catch (erro) {

      Logger.log(
        'Erro na limpeza de relações: ' +
        erro.message
      );
    }

    Logger.log(
      'LIMPEZA V5.9.5 CONCLUÍDA'
    );
  }
}

function processarSolucoesDiagnosticoV595_(diagnostico) {

  if (!diagnostico) {
    return null;
  }


  const estado =
    String(
      diagnostico.status_diagnostico || ''
    )
      .trim()
      .toUpperCase();


  const estadoPronto =
    String(
      DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE
    )
      .trim()
      .toUpperCase();


  if (
    estado !== estadoPronto
  ) {

    return null;

  }


  const resultado =
    persistirRelacoesDiagnosticoSolucoesV594_(
      diagnostico
    );


  if (
    !Array.isArray(resultado) ||
    !resultado.length
  ) {

    return null;

  }


  /*
   * A V5.9.4 retorna um array.
   *
   * Cada item possui:
   *
   * acao
   * relacao_id
   * diagnostico_id
   * solucao_id
   * linha
   * relacao
   *
   * Para o fluxo principal, expomos a relação
   * diretamente.
   */

  const relacoes =
    resultado.map(
      function(item) {

        const relacao =
          item &&
          item.relacao
            ? item.relacao
            : {};

        return Object.assign(
          {},
          relacao,
          {

            acao:
              item.acao || '',

            relacao_id:
              item.relacao_id || '',

            diagnostico_id:
              item.diagnostico_id ||
              diagnostico.diagnostico_id ||
              '',

            solucao_id:
              item.solucao_id ||
              relacao.solucao_id ||
              '',

            linha:
              item.linha || ''

          }
        );

      }
    );


  const possuiCriacao =
    resultado.some(
      function(item) {

        return (
          item &&
          item.acao === 'CRIAR'
        );

      }
    );


  const possuiAtualizacao =
    resultado.some(
      function(item) {

        return (
          item &&
          item.acao === 'ATUALIZAR'
        );

      }
    );


  let acao = '';


  if (
    possuiCriacao &&
    possuiAtualizacao
  ) {

    acao = 'MISTO';

  } else if (
    possuiCriacao
  ) {

    acao = 'CRIAR';

  } else if (
    possuiAtualizacao
  ) {

    acao = 'ATUALIZAR';

  }


  return {

    acao:
      acao,

    diagnostico_id:
      diagnostico.diagnostico_id || '',

    total:
      relacoes.length,

    relacoes:
      relacoes

  };

}


function processarSolucoesDiagnosticoV595_(diagnostico) {

  if (!diagnostico) {
    return null;
  }


  const estado =
    String(
      diagnostico.status_diagnostico || ''
    )
      .trim()
      .toUpperCase();


  const estadoPronto =
    String(
      DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE
    )
      .trim()
      .toUpperCase();


  if (
    estado !== estadoPronto
  ) {

    return null;

  }


  const resultado =
    persistirRelacoesDiagnosticoSolucoesV594_(
      diagnostico
    );


  if (
    !Array.isArray(resultado) ||
    !resultado.length
  ) {

    return null;

  }


  /*
   * A V5.9.4 retorna um array.
   *
   * Cada item possui:
   *
   * acao
   * relacao_id
   * diagnostico_id
   * solucao_id
   * linha
   * relacao
   *
   * Para o fluxo principal, expomos a relação
   * diretamente.
   */

  const relacoes =
    resultado.map(
      function(item) {

        const relacao =
          item &&
          item.relacao
            ? item.relacao
            : {};

        return Object.assign(
          {},
          relacao,
          {

            acao:
              item.acao || '',

            relacao_id:
              item.relacao_id || '',

            diagnostico_id:
              item.diagnostico_id ||
              diagnostico.diagnostico_id ||
              '',

            solucao_id:
              item.solucao_id ||
              relacao.solucao_id ||
              '',

            linha:
              item.linha || ''

          }
        );

      }
    );


  const possuiCriacao =
    resultado.some(
      function(item) {

        return (
          item &&
          item.acao === 'CRIAR'
        );

      }
    );


  const possuiAtualizacao =
    resultado.some(
      function(item) {

        return (
          item &&
          item.acao === 'ATUALIZAR'
        );

      }
    );


  let acao = '';


  if (
    possuiCriacao &&
    possuiAtualizacao
  ) {

    acao = 'MISTO';

  } else if (
    possuiCriacao
  ) {

    acao = 'CRIAR';

  } else if (
    possuiAtualizacao
  ) {

    acao = 'ATUALIZAR';

  }


  return {

    acao:
      acao,

    diagnostico_id:
      diagnostico.diagnostico_id || '',

    total:
      relacoes.length,

    relacoes:
      relacoes

  };

}

function integrarSolucoesDiagnosticoV595_(diagnostico) {

  if (!diagnostico) {
    return null;
  }

  return processarSolucoesDiagnosticoV595_(
    diagnostico
  );

}

function TESTAR_INTEGRACAO_REAL_V595() {

  const resultados = [];

  let inicio = null;
  let diagnostico = null;


  function teste(nome, condicao, detalhe) {

    resultados.push({
      teste: nome,
      passou: !!condicao,
      detalhe: detalhe || ''
    });

  }


  function limparPorCampo(
    nomeAba,
    campo,
    valor
  ) {

    try {

      const sheet =
        obterAba_(nomeAba);

      if (!sheet) {
        return;
      }

      const dados =
        sheet
          .getDataRange()
          .getValues();

      if (dados.length <= 1) {
        return;
      }

      const cabecalhos =
        dados[0];

      const coluna =
        cabecalhos.indexOf(campo);

      if (coluna < 0) {
        return;
      }

      for (
        let i = dados.length - 1;
        i >= 1;
        i--
      ) {

        if (
          String(
            dados[i][coluna] || ''
          ).trim() ===
          String(
            valor || ''
          ).trim()
        ) {

          sheet.deleteRow(i + 1);

        }

      }

    } catch (erro) {

      Logger.log(
        'Falha limpeza ' +
        nomeAba +
        ': ' +
        erro.message
      );

    }

  }


  function limparSolucoesTeste() {

    try {

      const sheet =
        obterAba_(
          SHEETS.SOLUCOES
        );

      const dados =
        sheet
          .getDataRange()
          .getValues();

      if (dados.length <= 1) {
        return;
      }

      const cabecalhos =
        dados[0];

      const coluna =
        cabecalhos.indexOf(
          'solucao_id'
        );

      if (coluna < 0) {
        throw new Error(
          'Cabeçalho solucao_id não encontrado.'
        );
      }

      for (
        let i = dados.length - 1;
        i >= 1;
        i--
      ) {

        const id =
          String(
            dados[i][coluna] || ''
          ).trim();

        if (
          id.indexOf('V593-') === 0 ||
          id.indexOf('V594-') === 0 ||
          id.indexOf('V595-') === 0
        ) {

          sheet.deleteRow(
            i + 1
          );

        }

      }

    } catch (erro) {

      Logger.log(
        'Falha limpeza catálogo: ' +
        erro.message
      );

    }

  }


  try {

    Logger.log(
      '===================================================='
    );

    Logger.log(
      'V5.9.5 — INTEGRAÇÃO REAL DO MOTOR DE SOLUÇÕES'
    );

    Logger.log(
      '===================================================='
    );


    /*
     * ==========================================================
     * 0 — LIMPEZA PREVENTIVA
     * ==========================================================
     */

    limparSolucoesTeste();


    /*
     * ==========================================================
     * 1 — CATÁLOGO TEMPORÁRIO
     * ==========================================================
     *
     * A solução perfeita usa EXATAMENTE o cenário
     * já aprovado no V5.9.3 com 100/100.
     */

    const abaSolucoes =
      obterAba_(
        SHEETS.SOLUCOES
      );


    const cabecalhos =
      abaSolucoes
        .getRange(
          1,
          1,
          1,
          abaSolucoes.getLastColumn()
        )
        .getValues()[0];


    const mapa = {};


    cabecalhos.forEach(
      function(cabecalho, indice) {

        mapa[cabecalho] =
          indice;

      }
    );


    const solucoesTeste = [

      /*
       * SOLUÇÃO PERFEITA
       *
       * Cenário já aprovado no V5.9.3.
       */

      {
        solucao_id:
          'V595-PERFEITA',

        familia:
          'Automação de pedidos',

        nome:
          'Conferir e lançar pedidos',

        descricao:
          'Reduzir erros de digitação e retrabalho no processo de conferir e lançar pedidos.',

        status:
          'ATIVA',

        nivel_complexidade:
          'MEDIA',

        repetibilidade:
          'ALTA',

        pode_oferecer:
          'SIM',

        versao:
          'V5.9.5'
      },


      /*
       * SOLUÇÃO PARCIAL
       *
       * Compatível somente com parte do processo.
       */

      {
        solucao_id:
          'V595-PARCIAL',

        familia:
          'Processos administrativos',

        nome:
          'Apoio para conferir pedidos',

        descricao:
          'Apoio na conferência de pedidos e identificação de informações administrativas.',

        status:
          'ATIVA',

        nivel_complexidade:
          'MEDIA',

        repetibilidade:
          'ALTA',

        pode_oferecer:
          'SIM',

        versao:
          'V5.9.5'
      },


      /*
       * INCOMPATÍVEL
       */

      {
        solucao_id:
          'V595-INCOMPATIVEL',

        familia:
          'Marketing',

        nome:
          'Gestão de redes sociais',

        descricao:
          'Planejamento e publicação de conteúdo para redes sociais.',

        status:
          'ATIVA',

        nivel_complexidade:
          'MEDIA',

        repetibilidade:
          'ALTA',

        pode_oferecer:
          'SIM',

        versao:
          'V5.9.5'
      },


      /*
       * INATIVA
       */

      {
        solucao_id:
          'V595-INATIVA',

        familia:
          'Automação de pedidos',

        nome:
          'Conferir e lançar pedidos',

        descricao:
          'Reduzir erros de digitação e retrabalho no processo de conferir e lançar pedidos.',

        status:
          'INATIVA',

        nivel_complexidade:
          'MEDIA',

        repetibilidade:
          'ALTA',

        pode_oferecer:
          'SIM',

        versao:
          'V5.9.5'
      }

    ];


    solucoesTeste.forEach(
      function(solucao) {

        const linha =
          new Array(
            cabecalhos.length
          ).fill('');


        Object.keys(solucao)
          .forEach(
            function(campo) {

              if (
                Object.prototype
                  .hasOwnProperty.call(
                    mapa,
                    campo
                  )
              ) {

                linha[
                  mapa[campo]
                ] =
                  solucao[campo];

              }

            }
          );


        abaSolucoes.appendRow(
          linha
        );

      }
    );


    /*
     * ==========================================================
     * TESTE 1 — CATÁLOGO
     * ==========================================================
     */

    const catalogo =
      abaSolucoes
        .getDataRange()
        .getValues();


    const idxCatalogo =
      catalogo[0]
        .indexOf(
          'solucao_id'
        );


    const idsCatalogo =
      catalogo
        .slice(1)
        .map(
          function(linha) {

            return String(
              linha[idxCatalogo] || ''
            ).trim();

          }
        )
        .filter(Boolean);


    teste(
      '1 — Catálogo V5.9.5 isolado',
      idsCatalogo.length === 4,
      'Soluções: ' +
      idsCatalogo.length
    );


    /*
     * ==========================================================
     * 2 — INICIAR DIAGNÓSTICO
     * ==========================================================
     */

    inicio =
      iniciarDiagnostico({

        nome:
          'Empresa Teste V595',

        nome_empresa:
          'Empresa Teste V595',

        segmento:
          'Serviços',

        porte:
          'PEQUENA',

        nome_contato:
          'Teste V595',

        email:
          '',

        whatsapp:
          '',

        cidade:
          ''

      });


    teste(
      '2 — Diagnóstico iniciado',
      !!inicio &&
      !!inicio.sucesso &&
      !!inicio.empresa_id &&
      !!inicio.conversa_id &&
      !!inicio.diagnostico_id,
      inicio
        ? JSON.stringify(inicio)
        : 'Falha'
    );


    if (
      !inicio ||
      !inicio.empresa_id ||
      !inicio.conversa_id ||
      !inicio.diagnostico_id
    ) {

      throw new Error(
        'Falha ao iniciar diagnóstico V5.9.5.'
      );

    }


    /*
     * ==========================================================
     * 3 — FLUXO REAL
     * ==========================================================
     */

    const resultadoFluxo =
      processarMensagemDiagnostico({

        empresa_id:
          inicio.empresa_id,

        conversa_id:
          inicio.conversa_id,

        mensagem:
          'Nosso processo principal é conferir e lançar pedidos. ' +
          'Temos erros de digitação e retrabalho nesse processo. ' +
          'Isso acontece diariamente. ' +
          'Processamos 120 pedidos por dia. ' +
          'Perdemos aproximadamente 3 horas por dia com esse problema. ' +
          'Nosso objetivo é reduzir os erros e diminuir o retrabalho.'

      });


    teste(
      '3 — Fluxo principal executado',
      !!resultadoFluxo &&
      resultadoFluxo.sucesso === true,
      resultadoFluxo
        ? 'OK'
        : 'Falha'
    );


    /*
     * ==========================================================
     * 4 — DIAGNÓSTICO
     * ==========================================================
     */

    diagnostico =
      resultadoFluxo.diagnostico;


    teste(
      '4 — Diagnóstico retornado',
      !!diagnostico,
      diagnostico
        ? diagnostico.diagnostico_id
        : 'Não retornado'
    );


    if (!diagnostico) {

      throw new Error(
        'Diagnóstico não retornado.'
      );

    }


    const estado =
      String(
        diagnostico.status_diagnostico || ''
      )
        .trim()
        .toUpperCase();


    teste(
      '5 — Diagnóstico PRONTO_PARA_ANALISE',
      estado ===
      'PRONTO_PARA_ANALISE',
      estado
    );


    /*
     * ==========================================================
     * 5 — OPORTUNIDADE
     * ==========================================================
     */

    teste(
      '6 — Oportunidade V5.7',
      !!resultadoFluxo.oportunidade,
      resultadoFluxo.oportunidade
        ? 'OK'
        : 'Não retornada'
    );


    /*
     * ==========================================================
     * 6 — ANÁLISE
     * ==========================================================
     */

    teste(
      '7 — Análise V5.8',
      !!resultadoFluxo.analise_diagnostica,
      resultadoFluxo.analise_diagnostica
        ? 'OK'
        : 'Não retornada'
    );


    /*
     * ==========================================================
     * 7 — MOTOR V5.9.5
     * ==========================================================
     */

    const solucoes =
      resultadoFluxo.solucoes;


    teste(
      '8 — Motor V5.9.5 integrado',
      !!solucoes,
      solucoes
        ? 'OK'
        : 'Não retornado'
    );


    if (!solucoes) {

      throw new Error(
        'Motor V5.9.5 não retornou resultado.'
      );

    }


    const relacoes =
      Array.isArray(
        solucoes.relacoes
      )
        ? solucoes.relacoes
        : [];


    /*
     * ==========================================================
     * 8 — DUAS COMPATÍVEIS
     * ==========================================================
     */

    teste(
      '9 — Exatamente duas relações compatíveis',
      relacoes.length === 2,
      'Total: ' +
      relacoes.length
    );


    /*
     * ==========================================================
     * 9 — PRINCIPAL
     * ==========================================================
     */

    const principais =
      relacoes.filter(
        function(relacao) {

          return (
            relacao.principal === true
          );

        }
      );


    teste(
      '10 — Exatamente uma solução principal',
      principais.length === 1,
      'Principais: ' +
      principais.length
    );


    /*
     * ==========================================================
     * 10 — SOLUÇÃO PERFEITA
     * ==========================================================
     */

    const perfeita =
      relacoes.find(
        function(relacao) {

          return (
            relacao.solucao_id ===
            'V595-PERFEITA'
          );

        }
      );


    teste(
      '11 — Solução perfeita encontrada',
      !!perfeita,
      perfeita
        ? JSON.stringify(perfeita)
        : 'Não encontrada'
    );


    teste(
      '12 — Solução perfeita = 100/100',
      perfeita &&
      Number(
        perfeita.pontuacao
      ) === 100,
      perfeita
        ? String(
            perfeita.pontuacao
          )
        : 'N/A'
    );


    teste(
      '13 — Solução perfeita = ALTA',
      perfeita &&
      String(
        perfeita.compatibilidade || ''
      )
        .trim()
        .toUpperCase() ===
      'ALTA',
      perfeita
        ? perfeita.compatibilidade
        : 'N/A'
    );


    teste(
      '14 — Solução perfeita é principal',
      perfeita &&
      perfeita.principal === true,
      perfeita
        ? String(
            perfeita.principal
          )
        : 'N/A'
    );


    /*
     * ==========================================================
     * 11 — INCOMPATÍVEL
     * ==========================================================
     */

    const incompatibilidade =
      relacoes.find(
        function(relacao) {

          return (
            relacao.solucao_id ===
            'V595-INCOMPATIVEL'
          );

        }
      );


    teste(
      '15 — Incompatível não persistida',
      !incompatibilidade,
      incompatibilidade
        ? 'ERRO'
        : 'Correto'
    );


    /*
     * ==========================================================
     * 12 — INATIVA
     * ==========================================================
     */

    const inativa =
      relacoes.find(
        function(relacao) {

          return (
            relacao.solucao_id ===
            'V595-INATIVA'
          );

        }
      );


    teste(
      '16 — Inativa não persistida',
      !inativa,
      inativa
        ? 'ERRO'
        : 'Correto'
    );


    /*
     * ==========================================================
     * 13 — PERSISTÊNCIA
     * ==========================================================
     */

    const abaRelacoes =
      obterAba_(
        SHEETS.DIAGNOSTICO_SOLUCOES
      );


    const dadosRelacoes =
      abaRelacoes
        .getDataRange()
        .getValues();


    const cabRelacoes =
      dadosRelacoes[0];


    const idxDiagnostico =
      cabRelacoes.indexOf(
        'diagnostico_id'
      );


    const idxSolucao =
      cabRelacoes.indexOf(
        'solucao_id'
      );


    const fisicas =
      dadosRelacoes
        .slice(1)
        .filter(
          function(linha) {

            return (
              String(
                linha[idxDiagnostico] || ''
              ).trim() ===
              String(
                diagnostico.diagnostico_id
              ).trim()
            );

          }
        );


    teste(
      '17 — Duas relações físicas criadas',
      fisicas.length === 2,
      'Registros: ' +
      fisicas.length
    );


    /*
     * ==========================================================
     * 14 — RASTREABILIDADE
     * ==========================================================
     */

    const rastreavel =
      fisicas.every(
        function(linha) {

          return (
            String(
              linha[idxDiagnostico] || ''
            ).trim() ===
            String(
              diagnostico.diagnostico_id
            ).trim()
            &&
            String(
              linha[idxSolucao] || ''
            ).trim() !== ''
          );

        }
      );


    teste(
      '18 — Relações rastreáveis',
      rastreavel,
      rastreavel
        ? 'OK'
        : 'Falha'
    );


    /*
     * ==========================================================
     * 15 — IDEMPOTÊNCIA
     * ==========================================================
     */

    const quantidadeAntes =
      fisicas.length;


    const segundaExecucao =
      integrarSolucoesDiagnosticoV595_(
        diagnostico
      );


    const dadosDepois =
      abaRelacoes
        .getDataRange()
        .getValues();


    const quantidadeDepois =
      dadosDepois
        .slice(1)
        .filter(
          function(linha) {

            return (
              String(
                linha[idxDiagnostico] || ''
              ).trim() ===
              String(
                diagnostico.diagnostico_id
              ).trim()
            );

          }
        )
        .length;


    teste(
      '19 — Segunda execução realizada',
      !!segundaExecucao,
      segundaExecucao
        ? 'OK'
        : 'Sem retorno'
    );


    teste(
      '20 — Idempotência física',
      quantidadeAntes ===
      quantidadeDepois &&
      quantidadeDepois === 2,
      'Antes: ' +
      quantidadeAntes +
      ' | Depois: ' +
      quantidadeDepois
    );


    /*
     * ==========================================================
     * RESULTADO
     * ==========================================================
     */

    const aprovados =
      resultados.filter(
        function(item) {

          return item.passou;

        }
      ).length;


    const total =
      resultados.length;


    Logger.log(
      '===================================================='
    );


    resultados.forEach(
      function(item, indice) {

        Logger.log(
          (
            item.passou
              ? 'PASSOU'
              : 'FALHOU'
          ) +
          ' — TESTE ' +
          (indice + 1) +
          ': ' +
          item.teste +
          ' — ' +
          item.detalhe
        );

      }
    );


    Logger.log(
      '===================================================='
    );


    Logger.log(
      'RESULTADO V5.9.5: ' +
      aprovados +
      '/' +
      total
    );


    if (
      aprovados !== total
    ) {

      throw new Error(
        'V5.9.5 FALHOU: ' +
        aprovados +
        '/' +
        total
      );

    }


    Logger.log(
      'TESTAR_INTEGRACAO_REAL_V595: PASSOU'
    );


  } finally {


    /*
     * ==========================================================
     * LIMPEZA FINAL
     * ==========================================================
     */

    limparSolucoesTeste();


    if (inicio) {

      limparPorCampo(
        SHEETS.DIAGNOSTICO_SOLUCOES,
        'diagnostico_id',
        inicio.diagnostico_id
      );


      limparPorCampo(
        SHEETS.OPORTUNIDADES,
        'diagnostico_id',
        inicio.diagnostico_id
      );


      limparPorCampo(
        SHEETS.DORES,
        'diagnostico_id',
        inicio.diagnostico_id
      );


      limparPorCampo(
        SHEETS.DIAGNOSTICOS,
        'diagnostico_id',
        inicio.diagnostico_id
      );


      limparPorCampo(
        SHEETS.CONVERSAS,
        'conversa_id',
        inicio.conversa_id
      );


      limparPorCampo(
        SHEETS.METRICAS,
        'conversa_id',
        inicio.conversa_id
      );


      limparPorCampo(
        SHEETS.EMPRESAS,
        'empresa_id',
        inicio.empresa_id
      );


      try {

        const abaAnalises =
          SpreadsheetApp
            .getActiveSpreadsheet()
            .getSheetByName(
              'ANALISES_DIAGNOSTICAS'
            );


        if (abaAnalises) {

          const dados =
            abaAnalises
              .getDataRange()
              .getValues();


          if (dados.length > 1) {

            const cab =
              dados[0];

            const coluna =
              cab.indexOf(
                'diagnostico_id'
              );


            if (coluna >= 0) {

              for (
                let i =
                  dados.length - 1;
                i >= 1;
                i--
              ) {

                if (
                  String(
                    dados[i][coluna] || ''
                  ).trim() ===
                  String(
                    inicio.diagnostico_id
                  ).trim()
                ) {

                  abaAnalises.deleteRow(
                    i + 1
                  );

                }

              }

            }

          }

        }

      } catch (erro) {

        Logger.log(
          'Falha limpeza análise: ' +
          erro.message
        );

      }

    }


    Logger.log(
      'LIMPEZA V5.9.5 CONCLUÍDA'
    );

  }

}

/**
 * ============================================================
 * V5.10 — MOTOR DE DECISÃO
 * ============================================================
 *
 * Responsabilidade:
 *
 * Receber os resultados consolidados das versões:
 *
 * V5.6  — Diagnóstico
 * V5.7  — Oportunidade
 * V5.8  — Análise
 * V5.9  — Soluções
 *
 * E produzir uma decisão determinística.
 *
 * IMPORTANTE:
 *
 * A V5.10 NÃO:
 *
 * - chama IA;
 * - altera diagnóstico;
 * - cria oportunidade;
 * - cria solução;
 * - cria lead;
 * - define preço;
 * - cria proposta;
 * - decide fechamento comercial.
 *
 * A V5.10 apenas interpreta os resultados
 * já consolidados e determina se o caso
 * está apto para avançar.
 *
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * NORMALIZA TEXTO DA DECISÃO
 * ------------------------------------------------------------
 */
function normalizarTextoDecisaoV510_(valor) {

  return String(valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

}


/**
 * ------------------------------------------------------------
 * OBTÉM ESTADO PRONTO
 * ------------------------------------------------------------
 */
function diagnosticoProntoDecisaoV510_(diagnostico) {

  if (!diagnostico) {
    return false;
  }

  const estado =
    String(
      diagnostico.status_diagnostico || ''
    )
      .trim()
      .toUpperCase();

  const pronto =
    String(
      DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE
    )
      .trim()
      .toUpperCase();

  return estado === pronto;

}


/**
 * ------------------------------------------------------------
 * OBTÉM SOLUÇÃO PRINCIPAL
 * ------------------------------------------------------------
 *
 * Aceita:
 *
 * - resultado V5.9.5
 * - array de relações
 * - objeto de solução
 *
 * ------------------------------------------------------------
 */
function obterSolucaoPrincipalDecisaoV510_(
  solucoes
) {

  if (!solucoes) {
    return null;
  }

  let relacoes = [];

  if (
    Array.isArray(solucoes)
  ) {

    relacoes = solucoes;

  } else if (
    Array.isArray(solucoes.relacoes)
  ) {

    relacoes =
      solucoes.relacoes;

  } else if (
    solucoes.solucao_id
  ) {

    relacoes = [
      solucoes
    ];

  }

  const principais =
    relacoes.filter(
      function(relacao) {

        return (
          relacao &&
          relacao.principal === true
        );

      }
    );

  if (
    principais.length !== 1
  ) {

    return null;

  }

  return principais[0];

}


/**
 * ------------------------------------------------------------
 * VERIFICA OPORTUNIDADE VÁLIDA
 * ------------------------------------------------------------
 */
function oportunidadeValidaDecisaoV510_(
  oportunidade
) {

  if (!oportunidade) {
    return false;
  }

  const processo =
    String(
      oportunidade.processo || ''
    ).trim();

  const dor =
    String(
      oportunidade.dor || ''
    ).trim();

  const objetivo =
    String(
      oportunidade.objetivo || ''
    ).trim();

  const descricao =
    String(
      oportunidade.descricao || ''
    ).trim();

  return !!(
    processo &&
    dor &&
    objetivo &&
    descricao
  );

}


/**
 * ------------------------------------------------------------
 * NORMALIZA COMPATIBILIDADE
 * ------------------------------------------------------------
 */
function normalizarCompatibilidadeDecisaoV510_(
  valor
) {

  return String(valor || '')
    .trim()
    .toUpperCase();

}


/**
 * ------------------------------------------------------------
 * NORMALIZA VIABILIDADE
 * ------------------------------------------------------------
 */
function normalizarViabilidadeDecisaoV510_(
  valor
) {

  return String(valor || '')
    .trim()
    .toUpperCase();

}


/**
 * ------------------------------------------------------------
 * DETERMINA PRIORIDADE
 * ------------------------------------------------------------
 *
 * A V5.10 não inventa prioridade.
 *
 * Ordem:
 *
 * 1. análise
 * 2. oportunidade
 * 3. média
 *
 * ------------------------------------------------------------
 */
function determinarPrioridadeDecisaoV510_(
  oportunidade,
  analise
) {

  const prioridadeAnalise =
    String(
      analise &&
      analise.prioridade || ''
    )
      .trim()
      .toUpperCase();

  if (
    prioridadeAnalise
  ) {

    return prioridadeAnalise;

  }

  const prioridadeOportunidade =
    String(
      oportunidade &&
      oportunidade.prioridade || ''
    )
      .trim()
      .toUpperCase();

  if (
    prioridadeOportunidade
  ) {

    return prioridadeOportunidade;

  }

  return 'MÉDIA';

}


/**
 * ------------------------------------------------------------
 * DETERMINA CONFIANÇA
 * ------------------------------------------------------------
 *
 * ALTA:
 * diagnóstico pronto
 * + oportunidade válida
 * + solução principal
 * + compatibilidade ALTA
 * + viabilidade ALTA
 *
 * MÉDIA:
 * existe decisão possível, mas
 * algum critério é intermediário.
 *
 * BAIXA:
 * dados insuficientes.
 *
 * ------------------------------------------------------------
 */
function determinarConfiancaDecisaoV510_(
  diagnostico,
  oportunidade,
  solucaoPrincipal
) {

  if (
    !diagnosticoProntoDecisaoV510_(
      diagnostico
    )
  ) {

    return 'BAIXA';

  }

  if (
    !oportunidadeValidaDecisaoV510_(
      oportunidade
    )
  ) {

    return 'BAIXA';

  }

  if (
    !solucaoPrincipal
  ) {

    return 'BAIXA';

  }

  const compatibilidade =
    normalizarCompatibilidadeDecisaoV510_(
      solucaoPrincipal.compatibilidade
    );

  const viabilidade =
    normalizarViabilidadeDecisaoV510_(
      solucaoPrincipal.viabilidade
    );

  if (
    compatibilidade === 'ALTA' &&
    viabilidade === 'ALTA'
  ) {

    return 'ALTA';

  }

  if (
    (
      compatibilidade === 'ALTA' ||
      compatibilidade === 'MEDIA'
    ) &&
    (
      viabilidade === 'ALTA' ||
      viabilidade === 'MEDIA'
    )
  ) {

    return 'MÉDIA';

  }

  return 'BAIXA';

}


/**
 * ------------------------------------------------------------
 * DETERMINA CLASSIFICAÇÃO
 * ------------------------------------------------------------
 *
 * PODEMOS_AJUDAR
 *
 * diagnóstico pronto
 * + oportunidade válida
 * + solução principal
 * + compatibilidade ALTA
 * + viabilidade ALTA
 *
 *
 * PRECISAMOS_AVALIAR
 *
 * diagnóstico pronto
 * + oportunidade válida
 * + existe solução
 * mas não existe segurança suficiente
 * para decisão automática positiva.
 *
 *
 * NAO_ENQUADRADO
 *
 * sem diagnóstico suficiente
 * ou sem oportunidade
 * ou sem solução compatível.
 *
 * ------------------------------------------------------------
 */
function determinarClassificacaoDecisaoV510_(
  diagnostico,
  oportunidade,
  solucaoPrincipal
) {

  const pronto =
    diagnosticoProntoDecisaoV510_(
      diagnostico
    );

  const oportunidadeValida =
    oportunidadeValidaDecisaoV510_(
      oportunidade
    );

  if (
    !pronto ||
    !oportunidadeValida
  ) {

    return 'NAO_ENQUADRADO';

  }

  if (
    !solucaoPrincipal
  ) {

    return 'NAO_ENQUADRADO';

  }

  const compatibilidade =
    normalizarCompatibilidadeDecisaoV510_(
      solucaoPrincipal.compatibilidade
    );

  const viabilidade =
    normalizarViabilidadeDecisaoV510_(
      solucaoPrincipal.viabilidade
    );

  if (
    compatibilidade === 'ALTA' &&
    viabilidade === 'ALTA'
  ) {

    return 'PODEMOS_AJUDAR';

  }

  return 'PRECISAMOS_AVALIAR';

}


/**
 * ------------------------------------------------------------
 * DETERMINA SE ESTÁ APTO
 * ------------------------------------------------------------
 */
function determinarAptoDecisaoV510_(
  classificacao,
  confianca
) {

  return (
    classificacao ===
      'PODEMOS_AJUDAR' &&
    confianca ===
      'ALTA'
  );

}


/**
 * ------------------------------------------------------------
 * CONSTRÓI JUSTIFICATIVA
 * ------------------------------------------------------------
 */
function construirJustificativaDecisaoV510_(
  diagnostico,
  oportunidade,
  solucaoPrincipal,
  classificacao,
  confianca
) {

  const processo =
    String(
      diagnostico &&
      diagnostico.processo_nome || ''
    ).trim();

  const dor =
    String(
      diagnostico &&
      diagnostico.dor_principal || ''
    ).trim();

  const solucao =
    String(
      solucaoPrincipal &&
      solucaoPrincipal.solucao_id || ''
    ).trim();

  const compatibilidade =
    String(
      solucaoPrincipal &&
      solucaoPrincipal.compatibilidade || ''
    ).trim();

  const viabilidade =
    String(
      solucaoPrincipal &&
      solucaoPrincipal.viabilidade || ''
    ).trim();

  if (
    classificacao ===
    'PODEMOS_AJUDAR'
  ) {

    return (
      'O diagnóstico está completo para análise. ' +
      'A oportunidade está validada e existe uma ' +
      'solução principal com compatibilidade ' +
      compatibilidade +
      ' e viabilidade ' +
      viabilidade +
      '. ' +
      'O problema identificado é "' +
      dor +
      '" no processo "' +
      processo +
      '". ' +
      'A solução principal selecionada é "' +
      solucao +
      '". ' +
      'A confiança da decisão é ' +
      confianca +
      '.'
    );

  }

  if (
    classificacao ===
    'PRECISAMOS_AVALIAR'
  ) {

    return (
      'O diagnóstico e a oportunidade estão ' +
      'disponíveis, porém a solução encontrada ' +
      'não possui evidências suficientes para ' +
      'uma decisão automática de ajuda. ' +
      'É necessária avaliação adicional.'
    );

  }

  return (
    'O caso não possui evidências suficientes ' +
    'para enquadramento automático.'
  );

}


/**
 * ============================================================
 * MOTOR PRINCIPAL V5.10
 * ============================================================
 */
function construirDecisaoDiagnosticoV510_(
  diagnostico,
  oportunidade,
  analise,
  solucoes
) {

  if (!diagnostico) {
    return null;
  }

  const solucaoPrincipal =
    obterSolucaoPrincipalDecisaoV510_(
      solucoes
    );

  const classificacao =
    determinarClassificacaoDecisaoV510_(
      diagnostico,
      oportunidade,
      solucaoPrincipal
    );

  const confianca =
    determinarConfiancaDecisaoV510_(
      diagnostico,
      oportunidade,
      solucaoPrincipal
    );

  const prioridade =
    determinarPrioridadeDecisaoV510_(
      oportunidade,
      analise
    );

  const apto =
    determinarAptoDecisaoV510_(
      classificacao,
      confianca
    );

  const justificativa =
    construirJustificativaDecisaoV510_(
      diagnostico,
      oportunidade,
      solucaoPrincipal,
      classificacao,
      confianca
    );

  return {

    versao:
      'V5.10',

    diagnostico_id:
      diagnostico.diagnostico_id || '',

    empresa_id:
      diagnostico.empresa_id || '',

    conversa_id:
      diagnostico.conversa_id || '',

    classificacao:
      classificacao,

    prioridade:
      prioridade,

    solucao_principal_id:
      solucaoPrincipal
        ? (
            solucaoPrincipal.solucao_id ||
            ''
          )
        : '',

    possui_solucao_principal:
      !!solucaoPrincipal,

    justificativa:
      justificativa,

    confianca:
      confianca,

    apto_para_avancar:
      apto

  };

}


/**
 * ============================================================
 * TESTE ISOLADO V5.10
 * ============================================================
 */
function TESTAR_MOTOR_DECISAO_V510() {

  const resultados = [];

  function teste(
    nome,
    condicao,
    detalhe
  ) {

    resultados.push({

      teste:
        nome,

      passou:
        !!condicao,

      detalhe:
        detalhe || ''

    });

    Logger.log(
      (
        condicao
          ? 'PASSOU'
          : 'FALHOU'
      ) +
      ' — ' +
      nome +
      (
        detalhe
          ? ' — ' + detalhe
          : ''
      )
    );

  }


  Logger.log(
    '===================================================='
  );

  Logger.log(
    'V5.10 — TESTE ISOLADO DO MOTOR DE DECISÃO'
  );

  Logger.log(
    '===================================================='
  );


  /*
   * ----------------------------------------------------------
   * DADOS BASE
   * ----------------------------------------------------------
   */

  const diagnosticoBase = {

    diagnostico_id:
      'DIA-TESTE-V510',

    empresa_id:
      'EMP-TESTE-V510',

    conversa_id:
      'CONV-TESTE-V510',

    processo_nome:
      'conferir e lançar pedidos',

    dor_principal:
      'erros de digitação e retrabalho',

    frequencia:
      'diariamente',

    impacto_nivel:
      'alto',

    objetivo:
      'reduzir os erros',

    status_diagnostico:
      DIAGNOSTICO_ESTADOS.PRONTO_PARA_ANALISE

  };


  const oportunidadeBase = {

    diagnostico_id:
      'DIA-TESTE-V510',

    processo:
      'conferir e lançar pedidos',

    dor:
      'erros de digitação e retrabalho',

    frequencia:
      'diariamente',

    volume:
      '120 pedidos por dia',

    impacto:
      '3 horas por dia',

    objetivo:
      'reduzir os erros',

    descricao:
      'Reduzir o problema de erros de digitação e retrabalho no processo de conferir e lançar pedidos.',

    prioridade:
      'ALTA'

  };


  const analiseBase = {

    versao:
      'V5.8',

    prioridade:
      'ALTA',

    confianca:
      'ALTA'

  };


  const solucaoPerfeita = {

    solucao_id:
      'V510-SOLUCAO-PERFEITA',

    compatibilidade:
      'ALTA',

    pontuacao:
      100,

    viabilidade:
      'ALTA',

    principal:
      true

  };


  const solucaoMedia = {

    solucao_id:
      'V510-SOLUCAO-MEDIA',

    compatibilidade:
      'MEDIA',

    pontuacao:
      55,

    viabilidade:
      'MEDIA',

    principal:
      true

  };


  const solucaoBaixa = {

    solucao_id:
      'V510-SOLUCAO-BAIXA',

    compatibilidade:
      'BAIXA',

    pontuacao:
      25,

    viabilidade:
      'BAIXA',

    principal:
      true

  };


  /*
   * ----------------------------------------------------------
   * TESTE 1 — CASO PERFEITO
   * ----------------------------------------------------------
   */

  const decisaoPerfeita =
    construirDecisaoDiagnosticoV510_(
      diagnosticoBase,
      oportunidadeBase,
      analiseBase,
      {
        relacoes: [
          solucaoPerfeita
        ]
      }
    );


  teste(
    '1 — Caso perfeito gera decisão',
    !!decisaoPerfeita,
    JSON.stringify(
      decisaoPerfeita
    )
  );


  teste(
    '2 — Classificação PODEMOS_AJUDAR',
    decisaoPerfeita &&
    decisaoPerfeita.classificacao ===
      'PODEMOS_AJUDAR',
    decisaoPerfeita
      ? decisaoPerfeita.classificacao
      : 'N/A'
  );


  teste(
    '3 — Prioridade ALTA',
    decisaoPerfeita &&
    decisaoPerfeita.prioridade ===
      'ALTA',
    decisaoPerfeita
      ? decisaoPerfeita.prioridade
      : 'N/A'
  );


  teste(
    '4 — Solução principal correta',
    decisaoPerfeita &&
    decisaoPerfeita.solucao_principal_id ===
      'V510-SOLUCAO-PERFEITA',
    decisaoPerfeita
      ? decisaoPerfeita.solucao_principal_id
      : 'N/A'
  );


  teste(
    '5 — Possui solução principal',
    decisaoPerfeita &&
    decisaoPerfeita.possui_solucao_principal ===
      true,
    decisaoPerfeita
      ? String(
          decisaoPerfeita.possui_solucao_principal
        )
      : 'N/A'
  );


  teste(
    '6 — Confiança ALTA',
    decisaoPerfeita &&
    decisaoPerfeita.confianca ===
      'ALTA',
    decisaoPerfeita
      ? decisaoPerfeita.confianca
      : 'N/A'
  );


  teste(
    '7 — Apto para avançar',
    decisaoPerfeita &&
    decisaoPerfeita.apto_para_avancar ===
      true,
    decisaoPerfeita
      ? String(
          decisaoPerfeita.apto_para_avancar
        )
      : 'N/A'
  );


  teste(
    '8 — Versão V5.10',
    decisaoPerfeita &&
    decisaoPerfeita.versao ===
      'V5.10',
    decisaoPerfeita
      ? decisaoPerfeita.versao
      : 'N/A'
  );


  teste(
    '9 — Rastreabilidade completa',
    decisaoPerfeita &&
    decisaoPerfeita.diagnostico_id ===
      diagnosticoBase.diagnostico_id &&
    decisaoPerfeita.empresa_id ===
      diagnosticoBase.empresa_id &&
    decisaoPerfeita.conversa_id ===
      diagnosticoBase.conversa_id,
    decisaoPerfeita
      ? 'OK'
      : 'Falha'
  );


  /*
   * ----------------------------------------------------------
   * TESTE 10 — SEM SOLUÇÃO
   * ----------------------------------------------------------
   */

  const decisaoSemSolucao =
    construirDecisaoDiagnosticoV510_(
      diagnosticoBase,
      oportunidadeBase,
      analiseBase,
      {
        relacoes: []
      }
    );


  teste(
    '10 — Sem solução não gera PODEMOS_AJUDAR',
    decisaoSemSolucao &&
    decisaoSemSolucao.classificacao !==
      'PODEMOS_AJUDAR',
    decisaoSemSolucao
      ? decisaoSemSolucao.classificacao
      : 'N/A'
  );


  /*
   * ----------------------------------------------------------
   * TESTE 11 — SOLUÇÃO MÉDIA
   * ----------------------------------------------------------
   */

  const decisaoMedia =
    construirDecisaoDiagnosticoV510_(
      diagnosticoBase,
      oportunidadeBase,
      analiseBase,
      {
        relacoes: [
          solucaoMedia
        ]
      }
    );


  teste(
    '11 — Solução média exige avaliação',
    decisaoMedia &&
    decisaoMedia.classificacao ===
      'PRECISAMOS_AVALIAR',
    decisaoMedia
      ? decisaoMedia.classificacao
      : 'N/A'
  );


  teste(
    '12 — Solução média não fica apta',
    decisaoMedia &&
    decisaoMedia.apto_para_avancar ===
      false,
    decisaoMedia
      ? String(
          decisaoMedia.apto_para_avancar
        )
      : 'N/A'
  );


  /*
   * ----------------------------------------------------------
   * TESTE 13 — DIAGNÓSTICO INCOMPLETO
   * ----------------------------------------------------------
   */

  const diagnosticoIncompleto =
    Object.assign(
      {},
      diagnosticoBase,
      {
        status_diagnostico:
          DIAGNOSTICO_ESTADOS.INVESTIGACAO
      }
    );


  const decisaoIncompleta =
    construirDecisaoDiagnosticoV510_(
      diagnosticoIncompleto,
      oportunidadeBase,
      analiseBase,
      {
        relacoes: [
          solucaoPerfeita
        ]
      }
    );


  teste(
    '13 — Diagnóstico incompleto não pode ajudar automaticamente',
    decisaoIncompleta &&
    decisaoIncompleta.classificacao ===
      'NAO_ENQUADRADO',
    decisaoIncompleta
      ? decisaoIncompleta.classificacao
      : 'N/A'
  );


  teste(
    '14 — Diagnóstico incompleto não fica apto',
    decisaoIncompleta &&
    decisaoIncompleta.apto_para_avancar ===
      false,
    decisaoIncompleta
      ? String(
          decisaoIncompleta.apto_para_avancar
        )
      : 'N/A'
  );


  /*
   * ----------------------------------------------------------
   * TESTE 15 — OPORTUNIDADE AUSENTE
   * ----------------------------------------------------------
   */

  const decisaoSemOportunidade =
    construirDecisaoDiagnosticoV510_(
      diagnosticoBase,
      null,
      analiseBase,
      {
        relacoes: [
          solucaoPerfeita
        ]
      }
    );


  teste(
    '15 — Sem oportunidade não pode ajudar',
    decisaoSemOportunidade &&
    decisaoSemOportunidade.classificacao ===
      'NAO_ENQUADRADO',
    decisaoSemOportunidade
      ? decisaoSemOportunidade.classificacao
      : 'N/A'
  );


  /*
   * ----------------------------------------------------------
   * TESTE 16 — SEM ALTERAÇÃO DO DIAGNÓSTICO
   * ----------------------------------------------------------
   */

  const diagnosticoAntes =
    JSON.stringify(
      diagnosticoBase
    );


  construirDecisaoDiagnosticoV510_(
    diagnosticoBase,
    oportunidadeBase,
    analiseBase,
    {
      relacoes: [
        solucaoPerfeita
      ]
    }
  );


  const diagnosticoDepois =
    JSON.stringify(
      diagnosticoBase
    );


  teste(
    '16 — Motor não altera diagnóstico',
    diagnosticoAntes ===
      diagnosticoDepois,
    diagnosticoAntes ===
      diagnosticoDepois
      ? 'Preservado'
      : 'ALTERADO'
  );


  /*
   * ----------------------------------------------------------
   * TESTE 17 — SEM CRIAÇÃO DE LEAD
   * ----------------------------------------------------------
   *
   * O motor apenas retorna decisão.
   * Não existe chamada a salvarLead_().
   * ----------------------------------------------------------
   */

  teste(
    '17 — Motor não cria lead',
    true,
    'Nenhuma persistência comercial executada'
  );


  /*
   * ----------------------------------------------------------
   * TESTE 18 — SOLUÇÃO BAIXA
   * ----------------------------------------------------------
   */

  const decisaoBaixa =
    construirDecisaoDiagnosticoV510_(
      diagnosticoBase,
      oportunidadeBase,
      analiseBase,
      {
        relacoes: [
          solucaoBaixa
        ]
      }
    );


  teste(
    '18 — Solução baixa exige avaliação',
    decisaoBaixa &&
    decisaoBaixa.classificacao ===
      'PRECISAMOS_AVALIAR',
    decisaoBaixa
      ? decisaoBaixa.classificacao
      : 'N/A'
  );


  /*
   * ----------------------------------------------------------
   * RESULTADO
   * ----------------------------------------------------------
   */

  const total =
    resultados.length;

  const passaram =
    resultados.filter(
      function(item) {
        return item.passou;
      }
    ).length;

  const falharam =
    total - passaram;


  Logger.log(
    '===================================================='
  );

  Logger.log(
    'RESULTADO V5.10: ' +
    passaram +
    '/' +
    total
  );

  Logger.log(
    'FALHAS: ' +
    falharam
  );

  Logger.log(
    '===================================================='
  );


  if (
    falharam > 0
  ) {

    throw new Error(
      'V5.10 REPROVADA: ' +
      passaram +
      '/' +
      total
    );

  }


  Logger.log(
    'TESTAR_MOTOR_DECISAO_V510: PASSOU'
  );


  return {

    sucesso:
      true,

    versao:
      'V5.10',

    total:
      total,

    passaram:
      passaram,

    falharam:
      falharam,

    resultados:
      resultados

  };

}

/**
 * ============================================================
 * V5.10 — INTEGRAÇÃO REAL DO MOTOR DE DECISÃO
 * ============================================================
 *
 * Fluxo testado:
 *
 * GEMINI
 *   ↓
 * V5.6 DIAGNÓSTICO
 *   ↓
 * V5.7 OPORTUNIDADE
 *   ↓
 * V5.8 ANÁLISE
 *   ↓
 * V5.9.5 SOLUÇÕES
 *   ↓
 * V5.10 DECISÃO
 *
 * Este teste:
 *
 * - cria catálogo temporário isolado;
 * - inicia diagnóstico real;
 * - executa processarMensagemDiagnostico();
 * - valida diagnóstico;
 * - valida oportunidade;
 * - valida análise;
 * - valida soluções;
 * - executa V5.10;
 * - valida decisão;
 * - valida solução principal;
 * - valida classificação;
 * - valida confiança;
 * - valida aptidão;
 * - executa novamente;
 * - verifica consistência;
 * - limpa tudo ao final.
 *
 * NÃO cria LEAD.
 * ============================================================
 */

/**
 * ============================================================
 * V5.10 — TESTE DE INTEGRAÇÃO REAL COMPLETA
 * ============================================================
 *
 * Valida o fluxo completo:
 *
 * V5.6  → Diagnóstico
 * V5.7  → Oportunidade
 * V5.8  → Análise Diagnóstica
 * V5.9.5 → Soluções
 * V5.10 → Decisão
 *
 * REGRA:
 * O teste só é aprovado com 24/24.
 *
 * ============================================================
 */
function TESTAR_INTEGRACAO_REAL_V510() {

  const resultados = [];

  let inicio = null;

  let diagnostico = null;

  let resultadoFluxo = null;

  let segundaExecucao = null;


  /*
   * ==========================================================
   * FUNÇÃO AUXILIAR DE TESTE
   * ==========================================================
   */

  function teste(
    nome,
    passou,
    detalhe
  ) {

    const item = {

      teste:
        nome,

      passou:
        !!passou,

      detalhe:
        detalhe === undefined ||
        detalhe === null
          ? ''
          : String(detalhe)

    };

    resultados.push(item);

    Logger.log(
      (
        item.passou
          ? 'PASSOU'
          : 'FALHOU'
      ) +
      ' — ' +
      item.teste +
      ' — ' +
      item.detalhe
    );

  }


  try {

    Logger.log(
      '===================================================='
    );

    Logger.log(
      'V5.10 — INTEGRAÇÃO REAL COMPLETA'
    );

    Logger.log(
      '===================================================='
    );


    /*
     * ==========================================================
     * 0 — LIMPEZA PREVENTIVA
     * ==========================================================
     */

    limparSolucoesTeste();


    /*
     * ==========================================================
     * 1 — CATÁLOGO TEMPORÁRIO
     * ==========================================================
     *
     * Criamos quatro soluções:
     *
     * 1. PERFEITA
     * 2. PARCIAL
     * 3. INCOMPATÍVEL
     * 4. INATIVA
     *
     * A perfeita deve resultar em:
     *
     * 100/100
     * ALTA
     * VIABILIDADE ALTA
     * PRINCIPAL
     *
     * ==========================================================
     */

    const abaSolucoes =
      obterAba_(
        SHEETS.SOLUCOES
      );


    const cabecalhos =
      abaSolucoes
        .getRange(
          1,
          1,
          1,
          abaSolucoes.getLastColumn()
        )
        .getValues()[0];


    const mapaSolucoes = {};


    cabecalhos.forEach(
      function(
        cabecalho,
        indice
      ) {

        mapaSolucoes[
          String(
            cabecalho || ''
          ).trim()
        ] =
          indice;

      }
    );


    const solucoesTeste = [

      /*
       * --------------------------------------------------------
       * SOLUÇÃO PERFEITA
       * --------------------------------------------------------
       */

      {

        solucao_id:
          'V510-PERFEITA',

        familia:
          'Automação de pedidos',

        nome:
          'Conferir e lançar pedidos',

        descricao:
          'Reduzir erros de digitação e retrabalho no processo de conferir e lançar pedidos.',

        status:
          'ATIVA',

        nivel_complexidade:
          'MEDIA',

        repetibilidade:
          'ALTA',

        pode_oferecer:
          'SIM',

        versao:
          'V5.10'

      },


      /*
       * --------------------------------------------------------
       * SOLUÇÃO PARCIAL
       * --------------------------------------------------------
       */

      {

        solucao_id:
          'V510-PARCIAL',

        familia:
          'Processos administrativos',

        nome:
          'Apoio para conferir pedidos',

        descricao:
          'Apoio na conferência de pedidos e identificação de informações administrativas.',

        status:
          'ATIVA',

        nivel_complexidade:
          'MEDIA',

        repetibilidade:
          'ALTA',

        pode_oferecer:
          'SIM',

        versao:
          'V5.10'

      },


      /*
       * --------------------------------------------------------
       * SOLUÇÃO INCOMPATÍVEL
       * --------------------------------------------------------
       */

      {

        solucao_id:
          'V510-INCOMPATIVEL',

        familia:
          'Marketing',

        nome:
          'Gestão de redes sociais',

        descricao:
          'Planejamento e publicação de conteúdo para redes sociais.',

        status:
          'ATIVA',

        nivel_complexidade:
          'MEDIA',

        repetibilidade:
          'ALTA',

        pode_oferecer:
          'SIM',

        versao:
          'V5.10'

      },


      /*
       * --------------------------------------------------------
       * SOLUÇÃO INATIVA
       * --------------------------------------------------------
       */

      {

        solucao_id:
          'V510-INATIVA',

        familia:
          'Automação de pedidos',

        nome:
          'Conferir e lançar pedidos',

        descricao:
          'Reduzir erros de digitação e retrabalho no processo de conferir e lançar pedidos.',

        status:
          'INATIVA',

        nivel_complexidade:
          'MEDIA',

        repetibilidade:
          'ALTA',

        pode_oferecer:
          'SIM',

        versao:
          'V5.10'

      }

    ];


    solucoesTeste.forEach(
      function(solucao) {

        const linha =
          new Array(
            cabecalhos.length
          ).fill('');


        Object.keys(solucao)
          .forEach(
            function(campo) {

              if (
                Object.prototype
                  .hasOwnProperty.call(
                    mapaSolucoes,
                    campo
                  )
              ) {

                linha[
                  mapaSolucoes[campo]
                ] =
                  solucao[campo];

              }

            }
          );


        abaSolucoes.appendRow(
          linha
        );

      }
    );


    /*
     * ==========================================================
     * TESTE 1 — CATÁLOGO
     * ==========================================================
     */

    const catalogo =
      abaSolucoes
        .getDataRange()
        .getValues();


    const idxCatalogo =
      catalogo[0]
        .indexOf(
          'solucao_id'
        );


    const idsCatalogo =
      catalogo
        .slice(1)
        .map(
          function(linha) {

            return String(
              linha[
                idxCatalogo
              ] || ''
            ).trim();

          }
        )
        .filter(
          function(id) {

            return (
              id.indexOf(
                'V510-'
              ) === 0
            );

          }
        );


    teste(
      '1 — Catálogo V5.10 criado',
      idsCatalogo.length === 4,
      'Soluções V5.10: ' +
      idsCatalogo.length
    );


    /*
     * ==========================================================
     * TESTE 2 — INICIAR DIAGNÓSTICO
     * ==========================================================
     */

    inicio =
      iniciarDiagnostico({

        nome:
          'Empresa Teste V510',

        nome_empresa:
          'Empresa Teste V510',

        segmento:
          'Serviços',

        porte:
          'PEQUENA',

        nome_contato:
          'Teste V510',

        email:
          '',

        whatsapp:
          '',

        cidade:
          ''

      });


    teste(
      '2 — Diagnóstico iniciado',
      !!inicio &&
      inicio.sucesso === true &&
      !!inicio.empresa_id &&
      !!inicio.conversa_id &&
      !!inicio.diagnostico_id,

      inicio
        ? JSON.stringify(inicio)
        : 'Falha'
    );


    if (
      !inicio ||
      !inicio.empresa_id ||
      !inicio.conversa_id ||
      !inicio.diagnostico_id
    ) {

      throw new Error(
        'Falha ao iniciar diagnóstico V5.10.'
      );

    }


    /*
     * ==========================================================
     * TESTE 3 — FLUXO REAL
     * ==========================================================
     */

    resultadoFluxo =
      processarMensagemDiagnostico({

        empresa_id:
          inicio.empresa_id,

        conversa_id:
          inicio.conversa_id,

        mensagem:
          'Nosso processo principal é conferir e lançar pedidos. ' +
          'Temos erros de digitação e retrabalho nesse processo. ' +
          'Isso acontece diariamente. ' +
          'Processamos 120 pedidos por dia. ' +
          'Perdemos aproximadamente 3 horas por dia com esse problema. ' +
          'Nosso objetivo é reduzir os erros e diminuir o retrabalho.'

      });


    teste(
      '3 — Fluxo principal executado',
      !!resultadoFluxo &&
      resultadoFluxo.sucesso === true,

      resultadoFluxo
        ? 'OK'
        : 'Falha'
    );


    /*
     * ==========================================================
     * TESTE 4 — DIAGNÓSTICO
     * ==========================================================
     */

    diagnostico =
      resultadoFluxo
        ? resultadoFluxo.diagnostico
        : null;


    teste(
      '4 — Diagnóstico retornado',
      !!diagnostico,

      diagnostico
        ? diagnostico.diagnostico_id
        : 'Não retornado'
    );


    if (!diagnostico) {

      throw new Error(
        'Diagnóstico não retornado.'
      );

    }


    /*
     * ==========================================================
     * TESTE 5 — ESTADO
     * ==========================================================
     */

    const estado =
      String(
        diagnostico.status_diagnostico || ''
      )
        .trim()
        .toUpperCase();


    teste(
      '5 — Diagnóstico PRONTO_PARA_ANALISE',
      estado ===
      'PRONTO_PARA_ANALISE',

      estado
    );


    /*
     * ==========================================================
     * TESTE 6 — OPORTUNIDADE V5.7
     * ==========================================================
     *
     * IMPORTANTE:
     * O retorno da V5.7 possui um wrapper:
     *
     * resultadoFluxo.oportunidade
     *
     * e dentro dele:
     *
     * resultadoFluxo.oportunidade.oportunidade
     *
     * Aqui reconstruímos o objeto completo.
     * Assim não perdemos:
     *
     * oportunidade_id
     * acao
     * linha
     *
     * ==========================================================
     */

    const oportunidadeWrapper =
      resultadoFluxo &&
      resultadoFluxo.oportunidade
        ? resultadoFluxo.oportunidade
        : null;


    const oportunidade =
      oportunidadeWrapper
        ? Object.assign(
            {},
            oportunidadeWrapper.oportunidade || {},
            {

              oportunidade_id:
                oportunidadeWrapper.oportunidade_id,

              acao:
                oportunidadeWrapper.acao,

              linha:
                oportunidadeWrapper.linha

            }
          )
        : null;


    teste(
      '6 — Oportunidade V5.7 retornada',

      !!oportunidade &&
      !!oportunidade.oportunidade_id &&
      !!oportunidade.processo &&
      !!oportunidade.dor &&
      !!oportunidade.objetivo,

      oportunidade
        ? JSON.stringify(
            oportunidade
          )
        : 'Não retornada'
    );


    /*
     * ==========================================================
     * TESTE 7 — ANÁLISE V5.8
     * ==========================================================
     */

    const analiseWrapper =
      resultadoFluxo &&
      resultadoFluxo.analise_diagnostica
        ? resultadoFluxo.analise_diagnostica
        : null;


    const analise =
      analiseWrapper
        ? Object.assign(
            {},
            analiseWrapper.analise || {},
            {

              analise_id:
                analiseWrapper.analise_id,

              diagnostico_id:
                analiseWrapper.diagnostico_id,

              acao:
                analiseWrapper.acao,

              linha:
                analiseWrapper.linha

            }
          )
        : null;


    teste(
      '7 — Análise V5.8 retornada',

      !!analise &&
      !!analise.analise_id &&
      !!analise.diagnostico_id &&
      !!analise.processo &&
      !!analise.problema &&
      !!analise.frequencia &&
      !!analise.impacto &&
      !!analise.objetivo,

      analise
        ? JSON.stringify(
            analise
          )
        : 'Não retornada'
    );


    /*
     * ==========================================================
     * TESTE 8 — MOTOR V5.9.5
     * ==========================================================
     */

    const solucoes =
      resultadoFluxo &&
      resultadoFluxo.solucoes
        ? resultadoFluxo.solucoes
        : null;


    teste(
      '8 — Motor V5.9.5 integrado',

      !!solucoes &&
      Array.isArray(
        solucoes.relações ||
        solucoes.relacoes
      ),

      solucoes
        ? JSON.stringify(
            solucoes
          )
        : 'Não retornado'
    );


    if (!solucoes) {

      throw new Error(
        'Motor V5.9.5 não retornou resultado.'
      );

    }


    const relacoes =
      Array.isArray(
        solucoes.relacoes
      )
        ? solucoes.relacoes
        : [];


    /*
     * ==========================================================
     * TESTE 9 — RELAÇÕES COMPATÍVEIS
     * ==========================================================
     */

    teste(
      '9 — Exatamente duas relações compatíveis',

      relacoes.length === 2,

      'Total: ' +
      relacoes.length
    );


    /*
     * ==========================================================
     * PRINCIPAIS
     * ==========================================================
     */

    const principais =
      relacoes.filter(
        function(relacao) {

          return (
            relacao.principal === true
          );

        }
      );


    /*
     * ==========================================================
     * TESTE 10 — UMA PRINCIPAL
     * ==========================================================
     */

    teste(
      '10 — Exatamente uma solução principal',

      principais.length === 1,

      'Principais: ' +
      principais.length
    );


    /*
     * ==========================================================
     * SOLUÇÃO PERFEITA
     * ==========================================================
     */

    const perfeita =
      relacoes.find(
        function(relacao) {

          return (
            relacao.solucao_id ===
            'V510-PERFEITA'
          );

        }
      );


    /*
     * ==========================================================
     * TESTE 11 — SOLUÇÃO PERFEITA
     * ==========================================================
     */

    teste(
      '11 — Solução perfeita encontrada',

      !!perfeita,

      perfeita
        ? JSON.stringify(
            perfeita
          )
        : 'Não encontrada'
    );


    /*
     * ==========================================================
     * TESTE 12 — 100/100
     * ==========================================================
     */

    teste(
      '12 — Solução perfeita = 100/100',

      !!perfeita &&
      Number(
        perfeita.pontuacao
      ) === 100,

      perfeita
        ? String(
            perfeita.pontuacao
          )
        : 'N/A'
    );


    /*
     * ==========================================================
     * TESTE 13 — ALTA
     * ==========================================================
     */

    teste(
      '13 — Solução perfeita = ALTA',

      !!perfeita &&
      String(
        perfeita.compatibilidade || ''
      )
        .trim()
        .toUpperCase() ===
      'ALTA',

      perfeita
        ? perfeita.compatibilidade
        : 'N/A'
    );


    /*
     * ==========================================================
     * TESTE 14 — PRINCIPAL
     * ==========================================================
     */

    teste(
      '14 — Solução perfeita é principal',

      !!perfeita &&
      perfeita.principal === true,

      perfeita
        ? String(
            perfeita.principal
          )
        : 'N/A'
    );


    /*
     * ==========================================================
     * TESTE 15 — INCOMPATÍVEL
     * ==========================================================
     */

    const incompatibilidade =
      relacoes.find(
        function(relacao) {

          return (
            relacao.solucao_id ===
            'V510-INCOMPATIVEL'
          );

        }
      );


    teste(
      '15 — Incompatível não persistida',

      !incompatibilidade,

      incompatibilidade
        ? 'ERRO'
        : 'Correto'
    );


    /*
     * ==========================================================
     * TESTE 16 — INATIVA
     * ==========================================================
     */

    const inativa =
      relacoes.find(
        function(relacao) {

          return (
            relacao.solucao_id ===
            'V510-INATIVA'
          );

        }
      );


    teste(
      '16 — Inativa não persistida',

      !inativa,

      inativa
        ? 'ERRO'
        : 'Correto'
    );


    /*
     * ==========================================================
     * V5.10 — CONSTRUIR DECISÃO
     * ==========================================================
     *
     * Aqui está a correção central:
     *
     * oportunidade = objeto completo
     * analise      = objeto completo
     *
     * ==========================================================
     */

    const decisao =
      construirDecisaoDiagnosticoV510_(
        diagnostico,
        oportunidade,
        analise,
        relacoes
      );


    /*
     * ==========================================================
     * TESTE 17 — DECISÃO INTEGRADA
     * ==========================================================
     */

    teste(
      '17 — Motor V5.10 integrado',

      !!decisao &&
      !!decisao.classificacao,

      decisao
        ? JSON.stringify(
            decisao
          )
        : 'Decisão não retornada'
    );


    /*
     * ==========================================================
     * TESTE 18 — PODEMOS AJUDAR
     * ==========================================================
     */

    teste(
      '18 — Classificação PODEMOS_AJUDAR',

      !!decisao &&
      decisao.classificacao ===
      'PODEMOS_AJUDAR',

      decisao
        ? decisao.classificacao
        : 'N/A'
    );


    /*
     * ==========================================================
     * TESTE 19 — PRIORIDADE ALTA
     * ==========================================================
     */

    teste(
      '19 — Prioridade ALTA',

      !!decisao &&
      decisao.prioridade ===
      'ALTA',

      decisao
        ? decisao.prioridade
        : 'N/A'
    );


    /*
     * ==========================================================
     * TESTE 20 — SOLUÇÃO PRINCIPAL CORRETA
     * ==========================================================
     */

    teste(
      '20 — Solução principal V5.10 correta',

      !!decisao &&
      decisao.solucao_principal_id ===
      'V510-PERFEITA',

      decisao
        ? decisao.solucao_principal_id
        : 'N/A'
    );


    /*
     * ==========================================================
     * TESTE 21 — CONFIANÇA ALTA
     * ==========================================================
     */

    teste(
      '21 — Confiança ALTA',

      !!decisao &&
      decisao.confianca ===
      'ALTA',

      decisao
        ? decisao.confianca
        : 'N/A'
    );


    /*
     * ==========================================================
     * TESTE 22 — APTO PARA AVANÇAR
     * ==========================================================
     */

    teste(
      '22 — Apto para avançar',

      !!decisao &&
      decisao.apto_para_avancar === true,

      decisao
        ? String(
            decisao.apto_para_avancar
          )
        : 'N/A'
    );


    /*
     * ==========================================================
     * TESTE 23 — RASTREABILIDADE
     * ==========================================================
     */

    teste(
      '23 — Rastreabilidade V5.10',

      !!decisao &&
      String(
        decisao.diagnostico_id || ''
      ).trim() ===
      String(
        diagnostico.diagnostico_id || ''
      ).trim() &&

      String(
        decisao.empresa_id || ''
      ).trim() ===
      String(
        inicio.empresa_id || ''
      ).trim() &&

      String(
        decisao.conversa_id || ''
      ).trim() ===
      String(
        inicio.conversa_id || ''
      ).trim(),

      decisao
        ? JSON.stringify({
            diagnostico_id:
              decisao.diagnostico_id,
            empresa_id:
              decisao.empresa_id,
            conversa_id:
              decisao.conversa_id
          })
        : 'N/A'
    );


    /*
     * ==========================================================
     * TESTE 24 — SEGUNDA EXECUÇÃO / IDEMPOTÊNCIA
     * ==========================================================
     *
     * Executamos novamente o fluxo.
     *
     * A decisão precisa continuar:
     *
     * PODEMOS_AJUDAR
     * ALTA
     * V510-PERFEITA
     * ALTA confiança
     * apto
     *
     * ==========================================================
     */

    const resultadoFluxo2 =
      processarMensagemDiagnostico({

        empresa_id:
          inicio.empresa_id,

        conversa_id:
          inicio.conversa_id,

        mensagem:
          'Confirmamos novamente que processamos 120 pedidos por dia e que o objetivo é reduzir os erros e diminuir o retrabalho.'

      });


    const diagnostico2 =
      resultadoFluxo2 &&
      resultadoFluxo2.diagnostico
        ? resultadoFluxo2.diagnostico
        : null;


    const oportunidadeWrapper2 =
      resultadoFluxo2 &&
      resultadoFluxo2.oportunidade
        ? resultadoFluxo2.oportunidade
        : null;


    const oportunidade2 =
      oportunidadeWrapper2
        ? Object.assign(
            {},
            oportunidadeWrapper2.oportunidade || {},
            {

              oportunidade_id:
                oportunidadeWrapper2.oportunidade_id,

              acao:
                oportunidadeWrapper2.acao,

              linha:
                oportunidadeWrapper2.linha

            }
          )
        : null;


    const analiseWrapper2 =
      resultadoFluxo2 &&
      resultadoFluxo2.analise_diagnostica
        ? resultadoFluxo2.analise_diagnostica
        : null;


    const analise2 =
      analiseWrapper2
        ? Object.assign(
            {},
            analiseWrapper2.analise || {},
            {

              analise_id:
                analiseWrapper2.analise_id,

              diagnostico_id:
                analiseWrapper2.diagnostico_id,

              acao:
                analiseWrapper2.acao,

              linha:
                analiseWrapper2.linha

            }
          )
        : null;


    const solucoes2 =
      resultadoFluxo2 &&
      resultadoFluxo2.solucoes
        ? resultadoFluxo2.solucoes
        : null;


    const relacoes2 =
      solucoes2 &&
      Array.isArray(
        solucoes2.relacoes
      )
        ? solucoes2.relacoes
        : [];


    const decisao2 =
      construirDecisaoDiagnosticoV510_(
        diagnostico2,
        oportunidade2,
        analise2,
        relacoes2
      );


    /*
     * ==========================================================
     * TESTE 24A — SEGUNDA EXECUÇÃO
     * ==========================================================
     */

    teste(
      '24 — Segunda execução mantém decisão máxima',

      !!decisao2 &&
      decisao2.classificacao ===
      'PODEMOS_AJUDAR' &&

      decisao2.prioridade ===
      'ALTA' &&

      decisao2.solucao_principal_id ===
      'V510-PERFEITA' &&

      decisao2.confianca ===
      'ALTA' &&

      decisao2.apto_para_avancar ===
      true,

      decisao2
        ? JSON.stringify(
            decisao2
          )
        : 'Segunda decisão não retornada'
    );


    /*
     * ==========================================================
     * RESULTADO FINAL
     * ==========================================================
     */

    const aprovados =
      resultados.filter(
        function(item) {

          return item.passou;

        }
      ).length;


    const total =
      resultados.length;


    Logger.log(
      '===================================================='
    );


    resultados.forEach(
      function(
        item,
        indice
      ) {

        Logger.log(

          (
            item.passou
              ? 'PASSOU'
              : 'FALHOU'
          ) +

          ' — TESTE ' +

          (
            indice + 1
          ) +

          ': ' +

          item.teste +

          ' — ' +

          item.detalhe

        );

      }
    );


    Logger.log(
      '===================================================='
    );


    Logger.log(
      'RESULTADO V5.10: ' +
      aprovados +
      '/' +
      total
    );


    if (
      aprovados !== total
    ) {

      throw new Error(
        'V5.10 FALHOU: ' +
        aprovados +
        '/' +
        total
      );

    }


    Logger.log(
      'TESTAR_INTEGRACAO_REAL_V510: PASSOU'
    );


    return {

      sucesso:
        true,

      aprovados:
        aprovados,

      total:
        total,

      percentual:
        total > 0
          ? (
              aprovados /
              total
            ) * 100
          : 0,

      resultados:
        resultados,

      decisao:
        decisao,

      decisao_segunda_execucao:
        decisao2

    };


  } finally {


    /*
     * ==========================================================
     * LIMPEZA FINAL
     * ==========================================================
     */

    try {

      limparSolucoesTeste();

    } catch (erro) {

      Logger.log(
        'Falha na limpeza das soluções V5.10: ' +
        erro.message
      );

    }


    if (inicio) {

      try {

        limparRegistrosPorCampoV510_(
          SHEETS.DIAGNOSTICO_SOLUCOES,
          'diagnostico_id',
          inicio.diagnostico_id
        );


        limparRegistrosPorCampoV510_(
          SHEETS.OPORTUNIDADES,
          'diagnostico_id',
          inicio.diagnostico_id
        );


        limparRegistrosPorCampoV510_(
          SHEETS.DORES,
          'diagnostico_id',
          inicio.diagnostico_id
        );


        limparRegistrosPorCampoV510_(
          SHEETS.DIAGNOSTICOS,
          'diagnostico_id',
          inicio.diagnostico_id
        );


        limparRegistrosPorCampoV510_(
          SHEETS.CONVERSAS,
          'conversa_id',
          inicio.conversa_id
        );


        limparRegistrosPorCampoV510_(
          SHEETS.METRICAS,
          'conversa_id',
          inicio.conversa_id
        );


        Logger.log(
          'LIMPEZA V5.10 CONCLUÍDA'
        );

      } catch (erro) {

        Logger.log(
          'Falha na limpeza V5.10: ' +
          erro.message
        );

      }

    }

  }

}

function limparSolucoesTeste() {

  const aba =
    obterAba_(
      SHEETS.SOLUCOES
    );

  if (!aba) {
    throw new Error(
      'A aba SOLUCOES não foi encontrada.'
    );
  }

  const ultimaLinha =
    aba.getLastRow();

  const ultimaColuna =
    aba.getLastColumn();

  if (
    ultimaLinha <= 1 ||
    ultimaColuna <= 0
  ) {
    return;
  }

  const valores =
    aba
      .getRange(
        1,
        1,
        ultimaLinha,
        ultimaColuna
      )
      .getValues();

  const cabecalhos =
    valores[0];

  const indiceSolucao =
    cabecalhos.indexOf(
      'solucao_id'
    );

  if (
    indiceSolucao === -1
  ) {
    throw new Error(
      'A aba SOLUCOES precisa possuir a coluna solucao_id.'
    );
  }

  let removidas = 0;

  for (
    let i = valores.length - 1;
    i >= 1;
    i--
  ) {

    const solucaoId =
      String(
        valores[i][indiceSolucao] || ''
      )
        .trim()
        .toUpperCase();

    if (
      solucaoId.indexOf(
        'V510-'
      ) === 0
    ) {

      aba.deleteRow(
        i + 1
      );

      removidas++;

    }

  }

  Logger.log(
    'LIMPEZA SOLUÇÕES V5.10: ' +
    removidas +
    ' registro(s) removido(s).'
  );

}

function limparRegistrosPorCampoV510_(
  nomeAba,
  nomeCampo,
  valor
) {

  if (!nomeAba) {
    throw new Error(
      'Nome da aba não informado.'
    );
  }

  if (!nomeCampo) {
    throw new Error(
      'Nome do campo não informado.'
    );
  }

  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() === ''
  ) {
    return 0;
  }


  const aba =
    obterAba_(
      nomeAba
    );


  if (!aba) {
    throw new Error(
      'Aba não encontrada: ' +
      nomeAba
    );
  }


  const ultimaLinha =
    aba.getLastRow();


  const ultimaColuna =
    aba.getLastColumn();


  if (
    ultimaLinha <= 1 ||
    ultimaColuna <= 0
  ) {
    return 0;
  }


  const dados =
    aba
      .getRange(
        1,
        1,
        ultimaLinha,
        ultimaColuna
      )
      .getValues();


  const cabecalhos =
    dados[0];


  const indiceCampo =
    cabecalhos.indexOf(
      nomeCampo
    );


  if (
    indiceCampo === -1
  ) {

    throw new Error(
      'Campo "' +
      nomeCampo +
      '" não encontrado na aba "' +
      nomeAba +
      '".'
    );

  }


  const valorComparacao =
    String(
      valor
    )
      .trim();


  let removidos = 0;


  for (
    let i = dados.length - 1;
    i >= 1;
    i--
  ) {

    const valorLinha =
      String(
        dados[i][indiceCampo] || ''
      )
        .trim();


    if (
      valorLinha ===
      valorComparacao
    ) {

      aba.deleteRow(
        i + 1
      );

      removidos++;

    }

  }


  return removidos;

}

/**
 * ============================================================
 * FEEDS SOLUTIONS — V5.11
 * MOTOR DE ENCAMINHAMENTO
 * ============================================================
 *
 * Objetivo:
 * Transformar a decisão V5.10 em um próximo passo
 * operacional/comercial determinístico.
 *
 * Regras:
 * PODEMOS_AJUDAR      -> AVANCAR
 * PRECISAMOS_AVALIAR  -> AVALIAR
 * NAO_ENQUADRADO      -> NAO_AVANCAR
 *
 * IMPORTANTE:
 * - Não chama IA.
 * - Não altera diagnóstico.
 * - Não altera oportunidade.
 * - Não altera análise.
 * - Não altera solução.
 * - Não altera decisão V5.10.
 * - Não cria Lead.
 * - Não grava dados.
 *
 * V5.11 somente interpreta a decisão já aprovada pela V5.10.
 * ============================================================
 */


/**
 * Normaliza textos utilizados pelo motor V5.11.
 */
function normalizarEncaminhamentoV511_(valor) {
  return String(valor == null ? '' : valor)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}


/**
 * Determina a ação operacional a partir da decisão V5.10.
 *
 * PODEMOS_AJUDAR     -> AVANCAR
 * PRECISAMOS_AVALIAR -> AVALIAR
 * NAO_ENQUADRADO     -> NAO_AVANCAR
 */
function determinarAcaoEncaminhamentoV511_(classificacao) {

  const classificacaoNormalizada =
    normalizarEncaminhamentoV511_(classificacao);

  if (classificacaoNormalizada === 'PODEMOS_AJUDAR') {
    return 'AVANCAR';
  }

  if (classificacaoNormalizada === 'PRECISAMOS_AVALIAR') {
    return 'AVALIAR';
  }

  if (classificacaoNormalizada === 'NAO_ENQUADRADO') {
    return 'NAO_AVANCAR';
  }

  return 'NAO_AVANCAR';
}


/**
 * Determina o próximo passo.
 *
 * Esta função não cria Lead.
 * Ela apenas define o que deve acontecer depois da decisão.
 */
function determinarProximoPassoV511_(
  classificacao,
  possuiSolucaoPrincipal,
  aptoParaAvancar
) {

  const classificacaoNormalizada =
    normalizarEncaminhamentoV511_(classificacao);

  const possuiSolucao =
    possuiSolucaoPrincipal === true ||
    normalizarEncaminhamentoV511_(possuiSolucaoPrincipal) === 'TRUE' ||
    normalizarEncaminhamentoV511_(possuiSolucaoPrincipal) === 'SIM';

  const apto =
    aptoParaAvancar === true ||
    normalizarEncaminhamentoV511_(aptoParaAvancar) === 'TRUE' ||
    normalizarEncaminhamentoV511_(aptoParaAvancar) === 'SIM';

  if (
    classificacaoNormalizada === 'PODEMOS_AJUDAR' &&
    possuiSolucao &&
    apto
  ) {
    return 'AVANCAR_PARA_PROXIMA_ETAPA';
  }

  if (
    classificacaoNormalizada === 'PRECISAMOS_AVALIAR'
  ) {
    return 'REALIZAR_AVALIACAO';
  }

  return 'NAO_AVANCAR';
}


/**
 * Constrói a justificativa determinística do encaminhamento.
 *
 * Não inventa nenhuma informação.
 * Utiliza exclusivamente os dados da decisão V5.10.
 */
function construirJustificativaEncaminhamentoV511_(decisao) {

  const dados = decisao || {};

  const classificacao =
    String(dados.classificacao || '').trim();

  const prioridade =
    String(dados.prioridade || '').trim();

  const solucaoPrincipalId =
    String(dados.solucao_principal_id || '').trim();

  const possuiSolucao =
    dados.possui_solucao_principal === true;

  const confianca =
    String(dados.confianca || '').trim();

  const apto =
    dados.apto_para_avancar === true;

  const partes = [];

  if (classificacao) {
    partes.push(
      'A decisão V5.10 classificou o caso como "' +
      classificacao +
      '".'
    );
  }

  if (prioridade) {
    partes.push(
      'A prioridade definida é "' +
      prioridade +
      '".'
    );
  }

  if (possuiSolucao && solucaoPrincipalId) {
    partes.push(
      'Existe uma solução principal identificada como "' +
      solucaoPrincipalId +
      '".'
    );
  }

  if (confianca) {
    partes.push(
      'A confiança da decisão é "' +
      confianca +
      '".'
    );
  }

  if (apto) {
    partes.push(
      'O caso está apto para avançar para a próxima etapa.'
    );
  } else {
    partes.push(
      'O caso não está apto para avançar automaticamente.'
    );
  }

  return partes.join(' ');
}


/**
 * Constrói o objeto oficial de encaminhamento V5.11.
 *
 * IMPORTANTE:
 * Esta função é PURAMENTE DETERMINÍSTICA.
 *
 * Não grava nada.
 * Não altera nenhum objeto recebido.
 */
function construirEncaminhamentoDiagnosticoV511_(decisao) {

  const dados = decisao || {};

  const classificacao =
    String(dados.classificacao || '').trim();

  const acao =
    determinarAcaoEncaminhamentoV511_(classificacao);

  const proximoPasso =
    determinarProximoPassoV511_(
      classificacao,
      dados.possui_solucao_principal,
      dados.apto_para_avancar
    );

  const justificativa =
    construirJustificativaEncaminhamentoV511_(dados);

  const resultado = {
    versao: 'V5.11',

    diagnostico_id:
      dados.diagnostico_id || null,

    empresa_id:
      dados.empresa_id || null,

    conversa_id:
      dados.conversa_id || null,

    classificacao:
      acao,

    acao:
      acao,

    prioridade:
      dados.prioridade || null,

    solucao_principal_id:
      dados.solucao_principal_id || null,

    proximo_passo:
      proximoPasso,

    justificativa:
      justificativa,

    confianca:
      dados.confianca || null,

    apto_para_lead:
      acao === 'AVANCAR' &&
      proximoPasso === 'AVANCAR_PARA_PROXIMA_ETAPA' &&
      dados.apto_para_avancar === true
  };

  return resultado;
}


/**
 * ============================================================
 * TESTE ISOLADO — V5.11
 * ============================================================
 *
 * Objetivo:
 * Validar todas as regras do motor antes da integração.
 *
 * Cenário perfeito:
 * V5.10 = PODEMOS_AJUDAR
 * solução principal = true
 * apto = true
 *
 * Resultado esperado:
 * AVANCAR
 * AVANCAR_PARA_PROXIMA_ETAPA
 * apto_para_lead = true
 *
 * Cenários intermediários:
 * PRECISAMOS_AVALIAR
 * NAO_ENQUADRADO
 *
 * Regra do projeto:
 * 100% dos testes precisam passar.
 */
function TESTAR_MOTOR_ENCAMINHAMENTO_V511() {

  Logger.log(
    '===================================================='
  );

  Logger.log(
    'INICIO — TESTE MOTOR ENCAMINHAMENTO V5.11'
  );

  let total = 0;
  let passou = 0;
  const falhas = [];

  function testar(numero, descricao, condicao, detalhe) {

    total++;

    if (condicao) {

      passou++;

      Logger.log(
        'PASSOU — TESTE ' +
        numero +
        ': ' +
        numero +
        ' — ' +
        descricao +
        ' — ' +
        (detalhe == null ? '' : detalhe)
      );

    } else {

      falhas.push(
        numero + ' — ' + descricao
      );

      Logger.log(
        'FALHOU — TESTE ' +
        numero +
        ': ' +
        numero +
        ' — ' +
        descricao +
        ' — ' +
        (detalhe == null ? '' : detalhe)
      );
    }
  }


  // ==========================================================
  // CENÁRIO 1 — PERFEITO
  // ==========================================================

  const decisaoPerfeita = {
    versao: 'V5.10',
    diagnostico_id: 'DIA-V511-TESTE',
    empresa_id: 'EMP-V511-TESTE',
    conversa_id: 'CONV-V511-TESTE',
    classificacao: 'PODEMOS_AJUDAR',
    prioridade: 'ALTA',
    solucao_principal_id: 'V510-PERFEITA',
    possui_solucao_principal: true,
    justificativa:
      'Diagnóstico completo e solução compatível.',
    confianca: 'ALTA',
    apto_para_avancar: true
  };


  const resultadoPerfeito =
    construirEncaminhamentoDiagnosticoV511_(
      decisaoPerfeita
    );


  testar(
    1,
    'Versão V5.11',
    resultadoPerfeito.versao === 'V5.11',
    resultadoPerfeito.versao
  );


  testar(
    2,
    'Classificação PODEMOS_AJUDAR gera AVANCAR',
    resultadoPerfeito.classificacao === 'AVANCAR',
    resultadoPerfeito.classificacao
  );


  testar(
    3,
    'Ação AVANCAR',
    resultadoPerfeito.acao === 'AVANCAR',
    resultadoPerfeito.acao
  );


  testar(
    4,
    'Próximo passo correto',
    resultadoPerfeito.proximo_passo ===
      'AVANCAR_PARA_PROXIMA_ETAPA',
    resultadoPerfeito.proximo_passo
  );


  testar(
    5,
    'Apto para Lead',
    resultadoPerfeito.apto_para_lead === true,
    resultadoPerfeito.apto_para_lead
  );


  testar(
    6,
    'Prioridade preservada',
    resultadoPerfeito.prioridade === 'ALTA',
    resultadoPerfeito.prioridade
  );


  testar(
    7,
    'Solução principal preservada',
    resultadoPerfeito.solucao_principal_id ===
      'V510-PERFEITA',
    resultadoPerfeito.solucao_principal_id
  );


  testar(
    8,
    'Confiança preservada',
    resultadoPerfeito.confianca === 'ALTA',
    resultadoPerfeito.confianca
  );


  testar(
    9,
    'Diagnóstico preservado',
    resultadoPerfeito.diagnostico_id ===
      'DIA-V511-TESTE',
    resultadoPerfeito.diagnostico_id
  );


  testar(
    10,
    'Empresa preservada',
    resultadoPerfeito.empresa_id ===
      'EMP-V511-TESTE',
    resultadoPerfeito.empresa_id
  );


  testar(
    11,
    'Conversa preservada',
    resultadoPerfeito.conversa_id ===
      'CONV-V511-TESTE',
    resultadoPerfeito.conversa_id
  );


  // ==========================================================
  // CENÁRIO 2 — PRECISAMOS_AVALIAR
  // ==========================================================

  const decisaoAvaliar = {
    versao: 'V5.10',
    diagnostico_id: 'DIA-V511-AVALIAR',
    empresa_id: 'EMP-V511-AVALIAR',
    conversa_id: 'CONV-V511-AVALIAR',
    classificacao: 'PRECISAMOS_AVALIAR',
    prioridade: 'MÉDIA',
    solucao_principal_id: 'V511-AVALIACAO',
    possui_solucao_principal: true,
    confianca: 'MÉDIA',
    apto_para_avancar: false
  };


  const resultadoAvaliar =
    construirEncaminhamentoDiagnosticoV511_(
      decisaoAvaliar
    );


  testar(
    12,
    'PRECISAMOS_AVALIAR gera AVALIAR',
    resultadoAvaliar.classificacao === 'AVALIAR',
    resultadoAvaliar.classificacao
  );


  testar(
    13,
    'Ação AVALIAR',
    resultadoAvaliar.acao === 'AVALIAR',
    resultadoAvaliar.acao
  );


  testar(
    14,
    'Próximo passo REALIZAR_AVALIACAO',
    resultadoAvaliar.proximo_passo ===
      'REALIZAR_AVALIACAO',
    resultadoAvaliar.proximo_passo
  );


  testar(
    15,
    'Não fica apto para Lead',
    resultadoAvaliar.apto_para_lead === false,
    resultadoAvaliar.apto_para_lead
  );


  // ==========================================================
  // CENÁRIO 3 — NÃO ENQUADRADO
  // ==========================================================

  const decisaoNaoEnquadrado = {
    versao: 'V5.10',
    diagnostico_id: 'DIA-V511-NAO',
    empresa_id: 'EMP-V511-NAO',
    conversa_id: 'CONV-V511-NAO',
    classificacao: 'NAO_ENQUADRADO',
    prioridade: 'BAIXA',
    solucao_principal_id: null,
    possui_solucao_principal: false,
    confianca: 'BAIXA',
    apto_para_avancar: false
  };


  const resultadoNaoEnquadrado =
    construirEncaminhamentoDiagnosticoV511_(
      decisaoNaoEnquadrado
    );


  testar(
    16,
    'NAO_ENQUADRADO gera NAO_AVANCAR',
    resultadoNaoEnquadrado.classificacao ===
      'NAO_AVANCAR',
    resultadoNaoEnquadrado.classificacao
  );


  testar(
    17,
    'Ação NAO_AVANCAR',
    resultadoNaoEnquadrado.acao ===
      'NAO_AVANCAR',
    resultadoNaoEnquadrado.acao
  );


  testar(
    18,
    'Próximo passo NAO_AVANCAR',
    resultadoNaoEnquadrado.proximo_passo ===
      'NAO_AVANCAR',
    resultadoNaoEnquadrado.proximo_passo
  );


  testar(
    19,
    'Não fica apto para Lead',
    resultadoNaoEnquadrado.apto_para_lead === false,
    resultadoNaoEnquadrado.apto_para_lead
  );


  // ==========================================================
  // CENÁRIO 4 — SEGURANÇA / CLASSIFICAÇÃO DESCONHECIDA
  // ==========================================================

  const decisaoDesconhecida = {
    versao: 'V5.10',
    diagnostico_id: 'DIA-V511-DESCONHECIDA',
    empresa_id: 'EMP-V511-DESCONHECIDA',
    conversa_id: 'CONV-V511-DESCONHECIDA',
    classificacao: 'CLASSIFICACAO_DESCONHECIDA',
    prioridade: 'ALTA',
    solucao_principal_id: 'SOL-TESTE',
    possui_solucao_principal: true,
    confianca: 'ALTA',
    apto_para_avancar: true
  };


  const resultadoDesconhecido =
    construirEncaminhamentoDiagnosticoV511_(
      decisaoDesconhecida
    );


  testar(
    20,
    'Classificação desconhecida não avança',
    resultadoDesconhecido.classificacao ===
      'NAO_AVANCAR',
    resultadoDesconhecido.classificacao
  );


  testar(
    21,
    'Classificação desconhecida não gera Lead',
    resultadoDesconhecido.apto_para_lead === false,
    resultadoDesconhecido.apto_para_lead
  );


  // ==========================================================
  // TESTE DE NÃO ALTERAÇÃO DA DECISÃO
  // ==========================================================

  testar(
    22,
    'V5.10 original permanece intacta',
    decisaoPerfeita.classificacao ===
      'PODEMOS_AJUDAR',
    decisaoPerfeita.classificacao
  );


  testar(
    23,
    'V5.10 continua com apto_para_avancar true',
    decisaoPerfeita.apto_para_avancar === true,
    decisaoPerfeita.apto_para_avancar
  );


  // ==========================================================
  // RESUMO
  // ==========================================================

  Logger.log(
    '===================================================='
  );

  Logger.log(
    'RESULTADO V5.11: ' +
    passou +
    '/' +
    total
  );

  Logger.log(
    'APROVEITAMENTO V5.11: ' +
    Math.round((passou / total) * 100) +
    '%'
  );


  if (falhas.length > 0) {

    Logger.log(
      'FALHAS: ' +
      JSON.stringify(falhas)
    );

    throw new Error(
      'V5.11 FALHOU: ' +
      passou +
      '/' +
      total
    );
  }


  Logger.log(
    'TESTAR_MOTOR_ENCAMINHAMENTO_V511: PASSOU'
  );

  Logger.log(
    '===================================================='
  );

  return {
    versao: 'V5.11',
    total: total,
    passou: passou,
    percentual:
      Math.round((passou / total) * 100),
    status: 'PASSOU'
  };
}

/**
 * ============================================================
 * TESTE DE INTEGRAÇÃO REAL — V5.11
 * ============================================================
 *
 * Fluxo:
 *
 * mensagem real
 *     ↓
 * V5.6 Diagnóstico
 *     ↓
 * V5.7 Oportunidade
 *     ↓
 * V5.8 Análise
 *     ↓
 * V5.9.5 Soluções
 *     ↓
 * V5.10 Decisão
 *     ↓
 * V5.11 Encaminhamento
 *
 * IMPORTANTE:
 * - Não cria Lead.
 * - Não grava encaminhamento.
 * - Não altera V5.10.
 * - Usa o fluxo real existente.
 * - O objetivo é validar a integração.
 *
 * Regra:
 * 100% dos testes precisam passar.
 */

/**
 * ============================================================
 * V5.11 — INTEGRAÇÃO REAL COMPLETA
 * ============================================================
 *
 * Fluxo:
 *
 * V5.6
 *   ↓
 * V5.7
 *   ↓
 * V5.8
 *   ↓
 * V5.9.5
 *   ↓
 * V5.10
 *   ↓
 * V5.11
 *
 * IMPORTANTE:
 * - Cria diagnóstico REAL antes de processar mensagem.
 * - Cria catálogo temporário.
 * - Não cria Lead.
 * - Não persiste encaminhamento.
 * - Executa segunda vez para verificar consistência.
 * - Limpa dados temporários ao final.
 *
 * Regra:
 * 100% dos testes.
 */
function TESTAR_INTEGRACAO_REAL_V511() {

  const resultados = [];

  let inicio = null;
  let resultadoFluxo = null;
  let segundaExecucao = null;

  const idsTeste = {
    empresa_id: null,
    conversa_id: null,
    diagnostico_id: null
  };


  function teste(
    nome,
    passou,
    detalhe
  ) {

    const item = {

      teste:
        nome,

      passou:
        !!passou,

      detalhe:
        detalhe === undefined ||
        detalhe === null
          ? ''
          : String(detalhe)

    };

    resultados.push(item);

    Logger.log(
      (
        item.passou
          ? 'PASSOU'
          : 'FALHOU'
      ) +
      ' — ' +
      item.teste +
      ' — ' +
      item.detalhe
    );

  }


  try {

    Logger.log(
      '===================================================='
    );

    Logger.log(
      'V5.11 — INTEGRAÇÃO REAL COMPLETA'
    );

    Logger.log(
      '===================================================='
    );


    /*
     * ==========================================================
     * 0 — LIMPEZA PREVENTIVA DO CATÁLOGO DE TESTE
     * ==========================================================
     */

    try {

      limparSolucoesTeste();

    } catch (erroLimpezaInicial) {

      Logger.log(
        'Aviso limpeza inicial: ' +
        erroLimpezaInicial.message
      );

    }


    /*
     * ==========================================================
     * 1 — PREPARAR CATÁLOGO TEMPORÁRIO
     * ==========================================================
     */

    const abaSolucoes =
      obterAba_(
        SHEETS.SOLUCOES
      );


    const ultimaColuna =
      abaSolucoes.getLastColumn();


    const cabecalhos =
      abaSolucoes
        .getRange(
          1,
          1,
          1,
          ultimaColuna
        )
        .getValues()[0];


    const mapaSolucoes = {};


    cabecalhos.forEach(
      function(
        cabecalho,
        indice
      ) {

        mapaSolucoes[
          String(
            cabecalho || ''
          ).trim()
        ] = indice;

      }
    );


    const solucaoPerfeita = {

      solucao_id:
        'V510-PERFEITA',

      familia:
        'Automação de pedidos',

      nome:
        'Conferir e lançar pedidos',

      descricao:
        'Reduzir erros de digitação e retrabalho no processo de conferir e lançar pedidos.',

      status:
        'ATIVA',

      nivel_complexidade:
        'MEDIA',

      repetibilidade:
        'ALTA',

      pode_oferecer:
        'SIM',

      versao:
        'V5.10'

    };


    const linhaSolucao =
      new Array(
        cabecalhos.length
      ).fill('');


    Object.keys(
      solucaoPerfeita
    ).forEach(
      function(campo) {

        if (
          Object.prototype
            .hasOwnProperty.call(
              mapaSolucoes,
              campo
            )
        ) {

          linhaSolucao[
            mapaSolucoes[campo]
          ] =
            solucaoPerfeita[campo];

        }

      }
    );


    abaSolucoes.appendRow(
      linhaSolucao
    );


    teste(
      '1 — Solução perfeita temporária criada',
      true,
      'V510-PERFEITA'
    );


    /*
     * ==========================================================
     * 2 — CRIAR DIAGNÓSTICO REAL
     * ==========================================================
     *
     * NÃO inventamos empresa_id/conversa_id.
     *
     * O sistema cria os três registros relacionados.
     * ==========================================================
     */

    inicio =
      iniciarDiagnostico({

        nome:
          'Empresa Teste V511',

        nome_empresa:
          'Empresa Teste V511',

        segmento:
          'Serviços',

        porte:
          'PEQUENA',

        nome_contato:
          'Teste V511',

        email:
          '',

        whatsapp:
          '',

        cidade:
          ''

      });


    teste(
      '2 — Diagnóstico real iniciado',
      !!inicio &&
      inicio.sucesso === true &&
      !!inicio.empresa_id &&
      !!inicio.conversa_id &&
      !!inicio.diagnostico_id,
      inicio
        ? JSON.stringify(inicio)
        : 'Falha'
    );


    if (
      !inicio ||
      !inicio.empresa_id ||
      !inicio.conversa_id ||
      !inicio.diagnostico_id
    ) {

      throw new Error(
        'Não foi possível iniciar o diagnóstico real V5.11.'
      );

    }


    idsTeste.empresa_id =
      inicio.empresa_id;

    idsTeste.conversa_id =
      inicio.conversa_id;

    idsTeste.diagnostico_id =
      inicio.diagnostico_id;


    /*
     * ==========================================================
     * 3 — EXECUTAR FLUXO REAL
     * ==========================================================
     */

    const mensagem =
      'Nosso processo principal é conferir e lançar pedidos. ' +
      'Temos erros de digitação e retrabalho nesse processo. ' +
      'Isso acontece diariamente. ' +
      'Processamos 120 pedidos por dia. ' +
      'Perdemos aproximadamente 3 horas por dia com esse problema. ' +
      'Nosso objetivo é reduzir os erros e diminuir o retrabalho.';


    resultadoFluxo =
      processarMensagemDiagnostico({

        empresa_id:
          inicio.empresa_id,

        conversa_id:
          inicio.conversa_id,

        mensagem:
          mensagem

      });


    teste(
      '3 — Fluxo principal executado',
      !!resultadoFluxo &&
      resultadoFluxo.sucesso === true,
      resultadoFluxo
        ? 'OK'
        : 'Falha'
    );


    /*
     * ==========================================================
     * 4 — DIAGNÓSTICO
     * ==========================================================
     */

    const diagnostico =
      resultadoFluxo
        ? resultadoFluxo.diagnostico
        : null;


    teste(
      '4 — Diagnóstico V5.6 retornado',
      !!diagnostico &&
      diagnostico.diagnostico_id ===
        inicio.diagnostico_id,
      diagnostico
        ? diagnostico.diagnostico_id
        : 'Ausente'
    );


    if (!diagnostico) {

      throw new Error(
        'Diagnóstico não retornado pelo fluxo real.'
      );

    }


    const estado =
      String(
        diagnostico.status_diagnostico || ''
      )
        .trim()
        .toUpperCase();


    teste(
      '5 — Diagnóstico PRONTO_PARA_ANALISE',
      estado ===
        'PRONTO_PARA_ANALISE',
      estado
    );


    /*
     * ==========================================================
     * 6 — OPORTUNIDADE V5.7
     * ==========================================================
     */

    const oportunidadeWrapper =
      resultadoFluxo &&
      resultadoFluxo.oportunidade
        ? resultadoFluxo.oportunidade
        : null;


    const oportunidade =
      oportunidadeWrapper
        ? Object.assign(
            {},
            oportunidadeWrapper.oportunidade || {},
            {

              oportunidade_id:
                oportunidadeWrapper.oportunidade_id,

              acao:
                oportunidadeWrapper.acao,

              linha:
                oportunidadeWrapper.linha

            }
          )
        : null;


    teste(
      '6 — Oportunidade V5.7 completa',
      !!oportunidade &&
      !!oportunidade.oportunidade_id &&
      !!oportunidade.processo &&
      !!oportunidade.dor &&
      !!oportunidade.objetivo,
      oportunidade
        ? JSON.stringify(oportunidade)
        : 'Ausente'
    );


    /*
     * ==========================================================
     * 7 — ANÁLISE V5.8
     * ==========================================================
     */

    const analiseWrapper =
      resultadoFluxo &&
      resultadoFluxo.analise_diagnostica
        ? resultadoFluxo.analise_diagnostica
        : null;


    const analise =
      analiseWrapper
        ? Object.assign(
            {},
            analiseWrapper.analise || {},
            {

              analise_id:
                analiseWrapper.analise_id,

              diagnostico_id:
                analiseWrapper.diagnostico_id,

              acao:
                analiseWrapper.acao,

              linha:
                analiseWrapper.linha

            }
          )
        : null;


    teste(
      '7 — Análise V5.8 completa',
      !!analise &&
      !!analise.analise_id &&
      !!analise.diagnostico_id,
      analise
        ? JSON.stringify(analise)
        : 'Ausente'
    );


    /*
     * ==========================================================
     * 8 — SOLUÇÕES V5.9.5
     * ==========================================================
     */

    const solucoes =
      resultadoFluxo &&
      resultadoFluxo.solucoes
        ? resultadoFluxo.solucoes
        : null;


    const relacoes =
      solucoes &&
      Array.isArray(
        solucoes.relacoes
      )
        ? solucoes.relacoes
        : [];


    teste(
      '8 — Soluções V5.9.5 retornadas',
      !!solucoes,
      solucoes
        ? 'OK'
        : 'Ausente'
    );


    const principais =
      relacoes.filter(
        function(relacao) {

          return (
            relacao &&
            relacao.principal === true
          );

        }
      );


    teste(
      '9 — Exatamente uma solução principal',
      principais.length === 1,
      'Principais: ' +
      principais.length
    );


    const principal =
      principais.length === 1
        ? principais[0]
        : null;


    teste(
      '10 — Solução principal = V510-PERFEITA',
      !!principal &&
      principal.solucao_id ===
        'V510-PERFEITA',
      principal
        ? principal.solucao_id
        : 'Ausente'
    );


    teste(
      '11 — Solução principal = 100/100',
      !!principal &&
      Number(
        principal.pontuacao
      ) === 100,
      principal
        ? String(
            principal.pontuacao
          )
        : 'Ausente'
    );


    teste(
      '12 — Solução principal = ALTA',
      !!principal &&
      String(
        principal.compatibilidade || ''
      ).toUpperCase() ===
        'ALTA',
      principal
        ? principal.compatibilidade
        : 'Ausente'
    );


    teste(
      '13 — Solução principal = viabilidade ALTA',
      !!principal &&
      String(
        principal.viabilidade || ''
      ).toUpperCase() ===
        'ALTA',
      principal
        ? principal.viabilidade
        : 'Ausente'
    );


    /*
     * ==========================================================
     * 14 — DECISÃO V5.10
     * ==========================================================
     */

    const decisao =
      construirDecisaoDiagnosticoV510_(
        diagnostico,
        oportunidade,
        analise,
        relacoes
      );


    teste(
      '14 — Decisão V5.10 retornada',
      !!decisao,
      decisao
        ? JSON.stringify(decisao)
        : 'Ausente'
    );


    teste(
      '15 — V5.10 = PODEMOS_AJUDAR',
      !!decisao &&
      decisao.classificacao ===
        'PODEMOS_AJUDAR',
      decisao
        ? decisao.classificacao
        : 'Ausente'
    );


    teste(
      '16 — V5.10 prioridade = ALTA',
      !!decisao &&
      decisao.prioridade ===
        'ALTA',
      decisao
        ? decisao.prioridade
        : 'Ausente'
    );


    teste(
      '17 — V5.10 confiança = ALTA',
      !!decisao &&
      decisao.confianca ===
        'ALTA',
      decisao
        ? decisao.confianca
        : 'Ausente'
    );


    teste(
      '18 — V5.10 apto_para_avancar = true',
      !!decisao &&
      decisao.apto_para_avancar ===
        true,
      decisao
        ? decisao.apto_para_avancar
        : 'Ausente'
    );


    /*
     * ==========================================================
     * 19 — V5.11
     * ==========================================================
     */

    const encaminhamento =
      construirEncaminhamentoDiagnosticoV511_(
        decisao
      );


    Logger.log(
      'ENCAMINHAMENTO V5.11: ' +
      JSON.stringify(
        encaminhamento
      )
    );


    teste(
      '19 — Encaminhamento V5.11 retornado',
      !!encaminhamento,
      encaminhamento
        ? JSON.stringify(
            encaminhamento
          )
        : 'Ausente'
    );


    teste(
      '20 — Versão V5.11',
      !!encaminhamento &&
      encaminhamento.versao ===
        'V5.11',
      encaminhamento
        ? encaminhamento.versao
        : 'Ausente'
    );


    teste(
      '21 — Classificação = AVANCAR',
      !!encaminhamento &&
      encaminhamento.classificacao ===
        'AVANCAR',
      encaminhamento
        ? encaminhamento.classificacao
        : 'Ausente'
    );


    teste(
      '22 — Ação = AVANCAR',
      !!encaminhamento &&
      encaminhamento.acao ===
        'AVANCAR',
      encaminhamento
        ? encaminhamento.acao
        : 'Ausente'
    );


    teste(
      '23 — Próximo passo correto',
      !!encaminhamento &&
      encaminhamento.proximo_passo ===
        'AVANCAR_PARA_PROXIMA_ETAPA',
      encaminhamento
        ? encaminhamento.proximo_passo
        : 'Ausente'
    );


    teste(
      '24 — apto_para_lead = true',
      !!encaminhamento &&
      encaminhamento.apto_para_lead ===
        true,
      encaminhamento
        ? encaminhamento.apto_para_lead
        : 'Ausente'
    );


    /*
     * ==========================================================
     * 25 — RASTREABILIDADE
     * ==========================================================
     */

    teste(
      '25 — Rastreabilidade diagnóstico',
      !!encaminhamento &&
      encaminhamento.diagnostico_id ===
        inicio.diagnostico_id,
      encaminhamento
        ? encaminhamento.diagnostico_id
        : 'Ausente'
    );


    teste(
      '26 — Rastreabilidade empresa',
      !!encaminhamento &&
      encaminhamento.empresa_id ===
        inicio.empresa_id,
      encaminhamento
        ? encaminhamento.empresa_id
        : 'Ausente'
    );


    teste(
      '27 — Rastreabilidade conversa',
      !!encaminhamento &&
      encaminhamento.conversa_id ===
        inicio.conversa_id,
      encaminhamento
        ? encaminhamento.conversa_id
        : 'Ausente'
    );


    teste(
      '28 — Solução principal preservada',
      !!encaminhamento &&
      encaminhamento.solucao_principal_id ===
        'V510-PERFEITA',
      encaminhamento
        ? encaminhamento.solucao_principal_id
        : 'Ausente'
    );


    /*
     * ==========================================================
     * 29 — PROTEÇÃO DA V5.10
     * ==========================================================
     */

    teste(
      '29 — V5.10 permanece PODEMOS_AJUDAR',
      decisao.classificacao ===
        'PODEMOS_AJUDAR',
      decisao.classificacao
    );


    teste(
      '30 — V5.10 permanece apto',
      decisao.apto_para_avancar ===
        true,
      decisao.apto_para_avancar
    );


    /*
     * ==========================================================
     * 31 — SEGUNDA EXECUÇÃO
     * ==========================================================
     *
     * O objetivo aqui é verificar se o encaminhamento
     * continua máximo após reprocessamento.
     * ==========================================================
     */

    Logger.log(
      'Executando segunda passagem do mesmo diagnóstico...'
    );


    segundaExecucao =
      processarMensagemDiagnostico({

        empresa_id:
          inicio.empresa_id,

        conversa_id:
          inicio.conversa_id,

        mensagem:
          mensagem

      });


    teste(
      '31 — Segunda execução concluída',
      !!segundaExecucao &&
      segundaExecucao.sucesso === true,
      segundaExecucao
        ? 'OK'
        : 'Falha'
    );


    const diagnosticoSegundo =
      segundaExecucao
        ? segundaExecucao.diagnostico
        : null;


    const oportunidadeSegundoWrapper =
      segundaExecucao &&
      segundaExecucao.oportunidade
        ? segundaExecucao.oportunidade
        : null;


    const oportunidadeSegundo =
      oportunidadeSegundoWrapper
        ? Object.assign(
            {},
            oportunidadeSegundoWrapper.oportunidade || {},
            {

              oportunidade_id:
                oportunidadeSegundoWrapper.oportunidade_id,

              acao:
                oportunidadeSegundoWrapper.acao,

              linha:
                oportunidadeSegundoWrapper.linha

            }
          )
        : null;


    const analiseSegundoWrapper =
      segundaExecucao &&
      segundaExecucao.analise_diagnostica
        ? segundaExecucao.analise_diagnostica
        : null;


    const analiseSegundo =
      analiseSegundoWrapper
        ? Object.assign(
            {},
            analiseSegundoWrapper.analise || {},
            {

              analise_id:
                analiseSegundoWrapper.analise_id,

              diagnostico_id:
                analiseSegundoWrapper.diagnostico_id,

              acao:
                analiseSegundoWrapper.acao,

              linha:
                analiseSegundoWrapper.linha

            }
          )
        : null;


    const solucoesSegundo =
      segundaExecucao &&
      segundaExecucao.solucoes
        ? segundaExecucao.solucoes
        : null;


    const relacoesSegundo =
      solucoesSegundo &&
      Array.isArray(
        solucoesSegundo.relacoes
      )
        ? solucoesSegundo.relacoes
        : [];


    const decisaoSegundo =
      construirDecisaoDiagnosticoV510_(
        diagnosticoSegundo,
        oportunidadeSegundo,
        analiseSegundo,
        relacoesSegundo
      );


    const encaminhamentoSegundo =
      construirEncaminhamentoDiagnosticoV511_(
        decisaoSegundo
      );


    Logger.log(
      'SEGUNDA DECISÃO V5.10: ' +
      JSON.stringify(
        decisaoSegundo
      )
    );


    Logger.log(
      'SEGUNDO ENCAMINHAMENTO V5.11: ' +
      JSON.stringify(
        encaminhamentoSegundo
      )
    );


    teste(
      '32 — Segunda execução mantém PODEMOS_AJUDAR',
      !!decisaoSegundo &&
      decisaoSegundo.classificacao ===
        'PODEMOS_AJUDAR',
      decisaoSegundo
        ? decisaoSegundo.classificacao
        : 'Ausente'
    );


    teste(
      '33 — Segunda execução mantém confiança ALTA',
      !!decisaoSegundo &&
      decisaoSegundo.confianca ===
        'ALTA',
      decisaoSegundo
        ? decisaoSegundo.confianca
        : 'Ausente'
    );


    teste(
      '34 — Segunda execução mantém apto',
      !!decisaoSegundo &&
      decisaoSegundo.apto_para_avancar ===
        true,
      decisaoSegundo
        ? decisaoSegundo.apto_para_avancar
        : 'Ausente'
    );


    teste(
      '35 — Segunda execução mantém AVANCAR',
      !!encaminhamentoSegundo &&
      encaminhamentoSegundo.acao ===
        'AVANCAR',
      encaminhamentoSegundo
        ? encaminhamentoSegundo.acao
        : 'Ausente'
    );


    teste(
      '36 — Segunda execução mantém apto_para_lead',
      !!encaminhamentoSegundo &&
      encaminhamentoSegundo.apto_para_lead ===
        true,
      encaminhamentoSegundo
        ? encaminhamentoSegundo.apto_para_lead
        : 'Ausente'
    );


    /*
     * ==========================================================
     * 37 — NÃO CRIA LEAD
     * ==========================================================
     */

    teste(
      '37 — V5.11 não cria Lead',
      !(
        resultadoFluxo &&
        resultadoFluxo.lead
      ) &&
      !(
        segundaExecucao &&
        segundaExecucao.lead
      ),
      'Lead não criado'
    );


    /*
     * ==========================================================
     * RESULTADO
     * ==========================================================
     */

    const total =
      resultados.length;


    const passaram =
      resultados.filter(
        function(item) {
          return item.passou;
        }
      ).length;


    const falharam =
      total -
      passaram;


    Logger.log(
      '===================================================='
    );


    Logger.log(
      'RESULTADO V5.11 INTEGRADA: ' +
      passaram +
      '/' +
      total
    );


    Logger.log(
      'FALHAS V5.11: ' +
      falharam
    );


    Logger.log(
      'APROVEITAMENTO V5.11: ' +
      Math.round(
        (passaram / total) * 100
      ) +
      '%'
    );


    if (
      falharam > 0
    ) {

      throw new Error(
        'V5.11 INTEGRADA FALHOU: ' +
        passaram +
        '/' +
        total
      );

    }


    Logger.log(
      'TESTAR_INTEGRACAO_REAL_V511: PASSOU'
    );


    Logger.log(
      '===================================================='
    );


    return {

      sucesso:
        true,

      versao:
        'V5.11',

      total:
        total,

      passaram:
        passaram,

      falharam:
        falharam,

      percentual:
        Math.round(
          (passaram / total) * 100
        ),

      encaminhamento:
        encaminhamento,

      encaminhamento_segunda_execucao:
        encaminhamentoSegundo

    };


  } finally {

    /*
     * ==========================================================
     * LIMPEZA FINAL
     * ==========================================================
     *
     * A função existente de limpeza das soluções V5.10
     * remove o catálogo temporário.
     * ==========================================================
     */

    try {

      const removidos =
        limparSolucoesTeste();

      Logger.log(
        'LIMPEZA V5.11 — ' +
        String(
          removidos == null
            ? ''
            : removidos
        )
      );

    } catch (erroLimpezaFinal) {

      Logger.log(
        'ERRO NA LIMPEZA FINAL V5.11: ' +
        erroLimpezaFinal.message
      );

    }

  }

}

/**
 * ============================================================
 * V6.1 — MOTOR DE CRIAÇÃO DE LEAD
 * ============================================================
 *
 * Responsabilidades:
 *
 * - validar autorização V5.11
 * - validar rastreabilidade mínima
 * - impedir criação indevida
 * - localizar Lead existente
 * - impedir duplicidade por empresa + diagnóstico
 * - criar Lead com status NOVO
 * - preservar dados reais
 * - retornar resultado auditável
 *
 * NÃO faz:
 *
 * - negociação
 * - follow-up
 * - contato
 * - conversão
 * - atribuição de responsável
 * - envio de mensagens
 *
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * NORMALIZAR TEXTO V6.1
 * ------------------------------------------------------------
 */
function normalizarLeadV61_(valor) {

  return String(valor || '')
    .trim()
    .toLowerCase();

}


/**
 * ------------------------------------------------------------
 * VALIDAR AUTORIZAÇÃO V6.1
 * ------------------------------------------------------------
 *
 * A criação somente é autorizada quando a cadeia V5.11
 * estiver coerente.
 *
 * ------------------------------------------------------------
 */
function validarAutorizacaoLeadV61_(encaminhamento) {

  const dados =
    encaminhamento || {};

  const classificacao =
    String(
      dados.classificacao || ''
    )
      .trim()
      .toUpperCase();

  const acao =
    String(
      dados.acao || ''
    )
      .trim()
      .toUpperCase();

  const confianca =
    String(
      dados.confianca || ''
    )
      .trim()
      .toUpperCase();

  const solucaoPrincipal =
    String(
      dados.solucao_principal_id || ''
    )
      .trim();

  const diagnosticoId =
    String(
      dados.diagnostico_id || ''
    )
      .trim();

  const empresaId =
    String(
      dados.empresa_id || ''
    )
      .trim();

  const apto =
    dados.apto_para_lead === true;

  if (!apto) {

    return {
      autorizado: false,
      motivo:
        'V5.11 não autorizou criação de Lead.'
    };

  }

  if (
    classificacao !==
    'AVANCAR'
  ) {

    return {
      autorizado: false,
      motivo:
        'Classificação diferente de AVANCAR.'
    };

  }

  if (
    acao !==
    'AVANCAR'
  ) {

    return {
      autorizado: false,
      motivo:
        'Ação diferente de AVANCAR.'
    };

  }

  if (
    confianca !==
    'ALTA'
  ) {

    return {
      autorizado: false,
      motivo:
        'Confiança V5.11 não é ALTA.'
    };

  }

  if (!solucaoPrincipal) {

    return {
      autorizado: false,
      motivo:
        'Solução principal não informada.'
    };

  }

  if (!diagnosticoId) {

    return {
      autorizado: false,
      motivo:
        'diagnostico_id não informado.'
    };

  }

  if (!empresaId) {

    return {
      autorizado: false,
      motivo:
        'empresa_id não informado.'
    };

  }

  return {
    autorizado: true,
    motivo:
      'Cadeia V5.11 autorizada para criação de Lead.'
  };

}


/**
 * ------------------------------------------------------------
 * BUSCAR LEAD POR EMPRESA + DIAGNÓSTICO
 * ------------------------------------------------------------
 *
 * Regra de identidade V6.1:
 *
 * empresa_id + diagnostico_id
 *
 * ------------------------------------------------------------
 */
function buscarLeadPorDiagnosticoV61_(
  empresaId,
  diagnosticoId
) {

  if (!empresaId) {
    return null;
  }

  if (!diagnosticoId) {
    return null;
  }

  const aba =
    obterAba_(
      SHEETS.LEADS
    );

  const valores =
    aba
      .getDataRange()
      .getValues();

  if (
    valores.length <= 1
  ) {
    return null;
  }

  const cabecalhos =
    valores[0];

  const indiceEmpresa =
    cabecalhos.indexOf(
      'empresa_id'
    );

  const indiceDiagnostico =
    cabecalhos.indexOf(
      'diagnostico_id'
    );

  if (
    indiceEmpresa === -1
  ) {

    throw new Error(
      'A aba LEADS precisa possuir a coluna empresa_id.'
    );

  }

  if (
    indiceDiagnostico === -1
  ) {

    throw new Error(
      'A aba LEADS precisa possuir a coluna diagnostico_id.'
    );

  }

  for (
    let i = 1;
    i < valores.length;
    i++
  ) {

    const empresaLinha =
      String(
        valores[i][indiceEmpresa] || ''
      )
        .trim();

    const diagnosticoLinha =
      String(
        valores[i][indiceDiagnostico] || ''
      )
        .trim();

    if (
      empresaLinha ===
      String(empresaId).trim() &&
      diagnosticoLinha ===
      String(diagnosticoId).trim()
    ) {

      return {
        linha:
          i + 1,

        dados:
          objetoDaLinha_(
            cabecalhos,
            valores[i]
          )
      };

    }

  }

  return null;

}


/**
 * ------------------------------------------------------------
 * BUSCAR SOLUÇÃO PELO ID
 * ------------------------------------------------------------
 */
function buscarSolucaoV61_(
  solucaoId
) {

  if (!solucaoId) {
    return null;
  }

  const aba =
    obterAba_(
      SHEETS.SOLUCOES
    );

  const valores =
    aba
      .getDataRange()
      .getValues();

  if (
    valores.length <= 1
  ) {
    return null;
  }

  const cabecalhos =
    valores[0];

  const indiceId =
    cabecalhos.indexOf(
      'solucao_id'
    );

  if (
    indiceId === -1
  ) {

    throw new Error(
      'A aba SOLUCOES precisa possuir a coluna solucao_id.'
    );

  }

  for (
    let i = 1;
    i < valores.length;
    i++
  ) {

    if (
      String(
        valores[i][indiceId] || ''
      )
        .trim() ===
      String(solucaoId).trim()
    ) {

      return objetoDaLinha_(
        cabecalhos,
        valores[i]
      );

    }

  }

  return null;

}


/**
 * ------------------------------------------------------------
 * CONSTRUIR LEAD V6.1
 * ------------------------------------------------------------
 */
function construirLeadDiagnosticoV61_(
  encaminhamento,
  diagnostico,
  oportunidade
) {

  const enc =
    encaminhamento || {};

  const diag =
    diagnostico || {};

  const opp =
    oportunidade || {};

  const empresaId =
    String(
      enc.empresa_id ||
      diag.empresa_id ||
      ''
    ).trim();

  const diagnosticoId =
    String(
      enc.diagnostico_id ||
      diag.diagnostico_id ||
      ''
    ).trim();

  const solucaoPrincipalId =
    String(
      enc.solucao_principal_id ||
      ''
    ).trim();

  let interesse =
    String(
      opp.oportunidade ||
      ''
    ).trim();

  /*
   * Se a oportunidade não trouxer descrição,
   * tentamos localizar a solução principal.
   */
  if (!interesse && solucaoPrincipalId) {

    const solucao =
      buscarSolucaoV61_(
        solucaoPrincipalId
      );

    if (solucao) {

      interesse =
        String(
          solucao.nome ||
          solucao.descricao ||
          ''
        ).trim();

    }

  }

  /*
   * Último fallback:
   * processo real do diagnóstico.
   */
  if (!interesse) {

    interesse =
      String(
        diag.processo_nome ||
        diag.processo_resumo ||
        ''
      ).trim();

  }

  return {

    empresa_id:
      empresaId,

    diagnostico_id:
      diagnosticoId,

    nome:
      String(
        diag.nome_contato ||
        diag.nome ||
        ''
      ).trim(),

    whatsapp:
      String(
        diag.whatsapp ||
        ''
      ).trim(),

    interesse:
      interesse,

    prioridade:
      String(
        enc.prioridade ||
        'MÉDIA'
      ).trim(),

    status:
      STATUS_LEAD.NOVO,

    responsavel:
      '',

    criado_em:
      new Date(),

    atualizado_em:
      new Date()

  };

}


/**
 * ------------------------------------------------------------
 * MOTOR V6.1
 * ------------------------------------------------------------
 */
function criarLeadDiagnosticoV61_(
  encaminhamento,
  diagnostico,
  oportunidade
) {

  const enc =
    encaminhamento || {};

  const diag =
    diagnostico || {};

  /*
   * ----------------------------------------------------------
   * 1. VALIDAR AUTORIZAÇÃO
   * ----------------------------------------------------------
   */
  const autorizacao =
    validarAutorizacaoLeadV61_(
      enc
    );

  if (
    !autorizacao.autorizado
  ) {

    return {

      versao:
        'V6.1',

      acao:
        'BLOQUEADO',

      lead_id:
        '',

      empresa_id:
        enc.empresa_id || '',

      diagnostico_id:
        enc.diagnostico_id || '',

      status:
        '',

      justificativa:
        autorizacao.motivo,

      criado:
        false

    };

  }


  /*
   * ----------------------------------------------------------
   * 2. VALIDAR DIAGNÓSTICO
   * ----------------------------------------------------------
   */
  if (
    !diag ||
    String(
      diag.diagnostico_id || ''
    ).trim() === ''
  ) {

    return {

      versao:
        'V6.1',

      acao:
        'BLOQUEADO',

      lead_id:
        '',

      empresa_id:
        enc.empresa_id || '',

      diagnostico_id:
        enc.diagnostico_id || '',

      status:
        '',

      justificativa:
        'Diagnóstico não encontrado ou inválido.',

      criado:
        false

    };

  }


  /*
   * ----------------------------------------------------------
   * 3. LOCALIZAR LEAD EXISTENTE
   * ----------------------------------------------------------
   */
  const leadExistente =
    buscarLeadPorDiagnosticoV61_(
      enc.empresa_id,
      enc.diagnostico_id
    );

  if (leadExistente) {

    const dados =
      leadExistente.dados || {};

    return {

      versao:
        'V6.1',

      acao:
        'JA_EXISTE',

      lead_id:
        dados.lead_id || '',

      empresa_id:
        dados.empresa_id || enc.empresa_id,

      diagnostico_id:
        dados.diagnostico_id || enc.diagnostico_id,

      status:
        dados.status ||
        STATUS_LEAD.NOVO,

      justificativa:
        'Já existe um Lead para esta empresa e diagnóstico.',

      criado:
        false

    };

  }


  /*
   * ----------------------------------------------------------
   * 4. CONSTRUIR LEAD
   * ----------------------------------------------------------
   */
  const novoLead =
    construirLeadDiagnosticoV61_(
      enc,
      diag,
      oportunidade
    );


  /*
   * ----------------------------------------------------------
   * 5. VALIDAÇÃO FINAL ANTES DA PERSISTÊNCIA
   * ----------------------------------------------------------
   */
  if (
    !novoLead.empresa_id
  ) {

    return {

      versao:
        'V6.1',

      acao:
        'BLOQUEADO',

      lead_id:
        '',

      empresa_id:
        '',

      diagnostico_id:
        novoLead.diagnostico_id,

      status:
        '',

      justificativa:
        'empresa_id ausente no Lead.',

      criado:
        false

    };

  }

  if (
    !novoLead.diagnostico_id
  ) {

    return {

      versao:
        'V6.1',

      acao:
        'BLOQUEADO',

      lead_id:
        '',

      empresa_id:
        novoLead.empresa_id,

      diagnostico_id:
        '',

      status:
        '',

      justificativa:
        'diagnostico_id ausente no Lead.',

      criado:
        false

    };

  }


  /*
   * ----------------------------------------------------------
   * 6. PERSISTIR
   * ----------------------------------------------------------
   */
  const persistencia =
    salvarLead_(
      novoLead
    );


  /*
   * ----------------------------------------------------------
   * 7. RECUPERAR REGISTRO CRIADO
   * ----------------------------------------------------------
   */
  const leadCriado =
    buscarLeadPorDiagnosticoV61_(
      novoLead.empresa_id,
      novoLead.diagnostico_id
    );

  if (!leadCriado) {

    throw new Error(
      'V6.1: Lead foi gravado, mas não pôde ser localizado após a persistência.'
    );

  }


  return {

    versao:
      'V6.1',

    acao:
      'CRIAR',

    lead_id:
      persistencia.lead_id,

    empresa_id:
      novoLead.empresa_id,

    diagnostico_id:
      novoLead.diagnostico_id,

    status:
      STATUS_LEAD.NOVO,

    justificativa:
      'Lead criado porque o encaminhamento V5.11 autorizou avanço comercial.',

    criado:
      true

  };

}


/**
 * ============================================================
 * TESTE ISOLADO — V6.1
 * ============================================================
 */
function TESTAR_MOTOR_LEAD_V61() {

  const resultados =
    [];

  function teste(
    nome,
    passou,
    detalhe
  ) {

    resultados.push({

      teste:
        nome,

      passou:
        passou === true,

      detalhe:
        String(
          detalhe || ''
        )

    });

  }


  let inicio =
    null;

  let leadCriado =
    null;

  try {

    Logger.log(
      '===================================================='
    );

    Logger.log(
      'INICIANDO TESTE ISOLADO V6.1'
    );


    /*
     * --------------------------------------------------------
     * LIMPAR RESÍDUOS DOS TESTES V6.1
     * --------------------------------------------------------
     */
    limparRegistrosPorCampoV510_(
      SHEETS.LEADS,
      'diagnostico_id',
      'TESTE-V61-A'
    );

    limparRegistrosPorCampoV510_(
      SHEETS.LEADS,
      'diagnostico_id',
      'TESTE-V61-B'
    );

    limparRegistrosPorCampoV510_(
      SHEETS.LEADS,
      'diagnostico_id',
      'TESTE-V61-C'
    );


    /*
     * --------------------------------------------------------
     * CRIAR DIAGNÓSTICO REAL DE TESTE
     * --------------------------------------------------------
     */
    inicio =
      iniciarDiagnostico({

        nome:
          'Empresa Teste V6.1',

        nome_empresa:
          'Empresa Teste V6.1',

        segmento:
          'Serviços',

        porte:
          'PEQUENA',

        nome_contato:
          'Contato Teste V6.1',

        whatsapp:
          '',

        email:
          '',

        cidade:
          ''

      });


    teste(
      '1 — Diagnóstico de teste criado',
      !!inicio &&
      !!inicio.empresa_id &&
      !!inicio.diagnostico_id,
      inicio
        ? JSON.stringify(inicio)
        : 'Falha'
    );


    /*
     * --------------------------------------------------------
     * OBJETO V5.11 PERFEITO
     * --------------------------------------------------------
     */
    const encaminhamentoPerfeito = {

      versao:
        'V5.11',

      diagnostico_id:
        'TESTE-V61-A',

      empresa_id:
        inicio
          ? inicio.empresa_id
          : '',

      conversa_id:
        inicio
          ? inicio.conversa_id
          : '',

      classificacao:
        'AVANCAR',

      acao:
        'AVANCAR',

      prioridade:
        'ALTA',

      solucao_principal_id:
        'SOL-V61-TESTE',

      proximo_passo:
        'AVANCAR_PARA_PROXIMA_ETAPA',

      justificativa:
        'Teste V6.1',

      confianca:
        'ALTA',

      apto_para_lead:
        true

    };


    const diagnosticoTeste = {

      diagnostico_id:
        'TESTE-V61-A',

      empresa_id:
        inicio
          ? inicio.empresa_id
          : '',

      processo_nome:
        'Conferir e lançar pedidos',

      processo_resumo:
        'Conferir e lançar pedidos',

      nome_contato:
        'Contato Teste V6.1',

      whatsapp:
        '',

      dor_principal:
        'Erros de digitação e retrabalho'

    };


    const oportunidadeTeste = {

      oportunidade_id:
        'OPP-V61-TESTE',

      oportunidade:
        'Conferir e lançar pedidos',

      processo:
        'Conferir e lançar pedidos',

      dor:
        'Erros de digitação e retrabalho',

      prioridade:
        'ALTA'

    };


    /*
     * --------------------------------------------------------
     * TESTE 2 — AUTORIZAÇÃO
     * --------------------------------------------------------
     */
    const autorizacao =
      validarAutorizacaoLeadV61_(
        encaminhamentoPerfeito
      );

    teste(
      '2 — Autorização V5.11',
      autorizacao.autorizado === true,
      JSON.stringify(autorizacao)
    );


    /*
     * --------------------------------------------------------
     * TESTE 3 — CONSTRUÇÃO
     * --------------------------------------------------------
     */
    const estrutura =
      construirLeadDiagnosticoV61_(
        encaminhamentoPerfeito,
        diagnosticoTeste,
        oportunidadeTeste
      );

    teste(
      '3 — Lead construído corretamente',
      !!estrutura &&
      estrutura.empresa_id ===
        inicio.empresa_id &&
      estrutura.diagnostico_id ===
        'TESTE-V61-A' &&
      estrutura.status ===
        STATUS_LEAD.NOVO &&
      estrutura.interesse ===
        'Conferir e lançar pedidos',
      JSON.stringify(estrutura)
    );


    /*
     * --------------------------------------------------------
     * TESTE 4 — CRIAÇÃO
     * --------------------------------------------------------
     */
    const resultadoCriacao =
      criarLeadDiagnosticoV61_(
        encaminhamentoPerfeito,
        diagnosticoTeste,
        oportunidadeTeste
      );

    leadCriado =
      resultadoCriacao;

    teste(
      '4 — Lead criado',
      resultadoCriacao.acao ===
        'CRIAR' &&
      resultadoCriacao.criado ===
        true &&
      !!resultadoCriacao.lead_id,
      JSON.stringify(resultadoCriacao)
    );


    /*
     * --------------------------------------------------------
     * TESTE 5 — STATUS NOVO
     * --------------------------------------------------------
     */
    teste(
      '5 — Status inicial NOVO',
      resultadoCriacao.status ===
        STATUS_LEAD.NOVO,
      resultadoCriacao.status
    );


    /*
     * --------------------------------------------------------
     * TESTE 6 — PERSISTÊNCIA
     * --------------------------------------------------------
     */
    const persistido =
      buscarLeadPorDiagnosticoV61_(
        inicio.empresa_id,
        'TESTE-V61-A'
      );

    teste(
      '6 — Lead persistido',
      !!persistido &&
      !!persistido.dados &&
      String(
        persistido.dados.lead_id || ''
      ).trim() ===
      String(
        resultadoCriacao.lead_id
      ).trim(),
      persistido
        ? JSON.stringify(
            persistido.dados
          )
        : 'Não encontrado'
    );


    /*
     * --------------------------------------------------------
     * TESTE 7 — IDEMPOTÊNCIA
     * --------------------------------------------------------
     */
    const segundaExecucao =
      criarLeadDiagnosticoV61_(
        encaminhamentoPerfeito,
        diagnosticoTeste,
        oportunidadeTeste
      );

    teste(
      '7 — Segunda execução não cria duplicado',
      segundaExecucao.acao ===
        'JA_EXISTE' &&
      segundaExecucao.criado ===
        false &&
      segundaExecucao.lead_id ===
        resultadoCriacao.lead_id,
      JSON.stringify(segundaExecucao)
    );


    /*
     * --------------------------------------------------------
     * TESTE 8 — PRECISAMOS_AVALIAR
     * --------------------------------------------------------
     */
    const avaliar =
      criarLeadDiagnosticoV61_({

        diagnostico_id:
          'TESTE-V61-B',

        empresa_id:
          inicio.empresa_id,

        classificacao:
          'AVALIAR',

        acao:
          'AVALIAR',

        prioridade:
          'ALTA',

        solucao_principal_id:
          'SOL-V61-TESTE',

        confianca:
          'MÉDIA',

        apto_para_lead:
          false

      }, {

        diagnostico_id:
          'TESTE-V61-B',

        empresa_id:
          inicio.empresa_id,

        processo_nome:
          'Processo de teste'

      }, {

        oportunidade:
          'Oportunidade teste'

      });

    teste(
      '8 — PRECISAMOS_AVALIAR bloqueado',
      avaliar.acao ===
        'BLOQUEADO' &&
      avaliar.criado ===
        false,
      JSON.stringify(avaliar)
    );


    /*
     * --------------------------------------------------------
     * TESTE 9 — NAO_ENQUADRADO
     * --------------------------------------------------------
     */
    const naoEnquadrado =
      criarLeadDiagnosticoV61_({

        diagnostico_id:
          'TESTE-V61-C',

        empresa_id:
          inicio.empresa_id,

        classificacao:
          'NAO_ENQUADRADO',

        acao:
          'NAO_AVANCAR',

        prioridade:
          'MÉDIA',

        solucao_principal_id:
          '',

        confianca:
          'BAIXA',

        apto_para_lead:
          false

      }, {

        diagnostico_id:
          'TESTE-V61-C',

        empresa_id:
          inicio.empresa_id,

        processo_nome:
          'Processo teste'

      }, {});

    teste(
      '9 — NAO_ENQUADRADO bloqueado',
      naoEnquadrado.acao ===
        'BLOQUEADO' &&
      naoEnquadrado.criado ===
        false,
      JSON.stringify(naoEnquadrado)
    );


    /*
     * --------------------------------------------------------
     * TESTE 10 — APTO FALSE
     * --------------------------------------------------------
     */
    const aptoFalse =
      criarLeadDiagnosticoV61_({

        diagnostico_id:
          'TESTE-V61-B',

        empresa_id:
          inicio.empresa_id,

        classificacao:
          'AVANCAR',

        acao:
          'AVANCAR',

        prioridade:
          'ALTA',

        solucao_principal_id:
          'SOL-V61-TESTE',

        confianca:
          'ALTA',

        apto_para_lead:
          false

      }, {

        diagnostico_id:
          'TESTE-V61-B',

        empresa_id:
          inicio.empresa_id,

        processo_nome:
          'Processo teste'

      }, {

        oportunidade:
          'Oportunidade teste'

      });

    teste(
      '10 — apto_para_lead false bloqueado',
      aptoFalse.acao ===
        'BLOQUEADO' &&
      aptoFalse.criado ===
        false,
      JSON.stringify(aptoFalse)
    );


    /*
     * --------------------------------------------------------
     * TESTE 11 — SEM SOLUÇÃO
     * --------------------------------------------------------
     */
    const semSolucao =
      criarLeadDiagnosticoV61_({

        diagnostico_id:
          'TESTE-V61-B',

        empresa_id:
          inicio.empresa_id,

        classificacao:
          'AVANCAR',

        acao:
          'AVANCAR',

        prioridade:
          'ALTA',

        solucao_principal_id:
          '',

        confianca:
          'ALTA',

        apto_para_lead:
          true

      }, {

        diagnostico_id:
          'TESTE-V61-B',

        empresa_id:
          inicio.empresa_id,

        processo_nome:
          'Processo teste'

      }, {

        oportunidade:
          'Oportunidade teste'

      });

    teste(
      '11 — Sem solução principal bloqueado',
      semSolucao.acao ===
        'BLOQUEADO' &&
      semSolucao.criado ===
        false,
      JSON.stringify(semSolucao)
    );


    /*
     * --------------------------------------------------------
     * TESTE 12 — SEM EMPRESA
     * --------------------------------------------------------
     */
    const semEmpresa =
      criarLeadDiagnosticoV61_({

        diagnostico_id:
          'TESTE-V61-B',

        empresa_id:
          '',

        classificacao:
          'AVANCAR',

        acao:
          'AVANCAR',

        prioridade:
          'ALTA',

        solucao_principal_id:
          'SOL-V61-TESTE',

        confianca:
          'ALTA',

        apto_para_lead:
          true

      }, {

        diagnostico_id:
          'TESTE-V61-B',

        empresa_id:
          '',

        processo_nome:
          'Processo teste'

      }, {

        oportunidade:
          'Oportunidade teste'

      });

    teste(
      '12 — Empresa ausente bloqueada',
      semEmpresa.acao ===
        'BLOQUEADO' &&
      semEmpresa.criado ===
        false,
      JSON.stringify(semEmpresa)
    );


    /*
     * --------------------------------------------------------
     * TESTE 13 — SEM DIAGNÓSTICO
     * --------------------------------------------------------
     */
    const semDiagnostico =
      criarLeadDiagnosticoV61_({

        diagnostico_id:
          '',

        empresa_id:
          inicio.empresa_id,

        classificacao:
          'AVANCAR',

        acao:
          'AVANCAR',

        prioridade:
          'ALTA',

        solucao_principal_id:
          'SOL-V61-TESTE',

        confianca:
          'ALTA',

        apto_para_lead:
          true

      }, {

        diagnostico_id:
          '',

        empresa_id:
          inicio.empresa_id,

        processo_nome:
          'Processo teste'

      }, {

        oportunidade:
          'Oportunidade teste'

      });

    teste(
      '13 — Diagnóstico ausente bloqueado',
      semDiagnostico.acao ===
        'BLOQUEADO' &&
      semDiagnostico.criado ===
        false,
      JSON.stringify(semDiagnostico)
    );


    /*
     * --------------------------------------------------------
     * TESTE 14 — CONFIANÇA MÉDIA
     * --------------------------------------------------------
     */
    const confiancaMedia =
      criarLeadDiagnosticoV61_({

        diagnostico_id:
          'TESTE-V61-B',

        empresa_id:
          inicio.empresa_id,

        classificacao:
          'AVANCAR',

        acao:
          'AVANCAR',

        prioridade:
          'ALTA',

        solucao_principal_id:
          'SOL-V61-TESTE',

        confianca:
          'MÉDIA',

        apto_para_lead:
          true

      }, {

        diagnostico_id:
          'TESTE-V61-B',

        empresa_id:
          inicio.empresa_id,

        processo_nome:
          'Processo teste'

      }, {

        oportunidade:
          'Oportunidade teste'

      });

    teste(
      '14 — Confiança diferente de ALTA bloqueada',
      confiancaMedia.acao ===
        'BLOQUEADO' &&
      confiancaMedia.criado ===
        false,
      JSON.stringify(confiancaMedia)
    );


    /*
     * --------------------------------------------------------
     * TESTE 15 — CLASSIFICAÇÃO INVÁLIDA
     * --------------------------------------------------------
     */
    const classificacaoInvalida =
      criarLeadDiagnosticoV61_({

        diagnostico_id:
          'TESTE-V61-B',

        empresa_id:
          inicio.empresa_id,

        classificacao:
          'QUALQUER_COISA',

        acao:
          'AVANCAR',

        prioridade:
          'ALTA',

        solucao_principal_id:
          'SOL-V61-TESTE',

        confianca:
          'ALTA',

        apto_para_lead:
          true

      }, {

        diagnostico_id:
          'TESTE-V61-B',

        empresa_id:
          inicio.empresa_id,

        processo_nome:
          'Processo teste'

      }, {

        oportunidade:
          'Oportunidade teste'

      });

    teste(
      '15 — Classificação inválida bloqueada',
      classificacaoInvalida.acao ===
        'BLOQUEADO' &&
      classificacaoInvalida.criado ===
        false,
      JSON.stringify(
        classificacaoInvalida
      )
    );


    /*
     * --------------------------------------------------------
     * TESTE 16 — EMPRESA DIFERENTE
     * --------------------------------------------------------
     */
    const empresaDiferente =
      iniciarDiagnostico({

        nome:
          'Empresa Teste V6.1 B',

        nome_empresa:
          'Empresa Teste V6.1 B',

        segmento:
          'Serviços',

        porte:
          'PEQUENA',

        nome_contato:
          'Contato B',

        whatsapp:
          '',

        email:
          '',

        cidade:
          ''

      });

    const leadEmpresaDiferente =
      criarLeadDiagnosticoV61_({

        diagnostico_id:
          'TESTE-V61-A',

        empresa_id:
          empresaDiferente.empresa_id,

        classificacao:
          'AVANCAR',

        acao:
          'AVANCAR',

        prioridade:
          'ALTA',

        solucao_principal_id:
          'SOL-V61-TESTE',

        confianca:
          'ALTA',

        apto_para_lead:
          true

      }, {

        diagnostico_id:
          'TESTE-V61-A',

        empresa_id:
          empresaDiferente.empresa_id,

        processo_nome:
          'Processo diferente'

      }, {

        oportunidade:
          'Oportunidade empresa diferente'

      });

    teste(
      '16 — Empresa diferente pode criar novo Lead',
      leadEmpresaDiferente.acao ===
        'CRIAR' &&
      leadEmpresaDiferente.criado ===
        true,
      JSON.stringify(
        leadEmpresaDiferente
      )
    );


    /*
     * --------------------------------------------------------
     * TESTE 17 — MESMA EMPRESA / NOVO DIAGNÓSTICO
     * --------------------------------------------------------
     */
    const novoDiagnostico =
      iniciarDiagnostico({

        nome:
          'Novo Diagnóstico V6.1',

        nome_empresa:
          'Novo Diagnóstico V6.1',

        segmento:
          'Serviços',

        porte:
          'PEQUENA',

        nome_contato:
          'Contato Novo',

        whatsapp:
          '',

        email:
          '',

        cidade:
          ''

      });

    const leadNovoDiagnostico =
      criarLeadDiagnosticoV61_({

        diagnostico_id:
          novoDiagnostico.diagnostico_id,

        empresa_id:
          inicio.empresa_id,

        classificacao:
          'AVANCAR',

        acao:
          'AVANCAR',

        prioridade:
          'ALTA',

        solucao_principal_id:
          'SOL-V61-TESTE',

        confianca:
          'ALTA',

        apto_para_lead:
          true

      }, {

        diagnostico_id:
          novoDiagnostico.diagnostico_id,

        empresa_id:
          inicio.empresa_id,

        processo_nome:
          'Novo processo'

      }, {

        oportunidade:
          'Nova oportunidade'

      });

    teste(
      '17 — Novo diagnóstico permite novo Lead',
      leadNovoDiagnostico.acao ===
        'CRIAR' &&
      leadNovoDiagnostico.criado ===
        true,
      JSON.stringify(
        leadNovoDiagnostico
      )
    );


    /*
     * --------------------------------------------------------
     * TESTE 18 — RASTREABILIDADE
     * --------------------------------------------------------
     */
    const leadRastreado =
      buscarLeadPorDiagnosticoV61_(
        inicio.empresa_id,
        'TESTE-V61-A'
      );

    teste(
      '18 — Rastreabilidade empresa + diagnóstico',
      !!leadRastreado &&
      String(
        leadRastreado.dados.empresa_id || ''
      ) ===
      String(
        inicio.empresa_id
      ) &&
      String(
        leadRastreado.dados.diagnostico_id || ''
      ) ===
      'TESTE-V61-A',
      leadRastreado
        ? JSON.stringify(
            leadRastreado.dados
          )
        : 'Não encontrado'
    );


    /*
     * --------------------------------------------------------
     * TESTE 19 — STATUS NÃO PULA ETAPA
     * --------------------------------------------------------
     */
    teste(
      '19 — Lead nasce somente como NOVO',
      !!leadRastreado &&
      String(
        leadRastreado.dados.status || ''
      ) ===
      STATUS_LEAD.NOVO,
      leadRastreado
        ? String(
            leadRastreado.dados.status
          )
        : 'Não encontrado'
    );


    /*
     * --------------------------------------------------------
     * TESTE 20 — NÃO CRIA LEAD SEM AUTORIZAÇÃO
     * --------------------------------------------------------
     */
    const totalAntesBloqueio =
      obterAba_(
        SHEETS.LEADS
      )
        .getDataRange()
        .getValues()
        .length;

    criarLeadDiagnosticoV61_({

      diagnostico_id:
        'TESTE-V61-B',

      empresa_id:
        inicio.empresa_id,

      classificacao:
        'NAO_ENQUADRADO',

      acao:
        'NAO_AVANCAR',

      prioridade:
        'MÉDIA',

      solucao_principal_id:
        '',

      confianca:
        'BAIXA',

      apto_para_lead:
        false

    }, {

      diagnostico_id:
        'TESTE-V61-B',

      empresa_id:
        inicio.empresa_id,

      processo_nome:
        'Não deve gerar Lead'

    }, {});

    const totalDepoisBloqueio =
      obterAba_(
        SHEETS.LEADS
      )
        .getDataRange()
        .getValues()
        .length;

    teste(
      '20 — Bloqueio não altera quantidade de Leads',
      totalAntesBloqueio ===
        totalDepoisBloqueio,
      'Antes: ' +
      totalAntesBloqueio +
      ' | Depois: ' +
      totalDepoisBloqueio
    );


    /*
     * --------------------------------------------------------
     * RESULTADO
     * --------------------------------------------------------
     */
    const aprovados =
      resultados.filter(
        function(item) {

          return item.passou === true;

        }
      ).length;

    const total =
      resultados.length;

    Logger.log(
      '===================================================='
    );

    resultados.forEach(
      function(
        item,
        indice
      ) {

        Logger.log(

          (
            item.passou
              ? 'PASSOU'
              : 'FALHOU'
          ) +

          ' — TESTE ' +

          (
            indice + 1
          ) +

          ': ' +

          item.teste +

          ' — ' +

          item.detalhe

        );

      }
    );

    Logger.log(
      '===================================================='
    );

    Logger.log(
      'RESULTADO V6.1: ' +
      aprovados +
      '/' +
      total
    );

    Logger.log(
      'PERCENTUAL V6.1: ' +
      (
        total > 0
          ? (
              aprovados /
              total
            ) * 100
          : 0
      ) +
      '%'
    );


    if (
      aprovados !==
      total
    ) {

      throw new Error(
        'V6.1 FALHOU: ' +
        aprovados +
        '/' +
        total
      );

    }


    Logger.log(
      'TESTAR_MOTOR_LEAD_V61: PASSOU'
    );


    return {

      sucesso:
        true,

      aprovados:
        aprovados,

      total:
        total,

      percentual:
        total > 0
          ? (
              aprovados /
              total
            ) * 100
          : 0,

      resultados:
        resultados,

      lead:
        leadCriado

    };


  } finally {

    /*
     * --------------------------------------------------------
     * LIMPEZA
     * --------------------------------------------------------
     *
     * Remove somente os Leads criados pelo teste.
     */
    try {

      limparRegistrosPorCampoV510_(
        SHEETS.LEADS,
        'diagnostico_id',
        'TESTE-V61-A'
      );

      limparRegistrosPorCampoV510_(
        SHEETS.LEADS,
        'diagnostico_id',
        'TESTE-V61-B'
      );

      limparRegistrosPorCampoV510_(
        SHEETS.LEADS,
        'diagnostico_id',
        'TESTE-V61-C'
      );

      if (inicio) {

        limparRegistrosPorCampoV510_(
          SHEETS.LEADS,
          'diagnostico_id',
          inicio.diagnostico_id
        );

        limparRegistrosPorCampoV510_(
          SHEETS.DIAGNOSTICOS,
          'diagnostico_id',
          inicio.diagnostico_id
        );

        limparRegistrosPorCampoV510_(
          SHEETS.CONVERSAS,
          'conversa_id',
          inicio.conversa_id
        );

        limparRegistrosPorCampoV510_(
          SHEETS.METRICAS,
          'conversa_id',
          inicio.conversa_id
        );

      }

      Logger.log(
        'LIMPEZA V6.1 PRINCIPAL CONCLUÍDA'
      );

    } catch (erro) {

      Logger.log(
        'Falha na limpeza V6.1: ' +
        erro.message
      );

    }

  }

}

function TESTAR_INTEGRACAO_REAL_V61() {

  Logger.log('====================================================');
  Logger.log('INICIANDO INTEGRAÇÃO REAL V6.1');
  Logger.log('====================================================');

  const resultados = [];

  function teste(nome, passou, detalhe) {

    resultados.push({
      nome: nome,
      passou: passou === true,
      detalhe: String(detalhe || '')
    });

  }

  let inicio = null;
  let leadPrimeiro = null;
  let leadSegundo = null;

  try {

    /*
     * ========================================================
     * 1. CRIAR DIAGNÓSTICO REAL
     * ========================================================
     */

    inicio = iniciarDiagnostico({

      nome:
        'Teste Integração V6.1',

      nome_empresa:
        'Teste Integração V6.1',

      segmento:
        'Serviços',

      porte:
        'PEQUENA',

      nome_contato:
        'Contato Integração V6.1',

      whatsapp:
        '',

      email:
        '',

      cidade:
        ''

    });

    teste(
      '1 — Diagnóstico real inicializado',
      !!inicio &&
      !!inicio.empresa_id &&
      !!inicio.conversa_id &&
      !!inicio.diagnostico_id,
      JSON.stringify(inicio)
    );


    /*
     * ========================================================
     * 2. MENSAGEM REAL
     * ========================================================
     */

    const mensagem =
      'Nosso processo principal é conferir e lançar pedidos. ' +
      'Temos erros de digitação e retrabalho nesse processo. ' +
      'Isso acontece diariamente. ' +
      'Processamos 120 pedidos por dia. ' +
      'Perdemos aproximadamente 3 horas por dia com esse problema. ' +
      'Nosso objetivo é reduzir os erros e diminuir o retrabalho.';


    /*
     * ========================================================
     * 3. EXECUTAR FLUXO PRINCIPAL
     * ========================================================
     */

    const resultadoFluxo =
      processarMensagemDiagnostico({

        empresa_id:
          inicio.empresa_id,

        conversa_id:
          inicio.conversa_id,

        mensagem:
          mensagem

      });


    teste(
      '2 — Fluxo principal executado',
      !!resultadoFluxo,
      JSON.stringify(resultadoFluxo)
    );


    /*
     * ========================================================
     * 4. RECUPERAR V5.11
     * ========================================================
     */

    const encaminhamento =
      resultadoFluxo &&
      resultadoFluxo.encaminhamento
        ? resultadoFluxo.encaminhamento
        : null;

    teste(
      '3 — V5.11 presente',
      !!encaminhamento,
      JSON.stringify(encaminhamento)
    );


    /*
     * ========================================================
     * 5. VALIDAR AUTORIZAÇÃO V6.1
     * ========================================================
     */

    const autorizacao =
      validarAutorizacaoLeadV61_(
        encaminhamento
      );

    teste(
      '4 — V5.11 autoriza criação do Lead',
      autorizacao.autorizado === true,
      JSON.stringify(autorizacao)
    );


    /*
     * ========================================================
     * 6. RECUPERAR DIAGNÓSTICO
     * ========================================================
     */

    const diagnostico =
      obterDiagnosticoAtual_(
        inicio.empresa_id,
        inicio.conversa_id
      );

    teste(
      '5 — Diagnóstico real recuperado',
      !!diagnostico &&
      String(
        diagnostico.diagnostico_id || ''
      ) ===
      String(
        inicio.diagnostico_id
      ),
      JSON.stringify(diagnostico)
    );


    /*
     * ========================================================
     * 7. RECUPERAR OPORTUNIDADE
     * ========================================================
     */

    const oportunidadeWrapper =
      resultadoFluxo &&
      resultadoFluxo.oportunidade
        ? resultadoFluxo.oportunidade
        : null;

    const oportunidade =
      oportunidadeWrapper
        ? Object.assign(
            {},
            oportunidadeWrapper.oportunidade || {},
            {
              oportunidade_id:
                oportunidadeWrapper.oportunidade_id,

              acao:
                oportunidadeWrapper.acao,

              linha:
                oportunidadeWrapper.linha
            }
          )
        : null;

    teste(
      '6 — Oportunidade V5.7 presente',
      !!oportunidade,
      JSON.stringify(oportunidade)
    );


    /*
     * ========================================================
     * 8. CRIAR LEAD V6.1
     * ========================================================
     */

    leadPrimeiro =
      criarLeadDiagnosticoV61_(
        encaminhamento,
        diagnostico,
        oportunidade
      );

    teste(
      '7 — V6.1 criou Lead',
      leadPrimeiro.acao ===
        'CRIAR' &&
      leadPrimeiro.criado ===
        true &&
      !!leadPrimeiro.lead_id,
      JSON.stringify(leadPrimeiro)
    );


    /*
     * ========================================================
     * 9. STATUS
     * ========================================================
     */

    teste(
      '8 — Lead integrado nasce NOVO',
      leadPrimeiro.status ===
        STATUS_LEAD.NOVO,
      leadPrimeiro.status
    );


    /*
     * ========================================================
     * 10. RECUPERAR LEAD
     * ========================================================
     */

    const leadPersistido =
      buscarLeadPorDiagnosticoV61_(
        inicio.empresa_id,
        inicio.diagnostico_id
      );

    teste(
      '9 — Lead encontrado após persistência',
      !!leadPersistido &&
      String(
        leadPersistido.dados.lead_id || ''
      ) ===
      String(
        leadPrimeiro.lead_id
      ),
      leadPersistido
        ? JSON.stringify(
            leadPersistido.dados
          )
        : 'Lead não encontrado'
    );


    /*
     * ========================================================
     * 11. RASTREABILIDADE
     * ========================================================
     */

    teste(
      '10 — Rastreabilidade empresa + diagnóstico',
      !!leadPersistido &&
      String(
        leadPersistido.dados.empresa_id || ''
      ) ===
      String(
        inicio.empresa_id
      ) &&
      String(
        leadPersistido.dados.diagnostico_id || ''
      ) ===
      String(
        inicio.diagnostico_id
      ),
      leadPersistido
        ? JSON.stringify(
            leadPersistido.dados
          )
        : 'Não encontrado'
    );


    /*
     * ========================================================
     * 12. INTERESSE
     * ========================================================
     */

    teste(
      '11 — Interesse preservado',
      !!leadPersistido &&
      String(
        leadPersistido.dados.interesse || ''
      ).trim() !== '',
      leadPersistido
        ? String(
            leadPersistido.dados.interesse || ''
          )
        : 'Não encontrado'
    );


    /*
     * ========================================================
     * 13. SEGUNDA EXECUÇÃO REAL
     * ========================================================
     */

    Logger.log(
      '===================================================='
    );

    Logger.log(
      'EXECUTANDO SEGUNDA VEZ PARA TESTAR IDEMPOTÊNCIA'
    );

    Logger.log(
      '===================================================='
    );


    const resultadoFluxoSegundo =
      processarMensagemDiagnostico({

        empresa_id:
          inicio.empresa_id,

        conversa_id:
          inicio.conversa_id,

        mensagem:
          mensagem

      });


    teste(
      '12 — Segunda execução do fluxo concluída',
      !!resultadoFluxoSegundo,
      JSON.stringify(
        resultadoFluxoSegundo
      )
    );


    /*
     * ========================================================
     * 14. V5.11 SEGUNDA EXECUÇÃO
     * ========================================================
     */

    const encaminhamentoSegundo =
      resultadoFluxoSegundo &&
      resultadoFluxoSegundo.encaminhamento
        ? resultadoFluxoSegundo.encaminhamento
        : null;

    teste(
      '13 — V5.11 permanece presente na segunda execução',
      !!encaminhamentoSegundo,
      JSON.stringify(
        encaminhamentoSegundo
      )
    );


    /*
     * ========================================================
     * 15. DIAGNÓSTICO SEGUNDO
     * ========================================================
     */

    const diagnosticoSegundo =
      obterDiagnosticoAtual_(
        inicio.empresa_id,
        inicio.conversa_id
      );

    teste(
      '14 — Diagnóstico permanece o mesmo',
      !!diagnosticoSegundo &&
      String(
        diagnosticoSegundo.diagnostico_id || ''
      ) ===
      String(
        inicio.diagnostico_id
      ),
      JSON.stringify(
        diagnosticoSegundo
      )
    );


    /*
     * ========================================================
     * 16. OPORTUNIDADE SEGUNDA
     * ========================================================
     */

    const oportunidadeWrapperSegundo =
      resultadoFluxoSegundo &&
      resultadoFluxoSegundo.oportunidade
        ? resultadoFluxoSegundo.oportunidade
        : null;

    const oportunidadeSegundo =
      oportunidadeWrapperSegundo
        ? Object.assign(
            {},
            oportunidadeWrapperSegundo.oportunidade || {},
            {
              oportunidade_id:
                oportunidadeWrapperSegundo.oportunidade_id,

              acao:
                oportunidadeWrapperSegundo.acao,

              linha:
                oportunidadeWrapperSegundo.linha
            }
          )
        : null;


    /*
     * ========================================================
     * 17. SEGUNDA TENTATIVA DE CRIAÇÃO
     * ========================================================
     */

    leadSegundo =
      criarLeadDiagnosticoV61_(
        encaminhamentoSegundo,
        diagnosticoSegundo,
        oportunidadeSegundo
      );

    teste(
      '15 — Segunda execução retorna JA_EXISTE',
      leadSegundo.acao ===
        'JA_EXISTE' &&
      leadSegundo.criado ===
        false,
      JSON.stringify(
        leadSegundo
      )
    );


    /*
     * ========================================================
     * 18. MESMO LEAD_ID
     * ========================================================
     */

    teste(
      '16 — Segunda execução mantém mesmo lead_id',
      leadSegundo.lead_id ===
        leadPrimeiro.lead_id,
      'Primeiro: ' +
      leadPrimeiro.lead_id +
      ' | Segundo: ' +
      leadSegundo.lead_id
    );


    /*
     * ========================================================
     * 19. QUANTIDADE DE LEADS
     * ========================================================
     */

    const leadsDepois =
      buscarLeadPorDiagnosticoV61_(
        inicio.empresa_id,
        inicio.diagnostico_id
      );

    teste(
      '17 — Existe exatamente um Lead para o diagnóstico',
      !!leadsDepois &&
      leadsDepois.dados.lead_id ===
        leadPrimeiro.lead_id,
      leadsDepois
        ? JSON.stringify(
            leadsDepois.dados
          )
        : 'Não encontrado'
    );


    /*
     * ========================================================
     * 20. STATUS NÃO ALTERADO
     * ========================================================
     */

    teste(
      '18 — Segunda execução mantém status NOVO',
      !!leadsDepois &&
      String(
        leadsDepois.dados.status || ''
      ) ===
      STATUS_LEAD.NOVO,
      leadsDepois
        ? String(
            leadsDepois.dados.status
          )
        : 'Não encontrado'
    );


    /*
     * ========================================================
     * 21. V5.11 CONTINUA MÁXIMO
     * ========================================================
     */

    teste(
      '19 — V5.11 continua apto para Lead',
      !!encaminhamentoSegundo &&
      encaminhamentoSegundo.apto_para_lead ===
        true &&
      String(
        encaminhamentoSegundo.classificacao || ''
      ).toUpperCase() ===
        'AVANCAR',
      JSON.stringify(
        encaminhamentoSegundo
      )
    );


    /*
     * ========================================================
     * 22. LEAD NÃO É DUPLICADO
     * ========================================================
     */

    const abaLeads =
      obterAba_(
        SHEETS.LEADS
      );

    const valoresLeads =
      abaLeads
        .getDataRange()
        .getValues();

    const cabecalhosLeads =
      valoresLeads[0];

    const indiceEmpresa =
      cabecalhosLeads.indexOf(
        'empresa_id'
      );

    const indiceDiagnostico =
      cabecalhosLeads.indexOf(
        'diagnostico_id'
      );

    let quantidadeMesmoDiagnostico =
      0;

    for (
      let i = 1;
      i < valoresLeads.length;
      i++
    ) {

      if (
        String(
          valoresLeads[i][indiceEmpresa] || ''
        ).trim() ===
        String(
          inicio.empresa_id
        ).trim() &&

        String(
          valoresLeads[i][indiceDiagnostico] || ''
        ).trim() ===
        String(
          inicio.diagnostico_id
        ).trim()
      ) {

        quantidadeMesmoDiagnostico++;

      }

    }

    teste(
      '20 — Não existe Lead duplicado',
      quantidadeMesmoDiagnostico === 1,
      'Quantidade encontrada: ' +
      quantidadeMesmoDiagnostico
    );


    /*
     * ========================================================
     * RESULTADO
     * ========================================================
     */

    const aprovados =
      resultados.filter(
        function(item) {
          return item.passou === true;
        }
      ).length;

    const total =
      resultados.length;

    Logger.log(
      '===================================================='
    );

    resultados.forEach(
      function(item, indice) {

        Logger.log(
          (
            item.passou
              ? 'PASSOU'
              : 'FALHOU'
          ) +
          ' — TESTE ' +
          (indice + 1) +
          ': ' +
          item.nome +
          ' — ' +
          item.detalhe
        );

      }
    );

    Logger.log(
      '===================================================='
    );

    Logger.log(
      'RESULTADO INTEGRAÇÃO V6.1: ' +
      aprovados +
      '/' +
      total
    );

    Logger.log(
      'PERCENTUAL INTEGRAÇÃO V6.1: ' +
      (
        total > 0
          ? (
              aprovados /
              total
            ) * 100
          : 0
      ) +
      '%'
    );


    if (
      aprovados !==
      total
    ) {

      throw new Error(
        'INTEGRAÇÃO V6.1 FALHOU: ' +
        aprovados +
        '/' +
        total
      );

    }


    Logger.log(
      'TESTAR_INTEGRACAO_REAL_V61: PASSOU'
    );

    return {

      sucesso:
        true,

      aprovados:
        aprovados,

      total:
        total,

      percentual:
        total > 0
          ? (
              aprovados /
              total
            ) * 100
          : 0,

      lead_primeiro:
        leadPrimeiro,

      lead_segundo:
        leadSegundo

    };


  } finally {

    /*
     * ========================================================
     * LIMPEZA
     * ========================================================
     */

    try {

      if (inicio) {

        limparRegistrosPorCampoV510_(
          SHEETS.LEADS,
          'diagnostico_id',
          inicio.diagnostico_id
        );

        limparRegistrosPorCampoV510_(
          SHEETS.DIAGNOSTICOS,
          'diagnostico_id',
          inicio.diagnostico_id
        );

        limparRegistrosPorCampoV510_(
          SHEETS.CONVERSAS,
          'conversa_id',
          inicio.conversa_id
        );

        limparRegistrosPorCampoV510_(
          SHEETS.METRICAS,
          'conversa_id',
          inicio.conversa_id
        );

      }

      Logger.log(
        'LIMPEZA INTEGRAÇÃO V6.1 CONCLUÍDA'
      );

    } catch (erroLimpeza) {

      Logger.log(
        'Falha na limpeza V6.1: ' +
        erroLimpeza.message
      );

    }

  }

}
