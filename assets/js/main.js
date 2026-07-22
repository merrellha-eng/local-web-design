const menuButton = document.querySelector('.menu-button');
const globalNav = document.getElementById('global-nav');
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  designForm.noValidate = true;

  const formProgress = document.querySelector('[data-form-progress]');
  const formSteps = [...designForm.querySelectorAll('.form-step')];

  if (formProgress && formSteps.length) {
    const progressCount = formProgress.querySelector('[data-progress-count]');
    const progressRemainingPrefix = formProgress.querySelector('[data-progress-remaining-prefix]');
    const progressRemaining = formProgress.querySelector('[data-progress-remaining]');
    const progressRemainingSuffix = formProgress.querySelector('[data-progress-remaining-suffix]');
    const progressFinal = formProgress.querySelector('[data-progress-final]');
    const progressTrack = formProgress.querySelector('[data-progress-track]');
    const progressBar = formProgress.querySelector('[data-progress-bar]');

    const getRequiredGroups = () => {
      const groups = new Map();
      const requiredControls = formSteps.flatMap((step) => [...step.querySelectorAll('input[required], select[required], textarea[required]')]);

      requiredControls.forEach((control) => {
        if (control.disabled) return;

        const isChoice = control instanceof HTMLInputElement && ['radio', 'checkbox'].includes(control.type);
        const key = isChoice ? `choice:${control.name}` : `control:${control.name || control.id}`;
        if (groups.has(key)) return;

        const controls = isChoice
          ? [...designForm.elements].filter((item) => item instanceof HTMLInputElement && item.name === control.name && !item.disabled)
          : [control];
        groups.set(key, controls);
      });

      return [...groups.values()];
    };

    const isGroupComplete = (controls) => {
      const firstControl = controls[0];
      if (firstControl instanceof HTMLInputElement && ['radio', 'checkbox'].includes(firstControl.type)) {
        return controls.some((control) => control.checked);
      }

      return firstControl.value.trim() !== '' && firstControl.validity.valid;
    };

    const updateProgress = () => {
      const requiredGroups = getRequiredGroups();
      const totalItems = requiredGroups.length;
      const completedItems = requiredGroups.filter(isGroupComplete).length;
      const remainingItems = totalItems - completedItems;
      const percentage = totalItems ? (completedItems / totalItems) * 100 : 0;

      if (progressCount) progressCount.textContent = `${completedItems} / ${totalItems}`;
      if (progressRemaining) progressRemaining.textContent = String(remainingItems);
      if (progressRemainingPrefix) progressRemainingPrefix.hidden = !remainingItems;
      if (progressRemaining) progressRemaining.hidden = !remainingItems;
      if (progressRemainingSuffix) progressRemainingSuffix.hidden = !remainingItems;
      if (progressFinal) progressFinal.hidden = Boolean(remainingItems);
      if (progressBar) progressBar.style.width = `${percentage}%`;
      if (progressTrack) {
        progressTrack.setAttribute('aria-valuemax', String(totalItems));
        progressTrack.setAttribute('aria-valuenow', String(completedItems));
        progressTrack.setAttribute('aria-valuetext', `必須項目${totalItems}件中${completedItems}件入力済み`);
      }
    };

    designForm.addEventListener('input', updateProgress);
    designForm.addEventListener('change', updateProgress);
    updateProgress();
  }

  const pageSections = document.getElementById('page-sections');
  const pageStructureOptions = [...designForm.querySelectorAll('[name="掲載したいページ構成"]')];
  const updatePageSections = () => {
    const selectedOption = pageStructureOptions.find((option) => option.checked);
    if (pageSections) pageSections.hidden = selectedOption?.value !== '自分で指定する';
  };

  pageStructureOptions.forEach((option) => option.addEventListener('change', updatePageSections));
  updatePageSections();

  const setupExclusiveCheckboxChoices = (selector, exclusiveValues) => {
    const options = [...designForm.querySelectorAll(selector)];

    options.forEach((option) => {
      option.addEventListener('change', () => {
        if (!option.checked) return;

        if (exclusiveValues.includes(option.value)) {
          options.forEach((otherOption) => {
            if (otherOption !== option) otherOption.checked = false;
          });
          return;
        }

        options.forEach((otherOption) => {
          if (exclusiveValues.includes(otherOption.value)) otherOption.checked = false;
        });
      });
    });
  };

  setupExclusiveCheckboxChoices('[name="主にHPを見てほしい方[]"]', ['未定・おまかせ']);
  setupExclusiveCheckboxChoices('[name="用意できる写真[]"]', ['用意できる写真はない', 'まだ分からない・相談したい']);
  setupExclusiveCheckboxChoices('[name="用意できるその他の資料[]"]', ['用意できる資料はない']);

  const colorOptions = [...designForm.querySelectorAll('[name="希望するメインカラー"]')];
  const colorDetailField = document.getElementById('color-detail-field');
  const colorDetailInput = colorDetailField?.querySelector('input');
  const updateColorDetail = () => {
    const hasSpecifiedColor = colorOptions.some((option) => option.checked && option.value === '使用したい色が決まっている');

    if (colorDetailField) colorDetailField.hidden = !hasSpecifiedColor;
    if (colorDetailInput) {
      colorDetailInput.required = hasSpecifiedColor;
      if (!hasSpecifiedColor) colorDetailInput.value = '';
    }
  };

  colorOptions.forEach((option) => option.addEventListener('change', updateColorDetail));
  updateColorDetail();

  const setupPriorityChoices = ({ options, delegatedOption, priorityInputs, labels }) => {
    if (!options.length) return;

    let priority = options.filter((option) => option !== delegatedOption && option.checked);

    options.forEach((option) => {
      if (option === delegatedOption) return;

      const rank = document.createElement('b');
      rank.className = 'choice-rank';
      rank.hidden = true;
      option.nextElementSibling.append(rank);
    });

    const updateOptions = () => {
      priority = priority.filter((option) => option.checked);

      options.forEach((option) => {
        if (option === delegatedOption) return;

        const priorityIndex = priority.indexOf(option);
        const rank = option.nextElementSibling.querySelector('.choice-rank');
        option.disabled = priority.length >= 3 && !option.checked;
        rank.hidden = priorityIndex < 0;
        rank.textContent = priorityIndex < 0 ? '' : labels[priorityIndex];
      });

      priorityInputs.forEach((input, index) => {
        if (!input) return;

        const selectedOption = priority[index];
        const delegatedValue = index === 0 && delegatedOption?.checked ? delegatedOption.value : '';
        input.value = selectedOption?.value || delegatedValue;
        input.disabled = !input.value;
      });
    };

    options.forEach((option) => {
      option.addEventListener('change', () => {
        if (option === delegatedOption && option.checked) {
          options.forEach((otherOption) => {
            if (otherOption !== delegatedOption) otherOption.checked = false;
          });
          priority = [];
        } else if (option !== delegatedOption) {
          if (delegatedOption) delegatedOption.checked = false;

          if (option.checked && !priority.includes(option)) {
            priority.push(option);
          } else if (!option.checked) {
            priority = priority.filter((selectedOption) => selectedOption !== option);
          }
        }

        updateOptions();
      });
    });
    updateOptions();
  };

  const moodOptions = [...designForm.querySelectorAll('[name="希望する雰囲気[]"]')];
  setupPriorityChoices({
    options: moodOptions,
    delegatedOption: moodOptions.find((option) => option.value === 'おまかせ'),
    priorityInputs: [1, 2, 3].map((rank) => document.getElementById(`mood-priority-${rank}`)),
    labels: ['第1希望', '第2希望', '第3希望'],
  });

  const actionOptions = [...designForm.querySelectorAll('[name="案内したい連絡・誘導先[]"]')];
  setupPriorityChoices({
    options: actionOptions,
    delegatedOption: actionOptions.find((option) => option.value === 'おまかせ・相談'),
    priorityInputs: [1, 2, 3].map((rank) => document.getElementById(`action-priority-${rank}`)),
    labels: ['メイン', 'サブ1', 'サブ2'],
  });

  const confirmationPanel = document.getElementById('form-confirmation');
  const confirmationContent = document.getElementById('confirmation-content');
  const confirmationBackButton = document.getElementById('confirmation-back-button');
  const confirmationSubmitButton = document.getElementById('confirmation-submit-button');
  const validationMessage = document.getElementById('form-validation-message');
  const turnstileContainer = document.getElementById('turnstile-widget');
  const turnstileStatus = document.getElementById('turnstile-status');
  const confirmationSections = [
    {
      title: 'お客様・事業情報',
      fields: [
        ['お名前（ご担当者名）', 'お名前（ご担当者名）'],
        ['メールアドレス', 'メールアドレス'],
        ['電話番号', '電話番号'],
        ['店名・サービス名', '店名・サービス名'],
        ['業種', '業種'],
        ['HPで実現したいこと', 'HPで実現したいこと'],
        ['主にHPを見てほしい方[]', '主にHPを見てほしい方'],
        ['制作開始の希望時期', '制作開始の希望時期'],
      ],
    },
    {
      title: 'デザインの要望',
      fields: [
        ['参考サイトURL', '参考にしたいサイトのURL'],
        ['参考にしたい部分', '参考にしたい部分'],
        ['希望するメインカラー', '希望するメインカラー'],
        ['使用したい色', '使用したい色'],
        ['希望する雰囲気・第1希望', '希望する雰囲気・第1希望'],
        ['希望する雰囲気・第2希望', '希望する雰囲気・第2希望'],
        ['希望する雰囲気・第3希望', '希望する雰囲気・第3希望'],
        ['メイン画像で見せたいもの', 'メイン画像で見せたいもの'],
        ['3案で比較したいポイント', '3案で比較したいポイント'],
        ['避けたい色・雰囲気', '避けたい色・雰囲気'],
        ['既存デザインとの統一', '既存デザインとの統一'],
        ['その他のデザイン希望', 'その他のデザイン希望'],
      ],
    },
    {
      title: '掲載内容',
      fields: [
        ['提供している商品・サービス', '提供している商品・サービス'],
        ['主力の商品・サービス', '主力の商品・サービス'],
        ['料金・価格帯', '料金・価格帯'],
        ['お客様の悩み・困りごと', 'お客様の悩み・困りごと'],
        ['利用後に期待できること', '利用後に期待できること'],
        ['強み・こだわり・選ばれる理由', '強み・こだわり・選ばれる理由'],
        ['実績・資格・信頼情報', '実績・資格・信頼につながる情報'],
        ['最も目立たせたい内容', '最も目立たせたい内容'],
        ['掲載したいページ構成', '掲載したいページ構成'],
        ['指定するページ構成[]', '指定するページ構成'],
        ['誘導先・メイン', '案内したい誘導先・メイン'],
        ['誘導先・サブ1', '案内したい誘導先・サブ1'],
        ['誘導先・サブ2', '案内したい誘導先・サブ2'],
        ['その他の掲載希望', 'その他の掲載希望'],
      ],
    },
    {
      title: '写真素材',
      fields: [
        ['写真・画像の使用方針', '写真・画像の使用方針'],
        ['用意できる写真[]', '用意できる写真'],
        ['ロゴの用意状況', 'ロゴの用意状況'],
        ['用意できるその他の資料[]', '用意できるその他の資料'],
        ['素材についての補足', '素材についての補足'],
      ],
    },
    {
      title: '制作費・確認事項',
      fields: [
        ['基本制作費（税込）', '制作費（税込）'],
        ['無料対象範囲への同意', '無料対象範囲とお支払い条件'],
        ['個人情報の取り扱いへの同意', '個人情報の取り扱い'],
      ],
    },
  ];
  let confirmedSubmission = false;
  let turnstileWidgetId = null;
  let turnstilePending = false;

  const setTurnstileStatus = (message = '', isError = false) => {
    if (!turnstileStatus) return;
    turnstileStatus.textContent = message;
    turnstileStatus.hidden = !message;
    turnstileStatus.classList.toggle('is-error', isError);
  };

  const resetTurnstileSubmission = (message, isError = false) => {
    turnstilePending = false;
    confirmedSubmission = false;
    confirmationSubmitButton.disabled = false;
    confirmationSubmitButton.textContent = 'この内容を送信する';
    setTurnstileStatus(message, isError);
  };

  const setTurnstileResponse = (token) => {
    let responseField = designForm.querySelector('input[name="cf-turnstile-response"]');
    if (!responseField) {
      responseField = document.createElement('input');
      responseField.type = 'hidden';
      responseField.name = 'cf-turnstile-response';
      designForm.append(responseField);
    }
    responseField.value = token;
  };

  const renderTurnstile = () => {
    if (turnstileWidgetId !== null) return true;
    if (!turnstileContainer || !turnstileContainer.dataset.sitekey || !window.turnstile) return false;

    try {
      turnstileWidgetId = window.turnstile.render(turnstileContainer, {
        sitekey: turnstileContainer.dataset.sitekey,
        action: 'lp_design_application',
        execution: 'execute',
        appearance: 'interaction-only',
        language: 'ja',
        theme: 'light',
        'response-field': false,
        callback: (token) => {
          if (!turnstilePending) return;
          setTurnstileResponse(token);
          confirmedSubmission = true;
          confirmationSubmitButton.textContent = '送信しています…';
          setTurnstileStatus('認証が完了しました。送信しています。');
          designForm.requestSubmit();
        },
        'error-callback': () => {
          resetTurnstileSubmission('認証を完了できませんでした。通信環境をご確認のうえ、もう一度お試しください。', true);
          return true;
        },
        'expired-callback': () => {
          resetTurnstileSubmission('認証の有効期限が切れました。もう一度送信してください。', true);
        },
        'timeout-callback': () => {
          resetTurnstileSubmission('認証がタイムアウトしました。もう一度送信してください。', true);
        },
      });
    } catch {
      turnstileWidgetId = null;
      return false;
    }

    return true;
  };

  const createConfirmationContent = () => {
    if (!confirmationContent) return;

    const formData = new FormData(designForm);
    confirmationContent.replaceChildren();

    confirmationSections.forEach((section) => {
      const sectionElement = document.createElement('section');
      const title = document.createElement('h3');
      const list = document.createElement('dl');

      sectionElement.className = 'confirmation-section';
      title.textContent = section.title;
      list.className = 'confirmation-list';

      section.fields.forEach(([name, label]) => {
        const values = formData.getAll(name)
          .map((value) => String(value).trim())
          .filter(Boolean);
        const item = document.createElement('div');
        const term = document.createElement('dt');
        const description = document.createElement('dd');

        item.className = 'confirmation-item';
        term.textContent = label;
        description.textContent = values.length ? values.join('、') : '未入力';
        description.classList.toggle('is-empty', !values.length);
        item.append(term, description);
        list.append(item);
      });

      sectionElement.append(title, list);
      confirmationContent.append(sectionElement);
    });
  };

  const scrollToElement = (element) => {
    element.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };

  const getValidationContainer = (control) => control.closest('.field, .field-group, .scope-agreement') || control;
  const getInvalidControls = () => [...designForm.elements].filter((control) => (
    control instanceof HTMLInputElement
    || control instanceof HTMLSelectElement
    || control instanceof HTMLTextAreaElement
  ) && !control.disabled && !control.validity.valid);

  const updateValidationState = () => {
    designForm.querySelectorAll('.has-validation-error').forEach((element) => element.classList.remove('has-validation-error'));
    designForm.querySelectorAll('[aria-invalid="true"]').forEach((control) => control.removeAttribute('aria-invalid'));

    const invalidControls = getInvalidControls();
    invalidControls.forEach((control) => {
      control.setAttribute('aria-invalid', 'true');
      getValidationContainer(control).classList.add('has-validation-error');
    });

    if (validationMessage) validationMessage.hidden = invalidControls.length === 0;
    return invalidControls;
  };

  const showValidationErrors = () => {
    designForm.classList.add('validation-attempted');
    const invalidControls = updateValidationState();
    const firstInvalidControl = invalidControls[0];
    if (!firstInvalidControl) return;

    firstInvalidControl.focus({ preventScroll: true });
    scrollToElement(getValidationContainer(firstInvalidControl));
  };

  ['input', 'change'].forEach((eventName) => {
    designForm.addEventListener(eventName, () => {
      if (designForm.classList.contains('validation-attempted')) updateValidationState();
    });
  });

  designForm.addEventListener('submit', (event) => {
    if (confirmedSubmission) return;

    event.preventDefault();

    if (!designForm.checkValidity()) {
      showValidationErrors();
      return;
    }

    designForm.classList.remove('validation-attempted');
    updateValidationState();

    createConfirmationContent();
    designForm.hidden = true;
    confirmationPanel.hidden = false;
    scrollToElement(confirmationPanel);
    confirmationPanel.focus({ preventScroll: true });
  });

  confirmationBackButton?.addEventListener('click', () => {
    if (turnstileWidgetId !== null && window.turnstile) window.turnstile.reset(turnstileWidgetId);
    designForm.querySelector('input[name="cf-turnstile-response"]')?.remove();
    resetTurnstileSubmission();
    confirmationPanel.hidden = true;
    designForm.hidden = false;
    scrollToElement(designForm);
    designForm.querySelector('input, select, textarea')?.focus({ preventScroll: true });
  });

  confirmationSubmitButton?.addEventListener('click', () => {
    if (turnstilePending) return;
    if (!renderTurnstile()) {
      resetTurnstileSubmission('認証機能を読み込めませんでした。ページを再読み込みしてお試しください。', true);
      return;
    }

    turnstilePending = true;
    confirmationSubmitButton.disabled = true;
    confirmationSubmitButton.textContent = '認証しています…';
    setTurnstileStatus('安全に送信するため、セキュリティ確認を行っています。');
    window.turnstile.execute('#turnstile-widget');
  });
}

const fadeinTargets = document.querySelectorAll([
  '.section-title-line',
  '.features-visual',
  '.features-text',
  '.free-design-cta__inner',
  '.portfolio-card',
  '.pricing-card',
  '.pricing-notes',
  '.flow-step',
  '.faq-list details',
  '.check-info-card',
  '.application-conditions',
  '.precheck-card',
  '.form-step',
  '.thanks-panel',
  '.privacy-section',
].join(','));

if (fadeinTargets.length) {
  fadeinTargets.forEach((target, index) => {
    target.classList.add('scroll-fadein');
    target.style.setProperty('--fade-delay', `${Math.min(index % 6, 5) * 60}ms`);
  });

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    fadeinTargets.forEach((target) => target.classList.add('is-visible'));
  } else {
    const fadeinObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08,
    });

    fadeinTargets.forEach((target) => fadeinObserver.observe(target));
  }
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
  updatePrecheck();
}
