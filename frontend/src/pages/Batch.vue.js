/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, inject, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Breadcrumbs, Button, createResource, Tabs, Badge, usePageMeta, } from 'frappe-ui';
import { Clock, LayoutDashboard, BookOpen, Laptop, BookOpenCheck, Mail, SendIcon, MessageCircle, Globe, ClipboardPen, } from 'lucide-vue-next';
import { formatTime } from '@/utils';
import { sessionStore } from '@/stores/session';
import CourseInstructors from '@/components/CourseInstructors.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import BatchDashboard from '@/components/BatchDashboard.vue';
import BatchCourses from '@/components/BatchCourses.vue';
import LiveClass from '@/components/LiveClass.vue';
import BatchStudents from '@/components/BatchStudents.vue';
import AdminBatchDashboard from '@/components/AdminBatchDashboard.vue';
import Assessments from '@/components/Assessments.vue';
import Announcements from '@/components/Annoucements.vue';
import AnnouncementModal from '@/components/Modals/AnnouncementModal.vue';
import Discussions from '@/components/Discussions.vue';
import DateRange from '@/components/Common/DateRange.vue';
import BulkCertificates from '@/components/Modals/BulkCertificates.vue';
import BatchFeedback from '@/components/BatchFeedback.vue';
import dayjs from 'dayjs/esm';
import { getLmsRoute } from '@/utils/basePath';
const user = inject('$user');
const showAnnouncementModal = ref(false);
const openCertificateDialog = ref(false);
const route = useRoute();
const router = useRouter();
const { brand } = sessionStore();
const tabIndex = ref(0);
const readOnlyMode = window.read_only_mode;
const tabs = computed(() => {
    let batchTabs = [];
    batchTabs.push({
        label: __('Dashboard'),
        icon: LayoutDashboard,
    });
    if (isAdmin.value) {
        batchTabs.push({
            label: __('Students'),
            icon: ClipboardPen,
        });
    }
    batchTabs.push({
        label: __('Courses'),
        icon: BookOpen,
    });
    batchTabs.push({
        label: __('Classes'),
        icon: Laptop,
    });
    if (isAdmin.value) {
        batchTabs.push({
            label: __('Assessments'),
            icon: BookOpenCheck,
        });
    }
    batchTabs.push({
        label: __('Announcements'),
        icon: Mail,
    });
    batchTabs.push({
        label: __('Discussions'),
        icon: MessageCircle,
    });
    return batchTabs;
});
const props = defineProps({
    batchName: {
        type: String,
        required: true,
    },
});
onMounted(() => {
    const hash = route.hash;
    if (hash) {
        tabs.value.forEach((tab, index) => {
            if (tab.label?.toLowerCase() === hash.replace('#', '')) {
                tabIndex.value = index;
            }
        });
    }
});
const batch = createResource({
    url: 'lms.lms.utils.get_batch_details',
    cache: ['batch', props.batchName],
    params: {
        batch: props.batchName,
    },
    auto: true,
});
const breadcrumbs = computed(() => {
    let crumbs = [{ label: __('Batches'), route: { name: 'Batches' } }];
    if (!isStudent.value) {
        crumbs.push({
            label: __('Details'),
            route: {
                name: 'BatchDetail',
                params: {
                    batchName: batch.data?.name,
                },
            },
        });
    }
    crumbs.push({
        label: batch?.data?.title,
        route: { name: 'Batch', params: { batchName: props.batchName } },
    });
    return crumbs;
});
const isStudent = computed(() => {
    return (user?.data &&
        batch.data?.students?.length &&
        batch.data?.students.includes(user.data.name));
});
const redirectToLogin = () => {
    window.location.href = `/login?redirect-to=${getLmsRoute(`batches/${props.batchName}`)}`;
};
const openAnnouncementModal = () => {
    showAnnouncementModal.value = true;
};
watch(tabIndex, () => {
    const tab = tabs.value[tabIndex.value];
    if (tab.label != route.hash.replace('#', '')) {
        router.push({ ...route, hash: `#${tab.label.toLowerCase()}` });
    }
});
const canMakeAnnouncement = () => {
    if (readOnlyMode)
        return false;
    if (!batch.data?.students?.length)
        return false;
    return user.data?.is_moderator || user.data?.is_evaluator;
};
const isAdmin = computed(() => {
    return user.data?.is_moderator || user.data?.is_evaluator;
});
usePageMeta(() => {
    return {
        title: batch?.data?.title,
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
if (__VLS_ctx.isAdmin || __VLS_ctx.isStudent) {
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
        items: (__VLS_ctx.breadcrumbs),
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "h-7" },
        items: (__VLS_ctx.breadcrumbs),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    if (__VLS_ctx.isAdmin && __VLS_ctx.batch.data?.certification) {
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            ...{ 'onClick': {} },
        }));
        const __VLS_7 = __VLS_6({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        let __VLS_10;
        const __VLS_11 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isAdmin || __VLS_ctx.isStudent))
                        return;
                    if (!(__VLS_ctx.isAdmin && __VLS_ctx.batch.data?.certification))
                        return;
                    __VLS_ctx.openCertificateDialog = true;
                    // @ts-ignore
                    [isAdmin, isAdmin, isStudent, breadcrumbs, batch, openCertificateDialog,];
                } });
        const { default: __VLS_12 } = __VLS_8.slots;
        (__VLS_ctx.__('Generate Certificates'));
        // @ts-ignore
        [__,];
        var __VLS_8;
        var __VLS_9;
    }
    if (__VLS_ctx.canMakeAnnouncement()) {
        let __VLS_13;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            ...{ 'onClick': {} },
        }));
        const __VLS_15 = __VLS_14({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        let __VLS_18;
        const __VLS_19 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isAdmin || __VLS_ctx.isStudent))
                        return;
                    if (!(__VLS_ctx.canMakeAnnouncement()))
                        return;
                    __VLS_ctx.openAnnouncementModal();
                    // @ts-ignore
                    [canMakeAnnouncement, openAnnouncementModal,];
                } });
        const { default: __VLS_20 } = __VLS_16.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.__('Make an Announcement'));
        {
            const { suffix: __VLS_21 } = __VLS_16.slots;
            let __VLS_22;
            /** @ts-ignore @type { | typeof __VLS_components.SendIcon} */
            SendIcon;
            // @ts-ignore
            const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
                ...{ class: "h-4 stroke-1.5" },
            }));
            const __VLS_24 = __VLS_23({
                ...{ class: "h-4 stroke-1.5" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_23));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            // @ts-ignore
            [__,];
        }
        // @ts-ignore
        [];
        var __VLS_16;
        var __VLS_17;
    }
    if (__VLS_ctx.batch.data) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-1 md:grid-cols-[75%,25%] h-[calc(100vh-3.2rem)]" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-[75%,25%]']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-[calc(100vh-3.2rem)]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border-r" },
        });
        /** @type {__VLS_StyleScopedClasses['border-r']} */ ;
        let __VLS_27;
        /** @ts-ignore @type { | typeof __VLS_components.Tabs | typeof __VLS_components.Tabs} */
        Tabs;
        // @ts-ignore
        const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
            modelValue: (__VLS_ctx.tabIndex),
            as: "div",
            tabs: (__VLS_ctx.tabs),
            tablistClass: "overflow-y-hidden bg-surface-white",
        }));
        const __VLS_29 = __VLS_28({
            modelValue: (__VLS_ctx.tabIndex),
            as: "div",
            tabs: (__VLS_ctx.tabs),
            tablistClass: "overflow-y-hidden bg-surface-white",
        }, ...__VLS_functionalComponentArgsRest(__VLS_28));
        const { default: __VLS_32 } = __VLS_30.slots;
        {
            const { tab: __VLS_33 } = __VLS_30.slots;
            const [{ tab, selected }] = __VLS_vSlot(__VLS_33);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ class: "group -mb-px flex items-center gap-1 border-b border-transparent py-2.5 text-base text-ink-gray-5 duration-300 ease-in-out hover:border-outline-gray-3 hover:text-ink-gray-9" },
                ...{ class: ({ 'text-ink-gray-9': selected }) },
            });
            /** @type {__VLS_StyleScopedClasses['group']} */ ;
            /** @type {__VLS_StyleScopedClasses['-mb-px']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-transparent']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['ease-in-out']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-outline-gray-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-ink-gray-9']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
            if (tab.icon) {
                const __VLS_34 = (tab.icon);
                // @ts-ignore
                const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
                    ...{ class: "h-4 stroke-1.5" },
                }));
                const __VLS_36 = __VLS_35({
                    ...{ class: "h-4 stroke-1.5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_35));
                /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            }
            (__VLS_ctx.__(tab.label));
            if (tab.count) {
                let __VLS_39;
                /** @ts-ignore @type { | typeof __VLS_components.Badge | typeof __VLS_components.Badge} */
                Badge;
                // @ts-ignore
                const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
                    ...{ class: ({
                            'text-ink-gray-9 border border-gray-900': selected,
                        }) },
                    variant: "subtle",
                    theme: "gray",
                    size: "sm",
                }));
                const __VLS_41 = __VLS_40({
                    ...{ class: ({
                            'text-ink-gray-9 border border-gray-900': selected,
                        }) },
                    variant: "subtle",
                    theme: "gray",
                    size: "sm",
                }, ...__VLS_functionalComponentArgsRest(__VLS_40));
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-gray-900']} */ ;
                const { default: __VLS_44 } = __VLS_42.slots;
                (tab.count);
                // @ts-ignore
                [batch, __, tabIndex, tabs,];
                var __VLS_42;
            }
            // @ts-ignore
            [];
        }
        {
            const { 'tab-panel': __VLS_45 } = __VLS_30.slots;
            const [{ tab }] = __VLS_vSlot(__VLS_45);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "pt-5 px-5 pb-10" },
            });
            /** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
            if (tab.label == 'Courses') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                const __VLS_46 = BatchCourses;
                // @ts-ignore
                const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
                    batch: (__VLS_ctx.batch.data.name),
                }));
                const __VLS_48 = __VLS_47({
                    batch: (__VLS_ctx.batch.data.name),
                }, ...__VLS_functionalComponentArgsRest(__VLS_47));
            }
            else if (tab.label == 'Dashboard' && __VLS_ctx.isStudent) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                const __VLS_51 = BatchDashboard;
                // @ts-ignore
                const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
                    batch: (__VLS_ctx.batch),
                    isStudent: (__VLS_ctx.isStudent),
                }));
                const __VLS_53 = __VLS_52({
                    batch: (__VLS_ctx.batch),
                    isStudent: (__VLS_ctx.isStudent),
                }, ...__VLS_functionalComponentArgsRest(__VLS_52));
            }
            else if (tab.label == 'Dashboard') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                const __VLS_56 = AdminBatchDashboard;
                // @ts-ignore
                const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
                    batch: (__VLS_ctx.batch),
                }));
                const __VLS_58 = __VLS_57({
                    batch: (__VLS_ctx.batch),
                }, ...__VLS_functionalComponentArgsRest(__VLS_57));
            }
            else if (tab.label == 'Students') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                const __VLS_61 = BatchStudents;
                // @ts-ignore
                const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
                    batch: (__VLS_ctx.batch),
                }));
                const __VLS_63 = __VLS_62({
                    batch: (__VLS_ctx.batch),
                }, ...__VLS_functionalComponentArgsRest(__VLS_62));
            }
            else if (tab.label == 'Classes') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                const __VLS_66 = LiveClass;
                // @ts-ignore
                const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
                    batch: (__VLS_ctx.batch.data.name),
                    zoomAccount: (__VLS_ctx.batch.data.zoom_account),
                }));
                const __VLS_68 = __VLS_67({
                    batch: (__VLS_ctx.batch.data.name),
                    zoomAccount: (__VLS_ctx.batch.data.zoom_account),
                }, ...__VLS_functionalComponentArgsRest(__VLS_67));
            }
            else if (tab.label == 'Assessments') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                const __VLS_71 = Assessments;
                // @ts-ignore
                const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
                    batch: (__VLS_ctx.batch.data.name),
                }));
                const __VLS_73 = __VLS_72({
                    batch: (__VLS_ctx.batch.data.name),
                }, ...__VLS_functionalComponentArgsRest(__VLS_72));
            }
            else if (tab.label == 'Announcements') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                const __VLS_76 = Announcements;
                // @ts-ignore
                const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
                    batch: (__VLS_ctx.batch.data.name),
                }));
                const __VLS_78 = __VLS_77({
                    batch: (__VLS_ctx.batch.data.name),
                }, ...__VLS_functionalComponentArgsRest(__VLS_77));
            }
            else if (tab.label == 'Discussions') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                const __VLS_81 = Discussions;
                // @ts-ignore
                const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
                    doctype: "LMS Batch",
                    docname: (__VLS_ctx.batch.data.name),
                    title: (__VLS_ctx.__('Discussions')),
                    key: (__VLS_ctx.batch.data.name),
                    singleThread: (true),
                    scrollToBottom: (false),
                }));
                const __VLS_83 = __VLS_82({
                    doctype: "LMS Batch",
                    docname: (__VLS_ctx.batch.data.name),
                    title: (__VLS_ctx.__('Discussions')),
                    key: (__VLS_ctx.batch.data.name),
                    singleThread: (true),
                    scrollToBottom: (false),
                }, ...__VLS_functionalComponentArgsRest(__VLS_82));
            }
            // @ts-ignore
            [isStudent, isStudent, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, __,];
        }
        // @ts-ignore
        [];
        var __VLS_30;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "p-5 border-t md:border-t-0" },
        });
        /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:border-t-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-10" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-10']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-ink-gray-7 font-semibold mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        (__VLS_ctx.__('About this batch'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "leading-5 mb-4 text-ink-gray-7" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.batch.data.description) }, null, null);
        /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center avatar-group overlap mb-5" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['avatar-group']} */ ;
        /** @type {__VLS_StyleScopedClasses['overlap']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "h-6 mr-1" },
            ...{ class: ({
                    'avatar-group overlap': __VLS_ctx.batch.data.instructors.length > 1,
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['avatar-group']} */ ;
        /** @type {__VLS_StyleScopedClasses['overlap']} */ ;
        for (const [instructor] of __VLS_vFor((__VLS_ctx.batch.data.instructors))) {
            const __VLS_86 = UserAvatar;
            // @ts-ignore
            const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
                user: (instructor),
            }));
            const __VLS_88 = __VLS_87({
                user: (instructor),
            }, ...__VLS_functionalComponentArgsRest(__VLS_87));
            // @ts-ignore
            [batch, batch, batch, __,];
        }
        const __VLS_91 = CourseInstructors;
        // @ts-ignore
        const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
            instructors: (__VLS_ctx.batch.data.instructors),
        }));
        const __VLS_93 = __VLS_92({
            instructors: (__VLS_ctx.batch.data.instructors),
        }, ...__VLS_functionalComponentArgsRest(__VLS_92));
        const __VLS_96 = DateRange;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
            startDate: (__VLS_ctx.batch.data.start_date),
            endDate: (__VLS_ctx.batch.data.end_date),
            ...{ class: "mb-3" },
        }));
        const __VLS_98 = __VLS_97({
            startDate: (__VLS_ctx.batch.data.start_date),
            endDate: (__VLS_ctx.batch.data.end_date),
            ...{ class: "mb-3" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center mb-3 text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        let __VLS_101;
        /** @ts-ignore @type { | typeof __VLS_components.Clock} */
        Clock;
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
            ...{ class: "h-4 w-4 stroke-1.5 mr-2" },
        }));
        const __VLS_103 = __VLS_102({
            ...{ class: "h-4 w-4 stroke-1.5 mr-2" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.formatTime(__VLS_ctx.batch.data.start_time));
        (__VLS_ctx.formatTime(__VLS_ctx.batch.data.end_time));
        if (__VLS_ctx.batch.data.timezone) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center mb-3 text-ink-gray-7" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            let __VLS_106;
            /** @ts-ignore @type { | typeof __VLS_components.Globe} */
            Globe;
            // @ts-ignore
            const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
                ...{ class: "h-4 w-4 stroke-1.5 mr-2" },
            }));
            const __VLS_108 = __VLS_107({
                ...{ class: "h-4 w-4 stroke-1.5 mr-2" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_107));
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.batch.data.timezone);
        }
        if (__VLS_ctx.dayjs().isSameOrAfter(__VLS_ctx.dayjs(__VLS_ctx.batch.data.start_date))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-ink-gray-7 font-semibold mb-2" },
            });
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            (__VLS_ctx.__('Feedback'));
            const __VLS_111 = BatchFeedback;
            // @ts-ignore
            const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
                batch: (__VLS_ctx.batch.data?.name),
            }));
            const __VLS_113 = __VLS_112({
                batch: (__VLS_ctx.batch.data?.name),
            }, ...__VLS_functionalComponentArgsRest(__VLS_112));
        }
        const __VLS_116 = AnnouncementModal;
        // @ts-ignore
        const __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116({
            modelValue: (__VLS_ctx.showAnnouncementModal),
            batch: (__VLS_ctx.batch.data.name),
            students: (__VLS_ctx.batch.data.students),
        }));
        const __VLS_118 = __VLS_117({
            modelValue: (__VLS_ctx.showAnnouncementModal),
            batch: (__VLS_ctx.batch.data.name),
            students: (__VLS_ctx.batch.data.students),
        }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    }
}
else if (!__VLS_ctx.user.data?.name) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "" },
    });
    /** @type {__VLS_StyleScopedClasses['']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-base border rounded-md w-1/3 mx-auto my-32" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-1/3']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['my-32']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border-b px-5 py-3 font-medium" },
    });
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "inline-flex items-center before:bg-surface-red-5 before:w-2 before:h-2 before:rounded-md before:mr-2" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['before:bg-surface-red-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['before:w-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['before:h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['before:rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['before:mr-2']} */ ;
    (__VLS_ctx.__('Not Permitted'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "px-5 py-3" },
    });
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    if (__VLS_ctx.user.data) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-4 leading-6" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
        (__VLS_ctx.__('You are not a member of this batch. Please checkout our upcoming batches.'));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-4 leading-6" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
        (__VLS_ctx.__('Please login to access this page.'));
    }
    if (__VLS_ctx.user.data) {
        let __VLS_121;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
            to: ({
                name: 'Batches',
                params: {
                    batchName: __VLS_ctx.batch.data?.name,
                },
            }),
        }));
        const __VLS_123 = __VLS_122({
            to: ({
                name: 'Batches',
                params: {
                    batchName: __VLS_ctx.batch.data?.name,
                },
            }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_122));
        const { default: __VLS_126 } = __VLS_124.slots;
        let __VLS_127;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
            variant: "solid",
            ...{ class: "w-full" },
        }));
        const __VLS_129 = __VLS_128({
            variant: "solid",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_128));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        const { default: __VLS_132 } = __VLS_130.slots;
        (__VLS_ctx.__('Upcoming Batches'));
        // @ts-ignore
        [batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, batch, __, __, __, __, __, formatTime, formatTime, dayjs, dayjs, showAnnouncementModal, user, user, user,];
        var __VLS_130;
        // @ts-ignore
        [];
        var __VLS_124;
    }
    else {
        let __VLS_133;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
            ...{ 'onClick': {} },
            variant: "solid",
            ...{ class: "w-full" },
        }));
        const __VLS_135 = __VLS_134({
            ...{ 'onClick': {} },
            variant: "solid",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_134));
        let __VLS_138;
        const __VLS_139 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isAdmin || __VLS_ctx.isStudent))
                        return;
                    if (!(!__VLS_ctx.user.data?.name))
                        return;
                    if (!!(__VLS_ctx.user.data))
                        return;
                    __VLS_ctx.redirectToLogin();
                    // @ts-ignore
                    [redirectToLogin,];
                } });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        const { default: __VLS_140 } = __VLS_136.slots;
        (__VLS_ctx.__('Login'));
        // @ts-ignore
        [__,];
        var __VLS_136;
        var __VLS_137;
    }
}
if (__VLS_ctx.batch.data) {
    const __VLS_141 = BulkCertificates;
    // @ts-ignore
    const __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141({
        modelValue: (__VLS_ctx.openCertificateDialog),
        batch: (__VLS_ctx.batch.data),
    }));
    const __VLS_143 = __VLS_142({
        modelValue: (__VLS_ctx.openCertificateDialog),
        batch: (__VLS_ctx.batch.data),
    }, ...__VLS_functionalComponentArgsRest(__VLS_142));
}
// @ts-ignore
[batch, batch, openCertificateDialog,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        batchName: {
            type: String,
            required: true,
        },
    },
});
export default {};
