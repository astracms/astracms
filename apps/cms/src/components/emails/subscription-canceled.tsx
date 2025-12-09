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

type SubscriptionCanceledEmailProps = {
  userEmail: string;
  planName: string;
  workspaceName: string;
  accessEndDate: string;
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

export const SubscriptionCanceledEmail = ({
  userEmail,
  planName,
  workspaceName,
  accessEndDate,
}: SubscriptionCanceledEmailProps) => {
  const previewText = `Your ${planName} subscription has been canceled`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
            <Section className="mt-[32px]">
              <Img
                alt="Astra Logo"
                className="mx-auto"
                height="48"
                src={`${baseUrl}/icon.png`}
                width="48"
              />
            </Section>

            <Heading className="my-6 text-center font-bold text-2xl text-black">
              Subscription Canceled
            </Heading>

            <Text className="text-center text-base text-gray-700 leading-relaxed">
              Your <strong>{planName}</strong> subscription for{" "}
              <strong>{workspaceName}</strong> has been canceled.
            </Text>

            <Section className="my-6 rounded-lg bg-yellow-50 p-4">
              <Text className="m-0 text-center text-gray-700 text-sm">
                You'll continue to have access until{" "}
                <strong>{accessEndDate}</strong>
              </Text>
            </Section>

            <Text className="text-center text-gray-600 text-sm">
              Changed your mind? You can resubscribe anytime from your billing
              settings.
            </Text>

            <Section className="my-8 text-center">
              <Button
                className="rounded-lg bg-[#5B4FCC] px-6 py-3 font-semibold text-sm text-white"
                href={`${baseUrl}/settings/billing`}
              >
                Manage Billing
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
