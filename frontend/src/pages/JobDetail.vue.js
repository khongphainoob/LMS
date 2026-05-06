/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Badge, Button, Breadcrumbs, createResource, usePageMeta, } from 'frappe-ui';
import { inject, ref, computed } from 'vue';
import { sessionStore } from '../stores/session';
import JobApplicationModal from '@/components/Modals/JobApplicationModal.vue';
import { Check, SendHorizonal, Pencil, CalendarDays, SquareUserRound, SquareArrowOutUpRight, FileText, ClipboardType, BriefcaseBusiness, Users, } from 'lucide-vue-next';
const user = inject('$user');
const dayjs = inject('$dayjs');
const { brand } = sessionStore();
const showApplicationModal = ref(false);
const readOnlyMode = window.read_only_mode;
const props = defineProps({
    job: {
        type: String,
        required: true,
    },
});
const job = createResource({
    url: 'lms.lms.api.get_job_details',
    params: {
        job: props.job,
    },
    cache: ['job', props.job],
    auto: true,
    onSuccess: (data) => {
        if (user.data?.name) {
            jobApplication.submit();
            applicationCount.submit();
        }
    },
});
const jobApplication = createResource({
    url: 'frappe.client.get_list',
    makeParams(values) {
        return {
            doctype: 'LMS Job Application',
            filters: {
                job: job.data?.name,
                user: user.data?.name,
            },
        };
    },
});
const applicationCount = createResource({
    url: 'frappe.client.get_count',
    makeParams(values) {
        return {
            doctype: 'LMS Job Application',
            filters: {
                job: job.data?.name,
            },
        };
    },
});
const openApplicationModal = () => {
    showApplicationModal.value = true;
};
const redirectToLogin = (job) => {
    window.location.href = `/login?redirect-to=/job-openings/${job}`;
};
const redirectToWebsite = (url) => {
    window.open(url, '_blank');
};
const canManageJob = computed(() => {
    if (!user.data?.name || !job.data)
        return false;
    return user.data.name === job.data.owner || user.data?.is_moderator;
});
usePageMeta(() => {
    return {
        title: job.data?.job_title,
        icon: brand.favicon,
    };
});
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
    ...{ class: "" },
});
/** @type {__VLS_StyleScopedClasses['']} */ ;
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
    ...{ class: "h-7" },
    items: ([
        {
            label: __VLS_ctx.__('Jobs'),
            route: { name: 'Jobs' },
        },
        {
            label: __VLS_ctx.job.data?.job_title,
            route: { name: 'JobDetail', params: { job: __VLS_ctx.job.data?.name } },
        },
    ]),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "h-7" },
    items: ([
        {
            label: __VLS_ctx.__('Jobs'),
            route: { name: 'Jobs' },
        },
        {
            label: __VLS_ctx.job.data?.job_title,
            route: { name: 'JobDetail', params: { job: __VLS_ctx.job.data?.name } },
        },
    ]),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-7']} */ ;
