# ОСКОЛ · все предметные иконки

**Готово 92 / 92 предмета актуального каталога DEV16.**

Четыре новых оригинала (АК-47, компактный ПП, антисептик, травматологический набор) находятся в `../items16/`; их пути, SHA-256 и SVG внесены в общий manifest. Повторная упаковка сохраняет эти оригиналы.

Каждому предмету соответствует собственный файл, а не алиас общей иконки «винтовка», «металлолом» или «стена». Все — цветной прозрачный lossless WebP 256×256, загружаемый локально. Сохранены 20 ранее отдельно AI-сгенерированных иллюстраций. Остальные 72 — авторские векторные иллюстрации с индивидуальной геометрией, цветом, градиентами и деталями; SVG-оригиналы в `vectors/`, не белые контурные пиктограммы. Это смешанный набор, не 92 AI-генерации и не ассеты Rust/Facepunch.

Регистрация: `src/survival/item-art.js`; SHA-256 и происхождение каждого файла: `manifest.json`. Предметная иконка общая для рюкзака, пояса, рецептов, требований, лута, печи, шкафа и торговли. Персонаж и управляющие кнопки не являются предметами и сохраняют своё оформление.

Подготовка отсутствующих иконок и упаковка без запуска игры/тестов:
```sh
python -m venv --system-site-packages .venv-art
.venv-art/bin/pip install resvg_py Pillow
.venv-art/bin/python scripts/complete-item-art.py
```
Новые предметы без описанной иллюстрации вызывают явную ошибку подготовки, а не автоматически получают общую картинку. Обычная сборка не требует Python/resvg-py. Ранее использованный `process-item-art.py` остаётся для будущих отдельно AI-сгенерированных изображений.

