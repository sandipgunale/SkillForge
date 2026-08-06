import MCQQuestion from "../../questions/mcq/MCQQuestion";
import CodingQuestion from "../../questions/coding/CodingQuestion";
import InterviewQuestion from "../../questions/interview/InterviewQuestion";
import ScenarioQuestion from "../../questions/scenario/ScenarioQuestion";

const COMPONENTS = {
  MCQ: MCQQuestion,
  CODING: CodingQuestion,
  INTERVIEW: InterviewQuestion,
  SCENARIO: ScenarioQuestion,
};

export default function QuestionRenderer(props) {
  const Component = COMPONENTS[props.question?.type];

  if (!Component) {
    return (
      <div className="rounded-lg border border-destructive p-6 text-center">
        Unsupported Question Type
      </div>
    );
  }

  return <Component {...props} />;
}
