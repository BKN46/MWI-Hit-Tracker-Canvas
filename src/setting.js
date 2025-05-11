const isZHInGameSetting = localStorage.getItem("i18nextLng")?.toLowerCase()?.startsWith("zh"); // 获取游戏内设置语言
let isZH = isZHInGameSetting; // MWITools 本身显示的语言默认由游戏内设置语言决定

export let settingsMap = {
    projectileLimit: {
        id: "projectileLimit",
        desc: isZH ? "投射物数量限制":"Projectile Limit",
        value: 30,
        min: 1,
        max: 100,
        step: 1,
    },
    projectileScale: {
        id: "projectileScale",
        desc: isZH ? "投射物缩放":"Projectile Scale",
        value: 1.0,
        min: 0.1,
        max: 3.0,
        step: 0.01,
    },
    onHitScale: {
        id: "onHitScale",
        desc: isZH ? "命中效果缩放":"On-hit Effect Scale",
        value: 1.0,
        min: 0.1,
        max: 3.0,
        step: 0.01,
    },
    projectileHeightScale: {
        id: "projectileHeightScale",
        desc: isZH ? "弹道高度比例":"Projectile Height Scale",
        value: 1.0,
        min: 0.1,
        max: 3.0,
        step: 0.01,
    },
    projectileSpeedScale: {
        id: "projectileSpeedScale",
        desc: isZH ? "弹道速度比例":"Projectile Speed Scale",
        value: 1.0,
        min: 0.1,
        max: 3.0,
        step: 0.01,
    },
    shakeEffectScale: {
        id: "shakeEffectScale",
        desc: isZH ? "震动效果":"Shake Effect Scale",
        value: 1.0,
        min: 0.0,
        max: 3.0,
        step: 0.01,
    },
    particleEffectRatio: {
        id: "particleEffectRatio",
        desc: isZH ? "粒子效果数量":"Particle Effect Ratio",
        value: 1.0,
        min: 0.0,
        max: 5.0,
        step: 0.1,
    },
    particleLifespanRatio: {
        id: "particleLifespanRatio",
        desc: isZH ? "粒子效果持续时长":"Particle Lifespan Ratio",
        value: 1.0,
        min: 0.1,
        max: 5.0,
        step: 0.1,
    },
    particleSpeedRatio: {
        id: "particleSpeedRatio",
        desc: isZH ? "粒子效果初速度":"Particle Effect Speed Ratio",
        value: 1.0,
        min: 0.1,
        max: 5.0,
        step: 0.1,
    },
    projectileTrailLength: {
        id: "projectileTrailLength",
        desc: isZH ? "弹道尾迹长度":"Projectile Trail Length",
        value: 1.0,
        min: 0.0,
        max: 5.0,
        step: 0.01,
    },
    originalDamageDisplay: {
        id: "originalDamageDisplay",
        desc: isZH ? "原版伤害显示":"Original Damage Display",
        value: false,
    },
    damageTextLifespan: {
        id: "damageTextLifespan",
        desc: isZH ? "伤害文本持续时间":"Damage Text Lifespan",
        value: 120,
        min: 30,
        max: 480,
        step: 10,
    },
    damageTextScale: {
        id: "damageTextScale",
        desc: isZH ? "伤害文本大小":"Damage Text Scale",
        value: 1.0,
        min: 0.1,
        max: 3.0,
        step: 0.1,
    },
    damageTextAlpha: {
        id: "damageTextAlpha",
        desc: isZH ? "伤害文本不透明度":"Damage Text Alpha",
        value: 0.8,
        min: 0.0,
        max: 1.0,
        step: 0.01,
    },
    damageTextSizeLimit: {
        id: "damageTextSizeLimit",
        desc: isZH ? "伤害文本尺寸上限":"Damage Text Size Limit",
        value: 70,
        min: 15,
        max: 200,
        step: 1,
    },
    showSelfRegen: {
        id: "showSelfRegen",
        desc: isZH ? "显示玩家被动回复效果":"Show Self Regeneration",
        value: true,
    },
    monsterDeadAnimation: {
        id: "monsterDeadAnimation",
        desc: isZH ? "怪物死亡效果":"Monster Dead Animation",
        value: true,
    },
    monsterDeadAnimationStyle: {
        id: "monsterDeadAnimationStyle",
        desc: isZH ? "怪物死亡效果样式":"Monster Dead Animation Style",
        value: "default",
        list: [],
    },
    damageHpBarDropDelay: {
        id: "damageHpBarDropDelay",
        desc: isZH ? "血条掉落延迟":"Hp Bar Drop Delay",
        value: 300,
        min: 50,
        max: 1000,
        step: 50,
    },
    tracker0 : {
        id: "tracker0",
        desc: isZH ? "玩家1":"Player 1",
        isTrue: true,
        trackStyle: "auto",
        r: 255,
        g: 99,
        b: 132,
    },
    tracker1 : {
        id: "tracker1",
        desc: isZH ? "玩家2":"Player 2",
        isTrue: true,
        trackStyle: "auto",
        r: 54,
        g: 162,
        b: 235,
    },
    tracker2 : {
        id: "tracker2",
        desc: isZH ? "玩家3":"Player 3",
        isTrue: true,
        trackStyle: "auto",
        r: 255,
        g: 206,
        b: 86,
    },
    tracker3 : {
        id: "tracker3",
        desc: isZH ? "玩家4":"Player 4",
        isTrue: true,
        trackStyle: "auto",
        r: 75,
        g: 192,
        b: 192,
    },
    tracker4 : {
        id: "tracker4",
        desc: isZH ? "玩家5":"Player 5",
        isTrue: true,
        trackStyle: "auto",
        r: 153,
        g: 102,
        b: 255,
    },
    tracker6 : {
        id: "tracker6",
        desc: isZH ? "敌人":"Enemies",
        isTrue: true,
        trackStyle: "auto",
        r: 255,
        g: 0,
        b: 0,
    }
};
readSettings();