if (__VLS_ctx.user.data?.name && !__VLS_ctx.readOnlyMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    if (__VLS_ctx.canManageJob && __VLS_ctx.applicationCount.data > 0) {
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            to: ({
                name: 'JobApplications',
                params: { job: __VLS_ctx.job.data?.name },
            }),
        }));
        const __VLS_7 = __VLS_6({
            to: ({
                name: 'JobApplications',
                params: { job: __VLS_ctx.job.data?.name },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        const { default: __VLS_10 } = __VLS_8.slots;
        let __VLS_11;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
            variant: "subtle",
        }));
        const __VLS_13 = __VLS_12({
            variant: "subtle",
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
        const { default: __VLS_16 } = __VLS_14.slots;
        (__VLS_ctx.__('View Applications'));
        // @ts-ignore
        [__, __, job, job, job, user, readOnlyMode, canManageJob, applicationCount,];
        var __VLS_14;
        // @ts-ignore
        [];
        var __VLS_8;
    }
    if (__VLS_ctx.canManageJob) {
        let __VLS_17;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
            to: ({
                name: 'JobForm',
                params: { jobName: __VLS_ctx.job.data?.name },
            }),
        }));
        const __VLS_19 = __VLS_18({
            to: ({
                name: 'JobForm',
                params: { jobName: __VLS_ctx.job.data?.name },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_18));
        const { default: __VLS_22 } = __VLS_20.slots;
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({}));
        const __VLS_25 = __VLS_24({}, ...__VLS_functionalComponentArgsRest(__VLS_24));
        const { default: __VLS_28 } = __VLS_26.slots;
        {
            const { prefix: __VLS_29 } = __VLS_26.slots;
            let __VLS_30;
            /** @ts-ignore @type { | typeof __VLS_components.Pencil} */
            Pencil;
            // @ts-ignore
            const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }));
            const __VLS_32 = __VLS_31({
                ...{ class: "h-4 w-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_31));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [job, canManageJob,];
        }
        (__VLS_ctx.__('Edit'));
        // @ts-ignore
        [__,];
        var __VLS_26;
        // @ts-ignore
        [];
        var __VLS_20;
    }
    let __VLS_35;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        ...{ 'onClick': {} },
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_40;
    const __VLS_41 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.user.data?.name && !__VLS_ctx.readOnlyMode))
                    return;
                __VLS_ctx.redirectToWebsite(__VLS_ctx.job.data?.company_website);
                // @ts-ignore
                [job, redirectToWebsite,];
            } });
    const { default: __VLS_42 } = __VLS_38.slots;
    {
        const { prefix: __VLS_43 } = __VLS_38.slots;
        let __VLS_44;
        /** @ts-ignore @type { | typeof __VLS_components.SquareArrowOutUpRight} */
        SquareArrowOutUpRight;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }));
        const __VLS_46 = __VLS_45({
            ...{ class: "h-4 w-4 stroke-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        // @ts-ignore
        [];
    }
    (__VLS_ctx.__('Visit Website'));
    // @ts-ignore
    [__,];
    var __VLS_38;
    var __VLS_39;
    if (!__VLS_ctx.jobApplication.data?.length) {
        let __VLS_49;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
            ...{ 'onClick': {} },
            variant: "solid",
        }));
        const __VLS_51 = __VLS_50({
            ...{ 'onClick': {} },
            variant: "solid",
        }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        let __VLS_54;
        const __VLS_55 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.user.data?.name && !__VLS_ctx.readOnlyMode))
                        return;
                    if (!(!__VLS_ctx.jobApplication.data?.length))
                        return;
                    __VLS_ctx.openApplicationModal();
                    // @ts-ignore
                    [jobApplication, openApplicationModal,];
                } });
        const { default: __VLS_56 } = __VLS_52.slots;
        {
            const { prefix: __VLS_57 } = __VLS_52.slots;
            let __VLS_58;
            /** @ts-ignore @type { | typeof __VLS_components.SendHorizonal} */
            SendHorizonal;
            // @ts-ignore
            const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
                ...{ class: "h-4 w-4" },
            }));
            const __VLS_60 = __VLS_59({
                ...{ class: "h-4 w-4" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_59));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            // @ts-ignore
            [];
        }
        (__VLS_ctx.__('Apply'));
        // @ts-ignore
        [__,];
        var __VLS_52;
        var __VLS_53;
    }
    else {
        let __VLS_63;
        /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
        Badge;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
            variant: "subtle",
            theme: "green",
            size: "lg",
        }));
        const __VLS_65 = __VLS_64({
            variant: "subtle",
            theme: "green",
            size: "lg",
        }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        const { default: __VLS_68 } = __VLS_66.slots;
        {
            const { prefix: __VLS_69 } = __VLS_66.slots;
            let __VLS_70;
            /** @ts-ignore @type { | typeof __VLS_components.Check} */
            Check;
            // @ts-ignore
            const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
                ...{ class: "h-4 w-4" },
            }));
            const __VLS_72 = __VLS_71({
                ...{ class: "h-4 w-4" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_71));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            // @ts-ignore
            [];
        }
        (__VLS_ctx.__('You have applied'));
        // @ts-ignore
        [__,];
        var __VLS_66;
    }
}
else if (!__VLS_ctx.readOnlyMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    let __VLS_75;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
        ...{ 'onClick': {} },
    }));
    const __VLS_77 = __VLS_76({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    let __VLS_80;
    const __VLS_81 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!!(__VLS_ctx.user.data?.name && !__VLS_ctx.readOnlyMode))
                    return;
                if (!(!__VLS_ctx.readOnlyMode))
                    return;
                __VLS_ctx.redirectToLogin(__VLS_ctx.job.data?.name);
                // @ts-ignore
                [job, readOnlyMode, redirectToLogin,];
            } });
    const { default: __VLS_82 } = __VLS_78.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('Login to apply'));
    // @ts-ignore
    [__,];
    var __VLS_78;
    var __VLS_79;
}
if (__VLS_ctx.job.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "max-w-3xl mx-auto pt-5" },
    });
    /** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-5 mb-12" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-12']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.job.data))
                    return;
                __VLS_ctx.redirectToWebsite(__VLS_ctx.job.data.company_website);
                // @ts-ignore
                [job, job, redirectToWebsite,];
            } },
        src: (__VLS_ctx.job.data.company_logo),
        ...{ class: "size-10 rounded-lg object-contain cursor-pointer mr-4" },
        alt: (__VLS_ctx.job.data.company_name),
    });
    /** @type {__VLS_StyleScopedClasses['size-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "" },
    });
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-2xl text-ink-gray-9 font-semibold mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    (__VLS_ctx.job.data.job_title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-ink-gray-5 font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.job.data.company_name);
    (__VLS_ctx.job.data.location);
    (__VLS_ctx.job.data.country);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    let __VLS_83;
    /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
    Badge;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
        size: "lg",
    }));
    const __VLS_85 = __VLS_84({
        size: "lg",
    }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    const { default: __VLS_88 } = __VLS_86.slots;
    {
        const { prefix: __VLS_89 } = __VLS_86.slots;
        let __VLS_90;
        /** @ts-ignore @type { | typeof __VLS_components.CalendarDays} */
        CalendarDays;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
            ...{ class: "size-3 stroke-2 text-ink-gray-7" },
        }));
        const __VLS_92 = __VLS_91({
            ...{ class: "size-3 stroke-2 text-ink-gray-7" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        // @ts-ignore
        [job, job, job, job, job, job,];
    }
    (__VLS_ctx.dayjs(__VLS_ctx.job.data.creation).fromNow());
    // @ts-ignore
    [job, dayjs,];
    var __VLS_86;
    let __VLS_95;
    /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
    Badge;
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
        size: "lg",
    }));
    const __VLS_97 = __VLS_96({
        size: "lg",
    }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    const { default: __VLS_100 } = __VLS_98.slots;
    {
        const { prefix: __VLS_101 } = __VLS_98.slots;
        let __VLS_102;
        /** @ts-ignore @type { | typeof __VLS_components.ClipboardType} */
        ClipboardType;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
            ...{ class: "size-3 stroke-2 text-ink-gray-7" },
        }));
        const __VLS_104 = __VLS_103({
            ...{ class: "size-3 stroke-2 text-ink-gray-7" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        // @ts-ignore
        [];
    }
    (__VLS_ctx.job.data.type);
    // @ts-ignore
    [job,];
    var __VLS_98;
    if (__VLS_ctx.job.data?.work_mode) {
        let __VLS_107;
        /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
        Badge;
        // @ts-ignore
        const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
            size: "lg",
        }));
        const __VLS_109 = __VLS_108({
            size: "lg",
        }, ...__VLS_functionalComponentArgsRest(__VLS_108));
        const { default: __VLS_112 } = __VLS_110.slots;
        {
            const { prefix: __VLS_113 } = __VLS_110.slots;
            let __VLS_114;
            /** @ts-ignore @type { | typeof __VLS_components.BriefcaseBusiness} */
            BriefcaseBusiness;
            // @ts-ignore
            const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
                ...{ class: "size-3 stroke-2 text-ink-gray-7" },
            }));
            const __VLS_116 = __VLS_115({
                ...{ class: "size-3 stroke-2 text-ink-gray-7" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_115));
            /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            // @ts-ignore
            [job,];
        }
        (__VLS_ctx.job.data.work_mode);
        // @ts-ignore
        [job,];
        var __VLS_110;
    }
    if (__VLS_ctx.applicationCount.data) {
        let __VLS_119;
        /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
        Badge;
        // @ts-ignore
        const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
            size: "lg",
        }));
        const __VLS_121 = __VLS_120({
            size: "lg",
        }, ...__VLS_functionalComponentArgsRest(__VLS_120));
        const { default: __VLS_124 } = __VLS_122.slots;
        {
            const { prefix: __VLS_125 } = __VLS_122.slots;
            let __VLS_126;
            /** @ts-ignore @type { | typeof __VLS_components.SquareUserRound} */
            SquareUserRound;
            // @ts-ignore
            const __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({
                ...{ class: "size-3 stroke-2 text-ink-gray-7" },
            }));
            const __VLS_128 = __VLS_127({
                ...{ class: "size-3 stroke-2 text-ink-gray-7" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_127));
            /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            // @ts-ignore
            [applicationCount,];
        }
        (__VLS_ctx.applicationCount.data);
        (__VLS_ctx.applicationCount.data == 1 ? __VLS_ctx.__('applicant') : __VLS_ctx.__('applicants'));
        // @ts-ignore
        [__, __, applicationCount, applicationCount,];
        var __VLS_122;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-surface-gray-2 h-px m-1 w-1/2" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-px']} */ ;
    /** @type {__VLS_StyleScopedClasses['m-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-1/2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    let __VLS_131;
    /** @ts-ignore @type { | typeof __VLS_components.FileText} */
    FileText;
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({
        ...{ class: "size-3 stroke-1 text-ink-gray-5" },
    }));
    const __VLS_133 = __VLS_132({
        ...{ class: "size-3 stroke-1 text-ink-gray-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_132));
    /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-surface-gray-2 h-px m-1 w-1/2" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-px']} */ ;
    /** @type {__VLS_StyleScopedClasses['m-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-1/2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none !whitespace-normal mt-12" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.job.data.description) }, null, null);
    /** @type {__VLS_StyleScopedClasses['ProseMirror']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-table:table-fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-td:p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-th:p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-td:border']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-th:border']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-td:border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-th:border-outline-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-td:relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-th:relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-th:bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['!whitespace-normal']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-12']} */ ;
    const __VLS_136 = JobApplicationModal;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent1(__VLS_136, new __VLS_136({
        modelValue: (__VLS_ctx.showApplicationModal),
        application: (__VLS_ctx.jobApplication),
        job: (__VLS_ctx.job.data.name),
    }));
    const __VLS_138 = __VLS_137({
        modelValue: (__VLS_ctx.showApplicationModal),
        application: (__VLS_ctx.jobApplication),
        job: (__VLS_ctx.job.data.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
}
// @ts-ignore
[job, job, jobApplication, showApplicationModal,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        job: {
            type: String,
            required: true,
        },
    },
});
export default {};
