// Открытие окна приложения
const appIcons = document.querySelectorAll('.app-icon');
let zIndexCounter = 100;

appIcons.forEach(icon => {
  icon.addEventListener('dblclick', () => {
    const app = icon.dataset.app;
    openAppWindow(app);
  });
});

// Трекинг открытых окон
const openWindows = {};

// Dock: массив закрепленных приложений и временных (открытых)
let dockPinned = JSON.parse(localStorage.getItem('dockApps') || '["notes","browser","settings"]');
function getDockApps() {
  // pinned + открытые (если их нет среди pinned)
  const open = Object.keys(openWindows).filter(app => document.body.contains(openWindows[app]));
  return [...dockPinned, ...open.filter(app => !dockPinned.includes(app))];
}

// Dock: динамический рендер и drag&drop
const dockContainer = document.getElementById('dock');
function renderDock() {
  dockApps = getDockApps();
  dockContainer.innerHTML = '';
  dockApps.forEach(app => {
    const icon = document.createElement('div');
    icon.className = 'dock-icon';
    icon.dataset.app = app;
    icon.draggable = dockPinned.includes(app); // только закрепленные можно таскать
    let imgSrc = getAppIcon(app);
    let alt = getAppTitle(app);
    icon.innerHTML = `<img src="${imgSrc}" alt="${alt}"><div class="dock-dot"></div>`;
    // --- Тултип ---
    icon.addEventListener('mouseenter', e => {
      let tooltip = document.createElement('div');
      tooltip.className = 'dock-tooltip';
      tooltip.textContent = getAppTitle(app);
      document.body.appendChild(tooltip);
      const rect = icon.getBoundingClientRect();
      tooltip.style.left = (rect.left + rect.width/2 - tooltip.offsetWidth/2) + 'px';
      tooltip.style.top = (rect.top - 32) + 'px';
      icon._tooltip = tooltip;
      setTimeout(() => { if (tooltip) tooltip.classList.add('visible'); }, 10);
    });
    icon.addEventListener('mouseleave', e => {
      if (icon._tooltip) {
        icon._tooltip.remove();
        icon._tooltip = null;
      }
    });
    // --- конец тултипа ---
    dockContainer.appendChild(icon);
  });
  makeDockDraggable();
  updateDockDots();
  addDockContextMenu();
}

// Контекстное меню для добавления/удаления из Dock
let contextMenu = document.createElement('div');
contextMenu.style.position = 'absolute';
contextMenu.style.display = 'none';
contextMenu.style.zIndex = 9999;
contextMenu.style.background = '#fff';
contextMenu.style.border = '1px solid #ccc';
contextMenu.style.borderRadius = '8px';
contextMenu.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)';
contextMenu.style.padding = '8px 0';
contextMenu.style.fontSize = '15px';
contextMenu.style.minWidth = '160px';
document.body.appendChild(contextMenu);

function showContextMenu(x, y, items) {
  contextMenu.innerHTML = '';
  items.forEach(item => {
    const el = document.createElement('div');
    el.textContent = item.label;
    el.style.padding = '8px 16px';
    el.style.cursor = 'pointer';
    el.onmouseenter = () => el.style.background = '#f0f0f0';
    el.onmouseleave = () => el.style.background = '';
    el.onclick = () => { contextMenu.style.display = 'none'; item.action(); };
    contextMenu.appendChild(el);
  });
  contextMenu.style.left = x + 'px';
  contextMenu.style.top = y + 'px';
  contextMenu.style.display = 'block';
}
document.addEventListener('click', () => { contextMenu.style.display = 'none'; });

// Добавление в Dock через ПКМ по иконке на рабочем столе
const desktopIcons = document.querySelectorAll('.app-icon');
desktopIcons.forEach(icon => {
  icon.addEventListener('contextmenu', e => {
    e.preventDefault();
    const app = icon.dataset.app;
    if (!dockPinned.includes(app)) {
      showContextMenu(e.pageX, e.pageY, [
        { label: 'Добавить в Dock', action: () => {
          dockPinned.push(app);
          localStorage.setItem('dockApps', JSON.stringify(dockPinned));
          renderDock();
        }}
      ]);
    }
  });
});

// Обновляю addDockContextMenu: нельзя удалить открытое приложение
function addDockContextMenu() {
  dockContainer.querySelectorAll('.dock-icon').forEach(icon => {
    icon.addEventListener('contextmenu', e => {
      e.preventDefault();
      const app = icon.dataset.app;
      const isPinned = dockPinned.includes(app);
      const isOpen = openWindows[app] && document.body.contains(openWindows[app]);
      if (isPinned && !isOpen) {
        showContextMenu(e.pageX, e.pageY, [
          { label: 'Убрать из Dock', action: () => {
            dockPinned = dockPinned.filter(a => a !== app);
            localStorage.setItem('dockApps', JSON.stringify(dockPinned));
            renderDock();
          }}
        ]);
      } else if (isPinned && isOpen) {
        showContextMenu(e.pageX, e.pageY, [
          { label: 'Закройте приложение, чтобы убрать из Dock', action: () => {} }
        ]);
      }
    });
  });
}

// Drag&drop: только закрепленные можно таскать и удалять
function makeDockDraggable() {
  let dragSrc = null;
  let dragging = false;
  dockContainer.querySelectorAll('.dock-icon').forEach(icon => {
    icon.addEventListener('dragstart', e => {
      if (!dockPinned.includes(icon.dataset.app)) { e.preventDefault(); return; }
      dragSrc = icon;
      dragging = true;
      e.dataTransfer.effectAllowed = 'move';
    });
    icon.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    icon.addEventListener('drop', e => {
      e.preventDefault();
      if (dragSrc && dragSrc !== icon) {
        const from = dockPinned.indexOf(dragSrc.dataset.app);
        const to = dockPinned.indexOf(icon.dataset.app);
        if (from !== -1 && to !== -1) {
          dockPinned.splice(to, 0, dockPinned.splice(from, 1)[0]);
          localStorage.setItem('dockApps', JSON.stringify(dockPinned));
          renderDock();
        }
      }
      dragging = false;
    });
  });
  document.addEventListener('dragend', e => {
    if (dragging && dragSrc) {
      const dockRect = dockContainer.getBoundingClientRect();
      if (e.clientY < dockRect.top || e.clientY > dockRect.bottom || e.clientX < dockRect.left || e.clientX > dockRect.right) {
        const app = dragSrc.dataset.app;
        if (dockPinned.includes(app) && !(openWindows[app] && document.body.contains(openWindows[app]))) {
          dockPinned = dockPinned.filter(a => a !== app);
          localStorage.setItem('dockApps', JSON.stringify(dockPinned));
          renderDock();
        }
      }
      dragging = false;
      dragSrc = null;
    }
  });
}

renderDock();

// Dock: клик по иконке (заменить querySelectorAll на делегирование)
dockContainer.addEventListener('click', e => {
  const icon = e.target.closest('.dock-icon');
  if (!icon) return;
  const app = icon.dataset.app;
  if (openWindows[app] && document.body.contains(openWindows[app])) {
    openWindows[app].showWindow && openWindows[app].showWindow();
    openWindows[app].style.zIndex = zIndexCounter++;
    openWindows[app].classList.add('window-bounce');
    setTimeout(() => openWindows[app].classList.remove('window-bounce'), 300);
  } else {
    openAppWindow(app);
  }
});

function updateDockDots() {
  dockApps.forEach(app => {
    const icon = dockContainer.querySelector(`.dock-icon[data-app="${app}"]`);
    const dot = icon.querySelector('.dock-dot');
    if (openWindows[app] && document.body.contains(openWindows[app]) && openWindows[app].style.display !== 'none') {
      dot.classList.add('dock-dot-active');
    } else {
      dot.classList.remove('dock-dot-active');
    }
  });
  saveOpenWindowsState();
}

