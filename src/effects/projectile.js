import { onHitEffectsMap } from './hit.js';

/*
projectEffect = {
    speedFactor: 1,         // 速度因子
    trailLength: 50,        // 尾迹长度
    gravity: 0.2,           // 重力
    shake: true,            // 是否震动
    color: rgba(0, 0, 0, 0),    // 强制颜色
    onHit: {                // 碰撞时的粒子效果
        "smoke": 0, 
    },
    draw: (ctx, p) => {     // 绘制函数, ctx为canvas的上下文对象, p为Projectile对象

    },
    glow: (ctx, p) => {     // 光晕绘制函数, ctx为canvas的上下文对象, p为Projectile对象，空则不绘制

    },
}
*/

export const projectileEffectsMap = {
    'fireball': {
        speedFactor: 1,
        trailLength: 35,
        shake: true,
        onHit: {
            "smoke": (size) => Math.min(Math.ceil(size * 4), 8),
            "ember": (size) => Math.min(Math.ceil(size * 10), 40),
            "shockwave": (size) => Math.min(Math.ceil(size), 4),
            "smallParticle": (size) => Math.min(Math.ceil(size * 4), 10),
        },
        onCrit: {
            "star": (size) => Math.min(Math.ceil(size * 10), 20),
        },
        draw: (ctx, p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        },
        glow: (ctx, p) => {
            const gradient = ctx.createRadialGradient(
                p.x, p.y, 0, 
                p.x, p.y, p.size*2
            );
            gradient.addColorStop(0, `${p.color}`);
            gradient.addColorStop(1, `${p.color}`);
            ctx.fillStyle = gradient;
        },
        trail: (ctx, p, i) => {
            const alpha = i / p.totalLength;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fillStyle = p.color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`);
            ctx.fill();
        }
    },
    'nature': {
        speedFactor: 1,
        gravity: 0.1,
        trailLength: 60,
        shake: true,
        onHit: {
            "leaf": (size) => Math.min(Math.ceil(size * 14), 30),
        },
        draw: (ctx, p) => {
            const size = p.size * 3;
            p.rotation = Math.atan2(p.velocity.y, p.velocity.x) - Math.PI / 2;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.scale(p.scale, 1);
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.bezierCurveTo(
                size/2, -size/2,
                size/2, 0,
                0, size
            );
            ctx.bezierCurveTo(
                -size/2, 0,
                -size/2, -size/2,
                0, -size
            );
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.restore();
        },
        trail: (ctx, p, i) => {
            const alpha = i / p.totalLength;
            p.x = p.x + (Math.random() - 0.5) * 5;
            p.y = p.y - (Math.random() - 0.5) * 1 + 0.02;
            ctx.beginPath();
            const lineWidth = p.size * Math.sqrt(alpha);
            ctx.strokeStyle = `${p.color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`)}`;
            ctx.lineWidth = lineWidth;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + (Math.random() - 0.5) * 20, p.y + (Math.random() - 0.5) * 20);
            ctx.stroke();
            ctx.fill();
        }
    },
    'slash': {
        speedFactor: 2,
        gravity: -0.2,
        trailLength: 30,
        shake: true,
        onHit: {
            "slash": (size) => Math.min(Math.ceil(size * 4), 8),
            "slashParticle": (size) => Math.min(Math.ceil(size * 8), 20),
        },
        // draw: (ctx, p) => {
        //     ctx.beginPath();
        //     ctx.moveTo(p.x, p.y + p.size * 2);
        //     ctx.lineTo(p.x - p.size * 2, p.y - p.size * 2);
        //     ctx.lineTo(p.x + p.size * 2, p.y - p.size * 2);
        //     ctx.closePath();
        //     ctx.fillStyle = p.color;
        //     ctx.fill();
        // }
    },
    'water': {
        speedFactor: 1.2,
        trailLength: 60,
        shake: true,
        onHit: {
            "waterRipple": (size) => Math.min(Math.ceil(size * 8), 12),
            "waterSplash": (size) => Math.min(Math.ceil(size * 8), 20),
        },
        draw: (ctx, p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        },
        trail: (ctx, p, i) => {
            const alpha = i / p.totalLength;
            p.x = p.x + (Math.random() - 0.5) * 5;
            p.y = p.y - (Math.random() - 0.5) * 1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fillStyle = p.color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`);
            ctx.fill();
        }
    },
    'heal': {
        trailLength: 60,
        shake: false,
        color: 'rgba(93, 212, 93, 0.8)',
        onHit: {
            "holyCross": (size) => Math.min(Math.ceil(size * 12), 10),
        },
        draw: (ctx, p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
    },
    'range': {
        speedFactor: 1.5,
        gravity: 0.2,
        trailLength: 30,
        shake: true,
        onHit: {
            "shockwave": (size) => Math.min(Math.ceil(size), 4),
            "slashParticle": (size) => Math.min(Math.ceil(size * 8), 20),
        },
        draw: (ctx, p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        },
        glow: (ctx, p) => {
            const gradient = ctx.createRadialGradient(
                p.x, p.y, 0, 
                p.x, p.y, p.size*2
            );
            gradient.addColorStop(0, `${p.color}`);
            gradient.addColorStop(1, `${p.color}`);
            ctx.fillStyle = gradient;
        }
    },
    'selfHeal': {
        speedFactor: 10,
        trailLength: 0,
        gravity: 0,
        shake: false,
        color: 'rgba(93, 212, 93, 0.5)',
        onHit: {
            "holyCross": (size) => Math.min(Math.ceil(size * 12), 10),
        },
        draw: (ctx, p) => {},
    },
    'selfManaRegen': {
        speedFactor: 10,
        trailLength: 0,
        gravity: 0,
        shake: false,
        color: 'rgba(68, 120, 241, 0.8)',
        onHit: {
            "holyCross": (size) => Math.min(Math.ceil(size * 12), 10),
        },
        draw: (ctx, p) => {},
    },
    'debug': {
        speedFactor: 1,
        trailLength: 35,
        shake: true,
        onHit: {
            "star": (size) => Math.min(Math.ceil(size * 10), 20),
        },
        draw: (ctx, p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        },
    }
}