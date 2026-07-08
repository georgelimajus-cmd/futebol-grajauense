const STORAGE_KEY = 'forno_gestao_v1';
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const seedData = {
  settings: { businessName: 'Forno & Gestão', phone: '(99) 99999-9999', address: 'Centro, Grajaú - MA', deliveryFee: 6 },
  products: [
    { id: 1, name: 'Pizza Calabresa', category: 'Pizzas', price: 42, description: 'Molho, muçarela, calabresa e cebola.', active: true, emoji: '🍕' },
    { id: 2, name: 'Pizza Frango c/ Catupiry', category: 'Pizzas', price: 48, description: 'Frango temperado, muçarela e catupiry.', active: true, emoji: '🍕' },
    { id: 3, name: 'Pizza Portuguesa', category: 'Pizzas', price: 52, description: 'Presunto, ovos, cebola, ervilha e muçarela.', active: true, emoji: '🍕' },
    { id: 4, name: 'Refrigerante 2L', category: 'Bebidas', price: 12, description: 'Sabores variados, conforme disponibilidade.', active: true, emoji: '🥤' },
    { id: 5, name: 'Suco 500ml', category: 'Bebidas', price: 8, description: 'Suco natural da casa.', active: true, emoji: '🧃' },
    { id: 6, name: 'Brownie', category: 'Sobremesas', price: 10, description: 'Brownie artesanal de chocolate.', active: true, emoji: '🍫' }
  ],
  customers: [
    { id: 1, name: 'Ana Souza', phone: '(99) 98888-1010', address: 'Rua São Pedro, 120' },
    { id: 2, name: 'Carlos Lima', phone: '(99) 97777-2020', address: 'Av. Brasil, 450' },
    { id: 3, name: 'Mariana Alves', phone: '(99) 96666-3030', address: 'Bairro Canoeiro' },
    { id: 4, name: 'João Santos', phone: '(99) 95555-4040', address: 'Centro' }
  ],
  inventory: [
    { id: 1, name: 'Muçarela', category: 'Frios', quantity: 8, unit: 'kg', min: 5, unitCost: 38 },
    { id: 2, name: 'Calabresa', category: 'Frios', quantity: 3, unit: 'kg', min: 4, unitCost: 27 },
    { id: 3, name: 'Farinha de trigo', category: 'Massas', quantity: 18, unit: 'kg', min: 8, unitCost: 6.5 },
    { id: 4, name: 'Molho de tomate', category: 'Molhos', quantity: 5, unit: 'L', min: 6, unitCost: 9 },
    { id: 5, name: 'Caixa de pizza G', category: 'Embalagens', quantity: 42, unit: 'un', min: 25, unitCost: 1.8 },
    { id: 6, name: 'Refrigerante 2L', category: 'Bebidas', quantity: 9, unit: 'un', min: 10, unitCost: 7.5 }
  ],
  orders: [
    { id: 1007, createdAt: new Date(Date.now() - 20 * 60000).toISOString(), customerId: 1, type: 'Entrega', payment: 'PIX', status: 'Em preparo', items: [{ productId: 1, qty: 1, price: 42 }, { productId: 4, qty: 1, price: 12 }], deliveryFee: 6 },
    { id: 1006, createdAt: new Date(Date.now() - 55 * 60000).toISOString(), customerId: 2, type: 'Retirada', payment: 'Cartão', status: 'Pronto', items: [{ productId: 2, qty: 1, price: 48 }], deliveryFee: 0 },
    { id: 1005, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), customerId: 3, type: 'Entrega', payment: 'Dinheiro', status: 'Saiu para entrega', items: [{ productId: 3, qty: 1, price: 52 }, { productId: 5, qty: 2, price: 8 }], deliveryFee: 6 },
    { id: 1004, createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), customerId: 4, type: 'Balcão', payment: 'PIX', status: 'Concluído', items: [{ productId: 1, qty: 2, price: 42 }], deliveryFee: 0 },
    { id: 1003, createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), customerId: 1, type: 'Entrega', payment: 'Cartão', status: 'Concluído', items: [{ productId: 2, qty: 1, price: 48 }, { productId: 6, qty: 2, price: 10 }], deliveryFee: 6 }
  ],
  transactions: [
    { id: 1, createdAt: new Date(Date.now() - 7 * 3600000).toISOString(), description: 'Abertura de caixa', category: 'Caixa', type: 'Entrada', value: 150 },
    { id: 2, createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), description: 'Compra emergencial de gás', category: 'Despesa', type: 'Saída', value: 120 },
    { id: 3, createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), description: 'Compra de hortifruti', category: 'Estoque', type: 'Saída', value: 86.5 }
  ],
  salesHistory: [410, 560, 490, 720, 680, 840, 530]
};

