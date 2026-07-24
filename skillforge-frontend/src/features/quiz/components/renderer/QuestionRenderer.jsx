import MCQQuestion from "../questions/mcq/MCQQuestion";
import CodingQuestion from "../questions/coding/CodingQuestion";
import InterviewQuestion from "../questions/interview/InterviewQuestion";
import ScenarioQuestion from "../questions/scenario/ScenarioQuestion";

export default function QuestionRenderer(props) {
  const { question } = props;

  switch (question.questionType) {
    case "MCQ":
      return <MCQQuestion {...props} />;

    case "CODING":
      return <CodingQuestion {...props} />;

    case "INTERVIEW":
      return <InterviewQuestion {...props} />;

    case "SCENARIO":
      return <ScenarioQuestion {...props} />;

    default:
      return (
        <div className="rounded-lg border border-destructive p-6 text-center">
          Unsupported Question Type
        </div>
      );
  }
}
