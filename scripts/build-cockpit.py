"""Original Luffor wheelhouse. Run with Blender --background --python this-file.

Coordinates in helpers use Three.js conventions: x right, y up, z toward viewer.
The saved Blender source and GLB are reproducible; no external assets are used.
"""
import bpy, bmesh, math, random, os, json
from mathutils import Vector, Matrix

random.seed(42)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'dist', 'assets')
SOURCE = os.path.join(ROOT, 'artwork')
os.makedirs(SOURCE, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.context.preferences.filepaths.save_version=0

def v(p): return Vector((p[0], -p[2], p[1]))
def mat(name, color, metal=0, rough=.6, emission=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value=(*color,1)
    bs.inputs['Metallic'].default_value=metal; bs.inputs['Roughness'].default_value=rough
    if emission:
        bs.inputs['Emission Color'].default_value=(*color,1)
        bs.inputs['Emission Strength'].default_value=emission
    return m

navy=mat('Cabin | sea-glass enamel',(.039,.046,.048),.12,.78)
trim=mat('Frames | painted teal',(.024,.026,.029),.20,.72)
wood=mat('Timber | oiled teak',(.34,.22,.11),0,.72)
woodlight=mat('Timber | honey oak',(.27,.15,.078),0,.72)
floor=mat('Deck | sun-warmed teak',(.12,.092,.069),0,.86)
brass=mat('Hardware | brushed brass',(.43,.32,.17),.50,.52)
plaster=mat('Interior | warm ivory',(.17,.155,.14),0,.92)
coral=mat('Objects | burnt terracotta',(.58,.23,.13),0,.90)
leaves=mat('Plants | olive green',(.12,.26,.10),0,.95)
leaflight=mat('Plants | fresh green',(.25,.39,.15),0,.95)
canvasmat=mat('Rugs | woven sand',(.54,.44,.30),0,1)
cork=mat('Objects | cork',(.37,.23,.12),0,1)
black=mat('Instruments | charcoal',(.012,.019,.022),.15,.55)
ivory=mat('Lettering | warm ivory',(.72,.70,.56),0,.7)
paper=mat('Chart | parchment',(.47,.45,.33),0,.93)
ink=mat('Chart | ink',(.055,.11,.12),0,.9)
green=mat('Phosphor | sea glass',(.78,.19,.035),0,.4,1.5)
amber=mat('Lamps | warm amber',(.96,.64,.28),0,.3,2.8)
red=mat('Indicator | red',(.49,.08,.035),.1,.4,1)
stone=mat('Lighthouse | chalk',(.71,.70,.60),0,.87)
rock=mat('Coast | slate',(.045,.062,.069),0,.94)
stripe=mat('Lighthouse | navy stripe',(.025,.06,.078),.1,.7)

# Author a small deterministic timber texture, embedded in the GLB.
image=bpy.data.images.new('Luffor original teak grain',width=256,height=256)
pixels=[]
for iy in range(256):
    for ix in range(256):
        grain=math.sin(ix*.55+math.sin(iy*.025)*2.3)*.016+random.uniform(-.012,.012)
        seam=-.025 if ix%64<2 else 0
        pixels.extend((.38+grain+seam,.25+grain*.65+seam,.13+grain*.4+seam,1))
image.pixels=pixels; image.pack()
tex=wood.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image
wood.node_tree.links.new(tex.outputs['Color'],wood.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])

def finish(o,name,m,bevel=0):
    o.name=name
    if m:o.data.materials.append(m)
    if bevel>=.008:
        mod=o.modifiers.new('Crafted edges','BEVEL');mod.width=bevel;mod.segments=2
        o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o
def box(name,p,s,m,bevel=.02):
    bpy.ops.mesh.primitive_cube_add(size=1,location=v(p));o=bpy.context.object
    o.dimensions=(s[0],s[2],s[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,m,bevel)
def cyl(name,p,r,depth,m,vertices=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=v(p))
    return finish(bpy.context.object,name,m,0 if r<.06 else .009)
def ring(name,p,r,t,m,vertical=False):
    bpy.ops.mesh.primitive_torus_add(major_radius=r,minor_radius=t,major_segments=48,minor_segments=8,location=v(p))
    o=bpy.context.object
    if vertical:o.rotation_euler.x=math.pi/2
    return finish(o,name,m)
def rod(name,a,b,r,m):
    mid=(Vector(a)+Vector(b))/2;o=cyl(name,mid,r,(v(b)-v(a)).length,m,12)
    o.rotation_euler=(v(b)-v(a)).to_track_quat('Z','Y').to_euler();return o
def text(name,words,p,size,m,flat=False):
    c=bpy.data.curves.new(name,'FONT');c.body=words;c.size=size;c.extrude=.0006
    c.align_x='CENTER';o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o)
    o.location=v(p)
    if not flat:o.rotation_euler.x=math.pi/2
    c.materials.append(m);return o
def light(name,kind,p,color,power,size=1,target=None):
    data=bpy.data.lights.new(name,kind);data.color=color;data.energy=power
    if kind=='AREA':data.shape='DISK';data.size=size
    if kind=='POINT':data.shadow_soft_size=size
    ob=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(ob);ob.location=v(p)
    if target:ob.rotation_euler=(v(target)-ob.location).to_track_quat('-Z','Y').to_euler()
    return ob

def outline_solid(name,outline,y,height,m,bevel=.025):
    n=len(outline);verts=[v((x,y,z)) for x,z in outline]+[v((x,y+height,z)) for x,z in outline]
    faces=[tuple(reversed(range(n))),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(mesh);bm.free()
    uv=mesh.uv_layers.new(name='Planar')
    for poly in mesh.polygons:
        for li in poly.loop_indices:
            co=mesh.vertices[mesh.loops[li].vertex_index].co;uv.data[li].uv=(co.x*.16,co.y*.16)
    ob=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(ob);return finish(ob,name,m,bevel)

def ribbon(name,points,width,y,height,m):
    # A rounded band in plan, used for benches and the bow-shaped mezzanine.
    outer=[];inner=[]
    for i,p in enumerate(points):
        prev=Vector(points[max(0,i-1)]);nxt=Vector(points[min(len(points)-1,i+1)]);t=(nxt-prev).normalized();normal=Vector((-t.y,t.x))
        outer.append((p[0]+normal.x*width/2,p[1]+normal.y*width/2));inner.append((p[0]-normal.x*width/2,p[1]-normal.y*width/2))
    return outline_solid(name,outer+list(reversed(inner)),y,height,m,.03)

def along(name,a,b,y,height,depth,m):
    ob=box(name,((a[0]+b[0])/2,y,(a[1]+b[1])/2),((Vector(b)-Vector(a)).length,height,depth),m,.025)
    ob.rotation_euler.z=math.atan2(-(b[1]-a[1]),b[0]-a[0]);return ob

def vaulted_roof(name,z0,z1,base,rise,m):
    for i in range(24):
        x0=-8.6+i*17.2/24;x1=-8.6+(i+1)*17.2/24
        y0=base+rise*math.cos(x0/8.6*math.pi/2);y1=base+rise*math.cos(x1/8.6*math.pi/2)
        mesh=bpy.data.meshes.new(name);mesh.from_pydata([v((x0,y0,z0)),v((x1,y1,z0)),v((x1,y1,z1)),v((x0,y0,z1))],[],[(0,1,2,3)]);mesh.update()
        ob=bpy.data.objects.new(name+' panel',mesh);bpy.context.collection.objects.link(ob);ob.data.materials.append(m)
        mod=ob.modifiers.new('Ceiling shell','SOLIDIFY');mod.thickness=.10
    for z in [z0+.15,(z0+z1)/2,z1-.15]:
        for i in range(20):
            xa=-8.6+i*.86;xb=xa+.86
            rod(name+' curved rib',(xa,base+rise*math.cos(xa/8.6*math.pi/2)-.06,z),(xb,base+rise*math.cos(xb/8.6*math.pi/2)-.06,z),.045,woodlight)

# The shell follows a ship's bow: angled glazing, clipped corners, and a teak deck.
bow=[(-8.55,.8),(-5.3,-3.4),(-1.8,-4.6),(1.8,-4.6),(5.3,-3.4),(8.55,.8)]
hull=bow+[(8.55,13.2),(8.3,15.8),(7.4,17.4),(-7.4,17.4),(-8.3,15.8),(-8.55,13.2)]
outline_solid('Shaped teak deck',hull,-.12,.12,floor,.04)
# Thin seams describe planking without hundreds of beveled screws and cubes.
for i in range(42):
    x=-8.3+i*.4
    cuts=[]
    for aa,bb in zip(hull,hull[1:]+hull[:1]):
        if aa[0]!=bb[0] and min(aa[0],bb[0])<=x<=max(aa[0],bb[0]):cuts.append(aa[1]+(bb[1]-aa[1])*(x-aa[0])/(bb[0]-aa[0]))
    za=min(cuts)+.04;zb=max(cuts)-.04
    box('Teak plank seam',(x,.002,(za+zb)/2),(.009,.003,zb-za),wood,.001)
for aa,bb in zip(bow,bow[1:]):
    along('Angled bow panelling',aa,bb,.78,1.56,.20,wood)
    along('Bow window sill',aa,bb,1.62,.15,.34,woodlight)
    along('Bow window header',aa,bb,4.20,.18,.24,woodlight)
for x,z in bow:
    box('Bow window mullion',(x,2.93,z),(.13,2.6,.17),trim,.025)
for sign in [-1,1]:
    points=[(sign*8.55,.8),(sign*8.55,5),(sign*8.55,9),(sign*8.55,13.2),(sign*8.3,15.8),(sign*7.4,17.4)]
    for aa,bb in zip(points,points[1:]):
        along('Hull built-in panelling',aa,bb,.75,1.5,.18,navy)
        along('Hull window ledge',aa,bb,1.62,.14,.32,woodlight)
    for x,z in points:
        height=4.25 if z<5 else 7.65
        box('Hull glazing post',(x,height/2,z),(.14,height,.17),plaster,.025)
vaulted_roof('Bridge canopy',-4.65,4.8,4.30,.85,plaster)
for x in [-7.9,7.9]:box('Bridge cove lighting',(x,4.35,.25),(.055,.035,8.9),amber,.002)

# Close the curved head of each window against the vaulted ceiling.
for aa,bb in zip(bow,bow[1:]):
    x0,z0=aa;x1,z1=bb
    crown=lambda x:4.31+.85*math.cos(x/8.6*math.pi/2)
    corners=[v((x0,4.23,z0)),v((x1,4.23,z1)),v((x1,crown(x1),z1)),v((x0,crown(x0),z0))]
    mesh=bpy.data.meshes.new('Raked window soffit');mesh.from_pydata(corners,[],[(0,1,2,3)]);mesh.update()
    ob=bpy.data.objects.new('Raked window soffit',mesh);bpy.context.collection.objects.link(ob);mesh.materials.append(trim)
    along('Bridge brow',aa,bb,4.18,.11,.28,navy)
# Main console, edge trim, tilted instrument faces and electrical switches.
box('Helm console pedestal',(-.5,.63,-1.65),(3.7,1.25,1.4),navy,.06)
box('Helm console timber rim',(-.5,1.30,-1.65),(3.94,.17,1.64),wood,.045)
box('Helm console top',(-.5,1.40,-1.65),(3.65,.06,1.36),black)
box('Instrument binnacle',(.35,1.68,-2.0),(1.65,.65,.32),navy,.05)
box('Radar bezel',(.35,1.72,-1.81),(1.35,.51,.035),trim,.025)
box('RadarScreen',(.35,1.72,-1.785),(1.12,.40,.012),black,.008)
text('Radar label','LUFFOR / NAVIGATION',(.35,2.08,-1.8),.065,ivory)
for x in [-1.7,-1.18]:
    o=cyl('Gauge brass rim',(x,1.7,-1.87),.21,.07,brass);o.rotation_euler.x=math.pi/2
    o=cyl('Gauge face',(x,1.7,-1.82),.18,.035,black);o.rotation_euler.x=math.pi/2
    for k in range(12):
        a=k*math.tau/12
        rod('Gauge tick',(x+math.sin(a)*.135,1.7+math.cos(a)*.135,-1.796),(x+math.sin(a)*.16,1.7+math.cos(a)*.16,-1.796),.006,ivory)
    rod('Gauge needle',(x,1.7,-1.787),(x-.08,1.8,-1.787),.009,ivory)
for i in range(8):
    x=-1.9+i*.41
    cyl('Console toggle base',(x,1.45,-1.16),.055,.025,brass,16)
    rod('Console toggle',(x,1.46,-1.16),(x,1.54,-1.13),.014,ivory)
    cyl('Console indicator',(x,1.445,-1.36),.025,.015,green if i%3 else amber,12)
text('Console plate','LUFFOR  /  FIND YOUR HEADING',(-.5,1.07,-.93),.078,ivory)

# Eight-spoke wooden helm in the near foreground.
box('Wheel stand',(-1.48,.79,-.12),(.44,1.55,.42),navy,.035)
wheel=(-1.48,1.62,.17)
ring('Helm outer teak',wheel,.60,.047,woodlight,True)
ring('Helm inner brass',(-1.48,1.62,.18),.51,.012,brass,True)
for i in range(8):
    a=i*math.tau/8
    rod('Helm spoke',wheel,(-1.48+math.sin(a)*.73,1.62+math.cos(a)*.73,.17),.026,woodlight)
    rod('Helm handle',(-1.48+math.sin(a)*.59,1.62+math.cos(a)*.59,.17),(-1.48+math.sin(a)*.75,1.62+math.cos(a)*.75,.17),.038,wood)
o=cyl('Helm brass hub',(-1.48,1.62,.20),.13,.16,brass);o.rotation_euler.x=math.pi/2
o=cyl('Helm hub cap',(-1.48,1.62,.29),.07,.02,black);o.rotation_euler.x=math.pi/2

# Port chart table, real linework, lamp, dividers and small personal objects.
box('Chart cabinet',(-3.58,.56,-.05),(2.13,1.10,2.5),wood,.04)
box('Chart table edge',(-3.58,1.15,-.05),(2.35,.14,2.65),woodlight,.035)
box('Chart surface',(-3.58,1.229,-.05),(1.90,.015,2.12),paper,.002)
for i in range(9):
    x=-4.43+i*.21;rod('Chart longitude',(x,1.243,-1.02),(x,1.243,.91),.0025,ink)
for i in range(11):
    z=-1.02+i*.193;rod('Chart latitude',(-4.43,1.244,z),(-2.73,1.244,z),.0025,ink)
# An invented coastal outline, rendered as fine physical ink lines.
coast=[]
for i in range(50):
    z=-.95+i*.036; x=-3.85+math.sin(i*.23)*.16+math.sin(i*.77)*.045;coast.append((x,1.25,z))
for a,b in zip(coast,coast[1:]):rod('Chart coast',a,b,.008,ink)
for x,z in [(-3.25,-.5),(-3.1,.13),(-3.55,.6)]:
    ring('Chart course mark',(x,1.25,z),.065,.003,ink)
rod('Chart plotted course',(-3.25,1.25,-.5),(-3.1,1.25,.13),.004,red)
rod('Chart plotted course',(-3.1,1.25,.13),(-3.55,1.25,.6),.004,red)
text('Chart title','A CLEAR DIRECTION',(-3.55,1.255,.77),.085,ink,True)
for y in [.36,.76]:
    box('Chart cabinet drawer',(-3.58,y,1.215),(1.92,.32,.035),wood)
    box('Drawer brass pull',(-3.58,y,1.26),(.28,.035,.045),brass,.008)
cyl('Chart lamp foot',(-4.38,1.27,-.95),.13,.06,brass)
rod('Chart lamp stem',(-4.38,1.3,-.95),(-4.38,1.98,-.95),.025,brass)
rod('Chart lamp arm',(-4.38,1.98,-.95),(-3.9,1.98,-.95),.023,brass)
bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=.23,radius2=.08,depth=.20,location=v((-3.9,1.89,-.95)))
finish(bpy.context.object,'Chart lamp shade',navy)
cyl('Chart lamp diffuser',(-3.9,1.79,-.95),.19,.015,amber)
light('Chart pool','POINT',(-3.9,1.68,-.95),(1,.72,.4),35,.15)
cyl('Coffee cup',(-2.82,1.38,.9),.09,.26,ivory)
cyl('Coffee surface',(-2.82,1.514,.9),.074,.008,black)
ring('Cup handle',(-2.70,1.40,.9),.065,.016,ivory,True)

# Starboard radio station.
box('Radio cabinet',(3.55,.56,.02),(2.18,1.12,1.9),wood,.04)
box('Radio desktop',(3.55,1.18,.02),(2.35,.14,2.10),woodlight,.035)
box('Radio casing',(3.45,1.57,-.34),(1.48,.60,.55),navy,.055)
box('Radio face',(3.45,1.57,-.045),(1.30,.47,.025),black)
box('RadioScreen',(3.25,1.66,-.024),(.60,.15,.01),green,.008)
text('Radio frequency','CH 16  /  STANDBY',(3.25,1.65,-.012),.047,black)
for x in [3.75,3.99]:
    o=cyl('Radio dial',(x,1.61,.02),.085,.10,brass,24);o.rotation_euler.x=math.pi/2
for i in range(7):box('Radio speaker slit',(3.15,1.40+i*.023,-.025),(.47,.008,.018),navy,.002)
text('Radio legend','MARINE VHF  /  LUFFOR',(3.48,1.83,-.04),.045,ivory)
box('Radio handset',(4.30,1.52,-.02),(.20,.52,.18),black,.05)
for i in range(22):
    z=.05+i*.016;x=4.26+math.sin(i*1.8)*.035
    if i:rod('Handset spiral',(px,1.27,pz),(x,1.27,z),.009,black)
    px,pz=x,z
box('Radio brass plate',(3.55,.88,1.0),(1.15,.19,.016),brass,.012)
text('Radio plaque','GOOD THINGS START WITH A SIGNAL',(3.55,.86,1.016),.047,black)
# Barometer mounted on the left front frame.
o=cyl('Barometer',(-4.5,2.30,-4.28),.24,.08,brass);o.rotation_euler.x=math.pi/2
o=cyl('Barometer face',(-4.5,2.30,-4.22),.205,.025,ivory);o.rotation_euler.x=math.pi/2
rod('Barometer needle',(-4.5,2.30,-4.19),(-4.39,2.39,-4.19),.009,black)
for ob in bpy.context.scene.objects:
    if ob.name.startswith('Barometer'):ob.location+=v((-.8,0,.9))
box('Clock timber mount',(-5.3,2.30,-3.45),(.48,.55,.07),woodlight,.06)
text('Builder plate','L U F F O R',(0,4.21,-4.32),.12,ivory)

# A curved gallery wraps the atrium, rather than a rectangular balcony slab.
sage=mat('Upholstery | sea green',(.20,.34,.29),0,.90)
linen=mat('Upholstery | linen',(.66,.61,.48),0,.96)
screen=mat('Displays | soft teal',(.08,.20,.20),0,.65,.35)
vaulted_roof('Studio barrel vault',4.8,17.4,7.35,.85,plaster)
for x in [-7.6,-4,0,4,7.6]:
    box('Clerestory frame',(x,6.15,4.85),(.10,3.2,.14),woodlight,.015)
for z in [7.0,11.5,16.4]:
    for x in [-8.45,8.45]:box('Rounded studio column',(x,3.75,z),(.17,7.5,.17),plaster,.075)
back=[(8.55,13.2),(8.3,15.8),(7.4,17.4),(-7.4,17.4),(-8.3,15.8),(-8.55,13.2)]
for aa,bb in zip(back,back[1:]):along('Warm aft lining',aa,bb,3.9,7.8,.18,plaster)
front=[(-8.4+i*16.8/30,11.2+1.6*(1-((-8.4+i*16.8/30)/8.5)**2)) for i in range(31)]
upper_outline=front+[(8.4,15.6),(7.4,17.3),(-7.4,17.3),(-8.4,15.6)]
outline_solid('Curved mezzanine',upper_outline,3.46,.18,wood)
ribbon('Rounded mezzanine fascia',front,.14,3.29,.24,woodlight)
outline_solid('Mezzanine stair landing',[(-6.7,10.8),(-4.05,10.8),(-4.05,13.2),(-6.7,13.2)],3.46,.18,wood)
outline_solid('Studio upper passage',[(-8.45,4.9),(-6.6,4.9),(-6.6,11.6),(-8.45,12.2)],3.46,.18,wood)
def railing(name,a,b,height=1.05):
    rod(name+' cap',(a[0],a[1]+height,a[2]),(b[0],b[1]+height,b[2]),.035,woodlight)
    rod(name+' middle',(a[0],a[1]+.47,a[2]),(b[0],b[1]+.47,b[2]),.012,trim)
    count=max(2,int((Vector(b)-Vector(a)).length/.8))
    for i in range(count+1):
        pp=Vector(a).lerp(Vector(b),i/count);rod(name+' upright',pp,(pp.x,pp.y+height,pp.z),.016,trim)
for aa,bb in zip(front,front[1:]):
    if -6.8<(aa[0]+bb[0])/2<-4.0:continue
    railing('Curved gallery rail',(aa[0],3.65,aa[1]),(bb[0],3.65,bb[1]))
railing('Upper passage rail',(-6.58,3.65,5.0),(-6.58,3.65,10.6))

# Stair rises toward the aft landing, with a genuine gap in the upper balustrade.
for i in range(18):
    y=(i+1)*.20;z=4.85+i*.36
    box('Stair tread %02d'%i,(5.45,y-.045,z),(2.05,.09,.39),woodlight,.01)
    box('Stair riser %02d'%i,(5.45,y-.145,z+.15),(2.0,.20,.035),navy,.004)
for x in [4.38,6.52]:
    rod('Stair stringer',(x,.05,4.6),(x,3.55,11.15),.075,trim)
    rod('Stair handrail',(x,1.05,4.6),(x,4.65,11.25),.033,brass)
    for i in range(0,18,3):
        z=4.85+i*.36;y=(i+1)*.2
        rod('Stair baluster',(x,y,z),(x,y+1,z),.024,trim)
# Lounge below the mezzanine, warm sconces, working desks and a code wall.
for index,x in enumerate([-5.6,-2.5]):
    lounge_before=set(bpy.context.scene.objects)
    box('Lounge sofa base',(x,.34,13.0),(2.4,.42,1.0),sage,.06)
    box('Lounge sofa back',(x,.84,13.48),(2.4,.75,.22),sage,.055)
    for dx in [-1.12,1.12]:box('Lounge sofa arm',(x+dx,.61,13),(.20,.55,1.05),wood,.025)
    for dx in [-.55,.55]:box('Lounge cushion',(x+dx,.59,12.92),(1.05,.14,.81),linen,.035)
    bpy.context.view_layer.update();pivot=v((x,0,13));rotation=Matrix.Translation(pivot)@Matrix.Rotation(.20 if index==0 else -.18,4,'Z')@Matrix.Translation(-pivot)
    for ob in set(bpy.context.scene.objects)-lounge_before:ob.matrix_world=rotation@ob.matrix_world
box('Lounge coffee table',(-4.05,.57,10.9),(2.4,.10,1.0),woodlight,.04)
for x in [-4.95,-3.15]:box('Coffee table leg',(x,.27,10.9),(.09,.55,.65),trim)
box('Studio pinboard',(-3.8,2.16,17.20),(4.2,1.5,.06),cork,.04)
for j,x in enumerate([-5.15,-4.25,-3.35,-2.45]):
    box('Pinned project sheet',(x,2.18,17.14),(.70,.95,.018),paper,.002)
    cyl_ob=cyl('Board pin',(x,2.59,17.12),.018,.025,coral,10);cyl_ob.rotation_euler.x=math.pi/2
    for k in range(4):box('Paper layout line',(x-.10+(k%2)*.03,2.39-k*.13,17.12),(.33+(k%2)*.10,.018,.006),ink,.001)
text('Aft room title','THE CREW / DIGITAL AT SEA',(-3.8,3.18,17.15),.13,ivory)
for x,y,z in [(-7.9,2.6,8.7),(7.9,2.6,8.7),(-5.2,6.5,16.9),(5.2,6.5,16.9)]:
    box('Bulkhead lamp',(x,y,z),(.30,.40,.12),brass,.02)
    box('Bulkhead diffuser',(x,y,z-.08),(.21,.28,.02),amber,.015)
    light('render_Atrium sconce','POINT',(x,y,z-.3),(1,.72,.43),60,.20)
# A laptop workbench on each level.
def laptop(name,p):
    x,y,z=p
    box(name+' base',(x,y,z),(.60,.035,.42),trim,.012)
    box(name+' lid',(x,y+.22,z+.18),(.60,.42,.035),black,.012)
    box(name+' display',(x,y+.22,z+.156),(.53,.34,.008),screen,.005)
    for i in range(5):box(name+' source code',(x-.17+(i%2)*.05,y+.33-i*.048,z+.148),(.21+(i%3)*.04,.008,.005),ivory,.001)
for label,x,y,z in [('Lower',2.5,.95,15.2),('Upper',-.5,4.58,14.8)]:
    box(label+' developer desk',(x,y,z),(2.4,.10,1.0),woodlight,.025)
    for dx in [-.95,.95]:box(label+' desk leg',(x+dx,y-.47,z),(.10,.94,.75),trim)
    laptop(label+' laptop',(x,y+.065,z-.02))
    text(label+' desk plate','DESIGN / CODE / CREATE',(x,y-.25,z-.52),.075,ivory)
text('Upper deck sign','UPPER DECK',(7.55,4.9,16.9),.22,ivory)

# Occupied, rounded furniture clusters leave a clear central walking route.
def oval(name,p,rx,rz,height,m):
    x,y,z=p;return outline_solid(name,[(x+rx*math.cos(i*math.tau/40),z+rz*math.sin(i*math.tau/40)) for i in range(40)],y,height,m,.025)
def plant(name,p,scale=1):
    x,y,z=p;cyl(name+' terracotta pot',(x,y+.17*scale,z),.19*scale,.34*scale,coral,20)
    cyl(name+' soil',(x,y+.345*scale,z),.16*scale,.014*scale,cork,20)
    for i in range(9):
        a=i*2.399;h=(.48+(i%4)*.13)*scale;r=(.20+(i%3)*.06)*scale
        tip=(x+math.cos(a)*r,y+.34*scale+h,z+math.sin(a)*r)
        rod(name+' stem',(x,y+.32*scale,z),tip,.009*scale,leaves)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=v((tip[0]+math.cos(a)*.08*scale,tip[1]-.04*scale,tip[2]+math.sin(a)*.08*scale)))
        leaf=finish(bpy.context.object,name+' leaf',leaflight if i%3 else leaves);leaf.scale=(.12*scale,.23*scale,.045*scale);leaf.rotation_euler=(v(tip)-v((x,y+.32*scale,z))).to_track_quat('Y','Z').to_euler()
