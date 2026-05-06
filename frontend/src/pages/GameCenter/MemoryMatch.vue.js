/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onUnmounted, computed } from "vue";
import { Timer, MousePointerClick, HelpCircle } from "lucide-vue-next";
const gridSize = ref(4);
const cards = ref([]);
const flippedIndices = ref([]);
const isChecking = ref(false);
const moves = ref(0);
const elapsedTime = ref(0);
const gameWon = ref(false);
let timerInterval = null;
const emojis = [
    { emoji: "\u{1F4DA}", label: "Book" },
    { emoji: "\u{1F4BB}", label: "Code" },
    { emoji: "\u{1F9E0}", label: "Brain" },
    { emoji: "\u{1F3AF}", label: "Target" },
    { emoji: "\u{1F680}", label: "Rocket" },
    { emoji: "\u{1F4A1}", label: "Idea" },
    { emoji: "\u{1F48E}", label: "Gem" },
    { emoji: "\u{1F525}", label: "Fire" },
    { emoji: "\u{1F916}", label: "Robot" },
    { emoji: "\u{1F393}", label: "Grad" },
    { emoji: "\u{1F4CA}", label: "Chart" },
    { emoji: "\u{1F52C}", label: "Science" },
    { emoji: "\u{270F}\u{FE0F}", label: "Edit" },
    { emoji: "\u{1F3B5}", label: "Music" },
    { emoji: "\u{1F308}", label: "Rainbow" },
    { emoji: "\u{1F31F}", label: "Star" },
    { emoji: "\u{1F0CF}", label: "Puzzle" },
    { emoji: "\u{1F6E0}\u{FE0F}", label: "Tools" },
];
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function initGame() {
    const pairCount = Math.floor((gridSize.value * gridSize.value) / 2);
    const selected = shuffleArray(emojis).slice(0, pairCount);
    const paired = shuffleArray([...selected, ...selected]);
    cards.value = paired.map((item) => ({
        ...item,
        flipped: false,
        matched: false,
    }));
    flippedIndices.value = [];
    isChecking.value = false;
    moves.value = 0;
    elapsedTime.value = 0;
    gameWon.value = false;
    clearInterval(timerInterval);
    timerInterval = null;
}
function startTimer() {
    if (timerInterval)
        return;
    timerInterval = setInterval(() => {
        elapsedTime.value++;
    }, 1000);
}
function flipCard(index) {
    if (isChecking.value ||
        cards.value[index].flipped ||
        cards.value[index].matched ||
        flippedIndices.value.length >= 2)
        return;
    startTimer();
    cards.value[index].flipped = true;
    flippedIndices.value.push(index);
    if (flippedIndices.value.length === 2) {
        moves.value++;
        isChecking.value = true;
        const [i1, i2] = flippedIndices.value;
        if (cards.value[i1].label === cards.value[i2].label) {
            cards.value[i1].matched = true;
            cards.value[i2].matched = true;
            flippedIndices.value = [];
            isChecking.value = false;
            if (cards.value.every((c) => c.matched)) {
                gameWon.value = true;
                clearInterval(timerInterval);
            }
        }
        else {
            setTimeout(() => {
                cards.value[i1].flipped = false;
                cards.value[i2].flipped = false;
                flippedIndices.value = [];
                isChecking.value = false;
            }, 800);
        }
    }
}
function getCardClass(card) {
    if (card.matched) {
        return "bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 shadow-sm";
    }
    if (card.flipped) {
        return "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 shadow-md scale-105";
    }
    return "bg-surface-white border-2 border-outline-gray-2 hover:border-outline-gray-3 hover:shadow-md hover:-translate-y-0.5 active:scale-95";
}
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}
function resetGame() {
    initGame();
}
function changeGridSize(size) {
    gridSize.value = size;
    initGame();
}
onUnmounted(() => {
    clearInterval(timerInterval);
});
initGame();
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
(__VLS_ctx.__("Memory Match"));
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
/** @ts-ignore @type { | typeof __VLS_components.Timer} */
Timer;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "size-4" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "size-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.formatTime(__VLS_ctx.elapsedTime));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-1.5 text-sm text-ink-gray-6" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.MousePointerClick} */
MousePointerClick;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ class: "size-4" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "size-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.moves);
(__VLS_ctx.__("moves"));
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
(__VLS_ctx.__("Reset"));
if (__VLS_ctx.gameWon) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl p-6 text-center" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-4xl mb-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "text-lg font-bold text-ink-gray-9 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    (__VLS_ctx.__("Congratulations!"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-ink-gray-5 mb-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    (__VLS_ctx.__("Completed in {0} moves and {1}").format(__VLS_ctx.moves, __VLS_ctx.formatTime(__VLS_ctx.elapsedTime)));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.resetGame) },
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
    (__VLS_ctx.__("Play Again"));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid gap-2.5" },
    ...{ style: ({
            'grid-template-columns': `repeat(${__VLS_ctx.gridSize}, minmax(0, 1fr))`,
        }) },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2.5']} */ ;
for (const [card, index] of __VLS_vFor((__VLS_ctx.cards))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.flipCard(index);
                // @ts-ignore
                [__, __, __, __, __, __, formatTime, formatTime, elapsedTime, elapsedTime, moves, moves, resetGame, resetGame, gameWon, gridSize, cards, flipCard,];
            } },
        key: (index),
        disabled: (__VLS_ctx.isChecking || card.matched),
        ...{ class: "aspect-square rounded-xl text-2xl font-bold transition-all duration-500 cursor-pointer select-none" },
        ...{ class: (__VLS_ctx.getCardClass(card)) },
    });
    /** @type {__VLS_StyleScopedClasses['aspect-square']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['select-none']} */ ;
    if (card.flipped || card.matched) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col items-center justify-center h-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (card.emoji);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[10px] mt-0.5 opacity-70" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['opacity-70']} */ ;
        (card.label);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-center h-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        let __VLS_10;
        /** @ts-ignore @type { | typeof __VLS_components.HelpCircle} */
        HelpCircle;
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
            ...{ class: "size-6 text-ink-gray-4" },
        }));
        const __VLS_12 = __VLS_11({
            ...{ class: "size-6 text-ink-gray-4" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_11));
        /** @type {__VLS_StyleScopedClasses['size-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-4']} */ ;
    }
    // @ts-ignore
    [isChecking, getCardClass,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-center gap-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
for (const [size] of __VLS_vFor(([3, 4, 5, 6]))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.changeGridSize(size);
                // @ts-ignore
                [changeGridSize,];
            } },
        key: (size),
        ...{ class: "px-3 py-1 rounded text-xs font-medium transition-colors" },
        ...{ class: (__VLS_ctx.gridSize === size ? 'bg-ink-blue-4 text-white' : 'bg-surface-gray-2 text-ink-gray-6 hover:bg-surface-gray-3') },
    });
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    (size);
    (size);
    // @ts-ignore
    [gridSize,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
