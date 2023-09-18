import { Resend } from "resend";
import AccountVerification, {
  accountVerificationPlainText,
} from "~/components/emails/AccountVerification";
import ForgotPassword, {
  forgotPasswordPlainText,
} from "~/components/emails/ForgotPassword";
import { env } from "~/env.mjs";

export const resend = new Resend(env.RESEND_API_KEY);

export const sendAccountVerificationEmail = async (
  name: string,
  email: string,
  token: string
) => {
  try {
    await resend.sendEmail({
      from: "Sloopy <accounts@sloopy.saivamsi.ca>",
      to: email,
      subject: "Sloopy - Account Verification",
      react: AccountVerification({
        name: name,
        token: token,
      }),
      text: accountVerificationPlainText(name, token),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const sendForgotPasswordEmail = async (
  name: string,
  email: string,
  token: string
) => {
  try {
    await resend.sendEmail({
      from: "Sloopy <accounts@sloopy.saivamsi.ca>",
      to: email,
      subject: "Sloopy - Forgot Password",
      react: ForgotPassword({
        name: name,
        token: token,
      }),
      text: forgotPasswordPlainText(name, token),
    });
    return true;
  } catch (error) {
    return false;
  }
};