let state = loadState();
let currentView = 'dashboard';
let orderDraftItems = [];

function cloneSeed() { return JSON.parse(JSON.stringify(seedData)); }
function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return parsed && parsed.products && parsed.orders ? parsed : cloneSeed();
  } catch { return cloneSeed(); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function nextId(collection) { return collection.length ? Math.max(...collection.map(x => Number(x.id) || 0)) + 1 : 1; }
function orderTotal(order) { return order.items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0) + Number(order.deliveryFee || 0); }
function slug(text) { return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch])); }
function customerById(id) { return state.customers.find(c => Number(c.id) === Number(id)); }
function productById(id) { return state.products.find(p => Number(p.id) === Number(id)); }
function formatDate(value) { try { return dateTime.format(new Date(value)); } catch { return '-'; } }
function todayKey(date = new Date()) { return date.toISOString().slice(0, 10); }
function isToday(value) { return todayKey(new Date(value)) === todayKey(); }

function toast(message) {
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = message;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function showView(view) {
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `view-${view}`));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  const meta = {
    dashboard:['Dashboard','Visão geral da sua pizzaria'], orders:['Pedidos','Acompanhe a operação em tempo real'],
    products:['Cardápio','Gerencie produtos, preços e disponibilidade'], customers:['Clientes','Histórico e cadastro da sua base'],
    inventory:['Estoque','Controle de insumos e reposição'], cash:['Caixa','Entradas, saídas e meios de pagamento'],
    settings:['Configurações','Personalize e proteja seus dados']
  }[view];
  document.getElementById('pageTitle').textContent = meta[0]; document.getElementById('pageSubtitle').textContent = meta[1];
  document.getElementById('sidebar').classList.remove('open'); renderAll();
}

function renderAll() { renderDashboard(); renderOrders(); renderProducts(); renderCustomers(); renderInventory(); renderCash(); renderSettings(); }

