import chalk = require('chalk');
import { execSync } from 'child_process';
import { existsSync } from 'fs';

// Get latest version from https://github.com/pact-foundation/pact-ruby-standalone/releases
export const PACT_STANDALONE_VERSION = '4.0.0';

function makeError(msg: string): Error {
  return new Error(chalk.red(`Error while locating pact binary: ${msg}`));
}

export function createConfig(): Config {
  return {
    binaries: [
      ['win32', 'x64', 'windows', 'x64', 'zip'],
      ['darwin', 'arm64', 'osx', 'arm64', 'tar.gz'],
      ['darwin', 'x64', 'osx', 'x86_64', 'tar.gz'],
      ['linux', 'arm64', 'linux', 'arm64', 'tar.gz'],
      ['linux', 'x64', 'linux', 'x64', 'tar.gz'],
    ].map(([platform, arch, downloadPlatform, downloadArch, extension]) => {
      let isMusl = false;
      if (platform === 'linux') {
        const normalisedArch = arch === 'arm64' ? 'aarch64' : 'x86_64';
        if (existsSync(`/lib/ld-musl-${normalisedArch}.so.1`)) {
          isMusl = /musl/.test(execSync('ldd /bin/sh').toString());
          // eslint-disable-next-line no-param-reassign
          downloadPlatform = isMusl
            ? `${downloadPlatform}-musl`
            : downloadPlatform;
        }
      }

      const binary = `pact-${PACT_STANDALONE_VERSION}-${downloadPlatform}-${downloadArch}.${extension}`;
      return {
        platform,
        arch,
        binary,
        binaryChecksum: `${binary}.checksum`,
        folderName: `${
          // eslint-disable-next-line no-nested-ternary
          platform === 'win32'
            ? 'windows'
            : isMusl && platform === 'linux'
            ? `${platform}-musl`
            : platform
        }-${arch}-${PACT_STANDALONE_VERSION}`,
      };
    }),
  };
}

const CONFIG = createConfig();

export function getBinaryEntry(
  platform: string = process.platform,
  arch: string = process.arch
): BinaryEntry {
  const found = CONFIG.binaries.find(
    (value) =>
      value.platform === platform && (value.arch ? value.arch === arch : true)
  );
  if (found === undefined) {
    throw makeError(
      `Cannot find binary for platform '${platform}' with architecture '${arch}'.`
    );
  }
  return found;
}

export interface Config {
  binaries: BinaryEntry[];
}

export interface BinaryEntry {
  platform: string;
  arch?: string;
  binary: string;
  binaryChecksum: string;
  folderName: string;
}
