#!/usr/bin/env node

/**
 * Grand Ivory - Meta Profile Compiler
 *
 * Converts the large raw Comlink metaProfiles.json dataset into compact
 * Grand Ivory OptimizationPlan-compatible targets.
 *
 *
 * INPUT
 * --------------------------------------------------------------------------
 *
 * src/constants/metaProfiles.json
 *
 *
 * OUTPUT
 * --------------------------------------------------------------------------
 *
 * src/constants/generatedMetaTargets.json
 *
 *
 * Each character becomes:
 *
 * {
 *   "baseId": "BADBATCHHUNTER",
 *   "name": "Hunter",
 *   "sampleSize": 1686,
 *   "targets": [
 *     {
 *       "name": "Kyber Meta",
 *       "health": ...,
 *       "protection": ...,
 *       "speed": ...,
 *       ...
 *       "primaryStatRestrictions": {
 *         "arrow": "Speed"
 *       },
 *       "setRestrictions": {},
 *       "useOnlyFullSets": true
 *     },
 *
 *     {
 *       "name": "Kyber Meta: Crit Chance + Crit Damage (48%)",
 *       ...
 *       "setRestrictions": {
 *         "critchance": 1,
 *         "critdamage": 1
 *       }
 *     }
 *   ]
 * }
 */

import fs from "node:fs/promises";
import path from "node:path";


// ============================================================================
// CONFIGURATION
// ============================================================================

const INPUT_FILE =
  process.env.META_PROFILES_FILE ??
  "src/constants/metaProfiles.json";


const OUTPUT_FILE =
  process.env.META_TARGETS_FILE ??
  "src/constants/generatedMetaTargets.json";


/**
 * Minimum number of accepted six-mod builds for a character to receive
 * generated optimization targets.
 */
const MIN_SAMPLE_SIZE =
  Number(
    process.env.META_MIN_SAMPLE_SIZE ??
    100
  );


/**
 * Don't create a hard primary restriction without at least this many
 * observations for the slot.
 */
const MIN_PRIMARY_SAMPLE_SIZE =
  Number(
    process.env.META_MIN_PRIMARY_SAMPLE_SIZE ??
    50
  );


/**
 * Primary restriction requirements.
 *
 * Example:
 *
 * Speed arrow:
 *
 *   Speed       90%
 *   Offense      5%
 *
 * 90% >= 80%
 * margin = 85 percentage points >= 40
 *
 * => lock Speed.
 *
 *
 * Triangle:
 *
 *   Crit Damage 44%
 *   Offense     29%
 *
 * => leave unrestricted.
 */
const PRIMARY_LOCK_THRESHOLD =
  Number(
    process.env.META_PRIMARY_LOCK_THRESHOLD ??
    0.80
  );


const PRIMARY_LOCK_MARGIN =
  Number(
    process.env.META_PRIMARY_LOCK_MARGIN ??
    0.40
  );


/**
 * Besides the aggregate "Kyber Meta" target, generate a few common explicit
 * set archetypes.
 */
const ARCHETYPE_MIN_SHARE =
  Number(
    process.env.META_ARCHETYPE_MIN_SHARE ??
    0.10
  );


const ARCHETYPE_MIN_COUNT =
  Number(
    process.env.META_ARCHETYPE_MIN_COUNT ??
    50
  );


const MAX_ARCHETYPES =
  Number(
    process.env.META_MAX_ARCHETYPES ??
    3
  );


/**
 * Exponent used when mapping observed meta signals onto Grand Ivory's
 * 0-100 basic weight range.
 *
 * > 1 makes strong preferences stand out more.
 */
const WEIGHT_GAMMA =
  Number(
    process.env.META_WEIGHT_GAMMA ??
    1.25
  );


const MIN_OUTPUT_WEIGHT =
  Number(
    process.env.META_MIN_WEIGHT ??
    5
  );


// ============================================================================
// SIGNAL MIX
// ============================================================================

/**
 * Secondary behavior is the strongest signal because it tells us what players
 * actually invest rolls into.
 *
 * Sets and primaries provide additional context, especially for stats such as
 * Critical Damage that cannot appear as normal secondaries.
 */
const SECONDARY_SIGNAL_SHARE =
  0.70;


