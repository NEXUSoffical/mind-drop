/**
 * MindDrop — Quick-Draw Trivia Question Bank
 * Fast, unambiguous 4-choice trivia questions across 10 categories.
 * Every entry has: id, category, question, choices (4), answerIndex (0-3).
 */

const TRIVIA_QUESTIONS = [
    // GEOGRAPHY
    { id: 'geo_1', category: 'GEOGRAPHY', question: 'What is the capital city of Australia?', choices: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], answerIndex: 2 },
    { id: 'geo_2', category: 'GEOGRAPHY', question: 'Which country has the most natural lakes in the world?', choices: ['Russia', 'Canada', 'Finland', 'Brazil'], answerIndex: 1 },
    { id: 'geo_3', category: 'GEOGRAPHY', question: 'Which river flows through Cairo?', choices: ['Amazon', 'Nile', 'Danube', 'Euphrates'], answerIndex: 1 },
    { id: 'geo_4', category: 'GEOGRAPHY', question: 'What is the smallest country in the world by land area?', choices: ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'], answerIndex: 2 },
    { id: 'geo_5', category: 'GEOGRAPHY', question: 'Which desert covers much of northern Africa?', choices: ['Gobi', 'Kalahari', 'Atacama', 'Sahara'], answerIndex: 3 },
    { id: 'geo_6', category: 'GEOGRAPHY', question: 'Mount Kilimanjaro is located in which country?', choices: ['Kenya', 'Tanzania', 'Ethiopia', 'Uganda'], answerIndex: 1 },
    { id: 'geo_7', category: 'GEOGRAPHY', question: 'What is the capital of Japan?', choices: ['Kyoto', 'Osaka', 'Tokyo', 'Hiroshima'], answerIndex: 2 },
    { id: 'geo_8', category: 'GEOGRAPHY', question: 'Which U.S. state is nicknamed the Lone Star State?', choices: ['Arizona', 'Texas', 'Nevada', 'Montana'], answerIndex: 1 },
    { id: 'geo_9', category: 'GEOGRAPHY', question: 'Which ocean is the largest and deepest on Earth?', choices: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], answerIndex: 2 },
    { id: 'geo_10', category: 'GEOGRAPHY', question: 'Which European city is famous for its canals and gondolas?', choices: ['Florence', 'Venice', 'Milan', 'Naples'], answerIndex: 1 },
    { id: 'geo_11', category: 'GEOGRAPHY', question: 'What is the capital of Canada?', choices: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'], answerIndex: 2 },
    { id: 'geo_12', category: 'GEOGRAPHY', question: 'Which country is shaped like a boot on the map?', choices: ['Greece', 'Spain', 'Italy', 'Portugal'], answerIndex: 2 },

    // SCIENCE & SPACE
    { id: 'sci_1', category: 'SCIENCE', question: 'What is the chemical symbol for Gold?', choices: ['Gd', 'Go', 'Au', 'Ag'], answerIndex: 2 },
    { id: 'sci_2', category: 'SCIENCE', question: 'Which planet is known as the Red Planet?', choices: ['Venus', 'Mars', 'Jupiter', 'Mercury'], answerIndex: 1 },
    { id: 'sci_3', category: 'SCIENCE', question: 'How many bones are in the adult human body?', choices: ['186', '206', '226', '256'], answerIndex: 1 },
    { id: 'sci_4', category: 'SCIENCE', question: 'What gas do plants primarily absorb for photosynthesis?', choices: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Helium'], answerIndex: 2 },
    { id: 'sci_5', category: 'SCIENCE', question: 'What is the hardest naturally occurring mineral on Earth?', choices: ['Quartz', 'Topaz', 'Diamond', 'Titanium'], answerIndex: 2 },
    { id: 'sci_6', category: 'SCIENCE', question: 'Which planet in our solar system has the most prominent rings?', choices: ['Uranus', 'Neptune', 'Saturn', 'Jupiter'], answerIndex: 2 },
    { id: 'sci_7', category: 'SCIENCE', question: 'What is the boiling point of water at sea level in Celsius?', choices: ['90 C', '100 C', '110 C', '212 C'], answerIndex: 1 },
    { id: 'sci_8', category: 'SCIENCE', question: 'Which organ pumps blood throughout the human body?', choices: ['Liver', 'Lungs', 'Heart', 'Kidneys'], answerIndex: 2 },
    { id: 'sci_9', category: 'SCIENCE', question: 'What force keeps planets orbiting the Sun?', choices: ['Magnetism', 'Friction', 'Gravity', 'Inertia'], answerIndex: 2 },
    { id: 'sci_10', category: 'SCIENCE', question: 'What is the chemical symbol for Sodium?', choices: ['So', 'Sd', 'Na', 'Ni'], answerIndex: 2 },
    { id: 'sci_11', category: 'SCIENCE', question: 'Which planet is closest to the Sun?', choices: ['Venus', 'Mercury', 'Mars', 'Earth'], answerIndex: 1 },
    { id: 'sci_12', category: 'SCIENCE', question: 'How many legs does a spider have?', choices: ['6', '8', '10', '12'], answerIndex: 1 },

    // HISTORY
    { id: 'his_1', category: 'HISTORY', question: 'In what year did humans first land on the Moon?', choices: ['1965', '1969', '1972', '1959'], answerIndex: 1 },
    { id: 'his_2', category: 'HISTORY', question: 'Who was the first President of the United States?', choices: ['Thomas Jefferson', 'Abraham Lincoln', 'George Washington', 'John Adams'], answerIndex: 2 },
    { id: 'his_3', category: 'HISTORY', question: 'Which ancient civilization built the pyramids at Giza?', choices: ['Romans', 'Greeks', 'Egyptians', 'Mayans'], answerIndex: 2 },
    { id: 'his_4', category: 'HISTORY', question: 'In what year did the Titanic sink?', choices: ['1905', '1912', '1918', '1923'], answerIndex: 1 },
    { id: 'his_5', category: 'HISTORY', question: 'Who painted the Mona Lisa?', choices: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Donatello'], answerIndex: 2 },
    { id: 'his_6', category: 'HISTORY', question: 'The Berlin Wall fell in which year?', choices: ['1979', '1985', '1989', '1993'], answerIndex: 2 },
    { id: 'his_7', category: 'HISTORY', question: 'Which empire was ruled by Julius Caesar?', choices: ['Ottoman Empire', 'Roman Republic', 'British Empire', 'Persian Empire'], answerIndex: 1 },
    { id: 'his_8', category: 'HISTORY', question: 'Who invented the practical incandescent light bulb?', choices: ['Nikola Tesla', 'Thomas Edison', 'Alexander Bell', 'Henry Ford'], answerIndex: 1 },
    { id: 'his_9', category: 'HISTORY', question: 'Which ship carried the Pilgrims to Plymouth in 1620?', choices: ['Santa Maria', 'Mayflower', 'Endeavour', 'Beagle'], answerIndex: 1 },
    { id: 'his_10', category: 'HISTORY', question: 'World War II ended in what year?', choices: ['1941', '1943', '1945', '1948'], answerIndex: 2 },

    // GAMING
    { id: 'gam_1', category: 'GAMING', question: 'What is the best-selling video game of all time?', choices: ['GTA V', 'Minecraft', 'Tetris', 'Fortnite'], answerIndex: 1 },
    { id: 'gam_2', category: 'GAMING', question: 'Who is the main protagonist of The Legend of Zelda series?', choices: ['Zelda', 'Ganon', 'Link', 'Epona'], answerIndex: 2 },
    { id: 'gam_3', category: 'GAMING', question: 'Which company created the PlayStation console?', choices: ['Nintendo', 'Sega', 'Sony', 'Microsoft'], answerIndex: 2 },
    { id: 'gam_4', category: 'GAMING', question: 'What is the name of the plumber who is Mario\'s brother?', choices: ['Wario', 'Toad', 'Luigi', 'Bowser'], answerIndex: 2 },
    { id: 'gam_5', category: 'GAMING', question: 'In Minecraft, what material is needed to mine Obsidian?', choices: ['Iron Pickaxe', 'Gold Pickaxe', 'Diamond Pickaxe', 'Stone Pickaxe'], answerIndex: 2 },
    { id: 'gam_6', category: 'GAMING', question: 'Which Battle Royale game features the Battle Bus?', choices: ['PUBG', 'Apex Legends', 'Fortnite', 'Warzone'], answerIndex: 2 },
    { id: 'gam_7', category: 'GAMING', question: 'What color is Pac-Man?', choices: ['Red', 'Yellow', 'Blue', 'Orange'], answerIndex: 1 },
    { id: 'gam_8', category: 'GAMING', question: 'Which iconic Pokemon is #25 in the Pokedex?', choices: ['Charizard', 'Eevee', 'Pikachu', 'Mewtwo'], answerIndex: 2 },
    { id: 'gam_9', category: 'GAMING', question: 'In Roblox, what is the virtual currency called?', choices: ['V-Bucks', 'Robux', 'Minecoins', 'Gems'], answerIndex: 1 },
    { id: 'gam_10', category: 'GAMING', question: 'What is the name of the cowboy outlaw protagonist in Red Dead Redemption 2?', choices: ['John Marston', 'Arthur Morgan', 'Dutch van der Linde', 'Micah Bell'], answerIndex: 1 },

    // MOVIES & TV
    { id: 'mov_1', category: 'MOVIES', question: 'Who directed Jurassic Park and Jaws?', choices: ['James Cameron', 'Steven Spielberg', 'Christopher Nolan', 'George Lucas'], answerIndex: 1 },
    { id: 'mov_2', category: 'MOVIES', question: 'What is the name of the fictional African nation in Black Panther?', choices: ['Genosha', 'Sokovia', 'Wakanda', 'Latveria'], answerIndex: 2 },
    { id: 'mov_3', category: 'MOVIES', question: 'In The Lion King, what is the name of Simba\'s evil uncle?', choices: ['Mufasa', 'Scar', 'Zazu', 'Rafiki'], answerIndex: 1 },
    { id: 'mov_4', category: 'MOVIES', question: 'Which wizard school does Harry Potter attend?', choices: ['Beauxbatons', 'Durmstrang', 'Hogwarts', 'Ilvermorny'], answerIndex: 2 },
    { id: 'mov_5', category: 'MOVIES', question: 'What is the name of the cowboy doll in Toy Story?', choices: ['Buzz', 'Woody', 'Jessie', 'Rex'], answerIndex: 1 },
    { id: 'mov_6', category: 'MOVIES', question: 'In Star Wars, who is Luke Skywalker\'s father?', choices: ['Obi-Wan Kenobi', 'Han Solo', 'Darth Vader', 'Yoda'], answerIndex: 2 },
    { id: 'mov_7', category: 'MOVIES', question: 'Which movie features the famous line "I\'ll be back"?', choices: ['Die Hard', 'RoboCop', 'The Terminator', 'Predator'], answerIndex: 2 },
    { id: 'mov_8', category: 'MOVIES', question: 'What kind of animal is Shrek\'s best friend?', choices: ['Horse', 'Donkey', 'Dragon', 'Cat'], answerIndex: 1 },
    { id: 'mov_9', category: 'MOVIES', question: 'In The Matrix, which pill lets Neo see the truth?', choices: ['Blue Pill', 'Red Pill', 'Green Pill', 'Gold Pill'], answerIndex: 1 },
    { id: 'mov_10', category: 'MOVIES', question: 'Which superhero is known as the Dark Knight?', choices: ['Superman', 'Spider-Man', 'Batman', 'Iron Man'], answerIndex: 2 },

    // SPORTS
    { id: 'spt_1', category: 'SPORTS', question: 'How many players from one team are on a football (soccer) pitch at kickoff?', choices: ['9', '10', '11', '12'], answerIndex: 2 },
    { id: 'spt_2', category: 'SPORTS', question: 'In basketball, how many points is a shot from behind the arc worth?', choices: ['2', '3', '4', '1'], answerIndex: 1 },
    { id: 'spt_3', category: 'SPORTS', question: 'Which country has won the most FIFA Men\'s World Cup titles?', choices: ['Germany', 'Argentina', 'Italy', 'Brazil'], answerIndex: 3 },
    { id: 'spt_4', category: 'SPORTS', question: 'What sport is played at Wimbledon?', choices: ['Golf', 'Cricket', 'Tennis', 'Rugby'], answerIndex: 2 },
    { id: 'spt_5', category: 'SPORTS', question: 'How many rings are on the Olympic flag?', choices: ['4', '5', '6', '7'], answerIndex: 1 },
    { id: 'spt_6', category: 'SPORTS', question: 'In boxing, what does "KO" stand for?', choices: ['Kick Out', 'Knock Out', 'Keep On', 'King Over'], answerIndex: 1 },
    { id: 'spt_7', category: 'SPORTS', question: 'Which athlete is nicknamed "Lightning Bolt"?', choices: ['Michael Phelps', 'Usain Bolt', 'LeBron James', 'Lionel Messi'], answerIndex: 1 },
    { id: 'spt_8', category: 'SPORTS', question: 'In golf, what is one stroke under par called?', choices: ['Eagle', 'Bogey', 'Birdie', 'Albatross'], answerIndex: 2 },
    { id: 'spt_9', category: 'SPORTS', question: 'How many innings are in a standard MLB baseball game?', choices: ['7', '8', '9', '10'], answerIndex: 2 },
    { id: 'spt_10', category: 'SPORTS', question: 'Which sport uses a shuttlecock?', choices: ['Squash', 'Badminton', 'Table Tennis', 'Pickleball'], answerIndex: 1 },

    // ANIMALS & NATURE
    { id: 'ani_1', category: 'ANIMALS', question: 'What is the fastest land animal in the world?', choices: ['Lion', 'Cheetah', 'Pronghorn', 'Greyhound'], answerIndex: 1 },
    { id: 'ani_2', category: 'ANIMALS', question: 'What is the largest mammal on Earth?', choices: ['African Elephant', 'Blue Whale', 'Orca', 'Hippopotamus'], answerIndex: 1 },
    { id: 'ani_3', category: 'ANIMALS', question: 'Which bird is famous for being unable to fly and living in Antarctica?', choices: ['Ostrich', 'Emu', 'Penguin', 'Kiwi'], answerIndex: 2 },
    { id: 'ani_4', category: 'ANIMALS', question: 'How many hearts does an octopus have?', choices: ['1', '2', '3', '4'], answerIndex: 2 },
    { id: 'ani_5', category: 'ANIMALS', question: 'What is a group of lions called?', choices: ['Pack', 'Herd', 'Pride', 'Flock'], answerIndex: 2 },
    { id: 'ani_6', category: 'ANIMALS', question: 'Which animal has the longest neck?', choices: ['Ostrich', 'Camel', 'Giraffe', 'Llama'], answerIndex: 2 },
    { id: 'ani_7', category: 'ANIMALS', question: 'What do pandas primarily eat?', choices: ['Eucalyptus', 'Bamboo', 'Fish', 'Berries'], answerIndex: 1 },
    { id: 'ani_8', category: 'ANIMALS', question: 'Which mammal is capable of true sustained flight?', choices: ['Flying Squirrel', 'Sugar Glider', 'Bat', 'Colugo'], answerIndex: 2 },

    // MUSIC
    { id: 'mus_1', category: 'MUSIC', question: 'Who is known as the "King of Pop"?', choices: ['Elvis Presley', 'Michael Jackson', 'Prince', 'Freddie Mercury'], answerIndex: 1 },
    { id: 'mus_2', category: 'MUSIC', question: 'How many strings does a standard acoustic guitar have?', choices: ['4', '5', '6', '8'], answerIndex: 2 },
    { id: 'mus_3', category: 'MUSIC', question: 'Which band released the hit song "Bohemian Rhapsody"?', choices: ['The Beatles', 'Queen', 'Pink Floyd', 'Led Zeppelin'], answerIndex: 1 },
    { id: 'mus_4', category: 'MUSIC', question: 'Which instrument has 88 keys on a standard full-size model?', choices: ['Accordion', 'Harpsichord', 'Piano', 'Organ'], answerIndex: 2 },
    { id: 'mus_5', category: 'MUSIC', question: 'Which city were The Beatles from?', choices: ['London', 'Manchester', 'Liverpool', 'Birmingham'], answerIndex: 2 },
    { id: 'mus_6', category: 'MUSIC', question: 'Which singer is famous for the album "Thriller"?', choices: ['Stevie Wonder', 'Michael Jackson', 'Whitney Houston', 'Madonna'], answerIndex: 1 },
    { id: 'mus_7', category: 'MUSIC', question: 'What is the highest female singing voice type?', choices: ['Alto', 'Mezzo', 'Soprano', 'Tenor'], answerIndex: 2 },
    { id: 'mus_8', category: 'MUSIC', question: 'Which rapper released the hit song "Lose Yourself"?', choices: ['Drake', 'Eminem', 'Kanye West', 'Jay-Z'], answerIndex: 1 },

    // FOOD & DRINK
    { id: 'fod_1', category: 'FOOD', question: 'Which country is the origin of sushi?', choices: ['China', 'Thailand', 'Japan', 'Korea'], answerIndex: 2 },
    { id: 'fod_2', category: 'FOOD', question: 'What is the main ingredient in guacamole?', choices: ['Tomato', 'Avocado', 'Lime', 'Jalapeno'], answerIndex: 1 },
    { id: 'fod_3', category: 'FOOD', question: 'Which nut is used to make traditional marzipan?', choices: ['Walnut', 'Hazelnut', 'Almond', 'Cashew'], answerIndex: 2 },
    { id: 'fod_4', category: 'FOOD', question: 'What type of pasta is shaped like little bow ties?', choices: ['Penne', 'Farfalle', 'Fusilli', 'Rigatoni'], answerIndex: 1 },
    { id: 'fod_5', category: 'FOOD', question: 'Which spice is the most expensive in the world by weight?', choices: ['Vanilla', 'Cardamom', 'Saffron', 'Cinnamon'], answerIndex: 2 },
    { id: 'fod_6', category: 'FOOD', question: 'What fruit is dried to make raisins?', choices: ['Plums', 'Grapes', 'Figs', 'Dates'], answerIndex: 1 },

    // TECH & GENERAL KNOWLEDGE
    { id: 'tec_1', category: 'TECH', question: 'What does "HTTP" stand for on the web?', choices: ['HyperText Transfer Protocol', 'High Tech Transmission Program', 'Host Terminal Transfer Path', 'Hyperlink Tool Text Process'], answerIndex: 0 },
    { id: 'tec_2', category: 'TECH', question: 'Which company developed the iPhone?', choices: ['Samsung', 'Google', 'Apple', 'Nokia'], answerIndex: 2 },
    { id: 'tec_3', category: 'TECH', question: 'In computing, how many bits are in a single byte?', choices: ['4', '8', '16', '32'], answerIndex: 1 },
    { id: 'tec_4', category: 'TECH', question: 'What does "CPU" stand for?', choices: ['Central Processing Unit', 'Core Power Utility', 'Computer Program User', 'Central Peripheral Unit'], answerIndex: 0 },
    { id: 'tec_5', category: 'GENERAL', question: 'How many colors are in a traditional rainbow?', choices: ['5', '6', '7', '8'], answerIndex: 2 },
    { id: 'tec_6', category: 'GENERAL', question: 'How many sides does an octagon have?', choices: ['6', '7', '8', '9'], answerIndex: 2 },
    { id: 'tec_7', category: 'GENERAL', question: 'What is the currency of the United Kingdom?', choices: ['Euro', 'Pound Sterling', 'Crown', 'Franc'], answerIndex: 1 },
    { id: 'tec_8', category: 'GENERAL', question: 'How many cards are in a standard playing deck (without jokers)?', choices: ['48', '50', '52', '54'], answerIndex: 2 },
    { id: 'tec_9', category: 'GENERAL', question: 'Which chess piece can only move diagonally?', choices: ['Rook', 'Knight', 'Bishop', 'Queen'], answerIndex: 2 },
    { id: 'tec_10', category: 'GENERAL', question: 'What is the Roman numeral for 50?', choices: ['X', 'L', 'C', 'D'], answerIndex: 1 },
];

module.exports = { TRIVIA_QUESTIONS };
