import { changeColorAlpha } from "./utils.js";
import { shapes } from "./shape.js";

/*
特效编写请查阅
https://docs.qq.com/doc/DS0JjVHp3S09td2NV
*/

export const onHitEffectsMap = {
    "smoke": {
        angle: (p) => Math.random() * Math.PI * 2,
        alpha: (p) => 0.7,
        speed: (p) => (Math.random() * 0.05 + 0.02) * Math.sqrt(p.size),
        size: (p) => (Math.random() * 20 + 10) * p.size,
        life: (p) => 4000 * Math.sqrt(p.size),
        gravity: (p) => -0.04 * Math.sqrt(p.size),
        draw: (ctx, p) => {
            if (!p.initialized) {
                p.initialized = true;
                p.y -= 3 * p.size;
                p.sizeVariation = Math.random() * 0.2 + 0.9;
                p.rotationSpeed = (Math.random() - 0.5) * 0.005;
                p.rotation = Math.random() * Math.PI * 2;
                p.verticalSpeed = 0;
            }

            p.speed *= 0.999;
            p.verticalSpeed += p.gravity;
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed + p.verticalSpeed;
            p.life -= 1;
            p.alpha = Math.max(0, p.alpha - 0.0003 / p.fpsFactor);
            p.rotation += p.rotationSpeed;
            
            if (p.life > 0) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                
                // Draw main smoke puff
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size * p.sizeVariation, p.size, 0, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(80, 80, 80, ${p.alpha * (p.life/2000)})`;
                ctx.fill();

                // Add some variation to the smoke puff
                ctx.beginPath();
                ctx.ellipse(p.size * 0.3, -p.size * 0.2, p.size * 0.6, p.size * 0.8, 0, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(80, 80, 80, ${p.alpha * 0.7 * (p.life/2000)})`;
                ctx.fill();

                ctx.restore();
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
            p.life -= 3 / p.fpsFactor;
            
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
        size: p => 10 * p.size,
        life: p => 800 * Math.sqrt(p.size),
        draw: (ctx, p) => {
            if (!p.maxSize) {
                p.maxSize = p.size * (150 + Math.random() * 100) / 10;
            }
            p.size += (p.maxSize - p.size) * 0.1;
            p.life -= 10 / p.fpsFactor;

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
            p.life -= 3 / p.fpsFactor;

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
            p.speed += p.gravity * p.fpsFactor;
            p.y += p.speed * p.fpsFactor;
            p.life -= 3 / p.fpsFactor;

            if (p.life > 0) {
                ctx.save();
                ctx.translate(p.x, p.y);

                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size * 2, p.size, p.size * 4);
                ctx.fillRect(-p.size * 2, -p.size / 2, p.size * 4, p.size);

                ctx.restore();
            }
        }
    },
    "leaf": {
        // Made by HwiteCat
        x: (p) => p.x + (Math.random() - 0.5) * 60,
        y: (p) => p.y + (Math.random() - 0.5) * 10,
        angle: (p) => Math.random() * Math.PI * 2,
        size: (p) => (12 * Math.random() + 8) * p.size,
        life: (p) => 1250 * p.size,
        speed: (p) => (Math.random() * 3 + 1) * Math.sqrt(p.size),
        gravity: (p) => 0.12,
        draw: (ctx, p) => {
            if (!p.rotation) p.rotation = Math.random() * Math.PI * 2;
            if (!p.rotationSpeed) p.rotationSpeed = (Math.random() - 0.5) * 0.02;
            if (!p.sway) p.sway = (Math.random() - 0.5) * 0.2;
            if (!p.swaySpeed) p.swaySpeed = (Math.random() - 0.5) * 0.02;

            p.speed *= 0.98;
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed + p.gravity;
            p.life -= 3 / p.fpsFactor;

            if (p.rotation !== undefined) {
                p.rotation += p.rotationSpeed;
            }
            if (p.scale !== undefined) {
                p.scale += p.scaleSpeed;
                p.scale = Math.max(0.1, p.scale);
            }

            if (p.sway !== undefined) {
                p.x += Math.sin(p.y * p.swaySpeed) * p.sway;
            }

            if (p.life > 0) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.scale(p.scale, 1);
                ctx.beginPath();
                ctx.moveTo(0, -p.size);
                ctx.bezierCurveTo(
                    p.size/2, -p.size/2,
                    p.size/2, 0,
                    0, p.size
                );
                ctx.bezierCurveTo(
                    -p.size/2, 0,
                    -p.size/2, -p.size/2,
                    0, -p.size
                );
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.restore();
            }
        }
    },
    "slash": {
            // Main slash effect
            x: p => p.x,
            y: p => p.y,
            angle: p => Math.random() * Math.PI * 2,
            size: p => 3 * p.size,
            life: p => 300 * p.size, 
            draw: (ctx, p) => {
                if (!p.length) p.length = p.size * (120 + Math.random() * 80); // More consistent length
                if (!p.maxWidth) p.maxWidth = 1.5 * Math.sqrt(p.size); // Thinner slash
                p.life -= 2 / p.fpsFactor; // Even slower fade
                
                if (p.life > 0) {
                    const alpha = p.life / 300 * p.size;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.angle);

                    // Draw main slash line with improved tapered shape
                    ctx.beginPath();
                    ctx.moveTo(-p.length/2, 0);
                    ctx.quadraticCurveTo(
                        -p.length/4, -p.maxWidth * 0.6,
                        -p.length/6, -p.maxWidth
                    );
                    ctx.lineTo(p.length/6, -p.maxWidth);
                    ctx.quadraticCurveTo(
                        p.length/4, -p.maxWidth * 0.6,
                        p.length/2, 0
                    );
                    ctx.quadraticCurveTo(
                        p.length/4, p.maxWidth * 0.6,
                        p.length/6, p.maxWidth
                    );
                    ctx.lineTo(-p.length/6, p.maxWidth);
                    ctx.quadraticCurveTo(
                        -p.length/4, p.maxWidth * 0.6,
                        -p.length/2, 0
                    );
                    ctx.closePath();
                    ctx.fillStyle = p.color.replace('0.9', alpha.toString());
                    ctx.fill();

                    // Enhanced glow effect
                    ctx.beginPath();
                    ctx.moveTo(-p.length/2, 0);
                    ctx.quadraticCurveTo(
                        -p.length/4, -p.maxWidth * 0.8,
                        -p.length/6, -p.maxWidth * 1.5
                    );
                    ctx.lineTo(p.length/6, -p.maxWidth * 1.5);
                    ctx.quadraticCurveTo(
                        p.length/4, -p.maxWidth * 0.8,
                        p.length/2, 0
                    );
                    ctx.quadraticCurveTo(
                        p.length/4, p.maxWidth * 0.8,
                        p.length/6, p.maxWidth * 1.5
                    );
                    ctx.lineTo(-p.length/6, p.maxWidth * 1.5);
                    ctx.quadraticCurveTo(
                        -p.length/4, p.maxWidth * 0.8,
                        -p.length/2, 0
                    );
                    ctx.closePath();
                    ctx.fillStyle = p.color.replace('0.9', (alpha * 0.3).toString());
                    ctx.fill();

                    ctx.restore();
                }
            }
    },
    "slashParticle": {
        // Enhanced particle effect for slash
        x: p => p.x + (Math.random() - 0.5) * 15, // Tighter initial spread
        y: p => p.y + (Math.random() - 0.5) * 15,
        angle: p => {
            const baseAngle = p.parentAngle || Math.random() * Math.PI * 2;
            return baseAngle + (Math.random() - 0.5) * 0.1; // Very small variation
        },
        size: p => (2 * Math.random() + 2) * p.size, // Bigger particles
        life: p => 600 * p.size, // Adjusted for faster movement
        speed: p => (Math.random() * 1 + 3) * Math.sqrt(p.size), // Much faster speed
        gravity: p => 0.02, // Minimal gravity for more directional movement
        draw: (ctx, p) => {
            p.speed *= 0.998; // Very smooth deceleration
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed + p.gravity;
            p.life -= 3 / p.fpsFactor;

            if (p.life > 0) {
                const alpha = p.life / 400;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);

                // Draw particle with more elongation in movement direction
                ctx.beginPath();
                ctx.moveTo(-p.size/2, 0);
                ctx.quadraticCurveTo(
                    -p.size/4, -p.size/2,
                    0, -p.size * 1.2
                );
                ctx.quadraticCurveTo(
                    p.size/4, -p.size/2,
                    p.size/2, 0
                );
                ctx.quadraticCurveTo(
                    p.size/4, p.size/2,
                    0, p.size * 1.2
                );
                ctx.quadraticCurveTo(
                    -p.size/4, p.size/2,
                    -p.size/2, 0
                );
                ctx.closePath();
                ctx.fillStyle = p.color.replace('0.9', alpha.toString());
                ctx.fill();

                // Add small glow to particles
                ctx.beginPath();
                ctx.arc(0, 0, p.size * 1.2, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace('0.9', (alpha * 0.3).toString());
                ctx.fill();

                ctx.restore();
            }
        }
    },
    "waterRipple": {
        x: p => p.x,
        y: p => p.y,
        size: p => 3 * p.size,
        life: p => 1200 * p.size,
        draw: (ctx, p) => {
            if (!p.ripples) {
                p.ripples = [
                    { radius: 0, opacity: 0.5, width: 3, speed: 0.7 },  // Fast, bright inner ripple
                    { radius: 0, opacity: 0.5, width: 2, speed: 0.5 },  // Medium ripple
                    { radius: 0, opacity: 0.5, width: 1.5, speed: 0.3 } // Slow, faint outer ripple
                ];
            }
            
            p.life -= 1;
            
            // Update each ripple
            p.ripples.forEach((ripple, index) => {
                // Expand the ripple
                ripple.radius += ripple.speed;
                
                // Calculate opacity based on radius
                const maxRadius = 30 * p.size;
                const fadeStart = maxRadius * 0.6;
                if (ripple.radius > fadeStart) {
                    ripple.opacity *= 0.98; // Gradual fade out
                }
                
                // Draw the ripple if it's still visible
                if (ripple.opacity > 0.05 && ripple.radius < maxRadius) {
                    ctx.beginPath();
                    ctx.strokeStyle = p.color.replace('0.8', ripple.opacity.toString());
                    ctx.lineWidth = ripple.width * (1 - ripple.radius / maxRadius);
                    ctx.arc(p.x, p.y, ripple.radius, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    // Add a second, fainter ring for more water-like effect
                    if (ripple.radius > 5) {
                        ctx.beginPath();
                        ctx.strokeStyle = p.color.replace('0.8', (ripple.opacity * 0.5).toString());
                        ctx.lineWidth = ripple.width * 0.5 * (1 - ripple.radius / maxRadius);
                        ctx.arc(p.x, p.y, ripple.radius - 2, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
            });
        }
    },
    "waterSplash": {
        x: p => p.x,
        y: p => p.y,
        size: p => (2 * Math.random() + 5) * p.size, // Smaller size
        life: p => 800 * p.size,
        draw: (ctx, p) => {
            if (!p.initialized) {
                p.initialized = true;
                p.particles = [];
                // Create particles in a circular pattern
                const particleCount = 7; // More particles for better coverage
                for (let i = 0; i < particleCount; i++) {
                    const angle = (i / particleCount) * Math.PI * 2;
                    // Add some random variation to the angle
                    const angleVariation = (Math.random() - 0.5) * 0.5;
                    const finalAngle = angle + angleVariation;
                    
                    // Create size variation with smaller base size
                    const sizeVariation = Math.random() * 1.5 + 0.5; // Random multiplier between 0.5 and 2
                    const baseSize = (Math.random() * 0.8 + 0.4) * p.size; // Reduced base size
                    
                    p.particles.push({
                        x: p.x,
                        y: p.y,
                        angle: finalAngle,
                        speed: (Math.random() * 1.5 + 1) * Math.sqrt(p.size),
                        size: baseSize * sizeVariation,
                        initialSize: baseSize * sizeVariation,
                        life: 800 * p.size,
                        gravity: 0.9 + (Math.random() * 0.2 - 0.1) // Slight gravity variation
                    });
                }
            }

            p.life -= 2 / p.fpsFactor;
            
            // Update and draw particles
            p.particles.forEach(particle => {
                particle.speed *= 0.98; // Deceleration
                particle.x += Math.cos(particle.angle) * particle.speed;
                particle.y += Math.sin(particle.angle) * particle.speed + particle.gravity;
                particle.life -= 2;
                const lifeRatio = particle.life / (800 * p.size);
                const opacity = lifeRatio * 0.6; // More transparent
                // More dramatic shrinking with cubic easing
                particle.size = particle.initialSize * Math.pow(lifeRatio, 3);

                if (particle.life > 0) {
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fillStyle = p.color.replace('0.8', opacity.toString());
                    ctx.fill();
                }
            });
        }
    },
    "magnet": {
        x: p => p.x,
        y: p => p.y,
        size: p => (2 * Math.random() + 20) * p.size,
        life: p => 800 * p.size,
        draw: (ctx, p) => {
            if (!p.initialized) {
                p.initialized = true;
                p.particles = [];
                // Create particles in a circular pattern
                const particleCount = 5; // Fewer particles for magnets
                for (let i = 0; i < particleCount; i++) {
                    const angle = (i / particleCount) * Math.PI * 2;
                    // Add some random variation to the angle
                    const angleVariation = (Math.random() - 0.5) * 0.5;
                    const finalAngle = angle + angleVariation;
                    
                    // Create size variation
                    const sizeVariation = Math.random() * 1.5 + 0.5;
                    const baseSize = (Math.random() * 0.8 + 0.4) * p.size;
                    
                    p.particles.push({
                        x: p.x,
                        y: p.y,
                        angle: finalAngle,
                        speed: (Math.random() * 1.5 + 1) * Math.sqrt(p.size),
                        size: baseSize * sizeVariation,
                        initialSize: baseSize * sizeVariation,
                        life: 800 * p.size,
                        gravity: 0.3 + (Math.random() * 0.2 - 0.1), // Less gravity for magnets
                        rotation: Math.random() * Math.PI * 2,
                        rotationSpeed: (Math.random() - 0.5) * 0.02
                    });
                }
            }

            p.life -= 2 / p.fpsFactor;
            
            // Update and draw particles
            p.particles.forEach(particle => {
                particle.speed *= 0.96;
                particle.x += Math.cos(particle.angle) * particle.speed;
                particle.y += Math.sin(particle.angle) * particle.speed + particle.gravity;
                particle.life -= 1;
                particle.rotation += particle.rotationSpeed;
                
                const lifeRatio = particle.life / (800 * p.size);
                const opacity = lifeRatio * 0.8;
                particle.size = particle.initialSize * Math.pow(lifeRatio, 2);

                if (particle.life > 0) {
                    ctx.save();
                    ctx.translate(particle.x, particle.y);
                    ctx.rotate(particle.rotation);
                    
                    // Use the magnet shape from shape.js
                    shapes.magnet(ctx, {
                        x: 0,
                        y: 0,
                        size: particle.size,
                        color: `rgba(128, 128, 128, ${opacity})`
                    });
                    
                    ctx.restore();
                }
            });
        }
    },
    "star": {
        x: p => p.x + (Math.random() - 0.5) * 60,
        y: p => p.y + (Math.random() - 0.5) * 10,
        angle: p => Math.random() * Math.PI * 2,
        size: p => (Math.random() * 6 + 2) * p.size,
        life: p => 1200 * Math.sqrt(p.size),
        speed: p => (Math.random() * 6 + 2) * Math.sqrt(p.size),
        gravity: p => -0.1,
        draw: (ctx, p) => {
            if (!p.initialized) {
                p.initialized = true;
                p.y -= 5 * p.size;
            }

            p.speed *= 0.97; // 慢慢减速
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed + p.gravity;
            p.life -= 3 / p.fpsFactor;

            if (p.life > 0) {
                const alpha = Math.max(0, Math.min(1, (p.life / 1200)));
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);

                const starSize = p.size * 10;

                ctx.beginPath();
                const startAngle = -Math.PI / 2;
                const startX = Math.cos(startAngle) * starSize;
                const startY = Math.sin(startAngle) * starSize;
                ctx.moveTo(startX, startY);

                for (let i = 0; i < 5; i++) {
                    const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                    const innerAngle = outerAngle + Math.PI / 5;

                    const outerX = Math.cos(outerAngle) * starSize;
                    const outerY = Math.sin(outerAngle) * starSize;
                    ctx.lineTo(outerX, outerY);

                    const innerX = Math.cos(innerAngle) * (starSize / 2);
                    const innerY = Math.sin(innerAngle) * (starSize / 2);
                    ctx.lineTo(innerX, innerY);
                }
                ctx.closePath();
                ctx.fillStyle = p.color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`);
                ctx.fill();

                ctx.restore();
            }
        }
    },
    "pierce": {
        x: p => p.x,
        y: p => p.y,
        size: p => 4 * p.size,
        life: p => 1200 * p.size,
        draw: (ctx, p) => {
            if (!p.initialized) {
                p.initialized = true;
                p.pierceLength = p.size * 16;
                p.pierceWidth = p.size / 10;
                p.time = 0;
                p.ripples = [];
                // Create initial ripples
                for (let i = 0; i < 3; i++) {
                    p.ripples.push({
                        radius: 0,
                        speed: 0.5 + i * 0.2,
                        opacity: 0.6 - i * 0.15,
                        width: 2 - i * 0.5
                    });
                }
            }
            
            p.life -= 2 / p.fpsFactor;
            p.time += 0.1;
            const alpha = p.life / 1200;
            
            if (p.life > 0) {
                ctx.save();
                ctx.translate(p.x, p.y);
                
                // Draw dynamic ripples
                p.ripples.forEach(ripple => {
                    ripple.radius += ripple.speed;
                    const rippleAlpha = ripple.opacity * alpha * (1 - ripple.radius / (p.size * 8));
                    
                    if (rippleAlpha > 0.01) {
                        ctx.beginPath();
                        ctx.strokeStyle = p.color.replace('0.8', rippleAlpha.toString());
                        ctx.lineWidth = ripple.width;
                        ctx.arc(0, 0, ripple.radius, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                });
                
                // 4角星星
                const vertices = {
                    top: { x: 0, y: -p.pierceLength/2.5 },          // Reduced vertical height
                    right: { x: p.pierceLength, y: 0 },           // Maintained horizontal stretch
                    bottom: { x: 0, y: p.pierceLength/2.5 },        // Reduced vertical height
                    left: { x: -p.pierceLength, y: 0 }            // Maintained horizontal stretch
                };

                // Define inner points for curved connections (closer to center)
                const innerPoints = {
                    topRight: { x: p.pierceLength/7, y: -p.pierceLength/10 },    // Moved closer to center
                    bottomRight: { x: p.pierceLength/7, y: p.pierceLength/10 },   // Moved closer to center
                    bottomLeft: { x: -p.pierceLength/7, y: p.pierceLength/10 },   // Moved closer to center
                    topLeft: { x: -p.pierceLength/7, y: -p.pierceLength/10 }      // Moved closer to center
                };
                
                // Draw the shape with straight lines
                ctx.beginPath();
                ctx.moveTo(vertices.top.x, vertices.top.y);
                
                // Draw straight lines between vertices and inner points
                // Top to right
                ctx.lineTo(innerPoints.topRight.x, innerPoints.topRight.y);
                ctx.lineTo(vertices.right.x, vertices.right.y);
                
                // Right to bottom
                ctx.lineTo(innerPoints.bottomRight.x, innerPoints.bottomRight.y);
                ctx.lineTo(vertices.bottom.x, vertices.bottom.y);
                
                // Bottom to left
                ctx.lineTo(innerPoints.bottomLeft.x, innerPoints.bottomLeft.y);
                ctx.lineTo(vertices.left.x, vertices.left.y);
                
                // Left to top
                ctx.lineTo(innerPoints.topLeft.x, innerPoints.topLeft.y);
                ctx.lineTo(vertices.top.x, vertices.top.y);
                
                ctx.closePath();
                
                // Add main fill with enhanced opacity
                ctx.fillStyle = p.color.replace('0.8', (alpha * 0.9).toString());
                ctx.fill();
                
                ctx.restore();
            }
        }
    },
    "poison": {
        x: p => p.x,
        y: p => p.y,
        size: p => 5 * p.size, // Increased base size
        life: p => 800 * p.size, // Longer lifetime
        draw: (ctx, p) => {
            if (!p.initialized) {
                p.initialized = true;
                p.bubbles = [];
                for (let i = 0; i < 6; i++) { // More bubbles
                    p.bubbles.push({
                        x: p.x + (Math.random() - 0.5) * p.size * 4, // Wider spread
                        y: p.y + (Math.random() - 0.5) * p.size * 4,
                        size: p.size * (Math.random() * 1.2 + 1.2), // Bigger bubbles
                        speed: Math.random() * 0.8 + 0.4, // Faster rise
                        wobble: Math.random() * Math.PI * 2, // For side-to-side movement
                        wobbleSpeed: Math.random() * 0.05 + 0.02
                    });
                }
            }
            
            p.life -= 1;
            const alpha = Math.pow(p.life / p.maxLife, 0.7);
            
            if (p.life > 0) {
                // Draw main poison cloud
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
                ctx.fillStyle = changeColorAlpha(p.color, alpha * 0.8);
                ctx.fill();
                
                // Draw and update bubbles
                p.bubbles.forEach(bubble => {
                    bubble.y -= bubble.speed;
                    bubble.wobble += bubble.wobbleSpeed;
                    bubble.x += Math.sin(bubble.wobble) * 0.5;
                    
                    ctx.beginPath();
                    ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
                    ctx.fillStyle = changeColorAlpha(p.color, alpha);
                    ctx.fill();
                    
                    // Add bubble highlight
                    ctx.beginPath();
                    ctx.arc(bubble.x - bubble.size * 0.3, bubble.y - bubble.size * 0.3, bubble.size * 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
                    ctx.fill();
                });
            }
        }
    },
    "ice": {
        x: p => p.x,
        y: p => p.y,
        speed: p => (Math.random() * 3 + 1.5) * Math.sqrt(p.size),
        size: p => (2 * Math.random() + 3) * p.size,
        life: p => 1200 * p.size,
        draw: (ctx, p) => {
            p.length = p.size * 7;
            p.speed *= 0.96;
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed;
            p.life -= 1;
            
            const lifeRatio = p.life / p.maxLife;
            const alpha = Math.pow(lifeRatio, 0.2);

            if (p.life > 0) {
                    ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle + Math.PI/2);

                    ctx.beginPath();
                ctx.moveTo(0, -p.length/2);
                ctx.lineTo(p.size/2, 0);
                ctx.lineTo(0, p.length/2);
                ctx.lineTo(-p.size/2, 0);
                    ctx.closePath();
                    
                ctx.fillStyle = changeColorAlpha(p.color, alpha);
                    ctx.fill();
                ctx.strokeStyle = changeColorAlpha(p.color, alpha);
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Add white glow
                    ctx.beginPath();
                ctx.moveTo(0, -p.length/2);
                ctx.lineTo(p.size/2, 0);
                ctx.lineTo(0, p.length/2);
                ctx.lineTo(-p.size/2, 0);
                    ctx.closePath();
                    
                    // Create gradient for glow
                const gradient = ctx.createLinearGradient(0, -p.length/2, 0, p.length/2);
                    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.8})`);
                    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.4})`);
                    gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.8})`);
                    
                    ctx.fillStyle = gradient;
                    ctx.fill();

                    // Add shiny highlight
                    ctx.beginPath();
                ctx.moveTo(-p.size/4, -p.length/4);
                ctx.lineTo(p.size/4, -p.length/4);
                    ctx.lineTo(0, 0);
                    ctx.closePath();
                    
                const highlightGradient = ctx.createLinearGradient(-p.size/4, -p.length/4, 0, 0);
                    highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
                    highlightGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
                    
                    ctx.fillStyle = highlightGradient;
                    ctx.fill();

                    ctx.restore();
                }
        }
    },
    "lava": {
        x: p => p.x + (Math.random() - 0.5) * p.size * 5,
        y: p => p.y + (Math.random() - 0.5) * p.size * 2,
        size: p => (14 * Math.random() + 20) * p.size,
        angle: p => (Math.random() - 0.5) * Math.PI/5*2 - Math.PI/2,
        speed: p => (Math.random() * 7 + 5) * Math.sqrt(p.size),
        gravity: p => 1.2 + (Math.random() * 0.2 - 0.1),
        life: p => 1200 * p.size,
        draw: (ctx, p) => {
            if (!p.initialized) {
                p.initialized = true;
                p.particles = [];
                
                // Particle configuration
                const numPoints = 16;
                p.numPoints = numPoints;
                
                p.noiseOffsets = Array.from({length: numPoints}, () => Math.random() * Math.PI * 2);
                p.noiseAmplitudes = Array.from({length: numPoints}, () => Math.random() * 0.15 + 0.85);
                p.noiseSpeeds = Array.from({length: numPoints}, () => Math.random() * 0.03 + 0.02);
                p.time = 0
                p.rotation = Math.random() * Math.PI * 2;
                p.rotationSpeed = (Math.random() - 0.5) * 0.05;
                p.oringinalSize = p.size;
            }

            p.life -= 1;

            p.speed *= 0.98;
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed + p.gravity;
            p.life -= 1;
            p.rotation += p.rotationSpeed;
            p.time += 0.15;
                
            const lifeRatio = p.life / p.maxLife;
            const opacity = lifeRatio * 0.8;
            const sizeReduction = Math.pow(lifeRatio, 0.1);
            p.size = Math.min(p.size * sizeReduction, p.oringinalSize);

            if (p.life > 0) {
                    ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                    
                    // Enable blending for better transparency
                    ctx.globalCompositeOperation = 'lighter';
                    
                    // Draw base particle shape
                    ctx.beginPath();
                for (let i = 0; i < p.numPoints; i++) {
                    const angle = (i / p.numPoints) * Math.PI * 2;
                    const noise = Math.sin(angle + p.noiseOffsets[i] + p.time * p.noiseSpeeds[i]) * 
                                p.noiseAmplitudes[i];
                    const surfaceTension = Math.sin(angle * 3 + p.time * 0.5) * 0.15;
                    const radius = p.size * (1 + noise * 0.2 + surfaceTension);
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        
                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                        const prevAngle = ((i - 1) / p.numPoints) * Math.PI * 2;
                        const prevNoise = Math.sin(prevAngle + p.noiseOffsets[i-1] + p.time * p.noiseSpeeds[i-1]) * 
                                        p.noiseAmplitudes[i-1];
                        const prevSurfaceTension = Math.sin(prevAngle * 3 + p.time * 0.5) * 0.15;
                        const prevRadius = p.size * (1 + prevNoise * 0.2 + prevSurfaceTension);
                            const prevX = Math.cos(prevAngle) * prevRadius;
                            const prevY = Math.sin(prevAngle) * prevRadius;
                            
                            const cpX = (prevX + x) / 2;
                            const cpY = (prevY + y) / 2;
                            ctx.quadraticCurveTo(cpX, cpY, x, y);
                        }
                    }
                    ctx.closePath();
                    
                    // Draw particle with glow effects
                    // Base layer with reduced opacity
                    ctx.fillStyle = changeColorAlpha(p.color, opacity);
                    ctx.fill();
                    
                    // Glow layers with adjusted opacity
                    const drawGlowLayer = (radius, color, alpha) => {
                        ctx.beginPath();
                        ctx.arc(0, 0, radius, 0, Math.PI * 2);
                    ctx.fillStyle = changeColorAlpha(p.color, opacity);
                        ctx.fill();
                    };
                    
                    // Core and inner glow with reduced opacity
                drawGlowLayer(p.size * 0.6, 'rgba(255, 255, 255, 0.8)', 0.4);
                drawGlowLayer(p.size * (1.2 + Math.sin(p.time * 0.5) * 0.2), 'rgba(255, 200, 50, 0.8)', 0.25);
                    
                    // Middle aura with softer gradient
                const middleGlow = ctx.createRadialGradient(0, 0, p.size, 0, 0, p.size * 2);
                middleGlow.addColorStop(0, changeColorAlpha(p.color, opacity * 0.2));
                middleGlow.addColorStop(0.5, `rgba(255, 50, 0, ${opacity * 0.1})`);
                middleGlow.addColorStop(1, `rgba(255, 0, 0, 0)`);
                    
                    ctx.beginPath();
                ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
                ctx.fillStyle = middleGlow;
                ctx.fill();
                    
                // Outer aura with softer gradient
                const outerGlow = ctx.createRadialGradient(
                0, 0, p.size * 1.5,
                0, 0, p.size * (2.5 + Math.sin(p.time * 0.5) * 0.3)
                );
                outerGlow.addColorStop(0, changeColorAlpha(p.color, opacity * 0.1));
                outerGlow.addColorStop(0.5, `rgba(200, 0, 0, ${opacity * 0.03})`);
                outerGlow.addColorStop(1, `rgba(150, 0, 0, 0)`);
                
                ctx.beginPath();
                ctx.arc(0, 0, p.size * (2.5 + Math.sin(p.time * 0.5) * 0.3), 0, Math.PI * 2);
                ctx.fillStyle = outerGlow;
                ctx.fill();
                
                // Reset composite operation
                ctx.globalCompositeOperation = 'source-over';
                ctx.restore();
            }
        }
    },
    "tornado": {
        x: (p) => p.x,
        y: (p) => p.y + 20,
        size: (p) => 3 * p.size,
        life: (p) => 2000 * p.size,
        speed: (p) => (Math.random() * 3 + 1) * Math.sqrt(p.size),
        gravity: (p) => 0.12,
        draw: (ctx, p) => {
            if (!p.initialized) {
                p.initialized = true;
                p.particles = [];
                p.maxParticles = 6;
                p.amplitude = 60 * p.size;
                p.frequency = 7;
                p.timeSpeed = 0.4;
                p.maxHeight = 200 * p.size;
                
                // Parse the base color once
                const colorMatch = p.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
                if (colorMatch) {
                    p.baseColor = {
                        r: parseInt(colorMatch[1]),
                        g: parseInt(colorMatch[2]),
                        b: parseInt(colorMatch[3])
                    };
                }
                
                // Initialize particles with staggered heights
                for (let i = 0; i < p.maxParticles; i++) {
                    const startAngle = Math.random() * Math.PI * 2;
                    const startRadius = Math.random() * 40 * p.size;
                    p.particles.push({
                        angle: startAngle,
                        radius: Math.random() * 150 + 5,
                        height: (i / p.maxParticles) * p.maxHeight,
                        speed: Math.random() * 0.04 + 0.01,
                        size: Math.random() * 3 + 2,
                        baseSpeed: Math.random() * 0.04 + 0.01,
                        startX: Math.cos(startAngle) * startRadius,
                        startY: Math.sin(startAngle) * startRadius,
                        initialSize: Math.random() * 3 + 2,
                        rotation: Math.random() * Math.PI * 2,
                        rotationSpeed: (Math.random() - 0.5) * 0.02,
                        sway: (Math.random() - 0.5) * 0.2,
                        swaySpeed: (Math.random() - 0.5) * 0.02
                    });
                }
            }

            p.life -= 1;

            if (p.life > 0) {
                const alpha = Math.min(p.life / p.maxLife, 1);
                
                for (let particle of p.particles) {
                    const heightRatio = particle.height / p.maxHeight;
                    const currentSpeed = particle.baseSpeed * Math.pow(1 - heightRatio, 3);
                    
                    particle.angle += p.frequency * currentSpeed * p.timeSpeed * p.fpsFactor;
                    particle.radius += (Math.random() - 0.5) * 0.5;
                    particle.height += 1.5 * p.timeSpeed * p.fpsFactor;

                    // Add leaf-like movement
                    particle.rotation += particle.rotationSpeed;
                    if (particle.sway !== undefined) {
                        particle.startX += Math.sin(particle.height * particle.swaySpeed) * particle.sway;
                    }

                    if (particle.height > p.maxHeight) {
                        particle.height = 0;
                        const startAngle = Math.random() * Math.PI * 2;
                        const startRadius = Math.random() * 40 * p.size;
                        particle.startX = Math.cos(startAngle) * startRadius;
                        particle.startY = Math.sin(startAngle) * startRadius;
                        particle.angle = startAngle;
                        particle.initialSize = Math.random() * 3 + 2;
                        particle.rotation = Math.random() * Math.PI * 2;
                        particle.rotationSpeed = (Math.random() - 0.5) * 0.02;
                        particle.sway = (Math.random() - 0.5) * 0.2;
                        particle.swaySpeed = (Math.random() - 0.5) * 0.02;
                    }

                    const spiral = (particle.height / p.maxHeight) * p.amplitude;
                    const x = p.x + particle.startX + Math.cos(particle.angle) * spiral;
                    const y = p.y - particle.height + particle.startY;

                    // Calculate current size based on height and apply size limit
                    const currentSize = Math.min(
                        particle.initialSize * (1 - heightRatio * 0.7) * p.size,
                        Math.min(Math.ceil(p.size * 6), 10)
                    );

                    // Calculate gradient color based on height
                    const gradientFactor = heightRatio * 1; // 100% 上面白
                    const r = Math.min(255, p.baseColor.r + (255 - p.baseColor.r) * gradientFactor);
                    const g = Math.min(255, p.baseColor.g + (255 - p.baseColor.g) * gradientFactor);
                    const b = Math.min(255, p.baseColor.b + (255 - p.baseColor.b) * gradientFactor);

                    // Draw main particle with size reduction
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(particle.rotation);
                    ctx.beginPath();
                    ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
                    ctx.fill();

                    // Add glow effect with size reduction
                    ctx.beginPath();
                    ctx.arc(0, 0, currentSize * 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha * 0.5})`;
                    ctx.fill();
                    ctx.restore();
                }
            }
        }
    },
    "pixelSmoke": {
        x: (p) => p.x + (Math.random() - 0.5) * 80,
        y: (p) => p.y + (Math.random() - 0.5) * 80,
        angle: (p) => (Math.random() - 0.5) * Math.PI/5*2 - Math.PI/2,
        color: (p) => `hsl(0, 0%, ${Math.round(Math.random() * 65 + 10)}%)`,
        size: (p) => (Math.random() * 40 + 10) * p.size,
        speed: (p) => (Math.random() * 0.5) * Math.sqrt(p.size),
        gravity: (p) => -0.3 + Math.random() * 0.2 * p.size,
        life: (p) => Math.floor((Math.random() * 700 + 100) * p.size),
        draw: (ctx, p) => {
            const alpha = Math.pow(p.life / p.maxLife, 0.2);
            p.x += Math.cos(p.angle) * p.speed * 0.3;
            p.speed *= 0.992
            p.y += -Math.sin(p.speed) * 0.5;
            p.color = changeColorAlpha(p.color, alpha);
            p.life -= 1;

            if (p.life > 0) {
                shapes.rectangle(ctx, p)
            }
        }
    },
    "shatter": {
        x: p => p.x,
        y: p => p.y,
        size: p =>(1 * Math.random() + 5) * p.size,
        life: p => 500 * p.size,
        draw: (ctx, p) => {
            if (!p.initialized) {
                p.initialized = true;
                p.particles = [];
                // Create particles in a circular pattern
                const particleCount = Math.max(2, Math.min(0.1, Math.floor(p.size * 1))); // Scale particle count with size
                
                // Define the main direction and spread
                const mainAngle = Math.random() * Math.PI * 2; // Random main direction
                const spreadAngle = Math.PI / 3; // 60 degree spread
                
                for (let i = 0; i < particleCount; i++) {
                    // Calculate angle within the spread range
                    const angleProgress = i / (particleCount - 1);
                    const angleVariation = (Math.random() - 0.5) * 0.3; // Small random variation
                    const finalAngle = mainAngle - spreadAngle/2 + (spreadAngle * angleProgress) + angleVariation;
                    
                    // Create size variation
                    const sizeVariation = Math.random() * 0.8 + 0.6; // More consistent size
                    const baseSize = (Math.random() * 0.6 + 5) * p.size;
                    
                    // Generate initial radius variations for each point
                    const points = Math.floor(Math.random() * 3) + 3;
                    const radiusVariations = Array.from({length: points}, () => 0.7 + Math.random() * 0.6);
                    
                    p.particles.push({
                        x: p.x,
                        y: p.y,
                        angle: finalAngle,
                        speed: (Math.random() * 2 + 1) * Math.sqrt(p.size) * p.fpsFactor, // Reduced initial speed
                        size: baseSize * sizeVariation,
                        initialSize: baseSize * sizeVariation,
                        life: 500 * p.size,
                        maxLife: 500 * p.size,
                        gravity: 0.05,
                        points: points,
                        shapeAngle: Math.floor(Math.random() * 6),
                        rotationSpeed: (Math.random() - 0.5) * 0.05, // Add rotation speed
                        radiusVariations: radiusVariations,
                        verticalSpeed: 0 // Add vertical speed for better gravity effect
                    });
                }
            }

            p.life -= 10 / p.fpsFactor;
            
            // Update and draw particles
            p.particles.forEach(particle => {
                // Update vertical speed with gravity
                particle.verticalSpeed += particle.gravity;
                
                // Update position with both horizontal and vertical movement
                particle.speed *= 0.98; // Slower deceleration
                particle.x += Math.cos(particle.angle) * particle.speed;
                particle.y += Math.sin(particle.angle) * particle.speed + particle.verticalSpeed;
                
                // Update rotation
                particle.shapeAngle += particle.rotationSpeed;
                
                particle.life -= 10 / p.fpsFactor;
                
                const lifeRatio = particle.life / particle.maxLife;
                const opacity = Math.pow(lifeRatio, 0.5);
                particle.size = particle.initialSize * Math.pow(lifeRatio, 0.5);

                if (particle.life > 0) {
                    ctx.save();
                    ctx.translate(particle.x, particle.y);
                    
                    // Draw irregular shape with stored radius variations
                    ctx.rotate(particle.shapeAngle);
                    ctx.beginPath();
                    for (let i = 0; i < particle.points; i++) {
                        const angle = (i * 2 * Math.PI) / particle.points - Math.PI / 2;
                        const radius = particle.size * particle.radiusVariations[i];
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.closePath();
                    ctx.fillStyle = p.color.replace('0.2', opacity.toString());
                    ctx.fill();
                    
                    ctx.restore();
                }
            });
        }
    },
    "crescentSlash": {
        x: p => p.x,
        y: p => p.y,
        size: p => 10 * p.size, // Reduced base size
        life: p => 1200 * p.size,
        speed: p => (Math.random() * 10 + 4) * Math.sqrt(p.size) * 0.01,
        angle: p => Math.random() * Math.PI * 2,
        curveAmount: p => 5.3 * p.size * 2,
        distance: p => 60 * p.size,
        alpha: p => 1,
        draw: (ctx, p) => {
            if (!p.initialized) {
                p.initialized = true;
                p.trail = [];
                p.fadeStartTime = 0;
                p.isSlashing = true;
                p.progress = 0;
                p.speed = (Math.random() * 10 + 4) * Math.sqrt(p.size) * 0.01 * p.fpsFactor;
                p.angle = Math.random() * Math.PI * 2;
                p.curveAmount = 5.3 * p.size * 2;
                p.distance = 60 * p.size;

                p.totalPoints = Math.max(30, Math.min(100, Math.floor(p.distance / 2)));
            }

            p.life -= 3 / p.fpsFactor;
            const alpha = Math.pow(Math.min(1, p.life / p.maxLife), 0.5);

            if (p.life > 0) {
                if (p.isSlashing) {
                    p.progress = Math.min(1, p.progress + p.speed);
                    
                    p.trail = [];
                    const currentPoints = Math.floor(p.totalPoints * p.progress);
                    
                    for (let i = 0; i < currentPoints; i++) {
                        const progress = (i / p.totalPoints) - 0.5;
                        const distance = progress * p.distance;
                        
                        // Calculate base position
                        let x = Math.cos(p.angle) * distance;
                        let y = Math.sin(p.angle) * distance;
                        
                        // Add crescent curve
                        const curveOffset = Math.sin((progress + 0.5) * Math.PI) * p.curveAmount;
                        x += Math.cos(p.angle + Math.PI/2) * curveOffset;
                        y += Math.sin(p.angle + Math.PI/2) * curveOffset;
                        
                        let size = p.size * 1.2; // Reduced multiplier
                        if (progress < -0.2) {
                            size = p.size * (0.3 + (progress + 0.5) * 3); // Reduced size scaling
                        } else if (progress > 0.2) {
                            size = p.size * (1.2 - (progress - 0.2) * 3); // Reduced size scaling
                        }
                        
                        p.trail.push({
                            x: x,
                            y: y,
                            size: size,
                            alpha: 1,
                            age: 0
                        });
                    }
                    
                    if (p.progress >= 1) {
                        p.isSlashing = false;
                        p.fadeStartTime = Date.now();
                    }
                }
                
                ctx.save();
                ctx.translate(p.x, p.y);
                
                for (let i = 0; i < p.trail.length; i++) {
                    const point = p.trail[i];
                    
                    let pointAlpha;
                    if (p.isSlashing) {
                        pointAlpha = Math.exp(-point.age / 150) * alpha;
                        point.age += 0.5;
                    } else {
                        const timeSinceFade = Date.now() - p.fadeStartTime;
                        const fadeProgress = timeSinceFade / 1000;
                        pointAlpha = Math.exp(-fadeProgress * 2) * alpha;
                    }
                    
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
                    ctx.fillStyle = changeColorAlpha(p.color, pointAlpha);
                    ctx.fill();
                    
                    if ((p.isSlashing && point.age >= 200) || 
                        (!p.isSlashing && (Date.now() - p.fadeStartTime) >= 1000)) {
                        p.trail.splice(i, 1);
                        i--;
                    }
                }
                
                ctx.restore();
            }
        }
    }
}