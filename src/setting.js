const isZHInGameSetting = localStorage.getItem("i18nextLng")?.toLowerCase()?.startsWith("zh"); // 获取游戏内设置语言
let isZH = isZHInGameSetting; // MWITools 本身显示的语言默认由游戏内设置语言决定

export let settingsMap = {
  tracker0 : {
      id: "tracker0",
      desc: isZH ? "玩家 #1":"player #1",
      isTrue: true,
      r: 255,
      g: 99,
      b: 132,
  },
  tracker1 : {
      id: "tracker1",
      desc: isZH ? "玩家 #2":"player #2",
      isTrue: true,
      r: 54,
      g: 162,
      b: 235,
  },
  tracker2 : {
      id: "tracker2",
      desc: isZH ? "玩家 #3":"player #3",
      isTrue: true,
      r: 255,
      g: 206,
      b: 86,
  },
  tracker3 : {
      id: "tracker3",
      desc: isZH ? "玩家 #4":"player #4",
      isTrue: true,
      r: 75,
      g: 192,
      b: 192,
  },
  tracker4 : {
      id: "tracker4",
      desc: isZH ? "玩家 #5":"player #5",
      isTrue: true,
      r: 153,
      g: 102,
      b: 255,
  },
  tracker6 : {
      id: "tracker6",
      desc: isZH ? "敌人":"enemies",
      isTrue: true,
      r: 255,
      g: 0,
      b: 0,
  }
};
readSettings();

