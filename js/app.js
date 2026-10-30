// ===== Utilitários =====
const $ = (s, e = document) => e.querySelector(s);
const $$ = (s, e = document) => [...e.querySelectorAll(s)];
const ler = (k, p) => { try { return JSON.parse(localStorage.getItem(k)) ?? p; } catch { return p; } };
const salvar = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const moeda = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// ===== Dados =====
const TAXA = 6;
const PRODUTOS = [
  { id: 1, nome: 'Lasagna alla Bolognese', desc: 'Massa fresca, ragù lento e bechamel.', preco: 42.9, cat: 'Massas', cor: 'verm' },
  { id: 2, nome: 'Pizza Margherita', desc: 'Tomate, mozarela de búfala e manjericão.', preco: 49.9, cat: 'Pizzas', cor: 'verde' },
  { id: 3, nome: 'Risotto ai Funghi', desc: 'Arroz arbóreo, cogumelos e parmesão.', preco: 46.9, cat: 'Risotos', cor: 'amar' },
  { id: 4, nome: 'Spaghetti al Pomodoro', desc: 'Tomate italiano, manjericão e azeite.', preco: 34.9, cat: 'Massas', cor: 'bege' },
  { id: 5, nome: 'Fettuccine Alfredo', desc: 'Manteiga, creme e parmesão.', preco: 39.9, cat: 'Massas', cor: 'escuro' },
  { id: 6, nome: 'Tiramisù', desc: 'Mascarpone, café e cacau.', preco: 24.9, cat: 'Sobremesas', cor: 'marrom' },
  { id: 7, nome: 'Pizza Calabresa', desc: 'Calabresa artesanal, cebola e orégano.', preco: 47.9, cat: 'Pizzas', cor: 'verm' },
  { id: 8, nome: 'Pizza Quattro Formaggi', desc: 'Mozarela, gorgonzola, provolone e parmesão.', preco: 54.9, cat: 'Pizzas', cor: 'amar' },
  { id: 9, nome: 'Risotto ai Gamberi', desc: 'Arroz arbóreo, camarões e limão siciliano.', preco: 58.9, cat: 'Risotos', cor: 'verde' },
  { id: 10, nome: 'Panna Cotta', desc: 'Creme de baunilha e calda de frutas vermelhas.', preco: 22.9, cat: 'Sobremesas', cor: 'bege' },
  { id: 11, nome: 'Limonata Siciliana', desc: 'Limão siciliano, gelo e hortelã.', preco: 12.9, cat: 'Bebidas', cor: 'amar' },
  { id: 12, nome: 'Vinho Tinto da Casa', desc: 'Taça de 150 ml, seco e encorpado.', preco: 19.9, cat: 'Bebidas', cor: 'marrom' }
];
const ETAPAS = ['Recebido', 'Preparando', 'A caminho', 'Entregue'];

// ===== Sessão, carrinho e tema =====
const usuario = () => ler('usuarios', []).find(u => u.email === ler('sessao', ''));
const carrinho = () => ler('carrinho', []);
const qtdTotal = () => carrinho().reduce((s, i) => s + i.qtd, 0);

function aplicarTema() {
  const t = ler('tema', 'claro');
  document.documentElement.dataset.tema = t;
  const b = $('#btnTema');
  if (b) b.textContent = t === 'claro' ? '☀ Claro' : '☾ Escuro';
}
function aviso(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}
function atualizarContador() {
  const b = $('#btnCarrinho');
  if (b) b.textContent = `Carrinho (${qtdTotal()})`;
}
function adicionar(id) {
  const c = carrinho(), item = c.find(i => i.id === id);
  item ? item.qtd++ : c.push({ id, qtd: 1 });
  salvar('carrinho', c); atualizarContador(); aviso('Adicionado ao carrinho');
}

// ===== Máscaras e campos numéricos =====
const mascaras = {
  nome: v => v.replace(/[^A-Za-zÀ-ÿ\s]/g, '').replace(/\s{2,}/g, ' '),
  num: v => v.replace(/\D/g, ''),
  cpf: v => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
  tel: v => v.replace(/\D/g, '').slice(0, 11).replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2'),
  cep: v => v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2')
};
function aplicarMascaras(raiz = document) {
  $$('[data-mascara]', raiz).forEach(i => {
    i.addEventListener('input', () => { i.value = mascaras[i.dataset.mascara](i.value); });
  });
}

