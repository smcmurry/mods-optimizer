#!/usr/bin/env node

/**
 * Grand Ivory Kyber Meta Validation Report
 *
 * Validates:
 *
 *   metaProfiles.json
 *          ↓
 *   compileMetaProfiles.mjs
 *          ↓
 *   generatedMetaTargets.json
 *
 *
 * This report checks:
 *
 * 1. Character/sample coverage
 * 2. Loadout concentration / multimodality
 * 3. Hard primary restrictions
 * 4. Archetype generation
 * 5. Archetype set restrictions
 * 6. Stat-weight sanity
 * 7. Agreement between generated stat weights and observed secondary behavior
 * 8. Suspicious / contradictory recommendations
 *
 *
 * OUTPUT
 * --------------------------------------------------------------------------
 *
 * reports/metaValidation.md
 * reports/metaValidation.json
 *
 *
 * DEFAULT DETAILED CHARACTERS
 * --------------------------------------------------------------------------
 *
 * R2D2_LEGENDARY
 * BADBATCHHUNTER
 *
 *
 * Override:
 *
 * PowerShell:
 *
 * $env:VALIDATION_FOCUS="R2D2_LEGENDARY,GLLEIA"
 *
 * Detail every character:
 *
 * $env:VALIDATION_DETAIL_ALL="1"
 */


import fs from "node:fs/promises";
import path from "node:path";


// ============================================================================
// FILES
// ============================================================================

const RAW_FILE =
  process.env.META_PROFILES_FILE ??
  "src/constants/metaProfiles.json";


const GENERATED_FILE =
  process.env.META_TARGETS_FILE ??
  "src/constants/generatedMetaTargets.json";


const REPORT_MD_FILE =
  process.env.META_VALIDATION_MD ??
  "reports/metaValidation.md";


const REPORT_JSON_FILE =
  process.env.META_VALIDATION_JSON ??
  "reports/metaValidation.json";


// ============================================================================
// REPORT CONFIGURATION
// ============================================================================

const VALIDATION_DETAIL_ALL =
  process.env.VALIDATION_DETAIL_ALL ===
  "1";


const VALIDATION_FOCUS =
  new Set(
    (
      process.env.VALIDATION_FOCUS ??
      "R2D2_LEGENDARY,BADBATCHHUNTER"
    )
      .split(",")
      .map(
        value =>
          value
            .trim()
            .toUpperCase()
      )
      .filter(
        Boolean
      )
  );


const TOP_LOADOUTS_TO_DISPLAY =
  Number(
    process.env.VALIDATION_TOP_LOADOUTS ??
    8
  );


/**
 * Spearman correlation between:
 *
 * generated stat weights
 *
 * and
 *
 * empirical secondary investment signals
 *
 *
 * We don't expect 1.0 because the compiler also intentionally incorporates
 * sets and primaries.
 */
const SECONDARY_CORRELATION_WARN =
  Number(
    process.env.VALIDATION_CORRELATION_WARN ??
    0.55
  );


const SECONDARY_CORRELATION_FAIL =
  Number(
    process.env.VALIDATION_CORRELATION_FAIL ??
    0.25
  );


// ============================================================================
// MOD SETS
// ============================================================================

const MOD_SET_DEFINITIONS =
  Object.freeze({
    1: {
      id: 1,
      optimizerKey: "health",
      name: "Health",
      requiredMods: 2
    },

    2: {
      id: 2,
      optimizerKey: "offense",
      name: "Offense",
      requiredMods: 4
    },

    3: {
      id: 3,
      optimizerKey: "defense",
      name: "Defense",
      requiredMods: 2
    },

    4: {
      id: 4,
      optimizerKey: "speed",
      name: "Speed",
      requiredMods: 4
    },

    5: {
      id: 5,
      optimizerKey: "critchance",
      name: "Critical Chance",
      requiredMods: 2
    },

    6: {
      id: 6,
      optimizerKey: "critdamage",
      name: "Critical Damage",
      requiredMods: 4
    },

    7: {
      id: 7,
      optimizerKey: "potency",
      name: "Potency",
      requiredMods: 2
    },

    8: {
      id: 8,
      optimizerKey: "tenacity",
      name: "Tenacity",
      requiredMods: 2
    }
  });


// ============================================================================
// PRIMARY STAT DEFINITIONS
// ============================================================================

const PRIMARY_STAT_NAMES =
  Object.freeze({
    5:
      "Speed",

    16:
      "Critical Damage %",

    17:
      "Potency %",

    18:
      "Tenacity %",

    48:
      "Offense %",

    49:
      "Defense %",

    52:
      "Accuracy %",

    53:
      "Critical Chance %",

    54:
      "Critical Avoidance %",

    55:
      "Health %",

    56:
      "Protection %"
  });


// ============================================================================
// SECONDARY STAT GROUPS
// ============================================================================

/**
 * These are the stats for which we can directly compare generated weights
 * against observed secondary behavior.
 *
 * Crit Damage, Accuracy, and Crit Avoidance are excluded from this particular
 * correlation because they are not normal secondaries.
 */
const SECONDARY_GROUPS =
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


const WEIGHT_KEYS =
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
// STATUS
// ============================================================================

const STATUS_RANK =
  Object.freeze({
    PASS: 0,
    INFO: 0,
    WARN: 1,
    FAIL: 2
  });


function worstStatus(
  checks
) {
  let result =
    "PASS";


  for (
    const check
    of checks
  ) {
    if (
      STATUS_RANK[
        check.status
      ] >
      STATUS_RANK[
        result
      ]
    ) {
      result =
        check.status;
    }
  }


  return result;
}


// ============================================================================
// HELPERS
// ============================================================================

