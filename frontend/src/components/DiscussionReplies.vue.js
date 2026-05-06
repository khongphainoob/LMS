/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { createResource, TextEditor, Button, Dropdown, toast } from 'frappe-ui';
import { timeAgo } from '@/utils';
import UserAvatar from '@/components/UserAvatar.vue';
import { ChevronLeft, MoreHorizontal } from 'lucide-vue-next';
import { ref, inject, onMounted, onUnmounted } from 'vue';
const showTopics = defineModel('showTopics');
const newReply = ref('');
const socket = inject('$socket');
const user = inject('$user');
const allUsers = inject('$allUsers');
const mentionUsers = ref([]);
const renderEditor = ref(false);
const readOnlyMode = window.read_only_mode;
const props = defineProps({
    topic: {
        type: Object,
        required: true,
    },
    singleThread: {
        type: Boolean,
        default: false,
    },
});
onMounted(() => {
    socket.on('publish_message', (data) => {
        replies.reload();
    });
    socket.on('update_message', (data) => {
        replies.reload();
    });
    socket.on('delete_message', (data) => {
        replies.reload();
    });
    fetchMentionUsers();
});
const replies = createResource({
    url: 'lms.lms.utils.get_discussion_replies',
    cache: ['replies', props.topic],
    makeParams(values) {
        return {
            topic: props.topic.name,
        };
    },
    auto: true,
});
const newReplyResource = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        return {
            doc: {
                doctype: 'Discussion Reply',
                reply: newReply.value,
                topic: props.topic.name,
            },
        };
    },
});
const fetchMentionUsers = () => {
    if (user.data?.is_student) {
        renderEditor.value = true;
    }
    else {
        allUsers.reload({}, {
            onSuccess(data) {
                mentionUsers.value = Object.values(data).map((user) => {
                    return {
                        value: user.name,
                        label: user.full_name,
                    };
                });
                renderEditor.value = true;
            },
        });
    }
};
const postReply = () => {
    newReplyResource.submit({}, {
        validate() {
            if (!newReply.value) {
                return 'Reply cannot be empty';
            }
        },
        onSuccess() {
            newReply.value = '';
            replies.reload();
        },
        onError(err) {
            toast.error(err.messages?.[0] || err);
        },
    });
};
const editReplyResource = createResource({
    url: 'frappe.client.set_value',
    makeParams(values) {
        return {
            doctype: 'Discussion Reply',
            name: values.name,
            fieldname: 'reply',
            value: values.reply,
        };
    },
});
const postEdited = (reply) => {
    editReplyResource.submit({
        name: reply.name,
        reply: reply.reply,
    }, {
        validate() {
            if (!reply.reply) {
                return 'Reply cannot be empty';
            }
        },
        onSuccess() {
            reply.editable = false;
            replies.reload();
        },
    });
};
const deleteReplyResource = createResource({
    url: 'frappe.client.delete',
    makeParams(values) {
        return {
            doctype: 'Discussion Reply',
            name: values.name,
        };
    },
});
const deleteReply = (reply) => {
    deleteReplyResource.submit({
        name: reply.name,
    }, {
        onSuccess() {
            replies.reload();
        },
    });
};
onUnmounted(() => {
    socket.off('publish_message');
    socket.off('update_message');
    socket.off('delete_message');
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-6" },
});
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
if (!__VLS_ctx.singleThread) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center mb-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        variant: "outline",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        variant: "outline",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(!__VLS_ctx.singleThread))
                    return;
                __VLS_ctx.showTopics = true;
                // @ts-ignore
                [singleThread, showTopics,];
            } });
    const { default: __VLS_7 } = __VLS_3.slots;
    {
        const { icon: __VLS_8 } = __VLS_3.slots;
        let __VLS_9;
        /** @ts-ignore @type { | typeof __VLS_components.ChevronLeft} */
        ChevronLeft;
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
            ...{ class: "w-5 h-5 stroke-1.5 text-ink-gray-7" },
        }));
        const __VLS_11 = __VLS_10({
            ...{ class: "w-5 h-5 stroke-1.5 text-ink-gray-7" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_10));
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-ink-gray-7']} */ ;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_3;
    var __VLS_4;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-lg font-semibold ml-2 text-ink-gray-9" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-9']} */ ;
    (__VLS_ctx.topic.title);
}
for (const [reply, index] of __VLS_vFor((__VLS_ctx.replies.data))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "py-3" },
        ...{ class: ({ 'border-b': index + 1 != __VLS_ctx.replies.data.length }) },
    });
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mb-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center text-ink-gray-5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-ink-gray-5']} */ ;
    const __VLS_14 = UserAvatar;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        user: (reply.user),
        ...{ class: "mr-2" },
    }));
    const __VLS_16 = __VLS_15({
        user: (reply.user),
        ...{ class: "mr-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (reply.user.full_name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sm ml-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    (__VLS_ctx.timeAgo(reply.creation));
    if (__VLS_ctx.user.data.name == reply.owner && !reply.editable && !__VLS_ctx.readOnlyMode) {
        let __VLS_19;
        /** @ts-ignore @type { | typeof __VLS_components.Dropdown | typeof __VLS_components.Dropdown} */
        Dropdown;
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
            options: ([
                {
                    label: __VLS_ctx.__('Edit'),
                    onClick() {
                        reply.editable = true;
                    },
                },
                {
                    label: __VLS_ctx.__('Delete'),
                    onClick() {
                        __VLS_ctx.deleteReply(reply);
                    },
                },
            ]),
        }));
        const __VLS_21 = __VLS_20({
            options: ([
                {
                    label: __VLS_ctx.__('Edit'),
                    onClick() {
                        reply.editable = true;
                    },
                },
                {
                    label: __VLS_ctx.__('Delete'),
                    onClick() {
                        __VLS_ctx.deleteReply(reply);
                    },
                },
            ]),
        }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        const { default: __VLS_24 } = __VLS_22.slots;
        {
            const { default: __VLS_25 } = __VLS_22.slots;
            const [{ open }] = __VLS_vSlot(__VLS_25);
            let __VLS_26;
            /** @ts-ignore @type { | typeof __VLS_components.MoreHorizontal} */
            MoreHorizontal;
            // @ts-ignore
            const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
                ...{ class: "w-4 h-4 stroke-1.5 cursor-pointer" },
            }));
            const __VLS_28 = __VLS_27({
                ...{ class: "w-4 h-4 stroke-1.5 cursor-pointer" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_27));
            /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['stroke-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            // @ts-ignore
            [topic, replies, replies, timeAgo, user, readOnlyMode, __, __, deleteReply,];
            __VLS_22.slots['' /* empty slot name completion */];
        }
        // @ts-ignore
        [];
        var __VLS_22;
    }
    if (reply.editable) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        let __VLS_31;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
            ...{ 'onClick': {} },
            variant: "ghost",
        }));
        const __VLS_33 = __VLS_32({
            ...{ 'onClick': {} },
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_32));
        let __VLS_36;
        const __VLS_37 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(reply.editable))
                        return;
                    __VLS_ctx.postEdited(reply);
                    // @ts-ignore
                    [postEdited,];
                } });
        const { default: __VLS_38 } = __VLS_34.slots;
        (__VLS_ctx.__('Post'));
        // @ts-ignore
        [__,];
        var __VLS_34;
        var __VLS_35;
        let __VLS_39;
        /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
        Button;
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
            ...{ 'onClick': {} },
            variant: "ghost",
        }));
        const __VLS_41 = __VLS_40({
            ...{ 'onClick': {} },
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_40));
        let __VLS_44;
        const __VLS_45 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(reply.editable))
                        return;
                    reply.editable = false;
                    // @ts-ignore
                    [];
                } });
        const { default: __VLS_46 } = __VLS_42.slots;
        (__VLS_ctx.__('Discard'));
        // @ts-ignore
        [__,];
        var __VLS_42;
        var __VLS_43;
    }
    let __VLS_47;
    /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
    TextEditor;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
        ...{ 'onChange': {} },
        content: (reply.reply),
        editable: (reply.editable || false),
        fixedMenu: (reply.editable || false),
        editorClass: (reply.editable
            ? 'ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none'
            : 'prose-sm'),
    }));
    const __VLS_49 = __VLS_48({
        ...{ 'onChange': {} },
        content: (reply.reply),
        editable: (reply.editable || false),
        fixedMenu: (reply.editable || false),
        editorClass: (reply.editable
            ? 'ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none'
            : 'prose-sm'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    let __VLS_52;
    const __VLS_53 = ({ change: {} },
        { onChange: ((val) => (reply.reply = val)) });
    var __VLS_50;
    var __VLS_51;
    // @ts-ignore
    [];
}
if (__VLS_ctx.renderEditor && !__VLS_ctx.readOnlyMode) {
    let __VLS_54;
    /** @ts-ignore @type { | typeof __VLS_components.TextEditor} */
    TextEditor;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
        ...{ 'onChange': {} },
        ...{ class: "mt-5" },
        content: (__VLS_ctx.newReply),
        mentions: (__VLS_ctx.mentionUsers),
        placeholder: "Type your reply here...",
        fixedMenu: (true),
        editorClass: "ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none border border-outline-gray-2 rounded-b-md min-h-[7rem] py-1 px-2",
    }));
    const __VLS_56 = __VLS_55({
        ...{ 'onChange': {} },
        ...{ class: "mt-5" },
        content: (__VLS_ctx.newReply),
        mentions: (__VLS_ctx.mentionUsers),
        placeholder: "Type your reply here...",
        fixedMenu: (true),
        editorClass: "ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none border border-outline-gray-2 rounded-b-md min-h-[7rem] py-1 px-2",
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    let __VLS_59;
    const __VLS_60 = ({ change: {} },
        { onChange: ((val) => (__VLS_ctx.newReply = val)) });
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    var __VLS_57;
    var __VLS_58;
}
if (!__VLS_ctx.readOnlyMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_61;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
        ...{ 'onClick': {} },
    }));
    const __VLS_63 = __VLS_62({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    let __VLS_66;
    const __VLS_67 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(!__VLS_ctx.readOnlyMode))
                    return;
                __VLS_ctx.postReply();
                // @ts-ignore
                [readOnlyMode, readOnlyMode, renderEditor, newReply, newReply, mentionUsers, postReply,];
            } });
    const { default: __VLS_68 } = __VLS_64.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.__('Post'));
    // @ts-ignore
    [__,];
    var __VLS_64;
    var __VLS_65;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    props: {
        ...{},
        ...{
            topic: {
                type: Object,
                required: true,
            },
            singleThread: {
                type: Boolean,
                default: false,
            },
        },
    },
});
export default {};
