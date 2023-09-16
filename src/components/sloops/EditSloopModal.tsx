import { useState, type Dispatch, type SetStateAction } from "react";
import Modal from "../ui/Modal";
import StyledTitle from "../ui/form/StyledTitle";
import Select from "../ui/Select";
import StyledLabel from "../ui/form/StyledLabel";
import {
  mode as modeClass,
  pitchClass,
  timeSignature,
} from "~/utils/constants";
import InputSlider from "../ui/InputSlider";
import { type SloopGeneralInfo } from "~/utils/types";

interface EditSloopModalProps {
  setVisible: Dispatch<SetStateAction<boolean>>;
  sloopInfo: SloopGeneralInfo;
  onEdit?: ({
    key,
    mode,
    timeSignature,
    tempo,
    name,
    description,
  }: {
    key: number;
    mode: number;
    timeSignature: number;
    tempo: number;
    name: string;
    description: string;
  }) => void;
}

const EditSloopModal: React.FC<EditSloopModalProps> = ({
  setVisible,
  sloopInfo,
  onEdit,
}) => {
  const [key, setKey] = useState(sloopInfo.key);
  const [mode, setMode] = useState(sloopInfo.mode);
  const [time, setTime] = useState(sloopInfo.timeSignature);
  const [tempo, setTempo] = useState(Math.round(sloopInfo.tempo));
  const [name, setName] = useState(sloopInfo.name);
  const [description, setDescription] = useState(sloopInfo.description);
  const [isSelecting, setIsSelecting] = useState(false);

  return (
    <>
      <Modal setVisible={setVisible} disabled={isSelecting}>
        <StyledTitle title="Edit Sloop" />
        <StyledLabel label="Key" />
        <Select
          data={Object.keys(pitchClass).map((key) => {
            return { label: pitchClass[parseInt(key)]!, value: key };
          })}
          value={pitchClass[key]!}
          onSelect={({ value }) => {
            setKey(parseInt(value));
            setIsSelecting(false);
          }}
          onSelectFocus={(isOpen) => setIsSelecting(isOpen)}
        />
        <StyledLabel label="Mode" />
        <Select
          data={Object.keys(modeClass).map((key) => {
            return { label: modeClass[parseInt(key)]!, value: key };
          })}
          value={modeClass[mode]!}
          onSelect={({ value }) => {
            setMode(parseInt(value));
            setIsSelecting(false);
          }}
          onSelectFocus={(isOpen) => setIsSelecting(isOpen)}
        />
        <StyledLabel label="Time" />
        <Select
          data={Object.keys(timeSignature).map((key) => {
            return { label: timeSignature[parseInt(key)]!, value: key };
          })}
          value={timeSignature[time]!}
          onSelect={({ value }) => {
            setTime(parseInt(value));
            setIsSelecting(false);
          }}
          onSelectFocus={(isOpen) => setIsSelecting(isOpen)}
        />
        <StyledLabel label="Tempo" />
        <div className="mb-4 flex items-center gap-4">
          <InputSlider
            maxValue={220}
            minValue={40}
            step={1}
            defaultValue={tempo}
            onSlideEnd={(value) => setTempo(value[0]!)}
          />
          <p className="w-12 rounded bg-gray-200 py-1 text-center text-sm font-semibold sm:text-base">
            {tempo}
          </p>
        </div>
        <StyledLabel label="Name" />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 bg-gray-200 p-2 text-sm font-medium sm:text-base"
          autoComplete="off"
          autoCorrect="off"
        />
        <StyledLabel label="Bio" />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-4 h-24 w-full resize-none rounded-md border border-gray-300 bg-gray-200 p-3 text-sm font-medium sm:text-base"
          autoComplete="off"
          autoCorrect="off"
          maxLength={500}
        />
        <p className="mb-6 w-full text-right text-xs text-gray-400 sm:text-sm">
          {`${description ? 500 - description.length : 500} Chars Left`}
        </p>
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
              onEdit &&
                onEdit({
                  key: key,
                  mode: mode,
                  timeSignature: time,
                  tempo: tempo,
                  name: name,
                  description: description,
                });
              setVisible(false);
            }}
            className="flex h-14 flex-1 items-center justify-center rounded-md bg-secondary text-primary"
          >
            Save
          </button>
        </div>
      </Modal>
    </>
  );
};
export default EditSloopModal;
