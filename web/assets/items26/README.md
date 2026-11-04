# Complete inventory regeneration — approved user reference

**Status: 155 / 155 original inventory icons prepared, 0 pending. Integrated into DEV26 source/build; no runtime validation.**

The user explicitly selected **all inventory icons**, including resources, tools, weapons, food, medicines, structures, 56 garments and 8 attachment items. The complete static ID list is `catalog.json`. The existing game registry has 92 icons; clothing adds 55 unique IDs (armor already exists), attachments add 8: total 155.

## Approved style

The user supplied the final accepted reference as `image-13.png`. Its scaled copy is `style-reference.webp`; the original is in `.artifacts/items26/reference/approved-style.png`. Use this same original as the image reference on every subsequent generation. Muted painted steel/earth/cloth colors, thin dark contours, broad subtle wear patches, soft diffuse shading, diagonal three-quarter orientation. NOT the rejected photographic, glossy, heavy cel-outlined, or strongly faceted low-poly styles. The screenshot reference and earlier generated alternatives are NOT the approved reference.

Each generation is ONE standalone inventory object. Objects should be immediately distinguishable at small size (cleaver blade vs corrugated sheet, long angular rifle receiver vs short tubular SMG receiver vs open silver semi-auto frame). Keep 12% source padding, no text/labels/UI, no cast shadow or ground plane. Ask for flat magenta #ff00ff outside the object and inside through-holes; this is removed offline, never displayed in the game. Preserve the reference's orientation and approximate foreshortening rather than rotating existing flat icons.

## Prepared

- `metalBlade` — лезвие тесака, голый металлический хвостовик, отверстия, широкая режущая кромка.
- `metalPipe` — полая труба с видимым отверстием.
- `metalCylinder` — газовый баллон с вентилем.
- `gears` — зубчатая шестерня с осевым отверстием.
- `spring` — спиральная пружина с раздельными витками.
- `rifleBody` — длинный угловатый ствольный корпус.
- `smgBody` — короткий трубчатый корпус ПП.
- `semiBody` — открытая светлая полуавтоматическая рамка.
- `metalSheet` — гофрированный лист металла.
- `techParts` — зелёная электронная плата.

Second batch (all generated with the same original approved image reference):
- `rope` — верёвка.
- `sewingKit` — нитки и крупная игла.
- `tarp` — сложенный брезент с люверсами.
- `ductTape` — рулон изоленты с отогнутым концом.
- `highMetal` — слиток высококачественного металла.
- `akRifle` — автомат с деревянной фурнитурой и изогнутым магазином, без обвесов.
- `compactSmg` — компактный ПП с коротким стволом, без обвесов.
- `antiseptic` — флакон антисептика.
- `traumaKit` — медицинский подсумок с перевязочными материалами.
- `wood` — связка брёвен с видимыми спилами.

Third batch (same approved reference, ten successful individual generations):
- `stone` — обычные серые камни, без рудных вкраплений.
- `metalOre` — железная руда с широкими ржаво-оранжевыми прожилками.
- `sulfurOre` — серная руда, жёлтые включения в тёмной породе.
- `metal` — светлые фрагменты обработанного металла.
- `sulfur` — очищенная жёлтая сера, без серой породы.
- `charcoal` — чёрные куски обугленной древесины.
- `gunpowder` — открытый мешочек с порохом.
- `fiber` — сложенная светлая ткань.
- `scrap` — ржавые разнородные металлические обрезки.
- `berries` — красные ягоды на короткой веточке.

Fourth batch (same approved reference; ten successful generations, no retries):
- `water` — бутылка питьевой воды.
- `bandage` — рулон бинта с отогнутым концом.
- `axe` — каменный топор с деревянной рукоятью и обмоткой.
- `pickaxe` — кирка с узким заострённым поперечным клювом.
- `hammer` — строительная деревянная киянка.
- `rifle` — самодельная винтовка без бесплатных обвесов.
- `ammo` — длинные винтовочные патроны с остроконечными пулями.
- `satchel` — игровой заряд в брезентовой сумке.
- `armor` — кожаный защитный жилет, без человека/манекена.
- `foundation` — квадратный деревянный фундамент с видимой толщиной и опорами.

