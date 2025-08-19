![REPLACE WITH RAW GITHUB LINK](https://github.com/yjeroen/foundry-shadowrun6-eden/blob/main/images/sr6-system.webp?raw=true)

# Foundry VTT - Shadowrun Sixth World Game System

![Shadowrun6 System](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/yjeroen/foundry-shadowrun6-eden/refs/heads/main/system.json&label=Shadowrun6%20System&query=$.version&colorB=blue&logo=sega&logoColor=white)
![FoundryVTT Verified](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/yjeroen/foundry-shadowrun6-eden/refs/heads/main/system.json&label=FoundryVTT%20Verified&query=$.compatibility.verified&colorB=green&logo=roll20)
![FoundryVTT Supported](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https://raw.githubusercontent.com/yjeroen/foundry-shadowrun6-eden/refs/heads/main/system.json&label=FoundryVTT%20Supported&colorB=green)

![GitHub Release Date](https://img.shields.io/github/release-date/yjeroen/foundry-shadowrun6-eden?color=blue)
[![GitHub commits](https://img.shields.io/github/commits-since/yjeroen/foundry-shadowrun6-eden/latest)](https://github.com/xyjeroen/foundry-shadowrun6-eden/commits/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
![GitHub contributors](https://img.shields.io/github/contributors/yjeroen/foundry-shadowrun6-eden)

![GitHub downloads](https://img.shields.io/github/downloads/yjeroen/foundry-shadowrun6-eden/total?label=Downloads)
![GitHub downloads Latest](https://img.shields.io/github/downloads/yjeroen/foundry-shadowrun6-eden/latest/total?label=Downloads%20Latest%20Release)
![Forge installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https://forge-vtt.com/api/bazaar/package/shadowrun6-eden)

_Chummers!_ This game system for the BTL [Foundry Virtual Tabletop](http://foundryvtt.com) provides character sheet and game system support for the Shadowrun Sixth World roleplaying game.

This system provides character sheet support for Actors and Items, mechanical support for dice and rules necessary to play games of Shadowrun 6th Edition! 

You can find the latest news and more instructions on our [DeepResonanceWare Patreon](https://www.patreon.com/DeepResonanceWare). (free tier)

## Installation Instructions

To install and use the Shadowrun 6E system for Foundry Virtual Tabletop, simply paste the following URL into the 
**Install System** dialog on the Setup menu of the application.

https://github.com/yjeroen/foundry-shadowrun6-eden/releases/latest/download/system.json

If you wish to manually install the system, you may do this by cloning the repository or downloading a zip archive from the [Releases Page](https://github.com/yjeroen/foundry-shadowrun6-eden/releases). Then extract it into your Foundry's `Data/systems/shadowrun6-eden` folder. 

## Community Contribution

For friendly discussion and questions, you can reach out on the original [Genesis Discord](https://discord.gg/USE9Gte), or on [FoundryVTT Discord](https://discord.gg/foundryvtt) [#other-game-systems](https://discord.com/channels/170995199584108546/701846414208008302). You can contribute simply by [reporting](https://github.com/yjeroen/foundry-shadowrun6-eden/issues) bugs, vote on feature requests, or updating language translation files (new English keys haven't been translated yet).

_Are you a dataslave or deckhead?_ If you have JavaScript, HTML and/or CSS skills, you can take ownership of one of the feature requests by replying on it (to let people know you work on this) and become a collaborator! See: [How to Contribute to an Open Source Project on GitHub](https://kcd.im/pull-request)

## System Screenshots
> The character sheet now has an updated monitor experience! If you click on the coloured boxes, you get that much damage, and when you click on a white box you get healed unto that box. Stun overflow goes to Physical, and Physical into your Overflow. _In simple terms, don't get fragged._

![FoundryVTT Shadowrun6 Monitor](https://github.com/yjeroen/foundry-shadowrun6-eden/blob/main/.github/images/sr6-eden-monitors.gif?raw=true)

> Edge coin flips?! Left ⇑ and right ⇓ click.

![FoundryVTT Shadowrun6 Edge](https://github.com/yjeroen/foundry-shadowrun6-eden/blob/main/.github/images/sr6-eden-edge-click.gif?raw=true)

> Edge Boosts can be used to manipulate your dice results after rolling. Click on the dice result row in the chat to open the diceroll window. You can even manipulate your opponents results via the ***Reroll One Die*** edge boost!

![FoundryVTT Shadowrun6 Edge Boosts](https://github.com/yjeroen/foundry-shadowrun6-eden/blob/main/.github/images/sr6-eden-edge-boosts.gif?raw=true)

> You can **still import** your RPGFramework [GENESIS](https://www.rpgframework.de/en/roleplaying/shadowrun-6/) and [Commlink6](https://www.rpgframework.de/en/2022/10/07/commlink-6/) characters! Print to `Shadowrun 6 Foundry Export`, and in FoundryVTT right click on your actor and choose `Import Data`. In the v3 system, your character sheet has been updated with a bunch of small improvements.

![FoundryVTT Shadowrun6 Sheet](https://github.com/yjeroen/foundry-shadowrun6-eden/blob/main/.github/images/sr6-v3-screenshot-sheet.webp?raw=true)

> The system is updated with a new UX style. And we've got automated Attack Rating & Edge calculation, attack rolls with firemode and range, defense rolls, drain rolls, soak rolls!

![FoundryVTT Shadowrun6 Scene](https://github.com/yjeroen/foundry-shadowrun6-eden/blob/main/.github/images/sr6-v3-screenshot-scene.webp?raw=true)

> The system includes all possible Sixth World status effects. Including an optional rule (in Settings) for Bleeding. Normal-left-click to increase a status effect, and right click to decrease it. You can ctrl-left-click to add an effect as an overlay on the token.

![FoundryVTT Shadowrun6 StatusEffects](https://github.com/yjeroen/foundry-shadowrun6-eden/blob/main/.github/images/sr6-eden-status-effects.gif?raw=true)

> You can drag any diceroll link from your sheet to your hotbar.

![FoundryVTT Shadowrun6 macros](https://github.com/yjeroen/foundry-shadowrun6-eden/blob/main/.github/images/sr6-eden-drag-roll-macros.gif?raw=true)

> Only your available Matrix Actions are shown depending on your Matrix Attributes. (enable H&S Actions in the Foundry Game Settings) Furthermore, they are greyed out depending on your Matrix Access Level. And you can Reconfigure your Persona's Matrix Attributes by clicking on two of them, switching them.

![FoundryVTT Shadowrun6 matrix](https://github.com/yjeroen/foundry-shadowrun6-eden/blob/main/.github/images/sr6-eden-matrix.gif?raw=true)

> Legwork Tests (Core Book page 50-51) can be performed via your Contacts, found in the Biography section of your character sheet.

![FoundryVTT Shadowrun6 Legwork](https://github.com/yjeroen/foundry-shadowrun6-eden/blob/main/.github/images/sr6-eden-legwork.webp?raw=true)

> Most of the favorite optional rules can be enabled in the FoundryVTT Game Settings.

![FoundryVTT Shadowrun6 settings](https://github.com/yjeroen/foundry-shadowrun6-eden/blob/main/.github/images/sr6-eden-game-settings.webp?raw=true)

> You can add Active Effects for Actors and Items which can be configured to modify the Actor's traits, skills & attributes.

![FoundryVTT Shadowrun6 Active Effects](https://github.com/yjeroen/foundry-shadowrun6-eden/blob/main/.github/images/sr6-active-effect.gif?raw=true)

> There are Gear Mods, which can modify the traits & attributes of an Item the Gear Mod is dragged on

![FoundryVTT Shadowrun6 Gear Mods](https://github.com/yjeroen/foundry-shadowrun6-eden/blob/main/.github/images/sr6-gear-mods.gif?raw=true)

## Patch Notes

See [CHANGELOG](https://github.com/yjeroen/foundry-shadowrun6-eden/blob/main/CHANGELOG.md)

## Licenses

**Project Licensing:**

- All HTML, CSS and Javascript in this project is licensed under the GNU General Public License. This project is a fork of the [original v10 system](https://bitbucket.org/rpgframework-cloud/shadowrun6-eden/) by [taranion](https://www.rpgframework.de).

**Content Usage and Licensing:**

- The Shadowrun Sixth World RPG is made and by Catalyst Game Labs. Shadowrun and Matrix are registered trademarks and/or trademarks of The Topps Company, Inc. No actual content of the RPG is contained within this system. Community Fair Use policy is assumed to automate the ruleset in this FoundryVTT system implementation.
- The background image is from [kerko](https://www.deviantart.com/kerko) on deviantart, published on May 16, 2020 with Creative Commons Attribution.
- The icons are based on svg's from FoundryVTT, icons from [Cyberpunk Red Core system](https://gitlab.com/cyberpunk-red-team/fvtt-cyberpunk-red-core), Mirrandin from [reddit/u/](https://old.reddit.com/user/Mirrandin) and Solution from [SolutionMaps](https://www.patreon.com/solutionmaps).

**Virtual Table Top Platform Licenses:**

- This Game System for Foundry Virtual Tabletop is licensed under the [Limited License Agreement for module development 09/02/2020](https://foundryvtt.com/article/license/).

