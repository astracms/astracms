import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type SubscriptionRenewedEmailProps = {
  userEmail: string;
  planName: string;
  workspaceName: string;
  periodStart: string;
  periodEnd: string;
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

export const SubscriptionRenewedEmail = ({
  userEmail,
  planName,
  workspaceName,
  periodStart,
  periodEnd,
}: SubscriptionRenewedEmailProps) => {
  const previewText = `Your ${planName} subscription has been renewed`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
            <Section className="mt-[32px]">
              <Img
                alt="AstraCMS Logo"
                className="mx-auto"
                height="48"
                src={`${baseUrl}/icon.png`}
                width="48"
              />
            </Section>

            <Heading className="my-6 text-center font-bold text-2xl text-black">
              ✅ Subscription Renewed
            </Heading>

            <Text className="text-center text-base text-gray-700 leading-relaxed">
              Your <strong>{planName}</strong> subscription for{" "}
              <strong>{workspaceName}</strong> has been successfully renewed.
            </Text>

            <Section className="my-6 rounded-lg bg-green-50 p-4">
              <Text className="m-0 text-gray-600 text-sm">
                <strong>Plan:</strong> {planName}
              </Text>
              <Text className="m-0 text-gray-600 text-sm">
                <strong>New Billing Period:</strong> {periodStart} - {periodEnd}
              </Text>
            </Section>

            <Section className="my-8 text-center">
              <Button
                className="rounded-lg bg-[#5B4FCC] px-6 py-3 font-semibold text-sm text-white"
                href={baseUrl}
              >
                Go to Dashboard
              </Button>
            </Section>

            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This email was sent to{" "}
              <span className="text-black">{userEmail}</span>. If you have
              questions, contact support@astracms.dev.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