def mug(name,p,color=ivory):
    x,y,z=p;cyl(name,(x,y+.10,z),.075,.20,color,20);cyl(name+' coffee',(x,y+.205,z),.060,.006,wood,16);ring(name+' handle',(x+.09,y+.11,z),.045,.012,color,True)
def books(name,p,count=5):
    x,y,z=p
    for i in range(count):
        height=random.uniform(.18,.34);color=[navy,paper,coral,sage,woodlight][i%5]
        box(name+' cover',(x+i*.085,y+height/2,z),(.07,height,.21),color,.009)
        box(name+' spine rule',(x+i*.085,y+height*.73,z-.108),(.043,.008,.005),ivory,.001)
def chair(name,p,angle=0):
    before=set(bpy.context.scene.objects);x,y,z=p
    oval(name+' upholstered seat',(x,y+.46,z),.28,.25,.10,sage)
    box(name+' curved back',(x,y+.83,z+.22),(.50,.58,.10),woodlight,.045)
    box(name+' back cushion',(x,y+.82,z+.155),(.42,.43,.07),linen,.03)
    for dx in [-.20,.20]:
        for dz in [-.17,.17]:rod(name+' leg',(x+dx,y+.46,z+dz),(x+dx*1.15,y+.02,z+dz*1.25),.023,woodlight)
    bpy.context.view_layer.update();pivot=v(p);rotation=Matrix.Translation(pivot)@Matrix.Rotation(angle,4,'Z')@Matrix.Translation(-pivot)
    for ob in set(bpy.context.scene.objects)-before:ob.matrix_world=rotation@ob.matrix_world

