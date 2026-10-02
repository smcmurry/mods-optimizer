#!/usr/bin/env node

/**
 * Grand Ivory - Comlink-only Meta Profile Builder
 *
 * Data flow:
 *
 *   Comlink /metadata
 *        ↓
 *   Comlink /localization + /data
 *        ↓
 *   characters + mod definitions
 *
 *   Comlink /getGuilds
 *        ↓
 *   670M+ guilds
 *        ↓
 *   Comlink /guild
 *        ↓
 *   member player IDs
 *        ↓
 *   Comlink /player
 *        ↓
 *   inspect playerRating
 *        ↓
 *   keep Kyber players only
 *        ↓
 *   rosterUnit[].equippedStatMod[]
 *        ↓
 *   metaProfiles.json
 *
 *
 * Node 18+
 *
 * --------------------------------------------------------------------------
 * PowerShell - small test
 * --------------------------------------------------------------------------
 *
 * $env:COMLINK_ACCESS_KEY="YOUR_ACCESS_KEY"
 * $env:COMLINK_SECRET_KEY="YOUR_SECRET_KEY"
 *
 * $env:GUILD_SEARCH_COUNT="20"
 * $env:PLAYER_LIMIT="100"
 * $env:ONLY="BADBATCHHUNTER"
 * $env:RESET="1"
 *
 * node scripts/buildMetaProfiles.mjs
 *
 *
 * --------------------------------------------------------------------------
 * PowerShell - full run
 * --------------------------------------------------------------------------
 *
 * Remove-Item Env:ONLY -ErrorAction SilentlyContinue
 * Remove-Item Env:PLAYER_LIMIT -ErrorAction SilentlyContinue
 *
 * $env:GUILD_SEARCH_COUNT="500"
 * $env:RESET="1"
 *
 * node scripts/buildMetaProfiles.mjs
 *
 *
 * --------------------------------------------------------------------------
 * Defaults
 * --------------------------------------------------------------------------
 *
 * MIN_GUILD_GP       = 670,000,000
 * MAX_GUILD_GP       = 1,500,000,000
 * MIN_GUILD_MEMBERS  = 45
 * MAX_GUILD_MEMBERS  = 50
 * REQUIRE_KYBER      = true
 *
 *
 * --------------------------------------------------------------------------
 * Output
 * --------------------------------------------------------------------------
 *
 * src/constants/metaProfiles.json
 *
 * Checkpoint:
 *
 * data/metaProfiles.comlink.partial.json
 */

import fs from "node:fs/promises";
import path from "node:path";

import {
  createHash,
  createHmac
} from "node:crypto";


// ============================================================================
// CONFIGURATION
// ============================================================================

const SCHEMA_VERSION =
  4;


const COMLINK_URL =
  (
    process.env.COMLINK_URL ??
    "http://localhost:3000"
  ).replace(
    /\/+$/,
    ""
  );


const COMLINK_ACCESS_KEY =
  process.env.COMLINK_ACCESS_KEY ??
  process.env.ACCESS_KEY ??
  null;


const COMLINK_SECRET_KEY =
  process.env.COMLINK_SECRET_KEY ??
  process.env.SECRET_KEY ??
  null;


if (
  Boolean(
    COMLINK_ACCESS_KEY
  ) !==
  Boolean(
    COMLINK_SECRET_KEY
  )
) {
  throw new Error(
    "Comlink HMAC requires both COMLINK_ACCESS_KEY and COMLINK_SECRET_KEY."
  );
}


const OUTPUT_FILE =
  process.env.OUTPUT_FILE ??
  "src/constants/metaProfiles.json";


const CHECKPOINT_FILE =
  process.env.CHECKPOINT_FILE ??
  "data/metaProfiles.comlink.partial.json";


const MAX_RETRIES =
  Number(
    process.env.MAX_RETRIES ??
    5
  );


const REQUEST_TIMEOUT_MS =
  Number(
    process.env.REQUEST_TIMEOUT_MS ??
    120_000
  );


const REQUEST_DELAY_MS =
  Number(
    process.env.REQUEST_DELAY_MS ??
    100
  );


const CHECKPOINT_EVERY =
  Number(
    process.env.CHECKPOINT_EVERY ??
    1
  );


const RESET =
  process.env.RESET ===
  "1";


const RETRY_FAILED =
  process.env.RETRY_FAILED ===
  "1";


const PLAYER_LIMIT =
  Number(
    process.env.PLAYER_LIMIT ??
    0
  );


/**
 * Set REQUIRE_KYBER=0 to aggregate every discovered player.
 *
 * Default:
 *
 * REQUIRE_KYBER=true
 */
const REQUIRE_KYBER =
  process.env.REQUIRE_KYBER !==
  "0";


const ONLY =
  process.env.ONLY
    ? new Set(
        process.env.ONLY
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
      )
    : null;


// ============================================================================
// GUILD COHORT CONFIGURATION
// ============================================================================

const GUILD_SEARCH_COUNT =
  Number(
    process.env.GUILD_SEARCH_COUNT ??
    500
  );


/**
 * Changed from 400M to 670M.
 */
const MIN_GUILD_GP =
  Number(
    process.env.MIN_GUILD_GP ??
    670_000_000
  );


const MAX_GUILD_GP =
  Number(
    process.env.MAX_GUILD_GP ??
    1_500_000_000
  );


const MIN_GUILD_MEMBERS =
  Number(
    process.env.MIN_GUILD_MEMBERS ??
    45
  );


const MAX_GUILD_MEMBERS =
  Number(
    process.env.MAX_GUILD_MEMBERS ??
    50
  );


// ============================================================================
// MOD SET DEFINITIONS
// ============================================================================

const MOD_SET_DEFINITIONS =
  Object.freeze({
    1: {
      id: 1,
      key: "health",
      name: "Health",
      requiredMods: 2
    },

    2: {
      id: 2,
      key: "offense",
      name: "Offense",
      requiredMods: 4
    },

    3: {
      id: 3,
      key: "defense",
      name: "Defense",
      requiredMods: 2
    },

    4: {
      id: 4,
      key: "speed",
      name: "Speed",
      requiredMods: 4
    },

    5: {
      id: 5,
      key: "critChance",
      name: "Critical Chance",
      requiredMods: 2
    },

    6: {
      id: 6,
      key: "critDamage",
      name: "Critical Damage",
      requiredMods: 4
    },

    7: {
      id: 7,
      key: "potency",
      name: "Potency",
      requiredMods: 2
    },

    8: {
      id: 8,
      key: "tenacity",
      name: "Tenacity",
      requiredMods: 2
    }
  });


// ============================================================================
// MOD SLOT DEFINITIONS
// ============================================================================

const MOD_SLOTS =
  Object.freeze({
    2: "square",
    3: "arrow",
    4: "diamond",
    5: "triangle",
    6: "circle",
    7: "cross"
  });


const FLEXIBLE_PRIMARY_SLOTS =
  new Set([
    3,
    5,
    6,
    7
  ]);


// ============================================================================
// MOD STAT DEFINITIONS
// ============================================================================

