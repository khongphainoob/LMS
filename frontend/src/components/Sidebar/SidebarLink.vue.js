/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Tooltip } from 'frappe-ui';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import ContactUsEmail from '@/components/ContactUsEmail.vue';
import * as icons from 'lucide-vue-next';
const router = useRouter();
const emit = defineEmits(['openModal', 'deletePage']);
const showContactForm = ref(false);
const props = defineProps({
    link: {
        type: Object,
        required: true,
    },
    isCollapsed: {
        type: Boolean,
        default: false,
    },
    showControls: {
        type: Boolean,
        default: false,
    },
    activeTab: {
        type: String,
        default: '',
    },
});
function handleClick() {
    if (router.hasRoute(props.link.to)) {
        router.push({ name: props.link.to });
    }
    else if (props.link.to?.includes('@')) {
        showContactForm.value = true;
    }
    else if (props.link.to) {
        if (props.link.to.startsWith('http')) {
            window.open(props.link.to, '_blank');
            return;
        }
        window.location.href = `/${props.link.to}`;
    }
}
const isActive = computed(() => {
    return (props.link?.activeFor?.includes(router.currentRoute.value.name) ||
        (props.activeTab && props.link?.label?.includes(props.activeTab)));
});
const openModal = (link) => {
    emit('openModal', link);
};
const deletePage = (link) => {
    emit('deletePage', link);
};
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
if (__VLS_ctx.link && !__VLS_ctx.link.onlyMobile) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.handleClick) },
        ...{ class: "flex w-full min-h-[36px] cursor-pointer items-center rounded-r-md duration-300 ease-in-out focus:outline-none focus:transition-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-outline-gray-3" },
        ...{ class: (__VLS_ctx.isActive ? 'bg-surface-selected text-ink-gray-9 border-l-[3px] border-ink-gray-5 font-semibold shadow-sm' : 'hover:bg-surface-gray-2 hover:translate-x-1 hover:text-ink-gray-9 border-l-[3px] border-transparent text-ink-gray-7') },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[36px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-r-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['ease-in-out']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:transition-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus-visible:ring-outline-gray-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center w-full duration-300 ease-in-out group" },
        ...{ class: (__VLS_ctx.isCollapsed ? 'p-1 relative' : 'px-2 py-1') },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['ease-in-out']} */ ;
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        text: (__VLS_ctx.__(__VLS_ctx.link.label)),
        placement: "right",
    }));
    const __VLS_2 = __VLS_1({
        text: (__VLS_ctx.__(__VLS_ctx.link.label)),
        placement: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const { default: __VLS_5 } = __VLS_3.slots;
    var __VLS_6 = {};
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "grid h-5 w-6 flex-shrink-0 place-items-center" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['place-items-center']} */ ;
    const __VLS_8 = (__VLS_ctx.icons[__VLS_ctx.link.icon]);
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        ...{ class: "h-4 w-4 stroke-1.5 transition-colors duration-300" },
        ...{ class: (__VLS_ctx.isActive ? 'text-ink-gray-9' : 'text-ink-gray-7 group-hover:text-ink-gray-9') },
    }));
    const __VLS_10 = __VLS_9({
        ...{ class: "h-4 w-4 stroke-1.5 transition-colors duration-300" },
        ...{ class: (__VLS_ctx.isActive ? 'text-ink-gray-9' : 'text-ink-gray-7 group-hover:text-ink-gray-9') },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    // @ts-ignore
    [link, link, link, link, handleClick, isActive, isActive, isCollapsed, __, icons,];
    var __VLS_3;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "flex-shrink-0 text-sm duration-300 ease-in-out" },
        ...{ class: (__VLS_ctx.isCollapsed
                ? 'ml-0 w-0 overflow-hidden opacity-0'
                : 'ml-2 w-auto opacity-100') },
    });
    /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['ease-in-out']} */ ;
    (__VLS_ctx.__(__VLS_ctx.link.label));
    if (__VLS_ctx.link.count && !__VLS_ctx.isCollapsed) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "!ml-auto block text-xs text-ink-gray-5" },
            ...{ class: (__VLS_ctx.isCollapsed && __VLS_ctx.link.count > 9
                    ? 'absolute top-[2px] right-0 bg-surface-white'
                    : '') },
        });
        /** @type {__VLS_StyleScopedClasses['!ml-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        (__VLS_ctx.link.count);
    }
    if (__VLS_ctx.showControls && !__VLS_ctx.isCollapsed) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center space-x-2 !ml-auto block text-xs text-ink-gray-5 group-hover:visible invisible" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['!ml-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['group-hover:visible']} */ ;
        /** @type {__VLS_StyleScopedClasses['invisible']} */ ;
        const __VLS_13 = (__VLS_ctx.icons['Edit']);
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            ...{ 'onClick': {} },
            ...{ class: "h-3 w-3 stroke-1.5 text-ink-gray-7" },
        }));
        const __VLS_15 = __VLS_14({
            ...{ 'onClick': {} },
            ...{ class: "h-3 w-3 stroke-1.5 text-ink-gray-7" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        let __VLS_18;
        const __VLS_19 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.link && !__VLS_ctx.link.onlyMobile))
                        return;
                    if (!(__VLS_ctx.showControls && !__VLS_ctx.isCollapsed))
                        return;
                    __VLS_ctx.openModal(__VLS_ctx.link);
                    // @ts-ignore
                    [link, link, link, link, link, isCollapsed, isCollapsed, isCollapsed, isCollapsed, __, icons, showControls, openModal,];
                } });
        /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        var __VLS_16;
        var __VLS_17;
        const __VLS_20 = (__VLS_ctx.icons['X']);
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
            ...{ 'onClick': {} },
            ...{ class: "h-3 w-3 stroke-1.5 text-ink-gray-7" },
        }));
        const __VLS_22 = __VLS_21({
            ...{ 'onClick': {} },
            ...{ class: "h-3 w-3 stroke-1.5 text-ink-gray-7" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        let __VLS_25;
        const __VLS_26 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.link && !__VLS_ctx.link.onlyMobile))
                        return;
                    if (!(__VLS_ctx.showControls && !__VLS_ctx.isCollapsed))
                        return;
                    __VLS_ctx.deletePage(__VLS_ctx.link);
                    // @ts-ignore
                    [link, icons, deletePage,];
                } });
        /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        var __VLS_23;
        var __VLS_24;
    }
}
const __VLS_27 = ContactUsEmail;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
    modelValue: (__VLS_ctx.showContactForm),
}));
const __VLS_29 = __VLS_28({
    modelValue: (__VLS_ctx.showContactForm),
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
// @ts-ignore
var __VLS_7 = __VLS_6;
// @ts-ignore
[showContactForm,];
const __VLS_base = (await import('vue')).defineComponent({
    emits: {},
    props: {
        link: {
            type: Object,
            required: true,
        },
        isCollapsed: {
            type: Boolean,
            default: false,
        },
        showControls: {
            type: Boolean,
            default: false,
        },
        activeTab: {
            type: String,
            default: '',
        },
    },
});
const __VLS_export = {};
export default {};
