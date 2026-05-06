/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import LMSLogo from '@/components/Icons/LMSLogo.vue';
import { Button, call, FormControl, usePageMeta } from 'frappe-ui';
import { computed, inject, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { sessionStore } from '@/stores/session';
const user = inject('$user');
const router = useRouter();
const { brand } = sessionStore();
const persona = reactive({
    role: null,
    useCase: null,
});
const submitPersona = () => {
    let responses = {
        site: user.data?.sitename,
        role: persona.role,
        use_case: persona.useCase,
    };
    call('lms.lms.api.capture_user_persona', {
        responses: JSON.stringify(responses),
    }).then(() => {
        router.push({
            name: 'Courses',
        });
    });
};
const skipPersonaForm = () => {
    call('frappe.client.set_value', {
        doctype: 'LMS Settings',
        name: null,
        fieldname: 'persona_captured',
        value: 1,
    }).then(() => {
        router.push({
            name: 'Courses',
        });
    });
};
const roleOptions = computed(() => {
    const options = [
        'Trainer / Instructor',
        'Freelancer / Consultant',
        'HR / L&D Professional',
        'School / University Admin',
        'Software Developer',
        'Community Manager',
        'Business Owner / Team Lead',
        'Other',
    ];
    return options.map((option) => ({
        label: option,
        value: option,
    }));
});
const noOfStudentsOptions = computed(() => {
    const options = [
        'Less than 50',
        '50-200',
        '200-1000',
        '1000+',
        'Not sure yet',
    ];
    return options.map((option) => ({
        label: option,
        value: option,
    }));
});
const useCaseOptions = computed(() => {
    const options = [
        'Teaching students in a school/university',
        'Training employees in my company',
        'Onboarding and educating my users/community',
        'Selling courses and earning income',
        'Other',
    ];
    return options.map((option) => ({
        label: option,
        value: option,
    }));
});
usePageMeta(() => {
    return {
        title: __('Persona'),
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex h-screen overflow-hidden sm:bg-gray-50" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:bg-gray-50']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "relative h-full z-10 mx-auto sm:w-max pt-40" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:w-max']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-40']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mx-auto flex items-center justify-center space-x-2" },
});
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
const __VLS_0 = LMSLogo;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "size-7" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "size-7" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['size-7']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "select-none text-xl font-semibold tracking-tight text-gray-900" },
});
/** @type {__VLS_StyleScopedClasses['select-none']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mx-auto w-full h-fit bg-white py-8 sm:mt-6 sm:w-96 sm:rounded-lg sm:px-8 sm:shadow-xl" },
});
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-fit']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['py-8']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:w-96']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-8']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:shadow-xl']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "font-medium text-center mb-8" },
});
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
(__VLS_ctx.__('Help us understand your needs'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mb-5" },
});
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-sm text-gray-700 mb-2" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
(__VLS_ctx.__('What is your use case for Frappe Learning?'));
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    modelValue: (__VLS_ctx.persona.useCase),
    type: "select",
    options: (__VLS_ctx.useCaseOptions),
}));
const __VLS_7 = __VLS_6({
    modelValue: (__VLS_ctx.persona.useCase),
    type: "select",
    options: (__VLS_ctx.useCaseOptions),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mb-5" },
});
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-sm text-gray-700 mb-2" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
(__VLS_ctx.__('What best describes your role?'));
let __VLS_10;
/** @ts-ignore @type { | typeof __VLS_components.FormControl} */
FormControl;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    modelValue: (__VLS_ctx.persona.role),
    type: "select",
    options: (__VLS_ctx.roleOptions),
}));
const __VLS_12 = __VLS_11({
    modelValue: (__VLS_ctx.persona.role),
    type: "select",
    options: (__VLS_ctx.roleOptions),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex w-full" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
let __VLS_15;
/** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
Button;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    ...{ 'onClick': {} },
    variant: "solid",
    ...{ class: "mx-auto" },
}));
const __VLS_17 = __VLS_16({
    ...{ 'onClick': {} },
    variant: "solid",
    ...{ class: "mx-auto" },
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
let __VLS_20;
const __VLS_21 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.submitPersona();
            // @ts-ignore
            [__, __, __, persona, persona, useCaseOptions, roleOptions, submitPersona,];
        } });
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
const { default: __VLS_22 } = __VLS_18.slots;
(__VLS_ctx.__('Submit and Continue'));
// @ts-ignore
[__,];
var __VLS_18;
var __VLS_19;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.skipPersonaForm();
            // @ts-ignore
            [skipPersonaForm,];
        } },
    ...{ class: "text-center absolute bottom-0 right-0 left-0 mx-auto cursor-pointer text-sm pb-4" },
});
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
/** @type {__VLS_StyleScopedClasses['right-0']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
(__VLS_ctx.__('Skip'));
// @ts-ignore
[__,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
