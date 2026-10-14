import sys, glob, subprocess, os
from PIL import Image
pdf, outd, per = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 4
name = os.path.basename(pdf)[:-4]
for f in glob.glob(f'{outd}/{name}_pg-*.jpg') + glob.glob(f'{outd}/{name}_sheet*.jpg'): os.remove(f)
subprocess.run(['pdftoppm', '-jpeg', '-r', '68', pdf, f'{outd}/{name}_pg'], check=True)
files = sorted(glob.glob(f'{outd}/{name}_pg-*.jpg'))
for k in range(0, len(files), per):
    ims = [Image.open(f) for f in files[k:k+per]]; w, h = ims[0].size
    sh = Image.new('RGB', (w*len(ims), h), 'white')
    for i, im in enumerate(ims): sh.paste(im, (i*w, 0))
    sh.save(f'{outd}/{name}_sheet{k//per+1}.jpg', quality=85)
print(len(files), 'pages ->', (len(files)+per-1)//per, 'sheets')