// --- Добавляю универсальное окно "О приложении" ---
function openAppWindow(app, aboutTarget) {
  // Если окно уже открыто — не открывать второе
  if (openWindows[app] && document.body.contains(openWindows[app])) {
    openWindows[app].showWindow && openWindows[app].showWindow();
    openWindows[app].style.zIndex = zIndexCounter++;
    openWindows[app].classList.add('window-bounce');
    setTimeout(() => openWindows[app].classList.remove('window-bounce'), 300);
    return;
  }
  const windowEl = document.createElement('div');
  windowEl.className = 'window';
  windowEl.style.top = Math.random() * 200 + 80 + 'px';
  windowEl.style.left = Math.random() * 400 + 80 + 'px';
  windowEl.style.zIndex = zIndexCounter++;

  let content = '';
  if (app === 'about') {
    const target = aboutTarget || getActiveApp();
    const title = getAppTitle(target);
    let info = '';
    switch(target) {
      case 'desktop':
        // Вычисляем размер localStorage
        let total = 0;
        for (let i = 0; i < localStorage.length; ++i) {
          const k = localStorage.key(i);
          const v = localStorage.getItem(k);
          total += k.length + (v ? v.length : 0);
        }
        const localStorageKB = Math.round(total / 1024);
        info = `Это рабочий стол ЖестьOS. Здесь вы можете размещать ярлыки приложений и управлять окнами.<br><br><b>Разрешение экрана:</b> ${window.innerWidth} x ${window.innerHeight}<br><b>Размер localStorage:</b> ${localStorageKB} КБ`;
        break;
      case 'notes': info = 'Заметки — простое приложение для создания и хранения ваших заметок. Все данные сохраняются в браузере.'; break;
      case 'browser': info = 'Браузер — минималистичный веб-браузер внутри ЖестьOS.'; break;
      case 'settings': info = 'Настройки — здесь можно менять тему, обои, а также параметры Firebase.'; break;
      case 'smile-chat': info = 'ЖестьМесседж — чат с поддержкой Firestore и аватарками.'; break;
      case 'smile-editor': info = 'ЖестьСМАЙЛЫ — редактор аватарок для вашего профиля.'; break;
      case 'system-monitor': info = 'Мониторинг — приложение для мониторинга системы.'; break;
      default: info = 'Это приложение для ЖестьOS.';
    }
    content = `<div style='padding:32px 24px 24px 24px; text-align:center;'>
      <div style='font-size:28px; font-weight:600; margin-bottom:12px;'>О приложении «${title}»</div>
      <div style='font-size:16px; color:#444; margin-bottom:18px;'>${info}</div>
      <button style='margin-top:12px; padding:8px 28px; border-radius:8px; border:none; background:#e6eaff; color:#007aff; font-size:15px; cursor:pointer;' onclick='this.closest(".window").remove()'>Закрыть</button>
    </div>`;
  } else if (app === 'settings') {
    content = `
      <div class="settings-app">
        <div class="settings-user">
          <img class="settings-avatar" src="https://i.pravatar.cc/80?u=macosdemo" alt="avatar">
          <div class="settings-username">Пользователь</div>
        </div>
        <div class="settings-section">
          <div class="settings-title">Внешний вид</div>
          <label class="settings-row">
            <span>Обои рабочего стола:</span>
            <input type="text" id="wallpaper-url" placeholder="Вставьте ссылку на картинку" style="width: 100%;"/>
          </label>
          <button id="apply-settings">Применить</button>
        </div>
        <div class="settings-section">
          <div class="settings-title">Настройки базы данных Firebase</div>
          <label class="settings-row">
            <span>apiKey:</span>
            <input type="text" id="firebase-apiKey" />
          </label>
          <label class="settings-row">
            <span>authDomain:</span>
            <input type="text" id="firebase-authDomain" />
          </label>
          <label class="settings-row">
            <span>databaseURL:</span>
            <input type="text" id="firebase-databaseURL" />
          </label>
          <label class="settings-row">
            <span>projectId:</span>
            <input type="text" id="firebase-projectId" />
          </label>
          <label class="settings-row">
            <span>storageBucket:</span>
            <input type="text" id="firebase-storageBucket" />
          </label>
          <label class="settings-row">
            <span>messagingSenderId:</span>
            <input type="text" id="firebase-messagingSenderId" />
          </label>
          <label class="settings-row">
            <span>appId:</span>
            <input type="text" id="firebase-appId" />
          </label>
          <label class="settings-row">
            <span>measurementId:</span>
            <input type="text" id="firebase-measurementId" />
          </label>
          <button id="save-firebase">Сохранить Firebase</button>
        </div>
        <div class="settings-section">
          <div class="settings-title">Технические характеристики устройства</div>
          <div class="settings-row"><span>Разрешение экрана:</span><span id="device-resolution"></span></div>
          <div class="settings-row"><span>Версия ЖестьOS:</span><span id="device-os"></span></div>
        </div>
        <div class="settings-section">
          <div class="settings-title">Сохранение в ЖестьКлауд</div>
          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="desktopAppPositions"> Позиции иконок</label></div>
          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="notesAppNotes"> Заметки</label></div>
          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="notesAppSelectedId"> Выделенная заметка</label></div>
          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="settingsApp"> Настройки</label></div>
          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="browserHistory"> История браузера</label></div>
          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="browserTabs"> Вкладки браузера</label></div>
          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="browserActiveTabId"> Активная вкладка</label></div>
          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="openWindowsState"> Открытые окна</label></div>
          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="windowSizes"> Размеры окон</label></div>
          <div class="settings-row" style="gap:12px;">
            <button id="cloud-save-btn">Сохранить в ЖестьКлауд</button>
            <button id="cloud-restore-btn">Восстановить из ЖестьКлауд</button>
            <label style="font-size:14px;"><input type="checkbox" id="cloud-auto-restore"> Автоматически при входе</label>
          </div>
          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="storeInstalledApps"> Установленные приложения</label></div>
        </div>
      </div>
    `;
  } else if (app === 'notes') {
    content = `<div class="notes-app">
      <div class="notes-sidebar">
        <div class="notes-header">
          <span>Заметки</span>
          <button class="notes-add">+</button>
        </div>
        <input class="notes-search" placeholder="Поиск..." />
        <div class="notes-list"></div>
      </div>
      <div class="notes-main">
        <input class="notes-title" placeholder="Заголовок" />
        <textarea class="notes-body" placeholder="Текст заметки..."></textarea>
        <button class="notes-delete">Удалить</button>
      </div>
    </div>`;
  } else if (app === 'login') {
    content = `<div class="login-app">
      <div class="login-title">Вход в систему</div>
      <div class="login-form">
        <input class="login-email" type="email" placeholder="логин" autocomplete="username" />
        <input class="login-password" type="password" placeholder="Пароль" autocomplete="current-password" />
        <button class="login-submit">Войти</button>
        <div class="login-or">или</div>
        <button class="login-google">Войти через Google</button>
      </div>
    </div>`;
  } else if (app === 'smile-editor') {
    const avatarCode = localStorage.getItem('userAvatarCode') || generateRandomAvatarCode();
    const colorOptions = Object.entries(avatarColors).map(([k, v]) => `<button class='smile-color' data-color='${k}' style='background:${v}'></button>`).join('');
    const shapeOptions = Object.entries(avatarShapes).map(([k, v]) => `<button class='smile-shape' data-shape='${k}'>${v}</button>`).join('');
    content = `<div class='smile-editor-app'>
      <div class='smile-preview'></div>
      <div class='smile-controls'>
        <div>Цвет 1: ${colorOptions}</div>
        <div>Форма: ${shapeOptions}</div>
        <div>Цвет 2: ${colorOptions}</div>
        <button class='smile-random'>🎲 Случайная</button>
        <button class='smile-save'>Сохранить</button>
      </div>
    </div>`;
  } else if (app === 'smile-chat') {
    content = `<div class="smile-chat-app">
      <div class="smile-chat-categories">
        <button class="smile-chat-category active" data-tab="general" title="Общий чат">💬</button>
        <button class="smile-chat-category" data-tab="private" title="Личные">👤</button>
        <button class="smile-chat-category" data-tab="my" title="Мои чаты">⭐</button>
      </div>
      <div class="smile-chat-users"></div>
      <div class="smile-chat-main">
        <div class="smile-chat-messages"></div>
        <form class="smile-chat-form">
          <input class="smile-chat-input" type="text" placeholder="Введите сообщение..." autocomplete="off" />
          <button class="smile-chat-send">Отправить</button>
        </form>
      </div>
    </div>`;
  } else if (app === 'system-monitor') {
    content = `
      <div class="system-monitor-app">
        <div class="system-monitor-tabs">
          <button class="system-monitor-tab active" data-tab="processes">Процессы</button>
          <button class="system-monitor-tab" data-tab="cpu">CPU</button>
          <button class="system-monitor-tab" data-tab="memory">Память</button>
          <button class="system-monitor-tab" data-tab="storage">Хранилище</button>
        </div>
        <div class="system-monitor-content">
          <!-- Содержимое вкладки будет подгружаться -->
        </div>
      </div>
    `;
  } else if (app === 'browser') {
    content = `
      <div class="browser-app" style="display:flex; flex-direction:column; height:100%; min-width:520px; background:#f7f7fa;">
        <div class="browser-tabs-bar" style="display:flex; align-items:flex-end; background:#ececec; border-bottom:1px solid #e0e0e0; padding:0 8px; gap:2px; min-height:38px;"></div>
        <div class="browser-tabs-content" style="flex:1; position:relative;"></div>
      </div>
    `;
  } else if (app === 'store') {
    content = `
      <div class="store-app" style="padding:0; height:100%; display:flex; flex-direction:column;">
        <div class="store-tabs" style="display:flex; border-bottom:1px solid #e0e0e0;">
          <button class="store-tab active" data-tab="get" style="flex:1; padding:16px; font-size:17px; background:#f7f7fa; border:none; cursor:pointer;">Получить</button>
          <button class="store-tab" data-tab="installed" style="flex:1; padding:16px; font-size:17px; background:#f7f7fa; border:none; cursor:pointer;">Установлено</button>
        </div>
        <div class="store-content" style="flex:1; overflow:auto; background:#fff; padding:24px;"></div>
      </div>
    `;
  } else {
    content = `<p>Это окно приложения <b>${getAppTitle(app)}</b>.</p>`;
  }

  // Если приложение установлено из магазина и есть code — вставить его как content
  const installedApps = JSON.parse(localStorage.getItem('storeInstalledApps') || '[]');
  const foundApp = installedApps.find(a => a.id === app);
  if (foundApp && foundApp.code) {
    content = foundApp.code;
  }

  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <div class="window-dot window-close-dot" title="Закрыть"></div>
        <div class="window-dot window-min-dot" title="Свернуть"></div>
        <div class="window-dot window-max-dot" title="Развернуть"></div>
      </div>
      <div class="window-title">${getAppTitle(app)}</div>
    </div>
    <div class="window-content">
      ${content}
    </div>
    <div class="window-resize window-resize-right"></div>
    <div class="window-resize window-resize-bottom"></div>
    <div class="window-resize window-resize-corner"></div>
  `;

  // Если кастомное приложение — выполнить все <script> внутри .window-content
  if (foundApp && foundApp.code) {
    const winContent = windowEl.querySelector('.window-content');
    if (winContent) {
      winContent.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        if (oldScript.src) newScript.src = oldScript.src;
        if (oldScript.type) newScript.type = oldScript.type;
        newScript.textContent = oldScript.textContent;
        oldScript.replaceWith(newScript);
      });
    }
  }
  windowEl.dataset.app = app; // Добавляем атрибут для сохранения размера
  windowEl.dataset.icon = getAppIcon(app);
  windowEl.dataset.title = getAppTitle(app);

  document.body.appendChild(windowEl);
  openWindows[app] = windowEl;
  bringWindowToFront(windowEl);
  // Восстановление размера окна (до позиционирования)
  const windowSizes = JSON.parse(localStorage.getItem('windowSizes') || '{}');
  if (windowSizes[app]) {
    windowEl.style.width = windowSizes[app].width;
    windowEl.style.height = windowSizes[app].height;
  }
  // Позиция: не за нижней границей экрана
  const dockHeight = 80;
  const menubarHeight = 32;
  const maxHeight = window.innerHeight - dockHeight - menubarHeight;
  if (windowEl.offsetHeight > maxHeight) {
    windowEl.style.height = maxHeight + 'px';
  }
  if (parseInt(windowEl.style.top) < menubarHeight) {
    windowEl.style.top = menubarHeight + 'px';
  }
  let top = Math.random() * 200 + 80;
  let left = Math.random() * 400 + 80;
  if (top > maxHeight) top = maxHeight;
  if (top < 0) top = 0;
  windowEl.style.top = top + 'px';
  windowEl.style.left = left + 'px';
  // GSAP анимация появления
  gsap.fromTo(windowEl, {scale: 0.85, opacity: 0}, {scale: 1, opacity: 1, duration: 0.32, ease: 'power2.out'});
  updateDockDots();
  // Если не закреплено, но открыто — добавить в Dock
  if (!dockPinned.includes(app)) renderDock();

  // Точки управления
  const closeBtn = windowEl.querySelector('.window-close-dot');
  const minBtn = windowEl.querySelector('.window-min-dot');
  const maxBtn = windowEl.querySelector('.window-max-dot');
  closeBtn.onclick = () => {
    // GSAP анимация скрытия
    gsap.to(windowEl, {scale: 0.85, opacity: 0, duration: 0.22, ease: 'power2.in', onComplete: () => {
      windowEl.remove();
      removeWindowFromStack(windowEl);
      if (openWindows[app] === windowEl) delete openWindows[app];
      updateDockDots();
      // Если не закреплено — убрать из Dock
      if (!dockPinned.includes(app)) renderDock();
    }});
  };
  minBtn.onclick = () => {
    genieToDock(windowEl, app, updateDockDots);
  };
  maxBtn.onclick = () => {
    if (!windowEl.classList.contains('window-maximized')) {
      windowEl.dataset.prevLeft = windowEl.style.left;
      windowEl.dataset.prevTop = windowEl.style.top;
      windowEl.dataset.prevWidth = windowEl.style.width;
      windowEl.dataset.prevHeight = windowEl.style.height;
      const dockHeight = 80;
      const menubarHeight = 32;
      gsap.to(windowEl, {
        left: 0,
        top: menubarHeight,
        width: window.innerWidth,
        height: window.innerHeight - dockHeight - menubarHeight,
        borderRadius: 0,
        boxShadow: 'none',
        duration: 0.38,
        ease: 'power2.inOut',
        onStart: () => windowEl.classList.add('window-maximized'),
      });
    } else {
      gsap.to(windowEl, {
        left: windowEl.dataset.prevLeft,
        top: windowEl.dataset.prevTop,
        width: windowEl.dataset.prevWidth,
        height: windowEl.dataset.prevHeight,
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        duration: 0.38,
        ease: 'power2.inOut',
        onComplete: () => windowEl.classList.remove('window-maximized'),
      });
    }
  };
  // Dock click — если окно свернуто, показать
  windowEl.showWindow = () => {
    windowEl.style.display = '';
    windowEl.style.zIndex = zIndexCounter++;
    gsap.fromTo(windowEl, {y: 30, opacity: 0, scale: 0.9, x: 0, scaleX: 1, scaleY: 1}, {y: 0, opacity: 1, scale: 1, x: 0, scaleX: 1, scaleY: 1, duration: 0.22, ease: 'power1.out'});
    updateDockDots();
  };
  // Перетаскивание окна
  makeWindowDraggable(windowEl);
  makeWindowResizable(windowEl);

  // Логика настроек
  if (app === 'settings') {
    initSettingsApp(windowEl);
  }
  // Реализация приложения Заметки
  if (app === 'notes') initNotesApp(windowEl);

  // После добавления окна входа — обработка успешного входа
  if (app === 'login') {
    setTimeout(() => {
      const submitBtn = document.querySelector('.login-submit');
      const googleBtn = document.querySelector('.login-google');
      const emailInput = document.querySelector('.login-email');
      function showLoginSuccess(user) {
        localStorage.setItem('isLoggedIn', 'true');
        let userEmail = '';
        if (user && user.email) {
          userEmail = user.email;
          localStorage.setItem('userEmail', userEmail);
          localStorage.setItem('userName', user.displayName || user.email.split('@')[0]);
        } else {
          userEmail = emailInput.value || 'user@example.com';
          localStorage.setItem('userEmail', userEmail);
          const name = userEmail.split('@')[0];
          localStorage.setItem('userName', name);
        }
        localStorage.removeItem('userAvatarCode'); // сбросить, чтобы получить новую
        showNotification('Вход выполнен успешно!');
        // Закрыть окно входа
        const loginWin = submitBtn.closest('.window');
        if (loginWin) loginWin.remove();
        // Обновить кнопку и имя в настройках, если окно открыто
        const settingsWin = document.querySelector('.window .settings-app');
        if (settingsWin) {
          const win = settingsWin.closest('.window');
          if (win) initSettingsApp(win);
        }
      }
      submitBtn.onclick = () => showLoginSuccess();
      // Реальный Google OAuth через Firebase
      googleBtn.onclick = async function() {
        try {
          initFirebaseFromSettings();
          const provider = new firebase.auth.GoogleAuthProvider();
          const result = await firebase.auth().signInWithPopup(provider);
          const user = result.user;
          showLoginSuccess(user);
        } catch (e) {
          showNotification('Ошибка входа через Google');
        }
      };
    }, 0);
  }
  if (app === 'smile-editor') {
    setTimeout(() => {
      let code = (localStorage.getItem('userAvatarCode') || generateRandomAvatarCode()).split('');
      const userUid = localStorage.getItem('userEmail') || '';
      const preview = document.querySelector('.smile-preview');
      function renderSmile() {
        preview.innerHTML = '';
        preview.appendChild(createAvatarElement(code.join(''), 128));
      }
      renderSmile();
      // Цвет 1
      document.querySelectorAll('.smile-color').forEach((btn, i) => {
        btn.onclick = () => {
          if (btn.parentElement.textContent.includes('Цвет 1')) code[0] = btn.dataset.color;
          else code[2] = btn.dataset.color;
          renderSmile();
        };
      });
      // Форма
      document.querySelectorAll('.smile-shape').forEach(btn => {
        btn.onclick = () => { code[1] = btn.dataset.shape; renderSmile(); };
      });
      // Случайная
      document.querySelector('.smile-random').onclick = () => {
        code = generateRandomAvatarCode().split('');
        renderSmile();
      };
      // Сохранить
      document.querySelector('.smile-save').onclick = async () => {
        if (!userUid) { showNotification('Войдите для сохранения'); return; }
        try {
          await firebase.firestore().collection('avatarka').doc(userUid).set({ code: code.join(''), updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
          localStorage.setItem('userAvatarCode', code.join(''));
          showNotification('Аватарка сохранена!');
          // Обновить в настройках
          const settingsWin = document.querySelector('.window .settings-app');
          if (settingsWin) {
            const win = settingsWin.closest('.window');
            if (win) initSettingsApp(win);
          }
        } catch (e) {
          console.error('Ошибка Firestore (save avatar):', e);
          showNotification('Ошибка Firestore: ' + (e.message || e), 6000);
        }
      };
    }, 0);
  }
  if (app === 'smile-chat') {
    setTimeout(() => {
      initSmileChatApp();
    }, 0);
  }
  if (app === 'system-monitor') {
    setTimeout(() => { initSystemMonitorApp(windowEl); }, 0);
  }
  if (app === 'browser') {
    setTimeout(() => { initBrowserTabs(windowEl); }, 0);
  }
  if (app === 'store') {
    setTimeout(() => {
      const tabs = windowEl.querySelectorAll('.store-tab');
      const content = windowEl.querySelector('.store-content');
      // УДАЛЕНО: Добавление вкладки Dev Lab
      function setTab(tab) {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        if (tab.dataset.tab === 'get') renderGet();
        else if (tab.dataset.tab === 'installed') renderInstalled();
        // УДАЛЕНО: обработка devlab
      }
      tabs.forEach(tab => {
        tab.onclick = () => setTab(tab);
      });
      async function renderGet() {
        content.innerHTML = '<div style="color:#888; padding:16px;">Загрузка...</div>';
        try {
          const apps = [];
          const snap = await firebase.firestore().collection('app').get();
          snap.forEach(doc => {
            const d = doc.data();
            apps.push({id: doc.id, ...d});
          });
          if (!apps.length) {
            content.innerHTML = '<div style="color:#888; padding:16px;">Нет доступных приложений</div>';
            return;
          }
          content.innerHTML = '';
          apps.forEach(app => {
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '18px';
            div.style.marginBottom = '18px';
            div.innerHTML = `<img src="${app.icon || 'https://img.icons8.com/ios-filled/50/000000/application-window.png'}" style="width:48px; height:48px; border-radius:12px; background:#f7f7fa;"> <div style="font-size:18px; font-weight:500;">${app.name || app.id}</div> <button style="margin-left:auto; padding:8px 22px; border-radius:8px; border:none; background:#e6eaff; color:#007aff; font-size:15px; cursor:pointer;">Установить</button>`;
            div.querySelector('button').onclick = () => {
              // Сохраняем приложение в localStorage (установленные)
              let installed = JSON.parse(localStorage.getItem('storeInstalledApps') || '[]');
              if (!installed.some(a => a.id === app.id)) installed.push(app);
              localStorage.setItem('storeInstalledApps', JSON.stringify(installed));
              setTab(tabs[1]);
              updateDesktopAppIcons();
            };
            content.appendChild(div);
          });
        } catch (e) {
          content.innerHTML = '<div style="color:#d33; padding:16px;">Ошибка загрузки приложений</div>';
        }
      }
      function renderInstalled() {
        let installed = JSON.parse(localStorage.getItem('storeInstalledApps') || '[]');
        if (!installed.length) {
          content.innerHTML = '<div style="color:#888; padding:16px;">Нет установленных приложений</div>';
          return;
        }
        content.innerHTML = '';
        installed.forEach(app => {
          const div = document.createElement('div');
          div.style.display = 'flex';
          div.style.alignItems = 'center';
          div.style.gap = '18px';
          div.style.marginBottom = '18px';
          div.innerHTML = `<img src="${app.icon || 'https://img.icons8.com/ios-filled/50/000000/application-window.png'}" style="width:48px; height:48px; border-radius:12px; background:#f7f7fa;"> <div style="font-size:18px; font-weight:500;">${app.name || app.id}</div> <button style="margin-left:auto; padding:8px 22px; border-radius:8px; border:none; background:#e6eaff; color:#007aff; font-size:15px; cursor:pointer;">Запустить</button> <button style="margin-left:12px; padding:8px 18px; border-radius:8px; border:none; background:#ffd6d6; color:#d33; font-size:15px; cursor:pointer;">Удалить</button>`;
          div.querySelector('button').onclick = () => {
            openAppWindow(app.id);
          };
          div.querySelectorAll('button')[1].onclick = () => {
            let installed = JSON.parse(localStorage.getItem('storeInstalledApps') || '[]');
            installed = installed.filter(a => a.id !== app.id);
            localStorage.setItem('storeInstalledApps', JSON.stringify(installed));
            renderInstalled();
            renderDock();
            updateDesktopAppIcons();
          };
          content.appendChild(div);
        });
      }
      // УДАЛЕНО: функция renderDevLab
      setTab(tabs[0]);
    }, 0);
  }
  // Клик по окну — наверх (работает по всему окну, включая содержимое)
  windowEl.addEventListener('mousedown', () => bringWindowToFront(windowEl), true);
}

function getAppTitle(app) {
  // Если приложение установлено из магазина — вернуть его name
  const installedApps = JSON.parse(localStorage.getItem('storeInstalledApps') || '[]');
  const foundApp = installedApps.find(a => a.id === app);
  if (foundApp && foundApp.name) return foundApp.name;
  // ... существующий код ...
  switch(app) {
    case 'desktop': return 'Рабочий стол';
    case 'notes': return 'Заметки';
    case 'browser': return 'Браузер';
    case 'settings': return 'Настройки';
    case 'login': return 'Вход';
    case 'smile-editor': return 'ЖестьСМАЙЛЫ';
    case 'smile-chat': return 'ЖестьМесседж';
    case 'system-monitor': return 'Мониторинг';
    default: return 'Приложение';
  }
}

function getAppIcon(app) {
  // Если приложение установлено из магазина — вернуть его icon
  const installedApps = JSON.parse(localStorage.getItem('storeInstalledApps') || '[]');
  const foundApp = installedApps.find(a => a.id === app);
  if (foundApp && foundApp.icon) return foundApp.icon;
  // ... существующий код ...
  if (app === 'notes') return 'https://img.icons8.com/ios-filled/50/000000/note.png';
  if (app === 'browser') return 'https://img.icons8.com/ios-filled/50/000000/internet.png';
  if (app === 'settings') return 'https://img.icons8.com/ios-filled/50/000000/settings.png';
  if (app === 'smile-chat') return 'https://img.icons8.com/ios-filled/50/000000/speech-bubble-with-dots.png';
  if (app === 'smile-editor') return 'https://img.icons8.com/ios-filled/50/000000/happy--v1.png';
  if (app === 'system-monitor') return 'https://img.icons8.com/ios-filled/50/000000/activity-history.png';
  if (app === 'store') return 'https://img.icons8.com/ios-filled/50/000000/shopping-bag.png';
  return 'https://img.icons8.com/ios-filled/50/000000/application-window.png';
}

function makeWindowDraggable(win) {
  const header = win.querySelector('.window-header');
  let offsetX, offsetY, isDragging = false;

  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    win.style.zIndex = zIndexCounter++;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let left = e.clientX - offsetX;
    let top = e.clientY - offsetY;
    // Ограничения: не выходить за верх и низ (Dock)
    left = Math.max(0, Math.min(left, window.innerWidth - win.offsetWidth));
    const dockHeight = 80;
    const maxTop = window.innerHeight - dockHeight - win.offsetTop;
    top = Math.max(0, Math.min(top, maxTop));
    win.style.left = left + 'px';
    win.style.top = top + 'px';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
  });
}

function makeWindowResizable(win) {
  const minWidth = 320;
  const minHeight = 200;
  const right = win.querySelector('.window-resize-right');
  const bottom = win.querySelector('.window-resize-bottom');
  const corner = win.querySelector('.window-resize-corner');
  let isResizing = false, startX, startY, startW, startH, direction;
  const dockHeight = 80;
  const menubarHeight = 32;

  function onMouseMove(e) {
    if (!isResizing) return;
    let newW = startW, newH = startH;
    if (direction === 'right') {
      newW = Math.max(minWidth, startW + (e.clientX - startX));
      gsap.to(win, {width: newW, duration: 0.12, overwrite: 'auto'});
    } else if (direction === 'bottom') {
      const maxHeight = window.innerHeight - dockHeight - menubarHeight;
      newH = Math.max(minHeight, Math.min(startH + (e.clientY - startY), maxHeight));
      gsap.to(win, {height: newH, duration: 0.12, overwrite: 'auto'});
    } else if (direction === 'corner') {
      newW = Math.max(minWidth, startW + (e.clientX - startX));
      const maxHeight = window.innerHeight - dockHeight - menubarHeight;
      newH = Math.max(minHeight, Math.min(startH + (e.clientY - startY), maxHeight));
      gsap.to(win, {width: newW, height: newH, duration: 0.12, overwrite: 'auto'});
    }
  }
  function onMouseUp() {
    isResizing = false;
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    // Сохраняем размер окна
    const app = win.dataset.app || (win.querySelector('.window-title') && win.querySelector('.window-title').textContent.toLowerCase());
    if (app) {
      const windowSizes = JSON.parse(localStorage.getItem('windowSizes') || '{}');
      windowSizes[app] = {
        width: win.style.width,
        height: win.style.height
      };
      localStorage.setItem('windowSizes', JSON.stringify(windowSizes));
    }
    saveOpenWindowsState();
  }
  [
    [right, 'right'],
    [bottom, 'bottom'],
    [corner, 'corner']
  ].forEach(([el, dir]) => {
    el.addEventListener('mousedown', (e) => {
      isResizing = true;
      direction = dir;
      startX = e.clientX;
      startY = e.clientY;
      startW = win.offsetWidth;
      startH = win.offsetHeight;
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.stopPropagation();
    });
  });
}

function genieToDock(windowEl, app, onComplete) {
  const dockIcon = document.querySelector(`.dock-icon[data-app="${app}"]`);
  if (!dockIcon) {
    if (onComplete) onComplete();
    return;
  }
  const iconRect = dockIcon.getBoundingClientRect();
  const winRect = windowEl.getBoundingClientRect();
  // Центр иконки Dock
  const iconX = iconRect.left + iconRect.width / 2;
  const iconY = iconRect.top + iconRect.height / 2;
  // Центр окна
  const winX = winRect.left + winRect.width / 2;
  const winY = winRect.top + winRect.height / 2;
  // Смещения
  const dx = iconX - winX;
  const dy = iconY - winY;
  // Анимация "джинна"
  gsap.to(windowEl, {
    duration: 0.5,
    ease: 'power2.in',
    scaleX: 0.15,
    scaleY: 0.1,
    x: dx,
    y: dy,
    opacity: 0.2,
    onComplete: () => {
      windowEl.style.display = 'none';
      windowEl.style.transform = '';
      if (onComplete) onComplete();
    }
  });
}

function saveOpenWindowsState() {
  const state = {};
  Object.keys(openWindows).forEach(app => {
    const win = openWindows[app];
    if (!document.body.contains(win)) return;
    state[app] = {
      visible: win.style.display !== 'none',
      left: win.style.left,
      top: win.style.top,
      width: win.style.width,
      height: win.style.height,
      maximized: win.classList.contains('window-maximized')
    };
  });
  localStorage.setItem('openWindowsState', JSON.stringify(state));
}

function loadOpenWindowsState() {
  const state = JSON.parse(localStorage.getItem('openWindowsState') || '{}');
  Object.keys(state).forEach(app => {
    if (state[app].visible) {
      openAppWindow(app);
    }
  });
  // После открытия окон применяем размеры и позиции
  setTimeout(() => {
    Object.keys(state).forEach(app => {
      const win = openWindows[app];
      if (!win) return;
      if (state[app].maximized) {
        win.classList.add('window-maximized');
        win.style.left = '0px';
        win.style.top = '0px';
        win.style.width = window.innerWidth + 'px';
        win.style.height = window.innerHeight + 'px';
        win.style.borderRadius = '0';
        win.style.boxShadow = 'none';
      } else {
        win.classList.remove('window-maximized');
        win.style.left = state[app].left;
        win.style.top = state[app].top;
        win.style.width = state[app].width;
        win.style.height = state[app].height;
        win.style.borderRadius = '';
        win.style.boxShadow = '';
      }
    });
  }, 100);
}

// Drag & drop иконок на рабочем столе
const desktop = document.getElementById('desktop');
const gridSize = 96; // шаг сетки

function loadAppIconPositions() {
  const saved = localStorage.getItem('desktopAppPositions');
  if (!saved) return;
  const positions = JSON.parse(saved);
  document.querySelectorAll('.app-icon').forEach(icon => {
    const app = icon.dataset.app;
    if (positions[app]) {
      icon.style.position = 'absolute';
      icon.style.left = positions[app].left;
      icon.style.top = positions[app].top;
    }
  });
}

function saveAppIconPositions() {
  const positions = {};
  document.querySelectorAll('.app-icon').forEach(icon => {
    const app = icon.dataset.app;
    positions[app] = {
      left: icon.style.left,
      top: icon.style.top
    };
  });
  localStorage.setItem('desktopAppPositions', JSON.stringify(positions));
}

function makeAppIconsDraggable() {
  document.querySelectorAll('.app-icon').forEach(icon => {
    icon.onmousedown = function(e) {
      let shiftX = e.clientX - icon.getBoundingClientRect().left;
      let shiftY = e.clientY - icon.getBoundingClientRect().top;
      icon.style.position = 'absolute';
      icon.style.zIndex = 50;
      function moveAt(pageX, pageY) {
        // Привязка к сетке
        let left = Math.round((pageX - shiftX - desktop.offsetLeft) / gridSize) * gridSize;
        let top = Math.round((pageY - shiftY - desktop.offsetTop) / gridSize) * gridSize;
        // Ограничения по границам рабочего стола
        left = Math.max(0, Math.min(left, desktop.offsetWidth - icon.offsetWidth));
        // top: не выше меню-бара (32px)
        const menubarHeight = 32;
        top = Math.max(menubarHeight, Math.min(top, desktop.offsetHeight - icon.offsetHeight));
        // Проверка на занятость позиции
        let overlap = false;
        document.querySelectorAll('.app-icon').forEach(other => {
          if (other === icon) return;
          if (other.style.left === left + 'px' && other.style.top === top + 'px') {
            overlap = true;
          }
        });
        if (!overlap) {
          icon.style.left = left + 'px';
          icon.style.top = top + 'px';
        }
      }
      function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
      }
      document.addEventListener('mousemove', onMouseMove);
      document.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        document.onmouseup = null;
        icon.style.zIndex = '';
        saveAppIconPositions();
      };
      e.preventDefault();
    };
    icon.ondragstart = () => false;
  });
}

// Вызовы сохранения состояния
window.addEventListener('beforeunload', () => {
  saveAppIconPositions();
  saveOpenWindowsState();
});

// После makeAppIconsDraggable и loadAppIconPositions
makeAppIconsDraggable();
loadAppIconPositions();
loadOpenWindowsState(); 
loadOpenWindowsState(); 

// Реализация приложения Заметки
function initNotesApp(win) {
  // DOM элементы
  const sidebar = win.querySelector('.notes-sidebar');
  const list = win.querySelector('.notes-list');
  const addBtn = win.querySelector('.notes-add');
  const search = win.querySelector('.notes-search');
  const title = win.querySelector('.notes-title');
  const body = win.querySelector('.notes-body');
  const delBtn = win.querySelector('.notes-delete');

  // State
  let notes = JSON.parse(localStorage.getItem('notesAppNotes') || '[]');
  let selectedId = localStorage.getItem('notesAppSelectedId') || (notes[0] && notes[0].id) || null;
  let filter = '';

  function save() {
    localStorage.setItem('notesAppNotes', JSON.stringify(notes));
    localStorage.setItem('notesAppSelectedId', selectedId || '');
  }

  function renderList() {
    list.innerHTML = '';
    let filtered = notes.filter(n => n.title.toLowerCase().includes(filter) || n.body.toLowerCase().includes(filter));
    filtered.forEach(note => {
      const item = document.createElement('div');
      item.className = 'notes-list-item' + (note.id === selectedId ? ' selected' : '');
      item.innerHTML = `<div class="item-title">${note.title ? note.title : '<Без названия>'}</div><div class="item-date">${new Date(note.updated).toLocaleString()}</div>`;
      item.onclick = () => { selectedId = note.id; render(); };
      list.appendChild(item);
    });
  }

  function renderEditor() {
    const note = notes.find(n => n.id === selectedId);
    if (!note) {
      title.value = '';
      body.value = '';
      title.disabled = true;
      body.disabled = true;
      delBtn.disabled = true;
      return;
    }
    title.value = note.title;
    body.value = note.body;
    title.disabled = false;
    body.disabled = false;
    delBtn.disabled = false;
  }

  function render() {
    renderList();
    renderEditor();
    save();
  }

  addBtn.onclick = () => {
    const id = 'n' + Date.now();
    const newNote = { id, title: '', body: '', updated: Date.now() };
    notes.unshift(newNote);
    selectedId = id;
    render();
  };
  delBtn.onclick = () => {
    if (!selectedId) return;
    notes = notes.filter(n => n.id !== selectedId);
    if (notes.length) selectedId = notes[0].id; else selectedId = null;
    render();
  };
  title.oninput = () => {
    const note = notes.find(n => n.id === selectedId);
    if (note) { note.title = title.value; note.updated = Date.now(); renderList(); save(); }
  };
  body.oninput = () => {
    const note = notes.find(n => n.id === selectedId);
    if (note) { note.body = body.value; note.updated = Date.now(); renderList(); save(); }
  };
  search.oninput = () => {
    filter = search.value.toLowerCase();
    renderList();
  };
  render();
} 

// --- Аватарки ---
const avatarColors = {
  r: '#ff5f56', g: '#27c93f', b: '#007aff', y: '#ffbd2e', p: '#a259ff', o: '#ff9500', k: '#222', w: '#fff', s: '#eaeaea'
};
const avatarShapes = {
  c: 'circle', s: 'square', d: 'diamond'
};
function generateRandomAvatarCode() {
  const colors = Object.keys(avatarColors);
  const shapes = Object.keys(avatarShapes);
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const color2 = colors[Math.floor(Math.random() * colors.length)];
  return `${color1}${shape}${color2}`;
}
// Принудительно всегда загружать аватарку из Firestore по userUid
async function getUserAvatar(userUid) {
  if (!window.firebase?.firestore) return generateRandomAvatarCode();
  try {
    const db = firebase.firestore();
    const doc = await db.collection('avatarka').doc(userUid).get();
    if (doc.exists && doc.data().code) {
      return doc.data().code;
    } else {
      const newCode = generateRandomAvatarCode();
      await db.collection('avatarka').doc(userUid).set({ code: newCode, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      return newCode;
    }
  } catch (e) {
    console.error('Ошибка Firestore (getUserAvatar):', e);
    showNotification('Ошибка Firestore: ' + (e.message || e), 6000);
    return generateRandomAvatarCode();
  }
}
function createAvatarElement(avatarCode, size = 64) {
  const color1 = avatarCode[0], shape = avatarCode[1], color2 = avatarCode[2];
  const div = document.createElement('div');
  div.className = 'user-avatar';
  div.style.width = div.style.height = size + 'px';
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.justifyContent = 'center';
  div.style.background = avatarColors[color2] || '#eee';
  div.style.borderRadius = '50%';
  div.style.overflow = 'hidden';
  let shapeEl;
  if (shape === 'c') {
    shapeEl = document.createElement('div');
    shapeEl.style.width = shapeEl.style.height = Math.round(size * 0.6) + 'px';
    shapeEl.style.background = avatarColors[color1] || '#666';
    shapeEl.style.borderRadius = '50%';
  } else if (shape === 's') {
    shapeEl = document.createElement('div');
    shapeEl.style.width = shapeEl.style.height = Math.round(size * 0.6) + 'px';
    shapeEl.style.background = avatarColors[color1] || '#666';
    shapeEl.style.borderRadius = '16%';
  } else if (shape === 'd') {
    shapeEl = document.createElement('div');
    shapeEl.style.width = shapeEl.style.height = Math.round(size * 0.6) + 'px';
    shapeEl.style.background = avatarColors[color1] || '#666';
    shapeEl.style.transform = 'rotate(45deg)';
    shapeEl.style.borderRadius = '18%';
  }
  if (shapeEl) div.appendChild(shapeEl);
  return div;
}
// --- END Аватарки ---

function initSettingsApp(win) {
  // Внешний вид
  const wallpaperInput = win.querySelector('#wallpaper-url');
  const applyBtn = win.querySelector('#apply-settings');
  // Firebase
  const fbFields = [
    'apiKey', 'authDomain', 'databaseURL', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId'
  ];
  const fbInputs = {};
  fbFields.forEach(f => {
    fbInputs[f] = win.querySelector(`#firebase-${f}`);
  });
  const saveFirebaseBtn = win.querySelector('#save-firebase');

  // Загрузка настроек
  const settings = JSON.parse(localStorage.getItem('settingsApp') || '{}');
  wallpaperInput.value = settings.wallpaper || '';
  fbFields.forEach(f => {
    fbInputs[f].value = (settings.firebase && settings.firebase[f]) || '';
  });

  applyBtn.onclick = () => {
    if (wallpaperInput.value) {
      document.body.style.backgroundImage = `url('${wallpaperInput.value}')`;
      document.body.style.backgroundSize = 'cover';
    }
    settings.wallpaper = wallpaperInput.value;
    localStorage.setItem('settingsApp', JSON.stringify(settings));
  };
  saveFirebaseBtn.onclick = () => {
    settings.firebase = settings.firebase || {};
    fbFields.forEach(f => {
      settings.firebase[f] = fbInputs[f].value;
    });
    localStorage.setItem('settingsApp', JSON.stringify(settings));
    saveFirebaseBtn.textContent = 'Сохранено!';
    setTimeout(() => saveFirebaseBtn.textContent = 'Сохранить Firebase', 1200);
  };

  // Кнопка Войти/Выйти теперь рядом с именем и аватаркой
  let userBlock = win.querySelector('.settings-user');
  let loginBtn = win.querySelector('#login-btn');
  if (!loginBtn) {
    loginBtn = document.createElement('button');
    loginBtn.id = 'login-btn';
    loginBtn.style.marginLeft = '18px';
    loginBtn.style.height = '36px';
    loginBtn.style.alignSelf = 'center';
    userBlock.appendChild(loginBtn);
  }
  function updateLoginBtn() {
    const isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn') || 'false');
    if (isLoggedIn) {
      loginBtn.textContent = 'Выйти';
      loginBtn.onclick = () => {
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        showNotification('Вы вышли из аккаунта');
        updateLoginBtn();
        // Сброс имени пользователя в интерфейсе
        const usernameDiv = win.querySelector('.settings-username');
        if (usernameDiv) usernameDiv.textContent = 'Пользователь';
      };
    } else {
      loginBtn.textContent = 'Войти';
      loginBtn.onclick = () => {
        openAppWindow('login');
      };
    }
  }
  function checkShowLoginBtn() {
    const allFilled = fbFields.every(f => fbInputs[f].value.trim());
    loginBtn.style.display = allFilled ? '' : 'none';
  }
  fbFields.forEach(f => {
    fbInputs[f].addEventListener('input', checkShowLoginBtn);
  });
  checkShowLoginBtn();
  updateLoginBtn();

  // Имя пользователя
  const usernameDiv = win.querySelector('.settings-username');
  let userEmail = localStorage.getItem('userEmail') || '';
  let userName = localStorage.getItem('userName') || 'Пользователь';
  const isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn') || 'false');
  if (isLoggedIn && userName) {
    usernameDiv.textContent = userName;
  } else {
    usernameDiv.textContent = 'Пользователь';
  }

  // Технические характеристики
  const resSpan = win.querySelector('#device-resolution');
  const osSpan = win.querySelector('#device-os');
  if (resSpan) resSpan.textContent = window.innerWidth + ' x ' + window.innerHeight;
  if (osSpan) osSpan.textContent = 'ЖестьOS (' + navigator.userAgent + ')';

  // Аватарка
  const avatarImg = win.querySelector('.settings-avatar');
  const userUid = userEmail;
  if (isLoggedIn && userUid) {
    let avatarCode = localStorage.getItem('userAvatarCode');
    let avatarEl;
    if (avatarCode) {
      avatarEl = createAvatarElement(avatarCode, 64);
      avatarImg.replaceWith(avatarEl);
      avatarEl.classList.add('settings-avatar');
    } else {
      getUserAvatar(userUid).then(code => {
        localStorage.setItem('userAvatarCode', code);
        avatarEl = createAvatarElement(code, 64);
        avatarImg.replaceWith(avatarEl);
        avatarEl.classList.add('settings-avatar');
      });
    }
    // Клик по аватарке — открыть редактор
    setTimeout(() => {
      const avatarNode = document.querySelector('.settings-avatar');
      if (avatarNode) {
        avatarNode.style.cursor = 'pointer';
        avatarNode.onclick = () => openAppWindow('smile-editor');
      }
    }, 100);
  } else {
    // Не вошёл — дефолтная картинка
    if (!avatarImg.src.includes('pravatar')) avatarImg.src = 'https://i.pravatar.cc/80?u=macosdemo';
  }
  patchSettingsAppForPassword(win);

  // --- Cloud save logic ---
  const cloudKeys = [
    'desktopAppPositions',
    'notesAppNotes',
    'notesAppSelectedId',
    'settingsApp',
    'browserHistory',
    'browserTabs',
    'browserActiveTabId',
    'openWindowsState',
    'windowSizes',
    'wallpaper',
    'cloudSelectedKeys',
    'cloudAutoRestore',
    'storeInstalledApps',
  ];
  const cloudCheckboxes = win.querySelectorAll('.cloud-save-checkbox');
  const cloudSaveBtn = win.querySelector('#cloud-save-btn');
  const cloudRestoreBtn = win.querySelector('#cloud-restore-btn');
  const cloudAutoRestore = win.querySelector('#cloud-auto-restore');
  // Загружаем выбранные ключи из localStorage
  let selectedCloudKeys = JSON.parse(localStorage.getItem('cloudSelectedKeys') || '[]');
  cloudCheckboxes.forEach(cb => {
    cb.checked = selectedCloudKeys.includes(cb.dataset.key);
    cb.onchange = () => {
      selectedCloudKeys = Array.from(cloudCheckboxes).filter(c => c.checked).map(c => c.dataset.key);
      localStorage.setItem('cloudSelectedKeys', JSON.stringify(selectedCloudKeys));
    };
  });
  cloudAutoRestore.checked = JSON.parse(localStorage.getItem('cloudAutoRestore') || 'false');
  cloudAutoRestore.onchange = () => {
    localStorage.setItem('cloudAutoRestore', cloudAutoRestore.checked);
  };
  cloudSaveBtn.onclick = async () => {
    if (!userEmail) { showNotification('Войдите для сохранения'); return; }
    const data = {};
    selectedCloudKeys.forEach(key => {
      data[key] = localStorage.getItem(key);
    });
    // Сохраняем обои
    data.wallpaper = localStorage.getItem('settingsApp') ? JSON.parse(localStorage.getItem('settingsApp')).wallpaper : '';
    // Сохраняем выбранные галочки и авто-восстановление
    data.cloudSelectedKeys = JSON.stringify(selectedCloudKeys);
    data.cloudAutoRestore = localStorage.getItem('cloudAutoRestore') || 'false';
    try {
      await firebase.firestore().collection('save').doc(userEmail).set(data, {merge:true});
      showNotification('Данные сохранены в ЖестьКлауд!');
    } catch (e) {
      showNotification('Ошибка сохранения: ' + (e.message || e));
    }
  };
  cloudRestoreBtn.onclick = async () => {
    if (!userEmail) { showNotification('Войдите для восстановления'); return; }
    try {
      const doc = await firebase.firestore().collection('save').doc(userEmail).get();
      if (doc.exists) {
        const data = doc.data();
        selectedCloudKeys.forEach(key => {
          if (data[key] !== undefined) localStorage.setItem(key, data[key]);
        });
        // Восстанавливаем обои
        if (data.wallpaper !== undefined) {
          const settings = JSON.parse(localStorage.getItem('settingsApp') || '{}');
          settings.wallpaper = data.wallpaper;
          localStorage.setItem('settingsApp', JSON.stringify(settings));
        }
        // Восстанавливаем выбранные галочки и авто-восстановление
        if (data.cloudSelectedKeys !== undefined) localStorage.setItem('cloudSelectedKeys', data.cloudSelectedKeys);
        if (data.cloudAutoRestore !== undefined) localStorage.setItem('cloudAutoRestore', data.cloudAutoRestore);
        showNotification('Данные восстановлены из ЖестьКлауд! Перезагрузите страницу.');
      } else {
        showNotification('Нет сохранённых данных в ЖестьКлауд');
      }
    } catch (e) {
      showNotification('Ошибка восстановления: ' + (e.message || e));
    }
  };
  // В конец initSettingsApp(win) добавляю (один раз на страницу):
  if (!window._cloudSyncInterval) {
    window._cloudSyncInterval = setInterval(async () => {
      const userEmail = localStorage.getItem('userEmail') || '';
      const auto = JSON.parse(localStorage.getItem('cloudAutoRestore') || 'false');
      if (!userEmail || !auto) return;
      // Сохраняем
      const selectedCloudKeys = JSON.parse(localStorage.getItem('cloudSelectedKeys') || '[]');
      const data = {};
      selectedCloudKeys.forEach(key => {
        data[key] = localStorage.getItem(key);
      });
      data.wallpaper = localStorage.getItem('settingsApp') ? JSON.parse(localStorage.getItem('settingsApp')).wallpaper : '';
      data.cloudSelectedKeys = localStorage.getItem('cloudSelectedKeys') || '[]';
      data.cloudAutoRestore = localStorage.getItem('cloudAutoRestore') || 'false';
      try {
        await firebase.firestore().collection('save').doc(userEmail).set(data, {merge:true});
      } catch (e) {}
      // Загружаем
      try {
        const doc = await firebase.firestore().collection('save').doc(userEmail).get();
        if (doc.exists) {
          const data = doc.data();
          selectedCloudKeys.forEach(key => {
            if (data[key] !== undefined) localStorage.setItem(key, data[key]);
          });
          if (data.wallpaper !== undefined) {
            const settings = JSON.parse(localStorage.getItem('settingsApp') || '{}');
            settings.wallpaper = data.wallpaper;
            localStorage.setItem('settingsApp', JSON.stringify(settings));
          }
          if (data.cloudSelectedKeys !== undefined) localStorage.setItem('cloudSelectedKeys', data.cloudSelectedKeys);
          if (data.cloudAutoRestore !== undefined) localStorage.setItem('cloudAutoRestore', data.cloudAutoRestore);
        }
      } catch (e) {}
    }, 60000);
  }
} 

