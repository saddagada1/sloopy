import { Form, Formik } from "formik";
import type { NextPage } from "next";
import Head from "next/head";
import * as yup from "yup";
import StyledLabel from "~/components/ui/form/StyledLabel";
import StyledField from "~/components/ui/form/StyledField";
import StyledTitle from "~/components/ui/form/StyledTitle";
import StyledLoadingButton from "~/components/ui/form/StyledLoadingButton";
import StyledLink from "~/components/ui/form/StyledLink";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { TRPCClientError } from "@trpc/client";

const ForgotPassword: NextPage = ({}) => {
  const { mutateAsync: sendForgotPasswordEmail } =
    api.users.forgotPassword.useMutation();

  return (
    <>
      <Head>
        <title>Sloopy - Forgot Password</title>
      </Head>
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-6">
        <Formik
          initialValues={{
            email: "",
          }}
          validationSchema={yup.object().shape({
            email: yup.string().email("Invalid Format").required("Required"),
          })}
          onSubmit={async (values: { email: string }) => {
            try {
              await sendForgotPasswordEmail({ email: values.email });
              toast.success("Success: Check Your Inbox", { duration: 4000 });
            } catch (error) {
              if (error instanceof TRPCClientError) {
                toast.error(`Error: ${error.message}. Please Try Again`);
              } else {
                toast.error(`Error: Something Went Wrong. Please Try Again`);
              }
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="mb-6 w-full">
              <StyledTitle title="forgot password" />
              <StyledLabel
                label="Email"
                error={errors.email}
                touched={touched.email}
              />
              <StyledField
                id="email"
                name="email"
                placeholder="sloopy@acme.ca"
                type="email"
                style={{ marginBottom: "24px" }}
              />
              <StyledLoadingButton
                label="send email"
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            </Form>
          )}
        </Formik>
        <StyledLink
          label="Got Your Memory Back? Login!"
          href="/login"
          style={{ textAlign: "center" }}
        />
      </div>
    </>
  );
};
export default ForgotPassword;
