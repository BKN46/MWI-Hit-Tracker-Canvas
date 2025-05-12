import { changeColorAlpha } from "./utils.js";
import { onHitEffectsMap } from './hit.js';

/*
特效编写请查阅
https://docs.qq.com/doc/DS0JjVHp3S09td2NV
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
            ctx.fillStyle = changeColorAlpha(p.color, alpha);
            ctx.fill();
        }
    },
    'nature': {
        speedFactor: 1,
        gravity: 0.1,
        trailLength: 60,
        shake: true,
        onHit: {
            "leaf": (size) => Math.min(Math.ceil(size * 30), 32),
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
            ctx.strokeStyle = `${changeColorAlpha(p.color, alpha)}`;
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
            ctx.fillStyle = changeColorAlpha(p.color, alpha);
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
        gravity: 0.15,
        trailLength: 30,
        shake: true,
        onHit: {
            "shockwave": (size) => Math.min(Math.ceil(size), 4),
            "slashParticle": (size) => Math.min(Math.ceil(size * 8), 20),
        },
        draw: (ctx, p) => {
            const length = p.size * 6.65;
            const width = p.size * 0.47;
            const arrowHeadLength = p.size * 1.33;
            const arrowHeadWidth = p.size * 0.80;
            const fletchingLength = p.size * 2.13;
            const fletchingWidth = p.size * 1.33;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(Math.atan2(p.velocity.y, p.velocity.x));
            
            // Draw arrow shaft
            ctx.beginPath();
            ctx.moveTo(-length/2, -width/2);
            ctx.lineTo(length/2 - arrowHeadLength, -width/2);
            ctx.lineTo(length/2 - arrowHeadLength, width/2);
            ctx.lineTo(-length/2, width/2);
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
            
            // Draw arrow head
            ctx.beginPath();
            ctx.moveTo(length/3 - arrowHeadLength, -arrowHeadWidth/2);
            ctx.lineTo(length/2, 0);
            ctx.lineTo(length/3 - arrowHeadLength, arrowHeadWidth/2);
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
            
            // Draw fletchings 
            ctx.beginPath();
            ctx.moveTo(-length/2, -width/2);
            ctx.lineTo(-length/2 - fletchingLength, -fletchingWidth/2);
            ctx.lineTo(-length/2 - fletchingLength * 0.5, 0);
            ctx.lineTo(-length/2 - fletchingLength, fletchingWidth/2);
            ctx.lineTo(-length/2, width/2);
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
            
            ctx.restore();
        },
        trail: (ctx, p, i) => {
            // Only show trail after the arrow has traveled some distance
            const startDelay = 5; // Number of frames to wait before showing trail
            if (i < startDelay) return;
            
            const trailLength = p.size * 20;
            const trailWidth = p.size * 0.27;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(Math.atan2(p.vY, p.vX));
            
            // Draw simple line trail behind the arrow
            ctx.beginPath();
            ctx.moveTo(-trailLength/2, -trailWidth/2);
            ctx.lineTo(0, -trailWidth/2);  // Only draw up to the arrow's position
            ctx.lineTo(0, trailWidth/2);
            ctx.lineTo(-trailLength/2, trailWidth/2);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';  // Fixed low opacity white
            ctx.fill();
            
            ctx.restore();
        },
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
        speedFactor: 2,
        trailLength: 3,
        shake: true,
        onHit: {
            "pixelSmoke": (size) => Math.min(Math.ceil(size * 80), 50),
        },
        draw: (ctx, p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        },
    },
    'lavaPlume': {
        speedFactor: 0.8,
        trailLength: 40,
        gravity: 0.1,
        shake: true,
        onHit: {
            "lava": (size) => Math.min(Math.ceil(size * 20), 20),            
            "smallParticle": (size) => Math.min(Math.ceil(size * 10), 60),
        },
        draw: (ctx, p) => {
            // Draw main projectile
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();

            // Create inner glow gradient
            const innerGlow = ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, p.size * 1.5
            );
            innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            innerGlow.addColorStop(0.5, p.color);
            innerGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = innerGlow;
            ctx.fill();
        },
        glow: (ctx, p) => {
            // Create outer glow gradient
            const outerGlow = ctx.createRadialGradient(
                p.x, p.y, p.size * 1.5,
                p.x, p.y, p.size * 4
            );
            outerGlow.addColorStop(0, p.color);
            // outerGlow.addColorStop(0.5, 'rgba(250, 178, 24, 0.2)');
            outerGlow.addColorStop(1, 'rgba(255, 50, 0, 0)');
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
            ctx.fillStyle = outerGlow;
            ctx.fill();

            // Add pulsing effect
            const pulseSize = p.size * (3 + Math.sin(Date.now() * 0.01) * 0.5);
            const pulseGlow = ctx.createRadialGradient(
                p.x, p.y, p.size * 2,
                p.x, p.y, pulseSize
            );
            pulseGlow.addColorStop(0, changeColorAlpha(p.color, 0.1));
            pulseGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2);
            ctx.fillStyle = pulseGlow;
            ctx.fill();
        },
        trail: (ctx, p, i) => {
            const alpha = i / p.totalLength;
            const trailSize = p.size * alpha;

            // Create glowing trail gradient
            // const trailGlow = ctx.createRadialGradient(
            //     p.x, p.y, 0,
            //     p.x, p.y, trailSize * 2
            // );
            // trailGlow.addColorStop(0, changeColorAlpha(p.color, alpha));
            // trailGlow.addColorStop(1, changeColorAlpha(p.color, 0));
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, trailSize * 2, 0, Math.PI * 2);
            ctx.fillStyle = changeColorAlpha(p.color, alpha);
            ctx.fill();
        }
    },
    'iceBlast': {
        speedFactor: 1.3,
        trailLength: 35,
        shake: true,
        onHit: {
            "ice": (size) => Math.min(Math.ceil(size * 30), 40),
        },
        draw: (ctx, p) => {
            const length = p.size * 6.65;
            const arrowHeadLength = p.size * 3;
            const arrowHeadWidth = p.size * 2;

            // Draw main projectile
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(Math.atan2(p.velocity.y, p.velocity.x));

            // Draw arrow head
            ctx.beginPath();
            ctx.moveTo(length/3 - arrowHeadLength, -arrowHeadWidth/2);
            ctx.lineTo(length/2, 0);
            ctx.lineTo(length/3 - arrowHeadLength, arrowHeadWidth/2);
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
            
            ctx.restore();
        },
        glow: (ctx, p) => {
            // Create outer glow gradient
            const outerGlow = ctx.createRadialGradient(
                p.x, p.y, p.size * 1.5,
                p.x, p.y, p.size * 4
            );
            outerGlow.addColorStop(0, 'rgba(200, 230, 255, 0.3)');
            outerGlow.addColorStop(0.5, 'rgba(150, 200, 255, 0.2)');
            outerGlow.addColorStop(1, 'rgba(100, 150, 255, 0)');
            
            const length = p.size * 6.65;
            const arrowHeadLength = p.size * 3;
            const arrowHeadWidth = p.size * 2;

            ctx.beginPath();
            ctx.moveTo(length/3 - arrowHeadLength, -arrowHeadWidth/2);
            ctx.lineTo(length/2, 0);
            ctx.lineTo(length/3 - arrowHeadLength, arrowHeadWidth/2);
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();

        },
        trail: (ctx, p, i) => {
            const alpha = i / p.totalLength;
            const trailSize = p.size * (1 + Math.sin(Date.now() * 0.01) * 0.2);
            
            // Create glowing trail gradient
            const trailGlow = ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, trailSize * 2
            );
            trailGlow.addColorStop(0, changeColorAlpha(p.color, alpha));
            trailGlow.addColorStop(1, `rgba(150, 200, 255, 0)`);
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, trailSize, 0, Math.PI * 2);
            ctx.fillStyle = trailGlow;
            ctx.fill();
        }
    },
    'poisonDust': {
        speedFactor: 1,
        trailLength: 35,
        shake: true,
        onHit: {
            "poison": (size) => Math.min(Math.ceil(size * 8), 12),
        },
        draw: (ctx, p) => {
            // Draw main projectile
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();

            // Create inner glow gradient
            const innerGlow = ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, p.size * 1.5
            );
            innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            innerGlow.addColorStop(0.5, changeColorAlpha(p.color, 0.5));
            innerGlow.addColorStop(1, 'rgba(50, 200, 50, 0)');
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = innerGlow;
            ctx.fill();
        },
        glow: (ctx, p) => {
            // Create outer glow gradient
            const outerGlow = ctx.createRadialGradient(
                p.x, p.y, p.size * 1.5,
                p.x, p.y, p.size * 4
            );
            outerGlow.addColorStop(0, changeColorAlpha(p.color, 0.5));
            // outerGlow.addColorStop(0.5, 'rgba(50, 200, 50, 0.2)');
            outerGlow.addColorStop(1, 'rgba(0, 150, 0, 0)');
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
            ctx.fillStyle = outerGlow;
            ctx.fill();
        },
        trail: (ctx, p, i) => {
            const alpha = i / p.totalLength;
            p.x = p.x + (Math.random() - 0.5) * 5;
            p.y = p.y - (Math.random() - 0.5) * 1 + 0.02;
            ctx.beginPath();
            const lineWidth = p.size * Math.sqrt(alpha);
            ctx.strokeStyle = `${changeColorAlpha(p.color, alpha)}`;
            ctx.lineWidth = lineWidth;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + (Math.random() - 0.5) * 20, p.y + (Math.random() - 0.5) * 20);
            ctx.stroke();
            ctx.fill();
        }
    },
    'thrust': {
        speedFactor: 3,
        gravity: -0.001,
        trailLength: 0,
        shake: true,
        onHit: {
            "smallParticle": (size) => Math.min(Math.ceil(size * 4), 10),
            "pierce": (size) => Math.min(Math.ceil(size * 4), 6),
            "shockwave": (size) => Math.min(Math.ceil(size * 2), 6),
        },
        draw: (ctx, p) => {
            const shaftLength = p.size * 12; // Longer shaft
            const shaftWidth = p.size * 0.8; // Thicker shaft
            const tipLength = p.size * 3; // Length of the pointed tip
            const tipWidth = p.size * 1.2; // Width at the base of the tip
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(Math.atan2(p.velocity.y, p.velocity.x));
            
            // Draw shaft
            ctx.beginPath();
            ctx.moveTo(-shaftLength/2, -shaftWidth/2);
            ctx.lineTo(shaftLength/2 - tipLength, -shaftWidth/2);
            ctx.lineTo(shaftLength/2 - tipLength, shaftWidth/2);
            ctx.lineTo(-shaftLength/2, shaftWidth/2);
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
            
            // Draw tip
            ctx.beginPath();
            ctx.moveTo(shaftLength/2 - tipLength, -tipWidth/2);
            ctx.lineTo(shaftLength/2, 0);
            ctx.lineTo(shaftLength/2 - tipLength, tipWidth/2);
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
            
            // Add highlight to shaft
            ctx.beginPath();
            ctx.moveTo(-shaftLength/2, -shaftWidth/2);
            ctx.lineTo(shaftLength/2 - tipLength, -shaftWidth/2);
            ctx.lineTo(shaftLength/2 - tipLength, 0);
            ctx.lineTo(-shaftLength/2, 0);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fill();
            
            // Add highlight to tip
            ctx.beginPath();
            ctx.moveTo(shaftLength/2 - tipLength, -tipWidth/2);
            ctx.lineTo(shaftLength/2, 0);
            ctx.lineTo(shaftLength/2 - tipLength, 0);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
            
            ctx.restore();
        }
    },
    'fireTornado': {
        speedFactor: 2,
        trailLength: 3,
        shake: true,
        onHit: {
            "tornado": (size) => Math.min(Math.ceil(size * 5), 8),
        },
        draw: (ctx, p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        },
    },
}