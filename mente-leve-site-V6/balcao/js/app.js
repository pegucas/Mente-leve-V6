const KEY = "ml_estoque_v1";

const seed = [
  { id: "1", nome: "Losartana 50mg", marca: "Eurofarma", qtd: 4, min: 8, preco: 8.9, euro: true },
  { id: "2", nome: "Metformina 850mg", marca: "Eurofarma", qtd: 22, min: 10, preco: 12.5, euro: true },
  { id: "3", nome: "Enalapril 10mg", marca: "Medley", qtd: 0, min: 6, preco: 7.2, euro: false },
  { id: "4", nome: "Dipirona 1g", marca: "Neo Química", qtd: 40, min: 12, preco: 6.4, euro: false },
  { id: "5", nome: "Sinvastatina 20mg", marca: "Eurofarma", qtd: 3, min: 6, preco: 11.9, euro: true },
];

const pedidos = [
  { id: "#1042", quem: "Dona Helena · cuidador no app", itens: "Losartana 50mg × 2", janela: "Hoje 16h–18h", euro: true, status: "Receita na fila" },
  { id: "#1043", quem: "Sr. Benedito", itens: "Metformina 850mg × 1", janela: "Hoje 16h–18h", euro: true, status: "Reservado" },
  { id: "#1044", quem: "Ana Paula", itens: "Dipirona 1g × 1", janela: "Amanhã 10h–12h", euro: false, status: "Agrupando rota" },
];

function load() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : seed.slice();
}
function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

let estoque = load();

const $ = (id) => document.getElementById(id);

function renderStats() {
  const ruptura = estoque.filter((p) => p.qtd <= p.min);
  $("stat-pedidos").textContent = pedidos.length;
  $("stat-ruptura").textContent = ruptura.length;
  $("stat-skus").textContent = estoque.length;
  $("stat-euro").textContent = estoque.filter((p) => p.euro).length;
}

function renderHoje() {
  $("fila-receita").innerHTML = pedidos
    .map(
      (p) => `<li>
        <div><strong>${p.quem}</strong><br /><span style="color:var(--dim)">${p.itens}</span></div>
        <span class="badge ${p.euro ? "" : "warn"}">${p.status}</span>
      </li>`
    )
    .join("");

  const low = estoque.filter((p) => p.qtd <= p.min);
  $("fila-ruptura").innerHTML = low.length
    ? low
        .map(
          (p) => `<li>
            <div><strong>${p.nome}</strong><br /><span style="color:var(--dim)">${p.marca} · mín. ${p.min}</span></div>
            <span class="badge ${p.qtd === 0 ? "danger" : "warn"}">${p.qtd} un.</span>
          </li>`
        )
        .join("")
    : "<li>Nada crítico agora.</li>";
}

function renderTabela(filtro = "") {
  const q = filtro.toLowerCase();
  const rows = estoque.filter(
    (p) =>
      p.nome.toLowerCase().includes(q) ||
      p.marca.toLowerCase().includes(q)
  );
  $("tbody").innerHTML = rows
    .map((p) => {
      const cls = p.qtd === 0 ? "out" : p.qtd <= p.min ? "low" : "";
      return `<tr>
        <td><strong>${p.nome}</strong><br /><span style="color:var(--dim)">${p.marca}</span></td>
        <td>${p.euro ? '<span class="badge">EuroCuida</span>' : "—"}</td>
        <td class="qty ${cls}">${p.qtd}</td>
        <td>${p.min}</td>
        <td>R$ ${Number(p.preco).toFixed(2)}</td>
        <td>
          <button class="mini" data-add="${p.id}">+1</button>
          <button class="mini" data-sub="${p.id}">−1</button>
          <button class="mini" data-edit="${p.id}">Editar</button>
          <button class="mini" data-del="${p.id}">Apagar</button>
        </td>
      </tr>`;
    })
    .join("");
}

function renderPedidos() {
  $("lista-pedidos").innerHTML = pedidos
    .map(
      (p) => `<article class="order">
        <div>
          <strong>${p.id} · ${p.quem}</strong>
          <p>${p.itens} · ${p.janela}</p>
        </div>
        <span class="badge">${p.status}</span>
      </article>`
    )
    .join("");
}

function refresh() {
  save(estoque);
  renderStats();
  renderHoje();
  renderTabela($("busca").value);
  renderPedidos();
}

function show(view) {
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  document.getElementById("view-" + view).classList.remove("hidden");
  document.querySelectorAll(".nav").forEach((b) => b.classList.toggle("on", b.dataset.view === view));
  const titles = { hoje: "Hoje", estoque: "Estoque vivo", pedidos: "Pedidos", euro: "EuroCuida" };
  $("view-title").textContent = titles[view];
}

$("entrar").onclick = () => {
  const senha = $("loja-senha").value;
  if (senha !== "farmacia123") {
    alert("Senha incorreta. Use a senha de acesso da loja.");
    return;
  }
  const nome = $("loja-nome").value.trim() || "Farmácia parceira";
  localStorage.setItem("ml_loja", nome);
  $("loja-label").textContent = nome;
  $("login-screen").classList.add("hidden");
  $("app").classList.remove("hidden");
  refresh();
};

$("sair").onclick = () => {
  $("app").classList.add("hidden");
  $("login-screen").classList.remove("hidden");
};

document.querySelectorAll(".nav").forEach((b) => {
  b.onclick = () => show(b.dataset.view);
});

$("busca").addEventListener("input", () => renderTabela($("busca").value));

$("tbody").addEventListener("click", (e) => {
  const add = e.target.dataset.add;
  const sub = e.target.dataset.sub;
  const del = e.target.dataset.del;
  const edit = e.target.dataset.edit;
  if (add) {
    estoque = estoque.map((p) => (p.id === add ? { ...p, qtd: p.qtd + 1 } : p));
    refresh();
  }
  if (sub) {
    estoque = estoque.map((p) => (p.id === sub ? { ...p, qtd: Math.max(0, p.qtd - 1) } : p));
    refresh();
  }
  if (del) {
    estoque = estoque.filter((p) => p.id !== del);
    refresh();
  }
  if (edit) {
    const p = estoque.find((x) => x.id === edit);
    $("edit-id").value = p.id;
    $("p-nome").value = p.nome;
    $("p-marca").value = p.marca;
    $("p-qtd").value = p.qtd;
    $("p-min").value = p.min;
    $("p-preco").value = p.preco;
    $("p-euro").checked = p.euro;
    $("modal-title").textContent = "Editar produto";
    $("modal").showModal();
  }
});

$("abrir-novo").onclick = () => {
  $("form-produto").reset();
  $("edit-id").value = "";
  $("modal-title").textContent = "Novo produto";
  $("modal").showModal();
};
$("cancelar").onclick = () => $("modal").close();

$("salvar").onclick = (e) => {
  e.preventDefault();
  const item = {
    id: $("edit-id").value || String(Date.now()),
    nome: $("p-nome").value.trim(),
    marca: $("p-marca").value.trim() || "—",
    qtd: Number($("p-qtd").value),
    min: Number($("p-min").value),
    preco: Number($("p-preco").value),
    euro: $("p-euro").checked,
  };
  if (!item.nome) return;
  if ($("edit-id").value) {
    estoque = estoque.map((p) => (p.id === item.id ? item : p));
  } else {
    estoque.unshift(item);
  }
  $("modal").close();
  refresh();
};
