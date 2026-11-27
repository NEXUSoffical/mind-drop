/**
 * MindDrop — Wild West Cosmetics & Gold Shop Catalog
 * Players earn Gold from every match across all 4 games + Level Up bonuses.
 */

const SHOP_ITEMS = [
    // COWBOY HAT & OUTFIT THEMES
    { id: 'hat_classic', slot: 'hat', name: 'Classic Outlaw', price: 0, color: '#0f0502', accent: '#d97706', desc: 'Standard frontier silhouette.' },
    { id: 'hat_golden_marshal', slot: 'hat', name: 'Golden Marshal', price: 150, color: '#78350f', accent: '#fde047', desc: 'Gleaming gold hat band and star.' },
    { id: 'hat_crimson_bandit', slot: 'hat', name: 'Crimson Bandit', price: 200, color: '#450a0a', accent: '#ef4444', desc: 'Blood-red outlaw bandana and trim.' },
    { id: 'hat_emerald_gambler', slot: 'hat', name: 'Emerald Gambler', price: 300, color: '#064e3b', accent: '#34d399', desc: 'High-roller saloon velvet hat.' },
    { id: 'hat_midnight_phantom', slot: 'hat', name: 'Midnight Phantom', price: 350, color: '#0c4a6e', accent: '#38bdf8', desc: 'Ghostly cyan-rimmed gunslinger.' },
    { id: 'hat_inferno_legend', slot: 'hat', name: 'Inferno Legend', price: 500, color: '#7c2d12', accent: '#fb923c', desc: 'Blazing amber-flame hat aura.' },

    // BULLET & SPARKLE TRAIL EFFECTS
    { id: 'trail_amber', slot: 'trail', name: 'Classic Brass', price: 0, color: '#fbbf24', desc: 'Standard golden brass tracer.' },
    { id: 'trail_lightning', slot: 'trail', name: 'Blue Lightning', price: 200, color: '#38bdf8', desc: 'Electric cyan bullet & click rings.' },
    { id: 'trail_crimson', slot: 'trail', name: 'Crimson Flame', price: 250, color: '#f43f5e', desc: 'Fiery scarlet sparks & tracers.' },
    { id: 'trail_emerald', slot: 'trail', name: 'Venom Emerald', price: 300, color: '#34d399', desc: 'Glowing emerald streak.' },
    { id: 'trail_violet', slot: 'trail', name: 'Mythic Plasma', price: 450, color: '#c084fc', desc: 'Radiant purple mythic trail.' },

    // NAMEPLATE & LEADERBOARD COLORS
    { id: 'name_default', slot: 'nameColor', name: 'Frontier Cream', price: 0, color: '#fef3c7', desc: 'Classic parchment name color.' },
    { id: 'name_gold', slot: 'nameColor', name: 'Solid Gold', price: 150, color: '#fde047', desc: 'Shine in gold on the Top 100.' },
    { id: 'name_cyan', slot: 'nameColor', name: 'Electric Cyan', price: 200, color: '#38bdf8', desc: 'Crisp sky-blue nameplate.' },
    { id: 'name_rose', slot: 'nameColor', name: 'Outlaw Crimson', price: 200, color: '#fb7185', desc: 'Bold wanted-poster red name.' },
    { id: 'name_emerald', slot: 'nameColor', name: 'Jade Sheriff', price: 250, color: '#34d399', desc: 'Bright emerald nameplate.' },
    { id: 'name_violet', slot: 'nameColor', name: 'Royal Amethyst', price: 300, color: '#c084fc', desc: 'Rare violet legend nameplate.' },
];

const DEFAULT_OWNED = ['hat_classic', 'trail_amber', 'name_default'];
const DEFAULT_EQUIPPED = {
    hat: 'hat_classic',
    trail: 'trail_amber',
    nameColor: 'name_default',
};

function getItemById(id) {
    return SHOP_ITEMS.find(x => x.id === id) || null;
}

function resolveEquippedVisuals(equipped) {
    const eq = Object.assign({}, DEFAULT_EQUIPPED, equipped || {});
    const hatItem = getItemById(eq.hat) || getItemById('hat_classic');
    const trailItem = getItemById(eq.trail) || getItemById('trail_amber');
    const nameItem = getItemById(eq.nameColor) || getItemById('name_default');
    return {
        hat: eq.hat,
        trail: eq.trail,
        nameColor: eq.nameColor,
        hatColor: hatItem.color,
        hatAccent: hatItem.accent,
        trailColor: trailItem.color,
        nameHex: nameItem.color,
    };
}

module.exports = {
    SHOP_ITEMS,
    DEFAULT_OWNED,
    DEFAULT_EQUIPPED,
    getItemById,
    resolveEquippedVisuals,
};
