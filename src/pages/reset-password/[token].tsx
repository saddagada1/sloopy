import { Form, Formik } from "formik";
import type { NextPage } from "next";
import Head from "next/head";
import * as yup from "yup";
import StyledLabel from "~/components/ui/form/StyledLabel";
import StyledField from "~/components/ui/form/StyledField";
import StyledTitle from "~/components/ui/form/StyledTitle";
import StyledLoadingButton from "~/components/ui/form/StyledLoadingButton";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

interface ResetPasswordValues {
  password: string;
  confirmPassword: string;
}

const ResetPassword: NextPage = ({}) => {
  const router = useRouter();
  const { mutateAsync: resetPassword } = api.users.resetPassword.useMutation();

  return (
    <>
      <Head>
        <title>Sloopy - Reset Password</title>
      </Head>
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-6">
        <Formik
          initialValues={{
            password: "",
            confirmPassword: "",
          }}
          validationSchema={yup.object().shape({
            password: yup
              .string()
              .min(8, "Min 8 Chars Required")
              .required("Required"),
            confirmPassword: yup
              .string()
              .oneOf([yup.ref("password"), undefined], "Does Not Match")
              .required("Required"),
          })}
          onSubmit={async (values: ResetPasswordValues) => {
            try {
              const response = await resetPassword({
                token: router.query.token as string,
                password: values.password,
              });
              toast.success("Success: Your Password Has Been Reset", {
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
                toast.error(`Error: ${error.message}. Please Try Again`);
              } else {
                toast.error(`Error: Something Went Wrong. Please Try Again`);
              }
              void router.push("/forgot-password");
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="w-full">
              <StyledTitle title="reset password" />
              <StyledLabel
                label="Password"
                error={errors.password}
                touched={touched.password}
              />
              <StyledField
                id="password"
                name="password"
                placeholder="********"
                type="password"
              />
              <StyledLabel
                label="Confirm Password"
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
              />
              <StyledField
                id="confirmPassword"
                name="confirmPassword"
                placeholder="********"
                type="password"
                style={{ marginBottom: "24px" }}
              />
              <StyledLoadingButton
                label="reset"
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

export default ResetPassword;
