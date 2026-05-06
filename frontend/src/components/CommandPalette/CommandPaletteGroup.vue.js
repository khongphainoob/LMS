/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { inject } from 'vue';
const dayjs = inject('$dayjs');
const emit = defineEmits(['navigateTo']);
const props = defineProps();
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
for (const [result] of __VLS_vFor((__VLS_ctx.list))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "px-2.5 space-y-2" },
    });
    /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-ink-gray-5 px-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    (result.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "" },
    });
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    for (const [item] of __VLS_vFor((result.items))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.emit('navigateTo', item.route);
                    // @ts-ignore
                    [list, emit,];
                } },
            ...{ class: "flex items-center justify-between p-2 rounded hover:bg-surface-gray-2 cursor-pointer" },
            ...{ class: ({ 'bg-surface-gray-2': item.isActive }) },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center space-x-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
        if (item.icon) {
            const __VLS_0 = (item.icon);
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
                ...{ class: "size-4 stroke-1.5 text-ink-gray-6" },
            }));
            const __VLS_2 = __VLS_1({
                ...{ class: "size-4 stroke-1.5 text-ink-gray-6" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (item.title) }, null, null);
        if (item.modified) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-ink-gray-5" },
            });
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
            (__VLS_ctx.dayjs.unix(item.modified).fromNow(true));
        }
        // @ts-ignore
        [dayjs,];
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    __typeProps: {},
});
export default {};
