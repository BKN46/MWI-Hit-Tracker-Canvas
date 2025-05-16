export const shapes = {
    "circle": (ctx, p={}) => {
        // {x, y, size, color}
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
    },
    "rectangle": (ctx, p={}) => {
        // {x, y, size, color}
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.closePath();
    },
    "star": (ctx, p={}) => {
        // {x, y, size, color, angle}
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
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
    },
    "arrow": (ctx, p={}) => {
        // {x, y, size, color, velocity, arrowLength, arrowWidth, arrowHeadLength, arrowHeadWidth, fletchingLength, fletchingWidth}
        const length = p.size * (p.arrowLength || 6);
        const width = p.size * (p.arrowWidth || 0.5);
        const arrowHeadLength = p.size * (p.arrowHeadLength || 1.33);
        const arrowHeadWidth = p.size * (p.arrowHeadWidth || 0.80);
        const fletchingLength = p.size * (p.fletchingLength || 2.13);
        const fletchingWidth = p.size * (p.fletchingWidth || 1.33);
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
    "pentagon": (ctx, p={}) => {
        // {x, y, size, color, angle}
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle || 0);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * p.size;
            const y = Math.sin(angle) * p.size;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
    },
    "triangle": (ctx, p={}) => {
        // {x, y, size, color, angle}
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle || 0);
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
            const x = Math.cos(angle) * p.size;
            const y = Math.sin(angle) * p.size;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
    },
    "irregular": (ctx, p={}) => {
        // {x, y, size, color, angle, points}
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle || 0);
        const points = p.points || 6; // Default to 6 points if not specified
        ctx.beginPath();
        for (let i = 0; i < points; i++) {
            const angle = (i * 2 * Math.PI) / points - Math.PI / 2;
            // Add some randomness to the radius for irregularity
            const radius = p.size * (0.7 + Math.random() * 0.6);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
    },
    "magnet": (ctx, p={}) => {
        // {x, y, size, color, angle}
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle || 0);
        
        // Set stroke properties
        ctx.lineCap = 'butt';  // Makes strokes end exactly at the specified points
        ctx.lineWidth = p.size * 0.7;  // Equivalent to strokeWeight(35)
        
        // Draw left L shape (red)
        ctx.strokeStyle = 'rgb(255, 50, 50)';  // Muted red
        ctx.beginPath();
        // Vertical part
        ctx.moveTo(-p.size, -p.size);
        ctx.lineTo(-p.size, 0);
        // Horizontal part with curve
        ctx.bezierCurveTo(
            -p.size, p.size,     // Control point 1: (150, 300)
            -p.size/3, p.size,   // Control point 2: (200, 300)
            0, p.size    // End point: (200, 300)
        );
        ctx.stroke();
        
        // Draw right L shape (blue)
        ctx.strokeStyle = 'rgb(50, 50, 255)';  // Muted blue
        ctx.beginPath();
        // Vertical part
        ctx.moveTo(p.size, -p.size);
        ctx.lineTo(p.size, 0);
        // Horizontal part with curve
        ctx.bezierCurveTo(
            p.size, p.size,      // Control point 1: (250, 300)
            p.size/3, p.size,    // Control point 2: (200, 300)
            0, p.size     // End point: (200, 300)
        );
        ctx.stroke();

        // Draw short grey lines
        ctx.strokeStyle = 'grey';
        // Left grey line
        ctx.beginPath();
        ctx.moveTo(-p.size, -p.size);
        ctx.lineTo(-p.size, -p.size/0.6);
        ctx.stroke();

        // Right grey line
        ctx.beginPath();
        ctx.moveTo(p.size, -p.size);
        ctx.lineTo(p.size, -p.size/0.6);
        ctx.stroke();
        
        ctx.restore();
    }
}