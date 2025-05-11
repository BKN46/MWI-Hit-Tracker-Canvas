export let activeEffects = [];

export function addEffect(effectData = {
    effects,
    active: true,
    count: 1,
    lifespan: 120,
    color: "rgba(255, 255, 255, 0.8)",
    otherInfo: {},
}) {
    activeEffects.push(effectData);
}
