import { settingsMap } from "../setting.js";
import { onHitEffectsMap } from "./hit.js";
import { addEffect } from "./manager.js";
import { getElementCenter } from "./utils.js";

export function applyShakeEffect(element, intensity = 1, duration = 500) {
    if (!element) return;
    
    // Store the element's original position/transform
    const originalTransform = element.style.transform || '';
    const originalTransition = element.style.transition || '';

    intensity *= settingsMap.shakeEffectScale.value || 1;

    // Scale intensity based on size/damage
    const scaledIntensity = Math.min(10, intensity);
    
    // Apply CSS animation
    element.style.transition = 'transform 50ms ease-in-out';
    
    let shakeCount = 0;
    const maxShakes = Math.ceil(intensity);
    const shakeInterval = 50;
    const interval = setInterval(() => {
        if (shakeCount >= maxShakes) {
            // Ensure element returns to original position
            clearInterval(interval);
            element.style.transform = originalTransform;
            element.style.transition = originalTransition;
            return;
        }
        
        // Random offset for shaking effect
        const xOffset = (Math.random() - 0.5) * 2 * scaledIntensity;
        const yOffset = (Math.random() - 0.5) * 2 * scaledIntensity;
        element.style.transform = `${originalTransform} translate(${xOffset}px, ${yOffset}px)`;
        shakeCount++;
    }, shakeInterval);
    
    // Additional safeguard: ensure element returns to original position after max duration
    setTimeout(() => {
        clearInterval(interval);
        element.style.transform = 'translate(0, 0)';
        element.style.transition = originalTransition;
    }, shakeInterval * (maxShakes + 1)); // Slightly longer than maxShakes * interval time
}

export function addDamageHPBar(element, damage) {
    const hpBarContainer = element.querySelector(".HitpointsBar_hitpointsBar__2vIqC");
    const hpBarFront = hpBarContainer.querySelector(".HitpointsBar_currentHp__5exLr");
    // hpBarFront.style.zIndex = "1";
    const hpBarValue = hpBarContainer.querySelector(".HitpointsBar_hpValue__xNp7m");
    // hpBarValue.style.zIndex = "2";
    const hpStat = hpBarValue.innerHTML.split("/");
    const currentHp = parseInt(hpStat[0]);
    const maxHp = parseInt(hpStat[1]);

    // Insert a HpBar behind and set the color to red
    const hpBarBack = document.createElement("div");
    hpBarBack.className = "HitpointsBar_currentHp__5exLr HitTracker_hpDrop";
    hpBarBack.style.background = "var(--color-warning)";
    hpBarBack.style.position = "absolute";
    hpBarBack.style.top = "0px";
    hpBarBack.style.left = "0px";
    // hpBarBack.style.zIndex = "1"; // Ensure the back bar is below the front bar
    hpBarBack.style.width = `${hpBarFront.offsetWidth}px`;
    hpBarBack.style.height = `${hpBarFront.offsetHeight}px`;
    hpBarBack.style.transformOrigin = "left center";
    hpBarBack.style.transform = `scaleX(${(currentHp + damage) / maxHp})`;
    // add animation to drop down
    hpBarBack.style.transition = "transform 0.5s ease-in-out";
    hpBarFront.parentNode.insertBefore(hpBarBack, hpBarFront); // Insert the back bar before the front bar

    const dropDelay = Math.ceil(settingsMap.damageHpBarDropDelay.value || 300);

    setTimeout(() => {
        hpBarBack.style.transform = `scaleX(0)`;
    }, dropDelay);

    setTimeout(() => {
        hpBarBack.remove();
    }, dropDelay + 500);
}

export function resetAllMonsterSvg() {
    const monsterArea = document.querySelector(".BattlePanel_monstersArea__2dzrY");
    if (monsterArea){
        const monsterSvgs = monsterArea.querySelectorAll(".Icon_icon__2LtL_");
        monsterSvgs.forEach((monsterSvg) => {
            monsterSvg.style.transition = "none";
            monsterSvg.style.transform = "rotate(0deg)";
            monsterSvg.style.opacity = "1";
        });
    }
}

