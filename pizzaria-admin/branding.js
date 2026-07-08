(() => {
  const SYSTEM_NAME = 'Bistrô Pizzaria - Gestão Admininstrativa';
  const OLD_DEFAULT_NAMES = ['Forno & Gestão', 'Forno & Gestão - Administração da Pizzaria'];

  document.title = SYSTEM_NAME;

  const brandTitle = document.querySelector('.brand strong');
  const brandSubtitle = document.querySelector('.brand span');
  if (brandTitle) brandTitle.textContent = 'Bistrô Pizzaria';
  if (brandSubtitle) brandSubtitle.textContent = 'Gestão Admininstrativa';

  if (state?.settings) {
    const currentName = String(state.settings.businessName || '').trim();
    if (!currentName || OLD_DEFAULT_NAMES.includes(currentName)) {
      state.settings.businessName = SYSTEM_NAME;
      saveState();
    }
  }

  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm?.elements.businessName) {
    settingsForm.elements.businessName.value = state.settings.businessName || SYSTEM_NAME;
  }
})();