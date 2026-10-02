#!/usr/bin/env node

/**
 * Install local Kyber Speed-investment character ordering into Grand Ivory.
 *
 * This does NOT replace the existing legacy character-list generator.
 *
 * It adds another mode:
 *
 *   Kyber Mod Investment — Avg Speed Secondary
 *
 *
 * The mode:
 *
 *   1. Uses the roster already loaded into Grand Ivory.
 *   2. Filters by minimum gear level.
 *   3. Looks up each owned character in generatedMetaSpeedRanking.json.
 *   4. Sorts by average Speed-secondary investment.
 *   5. Uses Speed-secondary frequency as a tie breaker.
 *   6. Uses meta sample size as another tie breaker.
 *   7. Uses the player's character GP as the final tie breaker.
 *   8. Selects the generated "Kyber Meta" target when available.
 */

import fs from "node:fs/promises";
import path from "node:path";


// ============================================================================
// FILES
// ============================================================================

const ACTIONS_FILE =
  process.env.CHARACTER_EDIT_ACTIONS_FILE ??
  "src/state/actions/characterEdit.js";


const VIEW_FILE =
  process.env.CHARACTER_EDIT_VIEW_FILE ??
  "src/containers/CharacterEditView/CharacterEditView.js";


const PACKAGE_FILE =
  process.env.PACKAGE_FILE ??
  "package.json";


const RANKING_FILE =
  process.env.META_SPEED_RANKING_FILE ??
  "src/constants/generatedMetaSpeedRanking.json";


// ============================================================================
// MARKERS
// ============================================================================

const ACTION_IMPORT =
  'import generatedMetaSpeedRanking from "../../constants/generatedMetaSpeedRanking.json";';


const ACTION_BEGIN =
  "// BEGIN KYBER META SPEED LIST";


const ACTION_END =
  "// END KYBER META SPEED LIST";


// ============================================================================
// ACTION CODE
// ============================================================================

const ACTION_BLOCK =
`${ACTION_BEGIN}

/**
 * Auto-generate the selected character list using average Speed-secondary
 * investment from the Kyber Comlink dataset.
 *
 * This intentionally ranks ONLY characters already present in the player's
 * loaded roster.
 *
 * @param overwrite {boolean|string}
 * @param parameters {Object}
 */
export function generateMetaSpeedCharacterList(
  overwrite,
  parameters = {}
) {
  return updateProfile(
    profile => {
      const shouldOverwrite =
        overwrite === true ||
        overwrite === "true";


      const minimumGearLevel =
        Math.max(
          1,

          Number(
            parameters.minimumGearLevel ||
            1
          )
        );


      const requestedMaximum =
        Math.max(
          0,

          Number(
            parameters.top ||
            0
          )
        );


      const startingList =
        shouldOverwrite
          ? []
          : profile.selectedCharacters.slice();


      const alreadySelected =
        new Set(
          startingList.map(
            ({ id }) =>
              id
          )
        );


      const rankedCharacters =
        Object.values(
          profile.characters
        )
          .map(
            character => {
              const ranking =
                generatedMetaSpeedRanking
                  .characters
                  ?.[
                    character.baseID
                  ];


              if (
                !ranking
              ) {
                return null;
              }


              return {
                character,

                averageSecondarySpeed:
                  Number(
                    ranking.averageSecondarySpeed
                  ),

                speedSecondaryFrequency:
                  Number(
                    ranking.speedSecondaryFrequency ||
                    0
                  ),

                sampleSize:
                  Number(
                    ranking.sampleSize ||
                    0
                  ),

                globalRank:
                  Number(
                    ranking.rank ||
                    999999
                  )
              };
            }
          )
          .filter(
            Boolean
          )
          .filter(
            ({
              character
            }) =>
              Number(
                character
                  .playerValues
                  .level ||
                0
              ) >=
              50
          )
          .filter(
            ({
              character
            }) =>
              Number(
                character
                  .playerValues
                  .gearLevel ||
                0
              ) >=
              minimumGearLevel
          )
          .filter(
            ({
              averageSecondarySpeed
            }) =>
              Number.isFinite(
                averageSecondarySpeed
              ) &&
              averageSecondarySpeed >
                0
          )
          .filter(
            ({
              character
            }) =>
              !alreadySelected.has(
                character.baseID
              )
          )
          .sort(
            (
              left,
              right
            ) => {
              /**
               * PRIMARY:
               *
               * Average Speed secondary.
               */
              if (
                right.averageSecondarySpeed !==
                left.averageSecondarySpeed
              ) {
                return (
                  right.averageSecondarySpeed -
                  left.averageSecondarySpeed
                );
              }


              /**
               * First tie breaker:
               *
               * Speed-secondary frequency.
               */
              if (
                right.speedSecondaryFrequency !==
                left.speedSecondaryFrequency
              ) {
                return (
                  right.speedSecondaryFrequency -
                  left.speedSecondaryFrequency
                );
              }


              /**
               * Second tie breaker:
               *
               * Meta sample size.
               */
              if (
                right.sampleSize !==
                left.sampleSize
              ) {
                return (
                  right.sampleSize -
                  left.sampleSize
                );
              }


              /**
               * Final tie breaker:
               *
               * Strength of this character on the player's own roster.
               */
              const leftGp =
                Number(
                  left
                    .character
                    .playerValues
                    .galacticPower ||
                  0
                );


              const rightGp =
                Number(
                  right
                    .character
                    .playerValues
                    .galacticPower ||
                  0
                );


              return (
                rightGp -
                leftGp
              );
            }
          );


      const limitedCharacters =
        requestedMaximum >
        0
          ? rankedCharacters.slice(
              0,
              requestedMaximum
            )
          : rankedCharacters;


      const generatedList =
        limitedCharacters.map(
          ({
            character
          }) => {
            /**
             * Prefer our generated empirical target.
             *
             * Fall back to whatever Grand Ivory considers the default target.
             */
            const kyberMetaTarget =
              character
                .targets()
                .find(
                  target =>
                    target.name ===
                    "Kyber Meta"
                );


            return {
              id:
                character.baseID,

              target:
                kyberMetaTarget ||
                character.defaultTarget()
            };
          }
        );


      return profile.withSelectedCharacters(
        startingList.concat(
          generatedList
        )
      );
    }
  );
}

${ACTION_END}`;


