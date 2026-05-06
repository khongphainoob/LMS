/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { inject } from 'vue';
import { createResource, Popover, Button } from 'frappe-ui';
import { X, LinkedinIcon, Twitter } from 'lucide-vue-next';
import { sessionStore } from '@/stores/session';
import { decodeEntities } from '@/utils';
import DOMPurify from 'dompurify';
import { getLmsRoute } from '@/utils/basePath';
const dayjs = inject('$dayjs');
const { branding } = sessionStore();
const props = defineProps({
    profile: {
        type: Object,
        required: true,
    },
});
const badges = createResource({
    url: 'frappe.client.get_list',
    params: {
        doctype: 'LMS Badge Assignment',
        fields: ['name', 'badge', 'badge_image', 'badge_description', 'issued_on'],
        filters: {
            member: props.profile.data.name,
        },
    },
    auto: true,
    transform(data) {
        let finalBadges = [];
        let groupedBadges = Object.groupBy(data, ({ badge }) => badge);
        for (let badge in groupedBadges) {
            let badgeData = groupedBadges[badge][0];
            badgeData.count = groupedBadges[badge].length;
            finalBadges.push(badgeData);
        }
        return finalBadges;
    },
});
const shareOnSocial = (badge, medium) => {
    let shareUrl;
    const url = encodeURIComponent(`${window.location.origin}${getLmsRoute(`badges/${badge.badge}/${props.profile.data?.email}`)}`);
    const summary = `I am happy to announce that I earned the ${badge.badge} badge on ${dayjs(badge.issued_on).format('DD MMM YYYY')} at ${branding.data?.app_name}.`;
    if (medium == 'LinkedIn')
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&text=${summary}`;
    else if (medium == 'Twitter')
        shareUrl = `https://twitter.com/intent/tweet?text=${summary}&url=${url}`;
    window.open(shareUrl, '_blank');
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-7 mb-10" },
});
/** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "mb-3 text-lg font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__('About'));
if (__VLS_ctx.profile.data.bio) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none !whitespace-normal" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.DOMPurify.sanitize(__VLS_ctx.decodeEntities(__VLS_ctx.profile.data.bio), {
            ALLOWED_TAGS: [
                'b',
                'i',
                'em',
                'strong',
                'a',
                'p',
                'br',
                'ul',
                'ol',
                'li',
                'img',
            ],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'src'],
        })) }, null, null);
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
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-ink-gray-7 text-sm italic" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['italic']} */ ;
    (__VLS_ctx.__('No introduction'));
}
if (__VLS_ctx.badges.data?.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-7 mb-10" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "mb-3 text-lg font-semibold text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.__('Achievements'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    for (const [badge] of __VLS_vFor((__VLS_ctx.badges.data))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.Popover | typeof __VLS_components.Popover} */
        Popover;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            trigger: "hover",
            leaveDelay: (Number(0.01)),
        }));
        const __VLS_2 = __VLS_1({
            trigger: "hover",
            leaveDelay: (Number(0.01)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        const { default: __VLS_5 } = __VLS_3.slots;
        {
            const { target: __VLS_6 } = __VLS_3.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "relative" },
            });
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                src: (badge.badge_image),
                alt: (badge.badge),
                ...{ class: "h-[80px]" },
            });
            /** @type {__VLS_StyleScopedClasses['h-[80px]']} */ ;
            if (badge.count > 1) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-end bg-surface-gray-2 p-2 text-xs font-semibold rounded-full absolute right-0 bottom-0" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
                /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                let __VLS_7;
                /** @ts-ignore @type { | typeof __VLS_components.X} */
                X;
                // @ts-ignore
                const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
                    ...{ class: "w-3 h-3" },
                }));
                const __VLS_9 = __VLS_8({
                    ...{ class: "w-3 h-3" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_8));
                /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
                (badge.count);
            }
            // @ts-ignore
            [__, __, __, profile, profile, DOMPurify, decodeEntities, badges, badges,];
        }
        {
            const { 'body-main': __VLS_12 } = __VLS_3.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "w-[250px] text-base" },
            });
            /** @type {__VLS_StyleScopedClasses['w-[250px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "bg-surface-gray-2 rounded-t-md py-5" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-surface-gray-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-t-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                src: (badge.badge_image),
                alt: (badge.badge),
                ...{ class: "h-[200px] mx-auto" },
            });
            /** @type {__VLS_StyleScopedClasses['h-[200px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "p-5" },
            });
            /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-2xl font-semibold mb-2" },
            });
            /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            (badge.badge);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "leading-5 mb-4" },
            });
            /** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
            (badge.badge_description);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-col mb-4" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs text-ink-gray-7 font-medium mb-1" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
            (__VLS_ctx.__('Issued on'));
            (__VLS_ctx.dayjs(badge.issued_on).format('DD MMM YYYY'));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-col" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs text-ink-gray-7 font-medium mb-1" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
            (__VLS_ctx.__('Share on'));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center space-x-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
            let __VLS_13;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                ...{ 'onClick': {} },
                variant: "outline",
                size: "sm",
            }));
            const __VLS_15 = __VLS_14({
                ...{ 'onClick': {} },
                variant: "outline",
                size: "sm",
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
            let __VLS_18;
            const __VLS_19 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.badges.data?.length))
                            return;
                        __VLS_ctx.shareOnSocial(badge, 'LinkedIn');
                        // @ts-ignore
                        [__, __, dayjs, shareOnSocial,];
                    } });
            const { default: __VLS_20 } = __VLS_16.slots;
            {
                const { prefix: __VLS_21 } = __VLS_16.slots;
                let __VLS_22;
                /** @ts-ignore @type { | typeof __VLS_components.LinkedinIcon} */
                LinkedinIcon;
                // @ts-ignore
                const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
                    ...{ class: "h-3 w-3 text-ink-gray-7" },
                }));
                const __VLS_24 = __VLS_23({
                    ...{ class: "h-3 w-3 text-ink-gray-7" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_23));
                /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
                // @ts-ignore
                [];
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            (__VLS_ctx.__('LinkedIn'));
            // @ts-ignore
            [__,];
            var __VLS_16;
            var __VLS_17;
            let __VLS_27;
            /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
            Button;
            // @ts-ignore
            const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
                ...{ 'onClick': {} },
                variant: "outline",
                size: "sm",
            }));
            const __VLS_29 = __VLS_28({
                ...{ 'onClick': {} },
                variant: "outline",
                size: "sm",
            }, ...__VLS_functionalComponentArgsRest(__VLS_28));
            let __VLS_32;
            const __VLS_33 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.badges.data?.length))
                            return;
                        __VLS_ctx.shareOnSocial(badge, 'Twitter');
                        // @ts-ignore
                        [shareOnSocial,];
                    } });
            const { default: __VLS_34 } = __VLS_30.slots;
            {
                const { prefix: __VLS_35 } = __VLS_30.slots;
                let __VLS_36;
                /** @ts-ignore @type { | typeof __VLS_components.Twitter} */
                Twitter;
                // @ts-ignore
                const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
                    ...{ class: "h-3 w-3 text-ink-gray-7" },
                }));
                const __VLS_38 = __VLS_37({
                    ...{ class: "h-3 w-3 text-ink-gray-7" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_37));
                /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
                // @ts-ignore
                [];
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            (__VLS_ctx.__('Twitter'));
            // @ts-ignore
            [__,];
            var __VLS_30;
            var __VLS_31;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_3;
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        profile: {
            type: Object,
            required: true,
        },
    },
});
export default {};
