export const onHitEffectsMap = {
    "smoke": {
        angle: (p) => Math.random() * Math.PI * 2,
        alpha: (p) => 0.7,
        speed: (p) => (Math.random() * 0.2 + 0.1) * Math.sqrt(p.size),
        size: (p) => (Math.random() * 20 + 10) * p.size,
        life: (p) => 4000 * Math.sqrt(p.size),
        gravity: (p) => -0.2 * Math.sqrt(p.size),
        draw: (ctx, p) => {
            if (!p.initialized) {
                p.initialized = true;
                p.y -= 5 * p.size;
                p.sizeVariation = Math.random() * 0.2 + 0.9; // Size variation for billowing effect
                p.rotationSpeed = (Math.random() - 0.5) * 0.02; // Slow rotation
                p.rotation = Math.random() * Math.PI * 2;
            }

            p.speed *= 0.995; // Slower deceleration
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed + p.gravity;
            p.life -= 1;
            p.alpha = Math.max(0, p.alpha - 0.001);
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
        size: p => 10 * p.size,
        life: p => 800 * Math.sqrt(p.size),
        draw: (ctx, p) => {
            if (!p.maxSize) {
                p.maxSize = p.size * (150 + Math.random() * 100) / 10;
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
            p.life -= 3;

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
                p.life -= 2; // Even slower fade
                
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
            p.life -= 3;

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

            p.life -= 2;
            
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
            p.life -= 3;

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
    }
}