// Уведомление в правом верхнем углу
function showNotification(text) {
  let notif = document.getElementById('global-notification');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'global-notification';
    notif.style.position = 'fixed';
    notif.style.top = '32px';
    notif.style.right = '32px';
    notif.style.zIndex = 99999;
    notif.style.background = '#fff';
    notif.style.color = '#222';
    notif.style.padding = '18px 32px';
    notif.style.borderRadius = '14px';
    notif.style.boxShadow = '0 4px 24px #0002';
    notif.style.fontSize = '18px';
    notif.style.fontWeight = '500';
    notif.style.opacity = '0';
    notif.style.transition = 'opacity 0.3s';
    document.body.appendChild(notif);
  }
  notif.textContent = text;
  notif.style.opacity = '1';
  setTimeout(() => { notif.style.opacity = '0'; }, 5000);
} 

// Автоматическое применение темы и обоев при загрузке страницы
(function applySavedAppearance() {
  const settings = JSON.parse(localStorage.getItem('settingsApp') || '{}');
  if (settings.theme === 'dark') {
    document.body.style.backgroundColor = '#222';
  } else {
    document.body.style.backgroundColor = '';
  }
  if (settings.wallpaper) {
    document.body.style.backgroundImage = `url('${settings.wallpaper}')`;
    document.body.style.backgroundSize = 'cover';
  } else {
    document.body.style.backgroundImage = '';
  }
})(); 

