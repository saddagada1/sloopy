import { Form, Formik, type FormikHelpers } from "formik";
import type { NextPage } from "next";
import Head from "next/head";
import * as yup from "yup";
import StyledField from "~/components/ui/form/StyledField";
import StyledTitle from "~/components/ui/form/StyledTitle";
import StyledLabel from "~/components/ui/form/StyledLabel";
import StyledLoadingButton from "~/components/ui/form/StyledLoadingButton";
import StyledLink from "~/components/ui/form/StyledLink";
import OAuthButtons from "~/components/ui/form/OAuthButtons";
import { api } from "~/utils/api";
import { toErrorMap } from "~/utils/toErrorMap";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { TRPCClientError } from "@trpc/client";

interface RegisterValues {
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: NextPage = ({}) => {
  const { mutateAsync } = api.credentials.register.useMutation();
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Slooper - Register</title>
      </Head>
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-6">
        <Formik
          initialValues={{
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={yup.object().shape({
            email: yup.string().email("Invalid Format").required("Required"),
            password: yup
              .string()
              .min(8, "Min 8 Chars Required")
              .required("Required"),
            confirmPassword: yup
              .string()
              .oneOf([yup.ref("password"), undefined], "Does Not Match"),
          })}
          onSubmit={async (
            values: RegisterValues,
            { setErrors }: FormikHelpers<RegisterValues>
          ) => {
            try {
              const response = await mutateAsync({
                email: values.email,
                password: values.password,
              });
              if (!response.user) {
                setErrors(toErrorMap(response.errors));
                return;
              }
              await signIn("credentials", {
                redirect: false,
                email: values.email,
                password: values.password,
              });
              router.replace("/");
            } catch (error) {
              if (error instanceof TRPCClientError) {
                toast.error(`Error: ${error.message}`);
              }
              return;
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="w-full">
              <StyledTitle title="register" />
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
              />
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
                label="register"
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            </Form>
          )}
        </Formik>
        <OAuthButtons />
        <StyledLink
          label="Already have an account? Login!"
          href="/login"
          style={{ textAlign: "center" }}
        />
      </div>
    </>
  );
};
export default Register;
