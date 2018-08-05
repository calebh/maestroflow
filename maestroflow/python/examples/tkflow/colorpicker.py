import tkinter as tk
import tkinter.ttk as ttk
from tkcolorpicker import askcolor
import maestroflow.python.api as mf

# Create a new application called colorpicker, and use the twirl icon
app = mf.Application("colorpicker", mf.image('../colorpicker-icon.png'))
# Create a source called color which broadcasts data of type color
color_source = mf.Source(app, "color", "color")

root = tk.Tk()

while True:
    (rgb, hexcolor) = askcolor((255, 255, 0), root)
    color_source.notify(hexcolor)
    # For the MaestroFlow sinks to function, we have to occasionally call poll
    app.poll()
