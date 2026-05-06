/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Breadcrumbs, Button, call, createResource, TabButtons, Tooltip, usePageMeta, } from 'frappe-ui';
import { computed, inject, watch, ref, onMounted, watchEffect } from 'vue';
import { sessionStore } from '@/stores/session';
import { BadgeCheckIcon, Edit, Github, Linkedin, RefreshCcw, Twitter, } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import { convertToTitleCase } from '@/utils';
import UserAvatar from '@/components/UserAvatar.vue';
import NoPermission from '@/components/NoPermission.vue';
import EditProfile from '@/components/Modals/EditProfile.vue';
import EditCoverImage from '@/components/Modals/EditCoverImage.vue';
const { user, brand } = sessionStore();
const $user = inject('$user');
const route = useRoute();
const router = useRouter();
const activeTab = ref('');
const showProfileModal = ref(false);
const readOnlyMode = window.read_only_mode;
const props = defineProps({
    username: {
        type: String,
        required: true,
    },
});
onMounted(() => {
    if ($user.data)
        profile.reload();
    setActiveTab();
});
const profile = createResource({
    url: 'lms.lms.api.get_profile_details',
    makeParams() {
        return {
            username: props.username,
        };
    },
});
const coverImage = createResource({
    url: 'frappe.client.set_value',
    makeParams(values) {
        return {
            doctype: 'User',
            name: profile.data?.name,
            fieldname: 'cover_image',
            value: values.url,
        };
    },
    onSuccess() {
        profile.reload();
    },
});
const setActiveTab = () => {
    let fragments = route.path.split('/');
    let sections = ['certificates', 'grades', 'roles', 'slots', 'schedule'];
    sections.forEach((section) => {
        if (fragments.includes(section)) {
            activeTab.value = convertToTitleCase(section);
        }
    });
    if (!activeTab.value)
        activeTab.value = 'About';
};
watchEffect(() => {
    if (activeTab.value) {
        let route = {
            About: { name: 'ProfileAbout' },
            Certificates: { name: 'ProfileCertificates' },
            Grades: { name: 'ProfileGrades' },
            Roles: { name: 'ProfileRoles' },
            Slots: { name: 'ProfileEvaluator' },
            Schedule: { name: 'ProfileEvaluationSchedule' },
        }[activeTab.value];
        router.push(route);
    }
});
watch(() => props.username, () => {
    profile.reload();
});
const editProfile = () => {
    showProfileModal.value = true;
};
const isSessionUser = () => {
    return $user.data?.email === profile.data?.name;
};
const currentUserHasHigherAccess = () => {
    return $user.data?.is_evaluator || $user.data?.is_moderator;
};
const isEvaluatorOrModerator = () => {
    return (profile.data?.roles?.includes('Batch Evaluator') ||
        profile.data?.roles?.includes('Moderator'));
};
const getTabButtons = () => {
    let buttons = [{ label: __('About') }, { label: __('Certificates') }, { label: __('Grades') }];
    if ($user.data?.is_moderator)
        buttons.push({ label: __('Roles') });
    if (currentUserHasHigherAccess() && isEvaluatorOrModerator()) {
        buttons.push({ label: __('Slots') });
        buttons.push({ label: __('Schedule') });
    }
    return buttons;
};
const reloadUser = () => {
    call('frappe.sessions.clear').then(() => {
        $user.reload().then(() => {
            profile.reload();
        });
    });
};
const navigateTo = (url) => {
    window.open(url, '_blank');
};
const breadcrumbs = computed(() => {
    let crumbs = [
        {
            label: __('People'),
        },
        {
            label: profile.data?.full_name,
            route: {
                name: 'Profile',
                params: {
                    username: user.doc?.username,
                },
            },
        },
    ];
    return crumbs;
});
usePageMeta(() => {
    return {
        title: profile.data?.full_name,
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
if (!__VLS_ctx.$user.data) {
    const __VLS_0 = NoPermission;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else if (__VLS_ctx.profile.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "sticky group top-0 z-10 flex flex-col md:flex-row md:items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5" },
    });
    /** @type {__VLS_StyleScopedClasses['sticky']} */ ;
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
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
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.Breadcrumbs} */
    Breadcrumbs;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ class: "h-7" },
        items: (__VLS_ctx.breadcrumbs),
    }));
    const __VLS_7 = __VLS_6({
        ...{ class: "h-7" },
        items: (__VLS_ctx.breadcrumbs),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
    if (__VLS_ctx.isSessionUser()) {
        let __VLS_10;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
            ...{ class: "invisible group-hover:visible" },
        }));
        const __VLS_12 = __VLS_11({
            ...{ class: "invisible group-hover:visible" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_11));
        /** @type {__VLS_StyleScopedClasses['invisible']} */ ;
        /** @type {__VLS_StyleScopedClasses['group-hover:visible']} */ ;
        const { default: __VLS_15 } = __VLS_13.slots;
        {
            const { icon: __VLS_16 } = __VLS_13.slots;
            let __VLS_17;
            /** @ts-ignore @type { | typeof __VLS_components.RefreshCcw} */
            RefreshCcw;
            // @ts-ignore
            const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
                ...{ 'onClick': {} },
                ...{ class: "w-4 h-4 stroke-1.5 text-ink-gray-7" },
            }));
            const __VLS_19 = __VLS_18({
                ...{ 'onClick': {} },
                ...{ class: "w-4 h-4 stroke-1.5 text-ink-gray-7" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_18));
            let __VLS_22;
            const __VLS_23 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.$user.data))
                            return;
                        if (!(__VLS_ctx.profile.data))
                            return;
                        if (!(__VLS_ctx.isSessionUser()))
                            return;
                        __VLS_ctx.reloadUser();
                        // @ts-ignore
                        [$user, profile, breadcrumbs, isSessionUser, reloadUser,];
                    } });
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            var __VLS_20;
            var __VLS_21;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_13;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "group relative h-[130px] w-full" },
    });
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-[130px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    if (__VLS_ctx.profile.data.cover_image) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (__VLS_ctx.profile.data.cover_image),
            ...{ class: "h-[130px] w-full object-cover object-center" },
        });
        /** @type {__VLS_StyleScopedClasses['h-[130px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-center']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: ({ 'bg-surface-gray-2': !__VLS_ctx.profile.data.cover_image }) },
            ...{ class: "h-[130px] w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-[130px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    }
    if (__VLS_ctx.isSessionUser()) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "absolute bottom-[30%] md:bottom-0 left-[50%] mb-4 flex -translate-x-1/2 space-x-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['bottom-[30%]']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:bottom-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['left-[50%]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-within:opacity-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
        const __VLS_24 = EditCoverImage || EditCoverImage;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
            ...{ 'onSelect': {} },
        }));
        const __VLS_26 = __VLS_25({
            ...{ 'onSelect': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        let __VLS_29;
        const __VLS_30 = ({ select: {} },
            { onSelect: ((imageUrl) => __VLS_ctx.coverImage.submit({ url: imageUrl })) });
        const { default: __VLS_31 } = __VLS_27.slots;
        {
            const { default: __VLS_32 } = __VLS_27.slots;
            const [{ togglePopover }] = __VLS_vSlot(__VLS_32);
            if (!__VLS_ctx.readOnlyMode) {
                let __VLS_33;
                /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
                Button;
                // @ts-ignore
                const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
                    ...{ 'onClick': {} },
                    variant: "outline",
                }));
                const __VLS_35 = __VLS_34({
                    ...{ 'onClick': {} },
                    variant: "outline",
                }, ...__VLS_functionalComponentArgsRest(__VLS_34));
                let __VLS_38;
                const __VLS_39 = ({ click: {} },
                    { onClick: (...[$event]) => {
                            if (!!(!__VLS_ctx.$user.data))
                                return;
                            if (!(__VLS_ctx.profile.data))
                                return;
                            if (!(__VLS_ctx.isSessionUser()))
                                return;
                            if (!(!__VLS_ctx.readOnlyMode))
                                return;
                            togglePopover();
                            // @ts-ignore
                            [profile, profile, profile, isSessionUser, coverImage, readOnlyMode,];
                        } });
                const { default: __VLS_40 } = __VLS_36.slots;
                {
                    const { prefix: __VLS_41 } = __VLS_36.slots;
                    let __VLS_42;
                    /** @ts-ignore @type { | typeof __VLS_components.Edit} */
                    Edit;
                    // @ts-ignore
                    const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
                        ...{ class: "w-4 h-4 stroke-1.5 text-ink-gray-7" },
                    }));
                    const __VLS_44 = __VLS_43({
                        ...{ class: "w-4 h-4 stroke-1.5 text-ink-gray-7" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
                    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
                    // @ts-ignore
                    [];
                }
                (__VLS_ctx.__('Edit'));
                // @ts-ignore
                [__,];
                var __VLS_36;
                var __VLS_37;
            }
            // @ts-ignore
            [];
            __VLS_27.slots['' /* empty slot name completion */];
        }
        // @ts-ignore
        [];
        var __VLS_27;
        var __VLS_28;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mx-auto -mt-10 md:-mt-4 max-w-4xl translate-x-0 px-5" },
    });
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['-mt-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:-mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-4xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['translate-x-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col md:flex-row items-center" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    if (__VLS_ctx.profile.data.user_image) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (__VLS_ctx.profile.data.user_image),
            ...{ class: "object-cover h-[100px] w-[100px] rounded-full border-4 border-white object-cover" },
        });
        /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-[100px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-[100px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-center h-[100px] w-[100px] rounded-full border-4 border-white bg-surface-gray-2 text-3xl font-semibold text-ink-gray-7" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-[100px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-[100px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        (__VLS_ctx.profile.data.full_name.charAt(0).toUpperCase());
    }
    if (__VLS_ctx.profile.data.open_to) {
        let __VLS_47;
        /** @ts-ignore @type { | typeof __VLS_components.Tooltip | typeof __VLS_components.Tooltip} */
        Tooltip;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
            text: (__VLS_ctx.profile.data.open_to === 'Work'
                ? __VLS_ctx.__('Open to Work')
                : __VLS_ctx.__('Hiring')),
            placement: "right",
        }));
        const __VLS_49 = __VLS_48({
            text: (__VLS_ctx.profile.data.open_to === 'Work'
                ? __VLS_ctx.__('Open to Work')
                : __VLS_ctx.__('Hiring')),
            placement: "right",
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        const { default: __VLS_52 } = __VLS_50.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "absolute bottom-3 right-1 p-0.5 bg-surface-white rounded-full" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['bottom-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['right-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-surface-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "rounded-full w-fit" },
            ...{ class: (__VLS_ctx.profile.data.open_to === 'Work'
                    ? 'bg-surface-green-3'
                    : 'bg-purple-500') },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
        let __VLS_53;
        /** @ts-ignore @type { | typeof __VLS_components.BadgeCheckIcon} */
        BadgeCheckIcon;
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
            ...{ class: "text-ink-white size-5" },
        }));
        const __VLS_55 = __VLS_54({
            ...{ class: "text-ink-white size-5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        /** @type {__VLS_StyleScopedClasses['text-ink-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
        // @ts-ignore
        [profile, profile, profile, profile, profile, profile, __, __,];
        var __VLS_50;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ml-6 mt-5" },
    });
    /** @type {__VLS_StyleScopedClasses['ml-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-3xl font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.profile.data.full_name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-base text-ink-gray-7 mt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    (__VLS_ctx.profile.data.headline);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-4 mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    if (__VLS_ctx.profile.data.twitter) {
        let __VLS_58;
        /** @ts-ignore @type { | typeof __VLS_components.Twitter} */
        Twitter;
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
            ...{ 'onClick': {} },
            ...{ class: "size-4 text-ink-gray-5 cursor-pointer" },
        }));
        const __VLS_60 = __VLS_59({
            ...{ 'onClick': {} },
            ...{ class: "size-4 text-ink-gray-5 cursor-pointer" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        let __VLS_63;
        const __VLS_64 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.$user.data))
                        return;
                    if (!(__VLS_ctx.profile.data))
                        return;
                    if (!(__VLS_ctx.profile.data.twitter))
                        return;
                    __VLS_ctx.navigateTo(__VLS_ctx.profile.data.twitter);
                    // @ts-ignore
                    [profile, profile, profile, profile, navigateTo,];
                } });
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        var __VLS_61;
        var __VLS_62;
    }
    if (__VLS_ctx.profile.data.linkedin) {
        let __VLS_65;
        /** @ts-ignore @type { | typeof __VLS_components.Linkedin} */
        Linkedin;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
            ...{ 'onClick': {} },
            ...{ class: "size-4 text-ink-gray-5 cursor-pointer" },
        }));
        const __VLS_67 = __VLS_66({
            ...{ 'onClick': {} },
            ...{ class: "size-4 text-ink-gray-5 cursor-pointer" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_66));
        let __VLS_70;
        const __VLS_71 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.$user.data))
                        return;
                    if (!(__VLS_ctx.profile.data))
                        return;
                    if (!(__VLS_ctx.profile.data.linkedin))
                        return;
                    __VLS_ctx.navigateTo(__VLS_ctx.profile.data.linkedin);
                    // @ts-ignore
                    [profile, profile, navigateTo,];
                } });
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        var __VLS_68;
        var __VLS_69;
    }
    if (__VLS_ctx.profile.data.github) {
        let __VLS_72;
        /** @ts-ignore @type { | typeof __VLS_components.Github} */
        Github;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
            ...{ 'onClick': {} },
            ...{ class: "size-4 text-ink-gray-5 cursor-pointer" },
        }));
        const __VLS_74 = __VLS_73({
            ...{ 'onClick': {} },
            ...{ class: "size-4 text-ink-gray-5 cursor-pointer" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        let __VLS_77;
        const __VLS_78 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.$user.data))
                        return;
                    if (!(__VLS_ctx.profile.data))
                        return;
                    if (!(__VLS_ctx.profile.data.github))
                        return;
                    __VLS_ctx.navigateTo(__VLS_ctx.profile.data.github);
                    // @ts-ignore
                    [profile, profile, navigateTo,];
                } });
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        var __VLS_75;
        var __VLS_76;
    }
    if (__VLS_ctx.isSessionUser() && !__VLS_ctx.readOnlyMode) {
        let __VLS_79;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
            ...{ 'onClick': {} },
            ...{ class: "mt-3 sm:mt-0 md:ml-auto" },
        }));
        const __VLS_81 = __VLS_80({
            ...{ 'onClick': {} },
            ...{ class: "mt-3 sm:mt-0 md:ml-auto" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_80));
        let __VLS_84;
        const __VLS_85 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.$user.data))
                        return;
                    if (!(__VLS_ctx.profile.data))
                        return;
                    if (!(__VLS_ctx.isSessionUser() && !__VLS_ctx.readOnlyMode))
                        return;
                    __VLS_ctx.editProfile();
                    // @ts-ignore
                    [isSessionUser, readOnlyMode, editProfile,];
                } });
        /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:mt-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:ml-auto']} */ ;
        const { default: __VLS_86 } = __VLS_82.slots;
        {
            const { prefix: __VLS_87 } = __VLS_82.slots;
            let __VLS_88;
            /** @ts-ignore @type { | typeof __VLS_components.Edit} */
            Edit;
            // @ts-ignore
            const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
                ...{ class: "w-4 h-4 stroke-1.5 text-ink-gray-7" },
            }));
            const __VLS_90 = __VLS_89({
                ...{ class: "w-4 h-4 stroke-1.5 text-ink-gray-7" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_89));
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            // @ts-ignore
            [];
        }
        (__VLS_ctx.__('Edit Profile'));
        // @ts-ignore
        [__,];
        var __VLS_82;
        var __VLS_83;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-4 mt-10" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-10']} */ ;
    let __VLS_93;
    /** @ts-ignore @type { | typeof __VLS_components.TabButtons} */
    TabButtons;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
        ...{ class: "inline-block" },
        buttons: (__VLS_ctx.getTabButtons()),
        modelValue: (__VLS_ctx.activeTab),
    }));
    const __VLS_95 = __VLS_94({
        ...{ class: "inline-block" },
        buttons: (__VLS_ctx.getTabButtons()),
        modelValue: (__VLS_ctx.activeTab),
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
    let __VLS_98;
    /** @ts-ignore @type { | typeof __VLS_components.routerView | typeof __VLS_components.RouterView | typeof __VLS_components['router-view']} */
    routerView;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
        profile: (__VLS_ctx.profile),
        key: (__VLS_ctx.profile.data?.name),
    }));
    const __VLS_100 = __VLS_99({
        profile: (__VLS_ctx.profile),
        key: (__VLS_ctx.profile.data?.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
}
const __VLS_103 = EditProfile;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
    modelValue: (__VLS_ctx.showProfileModal),
    reloadProfile: (__VLS_ctx.profile),
    profile: (__VLS_ctx.profile),
}));
const __VLS_105 = __VLS_104({
    modelValue: (__VLS_ctx.showProfileModal),
    reloadProfile: (__VLS_ctx.profile),
    profile: (__VLS_ctx.profile),
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
// @ts-ignore
[profile, profile, profile, profile, getTabButtons, activeTab, showProfileModal,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        username: {
            type: String,
            required: true,
        },
    },
});
export default {};
