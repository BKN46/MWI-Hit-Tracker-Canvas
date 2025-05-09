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
        // canvas.width = battlePanel.offsetWidth;
        // canvas.height = battlePanel.offsetHeight;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    return canvas;
}

// 更新和渲染所有爆炸
function updateExplosions() {
    // 遍历所有活跃的爆炸
    for (let i = activeExplosions.length - 1; i >= 0; i--) {
        const explosion = activeExplosions[i];
        explosion.count++;
        
        if (explosion.count >= explosion.maxCount) {
            // 爆炸结束，从列表中移除
            activeExplosions.splice(i, 1);
            continue;
        }
        
        ctx.save();
        
        // 更新和绘制冲击波
        explosion.shockwaves.forEach((wave, index) => {
            wave.radius += (wave.maxRadius - wave.radius) * 0.1;
            wave.life -= 10;
            
            if (wave.life > 0) {
                const alpha = wave.life / 400;
                ctx.beginPath();
                ctx.strokeStyle = wave.color;
                ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
                // ctx.strokeStyle = `${wave.color.slice(0, -2)}${alpha})`;
                ctx.lineWidth = 5 * alpha;
                ctx.stroke();
            }
        });
        
        // 更新和绘制主要爆炸粒子
        explosion.particles.forEach((p, index) => {
            p.speed *= 0.96; // 速度衰减
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed + p.gravity;
            p.life -= 5;
            
            if (p.life > 0) {
                const alpha = p.life / 300;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * (p.life/300), 0, Math.PI*2);
                ctx.fillStyle = `${p.color.slice(0, -4)}%, ${alpha})`;
                ctx.fill();
            }
        });
        
        // 更新和绘制余烬
        explosion.embers.forEach((e, index) => {
            e.speed *= 0.99; // 慢慢减速
            e.x += Math.cos(e.angle) * e.speed;
            e.y += Math.sin(e.angle) * e.speed + e.gravity;
            e.life -= 3;
            
            if (e.life > 0) {
                const alpha = e.life / 800;
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.size * (e.life/800), 0, Math.PI*2);
                ctx.fillStyle = `${e.color.slice(0, -4)}%, ${alpha})`;
                ctx.fill();
                
                // 余烬偶尔产生的小火花
                if (Math.random() < 0.03) {
                    ctx.beginPath();
                    ctx.arc(e.x, e.y, e.size * 1.5, 0, Math.PI*2);
                    ctx.fillStyle = `hsla(30, 100%, 70%, ${alpha * 0.7})`;
                    ctx.fill();
                }
            }
        });
        
        // 更新和绘制烟雾
        explosion.smokeParticles.forEach((s, index) => {
            s.x += Math.cos(s.angle) * s.speed;
            s.y += Math.sin(s.angle) * s.speed + s.gravity;
            s.life -= 2;
            s.alpha = Math.max(0, s.alpha - 0.003);
            
            if (s.life > 0) {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
                ctx.fillStyle = `rgba(80, 80, 80, ${s.alpha * (s.life/1200)})`;
                ctx.fill();
            }
        });

        // 伤害文本
        if (explosion.otherInfo.damage) { 
            const fontSize=  Math.min(Math.max(12, Math.pow(explosion.otherInfo.damage,0.7)/2), 80);
            const damageText = `${explosion.otherInfo.damage}`
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // border
            ctx.strokeStyle = explosion.otherInfo.color;
            ctx.lineWidth = 6;
            ctx.strokeText(damageText, explosion.otherInfo.end.x, explosion.otherInfo.end.y - 20);
            // main
            ctx.fillStyle = 'white';
            const textWidth = ctx.measureText(damageText).width;
            if (textWidth < 100) {
                ctx.fillText(damageText, explosion.otherInfo.end.x, explosion.otherInfo.end.y - 20);
            } else {
                ctx.fillText(damageText, explosion.otherInfo.end.x, explosion.otherInfo.end.y - 20, textWidth + 10);
            }
        }
        ctx.restore();
    }
}

