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
    },
    "pierce": {
        x: p => p.x,
        y: p => p.y,
        size: p => 5 * p.size,
        life: p => 1200 * p.size,
        draw: (ctx, p) => {
            if (!p.initialized) {
                p.initialized = true;
                p.pierceLength = p.size * 12;
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
            
            p.life -= 2;
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
                
                // Draw diamond shape
                ctx.beginPath();
                
                // Top point
                ctx.moveTo(0, -p.pierceLength/8);
                
                // Right point
                ctx.lineTo(p.pierceLength/1.2, 0);
                
                // Bottom point
                ctx.lineTo(0, p.pierceLength/8);
                
                // Left point
                ctx.lineTo(-p.pierceLength/1.2, 0);
                
                // Close the shape
                ctx.closePath();
                
                // Add main fill with enhanced opacity
                ctx.fillStyle = p.color.replace('0.8', (alpha * 0.9).toString());
                ctx.fill();
                
                // Add highlight effect
                const highlightGradient = ctx.createLinearGradient(
                    0, -p.pierceLength/8,
                    0, p.pierceLength/8
                );
                highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.3})`);
                highlightGradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.1})`);
                highlightGradient.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.3})`);
                
                ctx.fillStyle = highlightGradient;
                ctx.fill();
                
                // Add edge glow
                ctx.strokeStyle = p.color.replace('0.8', (alpha * 0.4).toString());
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Add energy particles at the corners
                const corners = [
                    { x: 0, y: -p.pierceLength/8 },
                    { x: p.pierceLength/1.2, y: 0 },
                    { x: 0, y: p.pierceLength/8 },
                    { x: -p.pierceLength/1.2, y: 0 }
                ];
                
                corners.forEach(corner => {
                    ctx.beginPath();
                    ctx.arc(corner.x, corner.y, p.size * 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
                    ctx.fill();
                });
                
                ctx.restore();
            }
        }
    },
    "poison": {
        x: p => p.x,
        y: p => p.y,
        size: p => 5 * p.size, // Increased base size
        life: p => 1500 * p.size, // Longer lifetime
        draw: (ctx, p) => {
            if (!p.initialized) {
                p.initialized = true;
                p.bubbles = [];
                for (let i = 0; i < 8; i++) { // More bubbles
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
            
            p.life -= 2;
            const alpha = p.life / 1500;
            
            if (p.life > 0) {
                // Draw main poison cloud
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * (1 - alpha) * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace('0.8', (alpha * 0.5).toString());
                ctx.fill();
                
                // Draw and update bubbles
                p.bubbles.forEach(bubble => {
                    bubble.y -= bubble.speed;
                    bubble.wobble += bubble.wobbleSpeed;
                    bubble.x += Math.sin(bubble.wobble) * 0.5;
                    
                    ctx.beginPath();
                    ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
                    ctx.fillStyle = p.color.replace('0.8', (alpha * 0.7).toString());
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
        size: p => (2 * Math.random() + 3) * p.size,
        life: p => 1500 * p.size,
        draw: (ctx, p) => {
            if (!p.initialized) {
                p.initialized = true;
                p.crystals = [];
                
                const crystalCount = 14;
                for (let i = 0; i < crystalCount; i++) {
                    const angle = (i / crystalCount) * Math.PI * 2;
                    const angleVariation = (Math.random() - 0.5) * 0.3;
                    const finalAngle = angle + angleVariation;
                    
                    p.crystals.push({
                        x: p.x,
                        y: p.y,
                        angle: finalAngle,
                        speed: (Math.random() * 1.5 + 1) * Math.sqrt(p.size),
                        size: p.size * (Math.random() * 1.2 + 1.5),
                        length: p.size * (Math.random() * 5 + 4),
                        life: 1500 * p.size
                    });
                }
            }

            p.life -= 1;
            
            p.crystals.forEach(crystal => {
                crystal.speed *= 0.96;
                crystal.x += Math.cos(crystal.angle) * crystal.speed;
                crystal.y += Math.sin(crystal.angle) * crystal.speed;
                crystal.life -= 1;
                
                const lifeRatio = crystal.life / (1500 * p.size);
                const alpha = Math.pow(lifeRatio, 1.5) * 0.8;

                if (crystal.life > 0) {
                    ctx.save();
                    ctx.translate(crystal.x, crystal.y);
                    ctx.rotate(crystal.angle + Math.PI/2);

                    // Draw base crystal
                    ctx.beginPath();
                    ctx.moveTo(0, -crystal.length/2);
                    ctx.lineTo(crystal.size/2, 0);
                    ctx.lineTo(0, crystal.length/2);
                    ctx.lineTo(-crystal.size/2, 0);
                    ctx.closePath();
                    
                    ctx.fillStyle = p.color.replace('0.8', (alpha * 0.6).toString());
                    ctx.fill();
                    ctx.strokeStyle = p.color.replace('0.8', (alpha * 0.8).toString());
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Add white glow
                    ctx.beginPath();
                    ctx.moveTo(0, -crystal.length/2);
                    ctx.lineTo(crystal.size/2, 0);
                    ctx.lineTo(0, crystal.length/2);
                    ctx.lineTo(-crystal.size/2, 0);
                    ctx.closePath();
                    
                    // Create gradient for glow
                    const gradient = ctx.createLinearGradient(0, -crystal.length/2, 0, crystal.length/2);
                    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.8})`);
                    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.4})`);
                    gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.8})`);
                    
                    ctx.fillStyle = gradient;
                    ctx.fill();

                    // Add shiny highlight
                    ctx.beginPath();
                    ctx.moveTo(-crystal.size/4, -crystal.length/4);
                    ctx.lineTo(crystal.size/4, -crystal.length/4);
                    ctx.lineTo(0, 0);
                    ctx.closePath();
                    
                    const highlightGradient = ctx.createLinearGradient(-crystal.size/4, -crystal.length/4, 0, 0);
                    highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
                    highlightGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
                    
                    ctx.fillStyle = highlightGradient;
                    ctx.fill();

                    ctx.restore();
                }
            });
        }
    },
    "lava": {
        x: p => p.x,
        y: p => p.y,
        size: p => (2 * Math.random() + 5) * p.size,
        life: p => 1800 * p.size,
        draw: (ctx, p) => {
            if (!p.initialized) {
                p.initialized = true;
                p.particles = [];
                
                // Particle configuration
                const particleCount = 8;
                const baseSize = (Math.random() * 3 + 2.2) * p.size;
                const sizeVariation = Math.random() * 0.4 + 0.8;
                const numPoints = 16;
                
                // Create particles
                for (let i = 0; i < particleCount; i++) {
                    // Calculate particle properties
                    const downwardAngle = -Math.PI/2;
                    const maxSpreadAngle = Math.PI/4;
                    const finalAngle = downwardAngle + (Math.random() - 0.5) * maxSpreadAngle;
                    
                    // Generate noise parameters for liquid effect
                    const noiseOffsets = Array.from({length: numPoints}, () => Math.random() * Math.PI * 2);
                    const noiseAmplitudes = Array.from({length: numPoints}, () => Math.random() * 0.15 + 0.85);
                    const noiseSpeeds = Array.from({length: numPoints}, () => Math.random() * 0.03 + 0.02);
                    
                    p.particles.push({
                        x: p.x + (Math.random() - 0.5) * p.size * 2,
                        y: p.y,
                        angle: finalAngle,
                        speed: (Math.random() * 2 + 1.5) * Math.sqrt(p.size),
                        size: baseSize * sizeVariation,
                        initialSize: baseSize * sizeVariation,
                        life: 1800 * p.size,
                        gravity: 1.2 + (Math.random() * 0.2 - 0.1),
                        rotation: Math.random() * Math.PI * 2,
                        rotationSpeed: (Math.random() - 0.5) * 0.05,
                        noiseOffsets,
                        noiseAmplitudes,
                        noiseSpeeds,
                        numPoints,
                        time: 0
                    });
                }
            }

            p.life -= 2;
            
            // Update and draw particles
            p.particles.forEach(particle => {
                // Update particle state
                particle.speed *= 0.99;
                particle.x += Math.cos(particle.angle) * particle.speed;
                particle.y += Math.sin(particle.angle) * particle.speed + particle.gravity;
                particle.life -= 2;
                particle.rotation += particle.rotationSpeed;
                particle.time += 0.15;
                
                const lifeRatio = particle.life / (1800 * p.size);
                const opacity = lifeRatio * 0.7; // Reduced base opacity
                const sizeReduction = Math.pow(lifeRatio, 2.5);
                particle.size = particle.initialSize * sizeReduction;

                if (particle.life > 0) {
                    ctx.save();
                    ctx.translate(particle.x, particle.y);
                    ctx.rotate(particle.rotation);
                    
                    // Enable blending for better transparency
                    ctx.globalCompositeOperation = 'lighter';
                    
                    // Draw base particle shape
                    ctx.beginPath();
                    for (let i = 0; i < particle.numPoints; i++) {
                        const angle = (i / particle.numPoints) * Math.PI * 2;
                        const noise = Math.sin(angle + particle.noiseOffsets[i] + particle.time * particle.noiseSpeeds[i]) * 
                                    particle.noiseAmplitudes[i];
                        const surfaceTension = Math.sin(angle * 3 + particle.time * 0.5) * 0.15;
                        const radius = particle.size * (1 + noise * 0.2 + surfaceTension);
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        
                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            const prevAngle = ((i - 1) / particle.numPoints) * Math.PI * 2;
                            const prevNoise = Math.sin(prevAngle + particle.noiseOffsets[i-1] + particle.time * particle.noiseSpeeds[i-1]) * 
                                            particle.noiseAmplitudes[i-1];
                            const prevSurfaceTension = Math.sin(prevAngle * 3 + particle.time * 0.5) * 0.15;
                            const prevRadius = particle.size * (1 + prevNoise * 0.2 + prevSurfaceTension);
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
                    ctx.fillStyle = p.color.replace('0.8', (opacity * 0.4).toString());
                    ctx.fill();
                    
                    // Glow layers with adjusted opacity
                    const drawGlowLayer = (radius, color, alpha) => {
                        ctx.beginPath();
                        ctx.arc(0, 0, radius, 0, Math.PI * 2);
                        ctx.fillStyle = color.replace('0.8', (opacity * alpha).toString());
                        ctx.fill();
                    };
                    
                    // Core and inner glow with reduced opacity
                    drawGlowLayer(particle.size * 0.6, 'rgba(255, 255, 255, 0.8)', 0.4);
                    drawGlowLayer(particle.size * (1.2 + Math.sin(particle.time * 0.5) * 0.2), 'rgba(255, 200, 50, 0.8)', 0.25);
                    
                    // Middle aura with softer gradient
                    const middleGlow = ctx.createRadialGradient(0, 0, particle.size, 0, 0, particle.size * 2);
                    middleGlow.addColorStop(0, `rgba(255, 100, 50, ${opacity * 0.2})`);
                    middleGlow.addColorStop(0.5, `rgba(255, 50, 0, ${opacity * 0.1})`);
                    middleGlow.addColorStop(1, `rgba(255, 0, 0, 0)`);
                    
                    ctx.beginPath();
                    ctx.arc(0, 0, particle.size * 2, 0, Math.PI * 2);
                    ctx.fillStyle = middleGlow;
                    ctx.fill();
                    
                    // Outer aura with softer gradient
                    const outerGlow = ctx.createRadialGradient(
                        0, 0, particle.size * 1.5,
                        0, 0, particle.size * (2.5 + Math.sin(particle.time * 0.5) * 0.3)
                    );
                    outerGlow.addColorStop(0, `rgba(255, 0, 0, ${opacity * 0.1})`);
                    outerGlow.addColorStop(0.5, `rgba(200, 0, 0, ${opacity * 0.03})`);
                    outerGlow.addColorStop(1, `rgba(150, 0, 0, 0)`);
                    
                    ctx.beginPath();
                    ctx.arc(0, 0, particle.size * (2.5 + Math.sin(particle.time * 0.5) * 0.3), 0, Math.PI * 2);
                    ctx.fillStyle = outerGlow;
                    ctx.fill();
                    
                    // Reset composite operation
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.restore();
                }
            });
        }
    }
}