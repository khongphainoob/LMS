/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Breadcrumbs, Button, usePageMeta, createListResource } from 'frappe-ui';
import { computed, inject, onMounted, ref } from 'vue';
import { BookOpen, Plus, User } from 'lucide-vue-next';
import { sessionStore } from '@/stores/session';
import ProgramForm from '@/pages/Programs/ProgramForm.vue';
import EmptyState from '@/components/EmptyState.vue';
import StudentPrograms from '@/pages/Programs/StudentPrograms.vue';
const { brand } = sessionStore();
const user = inject('$user');
const showForm = ref(false);
const currentProgram = ref(null);
const readOnlyMode = window.read_only_mode;
onMounted(() => {
    if (!user.data) {
        window.location.href = '/login';
    }
    if (user.data?.is_moderator || user.data?.is_instructor) {
        programs.reload();
    }
});
const programs = createListResource({
    doctype: 'LMS Program',
    cache: ['program'],
    fields: [
        'name',
        'title',
        'member_count',
        'course_count',
        'published',
        'enforce_course_order',
    ],
    auto: false,
    orderBy: 'creation desc',
});
const canCreateProgram = () => {
    if (readOnlyMode)
        return false;
    if (user.data?.is_moderator || user.data?.is_instructor)
        return true;
    return false;
};
const openForm = (programName) => {
    if (!canCreateProgram())
        return;
    currentProgram.value = programName;
    showForm.value = true;
};
const isStudent = computed(() => {
    return user.data?.is_student || false;
});
const breadcrumbs = computed(() => [
    {
        label: __('Programs'),
    },
]);
usePageMeta(() => {
    return {
        title: __('Programs'),
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
    ...{ class: "sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5" },
});
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
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
if (__VLS_ctx.canCreateProgram()) {
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.canCreateProgram()))
                    return;
                __VLS_ctx.openForm('new');
                // @ts-ignore
                [breadcrumbs, canCreateProgram, openForm,];
            } });
    const { default: __VLS_12 } = __VLS_8.slots;
    {
        const { prefix: __VLS_13 } = __VLS_8.slots;
        let __VLS_14;
        /** @ts-ignore @type { | typeof __VLS_components.Plus} */
        Plus;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_16 = __VLS_15({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
    }
    (__VLS_ctx.__('New'));
    // @ts-ignore
    [__,];
    var __VLS_8;
    var __VLS_9;
}
if (__VLS_ctx.programs.data?.length && !__VLS_ctx.isStudent) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "py-10 w-3/4 mx-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['py-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-3/4']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold text-ink-gray-9 mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    (__VLS_ctx.__('{0} {1}').format(__VLS_ctx.programs.data.length, __VLS_ctx.programs.data.length == 1 ? __VLS_ctx.__('Program') : __VLS_ctx.__('Programs')));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 lg:grid-cols-3 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    for (const [program] of __VLS_vFor((__VLS_ctx.programs.data))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.programs.data?.length && !__VLS_ctx.isStudent))
                        return;
                    __VLS_ctx.openForm(program.name);
                    // @ts-ignore
                    [openForm, __, __, __, programs, programs, programs, programs, isStudent,];
                } },
            ...{ class: "border rounded-md p-3 hover:border-outline-gray-3 cursor-pointer space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-outline-gray-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-lg font-semibold text-ink-gray-9" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        (program.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center space-x-1 text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        let __VLS_19;
        /** @ts-ignore @type { | typeof __VLS_components.BookOpen} */
        BookOpen;
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
            ...{ class: "h-4 w-4 stroke-1.5 mr-1" },
        }));
        const __VLS_21 = __VLS_20({
            ...{ class: "h-4 w-4 stroke-1.5 mr-1" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (program.course_count);
        (program.course_count == 1 ? __VLS_ctx.__('Course') : __VLS_ctx.__('Courses'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center space-x-1 text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        let __VLS_24;
        /** @ts-ignore @type { | typeof __VLS_components.User} */
        User;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
            ...{ class: "h-4 w-4 stroke-1.5 mr-1" },
        }));
        const __VLS_26 = __VLS_25({
            ...{ class: "h-4 w-4 stroke-1.5 mr-1" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (program.member_count || 0);
        (program.member_count == 1 ? __VLS_ctx.__('member') : __VLS_ctx.__('members'));
        // @ts-ignore
        [__, __, __, __,];
    }
}
else if (__VLS_ctx.isStudent) {
    const __VLS_29 = StudentPrograms;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({}));
    const __VLS_31 = __VLS_30({}, ...__VLS_functionalComponentArgsRest(__VLS_30));
}
else {
    const __VLS_34 = EmptyState;
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
        type: "Programs",
    }));
    const __VLS_36 = __VLS_35({
        type: "Programs",
    }, ...__VLS_functionalComponentArgsRest(__VLS_35));
}
const __VLS_39 = ProgramForm;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    modelValue: (__VLS_ctx.showForm),
    programName: (__VLS_ctx.currentProgram),
    programs: (__VLS_ctx.programs),
}));
const __VLS_41 = __VLS_40({
    modelValue: (__VLS_ctx.showForm),
    programName: (__VLS_ctx.currentProgram),
    programs: (__VLS_ctx.programs),
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
// @ts-ignore
[programs, isStudent, showForm, currentProgram,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
