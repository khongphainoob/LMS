/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { Button, call, createListResource, createResource, Dialog, FormControl, } from 'frappe-ui';
import { computed, ref, watch } from 'vue';
import SettingFields from '@/components/Settings/SettingFields.vue';
const show = defineModel({ required: true, default: false });
const paymentGateways = defineModel('paymentGateways');
const newGateway = ref(null);
const newGatewayFields = ref([]);
const newGatewayData = ref({});
const props = defineProps();
const paymentGateway = createResource({
    url: 'lms.lms.api.get_payment_gateway_details',
    makeParams(values) {
        return {
            payment_gateway: props.gatewayID,
        };
    },
    transform(data) {
        arrangeFields(data.fields);
        data.sections = makeSections(data.fields);
        return data;
    },
});
const allGateways = createListResource({
    doctype: 'DocType',
    filters: {
        module: 'Payment Gateways',
    },
    fields: ['name', 'issingle'],
});
const gatewayFields = createResource({
    url: 'lms.lms.api.get_new_gateway_fields',
    makeParams(values) {
        return {
            doctype: values.doctype,
        };
    },
});
const arrangeFields = (fields) => {
    fields = fields.sort((a, b) => {
        if (a.type === 'Upload' && b.type !== 'Upload') {
            return 1;
        }
        else if (a.type !== 'Upload' && b.type === 'Upload') {
            return -1;
        }
        return 0;
    });
};
watch(() => props.gatewayID, () => {
    if (props.gatewayID && props.gatewayID !== 'new') {
        paymentGateway.reload();
    }
    else if (props.gatewayID == 'new') {
        allGateways.reload();
    }
});
const getNewGateway = () => {
    return allGateways.data?.find((gateway) => gateway.name.includes(newGateway.value));
};
watch(newGateway, () => {
    let gatewayDoc = getNewGateway();
    gatewayFields.reload({ doctype: gatewayDoc.name }).then(() => {
        let fields = gatewayFields.data || [];
        arrangeFields(fields);
        newGatewayFields.value = makeSections(fields);
        prepareGatewayData();
    });
});
const saveSettings = (close) => {
    if (props.gatewayID === 'new') {
        saveNewGateway(close);
    }
    else {
        saveExistingGateway(paymentGateway.data.doctype, paymentGateway.data.docname, close);
    }
};
const saveNewGateway = (close) => {
    let gatewayDoc = getNewGateway();
    if (gatewayDoc.issingle) {
        saveExistingGateway(gatewayDoc.name, gatewayDoc.name, close);
    }
    else {
        call('frappe.client.insert', {
            doc: {
                doctype: gatewayDoc.name,
                ...newGatewayData.value,
            },
        }).then((data) => {
            paymentGateways.value.reload();
            close();
        });
    }
};
const saveExistingGateway = (doctype, docname, close) => {
    call('frappe.client.set_value', {
        doctype: doctype,
        name: docname,
        fieldname: getGatewayFields(),
    }).then(() => {
        paymentGateways.value?.reload();
        close();
    });
};
const getGatewayFields = () => {
    let data = props.gatewayID == 'new' ? newGatewayData.value : paymentGateway.data.data;
    return Object.keys(data).reduce((fields, key) => {
        if (data[key] && typeof data[key] === 'object') {
            fields[key] = data[key].file_url;
        }
        else {
            fields[key] = data[key];
        }
        return fields;
    }, {});
};
const allGatewayOptions = computed(() => {
    let options = [];
    let gatewayList = allGateways.data?.map((gateway) => gateway.name) || [];
    gatewayList.forEach((gateway) => {
        let gatewayName = gateway.split(' ')[0];
        let existingGateways = paymentGateways.value?.data?.map((pg) => pg.name) || [];
        if (!options.includes(gatewayName) &&
            !existingGateways.includes(gatewayName)) {
            options.push(gatewayName);
        }
    });
    return options.map((gateway) => ({ label: gateway, value: gateway }));
});
const prepareGatewayData = () => {
    newGatewayData.value = {};
    if (newGatewayFields.value.length) {
        newGatewayFields.value.forEach((field) => {
            newGatewayData.value[field.fieldname] = field.default || '';
        });
    }
};
const makeSections = (fields) => {
    const columnCount = fields.length / 3;
    let sections = [
        {
            columns: [],
        },
    ];
    for (let i = 0; i < columnCount; i++) {
        sections[0].columns.push({
            fields: fields.slice(i * 3, i * 3 + 3),
        });
    }
    return sections;
};
const __VLS_defaultModels = {
    'modelValue': false,
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
        size: '3xl',
    }),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.show),
    options: ({
        size: '3xl',
    }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { 'body-header': __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-lg font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.gatewayID === 'new'
        ? __VLS_ctx.__('New Payment Gateway')
        : __VLS_ctx.__('Edit Payment Gateway'));
    // @ts-ignore
    [show, gatewayID, __, __,];
}
{
    const { 'body-content': __VLS_8 } = __VLS_3.slots;
    if (__VLS_ctx.gatewayID != 'new' && __VLS_ctx.paymentGateway.data) {
        const __VLS_9 = SettingFields;
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
            sections: (__VLS_ctx.paymentGateway.data.sections),
            data: (__VLS_ctx.paymentGateway.data.data),
        }));
        const __VLS_11 = __VLS_10({
            sections: (__VLS_ctx.paymentGateway.data.sections),
            data: (__VLS_ctx.paymentGateway.data.data),
        }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-5" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
        let __VLS_14;
        /** @ts-ignore @type { | typeof __VLS_components.FormControl} */
        FormControl;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            modelValue: (__VLS_ctx.newGateway),
            label: (__VLS_ctx.__('Select Payment Gateway')),
            type: "select",
            options: (__VLS_ctx.allGatewayOptions),
            required: (true),
        }));
        const __VLS_16 = __VLS_15({
            modelValue: (__VLS_ctx.newGateway),
            label: (__VLS_ctx.__('Select Payment Gateway')),
            type: "select",
            options: (__VLS_ctx.allGatewayOptions),
            required: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        if (__VLS_ctx.newGateway) {
            const __VLS_19 = SettingFields;
            // @ts-ignore
            const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
                sections: (__VLS_ctx.newGatewayFields),
                data: (__VLS_ctx.newGatewayData),
            }));
            const __VLS_21 = __VLS_20({
                sections: (__VLS_ctx.newGatewayFields),
                data: (__VLS_ctx.newGatewayData),
            }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        }
    }
    // @ts-ignore
    [gatewayID, __, paymentGateway, paymentGateway, paymentGateway, newGateway, newGateway, allGatewayOptions, newGatewayFields, newGatewayData,];
}
{
    const { actions: __VLS_24 } = __VLS_3.slots;
    const [{ close }] = __VLS_vSlot(__VLS_24);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pb-5 float-right" },
    });
    /** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['float-right']} */ ;
    let __VLS_25;
    /** @ts-ignore @type { | typeof __VLS_components.Button | typeof __VLS_components.Button} */
    Button;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        ...{ 'onClick': {} },
        variant: "solid",
    }));
    const __VLS_27 = __VLS_26({
        ...{ 'onClick': {} },
        variant: "solid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    let __VLS_30;
    const __VLS_31 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.saveSettings(close);
                // @ts-ignore
                [saveSettings,];
            } });
    const { default: __VLS_32 } = __VLS_28.slots;
    (__VLS_ctx.__('Save'));
    // @ts-ignore
    [__,];
    var __VLS_28;
    var __VLS_29;
    // @ts-ignore
    [];
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
