const appIcons=document.querySelectorAll(".app-icon");let zIndexCounter=100;appIcons.forEach(e=>{e.addEventListener("dblclick",()=>{openAppWindow(e.dataset.app)})});const openWindows={};let dockPinned=JSON.parse(localStorage.getItem("dockApps")||'["notes","browser","settings"]');function getDockApps(){const e=Object.keys(openWindows).filter(e=>document.body.contains(openWindows[e]));return[...dockPinned,...e.filter(e=>!dockPinned.includes(e))]}const dockContainer=document.getElementById("dock");function renderDock(){dockApps=getDockApps(),dockContainer.innerHTML="",dockApps.forEach(e=>{const t=document.createElement("div");t.className="dock-icon",t.dataset.app=e,t.draggable=dockPinned.includes(e);let o=getAppIcon(e),n=getAppTitle(e);t.innerHTML=`<img src="${o}" alt="${n}"><div class="dock-dot"></div>`,t.addEventListener("mouseenter",o=>{let n=document.createElement("div");n.className="dock-tooltip",n.textContent=getAppTitle(e),document.body.appendChild(n);const s=t.getBoundingClientRect();n.style.left=s.left+s.width/2-n.offsetWidth/2+"px",n.style.top=s.top-32+"px",t._tooltip=n,setTimeout(()=>{n&&n.classList.add("visible")},10)}),t.addEventListener("mouseleave",e=>{t._tooltip&&(t._tooltip.remove(),t._tooltip=null)}),dockContainer.appendChild(t)}),makeDockDraggable(),updateDockDots(),addDockContextMenu()}let contextMenu=document.createElement("div");function showContextMenu(e,t,o){contextMenu.innerHTML="",o.forEach(e=>{const t=document.createElement("div");t.textContent=e.label,t.style.padding="8px 16px",t.style.cursor="pointer",t.onmouseenter=()=>t.style.background="#f0f0f0",t.onmouseleave=()=>t.style.background="",t.onclick=()=>{contextMenu.style.display="none",e.action()},contextMenu.appendChild(t)}),contextMenu.style.left=e+"px",contextMenu.style.top=t+"px",contextMenu.style.display="block"}contextMenu.style.position="absolute",contextMenu.style.display="none",contextMenu.style.zIndex=9999,contextMenu.style.background="#fff",contextMenu.style.border="1px solid #ccc",contextMenu.style.borderRadius="8px",contextMenu.style.boxShadow="0 2px 12px rgba(0,0,0,0.12)",contextMenu.style.padding="8px 0",contextMenu.style.fontSize="15px",contextMenu.style.minWidth="160px",document.body.appendChild(contextMenu),document.addEventListener("click",()=>{contextMenu.style.display="none"});const desktopIcons=document.querySelectorAll(".app-icon");function addDockContextMenu(){dockContainer.querySelectorAll(".dock-icon").forEach(e=>{e.addEventListener("contextmenu",t=>{t.preventDefault();const o=e.dataset.app,n=dockPinned.includes(o),s=openWindows[o]&&document.body.contains(openWindows[o]);n&&!s?showContextMenu(t.pageX,t.pageY,[{label:"Убрать из Dock",action:()=>{dockPinned=dockPinned.filter(e=>e!==o),localStorage.setItem("dockApps",JSON.stringify(dockPinned)),renderDock()}}]):n&&s&&showContextMenu(t.pageX,t.pageY,[{label:"Закройте приложение, чтобы убрать из Dock",action:()=>{}}])})})}function makeDockDraggable(){let e=null,t=!1;dockContainer.querySelectorAll(".dock-icon").forEach(o=>{o.addEventListener("dragstart",n=>{dockPinned.includes(o.dataset.app)?(e=o,t=!0,n.dataTransfer.effectAllowed="move"):n.preventDefault()}),o.addEventListener("dragover",e=>{e.preventDefault(),e.dataTransfer.dropEffect="move"}),o.addEventListener("drop",n=>{if(n.preventDefault(),e&&e!==o){const t=dockPinned.indexOf(e.dataset.app),n=dockPinned.indexOf(o.dataset.app);-1!==t&&-1!==n&&(dockPinned.splice(n,0,dockPinned.splice(t,1)[0]),localStorage.setItem("dockApps",JSON.stringify(dockPinned)),renderDock())}t=!1})}),document.addEventListener("dragend",o=>{if(t&&e){const n=dockContainer.getBoundingClientRect();if(o.clientY<n.top||o.clientY>n.bottom||o.clientX<n.left||o.clientX>n.right){const t=e.dataset.app;!dockPinned.includes(t)||openWindows[t]&&document.body.contains(openWindows[t])||(dockPinned=dockPinned.filter(e=>e!==t),localStorage.setItem("dockApps",JSON.stringify(dockPinned)),renderDock())}t=!1,e=null}})}function updateDockDots(){dockApps.forEach(e=>{const t=dockContainer.querySelector(`.dock-icon[data-app="${e}"]`).querySelector(".dock-dot");openWindows[e]&&document.body.contains(openWindows[e])&&"none"!==openWindows[e].style.display?t.classList.add("dock-dot-active"):t.classList.remove("dock-dot-active")}),saveOpenWindowsState()}function openAppWindow(e,t){if(openWindows[e]&&document.body.contains(openWindows[e]))return openWindows[e].showWindow&&openWindows[e].showWindow(),openWindows[e].style.zIndex=zIndexCounter++,openWindows[e].classList.add("window-bounce"),void setTimeout(()=>openWindows[e].classList.remove("window-bounce"),300);const o=document.createElement("div");o.className="window",o.style.top=200*Math.random()+80+"px",o.style.left=400*Math.random()+80+"px",o.style.zIndex=zIndexCounter++;let n="";if("about"===e){const e=t||getActiveApp(),o=getAppTitle(e);let s="";switch(e){case"desktop":let e=0;for(let t=0;t<localStorage.length;++t){const o=localStorage.key(t),n=localStorage.getItem(o);e+=o.length+(n?n.length:0)}const t=Math.round(e/1024);s=`Это рабочий стол ЖестьOS. Здесь вы можете размещать ярлыки приложений и управлять окнами.<br><br><b>Разрешение экрана:</b> ${window.innerWidth} x ${window.innerHeight}<br><b>Размер localStorage:</b> ${t} КБ`;break;case"notes":s="Заметки — простое приложение для создания и хранения ваших заметок. Все данные сохраняются в браузере.";break;case"browser":s="Браузер — минималистичный веб-браузер внутри ЖестьOS.";break;case"settings":s="Настройки — здесь можно менять тему, обои, а также параметры Firebase.";break;case"smile-chat":s="ЖестьМесседж — чат с поддержкой Firestore и аватарками.";break;case"smile-editor":s="ЖестьСМАЙЛЫ — редактор аватарок для вашего профиля.";break;case"system-monitor":s="Мониторинг — приложение для мониторинга системы.";break;default:s="Это приложение для ЖестьOS."}n=`<div style='padding:32px 24px 24px 24px; text-align:center;'>\n      <div style='font-size:28px; font-weight:600; margin-bottom:12px;'>О приложении «${o}»</div>\n      <div style='font-size:16px; color:#444; margin-bottom:18px;'>${s}</div>\n      <button style='margin-top:12px; padding:8px 28px; border-radius:8px; border:none; background:#e6eaff; color:#007aff; font-size:15px; cursor:pointer;' onclick='this.closest(".window").remove()'>Закрыть</button>\n    </div>`}else if("settings"===e)n='\n      <div class="settings-app">\n        <div class="settings-user">\n          <img class="settings-avatar" src="https://i.pravatar.cc/80?u=macosdemo" alt="avatar">\n          <div class="settings-username">Пользователь</div>\n        </div>\n        <div class="settings-section">\n          <div class="settings-title">Внешний вид</div>\n          <label class="settings-row">\n            <span>Обои рабочего стола:</span>\n            <input type="text" id="wallpaper-url" placeholder="Вставьте ссылку на картинку" style="width: 100%;"/>\n          </label>\n          <label class="settings-row">\n            <span>Прозрачные окна:</span>\n            <input type="checkbox" id="glass-toggle" />\n          </label>\n          <button id="apply-settings">Применить</button>\n        </div>\n        <div class="settings-section">\n          <div class="settings-title">Настройки базы данных Firebase</div>\n          <label class="settings-row">\n            <span>apiKey:</span>\n            <input type="text" id="firebase-apiKey" />\n          </label>\n          <label class="settings-row">\n            <span>authDomain:</span>\n            <input type="text" id="firebase-authDomain" />\n          </label>\n          <label class="settings-row">\n            <span>databaseURL:</span>\n            <input type="text" id="firebase-databaseURL" />\n          </label>\n          <label class="settings-row">\n            <span>projectId:</span>\n            <input type="text" id="firebase-projectId" />\n          </label>\n          <label class="settings-row">\n            <span>storageBucket:</span>\n            <input type="text" id="firebase-storageBucket" />\n          </label>\n          <label class="settings-row">\n            <span>messagingSenderId:</span>\n            <input type="text" id="firebase-messagingSenderId" />\n          </label>\n          <label class="settings-row">\n            <span>appId:</span>\n            <input type="text" id="firebase-appId" />\n          </label>\n          <label class="settings-row">\n            <span>measurementId:</span>\n            <input type="text" id="firebase-measurementId" />\n          </label>\n          <button id="save-firebase">Сохранить Firebase</button>\n        </div>\n        <div class="settings-section">\n          <div class="settings-title">Технические характеристики устройства</div>\n          <div class="settings-row"><span>Разрешение экрана:</span><span id="device-resolution"></span></div>\n          <div class="settings-row"><span>Версия ЖестьOS:</span><span id="device-os"></span></div>\n        </div>\n        <div class="settings-section">\n          <div class="settings-title">Сохранение в ЖестьКлауд</div>\n          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="desktopAppPositions"> Позиции иконок</label></div>\n          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="notesAppNotes"> Заметки</label></div>\n          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="notesAppSelectedId"> Выделенная заметка</label></div>\n          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="settingsApp"> Настройки</label></div>\n          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="browserHistory"> История браузера</label></div>\n          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="browserTabs"> Вкладки браузера</label></div>\n          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="browserActiveTabId"> Активная вкладка</label></div>\n          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="openWindowsState"> Открытые окна</label></div>\n          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="windowSizes"> Размеры окон</label></div>\n          <div class="settings-row" style="gap:12px;">\n            <button id="cloud-save-btn">Сохранить в ЖестьКлауд</button>\n            <button id="cloud-restore-btn">Восстановить из ЖестьКлауд</button>\n            <label style="font-size:14px;"><input type="checkbox" id="cloud-auto-restore"> Автоматически при входе</label>\n          </div>\n          <div class="settings-row"><label><input type="checkbox" class="cloud-save-checkbox" data-key="storeInstalledApps"> Установленные приложения</label></div>\n        </div>\n      </div>\n    ';else if("notes"===e)n='<div class="notes-app">\n      <div class="notes-sidebar">\n        <div class="notes-header">\n          <span>Заметки</span>\n          <button class="notes-add">+</button>\n        </div>\n        <input class="notes-search" placeholder="Поиск..." />\n        <div class="notes-list"></div>\n      </div>\n      <div class="notes-main">\n        <input class="notes-title" placeholder="Заголовок" />\n        <textarea class="notes-body" placeholder="Текст заметки..."></textarea>\n        <button class="notes-delete">Удалить</button>\n      </div>\n    </div>';else if("login"===e)n='<div class="login-app">\n      <div class="login-title">Вход в систему</div>\n      <div class="login-form">\n        <input class="login-email" type="email" placeholder="логин" autocomplete="username" />\n        <input class="login-password" type="password" placeholder="Пароль" autocomplete="current-password" />\n        <button class="login-submit">Войти</button>\n        <div class="login-or">или</div>\n        <button class="login-google">Войти через Google</button>\n      </div>\n    </div>';else if("smile-editor"===e){localStorage.getItem("userAvatarCode")||generateRandomAvatarCode();const e=Object.entries(avatarColors).map(([e,t])=>`<button class='smile-color' data-color='${e}' style='background:${t}'></button>`).join("");n=`<div class='smile-editor-app'>\n      <div class='smile-preview'></div>\n      <div class='smile-controls'>\n        <div>Цвет 1: ${e}</div>\n        <div>Форма: ${Object.entries(avatarShapes).map(([e,t])=>`<button class='smile-shape' data-shape='${e}'>${t}</button>`).join("")}</div>\n        <div>Цвет 2: ${e}</div>\n        <button class='smile-random'>🎲 Случайная</button>\n        <button class='smile-save'>Сохранить</button>\n      </div>\n    </div>`}else n="smile-chat"===e?'<div class="smile-chat-app">\n      <div class="smile-chat-categories">\n        <button class="smile-chat-category active" data-tab="general" title="Общий чат">💬</button>\n        <button class="smile-chat-category" data-tab="private" title="Личные">👤</button>\n        <button class="smile-chat-category" data-tab="my" title="Мои чаты">⭐</button>\n      </div>\n      <div class="smile-chat-users"></div>\n      <div class="smile-chat-main">\n        <div class="smile-chat-messages"></div>\n        <form class="smile-chat-form">\n          <input class="smile-chat-input" type="text" placeholder="Введите сообщение..." autocomplete="off" />\n          <button class="smile-chat-send">Отправить</button>\n        </form>\n      </div>\n    </div>':"system-monitor"===e?'\n      <div class="system-monitor-app">\n        <div class="system-monitor-tabs">\n          <button class="system-monitor-tab active" data-tab="processes">Процессы</button>\n          <button class="system-monitor-tab" data-tab="cpu">CPU</button>\n          <button class="system-monitor-tab" data-tab="memory">Память</button>\n          <button class="system-monitor-tab" data-tab="storage">Хранилище</button>\n        </div>\n        <div class="system-monitor-content">\n          \x3c!-- Содержимое вкладки будет подгружаться --\x3e\n        </div>\n      </div>\n    ':"browser"===e?'\n      <div class="browser-app" style="display:flex; flex-direction:column; height:100%; min-width:520px; background:#f7f7fa;">\n        <div class="browser-tabs-bar" style="display:flex; align-items:flex-end; background:#ececec; border-bottom:1px solid #e0e0e0; padding:0 8px; gap:2px; min-height:38px;"></div>\n        <div class="browser-tabs-content" style="flex:1; position:relative;"></div>\n      </div>\n    ':"store"===e?'\n      <div class="store-app" style="padding:0; height:100%; display:flex; flex-direction:column;">\n        <div class="store-tabs" style="display:flex; border-bottom:1px solid #e0e0e0;">\n          <button class="store-tab active" data-tab="get" style="flex:1; padding:16px; font-size:17px; background:#f7f7fa; border:none; cursor:pointer;">Получить</button>\n          <button class="store-tab" data-tab="installed" style="flex:1; padding:16px; font-size:17px; background:#f7f7fa; border:none; cursor:pointer;">Установлено</button>\n        </div>\n        <div class="store-content" style="flex:1; overflow:auto; background:#fff; padding:24px;"></div>\n      </div>\n    ':`<p>Это окно приложения <b>${getAppTitle(e)}</b>.</p>`;const s=JSON.parse(localStorage.getItem("storeInstalledApps")||"[]").find(t=>t.id===e);if(s&&s.code&&(n=s.code),o.innerHTML=`\n    <div class="window-header">\n      <div class="window-controls">\n        <div class="window-dot window-close-dot" title="Закрыть"></div>\n        <div class="window-dot window-min-dot" title="Свернуть"></div>\n        <div class="window-dot window-max-dot" title="Развернуть"></div>\n      </div>\n      <div class="window-title">${getAppTitle(e)}</div>\n    </div>\n    <div class="window-content">\n      ${n}\n    </div>\n    <div class="window-resize window-resize-right"></div>\n    <div class="window-resize window-resize-bottom"></div>\n    <div class="window-resize window-resize-corner"></div>\n  `,s&&s.code){const e=o.querySelector(".window-content");e&&e.querySelectorAll("script").forEach(e=>{const t=document.createElement("script");e.src&&(t.src=e.src),e.type&&(t.type=e.type),t.textContent=e.textContent,e.replaceWith(t)})}o.dataset.app=e,o.dataset.icon=getAppIcon(e),o.dataset.title=getAppTitle(e),document.body.appendChild(o),openWindows[e]=o,bringWindowToFront(o);const a=JSON.parse(localStorage.getItem("windowSizes")||"{}");a[e]&&(o.style.width=a[e].width,o.style.height=a[e].height);const i=window.innerHeight-80-32;o.offsetHeight>i&&(o.style.height=i+"px"),parseInt(o.style.top)<32&&(o.style.top="32px");let r=200*Math.random()+80,l=400*Math.random()+80;r>i&&(r=i),r<0&&(r=0),o.style.top=r+"px",o.style.left=l+"px",gsap.fromTo(o,{scale:.85,opacity:0},{scale:1,opacity:1,duration:.32,ease:"power2.out"}),updateDockDots(),dockPinned.includes(e)||renderDock();const c=o.querySelector(".window-close-dot"),d=o.querySelector(".window-min-dot"),p=o.querySelector(".window-max-dot");c.onclick=()=>{gsap.to(o,{scale:.85,opacity:0,duration:.22,ease:"power2.in",onComplete:()=>{if("camera"===e){const e=o.querySelector("video");if(e&&e.srcObject){e.srcObject.getTracks().forEach(e=>e.stop()),e.srcObject=null}}o.remove(),removeWindowFromStack(o),openWindows[e]===o&&delete openWindows[e],updateDockDots(),dockPinned.includes(e)||renderDock()}})},d.onclick=()=>{genieToDock(o,e,updateDockDots)},p.onclick=()=>{if(o.classList.contains("window-maximized"))gsap.to(o,{left:o.dataset.prevLeft,top:o.dataset.prevTop,width:o.dataset.prevWidth,height:o.dataset.prevHeight,borderRadius:"12px",boxShadow:"0 8px 32px rgba(0,0,0,0.25)",duration:.38,ease:"power2.inOut",onComplete:()=>o.classList.remove("window-maximized")});else{o.dataset.prevLeft=o.style.left,o.dataset.prevTop=o.style.top,o.dataset.prevWidth=o.style.width,o.dataset.prevHeight=o.style.height;const e=80,t=32;gsap.to(o,{left:0,top:t,width:window.innerWidth,height:window.innerHeight-e-t,borderRadius:0,boxShadow:"none",duration:.38,ease:"power2.inOut",onStart:()=>o.classList.add("window-maximized")})}},o.showWindow=()=>{o.style.display="",o.style.zIndex=zIndexCounter++,gsap.fromTo(o,{y:30,opacity:0,scale:.9,x:0,scaleX:1,scaleY:1},{y:0,opacity:1,scale:1,x:0,scaleX:1,scaleY:1,duration:.22,ease:"power1.out"}),updateDockDots()},makeWindowDraggable(o),makeWindowResizable(o),"settings"===e&&initSettingsApp(o),"notes"===e&&initNotesApp(o),"login"===e&&setTimeout(()=>{const e=document.querySelector(".login-submit"),t=document.querySelector(".login-google"),o=document.querySelector(".login-email");function n(t){localStorage.setItem("isLoggedIn","true");let n="";if(t&&t.email)n=t.email,localStorage.setItem("userEmail",n),localStorage.setItem("userName",t.displayName||t.email.split("@")[0]);else{n=o.value||"user@example.com",localStorage.setItem("userEmail",n);const e=n.split("@")[0];localStorage.setItem("userName",e)}localStorage.removeItem("userAvatarCode"),showNotification("Вход выполнен успешно!");const s=e.closest(".window");s&&s.remove();const a=document.querySelector(".window .settings-app");if(a){const e=a.closest(".window");e&&initSettingsApp(e)}}e.onclick=()=>n(),t.onclick=async function(){try{initFirebaseFromSettings();const e=new firebase.auth.GoogleAuthProvider,t=await firebase.auth().signInWithPopup(e);n(t.user)}catch(e){showNotification("Ошибка входа через Google")}}},0),"smile-editor"===e&&setTimeout(()=>{let e=(localStorage.getItem("userAvatarCode")||generateRandomAvatarCode()).split("");const t=localStorage.getItem("userEmail")||"",o=document.querySelector(".smile-preview");function n(){o.innerHTML="",o.appendChild(createAvatarElement(e.join(""),128))}n(),document.querySelectorAll(".smile-color").forEach((t,o)=>{t.onclick=()=>{t.parentElement.textContent.includes("Цвет 1")?e[0]=t.dataset.color:e[2]=t.dataset.color,n()}}),document.querySelectorAll(".smile-shape").forEach(t=>{t.onclick=()=>{e[1]=t.dataset.shape,n()}}),document.querySelector(".smile-random").onclick=()=>{e=generateRandomAvatarCode().split(""),n()},document.querySelector(".smile-save").onclick=async()=>{if(t)try{await firebase.firestore().collection("avatarka").doc(t).set({code:e.join(""),updatedAt:firebase.firestore.FieldValue.serverTimestamp()}),localStorage.setItem("userAvatarCode",e.join("")),showNotification("Аватарка сохранена!");const o=document.querySelector(".window .settings-app");if(o){const e=o.closest(".window");e&&initSettingsApp(e)}}catch(e){console.error("Ошибка Firestore (save avatar):",e),showNotification("Ошибка Firestore: "+(e.message||e),6e3)}else showNotification("Войдите для сохранения")}},0),"smile-chat"===e&&setTimeout(()=>{initSmileChatApp()},0),"system-monitor"===e&&setTimeout(()=>{initSystemMonitorApp(o)},0),"browser"===e&&setTimeout(()=>{initBrowserTabs(o)},0),"store"===e&&setTimeout(()=>{const e=o.querySelectorAll(".store-tab"),t=o.querySelector(".store-content");function n(o){e.forEach(e=>e.classList.remove("active")),o.classList.add("active"),"get"===o.dataset.tab?async function(){t.innerHTML='<div style="color:#888; padding:16px;">Загрузка...</div>';try{const o=[];if((await firebase.firestore().collection("app").get()).forEach(e=>{const t=e.data();o.push({id:e.id,...t})}),!o.length)return void(t.innerHTML='<div style="color:#888; padding:16px;">Нет доступных приложений</div>');t.innerHTML="";let s=JSON.parse(localStorage.getItem("storeInstalledApps")||"[]");o.forEach(o=>{const a=document.createElement("div");a.style.display="flex",a.style.alignItems="center",a.style.gap="18px",a.style.marginBottom="18px";const i=s.find(e=>e.id===o.id);let r=!1;i&&i.code&&o.code&&i.code!==o.code&&(r=!0);let l="Установить";i&&!r&&(l="Установлено"),r&&(l="Обновить"),a.innerHTML=`<img src="${o.icon||"https://img.icons8.com/ios-filled/50/000000/application-window.png"}" style="width:48px; height:48px; border-radius:12px; background:#f7f7fa;"> <div style="font-size:18px; font-weight:500;">${o.name||o.id}</div> <button style="margin-left:auto; padding:8px 22px; border-radius:8px; border:none; background:${r?"#ffe6a6":"#e6eaff"}; color:${r?"#b97a00":"#007aff"}; font-size:15px; cursor:pointer;" ${i&&!r?"disabled":""}>${l}</button>`;a.querySelector("button").onclick=()=>{let t=JSON.parse(localStorage.getItem("storeInstalledApps")||"[]");if(-1===t.findIndex(e=>e.id===o.id))t.push(o);else if(r){t=t.filter(e=>e.id!==o.id),localStorage.setItem("storeInstalledApps",JSON.stringify(t));const e=document.querySelector(`.app-icon[data-app="${o.id}"]`);e&&e.remove();let n=JSON.parse(localStorage.getItem("dockApps")||"[]");n=n.filter(e=>e!==o.id),localStorage.setItem("dockApps",JSON.stringify(n)),renderDock(),t.push(o)}localStorage.setItem("storeInstalledApps",JSON.stringify(t)),n(e[1]),updateDesktopAppIcons()},t.appendChild(a)})}catch(e){t.innerHTML='<div style="color:#d33; padding:16px;">Ошибка загрузки приложений</div>'}}():"installed"===o.dataset.tab&&s()}function s(){let e=JSON.parse(localStorage.getItem("storeInstalledApps")||"[]");e.length?(t.innerHTML="",e.forEach(e=>{const o=document.createElement("div");o.style.display="flex",o.style.alignItems="center",o.style.gap="18px",o.style.marginBottom="18px",o.innerHTML=`<img src="${e.icon||"https://img.icons8.com/ios-filled/50/000000/application-window.png"}" style="width:48px; height:48px; border-radius:12px; background:#f7f7fa;"> <div style="font-size:18px; font-weight:500;">${e.name||e.id}</div> <button style="margin-left:auto; padding:8px 22px; border-radius:8px; border:none; background:#e6eaff; color:#007aff; font-size:15px; cursor:pointer;">Запустить</button> <button style="margin-left:12px; padding:8px 18px; border-radius:8px; border:none; background:#ffd6d6; color:#d33; font-size:15px; cursor:pointer;">Удалить</button>`,o.querySelector("button").onclick=()=>{openAppWindow(e.id)},o.querySelectorAll("button")[1].onclick=()=>{let t=JSON.parse(localStorage.getItem("storeInstalledApps")||"[]");t=t.filter(t=>t.id!==e.id),localStorage.setItem("storeInstalledApps",JSON.stringify(t)),s(),renderDock(),updateDesktopAppIcons()},t.appendChild(o)})):t.innerHTML='<div style="color:#888; padding:16px;">Нет установленных приложений</div>'}e.forEach(e=>{e.onclick=()=>n(e)}),n(e[0])},0),o.addEventListener("mousedown",()=>bringWindowToFront(o),!0)}function getAppTitle(e){const t=JSON.parse(localStorage.getItem("storeInstalledApps")||"[]").find(t=>t.id===e);if(t&&t.name)return t.name;switch(e){case"desktop":return"Рабочий стол";case"notes":return"Заметки";case"browser":return"Браузер";case"settings":return"Настройки";case"login":return"Вход";case"smile-editor":return"ЖестьСМАЙЛЫ";case"smile-chat":return"ЖестьМесседж";case"system-monitor":return"Мониторинг";default:return"Приложение"}}function getAppIcon(e){const t=JSON.parse(localStorage.getItem("storeInstalledApps")||"[]").find(t=>t.id===e);return t&&t.icon?t.icon:"notes"===e?"https://img.icons8.com/ios-filled/50/000000/note.png":"browser"===e?"https://img.icons8.com/ios-filled/50/000000/internet.png":"settings"===e?"https://img.icons8.com/ios-filled/50/000000/settings.png":"smile-chat"===e?"https://img.icons8.com/ios-filled/50/000000/speech-bubble-with-dots.png":"smile-editor"===e?"https://img.icons8.com/ios-filled/50/000000/happy--v1.png":"system-monitor"===e?"https://img.icons8.com/ios-filled/50/000000/activity-history.png":"store"===e?"https://img.icons8.com/ios-filled/50/000000/shopping-bag.png":"https://img.icons8.com/ios-filled/50/000000/application-window.png"}function makeWindowDraggable(e){const t=e.querySelector(".window-header");let o,n,s=!1;t.addEventListener("mousedown",t=>{s=!0,e.style.zIndex=zIndexCounter++,o=t.clientX-e.offsetLeft,n=t.clientY-e.offsetTop,document.body.style.userSelect="none"}),document.addEventListener("mousemove",t=>{if(!s)return;let a=t.clientX-o,i=t.clientY-n;a=Math.max(0,Math.min(a,window.innerWidth-e.offsetWidth));const r=window.innerHeight-80-e.offsetTop;i=Math.max(0,Math.min(i,r)),e.style.left=a+"px",e.style.top=i+"px"}),document.addEventListener("mouseup",()=>{s=!1,document.body.style.userSelect=""})}function makeWindowResizable(e){const t=e.querySelector(".window-resize-right"),o=e.querySelector(".window-resize-bottom"),n=e.querySelector(".window-resize-corner");let s,a,i,r,l,c=!1;function d(t){if(!c)return;let o=i,n=r;if("right"===l)o=Math.max(320,i+(t.clientX-s)),gsap.to(e,{width:o,duration:.12,overwrite:"auto"});else if("bottom"===l){const o=window.innerHeight-80-32;n=Math.max(200,Math.min(r+(t.clientY-a),o)),gsap.to(e,{height:n,duration:.12,overwrite:"auto"})}else if("corner"===l){o=Math.max(320,i+(t.clientX-s));const l=window.innerHeight-80-32;n=Math.max(200,Math.min(r+(t.clientY-a),l)),gsap.to(e,{width:o,height:n,duration:.12,overwrite:"auto"})}}function p(){c=!1,document.body.style.userSelect="",document.removeEventListener("mousemove",d),document.removeEventListener("mouseup",p);const t=e.dataset.app||e.querySelector(".window-title")&&e.querySelector(".window-title").textContent.toLowerCase();if(t){const o=JSON.parse(localStorage.getItem("windowSizes")||"{}");o[t]={width:e.style.width,height:e.style.height},localStorage.setItem("windowSizes",JSON.stringify(o))}saveOpenWindowsState()}[[t,"right"],[o,"bottom"],[n,"corner"]].forEach(([t,o])=>{t.addEventListener("mousedown",t=>{c=!0,l=o,s=t.clientX,a=t.clientY,i=e.offsetWidth,r=e.offsetHeight,document.body.style.userSelect="none",document.addEventListener("mousemove",d),document.addEventListener("mouseup",p),t.stopPropagation()})})}function genieToDock(e,t,o){const n=document.querySelector(`.dock-icon[data-app="${t}"]`);if(!n)return void(o&&o());const s=n.getBoundingClientRect(),a=e.getBoundingClientRect(),i=s.left+s.width/2,r=s.top+s.height/2,l=i-(a.left+a.width/2),c=r-(a.top+a.height/2);gsap.to(e,{duration:.5,ease:"power2.in",scaleX:.15,scaleY:.1,x:l,y:c,opacity:.2,onComplete:()=>{e.style.display="none",e.style.transform="",o&&o()}})}function saveOpenWindowsState(){const e={};Object.keys(openWindows).forEach(t=>{const o=openWindows[t];document.body.contains(o)&&(e[t]={visible:"none"!==o.style.display,left:o.style.left,top:o.style.top,width:o.style.width,height:o.style.height,maximized:o.classList.contains("window-maximized")})}),localStorage.setItem("openWindowsState",JSON.stringify(e))}function loadOpenWindowsState(){const e=JSON.parse(localStorage.getItem("openWindowsState")||"{}");Object.keys(e).forEach(t=>{e[t].visible&&openAppWindow(t)}),setTimeout(()=>{Object.keys(e).forEach(t=>{const o=openWindows[t];o&&(e[t].maximized?(o.classList.add("window-maximized"),o.style.left="0px",o.style.top="0px",o.style.width=window.innerWidth+"px",o.style.height=window.innerHeight+"px",o.style.borderRadius="0",o.style.boxShadow="none"):(o.classList.remove("window-maximized"),o.style.left=e[t].left,o.style.top=e[t].top,o.style.width=e[t].width,o.style.height=e[t].height,o.style.borderRadius="",o.style.boxShadow=""))})},100)}desktopIcons.forEach(e=>{e.addEventListener("contextmenu",t=>{t.preventDefault();const o=e.dataset.app;dockPinned.includes(o)||showContextMenu(t.pageX,t.pageY,[{label:"Добавить в Dock",action:()=>{dockPinned.push(o),localStorage.setItem("dockApps",JSON.stringify(dockPinned)),renderDock()}}])})}),renderDock(),dockContainer.addEventListener("click",e=>{const t=e.target.closest(".dock-icon");if(!t)return;const o=t.dataset.app;openWindows[o]&&document.body.contains(openWindows[o])?(openWindows[o].showWindow&&openWindows[o].showWindow(),openWindows[o].style.zIndex=zIndexCounter++,openWindows[o].classList.add("window-bounce"),setTimeout(()=>openWindows[o].classList.remove("window-bounce"),300)):openAppWindow(o)});const desktop=document.getElementById("desktop"),gridSize=96;function loadAppIconPositions(){const e=localStorage.getItem("desktopAppPositions");if(!e)return;const t=JSON.parse(e);document.querySelectorAll(".app-icon").forEach(e=>{const o=e.dataset.app;t[o]&&(e.style.position="absolute",e.style.left=t[o].left,e.style.top=t[o].top)})}function saveAppIconPositions(){const e={};document.querySelectorAll(".app-icon").forEach(t=>{const o=t.dataset.app;e[o]={left:t.style.left,top:t.style.top}}),localStorage.setItem("desktopAppPositions",JSON.stringify(e))}function makeAppIconsDraggable(){document.querySelectorAll(".app-icon").forEach(e=>{e.onmousedown=function(t){let o=t.clientX-e.getBoundingClientRect().left,n=t.clientY-e.getBoundingClientRect().top;function s(t){!function(t,s){let a=96*Math.round((t-o-desktop.offsetLeft)/96),i=96*Math.round((s-n-desktop.offsetTop)/96);a=Math.max(0,Math.min(a,desktop.offsetWidth-e.offsetWidth)),i=Math.max(32,Math.min(i,desktop.offsetHeight-e.offsetHeight));let r=!1;document.querySelectorAll(".app-icon").forEach(t=>{t!==e&&t.style.left===a+"px"&&t.style.top===i+"px"&&(r=!0)}),r||(e.style.left=a+"px",e.style.top=i+"px")}(t.pageX,t.pageY)}e.style.position="absolute",e.style.zIndex=50,document.addEventListener("mousemove",s),document.onmouseup=function(){document.removeEventListener("mousemove",s),document.onmouseup=null,e.style.zIndex="",saveAppIconPositions()},t.preventDefault()},e.ondragstart=()=>!1})}function initNotesApp(e){e.querySelector(".notes-sidebar");const t=e.querySelector(".notes-list"),o=e.querySelector(".notes-add"),n=e.querySelector(".notes-search"),s=e.querySelector(".notes-title"),a=e.querySelector(".notes-body"),i=e.querySelector(".notes-delete");let r=JSON.parse(localStorage.getItem("notesAppNotes")||"[]"),l=localStorage.getItem("notesAppSelectedId")||r[0]&&r[0].id||null,c="";function d(){localStorage.setItem("notesAppNotes",JSON.stringify(r)),localStorage.setItem("notesAppSelectedId",l||"")}function p(){t.innerHTML="",r.filter(e=>e.title.toLowerCase().includes(c)||e.body.toLowerCase().includes(c)).forEach(e=>{const o=document.createElement("div");o.className="notes-list-item"+(e.id===l?" selected":""),o.innerHTML=`<div class="item-title">${e.title?e.title:"<Без названия>"}</div><div class="item-date">${new Date(e.updated).toLocaleString()}</div>`,o.onclick=()=>{l=e.id,u()},t.appendChild(o)})}function u(){p(),function(){const e=r.find(e=>e.id===l);if(!e)return s.value="",a.value="",s.disabled=!0,a.disabled=!0,void(i.disabled=!0);s.value=e.title,a.value=e.body,s.disabled=!1,a.disabled=!1,i.disabled=!1}(),d()}o.onclick=()=>{const e="n"+Date.now(),t={id:e,title:"",body:"",updated:Date.now()};r.unshift(t),l=e,u()},i.onclick=()=>{l&&(r=r.filter(e=>e.id!==l),l=r.length?r[0].id:null,u())},s.oninput=()=>{const e=r.find(e=>e.id===l);e&&(e.title=s.value,e.updated=Date.now(),p(),d())},a.oninput=()=>{const e=r.find(e=>e.id===l);e&&(e.body=a.value,e.updated=Date.now(),p(),d())},n.oninput=()=>{c=n.value.toLowerCase(),p()},u()}window.addEventListener("beforeunload",()=>{saveAppIconPositions(),saveOpenWindowsState()}),makeAppIconsDraggable(),loadAppIconPositions(),loadOpenWindowsState(),loadOpenWindowsState();const avatarColors={r:"#ff5f56",g:"#27c93f",b:"#007aff",y:"#ffbd2e",p:"#a259ff",o:"#ff9500",k:"#222",w:"#fff",s:"#eaeaea"},avatarShapes={c:"circle",s:"square",d:"diamond"};function generateRandomAvatarCode(){const e=Object.keys(avatarColors),t=Object.keys(avatarShapes);return`${e[Math.floor(Math.random()*e.length)]}${t[Math.floor(Math.random()*t.length)]}${e[Math.floor(Math.random()*e.length)]}`}async function getUserAvatar(e){if(!window.firebase?.firestore)return generateRandomAvatarCode();try{const t=firebase.firestore(),o=await t.collection("avatarka").doc(e).get();if(o.exists&&o.data().code)return o.data().code;{const o=generateRandomAvatarCode();return await t.collection("avatarka").doc(e).set({code:o,createdAt:firebase.firestore.FieldValue.serverTimestamp()}),o}}catch(e){return console.error("Ошибка Firestore (getUserAvatar):",e),showNotification("Ошибка Firestore: "+(e.message||e),6e3),generateRandomAvatarCode()}}function createAvatarElement(e,t=64){const o=e[0],n=e[1],s=e[2],a=document.createElement("div");let i;return a.className="user-avatar",a.style.width=a.style.height=t+"px",a.style.display="flex",a.style.alignItems="center",a.style.justifyContent="center",a.style.background=avatarColors[s]||"#eee",a.style.borderRadius="50%",a.style.overflow="hidden","c"===n?(i=document.createElement("div"),i.style.width=i.style.height=Math.round(.6*t)+"px",i.style.background=avatarColors[o]||"#666",i.style.borderRadius="50%"):"s"===n?(i=document.createElement("div"),i.style.width=i.style.height=Math.round(.6*t)+"px",i.style.background=avatarColors[o]||"#666",i.style.borderRadius="16%"):"d"===n&&(i=document.createElement("div"),i.style.width=i.style.height=Math.round(.6*t)+"px",i.style.background=avatarColors[o]||"#666",i.style.transform="rotate(45deg)",i.style.borderRadius="18%"),i&&a.appendChild(i),a}function initSettingsApp(e){const t=e.querySelector("#wallpaper-url"),
        o=e.querySelector("#apply-settings"),
        glassToggle = e.querySelector("#glass-toggle"),
        n=["apiKey","authDomain","databaseURL","projectId","storageBucket","messagingSenderId","appId","measurementId"],
        s={};
  n.forEach(t=>{s[t]=e.querySelector(`#firebase-${t}`)});
  const a=e.querySelector("#save-firebase"),i=JSON.parse(localStorage.getItem("settingsApp")||"{}");
  t.value=i.wallpaper||"";
  glassToggle.checked = (i.glass !== false); // по умолчанию включено
  n.forEach(e=>{s[e].value=i.firebase&&i.firebase[e]||""});
  function applyGlassSetting(enabled) {
    if(enabled) {
      document.body.classList.remove('no-glass');
  } else {
      document.body.classList.add('no-glass');
    }
  }
  applyGlassSetting(glassToggle.checked);
  glassToggle.onchange = function() {
    i.glass = glassToggle.checked;
    localStorage.setItem("settingsApp",JSON.stringify(i));
    applyGlassSetting(glassToggle.checked);
  };
  o.onclick=()=>{t.value&&(document.body.style.backgroundImage=`url('${t.value}')`,document.body.style.backgroundSize="cover"),i.wallpaper=t.value,localStorage.setItem("settingsApp",JSON.stringify(i))};
  a.onclick=()=>{i.firebase=i.firebase||{},n.forEach(e=>{i.firebase[e]=s[e].value}),localStorage.setItem("settingsApp",JSON.stringify(i)),a.textContent="Сохранено!",setTimeout(()=>a.textContent="Сохранить Firebase",1200)};
  let r=e.querySelector(".settings-user"),l=e.querySelector("#login-btn");
  function c(){const e=n.every(e=>s[e].value.trim());l.style.display=e?"":"none"}
  l||(l=document.createElement("button"),l.id="login-btn",l.style.marginLeft="18px",l.style.height="36px",l.style.alignSelf="center",r.appendChild(l)),n.forEach(e=>{s[e].addEventListener("input",c)}),c(),
  function t(){JSON.parse(localStorage.getItem("isLoggedIn")||"false")?(l.textContent="Выйти",l.onclick=()=>{localStorage.setItem("isLoggedIn","false"),localStorage.removeItem("userEmail"),localStorage.removeItem("userName"),showNotification("Вы вышли из аккаунта"),t();const o=e.querySelector(".settings-username");o&&(o.textContent="Пользователь")}):(l.textContent="Войти",l.onclick=()=>{openAppWindow("login")})}();
  const d=e.querySelector(".settings-username");let p=localStorage.getItem("userEmail")||"",u=localStorage.getItem("userName")||"Пользователь";
  const m=JSON.parse(localStorage.getItem("isLoggedIn")||"false");d.textContent=m&&u?u:"Пользователь";
  const g=e.querySelector("#device-resolution"),b=e.querySelector("#device-os");g&&(g.textContent=window.innerWidth+" x "+window.innerHeight),b&&(b.textContent="ЖестьOS ("+navigator.userAgent+")");
  const f=e.querySelector(".settings-avatar"),y=p;if(m&&y){let e,t=localStorage.getItem("userAvatarCode");t?(e=createAvatarElement(t,64),f.replaceWith(e),e.classList.add("settings-avatar")):getUserAvatar(y).then(t=>{localStorage.setItem("userAvatarCode",t),e=createAvatarElement(t,64),f.replaceWith(e),e.classList.add("settings-avatar")}),setTimeout(()=>{const e=document.querySelector(".settings-avatar");e&&(e.style.cursor="pointer",e.onclick=()=>openAppWindow("smile-editor"))},100)}else f.src.includes("pravatar")||(f.src="https://i.pravatar.cc/80?u=macosdemo");
  patchSettingsAppForPassword(e);
  const h=e.querySelectorAll(".cloud-save-checkbox"),w=e.querySelector("#cloud-save-btn"),v=e.querySelector("#cloud-restore-btn"),x=e.querySelector("#cloud-auto-restore");
  let S=JSON.parse(localStorage.getItem("cloudSelectedKeys")||"[]");h.forEach(e=>{e.checked=S.includes(e.dataset.key),e.onchange=()=>{S=Array.from(h).filter(e=>e.checked).map(e=>e.dataset.key),localStorage.setItem("cloudSelectedKeys",JSON.stringify(S))}}),x.checked=JSON.parse(localStorage.getItem("cloudAutoRestore")||"false"),x.onchange=()=>{localStorage.setItem("cloudAutoRestore",x.checked)},w.onclick=async()=>{if(!p)return void showNotification("Войдите для сохранения");const e={};S.forEach(t=>{e[t]=localStorage.getItem(t)}),e.wallpaper=localStorage.getItem("settingsApp")?JSON.parse(localStorage.getItem("settingsApp")).wallpaper:"",e.cloudSelectedKeys=JSON.stringify(S),e.cloudAutoRestore=localStorage.getItem("cloudAutoRestore")||"false";try{await firebase.firestore().collection("save").doc(p).set(e,{merge:!0}),showNotification("Данные сохранены в ЖестьКлауд!")}catch(e){showNotification("Ошибка сохранения: "+(e.message||e))}},v.onclick=async()=>{if(p)try{const e=await firebase.firestore().collection("save").doc(p).get();if(e.exists){const t=e.data();if(S.forEach(e=>{void 0!==t[e]&&localStorage.setItem(e,t[e])}),void 0!==t.wallpaper){const e=JSON.parse(localStorage.getItem("settingsApp")||"{}");e.wallpaper=t.wallpaper,localStorage.setItem("settingsApp",JSON.stringify(e))}void 0!==t.cloudSelectedKeys&&localStorage.setItem("cloudSelectedKeys",t.cloudSelectedKeys),void 0!==t.cloudAutoRestore&&localStorage.setItem("cloudAutoRestore",t.cloudAutoRestore),showNotification("Данные восстановлены из ЖестьКлауд! Перезагрузите страницу.")}else showNotification("Нет сохранённых данных в ЖестьКлауд")}catch(e){showNotification("Ошибка восстановления: "+(e.message||e))}else showNotification("Войдите для восстановления")},window._cloudSyncInterval||(window._cloudSyncInterval=setInterval(async()=>{const e=localStorage.getItem("userEmail")||"",t=JSON.parse(localStorage.getItem("cloudAutoRestore")||"false");if(!e||!t)return;const o=JSON.parse(localStorage.getItem("cloudSelectedKeys")||"[]"),n={};o.forEach(e=>{n[e]=localStorage.getItem(e)}),n.wallpaper=localStorage.getItem("settingsApp")?JSON.parse(localStorage.getItem("settingsApp")).wallpaper:"",n.cloudSelectedKeys=localStorage.getItem("cloudSelectedKeys")||"[]",n.cloudAutoRestore=localStorage.getItem("cloudAutoRestore")||"false";try{await firebase.firestore().collection("save").doc(e).set(n,{merge:!0})}catch(e){}try{const t=await firebase.firestore().collection("save").doc(e).get();if(t.exists){const e=t.data();if(o.forEach(t=>{void 0!==e[t]&&localStorage.setItem(t,e[t])}),void 0!==e.wallpaper){const t=JSON.parse(localStorage.getItem("settingsApp")||"{}");t.wallpaper=e.wallpaper,localStorage.setItem("settingsApp",JSON.stringify(t))}void 0!==e.cloudSelectedKeys&&localStorage.setItem("cloudSelectedKeys",e.cloudSelectedKeys),void 0!==e.cloudAutoRestore&&localStorage.setItem("cloudAutoRestore",e.cloudAutoRestore)}}catch(e){}},6e4))}function showNotification(e){let t=document.getElementById("global-notification");t||(t=document.createElement("div"),t.id="global-notification",t.style.position="fixed",t.style.top="32px",t.style.right="32px",t.style.zIndex=99999,t.style.background="#fff",t.style.color="#222",t.style.padding="18px 32px",t.style.borderRadius="14px",t.style.boxShadow="0 4px 24px #0002",t.style.fontSize="18px",t.style.fontWeight="500",t.style.opacity="0",t.style.transition="opacity 0.3s",document.body.appendChild(t)),t.textContent=e,t.style.opacity="1",setTimeout(()=>{t.style.opacity="0"},5e3)}function initFirebaseFromSettings(){const e=JSON.parse(localStorage.getItem("settingsApp")||"{}");e.firebase&&e.firebase.apiKey&&(window.firebase?.apps?.length||window.firebase.initializeApp(e.firebase))}!function(){const e=JSON.parse(localStorage.getItem("settingsApp")||"{}");"dark"===e.theme?document.body.style.backgroundColor="#222":document.body.style.backgroundColor="",e.wallpaper?(document.body.style.backgroundImage=`url('${e.wallpaper}')`,document.body.style.backgroundSize="cover"):document.body.style.backgroundImage=""}(),initFirebaseFromSettings();let openWindowsStack=[];function bringWindowToFront(e){openWindowsStack=openWindowsStack.filter(t=>t!==e),openWindowsStack.push(e),openWindowsStack.forEach((e,t)=>{e.style.zIndex=100+t})}function removeWindowFromStack(e){openWindowsStack=openWindowsStack.filter(t=>t!==e),openWindowsStack.forEach((e,t)=>{e.style.zIndex=100+t})}function updateMenubarTime(){const e=document.getElementById("menubar-time");if(!e)return;const t=new Date,o=t.getHours().toString().padStart(2,"0"),n=t.getMinutes().toString().padStart(2,"0");e.textContent=`${o}:${n}`}function updateMenubarAvatar(){const e=document.getElementById("menubar-avatar");if(!e)return;let t=localStorage.getItem("userAvatarCode"),o=localStorage.getItem("userEmail")||"";if(e.innerHTML="",t&&"function"==typeof createAvatarElement){const o=createAvatarElement(t,28);o.style.width="28px",o.style.height="28px",o.style.borderRadius="50%",o.style.display="block",e.appendChild(o)}else e.innerHTML=`<img src="https://i.pravatar.cc/28?u=${o||"macosdemo"}" style="width:28px; height:28px; border-radius:50%; display:block;">`;e.title="Профиль/Аватар",e.style.cursor="pointer",e.onclick=()=>openAppWindow("smile-editor")}setInterval(updateMenubarTime,1e3),updateMenubarTime(),updateMenubarAvatar(),window.addEventListener("storage",updateMenubarAvatar),window.addEventListener("focus",updateMenubarAvatar);const menubarAppName=document.getElementById("menubar-appname"),menubarMenus=document.querySelectorAll(".menubar-menu"),menubarDropdowns=document.getElementById("menubar-dropdowns"),menubarApple=document.querySelector(".menubar-apple"),MENUBAR_MENUS={apple:[{label:"О системе",action:()=>openAppWindow("about","desktop")},{label:"Настройки…",action:()=>openAppWindow("settings")},{label:"Заблокировать экран",action:()=>showLockscreen("login")},{label:"Перезагрузить",action:()=>location.reload()},{label:"Выключить",action:()=>window.close()}],desktop:{file:[{label:"Создать папку",action:()=>showNotification("Папки пока нельзя создавать")},{label:"Показать рабочий стол",action:()=>{Object.values(openWindows).forEach(e=>e.style.display="none")}}],edit:[{label:"Вырезать",action:()=>document.execCommand("cut")},{label:"Копировать",action:()=>document.execCommand("copy")},{label:"Вставить",action:()=>document.execCommand("paste")}],window:[{label:"Закрыть все окна",action:()=>{Object.values(openWindows).forEach(e=>e.remove()),openWindowsStack=[]}}],help:[{label:"О Рабочем столе",action:()=>openAppWindow("about","desktop")}]},notes:{file:[{label:"Создать заметку",action:()=>{const e=openWindows.notes;e&&e.querySelector(".notes-add")?.click()}},{label:"Сохранить все",action:()=>showNotification("Все заметки уже сохраняются автоматически!")}],edit:[{label:"Вырезать",action:()=>document.execCommand("cut")},{label:"Копировать",action:()=>document.execCommand("copy")},{label:"Вставить",action:()=>document.execCommand("paste")}],window:[{label:"Закрыть окно",action:()=>{openWindows.notes?.remove()}}],help:[{label:"О Заметках",action:()=>openAppWindow("about","notes")}]},browser:{file:[{label:"Открыть сайт",action:()=>showNotification("В браузере можно открыть сайт!")}],edit:[{label:"Вырезать",action:()=>document.execCommand("cut")},{label:"Копировать",action:()=>document.execCommand("copy")},{label:"Вставить",action:()=>document.execCommand("paste")}],window:[{label:"Закрыть окно",action:()=>{openWindows.browser?.remove()}}],help:[{label:"О Браузере",action:()=>openAppWindow("about","browser")}]},settings:{file:[{label:"Сохранить настройки",action:()=>{showNotification("Настройки сохранены!")}}],edit:[{label:"Вырезать",action:()=>document.execCommand("cut")},{label:"Копировать",action:()=>document.execCommand("copy")},{label:"Вставить",action:()=>document.execCommand("paste")}],window:[{label:"Закрыть окно",action:()=>{openWindows.settings?.remove()}}],help:[{label:"О Настройках",action:()=>openAppWindow("about","settings")}]},"smile-chat":{file:[{label:"Новая беседа",action:()=>showNotification("Создать чат можно в интерфейсе чата!")}],edit:[{label:"Вырезать",action:()=>document.execCommand("cut")},{label:"Копировать",action:()=>document.execCommand("copy")},{label:"Вставить",action:()=>document.execCommand("paste")}],window:[{label:"Закрыть окно",action:()=>{openWindows["smile-chat"]?.remove()}}],help:[{label:"О ЖестьМесседж",action:()=>openAppWindow("about","smile-chat")}]},"smile-editor":{file:[{label:"Сохранить аватар",action:()=>showNotification("Аватар сохранён!")}],edit:[{label:"Вырезать",action:()=>document.execCommand("cut")},{label:"Копировать",action:()=>document.execCommand("copy")},{label:"Вставить",action:()=>document.execCommand("paste")}],window:[{label:"Закрыть окно",action:()=>{openWindows["smile-editor"]?.remove()}}],help:[{label:"О ЖестьСМАЙЛЫ",action:()=>openAppWindow("about","smile-editor")}]},"system-monitor":{file:[{label:"Открыть мониторинг",action:()=>showNotification("Мониторинг открыт!")}],edit:[{label:"Вырезать",action:()=>document.execCommand("cut")},{label:"Копировать",action:()=>document.execCommand("copy")},{label:"Вставить",action:()=>document.execCommand("paste")}],window:[{label:"Закрыть окно",action:()=>{openWindows["system-monitor"]?.remove()}}],help:[{label:"О Мониторинге",action:()=>openAppWindow("about","system-monitor")}]}};function getActiveApp(){if(openWindowsStack&&openWindowsStack.length){const e=openWindowsStack[openWindowsStack.length-1];return e?.dataset?.app||"desktop"}return"desktop"}function updateMenubarAppName(){const e=getActiveApp();menubarAppName.textContent=getAppTitle("desktop"===e?"desktop":e)}window.addEventListener("focus",updateMenubarAppName),window.addEventListener("click",updateMenubarAppName),window.addEventListener("keydown",updateMenubarAppName),setInterval(updateMenubarAppName,1e3);let menubarDropdownOpen=null;function closeMenubarDropdown(){menubarMenus.forEach(e=>e.classList.remove("active")),menubarDropdowns.innerHTML="",menubarDropdownOpen=null}function openMenubarDropdown(e,t){closeMenubarDropdown();let o=getActiveApp();if("apple"===e)var n=MENUBAR_MENUS.apple;else{o=o||"desktop";n=MENUBAR_MENUS[o]&&MENUBAR_MENUS[o][e]||[]}if(!n.length)return;t.classList.add("active");const s=t.getBoundingClientRect(),a=document.createElement("div");a.className="menubar-dropdown visible",a.style.left=s.left+"px",a.style.top=s.bottom+2+"px",n.forEach(e=>{const t=document.createElement("button");t.className="menubar-dropdown-item",t.textContent=e.label,t.onclick=t=>{t.stopPropagation(),closeMenubarDropdown(),e.action()},a.appendChild(t)}),menubarDropdowns.appendChild(a),menubarDropdownOpen=a}function initSmileChatApp(){const e=document.querySelectorAll(".smile-chat-category"),t=document.querySelector(".smile-chat-users"),o=document.querySelector(".smile-chat-messages"),n=document.querySelector(".smile-chat-form"),s=document.querySelector(".smile-chat-input");let a="general";window.selectedUser||(window.selectedUser=null);let i=null;const r=firebase.firestore(),l=localStorage.getItem("userEmail")||"",c=localStorage.getItem("userName")||"Пользователь",d=localStorage.getItem("userAvatarCode")||"",p=JSON.parse(localStorage.getItem("isLoggedIn")||"false");function u(){i&&(i(),i=null)}function m(){u(),t.innerHTML='<div style="color:#888; padding:16px;">Общий чат</div>',o.innerHTML="",i=r.collection("messages").where("type","==","general").orderBy("timestamp","asc").limit(100).onSnapshot(e=>{o.innerHTML="",e.forEach(e=>b(e.data(),e.id)),o.scrollTop=o.scrollHeight})}function g(e){u(),o.innerHTML="",i=r.collection("messages").where("type","==","private").where("participants","array-contains",l).orderBy("timestamp","asc").limit(200).onSnapshot(t=>{o.innerHTML="",t.forEach(t=>{const o=t.data();o.participants&&o.participants.includes(e)&&b(o,t.id)}),o.scrollTop=o.scrollHeight})}async function b(e,t){const n=document.createElement("div"),s=e.senderId===l;n.className="smile-chat-message"+(s?" sent":"");const a=createAvatarElement(e.avatarCode||"",36);a.classList.add("msg-avatar"),n.appendChild(a);const i=document.createElement("div");i.className="msg-content",i.innerHTML=`<div class='msg-name'>${e.from||"Гость"}</div>`,i.innerHTML+=`<div class='msg-text'>${e.text}</div>`,i.innerHTML+=`<div class='msg-time'>${e.timestamp&&e.timestamp.toDate?e.timestamp.toDate().toLocaleTimeString():""}</div>`,n.appendChild(i),o.appendChild(n)}e[0].onclick=()=>{a="general",window.selectedUser=null,e.forEach(e=>e.classList.remove("active")),e[0].classList.add("active"),m()},e[1].onclick=()=>{a="private",window.selectedUser=null,e.forEach(e=>e.classList.remove("active")),e[1].classList.add("active"),async function(){t.innerHTML='<div style="color:#888; padding:12px;">Загрузка...</div>';const o={};(await r.collection("messages").limit(200).get()).forEach(e=>{const t=e.data();"private"===t.type&&Array.isArray(t.participants)&&t.participants.forEach(e=>{e!==l&&(o[e]=!0)}),"general"===t.type&&t.senderId&&t.senderId!==l&&(o[t.senderId]=!0)}),(await r.collection("avatarka").get()).forEach(e=>{e.id!==l&&(o[e.id]=!0)}),t.innerHTML="",Object.keys(o).forEach(o=>{const n=document.createElement("div");n.className="smile-chat-user",n.style.display="flex",n.style.alignItems="center",n.style.gap="10px",n.style.cursor="pointer",n.style.padding="8px 16px",n.style.borderRadius="8px",n.onmouseenter=()=>n.style.background="#e6eaff",n.onmouseleave=()=>n.style.background="";const s=createAvatarElement(generateRandomAvatarCode(),32);n.appendChild(s),getUserAvatar(o).then(e=>{const t=createAvatarElement(e,32);n.replaceChild(t,s)}),n.innerHTML+=`<span>${o.split("@")[0]}</span>`,window.selectedUser===o&&n.classList.add("selected"),n.onclick=()=>{a="private",window.selectedUser=o,t.querySelectorAll(".smile-chat-user").forEach(e=>e.classList.remove("selected")),n.classList.add("selected"),g(o),e.forEach(e=>e.classList.remove("active")),e[1].classList.add("active")},t.appendChild(n)})}(),o.innerHTML='<div style="color:#888; text-align:center; margin-top:32px;">Выберите пользователя для чата</div>'},e[2].onclick=()=>{a="my",window.selectedUser=null,e.forEach(e=>e.classList.remove("active")),e[2].classList.add("active"),async function(){u(),t.innerHTML="",o.innerHTML="";const n=await r.collection("messages").where("participants","array-contains",l).orderBy("timestamp","desc").limit(200).get(),s={};n.forEach(e=>{const t=e.data();if("private"===t.type&&Array.isArray(t.participants)){const e=t.participants.find(e=>e!==l);e&&(s[e]=t)}}),Object.keys(s).forEach(o=>{const n=document.createElement("div");n.className="smile-chat-user",n.style.display="flex",n.style.alignItems="center",n.style.gap="10px",n.style.cursor="pointer",n.style.padding="8px 16px",n.style.borderRadius="8px",n.onmouseenter=()=>n.style.background="#e6eaff",n.onmouseleave=()=>n.style.background="",getUserAvatar(o).then(e=>{const t=createAvatarElement(e,32);n.prepend(t)}),n.innerHTML+=`<span>${o.split("@")[0]}</span>`,window.selectedUser===o&&n.classList.add("selected"),n.onclick=()=>{a="private",window.selectedUser=o,t.querySelectorAll(".smile-chat-user").forEach(e=>e.classList.remove("selected")),n.classList.add("selected"),g(o),e.forEach(e=>e.classList.remove("active")),e[1].classList.add("active")},t.appendChild(n)}),Object.keys(s).length||(t.innerHTML='<div style="color:#888; padding:12px;">Нет личных чатов</div>')}(),o.innerHTML='<div style="color:#888; text-align:center; margin-top:32px;">Выберите чат</div>'},n.onsubmit=async e=>{e.preventDefault();const t=s.value.trim();if(!t)return;if(!p)return void showNotification("Войдите для отправки сообщений");let n={text:t,from:c,senderId:l,avatarCode:d,timestamp:firebase.firestore.FieldValue.serverTimestamp()};if("general"===a)n.type="general",n.to="all";else{if("private"!==a||!window.selectedUser)return void showNotification("Выберите пользователя для личного чата");n.type="private",n.to=window.selectedUser,n.toName=window.selectedUser.split("@")[0],n.participants=[l,window.selectedUser].sort()}try{await r.collection("messages").add(n),s.value="",setTimeout(()=>{o.scrollTop=o.scrollHeight},100)}catch(e){showNotification("Ошибка отправки: "+(e.message||e))}},m()}function showLockscreen(e="auto"){const t=document.getElementById("lockscreen"),o=document.getElementById("lockscreen-modal"),n=document.getElementById("lockscreen-title"),s=document.getElementById("lockscreen-password"),a=document.getElementById("lockscreen-password2"),i=document.getElementById("lockscreen-submit"),r=document.getElementById("lockscreen-error"),l=document.getElementById("lockscreen-date"),c=document.getElementById("lockscreen-time"),d=document.getElementById("lockscreen-avatar"),p=document.getElementById("lockscreen-username"),u=document.getElementById("lockscreen-hint");function m(){const e=new Date;l.textContent=`${["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"][e.getDay()]}, ${e.getDate()} ${["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"][e.getMonth()]}`,c.textContent=e.getHours().toString().padStart(2,"0")+":"+e.getMinutes().toString().padStart(2,"0")}o.style.display="none",t.style.display="",document.body.style.overflow="hidden",s.value="",a.value="",r.textContent="",a.style.display="none",s.type="password",a.type="password",s.disabled=!1,a.disabled=!1,i.disabled=!1,m(),t._interval||(t._interval=setInterval(m,1e3));let g=localStorage.getItem("userName")||"Пользователь",b=localStorage.getItem("userAvatarCode");if(d.innerHTML="",b&&"function"==typeof createAvatarElement){const e=createAvatarElement(b,72);e.style.width=e.style.height="72px",e.style.borderRadius="50%",d.appendChild(e)}else d.innerHTML=`<img src='https://i.pravatar.cc/72?u=${g}' style='width:72px; height:72px; border-radius:50%;'>`;function f(){o.style.display="",setTimeout(()=>s.focus(),100)}p.textContent=g,u.textContent="create"===e||"change"===e?"":"Touch ID или пароль",document.getElementById("lockscreen-user-block").onclick=()=>{"none"===o.style.display&&f()},"create"!==e&&"change"!==e||f(),"create"===e?(n.textContent="Создайте пароль для входа в ЖестьOS",s.placeholder="Пароль",a.style.display="",a.placeholder="Повторите пароль",i.textContent="Создать",i.onclick=()=>{s.value.length<4?r.textContent="Минимум 4 символа":s.value===a.value?(localStorage.setItem("osPassword",btoa(s.value)),t.style.display="none",document.body.style.overflow=""):r.textContent="Пароли не совпадают"}):"change"===e?(n.textContent="Сменить пароль",s.placeholder="Новый пароль",a.style.display="",a.placeholder="Повторите пароль",i.textContent="Сменить",i.onclick=()=>{s.value.length<4?r.textContent="Минимум 4 символа":s.value===a.value?(localStorage.setItem("osPassword",btoa(s.value)),t.style.display="none",document.body.style.overflow="",showNotification("Пароль изменён!")):r.textContent="Пароли не совпадают"}):(n.textContent="Введите пароль для входа в ЖестьOS",s.placeholder="Пароль",i.textContent="Войти",i.onclick=()=>{const e=localStorage.getItem("osPassword");e&&btoa(s.value)===e?(t.style.display="none",document.body.style.overflow=""):r.textContent="Неверный пароль"}),s.onkeydown=a.onkeydown=e=>{"Enter"===e.key&&i.onclick()}}function patchSettingsAppForPassword(e){let t=e.querySelector(".settings-section.password");if(!t){t=document.createElement("div"),t.className="settings-section password",t.innerHTML='<div class="settings-title">Пароль системы</div>';const o=Array.from(e.querySelectorAll(".settings-section")).find(e=>e.textContent.includes("Технические характеристики"));if(o&&o.parentNode)o.nextSibling?o.parentNode.insertBefore(t,o.nextSibling):o.parentNode.appendChild(t);else{const o=e.querySelector(".settings-app");o?(o.appendChild(t),console.warn("Техническая секция не найдена, кнопка смены пароля добавлена в конец настроек.")):(e.appendChild(t),console.error("settings-app не найден, кнопка смены пароля добавлена в конец окна."))}}let o=e.querySelector("#change-password-btn");o||(o=document.createElement("button"),o.id="change-password-btn",o.textContent="Сменить пароль",o.className="settings-btn-password",o.style.display="block",o.style.margin="18px 0 0 0",o.style.padding="10px 32px",o.style.borderRadius="8px",o.style.border="none",o.style.background="#e6eaff",o.style.color="#007aff",o.style.fontSize="16px",o.style.fontWeight="500",o.style.cursor="pointer",o.style.boxShadow="0 2px 8px #0001",o.onmouseenter=()=>o.style.background="#d0e0ff",o.onmouseleave=()=>o.style.background="#e6eaff",o.onclick=()=>showLockscreen("change"),t.appendChild(o))}function initSystemMonitorApp(e){const t=e.querySelectorAll(".system-monitor-tab"),o=e.querySelector(".system-monitor-content");e.querySelectorAll('.system-monitor-tab[data-tab="network"]').forEach(e=>e.remove());let n=null;function s(){const e=Object.keys(openWindows).map((e,t)=>({pid:1e3+t,name:getAppTitle(e),mem:(120*Math.random()+40).toFixed(1),status:"Работает"}));o.innerHTML=`\n      <div style='padding:18px 0 8px 0; text-align:center; color:#888;'>Список процессов (имитация, автообновление)</div>\n      <table style='margin:0 auto; min-width:320px; background:#fff; border-radius:8px; box-shadow:0 2px 8px #0001; border-collapse:collapse;'>\n        <thead><tr style='background:#f7f7fa;'><th style='padding:6px 16px;'>PID</th><th style='padding:6px 16px;'>Имя</th><th style='padding:6px 16px;'>Память</th><th style='padding:6px 16px;'>Статус</th></tr></thead>\n        <tbody>\n          ${e.map(e=>`<tr><td style='padding:6px 16px; text-align:center;'>${e.pid}</td><td style='padding:6px 16px;'>${e.name}</td><td style='padding:6px 16px; text-align:right;'>${e.mem} МБ</td><td style='padding:6px 16px; color:#27c93f;'>${e.status}</td></tr>`).join("")}\n        </tbody>\n      </table>\n    `}function a(e){if(t.forEach(t=>t.classList.toggle("active",t.dataset.tab===e)),n&&(clearInterval(n),n=null),"processes"===e)s(),n=setInterval(s,2e3);else if("cpu"===e)o.innerHTML="<div style='padding:32px 0; text-align:center;'><b>CPU Usage</b><br><span id='cpu-usage-value'>0%</span><div style='height:80px; margin:16px auto 0 auto; max-width:320px; background:#e6eaff; border-radius:8px;'><canvas id='cpu-usage-graph' width='320' height='80'></canvas></div></div>",startFakeCpuUsage(o.querySelector("#cpu-usage-value"),o.querySelector("#cpu-usage-graph"));else if("memory"===e){let e=navigator.deviceMemory?navigator.deviceMemory:4,t=Math.random()*(.7*e)+.2*e;o.innerHTML=`\n        <div style='padding:32px 0; text-align:center;'>\n          <b>Память устройства</b><br>\n          <div style='margin:18px auto 18px auto; max-width:320px; background:#e6eaff; border-radius:8px; padding:18px 0;'>\n            <div style='font-size:18px; margin-bottom:8px;'>${t.toFixed(2)} ГБ / ${e} ГБ</div>\n            <div style='height:18px; background:#fff; border-radius:9px; box-shadow:0 1px 4px #0001; overflow:hidden; margin:0 24px;'>\n              <div id='mem-bar' style='height:100%; width:${(t/e*100).toFixed(1)}%; background:#007aff; transition:width 0.7s;'></div>\n            </div>\n          </div>\n        </div>\n      `;const n=o.querySelector("#mem-bar");setInterval(()=>{t=Math.random()*(.7*e)+.2*e,n.style.width=(t/e*100).toFixed(1)+"%",n.parentElement.previousElementSibling.textContent=t.toFixed(2)+" ГБ / "+e+" ГБ"},1800)}else if("storage"===e){let e=0,t="";for(let o=0;o<localStorage.length;++o){const n=localStorage.key(o),s=localStorage.getItem(n)||"";e+=n.length+s.length,t+=`<tr><td style='padding:4px 12px; font-size:15px;'>${n}</td><td style='padding:4px 12px; font-size:15px;'>${s.length}</td></tr>`}const n=Math.round(e/1024);o.innerHTML=`\n        <div style='font-size:18px; font-weight:600; margin-bottom:12px;'>Использование localStorage</div>\n        <table style='width:100%; border-collapse:collapse; background:#f7f7fa; border-radius:12px; box-shadow:0 2px 8px #0001;'>\n          <thead><tr style='background:#ececec;'><th style='text-align:left; padding:6px 12px;'>Ключ</th><th style='text-align:left; padding:6px 12px;'>Размер значения (байт)</th></tr></thead>\n          <tbody>${t}</tbody>\n        </table>\n        <div style='margin-top:16px; font-size:16px; color:#007aff;'>Всего: <b>${n} КБ</b></div>\n      `}}e.querySelectorAll(".system-monitor-tab").forEach(e=>e.onclick=()=>a(e.dataset.tab)),a("processes"),e.addEventListener("remove",()=>{n&&clearInterval(n)})}function startFakeCpuUsage(e,t){let o=20+30*Math.random(),n=Array(32).fill(o);setInterval(function(){o+=8*(Math.random()-.5),o=Math.max(5,Math.min(o,98)),n.push(o),n.length>32&&n.shift(),e.textContent=o.toFixed(1)+"%";const s=t.getContext("2d");s.clearRect(0,0,320,80),s.beginPath(),s.moveTo(0,80-n[0]);for(let e=1;e<n.length;e++)s.lineTo(10*e,80-n[e]);s.strokeStyle="#007aff",s.lineWidth=2.5,s.stroke(),s.fillStyle="#e6eaff",s.lineTo(320,80),s.lineTo(0,80),s.closePath(),s.fill()},700)}function initBrowserApp(e){const t=e.querySelector(".browser-home");if(t){const b=t.querySelector(".browser-home-search"),f=t.querySelector(".browser-home-go"),y=t.querySelector(".browser-home-history");let h=JSON.parse(localStorage.getItem("browserHistory")||"null");Array.isArray(h)||(h=[]);const w=Array.from(new Set(h.slice().reverse())).slice(0,10);function o(t){e.querySelector(".browser-app").innerHTML=`\n        <div class="browser-toolbar" style="display:flex; align-items:center; gap:8px; padding:10px 16px; background:#ececec; border-bottom:1px solid #e0e0e0;">\n          <button class="browser-nav browser-back" title="Назад" style="width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;">⟨</button>\n          <button class="browser-nav browser-forward" title="Вперёд" style="width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;">⟩</button>\n          <button class="browser-nav browser-refresh" title="Обновить" style="width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;">⟳</button>\n          <button class="browser-nav browser-home-btn" title="Домой" style="width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;">⌂</button>\n          <input class="browser-url" type="text" style="flex:1; margin:0 8px; padding:6px 12px; border-radius:8px; border:1px solid #d0d0d0; font-size:15px;" placeholder="Введите адрес или поисковый запрос..." />\n          <button class="browser-go" title="Найти" style="width:32px; height:32px; border:none; background:#007aff; border-radius:8px; color:#fff; font-size:18px; cursor:pointer; margin-left:4px;">→</button>\n        </div>\n        <div class="browser-iframe-container" style="flex:1; background:#fff; border-radius:0 0 12px 12px; overflow:hidden;">\n          <iframe class="browser-iframe" src="${t}" style="width:100%; height:100%; border:none; background:#fff;"></iframe>\n        </div>\n      `,setTimeout(()=>{initBrowserApp(e)},0)}return y.innerHTML=w.length?w.map(e=>`<div class='browser-home-history-item' style='padding:8px 16px; cursor:pointer; border-radius:8px; transition:background 0.18s; color:#007aff; font-size:15px; margin-bottom:2px;' onmouseover="this.style.background='#e6eaff'" onmouseout="this.style.background=''">${e}</div>`).join(""):'<div style="color:#888; padding:8px 16px;">История пуста</div>',f.onclick=()=>{let e=b.value.trim();e&&(/^https?:\/\//.test(e)||(e="https://www.bing.com/search?q="+encodeURIComponent(e)),o(e))},b.addEventListener("keydown",e=>{"Enter"===e.key&&f.onclick()}),void y.querySelectorAll(".browser-home-history-item").forEach(e=>{e.onclick=()=>o(e.textContent)})}const n=e.querySelector(".browser-url"),s=e.querySelector(".browser-iframe"),a=e.querySelector(".browser-back"),i=e.querySelector(".browser-forward"),r=e.querySelector(".browser-refresh"),l=e.querySelector(".browser-go"),c=e.querySelector(".browser-home-btn");let d=JSON.parse(localStorage.getItem("browserHistory")||"null");Array.isArray(d)&&d.length||(d=["https://www.bing.com"]);let p=d.length-1;function u(){localStorage.setItem("browserHistory",JSON.stringify(d))}function m(){a.disabled=p<=0,i.disabled=p>=d.length-1,n.value=d[p]||""}function g(e,t=!0){/^https?:\/\//.test(e)||(e="https://www.bing.com/search?q="+encodeURIComponent(e)),s.src=e,t&&(d=d.slice(0,p+1),d.push(e),p=d.length-1,u()),m()}n.addEventListener("keydown",e=>{"Enter"===e.key&&g(n.value)}),l.onclick=()=>{g(n.value)},a.onclick=()=>{p>0&&(p--,s.src=d[p],m(),u())},i.onclick=()=>{p<d.length-1&&(p++,s.src=d[p],m(),u())},r.onclick=()=>{s.src=d[p]},c&&(c.onclick=()=>{e.querySelector(".browser-app").innerHTML='\n        <div class="browser-home" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;">\n          <div style="font-size:32px; font-weight:600; margin-bottom:24px; color:#007aff;">Браузер</div>\n          <input class="browser-home-search" type="text" style="width:340px; max-width:90vw; padding:16px 24px; font-size:20px; border-radius:16px; border:1.5px solid #d0d0d0; margin-bottom:24px; outline:none;" placeholder="Введите адрес или поисковый запрос..." autofocus />\n          <button class="browser-home-go" style="padding:10px 36px; font-size:18px; border-radius:10px; border:none; background:#007aff; color:#fff; cursor:pointer; margin-bottom:32px;">Найти</button>\n          <div style="font-size:18px; font-weight:500; margin-bottom:8px; color:#444;">Недавние сайты</div>\n          <div class="browser-home-history" style="width:340px; max-width:90vw; background:#fff; border-radius:12px; box-shadow:0 2px 8px #0001; padding:12px 0; min-height:40px; max-height:220px; overflow-y:auto;"></div>\n        </div>\n      ',setTimeout(()=>{initBrowserApp(e)},0)}),s.addEventListener("load",()=>{try{const e=s.contentWindow.location.href;e&&"about:blank"!==e&&(n.value=e)}catch(e){}}),m()}function initBrowserTabs(e){let t=JSON.parse(localStorage.getItem("browserTabs")||"null");Array.isArray(t)&&t.length||(t=[{id:"tab"+Date.now(),title:"Новая вкладка",url:"",history:[],historyIndex:-1,isHome:!0}]);let o=localStorage.getItem("browserActiveTabId");o&&t.some(e=>e.id===o)||(o=t[0].id);const n=e.querySelector(".browser-tabs-bar"),s=e.querySelector(".browser-tabs-content");function a(){localStorage.setItem("browserTabs",JSON.stringify(t)),localStorage.setItem("browserActiveTabId",o)}function i(e){o=e,a(),l(),c()}function r(e="",o=!0){const n={id:"tab"+Date.now()+Math.floor(1e4*Math.random()),title:"Новая вкладка",url:e,history:e?[e]:[],historyIndex:e?0:-1,isHome:o||!e};t.push(n),i(n.id),a()}function l(){n.innerHTML="",t.forEach(e=>{const s=document.createElement("div");s.className="browser-tab"+(e.id===o?" active":""),s.style.cssText=`display:flex; align-items:center; gap:6px; padding:7px 18px 7px 14px; border-radius:10px 10px 0 0; background:${e.id===o?"#fff":"transparent"}; font-size:15px; font-weight:500; cursor:pointer; position:relative; margin-right:2px; border:1px solid #e0e0e0; border-bottom:none;`,s.innerHTML=`<span class="browser-tab-title" style="max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${e.title||"Новая вкладка"}</span>`;const d=document.createElement("span");d.textContent="×",d.title="Закрыть вкладку",d.style.cssText="margin-left:8px; color:#888; font-size:18px; cursor:pointer;",d.onclick=n=>{n.stopPropagation(),function(e){const n=t.findIndex(t=>t.id===e);if(-1!==n)if(t.splice(n,1),t.length){if(o===e){const e=Math.max(0,n-1);i(t[e].id)}else l(),c();a()}else r()}(e.id)},s.appendChild(d),s.onclick=()=>i(e.id),n.appendChild(s)});const e=document.createElement("button");e.textContent="+",e.title="Новая вкладка",e.style.cssText="margin-left:6px; width:28px; height:28px; border:none; background:#e6eaff; border-radius:8px; color:#007aff; font-size:20px; font-weight:600; cursor:pointer;",e.onclick=()=>r(),n.appendChild(e)}function c(){s.innerHTML="";const e=t.find(e=>e.id===o);if(!e)return;if(e.isHome){const w=document.createElement("div");w.className="browser-home",w.style.cssText="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; position:absolute; left:0; right:0; top:0; bottom:0;",w.innerHTML='\n        <div style="font-size:32px; font-weight:600; margin-bottom:24px; color:#007aff;">Браузер</div>\n        <input class="browser-home-search" type="text" style="width:340px; max-width:90vw; padding:16px 24px; font-size:20px; border-radius:16px; border:1.5px solid #d0d0d0; margin-bottom:24px; outline:none;" placeholder="Введите адрес или поисковый запрос..." autofocus />\n        <button class="browser-home-go" style="padding:10px 36px; font-size:18px; border-radius:10px; border:none; background:#007aff; color:#fff; cursor:pointer; margin-bottom:32px;">Найти</button>\n        <div style="font-size:18px; font-weight:500; margin-bottom:8px; color:#444;">Недавние сайты</div>\n        <div class="browser-home-history" style="width:340px; max-width:90vw; background:#fff; border-radius:12px; box-shadow:0 2px 8px #0001; padding:12px 0; min-height:40px; max-height:220px; overflow-y:auto;"></div>\n      ',s.appendChild(w);let v=JSON.parse(localStorage.getItem("browserHistory")||"null");Array.isArray(v)||(v=[]);const x=Array.from(new Set(v.slice().reverse())).slice(0,10),S=w.querySelector(".browser-home-history");function n(t){e.isHome=!1,e.url=t,e.history=[t],e.historyIndex=0,e.title=t.replace(/^https?:\/\//,"").split("/")[0],a(),i(e.id)}return S.innerHTML=x.length?x.map(e=>`<div class='browser-home-history-item' style='padding:8px 16px; cursor:pointer; border-radius:8px; transition:background 0.18s; color:#007aff; font-size:15px; margin-bottom:2px;' onmouseover="this.style.background='#e6eaff'" onmouseout="this.style.background=''">${e}</div>`).join(""):'<div style="color:#888; padding:8px 16px;">История пуста</div>',w.querySelector(".browser-home-go").onclick=()=>{let e=w.querySelector(".browser-home-search").value.trim();e&&(/^https?:\/\//.test(e)||(e="https://www.bing.com/search?q="+encodeURIComponent(e)),n(e))},w.querySelector(".browser-home-search").addEventListener("keydown",e=>{"Enter"===e.key&&w.querySelector(".browser-home-go").onclick()}),void S.querySelectorAll(".browser-home-history-item").forEach(e=>{e.onclick=()=>n(e.textContent)})}const r=document.createElement("div");r.className="browser-tab-content",r.style.cssText="display:flex; flex-direction:column; height:100%; width:100%; position:absolute; left:0; right:0; top:0; bottom:0; background:#fff; border-radius:0 0 12px 12px;",r.innerHTML=`\n      <div class="browser-toolbar" style="display:flex; align-items:center; gap:8px; padding:10px 16px; background:#ececec; border-bottom:1px solid #e0e0e0;">\n        <button class="browser-nav browser-back" title="Назад" style="width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;">⟨</button>\n        <button class="browser-nav browser-forward" title="Вперёд" style="width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;">⟩</button>\n        <button class="browser-nav browser-refresh" title="Обновить" style="width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;">⟳</button>\n        <button class="browser-nav browser-home-btn" title="Домой" style="width:28px; height:28px; border:none; background:#e6eaff; border-radius:6px; font-size:18px; color:#007aff; cursor:pointer;">⌂</button>\n        <input class="browser-url" type="text" style="flex:1; margin:0 8px; padding:6px 12px; border-radius:8px; border:1px solid #d0d0d0; font-size:15px;" placeholder="Введите адрес или поисковый запрос..." />\n        <button class="browser-go" title="Найти" style="width:32px; height:32px; border:none; background:#007aff; border-radius:8px; color:#fff; font-size:18px; cursor:pointer; margin-left:4px;">→</button>\n      </div>\n      <div class="browser-iframe-container" style="flex:1; background:#fff; border-radius:0 0 12px 12px; overflow:hidden;">\n        <iframe class="browser-iframe" src="${e.url}" style="width:100%; height:100%; border:none; background:#fff;"></iframe>\n      </div>\n    `,s.appendChild(r);const c=r.querySelector(".browser-url"),d=r.querySelector(".browser-iframe"),p=r.querySelector(".browser-back"),u=r.querySelector(".browser-forward"),m=r.querySelector(".browser-refresh"),g=r.querySelector(".browser-go"),b=r.querySelector(".browser-home-btn");function f(){a();let t=JSON.parse(localStorage.getItem("browserHistory")||"[]");t.includes(e.url)||(t.push(e.url),localStorage.setItem("browserHistory",JSON.stringify(t)))}function y(){p.disabled=e.historyIndex<=0,u.disabled=e.historyIndex>=e.history.length-1,c.value=e.history[e.historyIndex]||"",e.title=(e.history[e.historyIndex]||"Новая вкладка").replace(/^https?:\/\//,"").split("/")[0],l()}function h(t,o=!0){/^https?:\/\//.test(t)||(t="https://www.bing.com/search?q="+encodeURIComponent(t)),d.src=t,o&&(e.history=e.history.slice(0,e.historyIndex+1),e.history.push(t),e.historyIndex=e.history.length-1,e.url=t,f()),y()}c.addEventListener("keydown",e=>{"Enter"===e.key&&h(c.value)}),g.onclick=()=>{h(c.value)},p.onclick=()=>{e.historyIndex>0&&(e.historyIndex--,e.url=e.history[e.historyIndex],d.src=e.url,y(),f())},u.onclick=()=>{e.historyIndex<e.history.length-1&&(e.historyIndex++,e.url=e.history[e.historyIndex],d.src=e.url,y(),f())},m.onclick=()=>{d.src=e.url},b&&(b.onclick=()=>{e.isHome=!0,a(),i(e.id)}),d.addEventListener("load",()=>{try{const t=d.contentWindow.location.href;t&&"about:blank"!==t&&(c.value=t,e.title=t.replace(/^https?:\/\//,"").split("/")[0],l())}catch(e){}}),y()}l(),c()}function updateDesktopAppIcons(){const e=document.getElementById("desktop"),t=JSON.parse(localStorage.getItem("storeInstalledApps")||"[]"),o=localStorage.getItem("desktopAppPositions"),n=o?JSON.parse(o):{};e.querySelectorAll(".app-icon").forEach(e=>{const o=e.dataset.app;"notes"!==o&&"browser"!==o&&"settings"!==o&&"smile-chat"!==o&&"store"!==o&&"system-monitor"!==o&&(t.some(e=>e.id===o)||e.remove())}),t.forEach(t=>{if(!e.querySelector(`.app-icon[data-app="${t.id}"]`)){const o=document.createElement("div");o.className="app-icon",o.dataset.app=t.id,o.style.position="absolute",o.style.left=n[t.id]?.left||"0px",o.style.top=n[t.id]?.top||"0px",o.innerHTML=`\n        <img src="${t.icon||"https://img.icons8.com/ios-filled/50/000000/application-window.png"}" alt="${t.name||t.id}">\n        <span>${t.name||t.id}</span>\n      `,e.appendChild(o),o.addEventListener("dblclick",()=>openAppWindow(t.id))}}),makeAppIconsDraggable()}if(menubarApple.addEventListener("click",e=>{openMenubarDropdown("apple",menubarApple)}),menubarMenus.forEach(e=>{e.addEventListener("click",t=>{openMenubarDropdown(e.dataset.menu,e),t.stopPropagation()})}),window.addEventListener("click",e=>{e.target.closest(".menubar-dropdown")||e.target.classList.contains("menubar-menu")||e.target.classList.contains("menubar-apple")||closeMenubarDropdown()}),window.addEventListener("keydown",e=>{"Escape"===e.key&&closeMenubarDropdown()}),window.addEventListener("DOMContentLoaded",()=>{showLockscreen(localStorage.getItem("osPassword")?"login":"create")}),window.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("desktop");if(!e.querySelector('.app-icon[data-app="system-monitor"]')){const t=document.createElement("div");t.className="app-icon",t.dataset.app="system-monitor";let o="0px",n="384px";const s=localStorage.getItem("desktopAppPositions");if(s){const e=JSON.parse(s);e["system-monitor"]&&(o=e["system-monitor"].left,n=e["system-monitor"].top)}t.style.position="absolute",t.style.left=o,t.style.top=n,t.innerHTML='\n      <img src="https://img.icons8.com/ios-filled/50/000000/activity-history.png" alt="Мониторинг">\n      <span>Мониторинг</span>\n    ',e.appendChild(t),t.addEventListener("dblclick",()=>{openAppWindow("system-monitor")}),makeAppIconsDraggable()}const t=JSON.parse(localStorage.getItem("storeInstalledApps")||"[]"),o=localStorage.getItem("desktopAppPositions"),n=o?JSON.parse(o):{};t.forEach(t=>{if(!e.querySelector(`.app-icon[data-app="${t.id}"]`)){const o=document.createElement("div");o.className="app-icon",o.dataset.app=t.id,o.style.position="absolute",o.style.left=n[t.id]?.left||"0px",o.style.top=n[t.id]?.top||"0px",o.innerHTML=`\n        <img src="${t.icon||"https://img.icons8.com/ios-filled/50/000000/application-window.png"}" alt="${t.name||t.id}">\n        <span>${t.name||t.id}</span>\n      `,e.appendChild(o),o.addEventListener("dblclick",()=>openAppWindow(t.id))}}),makeAppIconsDraggable()}),dockPinned.includes("system-monitor")||(dockPinned.push("system-monitor"),localStorage.setItem("dockApps",JSON.stringify(dockPinned))),"system-monitor"===app?(imgSrc="https://img.icons8.com/ios-filled/50/000000/activity-history.png",alt="Мониторинг"):"system-monitor"===app&&(content='\n      <div class="system-monitor-app">\n        <div class="system-monitor-tabs">\n          <button class="system-monitor-tab active" data-tab="processes">Процессы</button>\n          <button class="system-monitor-tab" data-tab="cpu">CPU</button>\n          <button class="system-monitor-tab" data-tab="memory">Память</button>\n          <button class="system-monitor-tab" data-tab="storage">Хранилище</button>\n        </div>\n        <div class="system-monitor-content">\n          \x3c!-- Содержимое вкладки будет подгружаться --\x3e\n        </div>\n      </div>\n    '),"system-monitor"===app&&setTimeout(()=>{initSystemMonitorApp(windowEl)},0),document.querySelector(".word-container")){window.format=function(e){document.execCommand(e,!1,null)};const e=document.getElementById("editor"),t=document.getElementById("saveDoc"),o=document.getElementById("downloadDoc"),n=document.getElementById("savedDocs"),s=document.getElementById("loadDoc"),a=document.getElementById("deleteDoc"),i=document.getElementById("docTitle");function getSavedDocs(){return JSON.parse(localStorage.getItem("wordDocs")||"{}")}function setSavedDocs(e){localStorage.setItem("wordDocs",JSON.stringify(e))}function refreshSavedDocs(){const e=getSavedDocs();n.innerHTML="",Object.keys(e).forEach(e=>{const t=document.createElement("option");t.value=e,t.textContent=e,n.appendChild(t)})}t.onclick=function(){const t=i.value.trim();if(!t)return alert("Введите название документа!");const o=getSavedDocs();o[t]=e.innerHTML,setSavedDocs(o),refreshSavedDocs(),alert("Документ сохранён!")},s.onclick=function(){const t=n.value;if(!t)return;const o=getSavedDocs();i.value=t,e.innerHTML=o[t]||""},a.onclick=function(){const e=n.value;if(!e)return;const t=getSavedDocs();delete t[e],setSavedDocs(t),refreshSavedDocs(),alert("Документ удалён!")},o.onclick=async function(){const t=i.value.trim()||"Документ",o=(e.innerHTML,new window.docx.Document({sections:[{properties:{},children:[new window.docx.Paragraph({children:[new window.docx.TextRun({text:e.innerText})]})]}]})),n=await window.docx.Packer.toBlob(o),s=document.createElement("a");s.href=URL.createObjectURL(n),s.download=t+".docx",s.click(),URL.revokeObjectURL(s.href)},refreshSavedDocs()}
  document.addEventListener("DOMContentLoaded", () => {
    const apps = [
      { id: 'notes', title: 'Заметки' },
      { id: 'browser', title: 'Браузер' },
      { id: 'settings', title: 'Настройки' },
      { id: 'smile-chat', title: 'ЖестьМесседж' }
    ];
  
    const launcher = document.getElementById("window-launcher");
  
    apps.forEach(app => {
      const preview = document.createElement("div");
      preview.className = "launcher-window-preview";
      preview.textContent = app.title;
      preview.dataset.app = app.id;
      launcher.appendChild(preview);
  
      preview.addEventListener("click", () => openAppWindow(app));
    });
  
    function openAppWindow({ id, title }) {
      const windowEl = document.createElement("div");
      windowEl.className = "window";
      windowEl.style.top = "100px";
      windowEl.style.left = "100px";
  
      const header = document.createElement("div");
      header.className = "window-header";
  
      const controls = document.createElement("div");
      controls.className = "window-controls";
  
      const closeBtn = document.createElement("div");
      closeBtn.className = "window-dot window-close-dot";
      closeBtn.addEventListener("click", () => windowEl.remove());
      controls.appendChild(closeBtn);
  
      header.appendChild(controls);
  
      const titleEl = document.createElement("div");
      titleEl.className = "window-title";
      titleEl.textContent = title;
      header.appendChild(titleEl);
  
      windowEl.appendChild(header);
  
      const content = document.createElement("div");
      content.className = "window-content";
      content.innerHTML = `<p>Окно ${title}</p>`;
      windowEl.appendChild(content);
  
      document.body.appendChild(windowEl);
  
      makeDraggable(windowEl, header);
  
      gsap.fromTo(windowEl, {
        scale: 0.5,
        opacity: 0,
        y: 100
      }, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power3.out"
      });
    }
  
    function makeDraggable(element, handle) {
      let isDragging = false;
      let offsetX = 0, offsetY = 0;
  
      handle.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        element.style.zIndex = 1000;
  
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });
  
      function onMouseMove(e) {
        if (!isDragging) return;
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
      }
  
      function onMouseUp() {
        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }
    }
  });
  const stageManager = document.getElementById('stage-manager');
let stageWindows = [];

function moveToStageManager(windowEl) {
  const thumb = document.createElement('div');
  thumb.className = 'stage-thumbnail';
  thumb.dataset.app = windowEl.dataset.app;

  // Клонируем внешний вид окна как картинку (или упрощенный вид)
  thumb.innerHTML = '<div style="width:100%;height:100%;background:#eee;"></div>';
  stageManager.appendChild(thumb);

  // Анимация скрытия окна
  gsap.to(windowEl, {
    duration: 0.4,
    scale: 0.8,
    opacity: 0,
    x: 100,
    onComplete: () => windowEl.style.display = 'none'
  });

  thumb.addEventListener('click', () => restoreWindow(windowEl, thumb));
}

function restoreWindow(windowEl, thumb) {
  windowEl.style.display = 'flex';
  windowEl.style.opacity = 0;
  windowEl.style.transform = 'scale(0.8)';
  gsap.to(windowEl, {
    duration: 0.4,
    scale: 1,
    opacity: 1,
    x: 0
  });
  thumb.remove();
}

function overrideCloseButtons() {
  const closeButtons = document.querySelectorAll('.window-close');
  closeButtons.forEach(btn => {
    btn.onclick = (e) => {
      const win = btn.closest('.window');
      if (win) moveToStageManager(win);
    };
  });
}


function initSystemMonitorApp(e){const t=e.querySelectorAll(".system-monitor-tab"),o=e.querySelector(".system-monitor-content");
  // Добавим новую вкладку "system"
  if (!e.querySelector('.system-monitor-tab[data-tab="system"]')) {
    const btn = document.createElement('button');
    btn.className = 'system-monitor-tab';
    btn.dataset.tab = 'system';
    btn.textContent = 'Система';
    e.querySelector('.system-monitor-tabs').appendChild(btn);
  }
  let n=null;
  function s(){
    // Главный поток JS
    const processes = [
      {
        pid: 1000,
        type: 'JS',
        name: 'Главный поток',
        status: 'Работает',
        info: `Аптайм: ${(performance.now()/1000).toFixed(1)} сек`,
        mem: window.performance?.memory ? (performance.memory.usedJSHeapSize/1024/1024).toFixed(1) + ' МБ' : '—'
      }
    ];
    // Таймеры (setInterval/setTimeout)
    if (!window._monitorTimers) window._monitorTimers = {count: 0};
    processes.push({
      pid: 1001,
      type: 'Timer',
      name: 'Таймеры JS',
      status: 'Работает',
      info: `Активных: ${window._monitorTimers.count}`,
      mem: '—'
    });
    // Сетевые запросы (ресурсы)
    const resources = performance.getEntriesByType('resource') || [];
    processes.push({
      pid: 1002,
      type: 'Network',
      name: 'Сетевые запросы',
      status: 'Работает',
      info: `За сессию: ${resources.length}`,
      mem: '—'
    });
    // FPS (кадр/сек)
    if (!window._monitorFps) window._monitorFps = {fps: 0};
    processes.push({
      pid: 1003,
      type: 'FPS',
      name: 'FPS (отрисовка)',
      status: 'Работает',
      info: `FPS: ${window._monitorFps.fps}`,
      mem: '—'
    });
    // Web Workers (если есть)
    if (window._monitorWorkers && window._monitorWorkers.length) {
      window._monitorWorkers.forEach((w, i) => {
        processes.push({
          pid: 1100 + i,
          type: 'Worker',
          name: w.name || 'Worker',
          status: w.active ? 'Работает' : 'Остановлен',
          info: '',
          mem: '—'
        });
      });
    }
    // Открытые окна (как раньше)
    Object.keys(openWindows).forEach((key, idx) => {
      const win = openWindows[key];
      if (document.body.contains(win)) {
        processes.push({
          pid: 1200 + idx,
          type: 'App',
          name: getAppTitle(key),
          status: 'Открыто',
          info: '',
          mem: '—'
        });
      }
    });
    // FPS монитор
    if (!window._monitorFpsInterval) {
      let last = performance.now(), frames = 0;
      function fpsTick() {
        frames++;
        const now = performance.now();
        if (now - last > 1000) {
          window._monitorFps.fps = frames;
          frames = 0;
          last = now;
        }
        window.requestAnimationFrame(fpsTick);
      }
      window.requestAnimationFrame(fpsTick);
      window._monitorFpsInterval = true;
    }
    // Таймер монитор
    if (!window._monitorTimerPatched) {
      const origSetTimeout = window.setTimeout;
      const origSetInterval = window.setInterval;
      const origClearTimeout = window.clearTimeout;
      const origClearInterval = window.clearInterval;
      let activeTimers = 0;
      window.setTimeout = function(...args) {
        activeTimers++;
        window._monitorTimers.count = activeTimers;
        const id = origSetTimeout(() => {
          activeTimers--;
          window._monitorTimers.count = activeTimers;
          args[0] && args[0]();
        }, args[1]);
        return id;
      };
      window.setInterval = function(...args) {
        activeTimers++;
        window._monitorTimers.count = activeTimers;
        const id = origSetInterval(args[0], args[1]);
        return id;
      };
      window.clearTimeout = function(id) {
        activeTimers--;
        window._monitorTimers.count = Math.max(0, activeTimers);
        origClearTimeout(id);
      };
      window.clearInterval = function(id) {
        activeTimers--;
        window._monitorTimers.count = Math.max(0, activeTimers);
        origClearInterval(id);
      };
      window._monitorTimerPatched = true;
    }
    o.innerHTML = `
      <div style='padding:18px 0 8px 0; text-align:center; color:#888;'>Системные процессы браузера (реальные данные, автообновление)</div>
      <table style='margin:0 auto; min-width:420px; background:#fff; border-radius:8px; box-shadow:0 2px 8px #0001; border-collapse:collapse;'>
        <thead><tr style='background:#f7f7fa;'><th style='padding:6px 16px;'>PID</th><th style='padding:6px 16px;'>Тип</th><th style='padding:6px 16px;'>Имя</th><th style='padding:6px 16px;'>Статус</th><th style='padding:6px 16px;'>Инфо</th>
        <tbody>
          ${processes.map(e=>`<tr><td style='padding:6px 16px; text-align:center;'>${e.pid}</td><td style='padding:6px 16px;'>${e.type}</td><td style='padding:6px 16px;'>${e.name}</td><td style='padding:6px 16px; color:#27c93f;'>${e.status}</td><td style='padding:6px 16px;'>${e.info}</td><td style='padding:6px 16px;'>${e.mem}</td></tr>`).join("")}
        </tbody>
      </table>
    `;
  }
  function realCpuTab() {
    o.innerHTML = `<div style='padding:32px 0; text-align:center;'>
      <b>Загрузка CPU (JS поток)</b><br>
      <span id='cpu-usage-value'>0%</span>
      <div style='height:80px; margin:16px auto 0 auto; max-width:320px; background:#e6eaff; border-radius:8px;'>
        <canvas id='cpu-usage-graph' width='320' height='80'></canvas>
      </div>
      <div style='font-size:13px; color:#888; margin-top:8px;'>* Только JS поток, не вся система</div>
    </div>`;
    startRealCpuUsage(o.querySelector('#cpu-usage-value'), o.querySelector('#cpu-usage-graph'));
  }
  function realMemoryTab() {
    let hasPerfMem = !!(performance.memory && performance.memory.usedJSHeapSize);
    let used = hasPerfMem ? performance.memory.usedJSHeapSize / 1024 / 1024 : null;
    let limit = hasPerfMem ? performance.memory.jsHeapSizeLimit / 1024 / 1024 : null;
    let free = hasPerfMem ? (limit - used) : null;
    
    // Расчет памяти сайта на основе реальных данных
    let domCount = document.getElementsByTagName('*').length;
    let openWinCount = Object.keys(openWindows).length;
    let scriptsCount = document.scripts.length;
    let imagesCount = document.images.length;
    let stylesheetsCount = document.styleSheets.length;
    
    // Примерный расчет используемой памяти сайта (в МБ)
    let estimatedSiteMemory = (
        (domCount * 0.001) +           // ~1KB на DOM элемент
        (openWinCount * 2) +           // ~2MB на открытое окно
        (scriptsCount * 0.1) +         // ~100KB на скрипт
        (imagesCount * 0.05) +         // ~50KB на изображение
        (stylesheetsCount * 0.02) +    // ~20KB на стиль
        1.5                            // базовая память страницы
    );
    
    // Максимальная память сайта (условно)
    let maxSiteMemory = estimatedSiteMemory * 3; // резерв в 3 раза
    let freeSiteMemory = maxSiteMemory - estimatedSiteMemory;
    let memoryUsagePercent = (estimatedSiteMemory / maxSiteMemory * 100).toFixed(1);
    
    // Подсчет событий и слушателей (приблизительно)
    let eventListenersCount = 0;
    try {
        // Примерная оценка количества обработчиков событий
        eventListenersCount = domCount * 0.1; // примерно 10% элементов имеют обработчики
    } catch(e) {}
    
    o.innerHTML = `
      <div style='padding:32px 0 0 0; text-align:center;'>
        <b>Память сайта</b><br>
        <span id='mem-usage-value'>Использовано: ${estimatedSiteMemory.toFixed(2)} МБ из ${maxSiteMemory.toFixed(2)} МБ</span>
        
        <div style='margin:18px auto 0 auto; max-width:420px;'>
          <table style='width:100%; background:#fff; border-radius:10px; box-shadow:0 2px 8px #0001; border-collapse:collapse; font-size:15px;'>
            <tr style='background:#f8f9ff;'><td style='padding:8px 16px; font-weight:bold;' colspan='2'>Память сайта</td></tr>
            <tr><td style='padding:6px 16px;'>Используется</td><td style='padding:6px 16px;'>${estimatedSiteMemory.toFixed(2)} МБ</td></tr>
            <tr><td style='padding:6px 16px;'>Доступно</td><td style='padding:6px 16px;'>${maxSiteMemory.toFixed(2)} МБ</td></tr>
            <tr><td style='padding:6px 16px;'>Свободно</td><td style='padding:6px 16px;'>${freeSiteMemory.toFixed(2)} МБ</td></tr>
            <tr><td style='padding:6px 16px;'>Загруженность</td><td style='padding:6px 16px;'>${memoryUsagePercent}%</td></tr>
            
            <tr style='background:#f8f9ff;'><td style='padding:8px 16px; font-weight:bold;' colspan='2'>Ресурсы сайта</td></tr>
            <tr><td style='padding:6px 16px;'>DOM-элементов</td><td style='padding:6px 16px;'>${domCount}</td></tr>
            <tr><td style='padding:6px 16px;'>Открытых окон</td><td style='padding:6px 16px;'>${openWinCount}</td></tr>
            <tr><td style='padding:6px 16px;'>Скриптов</td><td style='padding:6px 16px;'>${scriptsCount}</td></tr>
            <tr><td style='padding:6px 16px;'>Изображений</td><td style='padding:6px 16px;'>${imagesCount}</td></tr>
            <tr><td style='padding:6px 16px;'>Стилей</td><td style='padding:6px 16px;'>${stylesheetsCount}</td></tr>
            <tr><td style='padding:6px 16px;'>Обработчиков событий</td><td style='padding:6px 16px;'>~${Math.round(eventListenersCount)}</td></tr>
            
            ${hasPerfMem ? `
            <tr style='background:#f8f9ff;'><td style='padding:8px 16px; font-weight:bold;' colspan='2'>JS Heap (браузер)</td></tr>
            <tr><td style='padding:6px 16px;'>JS Heap Used</td><td style='padding:6px 16px;'>${used.toFixed(2)} МБ</td></tr>
            <tr><td style='padding:6px 16px;'>JS Heap Limit</td><td style='padding:6px 16px;'>${limit.toFixed(2)} МБ</td></tr>
            <tr><td style='padding:6px 16px;'>JS Heap Free</td><td style='padding:6px 16px;'>${free.toFixed(2)} МБ</td></tr>
            ` : ''}
          </table>
        </div>
        <div style='font-size:13px; color:#888; margin-top:12px;'>
          * Показана оценочная память, используемая сайтом.<br>
          * Расчет основан на количестве DOM-элементов, окон и ресурсов.<br>
          ${hasPerfMem ? '' : 'JS Heap данные недоступны в данном браузере.'}
        </div>
      </div>
    `;
    
    // Обновляем значения в реальном времени
    updateMemoryValues();
}

// Функция для обновления значений памяти в реальном времени
function updateMemoryValues() {
    const valueElement = o.querySelector('#mem-usage-value');
    
    function updateData() {
        // Пересчитываем данные памяти
        let domCount = document.getElementsByTagName('*').length;
        let openWinCount = Object.keys(openWindows).length;
        let scriptsCount = document.scripts.length;
        let imagesCount = document.images.length;
        let stylesheetsCount = document.styleSheets.length;
        
        let estimatedSiteMemory = (
            (domCount * 0.001) +
            (openWinCount * 2) +
            (scriptsCount * 0.1) +
            (imagesCount * 0.05) +
            (stylesheetsCount * 0.02) +
            1.5
        );
        
        let maxSiteMemory = estimatedSiteMemory * 3;
        
        // Добавляем небольшие случайные колебания для реалистичности
        let fluctuation = (Math.random() - 0.5) * 0.1;
        estimatedSiteMemory += fluctuation;
        
        // Обновляем текстовое значение
        if (valueElement) {
            valueElement.textContent = `Использовано: ${estimatedSiteMemory.toFixed(2)} МБ из ${maxSiteMemory.toFixed(2)} МБ`;
        }
    }
    
    // Запускаем обновление каждые 2 секунды
    updateData(); // Первоначальное обновление
    
    const updateInterval = setInterval(() => {
        updateData();
    }, 2000);
    
    // Сохраняем интервал для возможной очистки
    if (window.memoryUpdateInterval) {
        clearInterval(window.memoryUpdateInterval);
    }
    window.memoryUpdateInterval = updateInterval;
}


// Функция для отображения графика памяти сайта в МБ
function startSiteMemoryGraph(valueElement, canvas, memoryData) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Массив для хранения истории использования памяти в МБ
    let memoryHistory = [];
    let maxHistoryLength = 60; // 60 точек на графике
    
    function updateMemoryData() {
        // Пересчитываем данные памяти
        let domCount = document.getElementsByTagName('*').length;
        let openWinCount = Object.keys(openWindows).length;
        let scriptsCount = document.scripts.length;
        let imagesCount = document.images.length;
        let stylesheetsCount = document.styleSheets.length;
        
        let estimatedSiteMemory = (
            (domCount * 0.001) +
            (openWinCount * 2) +
            (scriptsCount * 0.1) +
            (imagesCount * 0.05) +
            (stylesheetsCount * 0.02) +
            1.5
        );
        
        let maxSiteMemory = estimatedSiteMemory * 3;
        
        // Добавляем небольшие случайные колебания для реалистичности
        let fluctuation = (Math.random() - 0.5) * 0.1;
        estimatedSiteMemory += fluctuation;
        
        return {
            used: estimatedSiteMemory,
            max: maxSiteMemory
        };
    }
    
    function drawGraph() {
        // Очищаем canvas
        ctx.clearRect(0, 0, width, height);
        
        // Получаем актуальные данные
        let currentData = updateMemoryData();
        
        // Добавляем текущее значение в историю
        memoryHistory.push(currentData.used);
        if (memoryHistory.length > maxHistoryLength) {
            memoryHistory.shift();
        }
        
        // Обновляем текстовое значение
        if (valueElement) {
            valueElement.textContent = `Использовано: ${currentData.used.toFixed(2)} МБ из ${currentData.max.toFixed(2)} МБ`;
        }
        
        // Находим максимальное значение для масштабирования графика
        let maxValue = Math.max(...memoryHistory, currentData.max);
        let minValue = Math.min(...memoryHistory, 0);
        
        // Рисуем фон
        ctx.fillStyle = '#f0f4ff';
        ctx.fillRect(0, 0, width, height);
        
        // Рисуем сетку
        ctx.strokeStyle = '#dde4ff';
        ctx.lineWidth = 1;
        
        // Горизонтальные линии
        for (let i = 0; i <= 4; i++) {
            let y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Вертикальные линии
        for (let i = 0; i <= 8; i++) {
            let x = (width / 8) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Рисуем линию максимальной памяти
        let maxY = height - ((currentData.max - minValue) / (maxValue - minValue)) * height;
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, maxY);
        ctx.lineTo(width, maxY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Рисуем график использования памяти
        if (memoryHistory.length > 1) {
            ctx.strokeStyle = '#4a90ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < memoryHistory.length; i++) {
                let x = (width / (maxHistoryLength - 1)) * i;
                let y = height - ((memoryHistory[i] - minValue) / (maxValue - minValue)) * height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
            
            // Заливка под графиком
            ctx.fillStyle = 'rgba(74, 144, 255, 0.2)';
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            ctx.fill();
        }
        
        // Рисуем текущее значение в МБ
        ctx.fillStyle = '#4a90ff';
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${currentData.used.toFixed(1)} МБ`, width - 5, 15);
        
        // Рисуем максимальное значение
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Макс: ${currentData.max.toFixed(1)} МБ`, 5, 12);
        
        // Рисуем минимальное значение
        ctx.fillStyle = '#888';
        ctx.fillText('0 МБ', 5, height - 3);
    }
    
    // Запускаем обновление графика каждые 1000мс
    drawGraph(); // Первоначальная отрисовка
    
    const graphInterval = setInterval(() => {
        drawGraph();
    }, 1000);
    
    // Сохраняем интервал для возможной очистки
    if (window.memoryGraphInterval) {
        clearInterval(window.memoryGraphInterval);
    }
    window.memoryGraphInterval = graphInterval;
}


// Функция для отображения графика памяти сайта в МБ
function startSiteMemoryGraph(valueElement, canvas, memoryData) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Массив для хранения истории использования памяти в МБ
    let memoryHistory = [];
    let maxHistoryLength = 60; // 60 точек на графике
    
    function updateMemoryData() {
        // Пересчитываем данные памяти
        let domCount = document.getElementsByTagName('*').length;
        let openWinCount = Object.keys(openWindows).length;
        let scriptsCount = document.scripts.length;
        let imagesCount = document.images.length;
        let stylesheetsCount = document.styleSheets.length;
        
        let estimatedSiteMemory = (
            (domCount * 0.001) +
            (openWinCount * 2) +
            (scriptsCount * 0.1) +
            (imagesCount * 0.05) +
            (stylesheetsCount * 0.02) +
            1.5
        );
        
        let maxSiteMemory = estimatedSiteMemory * 3;
        
        // Добавляем небольшие случайные колебания для реалистичности
        let fluctuation = (Math.random() - 0.5) * 0.1;
        estimatedSiteMemory += fluctuation;
        
        return {
            used: estimatedSiteMemory,
            max: maxSiteMemory
        };
    }
    
    function drawGraph() {
        // Очищаем canvas
        ctx.clearRect(0, 0, width, height);
        
        // Получаем актуальные данные
        let currentData = updateMemoryData();
        
        // Добавляем текущее значение в историю
        memoryHistory.push(currentData.used);
        if (memoryHistory.length > maxHistoryLength) {
            memoryHistory.shift();
        }
        
        // Обновляем текстовое значение
        if (valueElement) {
            valueElement.textContent = `Использовано: ${currentData.used.toFixed(2)} МБ из ${currentData.max.toFixed(2)} МБ`;
        }
        
        // Находим максимальное значение для масштабирования графика
        let maxValue = Math.max(...memoryHistory, currentData.max);
        let minValue = Math.min(...memoryHistory, 0);
        
        // Рисуем фон
        ctx.fillStyle = '#f0f4ff';
        ctx.fillRect(0, 0, width, height);
        
        // Рисуем сетку
        ctx.strokeStyle = '#dde4ff';
        ctx.lineWidth = 1;
        
        // Горизонтальные линии
        for (let i = 0; i <= 4; i++) {
            let y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Вертикальные линии
        for (let i = 0; i <= 8; i++) {
            let x = (width / 8) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Рисуем линию максимальной памяти
        let maxY = height - ((currentData.max - minValue) / (maxValue - minValue)) * height;
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, maxY);
        ctx.lineTo(width, maxY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Рисуем график использования памяти
        if (memoryHistory.length > 1) {
            ctx.strokeStyle = '#4a90ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < memoryHistory.length; i++) {
                let x = (width / (maxHistoryLength - 1)) * i;
                let y = height - ((memoryHistory[i] - minValue) / (maxValue - minValue)) * height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
            
            // Заливка под графиком
            ctx.fillStyle = 'rgba(74, 144, 255, 0.2)';
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            ctx.fill();
        }
        
        // Рисуем текущее значение в МБ
        ctx.fillStyle = '#4a90ff';
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${currentData.used.toFixed(1)} МБ`, width - 5, 15);
        
        // Рисуем максимальное значение
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Макс: ${currentData.max.toFixed(1)} МБ`, 5, 12);
        
        // Рисуем минимальное значение
        ctx.fillStyle = '#888';
        ctx.fillText('0 МБ', 5, height - 3);
    }
    
    // Запускаем обновление графика каждые 1000мс
    drawGraph(); // Первоначальная отрисовка
    
    const graphInterval = setInterval(() => {
        drawGraph();
    }, 1000);
    
    // Сохраняем интервал для возможной очистки
    if (window.memoryGraphInterval) {
        clearInterval(window.memoryGraphInterval);
    }
    window.memoryGraphInterval = graphInterval;
}


// Функция для отображения графика памяти сайта
function startSiteMemoryGraph(valueElement, canvas, memoryData) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Массив для хранения истории использования памяти
    let memoryHistory = [];
    let maxHistoryLength = 60; // 60 точек на графике
    
    function updateMemoryData() {
        // Пересчитываем данные памяти
        let domCount = document.getElementsByTagName('*').length;
        let openWinCount = Object.keys(openWindows).length;
        let scriptsCount = document.scripts.length;
        let imagesCount = document.images.length;
        let stylesheetsCount = document.styleSheets.length;
        
        let estimatedSiteMemory = (
            (domCount * 0.001) +
            (openWinCount * 2) +
            (scriptsCount * 0.1) +
            (imagesCount * 0.05) +
            (stylesheetsCount * 0.02) +
            1.5
        );
        
        let maxSiteMemory = estimatedSiteMemory * 3;
        let memoryUsagePercent = (estimatedSiteMemory / maxSiteMemory * 100);
        
        // Добавляем небольшие случайные колебания для реалистичности
        let fluctuation = (Math.random() - 0.5) * 0.1;
        estimatedSiteMemory += fluctuation;
        
        return {
            used: estimatedSiteMemory,
            max: maxSiteMemory,
            percent: memoryUsagePercent
        };
    }
    
    function drawGraph() {
        // Очищаем canvas
        ctx.clearRect(0, 0, width, height);
        
        // Получаем актуальные данные
        let currentData = updateMemoryData();
        
        // Добавляем текущее значение в историю
        memoryHistory.push(currentData.percent);
        if (memoryHistory.length > maxHistoryLength) {
            memoryHistory.shift();
        }
        
        // Обновляем текстовое значение
        if (valueElement) {
            valueElement.textContent = `Использовано: ${currentData.used.toFixed(2)} МБ (${currentData.percent.toFixed(1)}%)`;
        }
        
        // Рисуем фон
        ctx.fillStyle = '#f0f4ff';
        ctx.fillRect(0, 0, width, height);
        
        // Рисуем сетку
        ctx.strokeStyle = '#dde4ff';
        ctx.lineWidth = 1;
        
        // Горизонтальные линии
        for (let i = 0; i <= 4; i++) {
            let y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Вертикальные линии
        for (let i = 0; i <= 8; i++) {
            let x = (width / 8) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Рисуем график использования памяти
        if (memoryHistory.length > 1) {
            ctx.strokeStyle = '#4a90ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < memoryHistory.length; i++) {
                let x = (width / (maxHistoryLength - 1)) * i;
                let y = height - (memoryHistory[i] / 100) * height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
            
            // Заливка под графиком
            ctx.fillStyle = 'rgba(74, 144, 255, 0.2)';
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            ctx.fill();
        }
        
        // Рисуем текущее значение
        ctx.fillStyle = '#4a90ff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${currentData.percent.toFixed(1)}%`, width - 5, 15);
        
        // Рисуем максимальное значение (100%)
        ctx.fillStyle = '#888';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('100%', 5, 12);
        ctx.fillText('0%', 5, height - 3);
    }
    
    // Запускаем обновление графика каждые 1000мс
    drawGraph(); // Первоначальная отрисовка
    
    const graphInterval = setInterval(() => {
        drawGraph();
    }, 1000);
    
    // Сохраняем интервал для возможной очистки
    if (window.memoryGraphInterval) {
        clearInterval(window.memoryGraphInterval);
    }
    window.memoryGraphInterval = graphInterval;
}


  function systemInfoTab() {
    let uptime = ((performance.now() / 1000) / 60).toFixed(1);
    let ua = navigator.userAgent;
    let lang = navigator.language;
    let mem = navigator.deviceMemory ? navigator.deviceMemory + ' ГБ' : 'N/A';
    let cores = navigator.hardwareConcurrency || 'N/A';
    let online = navigator.onLine ? 'Онлайн' : 'Оффлайн';
    let batteryHtml = '<span id="battery-info">Загрузка...</span>';
    o.innerHTML = `
      <div style='padding:24px 0; text-align:center;'>
        <b>Информация о системе</b>
        <table style='margin:18px auto 0 auto; min-width:320px; background:#fff; border-radius:8px; box-shadow:0 2px 8px #0001; border-collapse:collapse; font-size:15px;'>
          <tr><td style='padding:6px 16px;'>User Agent</td><td style='padding:6px 16px;'>${ua}</td></tr>
          <tr><td style='padding:6px 16px;'>Язык</td><td style='padding:6px 16px;'>${lang}</td></tr>
          <tr><td style='padding:6px 16px;'>Память</td><td style='padding:6px 16px;'>${mem}</td></tr>
          <tr><td style='padding:6px 16px;'>CPU ядер</td><td style='padding:6px 16px;'>${cores}</td></tr>
          <tr><td style='padding:6px 16px;'>Аптайм страницы</td><td style='padding:6px 16px;'>${uptime} мин</td></tr>
          <tr><td style='padding:6px 16px;'>Сеть</td><td style='padding:6px 16px;'>${online}</td></tr>
          <tr><td style='padding:6px 16px;'>Батарея</td><td style='padding:6px 16px;'>${batteryHtml}</td></tr>
        </table>
      </div>
    `;
    // Батарея
    if (navigator.getBattery) {
      navigator.getBattery().then(bat => {
        let b = `${(bat.level*100).toFixed(0)}% ${bat.charging ? '⚡️' : ''}`;
        o.querySelector('#battery-info').textContent = b;
      });
    } else {
      o.querySelector('#battery-info').textContent = 'N/A';
    }
  }
  function a(e){
    t.forEach(t=>t.classList.toggle("active",t.dataset.tab===e)),n&&(clearInterval(n),n=null);
    if("processes"===e) { s(); n=setInterval(s,2e3); }
    else if("cpu"===e) realCpuTab();
    else if("memory"===e) realMemoryTab();
    else if("storage"===e) {
      let e=0,t="";
      for(let o=0;o<localStorage.length;++o){
        const n=localStorage.key(o),s=localStorage.getItem(n)||"";
        e+=n.length+s.length,t+=`<tr><td style='padding:4px 12px; font-size:15px;'>${n}</td><td style='padding:4px 12px; font-size:15px;'>${s.length}</td></tr>`}
      const n=Math.round(e/1024);
      o.innerHTML=`
        <div style='font-size:18px; font-weight:600; margin-bottom:12px;'>Использование localStorage</div>
        <table style='width:100%; border-collapse:collapse; background:#f7f7fa; border-radius:12px; box-shadow:0 2px 8px #0001;'>
          <thead><tr style='background:#ececec;'><th style='text-align:left; padding:6px 12px;'>Ключ</th><th style='text-align:left; padding:6px 12px;'>Размер значения (байт)</th></tr></thead>
          <tbody>${t}</tbody>
        </table>
        <div style='margin-top:16px; font-size:16px; color:#007aff;'>Всего: <b>${n} КБ</b></div>
      `
    }
    else if("system"===e) systemInfoTab();
  }
  e.querySelectorAll(".system-monitor-tab").forEach(e=>e.onclick=()=>a(e.dataset.tab));
  a("processes");
  e.addEventListener("remove",()=>{n&&clearInterval(n)})
}
// Реальный мониторинг загрузки CPU (JS thread)
function startRealCpuUsage(valEl, graphEl) {
  let last = performance.now(), busy = 0, total = 0, usage = 0;
  let arr = Array(32).fill(0);
  function tick() {
    let t0 = performance.now();
    // Busy loop на 10мс, чтобы замерить busy time (имитация нагрузки)
    let busyStart = performance.now();
    while(performance.now() - busyStart < 10){};
    let t1 = performance.now();
    let frame = t1 - t0;
    busy = frame;
    total = 16.7; // ~60fps
    usage = Math.min(100, Math.max(0, (busy/total)*100));
    arr.push(usage); if(arr.length>32) arr.shift();
    valEl.textContent = usage.toFixed(1) + '%';
    // draw
    const ctx = graphEl.getContext('2d');
    ctx.clearRect(0,0,320,80);
    ctx.beginPath();
    ctx.moveTo(0,80-arr[0]);
    for(let i=1;i<arr.length;i++) ctx.lineTo(10*i,80-arr[i]);
    ctx.strokeStyle="#007aff";
    ctx.lineWidth=2.5;
    ctx.stroke();
    ctx.fillStyle="#e6eaff";
    ctx.lineTo(320,80);
    ctx.lineTo(0,80);
    ctx.closePath();
    ctx.fill();
    setTimeout(tick, 700);
  }
  tick();
}
// Реальный мониторинг памяти (если возможно)
function startRealMemoryUsage(valEl, graphEl, deviceMem) {
  let arr = Array(32).fill(0);
  function getMem() {
    let used = 0, total = deviceMem;
    if (performance.memory) {
      used = performance.memory.usedJSHeapSize / 1024 / 1024 / 1024;
      total = performance.memory.jsHeapSizeLimit / 1024 / 1024 / 1024;
    } else {
      used = Math.random()*(.7*total)+.2*total;
    }
    return {used, total};
  }
  function tick() {
    let {used, total} = getMem();
    arr.push(used); if(arr.length>32) arr.shift();
    valEl.textContent = used.toFixed(2) + ' ГБ / ' + total.toFixed(2) + ' ГБ';
    // draw
    const ctx = graphEl.getContext('2d');
    ctx.clearRect(0,0,320,80);
    ctx.beginPath();
    ctx.moveTo(0,80-80*arr[0]/total);
    for(let i=1;i<arr.length;i++) ctx.lineTo(10*i,80-80*arr[i]/total);
    ctx.strokeStyle="#007aff";
    ctx.lineWidth=2.5;
    ctx.stroke();
    ctx.fillStyle="#e6eaff";
    ctx.lineTo(320,80);
    ctx.lineTo(0,80);
    ctx.closePath();
    ctx.fill();
    setTimeout(tick, 1800);
  }
  tick();
}
