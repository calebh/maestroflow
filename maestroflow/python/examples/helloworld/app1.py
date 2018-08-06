import maestroflow as mf
import signal
import sys

# Create a new application called app1, and use the twirl icon
app = mf.Application("app1", mf.image('../twirl-icon.png'))
# Create a source called input which broadcasts data of type text
input_source = mf.Source(app, "input", "text")

# A signal to kill the program should also kill the MaestroFlow application
def signal_handler(sig, frame):
    app.stop()
    sys.exit(0)
signal.signal(signal.SIGINT, signal_handler)

while True:
    txt = input("Enter some text to send: ")
    # Notify MaestroFlow that we got an input
    input_source.notify(txt)
    # For the MaestroFlow sinks to function, we have to occasionally call poll
    app.poll()

