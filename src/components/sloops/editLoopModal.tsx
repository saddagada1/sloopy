import { useState, useMemo, type HTMLAttributes } from "react";
import { mode, pitchClass } from "~/utils/constants";
import { type Loop, type Chords } from "~/utils/types";
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
import { Settings2 } from "lucide-react";

const chords = chordsData as Chords;

interface EditLoopModalProps extends HTMLAttributes<HTMLButtonElement> {
  loop: Loop;
}

const formSchema = z.object({
  key: z.number().min(0).max(11),
  mode: z.number().min(0).max(1),
  chord: z.string().min(1, { message: "Required" }),
});

const EditLoopModal: React.FC<EditLoopModalProps> = ({ loop, ...props }) => {
  const { className, ...rest } = props;
  const [open, setOpen] = useState(false);
  const editor = useEditorContext();
  const [selectedKey, setSelectedKey] = useState(loop.key);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: loop.key,
      mode: loop.mode,
      chord: loop.chord,
    },
  });

  const chordsForKey = useMemo(() => {
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
    editor.updateLoop({ ...loop, ...values });
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
            variant="link"
            className={cn("h-fit p-1", className)}
          >
            <Settings2 className="h-5 w-5" strokeWidth={1} />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <h1 className="section-label">Edit Loop</h1>
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
                      defaultValue={field.value.toString()}
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
                      defaultValue={field.value.toString()}
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
                        defaultValue={
                          selectedKey !== loop.key
                            ? chordsForKey[selectedKey]
                            : { label: loop.chord, value: loop.chord }
                        }
                        onSelect={(item) => field.onChange(item.value)}
                        searchFirst
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="mono">
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default EditLoopModal;
