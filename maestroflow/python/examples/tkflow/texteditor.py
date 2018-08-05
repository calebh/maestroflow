import maestroflow.python.api as mf
from tkinter import * 
import sys

if len(sys.argv) >= 2:
    identifier = sys.argv[1]
else:
    identifier = ""
app_name = "texteditor" + identifier

# Create a new application and use the text editor icon
app = mf.Application(app_name, mf.image('../texteditor-icon.png'))
# Create a source which will broadcast the entered text
text_source = mf.Source(app, "textsource", "text")
# Create a sink which will change the text to whatever was received
text_sink = mf.Sink(app, "textsink", "text")
# Create a sink which accepts events of type color
color_sink = mf.Sink(app, "textcolor", "color")

root = Tk()
root.title(app_name)
text = Text(root)
text.grid()

def on_receive_color(color):
    text.config(fg=color)
# Register the callback handler with the sink
color_sink.on_notify(on_receive_color)

def on_receive_text(data):
    text.delete(1.0, END)
    text.insert(1.0, data)
text_sink.on_notify(on_receive_text)

prev_text = None
poll_interval = 100 # poll every 100 ms
def do_poll():
    global prev_text
    contents = text.get(1.0, END)
    if contents != prev_text:
        text_source.notify(contents)
        prev_text = contents
    app.poll()
    root.after(poll_interval, do_poll)
root.after(poll_interval, do_poll)

root.mainloop()
