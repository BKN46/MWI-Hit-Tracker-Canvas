import { projectileEffectsMap } from "./effects/projectile.js";
import { abilityEffectsMap } from "./effects/abilities.js";
import { onHitEffectsMap } from "./effects/hit.js";
import { settingsMap } from "./setting.js";
import { getElementCenter } from "./effects/utils.js";
import { applyShakeEffect, addDamageHPBar, deathEffect } from "./effects/domEffect.js";
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
    const frameTime = now - fpsStatTime;
    fpsStatTime = now;
    const fpsNow = Math.round(1000 / frameTime);
    fpsQueue.push(fpsNow);
    if (fpsQueue.length > 120) {
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
}


export function startAnimation() {
    const fpsLimit = settingsMap.renderFpsLimit.value || 60;
    const fpsInterval = 1000 / fpsLimit;
    setInterval(() => {
        animate();
    }, fpsInterval);
}


function getFpsFactor() {
    return Math.min(Math.max(160 / fps, 0.125), 8);
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
        this.life = 0;

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
        this.timeInAir = 80 / this.initialSpeed;

        // FPS因子，确保在不同FPS下效果一致
        this.fpsFactor = getFpsFactor(); 
        this.gravity *= Math.pow(this.fpsFactor, 2);
        this.timeInAir /= this.fpsFactor;

        // 计算初始速度，修正公式确保能够到达目标
        this.velocity = {
            x: dx / this.timeInAir,
            y: (dy / this.timeInAir) - (this.gravity * this.timeInAir / 2)
        };
        this.initialVelocity = {...this.velocity}

        this.trajectory = (time) => {
            return {
                x: startX + this.initialVelocity.x * time,
                y: startY + this.initialVelocity.y * time + (this.gravity * time * time) / 2
            };
        };
        
        // 大小参数 (范围1-100)
        const projectileScale = settingsMap.projectileScale.value || 1;
        this.sizeScale = Math.max(1, Math.min(100, size)) / 10 * projectileScale; // 转换为比例因子
        
        // 外观属性
        this.size = 10 * this.sizeScale;
        this.color = this.effect.color || color;
        
        // 拖尾效果
        this.trail = [];
        this.independentTrail = this.effect.independentTrail || false; // 是否独立拖尾
        this.maxTrailLength = Math.floor((this.effect.trailLength || 35) * Math.sqrt(this.sizeScale)); // 拖尾长度随大小增加
        this.maxTrailLength *= settingsMap.projectileTrailLength.value || 1; // 拖尾缩放因子
        this.trailGap = (settingsMap.projectileTrailGap.value || 1) / this.fpsFactor;
    }

    update() {
        this.life += 1;
        const pos = this.trajectory(this.life);
        this.velocity.y += this.gravity;
        this.x = pos.x;
        this.y = pos.y;

        // 更新拖尾
        if (this.independentTrail) {
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
        } else {
            this.trail = [];
            for (let i = 0; i < this.maxTrailLength; i++) {
                const trailTime = this.life - (this.maxTrailLength - i - 1) * this.trailGap;
                if (trailTime <= 0) continue;
                const trailPos = this.trajectory(trailTime);
                this.trail.push({
                    x: trailPos.x,
                    y: trailPos.y,
                    vX: this.velocity.x,
                    vY: this.velocity.y,
                    color: this.color,
                    size: this.size,
                    totalLength: Math.min(this.maxTrailLength, this.life),
                });
            }
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
        if (this.life >= this.timeInAir) {
            this.x = this.target.x;
            this.y = this.target.y;
            return true;
        }
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

export function clearProjectiles() {
    projectiles.splice(0, projectiles.length);
}

// 爆炸效果函数
function createOnHitEffect(projectile) {
    const x = projectile.x;
    const y = projectile.y;
    const color = projectile.color;
    const otherInfo = projectile.otherInfo;
    const projectileScale = settingsMap.projectileScale.value || 1;

    // Resize for onHit effect
    projectile.size = Math.max(1, Math.min(100, projectile.size)) / 20 / projectileScale;

    const sizeFactor = settingsMap.onHitScale.value || 1;
    const particleFactor = settingsMap.particleEffectRatio.value || 1;
    const particleSpeedFactor = settingsMap.particleSpeedRatio.value || 1;
    const particleLifespanFactor = settingsMap.particleLifespanRatio.value || 1;
    const fpsFactor = getFpsFactor();

    // 存储命中动画的活跃状态，用于跟踪
    const damageTextLifespan = settingsMap.damageTextLifespan.value || 120;
    const lifeSpan = Math.ceil(damageTextLifespan / Math.pow(fpsFactor, 0.33));

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
            let effectLife = Math.ceil((effect.life ? effect.life(projectile) : 1000) * particleLifespanFactor / Math.pow(fpsFactor, 0.33));
            // effectLife = Math.min(effectLife, lifeSpan);
            const effectSpeed = Math.ceil((effect.speed ? effect.speed(projectile) : Math.random() * 5 + 2) / Math.pow(fpsFactor, 0.33) * particleSpeedFactor);

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
                fpsFactor: fpsFactor,
                draw: effect.draw ? effect.draw : (ctx, p) => {},
            });
        }
    }

    const onHitEffectData = {
        effects: [...effects],
        active: true,
        lifespan: lifeSpan,
        color: color,
        otherInfo: otherInfo,
        isFpsOptimized: true,
    };
 
    addEffect(onHitEffectData);
}