oval('Collaboration rug',(3.0,.008,5.8),2.5,1.75,.008,canvasmat)
oval('Oval collaboration island',(3.0,.94,5.8),1.70,.88,.12,woodlight)
for x in [1.95,4.05]:cyl('Island pedestal',(x,.47,5.8),.12,.94,navy,20)
laptop('Collaboration laptop',(2.6,1.075,5.65));mug('Island coffee',(3.5,1.07,6.0))
box('Open sketchbook',(3.3,1.077,5.48),(.40,.018,.31),paper,.002)
for i in range(4):box('Sketchbook notes',(3.3,1.09,5.38+i*.065),(.26,.002,.005),ink,.001)
rod('Pencil',(3.51,1.09,5.32),(3.61,1.09,5.59),.007,coral)
chair('Island chair A',(3.0,0,7.22),0);chair('Island chair B',(3.5,0,4.33),math.pi)
plant('Island greenery',(4.1,1.07,5.75),.48)
# Built-in starboard seating bends around the hull rather than forming another box.
arc=[(5.3+2.05*math.cos(-1.1+i*2.0/24),2.35+2.05*math.sin(-1.1+i*2.0/24)) for i in range(25)]
ribbon('Curved banquette timber',arc,.85,.16,.32,wood)
ribbon('Curved banquette cushion',arc,.71,.49,.13,sage)
backarc=[(5.3+2.44*math.cos(-1.1+i*2.0/24),2.35+2.44*math.sin(-1.1+i*2.0/24)) for i in range(25)]
ribbon('Curved banquette back',backarc,.16,.48,.72,linen)
oval('Banquette round table',(5.4,.62,2.4),.64,.64,.08,woodlight);cyl('Banquette pedestal',(5.4,.31,2.4),.10,.62,brass,20)
mug('Window coffee',(5.5,.71,2.45),coral);books('Window reading',(5.0,.71,2.2),3)
plant('Bridge palm',(7.7,0,4.0),1.55)
plant('Stair landing plant',(-7.75,3.64,11.9),1.35)
plant('Lounge fern',(-7.9,0,10.9),1.1)
oval('Lounge woven rug',(-4.0,.008,11.8),2.6,1.65,.008,canvasmat)
mug('Lounge cup',(-4.55,.63,10.85),coral)
box('Lounge journal',(-3.6,.64,10.95),(.42,.025,.28),paper,.005)
# Low storage and shelves occupy the long starboard wall, away from the walkway.
box('Studio sideboard',(7.55,.57,9.2),(1.45,1.10,3.65),wood,.06)
for z in [8.15,9.2,10.25]:
    box('Sideboard door',(6.805,.57,z),(.035,.91,.96),navy,.025)
    rod('Door pull',(6.77,.56,z-.1),(6.77,.56,z+.1),.016,brass)
