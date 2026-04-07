# All Scripts Index

This directory contains the complete source code for all 6 GeoStudio Tampermonkey scripts.

## Scripts

1. **BOAK.user.js** - Map Tools Panel
   - Provides quick access to Bing Maps, OpenStreetMap, ADRI, and Kibana
   - Extracts address and coordinates from GeoStudio
   - Opens/reuses browser windows for each tool

2. **GAMAutoFill.user.js** - GAM Triage Controller  
   - Auto-selects PBG queue when GAM Issue = Yes
   - Validates DP coordinates (10km minimum distance)
   - Filters queue options based on GAM Issue value
   - Parent-iframe communication for DP geocode sharing

3. **Pastdeliveries.user.js** - Past Deliveries Automation
   - Auto-configures "Past deliveries" panel
   - Sets Attribute to "Count" and Filter to "All"
   - Triggers on timer change or new address
   - Manual trigger with "P" keyboard shortcut

4. **PasteDPRE.user.js** - Paste DP/RE Coordinates
   - Pastes clipboard coordinates into DP and/or RE fields
   - Handles React input fields properly
   - Three buttons: PDP (paste DP), PRE (paste RE), PBoth (paste both)
   - Parses multiple coordinate formats

5. **geocodeCopier.user.js** - Copy DP/RE Coordinates
   - Copies DP or RE coordinates to clipboard
   - Two buttons: CDP (copy DP), CRE (copy RE)
   - Simple one-click copy functionality

6. **NEIPopup.user.js** - NEI Verification Popup
   - Shows verification checklist when NEI is selected
   - Works in iframe (templates page)
   - Communicates with parent to close dialog
   - Monitors dropdowns and radio buttons for NEI selection

## Usage

Each script file can be:
- Copied directly into Tampermonkey
- Used as reference for building new scripts
- Modified for custom functionality

## Cross-References

- Brand Kit: `../02-Brand-Kit/UNIFIED-BRAND-KIT.md`
- Individual Analysis: `../04-Script-Analysis/`
- Code Patterns: `../05-Patterns/`
