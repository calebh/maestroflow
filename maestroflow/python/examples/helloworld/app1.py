import maestroflow.python.api as mf
import signal

app = mf.Application(13377, "app1", mf.image('../twirl-icon.png'))
source = mf.Source(app, "app1.source", "text")

def signal_handler(sig, frame):
    app.stop()
    sys.exit(0)
signal.signal(signal.SIGINT, signal_handler)

while True:
    txt = input("Enter some text to send: ")
    source.notify(txt)