for y in [1.95,2.75]:box('Floating book shelf',(7.5,y,9.2),(1.5,.08,3.8),woodlight,.02)
books('Shelf books',(7.0,2.0,8.5),7);books('Upper shelf books',(7.0,2.80,9.7),6)
plant('Shelf trailing plant',(7.15,2.8,8.2),.62)
plant('Sideboard plant',(7.0,1.14,10.35),.72)
for label,x,y,z in [('Lower',2.5,1.015,15.2),('Upper',-.5,4.645,14.8)]:
    mug(label+' developer cup',(x+.77,y,z),coral)
    box(label+' notebook',(x-.70,y+.01,z),(.32,.02,.25),paper,.004)
    plant(label+' desk plant',(x+.95,y,z+.22),.40)

# The equipment follows the glass, with a continuous cantilevered watch desk.
inner=[(x*.90,z+.35) for x,z in bow]
ribbon('Watch desk | folded enamel fascia',inner,.86,1.16,.32,navy)
ribbon('Watch desk | walnut counter',inner,.94,1.48,.066,wood)
for j in [-2,0,2]:
    xx=j*1.55;zz=-3.66+abs(j)*.27
    box('Watch hood',(xx,1.73,zz),(1.03,.48,.21),black,.045)
    box('Watch phosphor',(xx,1.74,zz+.11),(.91,.35,.014),ink,.012)
    for k in range(4):
        box('Channel trace',(xx-.2+.035*k,1.83-.061*k,zz+.124),(.32+.06*(k%2),.012,.012),amber if k==0 else ivory,.001)
    text('Watch channel','VHF   /   0'+str(j+3),(xx+.19,1.71,zz+.125),.061,ivory)