function renderDashboard() {
  const todayOrders = state.orders.filter(o => isToday(o.createdAt));
  const doneToday = todayOrders.filter(o => o.status === 'Concluído');
  const revenue = doneToday.reduce((s,o) => s + orderTotal(o), 0);
  const avg = doneToday.length ? revenue / doneToday.length : 0;
  const low = state.inventory.filter(i => Number(i.quantity) <= Number(i.min));
  document.getElementById('kpiGrid').innerHTML = [
    ['Faturamento hoje', money.format(revenue), '💳', '<strong>Pedidos concluídos</strong>'],
    ['Pedidos hoje', todayOrders.length, '🧾', `${doneToday.length} concluído(s)`],
    ['Ticket médio', money.format(avg), '📈', 'Média por pedido concluído'],
    ['Estoque crítico', low.length, '⚠️', low.length ? 'Requer atenção' : 'Tudo sob controle']
  ].map(k => `<article class="kpi-card"><div class="kpi-head"><span class="kpi-label">${k[0]}</span><span class="kpi-icon">${k[2]}</span></div><div class="kpi-value">${k[1]}</div><div class="kpi-foot">${k[3]}</div></article>`).join('');

  const history = state.salesHistory || [0,0,0,0,0,0,0];
  const max = Math.max(...history, 1); const labels = ['Qui','Sex','Sáb','Dom','Seg','Ter','Hoje'];
  document.getElementById('salesChart').innerHTML = history.map((v,i) => `<div class="bar-wrap"><span class="bar-value">${Math.round(v)}</span><div class="bar" style="height:${Math.max(5,(v/max)*78)}%" title="${money.format(v)}"></div><span class="bar-label">${labels[i]}</span></div>`).join('');

  const statuses = ['Novo','Em preparo','Pronto','Saiu para entrega','Concluído','Cancelado'];
  const colors = ['#2563eb','#ea580c','#ca8a04','#7c3aed','#16a34a','#dc2626']; const total = Math.max(todayOrders.length,1);
  document.getElementById('statusSummary').innerHTML = statuses.map((s,i) => { const count=todayOrders.filter(o=>o.status===s).length; return `<div class="status-line"><div class="status-line-main"><span class="status-color" style="background:${colors[i]}"></span>${s}</div><span class="status-count">${count}</span><div class="progress"><span style="width:${(count/total)*100}%;background:${colors[i]}"></span></div></div>`; }).join('');

  document.getElementById('recentOrdersBody').innerHTML = sortedOrders().slice(0,5).map(o => orderRow(o, true)).join('') || emptyRow(5,'Nenhum pedido cadastrado.');
  document.getElementById('lowStockList').innerHTML = low.length ? low.slice(0,6).map(i => `<div class="alert-item"><div><strong>${escapeHtml(i.name)}</strong><div class="muted">Mínimo: ${i.min} ${escapeHtml(i.unit)}</div></div><span>${i.quantity} ${escapeHtml(i.unit)}</span></div>`).join('') : '<div class="empty-state">Nenhum item em nível crítico.</div>';
}

function sortedOrders() { return [...state.orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); }
function statusBadge(status) { return `<span class="status-badge status-${slug(status)}">${escapeHtml(status)}</span>`; }
function orderRow(o, compact=false) {
  const c = customerById(o.customerId); const items = o.items.reduce((s,i)=>s+Number(i.qty),0);
  if (compact) return `<tr><td><strong>#${o.id}</strong></td><td>${escapeHtml(c?.name || 'Balcão')}</td><td>${escapeHtml(o.type)}</td><td><strong>${money.format(orderTotal(o))}</strong></td><td>${statusBadge(o.status)}</td></tr>`;
  return `<tr><td><strong>#${o.id}</strong></td><td>${formatDate(o.createdAt)}</td><td>${escapeHtml(c?.name || 'Balcão')}</td><td>${items}</td><td>${escapeHtml(o.type)}</td><td><strong>${money.format(orderTotal(o))}</strong></td><td>${escapeHtml(o.payment)}</td><td><select class="select order-status" data-id="${o.id}">${['Novo','Em preparo','Pronto','Saiu para entrega','Concluído','Cancelado'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}</select></td><td><div class="row-actions"><button class="row-action" data-delete-order="${o.id}" title="Excluir">🗑️</button></div></td></tr>`;
}
function emptyRow(cols,text) { return `<tr><td colspan="${cols}"><div class="empty-state">${text}</div></td></tr>`; }

function renderOrders() {
  const q = (document.getElementById('orderSearch')?.value || '').toLowerCase();
  const filter = document.getElementById('orderStatusFilter')?.value || 'all';
  const list = sortedOrders().filter(o => {
    const c = customerById(o.customerId); const matches = String(o.id).includes(q) || (c?.name || '').toLowerCase().includes(q);
    return matches && (filter === 'all' || o.status === filter);
  });
  document.getElementById('ordersBody').innerHTML = list.map(o => orderRow(o)).join('') || emptyRow(9,'Nenhum pedido encontrado.');
}