export const deathEffect = {
    default: (element) => {
        const monsterSvg = element.querySelector(".Icon_icon__2LtL_");
        monsterSvg.style.transition = "transform 0.1s ease-in-out";
        monsterSvg.style.transformOrigin = "bottom center";
        monsterSvg.style.transform = "rotate(15deg)";
        setTimeout(() => {
            monsterSvg.style.transition = "transform 0.5s ease-in-out, opacity 0.5s ease-in-out";
            monsterSvg.style.transform = "rotate(-180deg)";
            monsterSvg.style.opacity = "0";
        }, 300);
        // fade out
        // setTimeout(() => {
        //     monsterSvg.style.transition = "opacity 0.5s ease-in-out";
        // }, 800);
    },
    minecraftStyle: (element) => {
        const monsterSvg = element.querySelector(".Icon_icon__2LtL_");
        
        // First get dimensions and viewBox of original SVG
        const svgRect = monsterSvg.getBoundingClientRect();
        const viewBox = monsterSvg.getAttribute('viewBox') || '0 0 24 24'; // 默认值，以防未设置
        
        // Get SVG content before changing anything else
        const svgContent = monsterSvg.innerHTML;
        
        // Create container that will match exact position of original SVG
        const overlayContainer = document.createElement('div');
        overlayContainer.style.position = 'absolute';
        overlayContainer.style.top = '0';
        overlayContainer.style.left = '0';
        overlayContainer.style.width = '100%';
        overlayContainer.style.height = '100%';
        overlayContainer.style.pointerEvents = 'none';
        // overlayContainer.style.zIndex = '5';
        
        // Match the exact positioning and sizing of the original SVG
        const parentBounds = element.getBoundingClientRect();
        const relativeTop = (svgRect.top - parentBounds.top) / parentBounds.height * 100;
        const relativeLeft = (svgRect.left - parentBounds.left) / parentBounds.width * 100;
        const relativeWidth = svgRect.width / parentBounds.width * 100;
        const relativeHeight = svgRect.height / parentBounds.height * 100;
        
        // Create SVG overlay with the same dimensions and position
        const svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgOverlay.setAttribute('width', '100%');
        svgOverlay.setAttribute('height', '100%');
        svgOverlay.setAttribute('viewBox', viewBox);
        svgOverlay.style.position = 'absolute';
        svgOverlay.style.top = `${relativeTop}%`;
        svgOverlay.style.left = `${relativeLeft}%`;
        svgOverlay.style.width = `${relativeWidth}%`;
        svgOverlay.style.height = `${relativeHeight}%`;
        

        setTimeout(() => {
            // Apply rotation to original SVG
            monsterSvg.style.transition = "transform 0.1s ease-in-out";
            monsterSvg.style.transformOrigin = "center left";
            monsterSvg.style.transform = "rotate(15deg)";
            // Apply same transform as original to maintain alignment
            svgOverlay.style.transition = "transform 0.1s ease-in-out";
            svgOverlay.style.transform = "rotate(15deg)";
            svgOverlay.style.transformOrigin = "center left";
        }, 300);
        
        // Create defs for the mask
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
        mask.setAttribute('id', `monster-mask-${Date.now()}`); // Unique ID
        
        // Clone the original SVG content for the mask
        const maskContent = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        maskContent.innerHTML = svgContent;
        
        // Set all elements in mask to white (opaque parts of mask)
        const maskElements = maskContent.querySelectorAll('*');
        maskElements.forEach(el => {
            if (el.tagName === 'path' || el.tagName === 'circle' || el.tagName === 'rect' || 
                el.tagName === 'polygon' || el.tagName === 'polyline') {
                el.setAttribute('fill', 'white');
                el.setAttribute('stroke', 'white');
            }
        });
        
        mask.appendChild(maskContent);
        defs.appendChild(mask);
        svgOverlay.appendChild(defs);
        
        // Create the red overlay rectangle that will be masked
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', 'rgba(255, 0, 0, 0.6)'); // slightly more opaque
        rect.setAttribute('mask', `url(#${mask.id})`);
        
        svgOverlay.appendChild(rect);
        overlayContainer.appendChild(svgOverlay);
        
        // Add to parent element (usually the monster container)
        element.style.position = 'relative'; // Ensure positioning context
        element.appendChild(overlayContainer);
        const svgCenter = getElementCenter(element);
        
        // Make overlay match any subsequent animations of the original SVG
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style' || 
                    mutation.attributeName === 'transform') {
                    // Copy transform properties to keep in sync
                    svgOverlay.style.transform = monsterSvg.style.transform;
                    svgOverlay.style.opacity = monsterSvg.style.opacity;
                    svgOverlay.style.transition = monsterSvg.style.transition;
                }
            });
        });
        
        // Start observing the original SVG for changes
        observer.observe(monsterSvg, { 
            attributes: true,
            attributeFilter: ['style', 'transform'] 
        });
        
        // Fade out after delay
        setTimeout(() => {
            // monsterSvg.style.transition = "opacity 0.5s ease-in-out";
            monsterSvg.style.opacity = "0";
            
            // Remove overlay and stop observer after animation
            observer.disconnect();
            overlayContainer.remove();

            let effects = [];
            const p = {
                x: svgCenter.x,
                y: svgCenter.y + 30,
                color: "rgba(0, 0, 0, 0.6)",
                size: 0.2,
            };
            for (let i = 0; i < 25; i++) {
                p.life = onHitEffectsMap.pixelSmoke.life({size: 0.5});
                effects.push({
                    x: onHitEffectsMap.pixelSmoke.x(p),
                    y: onHitEffectsMap.pixelSmoke.y(p),
                    angle: onHitEffectsMap.pixelSmoke.angle(p),
                    color: onHitEffectsMap.pixelSmoke.color(p),
                    size: onHitEffectsMap.pixelSmoke.size(p),
                    speed: onHitEffectsMap.pixelSmoke.speed({size: 5}),
                    gravity: onHitEffectsMap.pixelSmoke.gravity(p),
                    life: p.life,
                    maxLife: p.life,
                    draw: onHitEffectsMap.pixelSmoke.draw,
                });
            }

            // Add particle effect
            addEffect({
                effects: effects,
                active: true,
                lifespan: 500,
            })
        }, 1000);
    },
}