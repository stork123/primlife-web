# Reading the Biots: A Field Guide

Every organism on screen is a **biot** — a body made of colored line segments
radiating from a central point. Each segment is one gene in the biot's genome.
The colors are not decoration: they are the biot's body plan, and they decide
who eats whom, who defends, and who mates.

## Segment Colors

| Color | Name | What it does |
|-------|------|--------------|
| **Green** | Leaf | Photosynthesizes. Each green segment turns sunlight into energy every tick. The more green you have, the more you eat — and the bigger a target you become. |
| **Red** | Teeth | Eats other biots. When a red segment touches a green segment, the red biot steals energy from the victim. |
| **Blue** | Shield | Defends. A blue segment that touches a red attacker takes *half* damage and damages the attacker in return. Blue armor is heavier (2× the mass of most segments), so heavily-armored biots are slow. |
| **White** | Genetic injector | Mating. A white segment that touches an adult biot of the same species injects a copy of the injector's genes — after which the receiver's next children are sexual hybrids. |
| **Light blue** | Fragile filler | Like blue, but has no defense — it's just destroyed by red teeth on contact. An evolutionary dead end (or a stepping stone). |

## Damage states

- A segment under attack flashes **yellow** (that's the original's "ouch" flash for green segments being eaten).
- When a segment is damaged, it shows as a **dark/dim shade** of its color and shortens as it loses length. When a segment is destroyed, every segment beyond it on that limb dies too — limbs are severed.
- Given time and energy, biots **regenerate** damaged segments.
- A biot flashing **purple** is *sick* — the plague sweeps through when the world gets overcrowded, draining energy fast. Sickness is contagious on contact.

## Anatomy

- **Limbs** (1–8): the arms radiating from the body. Some biots have **mirrored** limbs — you can spot them by the symmetric butterfly/star shapes.
- **Segments** (up to 10 per limb): each is a separate colored line, and each has its own length and joint angle, all encoded in the genome.
- **Sex**: males are the ones that can carry white (gene-injecting) segments. Females are the ones that give birth. **Asexual** biots clone themselves without needing a mate.
- **Size**: biots grow when they have surplus energy. A big biot is a well-fed adult — it also means it's close to the energy needed to reproduce.

## The food web

```
GREEN eats nothing  — it feeds on sunlight.
RED eats GREEN      — predators hunt producers.
BLUE blocks RED     — shields protect the body.
WHITE infects same-species adults — sex.
RED destroys WHITE and LIGHT BLUE — predators shred the defenseless.
RED vs RED          — predators attack each other; the redder biot wins.
```

Every tick, a biot pays energy equal to its total body length just to stay alive,
and gains energy from its green segments. Big bodies are expensive; photosynthesis
is income. Predators survive by stealing the income of others.

## Life cycle

1. **Born** from a parent (asexual clones, or crossover offspring of two parents)
   with a few random mutations — watch for new shapes appearing.
2. **Grow** as energy accumulates, up to their genetically-determined adult size.
3. **Reproduce** when energy doubles — splitting into 1–8 children who inherit
   the genome with crossover and mutation.
4. **Die** of starvation (green income < body cost), predation, sickness,
   or old age — and if the population ever hits zero, the world starts over
   with a fresh batch of random biots (an *extinction event*; the HUD counts them).

Click any biot to inspect its genome: species, sex, limb plan, energy, and how
much of its body is green vs red vs blue.