// 动画循环
export function animate() {
    // 完全清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 如果需要残影效果，可以绘制半透明矩形
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新并绘制所有弹丸
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.update();
        proj.draw(ctx);

        if(proj.isArrived()) {
            createExplosion(proj.x, proj.y, proj.color, proj.size, proj.otherInfo); // 将弹丸大小传递给爆炸效果
            projectiles.splice(i, 1);
        } else if(proj.isOutOfBounds()) {
            // 超出边界则移除弹丸，不产生爆炸效果
            projectiles.splice(i, 1);
        }
    }
    
    // 更新和渲染所有爆炸效果
    updateExplosions();

    requestAnimationFrame(animate);
}

class Projectile {
  constructor(startX, startY, endX, endY, color, initialSpeed = 1, size = 10, otherInfo={}) {
      // 基础属性
      this.x = startX;
      this.y = startY;
      this.start = { x: startX, y: startY };
      this.target = { x: endX, y: endY };
      this.otherInfo = otherInfo;
      
      // 运动参数 - 向斜上方抛物线轨迹
      this.gravity = 0.2; // 重力加速度
      this.initialSpeed = initialSpeed; // 初始速度参数
      
      // 计算水平距离和高度差
      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 重新设计飞行时间计算，确保合理
      // const timeInAir = distance / this.initialSpeed / 10;
      const timeInAir = 80 / this.initialSpeed;

      // 计算初始速度，修正公式确保能够到达目标
      this.velocity = {
          x: dx / timeInAir,
          y: (dy / timeInAir) - (this.gravity * timeInAir / 2)
      };
      
      // 大小参数 (范围1-100)
      this.sizeScale = Math.max(1, Math.min(100, size)) / 10; // 转换为比例因子
      
      // 外观属性
      this.size = 10 * this.sizeScale;
      this.color = color;
      
      // 拖尾效果
      this.trail = [];
      this.maxTrailLength = Math.floor(50 * Math.sqrt(this.sizeScale)); // 拖尾长度随大小增加
  }

  update() {
      // 更新速度 (考虑重力)
      this.velocity.y += this.gravity;
      
      // 更新位置
      this.x += this.velocity.x;
      this.y += this.velocity.y;

      // 更新拖尾
      this.trail.push({ x: this.x, y: this.y });
      if(this.trail.length > this.maxTrailLength) {
          this.trail.shift();
      }
  }

  draw(canvas) {
      // 绘制拖尾
      this.trail.forEach((pos, index) => {
          const alpha = index / this.trail.length;
          canvas.beginPath();
          canvas.arc(pos.x, pos.y, this.size * alpha, 0, Math.PI * 2);
          canvas.fillStyle = `${this.color}`;
          canvas.fill();
      });

      // 绘制主体
      canvas.beginPath();
      canvas.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      canvas.fillStyle = this.color;
      canvas.fill();

      // 添加光晕效果
      const gradient = canvas.createRadialGradient(
          this.x, this.y, 0, 
          this.x, this.y, this.size*2
      );
      gradient.addColorStop(0, `${this.color}`);
      gradient.addColorStop(1, `${this.color}`);
      canvas.fillStyle = gradient;
  }

  isArrived() {
      // 判断是否到达目标点 (调整判定距离)
      const arrivalDistance = 20;
      return Math.hypot(this.x - this.target.x, this.y - this.target.y) < arrivalDistance;
  }

  isOutOfBounds() {
      return this.x < 0 || this.x > canvas.width || 
              this.y < 0 || this.y > canvas.height;
  }
}

// 项目管理
let projectiles = [];

// 存储所有活跃的爆炸效果
let activeExplosions = [];

