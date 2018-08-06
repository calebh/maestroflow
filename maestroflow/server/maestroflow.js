const express = require('express');
const cytoscape = require('cytoscape');
const edgehandles = require('cytoscape-edgehandles');

const Event = require('./event.js');
const Application = require('./application.js');
const Source = require('./source.js');
const Sink = require('./sink.js');
const Transformer = require('./transformer.js');

class MaestroFlow {
    constructor() {
        this.applications = {};
        this.transformers = [];
        this.appList = document.getElementById("app-list");

        this.initializeNetwork();
        this.initializeCy();

        this.addTransformerElem = document.getElementById("add-transformer");
        this.addTransformerElem.onclick = (event) => this.addTransformer(event);

        this.refresh();
    }

    initializeNetwork() {
        this.app = express();
        this.app.use(express.urlencoded());
        let httpHandler = (req, res) => { this.handleRequest(req.body); res.send("ok") };
        this.app.get('/', httpHandler);
        this.app.post('/', httpHandler);
        this.app.listen(54921);
    }

    initializeCy() {
        this.cy = cytoscape({
            container: document.getElementById('cy'),
            style: [
                {
                    selector: 'node',
                    style: {
                        'width': '60px',
                        'height': '60px',
                        'background-fit': 'cover',
                        'text-background-opacity': 1,
                        'text-background-shape': 'roundrectangle',
                        'text-background-color': '#CDCDCD',
                        'font-size': '20px',
                        'text-background-padding': '5px'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'curve-style': 'bezier',
                        'target-arrow-shape': 'triangle',
                        'target-arrow-color': 'black',
                        'line-color': 'black',
                        'width': 3
                    }
                },
                {
                    selector: '.eh-handle',
                    style: {
                        'label': '',
                        'background-color': 'black',
                        'width': '20px',
                        'height': '20px',
                        // The polygon doesn't seem to scale correctly
                        //'shape-polygon-points': '-0.5, -0.2, -0.3, 0, -0.5, 0.2, 0.3, 0.2, 0.5, 0, 0.3, -0.2',
                    }
                }
            ]
        });

        // the default values of each option are outlined below:
        let defaults = {
            preview: true, // whether to show added edges preview before releasing selection
            hoverDelay: 150, // time spent hovering over a target node before it is considered selected
            handleNodes: 'node', // selector/filter function for whether edges can be made from a given node
            snap: false, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
            snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
            snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
            noEdgeEventsInDraw: false, // set events:no to edges during draws, prevents mouseouts on compounds
            disableBrowserGestures: true, // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
            handlePosition: function(node) {
                let ioElem = node[0].data().io;
                if (ioElem instanceof Source) {
                    return 'right middle'; // sets the position of the handle in the format of "X-AXIS Y-AXIS" such as "left top", "middle top"
                } else {
                    return 'left middle';
                }
            },
            handleInDrawMode: false, // whether to show the handle in draw mode
            edgeType: function( sourceNode, targetNode ){
                // can return 'flat' for flat edges between nodes or 'node' for intermediate node between them
                // returning null/undefined means an edge can't be added between the two nodes
                return 'flat';
            },
            loopAllowed: function( node ){
                // for the specified node, return whether edges from itself to itself are allowed
                return false;
            },
            nodeLoopOffset: -50, // offset for edgeType: 'node' loops
            nodeParams: function( sourceNode, targetNode ){
                // for edges between the specified source and target
                // return element object to be passed to cy.add() for intermediary node
                return {};
            },
            edgeParams: function( sourceNode, targetNode, i ){
                // for edges between the specified source and target
                // return element object to be passed to cy.add() for edge
                // NB: i indicates edge index in case of edgeType: 'node'
                return {};
            },
            show: function( sourceNode ){
                // fired when handle is shown
            },
            hide: function( sourceNode ){
                // fired when the handle is hidden
            },
            start: function( sourceNode ){
                // fired when edgehandles interaction starts (drag on handle)
            },
            complete: function( sourceNode, targetNode, addedEles ){
                let source = sourceNode.data().io;
                let target = targetNode.data().io;
                let edge = addedEles[0];
                // fired when edgehandles is done and elements are added
                // Remove invalid edges
                if (!((source instanceof Source || source instanceof Transformer) && (target instanceof Sink || target instanceof Transformer)) || source.typeName !== target.typeName) {
                    edge.remove();
                } else {
                    source.addTarget(target);
                    edge.on("click", (node) => {
                        source.removeTarget(target);
                        edge.remove();
                    });
                }
            },
            stop: function( sourceNode ){
                // fired when edgehandles interaction is stopped (either complete with added edges or incomplete)
            },
            cancel: function( sourceNode, cancelledTargets ){
                // fired when edgehandles are cancelled (incomplete gesture)
            },
            hoverover: function( sourceNode, targetNode ){
                // fired when a target is hovered
            },
            hoverout: function( sourceNode, targetNode ){
                // fired when a target isn't hovered anymore
            },
            previewon: function( sourceNode, targetNode, previewEles ){
                // fired when preview is shown
            },
            previewoff: function( sourceNode, targetNode, previewEles ){
                // fired when preview is hidden
            },
            drawon: function(){
                // fired when draw mode enabled
            },
            drawoff: function(){
                // fired when draw mode disabled
            }
        };
        
        this.eh = this.cy.edgehandles(defaults);
    }

