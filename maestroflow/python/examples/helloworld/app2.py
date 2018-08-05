import maestroflow.python.api as mf
import signal
import time

app = mf.Application(13378, "app2", mf.image('../unicorn-icon.png'))
s = mf.Sink(app, "app2.sink", "text")
s.on_notify(print)

def signal_handler(sig, frame):
    app.stop()
    sys.exit(0)
signal.signal(signal.SIGINT, signal_handler)

while True:
    app.poll()
    time.sleep(0.01)