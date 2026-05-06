/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Avatar, Button, call, createListResource, Dialog, FormControl, toast, } from 'frappe-ui';
import { ref, watch } from 'vue';
import { Plus, Search, Trash2, RefreshCw } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
const show = defineModel('show');
const search = ref('');
const showForm = ref(false);
const email = ref('');
const router = useRouter();
const props = defineProps({
    label: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
});
const evaluators = createListResource({
    doctype: 'Course Evaluator',
    fields: ['evaluator', 'username', 'full_name', 'user_image'],
    auto: true,
    orderBy: 'creation desc',
});
const addEvaluator = (close) => {
    call('lms.lms.api.add_an_evaluator', {
        email: email.value,
    })
        .then(() => {
        email.value = '';
        evaluators.reload();
        toast.success(__('Evaluator added successfully'));
        close();
    })
        .catch((error) => {
        toast.error(__(error.messages[0] || error.messages));
        console.error('Error adding evaluator:', error);
    });
};
watch(search, () => {
    evaluators.update({
        filters: {
            full_name: ['like', `%${search.value}%`],
        },
    });
    evaluators.reload();
});
const openProfile = (username) => {
    show.value = false;
    router.push({
        name: 'Profile',
        params: {
            username: username,
        },
    });
};
const deleteEvaluator = (evaluator) => {
    call('frappe.client.delete', {
        doctype: 'Course Evaluator',
        name: evaluator,
    })
        .then(() => {
        toast.success(__('Evaluator deleted successfully'));
        evaluators.reload();
    })
        .catch((error) => {
        toast.error(__(error.messages[0] || error.messages));
        console.error('Error deleting evaluator:', error);
    });
};
let __VLS_modelEmit;
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex min-h-0 flex-col text-base" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xl font-semibold mb-1 text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__(__VLS_ctx.label));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-ink-gray-6 leading-5" },
});
/** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
(__VLS_ctx.__(__VLS_ctx.description));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex item-center space-x-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['item-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    variant: "solid",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    variant: "solid",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (() => (__VLS_ctx.showForm = !__VLS_ctx.showForm)) });
const { default: __VLS_7 } = __VLS_3.slots;
{
    const { prefix: __VLS_8 } = __VLS_3.slots;
    let __VLS_9;
    /** @ts-ignore @type { | typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
        ...{ class: "size-4 stroke-1.5" },
    }));
    const __VLS_11 = __VLS_10({
        ...{ class: "size-4 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    // @ts-ignore
    [__, __, label, description, showForm, showForm,];
}
(__VLS_ctx.__('New'));
// @ts-ignore
[__,];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-8 pb-5" },
});
/** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
let __VLS_14;
/** @ts-ignore @type { | typeof __VLS_components.FormControl | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
    modelValue: (__VLS_ctx.search),
    placeholder: (__VLS_ctx.__('Search')),
    type: "text",
    debounce: (300),
    ...{ class: "w-1/4 mb-4" },
}));
const __VLS_16 = __VLS_15({
    modelValue: (__VLS_ctx.search),
    placeholder: (__VLS_ctx.__('Search')),
    type: "text",
    debounce: (300),
    ...{ class: "w-1/4 mb-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
/** @type {__VLS_StyleScopedClasses['w-1/4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
const { default: __VLS_19 } = __VLS_17.slots;
{
    const { prefix: __VLS_20 } = __VLS_17.slots;
    let __VLS_21;
    /** @ts-ignore @type { | typeof __VLS_components.Search} */
    Search;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        ...{ class: "size-4 stroke-1.5 text-ink-gray-5" },
    }));
    const __VLS_23 = __VLS_22({
        ...{ class: "size-4 stroke-1.5 text-ink-gray-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    // @ts-ignore
    [__, search,];
}
// @ts-ignore
[];
var __VLS_17;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overflow-auto h-[60vh]" },
});
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[60vh]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "divide-y" },
});
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
for (const [evaluator] of __VLS_vFor((__VLS_ctx.evaluators.data))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (evaluator.evaluator),
        ...{ class: "cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between group py-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.openProfile(evaluator.username);
                // @ts-ignore
                [evaluators, openProfile,];
            } },
        ...{ class: "flex items-center space-x-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
    let __VLS_26;
    /** @ts-ignore @type { | typeof __VLS_components.Avatar} */
    Avatar;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        image: (evaluator.user_image),
        label: (evaluator.full_name),
        size: "xl",
    }));
    const __VLS_28 = __VLS_27({
        image: (evaluator.user_image),
        label: (evaluator.full_name),
        size: "xl",
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-1" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-base font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (evaluator.full_name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (evaluator.evaluator);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "invisible group-hover:visible" },
    });
    /** @type {__VLS_StyleScopedClasses['invisible']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:visible']} */ ;
    let __VLS_31;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        ...{ 'onClick': {} },
        variant: "ghost",
    }));
    const __VLS_33 = __VLS_32({
        ...{ 'onClick': {} },
        variant: "ghost",
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    let __VLS_36;
    const __VLS_37 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.deleteEvaluator(evaluator.evaluator);
                // @ts-ignore
                [deleteEvaluator,];
            } });
    const { default: __VLS_38 } = __VLS_34.slots;
    {
        const { icon: __VLS_39 } = __VLS_34.slots;
        let __VLS_40;
        /** @ts-ignore @type { | typeof __VLS_components.Trash2} */
        Trash2;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
            ...{ class: "size-4 stroke-1.5 text-ink-red-3" },
        }));
        const __VLS_42 = __VLS_41({
            ...{ class: "size-4 stroke-1.5 text-ink-red-3" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-red-3']} */ ;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_34;
    var __VLS_35;
    // @ts-ignore
    [];
}
if (__VLS_ctx.evaluators.length && __VLS_ctx.hasNextPage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-center mt-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    let __VLS_45;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
        ...{ 'onClick': {} },
    }));
    const __VLS_47 = __VLS_46({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    let __VLS_50;
    const __VLS_51 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.evaluators.length && __VLS_ctx.hasNextPage))
                    return;
                __VLS_ctx.evaluators.reload();
                // @ts-ignore
                [evaluators, evaluators, hasNextPage,];
            } });
    const { default: __VLS_52 } = __VLS_48.slots;
    {
        const { prefix: __VLS_53 } = __VLS_48.slots;
        let __VLS_54;
        /** @ts-ignore @type { | typeof __VLS_components.RefreshCw} */
        RefreshCw;
        // @ts-ignore
        const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
            ...{ class: "h-3 w-3 stroke-1.5" },
        }));
        const __VLS_56 = __VLS_55({
            ...{ class: "h-3 w-3 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_55));
        /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
    }
    (__VLS_ctx.__('Load More'));
    // @ts-ignore
    [__,];
    var __VLS_48;
    var __VLS_49;
}
let __VLS_59;
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
    modelValue: (__VLS_ctx.showForm),
    options: ({
        size: 'xl',
        title: __VLS_ctx.__('Add Evaluator'),
        actions: [{
                label: __VLS_ctx.__('Add'),
                variant: 'solid',
                onClick({ close }) {
                    __VLS_ctx.addEvaluator(close);
                },
            }]
    }),
}));
const __VLS_61 = __VLS_60({
    modelValue: (__VLS_ctx.showForm),
    options: ({
        size: 'xl',
        title: __VLS_ctx.__('Add Evaluator'),
        actions: [{
                label: __VLS_ctx.__('Add'),
                variant: 'solid',
                onClick({ close }) {
                    __VLS_ctx.addEvaluator(close);
                },
            }]
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
const { default: __VLS_64 } = __VLS_62.slots;
{
    const { 'body-content': __VLS_65 } = __VLS_62.slots;
    if (__VLS_ctx.showForm) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        let __VLS_66;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
            ...{ 'onKeydown': {} },
            modelValue: (__VLS_ctx.email),
            label: (__VLS_ctx.__('Email')),
            placeholder: "jane@doe.com",
            type: "email",
            ...{ class: "w-full" },
        }));
        const __VLS_68 = __VLS_67({
            ...{ 'onKeydown': {} },
            modelValue: (__VLS_ctx.email),
            label: (__VLS_ctx.__('Email')),
            placeholder: "jane@doe.com",
            type: "email",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_67));
        let __VLS_71;
        const __VLS_72 = ({ keydown: {} },
            { onKeydown: (__VLS_ctx.addEvaluator) });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_69;
        var __VLS_70;
    }
    // @ts-ignore
    [__, __, __, showForm, showForm, addEvaluator, addEvaluator, email,];
}
// @ts-ignore
[];
var __VLS_62;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    props: {
        ...{},
        ...{
            label: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                default: '',
            },
        },
    },
});
export default {};