// ============================================================================
// HELPERS
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
// PLACEHOLDER RANKING FILE
// ============================================================================

async function ensureRankingPlaceholder() {
  if (
    await fileExists(
      RANKING_FILE
    )
  ) {
    return;
  }


  await writeAtomic(
    RANKING_FILE,

    JSON.stringify(
      {
        schemaVersion:
          1,

        generatedAt:
          null,

        metric: {
          id:
            "average-secondary-speed"
        },

        characters:
          {},

        globalOrder:
          []
      },

      null,
      2
    ) + "\n"
  );


  console.log(
    `Created placeholder ${RANKING_FILE}`
  );
}


// ============================================================================
// CHARACTER EDIT ACTIONS
// ============================================================================

function removeExistingActionBlock(
  source
) {
  const start =
    source.indexOf(
      ACTION_BEGIN
    );


  if (
    start ===
    -1
  ) {
    return source;
  }


  const end =
    source.indexOf(
      ACTION_END,
      start
    );


  if (
    end ===
    -1
  ) {
    throw new Error(
      `${ACTION_BEGIN} exists but ${ACTION_END} does not.`
    );
  }


  return (
    source.slice(
      0,
      start
    ) +

    source.slice(
      end +
      ACTION_END.length
    )
  );
}


function ensureActionImport(
  source
) {
  if (
    source.includes(
      ACTION_IMPORT
    )
  ) {
    return source;
  }


  const anchor =
    'import OptimizationPlan from "../../domain/OptimizationPlan";';


  if (
    !source.includes(
      anchor
    )
  ) {
    throw new Error(
      `Could not find import anchor in ${ACTIONS_FILE}.`
    );
  }


  return source.replace(
    anchor,

    `${anchor}
${ACTION_IMPORT}`
  );
}


function installActionBlock(
  source
) {
  const anchor =
    "export function lockSelectedCharacters() {";


  const index =
    source.indexOf(
      anchor
    );


  if (
    index ===
    -1
  ) {
    throw new Error(
      `Could not find lockSelectedCharacters() in ${ACTIONS_FILE}.`
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

    ACTION_BLOCK +

    "\n\n" +

    source.slice(
      index
    )
  );
}


async function patchActionsFile() {
  let source =
    await fs.readFile(
      ACTIONS_FILE,
      "utf8"
    );


  source =
    removeExistingActionBlock(
      source
    );


  source =
    ensureActionImport(
      source
    );


  source =
    installActionBlock(
      source
    );


  if (
    !source.endsWith(
      "\n"
    )
  ) {
    source +=
      "\n";
  }


  await writeAtomic(
    ACTIONS_FILE,
    source
  );


  console.log(
    `Updated ${ACTIONS_FILE}`
  );
}


// ============================================================================
// CHARACTER EDIT VIEW — IMPORT
// ============================================================================

function ensureViewActionImport(
  source
) {
  if (
    source.includes(
      "generateMetaSpeedCharacterList,"
    )
  ) {
    return source;
  }


  const expression =
    /(\s+setOptimizeIndex,\s*\n)(\} from "\.\.\/\.\.\/state\/actions\/characterEdit";)/;


  if (
    !expression.test(
      source
    )
  ) {
    throw new Error(
      `Could not find characterEdit action import block in ${VIEW_FILE}.`
    );
  }


  return source.replace(
    expression,

    (
      match,
      before,
      after
    ) =>
      `${before}  generateMetaSpeedCharacterList,\n${after}`
  );
}


// ============================================================================
// CHARACTER EDIT VIEW — MODE OPTION
// ============================================================================

