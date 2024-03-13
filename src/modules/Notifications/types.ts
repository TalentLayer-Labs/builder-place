export interface EmbedField {
  name: string;
  value: string;
  inline: boolean;
}

export interface EmbedAuthor {
  name: string;
  url: string;
  icon_url: string;
}

export interface Embed {
  title: string;
  description: string;
  color: number;
  fields: EmbedField[] | null;
  author: EmbedAuthor;
  url: string;
}