function renderProducts() {
  const q = (document.getElementById('productSearch')?.value || '').toLowerCase();
  const list = state.products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  document.getElementById('productGrid').innerHTML = list.length ? list.map(p => `<article class="product-card"><div class="product-cover"><span class="category-chip">${escapeHtml(p.category)}</span>${escapeHtml(p.emoji || '🍕')}</div><div class="product-body"><div class="product-title-row"><h3>${escapeHtml(p.name)}</h3><span class="price">${money.format(p.price)}</span></div><p>${escapeHtml(p.description || '')}</p><div class="product-footer"><span class="toggle">${p.active ? '● Disponível' : '○ Indisponível'}</span><div class="row-actions"><button class="row-action" data-toggle-product="${p.id}" title="Alternar disponibilidade">◉</button><button class="row-action" data-edit-product="${p.id}" title="Editar">✏️</button><button class="row-action" data-delete-product="${p.id}" title="Excluir">🗑️</button></div></div></div></article>`).join('') : '<div class="empty-state">Nenhum produto encontrado.</div>';
}

function customerStats(id) {
  const orders = state.orders.filter(o => Number(o.customerId) === Number(id) && o.status !== 'Cancelado');
  return { count: orders.length, total: orders.reduce((s,o)=>s+orderTotal(o),0) };
}
function renderCustomers() {
  const q=(document.getElementById('customerSearch')?.value||'').toLowerCase();
  const list=state.customers.filter(c=>[c.name,c.phone,c.address].some(v=>String(v||'').toLowerCase().includes(q)));
  document.getElementById('customersBody').innerHTML=list.map(c=>{const s=customerStats(c.id);return `<tr><td><strong>${escapeHtml(c.name)}</strong></td><td>${escapeHtml(c.phone)}</td><td>${escapeHtml(c.address)}</td><td>${s.count}</td><td><strong>${money.format(s.total)}</strong></td><td><div class="row-actions"><button class="row-action" data-edit-customer="${c.id}">✏️</button><button class="row-action" data-delete-customer="${c.id}">🗑️</button></div></td></tr>`}).join('')||emptyRow(6,'Nenhum cliente encontrado.');
}

function renderInventory() {
  const list=[...state.inventory].sort((a,b)=>(a.quantity/a.min)-(b.quantity/b.min));
  document.getElementById('inventoryBody').innerHTML=list.map(i=>{const critical=Number(i.quantity)<=Number(i.min);return `<tr><td><strong>${escapeHtml(i.name)}</strong></td><td>${escapeHtml(i.category)}</td><td>${i.quantity} ${escapeHtml(i.unit)}</td><td>${i.min} ${escapeHtml(i.unit)}</td><td>${money.format(i.unitCost)}</td><td>${critical?'<span class="status-badge status-cancelado">Baixo</span>':'<span class="status-badge status-concluído">Normal</span>'}</td><td><div class="row-actions"><button class="row-action" data-edit-stock="${i.id}">✏️</button><button class="row-action" data-delete-stock="${i.id}">🗑️</button></div></td></tr>`}).join('')||emptyRow(7,'Nenhum insumo cadastrado.');
}

