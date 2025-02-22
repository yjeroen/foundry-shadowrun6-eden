## 3.1.2

### Bug Fixes
- Hotfix for console error on editing items
- Hotfix for Persona Matrix Attributes on older worlds where integers were set as strings
- Fix RCC's counting as a Matrix Device that can add their DF to your Persona Attributes (#62)

## 3.1.1

### Bug Fixes
- Hotfix for console error on switching matrix access levels

## 3.1.0

### System Improvements
- Optional Rule: You Can't Dodge Bullets (#7)
- Optional Rule: High Strength Reduces Recoil (#7)
- Optional Rule: High Strength Adds to Damage (#7)
- Optional Rule: Rolling Strength instead of Agility in Close Combat (#7)
- Optional Rule: Armor Lessens Physical Damage (SWC)
- Optional Rule: H&S Matrix Actions
- Multiple Matrix Improvements, a.o. Switchable Matrix Access Levels, Major/Minor Action icons, Matrix Initiative, Action descriptions, Actions filtered depending on A/S Attribute, (switcheable) Configurable persona Matrix Attributes
- New feature: Drag simple/weapons/spell/ritual/complexform rolls to your hotbar (#45)
- Condition improvements: BLIND III now causing full blind on token vision; UNCONCIOUS causes PRONE and full BLIND conditions; Full physical/stun monitor now causes UNCONCIOUS.
- Add UI error if trying to roll for a weapon without an assigned skill
- Change game-pause font
- Simple Defense Tests now have a default thresholf of 1 so you can manually adjust these in the dialog
- Change default vehicle token size of 2x3 gridspaces

### Bug Fixes
- Fix to not show matrix initiative for Critters and Spirits (#59)
- Fixed some integer conversion (#57)
- Bugfix error on contact sheet close (#54)
- Bugfix for localization to placeholder field of Qualities (#53)
- Calculate edge even if actor is not in combat (raketenhunddev)
- Fixed bug where vehicles/drones can't be targeted (raketenhunddev)
- Fixed bug preventing roll dialog to open on custom rolls (raketenhunddev)
- Fix Physical and Stun Monitor base values are now shown on the Derived Values section of the actor sheet
- Fix weapons showing firemodes if weapons don't have any
- Fix whips adding Reaction to their Attack Rating
- Fix Item drag & drop
- Fix roll hotbar macro so it also works when a character is assigned in User Configuration (#48)
- Fix ordering of Matrix Actions by localized language; (#47)
- Fixed SVGs that prevent foundry from loading in Firefox (raketenhunddev)
- Fix close combat weapons not adding Strength to Attack Rating (#41)
- Fix matrix actions button titles
- Fix overwatch input field
- Fix Resist Dmg rolls so they won't use wound modifiers
- Minor textual Actor Sheet updates (feedback Ork the Bork)
- Improve SR6 System Settings UX
- Changed some statusEffect icons for improved recognition and increased pink brightness of all icons for improved visibility
- Tweaked condition # number in the token HUD for improved visibility.

### Data Updates
- German translation updates (raketenhunddev)
- Russian translation updates (TheFokin)

## 3.0.4

### Bug Fixes

-   (raketenhunddev) Fixed SVG width/height so canvas loads in Firefox (#35)
-   (yjeroen) Added default macro dice icon SVG with Firefox support
-   (yjeroen) Fixed Vehicle Sheet layout so dropdowns use min-width instead of width to support longer localization translations (#37)
-   (yjeroen) Fix missing stealth skill attribute for Vehicles (#38)
-   (yjeroen) Fix Vehicle Sheet so Belongs To dropdown only shows actors you're owner of (#39), and the actor list is build on the fly so it shows correct names without reload after they have been changed (#40)

## 3.0.3

### System Improvements

-   (raketenhunddev) Added Vehicle/Drone Sheet
-   (yjeroen) Added Shadowrun Conditions (including multiple levels and Bleeding as optional rule in Settings) (#2)
-   (yjeroen) Added possibility to roll basic attributes by clicking on the attribute name, and add other attributes to that roll (#26)
-   (yjeroen) Feature: Dragging diceroll links to the hotbar creates macros (#30)
-   (yjeroen) Added section in Equipment tab on Character sheet for Magical supply items (#16)
-   (raketenhunddev) Added html element names to keep focus on elements after data update
-   (yjeroen) Added hover UX for the manual dicepool button at the bottom of the chat
-   (yjeroen) Body attribute can now be selected as magic Tradition attribute, for Adept Drain (#26)
-   (yjeroen) Added new shadowrun style icons
-   (yjeroen) Add Matrix Damage field for Matrix Devices, Vehicles and Drone items (#24)


### Bug Fixes

-   (yjeroen) Fixes item sheets to have auto width (#15)
-   (yjeroen) Fixed various localization bugs/missing items (#17)(#20)
-   (yjeroen) Improved various UX styling in the Player Character sheet and vehicle sheet (#21)
-   (raketenhunddev) Fixed file permissions for module/util/HtmlUtilities.js
-   (yjeroen) NPS sheet now shows correct initiative pool values in readonly-mode (#23)
-   (yjeroen) Fixed edge gain/loss in combat when targeting enemies (#25)
-   (yjeroen) Fixed Matrix Condition Monitor for vehicle actors (#24)

### Data Updates

-   (TheFokin) Updated Russian translation

## 3.0.2

### Bug Fixes

-   (yjeroen) Bugfix on Add RCC button and new default funky name for newly created RCCs

## 3.0.1

### System Improvements

-   (yjeroen) Added optional rule for Hard Dice Cap (20) and edge coin in roll dial

### Bug Fixes

-   (yjeroen) Fix system.json link and shield badge in README
-   (yjeroen) Added Athletics (Free Fall) specialization (#11)
-   (yjeroen) Added add button for RCC's (#8)

### Data Updates

-   (TheFokin) Added Russian translation
-   (raketenhunddev) Updated German translation

## 3.0.0

### System Improvements

-   (yjeroen) Player Character Sheet improvements
-   (yjeroen) Item Sheets minor improvements
-   (yjeroen) Roll sustained/wound modifiers
-   (yjeroen) Critter Sheet minor improvements
-   (yjeroen) NPC Sheet minor improvements
-   (yjeroen) Spirit Sheet minor improvements
-   (yjeroen) Hide Vehicle/Drone Sheet (until future readiness)
-   (yjeroen) Add Edge Max 7
-   (yjeroen) Improve spell dialog (Amps, Damage)
-   (yjeroen) Several minor roll dialog ui improvements
-   (yjeroen) More minor sheet ui improvements
-   (yjeroen) Automatic phys/stun type in chat
-   (yjeroen) Add weapon AR range reduction and firemode validations
-   (yjeroen) Add damage soak button after failed defense test
-   (yjeroen) Apply damage button & revert damage button
-   (yjeroen) Add edge flip
-   (yjeroen) UX improvements

### Bug Fixes

-   (yjeroen) Working Player Character Sheet
-   (yjeroen) Working various Item Sheets
-   (yjeroen) Working Roll dialogues
-   (yjeroen) Roll minor fixes
-   (yjeroen) Roll mode fix
-   (yjeroen) Working Critter Sheet
-   (yjeroen) Working NPC Sheet 
-   (yjeroen) Working Spirit Sheet 
-   (yjeroen) Fixing deprecation warnings
-   (yjeroen) Fix matrix dice rolls
-   (yjeroen) Fix spell dice rolls
-   (yjeroen) Fix Rituals roll
-   (yjeroen) Fix target defense rolls from attacks in chat
-   (yjeroen) Fix drain button in spell chat
-   (yjeroen) Fix complex form rolls (incl add Fading & Thresholds)
-   (yjeroen) Fix weapon firemode switching
-   (yjeroen) Fix weapon defense and damage rolls 
-   (yjeroen) Rework weapon/spell defense>soak>damage rolls and chat messages
-   (yjeroen) Fix health essense spells against self/targets
-   (yjeroen) Fix and improve health monitor
-   (yjeroen) Fix overflow behavior

### Data Updates

-   (yjeroen) Add several new English keys [en.json]
