import Quill from "quill";
import * as Emoji from "quill-emoji";

/// <reference path="./documentManager.ts"/>

Quill.register("modules/emoji", Emoji);

const quill: Quill = new Quill("#editor", {
    modules: {
        toolbar: { container: "#toolbar", handlers: { emoji: () => {} } },
        formula: true,
        "emoji-toolbar": true,
        "emoji-shortname": true,
    },
    placeholder: "start typing...",
    theme: "snow",
});

declare function mathquill4quill(): any;
var enableMathQuillFormulaAuthoring = mathquill4quill();
enableMathQuillFormulaAuthoring(quill, {
    operators: [
        ["\\frac{x}{y}", "\\frac"],
        ["\\sqrt[n]{x}", "\\nthroot"],
        ["\\int_{a}^{b}", "\\int"],
        ["\\sum^{a}_{b}", "\\sum"],
        ["\\infty", "\\infty"],
    ],
});

const identifier: string = document.currentScript?.getAttribute("note-id")!;
const data = JSON.parse(document.currentScript?.getAttribute("doc-data")!);

quill.setContents(data.delta);

window.onload = () => {
    if (data.name != null && data.name != "untitled note") (<HTMLInputElement>document.getElementById("notename")).value = data.name;

    const syncBtn = document.getElementById("sync-btn")!;
    syncBtn.onclick = function () {
        if (!syncBtn.classList.contains("rotating")) {
            syncBtn.classList.add("rotating");
            setTimeout(() => {
                syncBtn.classList.remove("rotating");
            }, 1000);
        }

        const noteName = (<HTMLInputElement>document.getElementById("notename")).value || "untitled note";
        let data = { id: identifier, name: noteName, delta: quill.getContents() };
        send("/save", data, (res: any) => {
            console.log(res);
        });
    };
};

declare global {
    interface Window {
        quill: Quill;
        mathquill4quill: () => {};
    }
}

window.quill = quill;
