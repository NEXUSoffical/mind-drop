/**
 * MindDrop Curated Brain-Training Prompt Bank
 * Each prompt has 4 rarity tiers:
 * - common (200 pts): obvious answers everyone thinks of
 * - uncommon (500 pts): solid knowledge
 * - rare (800 pts): lateral thinking
 * - legendary (1000 pts): obscure deep-cut answers
 */

const ELEMENT_SYMBOLS = {
    h: 'hydrogen', he: 'helium', li: 'lithium', be: 'beryllium', b: 'boron', c: 'carbon', n: 'nitrogen', o: 'oxygen', f: 'fluorine', ne: 'neon',
    na: 'sodium', mg: 'magnesium', al: 'aluminum', si: 'silicon', p: 'phosphorus', s: 'sulfur', cl: 'chlorine', ar: 'argon', k: 'potassium', ca: 'calcium',
    sc: 'scandium', ti: 'titanium', v: 'vanadium', cr: 'chromium', mn: 'manganese', fe: 'iron', co: 'cobalt', ni: 'nickel', cu: 'copper', zn: 'zinc',
    ga: 'gallium', ge: 'germanium', as: 'arsenic', se: 'selenium', br: 'bromine', kr: 'krypton', rb: 'rubidium', sr: 'strontium', y: 'yttrium', zr: 'zirconium',
    nb: 'niobium', mo: 'molybdenum', tc: 'technetium', ru: 'ruthenium', rh: 'rhodium', pd: 'palladium', ag: 'silver', cd: 'cadmium', in: 'indium', sn: 'tin',
    sb: 'antimony', te: 'tellurium', i: 'iodine', xe: 'xenon', cs: 'cesium', ba: 'barium', la: 'lanthanum', ce: 'cerium', pr: 'praseodymium', nd: 'neodymium',
    pm: 'promethium', sm: 'samarium', eu: 'europium', gd: 'gadolinium', tb: 'terbium', dy: 'dysprosium', ho: 'holmium', er: 'erbium', tm: 'thulium', yb: 'ytterbium',
    lu: 'lutetium', hf: 'hafnium', ta: 'tantalum', w: 'tungsten', re: 'rhenium', os: 'osmium', ir: 'iridium', pt: 'platinum', au: 'gold', hg: 'mercury',
    tl: 'thallium', pb: 'lead', bi: 'bismuth', po: 'polonium', at: 'astatine', rn: 'radon', fr: 'francium', ra: 'radium', ac: 'actinium', th: 'thorium',
    pa: 'protactinium', u: 'uranium', np: 'neptunium', pu: 'plutonium', am: 'americium', cm: 'curium', bk: 'berkelium', cf: 'californium', es: 'einsteinium', fm: 'fermium',
    md: 'mendelevium', no: 'nobelium', lr: 'lawrencium', rf: 'rutherfordium', db: 'dubnium', sg: 'seaborgium', bh: 'bohrium', hs: 'hassium', mt: 'meitnerium', ds: 'darmstadtium',
    rg: 'roentgenium', cn: 'copernicium', nh: 'nihonium', fl: 'flerovium', mc: 'moscovium', lv: 'livermorium', ts: 'tennessine', og: 'oganesson',
};

const US_STATE_CODES = {
    al: 'alabama', ak: 'alaska', az: 'arizona', ar: 'arkansas', ca: 'california', co: 'colorado', ct: 'connecticut', de: 'delaware', fl: 'florida', ga: 'georgia',
    hi: 'hawaii', id: 'idaho', il: 'illinois', in: 'indiana', ia: 'iowa', ks: 'kansas', ky: 'kentucky', la: 'louisiana', me: 'maine', md: 'maryland',
    ma: 'massachusetts', mi: 'michigan', mn: 'minnesota', ms: 'mississippi', mo: 'missouri', mt: 'montana', ne: 'nebraska', nv: 'nevada', nh: 'new hampshire', nj: 'new jersey',
    nm: 'new mexico', ny: 'new york', nc: 'north carolina', nd: 'north dakota', oh: 'ohio', ok: 'oklahoma', or: 'oregon', pa: 'pennsylvania', ri: 'rhode island', sc: 'south carolina',
    sd: 'south dakota', tn: 'tennessee', tx: 'texas', ut: 'utah', vt: 'vermont', va: 'virginia', wa: 'washington', wv: 'west virginia', wi: 'wisconsin', wy: 'wyoming',
};