// ===== Layout comum (cabeçalho, rodapé e pop-up de login) =====
function montarLayout() {
  const u = usuario(), pg = document.body.dataset.pagina;
  const link = (h, t, k) => `<a href="${h}" class="${pg === k ? 'ativo' : ''}">${t}</a>`;
  $('#topo').innerHTML = `<header class="topo">
    <a class="logo" href="index.html"><span class="espiral"></span><span><b>Nonna</b><small>TRATTORIA ITALIANA</small></span></a>
    <button class="btn menu" id="btnMenu" aria-label="Abrir menu">☰</button>
    <nav id="nav">${link('index.html', 'Início', 'home')}${link('cardapio.html', 'Cardápio', 'cardapio')}${link('carrinho.html', 'Meu pedido', 'carrinho')}${link('pedidos.html', 'Acompanhar', 'pedidos')}${u ? link('perfil.html', 'Perfil', 'perfil') : ''}</nav>
    <div class="acoes">${u
      ? `<span class="ola">Olá, ${u.nome.split(' ')[0]}</span><button class="btn out" id="btnSair">Sair</button>`
      : `<button class="btn out" id="btnEntrar">Entrar</button><a class="btn out" href="cadastro.html">Cadastrar</a>`}
      <button class="btn verm" id="btnTema"></button><a class="btn verm" href="carrinho.html" id="btnCarrinho"></a></div></header>`;
  $('#rodape').innerHTML = `<footer class="rodape"><div>
    <a class="logo" href="index.html"><span class="espiral"></span><span><b>Nonna</b><small>TRATTORIA ITALIANA</small></span></a>
    <p>Rua das Oliveiras, 120 · Centro<br>(11) 4002-8922 · Todos os dias, 18h às 23h</p></div></footer>
    <dialog id="dlgLogin"><form id="formLogin"><h2 style="margin:0;font-size:1.6rem">Entrar</h2>
      <label class="campo">E-mail<input type="email" id="loginEmail" maxlength="60" required autocomplete="email"></label>
      <label class="campo">Senha<input type="password" id="loginSenha" maxlength="20" required autocomplete="current-password"></label>
      <p class="erro" id="loginErro" role="alert"></p>
      <button class="btn verm" type="submit">Entrar</button>
      <button class="btn out" type="button" id="loginFechar">Cancelar</button>
      <p style="font-size:.9rem">Ainda não tem conta? <a href="cadastro.html">Cadastre-se</a></p></form></dialog>`;
  aplicarTema(); atualizarContador();

  $('#btnTema').onclick = () => { salvar('tema', ler('tema', 'claro') === 'claro' ? 'escuro' : 'claro'); aplicarTema(); };
  $('#btnMenu').onclick = () => $('#nav').classList.toggle('aberto');
  if ($('#btnEntrar')) $('#btnEntrar').onclick = abrirLogin;
  if ($('#btnSair')) $('#btnSair').onclick = () => { localStorage.removeItem('sessao'); location.href = 'index.html'; };
  $('#loginFechar').onclick = () => $('#dlgLogin').close();
  $('#formLogin').onsubmit = e => {
    e.preventDefault();
    const email = $('#loginEmail').value.trim().toLowerCase(), senha = $('#loginSenha').value;
    const achou = ler('usuarios', []).find(x => x.email === email && x.senha === senha);
    if (!achou) { $('#loginErro').textContent = 'E-mail ou senha incorretos.'; return; }
    salvar('sessao', email); location.reload();
  };
}
const abrirLogin = () => $('#dlgLogin').showModal();

// ===== Componentes =====
const cardHTML = p => `<article class="card"><div class="foto ${p.cor}"><i></i><span>[FOTO]</span></div>
  <div class="info"><h3>${p.nome}</h3><p>${p.desc}</p>
  <div class="rod"><b>${moeda(p.preco)}</b><button class="btn verde" data-add="${p.id}">Adicionar</button></div></div></article>`;

// ===== Início =====
function iniciarHome() {
  $('#maisPedidos').innerHTML = [1, 2, 3].map(id => cardHTML(PRODUTOS.find(p => p.id === id))).join('');
  $('#endHero').value = ler('endereco', '');
  $('#formEnd').onsubmit = e => { e.preventDefault(); salvar('endereco', $('#endHero').value.trim()); location.href = 'cardapio.html'; };
}