export function waitForSetttins() {
  const targetNode = document.querySelector("div.SettingsPanel_profileTab__214Bj");
  if (targetNode) {
      if (!targetNode.querySelector("#tracker_settings")) {
          targetNode.insertAdjacentHTML("beforeend", `<div id="tracker_settings"></div>`);
          const insertElem = targetNode.querySelector("div#tracker_settings");
          insertElem.insertAdjacentHTML(
              "beforeend",
              `<div style="float: left; color: orange">${
                  isZH ? "MWI-Hit-Tracker 设置 ：" : "MWI-Hit-Tracker Settings: "
              }</div></br>`
          );

          for (const setting of Object.values(settingsMap)) {
              insertElem.insertAdjacentHTML(
                  "beforeend",
                  `<div class="tracker-option"><input type="checkbox" id="${setting.id}" ${setting.isTrue ? "checked" : ""}></input>${
                      setting.desc
                  }<div class="color-preview" id="colorPreview_${setting.id}"></div></div>`
              );
              // 颜色自定义
              const colorPreview = document.getElementById('colorPreview_'+setting.id);
              let currentColor = { r: setting.r, g: setting.g, b: setting.b };

              // 点击打开颜色选择器
              colorPreview.addEventListener('click', () => {
                  const settingColor = { r: settingsMap[setting.id].r, g: settingsMap[setting.id].g, b: settingsMap[setting.id].b }
                  const modal = createColorPicker(settingColor, (newColor) => {
                      currentColor = newColor;
                      settingsMap[setting.id].r = newColor.r;
                      settingsMap[setting.id].g = newColor.g;
                      settingsMap[setting.id].b = newColor.b;
                      localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
                      updatePreview();
                  });
                  document.body.appendChild(modal);
              });

              function updatePreview() {
                  colorPreview.style.backgroundColor = `rgb(${currentColor.r},${currentColor.g},${currentColor.b})`;
              }

              updatePreview();
              function createColorPicker(initialColor, callback) {
                  // 创建弹窗容器
                  const backdrop = document.createElement('div');
                  backdrop.className = 'modal-backdrop';

                  const modal = document.createElement('div');
                  modal.className = 'color-picker-modal';

                  // 颜色预览
                  //const preview = document.createElement('div');
                  //preview.className = 'color-preview';
                  //preview.style.height = '100px';
                  // 创建SVG容器
                  const preview = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                  preview.setAttribute("width", "200");
                  preview.setAttribute("height", "150");
                  preview.style.display = 'block';
                  // 创建抛物线路径
                  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                  Object.assign(path.style, {
                      strokeWidth: '5px',
                      fill: 'none',
                      strokeLinecap: 'round',
                  });
                  path.setAttribute("d", "M 0 130 Q 100 0 200 130");
                  preview.appendChild(path);

                  // 颜色控制组件
                  const controls = document.createElement('div');
                  ['r', 'g', 'b'].forEach(channel => {
                      const container = document.createElement('div');
                      container.className = 'slider-container';

                      // 标签
                      const label = document.createElement('label');
                      label.textContent = channel.toUpperCase() + ':';
                      label.style.color = "white";

                      // 滑块
                      const slider = document.createElement('input');
                      slider.type = 'range';
                      slider.min = 0;
                      slider.max = 255;
                      slider.value = initialColor[channel];

                      // 输入框
                      const input = document.createElement('input');
                      input.type = 'number';
                      input.min = 0;
                      input.max = 255;
                      input.value = initialColor[channel];
                      input.style.width = '60px';

                      // 双向绑定
                      const updateChannel = (value) => {
                          value = Math.min(255, Math.max(0, parseInt(value) || 0));
                          slider.value = value;
                          input.value = value;
                          currentColor[channel] = value;
                          path.style.stroke = getColorString(currentColor);
                      };

                      slider.addEventListener('input', (e) => updateChannel(e.target.value));
                      input.addEventListener('change', (e) => updateChannel(e.target.value));

                      container.append(label, slider, input);
                      controls.append(container);
                  });

                  // 操作按钮
                  const actions = document.createElement('div');
                  actions.className = 'modal-actions';

                  const confirmBtn = document.createElement('button');
                  confirmBtn.textContent = isZH ? '确定':'OK';
                  confirmBtn.onclick = () => {
                      callback(currentColor);
                      backdrop.remove();
                  };

                  const cancelBtn = document.createElement('button');
                  cancelBtn.textContent = isZH ? '取消':'Cancel';
                  cancelBtn.onclick = () => backdrop.remove();

                  actions.append(cancelBtn, confirmBtn);

                  // 组装弹窗
                  const getColorString = (color) =>
                  `rgb(${color.r},${color.g},${color.b})`;

                  path.style.stroke = getColorString(settingsMap[setting.id]);
                  modal.append(preview, controls, actions);
                  backdrop.append(modal);

                  // 点击背景关闭
                  backdrop.addEventListener('click', (e) => {
                      if (e.target === backdrop) backdrop.remove();
                  });

                  return backdrop;
              }
          }

          insertElem.addEventListener("change", saveSettings);
      }
  }
  setTimeout(waitForSetttins, 500);
};

export function saveSettings() {
  for (const checkbox of document.querySelectorAll("div#tracker_settings input")) {
      settingsMap[checkbox.id].isTrue = checkbox.checked;
      localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
  }
}

export function readSettings() {
  const ls = localStorage.getItem("tracker_settingsMap");
  if (ls) {
      const lsObj = JSON.parse(ls);
      for (const option of Object.values(lsObj)) {
          if (settingsMap.hasOwnProperty(option.id)) {
              settingsMap[option.id].isTrue = option.isTrue;
              settingsMap[option.id].r = option.r;
              settingsMap[option.id].g = option.g;
              settingsMap[option.id].b = option.b;
          }
      }
  }
}

const style = document.createElement('style');
style.textContent = `
    .tracker-option {
      display: flex;
      align-items: center;
    }

    .color-preview {
        cursor: pointer;
        width: 20px;
        height: 20px;
        margin: 3px 3px;
        border: 1px solid #ccc;
        border-radius: 3px;
    }

    .color-picker-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.5);
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0,0,0,0.2);
        z-index: 1000;
    }

    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 999;
    }

    .modal-actions {
        margin-top: 20px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
`;
document.head.appendChild(style);