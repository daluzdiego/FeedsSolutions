/**
 * FEEDS SOLUTIONS V6.4 — E2E CONTROLADO DO CONTROLADOR REAL
 *
 * Executa uma única mensagem sintética pelo caminho:
 * iniciarDiagnostico -> processarMensagemDiagnostico -> motor V6.4 ->
 * persistência da investigação -> retorno do controlador.
 *
 * IMPORTANTE:
 * - Faz UMA rodada real com Gemini (consome quota).
 * - Cria registros de teste nas planilhas EMPRESAS/DIAGNOSTICOS/MENSAGENS/
 *   INVESTIGACOES; não apaga dados e não limpa os registros ao terminar.
 * - Ativa a chave V6.4 apenas temporariamente durante esta execução e restaura
 *   seu valor anterior em finally. Não altera o valor salvo no código.
 * - Execute somente após sincronizar os arquivos V6.4 atuais no Apps Script.
 */
function TESTAR_E2E_CONTROLADO_V64() {
  var inicioMs = new Date().getTime();
  var verificacoes = [];
  var inicio = null;
  var retorno = null;
  var chamadaV64Observada = false;
  var motorV64Sucesso = false;
  var motorV64Detalhe = '';
  var chaveAnterior = FEEDS_MOTOR_INVESTIGACAO_V64_ATIVO;
  var funcaoMotorOriginal = processarTurnoPersistidoV64_;
  var erroExecucao = '';

  function verificar(nome, passou, detalhe) {
    verificacoes.push({ teste: nome, passou: !!passou, detalhe: detalhe || '' });
  }

  Logger.log('========== FEEDS SOLUTIONS V6.4 — E2E CONTROLADO — INÍCIO ==========');
  Logger.log('[E2E][AMBIENTE] ' + JSON.stringify({
    teste: 'TESTAR_E2E_CONTROLADO_V64',
    chamadasGeminiMaximas: 1,
    gravaRegistrosTeste: true,
    apagaDados: false,
    chaveAnterior: chaveAnterior
  }));

  try {
    if (chaveAnterior !== false) {
      throw new Error('PRECONDICAO_FALHOU: a chave V6.4 deveria estar desligada antes do teste.');
    }
    if (typeof iniciarDiagnostico !== 'function' ||
        typeof processarMensagemDiagnostico !== 'function' ||
        typeof processarTurnoPersistidoV64_ !== 'function' ||
        typeof buscarInvestigacaoV62_ !== 'function' ||
        typeof carregarEstadoInvestigacaoV64_ !== 'function') {
      throw new Error('DEPENDENCIA_E2E_AUSENTE: sincronize os arquivos atuais do projeto.');
    }

    var identificador = Utilities.getUuid().replace(/-/g, '').substring(0, 10);
    inicio = iniciarDiagnostico({
      nome: 'TESTE E2E V64 ' + identificador,
      nome_empresa: 'TESTE E2E V64 ' + identificador,
      nome_contato: 'Teste automatizado V64',
      celular: '5190000' + identificador.substring(0, 4),
      whatsapp: '5190000' + identificador.substring(0, 4),
      email: 'e2e-v64-' + identificador + '@example.invalid',
      segmento: 'Teste automatizado',
      porte: 'Pequeno',
      cidade: 'Ambiente de teste'
    });
    verificar('iniciarDiagnostico criou identificadores', !!(inicio && inicio.sucesso &&
      inicio.empresa_id && inicio.conversa_id && inicio.diagnostico_id),
      inicio ? JSON.stringify({ sucesso: inicio.sucesso, empresa_id: inicio.empresa_id,
        conversa_id: inicio.conversa_id, diagnostico_id: inicio.diagnostico_id }) : 'sem retorno');

    if (!inicio || !inicio.sucesso || !inicio.empresa_id || !inicio.conversa_id || !inicio.diagnostico_id) {
      throw new Error('NAO_FOI_POSSIVEL_INICIAR_DIAGNOSTICO_DE_TESTE');
    }

    // Instrumentação local: comprova que o controlador realmente chamou o adaptador V6.4.
    processarTurnoPersistidoV64_ = function(diagnostico, contexto, mensagem) {
      chamadaV64Observada = true;
      Logger.log('[E2E][V64_CHAMADO] ' + JSON.stringify({
        diagnostico_id: diagnostico && diagnostico.diagnostico_id,
        mensagemCaracteres: String(mensagem || '').length
      }));
      var resultadoMotor = funcaoMotorOriginal(diagnostico, contexto, mensagem);
      motorV64Sucesso = !!(resultadoMotor && resultadoMotor.resultado && resultadoMotor.resultado.sucesso === true);
      motorV64Detalhe = JSON.stringify({
        sucesso: resultadoMotor && resultadoMotor.resultado && resultadoMotor.resultado.sucesso,
        motivo: resultadoMotor && resultadoMotor.resultado && resultadoMotor.resultado.motivo,
        pergunta: resultadoMotor && resultadoMotor.resultado && resultadoMotor.resultado.proxima_pergunta,
        persistencia: resultadoMotor && resultadoMotor.persistencia
      }).slice(0, 700);
      Logger.log('[E2E][RETORNO_MOTOR] ' + motorV64Detalhe);
      return resultadoMotor;
    };

    FEEDS_MOTOR_INVESTIGACAO_V64_ATIVO = true;
    Logger.log('[E2E][ATIVACAO_TEMPORARIA] chave ligada somente durante esta execução.');

    retorno = processarMensagemDiagnostico({
      empresa_id: inicio.empresa_id,
      conversa_id: inicio.conversa_id,
      mensagem: 'Recebemos cerca de 80 pedidos por dia pelo WhatsApp. Uma pessoa lança os dados manualmente em uma planilha e depois conferimos os registros; isso gera retrabalho.'
    });

    verificar('controlador retornou resposta utilizável', !!(retorno && retorno.sucesso === true &&
      retorno.recuperacao_pendente !== true && String(retorno.resposta || '').trim().length > 0),
      JSON.stringify({
        sucesso: retorno && retorno.sucesso,
        recuperacao_pendente: retorno && retorno.recuperacao_pendente,
        estado: retorno && retorno.estado,
        resposta: String(retorno && retorno.resposta || '').slice(0, 400)
      }));

    verificar('controlador realmente chamou o motor V6.4', chamadaV64Observada,
      chamadaV64Observada ? 'processarTurnoPersistidoV64_ foi chamado' : 'o controlador não chamou o motor V6.4');

    verificar('motor V6.4 concluiu o turno sem fallback por falha', motorV64Sucesso,
      motorV64Detalhe || 'o motor não retornou resultado de sucesso');

    var investigacaoSalva = buscarInvestigacaoV62_({ diagnostico_id: inicio.diagnostico_id });
    verificar('investigação criada e recuperável pela persistência', !!investigacaoSalva,
      investigacaoSalva ? JSON.stringify({
        investigacao_id: investigacaoSalva.investigacao_id,
        diagnostico_id: investigacaoSalva.diagnostico_id
      }) : 'investigação não encontrada');

    var estadoSalvo = investigacaoSalva ? carregarEstadoInvestigacaoV64_(investigacaoSalva) : null;
    verificar('estado V6.4 persistido com histórico do turno', !!(estadoSalvo &&
      Array.isArray(estadoSalvo.historico) && estadoSalvo.historico.some(function(turno) {
        return turno && turno.papel === 'EMPRESARIO' &&
          String(turno.texto || '').indexOf('80 pedidos por dia') !== -1;
      })),
      estadoSalvo ? JSON.stringify({
        historicoTurnos: Array.isArray(estadoSalvo.historico) ? estadoSalvo.historico.length : null,
        dimensoesComFato: estadoSalvo.fatos ? Object.keys(estadoSalvo.fatos).filter(function(k) {
          return estadoSalvo.fatos[k] && estadoSalvo.fatos[k].valor;
        }) : []
      }) : 'estado V6.4 não recuperado');

  } catch (e) {
    erroExecucao = String(e && e.stack || e);
    Logger.log('[E2E][ERRO] ' + erroExecucao);
    verificar('execução sem exceção fatal', false, erroExecucao.slice(0, 1200));
  } finally {
    FEEDS_MOTOR_INVESTIGACAO_V64_ATIVO = chaveAnterior;
    processarTurnoPersistidoV64_ = funcaoMotorOriginal;
    Logger.log('[E2E][RESTAURACAO] ' + JSON.stringify({
      chaveRestaurada: FEEDS_MOTOR_INVESTIGACAO_V64_ATIVO,
      chaveOriginal: chaveAnterior,
      wrapperRestaurado: processarTurnoPersistidoV64_ === funcaoMotorOriginal
    }));
  }

  var aprovados = verificacoes.filter(function(v) { return v.passou; }).length;
  var resumo = {
    versao: 'V6.4',
    suite: 'E2E_CONTROLADO_CONTROLADOR_REAL',
    sucesso: verificacoes.length === 6 && aprovados === 6 &&
      FEEDS_MOTOR_INVESTIGACAO_V64_ATIVO === false && !erroExecucao,
    total: verificacoes.length,
    aprovados: aprovados,
    falhas: verificacoes.length - aprovados,
    motorV64RealmenteChamado: chamadaV64Observada,
    motorV64Sucesso: motorV64Sucesso,
    motorV64Detalhe: motorV64Detalhe,
    chaveRestauradaDesligada: FEEDS_MOTOR_INVESTIGACAO_V64_ATIVO === false,
    duracaoMs: new Date().getTime() - inicioMs,
    registrosTesteMantidos: !!inicio,
    erro: erroExecucao.slice(0, 1200),
    resultados: verificacoes
  };
  Logger.log('========== FEEDS SOLUTIONS V6.4 — E2E CONTROLADO — RESUMO ==========');
  Logger.log('[E2E][RESUMO_FINAL] ' + JSON.stringify(resumo));
  return resumo;
}
