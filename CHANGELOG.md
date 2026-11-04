# ОСКОЛ — тестовые итерации

## DEV 0.17.0 · iteration 16 — input, authored items, visibility / build only

- Independent desktop mouse button events fix RMB/LMB chording; per-pointer touch attack/swim release ownership. Existing focus/pointer-lock reset retained.
- Fourteen authored firearm/launcher models, three tools and four medical models; bevelled silhouettes, recessed muzzle, curved AK magazine, moving reload parts, explicit optic/tool sockets, two-handed axe/pickaxe. DEV14 remains the sole pose/IK owner. Muzzle flashes use model endpoints.
- Nine original periodic PBR surface sets; static item/vehicle batching, world-scoped vehicle geometry caches. Mushroom stalk below a rounded outward-normal cap; textured edible surfaces.
- AK-47, compact SMG, antiseptic and trauma kit: full recipes/components/loot/art/profiles/ammo/save support. Existing syringe/medkit gain crate availability and use models. Actual HP-gain toasts; old oversized medical stacks remain readable. 92 icons = 20 prior AI + 72 original vectors.
- NEW-world terrain revision 7: broad hills/ridges, smaller camp grading shoulder, protected beach/channel. Revision <=6 formulas retained; menu reports saved terrain revision. Shared triangle surface unchanged.
- Near/balanced/far visibility controls; 96m house-proxy chunks, reduced forest range and distant tree shadows, profile-aware house streaming, render-only object flags respected by targeting. No fog or FPS claims.
- Original roadside sedan/pickup wrecks: wheel arches, glazing/pillars, mirrors, rims, lights, corrosion and pickup beds; road-following yaw. Existing IDs/loot coordinates and OBB collision/walk surfaces retained; no vehicle simulation.
- Android code18 / unchanged IDs, signing and save paths; Windows portable. No tests/game/browser/native/emulator/visual/audio execution; source/asset authoring, compilation and packaging only.

## DEV 0.16.0 · iteration 15 — dark night artwork / build only

- Regenerated the night illustration: near-black forest, dark navy sky, two armored people walking toward camera, two green NVG points each and two rifle lasers. Authored ambient exposure reduction preserves green emitters.
- Two-surface menu/loading gallery: 12-second dwell, 2.6-second incoming cross-dissolve, restrained lateral drift; outgoing image stays opaque until replacement covers it. Current/next decoded images only, no remote requests.
- Decode/crossfade click locking, session cancellation, background-tab suspension, reduced-motion preference, unchanged foreground controls. No world construction in the menu and no save/terrain/gameplay/DEV14 hand changes.
- Android code17 and Windows portable, unchanged IDs/signature/save paths. No tests or game/browser/native/visual/audio execution; compilation and packaging only.

## DEV 0.15.0 · iteration 14 — first-person hands / build only

- Original lofted fingerless-glove hands: opposed thumbs, smooth three-bone finger skinning, nails and authored procedural microdetail.
- Continuous skinned cloth arms with camera-space shoulders, wrist-locked two-bone IK and hidden-anchor compensation at reach limits.
- One authoritative pose controller replaces the DEV04/05/08 update chain. Velocity-driven locomotion, forward sprint lowering, crouch/air/landing, turn lag, ADS, equip, melee/release/reach and swimming transitions.
- Twelve weapon grip profiles plus tool/plan/rock/explosive holds. Tool shaft sockets derive from authored geometry. Actual optic-center ADS; eligible ADS also controls HUD reticle.
- Magazine, ammo-box, cylinder, internal/tube and rocket reload presentation on the existing clock; visible bolt/pistol slide/pump actions. Ammunition remains an atomic gameplay operation at completion.
- Spring recoil, muzzle flashes and an eight-instance short-lived visual casing pool; no casing collisions/loot. Last-grenade release survives belt reconciliation.
- Existing saved worlds receive the new viewmodels without a map/save revision bump. Combat/terrain/loot/bots not rebalanced. APK code16, Windows portable, same app ID/dev signature/save paths.
- No tests or game/browser/native/visual/audio execution. Compilation and packaging only; animation quality, intersections, performance and sound synchronization remain unverified on devices.