## Каталог
- [x] `wood` — Древесина · individual-ai-illustration
- [x] `stone` — Камень · individual-ai-illustration
- [x] `metalOre` — Металлическая руда · individual-ai-illustration
- [x] `sulfurOre` — Серная руда · individual-ai-illustration
- [x] `metal` — Фрагменты металла · individual-ai-illustration
- [x] `sulfur` — Сера · individual-ai-illustration
- [x] `charcoal` — Уголь · individual-ai-illustration
- [x] `gunpowder` — Порох · individual-ai-illustration
- [x] `fiber` — Ткань · individual-ai-illustration
- [x] `scrap` — Металлолом · individual-ai-illustration
- [x] `berries` — Ягоды · individual-ai-illustration
- [x] `water` — Вода · individual-ai-illustration
- [x] `bandage` — Бинт · individual-ai-illustration
- [x] `axe` — Топор · individual-ai-illustration
- [x] `pickaxe` — Кирка · individual-ai-illustration
- [x] `hammer` — Киянка · individual-ai-illustration
- [x] `rifle` — Самодельная винтовка · individual-ai-illustration
- [x] `ammo` — Патроны · individual-ai-illustration
- [x] `satchel` — Взрывной заряд · individual-ai-illustration
- [x] `armor` — Кожаная броня · individual-ai-illustration
- [x] `foundation` — Фундамент · original-vector-illustration
- [x] `wall` — Стена · original-vector-illustration
- [x] `door` — Деревянная дверь · original-vector-illustration
- [x] `roof` — Перекрытие · original-vector-illustration
- [x] `campfire` — Костёр · original-vector-illustration
- [x] `furnace` — Печь · original-vector-illustration
- [x] `workbench` — Верстак · original-vector-illustration
- [x] `battery` — Аккумулятор · original-vector-illustration
- [x] `rock` — Камень в руке · original-vector-illustration
- [x] `torch` — Факел · original-vector-illustration
- [x] `pistol` — Пистолет П-9 · original-vector-illustration
- [x] `revolver` — Револьвер Р-6 · original-vector-illustration
- [x] `smg` — Пистолет-пулемёт МП-24 · original-vector-illustration
- [x] `shotgun` — Помповое ружьё · original-vector-illustration
- [x] `assaultRifle` — Автомат АР-30 · original-vector-illustration
- [x] `boltRifle` — Продольная винтовка · original-vector-illustration
- [x] `semiRifle` — Полуавтомат СК-16 · original-vector-illustration
- [x] `heavyPistol` — Тяжёлый пистолет · original-vector-illustration
- [x] `combatShotgun` — Боевой дробовик · original-vector-illustration
- [x] `machineGun` — Пулемёт ЛМ-60 · original-vector-illustration
- [x] `rocketLauncher` — Ракетница РЛ-1 · original-vector-illustration
- [x] `plan` — Строительный план · original-vector-illustration
- [x] `storage` — Деревянный ящик · original-vector-illustration
- [x] `largeStorage` — Большой ящик · original-vector-illustration
- [x] `pistolAmmo` — Пистолетные патроны · original-vector-illustration
- [x] `shells` — Картечь · original-vector-illustration
- [x] `syringe` — Медицинский шприц · original-vector-illustration
- [x] `medkit` — Аптечка · original-vector-illustration
- [x] `cannedFood` — Консервы · original-vector-illustration
- [x] `lowFuel` — Топливо низкого качества · original-vector-illustration
- [x] `rope` — Верёвка · original-vector-illustration
- [x] `gears` — Шестерни · original-vector-illustration
- [x] `spring` — Пружина · original-vector-illustration
- [x] `sewingKit` — Швейный набор · original-vector-illustration
- [x] `metalPipe` — Металлическая труба · original-vector-illustration
- [x] `metalCylinder` — Металлический баллон · original-vector-illustration
- [x] `rifleBody` — Корпус винтовки · original-vector-illustration
- [x] `smgBody` — Корпус ПП · original-vector-illustration
- [x] `semiBody` — Полуавтоматический корпус · original-vector-illustration
- [x] `metalBlade` — Металлическое лезвие · original-vector-illustration
- [x] `metalSheet` — Листовой металл · original-vector-illustration
- [x] `techParts` — Электронные компоненты · original-vector-illustration
- [x] `tarp` — Брезент · original-vector-illustration
- [x] `ductTape` — Изолента · original-vector-illustration
- [x] `highMetal` — Высококачественный металл · original-vector-illustration
- [x] `highMetalOre` — Богатая металлическая руда · original-vector-illustration
- [x] `explosives` — Взрывчатое вещество · original-vector-illustration
- [x] `rocket` — Обычная ракета · original-vector-illustration
- [x] `hvRocket` — Скоростная ракета · original-vector-illustration
- [x] `incendiaryRocket` — Зажигательная ракета · original-vector-illustration
- [x] `timedCharge` — Подрывной заряд · original-vector-illustration
- [x] `f1Grenade` — Осколочная граната · original-vector-illustration
- [x] `beancan` — Самодельная граната · original-vector-illustration
- [x] `mushroom` — Грибы · original-vector-illustration
- [x] `pumpkin` — Тыква · original-vector-illustration
- [x] `corn` — Кукуруза · original-vector-illustration
- [x] `meat` — Сырое мясо · original-vector-illustration
- [x] `cookedMeat` — Жареное мясо · original-vector-illustration
- [x] `cupboard` — Шкаф обслуживания · original-vector-illustration
- [x] `recycler` — Разборочный верстак · original-vector-illustration
- [x] `repairBench` — Ремонтный стол · original-vector-illustration
- [x] `triangleFoundation` — Треугольный фундамент · original-vector-illustration
- [x] `halfWall` — Полустена · original-vector-illustration
- [x] `doorway` — Дверной проём · original-vector-illustration
- [x] `triangleRoof` — Треугольное перекрытие · original-vector-illustration
- [x] `roofSlope` — Скатная крыша · original-vector-illustration
- [x] `stairs` — Лестница · original-vector-illustration
- [x] `ramp` — Пандус · original-vector-illustration
