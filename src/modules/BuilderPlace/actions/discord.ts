import { getBuilderPlaceById, getDiscordWebhookByBuilderPlaceId } from "./builderPlace";

export const sendWelcomeMessage = async (builderPlaceId: string, newWebhookUrl: string) => {
  const webhookUrl = await getDiscordWebhookByBuilderPlaceId(builderPlaceId)
  console.log(webhookUrl, newWebhookUrl, "ah")

  if (webhookUrl === newWebhookUrl) return;
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