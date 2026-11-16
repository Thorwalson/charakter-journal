/* ==========================================================
   Charakter Journal – English name database for the name generator
   ----------------------------------------------------------
   Mirrors namegen-data.js in structure (classes / races / cultures),
   but with its own, independently written English-flavoured name
   pools – not translations of the German lists. Used when the
   generator's language switch (DE/EN) is set to English.
   After changes: re-run the tools/build_namegen_offline*.py scripts.
   ========================================================== */
(function () {
  "use strict";
  function w(s) { return s.replace(/\s+/g, " ").trim().split(" "); }

  /* ---------- Classes ---------- */
  var classes = [
    { id: "warrior", en: "Warrior", icon: "⚔️", color: "#C69B6D",
      A: w("iron steel battle oak grim stone bone blood storm shield thunder bold brave hard rage savage reckless fierce mighty armored"),
      B: w("fist blade breaker bearer guard hammer crusher cleaver wall born bane hand song heart strike slayer smasher warden brawler juggernaut titan") },
    { id: "paladin", en: "Paladin", icon: "🛡️", color: "#F48CBA",
      A: w("dawn light holy sun gold bright hope valor grace honor radiant silver true noble dusk sacred blessed devout steadfast shining"),
      B: w("bringer shield heart hand guard ward vow brand helm bearer light crest blade wing oath defender champion sentinel aegis crusader") },
    { id: "hunter", en: "Hunter", icon: "🏹", color: "#AAD372",
      A: w("wild hawk wolf swift far bow stag eagle fox thorn moss grey lone deep wind keen silent sharp roaming timber"),
      B: w("eye bow stride track shot runner fang claw feather tracker hunter bane call wood arrow snare quarry scout ranger sentry") },
    { id: "rogue", en: "Rogue", icon: "🗡️", color: "#FFF468",
      A: w("shadow night silent dusk quick black crow dagger grim whisper sly ash hollow cloak raven cunning stealthy veiled furtive midnight"),
      B: w("step blade fingers whisper cloak knife hand stalker walker bane creep shade dancer thorn mark assassin backstab footpad prowler wraith") },
    { id: "priest", en: "Priest", icon: "✨", color: "#FFFFFF",
      A: w("soul holy grace mercy silver pale hallow faith spirit light dawn calm bright gentle sacred serene devout pious gracious hopeful"),
      B: w("weaver whisper ward light song hand heart keeper bringer bloom prayer veil tide wing glow healer blessing hymn sanctuary communion") },
    { id: "deathknight", en: "Death Knight", icon: "💀", color: "#C41E3A",
      A: w("frost grave cold bone dread death pale doom rime night ash cinder grim wraith winter hollow rotten cursed unholy spectral"),
      B: w("bringer blade rider hollow bane reaper brand shroud touch hand born fall mourn forged warden harbinger scourge blight torment ruin") },
    { id: "shaman", en: "Shaman", icon: "🌩️", color: "#0070DD",
      A: w("storm earth spirit thunder wind stone flame river totem cloud mist rain ember wolf tide lightning gale tidal ancestral windswept"),
      B: w("caller speaker walker singer bound born weaver rider tide call tongue heart fury strike seeker channeler stormbringer earthshaker mistwalker") },
    { id: "mage", en: "Mage", icon: "🔮", color: "#3FC7EB",
      A: w("star arcane rune spell frost fire moon sage silver bright mystic glim ember mana void astral cosmic runic luminous ethereal"),
      B: w("weaver spark flame bright fire scribe tome wise caster light glow thought craft wand gleam conjurer enchanter sorcerer spellbinder arcanist") },
    { id: "warlock", en: "Warlock", icon: "👁️", color: "#8788EE",
      A: w("doom dark hex void fel ash gloom cinder dread shade soul night curse grim malice wicked vile sinister infernal corrupted"),
      B: w("bringer weaver whisper binder brand touch fire flame caller bound pact born wick fang scourge conjuror summoner voidwalker felcaller tormentor") },
    { id: "monk", en: "Monk", icon: "🥋", color: "#00FF98",
      A: w("jade still calm misty serene crane tiger ox mist wind river bamboo peace silent balance tranquil flowing humble disciplined focused"),
      B: w("palm fist step breath heart path mist tide flow hand spirit brew staff stone ward strider wanderer sage disciple brewmaster") },
    { id: "druid", en: "Druid", icon: "🌿", color: "#FF7C0A",
      A: w("moon grove thorn wild moss fern oak elder bark leaf star root dream wood green ancient verdant sylvan untamed bramble"),
      B: w("whisper bloom root bark claw born leaf shade grove warden heart call branch song walker shapeshifter grovekeeper wildheart dreamwalker") },
    { id: "demonhunter", en: "Demon Hunter", icon: "🦇", color: "#A330C9",
      A: w("fel blind night dark chain shadow glaive horn grim ash wrath scar black exile umbral cursed vengeful branded feral corrupted"),
      B: w("glaive blade sight bane hunter wing brand scar bound fury step gaze stride slayer fang demonslayer felstalker shadowstep wrathguard") },
    { id: "evoker", en: "Evoker", icon: "🐉", color: "#33937F",
      A: w("scale wyrm ember sky storm drake flame gale dawn cinder azure ruby emerald sand time ancient draconic ethereal boundless primal"),
      B: w("wing flame breath caller born heart scale claw flight tongue song fang bound talon soar dragonheart skywarden stormwing starclaw") }
  ];

  /* ---------- Races (reuse the same id/f/c keys as the German file) ---------- */
  var races = [
    { id: "human", en: "Human", f: "A", c: "human" },
    { id: "dwarf", en: "Dwarf", f: "A", c: "dwarf" },
    { id: "nightelf", en: "Night Elf", f: "A", c: "nightelf" },
    { id: "gnome", en: "Gnome", f: "A", c: "gnome" },
    { id: "draenei", en: "Draenei", f: "A", c: "draenei" },
    { id: "worgen", en: "Worgen", f: "A", c: "worgen" },
    { id: "voidelf", en: "Void Elf", f: "A", c: "belf", xA: w("void umbral astral rift shade"), xB: w("seeker walker gaze") },
    { id: "lightforged", en: "Lightforged Draenei", f: "A", c: "draenei", xA: w("light radiant holy sun blessed"), xB: w("forged bearer lance") },
    { id: "darkiron", en: "Dark Iron Dwarf", f: "A", c: "dwarf", xA: w("ember ash magma cinder slag"), xB: w("fury brand scorch") },
    { id: "kultiran", en: "Kul Tiran", f: "A", c: "kultiran" },
    { id: "mechagnome", en: "Mechagnome", f: "A", c: "gnome", xA: w("cog gear steel rivet volt"), xB: w("bot tron core") },
    { id: "orc", en: "Orc", f: "H", c: "orc" },
    { id: "undead", en: "Undead", f: "H", c: "undead" },
    { id: "tauren", en: "Tauren", f: "H", c: "tauren" },
    { id: "troll", en: "Troll", f: "H", c: "troll" },
    { id: "bloodelf", en: "Blood Elf", f: "H", c: "belf" },
    { id: "goblin", en: "Goblin", f: "H", c: "goblin" },
    { id: "nightborne", en: "Nightborne", f: "H", c: "belf", xA: w("night arcane star glimmer"), xB: w("song bloom veil") },
    { id: "highmountain", en: "Highmountain Tauren", f: "H", c: "tauren", xA: w("peak stag snow crag antler"), xB: w("horn crest") },
    { id: "magharorc", en: "Mag'har Orc", f: "H", c: "orc", xA: w("red frost ancestor"), xB: w("totem") },
    { id: "zandalari", en: "Zandalari Troll", f: "H", c: "troll", xA: w("gold sun loa golden"), xB: w("crown throne") },
    { id: "vulpera", en: "Vulpera", f: "H", c: "vulpera" },
    { id: "pandaren", en: "Pandaren", f: "N", c: "pandaren" },
    { id: "dracthyr", en: "Dracthyr", f: "N", c: "dracthyr" },
    { id: "earthen", en: "Earthen", f: "N", c: "earthen" }
  ];

  /* ---------- Naming cultures (English-flavoured, distinct from the DE pools) ---------- */
  var cultures = {
    human: {
      m: { s: w("rich geof wend osw edwin ful ran leof god alf bren cuth dun stan wy ead hered ord sher wald fitz ken norm royce"), m: w("a e o i ar en"),
           e: w("ard mond wick stan ton ley ric win hurst ford wyn den bert field holt mere grave stow by croft dale") },
      f: { s: w("ros may gwen edith ailee bea cla fenn gret hono ida jess kath lora mar nell orla pen rowe sybi tess una vida wyn"), m: w("a e i ar"),
           e: w("wyn ley etta ine abel ara ssa elle anna wood field rose bell") },
      A: w("oak elm fair hazel briar glen vale heath cliff shore lea dell meadow wren lark fallow harvest russet amber"),
      B: w("field brook wood stead shaw combe ham burn holt grange croft tor mere fen gate down thorpe wick stow fold"),
      cm: w("Richard Geoffrey Wendell Oswin Edwin Fulbert Ranulf Leofwin Godric Alfwin Brennus Cuthbert Dunstan Wystan Eadmund Herefrid Ordell Sherwin Waldric Fitzgerald Kenrick Norman Royce Bramwell Carrick Dellingham Everard Fenwicke Hollis Linden Marshall Pemberley Quinten Sterne Thackery Vernald"),
      cf: w("Rosalind Maybelle Gwendolen Edith Aileen Beatrix Clarabelle Fennimore Gretchen Honora Idalia Jessamine Kathlyn Lorelei Marigold Nellwyn Orlabeth Pendrith Rowena Sybila Tessaline Una Vidalia Wynessa Amaranth Briallen Carys Delphina Everly Fenella Hollis Linnea Marguerite Primrose Sorrel Wrenna"),
      cl: w("Ashgrove Briarfield Dellacombe Everwood Fallowmere Greystoke Harrowgate Lindenhurst Meadowbrook Oakenfold Pemberley Russetdale Sherbourne Thackeray Vanewick Wrenfield Carrickmoor Hollowmead Larkspur Sternfield Underhill Westover")
    },
    dwarf: {
      m: { s: w("bren dolg eim fror gund halv irn kjar mund nolg orik rund thain ulf varn brondor coril dagrim eldun fenrik grung hjalm"), m: w("a o i ur"),
           e: w("brand fist orin ung heim drin bolg karr thor ild mark") },
      f: { s: w("alvi brynn drisa eira frigga greta hjord ingrun kjara runild sigdis thyri valda brisca dalla ferga holda"), m: w("a i e"),
           e: w("hild run a gerd veig dis borg mund thra") },
      A: w("iron stone gold deep bronze anvil beard rock mountain battle forge coal copper thunder granite silver steel cave"),
      B: w("forge beard hammer fist shield delver brew axe helm mantle hand breaker born vault hold keep warden guard brow"),
      cm: w("Brendolg Eimfror Gundhalv Irnkjar Mundolg Orikrund Thainulf Varnbrand Brondor Coril Dagrim Eldun Fenrik Grungar Hjalmar Ironfist Bolgrim Karrulf Thorild Markdrin"),
      cf: w("Alvi Brynndris Eirafrig Gretahj Ingrunkj Runild Sigdis Thyri Valdahold Briscadalla Fergaholda Hildrun Gerdveig Thradis Borgmund Alfhild Dagheid Freygerd Hjordal Signy"),
      cl: w("Ironfist Brondorhall Daggrim Eldunbrow Fenrikaxe Grungarbeard Hjalmarok Varnbrand Coralmine Holdfast Stonemark Veinhammer Cragborn Oreheart Deephold Forgewright Stoutaxe Underhollow")
    },
    nightelf: {
      m: { s: w("lath mori shae veno dral ithal sor aen vyll orin thelas celor nyth ravan elar"), m: w("a e i o"),
           e: w("anor essil oth ariel endor ius wyn athir oril") },
      f: { s: w("lath mori shae veno thael sora aenel vylla orinae celys nythra ravena elareth"), m: w("a e i"),
           e: w("iel ara wynn essa oria ithyn ael una") },
      A: w("moon star night silver whisper dream dusk leaf shadow elder wild glade dawn twilight mystic sylvan"),
      B: w("whisper song glade blade shade bough runner leaf strider bloom watcher arrow dancer warden sentinel"),
      cm: w("Lathorin Morishae Venodral Ithalsor Aenvyll Orinthel Celornyth Ravanelar Shaelith Draloreth Sorindel Aenorath Vyllamar Celoswyn Nythrion"),
      cf: w("Lathoriel Morishara Venothael Ithalsora Aenelwyn Orinaeya Celysara Nythrael Ravenelle Elarethis Shaelora Dralinor Sorendis Aenyssara Vyllanis"),
      cl: w("Moonwhisper Starfallen Nightshade Silverleaf Dawnglade Duskrunner Shadowbloom Wildwatcher Dreamdancer Eldersong Sylvanstrider Mistbough Twilightwarden Glademire Starsentinel")
    },
    belf: {
      m: { s: w("ren thal vero sael cron dathis elun mir orath syvel kael vashan theron ilmar"), m: w("a e i o"),
           e: w("adon ith oris aelan vorin yssian ethar oldren") },
      f: { s: w("ren thala veroa saela crona dathis elune miro oratha syveli kaela vashana therona"), m: w("a e i"),
           e: w("iel assa orin ythe velia ora enna") },
      A: w("sun gold dawn crimson silver spell star radiant amber ever flame ruby mystic"),
      B: w("strider blade spire song wind crest weaver spark whisper fire guard bloom shard wielder"),
      cm: w("Renthalor Verosael Crondathis Elunmir Orathsyvel Kaelvashan Theronilmar Adonis Ithoris Aelanvorin Yssianethar Oldrenor Mirothal Syveldath"),
      cf: w("Renthala Veroasael Cronadathis Elunemiro Orathasyveli Kaelavashana Theronilma Ithoriel Aelanyssa Vorinelle Etharia Oldrenis Mirothala Syvelora"),
      cl: w("Sunstrider Goldblade Dawnspire Crimsonsong Silverwind Spellcrest Starweaver Radiantspark Amberwhisper Everfire Flameguard Rubybloom Mysticshard Wielderfall")
    },
    gnome: {
      m: { s: w("spar dink wob fiz bren nix tock glim pinwick zoot flib"), m: w("a o i e"),
           e: w("ton gadget spring cog whistle bolt click fizzle nut gear") },
      f: { s: w("sparkle dinka wobs fizzy brenni nixie glimma pinwee zootie flibby"), m: w("a i e"),
           e: w("belle kins ette fiddle wyn nkle dot ly") },
      A: w("gizmo cog spring wobble clock tinker whirl copper brass sparkle crank wind"),
      B: w("spring wrench gear whistle tinker bottom fizzle clank bolt sprocket wobble"),
      cm: w("Spartock Dinkwob Fizzbren Nixglim Pinwickzoot Flibberton Gadgetspring Coggerald Whistlebolt Clickfizz"),
      cf: w("Sparkledinka Wobsfizzy Brennixie Glimmapin Zootieflib Fiddlebelle Nixkins Wyndotly Gizmoette Boltnkle"),
      cl: w("Cogwhirl Tinkerbrass Sparklecrank Wobblewind Clockfizzle Nutbolt Gearsprocket Whistlewobble Bottleclank Fizzington")
    },
    goblin: {
      m: { s: w("grix fenz obo krenk vix nabo zort plix smug dreg"), m: w("a i o e"),
           e: w("cash loot nickel rig dosh gold boom crank scam") },
      f: { s: w("grixi fenza obobi krenka vixi nabozi zorta plixie smugga"), m: w("a i e"),
           e: w("etta bell ssa nix wick zi vix") },
      A: w("gear cog sprocket fuse bolt nickel copper spark rocket gold pip blast dosh cash"),
      B: w("wrench gold sprocket spark boom grease pocket bucket fizz rig whistle cash deal"),
      cm: w("Grixfenz Obokrenk Vixnabo Zortplix Smugdreg Cashloot Nickelrig Doshgold Boomcrank Scammer"),
      cf: w("Grixiefenza Obobikrenka Vixinabozi Zortaplixie Smuggadeal Goldetta Nixbell Wickssa Zinix Vixzi"),
      cl: w("Fastbuck Sprocketdeal Boltprofit Goldgouge Quickscam Greasepalm Nickelgrab Cashwrench Hustlegear Dealbreaker")
    },
    draenei: {
      m: { s: w("vash ildo moran korev tyal zenar irath arkos oralin aelith"), m: w("a e i o"),
           e: w("ion dor essar vanel ith orath yseth") },
      f: { s: w("vasha ildona morana koreva tyala zenara iratha arkosia oralina aelitha"), m: w("a e i"),
           e: w("ia ara ethy issa ulya orenna") },
      A: w("star light crystal dawn vale ever sun holy prism amber sky radiant auric celestial"),
      B: w("bearer walker seeker song crest born shard keeper shine flame ward bright weaver"),
      cm: w("Vashildo Moranokorev Tyalzenar Irathark Oralinael Starbearer Vanelorath Yseth Dawnvale Everholy"),
      cf: w("Vashailda Moranakoreva Tyalazena Irathaarkosia Oralinaaelitha Staressa Ianthe Ulyanna Orennavale Everholya"),
      cl: w("Starbearer Lightwalker Crystalseeker Dawnsong Valecrest Everbright Sunshard Holykeeper Prismshine Amberflame Celestialward")
    },
    worgen: {
      m: { s: w("ambr duncly fitzhu grenv halew ivesl mortr orvald tadric barnwell clement archib"), m: w("a e i o"),
           e: w("ward ert ley mont ington ric ton by bert ford") },
      f: { s: w("adali bessam coral dellwy etheli fannyo gertru agath beatr const dorot"), m: w("a e i"),
           e: w("ice ora rietta nella ence lia ella ina") },
      A: w("gray black wolf moor wick fern hollow crow thorn mist grim dun night feral savage"),
      B: w("wood moor bane ham stone ley shire bridge hall ton field croft fang claw howl"),
      cm: w("Ambrosewick Duncanley Fitzhugh Grenville Halewood Ivesley Mortram Orvald Tadric Barnwell Clementford"),
      cf: w("Adaline Bessamy Coralie Dellwyn Ethelinda Fannyola Gertrude Agatha Beatrice Constance Dorothea"),
      cl: w("Greymantle Blackmoor Wolfsbane Hollowhall Thornfield Crowhurst Mistwood Grimsby Dunmore Nightfang Feralclaw Savagehowl")
    },
    kultiran: {
      m: { s: w("ashbrig dockgrim harbjet portsal wickmast sailhul keelbr finegale tidewick edham gorjos"), m: w("a e o i"),
           e: w("ric ton mer ley win thorne wick hardt fog gale") },
      f: { s: w("breecas delfawn gailha jessmar annbe ttcor dorel inhan njan"), m: w("a e i"),
           e: w("ah ia lyn ette abel elle etta ora wyn") },
      A: w("storm salt tide wave gale anchor brine harbor iron drift kelp rope sea fog reef shoal"),
      B: w("wright wind born hull mast bane rider hand sail weather haven cutter lock ward keeper"),
      cm: w("Ashbrigham Dockerygrim Harbingtonjet Portsalwick Wickmast Sailhull Keelbrine Finegale Edrictide Gordonjosiah"),
      cf: w("Breecassandra Delfawnetta Gailharbor Jessmara Annabelle Bettinacor Dorelinor Hannajan Fawnetta"),
      cl: w("Stormwright Saltwind Tideborn Wavecrest Galehaven Anchorhold Brinecutter Harborlight Ironhull Driftwood Foghaven")
    },
    orc: {
      m: { s: w("grom dur gar mog thok krag bor zug ug rok grim ort mak gul blak chak drek frag hok"), m: w("a o u"),
           e: w("mash gash tar nak dok gor bash zug mok grul dak rog zuk thar gol") },
      f: { s: w("urg gri sha dra morg kazu brug sha chif fragr grak"), m: w("a u o"),
           e: w("ka ga ra sha ta kha gra dra rul zha nka") },
      A: w("blood skull iron bone black dire wolf doom rage fire gore savage brutal mighty vicious feral"),
      B: w("fang hand mask tooth hide axe maul scar claw eye roar crusher smasher breaker render ripper"),
      cm: w("Gromdur Garmog Thokkrag Borzug Ugrok Grimort Makgul Blakchak Drekfrag Hokkor Murnak Rekvok"),
      cf: w("Urggri Shadra Morgkazu Brugsha Chiffragr Grakkra Mlathra Zhanka Thavra Kshamora"),
      cl: w("Bloodfang Skullcrusher Ironhide Bonegrinder Blackmaul Direclaw Wolfsbane Doomhammer Ragefist Firebrand Goretooth")
    },
    undead: {
      m: { s: w("mortiv cornel edgarc gerhaw ludwic mortise ernestl ashbal drakfes grolhark"), m: w("a e i o"),
           e: w("mund ius ric mon rok ley ard ick olf oth ais") },
      f: { s: w("adelco rdelio elomor wennar ophesa bash blaci adres felgo"), m: w("a e i"),
           e: w("lia na ra bella wyn ina sia lina etta ossa") },
      A: w("grave crypt bone dust grim pale rot mourn ash hollow cold gloom decay plague rancid"),
      B: w("whisper hollow digger bane shade wick fall mourn stone thorn rest keep lurk chime walker"),
      cm: w("Mortivcornel Edgarcyrian Gerhawludwic Mortisernest Lazarusash Balcordrak Fesgrolhark Ambrosedoom"),
      cf: w("Adelcordelio Elomorwenna Ophesabash Blaciadres Felgoribel Carmilladru Drusillafen Griseldaash"),
      cl: w("Gravewhisper Cryptkeeper Bonedigger Dustwalker Grimhollow Palemourn Rotwick Ashfall Coldstone Gloomthorn")
    },
    tauren: {
      m: { s: w("bahawk cairnha kotakor muhnnah tutakod rahmook unisah nuahnok makoma holnart"), m: w("a o u"),
           e: w("hawk tah wa ru nak mo kah dun kor tano waka") },
      f: { s: w("shayanay awaahli mithata irawen alonaya kayahla oyalasa kinataw nawino nahani"), m: w("a i"),
           e: w("ya wa li tha mi ra wen na hona ilea") },
      A: w("dawn plain spirit wind sun earth grass red thunder high cloud hill river sacred ancient"),
      B: w("hoof walker runner horn song mane hide stalker watcher strider whisper totem keeper seer"),
      cm: w("Bahawkcairn Hakotakorak Muhnnahtu Takodarahmo Okunisahnu Ahnokmakoma Holnartahkaw Bruhnkaleo"),
      cf: w("Shayanayawa Ahlimithata Irawenruena Alonakayahla Nahlaoyala Sakinatawna Winonalawa Haniaisha"),
      cl: w("Dawnstrider Plainswalker Spiritsong Windrunner Sunhoof Earthmother Grasswhisper Redhorn Thunderhoof")
    },
    troll: {
      m: { s: w("zanjin volrak razmak jinthok thokar zekram malzar rokmo hazaru darjin blachok drufen"), m: w("a o u i"),
           e: w("jin ja tai zar mbo kaya sa tho ru nak zuk grol voom") },
      f: { s: w("zinja jasaka yalavi naysha shathau lamizu layajana karaka izamoj anitaz ivoshiz"), m: w("a i u"),
           e: w("ja sa kaya la nai ra tha mi zha bongo tika") },
      A: w("voodoo bone jungle hex spirit drum swamp tusk sun mojo bright tide wild savage feral"),
      B: w("tusk drum whisper mojo tooth spear caller runner charm hex fang shade dancer ritualist"),
      cm: w("Zanjinvolrak Razmakjintho Thokarzekra Malzarrokmo Hazarudarjin Blachokdrufen Fenjingrom Hexzekjummal"),
      cf: w("Zinjajasaka Yalavinaysha Shathaulamizu Layajanakaraka Izamojanita Blazichaja Drukaflavi Gronaykaza"),
      cl: w("Voodoowhisper Bonedrum Junglerunner Hexcaller Spiritshade Drumfang Swamptusk Sunspear Mojotooth")
    },
    pandaren: {
      m: { s: w("baochen feigang haojunk aileiming nuoping qianruis hantaowe nxiangyu zhenbing congda"), m: w("a i u"),
           e: w("bo lin ming hua xiu yu jing fei zhi long yang wei") },
      f: { s: w("meilila nxiuyue yingfan gjialing qinghuib aichunla ndanefen guohuaj"), m: w("a i"),
           e: w("lin mei hua lan yu xia ling zhen rong yan xue yun") },
      A: w("stout cloud mist bamboo silk jade tea thunder river amber lotus lantern paper"),
      B: w("stout brew leaf foot paw step hand whisker breeze song master sage scholar"),
      cm: w("Baochenfeihu Gangminhaoran Junfengkaiwe Nleihanming Yunuowenping Anqianlirui Hanshanbotaoy"),
      cf: w("Meililinxia Lanyingyuel Anyingmeifa Ngzhijialin Gyuqingmeih Uilanruolans Huyitingting"),
      cl: w("Stormstout Cloudsong Mistwalker Bamboopaw Jadefoot Silkbrew Teaweaver Thunderstep Riverleaf Lotusbrew")
    },
    vulpera: {
      m: { s: w("zaviku ripipz ipnikf entikmo rukskit bixchit dapgobj iploprn ubquixs"), m: w("a i o u"),
           e: w("zi ka ko pip nik ra ssi rik dit fin zub gop") },
      f: { s: w("zivikup inikfet iksabix chipdap goblopn ub"), m: w("a i o"),
           e: w("zi ka ko pip nik ra ssi ela zub gop lix") },
      A: w("sand dust sly tail rag scrap dune quick red burr crumb tin nimble scurrying sneaky"),
      B: w("tail paw whisker scamp patch snout nose wrapper scurry dash forager glint trickster scavenger"),
      cm: w("Zavikuripip Zipniktikfe Ndittikmorukk Askitterbix Chitdapgobj Iploprnubqu Ixsnabber"),
      cf: w("Ziviku Pinikfetik Sabixchi Pdapgobj Loprnub Vikzip Fendano"),
      cl: w("Sandtail Dustwhisker Slypaw Ragwrapper Scrapscurry Duneforager Quicksnout Redglint Burrpatch")
    },
    dracthyr: {
      m: { s: w("aerdraky rnyxvaet hyzirixa saerhyor mvyrcael drunferr grysheloix armorv"), m: w("a e y o"),
           e: w("thys rax onyx yth iss ael orn ixa eth vyrn ara azur drel") },
      f: { s: w("aerdrakyr nyxvaeth yzirsaer hycaelfe rragrysh elomorva"), m: w("a e y"),
           e: w("thys ixa ael ara eth issa yra una ysa azura drelle") },
      A: w("sky ember ash wing scale azure storm gale obsidian ruby emerald dawn draconic ancient"),
      B: w("wing flight breath scale claw fire soar talon born crest song fang dragonkin wyrmheart"),
      cm: w("Aerthysdrakyr Kyraxnyxoth Vaelorthyrax Ziraelixavar Saeronrhyth Ormyxvyrneth Azurioncaldrax"),
      cf: w("Aerixadrayra Kyraelnyxara Vaelisathyra Ziraelsaeryn Rhyssaauryxa Caelythdyraeth Elyxiafaethra"),
      cl: w("Skywing Emberflight Ashbreath Scalesong Azurefang Stormtalon Galecrest Obsidianclaw Rubyfire Draconicwing")
    },
    earthen: {
      m: { s: w("bordurgr ankormag stentorur basc inflintr okcragdr alfelgolh arnmald"), m: w("a o i"),
           e: w("dun grim stone rok gar brik dar slate kor mar thrum grav helt") },
      f: { s: w("berclaing oreprysi lgemopaa gatcrysd orafluol apimicar"), m: w("a i e"),
           e: w("yl a ite dis na ora mina lith essa ina onite") },
      A: w("stone granite slate basalt flint gem deep quartz crag cinder marble ore obsidian mineral"),
      B: w("vein heart hammer delver wall shaper born core seeker chisel bound forge warden guardian"),
      cm: w("Bordundurgran Korstonemagrok Stentortorvald Urgrimbasalt Cinderflintar Rokmargranik Obsidianquartzin"),
      cf: w("Beryllaclarite Ingridoreana Pyritesilica Gemmaopalyn Agathajaspera Garnettaamberlyn Topazazircona"),
      cl: w("Stoneveil Graniteheart Slatehammer Basaltdelver Flintwall Gemshaper Deepborn Quartzcore Cragseeker")
    }
  };

  window.CJ_NAMES_EN = { classes: classes, races: races, cultures: cultures };
})();
