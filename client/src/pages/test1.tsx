import usePredictionObserver from "Utility/hooks/predictionObserver/predictionObserver";

const Test1: React.FC = () => {
    const [expectInteraction, listeners] = usePredictionObserver();

    const background = expectInteraction ? "red" : "";

    return (
        <div {...listeners} style={{ backgroundColor: background }}>
            Test1
        </div>
    );
};
export default Test1;
