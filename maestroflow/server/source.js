class Source {
    constructor(cy, name, typeName, logo) {
        this.cy = cy;
        this.name = name;
        this.typeName = typeName;
        this.logo = logo;

        this.html = document.createElement("li");
        this.html.innerText = this.name;
        this.html.onclick = (event) => this.clicked(event);
        this.node = null;

        this.targets = [];
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

    clicked(event) {
        let nodes = this.cy.add([
            {
                group: "nodes",
                data: {id: this.name, io: this},
                position: {x: 200, y: 200},
                style: {
                    'label': this.name + ":" + this.typeName,
                    'text-halign': 'left',
                    'text-valign': 'center',
                    'text-margin-x': '-4px',
                    'background-image': 'data:image/png;base64,' + this.logo,
                    'text-background-color': '#a3ffcc'
                }
            }    
        ]);
        this.node = nodes[0];
    }

    handleEvent(event) {
        this.targets.forEach((target) => target.notify(event));
    }

    render() {
        return this.html;
    }
}

module.exports = Source;