    addTransformer(event) {
        let t = new Transformer(this.cy);
        this.transformers.push(t);
    }

    handleRequest(request) {
        console.log("Handling request", request);
        if ('commType' in request) {
            switch (request.commType) {
                case "ApplicationAnnouncement":
                    this.handleApplicationAnnouncement(request);
                    break;
                
                case "SinkAnnouncement":
                    this.handleSinkAnnouncement(request);
                    break;
                
                case "SourceAnnouncement":
                    this.handleSourceAnnouncement(request);
                    break;
                
                case "EventAnnouncement":
                    this.handleEvent(request);
                    break;
            }
        }
    }

    handleApplicationAnnouncement(request) {
        if ('application' in request && 'addr' in request) {
            var appName = request.application;
            var addr = request.addr;
            if ('logo' in request) {
                var logo = request.logo;
            } else {
                var logo = '';
            }
            
            let app = new Application(this.cy, appName, logo, addr);
            this.applications[appName] = app;
            this.refresh();
        }
    }

    handleSinkAnnouncement(request) {
        if ('application' in request && 'path' in request && 'typeName' in request) {
            let appName = request.application;
            let path = request.path;
            let typeName = request.typeName;

            if (appName in this.applications) {
                let app = this.applications[appName];
                app.addSink(path, typeName);
                this.refresh();
            }
        }
    }

    handleSourceAnnouncement(request) {
        if ('application' in request && 'path' in request && 'typeName' in request) {
            let appName = request.application;
            let path = request.path;
            let typeName = request.typeName;

            if (appName in this.applications) {
                let app = this.applications[appName];
                app.addSource(path, typeName);
                this.refresh();
            }
        }
    }

    handleEvent(request) {
        if ('application' in request && 'path' in request && 'typeName' in request && 'data' in request) {
            let appName = request.application;
            let path = request.path;
            let typeName = request.typeName;
            let data = request.data;

            if (appName in this.applications) {
                let app = this.applications[appName];
                app.handleEvent(new Event(appName, path, typeName, data));
            }
        }
    }

    render() {
        var appList = document.createElement("ul");
        appList.setAttribute("id", "app-list");

        for (var key in this.applications) {
            appList.appendChild(this.applications[key].render());
        }

        return appList;
    }

    refresh() {
        while (this.appList.firstChild) {
            this.appList.removeChild(this.appList.firstChild);
        }

        this.appList.appendChild(this.render());
    }
}

module.exports = MaestroFlow;