const SET_SIGNAL_SHARE =
  0.20;


const PRIMARY_SIGNAL_SHARE =
  0.10;


// ============================================================================
// MOD SET DEFINITIONS
// ============================================================================

const MOD_SET_DEFINITIONS =
  Object.freeze({
    1: {
      id: 1,
      optimizerKey: "health",
      displayName: "Health",
      requiredMods: 2,
      statKey: "health"
    },

    2: {
      id: 2,
      optimizerKey: "offense",
      displayName: "Offense",
      requiredMods: 4,
      statKey: "offense"
    },

    3: {
      id: 3,
      optimizerKey: "defense",
      displayName: "Defense",
      requiredMods: 2,
      statKey: "defense"
    },

    4: {
      id: 4,
      optimizerKey: "speed",
      displayName: "Speed",
      requiredMods: 4,
      statKey: "speed"
    },

    5: {
      id: 5,
      optimizerKey: "critchance",
      displayName: "Crit Chance",
      requiredMods: 2,
      statKey: "critChance"
    },

    6: {
      id: 6,
      optimizerKey: "critdamage",
      displayName: "Crit Damage",
      requiredMods: 4,
      statKey: "critDmg"
    },

    7: {
      id: 7,
      optimizerKey: "potency",
      displayName: "Potency",
      requiredMods: 2,
      statKey: "potency"
    },

    8: {
      id: 8,
      optimizerKey: "tenacity",
      displayName: "Tenacity",
      requiredMods: 2,
      statKey: "tenacity"
    }
  });


// ============================================================================
// SECONDARY STAT GROUPS
// ============================================================================

/**
 * Raw Comlink stat IDs:
 *
 *  1 = Health flat
 *  5 = Speed
 * 17 = Potency %
 * 18 = Tenacity %
 * 28 = Protection flat
 * 41 = Offense flat
 * 42 = Defense flat
 * 48 = Offense %
 * 49 = Defense %
 * 53 = Critical Chance %
 * 55 = Health %
 * 56 = Protection %
 *
 *
 * Flat and percent variants are combined into the Grand Ivory conceptual
 * stat.
 *
 * They are averaged instead of added so stats with both a flat and percent
 * version don't automatically receive twice the weight.
 */
const STAT_GROUPS =
  Object.freeze({
    health: [
      1,
      55
    ],

    protection: [
      28,
      56
    ],

    speed: [
      5
    ],

    potency: [
      17
    ],

    tenacity: [
      18
    ],

    offense: [
      41,
      48
    ],

    defense: [
      42,
      49
    ],

    critChance: [
      53
    ]
  });


// ============================================================================
// PRIMARY STAT MAPPING
// ============================================================================

/**
 * The optimizer primary strings need to match Grand Ivory's Mod stat names
 * exactly.
 */
const PRIMARY_STAT_TO_TARGET =
  Object.freeze({
    5: {
      optimizerType: "Speed",
      statKey: "speed"
    },

    16: {
      optimizerType: "Critical Damage %",
      statKey: "critDmg"
    },

    17: {
      optimizerType: "Potency %",
      statKey: "potency"
    },

    18: {
      optimizerType: "Tenacity %",
      statKey: "tenacity"
    },

    48: {
      optimizerType: "Offense %",
      statKey: "offense"
    },

    49: {
      optimizerType: "Defense %",
      statKey: "defense"
    },

    52: {
      optimizerType: "Accuracy %",
      statKey: "accuracy"
    },

    53: {
      optimizerType: "Critical Chance %",
      statKey: "critChance"
    },

    54: {
      optimizerType: "Critical Avoidance %",
      statKey: "critAvoid"
    },

    55: {
      optimizerType: "Health %",
      statKey: "health"
    },

    56: {
      optimizerType: "Protection %",
      statKey: "protection"
    }
  });


// ============================================================================
// OUTPUT STAT KEYS
// ============================================================================

const TARGET_STAT_KEYS =
  Object.freeze([
    "health",
    "protection",
    "speed",
    "critDmg",
    "potency",
    "tenacity",
    "offense",
    "critChance",
    "defense",
    "accuracy",
    "critAvoid"
  ]);


// ============================================================================
// HELPERS
// ============================================================================

