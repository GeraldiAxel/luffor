# Luffor cockpit studio — handoff

A ship's wheelhouse at night, adapted into a developer studio. Original scene, built procedurally in Blender 5.2 from the Python scripts in `blender/scripts/`.

## Files

| Path | What it is |
|---|---|
| `blender/luffor_cockpit_source.blend` | Fully editable source: ~700 separate named objects, no merging. Edit here. |
| `blender/luffor_cockpit.blend` | Web-optimised scene: static meshes merged, second UV set, lightmap bake setup, route actions, wire mesh. |
| `web/luffor_cockpit.glb` | The export: meshes, materials, textures, cameras, lights, hotspot empties, 7 animation clips. |
| `web/luffor_cockpit_wire.glb` | Feature-edge line mesh (glTF `LINES`) for the wireframe opening. Same coordinates as the main GLB. |
| `web/lightmaps/LM_*.png` | Four baked lightmap atlases (not referenced by the GLB; apply in code, see below). |
| `web/camera_routes.json` | 43 camera routes with timestamped position / quaternion / fov samples. |
| `web/scene_manifest.json` | Cameras, hotspots, destinations, clips, lightmap mapping, opening timeline. |
| `web/viewer/index.html` | Reference three.js viewer used to validate the export. Shows lightmaps, routes, hotspots and the opening. |
| `textures/` | Generated source textures (also embedded in the GLB). |
| `renders/final/` | Reference stills from every camera. |
| `renders/opening/` | Opening preview video, frames and contact sheet. |

## Scale and coordinates

- Real-world scale, metres. Room is 9 m wide, 7.1 m long, ceiling 2.8 m. The aft chart platform is raised 0.4 m.
- Blender: +X starboard, +Y bow, +Z up. Lower deck floor is Z = 0.
- GLB and both JSON files: glTF / three.js space, right-handed, +Y up. `gltf(x, y, z) = blender(x, z, -y)`, so the bow is −Z and starboard is +X.
- Quaternions in JSON are `[x, y, z, w]` in glTF space (`q_gltf = Rx(−90°) · q_blender`) and can be set directly on a three.js camera: `camera.quaternion.fromArray(q)`. They were checked against the camera node rotations inside the GLB and match to five decimals.

## Cameras

All cameras use a 36 mm sensor, horizontal fit. `fov_vertical_deg_16x9` in the JSON is the three.js `fov` at 16:9; for other aspect ratios keep the horizontal fov.

| Camera | Lens | Purpose |
|---|---|---|
| `CAM_Opening_Start` | 21 mm | First frame of the opening drift |
| `CAM_Opening_Hero` | 21 mm | Settled home view |
| `CAM_WorkLocker` | 21 mm | Work |
| `CAM_ChartTable` | 28 mm | Services |
| `CAM_Lookout_Nook` | 26 mm | About |
| `CAM_Radio_Station` | 30 mm | Contact |
| `CAM_Helm` | 26 mm | Extra: helm desk, wheel, radar |
| `CAM_Reverse_FromBow` | 19 mm | Extra: reverse view of the aft wall and sign |

## Navigation

- Hotspots are empties named `HS_*` in the GLB, with `camera` and `section` in glTF `extras`. Their positions are also listed explicitly in `scene_manifest.json` under `hotspots`.
- `destinations` in the manifest maps each site section to a camera, a hotspot and the objects to highlight.
- Routes are named `ROUTE_<Start>__to__<Destination>` and exist for every ordered pair of the seven destination cameras, plus `ROUTE_Opening`.
- Each route is a quadratic Bézier in position with a quaternion slerp, eased with easeInOutCubic. Samples are pre-eased at 30 Hz: play them linearly over `duration`.
- Routes were ray-tested against the scene geometry. A route that would clip is bent through `WP_Room_Centre` or `WP_Platform_Centre`; each route records `geometry_clear` and `via_waypoint`.
- All 43 routes passed the ray test without needing a waypoint.
- In Blender the opening and the twelve home routes are stored as stashed NLA actions on `CAM_Route_Player`. These 13 also export into the GLB as animations targeting the `CAM_Route_Player` node, for viewers that support camera animation. The JSON is the authoritative source and covers all 43.

## Animation clips

All clips are 240 frames at 24 fps (10.0 s) and loop seamlessly.

| Clip | Target | What it does |
|---|---|---|
| `Lighthouse_Beam_Rotate` | `ANIM_Lighthouse_Beam_Pivot` | One lantern turn; two beams, so the bridge is swept every 5 s |
| `Radar_Sweep_Rotate` | `ANIM_Radar_Sweep` | Radar arm, two turns |
| `Ships_Wheel_Sway` | `ANIM_Ships_Wheel` | Wheel rocks ±12° |
| `Chart_Lamp_Swing` | `ANIM_Chart_Lamp` | Pendant lamp sways |
| `Helm_Dev_Typing_Idle` | `CHAR_Helm_Dev_Rig` | Typing, glancing across monitors |
| `Navigator_Dev_Plotting_Idle` | `CHAR_Navigator_Dev_Rig` | Plotting on the chart, weight shift |
| `Lookout_Dev_Laptop_Idle` | `CHAR_Lookout_Dev_Rig` | Typing, then turns to watch the lighthouse |

