import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface SaveSloopModalProps {
  isPrivate: boolean;
  onSave: () => void;
  onPublish: () => void;
}

const SaveSloopModal: React.FC<SaveSloopModalProps> = ({
  isPrivate,
  onSave,
  onPublish,
}) => {
  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        <Button className="mono flex-1">Save</Button>
      </DialogTrigger>
      <DialogContent className="font-sans">
        <DialogHeader>
          <DialogTitle>Save Sloop</DialogTitle>
          <DialogDescription>
            How would you like to save your sloop.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => onSave()} className="mono">
            Save & Exit
          </Button>
          <Button onClick={() => onPublish()} className="mono">
            {isPrivate ? "Save & Publish" : "Save & Make Private"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default SaveSloopModal;
