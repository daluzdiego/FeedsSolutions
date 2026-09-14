/**
 * ============================================================
 * NEURO SOLUTIONS — MVP V1
 * AUTH.GS
 * ============================================================
 *
 * AUTENTICAÇÃO DO ADMINISTRADOR
 *
 * IMPORTANTE:
 * - A senha NÃO fica neste arquivo.
 * - Credenciais ficam nas Script Properties.
 * - Dados administrativos só são retornados após validação
 *   da sessão no servidor.
 *
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * CONFIGURA CREDENCIAL ADMINISTRATIVA INICIAL
 * ------------------------------------------------------------
 *
 * EXECUTE MANUALMENTE UMA ÚNICA VEZ.
 *
 * IMPORTANTE:
 * Troque os valores abaixo antes de executar.
 */
function configurarAdministradorInicial() {

  const email = 'diego.daluz@redeicm.org.br';

  const senha = 'Dlk163026@';

  if (
    email === 'admin@seudominio.com' ||
    senha === 'ALTERE_ESTA_SENHA'
  ) {

    throw new Error(
      'Antes de executar, altere o e-mail e a senha dentro da função configurarAdministradorInicial().'
    );
  }

  const props = PropertiesService.getScriptProperties();

  props.setProperties({

    ADMIN_EMAIL: email,

    ADMIN_PASSWORD_HASH: gerarHashSenha_(senha)

  });

  return {
    sucesso: true,
    mensagem: 'Administrador configurado.'
  };
}


/**
 * ------------------------------------------------------------
 * LOGIN
 * ------------------------------------------------------------
 */
function loginAdmin(email, senha) {

  if (!email || !senha) {

    return {
      sucesso: false,
      mensagem: 'Informe usuário e senha.'
    };
  }

  const props = PropertiesService.getScriptProperties();

  const emailConfigurado = props.getProperty('ADMIN_EMAIL');

  const hashConfigurado = props.getProperty(
    'ADMIN_PASSWORD_HASH'
  );

  if (!emailConfigurado || !hashConfigurado) {

    return {
      sucesso: false,
      mensagem: 'Administrador ainda não configurado.'
    };
  }

  const hashInformado = gerarHashSenha_(senha);

  const emailValido =
    normalizarTexto_(email) ===
    normalizarTexto_(emailConfigurado);

  const senhaValida =
    hashInformado === hashConfigurado;

  if (!emailValido || !senhaValida) {

    registrarEvento_(
      'LOGIN_ADMIN_FALHOU',
      '',
      '',
      email
    );

    return {
      sucesso: false,
      mensagem: 'Usuário ou senha inválidos.'
    };
  }

  const token = gerarTokenSessao_();

  const agora = Date.now();

  const expiraEm =
    agora + (60 * 60 * 1000);

  const dadosSessao = {

    token: token,

    email: emailConfigurado,

    criadoEm: agora,

    expiraEm: expiraEm

  };

  CacheService
    .getScriptCache()
    .put(
      'ADMIN_SESSION_' + token,
      JSON.stringify(dadosSessao),
      3600
    );

  registrarEvento_(
    'LOGIN_ADMIN_SUCESSO',
    '',
    '',
    emailConfigurado
  );

  return {

    sucesso: true,

    token: token,

    expiraEm: expiraEm,

    email: emailConfigurado

  };
}


/**
 * ------------------------------------------------------------
 * VALIDAR SESSÃO
 * ------------------------------------------------------------
 */
function validarSessaoAdmin(token) {

  if (!token) {

    return {
      valido: false,
      mensagem: 'Sessão não informada.'
    };
  }

  const cache = CacheService.getScriptCache();

  const dados = cache.get(
    'ADMIN_SESSION_' + token
  );

  if (!dados) {

    return {
      valido: false,
      mensagem: 'Sessão expirada ou inválida.'
    };
  }

  let sessao;

  try {

    sessao = JSON.parse(dados);

  } catch (erro) {

    return {
      valido: false,
      mensagem: 'Sessão inválida.'
    };
  }

  if (
    !sessao.expiraEm ||
    Date.now() >= sessao.expiraEm
  ) {

    cache.remove(
      'ADMIN_SESSION_' + token
    );

    return {
      valido: false,
      mensagem: 'Sessão expirada.'
    };
  }

  return {

    valido: true,

    email: sessao.email,

    expiraEm: sessao.expiraEm

  };
}


/**
 * ------------------------------------------------------------
 * LOGOUT
 * ------------------------------------------------------------
 */
function logoutAdmin(token) {

  if (!token) {

    return {
      sucesso: true
    };
  }

  CacheService
    .getScriptCache()
    .remove(
      'ADMIN_SESSION_' + token
    );

  registrarEvento_(
    'LOGOUT_ADMIN',
    '',
    '',
    ''
  );

  return {
    sucesso: true
  };
}


/**
 * ------------------------------------------------------------
 * PROTEÇÃO CENTRAL
 * ------------------------------------------------------------
 *
 * Todas as funções administrativas deverão chamar esta
 * função antes de entregar dados.
 */
function exigirSessaoAdmin_(token) {

  const sessao = validarSessaoAdmin(token);

  if (!sessao.valido) {

    throw new Error(
      'ACESSO_NEGADO: ' +
      (sessao.mensagem || 'Sessão inválida.')
    );
  }

  return sessao;
}


/**
 * ------------------------------------------------------------
 * HASH DE SENHA
 * ------------------------------------------------------------
 */
function gerarHashSenha_(senha) {

  const bytes = Utilities
    .computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      senha,
      Utilities.Charset.UTF_8
    );

  return bytes
    .map(function(byte) {

      const valor = byte < 0
        ? byte + 256
        : byte;

      return ('0' + valor.toString(16))
        .slice(-2);

    })
    .join('');
}


/**
 * ------------------------------------------------------------
 * TOKEN DE SESSÃO
 * ------------------------------------------------------------
 */
function gerarTokenSessao_() {

  return Utilities
    .getUuid()
    .replace(/-/g, '') +
    Utilities
      .getUuid()
      .replace(/-/g, '');
}