function clamp(
  value,
  minimum,
  maximum
) {
  return Math.max(
    minimum,
    Math.min(
      maximum,
      value
    )
  );
}


function round(
  value,
  places = 6
) {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return null;
  }


  const multiplier =
    10 ** places;


  return (
    Math.round(
      value *
      multiplier
    ) /
    multiplier
  );
}


function mean(
  values
) {
  if (
    !values.length
  ) {
    return 0;
  }


  return (
    values.reduce(
      (
        sum,
        value
      ) =>
        sum +
        value,
      0
    ) /
    values.length
  );
}


async function writeJson(
  filename,
  value
) {
  await fs.mkdir(
    path.dirname(
      filename
    ),
    {
      recursive: true
    }
  );


  const temporaryFile =
    `${filename}.tmp`;


  await fs.writeFile(
    temporaryFile,

    JSON.stringify(
      value,
      null,
      2
    ) + "\n",

    "utf8"
  );


  await fs.rename(
    temporaryFile,
    filename
  );
}


// ============================================================================
// GLOBAL SECONDARY BASELINES
// ============================================================================

/**
 * We use a global average for each individual secondary type as an investment
 * baseline.
 *
 * Example:
 *
 * Hunter Speed average = 14.8
 * Global Speed average = 12.5
 *
 * Hunter is investing above-average Speed quality.
 *
 *
 * This avoids comparing unlike units such as:
 *
 * +15 Speed
 * vs
 * +4% Potency
 */
function buildGlobalSecondaryAverages(
  characters
) {
  const buckets =
    {};


  for (
    const character
    of Object.values(
      characters
    )
  ) {
    const stats =
      character
        .aggregate
        ?.secondaries
        ?.stats ??
      {};


    for (
      const [
        statId,
        stat
      ]
      of Object.entries(
        stats
      )
    ) {
      const average =
        Number(
          stat.average
        );


      const count =
        Number(
          stat.count
        );


      if (
        !Number.isFinite(
          average
        ) ||
        !Number.isFinite(
          count
        ) ||
        count <=
          0
      ) {
        continue;
      }


      buckets[
        statId
      ] ??= {
        weightedValueSum:
          0,

        count:
          0
      };


      buckets[
        statId
      ]
        .weightedValueSum +=
          average *
          count;


      buckets[
        statId
      ]
        .count +=
          count;
    }
  }


  return Object.fromEntries(
    Object.entries(
      buckets
    ).map(
      (
        [
          statId,
          bucket
        ]
      ) => [
        statId,

        bucket.count >
        0
          ? (
              bucket.weightedValueSum /
              bucket.count
            )
          : null
      ]
    )
  );
}


// ============================================================================
// SECONDARY SIGNAL
// ============================================================================

function getSecondarySignal(
  secondaryStats,
  statId,
  globalAverages
) {
  const stat =
    secondaryStats?.[
      String(
        statId
      )
    ];


  if (
    !stat
  ) {
    return 0;
  }


  const frequency =
    Number(
      stat.frequency ??
      0
    );


  const characterAverage =
    Number(
      stat.average
    );


  const globalAverage =
    Number(
      globalAverages[
        String(
          statId
        )
      ]
    );


  let investmentRatio =
    1;


  if (
    Number.isFinite(
      characterAverage
    ) &&
    Number.isFinite(
      globalAverage
    ) &&
    globalAverage !==
      0
  ) {
    investmentRatio =
      clamp(
        characterAverage /
        globalAverage,

        0.5,
        1.5
      );
  }


  /**
   * Frequency remains the main signal.
   *
   * Investment quality modifies it, but sqrt() prevents unusually high
   * secondary rolls from dominating everything.
   */
  return (
    frequency *
    Math.sqrt(
      investmentRatio
    )
  );
}


function buildSecondarySignals(
  secondaryStats,
  globalAverages
) {
  const signals =
    {};


  for (
    const [
      statKey,
      statIds
    ]
    of Object.entries(
      STAT_GROUPS
    )
  ) {
    signals[
      statKey
    ] =
      mean(
        statIds.map(
          statId =>
            getSecondarySignal(
              secondaryStats,
              statId,
              globalAverages
            )
        )
      );
  }


  return signals;
}