Fifth batch (same approved reference; ten successful individual generations):
- `wall` — деревянная стена с диагональной связью, без дверного проёма.
- `door` — деревянная дверь в раме с петлями и защёлкой.
- `roof` — плоский потолочный/кровельный модуль, без стоек фундамента.
- `campfire` — каменное кольцо, поленья и небольшое пламя.
- `furnace` — каменная плавильная печь с топкой и короткой трубой.
- `workbench` — деревянный верстак с тисками и нижней полкой.
- `battery` — аккумулятор с ручкой и двумя клеммами.
- `rock` — один камень для удержания в руке, в отличие от кучки строительного камня.
- `torch` — деревянный факел с обмоткой и пламенем.
- `pistol` — обычный компактный самозарядный пистолет, без обвесов.

Sixth batch: eight new weapon icons and two explicit user-requested replacements, all using the same approved reference.
- `revolver` — револьвер с видимым барабаном.
- `smg` — полноразмерный ПП, отличный от компактного ПП.
- `shotgun` — помповый дробовик с деревянной фурнитурой.
- `assaultRifle` — штурмовая винтовка с полимерной фурнитурой.
- `boltRifle` — длинная болтовая винтовка без прицела.
- `semiRifle` — полуавтоматическая винтовка с коротким магазином.
- `heavyPistol` — крупный тяжёлый пистолет, отличный от компактного.
- `combatShotgun` — боевой дробовик с чёрной фурнитурой.
- Replaced `door`: user found the old icon too large. New generation depicts the door leaf without a massive doorway frame. Processor explicitly fits this item to **180 px** inside 256 px, instead of 224 px, so trimming cannot undo the scale correction.
- Replaced `rock`: user found the old icon egg/ruby-shaped. New generation requests a squat asymmetrical natural fieldstone, chipped notch and irregular shoulders, not an oval, jewel or ordered crystal facets.

The rejected door/rock source images are archived under `.artifacts/items26/replaced/`, not the game asset directory. `replacementHistory` records their previous hashes and the user's correction. This batch contains ten generations but only eight new IDs, hence 58 prepared rather than 60.

Seventh batch (same approved reference; ten successful individual generations, no retries):
- `machineGun` — пулемёт с коробом подачи и тяжёлым стволом, без прицела.
- `rocketLauncher` — ракетница с широкой трубой и механической прицельной планкой.
- `plan` — синий сложенный строительный чертёж без текста.
- `storage` — небольшой квадратный деревянный ящик.
- `largeStorage` — длинный усиленный ящик с ручками.
- `pistolAmmo` — короткие пистолетные патроны, отличные от длинных винтовочных.
- `shells` — красные дробовые патроны с латунными основаниями.
- `syringe` — медицинский шприц.
- `medkit` — светлый жёсткий медицинский футляр, отличный от тканевого травмонабора.
- `cannedFood` — закрытая консервная банка с простым рисунком рыбы без надписей.

Door/rock replacements from batch six and their scale metadata are preserved. All 58 previously prepared IDs remain present; this batch adds ten new IDs.

Eighth batch (same approved reference; ten successful individual generations, no retries):
- `lowFuel` — металлическая канистра с ручкой и носиком, без клемм аккумулятора.
- `highMetalOre` — неровная тёмная порода с серебристо-синими металлическими вкраплениями.
- `explosives` — упакованные бруски игрового взрывчатого материала, без деталей устройства.
- `rocket` — обычная оливковая ракета со светлой полосой.
- `hvRocket` — более тонкая скоростная ракета с синей полосой.
- `incendiaryRocket` — зажигательная ракета с оранжево-красной головной частью.
- `timedCharge` — закрытый короб игрового подрывного заряда без внутренней схемы.
- `f1Grenade` — оливковая сегментированная граната с кольцом.
- `beancan` — игровой заряд в жестяной банке, отличный от еды и осколочной гранаты.
- `mushroom` — коричневый лесной гриб с толстой светлой ножкой.

