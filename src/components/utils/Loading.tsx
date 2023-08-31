import { WaveSpinner } from "react-spinners-kit";
import { secondaryColour } from "~/utils/constants";

const Loading: React.FC = () => {
  return (
    <div className="flex flex-1 items-center justify-center">
      <WaveSpinner
        size={4}
        color={secondaryColour}
        loading={true}
        sizeUnit="vmax"
      />
    </div>
  );
};

export default Loading;
