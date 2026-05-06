/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { inject, reactive } from 'vue';
import { createResource, Dialog, FormControl, Switch, toast } from 'frappe-ui';
import Link from '@/components/Controls/Link.vue';
const show = defineModel();
const dayjs = inject('$dayjs');
const details = reactive({
    issue_date: dayjs().format('YYYY-MM-DD'),
    expiry_date: null,
    template: null,
    evaluator: null,
    published: true,
});
const props = defineProps({
    batch: {
        type: [Object, null],
        required: true,
    },
});
const createCertificate = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        return {
            doc: {
                doctype: 'LMS Certificate',
                issue_date: details.issue_date,
                expiry_date: details.expiry_date,
                template: details.template,
                published: details.published,
                course: values.course,
                batch_name: values.batch,
                member: values.member,
                evaluator: details.evaluator,
            },
        };
    },
});
const generateCertificates = (close) => {
    props.batch?.students.forEach((student) => {
        createCertificate.submit({
            course: details.course,
            batch: props.batch.name,
            member: student,
        }, {
            onError(err) {
                toast.error(err.messages?.[0] || err);
            },
        });
    });
    close();
    toast.success(__('Certificates generated successfully'));
};
const getCourses = () => {
    return props.batch?.courses.map((course) => {
        return {
            label: course.course,
            value: course.course,
        };
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
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Generate Certificates'),
        size: 'lg',
        actions: [
            {
                label: __VLS_ctx.__('Create'),
                variant: 'solid',
                onClick: ({ close }) => {
                    __VLS_ctx.generateCertificates(close);
                },
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.__('Generate Certificates'),
        size: 'lg',
        actions: [
            {
                label: __VLS_ctx.__('Create'),
                variant: 'solid',
                onClick: ({ close }) => {
                    __VLS_ctx.generateCertificates(close);
                },
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    const __VLS_8 = Link;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.details.evaluator),
        label: (__VLS_ctx.__('Evaluator')),
        doctype: "Course Evaluator",
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.details.evaluator),
        label: (__VLS_ctx.__('Evaluator')),
        doctype: "Course Evaluator",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        type: "date",
        modelValue: (__VLS_ctx.details.issue_date),
        label: (__VLS_ctx.__('Issue Date')),
    }));
    const __VLS_15 = __VLS_14({
        type: "date",
        modelValue: (__VLS_ctx.details.issue_date),
        label: (__VLS_ctx.__('Issue Date')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        type: "date",
        modelValue: (__VLS_ctx.details.expiry_date),
        label: (__VLS_ctx.__('Expiry Date')),
    }));
    const __VLS_20 = __VLS_19({
        type: "date",
        modelValue: (__VLS_ctx.details.expiry_date),
        label: (__VLS_ctx.__('Expiry Date')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_23;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        type: "select",
        modelValue: (__VLS_ctx.details.course),
        label: (__VLS_ctx.__('Course')),
        options: (__VLS_ctx.getCourses()),
    }));
    const __VLS_25 = __VLS_24({
        type: "select",
        modelValue: (__VLS_ctx.details.course),
        label: (__VLS_ctx.__('Course')),
        options: (__VLS_ctx.getCourses()),
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    const __VLS_28 = Link;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
        modelValue: (__VLS_ctx.details.template),
        label: (__VLS_ctx.__('Template')),
        doctype: "Print Format",
        filters: ({
            doc_type: 'LMS Certificate',
        }),
    }));
    const __VLS_30 = __VLS_29({
        modelValue: (__VLS_ctx.details.template),
        label: (__VLS_ctx.__('Template')),
        doctype: "Print Format",
        filters: ({
            doc_type: 'LMS Certificate',
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_33;
    /** @ts-ignore @type { | typeof __VLS_components.Switch} */
    Switch;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
        size: "sm",
        label: (__VLS_ctx.__('Published')),
        description: (__VLS_ctx.__('Enabling this will publish the certificate on the certified participants page.')),
        modelValue: (__VLS_ctx.details.published),
    }));
    const __VLS_35 = __VLS_34({
        size: "sm",
        label: (__VLS_ctx.__('Published')),
        description: (__VLS_ctx.__('Enabling this will publish the certificate on the certified participants page.')),
        modelValue: (__VLS_ctx.details.published),
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    // @ts-ignore
    [show, __, __, __, __, __, __, __, __, __, generateCertificates, details, details, details, details, details, details, getCourses,];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    props: {
        ...{},
        ...{
            batch: {
                type: [Object, null],
                required: true,
            },
        },
    },
});
export default {};