## Naming

`ARCH_` architecture, `FURN_` furniture, `PROP_` props, `INT_` clickable objects, `ANIM_` independently animated objects, `CHAR_` characters, `EXT_` exterior, `FX_` beam cones, `LIGHT_`, `CAM_`, `HS_` hotspots, `WP_` route waypoints, `WIRE_` line mesh. Materials are `MAT_*`, textures `TEX_*`, lightmaps `LM_*`.

## Lighting and lightmaps

- Static lighting is baked in Cycles into four atlases addressed by the second UV set (`TEXCOORD_1`). The manifest lists which object uses which atlas.
- The atlases store diffuse radiance divided by `range` (4.0), as 8-bit sRGB. In three.js: `lightMap = tex`, `tex.channel = 1`, `tex.flipY = false`, `tex.colorSpace = SRGBColorSpace`, `lightMapIntensity = range * Math.PI`.
- The lighthouse beam is not baked. Keep `LIGHT_Lighthouse_Beam_A` and `_B` as realtime spot lights; they ride on the animated pivot. Hide every other exported light, since their contribution is already in the lightmaps.
- The three characters have no lightmap. The viewer uses a low hemisphere light and a small emissive term as a stand-in; light probes would be better.
- Brass is fully metallic and needs an environment map to read as brass.
- Tone mapping is AgX at +0.2 stops (`rendering` in the manifest). In three.js: `renderer.toneMapping = AgXToneMapping`, `toneMappingExposure = 2 ** 0.2`.
- For the beam to throw window-frame shadows across the room, enable shadow maps on the two beam spots only (the viewer does this: 2048 px map, near 22, far 60). Their realtime intensity is a look decision; the viewer uses 5000 cd with decay 1.2.
- The five area lights in the scene (monitor glow, locker strips, sign glow) are not representable in `KHR_lights_punctual` and are skipped by the exporter. They are fully captured in the lightmaps.

## What was verified

- GLB structure read back from the file: 36,347 triangles, 37 meshes, 60 materials, 14 embedded textures, 9 cameras, 3 skins, 13 punctual lights, `TEXCOORD_1` present on every lightmapped mesh.
- The seven named clips are each exactly 10.000 s.
- Loaded in three.js r160 through `web/viewer/index.html`: orientation, scale, textures, skinning and camera framing match the Blender renders from the same cameras.
- Lightmaps applied in the viewer match the Cycles stills in colour and brightness, with the viewer slightly cooler and higher in contrast.

## Remaining differences and limits

- Characters are original stylised low-poly figures with simple geometric faces and block hands. They hold up at the opening and mid-distance views; close-ups show the simplification.
- Character idles are bone rotations on a rest pose built at the working posture. There is no walk cycle or facial animation.
- Lightmaps are 8-bit with a range of 4, so surfaces within a few centimetres of a lamp clip.
- Small props are flat-coloured; only the deck, teak panels, chart, screens, dials, rug, posters and logo are textured.
- Screens are still textures, not video.
- The beam cones are plain additive geometry. A soft volumetric shader would look better.
- The opening preview video composites the pixel, noise and dither effects offline; the live version is the shader in the viewer.

## Opening sequence

Timeline (also in the manifest under `opening_sequence`):

1. 0.0–2.6 s: black screen, white line render of the wire GLB, pixelated, with flickering block noise. Camera drifts along `ROUTE_Opening`.
2. 2.6–3.8 s: blocks are revealed in random order, biased from the centre outward. Each block passes through a 1-bit ordered-dither monochrome stage before reaching full colour, while the pixel size shrinks to 1.
3. 4.0 s: camera lands exactly on `CAM_Opening_Hero`.

Produced in Blender: the scene, the wire mesh, the camera move. Browser post-processing: line rendering, pixelation, the block-noise reveal mask, the Bayer dither. `web/viewer/index.html` contains a working fragment shader for all four; `blender/scripts/render_opening.py` reproduces the same maths offline for the preview video.

## Rebuilding

Run from the project root, in this order:

```
blender -b -P blender/scripts/build_scene.py     # source .blend + textures
blender -b -P blender/scripts/finalize.py        # merge, lightmap UVs, bake
blender -b -P blender/scripts/export.py          # wire, routes, GLB, JSON
blender -b -P blender/scripts/render_views.py    # stills
blender -b -P blender/scripts/render_opening.py  # opening preview
```

Export settings: GLB, +Y up, selection only (everything except `WIRE_`), cameras, punctual lights, custom properties, skins, animation mode Actions, no Draco.
