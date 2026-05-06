/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { call, Dialog, FormControl, toast } from 'frappe-ui';
import { inject, reactive, watch } from 'vue';
import { openSettings, cleanError } from '@/utils';
import Link from '@/components/Controls/Link.vue';
import { useTelemetry } from 'frappe-ui/frappe';
const show = defineModel('show');
const user = inject('$user');
const zoomAccounts = defineModel('zoomAccounts');
const { capture } = useTelemetry();
const account = reactive({
    name: '',
    enabled: false,
    member: user?.data?.name || '',
    account_id: '',
    client_id: '',
    client_secret: '',
});
const props = defineProps({
    accountID: {
        type: String,
        default: 'new',
    },
});
watch(() => props.accountID, (val) => {
    if (val === 'new') {
        account.name = '';
        account.enabled = false;
        account.member = user?.data?.name || '';
        account.account_id = '';
        account.client_id = '';
        account.client_secret = '';
    }
    else if (val && val !== 'new') {
        const acc = zoomAccounts.value?.data.find((acc) => acc.name === val);
        if (acc) {
            account.name = acc.name;
            account.enabled = acc.enabled || false;
            account.member = acc.member;
            account.account_id = acc.account_id;
            account.client_id = acc.client_id;
            account.client_secret = acc.client_secret;
        }
    }
});
const saveAccount = (close) => {
    if (props.accountID == 'new') {
        createAccount(close);
    }
    else {
        updateAccount(close);
    }
};
const createAccount = (close) => {
    zoomAccounts.value?.insert.submit({
        account_name: account.name,
        ...account,
    }, {
        onSuccess() {
            capture('zoom_account_linked');
            zoomAccounts.value?.reload();
            close();
            toast.success(__('Zoom Account created successfully'));
        },
        onError(err) {
            close();
            toast.error(cleanError(err.messages[0]) || __('Error creating Zoom Account'));
        },
    });
};
const updateAccount = async (close) => {
    if (props.accountID != account.name) {
        await renameDoc();
    }
    setValue(close);
};
const renameDoc = async () => {
    await call('frappe.client.rename_doc', {
        doctype: 'LMS Zoom Settings',
        old_name: props.accountID,
        new_name: account.name,
    });
};
const setValue = (close) => {
    zoomAccounts.value?.setValue.submit({
        ...account,
        name: account.name,
        account_name: props.accountID,
    }, {
        onSuccess() {
            zoomAccounts.value?.reload();
            close();
            toast.success(__('Zoom Account updated successfully'));
        },
        onError(err) {
            close();
            toast.error(cleanError(err.messages[0]) || __('Error updating Zoom Account'));
        },
    });
};
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
        title: __VLS_ctx.accountID === 'new' ? __VLS_ctx.__('New Zoom Account') : __VLS_ctx.__('Edit Zoom Account'),
        size: 'xl',
        actions: [
            {
                label: __VLS_ctx.__('Save'),
                variant: 'solid',
                onClick: ({ close }) => {
                    __VLS_ctx.saveAccount(close);
                },
            },
        ],
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        title: __VLS_ctx.accountID === 'new' ? __VLS_ctx.__('New Zoom Account') : __VLS_ctx.__('Edit Zoom Account'),
        size: 'xl',
        actions: [
            {
                label: __VLS_ctx.__('Save'),
                variant: 'solid',
                onClick: ({ close }) => {
                    __VLS_ctx.saveAccount(close);
                },
            },
        ],
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-content': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.account.enabled),
        label: (__VLS_ctx.__('Enabled')),
        type: "checkbox",
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.account.enabled),
        label: (__VLS_ctx.__('Enabled')),
        type: "checkbox",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 gap-5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        modelValue: (__VLS_ctx.account.name),
        label: (__VLS_ctx.__('Account Name')),
        type: "text",
        required: (true),
    }));
    const __VLS_15 = __VLS_14({
        modelValue: (__VLS_ctx.account.name),
        label: (__VLS_ctx.__('Account Name')),
        type: "text",
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        modelValue: (__VLS_ctx.account.client_id),
        label: (__VLS_ctx.__('Client ID')),
        type: "text",
        required: (true),
    }));
    const __VLS_20 = __VLS_19({
        modelValue: (__VLS_ctx.account.client_id),
        label: (__VLS_ctx.__('Client ID')),
        type: "text",
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    const __VLS_23 = Link;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        modelValue: (__VLS_ctx.account.member),
        label: (__VLS_ctx.__('Member')),
        doctype: "Course Evaluator",
        onCreate: ((value, close) => __VLS_ctx.openSettings('Members', close)),
        required: (true),
    }));
    const __VLS_25 = __VLS_24({
        modelValue: (__VLS_ctx.account.member),
        label: (__VLS_ctx.__('Member')),
        doctype: "Course Evaluator",
        onCreate: ((value, close) => __VLS_ctx.openSettings('Members', close)),
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    let __VLS_28;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
        modelValue: (__VLS_ctx.account.client_secret),
        label: (__VLS_ctx.__('Client Secret')),
        type: "password",
        required: (true),
    }));
    const __VLS_30 = __VLS_29({
        modelValue: (__VLS_ctx.account.client_secret),
        label: (__VLS_ctx.__('Client Secret')),
        type: "password",
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_33;
    /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
    FormControl;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
        modelValue: (__VLS_ctx.account.account_id),
        label: (__VLS_ctx.__('Account ID')),
        type: "text",
        required: (true),
    }));
    const __VLS_35 = __VLS_34({
        modelValue: (__VLS_ctx.account.account_id),
        label: (__VLS_ctx.__('Account ID')),
        type: "text",
        required: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    // @ts-ignore
    [show, accountID, __, __, __, __, __, __, __, __, __, saveAccount, account, account, account, account, account, account, openSettings,];
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
            accountID: {
                type: String,
                default: 'new',
            },
        },
    },
});
export default {};
