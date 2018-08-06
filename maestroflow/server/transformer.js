const Event = require('./event.js');

class Transformer {
    constructor(cy) {
        this.name = "Transformer";
        this.cy = cy;
        this.code = "(input) => {\n    return input;\n}";
        this.f = eval(this.code);
        this.targets = [];
        this.typeName = "unknowntype";

        let nodes = this.cy.add([
            {
                group: "nodes",
                data: {id: this.name, io: this},
                position: {x: 200, y: 200},
                style: {
                    'label': this.name + ":" + this.typeName,
                    'text-halign': 'center',
                    'text-valign': 'center',
                    'text-background-color': '#a9d6f1',
                    'shape': 'roundrectangle'
                }
            }    
        ]);
        this.node = nodes[0];

        this.node.on("click", (event) => this.clicked(event));

        this.typeNameInput = document.createElement("input");
        this.typeNameInput.setAttribute("type", "text");
        this.typeNameInput.setAttribute("value", this.typeName);

        this.textareaWrapper = document.createElement("div");
        this.textareaWrapper.style.position = "absolute";
        this.textareaWrapper.style.left = "0";
        this.textareaWrapper.style.top = "0";
        this.textareaWrapper.style.display = "none";
        this.textareaWrapper.style.backgroundColor = "#a9d6f1";

        this.textarea = document.createElement("textarea");
        this.textarea.setAttribute("rows", "10");
        this.textarea.setAttribute("cols", "50");
        this.textarea.value = this.code;

        this.closeButton = document.createElement("button");
        this.closeButton.innerText = "close";
        this.closeButton.onclick = (event) => this.onClose(event);

        this.textareaWrapper.appendChild(this.typeNameInput);
        this.textareaWrapper.appendChild(document.createElement("br"));
        this.textareaWrapper.appendChild(this.textarea);
        this.textareaWrapper.appendChild(document.createElement("br"));
        this.textareaWrapper.appendChild(this.closeButton);
        document.getElementById("body").appendChild(this.textareaWrapper);
    }

    addTarget(output) {
        this.targets.push(output);
    }

    removeTarget(output) {
        let index = this.targets.indexOf(output);
        if (index > -1) {
            this.targets.splice(index, 1);
        }
    }

    onClose(event) {
        this.textareaWrapper.style.display = "none";
        this.code = this.textarea.value;
        this.typeName = this.typeNameInput.value;
        this.f = eval(this.code);

        this.node.style({"label": this.name + ":" + this.typeName});
    }

    clicked(event) {
        let x = Math.round(event.position.x) + 300;
        let y = Math.round(event.position.y);
        this.textareaWrapper.style.left = x + "px";
        this.textareaWrapper.style.top = y + "px";
        this.textareaWrapper.style.display = "block";
    }

    notify(event) {
        let newEvent = new Event(event.application, event.path, event.typeName, this.f(event.data));
        this.targets.forEach((target) => target.notify(newEvent));
    }
}

module.exports = Transformer;