const PROMPTS = [
    {
        id: 'countries_europe',
        category: 'Geography',
        prompt: 'Name a country in Europe',
        common: ['france', 'germany', 'spain', 'italy', 'uk', 'united kingdom', 'england', 'poland', 'portugal', 'greece', 'netherlands', 'holland', 'sweden', 'norway', 'ireland', 'switzerland', 'belgium', 'austria', 'russia', 'ukraine'],
        uncommon: ['denmark', 'finland', 'czechia', 'czech republic', 'hungary', 'romania', 'croatia', 'serbia', 'bulgaria', 'slovakia', 'iceland', 'scotland', 'wales', 'belarus', 'lithuania', 'latvia', 'estonia', 'slovenia', 'albania', 'bosnia'],
        rare: ['luxembourg', 'malta', 'cyprus', 'montenegro', 'moldova', 'north macedonia', 'macedonia', 'kosovo', 'georgia', 'armenia', 'azerbaijan'],
        legendary: ['liechtenstein', 'andorra', 'monaco', 'san marino', 'vatican', 'vatican city', 'faroe islands'],
    },
    {
        id: 'fruits',
        category: 'Nature',
        prompt: 'Name a fruit',
        common: ['apple', 'banana', 'orange', 'strawberry', 'grape', 'watermelon', 'mango', 'pineapple', 'peach', 'pear', 'cherry', 'lemon', 'lime', 'blueberry', 'raspberry', 'kiwi', 'plum', 'melon', 'coconut', 'tomato'],
        uncommon: ['apricot', 'blackberry', 'cranberry', 'fig', 'grapefruit', 'guava', 'nectarine', 'papaya', 'pomegranate', 'tangerine', 'avocado', 'cantaloupe', 'honeydew', 'clementine', 'date', 'mandarin', 'passionfruit', 'passion fruit'],
        rare: ['dragonfruit', 'dragon fruit', 'lychee', 'persimmon', 'starfruit', 'star fruit', 'kumquat', 'mulberry', 'quince', 'boysenberry', 'elderberry', 'gooseberry', 'jackfruit', 'plantain', 'tamarind', 'pomelo', 'rhubarb'],
        legendary: ['rambutan', 'durian', 'mangosteen', 'cherimoya', 'soursop', 'feijoa', 'longan', 'salak', 'jabuticaba', 'ackee', 'kiwano', 'yuzu', 'loquat', 'medlar', 'pawpaw', 'miracle fruit', 'breadfruit', 'sapodilla', 'physalis'],
    },
    {
        id: 'elements',
        category: 'Science',
        prompt: 'Name an element on the Periodic Table',
        aliases: ELEMENT_SYMBOLS,
        common: ['hydrogen', 'helium', 'oxygen', 'carbon', 'nitrogen', 'gold', 'silver', 'iron', 'copper', 'sodium', 'chlorine', 'calcium', 'potassium', 'aluminum', 'aluminium', 'mercury', 'lead', 'tin', 'zinc', 'nickel', 'neon', 'uranium'],
        uncommon: ['lithium', 'magnesium', 'phosphorus', 'sulfur', 'sulphur', 'argon', 'titanium', 'chromium', 'manganese', 'cobalt', 'platinum', 'silicon', 'boron', 'fluorine', 'bromine', 'iodine', 'krypton', 'radon', 'plutonium', 'radium', 'tungsten', 'arsenic'],
        rare: ['beryllium', 'scandium', 'vanadium', 'gallium', 'germanium', 'selenium', 'rubidium', 'strontium', 'zirconium', 'molybdenum', 'palladium', 'cadmium', 'indium', 'antimony', 'tellurium', 'xenon', 'cesium', 'caesium', 'barium', 'bismuth', 'polonium', 'thorium'],
        legendary: ['ytterbium', 'yttrium', 'niobium', 'technetium', 'ruthenium', 'rhodium', 'lanthanum', 'cerium', 'praseodymium', 'neodymium', 'promethium', 'samarium', 'europium', 'gadolinium', 'terbium', 'dysprosium', 'holmium', 'erbium', 'thulium', 'lutetium', 'hafnium', 'tantalum', 'rhenium', 'osmium', 'iridium', 'thallium', 'astatine', 'francium', 'actinium', 'protactinium', 'neptunium', 'americium', 'curium', 'berkelium', 'californium', 'einsteinium', 'fermium', 'mendelevium', 'nobelium', 'lawrencium', 'rutherfordium', 'dubnium', 'seaborgium', 'bohrium', 'hassium', 'meitnerium', 'darmstadtium', 'roentgenium', 'copernicium', 'nihonium', 'flerovium', 'moscovium', 'livermorium', 'tennessine', 'oganesson'],
    },
    {
        id: 'animals_ocean',
        category: 'Wildlife',
        prompt: 'Name a sea or ocean creature',
        common: ['shark', 'whale', 'dolphin', 'octopus', 'crab', 'lobster', 'fish', 'jellyfish', 'starfish', 'turtle', 'sea turtle', 'seal', 'penguin', 'squid', 'clam', 'shrimp', 'eel', 'stingray', 'seahorse', 'clownfish', 'orca', 'salmon', 'tuna'],
        uncommon: ['walrus', 'manatee', 'narwhal', 'beluga', 'barracuda', 'swordfish', 'marlin', 'manta ray', 'hammerhead', 'sea urchin', 'sea cucumber', 'oyster', 'mussel', 'scallop', 'krill', 'plankton', 'coral', 'anemone', 'sea lion', 'otter', 'sea otter', 'pufferfish', 'blowfish', 'cod', 'herring', 'sardine', 'mackerel'],
        rare: ['cuttlefish', 'nautilus', 'moray eel', 'anglerfish', 'blobfish', 'sunfish', 'mola mola', 'oarfish', 'coelacanth', 'horseshoe crab', 'mantis shrimp', 'hermit crab', 'barnacle', 'sponge', 'lamprey', 'hagfish', 'dugong', 'porpoise', 'grouper', 'flounder', 'halibut', 'anchovy'],
        legendary: ['vampire squid', 'dumbo octopus', 'goblin shark', 'frilled shark', 'basking shark', 'megamouth shark', 'leafy seadragon', 'seadragon', 'siphonophore', 'comb jelly', 'ctenophore', 'tardigrade', 'nudibranch', 'isopod', 'giant isopod', 'fangtooth', 'viperfish', 'barreleye', 'chimaera', 'lanternfish', 'hatchetfish', 'gulper eel', 'yeti crab', 'bobbit worm', 'tuskfish', 'wobbegong'],
    },
    {
        id: 'programming_languages',
        category: 'Tech',
        prompt: 'Name a programming language',
        aliases: { js: 'javascript', ts: 'typescript', py: 'python', cpp: 'c++', cs: 'c#', rb: 'ruby' },
        common: ['python', 'javascript', 'java', 'c', 'c++', 'c#', 'html', 'css', 'sql', 'php', 'ruby', 'swift', 'kotlin', 'go', 'golang', 'rust', 'typescript', 'lua', 'luau'],
        uncommon: ['r', 'dart', 'scala', 'perl', 'bash', 'shell', 'powershell', 'matlab', 'objective-c', 'assembly', 'asm', 'groovy', 'elixir', 'haskell', 'clojure', 'f#', 'visual basic', 'vb', 'vba', 'delphi', 'pascal', 'fortran', 'cobol', 'scratch'],
        rare: ['zig', 'nim', 'julia', 'erlang', 'ocaml', 'lisp', 'scheme', 'racket', 'prolog', 'ada', 'solidity', 'vyper', 'move', 'cairo', 'crystal', 'd', 'gleam', 'odin', 'v', 'carbon', 'mojo', 'gdscript', 'hlsl', 'glsl', 'wgsl'],
        legendary: ['brainfuck', 'malbolge', 'whitespace', 'lolcode', 'befunge', 'smalltalk', 'forth', 'apl', 'j', 'k', 'q', 'cobol', 'algol', 'simula', 'eiffel', 'modula', 'oberon', 'mercury', 'idris', 'agda', 'coq', 'lean', 'futhark', 'pony', 'red', 'rebol', 'awk', 'sed', 'tcl', 'vala', 'haxe', 'actionscript', 'coldfusion', 'abap', 'apex', 'squirrel', 'wren', 'janet'],
    },
    {
        id: 'musical_instruments',
        category: 'Music',
        prompt: 'Name a musical instrument',
        common: ['piano', 'guitar', 'drums', 'violin', 'flute', 'trumpet', 'saxophone', 'sax', 'bass', 'cello', 'clarinet', 'harp', 'ukulele', 'keyboard', 'organ', 'trombone', 'tuba', 'harmonica', 'banjo', 'tambourine'],
        uncommon: ['oboe', 'bassoon', 'viola', 'mandolin', 'accordion', 'bagpipes', 'xylophone', 'marimba', 'bongos', 'congas', 'cymbals', 'triangle', 'recorder', 'piccolo', 'french horn', 'horn', 'sitar', 'gong', 'chimes', 'timpani', 'kazoo', 'synthesizer', 'synth'],
        rare: ['harpsichord', 'lute', 'lyre', 'zither', 'dulcimer', 'balalaika', 'bouzouki', 'didgeridoo', 'ocarina', 'pan flute', 'kalimba', 'thumb piano', 'vibraphone', 'glockenspiel', 'celesta', 'cornet', 'flugelhorn', 'euphonium', 'sousaphone', 'castanets', 'maracas', 'cowbell', 'djembe', 'tabla', 'cajon'],
        legendary: ['theremin', 'hurdy gurdy', 'hurdy-gurdy', 'glass harmonica', 'otamatone', 'hang drum', 'handpan', 'erhu', 'guzheng', 'koto', 'shamisen', 'shakuhachi', 'oud', 'kora', 'mbira', 'vuvuzela', 'alphorn', 'serpent', 'sackbut', 'crumhorn', 'shawm', 'nyckelharpa', 'bandoneon', 'concertina', 'melodica', 'stylophone', 'ondes martenot', 'chapman stick', 'keytar'],
    },
    {
        id: 'sports',
        category: 'Sports',
        prompt: 'Name a sport',
        common: ['football', 'soccer', 'basketball', 'baseball', 'tennis', 'golf', 'swimming', 'running', 'boxing', 'hockey', 'ice hockey', 'volleyball', 'rugby', 'cricket', 'cycling', 'skiing', 'snowboarding', 'surfing', 'skateboarding', 'wrestling', 'mma', 'ufc', 'karate', 'gymnastics'],
        uncommon: ['badminton', 'table tennis', 'ping pong', 'bowling', 'archery', 'fencing', 'rowing', 'sailing', 'kayaking', 'canoeing', 'diving', 'water polo', 'handball', 'lacrosse', 'field hockey', 'softball', 'squash', 'racquetball', 'polo', 'equestrian', 'judo', 'taekwondo', 'jujitsu', 'jiu jitsu', 'muay thai', 'kickboxing', 'triathlon', 'marathon', 'sprinting', 'weightlifting', 'powerlifting', 'climbing', 'bouldering', 'darts', 'snooker', 'billiards', 'pool', 'chess'],
        rare: ['curling', 'bobsled', 'bobsleigh', 'luge', 'skeleton', 'biathlon', 'decathlon', 'heptathlon', 'pentathlon', 'steeplechase', 'pole vault', 'javelin', 'discus', 'shot put', 'hammer throw', 'high jump', 'long jump', 'triple jump', 'netball', 'rounders', 'hurling', 'gaelic football', 'australian rules', 'afl', 'pickleball', 'padel', 'croquet', 'bocce', 'petanque', 'sumo', 'kendo', 'aikido', 'capoeira', 'parkour', 'bmx', 'motocross', 'rally', 'formula 1', 'f1', 'nascar', 'indycar'],
        legendary: ['sepak takraw', 'kabaddi', 'jai alai', 'bandy', 'floorball', 'korfball', 'fistball', 'tchoukball', 'bossaball', 'quidditch', 'quadball', 'underwater hockey', 'octopush', 'chess boxing', 'wife carrying', 'cheese rolling', 'shin kicking', 'caber toss', 'buzkashi', 'shinty', 'camogie', 'pesapallo', 'vigoro', 'pelota', 'real tennis', 'fives', 'eukonkanto', 'horseracing', 'dressage', 'eventing', 'orienteering', 'rogaining', 'freediving', 'spearfishing', 'kitesurfing', 'windsurfing', 'wakeboarding'],
    },
    {
        id: 'mythical_creatures',
        category: 'Mythology',
        prompt: 'Name a mythical or legendary creature',
        common: ['dragon', 'unicorn', 'phoenix', 'mermaid', 'vampire', 'werewolf', 'ghost', 'zombie', 'goblin', 'elf', 'dwarf', 'troll', 'ogre', 'giant', 'fairy', 'angel', 'demon', 'centaur', 'minotaur', 'pegasus', 'griffin', 'gryphon', 'kraken', 'bigfoot', 'yeti', 'medusa', 'cyclops', 'hydra', 'sphinx', 'genie'],
        uncommon: ['cerberus', 'chimera', 'basilisk', 'wyvern', 'banshee', 'leprechaun', 'pixie', 'gnome', 'orc', 'golem', 'gargoyle', 'harpy', 'siren', 'satyr', 'faun', 'nymph', 'dryad', 'valkyrie', 'poltergeist', 'wraith', 'lich', 'mummy', 'sasquatch', 'loch ness monster', 'nessie', 'chupacabra', 'mothman', 'wendigo', 'skinwalker', 'djinn', 'jinn', 'imp', 'gremlin', 'kobold', 'kelpie', 'selkie'],
        rare: ['manticore', 'cockatrice', 'hippogriff', 'roc', 'thunderbird', 'quetzalcoatl', 'leviathan', 'behemoth', 'ziz', 'fenrir', 'jormungandr', 'sleipnir', 'kitsune', 'tengu', 'oni', 'kappa', 'tanuki', 'yokai', 'kirin', 'qilin', 'baku', 'nue', 'raiju', 'wendigo', 'draugr', 'dullahan', 'pooka', 'brownie', 'redcap', 'spriggan', 'changeling', 'doppelganger', 'succubus', 'incubus', 'homunculus', 'efreet', 'ifrit', 'ghoul', 'rakshasa', 'garuda', 'naga', 'asura'],
        legendary: ['ammit', 'anubis', 'apophis', 'bunyip', 'drop bear', 'encantado', 'mapinguari', 'curupira', 'saci', 'tatzelwurm', 'wolpertinger', 'jackalope', 'skvader', 'hodag', 'snallygaster', 'jersey devil', 'flatwoods monster', 'loveland frog', 'nuckelavee', 'cat sidhe', 'cu sidhe', 'wulver', 'fomorians', 'baba yaga', 'leshy', 'domovoi', 'rusalka', 'vodyanoi', 'kikimora', 'firebird', 'alkonost', 'sirin', 'indrik', 'zmey', 'lindworm', 'faugn', 'tarasque', 'peluda', 'lou carcolh', 'dahu', 'questing beast', 'bonnacon', 'catoblepas', 'amphisbaena', 'yale', 'caladrius', 'simurgh', 'huma', 'peri', 'div', 'bahamut', 'kujata', 'zaratan', 'aspidochelone', 'scyllla', 'scylla', 'charybdis', 'echidna', 'typhon', 'orthrus', 'ladon', 'nemean lion', 'erymanthian boar', 'ceryneian hind', 'stymphalian birds'],
    },
    {
        id: 'capitals',
        category: 'Geography',
        prompt: 'Name a world capital city',
        common: ['london', 'paris', 'tokyo', 'washington', 'washington dc', 'berlin', 'madrid', 'rome', 'moscow', 'beijing', 'ottawa', 'canberra', 'dublin', 'amsterdam', 'brussels', 'lisbon', 'athens', 'cairo', 'seoul', 'bangkok', 'mexico city', 'brasilia', 'new delhi', 'delhi'],
        uncommon: ['stockholm', 'oslo', 'copenhagen', 'helsinki', 'reykjavik', 'vienna', 'bern', 'prague', 'warsaw', 'budapest', 'bucharest', 'sofia', 'belgrade', 'zagreb', 'kyiv', 'kiev', 'ankara', 'jerusalem', 'riyadh', 'abu dhabi', 'doha', 'tehran', 'baghdad', 'nairobi', 'pretoria', 'rabat', 'algiers', 'tunis', 'buenos aires', 'santiago', 'lima', 'bogota', 'caracas', 'havana', 'kingston', 'manila', 'jakarta', 'hanoi', 'kuala lumpur', 'singapore', 'wellington', 'taipei', 'islamabad', 'dhaka', 'kathmandu'],
        rare: ['ljubljana', 'bratislava', 'tallinn', 'riga', 'vilnius', 'minsk', 'chisinau', 'skopje', 'tirana', 'podgorica', 'sarajevo', 'pristina', 'nicosia', 'valletta', 'luxembourg', 'tbilisi', 'yerevan', 'baku', 'astana', 'tashkent', 'bishkek', 'dushanbe', 'ashgabat', 'ulaanbaatar', 'phnom penh', 'vientiane', 'naypyidaw', 'colombo', 'male', 'thimphu', 'muscat', 'manama', 'kuwait city', 'amman', 'beirut', 'damascus', 'sanaa', 'addis ababa', 'accra', 'abuja', 'dakar', 'kampala', 'kigali', 'lusaka', 'harare', 'maputo', 'luanda', 'kinshasa', 'yaounde', 'antananarivo', 'montevideo', 'asuncion', 'quito', 'la paz', 'sucre', 'panama city', 'san jose', 'managua', 'tegucigalpa', 'san salvador', 'guatemala city', 'santo domingo', 'port-au-prince', 'nassau'],
        legendary: ['vaduz', 'andorra la vella', 'san marino', 'monaco', 'vatican city', 'bandar seri begawan', 'dili', 'suva', 'port moresby', 'apia', 'nuku alofa', 'funafuti', 'tarawa', 'majuro', 'palikir', 'ngerulmud', 'yaren', 'honiara', 'port vila', 'ouagadougou', 'niamey', 'bamako', 'ndjamena', 'bangui', 'libreville', 'malabo', 'brazzaville', 'juba', 'asmara', 'djibouti', 'mogadishu', 'gitega', 'lilongwe', 'gaborone', 'windhoek', 'mbabane', 'maseru', 'port louis', 'victoria', 'moroni', 'praia', 'banjul', 'bissau', 'conakry', 'freetown', 'monrovia', 'yamoussoukro', 'lome', 'porto-novo', 'sao tome', 'nouakchott', 'paramaribo', 'georgetown', 'belmopan', 'bridgetown', 'castries', 'kingstown', 'st georges', 'roseau', 'st johns', 'basseterre', 'port of spain'],
    },
    {
        id: 'car_brands',
        category: 'Culture',
        prompt: 'Name a car brand or manufacturer',
        common: ['ford', 'toyota', 'honda', 'bmw', 'mercedes', 'mercedes-benz', 'audi', 'volkswagen', 'vw', 'nissan', 'chevrolet', 'chevy', 'tesla', 'ferrari', 'lamborghini', 'porsche', 'hyundai', 'kia', 'jeep', 'dodge', 'subaru', 'mazda', 'volvo', 'lexus', 'jaguar', 'land rover', 'range rover', 'mini', 'fiat', 'renault', 'peugeot', 'vauxhall', 'opel'],
        uncommon: ['bentley', 'rolls-royce', 'rolls royce', 'aston martin', 'mclaren', 'bugatti', 'maserati', 'alfa romeo', 'cadillac', 'buick', 'gmc', 'chrysler', 'ram', 'lincoln', 'acura', 'infiniti', 'mitsubishi', 'suzuki', 'isuzu', 'skoda', 'seat', 'cupra', 'citroen', 'dacia', 'saab', 'smart', 'lotus', 'rivian', 'lucid', 'polestar', 'genesis', 'byd', 'mg'],
        rare: ['koenigsegg', 'pagani', 'rimac', 'hennessey', 'ssc', 'noble', 'tvr', 'morgan', 'caterham', 'ariel', 'bac', 'alpine', 'lancia', 'abarth', 'ds', 'lada', 'tatra', 'holden', 'hsv', 'proton', 'perodua', 'tata', 'mahindra', 'geely', 'nio', 'xpeng', 'li auto', 'chery', 'great wall', 'haval', 'ssangyong', 'kgm', 'daihatsu', 'pontiac', 'oldsmobile', 'saturn', 'hummer', 'scion', 'mercury', 'plymouth', 'studebaker', 'packard', 'delorean', 'fisker', 'vinfast', 'karma'],
        legendary: ['spyker', 'gumpert', 'apollo', 'zenvo', 'w motors', 'pininfarina', 'italdesign', 'zagato', 'bertone', 'de tomaso', 'iso', 'bizzarrini', 'venturi', 'facel vega', 'delahaye', 'delage', 'hispanosuiza', 'hispano-suiza', 'voisin', 'puch', 'steyr', 'wartburg', 'trabant', 'barkas', 'borgward', 'nsu', 'dkw', 'horch', 'wanderer', 'maybach', 'alpina', 'brabus', 'ruf', 'singer', 'gordon murray', 'czinger', 'drako', 'faraday future', 'canoo', 'bollinger', 'mullen', 'inneos', 'ineos', 'donkervoort', 'wiesmann', 'ktm', 'ginetta', 'marcos', 'jensen', 'bristol', 'alvis', 'riley', 'wolseley', 'austin', 'morris', 'triumph', 'rover', 'hillman', 'sunbeam', 'humber', 'singer', 'tucker', 'cord', 'auburn', 'duesenberg', 'pierce-arrow', 'vector', 'saleen', 'panoz', 'rossion', 'mosler', 'callaway', 'mitsuoka', 'tommykaira', 'dome'],
    },
    {
        id: 'video_games',
        category: 'Gaming',
        prompt: 'Name a video game',
        common: ['minecraft', 'roblox', 'fortnite', 'gta', 'grand theft auto', 'call of duty', 'cod', 'fifa', 'fc', 'mario', 'super mario', 'pokemon', 'zelda', 'valorant', 'league of legends', 'csgo', 'counter strike', 'apex legends', 'overwatch', 'among us', 'tetris', 'pacman', 'pac-man', 'sonic', 'halo', 'doom', 'skyrim', 'elden ring'],
        uncommon: ['terraria', 'stardew valley', 'fall guys', 'rocket league', 'destiny', 'cyberpunk 2077', 'red dead redemption', 'god of war', 'the last of us', 'uncharted', 'spider-man', 'fallout', 'witcher', 'the witcher', 'dark souls', 'bloodborne', 'sekiro', 'portal', 'half-life', 'half life', 'left 4 dead', 'team fortress', 'dota', 'world of warcraft', 'wow', 'runescape', 'genshin impact', 'brawl stars', 'clash royale', 'clash of clans', 'subway surfers', 'geometry dash'],
        rare: ['hollow knight', 'celeste', 'hades', 'undertale', 'deltarune', 'cuphead', 'subnautica', 'factorio', 'rimworld', 'outer wilds', 'disco elysium', 'baldurs gate', 'mass effect', 'bioshock', 'dishonored', 'metal gear solid', 'silent hill', 'resident evil', 'monster hunter', 'persona', 'final fantasy', 'kingdom hearts', 'chrono trigger', 'earthbound', 'metroid', 'castlevania', 'splatoon', 'animal crossing', 'pikmin', 'kirby', 'smash bros'],
        legendary: ['noita', 'kenshi', 'dwarf fortress', 'caves of qud', 'rain world', 'return of the obra dinn', 'obra dinn', 'tunic', 'fez', 'braid', 'limbo', 'inside', 'katana zero', 'hotline miami', 'ultrakill', 'dusk', 'signalis', 'inscryption', 'slay the spire', 'balatro', 'vampire survivors', 'risk of rain', 'deep rock galactic', 'valheim', 'project zomboid', 'barotrauma', 'cruelty squad', 'pathologic', 'fear and hunger', 'lisa', 'omori', 'oneshot', 'yume nikki', 'cave story', 'spelunky', 'ftl', 'into the breach', 'baba is you', 'papers please', 'stanley parable', 'antichamber', 'superliminal', 'manifold garden'],
    },
    {
        id: 'superheroes',
        category: 'Pop Culture',
        prompt: 'Name a superhero or comic book villain',
        common: ['batman', 'superman', 'spider-man', 'spiderman', 'iron man', 'ironman', 'captain america', 'thor', 'hulk', 'black widow', 'wonder woman', 'flash', 'the flash', 'aquaman', 'joker', 'thanos', 'loki', 'deadpool', 'wolverine', 'venom', 'black panther', 'doctor strange', 'ant-man', 'antman', 'green lantern', 'robin', 'harley quinn', 'catwoman'],
        uncommon: ['scarlet witch', 'vision', 'hawkeye', 'falcon', 'winter soldier', 'bucky', 'star-lord', 'groot', 'rocket', 'gamora', 'drax', 'daredevil', 'punisher', 'luke cage', 'jessica jones', 'iron fist', 'ghost rider', 'blade', 'silver surfer', 'magneto', 'professor x', 'cyclops', 'storm', 'jean grey', 'nightcrawler', 'gambit', 'rogue', 'beast', 'mystique', 'lex luthor', 'green goblin', 'doctor octopus', 'doc ock', 'sandman', 'electro', 'mysterio', 'riddler', 'penguin', 'two-face', 'bane', 'scarecrow', 'poison ivy', 'cyborg', 'shazam', 'supergirl', 'batgirl', 'nightwing', 'red hood', 'green arrow'],
        rare: ['moon knight', 'ms marvel', 'she-hulk', 'shang-chi', 'eternals', 'adam warlock', 'nova', 'sentry', 'hyperion', 'namor', 'black bolt', 'medusa', 'doctor doom', 'galactus', 'kang', 'ultron', 'kingpin', 'bullseye', 'taskmaster', 'carnage', 'kraven', 'morbius', 'mephisto', 'dormammu', 'darkseid', 'brainiac', 'deathstroke', 'sinestro', 'reverse flash', 'black adam', 'constantine', 'zatanna', 'martian manhunter', 'hawkgirl', 'raven', 'starfire', 'beast boy', 'blue beetle', 'booster gold', 'invincible', 'omni-man', 'homelander', 'spawn', 'hellboy'],
        legendary: ['squirrel girl', 'howard the duck', 'beta ray bill', 'man-thing', 'swamp thing', 'animal man', 'plastic man', 'elongated man', 'the question', 'question', 'rorschach', 'doctor manhattan', 'nite owl', 'ozymandias', 'ambush bug', 'kite man', 'condiment king', 'polka-dot man', 'calendar man', 'clock king', 'gentleman ghost', 'etrigan', 'deadman', 'spectre', 'doctor fate', 'mister miracle', 'big barda', 'orion', 'lobo', 'larfleeze', 'atrocitus', 'doomsday', 'mr mxyzptlk', 'bat-mite', 'mojo', 'spiral', 'longshot', 'dazzler', 'jubilee', 'forged', 'forge', 'bishop', 'cable', 'domino', 'fantome', 'fantomex', 'legion', 'molecule man', 'beyonder', 'living tribunal', 'the watcher', 'uatu', 'annihilus', 'modok', 'armin zola', 'baron zemo', 'red skull', 'crossbones', 'batroc'],
    },
    {
        id: 'dog_breeds',
        category: 'Animals',
        prompt: 'Name a dog breed',
        common: ['labrador', 'golden retriever', 'german shepherd', 'bulldog', 'french bulldog', 'poodle', 'beagle', 'pug', 'chihuahua', 'husky', 'siberian husky', 'rottweiler', 'dachshund', 'sausage dog', 'boxer', 'corgi', 'dalmatian', 'doberman', 'pitbull', 'shih tzu', 'yorkshire terrier', 'yorkie', 'pomeranian', 'border collie', 'collie', 'greyhound', 'great dane'],
        uncommon: ['australian shepherd', 'cocker spaniel', 'springer spaniel', 'jack russell', 'staffy', 'staffordshire bull terrier', 'bull terrier', 'shiba inu', 'akita', 'samoyed', 'malamute', 'alaskan malamute', 'saint bernard', 'bernese mountain dog', 'newfoundland', 'mastiff', 'cane corso', 'chow chow', 'bichon frise', 'maltese', 'whippet', 'basset hound', 'bloodhound', 'pointer', 'setter', 'irish setter', 'weimaraner', 'vizsla', 'schnauzer', 'westie', 'scottish terrier', 'airedale', 'cavalier', 'papillon', 'pekingese', 'lhasa apso', 'shar pei'],
        rare: ['basenji', 'borzoi', 'saluki', 'afghan hound', 'irish wolfhound', 'rhodesian ridgeback', 'belgian malinois', 'malinois', 'kelpie', 'cattle dog', 'heeler', 'blue heeler', 'shiba', 'keeshond', 'spitz', 'schipperke', 'havanese', 'coton de tulear', 'puli', 'komondor', 'kuvasz', 'leonberger', 'great pyrenees', 'tibetan mastiff', 'boerboel', 'dogo argentino', 'presa canario', 'pharaoh hound', 'ibizan hound', 'plott hound', 'coonhound', 'foxhound', 'harrier', 'otterhound', 'brittany', 'chesapeake bay retriever', 'flat-coated retriever', 'toller'],
        legendary: ['xoloitzcuintli', 'xolo', 'azawakh', 'sloughi', 'lundehund', 'norwegian lundehund', 'lagotto romagnolo', 'bergamasco', 'briard', 'beauceron', 'picardy spaniel', 'barbet', 'mudi', 'pumi', 'karelian bear dog', 'finnish lapphund', 'swedish vallhund', 'eurasier', 'hovawart', 'affenpinscher', 'brussels griffon', 'bedlington terrier', 'dandie dinmont', 'glen of imaal', 'kerry blue terrier', 'sealyham terrier', 'skye terrier', 'manchester terrier', 'rat terrier', 'chinook', 'catahoula', 'carolina dog', 'thai ridgeback', 'korean jindo', 'jindo', 'kai ken', 'kishu', 'shikoku', 'hokkaido', 'tosa', 'canaan dog', 'bohemian shepherd', 'bolognese', 'lowchen', 'cirneco dell etna', 'portuguese podengo', 'podengo', 'stabyhoun', 'kooikerhondje'],
    },
    {
        id: 'dinosaurs',
        category: 'Prehistory',
        prompt: 'Name a dinosaur or prehistoric creature',
        common: ['t-rex', 'trex', 'tyrannosaurus', 'tyrannosaurus rex', 'triceratops', 'velociraptor', 'raptor', 'stegosaurus', 'brachiosaurus', 'diplodocus', 'pterodactyl', 'pteranodon', 'spinosaurus', 'ankylosaurus', 'brontosaurus', 'mammoth', 'woolly mammoth', 'sabertooth', 'megalodon'],
        uncommon: ['allosaurus', 'carnotaurus', 'giganotosaurus', 'baryonyx', 'dilophosaurus', 'compy', 'compsognathus', 'gallimimus', 'iguanodon', 'parasaurolophus', 'pachycephalosaurus', 'apatosaurus', 'argentinosaurus', 'mosasaurus', 'plesiosaurus', 'ichthyosaurus', 'dimetrodon', 'archaeopteryx', 'dodo', 'smilodon', 'trilobite', 'ammonite'],
        rare: ['therizinosaurus', 'deinonychus', 'utahraptor', 'microraptor', 'oviraptor', 'troodon', 'carcharodontosaurus', 'acrocanthosaurus', 'ceratosaurus', 'majungasaurus', 'suchomimus', 'deinocheirus', 'amargasaurus', 'titanosaurus', 'dreadnoughtus', 'edmontosaurus', 'corythosaurus', 'maiasaura', 'styracosaurus', 'protoceratops', 'kentrosaurus', 'euoplocephalus', 'quetzalcoatlus', 'liopleurodon', 'kronosaurus', 'dunkleosteus', 'helicoprion', 'sarcosuchus', 'titanoboa', 'argentavis', 'megatherium', 'glyptodon'],
        legendary: ['anomalocaris', 'hallucigenia', 'opabinia', 'tiktaalik', 'coelophysis', 'herrerasaurus', 'eoraptor', 'plateosaurus', 'cryolophosaurus', 'yutyrannus', 'nanotyrannus', 'tarbosaurus', 'daspletosaurus', 'albertosaurus', 'gorgosaurus', 'mapusaurus', 'oxalaia', 'irritator', 'concavenator', 'megalosaurus', 'torvosaurus', 'saurophaganax', 'sinraptor', 'monolophosaurus', 'guanlong', 'psittacosaurus', 'microceratus', 'pachyrhinosaurus', 'kosmoceratops', 'nasutoceratops', 'chasmo', 'chasmosaurus', 'minmi', 'nodosaurus', 'borealopelta', 'shunosaurus', 'mamenchisaurus', 'nigersaurus', 'saltasaurus', 'hatzegopteryx', 'tapejara', 'rhamphorhynchus', 'elasmosaurus', 'shonisaurus', 'basilosaurus', 'livyatan', 'arthropleura', 'meganeura', 'pulmonoscorpius', 'jaekelopterus', 'eurypterid', 'gorgonopsid', 'inostrancevia', 'lystrosaurus', 'postoshuchus', 'postosuchus', 'kaprosuchus', 'deinosuchus', 'purussaurus', 'terror bird', 'phorusrhacos', 'andrewsarchus', 'paraceratherium', 'elasmotherium'],
    },
    {
        id: 'space_objects',
        category: 'Space',
        prompt: 'Name a planet, moon, star, or space object',
        common: ['earth', 'mars', 'jupiter', 'saturn', 'venus', 'mercury', 'uranus', 'neptune', 'pluto', 'sun', 'moon', 'black hole', 'asteroid', 'comet', 'meteor', 'star', 'galaxy', 'milky way', 'nebula', 'supernova', 'iss', 'satellite'],
        uncommon: ['europa', 'titan', 'io', 'ganymede', 'callisto', 'phobos', 'deimos', 'triton', 'enceladus', 'andromeda', 'polaris', 'north star', 'sirius', 'betelgeuse', 'alpha centauri', 'proxima centauri', 'halley', 'halleys comet', 'kuiper belt', 'oort cloud', 'ceres', 'eris', 'pulsar', 'quasar', 'neutron star', 'white dwarf', 'red giant', 'red dwarf', 'exoplanet', 'wormhole', 'dark matter'],
        rare: ['charon', 'mimas', 'iapetus', 'rhea', 'dione', 'tethys', 'miranda', 'ariel', 'umbriel', 'titania', 'oberon', 'makemake', 'haumea', 'sedna', 'vesta', 'pallas', 'rigel', 'vega', 'altair', 'antares', 'aldebaran', 'arcturus', 'canopus', 'capella', 'spica', 'deneb', 'orion nebula', 'crab nebula', 'horsehead nebula', 'pillars of creation', 'triangulum', 'whirlpool galaxy', 'sombrero galaxy', 'magnetar', 'brown dwarf', 'blazar', 'rogue planet', 'dyson sphere'],
        legendary: ['oumuamua', 'borisov', 'apophis', 'bennu', 'ryugu', 'arrokoth', 'chiron', 'quaoar', 'orcus', 'gonggong', 'hygiea', 'psyche', '16 psyche', 'pan', 'atlas', 'prometheus', 'phoebe', 'hyperion', 'amalthea', 'himalia', 'proteus', 'nereid', 'trappist-1', 'kepler-186f', 'kepler-22b', 'hd 189733b', '55 cancri e', 'uy scuti', 'vy canis majoris', 'stephenson 2-18', 'ton 618', 'sagittarius a', 'm87', 'cygnus x-1', 'tabbys star', 'barnards star', 'wolf 359', 'epsilion eridani', 'tau ceti', 'eta carinae', 'bellatrix', 'fomalhaut', 'achernar', 'hadar', 'acrux', 'mimosa', 'regulus', 'castor', 'pollux', 'procyon', 'boote void', 'bootes void', 'great attractor', 'laniakea', 'virgo supercluster'],
    },
    {
        id: 'vegetables',
        category: 'Food',
        prompt: 'Name a vegetable',
        common: ['carrot', 'broccoli', 'potato', 'onion', 'garlic', 'lettuce', 'spinach', 'cucumber', 'pepper', 'bell pepper', 'corn', 'peas', 'beans', 'green beans', 'cabbage', 'cauliflower', 'celery', 'mushroom', 'pumpkin', 'sweet potato', 'zucchini', 'courgette', 'eggplant', 'aubergine', 'radish', 'beetroot', 'beet'],
        uncommon: ['asparagus', 'artichoke', 'brussels sprouts', 'brussel sprouts', 'kale', 'leek', 'parsnip', 'turnip', 'swede', 'rutabaga', 'squash', 'butternut squash', 'acorn squash', 'yam', 'shallot', 'scallion', 'spring onion', 'chive', 'chives', 'ginger', 'fennel', 'okra', 'bok choy', 'pak choi', 'watercress', 'arugula', 'rocket', 'chard', 'swiss chard', 'rhubarb', 'chickpea', 'lentil', 'edamame', 'soybean'],
        rare: ['kohlrabi', 'celeriac', 'endive', 'radicchio', 'chicory', 'escarole', 'collard greens', 'mustard greens', 'turnip greens', 'daikon', 'jicama', 'taro', 'cassava', 'yuca', 'lotus root', 'bamboo shoot', 'water chestnut', 'horseradish', 'wasabi', 'turmeric', 'jerusalem artichoke', 'sunchoke', 'spaghetti squash', 'pattypan', 'chayote', 'bitter melon', 'napa cabbage', 'savoy cabbage', 'broccolini', 'romanesco'],
        legendary: ['salsify', 'scorzonera', 'cardoon', 'samphire', 'sea beans', 'purslane', 'sorrel', 'lovage', 'borage', 'mache', 'lambs lettuce', 'tatsoi', 'mizuna', 'komatsuna', 'gai lan', 'choy sum', 'yu choy', 'celtuce', 'crosne', 'oca', 'ulluco', 'mashua', 'arracacha', 'yacon', 'malanga', 'eddoe', 'dasheen', 'burdock', 'gobo', 'tinda', 'parwal', 'luffa', 'ridge gourd', 'bottle gourd', 'calabash', 'snake gourd', 'ash gourd', 'nopales', 'fiddlehead', 'fiddlehead fern', 'ramps', 'skirret', 'good king henry', 'orach', 'sea kale', 'tiger nut'],
    },
    {
        id: 'birds',
        category: 'Wildlife',
        prompt: 'Name a bird',
        common: ['eagle', 'owl', 'penguin', 'parrot', 'crow', 'raven', 'pigeon', 'dove', 'seagull', 'duck', 'goose', 'swan', 'chicken', 'rooster', 'turkey', 'flamingo', 'peacock', 'ostrich', 'robin', 'sparrow', 'hawk', 'falcon', 'hummingbird', 'woodpecker', 'pelican', 'stork', 'toucan', 'canary', 'budgie'],
        uncommon: ['albatross', 'vulture', 'condor', 'osprey', 'kestrel', 'harrier', 'buzzard', 'kite', 'magpie', 'jay', 'blue jay', 'cardinal', 'starling', 'blackbird', 'thrush', 'finch', 'goldfinch', 'wren', 'swallow', 'swift', 'kingfisher', 'heron', 'egret', 'crane', 'ibis', 'puffin', 'gannet', 'cormorant', 'emu', 'kiwi', 'macaw', 'cockatoo', 'cockatiel', 'parakeet', 'pheasant', 'quail', 'grouse', 'partridge', 'guinea fowl', 'cuckoo', 'nightingale', 'lark', 'meadowlark', 'oriole', 'tanager', 'warbler', 'chickadee', 'nuthatch', 'mockingbird'],
        rare: ['cassowary', 'shoebill', 'secretarybird', 'secretary bird', 'kakapo', 'kea', 'kookaburra', 'lyrebird', 'bowerbird', 'bird of paradise', 'quetzal', 'hoatzin', 'roadrunner', 'emu', 'rhea', 'tinamou', 'spoonbill', 'avocet', 'plover', 'sandpiper', 'curlew', 'oystercatcher', 'tern', 'skua', 'frigatebird', 'booby', 'blue-footed booby', 'petrel', 'shearwater', 'fulmar', 'grebe', 'loon', 'coot', 'moorhen', 'bittern', 'lapwing', 'snipe', 'woodcock', 'bustard', 'hornbill', 'hoopoe', 'bee-eater', 'roller', 'trogon', 'motmot', 'jacamar', 'puffbird', 'barbet', 'honeyguide', 'pitta', 'broadbill', 'cotinga', 'manakin', 'antbird', 'ovenbird', 'shrike', 'drongo', 'waxwing', 'dipper', 'crossbill', 'bunting', 'grosbeak', 'junco', 'grackle', 'cowbird'],
        legendary: ['potu', 'potoo', 'frogmouth', 'tawny frogmouth', 'oilbird', 'nightjar', 'whippoorwill', 'kagu', 'sunbittern', 'seriema', 'trumpeter', 'limpkin', 'finfoot', 'mesite', 'sandgrouse', 'turaco', 'mousebird', 'cuckoo roller', 'ground roller', 'tody', 'asity', 'sapayoa', 'rifleman', 'scrubbird', 'bristlebird', 'pardalote', 'thornbill', 'sitella', 'whistler', 'shriketit', 'bellbird', 'wattlebird', 'stitchbird', 'kokako', 'saddleback', 'huia', 'takahe', 'weka', 'moa', 'elephant bird', 'great auk', 'passenger pigeon', 'carolina parakeet', 'ivory-billed woodpecker', 'harpy eagle', 'philippine eagle', 'lammergeier', 'bearded vulture', 'marabou stork', 'jabiru', 'hammerkop', 'hamerkop', 'himalayan monal', 'golden pheasant', 'argus pheasant', 'maleo', 'megapode', 'brush turkey', 'screamer', 'magpie goose', 'steamer duck', 'torrent duck', 'harlequin duck', 'eider', 'scoter', 'merganser', 'smew', 'saker falcon', 'gyrfalcon', 'merlin', 'hobby', 'caracara', 'bateleur', 'goshawk', 'sparrowhawk'],
    },
    {
        id: 'colors',
        category: 'Art & Design',
        prompt: 'Name a color or shade',
        common: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'grey', 'gray', 'brown', 'gold', 'silver', 'cyan', 'magenta', 'violet', 'indigo', 'turquoise', 'teal', 'navy', 'maroon', 'beige', 'cream', 'lime', 'olive', 'peach', 'coral', 'lavender', 'mint'],
        uncommon: ['crimson', 'scarlet', 'burgundy', 'ruby', 'amber', 'ochre', 'mustard', 'emerald', 'jade', 'sage', 'forest green', 'aqua', 'aquamarine', 'azure', 'cobalt', 'sapphire', 'cerulean', 'sky blue', 'royal blue', 'periwinkle', 'lilac', 'plum', 'mauve', 'fuchsia', 'rose', 'salmon', 'apricot', 'bronze', 'copper', 'tan', 'khaki', 'taupe', 'charcoal', 'slate', 'ivory', 'pearl', 'ebony', 'jet', 'mahogany', 'chestnut', 'auburn', 'sienna', 'umber', 'terracotta', 'rust'],
        rare: ['chartreuse', 'vermilion', 'carmine', 'alizarin', 'cerise', 'amaranth', 'puce', 'heliotrope', 'byzantium', 'amethyst', 'ultramarine', 'prussian blue', 'phthalo blue', 'cornflower', 'glaucous', 'viridian', 'celadon', 'malachite', 'verdigris', 'absinthe', 'pistachio', 'citrine', 'saffron', 'gamboge', 'aureolin', 'ecru', 'buff', 'flax', 'champagne', 'sepia', 'bistre', 'cinnabar', 'persimmon', 'tangerine', 'fulvous', 'russet', 'sorrel', 'dun', 'fawn', 'ash', 'pewter', 'gunmetal', 'obsidian', 'onyx'],
        legendary: ['smaragdine', 'coquelicot', 'sarcoline', 'incarnadine', 'xanthic', 'flavescent', 'luteous', 'rufous', 'ferruginous', 'badious', 'castaneous', 'brunneous', 'fuscous', 'piceous', 'atramentous', 'cinereous', 'plumbeous', 'caesious', 'livid', 'glaucous', 'prasinous', 'porraceous', 'virescent', 'aeruginous', 'cyaneous', 'caerulean', 'violaceous', 'ianthine', 'purpure', 'tyrian purple', 'han purple', 'maya blue', 'egyptian blue', 'yinmn blue', 'vantablack', 'eigengrau', 'feldgrau', 'paynes grey', 'davys grey', 'isabelline', 'nattier', 'zomp', 'skobeloff', 'wenge', 'bole', 'caput mortuum', 'mummy brown', 'drake', 'falu red', 'venetian red', 'sinopia', 'minium', 'orpiment', 'realgar', 'stygian blue', 'hyperbolic orange', 'self-luminous red'],
    },
    {
        id: 'board_games',
        category: 'Games',
        prompt: 'Name a board game or tabletop game',
        common: ['monopoly', 'chess', 'checkers', 'draughts', 'scrabble', 'clue', 'cluedo', 'risk', 'battleship', 'connect four', 'connect 4', 'uno', 'jenga', 'sorry', 'life', 'game of life', 'yahtzee', 'trivial pursuit', 'pictionary', 'candyland', 'snakes and ladders', 'chutes and ladders', 'ludo', 'operation', 'twister', 'guess who', 'dominoes', 'poker', 'blackjack'],
        uncommon: ['catan', 'settlers of catan', 'ticket to ride', 'carcassonne', 'pandemic', 'codenames', 'azul', 'splendor', 'wingspan', 'dixit', 'exploding kittens', 'cards against humanity', 'apples to apples', 'taboo', 'scattergories', 'boggle', 'bananagrams', 'rummikub', 'mahjong', 'backgammon', 'go', 'othello', 'reversi', 'mancala', 'chinese checkers', 'parcheesi', 'stratego', 'axis and allies', 'dungeons and dragons', 'dnd', 'warhammer', 'magic the gathering', 'mtg', 'yugioh', 'munchkin', 'coup', 'werewolf', 'mafia', 'avalon', 'secret hitler'],
        rare: ['gloomhaven', 'terraforming mars', 'scythe', 'root', 'spirit island', 'brass birmingham', 'brass', 'ark nova', 'dune imperium', 'everdell', '7 wonders', 'seven wonders', 'dominion', 'agricola', 'puerto rico', 'power grid', 'twilight struggle', 'twilight imperium', 'eclipse', 'betrayal at house on the hill', 'arkham horror', 'eldritch horror', 'mansions of madness', 'dead of winter', 'nemesis', 'blood rage', 'rising sun', 'kemet', 'inis', 'concordia', 'viticulture', 'caverna', 'le havre', 'patchwork', 'jaipur', 'hive', 'santorini', 'onitama', 'tak', 'shogi', 'xiangqi', 'cribbage', 'euchre', 'bridge', 'canasta', 'pinochle'],
        legendary: ['senet', 'royal game of ur', 'ur', 'hnefatafl', 'tafl', 'patolli', 'pachisi', 'chaturanga', 'shatranj', 'makruk', 'janggi', 'renju', 'gomoku', 'hex', 'twixt', 'abalone', 'blokus', 'quoridor', 'quarto', 'pylos', 'yinsh', 'dvonn', 'gipf', 'tzaar', 'zertz', 'lyngk', 'tigris and euphrates', 'el grande', 'ra', 'modern art', 'high society', 'for sale', 'no thanks', '6 nimmt', 'cockroach poker', 'skull', 'hanabi', 'the crew', 'wavelength', 'deception', 'mysterium', 'cosmic encounter', 'diplomacy', '1830', 'food chain magnate', 'antiquity', 'indonesia', 'roads and boats', 'mage knight', 'through the ages', 'a feast for odin', 'castles of burgundy', 'hans teutonica', 'hansa teutonica', 'pax pamir', 'john company', 'oath', 'oathsworn', 'kingdom death', 'frosthaven'],
    },
    {
        id: 'human_body',
        category: 'Science',
        prompt: 'Name a human bone, muscle, or organ',
        common: ['heart', 'brain', 'lungs', 'lung', 'liver', 'stomach', 'kidney', 'kidneys', 'skin', 'skull', 'spine', 'rib', 'ribs', 'femur', 'jaw', 'pelvis', 'bicep', 'biceps', 'tricep', 'triceps', 'abs', 'quad', 'quads', 'hamstring', 'calf', 'glutes', 'tongue', 'eye', 'eyes', 'ear', 'nose', 'intestine', 'bladder'],
        uncommon: ['pancreas', 'spleen', 'gallbladder', 'appendix', 'esophagus', 'oesophagus', 'trachea', 'diaphragm', 'thyroid', 'colon', 'rectum', 'prostate', 'uterus', 'ovary', 'tibia', 'fibula', 'humerus', 'radius', 'ulna', 'clavicle', 'collarbone', 'scapula', 'shoulder blade', 'sternum', 'patella', 'kneecap', 'vertebra', 'vertebrae', 'sacrum', 'coccyx', 'tailbone', 'mandible', 'cranium', 'deltoid', 'pectoral', 'pecs', 'lat', 'lats', 'trapezius', 'traps', 'obliques', 'achilles', 'tendon'],
        rare: ['pituitary', 'pineal', 'adrenal', 'thymus', 'hypothalamus', 'hippocampus', 'amygdala', 'cerebellum', 'medulla', 'pons', 'thalamus', 'cochlea', 'retina', 'cornea', 'iris', 'larynx', 'pharynx', 'epiglottis', 'bronchi', 'alveoli', 'duodenum', 'jejunum', 'ileum', 'cecum', 'ureter', 'urethra', 'carpals', 'metacarpals', 'phalanges', 'tarsals', 'metatarsals', 'calcaneus', 'talus', 'ilium', 'ischium', 'pubis', 'maxilla', 'zygomatic', 'temporal', 'parietal', 'occipital', 'frontal', 'sartorius', 'gastrocnemius', 'soleus', 'gluteus maximus', 'rectus abdominis', 'sternocleidomastoid', 'masseter'],
        legendary: ['hyoid', 'stapes', 'incus', 'malleus', 'ethmoid', 'sphenoid', 'vomer', 'lacrimal', 'palatine', 'nasal conchae', 'pisiform', 'triquetrum', 'lunate', 'scaphoid', 'trapezium', 'trapezoid', 'capitate', 'hamate', 'cuboid', 'navicular', 'cuneiform', 'sesamoid', 'fabella', 'xiphoid', 'manubrium', 'islets of langerhans', 'brocas area', 'wernickes area', 'corpus callosum', 'substantia nigra', 'basal ganglia', 'fornix', 'cingulate', 'insula', 'purkinje', 'sinoatrial node', 'mitral valve', 'tricuspid valve', 'aorta', 'vena cava', 'mesentery', 'omentum', 'peritoneum', 'pleura', 'pericardium', 'meninges', 'pia mater', 'dura mater', 'arachnoid', 'piriformis', 'psoas', 'iliopsoas', 'popliteus', 'plantaris', 'palmaris longus', 'tensor fasciae latae', 'gracilis', 'pectineus', 'serratus anterior', 'rhomboid', 'levator scapulae', 'supraspinatus', 'infraspinatus', 'teres minor', 'subscapularis', 'brachioradialis', 'pronator teres', 'orbicularis oculi', 'buccinator', 'platysma', 'cremaster', 'stapedius'],
    },
    {
        id: 'jobs',
        category: 'Society',
        prompt: 'Name a job or profession',
        common: ['doctor', 'nurse', 'teacher', 'police', 'police officer', 'firefighter', 'chef', 'cook', 'lawyer', 'engineer', 'programmer', 'developer', 'pilot', 'dentist', 'vet', 'veterinarian', 'actor', 'singer', 'musician', 'artist', 'writer', 'author', 'journalist', 'architect', 'accountant', 'mechanic', 'plumber', 'electrician', 'carpenter', 'builder', 'farmer', 'driver', 'waiter', 'barista', 'cashier', 'manager', 'ceo', 'scientist', 'astronaut', 'soldier'],
        uncommon: ['surgeon', 'pharmacist', 'paramedic', 'therapist', 'psychologist', 'psychiatrist', 'optometrist', 'midwife', 'professor', 'librarian', 'judge', 'attorney', 'paralegal', 'detective', 'investigator', 'spy', 'diplomat', 'politician', 'banker', 'broker', 'trader', 'economist', 'analyst', 'consultant', 'designer', 'photographer', 'filmmaker', 'director', 'editor', 'animator', 'illustrator', 'sculptor', 'tailor', 'barber', 'hairdresser', 'beautician', 'baker', 'butcher', 'florist', 'gardener', 'landscaper', 'welder', 'machinist', 'blacksmith', 'locksmith', 'jeweler', 'watchmaker', 'sailor', 'captain', 'flight attendant', 'air traffic controller', 'coach', 'referee', 'lifeguard', 'postman', 'courier', 'realtor', 'broker'],
        rare: ['actuary', 'sommelier', 'cartographer', 'archaeologist', 'paleontologist', 'anthropologist', 'sociologist', 'linguist', 'translator', 'interpreter', 'cryptographer', 'mathematician', 'physicist', 'chemist', 'biologist', 'botanist', 'zoologist', 'geologist', 'meteorologist', 'astronomer', 'oceanographer', 'ecologist', 'entomologist', 'ornithologist', 'epidemiologist', 'pathologist', 'radiologist', 'anesthesiologist', 'dermatologist', 'cardiologist', 'neurologist', 'oncologist', 'pediatrician', 'orthodontist', 'podiatrist', 'chiropractor', 'audiologist', 'dietitian', 'nutritionist', 'ergonomist', 'surveyor', 'appraiser', 'auctioneer', 'notary', 'bailiff', 'coroner', 'mortician', 'embalmer', 'taxidermist', 'glassblower', 'potter', 'weaver', 'cobbler', 'shoemaker', 'bookbinder', 'calligrapher', 'luthier', 'piano tuner', 'foley artist', 'stuntman', 'pyrotechnician', 'ventriloquist', 'magician', 'acrobat', 'juggler'],
        legendary: ['horologist', 'campanologist', 'vexillologist', 'numismatist', 'philatelist', 'lepidopterist', 'mycologist', 'ichthyologist', 'herpetologist', 'arachnologist', 'malacologist', 'speleologist', 'volcanologist', 'seismologist', 'glaciologist', 'dendrochronologist', 'epigrapher', 'paleographer', 'papyrologist', 'archivist', 'curator', 'conservator', 'restorer', 'gemologist', 'lapidary', 'silversmith', 'goldsmith', 'coppersmith', 'tinsmith', 'pewterer', 'cooper', 'wheelwright', 'wainwright', 'shipwright', 'millwright', 'cartwright', 'fletcher', 'bowyer', 'armorer', 'farrier', 'saddler', 'chandler', 'tanner', 'currier', 'furrier', 'haberdasher', 'milliner', 'draper', 'mercer', 'cordwainer', 'thatcher', 'dry stone waller', 'chimney sweep', 'steeplejack', 'rigger', 'stevedore', 'longshoreman', 'ferryman', 'gondolier', 'sherpa', 'mahout', 'falconer', 'apiarist', 'beekeeper', 'vintner', 'enologist', 'brewmaster', 'distiller', 'chocolatier', 'patissier', 'fromager', 'affineur', 'barista', 'cicero', 'cicerone', 'perfumer', 'nose', 'flavorist', 'ethologist', 'primatologist', 'cetologist', 'astrobiologist', 'exoplanetologist', 'cosmologist'],
    },
    {
        id: 'weather_phenomena',
        category: 'Nature',
        prompt: 'Name a weather or natural phenomenon',
        common: ['rain', 'snow', 'wind', 'storm', 'thunder', 'lightning', 'tornado', 'hurricane', 'typhoon', 'cyclone', 'flood', 'drought', 'earthquake', 'tsunami', 'volcano', 'eruption', 'avalanche', 'landslide', 'wildfire', 'fog', 'mist', 'hail', 'sleet', 'frost', 'ice', 'rainbow', 'eclipse', 'heatwave', 'blizzard'],
        uncommon: ['monsoon', 'gale', 'breeze', 'gust', 'squall', 'drizzle', 'downpour', 'cloudburst', 'freezing rain', 'black ice', 'dew', 'smog', 'haze', 'sandstorm', 'dust storm', 'dust devil', 'waterspout', 'whirlpool', 'maelstrom', 'sinkhole', 'geyser', 'hot spring', 'aurora', 'northern lights', 'aurora borealis', 'aurora australis', 'meteor shower', 'solar flare', 'tide', 'rip current', 'undertow', 'mirage', 'halo', 'sun dog', 'sundog', 'mudslide', 'rockslide', 'aftershock', 'tremor'],
        rare: ['derecho', 'haboob', 'microburst', 'downburst', 'supercell', 'wall cloud', 'shelf cloud', 'mammatus', 'lenticular cloud', 'noctilucent', 'virga', 'graupel', 'rime', 'hoarfrost', 'ice storm', 'thundersnow', 'firenado', 'fire whirl', 'pyrocumulus', 'volcanic lightning', 'ball lightning', 'st elmos fire', 'sprites', 'red sprite', 'blue jet', 'elves', 'green flash', 'brocken spectre', 'glory', 'moonbow', 'fogbow', 'fire rainbow', 'circumhorizontal arc', 'light pillar', 'ice crystal', 'diamond dust', 'whiteout', 'chinook', 'foehn', 'santa ana', 'sirocco', 'mistral', 'el nino', 'la nina', 'polar vortex', 'jet stream', 'trade winds', 'doldrums'],
        legendary: ['petrichor', 'catatumbo lightning', 'morning glory cloud', 'asperitas', 'kelvin-helmholtz', 'fallstreak hole', 'hole punch cloud', 'roll cloud', 'nacreous cloud', 'polar stratospheric', 'brinicle', 'ice finger of death', 'frost flower', 'penitentes', 'sastrugi', 'ice shove', 'ivu', 'hair ice', 'needle ice', 'frazil ice', 'anchor ice', 'pancake ice', 'seiche', 'meteotsunami', 'rogue wave', 'tidal bore', 'pororoca', 'bioluminescence', 'milky seas', 'red tide', 'sailing stones', 'fairy circles', 'mud volcano', 'blue lava', 'limnic eruption', 'lahar', 'pyroclastic flow', 'tephra', 'pumice raft', 'earthquake lights', 'triboluminescence', 'zodiacal light', 'gegenschein', 'airglow', 'steve', 'proton arc', 'alpenglow', 'belt of venus', 'crepuscular rays', 'anticrepuscular rays', 'heiligenschein', 'sylvanshine', 'subsun', 'parhelic circle', 'novaya zemlya effect', 'fata morgana', 'loom', 'looming'],
    },
    {
        id: 'shapes',
        category: 'Math & Logic',
        prompt: 'Name a 2D or 3D geometric shape',
        common: ['circle', 'square', 'triangle', 'rectangle', 'oval', 'star', 'heart', 'diamond', 'pentagon', 'hexagon', 'octagon', 'cube', 'sphere', 'cone', 'cylinder', 'pyramid', 'prism', 'line', 'semicircle', 'crescent', 'cross', 'ring', 'arrow'],
        uncommon: ['rhombus', 'trapezoid', 'trapezium', 'parallelogram', 'kite', 'quadrilateral', 'polygon', 'heptagon', 'nonagon', 'decagon', 'ellipse', 'arc', 'sector', 'segment', 'cuboid', 'rectangular prism', 'triangular prism', 'tetrahedron', 'octahedron', 'hemisphere', 'torus', 'donut', 'helix', 'spiral', 'annulus', 'frustum', 'wedge'],
        rare: ['dodecagon', 'hendecagon', 'tridecagon', 'icosagon', 'dodecahedron', 'icosahedron', 'polyhedron', 'ellipsoid', 'paraboloid', 'hyperboloid', 'mobius strip', 'klein bottle', 'tesseract', 'hypercube', 'pentagram', 'hexagram', 'octagram', 'decagram', 'cardioid', 'lemniscate', 'cycloid', 'epicycloid', 'hypocycloid', 'deltoid', 'astroid', 'stadium', 'squircle', 'reuleaux triangle', 'vesica piscis', 'lune', 'trefoil', 'quatrefoil', 'polytope', 'simplex'],
        legendary: ['rhombicosidodecahedron', 'icosidodecahedron', 'cuboctahedron', 'rhombicuboctahedron', 'truncated icosahedron', 'truncated cube', 'snub cube', 'snub dodecahedron', 'great stellated dodecahedron', 'small stellated dodecahedron', 'great icosahedron', 'great dodecahedron', 'rhombic dodecahedron', 'rhombic triacontahedron', 'disdyakis triacontahedron', 'pentagonal icositetrahedron', 'deltoidal icositetrahedron', 'trapezohedron', 'antiprism', 'bipyramid', 'cupola', 'rotunda', 'gyrobifastigium', 'sphenocorona', 'hebesphenomegacorona', 'gomboc', 'oloid', 'sphericon', 'scutoid', 'enneper surface', 'boy surface', 'roman surface', 'catenoid', 'helicoid', 'pseudosphere', 'gabriel horn', 'sierpinski triangle', 'menger sponge', 'koch snowflake', 'mandelbrot', 'apeirogon', 'chiliagon', 'myriagon', 'megagon', 'googolgon', 'pentachoron', '16-cell', '24-cell', '120-cell', '600-cell', 'hopf fibration'],
    },
    {
        id: 'cheeses',
        category: 'Food',
        prompt: 'Name a type of cheese',
        common: ['cheddar', 'mozzarella', 'parmesan', 'brie', 'feta', 'gouda', 'swiss', 'american', 'cream cheese', 'blue cheese', 'cottage cheese', 'ricotta', 'provolone', 'monterey jack', 'pepper jack', 'colby', 'edam', 'camembert', 'goat cheese', 'halloumi', 'stilton', 'gorgonzola', 'gruyere', 'emmental'],
        uncommon: ['manchego', 'roquefort', 'mascarpone', 'burrata', 'pecorino', 'asiago', 'fontina', 'havarti', 'muenster', 'munster', 'jarlsberg', 'paneer', 'queso fresco', 'cotija', 'oaxaca', 'chevre', 'boursin', 'babybel', 'red leicester', 'wensleydale', 'lancashire', 'cheshire', 'double gloucester', 'caerphilly', 'cornish yarg', 'limburger', 'neufchatel', 'comte', 'reblochon', 'raclette', 'taleggio', 'stracciatella', 'scamorza', 'caciocavallo'],
        rare: ['epoisses', 'morbier', 'mimolette', 'ossau-iraty', 'tomme', 'cantal', 'beaufort', 'abondance', 'saint-nectaire', 'maroilles', 'livarot', 'pont-leveque', 'brillat-savarin', 'chaource', 'valencay', 'sainte-maure', 'crottin', 'cabrales', 'mahon', 'tetilla', 'idiazabal', 'zamorano', 'serra da estrela', 'azeitao', 'grano padano', 'grana padano', 'parmigiano', 'parmigiano reggiano', 'piave', 'robiole', 'robiola', 'castelmagno', 'bra', 'toma', 'bitto', 'brunost', 'gjetost', 'danbo', 'esrom', 'samso', 'tilsit', 'appenzeller', 'tete de moine', 'vacherin', 'sbrinz', 'kasseri', 'kefalotyri', 'graviera', 'mizithra', 'anthotyro', 'labneh', 'akkawi', 'nabulsi'],
        legendary: ['casu marzu', 'pule', 'stinking bishop', 'cashel blue', 'gubbeen', 'durrus', 'milleens', 'caboc', 'crowdie', 'lanark blue', 'isle of mull', 'berkswell', 'keen cheddar', 'montgomery cheddar', 'lincolnshire poacher', 'barkham blue', 'colston bassett', 'shropshire blue', 'sage derby', 'hereford hop', 'humboldt fog', 'rogue river blue', 'pleasant ridge reserve', 'jasper hill', 'harbison', 'winnimere', 'rush creek reserve', 'maytag blue', 'point reyes', 'cougar gold', 'tillamook', 'oka', 'baluchon', 'pied-de-vent', 'chhurpi', 'yak cheese', 'bandel', 'kalari', 'chhena', 'khoa', 'rubing', 'rushan', 'sakura', 'tulum', 'beyaz peynir', 'kashkaval', 'sirene', 'oscypek', 'bryndza', 'olomuicke tvaruzky', 'handkase', 'harzer', 'obatzda', 'spundekas', 'bergkase', 'alpkase', 'schabziger', 'leyden', 'nagelkaas', 'maasdam', 'beemster', 'old amsterdam', 'boerenkaas', 'herve', 'passendale', 'chimay', 'orval', 'maredsous'],
    },
    {
        id: 'us_states',
        category: 'Geography',
        prompt: 'Name a US State',
        aliases: US_STATE_CODES,
        common: ['california', 'texas', 'florida', 'new york', 'illinois', 'ohio', 'georgia', 'michigan', 'washington', 'arizona', 'nevada', 'hawaii', 'alaska', 'colorado', 'virginia', 'north carolina', 'pennsylvania', 'massachusetts', 'new jersey', 'tennessee'],
        uncommon: ['oregon', 'utah', 'minnesota', 'wisconsin', 'indiana', 'missouri', 'maryland', 'alabama', 'louisiana', 'kentucky', 'south carolina', 'oklahoma', 'connecticut', 'iowa', 'kansas', 'arkansas', 'mississippi', 'new mexico', 'nebraska', 'idaho', 'west virginia', 'maine', 'new hampshire', 'montana'],
        rare: ['rhode island', 'delaware', 'vermont', 'wyoming', 'north dakota', 'south dakota'],
        legendary: ['wyoming', 'delaware', 'vermont', 'north dakota', 'south dakota', 'rhode island'],
    },
    {
        id: 'trees',
        category: 'Nature',
        prompt: 'Name a type of tree',
        common: ['oak', 'pine', 'maple', 'birch', 'willow', 'palm', 'coconut palm', 'apple', 'cherry', 'cherry blossom', 'redwood', 'cedar', 'spruce', 'fir', 'elm', 'ash', 'beech', 'poplar', 'cypress', 'sycamore', 'walnut', 'chestnut', 'holly', 'olive', 'lemon', 'orange', 'peach', 'plum', 'fig', 'mango', 'banana', 'bamboo'],
        uncommon: ['sequoia', 'eucalyptus', 'mahogany', 'teak', 'ebony', 'sandalwood', 'banyan', 'baobab', 'acacia', 'alder', 'aspen', 'cottonwood', 'dogwood', 'elder', 'hawthorn', 'hazel', 'hemlock', 'hickory', 'hornbeam', 'juniper', 'larch', 'linden', 'lime', 'magnolia', 'mulberry', 'pecan', 'persimmon', 'rowan', 'sassafras', 'yew', 'mangrove', 'citrus', 'avocado', 'almond', 'pistachio', 'cashew', 'cacao', 'coffee', 'rubber', 'cinnamon', 'nutmeg', 'clove', 'balsa', 'cork oak'],
        rare: ['ginkgo', 'ginkgo biloba', 'jacaranda', 'wisteria', 'laburnum', 'catalpa', 'paulownia', 'tulip tree', 'sweetgum', 'blackgum', 'tupelo', 'buckeye', 'horse chestnut', 'locust', 'black locust', 'honey locust', 'mesquite', 'ironwood', 'boxwood', 'osage orange', 'serviceberry', 'crabapple', 'medlar', 'quince', 'loquat', 'pomegranate', 'tamarind', 'neem', 'kapok', 'ceiba', 'monkey puzzle', 'araucaria', 'norfolk pine', 'kauri', 'totara', 'rimu', 'pohutukawa', 'bottle tree', 'dragon blood tree', 'joshua tree', 'saguaro', 'yucca', 'boojum', 'manchineel', 'sandbox tree', 'cannonball tree', 'sausage tree', 'flame tree', 'flamboyant', 'royal poinciana', 'frangipani', 'plumeria'],
        legendary: ['wollemia', 'wollemi pine', 'bristlecone pine', 'methuselah', 'dawn redwood', 'metasequoia', 'bald cypress', 'montezuma cypress', 'japanese cedar', 'sugi', 'hinoki', 'thuja', 'arborvitae', 'torreya', 'podocarpus', 'welwitschia', 'quiver tree', 'socotra dragon tree', 'rainbow eucalyptus', 'ghost gum', 'jarrah', 'karri', 'wattle', 'mulga', 'banksia', 'casuarina', 'sheoak', 'grevillea', 'macadamia', 'bunya pine', 'hoop pine', 'huon pine', 'king billy pine', 'celery top pine', 'lignum vitae', 'cocobolo', 'rosewood', 'purpleheart', 'padauk', 'zebrawood', 'wenge', 'bubinga', 'ipe', 'jatoba', 'greenheart', 'bloodwood', 'snakewood', 'pink ivory', 'african blackwood', 'pernambuco', 'brazilwood', 'logwood', 'cinchona', 'frankincense', 'myrrh', 'camphor', 'agarwood', 'oud', 'upas', 'strychnine', 'curare', 'dynamite tree', 'gympie-gympie', 'ombu', 'pehuen', 'alerce', 'lengas', 'coihue', 'nire', 'arrayan', 'quebracho', 'lapacho', 'jacaranda', 'palo verde', 'palo santo', 'copal', 'chicle', 'sapodilla', 'breadnut', 'ramon', 'calabash', 'moringa', 'sal', 'peepal', 'bodhi', 'deodar', 'chinar', 'katsura', 'zelkova', 'empress tree', 'pagoda tree', 'silk tree', 'mimosa', 'albizia', 'tallow tree', 'varnish tree', 'lacquer tree', 'tung', 'camellia', 'tea tree', 'manuka', 'kanuka', 'kowhai', 'rata', 'lancewood', 'cabbage tree'],
    },
    {
        id: 'insects',
        category: 'Nature',
        prompt: 'Name an insect or bug',
        common: ['ant', 'bee', 'wasp', 'fly', 'mosquito', 'butterfly', 'moth', 'beetle', 'ladybug', 'ladybird', 'grasshopper', 'cricket', 'cockroach', 'dragonfly', 'caterpillar', 'flea', 'termite', 'firefly', 'hornet', 'bumblebee'],
        uncommon: ['praying mantis', 'mantis', 'stick insect', 'walking stick', 'locust', 'cicada', 'earwig', 'silverfish', 'aphid', 'weevil', 'dung beetle', 'stag beetle', 'rhinoceros beetle', 'june bug', 'mayfly', 'damselfly', 'horsefly', 'fruit fly', 'gnat', 'midge', 'louse', 'lice', 'bedbug', 'stink bug', 'shield bug', 'water strider', 'pond skater'],
        rare: ['atlas moth', 'luna moth', 'monarch butterfly', 'swallowtail', 'hercules beetle', 'goliath beetle', 'scarab', 'bombardier beetle', 'jewel beetle', 'click beetle', 'rove beetle', 'assassin bug', 'wheel bug', 'kissing bug', 'lacewing', 'antlion', 'dobsonfly', 'stonefly', 'caddisfly', 'scorpionfly', 'thrips', 'springtail', 'sawfly', 'ichneumon wasp', 'tarantula hawk', 'velvet ant', 'leafcutter ant', 'army ant', 'bullet ant'],
        legendary: ['orchid mantis', 'dead leaf mantis', 'giraffe weevil', 'violin beetle', 'titan beetle', 'harlequin beetle', 'planthopper', 'treehopper', 'thorn bug', 'lanternfly', 'spotted lanternfly', 'spittlebug', 'froghopper', 'webspinner', 'zorapteran', 'mantidfly', 'snakefly', 'alderfly', 'fishfly', 'botfly', 'tsetse fly', 'robber fly', 'hoverfly', 'bee fly', 'crane fly', 'hangingfly', 'booklouse', 'barklouse', 'bristletail', 'firebrat', 'giant weta', 'weta'],
    },
    {
        id: 'flowers',
        category: 'Nature',
        prompt: 'Name a flower',
        common: ['rose', 'tulip', 'sunflower', 'daisy', 'lily', 'orchid', 'daffodil', 'dandelion', 'lavender', 'poppy', 'marigold', 'carnation', 'violet', 'iris', 'jasmine', 'hibiscus', 'lotus', 'buttercup', 'bluebell', 'cherry blossom'],
        uncommon: ['peony', 'hydrangea', 'chrysanthemum', 'dahlia', 'geranium', 'petunia', 'pansy', 'begonia', 'azalea', 'rhododendron', 'camellia', 'magnolia', 'gardenia', 'lilac', 'wisteria', 'honeysuckle', 'snapdragon', 'zinnia', 'cosmos', 'aster', 'crocus', 'hyacinth', 'snowdrop', 'primrose', 'foxglove', 'heather', 'clover', 'thistle', 'forget me not', 'gladiolus'],
        rare: ['anemone', 'ranunculus', 'freesia', 'delphinium', 'larkspur', 'lupine', 'columbine', 'clematis', 'bougainvillea', 'plumeria', 'frangipani', 'bird of paradise', 'protea', 'calla lily', 'water lily', 'tiger lily', 'amaryllis', 'cyclamen', 'fuschia', 'fuchsia', 'verbena', 'salvia', 'yarrow', 'echinacea', 'coneflower', 'calendula', 'chamomile', 'borage', 'nasturtium', 'sweet pea', 'hollyhock', 'morning glory', 'passionflower'],
        legendary: ['edelweiss', 'corpse flower', 'rafflesia', 'titan arum', 'ghost orchid', 'jade vine', 'middlemist red', 'kadupul', 'queen of the night', 'bleeding heart', 'black bat flower', 'monkey orchid', 'bee orchid', 'fly orchid', 'hellebore', 'aconite', 'monkshood', 'wolfsbane', 'belladonna', 'datura', 'brugmansia', 'angel trumpet', 'proteas', 'banksia', 'waratah', 'sturt desert pea', 'kangaroo paw', 'agapanthus', 'alstroemeria', 'lisianthus', 'nerine', 'allium', 'scabiosa', 'astrantia', 'nigella', 'love in a mist', 'celosia', 'amaranth'],
    },
    {
        id: 'gems_minerals',
        category: 'Science',
        prompt: 'Name a gemstone or mineral',
        common: ['diamond', 'ruby', 'emerald', 'sapphire', 'gold', 'silver', 'pearl', 'amethyst', 'quartz', 'opal', 'jade', 'topaz', 'turquoise', 'amber', 'crystal', 'obsidian', 'marble', 'granite', 'coal', 'salt'],
        uncommon: ['garnet', 'aquamarine', 'peridot', 'citrine', 'onyx', 'agate', 'jasper', 'lapis lazuli', 'lapis', 'malachite', 'moonstone', 'sunstone', 'bloodstone', 'tiger eye', 'pyrite', 'fools gold', 'mica', 'feldspar', 'calcite', 'gypsum', 'talc', 'flint', 'chalk', 'limestone', 'slate', 'basalt', 'pumice', 'sulfur'],
        rare: ['tanzanite', 'alexandrite', 'tourmaline', 'spinel', 'zircon', 'morganite', 'kunzite', 'chrysoberyl', 'beryl', 'corundum', 'fluorite', 'hematite', 'magnetite', 'galena', 'cinnabar', 'azurite', 'chrysocolla', 'rhodochrosite', 'rhodonite', 'labradorite', 'sodalite', 'amazonite', 'aventurine', 'carnelian', 'chalcedony', 'chrysoprase', 'howlite', 'kyanite', 'iolite', 'apatite', 'celestite', 'selenite', 'barite', 'dolomite'],
        legendary: ['painite', 'benitoite', 'taaffeite', 'grandidierite', 'jeremejevite', 'musgravite', 'red beryl', 'bixbite', 'poudretteite', 'serendibite', 'black opal', 'padparadscha', 'paraiba tourmaline', 'demantoid', 'tsavorite', 'spessartine', 'larimar', 'charoite', 'sugilite', 'moldavite', 'ametrine', 'danburite', 'dioptase', 'euclase', 'goshenite', 'heliodor', 'hiddenite', 'kornerupine', 'lazulite', 'neptunite', 'pezzottaite', 'phenakite', 'prehnite', 'scheelite', 'sphalerite', 'sphene', 'titanite', 'stibnite', 'uvarovite', 'vanadinite', 'wulfenite', 'zoisite'],
    },
    {
        id: 'desserts',
        category: 'Food',
        prompt: 'Name a dessert or sweet treat',
        common: ['cake', 'ice cream', 'cookie', 'cookies', 'brownie', 'pie', 'donut', 'doughnut', 'cupcake', 'chocolate', 'cheesecake', 'pudding', 'muffin', 'pancake', 'waffle', 'candy', 'fudge', 'milkshake', 'sundae', 'apple pie'],
        uncommon: ['tiramisu', 'macaron', 'macaroon', 'eclair', 'croissant', 'churro', 'churros', 'crepe', 'gelato', 'sorbet', 'mousse', 'custard', 'trifle', 'crumble', 'apple crumble', 'cobbler', 'tart', 'lemon tart', 'key lime pie', 'pecan pie', 'pumpkin pie', 'carrot cake', 'red velvet', 'sponge cake', 'shortbread', 'gingerbread', 'cinnamon roll', 'danish', 'strudel', 'baklava', 'flan', 'creme brulee', 'panna cotta', 'parfait', 'smores', 'marshmallow'],
        rare: ['cannoli', 'profiterole', 'mille feuille', 'napoleon', 'opera cake', 'black forest cake', 'battenberg', 'victoria sponge', 'sticky toffee pudding', 'bread pudding', 'rice pudding', 'banoffee pie', 'pavlova', 'meringue', 'baked alaska', 'souffle', 'madeleine', 'financier', 'palmier', 'beignet', 'zeppole', 'sfogliatella', 'panettone', 'pandoro', 'stollen', 'tres leches', 'alfajores', 'dulce de leche', 'mochi', 'daifuku', 'dorayaki', 'taiyaki', 'gulab jamun', 'jalebi', 'kulfi', 'halva', 'lokum', 'turkish delight'],
        legendary: ['kouign amann', 'clafoutis', 'cannele', 'canele', 'paris brest', 'saint honore', 'dacquoise', 'ile flottante', 'floating island', 'sabayon', 'zabaione', 'cassata', 'pastiera', 'torta caprese', 'seadas', 'pasteis de nata', 'pastel de nata', 'queijada', 'bolinho de chuva', 'brigadeiro', 'quindim', 'suspiro limeno', 'picarones', 'mazamorra', 'knafeh', 'kunafa', 'qatayef', 'basbousa', 'maamoul', 'umm ali', 'rasmalai', 'rasgulla', 'barfi', 'ladoo', 'payasam', 'kheer', 'bingsu', 'hotteok', 'yakgwa', 'halo halo', 'leche flan', 'bibingka', 'kue lapis', 'onde onde', 'cendol', 'mango sticky rice', 'khanom chan', 'es campur', 'dobos torte', 'esterhazy torte', 'sachertorte', 'kaiserschmarrn', 'linzer torte', 'prinzregententorte', 'baumkuchen', 'kransekake', 'semla', 'kladdkaka', 'prinsesstarta', 'melktert', 'malva pudding', 'koeksister', 'lamington', 'nanaimo bar'],
    },
    {
        id: 'pizza_toppings',
        category: 'Food',
        prompt: 'Name a pizza topping',
        common: ['pepperoni', 'cheese', 'mozzarella', 'mushroom', 'mushrooms', 'sausage', 'ham', 'bacon', 'pineapple', 'onion', 'onions', 'pepper', 'peppers', 'olives', 'black olives', 'chicken', 'beef', 'tomato', 'tomatoes', 'spinach', 'basil', 'garlic'],
        uncommon: ['jalapeno', 'jalapenos', 'sweetcorn', 'corn', 'anchovies', 'anchovy', 'tuna', 'salami', 'chorizo', 'meatballs', 'pulled pork', 'bbq chicken', 'parmesan', 'cheddar', 'feta', 'goat cheese', 'ricotta', 'gorgonzola', 'blue cheese', 'prosciutto', 'parma ham', 'red onion', 'green pepper', 'bell pepper', 'chili', 'chilli', 'arugula', 'rocket', 'pesto', 'oregano', 'egg'],
        rare: ['artichoke', 'artichokes', 'capers', 'sun dried tomatoes', 'sundried tomatoes', 'roasted garlic', 'caramelized onions', 'truffle', 'truffle oil', 'burrata', 'buffalo mozzarella', 'pecorino', 'fontina', 'provolone', 'gruyere', 'brie', 'nduja', 'pancetta', 'speck', 'bresaola', 'mortadella', 'coppa', 'guanciale', 'soppressata', 'capicola', 'eggplant', 'aubergine', 'zucchini', 'courgette', 'broccoli', 'broccoli rabe', 'asparagus', 'kale', 'potato', 'avocado', 'fig', 'figs', 'pear', 'walnuts', 'pine nuts', 'hot honey', 'honey'],
        legendary: ['bottarga', 'porcini', 'chanterelle', 'morel', 'shiitake', 'truffle cream', 'pistachio', 'pistachios', 'fennel pollen', 'fennel', 'radicchio', 'endive', 'escarole', 'friarielli', 'rapini', 'squash blossoms', 'zucchini flowers', 'butternut squash', 'pumpkin', 'kimchi', 'bulgogi', 'tandoori chicken', 'paneer', 'lamb', 'duck', 'venison', 'clams', 'mussels', 'shrimp', 'prawns', 'calamari', 'squid', 'smoked salmon', 'caviar', 'sardines', 'pickles', 'gherkins', 'sauerkraut', 'black garlic', 'preservd lemon', 'preserved lemon', 'sumac', 'zaatar', 'harissa', 'chimichurri'],
    },
    {
        id: 'fast_food',
        category: 'Food',
        prompt: 'Name a fast food or restaurant chain',
        common: ['mcdonalds', 'burger king', 'kfc', 'subway', 'wendys', 'taco bell', 'pizza hut', 'dominos', 'starbucks', 'dunkin', 'dunkin donuts', 'popeyes', 'chick fil a', 'five guys', 'chipotle', 'nandos', 'greggs', 'papa johns', 'sonic', 'arbys'],
        uncommon: ['in n out', 'shake shack', 'jack in the box', 'carl jr', 'carls jr', 'hardees', 'dairy queen', 'dq', 'little caesars', 'panera', 'panera bread', 'panda express', 'wingstop', 'jersey mikes', 'jimmy johns', 'firehouse subs', 'qdoba', 'del taco', 'el pollo loco', 'raising canes', 'zaxbys', 'bojangles', 'churchs chicken', 'culvers', 'whataburger', 'white castle', 'krystal', 'tim hortons', 'costa', 'costa coffee', 'pret', 'pret a manger', 'wagamama', 'leon', 'itsu', 'yo sushi', 'pizza express', 'frankie and bennys', 'wetherspoons', 'harvester'],
        rare: ['jollibee', 'mos burger', 'yoshinoya', 'sukiya', 'matsuya', 'coco ichibanya', 'ichiran', 'lotteria', 'bonchon', 'bbq chicken', 'max burgers', 'hesburger', 'quick', 'nordsee', 'vapiano', 'telepizza', 'pollo campero', 'bem bos', 'bembos', 'hungry jacks', 'red rooster', 'oporto', 'guzman y gomez', 'grilld', 'mary browns', 'harveys', 'swiss chalet', 'a and w', 'aw', 'checkers', 'rallys', 'steak n shake', 'freddys', 'smashburger', 'fatburger', 'fuddruckers', 'portillos', 'wawa', 'sheetz', 'bucees', 'bojangles', 'cook out', 'krispy kreme', 'cinnabon', 'auntie annes', 'jamba juice', 'baskin robbins', 'cold stone'],
        legendary: ['albaik', 'al baik', 'mr biggs', 'steers', 'wimpy', 'debonairs', 'chicken licken', 'spurs', 'spur', 'bobs', 'habibs', 'giraffas', 'spoleto', 'mostaza', 'dogges', 'doggis', 'frisby', 'el corral', 'crepes and waffles', 'taco johns', 'taco cabana', 'taco bueno', 'torchys tacos', 'freebirds', 'rubios', 'wahoo', 'baja fresh', 'moe southwest grill', 'moes', 'penn station', 'potbelly', 'schlotzskys', 'which wich', 'capriottis', 'cousins subs', 'blimpie', 'quiznos', 'togos', 'fazoli', 'fazolis', 'sbarro', 'mod pizza', 'blaze pizza', 'marco pizza', 'marcos pizza', 'jets pizza', 'hungry howies', 'round table', 'cicis', 'papa murphys', 'long john silvers', 'captain ds', 'boston market', 'pollo tropical', 'pdq', 'slim chickens', 'foosacklys', 'guthries', 'huey magoos', 'runza', 'pal sudden service', 'tutors biscuit world', 'biscuitville', 'milo hamburgers', 'milos', 'braums', 'spangles', 'lions choice', 'skyline chili', 'gold star chili'],
    },
    {
        id: 'music_genres',
        category: 'Music',
        prompt: 'Name a music genre',
        common: ['pop', 'rock', 'hip hop', 'rap', 'jazz', 'classical', 'country', 'rnb', 'r&b', 'metal', 'heavy metal', 'electronic', 'edm', 'reggae', 'blues', 'punk', 'folk', 'soul', 'disco', 'funk', 'techno', 'house', 'indie', 'kpop', 'k pop', 'gospel'],
        uncommon: ['dubstep', 'drum and bass', 'dnb', 'trance', 'trap', 'drill', 'grime', 'lo fi', 'lofi', 'ambient', 'synthwave', 'grunge', 'emo', 'ska', 'reggaeton', 'salsa', 'bossa nova', 'flamenco', 'opera', 'bluegrass', 'swing', 'bebop', 'motown', 'afrobeats', 'afrobeat', 'dancehall', 'garage', 'uk garage', 'jungle', 'hardcore', 'death metal', 'black metal', 'thrash metal', 'progressive rock', 'prog rock', 'psychedelic rock', 'alt rock', 'alternative rock', 'pop punk', 'post punk', 'new wave', 'jpop', 'j pop', 'latin', 'cumbia', 'bachata', 'merengue', 'tango'],
        rare: ['shoegaze', 'dream pop', 'hyperpop', 'vaporwave', 'chillwave', 'retrowave', 'darkwave', 'coldwave', 'industrial', 'ebm', 'idm', 'breakbeat', 'big beat', 'trip hop', 'downtempo', 'acid house', 'deep house', 'tech house', 'french house', 'electro swing', 'hardstyle', 'gabber', 'happy hardcore', 'chiptune', 'math rock', 'post rock', 'stoner rock', 'sludge metal', 'doom metal', 'power metal', 'symphonic metal', 'nu metal', 'metalcore', 'deathcore', 'grindcore', 'crust punk', 'ska punk', 'midwest emo', 'screamo', 'chamber pop', 'baroque pop', 'twee pop', 'city pop', 'neo soul', 'quiet storm', 'new jack swing', 'boom bap', 'g funk', 'phonk', 'cloud rap', 'mumble rap', 'conscious rap', 'dub', 'rocksteady', 'lovers rock', 'calypso', 'soca', 'zydeco', 'cajun', 'americana', 'outlaw country', 'honky tonk', 'rockabilly', 'psychobilly', 'surf rock', 'krautrock'],
        legendary: ['zeuhl', 'canterbury scene', 'no wave', 'lowercase', 'musique concrete', 'electroacoustic', 'microsound', 'glitch', 'breakcore', 'speedcore', 'extratone', 'splittercore', 'witch house', 'seapunk', 'future funk', 'mallsoft', 'signalwave', 'hauntology', 'dungeon synth', 'keller synth', 'blackgaze', 'dsbm', 'war metal', 'djent', 'thall', 'nintendocore', 'cybergrind', 'goregrind', 'pornogrind', 'mathcore', 'sasscore', 'powerviolence', 'd beat', 'anarcho punk', 'queercore', 'riot grrrl', 'c86', 'madchester', 'baggy', 'grebo', 'britpop', 'tropicalia', 'mpb', 'forro', 'choro', 'samba', 'pagode', 'fado', 'rebetiko', 'klezmer', 'qawwali', 'ghazal', 'carnatic', 'hindustani', 'gamelan', 'dangdut', 'highlife', 'juju', 'soukous', 'kwaito', 'amapiano', 'gqom', 'kuduro', 'mbalax', 'gnawa', 'rai', 'chaabi', 'dabke', 'throat singing', 'joik', 'kulning', 'enka', 'shibuya kei', 'visual kei', 'kayokyoku', 'trot', 'pansori'],
    },
    {
        id: 'famous_landmarks',
        category: 'Geography',
        prompt: 'Name a famous world landmark',
        common: ['eiffel tower', 'statue of liberty', 'big ben', 'great wall of china', 'great wall', 'pyramids', 'pyramids of giza', 'colosseum', 'taj mahal', 'sydney opera house', 'golden gate bridge', 'leaning tower of pisa', 'stonehenge', 'mount rushmore', 'empire state building', 'burj khalifa', 'christ the redeemer', 'machu picchu', 'buckingham palace', 'white house'],
        uncommon: ['louvre', 'notre dame', 'arc de triomphe', 'sagrada familia', 'acropolis', 'parthenon', 'sphinx', 'petra', 'angkor wat', 'chichen itza', 'mount fuji', 'tower of london', 'tower bridge', 'london eye', 'brandenburg gate', 'neuschwanstein', 'alhambra', 'st basils cathedral', 'kremlin', 'red square', 'hollywood sign', 'grand canyon', 'niagara falls', 'cn tower', 'space needle', 'gateway arch', 'lincoln memorial', 'pentagon', 'alcatraz', 'times square', 'central park', 'brooklyn bridge', 'vatican', 'st peters basilica', 'trevi fountain', 'pantheon', 'mount everest', 'uluru', 'ayers rock', 'table mountain'],
        rare: ['hagia sophia', 'blue mosque', 'edinburgh castle', 'windsor castle', 'versailles', 'palace of versailles', 'mont saint michel', 'pont du gard', 'pompeii', 'st marks basilica', 'rialto bridge', 'duomo', 'milan cathedral', 'charles bridge', 'prague castle', 'schonbrunn palace', 'atomium', 'manneken pis', 'little mermaid', 'blue lagoon', 'giant causeway', 'giants causeway', 'blarney castle', 'cliffs of moher', 'matterhorn', 'jungfraujoch', 'potala palace', 'forbidden city', 'terracotta army', 'temple of heaven', 'fushimi inari', 'kinkakuji', 'golden pavilion', 'himeji castle', 'tokyo tower', 'tokyo skytree', 'gyeongbokgung', 'n seoul tower', 'marina bay sands', 'petronas towers', 'borobudur', 'prambanan', 'shwedagon pagoda', 'golden temple', 'hawa mahal', 'red fort', 'qutb minar', 'burj al arab', 'palm jumeirah', 'dome of the rock', 'western wall', 'tikal', 'teotihuacan', 'iguazu falls', 'angel falls', 'easter island', 'moai', 'victoria falls', 'kilimanjaro'],
        legendary: ['lalibela', 'great zimbabwe', 'timbuktu', 'djenne', 'great mosque of djenne', 'abu simbel', 'karnak', 'luxor temple', 'valley of the kings', 'persepolis', 'naqsh e jahan', 'registan', 'samarkand', 'sigiriya', 'bagan', 'plain of jars', 'nan madol', 'gobekli tepe', 'cappadocia', 'pamukkale', 'ephesus', 'knossos', 'meteora', 'delphi', 'mystras', 'newgrange', 'skara brae', 'hadrians wall', 'carcassonne', 'chenonceau', 'chambord', 'segovia aqueduct', 'mezquita', 'cordoba mosque', 'pena palace', 'belem tower', 'brans castle', 'bran castle', 'peles castle', 'corvin castle', 'wieliczka salt mine', 'wawel castle', 'malbork castle', 'kizhi pogost', 'peterhof', 'hermitage', 'ellora caves', 'ajanta caves', 'khajuraho', 'hampi', 'konark sun temple', 'meenakshi temple', 'mysore palace', 'amber fort', 'mehrangarh', 'jaisalmer fort', 'tigers nest', 'paro taktsang', 'boudhanath', 'swayambhunath', 'chan chan', 'nazca lines', 'tiwanaku', 'sacsayhuaman', 'ollantaytambo', 'palanque', 'palenque', 'uxmal', 'monte alban', 'copan', 'mesa verde', 'chaco canyon', 'cahokia', 'serpent mound'],
    },
    {
        id: 'clothing_items',
        category: 'Everyday',
        prompt: 'Name a piece of clothing or footwear',
        common: ['shirt', 'tshirt', 't-shirt', 'pants', 'trousers', 'jeans', 'shorts', 'dress', 'skirt', 'jacket', 'coat', 'hoodie', 'sweater', 'jumper', 'socks', 'shoes', 'sneakers', 'trainers', 'boots', 'hat', 'cap', 'belt', 'scarf', 'gloves', 'suit', 'tie', 'pyjamas', 'pajamas', 'underwear'],
        uncommon: ['blazer', 'cardigan', 'vest', 'waistcoat', 'polo', 'polo shirt', 'blouse', 'tank top', 'leggings', 'joggers', 'sweatpants', 'tracksuit', 'overalls', 'dungarees', 'jumpsuit', 'romper', 'trench coat', 'parka', 'windbreaker', 'raincoat', 'poncho', 'beanie', 'beret', 'fedora', 'sandals', 'flip flops', 'slippers', 'heels', 'high heels', 'loafers', 'oxfords', 'clogs', 'wellies', 'wellingtons', 'cleats', 'swimsuit', 'bikini', 'trunks', 'bathrobe', 'dressing gown', 'apron', 'tuxedo', 'bowtie', 'bow tie', 'suspenders', 'braces', 'mittens', 'tights', 'stockings'],
        rare: ['kimono', 'sari', 'saree', 'kilt', 'sarong', 'kaftan', 'caftan', 'tunic', 'toga', 'cloak', 'cape', 'shawl', 'pashmina', 'stole', 'bolero', 'corset', 'bodice', 'petticoat', 'crinoline', 'chinos', 'khakis', 'corduroys', 'culottes', 'capris', 'palazzo pants', 'cargo pants', 'flares', 'bell bottoms', 'henley', 'raglan', 'turtleneck', 'rollneck', 'mockneck', 'peacoat', 'duffle coat', 'anorak', 'bomber jacket', 'varsity jacket', 'leather jacket', 'denim jacket', 'gilet', 'bodywarmer', 'espadrilles', 'moccasins', 'brogues', 'derbies', 'monk straps', 'chelsea boots', 'combat boots', 'cowboy boots', 'wedges', 'stilettos', 'platforms', 'mary janes', 'ballet flats', 'mules', 'sabots', 'galoshes', 'trilby', 'bowler hat', 'top hat', 'sombrero', 'panama hat', 'bucket hat', 'flat cap', 'balaclava', 'bandana', 'cravat', 'ascot', 'cummerbund'],
        legendary: ['hanbok', 'cheongsam', 'qipao', 'ao dai', 'dashiki', 'agbada', 'boubou', 'dirndl', 'lederhosen', 'kurta', 'salwar kameez', 'sherwani', 'dhoti', 'lungi', 'yukata', 'hakama', 'haori', 'obi', 'tabi', 'geta', 'zori', 'waraji', 'burnoose', 'djellaba', 'thobe', 'dishdasha', 'abaya', 'chador', 'keffiyeh', 'fez', 'ushanka', 'papakha', 'shako', 'bicorne', 'tricorne', 'pillbox hat', 'cloche', 'fascinator', 'boater', 'homburg', 'porkpie', 'stetson', 'akubra', 'chullo', 'doublet', 'jerkin', 'farthingale', 'houppelande', 'cotehardie', 'surcoat', 'tabard', 'cassock', 'chasuble', 'dalmatic', 'stola', 'palla', 'chiton', 'himation', 'peplos', 'spats', 'gaiters', 'puttees', 'buskins', 'poulaines', 'chopines', 'huaraches', 'babouche', 'valenki', 'mukluks', 'kamiks', 'turnshoes', 'winklepickers', 'creepers', 'jodhpurs', 'breeches', 'knickerbockers', 'plus fours', 'bloomers', 'pantaloons', 'trews', 'hosen', 'codpiece', 'ruff', 'jabot', 'fichu', 'tippet', 'pelisse', 'redingote', 'spencer', 'ulster', 'inverness cape', 'mackintosh', 'cagoule', 'smock', 'frock coat', 'morning coat', 'tailcoat', 'zoot suit', 'mao suit', 'nehru jacket'],
    },
    {
        id: 'kitchen_items',
        category: 'Everyday',
        prompt: 'Name something found in a kitchen',
        common: ['fridge', 'refrigerator', 'oven', 'stove', 'microwave', 'toaster', 'kettle', 'sink', 'knife', 'fork', 'spoon', 'plate', 'bowl', 'cup', 'mug', 'glass', 'pan', 'frying pan', 'pot', 'blender', 'dishwasher', 'freezer', 'table', 'chair', 'trash', 'bin', 'sponge', 'towel'],
        uncommon: ['spatula', 'whisk', 'ladle', 'tongs', 'peeler', 'grater', 'colander', 'strainer', 'sieve', 'cutting board', 'chopping board', 'rolling pin', 'measuring cup', 'measuring spoon', 'can opener', 'tin opener', 'corkscrew', 'bottle opener', 'mixing bowl', 'baking sheet', 'baking tray', 'cake tin', 'muffin tin', 'casserole dish', 'wok', 'skillet', 'saucepan', 'kettle', 'coffee maker', 'coffee machine', 'espresso machine', 'air fryer', 'slow cooker', 'crockpot', 'pressure cooker', 'instant pot', 'rice cooker', 'food processor', 'mixer', 'stand mixer', 'hand mixer', 'juicer', 'waffle maker', 'sandwich maker', 'grill', 'apron', 'oven mitts', 'pot holder', 'trivet', 'coaster', 'napkin', 'salt shaker', 'pepper mill', 'spice rack', 'breadbox', 'teapot', 'pitcher', 'jug', 'tupperware', 'cling film', 'foil', 'aluminum foil', 'parchment paper'],
        rare: ['mortar and pestle', 'pestle', 'mandoline', 'zester', 'microplane', 'garlic press', 'potato masher', 'ricer', 'potato ricer', 'meat tenderizer', 'meat mallet', 'baster', 'turkey baster', 'pastry brush', 'basting brush', 'dough scraper', 'bench scraper', 'pizza cutter', 'pizza stone', 'poultry shears', 'kitchen shears', 'cleaver', 'paring knife', 'bread knife', 'santoku', 'honing steel', 'whetstone', 'salad spinner', 'egg slicer', 'egg beater', 'apple corer', 'melon baller', 'ice cream scoop', 'cookie cutter', 'piping bag', 'cooling rack', 'dutch oven', 'roasting pan', 'stockpot', 'double boiler', 'steamer', 'bamboo steamer', 'tagine', 'paella pan', 'crepe pan', 'bundt pan', 'springform pan', 'ramekin', 'souffle dish', 'mortar', 'funnel', 'thermometer', 'meat thermometer', 'kitchen scale', 'timer', 'tea infuser', 'french press', 'cafetiere', 'moka pot', 'chemex', 'aeropress', 'milk frother', 'soda stream', 'dehydrator', 'sous vide', 'blowtorch', 'kitchen torch', 'skimmer', 'slotted spoon', 'spider', 'fish slice'],
        legendary: ['chinois', 'tamis', 'ricer', 'moule', 'molcajete', 'metate', 'suribachi', 'surikogi', 'nakiri', 'deba', 'yanagiba', 'gyuto', 'ulul', 'ulu', 'mezzaluna', 'larding needle', 'trussing needle', 'oyster shucker', 'lobster cracker', 'nutcracker', 'cherry pitter', 'olive pitter', 'butter curler', 'cheese wire', 'cheese plane', 'osthyvel', 'raclette grill', 'fondue pot', 'cataplana', 'comal', 'tawa', 'karahi', 'kadai', 'handi', 'cazuela', 'bain marie', 'salamander', 'pacojet', 'thermomix', 'rotary evaporator', 'smoking gun', 'whipping siphon', 'isi whipper', 'pasta extruder', 'chitarra', 'garganelli board', 'gnocchi board', 'corzetti stamp', 'ravioli stamp', 'cannoli tubes', 'madeleine pan', 'cannele mold', 'kugelhopf pan', 'banneton', 'proofing basket', 'lame', 'bread lame', 'couche', 'peel', 'pizza peel', 'spurtles', 'spurtle', 'tovolo', 'butter bell', 'butter crock', 'fermentation crock', 'kimchi jar', 'onggi', 'samovar', 'cezve', 'ibrik', 'jebena', 'kyusu', 'chasen', 'matcha whisk', 'chashaku'],
    },
    {
        id: 'school_subjects',
        category: 'Education',
        prompt: 'Name a school or university subject',
        common: ['math', 'maths', 'mathematics', 'english', 'science', 'history', 'geography', 'art', 'music', 'pe', 'physical education', 'biology', 'chemistry', 'physics', 'spanish', 'french', 'german', 'computer science', 'computing', 'drama', 'economics', 'psychology', 'business'],
        uncommon: ['literature', 'algebra', 'geometry', 'calculus', 'statistics', 'trigonometry', 'sociology', 'philosophy', 'politics', 'political science', 'law', 'medicine', 'engineering', 'architecture', 'accounting', 'finance', 'marketing', 'design', 'technology', 'woodshop', 'home economics', 'cooking', 'nutrition', 'health', 'religious studies', 're', 'theology', 'latin', 'greek', 'mandarin', 'chinese', 'japanese', 'italian', 'russian', 'arabic', 'astronomy', 'geology', 'environmental science', 'journalism', 'media studies', 'film studies', 'photography', 'theater', 'theatre', 'dance', 'debate', 'civics', 'social studies'],
        rare: ['anthropology', 'archaeology', 'linguistics', 'criminology', 'forensics', 'forensic science', 'biochemistry', 'microbiology', 'genetics', 'neuroscience', 'anatomy', 'physiology', 'pharmacology', 'botany', 'zoology', 'ecology', 'meteorology', 'oceanography', 'astrophysics', 'quantum physics', 'thermodynamics', 'electromagnetism', 'organic chemistry', 'inorganic chemistry', 'linear algebra', 'discrete math', 'number theory', 'topology', 'logic', 'ethics', 'aesthetics', 'epistemology', 'metaphysics', 'classics', 'art history', 'music theory', 'ethnomusicology', 'rhetoric', 'creative writing', 'graphic design', 'industrial design', 'urban planning', 'agronomy', 'forestry', 'veterinary science', 'dentistry', 'nursing', 'kinesiology', 'biomechanics', 'robotics', 'cybersecurity', 'data science', 'artificial intelligence'],
        legendary: ['semiotics', 'philology', 'etymology', 'paleontology', 'paleobotany', 'palynology', 'stratigraphy', 'petrology', 'mineralogy', 'seismology', 'volcanology', 'glaciology', 'limnology', 'hydrology', 'speleology', 'entomology', 'ornithology', 'ichthyology', 'herpetology', 'mammalogy', 'mycology', 'phycology', 'virology', 'immunology', 'epidemiology', 'histology', 'cytology', 'embryology', 'endocrinology', 'hematology', 'oncology', 'gerontology', 'psycholinguistics', 'neurolinguistics', 'pragmatics', 'phonetics', 'phonology', 'morphology', 'syntax', 'epigraphy', 'numismatics', 'heraldry', 'vexillology', 'genealogy', 'papyrology', 'codicology', 'paleography', 'hermeneutics', 'phenomenology', 'ontology', 'axiology', 'eschatology', 'ecclesiology', 'missiology', 'actuarial science', 'econometrics', 'game theory', 'operations research', 'cryptography', 'combinatorics', 'category theory', 'homological algebra', 'differential geometry', 'fluid dynamics', 'tribology', 'metallurgy', 'photonics', 'spintronics', 'acoustics', 'cryogenics', 'astrobiology', 'exobiology', 'selenology', 'areology', 'cartography', 'geodesy', 'photogrammetry', 'dendrochronology'],
    },
    {
        id: 'famous_scientists',
        category: 'Science',
        prompt: 'Name a famous scientist or inventor',
        common: ['einstein', 'albert einstein', 'newton', 'isaac newton', 'tesla', 'nikola tesla', 'edison', 'thomas edison', 'darwin', 'charles darwin', 'galileo', 'galileo galilei', 'curie', 'marie curie', 'hawking', 'stephen hawking', 'da vinci', 'leonardo da vinci', 'franklin', 'benjamin franklin', 'wright brothers', 'bell', 'alexander graham bell', 'pasteur', 'louis pasteur', 'turing', 'alan turing'],
        uncommon: ['archimedes', 'aristotle', 'copernicus', 'kepler', 'johannes kepler', 'faraday', 'michael faraday', 'maxwell', 'james clerk maxwell', 'bohr', 'niels bohr', 'planck', 'max planck', 'heisenberg', 'schrodinger', 'erwin schrodinger', 'feynman', 'richard feynman', 'oppenheimer', 'robert oppenheimer', 'sagan', 'carl sagan', 'neil degrasse tyson', 'bill nye', 'mendel', 'gregor mendel', 'fleming', 'alexander fleming', 'jenner', 'edward jenner', 'rosalind franklin', 'watson', 'crick', 'ada lovelace', 'grace hopper', 'tim berners lee', 'gutenberg', 'johannes gutenberg', 'watt', 'james watt', 'ford', 'henry ford', 'nobel', 'alfred nobel', 'mendeleev', 'dmitri mendeleev', 'lavoisier', 'boyle', 'hooke', 'robert hooke', 'hubble', 'edwin hubble', 'jane goodall', 'katherine johnson'],
        rare: ['euler', 'leonhard euler', 'gauss', 'carl friedrich gauss', 'fermat', 'pascal', 'blaise pascal', 'descartes', 'rene descartes', 'leibniz', 'ramanujan', 'srinivasa ramanujan', 'pythagoras', 'euclid', 'hypatia', 'al khwarizmi', 'ibn sina', 'avicenna', 'ibn al haytham', 'alhazen', 'brahe', 'tycho brahe', 'halley', 'edmond halley', 'herschel', 'william herschel', 'caroline herschel', 'messier', 'charles messier', 'huygens', 'christiaan huygens', 'cassini', 'laplace', 'lagrange', 'fourier', 'ampere', 'volta', 'alessandro volta', 'ohm', 'georg ohm', 'hertz', 'heinrich hertz', 'marconi', 'guglielmo marconi', 'roentgen', 'wilhelm roentgen', 'rutherford', 'ernest rutherford', 'chadwick', 'thomson', 'jj thomson', 'dirac', 'paul dirac', 'fermi', 'enrico fermi', 'pauli', 'wolfgang pauli', 'born', 'max born', 'higgs', 'peter higgs', 'penrose', 'roger penrose', 'meitner', 'lise meitner', 'noether', 'emmy noether', 'wu', 'chien shiung wu', 'mcclintock', 'barbara mcclintock', 'doudna', 'jennifer doudna', 'charpentier', 'hedy lamarr', 'margaret hamilton', 'claude shannon', 'john von neumann', 'dennis ritchie', 'linus torvalds', 'george washington carver', 'garrett morgan', 'elijah mccoy', 'granville woods', 'charles babbage', 'eli whitney', 'samuel morse', 'robert fulton', 'george stephenson', 'rudolf diesel', 'karl benz', 'gottlieb daimler', 'igor sikorsky', 'wernher von braun', 'sergei korolev', 'robert goddard'],
        legendary: ['subrahmanyan chandrasekhar', 'chandrasekhar', 'satyendra nath bose', 'cv raman', 'jagadish chandra bose', 'homi bhabha', 'abdus salam', 'chen ning yang', 'tsung dao lee', 'hideki yukawa', 'shinichiro tomonaga', 'julian schwinger', 'murray gell mann', 'george zweig', 'kip thorne', 'vera rubin', 'jocelyn bell burnell', 'henrietta swan leavitt', 'annie jump cannon', 'cecilia payne', 'mary anning', 'gideon mantell', 'richard owen', 'alfred wegener', 'charles lyell', 'james hutton', 'carl linnaeus', 'linnaeus', 'jean baptiste lamarck', 'alfred russel wallace', 'antonie van leeuwenhoek', 'leeuwenhoek', 'william harvey', 'andreas vesalius', 'hippocrates', 'galen', 'paracelsus', 'joseph lister', 'ignaz semmelweis', 'robert koch', 'paul ehrlich', 'jonas salk', 'albert sabin', 'katalin kariko', 'tu youyou', 'gertrude elion', 'rita levi montalcini', 'dorothy hodgkin', 'gerty cori', 'fritz haber', 'carl bosch', 'linus pauling', 'amedeo avogadro', 'john dalton', 'joseph priestley', 'henry cavendish', 'humphry davy', 'jons jacob berzelius', 'svante arrhenius', 'glenn seaborg', 'otto hahn', 'leo szilard', 'edward teller', 'stanislaw ulam', 'kurt godel', 'david hilbert', 'henri poincare', 'bernhard riemann', 'evariste galois', 'niels henrik abel', 'sophie germain', 'sonya kovalevskaya', 'maryam mirzakhani', 'terence tao', 'andrew wiles', 'grigori perelman', 'paul erdos', 'john nash', 'benoit mandelbrot', 'edward lorenz', 'norbert wiener', 'vannevar bush', 'douglas engelbart', 'ivan sutherland', 'vint cerf', 'bob kahn', 'whitfield diffie', 'martin hellman', 'ron rivest', 'adi shamir', 'leonard adleman', 'donald knuth', 'edsger dijkstra', 'ken thompson', 'brian kernighan', 'bjarne stroustrup', 'guido van rossum', 'james gosling', 'brendan eich', 'john mccarthy', 'marvin minsky', 'geoffrey hinton', 'yann lecun', 'yoshua bengio', 'demis hassabis', 'philon of byzantium', 'hero of alexandria', 'zhang heng', 'cai lun', 'bi sheng', 'su song', 'al jazari', 'taqi al din'],
    }
];

