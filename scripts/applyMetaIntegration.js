#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";


// ============================================================================
// FILE LOCATIONS
// ============================================================================

const CHARACTER_SETTINGS_FILE =
  process.env.CHARACTER_SETTINGS_FILE ??
  "src/constants/characterSettings.js";


const CHARACTER_FILE =
  process.env.CHARACTER_FILE ??
  "src/domain/Character.js";


const STORAGE_ACTIONS_FILE =
  process.env.STORAGE_ACTIONS_FILE ??
  "src/state/actions/storage.js";


const DATA_ACTIONS_FILE =
  process.env.DATA_ACTIONS_FILE ??
  "src/state/actions/data.js";


const WORKER_FILE =
  process.env.OPTIMIZER_WORKER_FILE ??
  "public/workers/optimizer.js";


const PACKAGE_FILE =
  process.env.PACKAGE_FILE ??
  "package.json";


const GENERATED_META_FILE =
  process.env.META_TARGETS_FILE ??
  "src/constants/generatedMetaTargets.json";


// ============================================================================
// CHARACTER SETTINGS PATCH MARKERS
// ============================================================================

const IMPORT_LINE =
  'import generatedMetaTargets from "./generatedMetaTargets.json";';


const BEGIN_MARKER =
  "// BEGIN GENERATED KYBER META INTEGRATION";


const END_MARKER =
  "// END GENERATED KYBER META INTEGRATION";


// ============================================================================
// STORAGE PATCH MARKERS
// ============================================================================

const STORAGE_BEGIN =
  "// BEGIN KYBER META PROFILE MIGRATION";


const STORAGE_END =
  "// END KYBER META PROFILE MIGRATION";


// ============================================================================
// CHARACTER SETTINGS INTEGRATION
// ============================================================================

