import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import SignupFeaturesCard from "@/components/auth/signup-features-card";
import AstraIcon from "@/components/icons/astra";
import Credits from "@/components/util/credits";
import { SITE_CONFIG } from "@/utils/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: "Sign Up - Astra CMS",
  alternates: {
    canonical: "/register",
  },
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RegisterPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const from = searchParams.from;

  return (
    <div className="h-screen w-full md:grid md:grid-cols-2">
      <SignupFeaturesCard />
      <section className="flex h-full flex-col items-center justify-between p-4">
        <div className="self-start">
          <h1 className="sr-only font-semibold uppercase">Astra</h1>
        </div>
        <div className="flex min-w-[300px] flex-col gap-8 rounded-md p-6 lg:w-[384px] lg:px-8 lg:py-10">
          <div className="text-center">
            <h1 className="font-semibold text-xl lg:text-2xl">
              Create Account
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign up to get started.
            </p>
          </div>

          <Suspense>
            <RegisterForm />
          </Suspense>

          <p className="px-8 text-center text-muted-foreground text-xs">
            Already have an account?{" "}
            <Link
              className="underline underline-offset-4 hover:text-primary"
              href={from && from !== "/" ? `/login?from=${from}` : "/login"}
            >
              Login
            </Link>
          </p>
        </div>
        <div>
          <p className="px-8 text-center text-muted-foreground text-xs">
            By continuing, you agree to our{" "}
            <Link
              className="underline underline-offset-4 hover:text-primary"
              href="https://astracms.dev/terms"
              target="_blank"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              className="underline underline-offset-4 hover:text-primary"
              href="https://astracms.dev/privacy"
              target="_blank"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
