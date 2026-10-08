/**
 * ============================================================
 * FEEDS SOLUTIONS — ROBUSTEZ OPERACIONAL V6.3
 * ============================================================
 *
 * Etapa 13 — valida o comportamento do sistema quando uma
 * dependência ou uma camada intermediária falha.
 *
 * Estes testes não dependem do Gemini real e não consomem quota.
 * Quando necessário, a Ponte V6.3 é temporariamente substituída
 * por um stub e restaurada imediatamente após o cenário.
 *
 * Objetivo:
 * - não derrubar o fluxo principal;
 * - preservar a resposta legada;
 * - preservar IDs;
 * - distinguir indisponibilidade de reprovação;
 * - não ativar a V6.3 em contexto inválido;
 * - aceitar resposta V6.3 somente quando completa e segura.
 *
 * ============================================================
 */

function TESTAR_ROBUSTEZ_OPERACIONAL_V63() {
  Logger.log('============================================================');
  Logger.log('INÍCIO — TESTAR_ROBUSTEZ_OPERACIONAL_V63');
  Logger.log('============================================================');

  var aprovados = 0;
  var total = 30;
  var resultados = [];

  function registrar(numero, descricao, condicao) {
    if (condicao) {
      aprovados++;
      resultados.push(true);
      Logger.log('✅ TESTE ' + numero + '/' + total + ' — ' + descricao);
    } else {
      resultados.push(false);
      Logger.log('❌ TESTE ' + numero + '/' + total + ' — ' + descricao);
    }
  }

  function fluxoBase(overrides) {
    overrides = overrides || {};
    var base = {
      empresa_id: 'EMP-ROBUSTEZ-V63',
      conversa_id: 'CONV-ROBUSTEZ-V63',
      diagnostico_id: 'DIA-ROBUSTEZ-V63',
      resposta: 'Resposta legada preservada.',
      triagem: {
        classificacao: 'COMPATIVEL'
      },
      investigacao: {
        investigacao_id: 'INV-ROBUSTEZ-V63',
        estado: 'PRONTA_PARA_SOLUCAO'
      }
    };

    Object.keys(overrides).forEach(function(chave) {
      base[chave] = overrides[chave];
    });

    return base;
  }

  function ponteComportamento(temp, fn) {
    var original = executarPonteV63_;
    try {
      executarPonteV63_ = fn;
      return temp();
    } finally {
      executarPonteV63_ = original;
    }
  }

  // ----------------------------------------------------------
  // Elegibilidade
  // ----------------------------------------------------------

  var e = podeAtivarV63NoFluxoPrincipal_(
    fluxoBase()
  );
  registrar(1, 'fluxo compatível e investigação pronta autoriza V6.3',
    e.ativar === true && e.motivo === 'V63_ATIVADA');

  e = podeAtivarV63NoFluxoPrincipal_(
    fluxoBase({ triagem: { classificacao: 'INCOMPATIVEL' } })
  );
  registrar(2, 'triagem incompatível bloqueia V6.3',
    e.ativar === false && e.motivo === 'TRIAGEM_NAO_COMPATIVEL');

  e = podeAtivarV63NoFluxoPrincipal_(
    fluxoBase({ investigacao: { investigacao_id: 'INV-ROBUSTEZ-V63', estado: 'EM_INVESTIGACAO' } })
  );
  registrar(3, 'investigação incompleta bloqueia V6.3',
    e.ativar === false && e.motivo === 'INVESTIGACAO_INCOMPLETA');

  e = podeAtivarV63NoFluxoPrincipal_(
    fluxoBase({ triagem: {} })
  );
  registrar(4, 'triagem ausente bloqueia V6.3',
    e.ativar === false && e.motivo === 'TRIAGEM_NAO_COMPATIVEL');

  e = podeAtivarV63NoFluxoPrincipal_(
    fluxoBase({ investigacao: {} })
  );
  registrar(5, 'investigação ausente bloqueia V6.3',
    e.ativar === false && e.motivo === 'INVESTIGACAO_INCOMPLETA');

  // ----------------------------------------------------------
  // Contexto
  // ----------------------------------------------------------

  var contexto = construirContextoIntegracaoV63_(fluxoBase());
  registrar(6, 'contexto preserva empresa_id',
    contexto.empresa_id === 'EMP-ROBUSTEZ-V63');

  registrar(7, 'contexto preserva conversa_id',
    contexto.conversa_id === 'CONV-ROBUSTEZ-V63');

  registrar(8, 'contexto preserva diagnostico_id',
    contexto.diagnostico_id === 'DIA-ROBUSTEZ-V63');

  registrar(9, 'contexto preserva investigacao_id',
    contexto.investigacao_id === 'INV-ROBUSTEZ-V63');

  registrar(10, 'fluxo oficial usa corte mínimo de reconhecimento 85',
    contexto.pontuacao_minima === 85);

  registrar(11, 'contexto completo é considerado válido',
    validarContextoIntegracaoV63_(contexto) === true);

  registrar(12, 'contexto sem empresa_id é inválido',
    validarContextoIntegracaoV63_(
      Object.assign({}, contexto, { empresa_id: '' })
    ) === false);

  registrar(13, 'contexto sem conversa_id é inválido',
    validarContextoIntegracaoV63_(
      Object.assign({}, contexto, { conversa_id: '' })
    ) === false);

  registrar(14, 'contexto sem diagnostico_id é inválido',
    validarContextoIntegracaoV63_(
      Object.assign({}, contexto, { diagnostico_id: '' })
    ) === false);

  registrar(15, 'contexto sem investigacao_id é inválido',
    validarContextoIntegracaoV63_(
      Object.assign({}, contexto, { investigacao_id: '' })
    ) === false);

  // ----------------------------------------------------------
  // Falha técnica da Ponte → fallback
  // ----------------------------------------------------------

  var resultado;

  resultado = ponteComportamento(
    function() {
      return integrarV63AoFluxoPrincipalOficial_(
        'mensagem de teste',
        fluxoBase()
      );
    },
    function() {
      throw new Error('Gemini indisponível — teste controlado.');
    }
  );

  registrar(16, 'falha técnica da Ponte não derruba o fluxo',
    resultado && resultado.sucesso === true);

  registrar(17, 'falha técnica ativa fallback legado',
    resultado && resultado.fallback === true && resultado.ativada === false);

  registrar(18, 'falha técnica recebe motivo V63_INDISPONIVEL',
    resultado && resultado.motivo === 'V63_INDISPONIVEL');

  registrar(19, 'falha técnica preserva resposta legada',
    resultado && resultado.resposta_cliente === 'Resposta legada preservada.');

  registrar(20, 'falha técnica preserva contexto com IDs',
    resultado &&
    resultado.contexto &&
    resultado.contexto.empresa_id === 'EMP-ROBUSTEZ-V63' &&
    resultado.contexto.conversa_id === 'CONV-ROBUSTEZ-V63' &&
    resultado.contexto.diagnostico_id === 'DIA-ROBUSTEZ-V63' &&
    resultado.contexto.investigacao_id === 'INV-ROBUSTEZ-V63');

  // ----------------------------------------------------------
  // Ponte disponível, mas resultado reprovado
  // ----------------------------------------------------------

  resultado = ponteComportamento(
    function() {
      return integrarV63AoFluxoPrincipalOficial_(
        'mensagem de teste',
        fluxoBase()
      );
    },
    function() {
      return {
        sucesso: false,
        motivo: 'ERRO_CONTROLADO'
      };
    }
  );

  registrar(21, 'resultado V6.3 reprovado não derruba o fluxo',
    resultado && resultado.sucesso === true);

  registrar(22, 'resultado V6.3 reprovado mantém fallback',
    resultado && resultado.fallback === true && resultado.ativada === false);

  registrar(23, 'resultado V6.3 reprovado usa motivo V63_REPROVADA',
    resultado && resultado.motivo === 'V63_REPROVADA');

  registrar(24, 'resultado V6.3 reprovado preserva resposta legada',
    resultado && resultado.resposta_cliente === 'Resposta legada preservada.');

  // ----------------------------------------------------------
  // Ponte válida
  // ----------------------------------------------------------

  resultado = ponteComportamento(
    function() {
      return integrarV63AoFluxoPrincipalOficial_(
        'mensagem de teste',
        fluxoBase()
      );
    },
    function() {
      return {
        sucesso: true,
        resposta: 'Resposta interna V6.3',
        decisao: {
          estado: 'SOLUCAO_VALIDADA'
        }
      };
    }
  );

  registrar(25, 'Ponte válida permite ativação da V6.3',
    resultado && resultado.sucesso === true && resultado.ativada === true);

  registrar(26, 'Ponte válida usa motivo V63_ATIVADA',
    resultado && resultado.motivo === 'V63_ATIVADA');

  registrar(27, 'Ponte válida não usa fallback',
    resultado && resultado.fallback === false);

  registrar(28, 'resposta V6.3 válida substitui legado',
    resultado && resultado.resposta_cliente === 'Resposta interna V6.3');

  registrar(29, 'resultado V6.3 válido permanece disponível',
    resultado && resultado.resultado_v63 &&
    resultado.resultado_v63.sucesso === true);

  registrar(30, 'IDs permanecem preservados após ativação',
    resultado &&
    resultado.contexto &&
    resultado.contexto.empresa_id === 'EMP-ROBUSTEZ-V63' &&
    resultado.contexto.conversa_id === 'CONV-ROBUSTEZ-V63' &&
    resultado.contexto.diagnostico_id === 'DIA-ROBUSTEZ-V63' &&
    resultado.contexto.investigacao_id === 'INV-ROBUSTEZ-V63');

  Logger.log('============================================================');
  Logger.log('RESULTADO FINAL — ROBUSTEZ OPERACIONAL V6.3');
  Logger.log('============================================================');
  Logger.log('APROVADOS: ' + aprovados + '/' + total);
  Logger.log('FALHAS: ' + (total - aprovados));
  Logger.log('PERCENTUAL: ' + Math.round((aprovados / total) * 100) + '%');
  Logger.log(
    aprovados === total
      ? '🏆 TESTAR_ROBUSTEZ_OPERACIONAL_V63: PASSOU'
      : '❌ TESTAR_ROBUSTEZ_OPERACIONAL_V63: FALHOU'
  );
  Logger.log('============================================================');

  return {
    aprovados: aprovados,
    falhas: total - aprovados,
    percentual: Math.round((aprovados / total) * 100),
    passou: aprovados === total,
    resultados: resultados
  };
}