const INTEGRATION_BLOCK =
`${BEGIN_MARKER}

/**
 * Turn the legacy generated-meta schema:
 *
 * {
 *   weights: {...},
 *   metaPreferences: {...}
 * }
 *
 * into a normal Grand Ivory optimization target.
 *
 * This allows the integration to work with both generations of
 * generatedMetaTargets.json.
 */
function legacyMetaPrimaryRestrictions(
  metaCharacter
) {
  const restrictions =
    {};


  const primaries =
    metaCharacter
      .metaPreferences
      ?.aggregatePrimaries ??
    {};


  for (
    const [
      slot,
      slotData
    ]
    of Object.entries(
      primaries
    )
  ) {
    const probabilities =
      Object.entries(
        slotData.probabilities ||
        {}
      )
        .map(
          (
            [
              primary,
              probability
            ]
          ) => ({
            primary,

            probability:
              Number(
                probability ||
                0
              )
          })
        )
        .sort(
          (
            left,
            right
          ) =>
            right.probability -
            left.probability
        );


    const best =
      probabilities[
        0
      ];


    const second =
      probabilities[
        1
      ];


    if (
      !best
    ) {
      continue;
    }


    const margin =
      best.probability -
      (
        second
          ?.probability ??
        0
      );


    /**
     * Same conservative restriction rule as the compiler:
     *
     * - winner >= 80%
     * - lead over second place >= 40 percentage points
     */
    if (
      best.probability >=
        0.80 &&
      margin >=
        0.40
    ) {
      restrictions[
        slot
      ] =
        best.primary;
    }
  }


  return restrictions;
}


/**
 * Normalize either version of generatedMetaTargets.json into the target-array
 * format expected by this integration.
 */
function getGeneratedMetaTargets(
  metaCharacter
) {
  if (
    Array.isArray(
      metaCharacter
        ?.targets
    )
  ) {
    return metaCharacter.targets;
  }


  /**
   * Backward compatibility with:
   *
   * {
   *   weights: {...},
   *   metaPreferences: {...}
   * }
   */
  if (
    metaCharacter
      ?.weights
  ) {
    const weights =
      metaCharacter.weights;


    return [
      {
        name:
          "Kyber Meta",

        health:
          Number(
            weights.health ||
            0
          ),

        protection:
          Number(
            weights.protection ||
            0
          ),

        speed:
          Number(
            weights.speed ||
            0
          ),

        critDmg:
          Number(
            weights.critDmg ||
            0
          ),

        potency:
          Number(
            weights.potency ||
            0
          ),

        tenacity:
          Number(
            weights.tenacity ||
            0
          ),

        offense:
          Number(
            weights.offense ||
            0
          ),

        critChance:
          Number(
            weights.critChance ||
            0
          ),

        defense:
          Number(
            weights.defense ||
            0
          ),

        accuracy:
          Number(
            weights.accuracy ||
            0
          ),

        critAvoid:
          Number(
            weights.critAvoid ||
            0
          ),

        primaryStatRestrictions:
          legacyMetaPrimaryRestrictions(
            metaCharacter
          ),

        setRestrictions:
          {},

        useOnlyFullSets:
          true
      }
    ];
  }


  return [];
}


/**
 * Convert generated plan data into Grand Ivory's OptimizationPlan.
 */
function generatedMetaTargetToOptimizationPlan(
  metaTarget,
  damageType
) {
  const offense =
    Number(
      metaTarget.offense ||
      0
    );


  const defense =
    Number(
      metaTarget.defense ||
      0
    );


  /**
   * Grand Ivory separates Physical and Special Damage.
   *
   * DamageType:
   *
   * physical = 1
   * special  = 0
   * mixed    = 0.5
   */
  const physicalOffense =
    offense *
    damageType;


  const specialOffense =
    offense *
    (
      1 -
      damageType
    );


  /**
   * Likewise, our generic Defense signal is split across Armor and Resistance.
   *
   * Splitting rather than duplicating preserves the intended total weight.
   */
  const armor =
    defense /
    2;


  const resistance =
    defense /
    2;


  return new OptimizationPlan(
    metaTarget.name ||
      "Kyber Meta",

    Number(
      metaTarget.health ||
      0
    ),

    Number(
      metaTarget.protection ||
      0
    ),

    Number(
      metaTarget.speed ||
      0
    ),

    Number(
      metaTarget.critDmg ||
      0
    ),

    Number(
      metaTarget.potency ||
      0
    ),

    Number(
      metaTarget.tenacity ||
      0
    ),

    physicalOffense,

    specialOffense,

    Number(
      metaTarget.critChance ||
      0
    ),

    armor,

    resistance,

    Number(
      metaTarget.accuracy ||
      0
    ),

    Number(
      metaTarget.critAvoid ||
      0
    ),

    true,

    metaTarget.primaryStatRestrictions ||
      {},

    metaTarget.setRestrictions ||
      {},

    [],

    typeof metaTarget.useOnlyFullSets !==
      "undefined"
      ? metaTarget.useOnlyFullSets
      : true
  );
}


/**
 * Inject generated Kyber targets into characterSettings.
 *
 * Important:
 *
 * Generated targets are placed FIRST.
 *
 * Therefore:
 *
 * characterSettings[id].targets[0]
 *
 * will be Kyber Meta whenever that character has meta data.
 */
for (
  const [
    baseID,
    metaCharacter
  ]
  of Object.entries(
    generatedMetaTargets.characters ||
    {}
  )
) {
  const existingSettings =
    characterSettings[
      baseID
    ] ||
    new CharacterSettings(
      [],
      [],
      DamageType.mixed
    );


  let generatedTargets =
    getGeneratedMetaTargets(
      metaCharacter
    )
      .map(
        metaTarget =>
          generatedMetaTargetToOptimizationPlan(
            metaTarget,
            existingSettings.damageType
          )
      );


  if (
    !generatedTargets.length
  ) {
    continue;
  }


  /**
   * Exact "Kyber Meta" target always comes first.
   *
   * Archetype variants follow:
   *
   * Kyber Meta
   * Kyber Meta: Crit Damage + Crit Chance (...)
   * ...
   */
  generatedTargets =
    generatedTargets.sort(
      (
        left,
        right
      ) => {
        if (
          left.name ===
          "Kyber Meta"
        ) {
          return -1;
        }


        if (
          right.name ===
          "Kyber Meta"
        ) {
          return 1;
        }


        return 0;
      }
    );


  /**
   * Never retain old/stale generated Kyber targets from the hand-written
   * settings array.
   */
  const existingTargets =
    existingSettings.targets
      .filter(
        target =>
          !target.name.startsWith(
            "Kyber Meta"
          )
      );


  characterSettings[
    baseID
  ] =
    new CharacterSettings(
      [
        ...generatedTargets,
        ...existingTargets
      ],

      existingSettings.extraTags,

      existingSettings.damageType
    );
}

${END_MARKER}`;


