import {
  Dialog,
  DialogContent,
  DialogFooter,
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
      <DialogContent>
        <h1 className="section-label">Save Sloop</h1>
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
