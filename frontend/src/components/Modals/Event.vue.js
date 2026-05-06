/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, Button, FormControl, createResource, Tabs, Tooltip, Textarea, toast, } from 'frappe-ui';
import { User, Calendar, Clock, Video, BookOpen, FileText, GraduationCap, Users, ClipboardList, } from 'lucide-vue-next';
import { inject, reactive, watch, ref, computed } from 'vue';
import { formatTime } from '@/utils';
import Rating from '@/components/Controls/Rating.vue';
import Link from '@/components/Controls/Link.vue';
const show = defineModel();
const user = inject('$user');
const dayjs = inject('$dayjs');
const tabIndex = ref(0);
const showCertification = ref(false);
const evaluation = reactive({});
const certificate = reactive({});
const props = defineProps({
    event: {
        type: [Object, null],
        required: true,
    },
});
watch(user, () => {
    if (userIsEvaluator()) {
        defaultTemplate.reload();
    }
});
const userIsEvaluator = () => {
    return user.data && user.data.name == props.event.evaluator;
};
const defaultTemplate = createResource({
    url: 'frappe.client.get_value',
    makeParams(values) {
        return {
            doctype: 'Property Setter',
            fieldname: 'value',
            filters: {
                doc_type: 'LMS Certificate',
                property: 'default_print_format',
            },
        };
    },
    onSuccess(data) {
        certificate.template = data.value;
    },
});
const openCallLink = (link) => {
    window.open(link, '_blank');
};
const evaluationResource = createResource({
    url: 'lms.lms.api.save_evaluation_details',
    makeParams(values) {
        return {
            member: props.event.member,
            course: props.event.course,
            batch_name: props.event.batch_name,
            date: props.event.date,
            start_time: props.event.start_time,
            end_time: props.event.end_time,
            status: evaluation.status,
            rating: evaluation.rating,
            summary: evaluation.summary,
            evaluator: props.event.evaluator,
        };
    },
    auto: false,
    onSuccess(data) {
        evaluation.name = data.name;
    },
});
const evaluationDetails = createResource({
    url: 'frappe.client.get',
    makeParams(values) {
        return {
            doctype: 'LMS Certificate Evaluation',
            filters: {
                member: props.event.member,
                course: props.event.course,
            },
        };
    },
    onSuccess(data) {
        for (const key in data) {
            if (key in evaluation)
                evaluation[key] = data[key];
            if (key == 'rating')
                evaluation.rating = data.rating * 5;
            if (evaluation.status == 'Pass')
                showCertification.value = true;
        }
    },
    auto: false,
});
const saveEvaluation = () => {
    evaluationResource.submit({}, {
        onSuccess: () => {
            if (evaluation.status == 'Pass') {
                showCertification.value = true;
            }
            else {
                show.value = false;
            }
            toast.success(__('Evaluation saved successfully'));
        },
        onError(err) {
            toast.warning(__(err.messages?.[0] || err));
        },
    });
};
const certificateResource = createResource({
    url: 'lms.lms.api.save_certificate_details',
    makeParams(values) {
        return {
            member: props.event.member,
            course: props.event.course,
            batch_name: props.event.batch_name,
            published: certificate.published,
            issue_date: certificate.issue_date,
            expiry_date: certificate.expiry_date,
            template: certificate.template,
            evaluator: props.event.evaluator,
        };
    },
    auto: false,
    onSuccess(data) {
        certificate.name = data;
    },
    onError(err) {
        toast.warning(__(err.messages?.[0] || err));
    },
});
const certificateDetails = createResource({
    url: 'frappe.client.get',
    makeParams(values) {
        return {
            doctype: 'LMS Certificate',
            filters: {
                member: props.event.member,
                course: props.event.course,
            },
        };
    },
    onSuccess(data) {
        for (const key in data) {
            if (key in certificate)
                certificate[key] = data[key];
            certificate.name = data.name;
            showCertification.value = true;
        }
    },
    onError(err) {
        certificate.template = defaultTemplate.data?.value;
    },
    auto: false,
});
const saveCertificate = () => {
    certificateResource.submit({}, {
        onSuccess: () => {
            toast.success(__('Certificate saved successfully'));
        },
        onError(err) {
            toast.error(__(err.messages?.[0] || err));
        },
    });
};
watch(show, () => {
    if (show.value) {
        evaluation.rating = 0;
        evaluation.status = 'Pending';
        evaluation.summary = '';
        evaluationDetails.reload();
        certificate.published = true;
        certificate.issue_date = dayjs().format('YYYY-MM-DD');
        certificate.expiry_date = null;
        certificate.template = null;
        certificate.name = null;
        certificateDetails.reload();
    }
});
const openCertificate = (certificate) => {
    window.open(`/api/method/frappe.utils.print_format.download_pdf?doctype=LMS+Certificate&name=${certificate.name}&format=${encodeURIComponent(certificate.template)}`);
};
const openLink = (type, name) => {
    let url = '';
    if (type === 'course') {
        url = `/lms/courses/${name}`;
    }
    else if (type === 'batch') {
        url = `/lms/batches/${name}#students`;
    }
    window.open(url, '_blank');
};
const statusOptions = computed(() => {
    return [
        {
            value: 'Pending',
            label: __('Pending'),
        },
        {
            value: 'In Progress',
            label: __('In Progress'),
        },
        {
            value: 'Pass',
            label: __('Pass'),
        },
        {
            value: 'Fail',
            label: __('Fail'),
        },
    ];
});
const tabs = computed(() => {
    const tabsArray = [
        {
            label: __('Evaluation'),
            icon: ClipboardList,
        },
    ];
    if (showCertification.value) {
        tabsArray.push({
            label: __('Certification'),
            icon: GraduationCap,
        });
    }
    return tabsArray;
});
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
        size: '2xl',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        size: '2xl',
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { body: __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex text-base" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col w-1/2 p-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    (__VLS_ctx.event.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col space-y-4 text-sm text-ink-gray-8" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-8']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        text: (__VLS_ctx.__('Email ID')),
    }));
    const __VLS_10 = __VLS_9({
        text: (__VLS_ctx.__('Email ID')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const { default: __VLS_13 } = __VLS_11.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2 w-fit" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
    let __VLS_14;
    /** @ts-ignore @type { | typeof __VLS_components.User} */
    User;
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.event.member);
    // @ts-ignore
    [show, event, event, __,];
    var __VLS_11;
    let __VLS_19;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        text: (__VLS_ctx.__('Course')),
    }));
    const __VLS_21 = __VLS_20({
        text: (__VLS_ctx.__('Course')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    const { default: __VLS_24 } = __VLS_22.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.openLink('course', __VLS_ctx.event.course);
                // @ts-ignore
                [event, __, openLink,];
            } },
        ...{ class: "flex space-x-2 w-fit cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    let __VLS_25;
    /** @ts-ignore @type { | typeof __VLS_components.BookOpen} */
    BookOpen;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        ...{ class: "h-4 w-4 stroke-1.5" },
    }));
    const __VLS_27 = __VLS_26({
        ...{ class: "h-4 w-4 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.event.course_title);
    // @ts-ignore
    [event,];
    var __VLS_22;
    if (__VLS_ctx.event.batch_title) {
        let __VLS_30;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
            text: (__VLS_ctx.__('Batch')),
        }));
        const __VLS_32 = __VLS_31({
            text: (__VLS_ctx.__('Batch')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_31));
        const { default: __VLS_35 } = __VLS_33.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.event.batch_title))
                        return;
                    __VLS_ctx.openLink('batch', __VLS_ctx.event.batch_name);
                    // @ts-ignore
                    [event, event, __, openLink,];
                } },
            ...{ class: "flex space-x-2 w-fit cursor-pointer" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        let __VLS_36;
        /** @ts-ignore @type { | typeof __VLS_components.Users} */
        Users;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_38 = __VLS_37({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.event.batch_title);
        // @ts-ignore
        [event,];
        var __VLS_33;
    }
    let __VLS_41;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
        text: (__VLS_ctx.__('Date')),
    }));
    const __VLS_43 = __VLS_42({
        text: (__VLS_ctx.__('Date')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    const { default: __VLS_46 } = __VLS_44.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2 w-fit" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
    let __VLS_47;
    /** @ts-ignore @type { | typeof __VLS_components.Calendar} */
    Calendar;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
        ...{ class: "h-4 w-4 stroke-1.5" },
    }));
    const __VLS_49 = __VLS_48({
        ...{ class: "h-4 w-4 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.dayjs(__VLS_ctx.event.date).format('DD MMM YYYY'));
    // @ts-ignore
    [event, __, dayjs,];
    var __VLS_44;
    let __VLS_52;
    /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
    Tooltip;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        text: (__VLS_ctx.__('Time')),
    }));
    const __VLS_54 = __VLS_53({
        text: (__VLS_ctx.__('Time')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    const { default: __VLS_57 } = __VLS_55.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2 w-fit" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
    let __VLS_58;
    /** @ts-ignore @type { | typeof __VLS_components.Clock} */
    Clock;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
        ...{ class: "h-4 w-4 stroke-1.5" },
    }));
    const __VLS_60 = __VLS_59({
        ...{ class: "h-4 w-4 stroke-1.5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.formatTime(__VLS_ctx.event.start_time));
    (__VLS_ctx.formatTime(__VLS_ctx.event.end_time));
    // @ts-ignore
    [event, event, __, formatTime, formatTime,];
    var __VLS_55;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2 mt-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
    if (__VLS_ctx.certificate.name) {
        let __VLS_63;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
            ...{ 'onClick': {} },
            ...{ class: "w-full" },
        }));
        const __VLS_65 = __VLS_64({
            ...{ 'onClick': {} },
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        let __VLS_68;
        const __VLS_69 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.certificate.name))
                        return;
                    __VLS_ctx.openCertificate(__VLS_ctx.certificate);
                    // @ts-ignore
                    [certificate, certificate, openCertificate,];
                } });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        const { default: __VLS_70 } = __VLS_66.slots;
        {
            const { prefix: __VLS_71 } = __VLS_66.slots;
            let __VLS_72;
            /** @ts-ignore @type { | typeof __VLS_components.FileText} */
            FileText;
            // @ts-ignore
            const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }));
            const __VLS_74 = __VLS_73({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_73));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
        }
        (__VLS_ctx.__('View Certificate'));
        // @ts-ignore
        [__,];
        var __VLS_66;
        var __VLS_67;
    }
    else if (__VLS_ctx.userIsEvaluator()) {
        let __VLS_77;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
            ...{ 'onClick': {} },
            ...{ class: "w-full" },
        }));
        const __VLS_79 = __VLS_78({
            ...{ 'onClick': {} },
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_78));
        let __VLS_82;
        const __VLS_83 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.certificate.name))
                        return;
                    if (!(__VLS_ctx.userIsEvaluator()))
                        return;
                    __VLS_ctx.openCallLink(__VLS_ctx.event.venue);
                    // @ts-ignore
                    [event, userIsEvaluator, openCallLink,];
                } });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        const { default: __VLS_84 } = __VLS_80.slots;
        {
            const { prefix: __VLS_85 } = __VLS_80.slots;
            let __VLS_86;
            /** @ts-ignore @type { | typeof __VLS_components.Video} */
            Video;
            // @ts-ignore
            const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }));
            const __VLS_88 = __VLS_87({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_87));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Join Meeting'));
        // @ts-ignore
        [__,];
        var __VLS_80;
        var __VLS_81;
    }
    let __VLS_91;
    /** @ts-ignore @type { | typeof __VLS_components.Tabs | typeof __VLS_components.Tabs} */
    Tabs;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
        tabs: (__VLS_ctx.tabs),
        as: "div",
        modelValue: (__VLS_ctx.tabIndex),
        ...{ class: "border-l w-1/2" },
    }));
    const __VLS_93 = __VLS_92({
        tabs: (__VLS_ctx.tabs),
        as: "div",
        modelValue: (__VLS_ctx.tabIndex),
        ...{ class: "border-l w-1/2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    /** @type {__VLS_StyleScopedClasses['border-l']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-1/2']} */ ;
    const { default: __VLS_96 } = __VLS_94.slots;
    {
        const { 'tab-panel': __VLS_97 } = __VLS_94.slots;
        const [{ tab }] = __VLS_vSlot(__VLS_97);
        if (tab.label == 'Evaluation') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-col space-y-4 p-5" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center justify-between" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            const __VLS_98 = Rating;
            // @ts-ignore
            const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
                modelValue: (__VLS_ctx.evaluation.rating),
                label: (__VLS_ctx.__('Rating')),
                disabled: (!__VLS_ctx.userIsEvaluator()),
            }));
            const __VLS_100 = __VLS_99({
                modelValue: (__VLS_ctx.evaluation.rating),
                label: (__VLS_ctx.__('Rating')),
                disabled: (!__VLS_ctx.userIsEvaluator()),
            }, ...__VLS_functionalComponentArgsRest(__VLS_99));
            let __VLS_103;
            /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
            FormControl;
            // @ts-ignore
            const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
                type: "select",
                options: (__VLS_ctx.statusOptions),
                modelValue: (__VLS_ctx.evaluation.status),
                label: (__VLS_ctx.__('Status')),
                ...{ class: "w-1/2" },
                disabled: (!__VLS_ctx.userIsEvaluator()),
            }));
            const __VLS_105 = __VLS_104({
                type: "select",
                options: (__VLS_ctx.statusOptions),
                modelValue: (__VLS_ctx.evaluation.status),
                label: (__VLS_ctx.__('Status')),
                ...{ class: "w-1/2" },
                disabled: (!__VLS_ctx.userIsEvaluator()),
            }, ...__VLS_functionalComponentArgsRest(__VLS_104));
            /** @type {__VLS_StyleScopedClasses['w-1/2']} */ ;
            let __VLS_108;
            /** @ts-ignore @type { | typeof __VLS_components.Textarea} */
            Textarea;
            // @ts-ignore
            const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
                modelValue: (__VLS_ctx.evaluation.summary),
                label: (__VLS_ctx.__('Summary')),
                rows: (7),
                disabled: (!__VLS_ctx.userIsEvaluator()),
            }));
            const __VLS_110 = __VLS_109({
                modelValue: (__VLS_ctx.evaluation.summary),
                label: (__VLS_ctx.__('Summary')),
                rows: (7),
                disabled: (!__VLS_ctx.userIsEvaluator()),
            }, ...__VLS_functionalComponentArgsRest(__VLS_109));
            if (__VLS_ctx.userIsEvaluator()) {
                let __VLS_113;
                /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                Button;
                // @ts-ignore
                const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
                    ...{ 'onClick': {} },
                    variant: "solid",
                }));
                const __VLS_115 = __VLS_114({
                    ...{ 'onClick': {} },
                    variant: "solid",
                }, ...__VLS_functionalComponentArgsRest(__VLS_114));
                let __VLS_118;
                const __VLS_119 = ({ click: {} },
                    { onClick: (...[$event]) => {
                            if (!(tab.label == 'Evaluation'))
                                return;
                            if (!(__VLS_ctx.userIsEvaluator()))
                                return;
                            __VLS_ctx.saveEvaluation();
                            // @ts-ignore
                            [__, __, __, userIsEvaluator, userIsEvaluator, userIsEvaluator, userIsEvaluator, tabs, tabIndex, evaluation, evaluation, evaluation, statusOptions, saveEvaluation,];
                        } });
                const { default: __VLS_120 } = __VLS_116.slots;
                (__VLS_ctx.__('Save'));
                // @ts-ignore
                [__,];
                var __VLS_116;
                var __VLS_117;
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-col space-y-4 p-5" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
            let __VLS_121;
            /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
            FormControl;
            // @ts-ignore
            const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
                type: "checkbox",
                modelValue: (__VLS_ctx.certificate.published),
                label: (__VLS_ctx.__('Published')),
                disabled: (!__VLS_ctx.userIsEvaluator()),
            }));
            const __VLS_123 = __VLS_122({
                type: "checkbox",
                modelValue: (__VLS_ctx.certificate.published),
                label: (__VLS_ctx.__('Published')),
                disabled: (!__VLS_ctx.userIsEvaluator()),
            }, ...__VLS_functionalComponentArgsRest(__VLS_122));
            const __VLS_126 = Link;
            // @ts-ignore
            const __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({
                modelValue: (__VLS_ctx.certificate.template),
                label: (__VLS_ctx.__('Template')),
                doctype: "Print Format",
                disabled: (!__VLS_ctx.userIsEvaluator()),
                filters: ({
                    doc_type: 'LMS Certificate',
                }),
            }));
            const __VLS_128 = __VLS_127({
                modelValue: (__VLS_ctx.certificate.template),
                label: (__VLS_ctx.__('Template')),
                doctype: "Print Format",
                disabled: (!__VLS_ctx.userIsEvaluator()),
                filters: ({
                    doc_type: 'LMS Certificate',
                }),
            }, ...__VLS_functionalComponentArgsRest(__VLS_127));
            let __VLS_131;
            /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
            FormControl;
            // @ts-ignore
            const __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({
                type: "date",
                modelValue: (__VLS_ctx.certificate.issue_date),
                disabled: (!__VLS_ctx.userIsEvaluator()),
                label: (__VLS_ctx.__('Issue Date')),
            }));
            const __VLS_133 = __VLS_132({
                type: "date",
                modelValue: (__VLS_ctx.certificate.issue_date),
                disabled: (!__VLS_ctx.userIsEvaluator()),
                label: (__VLS_ctx.__('Issue Date')),
            }, ...__VLS_functionalComponentArgsRest(__VLS_132));
            let __VLS_136;
            /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
            FormControl;
            // @ts-ignore
            const __VLS_137 = __VLS_asFunctionalComponent1(__VLS_136, new __VLS_136({
                type: "date",
                modelValue: (__VLS_ctx.certificate.expiry_date),
                disabled: (!__VLS_ctx.userIsEvaluator()),
                label: (__VLS_ctx.__('Expiry Date')),
            }));
            const __VLS_138 = __VLS_137({
                type: "date",
                modelValue: (__VLS_ctx.certificate.expiry_date),
                disabled: (!__VLS_ctx.userIsEvaluator()),
                label: (__VLS_ctx.__('Expiry Date')),
            }, ...__VLS_functionalComponentArgsRest(__VLS_137));
            if (__VLS_ctx.userIsEvaluator()) {
                let __VLS_141;
                /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                Button;
                // @ts-ignore
                const __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141({
                    ...{ 'onClick': {} },
                    variant: "solid",
                }));
                const __VLS_143 = __VLS_142({
                    ...{ 'onClick': {} },
                    variant: "solid",
                }, ...__VLS_functionalComponentArgsRest(__VLS_142));
                let __VLS_146;
                const __VLS_147 = ({ click: {} },
                    { onClick: (...[$event]) => {
                            if (!!(tab.label == 'Evaluation'))
                                return;
                            if (!(__VLS_ctx.userIsEvaluator()))
                                return;
                            __VLS_ctx.saveCertificate();
                            // @ts-ignore
                            [__, __, __, __, certificate, certificate, certificate, certificate, userIsEvaluator, userIsEvaluator, userIsEvaluator, userIsEvaluator, userIsEvaluator, saveCertificate,];
                        } });
                const { default: __VLS_148 } = __VLS_144.slots;
                (__VLS_ctx.__('Save'));
                // @ts-ignore
                [__,];
                var __VLS_144;
                var __VLS_145;
            }
        }
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_94;
    // @ts-ignore
    [];
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
            event: {
                type: [Object, null],
                required: true,
            },
        },
    },
});
export default {};
