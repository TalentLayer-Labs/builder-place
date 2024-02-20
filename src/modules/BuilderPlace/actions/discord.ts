import { getAllowedTokenList } from "../../../queries/global";
import { IToken } from "../../../types";
import { ZERO_ADDRESS } from "../../../utils/constant";
import { parseRateAmount } from "../../../utils/currency";
import { readFromIPFS } from "../../../utils/ipfs";
import { truncate } from "../../Messaging/utils/messaging";
import { getBuilderPlaceById, getDiscordWebhookDetailsByBuilderPlaceId } from "./builderPlace";

export const removeMarkdown = (markdownString: string) => {
  // Remove headings (##, ###, ####, etc.)
  markdownString = markdownString.replace(/#{1,6}\s/g, '');

  // Remove emphasis (*) and bold (**)
  markdownString = markdownString.replace(/[*]{1,2}/g, '');

  // Remove code blocks (```)
  markdownString = markdownString.replace(/`{3}.*`{3}/g, '');

  // Remove inline code (`)
  markdownString = markdownString.replace(/`{1}.*`{1}/g, '');

  // Remove links ([...](...))
  markdownString = markdownString.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

  // Remove images (![...](...))
  markdownString = markdownString.replace(/!\[([^\]]+)\]\([^\)]+\)/g, '$1');

  return markdownString;
}

export const sendWelcomeMessage = async (builderPlaceId: string, newWebhookUrl: string) => {
  const webhookDetails = await getDiscordWebhookDetailsByBuilderPlaceId(builderPlaceId)
  console.log(webhookDetails, newWebhookUrl, "ah")

  if (webhookDetails?.discordWebhook === newWebhookUrl) return;
  console.log("sendit", newWebhookUrl, "ah")

  const embed = {
    title: 'Congratulations!',
    description: 'BuilderPlace notification is set up. I will notify you here for each new service created!',
    color: 0x00ff00,
    author: {
      name: 'BuilderPlace',
      icon_url: 'https://builder.place/logo.png',
    },
  };

  const payload = {
    content: ' ', // Empty content to trigger the embed
    embeds: [embed],
  };

  fetch(newWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (response.ok) {
        console.log('Message sent successfully!');
      } else {
        console.error('Error sending message:', response.statusText);
      }
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });
}


export const sendNewServiceNotification = async (builderPlaceId: string, serviceId: string, cid: string) => {
  const service: { title: string, about: string, keywords: string, rateToken: string, rateAmount: string } = await readFromIPFS(cid);
  const webhookDetails = await getDiscordWebhookDetailsByBuilderPlaceId(builderPlaceId);

  if (!webhookDetails?.discordWebhook) return;

  const builderPlaceUrl = webhookDetails.customDomain ? webhookDetails.customDomain : webhookDetails.subdomain;

  let allowedTokens: IToken[] = []
  const allowedTokensResponse = await getAllowedTokenList(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as unknown as number);
  if (allowedTokensResponse?.data?.data?.tokens) {
    allowedTokens = allowedTokensResponse?.data?.data?.tokens
  }
  else {
    return;
  }

  const token: IToken | undefined = allowedTokens.find(token => token.address === service.rateToken);
  if (!token) return;

  const embed = {
    title: service.title,
    description: "New gig, hot and ready for proposals!",
    color: 2326507,
    fields: [
      {
        name: "Description",
        value: removeMarkdown(truncate(service.about, 420)),
        inline: false
      },
      {
        name: "Budget",
        value: `${(Number(service.rateAmount) / Math.pow(10, token.decimals)).toString()} ${token.symbol}`,
        inline: false
      }
    ],
    author: {
      name: webhookDetails.name,
      url: "https://builder.place",
      icon_url: webhookDetails.icon ? webhookDetails.icon : ""
    },
    url: `https://${builderPlaceUrl}`,
    // footer: { This footer could be used if the platform is on freetier. 
    //   text: "Send from BuilderPlace",
    //   icon_url: "https://builder.place/icon"
    // },
  };

  const payload = {
    content: ' ', // Empty content needed to trigger the embed
    username: "BuilderPlace",
    avatar_url: "https://builder.place/logo.png",
    embeds: [embed],
  };

  fetch(webhookDetails?.discordWebhook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (response.ok) {
        console.log('Message sent successfully!');
      } else {
        console.error('Error sending message:', response.statusText);
      }
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });
}


