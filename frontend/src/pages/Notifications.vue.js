/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Avatar, Breadcrumbs, Button, createListResource, createResource, dayjs, TabButtons, usePageMeta, } from 'frappe-ui';
import { sessionStore } from '../stores/session';
import { computed, inject, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Calendar, Clock, X } from 'lucide-vue-next';
import { formatTime } from '@/utils/';
const { brand } = sessionStore();
const user = inject('$user');
const socket = inject('$socket');
const activeTab = ref('Unread');
const router = useRouter();
onMounted(() => {
    if (!user.data)
        router.push({ name: 'Courses' });
    socket.on('publish_lms_notifications', (data) => {
        unReadNotifications.reload();
    });
});
const notifications = computed(() => {
    return activeTab.value === 'Unread'
        ? unReadNotifications.data
        : readNotifications.data;
});
const unReadNotifications = createListResource({
    doctype: 'Notification Log',
    url: 'lms.lms.api.get_notifications',
    filters: {
        read: 0,
    },
    auto: user.data ? true : false,
    cache: 'Unread Notifications',
});
const readNotifications = createListResource({
    doctype: 'Notification Log',
    url: 'lms.lms.api.get_notifications',
    filters: {
        read: 1,
    },
    auto: user.data ? true : false,
    cache: 'Read Notifications',
});
const markAsRead = createResource({
    url: 'frappe.desk.doctype.notification_log.notification_log.mark_as_read',
    makeParams(values) {
        return {
            docname: values.name,
        };
    },
    onSuccess(data) {
        unReadNotifications.reload();
        readNotifications.reload();
    },
});
const markAllAsRead = createResource({
    url: 'frappe.desk.doctype.notification_log.notification_log.mark_all_as_read',
    onSuccess(data) {
        unReadNotifications.reload();
        readNotifications.reload();
    },
});
const handleMarkAsRead = (logName) => {
    markAsRead.submit({ name: logName });
};
const navigateToPage = (log) => {
    if (!log.link)
        return;
    handleMarkAsRead(log.name);
    let link = log.link.split('/');
    if (link[2] == 'courses') {
        router.push({
            name: 'CourseDetail',
            params: { courseName: link[3] },
        });
    }
    else if (link.includes('batches')) {
        if (link.includes('details')) {
            router.push({
                name: 'BatchDetail',
                params: { batchName: link.pop() },
            });
        }
        else {
            router.push({
                name: 'Batch',
                params: { batchName: link.pop() },
            });
        }
    }
    else if (link.includes('assignment-submission')) {
        router.push({
            name: 'AssignmentSubmission',
            params: {
                submissionName: link[4],
                assignmentID: link[3],
            },
        });
    }
};
const isMentionOrComment = (log) => {
    if (log.type == 'Mention') {
        return true;
    }
    if (log.subject.includes('mentioned you')) {
        return true;
    }
    if (log.subject.includes('comment')) {
        return true;
    }
    return false;
};
const showDetails = (log) => {
    return (['LMS Course', 'LMS Batch'].includes(log.document_type) &&
        log.document_details);
};
onUnmounted(() => {
    socket.off('publish_lms_notifications');
});
const breadcrumbs = computed(() => {
    let crumbs = [
        {
            label: __('Notifications'),
            route: {
                name: 'Notifications',
            },
        },
    ];
    return crumbs;
});
usePageMeta(() => {
    return {
        title: __('Notifications'),
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
    ...{ class: "sticky top-0 z-10 flex flex-col md:flex-row md:items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5" },
});
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['md:items-center']} */ ;
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
if (__VLS_ctx.activeTab === 'Unread' && __VLS_ctx.unReadNotifications.data?.length > 0) {
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.markAllAsRead.loading),
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.markAllAsRead.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = ({ click: {} },
        { onClick: (__VLS_ctx.markAllAsRead.submit) });
    const { default: __VLS_12 } = __VLS_8.slots;
    (__VLS_ctx.__('Mark all as read'));
    // @ts-ignore
    [breadcrumbs, activeTab, unReadNotifications, markAllAsRead, markAllAsRead, __,];
    var __VLS_8;
    var __VLS_9;
}
let __VLS_13;
/** @ts-ignore @type { | typeof __VLS_components.TabButtons} */
TabButtons;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    ...{ class: "inline-block" },
    buttons: ([{ label: __VLS_ctx.__('Unread'), active: true }, { label: __VLS_ctx.__('Read') }]),
    modelValue: (__VLS_ctx.activeTab),
}));
const __VLS_15 = __VLS_14({
    ...{ class: "inline-block" },
    buttons: ([{ label: __VLS_ctx.__('Unread'), active: true }, { label: __VLS_ctx.__('Read') }]),
    modelValue: (__VLS_ctx.activeTab),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
/** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "w-full md:w-3/4 mx-auto px-5 pt-6 divide-y" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['md:w-3/4']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
if (__VLS_ctx.notifications?.length) {
    for (const [log] of __VLS_vFor((__VLS_ctx.notifications))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.notifications?.length))
                        return;
                    __VLS_ctx.navigateToPage(log);
                    // @ts-ignore
                    [activeTab, __, __, notifications, notifications, navigateToPage,];
                } },
            key: (log.name),
            ...{ class: "flex space-x-2 px-2 py-4" },
            ...{ class: ({
                    'cursor-pointer': log.link,
                    'items-center': !__VLS_ctx.showDetails(log) && !__VLS_ctx.isMentionOrComment(log),
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.Avatar} */
        Avatar;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            image: (log.from_user_details.user_image),
            size: "xl",
            label: (log.from_user_details.full_name),
        }));
        const __VLS_20 = __VLS_19({
            image: (log.from_user_details.user_image),
            size: "xl",
            label: (log.from_user_details.full_name),
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-between" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-9" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (log.subject) }, null, null);
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center space-x-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm text-ink-gray-5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        (__VLS_ctx.dayjs(log.creation).fromNow());
        if (!log.read) {
            let __VLS_23;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
                ...{ 'onClick': {} },
                variant: "ghost",
            }));
            const __VLS_25 = __VLS_24({
                ...{ 'onClick': {} },
                variant: "ghost",
            }, ...__VLS_functionalComponentArgsRest(__VLS_24));
            let __VLS_28;
            const __VLS_29 = ({ click: {} },
                { onClick: ((e) => __VLS_ctx.handleMarkAsRead(log.name)) });
            const { default: __VLS_30 } = __VLS_26.slots;
            {
                const { icon: __VLS_31 } = __VLS_26.slots;
                let __VLS_32;
                /** @ts-ignore @type { | typeof __VLS_components.X} */
                X;
                // @ts-ignore
                const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
                    ...{ class: "h-4 w-4 text-ink-gray-7 stroke-1.5" },
                }));
                const __VLS_34 = __VLS_33({
                    ...{ class: "h-4 w-4 text-ink-gray-7 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_33));
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                // @ts-ignore
                [showDetails, isMentionOrComment, dayjs, handleMarkAsRead,];
            }
            // @ts-ignore
            [];
            var __VLS_26;
            var __VLS_27;
        }
        if (__VLS_ctx.isMentionOrComment(log)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "bg-surface-gray-2 rounded-md px-3 py-2 line-clamp-3 overflow-hidden" },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (log.email_content) }, null, null);
            /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['line-clamp-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        }
        else if (__VLS_ctx.showDetails(log)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-stretch border border-outline-gray-2 space-x-2 rounded-md" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-stretch']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-outline-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            if (log.document_type == 'LMS Course' &&
                log.document_details.video_link) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.iframe)({
                    src: (`https://www.youtube.com/embed/${log.document_details.video_link}`),
                    ...{ class: "rounded-l-md w-72" },
                });
                /** @type {__VLS_StyleScopedClasses['rounded-l-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-72']} */ ;
            }
            else if (log.document_type == 'LMS Batch' &&
                log.document_details.video_link) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.video)({
                    src: (log.document_details.video_link),
                    ...{ class: "rounded-l-md w-72" },
                });
                /** @type {__VLS_StyleScopedClasses['rounded-l-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-72']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "p-3" },
            });
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "bg-surface-violet-1 w-fit py-1 px-1.5 rounded-full text-ink-violet-1 text-sm mb-2" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-surface-violet-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-violet-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            (log.document_type === 'LMS Course'
                ? __VLS_ctx.__('New Course')
                : __VLS_ctx.__('New Batch'));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "font-semibold mb-1" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
            (__VLS_ctx.__(log.document_details.title));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "leading-5" },
            });
            /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
            (__VLS_ctx.__(log.document_details.short_introduction));
            if (log.document_details.start_date) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center space-x-2 text-sm mt-5" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
                let __VLS_37;
                /** @ts-ignore @type { | typeof __VLS_components.Calendar} */
                Calendar;
                // @ts-ignore
                const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
                    ...{ class: "size-3 stroke-1.5" },
                }));
                const __VLS_39 = __VLS_38({
                    ...{ class: "size-3 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_38));
                /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (__VLS_ctx.dayjs(log.document_details.start_date).format('DD MMM YYYY'));
            }
            if (log.document_details.start_time) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center space-x-2 text-sm mt-2" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
                let __VLS_42;
                /** @ts-ignore @type { | typeof __VLS_components.Clock} */
                Clock;
                // @ts-ignore
                const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
                    ...{ class: "size-3 stroke-1.5" },
                }));
                const __VLS_44 = __VLS_43({
                    ...{ class: "size-3 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_43));
                /** @type {__VLS_StyleScopedClasses['size-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (__VLS_ctx.formatTime(log.document_details.start_time));
                (log.document_details.timezone);
            }
            if (log.document_details.instructors.length > 1) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "space-y-2 mt-5" },
                });
                /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
                for (const [instructor] of __VLS_vFor((log.document_details.instructors))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "flex items-center space-x-2" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
                    let __VLS_47;
                    /** @ts-ignore @type { | typeof __VLS_components.Avatar} */
                    Avatar;
                    // @ts-ignore
                    const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
                        size: ('sm'),
                        image: (instructor.user_image),
                        label: (instructor.full_name),
                    }));
                    const __VLS_49 = __VLS_48({
                        size: ('sm'),
                        image: (instructor.user_image),
                        label: (instructor.full_name),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "font-medium text-sm" },
                    });
                    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    (instructor.full_name);
                    // @ts-ignore
                    [__, __, __, __, showDetails, isMentionOrComment, dayjs, formatTime,];
                }
            }
        }
        // @ts-ignore
        [];
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__('Nothing to see here.'));
}
// @ts-ignore
[__,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
