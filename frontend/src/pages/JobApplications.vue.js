/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Avatar, Button, Breadcrumbs, call, Dialog, Dropdown, FeatherIcon, FormControl, TextEditor, ListView, ListHeader, ListHeaderItem, ListRows, ListRow, ListRowItem, createResource, createListResource, usePageMeta, toast, } from 'frappe-ui';
import { RefreshCw } from 'lucide-vue-next';
import { computed, inject, onMounted, ref, reactive } from 'vue';
import { sessionStore } from '../stores/session';
import EmptyState from '@/components/EmptyState.vue';
const dayjs = inject('$dayjs');
const { brand } = sessionStore();
const showEmailModal = ref(false);
const selectedApplicant = ref(null);
const applicationCount = ref(0);
const emailForm = reactive({
    subject: '',
    message: '',
    replyTo: '',
});
const props = defineProps({
    job: {
        type: String,
        required: true,
    },
});
onMounted(() => {
    getApplicationCount();
});
const getApplicationCount = () => {
    call('frappe.client.get_count', {
        doctype: 'LMS Job Application',
        filters: { job: props.job },
    }).then((count) => {
        applicationCount.value = count;
    });
};
const applications = createListResource({
    doctype: 'LMS Job Application',
    fields: [
        'name',
        'user.user_image as user_image',
        'user.full_name as full_name',
        'user.email as email',
        'creation',
        'resume',
        'job.job_title as job_title',
    ],
    filters: {
        job: props.job,
    },
    auto: true,
});
const emailResource = createResource({
    url: 'frappe.core.doctype.communication.email.make',
    makeParams(values) {
        return {
            recipients: selectedApplicant.value.email,
            cc: emailForm.replyTo,
            subject: emailForm.subject,
            content: emailForm.message,
            doctype: 'LMS Job Application',
            name: selectedApplicant.value.name,
            send_email: 1,
            now: true,
        };
    },
});
const openEmailModal = (applicant) => {
    selectedApplicant.value = applicant;
    emailForm.subject = `Job Application for ${applications.data?.[0]?.job_title} - ${applicant.full_name}`;
    emailForm.replyTo = '';
    emailForm.message = '';
    showEmailModal.value = true;
};
const sendEmail = (close) => {
    emailResource.submit({}, {
        validate() {
            if (!emailForm.subject) {
                return __('Subject is required');
            }
            if (!emailForm.message) {
                return __('Message is required');
            }
        },
        onSuccess: () => {
            toast.success(__('Email sent successfully'));
            close();
        },
        onError: (err) => {
            toast.error(err.messages?.[0] || err);
        },
    });
};
const downloadResume = (resumeUrl) => {
    window.open(resumeUrl, '_blank');
};
const getActionOptions = (row) => {
    const options = [];
    if (row.resume) {
        options.push({
            label: __('View Resume'),
            icon: 'download',
            onClick: () => downloadResume(row.resume),
        });
    }
    options.push({
        label: __('Send Email'),
        icon: 'mail',
        onClick: () => openEmailModal(row),
    });
    return options;
};
const applicationColumns = computed(() => {
    return [
        {
            label: __('Full Name'),
            key: 'full_name',
            width: 2,
            icon: 'user',
        },
        {
            label: __('Email'),
            key: 'email',
            width: 2,
            icon: 'at-sign',
        },
        {
            label: __('Applied On'),
            key: 'applied_on',
            width: 1,
            icon: 'calendar',
        },
        {
            label: '',
            key: 'actions',
            width: 1,
        },
    ];
});
const applicantRows = computed(() => {
    if (!applications.data)
        return [];
    return applications.data.map((application) => ({
        ...application,
        full_name: application.full_name,
        applied_on: dayjs(application.creation).fromNow(),
    }));
});
usePageMeta(() => {
    return {
        title: `Applications - ${applications.data?.[0]?.job_title}`,
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
        { label: __VLS_ctx.__('Jobs'), route: { name: 'Jobs' } },
        {
            label: __VLS_ctx.applications.data?.[0]?.job_title,
            route: { name: 'JobDetail', params: { job: props.job } },
        },
        { label: __VLS_ctx.__('Applications') },
    ]),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "h-7" },
    items: ([
        { label: __VLS_ctx.__('Jobs'), route: { name: 'Jobs' } },
        {
            label: __VLS_ctx.applications.data?.[0]?.job_title,
            route: { name: 'JobDetail', params: { job: props.job } },
        },
        { label: __VLS_ctx.__('Applications') },
    ]),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-7']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "max-w-4xl mx-auto pt-5 p-4" },
});
/** @type {__VLS_StyleScopedClasses['max-w-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mb-6" },
});
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "text-xl font-semibold text-ink-gray-7 mb-4 md:mb-0" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:mb-0']} */ ;
(__VLS_ctx.applicationCount);
(__VLS_ctx.applicationCount === 1 ? __VLS_ctx.__('Application') : __VLS_ctx.__('Applications'));
if (__VLS_ctx.applications.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.ListView | typeof __VLS_components.ListView} */
    ListView;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        columns: (__VLS_ctx.applicationColumns),
        rows: (__VLS_ctx.applicantRows),
        rowKey: "name",
        options: ({
            showTooltip: false,
            selectable: false,
        }),
    }));
    const __VLS_7 = __VLS_6({
        columns: (__VLS_ctx.applicationColumns),
        rows: (__VLS_ctx.applicantRows),
        rowKey: "name",
        options: ({
            showTooltip: false,
            selectable: false,
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const { default: __VLS_10 } = __VLS_8.slots;
    let __VLS_11;
    /** @ts-ignore @type { | typeof __VLS_components.ListHeader | typeof __VLS_components.ListHeader} */
    ListHeader;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }));
    const __VLS_13 = __VLS_12({
        ...{ class: "mb-2 grid items-center space-x-4 rounded bg-surface-gray-2 p-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    const { default: __VLS_16 } = __VLS_14.slots;
    for (const [item] of __VLS_vFor((__VLS_ctx.applicationColumns))) {
        let __VLS_17;
        /** @ts-ignore @type { | typeof __VLS_components.ListHeaderItem | typeof __VLS_components.ListHeaderItem} */
        ListHeaderItem;
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
            item: (item),
            key: (item.key),
        }));
        const __VLS_19 = __VLS_18({
            item: (item),
            key: (item.key),
        }, ...__VLS_functionalComponentArgsRest(__VLS_18));
        const { default: __VLS_22 } = __VLS_20.slots;
        {
            const { prefix: __VLS_23 } = __VLS_20.slots;
            const [{ item }] = __VLS_vSlot(__VLS_23);
            if (item.icon) {
                let __VLS_24;
                /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
                FeatherIcon;
                // @ts-ignore
                const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
                    name: (item.icon?.toString()),
                    ...{ class: "h-4 w-4" },
                }));
                const __VLS_26 = __VLS_25({
                    name: (item.icon?.toString()),
                    ...{ class: "h-4 w-4" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_25));
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            }
            // @ts-ignore
            [__, __, __, __, applications, applications, applicationCount, applicationCount, applicationColumns, applicationColumns, applicantRows,];
        }
        // @ts-ignore
        [];
        var __VLS_20;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_14;
    let __VLS_29;
    /** @ts-ignore @type { | typeof __VLS_components.ListRows | typeof __VLS_components.ListRows} */
    ListRows;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({}));
    const __VLS_31 = __VLS_30({}, ...__VLS_functionalComponentArgsRest(__VLS_30));
    const { default: __VLS_34 } = __VLS_32.slots;
    for (const [row] of __VLS_vFor((__VLS_ctx.applicantRows))) {
        let __VLS_35;
        /** @ts-ignore @type { | typeof __VLS_components.ListRow | typeof __VLS_components.ListRow} */
        ListRow;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
            row: (row),
            ...{ class: "cursor-pointer" },
        }));
        const __VLS_37 = __VLS_36({
            row: (row),
            ...{ class: "cursor-pointer" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_36));
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        {
            const { default: __VLS_40 } = __VLS_38.slots;
            const [{ column, item }] = __VLS_vSlot(__VLS_40);
            let __VLS_41;
            /** @ts-ignore @type { | typeof __VLS_components.ListRowItem | typeof __VLS_components.ListRowItem} */
            ListRowItem;
            // @ts-ignore
            const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
                item: (item),
            }));
            const __VLS_43 = __VLS_42({
                item: (item),
            }, ...__VLS_functionalComponentArgsRest(__VLS_42));
            const { default: __VLS_46 } = __VLS_44.slots;
            if (column.key === 'full_name') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center space-x-3" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
                let __VLS_47;
                /** @ts-ignore @type { | typeof __VLS_components.Avatar} */
                Avatar;
                // @ts-ignore
                const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
                    size: "sm",
                    image: (row['user_image']),
                    label: (row['full_name']),
                }));
                const __VLS_49 = __VLS_48({
                    size: "sm",
                    image: (row['user_image']),
                    label: (row['full_name']),
                }, ...__VLS_functionalComponentArgsRest(__VLS_48));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (item);
            }
            else if (column.key === 'actions') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex justify-center" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                let __VLS_52;
                /** @ts-ignore @type { | typeof __VLS_components.Dropdown | typeof __VLS_components.Dropdown} */
                Dropdown;
                // @ts-ignore
                const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
                    options: (__VLS_ctx.getActionOptions(row)),
                }));
                const __VLS_54 = __VLS_53({
                    options: (__VLS_ctx.getActionOptions(row)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_53));
                const { default: __VLS_57 } = __VLS_55.slots;
                let __VLS_58;
                /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                Button;
                // @ts-ignore
                const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
                    variant: "ghost",
                }));
                const __VLS_60 = __VLS_59({
                    variant: "ghost",
                }, ...__VLS_functionalComponentArgsRest(__VLS_59));
                const { default: __VLS_63 } = __VLS_61.slots;
                let __VLS_64;
                /** @ts-ignore @type { | typeof __VLS_components.FeatherIcon} */
                FeatherIcon;
                // @ts-ignore
                const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
                    name: "more-horizontal",
                    ...{ class: "w-4 h-4" },
                }));
                const __VLS_66 = __VLS_65({
                    name: "more-horizontal",
                    ...{ class: "w-4 h-4" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_65));
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                // @ts-ignore
                [applicantRows, getActionOptions,];
                var __VLS_61;
                // @ts-ignore
                [];
                var __VLS_55;
            }
            else if (column.key === 'applied_on') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-sm text-ink-gray-6" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-6']} */ ;
                (item);
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                (item);
            }
            // @ts-ignore
            [];
            var __VLS_44;
            // @ts-ignore
            [];
            __VLS_38.slots['' /* empty slot name completion */];
        }
        var __VLS_38;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_32;
    // @ts-ignore
    [];
    var __VLS_8;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-center mt-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    if (__VLS_ctx.applications.hasNextPage) {
        let __VLS_69;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
            ...{ 'onClick': {} },
        }));
        const __VLS_71 = __VLS_70({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        let __VLS_74;
        const __VLS_75 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.applications.data?.length))
                        return;
                    if (!(__VLS_ctx.applications.hasNextPage))
                        return;
                    __VLS_ctx.applications.next();
                    // @ts-ignore
                    [applications, applications,];
                } });
        const { default: __VLS_76 } = __VLS_72.slots;
        {
            const { prefix: __VLS_77 } = __VLS_72.slots;
            let __VLS_78;
            /** @ts-ignore @type { | typeof __VLS_components.RefreshCw} */
            RefreshCw;
            // @ts-ignore
            const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
                ...{ class: "size-4 stroke-1.5" },
            }));
            const __VLS_80 = __VLS_79({
                ...{ class: "size-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_79));
            /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [];
        }
        (__VLS_ctx.__('Load More'));
        // @ts-ignore
        [__,];
        var __VLS_72;
        var __VLS_73;
    }
}
else if (!__VLS_ctx.applications.loading) {
    const __VLS_83 = EmptyState;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
        type: "Job Applications",
    }));
    const __VLS_85 = __VLS_84({
        type: "Job Applications",
    }, ...__VLS_functionalComponentArgsRest(__VLS_84));
}
let __VLS_88;
/** @ts-ignore @type { | typeof __VLS_components.Dialog | typeof __VLS_components.Dialog} */
Dialog;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
    modelValue: (__VLS_ctx.showEmailModal),
    options: ({
        title: __VLS_ctx.__('Send Email to {0}').format(__VLS_ctx.selectedApplicant?.full_name),
        size: 'lg',
        actions: [
            {
                label: __VLS_ctx.__('Send'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.sendEmail(close),
            },
        ],
    }),
}));
const __VLS_90 = __VLS_89({
    modelValue: (__VLS_ctx.showEmailModal),
    options: ({
        title: __VLS_ctx.__('Send Email to {0}').format(__VLS_ctx.selectedApplicant?.full_name),
        size: 'lg',
        actions: [
            {
                label: __VLS_ctx.__('Send'),
                variant: 'solid',
                onClick: (close) => __VLS_ctx.sendEmail(close),
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
const { default: __VLS_93 } = __VLS_91.slots;
{
    const { 'body-content': __VLS_94 } = __VLS_91.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_95;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
        modelValue: (__VLS_ctx.emailForm.subject),
        label: (__VLS_ctx.__('Subject')),
        placeholder: (__VLS_ctx.__('Enter email subject')),
        required: true,
    }));
    const __VLS_97 = __VLS_96({
        modelValue: (__VLS_ctx.emailForm.subject),
        label: (__VLS_ctx.__('Subject')),
        placeholder: (__VLS_ctx.__('Enter email subject')),
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    let __VLS_100;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
        modelValue: (__VLS_ctx.emailForm.replyTo),
        label: (__VLS_ctx.__('Reply To')),
        placeholder: (__VLS_ctx.__('Enter reply to email')),
    }));
    const __VLS_102 = __VLS_101({
        modelValue: (__VLS_ctx.emailForm.replyTo),
        label: (__VLS_ctx.__('Reply To')),
        placeholder: (__VLS_ctx.__('Enter reply to email')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-ink-gray-5 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    (__VLS_ctx.__('Message'));
    let __VLS_105;
    /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
    TextEditor;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
        ...{ 'onChange': {} },
        content: (__VLS_ctx.emailForm.message),
        editable: (true),
        fixedMenu: (true),
        editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem]",
    }));
    const __VLS_107 = __VLS_106({
        ...{ 'onChange': {} },
        content: (__VLS_ctx.emailForm.message),
        editable: (true),
        fixedMenu: (true),
        editorClass: "prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem]",
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    let __VLS_110;
    const __VLS_111 = ({ change: {} },
        { onChange: ((val) => (__VLS_ctx.emailForm.message = val)) });
    var __VLS_108;
    var __VLS_109;
    // @ts-ignore
    [__, __, __, __, __, __, __, applications, showEmailModal, selectedApplicant, sendEmail, emailForm, emailForm, emailForm, emailForm,];
}
// @ts-ignore
[];
var __VLS_91;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        job: {
            type: String,
            required: true,
        },
    },
});
export default {};
