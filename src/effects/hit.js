export const onHitEffectsMap = {
    "smoke": {
        angle: (p) => Math.random() * Math.PI * 2,
        alpha: (p) => 0.7,
        speed: (p) => (Math.random() * 1 + 0.2) * Math.sqrt(p.size),
        size: (p) => (Math.random() * 15 + 8) * p.size,
        life: (p) => 2000 * Math.sqrt(p.size),
        gravity: (p) => -1 * Math.sqrt(p.size),
        draw: (ctx, p) => {
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed + p.gravity;
            p.life -= 2;
            p.alpha = Math.max(0, p.alpha - 0.003);
            
            if (p.life > 0) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                ctx.fillStyle = `rgba(80, 80, 80, ${p.alpha * (p.life/1200)})`;
                ctx.fill();
            }
        }
    },
    "ember": {
        angle: (p) => Math.random() * Math.PI * 2,
        alpha: (p) => 1,
        speed: (p) => (Math.random() * 2 + 0.5) * Math.sqrt(p.size),
        size: (p) => (Math.random() * 6 + 2) * p.size,
        life: (p) => 1200 * Math.sqrt(p.size),
        gravity: (p) => 0.3,
        draw: (ctx, p) => {
            p.speed *= 0.99; // 慢慢减速
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed + p.gravity;
            p.life -= 3;
            
            if (p.life > 0) {
                const alpha = p.life / 800;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * (p.life/800), 0, Math.PI*2);
                ctx.fillStyle = `${p.color.slice(0, -4)}%, ${alpha})`;
                ctx.fill();
                
                // 余烬偶尔产生的小火花
                if (Math.random() < 0.03) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI*2);
                    ctx.fillStyle = `hsla(30, 100%, 70%, ${alpha * 0.7})`;
                    ctx.fill();
                }
            }
        }
    },
    "shockwave": {
        size: (p) => 7 * p.size,
        life: (p) => 800 * Math.sqrt(p.size),
        draw: (ctx, p) => {
            if (!p.maxSize) {
                p.maxSize = p.size * (100 + Math.random() * 100) / 7;
            }
            p.size += (p.maxSize - p.size) * 0.1;
            p.life -= 10;

            if (p.life > 0) {
                const alpha = p.life / 400;
                ctx.beginPath();
                ctx.strokeStyle = p.color;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.lineWidth = 5 * alpha;
                ctx.stroke();
            }
        }
    },
    "smallParticle": {
        angle: (p) => Math.random() * Math.PI * 2,
        size: (p) => (Math.random() * 12 + 8) * p.size,
        speed: (p) => (Math.random() * 6 + 2) * Math.sqrt(p.size),
        gravity: (p) => 0.3 + Math.random() * 0.1,
        life: (p) => 400 * p.size,
        draw: (ctx, p) => {
            p.size = p.size * (1 - p.life / 400);
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed + p.gravity;
            p.life -= 3;

            if (p.life > 0) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
        }
    },
    "holyCross": {
        x: (p) => p.x + (Math.random() - 0.5) * 60,
        y: (p) => p.y + (Math.random() - 0.5) * 10,
        size: (p) => (8 * Math.random() + 12) * p.size,
        life: (p) => 1200 * Math.sqrt(p.size),
        speed: (p) => 0,
        gravity: (p) => -0.008 * Math.random() - 0.008,
        draw: (ctx, p) => {
            p.speed += p.gravity;
            p.y += p.speed;
            p.life -= 3;

            if (p.life > 0) {
                ctx.save();
                ctx.translate(p.x, p.y);

                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size * 2, p.size, p.size * 4);
                ctx.fillRect(-p.size * 2, -p.size / 2, p.size * 4, p.size);

                ctx.restore();
            }
        }
    }
}