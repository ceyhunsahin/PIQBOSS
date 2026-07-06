import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

function findLocalJdk17()
{
  const jdksDir = path.join(homedir(), '.gradle', 'jdks');
  if(!existsSync(jdksDir))
  {
    return null;
  }

  const candidates = readdirSync(jdksDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => /17/.test(name))
    .map((name) => path.join(jdksDir, name));

  for(const candidate of candidates)
  {
    const javaExe = path.join(candidate, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
    if(existsSync(javaExe))
    {
      return candidate;
    }
  }
  return null;
}

const task = process.argv[2];
if(!task)
{
  console.error('Usage: node scripts/run-gradle.mjs <gradleTask>');
  process.exit(1);
}

const androidDir = path.resolve(process.cwd(), 'android');
const gradleWrapper = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const jdk17 = findLocalJdk17();

const args = [task];
if(jdk17)
{
  args.push(`-Dorg.gradle.java.home=${jdk17}`);
  args.push('-Dorg.gradle.java.installations.auto-download=false');
}

const child = spawn(gradleWrapper, args, {
  cwd: androidDir,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('exit', (code) =>
{
  process.exit(code ?? 1);
});
