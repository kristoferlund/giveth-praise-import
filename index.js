import { parse, stringify } from 'csv/sync';
import fs from 'fs';


const discordIdCsv = fs.readFileSync('giveth_discord_ids.csv', 'utf8');
const praiseCsv = fs.readFileSync('giveth_praise.csv', 'utf8');
const channelIdsCsv = fs.readFileSync('giveth_channel_ids.csv', 'utf8');
const oldUSerToNewUserCsv = fs.readFileSync('giveth_old_user_to_new_user.csv', 'utf8');

const discordIds = parse(discordIdCsv);
const praise = parse(praiseCsv);
const channelIds = parse(channelIdsCsv);
const oldUSerToNewUserList = parse(oldUSerToNewUserCsv);

const usersNotFound = [];

const getDiscordUser = (username) => {
  let user = discordIds.find((discordId) => discordId[1] === username);
  if (!user) {
    let oldUSerToNewUser = oldUSerToNewUserList.find((u) => u[0] === username);
    if (oldUSerToNewUser) {
      user = discordIds.find((discordId) => discordId[1] === oldUSerToNewUser[1]); 
    }
    if(!user) {
      usersNotFound.push({username});
      return null;
    }
  };
  return {
    accountId: user[0],
    name: user[1],
    avatarId: user[3],
    platform: "DISCORD"
  }
}

const channelsNotFound = [];

const getSourceId = (item) => {
  let channelId = "823570903219568700"; // default to praise channel
  const channel = channelIds.find((channelId) => {
    return channelId[0] === item[5];
  });
  if (channel) {
    channelId = channel[1];
  } else {
    channelsNotFound.push({channel: item[5]});
  }
  return `DISCORD:679428761438912522:${channelId}`;
}

const getSourceName = (item) => {
  let channelName = "💜┋praise"; // default to praise channel
  const channel = channelIds.find((channelId) => {
    return channelId[0] === item[5];
  });
  if (channel) {
    channelName = channel[0];
  } 
  return encodeURIComponent(`DISCORD:Giveth:${channelName}`);
}

const importList = [];
const importFailList = [];
for (let i = 1; i < praise.length; i++) {
  const item = praise[i];
  const createdAt = new Date(item[4]);
  const giver = getDiscordUser(item[1]);
  const receiver = getDiscordUser(item[0]);
  const reason = item[2];
  const sourceId = getSourceId(item);
  const sourceName = getSourceName(item);

  const importItem = {
    giver,
    receiver,
    reason,
    sourceId,
    sourceName,
    createdAt
  };
  if (giver && receiver) {
    importList.push(importItem);
  } else {
    importItem.giverRaw = item[1];
    importItem.receiverRaw = item[0];
    importFailList.push(importItem);
  }
}

fs.writeFileSync('output/import.json', JSON.stringify(importList, null, 2));
console.log("Number of praise items processed: ", importList.length);

fs.writeFileSync('output/importFail.json', JSON.stringify(importFailList, null, 2));
console.log("❌ Number of failed praise items: ", importFailList.length);

const uniqueUsersNotFound = [...new Map(usersNotFound.map(user => [user["username"], user])).values()];
fs.writeFileSync('output/usersNotFound.csv', stringify(uniqueUsersNotFound, {header: true}));

console.log("Number of users not found: ", uniqueUsersNotFound.length);

const uniqueChannelsNotFound = [...new Map(channelsNotFound.map(channel => [channel["channel"], channel])).values()];
fs.writeFileSync('output/channelsNotFound.csv', stringify(uniqueChannelsNotFound, {header: true}));

console.log("Number of channels not found: ", uniqueChannelsNotFound.length);