const MOD_STAT_DEFINITIONS =
  Object.freeze({
    1: {
      statId: 1,
      key: "healthFlat",
      name: "Health",
      isPercent: false
    },

    5: {
      statId: 5,
      key: "speed",
      name: "Speed",
      isPercent: false
    },

    16: {
      statId: 16,
      key: "critDamage",
      name: "Critical Damage",
      isPercent: true
    },

    17: {
      statId: 17,
      key: "potency",
      name: "Potency",
      isPercent: true
    },

    18: {
      statId: 18,
      key: "tenacity",
      name: "Tenacity",
      isPercent: true
    },

    28: {
      statId: 28,
      key: "protectionFlat",
      name: "Protection",
      isPercent: false
    },

    41: {
      statId: 41,
      key: "offenseFlat",
      name: "Offense",
      isPercent: false
    },

    42: {
      statId: 42,
      key: "defenseFlat",
      name: "Defense",
      isPercent: false
    },

    48: {
      statId: 48,
      key: "offensePercent",
      name: "Offense %",
      isPercent: true
    },

    49: {
      statId: 49,
      key: "defensePercent",
      name: "Defense %",
      isPercent: true
    },

    52: {
      statId: 52,
      key: "accuracy",
      name: "Accuracy",
      isPercent: true
    },

    53: {
      statId: 53,
      key: "critChance",
      name: "Critical Chance",
      isPercent: true
    },

    54: {
      statId: 54,
      key: "critAvoid",
      name: "Critical Avoidance",
      isPercent: true
    },

    55: {
      statId: 55,
      key: "healthPercent",
      name: "Health %",
      isPercent: true
    },

    56: {
      statId: 56,
      key: "protectionPercent",
      name: "Protection %",
      isPercent: true
    }
  });


// ============================================================================
// GENERAL UTILITIES
// ============================================================================

function sleep(
  milliseconds
) {
  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        milliseconds
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


async function ensureDirectoryForFile(
  filename
) {
  await fs.mkdir(
    path.dirname(
      filename
    ),
    {
      recursive: true
    }
  );
}


async function writeJsonAtomic(
  filename,
  object
) {
  await ensureDirectoryForFile(
    filename
  );


  const temporary =
    `${filename}.tmp`;


  await fs.writeFile(
    filename,

    JSON.stringify(
      object,
      null,
      2
    ) + "\n",

    "utf8"
  );
}


// ============================================================================
// FETCH WITH TIMEOUT
// ============================================================================

async function fetchWithTimeout(
  url,
  options = {},
  timeoutMs =
    REQUEST_TIMEOUT_MS
) {
  const controller =
    new AbortController();


  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      timeoutMs
    );


  try {
    return await fetch(
      url,
      {
        ...options,

        signal:
          controller.signal
      }
    );
  } finally {
    clearTimeout(
      timeout
    );
  }
}


// ============================================================================
// COMLINK HMAC
// ============================================================================

function buildComlinkHeaders(
  method,
  endpoint,
  bodyString
) {
  const headers = {
    "Content-Type":
      "application/json",

    Accept:
      "application/json"
  };


  if (
    !COMLINK_ACCESS_KEY ||
    !COMLINK_SECRET_KEY
  ) {
    return headers;
  }


  const timestamp =
    String(
      Date.now()
    );


  const payloadMd5 =
    createHash(
      "md5"
    )
      .update(
        bodyString,
        "utf8"
      )
      .digest(
        "hex"
      );


  const signature =
    createHmac(
      "sha256",
      COMLINK_SECRET_KEY
    )
      .update(
        timestamp
      )
      .update(
        method.toUpperCase()
      )
      .update(
        `/${endpoint}`
      )
      .update(
        payloadMd5
      )
      .digest(
        "hex"
      );


  headers["X-Date"] =
    timestamp;


  headers.Authorization =
    `HMAC-SHA256 Credential=${COMLINK_ACCESS_KEY},Signature=${signature}`;


  return headers;
}


// ============================================================================
// COMLINK REQUEST
// ============================================================================

async function postComlink(
  endpoint,
  body,
  timeoutMs =
    REQUEST_TIMEOUT_MS
) {
  const cleanEndpoint =
    endpoint.replace(
      /^\/+/,
      ""
    );


  const url =
    `${COMLINK_URL}/${cleanEndpoint}`;


  let lastError;


  for (
    let attempt = 0;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    try {
      const bodyString =
        JSON.stringify(
          body
        );


      const response =
        await fetchWithTimeout(
          url,
          {
            method:
              "POST",

            headers:
              buildComlinkHeaders(
                "POST",
                cleanEndpoint,
                bodyString
              ),

            body:
              bodyString
          },
          timeoutMs
        );


      if (
        response.ok
      ) {
        return await response.json();
      }


      const text =
        await response.text();


      const error =
        new Error(
          `Comlink HTTP ${response.status}: ${url}\n` +
          text.slice(
            0,
            1000
          )
        );


      error.status =
        response.status;


      if (
        [
          400,
          401,
          403,
          404
        ].includes(
          response.status
        )
      ) {
        throw error;
      }


      lastError =
        error;

    } catch (error) {
      lastError =
        error;


      if (
        [
          400,
          401,
          403,
          404
        ].includes(
          error?.status
        )
      ) {
        throw error;
      }
    }


    if (
      attempt ===
      MAX_RETRIES
    ) {
      break;
    }


    const delay =
      1000 *
      2 ** attempt;


    console.warn(
      `Comlink request failed; retrying in ${delay}ms`
    );


    await sleep(
      delay
    );
  }


  throw lastError;
}


// ============================================================================
// METADATA
// ============================================================================

async function getMetadata() {
  console.log(
    "Fetching Comlink metadata..."
  );


  const metadata =
    await postComlink(
      "metadata",
      {}
    );


  const gameDataVersion =
    metadata.latestGamedataVersion;


  const localizationVersion =
    metadata.latestLocalizationBundleVersion;


  if (
    !gameDataVersion
  ) {
    throw new Error(
      "latestGamedataVersion missing from Comlink metadata."
    );
  }


  if (
    !localizationVersion
  ) {
    throw new Error(
      "latestLocalizationBundleVersion missing from Comlink metadata."
    );
  }


  return {
    gameDataVersion:
      String(
        gameDataVersion
      ),

    localizationVersion:
      String(
        localizationVersion
      )
  };
}


// ============================================================================
// LOCALIZATION
// ============================================================================

async function getLocalization(
  localizationVersion
) {
  console.log(
    "Fetching English localization..."
  );


  const response =
    await postComlink(
      "localization",
      {
        unzip:
          true,

        enums:
          false,

        payload: {
          id:
            `${localizationVersion}:ENG_US`
        }
      },
      300_000
    );


  let text =
    response[
      "Loc_ENG_US.txt"
    ];


  if (
    !text &&
    response.localizationBundle
  ) {
    text =
      response
        .localizationBundle[
          "Loc_ENG_US.txt"
        ];
  }


  if (
    typeof text !==
    "string"
  ) {
    throw new Error(
      "Loc_ENG_US.txt was not present in localization response."
    );
  }


  const result =
    new Map();


  for (
    const line
    of text.split(
      /\r?\n/
    )
  ) {
    if (
      !line ||
      line.startsWith(
        "#"
      )
    ) {
      continue;
    }


    const separator =
      line.indexOf(
        "|"
      );


    if (
      separator <
      0
    ) {
      continue;
    }


    const key =
      line
        .slice(
          0,
          separator
        )
        .trim();


    const value =
      line
        .slice(
          separator +
          1
        )
        .trim();


    if (
      key
    ) {
      result.set(
        key,
        value
      );
    }
  }


  console.log(
    `Localization strings: ${result.size}`
  );


  return result;
}


// ============================================================================
// GAME DATA
// ============================================================================