// Инициализация Firebase из настроек
function initFirebaseFromSettings() {
  const settings = JSON.parse(localStorage.getItem('settingsApp') || '{}');
  if (!settings.firebase || !settings.firebase.apiKey) return;
  if (window.firebase?.apps?.length) return;
  window.firebase.initializeApp(settings.firebase);
}
initFirebaseFromSettings(); 

// --- Window stack ---
let openWindowsStack = [];
function bringWindowToFront(windowEl) {
  // Удаляем из стека, если уже есть
  openWindowsStack = openWindowsStack.filter(w => w !== windowEl);
  openWindowsStack.push(windowEl);
  // Пересчитываем z-index
  openWindowsStack.forEach((w, i) => {
    w.style.zIndex = 100 + i;
  });
}
function removeWindowFromStack(windowEl) {
  openWindowsStack = openWindowsStack.filter(w => w !== windowEl);
  openWindowsStack.forEach((w, i) => {
    w.style.zIndex = 100 + i;
  });
}
// --- END Window stack ---

// --- Верхняя строка (menu bar) ---
function updateMenubarTime() {
  const el = document.getElementById('menubar-time');
  if (!el) return;
  const now = new Date();
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  el.textContent = `${hh}:${mm}`;
}
setInterval(updateMenubarTime, 1000);
updateMenubarTime();

