/**
 * Free Live Wikipedia Fallback Validator for MindDrop
 * When a player submits a genuinely obscure real answer that is not yet in our
 * curated 5,000+ word bank, this verifies it against Wikipedia's free Summary API
 * (zero API key, fast 1.8s timeout, cached in memory) and rewards it as RARE/LEGENDARY.
 */

const CATEGORY_RULES = {
    countries_europe: { keywords: ['country in europe', 'european country', 'sovereign state in europe', 'microstate in europe'] },
    countries_asia: { keywords: ['country in asia', 'asian country', 'country in east asia', 'country in south asia', 'country in southeast asia', 'country in central asia', 'country in western asia', 'middle east'] },
    countries_africa: { keywords: ['country in africa', 'african country', 'country in west africa', 'country in east africa', 'country in north africa', 'country in southern africa', 'country in central africa'] },
    countries_americas: { keywords: ['country in north america', 'country in south america', 'country in central america', 'island country in the caribbean'] },
    capitals: { keywords: ['capital and', 'capital city of', 'capital of'] },
    us_states: { keywords: ['u.s. state', 'state in the united states', 'state of the united states'] },
    fruits: { keywords: ['fruit', 'berry', 'citrus', 'edible fruit', 'drupe'] },
    vegetables: { keywords: ['vegetable', 'root vegetable', 'leafy green', 'edible plant', 'cultivar of'] },
    trees: { keywords: ['species of tree', 'genus of trees', 'tree native to', 'conifer', 'evergreen tree', 'deciduous tree'] },
    flowers: { keywords: ['flowering plant', 'species of flower', 'ornamental plant', 'genus of flowering'] },
    elements: { keywords: ['chemical element'] },
    animals_ocean: { keywords: ['marine', 'sea creature', 'species of fish', 'species of shark', 'cetacean', 'crustacean', 'mollusk', 'cephalopod', 'ocean'] },
    birds: { keywords: ['species of bird', 'genus of birds', 'bird in the family', 'waterbird', 'seabird', 'songbird', 'raptor'] },
    insects: { keywords: ['species of insect', 'genus of insects', 'beetle', 'butterfly', 'moth', 'wasp', 'ant', 'fly', 'arthropod'] },
    dog_breeds: { keywords: ['breed of dog', 'dog breed', 'domestic dog'] },
    dinosaurs: { keywords: ['dinosaur', 'extinct genus', 'theropod', 'sauropod', 'pterosaur', 'prehistoric reptile', 'cretaceous', 'jurassic'] },
    wild_mammals: { keywords: ['species of mammal', 'mammal native to', 'carnivoran', 'ungulate', 'primate', 'marsupial', 'rodent'] },
    reptiles_amphibians: { keywords: ['species of snake', 'species of lizard', 'species of frog', 'species of toad', 'species of turtle', 'reptile', 'amphibian', 'salamander', 'gecko'] },
    programming_languages: { keywords: ['programming language', 'scripting language', 'markup language', 'query language'] },
    musical_instruments: { keywords: ['musical instrument', 'percussion instrument', 'string instrument', 'wind instrument', 'brass instrument', 'woodwind'] },
    music_genres: { keywords: ['music genre', 'genre of music', 'subgenre of', 'musical style', 'musical genre'] },
    sports: { keywords: ['sport', 'athletic', 'martial art', 'team sport', 'racquet sport', 'combat sport'] },
    football_clubs: { keywords: ['football club', 'soccer club', 'professional football', 'f.c.'] },
    nba_nfl_teams: { keywords: ['national basketball association', 'national football league', 'nba', 'nfl'] },
    mythical_creatures: { keywords: ['mythological', 'legendary creature', 'folklore', 'mythology', 'cryptid', 'fantasy creature'] },
    car_brands: { keywords: ['automotive', 'automobile manufacturer', 'car manufacturer', 'automaker', 'motor company', 'marque'] },
    video_games: { keywords: ['video game', 'action-adventure game', 'role-playing game', 'first-person shooter', 'platform game', 'sandbox game'] },
    superheroes: { keywords: ['superhero', 'supervillain', 'comic book character', 'marvel comics', 'dc comics'] },
    pokemon: { keywords: ['pokémon', 'pokemon'] },
    minecraft_items: { keywords: ['minecraft'] },
    movies: { keywords: ['film', 'movie', 'animated feature', 'motion picture'] },
    tv_shows: { keywords: ['television series', 'tv series', 'sitcom', 'television show', 'animated series', 'miniseries'] },
    anime: { keywords: ['manga series', 'anime', 'japanese manga', 'light novel'] },
    bands_singers: { keywords: ['singer', 'rapper', 'musician', 'rock band', 'pop band', 'band formed', 'songwriter', 'vocalist', 'hip hop'] },
    famous_books: { keywords: ['novel', 'book by', 'play by', 'epic poem', 'fantasy series', 'non-fiction book'] },
    famous_scientists: { keywords: ['physicist', 'chemist', 'biologist', 'mathematician', 'inventor', 'astronomer', 'scientist', 'engineer'] },
    historical_figures: { keywords: ['emperor', 'king of', 'queen of', 'president of', 'prime minister', 'general', 'politician', 'philosopher', 'explorer', 'revolutionary', 'ruler'] },
    famous_landmarks: { keywords: ['landmark', 'monument', 'cathedral', 'palace', 'castle', 'skyscraper', 'bridge', 'tower', 'archaeological site', 'world heritage'] },
    space_objects: { keywords: ['planet', 'moon of', 'natural satellite', 'star in the', 'galaxy', 'nebula', 'asteroid', 'comet', 'exoplanet', 'constellation', 'black hole'] },
    board_games: { keywords: ['board game', 'tabletop game', 'strategy game', 'abstract strategy'] },
    card_games: { keywords: ['card game', 'trick-taking game', 'shedding-type', 'solitaire'] },
    cheeses: { keywords: ['cheese'] },
    desserts: { keywords: ['dessert', 'pastry', 'cake', 'confection', 'sweet', 'pudding', 'tart', 'cookie'] },
    drinks: { keywords: ['drink', 'beverage', 'cocktail', 'liqueur', 'tea', 'coffee', 'soft drink', 'soda', 'beer', 'wine'] },
    fast_food: { keywords: ['fast food', 'restaurant chain', 'coffeehouse chain', 'pizza chain', 'burger chain'] },
    snacks_chips: { keywords: ['snack', 'candy', 'chocolate bar', 'potato chip', 'crisp', 'confectionery', 'biscuit'] },
    pasta_noodles: { keywords: ['pasta', 'noodle', 'dumpling'] },
    spices_herbs: { keywords: ['spice', 'herb', 'culinary herb', 'seasoning'] },
    breakfast_foods: { keywords: ['breakfast', 'pastry', 'porridge', 'cereal', 'pancake', 'bread', 'egg dish'] },
    pizza_toppings: { keywords: ['cheese', 'sausage', 'vegetable', 'mushroom', 'herb', 'meat', 'ham', 'seafood', 'pepper'] },
    gems_minerals: { keywords: ['gemstone', 'mineral', 'precious stone', 'silicate', 'crystal', 'rock'] },
    colors: { keywords: ['color', 'colour', 'shade of', 'tint of', 'hue'] },
    shapes: { keywords: ['polygon', 'polyhedron', 'geometric shape', 'plane figure', 'solid figure', 'curve'] },
    human_body: { keywords: ['bone', 'muscle', 'organ', 'anatomical', 'human body', 'gland', 'artery', 'vein', 'nerve'] },
    jobs: { keywords: ['occupation', 'profession', 'job', 'tradesperson', 'specialist', 'worker'] },
    weather_phenomena: { keywords: ['weather', 'meteorological', 'atmospheric phenomenon', 'storm', 'cloud', 'wind', 'natural disaster'] },
    clothing_items: { keywords: ['garment', 'clothing', 'footwear', 'headgear', 'hat', 'shoe', 'coat', 'dress', 'trousers'] },
    clothing_brands: { keywords: ['fashion', 'clothing', 'footwear', 'apparel', 'sportswear', 'luxury goods', 'shoe'] },
    tech_brands: { keywords: ['technology company', 'software company', 'social media', 'video game', 'electronics', 'web application', 'mobile app', 'cloud'] },
    kitchen_items: { keywords: ['kitchen', 'cookware', 'utensil', 'appliance', 'cutlery', 'tableware'] },
    furniture: { keywords: ['furniture', 'seat', 'chair', 'table', 'cabinet', 'bed'] },
    tools_hardware: { keywords: ['hand tool', 'power tool', 'tool used', 'woodworking', 'metalworking', 'cutting tool'] },
    school_subjects: { keywords: ['academic discipline', 'branch of', 'study of', 'field of study', 'science of'] },
    vehicles_transport: { keywords: ['vehicle', 'aircraft', 'watercraft', 'ship', 'train', 'boat', 'locomotive', 'bicycle', 'car'] },
    weapons_medieval: { keywords: ['weapon', 'sword', 'polearm', 'firearm', 'siege engine', 'dagger', 'axe', 'bow', 'spear'] },
    phobias: { keywords: ['phobia', 'fear of'] },
    currencies: { keywords: ['currency of', 'official currency', 'monetary unit', 'historical currency'] },
    languages: { keywords: ['language spoken', 'natural language', 'language of', 'dialect', 'creole language'] },
    types_of_dance: { keywords: ['dance', 'folk dance', 'ballroom', 'choreography'] },
};