# Route markings and hull frames remain legible at browser scale.
for sign in [-1,1]:
    for zz in [1.8,4.15,7.15,9.8]:
        box('Riveted hull frame',(sign*8.4,2.8,zz),(.23,5.5,.13),trim,.018)
for zz in [11.7,12.65,13.6,14.55,15.5,16.45]:
    box('Archive locker', (6.98,1.13,zz),(1.45,2.18,.87),navy,.04)
    for k in range(3):
        box('Locker vent',(6.24,1.8-k*.065,zz),(.02,.018,.39),black,.001)
text('Bridge number','01   /   BRIDGE',(.85,.92,-.92),.145,ivory)
text('Chart index','LUFFOR     /     WATCH LOG',(3.06,1.10,5.85),.10,ink,True)
box('Watch handset',(-3.48,1.35,.14),(.38,.09,.12),black,.035)
for side in [-1,1]:box('Handset earpiece',(-3.48+side*.18,1.36,.14),(.104,.12,.16),trim,.03)
# A jacket spills over the side of the collaboration chair.
for j in range(6):
    box('Canvas jacket pleat',(2.8+j*.065,.85+.024*math.sin(j),7.41),(.065,.59-.04*math.cos(j),.145),canvasmat,.027)
# Hanging station identifiers, printed on both faces along the stairwell.
box('Port route board',(-6.8,2.60,6.70),(1.65,.90,.08),black,.028)
for frontface in [0,1]:
    zz=6.70+(.045 if frontface else -.045)
    for title,yy,sz,material in [('02',2.57,.51,ivory),('STUDIO   /   UP',2.28,.097,amber)]:
        label=text('Deck route',title,(-6.8,yy,zz),sz,material)
        if not frontface:label.rotation_euler.z=math.pi
for dx in [-.61,.61]:rod('Route hanger',(-6.8+dx,3.05,6.7),(-6.8+dx,3.46,6.7),.018,trim)
# Watch charts, frequency tape and the plotter on the near desk.
for j in range(3):
    sheet=box('Watch chart folio',(2.51+.15*j,1.018+.008*j,6.12),(.86,.008,.48),paper,.004);sheet.rotation_euler.z=.09*j
for j in range(8):
    rod('Depth sounding',(2.34+j*.08,1.047,6.01),(2.31+j*.08,1.047,6.24),.004,ink)
for j in range(4):
    box('Frequency preset',(3.73+j*.085,1.039,6.08),(.062,.048,.084),amber if j==0 else black,.008)
# Masthead panel on the work side of the island laptop.
text('Watch machine badge','Luffor.',(2.60,1.295,5.86),.11,ivory)
# A raked pair of displays on the aft desk, with small bezel markings.
for j in [-1,1]:
    xx=2.5+j*.55
    box('Aft monitor neck',(xx,1.19,15.46),(.08,.40,.12),trim,.012)
    before=set(bpy.context.scene.objects)
    box('Aft monitor',(xx,1.54,15.47),(.86,.48,.07),black,.018)
    box('Aft monitor glass',(xx,1.55,15.43),(.79,.40,.008),ink,.003)
    for row in range(7):
        box('Editor line',(xx-.16+.03*(row%3),1.70-row*.046,15.418),(.22+.035*(row%4),.01,.008),amber if row%3==0 else ivory,.001)
    turn=Matrix.Translation(v((xx,1.54,15.47))) @ Matrix.Rotation(j*.16,4,'Z') @ Matrix.Translation(-v((xx,1.54,15.47)))
    bpy.context.view_layer.update()
    for ob in set(bpy.context.scene.objects)-before:ob.matrix_world=turn @ ob.matrix_world
# A port-side chart archive occupies the tall solid bay behind the stair flight.
for bay in range(5):
    zz=4.95+bay*1.03
    box('Port archive backing',(-8.22,2.21,zz),(.19,4.37,1.01),wood,.018)
    box('Port archive spine',(-8.01,2.22,zz-.49),(.40,4.34,.055),trim,.009)
    for row in range(3):
        yy=1.02+row*1.07
        box('Port archive shelf',(-7.99,yy,zz),(.51,.075,.99),woodlight,.009)
        if (bay+row)%3==1:
            for book in range(4):
                box('Tide almanac',(-8.03,yy+.22,zz-.31+book*.09),(.28,.37+book*.018,.072),[black,paper,navy,coral][book],.007)
        elif (bay+row)%3==0:
            box('Tide archive case',(-8.01,yy+.20,zz),(.33,.31,.67),navy,.018)
            box('Paper index tab',(-7.83,yy+.22,zz+.14),(.013,.075,.19),paper,.001)
        if row==1:box('Shelf task light',(-7.80,yy-.048,zz),(.04,.02,.76),amber,.003)
# Structural transom under the change in deckhead height.
for i in range(16):
    x0=-8.6+i*1.075;x1=x0+1.075
    ymin=lambda x:4.3+.85*math.cos(x/8.6*math.pi/2)
    ymax=lambda x:7.35+.85*math.cos(x/8.6*math.pi/2)
    mesh=bpy.data.meshes.new('Deckhead transom')
    mesh.from_pydata([v((x0,ymin(x0),4.82)),v((x1,ymin(x1),4.82)),v((x1,ymax(x1),4.82)),v((x0,ymax(x0),4.82))],[],[(0,1,2,3)]);mesh.update()
    ob=bpy.data.objects.new('Deckhead transom',mesh);bpy.context.collection.objects.link(ob);mesh.materials.append(navy)
