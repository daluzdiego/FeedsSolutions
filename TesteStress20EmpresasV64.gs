/**
 * FEEDS SOLUTIONS V6.4 — STRESS TEST EXTREMO DE 20 EMPRESAS
 *
 * Executar: TESTAR_STRESS_20_EMPRESAS_V64()
 *
 * Escopo:
 * - 20 empresas fictícias, 20 contextos operacionais distintos e de alta complexidade.
 * - Exercita o estado real, evidências, certeza, conflitos, lacunas, classificador,
 *   gate de conclusão, validação estrutural, serialização e envelope legado.
 * - Não chama Gemini, não acessa planilhas, não grava dados, não altera produção.
 * - As 20 empresas são fixtures sintéticas; não representam clientes reais.
 *
 * IMPORTANTE:
 * Este é um teste de estresse determinístico do núcleo. Não substitui o teste Gemini
 * real nem uma revisão de perguntas aceitas em conversas reais.
 */
function TESTAR_STRESS_20_EMPRESAS_V64() {
  var inicio = new Date().getTime();
  var resultados = [];
  var falhas = [];
  var empresas = [
    { id:'E01', setor:'Distribuidora farmacêutica', problema:'lotes, validade, rastreabilidade e pedidos urgentes', valor:'Separação manual de medicamentos por lote e validade', evidencia:'A equipe separa medicamentos manualmente por lote e validade.', pergunta:'Em quais horários chegam mais pedidos urgentes de farmácias?', dimensao:'frequencia' },
    { id:'E02', setor:'Oficina de manutenção pesada', problema:'ordens de serviço, peças incompatíveis e retorno de equipamentos', valor:'Ordens de serviço preenchidas em papel e digitadas depois', evidencia:'As ordens de serviço são preenchidas em papel e digitadas depois.', pergunta:'Quantas ordens de serviço são abertas por semana?', dimensao:'escala' },
    { id:'E03', setor:'Clínica multiprofissional', problema:'agendas concorrentes, cancelamentos e dados sensíveis', valor:'Agendamentos distribuídos entre telefone e mensagens', evidencia:'Os agendamentos chegam por telefone e mensagens.', pergunta:'Em quais períodos ocorrem mais cancelamentos de consultas?', dimensao:'frequencia' },
    { id:'E04', setor:'Transportadora frigorificada', problema:'temperatura, janelas de entrega, rotas e cadeia de custódia', valor:'Despachantes consolidam rotas em várias planilhas', evidencia:'Os despachantes consolidam rotas em várias planilhas.', pergunta:'Quantas entregas refrigeradas são feitas por dia?', dimensao:'escala' },
    { id:'E05', setor:'Indústria de alimentos', problema:'rastreabilidade de ingredientes, retrabalho e inspeções', valor:'Apontamentos de produção transcritos no fim do turno', evidencia:'Os apontamentos de produção são transcritos no fim do turno.', pergunta:'Quanto tempo de trabalho é perdido por dia com a transcrição?', dimensao:'impacto' },
    { id:'E06', setor:'Escritório contábil', problema:'fechamento fiscal, documentos incompletos e prazos distintos', valor:'Documentos recebidos por e-mail sem classificação uniforme', evidencia:'Os documentos chegam por e-mail sem classificação uniforme.', pergunta:'Em quais dias do mês se concentram os picos de documentos?', dimensao:'frequencia' },
    { id:'E07', setor:'Rede de varejo', problema:'estoque divergente entre lojas, promoções e devoluções', valor:'Transferências de estoque registradas separadamente por loja', evidencia:'Cada loja registra transferências de estoque separadamente.', pergunta:'Quantas transferências de estoque são registradas por dia?', dimensao:'escala' },
    { id:'E08', setor:'Cooperativa agrícola', problema:'sazonalidade, classificação de grãos e balanças', valor:'Pesagens e classificação conciliadas manualmente', evidencia:'Pesagens e classificação são conciliadas manualmente.', pergunta:'Em quais períodos da safra o recebimento aumenta?', dimensao:'frequencia' },
    { id:'E09', setor:'E-commerce de peças', problema:'catálogo técnico, SKU parecido e pedidos multicanal', valor:'Pedidos de canais diferentes são reunidos manualmente', evidencia:'Pedidos de canais diferentes são reunidos manualmente.', pergunta:'Quantos pedidos multicanal entram por dia?', dimensao:'escala' },
    { id:'E10', setor:'Laboratório de análises', problema:'amostras, cadeia de custódia, repetição de exames e SLA', valor:'Amostras identificadas em etiquetas e planilhas separadas', evidencia:'Amostras são identificadas em etiquetas e planilhas separadas.', pergunta:'Qual o impacto das identificações incorretas no prazo de liberação?', dimensao:'impacto' },
    { id:'E11', setor:'Construtora', problema:'medições, aditivos, fornecedores e orçamento por obra', valor:'Medições de empreiteiros conferidas por documentos diferentes', evidencia:'As medições de empreiteiros são conferidas em documentos diferentes.', pergunta:'Quantas medições de empreiteiros são conferidas por mês?', dimensao:'escala' },
    { id:'E12', setor:'Operadora de turismo', problema:'alterações de voos, fornecedores, reembolsos e fusos', valor:'Alterações de reservas controladas em mensagens e planilhas', evidencia:'Alterações de reservas são controladas em mensagens e planilhas.', pergunta:'Em quais horários se concentram as solicitações urgentes?', dimensao:'frequencia' },
    { id:'E13', setor:'Empresa de segurança', problema:'escalas, cobertura de postos, ocorrências e substituições', valor:'Substituições de vigilantes coordenadas por telefone', evidencia:'As substituições de vigilantes são coordenadas por telefone.', pergunta:'Quantas substituições de posto são solicitadas por semana?', dimensao:'escala' },
    { id:'E14', setor:'Distribuidora de energia solar', problema:'dimensionamento, kits, compatibilidade e instalação', valor:'Propostas técnicas montadas a partir de várias tabelas', evidencia:'As propostas técnicas são montadas a partir de várias tabelas.', pergunta:'Quanto retrabalho mensal ocorre por incompatibilidade de kits?', dimensao:'impacto' },
    { id:'E15', setor:'Faculdade privada', problema:'matrícula, equivalência curricular, bolsas e documentos', valor:'Solicitações acadêmicas triadas manualmente por setor', evidencia:'As solicitações acadêmicas são triadas manualmente por setor.', pergunta:'Em quais épocas do semestre o volume de solicitações aumenta?', dimensao:'frequencia' },
    { id:'E16', setor:'Rede de restaurantes', problema:'compras, desperdício, substituições de ingredientes e unidades', valor:'Pedidos de compra consolidados manualmente por unidade', evidencia:'Os pedidos de compra são consolidados manualmente por unidade.', pergunta:'Quantos pedidos de compra são consolidados diariamente?', dimensao:'escala' },
    { id:'E17', setor:'Empresa de crédito', problema:'documentação, análise de risco, exceções e auditoria', valor:'Analistas copiam dados entre sistemas de avaliação', evidencia:'Analistas copiam dados entre sistemas de avaliação.', pergunta:'Que restrições regulatórias e de auditoria o sistema deve respeitar?', dimensao:'restricoes' },
    { id:'E18', setor:'Assistência técnica de TI', problema:'prioridade, SLA, ativos, chamados reabertos e plantão', valor:'Chamados classificados manualmente em múltiplas filas', evidencia:'Os chamados são classificados manualmente em múltiplas filas.', pergunta:'Qual indicador comprovará que o novo fluxo reduziu chamados reabertos?', dimensao:'aceitacao' },
    { id:'E19', setor:'Confecção têxtil', problema:'grade de tamanhos, lotes, defeitos e terceirização', valor:'Apontamentos de defeitos agregados manualmente por lote', evidencia:'Os apontamentos de defeitos são agregados manualmente por lote.', pergunta:'Quantas peças por lote precisam de retrabalho?', dimensao:'escala' },
    { id:'E20', setor:'Gestora de condomínios', problema:'inadimplência, ocorrências, fornecedores e aprovação de despesas', valor:'Solicitações de moradores encaminhadas por e-mail e aplicativo', evidencia:'As solicitações de moradores chegam por e-mail e aplicativo.', pergunta:'Como será medido que o tempo de resolução das solicitações melhorou?', dimensao:'aceitacao' }
  ];

  function registrar(empresa, etapa, nome, passou, esperado, observado, detalhe) {
    var item = {
      empresa: empresa.id,
      setor: empresa.setor,
      problema: empresa.problema,
      etapa: etapa,
      teste: nome,
      passou: !!passou,
      esperado: esperado === undefined ? null : esperado,
      observado: observado === undefined ? null : observado,
      detalhe: detalhe || ''
    };
    resultados.push(item);
    if (!item.passou) falhas.push(item);
    Logger.log('[STRESS][EMPRESA ' + empresa.id + '][' + etapa + '][' + (item.passou ? 'PASSOU' : 'FALHOU') + '] ' + JSON.stringify(item));
  }

  Logger.log('========== FEEDS SOLUTIONS V6.4 — STRESS EXTREMO — INÍCIO ==========');
  Logger.log('[STRESS][AMBIENTE] ' + JSON.stringify({
    versao:'V6.4',
    empresas:empresas.length,
    dimensoes:Object.keys(DIMENSOES_V64).length,
    chamadasGemini:0,
    leituraPlanilhas:false,
    escritaPlanilhas:false,
    mutacaoProducao:false,
    cenariosSinteticos:true
  }));

  empresas.forEach(function(emp) {
    Logger.log('[STRESS][EMPRESA ' + emp.id + '][PERFIL] ' + JSON.stringify(emp));
    var estado = criarEstadoInvestigacaoVazioV64_();
    registrar(emp,'01_ESTADO','Inicializa todas as dimensões e lacunas',
      Object.keys(DIMENSOES_V64).every(function(k) {
        var d = DIMENSOES_V64[k];
        return estado.fatos[d] && estado.fatos[d].certeza === CERTEZA_V64.DESCONHECIDO && estado.lacunas[d] === true;
      }), '9 dimensões desconhecidas e abertas',
      { dimensoes:Object.keys(DIMENSOES_V64).length, lacunasAbertas:Object.keys(estado.lacunas).filter(function(k){return estado.lacunas[k];}).length });

    var insercao = atualizarFatoV64_(estado,'processo',emp.valor,emp.evidencia,CERTEZA_V64.CONFIRMADO,'stress-'+emp.id);
    registrar(emp,'02_EVIDENCIA','Fato confirmado exige e preserva evidência',
      insercao.atualizado === true && estado.fatos.processo.evidencia === emp.evidencia && estado.lacunas.processo === false,
      {atualizado:true,evidencia:emp.evidencia,lacuna:false},
      {atualizado:insercao.atualizado,evidencia:estado.fatos.processo.evidencia,lacuna:estado.lacunas.processo});

    var validacaoEstrutural = validarEstadoInvestigacaoV64_(estado);
    registrar(emp,'03_INTEGRIDADE','Estado parcial passa validação estrutural',
      validacaoEstrutural.valido === true, true, validacaoEstrutural.valido, JSON.stringify(validacaoEstrutural.erros || []));

    var serializado = serializarEstadoInvestigacaoV64_(estado);
    var recuperado = desserializarEstadoInvestigacaoV64_(serializado);
    registrar(emp,'04_SERIALIZACAO','Serialização round-trip preserva fato e evidência',
      !!recuperado && recuperado.fatos.processo.valor === emp.valor && recuperado.fatos.processo.evidencia === emp.evidencia,
      {valor:emp.valor,evidencia:emp.evidencia},
      recuperado ? {valor:recuperado.fatos.processo.valor,evidencia:recuperado.fatos.processo.evidencia} : null);

    var envelope = inserirEstadoInvestigacaoV64EmInformacoes_([{tipo:'NOTA_LEGADA',texto:'preservar-'+emp.id}],estado);
    var extraido = extrairEstadoInvestigacaoV64DeInformacoes_(envelope);
    registrar(emp,'05_COMPATIBILIDADE','Envelope V6.4 preserva item legado e permite extração',
      envelope.length === 2 && envelope[0].tipo === 'NOTA_LEGADA' && !!extraido && extraido.fatos.processo.valor === emp.valor,
      {itens:2,legadoPreservado:true,estadoRecuperado:true},
      {itens:envelope.length,primeiroTipo:envelope[0] && envelope[0].tipo,estadoRecuperado:!!extraido});

    var estimativa = atualizarFatoV64_(estado,'escala','aproximadamente 40 unidades por dia','Estimativa inicial do gestor',CERTEZA_V64.ESTIMADO,'stress-'+emp.id);
    registrar(emp,'06_INCERTEZA','Estimativa não fecha a lacuna',
      estimativa.fato.certeza === CERTEZA_V64.ESTIMADO && estado.lacunas.escala === true,
      {certeza:'ESTIMADO',lacuna:true},
      {certeza:estimativa.fato.certeza,lacuna:estado.lacunas.escala});

    var gateInicial = podeConcluirDiagnosticoV64_(estado);
    registrar(emp,'07_GATE','Gate bloqueia conclusão com dimensões essenciais em aberto',
      gateInicial.pode === false, false, gateInicial.pode,
      JSON.stringify({motivos:gateInicial.motivos || gateInicial.dimensoesNaoConfirmadas || gateInicial}));

    var conflito = atualizarFatoV64_(estado,'processo','Processo alternativo contraditório','Uma segunda fonte afirma outro processo',CERTEZA_V64.CONFIRMADO,'stress-conflict-'+emp.id);
    registrar(emp,'08_CONFLITO','Contradição não sobrescreve o fato original e abre conflito',
      conflito.conflito === true && estado.fatos.processo.valor === emp.valor && estado.lacunas.processo === true && (estado.conflitos || []).length > 0,
      {valorOriginalPreservado:emp.valor,conflito:true,lacuna:true},
      {valor:estado.fatos.processo.valor,conflito:conflito.conflito,lacuna:estado.lacunas.processo,conflitos:(estado.conflitos || []).length});

    var perguntaClassificada = classificarDimensaoPerguntaV64_(emp.pergunta, estado);
    registrar(emp,'09_CLASSIFICACAO','Pergunta do cenário é classificada na dimensão esperada',
      perguntaClassificada === emp.dimensao, emp.dimensao, perguntaClassificada, emp.pergunta);

    var candidato = {
      proximaPergunta: emp.pergunta,
      dimensaoAlvo: emp.dimensao,
      justificativa:'Stress test '+emp.id+': '+emp.problema,
      lacunaQueReduz: emp.dimensao
    };
    var validacaoPergunta = validarPerguntaInvestigativaV64_(estado,candidato,function(){return {equivalente:false,indice:-1,motivo:''};});
    registrar(emp,'10_VALIDACAO_PERGUNTA','Validador aceita candidata coerente e estruturada',
      validacaoPergunta.valida === true, true, validacaoPergunta.valida,
      JSON.stringify({motivo:validacaoPergunta.motivo || '',dimensaoDetectada:validacaoPergunta.dimensaoDetectada || null,dimensaoAlvo:validacaoPergunta.dimensaoAlvo || null}));

    var candidatoIncoerente = {
      proximaPergunta: emp.pergunta,
      dimensaoAlvo: emp.dimensao === 'escala' ? 'frequencia' : 'escala',
      justificativa:'Candidata propositalmente adulterada para teste adversarial',
      lacunaQueReduz: emp.dimensao === 'escala' ? 'frequencia' : 'escala'
    };
    var rejeicao = validarPerguntaInvestigativaV64_(estado,candidatoIncoerente,function(){return {equivalente:false,indice:-1,motivo:''};});
    registrar(emp,'11_ADVERSARIAL','Validador rejeita candidata com dimensão adulterada',
      rejeicao.valida === false, false, rejeicao.valida,
      JSON.stringify({motivo:rejeicao.motivo || '',dimensaoDetectada:rejeicao.dimensaoDetectada || null,dimensaoAlvo:candidatoIncoerente.dimensaoAlvo}));

    var gateFinal = podeConcluirDiagnosticoV64_(estado);
    registrar(emp,'12_GATE_APOS_CONFLITO','Conflito aberto continua bloqueando conclusão',
      gateFinal.pode === false, false, gateFinal.pode,
      JSON.stringify({motivos:gateFinal.motivos || gateFinal.dimensoesNaoConfirmadas || gateFinal}));
  });

  var totaisPorEtapa = {};
  resultados.forEach(function(r) {
    if (!totaisPorEtapa[r.etapa]) totaisPorEtapa[r.etapa] = {total:0,aprovados:0,falhas:0};
    totaisPorEtapa[r.etapa].total++;
    if (r.passou) totaisPorEtapa[r.etapa].aprovados++;
    else totaisPorEtapa[r.etapa].falhas++;
  });
  var resumo = {
    versao:'V6.4',
    suite:'STRESS_EXTREMO_20_EMPRESAS',
    sucesso:falhas.length === 0 && resultados.length === empresas.length * 12,
    empresasPlanejadas:20,
    empresasExecutadas:empresas.length,
    etapasPorEmpresa:12,
    totalTestes:resultados.length,
    aprovados:resultados.filter(function(r){return r.passou;}).length,
    falhas:falhas.length,
    chamadasGemini:0,
    leituraPlanilhas:false,
    escritaPlanilhas:false,
    alteracaoProducao:false,
    duracaoMs:new Date().getTime()-inicio,
    totaisPorEtapa:totaisPorEtapa,
    falhasDetalhadas:falhas,
    resultadosPorEmpresa:empresas.map(function(e) {
      var itens = resultados.filter(function(r){return r.empresa===e.id;});
      return {id:e.id,setor:e.setor,problema:e.problema,total:itens.length,aprovados:itens.filter(function(r){return r.passou;}).length,falhas:itens.filter(function(r){return !r.passou;}).length};
    })
  };
  Logger.log('========== FEEDS SOLUTIONS V6.4 — STRESS EXTREMO — RESUMO ==========');
  Logger.log('[STRESS][RESUMO_FINAL] '+JSON.stringify(resumo));
  return resumo;
}