// 爆炸效果函数
function createExplosion(x, y, color, size = 10, otherInfo = {}) {
  // 计算爆炸大小比例
  const sizeScale = Math.max(1, Math.min(100, size)) / 20;
  
  // 多种粒子系统
  const particles = [];
  const shockwaves = [];
  const embers = [];
  const smokeParticles = [];
  
  // 主爆炸粒子 - 数量和大小基于sizeScale
  const particleCount = Math.floor(4 * sizeScale);
  for(let i = 0; i < particleCount; i++) {
      particles.push({
          x, y,
          angle: Math.random() * Math.PI * 2,
          speed: (Math.random() * 7 + 3) * Math.sqrt(sizeScale),
          size: (Math.random() * 12 + 8) * sizeScale,
          life: 500 * sizeScale, // 生命时间随大小增加
          // color: `hsl(${Math.floor(Math.random()*60 + 10)}, 100%, 60%)`,
          color: color,
          gravity: 0.3 + Math.random() * 0.1
      });
  }
  
  // 冲击波效果 - 大小基于sizeScale
  for(let i = 0; i < Math.ceil(sizeScale); i++) {
      shockwaves.push({
          x, y,
          radius: 7 * sizeScale,
          maxRadius: (100 + Math.random() * 100) * sizeScale,
          life: 800 * Math.sqrt(sizeScale),
          // color: `hsla(${Math.floor(Math.random()*30 + 15)}, 100%, 50%, 0.8)`,
          color: color,
      });
  }
  
  // 余烬效果 - 数量和大小基于sizeScale
  const emberCount = Math.floor(20 * sizeScale);
  for(let i = 0; i < emberCount; i++) {
      embers.push({
          x, y,
          angle: Math.random() * Math.PI * 2,
          speed: (Math.random() * 2 + 0.5) * Math.sqrt(sizeScale),
          size: (Math.random() * 6 + 2) * sizeScale,
          life: 1200 * Math.sqrt(sizeScale),
          // color: `hsl(${Math.floor(Math.random()*30 + 10)}, 100%, ${Math.floor(Math.random()*50 + 40)}%)`,
          color: color,
          gravity: 0.3
      });
  }
  
  // 烟雾效果 - 数量和大小基于sizeScale
  const smokeCount = Math.floor(4 * sizeScale);
  for(let i = 0; i < smokeCount; i++) {
      smokeParticles.push({
          x, y,
          angle: Math.random() * Math.PI * 2,
          speed: (Math.random() * 1 + 0.2) * Math.sqrt(sizeScale),
          size: (Math.random() * 15 + 8) * sizeScale,
          life: 2000 * Math.sqrt(sizeScale),
          alpha: 0.7,
          gravity: -1 * Math.sqrt(sizeScale) // 烟雾上升速度基于大小
      });
  }

  // 闪光效果
  function drawFlash() {
      const flashRadius = 150 * sizeScale;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, flashRadius);
      gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
      gradient.addColorStop(0.1, 'rgba(255, 230, 150, 0.6)');
      gradient.addColorStop(0.4, 'rgba(255, 100, 50, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - flashRadius, y - flashRadius, flashRadius * 2, flashRadius * 2);
  }

  // 存储爆炸的活跃状态，用于跟踪
  const explosionData = {
      particles: [...particles],
      shockwaves: [...shockwaves],
      embers: [...embers],
      smokeParticles: [...smokeParticles],
      active: true,
      count: 0,
      maxCount: 120,
      otherInfo: otherInfo,
  };
  
  // 将这个爆炸添加到全局爆炸列表中
  activeExplosions.push(explosionData);
  
  // 初始闪光
  drawFlash();
}

export function createProjectile(startElement, endElement, color, initialSpeed = 1, damage = 200) {
  const combatUnitContainer = endElement.querySelector(".CombatUnit_splatsContainer__2xcc0");
  combatUnitContainer.style.visibility = "hidden";
  const padding = 30;
  const randomRange = {
      x: Math.floor((Math.random() * (combatUnitContainer.offsetWidth - 2 * padding)) - combatUnitContainer.offsetWidth / 2 + padding),
      y: Math.floor((Math.random() * (combatUnitContainer.offsetHeight - 2 * padding)) - combatUnitContainer.offsetHeight / 2 + padding),
  }

  const projectileLimit = 30;
  const start = getElementCenter(startElement);
  const end = getElementCenter(endElement);
  end.x = Math.floor(end.x + randomRange.x);
  end.y = Math.floor(end.y + randomRange.y);

  const size = Math.min(Math.max(Math.pow(damage+200,0.8)/20, 4), 17)
  const otherInfo = {
      start: start,
      end: end,
      damage: damage,
      color: color,
  }
  const projectile = new Projectile(start.x, start.y, end.x, end.y, color, initialSpeed, size, otherInfo);
  projectiles.push(projectile);
  if (projectiles.length > projectileLimit) {
      projectiles.shift();
  }
}

function getElementCenter(element) {
    const rect = element.getBoundingClientRect();
    if (element.innerText.trim() === '') {
        return {
            x: rect.left + rect.width/2,
            y: rect.top
        };
    }
    return {
        x: rect.left + rect.width/2,
        y: rect.top + rect.height/2
    };
}