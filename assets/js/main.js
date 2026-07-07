const menuButton = document.querySelector('.menu-button');
const globalNav = document.getElementById('global-nav');

if (menuButton && globalNav) {
  const menuIcon = menuButton.querySelector('.material-symbols-outlined');
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    globalNav.classList.remove('is-open');
    if (menuIcon) menuIcon.textContent = 'menu';
  };

  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    globalNav.classList.toggle('is-open', !expanded);
    if (menuIcon) menuIcon.textContent = expanded ? 'menu' : 'close';
  });

  globalNav.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener('click', (event) => {
    if (!globalNav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMenu();
  });
}

const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    // 現段階では入力内容を送信せず、確認用の完了ページへ移動するだけ
    window.location.href = './thanks.html';
  });
}

const designForm = document.getElementById('lp-design-form');

if (designForm) {
  const paidOptions = designForm.querySelectorAll('.paid-option');
  const selectedOptions = document.getElementById('selected-options');
  const estimatePrice = document.getElementById('estimate-price');
  const pageSections = document.getElementById('page-sections');
  const submitMessage = document.getElementById('submit-message');
  const estimateInput = document.getElementById('estimate-input');
  const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]);

  const updateEstimate = () => {
    const checkedOptions = [...paidOptions].filter((option) => option.checked);
    const total = checkedOptions.reduce((sum, option) => sum + Number(option.dataset.price), 0);

    selectedOptions.innerHTML = checkedOptions.length
      ? checkedOptions.map((option) => `<li>${option.value}（+${Number(option.dataset.price).toLocaleString('ja-JP')}円）</li>`).join('')
      : '<li>選択されていません</li>';
    estimatePrice.textContent = `${total.toLocaleString('ja-JP')}円`;
    estimateInput.value = estimatePrice.textContent;
  };

  paidOptions.forEach((option) => option.addEventListener('change', updateEstimate));

  designForm.querySelectorAll('[name="page_plan"]').forEach((option) => {
    option.addEventListener('change', () => {
      pageSections.hidden = option.value !== '自分で指定する' || !option.checked;
    });
  });

  designForm.addEventListener('submit', (event) => {
    if (!designForm.checkValidity()) {
      event.preventDefault();
      designForm.reportValidity();
      return;
    }

    // 仮のFORM_IDが残っている間だけ送信せず、画面内に確認内容を表示します。
    if (!designForm.action.endsWith('/FORM_ID')) {
      return;
    }

    event.preventDefault();
    const serviceName = designForm.elements.service_name.value;
    const industry = designForm.elements.industry.value;
    const goal = designForm.querySelector('[name="lp_goal"]:checked').value;

    submitMessage.innerHTML = `
      <strong>入力内容を確認しました。送信機能は現在準備中です。</strong>
      <span>FormspreeのフォームIDを設定すると、この内容を送信できます。</span>
      <dl><div><dt>店名・サービス名</dt><dd>${escapeHtml(serviceName)}</dd></div><div><dt>業種</dt><dd>${escapeHtml(industry)}</dd></div><div><dt>LPの目的</dt><dd>${escapeHtml(goal)}</dd></div><div><dt>概算制作費</dt><dd>${estimatePrice.textContent}</dd></div></dl>
    `;
    submitMessage.hidden = false;
    submitMessage.focus();
  });
}

const precheckInputs = document.querySelectorAll('.precheck-input');
const precheckButton = document.getElementById('precheck-button');
const precheckStatus = document.getElementById('precheck-status');

if (precheckInputs.length && precheckButton && precheckStatus) {
  const updatePrecheck = () => {
    const isComplete = [...precheckInputs].every((input) => input.checked);

    precheckButton.classList.toggle('is-disabled', !isComplete);
    precheckButton.setAttribute('aria-disabled', String(!isComplete));
    precheckButton.tabIndex = isComplete ? 0 : -1;
    precheckStatus.textContent = isComplete
      ? '確認が完了しました。本申し込みフォームへ進めます。'
      : 'すべての項目をご確認ください。';
  };

  precheckInputs.forEach((input) => input.addEventListener('change', updatePrecheck));
  precheckButton.addEventListener('click', (event) => {
    if (precheckButton.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
    }
  });
}
