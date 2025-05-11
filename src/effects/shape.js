export const shapes = {
    "circle": (ctx, p={}) => {
        // {x, y, size, color}
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
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
    }
}