text('Crown lettering','Luffor.   /   Bridge studio',(0,5.82,4.85),.43,ivory)
# Three original adult low-poly developers. Keep their geometry independently
# grouped in the export so they remain editable characters rather than scenery.
skin1=mat('Crew | skin warm',(.56,.33,.21),0,.91)
skin2=mat('Crew | skin medium',(.40,.25,.18),0,.91)
hair=mat('Crew | black hair',(.002,.003,.004),0,1.0)
shirt1=mat('Crew | navy overshirt',(.022,.024,.029),0,.95)
shirt2=mat('Crew | sage shirt',(.094,.078,.067),0,.95)
shirt3=mat('Crew | ivory knit',(.33,.29,.23),0,.96)
trousers=mat('Crew | charcoal trousers',(.025,.034,.043),0,.96)
def ico(name,p,scale,m,sub=1):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=v(p))
    ob=finish(bpy.context.object,name,m);ob.scale=(scale[0],scale[2],scale[1])
    if name.endswith('head'):
        for polygon in ob.data.polygons:polygon.use_smooth=True
    return ob
def developer(number,p,gender,shirt,skin,angle=0,seated=False):
    before=set(bpy.context.scene.objects);tag='Dev%d_'%number;x,y,z=p
    def P(a,b,c):return (x+a,y+b,z+c)
    lift=-.35 if seated else 0
    def H(a,b,c):return P(a,b+lift,c)
    def garment(name, rings, material):
        verts=[]
        sides=12
        for cx,cy,cz,rx,rz in rings:
            for i in range(sides):
                ang=math.tau*i/sides
                verts.append(v(P(cx+rx*math.cos(ang),cy,cz+rz*math.sin(ang))))
        faces=[tuple(range(sides-1,-1,-1))]
        for j in range(len(rings)-1):
            for i in range(sides):
                k=(i+1)%sides
                faces.append((j*sides+i,j*sides+k,(j+1)*sides+k,(j+1)*sides+i))
        faces.append(tuple(range(len(verts)-sides,len(verts))))
        mesh=bpy.data.meshes.new(tag+name);mesh.from_pydata(verts,[],faces);mesh.update()
        obj=bpy.data.objects.new(tag+name,mesh);bpy.context.collection.objects.link(obj)
        mesh.materials.append(material)
        for f in mesh.polygons:f.use_smooth=True
    lean=-.09 if seated else -.025
    garment('folded cotton',[(0,.81+lift,.03,.205,.134),(0,.86+lift,.02,.214,.142),(0,1.04+lift,0,.187,.126),(0,1.28+lift,lean,.25,.145),(0,1.39+lift,lean,.217,.116),(0,1.44+lift,lean,.098,.085)],shirt)
    ico(tag+'hips',H(0,.83,.015),(.20,.15,.13),trousers,2)
    for side in [-1,1]:
        dx=side*.112
        knee=-.30 if seated else -.01
        hip=.55 if seated else .85
        garment('denim',[(dx,.12,knee-.035,.072,.078),(dx,.17,knee-.035,.084,.089),(dx,.39,knee,.082,.087),(dx,.48,knee,.10,.105),(dx,hip,.016,.11,.12)],trousers)
        ico(tag+'trainer',P(dx,.083,knee-.093),(.096,.083,.166),black,2)
        box(tag+'sole',P(dx,.032,knee-.093),(.17,.045,.28),trim,.018)
        shoulder=H(side*.205,1.34,lean)
        elbow=P(side*.286,.83 if seated else 1.05,-.22 if seated else -.065)
        hand=P(side*.175,1.02 if seated else 1.05,-.58 if seated else -.28)
        rod(tag+'sleeve',shoulder,elbow,.094,shirt)
        ico(tag+'shoulder',shoulder,(.096,.097,.10),shirt,2)
        ico(tag+'elbow',elbow,(.074,.075,.076),skin,2)
        rod(tag+'forearm',elbow,hand,.062,skin)
        ico(tag+'palm',hand,(.053,.044,.077),skin,2)
        ico(tag+'thumb',(hand[0]-side*.038,hand[1]+.024,hand[2]-.025),(.023,.024,.039),skin,2)
    if number==1:
        box(tag+'tablet',P(0,1.05,-.28),(.38,.028,.27),trim,.009)
        box(tag+'tablet screen',P(0,1.067,-.28),(.32,.005,.22),screen,.004)
    cyl(tag+'neck',H(0,1.47,0),.072,.18,skin,8)
    ico(tag+'head',H(0,1.61,-.058),(.132,.161,.139),skin,2)
    # Black polygonal hair cap plus a shaped fringe. Female character has a ponytail.
    ico(tag+'black hair',H(0,1.718,-.04),(.139,.095,.145),hair,2)
    box(tag+'fringe',H(-.025,1.704,-.166),(.24,.055,.045),hair,.008)
    if gender=='woman':
        for s in [-1,1]:ico(tag+'side hair',H(s*.135,1.58,.10),(.045,.24,.085),hair)
        ico(tag+'ponytail',H(.02,1.62,.19),(.075,.20,.095),hair)
    else:
        ico(tag+'hair back',H(0,1.63,.056),(.14,.13,.08),hair)
    for s in [-1,1]:
        ico(tag+'eye',H(s*.058,1.622,-.186),(.016,.014,.009),black)
        rod(tag+'eyebrow',H(s*.058-.025,1.646,-.182),H(s*.058+.025,1.646,-.182),.007,hair)
    ico(tag+'nose',H(0,1.591,-.197),(.026,.034,.033),skin)
    rod(tag+'mouth',H(-.027,1.551,-.176),H(0,1.547,-.18),.005,wood)
    rod(tag+'mouth',H(0,1.547,-.18),H(.027,1.551,-.176),.005,wood)
    # Tilt the whole face toward the display around the base of the skull.
    pivot=v(H(0,1.47,-.02))
    tilt=Matrix.Translation(pivot) @ Matrix.Rotation(-.20 if seated else -.32,4,'X') @ Matrix.Translation(-pivot)
    bpy.context.view_layer.update()
    for ob in set(bpy.context.scene.objects)-before:
        if any(ob.name.startswith(tag+k) for k in ['head','black hair','fringe','side hair','ponytail','hair back','eye','nose','mouth']):
            ob.matrix_world=tilt @ ob.matrix_world
    if seated:chair(tag+'chair',p)
    # Rotate the complete posed adult around their own vertical axis.
    root=bpy.data.objects.new(tag+gender,None);bpy.context.collection.objects.link(root);root.location=v(p)
    bpy.context.view_layer.update()
    for ob in set(bpy.context.scene.objects)-before-{root}:
        ob.parent=root;ob.matrix_parent_inverse=root.matrix_world.inverted()
    root.rotation_euler.z=angle
    return root
developer(1,(-2.65,0,2.55),'man',shirt1,skin1,-math.pi*.84)
developer(2,(2.5,0,14.58),'man',shirt2,skin2,math.pi,True)
developer(3,(-.45,3.64,14.18),'woman',shirt3,skin1,math.pi,True)
for name in ['Aft room title','Upper deck sign','Lower desk plate','Upper desk plate']:
    bpy.data.objects[name].rotation_euler.z=math.pi
for ob in bpy.context.scene.objects:
    if ob.name.startswith(('Stair ','Upper promenade','Promenade rail','Upper port rail','Upper starboard rail')):
        ob.location.x=-ob.location.x

