import { memo, useRef } from "react";

import OptionItem from "./OptionItem";
import { useMountAnimation } from "@/lib/motion-gsap";

function OptionList({ options, selected, onSelect }) {
  const listRef = useRef(null);

  useMountAnimation(listRef, [], { y: 18, duration: 0.4, stagger: 0.05 });

  return (
    <div ref={listRef} className="space-y-3">
      {options.map((option, index) => (
        <div key={option}>
          <OptionItem
            label={option}
            index={index}
            selected={selected === option}
            onClick={onSelect}
          />
        </div>
      ))}
    </div>
  );
}

export default memo(OptionList);