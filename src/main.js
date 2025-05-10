import { waitForSetttins, settingsMap } from "./setting.js";
import { animate, createProjectile } from "./draw.js";

// #region Setting
waitForSetttins();

hookWS();

// #region Hook WS
function hookWS() {
    const dataProperty = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "data");
    const oriGet = dataProperty.get;

    dataProperty.get = hookedGet;
    Object.defineProperty(MessageEvent.prototype, "data", dataProperty);

    function hookedGet() {
        const socket = this.currentTarget;
        if (!(socket instanceof WebSocket)) {
            return oriGet.call(this);
        }
        if (socket.url.indexOf("api.milkywayidle.com/ws") <= -1 && socket.url.indexOf("api-test.milkywayidle.com/ws") <= -1) {
            return oriGet.call(this);
        }

        const message = oriGet.call(this);
        Object.defineProperty(this, "data", { value: message }); // Anti-loop

        return handleMessage(message);
    }
}

let monstersHP = [];
let monstersMP = [];
let playersHP = [];
let playersMP = [];
let playersAbility = [];

function handleMessage(message) {
    let obj = JSON.parse(message);
    if (obj && obj.type === "new_battle") {
        monstersHP = obj.monsters.map((monster) => monster.currentHitpoints);
        monstersMP = obj.monsters.map((monster) => monster.currentManapoints);
        playersHP = obj.players.map((player) => player.currentHitpoints);
        playersMP = obj.players.map((player) => player.currentManapoints);
    } else if (obj && obj.type === "battle_updated" && monstersHP.length) {
        const mMap = obj.mMap;
        const pMap = obj.pMap;
        const monsterIndices = Object.keys(obj.mMap);
        const playerIndices = Object.keys(obj.pMap);

        let castMonster = -1;
        monsterIndices.forEach((monsterIndex) => {
            if(mMap[monsterIndex].cMP < monstersMP[monsterIndex]){castMonster = monsterIndex;}
            monstersMP[monsterIndex] = mMap[monsterIndex].cMP;
        });
        let castPlayer = -1;
        playerIndices.forEach((userIndex) => {
            if(pMap[userIndex].cMP < playersMP[userIndex]){castPlayer = userIndex;}
            if(pMap[userIndex].cMP > playersMP[userIndex]){
                registProjectile({
                    from: userIndex,
                    to: userIndex,
                    hpDiff: pMap[userIndex].cMP-playersMP[userIndex],
                    reversed: false,
                    abilityHrid: 'selfManaRegen',
                    toPlayer: true
                });
            }
            playersMP[userIndex] = pMap[userIndex].cMP;
            if(pMap[userIndex].abilityHrid){playersAbility[userIndex] = pMap[userIndex].abilityHrid;}
        });

        monstersHP.forEach((mHP, mIndex) => {
            const monster = mMap[mIndex];
            if (monster) {
                const hpDiff = mHP - monster.cHP;
                monstersHP[mIndex] = monster.cHP;
                if (hpDiff > 0 && playerIndices.length > 0) {
                    const isCrit = monster.dmgCounter == monster.critCounter;
                    if (playerIndices.length > 1) {
                        playerIndices.forEach((userIndex) => {
                            if(userIndex === castPlayer) {
                                registProjectile({
                                    from: userIndex,
                                    to: mIndex,
                                    hpDiff: hpDiff,
                                    reversed: false,
                                    abilityHrid: playersAbility[userIndex],
                                    toPlayer: false,
                                    isCrit: isCrit,
                                });
                            }
                        });
                    } else {
                        registProjectile({
                            from: playerIndices[0],
                            to: mIndex,
                            hpDiff: hpDiff,
                            reversed: false,
                            abilityHrid: playersAbility[playerIndices[0]],
                            toPlayer: false,
                            isCrit: isCrit,
                        });
                    }
                }
            }
        });

        playersHP.forEach((pHP, pIndex) => {
            const player = pMap[pIndex];
            if (player) {
                const hpDiff = pHP - player.cHP;
                playersHP[pIndex] = player.cHP;
                if (hpDiff > 0 && monsterIndices.length > 0) {
                    const isCrit = player.dmgCounter == player.critCounter;
                    if (monsterIndices.length > 1) {
                        monsterIndices.forEach((monsterIndex) => {
                            if(monsterIndex === castMonster) {
                                registProjectile({
                                    from: pIndex,
                                    to: monsterIndex,
                                    hpDiff: hpDiff,
                                    reversed: true,
                                    abilityHrid: 'autoAttack',
                                    toPlayer: false,
                                    isCrit: isCrit,
                                });
                            }
                        });
                    } else {
                        registProjectile({
                            from: pIndex,
                            to: monsterIndices[0],
                            hpDiff: hpDiff,
                            reversed: true,
                            abilityHrid: 'autoAttack',
                            toPlayer: false,
                            isCrit: isCrit,
                        });
                    }
                } else if (hpDiff < 0 ) {
                    if (castPlayer > -1){
                        registProjectile({
                            from: castPlayer,
                            to: pIndex,
                            hpDiff: -hpDiff,
                            reversed: false,
                            abilityHrid: 'heal',
                            toPlayer: true
                        });
                    }else{
                        registProjectile({
                            from: pIndex,
                            to: pIndex,
                            hpDiff: -hpDiff,
                            reversed: false,
                            abilityHrid: 'selfHeal',
                            toPlayer: true
                        });
                    }
                }
            }
        });

    } else if (obj && obj.type === "battle_updated") {
        const pMap = obj.pMap;
        const playerIndices = Object.keys(obj.pMap);
        playerIndices.forEach((userIndex) => {
            if(pMap[userIndex].abilityHrid){playersAbility[userIndex] = pMap[userIndex].abilityHrid;}
        });

        playersHP.forEach((pHP, pIndex) => {
            const player = pMap[pIndex];
            if (player) {
                const hpDiff = pHP - player.cHP;
                playersHP[pIndex] = player.cHP;
                if (hpDiff < 0 ) {
                    registProjectile({
                        from: pIndex,
                        to: pIndex,
                        hpDiff: -hpDiff,
                        reversed: false,
                        abilityHrid: 'selfHeal',
                        toPlayer: true
                    });
                }
            }
        });

        playersMP.forEach((pMP, pIndex) => {
            const player = pMap[pIndex];
            if (player) {
                const mpDiff = pMP - player.pMP;
                playersMP[pIndex] = player.pMP;
                if (mpDiff < 0 ) {
                    registProjectile({
                        from: pIndex,
                        to: pIndex,
                        hpDiff: -mpDiff,
                        reversed: false,
                        abilityHrid: 'selfManaRegen',
                        toPlayer: true
                    });
                }
            }
        });
    }
    return message;
}

