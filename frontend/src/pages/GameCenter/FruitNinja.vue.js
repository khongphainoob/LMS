/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onUnmounted } from 'vue';
import { call } from 'frappe-ui';
import { Clock, Heart, Star } from 'lucide-vue-next';
const gameState = ref('start');
const score = ref(0);
const lives = ref(3);
const combo = ref(0);
const slicedCount = ref(0);
const timeLeft = ref(40);
const statusText = ref('Ready to slice');
const visibleFruits = ref([]);
const targetScore = 250;
let spawnTimer = null;
let countdownTimer = null;
let fruitId = 0;
const fruitPool = [
    { emoji: '🍎', points: 10 },
    { emoji: '🍊', points: 12 },
    { emoji: '🍇', points: 14 },
    { emoji: '🍓', points: 16 },
    { emoji: '🍍', points: 20 },
    { emoji: '🍉', points: 18 },
];
const finishTitle = computed(() => (score.value >= targetScore ? 'Perfect Slice!' : 'Game Over'));
const timePercent = computed(() => Math.max((timeLeft.value / 40) * 100, 0));
function resetGame() {
    score.value = 0;
    lives.value = 3;
    combo.value = 0;
    slicedCount.value = 0;
    timeLeft.value = 40;
    statusText.value = 'The orchard is open';
    visibleFruits.value = [];
    clearInterval(spawnTimer);
    clearInterval(countdownTimer);
    spawnTimer = null;
    countdownTimer = null;
}
function randomFruit() {
    const base = fruitPool[Math.floor(Math.random() * fruitPool.length)];
    return {
        id: ++fruitId,
        ...base,
        x: 10 + Math.random() * 75,
        y: 12 + Math.random() * 55,
        spin: Math.floor(Math.random() * 360),
        expiresAt: Date.now() + 1100,
    };
}
function spawnFruit() {
    if (gameState.value !== 'playing')
        return;
    visibleFruits.value.push(randomFruit());
    visibleFruits.value = visibleFruits.value.filter((fruit) => {
        if (fruit.expiresAt <= Date.now()) {
            lives.value -= 1;
            combo.value = 0;
            statusText.value = 'Missed!';
            return false;
        }
        return true;
    });
    if (lives.value <= 0)
        endGame('Out of lives');
}
function startGame() {
    resetGame();
    gameState.value = 'playing';
    spawnFruit();
    spawnTimer = setInterval(spawnFruit, 850);
    countdownTimer = setInterval(() => {
        timeLeft.value -= 1;
        if (timeLeft.value <= 0)
            endGame('Time is up');
    }, 1000);
}
function endGame(status) {
    statusText.value = status;
    gameState.value = 'finished';
    recordSession(status);
    clearInterval(spawnTimer);
    clearInterval(countdownTimer);
    spawnTimer = null;
    countdownTimer = null;
}
function recordSession(result) {
    call('lms.lms.api.record_game_session', {
        game: 'Fruit Ninja',
        score: score.value,
        max_score: targetScore,
        result,
        metadata: {
            combo: combo.value,
            sliced_count: slicedCount.value,
        },
    });
}
function sliceFruit(fruit) {
    if (gameState.value !== 'playing')
        return;
    visibleFruits.value = visibleFruits.value.filter((item) => item.id !== fruit.id);
    combo.value += 1;
    slicedCount.value += 1;
    const points = fruit.points + combo.value * 2;
    score.value += points;
    statusText.value = '+' + points + ' pts';
    if (score.value >= targetScore) {
        endGame('Perfect Slice!');
    }
}
onUnmounted(() => {
    clearInterval(spawnTimer);
    clearInterval(countdownTimer);
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-4" },
});
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Fruit Ninja'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-1.5 text-sm text-ink-gray-6" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Clock} */
Clock;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "size-4" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "size-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.timeLeft);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-1.5 text-sm text-ink-gray-6" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.Star} */
Star;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ class: "size-4 text-ink-amber-5" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "size-4 text-ink-amber-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-amber-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.score);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-1.5 text-sm text-ink-gray-6" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
let __VLS_10;
/** @ts-ignore @type { | typeof __VLS_components.Heart} */
Heart;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    ...{ class: "size-4 text-red-500" },
}));
const __VLS_12 = __VLS_11({
    ...{ class: "size-4 text-red-500" },
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.lives);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.resetGame) },
    ...{ class: "text-xs px-3 py-1.5 rounded-md bg-surface-gray-2 hover:bg-surface-gray-3 text-ink-gray-7 transition-colors" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
(__VLS_ctx.__('Reset'));
if (__VLS_ctx.gameState === 'start') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-4xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "text-lg font-bold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Fruit Ninja Quiz'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Slice the fruit that matches the prompt before it disappears.'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.startGame) },
        ...{ class: "px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-ink-blue-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-ink-blue-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    (__VLS_ctx.__('Start Game'));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl p-5 space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between text-xs text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('Combo: {0}').format(__VLS_ctx.combo));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.statusText);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-full h-1.5 rounded-full bg-surface-gray-2 overflow-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-full rounded-full bg-ink-blue-4 transition-all duration-300" },
        ...{ style: ({ width: __VLS_ctx.timePercent + '%' }) },
    });
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-ink-blue-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative min-h-[360px] overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-900 via-green-900 to-slate-900 p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[360px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-emerald-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-green-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_white,_transparent_40%)]" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[radial-gradient(circle_at_top,_white,_transparent_40%)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-x-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-24']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-black/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
    if (__VLS_ctx.gameState === 'playing') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "absolute inset-0" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
        for (const [fruit] of __VLS_vFor((__VLS_ctx.visibleFruits))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.gameState === 'start'))
                            return;
                        if (!(__VLS_ctx.gameState === 'playing'))
                            return;
                        __VLS_ctx.sliceFruit(fruit);
                        // @ts-ignore
                        [__, __, __, __, __, __, timeLeft, score, lives, resetGame, gameState, gameState, startGame, combo, statusText, timePercent, visibleFruits, sliceFruit,];
                    } },
                key: (fruit.id),
                ...{ class: "absolute flex h-16 w-16 select-none items-center justify-center rounded-full text-3xl shadow-2xl transition-transform duration-150 hover:scale-110 active:scale-95" },
                ...{ style: ({ left: fruit.x + '%', top: fruit.y + '%', transform: `rotate(${fruit.spin}deg)` }) },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
            /** @type {__VLS_StyleScopedClasses['select-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
            /** @type {__VLS_StyleScopedClasses['duration-150']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:scale-110']} */ ;
            /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
            (fruit.emoji);
            // @ts-ignore
            [];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-4 left-4 right-4 flex items-center justify-between text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs uppercase tracking-[0.18em] text-white/60" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-[0.18em]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white/60']} */ ;
    (__VLS_ctx.__('Slices'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm font-medium" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.score);
    (__VLS_ctx.targetScore);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs text-ink-gray-5 flex items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('Hit fruit before it falls away'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('Lives lose on misses'));
}
if (__VLS_ctx.gameState === 'finished') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-4xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
    (__VLS_ctx.score >= __VLS_ctx.targetScore ? '🏆' : '🍉');
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "text-lg font-bold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.finishTitle);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Final score: {0}').format(__VLS_ctx.score));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Fruits sliced: {0}').format(__VLS_ctx.slicedCount));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.startGame) },
        ...{ class: "px-4 py-2 rounded-lg bg-ink-blue-4 text-white text-sm font-medium hover:bg-ink-blue-5 transition-colors" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-ink-blue-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-ink-blue-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    (__VLS_ctx.__('Play Again'));
}
// @ts-ignore
[__, __, __, __, __, __, score, score, score, gameState, startGame, targetScore, targetScore, finishTitle, slicedCount,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
