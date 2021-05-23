/// <reference types="jquery" />

function send(loc: string, content: object, handler: Function): void {
    fetch(loc, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(content),
    }).then((res) => {
        res.json().then((val) => handler(val));
    });
}

function sendNoCB(loc: string, content: object): void {
    fetch(loc, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(content),
    });
}

let numOfDocs: number; // TODO: fix this

function deleteDoc(id: string): void {
    send("/delete-doc", { id: id }, (res: any) => {
        $("#doc" + id).fadeOut(400, () => {
            document.getElementById("doc" + id)?.remove();
            numOfDocs--;
            if (numOfDocs == 0) {
                document.getElementById("noneLeft")?.classList.remove("invisible");
                $("#noneLeft").fadeIn(400);
            }
        });
    });
}

interface Window {
    numOfDocs: number;
}
