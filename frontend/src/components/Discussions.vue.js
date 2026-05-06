/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { createResource, Button } from 'frappe-ui';
import UserAvatar from '@/components/UserAvatar.vue';
import { singularize, timeAgo } from '@/utils';
import { ref, onMounted, inject, onUnmounted } from 'vue';
import DiscussionReplies from '@/components/DiscussionReplies.vue';
import DiscussionModal from '@/components/Modals/DiscussionModal.vue';
import { MessageSquareText, Plus } from 'lucide-vue-next';
import { getScrollContainer } from '@/utils/scrollContainer';
const showTopics = ref(true);
const currentTopic = ref(null);
const socket = inject('$socket');
const user = inject('$user');
const showTopicModal = ref(false);
const readOnlyMode = window.read_only_mode;
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    doctype: {
        type: String,
        required: true,
    },
    docname: {
        type: String,
        required: true,
    },
    emptyStateTitle: {
        type: String,
        default: '',
    },
    emptyStateText: {
        type: String,
        default: 'Start a Discussion',
    },
    singleThread: {
        type: Boolean,
        default: false,
    },
    scrollToBottom: {
        type: Boolean,
        default: false,
    },
});
onMounted(() => {
    if (user.data)
        topics.reload();
    socket.on('new_discussion_topic', (data) => {
        topics.refresh();
    });
    if (props.scrollToBottom) {
        setTimeout(() => {
            scrollToEnd();
        }, 100);
    }
});
const scrollToEnd = () => {
    let scrollContainer = getScrollContainer();
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
};
const topics = createResource({
    url: 'lms.lms.utils.get_discussion_topics',
    cache: ['topics', props.doctype, props.docname],
    makeParams() {
        return {
            doctype: props.doctype,
            docname: props.docname,
            single_thread: props.singleThread,
        };
    },
});
const showReplies = (topic) => {
    showTopics.value = false;
    currentTopic.value = topic;
};
const openTopicModal = () => {
    showTopicModal.value = true;
};
onUnmounted(() => {
    socket.off('new_discussion_topic');
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
if (!__VLS_ctx.singleThread && !__VLS_ctx.readOnlyMode) {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        ...{ class: "float-right" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        ...{ class: "float-right" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(!__VLS_ctx.singleThread && !__VLS_ctx.readOnlyMode))
                    return;
                __VLS_ctx.openTopicModal();
                // @ts-ignore
                [singleThread, readOnlyMode, openTopicModal,];
            } });
    /** @type {__VLS_StyleScopedClasses['float-right']} */ ;
    const { default: __VLS_7 } = __VLS_3.slots;
    {
        const { prefix: __VLS_8 } = __VLS_3.slots;
        let __VLS_9;
        /** @ts-ignore @type { | typeof __VLS_components.Plus} */
        Plus;
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
            ...{ class: "size-4" },
        }));
        const __VLS_11 = __VLS_10({
            ...{ class: "size-4" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_10));
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
        // @ts-ignore
        [];
    }
    (__VLS_ctx.__('New {0}').format(__VLS_ctx.singularize(__VLS_ctx.title)));
    // @ts-ignore
    [__, singularize, title,];
    var __VLS_3;
    var __VLS_4;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-xl font-semibold text-ink-gray-9" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
(__VLS_ctx.__(__VLS_ctx.title));
if (__VLS_ctx.topics.data?.length && !__VLS_ctx.singleThread) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    if (__VLS_ctx.showTopics) {
        for (const [topic, index] of __VLS_vFor((__VLS_ctx.topics.data))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.topics.data?.length && !__VLS_ctx.singleThread))
                            return;
                        if (!(__VLS_ctx.showTopics))
                            return;
                        __VLS_ctx.showReplies(topic);
                        // @ts-ignore
                        [singleThread, __, title, topics, topics, showTopics, showReplies,];
                    } },
                ...{ class: "flex items-center cursor-pointer py-5 w-full" },
                ...{ class: ({ 'border-b': index + 1 != __VLS_ctx.topics.data.length }) },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
            const __VLS_14 = UserAvatar;
            // @ts-ignore
            const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
                user: (topic.user),
                size: "2xl",
                ...{ class: "mr-4" },
            }));
            const __VLS_16 = __VLS_15({
                user: (topic.user),
                size: "2xl",
                ...{ class: "mr-4" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_15));
            /** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-lg font-semibold mb-1 text-ink-gray-7" },
            });
            /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
            (topic.title);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center text-ink-gray-5" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (topic.user.full_name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-sm ml-3" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['ml-3']} */ ;
            (__VLS_ctx.timeAgo(topic.creation));
            // @ts-ignore
            [topics, timeAgo,];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        const __VLS_19 = DiscussionReplies;
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
            topic: (__VLS_ctx.currentTopic),
            showTopics: (__VLS_ctx.showTopics),
        }));
        const __VLS_21 = __VLS_20({
            topic: (__VLS_ctx.currentTopic),
            showTopics: (__VLS_ctx.showTopics),
        }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    }
}
else if (__VLS_ctx.singleThread && __VLS_ctx.topics.data) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    const __VLS_24 = DiscussionReplies;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        topic: (__VLS_ctx.topics.data),
        singleThread: (__VLS_ctx.singleThread),
    }));
    const __VLS_26 = __VLS_25({
        topic: (__VLS_ctx.topics.data),
        singleThread: (__VLS_ctx.singleThread),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col items-center justify-center border-2 border-dashed mt-5 py-8 rounded-md" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    let __VLS_29;
    /** @ts-ignore @type { | typeof __VLS_components.MessageSquareText} */
    MessageSquareText;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
        ...{ class: "w-7 h-7 text-ink-gray-4 stroke-1.5 mr-2" },
    }));
    const __VLS_31 = __VLS_30({
        ...{ class: "w-7 h-7 text-ink-gray-4 stroke-1.5 mr-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    if (__VLS_ctx.emptyStateTitle) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-medium mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        (__VLS_ctx.__(__VLS_ctx.emptyStateTitle));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    (__VLS_ctx.__(__VLS_ctx.emptyStateText));
}
const __VLS_34 = DiscussionModal;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
    modelValue: (__VLS_ctx.showTopicModal),
    title: (__VLS_ctx.__('New {0}').format(__VLS_ctx.title)),
    doctype: (props.doctype),
    docname: (props.docname),
    reloadTopics: (__VLS_ctx.topics),
}));
const __VLS_36 = __VLS_35({
    modelValue: (__VLS_ctx.showTopicModal),
    title: (__VLS_ctx.__('New {0}').format(__VLS_ctx.title)),
    doctype: (props.doctype),
    docname: (props.docname),
    reloadTopics: (__VLS_ctx.topics),
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
// @ts-ignore
[singleThread, singleThread, __, __, __, title, topics, topics, topics, showTopics, currentTopic, emptyStateTitle, emptyStateTitle, emptyStateText, showTopicModal,];
const __VLS_export = (await import('vue')).defineComponent({
    props: {
        title: {
            type: String,
            required: true,
        },
        doctype: {
            type: String,
            required: true,
        },
        docname: {
            type: String,
            required: true,
        },
        emptyStateTitle: {
            type: String,
            default: '',
        },
        emptyStateText: {
            type: String,
            default: 'Start a Discussion',
        },
        singleThread: {
            type: Boolean,
            default: false,
        },
        scrollToBottom: {
            type: Boolean,
            default: false,
        },
    },
});
export default {};