// ============================================================================
// FILE HELPERS
// ============================================================================

async function fileExists(
  filename
) {
  try {
    await fs.access(
      filename
    );


    return true;

  } catch {
    return false;
  }
}


async function writeAtomic(
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
// GENERATED FILE PLACEHOLDER
// ============================================================================

async function ensureGeneratedMetaPlaceholder() {
  if (
    await fileExists(
      GENERATED_META_FILE
    )
  ) {
    return;
  }


  await writeAtomic(
    GENERATED_META_FILE,

    JSON.stringify(
      {
        schemaVersion:
          2,

        generatedAt:
          null,

        characters:
          {}
      },

      null,
      2
    ) + "\n"
  );


  console.log(
    `Created placeholder ${GENERATED_META_FILE}`
  );
}


// ============================================================================
// CHARACTER SETTINGS
// ============================================================================

function removeOldCharacterSettingsBlock(
  source
) {
  const start =
    source.indexOf(
      BEGIN_MARKER
    );


  if (
    start ===
    -1
  ) {
    return source;
  }


  const end =
    source.indexOf(
      END_MARKER,
      start
    );


  if (
    end ===
    -1
  ) {
    throw new Error(
      `${BEGIN_MARKER} exists but ${END_MARKER} was not found.`
    );
  }


  return (
    source.slice(
      0,
      start
    ) +
    source.slice(
      end +
      END_MARKER.length
    )
  );
}


function ensureCharacterSettingsImport(
  source
) {
  if (
    source.includes(
      IMPORT_LINE
    )
  ) {
    return source;
  }


  const characterDataImport =
    'import { CharacterSettings, DamageType } from "../domain/CharacterDataClasses";';


  if (
    source.includes(
      characterDataImport
    )
  ) {
    return source.replace(
      characterDataImport,

      `${characterDataImport}
${IMPORT_LINE}`
    );
  }


  const targetStatImport =
    'import TargetStat from "../domain/TargetStat";';


  if (
    source.includes(
      targetStatImport
    )
  ) {
    return source.replace(
      targetStatImport,

      `${targetStatImport}
${IMPORT_LINE}`
    );
  }


  throw new Error(
    `Could not locate an import anchor in ${CHARACTER_SETTINGS_FILE}.`
  );
}


function addCharacterSettingsBlock(
  source
) {
  const freezeLoop =
    "for (let charID in characterSettings) {";


  const index =
    source.indexOf(
      freezeLoop
    );


  if (
    index ===
    -1
  ) {
    throw new Error(
      `Could not find the characterSettings freeze loop in ${CHARACTER_SETTINGS_FILE}.`
    );
  }


  return (
    source
      .slice(
        0,
        index
      )
      .trimEnd() +

    "\n\n" +

    INTEGRATION_BLOCK +

    "\n\n" +

    source.slice(
      index
    )
  );
}


async function patchCharacterSettings() {
  let source =
    await fs.readFile(
      CHARACTER_SETTINGS_FILE,
      "utf8"
    );


  source =
    removeOldCharacterSettingsBlock(
      source
    );


  source =
    ensureCharacterSettingsImport(
      source
    );


  source =
    addCharacterSettingsBlock(
      source
    );


  await writeAtomic(
    CHARACTER_SETTINGS_FILE,
    source
  );


  console.log(
    `Updated ${CHARACTER_SETTINGS_FILE}`
  );
}


// ============================================================================
// CHARACTER.JS
// ============================================================================

/**
 * This is what actually guarantees:
 *
 * 1. Kyber Meta appears in the dropdown.
 * 2. Kyber Meta appears first.
 * 3. A stale player-saved Kyber Meta target cannot override freshly generated
 *    values.
 * 4. defaultTarget() returns Kyber Meta.
 */
async function patchCharacterModel() {
  let source =
    await fs.readFile(
      CHARACTER_FILE,
      "utf8"
    );


  /**
   * Check if already patched
   */
  if (
    source.includes(
      "Kyber Meta is generated data"
    )
  ) {
    console.log(
      `${CHARACTER_FILE} already patched`
    );

    return;
  }


  const targetsExpression =
/  targets\(\) \{[\s\S]*?return Object\.values\(Object\.assign\(\{\}, defaultTargets, playerTargets\)\);[\s\S]*?\n  \}/;

  const defaultTargetExpression =
/  defaultTarget\(\) \{[\s\S]*?return this\.targets\(\)\[0\] \|\| new OptimizationPlan\('unnamed'\);[\s\S]*?\n  \}/;

  if (!targetsExpression.test(source) || !defaultTargetExpression.test(source)) {
    throw new Error(
      `Could not locate targets() + defaultTarget() in ${CHARACTER_FILE}.`
    );
  }


  source = source.replace(targetsExpression, `  targets() {
    const defaultTargets = groupByKey(
      characterSettings[this.baseID]
        ? characterSettings[this.baseID].targets
        : [],
      target => target.name
    );


    const playerTargets = groupByKey(
      this.optimizerSettings
        ? this.optimizerSettings.targets
        : [],
      target => target.name
    );


    /**
     * Preserve normal Grand Ivory behavior for user-modified targets.
     *
     * Player targets normally override defaults with the same name.
     */
    const mergedTargets =
      Object.assign(
        {},
        defaultTargets,
        playerTargets
      );


    /**
     * Kyber Meta is generated data.
     *
     * Always use the current generated version rather than a stale copy that
     * may have been saved in the player's IndexedDB profile.
     */
    if (
      defaultTargets["Kyber Meta"]
    ) {
      mergedTargets["Kyber Meta"] =
        defaultTargets["Kyber Meta"];
    }


    const targets =
      Object.values(
        mergedTargets
      );


    /**
     * Force Kyber Meta to the first position in the target dropdown.
     */
    const kyberIndex =
      targets.findIndex(
        target =>
          target.name ===
          "Kyber Meta"
      );


    if (
      kyberIndex >
      0
    ) {
      const [
        kyberTarget
      ] =
        targets.splice(
          kyberIndex,
          1
        );


      targets.unshift(
        kyberTarget
      );
    }


    return targets;
  }`);

  source = source.replace(defaultTargetExpression, `  defaultTarget() {
    const targets =
      this.targets();


    /**
     * Kyber Meta is the default everywhere it exists.
     */
    return (
      targets.find(
        target =>
          target.name ===
          "Kyber Meta"
      ) ||
      targets[0] ||
      new OptimizationPlan(
        "unnamed"
      )
    );
  }`);


  await writeAtomic(
    CHARACTER_FILE,
    source
  );


  console.log(
    `Updated ${CHARACTER_FILE}`
  );
}


// ============================================================================
// STORAGE PROFILE MIGRATION
// ============================================================================

const STORAGE_MIGRATION_BLOCK =
`${STORAGE_BEGIN}

/**
 * Existing Grand Ivory profiles store the selected OptimizationPlan directly
 * in profile.selectedCharacters.
 *
 * Merely changing Character.defaultTarget() therefore does NOT update
 * characters that were already selected before Kyber Meta existed.
 *
 * This migrates selected characters to Kyber Meta whenever one is available.
 */
function applyKyberMetaDefaults(
  profile
) {
  if (
    !profile
  ) {
    return profile;
  }


  const selectedCharacters =
    profile.selectedCharacters
      .filter(
        ({
          id
        }) =>
          Object.keys(
            profile.characters
          ).includes(
            id
          )
      )
      .map(
        ({
          id,
          target
        }) => {
          const character =
            profile.characters[
              id
            ];


          if (
            !character
          ) {
            return {
              id,
              target
            };
          }


          const kyberTarget =
            character
              .targets()
              .find(
                candidate =>
                  candidate.name ===
                  "Kyber Meta"
              );


          return {
            id,

            target:
              kyberTarget ||
              target
          };
        }
      );


  return profile.withSelectedCharacters(
    selectedCharacters
  );
}

${STORAGE_END}`;


function removeStorageMigrationBlock(
  source
) {
  const start =
    source.indexOf(
      STORAGE_BEGIN
    );


  if (
    start ===
    -1
  ) {
    return source;
  }


  const end =
    source.indexOf(
      STORAGE_END,
      start
    );


  if (
    end ===
    -1
  ) {
    throw new Error(
      `${STORAGE_BEGIN} exists but ${STORAGE_END} was not found.`
    );
  }


  return (
    source.slice(
      0,
      start
    ) +
    source.slice(
      end +
      STORAGE_END.length
    )
  );
}


function insertStorageMigrationBlock(
  source
) {
  const anchor =
    "export const CLEAN_STATE = 'CLEAN_STATE';";


  const index =
    source.indexOf(
      anchor
    );


  if (
    index ===
    -1
  ) {
    throw new Error(
      `Could not locate storage action constants in ${STORAGE_ACTIONS_FILE}.`
    );
  }


  return (
    source.slice(
      0,
      index
    ) +

    STORAGE_MIGRATION_BLOCK +

    "\n\n" +

    source.slice(
      index
    )
  );
}


function patchStorageLoadProfiles(
  source
) {
  /**
   * If already patched, leave it alone.
   */
  if (
    source.includes(
      "return applyKyberMetaDefaults("
    )
  ) {
    console.log(
      `${STORAGE_ACTIONS_FILE} loadProfiles() already patched`
    );

    return source;
  }


  const oldCode =
`          const cleanedProfiles = profiles.map(profile => {
            const cleanedSelectedCharacters =
              profile.selectedCharacters.filter(({ id }) => Object.keys(profile.characters).includes(id));
            return profile.withSelectedCharacters(cleanedSelectedCharacters);
          });

          // Set the active profile`;


  const newCode =
`          const cleanedProfiles = profiles.map(profile => {
            const cleanedSelectedCharacters =
              profile.selectedCharacters.filter(({ id }) => Object.keys(profile.characters).includes(id));
            const cleanedProfile = profile.withSelectedCharacters(cleanedSelectedCharacters);
            return applyKyberMetaDefaults(cleanedProfile);
          });

          // Set the active profile`;


  if (
    source.includes(
      oldCode
    )
  ) {
    return source.replace(
      oldCode,
      newCode
    );
  }


  console.warn(
    `Could not patch loadProfiles() in ${STORAGE_ACTIONS_FILE} - pattern not found, may already be patched`
  );

  return source;
}


function patchStorageLoadProfile(
  source
) {
  /**
   * If already patched, leave it alone.
   */
  if (
    source.includes(
      "applyKyberMetaDefaults("
    )
  ) {
    console.log(
      `${STORAGE_ACTIONS_FILE} loadProfile() already patched`
    );

    return source;
  }


  const oldCode =
`        const cleanedProfile = profile.withSelectedCharacters(cleanedSelectedCharacters);

        dispatch(setProfile(cleanedProfile));`;


  const newCode =
`        const cleanedProfile =
          applyKyberMetaDefaults(
            profile.withSelectedCharacters(
              cleanedSelectedCharacters
            )
          );

        dispatch(setProfile(cleanedProfile));`;


  if (
    source.includes(
      oldCode
    )
  ) {
    return source.replace(
      oldCode,
      newCode
    );
  }


  console.warn(
    `Could not patch loadProfile() in ${STORAGE_ACTIONS_FILE} - pattern not found, may already be patched`
  );

  return source;
}


async function patchStorageActions() {
  let source =
    await fs.readFile(
      STORAGE_ACTIONS_FILE,
      "utf8"
    );


  source =
    removeStorageMigrationBlock(
      source
    );


  source =
    insertStorageMigrationBlock(
      source
    );


  source =
    patchStorageLoadProfiles(
      source
    );


  source =
    patchStorageLoadProfile(
      source
    );


  await writeAtomic(
    STORAGE_ACTIONS_FILE,
    source
  );


  console.log(
    `Updated ${STORAGE_ACTIONS_FILE}`
  );
}


// ============================================================================
// DATA REFRESH MIGRATION
// ============================================================================

/**
 * Roster refreshes preserve the old selected target.
 *
 * Change that behavior so any currently selected character with a generated
 * Kyber Meta plan moves onto the newest generated Kyber Meta plan.
 */
async function patchDataActions() {
  let source =
    await fs.readFile(
      DATA_ACTIONS_FILE,
      "utf8"
    );


  /**
   * If already patched, leave it alone.
   */
  if (
    source.includes(
      "const migratedSelectedCharacters ="
    )
  ) {
    console.log(
      `${DATA_ACTIONS_FILE} profile migration already installed`
    );

    return;
  }


  const oldCode =
`        const newProfile = oldProfile
          .withCharacters(newCharacters)
          .withMods(finalMods);`;


  const newCode =
`        /**
         * Existing selected characters store an OptimizationPlan directly.
         *
         * Migrate each one to the freshly generated Kyber Meta target whenever
         * that character has one.
         */
        const migratedSelectedCharacters =
          oldProfile.selectedCharacters.map(
            ({
              id,
              target
            }) => {
              const character =
                newCharacters[
                  id
                ];


              if (
                !character
              ) {
                return {
                  id,
                  target
                };
              }


              const kyberTarget =
                character
                  .targets()
                  .find(
                    candidate =>
                      candidate.name ===
                      "Kyber Meta"
                  );


              return {
                id,

                target:
                  kyberTarget ||
                  target
              };
            }
          );


        const newProfile = oldProfile
          .withCharacters(newCharacters)
          .withSelectedCharacters(
            migratedSelectedCharacters
          )
          .withMods(finalMods);`;


  if (
    source.includes(
      oldCode
    )
  ) {
    source =
      source.replace(
        oldCode,
        newCode
      );

  } else {
    console.warn(
      `Could not locate newProfile construction in ${DATA_ACTIONS_FILE} - pattern not found, may already be patched`
    );

    return;
  }


  await writeAtomic(
    DATA_ACTIONS_FILE,
    source
  );


  console.log(
    `Updated ${DATA_ACTIONS_FILE}`
  );
}


// ============================================================================
// WORKER STAT WEIGHTS
// ============================================================================

function replaceNumericObjectProperty(
  source,
  propertyName,
  oldValue,
  newValue
) {
  const expression =
    new RegExp(
      `((?:['"])?${propertyName}(?:['"])?\\\\s*:\\\\s*)${oldValue}(\\\\s*,)`
    );


  if (
    expression.test(
      source
    )
  ) {
    return {
      source:
        source.replace(
          expression,

          (
            match,
            prefix,
            suffix
          ) =>
            `${prefix}${newValue}${suffix}`
        ),

      changed:
        true
    };
  }


  return {
    source,

    changed:
      false
  };
}


async function patchWorkerStatWeights() {
  if (
    !(
      await fileExists(
        WORKER_FILE
      )
    )
  ) {
    return;
  }


  let source =
    await fs.readFile(
      WORKER_FILE,
      "utf8"
    );


  const changes = [
    {
      property:
        "physDmg",

      oldValue:
        225,

      newValue:
        300
    },

    {
      property:
        "specDmg",

      oldValue:
        450,

      newValue:
        600
    },

    {
      property:
        "offense",

      oldValue:
        225,

      newValue:
        300
    }
  ];


  let changed =
    false;


  for (
    const item
    of changes
  ) {
    const result =
      replaceNumericObjectProperty(
        source,
        item.property,
        item.oldValue,
        item.newValue
      );


    source =
      result.source;


    changed =
      changed ||
      result.changed;
  }


  if (
    changed
  ) {
    await writeAtomic(
      WORKER_FILE,
      source
    );


    console.log(
      `Updated ${WORKER_FILE} stat-weight constants`
    );
  } else {
    console.log(
      `${WORKER_FILE} stat-weight constants already synchronized`
    );
  }
}


// ============================================================================
// PACKAGE.JSON
// ============================================================================

async function patchPackageJson() {
  const packageJson =
    JSON.parse(
      await fs.readFile(
        PACKAGE_FILE,
        "utf8"
      )
    );


  packageJson.scripts ??=
    {};


  packageJson.scripts[
    "meta:compile-targets"
  ] =
    "node scripts/compileMetaProfiles.mjs";


  packageJson.scripts[
    "meta:compile-ranking"
  ] =
    "node scripts/compileMetaSpeedRanking.mjs";


  packageJson.scripts[
    "meta:compile"
  ] =
    "npm run meta:compile-targets && npm run meta:compile-ranking";


  packageJson.scripts[
    "meta:integrate"
  ] =
    "node scripts/applyMetaIntegration.mjs";


  packageJson.scripts[
    "meta:update"
  ] =
    "npm run meta:compile && npm run meta:integrate";


  await writeAtomic(
    PACKAGE_FILE,

    JSON.stringify(
      packageJson,
      null,
      2
    ) + "\n"
  );


  console.log(
    `Updated ${PACKAGE_FILE}`
  );
}


// ============================================================================
// SANITY CHECK
// ============================================================================

async function sanityCheckGeneratedMeta() {
  const generated =
    JSON.parse(
      await fs.readFile(
        GENERATED_META_FILE,
        "utf8"
      )
    );


  const characters =
    generated.characters ??
    {};


  const entries =
    Object.entries(
      characters
    );


  console.log(
    ""
  );


  console.log(
    `Generated meta characters: ${entries.length}`
  );


  if (
    !entries.length
  ) {
    console.warn(
      "WARNING: generatedMetaTargets.json has no characters."
    );


    return;
  }


  const hunter =
    characters.BADBATCHHUNTER;


  if (
    hunter
  ) {
    console.log(
      ""
    );


    console.log(
      "Hunter generated-meta sanity check:"
    );


    if (
      Array.isArray(
        hunter.targets
      )
    ) {
      for (
        const target
        of hunter.targets
      ) {
        console.log(
          `  ${target.name}`
        );


        console.log(
          `    Speed: ${target.speed}`
        );


        console.log(
          `    Primaries: ${JSON.stringify(target.primaryStatRestrictions || {})}`
        );
      }

    } else if (
      hunter.weights
    ) {
      console.log(
        "  Legacy generated schema detected."
      );


      console.log(
        `  Speed: ${hunter.weights.speed}`
      );


      console.log(
        `  This integration will convert it to Kyber Meta at runtime.`
      );
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
    "Grand Ivory Kyber Meta Integration"
  );


  console.log(
    "=============================================="
  );


  console.log(
    ""
  );


  await ensureGeneratedMetaPlaceholder();


  await sanityCheckGeneratedMeta();


  await patchCharacterSettings();


  await patchCharacterModel();


  await patchStorageActions();


  await patchDataActions();


  await patchWorkerStatWeights();


  await patchPackageJson();


  console.log(
    ""
  );


  console.log(
    "=============================================="
  );


  console.log(
    "Integration complete"
  );


  console.log(
    "=============================================="
  );


  console.log(
    ""
  );


  console.log(
    "Kyber Meta now:"
  );


  console.log(
    "  - appears first in the target dropdown"
  );


  console.log(
    "  - is Character.defaultTarget()"
  );


  console.log(
    "  - overrides stale saved Kyber Meta targets"
  );


  console.log(
    "  - is applied to already-selected characters when profiles load"
  );


  console.log(
    "  - is applied after roster refreshes"
  );


  console.log(
    ""
  );


  console.log(
    "Restart the development server after running this script."
  );
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
      "Meta integration failed:"
    );


    console.error(
      error
    );


    process.exitCode =
      1;
  }
);