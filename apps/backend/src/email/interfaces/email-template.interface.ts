export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailTemplateData {
  user: {
    name: string;
    email: string;
  };
  [key: string]: any;
}