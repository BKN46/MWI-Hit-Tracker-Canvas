import { projectileEffectsMap } from "./effects/projectile";
import { onHitEffectsMap } from "./effects/hit";

const canvas = initTrackerCanvas();
const ctx = canvas.getContext('2d');

function initTrackerCanvas() {
    const gamePanel = document.querySelector("body");
    const canvas = document.createElement('canvas');
    canvas.id = 'hitTrackerCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '200';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.pointerEvents = 'none';
    gamePanel.appendChild(canvas);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    return canvas;
}

// Update shake animation effect to ensure element returns to original position
function applyShakeEffect(element, intensity = 1, duration = 500) {
    if (!element) return;
    
    // Store the element's original position/transform
    const originalTransform = element.style.transform || '';
    const originalTransition = element.style.transition || '';
    
    // Scale intensity based on size/damage
    const scaledIntensity = Math.min(10, intensity);
    
    // Apply CSS animation
    element.style.transition = 'transform 50ms ease-in-out';
    
    let shakeCount = 0;
    const maxShakes = Math.ceil(intensity);
    const shakeInterval = 50;
    const interval = setInterval(() => {
        if (shakeCount >= maxShakes) {
            // Ensure element returns to original position
            clearInterval(interval);
            element.style.transform = originalTransform;
            element.style.transition = originalTransition;
            return;
        }
        
        // Random offset for shaking effect
        const xOffset = (Math.random() - 0.5) * 2 * scaledIntensity;
        const yOffset = (Math.random() - 0.5) * 2 * scaledIntensity;
        element.style.transform = `${originalTransform} translate(${xOffset}px, ${yOffset}px)`;
        shakeCount++;
    }, shakeInterval);
    
    // Additional safeguard: ensure element returns to original position after max duration
    setTimeout(() => {
        clearInterval(interval);
        element.style.transform = 'translate(0, 0)';
        element.style.transition = originalTransition;
    }, shakeInterval * (maxShakes + 1)); // Slightly longer than maxShakes * interval time
}

function addDamageHPBar(element, damage) {
    const hpBarContainer = element.querySelector(".HitpointsBar_hitpointsBar__2vIqC");
    const hpBarFront = hpBarContainer.querySelector(".HitpointsBar_currentHp__5exLr");
    // hpBarFront.style.zIndex = "1";
    const hpBarValue = hpBarContainer.querySelector(".HitpointsBar_hpValue__xNp7m");
    // hpBarValue.style.zIndex = "2";
    const hpStat = hpBarValue.innerHTML.split("/");
    const currentHp = parseInt(hpStat[0]);
    const maxHp = parseInt(hpStat[1]);

    // Insert a HpBar behind and set the color to red
    const hpBarBack = document.createElement("div");
    hpBarBack.className = "HitpointsBar_currentHp__5exLr HitTracker_hpDrop";
    hpBarBack.style.background = "var(--color-warning)";
    hpBarBack.style.position = "absolute";
    hpBarBack.style.top = "0px";
    hpBarBack.style.left = "0px";
    // hpBarBack.style.zIndex = "1"; // Ensure the back bar is below the front bar
    hpBarBack.style.width = `${hpBarFront.offsetWidth}px`;
    hpBarBack.style.height = `${hpBarFront.offsetHeight}px`;
    hpBarBack.style.transformOrigin = "left center";
    hpBarBack.style.transform = `scaleX(${(currentHp + damage) / maxHp})`;
    // add animation to drop down
    hpBarBack.style.transition = "transform 0.5s ease-in-out";
    hpBarFront.parentNode.insertBefore(hpBarBack, hpBarFront); // Insert the back bar before the front bar

    setTimeout(() => {
        hpBarBack.style.transform = `scaleX(${currentHp / maxHp})`;
    }, 100);

    setTimeout(() => {
        hpBarBack.remove();
    }, 800);
}

