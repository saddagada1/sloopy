import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { pitchClass, mode, timeSignature, tuning } from "~/utils/constants";
import { ButtonLoading, Button } from "../ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { type HTMLAttributes } from "react";

const formSchema = z.object({
  key: z.number().min(0).max(11),
  mode: z.number().min(0).max(1),
  timeSignature: z.number().min(3).max(7),
  tempo: z.number().min(40).max(220),
  tuning: z.number().min(0).max(9),
  name: z.string().min(1, { message: "Required" }),
  description: z.string().max(500),
});

interface SloopFormProps extends HTMLAttributes<HTMLDivElement> {
  onFormSubmit: (values: z.infer<typeof formSchema>) => void | Promise<void>;
  buttonLabel: string;
  defaultValues?: z.infer<typeof formSchema>;
}

const SloopForm: React.FC<SloopFormProps> = ({
  onFormSubmit,
  buttonLabel,
  defaultValues,
  ...props
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  return (
    <Form {...form}>
      <form
        className="flex flex-col items-end"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onFormSubmit)}
      >
        <div {...props}>
          <div className="h-full flex-1 space-y-8">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>Key</FormLabel>
                    <FormMessage />
                  </div>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={
                      !!defaultValues ? field.value.toString() : undefined
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a key" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(pitchClass).map((key, index) => (
                        <SelectItem key={index} value={key}>
                          {pitchClass[parseInt(key)]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>Mode</FormLabel>
                    <FormMessage />
                  </div>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={
                      !!defaultValues ? field.value.toString() : undefined
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(mode).map((key, index) => (
                        <SelectItem key={index} value={key}>
                          {mode[parseInt(key)]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeSignature"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>Time Signature</FormLabel>
                    <FormMessage />
                  </div>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={
                      !!defaultValues ? field.value.toString() : undefined
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(timeSignature).map((key, index) => (
                        <SelectItem key={index} value={key}>
                          {timeSignature[parseInt(key)]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tuning"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>Tuning</FormLabel>
                    <FormMessage />
                  </div>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={
                      !!defaultValues ? field.value.toString() : undefined
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tuning" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(tuning).map((key, index) => (
                        <SelectItem key={index} value={key}>
                          {tuning[parseInt(key)]?.name}&nbsp;[
                          {tuning[parseInt(key)]?.notes.join(", ")}]
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1 space-y-8">
            <FormField
              control={form.control}
              name="tempo"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>Tempo</FormLabel>
                    <FormMessage />
                  </div>
                  <p className="p w-full text-right">
                    {field.value ? Math.round(field.value) : 40}
                  </p>
                  <FormControl>
                    <Slider
                      orientation="horizontal"
                      defaultValue={!!defaultValues ? [field.value] : undefined}
                      onValueChange={(value) => field.onChange(value[0])}
                      min={40}
                      max={220}
                      step={1}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>Name</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-end justify-between">
                    <FormLabel>Description</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="w-full text-right text-xs">
                    {`${
                      field.value?.length ? 500 - field.value.length : 500
                    } chars left`}
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        </div>
        {form.formState.isSubmitting ? (
          <ButtonLoading className="mono max-lg:w-full" />
        ) : (
          <Button type="submit" className="mono max-lg:w-full">
            {buttonLabel}
          </Button>
        )}
      </form>
    </Form>
  );
};
export default SloopForm;
