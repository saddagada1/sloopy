import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
} from "../ui/alert-dialog";

interface UnsavedChangesModalProps {
  onExit: () => void;
  onSave: () => void;
  message?: string;
  exitLabel?: string;
  saveLabel?: string;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  onExit,
  onSave,
  message,
  exitLabel,
  saveLabel,
}) => {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <h1 className="section-label mb-0">Unsaved Changes</h1>
        <p className="mono text-xxs text-muted-foreground lg:text-xs">
          {message ??
            `There may be unsaved changes. Would you like to save these changes
          before leaving?`}
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onExit()}
            className="mono h-10 bg-destructive"
          >
            {exitLabel ?? "Exit"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onSave()} className="mono h-10">
            {saveLabel ?? "Save"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default UnsavedChangesModal;
