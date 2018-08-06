import requests
from aiohttp import web
import threading
import queue
import asyncio
import time
import signal
import sys
import os
import base64
import socket

def get_open_port():        
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("",0))
    s.listen(1)
    port = s.getsockname()[1]
    s.close()
    return port

def image(png_filename):
    with open(png_filename, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())
        return encoded_string.decode('utf-8')

def server(host, port, loop_queue, result_queue):
    loop = asyncio.new_event_loop()
    loop_queue.put(loop)
    asyncio.set_event_loop(loop)

    async def receive(request):
        result_queue.put(request)
        return web.Response(text="ok")

    app = web.Application()
    app.add_routes([web.get('/', receive)])
    app.add_routes([web.post('/', receive)])
    web.run_app(app, host=host, port=port)

class Application:
    def __init__(self, name, logo, host="127.0.0.1", port=None, maestroflow_addr="http://127.0.0.1:54921/"):
        if port is None:
            port = get_open_port()
        self.port = port
        self.name = name
        self.logo = logo
        self.host = host
        self.http_addr = "http://" + self.host + ":" + str(self.port)
        self.maestroflow_addr = maestroflow_addr
        self.sources = []
        self.sinks = {}
        self.send({'commType': 'ApplicationAnnouncement', 'name': name, 'logo': logo})
        self.recieve_queue = queue.Queue()
        loop_queue = queue.Queue()
        self.server_thread = threading.Thread(target=server, args=(host, port, loop_queue, self.recieve_queue))
        self.server_thread.start()
        self.loop = loop_queue.get()
    
    def add_source(self, source):
        self.sources.append(source)

    def add_sink(self, sink):
        self.sinks[sink.path] = sink

    def send(self, data):
        data['application'] = self.name
        data['addr'] = self.http_addr
        requests.post(self.maestroflow_addr, data=data)

    def poll(self):
        while not self.recieve_queue.empty():
            query = self.recieve_queue.get().query
            if 'commType' in query and 'application' in query and 'path' in query and 'typeName' in query and 'data' in query:
                comm_type = query['commType']
                application = query['application']
                path = query['path']

                if comm_type == 'EventAnnouncement' and application == self.name and path in self.sinks:
                    type_name = query['typeName']
                    data = query['data']

                    sink = self.sinks[path]
                    event = Event(application, path, type_name, data)

                    sink.notify(event)
    
    def stop(self):
        self.loop.stop()
        # Thes server will not actually process the stop immediately for some reason. As a hack,
        # we send it a bogus message so that it will actually die
        requests.post(self.http_addr)
        self.server_thread.join()

class Event:
    def __init__(self, application, path, type_name, data):
        self.application = application
        self.path = path
        self.type_name = type_name
        self.data = data

class Source:
    def __init__(self, application, path, type_name):
        self.application = application
        self.application.add_source(self)
        self.path = self.application.name + "." + path
        self.type_name = type_name
        self.application.send({'commType': 'SourceAnnouncement', 'path': self.path, 'typeName': self.type_name})
    
    def notify(self, data):
        self.application.send({'commType': 'EventAnnouncement', 'path': self.path, 'typeName': self.type_name, 'data': data})

#http://127.0.0.1:54921/?type=SinkAnnouncement&application=foobar&path=foobarqux&typeName=color
class Sink:
    def __init__(self, application, path, type_name):
        self.path = application.name + "." + path
        self.application = application
        self.application.add_sink(self)
        self.type_name = type_name
        self.application.send({'commType': 'SinkAnnouncement', 'path': self.path, 'typeName': self.type_name})
        self.callbacks = []
    
    def on_notify(self, callback):
        self.callbacks.append(callback)
    
    def notify(self, event):
        for callback in self.callbacks:
            callback(event.data)