export function waitForSettings(params) {
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
                if (setting.id.startsWith("tracker")) {
                    insertElem.insertAdjacentHTML(
                        "beforeend",
                        `<div class="tracker-option"><input type="checkbox" id="${setting.id}" ${setting.isTrue ? "checked" : ""}></input>${setting.desc} ${isZH ? '颜色' : 'Color'}<div class="color-preview" id="colorPreview_${setting.id}"></div>${isZH ? '样式' : 'Projectile Style'}<select id="projectileStyle_${setting.id}"></select></div>`
                    );
                    const checkedBox = insertElem.querySelector("#" + setting.id);
                    checkedBox.addEventListener("change", (e) => {
                        settingsMap[setting.id].isTrue = e.target.checked;
                        saveSettings();
                    });

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

                    const select = document.querySelector("#projectileStyle_" + setting.id);
                    const projectileStyle = ["auto", "null", ...params.allProjectiles];
                    for (const option of projectileStyle) {
                        select.insertAdjacentHTML(
                            "beforeend",
                            `<option value="${option}" ${option === setting.trackStyle ? "selected" : ""}>${option}</option>`
                        );
                    }
                    select.addEventListener("change", (e) => {
                        settingsMap[setting.id].trackStyle = e.target.value;
                        saveSettings();
                    });

                } else {
                    if (typeof setting.value === "boolean") {
                        insertElem.insertAdjacentHTML(
                            "beforeend",
                            `<div class="tracker-option">${setting.desc}<input type="checkbox" id="trackerSetting_${setting.id}"></input></div>`
                        );
                        const checkedBox = insertElem.querySelector("#trackerSetting_" + setting.id);
                        checkedBox.checked = setting.value;
                        checkedBox.addEventListener("change", (e) => {
                            settingsMap[setting.id].value = e.target.checked;
                            saveSettings();
                        });
                    } else if (typeof setting.value === "number") {
                        insertElem.insertAdjacentHTML(
                            "beforeend",
                            `<div class="tracker-option">${setting.desc}<input type="range" id="trackerSetting_${setting.id}_range"></input><input type="number" id="trackerSetting_${setting.id}_value"></input></div>`
                        );
                        const slider = document.querySelector("#trackerSetting_" + setting.id + "_range");
                        slider.min = setting.min;
                        slider.max = setting.max;
                        slider.step = setting.step || 0.05;
                        slider.value = setting.value;

                        const input = document.querySelector("#trackerSetting_" + setting.id + "_value");
                        input.min = setting.min;
                        input.max = setting.max;
                        input.step = setting.step || 0.05;
                        input.value = setting.value;

                        const updateChannel = (value) => {
                            value = Math.min(setting.max, Math.max(setting.min, parseFloat(value)));
                            slider.value = value;
                            input.value = value;
                            settingsMap[setting.id].value = value;
                        };

                        slider.addEventListener('input', (e) => updateChannel(e.target.value));
                        input.addEventListener('change', (e) => updateChannel(e.target.value));
                    } else if (setting.list) {
                        insertElem.insertAdjacentHTML(
                            "beforeend",
                            `<div class="tracker-option">${setting.desc}<select id="trackerSetting_${setting.id}"></select></div>`
                        );
                        const select = document.querySelector("#trackerSetting_" + setting.id);
                        for (const option of params[setting.id]) {
                            select.insertAdjacentHTML(
                                "beforeend",
                                `<option value="${option}" ${option === setting.value ? "selected" : ""}>${option}</option>`
                            );
                        }
                        select.addEventListener("change", (e) => {
                            settingsMap[setting.id].value = e.target.value;
                            saveSettings();
                        });
                    }
                }
            }

            insertElem.addEventListener("change", saveSettings);
        }
    }
    setTimeout(() => {
        waitForSettings(params)
    }, 500);
};

export function saveSettings() {
    localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
}

export function readSettings() {
    const ls = localStorage.getItem("tracker_settingsMap");
    if (ls) {
        const lsObj = JSON.parse(ls);
        for (const option of Object.values(lsObj)) {
            if (option.id.startsWith("tracker")) {
                if (settingsMap.hasOwnProperty(option.id)) {
                    settingsMap[option.id].isTrue = option.isTrue;
                    settingsMap[option.id].trackStyle = option.trackStyle || "auto";
                    settingsMap[option.id].r = option.r;
                    settingsMap[option.id].g = option.g;
                    settingsMap[option.id].b = option.b;
                }
            } else if(option && option.value && option.id && settingsMap[option.id]) {
                settingsMap[option.id].value = option.value;
            }
        }
    }
}

const style = document.createElement('style');
style.textContent = `
    .tracker-option {
      display: flex;
      align-items: left;
      gap: 10px;
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