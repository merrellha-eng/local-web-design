const menuButton = document.querySelector('.menu-button');
const globalNav = document.getElementById('global-nav');

if (menuButton && globalNav) {
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    globalNav.classList.toggle('is-open', !expanded);
  });

  globalNav.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuButton.setAttribute('aria-expanded', 'false');
      globalNav.classList.remove('is-open');
    }
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
