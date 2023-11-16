import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { type HTMLAttributes } from "react";
import { useRouter } from "next/router";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface SearchInputProps extends HTMLAttributes<HTMLInputElement> {
  renderButton?: boolean;
}

const formSchema = z.object({
  query: z.string(),
});

const SearchInput: React.FC<SearchInputProps> = ({
  renderButton,
  ...props
}) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    void router.push(`/search?q=${values.query}`);
  };

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-2"
      >
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input
                  // className="h-full"
                  {...props}
                  placeholder="Search for sloops, users, tracks, artists..."
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {renderButton && (
          <Button className="font-mono uppercase tracking-tight">Search</Button>
        )}
      </form>
    </Form>
  );
};
export default SearchInput;
