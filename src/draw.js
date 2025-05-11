import { projectileEffectsMap } from "./effects/projectile.js";
import { abilityEffectsMap } from "./effects/abilities.js";
import { onHitEffectsMap } from "./effects/hit.js";
import { settingsMap } from "./setting.js";
import { getElementCenter } from "./effects/utils.js";
import { applyShakeEffect, addDamageHPBar, applyDeadEffect } from "./effects/domEffect.js";
import { addEffect, activeEffects } from "./effects/manager.js";

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
let fpsStatTime = new Date().getTime();
let fpsQueue = [];
let fps = 60;

// 动画循环
export function animate() {
    // 计算FPS
    const now = Date.now();
    const delta = now - fpsStatTime;
    fpsStatTime = now;
    const fpsNow = Math.round(1000 / delta);
    fpsQueue.push(fpsNow);
    if (fpsQueue.length > 30) {
        fpsQueue.shift();
    }
    fps = Math.round(fpsQueue.reduce((a, b) => a + b) / fpsQueue.length);
    fps = Math.min(Math.max(fps, 10), 300);


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
        this.gravity *= settingsMap.projectileHeightScale.value || 1; // 高度缩放因子

        this.initialSpeed = initialSpeed * (this.effect.speedFactor || 1); // 初始速度参数
        this.initialSpeed *= settingsMap.projectileSpeedScale.value || 1; // 速度缩放因子

        // 计算水平距离和高度差
        const dx = endX - startX;
        const dy = endY - startY;
        
        // 重新设计飞行时间计算，确保合理
        // const timeInAir = distance / this.initialSpeed / 10;
        let timeInAir = 80 / this.initialSpeed;

        // FPS因子，确保在不同FPS下效果一致
        const fpsFactor = Math.min(Math.max(160 / fps, 0.125), 8); 
        this.gravity *= fpsFactor;
        timeInAir /= fpsFactor;

        // 计算初始速度，修正公式确保能够到达目标
        this.velocity = {
            x: dx / timeInAir,
            y: (dy / timeInAir) - (this.gravity * timeInAir / 2)
        };
        
        // 大小参数 (范围1-100)
        const projectileScale = settingsMap.projectileScale.value || 1;
        this.sizeScale = Math.max(1, Math.min(100, size)) / 10 * projectileScale; // 转换为比例因子
        
        // 外观属性
        this.size = 10 * this.sizeScale;
        this.color = this.effect.color || color;
        
        // 拖尾效果
        this.trail = [];
        this.maxTrailLength = Math.floor((this.effect.trailLength || 35) * Math.sqrt(this.sizeScale)); // 拖尾长度随大小增加
        this.maxTrailLength *= settingsMap.projectileTrailLength.value || 1; // 拖尾缩放因子
    }

    update() {
        // 更新速度 (考虑重力)
        this.velocity.y += this.gravity;
        
        // 更新位置
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // 更新拖尾
        if (this.effect.trailLength > 0){
            this.trail.push({
                x: this.x,
                y: this.y,
                vX: this.velocity.x,
                vY: this.velocity.y,
                color: this.color,
                size: this.size,
                totalLength: Math.max(this.trail.length, 1),
            });
        }
        if(this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    draw(canvas) {
        // 绘制拖尾
        this.trail.forEach((pos, index) => {
            if (this.effect.trail) {
                this.effect.trail(canvas, pos, index);
            } else {
                projectileEffectsMap['fireball'].trail(canvas, pos, index);
            }
        });

        // 绘制主体
        if (this.effect.draw) {
            this.effect.draw(canvas, this);
        } else {
            projectileEffectsMap['fireball'].draw(canvas, this);
        }

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

// 爆炸效果函数
function createOnHitEffect(projectile) {
    const x = projectile.x;
    const y = projectile.y;
    const color = projectile.color;
    const otherInfo = projectile.otherInfo;
    const projectileScale = settingsMap.projectileScale.value || 1;

    // Resize for onHit effect
    const sizeScale = 
    projectile.size = Math.max(1, Math.min(100, projectile.size)) / 20 / projectileScale;

    const sizeFactor = settingsMap.onHitScale.value || 1;
    const particleFactor = settingsMap.particleEffectRatio.value || 1;
    const particleSpeedFactor = settingsMap.particleSpeedRatio.value || 1;
    const particleLifespanFactor = settingsMap.particleLifespanRatio.value || 1;
    const fpsFactor = Math.min(Math.max(160 / fps, 0.125), 8);

    const effects = [];

    let onHitEffect = projectile.effect.onHit;
    if (projectile.otherInfo.isCrit) {
        const onCrit = projectile.effect.onCrit || projectileEffectsMap.fireball.onCrit;
        onHitEffect = { ...onHitEffect, ...onCrit };
    }

    for (const effectName in onHitEffect) {
        const effect = onHitEffectsMap[effectName];
        if (!effect) continue;

        const effectCount = Math.ceil(onHitEffect[effectName](projectile.size) * particleFactor);
        for (let i = 0; i < effectCount; i++) {
            const effectSize = (effect.size ? effect.size(projectile) : Math.random() * 10 + 5) * sizeFactor;
            const effectLife = Math.ceil((effect.life ? effect.life(projectile) : 1000) * particleLifespanFactor / fpsFactor);
            const effectSpeed = Math.ceil((effect.speed ? effect.speed(projectile) : Math.random() * 5 + 2) * fpsFactor * particleSpeedFactor);

            effects.push({
                x: effect.x ? effect.x(projectile) : x, 
                y: effect.y ? effect.y(projectile) : y,
                angle: effect.angle ? effect.angle(projectile) : Math.random() * Math.PI * 2,
                alpha: effect.alpha ? effect.alpha(projectile) : 0.8,
                size: effectSize,
                speed: effectSpeed,
                gravity: effect.gravity ? effect.gravity(projectile) : 0,
                life: effectLife,
                maxLife: effectLife,
                color: effect.color ? effect.color(projectile) : projectile.color,
                draw: effect.draw ? effect.draw : (ctx, p) => {},
            });
        }
    }

    // 存储命中动画的活跃状态，用于跟踪
    const damageTextLifespan = settingsMap.damageTextLifespan.value || 120;
    const lifeSpan = Math.ceil(damageTextLifespan / fpsFactor);

    const onHitEffectData = {
        effects: [...effects],
        active: true,
        count: 0,
        lifespan: lifeSpan,
        color: color,
        otherInfo: otherInfo,
    };
    
    addEffect(onHitEffectData);
}

// 更新和渲染所有命中效果
function updateOnHits() {
    // 遍历所有活跃的命中
    for (let i = activeEffects.length - 1; i >= 0; i--) {
        const effect = activeEffects[i];
        effect.count++;

        if (effect.count >= effect.lifespan) {
            activeEffects.splice(i, 1);
            continue;
        }

        ctx.save();

        // 更新各自效果
        effect.effects.forEach((e, index) => {
            e.draw(ctx, e);
        });

        // 伤害文本
        if (effect.otherInfo.damage) {
            const fontSizeScale = settingsMap.damageTextScale.value || 1;
            const fontSizeLimit = settingsMap.damageTextSizeLimit.value || 70;
            const fontAlpha = settingsMap.damageTextAlpha.value || 0.8;

            const fontSize=  Math.min(Math.max(14, Math.pow(effect.otherInfo.damage,0.65)/2*fontSizeScale), fontSizeLimit);
            const damageText = `${effect.otherInfo.damage}`
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const textSize = ctx.measureText(damageText);
            const textPosition = {
                x: effect.otherInfo.end.x - textSize.width / 2 + 5,
                y: effect.otherInfo.end.y - 20,
            }


            // border
            ctx.strokeStyle = effect.color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${fontAlpha})`);
            ctx.lineWidth = 6;
            ctx.strokeText(damageText, textPosition.x, textPosition.y);
            // main
            const fillColor = effect.otherInfo.isCrit ? 'rgba(255, 213, 89, 1)' : 'white';
            ctx.fillStyle = fillColor;
            ctx.fillText(damageText, textPosition.x, textPosition.y);
        }
        ctx.restore();
    }
}

export function createProjectile(startElement, endElement, color, initialSpeed = 1, damage = 200, projectileType = 'default', isCrit = false, isKill = false) {
    if (!startElement || !endElement) {
        return;
    }
    const combatUnitContainer = endElement.querySelector(".CombatUnit_splatsContainer__2xcc0");
    if (!settingsMap.originalDamageDisplay.value) {
        combatUnitContainer.style.visibility = "hidden";
    }
    const padding = 30;
    const randomRange = {
        x: Math.floor((Math.random() - 0.5) * (combatUnitContainer.offsetWidth - 2 * padding)),
        y: Math.floor((Math.random() - 0.1) * (combatUnitContainer.offsetHeight - padding)),
    }

    const projectileLimit = settingsMap.projectileLimit.value || 30;
    const start = getElementCenter(startElement);
    const end = getElementCenter(endElement);
    end.x = Math.floor(end.x + randomRange.x);
    end.y = Math.floor(end.y + randomRange.y);

    const size = Math.min(Math.max(Math.pow(damage+200,0.7)/20, 4), 16)

    projectileType = abilityEffectsMap[projectileType] || projectileType;

    const otherInfo = {
        type: projectileType,
        start: start,
        end: end,
        damage: damage,
        color: color,
        isCrit: isCrit,
        isKill: isKill,
        startElement: startElement,
        endElement: endElement,
    }
    if (projectiles.length <= projectileLimit) {
        if (damage > 0) {
            addDamageHPBar(endElement, damage);
        }
        if (otherInfo.isKill && settingsMap.monsterDeadAnimation.value) {
            applyDeadEffect(otherInfo.endElement);
        }
        const projectile = new Projectile(start.x, start.y, end.x, end.y, color, initialSpeed, size, otherInfo);
        projectiles.push(projectile);
    } else {
        projectiles.shift();
    }
}