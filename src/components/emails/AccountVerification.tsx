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
import { domain } from "~/utils/constants";

export const accountVerificationPlainText = (name: string, token: string) => {
  return `
  Hello ${name}!
  
  Please click the link below to verify your account and complete
  your signup process.

  Verify Your Account [${domain}/account-verification/${token}]

  Sloopy © 2023
  `;
};

interface AccountVerificationProps {
  name: string;
  token: string;
}

const AccountVerification: React.FC<AccountVerificationProps> = ({
  name,
  token,
}) => {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>{`Sloopy - ${name}'s Account Verification`}</Preview>
        <Body className="m-auto bg-white py-10">
          <Container className="w-11/12 rounded-md border border-solid border-gray-300 px-4 pt-6">
            <Section>
              <Row className="mb-4 border-b border-solid border-gray-300 pb-4">
                <Column align="left">
                  <Img
                    src={`${domain}/logo.png`}
                    alt="Sloopy"
                    className="w-1/2"
                  />
                </Column>
              </Row>
            </Section>
            <Section className="mb-6 h-full text-base sm:text-lg">
              <Text className="text-xl font-semibold text-black sm:text-2xl">
                {`Hello ${name}!`}
              </Text>
              <Text className="mb-6 text-black">
                Please click the link below to verify your account and complete
                your signup process.
              </Text>
              <Row>
                <Column align="center">
                  <Button
                    className="rounded-md bg-black p-4 font-semibold text-white"
                    href={`${domain}/account-verification/${token}`}
                  >
                    Verify Your Account
                  </Button>
                </Column>
              </Row>
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

export default AccountVerification;