// ============================================================================
// SET SIGNALS
// ============================================================================

/**
 * Calculate expected completed sets from the character's aggregate loadout
 * distribution.
 */
function buildSetSignalsFromAggregate(
  character
) {
  const expectedSetCounts =
    {};


  for (
    const setId
    of Object.keys(
      MOD_SET_DEFINITIONS
    )
  ) {
    expectedSetCounts[
      setId
    ] =
      0;
  }


  for (
    const loadout
    of Object.values(
      character.loadouts ??
      {}
    )
  ) {
    const share =
      Number(
        loadout.share ??
        0
      );


    if (
      share <=
      0
    ) {
      continue;
    }


    const occurrences =
      {};


    for (
      const setId
      of loadout.setIds ??
      []
    ) {
      const key =
        String(
          setId
        );


      occurrences[
        key
      ] =
        (
          occurrences[
            key
          ] ??
          0
        ) +
        1;
    }


    for (
      const [
        setId,
        count
      ]
      of Object.entries(
        occurrences
      )
    ) {
      expectedSetCounts[
        setId
      ] =
        (
          expectedSetCounts[
            setId
          ] ??
          0
        ) +
        share *
        count;
    }
  }


  return normalizeExpectedSetCounts(
    expectedSetCounts
  );
}


/**
 * Explicit archetypes have a known exact set configuration.
 */
function buildSetSignalsFromLoadout(
  loadout
) {
  const expectedSetCounts =
    {};


  for (
    const setId
    of loadout.setIds ??
    []
  ) {
    const key =
      String(
        setId
      );


    expectedSetCounts[
      key
    ] =
      (
        expectedSetCounts[
          key
        ] ??
        0
      ) +
      1;
  }


  return normalizeExpectedSetCounts(
    expectedSetCounts
  );
}


/**
 * Convert expected completed-set counts into normalized 0-1 signals.
 *
 * Four-piece sets can occur once.
 * Two-piece sets can occur up to three times.
 */
function normalizeExpectedSetCounts(
  expectedSetCounts
) {
  const signals =
    {};


  for (
    const definition
    of Object.values(
      MOD_SET_DEFINITIONS
    )
  ) {
    const maximumCompletedSets =
      6 /
      definition.requiredMods;


    const expected =
      Number(
        expectedSetCounts[
          String(
            definition.id
          )
        ] ??
        0
      );


    signals[
      definition.statKey
    ] =
      clamp(
        expected /
        maximumCompletedSets,

        0,
        1
      );
  }


  return signals;
}


// ============================================================================
// PRIMARY SIGNALS
// ============================================================================

/**
 * Stat weighting uses the strongest primary preference for the stat across the
 * flexible slots.
 *
 * Primary locking itself is handled separately and much more conservatively.
 */
function buildPrimarySignals(
  primaries
) {
  const signals =
    {};


  for (
    const statKey
    of TARGET_STAT_KEYS
  ) {
    signals[
      statKey
    ] =
      0;
  }


  for (
    const slotData
    of Object.values(
      primaries ??
      {}
    )
  ) {
    for (
      const stat
      of Object.values(
        slotData.stats ??
        {}
      )
    ) {
      const definition =
        PRIMARY_STAT_TO_TARGET[
          Number(
            stat.statId
          )
        ];


      if (
        !definition
      ) {
        continue;
      }


      signals[
        definition.statKey
      ] =
        Math.max(
          signals[
            definition.statKey
          ] ??
          0,

          Number(
            stat.frequency ??
            0
          )
        );
    }
  }


  return signals;
}


// ============================================================================
// COMPOSITE META SIGNAL
// ============================================================================

function combineSignals(
  secondarySignals,
  setSignals,
  primarySignals
) {
  const combined =
    {};


  for (
    const statKey
    of TARGET_STAT_KEYS
  ) {
    combined[
      statKey
    ] =
      (
        SECONDARY_SIGNAL_SHARE *
        Number(
          secondarySignals[
            statKey
          ] ??
          0
        )
      ) +
      (
        SET_SIGNAL_SHARE *
        Number(
          setSignals[
            statKey
          ] ??
          0
        )
      ) +
      (
        PRIMARY_SIGNAL_SHARE *
        Number(
          primarySignals[
            statKey
          ] ??
          0
        )
      );
  }


  return combined;
}