// #region Main Logic

// 动画效果
function registProjectile({
    from,
    to,
    hpDiff,
    reversed = false,
    abilityHrid = "default",
    toPlayer = true,
    isCrit = false,
}) {
    if (reversed){
        if (!settingsMap.tracker6.isTrue) {
            return null;
        }
    } else {
        if (!settingsMap["tracker"+from].isTrue) {
            return null;
        }
    }
    if (["selfHeal", "selfManaRegen"].indexOf(abilityHrid) > -1 && !settingsMap.showSelfRegen.value) {
        return null;
    }

    const container = document.querySelector(".BattlePanel_playersArea__vvwlB");
    if (container && container.children.length > 0) {
        const playersContainer = container.children[0];
        const effectFrom = playersContainer.children[from];
        const monsterContainer = document.querySelector(".BattlePanel_monstersArea__2dzrY").children[0];
        const effectTo = toPlayer ? playersContainer.children[to] : monsterContainer.children[to];

        const trackerSetting = reversed ? settingsMap[`tracker6`] : settingsMap["tracker"+from];
        let lineColor = "rgba("+trackerSetting.r+", "+trackerSetting.g+", "+trackerSetting.b+", 1)";

        if (!reversed) {
            createProjectile(effectFrom, effectTo, lineColor, 1, hpDiff, abilityHrid, isCrit);
        } else {
            createProjectile(effectTo, effectFrom, lineColor, 1, hpDiff, abilityHrid, isCrit);
        }
    }

}

// 启动动画
animate();