import { useState, useMemo, type HTMLAttributes } from "react";
import { mode, pitchClass } from "~/utils/constants";
import { type Chords } from "~/utils/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import chordsData from "public/chords.json";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { cn } from "~/utils/shadcn/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Combobox } from "../ui/combobox";
import { useEditorContext } from "~/contexts/editor";

const chords = chordsData as Chords;

interface CreateLoopModalProps extends HTMLAttributes<HTMLButtonElement> {
  small?: boolean;
}

const formSchema = z.object({
  key: z.number().min(0).max(11),
  mode: z.number().min(0).max(1),
  chord: z.string().min(1, { message: "Required" }),
});

const CreateLoopModal: React.FC<CreateLoopModalProps> = ({
  small,
  ...props
}) => {
  const { className, ...rest } = props;
  const [open, setOpen] = useState(false);
  const editor = useEditorContext();
  const [selectedKey, setSelectedKey] = useState<number | undefined>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const chordsForKey = useMemo(() => {
    if (selectedKey === undefined) return;
    return Object.keys(chords)
      .filter((key) => {
        const keyRegex = new RegExp(`^${pitchClass[selectedKey]}`);
        const keySharpRegex = new RegExp(`^${pitchClass[selectedKey]}#`);
        return keyRegex.test(key) && !keySharpRegex.test(key);
      })
      .map((chord) => {
        return {
          label: chord,
          value: chord,
        };
      });
  }, [selectedKey]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    editor.createLoop(values);
    setOpen(false);
  };

  return (
    <>
      <Dialog
        modal={false}
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          form.reset();
        }}
      >
        <DialogTrigger asChild>
          <Button
            {...rest}
            className={cn("mono", small && "w-full", className)}
          >
            {small ? "New" : "Create Loop"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <h1 className="section-label">Create Loop</h1>
          <Form {...form}>
            <form
              className="space-y-8"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={form.handleSubmit(onSubmit)}
            >
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
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                        setSelectedKey(parseInt(value));
                      }}
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
                name="chord"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>Chord</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Combobox
                        key={selectedKey}
                        data={chordsForKey}
                        placeholder="Select a chord"
                        onSelect={(item) => field.onChange(item.value)}
                        searchFirst
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="mono">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default CreateLoopModal;
