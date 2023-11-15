import { useState, type HTMLAttributes } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { cn } from "~/utils/shadcn/utils";
import { useEditorContext } from "~/contexts/editor";
import { ScrollArea } from "../ui/scroll-area";
import SloopForm from "./sloopForm";

const EditLoopModal: React.FC<HTMLAttributes<HTMLButtonElement>> = ({
  ...props
}) => {
  const { className, ...rest } = props;
  const [open, setOpen] = useState(false);
  const editor = useEditorContext();

  return (
    <>
      <Dialog modal={false} open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            {...rest}
            variant="outline"
            className={cn("mono flex-1", className)}
          >
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="section">
          <h1 className="section-label">Edit Sloop</h1>
          <ScrollArea className="p-2 max-lg:h-[350px]">
            <SloopForm
              key={open ? 1 : 0}
              onFormSubmit={(values) => {
                editor.setGeneralInfo(values);
                setOpen(false);
              }}
              buttonLabel="Save"
              defaultValues={editor.generalInfo}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditLoopModal;
