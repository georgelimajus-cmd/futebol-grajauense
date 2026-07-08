(() => {
  function customerLabel(customer) {
    if (!customer) return 'Balcão';
    if (customer.customerType === 'Mesa') {
      const table = customer.tableNumber ? `Mesa ${customer.tableNumber}` : 'Mesa';
      return `${table} — ${customer.name}`;
    }
    return customer.name;
  }

  function customerDetails(customer) {
    if (!customer) return '';
    if (customer.customerType === 'Mesa') {
      return [
        customer.tableNumber ? `<div><strong>Mesa:</strong> ${escapeHtml(customer.tableNumber)}</div>` : '',
        customer.phone ? `<div><strong>Telefone:</strong> ${escapeHtml(customer.phone)}</div>` : ''
      ].filter(Boolean).join('');
    }
    return [
      customer.phone ? `<div><strong>Telefone:</strong> ${escapeHtml(customer.phone)}</div>` : '',
      customer.address ? `<div><strong>Endereço:</strong> ${escapeHtml(customer.address)}</div>` : ''
    ].filter(Boolean).join('');
  }

  function printOrder(orderId) {
    const order = state.orders.find(item => Number(item.id) === Number(orderId));
    if (!order) {
      toast('Pedido não encontrado.');
      return;
    }

    const customer = customerById(order.customerId);
    const subtotal = order.items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
    const deliveryFee = Number(order.deliveryFee || 0);
    const total = subtotal + deliveryFee;
    const business = state.settings || {};

    const itemRows = order.items.map(item => {
      const product = productById(item.productId);
      const name = product?.name || 'Produto';
      const itemTotal = Number(item.price) * Number(item.qty);
      return `<tr>
        <td>${escapeHtml(name)}</td>
        <td class="center">${item.qty}</td>
        <td class="right">${money.format(item.price)}</td>
        <td class="right">${money.format(itemTotal)}</td>
      </tr>`;
    }).join('');

    const win = window.open('', '_blank', 'width=760,height=900');
    if (!win) {
      toast('Permita pop-ups no navegador para imprimir o pedido.');
      return;
    }

    win.document.write(`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Pedido #${order.id}</title>
  <style>
    @page{margin:10mm}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#111;background:#fff}.receipt{width:100%;max-width:720px;margin:0 auto;padding:12px}.header{text-align:center;border-bottom:2px dashed #222;padding-bottom:14px}.header h1{margin:0 0 4px;font-size:24px}.header p{margin:3px 0;font-size:12px}.order-title{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:16px 0;border-bottom:1px solid #bbb}.order-title h2{margin:0;font-size:22px}.status{border:1px solid #222;border-radius:999px;padding:5px 10px;font-size:11px;font-weight:700}.meta{display:grid;grid-template-columns:1fr 1fr;gap:10px 20px;padding:15px 0;border-bottom:1px dashed #777;font-size:13px}.meta div{line-height:1.45}.customer{padding:15px 0;border-bottom:1px dashed #777;font-size:13px}.customer h3{margin:0 0 7px;font-size:14px}.customer div{margin:3px 0}table{width:100%;border-collapse:collapse;margin-top:14px}th,td{padding:9px 5px;border-bottom:1px solid #ddd;font-size:12px;text-align:left}th{font-size:10px;text-transform:uppercase}.right{text-align:right}.center{text-align:center}.totals{margin-left:auto;width:min(320px,100%);padding-top:12px}.total-line{display:flex;justify-content:space-between;gap:20px;padding:5px 0;font-size:13px}.grand-total{font-size:19px;font-weight:800;border-top:2px solid #111;margin-top:6px;padding-top:10px}.footer{text-align:center;margin-top:24px;padding-top:14px;border-top:2px dashed #222;font-size:11px}.screen-actions{display:flex;justify-content:center;gap:10px;margin:18px auto}.screen-actions button{border:0;border-radius:8px;padding:10px 14px;font-weight:700;cursor:pointer}.print{background:#111;color:#fff}.close{background:#eee;color:#111}@media print{.screen-actions{display:none}.receipt{max-width:none;padding:0}}
  </style>
</head>
<body>
  <div class="screen-actions"><button class="print" onclick="window.print()">Imprimir pedido</button><button class="close" onclick="window.close()">Fechar</button></div>
  <main class="receipt">
    <header class="header">
      <h1>${escapeHtml(business.businessName || 'Bistrô Pizzaria - Gestão Admininstrativa')}</h1>
      ${business.phone ? `<p>${escapeHtml(business.phone)}</p>` : ''}
      ${business.address ? `<p>${escapeHtml(business.address)}</p>` : ''}
    </header>

    <section class="order-title">
      <h2>PEDIDO #${order.id}</h2>
      <span class="status">${escapeHtml(order.status)}</span>
    </section>

    <section class="meta">
      <div><strong>Data/Hora:</strong><br>${escapeHtml(formatDate(order.createdAt))}</div>
      <div><strong>Tipo:</strong><br>${escapeHtml(order.type)}</div>
      <div><strong>Pagamento:</strong><br>${escapeHtml(order.payment)}</div>
      <div><strong>Itens:</strong><br>${order.items.reduce((sum,item)=>sum+Number(item.qty),0)}</div>
    </section>

    <section class="customer">
      <h3>Cliente</h3>
      <div><strong>Nome/Identificação:</strong> ${escapeHtml(customerLabel(customer))}</div>
      ${customerDetails(customer)}
    </section>

    <table>
      <thead><tr><th>Item</th><th class="center">Qtd.</th><th class="right">Unit.</th><th class="right">Total</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>

    <section class="totals">
      <div class="total-line"><span>Subtotal</span><strong>${money.format(subtotal)}</strong></div>
      ${deliveryFee > 0 ? `<div class="total-line"><span>Taxa de entrega</span><strong>${money.format(deliveryFee)}</strong></div>` : ''}
      <div class="total-line grand-total"><span>TOTAL</span><span>${money.format(total)}</span></div>
    </section>

    <footer class="footer">Comanda gerada pelo sistema Bistrô Pizzaria - Gestão Admininstrativa</footer>
  </main>
</body>
</html>`);
    win.document.close();
    win.focus();
  }

  orderRow = function orderRowWithPrint(order, compact = false) {
    const customer = customerById(order.customerId);
    const items = order.items.reduce((sum, item) => sum + Number(item.qty), 0);
    const displayName = customerLabel(customer);

    if (compact) {
      return `<tr><td><strong>#${order.id}</strong></td><td>${escapeHtml(displayName)}</td><td>${escapeHtml(order.type)}</td><td><strong>${money.format(orderTotal(order))}</strong></td><td>${statusBadge(order.status)}</td></tr>`;
    }

    return `<tr>
      <td><strong>#${order.id}</strong></td>
      <td>${formatDate(order.createdAt)}</td>
      <td>${escapeHtml(displayName)}</td>
      <td>${items}</td>
      <td>${escapeHtml(order.type)}</td>
      <td><strong>${money.format(orderTotal(order))}</strong></td>
      <td>${escapeHtml(order.payment)}</td>
      <td><select class="select order-status" data-id="${order.id}">${['Novo','Em preparo','Pronto','Saiu para entrega','Concluído','Cancelado'].map(status => `<option ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></td>
      <td><div class="row-actions">
        <button class="row-action" data-print-order="${order.id}" title="Imprimir pedido">🖨️</button>
        <button class="row-action" data-delete-order="${order.id}" title="Excluir">🗑️</button>
      </div></td>
    </tr>`;
  };

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-print-order]');
    if (!button) return;
    printOrder(Number(button.dataset.printOrder));
  });

  renderAll();
})();