async function getGameData(
  gameDataVersion
) {
  console.log(
    "Fetching game-data segment 2..."
  );


  const segment2 =
    await postComlink(
      "data",
      {
        payload: {
          version:
            gameDataVersion,

          devicePlatform:
            "Android",

          includePveUnits:
            false,

          requestSegment:
            2
        },

        enums:
          false
      },
      300_000
    );


  console.log(
    "Fetching game-data segment 3..."
  );


  const segment3 =
    await postComlink(
      "data",
      {
        payload: {
          version:
            gameDataVersion,

          devicePlatform:
            "Android",

          includePveUnits:
            false,

          requestSegment:
            3
        },

        enums:
          false
      },
      300_000
    );


  if (
    !Array.isArray(
      segment3.units
    )
  ) {
    throw new Error(
      "Game-data segment 3 did not contain units[]."
    );
  }


  const statMods =
    segment2.statMod ??
    segment2.statModDefinition ??
    [];


  if (
    !Array.isArray(
      statMods
    ) ||
    statMods.length ===
    0
  ) {
    throw new Error(
      "Game-data segment 2 did not contain statMod definitions."
    );
  }


  return {
    units:
      segment3.units,

    statMods
  };
}


// ============================================================================
// CHARACTER DEFINITIONS
// ============================================================================

function isCharacterUnit(
  unit
) {
  if (
    unit.combatType ===
    1
  ) {
    return true;
  }


  const value =
    String(
      unit.combatType ??
      ""
    ).toUpperCase();


  return (
    value ===
      "CHARACTER" ||
    value ===
      "COMBAT_TYPE_CHARACTER"
  );
}


function buildCharacterDefinitions(
  units,
  localization
) {
  const characters =
    new Map();


  for (
    const unit
    of units
  ) {
    if (
      !unit.baseId ||
      !isCharacterUnit(
        unit
      )
    ) {
      continue;
    }


    if (
      unit.obtainable ===
      false
    ) {
      continue;
    }


    if (
      ONLY &&
      !ONLY.has(
        unit.baseId
          .toUpperCase()
      )
    ) {
      continue;
    }


    if (
      characters.has(
        unit.baseId
      )
    ) {
      continue;
    }


    const name =
      localization.get(
        unit.nameKey
      ) ??
      unit.nameKey ??
      unit.baseId;


    characters.set(
      unit.baseId,
      {
        baseId:
          unit.baseId,

        name,

        nameKey:
          unit.nameKey ??
          null,

        thumbnailName:
          unit.thumbnailName ??
          null
      }
    );
  }


  return characters;
}


// ============================================================================
// MOD DEFINITIONS
// ============================================================================

function buildModDefinitionMap(
  statMods
) {
  const result =
    new Map();


  for (
    const definition
    of statMods
  ) {
    if (
      !definition.id
    ) {
      continue;
    }


    result.set(
      String(
        definition.id
      ),
      {
        setId:
          Number(
            definition.setId
          ),

        slot:
          Number(
            definition.slot
          ),

        rarity:
          Number(
            definition.rarity
          )
      }
    );
  }


  return result;
}


function resolveModDefinition(
  mod,
  definitionMap
) {
  if (
    mod.setId &&
    mod.slot
  ) {
    return {
      setId:
        Number(
          mod.setId
        ),

      slot:
        Number(
          mod.slot
        )
    };
  }


  const definitionId =
    String(
      mod.definitionId ??
      ""
    ).split(
      ":"
    )[0];


  const mapped =
    definitionMap.get(
      definitionId
    );


  if (
    mapped
  ) {
    return mapped;
  }


  /**
   * Fallback for standard 3-digit mod definition IDs.
   *
   * Example:
   *
   * 161
   *
   * set    = 1
   * rarity = 6
   * slot   = 1 + 1 = game slot 2
   */
  if (
    /^\d{3}$/.test(
      definitionId
    )
  ) {
    const setId =
      Number(
        definitionId[0]
      );


    const slot =
      Number(
        definitionId[2]
      ) +
      1;


    if (
      MOD_SET_DEFINITIONS[
        setId
      ] &&
      MOD_SLOTS[
        slot
      ]
    ) {
      return {
        setId,
        slot
      };
    }
  }


  return null;
}


// ============================================================================
// GUILD DISCOVERY
// ============================================================================

async function discoverGuilds() {
  console.log(
    "\nSearching for guilds..."
  );


  console.log(
    `  GP range: ${MIN_GUILD_GP.toLocaleString()} - ${MAX_GUILD_GP.toLocaleString()}`
  );


  console.log(
    `  Member range: ${MIN_GUILD_MEMBERS} - ${MAX_GUILD_MEMBERS}`
  );


  console.log(
    `  Requested guilds: ${GUILD_SEARCH_COUNT}`
  );


  const response =
    await postComlink(
      "getGuilds",
      {
        payload: {
          searchCriteria: {
            minMemberCount:
              MIN_GUILD_MEMBERS,

            maxMemberCount:
              MAX_GUILD_MEMBERS,

            includeInviteOnly:
              true,

            minGuildGalacticPower:
              MIN_GUILD_GP,

            maxGuildGalacticPower:
              MAX_GUILD_GP,

            recentTbParticipatedIn:
              []
          },

          filterType:
            5,

          startIndex:
            0,

          count:
            GUILD_SEARCH_COUNT
        },

        enums:
          false
      }
    );


  const guilds =
    response.guild ??
    response.guilds ??
    [];


  if (
    !Array.isArray(
      guilds
    )
  ) {
    throw new Error(
      "getGuilds response did not contain guild[]."
    );
  }


  console.log(
    `Guilds discovered: ${guilds.length}`
  );


  return guilds;
}


// ============================================================================
// GUILD FETCHING
// ============================================================================

function getGuildId(
  guild
) {
  return (
    guild.id ??
    guild.guildId ??
    guild.profile?.id ??
    guild.profile?.guildId ??
    null
  );
}


function getGuildName(
  guild
) {
  return (
    guild.name ??
    guild.profile?.name ??
    null
  );
}


function extractGuildMembers(
  guild
) {
  if (
    Array.isArray(
      guild.member
    )
  ) {
    return guild.member;
  }


  if (
    Array.isArray(
      guild.members
    )
  ) {
    return guild.members;
  }


  if (
    Array.isArray(
      guild.guildMember
    )
  ) {
    return guild.guildMember;
  }


  if (
    Array.isArray(
      guild.profile?.member
    )
  ) {
    return guild.profile.member;
  }


  return [];
}


async function fetchGuild(
  guildId
) {
  const response =
    await postComlink(
      "guild",
      {
        payload: {
          guildId:
            String(
              guildId
            ),

          includeRecentGuildActivityInfo:
            false
        },

        enums:
          false
      }
    );


  return (
    response.guild ??
    response
  );
}


// ============================================================================
// PLAYER DISCOVERY
// ============================================================================

function normalizeGuildMember(
  member,
  guildId,
  guildName
) {
  const playerId =
    member.playerId ??
    member.id ??
    null;


  const allyCode =
    member.allyCode ??
    null;


  if (
    !playerId &&
    !allyCode
  ) {
    return null;
  }


  const key =
    playerId
      ? `player:${playerId}`
      : `ally:${allyCode}`;


  return {
    key,

    playerId:
      playerId
        ? String(
            playerId
          )
        : null,

    allyCode:
      allyCode
        ? String(
            allyCode
          )
        : null,

    name:
      member.playerName ??
      member.name ??
      null,

    guildId:
      String(
        guildId
      ),

    guildName:
      guildName ??
      null
  };
}


