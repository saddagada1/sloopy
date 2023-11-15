import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface UnsavedChangesModalProps {
  onExit: () => void;
  onSave: () => void;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  onExit,
  onSave,
}) => {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent className="font-sans">
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes!</AlertDialogTitle>
          <AlertDialogDescription>
            There may be unsaved changes. Would you like to save these changes
            before leaving?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onExit()}
            className="mono h-10 bg-destructive"
          >
            Exit
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onSave()} className="mono h-10">
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default UnsavedChangesModal;