// ============================================================================
// CONVERT SIGNALS TO GRAND IVORY 0-100 WEIGHTS
// ============================================================================

function normalizeWeights(
  signals
) {
  const maximum =
    Math.max(
      ...TARGET_STAT_KEYS.map(
        statKey =>
          Number(
            signals[
              statKey
            ] ??
            0
          )
      ),

      0
    );


  const weights =
    {};


  if (
    maximum <=
    0
  ) {
    for (
      const statKey
      of TARGET_STAT_KEYS
    ) {
      weights[
        statKey
      ] =
        0;
    }


    return weights;
  }


  for (
    const statKey
    of TARGET_STAT_KEYS
  ) {
    const signal =
      Number(
        signals[
          statKey
        ] ??
        0
      );


    let weight =
      100 *
      Math.pow(
        signal /
        maximum,

        WEIGHT_GAMMA
      );


    weight =
      Math.round(
        weight
      );


    if (
      weight <
      MIN_OUTPUT_WEIGHT
    ) {
      weight =
        0;
    }


    weights[
      statKey
    ] =
      weight;
  }


  return weights;
}


// ============================================================================
// PRIMARY RESTRICTIONS
// ============================================================================

function compilePrimaryRestrictions(
  primaries
) {
  const restrictions =
    {};


  for (
    const [
      slot,
      slotData
    ]
    of Object.entries(
      primaries ??
      {}
    )
  ) {
    const total =
      Number(
        slotData.total ??
        0
      );


    if (
      total <
      MIN_PRIMARY_SAMPLE_SIZE
    ) {
      continue;
    }


    const candidates =
      Object.values(
        slotData.stats ??
        {}
      )
        .map(
          stat => {
            const definition =
              PRIMARY_STAT_TO_TARGET[
                Number(
                  stat.statId
                )
              ];


            if (
              !definition
            ) {
              return null;
            }


            return {
              optimizerType:
                definition.optimizerType,

              frequency:
                Number(
                  stat.frequency ??
                  0
                )
            };
          }
        )
        .filter(
          Boolean
        )
        .sort(
          (
            left,
            right
          ) =>
            right.frequency -
            left.frequency
        );


    const best =
      candidates[
        0
      ];


    const second =
      candidates[
        1
      ];


    if (
      !best
    ) {
      continue;
    }


    const margin =
      best.frequency -
      (
        second?.frequency ??
        0
      );


    if (
      best.frequency >=
        PRIMARY_LOCK_THRESHOLD &&
      margin >=
        PRIMARY_LOCK_MARGIN
    ) {
      restrictions[
        slot
      ] =
        best.optimizerType;
    }
  }


  return restrictions;
}


// ============================================================================
// SET RESTRICTIONS
// ============================================================================

function loadoutToSetRestrictions(
  loadout
) {
  const restrictions =
    {};


  for (
    const setId
    of loadout.setIds ??
    []
  ) {
    const definition =
      MOD_SET_DEFINITIONS[
        Number(
          setId
        )
      ];


    if (
      !definition
    ) {
      continue;
    }


    restrictions[
      definition.optimizerKey
    ] =
      (
        restrictions[
          definition.optimizerKey
        ] ??
        0
      ) +
      1;
  }


  return restrictions;
}


// ============================================================================
// ARCHETYPE DISPLAY NAME
// ============================================================================

function loadoutDisplayName(
  loadout
) {
  return (
    loadout.setIds ??
    []
  )
    .map(
      setId =>
        MOD_SET_DEFINITIONS[
          Number(
            setId
          )
        ]?.displayName ??
        `Set ${setId}`
    )
    .join(
      " + "
    );
}


// ============================================================================
// BUILD OPTIMIZATION PLAN DATA
// ============================================================================