Previously completed IDs, the approved style reference and the door/rock corrections are preserved. Total is now 78 unique prepared IDs.

Ninth batch (same approved reference; ten successful individual generations, no retries):
- `pumpkin` — целая ребристая тыква с коротким стеблем, без вырезанного лица.
- `corn` — початок кукурузы в частично отогнутых листьях.
- `meat` — неровный красно-розовый сырой кусок мяса.
- `cookedMeat` — подрумяненный приготовленный кусок, визуально отличный от сырого.
- `cupboard` — высокий узкий деревянный шкаф обслуживания.
- `recycler` — оливковый промышленный переработчик с загрузочной воронкой и выходным лотком.
- `repairBench` — компактный ремонтный стол с металлической столешницей и тисками.
- `triangleFoundation` — треугольный деревянный фундамент с тремя угловыми опорами.
- `halfWall` — низкая широкая деревянная полустена.
- `doorway` — пустой компактный дверной проём без дверного полотна и окружающей стены.

All earlier icons remain, including the deliberately smaller door and irregular fieldstone replacements. This batch brings the unique prepared set to 88 IDs.

Tenth batch (same approved reference; ten successful individual generations, no retries):
- `triangleRoof` — тонкая плоская треугольная крыша без опор фундамента.
- `roofSlope` — отдельный наклонный кровельный скат, не пандус и не целый дом.
- `stairs` — прямая деревянная лестница с шестью различимыми ступенями.
- `ramp` — непрерывный деревянный пандус без ступеней.
- `clothCap` — тканевая кепка с козырьком.
- `woolHat` — вязаная шапка с отворотом, без козырька.
- `furHat` — меховая ушанка с опущенными наушниками.
- `leatherHelmet` — прошитый кожаный шлем с ремешком.
- `salvageHelmet` — неровная каска из металлических пластин с заклёпками.
- `riotHelmet` — тёмный защитный шлем с лицевым щитком.

Clothing icons depict empty individual garments, not heads or mannequins. All earlier icons and the explicit door/rock replacements are preserved. Total: 98 unique prepared IDs.

Eleventh batch (same approved reference; ten successful individual generations, no retries):
- `kevlarHelmet` — оливковый кевларовый шлем с ремешком, без забрала и обвесов.
- `ceramicHelmet` — серо-синий композитный шлем с усиленным лбом и щитком.
- `clothBandana` — треугольная тканевая бандана с завязками.
- `desertScarf` — песочный шарф с многослойными складками и бахромой.
- `balaclava` — тёмная тканевая балаклава с широким отверстием для глаз.
- `snowMask` — светлая утеплённая северная маска.
- `leatherMask` — коричневая кожаная полумаска на нос и нижнюю часть лица.
- `weldMask` — сварочный щиток с тёмным прямоугольным смотровым окном.
- `kevlarMask` — оливковая защитная маска с раздельными глазными отверстиями.
- `steelMask` — металлическая лицевая пластина с узкой смотровой щелью.

All are individual empty equipment illustrations, without a head or mannequin. Previous completed items and the explicit door/rock corrections remain unchanged. Total: 108 unique prepared IDs.

Twelfth batch (same approved reference; ten successful individual generations, no retries):
- `ragShirt` — лоскутная рубаха с крупными заплатами и неровным подолом.
- `cottonShirt` — простая светлая футболка с короткими рукавами.
- `stripedShirt` — тельняшка с широкими сине-белыми полосами.
- `workShirt` — рабочая рубашка с воротником, пуговицами и двумя нагрудными карманами.
- `hoodie` — толстовка с пустым капюшоном и карманом-кенгуру.
- `fleeceShirt` — серо-синяя флисовая кофта с короткой молнией и воротником-стойкой.
- `combatShirt` — оливковая боевая рубашка с усиленными локтями и рукавными карманами.
- `paddedShirt` — стёганый поддоспешник с крупной ромбовидной простёжкой.
- `rainPoncho` — брезентовое пончо с капюшоном и открытыми боками.
- `travelCloak` — длинный плащ с открытым передом и простой застёжкой у горла.

