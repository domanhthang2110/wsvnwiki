import * as path from 'path';
import * as fs from 'fs';
import { CLASS_FACTION_INFO_MAP } from './src/lib/data/factionMap';

function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

// Manually defined mapping from slugified class names to GIF shorthand names
const CLASS_SLUG_TO_GIF_SHORT_NAME_MAP: Record<string, string> = {
  "priest": "priest",
  "seeker": "seeker",
  "paladin": "pala",
  "mage": "mage",
  "templar": "temp",
  "druid": "druid",
  "blade-dancer": "bd",
  "warden": "warden",
  "ranger": "ranger",
  "beast-master": "bm",
  "barbarian": "barb",
  "rogue": "rogue",
  "hunter": "hunter",
  "chieftain": "chief",
  "shaman": "shaman",
  "death-knight": "dk",
  "necromancer": "necro",
  "warlock": "warlock",
  "charmer": "charm",
  "reaper": "reap",
};

async function copyGifAssets() {
  const gifBaseDir = path.join(process.cwd(), 'public', 'gif');
  const classImageBaseDir = path.join(process.cwd(), 'public', 'image', 'classes');

  for (const className of Object.keys(CLASS_FACTION_INFO_MAP)) {
    const slugifiedClassName = slugify(className);
    const gifShortName = CLASS_SLUG_TO_GIF_SHORT_NAME_MAP[slugifiedClassName];

    if (!gifShortName) {
      console.warn(`No GIF shorthand mapping found for class: ${className} (slug: ${slugifiedClassName}). Skipping.`);
      continue;
    }

    const sourceGifPath = path.join(gifBaseDir, gifShortName);
    const destinationClassPath = path.join(classImageBaseDir, slugifiedClassName);

    if (!fs.existsSync(sourceGifPath)) {
      console.warn(`Source GIF folder not found for ${className} at: ${sourceGifPath}. Skipping.`);
      continue;
    }

    if (!fs.existsSync(destinationClassPath)) {
      console.warn(`Destination class folder not found for ${className} at: ${destinationClassPath}. This should not happen if create_class_folders.ts ran successfully. Skipping.`);
      continue;
    }

    try {
      const files = fs.readdirSync(sourceGifPath);
      if (files.length === 0) {
        console.log(`No GIF files found in ${sourceGifPath}. Skipping copy for ${className}.`);
        continue;
      }

      console.log(`Copying GIFs for ${className} from ${sourceGifPath} to ${destinationClassPath}`);
      for (const file of files) {
        const sourceFilePath = path.join(sourceGifPath, file);
        const destinationFilePath = path.join(destinationClassPath, file);
        fs.copyFileSync(sourceFilePath, destinationFilePath);
        console.log(`  Copied: ${file}`);
      }
      console.log(`Finished copying for ${className}.`);
    } catch (error) {
      console.error(`Error copying GIFs for ${className}:`, error);
    }
  }
  console.log('All GIF assets processing complete.');
}

copyGifAssets();
