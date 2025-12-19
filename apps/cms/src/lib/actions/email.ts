"use server";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { InviteUserEmail } from "@/components/emails/invite";
import { ResetPasswordEmail } from "@/components/emails/reset";
import { SubscriptionCanceledEmail } from "@/components/emails/subscription-canceled";
import { SubscriptionCreatedEmail } from "@/components/emails/subscription-created";
import { SubscriptionRenewedEmail } from "@/components/emails/subscription-renewed";
import { VerifyUserEmail } from "@/components/emails/verify";
import { WelcomeEmail } from "@/components/emails/welcome";
import { sendDevEmail } from "@/lib/email";
import { getServerSession } from "../auth/session";

const resendApiKey = process.env.RESEND_API_KEY;
const resendAudienceId = process.env.RESEND_AUDIENCE_ID;
const isDevelopment = process.env.NODE_ENV === "development";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

type SendInviteEmailProps = {
  inviteeEmail: string;
  inviteeUsername?: string;
  inviterName: string;
  inviterEmail: string;
  workspaceName: string;
  inviteLink: string;
  teamLogo?: string | null;
};

export async function sendInviteEmailAction({
  inviteeEmail,
  inviterName,
  inviterEmail,
  workspaceName,
  inviteLink,
  teamLogo,
}: SendInviteEmailProps) {
  if (!resend && isDevelopment) {
    return sendDevEmail({
      from: "AstraCMS <emails@mail.astracms.dev>",
      to: inviteeEmail,
      subject: `Join ${workspaceName} on AstraCMS`,
      text: "This is a mock invite email",
      _mockContext: {
        type: "invite",
        data: {
          inviteeEmail,
          inviterName,
          inviterEmail,
          workspaceName,
          inviteLink,
          teamLogo: teamLogo || "default",
        },
      },
    });
  }

  const session = await getServerSession();

  if (!session) {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 401 }
    );
  }

  if (!resend) {
    throw new Error("Resend API key not set");
  }

  try {
    const response = await resend.emails.send({
      from: "AstraCMS <emails@mail.astracms.dev>",
      to: inviteeEmail,
      subject: `Join ${workspaceName} on AstraCMS`,
      react: InviteUserEmail({
        inviteeEmail,
        invitedByUsername: inviterName,
        invitedByEmail: inviterEmail,
        teamName: workspaceName,
        inviteLink,
        userImage: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${inviteeEmail}`,
        teamImage:
          teamLogo ||
          `https://api.dicebear.com/9.x/glass/svg?seed=${workspaceName}`,
      }),
    });

    console.log("Email sent successfully:", response);
    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Detailed error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error },
      { status: 500 }
    );
  }
}

export async function sendVerificationEmailAction({
  userEmail,
  otp,
  type,
}: {
  userEmail: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
}) {
  console.log("called verification email");

  if (!resend && isDevelopment) {
    return sendDevEmail({
      from: "Verification <emails@mail.astracms.dev>",
      to: userEmail,
      text: "This is a mock verification email",
      subject: "Verify your email address",
      _mockContext: {
        type: "verification",
        data: { userEmail, otp, verificationType: type },
      },
    });
  }

  if (!resend) {
    throw new Error("Resend API key not set");
  }

  try {
    await resend.emails.send({
      from: "Verification <emails@mail.astracms.dev>",
      to: userEmail,
      subject: "Verify your email address",
      react: VerifyUserEmail({
        userEmail,
        otp,
        type,
      }),
    });

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Detailed error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error },
      { status: 500 }
    );
  }
}

export async function sendResetPasswordAction({
  userEmail,
  resetLink,
}: {
  userEmail: string;
  resetLink: string;
}) {
  if (!resend && isDevelopment) {
    return sendDevEmail({
      from: "AstraCMS <emails@mail.astracms.dev>",
      to: userEmail,
      text: "This is a mock reset password email",
      subject: "Reset Your Password",
      _mockContext: { type: "reset", data: { userEmail, resetLink } },
    });
  }

  if (!resend) {
    throw new Error("Resend API key not set");
  }

  try {
    const response = await resend.emails.send({
      from: "AstraCMS <emails@mail.astracms.dev>",
      to: userEmail,
      subject: "Reset Your Password",
      react: ResetPasswordEmail({
        userEmail,
        resetLink,
      }),
    });

    console.log("Email sent successfully:", response);
    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Detailed error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error },
      { status: 500 }
    );
  }
}

export async function sendWelcomeEmailAction({
  userEmail,
  userName,
}: {
  userEmail: string;
  userName?: string;
}) {
  if (!resend && isDevelopment) {
    return sendDevEmail({
      from: "AstraCMS <emails@mail.astracms.dev>",
      to: userEmail,
      text: "This is a mock welcome email",
      subject: "Welcome to AstraCMS!",
      _mockContext: { type: "welcome", data: { userEmail } },
    });
  }

  if (!resend) {
    throw new Error("Resend API key not set");
  }

  try {
    // Send welcome email
    await resend.emails.send({
      from: "AstraCMS <emails@mail.astracms.dev>",
      to: userEmail,
      subject: "Welcome to AstraCMS!",
      react: WelcomeEmail({
        userEmail,
      }),
    });

    // Add user to Resend audience list
    if (resendAudienceId) {
      await addToResendAudience(userEmail, userName);
    }

    return { message: "Email sent successfully" };
  } catch (error) {
    console.error("Detailed error sending email:", error);
    return { error: "Failed to send email", details: error };
  }
}

