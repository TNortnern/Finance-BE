module.exports = ({ env }) => ({
  upload: {
    provider: "aws-s3",
    providerOptions: {
      region_name: env("REGION_NAME"),
      endpoint: `${env("REGION_NAME")}.digitaloceanspaces.com`,
      accessKeyId: env("ACCESS_KEY"),
      secretAccessKey: env("ACCESS_SECRET"),
      params: {
        Bucket: env("BUCKET_NAME"),
      },
    },
  },
  email: {
    provider: "sendgrid",
    providerOptions: {
      apiKey: env("SENDGRID_API_KEY"),
    },
    settings: {
      defaultFrom: env("EMAIL_FROM"),
      defaultReplyTo: env("EMAIL_FROM"),
    },
  },
});
