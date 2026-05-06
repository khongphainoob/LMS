/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Avatar, Button, createResource, Dialog, FormControl } from 'frappe-ui';
import { useRouter } from 'vue-router';
import { ref, watch, reactive, inject } from 'vue';
import { RefreshCw, Plus, Search, Shield } from 'lucide-vue-next';
import { useOnboarding } from 'frappe-ui/frappe';
const router = useRouter();
const show = defineModel('show');
const search = ref('');
const start = ref(0);
const memberList = ref([]);
const hasNextPage = ref(false);
const showForm = ref(false);
const user = inject('$user');
const { updateOnboardingStep } = useOnboarding('learning');
const member = reactive({
    email: '',
    first_name: '',
});
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
const members = createResource({
    url: 'lms.lms.api.get_members',
    makeParams: () => {
        return {
            search: search.value,
            start: start.value,
        };
    },
    onSuccess(data) {
        memberList.value = memberList.value.concat(data);
        start.value = start.value + 20;
        hasNextPage.value = data.length === 20;
    },
    auto: true,
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
const newMember = createResource({
    url: 'frappe.client.insert',
    makeParams() {
        return {
            doc: {
                doctype: 'User',
                first_name: member.first_name,
                email: member.email,
            },
        };
    },
    auto: false,
    onSuccess(data) {
        show.value = false;
        if (user?.data?.is_system_manager)
            updateOnboardingStep('invite_students');
        router.push({
            name: 'ProfileRoles',
            params: {
                username: data.username,
            },
        });
    },
});
const addMember = (close) => {
    newMember.reload();
    close();
};
watch(search, () => {
    memberList.value = [];
    start.value = 0;
    members.reload();
});
const getRole = (role) => {
    const map = {
        'LMS Student': 'Student',
        'Course Creator': 'Instructor',
        Moderator: 'Moderator',
        'Batch Evaluator': 'Evaluator',
    };
    return map[role];
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
    ...{ class: "mt-8 pb-10" },
});
/** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
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
    ...{ class: "overflow-y-scroll h-[60vh]" },
});
/** @type {__VLS_StyleScopedClasses['overflow-y-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[60vh]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
    ...{ class: "divide-y" },
});
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
for (const [member] of __VLS_vFor((__VLS_ctx.memberList))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
        ...{ class: "flex items-center justify-between py-2 cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.openProfile(member.username);
                // @ts-ignore
                [memberList, openProfile,];
            } },
        ...{ class: "flex items-center space-x-3 col-span-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
    let __VLS_26;
    /** @ts-ignore @type { | typeof __VLS_components.Avatar} */
    Avatar;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        image: (member.user_image),
        label: (member.full_name),
        size: "xl",
    }));
    const __VLS_28 = __VLS_27({
        image: (member.user_image),
        label: (member.full_name),
        size: "xl",
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-1" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (member.full_name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-ink-gray-7" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    (member.name);
    if (member.role && member.role !== 'LMS Student') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center space-x-1 bg-surface-gray-2 px-2 py-1.5 rounded-md" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        let __VLS_31;
        /** @ts-ignore @type { | typeof __VLS_components.Shield} */
        Shield;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
            ...{ class: "size-4 stroke-1.5" },
        }));
        const __VLS_33 = __VLS_32({
            ...{ class: "size-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_32));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (__VLS_ctx.getRole(member.role));
    }
    // @ts-ignore
    [getRole,];
}
if (__VLS_ctx.memberList.length && __VLS_ctx.hasNextPage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-center mt-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    let __VLS_36;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        ...{ 'onClick': {} },
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_41;
    const __VLS_42 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.memberList.length && __VLS_ctx.hasNextPage))
                    return;
                __VLS_ctx.members.reload();
                // @ts-ignore
                [memberList, hasNextPage, members,];
            } });
    const { default: __VLS_43 } = __VLS_39.slots;
    {
        const { prefix: __VLS_44 } = __VLS_39.slots;
        let __VLS_45;
        /** @ts-ignore @type { | typeof __VLS_components.RefreshCw} */
        RefreshCw;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
            ...{ class: "h-3 w-3 stroke-1.5" },
        }));
        const __VLS_47 = __VLS_46({
            ...{ class: "h-3 w-3 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
    }
    (__VLS_ctx.__('Load More'));
    // @ts-ignore
    [__,];
    var __VLS_39;
    var __VLS_40;
}
let __VLS_50;
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    modelValue: (__VLS_ctx.showForm),
    options: ({
        title: __VLS_ctx.__('Add a new member'),
        size: 'lg',
        actions: [{
                label: __VLS_ctx.__('Add'),
                variant: 'solid',
                onClick({ close }) {
                    __VLS_ctx.addMember(close);
                }
            }]
    }),
}));
const __VLS_52 = __VLS_51({
    modelValue: (__VLS_ctx.showForm),
    options: ({
        title: __VLS_ctx.__('Add a new member'),
        size: 'lg',
        actions: [{
                label: __VLS_ctx.__('Add'),
                variant: 'solid',
                onClick({ close }) {
                    __VLS_ctx.addMember(close);
                }
            }]
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
const { default: __VLS_55 } = __VLS_53.slots;
{
    const { 'body-content': __VLS_56 } = __VLS_53.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    let __VLS_57;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
        modelValue: (__VLS_ctx.member.email),
        label: (__VLS_ctx.__('Email')),
        placeholder: "jane@doe.com",
        type: "email",
        ...{ class: "w-full" },
    }));
    const __VLS_59 = __VLS_58({
        modelValue: (__VLS_ctx.member.email),
        label: (__VLS_ctx.__('Email')),
        placeholder: "jane@doe.com",
        type: "email",
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    let __VLS_62;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
        modelValue: (__VLS_ctx.member.first_name),
        label: (__VLS_ctx.__('First Name')),
        placeholder: "Jane",
        type: "text",
        ...{ class: "w-full" },
    }));
    const __VLS_64 = __VLS_63({
        modelValue: (__VLS_ctx.member.first_name),
        label: (__VLS_ctx.__('First Name')),
        placeholder: "Jane",
        type: "text",
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [__, __, __, __, showForm, addMember, member, member,];
}
// @ts-ignore
[];
var __VLS_53;
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
