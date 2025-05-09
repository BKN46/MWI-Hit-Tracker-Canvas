/*
projectEffect = {
    speedFactor: 1,         // 速度因子
    trailLength: 50,        // 尾迹长度
    gravity: 0.2,           // 重力
    shake: true,            // 是否震动
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
        onHit: {
            "smoke": (size) => Math.min(Math.ceil(size * 4), 8),
            "ember": (size) => Math.min(Math.ceil(size * 10), 8),
            "shockwave": (size) => Math.min(Math.ceil(size), 4),
            "smallParticle": (size) => Math.min(Math.ceil(size * 4), 3),
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
}