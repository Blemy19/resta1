"""Genera una textura de niebla/nubes sin servicios externos; ejecutar con Python, Pillow y NumPy."""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT=Path(__file__).resolve().parent
out=ROOT/'assets'/'clouds'/'nubes_fundido.webp'
W,H=1280,720
rng=np.random.default_rng(14687)
acc=np.zeros((H,W),dtype=np.float32)
for sw,sh,weight in [(7,4,0.42),(15,8,0.24),(35,20,0.17),(75,43,0.12),(155,88,0.05)]:
    noise=(rng.random((sh,sw),dtype=np.float32)*255).astype(np.uint8)
    big=np.asarray(Image.fromarray(noise,mode='L').resize((W,H),Image.Resampling.BICUBIC),dtype=np.float32)/255
    acc+=big*weight
acc=(acc-acc.mean())/(acc.std()+1e-4)
y,x=np.mgrid[0:H,0:W]
# Irregular bands create cloud banks instead of uniform grain.
shape=(np.sin(y/H*5.9+x/W*1.3) + 0.5*np.sin(x/W*8.1-y/H*3.3))*0.22
f=acc*0.65+shape
# Nubes blancos con sombras azuladas al fondo, sin perder la cobertura del vídeo.
shadow=np.clip((f+.13)/1.7,0,1)
shadow=shadow*shadow*(3-2*shadow)
base=np.stack([
    213+39*shadow,
    222+31*shadow,
    225+28*shadow
],axis=-1)
# An illumination window for a warm ending.
glow=np.exp(-((x-W*.58)/(W*.46))**2-((y-H*.42)/(H*.65))**2)
base[:,:,0]+=4.5*glow
base[:,:,1]+=2.3*glow
base[:,:,2]-=1.5*glow
img=Image.fromarray(np.clip(base,0,255).astype(np.uint8),'RGB').filter(ImageFilter.GaussianBlur(2.0))
out.parent.mkdir(parents=True,exist_ok=True)
img.save(out,'WEBP',quality=88,method=6)
print(f'Creado {out} ({out.stat().st_size:,} bytes)')
