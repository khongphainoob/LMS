import MarkdownIt from 'markdown-it';
import markdownItKatex from 'markdown-it-katex';

const md = new MarkdownIt({ html: true, breaks: true }).use(markdownItKatex);

const text = "Tính tích phân $\\int_0^1 e^x dx$.";
const option = "$e - 1$";

console.log("Question:");
console.log(md.render(text));

console.log("Option:");
console.log(md.render(option));
