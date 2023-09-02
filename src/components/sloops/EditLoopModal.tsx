import {
  useState,
  type Dispatch,
  type SetStateAction,
  useMemo,
  useEffect,
} from "react";
import Modal from "../ui/Modal";
import StyledTitle from "../ui/form/StyledTitle";
import Select from "../ui/Select";
import StyledLabel from "../ui/form/StyledLabel";
import { mode, pitchClass } from "~/utils/constants";
import { type Loop, type Chords } from "~/utils/types";
import { PiTrash } from "react-icons/pi";
import { AnimatePresence } from "framer-motion";
import Popover from "../ui/Popover";
import { useEditorContext } from "~/contexts/Editor";

interface EditLoopModalProps {
  loop: Loop;
  chords: Chords;
  setLoop: Dispatch<SetStateAction<Loop | null>>;
  onEdit?: (loop: Loop) => void;
}

const EditLoopModal: React.FC<EditLoopModalProps> = ({
  loop,
  chords,
  setLoop,
  onEdit,
}) => {
  const editor = useEditorContext();
  const [selectedKey, setSelectedKey] = useState(loop.key);
  const [selectedMode, setSelectedMode] = useState(loop.mode);
  const [selectedChord, setSelectedChord] = useState(loop.chord);
  const [visible, setVisible] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const chordsForKey = useMemo(() => {
    selectedKey !== loop.key && setSelectedChord(pitchClass[selectedKey]!);
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
  }, [selectedKey, chords, loop.key]);

  useEffect(() => {
    if (!visible) {
      setLoop(null);
    }
  }, [visible, setLoop]);

  return (
    <>
      <Modal setVisible={setVisible} disabled={isSelecting}>
        <StyledTitle title="Edit Loop" />
        <StyledLabel label="Key" />
        <Select
          data={Object.keys(pitchClass).map((key) => {
            return { label: pitchClass[parseInt(key)]!, value: key };
          })}
          value={pitchClass[selectedKey]!}
          onSelect={({ value }) => {
            setSelectedKey(parseInt(value));
            setIsSelecting(false);
          }}
          onSelectFocus={(isOpen) => setIsSelecting(isOpen)}
        />
        <StyledLabel label="Mode" />
        <Select
          data={Object.keys(mode).map((key) => {
            return { label: mode[parseInt(key)]!, value: key };
          })}
          value={mode[selectedMode]!}
          onSelect={({ value }) => {
            setSelectedMode(parseInt(value));
            setIsSelecting(false);
          }}
          onSelectFocus={(isOpen) => setIsSelecting(isOpen)}
        />
        <StyledLabel label="Chord" />
        <Select
          data={chordsForKey}
          value={selectedChord}
          onSelect={({ value }) => {
            setSelectedChord(value);
            setIsSelecting(false);
          }}
          onSelectFocus={(isOpen) => setIsSelecting(isOpen)}
          searchable
        />
        <div className="relative mt-2 flex h-14 w-full gap-2 font-display text-base font-bold sm:text-lg">
          <button
            onClick={() => setShowDelete(true)}
            className="flex aspect-square items-center justify-center rounded-md border border-red-500 bg-red-100 text-2xl text-red-500 sm:text-3xl"
          >
            <PiTrash />
          </button>
          <AnimatePresence>
            {showDelete && (
              <Popover
                setVisible={setShowDelete}
                className="flex flex-col p-2 text-base text-secondary shadow-2xl sm:text-lg"
                animate="-5%"
                y="top"
              >
                <StyledTitle title="Delete Loop" />
                <p className="mb-6 font-sans text-sm font-medium sm:text-base">
                  Are you sure you want to delete this loop? This can not be
                  undone.
                </p>
                <div className="flex h-14 gap-2">
                  <button
                    className="flex-1 rounded-md border border-gray-300 bg-gray-200"
                    onClick={() => setShowDelete(false)}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowDelete(false);
                      editor.deleteLoop(loop);
                      setVisible(false);
                    }}
                    className="flex-1 rounded-md border border-red-500 bg-red-100 text-red-500"
                  >
                    Confirm
                  </button>
                </div>
              </Popover>
            )}
          </AnimatePresence>
          <button
            onClick={() => !isSelecting && setVisible(false)}
            className="flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (isSelecting) return;
              onEdit &&
                onEdit({
                  ...loop,
                  key: selectedKey,
                  mode: selectedMode,
                  chord: selectedChord,
                });
              setVisible(false);
            }}
            className="flex flex-1 items-center justify-center rounded-md bg-secondary text-primary"
          >
            Save
          </button>
        </div>
      </Modal>
    </>
  );
};
export default EditLoopModal;
