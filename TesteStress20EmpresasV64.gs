/**
 * FEEDS SOLUTIONS V6.4 — STRESS TEST EXTREMO DE 40 EMPRESAS
 *
 * Executar: TESTAR_STRESS_40_EMPRESAS_V64()
 *
 * Escopo:
 * - 40 empresas fictícias, 40 contextos operacionais distintos e de alta complexidade.
 * - Exercita o estado real, evidências, certeza, conflitos, lacunas, classificador,
 *   gate de conclusão, validação estrutural, serialização e envelope legado.
 * - Não chama Gemini, não acessa planilhas, não grava dados, não altera produção.
 * - As 20 empresas são fixtures sintéticas; não representam clientes reais.
 *
 * IMPORTANTE:
 * Este é um teste de estresse determinístico do núcleo. Não substitui o teste Gemini
 * real nem uma revisão de perguntas aceitas em conversas reais.
 */
function TESTAR_STRESS_40_EMPRESAS_V64() {
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
    { id:'E20', setor:'Gestora de condomínios', problema:'inadimplência, ocorrências, fornecedores e aprovação de despesas', valor:'Solicitações de moradores encaminhadas por e-mail e aplicativo', evidencia:'As solicitações de moradores chegam por e-mail e aplicativo.', pergunta:'Como será medido que o tempo de resolução das solicitações melhorou?', dimensao:'aceitacao' },
    {id:'E21',setor:'Usina de reciclagem',problema:'pesagem, composição de resíduos, contaminação e repasses por fornecedor',valor:'Pesagens são anotadas em fichas e digitadas no fechamento',evidencia:'As pesagens são anotadas em fichas e digitadas no fechamento.',pergunta:'Como são verificadas as divergências entre peso recebido e peso faturado?',dimensao:'processo'},
    {id:'E22',setor:'Rede de escolas',problema:'matrículas, frequência, autorizações e sincronização entre unidades',valor:'Secretarias conciliam matrículas em planilhas locais',evidencia:'As secretarias conciliam matrículas em planilhas locais.',pergunta:'Qual etapa gera mais retrabalho ao transferir um aluno entre unidades?',dimensao:'dor_causa'},
    {id:'E23',setor:'Distribuidora de bebidas',problema:'vasilhames retornáveis, crédito de clientes, rotas e sazonalidade',valor:'Vasilhames retornáveis são conferidos manualmente na entrega',evidencia:'Os vasilhames retornáveis são conferidos manualmente na entrega.',pergunta:'Quantos vasilhames retornáveis são movimentados por dia?',dimensao:'escala'},
    {id:'E24',setor:'Operador portuário',problema:'janelas de atracação, documentação, equipamentos e multas',valor:'Janelas operacionais são atualizadas em quadros e mensagens',evidencia:'As janelas operacionais são atualizadas em quadros e mensagens.',pergunta:'Em quais períodos se concentram os atrasos de atracação?',dimensao:'frequencia'},
    {id:'E25',setor:'Rede de farmácias',problema:'receitas, substituições autorizadas, estoque e auditoria',valor:'Solicitações de reposição são conferidas em relatórios separados',evidencia:'As solicitações de reposição são conferidas em relatórios separados.',pergunta:'Quanto tempo a equipe perde por semana conciliando reposições?',dimensao:'impacto'},
    {id:'E26',setor:'Fábrica de móveis',problema:'cortes, desperdício, medidas customizadas e capacidade de máquinas',valor:'Ordens customizadas são redigitadas antes do corte',evidencia:'Ordens customizadas são redigitadas antes do corte.',pergunta:'Qual resultado operacional deve melhorar primeiro com a automação?',dimensao:'objetivo'},
    {id:'E27',setor:'Seguradora regional',problema:'sinistros, documentos faltantes, fraude e prazos contratuais',valor:'Documentos de sinistros são distribuídos por e-mail',evidencia:'Documentos de sinistros são distribuídos por e-mail.',pergunta:'Que exceções permitem encaminhar um sinistro para análise especial?',dimensao:'excecoes'},
    {id:'E28',setor:'Clínica veterinária',problema:'prontuários, exames, medicação, estoque e emergência',valor:'Equipe registra procedimentos em sistemas diferentes',evidencia:'A equipe registra procedimentos em sistemas diferentes.',pergunta:'Quais limitações de integração e privacidade precisamos respeitar?',dimensao:'restricoes'},
    {id:'E29',setor:'Indústria química',problema:'lotes, fichas de segurança, dosagem e bloqueios de qualidade',valor:'Resultados de inspeção são transcritos para liberar lotes',evidencia:'Os resultados de inspeção são transcritos para liberar lotes.',pergunta:'Qual critério verificável autoriza considerar a liberação automatizada segura?',dimensao:'aceitacao'},
    {id:'E30',setor:'Rede de lavanderias',problema:'identificação de peças, manchas, perdas e cobrança por contrato',valor:'Volumes recebidos são separados por cliente com etiquetas manuais',evidencia:'Os volumes recebidos são separados por cliente com etiquetas manuais.',pergunta:'Descreva o caminho de uma peça desde o recebimento até a expedição.',dimensao:'processo'},
    {id:'E31',setor:'Transportadora escolar',problema:'rotas, autorizações, presença, substituição de veículos e segurança',valor:'Ausências e substituições de veículos são tratadas por telefone',evidencia:'Ausências e substituições de veículos são tratadas por telefone.',pergunta:'Qual é a principal causa dos atrasos quando um veículo é substituído?',dimensao:'dor_causa'},
    {id:'E32',setor:'Rede de hotéis',problema:'overbooking, tarifas, manutenção e reservas multicanal',valor:'Reservas de canais diferentes são conciliadas em planilha',evidencia:'Reservas de canais diferentes são conciliadas em planilha.',pergunta:'Quantas reservas por canal precisam ser conciliadas diariamente?',dimensao:'escala'},
    {id:'E33',setor:'Exportadora de grãos',problema:'documentos aduaneiros, câmbio, qualidade e datas de embarque',valor:'Datas de documentação são controladas em calendários separados',evidencia:'As datas de documentação são controladas em calendários separados.',pergunta:'Em quais épocas do embarque as pendências documentais se acumulam?',dimensao:'frequencia'},
    {id:'E34',setor:'Laboratório industrial',problema:'calibração, certificados, instrumentos vencidos e auditorias',valor:'Certificados de calibração são localizados manualmente',evidencia:'Os certificados de calibração são localizados manualmente.',pergunta:'Qual é o impacto de localizar um certificado vencido após a auditoria?',dimensao:'impacto'},
    {id:'E35',setor:'Empresa de eventos',problema:'mudanças de escopo, fornecedores, montagem e pagamentos',valor:'Alterações de escopo são aprovadas por mensagens dispersas',evidencia:'As alterações de escopo são aprovadas por mensagens dispersas.',pergunta:'Qual resultado deve ser alcançado para reduzir mudanças não autorizadas?',dimensao:'objetivo'},
    {id:'E36',setor:'Rede de postos de combustível',problema:'tanques, aferição, perdas, turnos e conciliação fiscal',valor:'Leituras de tanques são comparadas manualmente ao fechamento',evidencia:'As leituras de tanques são comparadas manualmente ao fechamento.',pergunta:'Em que situações uma divergência de estoque exige tratamento excepcional?',dimensao:'excecoes'},
    {id:'E37',setor:'Empresa de telecomunicações',problema:'ordens de campo, sinal, materiais, SLA e terceirizadas',valor:'Ordens de campo são redistribuídas manualmente entre equipes',evidencia:'As ordens de campo são redistribuídas manualmente entre equipes.',pergunta:'Quais limites de acesso, segurança e integração se aplicam às ordens de campo?',dimensao:'restricoes'},
    {id:'E38',setor:'Cooperativa de saúde',problema:'autorizações, rede credenciada, glosas e reembolsos',valor:'Pedidos de autorização são conferidos em filas separadas',evidencia:'Os pedidos de autorização são conferidos em filas separadas.',pergunta:'Que indicador demonstrará a redução de glosas após a mudança?',dimensao:'aceitacao'},
    {id:'E39',setor:'Fábrica de autopeças',problema:'rastreabilidade serial, defeitos, recall e fornecedores críticos',valor:'Lotes e números de série são conciliados em arquivos diferentes',evidencia:'Lotes e números de série são conciliados em arquivos diferentes.',pergunta:'Como o lote é rastreado desde o recebimento até o envio ao cliente?',dimensao:'processo'},
    {id:'E40',setor:'Empresa de saneamento',problema:'vazamentos, ordens de reparo, peças, equipes e fiscalização',valor:'Ocorrências são priorizadas manualmente por região',evidencia:'As ocorrências são priorizadas manualmente por região.',pergunta:'Qual é a causa mais frequente dos reparos que precisam ser refeitos?',dimensao:'dor_causa'}
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

    // Contexto isolado para validar pergunta: todas as dimensões precedentes são
    // preenchidas de forma sintética, deixando aberta a dimensão que a pergunta mira.
    // Isso evita confundir rejeição por pré-requisito com rejeição por incoerência.
    var estadoPergunta = criarEstadoInvestigacaoVazioV64_();
    Object.keys(DIMENSOES_V64).forEach(function(k) {
      var d = DIMENSOES_V64[k];
      if (d === emp.dimensao) return;
      atualizarFatoV64_(estadoPergunta,d,'Fato sintético '+d+' para '+emp.id,
        'Evidência sintética registrada para '+d+' na empresa '+emp.id,
        CERTEZA_V64.CONFIRMADO,'fixture-'+emp.id);
    });
    var candidato = {
      proximaPergunta: emp.pergunta,
      dimensaoAlvo: emp.dimensao,
      justificativa:'Stress test '+emp.id+': '+emp.problema,
      lacunaQueReduz: emp.dimensao
    };
    var validacaoPergunta = validarPerguntaInvestigativaV64_(estadoPergunta,candidato,function(){return {equivalente:false,indice:-1,motivo:''};});
    registrar(emp,'10_VALIDACAO_PERGUNTA','Validador aceita candidata coerente e estruturada',
      validacaoPergunta.valida === true, true, validacaoPergunta.valida,
      JSON.stringify({motivo:validacaoPergunta.motivo || '',dimensaoDetectada:validacaoPergunta.dimensaoDetectada || null,dimensaoAlvo:validacaoPergunta.dimensaoAlvo || null}));

    var dimensaoErrada = emp.dimensao === 'escala' ? 'frequencia' : 'escala';
    var candidatoIncoerente = {
      proximaPergunta: emp.pergunta,
      dimensaoAlvo: dimensaoErrada,
      justificativa:'Candidata propositalmente adulterada para teste adversarial',
      lacunaQueReduz: dimensaoErrada
    };
    var estadoAdversarial = criarEstadoInvestigacaoVazioV64_();
    Object.keys(DIMENSOES_V64).forEach(function(k) {
      var d = DIMENSOES_V64[k];
      if (d === emp.dimensao || d === dimensaoErrada) return;
      atualizarFatoV64_(estadoAdversarial,d,'Fato sintético '+d+' para '+emp.id,
        'Evidência sintética registrada para '+d+' na empresa '+emp.id,
        CERTEZA_V64.CONFIRMADO,'fixture-adversarial-'+emp.id);
    });
    var rejeicao = validarPerguntaInvestigativaV64_(estadoAdversarial,candidatoIncoerente,function(){return {equivalente:false,indice:-1,motivo:''};});
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
    suite:'STRESS_EXTREMO_40_EMPRESAS',
    sucesso:falhas.length === 0 && resultados.length === empresas.length * 12,
    empresasPlanejadas:40,
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
