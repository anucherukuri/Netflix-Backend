
import sgMail from "@sendgrid/mail";
import { emailTemplate} from '../file/emailTemplate.js'

const { SENDGRID_API_KEY, SENGRID_EMAIL } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const defaultParams = {
  from: SENGRID_EMAIL,
};

export const sendEmail = async () => {
  try {
    const msg = {
      ...defaultParams,
      to:'onlyrajib@gmail.com',
      subject: "Your article has been published.",
      html: emailTemplate(),
    };
    console.log(msg);
    const sengridResponse = await sgMail.send(msg);
    console.log(sengridResponse);
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};