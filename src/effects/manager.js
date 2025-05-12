export let activeEffects = [];

export function addEffect({
    effects,
    active = true,
    lifespan = 120,
    color = "rgba(255, 255, 255, 0.8)",
    otherInfo = {},
    isFpsOptimization = false,
}) {
    activeEffects.push({
        effects,
        active,
        life: 0,
        lifespan,
        color,
        otherInfo,
        isFpsOptimization,
    });
}

export function clearEffects() {
    activeEffects.splice(0, activeEffects.length);
}
