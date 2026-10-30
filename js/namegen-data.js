/* ==========================================================
   Charakter Journal – Namens-Datenbank für den Namen-Generator
   ----------------------------------------------------------
   So erweiterst du die Sammlung (ohne Programmierkenntnisse):
   • Alle Listen sind Wörter, getrennt durch Leerzeichen.
   • Silben (s = Anfang, m = Mitte, e = Ende) klein schreiben.
   • "cm / cf / cl" = fertige Namen (männlich / weiblich / Nachname),
     hier normal mit Großbuchstaben am Anfang.
   • "A" und "B" = Nachnamen-Bausteine (A + B, z. B. iron + forge).
   Nach Änderungen: tools/build_namegen_offline.py ausführen,
   damit auch die Download-Version aktualisiert wird.
   ========================================================== */
(function () {
  "use strict";
  function w(s) { return s.replace(/\s+/g, " ").trim().split(" "); }

  /* ---------- Klassen ---------- */
  var classes = [
    { id: "warrior", de: "Krieger", icon: "⚔️", color: "#C69B6D",
      A: w("iron steel battle war grim stone bone blood storm shield thunder bold brave hard rage"),
      B: w("fist blade breaker bearer guard hammer crusher cleaver wall born bane hand song heart strike") },
    { id: "paladin", de: "Paladin", icon: "🛡️", color: "#F48CBA",
      A: w("dawn light holy sun gold bright hope valor grace honor radiant silver true noble dusk"),
      B: w("bringer shield heart hand guard ward vow brand helm bearer light crest blade wing oath") },
    { id: "hunter", de: "Jäger", icon: "🏹", color: "#AAD372",
      A: w("wild hawk wolf swift far bow stag eagle fox thorn moss grey lone deep wind"),
      B: w("eye bow stride track shot runner fang claw feather tracker hunter bane call wood arrow") },
    { id: "rogue", de: "Schurke", icon: "🗡️", color: "#FFF468",
      A: w("shadow night silent dusk quick black crow dagger grim whisper sly ash hollow cloak raven"),
      B: w("step blade fingers whisper cloak knife hand stalker walker bane creep shade dancer thorn mark") },
    { id: "priest", de: "Priester", icon: "✨", color: "#FFFFFF",
      A: w("soul holy grace mercy silver pale hallow faith spirit light dawn calm bright gentle sacred"),
      B: w("weaver whisper ward light song hand heart keeper bringer bloom prayer veil tide wing glow") },
    { id: "deathknight", de: "Todesritter", icon: "💀", color: "#C41E3A",
      A: w("frost grave cold bone dread death pale doom rime night ash cinder grim wraith winter"),
      B: w("bringer blade rider hollow bane reaper brand shroud touch hand born fall mourn forged warden") },
    { id: "shaman", de: "Schamane", icon: "🌩️", color: "#0070DD",
      A: w("storm earth spirit thunder wind stone flame river totem cloud mist rain ember wolf tide"),
      B: w("caller speaker walker singer bound born weaver rider tide call tongue heart fury strike seeker") },
    { id: "mage", de: "Magier", icon: "🔮", color: "#3FC7EB",
      A: w("star arcane rune spell frost fire moon sage silver bright mystic glim ember mana void"),
      B: w("weaver spark flame bright fire scribe tome wise caster light glow thought craft wand gleam") },
    { id: "warlock", de: "Hexenmeister", icon: "👁️", color: "#8788EE",
      A: w("doom dark hex void fel ash gloom cinder dread shade soul night curse grim malice"),
      B: w("bringer weaver whisper binder brand touch fire flame caller bound pact born wick fang scourge") },
    { id: "monk", de: "Mönch", icon: "🥋", color: "#00FF98",
      A: w("jade still calm misty serene crane tiger ox mist wind river bamboo peace silent balance"),
      B: w("palm fist step breath heart path mist tide flow hand spirit brew staff stone ward") },
    { id: "druid", de: "Druide", icon: "🌿", color: "#FF7C0A",
      A: w("moon grove thorn wild moss fern oak elder bark leaf star root dream wood green"),
      B: w("whisper bloom walker song root bark claw born leaf shade grove warden heart call branch") },
    { id: "demonhunter", de: "Dämonenjäger", icon: "🦇", color: "#A330C9",
      A: w("fel blind night dark chain shadow glaive horn grim ash wrath scar black exile umbral"),
      B: w("glaive blade sight bane hunter wing brand scar bound fury step gaze stride slayer fang") },
    { id: "evoker", de: "Rufer", icon: "🐉", color: "#33937F",
      A: w("scale wyrm ember sky storm drake flame gale dawn cinder azure ruby emerald sand time"),
      B: w("wing flame breath caller born heart scale claw flight tongue song fang bound talon soar") }
  ];

  /* ---------- Völker ---------- */
  /* f = Fraktion: A Allianz, H Horde, N neutral; c = Namens-Kultur; xA/xB = Zusatz-Bausteine für Nachnamen */
  var races = [
    { id: "human", de: "Mensch", f: "A", c: "human" },
    { id: "dwarf", de: "Zwerg", f: "A", c: "dwarf" },
    { id: "nightelf", de: "Nachtelf", f: "A", c: "nightelf" },
    { id: "gnome", de: "Gnom", f: "A", c: "gnome" },
    { id: "draenei", de: "Draenei", f: "A", c: "draenei" },
    { id: "worgen", de: "Worgen", f: "A", c: "worgen" },
    { id: "voidelf", de: "Leerenelf", f: "A", c: "belf", xA: w("void umbral astral rift shade"), xB: w("seeker walker gaze") },
    { id: "lightforged", de: "Lichtgeschmiedeter Draenei", f: "A", c: "draenei", xA: w("light radiant holy sun blessed"), xB: w("forged bearer lance") },
    { id: "darkiron", de: "Dunkeleisenzwerg", f: "A", c: "dwarf", xA: w("ember ash magma cinder slag"), xB: w("fury brand scorch") },
    { id: "kultiran", de: "Kul Tiraner", f: "A", c: "kultiran" },
    { id: "mechagnome", de: "Mechagnom", f: "A", c: "gnome", xA: w("cog gear steel rivet volt"), xB: w("bot tron core") },
    { id: "orc", de: "Orc", f: "H", c: "orc" },
    { id: "undead", de: "Untoter", f: "H", c: "undead" },
    { id: "tauren", de: "Tauren", f: "H", c: "tauren" },
    { id: "troll", de: "Troll", f: "H", c: "troll" },
    { id: "bloodelf", de: "Blutelf", f: "H", c: "belf" },
    { id: "goblin", de: "Goblin", f: "H", c: "goblin" },
    { id: "nightborne", de: "Nachtgeborener", f: "H", c: "belf", xA: w("night arcane star glimmer"), xB: w("song bloom veil") },
    { id: "highmountain", de: "Hochbergtauren", f: "H", c: "tauren", xA: w("peak stag snow crag antler"), xB: w("horn crest") },
    { id: "magharorc", de: "Mag'har-Orc", f: "H", c: "orc", xA: w("red frost ancestor"), xB: w("totem") },
    { id: "zandalari", de: "Zandalari-Troll", f: "H", c: "troll", xA: w("gold sun loa golden"), xB: w("crown throne") },
    { id: "vulpera", de: "Vulpera", f: "H", c: "vulpera" },
    { id: "pandaren", de: "Pandaren", f: "N", c: "pandaren" },
    { id: "dracthyr", de: "Dracthyr", f: "N", c: "dracthyr" },
    { id: "earthen", de: "Earthen", f: "N", c: "earthen" }
  ];

  /* ---------- Namens-Kulturen ---------- */
  var cultures = {
    human: {
      m: { s: w("al ber ced dun ed gar hal jor lor mar os rod tor wil ald bran cor dar gal hen"), m: w("a e o i ar en er"),
           e: w("ric rick win ward mund bert wyn don ton dric ald rad gar helm an as ian us or") },
      f: { s: w("ade bri cat dia el eli gwen isa jo ly mar mei ro sel tam vi ana ceci lil mir"), m: w("a e i an el ar"),
           e: w("lyn na ra ssa lia belle wen dra ine ette ria sa vana lisa nora thea") },
      A: w("stone wood black white fair grey high north west green hill brook oak thorn river amber ash gold red storm"),
      B: w("ridge field ford wood brook wall stead worth wick ham haven hill bury well shire crest vale mere gate watch"),
      cm: w("Aldric Bertram Cedric Darian Edmund Garrick Halvard Jorrin Leofric Marcus Osric Roderic Tobias Wilhelm Aldous Brannon Corwin Dorian Gideon Hadrian Lucan Maxen Percival Soren"),
      cf: w("Adelyn Brianna Catriona Delia Elara Gwendolyn Isolde Josephine Lysandra Marisol Rosalind Seraphine Tamsin Violet Anwen Celestine Mirabel Rowena Sybil Thalia Verity Winifred Ysolde Clarissa"),
      cl: w("Ashworth Blackwood Calloway Dunmore Everhart Fairbanks Greystone Hawthorne Ironside Kingsley Lockhart Merriweather Northcott Oakheart Pemberton Ravenscroft Stormfield Thistlewood Valemont Whitlock Wyndham Yarrow Holloway Sterling")
    },
    dwarf: {
      m: { s: w("bor brom dur dwal far gor hal kar mag mor nor thar tor ul bar dag gul rud"), m: w("a o i ur ar"),
           e: w("grim din rin nar gar ri bur dok thorn mund drak dun mar rik gan") },
      f: { s: w("bri dag fre gun hild kar mag sig tor thr bel ing run ysa"), m: w("a i e"),
           e: w("da ga ni dis hild rid a wen lda nhild ra gret vi") },
      A: w("iron stone gold deep bronze anvil beard rock mountain battle forge coal copper thunder"),
      B: w("forge beard hammer fist shield delver brew axe helm mantle hand breaker born vault"),
      cm: w("Bordrin Bromgar Durgrim Falkor Gorak Halgrim Karnoth Magnar Morgan Norgrim Tharik Torvald Ulrik Baldur Dagmar Rurik Brondar Thurgan Haldor Gundrik Orsin Dargan Balgrim Korlin"),
      cf: w("Brisa Dagny Frida Gunnhild Helga Karina Magda Sigrun Torunn Thrudi Belga Ingrid Runa Ysa Brunhild Hildi Gretta Vigdis Oda Sigrid Hertha Alfhild Dorrit Frey"),
      cl: w("Anvilmar Barrelbeard Coalbeard Deepdelver Forgefist Goldvein Hammerfall Ironbrow Mountainheart Stonehelm Thunderbrew Axebearer Bronzebeard Copperkettle Rockfist Steelmantle Cragshield Ironvault Stoutbelly Flintbrow")
    },
    nightelf: {
      m: { s: w("ael elu tyr sha lys ela syl mal fae nar ilu thal ven ash cael"), m: w("a e i an el"),
           e: w("andros anil ael ion dor thas ris wen eth indor ariel iros alor") },
      f: { s: w("shan ela nai tyr ys lia may ilea syla thae feli ari"), m: w("a e i el"),
           e: w("dra lia ria nyra sara wyn ael ana elle ienne thea ysa ora") },
      A: w("moon star night silver whisper dream dusk leaf shadow elder wild glade dawn"),
      B: w("whisper song glade blade shade bough runner leaf strider bloom watcher arrow dancer"),
      cm: w("Aelorin Elunor Tyrion Shalor Lysander Faeron Narael Ilumar Thalion Valorian Aeranor Caelum Ashenor Silvanir Eldrin Malorin Sylvain Naroth Thaelor Kaelin Eryndor Faelar Iluvar Orinael"),
      cf: w("Shanael Elaria Naivara Tyrella Ysalia Lialeth Maiara Ileana Sylvara Thaelia Feliana Ariel Nyssa Elunara Selene Aeriel Lunara Ashira Mirael Celeste Ysera Valeria Eliandra Thessara"),
      cl: w("Moonwhisper Starfall Nightbreeze Silverleaf Dawnrunner Duskblade Shadowglade Wildbranch Dreamsinger Elderbough Mistwalker Starweaver Stillwater Leafdancer Moonglade Silentbough Dewfall Gladesong Sunshadow Willowbend")
    },
    belf: {
      m: { s: w("kael aran quel sun lor val thal dath ael eri ven syl"), m: w("a e i an el"),
           e: w("thas ion rius anor dren adar mir oran ael ris eron alor") },
      f: { s: w("ly sa vel ari ely aly sel ina"), m: w("a e i el"),
           e: w("ine ana riel ara wyn sia ena ielle ira nora") },
      A: w("sun gold dawn crimson silver spell star radiant amber ever flame ruby"),
      B: w("strider blade spire song wind crest weaver spark whisper fire guard bloom shard"),
      cm: w("Aerendor Kaelith Valenor Quelros Sunadar Lorathis Thalion Dathrius Aelorian Erivane Venadrel Sylmoran Haldorin Lanthir Mirovan Cassiel Dorathan Eliorin Faelwyn Galadris"),
      cf: w("Lyriel Saphira Velina Arilyn Elyssa Alyndra Selene Inara Vaelira Auriel Melisande Lunessa Caelith Rhiannon Solasia Ilvara Jhaela Tessariel Amariel Neriel Sarielle Lysithea Elaris Corvina"),
      cl: w("Sunstrider Dawnblade Goldspire Crimsonwing Silversong Starweaver Radiantcrest Amberwind Sparkguard Flamebloom Rubyshard Everbright Spellwhisper Sunshard Goldleaf Dawnspire Lightbrand Suncrest Ambervale Silverspell")
    },
    gnome: {
      m: { s: w("fi gwi pim bim tink nib wim zib zap wiz gim lop fizz gad"), m: w("a o i e"),
           e: w("bolt blix kin wick nibble dle ly by wiggle pop ton fizz bin") },
      f: { s: w("pip fizz til nim lum bix gwen zoe mim"), m: w("a i e"),
           e: w("bell kins wyn fiddle wick ly ette bee dot pin") },
      A: w("gizmo cog spring wobble clock tinker whirl copper brass giggle sparkle crank wind"),
      B: w("spring wrench gear whistle tinker bottom fizzle clank bolt sprocket wobble snap"),
      cm: w("Fizzbolt Gizmo Pimwick Tinkerton Nibbles Wimbly Zapper Wizbin Gimble Lopsy Gadwick Bimbolt Tockley Cogsworth Sprocket Whirlin Pennywhistle Ratchet Bixby Quibble Zippo Twiddle Clinker Doodad"),
      cf: w("Pipsqueak Fizzwyn Tilly Nimble Lumi Bixie Gwennie Zoella Mimsy Pennywick Tinkabell Dottie Sprocketta Wobbly Clickety Gearlyn Whistlette Cogwen Pinkie Twinkle Buttons Fizzle Gadgetta Clockette"),
      cl: w("Cogspinner Gearloose Sprocketwheel Tinkertop Wobblesprocket Fizzlewick Brassbottom Clankwhistle Springfoot Boltwrench Gizmosnap Whirlybird Copperkettle Clockwinder Wrenchfizz Cranksmith Sparkplug Gadgetsnap Tickletock Nutsandbolts")
    },
    goblin: {
      m: { s: w("gaz fiz zik bil nix kriz wiz gizz rix snik tix mek"), m: w("a i o e"),
           e: w("wick wizzle zle bolt cog nik gle tron fuse ix zorp") },
      f: { s: w("zee ni fi gi tix nik zaz"), m: w("a i e"),
           e: w("zi la bell ette ssa nix wick fizz") },
      A: w("gear cog sprocket fuse bolt nickel copper spark rocket gold pip blast"),
      B: w("wrench gold sprocket spark boom grease pocket bucket fizz rig whistle cash"),
      cm: w("Gazbolt Fizzwick Zikzak Billibob Nixon Krizzle Wizbang Gizzmo Rixby Snikt Tixton Mekwick Blastoff Sparkle Coggins Fuseli Boomer Nickelby Greaser Pocketz Quickfinger Dealmaker Hustle Scamp"),
      cf: w("Zeezee Nizzy Fizzbell Gizelle Tixie Nikki Zazzle Cashmira Sparkette Bolta Gearla Fusette Goldie Pocketta Rigby Whistletta Coggie Dealia Penny Nickelle Blastia Wizzy Hustla Coppera"),
      cl: w("Fastbuck Greasepocket Boomwrench Goldsprocket Quickfuse Rocketwick Copperpot Sparkcog Nickelbolt Blastwhistle Cashgrubber Wheelnix Fizzbucket Rigmaster Fuselock Coinflip Spendmore Hotwire Dealbreaker Grabnstash")
    },
    draenei: {
      m: { s: w("vel aeth mor oro ky tal ner zal iri ark ora ael"), m: w("a e i o"),
           e: w("ion andor mar an eth rius ael dar von ius oth") },
      f: { s: w("ael ira sel nyr thal via oru ema"), m: w("a e i"),
           e: w("ia ana eth ys iel wyn ora isse ala") },
      A: w("star light crystal dawn vale ever sun holy prism amber sky radiant auric"),
      B: w("bearer walker seeker song crest born shard keeper shine flame ward bright"),
      cm: w("Velarion Aethon Moradin Oroneth Kyrian Talivar Nerion Zalorin Irivan Arkelis Oranel Aelwyn Dathrian Elivar Korvan Maladar Nethion Orrilan Tavrian Valorien Zerathis Ilyndor Haranel Soradin"),
      cf: w("Aeliana Iraveth Selyse Nyrielle Thalaya Viaria Orunya Emalia Auralyn Delaneth Isyrra Kyrelle Maraeth Nelyria Ozalia Sorelle Talwyn Velyssa Yrenia Zilara Aranyth Belianne Cyrene Dalissa"),
      cl: w("Starbearer Lightwalker Crystalsong Dawnseeker Valecrest Everborn Sunshard Holykeeper Prismshine Amberflame Skyward Radiantbright Auricbloom Stardancer Lightbound Crystalvale Evershine Sunwhisper Vellumcrest Starweaver")
    },
    worgen: {
      m: { s: w("ed hug cyr alf wal pip gil rod byr lud barn clem"), m: w("a e i o"),
           e: w("ward ert ley mont ington ric win ton by bert ford") },
      f: { s: w("ag beat con dor flor hen eve hett ophe"), m: w("a e i"),
           e: w("atha ice ora rietta nella ence lia ella ina") },
      A: w("gray black wolf moor wick fern hollow crow thorn mist grim dun"),
      B: w("wood moor bane ham stone ley shire bridge hall ton field croft"),
      cm: w("Edmund Hugo Cyrus Alfred Walter Pippin Gilbert Roderick Byron Ludwig Barnaby Clement Archibald Ambrose Bartholomew Crispin Desmond Egbert Fitzwilliam Gerald Horatio Ignatius Jasper Lancelot"),
      cf: w("Agatha Beatrice Constance Dorothea Florence Henrietta Evelyn Hester Ophelia Philippa Rosamund Winifred Adelaide Cordelia Eleanor Georgiana Harriet Imogen Josephine Lavinia Millicent Prudence Theodora Wilhelmina"),
      cl: w("Greymantle Blackmoor Wolfsbane Hollowhall Thornfield Crowhurst Mistwood Grimsby Dunmore Fernley Moorcroft Wickham Blackthorn Greywick Ravenhall Stonebridge Ashcroft Duskwood Harrowgate Mournfield")
    },
    kultiran: {
      m: { s: w("ed ham gor jos tho wes bar cal nate rog dun fen"), m: w("a e o i"),
           e: w("ric ton by mer ley win thorne bert wick hardt") },
      f: { s: w("ann bett cor dor elin hann jan mar pru tess wil"), m: w("a e i"),
           e: w("ah ia lyn ette ie abel een ina") },
      A: w("storm salt tide wave gale anchor brine harbor iron drift kelp rope sea"),
      B: w("wright wind born hull mast bane rider hand sail weather haven cutter lock ward"),
      cm: w("Edric Hamish Gordon Josiah Thomas Wesley Barnaby Caleb Nathaniel Roger Duncan Fenwick Alistair Bartholomew Cormac Jonas Linus Percy Silas Tobias Ulysses Wallace Absalom Cyrus"),
      cf: w("Annabel Bettina Cordelia Dorothea Elinor Hannah Janet Marian Prudence Tessa Willa Clementine Edith Fiona Greta Harriet Isobel Juniper Katarina Lorna Matilda Nerissa Ottilie Pippa"),
      cl: w("Stormwright Saltwind Tideborn Wavecrest Galehaven Anchorhold Brinecutter Harborlight Ironhull Driftwood Kelpwhistle Ropemaker Seafarer Shipwright Weatherby Windlass Barnacle Tidewater Foghorn Saltmarsh")
    },
    orc: {
      m: { s: w("gro dur gar mog thok krag bor zug ug rok grim ort mak gul"), m: w("a o u"),
           e: w("mash gash tar nak dok gor bash zug mok grul dak rog") },
      f: { s: w("ur gri sha dra mor ka zu bru"), m: w("a u o"),
           e: w("ka ga ra sha ta kha gra dra rul") },
      A: w("blood skull iron bone black dire wolf doom rage fire gore"),
      B: w("fang hand mask tooth hide axe maul scar claw eye roar"),
      cm: w("Grommash Durak Garok Mogar Thokrim Kragnar Borzul Zugrak Ugthar Rokgar Grimzul Ortak Makgul Gulrok Dargosh Hurzak Krugaz Morzak Nazgar Ragnok Skarr Throgg Urzoth Vargul"),
      cf: w("Urga Grisha Drakha Morga Kazula Bruka Shuga Ragna Gurtha Nashka Orgra Thraka Zurga Dagra Hulga Krusha Mogra Rokha Sharga Urzula Varga Yarga Zogga Baruka"),
      cl: w("Bloodfang Skullcrusher Ironhide Bonegrinder Blackmaul Direclaw Wolfsbane Doomhammer Ragefist Firebrand Goretooth Axebreaker Scarmask Eyegouger Fangbreaker Hellroar Stonefist Warsong Ashblade Grimtotem")
    },
    undead: {
      m: { s: w("mor vic ner cor mal ed gar cyr ger ludw mort ern"), m: w("a e i o"),
           e: w("mund ius ric mon rok ley ard ick olf win") },
      f: { s: w("ade bel cor dol ely mor ner ophe sab"), m: w("a e i"),
           e: w("lia na ra bella wyn ina sia lina") },
      A: w("grave crypt bone dust grim pale rot mourn ash hollow cold gloom"),
      B: w("whisper hollow digger bane shade wick fall mourn stone thorn rest keep lurk chime"),
      cm: w("Mortimer Victor Nerus Cornelius Malachi Edgar Garrick Cyrian Gerhard Ludwig Mortis Ernest Lazarus Sepulchre Ambrose Barnabas Dorian Ezekiel Fenwick Gideon Mordecai Octavian Silas Thaddeus"),
      cf: w("Adelaide Belladonna Cordelia Dolores Eloise Morwenna Nerissa Ophelia Sabine Lenora Perdita Rosalind Ulrika Vesper Wilhelmina Zerelda Abigail Carmilla Drusilla Evangeline Griselda Isolde Lilith Morgana"),
      cl: w("Gravewhisper Cryptkeeper Bonedigger Dustwalker Grimhollow Palemourn Rotwick Ashfall Coldstone Gloomthorn Hollowrest Shadechime Mournkeep Lurkwood Duskgrave Nightsoil Ghoulstone Wormwood Cobwebb Ravenscar")
    },
    tauren: {
      m: { s: w("ba cai ha kor mu nah ta ra ok sa ahn mak hol"), m: w("a o u"),
           e: w("hawk tah wa ru nak mo kah dun kor") },
      f: { s: w("sha nay ah mi ta ru lo"), m: w("a i"),
           e: w("ya wa li tha mi ra wen na") },
      A: w("dawn plain spirit wind sun earth grass red thunder high cloud hill river"),
      B: w("hoof walker runner horn song mane hide stalker watcher strider whisper totem"),
      cm: w("Bahawk Cairn Hakota Korak Muhn Nahtu Takoda Rahmo Okuni Sahnu Ahnok Makoma Holnar Tahkaw Bruhn Kaleo Nokoma Ohanzee Rhukoh Sutah Tamaka Utaka Wakahn Yonah"),
      cf: w("Shaya Nayawa Ahli Mitha Taira Ruwena Lona Anaya Kaya Nahla Oyala Sakina Tawna Winona Alawa Hania Isha Kiona Leyla Maka Nita Pavati Sunni Tala"),
      cl: w("Dawnstrider Plainswalker Spiritsong Windrunner Sunhoof Earthmother Grasswhisper Redhorn Thunderhoof Highmane Cloudwatcher Hillstalker Rivertotem Sagehide Proudhorn Skychaser Stonehoof Bloodtotem Wildmane Moonhoof")
    },
    troll: {
      m: { s: w("zan vol raz jin thok zek mal rok haz dar vek zar"), m: w("a o u i"),
           e: w("jin ja tai zar mbo kaya sa tho ru nak roh dun") },
      f: { s: w("zi ja ka vi nay sha ula"), m: w("a i u"),
           e: w("ja sa kaya la nai ra tha mi") },
      A: w("voodoo bone jungle hex spirit drum swamp tusk sun mojo bright tide"),
      B: w("tusk drum whisper mojo tooth spear caller runner charm hex fang shade"),
      cm: w("Zanjin Volrak Razmak Jintho Thokar Zekra Malzar Rokmo Hazaru Darjin Vekru Zarok Mbotu Kanja Rokaya Tazuma Vanak Zuldro Hexor Mojak Jakaru Nakoro Sethru Tikaro"),
      cf: w("Zinja Jasa Kayala Vinai Naysha Shatha Ulami Zulaya Janara Kaiza Mojani Tazi Voshi Zeyna Ziwa Nalaya Sanjira Talaya Umbra Vashi Yasha Zahra Zulima Kishi"),
      cl: w("Voodoowhisper Bonedrum Junglerunner Hexcaller Spiritshade Drumfang Swamptusk Sunspear Mojotooth Brightcharm Tidecaller Skullcharm Moonhex Ragefang Fireshade Blacktusk Deepjungle Stormdrum Wildmojo Sandspear")
    },
    pandaren: {
      m: { s: w("bao chen fei gang hao jun kai lei ming nuo ping qian rui shan tao wen xiang yun zhen"), m: w("a i u"),
           e: w("bo lin ming hua xiu yu jing fei zhi long kun shi") },
      f: { s: w("mei li lan xiu yue ying fang jia ling qing hui"), m: w("a i"),
           e: w("lin mei hua lan yu xia ling zhen rong yan") },
      A: w("stout cloud mist bamboo silk jade tea thunder river amber"),
      B: w("stout brew leaf foot paw step hand whisker breeze song"),
      cm: w("Baolin Chenwei Feihu Gangmin Haoran Junfeng Kaiwen Leihan Mingyu Nuowen Pingan Qianli Ruihan Shanbo Taoyuan Wenzhi Xiangyu Yunfei Zhenlong Boyu Jinhai Lanzhi Fuxiang Jiahao"),
      cf: w("Meilin Lixia Lanying Xiuhua Yuelan Yingmei Fangzhi Jiali Lingyu Qingmei Huilan Meihua Ruolan Shuyi Tingting Xiaoyu Yanling Zhenzhen Biyu Chunhua Dandan Fenfang Guilan Haiyan"),
      cl: w("Zhao Sun Zhou Wu Xu Gao Luo Tang Han Feng Yan Shen Stormstout Cloudsong Mistwalker Bamboopaw Jadefoot Silkbrew Teaweaver Thunderstep Riverleaf Amberwhisker Longpaw Goldenleaf")
    },
    vulpera: {
      m: { s: w("za vi ku ri pip zip nik fen tik mo ruk skit"), m: w("a i o u"),
           e: w("zi ka ko pip nik ra ssi rik dit fin") },
      f: { s: w("zi vi ku pi nik fe tik sa"), m: w("a i o"),
           e: w("zi ka ko pip nik ra ssi ela") },
      A: w("sand dust sly tail rag scrap dune quick red burr crumb tin"),
      B: w("tail paw whisker scamp patch snout nose wrapper scurry dash forager glint"),
      cm: w("Zazzo Fizzit Kurik Ripsy Pipkin Zipzap Nikko Fendit Tikko Moxie Rukka Skitter Zippo Vindo Kuzzi Rikkit Dizzo Fenwick Pibble Scrappo Snazzo Trixel Wiggit Zorrik"),
      cf: w("Zizzi Vika Kuzu Pippa Nikka Fenna Tikki Sassi Zelka Viska Moxi Rukki Skitz Zinnia Pixel Vixi Nizzi Fizzle Tikka Zori Kiki Rikka Sibi Zuzu"),
      cl: w("Sandtail Dustwhisker Slypaw Ragwrapper Scrapscurry Duneforager Quicksnout Redglint Burrpatch Crumbnose Tinscamp Sandscurry Dashwhisker Patchtail Glintpaw Sneakwrap Foxwhistle Scrapheap Dunedash Quickpatch")
    },
    dracthyr: {
      m: { s: w("aer dra kyr nyx vae thy zir ixa sae rhy orm vyr"), m: w("a e y o"),
           e: w("thys rax onyx yth iss ael orn ixa eth vyrn ara") },
      f: { s: w("aer dra kyr nyx vae thy zir sae rhy"), m: w("a e y"),
           e: w("thys ixa ael ara eth issa yra una ysa") },
      A: w("sky ember ash wing scale azure storm gale obsidian ruby emerald dawn"),
      B: w("wing flight breath scale claw fire soar talon born crest song fang"),
      cm: w("Aerthys Drakyr Kyrax Nyxoth Vaelor Thyrax Zirael Ixavar Saeron Rhyth Ormyx Vyrneth Azurion Caldrax Dorveth Erythos Fyrnax Gaelorn Havrix Ixion Jaerath Korvyn Naelix Pyrion"),
      cf: w("Aerixa Drayra Kyrael Nyxara Vaelisa Thyra Zirael Saeryn Rhyssa Auryxa Caelyth Dyraeth Elyxia Faethra Ghyssa Ilyria Jhaela Kaedra Lyrath Myrsa Nyrael Ovaleth Pyrael Syrix"),
      cl: w("Skywing Emberflight Ashbreath Scalesong Azurefang Stormtalon Galecrest Obsidianclaw Rubyfire Emeraldscale Dawnsoar Cindermaw Wyrmborn Dragonsworn Flameheart Sandbreath Thunderwing Frostscale Sunsong Embergale")
    },
    earthen: {
      m: { s: w("bor dur gran kor mag sten tor ur bas cin flint rok"), m: w("a o i"),
           e: w("dun grim stone rok gar brik dar slate kor mar thrum") },
      f: { s: w("ber cla ing ore pyr sil gem opa"), m: w("a i e"),
           e: w("yl a ite dis na ora mina lith") },
      A: w("stone granite slate basalt flint gem deep quartz crag cinder marble ore"),
      B: w("vein heart hammer delver wall shaper born core seeker chisel bound forge"),
      cm: w("Bordun Durgran Korstone Magrok Stentor Torvald Urgrim Basalt Cinder Flintar Rokmar Granik Obsidian Quartzin Marblon Slatan Geodin Pebbrik Boulderan Cragmar Delvin Schistan Talcum Onyxar"),
      cf: w("Berylla Clarite Ingrid Oreana Pyrite Silica Gemma Opalyn Agatha Jaspera Garnetta Amberlyn Topaza Zircona Onyxa Fluorina Calcita Micaela Mineria Granita Slatina Rhodona Lapisa Chalcedona"),
      cl: w("Stoneveil Graniteheart Slatehammer Basaltdelver Flintwall Gemshaper Deepborn Quartzcore Cragseeker Cinderchisel Marblebound Oreforge Veinbreaker Rockwarden Hollowstone Geodeheart Pebblefoot Mountainroot Boulderback Cavernsong")
    }
  };

  /* ---------- Lustige Namen ---------- */
  var funny = {
    first: w(`Hokus Pokus Fridolin Bernhardiner Hubertus Rüdiger Kunigunde Waldemar Kevin Dieter Gerlinde Heinz Berta Horst Jürgen
      Mettigel Brotbert Käsefuß Pummelchen Knuddel Keksi Wuschel Schnuffi Mausi Hasenfuß Trödelmax Nudelholz Schnitzel Bratwurst
      Currywurst Fischstäbchen Pfannkuchen Semmel Brezel Knödel Spätzle Maultasche Dönerbert Zwiebelchen Kartoffel Pantoffel Schlappi
      Zipfelmütz Krümel Plüschi Murmel Wackelpudding Bommel Flauschi Tapsi Holzkopf Dickerchen Quatschkopf Sockenschuss Kuddelmuddel
      Rumpelstilz Rotzlöffel Plapperkopf Schnarchi Nörgel Trulla Banane Mampfred Lauch Pfosten Klopsi Zocker Kasimir Eberhard Gundula
      Hildegunde Adalbert Bärbel Fiffi Gustav Herbert Ignaz Jochen Knut Lothar Marzipan Nepomuk Otto Pumuckel Quentin Rosalinde Sigmund`),
    last: w(`Schnurrbart Kleinhirn Nasenbär Zipfelklatscher Haudegen Dosenöffner Pfannenwender Eierschaukler Stinkesocke Wackelzahn
      Knallfrosch Dampfplauderer Grützkopf Müslimann Sofakartoffel Kaffeesatz Schlafmütze Pustekuchen Zauderer Mehlwurm Brummbär
      Tollpatsch Hosenträger Bierbauch Nudelsieb Gießkanne Laubsäge Bügeleisen Regenschirm Staubwedel Kuchengabel Wurstzipfel
      Hühnerstall Besenstiel Honigkuchen Sauerkraut Fliegenpilz Schnabeltasse Quasselstrippe Kloßbrühe Pflaumenmus Radieschen Knobi
      Ölsardine Teekessel Kochlöffel Glückskeks Blechdose Pantoffelheld Zuckerwatte Mettwurst Wollsocke Windbeutel Bratkartoffel
      Gummistiefel Stolperfalle Kaugummi Löwenzahn Trampeltier Dachschaden Nachtschwärmer Kuchenteller Wackeldackel Hampelmann
      Plätzchen Schmetterling Wurzelsepp Zaunkönig Butterbrot Kellerassel Pfeffernuss Rührei Marmeladenglas Sonnenschirm`),
    byClass: {
      warrior:     { first: w("Haudrauf Kloppi Dosenritter Rüstungsrudi Schildi Brüllhorst Dickschädel Wutbert"),
                     last: w("Dickfell Blechdose Rammbock Streithammel Kampfkeks Wutbürger Sturschädel Eisenfaust") },
      paladin:     { first: w("Heilbert Lichtfried Glanzgustav Hammerhelmut Segensreich Strahlemann Goldlocke Gutmut"),
                     last: w("Heiligenschein Goldkehlchen Glanzpolitur Lichtschalter Hammerzeit Schutzengel Lichtgestalt Blendwerk") },
      hunter:      { first: w("Pfeilfried Waidmann Bogenbernd Fellfreddy Schnüffler Wildwolfgang Kauzi Fallensteller"),
                     last: w("Querschläger Fährtenleser Wildschwein Zielwasser Trockenfutter Hundeführer Fellnase Treffsicher") },
      rogue:       { first: w("Schleichi Taschentom Klaufred Dolchi Leisetreter Mausedieb Nachtschatten Fingerfix"),
                     last: w("Langfinger Dunkelmunkel Beutelschneider Hinterhalt Taschenspieler Schleichfahrt Meuchelmaus Diebesgut") },
      priest:      { first: w("Heilgard Betbruder Segnix Gnadenhelga Weihrauchwalter Amen Heilwig Pfarrer"),
                     last: w("Heilsalbe Gebetsmühle Weihwasser Klingelbeutel Kerzenlicht Wunderheiler Pflasterkleber Vergebung") },
      deathknight: { first: w("Gruftgerd Knochenkurt Grabgustav Modermax Frostbeule Seuchenfred Rippchen Schaurig"),
                     last: w("Knochenbrecher Grabbeigabe Totenkopf Modergruft Kühlschrank Eiswürfel Seelenfänger Frostbeule") },
      shaman:      { first: w("Totemtom Donnerhorst Geisterfrank Blitzbert Wolkenwalter Elementarfred Steckdose Rauchzeichen"),
                     last: w("Totempfahl Blitzableiter Donnerbalken Regenmacher Wetterfrosch Geisterbahn Steinschlag Windbeutel") },
      mage:        { first: w("Zauberlehrling Funkelfred Feuerfinn Hokuspokus Eisbert Arkanus Mannabert Schafsfluch"),
                     last: w("Schafmacher Brandstifter Blinzelblitz Eiswürfel Zauberstab Zaubertrank Feuerzeug Mondscheinhut") },
      warlock:     { first: w("Fluchfried Dämonika Hexi Schattenhein Seelensammler Wichtelwerner Kürbiskurt Gruselgisela"),
                     last: w("Seelenspalter Wichtelvater Kürbiskopf Teufelsbraten Fluchbeladen Schwarzmaler Dämonenpapa Hexenschuss") },
      monk:        { first: w("Bierbernd Fassfried Nebelnick Kungfukalle Tigertatze Teetrinker Zenzorro Faustfix"),
                     last: w("Braumeister Faustfertig Gleichgewicht Bierfass Zengarten Nudelsuppe Hochprozentig Kranichtritt") },
      druid:       { first: w("Bärbel Katzenkarl Mondmichel Waldwichtel Blümchen Eichhörnchen Gänseblümchen Wurzelwalter"),
                     last: w("Baumkuschler Pelzträger Pilzsammler Mooskopf Zweiggestell Gestaltwandler Tierfreund Blumenkind") },
      demonhunter: { first: w("Augenbinde Blindfred Flügelfritz Hornochse Flattermann Fledermaus Grünauge Schmerzhelm"),
                     last: w("Blindgänger Hornochse Flügelschlag Fledermaus Grünschnabel Narbengesicht Gleitflug Augenbinde") },
      evoker:      { first: w("Schuppi Drachenfritz Echsenerwin Flügelflo Schuppenschorsch Zeitreisender Feuerfranz Wyrmwerner"),
                     last: w("Feuerzeug Schuppenkönig Echsenmann Drachenbrut Zeitmaschine Flügelspannweite Kleinwyrm Feuerspucker") }
    },
    byCulture: {
      human: w("Durchschnitt Mittelmaß Normalo Standardheld Alltagsheld Mustermann"),
      dwarf: w("Bierbauch Bartwuchs Zwergenaufstand Kurzbein Hopfenstange Humpenheld"),
      nightelf: w("Katzenjammer Mondschein Nachtschicht Schlafmütze Eulenfreund Ohrenspitz"),
      belf: w("Glanzparade Eitelkeit Haarspray Spiegelbild Hochglanz Modepüppchen"),
      gnome: w("Kleinkram Bastelbert Zahnrad Kurzschluss Glühbirne Tüftelkopf"),
      goblin: w("Kleingeld Münzzähler Pleitegeier Raffzahn Wucherzins Schnäppchenjäger"),
      draenei: w("Hufschmied Ziegenbock Blauhaut Schwanzwedel Himmelblau Hufspur"),
      worgen: w("Flohzirkus Hundeblick Mondsüchtig Fellwechsel Vollmond Gassigeher"),
      kultiran: w("Landratte Seemannsgarn Schiffbruch Kapitänsmütze Rumfass Seekrank"),
      orc: w("Kopfnuss Grünschnabel Keulenschwinger Brüllaffe Muskelkater Zahnlücke"),
      undead: w("Leichenschmaus Gruselgerd Grabbeilage Modergeruch Wiedergänger Kellerkind"),
      tauren: w("Kuhfladen Weidegras Hufeisen Grasfresser Muhmuh Wiederkäuer"),
      troll: w("Voodoopuppe Schnarchsack Zahnlücke Trommelfell Sumpfhuhn Mojito"),
      pandaren: w("Bambusbär Nudelkopf Teeparty Reisschüssel Faulpelz Schlafmatte"),
      vulpera: w("Fuchsschwanz Sandkorn Fuchsbau Schlauberger Hühnerdieb Wüstenfloh"),
      dracthyr: w("Feuerzeug Echsenbrut Schuppenmeister Flugsaurier Zündschnur Rauchmelder"),
      earthen: w("Steinbruch Kieselstein Felsbrocken Geröllhalde Betonkopf Schotterweg")
    }
  };

  window.CJ_NAMES = { classes: classes, races: races, cultures: cultures, funny: funny };
})();