function updateMenubarAvatar() {
  const el = document.getElementById('menubar-avatar');
  if (!el) return;
  let avatarCode = localStorage.getItem('userAvatarCode');
  let userEmail = localStorage.getItem('userEmail') || '';
  el.innerHTML = '';
  if (avatarCode && typeof createAvatarElement === 'function') {
    const av = createAvatarElement(avatarCode, 28);
    av.style.width = '28px';
    av.style.height = '28px';
    av.style.borderRadius = '50%';
    av.style.display = 'block';
    el.appendChild(av);
  } else {
    // fallback
    el.innerHTML = `<img src="https://i.pravatar.cc/28?u=${userEmail || 'macosdemo'}" style="width:28px; height:28px; border-radius:50%; display:block;">`;
  }
  el.title = 'Профиль/Аватар';
  el.style.cursor = 'pointer';
  el.onclick = () => openAppWindow('smile-editor');
}
updateMenubarAvatar();
window.addEventListener('storage', updateMenubarAvatar);
// Обновлять при входе/выходе
window.addEventListener('focus', updateMenubarAvatar);
// --- END Верхняя строка (menu bar) ---

// --- Меню-бар: динамика и меню ---
const menubarAppName = document.getElementById('menubar-appname');
const menubarMenus = document.querySelectorAll('.menubar-menu');
const menubarDropdowns = document.getElementById('menubar-dropdowns');
const menubarApple = document.querySelector('.menubar-apple');

// Список меню для разных приложений
const MENUBAR_MENUS = {
  apple: [
    { label: 'О системе', action: () => openAppWindow('about', 'desktop') },
    { label: 'Настройки…', action: () => openAppWindow('settings') },
    { label: 'Заблокировать экран', action: () => showLockscreen('login') },
    { label: 'Перезагрузить', action: () => location.reload() },
    { label: 'Выключить', action: () => window.close() },
  ],
  desktop: {
    file: [
      { label: 'Создать папку', action: () => showNotification('Папки пока нельзя создавать') },
      { label: 'Показать рабочий стол', action: () => { Object.values(openWindows).forEach(w => w.style.display = 'none'); } },
    ],
    edit: [
      { label: 'Вырезать', action: () => document.execCommand('cut') },
      { label: 'Копировать', action: () => document.execCommand('copy') },
      { label: 'Вставить', action: () => document.execCommand('paste') },
    ],
    window: [
      { label: 'Закрыть все окна', action: () => { Object.values(openWindows).forEach(w => w.remove()); openWindowsStack = []; } },
    ],
    help: [
      { label: 'О Рабочем столе', action: () => openAppWindow('about', 'desktop') },
    ]
  },
  notes: {
    file: [
      { label: 'Создать заметку', action: () => { const win = openWindows['notes']; if (win) win.querySelector('.notes-add')?.click(); } },
      { label: 'Сохранить все', action: () => showNotification('Все заметки уже сохраняются автоматически!') },
    ],
    edit: [
      { label: 'Вырезать', action: () => document.execCommand('cut') },
      { label: 'Копировать', action: () => document.execCommand('copy') },
      { label: 'Вставить', action: () => document.execCommand('paste') },
    ],
    window: [
      { label: 'Закрыть окно', action: () => { openWindows['notes']?.remove(); } },
    ],
    help: [
      { label: 'О Заметках', action: () => openAppWindow('about', 'notes') },
    ]
  },
  browser: {
    file: [
      { label: 'Открыть сайт', action: () => showNotification('В браузере можно открыть сайт!') },
    ],
    edit: [
      { label: 'Вырезать', action: () => document.execCommand('cut') },
      { label: 'Копировать', action: () => document.execCommand('copy') },
      { label: 'Вставить', action: () => document.execCommand('paste') },
    ],
    window: [
      { label: 'Закрыть окно', action: () => { openWindows['browser']?.remove(); } },
    ],
    help: [
      { label: 'О Браузере', action: () => openAppWindow('about', 'browser') },
    ]
  },
  settings: {
    file: [
      { label: 'Сохранить настройки', action: () => { showNotification('Настройки сохранены!'); } },
    ],
    edit: [
      { label: 'Вырезать', action: () => document.execCommand('cut') },
      { label: 'Копировать', action: () => document.execCommand('copy') },
      { label: 'Вставить', action: () => document.execCommand('paste') },
    ],
    window: [
      { label: 'Закрыть окно', action: () => { openWindows['settings']?.remove(); } },
    ],
    help: [
      { label: 'О Настройках', action: () => openAppWindow('about', 'settings') },
    ]
  },
  'smile-chat': {
    file: [
      { label: 'Новая беседа', action: () => showNotification('Создать чат можно в интерфейсе чата!') },
    ],
    edit: [
      { label: 'Вырезать', action: () => document.execCommand('cut') },
      { label: 'Копировать', action: () => document.execCommand('copy') },
      { label: 'Вставить', action: () => document.execCommand('paste') },
    ],
    window: [
      { label: 'Закрыть окно', action: () => { openWindows['smile-chat']?.remove(); } },
    ],
    help: [
      { label: 'О ЖестьМесседж', action: () => openAppWindow('about', 'smile-chat') },
    ]
  },
  'smile-editor': {
    file: [
      { label: 'Сохранить аватар', action: () => showNotification('Аватар сохранён!') },
    ],
    edit: [
      { label: 'Вырезать', action: () => document.execCommand('cut') },
      { label: 'Копировать', action: () => document.execCommand('copy') },
      { label: 'Вставить', action: () => document.execCommand('paste') },
    ],
    window: [
      { label: 'Закрыть окно', action: () => { openWindows['smile-editor']?.remove(); } },
    ],
    help: [
      { label: 'О ЖестьСМАЙЛЫ', action: () => openAppWindow('about', 'smile-editor') },
    ]
  },
  'system-monitor': {
    file: [
      { label: 'Открыть мониторинг', action: () => showNotification('Мониторинг открыт!') },
    ],
    edit: [
      { label: 'Вырезать', action: () => document.execCommand('cut') },
      { label: 'Копировать', action: () => document.execCommand('copy') },
      { label: 'Вставить', action: () => document.execCommand('paste') },
    ],
    window: [
      { label: 'Закрыть окно', action: () => { openWindows['system-monitor']?.remove(); } },
    ],
    help: [
      { label: 'О Мониторинге', action: () => openAppWindow('about', 'system-monitor') },
    ]
  }
};

// Определение активного приложения
function getActiveApp() {
  // Если есть открытое окно сверху — оно активное
  if (openWindowsStack && openWindowsStack.length) {
    const win = openWindowsStack[openWindowsStack.length - 1];
    return win?.dataset?.app || 'desktop';
  }
  return 'desktop';
}
function updateMenubarAppName() {
  const app = getActiveApp();
  menubarAppName.textContent = getAppTitle(app === 'desktop' ? 'desktop' : app);
}
// Обновлять при открытии/закрытии окон
window.addEventListener('focus', updateMenubarAppName);
window.addEventListener('click', updateMenubarAppName);
window.addEventListener('keydown', updateMenubarAppName);
setInterval(updateMenubarAppName, 1000);

// --- Выпадающие меню ---
let menubarDropdownOpen = null;
function closeMenubarDropdown() {
  menubarMenus.forEach(m => m.classList.remove('active'));
  menubarDropdowns.innerHTML = '';
  menubarDropdownOpen = null;
}
function openMenubarDropdown(menu, anchorEl) {
  closeMenubarDropdown();
  let app = getActiveApp();
  if (menu === 'apple') {
    var items = MENUBAR_MENUS.apple;
  } else {
    app = app || 'desktop';
    var items = (MENUBAR_MENUS[app] && MENUBAR_MENUS[app][menu]) || [];
  }
  if (!items.length) return;
  anchorEl.classList.add('active');
  const rect = anchorEl.getBoundingClientRect();
  const dropdown = document.createElement('div');
  dropdown.className = 'menubar-dropdown visible';
  dropdown.style.left = (rect.left) + 'px';
  dropdown.style.top = (rect.bottom + 2) + 'px';
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'menubar-dropdown-item';
    btn.textContent = item.label;
    btn.onclick = (e) => { e.stopPropagation(); closeMenubarDropdown(); item.action(); };
    dropdown.appendChild(btn);
  });
  menubarDropdowns.appendChild(dropdown);
  menubarDropdownOpen = dropdown;
}
// Клик по 
menubarApple.addEventListener('click', e => {
  openMenubarDropdown('apple', menubarApple);
});
// Клик по меню
menubarMenus.forEach(menuEl => {
  menuEl.addEventListener('click', e => {
    const menu = menuEl.dataset.menu;
    openMenubarDropdown(menu, menuEl);
    e.stopPropagation();
  });
});
// Клик вне меню — закрыть
window.addEventListener('click', e => {
  if (!e.target.closest('.menubar-dropdown') && !e.target.classList.contains('menubar-menu') && !e.target.classList.contains('menubar-apple')) {
    closeMenubarDropdown();
  }
});
// Escape — закрыть меню
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenubarDropdown();
});
// --- END Меню-бар: динамика и меню ---

