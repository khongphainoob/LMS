/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Avatar, Tooltip } from 'frappe-ui';
import { BadgeCheckIcon } from 'lucide-vue-next';
import { computed } from 'vue';
const props = defineProps({
    user: {
        type: Object,
        default: null,
    },
    size: {
        type: String,
    },
});
const checkSize = computed(() => {
    let sizeMap = {
        sm: 'size-1',
        md: 'size-2',
        lg: 'size-3',
        xl: 'size-3',
        '2xl': 'size-3',
    };
    return sizeMap[props.size] || 'size-3';
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.user) {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Avatar | typeof __VLS_components.Avatar} */
    Avatar;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ class: "avatar border border-outline-gray-2 cursor-auto" },
        label: (__VLS_ctx.user.full_name),
        image: (__VLS_ctx.user.user_image),
        size: (__VLS_ctx.size),
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "avatar border border-outline-gray-2 cursor-auto" },
        label: (__VLS_ctx.user.full_name),
        image: (__VLS_ctx.user.user_image),
        size: (__VLS_ctx.size),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    (__VLS_ctx.$attrs);
    var __VLS_5 = {};
    /** @type {__VLS_StyleScopedClasses['avatar']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-auto']} */ ;
    const { default: __VLS_6 } = __VLS_3.slots;
    if (__VLS_ctx.user.open_to === 'Work') {
        {
            const { indicator: __VLS_7 } = __VLS_3.slots;
            let __VLS_8;
            /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
            Tooltip;
            // @ts-ignore
            const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
                text: (__VLS_ctx.__('Open to Work')),
                placement: "right",
            }));
            const __VLS_10 = __VLS_9({
                text: (__VLS_ctx.__('Open to Work')),
                placement: "right",
            }, ...__VLS_functionalComponentArgsRest(__VLS_9));
            const { default: __VLS_13 } = __VLS_11.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "rounded-full bg-surface-green-3 w-fit" },
            });
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-surface-green-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
            let __VLS_14;
            /** @ts-ignore @type { | typeof __VLS_components.BadgeCheckIcon} */
            BadgeCheckIcon;
            // @ts-ignore
            const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
                ...{ class: ('text-ink-white ' + __VLS_ctx.checkSize) },
            }));
            const __VLS_16 = __VLS_15({
                ...{ class: ('text-ink-white ' + __VLS_ctx.checkSize) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_15));
            // @ts-ignore
            [user, user, user, user, size, $attrs, __, checkSize,];
            var __VLS_11;
            // @ts-ignore
            [];
        }
    }
    else if (__VLS_ctx.user.open_to === 'Hiring') {
        let __VLS_19;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
            text: (__VLS_ctx.__('Hiring')),
            placement: "right",
        }));
        const __VLS_21 = __VLS_20({
            text: (__VLS_ctx.__('Hiring')),
            placement: "right",
        }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        const { default: __VLS_24 } = __VLS_22.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "rounded-full bg-purple-500 w-fit" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-purple-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
        let __VLS_25;
        /** @ts-ignore @type { | typeof __VLS_components.BadgeCheckIcon} */
        BadgeCheckIcon;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
            ...{ class: ('text-ink-white ' + __VLS_ctx.checkSize) },
        }));
        const __VLS_27 = __VLS_26({
            ...{ class: ('text-ink-white ' + __VLS_ctx.checkSize) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        // @ts-ignore
        [user, __, checkSize,];
        var __VLS_22;
    }
    // @ts-ignore
    [];
    var __VLS_3;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        user: {
            type: Object,
            default: null,
        },
        size: {
            type: String,
        },
    },
});
export default {};
