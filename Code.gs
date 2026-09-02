/**
 * ============================================================
 * NEURO SOLUTIONS — MVP V1
 * CODE.GS
 * ============================================================
 *
 * Núcleo da aplicação.
 *
 * RESPONSABILIDADES:
 * - Entrada do Web App
 * - Roteamento público/admin
 * - Inicialização do sistema
 * - Comunicação com módulos
 *
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * DO GET
 * ------------------------------------------------------------
 *
 * Define qual página HTML será entregue.
 *
 * URLs:
 *
 * /exec
 * → área pública
 *
 * /exec?page=admin
 * → login administrativo
 *
 * /exec?page=admin&view=dashboard
 * → painel administrativo
 *
 * A segurança REAL do admin não depende da URL.
 * As funções administrativas também validam sessão no servidor.
 */
function doGet(e) {

  const params = e && e.parameter ? e.parameter : {};

  const page = params.page || 'public';

  if (page === 'admin') {

    return HtmlService
      .createTemplateFromFile('Admin')
      .evaluate()
      .setTitle(APP_NAME + ' — Administração')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  return HtmlService
    .createTemplateFromFile('Index')
    .evaluate()
    .setTitle(APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


/**
 * ------------------------------------------------------------
 * INCLUIR ARQUIVOS HTML
 * ------------------------------------------------------------
 */
function include(filename) {

  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}


/**
 * ------------------------------------------------------------
 * INICIALIZAÇÃO
 * ------------------------------------------------------------
 *
 * Executar manualmente uma vez após instalar o código.
 */
function inicializarSistema() {

  verificarEstruturaPlanilha_();

  configurarPropriedadesIniciais_();

  registrarEvento_(
    'SISTEMA_INICIALIZADO',
    '',
    '',
    'MVP V1'
  );

  return {
    sucesso: true,
    mensagem: 'Sistema inicializado com sucesso.',
    versao: APP_VERSION
  };
}


/**
 * ------------------------------------------------------------
 * VERIFICA ESTRUTURA
 * ------------------------------------------------------------
 */
function verificarEstruturaPlanilha_() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const abasObrigatorias = [
    'EMPRESAS',
    'CONVERSAS',
    'DIAGNOSTICOS',
    'DORES',
    'SOLUCOES',
    'DIAGNOSTICO_SOLUCOES',
    'LEADS',
    'FEEDBACK',
    'METRICAS',
    'CONFIG'
  ];

  const faltantes = [];

  abasObrigatorias.forEach(function(nome) {

    if (!ss.getSheetByName(nome)) {
      faltantes.push(nome);
    }

  });

  if (faltantes.length > 0) {

    throw new Error(
      'As seguintes abas não foram encontradas: ' +
      faltantes.join(', ') +
      '. Execute primeiro a função criarEstruturaMVP().'
    );
  }

  return true;
}


/**
 * ------------------------------------------------------------
 * HEALTH CHECK
 * ------------------------------------------------------------
 *
 * Função administrativa para verificar se a infraestrutura
 * básica está funcionando.
 */
function verificarSistema() {

  verificarEstruturaPlanilha_();

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  return {
    sucesso: true,
    sistema: APP_NAME,
    versao: APP_VERSION,
    planilha: ss.getName(),
    timestamp: new Date().toISOString()
  };
}


/**
 * ------------------------------------------------------------
 * TESTE DO NÚCLEO
 * ------------------------------------------------------------
 *
 * Executar manualmente depois da instalação.
 */
function testeNucleo() {

  verificarEstruturaPlanilha_();

  const empresa = salvarEmpresa_({
    nome_empresa: 'EMPRESA TESTE MVP',
    segmento: 'Teste',
    porte: 'Pequeno',
    nome_contato: 'Contato Teste',
    whatsapp: '5599999999999',
    email: 'teste@example.com',
    cidade: 'Teste'
  });

  const conversaId = gerarId_('CONV');

  salvarMensagem_({
    mensagem_id: gerarId_('MSG'),
    conversa_id: conversaId,
    empresa_id: empresa.empresa_id,
    remetente: 'usuario',
    mensagem: 'Mensagem de teste do núcleo.',
    tipo: 'teste',
    ordem: 1
  });

  const diagnostico = criarDiagnostico_({
    empresa_id: empresa.empresa_id,
    conversa_id: conversaId
  });

  registrarEvento_(
    'TESTE_NUCLEO',
    conversaId,
    empresa.empresa_id,
    diagnostico.diagnostico_id
  );

  return {
    sucesso: true,
    empresa: empresa,
    conversa_id: conversaId,
    diagnostico: diagnostico
  };
}
