import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormLink,
  FormMessage,
} from "~/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ButtonLoading, Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid Email" }),
});

const ForgetPasswordForm: React.FC = () => {
  const { mutateAsync: sendForgotPasswordEmail } =
    api.users.forgotPassword.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await sendForgotPasswordEmail({ email: values.email });
      toast.success("Success! Check Your Inbox", { duration: 4000 });
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(`${error.message}. Please Try Again`);
      } else {
        toast.error(`Something Went Wrong. Please Try Again`);
      }
    }
  };

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-[600px] space-y-8 text-right"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Email</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input placeholder="sloopy@acme.ca" {...field} type="email" />
              </FormControl>
            </FormItem>
          )}
        />
        {form.formState.isSubmitting ? (
          <ButtonLoading className="mono w-full" />
        ) : (
          <Button className="mono w-full" type="submit">
            Send Email
          </Button>
        )}
      </form>
    </Form>
  );
};

const ForgotPassword: NextPage = ({}) => {
  return (
    <>
      <Head>
        <title>Sloopy - Forgot Password</title>
      </Head>
      <main className="section flex flex-1 flex-col text-center">
        <h1 className="section-label flex-none">Forgot Password</h1>
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <ForgetPasswordForm />
          <FormLink href="/login">Got Your Memory Back? Login!</FormLink>
        </div>
      </main>
    </>
  );
};

export default ForgotPassword;
