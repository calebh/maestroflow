import maestroflow.python.api as mf
import signal

# Create a new application running on port 13377 called app1, and use the given icon
app = mf.Application(13377, "app1", mf.image('../twirl-icon.png'))
# Create a source called app1.source which broadcasts data of type text
source = mf.Source(app, "app1.source", "text")

# A signal to kill the program should also kill the MaestroFlow application
def signal_handler(sig, frame):
    app.stop()
    sys.exit(0)
signal.signal(signal.SIGINT, signal_handler)

while True:
    txt = input("Enter some text to send: ")
    # Notify MaestroFlow that we got an input
    source.notify(txt)