## DEV 0.5 · iteration 03

- Свои сохраняемые 12-слотовые ящики; пустые случайные лут-контейнеры удаляются, свои остаются.
- Настоящая шестислотовая печь: топливо, два входа, внутренние выходы, 4-секундная плавка, сохранение прогресса. Удалены мгновенные рецепты металла/серы/угля.
- План в руке, прямая трата ресурсов, солома/ветки первым уровнем; нет крафта отдельных стен/фундаментов, старые заготовки мигрируют в материалы.
- Семь огнестрельных предметов/три вида боезапаса, новые предметы и рецепты; 80% шанс одной пушки максимум, без умножения оружия. Старое содержимое нормализуется без повторной награды.
- Густая трава из изогнутых лопастей; конопля даёт ткань. Снежный/пустынный рельеф и растительность заметнее.
- Четыре авторские гребные лодки и две отдельные морские нефтеплатформы с причалом/лестницей/лутом — 12 РТ, базы отдельно.
- Пространственный индекс коллизий, частоты ИИ по расстоянию, dormancy предметов, кэш 3D-иконок. Не заявляется замер физического Android.
- Исправлен реальный источник ложного урона в лагере: слишком широкая проверка речной воды. Локальный уровень воды, безопасный стартовый лагерь, история источника урона/объяснение смерти; загрузка погибшего персонажа больше не воскрешает его молча, возрождение сбрасывает лодку/старый урон.
- Повторный захват мыши после паузы/фокуса, Windows focus hook, защита от начального pointer warp.
- Новый слотовый интерфейс выжившего/крафта/стройки/лута/печи/HUD, 3D-иконки и компактная landscape-печь. Визуальные референсы не включены в сборку.
- 64 unit-теста; полный браузерный сценарий сборки/хранилища/печи/оружия/лодки/нефтеплатформы/мобильного GUI, пиксельная проверка мира, проверки JS/шейдеров/offline. Схема сохранений v2 расширена совместимыми полями.

## DEV 0.4 · iteration 02

- Убраны временной gate рендера и туман; сглажены ускорение, остановка и камера на склонах, ограничено управление прыжком.
- День/ночь, биомы, grounded GLB-лес, чанки и ближняя потоковая трава; светлое небо и исправление очистки мира проходом рук.
- 4×4 и 8×8 км, горы и речная система. Legacy-размеры/seed/сохранения поддерживаются.
- 30+6 настоящих сохраняемых слотов, ограниченные стопки, split/merge/swap, drag/drop и touch-перенос.
- Контейнер справа, поштучный/стопочный перенос в обе стороны, постоянные остатки, один сохраняемый 80%-бросок оружия с ×множителем. Наземные контейнеры для выбрасывания/переполнения.
- Разрушаемые бочки всех трёх категорий, удаление блокирования после разрушения, коллизии ящиков/станций, приоритет ближайшей модели.
- Поле зрения/преграды/реакция/последний контакт/промахи ботов. Базы не считаются РТ.
- Корректная касательная разметки, дополнительные оригинальные промышленные детали десяти РТ, сохраняемые метки, высота соседних фундаментов.
- 52 unit-теста, расширенная офлайн-браузерная регрессия с пиксельной проверкой мира, отдельные Android WebView и Windows Electron smoke в CI.

Не финальная версия. Физический Android, VSync, нагрев и 8-км карта на телефоне ещё требуют пользовательского теста. Полноценные плавание, навигационная сетка и человеческая симуляция ботов не заявляются.

## DEV 0.3 · iteration 01

Первый одиночный survival, лицензированные модели, десять РТ и шесть баз ботов, добыча/стройка/улучшения/сохранения, Android + Windows тестовые сборки. Сохранённая отдельная аркада не заменена.
