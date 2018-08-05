const Source = require('./source.js');
const Sink = require('./sink.js');

class Application {
    constructor(cy, name, logo, addr) {
        this.cy = cy;
        this.name = name;
        this.logo = logo;
        this.sources = {};
        this.sinks = {};
        this.addr = addr;
    }
    
    addSource(path, typeName) {
        this.sources[path] = new Source(this.cy, path, typeName, this.logo);
    }

    addSink(path, typeName) {
        this.sinks[path] = new Sink(this.name, this.cy, path, typeName, this.logo, this.addr);
    }

    handleEvent(event) {
        //console.log("handling event");
        if (event.application == this.name) {
            if (event.path in this.sources) {
                let source = this.sources[event.path];
                source.handleEvent(event);
            }
        }
    }

    renderIO(label, ios) {
        var ioContainer = document.createElement("li");
        ioContainer.setAttribute("class", "app-io");

        var ioLabel = document.createElement("p");
        ioLabel.setAttribute("class", "app-io-label");
        ioLabel.innerText = label;

        var ioList = document.createElement("ul");
        var iosElem = Object.values(ios).map((io) => io.render());
        
        ioContainer.appendChild(ioLabel);
        ioContainer.appendChild(ioList);
        iosElem.forEach(function(io) {
            ioList.appendChild(io);
        });

        return ioContainer;
    }

    render() {
        let appEntry = document.createElement("li");
        appEntry.setAttribute("class", "app-entry");
        
        let logo = document.createElement("img");
        logo.setAttribute("class", "app-image");
        logo.setAttribute("src", "data:image/png;base64," + this.logo);

        let appInfoWrapper = document.createElement("div");
        appInfoWrapper.setAttribute("class", "app-info-wrapper");

        let appInfo = document.createElement("div");
        appInfo.setAttribute("class", "app-info");

        let name = document.createElement("p");
        name.setAttribute("class", "app-name");
        name.innerText = this.name;

        let ul = document.createElement("ul");
        let sources = this.renderIO("Sources", this.sources);
        let sinks = this.renderIO("Sinks", this.sinks);

        appEntry.appendChild(logo);
        appEntry.appendChild(appInfoWrapper);
        appInfoWrapper.appendChild(appInfo)
        appInfo.appendChild(name);
        appInfo.appendChild(ul);
        ul.appendChild(sources);
        ul.appendChild(sinks);

        return appEntry;
    }
}

module.exports = Application;