function round(
  value,
  places = 4
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


function percent(
  value,
  places = 1
) {
  if (
    !Number.isFinite(
      Number(
        value
      )
    )
  ) {
    return "—";
  }


  return (
    (
      Number(
        value
      ) *
      100
    ).toFixed(
      places
    ) +
    "%"
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


function markdownEscape(
  value
) {
  return String(
    value ??
    ""
  )
    .replace(
      /\|/g,
      "\\|"
    )
    .replace(
      /\n/g,
      " "
    );
}


function sameObject(
  left,
  right
) {
  const leftKeys =
    Object.keys(
      left ??
      {}
    ).sort();


  const rightKeys =
    Object.keys(
      right ??
      {}
    ).sort();


  if (
    leftKeys.length !==
    rightKeys.length
  ) {
    return false;
  }


  for (
    let index = 0;
    index <
      leftKeys.length;
    index++
  ) {
    if (
      leftKeys[
        index
      ] !==
      rightKeys[
        index
      ]
    ) {
      return false;
    }
  }


  return leftKeys.every(
    key =>
      String(
        left[
          key
        ]
      ) ===
      String(
        right[
          key
        ]
      )
  );
}


async function writeFileAtomic(
  filename,
  content
) {
  await fs.mkdir(
    path.dirname(
      filename
    ),
    {
      recursive:
        true
    }
  );


  const temporary =
    `${filename}.tmp`;


  await fs.writeFile(
    temporary,
    content,
    "utf8"
  );


  await fs.rename(
    temporary,
    filename
  );
}


// ============================================================================
// COMPILER SETTINGS
// ============================================================================

function getCompilerSettings(
  generated
) {
  const compiler =
    generated.compiler ??
    {};


  return {
    minimumCharacterSampleSize:
      Number(
        compiler.minimumCharacterSampleSize ??
        100
      ),

    minimumPrimarySampleSize:
      Number(
        compiler.minimumPrimarySampleSize ??
        50
      ),

    primaryLockThreshold:
      Number(
        compiler.primaryLockThreshold ??
        0.80
      ),

    primaryLockMargin:
      Number(
        compiler.primaryLockMargin ??
        0.40
      ),

    archetypeMinimumShare:
      Number(
        compiler.archetypeMinimumShare ??
        0.10
      ),

    archetypeMinimumCount:
      Number(
        compiler.archetypeMinimumCount ??
        50
      ),

    maximumArchetypesPerCharacter:
      Number(
        compiler.maximumArchetypesPerCharacter ??
        3
      )
  };
}


// ============================================================================
// GLOBAL SECONDARY AVERAGES
// ============================================================================

function buildGlobalSecondaryAverages(
  rawCharacters
) {
  const buckets =
    {};


  for (
    const character
    of Object.values(
      rawCharacters
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
        weightedSum:
          0,

        count:
          0
      };


      buckets[
        statId
      ]
        .weightedSum +=
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
              bucket.weightedSum /
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

function secondaryStatSignal(
  stat,
  globalAverage
) {
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


  const average =
    Number(
      stat.average
    );


  let investment =
    1;


  if (
    Number.isFinite(
      average
    ) &&
    Number.isFinite(
      globalAverage
    ) &&
    globalAverage !==
      0
  ) {
    investment =
      clamp(
        average /
        globalAverage,

        0.5,
        1.5
      );
  }


  return (
    frequency *
    Math.sqrt(
      investment
    )
  );
}


function buildSecondarySignals(
  secondaryStats,
  globalAverages
) {
  const result =
    {};


  for (
    const [
      key,
      statIds
    ]
    of Object.entries(
      SECONDARY_GROUPS
    )
  ) {
    result[
      key
    ] =
      mean(
        statIds.map(
          statId =>
            secondaryStatSignal(
              secondaryStats?.[
                String(
                  statId
                )
              ],

              Number(
                globalAverages[
                  String(
                    statId
                  )
                ]
              )
            )
        )
      );
  }


  return result;
}


// ============================================================================
// SPEARMAN RANK CORRELATION
// ============================================================================

function averageRanks(
  values
) {
  const sorted =
    values
      .map(
        (
          value,
          index
        ) => ({
          value,
          index
        })
      )
      .sort(
        (
          left,
          right
        ) =>
          left.value -
          right.value
      );


  const ranks =
    new Array(
      values.length
    );


  let index =
    0;


  while (
    index <
    sorted.length
  ) {
    let end =
      index +
      1;


    while (
      end <
        sorted.length &&
      sorted[
        end
      ].value ===
        sorted[
          index
        ].value
    ) {
      end++;
    }


    const averageRank =
      (
        index +
        1 +
        end
      ) /
      2;


    for (
      let position =
        index;
      position <
        end;
      position++
    ) {
      ranks[
        sorted[
          position
        ].index
      ] =
        averageRank;
    }


    index =
      end;
  }


  return ranks;
}


function pearsonCorrelation(
  left,
  right
) {
  if (
    left.length !==
      right.length ||
    left.length <
      2
  ) {
    return null;
  }


  const leftMean =
    mean(
      left
    );


  const rightMean =
    mean(
      right
    );


  let numerator =
    0;


  let leftSquares =
    0;


  let rightSquares =
    0;


  for (
    let index = 0;
    index <
      left.length;
    index++
  ) {
    const leftDifference =
      left[
        index
      ] -
      leftMean;


    const rightDifference =
      right[
        index
      ] -
      rightMean;


    numerator +=
      leftDifference *
      rightDifference;


    leftSquares +=
      leftDifference **
      2;


    rightSquares +=
      rightDifference **
      2;
  }


  const denominator =
    Math.sqrt(
      leftSquares *
      rightSquares
    );


  if (
    denominator ===
    0
  ) {
    return null;
  }


  return (
    numerator /
    denominator
  );
}


function spearmanCorrelation(
  left,
  right
) {
  if (
    left.length !==
      right.length ||
    left.length <
      2
  ) {
    return null;
  }


  return pearsonCorrelation(
    averageRanks(
      left
    ),

    averageRanks(
      right
    )
  );
}


// ============================================================================
// LOADOUT DISTRIBUTION
// ============================================================================

function analyzeLoadouts(
  character
) {
  const loadouts =
    Object.values(
      character.loadouts ??
      {}
    )
      .map(
        loadout => ({
          id:
            loadout.id,

          count:
            Number(
              loadout.count ??
              0
            ),

          share:
            Number(
              loadout.share ??
              0
            ),

          sets:
            loadout.sets ??
            [],

          setIds:
            loadout.setIds ??
            []
        })
      )
      .filter(
        loadout =>
          loadout.share >
          0
      )
      .sort(
        (
          left,
          right
        ) =>
          right.share -
          left.share
      );


  const shareTotal =
    loadouts.reduce(
      (
        total,
        loadout
      ) =>
        total +
        loadout.share,

      0
    );


  const normalizedShares =
    shareTotal >
      0
      ? loadouts.map(
          loadout =>
            loadout.share /
            shareTotal
        )
      : [];


  const entropy =
    normalizedShares.reduce(
      (
        total,
        share
      ) =>
        total -
        (
          share *
          Math.log(
            share
          )
        ),

      0
    );


  const normalizedEntropy =
    normalizedShares.length >
      1
      ? (
          entropy /
          Math.log(
            normalizedShares.length
          )
        )
      : 0;


  const effectiveLoadouts =
    Math.exp(
      entropy
    );


  const top1Share =
    loadouts[
      0
    ]?.share ??
    0;


  const top3Share =
    loadouts
      .slice(
        0,
        3
      )
      .reduce(
        (
          total,
          loadout
        ) =>
          total +
          loadout.share,

        0
      );


  let classification;


  if (
    top1Share >=
    0.70
  ) {
    classification =
      "clear dominant build";

  } else if (
    top1Share >=
    0.50
  ) {
    classification =
      "moderately concentrated";

  } else if (
    effectiveLoadouts >=
      3
  ) {
    classification =
      "highly multimodal";

  } else {
    classification =
      "multimodal";
  }


  return {
    loadouts,

    entropy:
      round(
        entropy
      ),

    normalizedEntropy:
      round(
        normalizedEntropy
      ),

    effectiveLoadouts:
      round(
        effectiveLoadouts,
        2
      ),

    top1Share:
      round(
        top1Share
      ),

    top3Share:
      round(
        top3Share
      ),

    classification
  };
}


// ============================================================================
// EXPECTED PRIMARY RESTRICTIONS
// ============================================================================

function analyzePrimarySlot(
  slotName,
  slotData,
  compilerSettings
) {
  const total =
    Number(
      slotData
        ?.total ??
      0
    );


  const candidates =
    Object.values(
      slotData
        ?.stats ??
      {}
    )
      .map(
        stat => ({
          statId:
            Number(
              stat.statId
            ),

          name:
            PRIMARY_STAT_NAMES[
              Number(
                stat.statId
              )
            ] ??
            stat.name ??
            `Stat ${stat.statId}`,

          count:
            Number(
              stat.count ??
              0
            ),

          frequency:
            Number(
              stat.frequency ??
              0
            )
        })
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
    ] ??
    null;


  const second =
    candidates[
      1
    ] ??
    null;


  const margin =
    best
      ? (
          best.frequency -
          (
            second
              ?.frequency ??
            0
          )
        )
      : 0;


  const enoughSamples =
    total >=
    compilerSettings
      .minimumPrimarySampleSize;


  const shouldRestrict =
    Boolean(
      enoughSamples &&
      best &&
      best.frequency >=
        compilerSettings
          .primaryLockThreshold &&
      margin >=
        compilerSettings
          .primaryLockMargin
    );


  return {
    slot:
      slotName,

    total,

    best,

    second,

    margin:
      round(
        margin
      ),

    enoughSamples,

    shouldRestrict,

    expectedRestriction:
      shouldRestrict
        ? best.name
        : null
  };
}


function analyzePrimaries(
  primaries,
  compilerSettings
) {
  const slots = [
    "arrow",
    "triangle",
    "circle",
    "cross"
  ];


  const result =
    {};


  for (
    const slot
    of slots
  ) {
    result[
      slot
    ] =
      analyzePrimarySlot(
        slot,
        primaries?.[
          slot
        ],
        compilerSettings
      );
  }


  return result;
}


// ============================================================================
// EXPECTED SET RESTRICTIONS
// ============================================================================

function expectedSetRestrictions(
  rawLoadout
) {
  const result =
    {};


  for (
    const setId
    of rawLoadout
      ?.setIds ??
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


    result[
      definition.optimizerKey
    ] =
      (
        result[
          definition.optimizerKey
        ] ??
        0
      ) +
      1;
  }


  return result;
}


// ============================================================================
// EXPECTED ARCHETYPES
// ============================================================================

function expectedArchetypes(
  rawCharacter,
  compilerSettings
) {
  return Object.values(
    rawCharacter.loadouts ??
    {}
  )
    .filter(
      loadout =>
        Number(
          loadout.count ??
          0
        ) >=
          compilerSettings
            .archetypeMinimumCount &&
        Number(
          loadout.share ??
          0
        ) >=
          compilerSettings
            .archetypeMinimumShare
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
      compilerSettings
        .maximumArchetypesPerCharacter
    );
}


// ============================================================================
// TARGET WEIGHT ANALYSIS
// ============================================================================

function getTargetWeights(
  target
) {
  return Object.fromEntries(
    WEIGHT_KEYS.map(
      key => [
        key,
        Number(
          target?.[
            key
          ] ??
          0
        )
      ]
    )
  );
}


function analyzeWeightSanity(
  target,
  secondaryStats,
  globalAverages
) {
  const weights =
    getTargetWeights(
      target
    );


  const checks =
    [];


  const invalidWeights =
    Object.entries(
      weights
    )
      .filter(
        (
          [
            ,
            value
          ]
        ) =>
          !Number.isFinite(
            value
          ) ||
          value <
            -100 ||
          value >
            100
      );


  if (
    invalidWeights.length
  ) {
    checks.push({
      status:
        "FAIL",

      code:
        "INVALID_WEIGHTS",

      message:
        `Invalid weight values: ${invalidWeights
          .map(
            (
              [
                key,
                value
              ]
            ) =>
              `${key}=${value}`
          )
          .join(", ")}`
    });

  } else {
    checks.push({
      status:
        "PASS",

      code:
        "VALID_WEIGHT_RANGE",

      message:
        "All generated weights are finite and inside the expected -100..100 range."
    });
  }


  const maximum =
    Math.max(
      ...Object.values(
        weights
      )
    );


  if (
    maximum <=
    0
  ) {
    checks.push({
      status:
        "FAIL",

      code:
        "BLANK_TARGET",

      message:
        "Target has no positive stat weights."
    });

  } else if (
    maximum !==
    100
  ) {
    checks.push({
      status:
        "WARN",

      code:
        "UNNORMALIZED_WEIGHTS",

      message:
        `Largest generated weight is ${maximum}, not 100.`
    });

  } else {
    checks.push({
      status:
        "PASS",

      code:
        "NORMALIZED_WEIGHTS",

      message:
        "Target has a normalized maximum weight of 100."
    });
  }


  // --------------------------------------------------------------------------
  // Compare with raw secondary behavior
  // --------------------------------------------------------------------------

  const signals =
    buildSecondarySignals(
      secondaryStats,
      globalAverages
    );


  const comparableKeys =
    Object.keys(
      SECONDARY_GROUPS
    )
      .filter(
        key =>
          Number.isFinite(
            Number(
              weights[
                key
              ]
            )
          ) &&
          Number.isFinite(
            Number(
              signals[
                key
              ]
            )
          )
      );


  const weightValues =
    comparableKeys.map(
      key =>
        Number(
          weights[
            key
          ]
        )
    );


  const signalValues =
    comparableKeys.map(
      key =>
        Number(
          signals[
            key
          ]
        )
    );


  const correlation =
    spearmanCorrelation(
      weightValues,
      signalValues
    );


  if (
    correlation !==
    null
  ) {
    if (
      correlation <
      SECONDARY_CORRELATION_FAIL
    ) {
      checks.push({
        status:
          "FAIL",

        code:
          "SECONDARY_CORRELATION",

        message:
          `Generated stat ranking has very weak agreement with observed secondary behavior (Spearman ${correlation.toFixed(3)}).`
      });

    } else if (
      correlation <
      SECONDARY_CORRELATION_WARN
    ) {
      checks.push({
        status:
          "WARN",

        code:
          "SECONDARY_CORRELATION",

        message:
          `Generated stat ranking has only moderate agreement with observed secondary behavior (Spearman ${correlation.toFixed(3)}).`
      });

    } else {
      checks.push({
        status:
          "PASS",

        code:
          "SECONDARY_CORRELATION",

        message:
          `Generated stat ranking agrees well with observed secondary behavior (Spearman ${correlation.toFixed(3)}).`
      });
    }
  }


  const rankedWeights =
    Object.entries(
      weights
    )
      .sort(
        (
          [
            ,
            left
          ],
          [
            ,
            right
          ]
        ) =>
          right -
          left
      );


  const rankedSecondarySignals =
    Object.entries(
      signals
    )
      .sort(
        (
          [
            ,
            left
          ],
          [
            ,
            right
          ]
        ) =>
          right -
          left
      );


  return {
    weights,

    secondarySignals:
      Object.fromEntries(
        Object.entries(
          signals
        ).map(
          (
            [
              key,
              value
            ]
          ) => [
            key,
            round(
              value,
              6
            )
          ]
        )
      ),

    correlation:
      correlation ===
        null
        ? null
        : round(
            correlation,
            4
          ),

    highestWeightStat:
      rankedWeights[
        0
      ]
        ? {
            stat:
              rankedWeights[
                0
              ][
                0
              ],

            value:
              rankedWeights[
                0
              ][
                1
              ]
          }
        : null,

    highestSecondarySignal:
      rankedSecondarySignals[
        0
      ]
        ? {
            stat:
              rankedSecondarySignals[
                0
              ][
                0
              ],

            value:
              round(
                rankedSecondarySignals[
                  0
                ][
                  1
                ],
                6
              )
          }
        : null,

    checks
  };
}


// ============================================================================
// PRIMARY RESTRICTION VALIDATION
// ============================================================================

function validatePrimaryRestrictions(
  target,
  rawPrimaries,
  compilerSettings
) {
  const analysis =
    analyzePrimaries(
      rawPrimaries,
      compilerSettings
    );


  const actual =
    target
      ?.primaryStatRestrictions ??
    {};


  const checks =
    [];


  for (
    const [
      slot,
      slotAnalysis
    ]
    of Object.entries(
      analysis
    )
  ) {
    const expected =
      slotAnalysis
        .expectedRestriction;


    const actualRestriction =
      actual[
        slot
      ] ??
      null;


    if (
      expected ===
      actualRestriction
    ) {
      checks.push({
        status:
          "PASS",

        code:
          `PRIMARY_${slot.toUpperCase()}`,

        message:
          expected
            ? `${slot}: correctly restricted to ${expected}.`
            : `${slot}: correctly left unrestricted.`
      });

    } else {
      checks.push({
        status:
          "FAIL",

        code:
          `PRIMARY_${slot.toUpperCase()}`,

        message:
          `${slot}: expected ${expected ?? "Any"}, generated ${actualRestriction ?? "Any"}.`
      });
    }
  }


  return {
    slots:
      analysis,

    actualRestrictions:
      actual,

    checks
  };
}


// ============================================================================
// ARCHETYPE VALIDATION
// ============================================================================

function validateArchetypes(
  rawCharacter,
  generatedCharacter,
  compilerSettings,
  globalAverages
) {
  const expected =
    expectedArchetypes(
      rawCharacter,
      compilerSettings
    );


  const generatedTargets =
    generatedCharacter
      ?.targets ??
    [];


  const actualArchetypes =
    generatedTargets.filter(
      target =>
        target.source?.type ===
        "loadout"
    );


  const checks =
    [];


  const expectedIds =
    expected.map(
      loadout =>
        loadout.id
    );


  const actualIds =
    actualArchetypes.map(
      target =>
        target.source
          ?.loadoutId
    );


  for (
    const expectedId
    of expectedIds
  ) {
    if (
      !actualIds.includes(
        expectedId
      )
    ) {
      checks.push({
        status:
          "FAIL",

        code:
          "MISSING_ARCHETYPE",

        message:
          `Expected loadout archetype ${expectedId} was not generated.`
      });
    }
  }


  for (
    const actualId
    of actualIds
  ) {
    if (
      !expectedIds.includes(
        actualId
      )
    ) {
      checks.push({
        status:
          "WARN",

        code:
          "UNEXPECTED_ARCHETYPE",

        message:
          `Generated archetype ${actualId} does not meet the current compiler archetype thresholds.`
      });
    }
  }


  const details =
    [];


  for (
    const target
    of actualArchetypes
  ) {
    const loadoutId =
      target.source
        ?.loadoutId;


    const rawLoadout =
      rawCharacter
        .loadouts
        ?.[
          loadoutId
        ];


    if (
      !rawLoadout
    ) {
      checks.push({
        status:
          "FAIL",

        code:
          "UNKNOWN_ARCHETYPE",

        message:
          `Generated archetype ${loadoutId} has no matching raw loadout.`
      });


      continue;
    }


    const expectedSets =
      expectedSetRestrictions(
        rawLoadout
      );


    const actualSets =
      target.setRestrictions ??
      {};


    const setMatch =
      sameObject(
        expectedSets,
        actualSets
      );


    if (
      !setMatch
    ) {
      checks.push({
        status:
          "FAIL",

        code:
          "ARCHETYPE_SET_MISMATCH",

        message:
          `${loadoutId}: set restriction mismatch. Expected ${JSON.stringify(expectedSets)}, generated ${JSON.stringify(actualSets)}.`
      });

    } else {
      checks.push({
        status:
          "PASS",

        code:
          "ARCHETYPE_SET_MATCH",

        message:
          `${loadoutId}: set restrictions correctly match the raw loadout.`
      });
    }


    const primaryValidation =
      validatePrimaryRestrictions(
        target,
        rawLoadout.primaries,
        compilerSettings
      );


    const weightValidation =
      analyzeWeightSanity(
        target,
        rawLoadout
          .secondaries
          ?.stats ??
        {},
        globalAverages
      );


    details.push({
      loadoutId,

      name:
        target.name,

      share:
        Number(
          rawLoadout.share ??
          0
        ),

      sampleSize:
        Number(
          rawLoadout.count ??
          0
        ),

      expectedSetRestrictions:
        expectedSets,

      actualSetRestrictions:
        actualSets,

      setRestrictionsMatch:
        setMatch,

      primaryValidation,

      weightValidation
    });
  }


  if (
    !checks.some(
      check =>
        check.status ===
        "FAIL"
    )
  ) {
    checks.push({
      status:
        "PASS",

      code:
        "ARCHETYPE_COVERAGE",

      message:
        `Generated ${actualArchetypes.length} expected loadout archetype target(s).`
    });
  }


  return {
    expectedLoadoutIds:
      expectedIds,

    actualLoadoutIds:
      actualIds,

    details,

    checks
  };
}


// ============================================================================
// CHARACTER VALIDATION
// ============================================================================

function validateCharacter(
  baseId,
  rawCharacter,
  generatedCharacter,
  compilerSettings,
  globalAverages
) {
  const checks =
    [];


  const sampleSize =
    Number(
      rawCharacter
        .population
        ?.sampleSize ??
      0
    );


  // --------------------------------------------------------------------------
  // Sample coverage
  // --------------------------------------------------------------------------

  if (
    sampleSize <
    compilerSettings
      .minimumCharacterSampleSize
  ) {
    return {
      baseId,

      name:
        rawCharacter.name ??
        baseId,

      sampleSize,

      skipped:
        true,

      status:
        "INFO",

      checks: [
        {
          status:
            "INFO",

          code:
            "INSUFFICIENT_SAMPLE",

          message:
            `Raw sample size ${sampleSize} is below compiler threshold ${compilerSettings.minimumCharacterSampleSize}.`
        }
      ]
    };
  }


  if (
    !generatedCharacter
  ) {
    return {
      baseId,

      name:
        rawCharacter.name ??
        baseId,

      sampleSize,

      skipped:
        false,

      status:
        "FAIL",

      checks: [
        {
          status:
            "FAIL",

          code:
            "MISSING_GENERATED_CHARACTER",

          message:
            "Character has sufficient raw data but is missing from generatedMetaTargets.json."
        }
      ]
    };
  }


  // --------------------------------------------------------------------------
  // Aggregate target
  // --------------------------------------------------------------------------

  const aggregateTarget =
    (
      generatedCharacter.targets ??
      []
    ).find(
      target =>
        target.source
          ?.type ===
          "aggregate" ||
        target.name ===
          "Kyber Meta"
    );


  if (
    !aggregateTarget
  ) {
    checks.push({
      status:
        "FAIL",

      code:
        "MISSING_AGGREGATE_TARGET",

      message:
        "Generated character has no aggregate Kyber Meta target."
    });
  }


  if (
    Number(
      generatedCharacter.sampleSize
    ) !==
    sampleSize
  ) {
    checks.push({
      status:
        "WARN",

      code:
        "SAMPLE_SIZE_MISMATCH",

      message:
        `Raw sample size is ${sampleSize}; generated character reports ${generatedCharacter.sampleSize}.`
    });

  } else {
    checks.push({
      status:
        "PASS",

      code:
        "SAMPLE_SIZE",

      message:
        `Generated sample size matches raw sample size (${sampleSize}).`
    });
  }


  // --------------------------------------------------------------------------
  // Loadout diversity
  // --------------------------------------------------------------------------

  const loadoutAnalysis =
    analyzeLoadouts(
      rawCharacter
    );


  checks.push({
    status:
      "INFO",

    code:
      "LOADOUT_DIVERSITY",

    message:
      `${loadoutAnalysis.classification}; top build ${percent(loadoutAnalysis.top1Share)}, top three ${percent(loadoutAnalysis.top3Share)}, effective loadouts ${loadoutAnalysis.effectiveLoadouts}.`
  });


  /**
   * Aggregate Kyber target should not hard-lock one particular set build.
   */
  if (
    aggregateTarget &&
    Object.keys(
      aggregateTarget
        .setRestrictions ??
      {}
    ).length >
      0
  ) {
    checks.push({
      status:
        "FAIL",

      code:
        "AGGREGATE_SET_RESTRICTION",

      message:
        "Aggregate Kyber Meta target contains hard set restrictions. Aggregate targets should remain set-flexible."
    });

  } else if (
    aggregateTarget
  ) {
    checks.push({
      status:
        "PASS",

      code:
        "AGGREGATE_SET_FLEXIBILITY",

      message:
        "Aggregate Kyber Meta target correctly leaves set choice unrestricted."
    });
  }


  // --------------------------------------------------------------------------
  // Aggregate primaries
  // --------------------------------------------------------------------------

  let primaryValidation =
    null;


  let weightValidation =
    null;


  if (
    aggregateTarget
  ) {
    primaryValidation =
      validatePrimaryRestrictions(
        aggregateTarget,

        rawCharacter
          .aggregate
          ?.primaries ??
        {},

        compilerSettings
      );


    checks.push(
      ...primaryValidation.checks
    );


    weightValidation =
      analyzeWeightSanity(
        aggregateTarget,

        rawCharacter
          .aggregate
          ?.secondaries
          ?.stats ??
        {},

        globalAverages
      );


    checks.push(
      ...weightValidation.checks
    );
  }


  // --------------------------------------------------------------------------
  // Archetypes
  // --------------------------------------------------------------------------

  const archetypeValidation =
    validateArchetypes(
      rawCharacter,
      generatedCharacter,
      compilerSettings,
      globalAverages
    );


  checks.push(
    ...archetypeValidation.checks
  );


  // --------------------------------------------------------------------------
  // Multimodal coverage warning
  // --------------------------------------------------------------------------

  if (
    (
      loadoutAnalysis.classification ===
        "multimodal" ||
      loadoutAnalysis.classification ===
        "highly multimodal"
    ) &&
    archetypeValidation
      .actualLoadoutIds
      .length ===
      0
  ) {
    checks.push({
      status:
        "WARN",

      code:
        "MULTIMODAL_WITHOUT_ARCHETYPES",

      message:
        "Character has a multimodal loadout distribution but no explicit archetype targets were generated."
    });
  }


  const status =
    worstStatus(
      checks
    );


  return {
    baseId,

    name:
      rawCharacter.name ??
      generatedCharacter.name ??
      baseId,

    sampleSize,

    relicAverage:
      rawCharacter.relicAverage ??
      null,

    skipped:
      false,

    status,

    loadoutAnalysis,

    aggregateTarget,

    primaryValidation,

    weightValidation,

    archetypeValidation,

    checks
  };
}


// ============================================================================
// MARKDOWN — SUMMARY
// ============================================================================

function buildSummaryMarkdown(
  results
) {
  const lines =
    [];


  lines.push(
    "## Character Summary"
  );


  lines.push(
    ""
  );


  lines.push(
    "| Status | Character | Samples | Top Loadout | Top Share | Effective Loadouts | Secondary Correlation | Archetypes |"
  );


  lines.push(
    "| --- | --- | ---: | --- | ---: | ---: | ---: | ---: |"
  );


  const sorted =
    [
      ...results
    ]
      .filter(
        result =>
          !result.skipped
      )
      .sort(
        (
          left,
          right
        ) => {
          const severity =
            STATUS_RANK[
              right.status
            ] -
            STATUS_RANK[
              left.status
            ];


          if (
            severity !==
            0
          ) {
            return severity;
          }


          return (
            right.sampleSize -
            left.sampleSize
          );
        }
      );


  for (
    const result
    of sorted
  ) {
    const topLoadout =
      result
        .loadoutAnalysis
        ?.loadouts
        ?.[
          0
        ];


    lines.push(
      [
        "|",
        result.status,
        "|",
        markdownEscape(
          result.name
        ),
        "|",
        result.sampleSize,
        "|",
        markdownEscape(
          topLoadout
            ? (
                topLoadout.sets.join(
                  " + "
                ) ||
                topLoadout.id
              )
            : "—"
        ),
        "|",
        percent(
          result
            .loadoutAnalysis
            ?.top1Share
        ),
        "|",
        result
          .loadoutAnalysis
          ?.effectiveLoadouts ??
        "—",
        "|",
        result
          .weightValidation
          ?.correlation ??
        "—",
        "|",
        result
          .archetypeValidation
          ?.actualLoadoutIds
          ?.length ??
        0,
        "|"
      ].join(
        " "
      )
    );
  }


  return lines.join(
    "\n"
  );
}


// ============================================================================
// MARKDOWN — DETAIL
// ============================================================================

function buildDetailMarkdown(
  result
) {
  const lines =
    [];


  lines.push(
    `## ${result.name} (\`${result.baseId}\`)`
  );


  lines.push(
    ""
  );


  lines.push(
    `**Overall status:** ${result.status}`
  );


  lines.push(
    ""
  );


  lines.push(
    `Samples: **${result.sampleSize}**  `
  );


  lines.push(
    `Average relic: **${result.relicAverage ?? "—"}**`
  );


  lines.push(
    ""
  );


  // --------------------------------------------------------------------------
  // Loadouts
  // --------------------------------------------------------------------------

  lines.push(
    "### Loadout distribution"
  );


  lines.push(
    ""
  );


  lines.push(
    `Classification: **${result.loadoutAnalysis.classification}**`
  );


  lines.push(
    ""
  );


  lines.push(
    `Top build share: **${percent(result.loadoutAnalysis.top1Share)}**  `
  );


  lines.push(
    `Top-three share: **${percent(result.loadoutAnalysis.top3Share)}**  `
  );


  lines.push(
    `Effective number of loadouts: **${result.loadoutAnalysis.effectiveLoadouts}**  `
  );


  lines.push(
    `Normalized entropy: **${result.loadoutAnalysis.normalizedEntropy}**`
  );


  lines.push(
    ""
  );


  lines.push(
    "| Rank | Loadout | Count | Share |"
  );


  lines.push(
    "| ---: | --- | ---: | ---: |"
  );


  result.loadoutAnalysis
    .loadouts
    .slice(
      0,
      TOP_LOADOUTS_TO_DISPLAY
    )
    .forEach(
      (
        loadout,
        index
      ) => {
        lines.push(
          `| ${index + 1} | ${markdownEscape(loadout.sets.join(" + ") || loadout.id)} | ${loadout.count} | ${percent(loadout.share)} |`
        );
      }
    );


  lines.push(
    ""
  );


  // --------------------------------------------------------------------------
  // Aggregate weights
  // --------------------------------------------------------------------------

  lines.push(
    "### Aggregate Kyber Meta weights"
  );


  lines.push(
    ""
  );


  const sortedWeights =
    Object.entries(
      result
        .weightValidation
        ?.weights ??
      {}
    )
      .sort(
        (
          [
            ,
            left
          ],
          [
            ,
            right
          ]
        ) =>
          right -
          left
      );


  lines.push(
    "| Stat | Weight | Empirical secondary signal |"
  );


  lines.push(
    "| --- | ---: | ---: |"
  );


  for (
    const [
      stat,
      weight
    ]
    of sortedWeights
  ) {
    const signal =
      result
        .weightValidation
        ?.secondarySignals
        ?.[
          stat
        ];


    lines.push(
      `| ${stat} | ${weight} | ${signal ?? "—"} |`
    );
  }


  lines.push(
    ""
  );


  lines.push(
    `Secondary-rank Spearman correlation: **${result.weightValidation?.correlation ?? "—"}**`
  );


  lines.push(
    ""
  );


  // --------------------------------------------------------------------------
  // Primaries
  // --------------------------------------------------------------------------

  lines.push(
    "### Aggregate primary consensus"
  );


  lines.push(
    ""
  );


  lines.push(
    "| Slot | Samples | Winner | Winner Share | Runner-up | Margin | Expected Restriction | Generated Restriction |"
  );


  lines.push(
    "| --- | ---: | --- | ---: | --- | ---: | --- | --- |"
  );


  for (
    const [
      slot,
      primary
    ]
    of Object.entries(
      result
        .primaryValidation
        ?.slots ??
      {}
    )
  ) {
    lines.push(
      [
        "|",
        slot,
        "|",
        primary.total,
        "|",
        markdownEscape(
          primary.best
            ?.name ??
          "—"
        ),
        "|",
        percent(
          primary.best
            ?.frequency
        ),
        "|",
        markdownEscape(
          primary.second
            ?.name ??
          "—"
        ),
        "|",
        percent(
          primary.margin
        ),
        "|",
        markdownEscape(
          primary.expectedRestriction ??
          "Any"
        ),
        "|",
        markdownEscape(
          result
            .primaryValidation
            ?.actualRestrictions
            ?.[
              slot
            ] ??
          "Any"
        ),
        "|"
      ].join(
        " "
      )
    );
  }


  lines.push(
    ""
  );


  // --------------------------------------------------------------------------
  // Archetypes
  // --------------------------------------------------------------------------

  lines.push(
    "### Generated archetypes"
  );


  lines.push(
    ""
  );


  if (
    !result
      .archetypeValidation
      ?.details
      ?.length
  ) {
    lines.push(
      "_No generated archetype targets._"
    );

  } else {
    lines.push(
      "| Loadout | Share | Samples | Set Match | Weight Correlation |"
    );


    lines.push(
      "| --- | ---: | ---: | --- | ---: |"
    );


    for (
      const archetype
      of result
        .archetypeValidation
        .details
    ) {
      lines.push(
        `| ${archetype.loadoutId} | ${percent(archetype.share)} | ${archetype.sampleSize} | ${archetype.setRestrictionsMatch ? "PASS" : "FAIL"} | ${archetype.weightValidation.correlation ?? "—"} |`
      );
    }
  }


  lines.push(
    ""
  );


  // --------------------------------------------------------------------------
  // Checks
  // --------------------------------------------------------------------------

  lines.push(
    "### Validation checks"
  );


  lines.push(
    ""
  );


  for (
    const check
    of result.checks
  ) {
    lines.push(
      `- **${check.status}** — ${check.message}`
    );
  }


  lines.push(
    ""
  );


  return lines.join(
    "\n"
  );
}


// ============================================================================
// MARKDOWN REPORT
// ============================================================================

function buildMarkdownReport(
  raw,
  generated,
  compilerSettings,
  results
) {
  const lines =
    [];


  const analyzed =
    results.filter(
      result =>
        !result.skipped
    );


  const counts = {
    PASS:
      analyzed.filter(
        result =>
          result.status ===
          "PASS"
      ).length,

    WARN:
      analyzed.filter(
        result =>
          result.status ===
          "WARN"
      ).length,

    FAIL:
      analyzed.filter(
        result =>
          result.status ===
          "FAIL"
      ).length
  };


  lines.push(
    "# Grand Ivory Kyber Meta Validation Report"
  );


  lines.push(
    ""
  );


  lines.push(
    `Generated: ${new Date().toISOString()}`
  );


  lines.push(
    ""
  );


  lines.push(
    "This report validates generated optimizer targets against the raw Kyber mod distribution used to create them."
  );


  lines.push(
    ""
  );


  lines.push(
    "> This is an internal-consistency validation, not yet a true holdout test. A later version should train on one player cohort and validate against unseen players."
  );


  lines.push(
    ""
  );


  lines.push(
    "## Overview"
  );


  lines.push(
    ""
  );


  lines.push(
    `- Raw characters: **${Object.keys(raw.characters ?? {}).length}**`
  );


  lines.push(
    `- Generated characters: **${Object.keys(generated.characters ?? {}).length}**`
  );


  lines.push(
    `- Characters validated: **${analyzed.length}**`
  );


  lines.push(
    `- PASS: **${counts.PASS}**`
  );


  lines.push(
    `- WARN: **${counts.WARN}**`
  );


  lines.push(
    `- FAIL: **${counts.FAIL}**`
  );


  lines.push(
    ""
  );


  lines.push(
    "Compiler thresholds:"
  );


  lines.push(
    ""
  );


  lines.push(
    `- Character samples: ${compilerSettings.minimumCharacterSampleSize}`
  );


  lines.push(
    `- Primary samples: ${compilerSettings.minimumPrimarySampleSize}`
  );


  lines.push(
    `- Primary winner threshold: ${percent(compilerSettings.primaryLockThreshold)}`
  );


  lines.push(
    `- Primary winner margin: ${percent(compilerSettings.primaryLockMargin)}`
  );


  lines.push(
    `- Archetype share threshold: ${percent(compilerSettings.archetypeMinimumShare)}`
  );


  lines.push(
    `- Archetype count threshold: ${compilerSettings.archetypeMinimumCount}`
  );


  lines.push(
    `- Max archetypes: ${compilerSettings.maximumArchetypesPerCharacter}`
  );


  lines.push(
    ""
  );


  lines.push(
    buildSummaryMarkdown(
      results
    )
  );


  lines.push(
    ""
  );


  lines.push(
    "# Detailed Validation"
  );


  lines.push(
    ""
  );


  const detailedResults =
    VALIDATION_DETAIL_ALL
      ? analyzed
      : analyzed.filter(
          result =>
            VALIDATION_FOCUS.has(
              result.baseId
                .toUpperCase()
            )
        );


  for (
    const result
    of detailedResults
  ) {
    lines.push(
      buildDetailMarkdown(
        result
      )
    );
  }


  return lines.join(
    "\n"
  );
}


// ============================================================================
// CONSOLE FOCUS SUMMARY
// ============================================================================

function printFocusSummary(
  results
) {
  console.log(
    ""
  );


  console.log(
    "=============================================="
  );


  console.log(
    "Focus Characters"
  );


  console.log(
    "=============================================="
  );


  for (
    const result
    of results
  ) {
    if (
      result.skipped ||
      !VALIDATION_FOCUS.has(
        result.baseId
          .toUpperCase()
      )
    ) {
      continue;
    }


    console.log(
      ""
    );


    console.log(
      `${result.name} (${result.baseId})`
    );


    console.log(
      `  Status: ${result.status}`
    );


    console.log(
      `  Samples: ${result.sampleSize}`
    );


    console.log(
      `  Loadouts: ${result.loadoutAnalysis.classification}`
    );


    console.log(
      `  Top build: ${percent(result.loadoutAnalysis.top1Share)}`
    );


    console.log(
      `  Top 3: ${percent(result.loadoutAnalysis.top3Share)}`
    );


    console.log(
      `  Effective loadouts: ${result.loadoutAnalysis.effectiveLoadouts}`
    );


    console.log(
      `  Secondary correlation: ${result.weightValidation?.correlation ?? "n/a"}`
    );


    console.log(
      `  Archetypes generated: ${result.archetypeValidation?.actualLoadoutIds?.length ?? 0}`
    );


    const failures =
      result.checks.filter(
        check =>
          check.status ===
          "FAIL"
      );


    const warnings =
      result.checks.filter(
        check =>
          check.status ===
          "WARN"
      );


    if (
      failures.length
    ) {
      console.log(
        "  FAILURES:"
      );


      for (
        const check
        of failures
      ) {
        console.log(
          `    - ${check.message}`
        );
      }
    }


    if (
      warnings.length
    ) {
      console.log(
        "  WARNINGS:"
      );


      for (
        const check
        of warnings
      ) {
        console.log(
          `    - ${check.message}`
        );
      }
    }
  }
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
    "Grand Ivory Meta Validation"
  );


  console.log(
    "=============================================="
  );


  console.log(
    ""
  );


  console.log(
    `Raw data: ${RAW_FILE}`
  );


  console.log(
    `Generated targets: ${GENERATED_FILE}`
  );


  const raw =
    JSON.parse(
      await fs.readFile(
        RAW_FILE,
        "utf8"
      )
    );


  const generated =
    JSON.parse(
      await fs.readFile(
        GENERATED_FILE,
        "utf8"
      )
    );


  const rawCharacters =
    raw.characters ??
    {};


  const generatedCharacters =
    generated.characters ??
    {};


  const compilerSettings =
    getCompilerSettings(
      generated
    );


  console.log(
    `Raw characters: ${Object.keys(rawCharacters).length}`
  );


  console.log(
    `Generated characters: ${Object.keys(generatedCharacters).length}`
  );


  console.log(
    "Building global secondary baselines..."
  );


  const globalAverages =
    buildGlobalSecondaryAverages(
      rawCharacters
    );


  const results =
    [];


  for (
    const [
      baseId,
      rawCharacter
    ]
    of Object.entries(
      rawCharacters
    )
  ) {
    results.push(
      validateCharacter(
        baseId,
        rawCharacter,
        generatedCharacters[
          baseId
        ],
        compilerSettings,
        globalAverages
      )
    );
  }


  // --------------------------------------------------------------------------
  // Generated characters with no raw source
  // --------------------------------------------------------------------------

  for (
    const baseId
    of Object.keys(
      generatedCharacters
    )
  ) {
    if (
      rawCharacters[
        baseId
      ]
    ) {
      continue;
    }


    results.push({
      baseId,

      name:
        generatedCharacters[
          baseId
        ].name ??
        baseId,

      sampleSize:
        0,

      skipped:
        false,

      status:
        "FAIL",

      checks: [
        {
          status:
            "FAIL",

          code:
            "GENERATED_WITHOUT_RAW",

          message:
            "Character exists in generatedMetaTargets.json but has no source character in metaProfiles.json."
        }
      ]
    });
  }


  // --------------------------------------------------------------------------
  // JSON
  // --------------------------------------------------------------------------

  const analyzed =
    results.filter(
      result =>
        !result.skipped
    );


  const outputJson = {
    schemaVersion:
      1,

    generatedAt:
      new Date()
        .toISOString(),

    source: {
      rawFile:
        RAW_FILE,

      generatedFile:
        GENERATED_FILE,

      rawGeneratedAt:
        raw.source
          ?.generatedAt ??
        null,

      targetsGeneratedAt:
        generated.generatedAt ??
        null
    },

    compilerSettings,

    summary: {
      rawCharacters:
        Object.keys(
          rawCharacters
        ).length,

      generatedCharacters:
        Object.keys(
          generatedCharacters
        ).length,

      validatedCharacters:
        analyzed.length,

      skippedCharacters:
        results.length -
        analyzed.length,

      pass:
        analyzed.filter(
          result =>
            result.status ===
            "PASS"
        ).length,

      warn:
        analyzed.filter(
          result =>
            result.status ===
            "WARN"
        ).length,

      fail:
        analyzed.filter(
          result =>
            result.status ===
            "FAIL"
        ).length
    },

    characters:
      Object.fromEntries(
        results.map(
          result => [
            result.baseId,
            result
          ]
        )
      )
  };


  await writeFileAtomic(
    REPORT_JSON_FILE,

    JSON.stringify(
      outputJson,
      null,
      2
    ) + "\n"
  );


  // --------------------------------------------------------------------------
  // Markdown
  // --------------------------------------------------------------------------

  const markdown =
    buildMarkdownReport(
      raw,
      generated,
      compilerSettings,
      results
    );


  await writeFileAtomic(
    REPORT_MD_FILE,
    markdown + "\n"
  );


  // --------------------------------------------------------------------------
  // Console
  // --------------------------------------------------------------------------

  console.log(
    ""
  );


  console.log(
    "Validation complete."
  );


  console.log(
    ""
  );


  console.log(
    `PASS: ${outputJson.summary.pass}`
  );


  console.log(
    `WARN: ${outputJson.summary.warn}`
  );


  console.log(
    `FAIL: ${outputJson.summary.fail}`
  );


  console.log(
    `Skipped: ${outputJson.summary.skippedCharacters}`
  );


  console.log(
    ""
  );


  console.log(
    `Markdown: ${REPORT_MD_FILE}`
  );


  console.log(
    `JSON: ${REPORT_JSON_FILE}`
  );


  printFocusSummary(
    results
  );


  /**
   * Don't fail the Node process merely because the model has validation
   * failures. We want the report to be generated so those failures can be
   * inspected.
   */
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
      "Validation report generation failed:"
    );


    console.error(
      error
    );


    process.exitCode =
      1;
  }
);