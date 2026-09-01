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


  /**
   * ----------------------------------------------------------
   * 1. RECUPERAR DIAGNÓSTICO
   * ----------------------------------------------------------
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


  /**
   * ----------------------------------------------------------
   * 2. SALVAR MENSAGEM DO EMPRESÁRIO
   * ----------------------------------------------------------
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


  /**
   * ----------------------------------------------------------
   * 3. RECUPERAR CONTEXTO
   * ----------------------------------------------------------
   */

  const contexto =
    construirContextoDiagnostico_(
      diagnostico
    );


  /**
   * ----------------------------------------------------------
   * 4. CONSTRUIR ENTRADA PARA IA
   * ----------------------------------------------------------
   */

  const entradaIA =
    construirEntradaDiagnosticoIA_(
      mensagem,
      contexto
    );


  /**
   * ----------------------------------------------------------
   * 5. ANALISAR COM GEMINI
   * ----------------------------------------------------------
   *
   * Função fornecida pelo IA.gs.
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


  /**
   * ----------------------------------------------------------
   * 6. NORMALIZAR E VALIDAR ANÁLISE
   * ----------------------------------------------------------
   *
   * A IA interpreta linguagem.
   * O motor controla a integridade dos dados.
   *
   * Portanto, não gravamos diretamente os campos vindos
   * da IA. Primeiro corrigimos classificações óbvias e
   * preservamos fatos já conhecidos.
   */

  const analiseNormalizada =
    normalizarAnaliseDiagnostico_(
      analise.dados,
      mensagem,
      contexto.diagnostico || {}
    );

  // A IA pode retornar vazio em uma rodada posterior. O motor nunca
  // perde uma medida confirmada já existente.
  if (
    !analiseNormalizada.volume &&
    contexto.diagnostico &&
    contexto.diagnostico.volume
  ) {
    analiseNormalizada.volume =
      contexto.diagnostico.volume;
  }

  /**
   * ----------------------------------------------------------
   * 7. CONTROLAR CONTINUIDADE
   * ----------------------------------------------------------
   */

  const analiseContinuidade =
    ajustarContinuidadeDiagnostico_(
      analiseNormalizada,
      contexto.pergunta_pendente || '',
      mensagem
    );


  /**
   * ----------------------------------------------------------
   * 7. ATUALIZAR DIAGNÓSTICO
   * ----------------------------------------------------------
   */

  const novoDiagnostico =
    atualizarDiagnosticoComAnalise_(
      diagnostico,
      analiseContinuidade
    );


  /**
   * ----------------------------------------------------------
   * 8. DETERMINAR ESTADO
   * ----------------------------------------------------------
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


  /**
   * ----------------------------------------------------------
   * 8. SALVAR DIAGNÓSTICO
   * ----------------------------------------------------------
   */

  atualizarDiagnostico_(
    novoDiagnostico
  );

  // Persistência separada: novas dores e medidas não substituem
  // o diagnóstico consolidado.
  registrarNovasInformacoesDiagnostico_(
    novoDiagnostico,
    analiseContinuidade,
    mensagem
  );


  /**
   * ----------------------------------------------------------
   * 9. ATUALIZAR ÚLTIMA INTERAÇÃO DA EMPRESA
   * ----------------------------------------------------------
   */

  atualizarUltimaInteracaoEmpresa_(
    empresaId
  );


  /**
   * ----------------------------------------------------------
   * 10. DETERMINAR RESPOSTA
   * ----------------------------------------------------------
   */

  const resposta =
    obterRespostaConversa_(
      analiseContinuidade,
      novoEstado
    );


  /**
   * ----------------------------------------------------------
   * 11. SALVAR RESPOSTA DO SISTEMA
   * ----------------------------------------------------------
   *
   * Só grava se realmente houver uma resposta.
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


  /**
   * ----------------------------------------------------------
   * 12. MÉTRICA
   * ----------------------------------------------------------
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


  /**
   * ----------------------------------------------------------
   * 13. RETORNO PARA INTERFACE
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
      novoDiagnostico.diagnostico_id,

    estado:
      novoEstado,

    resposta:
      resposta,

    diagnostico:
      novoDiagnostico,

    analise_ia:
      analiseContinuidade

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
     *
     * Exemplo rejeitado:
     *
     * dor:
     * "perde três horas por dia"
     *
     * impacto:
     * "perde três horas por dia"
     *
     * Exemplo aceito:
     *
     * dor:
     * "Perda de tempo com processo manual"
     *
     * impacto:
     * "Três horas perdidas por dia"
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


      Logger.log(
        'NOVA DOR REGISTRADA: ' +
        dor
      );

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

  const medidas =
    extrairMedidasMensagemDiagnostico_(
      mensagemAtual
    );


  /*
   * Se a mensagem não trouxe uma medida
   * detectável diretamente, utilizamos o
   * volume retornado pela análise.
   */

  if (
    medidas.length === 0 &&
    analise.volume
  ) {

    medidas.push({
      tipo:
        'VOLUME',

      texto:
        String(
          analise.volume
        ).trim()
    });
  }


  // ============================================================
  // REGISTRO DAS MEDIDAS
  // ============================================================

  medidas.forEach(
    function(medida) {

      if (!medida) {
        return;
      }


      registrarEventoDiagnostico_(
        'MEDIDA_DIAGNOSTICO',
        {
          empresa_id:
            diagnostico.empresa_id,

          conversa_id:
            diagnostico.conversa_id,

          valor:
            medida
        }
      );

    }
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


  const possuiProcesso = !!String(diagnostico.processo_nome || '').trim();
  const possuiDor = !!String(diagnostico.dor_principal || '').trim();
  const possuiFrequencia = !!String(diagnostico.frequencia || '').trim();
  const possuiImpacto = !!String(diagnostico.impacto_nivel || '').trim();
  const possuiInformacaoFaltante = !!String(analise && analise.informacao_faltante || '').trim();

  if (!possuiProcesso && !possuiDor) return DIAGNOSTICO_ESTADOS.INICIO;
  if (!possuiProcesso || !possuiDor) return DIAGNOSTICO_ESTADOS.DESCOBERTA;

  // O diagnóstico só pode avançar quando não há uma lacuna relevante.
  // Volume é uma medida registrada separadamente; não é obrigatório
  // estar em DIAGNOSTICOS para manter o contrato V1.
  if (!possuiFrequencia || !possuiImpacto || possuiInformacaoFaltante) {
    return DIAGNOSTICO_ESTADOS.INVESTIGACAO;
  }

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