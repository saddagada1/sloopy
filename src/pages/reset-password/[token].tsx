import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ButtonLoading, Button } from "~/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

const formSchema = z
  .object({
    password: z.string().min(8, { message: "Min 8 Chars Required" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Does Not Match",
    path: ["confirmPassword"],
  });

const ResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const { mutateAsync: resetPassword } = api.users.resetPassword.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await resetPassword({
        token: router.query.token as string,
        password: values.password,
      });
      toast.success("Success! Your Password Has Been Reset", {
        duration: 4000,
      });
      const login = await signIn("credentials", {
        redirect: false,
        email: response.email,
        password: values.password,
      });
      if (login?.ok) {
        void router.push("/");
      } else {
        void router.push("/login");
      }
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(`${error.message}. Please Try Again`);
      } else {
        toast.error(`Something Went Wrong. Please Try Again`);
      }
      void router.push("/forgot-password");
    }
  };

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-[600px] space-y-8"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Password</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input placeholder="********" {...field} type="password" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Confirm Password</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input placeholder="********" {...field} type="password" />
              </FormControl>
            </FormItem>
          )}
        />
        {form.formState.isSubmitting ? (
          <ButtonLoading className="mono w-full" />
        ) : (
          <Button className="mono w-full" type="submit">
            Sign Up
          </Button>
        )}
      </form>
    </Form>
  );
};

const ResetPassword: NextPage = ({}) => {
  return (
    <>
      <Head>
        <title>Sloopy - Reset Password</title>
      </Head>
      <main className="section flex flex-1 flex-col text-center">
        <h1 className="section-label flex-none">Sign Up</h1>
        <ResetPasswordForm />
      </main>
    </>
  );
};

export default ResetPassword;