function installSpeedModeOption(
  source
) {
  if (
    source.includes(
      'value={"meta-speed"}'
    )
  ) {
    return source;
  }


  const anchor =
    '<Dropdown id={"use-case"} name={"use-case"}>';


  if (
    !source.includes(
      anchor
    )
  ) {
    throw new Error(
      `Could not find use-case dropdown in ${VIEW_FILE}.`
    );
  }


  return source.replace(
    anchor,

`${anchor}
            <option value={"meta-speed"}>
              Kyber Mod Investment — Avg Speed Secondary
            </option>`
  );
}


// ============================================================================
// CHARACTER EDIT VIEW — DESCRIPTION
// ============================================================================

function updateGeneratorDescription(
  source
) {
  const marker =
    "Kyber Mod Investment mode uses your local Comlink meta dataset";


  if (
    source.includes(
      marker
    )
  ) {
    return source;
  }


  const anchor =
`        <p>
          <span className={"purple"}>Note:</span> unless you specify otherwise
          in "Advanced Settings" below, your current arena team will not be
          placed at the top of the list.
        </p>`;


  if (
    !source.includes(
      anchor
    )
  ) {
    console.warn(
      "Could not find generator-description insertion point; skipping explanatory text."
    );


    return source;
  }


  const addition =
`${anchor}
        <p>
          <span className={"gold"}>
            Kyber Mod Investment mode uses your local Comlink meta dataset.
          </span>{" "}
          Characters you own are ordered by the average Speed secondary that
          Kyber players put on that character. Speed-secondary frequency and
          sample size are only used as tie breakers.
        </p>`;


  return source.replace(
    anchor,
    addition
  );
}


// ============================================================================
// CHARACTER EDIT VIEW — DISPATCH
// ============================================================================

function installGenerateDispatch(
  source
) {
  if (
    source.includes(
      'if (mode === "meta-speed")'
    )
  ) {
    return source;
  }


  const expression =
/  generateCharacterList: \(mode, behavior, allyCode, parameters\) => \{\s*dispatch\(fetchCharacterList\(mode, behavior, allyCode, parameters\)\);\s*dispatch\(hideModal\(\)\);\s*\},/;


  if (
    !expression.test(
      source
    )
  ) {
    throw new Error(
      `Could not find generateCharacterList dispatcher in ${VIEW_FILE}.`
    );
  }


  const replacement =
`  generateCharacterList: (mode, behavior, allyCode, parameters) => {
    if (mode === "meta-speed") {
      dispatch(
        generateMetaSpeedCharacterList(
          behavior,
          parameters
        )
      );
    } else {
      dispatch(
        fetchCharacterList(
          mode,
          behavior,
          allyCode,
          parameters
        )
      );
    }

    dispatch(hideModal());
  },`;


  return source.replace(
    expression,
    replacement
  );
}


async function patchViewFile() {
  let source =
    await fs.readFile(
      VIEW_FILE,
      "utf8"
    );


  source =
    ensureViewActionImport(
      source
    );


  source =
    installSpeedModeOption(
      source
    );


  source =
    updateGeneratorDescription(
      source
    );


  source =
    installGenerateDispatch(
      source
    );


  await writeAtomic(
    VIEW_FILE,
    source
  );


  console.log(
    `Updated ${VIEW_FILE}`
  );
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


  /**
   * Preserve the raw target compiler as its own explicit command.
   */
  packageJson.scripts[
    "meta:compile-targets"
  ] =
    "node scripts/compileMetaProfiles.mjs";


  packageJson.scripts[
    "meta:compile-ranking"
  ] =
    "node scripts/compileMetaSpeedRanking.mjs";


  /**
   * Compile both compact runtime datasets.
   */
  packageJson.scripts[
    "meta:compile"
  ] =
    "npm run meta:compile-targets && npm run meta:compile-ranking";


  packageJson.scripts[
    "meta:speed-integrate"
  ] =
    "node scripts/applyMetaSpeedOrdering.mjs";


  /**
   * Full update after regenerating metaProfiles.json.
   */
  packageJson.scripts[
    "meta:update"
  ] =
    "npm run meta:compile && npm run meta:integrate && npm run meta:speed-integrate";


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
    "Installing Kyber Speed Priority Generator"
  );


  console.log(
    "=============================================="
  );


  console.log(
    ""
  );


  await ensureRankingPlaceholder();


  await patchActionsFile();


  await patchViewFile();


  await patchPackageJson();


  console.log(
    ""
  );


  console.log(
    "Kyber Speed Priority generator installed."
  );


  console.log(
    ""
  );


  console.log(
    "Now run:"
  );


  console.log(
    "  npm run meta:compile"
  );


  console.log(
    "  npm start"
  );
}


// ============================================================================
// RUN
// ============================================================================

main().catch(
  error => {
    console.error(
      "\nSpeed-priority integration failed:"
    );


    console.error(
      error
    );


    process.exitCode =
      1;
  }
);