// Базовая логика общего чата (только UI, без Firestore)
function initSmileChatApp() {
  const catBtns = document.querySelectorAll('.smile-chat-category');
  const usersList = document.querySelector('.smile-chat-users');
  const chatMessages = document.querySelector('.smile-chat-messages');
  const chatForm = document.querySelector('.smile-chat-form');
  const chatInput = document.querySelector('.smile-chat-input');
  let currentTab = 'general';
  // Сделать selectedUser глобальной
  if (!window.selectedUser) window.selectedUser = null;
  let unsubscribe = null;
  const db = firebase.firestore();
  const userEmail = localStorage.getItem('userEmail') || '';
  const userName = localStorage.getItem('userName') || 'Пользователь';
  const userAvatar = localStorage.getItem('userAvatarCode') || '';
  const isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn') || 'false');

  function clearListener() { if (unsubscribe) { unsubscribe(); unsubscribe = null; } }

  // --- Общий чат ---
  function loadGeneralChat() {
    clearListener();
    usersList.innerHTML = '<div style="color:#888; padding:16px;">Общий чат</div>';
    chatMessages.innerHTML = '';
    unsubscribe = db.collection('messages')
      .where('type', '==', 'general')
      .orderBy('timestamp', 'asc')
      .limit(100)
      .onSnapshot(snapshot => {
        chatMessages.innerHTML = '';
        snapshot.forEach(doc => renderChatMessage(doc.data(), doc.id));
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
  }

  // --- Личные чаты ---
  async function loadUsersForPrivate() {
    usersList.innerHTML = '<div style="color:#888; padding:12px;">Загрузка...</div>';
    // Собираем пользователей из сообщений
    const usersMap = {};
    const messages = await db.collection('messages').limit(200).get();
    messages.forEach(doc => {
      const m = doc.data();
      if (m.type === 'private' && Array.isArray(m.participants)) {
        m.participants.forEach(uid => {
          if (uid !== userEmail) usersMap[uid] = true;
        });
      }
      if (m.type === 'general' && m.senderId && m.senderId !== userEmail) {
        usersMap[m.senderId] = true;
      }
    });
    // Добавляем из аватарок (чтобы были все, кто когда-либо был)
    const avatars = await db.collection('avatarka').get();
    avatars.forEach(doc => {
      if (doc.id !== userEmail) usersMap[doc.id] = true;
    });
    usersList.innerHTML = '';
    Object.keys(usersMap).forEach(uid => {
      const div = document.createElement('div');
      div.className = 'smile-chat-user';
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.gap = '10px';
      div.style.cursor = 'pointer';
      div.style.padding = '8px 16px';
      div.style.borderRadius = '8px';
      div.onmouseenter = () => div.style.background = '#e6eaff';
      div.onmouseleave = () => div.style.background = '';
      // Сначала placeholder
      const av = createAvatarElement(generateRandomAvatarCode(), 32);
      div.appendChild(av);
      // Потом асинхронно обновляем на настоящую
      getUserAvatar(uid).then(code => {
        const realAv = createAvatarElement(code, 32);
        div.replaceChild(realAv, av);
      });
      // Имя
      div.innerHTML += `<span>${uid.split('@')[0]}</span>`;
      // Выделение выбранного пользователя
      if (window.selectedUser === uid) div.classList.add('selected');
      div.onclick = () => {
        currentTab = 'private';
        window.selectedUser = uid;
        usersList.querySelectorAll('.smile-chat-user').forEach(u => u.classList.remove('selected'));
        div.classList.add('selected');
        loadPrivateChat(uid);
        catBtns.forEach(b => b.classList.remove('active'));
        catBtns[1].classList.add('active');
      };
      usersList.appendChild(div);
    });
  }
  function loadPrivateChat(targetUid) {
    clearListener();
    chatMessages.innerHTML = '';
    unsubscribe = db.collection('messages')
      .where('type', '==', 'private')
      .where('participants', 'array-contains', userEmail)
      .orderBy('timestamp', 'asc')
      .limit(200)
      .onSnapshot(snapshot => {
        chatMessages.innerHTML = '';
        snapshot.forEach(doc => {
          const m = doc.data();
          if (m.participants && m.participants.includes(targetUid)) {
            renderChatMessage(m, doc.id);
          }
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
  }

  // --- Мои чаты ---
  async function loadMyChats() {
    clearListener();
    usersList.innerHTML = '';
    chatMessages.innerHTML = '';
    // Собираем все чаты, где участвовал пользователь
    const messages = await db.collection('messages')
      .where('participants', 'array-contains', userEmail)
      .orderBy('timestamp', 'desc')
      .limit(200)
      .get();
    const chatMap = {};
    messages.forEach(doc => {
      const m = doc.data();
      if (m.type === 'private' && Array.isArray(m.participants)) {
        const other = m.participants.find(uid => uid !== userEmail);
        if (other) chatMap[other] = m;
      }
    });
    Object.keys(chatMap).forEach(uid => {
      const div = document.createElement('div');
      div.className = 'smile-chat-user';
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.gap = '10px';
      div.style.cursor = 'pointer';
      div.style.padding = '8px 16px';
      div.style.borderRadius = '8px';
      div.onmouseenter = () => div.style.background = '#e6eaff';
      div.onmouseleave = () => div.style.background = '';
      getUserAvatar(uid).then(code => {
        const av = createAvatarElement(code, 32);
        div.prepend(av);
      });
      div.innerHTML += `<span>${uid.split('@')[0]}</span>`;
      if (window.selectedUser === uid) div.classList.add('selected');
      div.onclick = () => {
        currentTab = 'private';
        window.selectedUser = uid;
        usersList.querySelectorAll('.smile-chat-user').forEach(u => u.classList.remove('selected'));
        div.classList.add('selected');
        loadPrivateChat(uid);
        catBtns.forEach(b => b.classList.remove('active'));
        catBtns[1].classList.add('active');
      };
      usersList.appendChild(div);
    });
    if (!Object.keys(chatMap).length) {
      usersList.innerHTML = '<div style="color:#888; padding:12px;">Нет личных чатов</div>';
    }
  }

  // --- Рендер сообщения ---
  async function renderChatMessage(m, id) {
    const div = document.createElement('div');
    const isMe = m.senderId === userEmail;
    div.className = 'smile-chat-message' + (isMe ? ' sent' : '');
    // Аватарка
    const av = createAvatarElement(m.avatarCode || '', 36);
    av.classList.add('msg-avatar');
    div.appendChild(av);
    // Контейнер для текста
    const msgContent = document.createElement('div');
    msgContent.className = 'msg-content';
    // Имя
    msgContent.innerHTML = `<div class='msg-name'>${m.from || 'Гость'}</div>`;
    // Текст
    msgContent.innerHTML += `<div class='msg-text'>${m.text}</div>`;
    // Время
    msgContent.innerHTML += `<div class='msg-time'>${m.timestamp && m.timestamp.toDate ? m.timestamp.toDate().toLocaleTimeString() : ''}</div>`;
    div.appendChild(msgContent);
    chatMessages.appendChild(div);
  }

  // --- Переключение категорий ---
  catBtns[0].onclick = () => { currentTab = 'general'; window.selectedUser = null; catBtns.forEach(b=>b.classList.remove('active')); catBtns[0].classList.add('active'); loadGeneralChat(); };
  catBtns[1].onclick = () => { currentTab = 'private'; window.selectedUser = null; catBtns.forEach(b=>b.classList.remove('active')); catBtns[1].classList.add('active'); loadUsersForPrivate(); chatMessages.innerHTML = '<div style="color:#888; text-align:center; margin-top:32px;">Выберите пользователя для чата</div>'; };
  catBtns[2].onclick = () => { currentTab = 'my'; window.selectedUser = null; catBtns.forEach(b=>b.classList.remove('active')); catBtns[2].classList.add('active'); loadMyChats(); chatMessages.innerHTML = '<div style="color:#888; text-align:center; margin-top:32px;">Выберите чат</div>'; };

  // --- Отправка сообщений ---
  chatForm.onsubmit = async e => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    if (!isLoggedIn) { showNotification('Войдите для отправки сообщений'); return; }
    let messageData = {
      text,
      from: userName,
      senderId: userEmail,
      avatarCode: userAvatar,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    if (currentTab === 'general') {
      messageData.type = 'general';
      messageData.to = 'all';
    } else if (currentTab === 'private' && window.selectedUser) {
      messageData.type = 'private';
      messageData.to = window.selectedUser;
      messageData.toName = window.selectedUser.split('@')[0];
      messageData.participants = [userEmail, window.selectedUser].sort();
    } else {
      showNotification('Выберите пользователя для личного чата');
      return;
    }
    try {
      await db.collection('messages').add(messageData);
      chatInput.value = '';
      setTimeout(() => { chatMessages.scrollTop = chatMessages.scrollHeight; }, 100);
    } catch (e) {
      showNotification('Ошибка отправки: ' + (e.message || e));
    }
  };

  // --- Стартовый вывод ---
  loadGeneralChat();
} 

// --- ЛОГИКА БЛОКИРОВКИ/ПАРОЛЯ ---
function showLockscreen(mode = 'auto') {
  const lock = document.getElementById('lockscreen');
  const modal = document.getElementById('lockscreen-modal');
  const title = document.getElementById('lockscreen-title');
  const pass = document.getElementById('lockscreen-password');
  const pass2 = document.getElementById('lockscreen-password2');
  const submit = document.getElementById('lockscreen-submit');
  const error = document.getElementById('lockscreen-error');
  const dateEl = document.getElementById('lockscreen-date');
  const timeEl = document.getElementById('lockscreen-time');
  const avatarEl = document.getElementById('lockscreen-avatar');
  const usernameEl = document.getElementById('lockscreen-username');
  const hintEl = document.getElementById('lockscreen-hint');
  modal.style.display = 'none';
  lock.style.display = '';
  document.body.style.overflow = 'hidden';
  pass.value = '';
  pass2.value = '';
  error.textContent = '';
  pass2.style.display = 'none';
  pass.type = 'password';
  pass2.type = 'password';
  pass.disabled = false;
  pass2.disabled = false;
  submit.disabled = false;
  // Дата и время
  function updateLockscreenTime() {
    const now = new Date();
    const days = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
    const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    dateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
    timeEl.textContent = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  }
  updateLockscreenTime();
  if (!lock._interval) {
    lock._interval = setInterval(updateLockscreenTime, 1000);
  }
  // Аватар и имя
  let userName = localStorage.getItem('userName') || 'Пользователь';
  let avatarCode = localStorage.getItem('userAvatarCode');
  avatarEl.innerHTML = '';
  if (avatarCode && typeof createAvatarElement === 'function') {
    const av = createAvatarElement(avatarCode, 72);
    av.style.width = av.style.height = '72px';
    av.style.borderRadius = '50%';
    avatarEl.appendChild(av);
  } else {
    avatarEl.innerHTML = `<img src='https://i.pravatar.cc/72?u=${userName}' style='width:72px; height:72px; border-radius:50%;'>`;
  }
  usernameEl.textContent = userName;
  // Подпись
  hintEl.textContent = (mode === 'create' || mode === 'change') ? '' : 'Touch ID или пароль';
  // Клик по пользователю — показать ввод пароля
  function showModal() {
    modal.style.display = '';
    setTimeout(() => pass.focus(), 100);
  }
  document.getElementById('lockscreen-user-block').onclick = () => {
    if (modal.style.display === 'none') showModal();
  };
  // Если режим создания/смены пароля — сразу показываем модалку
  if (mode === 'create' || mode === 'change') showModal();
  // ... остальной код showLockscreen (логика пароля, submit и т.д.) ...
  if (mode === 'create') {
    title.textContent = 'Создайте пароль для входа в ЖестьOS';
    pass.placeholder = 'Пароль';
    pass2.style.display = '';
    pass2.placeholder = 'Повторите пароль';
    submit.textContent = 'Создать';
    submit.onclick = () => {
      if (pass.value.length < 4) { error.textContent = 'Минимум 4 символа'; return; }
      if (pass.value !== pass2.value) { error.textContent = 'Пароли не совпадают'; return; }
      localStorage.setItem('osPassword', btoa(pass.value));
      lock.style.display = 'none';
      document.body.style.overflow = '';
    };
  } else if (mode === 'change') {
    title.textContent = 'Сменить пароль';
    pass.placeholder = 'Новый пароль';
    pass2.style.display = '';
    pass2.placeholder = 'Повторите пароль';
    submit.textContent = 'Сменить';
    submit.onclick = () => {
      if (pass.value.length < 4) { error.textContent = 'Минимум 4 символа'; return; }
      if (pass.value !== pass2.value) { error.textContent = 'Пароли не совпадают'; return; }
      localStorage.setItem('osPassword', btoa(pass.value));
      lock.style.display = 'none';
      document.body.style.overflow = '';
      showNotification('Пароль изменён!');
    };
  } else {
    title.textContent = 'Введите пароль для входа в ЖестьOS';
    pass.placeholder = 'Пароль';
    submit.textContent = 'Войти';
    submit.onclick = () => {
      const saved = localStorage.getItem('osPassword');
      if (!saved || btoa(pass.value) !== saved) { error.textContent = 'Неверный пароль'; return; }
      lock.style.display = 'none';
      document.body.style.overflow = '';
    };
  }
  pass.onkeydown = pass2.onkeydown = (e) => { if (e.key === 'Enter') submit.onclick(); };
}
// Показываем lockscreen при загрузке
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('osPassword');
  if (!saved) showLockscreen('create');
  else showLockscreen('login');
});
// --- Кнопка смены пароля в настройках ---
function patchSettingsAppForPassword(win) {
  let section = win.querySelector('.settings-section.password');
  if (!section) {
    section = document.createElement('div');
    section.className = 'settings-section password';
    section.innerHTML = `<div class="settings-title">Пароль системы</div>`;
    // Вставить после технических характеристик
    const techSection = Array.from(win.querySelectorAll('.settings-section')).find(s => s.textContent.includes('Технические характеристики'));
    if (techSection && techSection.parentNode) {
      if (techSection.nextSibling) {
        techSection.parentNode.insertBefore(section, techSection.nextSibling);
      } else {
        techSection.parentNode.appendChild(section);
      }
    } else {
      // Если техническая секция не найдена, добавить в конец настроек и вывести ошибку
      const settingsApp = win.querySelector('.settings-app');
      if (settingsApp) {
        settingsApp.appendChild(section);
        console.warn('Техническая секция не найдена, кнопка смены пароля добавлена в конец настроек.');
      } else {
        win.appendChild(section);
        console.error('settings-app не найден, кнопка смены пароля добавлена в конец окна.');
      }
    }
  }
  let btn = win.querySelector('#change-password-btn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'change-password-btn';
    btn.textContent = 'Сменить пароль';
    btn.className = 'settings-btn-password';
    btn.style.display = 'block';
    btn.style.margin = '18px 0 0 0';
    btn.style.padding = '10px 32px';
    btn.style.borderRadius = '8px';
    btn.style.border = 'none';
    btn.style.background = '#e6eaff';
    btn.style.color = '#007aff';
    btn.style.fontSize = '16px';
    btn.style.fontWeight = '500';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 2px 8px #0001';
    btn.onmouseenter = () => btn.style.background = '#d0e0ff';
    btn.onmouseleave = () => btn.style.background = '#e6eaff';
    btn.onclick = () => showLockscreen('change');
    section.appendChild(btn);
  }
}
// ... существующий код ...
// В showLockscreen: убираю подпись 'Touch ID или пароль', hintEl.textContent = '';
// ... существующий код ...

// --- Добавляю иконку Мониторинга на рабочий стол и в Dock ---
// Добавить в getDockApps и рендер Dock
// Добавить в openAppWindow обработку system-monitor

// 1. Добавить иконку на рабочий стол (если нет)
window.addEventListener('DOMContentLoaded', () => {
  const desktop = document.getElementById('desktop');
  if (!desktop.querySelector('.app-icon[data-app="system-monitor"]')) {
    const icon = document.createElement('div');
    icon.className = 'app-icon';
    icon.dataset.app = 'system-monitor';
    // Проверяем сохранённую позицию
    let left = '0px', top = '384px';
    const saved = localStorage.getItem('desktopAppPositions');
    if (saved) {
      const positions = JSON.parse(saved);
      if (positions['system-monitor']) {
        left = positions['system-monitor'].left;
        top = positions['system-monitor'].top;
      }
    }
    icon.style.position = 'absolute';
    icon.style.left = left;
    icon.style.top = top;
    icon.innerHTML = `
      <img src="https://img.icons8.com/ios-filled/50/000000/activity-history.png" alt="Мониторинг">
      <span>Мониторинг</span>
    `;
    desktop.appendChild(icon);
    // Назначаем обработчик двойного клика для открытия окна
    icon.addEventListener('dblclick', () => {
      openAppWindow('system-monitor');
    });
    // Делаем иконку перетаскиваемой
    makeAppIconsDraggable();
  }

  // --- Ярлыки установленных приложений из магазина ---
  const installedApps = JSON.parse(localStorage.getItem('storeInstalledApps') || '[]');
  const saved = localStorage.getItem('desktopAppPositions');
  const positions = saved ? JSON.parse(saved) : {};
  installedApps.forEach(app => {
    if (!desktop.querySelector(`.app-icon[data-app="${app.id}"]`)) {
      const icon = document.createElement('div');
      icon.className = 'app-icon';
      icon.dataset.app = app.id;
      icon.style.position = 'absolute';
      icon.style.left = positions[app.id]?.left || '0px';
      icon.style.top = positions[app.id]?.top || '0px';
      icon.innerHTML = `
        <img src="${app.icon || 'https://img.icons8.com/ios-filled/50/000000/application-window.png'}" alt="${app.name || app.id}">
        <span>${app.name || app.id}</span>
      `;
      desktop.appendChild(icon);
      icon.addEventListener('dblclick', () => openAppWindow(app.id));
    }
  });
  // После добавления новых иконок — сделать их перетаскиваемыми
  makeAppIconsDraggable();
});

// 2. Добавить в Dock (по умолчанию закреплено)
if (!dockPinned.includes('system-monitor')) {
  dockPinned.push('system-monitor');
  localStorage.setItem('dockApps', JSON.stringify(dockPinned));
}

// 3. Добавить обработку иконки в Dock
// (renderDock уже универсальный, просто добавить картинку)
// ...
// В renderDock:
// ...
    if (app === 'system-monitor') { imgSrc = 'https://img.icons8.com/ios-filled/50/000000/activity-history.png'; alt = 'Мониторинг'; }
// ...

// 4. Добавить обработку окна приложения
// ...
  else if (app === 'system-monitor') {
    content = `
      <div class="system-monitor-app">
        <div class="system-monitor-tabs">
          <button class="system-monitor-tab active" data-tab="processes">Процессы</button>
          <button class="system-monitor-tab" data-tab="cpu">CPU</button>
          <button class="system-monitor-tab" data-tab="memory">Память</button>
          <button class="system-monitor-tab" data-tab="storage">Хранилище</button>
        </div>
        <div class="system-monitor-content">
          <!-- Содержимое вкладки будет подгружаться -->
        </div>
      </div>
    `;
  }
// ...
// После создания окна, если app === 'system-monitor', инициализировать вкладки:
  if (app === 'system-monitor') {
    setTimeout(() => { initSystemMonitorApp(windowEl); }, 0);
  }
// ...

// 5. Реализовать функцию инициализации приложения Мониторинг
function initSystemMonitorApp(win) {
  const tabs = win.querySelectorAll('.system-monitor-tab');
  const content = win.querySelector('.system-monitor-content');
  // Удаляем вкладку 'network'
  win.querySelectorAll('.system-monitor-tab[data-tab="network"]').forEach(tab => tab.remove());

  let processesInterval = null;

  function renderProcesses() {
    const processes = Object.keys(openWindows).map((app, i) => ({
      pid: 1000 + i,
      name: getAppTitle(app),
      mem: (Math.random() * 120 + 40).toFixed(1), // МБ
      status: 'Работает'
    }));
    content.innerHTML = `
      <div style='padding:18px 0 8px 0; text-align:center; color:#888;'>Список процессов (имитация, автообновление)</div>
      <table style='margin:0 auto; min-width:320px; background:#fff; border-radius:8px; box-shadow:0 2px 8px #0001; border-collapse:collapse;'>
        <thead><tr style='background:#f7f7fa;'><th style='padding:6px 16px;'>PID</th><th style='padding:6px 16px;'>Имя</th><th style='padding:6px 16px;'>Память</th><th style='padding:6px 16px;'>Статус</th></tr></thead>
        <tbody>
          ${processes.map(p => `<tr><td style='padding:6px 16px; text-align:center;'>${p.pid}</td><td style='padding:6px 16px;'>${p.name}</td><td style='padding:6px 16px; text-align:right;'>${p.mem} МБ</td><td style='padding:6px 16px; color:#27c93f;'>${p.status}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
  }

  function setTab(tab) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    if (processesInterval) { clearInterval(processesInterval); processesInterval = null; }
    if (tab === 'processes') {
      renderProcesses();
      processesInterval = setInterval(renderProcesses, 2000);
    } else if (tab === 'cpu') {
      content.innerHTML = `<div style='padding:32px 0; text-align:center;'><b>CPU Usage</b><br><span id='cpu-usage-value'>0%</span><div style='height:80px; margin:16px auto 0 auto; max-width:320px; background:#e6eaff; border-radius:8px;'><canvas id='cpu-usage-graph' width='320' height='80'></canvas></div></div>`;
      startFakeCpuUsage(content.querySelector('#cpu-usage-value'), content.querySelector('#cpu-usage-graph'));
    } else if (tab === 'memory') {
      let memTotal = navigator.deviceMemory ? navigator.deviceMemory : 4;
      let memUsed = Math.random() * (memTotal * 0.7) + memTotal * 0.2;
      content.innerHTML = `
        <div style='padding:32px 0; text-align:center;'>
          <b>Память устройства</b><br>
          <div style='margin:18px auto 18px auto; max-width:320px; background:#e6eaff; border-radius:8px; padding:18px 0;'>
            <div style='font-size:18px; margin-bottom:8px;'>${memUsed.toFixed(2)} ГБ / ${memTotal} ГБ</div>
            <div style='height:18px; background:#fff; border-radius:9px; box-shadow:0 1px 4px #0001; overflow:hidden; margin:0 24px;'>
              <div id='mem-bar' style='height:100%; width:${(memUsed/memTotal*100).toFixed(1)}%; background:#007aff; transition:width 0.7s;'></div>
            </div>
          </div>
        </div>
      `;
      // Имитация изменения использования памяти
      const bar = content.querySelector('#mem-bar');
      setInterval(() => {
        memUsed = Math.random() * (memTotal * 0.7) + memTotal * 0.2;
        bar.style.width = (memUsed/memTotal*100).toFixed(1) + '%';
        bar.parentElement.previousElementSibling.textContent = memUsed.toFixed(2) + ' ГБ / ' + memTotal + ' ГБ';
      }, 1800);
    } else if (tab === 'storage') {
      let total = 0;
      let rows = '';
      for (let i = 0; i < localStorage.length; ++i) {
        const k = localStorage.key(i);
        const v = localStorage.getItem(k) || '';
        const size = k.length + v.length;
        total += size;
        rows += `<tr><td style='padding:4px 12px; font-size:15px;'>${k}</td><td style='padding:4px 12px; font-size:15px;'>${v.length}</td></tr>`;
      }
      const totalKB = Math.round(total / 1024);
      content.innerHTML = `
        <div style='font-size:18px; font-weight:600; margin-bottom:12px;'>Использование localStorage</div>
        <table style='width:100%; border-collapse:collapse; background:#f7f7fa; border-radius:12px; box-shadow:0 2px 8px #0001;'>
          <thead><tr style='background:#ececec;'><th style='text-align:left; padding:6px 12px;'>Ключ</th><th style='text-align:left; padding:6px 12px;'>Размер значения (байт)</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style='margin-top:16px; font-size:16px; color:#007aff;'>Всего: <b>${totalKB} КБ</b></div>
      `;
    }
  }
  // Пересобираем tabs после удаления network
  win.querySelectorAll('.system-monitor-tab').forEach(t => t.onclick = () => setTab(t.dataset.tab));
  setTab('processes');
  // Очищаем интервал при закрытии окна
  win.addEventListener('remove', () => { if (processesInterval) clearInterval(processesInterval); });
}

// 6. Фейковый график CPU
function startFakeCpuUsage(valEl, canvas) {
  let usage = 20 + Math.random() * 30;
  let data = Array(32).fill(usage);
  function draw() {
    usage += (Math.random() - 0.5) * 8;
    usage = Math.max(5, Math.min(usage, 98));
    data.push(usage);
    if (data.length > 32) data.shift();
    valEl.textContent = usage.toFixed(1) + '%';
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,320,80);
    ctx.beginPath();
    ctx.moveTo(0,80-data[0]);
    for(let i=1;i<data.length;i++) ctx.lineTo(i*10,80-data[i]);
    ctx.strokeStyle = '#007aff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#e6eaff';
    ctx.lineTo(320,80);
    ctx.lineTo(0,80);
    ctx.closePath();
    ctx.fill();
  }
  setInterval(draw, 700);
}

function initBrowserApp(win) {
  // Если есть .browser-home — показываем домашнюю страницу
  const home = win.querySelector('.browser-home');
  if (home) {
    const searchInput = home.querySelector('.browser-home-search');
    const goBtn = home.querySelector('.browser-home-go');
    const historyDiv = home.querySelector('.browser-home-history');
    let history = JSON.parse(localStorage.getItem('browserHistory') || 'null');
    if (!Array.isArray(history)) history = [];
    // Показываем последние 10 уникальных сайтов
    const unique = Array.from(new Set(history.slice().reverse())).slice(0, 10);
    historyDiv.innerHTML = unique.length ? unique.map(url => `<div class='browser-home-history-item' style='padding:8px 16px; cursor:pointer; border-radius:8px; transition:background 0.18s; color:#007aff; font-size:15px; margin-bottom:2px;' onmouseover="this.style.background='#e6eaff'" onmouseout="this.style.background=''">${url}</div>`).join('') : '<div style="color:#888; padding:8px 16px;">История пуста</div>';
    function go(url) {
      // Заменяем содержимое на обычный браузер
      win.querySelector('.browser-app').innerHTML = `
        <div class="browser-toolbar" style="display:flex; align-items:center; gap:8px; padding:10px 16px; background:#ececec; border-bottom:1px solid #e0e0e0;">
          <button class="browser-nav browser-back" title="Назад" style="width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;">⟨</button>
          <button class="browser-nav browser-forward" title="Вперёд" style="width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;">⟩</button>
          <button class="browser-nav browser-refresh" title="Обновить" style="width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;">⟳</button>
          <button class="browser-nav browser-home-btn" title="Домой" style="width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;">⌂</button>
          <input class="browser-url" type="text" style="flex:1; margin:0 8px; padding:6px 12px; border-radius:8px; border:1px solid #d0d0d0; font-size:15px;" placeholder="Введите адрес или поисковый запрос..." />
          <button class="browser-go" title="Найти" style="width:32px; height:32px; border:none; background:#007aff; border-radius:8px; color:#fff; font-size:18px; cursor:pointer; margin-left:4px;">→</button>
        </div>
        <div class="browser-iframe-container" style="flex:1; background:#fff; border-radius:0 0 12px 12px; overflow:hidden;">
          <iframe class="browser-iframe" src="${url}" style="width:100%; height:100%; border:none; background:#fff;"></iframe>
        </div>
      `;
      setTimeout(() => { initBrowserApp(win); }, 0);
    }
    goBtn.onclick = () => {
      let val = searchInput.value.trim();
      if (!val) return;
      if (!/^https?:\/\//.test(val)) val = 'https://www.bing.com/search?q=' + encodeURIComponent(val);
      go(val);
    };
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') goBtn.onclick();
    });
    historyDiv.querySelectorAll('.browser-home-history-item').forEach(item => {
      item.onclick = () => go(item.textContent);
    });
    return;
  }
  // Обычный браузер
  const urlInput = win.querySelector('.browser-url');
  const iframe = win.querySelector('.browser-iframe');
  const backBtn = win.querySelector('.browser-back');
  const forwardBtn = win.querySelector('.browser-forward');
  const refreshBtn = win.querySelector('.browser-refresh');
  const goBtn = win.querySelector('.browser-go');
  const homeBtn = win.querySelector('.browser-home-btn');
  let history = JSON.parse(localStorage.getItem('browserHistory') || 'null');
  if (!Array.isArray(history) || !history.length) history = ['https://www.bing.com'];
  let historyIndex = history.length - 1;
  function saveHistory() {
    localStorage.setItem('browserHistory', JSON.stringify(history));
  }
  function updateNav() {
    backBtn.disabled = historyIndex <= 0;
    forwardBtn.disabled = historyIndex >= history.length - 1;
    urlInput.value = history[historyIndex] || '';
  }
  function navigate(url, push = true) {
    if (!/^https?:\/\//.test(url)) {
      url = 'https://www.bing.com/search?q=' + encodeURIComponent(url);
    }
    iframe.src = url;
    if (push) {
      history = history.slice(0, historyIndex + 1);
      history.push(url);
      historyIndex = history.length - 1;
      saveHistory();
    }
    updateNav();
  }
  urlInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      navigate(urlInput.value);
    }
  });
  goBtn.onclick = () => {
    navigate(urlInput.value);
  };
  backBtn.onclick = () => {
    if (historyIndex > 0) {
      historyIndex--;
      iframe.src = history[historyIndex];
      updateNav();
      saveHistory();
    }
  };
  forwardBtn.onclick = () => {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      iframe.src = history[historyIndex];
      updateNav();
      saveHistory();
    }
  };
  refreshBtn.onclick = () => {
    iframe.src = history[historyIndex];
  };
  if (homeBtn) {
    homeBtn.onclick = () => {
      win.querySelector('.browser-app').innerHTML = `
        <div class=\"browser-home\" style=\"flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;\">
          <div style=\"font-size:32px; font-weight:600; margin-bottom:24px; color:#007aff;\">Браузер</div>
          <input class=\"browser-home-search\" type=\"text\" style=\"width:340px; max-width:90vw; padding:16px 24px; font-size:20px; border-radius:16px; border:1.5px solid #d0d0d0; margin-bottom:24px; outline:none;\" placeholder=\"Введите адрес или поисковый запрос...\" autofocus />
          <button class=\"browser-home-go\" style=\"padding:10px 36px; font-size:18px; border-radius:10px; border:none; background:#007aff; color:#fff; cursor:pointer; margin-bottom:32px;\">Найти</button>
          <div style=\"font-size:18px; font-weight:500; margin-bottom:8px; color:#444;\">Недавние сайты</div>
          <div class=\"browser-home-history\" style=\"width:340px; max-width:90vw; background:#fff; border-radius:12px; box-shadow:0 2px 8px #0001; padding:12px 0; min-height:40px; max-height:220px; overflow-y:auto;\"></div>
        </div>
      `;
      setTimeout(() => { initBrowserApp(win); }, 0);
    };
  }
  // При смене сайта в iframe (если возможно) — обновлять адресную строку
  iframe.addEventListener('load', () => {
    try {
      const loc = iframe.contentWindow.location.href;
      if (loc && loc !== 'about:blank') {
        urlInput.value = loc;
      }
    } catch (e) {}
  });
  updateNav();
}