All depict individual empty garments without heads, hands or mannequins. Earlier 108 icons, the approved reference and the door/rock replacements are preserved. Total: 118 unique prepared IDs.

Thirteenth batch (same approved reference; ten successful individual generations, no retries):
- `winterCoat` — длинный меховой плащ с широким меховым капюшоном и открытым передом.
- `scrapVest` — нагрудник из неровных металлических пластин с крупными заклёпками.
- `riotVest` — тёмный противоударный жилет с сегментированными жёсткими панелями.
- `kevlarVest` — оливковый тканевый кевларовый бронежилет.
- `ceramicVest` — серо-синий плитник с выраженным прямоугольным карманом под плиту.
- `ragPants` — лоскутные штаны с крупными заплатами и потрёпанными краями.
- `linenPants` — простые светлые льняные брюки.
- `jeans` — синие джинсы с широкими выцветшими участками на коленях.
- `cargoPants` — оливковые брюки с большими боковыми карманами.
- `winterPants` — толстые светлые стёганые зимние штаны.

All clothing is depicted empty, without people/mannequins, with the approved diagonal painted treatment. The previous 118 icons, including door/rock corrections, remain preserved. Total: 128 unique prepared IDs.

Fourteenth batch: nine new garments and one explicit user-requested correction; ten successful generations using the same approved reference, no retries.
- Replaced `riotVest`: user rejected an unwanted brown object/backing in the previous image. Regenerated the isolated dark charcoal vest only, explicitly prohibiting brown pads, boards, paper, background rectangles, stands or cloth sheets. Requested perfectly flat magenta outside the vest and in all openings for offline removal. Old source archived in `.artifacts/items26/replaced/riotVest-batch13.png`; previous hashes and the user reason are recorded in `replacementHistory.riotVest`.
- `leatherPants` — коричневые кожаные поножи с прошитыми панелями.
- `riotPants` — тёмные защитные поножи с сегментированными панелями и наколенниками.
- `kevlarPants` — оливковые усиленные тканевые поножи.
- `clothWraps` — пара пустых тканевых обмоток для кистей.
- `knitGloves` — мягкие вязаные перчатки с пятью пальцами.
- `workGloves` — рабочие перчатки из светлой парусины и жёлто-коричневой замши.
- `leatherGloves` — простые тёмно-коричневые кожаные перчатки.
- `winterGloves` — светлые толстые рукавицы с общим отделением для пальцев.
- `tacticalGloves` — тёмно-оливковые перчатки с защитой костяшек.

Clothing is empty, without human limbs or mannequins. Preserve every previously prepared icon except the deliberately replaced riot vest; door/rock corrections remain. Nine new IDs bring the unique prepared set to 137, not 138. All future prompts should explicitly prohibit incidental brown backing objects as well as ground/shadows.

Fifteenth batch (same approved reference; ten successful individual generations, no retries):
- `kevlarGloves` — оливковые усиленные тканевые перчатки.
- `steelGauntlets` — стальные наручи с сегментированными пальцами и заклёпками.
- `clothShoes` — простые светлые тканевые башмаки.
- `sandals` — открытые кожаные сандалии с перекрёстными ремешками.
- `sneakers` — серо-синие кеды со светлыми резиновыми носами и подошвой.
- `workBoots` — жёлто-коричневые рабочие ботинки с усиленными носами.
- `leatherBoots` — простые тёмно-коричневые сапоги с ремешком на щиколотке.
- `snowBoots` — утеплённые зимние сапоги с меховым воротом.
- `combatBoots` — высокие тёмные шнурованные боевые берцы.
- `armoredBoots` — сапоги с накладными стальными носами, подъёмом и щитками голени.

All pairs depict empty equipment without human limbs/mannequins. Prompts explicitly exclude incidental brown backing objects, boards, mats, paper, ground and shadows. Preserve all previous 137 icons, including corrected riotVest and the door/rock replacements. Total: 147 unique prepared IDs; all clothing now prepared. Only the eight weapon attachments remain.