// 更新和渲染所有命中效果
function updateOnHits() {
    // 遍历所有活跃的命中
    for (let i = activeOnHitAnimation.length - 1; i >= 0; i--) {
        const effect = activeOnHitAnimation[i];
        effect.count++;

        if (effect.count >= effect.maxCount) {
            activeOnHitAnimation.splice(i, 1);
            continue;
        }

        ctx.save();

        // 更新各自效果
        effect.effects.forEach((e, index) => {
            e.draw(ctx, e);
        });

        // 伤害文本
        if (effect.otherInfo.damage) { 
            const fontSize=  Math.min(Math.max(14, Math.pow(effect.otherInfo.damage,0.65)/2), 70);
            const damageText = `${effect.otherInfo.damage}`
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // border
            ctx.strokeStyle = effect.otherInfo.color;
            ctx.lineWidth = 6;
            ctx.strokeText(damageText, effect.otherInfo.end.x, effect.otherInfo.end.y - 20);
            // main
            ctx.fillStyle = 'white';
            const textWidth = ctx.measureText(damageText).width;
            if (textWidth < 100) {
                ctx.fillText(damageText, effect.otherInfo.end.x, effect.otherInfo.end.y - 20);
            } else {
                ctx.fillText(damageText, effect.otherInfo.end.x, effect.otherInfo.end.y - 20, textWidth + 10);
            }
        }
        ctx.restore();
    }
}

// 动画循环
export function animate() {
    // 完全清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新并绘制所有弹丸
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.update();
        proj.draw(ctx);

        if(proj.isArrived()) {
            createOnHitEffect(proj); // 将弹丸大小传递给爆炸效果
            projectiles.splice(i, 1);
        } else if(proj.isOutOfBounds()) {
            // 超出边界则移除弹丸，不产生爆炸效果
            projectiles.splice(i, 1);
        }
    }
    
    // 更新和渲染所有爆炸效果
    updateOnHits();

    requestAnimationFrame(animate);
}

class Projectile {
    constructor(startX, startY, endX, endY, color, initialSpeed = 1, size = 10, otherInfo={}) {
        // 基础属性
        this.x = startX;
        this.y = startY;
        this.start = { x: startX, y: startY };
        this.target = { x: endX, y: endY };
        this.otherInfo = otherInfo;
        this.shakeApplied = false;

        this.type = otherInfo.type || 'default';
        this.effect = projectileEffectsMap[this.type] || projectileEffectsMap['fireball'];

        this.doShake = this.effect.shake;

        // 运动参数 - 向斜上方抛物线轨迹
        this.gravity = this.effect.gravity || 0.2; // 重力加速度
        this.initialSpeed = initialSpeed * (this.effect.speedFactor || 1); // 初始速度参数

        // 计算水平距离和高度差
        const dx = endX - startX;
        const dy = endY - startY;
        
        // 重新设计飞行时间计算，确保合理
        // const timeInAir = distance / this.initialSpeed / 10;
        const timeInAir = 80 / this.initialSpeed;

        // 计算初始速度，修正公式确保能够到达目标
        this.velocity = {
            x: dx / timeInAir,
            y: (dy / timeInAir) - (this.gravity * timeInAir / 2)
        };
        
        // 大小参数 (范围1-100)
        this.sizeScale = Math.max(1, Math.min(100, size)) / 10; // 转换为比例因子
        
        // 外观属性
        this.size = 10 * this.sizeScale;
        this.color = this.effect.color || color;
        
        // 拖尾效果
        this.trail = [];
        this.maxTrailLength = Math.floor((this.effect.trailLength || 50) * Math.sqrt(this.sizeScale)); // 拖尾长度随大小增加
    }

