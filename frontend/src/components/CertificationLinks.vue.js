/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, createResource } from 'frappe-ui';
import { inject } from 'vue';
import { GraduationCap } from 'lucide-vue-next';
const user = inject('$user');
const props = defineProps({
    courseName: {
        type: String,
        required: true,
    },
});
const certification = createResource({
    url: 'lms.lms.api.get_certification_details',
    makeParams(values) {
        return {
            course: props.courseName,
        };
    },
    auto: user.data ? true : false,
});
const downloadCertificate = () => {
    window.open(`/api/method/frappe.utils.print_format.download_pdf?doctype=LMS+Certificate&name=${certification.data.certificate.name}&format=${encodeURIComponent(certification.data.certificate.template)}`);
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
if (__VLS_ctx.certification.data && __VLS_ctx.certification.data.certificate) {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        ...{ class: "" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        ...{ class: "" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ click: {} },
        { onClick: (__VLS_ctx.downloadCertificate) });
    var __VLS_7 = {};
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    const { default: __VLS_8 } = __VLS_3.slots;
    {
        const { prefix: __VLS_9 } = __VLS_3.slots;
        let __VLS_10;
        /** @ts-ignore @type { | typeof __VLS_components.GraduationCap} */
        GraduationCap;
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
            ...{ class: "size-4 stroke-1.5" },
        }));
        const __VLS_12 = __VLS_11({
            ...{ class: "size-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_11));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [certification, certification, downloadCertificate,];
    }
    (__VLS_ctx.__('View Certificate'));
    // @ts-ignore
    [__,];
    var __VLS_3;
    var __VLS_4;
}
else if (__VLS_ctx.certification.data &&
    __VLS_ctx.certification.data.membership &&
    __VLS_ctx.certification.data.paid_certificate &&
    __VLS_ctx.user.data?.is_student) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    if (!__VLS_ctx.certification.data.membership.purchased_certificate) {
        let __VLS_15;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            to: ({
                name: 'Billing',
                params: {
                    type: 'certificate',
                    name: __VLS_ctx.courseName,
                },
            }),
        }));
        const __VLS_17 = __VLS_16({
            to: ({
                name: 'Billing',
                params: {
                    type: 'certificate',
                    name: __VLS_ctx.courseName,
                },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        const { default: __VLS_20 } = __VLS_18.slots;
        let __VLS_21;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
            ...{ class: "w-full" },
        }));
        const __VLS_23 = __VLS_22({
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_22));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        const { default: __VLS_26 } = __VLS_24.slots;
        {
            const { prefix: __VLS_27 } = __VLS_24.slots;
            let __VLS_28;
            /** @ts-ignore @type { | typeof __VLS_components.GraduationCap} */
            GraduationCap;
            // @ts-ignore
            const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_30 = __VLS_29({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_29));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [certification, certification, certification, certification, user, courseName,];
        }
        (__VLS_ctx.__('Get Certified'));
        // @ts-ignore
        [__,];
        var __VLS_24;
        // @ts-ignore
        [];
        var __VLS_18;
    }
    else if (!__VLS_ctx.certification.data.membership.certificate) {
        let __VLS_33;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
            to: ({
                name: 'CourseCertification',
                params: {
                    courseName: __VLS_ctx.courseName,
                },
            }),
        }));
        const __VLS_35 = __VLS_34({
            to: ({
                name: 'CourseCertification',
                params: {
                    courseName: __VLS_ctx.courseName,
                },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        const { default: __VLS_38 } = __VLS_36.slots;
        let __VLS_39;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
            ...{ class: "w-full" },
        }));
        const __VLS_41 = __VLS_40({
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_40));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        const { default: __VLS_44 } = __VLS_42.slots;
        {
            const { prefix: __VLS_45 } = __VLS_42.slots;
            let __VLS_46;
            /** @ts-ignore @type { | typeof __VLS_components.GraduationCap} */
            GraduationCap;
            // @ts-ignore
            const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_48 = __VLS_47({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_47));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [certification, courseName,];
        }
        (__VLS_ctx.__('Get Certified'));
        // @ts-ignore
        [__,];
        var __VLS_42;
        // @ts-ignore
        [];
        var __VLS_36;
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        courseName: {
            type: String,
            required: true,
        },
    },
});
export default {};