function normalize(str) {
    return String(str || '')
        .toLowerCase()
        .replace(/[^a-z0-9+# ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const v0 = new Array(b.length + 1);
    const v1 = new Array(b.length + 1);
    for (let i = 0; i <= b.length; i++) v0[i] = i;
    for (let i = 0; i < a.length; i++) {
        v1[0] = i + 1;
        for (let j = 0; j < b.length; j++) {
            const cost = a[i] === b[j] ? 0 : 1;
            v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
        }
        for (let j = 0; j <= b.length; j++) v0[j] = v1[j];
    }
    return v0[b.length];
}

function scoreAnswer(promptId, rawAnswer) {
    const p = PROMPTS.find(item => item.id === promptId);
    const clean = normalize(rawAnswer);
    if (!p || !clean) {
        return { valid: false, tier: 'INVALID', score: 0, matched: null };
    }

    const tiers = [
        { key: 'legendary', label: 'LEGENDARY', score: 1000 },
        { key: 'rare', label: 'RARE', score: 800 },
        { key: 'uncommon', label: 'UNCOMMON', score: 500 },
        { key: 'common', label: 'COMMON', score: 200 },
    ];

    // 0. Alias / Symbol resolution (e.g. "au" -> "gold", "ny" -> "new york", "js" -> "javascript")
    const resolved = (p.aliases && p.aliases[clean]) ? p.aliases[clean] : clean;
    const wasAlias = resolved !== clean;
    const top1Word = p.top1 || (Array.isArray(p.legendary) && p.legendary[0]) || null;

    // 1. Exact match check
    for (const t of tiers) {
        if (p[t.key].includes(resolved)) {
            if (t.key === 'legendary' && top1Word && resolved === top1Word) {
                return { valid: true, tier: 'MYTHIC', score: 1500, matched: resolved, autoCorrected: wasAlias, isTop1: true };
            }
            return { valid: true, tier: t.label, score: t.score, matched: resolved, autoCorrected: wasAlias };
        }
    }

    // 2. Smart Auto-Correct (Levenshtein <= 1 for 4-6 chars, <= 2 for 7+ chars)
    if (clean.length >= 4) {
        let bestMatch = null;
        let bestDist = Infinity;
        const maxDist = clean.length >= 7 ? 2 : 1;
        for (const t of tiers) {
            for (const candidate of p[t.key]) {
                if (Math.abs(candidate.length - clean.length) <= maxDist) {
                    const dist = levenshtein(clean, candidate);
                    if (dist <= maxDist && dist < bestDist) {
                        bestDist = dist;
                        const isTop1 = t.key === 'legendary' && top1Word && candidate === top1Word;
                        bestMatch = {
                            valid: true,
                            tier: isTop1 ? 'MYTHIC' : t.label,
                            score: isTop1 ? 1500 : t.score,
                            matched: candidate,
                            autoCorrected: true,
                            isTop1: Boolean(isTop1),
                        };
                    }
                }
            }
        }
        if (bestMatch) return bestMatch;
    }

    return { valid: false, tier: 'INVALID', score: 0, matched: null };
}

/**
 * Krillion-style live spelling helper: when player types 3+ chars close to a valid word,
 * returns up to 3 closest spelling completions/corrections (without giving away rarity tier).
 */
function getSpellingSuggestions(promptId, rawQuery) {
    const p = PROMPTS.find(item => item.id === promptId);
    const clean = normalize(rawQuery);
    if (!p || clean.length < 3) return [];

    const all = [...p.common, ...p.uncommon, ...p.rare, ...p.legendary];
    const unique = Array.from(new Set(all));
    const prefixHits = [];
    const fuzzyHits = [];

    for (const word of unique) {
        if (word === clean) continue;
        if (word.startsWith(clean)) {
            prefixHits.push(word);
        } else if (clean.length >= 4 && Math.abs(word.length - clean.length) <= 2) {
            const d = levenshtein(clean, word);
            if (d <= (clean.length >= 7 ? 2 : 1)) {
                fuzzyHits.push({ word, d });
            }
        }
    }

    fuzzyHits.sort((a, b) => a.d - b.d);
    const merged = [...prefixHits.slice(0, 3), ...fuzzyHits.map(f => f.word)];
    return Array.from(new Set(merged)).slice(0, 3);
}

function getDailyPrompts(count = 5) {
    // Deterministic daily shuffle based on UTC date
    const daySeed = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    const copy = [...PROMPTS];
    let s = daySeed;
    for (let i = copy.length - 1; i > 0; i--) {
        s = (s * 1664525 + 1013904223) >>> 0;
        const j = s % (i + 1);
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count).map(p => ({ id: p.id, category: p.category, prompt: p.prompt }));
}

function getRandomPrompt(excludeIds = []) {
    const pool = PROMPTS.filter(p => !excludeIds.includes(p.id));
    const list = pool.length ? pool : PROMPTS;
    const pick = list[Math.floor(Math.random() * list.length)];
    return { id: pick.id, category: pick.category, prompt: pick.prompt };
}

function pickBotAnswer(promptId, skillLevel = 'easy') {
    const p = PROMPTS.find(item => item.id === promptId);
    if (!p) return 'apple';
    const r = Math.random();
    let pool = p.common;
    if (skillLevel === 'grandmaster') {
        pool = r < 0.50 ? p.legendary : r < 0.95 ? p.rare : p.uncommon;
    } else if (skillLevel === 'hard' || skillLevel === 'high') {
        pool = r < 0.15 ? p.legendary : r < 0.55 ? p.rare : r < 0.90 ? p.uncommon : p.common;
    } else if (skillLevel === 'medium') {
        pool = r < 0.02 ? p.legendary : r < 0.20 ? p.rare : r < 0.65 ? p.uncommon : p.common;
    } else {
        // 'easy' / 'low': welcoming starter AI (75% common, 25% uncommon)
        pool = r < 0.25 ? p.uncommon : p.common;
    }
    return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = {
    PROMPTS,
    scoreAnswer,
    getSpellingSuggestions,
    getDailyPrompts,
    getRandomPrompt,
    pickBotAnswer,
};
