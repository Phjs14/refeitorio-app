// ===== CONTROLE DE ENTRADA E SAÍDA =====
const CHAVE = 'refeitorio-registros';
const LOTACAO = 60;

function hoje() {
  return new Date().toLocaleDateString('pt-BR');
}

function carregar() {
  const texto = localStorage.getItem(CHAVE);
  return texto ? JSON.parse(texto) : [];
}

function salvar(lista) {
  localStorage.setItem(CHAVE, JSON.stringify(lista));
}

let registros = carregar().filter((r) => r.dia === hoje());function quemEstaDentro() {
  const dentro = new Map();
  registros.forEach((r) => {
    if (r.tipo === 'entrada') {
      dentro.set(r.matricula, r.nome);
    } else {
      dentro.delete(r.matricula);
    }
  });
  return dentro;
}function mostrar() {
  const dentro = quemEstaDentro();
  const entradas = registros.filter((r) => r.tipo === 'entrada').length;
  const saidas = registros.length - entradas;

  document.querySelector('#total-entradas').textContent = entradas;
  document.querySelector('#total-saidas').textContent = saidas;
  document.querySelector('#total-dentro').textContent = dentro.size;
  document.querySelector('#contador-dentro').textContent = dentro.size;

  const porcento = Math.min(100, Math.round((dentro.size / LOTACAO) * 100));
  const barra = document.querySelector('#barra-lotacao');
  barra.style.width = porcento + '%';
  barra.classList.toggle('cheio', porcento >= 80);

  const lista = document.querySelector('#lista-registros');
  lista.innerHTML = '';
  if (registros.length === 0) {
    const vazio = document.createElement('li');
    vazio.className = 'vazio';
    vazio.textContent = 'Nenhum registro hoje.';
    lista.appendChild(vazio);
    return;
  }
  registros.slice().reverse().forEach((r) => {
    const item = document.createElement('li');
    item.className = r.tipo;
    const acao = r.tipo === 'entrada' ? '⬇️ Entrou' : '⬆️ Saiu';
    item.textContent = `${r.hora} · ${acao} · ${r.nome} (${r.matricula})`;
    lista.appendChild(item);
  });
}const form = document.querySelector('#form-registro');
const mensagem = document.querySelector('#mensagem');

function avisar(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = 'mensagem ' + tipo;
}

form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const tipo = evento.submitter ? evento.submitter.value : 'entrada';
  const matricula = form.matricula.value.trim();
  const nomeDigitado = form.nome.value.trim();
  const dentro = quemEstaDentro();

  if (tipo === 'entrada') {
    if (dentro.has(matricula)) {
      avisar(`A matrícula ${matricula} já está dentro do refeitório.`, 'erro');
      return;
    }
    if (nomeDigitado === '') {
      avisar('Digite o nome do aluno para registrar a entrada.', 'erro');
      return;
    }
    if (dentro.size >= LOTACAO) {
      avisar('Refeitório lotado! Aguarde alguém sair.', 'erro');
      return;
    }
  } else if (!dentro.has(matricula)) {
    avisar(`Não há entrada registrada hoje para a matrícula ${matricula}.`, 'erro');
    return;
  }

  const nome = tipo === 'entrada' ? nomeDigitado : dentro.get(matricula);
  registros.push({
    matricula: matricula,
    nome: nome,
    tipo: tipo,
    dia: hoje(),
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  });
  salvar(registros);
  mostrar();
  avisar(tipo === 'entrada' ? `✅ Entrada de ${nome} registrada.` : `👋 Saída de ${nome} registrada.`, 'ok');
  form.reset();
  form.matricula.focus();
});document.querySelector('#zerar').addEventListener('click', () => {
  if (confirm('Apagar todos os registros de hoje?')) {
    registros = [];
    salvar(registros);
    mostrar();
    avisar('Registros do dia apagados.', 'ok');
  }
});

// Destacar o dia de hoje no cardápio (0 = domingo, 1 = segunda ... 6 = sábado)
const cardHoje = document.querySelector(`.dia-cardapio[data-dia="${new Date().getDay()}"]`);
const pratoHoje = document.querySelector('#prato-hoje');
if (cardHoje) {
  cardHoje.classList.add('hoje');
  pratoHoje.textContent = cardHoje.querySelector('.prato').textContent;
} else {
  pratoHoje.textContent = 'Sem refeição hoje (fim de semana)';
}

mostrar();
// ===== PWA: registrar o service worker =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('✅ Service worker registrado'))
      .catch((erro) => console.log('❌ Erro no service worker:', erro));
  });
}