#!/usr/bin/env node

/**
 * Build a compact character-priority dataset from metaProfiles.json.
 *
 * Ranking metric:
 *
 *   Average value of the Speed secondary on mods that contain Speed
 *
 * Example:
 *
 *   Character A:
 *     averageSecondarySpeed = 21.4
 *
 *   Character B:
 *     averageSecondarySpeed = 16.7
 *
 * Character A receives higher optimizer priority.
 *
 *
 * Tie breakers:
 *
 *   1. Speed-secondary frequency
 *   2. Character meta sample size
 *
 *
 * Input:
 *
 *   src/constants/metaProfiles.json
 *
 *
 * Output:
 *
 *   src/constants/generatedMetaSpeedRanking.json
 *
 *
 * This keeps the 315,000-line raw dataset out of the browser bundle.
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
  process.env.META_SPEED_RANKING_FILE ??
  "src/constants/generatedMetaSpeedRanking.json";


/**
 * Ignore characters with very small meta samples.
 */
const MIN_SAMPLE_SIZE =
  Number(
    process.env.META_RANK_MIN_SAMPLE_SIZE ??
    100
  );


/**
 * Require enough actual Speed-secondary observations.
 *
 * This prevents a character with a tiny number of Speed mods from ranking
 * highly because of statistical noise.
 */
const MIN_SPEED_OBSERVATIONS =
  Number(
    process.env.META_RANK_MIN_SPEED_OBSERVATIONS ??
    50
  );


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


  const scale =
    10 ** places;


  return (
    Math.round(
      value *
      scale
    ) /
    scale
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
      recursive:
        true
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
// CHARACTER RANKING
// ============================================================================

function getRankingData(
  character
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


  /**
   * SWGOH stat ID 5 = Speed.
   */
  const speed =
    character
      .aggregate
      ?.secondaries
      ?.stats
      ?.[
        "5"
      ];


  if (
    !speed
  ) {
    return null;
  }


  const averageSecondarySpeed =
    Number(
      speed.average
    );


  const speedSecondaryFrequency =
    Number(
      speed.frequency ??
      0
    );


  const speedSecondaryCount =
    Number(
      speed.count ??
      0
    );


  if (
    !Number.isFinite(
      averageSecondarySpeed
    ) ||
    averageSecondarySpeed <=
      0
  ) {
    return null;
  }


  if (
    speedSecondaryCount <
    MIN_SPEED_OBSERVATIONS
  ) {
    return null;
  }


  return {
    baseId:
      character.baseId,

    name:
      character.name,

    averageSecondarySpeed:
      round(
        averageSecondarySpeed,
        4
      ),

    speedSecondaryFrequency:
      round(
        speedSecondaryFrequency,
        6
      ),

    speedSecondaryCount,

    sampleSize,

    relicAverage:
      Number.isFinite(
        Number(
          character.relicAverage
        )
      )
        ? round(
            Number(
              character.relicAverage
            ),
            4
          )
        : null
  };
}


// ============================================================================
// SORT
// ============================================================================

function compareCharacters(
  left,
  right
) {
  /**
   * PRIMARY:
   *
   * Actual average Speed-secondary investment.
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
   * TIE BREAKER:
   *
   * How consistently Speed appears.
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
   * TIE BREAKER:
   *
   * More reliable sample.
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


  return String(
    left.name ??
    left.baseId
  ).localeCompare(
    String(
      right.name ??
      right.baseId
    )
  );
}


// ============================================================================
// MAIN
// ============================================================================

async function main() {
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


  const ranked =
    Object.values(
      rawCharacters
    )
      .map(
        getRankingData
      )
      .filter(
        Boolean
      )
      .sort(
        compareCharacters
      );


  const characters =
    {};


  ranked.forEach(
    (
      character,
      index
    ) => {
      characters[
        character.baseId
      ] = {
        rank:
          index +
          1,

        averageSecondarySpeed:
          character.averageSecondarySpeed,

        speedSecondaryFrequency:
          character.speedSecondaryFrequency,

        speedSecondaryCount:
          character.speedSecondaryCount,

        sampleSize:
          character.sampleSize,

        relicAverage:
          character.relicAverage
      };
    }
  );


  const output = {
    schemaVersion:
      1,

    generatedAt:
      new Date()
        .toISOString(),

    metric: {
      id:
        "average-secondary-speed",

      description:
        "Average observed Speed secondary value among mods containing a Speed secondary.",

      primarySort:
        "averageSecondarySpeed",

      tieBreakers: [
        "speedSecondaryFrequency",
        "sampleSize"
      ],

      minimumCharacterSampleSize:
        MIN_SAMPLE_SIZE,

      minimumSpeedSecondaryObservations:
        MIN_SPEED_OBSERVATIONS
    },

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
        null
    },

    cohort:
      raw.cohort ??
      null,

    globalOrder:
      ranked.map(
        (
          character,
          index
        ) => ({
          rank:
            index +
            1,

          baseId:
            character.baseId,

          name:
            character.name,

          averageSecondarySpeed:
            character.averageSecondarySpeed,

          speedSecondaryFrequency:
            character.speedSecondaryFrequency,

          sampleSize:
            character.sampleSize
        })
      ),

    characters
  };


  await writeJson(
    OUTPUT_FILE,
    output
  );


  console.log(
    ""
  );


  console.log(
    `Ranked characters: ${ranked.length}`
  );


  console.log(
    `Output: ${OUTPUT_FILE}`
  );


  console.log(
    ""
  );


  console.log(
    "Top 25 by average Speed secondary:"
  );


  for (
    const [
      index,
      character
    ]
    of ranked
      .slice(
        0,
        25
      )
      .entries()
  ) {
    console.log(
      `${String(index + 1).padStart(3)}. ` +
      `${String(character.name ?? character.baseId).padEnd(35)} ` +
      `${character.averageSecondarySpeed.toFixed(2)} avg ` +
      `| ${(character.speedSecondaryFrequency * 100).toFixed(1)}% freq ` +
      `| n=${character.sampleSize}`
    );
  }
}


// ============================================================================
// RUN
// ============================================================================

main().catch(
  error => {
    console.error(
      "\nSpeed-ranking compilation failed:"
    );


    console.error(
      error
    );


    process.exitCode =
      1;
  }
);