class WikiValidator {
    constructor() {
        this.cache = new Map(); // `${promptId}:${clean}` -> result | false
    }

    async _fetchSummary(title) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1800);
        try {
            const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/\s+/g, '_'))}`;
            const res = await fetch(url, {
                headers: { 'User-Agent': 'MindDropGame/1.0 (https://minddrop-combat.onrender.com)' },
                signal: controller.signal,
            });
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        } finally {
            clearTimeout(timer);
        }
    }

    async verifyAnswer(prompt, rawAnswer) {
        if (!prompt || !prompt.id) return null;
        const rule = CATEGORY_RULES[prompt.id];
        if (!rule) return null;

        const clean = String(rawAnswer || '')
            .toLowerCase()
            .replace(/[^a-z0-9+# -]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        if (clean.length < 3 || clean.length > 40) return null;

        const cacheKey = `${prompt.id}:${clean}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        // Try direct title first, then disambiguated title for Pokémon/Films/etc.
        const attempts = [clean];
        if (prompt.id === 'pokemon') attempts.push(`${clean} (Pokémon)`);
        else if (prompt.id === 'movies') attempts.push(`${clean} (film)`);
        else if (prompt.id === 'video_games') attempts.push(`${clean} (video game)`);
        else if (prompt.id === 'football_clubs') attempts.push(`${clean} F.C.`);

        let matchedTitle = null;
        for (const title of attempts) {
            const data = await this._fetchSummary(title);
            if (!data || data.type !== 'standard') continue;
            const haystack = `${data.title || ''} ${data.description || ''} ${data.extract || ''}`.toLowerCase();
            if (rule.keywords.some(kw => haystack.includes(kw))) {
                matchedTitle = data.title || clean;
                break;
            }
        }

        const cleanedTitle = matchedTitle ? matchedTitle.replace(/\s*\([^)]*\)$/, '').toLowerCase() : '';
        const displayMatch = cleanedTitle && !cleanedTitle.startsWith('list of ') ? cleanedTitle : clean;
        const result = matchedTitle
            ? {
                valid: true,
                tier: 'RARE',
                score: 800,
                matched: displayMatch,
                autoCorrected: false,
                viaWiki: true,
            }
            : null;

        if (this.cache.size > 2000) this.cache.clear();
        this.cache.set(cacheKey, result);
        return result;
    }
}

module.exports = new WikiValidator();