// 更新和渲染所有命中效果
function updateOnHits() {
    // 遍历所有活跃的命中
    for (let i = activeEffects.length - 1; i >= 0; i--) {
        const effect = activeEffects[i];
        effect.life++;

        if (effect.life >= effect.lifespan) {
            activeEffects.splice(i, 1);
            continue;
        }

        if (!effect.isFpsOptimized) {
            const fpsFactor = getFpsFactor();
            for (const e of effect.effects) {
                e.speed *= fpsFactor;
                e.life /= fpsFactor;
                e.fpsFactor = fpsFactor;
            }
            effect.lifespan /= fpsFactor;
            effect.isFpsOptimized = true;
        }

        ctx.save();

        // 更新各自效果
        effect.effects.forEach((e, index) => {
            e.draw(ctx, e);
        });

        // 伤害文本
        if (effect.otherInfo && effect.otherInfo.damage) {
            const fontSizeScale = settingsMap.damageTextScale.value || 1;
            const fontSizeMinimal = settingsMap.damageTextSizeMinimal.value || 14;
            const fontSizeLimit = settingsMap.damageTextSizeLimit.value || 70;
            const fontAlpha = settingsMap.damageTextAlpha.value || 0.8;

            const fontSize=  Math.min(Math.max(fontSizeMinimal, Math.pow(effect.otherInfo.damage,0.65)/2*fontSizeScale), fontSizeLimit);
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
    const randomRangeRatio = settingsMap.hitAreaScale.value || 1;
    const randomRange = {
        x: () => Math.floor((Math.random() - 0.5) * (combatUnitContainer.offsetWidth - 2 * padding)) * randomRangeRatio,
        y: () => Math.floor((Math.random() - 0.1) * (combatUnitContainer.offsetHeight - padding)) * randomRangeRatio,
    }

    const projectileLimit = settingsMap.projectileLimit.value || 30;
    const start = getElementCenter(startElement);
    const end = getElementCenter(endElement);
    let endX = Math.floor(end.x + randomRange.x());
    let endY = Math.floor(end.y + randomRange.y());

    const minimalGap = (settingsMap.hitPositionMinGap.value || 0) * randomRangeRatio;
    if (minimalGap > 0) {
        let attempts = 100;
        while (
            attempts > 0 && projectiles.some((p) => {
                const distance = Math.hypot(p.otherInfo.end.x - end.x, p.otherInfo.end.y - end.y);
                return distance < minimalGap;
            })
        ) {
            endX = Math.floor(end.x + randomRange.x());
            endY = Math.floor(end.y + randomRange.y());
            attempts-=1;
        }
        if (attempts <= 0) {
            console.warn("[MWI-Hit-Tracker-Canvas]Hit position is too crowded, hit gap may not work as expected.");
        }
    }

    const size = Math.min(Math.max(Math.pow(damage+200,0.7)/20, 4), 16)

    projectileType = abilityEffectsMap[projectileType] || projectileType;

    const otherInfo = {
        type: projectileType,
        start: start,
        end: {x: endX, y: endY},
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
            deathEffect[settingsMap.monsterDeadAnimationStyle.value](otherInfo.endElement);
        }
        const projectile = new Projectile(start.x, start.y, endX, endY, color, initialSpeed, size, otherInfo);
        projectiles.push(projectile);
    } else {
        projectiles.shift();
    }
}

// 其他低频DOM操作
setInterval(() => {
    if (settingsMap.showFps.value) {
        const fpsElement = document.querySelector('#hitTracker_fpsCounter');
        if (fpsElement) {
            fpsElement.innerText = `FPS: ${fps}`;
        } else {
            const parenetElement = document.querySelector(".BattlePanel_battleArea__U9hij");
            if (parenetElement) {
                const newFpsElement = document.createElement('div');
                const center = getElementCenter(parenetElement);
                newFpsElement.id = 'hitTracker_fpsCounter';
                newFpsElement.style.position = 'fixed';
                newFpsElement.style.top = `${center.x - parenetElement.innerWidth}px`;
                newFpsElement.style.left = `${center.y - parenetElement.innerHeight}px`;
                newFpsElement.style.color = 'rgba(200, 200, 200, 0.8)';
                newFpsElement.style.zIndex = '9999';
                newFpsElement.innerText = `FPS: ${fps}`;
                parenetElement.appendChild(newFpsElement);
            }
        }
    }

    if (settingsMap.verticalCombatDisplay.value) {
        const battleGrids = document.querySelectorAll(".BattlePanel_combatUnitGrid__2hTAM");
        if (battleGrids) {
            for (let i = 0; i < battleGrids.length; i++) {
                const grid = battleGrids[i];
                grid.style['grid-template-columns'] = `repeat(1,120px)`;
            }
        }
    }
}, 500);