// ===== Cardápio (com busca e filtro) =====
function iniciarCardapio() {
  let cat = 'Todos';
  const cats = ['Todos', ...new Set(PRODUTOS.map(p => p.cat))];
  $('#chips').innerHTML = cats.map(c => `<button class="chip ${c === cat ? 'on' : ''}" data-cat="${c}">${c}</button>`).join('');
  const render = () => {
    const q = norm($('#busca').value.trim());
    const lista = PRODUTOS.filter(p => (cat === 'Todos' || p.cat === cat) && norm(p.nome + ' ' + p.desc).includes(q));
    $('#lista').innerHTML = lista.length ? lista.map(cardHTML).join('') : '<p class="vazio">Nenhum prato encontrado. Tente outro nome ou categoria.</p>';
  };
  $('#chips').onclick = e => {
    if (!e.target.dataset.cat) return;
    cat = e.target.dataset.cat;
    $$('.chip').forEach(c => c.classList.toggle('on', c.dataset.cat === cat));
    render();
  };
  $('#busca').oninput = render;
  render();
}

// ===== Carrinho / Finalizar pedido =====
function iniciarCarrinho() {
  const u = usuario();
  $('#endereco').value = ler('endereco', '') || (u ? `${u.endereco}, ${u.numero}` : '');
  if (u) $('#telefone').value = u.telefone;
  const render = () => {
    const c = carrinho();
    const itens = c.map(i => ({ ...PRODUTOS.find(p => p.id === i.id), qtd: i.qtd }));
    const sub = itens.reduce((s, i) => s + i.preco * i.qtd, 0);
    $('#resumo').innerHTML = itens.length ? itens.map(i => `<div class="linha"><span>${i.nome}</span>
      <span class="qtd"><button data-menos="${i.id}" aria-label="Diminuir">−</button>${i.qtd}<button data-mais="${i.id}" aria-label="Aumentar">+</button></span>
      <b>${moeda(i.preco * i.qtd)}</b></div>`).join('') +
      `<div class="linha"><span>Taxa de entrega</span><b>${moeda(TAXA)}</b></div>
       <div class="linha total"><span>Total</span><span>${moeda(sub + TAXA)}</span></div>`
      : '<p class="vazio">Seu carrinho está vazio. <a href="cardapio.html">Ver cardápio</a></p>';
    atualizarContador();
  };
  $('#resumo').onclick = e => {
    const c = carrinho(), d = e.target.dataset;
    const id = Number(d.mais || d.menos); if (!id) return;
    const i = c.find(x => x.id === id);
    i.qtd += d.mais ? 1 : -1;
    salvar('carrinho', c.filter(x => x.qtd > 0)); render();
  };
  $('#formPedido').onsubmit = e => {
    e.preventDefault();
    const c = carrinho();
    if (!c.length) { $('#erroPedido').textContent = 'Adicione ao menos um item ao carrinho.'; return; }
    if (!usuario()) { $('#erroPedido').textContent = 'Entre na sua conta para confirmar o pedido.'; abrirLogin(); return; }
    const itens = c.map(i => { const p = PRODUTOS.find(x => x.id === i.id); return { nome: p.nome, qtd: i.qtd, preco: p.preco }; });
    const total = itens.reduce((s, i) => s + i.preco * i.qtd, 0) + TAXA;
    const pedidos = ler('pedidos', []);
    pedidos.unshift({ id: String(Date.now()).slice(-6), email: usuario().email, itens, total, endereco: $('#endereco').value.trim(), telefone: $('#telefone').value, pagamento: $('input[name=pagamento]:checked').value, data: Date.now() });
    salvar('pedidos', pedidos); salvar('carrinho', []);
    location.href = 'pedidos.html';
  };
  render();
}

// ===== Pedidos feitos / acompanhar (com busca) =====
function iniciarPedidos() {
  const u = usuario();
  if (!u) {
    $('#pedidosArea').innerHTML = '<p class="vazio">Entre na sua conta para ver seus pedidos.<br><br><button class="btn verm" id="pedLogin">Entrar</button></p>';
    $('#pedLogin').onclick = abrirLogin; return;
  }
  const render = () => {
    const q = norm($('#buscaPedido').value.trim());
    const lista = ler('pedidos', []).filter(p => p.email === u.email && norm(p.id + ' ' + p.itens.map(i => i.nome).join(' ')).includes(q));
    $('#listaPedidos').innerHTML = lista.length ? lista.map(p => {
      const et = Math.min(3, Math.floor((Date.now() - p.data) / 60000)); // demo: avança 1 etapa por minuto
      return `<article class="pedido"><header><h3>Pedido #${p.id}</h3><span>${new Date(p.data).toLocaleString('pt-BR')}</span></header>
        <p>${p.itens.map(i => `${i.qtd}× ${i.nome}`).join(', ')}</p>
        <p><b>${moeda(p.total)}</b> · ${p.pagamento} · ${p.endereco}</p>
        <div class="prog">${ETAPAS.map((t, i) => `<span class="${i <= et ? 'ok' : ''}">${t}</span>`).join('')}</div></article>`;
    }).join('') : '<p class="vazio">Nenhum pedido encontrado. <a href="cardapio.html">Fazer um pedido</a></p>';
  };
  $('#buscaPedido').oninput = render;
  render(); setInterval(render, 15000);
}