# Bring the rooms together without lowering either deck. This transform is also
# exported for lights, picking and walking routes, so navigation stays physical.
STUDIO_X=.82;STUDIO_Z=.76
def ship_point(p):return [p[0]*STUDIO_X,p[1],p[2]*STUDIO_Z]
studio_root=bpy.data.objects.new('Studio proportions',None);bpy.context.collection.objects.link(studio_root)
for ob in list(bpy.context.scene.objects):
    if ob!=studio_root and ob.parent is None:
        ob.parent=studio_root;ob.matrix_parent_inverse=Matrix.Identity(4)
studio_root.scale=(STUDIO_X,STUDIO_Z,1)
bpy.context.view_layer.update()

# Author the camera locations in Blender; the browser uses this same layout.
views={
 'helm':dict(position=[3.45,2.13,9.5],target=[-1.45,1.98,.7],mobilePosition=[-3.7,2.16,9.9],mobileTarget=[-1.9,1.84,-.8],midPosition=[2.7,2.16,10.1],midTarget=[-1.45,1.98,.5],fov=59,mobileFov=79,midFov=65,label='Bridge / main deck'),
 'chart':dict(position=[-1.1,2.85,2.45],target=[-3.55,1.24,-.05],fov=53,label='Chart table / work'),
 'console':dict(position=[1.5,2.55,1.9],target=[-.25,1.55,-1.7],fov=52,label='Instruments / services'),
 'radio':dict(position=[1.5,2.45,2.45],target=[3.5,1.5,-.25],fov=49,label='Marine radio / contact'),
 'lighthouse':dict(position=[2.05,2.8,-2.35],target=[6.9,3,-24],fov=52,label='Lighthouse window'),
 'aft':dict(position=[.15,2.25,3.8],target=[.1,2.05,14.6],fov=64,mobileFov=76,label='Look aft / the atrium'),
 'stairs':dict(position=[-3.1,2.0,4.05],target=[-5.45,2.8,8.8],fov=61,mobileFov=72,label='Stairway / upper deck'),
 'upper':dict(position=[-2.65,5.43,16.15],target=[-.15,4.85,14.0],fov=63,mobileFov=73,label='Upper deck / developer studio'),
 'overlook':dict(position=[.0,5.4,13.45],target=[-.3,1.4,1.2],fov=65,mobileFov=76,label='Upper deck / bridge overlook'),
 'lounge':dict(position=[-3.4,2.1,16.3],target=[-6.5,1.40,14.45],fov=64,mobileFov=74,label='Crew lounge / lower deck')
}
for name,view in views.items():
    view.setdefault('mobilePosition',view['position']);view.setdefault('mobileTarget',view['target']);view.setdefault('mobileFov',view['fov']+8)
    for key in ['position','target','mobilePosition','mobileTarget','midPosition','midTarget']:
        if key not in view:continue
        if name=='lighthouse' and key in {'target','mobileTarget'}:continue
        view[key]=ship_point(view[key])
    bpy.ops.object.camera_add(location=v(view['position']));ob=bpy.context.object;ob.name='View_'+name
    ob.rotation_euler=(v(view['target'])-ob.location).to_track_quat('-Z','Y').to_euler();ob.data.sensor_fit='VERTICAL';ob.data.sensor_height=24;ob.data.lens=12/math.tan(math.radians(view['fov'])/2)
layout={'views':views,'scale':[STUDIO_X,1,STUDIO_Z],'stairPath':[ship_point(p) for p in [[-3.1,2.0,4.05],[-5.45,1.9,4.5],[-5.45,3.55,7.7],[-5.45,5.3,11.3],[-3.2,5.4,13.2]]],'intro':{'duration':2.55,'cameraOffset':ship_point([0,.08,1.2])},'crew':[{'id':1,'gender':'man','position':ship_point([-2.65,0,2.55])},{'id':2,'gender':'man','position':ship_point([2.5,0,14.58])},{'id':3,'gender':'woman','position':ship_point([-.45,3.64,14.18])}]}
with open(os.path.join(ROOT,'dist','ship-layout.js'),'w',encoding='utf8') as f:f.write('/* Authored in Blender by scripts/build-cockpit.py. */\nwindow.LUFFOR_SHIP = '+json.dumps(layout,separators=(',',':'))+';\n')

# Lighthouse beyond the right-hand window. Low-poly rocks make a coastal outcrop.
lighthouse_before=set(bpy.context.scene.objects)
for i in range(16):
    x=6.9+random.uniform(-2.4,2.4);z=-24+random.uniform(-1.5,1.5)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=v((x,-1.25,z)))
    ob=finish(bpy.context.object,'Lighthouse rock',rock);ob.scale=(random.uniform(.7,1.8),random.uniform(.8,1.5),random.uniform(.4,1.3))
for y,r,d,m in [(-.5,.68,1.0,stone),(.3,.62,.6,stripe),(1.1,.55,1.0,stone),(1.8,.50,.4,stripe),(2.3,.45,.6,stone)]:
    cyl('Lighthouse tower',(6.9,y,-24),r,d,m,32)
cyl('Lighthouse balcony',(6.9,2.65,-24),.77,.10,stone)
ring('Balcony rail',(6.9,2.96,-24),.72,.016,trim)
for i in range(12):
    a=i*math.tau/12;rod('Balcony upright',(6.9+math.cos(a)*.72,2.7,-24+math.sin(a)*.72),(6.9+math.cos(a)*.72,2.96,-24+math.sin(a)*.72),.012,trim)
cyl('Lantern base',(6.9,2.85,-24),.43,.12,trim)
cyl('Beacon core',(6.9,3.11,-24),.12,.36,amber,24)
for i in range(8):
    a=i*math.tau/8;rod('Lantern frame',(6.9+math.cos(a)*.4,2.91,-24+math.sin(a)*.4),(6.9+math.cos(a)*.4,3.40,-24+math.sin(a)*.4),.018,trim)
bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=.62,radius2=.06,depth=.37,location=v((6.9,3.56,-24)))
finish(bpy.context.object,'Lantern roof',trim)
rod('Lighthouse finial',(6.9,3.74,-24),(6.9,4.02,-24),.025,brass)
box('Lighthouse door',(6.9,-.5,-23.36),(.30,.70,.04),trim)
for y in [.55,1.8]:box('Lighthouse window',(6.9,y,-23.44),(.14,.24,.03),amber,.01)
for ob in set(bpy.context.scene.objects)-lighthouse_before:
    ob.location.z=-1.7+(ob.location.z+1.7)*1.4
    ob.scale.z*=1.4