function completedOrderEntries() { return state.orders.filter(o=>o.status==='Concluído').map(o=>({id:`order-${o.id}`,createdAt:o.createdAt,description:`Pedido #${o.id}`,category:'Vendas',type:'Entrada',value:orderTotal(o),virtual:true})); }
function renderCash() {
  const tx=[...state.transactions,...completedOrderEntries()].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const entries=tx.filter(t=>t.type==='Entrada').reduce((s,t)=>s+Number(t.value),0); const exits=tx.filter(t=>t.type==='Saída').reduce((s,t)=>s+Number(t.value),0); const balance=entries-exits;
  document.getElementById('cashKpis').innerHTML=[['Entradas',money.format(entries),'↗️','Receitas e vendas'],['Saídas',money.format(exits),'↘️','Despesas registradas'],['Saldo',money.format(balance),'💰','Resultado acumulado']].map(k=>`<article class="kpi-card"><div class="kpi-head"><span class="kpi-label">${k[0]}</span><span class="kpi-icon">${k[2]}</span></div><div class="kpi-value">${k[1]}</div><div class="kpi-foot">${k[3]}</div></article>`).join('');
  document.getElementById('cashBody').innerHTML=tx.map(t=>`<tr><td>${formatDate(t.createdAt)}</td><td><strong>${escapeHtml(t.description)}</strong></td><td>${escapeHtml(t.category)}</td><td class="${t.type==='Entrada'?'type-entry':'type-exit'}">${t.type}</td><td><strong>${t.type==='Saída'?'- ':'+ '}${money.format(t.value)}</strong></td><td>${t.virtual?'':`<button class="row-action" data-delete-transaction="${t.id}">🗑️</button>`}</td></tr>`).join('')||emptyRow(6,'Nenhuma movimentação.');
  const done=state.orders.filter(o=>o.status==='Concluído'); const payments=['PIX','Cartão','Dinheiro']; const count=Math.max(done.length,1);
  document.getElementById('paymentBreakdown').innerHTML=payments.map((p,i)=>{const n=done.filter(o=>o.payment===p).length;const colors=['#16a34a','#2563eb','#f59e0b'];return `<div class="payment-row"><strong>${p}</strong><span>${n} pedido(s)</span><div class="progress"><span style="width:${(n/count)*100}%;background:${colors[i]}"></span></div></div>`}).join('');
}

function renderSettings() {
  const f=document.getElementById('settingsForm'); if(!f||f.dataset.ready) return;
  Object.entries(state.settings).forEach(([k,v])=>{if(f.elements[k]) f.elements[k].value=v}); f.dataset.ready='1';
}

function openModal(title, subtitle, html) { document.getElementById('modalTitle').textContent=title; document.getElementById('modalSubtitle').textContent=subtitle||''; document.getElementById('modalContent').innerHTML=html; document.getElementById('modalBackdrop').hidden=false; }
function closeModal() { document.getElementById('modalBackdrop').hidden=true; orderDraftItems=[]; }

