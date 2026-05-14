frappe.ui.form.on('AI Grading Rubric', {
    refresh: function(frm) {
        if (frm.doc.source_file && frm.doc.extracted_text) {
            frm.add_custom_button(__('Generate Rubric via AI'), function() {
                frm.events.generate_ai_rubric(frm);
            }).addClass('btn-primary');
        }
        
        // Add external libraries
        if (!window.mammoth) {
            frappe.require('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.21/mammoth.browser.min.js');
        }
        if (!window.XLSX) {
            frappe.require('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
        }
        if (!window.pdfjsLib) {
            frappe.require('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js');
        }
    },

    source_file: function(frm) {
        if (frm.doc.source_file) {
            frm.events.extract_content_from_file(frm);
        }
    },

    extract_content_from_file: function(frm) {
        const file_url = frm.doc.source_file;
        const extension = file_url.split('.').pop().toLowerCase();
        
        frappe.show_alert({message: __('Extracting content from {0}...', [extension]), subtitle: __('Please wait'), indicator: 'blue'});

        fetch(file_url)
            .then(res => res.arrayBuffer())
            .then(buffer => {
                if (extension === 'docx') {
                    mammoth.extractRawText({arrayBuffer: buffer})
                        .then(result => {
                            frm.set_value('extracted_text', result.value);
                            frappe.show_alert(__('Text extracted from Word successfully'), 'green');
                        });
                } else if (extension === 'xlsx' || extension === 'xls') {
                    const workbook = XLSX.read(buffer, {type: 'array'});
                    let full_text = "";
                    workbook.SheetNames.forEach(sheetName => {
                        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                        full_text += `--- Sheet: ${sheetName} ---\n${csv}\n\n`;
                    });
                    frm.set_value('extracted_text', full_text);
                    frappe.show_alert(__('Text extracted from Excel successfully'), 'green');
                } else if (extension === 'pdf') {
                    const loadingTask = pdfjsLib.getDocument({data: buffer});
                    loadingTask.promise.then(pdf => {
                        let maxPages = pdf.numPages;
                        let countPromises = [];
                        for (let i = 1; i <= maxPages; i++) {
                            countPromises.push(pdf.getPage(i).then(page => {
                                return page.getTextContent().then(content => {
                                    return content.items.map(item => item.str).join(' ');
                                });
                            }));
                        }
                        Promise.all(countPromises).then(texts => {
                            frm.set_value('extracted_text', texts.join('\n\n--- Page Break ---\n\n'));
                            frappe.show_alert(__('Text extracted from PDF successfully'), 'green');
                        });
                    });
                } else if (['txt', 'csv'].includes(extension)) {
                    const decoder = new TextDecoder('utf-8');
                    frm.set_value('extracted_text', decoder.decode(buffer));
                    frappe.show_alert(__('Text read successfully'), 'green');
                }
            })
            .catch(err => {
                frappe.msgprint(__('Error extracting file: {0}', [err.message]));
            });
    },

    generate_ai_rubric: function(frm) {
        frappe.call({
            method: 'lms.lms.doctype.ai_grading_rubric.ai_grading_rubric.generate_rubric_via_ai',
            args: {
                docname: frm.doc.name
            },
            freeze: true,
            freeze_message: __('AI is analyzing your questions and building the rubric...'),
            callback: function(r) {
                if (!r.exc) {
                    frm.reload_doc();
                    frappe.show_alert(__('Rubric generated successfully!'), 'green');
                }
            }
        });
    }
});
