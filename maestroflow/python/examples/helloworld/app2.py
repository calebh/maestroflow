import maestroflow.python.api as mf
import signal
import time

# Create a new application running on port 13378 called app2, and use the unicorn icon
app = mf.Application(13378, "app2", mf.image('../unicorn-icon.png'))
# Create a sink called app2.sink which accepts events of type text
s = mf.Sink(app, "app2.sink", "text")
# Register the callback handler with the sink. In this case we directly print the data
s.on_notify(print)

# A signal to kill the program should also kill the MaestroFlow application
def signal_handler(sig, frame):
    app.stop()
    sys.exit(0)
signal.signal(signal.SIGINT, signal_handler)

while True:
    # For the MaestroFlow sinks to function, we have to occasionally call poll
    app.poll()
    time.sleep(0.01)