function initBrowserTabs(win) {
  // --- State ---
  let tabs = JSON.parse(localStorage.getItem('browserTabs') || 'null');
  if (!Array.isArray(tabs) || !tabs.length) {
    tabs = [{
      id: 'tab' + Date.now(),
      title: 'Новая вкладка',
      url: '',
      history: [],
      historyIndex: -1,
      isHome: true
    }];
  }
  // Восстанавливаем активную вкладку
  let activeTabId = localStorage.getItem('browserActiveTabId');
  if (!activeTabId || !tabs.some(t => t.id === activeTabId)) {
    activeTabId = tabs[0].id;
  }

  const tabsBar = win.querySelector('.browser-tabs-bar');
  const tabsContent = win.querySelector('.browser-tabs-content');

  function saveTabs() {
    localStorage.setItem('browserTabs', JSON.stringify(tabs));
    localStorage.setItem('browserActiveTabId', activeTabId);
  }

  function setActiveTab(id) {
    activeTabId = id;
    saveTabs();
    renderTabs();
    renderTabContent();
  }

  function addTab(url = '', isHome = true) {
    const tab = {
      id: 'tab' + Date.now() + Math.floor(Math.random()*10000),
      title: 'Новая вкладка',
      url,
      history: url ? [url] : [],
      historyIndex: url ? 0 : -1,
      isHome: isHome || !url
    };
    tabs.push(tab);
    setActiveTab(tab.id);
    saveTabs();
  }

  function closeTab(id) {
    const idx = tabs.findIndex(t => t.id === id);
    if (idx === -1) return;
    tabs.splice(idx, 1);
    if (!tabs.length) {
      addTab();
      return;
    }
    if (activeTabId === id) {
      const newIdx = Math.max(0, idx - 1);
      setActiveTab(tabs[newIdx].id);
    } else {
      renderTabs();
      renderTabContent();
    }
    saveTabs();
  }

  function renderTabs() {
    tabsBar.innerHTML = '';
    tabs.forEach(tab => {
      const tabEl = document.createElement('div');
      tabEl.className = 'browser-tab' + (tab.id === activeTabId ? ' active' : '');
      tabEl.style.cssText = `display:flex; align-items:center; gap:6px; padding:7px 18px 7px 14px; border-radius:10px 10px 0 0; background:${tab.id === activeTabId ? '#fff' : 'transparent'}; font-size:15px; font-weight:500; cursor:pointer; position:relative; margin-right:2px; border:1px solid #e0e0e0; border-bottom:none;`;
      tabEl.innerHTML = `<span class=\"browser-tab-title\" style=\"max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;\">${tab.title || 'Новая вкладка'}</span>`;
      const closeBtn = document.createElement('span');
      closeBtn.textContent = '×';
      closeBtn.title = 'Закрыть вкладку';
      closeBtn.style.cssText = 'margin-left:8px; color:#888; font-size:18px; cursor:pointer;';
      closeBtn.onclick = (e) => { e.stopPropagation(); closeTab(tab.id); };
      tabEl.appendChild(closeBtn);
      tabEl.onclick = () => setActiveTab(tab.id);
      tabsBar.appendChild(tabEl);
    });
    // Кнопка +
    const plusBtn = document.createElement('button');
    plusBtn.textContent = '+';
    plusBtn.title = 'Новая вкладка';
    plusBtn.style.cssText = 'margin-left:6px; width:28px; height:28px; border:none; background:#e6eaff; border-radius:8px; color:#007aff; font-size:20px; font-weight:600; cursor:pointer;';
    plusBtn.onclick = () => addTab();
    tabsBar.appendChild(plusBtn);
  }

  function renderTabContent() {
    tabsContent.innerHTML = '';
    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab) return;
    // Домашняя страница
    if (tab.isHome) {
      const homeDiv = document.createElement('div');
      homeDiv.className = 'browser-home';
      homeDiv.style.cssText = 'flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; position:absolute; left:0; right:0; top:0; bottom:0;';
      homeDiv.innerHTML = `
        <div style=\"font-size:32px; font-weight:600; margin-bottom:24px; color:#007aff;\">Браузер</div>
        <input class=\"browser-home-search\" type=\"text\" style=\"width:340px; max-width:90vw; padding:16px 24px; font-size:20px; border-radius:16px; border:1.5px solid #d0d0d0; margin-bottom:24px; outline:none;\" placeholder=\"Введите адрес или поисковый запрос...\" autofocus />
        <button class=\"browser-home-go\" style=\"padding:10px 36px; font-size:18px; border-radius:10px; border:none; background:#007aff; color:#fff; cursor:pointer; margin-bottom:32px;\">Найти</button>
        <div style=\"font-size:18px; font-weight:500; margin-bottom:8px; color:#444;\">Недавние сайты</div>
        <div class=\"browser-home-history\" style=\"width:340px; max-width:90vw; background:#fff; border-radius:12px; box-shadow:0 2px 8px #0001; padding:12px 0; min-height:40px; max-height:220px; overflow-y:auto;\"></div>
      `;
      tabsContent.appendChild(homeDiv);
      // История
      let historyArr = JSON.parse(localStorage.getItem('browserHistory') || 'null');
      if (!Array.isArray(historyArr)) historyArr = [];
      const unique = Array.from(new Set(historyArr.slice().reverse())).slice(0, 10);
      const historyDiv = homeDiv.querySelector('.browser-home-history');
      historyDiv.innerHTML = unique.length ? unique.map(url => `<div class='browser-home-history-item' style='padding:8px 16px; cursor:pointer; border-radius:8px; transition:background 0.18s; color:#007aff; font-size:15px; margin-bottom:2px;' onmouseover=\"this.style.background='#e6eaff'\" onmouseout=\"this.style.background=''\">${url}</div>`).join('') : '<div style=\"color:#888; padding:8px 16px;\">История пуста</div>';
      function go(url) {
        tab.isHome = false;
        tab.url = url;
        tab.history = [url];
        tab.historyIndex = 0;
        tab.title = url.replace(/^https?:\/\//,'').split('/')[0];
        saveTabs();
        setActiveTab(tab.id);
      }
      homeDiv.querySelector('.browser-home-go').onclick = () => {
        let val = homeDiv.querySelector('.browser-home-search').value.trim();
        if (!val) return;
        if (!/^https?:\/\//.test(val)) val = 'https://www.bing.com/search?q=' + encodeURIComponent(val);
        go(val);
      };
      homeDiv.querySelector('.browser-home-search').addEventListener('keydown', e => {
        if (e.key === 'Enter') homeDiv.querySelector('.browser-home-go').onclick();
      });
      historyDiv.querySelectorAll('.browser-home-history-item').forEach(item => {
        item.onclick = () => go(item.textContent);
      });
      return;
    }
    // Обычный браузер
    const browserDiv = document.createElement('div');
    browserDiv.className = 'browser-tab-content';
    browserDiv.style.cssText = 'display:flex; flex-direction:column; height:100%; width:100%; position:absolute; left:0; right:0; top:0; bottom:0; background:#fff; border-radius:0 0 12px 12px;';
    browserDiv.innerHTML = `
      <div class=\"browser-toolbar\" style=\"display:flex; align-items:center; gap:8px; padding:10px 16px; background:#ececec; border-bottom:1px solid #e0e0e0;\">
        <button class=\"browser-nav browser-back\" title=\"Назад\" style=\"width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;\">⟨</button>
        <button class=\"browser-nav browser-forward\" title=\"Вперёд\" style=\"width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;\">⟩</button>
        <button class=\"browser-nav browser-refresh\" title=\"Обновить\" style=\"width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;\">⟳</button>
        <button class=\"browser-nav browser-home-btn\" title=\"Домой\" style=\"width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;\">⌂</button>
        <input class=\"browser-url\" type=\"text\" style=\"flex:1; margin:0 8px; padding:6px 12px; border-radius:8px; border:1px solid #d0d0d0; font-size:15px;\" placeholder=\"Введите адрес или поисковый запрос...\" />
        <button class=\"browser-go\" title=\"Найти\" style=\"width:32px; height:32px; border:none; background:#007aff; border-radius:8px; color:#fff; font-size:18px; cursor:pointer; margin-left:4px;\">→</button>
      </div>
      <div class=\"browser-iframe-container\" style=\"flex:1; background:#fff; border-radius:0 0 12px 12px; overflow:hidden;\">
        <iframe class=\"browser-iframe\" src=\"${tab.url}\" style=\"width:100%; height:100%; border:none; background:#fff;\"></iframe>
      </div>
    `;
    tabsContent.appendChild(browserDiv);
    // --- Логика вкладки ---
    const urlInput = browserDiv.querySelector('.browser-url');
    const iframe = browserDiv.querySelector('.browser-iframe');
    const backBtn = browserDiv.querySelector('.browser-back');
    const forwardBtn = browserDiv.querySelector('.browser-forward');
    const refreshBtn = browserDiv.querySelector('.browser-refresh');
    const goBtn = browserDiv.querySelector('.browser-go');
    const homeBtn = browserDiv.querySelector('.browser-home-btn');
    function saveTabHistory() {
      saveTabs();
      // Глобальная история
      let globalHistory = JSON.parse(localStorage.getItem('browserHistory') || '[]');
      if (!globalHistory.includes(tab.url)) {
        globalHistory.push(tab.url);
        localStorage.setItem('browserHistory', JSON.stringify(globalHistory));
      }
    }
    function updateNav() {
      backBtn.disabled = tab.historyIndex <= 0;
      forwardBtn.disabled = tab.historyIndex >= tab.history.length - 1;
      urlInput.value = tab.history[tab.historyIndex] || '';
      // Заголовок вкладки
      tab.title = (tab.history[tab.historyIndex] || 'Новая вкладка').replace(/^https?:\/\//,'').split('/')[0];
      renderTabs();
    }
    function navigate(url, push = true) {
      if (!/^https?:\/\//.test(url)) {
        url = 'https://www.bing.com/search?q=' + encodeURIComponent(url);
      }
      iframe.src = url;
      if (push) {
        tab.history = tab.history.slice(0, tab.historyIndex + 1);
        tab.history.push(url);
        tab.historyIndex = tab.history.length - 1;
        tab.url = url;
        saveTabHistory();
      }
      updateNav();
    }
    urlInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        navigate(urlInput.value);
      }
    });
    goBtn.onclick = () => {
      navigate(urlInput.value);
    };
    backBtn.onclick = () => {
      if (tab.historyIndex > 0) {
        tab.historyIndex--;
        tab.url = tab.history[tab.historyIndex];
        iframe.src = tab.url;
        updateNav();
        saveTabHistory();
      }
    };
    forwardBtn.onclick = () => {
      if (tab.historyIndex < tab.history.length - 1) {
        tab.historyIndex++;
        tab.url = tab.history[tab.historyIndex];
        iframe.src = tab.url;
        updateNav();
        saveTabHistory();
      }
    };
    refreshBtn.onclick = () => {
      iframe.src = tab.url;
    };
    if (homeBtn) {
      homeBtn.onclick = () => {
        tab.isHome = true;
        saveTabs();
        setActiveTab(tab.id);
      };
    }
    iframe.addEventListener('load', () => {
      try {
        const loc = iframe.contentWindow.location.href;
        if (loc && loc !== 'about:blank') {
          urlInput.value = loc;
          tab.title = loc.replace(/^https?:\/\//,'').split('/')[0];
          renderTabs();
        }
      } catch (e) {}
    });
    updateNav();
  }
  renderTabs();
  renderTabContent();
}

