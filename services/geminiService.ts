import { GoogleGenAI } from "@google/genai";
import { Player, PlayerCategory } from "../types";
import { formatCurrency } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * OFFLINE FALLBACK ENGINE
 * Generates realistic-sounding reports based on stats when API is down/limited.
 */
const generateOfflineAnalysis = (player: Player): string => {
    const { role, stats, isUncapped, isOverseas, name } = player;
    
    // 1. Uncapped Logic
    if (isUncapped) {
        const templates = [
            `A promising young talent looking to make a mark. With ${stats.matches} domestic matches, ${name} offers raw potential and a budget-friendly option for the long term.`,
            `Scouts have been watching this ${role.toLowerCase()} closely. Shows flashes of brilliance and could be a steal at base price for teams building for the future.`,
            `High-potential uncapped ${role.toLowerCase()}. While inexperienced at the IPL level, recent domestic performances suggest ${name} is ready for the big stage.`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    // 2. Veteran/Experienced Logic (High Matches)
    if (stats.matches > 100) {
        if (role === PlayerCategory.BATSMAN) {
            return `A seasoned campaigner with ${stats.matches} IPL matches. His experience anchors the innings, and a strike rate of ${stats.strikeRate} proves he can accelerate when needed.`;
        } else if (role === PlayerCategory.BOWLER) {
            return `Veteran bowler with vast experience. Known for handling pressure situations, his economy of ${stats.economy} makes him a reliable bankable asset for any captain.`;
        }
    }

    // 3. Performance Based Logic
    if (role === PlayerCategory.BATSMAN || role === PlayerCategory.WICKET_KEEPER) {
        if ((stats.strikeRate || 0) > 145) {
            return `Explosive power-hitter suited for the death overs. With a strike rate of ${stats.strikeRate}, ${name} is a nightmare for bowlers and a match-winner on his day.`;
        } else if ((stats.average || 0) > 35) {
            return `Mr. Consistent. An average of ${stats.average} indicates high reliability. He stabilizes the top order and allows power-hitters to play freely around him.`;
        }
        return `A solid technical batter who can adapt to different match situations. Adds depth to the batting lineup and brings valuable experience to the squad.`;
    }

    if (role === PlayerCategory.BOWLER) {
        if ((stats.economy || 10) < 7.5) {
            return `Economical spell-caster. An economy rate of ${stats.economy} is gold dust in T20s. He strangles the opposition scoring rate in the powerplay.`;
        } else if ((stats.wickets || 0) > 50) {
            return `A genuine wicket-taker. With ${stats.wickets} scalps to his name, he has a knack for breaking partnerships at crucial junctures of the game.`;
        }
        return `A utility bowler who hits hard lengths. Provides captain with flexible options and can bowl decent overs in the middle phase.`;
    }

    if (role === PlayerCategory.ALL_ROUNDER) {
        return `The complete package. Balances the side perfectly by offering overs with the ball and firepower with the bat. A high-value target for auction dynamics.`;
    }

    return `A competitive cricketer with good recent form. ${name} brings energy to the field and fits well into specific tactical setups.`;
};

const generateOfflinePricePrediction = (player: Player): string => {
    let estimated = player.basePrice;
    
    // Simple Multipliers
    if (player.isOverseas) estimated *= 1.5;
    if (player.role === PlayerCategory.ALL_ROUNDER) estimated *= 1.8;
    if (player.role === PlayerCategory.WICKET_KEEPER) estimated *= 1.4;
    
    // Stats Multipliers
    if ((player.stats.strikeRate || 0) > 150) estimated *= 1.5;
    if ((player.stats.economy || 10) < 7.5 && player.role === PlayerCategory.BOWLER) estimated *= 1.5;
    if (player.stats.matches > 100) estimated *= 1.2;

    // Random Variance (0.8x to 1.2x)
    const variance = 0.8 + Math.random() * 0.4;
    estimated = Math.floor(estimated * variance);

    // Cap at reasonable max (e.g. 25 Cr) to stay realistic
    if (estimated > 250000000) estimated = 250000000;

    return formatCurrency(estimated);
};

// ------------------------------------------------------------------

export const getPlayerAnalysis = async (player: Player) => {
  // 1. Try API if Key exists
  try {
    if (process.env.API_KEY) {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Provide a very short, 2-sentence auction analysis for cricket player ${player.name} (${player.role}). Stats: Matches-${player.stats.matches}, SR-${player.stats.strikeRate}, Econ-${player.stats.economy}. Focus on IPL value.`,
        });
        return response.text;
    }
  } catch (error: any) {
    // If API fails (Quota/Network), fall through to offline
    console.warn("Gemini API unavailable or quota exceeded. Switching to Local Intelligence Engine.");
  }

  // 2. Fallback to Local Offline Engine (Unlimited Use)
  return generateOfflineAnalysis(player);
};

export const predictPlayerPrice = async (player: Player) => {
    try {
        if (process.env.API_KEY) {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Predict the estimated sold price for IPL player ${player.name} (Base: ${formatCurrency(player.basePrice)}). Return only the value (e.g., "5.5 Cr").`,
            });
            return response.text;
        }
    } catch (error) {
        // Fall through
    }
    
    // Fallback
    return generateOfflinePricePrediction(player);
}