async function discoverPlayersFromGuilds() {
  const guildSummaries =
    await discoverGuilds();


  const players =
    new Map();


  let successfulGuilds =
    0;


  for (
    let index = 0;
    index <
      guildSummaries.length;
    index++
  ) {
    const summary =
      guildSummaries[
        index
      ];


    const guildId =
      getGuildId(
        summary
      );


    const summaryName =
      getGuildName(
        summary
      );


    if (
      !guildId
    ) {
      console.warn(
        `[Guild ${index + 1}/${guildSummaries.length}] No guild ID; skipping.`
      );

      continue;
    }


    console.log(
      `[Guild ${index + 1}/${guildSummaries.length}] ` +
      `${summaryName ?? guildId}`
    );


    try {
      const guild =
        await fetchGuild(
          guildId
        );


      const guildName =
        getGuildName(
          guild
        ) ??
        summaryName;


      const members =
        extractGuildMembers(
          guild
        );


      console.log(
        `  Members: ${members.length}`
      );


      successfulGuilds++;


      for (
        const member
        of members
      ) {
        const reference =
          normalizeGuildMember(
            member,
            guildId,
            guildName
          );


        if (
          !reference
        ) {
          continue;
        }


        if (
          players.has(
            reference.key
          )
        ) {
          continue;
        }


        players.set(
          reference.key,
          reference
        );
      }

    } catch (error) {
      console.warn(
        `  Failed guild ${guildId}: ${error.message}`
      );
    }


    if (
      REQUEST_DELAY_MS >
      0
    ) {
      await sleep(
        REQUEST_DELAY_MS
      );
    }
  }


  let result =
    [
      ...players.values()
    ];


  if (
    PLAYER_LIMIT >
    0
  ) {
    result =
      result.slice(
        0,
        PLAYER_LIMIT
      );
  }


  console.log(
    "\nGuild discovery complete."
  );


  console.log(
    `Successful guilds: ${successfulGuilds}`
  );


  console.log(
    `Unique players discovered: ${result.length}`
  );


  return {
    guildCount:
      successfulGuilds,

    players:
      result
  };
}


// ============================================================================
// PLAYER FETCH
// ============================================================================

async function getPlayer(
  reference
) {
  const payload =
    {};


  if (
    reference.playerId
  ) {
    payload.playerId =
      reference.playerId;
  } else {
    payload.allyCode =
      String(
        reference.allyCode
      ).replace(
        /-/g,
        ""
      );
  }


  return postComlink(
    "player",
    {
      payload,

      enums:
        false
    }
  );
}


// ============================================================================
// GAC RATING / LEAGUE FILTER
// ============================================================================

function normalizeGacLeague(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }


  const numeric =
    Number(
      value
    );


  if (
    Number.isFinite(
      numeric
    )
  ) {
    const mapped =
      {
        20: "CARBONITE",
        40: "BRONZIUM",
        60: "CHROMIUM",
        80: "AURODIUM",
        100: "KYBER"
      }[
        numeric
      ];


    if (
      mapped
    ) {
      return mapped;
    }
  }


  const text =
    String(
      value
    )
      .trim()
      .toUpperCase();


  if (
    text.includes(
      "KYBER"
    )
  ) {
    return "KYBER";
  }


  if (
    text.includes(
      "AURODIUM"
    )
  ) {
    return "AURODIUM";
  }


  if (
    text.includes(
      "CHROMIUM"
    )
  ) {
    return "CHROMIUM";
  }


  if (
    text.includes(
      "BRONZIUM"
    )
  ) {
    return "BRONZIUM";
  }


  if (
    text.includes(
      "CARBONITE"
    )
  ) {
    return "CARBONITE";
  }


  return null;
}


function normalizeGacDivision(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }


  const numeric =
    Number(
      value
    );


  if (
    Number.isFinite(
      numeric
    )
  ) {
    const mapped =
      {
        5: 5,
        10: 4,
        15: 3,
        20: 2,
        25: 1
      }[
        numeric
      ];


    if (
      mapped
    ) {
      return mapped;
    }


    if (
      numeric >= 1 &&
      numeric <= 5
    ) {
      return numeric;
    }
  }


  const text =
    String(
      value
    )
      .trim()
      .toUpperCase();


  const match =
    text.match(
      /([1-5])$/
    );


  if (
    match
  ) {
    return Number(
      match[1]
    );
  }


  return null;
}


function extractPlayerRating(
  player
) {
  const rawPlayerRating =
    player.playerRating;


  const ratings =
    Array.isArray(
      rawPlayerRating
    )
      ? rawPlayerRating
      : rawPlayerRating
        ? [
            rawPlayerRating
          ]
        : [];


  // --------------------------------------------------------------------------
  // Primary source: playerRating
  // --------------------------------------------------------------------------

  for (
    const rating
    of ratings
  ) {
    if (
      !rating ||
      typeof rating !==
        "object"
    ) {
      continue;
    }


    const rankStatus =
      rating.playerRankStatus ??
      rating.rankStatus ??
      rating.rank ??
      {};


    const rawLeague =
      rankStatus.leagueId ??
      rankStatus.league ??
      rating.leagueId ??
      rating.league ??
      rating.currentLeague ??
      null;


    const rawDivision =
      rankStatus.divisionId ??
      rankStatus.division ??
      rating.divisionId ??
      rating.division ??
      rating.currentDivision ??
      null;


    const league =
      normalizeGacLeague(
        rawLeague
      );


    const rawSkillRating =
      rating
        .playerSkillRating
        ?.skillRating ??
      rankStatus
        .playerSkillRating
        ?.skillRating ??
      rankStatus.skillRating ??
      rating.skillRating ??
      null;


    const skillRating =
      Number(
        rawSkillRating
      );


    if (
      league
    ) {
      return {
        source:
          "playerRating",

        league,

        division:
          normalizeGacDivision(
            rawDivision
          ),

        skillRating:
          Number.isFinite(
            skillRating
          )
            ? skillRating
            : null,

        rawLeague,

        rawDivision
      };
    }
  }


  // --------------------------------------------------------------------------
  // Fallback: seasonStatus
  // --------------------------------------------------------------------------

  const seasonStatuses =
    Array.isArray(
      player.seasonStatus
    )
      ? [
          ...player.seasonStatus
        ]
      : [];


  seasonStatuses.sort(
    (a, b) =>
      Number(
        b.endTime ??
        b.endTimeSeconds ??
        0
      ) -
      Number(
        a.endTime ??
        a.endTimeSeconds ??
        0
      )
  );


  for (
    const season
    of seasonStatuses
  ) {
    const rawLeague =
      season.leagueId ??
      season.league ??
      season.playerLeague ??
      null;


    const league =
      normalizeGacLeague(
        rawLeague
      );


    if (
      !league
    ) {
      continue;
    }


    const rawDivision =
      season.divisionId ??
      season.division ??
      null;


    return {
      source:
        "seasonStatus",

      league,

      division:
        normalizeGacDivision(
          rawDivision
        ),

      skillRating:
        null,

      rawLeague,

      rawDivision
    };
  }


  return {
    source:
      null,

    league:
      null,

    division:
      null,

    skillRating:
      null,

    rawLeague:
      null,

    rawDivision:
      null
  };
}


// ============================================================================
// STAT PARSING
// ============================================================================

function getStatId(
  statContainer
) {
  const stat =
    statContainer?.stat ??
    statContainer;


  const value =
    stat?.unitStat ??
    stat?.unitStatId;


  const id =
    Number(
      value
    );


  return Number.isFinite(
    id
  )
    ? id
    : null;
}


function getStatValue(
  statContainer
) {
  const stat =
    statContainer?.stat ??
    statContainer;


  const raw =
    Number(
      stat?.unscaledDecimalValue
    );


  if (
    !Number.isFinite(
      raw
    )
  ) {
    return null;
  }


  return (
    raw /
    100_000_000
  );
}


function getStatDefinition(
  statId
) {
  return (
    MOD_STAT_DEFINITIONS[
      statId
    ] ??
    {
      statId,

      key:
        `stat${statId}`,

      name:
        `Stat ${statId}`,

      isPercent:
        false
    }
  );
}


// ============================================================================
// RELIC LEVEL
// ============================================================================

function getRelicLevel(
  unit
) {
  const tier =
    Number(
      unit.relic?.currentTier ??
      0
    );


  if (
    !Number.isFinite(
      tier
    ) ||
    tier <= 2
  ) {
    return 0;
  }


  return (
    tier -
    2
  );
}