function buildPlan({
  name,
  sampleSize,
  relicAverage,
  secondaryStats,
  primaries,
  setSignals,
  setRestrictions,
  globalAverages,
  source
}) {
  const secondarySignals =
    buildSecondarySignals(
      secondaryStats,
      globalAverages
    );


  const primarySignals =
    buildPrimarySignals(
      primaries
    );


  const signals =
    combineSignals(
      secondarySignals,
      setSignals,
      primarySignals
    );


  const weights =
    normalizeWeights(
      signals
    );


  return {
    name,

    sampleSize,

    relicAverage:
      relicAverage ??
      null,

    source,

    health:
      weights.health,

    protection:
      weights.protection,

    speed:
      weights.speed,

    critDmg:
      weights.critDmg,

    potency:
      weights.potency,

    tenacity:
      weights.tenacity,

    offense:
      weights.offense,

    critChance:
      weights.critChance,

    defense:
      weights.defense,

    accuracy:
      weights.accuracy,

    critAvoid:
      weights.critAvoid,

    primaryStatRestrictions:
      compilePrimaryRestrictions(
        primaries
      ),

    setRestrictions:
      setRestrictions ??
      {},

    useOnlyFullSets:
      true
  };
}


// ============================================================================
// COMPILE CHARACTER
// ============================================================================

function compileCharacter(
  character,
  globalAverages
) {
  const sampleSize =
    Number(
      character
        .population
        ?.sampleSize ??
      0
    );


  if (
    sampleSize <
    MIN_SAMPLE_SIZE
  ) {
    return null;
  }


  const targets =
    [];


  // ==========================================================================
  // AGGREGATE KYBER META
  // ==========================================================================

  targets.push(
    buildPlan({
      name:
        "Kyber Meta",

      sampleSize,

      relicAverage:
        character.relicAverage,

      secondaryStats:
        character
          .aggregate
          ?.secondaries
          ?.stats ??
        {},

      primaries:
        character
          .aggregate
          ?.primaries ??
        {},

      setSignals:
        buildSetSignalsFromAggregate(
          character
        ),

      /**
       * Aggregate target doesn't hard-lock a particular set combination.
       *
       * The set frequencies already influence the weights.
       */
      setRestrictions:
        {},

      globalAverages,

      source: {
        type:
          "aggregate"
      }
    })
  );


  // ==========================================================================
  // COMMON SET ARCHETYPES
  // ==========================================================================

  const archetypes =
    Object.values(
      character.loadouts ??
      {}
    )
      .filter(
        loadout =>
          Number(
            loadout.count ??
            0
          ) >=
            ARCHETYPE_MIN_COUNT &&
          Number(
            loadout.share ??
            0
          ) >=
            ARCHETYPE_MIN_SHARE
      )
      .sort(
        (
          left,
          right
        ) =>
          Number(
            right.share ??
            0
          ) -
          Number(
            left.share ??
            0
          )
      )
      .slice(
        0,
        MAX_ARCHETYPES
      );


  for (
    const loadout
    of archetypes
  ) {
    const percent =
      Math.round(
        Number(
          loadout.share ??
          0
        ) *
        100
      );


    targets.push(
      buildPlan({
        name:
          `Kyber Meta: ${loadoutDisplayName(loadout)} (${percent}%)`,

        sampleSize:
          Number(
            loadout.count ??
            0
          ),

        relicAverage:
          loadout.relicAverage,

        secondaryStats:
          loadout
            .secondaries
            ?.stats ??
          {},

        primaries:
          loadout.primaries ??
          {},

        setSignals:
          buildSetSignalsFromLoadout(
            loadout
          ),

        /**
         * Explicit archetypes DO hard-lock their observed complete set
         * configuration.
         */
        setRestrictions:
          loadoutToSetRestrictions(
            loadout
          ),

        globalAverages,

        source: {
          type:
            "loadout",

          loadoutId:
            loadout.id,

          share:
            round(
              Number(
                loadout.share ??
                0
              )
            ),

          count:
            Number(
              loadout.count ??
              0
            )
        }
      })
    );
  }


  return {
    baseId:
      character.baseId,

    name:
      character.name,

    sampleSize,

    relicAverage:
      character.relicAverage ??
      null,

    targets
  };
}


// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log(
    ""
  );


  console.log(
    "=============================================="
  );


  console.log(
    "Grand Ivory Kyber Meta Compiler"
  );


  console.log(
    "=============================================="
  );


  console.log(
    ""
  );


  console.log(
    `Reading ${INPUT_FILE}...`
  );


  const raw =
    JSON.parse(
      await fs.readFile(
        INPUT_FILE,
        "utf8"
      )
    );


  const rawCharacters =
    raw.characters ??
    {};


  console.log(
    `Raw characters: ${Object.keys(rawCharacters).length}`
  );


  console.log(
    "Building global secondary-stat baselines..."
  );


  const globalAverages =
    buildGlobalSecondaryAverages(
      rawCharacters
    );


  const characters =
    {};


  let skippedForSampleSize =
    0;


  let aggregateTargets =
    0;


  let archetypeTargets =
    0;


  for (
    const [
      baseId,
      character
    ]
    of Object.entries(
      rawCharacters
    )
  ) {
    const compiled =
      compileCharacter(
        character,
        globalAverages
      );


    if (
      !compiled
    ) {
      skippedForSampleSize++;

      continue;
    }


    characters[
      baseId
    ] =
      compiled;


    aggregateTargets++;


    archetypeTargets +=
      Math.max(
        0,
        compiled.targets.length -
        1
      );
  }


  const output = {
    schemaVersion:
      2,

    format:
      "grand-ivory-optimization-plans",

    generatedAt:
      new Date()
        .toISOString(),

    source: {
      provider:
        raw.source
          ?.provider ??
        "swgoh-comlink",

      sourceGeneratedAt:
        raw.source
          ?.generatedAt ??
        null,

      gameDataVersion:
        raw.source
          ?.gameDataVersion ??
        null,

      localizationVersion:
        raw.source
          ?.localizationVersion ??
        null
    },

    cohort:
      raw.cohort ??
      null,

    compiler: {
      minimumCharacterSampleSize:
        MIN_SAMPLE_SIZE,

      minimumPrimarySampleSize:
        MIN_PRIMARY_SAMPLE_SIZE,

      primaryLockThreshold:
        PRIMARY_LOCK_THRESHOLD,

      primaryLockMargin:
        PRIMARY_LOCK_MARGIN,

      archetypeMinimumShare:
        ARCHETYPE_MIN_SHARE,

      archetypeMinimumCount:
        ARCHETYPE_MIN_COUNT,

      maximumArchetypesPerCharacter:
        MAX_ARCHETYPES,

      weightGamma:
        WEIGHT_GAMMA,

      minimumOutputWeight:
        MIN_OUTPUT_WEIGHT,

      signalMix: {
        secondary:
          SECONDARY_SIGNAL_SHARE,

        set:
          SET_SIGNAL_SHARE,

        primary:
          PRIMARY_SIGNAL_SHARE
      }
    },

    characters
  };


  await writeJson(
    OUTPUT_FILE,
    output
  );


  const targetCount =
    aggregateTargets +
    archetypeTargets;


  console.log(
    ""
  );


  console.log(
    `Compiled characters: ${Object.keys(characters).length}`
  );


  console.log(
    `Aggregate Kyber Meta targets: ${aggregateTargets}`
  );


  console.log(
    `Set archetype targets: ${archetypeTargets}`
  );


  console.log(
    `Total targets: ${targetCount}`
  );


  console.log(
    `Skipped for sample size: ${skippedForSampleSize}`
  );


  console.log(
    ""
  );


  console.log(
    `Output: ${OUTPUT_FILE}`
  );


  // ==========================================================================
  // SANITY CHECK HUNTER
  // ==========================================================================

  const hunter =
    characters.BADBATCHHUNTER;


  if (
    hunter
  ) {
    console.log(
      ""
    );


    console.log(
      "Hunter sanity check:"
    );


    for (
      const target
      of hunter.targets
    ) {
      console.log(
        `  ${target.name}`
      );


      console.log(
        `    Speed weight: ${target.speed}`
      );


      console.log(
        `    Primary restrictions: ${JSON.stringify(target.primaryStatRestrictions)}`
      );


      console.log(
        `    Set restrictions: ${JSON.stringify(target.setRestrictions)}`
      );
    }
  }
}


// ============================================================================
// RUN
// ============================================================================

main().catch(
  error => {
    console.error(
      ""
    );


    console.error(
      "Meta compilation failed:"
    );


    console.error(
      error
    );


    process.exitCode =
      1;
  }
);