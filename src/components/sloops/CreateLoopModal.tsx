import { useState, type Dispatch, type SetStateAction, useMemo } from "react";
import Modal from "../ui/Modal";
import StyledTitle from "../ui/form/StyledTitle";
import Select from "../ui/Select";
import StyledLabel from "../ui/form/StyledLabel";
import { mode, pitchClass } from "~/utils/constants";
import { type Chords } from "~/utils/types";

interface CreateLoopModalProps {
  chords: Chords;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onCreate?: ({
    key,
    mode,
    chord,
  }: {
    key: number;
    mode: number;
    chord: string;
  }) => void;
}

const CreateLoopModal: React.FC<CreateLoopModalProps> = ({
  chords,
  setVisible,
  onCreate,
}) => {
  const [selectedKey, setSelectedKey] = useState(0);
  const [selectedMode, setSelectedMode] = useState(1);
  const [selectedChord, setSelectedChord] = useState("C");
  const [isSelecting, setIsSelecting] = useState(false);

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
  }, [selectedKey, chords]);

  return (
    <>
      <Modal setVisible={setVisible} disabled={isSelecting}>
        <StyledTitle title="Create Loop" />
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
        <div className="mt-2 flex w-full gap-2 font-display text-base font-bold sm:text-lg">
          <button
            onClick={() => !isSelecting && setVisible(false)}
            className="flex h-14 flex-1 items-center justify-center rounded-md border border-gray-300 bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (isSelecting) return;
              onCreate &&
                onCreate({
                  key: selectedKey,
                  mode: selectedMode,
                  chord: selectedChord,
                });
              setVisible(false);
            }}
            className="flex h-14 flex-1 items-center justify-center rounded-md bg-secondary text-primary"
          >
            Create
          </button>
        </div>
      </Modal>
    </>
  );
};
export default CreateLoopModal;
