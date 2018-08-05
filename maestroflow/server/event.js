class Event {
    constructor(application, path, typeName, data) {
        this.application = application;
        this.path = path;
        this.typeName = typeName;
        this.data = data;
    }
}

module.exports = Event;