import { Form, Formik, type FormikHelpers } from "formik";
import type { NextPage } from "next";
import Head from "next/head";
import * as yup from "yup";
import StyledLabel from "~/components/ui/form/StyledLabel";
import StyledField from "~/components/ui/form/StyledField";
import StyledTitle from "~/components/ui/form/StyledTitle";
import StyledLoadingButton from "~/components/ui/form/StyledLoadingButton";
import StyledLink from "~/components/ui/form/StyledLink";
import OAuthButtons from "~/components/ui/form/OAuthButtons";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LoginValues {
  email: string;
  password: string;
}

const Login: NextPage = ({}) => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Slooper - Login</title>
      </Head>
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-6">
        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          validationSchema={yup.object().shape({
            email: yup.string().email("Invalid Format").required("Required"),
          })}
          onSubmit={async (
            values: LoginValues,
            { setErrors }: FormikHelpers<LoginValues>
          ) => {
            const response = await signIn("credentials", {
              redirect: false,
              email: values.email,
              password: values.password,
            });
            if (response?.ok) {
              router.push("/");
            } else {
              setErrors({ email: response!.error! });
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="w-full">
              <StyledTitle title="login" />
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
                style={{ marginBottom: "6px" }}
              />
              <StyledLink
                label="Forgotten Password?"
                href="/register"
                style={{ textAlign: "right", marginBottom: "24px" }}
              />
              <StyledLoadingButton
                label="login"
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            </Form>
          )}
        </Formik>
        <OAuthButtons />
        <StyledLink
          label="Don't have an account? Register!"
          href="/register"
          style={{ textAlign: "center" }}
        />
      </div>
    </>
  );
};
export default Login;
