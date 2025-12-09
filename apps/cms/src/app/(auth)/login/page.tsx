import { Separator } from "@astra/ui/components/separator";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import FeaturesCard from "@/components/auth/features-card";
import { LoginForm } from "@/components/auth/login-form";
import AstraIcon from "@/components/icons/astra";
import Credits from "@/components/util/credits";
import { SITE_CONFIG } from "@/utils/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: "Log In - AstraCMS",
  alternates: {
    canonical: "/login",
  },
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const from = searchParams.from;

  return (
    <div className="h-screen w-full md:grid md:grid-cols-2">
      {/*<section className="relative hidden flex-col justify-between overflow-hidden p-10 md:flex">
        <Image
          alt="Light astra texture background"
          className="object-cover object-center dark:hidden"
          fill
          loading="lazy"
          quality={100}
          src="/textures/astra-light.avif"
          unoptimized
        />
        <Image
          alt="Dark astra texture background"
          className="hidden object-cover object-center dark:block"
          fill
          loading="lazy"
          quality={100}
          src="/textures/astra-dark.avif"
          unoptimized
        />
      </section>*/}
      <FeaturesCard />
      <section className="flex h-full flex-col items-center justify-between p-4">
        <div className="self-start">
          <h1 className="sr-only font-semibold uppercase">AstraCMS</h1>
        </div>
        <div className="flex min-w-[300px] flex-col gap-8 rounded-md p-6 lg:w-[384px] lg:px-8 lg:py-10">
          <div className="text-center">
            <h1 className="font-semibold text-xl lg:text-2xl">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Please sign-in to continue.
            </p>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>

          <div className="flex flex-col gap-4 px-8 text-center text-muted-foreground text-xs">
            <p>
              Forgot your password?{" "}
              <Link
                className="underline underline-offset-4 hover:text-primary"
                href={
                  from && from !== "/reset" ? `/reset?from=${from}` : "/reset"
                }
              >
                Reset Your Password
              </Link>
            </p>

            <Separator />

            <p>
              Don&apos;t have an account?{" "}
              <Link
                className="underline underline-offset-4 hover:text-primary"
                href={
                  from && from !== "/" ? `/register?from=${from}` : "/register"
                }
              >
                Register
              </Link>
            </p>
          </div>
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
