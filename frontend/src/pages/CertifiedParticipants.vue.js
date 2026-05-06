/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Avatar, Breadcrumbs, Button, call, createListResource, FormControl, Select, usePageMeta, } from 'frappe-ui';
import { computed, inject, onMounted, ref } from 'vue';
import { GraduationCap } from 'lucide-vue-next';
import { sessionStore } from '../stores/session';
import { useRouter } from 'vue-router';
import EmptyState from '@/components/EmptyState.vue';
import UserAvatar from '@/components/UserAvatar.vue';
const filters = ref({});
const currentCategory = ref('');
const nameFilter = ref('');
const openToWork = ref(false);
const hiring = ref(false);
const { brand } = sessionStore();
const memberCount = ref(0);
const dayjs = inject('$dayjs');
const user = inject('$user');
const router = useRouter();
onMounted(() => {
    if (!user.data) {
        router.push({ name: 'Courses' });
        return;
    }
    setFiltersFromQuery();
    updateParticipants();
});
const participants = createListResource({
    doctype: 'LMS Certificate',
    url: 'lms.lms.api.get_certified_participants',
    start: 0,
    cache: ['certified_participants'],
    pageLength: 100,
});
const getMemberCount = () => {
    call('lms.lms.api.get_count_of_certified_members', {
        filters: filters.value,
    }).then((data) => {
        memberCount.value = data;
    });
};
const categories = createListResource({
    doctype: 'LMS Certificate',
    url: 'lms.lms.api.get_certification_categories',
    cache: ['certification_categories'],
    auto: user.data ? true : false,
    transform(data) {
        data.unshift({ label: __(' '), value: ' ' });
        return data;
    },
});
const updateParticipants = () => {
    updateFilters();
    getMemberCount();
    setQueryParams();
    participants.update({
        filters: filters.value,
    });
    participants.reload();
};
const updateFilters = () => {
    filters.value = {
        ...(currentCategory.value.trim('') && {
            category: currentCategory.value,
        }),
        ...(nameFilter.value && {
            member_name: ['like', `%${nameFilter.value}%`],
        }),
        ...(openToWork.value && {
            open_to_work: true,
        }),
        ...(hiring.value && {
            hiring: true,
        }),
    };
};
const setQueryParams = () => {
    let queries = new URLSearchParams(location.search);
    let filterKeys = {
        category: currentCategory.value,
        name: nameFilter.value,
        'open-to-work': openToWork.value,
        hiring: hiring.value,
    };
    Object.keys(filterKeys).forEach((key) => {
        if (filterKeys[key] && hasValue(filterKeys[key])) {
            queries.set(key, filterKeys[key]);
        }
        else {
            queries.delete(key);
        }
    });
    history.replaceState({}, '', `${location.pathname}${queries.size > 0 ? `?${queries.toString()}` : ''}`);
};
const hasValue = (value) => {
    if (typeof value === 'string') {
        return value.trim() !== '';
    }
    return true;
};
const setFiltersFromQuery = () => {
    let queries = new URLSearchParams(location.search);
    nameFilter.value = queries.get('name') || '';
    currentCategory.value = queries.get('category') || '';
    openToWork.value = queries.get('open-to-opportunities') === 'true';
    hiring.value = queries.get('hiring') === 'true';
};
const breadcrumbs = computed(() => [
    {
        label: __('Certified Members'),
        route: { name: 'CertifiedParticipants' },
    },
]);
usePageMeta(() => {
    return {
        title: __('Certified Members'),
        icon: brand.favicon,
    };
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "sticky flex items-center justify-between top-0 z-10 border-b bg-surface-white px-3 py-2.5 sm:px-5" },
});
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-5']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Breadcrumbs} */
Breadcrumbs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    items: (__VLS_ctx.breadcrumbs),
}));
const __VLS_2 = __VLS_1({
    items: (__VLS_ctx.breadcrumbs),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
routerLink;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    to: ({ name: 'Courses', query: { certification: true } }),
}));
const __VLS_7 = __VLS_6({
    to: ({ name: 'Courses', query: { certification: true } }),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const { default: __VLS_10 } = __VLS_8.slots;
let __VLS_11;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({}));
const __VLS_13 = __VLS_12({}, ...__VLS_functionalComponentArgsRest(__VLS_12));
const { default: __VLS_16 } = __VLS_14.slots;
{
    const { prefix: __VLS_17 } = __VLS_14.slots;
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.GraduationCap} */
    GraduationCap;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        ...{ class: "h-4 w-4 stroke-1.5" },
    }));
    const __VLS_20 = __VLS_19({
        ...{ class: "h-4 w-4 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    // @ts-ignore
    [breadcrumbs,];
}
(__VLS_ctx.__('Get Certified'));
// @ts-ignore
[__,];
var __VLS_14;
// @ts-ignore
[];
var __VLS_8;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mx-auto w-full max-w-4xl pt-6 pb-10" },
});
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col md:flex-row justify-between mb-8 px-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xl font-semibold text-ink-gray-9 mb-4 md:mb-0" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:mb-0']} */ ;
(__VLS_ctx.memberCount);
(__VLS_ctx.__('Certified Members'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['md:items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:space-y-0']} */ ;
/** @type {__VLS_StyleScopedClasses['md:space-x-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
let __VLS_23;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.nameFilter),
    placeholder: (__VLS_ctx.__('Search by Name')),
    type: "text",
    ...{ class: "min-w-40 lg:min-w-0 lg:w-32 xl:w-40" },
}));
const __VLS_25 = __VLS_24({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.nameFilter),
    placeholder: (__VLS_ctx.__('Search by Name')),
    type: "text",
    ...{ class: "min-w-40 lg:min-w-0 lg:w-32 xl:w-40" },
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
let __VLS_28;
const __VLS_29 = ({ input: {} },
    { onInput: (...[$event]) => {
            __VLS_ctx.updateParticipants();
            // @ts-ignore
            [__, __, memberCount, nameFilter, updateParticipants,];
        } });
/** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:w-32']} */ ;
/** @type {__VLS_StyleScopedClasses['xl:w-40']} */ ;
var __VLS_26;
var __VLS_27;
if (__VLS_ctx.categories.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "min-w-40 lg:min-w-0 lg:w-32 xl:w-40" },
    });
    /** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:min-w-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:w-32']} */ ;
    /** @type {__VLS_StyleScopedClasses['xl:w-40']} */ ;
    let __VLS_30;
    /** @ts-ignore @type { | typeof __VLS_components.Select} */
    Select;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.currentCategory),
        options: (__VLS_ctx.categories.data),
        placeholder: (__VLS_ctx.__('Category')),
    }));
    const __VLS_32 = __VLS_31({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.currentCategory),
        options: (__VLS_ctx.categories.data),
        placeholder: (__VLS_ctx.__('Category')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    let __VLS_35;
    const __VLS_36 = ({ 'update:modelValue': {} },
        { 'onUpdate:modelValue': (...[$event]) => {
                if (!(__VLS_ctx.categories.data?.length))
                    return;
                __VLS_ctx.updateParticipants();
                // @ts-ignore
                [__, updateParticipants, categories, categories, currentCategory,];
            } });
    var __VLS_33;
    var __VLS_34;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
let __VLS_37;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.openToWork),
    label: (__VLS_ctx.__('Open to Work')),
    type: "checkbox",
}));
const __VLS_39 = __VLS_38({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.openToWork),
    label: (__VLS_ctx.__('Open to Work')),
    type: "checkbox",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
let __VLS_42;
const __VLS_43 = ({ change: {} },
    { onChange: (...[$event]) => {
            __VLS_ctx.updateParticipants();
            // @ts-ignore
            [__, updateParticipants, openToWork,];
        } });
var __VLS_40;
var __VLS_41;
let __VLS_44;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.hiring),
    label: (__VLS_ctx.__('Hiring')),
    type: "checkbox",
}));
const __VLS_46 = __VLS_45({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.hiring),
    label: (__VLS_ctx.__('Hiring')),
    type: "checkbox",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_49;
const __VLS_50 = ({ change: {} },
    { onChange: (...[$event]) => {
            __VLS_ctx.updateParticipants();
            // @ts-ignore
            [__, updateParticipants, hiring,];
        } });
var __VLS_47;
var __VLS_48;
if (__VLS_ctx.participants.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "" },
    });
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    for (const [participant, index] of __VLS_vFor((__VLS_ctx.participants.data))) {
        let __VLS_51;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
            to: ({
                name: 'ProfileAbout',
                params: {
                    username: participant.username,
                },
            }),
        }));
        const __VLS_53 = __VLS_52({
            to: ({
                name: 'ProfileAbout',
                params: {
                    username: participant.username,
                },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        const { default: __VLS_56 } = __VLS_54.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "rounded-md hover:bg-surface-gray-2 px-3" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center w-full space-x-3 py-2" },
            ...{ class: ({
                    'border-b': index < __VLS_ctx.participants.data.length - 1,
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        const __VLS_57 = UserAvatar;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
            user: (participant),
            size: "2xl",
        }));
        const __VLS_59 = __VLS_58({
            user: (participant),
            size: "2xl",
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col md:flex-row w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-base font-medium text-ink-gray-8" },
        });
        /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-8']} */ ;
        (participant.full_name);
        if (participant.headline) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mt-1.5 text-base text-ink-gray-5" },
            });
            /** @type {__VLS_StyleScopedClasses['mt-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
            (participant.headline);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center space-x-3 md:space-x-24 text-sm md:text-base mt-1.5" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:space-x-24']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:text-base']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        (participant.certificate_count);
        (participant.certificate_count > 1
            ? __VLS_ctx.__('certificates')
            : __VLS_ctx.__('certificate'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-ink-gray-4 md:hidden" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:hidden']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        (__VLS_ctx.dayjs(participant.issue_date).format('DD MMM YYYY'));
        // @ts-ignore
        [__, __, participants, participants, participants, dayjs,];
        var __VLS_54;
        // @ts-ignore
        [];
    }
}
else {
    const __VLS_62 = EmptyState;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
        type: "Certified Members",
    }));
    const __VLS_64 = __VLS_63({
        type: "Certified Members",
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
}
if (!__VLS_ctx.participants.list.loading && __VLS_ctx.participants.hasNextPage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-center mt-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    let __VLS_67;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
        ...{ 'onClick': {} },
    }));
    const __VLS_69 = __VLS_68({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    let __VLS_72;
    const __VLS_73 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(!__VLS_ctx.participants.list.loading && __VLS_ctx.participants.hasNextPage))
                    return;
                __VLS_ctx.participants.next();
                // @ts-ignore
                [participants, participants, participants,];
            } });
    const { default: __VLS_74 } = __VLS_70.slots;
    (__VLS_ctx.__('Load More'));
    // @ts-ignore
    [__,];
    var __VLS_70;
    var __VLS_71;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