function openOrderModal() {
  orderDraftItems=[];
  openModal('Novo pedido','Cadastre os itens e os dados da venda.',`<form id="orderForm" class="form-grid">
    <label class="field"><span>Cliente</span><select name="customerId" required><option value="">Selecione</option>${state.customers.map(c=>`<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}</select></label>
    <label class="field"><span>Tipo</span><select name="type"><option>Entrega</option><option>Retirada</option><option>Balcão</option></select></label>
    <label class="field"><span>Pagamento</span><select name="payment"><option>PIX</option><option>Cartão</option><option>Dinheiro</option></select></label>
    <label class="field"><span>Status inicial</span><select name="status"><option>Novo</option><option>Em preparo</option></select></label>
    <div class="field full"><span>Adicionar item</span><div class="order-item-builder"><select id="draftProduct">${state.products.filter(p=>p.active).map(p=>`<option value="${p.id}">${escapeHtml(p.name)} — ${money.format(p.price)}</option>`).join('')}</select><input id="draftQty" type="number" min="1" value="1"><button type="button" class="secondary-button" id="addDraftItem">Adicionar</button></div><div id="draftItemsPreview" class="order-items-preview"></div><div class="order-total"><span>Total estimado</span><span id="draftTotal">${money.format(0)}</span></div></div>
    <div class="form-actions full"><button type="button" class="secondary-button" data-close-modal>Cancelar</button><button type="submit" class="primary-button">Salvar pedido</button></div></form>`);
  renderDraftItems();
}
function renderDraftItems() {
  const box=document.getElementById('draftItemsPreview'); if(!box)return;
  box.innerHTML=orderDraftItems.length?orderDraftItems.map((i,index)=>{const p=productById(i.productId);return `<div class="order-preview-row"><span>${i.qty}x ${escapeHtml(p?.name||'Produto')}</span><span>${money.format(i.qty*i.price)} <button type="button" class="row-action" data-remove-draft="${index}">✕</button></span></div>`}).join(''):'<div class="empty-state">Adicione pelo menos um item.</div>';
  const type=document.querySelector('#orderForm [name="type"]')?.value; const fee=type==='Entrega'?Number(state.settings.deliveryFee||0):0; const total=orderDraftItems.reduce((s,i)=>s+i.qty*i.price,0)+fee;
  const totalEl=document.getElementById('draftTotal'); if(totalEl) totalEl.textContent=money.format(total);
}

function productForm(product={}) { return `<form id="productForm" class="form-grid"><input type="hidden" name="id" value="${product.id||''}"><label class="field full"><span>Nome</span><input name="name" required value="${escapeHtml(product.name||'')}"></label><label class="field"><span>Categoria</span><select name="category">${['Pizzas','Bebidas','Sobremesas','Combos','Outros'].map(c=>`<option ${product.category===c?'selected':''}>${c}</option>`).join('')}</select></label><label class="field"><span>Preço</span><input name="price" type="number" min="0" step="0.01" required value="${product.price??''}"></label><label class="field"><span>Emoji/ícone</span><input name="emoji" maxlength="4" value="${escapeHtml(product.emoji||'🍕')}"></label><label class="field"><span>Disponibilidade</span><select name="active"><option value="true" ${product.active!==false?'selected':''}>Disponível</option><option value="false" ${product.active===false?'selected':''}>Indisponível</option></select></label><label class="field full"><span>Descrição</span><textarea name="description">${escapeHtml(product.description||'')}</textarea></label><div class="form-actions full"><button type="button" class="secondary-button" data-close-modal>Cancelar</button><button class="primary-button">Salvar produto</button></div></form>`; }
function customerForm(c={}) { return `<form id="customerForm" class="form-grid"><input type="hidden" name="id" value="${c.id||''}"><label class="field full"><span>Nome</span><input name="name" required value="${escapeHtml(c.name||'')}"></label><label class="field"><span>Telefone</span><input name="phone" required value="${escapeHtml(c.phone||'')}"></label><label class="field full"><span>Endereço</span><input name="address" value="${escapeHtml(c.address||'')}"></label><div class="form-actions full"><button type="button" class="secondary-button" data-close-modal>Cancelar</button><button class="primary-button">Salvar cliente</button></div></form>`; }
function stockForm(i={}) { return `<form id="stockForm" class="form-grid"><input type="hidden" name="id" value="${i.id||''}"><label class="field full"><span>Insumo</span><input name="name" required value="${escapeHtml(i.name||'')}"></label><label class="field"><span>Categoria</span><input name="category" required value="${escapeHtml(i.category||'')}"></label><label class="field"><span>Unidade</span><input name="unit" required placeholder="kg, L, un" value="${escapeHtml(i.unit||'un')}"></label><label class="field"><span>Quantidade atual</span><input name="quantity" type="number" min="0" step="0.01" required value="${i.quantity??''}"></label><label class="field"><span>Estoque mínimo</span><input name="min" type="number" min="0" step="0.01" required value="${i.min??''}"></label><label class="field"><span>Custo unitário</span><input name="unitCost" type="number" min="0" step="0.01" required value="${i.unitCost??''}"></label><div class="form-actions full"><button type="button" class="secondary-button" data-close-modal>Cancelar</button><button class="primary-button">Salvar insumo</button></div></form>`; }

function transactionForm() { return `<form id="transactionForm" class="form-grid"><label class="field full"><span>Descrição</span><input name="description" required></label><label class="field"><span>Categoria</span><select name="category"><option>Despesa</option><option>Estoque</option><option>Caixa</option><option>Outros</option></select></label><label class="field"><span>Tipo</span><select name="type"><option>Entrada</option><option>Saída</option></select></label><label class="field full"><span>Valor</span><input name="value" type="number" min="0.01" step="0.01" required></label><div class="form-actions full"><button type="button" class="secondary-button" data-close-modal>Cancelar</button><button class="primary-button">Salvar lançamento</button></div></form>`; }

function confirmDelete(message) { return window.confirm(message); }

document.addEventListener('click', e => {
  const nav=e.target.closest('[data-view]'); if(nav) showView(nav.dataset.view);
  const target=e.target.closest('[data-view-target]'); if(target) showView(target.dataset.viewTarget);
  if(e.target.closest('#menuToggle')) document.getElementById('sidebar').classList.toggle('open');
  if(e.target.closest('#closeModal')||e.target.closest('[data-close-modal]')) closeModal();
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(action==='new-order') openOrderModal();
  if(action==='new-product') openModal('Novo produto','Adicione um item ao cardápio.',productForm());
  if(action==='new-customer') openModal('Novo cliente','Cadastre os dados de contato.',customerForm());
  if(action==='new-stock') openModal('Novo insumo','Adicione um item ao controle de estoque.',stockForm());
  if(action==='new-transaction') openModal('Novo lançamento','Registre uma entrada ou saída manual.',transactionForm());

  if(e.target.closest('#addDraftItem')) { const pid=Number(document.getElementById('draftProduct').value); const qty=Math.max(1,Number(document.getElementById('draftQty').value)||1); const p=productById(pid); if(p){const existing=orderDraftItems.find(i=>i.productId===pid); if(existing)existing.qty+=qty; else orderDraftItems.push({productId:pid,qty,price:Number(p.price)}); renderDraftItems();} }
  const rm=e.target.closest('[data-remove-draft]'); if(rm){orderDraftItems.splice(Number(rm.dataset.removeDraft),1);renderDraftItems();}

  const toggle=e.target.closest('[data-toggle-product]'); if(toggle){const p=productById(toggle.dataset.toggleProduct);p.active=!p.active;saveState();renderAll();toast('Disponibilidade atualizada.');}
  const editP=e.target.closest('[data-edit-product]'); if(editP){const p=productById(editP.dataset.editProduct);openModal('Editar produto','Atualize os dados do cardápio.',productForm(p));}
  const delP=e.target.closest('[data-delete-product]'); if(delP&&confirmDelete('Excluir este produto do cardápio?')){state.products=state.products.filter(p=>p.id!==Number(delP.dataset.deleteProduct));saveState();renderAll();toast('Produto excluído.');}

  const editC=e.target.closest('[data-edit-customer]'); if(editC){const c=customerById(editC.dataset.editCustomer);openModal('Editar cliente','Atualize o cadastro.',customerForm(c));}
  const delC=e.target.closest('[data-delete-customer]'); if(delC&&confirmDelete('Excluir este cliente? Pedidos antigos serão mantidos.')){state.customers=state.customers.filter(c=>c.id!==Number(delC.dataset.deleteCustomer));saveState();renderAll();toast('Cliente excluído.');}

  const editS=e.target.closest('[data-edit-stock]'); if(editS){const i=state.inventory.find(x=>x.id===Number(editS.dataset.editStock));openModal('Editar insumo','Atualize quantidade, custo ou ponto mínimo.',stockForm(i));}
  const delS=e.target.closest('[data-delete-stock]'); if(delS&&confirmDelete('Excluir este insumo do estoque?')){state.inventory=state.inventory.filter(i=>i.id!==Number(delS.dataset.deleteStock));saveState();renderAll();toast('Insumo excluído.');}

  const delO=e.target.closest('[data-delete-order]'); if(delO&&confirmDelete('Excluir este pedido permanentemente?')){state.orders=state.orders.filter(o=>o.id!==Number(delO.dataset.deleteOrder));saveState();renderAll();toast('Pedido excluído.');}
  const delT=e.target.closest('[data-delete-transaction]'); if(delT&&confirmDelete('Excluir este lançamento?')){state.transactions=state.transactions.filter(t=>t.id!==Number(delT.dataset.deleteTransaction));saveState();renderAll();toast('Lançamento excluído.');}
});

document.addEventListener('change', e => {
  if(e.target.matches('.order-status')) { const o=state.orders.find(x=>x.id===Number(e.target.dataset.id)); if(o){o.status=e.target.value;saveState();renderAll();toast(`Pedido #${o.id}: ${o.status}`);} }
  if(e.target.matches('#orderForm [name="type"]')) renderDraftItems();
});

