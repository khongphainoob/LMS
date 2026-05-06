/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog } from 'frappe-ui';
import { onMounted, nextTick, ref } from 'vue';
import Link from '@/components/Controls/Link.vue';
const show = ref(false);
const exercise = ref(null);
const props = defineProps({
    onSave: {
        type: Function,
        required: true,
    },
});
onMounted(async () => {
    await nextTick();
    show.value = true;
});
const saveExercise = () => {
    props.onSave(exercise.value);
    show.value = false;
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Add a programming exercise to your lesson'),
        size: 'xl',
        actions: [
            {
                label: __VLS_ctx.__('Save'),
                variant: 'solid',
                onClick: () => {
                    __VLS_ctx.saveExercise();
                },
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Add a programming exercise to your lesson'),
        size: 'xl',
        actions: [
            {
                label: __VLS_ctx.__('Save'),
                variant: 'solid',
                onClick: () => {
                    __VLS_ctx.saveExercise();
                },
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-base" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    const __VLS_8 = Link;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.exercise),
        doctype: "LMS Programming Exercise",
        label: (__VLS_ctx.__('Select a Programming Exercise')),
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.exercise),
        doctype: "LMS Programming Exercise",
        label: (__VLS_ctx.__('Select a Programming Exercise')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    // @ts-ignore
    [show, __, __, __, saveExercise, exercise,];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        onSave: {
            type: Function,
            required: true,
        },
    },
});
export default {};