// --- Ярлыки установленных приложений из магазина ---
function updateDesktopAppIcons() {
  const desktop = document.getElementById('desktop');
  const installedApps = JSON.parse(localStorage.getItem('storeInstalledApps') || '[]');
  const saved = localStorage.getItem('desktopAppPositions');
  const positions = saved ? JSON.parse(saved) : {};
  // Удаляем все ярлыки установленных приложений (кроме стандартных)
  desktop.querySelectorAll('.app-icon').forEach(icon => {
    const appId = icon.dataset.app;
    // system-monitor и стандартные приложения не трогаем
    if (appId === 'notes' || appId === 'browser' || appId === 'settings' || appId === 'smile-chat' || appId === 'store' || appId === 'system-monitor') return;
    // Если приложение больше не установлено — удалить ярлык
    if (!installedApps.some(a => a.id === appId)) {
      icon.remove();
    }
  });
  // Добавляем ярлыки для новых установленных приложений
  installedApps.forEach(app => {
    if (!desktop.querySelector(`.app-icon[data-app="${app.id}"]`)) {
      const icon = document.createElement('div');
      icon.className = 'app-icon';
      icon.dataset.app = app.id;
      icon.style.position = 'absolute';
      icon.style.left = positions[app.id]?.left || '0px';
      icon.style.top = positions[app.id]?.top || '0px';
      icon.innerHTML = `
        <img src="${app.icon || 'https://img.icons8.com/ios-filled/50/000000/application-window.png'}" alt="${app.name || app.id}">
        <span>${app.name || app.id}</span>
      `;
      desktop.appendChild(icon);
      icon.addEventListener('dblclick', () => openAppWindow(app.id));
    }
  });
  makeAppIconsDraggable();
}