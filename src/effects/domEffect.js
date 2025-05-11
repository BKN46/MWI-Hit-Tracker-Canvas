import { settingsMap } from "../setting.js";

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

export function applyDeadEffect(element) {
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
}