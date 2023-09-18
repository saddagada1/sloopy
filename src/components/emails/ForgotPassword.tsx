import {
  Body,
  Button,
  Container,
  Column,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  Head,
  Img,
} from "@react-email/components";
import { domain, primaryColour, secondaryColour } from "~/utils/constants";

export const forgotPasswordPlainText = (name: string, token: string) => {
  return `
    Hello ${name}!
    
    Someone recently requested a password change for your Sloopy account. If this was you, 
    you can set a new password below.
  
    Reset Password [${domain}/reset-password/${token}]
  
    If you don't want to change your password or didn't request this, 
    just ignore and delete this message.

    Sloopy © 2023
    `;
};

interface ForgotPasswordProps {
  name: string;
  token: string;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ name, token }) => {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>{`Sloopy - ${name}'s Password Reset Link`}</Preview>
        <Body
          style={{ backgroundColor: primaryColour, color: secondaryColour }}
          className="m-auto py-10"
        >
          <Container className="w-11/12 rounded-md border border-solid border-gray-300 px-4 pt-6">
            <Section>
              <Row className="mb-4 border-b border-solid border-gray-300 pb-4">
                <Column align="left">
                  <Img
                    src={`${domain}/logo.png`}
                    alt="Sloopy"
                    className="w-2/3"
                  />
                </Column>
              </Row>
            </Section>
            <Section className="mb-6 h-full text-base sm:text-lg">
              <Text className="text-xl font-semibold sm:text-2xl">
                {`Hello ${name}!`}
              </Text>
              <Text className="mb-6">
                {`Someone recently requested a password change for your Sloopy account. If this was you, 
                you can set a new password below.`}
              </Text>
              <Row>
                <Column align="center">
                  <Button
                    className="rounded-md bg-black p-4 font-semibold text-white"
                    href={`${domain}/reset-password/${token}`}
                  >
                    Reset Password
                  </Button>
                </Column>
              </Row>
              <Text className="mb-6">
                {`If you don't want to change your password or didn't request this, 
                just ignore and delete this message.`}
              </Text>
            </Section>
            <Row>
              <Column align="right">
                <Text className="text-xs text-gray-400 sm:text-sm">
                  Sloopy &copy; 2023
                </Text>
              </Column>
            </Row>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default ForgotPassword;
