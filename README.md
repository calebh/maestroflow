# MaestroFlow - Composing Reactive Programs

MaestroFlow is an interface for connecting programs together. It consists of a GUI display which shows sources and sinks as nodes in a directed graph, along with a set of programs that use the MaestroFlow API. At the current moment the interface is an Electron application, and the only API is for Python.

## Getting Started

To start the MaestroFlow server, go to the maestroflow/server directory and run ``npm start``.
To use the Python 3.6 API, add an entry to your ``PYTHONPATH`` to point to the folder containing the repository. The API can then be imported:

```import maestroflow.python.api as mf```

The Python APIs require the ``aiohttp`` and ``requests`` Python libraries, which can be installed with pip.

The Python API also comes with some examples which can be found in the [maestroflow/python/examples](https://github.com/calebh/maestroflow/tree/master/maestroflow/python/examples) folder.

## Gitter chat

https://gitter.im/MaestroFlow