// ============================================================================
// FULL LOADOUT DETECTION
// ============================================================================

function determineLoadout(
  resolvedMods
) {
  const counts =
    new Map();


  for (
    const mod
    of resolvedMods
  ) {
    counts.set(
      mod.setId,

      (
        counts.get(
          mod.setId
        ) ??
        0
      ) +
      1
    );
  }


  const completedSets =
    [];


  let consumedMods =
    0;


  for (
    const [
      setId,
      count
    ]
    of counts
  ) {
    const definition =
      MOD_SET_DEFINITIONS[
        setId
      ];


    if (
      !definition
    ) {
      return null;
    }


    const completedCount =
      Math.floor(
        count /
        definition.requiredMods
      );


    for (
      let i = 0;
      i <
      completedCount;
      i++
    ) {
      completedSets.push(
        setId
      );
    }


    consumedMods +=
      completedCount *
      definition.requiredMods;
  }


  /**
   * Only accept six-mod builds where all six mods form complete sets.
   */
  if (
    consumedMods !==
    6
  ) {
    return null;
  }


  completedSets.sort(
    (a, b) =>
      a - b
  );


  return completedSets.join(
    "-"
  );
}


// ============================================================================
// ACCUMULATORS
// ============================================================================

function createCharacterAccumulator() {
  return {
    unitsSeen:
      0,

    unitsWithSixMods:
      0,

    unitsWithResolvedMods:
      0,

    sampleSize:
      0,

    excluded: {
      notSixMods:
        0,

      unresolvedMods:
        0,

      invalidSlots:
        0,

      incompleteSets:
        0
    },

    loadouts:
      {}
  };
}


function createLoadoutAccumulator() {
  return {
    count:
      0,

    relicSum:
      0,

    relicCount:
      0,

    primaries:
      {},

    secondaries: {
      observedCount:
        0,

      stats:
        {}
    }
  };
}


// ============================================================================
// PRIMARY AGGREGATION
// ============================================================================

function addPrimary(
  accumulator,
  slot,
  statId
) {
  const slotName =
    MOD_SLOTS[
      slot
    ];


  if (
    !slotName
  ) {
    return;
  }


  accumulator
    .primaries[
      slotName
    ] ??=
      {};


  const key =
    String(
      statId
    );


  accumulator
    .primaries[
      slotName
    ][
      key
    ] ??= {
      count:
        0
    };


  accumulator
    .primaries[
      slotName
    ][
      key
    ]
    .count++;
}


// ============================================================================
// SECONDARY AGGREGATION
// ============================================================================

function addSecondary(
  accumulator,
  statId,
  value
) {
  const key =
    String(
      statId
    );


  accumulator
    .secondaries
    .observedCount++;


  accumulator
    .secondaries
    .stats[
      key
    ] ??= {
      count:
        0,

      valueCount:
        0,

      valueSum:
        0
    };


  const bucket =
    accumulator
      .secondaries
      .stats[
        key
      ];


  bucket.count++;


  if (
    Number.isFinite(
      value
    )
  ) {
    bucket.valueCount++;

    bucket.valueSum +=
      value;
  }
}


// ============================================================================
// PROCESS ONE ROSTER UNIT
// ============================================================================

function processRosterUnit(
  unit,
  characterAccumulator,
  modDefinitionMap,
  unresolvedDefinitions
) {
  characterAccumulator
    .unitsSeen++;


  const mods =
    unit.equippedStatMod ??
    [];


  if (
    mods.length !==
    6
  ) {
    characterAccumulator
      .excluded
      .notSixMods++;

    return;
  }


  characterAccumulator
    .unitsWithSixMods++;


  const resolvedMods =
    [];


  for (
    const mod
    of mods
  ) {
    const definition =
      resolveModDefinition(
        mod,
        modDefinitionMap
      );


    if (
      !definition
    ) {
      unresolvedDefinitions.add(
        String(
          mod.definitionId ??
          "unknown"
        )
      );


      characterAccumulator
        .excluded
        .unresolvedMods++;


      return;
    }


    resolvedMods.push({
      raw:
        mod,

      setId:
        definition.setId,

      slot:
        definition.slot
    });
  }


  characterAccumulator
    .unitsWithResolvedMods++;


  // --------------------------------------------------------------------------
  // Validate slots
  // --------------------------------------------------------------------------

  const slots =
    new Set(
      resolvedMods.map(
        mod =>
          mod.slot
      )
    );


  if (
    slots.size !==
      6 ||
    ![
      2,
      3,
      4,
      5,
      6,
      7
    ].every(
      slot =>
        slots.has(
          slot
        )
    )
  ) {
    characterAccumulator
      .excluded
      .invalidSlots++;

    return;
  }


  // --------------------------------------------------------------------------
  // Determine complete set loadout
  // --------------------------------------------------------------------------

  const loadoutId =
    determineLoadout(
      resolvedMods
    );


  if (
    !loadoutId
  ) {
    characterAccumulator
      .excluded
      .incompleteSets++;

    return;
  }


  characterAccumulator
    .sampleSize++;


  characterAccumulator
    .loadouts[
      loadoutId
    ] ??=
      createLoadoutAccumulator();


  const loadout =
    characterAccumulator
      .loadouts[
        loadoutId
      ];


  loadout.count++;


  // --------------------------------------------------------------------------
  // Relic
  // --------------------------------------------------------------------------

  const relicLevel =
    getRelicLevel(
      unit
    );


  loadout.relicSum +=
    relicLevel;


  loadout.relicCount++;


  // --------------------------------------------------------------------------
  // Mods
  // --------------------------------------------------------------------------

  for (
    const resolvedMod
    of resolvedMods
  ) {
    const mod =
      resolvedMod.raw;


    // ------------------------------------------------------------------------
    // Primary
    // ------------------------------------------------------------------------

    if (
      FLEXIBLE_PRIMARY_SLOTS.has(
        resolvedMod.slot
      )
    ) {
      const primaryStatId =
        getStatId(
          mod.primaryStat
        );


      if (
        primaryStatId !==
        null
      ) {
        addPrimary(
          loadout,
          resolvedMod.slot,
          primaryStatId
        );
      }
    }


    // ------------------------------------------------------------------------
    // Secondaries
    // ------------------------------------------------------------------------

    for (
      const secondary
      of mod.secondaryStat ??
      []
    ) {
      const statId =
        getStatId(
          secondary
        );


      if (
        statId ===
        null
      ) {
        continue;
      }


      addSecondary(
        loadout,
        statId,
        getStatValue(
          secondary
        )
      );
    }
  }
}


// ============================================================================
// PROCESS PLAYER ROSTER
// ============================================================================

function processPlayer(
  player,
  characterDefinitions,
  accumulators,
  modDefinitionMap,
  unresolvedDefinitions
) {
  const roster =
    player.rosterUnit ??
    [];


  for (
    const unit
    of roster
  ) {
    const baseId =
      String(
        unit.definitionId ??
        ""
      ).split(
        ":"
      )[0];


    if (
      !characterDefinitions.has(
        baseId
      )
    ) {
      continue;
    }


    accumulators[
      baseId
    ] ??=
      createCharacterAccumulator();


    processRosterUnit(
      unit,

      accumulators[
        baseId
      ],

      modDefinitionMap,

      unresolvedDefinitions
    );
  }
}


// ============================================================================
// MERGE LOADOUT ACCUMULATORS
// ============================================================================

