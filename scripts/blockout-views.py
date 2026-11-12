import bpy, os, math
from mathutils import Vector
scene=bpy.context.scene
def vec(p):return Vector((p[0],-p[2],p[1]))
scene.render.engine='CYCLES'
scene.cycles.samples=1
scene.render.resolution_x=890
scene.render.resolution_y=660
scene.render.resolution_percentage=100
clay=bpy.data.materials.new('Architectural clay')
clay.diffuse_color=(.35,.34,.32,1)
scene.view_layers[0].material_override=clay
for name,p,t,f in [('helm',(2.9,2.12,6.85),(-.97,1.9,.18),59),('aft',(.1,2.05,2.2),(-2.7,2.55,10.2),62),('overlook',(0,5.38,10.22),(-.6,1.35,.5),62)]:
    cam=bpy.data.objects['View_'+name]
    scene.camera=cam
    cam.location=vec(p)
    cam.rotation_euler=(vec(t)-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.data.sensor_fit='VERTICAL'
    cam.data.sensor_height=24
    cam.data.lens=12/math.tan(math.radians(f)/2)
    scene.render.filepath=os.path.abspath('output/blockout-'+name+'.png')
    bpy.ops.render.render(write_still=True)
