/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, reactive } from "vue";
import { Star, Zap } from "lucide-vue-next";
const score = ref(0);
const currentRound = ref(0);
const sortedItems = ref([]);
const feedback = ref(null);
const isDragOver = ref(false);
const finished = ref(false);
const roundResults = ref([]);
let dragData = null;
const rounds = [
    {
        type: "number",
        instruction: "Arrange the numbers from smallest to largest",
        items: [
            { id: "n1", value: "42", order: 3 },
            { id: "n2", value: "7", order: 1 },
            { id: "n3", value: "15", order: 2 },
            { id: "n4", value: "89", order: 4 },
            { id: "n5", value: "3", order: 0 },
        ],
        label: "\u{1F522} Numbers",
    },
    {
        type: "alpha",
        instruction: "Arrange the words in alphabetical order",
        items: [
            { id: "a1", value: "Zebra", order: 4 },
            { id: "a2", value: "Apple", order: 0 },
            { id: "a3", value: "Mango", order: 2 },
            { id: "a4", value: "Banana", order: 1 },
            { id: "a5", value: "Peach", order: 3 },
        ],
        label: "\u{1F4D6} Alphabetical",
    },
    {
        type: "timeline",
        instruction: "Arrange the events in chronological order",
        items: [
            { id: "t1", value: "Moon Landing (1969)", order: 3 },
            { id: "t2", value: "World Wide Web (1991)", order: 4 },
            { id: "t3", value: "First Flight (1903)", order: 0 },
            { id: "t4", value: "Penicillin (1928)", order: 1 },
            { id: "t5", value: "DNA Discovery (1953)", order: 2 },
        ],
        label: "\u{1F4C5} Timeline",
    },
    {
        type: "size",
        instruction: "Arrange from smallest to largest",
        items: [
            { id: "s1", value: "Ant", order: 0 },
            { id: "s2", value: "Elephant", order: 4 },
            { id: "s3", value: "Dog", order: 2 },
            { id: "s4", value: "Cat", order: 1 },
            { id: "s5", value: "Horse", order: 3 },
        ],
        label: "\u{1F422} Size Order",
    },
    {
        type: "science",
        instruction: "Arrange planets from closest to farthest from the Sun",
        items: [
            { id: "p1", value: "Earth", order: 2 },
            { id: "p2", value: "Mars", order: 3 },
            { id: "p3", value: "Mercury", order: 0 },
            { id: "p4", value: "Jupiter", order: 4 },
            { id: "p5", value: "Venus", order: 1 },
        ],
        label: "\u{1F30C} Planets",
    },
];
const availableItems = computed(() => {
    const sortedIds = new Set(sortedItems.value.map((i) => i.id));
    return rounds[currentRound.value].items.filter((i) => !sortedIds.has(i.id));
});
function getRoundLabel() {
    return rounds[currentRound.value].label;
}
function onItemDragStart(e, itemOrIdx, fromSorted) {
    let item;
    if (fromSorted) {
        item = sortedItems.value[itemOrIdx];
        sortedItems.value.splice(itemOrIdx, 1);
    }
    else {
        item = itemOrIdx;
    }
    e.dataTransfer.setData("text/plain", item.id);
    dragData = item;
}
function onDrop() {
    isDragOver.value = false;
}
function addToSorted(item) {
    const exists = sortedItems.value.find((i) => i.id === item.id);
    if (!exists) {
        sortedItems.value.push({ ...item });
    }
}
function clearSorted() {
    sortedItems.value = [];
    feedback.value = null;
}
function submitAnswer() {
    const correct = rounds[currentRound.value].items;
    const isCorrect = sortedItems.value.every((item, idx) => item.order === correct[idx].order);
    if (isCorrect) {
        score.value += 100;
        feedback.value = { correct: true, message: __("Perfect! +100 pts \u{1F389}") };
        roundResults.value.push(true);
    }
    else {
        const correctCount = sortedItems.value.filter((item, idx) => item.order === correct[idx].order).length;
        const pts = correctCount * 20;
        score.value += pts;
        feedback.value = { correct: false, message: __("Partially correct! +" + pts + " pts (" + correctCount + "/" + correct.length + ")") };
        roundResults.value.push(false);
    }
    setTimeout(() => {
        if (currentRound.value < rounds.length - 1) {
            currentRound.value++;
            sortedItems.value = [];
            feedback.value = null;
        }
        else {
            finished.value = true;
        }
    }, 1500);
}
function resetGame() {
    score.value = 0;
    currentRound.value = 0;
    sortedItems.value = [];
    feedback.value = null;
    finished.value = false;
    roundResults.value = [];
}
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
(__VLS_ctx.__("Drag & Drop Sort"));
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
/** @ts-ignore @type { | typeof __VLS_components.Star} */
Star;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "size-4 text-ink-amber-4" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "size-4 text-ink-amber-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-amber-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.score);
(__VLS_ctx.rounds.length * 100);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-1.5 text-sm text-ink-gray-6" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.Zap} */
Zap;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ class: "size-4 text-ink-blue-4" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "size-4 text-ink-blue-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['size-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-blue-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.currentRound + 1);
(__VLS_ctx.rounds.length);
if (!__VLS_ctx.finished) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-outline-gray-2 bg-surface-white rounded-xl p-5" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-medium text-ink-blue-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-blue-4']} */ ;
    (__VLS_ctx.getRoundLabel());
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "text-sm text-center text-ink-gray-7 mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    (__VLS_ctx.rounds[__VLS_ctx.currentRound].instruction);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onDragover: (...[$event]) => {
                if (!(!__VLS_ctx.finished))
                    return;
                __VLS_ctx.isDragOver = true;
                // @ts-ignore
                [__, score, rounds, rounds, rounds, currentRound, currentRound, finished, getRoundLabel, isDragOver,];
            } },
        ...{ onDragleave: (...[$event]) => {
                if (!(!__VLS_ctx.finished))
                    return;
                __VLS_ctx.isDragOver = false;
                // @ts-ignore
                [isDragOver,];
            } },
        ...{ onDrop: (__VLS_ctx.onDrop) },
        ...{ class: "flex gap-2 mb-5 p-3 rounded-xl border-2 border-dashed transition-colors min-h-[56px] items-center" },
        ...{ class: (__VLS_ctx.isDragOver ? 'border-ink-blue-4 bg-blue-50 dark:bg-blue-900/10' : 'border-outline-gray-3 bg-surface-gray-1') },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[56px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    for (const [item, idx] of __VLS_vFor((__VLS_ctx.sortedItems))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onDragstart: (...[$event]) => {
                    if (!(!__VLS_ctx.finished))
                        return;
                    __VLS_ctx.onItemDragStart($event, idx, true);
                    // @ts-ignore
                    [isDragOver, onDrop, sortedItems, onItemDragStart,];
                } },
            ...{ onDragover: () => { } },
            key: (item.id),
            ...{ class: "flex items-center gap-1 bg-ink-blue-4 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-sm cursor-grab active:cursor-grabbing" },
            draggable: "true",
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-ink-blue-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-grab']} */ ;
        /** @type {__VLS_StyleScopedClasses['active:cursor-grabbing']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs opacity-60 mr-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['opacity-60']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
        (idx + 1);
        (item.value);
        // @ts-ignore
        [];
    }
    if (!__VLS_ctx.sortedItems.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-full text-center text-sm text-ink-gray-4 py-1" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        (__VLS_ctx.__("Drop items here in order"));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex gap-2 flex-wrap justify-center" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.availableItems))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onDragstart: (...[$event]) => {
                    if (!(!__VLS_ctx.finished))
                        return;
                    __VLS_ctx.onItemDragStart($event, item, false);
                    // @ts-ignore
                    [__, sortedItems, onItemDragStart, availableItems,];
                } },
            ...{ onDragover: () => { } },
            key: (item.id),
            ...{ class: "px-3 py-2 rounded-lg text-sm font-medium bg-surface-white border-2 border-outline-gray-2 shadow-sm cursor-grab active:cursor-grabbing hover:border-outline-gray-3 hover:shadow-md hover:-translate-y-0.5 transition-all" },
            draggable: "true",
        });
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-grab']} */ ;
        /** @type {__VLS_StyleScopedClasses['active:cursor-grabbing']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-outline-gray-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:-translate-y-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        (item.value);
        // @ts-ignore
        [];
    }
    if (!__VLS_ctx.availableItems.length && !__VLS_ctx.sortedItems.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm text-ink-gray-4" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-4']} */ ;
        (__VLS_ctx.__("No items left"));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-center gap-3 mt-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.clearSorted) },
        ...{ class: "px-3 py-1.5 text-xs rounded-lg bg-surface-gray-2 text-ink-gray-6 hover:bg-surface-gray-3 transition-colors" },
    });
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    (__VLS_ctx.__("Clear"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.submitAnswer) },
        disabled: (__VLS_ctx.sortedItems.length !== __VLS_ctx.rounds[__VLS_ctx.currentRound].items.length),
        ...{ class: "px-4 py-1.5 text-xs rounded-lg bg-ink-blue-4 text-white font-medium hover:bg-ink-blue-5 transition-colors disabled:opacity-40" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-ink-blue-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-ink-blue-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-40']} */ ;
    (__VLS_ctx.__("Submit"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-3 flex justify-center gap-2 flex-wrap" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.availableItems))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.finished))
                        return;
                    __VLS_ctx.addToSorted(item);
                    // @ts-ignore
                    [__, __, __, rounds, currentRound, sortedItems, sortedItems, availableItems, availableItems, clearSorted, submitAnswer, addToSorted,];
                } },
            key: ('click-' + item.id),
            ...{ class: "text-xs px-2.5 py-1 rounded-md bg-surface-gray-2 text-ink-gray-6 hover:bg-surface-gray-3 transition-colors" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        (item.value);
        // @ts-ignore
        [];
    }
    let __VLS_10;
    /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
    transition;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        enterActiveClass: "transition-all duration-300",
        enterFromClass: "opacity-0 -translate-y-2",
        leaveActiveClass: "transition-all duration-200",
        leaveToClass: "opacity-0",
    }));
    const __VLS_12 = __VLS_11({
        enterActiveClass: "transition-all duration-300",
        enterFromClass: "opacity-0 -translate-y-2",
        leaveActiveClass: "transition-all duration-200",
        leaveToClass: "opacity-0",
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    const { default: __VLS_15 } = __VLS_13.slots;
    if (__VLS_ctx.feedback) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-center mt-4" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm font-medium" },
            ...{ class: (__VLS_ctx.feedback.correct ? 'text-green-600' : 'text-red-500') },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (__VLS_ctx.feedback.message);
    }
    // @ts-ignore
    [feedback, feedback, feedback,];
    var __VLS_13;
}
if (__VLS_ctx.finished) {
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
    (__VLS_ctx.score >= __VLS_ctx.rounds.length * 80 ? "\u{1F3C6}" : __VLS_ctx.score >= __VLS_ctx.rounds.length * 40 ? "\u{1F31F}" : "\u{1F4AA}");
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "text-lg font-bold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__("All Rounds Complete!"));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-3xl font-bold text-ink-blue-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-blue-4']} */ ;
    (__VLS_ctx.score);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__("Correct order in {0}/{1} rounds").format(__VLS_ctx.roundResults.filter(Boolean).length, __VLS_ctx.rounds.length));
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
// @ts-ignore
[__, __, __, score, score, score, rounds, rounds, rounds, finished, roundResults, resetGame,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
