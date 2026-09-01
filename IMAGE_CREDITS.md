# Recipe And Image Sources

The 120 Chinese household recipes currently used by EatIt were imported from
[Anduin2017/HowToCook](https://github.com/Anduin2017/HowToCook) at commit
`c694a5c457d45e6e012ae6cd9a7724aab86e320b`. Images use the same pinned source
except for the licensed replacements listed below.

Each record in `src/data/dishes.json` contains the upstream recipe path, image
path, revision, and a permanent GitHub URL. The generated
[IMAGE_INVENTORY.md](IMAGE_INVENTORY.md) lists the same provenance for every
local image.

## Processing

- Upstream PNG and JPEG files are auto-oriented, flattened onto a white
  background, and encoded as local JPEG files without AI generation or AI
  upscaling. Audited focus crops remove unrelated table settings, other food,
  people, devices, and kitchen clutter where needed.
- `pnpm run images:optimize` creates WebP display variants without enlarging the
  source image.
- Recipe quantities come from each Markdown file's `计算` section and cooking
  steps come from its `操作` section.
- External image URLs are not downloaded during import. A recipe normally needs
  a readable upstream image whose label or file name matches the dish, or which
  is explicitly identified as a finished/preview image. A checked-in external
  replacement is allowed only when its author, license, URL, and modifications
  are recorded in the generated data and inventory.
- Images with overlays or unrelated content that cannot be removed without
  damaging the dish are excluded.
- Semi-finished products, condiments, desserts, drinks, and templates are outside
  this household recipe import. Clearly foreign-style meals and bakery staples
  are also excluded from the current Chinese household recipe scope. See
  [RECIPE_IMPORT_REPORT.md](RECIPE_IMPORT_REPORT.md) for the generated audit.

## License Status

The pinned HowToCook revision includes the
[Unlicense](https://github.com/Anduin2017/HowToCook/blob/c694a5c457d45e6e012ae6cd9a7724aab86e320b/LICENSE),
which dedicates the repository content to the public domain to the extent
allowed by applicable law and otherwise grants unrestricted use. EatIt's own
code remains covered by EatIt's project license.

## External Replacements

`简易红烧肉` uses a resized and JPEG-re-encoded copy of
[China IMG 3981 (29743084105).jpg](https://commons.wikimedia.org/wiki/File:China_IMG_3981_(29743084105).jpg),
photographed by [Kuruman](https://www.flickr.com/people/56886057@N00) and licensed
under [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/). The source file
depicts red-braised pork belly and was selected because the dish fills the frame
without people, text overlays, or unrelated meals.

`葱烧海参` uses a cropped, resized, and JPEG-re-encoded copy of
[Braised Guandong Sea Cucumber with Scallion in Sauce.jpg](https://commons.wikimedia.org/wiki/File:Braised_Guandong_Sea_Cucumber_with_Scallion_in_Sauce.jpg),
photographed by Zheng Zhou and licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The crop keeps
only the plated sea cucumber and sauce, removing the cutlery and table edge.

`香煎翘嘴鱼`、`尖叫牛蛙` and `炒方便面` use their matching photographs from
the pinned HowToCook revision. Focus crops keep the corresponding finished dish
while removing the embedded video control, table surface, drinks, and other
food.
