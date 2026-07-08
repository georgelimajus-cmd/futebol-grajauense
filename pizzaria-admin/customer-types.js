(() => {
  const CUSTOMER_DELIVERY = 'Delivery';
  const CUSTOMER_TABLE = 'Mesa';

  function normalizeCustomer(customer) {
    const customerType = customer.customerType === CUSTOMER_TABLE ? CUSTOMER_TABLE : CUSTOMER_DELIVERY;
    return {
      ...customer,
      customerType,
      tableNumber: customerType === CUSTOMER_TABLE ? String(customer.tableNumber || '') : ''
    };
  }

  function customerDisplay(customer) {
    if (!customer) return 'Balcão';
    if (customer.customerType === CUSTOMER_TABLE) {
      const table = customer.tableNumber ? `Mesa ${customer.tableNumber}` : 'Mesa';
      return `${table} — ${customer.name}`;
    }
    return customer.name;
  }

  function customerTypeBadge(customer) {
    return customer.customerType === CUSTOMER_TABLE
      ? '<span class="status-badge status-pronto">Cliente Mesa</span>'
      : '<span class="status-badge status-concluído">Cliente Delivery</span>';
  }

  function syncCustomerFormType(form) {
    if (!form) return;
    const type = form.elements.customerType?.value || CUSTOMER_DELIVERY;
    const isTable = type === CUSTOMER_TABLE;
    const tableField = form.querySelector('#customerTableField');
    const addressField = form.querySelector('#customerAddressField');
    const tableInput = form.elements.tableNumber;
    const phoneInput = form.elements.phone;

    if (tableField) tableField.hidden = !isTable;
    if (addressField) addressField.hidden = isTable;
    if (tableInput) {
      tableInput.required = isTable;
      if (!isTable) tableInput.value = '';
    }
    if (phoneInput) phoneInput.required = !isTable;
  }

  // Migração não destrutiva: clientes antigos passam a ser Delivery.
  state.customers = state.customers.map(normalizeCustomer);
  saveState();

  // Atualiza o cabeçalho da listagem sem alterar a estrutura base do sistema.
  const customerHeader = document.querySelector('#view-customers thead tr');
  if (customerHeader) {
    customerHeader.innerHTML = '<th>Cliente</th><th>Tipo</th><th>Mesa</th><th>Telefone</th><th>Endereço</th><th>Pedidos</th><th>Total gasto</th><th></th>';
  }

  customerForm = function customerFormWithType(customer = {}) {
    const c = normalizeCustomer(customer);
    const isTable = c.customerType === CUSTOMER_TABLE;
    return `<form id="customerForm" class="form-grid">
      <input type="hidden" name="id" value="${c.id || ''}">
      <label class="field full"><span>Nome</span><input name="name" required value="${escapeHtml(c.name || '')}"></label>
      <label class="field"><span>Tipo de cliente</span><select name="customerType">
        <option value="${CUSTOMER_DELIVERY}" ${!isTable ? 'selected' : ''}>Cliente Delivery</option>
        <option value="${CUSTOMER_TABLE}" ${isTable ? 'selected' : ''}>Cliente Mesa</option>
      </select></label>
      <label class="field"><span>Telefone</span><input name="phone" ${!isTable ? 'required' : ''} value="${escapeHtml(c.phone || '')}" placeholder="Opcional para cliente de mesa"></label>
      <label class="field" id="customerTableField" ${!isTable ? 'hidden' : ''}><span>Número da mesa</span><input name="tableNumber" type="number" min="1" step="1" ${isTable ? 'required' : ''} value="${escapeHtml(c.tableNumber || '')}" placeholder="Ex.: 12"></label>
      <label class="field full" id="customerAddressField" ${isTable ? 'hidden' : ''}><span>Endereço de entrega</span><input name="address" value="${escapeHtml(c.address || '')}"></label>
      <div class="form-actions full"><button type="button" class="secondary-button" data-close-modal>Cancelar</button><button class="primary-button">Salvar cliente</button></div>
    </form>`;
  };

  renderCustomers = function renderCustomersWithType() {
    const q = (document.getElementById('customerSearch')?.value || '').toLowerCase();
    const list = state.customers.filter(customer => {
      const c = normalizeCustomer(customer);
      return [c.name, c.phone, c.address, c.customerType, c.tableNumber]
        .some(value => String(value || '').toLowerCase().includes(q));
    });

    document.getElementById('customersBody').innerHTML = list.map(rawCustomer => {
      const c = normalizeCustomer(rawCustomer);
      const stats = customerStats(c.id);
      const table = c.customerType === CUSTOMER_TABLE && c.tableNumber
        ? `<strong>Mesa ${escapeHtml(c.tableNumber)}</strong>`
        : '—';
      const address = c.customerType === CUSTOMER_DELIVERY
        ? escapeHtml(c.address || 'Não informado')
        : 'Atendimento no salão';
      return `<tr>
        <td><strong>${escapeHtml(c.name)}</strong></td>
        <td>${customerTypeBadge(c)}</td>
        <td>${table}</td>
        <td>${escapeHtml(c.phone || '—')}</td>
        <td>${address}</td>
        <td>${stats.count}</td>
        <td><strong>${money.format(stats.total)}</strong></td>
        <td><div class="row-actions"><button class="row-action" data-edit-customer="${c.id}" title="Editar">✏️</button><button class="row-action" data-delete-customer="${c.id}" title="Excluir">🗑️</button></div></td>
      </tr>`;
    }).join('') || emptyRow(8, 'Nenhum cliente encontrado.');
  };

  orderRow = function orderRowWithCustomerType(order, compact = false) {
    const customer = customerById(order.customerId);
    const items = order.items.reduce((sum, item) => sum + Number(item.qty), 0);
    const displayName = customerDisplay(customer);
    if (compact) {
      return `<tr><td><strong>#${order.id}</strong></td><td>${escapeHtml(displayName)}</td><td>${escapeHtml(order.type)}</td><td><strong>${money.format(orderTotal(order))}</strong></td><td>${statusBadge(order.status)}</td></tr>`;
    }
    return `<tr><td><strong>#${order.id}</strong></td><td>${formatDate(order.createdAt)}</td><td>${escapeHtml(displayName)}</td><td>${items}</td><td>${escapeHtml(order.type)}</td><td><strong>${money.format(orderTotal(order))}</strong></td><td>${escapeHtml(order.payment)}</td><td><select class="select order-status" data-id="${order.id}">${['Novo','Em preparo','Pronto','Saiu para entrega','Concluído','Cancelado'].map(status => `<option ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></td><td><div class="row-actions"><button class="row-action" data-delete-order="${order.id}" title="Excluir">🗑️</button></div></td></tr>`;
  };

  openOrderModal = function openOrderModalWithCustomerType() {
    orderDraftItems = [];
    openModal('Novo pedido', 'Cadastre os itens e os dados da venda.', `<form id="orderForm" class="form-grid">
      <label class="field"><span>Cliente</span><select name="customerId" required><option value="">Selecione</option>${state.customers.map(rawCustomer => {
        const c = normalizeCustomer(rawCustomer);
        return `<option value="${c.id}">${escapeHtml(customerDisplay(c))} — ${c.customerType === CUSTOMER_TABLE ? 'Cliente Mesa' : 'Cliente Delivery'}</option>`;
      }).join('')}</select></label>
      <label class="field"><span>Tipo do pedido</span><select name="type"><option>Entrega</option><option>Retirada</option><option>Balcão</option></select></label>
      <label class="field"><span>Pagamento</span><select name="payment"><option>PIX</option><option>Cartão</option><option>Dinheiro</option></select></label>
      <label class="field"><span>Status inicial</span><select name="status"><option>Novo</option><option>Em preparo</option></select></label>
      <div class="field full"><span>Adicionar item</span><div class="order-item-builder"><select id="draftProduct">${state.products.filter(product => product.active).map(product => `<option value="${product.id}">${escapeHtml(product.name)} — ${money.format(product.price)}</option>`).join('')}</select><input id="draftQty" type="number" min="1" value="1"><button type="button" class="secondary-button" id="addDraftItem">Adicionar</button></div><div id="draftItemsPreview" class="order-items-preview"></div><div class="order-total"><span>Total estimado</span><span id="draftTotal">${money.format(0)}</span></div></div>
      <div class="form-actions full"><button type="button" class="secondary-button" data-close-modal>Cancelar</button><button type="submit" class="primary-button">Salvar pedido</button></div>
    </form>`);
    renderDraftItems();
  };

  // Intercepta o salvamento do cliente antes do listener original.
  document.addEventListener('submit', event => {
    const form = event.target;
    if (form.id !== 'customerForm') return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const fd = new FormData(form);
    const id = Number(fd.get('id'));
    const customerType = fd.get('customerType') === CUSTOMER_TABLE ? CUSTOMER_TABLE : CUSTOMER_DELIVERY;
    const tableNumber = customerType === CUSTOMER_TABLE ? String(fd.get('tableNumber') || '').trim() : '';

    if (customerType === CUSTOMER_TABLE && !tableNumber) {
      toast('Informe o número da mesa.');
      form.elements.tableNumber?.focus();
      return;
    }

    const data = {
      id: id || nextId(state.customers),
      name: String(fd.get('name') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      address: customerType === CUSTOMER_DELIVERY ? String(fd.get('address') || '').trim() : '',
      customerType,
      tableNumber
    };

    const index = state.customers.findIndex(customer => Number(customer.id) === id);
    if (index >= 0) state.customers[index] = data;
    else state.customers.push(data);

    saveState();
    closeModal();
    renderAll();
    toast(customerType === CUSTOMER_TABLE ? `Cliente da Mesa ${tableNumber} salvo.` : 'Cliente Delivery salvo.');
  }, true);

  document.addEventListener('change', event => {
    if (event.target.matches('#customerForm [name="customerType"]')) {
      syncCustomerFormType(event.target.form);
    }

    if (event.target.matches('#orderForm [name="customerId"]')) {
      const customer = customerById(Number(event.target.value));
      const typeSelect = event.target.form?.elements.type;
      if (customer && typeSelect) {
        typeSelect.value = customer.customerType === CUSTOMER_TABLE ? 'Balcão' : 'Entrega';
        renderDraftItems();
      }
    }
  });

  // Garante que a nova visualização seja aplicada após a migração.
  renderAll();
})();