var request = require('request');

class Sink {
    constructor(application_name, cy, path, typeName, logo, addr) {
        this.application = application_name;
        this.cy = cy;
        this.path = path;
        this.typeName = typeName;
        this.logo = logo;
        this.addr = addr;

        this.html = document.createElement("li");
        this.html.innerText = this.path;
        this.html.onclick = (event) => this.clicked(event);
    }

    notify(event) {
        request.post(this.addr, {
            qs: {
                'commType': 'EventAnnouncement',
                'application': this.application,
                'path': this.path,
                'typeName': event.typeName,
                'data': event.data
            },
            useQuerystring: true
        });

        /*
        var clientServerOptions = {
            uri: this.addr,
            body: {
                'commType': 'EventAnnouncement',
                'application': event.application,
                'path': event.path,
                'typeName': event.typeName,
                'data': event.data
            },
            method: 'POST',
            headers: {
                'Content-Type': 'application/maestroflow'
            }
        }
        request(clientServerOptions, function (error, response) {
            return;
        });
        */
    }

    clicked(event) {
        this.cy.add([
            {
                group: "nodes",
                data: {id: this.path, io: this},
                position: {x: 200, y: 200},
                style: {
                    'label': this.path + ":" + this.typeName,
                    'background-image': 'data:image/png;base64,' + this.logo,
                    'text-background-color': '#ffa3a3',
                    'text-halign': 'right',
                    'text-valign': 'center',
                    'text-margin-x': '4px',
                }
            }    
        ]);
    }

    render() {
        return this.html;
    }
}

module.exports = Sink;