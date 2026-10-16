/**
 * FEEDS SOLUTIONS — TESTES DE QUALIDADE DA INVESTIGAÇÃO CONVERSACIONAL V6.3
 *
 * Arquivo: TesteQualidadeInvestigacaoConversacionalV63.gs
 * Execução: TESTAR_QUALIDADE_INVESTIGACAO_CONVERSACIONAL_V63()
 *
 * Testes determinísticos; não chamam Gemini nem alteram dados de produção.
 * O objetivo é verificar continuidade, memória da pergunta pendente e gate
 * mínimo de conclusão. O diálogo real ainda precisa de validação no Apps Script.
 */

function TESTAR_QUALIDADE_INVESTIGACAO_CONVERSACIONAL_V63() {
  var resultados = [];
  var falhas = 0;

  function verificar(nome, condicao, detalhe) {
    var passou = condicao === true;
    resultados.push({
      teste: nome,
      resultado: passou ? 'PASSOU' : 'FALHOU',
      detalhe: detalhe || ''
    });
    Logger.log((passou ? '✅ PASSOU: ' : '❌ FALHOU: ') + nome +
      (detalhe ? ' | ' + detalhe : ''));
    if (!passou) falhas++;
  }

  var perguntaVolume = 'Quantas divulgações vocês costumam fazer por semana?';

  var diaria = ajustarContinuidadeDiagnostico_({
    volume: '',
    frequencia: '',
    respondeu_pergunta_pendente: false,
    informacao_faltante: perguntaVolume,
    proxima_pergunta: perguntaVolume
  }, perguntaVolume, 'diariamente');

  verificar('diariamente é reconhecido como frequência',
    diaria.respondeu_pergunta_pendente === true &&
    normalizarTextoDiagnostico_(diaria.frequencia) === 'diaria',
    JSON.stringify(diaria));

  verificar('diariamente gera pergunta de volume por dia sem repetir a original',
    diaria.proxima_pergunta !== perguntaVolume &&
    normalizarTextoDiagnostico_(diaria.proxima_pergunta).indexOf('quantas divulgacoes voces fazem por dia') !== -1,
    diaria.proxima_pergunta);

  var eventual = ajustarContinuidadeDiagnostico_({
    volume: '',
    frequencia: '',
    respondeu_pergunta_pendente: false,
    informacao_faltante: perguntaVolume,
    proxima_pergunta: perguntaVolume
  }, perguntaVolume, 'eventualmente');

  verificar('eventualmente é reconhecido sem loop',
    eventual.respondeu_pergunta_pendente === true &&
    normalizarTextoDiagnostico_(eventual.frequencia) === 'ocasional' &&
    eventual.proxima_pergunta !== perguntaVolume,
    JSON.stringify(eventual));

  var numerica = ajustarContinuidadeDiagnostico_({
    volume: '',
    frequencia: '',
    respondeu_pergunta_pendente: false,
    informacao_faltante: perguntaVolume,
    proxima_pergunta: perguntaVolume
  }, perguntaVolume, '50 divulgações por semana');

  verificar('quantidade numérica continua sendo volume',
    numerica.respondeu_pergunta_pendente === true &&
    /50/.test(numerica.volume || ''),
    JSON.stringify(numerica));

  var historico = [
    { remetente: 'SISTEMA', tipo: 'RESPOSTA', mensagem: 'Sua mensagem foi salva.' },
    { remetente: 'SISTEMA', tipo: 'PERGUNTA_IA', mensagem: 'Em qual etapa os erros aparecem?' }
  ];
  verificar('pergunta pendente ignora mensagem declarativa do sistema',
    obterPerguntaPendenteDiagnostico_(historico) === 'Em qual etapa os erros aparecem?',
    obterPerguntaPendenteDiagnostico_(historico));

  var semPergunta = [
    { remetente: 'SISTEMA', tipo: 'RESPOSTA', mensagem: 'Sua mensagem foi salva.' }
  ];
  verificar('mensagem declarativa não vira pergunta pendente',
    obterPerguntaPendenteDiagnostico_(semPergunta) === '',
    obterPerguntaPendenteDiagnostico_(semPergunta));

  var estadoIncompleto = determinarEstadoDiagnostico_({
    processo_nome: 'Lançamento manual de pedidos',
    dor_principal: 'Erros de digitação',
    frequencia: 'Diária',
    impacto_nivel: 'Duas horas por dia',
    objetivo: ''
  }, { informacao_faltante: 'objetivo do empresário' });

  verificar('diagnóstico não fica pronto sem objetivo',
    estadoIncompleto === DIAGNOSTICO_ESTADOS.INVESTIGACAO,
    String(estadoIncompleto));

  var entradaPrompt = construirEntradaDiagnosticoIA_('Quero reduzir retrabalho', {
    diagnostico: { processo: 'Lançamento de pedidos', dor_principal: 'Retrabalho' },
    dores: [],
    medidas: [],
    respostas_negativas: [],
    historico: [],
    pergunta_pendente: '',
    etapas_processo: []
  });

  verificar('prompt exige investigação adaptativa e evidências',
    entradaPrompt.indexOf('Não siga um checklist rígido') !== -1 &&
    entradaPrompt.indexOf('causa conhecida versus hipótese') !== -1 &&
    entradaPrompt.indexOf('como será validado o sucesso') !== -1,
    'verifica regras de profundidade no prompt');

  Logger.log('============================================================');
  Logger.log('RESULTADO: ' + (resultados.length - falhas) + '/' + resultados.length +
    ' aprovados; falhas=' + falhas);
  Logger.log('============================================================');

  return {
    sucesso: falhas === 0,
    total: resultados.length,
    aprovados: resultados.length - falhas,
    falhas: falhas,
    resultados: resultados
  };
}