# Blender-only lighting and sea for the source scene and fallback render.
water=mat('render_water',(.14,.34,.38),.05,.42)
box('render_Sea',(0,-1.72,-32),(250,.05,250),water,0)
sun=light('render_Sun','SUN',(-8,12,-18),(1,.87,.66),2.5,target=ship_point((0,0,4)));sun.data.angle=.12
light('render_Studio skylight','AREA',ship_point((0,7,9)),(1,.94,.82),650,7,target=ship_point((0,1,6)))
light('render_Bridge fill','AREA',ship_point((0,4,1)),(1,.91,.75),280,5,target=ship_point((0,1,-2)))
beacon=light('render_Beacon','SPOT',(6.9,5.034,-24),(1,.91,.70),1200,target=ship_point((-1,1.2,.6)))
beacon.data.spot_size=.18;beacon.data.spot_blend=.5;beacon.data.shadow_soft_size=.1
light('render_Tower fill','AREA',(10,6,-17),(.87,.91,.85),200,6,target=(6.9,1,-24))
bpy.ops.object.camera_add(location=v(views['helm']['position']))
cam=bpy.context.object;cam.name='render_Helm camera';cam.rotation_euler=(v(views['helm']['target'])-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.sensor_fit='VERTICAL';cam.data.sensor_height=24;cam.data.lens=24/(2*math.tan(math.radians(views['helm']['fov'])/2));cam.data.clip_end=250;bpy.context.scene.camera=cam
# The entrance push is authored here and exported as layout metadata for WebGL.
cam.location+=v(layout['intro']['cameraOffset'])
cam.rotation_euler=(v(views['helm']['target'])-cam.location).to_track_quat('-Z','Y').to_euler()
cam.keyframe_insert(data_path='location',frame=1);cam.keyframe_insert(data_path='rotation_euler',frame=1)
cam.location-=v(layout['intro']['cameraOffset'])
cam.rotation_euler=(v(views['helm']['target'])-cam.location).to_track_quat('-Z','Y').to_euler()
cam.keyframe_insert(data_path='location',frame=61);cam.keyframe_insert(data_path='rotation_euler',frame=61)
bpy.context.scene.frame_set(54)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24
scene.cycles.use_denoising=True;scene.render.resolution_x=1440;scene.render.resolution_y=850;scene.render.resolution_percentage=100
scene.world.use_nodes=True
scene.world.node_tree.nodes.get('Background').inputs['Color'].default_value=(.47,.65,.72,1)
scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.60
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=0
scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(ASSETS,'cockpit-poster.png')
# Editable, frame-registered intro. The same phase boundaries drive the web pass.
scene.render.fps=24;scene.frame_end=61
comp=bpy.data.node_groups.new('LUFFOR | silver to color','CompositorNodeTree')
scene.compositing_node_group=comp
comp.interface.new_socket(name='Image',in_out='OUTPUT',socket_type='NodeSocketColor')
def compositing_node(kind,label,x,y):
    n=comp.nodes.new(kind);n.label=label;n.location=(x,y);return n
layers=compositing_node('CompositorNodeRLayers','Bridge camera',0,0)
pixels=compositing_node('CompositorNodePixelate','Five pixel cells',230,80);pixels.inputs['Size'].default_value=5
comp.links.new(layers.outputs['Image'],pixels.inputs['Color'])
tones=compositing_node('ShaderNodeValToRGB','Seven silver values',480,80);tones.color_ramp.interpolation='CONSTANT'
for k in range(1,7):
    el=tones.color_ramp.elements.new(k/7);el.color=(k/7,k/7,k/7,1)
comp.links.new(pixels.outputs[0],tones.inputs[0])
edge=compositing_node('CompositorNodeFilter','Architectural edges',240,-170)
edge.inputs['Type'].default_value='Sobel';comp.links.new(layers.outputs['Image'],edge.inputs['Image'])
gray=compositing_node('ShaderNodeValToRGB','Silver edges',480,-160);comp.links.new(edge.outputs[0],gray.inputs[0])
mix=compositing_node('ShaderNodeMixRGB','Edge to silver',720,60)
comp.links.new(gray.outputs[0],mix.inputs[1]);comp.links.new(tones.outputs[0],mix.inputs[2])
color=compositing_node('ShaderNodeMixRGB','Resolve to color',940,60)
comp.links.new(mix.outputs[0],color.inputs[1]);comp.links.new(layers.outputs['Image'],color.inputs[2])
for node,keys in [(mix,[(1,0),(12,0),(35,1)]),(color,[(1,0),(32,0),(61,1)])]:
    for fr,val in keys:
        node.inputs[0].default_value=val;node.inputs[0].keyframe_insert(data_path='default_value',frame=fr)
output=compositing_node('NodeGroupOutput','Final frame',1180,60);comp.links.new(color.outputs[0],output.inputs[0])
for fr in [1,73,145,217,289]:
    beacon.rotation_euler.z+=(math.tau/4 if fr>1 else 0)
    beacon.keyframe_insert(data_path='rotation_euler',index=2,frame=fr)
scene.frame_set(61)
# A separate, deliberately simple Blender-authored blockout drives the entrance.
# It contains real spatial forms, not a processed screenshot or a dithering pass.
boot_collection=bpy.data.collections.new('INTRO / architectural blockout');scene.collection.children.link(boot_collection)
boot_material=mat('Intro | neutral',(.06,.06,.06),0,1)
boot_prefixes=('Angled bow panelling','Bow window','Hull glazing post','Bridge canopy panel','Studio barrel vault panel','Curved mezzanine','Mezzanine stair landing','Studio upper passage','Stair tread','Stair handrail','Helm console pedestal','Wheel stand','Helm outer teak','Chart cabinet','Radio cabinet','Lounge sofa base','Lounge sofa back','Upper developer desk','Oval collaboration island','Dev1_folded','Dev1_head','Dev1_denim','Dev1_tablet','Dev1_sleeve','Dev1_forearm','Watch desk','Watch hood','Bridge number','Watch handset')
for ob in list(scene.objects):
    if ob.type=='MESH' and ob.name.startswith(boot_prefixes):
        duplicate=ob.copy();duplicate.data=ob.data.copy();duplicate.name='Boot_'+ob.name
        duplicate.modifiers.clear();duplicate.data.materials.clear();duplicate.data.materials.append(boot_material)
        boot_collection.objects.link(duplicate);duplicate.hide_render=True
bpy.ops.object.select_all(action='DESELECT')
for ob in boot_collection.objects:ob.hide_viewport=False;ob.select_set(True)
bpy.context.view_layer.objects.active=next(iter(boot_collection.objects));bpy.ops.object.convert(target='MESH');bpy.ops.object.join();bpy.context.object.name='Boot_Architectural hull'
bpy.ops.export_scene.gltf(filepath=os.path.join(ASSETS,'ship-blockout.glb'),export_normals=False,export_texcoords=False,export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False)
bpy.context.object.hide_set(True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SOURCE,'luffor-wheelhouse.blend'))
# Collapse static geometry by material to keep browser draw calls low.
bpy.ops.object.select_all(action='DESELECT')
for ob in scene.objects:
    if ob.type in {'MESH','FONT'} and not ob.name.startswith(('render_','Boot_')):ob.select_set(True)
bpy.context.view_layer.objects.active=next(ob for ob in scene.objects if ob.select_get())
bpy.ops.object.convert(target='MESH')
groups={}
for ob in list(scene.objects):
    if ob.type=='MESH' and not ob.name.startswith(('render_','Boot_')) and ob.name not in {'RadarScreen','RadioScreen'}:
        key=ob.data.materials[0].name if ob.data.materials else 'Unpainted'
        if ob.name.startswith('Dev'):key=ob.name.split('_')[0]+' | '+key
        groups.setdefault(key,[]).append(ob)
for key,objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objects:ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join()
    objects[0].name='Wheelhouse_'+key.split(' | ')[0]+'_'+key.split(' | ')[-1]

# Only original model geometry is exported; the website owns its lighting and ocean.
bpy.ops.object.select_all(action='DESELECT')
for ob in scene.objects:
    if ob.type in {'MESH','FONT'} and not ob.name.startswith(('render_','Boot_')):ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(ASSETS,'luffor-wheelhouse.glb'),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_extras=False)
print('LUFFOR_MODEL_EXPORTED',flush=True)
bpy.ops.render.render(write_still=True)
print('LUFFOR_POSTER_RENDERED',flush=True)
import sys
if '--previews' in sys.argv:
    scene.render.resolution_x=1050;scene.render.resolution_y=700;scene.cycles.samples=16
    for name in ['aft','stairs','upper','overlook','lounge']:
        scene.camera=bpy.data.objects['View_'+name];scene.render.filepath=os.path.join(ROOT,'output','ship-'+name+'.png')
        bpy.ops.render.render(write_still=True)