    update() {
        // 更新速度 (考虑重力)
        this.velocity.y += this.gravity;
        
        // 更新位置
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // 更新拖尾
        this.trail.push({ x: this.x, y: this.y });
        if(this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    draw(canvas) {
        // 绘制拖尾
        this.trail.forEach((pos, index) => {
            const alpha = index / this.trail.length;
            canvas.beginPath();
            canvas.arc(pos.x, pos.y, this.size * alpha, 0, Math.PI * 2);
            canvas.fillStyle = `${this.color}`;
            canvas.fill();
        });

        // 绘制主体
        this.effect.draw(canvas, this);

        // 添加光晕效果
        if (this.effect.glow) {
            this.effect.glow(canvas, this);
        }
    }

    isArrived() {
        // 判断是否到达目标点 (调整判定距离)
        const arrivalDistance = 20;
        const hasArrived = Math.hypot(this.x - this.target.x, this.y - this.target.y) < arrivalDistance;
        
        if (hasArrived && this.doShake && !this.shakeApplied && this.otherInfo.endElement) {
            const shakeIntensity = Math.min(this.sizeScale * 5, 10);
            applyShakeEffect(this.otherInfo.endElement, shakeIntensity);
            this.shakeApplied = true;
        }

        return hasArrived;
    }

    isOutOfBounds() {
        return this.x < 0 || this.x > canvas.width || 
                this.y < 0 || this.y > canvas.height;
    }
}

// Projectiles管理
let projectiles = [];

// 存储所有活跃的爆炸效果
let activeOnHitAnimation = [];

// 爆炸效果函数
function createOnHitEffect(projectile) {
    const x = projectile.x;
    const y = projectile.y;
    const size = projectile.size;
    const color = projectile.color;
    const otherInfo = projectile.otherInfo;

    // Resize for onHit effect
    const sizeScale = Math.max(1, Math.min(100, size)) / 20;
    projectile.size = sizeScale;

    const effects = [];

    const onHitEffect = projectile.effect.onHit;
    for (const effectName in onHitEffect) {
        const effect = onHitEffectsMap[effectName];
        if (!effect) continue;

        const effectCount = onHitEffect[effectName](projectile.size);
        for (let i = 0; i < effectCount; i++) {
            effects.push({
                x: effect.x ? effect.x(projectile) : x, 
                y: effect.y ? effect.y(projectile) : y,
                angle: effect.angle ? effect.angle(projectile) : Math.random() * Math.PI * 2,
                alpha: effect.alpha ? effect.alpha(projectile) : 0.8,
                size: effect.size ? effect.size(projectile) : Math.random() * 10 + 5,
                speed: effect.speed ? effect.speed(projectile) : Math.random() * 5 + 2,
                gravity: effect.gravity ? effect.gravity(projectile) : 0,
                life: effect.life ? effect.life(projectile) : 1000,
                color: effect.color ? effect.color(projectile) : projectile.color,
                draw: effect.draw ? effect.draw : (ctx, p) => {},
            });
        }
    }

    // 存储命中动画的活跃状态，用于跟踪
    const onHitEffectData = {
        effects: [...effects],
        active: true,
        count: 0,
        maxCount: 120,
        otherInfo: otherInfo,
    };
    
    activeOnHitAnimation.push(onHitEffectData);
}

export function createProjectile(startElement, endElement, color, initialSpeed = 1, damage = 200, projectileType = 'default') {
    if (!startElement || !endElement) {
        return;
    }
    const combatUnitContainer = endElement.querySelector(".CombatUnit_splatsContainer__2xcc0");
    combatUnitContainer.style.visibility = "hidden";
    const padding = 30;
    const randomRange = {
        x: Math.floor((Math.random() * (combatUnitContainer.offsetWidth - 2 * padding)) - combatUnitContainer.offsetWidth / 2 + padding),
        y: Math.floor((Math.random() * (combatUnitContainer.offsetHeight - 2 * padding)) - combatUnitContainer.offsetHeight / 2 + padding),
    }

    const projectileLimit = 30;
    const start = getElementCenter(startElement);
    const end = getElementCenter(endElement);
    end.x = Math.floor(end.x + randomRange.x);
    end.y = Math.floor(end.y + randomRange.y);

    const size = Math.min(Math.max(Math.pow(damage+200,0.7)/20, 4), 16)
    const otherInfo = {
        type: projectileType,
        start: start,
        end: end,
        damage: damage,
        color: color,
        startElement: startElement,
        endElement: endElement,
    }
    if (damage > 0) {
        addDamageHPBar(endElement, damage);
    }
    const projectile = new Projectile(start.x, start.y, end.x, end.y, color, initialSpeed, size, otherInfo);
    projectiles.push(projectile);
    if (projectiles.length > projectileLimit) {
        projectiles.shift();
    }
}

function getElementCenter(element) {
    const rect = element.getBoundingClientRect();
    if (element.innerText.trim() === '') {
        return {
            x: rect.left + rect.width/2,
            y: rect.top
        };
    }
    return {
        x: rect.left + rect.width/2,
        y: rect.top + rect.height/2
    };
}