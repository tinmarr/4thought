import { response } from "express";
import Quill from "quill";
import QuillMarkdown from "quilljs-markdown";
/// <reference path="./documentManager.ts"/>

const quill: Quill = new Quill("#editor", {
    modules: {
        toolbar: "#toolbar",
        formula: true,
    },
    placeholder: "start typing...",
    theme: "snow",
});
new QuillMarkdown(quill, {});

enum Format {
    list,
    raw,
    stringWithNoN,
}
function getText(format: Format): any {
    let thing: HTMLDivElement = <HTMLDivElement>document.getElementsByClassName("ql-editor")[0];
    let text: string = thing.innerText;
    if (format === Format.list) {
        console.log("is list");
        return text.split("\n");
    }
    if (format === Format.stringWithNoN) {
        console.log("is string");
        return text.replace(/(\r\n|\n|\r)/gm, "");
    }
    return text;
}

declare function mathquill4quill(): any;
let enableMathQuillFormulaAuthoring = mathquill4quill();
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

if (data.name != null && data.name != "untitled note") (document.getElementById("notename") as HTMLInputElement).value = data.name;

const textingBtn = document.getElementById("add-texting-shortcuts")!;
let textshortcuts: object = {};
textingBtn.onclick = function () {
    // // get whats in the in
    // let stuffin: string = /*<HTMLTextAreaElement>*/ document.querySelector("div.popover-body > #in").value;
    // // get whats in the out
    // let stuffout: string = /*<HTMLTextAreaElement>*/ document.querySelector("div.popover-body > #out").value;
    // // create new textshortcuts[in] = out
    // textshortcuts[stuffin] = stuffout;
    console.log("yet to be implemented. Should create popup where you can add shortcuts");
    console.log(textshortcuts);
};
const textingToggle = document.getElementById("txtModeToggle")!;
let textingToggleState: boolean = false;
textingToggle.onchange = function () {
    const inpt = document.getElementsByName("input-texting-toggle")[0]! as HTMLInputElement;
    textingToggleState = inpt.checked;
    console.log(`toggled to ${textingToggleState.valueOf()}`);
};

let noteName: string = (<HTMLInputElement>document.getElementById("notename")).value;

const syncBtn = document.getElementById("sync-btn")!;
syncBtn.onclick = save;

const closeBtn: HTMLLinkElement = <HTMLLinkElement>document.getElementById("close")!;
closeBtn.onclick = (e) => {
    e.preventDefault();
    save();
    window.location.href = closeBtn.href;
};

function save(): void {
    nameNote();

    if (!syncBtn.children[0].classList.contains("rotating")) {
        syncBtn.children[0].classList.add("rotating");
        setTimeout(() => {
            syncBtn.children[0].classList.remove("rotating");
        }, 1000);
    }

    let data = {
        id: identifier,
        name: noteName,
        delta: quill.getContents(),
        // txtshortcuts: textshortcuts,
    };
    send("/save", data, (res: any) => {
        console.log(res);
    });
}

function nameNote(): void {
    if ((<HTMLInputElement>document.getElementById("notename")).value == "") {
        if ((<HTMLElement>document.getElementsByClassName("ql-editor")[0]).innerText != "\n") {
            let list: string[] = (<HTMLElement>document.getElementsByClassName("ql-editor")[0]).innerText.split(" ");
            noteName = list.length > 5 ? list.splice(0, 5).join(" ") : list.join(" ");
        } else {
            noteName = "Untitled Note";
        }
    } else {
        noteName = (<HTMLInputElement>document.getElementById("notename")).value;
    }
}

const downloadButton = document.getElementById("downloadPDF")!;
downloadButton.onclick = () => {
    nameNote();
    let content: string = document.getElementsByClassName("ql-editor")[0]?.innerHTML!;
    let worker = window
        .html2pdf()
        .set({ margin: 15 })
        .from(content)
        .save(noteName + ".pdf");
};

let popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]#add-texting-shortcuts'));
let popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    let content = document.getElementById("text-shortcuts-popover")?.innerHTML;
    let options = {
        container: "body",
        sanitize: false,
        html: true,
        placement: "bottom",
        content: content,
        trigger: "click",
    };
    return new window.bootstrap.Popover(popoverTriggerEl, options);
});

window.onbeforeunload = (e: BeforeUnloadEvent) => {
    save();
};

function searchWikipedia(keyWord: string): any {
    let url = "https://en.wikipedia.org/w/api.php";
    let params = {
        action: "query",
        list: "search",
        srsearch: keyWord,
        format: "json",
    };
    url += "?origin=*";
    Object.keys(params).forEach((key) => {
        url += "&" + key + "=" + params[key];
    });
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (response) {
            if ((<string>response.query.search[0].title).toLowerCase() == keyWord.toLowerCase()) {
                let div: HTMLDivElement = <HTMLDivElement>document.getElementById("suggestions")!;
                div.innerHTML += `<p><strong>${keyWord}</strong>: ${response.query.search[0].snippet}...</p>`;
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

declare global {
    interface Window {
        quill: Quill;
        bootstrap: any;
        html2pdf: any;
        searchWikipedia: any;
    }
}

window.quill = quill;
window.searchWikipedia = searchWikipedia;
