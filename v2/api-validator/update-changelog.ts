/**
 * Appends recent git commits to the Unreleased section of CHANGELOG.md.
 * Skips commits whose short hash already appears in the changelog.
 * Changelog format: version line (e.g. Unreleased / v0.9.11), date line (UTC), then content.
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const REPO_ROOT = path.resolve(__dirname, '../..');
const CHANGELOG_PATH = path.join(REPO_ROOT, 'CHANGELOG.md');

const VERSION_UNRELEASED = 'Unreleased';
const MAX_COMMITS = 50;

function getCommitsSinceLastTag(): { hash: string; subject: string }[] {
  try {
    const out = execSync(
      `git log -n ${MAX_COMMITS} --pretty=format:"%h %s"`,
      { cwd: REPO_ROOT, encoding: 'utf-8' }
    );
    return out
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const space = line.indexOf(' ');
        const hash = space >= 0 ? line.slice(0, space) : line;
        const subject = space >= 0 ? line.slice(space + 1).trim() : '';
        return { hash, subject };
      });
  } catch {
    return [];
  }
}

function getHashesAlreadyInChangelog(content: string): Set<string> {
  const hashes = new Set<string>();
  const re = /\(([a-f0-9]{7,})\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    hashes.add(m[1].slice(0, 7));
  }
  return hashes;
}

function main(): void {
  const content = readFileSync(CHANGELOG_PATH, 'utf-8');
  const existingHashes = getHashesAlreadyInChangelog(content);
  const commits = getCommitsSinceLastTag();
  const newLines: string[] = [];
  for (const { hash, subject } of commits) {
    const shortHash = hash.slice(0, 7);
    if (existingHashes.has(shortHash)) continue;
    newLines.push(`- ${subject} (${shortHash})`);
  }
  if (newLines.length === 0) return;

  const unreleasedIdx = content.indexOf(VERSION_UNRELEASED);
  if (unreleasedIdx === -1) return;

  // Find end of Unreleased section: next version header (vX.Y.Z) or end of file
  const afterHeader = content.indexOf('\n', unreleasedIdx) + 1;
  const rest = content.slice(afterHeader);
  const nextVersionMatch = rest.match(/\n(v\d+\.\d+\.\d+)/);
  const endOfUnreleased =
    afterHeader +
    (nextVersionMatch ? nextVersionMatch.index! : rest.length);

  const insert =
    (content.slice(0, endOfUnreleased).trimEnd().endsWith('\n\n') ? '' : '\n') +
    newLines.join('\n');
  const newContent =
    content.slice(0, endOfUnreleased) + insert + content.slice(endOfUnreleased);
  writeFileSync(CHANGELOG_PATH, newContent);
}

main();