function mergeLoadoutAccumulator(
  target,
  source
) {
  target.count +=
    source.count;


  target.relicSum +=
    source.relicSum;


  target.relicCount +=
    source.relicCount;


  for (
    const [
      slot,
      stats
    ]
    of Object.entries(
      source.primaries
    )
  ) {
    target
      .primaries[
        slot
      ] ??=
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
      target
        .primaries[
          slot
        ][
          statId
        ] ??= {
          count:
            0
        };


      target
        .primaries[
          slot
        ][
          statId
        ]
        .count +=
          stat.count;
    }
  }


  target
    .secondaries
    .observedCount +=
      source
        .secondaries
        .observedCount;


  for (
    const [
      statId,
      stat
    ]
    of Object.entries(
      source
        .secondaries
        .stats
    )
  ) {
    target
      .secondaries
      .stats[
        statId
      ] ??= {
        count:
          0,

        valueCount:
          0,

        valueSum:
          0
      };


    const destination =
      target
        .secondaries
        .stats[
          statId
        ];


    destination.count +=
      stat.count;


    destination.valueCount +=
      stat.valueCount;


    destination.valueSum +=
      stat.valueSum;
  }
}


// ============================================================================
// FINALIZE PRIMARIES
// ============================================================================

function finalizePrimaries(
  primaries
) {
  const output =
    {};


  for (
    const [
      slot,
      stats
    ]
    of Object.entries(
      primaries
    )
  ) {
    const total =
      Object.values(
        stats
      ).reduce(
        (
          sum,
          stat
        ) =>
          sum +
          stat.count,
        0
      );


    const entries =
      Object.entries(
        stats
      )
        .map(
          (
            [
              statId,
              stat
            ]
          ) => {
            const definition =
              getStatDefinition(
                Number(
                  statId
                )
              );


            return {
              statId:
                Number(
                  statId
                ),

              key:
                definition.key,

              name:
                definition.name,

              count:
                stat.count,

              frequency:
                total > 0
                  ? round(
                      stat.count /
                      total
                    )
                  : null
            };
          }
        )
        .sort(
          (a, b) =>
            b.count -
            a.count
        );


    output[
      slot
    ] = {
      total,

      bestStatId:
        entries[0]?.statId ??
        null,

      bestStatName:
        entries[0]?.name ??
        null,

      bestFrequency:
        entries[0]?.frequency ??
        null,

      stats:
        Object.fromEntries(
          entries.map(
            entry => [
              String(
                entry.statId
              ),

              entry
            ]
          )
        )
    };
  }


  return output;
}


// ============================================================================
// FINALIZE SECONDARIES
// ============================================================================

function formatAverage(
  statId,
  value
) {
  if (
    value ===
    null
  ) {
    return null;
  }


  const definition =
    getStatDefinition(
      Number(
        statId
      )
    );


  if (
    definition.isPercent
  ) {
    return (
      `${round(
        value *
        100,
        2
      )}%`
    );
  }


  return round(
    value,
    2
  );
}


function finalizeSecondaries(
  secondaries,
  sampleCount
) {
  const result =
    {};


  for (
    const [
      statId,
      bucket
    ]
    of Object.entries(
      secondaries.stats
    )
  ) {
    const definition =
      getStatDefinition(
        Number(
          statId
        )
      );


    const average =
      bucket.valueCount >
      0
        ? (
            bucket.valueSum /
            bucket.valueCount
          )
        : null;


    result[
      statId
    ] = {
      statId:
        Number(
          statId
        ),

      key:
        definition.key,

      name:
        definition.name,

      isPercent:
        definition.isPercent,

      count:
        bucket.count,

      frequency:
        secondaries
          .observedCount >
        0
          ? round(
              bucket.count /
              secondaries.observedCount
            )
          : null,

      average:
        average !==
        null
          ? round(
              average,
              8
            )
          : null,

      displayAverage:
        formatAverage(
          statId,
          average
        )
    };
  }


  const possibleCount =
    sampleCount *
    6 *
    4;


  return {
    observedCount:
      secondaries.observedCount,

    possibleCount,

    coverage:
      possibleCount >
      0
        ? round(
            secondaries.observedCount /
            possibleCount
          )
        : null,

    stats:
      Object.fromEntries(
        Object.entries(
          result
        ).sort(
          (
            [, a],
            [, b]
          ) =>
            b.count -
            a.count
        )
      )
  };
}


// ============================================================================
// FINALIZE LOADOUT
// ============================================================================

function finalizeLoadout(
  id,
  accumulator,
  totalSamples
) {
  const setIds =
    id
      .split("-")
      .map(
        Number
      );


  return {
    id,

    setIds,

    sets:
      setIds.map(
        setId =>
          MOD_SET_DEFINITIONS[
            setId
          ]?.key ??
          `set${setId}`
      ),

    count:
      accumulator.count,

    share:
      totalSamples >
      0
        ? round(
            accumulator.count /
            totalSamples
          )
        : null,

    relicAverage:
      accumulator.relicCount >
      0
        ? round(
            accumulator.relicSum /
            accumulator.relicCount,
            4
          )
        : null,

    primaries:
      finalizePrimaries(
        accumulator.primaries
      ),

    secondaries:
      finalizeSecondaries(
        accumulator.secondaries,
        accumulator.count
      )
  };
}


// ============================================================================
// FINALIZE CHARACTER
// ============================================================================

function finalizeCharacter(
  definition,
  accumulator =
    createCharacterAccumulator()
) {
  const combined =
    createLoadoutAccumulator();


  const sortedLoadouts =
    Object.entries(
      accumulator.loadouts
    ).sort(
      (
        [, a],
        [, b]
      ) =>
        b.count -
        a.count
    );


  const loadouts =
    {};


  for (
    const [
      id,
      loadout
    ]
    of sortedLoadouts
  ) {
    mergeLoadoutAccumulator(
      combined,
      loadout
    );


    loadouts[
      id
    ] =
      finalizeLoadout(
        id,
        loadout,
        accumulator.sampleSize
      );
  }


  return {
    baseId:
      definition.baseId,

    name:
      definition.name,

    nameKey:
      definition.nameKey,

    thumbnailName:
      definition.thumbnailName,

    population: {
      unitsSeen:
        accumulator.unitsSeen,

      unitsWithSixMods:
        accumulator.unitsWithSixMods,

      unitsWithResolvedMods:
        accumulator.unitsWithResolvedMods,

      sampleSize:
        accumulator.sampleSize,

      coverageOfOwnedUnits:
        accumulator.unitsSeen >
        0
          ? round(
              accumulator.sampleSize /
              accumulator.unitsSeen
            )
          : null,

      excluded:
        accumulator.excluded
    },

    relicAverage:
      combined.relicCount >
      0
        ? round(
            combined.relicSum /
            combined.relicCount,
            4
          )
        : null,

    loadouts,

    aggregate: {
      primaries:
        finalizePrimaries(
          combined.primaries
        ),

      secondaries:
        finalizeSecondaries(
          combined.secondaries,
          accumulator.sampleSize
        )
    }
  };
}


// ============================================================================
// RATING FILTER STATS
// ============================================================================

function createRatingFilterStats() {
  return {
    enabled:
      REQUIRE_KYBER,

    requiredLeague:
      REQUIRE_KYBER
        ? "KYBER"
        : null,

    includedPlayers:
      0,

    kyberPlayers:
      0,

    nonKyberPlayers:
      0,

    unknownRatingPlayers:
      0,

    leagueCounts:
      {},

    divisionCounts: {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      unknown: 0
    }
  };
}


function ensureRatingFilterStats(
  checkpoint
) {
  checkpoint
    .cohort
    .ratingFilter ??=
      createRatingFilterStats();


  return checkpoint
    .cohort
    .ratingFilter;
}


