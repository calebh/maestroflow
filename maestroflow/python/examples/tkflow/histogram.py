import maestroflow as mf
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('TkAgg')
import time
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import sys
import tkinter as Tk

# Set up tkinter
root = Tk.Tk()
f = plt.figure()

canvas = FigureCanvasTkAgg(f, master=root)
canvas.draw()
canvas.get_tk_widget().pack(side=Tk.TOP, fill=Tk.BOTH, expand=1)
canvas._tkcanvas.pack(side=Tk.TOP, fill=Tk.BOTH, expand=1)

# This function will draw our histogram
def draw_histogram(numbers):
    plt.clf()
    plt.hist(numbers)
    plt.draw()
    canvas.draw()

app = mf.Application("histogram", mf.image('../histogram-icon.png'))
input_sink = mf.Sink(app, "input", "text")
def on_receive_input(text):
    try:
        numbers = list(map(int, text.split(",")))
        draw_histogram(numbers)
    except ValueError:
        # Ignore invalid entries
        pass
# Set up the sink callback
input_sink.on_notify(on_receive_input)

draw_histogram([])

# MaestroFlow requires a poll for receiving data into sinks
poll_interval = 100 # poll every 100 ms
def do_poll():
    app.poll()
    root.after(poll_interval, do_poll)
root.after(poll_interval, do_poll)

Tk.mainloop()
