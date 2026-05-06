/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { FormControl, createResource, toast } from 'frappe-ui';
import { ref, watch } from 'vue';
import { convertToTitleCase } from '@/utils';
import { CircleAlert } from 'lucide-vue-next';
const moderator = ref(false);
const course_creator = ref(false);
const batch_evaluator = ref(false);
const lms_student = ref(false);
const readOnlyMode = window.read_only_mode;
const props = defineProps({
    profile: {
        type: Object,
        required: true,
    },
});
const roles = createResource({
    url: 'lms.lms.utils.get_roles',
    makeParams(values) {
        return {
            name: values.member,
        };
    },
    onSuccess(data) {
        let roles = [
            'moderator',
            'course_creator',
            'batch_evaluator',
            'lms_student',
        ];
        for (let role of roles) {
            if (data[role])
                eval(role).value = true;
        }
    },
});
watch(() => props.profile, (newValue) => {
    roles.reload({
        member: newValue.data?.name,
    });
}, { immediate: true });
const updateRole = createResource({
    url: 'lms.lms.api.save_role',
    makeParams(values) {
        return {
            user: props.profile.data?.name,
            role: values.role,
            value: values.value,
        };
    },
});
const changeRole = (role) => {
    updateRole.submit({
        role: role == 'lms_student'
            ? 'LMS Student'
            : convertToTitleCase(role.split('_').join(' ')),
        value: eval(role).value,
    }, {
        onSuccess(data) {
            toast.success(__('Role updated successfully'));
        },
    });
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-7" },
});
/** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "mb-3 text-lg font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('Settings'));
if (__VLS_ctx.readOnlyMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2 text-sm text-ink-gray-7 bg-surface-gray-1 px-3 py-2 rounded-md w-full text-center" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.CircleAlert} */
    CircleAlert;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ class: "size-4 stroke-1.5" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "size-4 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('You cannot change the roles in read-only mode.'));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col md:flex-row gap-4 md:gap-0 justify-between w-3/4 mt-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:gap-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-3/4']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ 'onChange': {} },
        label: (__VLS_ctx.__('Moderator')),
        modelValue: (__VLS_ctx.moderator),
        type: "checkbox",
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onChange': {} },
        label: (__VLS_ctx.__('Moderator')),
        modelValue: (__VLS_ctx.moderator),
        type: "checkbox",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = ({ change: {} },
        { onChange: (...[$event]) => {
                if (!!(__VLS_ctx.readOnlyMode))
                    return;
                __VLS_ctx.changeRole('moderator');
                // @ts-ignore
                [__, __, __, readOnlyMode, moderator, changeRole,];
            } });
    var __VLS_8;
    var __VLS_9;
    let __VLS_12;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        ...{ 'onChange': {} },
        label: (__VLS_ctx.__('Course Creator')),
        modelValue: (__VLS_ctx.course_creator),
        type: "checkbox",
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onChange': {} },
        label: (__VLS_ctx.__('Course Creator')),
        modelValue: (__VLS_ctx.course_creator),
        type: "checkbox",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_17;
    const __VLS_18 = ({ change: {} },
        { onChange: (...[$event]) => {
                if (!!(__VLS_ctx.readOnlyMode))
                    return;
                __VLS_ctx.changeRole('course_creator');
                // @ts-ignore
                [__, changeRole, course_creator,];
            } });
    var __VLS_15;
    var __VLS_16;
    let __VLS_19;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        ...{ 'onChange': {} },
        label: (__VLS_ctx.__('Evaluator')),
        modelValue: (__VLS_ctx.batch_evaluator),
        type: "checkbox",
    }));
    const __VLS_21 = __VLS_20({
        ...{ 'onChange': {} },
        label: (__VLS_ctx.__('Evaluator')),
        modelValue: (__VLS_ctx.batch_evaluator),
        type: "checkbox",
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    let __VLS_24;
    const __VLS_25 = ({ change: {} },
        { onChange: (...[$event]) => {
                if (!!(__VLS_ctx.readOnlyMode))
                    return;
                __VLS_ctx.changeRole('batch_evaluator');
                // @ts-ignore
                [__, changeRole, batch_evaluator,];
            } });
    var __VLS_22;
    var __VLS_23;
    let __VLS_26;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        ...{ 'onChange': {} },
        label: (__VLS_ctx.__('Student')),
        modelValue: (__VLS_ctx.lms_student),
        type: "checkbox",
    }));
    const __VLS_28 = __VLS_27({
        ...{ 'onChange': {} },
        label: (__VLS_ctx.__('Student')),
        modelValue: (__VLS_ctx.lms_student),
        type: "checkbox",
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    let __VLS_31;
    const __VLS_32 = ({ change: {} },
        { onChange: (...[$event]) => {
                if (!!(__VLS_ctx.readOnlyMode))
                    return;
                __VLS_ctx.changeRole('lms_student');
                // @ts-ignore
                [__, changeRole, lms_student,];
            } });
    var __VLS_29;
    var __VLS_30;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        profile: {
            type: Object,
            required: true,
        },
    },
});
export default {};
