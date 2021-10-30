import * as fs from "fs";
import fetch from "node-fetch";
import * as path from "path";

const IGNORED_USERS = new Set([
  "dependabot[bot]",
  "eslint[bot]",
  "github-actions[bot]",
  "greenkeeper[bot]",
]);

const COMPLETELY_ARBITRARY_CONTRIBUTION_COUNT = 3;
const PAGE_LIMIT = 100;
const contributorsApiUrl = `https://api.github.com/osenco/mpesats/contributors?per_page=${PAGE_LIMIT}`;

interface Contributor {
  contributions: number;
  login: string;
  url: string;
}

interface AllContributorsUser {
  login: string;
  name: string;
  avatar_url: string;
  profile: string;
  contributions: string[];
}

interface User {
  login: string;
  name: string;
  avatar_url: string;
  profile: string;
  html_url: string;
}

async function* fetchUsers(page = 1): AsyncIterableIterator<Contributor[]> {
  let lastLength = 0;

  do {
    const response = await fetch(`${contributorsApiUrl}&page=${page}`, {
      method: "GET",
    });

    console.log({ response });

    const contributors = (await response.json()) as
      | Contributor[]
      | { message: string };

    if (!Array.isArray(contributors)) {
      throw new Error(`${contributors.message}`);
    }

    const thresholdContributors = contributors.filter(
      (user) => user.contributions >= COMPLETELY_ARBITRARY_CONTRIBUTION_COUNT
    );
    yield thresholdContributors;
    lastLength = thresholdContributors.length;
  } while (lastLength === PAGE_LIMIT);
}

async function main(): Promise<void> {
  const githubContributors: Contributor[] = [];

  for await (const latUsers of fetchUsers()) {
    githubContributors.push(...latUsers);
  }

  const users = await Promise.all(
    githubContributors.map(async (user) => {
      const response = await fetch(user.url, { method: "GET" });
      return (await response.json()) as User;
    })
  );

  const contributors = users
    // remove ignored users
    .filter((u) => !IGNORED_USERS.has(u.login))
    // fetch the in-depth information for each user
    .map<AllContributorsUser>((usr) => {
      return {
        login: usr.login,
        name: usr.name || usr.login,
        avatar_url: usr.avatar_url,
        profile: usr.html_url,
        contributions: [],
      };
    });

  // build + write the .all-contributorsrc
  const allContributorsConfig = {
    projectName: "mpesats",
    projectOwner: "osenco",
    repoType: "github",
    repoHost: "https://github.com",
    files: ["CONTRIBUTORS.md"],
    imageSize: 100,
    commit: false,
    contributors,
    contributorsPerLine: 5,
  };
  const rcPath = path.resolve(__dirname, "../.all-contributorsrc");
  fs.writeFileSync(rcPath, JSON.stringify(allContributorsConfig, null, 2));
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
