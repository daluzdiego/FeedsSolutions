# FEEDS — DESIGN SYSTEM 1.0

**Produto:** FEEDS — Tecnologia e Soluções  
**Versão:** UX/UI 1.0  
**Data:** 2026-10-09  
**Status:** ESPECIFICAÇÃO BASE — 5 TELAS-MÃE DEFINIDAS

## Princípio

O FEEDS não deve parecer formulário, chatbot genérico ou painel administrativo tradicional.

A experiência deve transmitir inteligência, confiança, tecnologia, clareza, transformação, sofisticação sem excesso e proximidade.

Mensagem central:

> **TRANSFORMAMOS PROBLEMAS EM SOLUÇÕES.**

## Regra de ouro

> **Uma tela, uma decisão.**

O motor pode ser complexo por trás; a experiência deve permanecer simples na frente.

## Jornada pública

**01 Landing → 02 Identificação → 03 Problema → 04 Conversa Inteligente → 05 Diagnóstico**

### Tela 01 — Landing

Objetivo: gerar o primeiro clique.

- Logo central em destaque.
- Headline: **TRANSFORMAMOS PROBLEMAS EM SOLUÇÕES.**
- Frase curta.
- CTA: **COMEÇAR AGORA →**
- Desktop e mobile tratados como experiências responsivas equivalentes.
- Não duplicar a logo no topo e no centro.
- Não sobrecarregar a primeira tela.

### Tela 02 — Identificação

Objetivo: saber com quem estamos falando sem criar sensação de cadastro.

Perguntas:

> **Como podemos chamar você?**

> **Qual é o nome da sua empresa?**

Somente nome + empresa nesta etapa.

CTA:

**CONTINUAR →**

A partir daqui o sistema pode personalizar a experiência com o nome da pessoa e da empresa.

### Tela 03 — Problema

Objetivo: capturar o problema inicial com mínima fricção.

Mensagem:

> **Olá, {nome}.**

> **Qual problema está acontecendo na sua empresa?**

Apoio:

> Descreva com suas palavras o que está acontecendo. Você não precisa saber exatamente qual é a solução. Nós vamos ajudar a descobrir.

Campo grande + CTA **CONTINUAR →**.

### Tela 04 — Conversa Inteligente

Objetivo: investigar e compreender.

A conversa não deve parecer WhatsApp.

Elementos:

- progresso da jornada;
- mensagem do FEEDS;
- resposta do usuário;
- indicador de processamento;
- resumo progressivo;
- campo de resposta;
- CTA de continuidade.

Indicador conceitual:

**Processo → Problema → Impacto → Objetivo**

O resumo nunca deve inventar informação.

### Tela 05 — Diagnóstico

Objetivo: mostrar que encontramos algo importante e conduzir a uma única próxima decisão.

A tela deve ser propositalmente limpa.

Estrutura:

> **DIAGNÓSTICO CONCLUÍDO**

> **Encontramos uma oportunidade, {nome}.**

Card principal:

**OPORTUNIDADE IDENTIFICADA**

- título da oportunidade/solução quando houver evidência;
- uma explicação curta;
- aderência quando disponível.

CTA principal:

**CONHECER A SOLUÇÃO →**

Ação secundária discreta:

**Voltar ao diagnóstico**

Não colocar nesta tela:

- PDF;
- proposta;
- pipeline;
- vários indicadores;
- múltiplos próximos passos;
- explicação técnica extensa;
- vários cards;
- timeline comercial.

Esses elementos pertencem às etapas seguintes.

## Identidade visual

Paleta:

| Uso | Hex |
|---|---|
| Fundo profundo | #0F172A |
| Fundo quase preto | #020617 |
| Azul primário | #2563EB |
| Ciano inteligência | #06B6D4 |
| Teal sucesso | #14B8A6 |
| Laranja oportunidade/atenção | #F97316 |
| Branco principal | #F8FAFC |
| Branco secundário | #E2E8F0 |
| Texto secundário | #94A3B8 |
| Bordas | #1E293B |

Fundos preferenciais: #020617, #0F172A e #111C2E.

Gradientes e brilhos são atmosfera, não conteúdo.

## Tipografia

Família recomendada: **Inter**.

Fallback: Arial, sans-serif.

Hierarquia forte, limpa e com pouco uso de caixa alta.

## Componentes

- bordas arredondadas;
- contraste elevado;
- pouco ruído;
- estados explícitos;
- toque confortável;
- animações rápidas e discretas.

Raios: 8px, 12px, 16px e 20–24px para hero.

## Responsividade

A interface não é um desktop comprimido.

Desktop: mais informação simultânea e áreas laterais.  
Tablet: duas colunas quando houver espaço.  
Mobile: uma coluna, cards, áreas expansíveis e ações acessíveis.

## Navegação pública

A jornada deve permitir retorno sem perder contexto enquanto a sessão estiver ativa.

## Microinterações

Usar brilho ciano/azul e transições discretas para:

- avanço de etapa;
- processamento;
- conclusão;
- descoberta de oportunidade.

Evitar partículas excessivas e animações longas.

## Acessibilidade

- contraste suficiente;
- foco visível;
- áreas de toque adequadas;
- labels claros;
- erros compreensíveis;
- teclado;
- não depender apenas de cor;
- leitura confortável no celular.

## Performance

- CSS enxuto;
- JavaScript enxuto;
- poucas chamadas Apps Script;
- carregamento progressivo;
- feedback imediato;
- animações de baixo custo.

## Regra arquitetural

A UI não altera o núcleo V6.3.

**UI → funções públicas → fluxo oficial → V6.3**

A interface consome contratos estáveis.

## Critério de aceite das 5 telas-mãe

- [ ] identidade FEEDS consistente;
- [ ] desktop validado;
- [ ] mobile validado;
- [ ] Landing funcional;
- [ ] identificação funcional;
- [ ] problema funcional;
- [ ] conversa funcional;
- [ ] diagnóstico funcional;
- [ ] nome e empresa usados de forma personalizada;
- [ ] nenhuma informação inventada pela UI;
- [ ] estados reais do motor respeitados;
- [ ] tratamento de erro;
- [ ] estados de processamento;
- [ ] acessibilidade básica;
- [ ] E2E público validado.

## DNA para as próximas telas

As futuras telas de Dashboard, Empresas, Diagnósticos, Oportunidades, Leads, Pipeline, Soluções, Aprendizado e Métricas devem herdar o mesmo DNA visual e comportamental das cinco telas-mãe.

**FEEDS deve parecer simples de usar e sofisticado de operar.**
