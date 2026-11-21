"""Render the README diagram from an argand_cli executable. Requires matplotlib."""
import argparse
import csv
import io
import subprocess
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import Circle

parser = argparse.ArgumentParser()
parser.add_argument("executable", type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]

def values(*command):
    output = subprocess.check_output([str(args.executable.resolve()), *map(str, command)], text=True)
    return [(float(r["real"]), float(r["imaginary"])) for r in csv.DictReader(io.StringIO(output))]

product, = values("multiply", 2, 1, 0, 1)
roots = values("roots", 1, 0, 5)
paper, panel, text = "#241e32", "#2b233a", "#f2eaf7"
teal, amber, lilac = "#77d8d5", "#f7c674", "#c8a9ff"
plt.rcParams.update({"font.family":"DejaVu Sans","font.size":10,"text.color":text,
                     "axes.labelcolor":text,"xtick.color":"#c9bfd1","ytick.color":"#c9bfd1"})
fig, axes = plt.subplots(1,2,figsize=(11.2,5.2))
fig.patch.set_facecolor(paper)
fig.subplots_adjust(left=.065,right=.965,bottom=.12,top=.71,wspace=.30)
fig.text(.07,.905,"Complex arithmetic in the plane",fontsize=23,weight="semibold")
fig.text(.072,.825,"A quarter turn by multiplication   ·   The five roots of unity",color="#cec0db",fontsize=12)
for ax, lim, spacing in zip(axes,[2.55,1.36],[1,.5]):
    ax.set_facecolor(panel); ax.set_aspect("equal",adjustable="box"); ax.set(xlim=(-lim,lim),ylim=(-lim,lim))
    ticks=[i*spacing for i in range(-2,3)]
    ax.set_xticks(ticks);ax.set_yticks(ticks);ax.grid(color="#51445d",alpha=.65,lw=.6)
    ax.axhline(0,color="#93849e",lw=.8);ax.axvline(0,color="#93849e",lw=.8)
    ax.add_patch(Circle((0,0),1,facecolor="none",edgecolor="#9d8ba7",lw=1,linestyle=(0,(3,4))))
    ax.set_xlabel("Real");ax.set_ylabel("Imaginary")
    for spine in ax.spines.values(): spine.set_visible(False)
a,b=axes
for point, label, color, offset in [((2,1),"z",teal,(3,9)),((0,1),"i",amber,(7,2)),(product,"iz",lilac,(-18,3))]:
    a.annotate("",xy=point,xytext=(0,0),arrowprops=dict(arrowstyle="-|>",color=color,lw=2.6,mutation_scale=16))
    a.annotate(label,point,xytext=offset,textcoords="offset points",color=color,fontsize=12)
polygon=roots+roots[:1]
b.fill(*zip(*polygon),color=lilac,alpha=.13)
b.plot(*zip(*polygon),color=lilac,lw=1.7)
b.scatter(*zip(*roots),s=32,color=lilac,zorder=3)
for k,(x,y) in enumerate(roots):
    b.annotate(f"k={k}",(x,y),xytext=(5 if x>=0 else -22,6 if y>=0 else -11),textcoords="offset points",fontsize=8.5,color=text)
fig.savefig(root/"docs/preview.png",dpi=155,facecolor=paper)