// ===== Cadastro e perfil (mesmos campos) =====
const campo = (id, rot, attrs, larga) => `<label class="campo ${larga ? 'larga' : ''}" for="${id}">${rot}<input id="${id}" name="${id}" ${attrs}></label>`;
const camposUsuario = cadastro =>
  campo('nome', 'Nome completo', 'type="text" maxlength="60" minlength="5" required data-mascara="nome" autocomplete="name"', true) +
  campo('email', 'E-mail', 'type="email" maxlength="60" required autocomplete="email"', true) +
  campo('cpf', 'CPF', 'type="text" inputmode="numeric" maxlength="14" required pattern="\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}" data-mascara="cpf" placeholder="000.000.000-00" title="Formato 000.000.000-00"') +
  campo('telefone', 'Telefone', 'type="text" inputmode="numeric" maxlength="15" required pattern="\\(\\d{2}\\) \\d{5}-\\d{4}" data-mascara="tel" placeholder="(00) 00000-0000" title="Formato (00) 00000-0000"') +
  campo('cep', 'CEP', 'type="text" inputmode="numeric" maxlength="9" required pattern="\\d{5}-\\d{3}" data-mascara="cep" placeholder="00000-000" title="Formato 00000-000"') +
  campo('numero', 'Número', 'type="text" inputmode="numeric" maxlength="6" required data-mascara="num" placeholder="123"') +
  campo('endereco', 'Rua e complemento', 'type="text" maxlength="80" minlength="5" required', true) +
  (cadastro ? campo('senha', 'Senha (6 a 20 caracteres)', 'type="password" minlength="6" maxlength="20" required autocomplete="new-password"') +
    campo('confirma', 'Confirmar senha', 'type="password" minlength="6" maxlength="20" required autocomplete="new-password"') : '');

function iniciarUsuario() {
  const perfil = document.body.dataset.pagina === 'perfil', u = usuario(), f = $('#formUsuario');
  if (perfil && !u) {
    f.outerHTML = '<p class="vazio">Entre na sua conta para ver seus dados.<br><br><button class="btn verm" id="perLogin">Entrar</button></p>';
    $('#perLogin').onclick = abrirLogin; return;
  }
  $('.campos', f).innerHTML = camposUsuario(!perfil);
  aplicarMascaras(f);
  if (perfil) {
    Object.keys(u).forEach(k => { if (f.elements[k]) f.elements[k].value = u[k]; });
    f.elements.email.readOnly = true;
    $('#qtdPedidos').textContent = ler('pedidos', []).filter(p => p.email === u.email).length;
  }
  f.onsubmit = e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f)), us = ler('usuarios', []);
    d.email = d.email.trim().toLowerCase();
    if (perfil) {
      us[us.findIndex(x => x.email === u.email)] = { ...u, ...d, email: u.email };
      salvar('usuarios', us); aviso('Dados atualizados'); return;
    }
    if (d.senha !== d.confirma) { $('#erroForm').textContent = 'As senhas não conferem.'; return; }
    if (us.some(x => x.email === d.email)) { $('#erroForm').textContent = 'Este e-mail já está cadastrado.'; return; }
    delete d.confirma; us.push(d);
    salvar('usuarios', us); salvar('sessao', d.email); location.href = 'index.html';
  };
}

// ===== Inicialização =====
aplicarTema();
montarLayout();
document.addEventListener('click', e => { if (e.target.dataset.add) adicionar(Number(e.target.dataset.add)); });
aplicarMascaras();
({ home: iniciarHome, cardapio: iniciarCardapio, carrinho: iniciarCarrinho, pedidos: iniciarPedidos, cadastro: iniciarUsuario, perfil: iniciarUsuario })[document.body.dataset.pagina]?.();