/**
 * Add a user to the Resend audience list
 */
export async function addToResendAudience(email: string, firstName?: string) {
  if (!resend) {
    console.warn("Resend API key not set, skipping audience addition");
    return null;
  }

  if (!resendAudienceId) {
    console.warn("Resend audience ID not set, skipping audience addition");
    return null;
  }

  try {
    const { data, error } = await resend.contacts.create({
      audienceId: resendAudienceId,
      email,
      firstName,
      unsubscribed: false,
    });

    if (error) {
      console.error("Error adding contact to Resend audience:", error);
      return null;
    }

    console.log("Successfully added contact to Resend audience:", data);
    return data;
  } catch (error) {
    console.error("Failed to add contact to Resend audience:", error);
    return null;
  }
}

type SendSubscriptionCreatedEmailProps = {
  userEmail: string;
  planName: string;
  workspaceName: string;
  periodStart: string;
  periodEnd: string;
};

export async function sendSubscriptionCreatedEmailAction({
  userEmail,
  planName,
  workspaceName,
  periodStart,
  periodEnd,
}: SendSubscriptionCreatedEmailProps) {
  if (!resend && isDevelopment) {
    return sendDevEmail({
      from: "AstraCMS <emails@mail.astracms.dev>",
      to: userEmail,
      subject: `Your ${planName} subscription is now active!`,
      text: "This is a mock subscription created email",
      _mockContext: {
        type: "welcome",
        data: { userEmail, planName, workspaceName, periodStart, periodEnd },
      },
    });
  }

  if (!resend) {
    throw new Error("Resend API key not set");
  }

  try {
    await resend.emails.send({
      from: "AstraCMS <emails@mail.astracms.dev>",
      to: userEmail,
      subject: `Your ${planName} subscription is now active!`,
      react: SubscriptionCreatedEmail({
        userEmail,
        planName,
        workspaceName,
        periodStart,
        periodEnd,
      }),
    });

    return { message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending subscription created email:", error);
    return { error: "Failed to send email", details: error };
  }
}

type SendSubscriptionCanceledEmailProps = {
  userEmail: string;
  planName: string;
  workspaceName: string;
  accessEndDate: string;
};

export async function sendSubscriptionCanceledEmailAction({
  userEmail,
  planName,
  workspaceName,
  accessEndDate,
}: SendSubscriptionCanceledEmailProps) {
  if (!resend && isDevelopment) {
    return sendDevEmail({
      from: "AstraCMS <emails@mail.astracms.dev>",
      to: userEmail,
      subject: `Your ${planName} subscription has been canceled`,
      text: "This is a mock subscription canceled email",
      _mockContext: {
        type: "welcome",
        data: { userEmail, planName, workspaceName, accessEndDate },
      },
    });
  }

  if (!resend) {
    throw new Error("Resend API key not set");
  }

  try {
    await resend.emails.send({
      from: "AstraCMS <emails@mail.astracms.dev>",
      to: userEmail,
      subject: `Your ${planName} subscription has been canceled`,
      react: SubscriptionCanceledEmail({
        userEmail,
        planName,
        workspaceName,
        accessEndDate,
      }),
    });

    return { message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending subscription canceled email:", error);
    return { error: "Failed to send email", details: error };
  }
}

type SendSubscriptionRenewedEmailProps = {
  userEmail: string;
  planName: string;
  workspaceName: string;
  periodStart: string;
  periodEnd: string;
};

export async function sendSubscriptionRenewedEmailAction({
  userEmail,
  planName,
  workspaceName,
  periodStart,
  periodEnd,
}: SendSubscriptionRenewedEmailProps) {
  if (!resend && isDevelopment) {
    return sendDevEmail({
      from: "AstraCMS <emails@mail.astracms.dev>",
      to: userEmail,
      subject: `Your ${planName} subscription has been renewed`,
      text: "This is a mock subscription renewed email",
      _mockContext: {
        type: "welcome",
        data: { userEmail, planName, workspaceName, periodStart, periodEnd },
      },
    });
  }

  if (!resend) {
    throw new Error("Resend API key not set");
  }

  try {
    await resend.emails.send({
      from: "AstraCMS <emails@mail.astracms.dev>",
      to: userEmail,
      subject: `Your ${planName} subscription has been renewed`,
      react: SubscriptionRenewedEmail({
        userEmail,
        planName,
        workspaceName,
        periodStart,
        periodEnd,
      }),
    });

    return { message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending subscription renewed email:", error);
    return { error: "Failed to send email", details: error };
  }
}
