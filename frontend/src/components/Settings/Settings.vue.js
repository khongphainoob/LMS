/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Dialog, createDocumentResource } from 'frappe-ui';
import { computed, markRaw, ref, watch } from 'vue';
import { useSettings } from '@/stores/settings';
import SettingDetails from '@/components/Settings/SettingDetails.vue';
import SidebarLink from '@/components/Sidebar/SidebarLink.vue';
import Members from '@/components/Settings/Members.vue';
import Evaluators from '@/components/Settings/Evaluators.vue';
import Categories from '@/components/Settings/Categories.vue';
import EmailTemplates from '@/components/Settings/EmailTemplates.vue';
import BrandSettings from '@/components/Settings/BrandSettings.vue';
import PaymentGateways from '@/components/Settings/PaymentGateways.vue';
import Coupons from '@/components/Settings/Coupons/Coupons.vue';
import Transactions from '@/components/Settings/Transactions/Transactions.vue';
import ZoomSettings from '@/components/Settings/ZoomSettings.vue';
import Badges from '@/components/Settings/Badges.vue';
const show = defineModel();
const doctype = ref('LMS Settings');
const activeTab = ref(null);
const settingsStore = useSettings();
const data = createDocumentResource({
    doctype: doctype.value,
    name: doctype.value,
    fields: ['*'],
    cache: doctype.value,
    auto: true,
});
const tabsStructure = computed(() => {
    return [
        {
            label: __('Configuration'),
            hideLabel: true,
            items: [
                {
                    label: __('General'),
                    icon: 'Wrench',
                    sections: [
                        {
                            label: __('System Configurations'),
                            columns: [
                                {
                                    fields: [
                                        {
                                            label: __('Allow Guest Access'),
                                            name: 'allow_guest_access',
                                            description: 'If enabled, users can access the course and batch lists without logging in.',
                                            type: 'checkbox',
                                        },
                                        {
                                            label: __('Prevent Skipping Videos'),
                                            name: 'prevent_skipping_videos',
                                            type: 'checkbox',
                                            description: 'If enabled, users will no able to move forward in a video',
                                        },
                                    ],
                                },
                                {
                                    fields: [
                                        {
                                            label: __('Disable PWA'),
                                            name: 'disable_pwa',
                                            type: 'checkbox',
                                            description: 'If checked, users will not be able to install the application as a Progressive Web App.',
                                        },
                                        {
                                            label: __('Send calendar invite for evaluations'),
                                            name: 'send_calendar_invite_for_evaluations',
                                            description: 'If enabled, it sends google calendar invite to the student for evaluations.',
                                            type: 'checkbox',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            label: __('Notifications'),
                            columns: [
                                {
                                    fields: [
                                        {
                                            label: __('Send Notification for Published Courses'),
                                            name: 'send_notification_for_published_courses',
                                            type: 'select',
                                            options: [' ', 'Email', 'In-app'],
                                        },
                                    ],
                                },
                                {
                                    fields: [
                                        {
                                            label: __('Send Notification for Published Batches'),
                                            name: 'send_notification_for_published_batches',
                                            type: 'select',
                                            options: [' ', 'Email', 'In-app'],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            label: __('Email Templates'),
                            columns: [
                                {
                                    fields: [
                                        {
                                            label: __('Batch Confirmation Email Template'),
                                            name: 'batch_confirmation_template',
                                            doctype: 'Email Template',
                                            type: 'Link',
                                        },
                                    ],
                                },
                                {
                                    fields: [
                                        {
                                            label: __('Certification Email Template'),
                                            name: 'certification_template',
                                            doctype: 'Email Template',
                                            type: 'Link',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            label: __('Contact Information'),
                            columns: [
                                {
                                    fields: [
                                        {
                                            label: __('Email'),
                                            name: 'contact_us_email',
                                            type: 'text',
                                            description: 'Users can reach out to this email for support or inquiries.',
                                        },
                                    ],
                                },
                                {
                                    fields: [
                                        {
                                            label: __('URL'),
                                            name: 'contact_us_url',
                                            type: 'text',
                                            description: 'Users can reach out to this URL for support or inquiries.',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            label: '',
                            columns: [
                                {
                                    fields: [
                                        {
                                            label: __('Livecode URL'),
                                            name: 'livecode_url',
                                            doctype: 'Livecode URL',
                                            type: 'text',
                                            description: 'https://docs.frappe.io/learning/falcon-self-hosting-guide',
                                        },
                                    ],
                                },
                                {
                                    fields: [
                                        {
                                            label: __('Unsplash Access Key'),
                                            name: 'unsplash_access_key',
                                            description: 'Allows users to pick a profile cover image from Unsplash. https://unsplash.com/documentation#getting-started.',
                                            type: 'password',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            label: __('Lists'),
            hideLabel: false,
            items: [
                {
                    label: __('Members'),
                    description: 'Add new members or manage roles and permissions of existing members',
                    icon: 'UserRoundPlus',
                    template: markRaw(Members),
                },
                {
                    label: __('Evaluators'),
                    description: '',
                    icon: 'UserCheck',
                    description: 'Add new evaluators or check the slots existing evaluators',
                    template: markRaw(Evaluators),
                },
                {
                    label: __('Zoom Accounts'),
                    description: 'Manage zoom accounts to conduct live classes from batches',
                    icon: 'Video',
                    template: markRaw(ZoomSettings),
                },
                {
                    label: __('Badges'),
                    description: 'Create badges and assign them to students to acknowledge their achievements',
                    icon: 'Award',
                    template: markRaw(Badges),
                },
                {
                    label: __('Categories'),
                    description: 'Double click to edit the category',
                    icon: 'Network',
                    template: markRaw(Categories),
                },
                {
                    label: __('Email Templates'),
                    description: 'Manage the email templates for your learning system',
                    icon: 'MailPlus',
                    template: markRaw(EmailTemplates),
                },
            ],
        },
        {
            label: __('Payment'),
            hideLabel: false,
            items: [
                {
                    label: __('Configuration'),
                    icon: 'CreditCard',
                    description: 'Manage all your payment related settings and defaults',
                    sections: [
                        {
                            columns: [
                                {
                                    fields: [
                                        {
                                            label: __('Default Currency'),
                                            name: 'default_currency',
                                            type: 'Link',
                                            doctype: 'Currency',
                                        },
                                        {
                                            label: __('Payment Gateway'),
                                            name: 'payment_gateway',
                                            type: 'Link',
                                            doctype: 'Payment Gateway',
                                        },
                                    ],
                                },
                                {
                                    fields: [
                                        {
                                            label: __('Apply GST for India'),
                                            name: 'apply_gst',
                                            type: 'checkbox',
                                        },
                                        {
                                            label: __('Show USD equivalent amount'),
                                            name: 'show_usd_equivalent',
                                            type: 'checkbox',
                                        },
                                        {
                                            label: __('Apply rounding on equivalent'),
                                            name: 'apply_rounding',
                                            type: 'checkbox',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    label: __('Gateways'),
                    icon: 'DollarSign',
                    template: markRaw(PaymentGateways),
                    description: 'Add and manage all your payment gateways',
                },
                {
                    label: __('Transactions'),
                    icon: 'Landmark',
                    template: markRaw(Transactions),
                    description: 'View all your payment transactions',
                },
                {
                    label: __('Coupons'),
                    icon: 'Ticket',
                    template: markRaw(Coupons),
                    description: 'Manage discount coupons for courses and batches',
                },
            ],
        },
        {
            label: __('Customize'),
            hideLabel: false,
            items: [
                {
                    label: __('Branding'),
                    icon: 'Blocks',
                    template: markRaw(BrandSettings),
                    sections: [
                        {
                            columns: [
                                {
                                    fields: [
                                        {
                                            label: __('Brand Name'),
                                            name: 'app_name',
                                            type: 'text',
                                        },
                                        {
                                            label: __('Logo'),
                                            name: 'banner_image',
                                            type: 'Upload',
                                            description: 'Appears in the top left corner of the application to represent your brand.',
                                        },
                                        {
                                            label: __('Favicon'),
                                            name: 'favicon',
                                            type: 'Upload',
                                            description: 'Appears in the browser tab next to the page title to help users quickly identify the application.',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    label: __('Sidebar'),
                    icon: 'PanelLeftIcon',
                    description: 'Choose the items you want to show in the sidebar',
                    sections: [
                        {
                            columns: [
                                {
                                    fields: [
                                        {
                                            label: __('Courses'),
                                            name: 'courses',
                                            type: 'checkbox',
                                        },
                                        {
                                            label: __('Batches'),
                                            name: 'batches',
                                            type: 'checkbox',
                                        },
                                        {
                                            label: __('Programming Exercises'),
                                            name: 'programming_exercises',
                                            type: 'checkbox',
                                        },
                                        {
                                            label: __('AI Integration'),
                                            name: 'ai_integration',
                                            type: 'checkbox',
                                        },
                                        {
                                            label: __('Certifications'),
                                            name: 'certifications',
                                            type: 'checkbox',
                                        },
                                    ],
                                },
                                {
                                    fields: [
                                        {
                                            label: __('Jobs'),
                                            name: 'jobs',
                                            type: 'checkbox',
                                        },
                                        {
                                            label: __('Statistics'),
                                            name: 'statistics',
                                            type: 'checkbox',
                                        },
                                        {
                                            label: __('Notifications'),
                                            name: 'notifications',
                                            type: 'checkbox',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    label: __('Signup'),
                    icon: 'LogIn',
                    sections: [
                        {
                            columns: [
                                {
                                    fields: [
                                        {
                                            label: __('Identify User Category'),
                                            name: 'user_category',
                                            type: 'checkbox',
                                            description: 'Enable this option to identify the user category during signup.',
                                        },
                                        {
                                            label: __('Disable signup'),
                                            name: 'disable_signup',
                                            type: 'checkbox',
                                            description: 'New users will have to be manually registered by Admins.',
                                        },
                                        {
                                            label: __('Signup Consent HTML'),
                                            name: 'custom_signup_content',
                                            type: 'Code',
                                            mode: 'htmlmixed',
                                            rows: 10,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    label: __('SEO'),
                    icon: 'Search',
                    sections: [
                        {
                            columns: [
                                {
                                    fields: [
                                        {
                                            label: __('Meta Description'),
                                            name: 'meta_description',
                                            type: 'textarea',
                                            rows: 4,
                                            description: "This description will be shown on lists and pages that don't have meta description",
                                        },
                                        {
                                            label: __('Meta Keywords'),
                                            name: 'meta_keywords',
                                            type: 'textarea',
                                            rows: 4,
                                            description: 'Comma separated keywords for search engines to find your website.',
                                        },
                                        {
                                            label: __('Meta Image'),
                                            name: 'meta_image',
                                            type: 'Upload',
                                            size: 'lg',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];
});
const tabs = computed(() => {
    return tabsStructure.value.map((tab) => {
        return {
            ...tab,
            items: tab.items.filter((item) => {
                return !item.condition || item.condition();
            }),
        };
    });
});
watch(show, async () => {
    if (show.value) {
        const currentTab = await tabs.value
            .flatMap((tab) => tab.items)
            .find((item) => item.label === settingsStore.activeTab);
        activeTab.value = currentTab || tabs.value[0].items[0];
    }
    else {
        activeTab.value = null;
        settingsStore.isSettingsOpen = false;
    }
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
    options: ({ size: '5xl' }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({ size: '5xl' }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { body: __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex h-[calc(100vh_-_8rem)]" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-[calc(100vh_-_8rem)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex w-52 shrink-0 flex-col bg-surface-gray-2 p-2 overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-52']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "mb-3 px-2 pt-2 text-lg font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Settings'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    for (const [tab] of __VLS_vFor((__VLS_ctx.tabs))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (tab.label),
        });
        if (!tab.hideLabel) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mb-2 mt-3 flex cursor-pointer gap-1.5 px-1 text-base text-ink-gray-5 transition-all duration-300 ease-in-out" },
            });
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['ease-in-out']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.__(tab.label));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
            ...{ class: "space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        for (const [item] of __VLS_vFor((tab.items))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (...[$event]) => {
                        __VLS_ctx.activeTab = item;
                        // @ts-ignore
                        [show, __, __, tabs, activeTab,];
                    } },
            });
            const __VLS_8 = SidebarLink;
            // @ts-ignore
            const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
                link: (item),
                key: (item.label),
                activeTab: (__VLS_ctx.activeTab?.label),
            }));
            const __VLS_10 = __VLS_9({
                link: (item),
                key: (item.label),
                activeTab: (__VLS_ctx.activeTab?.label),
            }, ...__VLS_functionalComponentArgsRest(__VLS_9));
            // @ts-ignore
            [activeTab,];
        }
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.activeTab && __VLS_ctx.data.doc) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (__VLS_ctx.activeTab.label),
            ...{ class: "flex flex-1 flex-col p-8 bg-surface-modal overflow-x-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-modal']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
        if (__VLS_ctx.activeTab.template) {
            const __VLS_13 = (__VLS_ctx.activeTab.template);
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                ...({
                    label: __VLS_ctx.activeTab.label,
                    description: __VLS_ctx.activeTab.description,
                    ...(__VLS_ctx.activeTab.label == 'Branding'
                        ? { sections: __VLS_ctx.activeTab.sections }
                        : {}),
                    ...(__VLS_ctx.activeTab.label == 'Evaluators' ||
                        __VLS_ctx.activeTab.label == 'Members' ||
                        __VLS_ctx.activeTab.label == 'Transactions'
                        ? { 'onUpdate:show': (val) => (__VLS_ctx.show = val), show: __VLS_ctx.show }
                        : {}),
                }),
            }));
            const __VLS_15 = __VLS_14({
                ...({
                    label: __VLS_ctx.activeTab.label,
                    description: __VLS_ctx.activeTab.description,
                    ...(__VLS_ctx.activeTab.label == 'Branding'
                        ? { sections: __VLS_ctx.activeTab.sections }
                        : {}),
                    ...(__VLS_ctx.activeTab.label == 'Evaluators' ||
                        __VLS_ctx.activeTab.label == 'Members' ||
                        __VLS_ctx.activeTab.label == 'Transactions'
                        ? { 'onUpdate:show': (val) => (__VLS_ctx.show = val), show: __VLS_ctx.show }
                        : {}),
                }),
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        }
        else {
            const __VLS_18 = SettingDetails;
            // @ts-ignore
            const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
                sections: (__VLS_ctx.activeTab.sections),
                label: (__VLS_ctx.activeTab.label),
                description: (__VLS_ctx.activeTab.description),
                data: (__VLS_ctx.data),
            }));
            const __VLS_20 = __VLS_19({
                sections: (__VLS_ctx.activeTab.sections),
                label: (__VLS_ctx.activeTab.label),
                description: (__VLS_ctx.activeTab.description),
                data: (__VLS_ctx.data),
            }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        }
    }
    // @ts-ignore
    [show, show, activeTab, activeTab, activeTab, activeTab, activeTab, activeTab, activeTab, activeTab, activeTab, activeTab, activeTab, activeTab, activeTab, activeTab, data, data,];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