Sixteenth/final batch: eight new original attachment icons and two explicitly requested replacements, all ten individual generations successful using the approved reference.
- `steelGauntlets` and `armoredBoots` replaced: user rejected knight-like silver steel armor. New prompts require modern charcoal tactical gloves/boots with integrated matte molded protective pads, fabric/leather and no medieval plates/rivets. Stable IDs retained. Previous PNGs archived in `.artifacts/items26/replaced/*-batch15.png`, old hashes/reasons in replacementHistory.
- `holoSight`, `reflexSight`, `scope4x`: distinct hooded rectangular, open lightweight and tubular magnifying optics.
- `suppressor`, `muzzleBrake`, `flashHider`: long can, short side-ported brake, open-pronged device.
- `laserSight`, `extendedMag`: small aiming module and long curved box magazine.

Complete: **155 unique original inventory IDs**, including all 56 garments and the original eight attachments. Core combined bytes 5,731,396. Source hash history preserves door180, irregular rock, isolated riot vest and modern glove/boot corrections. New additional DEV26 guns/modules share six appropriate existing illustrations by explicit mapping in the manifest; do not count them as six further AI paintings.

`manifest.json` records per-image source hash, processed hash, size, reference hash and explicit pending IDs. Current transparent 256×256 lossless WebP icons occupy **5,731,396 bytes combined**. No FPS or runtime claims: thumbnail resolution/memory matter, not merely whether an image looks realistic.

## Continue authoring

The original 15 component illustrations are now complete. No original inventory IDs remain pending. Do not regenerate completed art unless the user requests a correction. Preserve completed icons except explicit user-requested corrections; door and rock were deliberately replaced in batch six, riotVest in batch fourteen, and modernized steelGauntlets/armoredBoots in batch sixteen. Do not regenerate completed icons or use the rejected `.artifacts/items26/raw` or `.artifacts/components26/raw` outputs.

Store approved-reference generations as `.artifacts/items26/approved-raw/ITEM_ID.png`, with `images` set to the original approved-style file. These icons are assets inside a larger game, so no per-image option vote is needed now that the style has been approved.

The image tool reported a **10-generation-per-reply quota** during the first approved batch. Stop at that cap and continue in another reply; a delay does not reset a reply quota. For ordinary transient generator failures the user's explicit instruction is to run `sleep 10` through bash and then retry. User-aborted calls are not transient generation errors. A 10-second bash pause was executed after the first quota report; no calls were made to bypass the cap. Batches two through sixteen each used exactly ten successful image calls with no errors, so no error retry/pause was necessary.

Process offline with `.venv-art/bin/python scripts/prepare-items26.py` (Pillow, no game imports/execution). The processor uses only the approved-raw directory, keys the chroma, crops/pads without changing pose, writes WebP plus manifest, a deliverable art sheet and an icon archive under `.artifacts/items26/`. Original large generated PNGs are not part of the app/Git.

## Integration gate

Historical gate (now completed): do **not** redirect the live `ITEM_ART` registry to a partial set while calling it a complete regeneration. Once all 155 are prepared, update the registry with all new paths/hashes, make static item art take precedence over the existing SVG clothing/attachment fallbacks in `main.js`, and ensure equipment/crafting/loot/shop displays use it. Rename displayed `metalBlade` to `Лезвие тесака` while preserving its stable ID, recipes, save ownership and recycling balance. Keep the existing garment paper-doll and game meshes unchanged: this request concerns inventory icons, not a world-model replacement.

After completion: update release metadata/docs, syntax and compile only, then the standing autonomous APK/EXE build-only delivery. No unit, browser, emulator, game, listening, visual-runtime or FPS tests.

Provenance: individual AI illustrations generated for this project using the user's approved generated artwork, processed offline. No Facepunch assets extracted or copied.

## Integration completed in DEV26

All 155 paths/hashes registered; static art precedes clothing/module SVG fallbacks. The shared callback covers belt, inventory, crafting, loot, shop, equipment slots and module panels. Displayed metalBlade renamed to Лезвие тесака, IDs unchanged; paper doll/world models retained. Experimental NPC/weapon/terrain release changes are documented separately in `src/survival/DEV26.md`. Build-only packaging, no game/visual/audio/FPS tests.