function recordPlayerRating(
  checkpoint,
  rating,
  included
) {
  const stats =
    ensureRatingFilterStats(
      checkpoint
    );


  if (
    included
  ) {
    stats.includedPlayers++;
  }


  if (
    !rating.league
  ) {
    stats
      .unknownRatingPlayers++;

    stats
      .divisionCounts
      .unknown++;

    return;
  }


  stats
    .leagueCounts[
      rating.league
    ] =
      (
        stats
          .leagueCounts[
            rating.league
          ] ??
        0
      ) +
      1;


  if (
    rating.league ===
    "KYBER"
  ) {
    stats
      .kyberPlayers++;
  } else {
    stats
      .nonKyberPlayers++;
  }


  /**
 * Division counts are intended to represent the Kyber population only.
 */
if (
  rating.league ===
  "KYBER"
) {
  if (
    rating.division >=
      1 &&
    rating.division <=
      5
  ) {
    const key =
      String(
        rating.division
      );


    stats
      .divisionCounts[
        key
      ] =
      (
        stats
          .divisionCounts[
            key
          ] ??
        0
      ) +
      1;
  } else {
    stats
      .divisionCounts
      .unknown++;
  }
}
}


// ============================================================================
// CHECKPOINT
// ============================================================================

function createCheckpoint(
  gameDataVersion,
  localizationVersion
) {
  return {
    schemaVersion:
      SCHEMA_VERSION,

    source: {
      provider:
        "swgoh-comlink",

      gameDataVersion,

      localizationVersion,

      generatedAt:
        null
    },

    cohort: {
      source:
        "guild-search",

      guildSearch: {
        minGuildGalacticPower:
          MIN_GUILD_GP,

        maxGuildGalacticPower:
          MAX_GUILD_GP,

        minMemberCount:
          MIN_GUILD_MEMBERS,

        maxMemberCount:
          MAX_GUILD_MEMBERS,

        requestedGuilds:
          GUILD_SEARCH_COUNT
      },

      ratingFilter:
        createRatingFilterStats(),

      discoveredGuilds:
        0,

      players:
        []
    },

    processedPlayerKeys:
      [],

    failedPlayers:
      {},

    accumulators:
      {}
  };
}


async function loadCheckpoint(
  gameDataVersion,
  localizationVersion
) {
  if (
    RESET
  ) {
    console.log(
      "RESET=1 — starting fresh."
    );


    await fs.rm(
      CHECKPOINT_FILE,
      {
        force: true
      }
    );


    return createCheckpoint(
      gameDataVersion,
      localizationVersion
    );
  }


  try {
    const checkpoint =
      JSON.parse(
        await fs.readFile(
          CHECKPOINT_FILE,
          "utf8"
        )
      );


    if (
      checkpoint.schemaVersion !==
      SCHEMA_VERSION
    ) {
      throw new Error(
        `Existing checkpoint schema is ${checkpoint.schemaVersion}; expected ${SCHEMA_VERSION}. Run with RESET=1.`
      );
    }


    if (
      checkpoint
        .source
        ?.gameDataVersion !==
      gameDataVersion
    ) {
      throw new Error(
        [
          "Game-data version changed.",
          `Checkpoint: ${checkpoint.source?.gameDataVersion}`,
          `Current: ${gameDataVersion}`,
          "",
          "Run with RESET=1."
        ].join(
          "\n"
        )
      );
    }


    if (
      checkpoint
        .source
        ?.localizationVersion !==
      localizationVersion
    ) {
      throw new Error(
        "Localization version changed. Run with RESET=1."
      );
    }


    console.log(
      `Resuming from ${CHECKPOINT_FILE}`
    );


    return checkpoint;

  } catch (error) {
    if (
      error.code ===
      "ENOENT"
    ) {
      return createCheckpoint(
        gameDataVersion,
        localizationVersion
      );
    }


    throw error;
  }
}


// ============================================================================
// FINAL OUTPUT
// ============================================================================

function buildFinalOutput(
  checkpoint,
  characters,
  unresolvedDefinitions
) {
  const output = {
    schemaVersion:
      SCHEMA_VERSION,

    source: {
      provider:
        "swgoh-comlink",

      generatedAt:
        new Date()
          .toISOString(),

      gameDataVersion:
        checkpoint
          .source
          .gameDataVersion,

      localizationVersion:
        checkpoint
          .source
          .localizationVersion
    },

    cohort: {
      source:
        "guild-search",

      guildSearch:
        checkpoint
          .cohort
          .guildSearch,

      ratingFilter:
        checkpoint
          .cohort
          .ratingFilter,

      discoveredGuilds:
        checkpoint
          .cohort
          .discoveredGuilds,

      discoveredPlayers:
        checkpoint
          .cohort
          .players
          .length,

      fetchedAndClassifiedPlayers:
        checkpoint
          .processedPlayerKeys
          .length,

      includedPlayers:
        checkpoint
          .cohort
          .ratingFilter
          ?.includedPlayers ??
        0,

      failedPlayers:
        Object.keys(
          checkpoint.failedPlayers
        ).length
    },

    setDefinitions:
      MOD_SET_DEFINITIONS,

    statDefinitions:
      MOD_STAT_DEFINITIONS,

    unresolvedModDefinitionIds:
      [
        ...unresolvedDefinitions
      ].sort(),

    characters:
      {}
  };


  const sortedCharacters =
    [
      ...characters.values()
    ].sort(
      (a, b) =>
        a.name.localeCompare(
          b.name
        )
    );


  for (
    const character
    of sortedCharacters
  ) {
    output.characters[
      character.baseId
    ] =
      finalizeCharacter(
        character,

        checkpoint
          .accumulators[
            character.baseId
          ]
      );
  }


  return output;
}


// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log(
    "\n=============================================="
  );

  console.log(
    "Grand Ivory Comlink Meta Builder"
  );

  console.log(
    "670M+ Guild / Kyber Player Version"
  );

  console.log(
    "==============================================\n"
  );


  console.log(
    `Comlink: ${COMLINK_URL}`
  );


  console.log(
    `HMAC: ${
      COMLINK_ACCESS_KEY
        ? "enabled"
        : "disabled"
    }`
  );


  console.log(
    `Minimum guild GP: ${MIN_GUILD_GP.toLocaleString()}`
  );


  console.log(
    `Kyber-only filter: ${
      REQUIRE_KYBER
        ? "enabled"
        : "disabled"
    }`
  );


  // --------------------------------------------------------------------------
  // Metadata
  // --------------------------------------------------------------------------

  const {
    gameDataVersion,
    localizationVersion
  } =
    await getMetadata();


  console.log(
    `Game data: ${gameDataVersion}`
  );


  // --------------------------------------------------------------------------
  // Localization
  // --------------------------------------------------------------------------

  const localization =
    await getLocalization(
      localizationVersion
    );


  // --------------------------------------------------------------------------
  // Game data
  // --------------------------------------------------------------------------

  const {
    units,
    statMods
  } =
    await getGameData(
      gameDataVersion
    );


  const characters =
    buildCharacterDefinitions(
      units,
      localization
    );


  const modDefinitionMap =
    buildModDefinitionMap(
      statMods
    );


  console.log(
    `Characters tracked: ${characters.size}`
  );


  console.log(
    `Mod definitions: ${modDefinitionMap.size}`
  );


  // --------------------------------------------------------------------------
  // Checkpoint
  // --------------------------------------------------------------------------

  const checkpoint =
    await loadCheckpoint(
      gameDataVersion,
      localizationVersion
    );


  ensureRatingFilterStats(
    checkpoint
  );


  // --------------------------------------------------------------------------
  // Player discovery
  // --------------------------------------------------------------------------

  if (
    checkpoint
      .cohort
      .players
      .length ===
    0
  ) {
    const discovery =
      await discoverPlayersFromGuilds();


    checkpoint
      .cohort
      .discoveredGuilds =
        discovery.guildCount;


    checkpoint
      .cohort
      .players =
        discovery.players;


    checkpoint
      .source
      .generatedAt =
        new Date()
          .toISOString();


    await writeJsonAtomic(
      CHECKPOINT_FILE,
      checkpoint
    );

  } else {
    console.log(
      `Using saved cohort: ${checkpoint.cohort.players.length} players`
    );
  }


  if (
    checkpoint
      .cohort
      .players
      .length ===
    0
  ) {
    throw new Error(
      "Guild discovery found 0 players."
    );
  }


  // --------------------------------------------------------------------------
  // Process players
  // --------------------------------------------------------------------------

  const processed =
    new Set(
      checkpoint
        .processedPlayerKeys
    );


  const unresolvedDefinitions =
    new Set();


  let fetchedThisRun =
    0;


  let includedThisRun =
    0;


  let sinceCheckpoint =
    0;


  const players =
    checkpoint
      .cohort
      .players;


  for (
    let index = 0;
    index <
      players.length;
    index++
  ) {
    const reference =
      players[
        index
      ];


    if (
      processed.has(
        reference.key
      )
    ) {
      continue;
    }


    if (
      checkpoint
        .failedPlayers[
          reference.key
        ] &&
      !RETRY_FAILED
    ) {
      continue;
    }


    console.log(
      `[Player ${index + 1}/${players.length}] ` +
      `${reference.name ?? reference.playerId ?? reference.allyCode}`
    );


    try {
      const player =
        await getPlayer(
          reference
        );


      fetchedThisRun++;


      // ----------------------------------------------------------------------
      // Determine current GAC league
      // ----------------------------------------------------------------------

      const rating =
        extractPlayerRating(
          player
        );


      const ratingText =
        rating.league
          ? (
              rating.league +
              (
                rating.division
                  ? ` ${rating.division}`
                  : ""
              ) +
              (
                rating.skillRating !==
                null
                  ? ` — ${rating.skillRating} SR`
                  : ""
              )
            )
          : "UNKNOWN";


      console.log(
        `  GAC: ${ratingText}` +
        (
          rating.source
            ? ` [${rating.source}]`
            : ""
        )
      );


      // ----------------------------------------------------------------------
      // Kyber filter
      // ----------------------------------------------------------------------

      const included =
        (
          !REQUIRE_KYBER ||
          rating.league ===
            "KYBER"
        );


      recordPlayerRating(
        checkpoint,
        rating,
        included
      );


      if (
        included
      ) {
        processPlayer(
          player,
          characters,
          checkpoint.accumulators,
          modDefinitionMap,
          unresolvedDefinitions
        );


        includedThisRun++;


        console.log(
          "  Included in meta."
        );
      } else {
        console.log(
          `  Skipped — ${
            rating.league
              ? `league is ${rating.league}`
              : "GAC league could not be determined"
          }.`
        );
      }


      // ----------------------------------------------------------------------
      // Player is considered processed whether included or filtered.
      // ----------------------------------------------------------------------

      processed.add(
        reference.key
      );


      checkpoint
        .processedPlayerKeys =
          [
            ...processed
          ];


      delete checkpoint
        .failedPlayers[
          reference.key
        ];


      sinceCheckpoint++;

    } catch (error) {
      if (
        error?.status ===
          401 ||
        error?.status ===
          403
      ) {
        throw error;
      }


      console.warn(
        `  Failed player: ${error.message}`
      );


      checkpoint
        .failedPlayers[
          reference.key
        ] = {
          message:
            error.message,

          at:
            new Date()
              .toISOString()
        };


      sinceCheckpoint++;
    }


    // ------------------------------------------------------------------------
    // Periodic checkpoint
    // ------------------------------------------------------------------------

    if (
      sinceCheckpoint >=
      CHECKPOINT_EVERY
    ) {
      checkpoint
        .source
        .generatedAt =
          new Date()
            .toISOString();


      await writeJsonAtomic(
        CHECKPOINT_FILE,
        checkpoint
      );


      sinceCheckpoint =
        0;
    }


    if (
      REQUEST_DELAY_MS >
      0
    ) {
      await sleep(
        REQUEST_DELAY_MS
      );
    }
  }


  // --------------------------------------------------------------------------
  // Final checkpoint
  // --------------------------------------------------------------------------

  checkpoint
    .source
    .generatedAt =
      new Date()
        .toISOString();


  await writeJsonAtomic(
    CHECKPOINT_FILE,
    checkpoint
  );


  // --------------------------------------------------------------------------
  // Build final metaProfiles.json
  // --------------------------------------------------------------------------

  const output =
    buildFinalOutput(
      checkpoint,
      characters,
      unresolvedDefinitions
    );


  await writeJsonAtomic(
    OUTPUT_FILE,
    output
  );


  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------

  const profiles =
    Object.values(
      output.characters
    );


  const withData =
    profiles.filter(
      profile =>
        profile
          .population
          .sampleSize >
        0
    );


  const rating =
    output
      .cohort
      .ratingFilter;


  console.log(
    "\n=============================================="
  );

  console.log(
    "Complete"
  );

  console.log(
    "=============================================="
  );


  console.log(
    `Guilds discovered: ${output.cohort.discoveredGuilds}`
  );


  console.log(
    `Players discovered: ${output.cohort.discoveredPlayers}`
  );


  console.log(
    `Players fetched/classified: ${output.cohort.fetchedAndClassifiedPlayers}`
  );


  console.log(
    `Players fetched this run: ${fetchedThisRun}`
  );


  console.log(
    `Players included this run: ${includedThisRun}`
  );


  console.log(
    `Players included total: ${output.cohort.includedPlayers}`
  );


  console.log(
    `Failed players: ${output.cohort.failedPlayers}`
  );


  console.log(
    "\nGAC league distribution:"
  );


  for (
    const [
      league,
      count
    ]
    of Object.entries(
      rating.leagueCounts
    ).sort(
      (
        [, a],
        [, b]
      ) =>
        b - a
    )
  ) {
    console.log(
      `  ${league.padEnd(12)} ${count}`
    );
  }


  console.log(
    `  ${"UNKNOWN".padEnd(12)} ${rating.unknownRatingPlayers}`
  );


  if (
    REQUIRE_KYBER
  ) {
    console.log(
      "\nKyber divisions:"
    );


    for (
      const division
      of [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    ) {
      console.log(
        `  Kyber ${division}: ${rating.divisionCounts[division] ?? 0}`
      );
    }


    console.log(
      `  Unknown division: ${rating.divisionCounts.unknown ?? 0}`
    );
  }


  console.log(
    `\nCharacters with usable mod samples: ${withData.length}`
  );


  console.log(
    `Output: ${OUTPUT_FILE}`
  );


  console.log(
    `Checkpoint: ${CHECKPOINT_FILE}`
  );


  console.log(
    "\nLargest character samples:"
  );


  for (
    const character
    of withData
      .sort(
        (a, b) =>
          b.population.sampleSize -
          a.population.sampleSize
      )
      .slice(
        0,
        20
      )
  ) {
    console.log(
      `  ` +
      `${String(character.population.sampleSize).padStart(6)}  ` +
      `${character.name}`
    );
  }


  if (
    output
      .unresolvedModDefinitionIds
      .length >
    0
  ) {
    console.warn(
      "\nUnresolved mod definitions:"
    );


    console.warn(
      output
        .unresolvedModDefinitionIds
        .join(
          ", "
        )
    );
  }
}


// ============================================================================
// RUN
// ============================================================================

main().catch(
  error => {
    console.error(
      "\nFatal error:"
    );


    console.error(
      error
    );


    process.exitCode =
      1;
  }
);