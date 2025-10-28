## 3.3.6

### Bug Fixes
- Fix PDF settings and Unarmed Items for non-English localization (#207)

## 3.3.5

### System Improvements
- Imported characters from GENESIS/Commlink will be enriched with Items (incl their Effects) from Compendia
- Add Read Only PDF Journal Sheet that automatically loads (#202)
- Add PDF book configuration (#202)
- Automatic PDF Journal creation for configured books (#202)
- Add Book ID and Pages to Items so the ItemSheet has links to the PDFs (#202)
- Add an UNARMED weapon item automatically at creation of a character (#193)
- Vehicles and Drones can now roll physical defense and soak from chat buttons
- Add a Data Entry setting option in the System Settings

### Bug Fixes
- Fix Unarmed item AR when imported from GENESIS/Commlink (#193)
- Fix capacity of Items sometimes changing on editing Social field (#192)
- Fix source name of Effects wrongly displayed of drag&dropped items (#195)
- Fix multiple levels of Statuses not working in V13 (#182)
- Fix that items now also save on close (except for AR field) (#32)
- Fix data issue that attackRatings can be null (#203)
- Fix Skill Pool overrides not working correctly (used by Skillwires and such) (#204)
- Fix Commlink/Genesis import to reset prototype token settings (#205)

### Data Updates
- Update Compendium pack items to include Product book name and page number (#202)
- Russian translation updates (TheFokin)
- Russian CSS layout corrections (TheFokin)

## 3.3.4

### Bug Fixes
- Fix importing of Commlink exported characters with melee weapons (#183)
- Fix nuyen field to be uneditable (#187)
- Fix forming GruntGroups in some cases not using a new Grunt Group ID (#189)
- Fix itemsheet saving behavior of the Attack Rating fields, when AR was also modified by an Effect (#188)
- Fix unnecessary submit triggers due to "system." name fields
- Allow vehicles and drone sections on the Charactersheet to have persistent collapsible states

## 3.3.3

### System Improvements
- Add Clickable Overwatch Counter
- Add Sustained Complex Form support
- Add Expanded Specializations optional rule
- Add Movement & Sprint to Character Sheet and results to chat message (#173)
- Enhancement: Edge can now be rolled by clicking on its label
- Enhancement: if defender of an attack would gain Edge, its now automatically added instead of a manual step (#181)
- Enhancement: Changing Edge in a gruntGroup, changes the edge of all Actors within the gruntGroup
- Add Effects for Movement, Sprint Base and Sprint Modifier (#173)
- Add Hardened Armor and Immunity to Normal Weapons as Effects
- Spirits automatically have Immunity to Normal Weapons and Hardened Armor
- Add Pronouns field to Contacts
- Allow persistant collapsible items on character sheet for matrix devices
- Improve various sections on the character sheet for improved layout & draggable items
- Knowledge & Language skills now have an editable sheet instead of a sort of hidden text field


### Bug Fixes
- Fix drag&drop onto ItemSheets to also work for non-GM users (#176)
- Fix ItemSheets not updating on other clients when a mod was uninstalled
- Prevent item and persona changes on clients other than owner
- Fix error that other clients also try to update an actor that isnt their own when they make changes like switching on/off matrix devices
- Fix NPC/Critter/Spirit skill specialization/expertise names not shown on Read Only sheet (#169)
- Fix Spell/Form collapsible descriptions in the chat message to support html from the Editor.
- Allow attributes (e.g. Magic/Resonance) to be Modified to 0
- Fix Data Spike being an OUTSIDER matrix action
- Fix close combat items imported via GENESIS/COMMLINK to get their Strength added another time by Foundry after import (#174)
- Fix Drain Soak tests to be physical damage if results are above Magic pool (#179)
- Fix actor read only (limited & observer) sheet
- Fix Armor Lessens Physical Damage to convert dmg for every 8 DR instead of 4 DR (TODO in future: blast dmg converts with 4 DR)
- Fix don't show Cracking Matrix Actions if you don't have cracking
- Remove legacy code that prevented Read Only sheets to have correct descriptions (#172)
- Support CSS variable width sheets (#170)
- Another fix preventing the NPC importer to trigger on pasting text into a prosemirror
- Change HTML and CSS structure so sections on the Magic tab of Actor Sheets are better sized (#170)
- Fix correct styling attribute tables

### Data Updates
- Update Compendiums
- Russian translation updates (TheFokin)


## 3.3.2

### System Improvements
- Improve NPC/Critter/Spirit Read Only sheets
- Add Effects section also to all NPC/Critter/Spirit/Vehicles type of Actors
- Add Sustain toggle to NPC read only sheets for Spells and Critter Powers
- Improve CritterPower Action icon
- Show Qualities on the NPC/Critter/Spirit read only sheets
- Add capability of a default Initiative Type in the Combat Tracker
- Change vehicles to use Matrix Initiative by default in Combat
- Improve > visibility to adjust Persona attribute Mods
- Basic support for Automated Animations
- Change default Token shape to Ellipse on Gridless scenes
- Support ActiveEffects for Items based on an actor attribute using a value starting with "@Actor." (a.o. to support Spirit attacks)
- Improve Critter Power section layout
- Support language specific CSS styling (#166)
- Enable Token Vision by default for all Actor types (#157)
- Updated Foundry verified to 13.348

### Bug Fixes
- Improve Qualities section on actor sheet (#160)
- Fix console error of Item in Items tab
- Fix NaN error for item price (#155)
- Don't show range options in the Roll Dialog if there's no AR on that range
- Remove hover title from weapons
- Fix spirits also having a magic tradition attribute
- Fix registering handlebar helpers in v13
- Fix regression that Hack&Slash matrix actions werent shown any more (#164)
- Fix Gear Mods not openable from Item tab in some cases
- Fix vehicle ammo reload
- Fix vehicle weapon AR display
- Fix html titles on vehicle sheet
- Fix default Vehicle type to be ground_craft
- Change font backup to sans-serif instead of serif (#166)
- Fix draggable qualities (#160)
- Fix Augmentations section so bioware/cyberware is draggable and have collapsible descriptions
- Fix spells drag & drop in Firefox (#158)
- Fix rituals drag & drop in Firefox (#158)
- Fix Matrix Actions not having clickable descriptions (#156)
- Fix NPC Importer triggering on pasting in a code field

### Data Updates
- Add improved Czech localization (Lethrendis)
- English translation updates
- Russian translation updates (TheFokin)


## 3.3.1

### System Improvements
- Add High/Low Pain Tolerance support to active effects

### Bug Fixes
- Fix: Initiative dice rolls are  working again
- Fix: Custom Dice Pool Roll button is working again

## 3.3.0

### System Improvements
- Form and Dismantle Grunt Groups via pressing SHIFT-G while having NPC/Critter/Spirit tokens selected. Grunt Groups are taken into account for Attack Rating and Damage of weapon rolls
- Add Active Effects for Actors and Items which can be configured to modify the Actor's traits, skills & attributes
- Add Gear Mods type of item, which can modify the traits & attributes of an Item the Gear Mod is dragged on
- Add a System Compendium for Gear Mods
- Shooting weapons costs ammo! And can now be reloaded!
- Send chat notification on manual Edge changes (via coinflip UI) during combat (Patreon Poll Request) (#129)
- Send chat notification on ammo changes (reload/switch) during combat (Patreon Poll Request) (#129)
- Allow Items and ActiveEffects to be dragged onto a Token on the canvas
- Font for Canvas placeables and default font for Drawings is now "Play" (Shadowrun style)
- Add new default artwork icons for each Actor type
- Add new default artwork icons for each Item type
- Add Range mouseover hints to AR fields
- Add New Matrix Program icons within the system folder (by Taranion)
- Support Commlink7 item (sub)types (and missing Genesis ones)
- Various Actor & Item sheet layout improvements
- Add Attribute Roll buttons on NPC/Critter/Sprit readonly sheets (#134)
- Added a data entry config flag " CONFIG.SR6.DATA_ENTRY = true " for when you need to change the 'genesisID' in ItemSheets
- Add search by GenesisID to Item Compendiums
- Prepare DataModel framework for Sprites and other Matrix Actors planned for 3.4.0 (#82)
- Renamed "Adjust" to "Mod" in English translation on Actor Sheets
- Add generic Dice Pool Modifier support to Active Effects (#137)
- Add Bad Luck support for Active Effects
- Add this.owner pointer to Vehicle type actor (dev)
- New subString HandleBars helper (dev)
- Update foundry verified compatibility to 13.347

### Bug Fixes
- Fix: Prevent NPC Statblock importer to be triggered when an input/text editor was selected
- Fix attack ratings can be 0 when modified and are only "-" if base statline is 0
- Fix: migrate any old ammo/price/dmg/AR values from strings to integers (#139)
- Fix a ton of regression issues when implementing ActiveEffects & Gear Mods (special thanks to TheFokin for testing & reporting)
- Fix collapsible sections - their open/closed state is no longer saved in DB - as it caused issues; On browser refresh they are closed again
- Show SIN ratings in the SIN quality description (en)
- Fix various localizations
- Your Attribute augmentation modifier is only applied up to +4 to your Attribute
- Fix show all imported Genesis/Commlink drones on the Actor sheet
- Creating a new drone uses the Commlink/Genesis gear type
- Fix weapons on Vehicles to be able to roll on the Engineering skill
- Fix Spirit attribute calculation for attributes and weapons
- Fix bug that Roll Dialog didnt calculate Wound/Sustained modifiers at inital popup
- Fix Roll Dialog where layout would jump a bit when switching FireModes that caused AR to change between single and double digits
- Fix improper display of weapon Attack Ratings from old worlds (#131)
- Remove concat and concat3 helpers from system as its part of Foundry core
- Fix Genetics items to have possible Essence
- Don't gain Edge if you do not target a token and no Defense Rating is manually entered
- Fix Edge Actions reduce Edge & improve chat message (#123)
- Fix diceroll to think Edge Boost was used when "Edge Action" was selected without an actual Action chosen (#122)
- Remove shadowrun black background image from journal to improve readability (#121)
- Don't show FireModes and Ammo if an Item isn't a Firearm/Projectile/Special weapon (#118)
- Fix Ammo Type changing in Roll dialog in certain cases (#118)
- Add empty Skill option for Weapon Items so it's forced to select on Item creation (#117)

### Data Updates
- French translation updates (Zakarik)
- German translation updates (raketenhunddev)
- Russian translation updates (TheFokin)

## 3.2.2

### Bug Fixes 3.2.2
- Fix journal layouts in v12/v13 (#111)
- Bugfix item layout caused by Description editor field (#109)
- Actor/Item css layout improvements for v12/v13
- UI notifications & errors for the NPC Importer
- Bugfix so you can now import English PDF statblocks while running a different FoundryVTT language (#114)

## 3.2.1

### System Improvements
- Add NPC importer from PDF: Pasting a statblock into FoundryVTT will automatically create a new NPC Actor (rework from V10 by raketenhunddev)
- Improvement: Show error message if user is trying to import GENESIS or COMMLINK save file instead of FoundryVTT Export
- Feature: Confirmation dialog on deleting items (#106)
- Add Combat Spell Type field in spell item for direct/indirect spells (#98)
- Feature: Allow Critters to be magic users or technomancers (#97)
- Add # rounds as an option for Extended Tests (#95)
- Localization improvements for plurals (#89)
- Add description field to Items (Zakarik)
- Allow reordering of equipment items on the actor sheet (Zakarik)

### Bug Fixes
- Fix Initiative types [physical/matrix/astral] in Foundry V13 (#105)
- Fix monitor values on imported characters from GENESIS & Commlink (#100)
- Fix Edge Boost&Action Spending in the Roll Dialog (#90)
- Fix defense rolls for Stun damage to apply physical damage (#94)
- Fix spell roll chat messages to use Targets selected for the Roll Defense button
- Allow negative Attribute modifiers (#91)
- Fix Focus item description field (Zakarik)
- Various CSS layout improvements on the actor sheet

### Data Updates
- French translation updates (Zakarik)
- German translation updates (raketenhunddev)
- Russian translation updates (TheFokin)

## 3.2.0

### System Improvements
- FoundryVTT v13 support
- Extended Tests (with Threshold, rolls all at once)
- Open Ended Extended Tests (with Threshold 0)
- Post dice roll Edge Boosts (thanks to raketenhunddev for part of the development)
- Legwork Contact rolls (#80)
- Token HUD and bars are now same color as the Monitors
- Improved Pause animation to Shadowrun style
- Improved Wild and Exploding Dice UX in the dropdown in the chat messages
- Improved SR6 Dice So Nice (#79)
- Added D6 roll tooltip for Initiative rolls
- Add Spirit Types of Street Wyrd book
- Release note pop-up

### Bug Fixes
- Fix so Token health bars now properly work (#22)
- Fix to allow uneven sized images for Items to display correctly
- Don't show Explode checkbox as it can only be used with Edge Boost
- Fix combat tracker Initiative types so they're properly saved (#78)
- Fix Don't show (not working) roll tooltip on initiative roll chatmessages
- Fix Spirit Force attributes (#83)
- Fixed sheet draggable items possible interfering with draggables from other parts of Foundry like chat
- Bugfix combat start error
- Cleaned up desktop.ini files from icons/netrunner

### Data Updates
- German translation updates (raketenhunddev)
- Russian translation updates (TheFokin)

## 3.1.3

### System Improvements
- Player sheet Matrix Attributes now stays open when you change a modifier field and added hover icon UX to Matrix Attribute section and Matrix Actions (#65)
- Added Notes section to Vehicle/Drone sheet (#71)
- Critter/Spirit editable sheet improvements: Don't show augments/armor/ammo, but do show Powers; Allow + button to add powers (#69)

### Bug Fixes
- Fix matrix localization key (raketenhunddev) (#64)
- Fix matrix attribute open/close if the state was already open and you re-opened sheet
- Fix readonly NPC sheet to show essence (#70)
- Fix critter powers having a comma at the end of the list on the NPC readonly sheet (#69)
- Increased size of Speed field on Vehicle/Drone sheet (#72)
- Fix localization of monitor DEAD and BROKEN DOWN states (#74)

### Data Updates
- German translation structure fixes (RastaTux) (#67)

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
