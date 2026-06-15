import { Amplify, Auth } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import outputs from '../amplify_outputs.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Amplify.configure(outputs);

const ADMIN_USERNAME = process.env.TWITCH_BACKFILL_USERNAME;
const ADMIN_PASSWORD = process.env.TWITCH_BACKFILL_PASSWORD;

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function signIn() {
  requireEnv('TWITCH_BACKFILL_USERNAME', ADMIN_USERNAME);
  requireEnv('TWITCH_BACKFILL_PASSWORD', ADMIN_PASSWORD);

  console.log('Signing in as admin user...');
  await Auth.signIn(ADMIN_USERNAME, ADMIN_PASSWORD);
  console.log('Signed in successfully.');
}

function normalizeLegacyCommand(command) {
  return {
    ...command,
    category: command.category || 'Custom',
    permissionLevel: command.permissionLevel || 'everyone',
  };
}

async function fetchAllCommands(client) {
  const allCommands = [];
  let nextToken = undefined;

  do {
    const request = nextToken ? { nextToken } : {};
    const response = await client.models.TwitchCommand.list(request);

    if (response?.errors?.length) {
      throw new Error(`GraphQL list error: ${JSON.stringify(response.errors)}`);
    }

    allCommands.push(...(response.data || []));
    nextToken = response.nextToken;
  } while (nextToken);

  return allCommands;
}

async function main() {
  await signIn();
  const client = generateClient();

  console.log('Fetching TwitchCommand records...');
  const commands = await fetchAllCommands(client);
  console.log(`Found ${commands.length} TwitchCommand records.`);

  let fixedCount = 0;
  for (const command of commands) {
    if (command.category && command.permissionLevel) {
      continue;
    }

    const normalized = normalizeLegacyCommand(command);
    console.log(`Backfilling command ${command.id}: category=${normalized.category}, permissionLevel=${normalized.permissionLevel}`);

    const updateResponse = await client.models.TwitchCommand.update({
      id: command.id,
      streamerId: normalized.streamerId,
      name: normalized.name,
      reply: normalized.reply,
      enabled: normalized.enabled,
      cooldownSeconds: normalized.cooldownSeconds,
      isCustom: normalized.isCustom,
      category: normalized.category,
      permissionLevel: normalized.permissionLevel,
    });

    if (updateResponse?.errors?.length) {
      console.error('Failed to backfill command:', updateResponse.errors);
      continue;
    }

    fixedCount += 1;
  }

  console.log(`Backfill complete. Updated ${fixedCount} records.`);
}

main().catch(error => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