document.addEventListener('submit', e => {
  e.preventDefault(); const f=e.target; const fd=new FormData(f);
  if(f.id==='orderForm') {
    if(!orderDraftItems.length){toast('Adicione pelo menos um item.');return;}
    const type=fd.get('type'); const id=nextId(state.orders.map(o=>({id:o.id})));
    state.orders.push({id:Math.max(id,1001),createdAt:new Date().toISOString(),customerId:Number(fd.get('customerId')),type,payment:fd.get('payment'),status:fd.get('status'),items:orderDraftItems.map(i=>({...i})),deliveryFee:type==='Entrega'?Number(state.settings.deliveryFee||0):0});
    saveState();closeModal();showView('orders');toast(`Pedido #${Math.max(id,1001)} criado.`);return;
  }
  if(f.id==='productForm') { const id=Number(fd.get('id')); const data={id:id||nextId(state.products),name:fd.get('name').trim(),category:fd.get('category'),price:Number(fd.get('price')),description:fd.get('description').trim(),emoji:fd.get('emoji').trim()||'🍕',active:fd.get('active')==='true'}; const idx=state.products.findIndex(p=>p.id===id); if(idx>=0)state.products[idx]=data;else state.products.push(data);saveState();closeModal();renderAll();toast('Produto salvo.');return; }
  if(f.id==='customerForm') { const id=Number(fd.get('id')); const data={id:id||nextId(state.customers),name:fd.get('name').trim(),phone:fd.get('phone').trim(),address:fd.get('address').trim()}; const idx=state.customers.findIndex(c=>c.id===id);if(idx>=0)state.customers[idx]=data;else state.customers.push(data);saveState();closeModal();renderAll();toast('Cliente salvo.');return; }
  if(f.id==='stockForm') { const id=Number(fd.get('id')); const data={id:id||nextId(state.inventory),name:fd.get('name').trim(),category:fd.get('category').trim(),unit:fd.get('unit').trim(),quantity:Number(fd.get('quantity')),min:Number(fd.get('min')),unitCost:Number(fd.get('unitCost'))};const idx=state.inventory.findIndex(i=>i.id===id);if(idx>=0)state.inventory[idx]=data;else state.inventory.push(data);saveState();closeModal();renderAll();toast('Insumo salvo.');return; }
  if(f.id==='transactionForm') { state.transactions.push({id:nextId(state.transactions),createdAt:new Date().toISOString(),description:fd.get('description').trim(),category:fd.get('category'),type:fd.get('type'),value:Number(fd.get('value'))});saveState();closeModal();renderAll();toast('Lançamento registrado.');return; }
  if(f.id==='settingsForm') { state.settings={businessName:fd.get('businessName').trim(),phone:fd.get('phone').trim(),address:fd.get('address').trim(),deliveryFee:Number(fd.get('deliveryFee'))||0};saveState();toast('Configurações salvas.'); }
});

['orderSearch','productSearch','customerSearch'].forEach(id=>document.getElementById(id)?.addEventListener('input',()=>renderAll()));
document.getElementById('orderStatusFilter')?.addEventListener('change',renderOrders);
document.getElementById('modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

document.getElementById('exportData').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`pizzaria-backup-${todayKey()}.json`;a.click();URL.revokeObjectURL(url);toast('Backup exportado.');});
document.getElementById('importData').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const imported=JSON.parse(await file.text());if(!imported.products||!imported.orders)throw new Error('Formato inválido');state=imported;saveState();document.getElementById('settingsForm').dataset.ready='';renderAll();toast('Backup importado.');}catch{toast('Não foi possível importar o arquivo.');}e.target.value='';});
document.getElementById('resetData').addEventListener('click',()=>{if(confirmDelete('Restaurar os dados de demonstração? Os dados atuais serão substituídos.')){state=cloneSeed();saveState();document.getElementById('settingsForm').dataset.ready='';renderAll();toast('Dados de demonstração restaurados.');}});

renderAll();